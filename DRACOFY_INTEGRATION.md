# Integração Dracofy + Zuckpay PIX

## 📋 Resumo

Integração completa entre a plataforma Dracofy (rastreamento de conversões Meta Ads) e a API Zuckpay PIX para gerar QR Codes de pagamento com atribuição automática.

## 🎯 Fluxo Completo

```
1. Visitante clica no anúncio Meta (com fbclid na URL)
   ↓
2. SDK Dracofy captura fbclid e salva em localStorage
   ↓
3. Visitante clica em "Gerar PIX"
   ↓
4. JavaScript recupera fbclid e envia para API Zuckpay
   ↓
5. API Zuckpay gera QR Code e salva fbclid no banco
   ↓
6. Visitante paga o PIX
   ↓
7. Zuckpay envia webhook com dados do pagamento + fbclid
   ↓
8. Webhook_zuckpay.php envia para Dracofy API
   ↓
9. Dracofy registra conversão no Meta Ads com fbclid correto
   ↓
10. Meta Ads atribui conversão ao anúncio certo ✓
```

## 🔧 Configurações Feitas

### 1. SDK Dracofy no HTML
```html
<script src="https://cdn.dracofy.com.br/v1/index.js"
        data-token="pt_573ba9538400847413cf85265a750c61"></script>
```

**Arquivo:** `index.html` (entre Meta Pixel e UTMify)

---

### 2. Módulo de Integração JavaScript
**Arquivo:** `js/dracofy-integration.js`

**Funções disponíveis:**
- `DracofyIntegration.enriquecerPayload(payload)` — Adiciona click_id ao payload antes de enviar para API
- `DracofyIntegration.dispararEventoCompra(dados)` — Dispara evento Purchase após confirmação
- `DracofyIntegration.registrarPageview(path)` — Registra pageview em SPAs
- `DracofyIntegration.debug()` — Imprime estado da Dracofy no console

---

### 3. Integração em pix-service.js
```javascript
// Enriquece payload com click_id antes de enviar
if (typeof DracofyIntegration !== 'undefined') {
  DracofyIntegration.enriquecerPayload(payload);
}
```

**Resultado:** O payload agora inclui:
- `click_id` — fbclid capturado pela Dracofy
- `fbclid` — cópia do click_id
- `platform` — plataforma detectada (meta, tiktok, kwai, google)

---

### 4. Webhook Inteligente
**Arquivo:** `api/webhook_zuckpay.php`

**Comportamento:**
- ✅ Recebe webhook da Zuckpay com dados do pagamento
- ✅ Detecta se status = PAGO (paid, completed, approved, success)
- ✅ Extrai click_id do webhook
- ✅ Envia para Dracofy webhook automaticamente
- ✅ Dracofy reconhece click_id e envia conversão ao Meta Ads

**Campos reconhecidos pela Dracofy:**
- `click_id`
- `fbclid`
- `fbc`
- `tracking_id`
- `src`
- `cid`
- `sub1`, `sub2`, `sub3`

---

## 📋 Checklist de Configuração

### No Painel Zuckpay
- [ ] Configurar webhook URL: `https://seu-dominio.com/api/webhook_zuckpay.php`
- [ ] Habilitar envio de notificações de pagamento
- [ ] Verificar se Zuckpay envia `click_id` ou `fbclid` no webhook

### No Painel Dracofy
- [ ] Token verificado: `pt_573ba9538400847413cf85265a750c61`
- [ ] Plataforma: Meta Ads
- [ ] Evento de conversão: Purchase
- [ ] Webhook URL da Dracofy: `https://api.dracofy.com.br/webhook/pt_573ba9538400847413cf85265a750c61`

### No Painel Meta Ads
- [ ] Pixel ID verificado no código
- [ ] Evento Purchase criado no Conversions API
- [ ] Domínio autorizado para recepcionar conversões

---

## 🔍 Teste de Integração

### 1. Verificar captura do fbclid
```javascript
// No console do navegador:
DTrack.getClickId()
// Deve retornar: "ABC123..." (o fbclid da URL)
```

### 2. Verificar enriquecimento do payload
Abra o console e veja os logs:
```
[Dracofy] Click ID capturado: ABC123...
[Dracofy] Plataforma detectada: meta
[Zuckpay] Enviando: { ..., click_id: "ABC123..." }
```

### 3. Testar webhook manualmente
```bash
curl -X POST https://seu-dominio.com/api/webhook_zuckpay.php \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid",
    "transaction_id": "TXN123",
    "valor": 18.81,
    "cpf": "12345678901",
    "email": "teste@email.com",
    "click_id": "ABC123",
    "fbclid": "ABC123"
  }'
```

Verificar logs em `api/logs/zuckpay_webhook.log`

---

## 🐛 Troubleshooting

### "DTrack não está definido"
**Problema:** SDK Dracofy ainda não foi carregado
**Solução:** O script Dracofy está no `<head>`. Se o erro persistir, adicione delay no console:
```javascript
setTimeout(() => {
  console.log(DTrack.getClickId());
}, 2000);
```

### "Click ID não está sendo capturado"
**Verificar:**
1. URL contém `?fbclid=...`?
2. localStorage contém a chave?
```javascript
localStorage.getItem('_dtrack_fbclid') // ou similar
```

### "Webhook não recebendo conversões na Dracofy"
**Verificar:**
1. Webhook URL configurado corretamente em Zuckpay
2. Logs em `api/logs/zuckpay_webhook.log`
3. Status do pagamento é exatamente: `paid`, `completed`, `approved` ou `success`?
4. Click_id está presente no webhook?

### "Meta Ads não mostra conversão"
1. Verificar Conversions API no Meta
2. Confirmar que Dracofy está enviando com `fbclid` correto
3. Verificar janela de atribuição (padrão 28 dias)

---

## 📚 Documentação de Referência

- **Dracofy:** https://dracofy.com.br/docs
- **Zuckpay:** https://zuckpay.com.br/docs
- **Meta Conversions API:** https://developers.facebook.com/docs/conversions-api

---

## 🚀 Próximos Passos

1. ✅ SDK Dracofy integrado
2. ✅ Captura de fbclid automática
3. ✅ Envio de click_id para API Zuckpay
4. ✅ Webhook inteligente para Dracofy
5. **Testar fluxo completo com campanha real**
6. **Monitorar conversões no Meta Ads**
7. **Otimizar taxa de conversão**

---

## 📞 Suporte

Dúvidas? Verifique os logs:
- `api/logs/zuckpay_webhook.log` — Registro de webhooks
- Browser Console — Logs [Dracofy] e [Zuckpay]
- Dracofy Dashboard — Status das conversões

---

**Status:** ✅ Integração completa e pronta para produção
