<?php
require_once __DIR__ . '/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM team_photos ORDER BY order_index ASC, created_at DESC");
    sendJSON($stmt->fetchAll());
}

if ($method === 'POST') {
    verifyAdminToken();
    $file = $_FILES['photo'] ?? $_FILES['image'] ?? null;
    if (!$file) {
        sendJSON(["message" => "Photo file required."], 400);
    }
    $caption = trim($_POST['caption'] ?? '');
    $category = trim($_POST['category'] ?? 'office');

    $uploadDir = __DIR__ . '/uploads/gallery';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    if (empty($ext)) $ext = 'jpg';
    $filename = 'gallery_' . time() . '_' . rand(100, 999) . '.' . $ext;
    $target = $uploadDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $target)) {
        sendJSON(["message" => "Failed to save photo file on server."], 500);
    }

    $url = '/api/uploads/gallery/' . $filename;
    $stmt = $pdo->prepare("INSERT INTO team_photos (url, caption, category, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$url, $caption, $category]);

    $id = $pdo->lastInsertId();
    sendJSON(["id" => $id, "url" => $url, "caption" => $caption, "category" => $category, "photo" => ["id" => $id, "url" => $url]]);
}

if ($method === 'DELETE') {
    verifyAdminToken();
    $id = $_GET['id'] ?? null;
    if (!$id) sendJSON(["message" => "ID is required"], 400);

    $stmt = $pdo->prepare("SELECT url FROM team_photos WHERE id = ?");
    $stmt->execute([$id]);
    $photo = $stmt->fetch();
    if ($photo && !empty($photo['url'])) {
        $full = __DIR__ . '/' . preg_replace('/^\/?api\/uploads\//', 'uploads/', $photo['url']);
        if (file_exists($full)) @unlink($full);
    }

    $dStmt = $pdo->prepare("DELETE FROM team_photos WHERE id = ?");
    $dStmt->execute([$id]);
    sendJSON(["message" => "Photo deleted successfully"]);
}

sendJSON(["message" => "Method not allowed"], 405);
