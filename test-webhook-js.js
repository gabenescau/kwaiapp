/**
 * test-webhook-js.js — Testa webhook Dracofy em JavaScript/Node.js
 * 
 * Uso:
 * node test-webhook-js.js
 */

const PORT = 3000;
const WEBHOOK_URL = `http://localhost:${PORT}/api/webhook-dracofy`;

// Casos de teste
const testCases = [
  {
    name: '✅ Pagamento confirmado COM click_id',
    data: {
      status: 'paid',
      transaction_id: `TXN-${Date.now()}`,
      valor: 18.81,
      cpf: '12345678901',
      email: 'teste@email.com',
      click_id: 'fbclid_abc123xyz',
      fbclid: 'fbclid_abc123xyz'
    }
  },
  {
    name: '⚠️ Pagamento confirmado SEM click_id',
    data: {
      status: 'paid',
      transaction_id: `TXN-${Date.now()}`,
      valor: 18.81,
      cpf: '12345678901',
      email: 'teste2@email.com'
    }
  },
  {
    name: '⏳ Pagamento pendente',
    data: {
      status: 'pending',
      transaction_id: `TXN-${Date.now()}`,
      valor: 18.81
    }
  },
  {
    name: '❌ Pagamento falhou',
    data: {
      status: 'failed',
      transaction_id: `TXN-${Date.now()}`,
      valor: 18.81
    }
  }
];

// Função para fazer requisição
async function testarWebhook(testCase) {
  try {
    console.log(`\n📝 ${testCase.name}`);
    console.log(`   Dados: ${JSON.stringify(testCase.data)}`);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCase.data)
    });

    const json = await response.json();
    console.log(`   ✓ HTTP ${response.status}`);
    console.log(`   Response: ${JSON.stringify(json).substring(0, 120)}...`);
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
}

// Executar testes
async function executarTestes() {
  console.log(`
╔════════════════════════════════════════╗
║     🧪 Teste de Webhook Dracofy       ║
╚════════════════════════════════════════╝
  `);

  // Verificar se servidor está rodando
  try {
    const statusResponse = await fetch(`http://localhost:${PORT}/api/status`);
    if (!statusResponse.ok) throw new Error('Servidor não respondeu');
  } catch (error) {
    console.error(`\n❌ Erro: Servidor não está rodando!`);
    console.error(`\nInicie com: npm start`);
    console.error(`Ou: node server.js\n`);
    process.exit(1);
  }

  // Executar casos de teste
  for (const testCase of testCases) {
    await testarWebhook(testCase);
    // Pequeno delay entre requisições
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`
╔════════════════════════════════════════╗
║            ✅ Testes Concluídos       ║
╠════════════════════════════════════════╣
║ 📂 Logs: ./api/logs/webhook_dracofy.log
║ 💾 Pagamentos: ./api/logs/payments_confirmed.jsonl
╚════════════════════════════════════════╝
  `);
}

// Executar
executarTestes().catch(console.error);
