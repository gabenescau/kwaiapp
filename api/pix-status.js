// api/pix-status.js — ZuckPay
// Consulta status de transação para o polling de confirmação de pagamento
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, error: 'ID não informado.' });

  const basicAuth = Buffer.from(
    'gabenescau_8306189947:50c2cc30d4be1392f42981f149ff9b0feb7b8c8c503908122d9e0c3f6c869fc2'
  ).toString('base64');

  try {
    // ZuckPay não documenta endpoint de status por ID explicitamente,
    // mas segue o padrão REST — tenta GET /v3/pix/:id
    const apiRes = await fetch(`https://zuckpay.com.br/conta/v3/pix/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + basicAuth,
        'Content-Type':  'application/json'
      }
    });

    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);

  } catch (err) {
    console.error('[pix-status] Erro:', err.message);
    return res.status(502).json({ success: false, error: 'Falha ao consultar status.' });
  }
}
