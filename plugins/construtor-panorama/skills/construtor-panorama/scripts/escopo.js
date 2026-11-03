/* escopo.js - na página (de preferência numa cópia aberta sem rede, shot.mjs --copia), duas leituras rápidas:
   window.__folhas()      a ordem real das folhas de estilo: origem, regras, media, desligada (prévia --substitui)
   window.__escopo(op)    quantos elementos cada regra de UMA folha de prévia pega, e se ela vaza:
     op.folha       id do <style> da prévia (padrão 'previa-css', o que shot.mjs --css põe)
     op.fora        seletores que a prévia não devia tocar (padrão: cabeçalho, rodapé, avisos)
     op.paginas     classes de outros tipos de página a simular no <body> (padrão: home, carrinho, checkout, conta)
     op.tirar       regex (texto) das classes de tipo de página a tirar antes de simular (padrão: page-[a-z-]+)
     op.classeTema  a classe de época (modo de época): mede também SEM ela, que tem de dar 0 elementos
   Só simula: troca a classe do <body> e devolve a original na mesma chamada; não clica nem grava nada.
   Os estados (:hover, :focus...) ficam de fora da contagem (os seletores são medidos sem eles).
   Carregue com shot.mjs --inject scripts/escopo.js --measure "__escopo({classeTema:'skin-x'})" (com --css). */
(function () {
  'use strict';
  function splitTop(t) { var out = [], d = 0, cur = ''; for (var i = 0; i < t.length; i++) { var ch = t[i]; if (ch === '(' || ch === '[') d++; else if (ch === ')' || ch === ']') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; }
  function limpa(s) { return s.replace(/:(hover|focus-visible|focus-within|focus|active|visited)\b/g, '').replace(/::?(before|after|placeholder|marker|selection|-webkit-[a-z-]+)\b/g, '').replace(/:(?=\s|$|,|>|\+|~)/g, '') || '*'; }
  function regrasDe(sheet) {
    var out = [];
    (function walk(rules) { for (var i = 0; i < rules.length; i++) { var r = rules[i]; if (r.selectorText) out.push(r); else if (r.cssRules) walk(r.cssRules); } })(sheet.cssRules);
    return out;
  }
  function nome(el) { return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [].slice.call(el.classList, 0, 2).join('.') : ''); }
  window.__folhas = function () {
    return [].map.call(document.styleSheets, function (sh, i) {
      var n = sh.ownerNode, c = null; try { c = sh.cssRules.length; } catch (e) { c = 'ilegível'; }
      var orig = !n ? '' : n.hasAttribute('data-era-style') ? 'style' + (n.id ? '#' + n.id : '') + ' (cópia)' : n.tagName === 'LINK' ? (n.getAttribute('href') || '').slice(0, 90) : 'style' + (n.id ? '#' + n.id : '') + (n.hasAttribute('data-previa') ? ' (prévia)' : '');
      return i + ' ' + orig + ' | regras ' + c + (sh.media && sh.media.mediaText ? ' | @media ' + sh.media.mediaText : '') + (sh.disabled ? ' | DESLIGADA' : '') + (n && n.closest && n.closest('body') ? ' | no body' : '');
    });
  };
  window.__escopo = function (op) {
    op = op || {};
    var st = document.getElementById(op.folha || 'previa-css');
    if (!st || !st.sheet) return { erro: 'não achei o <style id="' + (op.folha || 'previa-css') + '">: ligue a prévia antes (shot.mjs --css ...)' };
    var regras = regrasDe(st.sheet);
    var FORA = op.fora || 'header, footer, .header, .footer, #lgpd-overlay, .lgpd-message, #app-overlay, .app-message';
    function conta() {
      var n = 0, l = [];
      regras.forEach(function (r, i) { splitTop(r.selectorText).forEach(function (s) { var e = []; try { e = document.querySelectorAll(limpa(s)); } catch (x) {} if (e.length) { n += e.length; if (l.indexOf(i) < 0) l.push(i); } }); });
      return { elementos: n, regras: l.length };
    }
    var res = { regras: regras.length };
    var fora = [];
    regras.forEach(function (r, i) {
      splitTop(r.selectorText).forEach(function (s) {
        var e = []; try { e = [].slice.call(document.querySelectorAll(limpa(s))); } catch (x) {}
        e.forEach(function (el) { var c = el.closest(FORA); if (c && fora.length < 60) fora.push('regra ' + i + ' | ' + s.slice(0, 90) + ' -> ' + nome(el) + ' dentro de ' + nome(c)); });
      });
    });
    res.foraDoMiolo = fora;
    var b = document.body, orig = b.className, tirar = new RegExp('\\b(' + (op.tirar || 'page-[a-z-]+') + ')\\b', 'g');
    try {
      res.estaPagina = conta();
      (op.paginas || ['page-home', 'page-cart', 'page-checkout', 'page-account']).forEach(function (pc) { b.className = orig.replace(tirar, ' ') + ' ' + pc; res[pc] = conta(); });
      if (op.classeTema) { b.className = orig.replace(new RegExp('\\b' + op.classeTema + '\\b', 'g'), ' '); res.semClasseDoTema = conta(); }
    } finally { b.className = orig; }
    return res;
  };
})();
