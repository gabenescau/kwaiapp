<?php
/*
 * WEBHOOK - Recebe notificações de pagamento da Zuckpay e registra conversões na Dracofy
 */

header('Content-Type: application/json; charset=utf-8');

// Log para debug
$logFile = __DIR__ . '/logs/zuckpay_webhook.log';
if (!is_dir(__DIR__ . '/logs')) {
    mkdir(__DIR__ . '/logs', 0755, true);
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$timestamp = date('Y-m-d H:i:s');
$logMessage = "[$timestamp] " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
file_put_contents($logFile, $logMessage, FILE_APPEND);

// Token Dracofy
$DRACOFY_TOKEN = 'pt_573ba9538400847413cf85265a750c61';
$DRACOFY_WEBHOOK_URL = 'https://api.dracofy.com.br/webhook/' . $DRACOFY_TOKEN;

// Processamento do webhook
if (!empty($data)) {
    $status = strtolower($data['status'] ?? '');
    $clickId = $data['click_id'] ?? $data['fbclid'] ?? $data['fbc'] ?? null;
    
    switch ($status) {
        case 'paid':
        case 'completed':
        case 'approved':
        case 'success':
            // Pagamento confirmado - Registrar na Dracofy
            error_log("PIX confirmado: " . json_encode($data));
            
            // Preparar dados para Dracofy
            $dracofy_payload = [
                'status' => 'paid',
                'valor' => $data['valor'] ?? 0,
                'transaction_id' => $data['transaction_id'] ?? $data['id'] ?? '',
                'cpf' => $data['cpf'] ?? '',
                'email' => $data['email'] ?? '',
                'timestamp' => $timestamp
            ];
            
            // Adicionar click_id se disponível
            if ($clickId) {
                $dracofy_payload['click_id'] = $clickId;
                $dracofy_payload['fbclid'] = $clickId;
            }
            
            // Enviar para Dracofy
            enviarParaDracofy($DRACOFY_WEBHOOK_URL, $dracofy_payload);
            
            // Disparar evento de conversão no frontend (opcional)
            // Se o usuário ainda está na página, dispara DTrack.event('Purchase', ...)
            break;
            
        case 'pending':
            error_log("PIX pendente: " . json_encode($data));
            break;
            
        case 'failed':
        case 'expired':
            error_log("PIX falhou: " . json_encode($data));
            break;
    }
}

/**
 * Envia dados para webhook da Dracofy
 */
function enviarParaDracofy($url, $payload) {
    $ch = curl_init($url);
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
        error_log("[Dracofy] Erro ao enviar webhook: " . $error);
    } else {
        error_log("[Dracofy] Webhook enviado com sucesso (HTTP $httpCode): " . $response);
    }
}

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Webhook recebido e processado'
]);
?>

