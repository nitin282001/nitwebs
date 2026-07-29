<?php
require_once __DIR__ . '/db.php';

$pdo = getDBConnection();

function ensureApplicationsTable($pdo) {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `applications` (
          `id` INT AUTO_INCREMENT PRIMARY KEY,
          `job_id` VARCHAR(100) DEFAULT '0',
          `job_title` VARCHAR(255) DEFAULT '',
          `name` VARCHAR(255) NOT NULL,
          `email` VARCHAR(255) NOT NULL,
          `phone` VARCHAR(100) DEFAULT '',
          `resume_path` VARCHAR(500) NOT NULL,
          `cover_note` TEXT,
          `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (Exception $e) {}
}
ensureApplicationsTable($pdo);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    verifyAdminToken();
    $stmt = $pdo->query("SELECT * FROM applications ORDER BY submitted_at DESC");
    $apps = $stmt->fetchAll();
    
    $jobMap = [];
    try {
        $jStmt = $pdo->query("SELECT id, title FROM jobs");
        if ($jStmt) {
            while ($jRow = $jStmt->fetch()) {
                $jobMap[(string)$jRow['id']] = $jRow['title'];
            }
        }
    } catch (Exception $e) {}

    $formatted = [];
    foreach ($apps as $a) {
        $jId = (string)($a['job_id'] ?? '0');
        $resolvedTitle = !empty($a['job_title']) ? $a['job_title'] : ($jobMap[$jId] ?? 'General Application');

        $rawPath = $a['resume_path'] ?? '';
        $cleanPath = preg_replace('/^https?:\/\/[^\/]+/i', '', $rawPath);
        if (!empty($cleanPath) && strpos($cleanPath, '/') !== 0) {
            $cleanPath = '/' . $cleanPath;
        }

        $a['_id'] = (string)$a['id'];
        $a['jobId'] = $jId;
        $a['jobTitle'] = $resolvedTitle;
        $a['job_title'] = $resolvedTitle;
        $a['resumePath'] = $cleanPath;
        $a['resume_path'] = $cleanPath;
        $a['coverNote'] = $a['cover_note'] ?? '';
        $a['submittedAt'] = !empty($a['submitted_at']) ? $a['submitted_at'] : date('Y-m-d H:i:s');
        $formatted[] = $a;
    }
    sendJSON($formatted);
}

if ($method === 'POST') {
    $jobId = trim($_POST['jobId'] ?? '');
    $jobTitle = trim($_POST['jobTitle'] ?? '');
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $coverNote = trim($_POST['coverNote'] ?? $_POST['coverLetter'] ?? '');

    if (empty($name) || empty($email) || !isset($_FILES['resume'])) {
        sendJSON(["message" => "Name, email, and resume file are required."], 400);
    }

    $file = $_FILES['resume'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowedExts = ['pdf', 'doc', 'docx'];
    if (!in_array($ext, $allowedExts)) {
        sendJSON(["message" => "Invalid file extension. Only PDF, DOC, and DOCX files are allowed."], 400);
    }

    $uploadDir = __DIR__ . '/uploads/resumes';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }

    $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($file['name']));
    $targetPath = $uploadDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        sendJSON(["message" => "Failed to save uploaded resume."], 500);
    }

    $relPath = '/api/uploads/resumes/' . $filename;

    $stmt = $pdo->prepare("INSERT INTO applications (job_id, job_title, name, email, phone, resume_path, cover_note, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
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
        $full = __DIR__ . '/' . preg_replace('/^\/?api\/uploads\//', 'uploads/', $app['resume_path']);
        if (file_exists($full)) @unlink($full);
    }

    $dStmt = $pdo->prepare("DELETE FROM applications WHERE id = ?");
    $dStmt->execute([$id]);
    sendJSON(["message" => "Application deleted successfully"]);
}

sendJSON(["message" => "Method not allowed"], 405);
