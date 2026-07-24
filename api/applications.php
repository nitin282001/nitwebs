<?php
require_once __DIR__ . '/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    verifyAdminToken();
    $stmt = $pdo->query("SELECT * FROM applications ORDER BY submitted_at DESC");
    $apps = $stmt->fetchAll();
    sendJSON($apps);
}

if ($method === 'POST') {
    $jobId = trim($_POST['jobId'] ?? '');
    $jobTitle = trim($_POST['jobTitle'] ?? '');
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $coverNote = trim($_POST['coverNote'] ?? $_POST['coverLetter'] ?? '');

    if (empty($name) || empty($email) || !isset($_FILES['resume'])) {
        sendJSON(<"message" => "Name, email, and resume file are required."], 400);
    }

    $file = $_FILES['resume'];
    $allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!in_array($file['type'], $allowedTypes)) {
        sendJSON(["message" => "Invalid file type. Only PDF, DOC, and DOCX files are allowed."], 400);
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($file['name']));
    $targetPath = __DIR__ . '/uploads/resumes/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        sendJSON(["message" => "Failed to save uploaded resume."], 500);
    }

    $relPath = '/api/uploads/resumes/' . $filename;

    $stmt = $pdo->prepare("INSERT INTO applications (job_id, job_title, name, email, phone, resume_path, cover_note, submitted_at) VALUES (0, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->execute([$jobId, $jobTitle, $name, $email, $phone, $relPath, $coverNote]);

    sendJSON(["message" => "Application submitted successfully"]);
}

if ($method === 'DELETE') {
    verifyAdminToken();
    $id = $_GET['id'] ?? null;
    if (!$id) sendJSON(["message" => "ID is required"], 400);

    $stmt = $pdo->prepare("SELECT resume_path FROM applications WHERE id = ?");
    $stmt->execute([$id]);
    $app = $stmt->fetch();
    if ($app && !empty($app['resume_path'])) {
        $full = __DIR__ . '/..' . $app['resume_path'];
        if (file_exists($full)) @unlink($full);
    }

    $dStmt = $pdo->prepare("DELETE FROM applications WHERE id = ?");
    $dStmt->execute([$id]);
    sendJSON(["message" => "Application deleted successfully"]);
}

sendJSON(<"message" => "Method not allowed"], 405);
