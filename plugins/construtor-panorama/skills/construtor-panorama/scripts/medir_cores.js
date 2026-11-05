/* medir_cores.js - mapa de cores de uma página, para mudanças que trocam fundo ou cor de texto (um fundo escuro,
   um tema de época). SÓ LEITURA: não clica, não digita e não muda nada na página.
   Carregue na página (rodada.mjs --medir, shot.mjs --inject scripts/medir_cores.js, ou colado na aba) e chame:
     window.__medirCores()                         rápido: fundos, textos, controles, contraste, rolagem
     window.__medirCores({quemPinta: true})        mais lento: diz qual folha e qual regra pinta cada parte
     window.__medirCores({mapa: {...}})            troca o mapa de seletores (padrão: um mapa genérico)
     window.__medirRolagem()                       só a rolagem lateral e quem a causa
   O mapa: { regioes: {rótulo: seletor}, textos: {...}, controles: {...}, fotos: [seletores],
             textoDoAdmin: [seletores de áreas com texto escrito no admin, onde cor colada aparece] }.
   Um mapa medido na família /dist está em scripts/mapas/familia-dist.json (medido numa loja, 2026-11: confira
   os seletores na sua, catalogo-tema-base.md). Noutra família, monte o mapa com os seletores do catálogo dela.
   Devolve:
     pagina          url (sem o nc), classes do <body>, largura, dpr
     rolagem         scrollWidth - clientWidth e os elementos que passam da borda direita sem ancestral que corte
     regioes/textos/controles  fundo próprio e fundo REAL, cor, contraste, borda, foco (só os visíveis)
     baixoContraste  todo texto visível abaixo de 4,5:1 (3:1 se grande), agrupado, os piores primeiro
     superficies     área por cor de fundo opaca; caixasClaras: as maiores caixas claras (o que ainda é claro)
     fotos           caixas das fotos (para olhar no print o fundo branco das fotos)
     corColada       cor e fundo escritos no próprio HTML (style="", <font color>, bgcolor) nas áreas do admin
     quemPinta       (opcional) a regra vencedora de background-color, color e border-top-color de cada parte
   O contraste é medido contra o fundo REAL: sobe pelos ancestrais compondo as transparências até um fundo opaco.
   Com uma imagem ou degradê no caminho, o item sai com sobreImagem (o número pode não valer: olhe o print). */
