// conferir_troca.mjs - no site no ar, na MESMA carga da página, troca um arquivo CSS da loja por outro (o <link>
// desligado e um <style> com o arquivo novo logo depois dele, na mesma posição da cascata) e compara, elemento por
// elemento, o estilo computado (todas as propriedades, mais ::before e ::after quando têm content) e a caixa
// (posição e tamanho) antes e depois. Serve para provar que uma versão que só mudou de forma (a enxuta de um tema
// comentado, enxugar_tema.py) não muda nada na tela. Nada é gravado no site: a troca só existe neste Chrome.
//
// Uso:
//   node scripts/conferir_troca.mjs --url URL --css trabalho/seu-tema-v5.css --substitui "seu-tema.css"
//        [--celular] [--json saida.json] [--wait 4000] [--after 1500] [--pausa 6] [--perfil pasta | --perfil-novo]
//
//   --substitui  trecho do href do <link> do arquivo no ar; tem de casar com exatamente um <link rel=stylesheet>.
//   --celular    User-Agent de Android, 375x812 (o servidor manda o HTML de celular), como no shot.mjs.
//   No ar, passa pela trava e pelo ritmo das visitas do cdp.mjs (uma visita por vez no computador, pausa entre
//   cargas, 1015). Rode uma página por vez: produto, uma lista e a home, no computador e no celular.
//
// Como ele separa o que mexe sozinho: antes de tudo, para o autoplay dos carrosséis que reconhece (Owl e Slick, com
// jQuery; Swiper), pausa os vídeos, leva as animações ao quadro 0 e as transições ao fim; depois tira quatro fotos
// da página, A e B antes da troca, C e D depois, com ~1,1 s entre A e B e entre C e D. Logo depois da troca, as
// transições que ela disparou vão ao fim, para a foto C ler o valor novo (pausadas no começo, elas escondiam a
// mudança). Um elemento que muda de A para B ou de C para D se mexe sozinho (carrossel que não parou, contador,
// vitrine chegando) e sai da conta, listado à parte. A diferença que vale é a de B para C nos outros. Medido
// (2026-11, uma home com 5 carrosséis Owl): sem parar o autoplay, 286 e 575 "diferenças" entre fotos, todas dentro
// de .owl-stage, nenhuma fora; com ele parado, 0.
//
// O que ele não vê: estados (:hover, :focus, :checked), ::placeholder, ::selection, ::marker e a barra de rolagem;
// o elemento que não está na página carregada (outro tipo de página, um menu fechado criado por JS); e, numa
// propriedade com animação de @keyframes rodando, a mudança do valor de base (a foto lê o quadro 0). Por isso a
// prova de que as regras são as mesmas é o conferir_css.mjs, e este é o complemento: confirma na tela, nas páginas
// que importam.
//
// Saída: elementos comparados, diferentes na troca, instáveis (e em que carrossel ou bloco), e até 10 exemplos
// (caminho do elemento e as propriedades que mudaram). O IGUAL vale para os elementos conferidos: os instáveis
// ficam fora e são contados. Códigos: 0 sem diferença, 1 com diferença ou erro, 2 uso, 15 limite de pedidos
// (1015/429) duas vezes, 16 desafio do CDN. A medida tem até 4 minutos (~16 s numa página de 5 mil elementos).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as C from './cdp.mjs';
import { umaFoto, noAr, linhaDeResumo } from './shot.mjs';

const USO = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^\/\/ ?/gm, '');

