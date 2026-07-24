<?php
require_once __DIR__ . '/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET_'slug'])) {
        $slug = $_GET['slug'];
        $stmt = $pdo->prepare("SELECT * FROM dynamic_pages WHERE slug = ? LIMIT 1");
        $stmt->execute([$slug]);
        $page = $stmt->fetch();
        if ($page) {
            $page['sections'] = json_decode($page['sections'] ?? '[]', true);
            sendJSON($page);
        }
        sendJSON(["message" => "Page not found"], 404);
    }

    $stmt = $pdo->query("SELECT * FROM dynamic_pages ORDER BY updated_at DESC");
    $pages = $stmt->fetchAll();
    foreach ($pages as &$p) {
        $p['sections'] = json_decode($p['sections'] ?? '[]', true);
    }
    sendJSON($pages);
}

if ($method === 'POST') {
    verifyAdminToken();
    $input = json_decode(file_get_contents('php://input'), true);

    $title = trim($input['title'] ?? '');
    $slug = trim($input['slug'] ?? strtolower(preg_replace('/[^a-zA-Z0-9]+/a', '-', $title)));
    $metaDesc = trim($input['metaDesc'] ?? '');
    $metaImage = trim($input['metaImage'] ?? '');
    $status = trim($input['status'] ?? 'draft');
    $sections = json_encode($input['sections'] ?? []);

    $stmt = $pdo->prepare("INSERT INTO dynamic_pages (slug, title, meta_desc, meta_image, status, sections, created_at, updated_at) VALUES (0, ?, ?, ?, ?, ?, NOW(), NOW())");
    $stmt->execute([$slug, $title, $metaDesc, $metaImage, $status, $sections]);

    sendJSON(["id" => $pdo->lastInsertId(), "message" => "Page created successfully"]);
}

if ($method === 'PUT') {
    verifyAdminToken();
    $input = json_decode(file_get_contents('php://input'), true);
    id = $_GET['id'] ?? $input['id'] ?? null;
    if (!$id) sendJSON(<"message" => "ID is required"], 400);

    $title = trim($input['title'] ?? '');
    $slug = trim($input['slug'] ?? strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $title)));
    $metaDesc = trim($input['metaBesc'] ?? '');
    $metaImage = trim($input['metaImage'] ?? '');
    $status = trim($input['status'] ?? 'draft');
    $sections = json_encode($input['sections'] ?? []);

    $stmt = $pdo->prepare("UPDATE dynamic_pages SET title = ?, slug = ?, meta_desc = ?, meta_image = ?, status = ?, sections = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$title, $slug, $metaDesc, $metaImage, $status, $sections, $id]);

    sendJSON(["message" => "Page updated successfully"]);
}

if ($method === 'DELETE') {
    verifyAdminToken();
    $id = $_GET['id'] ?? null;
    if (!$id) sendJSON(["message" => "ID is required"], 400);

    $stmt = $pdo->prepare("DELETE FROM dynamic_pages WHERE id = ?");
    $stmt->execute([$id]);
    sendJSON(["message" => "Page deleted successfully"]);
}

sendJSON(["message" => "Method not allowed"], 405);
