<?php
/**
 * pix-proxy.php — Proxy para API Buckpay (realtechdev.com.br)
 *
 * Garante que os headers obrigatórios (Authorization + User-Agent)
 * sejam enviados ao servidor da Buckpay, contornando a restrição CORS
 * que impede chamadas diretas do browser.
 *
 * Payload esperado do frontend:
 * {
 *   "external_id": "KW-...",
 *   "payment_method": "pix",
 *   "amount": 1881,
 *   "buyer": {
 *     "name":     "...",
 *     "email":    "...",
 *     "document": "...",   ← CPF (somente dígitos)
 *     "phone":    "..."    ← Telefone ou chave PIX
 *   }
 * }
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, User-Agent");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

/* Preflight CORS */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido.']);
    exit;
}

/* ── Credenciais da API ─────────────────────────────────────────── */
define('BUCKPAY_URL',        'https://api.realtechdev.com.br/v1/transactions');
define('BUCKPAY_TOKEN',      'sk_live_c6c14bb3979fb9e0223ba541ef0f9503');
define('BUCKPAY_USER_AGENT', 'Buckpay API');   // OBRIGATÓRIO — AWS bloqueia sem isso

/* ── Lê o corpo da requisição ───────────────────────────────────── */
$raw = file_get_contents('php://input');

if (empty(trim($raw))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Corpo da requisição vazio.']);
    exit;
}

$input = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'JSON inválido: ' . json_last_error_msg()]);
    exit;
}

/* ── Monta payload para a Buckpay ───────────────────────────────── */

// Gera external_id se o frontend não enviou
$externalId = !empty($input['external_id'])
    ? $input['external_id']
    : 'KW-' . strtoupper(uniqid());

// Valor sempre 1881 centavos (R$ 18,81); aceita override do frontend
$amount = isset($input['amount']) ? intval($input['amount']) : 1881;

// Dados do comprador
$buyer = $input['buyer'] ?? [];
$nome     = trim($buyer['name']     ?? 'Cliente Kwai');
$email    = trim($buyer['email']    ?? 'cliente@kwai.com');
$document = preg_replace('/\D/', '', $buyer['document'] ?? '00000000191');
$phone    = preg_replace('/\D/', '', $buyer['phone']    ?? '11999999999');

// Garante CPF com 11 dígitos
if (strlen($document) !== 11) {
    $document = '00000000191';
}

// Garante telefone mínimo
if (strlen($phone) < 8) {
    $phone = '11999999999';
}

$payload = json_encode([
    'external_id'    => $externalId,
    'payment_method' => 'pix',
    'amount'         => $amount,
    'buyer'          => [
        'name'     => $nome,
        'email'    => $email,
        'document' => $document,
        'phone'    => $phone
    ]
], JSON_UNESCAPED_UNICODE);

/* ── Executa a requisição cURL ──────────────────────────────────── */
$ch = curl_init(BUCKPAY_URL);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . BUCKPAY_TOKEN,
        'User-Agent: '           . BUCKPAY_USER_AGENT,  // ← crítico para a AWS
    ],
    CURLOPT_SSL_VERIFYPEER => true,    // produção: verificação SSL ativa
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

/* ── Tratamento de falha cURL ───────────────────────────────────── */
if ($response === false || !empty($curlErr)) {
    http_response_code(502);
    $log = [
        'time'      => date('Y-m-d H:i:s'),
        'curl_error'=> $curlErr,
        'payload'   => $payload
    ];
    file_put_contents(__DIR__ . '/pix-debug.log', json_encode($log, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);
    echo json_encode([
        'success' => false,
        'error'   => 'Falha ao conectar com o servidor de pagamentos. Tente novamente.'
    ]);
    exit;
}

/* ── Log de erros HTTP (4xx / 5xx) ─────────────────────────────── */
if ($httpCode < 200 || $httpCode >= 300) {
    $log = [
        'time'      => date('Y-m-d H:i:s'),
        'http_code' => $httpCode,
        'payload'   => $payload,
        'response'  => $response
    ];
    file_put_contents(__DIR__ . '/pix-debug.log', json_encode($log, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);
}

/* ── Repassa a resposta intacta ao frontend ─────────────────────── */
http_response_code($httpCode);
echo $response;
