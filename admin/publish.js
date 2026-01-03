const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
    contentDir: path.join(__dirname, 'content'),
    assetsDir: path.join(__dirname, 'assets'),
    privateKeyPath: path.join(__dirname, 'keys', 'private.pem'),
    apiUrl: 'http://localhost:8080/api/gatekeeper.php'
};

// Command line arguments
const ARGS = {
    forceHash: process.argv.includes('--force-hash'),  // Use hash comparison instead of timestamp
    forceAll: process.argv.includes('--force-all'),    // Upload all files regardless
    dryRun: process.argv.includes('--dry-run')         // Show what would happen without doing it
};

// Crypto Utilities
function signData(data, privateKey) {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(privateKey, 'base64');
}

function getFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
}

// ============================================
// HTTP UTILITIES
// ============================================

function httpRequest(url, options, payload = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const lib = urlObj.protocol === 'https:' ? https : http;

        const req = lib.request(urlObj, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (res.statusCode === 200) {
                        resolve(json);
                    } else {
                        reject(new Error(json.message || `HTTP ${res.statusCode}`));
                    }
                } catch (e) {
                    reject(new Error(`Invalid JSON: ${body}`));
                }
            });
        });

        req.on('error', reject);

        if (payload) {
            req.write(payload);
        }
        req.end();
    });
}

// ============================================
// API FUNCTIONS
// ============================================

async function fetchRemoteMetadata(privateKey) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signData("metadata|" + timestamp, privateKey);

    const url = `${CONFIG.apiUrl}?action=metadata&timestamp=${timestamp}&signature=${encodeURIComponent(signature)}`;

    console.log('[FETCH] Getting remote file metadata...');

    try {
        const response = await httpRequest(url, { method: 'GET' });
        return response.data;
    } catch (e) {
        console.error(`[WARN] Could not fetch metadata: ${e.message}`);
        // Return empty metadata if server has no files yet
        return { content: {}, assets: {}, server_time: Math.floor(Date.now() / 1000) };
    }
}

async function uploadFile(relativePath, fileType, privateKey, isBinary = false) {
    const baseDir = fileType === 'assets' ? CONFIG.assetsDir : CONFIG.contentDir;
    const fullPath = path.join(baseDir, relativePath);

    let content;
    let encoding = null;

    if (isBinary) {
        content = fs.readFileSync(fullPath).toString('base64');
        encoding = 'base64';
    } else {
        content = fs.readFileSync(fullPath, 'utf8');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const dataToSign = relativePath + "|" + timestamp + "|" + content;
    const signature = signData(dataToSign, privateKey);

    const payload = JSON.stringify({
        action: 'upload',
        type: fileType,
        path: relativePath,
        content: content,
        timestamp: timestamp,
        signature: signature,
        encoding: encoding
    });

    return httpRequest(CONFIG.apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    }, payload);
}

async function deleteFile(relativePath, fileType, privateKey) {
    const timestamp = Math.floor(Date.now() / 1000);
    const dataToSign = "delete|" + relativePath + "|" + timestamp;
    const signature = signData(dataToSign, privateKey);

    const payload = JSON.stringify({
        action: 'delete',
        type: fileType,
        path: relativePath,
        timestamp: timestamp,
        signature: signature
    });

    return httpRequest(CONFIG.apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    }, payload);
}

function getAllLocalFiles(dirPath, baseDir = dirPath) {
    const results = {};

    if (!fs.existsSync(dirPath)) {
        return results;
    }

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        if (item.startsWith('.')) continue; // Skip hidden files

        const fullPath = path.join(dirPath, item);
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            Object.assign(results, getAllLocalFiles(fullPath, baseDir));
        } else {
            const fileInfo = {
                path: relativePath,
                size: stat.size,
                modified: Math.floor(stat.mtimeMs / 1000)
            };
            // Only compute hash if --force-hash flag is used (expensive operation)
            if (ARGS.forceHash) {
                fileInfo.hash = getFileHash(fullPath);
            }
            results[relativePath] = fileInfo;
        }
    }

    return results;
}

function isBinaryFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.woff', '.woff2', '.ttf', '.eot'];
    return binaryExtensions.includes(ext);
}

function computeDiff(localFiles, remoteFiles) {
    const toUpload = [];
    const toDelete = [];

    // Find files to upload (new or modified)
    for (const [filePath, localInfo] of Object.entries(localFiles)) {
        const remoteInfo = remoteFiles[filePath];

        if (ARGS.forceAll) {
            // Force upload everything
            toUpload.push({ path: filePath, reason: 'forced' });
        } else if (!remoteInfo) {
            // New file (doesn't exist on remote)
            toUpload.push({ path: filePath, reason: 'new' });
        } else if (ARGS.forceHash && localInfo.hash && localInfo.hash !== remoteInfo.hash) {
            // Hash comparison mode: upload if hash differs
            toUpload.push({ path: filePath, reason: 'hash-changed' });
        } else if (!ARGS.forceHash && localInfo.modified > remoteInfo.modified) {
            // Timestamp comparison (default): upload if local is newer
            toUpload.push({ path: filePath, reason: 'modified' });
        }
        // Otherwise, file is up to date - skip
    }

    // Find files to delete (exist on remote but not locally)
    for (const filePath of Object.keys(remoteFiles)) {
        if (!localFiles[filePath]) {
            toDelete.push({ path: filePath, reason: 'removed' });
        }
    }

    return { toUpload, toDelete };
}

