<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/mailer.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$actionParam = $_GET['action'] ?? '';

function maskEmail($email) {
    if (!$email || strpos($email, '@') === false) return 'admin@***';
    $parts = explode('@', $email);
    $name = $parts[0];
    $domain = $parts[1];
    $maskedName = strlen($name) > 2 ? substr($name, 0, 2) . str_repeat('*', max(1, strlen($name) - 2)) : $name . '*';
    return $maskedName . '@' . $domain;
}

// 1. GET requests: Verify token OR fetch profile
if ($method === 'GET') {
    if (strpos($uri, 'verify') !== false || $actionParam === 'verify') {
        $admin = verifyAdminToken();
        sendJSON(["valid" => true, "username" => $admin['username']]);
    }
    
    if (strpos($uri, 'profile') !== false || $actionParam === 'profile') {
        $admin = verifyAdminToken();
        $stmt = $pdo->prepare("SELECT username, email FROM admin_users WHERE username = ?");
        $stmt->execute([$admin['username']]);
        $user = $stmt->fetch();
        if (!$user) {
            sendJSON(["message" => "Admin user not found."], 404);
        }
        sendJSON([
            "username" => $user['username'],
            "email" => $user['email'] ?: 'admin@nitwebs.com'
        ]);
    }

    sendJSON(["message" => "Invalid endpoint"], 400);
}

