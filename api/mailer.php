<?php
require_once __DIR__ . '/db.php';

function getSMTPConfig($pdo = null) {
    if (!$pdo) {
        $pdo = getDBConnection();
    }
    try {
        $stmt = $pdo->query("SELECT data FROM site_content ORDER BY id ASC LIMIT 1");
        $row = $stmt->fetch();
        if ($row && !empty($row['data'])) {
            $data = json_decode($row['data'], true);
            if (isset($data['smtp']) && is_array($data['smtp'])) {
                return $data['smtp'];
            }
        }
    } catch (Exception $e) {}

    return [
        'enabled' => false,
        'host' => '',
        'port' => 587,
        'encryption' => 'tls',
        'username' => '',
        'password' => '',
        'from_email' => '',
        'from_name' => 'Nitwebs'
    ];
}

function sendSMTPSocket($to, $subject, $body, $smtp, $replyTo = null) {
    $host = trim($smtp['host'] ?? '');
    $port = (int)($smtp['port'] ?? 587);
    $encryption = strtolower(trim($smtp['encryption'] ?? 'tls'));
    $username = trim($smtp['username'] ?? '');
    $password = trim($smtp['password'] ?? '');
    $fromEmail = trim($smtp['from_email'] ?? ($username ?: ('no-reply@' . ($_SERVER['HTTP_HOST'] ?? 'nitwebs.com'))));
    $fromName = trim($smtp['from_name'] ?? 'Nitwebs');

    if (empty($host)) {
        throw new Exception("SMTP host address is missing.");
    }

    $socketHost = $host;
    if ($encryption === 'ssl' && strpos($host, 'ssl://') !== 0) {
        $socketHost = "ssl://" . $host;
    }

    $timeout = 10;
    $socket = @stream_socket_client($socketHost . ":" . $port, $errno, $errstr, $timeout);
    if (!$socket) {
        throw new Exception("Connection to SMTP Server ($host:$port) failed: ($errno) $errstr");
    }

    stream_set_timeout($socket, $timeout);

    $read = function() use ($socket) {
        $response = "";
        while ($line = fgets($socket, 512)) {
            $response .= $line;
            if (substr($line, 3, 1) === " ") break;
        }
        return $response;
    };

    $write = function($cmd) use ($socket) {
        fputs($socket, $cmd . "\r\n");
    };

    $res = $read();
    if (substr($res, 0, 3) !== "220") {
        fclose($socket);
        throw new Exception("SMTP greeting failed: $res");
    }

    // EHLO
    $write("EHLO " . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
    $res = $read();

    // STARTTLS if TLS
    if ($encryption === 'tls') {
        $write("STARTTLS");
        $res = $read();
        if (substr($res, 0, 3) !== "220") {
            fclose($socket);
            throw new Exception("STARTTLS failed: $res");
        }

        $cryptoMethod = STREAM_CRYPTO_METHOD_TLS_CLIENT;
        if (defined('STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT')) {
            $cryptoMethod |= STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT;
        }
        if (defined('STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT')) {
            $cryptoMethod |= STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT;
        }

        if (!@stream_socket_enable_crypto($socket, true, $cryptoMethod)) {
            fclose($socket);
            throw new Exception("TLS encryption handshake failed.");
        }

        $write("EHLO " . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
        $res = $read();
    }

    // Auth if credentials supplied
    if (!empty($username)) {
        $write("AUTH LOGIN");
        $res = $read();
        if (substr($res, 0, 3) !== "334") {
            fclose($socket);
            throw new Exception("AUTH LOGIN failed: $res");
        }

        $write(base64_encode($username));
        $res = $read();
        if (substr($res, 0, 3) !== "334") {
            fclose($socket);
            throw new Exception("Username rejected: $res");
        }

        $write(base64_encode($password));
        $res = $read();
        if (substr($res, 0, 3) !== "235") {
            fclose($socket);
            throw new Exception("Authentication failed: Invalid username or password. $res");
        }
    }

    // MAIL FROM
    $write("MAIL FROM: <$fromEmail>");
    $res = $read();
    if (substr($res, 0, 3) !== "250") {
        fclose($socket);
        throw new Exception("MAIL FROM rejected: $res");
    }

    // RCPT TO
    $write("RCPT TO: <$to>");
    $res = $read();
    if (substr($res, 0, 3) !== "250") {
        fclose($socket);
        throw new Exception("RCPT TO rejected: $res");
    }

    // DATA
    $write("DATA");
    $res = $read();
    if (substr($res, 0, 3) !== "354") {
        fclose($socket);
        throw new Exception("DATA command rejected: $res");
    }

    $headers  = "Date: " . date("r") . "\r\n";
    $headers .= "To: <$to>\r\n";
    $headers .= "From: \"$fromName\" <$fromEmail>\r\n";
    if (!empty($replyTo)) {
        $headers .= "Reply-To: $replyTo\r\n";
    }
    $headers .= "Subject: $subject\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "MIME-Version: 1.0\r\n";

    $write($headers . "\r\n" . $body . "\r\n.");
    $res = $read();
    if (substr($res, 0, 3) !== "250") {
        fclose($socket);
        throw new Exception("Message content rejected: $res");
    }

    $write("QUIT");
    fclose($socket);
    return true;
}

function sendAppMail($to, $subject, $body, $pdo = null, $replyTo = null) {
    $smtp = getSMTPConfig($pdo);

    if (!empty($smtp['enabled']) && !empty($smtp['host'])) {
        try {
            sendSMTPSocket($to, $subject, $body, $smtp, $replyTo);
            return ["success" => true, "method" => "smtp"];
        } catch (Exception $e) {
            $smtpError = $e->getMessage();
        }
    }

    // Fallback to PHP native mail()
    $fromEmail = !empty($smtp['from_email']) ? $smtp['from_email'] : ("no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'nitwebs.com'));
    $fromName = !empty($smtp['from_name']) ? $smtp['from_name'] : 'Nitwebs';
    $headers = "From: \"$fromName\" <$fromEmail>\r\n";
    if (!empty($replyTo)) {
        $headers .= "Reply-To: $replyTo\r\n";
    }
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $sent = @mail($to, $subject, $body, $headers);

    return [
        "success" => $sent,
        "method" => "mail",
        "smtpError" => $smtpError ?? null
    ];
}
