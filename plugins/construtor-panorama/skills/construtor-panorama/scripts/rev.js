/* rev.js - medidas da revisão profunda (estados, Tab, mouse, celular, cor colada no admin), carregadas pelo
   rev.mjs em cada visita como window.__R. Só lê e mede; o único DOM que põe na página é: o <style> da prévia
   (R.ligarCss, na posição do plano), <style id="rev-semtrans"> (transition:none só nesta aba), <style id="rev-fix">
   (uma correção candidata, R.ligarFix), o bloco #rev-inline (teste de cor colada, tirado depois) e um tabindex
   temporário no ponto de partida do Tab (data-rev-ti, tirado depois). As funções devolvem números e textos curtos.
   Funções: varrer(raiz, max, todos) · sondar([[rótulo, seletor, 'texto'|'borda'|'fundo'|'estilo']]) · caixa(s) ·
   rolagem() · quemPassa() · fotoGuardar() / fotoComparar() · compararEscopo() · focoIni / focoInfo / desfocar /
   refocar / focoNoFim · bloquearTeclas() · inline(alvo, abrir, onde) / inlineTirar() · rolarTudo() · centro(sel)
   · estado(sel) · estiloTag(sel) · modalAberto() / fecharModal() · avisosVisiveis() · ligarCss() / desligarCss()
   · ligarFix(css) / tirarFix() · semTransicao() · html(sel, n). */
