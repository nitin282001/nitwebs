<?php
require_once __DIR__ . '/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

$defaultNav = [
    "links" => [
        [ "label" => "Services", "type" => "scroll", "target" => "services" ],
        [ "label" => "About", "type" => "scroll", "target" => "about" ],
        [ "label" => "Process", "type" => "scroll", "target" => "process" ],
        [ "label" => "Careers", "type" => "page", "target" => "/careers" ],
        [ "label" => "Contact", "type" => "scroll", "target" => "contact" ]
    ],
    "ctaLabel" => "Get Started",
    "ctaType" => "scroll",
    "ctaTarget" => "contact"
];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT data FROM navigation ORDER BY id ASC LIMIT 1");
    $row = $stmt->fetch();
    if ($row && !empty($row['data'])) {
        $decoded = json_decode($row['data'], true);
        if ($decoded && is_array($decoded) && isset($decoded['links'])) {
            sendJSON($decoded);
        }
    }
    sendJSON($defaultNav);
}

if ($method === 'POST' || $method === 'PUT') {
    verifyAdminToken();
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        sendJSON(["message" => "Invalid JSON payload"], 400);
    }
    $json = json_encode($input, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
    $stmt = $pdo->query("SELECT id FROM navigation ORDER BY id ASC LIMIT 1");
    $existing = $stmt->fetch();
    
    if ($existing) {
        $uStmt = $pdo->prepare("UPDATE navigation SET data = ?, updated_at = NOW() WHERE id = ?");
        $uStmt->execute([$json, $existing['id']]);
    } else {
        $iStmt = $pdo->prepare("INSERT INTO navigation (data, updated_at) VALUES (?, NOW())");
        $iStmt->execute([$json]);
    }
    
    sendJSON(["nav" => $input]);
}

sendJSON(["message" => "Method not allowed"], 405);