// 2. POST requests: Login (Step 1), Verify OTP (Step 2), Resend OTP, Update Profile, Test SMTP
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $input['action'] ?? ($input['step'] ?? '');

    // Action: Test SMTP Connection
    if ($action === 'test-smtp') {
        verifyAdminToken();
        $testEmail = trim($input['testEmail'] ?? '');
        $smtpConfig = $input['smtp'] ?? null;

        if (empty($testEmail)) {
            sendJSON(["message" => "Test recipient email address is required."], 400);
        }

        if (!$smtpConfig || !is_array($smtpConfig)) {
            $smtpConfig = getSMTPConfig($pdo);
        }

        try {
            sendSMTPSocket(
                $testEmail,
                "Nitwebs SMTP Configuration Test",
                "Hello,\n\nThis is a test email sent from your Nitwebs Admin Console to verify your SMTP server configuration.\n\nHost: " . ($smtpConfig['host'] ?? '') . "\nPort: " . ($smtpConfig['port'] ?? '') . "\nTime: " . date("Y-m-d H:i:s") . "\n\nStatus: SMTP handshake and authentication completed successfully!",
                $smtpConfig
            );
            sendJSON([
                "success" => true,
                "message" => "SMTP Test email sent successfully to $testEmail via " . ($smtpConfig['host'] ?? 'SMTP server') . "!"
            ]);
        } catch (Exception $e) {
            sendJSON([
                "success" => false,
                "message" => $e->getMessage()
            ], 400);
        }
    }

    // Action A: Update Profile (requires valid Bearer Token)
    if (strpos($uri, 'profile') !== false || $action === 'update-profile') {
        $adminTokenData = verifyAdminToken();
        $currentUsername = $adminTokenData['username'];

        $newUsername = trim($input['username'] ?? $currentUsername);
        $newEmail = trim($input['email'] ?? '');
        $currentPassword = trim($input['currentPassword'] ?? '');
        $newPassword = trim($input['newPassword'] ?? '');

        if (empty($newEmail)) {
            sendJSON(["message" => "Admin email address is required."], 400);
        }
        if (empty($currentPassword)) {
            sendJSON(["message" => "Current password is required to save security changes."], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
        $stmt->execute([$currentUsername]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
            sendJSON(["message" => "Current password is incorrect."], 400);
        }

        // Prepare updates
        $updates = [];
        $params = [];

        if ($newUsername !== $currentUsername) {
            $checkStmt = $pdo->prepare("SELECT id FROM admin_users WHERE username = ? AND id != ?");
            $checkStmt->execute([$newUsername, $user['id']]);
            if ($checkStmt->fetch()) {
                sendJSON(["message" => "Username '$newUsername' is already in use."], 400);
            }
            $updates[] = "`username` = ?";
            $params[] = $newUsername;
        }

        $updates[] = "`email` = ?";
        $params[] = $newEmail;

        if (!empty($newPassword)) {
            if (strlen($newPassword) < 6) {
                sendJSON(["message" => "New password must be at least 6 characters."], 400);
            }
            $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
            $updates[] = "`password_hash` = ?";
            $params[] = $newHash;
        }

        if (!empty($updates)) {
            $params[] = $user['id'];
            $sql = "UPDATE admin_users SET " . implode(", ", $updates) . " WHERE id = ?";
            $updateStmt = $pdo->prepare($sql);
            $updateStmt->execute($params);
        }

        // Send email alert to new email via sendAppMail
        $mailSubject = "Nitwebs Security Alert: Admin Credentials Updated";
        $mailBody = "Hello $newUsername,\n\nYour Nitwebs admin credentials/profile were updated.\nUpdated Email: $newEmail\nTime: " . date("Y-m-d H:i:s") . "\n\nIf you did not perform this change, please contact support immediately.";
        sendAppMail($newEmail, $mailSubject, $mailBody, $pdo);

        $newToken = generateToken($newUsername);
        sendJSON([
            "message" => "Admin profile updated successfully.",
            "token" => $newToken,
            "username" => $newUsername,
            "email" => $newEmail
        ]);
    }

    // Action B: Verify OTP (Step 2 of Login)
    if ($action === 'verify-otp') {
        $username = trim($input['username'] ?? '');
        $otp = trim($input['otp'] ?? '');

        if (empty($username) || empty($otp)) {
            sendJSON(["message" => "Username and OTP code are required."], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user) {
            sendJSON(["message" => "Invalid admin user."], 400);
        }

        if (empty($user['otp_code']) || $user['otp_code'] !== $otp) {
            sendJSON(["message" => "Invalid OTP code. Please check your email or resend."], 400);
        }

        if (empty($user['otp_expires_at']) || strtotime($user['otp_expires_at']) < time()) {
            sendJSON(["message" => "OTP code has expired. Please request a new code."], 400);
        }

        // Clear OTP code on successful login
        $clearStmt = $pdo->prepare("UPDATE admin_users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?");
        $clearStmt->execute([$user['id']]);

        $token = generateToken($user['username']);
        sendJSON([
            "token" => $token,
            "username" => $user['username'],
            "email" => $user['email'] ?: 'admin@nitwebs.com'
        ]);
    }

    // Action C: Resend OTP
    if ($action === 'resend-otp') {
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            sendJSON(["message" => "Authentication failed. Cannot resend OTP."], 400);
        }

        $otp = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $expires = date("Y-m-d H:i:s", time() + 600); // 10 mins

        $updateStmt = $pdo->prepare("UPDATE admin_users SET otp_code = ?, otp_expires_at = ? WHERE id = ?");
        $updateStmt->execute([$otp, $expires, $user['id']]);

        $adminEmail = $user['email'] ?: 'admin@nitwebs.com';
        $subject = "Admin Login OTP Code - Nitwebs";
        $body = "Your new 6-digit Admin Login OTP code is: $otp\n\nThis code will expire in 10 minutes.";
        sendAppMail($adminEmail, $subject, $body, $pdo);

        $isDev = (strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false || strpos($_SERVER['HTTP_HOST'] ?? '', '127.0.0.1') !== false);
        $response = [
            "requireOtp" => true,
            "email" => maskEmail($adminEmail),
            "message" => "New OTP sent to admin email."
        ];
        if ($isDev) {
            $response["devOtp"] = $otp;
        }
        sendJSON($response);
    }

    // Action D: Step 1 Login (Username + Password)
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

    // Credentials valid -> Generate 6-digit OTP
    $otp = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    $expires = date("Y-m-d H:i:s", time() + 600); // 10 mins

    $updateStmt = $pdo->prepare("UPDATE admin_users SET otp_code = ?, otp_expires_at = ? WHERE id = ?");
    $updateStmt->execute([$otp, $expires, $user['id']]);

    $adminEmail = $user['email'] ?: 'admin@nitwebs.com';
    $subject = "Admin Login OTP Code - Nitwebs";
    $body = "Hello " . $user['username'] . ",\n\nYour 6-digit Admin Login OTP code is: $otp\n\nThis code will expire in 10 minutes.\nIf you did not attempt to sign in, please secure your admin credentials immediately.";
    sendAppMail($adminEmail, $subject, $body, $pdo);

    $isDev = (strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false || strpos($_SERVER['HTTP_HOST'] ?? '', '127.0.0.1') !== false);
    $response = [
        "requireOtp" => true,
        "email" => maskEmail($adminEmail),
        "message" => "OTP sent to registered admin email."
    ];
    if ($isDev) {
        $response["devOtp"] = $otp;
    }
    sendJSON($response);
}

sendJSON(["message" => "Method not allowed"], 405);
