// api/pix-status.js — Vercel Serverless Function
// Consulta o status de uma transação Buckpay pelo ID
// Chamado pelo polling no frontend a cada 5s

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'ID da transação não informado.' });
  }

  try {
    const apiRes = await fetch(`https://api.realtechdev.com.br/v1/transactions/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer sk_live_c6c14bb3979fb9e0223ba541ef0f9503',
        'User-Agent':    'Buckpay API',
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
