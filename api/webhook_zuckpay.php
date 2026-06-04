<?php
/*
 * WEBHOOK - Recebe notificações de pagamento da Zuckpay
 * Este arquivo recebe as notificações quando um PIX é confirmado
 */

header('Content-Type: application/json; charset=utf-8');

// Log para debug (remova em produção ou ajuste permissões)
$logFile = __DIR__ . '/logs/zuckpay_webhook.log';
if (!is_dir(__DIR__ . '/logs')) {
    mkdir(__DIR__ . '/logs', 0755, true);
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$timestamp = date('Y-m-d H:i:s');
$logMessage = "[$timestamp] " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
file_put_contents($logFile, $logMessage, FILE_APPEND);

// Exemplo de processamento
if (!empty($data['status'])) {
    switch ($data['status']) {
        case 'paid':
        case 'completed':
            // Pagamento confirmado
            // Aqui você pode:
            // - Atualizar banco de dados
            // - Enviar email de confirmação
            // - Ativar acesso ao produto
            error_log("PIX confirmado: " . json_encode($data));
            break;
            
        case 'pending':
            // Aguardando pagamento
            error_log("PIX pendente: " . json_encode($data));
            break;
            
        case 'failed':
            // Pagamento falhou
            error_log("PIX falhou: " . json_encode($data));
            break;
    }
}

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Webhook recebido com sucesso'
]);
?>
