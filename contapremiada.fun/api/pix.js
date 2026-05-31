export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const payload = req.body;
  
  try {
    const apiRes = await fetch('https://api.realtechdev.com.br/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk_live_bc910bfae04f07458ff8136af8abe42d',
        'User-Agent': 'BuckPay-Checkout/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: err.message } });
  }
}