// roda dentro da página; lê window.__CSS_NOVO e window.__ALVO_LINK, postos antes dele
const PAGINA = String.raw`(function () {
  var espera = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var CARROSSEL = '.owl-carousel,.slick-slider,.swiper,.swiper-container,[class*="carousel"],[class*="slider"]';
  function pararMovimento() {
    var n = { owl: 0, slick: 0, swiper: 0, videos: 0, animacoes: 0, transicoes: 0 };
    try {
      if (window.jQuery) {
        jQuery('.owl-carousel').each(function () { jQuery(this).trigger('stop.owl.autoplay'); n.owl++; });
        jQuery('.slick-initialized').each(function () { try { jQuery(this).slick('slickPause'); n.slick++; } catch (e) {} });
      }
    } catch (e) {}
    document.querySelectorAll('.swiper,.swiper-container').forEach(function (s) {
      try { if (s.swiper && s.swiper.autoplay) { s.swiper.autoplay.stop(); n.swiper++; } } catch (e) {}
    });
    document.querySelectorAll('video').forEach(function (v) { try { v.pause(); n.videos++; } catch (e) {} });
    // getAnimations() atualiza o estilo e cria as transições que a troca disparou: uma transição vai para o
    // fim (o valor novo; pausada no começo, ela esconderia a mudança: medido); uma animação, para o quadro 0
    try {
      document.getAnimations().forEach(function (a) {
        try {
          if (typeof CSSTransition !== 'undefined' && a instanceof CSSTransition) { a.finish(); n.transicoes++; }
          else { a.pause(); a.currentTime = 0; n.animacoes++; }
        } catch (e) {}
      });
    } catch (e) {}
    return n;
  }
  // o <html> e o <body> entram (o fundo da página costuma estar neles), mais tudo o que está dentro do <body>
  function elementos() {
    return [document.documentElement, document.body].concat(Array.prototype.filter.call(document.querySelectorAll('body *'), function (e) {
      return e.tagName !== 'SCRIPT' && e.tagName !== 'STYLE';
    }));
  }
  function valores(cs) { var v = new Array(cs.length); for (var i = 0; i < cs.length; i++) v[i] = cs[i] + ':' + cs.getPropertyValue(cs[i]); return v; }
  function foto(lista) {
    return lista.map(function (e) {
      var r = e.getBoundingClientRect();
      var v = valores(getComputedStyle(e));
      ['::before', '::after'].forEach(function (ps) {
        var c = getComputedStyle(e, ps);
        if (c.content && c.content !== 'none' && c.content !== 'normal') valores(c).forEach(function (x) { v.push(ps + ' ' + x); });
      });
      v.push('caixa:' + [r.left + scrollX, r.top + scrollY, r.width, r.height].map(function (n) { return Math.round(n * 10) / 10; }).join(','));
      return v;
    });
  }
  // um número por elemento (FNV-1a do estilo inteiro): quatro fotos de ~4 mil elementos com ~360 propriedades
  // cada caberiam mal na memória como texto; só B e C ficam inteiras, para os exemplos
  function resumo(f) {
    return f.map(function (v) {
      var s = v.join('\u0001'), x = 0x811c9dc5;
      for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); }
      return x >>> 0;
    });
  }
  function mudou(a, b) { var s = []; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) s.push(i); return s; }
  function caminho(e) {
    if (e === document.documentElement || e === document.body) {
      var c = (e.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.');
      return e.tagName.toLowerCase() + (c ? '.' + c : '');
    }
    var p = [];
    for (var x = e; x && x.nodeType === 1 && x !== document.body && p.length < 5; x = x.parentElement) {
      var t = x.tagName.toLowerCase(), id = x.getAttribute('id');  // x.id de um <form> pode ser um <input name="id">
      if (id) { p.unshift(t + '#' + id); break; }
      var cl = (x.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.');
      p.unshift(t + (cl ? '.' + cl : ''));
    }
    return p.join(' > ');
  }
  function onde(e) {
    var k = e && e.closest(CARROSSEL);
    return k ? caminho(k) : '(fora de carrossel)';
  }
  window.__conferirTroca = async function () {
    var css = window.__CSS_NOVO, alvo = window.__ALVO_LINK;
    var links = Array.prototype.filter.call(document.querySelectorAll('link[rel~="stylesheet"]'), function (l) {
      return (l.getAttribute('href') || '').indexOf(alvo) >= 0;
    });
    if (links.length !== 1) return { erro: '--substitui "' + alvo + '" casou com ' + links.length + ' <link rel=stylesheet> (tem de ser 1)', links: links.map(function (l) { return l.getAttribute('href'); }) };
    var parados = pararMovimento();
    await espera(1500);
    pararMovimento();
    var lista = elementos();
    var A = resumo(foto(lista)); await espera(1100);
    var fB = foto(lista), B = resumo(fB);
    var st = document.createElement('style');
    st.id = '__conferir_troca';
    st.textContent = css;
    links[0].parentNode.insertBefore(st, links[0].nextSibling);
    links[0].disabled = true;
    pararMovimento();
    void document.body.offsetHeight;
    await espera(800);
    var fC = foto(lista), Cc = resumo(fC); await espera(1100);
    var D = resumo(foto(lista));
    var antes = mudou(A, B), depois = mudou(Cc, D), instavel = {};
    antes.concat(depois).forEach(function (i) { instavel[i] = 1; });
    var naTroca = mudou(B, Cc), diferentes = naTroca.filter(function (i) { return !instavel[i]; });
    var ondeInstavel = {};
    Object.keys(instavel).forEach(function (i) { var w = onde(lista[i]); ondeInstavel[w] = (ondeInstavel[w] || 0) + 1; });
    var exemplos = diferentes.slice(0, 10).map(function (i) {
      var props = [];
      for (var k = 0; k < Math.max(fB[i].length, fC[i].length) && props.length < 6; k++) {
        if (fB[i][k] !== fC[i][k]) props.push(String(fB[i][k]).slice(0, 90) + '  ->  ' + String(fC[i][k]).slice(0, 90));
      }
      return { elemento: caminho(lista[i]), mudou: props };
    });
    return {
      arquivo: links[0].getAttribute('href'), regrasNovas: st.sheet ? st.sheet.cssRules.length : null,
      parados: parados, elementos: lista.length, elementosNoFim: elementos().length,
      instaveis: Object.keys(instavel).length, ondeInstaveis: ondeInstavel,
      naTrocaContandoInstaveis: naTroca.length, diferentes: diferentes.length, exemplos: exemplos,
    };
  };
})();`;

