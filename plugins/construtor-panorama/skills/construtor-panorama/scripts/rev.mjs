// rev.mjs - a revisão profunda de UMA versão (a que a pessoa gostou): uma carga por plano, num Chrome headless
// próprio, com Tab de verdade (teclado do Chrome, não .focus() de script), mouse de verdade (hover e clique),
// celular, data de corte (--relogio) e o teste de cor colada no admin, medindo com scripts/rev.js (window.__R).
// No ar, com a trava e o ritmo das visitas (cdp.mjs); ou numa cópia salva, sem rede (--copia). Nada é gravado no
// site; o que o plano clica é só o que abre e fecha (uma janela, uma aba da página), e é o plano que diz.
// Na cópia, os scripts da página não rodam (clique que abre algo por JS não abre) e um <button> ficou fora do
// Tab num teste: a revisão do foco de teclado vale no ar.
//
// Uso:
//   node scripts/rev.mjs plano.mjs [--url URL | --copia pagina.mhtml] [--saida pasta] [--pausa 6] [--perfil pasta]
//
// O plano (um modelo comentado em assets/plano-revisao.mjs) é um .mjs com export default, ou um .json:
//   { url | copia, celular, largura, altura, saida,
//     css: { arquivo, depoisDe | substitui | fimDoHead },   // a versão a revisar; liga com o passo {ligarCss:1}
//     replace: [{ t: 'trecho', f: 'arquivo' }],            // simulação da gravação (só no ar)
//     relogio: 'ISO', agora: 'ISO', novoDoc: ['js'], espera: 2500, rolar: true, fora: 'seletores fora do miolo',
//     passos: [ ... ] }
// Passos (na ordem; um erro num passo vai para "erros" e o resto segue):
//   {js: "expr" | function, args, save}      roda na página (as funções de __R estão à mão) e guarda em save
//   {ligarCss: 1, save} {desligarCss: 1}     liga/desliga a versão do plano na posição da cascata
//   {avisos: 1}                              esconde os avisos de cookies e de app (diga na legenda)
//   {resize: [w, h], wait}                   muda a janela (sem recarregar)
//   {sleep: ms}
//   {mouseOff: [x, y]}                       tira o mouse de cima de tudo
//   {hover: sel, idx, medir, args, save, shot, pad} / {click: sel, ...}   mouse de verdade no centro do elemento
//   {key: 'Escape' | 'Tab' | 'Enter'}
//   {tab: {start, max, prefix, pares, pad, ateSel, dentro}, save}   Tab de verdade a partir de start; com pares,
//        um print com foco (a) e outro sem foco (b) de cada parada, para o pares.py medir o indicador pelos pixels
//   {shot: 'nome.png', clipSel | uniao: [sels] | clip: [x,y,w,h] | viewport: 1 | full: 1, pad, idx, block}
// Saída: pasta/NOME-DO-PLANO.json (passos, erros, console, documento, pedidos ao site), os prints em pasta e os
// pares em pasta/pares. No terminal, uma linha. Códigos: 0 ok, 1 erro, 15 limite (1015) duas vezes, 16 desafio.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import * as C from './cdp.mjs';
import { noAr } from './shot.mjs';

const USO = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^\/\/ ?/gm, '');
const REV_JS = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'rev.js'), 'utf8');
const codigo = (js, args) => (typeof js === 'function' ? `(${js.toString()})(...${JSON.stringify(args || [])})` : js);

