<?php
// Permitir requisições de qualquer origem (útil para testes locais e diferentes subdomínios)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Lidar com requisições preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Receber dados do front-end
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos recebidos no servidor.']);
    exit;
}

// Fallback CPF se não enviado pelo front-end (Requisito MisticPay)
if (empty($data['payerDocument'])) {
    $data['payerDocument'] = '12345678909'; 
}

$endpoint = 'https://api.misticpay.com/api/transactions/create';
$ci = 'ci_2327w1glu6ij5vl'; 
$cs = 'cs_61kj3rxobztuafkxkpbpwo800';

$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'ci: ' . $ci,
    'cs: ' . $cs,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$error = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Debug: se houver erro no cURL (ex: problema de rede no servidor)
if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno de rede no servidor: ' . $error]);
} else {
    // Retornar a mesma resposta (e código HTTP) da MisticPay
    http_response_code($httpCode);
    echo $response;
}
?>
