// api/pix-proxy.js — Vercel Serverless Function
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Método não permitido.' });

  const input = req.body || {};
  const buyer = input.buyer || {};

  // CPF: apenas dígitos, 11 caracteres
  const document = String(buyer.document || '00000000191').replace(/\D/g, '');

  // Telefone: garante DDI 55 + pelo menos 10 dígitos (mínimo 12 total)
  let phone = String(buyer.phone || '').replace(/\D/g, '');
  if (!phone || phone.length < 10) phone = '11999999999';
  if (!phone.startsWith('55')) phone = '55' + phone;

  const payload = {
    external_id:    input.external_id || ('KW-' + Date.now().toString(36).toUpperCase()),
    payment_method: 'pix',
    amount:         input.amount || 1881,
    buyer: {
      name:     buyer.name  || 'Cliente Kwai',
      email:    buyer.email || 'cliente@kwai.com',
      document: document.length === 11 ? document : '00000000191',
      phone:    phone
    }
  };

  console.log('[pix-proxy] payload:', JSON.stringify(payload));

  try {
    const apiRes = await fetch('https://api.realtechdev.com.br/v1/transactions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer sk_live_c6c14bb3979fb9e0223ba541ef0f9503',
        'User-Agent':    'Buckpay API'
      },
      body: JSON.stringify(payload)
    });

    const data = await apiRes.json();
    console.log('[pix-proxy] resposta:', JSON.stringify(data));
    return res.status(apiRes.status).json(data);

  } catch (err) {
    console.error('[pix-proxy] Erro:', err.message);
    return res.status(502).json({ success: false, error: 'Falha ao conectar com o servidor de pagamentos.' });
  }
}
