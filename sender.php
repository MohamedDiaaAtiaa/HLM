<?php
/* ═══════════════════════════════════════════════════════════
   HLM LAW ADVOCATES — Email Relay (sender.php)
   Handles contact form notifications & admin replies
   ═══════════════════════════════════════════════════════════ */

// ── 1. Always output JSON, even on fatal errors ───────────
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=UTF-8');
        }
        echo json_encode([
            'success' => false,
            'error'   => 'PHP Fatal: ' . $error['message'] . ' in ' . $error['file'] . ':' . $error['line']
        ]);
    }
});

// ── 2. Error config & CORS ────────────────────────────────
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

$allowed_origins = [
    'https://hlm-legal.com',
    'https://www.hlm-legal.com',
    'http://localhost',
    'http://127.0.0.1',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=UTF-8');

// ── 3. Handle CORS preflight ─────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── 4. Reject non-POST ───────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed. Use POST.']);
    exit;
}

// ── 5. Parse JSON body ───────────────────────────────────
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid or empty JSON body: ' . json_last_error_msg()]);
    exit;
}

// ── 6. Sanitize ──────────────────────────────────────────
function sanitize(string $val): string {
    return trim(str_replace(["\r", "\n", "\t"], ' ', strip_tags($val)));
}

$to        = filter_var($data['to'] ?? '', FILTER_VALIDATE_EMAIL);
$subject   = sanitize($data['subject']   ?? 'New Inquiry — HLM Law Advocates');
$body_text = sanitize($data['message']   ?? '');
$from_name = sanitize($data['from_name'] ?? 'HLM Website');
$firm_email = 'info@hlm-legal.com';

if (!$to) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid or missing recipient email address.']);
    exit;
}
if (empty($body_text)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Message body cannot be empty.']);
    exit;
}

// ── 7. Build HTML email ──────────────────────────────────
$year         = date('Y');
$html_message = nl2br(htmlspecialchars($body_text, ENT_QUOTES, 'UTF-8'));

$email_body = '<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    body  { font-family: "Segoe UI", Arial, sans-serif; background:#f8fafc; margin:0; padding:0; color:#1e293b; }
    .wrap { max-width:620px; margin:30px auto; background:#fff; border-radius:8px;
            border:1px solid #e2e8f0; box-shadow:0 4px 20px rgba(0,0,0,.06); overflow:hidden; }
    .hdr  { background:#0B1C2C; padding:24px 32px; }
    .hdr h2 { color:#C6A85C; margin:0; font-size:1.2rem; letter-spacing:.05em; }
    .hdr p  { color:rgba(255,255,255,.6); margin:4px 0 0; font-size:.8rem; }
    .bdy  { padding:32px; line-height:1.8; font-size:.95rem; color:#334155; }
    .ftr  { background:#f1f5f9; padding:16px 32px; font-size:.78rem; color:#64748b;
            border-top:1px solid #e2e8f0; text-align:center; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h2>H.L.M &mdash; &#x62D;&#x633;&#x646; &#x648;&#x644;&#x642;&#x645;&#x627;&#x646; &#x648;&#x645;&#x631;&#x627;&#x62F;</h2>
      <p>LAW ADVOCATES &amp; LEGAL CONSULTANTS</p>
    </div>
    <div class="bdy">' . $html_message . '</div>
    <div class="ftr">&copy; ' . $year . ' HLM Law Advocates &amp; Legal Consultants &mdash; All rights reserved.</div>
  </div>
</body>
</html>';

// ── 8. Mail headers ──────────────────────────────────────
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: =?UTF-8?B?" . base64_encode($from_name) . "?= <$firm_email>\r\n";
$headers .= "Reply-To: $firm_email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "X-Priority: 1\r\n";

// ── 9. Send & respond ────────────────────────────────────
$sent = mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $email_body, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Email delivered successfully.']);
} else {
    $last = error_get_last();
    $detail = $last ? $last['message'] : 'mail() returned false — check server mail configuration (sendmail/SMTP).';
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $detail]);
}
?>
