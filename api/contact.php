<?php
require_once __DIR__ . '/mailer.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    verifyAdminToken();
    $stmt = $pdo->query("SELECT * FROM contacts ORDER BY created_at DESC");
    sendJSON($stmt->fetchAll());
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;

    $name = trim($input['name'] ?? '');
    $company = trim($input['company'] ?? '');
    $email = trim($input['email'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $projectType = trim($input['projectType'] ?? '');
    $subject = trim($input['subject'] ?? 'New Website Inquiry');
    $budget = trim($input['budget'] ?? '');
    $message = trim($input['message'] ?? '');

    if (empty($email) || empty($name)) {
        sendJSON(["message" => "Name and email are required."], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO contacts (name, company, email, phone, project_type, subject, budget, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->execute([$name, $company, $email, $phone, $projectType, $subject, $budget, $message]);

    $to = "info@nitwebs.com";
    $body = "New Contact Inquiry:\n\nName: $name\nCompany: $company\nEmail: $email\nPhone: $phone\nProject Type: $projectType\nBudget: $budget\n\nMessage:\n$message\n";
    sendAppMail($to, "Nitwebs Inquiry: $subject", $body, $pdo, $email);

    sendJSON(["message" => "Submission received successfully"]);
}

sendJSON(["message" => "Method not allowed"], 405);
