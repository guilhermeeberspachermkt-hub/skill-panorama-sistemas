// plano-revisao.mjs - modelo de plano para a REVISÃO PROFUNDA (references/previa.md, "Fluxo em dois tempos",
// tempo 3): só da versão que a pessoa disse que gostou. Copie para a pasta trabalho/ do perfil, troque os
// marcadores e rode:
//   node scripts/rev.mjs plano-revisao.mjs --copia copias/CAMINHO-DE-UM-PRODUTO--computador.mhtml   (sem rede)
//   node scripts/rev.mjs plano-revisao.mjs                                                         (no ar, uma vez)
//   python -I -X utf8 scripts/pares.py rev-plano-revisao/plano-revisao.json --grupos               (o foco, pelos pixels)
// Um plano = uma carga. Para o celular, outro plano com celular: true (e a cópia --celular); para a data de corte
// da campanha, outro com relogio: '...'. Os seletores abaixo são da família /dist (catalogo-tema-base.md);
// noutra família, troque pelos do catálogo dela.
export default {
  url: 'https://www.SUA-LOJA.com.br/CAMINHO-DE-UM-PRODUTO.html',
  celular: false,
  // a versão aprovada como rascunho, na mesma posição da cascata da prévia
  css: { arquivo: 'proposta.css', depoisDe: 'seu-tema.css' },
  // relogio: '2026-12-02T10:00:00-03:00',   // a página inteira nessa data: o que acontece depois do fim da campanha?
  passos: [
    { js: () => __R.bloquearTeclas() },                 // Tab não dispara a consulta de frete no keyup
    { js: () => __R.fotoGuardar(), save: 'fotoSemPrevia' },
    // escopo na mesma carga: sem a prévia x com x sem de novo (instáveis = carrossel ou relógio andando)
    { js: () => __R.compararEscopo(), save: 'escopo' },
    { ligarCss: 1, save: 'css' },
    // contraste de todo texto do miolo, e de uma região
    { js: () => __R.varrer(null, 30), save: 'varreduraMiolo' },
    { js: (r) => __R.varrer(r, 20, true), args: ['.product-summary'], save: 'varreduraResumo' },
    // cor colada no admin: casos comuns de cor e fundo escritos na descrição, com o tema ligado
    { js: (a) => __R.inline(a), args: ['.product-description'], save: 'corColada' },
    { js: () => __R.inlineTirar() },
    // Tab de verdade pelo resumo do produto, com os pares de print para o pares.py
    { mouseOff: [1, 540] },
    { tab: { start: '.product-summary h1', max: 25, prefix: 'resumo', pares: true, dentro: '.product-summary' }, save: 'tabResumo' },
    // mouse de verdade num card de vitrine: o estado de hover e um print dele
    { hover: '.section-vitrine .product', save: 'hoverCard', medir: (s) => __R.estado(s), args: ['.section-vitrine .product'], shot: 'hover-card.png' },
    { mouseOff: [1, 540] },
    // larguras críticas na mesma carga
    { resize: [1024, 768] },
    { js: () => ({ rolagem: __R.rolagem(), quemPassa: __R.quemPassa() }), save: 'rolagem1024' },
    { shot: 'resumo-1024.png', clipSel: '.product-summary', pad: 12, block: 'start' },
    { resize: [1920, 1080] },
    // prova de que desligar volta ao que era
    { desligarCss: 1 },
    { js: () => __R.fotoComparar(), save: 'desligouVoltou' },
  ],
};
