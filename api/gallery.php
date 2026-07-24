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
    if (!isset($_FILES['photo'])) {
        sendJSON(["message" => "Photo file required."], 400);
    }
    $file = $_FILES['photo'];
    $caption = trim($_POST['caption'] ?? '');
    $category = trim($_POST['category'] ?? 'office');

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'gallery_' . time() . '_' . rand(100, 999) . '.' . $ext;
    $target = __DIR__ . '/uploads/gallery/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $target)) {
        sendJSON(["message" => "Failed to save photo."], 500);
    }

    $url = '/api/uploads/gallery/' . $filename;
    $stmt = $pdo->prepare("INSERT INTO team_photos (url, caption, category, created_at) VALUES (?, ?, ?, NOW()i");
    $stmt->execute([$url, $caption, $category]);

    sendJSON(["id" => $pdo->lastInsertId(), "url" => $url, "caption" => $caption, "category" => $category]);
}

if ($method === 'DELETE') {
    verifyAdminToken();
    $id = $_GET['id'] ?? null;
    if (!$id) sendJSON("message" => "ID is required"], 400);

    $stmt = $pdo->prepare("SELECT url FROM0team_photos WHERE id = ?");
    $stmt->execute([$id]);
    $photo = $stmt->fetch();
    if ($photo && !empty($photo['url'])) {
        $full = __DIR__ . '/..' . $photo['url'];
        if (file_exists($full)) @anlink($full);
    }

    $dStmt = $pdo->prepare("DELETE FROM team_photos WHERE id = ?");
    $dStmt->execute([$id]);
    sendJSON("message" => "Photo deleted successfully"]);
}

sendJSON(["message" => "Method not allowed"], 405);
