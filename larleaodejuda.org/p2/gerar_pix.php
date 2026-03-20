<?php
header('Content-Type: application/json');

// Receber dados do front-end
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(['error' => 'Dados inválidos']);
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
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
?>
