# Webhook Dracofy em Node.js/JavaScript

## 🎯 O que é

Servidor Node.js com Express que recebe webhooks da Zuckpay e registra conversões na Dracofy automaticamente.

## 📋 Fluxo

```
Zuckpay → POST /api/webhook-dracofy → Processa → Registra em JSONL → Envia para Dracofy
```

## 🚀 Instalação e Uso

### 1️⃣ Instalar dependências

```bash
npm install
```

Ou se preferir apenas as essenciais:
```bash
npm install express cors body-parser
```

### 2️⃣ Iniciar servidor localmente

```bash
npm start
# ou
node server.js
```

Saída esperada:
```
╔════════════════════════════════════════╗
║     🚀 Servidor Dracofy Webhook       ║
╠════════════════════════════════════════╣
║ ✅ Rodando em: http://localhost:3000
║ 📝 Webhook: POST /api/webhook-dracofy
║ 🧪 Teste: POST /api/test
║ 📊 Status: GET /api/status
║ 📂 Logs: ./api/logs/
╚════════════════════════════════════════╝
```

### 3️⃣ Configurar na Zuckpay

**Desenvolvimento (local):**
```
http://localhost:3000/api/webhook-dracofy
```

**Produção (Hostinger):**
```
https://storegg.shop/api/webhook-dracofy
```

## 🧪 Testando

### Opção A: Script automático

```bash
node test-webhook-js.js
```

Testa 4 cenários diferentes.

### Opção B: cURL Manual

```bash
# Pagamento confirmado
curl -X POST http://localhost:3000/api/webhook-dracofy \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid",
    "transaction_id": "TXN-123456",
    "valor": 18.81,
    "cpf": "12345678901",
    "email": "cliente@email.com",
    "click_id": "fbclid_abc123"
  }'
```

### Opção C: Endpoint de teste integrado

```bash
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"status": "paid", "valor": 18.81}'
```

### Opção D: JavaScript no navegador

```javascript
fetch('http://localhost:3000/api/webhook-dracofy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'paid',
    transaction_id: 'TXN-123456',
    valor: 18.81,
    cpf: '12345678901',
    email: 'cliente@email.com',
    click_id: 'fbclid_abc123'
  })
})
.then(r => r.json())
.then(console.log);
```

## 📊 Monitorar Conversões

### Logs completos
```
api/logs/webhook_dracofy.log
```

Exemplo:
```
[03/06/2026 23:20:15] [REQ-1717527615123-abc123] Webhook recebido de 127.0.0.1
[03/06/2026 23:20:15] [REQ-1717527615123-abc123] Dados: {"status":"paid",...}
[03/06/2026 23:20:15] [REQ-1717527615123-abc123] ✅ Pagamento confirmado: TXN-123456 - R$ 18.81
[03/06/2026 23:20:15] [REQ-1717527615123-abc123] Dracofy notificado (HTTP 200): {...}
```

### Pagamentos confirmados
```
api/logs/payments_confirmed.jsonl
```

Exemplo (cada linha é um JSON):
```json
{"request_id":"REQ-xxx","transaction_id":"TXN-123","timestamp":"03/06/2026 23:20:15","valor":18.81,"cpf":"12345678901","email":"cliente@email.com","click_id":"fbclid_abc123","dracofy_sent":true}
```

## 🔍 Rotas Disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Info do servidor |
| GET | `/api/status` | Status e uptime |
| POST | `/api/webhook-dracofy` | **Webhook principal** |
| POST | `/api/test` | Testa webhook com dados simulados |

## 📝 Estrutura de Webhook

### Request (entrada)
```json
{
  "status": "paid",
  "transaction_id": "TXN-123456",
  "valor": 18.81,
  "cpf": "12345678901",
  "email": "cliente@email.com",
  "click_id": "fbclid_abc123"
}
```

### Response (saída imediata)
```json
{
  "success": true,
  "message": "Webhook recebido",
  "request_id": "REQ-1717527615123-abc123",
  "timestamp": "03/06/2026 23:20:15"
}
```

