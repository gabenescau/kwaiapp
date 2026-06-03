// api/pix-proxy.js — ZuckPay
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Método não permitido.' });

  const input = req.body || {};
  const buyer = input.buyer || {};

  // CPF apenas dígitos
  const cpf = String(buyer.document || '').replace(/\D/g, '');

  // Telefone sem DDI — ZuckPay aceita DDD+número (10-11 dígitos)
  let phone = String(buyer.phone || '').replace(/\D/g, '');
  if (phone.startsWith('55') && phone.length > 11) phone = phone.slice(2);
  if (!phone || phone.length < 10) phone = '11999999999';

  // UTMs e tracking params vindos do frontend
  const payload = {
    nome:               buyer.name  || 'Cliente',
    cpf:                cpf         || '00000000191',
    valor:              18.81,
    email:              buyer.email || 'cliente@email.com',
    telefone:           phone,
    external_id_client: input.external_id || ('KW-' + Date.now().toString(36).toUpperCase()),

    // UTMs — enviados diretamente no body conforme doc ZuckPay
    utm_source:   input.utm_source   || 'organic',
    utm_medium:   input.utm_medium   || 'organic',
    utm_campaign: input.utm_campaign || '',
    utm_content:  input.utm_content  || '',
    utm_term:     input.utm_term     || '',

    // Tracking params Meta / Google / TikTok / Kwai
    fbc:      input.fbc      || '',
    fbp:      input.fbp      || '',
    fbclid:   input.fbclid   || '',
    gclid:    input.gclid    || '',
    ttclid:   input.ttclid   || '',
    kclid:    input.kclid    || '',
    click_id: input.click_id || '',
    src:      input.src      || '',
    sck:      input.sck      || ''
  };

  // Remove campos vazios para não poluir o payload
  Object.keys(payload).forEach(k => {
    if (payload[k] === '' || payload[k] === null || payload[k] === undefined) {
      delete payload[k];
    }
  });

  console.log('[ZuckPay] payload:', JSON.stringify(payload));

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
      body: JSON.stringify(payload)
    });

    const data = await apiRes.json();
    console.log('[ZuckPay] HTTP', apiRes.status, ':', JSON.stringify(data).substring(0, 300));
    return res.status(apiRes.status).json(data);

  } catch (err) {
    console.error('[ZuckPay] Erro:', err.message);
    return res.status(502).json({ success: false, error: 'Falha ao conectar com o servidor de pagamentos.' });
  }
}
