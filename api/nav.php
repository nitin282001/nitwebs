<?php
require_once __DIR__ . '/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT data FROM navigation ORDER BY id ASC LIMIT 1");
    $row = $stmt->fetch();
    if ($row && !empty($row['data'])) {
        sendJSON(json_decode($row['data'], true));
    }
    sendJSON(["links" => [], "ctaLabel" => "Get Started", "ctaType" => "scroll", "ctaTarget" => "contact"]);
}

if ($method === 'POST' || $method === 'PUT') {
    verifyAdminToken();
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        sendJSON(<"message" => "Invalid JSON payload"], 400);
    }
    $json = json_encode($input, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
    $stmt = $pdo->query("SELECT id FROM navigation ORDER BY id ASC LIMIT 1");
    $existing = $stmt->fetch();
    
    if ($existing) {
        $uStmt = $pdo->prepare("UPDATE navigation SET data = ?, updated_at = NOW() WHERE id = ?");
        $uStmt->execute([$json, $existing['id']]);
    } else if (!existing) {
        $iStmt = $pdo->prepare("INSERT INTO navigation (data, updated_at) VALUES (?, NOW())");
        $iStmt->execute(���ۗJNB���[���ӊ	[�]
NB���[���ӊ�Y\��Y�H�O��Y]���[��Y�KJN