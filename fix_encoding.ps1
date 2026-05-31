$ErrorActionPreference = "Stop"
$path = "c:\Meus Sites\KWAI\contapremiada.fun\index.html"

# Read the file as UTF-8 string
$doubleEncodedString = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Convert string back to bytes using Windows-1252
$ansiEncoding = [System.Text.Encoding]::GetEncoding(1252)
$originalUtf8Bytes = $ansiEncoding.GetBytes($doubleEncodedString)

# Write the original bytes back to the file
[System.IO.File]::WriteAllBytes($path, $originalUtf8Bytes)

Write-Output "Encoding fixed!"
