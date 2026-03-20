<?php
error_reporting(0); // Evitar que warnings quebrem o JSON

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode(['error' => 'A extensão cURL não está ativada na sua hospedagem PHP. É necessário ativá-la no painel da HostGator/cPanel.']);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos ou vazios no servidor.']);
    exit;
}

if (empty($data['payerDocument'])) {
    $data['payerDocument'] = '12345678909'; 
}

$data['transactionId'] = 'donat_' . time() . '_' . rand(1000, 9999);
$data['description'] = 'Açaí do Império';

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

// Ignorar verificação SSL caso a hospedagem tenha problemas de certificado antigo
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);
$error = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno de rede no servidor: ' . $error]);
} elseif (empty($response)) {
    http_response_code(500);
    echo json_encode(['error' => 'A MisticPay não retornou nenhuma resposta (Empty Body). Código HTTP: ' . $httpCode]);
} else {
    // Retornar a mesma resposta da MisticPay
    http_response_code($httpCode);
    echo $response;
}
?>
