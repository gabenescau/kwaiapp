#!/usr/bin/env php
<?php
/**
 * test-webhook.php — Script para testar webhook localmente
 * 
 * Uso:
 * php api/test-webhook.php
 */

echo "🧪 Teste de Webhook Dracofy\n";
echo "===========================\n\n";

// Simular diferentes tipos de pagamentos
$testCases = [
    [
        'name' => 'Pagamento confirmado COM click_id',
        'data' => [
            'status' => 'paid',
            'transaction_id' => 'TXN-' . date('YmdHis'),
            'valor' => 18.81,
            'cpf' => '12345678901',
            'email' => 'teste@email.com',
            'click_id' => 'fbclid_abc123xyz',
            'fbclid' => 'fbclid_abc123xyz'
        ]
    ],
    [
        'name' => 'Pagamento confirmado SEM click_id',
        'data' => [
            'status' => 'paid',
            'transaction_id' => 'TXN-' . date('YmdHis'),
            'valor' => 18.81,
            'cpf' => '12345678901',
            'email' => 'teste2@email.com'
        ]
    ],
    [
        'name' => 'Pagamento pendente',
        'data' => [
            'status' => 'pending',
            'transaction_id' => 'TXN-' . date('YmdHis'),
            'valor' => 18.81
        ]
    ],
    [
        'name' => 'Pagamento falhou',
        'data' => [
            'status' => 'failed',
            'transaction_id' => 'TXN-' . date('YmdHis'),
            'valor' => 18.81
        ]
    ]
];

// Fazer requisições simuladas
foreach ($testCases as $test) {
    echo "Teste: {$test['name']}\n";
    echo "Dados: " . json_encode($test['data']) . "\n";
    
    // Simular POST para webhook
    $ch = curl_init('http://localhost:8000/api/webhook-dracofy.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($test['data']));
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "❌ Erro: $error\n";
    } else {
        echo "✅ HTTP $httpCode\n";
        echo "Resposta: " . substr($response, 0, 150) . "...\n";
    }
    echo "\n";
}

echo "📂 Verificar logs em: api/logs/webhook_dracofy.log\n";
echo "📊 Pagamentos confirmados em: api/logs/payments_confirmed.json\n";
?>
