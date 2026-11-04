// conferir_css.mjs - prova, num Chrome sem rede, que dois ou mais arquivos CSS têm as mesmas regras para o navegador.
// Cada arquivo vira uma folha (CSSStyleSheet.replaceSync) numa página em branco, e o cssText de cada regra (as de
// dentro de @media, @supports e @layer também) é comparado, na ordem, com o do primeiro arquivo. Comentários,
// espaços e o ";" antes do "}" não contam; uma declaração que um enxugamento estragasse some do cssText (o
// navegador descarta o que não entende) e aparece como diferença. Nada vai ao site.
//
// Uso:
//   node scripts/conferir_css.mjs A.css B.css [C.css ...]
//   ex.: node scripts/conferir_css.mjs servido-hoje.css trabalho/seu-tema-v5-comentado.css trabalho/seu-tema-v5.css
//
//   O primeiro é a referência: em geral, o arquivo que o site serve hoje (baixado com ?nc=, ajustes-visuais.md 5.5).
//   Para uma mudança só de forma (a enxuta de um tema comentado, enxugar_tema.py), todos têm de dar 0 diferentes.
//   Para uma mudança de verdade, compare a comentada nova com a enxuta nova (0) e leia as diferenças contra a de hoje.
//
// Um comentário dentro do valor de uma variável CSS (--cor: #fff /* nota */) aparece como diferença: o Chrome
// guarda esse valor como foi escrito. Na tela não muda nada; confira à mão e siga.
//
// Saída: uma linha por arquivo (regras, quantas diferem do primeiro, o primeiro exemplo) e IGUAIS ou DIFERENTES.
// Códigos: 0 iguais, 1 diferentes, 2 uso ou erro. Um @import não entra numa folha construída: se algum arquivo tem,
// o script avisa e compara o resto (confira o @import à mão).

import fs from 'node:fs';
import path from 'node:path';
import * as C from './cdp.mjs';

const USO = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^\/\/ ?/gm, '');

const EXPR = (textos) => `(() => {
  const T = ${JSON.stringify(textos)};
  const regras = T.map((t) => {
    const s = new CSSStyleSheet();
    s.replaceSync(t);
    const out = [];
    const andar = (rs, pre) => {
      for (const r of rs) {
        if (r.cssRules && !(r instanceof CSSStyleRule)) {
          // o prelúdio inteiro (@media ..., @page :first ...) e as declarações da própria regra: no Chrome, @page
          // tem cssRules e declarações; com conditionText/name, as do @page não eram comparadas (medido)
          const ct = String(r.cssText), k = ct.indexOf('{');
          out.push(pre + (k >= 0 ? ct.slice(0, k) : ct).trim() + ' {' + (r.style && r.style.cssText ? ' ' + r.style.cssText : ''));
          andar(r.cssRules, pre + '  ');
          out.push(pre + '}');
        } else out.push(pre + r.cssText);
      }
    };
    andar(s.cssRules, '');
    return out;
  });
  return regras.map((r) => {
    let dif = 0, ex = null;
    const n = Math.max(r.length, regras[0].length);
    for (let i = 0; i < n; i++) if (r[i] !== regras[0][i]) { dif++; if (!ex) ex = { i, primeiro: (regras[0][i] || '(nada)').slice(0, 200), este: (r[i] || '(nada)').slice(0, 200) }; }
    return { regras: r.length, diferentes: dif, exemplo: ex };
  });
})()`;

async function main() {
  const o = C.lerArgs(process.argv.slice(2), {}, USO);
  const arqs = o._;
  if (arqs.length < 2) { console.error('passe dois arquivos ou mais. --help mostra o uso.'); process.exit(2); }
  const textos = arqs.map((a) => fs.readFileSync(a, 'utf8'));
  textos.forEach((t, k) => {
    if (t.charCodeAt(0) === 0xfeff) { textos[k] = t.slice(1); console.error(`AVISO: ${path.basename(arqs[k])} começa com BOM (tirado para comparar; no admin, ele entraria como um caractere)`); }
    if (/@import\b/i.test(t.replace(/\/\*[\s\S]*?\*\//g, ''))) console.error(`AVISO: ${path.basename(arqs[k])} tem @import, que uma folha construída ignora: confira-o à mão`);
  });
  const c = await C.abrirChrome({ semRede: true });
  let res;
  try { res = await c.ev(EXPR(textos)); } finally { await c.fechar(); }
  let falhou = false;
  res.forEach((x, k) => {
    console.log(`${path.basename(arqs[k])}: ${x.regras} regras, ${x.diferentes} diferentes de ${path.basename(arqs[0])}`);
    if (x.diferentes) { falhou = true; console.log('   primeira diferença:', JSON.stringify(x.exemplo)); }
  });
  console.log(falhou ? 'DIFERENTES' : 'IGUAIS, regra a regra');
  process.exitCode = falhou ? 1 : 0;
}

if (C.ehPrincipal(import.meta.url)) main().catch((e) => { console.error('ERRO:', e.message); process.exitCode = 2; });
