<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

class ZuckpayPIX {
    private $apiUrl = 'https://zuckpay.com.br/conta/v3/pix/qrcode';
    private $clientId;
    private $clientSecret;
    
    public function __construct($clientId, $clientSecret) {
        $this->clientId = $clientId;
        $this->clientSecret = $clientSecret;
    }
    
    public function generateQRCode($data) {
        // Adicionar credenciais ao payload também (como fallback)
        $data['client_id'] = $this->clientId;
        $data['client_secret'] = $this->clientSecret;
        
        $payload = json_encode($data);
        
        // Debug: log credenciais
        error_log("[Zuckpay] Enviando com client_id: " . substr($this->clientId, 0, 10) . "***");
        error_log("[Zuckpay] Payload: " . substr($payload, 0, 300));
        
        // Calcular Basic Auth
        $basicAuth = base64_encode("{$this->clientId}:{$this->clientSecret}");
        
        $ch = curl_init($this->apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Basic ' . $basicAuth,
            'User-Agent: ZuckpayPHP/1.0'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        $headersSent = curl_getinfo($ch, CURLINFO_HEADER_OUT);
        curl_close($ch);
        
        error_log("[Zuckpay] HTTP Response Code: $httpCode");
        error_log("[Zuckpay] Headers Sent: " . $headersSent);
        error_log("[Zuckpay] Response: " . $response);
        
        if ($error) {
            return [
                'success' => false,
                'error' => 'Erro na requisição: ' . $error,
                'http_code' => $httpCode
            ];
        }
        
        $result = json_decode($response, true);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            return [
                'success' => true,
                'data' => $result,
                'http_code' => $httpCode
            ];
        } else {
            return [
                'success' => false,
                'error' => $result['message'] ?? 'Erro ao gerar PIX',
                'details' => $result,
                'http_code' => $httpCode
            ];
        }
    }
    
    public function validatePayload($payload) {
        $required = ['nome', 'cpf', 'valor', 'email', 'telefone'];
        $missing = [];
        
        foreach ($required as $field) {
            if (empty($payload[$field])) {
                $missing[] = $field;
            }
        }
        
        if (!empty($missing)) {
            return [
                'valid' => false,
                'error' => 'Campos obrigatórios faltando: ' . implode(', ', $missing)
            ];
        }
        
        if (!filter_var($payload['email'], FILTER_VALIDATE_EMAIL)) {
            return [
                'valid' => false,
                'error' => 'Email inválido'
            ];
        }
        
        if (!preg_match('/^\d{11}$/', str_replace(['.', '-'], '', $payload['cpf']))) {
            return [
                'valid' => false,
                'error' => 'CPF inválido (deve ter 11 dígitos)'
            ];
        }
        
        // Validar telefone (aceita 10-11 dígitos ou 13 com DDI 55)
        $telefone_limpo = preg_replace('/[^\d]/', '', $payload['telefone']);
        if (!preg_match('/^(\d{10,11}|55\d{10,11})$/', $telefone_limpo)) {
            return [
                'valid' => false,
                'error' => 'Telefone inválido (use DDD + número ou DDI 55 + DDD + número)'
            ];
        }
        
        if (!is_numeric($payload['valor']) || $payload['valor'] <= 0) {
            return [
                'valid' => false,
                'error' => 'Valor deve ser um número maior que 0'
            ];
        }
        
        return ['valid' => true];
    }
}

// ===================== CONFIGURAÇÃO =====================
// Credenciais Zuckpay
$CLIENT_ID = 'gabenescau_8306189947';
$CLIENT_SECRET = '50c2cc30d4be1392f42981f149ff9b0feb7b8c8c503908122d9e0c3f6c869fc2';

// URL do webhook para notificações (altere conforme necessário)
$WEBHOOK_URL = 'https://' . $_SERVER['HTTP_HOST'] . '/api/webhook_zuckpay.php';

// ========================================================

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Dados JSON inválidos'
        ]);
        exit;
    }
    
    $zuckpay = new ZuckpayPIX($CLIENT_ID, $CLIENT_SECRET);
    
    // Validar dados
    $validation = $zuckpay->validatePayload($input);
    if (!$validation['valid']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $validation['error']
        ]);
        exit;
    }
    
    // Preparar payload
    $payload = [
        'nome' => $input['nome'],
        'cpf' => preg_replace('/[^0-9]/', '', $input['cpf']),
        'valor' => (float)$input['valor'],
        'email' => $input['email'],
        'telefone' => preg_replace('/[^0-9]/', '', $input['telefone']),
        'urlnoty' => $input['urlnoty'] ?? $WEBHOOK_URL
    ];
    
    // Adicionar parâmetros opcionais se fornecidos
    if (!empty($input['product_id'])) {
        $payload['product_id'] = $input['product_id'];
    }
    
    if (!empty($input['utm_source'])) {
        $payload['utm_source'] = $input['utm_source'];
    }
    if (!empty($input['utm_campaign'])) {
        $payload['utm_campaign'] = $input['utm_campaign'];
    }
    if (!empty($input['utm_medium'])) {
        $payload['utm_medium'] = $input['utm_medium'];
    }
    if (!empty($input['utm_content'])) {
        $payload['utm_content'] = $input['utm_content'];
    }
    if (!empty($input['fbc'])) {
        $payload['fbc'] = $input['fbc'];
    }
    if (!empty($input['fbp'])) {
        $payload['fbp'] = $input['fbp'];
    }
    if (!empty($input['gclid'])) {
        $payload['gclid'] = $input['gclid'];
    }
    if (!empty($input['ttclid'])) {
        $payload['ttclid'] = $input['ttclid'];
    }
    if (!empty($input['click_id'])) {
        $payload['click_id'] = $input['click_id'];
    }
    
    // Gerar QR Code
    $response = $zuckpay->generateQRCode($payload);
    
    if ($response['success']) {
        http_response_code(200);
    } else {
        http_response_code(400);
    }
    
    echo json_encode($response);
    exit;
}

// GET - Informações e teste
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => true,
        'message' => 'API Zuckpay PIX/QR Code ativa',
        'version' => '1.0',
        'endpoint' => '/api/zuckpay_pix.php',
        'method' => 'POST',
        'required_fields' => ['nome', 'cpf', 'valor', 'email', 'telefone'],
        'optional_fields' => [
            'product_id',
            'utm_source',
            'utm_campaign',
            'utm_medium',
            'utm_content',
            'fbc',
            'fbp',
            'gclid',
            'ttclid',
            'click_id',
            'urlnoty'
        ],
        'example' => [
            'nome' => 'Marcos Vinicius',
            'cpf' => '12345678901',
            'valor' => 47.50,
            'email' => 'cliente@email.com',
            'telefone' => '11999998888',
            'utm_source' => 'facebook',
            'utm_campaign' => 'campanha-maio'
        ]
    ]);
    exit;
}

http_response_code(405);
echo json_encode([
    'success' => false,
    'error' => 'Método não permitido'
]);
?>