(function () {
  'use strict';
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
  function hex(c) { if (!c) return null; var h = '#' + [c.r, c.g, c.b].map(function (v) { v = Math.round(v); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); return c.a !== undefined && c.a < 1 ? h + ' a' + Math.round(c.a * 100) / 100 : h; }
  function r1(v) { return Math.round(v * 10) / 10; }
  function box(e) { var r = e.getBoundingClientRect(); return { x: r1(r.left + scrollX), y: r1(r.top + scrollY), w: r1(r.width), h: r1(r.height) }; }
  function vis(e) {
    if (!e || e.nodeType !== 1) return false;
    var r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    var cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
    for (var p = e; p && p.nodeType === 1; p = p.parentElement) { if (+getComputedStyle(p).opacity === 0) return false; }
    return true;
  }
  /* caminho curto e legível: tag.classe1.classe2 < pai < avô (ids só quando não são #block-...) */
  function nome(e) {
    if (!e || e.nodeType !== 1) return '';
    var s = e.tagName.toLowerCase();
    if (e.id && !/^block-/.test(e.id)) s += '#' + e.id;
    var cl = (typeof e.className === 'string' ? e.className : (e.getAttribute('class') || '')).trim().split(/\s+/).filter(function (c) { return c && !/^(lazy|loaded|owl-|active$|cloned$)/.test(c); }).slice(0, 2);
    if (cl.length) s += '.' + cl.join('.');
    return s;
  }
  function caminho(e, n) { var out = []; for (var p = e, i = 0; p && p.nodeType === 1 && i < (n || 3); p = p.parentElement, i++) out.push(nome(p)); return out.join(' < '); }
  var BRANCO = { r: 255, g: 255, b: 255, a: 1 };
  function fundoReal(el) {
    var stack = [], img = null, quem = null;
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      var cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && !img) img = nome(e);
      var c = parse(cs.backgroundColor);
      if (c && c.a > 0) { stack.push(c); if (c.a >= 1) { quem = e; break; } }
    }
    var base = BRANCO;
    for (var i = stack.length - 1; i >= 0; i--) base = mix(stack[i], base);
    return { cor: base, hex: hex(base), quem: quem ? caminho(quem, 2) : '(canvas branco)', sobreImagem: img };
  }
  function grande(cs) { var px = parseFloat(cs.fontSize), w = +cs.fontWeight || (cs.fontWeight === 'bold' ? 700 : 400); return px >= 24 || (px >= 18.66 && w >= 700); }
  /* a fonte que de fato desenha: a primeira da lista com @font-face carregado, ou uma genérica */
  function fonteUsada(cs) {
    var fams = cs.fontFamily.split(',').map(function (f) { return f.trim().replace(/^["']|["']$/g, ''); });
    var faces = {};
    /* Array.from, e não document.fonts.forEach: numa cópia salva (MHTML) aberta sem rede, o forEach do
       FontFaceSet quebrou com "The provided callback is no longer runnable" (medido, 2026-11-04) */
    if (document.fonts) {
      try { Array.from(document.fonts).forEach(function (ff) { var n = ff.family.replace(/["']/g, ''); faces[n] = faces[n] || ff.status === 'loaded'; }); }
      catch (x) { /* sem a lista de fontes: segue pelo document.fonts.check abaixo */ }
    }
    for (var i = 0; i < fams.length; i++) {
      var f = fams[i];
      if (/^(serif|sans-serif|monospace|cursive|fantasy|system-ui|-apple-system|ui-sans-serif|ui-serif)$/.test(f)) return f + ' (genérica)';
      if (f in faces) { if (faces[f]) return f; continue; }
      try { if (document.fonts && document.fonts.check('16px "' + f + '"')) return f + ' (do sistema?)'; } catch (x) {}
    }
    return '(nenhuma da lista)';
  }
  function textoDe(el, comFonte) {
    var cs = getComputedStyle(el), fg = parse(cs.color), f = fundoReal(el);
    var fgm = fg ? mix(fg, f.cor) : null;
    var o = { cor: hex(fg), fundo: f.hex, fundoDe: f.quem, contraste: fgm ? ratio(fgm, f.cor) : null, tamanho: cs.fontSize, peso: cs.fontWeight, fonte: cs.fontFamily.split(',')[0].replace(/["']/g, ''), grande: grande(cs) };
    if (comFonte) o.fonteUsada = fonteUsada(cs);
    if (f.sobreImagem) o.sobreImagem = f.sobreImagem;
    if (cs.textDecorationLine && cs.textDecorationLine !== 'none') o.decoracao = cs.textDecorationLine;
    var inl = el.getAttribute('style') || ''; if (/color|background/i.test(inl)) o.inline = inl.slice(0, 120);
    return o;
  }
  function primeiro(sel) {
    var all; try { all = [].slice.call(document.querySelectorAll(sel)); } catch (x) { return { erro: 'seletor inválido' }; }
    var v = all.filter(vis);
    return { el: v[0] || null, total: all.length, visiveis: v.length };
  }

  /* mapa genérico: serve em qualquer página; um mapa da família do tema mede bem mais */
  var MAPA_GENERICO = {
    regioes: { 'body': 'body', 'cabeçalho': 'header, .header', 'conteúdo': 'main, #area-body, .main-container', 'rodapé': 'footer, .footer' },
    textos: { 'h1': 'h1', 'h2': 'h2', 'parágrafo': 'main p, #area-body p, p', 'link': 'main a[href], #area-body a[href], a[href]' },
    controles: { 'botão': 'button, .btn, [type=submit]', 'campo': 'input[type=text], input[type=search], input:not([type]), textarea', 'select': 'select' },
    fotos: ['main img, #area-body img'],
    textoDoAdmin: []
  };

  function regiao(sel) {
    var p = primeiro(sel); if (!p.el) return { total: p.total || 0, visiveis: 0 };
    var e = p.el, cs = getComputedStyle(e), f = fundoReal(e);
    var o = { total: p.total, visiveis: p.visiveis, el: caminho(e, 2), caixa: box(e), fundoProprio: hex(parse(cs.backgroundColor)), fundoReal: f.hex, fundoDe: f.quem };
    if (cs.backgroundImage !== 'none') o.imagem = cs.backgroundImage.slice(0, 90);
    var bw = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
    if (bw > 0) o.borda = [cs.borderTopWidth, cs.borderTopStyle, hex(parse(cs.borderTopColor)), '| baixo', cs.borderBottomWidth, hex(parse(cs.borderBottomColor))].join(' ');
    if (cs.boxShadow !== 'none') o.sombra = cs.boxShadow.slice(0, 80);
    if (parseFloat(cs.borderTopLeftRadius)) o.raio = cs.borderTopLeftRadius;
    o.texto = hex(parse(cs.color));
    if (/color|background/i.test(e.getAttribute('style') || '')) o.inline = (e.getAttribute('style') || '').slice(0, 120);
    return o;
  }
  function texto(sel) {
    var p = primeiro(sel); if (!p.el) return { total: p.total || 0, visiveis: 0 };
    var o = textoDe(p.el, true); o.total = p.total; o.visiveis = p.visiveis; o.el = caminho(p.el, 2); o.amostra = (p.el.innerText || p.el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    o.caixa = box(p.el);
    return o;
  }
  function controle(sel) {
    var p = primeiro(sel); if (!p.el) return { total: p.total || 0, visiveis: 0 };
    var e = p.el, cs = getComputedStyle(e), fundoAtras = fundoReal(e.parentElement || e), f = fundoReal(e);
    var fg = parse(cs.color), bc = parse(cs.borderTopColor), bw = parseFloat(cs.borderTopWidth) || 0;
    var o = { total: p.total, visiveis: p.visiveis, el: caminho(e, 2), caixa: box(e), fundoProprio: hex(parse(cs.backgroundColor)), fundoReal: f.hex, fundoAtras: fundoAtras.hex,
      texto: hex(fg), contrasteTexto: fg ? ratio(mix(fg, f.cor), f.cor) : null, tamanho: cs.fontSize, peso: cs.fontWeight,
      borda: bw ? (cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + hex(bc)) : 'sem', raio: cs.borderTopLeftRadius,
      amostra: (e.innerText || e.value || e.getAttribute('placeholder') || '').replace(/\s+/g, ' ').trim().slice(0, 30) };
    if (bw && bc && bc.a > 0) o.contrasteBorda = ratio(mix(bc, fundoAtras.cor), fundoAtras.cor);
    var fp = parse(cs.backgroundColor); if (fp && fp.a > 0) o.contrasteFundoVsAtras = ratio(mix(fp, fundoAtras.cor), fundoAtras.cor);
    if (cs.backgroundImage !== 'none') o.imagem = cs.backgroundImage.slice(0, 90);
    if (cs.boxShadow !== 'none') o.sombra = cs.boxShadow.slice(0, 60);
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName)) { o.placeholder = e.getAttribute('placeholder') || ''; o.colorScheme = cs.colorScheme; o.altura = r1(e.getBoundingClientRect().height); }
    o.cursor = cs.cursor; o.foco = e.tabIndex >= 0 || /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(e.tagName) ? 'focável' : 'não focável (tabIndex ' + e.tabIndex + ')';
    if (e.tagName === 'A' && !e.getAttribute('href')) o.foco = 'a sem href (não recebe Tab)';
    return o;
  }

  /* ----- varredura de contraste: todo texto visível ----- */
  function varrer() {
    var grupos = {}, total = 0, ruins = 0;
    var all = document.body.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (/^(SCRIPT|STYLE|NOSCRIPT|svg|path|SVG|TEMPLATE|IFRAME|OPTION)$/.test(e.tagName)) continue;
      if (e.closest && e.closest('svg, #__esconde-avisos')) continue;
      var temTexto = false;
      for (var c = e.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.nodeValue.replace(/[\s ]+/g, '').length > 0) { temTexto = true; break; }
      if (!temTexto || !vis(e)) continue;
      total++;
      var t = textoDe(e), lim = t.grande ? 3 : 4.5;
      if (t.contraste !== null && t.contraste < lim) {
        ruins++;
        var k = nome(e.parentElement) + ' > ' + nome(e) + ' | ' + t.cor + ' sobre ' + t.fundo;
        var g = grupos[k] || (grupos[k] = { onde: caminho(e, 3), cor: t.cor, fundo: t.fundo, fundoDe: t.fundoDe, contraste: t.contraste, tamanho: t.tamanho, peso: t.peso, n: 0, amostra: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40), y: box(e).y });
        if (t.sobreImagem) g.sobreImagem = t.sobreImagem;
        g.n++;
      }
    }
    var lista = Object.keys(grupos).map(function (k) { return grupos[k]; }).sort(function (a, b) { return a.contraste - b.contraste || b.n - a.n; });
    return { textosVisiveis: total, abaixoDoMinimo: ruins, grupos: lista.slice(0, 60), gruposTotal: lista.length };
  }
  function superficies() {
    var area = {}, claras = [], all = document.body.getElementsByTagName('*'), vw = document.documentElement.clientWidth;
    for (var i = 0; i < all.length; i++) {
      var e = all[i]; if (/^(SCRIPT|STYLE|svg|path|OPTION|BR)$/.test(e.tagName)) continue;
      var c = parse(getComputedStyle(e).backgroundColor);
      if (!c || c.a < 0.95 || !vis(e)) continue;
      var r = e.getBoundingClientRect(); var w = Math.min(r.right, vw) - Math.max(r.left, 0); if (w <= 0) continue;
      var a = w * r.height; if (a < 400) continue;
      var h = hex(c); area[h] = (area[h] || 0) + a;
      if (lum(c) > 0.6 && a > 3000) claras.push({ el: caminho(e, 3), cor: h, caixa: box(e), area: Math.round(a) });
    }
    claras.sort(function (a, b) { return b.area - a.area; });
    var sup = Object.keys(area).map(function (k) { return { cor: k, area: Math.round(area[k]) }; }).sort(function (a, b) { return b.area - a.area; }).slice(0, 15);
    return { porCor: sup, caixasClaras: claras.slice(0, 40), caixasClarasTotal: claras.length };
  }
  function rolagem() {
    var de = document.documentElement, vw = de.clientWidth, fora = [];
    var all = document.body.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) {
      var e = all[i]; var r = e.getBoundingClientRect();
      if (r.right <= vw + 1 || r.width < 1 || r.height < 1) continue;
      var corta = false;
      for (var p = e.parentElement; p && p !== document.body; p = p.parentElement) { if (getComputedStyle(p).overflowX !== 'visible') { corta = true; break; } }
      if (corta) continue;
      var cs = getComputedStyle(e); if (cs.position === 'fixed' && r.left >= vw) continue;
      fora.push({ el: caminho(e, 3), direita: r1(r.right + scrollX), largura: r1(r.width), x: r1(r.left + scrollX) });
    }
    fora.sort(function (a, b) { return b.direita - a.direita; });
    return { lateral: de.scrollWidth - vw, scrollWidth: de.scrollWidth, clientWidth: vw, culpados: fora.slice(0, 12), culpadosTotal: fora.length };
  }
  function fotos(sels) {
    var out = [];
    (sels || []).forEach(function (s) {
      var els; try { els = [].slice.call(document.querySelectorAll(s)); } catch (x) { return; }
      els.filter(vis).slice(0, 16).forEach(function (im) { out.push({ seletor: s, caixa: box(im), carregada: !im.tagName || im.tagName !== 'IMG' || (im.complete && im.naturalWidth > 0), src: (im.currentSrc || im.src || '').split('/').pop().slice(0, 60) }); });
    });
    return out;
  }
  /* cor e fundo escritos no próprio HTML, nas áreas cujo texto vem do admin: um tema escuro tem de reservar isso */
  function corColada(sels) {
    var o = {};
    (sels || []).forEach(function (s) {
      var els; try { els = [].slice.call(document.querySelectorAll(s + ' [style], ' + s + ' font[color], ' + s + ' [bgcolor]')); } catch (x) { return; }
      var cores = {};
      els.forEach(function (e) {
        var st = (e.getAttribute('style') || '') + (e.getAttribute('color') ? ' font-color:' + e.getAttribute('color') : '') + (e.getAttribute('bgcolor') ? ' bgcolor:' + e.getAttribute('bgcolor') : '');
        (st.match(/(?:^|;|\s)(color|background(?:-color)?|font-color|bgcolor)\s*:\s*[^;]+/gi) || []).forEach(function (x) { x = x.trim().toLowerCase(); cores[x] = (cores[x] || 0) + 1; });
      });
      o[s] = { elementos: els.length, cores: cores, imagens: document.querySelectorAll(s + ' img').length, tabelas: document.querySelectorAll(s + ' table').length };
    });
    return o;
  }

  /* ----- quem pinta: a regra vencedora (ordem da cascata, especificidade, !important, inline) ----- */
  function splitTop(t) { var out = [], d = 0, cur = ''; for (var i = 0; i < t.length; i++) { var ch = t[i]; if (ch === '(' || ch === '[') d++; else if (ch === ')' || ch === ']') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; }
  function specOf(sel) {
    var a = 0, b = 0, c = 0, i = 0, s = sel, n = s.length;
    function skipParens(j) { var d = 0; for (; j < n; j++) { if (s[j] === '(') d++; else if (s[j] === ')') { d--; if (d === 0) return j; } } return j; }
    function maxOf(list) { var best = [0, 0, 0]; splitTop(list).forEach(function (p) { var v = specOf(p); if (cmpSpec(v, best) > 0) best = v; }); return best; }
    var IDENT = /[^\s.#\[\]:>+~,()*|='"]/;
    while (i < n) {
      var ch = s[i];
      if (ch === '#') { a++; i++; while (i < n && IDENT.test(s[i])) i++; }
      else if (ch === '.') { b++; i++; while (i < n && IDENT.test(s[i])) i++; }
      else if (ch === '[') { b++; while (i < n && s[i] !== ']') i++; i++; }
      else if (ch === ':') {
        var pe = s[i + 1] === ':'; i += pe ? 2 : 1; var st = i; while (i < n && /[\w-]/.test(s[i])) i++;
        var nm = s.slice(st, i).toLowerCase();
        if (pe || /^(before|after|first-line|first-letter)$/.test(nm)) { c++; if (s[i] === '(') i = skipParens(i) + 1; continue; }
        if (s[i] === '(') {
          var end = skipParens(i), inner = s.slice(i + 1, end); i = end + 1;
          if (nm === 'where') continue;
          if (/^(is|not|has|matches|-webkit-any)$/.test(nm)) { var v = maxOf(inner); a += v[0]; b += v[1]; c += v[2]; continue; }
          b++; continue;
        }
        b++;
      }
      else if (/[a-zA-Z]/.test(ch)) { c++; while (i < n && IDENT.test(s[i])) i++; }
      else i++;
    }
    return [a, b, c];
  }
  function cmpSpec(x, y) { return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; }
  function rotuloFolha(sh) {
    var o = sh.ownerNode;
    if (o && o.hasAttribute && o.hasAttribute('data-era-style')) return 'style' + (o.id ? '#' + o.id : '') + ' (cópia)';
    if (sh.href) return sh.href.replace(location.origin, '').replace(/^https?:\/\//, '').slice(0, 90);
    if (o && o.id) return 'style#' + o.id;
    if (o && o.closest && o.closest('[id^="block-"]')) return 'style dentro de #' + o.closest('[id^="block-"]').id;
    if (o && o.parentNode && o.parentNode.tagName === 'HEAD') return 'style no head (' + (o.textContent || '').length + ' caracteres)';
    return 'style no body';
  }
  async function folhas() {
    var out = [], list = [].slice.call(document.styleSheets);
    for (var i = 0; i < list.length; i++) {
      var sh = list[i], rules = null, via = 'cssom';
      if (sh.disabled) continue;
      try { rules = sh.cssRules; } catch (x) { rules = null; }
      if (!rules && sh.href) {
        try { var r = await fetch(sh.href, { mode: 'cors', cache: 'force-cache' }); var css = new CSSStyleSheet(); css.replaceSync(await r.text()); rules = css.cssRules; via = 'fetch'; } catch (x) { rules = null; via = 'ilegível'; }
      }
      out.push({ nome: rotuloFolha(sh), rules: rules, via: via, media: sh.media && sh.media.mediaText });
    }
    return out;
  }
  var PROPS = { 'background-color': ['background-color', 'background'], 'color': ['color'], 'border-top-color': ['border-top-color', 'border-color', 'border-top', 'border'] };
  var ESTADO = /:(hover|focus-visible|focus-within|focus|active|disabled|checked)\b/;
  async function quemPinta(alvos) {
    var fs = await folhas(), ordem = 0;
    var els = [], info = [];
    function idx(el, soCor) { var i = els.indexOf(el); if (i < 0) { els.push(el); info.push({ soCor: soCor, c: { 'background-color': [], 'color': [], 'border-top-color': [] }, estados: [] }); i = els.length - 1; } else if (!soCor) info[i].soCor = false; return i; }
    alvos.forEach(function (a) { a.i = idx(a.el, false); a.anc = []; for (var p = a.el.parentElement; p && p !== document.documentElement; p = p.parentElement) a.anc.push(idx(p, true)); });
    function visit(rules, folha, emMedia) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i], tipo = r.constructor && r.constructor.name;
        if (tipo === 'CSSMediaRule') { var ok = false; try { ok = matchMedia(r.media.mediaText).matches; } catch (x) {} if (ok) visit(r.cssRules, folha, '@media ' + r.media.mediaText); continue; }
        if (tipo === 'CSSSupportsRule') { var ok2 = false; try { ok2 = CSS.supports(r.conditionText); } catch (x) {} if (ok2) visit(r.cssRules, folha, '@supports ' + r.conditionText.slice(0, 40)); continue; }
        if (tipo === 'CSSLayerBlockRule' || tipo === 'CSSContainerRule') { visit(r.cssRules, folha, tipo); continue; }
        if (tipo === 'CSSImportRule') { try { visit(r.styleSheet.cssRules, folha + ' @import', emMedia); } catch (x) {} continue; }
        if (tipo !== 'CSSStyleRule' || !r.selectorText) continue;
        ordem++;
        var st = r.style, vals = {}, setsAny = false;
        Object.keys(PROPS).forEach(function (p) { for (var k = 0; k < PROPS[p].length; k++) { var v = st.getPropertyValue(PROPS[p][k]); if (v) { vals[p] = { v: v.slice(0, 70), imp: st.getPropertyPriority(PROPS[p][k]) === 'important' }; setsAny = true; break; } } });
        if (!setsAny) continue;
        var partes = splitTop(r.selectorText), temEstado = ESTADO.test(r.selectorText);
        for (var t = 0; t < els.length; t++) {
          var el = els[t], inf = info[t];
          if (inf.soCor && !vals.color) continue;
          var best = null;
          for (var q = 0; q < partes.length; q++) {
            var ps = partes[q]; if (ps.indexOf('::') >= 0 || /:(before|after)\b/.test(ps)) continue;
            if (temEstado && ESTADO.test(ps)) {
              if (!inf.soCor && inf.estados.length < 60) { var base = ps.replace(/:(hover|focus-visible|focus-within|focus|active)\b/g, ''); var mb = false; try { mb = base !== ps && el.matches(base || '*'); } catch (x) {} if (mb) inf.estados.push({ folha: folha, sel: ps.slice(0, 140), spec: specOf(base).join(','), ordem: ordem, valores: vals }); }
              continue;
            }
            var m = false; try { m = el.matches(ps); } catch (x) {}
            if (m) { var sp = specOf(ps); if (!best || cmpSpec(sp, best.sp) > 0) best = { sel: ps, sp: sp }; }
          }
          if (best) Object.keys(vals).forEach(function (p) { if (inf.soCor && p !== 'color') return; inf.c[p].push({ folha: folha, sel: best.sel.slice(0, 140), spec: best.sp.join(','), valor: vals[p].v, imp: vals[p].imp, ordem: ordem, media: emMedia || '' }); });
        }
      }
    }
    fs.forEach(function (f) { if (f.rules) visit(f.rules, f.nome, f.media && f.media !== 'all' ? '@media ' + f.media : ''); });
    function vencedor(i, prop) {
      var el = els[i], list = info[i].c[prop];
      var inl = el.style.getPropertyValue(prop) || (prop === 'background-color' ? el.style.getPropertyValue('background') : '');
      var inlImp = el.style.getPropertyPriority(prop) === 'important';
      var s = list.slice().sort(function (x, y) { return (y.imp - x.imp) || cmpSpec(y.spec.split(',').map(Number), x.spec.split(',').map(Number)) || (y.ordem - x.ordem); });
      var top = s[0];
      if (inl && (!top || !top.imp || inlImp)) return { vence: { folha: 'style="" inline', valor: inl, imp: inlImp }, perdem: s.slice(0, 3) };
      return { vence: top || null, perdem: s.slice(1, 4) };
    }
    return { ilegiveis: fs.filter(function (f) { return f.via === 'ilegível'; }).map(function (f) { return f.nome; }), folhas: fs.map(function (f) { return f.nome + ' [' + f.via + (f.rules ? ', ' + f.rules.length + ' regras' : '') + ']'; }), alvos: alvos.map(function (a) {
      var o = { parte: a.label, el: caminho(a.el, 2) };
      ['background-color', 'color', 'border-top-color'].forEach(function (p) {
        var w = vencedor(a.i, p);
        o[p] = { computado: getComputedStyle(a.el).getPropertyValue(p), vence: w.vence, perdem: w.perdem };
        if (p === 'color' && !w.vence) {
          for (var k = 0; k < a.anc.length; k++) { var wa = vencedor(a.anc[k], 'color'); if (wa.vence) { o.color.herdadoDe = { el: caminho(els[a.anc[k]], 2), vence: wa.vence }; break; } }
          if (!o.color.herdadoDe) o.color.herdadoDe = '(padrão do navegador)';
        }
      });
      if (info[a.i].estados.length) o.estados = info[a.i].estados.slice().sort(function (x, y) { return cmpSpec(y.spec.split(',').map(Number), x.spec.split(',').map(Number)) || (y.ordem - x.ordem); }).slice(0, 8);
      return o;
    }) };
  }

  window.__medirCores = function (op) {
    op = op || {};
    var M = op.mapa || MAPA_GENERICO, de = document.documentElement;
    var out = { pagina: { url: location.href.replace(/[?&]nc=[^&]*/, ''), body: document.body.className.replace(/\s+/g, ' ').trim(), largura: innerWidth, altura: innerHeight, scrollY: Math.round(scrollY), alturaPagina: de.scrollHeight, dpr: devicePixelRatio, mapa: op.mapa ? 'próprio' : 'genérico' } };
    out.rolagem = rolagem();
    out.regioes = {}; Object.keys(M.regioes || {}).forEach(function (k) { var r = regiao(M.regioes[k]); if (r.visiveis || op.tudo) out.regioes[k] = r; });
    out.textos = {}; Object.keys(M.textos || {}).forEach(function (k) { var r = texto(M.textos[k]); if (r.visiveis || op.tudo) out.textos[k] = r; });
    out.controles = {}; Object.keys(M.controles || {}).forEach(function (k) { var r = controle(M.controles[k]); if (r.visiveis || op.tudo) out.controles[k] = r; });
    out.baixoContraste = varrer();
    var sp = superficies(); out.superficies = sp.porCor; out.caixasClaras = sp.caixasClaras; out.caixasClarasTotal = sp.caixasClarasTotal;
    out.fotos = fotos(M.fotos);
    if ((M.textoDoAdmin || []).length) out.corColada = corColada(M.textoDoAdmin);
    if (!op.quemPinta) return out;
    var alvos = [];
    function add(lab, sel) { var p = primeiro(sel); if (p.el) alvos.push({ label: lab, el: p.el }); }
    ['regioes', 'textos', 'controles'].forEach(function (g) { Object.keys(M[g] || {}).forEach(function (k) { add(g + ' ' + k, M[g][k]); }); });
    return quemPinta(alvos).then(function (q) { out.quemPinta = q; return out; });
  };
  window.__medirCores.versao = '2026-11-03';
  window.__medirRolagem = function () { var r = rolagem(); r.largura = innerWidth; return r; };
})();
