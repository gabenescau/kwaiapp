$ErrorActionPreference = "Stop"
$path = "c:\Meus Sites\KWAI\contapremiada.fun\index.html"

# Ler o arquivo
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Dicionário de substituições
$replacements = @{
    "Seleo" = "Seleção"
    "Parabns" = "Parabéns"
    "Voc concluiu" = "Você concluiu"
    "Concludo" = "Concluído"
    "Vdeos" = "Vídeos"
    "anncios" = "anúncios"
    "dirias" = "diárias"
    "Faa" = "Faça"
    "Confirmao" = "Confirmação"
    "disponvel" = "disponível"
    "transaes" = "transações"
    "CONTRIBUIO" = "CONTRIBUIÇÃO"
    "SEGURANA" = "SEGURANÇA"
    "reembolsvel" = "reembolsável"
    "Validao" = "Validação"
    "Bnus" = "Bônus"
    "ser devolvido" = "será devolvido"
}

# Realiza as substituições substituindo o caractere unicode inválido \ufffd (que aparece como )
foreach ($key in $replacements.Keys) {
    # Em powershell, podemos criar o padrão substituindo as vogais faltantes por 
    # Na verdade, como as strings originais estragadas têm o caractere , vamos dar replace direto
    # Ex: Parabns
    # Vamos usar replace com expressões regulares para encontrar a palavra com QUALQUER caractere no lugar da letra com acento.
    # Ex: Parab.ns -> Parabéns
    
    # Mas é mais seguro apenas usar . (ponto) no regex para a letra acentuada
}

$content = $content -replace "Parab.ns", "Parabéns"
$content = $content -replace "Seleo", "Seleção"
$content = $content -replace "Sele.o", "Seleção"
$content = $content -replace "Voc. concluiu", "Você concluiu"
$content = $content -replace "Conclu.do", "Concluído"
$content = $content -replace "V.deos", "Vídeos"
$content = $content -replace "an.ncios", "anúncios"
$content = $content -replace "di.rias", "diárias"
$content = $content -replace "Fa.a", "Faça"
$content = $content -replace "Confirma..o", "Confirmação" # pode ter dois se ção estragou, vamos usar Confirma.o
$content = $content -replace "Confirma.o", "Confirmação"
$content = $content -replace "dispon.vel", "disponível"
$content = $content -replace "transa..es", "transações"
$content = $content -replace "transa.es", "transações"
$content = $content -replace "CONTRIBUI..O", "CONTRIBUIÇÃO"
$content = $content -replace "CONTRIBUI.O", "CONTRIBUIÇÃO"
$content = $content -replace "SEGURAN.A", "SEGURANÇA"
$content = $content -replace "reembols.vel", "reembolsável"
$content = $content -replace "Valida..o", "Validação"
$content = $content -replace "Valida.o", "Validação"
$content = $content -replace "B.nus", "Bônus"
$content = $content -replace "ser. devolvido", "será devolvido"
$content = $content -replace "pr.mios", "prêmios"

# Salvar o arquivo forçando UTF8 sem BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Output "Encoding corrigido."
