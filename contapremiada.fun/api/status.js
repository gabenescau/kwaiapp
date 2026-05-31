export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing external_id' });
  }
  
  try {
    const apiRes = await fetch('https://api.realtechdev.com.br/v1/transactions/external_id/' + id, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer sk_live_bc910bfae04f07458ff8136af8abe42d',
        'User-Agent': 'BuckPay-Checkout/1.0'
      }
    });
    
    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}
