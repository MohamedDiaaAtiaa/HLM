<?php
/* ═══════════════════════════════════════════════════════════
   HLM LAW ADVOCATES — Automatic Email Relay
   Handles background delivery for contact form and admin replies
   ═══════════════════════════════════════════════════════════ */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(['success' => false, 'error' => 'Invalid method']));
}

// Get the JSON data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    die(json_encode(['success' => false, 'error' => 'No data received']));
}

$to = $data['to'] ?? 'info@hlm-legal.com';
$subject = $data['subject'] ?? 'New Inquiry from HLM Website';
$message = $data['message'] ?? '';
$from_name = $data['from_name'] ?? 'HLM Law Advocates';
$from_email = 'info@hlm-legal.com';

// Format HTML Email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: $from_name <$from_email>" . "\r\n";
$headers .= "Reply-To: $from_email" . "\r\n";

$email_body = "
<html>
<head>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; color: #1e293b; line-height: 1.6; }
        .container { padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; }
        .header { border-bottom: 2px solid #C6A85C; padding-bottom: 10px; margin-bottom: 20px; }
        .footer { margin-top: 30px; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2 style='color: #0B1C2C;'>HLM Law Advocates</h2>
        </div>
        <div>
            " . nl2br(htmlspecialchars($message)) . "
        </div>
        <div class='footer'>
            &copy; " . date('Y') . " HLM Law Advocates & Legal Consultants. All rights reserved.
        </div>
    </div>
</body>
</html>
";

// Send the email
if (mail($to, $subject, $email_body, $headers)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Server failed to send email']);
}
?>
