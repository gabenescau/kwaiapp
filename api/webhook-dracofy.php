<?php
/**
 * WEBHOOK DRACOFY - Endpoint local para receber pagamentos Zuckpay
 * 
 * URL para configurar na Zuckpay:
 * Desenvolvimento: http://localhost:8000/api/webhook-dracofy.php (use php -S localhost:8000)
 * Produção: https://storegg.shop/api/webhook-dracofy.php
 * 
 * Este endpoint:
 * 1. Recebe webhook da Zuckpay com dados do pagamento
 * 2. Processa e valida os dados
 * 3. Registra conversão localmente e/ou envia para Dracofy
 */

header('Content-Type: application/json; charset=utf-8');
http_response_code(200);

// ===== CONFIGURAÇÃO =====
$DRACOFY_TOKEN = 'pt_573ba9538400847413cf85265a750c61';
$DRACOFY_WEBHOOK_URL = 'https://api.dracofy.com.br/webhook/' . $DRACOFY_TOKEN;
$LOG_DIR = __DIR__ . '/logs';

// Criar diretório de logs se não existir
if (!is_dir($LOG_DIR)) {
    mkdir($LOG_DIR, 0755, true);
}

// ===== RECEBER DADOS =====
$input = file_get_contents('php://input');
$data = json_decode($input, true) ?: $_POST;

$timestamp = date('Y-m-d H:i:s');
$requestId = uniqid('REQ-');

// ===== LOGGING =====
$logFile = $LOG_DIR . '/webhook_dracofy.log';
$logMessage = "[{$timestamp}] [{$requestId}] Webhook recebido\n";
$logMessage .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
$logMessage .= "Método: " . $_SERVER['REQUEST_METHOD'] . "\n";
$logMessage .= "Dados: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
$logMessage .= "---\n";
file_put_contents($logFile, $logMessage, FILE_APPEND);

// ===== RESPOSTA IMEDIATA =====
$response = [
    'success' => true,
    'message' => 'Webhook recebido',
    'request_id' => $requestId,
    'timestamp' => $timestamp
];

// ===== PROCESSAR PAGAMENTO =====
if (!empty($data)) {
    $status = strtolower($data['status'] ?? '');
    $transactionId = $data['transaction_id'] ?? $data['id'] ?? 'SEM_ID';
    $valor = $data['valor'] ?? 0;
    $cpf = $data['cpf'] ?? '';
    $email = $data['email'] ?? '';
    
    // Capturar click_id (pode estar em vários campos)
    $clickId = $data['click_id'] 
        ?? $data['fbclid'] 
        ?? $data['fbc'] 
        ?? $data['tracking_id'] 
        ?? $data['src'] 
        ?? $data['cid'] 
        ?? null;

    // Procurar em sub-campos
    if (!$clickId && isset($data['metadata'])) {
        if (is_array($data['metadata'])) {
            $clickId = $data['metadata']['click_id'] ?? $data['metadata']['fbclid'] ?? null;
        }
    }

    // Determinar ação baseado no status
    $statusProcessado = false;
    
    switch ($status) {
        case 'paid':
        case 'completed':
        case 'approved':
        case 'success':
            $statusProcessado = procesarPagamentoConfirmado([
                'transaction_id' => $transactionId,
                'valor' => $valor,
                'cpf' => $cpf,
                'email' => $email,
                'click_id' => $clickId,
                'timestamp' => $timestamp,
                'request_id' => $requestId,
                'full_data' => $data
            ]);
            break;
            
        case 'pending':
            registrarLog($requestId, "PIX PENDENTE: $transactionId - Aguardando confirmação");
            break;
            
        case 'failed':
        case 'expired':
        case 'rejected':
            registrarLog($requestId, "PIX FALHOU: $transactionId - Status: $status");
            break;
            
        default:
            registrarLog($requestId, "Status desconhecido: $status");
    }
    
    $response['status_processado'] = $statusProcessado;
}

// Retornar resposta
echo json_encode($response);
exit;

// ===== FUNÇÕES =====

/**
 * Processa pagamento confirmado
 * Registra localmente e opcionalmente envia para Dracofy
 */
function procesarPagamentoConfirmado($pagamento) {
    global $DRACOFY_TOKEN, $DRACOFY_WEBHOOK_URL, $LOG_DIR;
    
    $requestId = $pagamento['request_id'];
    $timestamp = $pagamento['timestamp'];
    
    // 1. Registrar localmente em banco de dados/arquivo
    $paymentsFile = $LOG_DIR . '/payments_confirmed.json';
    
    $paymentRecord = [
        'request_id' => $requestId,
        'transaction_id' => $pagamento['transaction_id'],
        'timestamp' => $timestamp,
        'valor' => $pagamento['valor'],
        'cpf' => $pagamento['cpf'],
        'email' => $pagamento['email'],
        'click_id' => $pagamento['click_id'],
        'dracofy_sent' => false,
        'dracofy_response' => null
    ];
    
    // Salvar em JSON Lines para fácil consulta
    file_put_contents($paymentsFile, json_encode($paymentRecord) . "\n", FILE_APPEND);
    
    registrarLog($requestId, "Pagamento confirmado: {$pagamento['transaction_id']} - R$ {$pagamento['valor']}");
    
    // 2. Enviar para Dracofy (opcional)
    $dracofy_sent = false;
    if (!empty($pagamento['click_id'])) {
        $dracofy_sent = enviarParaDracofy($requestId, [
            'status' => 'paid',
            'transaction_id' => $pagamento['transaction_id'],
            'valor' => $pagamento['valor'],
            'cpf' => $pagamento['cpf'],
            'email' => $pagamento['email'],
            'click_id' => $pagamento['click_id'],
            'fbclid' => $pagamento['click_id']
        ]);
    } else {
        registrarLog($requestId, "ATENÇÃO: Pagamento confirmado mas SEM click_id! Conversão não será atribuída.");
    }
    
    return true;
}

/**
 * Envia dados para webhook Dracofy
 */
function enviarParaDracofy($requestId, $payload) {
    global $DRACOFY_WEBHOOK_URL;
    
    $ch = curl_init($DRACOFY_WEBHOOK_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        registrarLog($requestId, "ERRO ao enviar para Dracofy: " . $error);
        return false;
    } else {
        registrarLog($requestId, "Dracofy notificado (HTTP $httpCode): " . substr($response, 0, 200));
        return true;
    }
}

/**
 * Registra mensagens nos logs
 */
function registrarLog($requestId, $mensagem) {
    global $LOG_DIR;
    
    $timestamp = date('Y-m-d H:i:s');
    $logFile = $LOG_DIR . '/webhook_dracofy.log';
    $logMessage = "[{$timestamp}] [{$requestId}] {$mensagem}\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}
?>
