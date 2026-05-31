$ErrorActionPreference = "Stop"
$path = "c:\Meus Sites\KWAI\contapremiada.fun\index.html"
$html = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# 1. Update logo in the notification banner
$html = $html.Replace('src="images/Logo-promo.webp"', 'src="https://i.pinimg.com/736x/0b/a2/5e/0ba25e9fce2ac76f56ee81af302a0f2c.jpg"')

# 2. Update price from 16,81 to 18,81
$html = $html.Replace('16,81', '18,81')

# 3. Update composition to match 18,81 (14,31 -> 16,31)
$html = $html.Replace('14,31', '16,31')

# 4. Update JS for notification banner to trigger on scroll/view
$oldJsPattern = '(?s)setTimeout\(function\(\) \{\s*var n = document\.getElementById\(''notification-banner''\);.*?\s*\}, 2000\);'

$newJs = @"
                var observer = new IntersectionObserver(function(entries) {
                    if(entries[0].isIntersecting) {
                        setTimeout(function() {
                            var n = document.getElementById('notification-banner');
                            if(n && n.style.display !== 'block') {
                                n.style.display = 'block';
                                n.style.animation = 'notifSlideDown 0.4s cubic-bezier(0.16,1,0.3,1) forwards';
                                setTimeout(function() {
                                    n.style.animation = 'notifSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards';
                                    setTimeout(function() { n.style.display = 'none'; }, 400);
                                }, 5000);
                            }
                        }, 500); // Mostra meio segundo após a seção aparecer
                        observer.disconnect();
                    }
                }, { threshold: 0.1 });
                var secNine = document.getElementById('nine');
                if(secNine) observer.observe(secNine);
"@

$html = $html -replace $oldJsPattern, $newJs

[System.IO.File]::WriteAllText($path, $html, [System.Text.Encoding]::UTF8)
Write-Output "Update successful!"
