<?php
require_once __DIR__ . '/config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

function getDBConnection() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            ensureAdminSchema($pdo);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database connection error: " . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}

function ensureAdminSchema($pdo) {
    static $checked = false;
    if ($checked) return;
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `admin_users` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `username` VARCHAR(100) NOT NULL UNIQUE,
            `email` VARCHAR(255) NOT NULL DEFAULT 'admin@nitwebs.com',
            `password_hash` VARCHAR(255) NOT NULL,
            `otp_code` VARCHAR(10) DEFAULT NULL,
            `otp_expires_at` DATETIME DEFAULT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $stmt = $pdo->query("SHOW COLUMNS FROM `admin_users`");
        $columns = $stmt ? $stmt->fetchAll(PDO::FETCH_COLUMN) : [];
        if (!in_array('email', $columns)) {
            $pdo->exec("ALTER TABLE `admin_users` ADD COLUMN `email` VARCHAR(255) NOT NULL DEFAULT 'admin@nitwebs.com'");
        }
        if (!in_array('otp_code', $columns)) {
            $pdo->exec("ALTER TABLE `admin_users` ADD COLUMN `otp_code` VARCHAR(10) DEFAULT NULL");
        }
        if (!in_array('otp_expires_at', $columns)) {
            $pdo->exec("ALTER TABLE `admin_users` ADD COLUMN `otp_expires_at` DATETIME DEFAULT NULL");
        }
        $checked = true;
    } catch (Exception $e) {
        // Ignore if alter table fails or db restricted
    }
}

function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function getBearerToken() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } else if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/i', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function generateToken($username) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'username' => $username,
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60)
    ]);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyAdminToken() {
    $token = getBearerToken();
    if (!$token) {
        sendJSON(["message" => "Access denied. Token missing."], 401);
    }
    
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        sendJSON(["message" => "Invalid token format."], 403);
    }
    
    $header = $parts[0];
    $payload = $parts[1];
    $signatureProvided = $parts[2];
    
    $secrets = array_unique([
        defined('JWT_SECRET') ? JWT_SECRET : '',
        'nitwebs_secret_key_2026',
        'nitwebs_secret_key_2026_hostinger_jwt'
    ]);

    $valid = false;
    foreach ($secrets as $secret) {
        if (empty($secret)) continue;
        $signature = hash_hmac('sha256', $header . "." . $payload, $secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        if (hash_equals($base64UrlSignature, $signatureProvided)) {
            $valid = true;
            break;
        }
    }
    
    if (!$valid) {
        sendJSON(["message" => "Invalid token signature."], 403);
    }
    
    $payloadDecoded = base64_decode(str_replace(['-', '_'], ['+', '/'], $payload));
    $data = json_decode($payloadDecoded, true);
    if (!$data || !isset($data['exp']) || $data['exp'] < time()) {
        sendJSON(["message" => "Token expired."], 403);
    }
    
    return $data;
}
