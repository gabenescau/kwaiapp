$ErrorActionPreference = "Stop"
$path = "c:\Meus Sites\KWAI\contapremiada.fun\index.html"
$html = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# 1. Revert all pinterest logos back to original
$html = $html.Replace('https://i.pinimg.com/736x/0b/a2/5e/0ba25e9fce2ac76f56ee81af302a0f2c.jpg', 'images/Logo-promo.webp')

# 2. Only change the logo in the notification banner
# Let's find the section with id="notification-banner" and replace the first img inside it.
$html = $html -replace '(<div id="notification-banner".*?<img src=")images/Logo-promo\.webp(")', '${1}https://i.pinimg.com/736x/0b/a2/5e/0ba25e9fce2ac76f56ee81af302a0f2c.jpg${2}'

# 3. Change notification delay from 500ms to 0ms
$html = $html -replace '\}, 500\); // Mostra meio segundo após a seção aparecer', '}, 0); // Mostra instantaneamente'

[System.IO.File]::WriteAllText($path, $html, [System.Text.Encoding]::UTF8)

$jsPath = "c:\Meus Sites\KWAI\contapremiada.fun\js\main.js"
$js = [System.IO.File]::ReadAllText($jsPath, [System.Text.Encoding]::UTF8)

# 4. Speed up the loading screens
$js = $js -replace 'stepDuration = 3000,', 'stepDuration = 300,'
$js = $js -replace 'textFadeDuration = 400,', 'textFadeDuration = 100,'
$js = $js -replace 'dotAnimationSpeed = 800;', 'dotAnimationSpeed = 200;'

$js = $js -replace '1600\);', '300);'
$js = $js -replace '\}, 150\);', '}, 50);'
$js = $js -replace 'width 1.3s ease-in-out', 'width 0.3s ease-in-out'
$js = $js -replace 'width 1.2s cubic-bezier', 'width 0.3s cubic-bezier'

[System.IO.File]::WriteAllText($jsPath, $js, [System.Text.Encoding]::UTF8)

Write-Output "Update 3 successful!"