## 🔄 Fluxo Completo de Integração

```
1. User clica anúncio Meta
   └─ URL: https://site.com/?fbclid=ABC123

2. SDK Dracofy captura
   └─ DTrack.getClickId() = "ABC123"

3. User gera PIX
   └─ API Zuckpay recebe click_id

4. User paga PIX
   └─ Zuckpay confirma pagamento

5. Zuckpay envia webhook
   └─ POST http://localhost:3000/api/webhook-dracofy
   └─ Body: { status: "paid", click_id: "ABC123", ... }

6. webhook-dracofy.js processa
   ├─ ✅ Valida status = "paid"
   ├─ ✅ Extrai click_id
   ├─ ✅ Registra em payments_confirmed.jsonl
   └─ ✅ Envia para Dracofy API

7. Dracofy envia para Meta
   └─ Registra conversão com fbclid

8. Meta Ads atribui venda ✓
```

## 🔐 Variáveis de Ambiente

Você pode customizar com env vars:

```bash
# No Linux/Mac
export PORT=3000
export DRACOFY_TOKEN=pt_573ba9538400847413cf85265a750c61
npm start

# No Windows
set PORT=3000
node server.js
```

Ou criar arquivo `.env`:
```
PORT=3000
DRACOFY_TOKEN=pt_573ba9538400847413cf85265a750c61
```

## 📦 Estrutura de Arquivos

```
.
├── server.js                          ← Servidor principal
├── test-webhook-js.js                 ← Script de teste
├── package.json                       ← Dependências Node
└── api/
    └── logs/                          ← Criado automaticamente
        ├── webhook_dracofy.log        ← Log de requisições
        └── payments_confirmed.jsonl   ← Pagamentos confirmados
```

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
npm install
```

### "EADDRINUSE: address already in use :::3000"
Outra aplicação está usando a porta. Opções:
```bash
# Use outra porta
PORT=3001 npm start

# Ou mate o processo anterior
kill -9 $(lsof -t -i:3000)  # Linux/Mac
taskkill /PID <PID> /F      # Windows
```

### "ECONNREFUSED: Connection refused"
Servidor não está rodando. Inicie com:
```bash
npm start
```

### "Webhook recebido mas sem resposta"
Normal! Resposta é imediata (200 OK) mas processamento acontece em background.

### "Click_id não está sendo capturado"
Verificar:
1. Zuckpay está enviando no webhook?
2. Pode estar em campo diferente: `fbclid`, `fbc`, `metadata.click_id`
3. Logs mostrarão: "Pagamento confirmado mas SEM click_id!"

### "Dracofy não reconheceu conversão"
1. Verificar logs para ver resposta HTTP
2. Token correto? `pt_573ba9538400847413cf85265a750c61`
3. Payload está em JSON válido?

## 🚀 Deploy na Hostinger

### Se Hostinger suporta Node.js:

1. **Upload dos arquivos**
   - `server.js`
   - `package.json`

2. **Instalar dependências**
   ```bash
   npm install --production
   ```

3. **Iniciar**
   ```bash
   npm start
   ```

4. **Configurar na Zuckpay**
   ```
   https://storegg.shop/api/webhook-dracofy
   ```

### Se Hostinger NÃO suporta Node.js:

Use a versão PHP em `api/webhook_zuckpay.php` como fallback.

## 📚 Documentação

- **Express.js:** https://expressjs.com
- **Node.js:** https://nodejs.org
- **Dracofy:** https://dracofy.com.br/docs
- **Zuckpay:** https://zuckpay.com.br/docs

## ✅ Próximos Passos

- [x] Servidor Node.js criado
- [x] Endpoints implementados
- [x] Script de teste criado
- [ ] Testar com webhook real
- [ ] Deploy na Hostinger
- [ ] Monitorar conversões

---

**Status:** ✅ Pronto para desenvolvimento e produção
