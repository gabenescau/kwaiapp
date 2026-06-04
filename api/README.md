# API Zuckpay PIX/QR Code

API em PHP para gerar QR Codes de PIX usando a plataforma Zuckpay.

## 📋 Pré-requisitos

- PHP 7.0+
- cURL habilitado no PHP
- Conta Zuckpay ativa
- Client ID e Client Secret da Zuckpay

## ⚙️ Configuração

### 1. Obter credenciais Zuckpay

- Acesse sua conta em https://zuckpay.com.br
- Gere suas credenciais (Client ID e Client Secret)

### 2. Configurar a API

Edite o arquivo `api/zuckpay_pix.php` e substitua:

```php
$CLIENT_ID = 'seu_client_id';        // Seu Client ID
$CLIENT_SECRET = 'seu_client_secret'; // Seu Client Secret
```

### 3. Webhook URL (Opcional)

A URL padrão do webhook é gerada automaticamente:
```
https://seu-dominio.com/api/webhook_zuckpay.php
```

Para usar uma URL personalizada, passe no parâmetro `urlnoty`.

## 🚀 Como usar

### Teste rápido

Acesse no navegador:
```
https://seu-dominio.com/api/zuckpay_pix.php
```

Você receberá informações sobre a API e exemplo de uso.

### Gerar PIX/QR Code

**Requisição:**

```bash
curl -X POST https://seu-dominio.com/api/zuckpay_pix.php \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Marcos Vinicius",
    "cpf": "12345678901",
    "valor": 47.50,
    "email": "cliente@email.com",
    "telefone": "11999998888",
    "utm_source": "facebook",
    "utm_campaign": "campanha-maio"
  }'
```

**Resposta (sucesso):**

```json
{
  "success": true,
  "data": {
    "qr_code": "00020126360014br.gov.bcb...",
    "pix_copy_paste": "00020126360014br.gov.bcb...",
    "transaction_id": "123456789",
    "expires_in": 3600
  },
  "http_code": 200
}
```

**Resposta (erro):**

```json
{
  "success": false,
  "error": "Campos obrigatórios faltando: nome, cpf",
  "http_code": 400
}
```

## 📝 Campos

### Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | string | Nome completo do cliente |
| `cpf` | string | CPF do cliente (11 dígitos) |
| `valor` | float | Valor em reais (ex: 47.50) |
| `email` | string | Email do cliente |
| `telefone` | string | Telefone com DDD (10-11 dígitos) |

### Opcionais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `product_id` | int | ID do produto (vincula a transação) |
| `urlnoty` | string | URL do webhook para notificações |
| `utm_source` | string | Fonte de tráfego (facebook, google, etc) |
| `utm_campaign` | string | Nome da campanha |
| `utm_medium` | string | Meio (cpc, cpl, organic, etc) |
| `utm_content` | string | Identificador do conteúdo |
| `fbc` | string | Facebook click ID |
| `fbp` | string | Facebook pixel ID |
| `gclid` | string | Google click ID |
| `ttclid` | string | TikTok click ID |
| `click_id` | string | Click ID de afiliado |

## 🔔 Webhook

Quando um PIX é confirmado, a Zuckpay envia uma notificação para `webhook_zuckpay.php`.

**Dados recebidos:**

```json
{
  "transaction_id": "123456789",
  "status": "paid",
  "valor": 47.50,
  "cpf": "12345678901",
  "email": "cliente@email.com",
  "timestamp": "2024-03-15T10:30:00Z"
}
```

**Processar webhook:**

Edite `api/webhook_zuckpay.php` para:
- Atualizar banco de dados
- Enviar emails
- Ativar acessos
- Integrar com seu sistema

## 📊 Exemplo JavaScript (Frontend)

```javascript
async function gerarPIX(dadosCliente) {
  try {
    const response = await fetch('https://seu-dominio.com/api/zuckpay_pix.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: dadosCliente.nome,
        cpf: dadosCliente.cpf,
        valor: dadosCliente.valor,
        email: dadosCliente.email,
        telefone: dadosCliente.telefone,
        utm_source: 'website'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('QR Code:', data.data.qr_code);
      console.log('PIX Copy Paste:', data.data.pix_copy_paste);
      // Exibir QR Code na página
      exibirQRCode(data.data.qr_code);
    } else {
      console.error('Erro:', data.error);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}
```

## 🔒 Segurança

1. **Nunca compartilhe** Client ID e Client Secret
2. **Valide** todos os dados no frontend E no backend
3. **Use HTTPS** em produção
4. **Limpe logs** periodicamente
5. **Implemente rate limiting** para evitar abuso

## 🐛 Troubleshooting

### "Erro na requisição"
- Verifique se cURL está habilitado
- Confirme que firewall permite conexões HTTPS para zuckpay.com.br

### "Client ID ou Secret inválidos"
- Verifique as credenciais em sua conta Zuckpay
- Confirm que estão corretos no arquivo PHP

### "Email inválido"
- Valide o formato do email
- Exemplo correto: cliente@email.com

### Webhook não recebendo notificações
- Verifique URL do webhook em sua conta Zuckpay
- Confirme que servidor é acessível externamente
- Verifique permissões de pasta `api/logs/`

## 📚 Documentação Zuckpay

Para mais informações, visite: https://zuckpay.com.br/docs

## 📄 Licença

Livre para uso e modificação.

## 💬 Suporte

Dúvidas? Verifique a documentação Zuckpay ou entre em contato com seu suporte.
