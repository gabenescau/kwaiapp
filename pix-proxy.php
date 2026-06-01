<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, User-Agent");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Metodo nao permitido.']);
    exit;
}

$apiUrl = 'https://api.realtechdev.com.br/v1/transactions';
$authToken = 'sk_live_c6c14bb3979fb9e0223ba541ef0f9503';
$userAgent = 'Buckpay API';

$input = file_get_contents('php://input');
if (empty($input)) {
    echo json_encode(['success' => false, 'error' => 'Corpo vazio.']);
    exit;
}

$data = json_decode($input, true);

$externalId = !empty($data['external_id']) ? $data['external_id'] : 'KW-' . uniqid();
$amount = !empty($data['amount']) ? intval($data['amount']) : 1881;
$nome = !empty($data['buyer']['name']) ? $data['buyer']['name'] : 'Cliente Kwai';
$email = !empty($data['buyer']['email']) ? $data['buyer']['email'] : 'cliente@email.com';
$telefone = !empty($data['buyer']['phone']) ? $data['buyer']['phone'] : '11999999999';
$documento = !empty($data['buyer']['document']) ? $data['buyer']['document'] : '00000000000';

$payload = json_encode([
    'external_id' => $externalId,
    'payment_method' => 'pix',
    'amount' => $amount,
    'buyer' => [
        'name' => $nome,
        'email' => $email,
        'phone' => $telefone,
        'document' => $documento
    ]
]);

$ch = curl_init($apiUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $authToken,
        'User-Agent: ' . $userAgent
    ],
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Salva log para diagnóstico de erros
if ($httpCode !== 200 && $httpCode !== 201) {
    $logData = [
        'time' => date('Y-m-d H:i:s'),
        'http_code' => $httpCode,
        'payload' => $payload,
        'response' => $response
    ];
    file_put_contents(__DIR__ . '/pix-debug.log', json_encode($logData, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);
}

http_response_code($httpCode);
echo $response;
?>