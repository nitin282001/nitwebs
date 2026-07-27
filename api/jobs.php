<?php
require_once __DIR__ . '/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['id']) || isset($_GET['slug'])) {
        $val = $_GET['id'] ?? $_GET['slug'];
        $stmt = $pdo->prepare("SELECT * FROM jobs WHERE id = ? OR slug = ? LIMIT 1");
        $stmt->execute([$val, $val]);
        $job = $stmt->fetch();
        if ($job) {
            $job['requirements'] = json_decode($job['requirements'] ?? '[]', true);
            sendJSON($job);
        }
        sendJSON(["message" => "Job not found"], 404);
    }

    $stmt = $pdo->query("SELECT * FROM jobs ORDER BY posted_date DESC");
    $jobs = $stmt->fetchAll();
    foreach ($jobs as &$j) {
        $j['requirements'] = json_decode($j['requirements'] ?? '[]', true);
    }
    sendJSON($jobs);
}

if ($method === 'POST') {
    verifyAdminToken();
    $input = json_decode(file_get_contents('php://input'), true);
    
    $title = trim($input['title'] ?? '');
    if (empty($title)) {
        sendJSON(["message" => "Job title is required."], 400);
    }

    $slug = trim($input['slug'] ?? '');
    if (empty($slug)) {
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $title));
    }
    $department = trim($input['department'] ?? '');
    $location = trim($input['location'] ?? 'Remote');
    $employmentType = trim($input['employmentType'] ?? 'full-time');
    $summary = trim($input['summary'] ?? '');
    $description = trim($input['description'] ?? '');
    $requirements = json_encode($input['requirements'] ?? []);
    $status = trim($input['status'] ?? 'open');
    
    try {
        $stmt = $pdo->prepare("INSERT INTO jobs (title, slug, department, location, employment_type, summary, description, requirements, status, posted_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$title, $slug, $department, $location, $employmentType, $summary, $description, $requirements, $status]);
        $id = $pdo->lastInsertId();
        sendJSON(["id" => $id, "message" => "Job created successfully"]);
    } catch (PDOException $e) {
        if ($e->getCode() == '23000' || strpos($e->getMessage(), '1062') !== false) {
            sendJSON(["message" => "A job listing with this title/slug already exists."], 400);
        }
        sendJSON(["message" => "Database error: " . $e->getMessage()], 500);
    }
}

if ($method === 'PUT') {
    verifyAdminToken();
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? $input['id'] ?? null;
    if (!$id) sendJSON(["message" => "Job ID is required"], 400);

    $title = trim($input['title'] ?? '');
    if (empty($title)) {
        sendJSON(["message" => "Job title is required."], 400);
    }

    $slug = trim($input['slug'] ?? '');
    if (empty($slug)) {
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $title));
    }
    $department = trim($input['department'] ?? '');
    $location = trim($input['location'] ?? 'Remote');
    $employmentType = trim($input['employmentType'] ?? 'full-time');
    $summary = trim($input['summary'] ?? '');
    $description = trim($input['description'] ?? '');
    $requirements = json_encode($input['requirements'] ?? []);
    $status = trim($input['status'] ?? 'open');

    try {
        $stmt = $pdo->prepare("UPDATE jobs SET title = ?, slug = ?, department = ?, location = ?, employment_type = ?, summary = ?, description = ?, requirements = ?, status = ? WHERE id = ?");
        $stmt->execute([$title, $slug, $department, $location, $employmentType, $summary, $description, $requirements, $status, $id]);
        sendJSON(["message" => "Job updated successfully"]);
    } catch (PDOException $e) {
        if ($e->getCode() == '23000' || strpos($e->getMessage(), '1062') !== false) {
            sendJSON(["message" => "A job listing with this title/slug already exists."], 400);
        }
        sendJSON(["message" => "Database error: " . $e->getMessage()], 500);
    }
}

if ($method === 'DELETE') {
    verifyAdminToken();
    $id = $_GET['id'] ?? null;
    if (!$id) sendJSON(["message" => "Job ID is required"], 400);

    $stmt = $pdo->prepare("DELETE FROM jobs WHERE id = ?");
    $stmt->execute([$id]);
    sendJSON(["message" => "Job deleted successfully"]);
}

sendJSON(["message" => "Method not allowed"], 405);
