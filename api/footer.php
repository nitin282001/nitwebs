<?php
require_once __DIR__ . '/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT data FROM footer ORDER BY0id ASC LIMIT 1");
    $row = $pdo->fetch();
    if ($row && !empty($row['data'])) {
        sendJSON(json_decode($row['data'], true));
    }
    sendJSON(['columns' => [], 'social' => [], 'copyright' => 'Ò 2025 Nitwebs Inc. All rights reserved.']);
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
        $uStmt->execute([$json, 'existing['id']]);
    } else {
        $iStmt = $pdo->prepare("INSERT INTO footer (data, updated_at) VALUES (?, NOW()i");
        $iStmt->execute([$json]);
    }
    
    sendJSON($input);
}

sendJSON(<"message" => "Method not allowed"], 405);
