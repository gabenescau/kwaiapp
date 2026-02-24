<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, x-public-key, x-secret-key");
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

// ==========================================================
// CONFIGURAÇÃO — SigiloPay
// ==========================================================
$apiUrl = 'https://app.sigilopay.com.br/api/v1/gateway/pix/receive';
$publicKey = 'raynanbarbosa803_oban2qmhxh3xi2ob';
$secretKey = 'hj3la7a2rpxm43v0pq7d2gorxug9u1srafede9w7vg25yeywyzm6v7baqsarnpto';

/**
 * Gera um UUID v4
 */
function guidv4($data = null)
{
    $data = $data ?? random_bytes(16);
    assert(strlen($data) == 16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

/**
 * Gera um CPF válido (para fallback)
 */
function generateCpf()
{
    $n1 = rand(0, 9);
    $n2 = rand(0, 9);
    $n3 = rand(0, 9);
    $n4 = rand(0, 9);
    $n5 = rand(0, 9);
    $n6 = rand(0, 9);
    $n7 = rand(0, 9);
    $n8 = rand(0, 9);
    $n9 = rand(0, 9);
    $d1 = $n9 * 2 + $n8 * 3 + $n7 * 4 + $n6 * 5 + $n5 * 6 + $n4 * 7 + $n3 * 8 + $n2 * 9 + $n1 * 10;
    $d1 = 11 - ($d1 % 11);
    if ($d1 >= 10)
        $d1 = 0;
    $d2 = $d1 * 2 + $n9 * 3 + $n8 * 4 + $n7 * 5 + $n6 * 6 + $n5 * 7 + $n4 * 8 + $n3 * 9 + $n2 * 10 + $n1 * 11;
    $d2 = 11 - ($d2 % 11);
    if ($d2 >= 10)
        $d2 = 0;
    return "$n1$n2$n3$n4$n5$n6$n7$n8$n9$d1$d2";
}

$input = file_get_contents('php://input');
if (empty($input)) {
    echo json_encode(['success' => false, 'error' => 'Corpo vazio.']);
    exit;
}

$data = json_decode($input, true);
$nome = !empty($data['nome']) ? trim($data['nome']) : 'Cliente';
$email = !empty($data['email']) ? trim($data['email']) : 'email@exemplo.com';
$cpf = !empty($data['cpf']) ? preg_replace('/\D/', '', $data['cpf']) : generateCpf();
$valor = !empty($data['valor']) ? floatval($data['valor']) : 17.97;

if (strlen($cpf) !== 11) {
    $cpf = generateCpf();
}

// Montagem do Payload conforme documentação SigiloPay
$payload = json_encode([
    'identifier' => guidv4(),
    'amount' => $valor,
    'client' => [
        'name' => $nome,
        'email' => $email,
        'phone' => '11999999999', // Telefone obrigatório conforme guia
        'document' => $cpf
    ],
    'products' => [
        [
            'id' => '1',
            'name' => 'Doação',
            'quantity' => 1,
            'price' => $valor
        ]
    ],
    'dueDate' => date('Y-m-d', strtotime('+1 day'))
]);

$ch = curl_init($apiUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-public-key: ' . $publicKey,
        'x-secret-key: ' . $secretKey
    ],
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Salva log para diagnóstico
$logData = [
    'time' => date('Y-m-d H:i:s'),
    'http_code' => $httpCode,
    'curl_error' => $curlError,
    'payload' => $payload,
    'response' => $response
];
file_put_contents(__DIR__ . '/pix-debug.log', json_encode($logData, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);

// Repassa a resposta — No frontend, o PixService vai lidar com o formato
http_response_code($httpCode);
echo $response;
?>