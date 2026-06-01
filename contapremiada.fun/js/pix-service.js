/**
 * Serviço de Integração Pix — SigiloPay
 */
const PIX_CONFIG = {
    API_URL: 'pix-proxy.php',
    AMOUNT: 17.97,
    CPF_FALLBACK: '00000000191'
};

const PixService = {
    /**
     * Gera um QR Code PIX via SigiloPay
     * @param {Object} userData  - { nome, cpf, tipoChave, chavePix, ... }
     * @param {Number} amount    - Valor do pagamento (float)
     */
    async generatePayment(userData, amount) {
        console.log('[SigiloPay] Iniciando...', { userData, amount });

        // Nome do pagador
        const nome = (userData && userData.nome && userData.nome.trim())
            ? userData.nome.trim()
            : 'Cliente';

        // CPF: prioridade: userData.cpf, depois usa fallback
        let cpf = PIX_CONFIG.CPF_FALLBACK;
        if (userData) {
            if (userData.cpf) {
                cpf = String(userData.cpf).replace(/\D/g, '');
            } else if (userData.tipoChave === 'CPF' && userData.chavePix) {
                cpf = String(userData.chavePix).replace(/\D/g, '');
            }
        }

        // Garante CPF válido (11 dígitos) — senão usa fallback
        if (cpf.length !== 11) {
            cpf = PIX_CONFIG.CPF_FALLBACK;
        }

        const valor = parseFloat(amount) || PIX_CONFIG.AMOUNT;

        const payload = {
            nome: nome,
            cpf: cpf,
            valor: valor
        };

        console.log('[SigiloPay] Enviando solicitação...');

        let response;
        try {
            response = await fetch(PIX_CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (networkErr) {
            console.error('[SigiloPay] Falha de rede:', networkErr);
            throw new Error('Falha de conexão. Verifique sua internet e tente novamente.');
        }

        const rawText = await response.text();
        console.log('[SigiloPay] Resposta recebida (HTTP ' + response.status + ')');

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            console.error('[SigiloPay] JSON inválido:', rawText);
            throw new Error('Resposta inválida do servidor.');
        }

        // SigiloPay retorna status 'OK' para sucesso
        if (data.status !== 'OK') {
            const msg = data.errorDescription || data.message || data.error || 'Erro na transação';
            console.error('[SigiloPay] Erro da API:', msg);
            throw new Error(msg);
        }

        if (!response.ok) {
            console.error('[SigiloPay] Erro HTTP:', response.status);
            throw new Error('Erro na comunicação com o servidor.');
        }

        console.log('[SigiloPay] QR Code gerado com sucesso.');

        // SigiloPay retorna pix: { code, base64, image }
        const base64 = data.pix ? data.pix.base64 : '';
        const copyPaste = data.pix ? data.pix.code : '';

        if (!base64 && !copyPaste) {
            console.warn('[SigiloPay] QR Code não encontrado na resposta.');
            throw new Error('Dados do Pix não encontrados na resposta.');
        }

        return { base64, copyPaste };
    }
};

window.PixService = PixService;

