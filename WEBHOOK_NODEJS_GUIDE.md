# 🚀 Webhook Dracofy - Guia de Uso

## ✅ O que foi criado

### 1. **server.js** — Servidor Node.js/Express
- Recebe webhooks da Zuckpay
- Processa pagamentos confirmados
- Envia conversões para Dracofy automaticamente
- Logs detalhados em `api/logs/`
- 3 rotas: webhook principal, status, teste

### 2. **test-webhook-js.js** — Script de testes
- Testa 4 cenários diferentes
- Simula pagamentos confirmados, pendentes e falhados
- Verifica se servidor está respondendo

### 3. **Documentação**
- `README_WEBHOOK_JS.md` — Guia completo

---

## 🎯 Começar Rápido (5 min)

### Passo 1: Instalar dependências
```bash
npm install
```

### Passo 2: Iniciar servidor
```bash
npm start
```

Saída:
```
✅ Rodando em: http://localhost:3000
📝 Webhook: POST /api/webhook-dracofy
🧪 Teste: POST /api/test
```

### Passo 3: Testar webhook
```bash
node test-webhook-js.js
```

Resultado:
```
✅ Pagamento confirmado COM click_id
✓ HTTP 200
⏳ PIX Pendente
✓ HTTP 200
❌ Pagamento falhou
✓ HTTP 200

✅ Testes Concluídos
📂 Logs: ./api/logs/webhook_dracofy.log
```

### Passo 4: Monitorar conversões
Abra: `api/logs/webhook_dracofy.log`

---

## 📝 Configurar na Zuckpay

Copie a URL do webhook para configurar:

**Desenvolvimento:**
```
http://localhost:3000/api/webhook-dracofy
```

**Produção (Hostinger):**
```
https://storegg.shop/api/webhook-dracofy
```

---

## 🧪 Testar Manualmente

### cURL
```bash
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

### JavaScript (navegador)
```javascript
fetch('http://localhost:3000/api/webhook-dracofy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'paid',
    transaction_id: 'TXN-123456',
    valor: 18.81,
    click_id: 'fbclid_abc123'
  })
}).then(r => r.json()).then(console.log);
```

---

## 📂 Estrutura

```
.
├── server.js                    ← Servidor principal
├── test-webhook-js.js           ← Testes
├── package.json                 ← Dependências
├── README_WEBHOOK_JS.md         ← Documentação
└── api/
    └── logs/                    ← Criado automaticamente
        ├── webhook_dracofy.log  ← Logs de requisições
        └── payments_confirmed.jsonl ← Pagamentos
```

---

## 🔍 Logs

### webhook_dracofy.log
```
[03/06/2026 23:20:15] [REQ-xxx] Webhook recebido
[03/06/2026 23:20:15] [REQ-xxx] ✅ Pagamento confirmado: TXN-123 - R$ 18.81
[03/06/2026 23:20:15] [REQ-xxx] Dracofy notificado (HTTP 200)
```

### payments_confirmed.jsonl
```json
{"request_id":"REQ-xxx","transaction_id":"TXN-123","valor":18.81,"click_id":"fbclid_abc123","dracofy_sent":true}
```

---

## 🚀 Deploy na Hostinger

### Se suportam Node.js:
1. Upload: `server.js`, `package.json`
2. Instalar: `npm install --production`
3. Iniciar: `npm start`
4. Webhook URL: `https://storegg.shop/api/webhook-dracofy`

### Se NÃO suportam Node.js:
Use `api/zuckpay_pix.php` como fallback

---

## 📞 Próximos Passos

1. ✅ Servidor criado
2. ✅ Testes funcionando
3. ⬜ Configurar Zuckpay
4. ⬜ Testar com pagamento real
5. ⬜ Deploy na Hostinger
6. ⬜ Monitorar conversões

---

## 💡 Dicas

- **Para de rodar o servidor:** `Ctrl+C`
- **Ver status:** `GET http://localhost:3000/api/status`
- **Testar sem Zuckpay:** `POST http://localhost:3000/api/test`
- **Logs em tempo real:** `tail -f api/logs/webhook_dracofy.log`

---

✅ **Status:** Pronto para uso!