(function () {
  'use strict';
  var R = window.__R = {};
  /* o que não é "miolo" (cabeçalho, rodapé, avisos): fica de fora da varredura e do Tab, a não ser com todos=true.
     Troque com R.fora = '...' no plano, se a família do tema usar outros nomes. */
  R.fora = 'header, footer, .header, .footer, #lgpd-overlay, .lgpd-message, #app-overlay, .app-message, .menuHeader, .menu-mobile, .menuMobile, .promotionBar, .header-top-bar';
  function parse(s) {
    var m = String(s || '').match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\)/);
    if (!m) return null;
    var a = m[4] === undefined ? 1 : (String(m[4]).slice(-1) === '%' ? parseFloat(m[4]) / 100 : +m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a: a };
  }
  function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function lum(c) { return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b); }
  function mix(top, bot) { var a = top.a; return { r: top.r * a + bot.r * (1 - a), g: top.g * a + bot.g * (1 - a), b: top.b * a + bot.b * (1 - a), a: 1 }; }
  function ratio(fg, bg) { var a = lum(fg), b = lum(bg); var hi = Math.max(a, b), lo = Math.min(a, b); return Math.round((hi + 0.05) / (lo + 0.05) * 100) / 100; }
  function hex(c) { if (!c) return null; return '#' + [c.r, c.g, c.b].map(function (v) { v = Math.round(v); return (v < 16 ? '0' : '') + v.toString(16); }).join('') + (c.a !== undefined && c.a < 1 ? ' a' + Math.round(c.a * 100) / 100 : ''); }
  function hexp(h) { h = String(h).replace('#', ''); return { r: parseInt(h.substr(0, 2), 16), g: parseInt(h.substr(2, 2), 16), b: parseInt(h.substr(4, 2), 16), a: 1 }; }
  R.parse = parse; R.ratio = ratio; R.hex = hex; R.mix = mix;
  R.rc = function (a, b) { return ratio(parse(a) || hexp(a), parse(b) || hexp(b)); };
  var BRANCO = { r: 255, g: 255, b: 255, a: 1 };
  function nome(e) {
    if (!e || e.nodeType !== 1) return '';
    var s = e.tagName.toLowerCase();
    if (e.id && !/^block-/.test(e.id)) s += '#' + e.id;
    var cl = (typeof e.className === 'string' ? e.className : (e.getAttribute('class') || '')).trim().split(/\s+/).filter(function (c) { return c && !/^(lazy|loaded|owl-item$|cloned$)/.test(c); }).slice(0, 2);
    if (cl.length) s += '.' + cl.join('.');
    return s;
  }
  function caminho(e, n) { var o = []; for (var p = e, i = 0; p && p.nodeType === 1 && i < (n || 3); p = p.parentElement, i++) o.push(nome(p)); return o.join(' < '); }
  R.nome = nome; R.caminho = caminho;
  function opac(e) { var o = 1; for (var p = e; p && p.nodeType === 1; p = p.parentElement) o *= +getComputedStyle(p).opacity; return o; }
  function vis(e) {
    if (!e || e.nodeType !== 1) return false;
    var r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    var cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    if (opac(e) < 0.05) return false;
    if (r.right < 0 || r.left > Math.max(document.documentElement.clientWidth, document.documentElement.scrollWidth)) return false;
    return true;
  }
  R.vis = vis;
  function fundoReal(el) {
    var stack = [], quem = null;
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      var c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) { stack.push(c); if (c.a >= 1) { quem = e; break; } }
    }
    var base = BRANCO; for (var i = stack.length - 1; i >= 0; i--) base = mix(stack[i], base);
    return { cor: base, quem: quem };
  }
  R.fundoReal = function (el) { if (typeof el === 'string') el = document.querySelector(el); return el ? hex(fundoReal(el).cor) : null; };
  function grande(cs) { var px = parseFloat(cs.fontSize), w = +cs.fontWeight || 400; return px >= 24 || (px >= 18.66 && w >= 700); }
  function foraDoMiolo(e) { try { return !!(e.closest && e.closest(R.fora)); } catch (x) { return false; } }
  R.foraDoMiolo = foraDoMiolo;
  function texto(el) {
    var cs = getComputedStyle(el), fg = parse(cs.color), f = fundoReal(el);
    if (!fg) return null;
    var o = opac(el); fg = { r: fg.r, g: fg.g, b: fg.b, a: fg.a * o };
    var fgm = mix(fg, f.cor);
    return { cor: hex(parse(cs.color)), opac: Math.round(o * 100) / 100, fundo: hex(f.cor), fundoDe: f.quem ? caminho(f.quem, 2) : 'canvas', contraste: ratio(fgm, f.cor), px: cs.fontSize, peso: cs.fontWeight, grande: grande(cs) };
  }
  R.texto = function (sel) { var e = typeof sel === 'string' ? document.querySelector(sel) : sel; return e ? texto(e) : null; };
  function temTexto(e) { for (var c = e.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.nodeValue.replace(/[\s ]+/g, '').length > 0) return true; return false; }

  /* ---- a prévia do plano (posição da cascata do plano), uma correção candidata, sem transições ---- */
  R.ligarCss = function () { return window.__revLigar ? window.__revLigar() : { erro: 'o plano não tem css' }; };
  R.desligarCss = function () { return window.__revDesligar ? window.__revDesligar() : 0; };
  R.ligarFix = function (css) { R.tirarFix(); var s = document.createElement('style'); s.id = 'rev-fix'; s.setAttribute('data-previa', 'rev-fix'); s.textContent = css; document.head.appendChild(s); document.body.offsetHeight; return 'fix ligado'; };
  R.tirarFix = function () { var s = document.getElementById('rev-fix'); if (s) s.parentNode.removeChild(s); return 1; };
  R.html = function (sel, n) { var e = document.querySelector(sel); return e ? e.outerHTML.replace(/\s+/g, ' ').slice(0, n || 1500) : null; };
  R.semTransicao = function () { if (document.getElementById('rev-semtrans')) return 1; var s = document.createElement('style'); s.id = 'rev-semtrans'; s.setAttribute('data-previa', 'rev-semtrans'); s.textContent = '*,*::before,*::after{transition:none!important;}'; document.head.appendChild(s); return 1; };
  R.avisosVisiveis = function () {
    return [].slice.call(document.querySelectorAll('body *')).filter(function (e) { return getComputedStyle(e).position === 'fixed' && vis(e) && e.getBoundingClientRect().height > 20; }).map(function (e) { var r = e.getBoundingClientRect(); return caminho(e, 2) + ' @' + Math.round(r.top) + '..' + Math.round(r.bottom) + ' bg ' + getComputedStyle(e).backgroundColor; }).slice(0, 15);
  };

  /* ---- varredura de textos abaixo do mínimo (4,5:1; 3:1 se grande) ---- */
  R.varrer = function (raizSel, max, todos) {
    var raiz = raizSel ? (typeof raizSel === 'string' ? document.querySelector(raizSel) : raizSel) : document.body; if (!raiz) return { erro: 'sem raiz ' + raizSel };
    var all = raiz.getElementsByTagName('*'), grupos = {}, total = 0, ruins = 0;
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (/^(SCRIPT|STYLE|NOSCRIPT|svg|path|TEMPLATE|IFRAME|OPTION)$/i.test(e.tagName)) continue;
      if (e.closest('svg') || (!todos && foraDoMiolo(e))) continue;
      if (!temTexto(e) || !vis(e)) continue;
      total++;
      var t = texto(e); if (!t) continue;
      if (t.contraste < (t.grande ? 3 : 4.5)) {
        ruins++;
        var k = nome(e.parentElement) + ' > ' + nome(e) + ' | ' + t.cor + ' / ' + t.fundo;
        var g = grupos[k] || (grupos[k] = { onde: caminho(e, 3), cor: t.cor, opac: t.opac, fundo: t.fundo, fundoDe: t.fundoDe, contraste: t.contraste, px: t.px, n: 0, amostra: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40), y: Math.round(e.getBoundingClientRect().top + scrollY) });
        g.n++;
      }
    }
    var l = Object.keys(grupos).map(function (k) { return grupos[k]; }).sort(function (a, b) { return a.contraste - b.contraste; });
    return { textos: total, abaixo: ruins, grupos: l.slice(0, max || 25), gruposTotal: l.length };
  };

  /* ---- sondas: [rótulo, seletor, tipo] -> uma linha curta cada ---- */
  R.sondar = function (lista) {
    var o = {};
    lista.forEach(function (it) {
      var label = it[0], sel = it[1], tipo = it[2] || 'texto';
      var els; try { els = [].slice.call(document.querySelectorAll(sel)); } catch (x) { o[label] = 'seletor inválido'; return; }
      var e = els.filter(vis)[0];
      if (!e) { o[label] = 'não visível (' + els.length + ')'; return; }
      var cs = getComputedStyle(e);
      if (tipo === 'texto') { var t = texto(e); o[label] = t.cor + ' em ' + t.fundo + ' = ' + t.contraste + (t.opac < 1 ? ' (opac ' + t.opac + ')' : '') + ' [' + t.px + '/' + t.peso + ']'; }
      else if (tipo === 'borda') {
        var bc = parse(cs.borderTopColor), own = parse(cs.backgroundColor);
        var fora = fundoReal(e.parentElement).cor, dentro = own && own.a > 0 ? mix(own, fora) : fora;
        o[label] = 'borda ' + hex(bc) + ' ' + cs.borderTopWidth + ' | fora ' + hex(fora) + ' = ' + (bc && bc.a > 0 ? ratio(mix(bc, fora), fora) : 0) + ' | dentro ' + hex(dentro) + ' = ' + (bc && bc.a > 0 ? ratio(mix(bc, dentro), dentro) : 0);
      } else if (tipo === 'fundo') { var f = fundoReal(e); o[label] = 'fundo real ' + hex(f.cor) + ' de ' + (f.quem ? caminho(f.quem, 2) : 'canvas'); }
      else if (tipo === 'estilo') { o[label] = { bg: cs.backgroundColor, cor: cs.color, borda: cs.borderTopColor + ' ' + cs.borderTopWidth, sombra: cs.boxShadow, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, op: cs.opacity }; }
    });
    return o;
  };

  /* ---- caixas e rolagem ---- */
  R.caixa = function (e) { if (typeof e === 'string') e = document.querySelector(e); if (!e) return null; var r = e.getBoundingClientRect(); return [Math.round((r.left + scrollX) * 2) / 2, Math.round((r.top + scrollY) * 2) / 2, Math.round(r.width * 2) / 2, Math.round(r.height * 2) / 2]; };
  R.caixas = function (sels) { var o = {}; sels.forEach(function (s) { var els = document.querySelectorAll(s); o[s] = els.length ? R.caixa(els[0]) : null; }); return o; };
  R.rolagem = function () { var de = document.documentElement; return de.scrollWidth - de.clientWidth; };
  R.quemPassa = function () {
    var vw = document.documentElement.clientWidth, o = [];
    [].slice.call(document.querySelectorAll('body *')).forEach(function (e) {
      var r = e.getBoundingClientRect(); if (!(r.width > 0 && (r.right > vw + 1 || r.left < -1))) return;
      if (getComputedStyle(e).position === 'fixed') return;
      for (var p = e.parentElement; p && p !== document.body; p = p.parentElement) if (getComputedStyle(p).overflowX !== 'visible') return;
      o.push([caminho(e, 2), Math.round(r.left), Math.round(r.right)]);
    });
    return o.slice(0, 8);
  };

  /* ---- foto do estilo computado de todos os elementos: "nada mudou" (mudaram 0) ---- */
  var PROPS = ['color', 'background-color', 'background-image', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-top-width', 'border-bottom-width', 'border-radius', 'box-shadow', 'outline-color', 'outline-style', 'opacity', 'font-size', 'font-weight', 'font-family', 'line-height', 'padding', 'margin', 'display', 'visibility', 'position', 'width', 'height', 'fill', 'stroke', 'text-decoration-line', 'color-scheme', 'filter', 'transform', 'z-index'];
  R.fotoEstilo = function () {
    var all = document.body.getElementsByTagName('*'), o = [];
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/i.test(e.tagName) || (e.hasAttribute && e.hasAttribute('data-previa'))) { o.push(null); continue; }
      var cs = getComputedStyle(e);
      if (cs.display === 'none') { o.push('none'); continue; }
      var v = PROPS.map(function (p) { return cs.getPropertyValue(p); });
      var b = getComputedStyle(e, '::before'), a = getComputedStyle(e, '::after');
      v.push(b.content + '|' + b.backgroundColor + '|' + b.color + '|' + b.backgroundImage.slice(0, 200) + '|' + b.borderTopColor);
      v.push(a.content + '|' + a.backgroundColor + '|' + a.color + '|' + a.backgroundImage.slice(0, 200) + '|' + a.borderTopColor);
      var r = e.getBoundingClientRect(); v.push(Math.round(r.left + scrollX) + ',' + Math.round(r.top + scrollY) + ',' + Math.round(r.width) + ',' + Math.round(r.height));
      o.push(v.join('\u0001'));
    }
    return o;
  };
  R.fotoBase = null;
  R.fotoGuardar = function () { R.fotoBase = R.fotoEstilo(); return R.fotoBase.filter(function (x) { return x && x !== 'none'; }).length; };
  function diff(b, cur) {
    var all = document.body.getElementsByTagName('*');
    if (b.length !== cur.length) return { erro: 'o número de elementos mudou ' + b.length + ' x ' + cur.length };
    var dif = [], n = 0;
    for (var i = 0; i < cur.length; i++) {
      if (cur[i] === null || b[i] === null) continue; n++;
      if (cur[i] !== b[i]) {
        var pa = (b[i] || '').split('\u0001'), pb = (cur[i] || '').split('\u0001'), props = [];
        for (var k = 0; k < Math.max(pa.length, pb.length); k++) if (pa[k] !== pb[k]) props.push((PROPS[k] || ['::before', '::after', 'caixa'][k - PROPS.length]) + ': ' + String(pa[k]).slice(0, 50) + ' -> ' + String(pb[k]).slice(0, 50));
        dif.push({ el: caminho(all[i], 3), props: props.slice(0, 4) });
      }
    }
    return { comparados: n, mudaram: dif.length, amostra: dif.slice(0, 15) };
  }
  R.fotoComparar = function () { if (!R.fotoBase) return { erro: 'sem base (R.fotoGuardar antes)' }; return diff(R.fotoBase, R.fotoEstilo()); };
  /* escopo na mesma tarefa (nada anda entre as fotos): sem a prévia, com a prévia, sem de novo.
     instaveisSemPrevia > 0 = algo mexe sozinho (carrossel, relógio): esses elementos ficam fora da conta. */
  R.compararEscopo = function () {
    var all = document.body.getElementsByTagName('*');
    var b1 = R.fotoEstilo(); var lig = R.ligarCss(); if (lig && lig.erro) return lig;
    var com = R.fotoEstilo(); R.desligarCss(); var b2 = R.fotoEstilo();
    var mudou = [], instavel = 0;
    for (var i = 0; i < b1.length; i++) {
      if (b1[i] === null) continue;
      if (b1[i] !== b2[i]) { instavel++; continue; }
      if (com[i] !== b1[i]) mudou.push(caminho(all[i], 3));
    }
    return { elementos: b1.length, regras: lig && lig.regras, mudaramComPrevia: mudou.length, amostra: mudou.slice(0, 12), instaveisSemPrevia: instavel, body: document.body.className };
  };

  /* ---- foco de teclado: o rev.mjs aperta Tab de verdade; aqui só se lê o que ficou focado ---- */
  R._focado = null;
  R.focoIni = function (sel) {
    var e = document.querySelector(sel); if (!e) return false;
    if (!e.hasAttribute('tabindex')) { e.setAttribute('tabindex', '-1'); e.setAttribute('data-rev-ti', '1'); }
    e.focus({ preventScroll: false }); return nome(e);
  };
  R.focoLimpa = function () { [].slice.call(document.querySelectorAll('[data-rev-ti]')).forEach(function (e) { e.removeAttribute('tabindex'); e.removeAttribute('data-rev-ti'); }); return 1; };
  function snap(e) { var cs = getComputedStyle(e); return { os: cs.outlineStyle, ow: cs.outlineWidth, oc: cs.outlineColor, oo: cs.outlineOffset, bs: cs.boxShadow, bg: cs.backgroundColor, co: cs.color }; }
  R.focoInfo = function (pad) {
    var e = document.activeElement; if (!e || e === document.body || e === document.documentElement) return null;
    R._focado = e;
    var r = e.getBoundingClientRect(), f = snap(e), uniao = false;
    if (r.width < 3 || r.height < 3) { /* link sem caixa própria: a união das caixas dos filhos */
      var x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
      [].slice.call(e.querySelectorAll('*')).forEach(function (k) { var kr = k.getBoundingClientRect(); if (kr.width > 2 && kr.height > 2) { x1 = Math.min(x1, kr.left); y1 = Math.min(y1, kr.top); x2 = Math.max(x2, kr.right); y2 = Math.max(y2, kr.bottom); } });
      if (x2 > x1) { r = { left: x1, top: y1, right: x2, bottom: y2, width: x2 - x1, height: y2 - y1 }; uniao = true; }
    }
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2, coberto = null;
    if (cx >= 0 && cy >= 0 && cx < innerWidth && cy < innerHeight) { var top = document.elementFromPoint(cx, cy); if (top && top !== e && !e.contains(top) && !top.contains(e)) coberto = caminho(top, 2); }
    else coberto = 'fora da tela (' + Math.round(cx) + ',' + Math.round(cy) + ')';
    var contr = null, fundoAo = null;
    if (f.os !== 'none' && parseFloat(f.ow) > 0) {
      var oc = parse(f.oc); var bgc = parseFloat(f.oo) < 0 ? fundoReal(e).cor : fundoReal(e.parentElement).cor;
      fundoAo = hex(bgc); contr = oc ? ratio(mix(oc, bgc), bgc) : null;
    }
    pad = pad || 8;
    var vw = document.documentElement.clientWidth, vh = innerHeight;
    var cx1 = Math.max(0, r.left - pad), cy1 = Math.max(0, r.top - pad), cx2 = Math.min(vw, r.right + pad), cy2 = Math.min(vh, r.bottom + pad);
    var clip = (cx2 - cx1 > 2 && cy2 - cy1 > 2) ? { x: cx1 + scrollX, y: cy1 + scrollY, width: cx2 - cx1, height: cy2 - cy1 } : null;
    return { el: caminho(e, 3), uniaoDosFilhos: uniao, tag: e.tagName, txt: (e.textContent || e.value || e.getAttribute('aria-label') || e.getAttribute('title') || '').replace(/\s+/g, ' ').trim().slice(0, 30), fv: e.matches(':focus-visible'), miolo: !foraDoMiolo(e), outline: f.os + ' ' + f.ow + ' ' + f.oc + ' off ' + f.oo, outlineContraste: contr, fundoAoLado: fundoAo, sombra: f.bs, coberto: coberto, clip: clip, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], rectNoClip: clip ? [r.left - cx1, r.top - cy1, r.width, r.height] : null };
  };
  R.desfocar = function () { var e = R._focado; if (e && e.blur) e.blur(); document.body.offsetHeight; return 1; };
  R.refocar = function () { var e = R._focado; if (!e) return false; e.focus({ preventScroll: true }); document.body.offsetHeight; return e.matches(':focus-visible'); };
  R.focoNoFim = function () { var a = document.activeElement; if (a && a.blur) a.blur(); R.focoLimpa(); return 1; };
  /* Tab e Enter não chegam aos scripts da loja no keyup/keypress (um campo de CEP que consulta o frete no keyup,
     por exemplo); a navegação de foco do navegador, no keydown, continua igual */
  R.bloquearTeclas = function () {
    if (window.__revTeclas) return 'já';
    ['keyup', 'keypress'].forEach(function (t) { window.addEventListener(t, function (e) { if (e.key === 'Tab' || e.keyCode === 9) e.stopImmediatePropagation(); }, true); });
    window.__revTeclas = 1; return 'ok';
  };

  /* ---- cor colada no admin: o texto de uma descrição pode trazer cor e fundo no próprio HTML (style="", <font
     color>, bgcolor). Este teste põe um bloco com os casos comuns DENTRO da área (só nesta aba, tirado depois) e
     mede o contraste de cada um com o tema ligado. alvo: a área (ex.: a descrição do produto); abrir: um seletor a
     receber is-open, se a área vem fechada; onde: 'afterbegin' (padrão) ou 'beforeend'. ---- */
  var TESTE = '<div id="rev-inline">' +
    '<p class="r1" style="color:#000">R1 preto colado color:#000</p>' +
    '<p class="r2"><font color="#333">R2 font color 333</font></p>' +
    '<p class="r3">R3 normal com <span class="r3s" style="color:#c00000">destaque vermelho c00000</span> no meio</p>' +
    '<p class="r4" style="background:#fff;color:#444">R4 parágrafo fundo branco + 444</p>' +
    '<table class="r5" bgcolor="#ffffff" border="1"><tbody><tr><td class="r5td">R5 tabela bgcolor branco, texto sem cor</td></tr></tbody></table>' +
    '<table class="r6" bgcolor="#f2f2f2"><tbody><tr><td bgcolor="#ffffff" class="r6td"><font color="#000000">R6 célula bgcolor + font 000</font></td></tr></tbody></table>' +
    '</div>';
  R.inline = function (alvoSel, abrirSel, onde) {
    var alvo = document.querySelector(alvoSel); if (!alvo) return 'sem alvo ' + alvoSel;
    if (abrirSel) [].slice.call(document.querySelectorAll(abrirSel)).forEach(function (e) { e.classList.add('is-open'); });
    R.inlineTirar();
    alvo.insertAdjacentHTML(onde || 'afterbegin', TESTE);
    document.body.offsetHeight;
    var o = { alvo: caminho(alvo, 2) };
    [['r1', '.r1'], ['r2 font', '.r2 font'], ['r3 texto', '.r3'], ['r3 span c00000', '.r3s'], ['r4', '.r4'], ['r5 td', '.r5td'], ['r6 font', '.r6 font'], ['r6 td', '.r6td']].forEach(function (p) {
      var e = document.querySelector('#rev-inline ' + p[1]);
      if (!e) { o[p[0]] = 'não achei'; return; }
      if (!vis(e)) { o[p[0]] = 'invisível'; return; }
      var t = texto(e); o[p[0]] = t.cor + ' em ' + t.fundo + ' = ' + t.contraste + (t.contraste < 4.5 ? ' ABAIXO' : '');
    });
    return o;
  };
  R.inlineTirar = function () { var old = document.getElementById('rev-inline'); if (old) old.parentNode.removeChild(old); return 1; };

  /* ---- rolagem, alvo do mouse e estado de um controle ---- */
  R.rolarTudo = function () {
    return (async function () { document.documentElement.style.scrollBehavior = 'auto'; var h = document.documentElement.scrollHeight; for (var y = 0; y < h; y += 700) { scrollTo(0, y); await new Promise(function (r) { setTimeout(r, 130); }); h = document.documentElement.scrollHeight; } scrollTo(0, 0); await new Promise(function (r) { setTimeout(r, 700); }); return h; })();
  };
  R.centro = function (sel, idx) { var els = [].slice.call(document.querySelectorAll(sel)).filter(vis); var e = els[idx || 0]; if (!e) return null; e.scrollIntoView({ block: 'center', inline: 'nearest' }); var r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 60), el: caminho(e, 2) }; };
  R.estado = function (sel, idx) {
    var els = [].slice.call(document.querySelectorAll(sel)).filter(vis); var e = els[idx || 0]; if (!e) return null;
    var cs = getComputedStyle(e), f = fundoReal(e.parentElement).cor, own = parse(cs.backgroundColor), dentro = own && own.a > 0 ? mix(own, f) : f;
    var fg = parse(cs.color), bc = parse(cs.borderTopColor);
    return { el: caminho(e, 2), bg: cs.backgroundColor, cor: cs.color, borda: cs.borderTopColor + ' ' + cs.borderTopWidth, sombra: cs.boxShadow.slice(0, 90), textoContraste: fg ? ratio(mix(fg, dentro), dentro) : null, bordaVsFora: bc && parseFloat(cs.borderTopWidth) > 0 ? ratio(mix(bc, f), f) : null, fundoVsFora: ratio(dentro, f), fora: hex(f), dentro: hex(dentro), hover: e.matches(':hover') };
  };
  R.estiloTag = function (sel) {
    var e = [].slice.call(document.querySelectorAll(sel)).filter(vis)[0] || document.querySelector(sel);
    if (!e) return null; var cs = getComputedStyle(e), b = getComputedStyle(e, '::before');
    return { onde: caminho(e, 3), bg: cs.backgroundColor, cor: cs.color, borda: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor, raio: cs.borderTopLeftRadius, fonte: cs.fontFamily.split(',')[0] + ' ' + cs.fontSize + '/' + cs.fontWeight, larg: Math.round(e.getBoundingClientRect().width), alt: Math.round(e.getBoundingClientRect().height), antes: (b.content + ' ' + b.backgroundImage).slice(0, 90) };
  };

  /* ---- janelas (modal) que o plano abriu com um clique ---- */
  var MODAIS = '.novaJanela, .modal, [role="dialog"]';
  function modais() { return [].slice.call(document.querySelectorAll(MODAIS)).filter(function (e) { return vis(e) && e.getBoundingClientRect().height > 60; }); }
  R.modalAberto = function () {
    var m = modais(); if (!m.length) return { aberto: false };
    var e = m[m.length - 1], inner = e.querySelector('.inner') || e, cs = getComputedStyle(inner);
    return { aberto: true, onde: caminho(inner, 2), fundo: cs.backgroundColor, cor: cs.color, varredura: R.varrer(inner, 30, true) };
  };
  R.fecharModal = function () {
    var m = modais(); if (!m.length) return 'já fechada';
    var b = [].slice.call(m[m.length - 1].querySelectorAll('[class*="close"],[class*="fechar"],[class*="Close"]')).filter(vis)[0];
    if (b) { b.click(); return 'fechada pelo botão ' + caminho(b, 2); }
    return 'não achei o fechar';
  };
})();
