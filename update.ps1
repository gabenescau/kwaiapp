$ErrorActionPreference = "Stop"
$htmlPath = "c:\Meus Sites\KWAI\contapremiada.fun\index.html"
$txtPath = "c:\Meus Sites\KWAI\update.txt"

$html = Get-Content $htmlPath -Raw
$newSection = Get-Content $txtPath -Raw

$startStr = '<section id="nine"'
$endStr = '</section>'

$start = $html.IndexOf($startStr)
if ($start -lt 0) {
    Write-Error "Could not find <section id='nine'"
    exit 1
}

$end = $html.IndexOf($endStr, $start)
if ($end -lt 0) {
    Write-Error "Could not find </section>"
    exit 1
}
$end += $endStr.Length

$oldSection = $html.Substring($start, $end - $start)

# String replace, which is safe from Regex parsing issues
$html = $html.Replace($oldSection, $newSection)

[System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.Encoding]::UTF8)

Write-Output "Update successful!"
