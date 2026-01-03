<?php
/**
 * SYSTEM J // AUTH
 * Shared authentication functions for API endpoints.
 */

$KEY_FILE = __DIR__ . '/../keys/public.pem';
$ALLOWED_TIME_DRIFT = 300; // 5 minutes

function send_response($code, $message, $data = null) {
    http_response_code($code);
    echo json_encode(['status' => $code === 200 ? 'success' : 'error', 'message' => $message, 'data' => $data]);
    exit;
}

function verify_signature($data, $signatureBase64) {
    global $KEY_FILE;
    
    if (!file_exists($KEY_FILE)) {
        send_response(500, 'Server misconfiguration: Public key missing');
    }

    $publicKey = file_get_contents($KEY_FILE);
    if (!$publicKey) {
        send_response(500, 'Failed to read public key');
    }

    $binarySignature = base64_decode($signatureBase64);
    $verified = openssl_verify($data, $binarySignature, $publicKey, OPENSSL_ALGO_SHA256);

    if ($verified === 1) {
        return true;
    } elseif ($verified === 0) {
        send_response(403, 'Invalid Signature - Access Denied');
    } else {
        send_response(500, 'OpenSSL Error: ' . openssl_error_string());
    }
    return false;
}

function check_timestamp($timestamp) {
    global $ALLOWED_TIME_DRIFT;
    if (abs(time() - $timestamp) > $ALLOWED_TIME_DRIFT) {
        send_response(403, 'Request expired (Timestamp drift too large)');
    }
}

function get_all_files($dir, $baseDir, &$results = []) {
    if (!is_dir($dir)) return $results;
    
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        $fullPath = $dir . '/' . $file;
        $relativePath = ltrim(str_replace($baseDir, '', $fullPath), '/');
        
        if (is_dir($fullPath)) {
            get_all_files($fullPath, $baseDir, $results);
        } else {
            $results[$relativePath] = [
                'path' => $relativePath,
                'size' => filesize($fullPath),
                'modified' => filemtime($fullPath),
                'hash' => md5_file($fullPath)
            ];
        }
    }
    return $results;
}
?>