async function visitar(c, plano, ctx) {
  const out = { url: plano.url || plano.copia, celular: !!plano.celular, passos: {}, erros: [], console: [], doc: null, pedidosAoSite: 0 };
  const ap = await C.aparelho(c, { celular: !!plano.celular, largura: plano.largura, altura: plano.altura });
  let width = ap.largura, height = ap.altura;
  const dpr = ap.dpr, mobile = !!plano.celular;
  let host = ''; try { host = new URL(plano.url).host; } catch (e) {}
  const tirar = [
    c.on('Runtime.exceptionThrown', (p) => { if (out.console.length < 30) out.console.push('EXCECAO: ' + (((p.exceptionDetails.exception || {}).description) || p.exceptionDetails.text).slice(0, 200)); }),
    c.on('Network.responseReceived', (p) => { if (p.type === 'Document' && out.doc === null) out.doc = p.response.status; }),
    c.on('Network.requestWillBeSent', (p) => { try { if (host && new URL(p.request.url).host === host) out.pedidosAoSite++; } catch (e) {} }),
  ];
  const ids = [];
  const novoDoc = [...(plano.novoDoc || [])];
  if (plano.relogio) novoDoc.unshift(C.exprRelogio(plano.relogio));
  if (plano.agora) novoDoc.unshift(C.exprAgora(plano.agora));
  for (const js of novoDoc) ids.push((await c.send('Page.addScriptToEvaluateOnNewDocument', { source: js })).identifier);
  const shotClip = async (clip, file, beyond) => {
    const params = { format: 'png' };
    if (clip) { params.clip = { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale: 1 }; params.captureBeyondViewport = !!beyond; }
    const s = await c.send('Page.captureScreenshot', params);
    fs.writeFileSync(file, Buffer.from(s.data, 'base64'));
  };
  const key = async (k) => {
    const vk = { Tab: 9, Escape: 27, Enter: 13 }[k];
    await c.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await c.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
  };
  try {
    const alvo = ctx.modoCopia ? pathToFileURL(path.resolve(plano.copia)).href : (C.ehLocal(plano.url) ? plano.url : C.comNc(plano.url, 'rev' + Date.now().toString(36)));
    const carregou = c.once('Page.loadEventFired', 45000);
    await c.send('Page.navigate', { url: alvo });
    await carregou; await C.sleep(plano.espera || (ctx.modoCopia ? 600 : 2500));
    if (!ctx.modoCopia) { const b = await c.ev(C.EXPR_BLOQUEIO); if (b || out.doc === 429) { out.bloqueio = b || '1015'; return out; } }
    out.titulo = (await c.ev('document.title')).slice(0, 100);
    await c.ev('document.fonts ? document.fonts.ready.then(function(){return 1}) : 1');
    await c.ev(REV_JS + '\n;1');
    if (plano.fora) await c.ev(`window.__R.fora=${JSON.stringify(plano.fora)};1`);
    if (plano.css) {
      const css = fs.readFileSync(plano.css.arquivo, 'utf8');
      const a = { depoisDe: plano.css.depoisDe, substitui: plano.css.substitui, fimDoHead: !!plano.css.fimDoHead };
      await c.ev(`window.__revLigar=function(){return ${C.exprCss(css, a, 'rev-css')};};window.__revDesligar=function(){return ${C.exprDesligarCss('rev-css')};};1`);
    }
    // na cópia, as fotos já vieram carregadas e o setTimeout da página não dispara: não rola
    if (plano.rolar !== false && !ctx.modoCopia) out.passos._altura = await c.ev('__R.rolarTudo()');
    await c.ev('__R.semTransicao()');
    const paresDir = path.join(ctx.saida, 'pares');
    for (const p of plano.passos || []) {
      try {
        if (p.ligarCss) { const r = await c.ev('__R.ligarCss()'); if (r && r.erro) throw new Error('CSS não entrou: ' + r.erro); if (p.save) out.passos[p.save] = r; await C.sleep(p.wait || 600); }
        if (p.desligarCss) { await c.ev('__R.desligarCss()'); await C.sleep(p.wait || 400); }
        if (p.avisos) await c.ev(C.exprEsconder());
        if (p.resize) { width = p.resize[0]; height = p.resize[1]; await c.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile }); await C.sleep(p.wait || 1200); }
        if (p.js) { const v = await c.ev(codigo(p.js, p.args)); if (p.save) out.passos[p.save] = v; }
        if (p.sleep) await C.sleep(p.sleep);
        if (p.mouseOff) { await c.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.mouseOff[0] || 2, y: p.mouseOff[1] || 2 }); await C.sleep(300); }
        if (p.hover || p.click) {
          const sel = p.hover || p.click;
          const achou = await c.ev(`__R.centro(${JSON.stringify(sel)}, ${p.idx || 0})`);
          if (!achou) { out.erros.push('não achei ' + sel); continue; }
          await C.sleep(350);
          const c2 = await c.ev(`(function(){var e=[].slice.call(document.querySelectorAll(${JSON.stringify(sel)})).filter(__R.vis)[${p.idx || 0}];var r=e.getBoundingClientRect();return {x:r.left+r.width/2+${p.dx || 0},y:r.top+Math.min(r.height/2,60)+${p.dy || 0}}})()`);
          await c.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c2.x, y: c2.y });
          if (p.click) {
            await c.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c2.x, y: c2.y, button: 'left', clickCount: 1 });
            await c.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c2.x, y: c2.y, button: 'left', clickCount: 1 });
          }
          await C.sleep(p.wait || 800);
          if (p.save && p.medir) out.passos[p.save] = await c.ev(codigo(p.medir, p.args));
          if (p.shot) {
            const cl = await c.ev(`(function(){var s=${JSON.stringify(p.shotSel || sel)};var e=[].slice.call(document.querySelectorAll(s)).filter(__R.vis)[${p.shotSel ? (p.shotIdx || 0) : (p.idx || 0)}];if(!e)return null;var r=e.getBoundingClientRect();var pad=${p.pad || 12};return {x:Math.max(0,r.left+scrollX-pad),y:Math.max(0,r.top+scrollY-pad),width:Math.min(r.width+2*pad,innerWidth),height:r.height+2*pad}})()`);
            if (cl) await shotClip(cl, path.join(ctx.saida, p.shot), true);
          }
        }
        if (p.key) { await key(p.key); await C.sleep(p.wait || 600); }
        if (p.tab) {
          const tw = p.tab, res = [], pares = [];
          if (tw.pares) fs.mkdirSync(paresDir, { recursive: true });
          if (!(await c.ev(`__R.focoIni(${JSON.stringify(tw.start)})`))) throw new Error('tab: não achei o início ' + tw.start);
          let ultimo = null, repet = 0;
          for (let i = 0; i < (tw.max || 20); i++) {
            await key('Tab'); await C.sleep(tw.pausa || 60);
            const info = await c.ev(`__R.focoInfo(${tw.pad || 8})`);
            if (!info) { res.push(null); continue; }
            if (tw.ateSel && await c.ev(`!!(document.activeElement&&document.activeElement.closest(${JSON.stringify(tw.ateSel)}))`)) { info.parou = true; info.i = i; res.push(info); break; }
            if (tw.dentro && !(await c.ev(`!!(document.activeElement&&document.activeElement.closest(${JSON.stringify(tw.dentro)}))`))) { info.saiu = true; info.i = i; res.push(info); break; }
            const k = info.el + info.rect.join(',');
            if (ultimo === k) { if (++repet > 3) break; } else repet = 0;
            ultimo = k;
            if (tw.pares && info.clip && info.miolo) {
              const base = `${tw.prefix || 'tab'}-${String(i).padStart(3, '0')}`;
              const a = path.join(paresDir, base + '-a.png'), b = path.join(paresDir, base + '-b.png');
              await shotClip(info.clip, a, false);
              await c.ev('__R.desfocar()'); await C.sleep(40);
              await shotClip(info.clip, b, false);
              info.fvDepois = await c.ev('__R.refocar()'); await C.sleep(30);
              pares.push({ i, a, b, dpr, rect: info.rectNoClip, el: info.el, txt: info.txt });
            }
            info.i = i; res.push(info);
          }
          await c.ev('__R.focoNoFim()');
          out.passos[p.save || 'tab'] = { paradas: res.filter(Boolean), pares };
        }
        if (p.shot && !p.hover && !p.click) {
          let clip = null;
          if (p.clipSel) {
            clip = await c.ev(`(function(){var e=[].slice.call(document.querySelectorAll(${JSON.stringify(p.clipSel)})).filter(__R.vis)[${p.idx || 0}];if(!e)return null;${p.scroll === false ? '' : "e.scrollIntoView({block:'" + (p.block || 'center') + "'});"}var b=e.getBoundingClientRect();var pad=${p.pad || 0};return {x:Math.max(0,b.left+scrollX-pad),y:Math.max(0,b.top+scrollY-pad),width:Math.min(b.width+2*pad,document.documentElement.clientWidth),height:b.height+2*pad}})()`);
            if (clip && p.extraH) clip.height += p.extraH;
            await C.sleep(500);
          } else if (p.uniao) {
            clip = await c.ev(`(function(){var ss=${JSON.stringify(p.uniao)},x1=1e9,y1=1e9,x2=-1e9,y2=-1e9,f=null;ss.forEach(function(s){var e=[].slice.call(document.querySelectorAll(s)).filter(__R.vis)[0];if(!e)return;f=f||e;var b=e.getBoundingClientRect();x1=Math.min(x1,b.left+scrollX);y1=Math.min(y1,b.top+scrollY);x2=Math.max(x2,b.right+scrollX);y2=Math.max(y2,b.bottom+scrollY);});if(!f)return null;var pad=${p.pad || 0};scrollTo(0,Math.max(0,y1-pad-120));return {x:Math.max(0,x1-pad),y:Math.max(0,y1-pad),width:Math.min(x2-x1+2*pad,document.documentElement.clientWidth),height:y2-y1+2*pad}})()`);
            await C.sleep(500);
          } else if (p.clip) clip = { x: p.clip[0], y: p.clip[1], width: p.clip[2], height: p.clip[3] };
          else if (p.viewport) {
            const v = await c.ev('({y:scrollY,w:document.documentElement.clientWidth,h:innerHeight})');
            clip = { x: 0, y: v.y, width: v.w, height: v.h };
          } else if (p.full) {
            const v = await c.ev(`({h:Math.min(document.documentElement.scrollHeight,${p.maxH || 16000}),w:document.documentElement.clientWidth})`);
            clip = { x: 0, y: 0, width: v.w, height: v.h };
          }
          if (!clip && (p.clipSel || p.uniao)) out.erros.push('print sem recorte: ' + (p.clipSel || p.uniao));
          else await shotClip(clip, path.join(ctx.saida, p.shot), p.viewport ? false : p.beyond !== false);
        }
      } catch (e) { out.erros.push((p.save || p.shot || JSON.stringify(p).slice(0, 80)) + ': ' + e.message.slice(0, 300)); }
    }
  } catch (e) { out.erros.push('FATAL ' + e.message.slice(0, 300)); }
  finally {
    tirar.forEach((t) => t());
    for (const id of ids) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: id }).catch(() => {});
  }
  return out;
}

