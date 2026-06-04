// api/pix-proxy.js — ZuckPay
export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Método não permitido.' });

  let input = req.body;
  if (typeof input === 'string') {
    try { input = JSON.parse(input); } catch { input = {}; }
  }
  input = input || {};

  const buyer = input.buyer || {};

  // CPF: só dígitos
  const cpf = String(buyer.document || '').replace(/\D/g, '') || '00000000191';

  // Telefone: remove TUDO que não for dígito (espaços, parênteses, hífen, unicode)
  let phone = String(buyer.phone || '').replace(/\D/g, '').replace(/\s/g, '');
  // Garante sem DDI 55
  if (phone.startsWith('55') && phone.length > 11) phone = phone.slice(2);
  // Fallback
  if (!phone || phone.length < 10) phone = '11999999999';

  const payload = {
    nome:               String(buyer.name  || 'Cliente').trim(),
    cpf:                cpf,
    valor:              18.81,
    email:              String(buyer.email || 'cliente@email.com').trim(),
    telefone:           phone,
    external_id_client: input.external_id || ('KW-' + Date.now().toString(36).toUpperCase()),
    utm_source:         input.utm_source   || 'organic',
    utm_medium:         input.utm_medium   || 'organic',
    utm_campaign:       input.utm_campaign || '',
    utm_content:        input.utm_content  || '',
    utm_term:           input.utm_term     || '',
    src:                input.src          || '',
    fbc:                input.fbc          || '',
    fbp:                input.fbp          || '',
    fbclid:             input.fbclid       || '',
    gclid:              input.gclid        || '',
    ttclid:             input.ttclid       || '',
    kclid:              input.kclid        || '',
    click_id:           input.click_id     || ''
  };

  // Remove campos vazios
  Object.keys(payload).forEach(k => {
    if (payload[k] === '') delete payload[k];
  });

  const bodyStr = JSON.stringify(payload);

  console.log('[ZuckPay] telefone limpo:', phone);
  console.log('[ZuckPay] payload:', bodyStr);

  const basicAuth = Buffer.from(
    'gabenescau_8306189947:50c2cc30d4be1392f42981f149ff9b0feb7b8c8c503908122d9e0c3f6c869fc2'
  ).toString('base64');

  try {
    const apiRes = await fetch('https://zuckpay.com.br/conta/v3/pix/qrcode', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + basicAuth
      },
      body: bodyStr
    });

    const text = await apiRes.text();
    console.log('[ZuckPay] status:', apiRes.status, 'resposta:', text.substring(0, 500));

    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(apiRes.status).json(data);

  } catch (err) {
    console.error('[ZuckPay] Erro fetch:', err.message);
    return res.status(502).json({ success: false, error: err.message });
  }
}
