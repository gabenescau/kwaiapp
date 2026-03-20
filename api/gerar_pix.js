module.exports = async function handler(request, response) {
  // Configuração de CORS (permitir todas as origens)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Lidar com o Preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Apenas POST é permitido
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  const data = request.body;

  if (!data) {
    return response.status(400).json({ error: 'Nenhum dado recebido do front-end.' });
  }

  // Prepara o payload para a MisticPay, adicionando CPF padrão, e IDs únicos
  const payload = {
    amount: data.amount,
    payerName: data.payerName,
    phone: data.phone,
    payerDocument: '12345678909', // Fallback CPF exigido pela MisticPay
    transactionId: 'donat_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
    description: 'Doação Lar Leão de Judá'
  };

  const endpoint = 'https://api.misticpay.com/api/transactions/create';
  const ci = 'ci_2327w1glu6ij5vl';
  const cs = 'cs_61kj3rxobztuafkxkpbpwo800';

  try {
    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'ci': ci,
        'cs': cs,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Se a MisticPay falhar com erro 500 ou HTML, isso previne o crash
    const textRes = await apiRes.text();
    let jsonRes;
    try {
      jsonRes = JSON.parse(textRes);
    } catch (e) {
       return response.status(502).json({ error: 'A MisticPay retornou uma resposta inválida ou vazia.' });
    }

    // Retorna exatamente a mesma resposta (sucesso ou erro) com o status correspondente
    return response.status(apiRes.status).json(jsonRes);

  } catch (error) {
    // Falha na requisição fetch (ex. problemas de rede na Vercel)
    return response.status(500).json({ error: 'Erro interno na Vercel: ' + error.message });
  }
}
