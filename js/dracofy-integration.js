/**
 * dracofy-integration.js — Integração Dracofy com Zuckpay PIX
 * 
 * Captura o click_id (fbclid) da URL e envia para a API Zuckpay
 * Quando o pagamento é confirmado, dispara evento de conversão na Dracofy
 */

(function() {
  'use strict';

  const DRACOFY_TOKEN = 'pt_573ba9538400847413cf85265a750c61';

  /**
   * Obtém o click_id da Dracofy
   * Retorna fbclid capturado da URL ou localStorage
   */
  function obterClickId() {
    if (typeof DTrack !== 'undefined' && DTrack.getClickId) {
      return DTrack.getClickId();
    }
    return null;
  }

  /**
   * Integra click_id ao payload do PIX
   * Chamado pelo pix-service.js antes de enviar para a API
   */
  window.DracofyIntegration = {
    /**
     * Enriquece o payload com dados da Dracofy
     */
    enriquecerPayload: function(payload) {
      const clickId = obterClickId();
      
      if (clickId) {
        payload.click_id = clickId;
        payload.fbclid = clickId;
        console.log('[Dracofy] Click ID capturado:', clickId);
      }

      // Captura plataforma detectada
      if (typeof DTrack !== 'undefined' && DTrack.getPlatform) {
        const platform = DTrack.getPlatform();
        if (platform) {
          payload.platform = platform;
          console.log('[Dracofy] Plataforma detectada:', platform);
        }
      }

      return payload;
    },

    /**
     * Dispara evento de compra na Dracofy
     * Chamado após confirmação de pagamento via webhook
     */
    dispararEventoCompra: function(dados) {
      if (typeof DTrack !== 'undefined' && DTrack.event) {
        DTrack.event('Purchase', {
          value: dados.valor,
          currency: 'BRL',
          order_id: dados.transaction_id
        });
        console.log('[Dracofy] Evento Purchase disparado:', dados);
      }
    },

    /**
     * Rastreia pageview em SPAs
     */
    registrarPageview: function(path) {
      if (typeof DTrack !== 'undefined' && DTrack.pageview) {
        DTrack.pageview(path);
        console.log('[Dracofy] Pageview registrado:', path);
      }
    },

    /**
     * Debug: imprime estado da Dracofy
     */
    debug: function() {
      if (typeof DTrack !== 'undefined' && DTrack.debug) {
        DTrack.debug();
      }
    }
  };

  // Auto-inicializar ao carregar página
  console.log('[Dracofy] Integração carregada');
})();