async function main() {
    console.log('========================================');
    console.log('  SYSTEM J // SMART PUBLISHER');
    console.log('========================================');
    if (ARGS.forceHash) console.log('  Mode: Hash comparison (--force-hash)');
    else if (ARGS.forceAll) console.log('  Mode: Force all (--force-all)');
    else console.log('  Mode: Timestamp comparison (default)');
    if (ARGS.dryRun) console.log('  *** DRY RUN - No changes will be made ***');
    console.log('');

    // Check private key
    if (!fs.existsSync(CONFIG.privateKeyPath)) {
        console.error('[FATAL] Private key not found at', CONFIG.privateKeyPath);
        console.error('Generate keys using: openssl genrsa -out admin/keys/private.pem 2048');
        process.exit(1);
    }

    const privateKey = fs.readFileSync(CONFIG.privateKeyPath, 'utf8');

    // Ensure local directories exist
    if (!fs.existsSync(CONFIG.contentDir)) {
        fs.mkdirSync(CONFIG.contentDir, { recursive: true });
    }
    if (!fs.existsSync(CONFIG.assetsDir)) {
        fs.mkdirSync(CONFIG.assetsDir, { recursive: true });
    }

    // Fetch remote metadata
    const remoteMetadata = await fetchRemoteMetadata(privateKey);

    // Get local files
    const localContent = getAllLocalFiles(CONFIG.contentDir);
    const localAssets = getAllLocalFiles(CONFIG.assetsDir);

    console.log(`[LOCAL]  Content: ${Object.keys(localContent).length} files`);
    console.log(`[LOCAL]  Assets:  ${Object.keys(localAssets).length} files`);
    console.log(`[REMOTE] Content: ${Object.keys(remoteMetadata.content || {}).length} files`);
    console.log(`[REMOTE] Assets:  ${Object.keys(remoteMetadata.assets || {}).length} files\n`);

    // Compute differences
    const contentDiff = computeDiff(localContent, remoteMetadata.content || {});
    const assetsDiff = computeDiff(localAssets, remoteMetadata.assets || {});

    const totalChanges =
        contentDiff.toUpload.length + contentDiff.toDelete.length +
        assetsDiff.toUpload.length + assetsDiff.toDelete.length;

    if (totalChanges === 0) {
        console.log('[SYNC] Everything is up to date! No changes needed.\n');
        return;
    }

    console.log('--- CHANGES DETECTED ---');
    if (contentDiff.toUpload.length) {
        console.log(`Content to upload: ${contentDiff.toUpload.map(f => `${f.path} (${f.reason})`).join(', ')}`);
    }
    if (contentDiff.toDelete.length) {
        console.log(`Content to delete: ${contentDiff.toDelete.map(f => f.path).join(', ')}`);
    }
    if (assetsDiff.toUpload.length) {
        console.log(`Assets to upload: ${assetsDiff.toUpload.map(f => `${f.path} (${f.reason})`).join(', ')}`);
    }
    if (assetsDiff.toDelete.length) {
        console.log(`Assets to delete: ${assetsDiff.toDelete.map(f => f.path).join(', ')}`);
    }
    console.log('------------------------\n');

    if (ARGS.dryRun) {
        console.log('[DRY RUN] No changes made. Remove --dry-run to apply changes.\n');
        return;
    }

    // Process content uploads
    for (const file of contentDiff.toUpload) {
        try {
            const isBinary = isBinaryFile(file.path);
            await uploadFile(file.path, 'content', privateKey, isBinary);
            console.log(`  ✓ [CONTENT] ${file.path}`);
        } catch (e) {
            console.error(`  ✗ [CONTENT] ${file.path}: ${e.message}`);
        }
    }

    // Process content deletions
    for (const file of contentDiff.toDelete) {
        try {
            await deleteFile(file.path, 'content', privateKey);
            console.log(`  ✓ [DELETE]  ${file.path}`);
        } catch (e) {
            console.error(`  ✗ [DELETE]  ${file.path}: ${e.message}`);
        }
    }

    // Process asset uploads
    for (const file of assetsDiff.toUpload) {
        try {
            const isBinary = isBinaryFile(file.path);
            await uploadFile(file.path, 'assets', privateKey, isBinary);
            console.log(`  ✓ [ASSET]   ${file.path}`);
        } catch (e) {
            console.error(`  ✗ [ASSET]   ${file.path}: ${e.message}`);
        }
    }

    // Process asset deletions
    for (const file of assetsDiff.toDelete) {
        try {
            await deleteFile(file.path, 'assets', privateKey);
            console.log(`  ✓ [DELETE]  ${file.path}`);
        } catch (e) {
            console.error(`  ✗ [DELETE]  ${file.path}: ${e.message}`);
        }
    }

    console.log('\n[DONE] Sync complete!\n');
}

main().catch(console.error);