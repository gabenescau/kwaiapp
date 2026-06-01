// api/pix-proxy.js — Vercel Serverless Function
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Método não permitido.' });

  const input = req.body || {};
  const buyer = input.buyer || {};

  const document = String(buyer.document || '00000000191').replace(/\D/g, '');
  const phone    = String(buyer.phone    || '11999999999').replace(/\D/g, '');

  const payload = {
    external_id:    input.external_id || ('KW-' + Date.now().toString(36).toUpperCase()),
    payment_method: 'pix',
    amount:         input.amount || 1881,
    buyer: {
      name:     buyer.name  || 'Cliente Kwai',
      email:    buyer.email || 'cliente@kwai.com',
      document: document.length === 11 ? document : '00000000191',
      phone:    phone.length >= 8 ? phone : '11999999999'
    }
  };

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
    return res.status(apiRes.status).json(data);

  } catch (err) {
    console.error('[pix-proxy] Erro:', err);
    return res.status(502).json({ success: false, error: 'Falha ao conectar com o servidor de pagamentos.' });
  }
}
