# Como executar o servidor localmente

## Windows (Fácil)

Duplo clique em:
```
start-server.bat
```

Ou no terminal:
```bash
cd "C:\Meus Sites\KWAI OFERTA ON"
php -S localhost:8000
```

## Linux/Mac

```bash
cd "/caminho/para/KWAI OFERTA ON"
bash start-server.sh
```

Ou direto:
```bash
php -S localhost:8000
```

## Acessar

- **Site:** http://localhost:8000
- **API PIX:** http://localhost:8000/api/zuckpay_pix.php

## ⚠️ Importante

Se receber erro "**Método não permitido**", é porque:

1. **Servidor PHP não está rodando** ← Mais comum
   - Execute `php -S localhost:8000`

2. **Portando já em uso**
   - Use outra porta: `php -S localhost:8001`
   - Ou mate o processo: `taskkill /IM php.exe /F` (Windows)

3. **CORS bloqueando**
   - Verificar console do navegador
   - Headers CORS devem estar corretos

## 🧪 Testar com cURL

```bash
curl -X POST http://localhost:8000/api/zuckpay_pix.php \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste",
    "cpf": "12345678901",
    "valor": 18.81,
    "email": "teste@email.com",
    "telefone": "11999999999"
  }'
```

## 🔍 Diagnosticar

1. Abrir console do navegador (F12)
2. Network → clicar no request para /api/zuckpay_pix.php
3. Ver Method, Status, Response
4. Se disser "Method Not Allowed" → servidor não está rodando
