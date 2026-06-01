/**
 * pix-service.js — Integração Buckpay (realtechdev.com.br)
 *
 * Responsabilidades:
 *  1. Capturar dados dos inputs do modal (#buckpay-nome, #buckpay-email,
 *     #buckpay-cpf e, opcionalmente, #pix-key-input para o telefone).
 *  2. Construir o payload exato exigido pela API Buckpay.
 *  3. Enviar via pix-proxy.php (que repassa Authorization + User-Agent corretos).
 *  4. Injetar qrcode_base64 na <img> e o code no campo copia-e-cola do modal.
 *  5. Exibir erros detalhados para o usuário corrigir.
 *
 * Estrutura de resposta esperada da API:
 * {
 *   "status": "success",
 *   "data": {
 *     "id": "...",
 *     "status": "pending",
 *     "pix": {
 *       "qrcode_base64": "<base64 string sem prefixo data:image>",
 *       "code": "<string PIX copia-e-cola>"
 *     }
 *   }
 * }
 */

(function () {
  'use strict';

  /* ─── Configuração ────────────────────────────────────────────────── */
  const PIX_CONFIG = {
    PROXY_URL: 'pix-proxy.php',   // PHP que adiciona Authorization + User-Agent
    AMOUNT_CENTS: 1881,            // R$ 18,81 em centavos
    PHONE_FALLBACK: '11999999999'  // Telefone padrão quando nenhum é informado
  };

  /* ─── Helpers ─────────────────────────────────────────────────────── */

  /** Gera um external_id único no formato KW-XXXXXXXXXX */
  function gerarExternalId() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return 'KW-' + ts + rand;
  }

  /** Remove tudo que não for dígito */
  function apenasDigitos(str) {
    return String(str || '').replace(/\D/g, '');
  }

  /** Lê o valor de um input pelo id, retorna string vazia se não existir */
  function lerInput(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  /* ─── API Principal ───────────────────────────────────────────────── */

  /**
   * generatePayment
   * Chamado por iniciarGeracaoPix() no HTML após validação dos campos.
   *
   * @returns {Promise<{qrcode_base64: string, code: string}>}
   */
  async function generatePayment() {
    // 1. Captura dos inputs do modal
    const nome     = lerInput('buckpay-nome')  || 'Cliente Kwai';
    const email    = lerInput('buckpay-email') || 'cliente@kwai.com';
    const cpfRaw   = lerInput('buckpay-cpf');
    const phoneRaw = lerInput('pix-key-input') || PIX_CONFIG.PHONE_FALLBACK;

    const cpf   = apenasDigitos(cpfRaw);
    const phone = apenasDigitos(phoneRaw) || apenasDigitos(PIX_CONFIG.PHONE_FALLBACK);

    // 2. Monta payload no formato exato da Buckpay
    const payload = {
      external_id:    gerarExternalId(),
      payment_method: 'pix',
      amount:         PIX_CONFIG.AMOUNT_CENTS,
      buyer: {
        name:     nome,
        email:    email,
        document: cpf   || '00000000191',   // fallback se CPF vazio
        phone:    phone || '11999999999'
      }
    };

    console.log('[Buckpay] Enviando payload:', JSON.stringify(payload, null, 2));

    // 3. Chamada ao proxy PHP
    let response;
    try {
      response = await fetch(PIX_CONFIG.PROXY_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
    } catch (networkErr) {
      console.error('[Buckpay] Erro de rede:', networkErr);
      throw new Error('Falha de conexão. Verifique sua internet e tente novamente.');
    }

    // 4. Parse da resposta
    const rawText = await response.text();
    console.log('[Buckpay] HTTP', response.status, '→', rawText.substring(0, 300));

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error('[Buckpay] JSON inválido:', rawText);
      throw new Error('Resposta inesperada do servidor. Tente novamente.');
    }

    // 5. Tratamento de erro da API
    if (!response.ok || data.status === 'error' || data.status === 'failed') {
      // A Buckpay pode retornar erros em diferentes campos
      const detalhe =
        data.message ||
        data.error   ||
        data.errorDescription ||
        (data.errors ? JSON.stringify(data.errors) : null) ||
        `Código HTTP ${response.status}`;

      console.error('[Buckpay] Erro da API:', detalhe);
      throw new Error(detalhe);
    }

    // 6. Extrai QR Code e código copia-e-cola
    //    Estrutura esperada: data.data.pix.qrcode_base64 / data.data.pix.code
    const pixData = data?.data?.pix;

    if (!pixData || (!pixData.qrcode_base64 && !pixData.code)) {
      console.error('[Buckpay] Resposta sem dados PIX:', data);
      throw new Error('Dados do PIX não encontrados na resposta. Contate o suporte.');
    }

    console.log('[Buckpay] PIX gerado com sucesso.');

    return {
      qrcode_base64: pixData.qrcode_base64 || '',
      code:          pixData.code          || ''
    };
  }

  /* ─── Exposição global ────────────────────────────────────────────── */
  window.PixService = { generatePayment };

  /**
   * iniciarGeracaoPix
   * Chamado diretamente pelo botão do modal no HTML (onclick="iniciarGeracaoPix()").
   * Orquestra a transição de etapas e injeta o resultado no DOM.
   */
  window.iniciarGeracaoPix = async function iniciarGeracaoPix() {
    // Lê e valida inputs
    const nome  = lerInput('buckpay-nome');
    const email = lerInput('buckpay-email');
    const cpf   = apenasDigitos(lerInput('buckpay-cpf'));

    const errorForm = document.getElementById('buckpay-form-error');

    if (!nome || !email || cpf.length < 11) {
      if (errorForm) {
        errorForm.textContent = !nome || !email
          ? 'Preencha todos os campos obrigatórios.'
          : 'CPF inválido. Digite os 11 dígitos.';
        errorForm.classList.remove('hidden');
      }
      return;
    }

    if (errorForm) errorForm.classList.add('hidden');

    // Transição para Etapa 2
    const step1 = document.getElementById('buckpay-step-1');
    const step2 = document.getElementById('buckpay-step-2');

    if (step1) { step1.classList.remove('flex'); step1.classList.add('hidden'); }
    if (step2) { step2.classList.remove('hidden'); step2.classList.add('flex'); }

    // Refs dos elementos da Etapa 2
    const qrcodeImg      = document.getElementById('buckpay-qrcode');
    const loadingDiv     = document.getElementById('buckpay-loading');
    const copyPasteInput = document.getElementById('buckpay-copypaste');
    const copyBtn        = document.getElementById('btn-copy-pix');
    const errorDiv       = document.getElementById('buckpay-error');

    // Estado inicial de carregamento
    if (qrcodeImg)      { qrcodeImg.style.display = 'none'; qrcodeImg.src = ''; }
    if (loadingDiv)     loadingDiv.style.display = 'flex';
    if (copyPasteInput) copyPasteInput.value = 'Gerando código...';
    if (copyBtn)        copyBtn.disabled = true;
    if (errorDiv)       errorDiv.classList.add('hidden');

    try {
      const { qrcode_base64, code } = await window.PixService.generatePayment();

      // Injeta QR Code
      if (loadingDiv) loadingDiv.style.display = 'none';

      if (qrcodeImg && qrcode_base64) {
        qrcodeImg.src = `data:image/png;base64,${qrcode_base64}`;
        qrcodeImg.style.display = 'block';
      }

      // Injeta código copia-e-cola
      if (copyPasteInput && code) {
        copyPasteInput.value = code;
        if (copyBtn) copyBtn.disabled = false;
      }

    } catch (err) {
      console.error('[Buckpay] Falha ao gerar PIX:', err);

      if (loadingDiv) loadingDiv.style.display = 'none';

      if (errorDiv) {
        errorDiv.textContent = err.message || 'Erro ao gerar o PIX. Tente novamente.';
        errorDiv.classList.remove('hidden');
      }

      if (copyPasteInput) copyPasteInput.value = 'Erro ao gerar código.';
    }
  };

})();