async function main() {
  const o = C.lerArgs(process.argv.slice(2), { flags: ['perfil-novo'], multi: [], apelidos: {} }, USO);
  const arq = o._[0];
  if (!arq) { console.error('passe o plano: node scripts/rev.mjs plano.mjs (--help mostra o uso)'); process.exit(2); }
  const plano = arq.endsWith('.json') ? JSON.parse(fs.readFileSync(arq, 'utf8')) : (await import(pathToFileURL(path.resolve(arq)).href)).default;
  if (o.url) { plano.url = o.url; delete plano.copia; }
  if (o.copia) { plano.copia = o.copia; delete plano.url; }
  if (!plano.url === !plano.copia) throw new Error('o plano precisa de url ou copia (só um)');
  const saida = o.saida || plano.saida || path.join(path.dirname(path.resolve(arq)), 'rev-' + path.basename(arq).replace(/\.\w+$/, ''));
  fs.mkdirSync(saida, { recursive: true });
  const trocas = (plano.replace || []).map((x) => ({ t: x.t, f: x.f }));
  if (plano.copia && trocas.length) throw new Error('replace é só no ar; na cópia, use css com substitui');
  let out;
  if (plano.copia) {
    const c = await C.abrirChrome({ semRede: true });
    try { out = await visitar(c, plano, { modoCopia: true, saida }); } finally { await c.fechar(); }
  } else if (C.ehLocal(plano.url)) {
    const c = await C.abrirChrome({});
    try { await C.trocarRespostas(c, trocas); out = await visitar(c, plano, { saida }); } finally { await c.fechar(); }
  } else {
    out = await noAr(o, (c) => C.trocarRespostas(c, trocas), (s) => s.carregar(async (c, trocados) => { const r = await visitar(c, plano, { saida }); r.trocados = trocados.slice(); return r; }));
  }
  const json = path.join(saida, path.basename(arq).replace(/\.\w+$/, '') + '.json');
  fs.writeFileSync(json, JSON.stringify(out, null, 1));
  console.log(['rev', path.basename(json), out.bloqueio ? 'BLOQUEIO ' + out.bloqueio : 'doc ' + out.doc, 'pedidos ao site ' + out.pedidosAoSite,
    out.trocados ? 'trocados ' + out.trocados.length : '', 'erros ' + out.erros.length + (out.erros.length ? ': ' + out.erros.slice(0, 4).join(' | ') : '')].filter(Boolean).join(' | '));
  if (out.bloqueio === '1015') process.exitCode = C.BLOQUEIO_1015;
  else if (out.bloqueio === 'desafio') process.exitCode = C.BLOQUEIO_DESAFIO;
  else if (out.erros.length) process.exitCode = 1;
}

main().catch((e) => { console.error('ERRO:', e.message); process.exitCode = process.exitCode || 1; });
