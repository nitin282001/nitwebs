<?php
require_once __DIR__ . '/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

$defaultFooter = [
    "columns" => [
        [
            "title" => "Company",
            "links" => [
                [ "label" => "About Us", "url" => "#about" ],
                [ "label" => "Careers", "url" => "/careers" ],
                [ "label" => "Contact", "url" => "#contact" ]
            ]
        ]
    ],
    "social" => [
        [ "platform" => "Twitter", "url" => "https://twitter.com" ],
        [ "platform" => "LinkedIn", "url" => "https://linkedin.com" ]
    ],
    "copyright" => "© 2026 Nitwebs Inc. All rights reserved."
];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT data FROM footer ORDER BY id ASC LIMIT 1");
    $row = $stmt->fetch();
    if ($row && !empty($row['data'])) {
        $decoded = json_decode($row['data'], true);
        if ($decoded && is_array($decoded) && isset($decoded['columns'])) {
            sendJSON($decoded);
        }
    }
    sendJSON($defaultFooter);
}

if ($method === 'POST' || $method === 'PUT') {
    verifyAdminToken();
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        sendJSON(["message" => "Invalid JSON payload"], 400);
    }
    $json = json_encode($input, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
    $stmt = $pdo->query("SELECT id FROM footer ORDER BY id ASC LIMIT 1");
    $existing = $stmt->fetch();
    
    if ($existing) {
        $uStmt = $pdo->prepare("UPDATE footer SET data = ?, updated_at = NOW() WHERE id = ?");
        $uStmt->execute([$json, $existing['id']]);
    } else {
        $iStmt = $pdo->prepare("INSERT INTO footer (data, updated_at) VALUES (?, NOW())");
        $iStmt->execute([$json]);
    }
    
    sendJSON(["footer" => $input]);
}

sendJSON(["message" => "Method not allowed"], 405);
