/**
 * pix-service.js — Integração Buckpay via Vercel Serverless Function
 */
(function () {
  'use strict';

  const PROXY_URL      = '/api/pix-proxy';
  const AMOUNT_CENTS   = 1881;
  const PHONE_FALLBACK = '11999999999';

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

  async function generatePayment() {
    const nome  = lerInput('buckpay-nome')  || 'Cliente Kwai';
    const email = lerInput('buckpay-email') || 'cliente@kwai.com';
    const cpf   = apenasDigitos(lerInput('buckpay-cpf'));
    const phone = apenasDigitos(lerInput('pix-key-input')) || PHONE_FALLBACK;

    const payload = {
      external_id:    gerarExternalId(),
      payment_method: 'pix',
      amount:         AMOUNT_CENTS,
      buyer: {
        name:     nome,
        email:    email,
        document: cpf   || '00000000191',
        phone:    phone || PHONE_FALLBACK
      }
    };

    console.log('[Buckpay] Enviando:', JSON.stringify(payload, null, 2));

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
    console.log('[Buckpay] HTTP', response.status, '->', rawText.substring(0, 400));

    let data;
    try { data = JSON.parse(rawText); }
    catch { throw new Error('Resposta inesperada do servidor.'); }

    if (!response.ok || data.status === 'error' || data.status === 'failed') {
      const msg = data.message || data.error ||
        (data.errors ? JSON.stringify(data.errors) : null) ||
        'Erro HTTP ' + response.status;
      throw new Error(msg);
    }

    const pixData = data && data.data && data.data.pix;
    if (!pixData || (!pixData.qrcode_base64 && !pixData.code)) {
      console.error('[Buckpay] Resposta completa:', data);
      throw new Error('Dados do PIX não encontrados. Contate o suporte.');
    }

    return {
      qrcode_base64: pixData.qrcode_base64 || '',
      code:          pixData.code          || ''
    };
  }

  window.PixService = { generatePayment };

  window.iniciarGeracaoPix = async function () {
    const nome  = lerInput('buckpay-nome');
    const email = lerInput('buckpay-email');
    const cpf   = apenasDigitos(lerInput('buckpay-cpf'));
    const errorForm = document.getElementById('buckpay-form-error');

    if (!nome || !email || cpf.length < 11) {
      if (errorForm) {
        errorForm.textContent = (!nome || !email)
          ? 'Preencha todos os campos obrigatórios.'
          : 'CPF inválido. Digite os 11 dígitos.';
        errorForm.classList.remove('hidden');
      }
      return;
    }
    if (errorForm) errorForm.classList.add('hidden');

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
