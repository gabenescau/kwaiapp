/**
 * server.js — Servidor Node.js com webhook para Dracofy
 * 
 * Inicie com: npm start
 * Acesse webhook em: http://localhost:3000/api/webhook-dracofy
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, appendFileSync, writeFileSync } from 'fs';

// Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Criar diretório de logs
const logsDir = join(__dirname, 'api', 'logs');
mkdirSync(logsDir, { recursive: true });

// Configuração
const CONFIG = {
  DRACOFY_TOKEN: 'pt_573ba9538400847413cf85265a750c61',
  DRACOFY_WEBHOOK_URL: 'https://api.dracofy.com.br/webhook/pt_573ba9538400847413cf85265a750c61',
  LOGS_DIR: logsDir
};

// ===== UTILIDADES =====

/**
 * Registra mensagem nos logs
 */
function registrarLog(requestId, mensagem) {
  const timestamp = new Date().toLocaleString('pt-BR');
  const logFile = join(CONFIG.LOGS_DIR, 'webhook_dracofy.log');
  const logMessage = `[${timestamp}] [${requestId}] ${mensagem}\n`;
  appendFileSync(logFile, logMessage);
}

/**
 * Registra pagamento confirmado
 */
function registrarPagamento(pagamento) {
  const paymentsFile = join(CONFIG.LOGS_DIR, 'payments_confirmed.jsonl');
  appendFileSync(paymentsFile, JSON.stringify(pagamento) + '\n');
}

/**
 * Envia dados para Dracofy API
 */
async function enviarParaDracofy(requestId, payload) {
  try {
    const response = await fetch(CONFIG.DRACOFY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    registrarLog(requestId, `Dracofy notificado (HTTP ${response.status}): ${text.substring(0, 200)}`);
    return response.ok;
  } catch (error) {
    registrarLog(requestId, `ERRO ao enviar para Dracofy: ${error.message}`);
    return false;
  }
}

/**
 * Extrai click_id de vários campos possíveis
 */
function extrairClickId(data) {
  return (
    data.click_id ||
    data.fbclid ||
    data.fbc ||
    data.tracking_id ||
    data.src ||
    data.cid ||
    (data.metadata?.click_id) ||
    (data.metadata?.fbclid) ||
    null
  );
}

// ===== ROTAS =====

/**
 * Health check
 */
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor Dracofy webhook rodando',
    endpoints: {
      webhook: 'POST /api/webhook-dracofy',
      status: 'GET /api/status',
      test: 'POST /api/test'
    }
  });
});

/**
 * Status do servidor
 */
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    dracofy_token: CONFIG.DRACOFY_TOKEN.substring(0, 10) + '***'
  });
});

/**
 * WEBHOOK PRINCIPAL - Recebe pagamentos da Zuckpay
 */
app.post('/api/webhook-dracofy', async (req, res) => {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const timestamp = new Date().toLocaleString('pt-BR');
  
  // Log de entrada
  registrarLog(requestId, `Webhook recebido de ${req.ip}`);
  registrarLog(requestId, `Dados: ${JSON.stringify(req.body)}`);

  // Resposta imediata (não espera processamento)
  res.status(200).json({
    success: true,
    message: 'Webhook recebido',
    request_id: requestId,
    timestamp
  });

  // Processar em background
  (async () => {
    const data = req.body || {};

    if (!Object.keys(data).length) {
      registrarLog(requestId, 'AVISO: Webhook vazio recebido');
      return;
    }

    const status = (data.status || '').toLowerCase();
    const transactionId = data.transaction_id || data.id || 'SEM_ID';
    const valor = data.valor || 0;
    const cpf = data.cpf || '';
    const email = data.email || '';
    const clickId = extrairClickId(data);

    // Processar baseado no status
    switch (status) {
      case 'paid':
      case 'completed':
      case 'approved':
      case 'success':
        registrarLog(requestId, `✅ Pagamento confirmado: ${transactionId} - R$ ${valor}`);

        // Registrar pagamento
        const paymentRecord = {
          request_id: requestId,
          transaction_id: transactionId,
          timestamp,
          valor,
          cpf,
          email,
          click_id: clickId,
          dracofy_sent: false
        };
        registrarPagamento(paymentRecord);

        // Enviar para Dracofy se houver click_id
        if (clickId) {
          const sent = await enviarParaDracofy(requestId, {
            status: 'paid',
            transaction_id: transactionId,
            valor,
            cpf,
            email,
            click_id: clickId,
            fbclid: clickId
          });
          paymentRecord.dracofy_sent = sent;
        } else {
          registrarLog(requestId, '⚠️ Pagamento confirmado mas SEM click_id! Conversão não será atribuída.');
        }
        break;

      case 'pending':
        registrarLog(requestId, `⏳ PIX Pendente: ${transactionId}`);
        break;

      case 'failed':
      case 'expired':
      case 'rejected':
        registrarLog(requestId, `❌ PIX Falhou: ${transactionId} - Status: ${status}`);
        break;

      default:
        registrarLog(requestId, `❓ Status desconhecido: ${status}`);
    }
  })();
});

/**
 * TESTE - Simula webhook para testar
 */
app.post('/api/test', async (req, res) => {
  const testData = req.body || {
    status: 'paid',
    transaction_id: `TEST-${Date.now()}`,
    valor: 18.81,
    cpf: '12345678901',
    email: 'teste@email.com',
    click_id: `fbclid_${Date.now()}`
  };

  // Fazer POST para si mesmo
  try {
    const response = await fetch(`http://localhost:${PORT}/api/webhook-dracofy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const json = await response.json();
    res.json({
      message: 'Webhook de teste disparado',
      data: testData,
      response: json
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      data: testData
    });
  }
});

/**
 * Log de requisições (debug)
 */
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString('pt-BR');
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ===== INICIAR SERVIDOR =====

app.listen(PORT, () => {
  const timestamp = new Date().toLocaleString('pt-BR');
  console.log(`
╔════════════════════════════════════════╗
║     🚀 Servidor Dracofy Webhook       ║
╠════════════════════════════════════════╣
║ ✅ Rodando em: http://localhost:${PORT}
║ 📝 Webhook: POST /api/webhook-dracofy
║ 🧪 Teste: POST /api/test
║ 📊 Status: GET /api/status
║ 📂 Logs: ./api/logs/
╠════════════════════════════════════════╣
║ [${timestamp}]
╚════════════════════════════════════════╝
  `);

  // Log inicial
  registrarLog('INIT', `Servidor iniciado na porta ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  registrarLog('SHUTDOWN', 'Servidor encerrado');
  process.exit(0);
});
