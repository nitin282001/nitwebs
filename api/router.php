<?php
// Router for PHP built-in server (local testing: php -S localhost:5000 api/router.php)
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip /api/ prefix if present
$path = preg_replace('/^\/api\/?/', '', $uri);

// Serve static uploads (resumes, gallery photos)
$staticFile = __DIR__ . '/' . $path;
if (!empty($path) && file_exists($staticFile) && !is_dir($staticFile) && pathinfo($staticFile, PATHINFO_EXTENSION) !== 'php') {
    $mime = mime_content_type($staticFile);
    header("Content-Type: " . ($mime ?: 'application/octet-stream'));
    readfile($staticFile);
    exit;
}

if (strpos($path, 'auth') === 0) {
    require __DIR__ . '/auth.php';
    exit;
}
if (strpos($path, 'admin/jobs') === 0 || strpos($path, 'jobs') === 0) {
    $parts = explode('/', trim($path, '/'));
    $last = end($parts);
    if (!empty($last) && $last !== 'jobs' && $last !== 'admin') {
        if (is_numeric($last)) {
            $_GET['id'] = $last;
        } else {
            $_GET['slug'] = $last;
        }
    }
    require __DIR__ . '/jobs.php';
    exit;
}
if (strpos($path, 'admin/applications') === 0 || strpos($path, 'applications') === 0) {
    $parts = explode('/', trim($path, '/'));
    $last = end($parts);
    if (!empty($last) && $last !== 'applications' && $last !== 'admin' && is_numeric($last)) {
        $_GET['id'] = $last;
    }
    require __DIR__ . '/applications.php';
    exit;
}
if (strpos($path, 'pages') === 0) {
    $parts = explode('/', $path);
    if (count($parts) > 1 && !empty($parts[1])) {
        $_GET['slug'] = $parts[1];
    }
    require __DIR__ . '/pages.php';
    exit;
}

$parts = explode('/', $path);
$endpoint = strtok($parts[0], '.');

if (empty($endpoint)) {
    header("Content-Type: application/json");
    echo json_encode(["status" => "Nitwebs PHP API running"]);
    exit;
}

$phpFile = __DIR__ . '/' . $endpoint . '.php';

if (file_exists($phpFile)) {
    require $phpFile;
    exit;
}

http_response_code(404);
header("Content-Type: application/json");
echo json_encode(["message" => "PHP Endpoint not found: " . $path]);
