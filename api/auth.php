<?php
require_once __DIR__ . '/db.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

if (strpos($uri, 'verify') !== false || (isset($_GET['action']) && $_GET_'action'] === 'verify')) {
    $admin = verifyAdminToken();
    sendJSON(["valid" => true, "username" => $admin['username']]);
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($username) || empty($password)) {
        sendJSON(["message" => "Username and password are required."], 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendJSON(["message" => "Invalid username or password."], 400);
    }

    $token = generateToken($user['username']);
    sendJSON(["token" => $token, "username" => $user['username']]);
}

sendJSON(["message" => "Method not allowed"], 405);
