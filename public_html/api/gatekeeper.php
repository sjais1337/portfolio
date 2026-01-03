<?php
/**
 * SYSTEM J // GATEKEEPER
 * The secure entry point for publishing content and assets.
 * 
 * Supported Actions:
 * - upload: Upload/update a file
 * - delete: Delete a file
 * - metadata: Get list of all files with timestamps and hashes
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/auth.php';

// --- CONFIGURATION ---
$CONTENT_DIR = __DIR__ . '/../content/';
$ASSETS_DIR = __DIR__ . '/../assets/uploads/';

// Ensure directories exist
if (!is_dir($CONTENT_DIR)) mkdir($CONTENT_DIR, 0755, true);
if (!is_dir($ASSETS_DIR)) mkdir($ASSETS_DIR, 0755, true);

// --- HANDLE METADATA REQUEST (GET) ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'metadata') {
    // Metadata request requires signed timestamp for security
    $timestamp = $_GET['timestamp'] ?? 0;
    $signature = $_GET['signature'] ?? '';
    
    if (empty($timestamp) || empty($signature)) {
        send_response(400, 'Missing timestamp or signature');
    }
    
    check_timestamp($timestamp);
    verify_signature("metadata|" . $timestamp, $signature);
    
    $metadata = [
        'content' => get_all_files($CONTENT_DIR, $CONTENT_DIR),
        'assets' => get_all_files($ASSETS_DIR, $ASSETS_DIR),
        'server_time' => time()
    ];
    
    send_response(200, 'Metadata retrieved', $metadata);
}

// --- HANDLE POST REQUESTS ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_response(405, 'Method Not Allowed');
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    send_response(400, 'Invalid JSON payload');
}

$action = $input['action'] ?? 'upload';
$fileType = $input['type'] ?? 'content'; // 'content' or 'assets'
$filePath = $input['path'] ?? '';
$content = $input['content'] ?? '';
$signatureBase64 = $input['signature'] ?? '';
$timestamp = $input['timestamp'] ?? 0;

if (empty($filePath) || empty($signatureBase64) || empty($timestamp)) {
    send_response(400, 'Missing required fields (path, signature, timestamp)');
}

// Determine base directory
$baseDir = ($fileType === 'assets') ? $ASSETS_DIR : $CONTENT_DIR;

// Prevent Path Traversal
if (strpos($filePath, '..') !== false) {
    send_response(400, 'Invalid file path');
}

check_timestamp($timestamp);

// --- ACTION: DELETE ---
if ($action === 'delete') {
    $dataToVerify = "delete|" . $filePath . "|" . $timestamp;
    verify_signature($dataToVerify, $signatureBase64);
    
    $fullPath = $baseDir . $filePath;
    
    if (!file_exists($fullPath)) {
        send_response(404, 'File not found');
    }
    
    if (unlink($fullPath)) {
        // Clean up empty directories
        $dir = dirname($fullPath);
        while ($dir !== $baseDir && is_dir($dir) && count(scandir($dir)) === 2) {
            rmdir($dir);
            $dir = dirname($dir);
        }
        send_response(200, 'File deleted successfully', ['path' => $filePath]);
    } else {
        send_response(500, 'Failed to delete file');
    }
}

// --- ACTION: UPLOAD (default) ---
$dataToVerify = $filePath . "|" . $timestamp . "|" . $content;
verify_signature($dataToVerify, $signatureBase64);

$fullPath = $baseDir . $filePath;
$directory = dirname($fullPath);

// Create directory if it doesn't exist
if (!is_dir($directory)) {
    if (!mkdir($directory, 0755, true)) {
        send_response(500, 'Failed to create directory');
    }
}

// Handle base64 encoded binary files (for assets)
if ($fileType === 'assets' && isset($input['encoding']) && $input['encoding'] === 'base64') {
    $content = base64_decode($content);
}

// Write the file
if (file_put_contents($fullPath, $content) !== false) {
    // Update modification time
    touch($fullPath, $timestamp);
    send_response(200, 'File published successfully', [
        'path' => $filePath,
        'type' => $fileType,
        'hash' => md5_file($fullPath)
    ]);
} else {
    send_response(500, 'Failed to write file to disk');
}
?>
