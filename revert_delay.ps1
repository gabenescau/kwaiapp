$ErrorActionPreference = "Stop"
$jsPath = "c:\Meus Sites\KWAI\contapremiada.fun\js\main.js"
$js = [System.IO.File]::ReadAllText($jsPath, [System.Text.Encoding]::UTF8)

# Revert specifically the delays for #seven (startNewLoadingAnimation)
$js = $js.Replace('300);', '1600);')
$js = $js.Replace('}, 50);', '}, 150);')
$js = $js.Replace('width 0.3s ease-in-out', 'width 1.3s ease-in-out')
$js = $js.Replace('width 0.3s cubic-bezier', 'width 1.2s cubic-bezier')

# Make sure we didn't accidentally revert the other loader if it happened to use 300);
# Wait, the other loader had: stepDuration = 300, so it would match 'stepDuration = 300,' not '300);'
# So the above replacements are safe.

[System.IO.File]::WriteAllText($jsPath, $js, [System.Text.Encoding]::UTF8)
Write-Output "Delays reverted for #seven"
