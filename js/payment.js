document.addEventListener('DOMContentLoaded', () => {
  const btnCheckouts = document.querySelectorAll('a[href="https://seguropagamentos.com.br/kwaibrasil"]');
  const paymentModal = document.getElementById('payment-modal');
  const loadingDiv = document.getElementById('payment-loading');
  const detailsDiv = document.getElementById('payment-details');
  const successDiv = document.getElementById('payment-success');
  const pixQrcode = document.getElementById('pix-qrcode');
  const pixCode = document.getElementById('pix-code');
  const btnCopy = document.getElementById('btn-copy-pix');
  const copyMsg = document.getElementById('copy-msg');
  const btnFinish = document.getElementById('btn-finish');

  let pollingInterval = null;
  let currentExternalId = null;

  function showPaymentModal() {
    const modaisAtivos = document.querySelectorAll('.screen.is-modal.is-active');
    modaisAtivos.forEach(m => {
      m.classList.remove('is-active', 'is-modal');
      m.setAttribute('aria-hidden', 'true');
    });

    paymentModal.classList.add('is-modal', 'is-active');
    paymentModal.removeAttribute('aria-hidden');

    loadingDiv.style.display = 'block';
    detailsDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
  }

  function hidePaymentModal() {
    paymentModal.classList.remove('is-active', 'is-modal');
    paymentModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
    if(pollingInterval) clearInterval(pollingInterval);
  }

  const closeBtn = paymentModal.querySelector('[data-modal-close]');
  if(closeBtn) {
    closeBtn.addEventListener('click', hidePaymentModal);
  }

  btnCheckouts.forEach(btnCheckout => {
    btnCheckout.addEventListener('click', async (e) => {
      e.preventDefault();
      
      showPaymentModal();

      currentExternalId = 'kwai-' + Date.now();

      const payload = {
        external_id: currentExternalId,
        payment_method: "pix",
        amount: 1881
      };

      try {
        const response = await fetch('https://corsproxy.io/?https://api.realtechdev.com.br/v1/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk_live_bc910bfae04f07458ff8136af8abe42d'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if(response.ok && result.data && result.data.pix) {
          pixCode.value = result.data.pix.code;
          pixQrcode.src = 'data:image/png;base64,' + result.data.pix.qrcode_base64;
          
          loadingDiv.style.display = 'none';
          detailsDiv.style.display = 'block';

          startPolling(currentExternalId);
        } else {
          alert("Erro ao gerar PIX. Resposta: " + (result.error?.message || JSON.stringify(result)));
          hidePaymentModal();
        }
      } catch (err) {
        console.error(err);
        alert("Falha de conexão (CORS/Rede). Detalhe: " + err.message);
        hidePaymentModal();
      }
    });
  });

  if(btnCopy) {
    btnCopy.addEventListener('click', () => {
      pixCode.select();
      document.execCommand('copy');
      copyMsg.style.display = 'block';
      setTimeout(() => { copyMsg.style.display = 'none'; }, 3000);
    });
  }

  function startPolling(externalId) {
    if(pollingInterval) clearInterval(pollingInterval);

    pollingInterval = setInterval(async () => {
      try {
        const res = await fetch('https://corsproxy.io/?https://api.realtechdev.com.br/v1/transactions/external_id/' + externalId, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer sk_live_bc910bfae04f07458ff8136af8abe42d'
          }
        });
        
        if(res.ok) {
          const result = await res.json();
          if(result.data && result.data.status === 'paid') {
            clearInterval(pollingInterval);
            detailsDiv.style.display = 'none';
            successDiv.style.display = 'block';
          }
        }
      } catch (err) {
        console.error("Erro no polling", err);
      }
    }, 5000);
  }

  if(btnFinish) {
    btnFinish.addEventListener('click', () => {
      hidePaymentModal();
      alert("Saldo Liberado! Em breve cairá na sua conta.");
    });
  }
});
