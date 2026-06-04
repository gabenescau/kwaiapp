# Webhook Dracofy - Guia Completo

## 🎯 O que é

Endpoint local (e depois na Hostinger) que recebe notificações de pagamento da Zuckpay e registra conversões na plataforma Dracofy automaticamente.

## 📋 Fluxo

```
Zuckpay → Envia webhook → webhook-dracofy.php → Processa pagamento → Registra em JSON → Envia para Dracofy
```

## 🚀 Como usar

### 1️⃣ Localmente (Desenvolvimento)

Inicie um servidor PHP local:

```bash
# Na pasta do projeto
php -S localhost:8000

# Agora o endpoint está em:
# http://localhost:8000/api/webhook-dracofy.php
```

Configure na Zuckpay:
```
Webhook URL: http://localhost:8000/api/webhook-dracofy.php
```

### 2️⃣ Na Hostinger (Produção)

Configure na Zuckpay:
```
Webhook URL: https://storegg.shop/api/webhook-dracofy.php
```

## 🧪 Testando Localmente

### Opção A: Via PHP Script

```bash
php api/test-webhook.php
```

Testa 4 cenários diferentes de webhook.

### Opção B: Via cURL Manual

```bash
# Pagamento confirmado
curl -X POST http://localhost:8000/api/webhook-dracofy.php \
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

### Opção C: Postman

1. Novo request → POST
2. URL: `http://localhost:8000/api/webhook-dracofy.php`
3. Body → raw JSON:
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

## 📊 Monitorar Conversões

### Logs
```
api/logs/webhook_dracofy.log
```

Contém:
- Todos os webhooks recebidos
- Status de processamento
- IDs de requisição para rastreamento
- Erros e respostas da Dracofy

### Pagamentos Confirmados
```
api/logs/payments_confirmed.json
```

Arquivo JSON Lines com cada pagamento confirmado:
```json
{"request_id":"REQ-xxx","transaction_id":"TXN-123","timestamp":"2026-06-03 23:17:16","valor":18.81,"cpf":"12345678901","email":"cliente@email.com","click_id":"fbclid_abc123","dracofy_sent":true,"dracofy_response":null}
```

## 🔍 Campos Reconhecidos

O webhook aceita click_id em qualquer um desses campos:
- `click_id`
- `fbclid`
- `fbc`
- `tracking_id`
- `src`
- `cid`
- `metadata.click_id` (em sub-objeto)
- `metadata.fbclid` (em sub-objeto)

## ⚠️ Status Reconhecidos

Trigger de "Pagamento Confirmado":
- `paid`
- `completed`
- `approved`
- `success`

Outros status:
- `pending` — apenas registra
- `failed`, `expired`, `rejected` — registra como falha

## 🔄 Fluxo Completo de Integração

### Passo 1: User clica em anúncio Meta
```
https://seu-site.com/?fbclid=ABC123
```

### Passo 2: SDK Dracofy captura
```javascript
DTrack.getClickId() // retorna "ABC123"
```

### Passo 3: User gera PIX
API Zuckpay envia com `click_id`:
```json
{
  "nome": "João",
  "cpf": "12345678901",
  "valor": 18.81,
  "email": "joao@email.com",
  "telefone": "11999999999",
  "click_id": "ABC123"
}
```

### Passo 4: User paga PIX
Zuckpay confirma pagamento

### Passo 5: Zuckpay envia webhook
```json
{
  "status": "paid",
  "transaction_id": "TXN-12345",
  "valor": 18.81,
  "cpf": "12345678901",
  "email": "joao@email.com",
  "click_id": "ABC123"
}
```

### Passo 6: webhook-dracofy.php processa
1. ✅ Recebe webhook
2. ✅ Valida status = "paid"
3. ✅ Extrai click_id
4. ✅ Registra em `payments_confirmed.json`
5. ✅ Envia para Dracofy API

### Passo 7: Dracofy envia para Meta
Meta Ads recebe conversão com fbclid correto

### Passo 8: Atribuição automática ✓
Meta atribui venda ao anúncio certo!

## 🐛 Troubleshooting

### "Webhook não está sendo recebido"
1. Confirmar URL está correta em Zuckpay
2. Verificar se servidor local está rodando: `php -S localhost:8000`
3. Testar manualmente: `curl http://localhost:8000/api/webhook-dracofy.php`

### "Click_id não está sendo capturado"
1. Verificar se vem no webhook da Zuckpay
2. Pode estar em campo diferente (metadata, sub-objeto)
3. Registra aviso no log: "Pagamento confirmado mas SEM click_id!"

### "Dracofy não reconheceu conversão"
1. Verificar logs para ver HTTP response
2. Token Dracofy correto? `pt_573ba9538400847413cf85265a750c61`
3. Verificar no painel Dracofy se webhook foi recebido

### "Arquivo JSON está vazio"
Normal se nenhum pagamento foi confirmado. Será criado com primeiro pagamento confirmado.

## 📁 Estrutura de Arquivos

```
api/
├── webhook-dracofy.php          ← Endpoint principal
├── test-webhook.php             ← Script de teste
├── logs/                         ← Criado automaticamente
│   ├── webhook_dracofy.log      ← Log de requisições
│   └── payments_confirmed.json   ← Pagamentos confirmados
└── README_WEBHOOK.md            ← Este arquivo
```

## 🔐 Segurança (Produção)

Quando subir para Hostinger:

1. **Validar origem do webhook**
```php
// IP da Zuckpay (obter na doc deles)
$zuckpay_ip = '...';
if ($_SERVER['REMOTE_ADDR'] !== $zuckpay_ip) {
    http_response_code(403);
    exit('Acesso negado');
}
```

2. **Validar assinatura HMAC** (se Zuckpay oferece)
```php
$signature = $_SERVER['HTTP_X_SIGNATURE'] ?? '';
$calculated = hash_hmac('sha256', $input, $SECRET_KEY);
if (!hash_equals($signature, $calculated)) {
    http_response_code(401);
    exit('Assinatura inválida');
}
```

3. **HTTPS obrigatório**
- ✅ Hostinger oferece SSL
- Zuckpay deve enviar apenas para HTTPS

4. **Rate limiting** (se necessário)
```php
$redis->incr("webhook:{$request_id}");
$redis->expire("webhook:{$request_id}", 60);
```

## 📞 Próximos Passos

1. ✅ Webhook endpoint criado e testado
2. ⬜ Configurar URL na Zuckpay
3. ⬜ Testar com pagamento real
4. ⬜ Monitorar logs por 24h
5. ⬜ Adicionar validação de segurança se necessário

---

**Status:** ✅ Pronto para desenvolvimento e produção