async function main() {
  const o = C.lerArgs(process.argv.slice(2), { flags: ['celular', 'perfil-novo'], apelidos: { mobile: 'celular' } }, USO);
  if (!o.url || !o.css || !o.substitui) { console.error('passe --url, --css e --substitui. --help mostra o uso.'); process.exit(2); }
  const css = fs.readFileSync(o.css, 'utf8');
  const tmp = path.join(os.tmpdir(), `conferir-troca-${process.pid}.js`);
  fs.writeFileSync(tmp, `window.__CSS_NOVO=${JSON.stringify(css)};\nwindow.__ALVO_LINK=${JSON.stringify(o.substitui)};\n${PAGINA}\n`);
  const opc = {
    url: o.url, celular: !!o.celular, wait: o.wait || 4000, after: o.after || 1500, 'hide-avisos': true,
    inject: [tmp], pausa: o.pausa, perfil: o.perfil, 'perfil-novo': !!o['perfil-novo'],
  };
  const medir = async (c) => {
    const x = await umaFoto(c, opc, {});
    if (!x.bloqueio && !x.erros.length) {
      try { x.medida = await c.ev('window.__conferirTroca()', true, 240000); } catch (e) { x.erros.push(e.message.slice(0, 300)); }
    }
    return x;
  };
  let r;
  try {
    if (C.ehLocal(o.url)) {
      const c = await C.abrirChrome({});
      try { r = await medir(c); } finally { await c.fechar(); }
    } else {
      r = await noAr(opc, async () => null, (s) => s.carregar(medir));
    }
  } finally {
    fs.rmSync(tmp, { force: true });
  }
  const m = r.medida || {};
  if (o.json) { fs.mkdirSync(path.dirname(path.resolve(o.json)), { recursive: true }); fs.writeFileSync(o.json, JSON.stringify(r, null, 1)); }
  console.log(linhaDeResumo('conferir_troca' + (o.celular ? ' (celular)' : ''), r));
  if (r.bloqueio === '1015') { process.exitCode = C.BLOQUEIO_1015; return; }
  if (r.bloqueio === 'desafio') { console.error('desafio do CDN ("você é humano?"): não contorne; conte à pessoa e pare as visitas'); process.exitCode = C.BLOQUEIO_DESAFIO; return; }
  if (m.erro || r.erros.length || r.medida === undefined) { console.error('ERRO:', m.erro || r.erros.join(' / ') || 'a medida não voltou'); process.exitCode = 1; return; }
  console.log(`${m.arquivo}: ${m.elementos} elementos (${m.elementosNoFim} no fim), ${m.instaveis} instáveis fora da conta, ` +
    `${m.diferentes} diferentes na troca (${m.naTrocaContandoInstaveis} contando os instáveis); parados: ${JSON.stringify(m.parados)}`);
  if (m.instaveis) console.log('instáveis por bloco:', JSON.stringify(m.ondeInstaveis));
  for (const e of m.exemplos) console.log('  ' + e.elemento + '\n    ' + e.mudou.join('\n    '));
  console.log(m.diferentes ? 'DIFERENTE: a troca muda a tela (veja os exemplos)'
    : `IGUAL nos ${m.elementos - m.instaveis} elementos conferidos` + (m.instaveis ? `; ${m.instaveis} instáveis ficaram fora da conta` : ''));
  process.exitCode = m.diferentes ? 1 : 0;
}

if (C.ehPrincipal(import.meta.url)) main().catch((e) => { console.error('ERRO:', e.message); process.exitCode = process.exitCode || 1; });
