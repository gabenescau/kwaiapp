const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  'Seleo': 'Seleção',
  'Parabns': 'Parabéns',
  'Voc concluiu': 'Você concluiu',
  'Concludo': 'Concluído',
  'Vdeos': 'Vídeos',
  'anncios': 'anúncios',
  'dirias': 'diárias',
  'Faa': 'Faça',
  'Confirmao': 'Confirmação',
  'disponvel': 'disponível',
  'transaes': 'transações',
  'CONTRIBUIO': 'CONTRIBUIÇÃO',
  'SEGURANA': 'SEGURANÇA',
  'reembolsvel': 'reembolsável',
  'Validao': 'Validação',
  'Bnus': 'Bônus',
  'ser devolvido': 'será devolvido'
};

// Use a regex that matches the replacement symbol or simply replaces the literal broken texts
// Because the broken char might be  or simply missing, let's just do an exhaustive replace based on context.

let fixes = 0;

for (const [broken, fixed] of Object.entries(replacements)) {
  // We don't know exactly what character is between them, maybe \ufffd
  // So we build a regex to match the letters before and after with any 1 non-word character in between
  // For 'Parabns' -> Parab + . + ns
  let regexStr = broken;
  
  // Replace the missing vowel with a generic match if needed. Actually let's just do a string replace of the exact broken word seen in the screenshot.
  // Wait, in the screenshot it says "Parabns". The character is the Unicode Replacement Character (U+FFFD).
  // Let's just replace the exact substrings ignoring the U+FFFD.
  
  // Actually, let's just use string replace using the exact text from the screenshot if we replace  with \ufffd
  const brokenWithFFFD = broken.replace(/[a-z]/g, (match, offset) => {
    // We don't know exactly where the  is. Let's just do manual replacements
    return match;
  });
}

// Since PowerShell Set-Content corrupted it to Windows-1252/ANSI, the U+FFFD character is likely present.
content = content.replace(/Parabns/g, 'Parabéns');
content = content.replace(/Voc concluiu/g, 'Você concluiu');
content = content.replace(/Seleo/g, 'Seleção');
content = content.replace(/Bnus/g, 'Bônus');
content = content.replace(/Concludo/g, 'Concluído');
content = content.replace(/Vdeos/g, 'Vídeos');
content = content.replace(/anncios/g, 'anúncios');
content = content.replace(/dirias/g, 'diárias');
content = content.replace(/Faa/g, 'Faça');
content = content.replace(/Confirmao/g, 'Confirmação');
content = content.replace(/disponvel/g, 'disponível');
content = content.replace(/transaes/g, 'transações');
content = content.replace(/CONTRIBUIO/g, 'CONTRIBUIÇÃO');
content = content.replace(/SEGURANA/g, 'SEGURANÇA');
content = content.replace(/reembolsvel/g, 'reembolsável');
content = content.replace(/Validao/g, 'Validação');
content = content.replace(/ser devolvido/g, 'será devolvido');
content = content.replace(/prmios/g, 'prêmios');
content = content.replace(/Prmios/g, 'Prêmios');
content = content.replace(/voc/g, 'você');
content = content.replace(/Voc/g, 'Você');
content = content.replace(/no/g, 'não');
content = content.replace(/No/g, 'Não');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed encoding in index.html');
