// shot.mjs - um print (e medidas) de uma página, num Chrome headless próprio, sem a sessão de ninguém: no site no ar
// ou numa cópia salva aberta SEM REDE (--copia, de salvar_copia.mjs). Nada é gravado no site: o CSS da prévia, os
// JS, a troca de arquivos e os avisos escondidos só existem neste Chrome. Ver references/previa.md, "Iterar
// offline, confirmar no ar".
//
// Uso:
//   node scripts/shot.mjs --url URL | --copia pagina.mhtml
//        [--celular] [--largura 1920] [--altura 1080] [--dpr 1]
//        [--css proposta.css (--depois-de TRECHO | --substitui TRECHO | --fim-do-head)]
//        [--replace "trecho=>arquivo"]... [--inject arquivo.js]... [--eval "expressão"]... [--measure "expressão"]
//        [--agora 2026-11-05T12:00:00-03:00] [--relogio 2026-12-02T10:00:00-03:00]
//        [--hide-avisos] [--esconder "seletores"] [--rolar]
//        [--scroll-to "seletor" [--offset -20] | --scroll-y 800]
//        [--clip "x,y,w,h" | --clip-sel "seletor" [--pad 0] | --clip-h 700 [--clip-top 0] | --full]
//        [--out print.png] [--json medidas.json] [--wait 2500] [--after 700]
//        [--perfil pasta | --perfil-novo] [--pausa 6] [--sem-nc]
//
//   --url         no site no ar: passa pela trava e pelo ritmo das visitas (cdp.mjs) e ganha ?nc=... (sem --sem-nc).
//                 Num 1015, espera 6 min e tenta uma vez; no segundo, sai com código 15. Desafio de "você é humano":
//                 sai com código 16 e não tenta de novo.
//   --copia       a cópia salva, sem rede e sem trava: segundos por print. Os scripts da página não rodam nela
//                 (o DOM é o de depois que eles rodaram); hover de CSS funciona, menu aberto por JS não, e um
//                 setTimeout de dentro da página não dispara (--eval/--inject têm de ser síncronos; --rolar é
//                 ignorado: as fotos já vêm carregadas na cópia).
//   --celular     User-Agent de Android, 375x812, dpr 2 e toque: o servidor manda o HTML de celular (body.isMobile).
//                 Na cópia, o HTML é o que foi salvo: use --celular com uma cópia salva com --celular.
//   --css         põe o CSS num <style> na posição da cascata que o arquivo vai ter, como o favorito do
//                 gerar_previa.py: --depois-de / --substitui um trecho do href de um <link>, um #id ou
//                 style:TRECHO do texto de um <style>; o trecho tem de casar com exatamente um. --fim-do-head só
//                 quando essa é a posição publicada.
//   --replace     simulação da gravação de um Arquivo: todo pedido cujo endereço contém o trecho recebe o arquivo
//                 local, só neste Chrome (ex.: "/meu-tema.css=>meu-tema-v2.css"). Só no ar.
//   --agora       window.__previaAgora parado nessa hora, desde o <head> (temas-sazonais.md, seção 6).
//   --relogio     o Date da página inteira nessa data, desde o <head>, andando (data de corte de uma campanha).
//   --hide-avisos esconde só neste print os avisos de cookies, LGPD, app e notificação (diga isso na legenda);
//                 --esconder acrescenta seletores.
//   --rolar       rola a página inteira antes (fotos preguiçosas, vitrines que chegam depois) e volta ao topo.
//   --measure     expressão avaliada no fim (depois de --inject/--eval); o resultado vai para --json.
//   --perfil      pasta do perfil do Chrome (padrão: o perfil compartilhado das visitas, com cache);
//                 --perfil-novo usa um perfil vazio (primeira visita: avisos abertos, nada em cache).
//
// Saída: o PNG em --out, o JSON em --json, e uma linha de resumo no terminal. Códigos: 0 ok, 1 erro, 2 uso,
// 15 limite de pedidos (1015/429) duas vezes, 16 desafio do CDN.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as C from './cdp.mjs';

export const USO = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^\/\/ ?/gm, '');
export const FLAGS = ['celular', 'hide-avisos', 'rolar', 'full', 'perfil-novo', 'sem-nc', 'fim-do-head', 'keep'];
export const MULTI = ['inject', 'eval', 'replace'];
export const APELIDOS = { mobile: 'celular', width: 'largura', height: 'altura' };

function alvoCss(o) {
  const n = ['depois-de', 'substitui', 'fim-do-head'].filter((k) => o[k]).length;
  if (o.css && n !== 1) throw new Error('--css pede uma posição só: --depois-de, --substitui ou --fim-do-head');
  if (!o.css && n) throw new Error('--depois-de / --substitui / --fim-do-head precisam de --css');
  return { depoisDe: o['depois-de'], substitui: o.substitui, fimDoHead: !!o['fim-do-head'] };
}

// uma carga e um print, num Chrome já aberto. ctx: { modoCopia, nc } . Devolve o resumo (sem lançar no 1015).
export async function umaFoto(c, o, ctx = {}) {
  const out = { url: o.url || o.copia, celular: !!o.celular, doc: null, pedidos: 0, pedidosAoSite: 0, console: [], erros: [] };
  const ap = await C.aparelho(c, { celular: !!o.celular, largura: o.largura, altura: o.altura, dpr: o.dpr });
  Object.assign(out, { largura: ap.largura, altura: ap.altura, dpr: ap.dpr });
  const novoDoc = [];
  if (o.relogio) novoDoc.push(C.exprRelogio(o.relogio));
  if (o.agora) novoDoc.push(C.exprAgora(o.agora));
  const ids = [];
  for (const src of novoDoc) ids.push((await c.send('Page.addScriptToEvaluateOnNewDocument', { source: src })).identifier);
  let host = '';
  if (o.url) { try { host = new URL(o.url).host; } catch (e) {} }
  const tirar = [
    c.on('Network.responseReceived', (p) => { if (p.type === 'Document' && out.doc === null) out.doc = p.response.status; }),
    c.on('Network.requestWillBeSent', (p) => { out.pedidos++; try { if (host && new URL(p.request.url).host === host) out.pedidosAoSite++; } catch (e) {} }),
    c.on('Runtime.consoleAPICalled', (p) => { if ((p.type === 'error' || p.type === 'warning') && out.console.length < 30) out.console.push(p.type + ': ' + p.args.map((a) => (a.value !== undefined ? a.value : a.description)).join(' ').slice(0, 200)); }),
    c.on('Runtime.exceptionThrown', (p) => { if (out.console.length < 30) out.console.push('EXCECAO: ' + (((p.exceptionDetails.exception || {}).description) || p.exceptionDetails.text).slice(0, 200)); }),
  ];
  try {
    let alvo = o.url;
    if (ctx.modoCopia) alvo = pathToFileURL(path.resolve(o.copia)).href;
    else if (!o['sem-nc'] && !C.ehLocal(alvo)) alvo = C.comNc(alvo, ctx.nc || 'shot' + Date.now().toString(36));
    const carregou = c.once('Page.loadEventFired', 45000);
    await c.send('Page.navigate', { url: alvo });
    if (!(await carregou)) out.erros.push('a carga não terminou em 45 s (segui assim mesmo)');
    await C.sleep(+(o.wait || (ctx.modoCopia ? 600 : 2500)));
    if (!ctx.modoCopia) {
      const b = await c.ev(C.EXPR_BLOQUEIO);
      if (b || out.doc === 429) { out.bloqueio = b || '1015'; return out; }
    }
    await c.ev('document.fonts ? document.fonts.ready.then(function(){return 1}) : 1');
    out.titulo = (await c.ev('document.title')).slice(0, 100);
    out.body = (await c.ev('document.body ? document.body.className.replace(/\\s+/g," ").trim() : ""')).slice(0, 200);
    if (o['hide-avisos'] || o.esconder) await c.ev(C.exprEsconder(o.esconder));
    // na cópia, as fotos e vitrines já vieram carregadas, e o setTimeout da página não dispara: não rola
    if (o.rolar && !ctx.modoCopia) out.alturaPagina = await c.ev(C.EXPR_ROLAR);
    if (o.css) {
      out.css = await c.ev(C.exprCss(fs.readFileSync(o.css, 'utf8'), alvoCss(o)));
      if (out.css.erro) throw new Error('CSS da prévia não entrou: ' + out.css.erro);
    }
    for (const f of o.inject || []) { await c.ev(fs.readFileSync(f, 'utf8') + '\n;1', false); await C.sleep(250); }
    for (const e of o.eval || []) await c.ev(e);
    await C.sleep(+(o.after || 700));
    await c.ev('document.documentElement.style.scrollBehavior="auto";1');
    if (o['scroll-to']) {
      const ok = await c.ev(`(function(){var e=document.querySelector(${JSON.stringify(o['scroll-to'])}); if(!e) return 0; var y=e.getBoundingClientRect().top+scrollY+(${+(o.offset || 0)}); scrollTo(0,Math.max(0,y)); return 1})()`);
      if (!ok) out.erros.push('--scroll-to não achou ' + o['scroll-to']);
      await C.sleep(600);
    } else if (o['scroll-y']) { await c.ev(`scrollTo(0,${+o['scroll-y']});1`); await C.sleep(600); }
    if (o.measure) out.medida = await c.ev(o.measure);
    if (o.out) {
      let clip = null;
      if (o.clip) {
        const [x, y, w, h] = String(o.clip).split(',').map(Number);
        const sy = await c.ev('scrollY');
        clip = { x, y: y + sy, width: w, height: h, scale: 1 };
      } else if (o['clip-sel']) {
        const pad = +(o.pad || 0);
        const r = await c.ev(`(function(){var e=document.querySelector(${JSON.stringify(o['clip-sel'])}); if(!e) return null; var b=e.getBoundingClientRect(); return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}})()`);
        if (!r) throw new Error('--clip-sel não achou ' + o['clip-sel']);
        clip = { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: r.w + 2 * pad, height: r.h + 2 * pad, scale: 1 };
      } else if (o['clip-h']) {
        const sy = await c.ev('scrollY');
        clip = { x: 0, y: sy + (+(o['clip-top'] || 0)), width: ap.largura, height: +o['clip-h'], scale: 1 };
      }
      const params = { format: 'png' };
      // com clip, o print vai "além da janela": o que é position:fixed sai do lugar. Para um box fixo no pé da
      // tela, tire o print da janela (sem --clip/--clip-h).
      if (clip) { params.clip = clip; params.captureBeyondViewport = true; }
      else if (o.full) {
        const h = await c.ev('Math.min(document.documentElement.scrollHeight, 16000)');
        params.clip = { x: 0, y: 0, width: ap.largura, height: h, scale: 1 }; params.captureBeyondViewport = true;
      }
      const s = await c.send('Page.captureScreenshot', params);
      fs.mkdirSync(path.dirname(path.resolve(o.out)), { recursive: true });
      fs.writeFileSync(o.out, Buffer.from(s.data, 'base64'));
      out.print = o.out;
    }
  } catch (e) {
    out.erros.push(e.message.slice(0, 400));
  } finally {
    tirar.forEach((t) => t());
    for (const id of ids) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: id }).catch(() => {});
    if (c.bloqueados && c.bloqueados.length) out.bloqueadosSemRede = c.bloqueados.length;
  }
  return out;
}

export function linhaDeResumo(nome, r) {
  const p = [nome];
  if (r.bloqueio) p.push('BLOQUEIO ' + r.bloqueio);
  else p.push(r.erros.length ? 'ERRO' : 'ok');
  if (r.doc !== null && r.doc !== undefined) p.push('doc ' + r.doc);
  if (r.css) p.push('css ' + (r.css.ok ? r.css.modo + ' ' + r.css.onde : r.css.erro));
  if (r.console.length) p.push(r.console.length + ' msg de console');
  if (r.pedidosAoSite) p.push(r.pedidosAoSite + ' pedidos ao site');
  if (r.trocados && r.trocados.length) p.push(r.trocados.length + ' trocado(s) pelo --replace');
  if (r.bloqueadosSemRede) p.push(r.bloqueadosSemRede + ' pedidos bloqueados (sem rede)');
  if (r.erros.length) p.push(r.erros.join(' / '));
  return p.join(' | ');
}

// no ar: a vez (uma visita por vez no computador), a pausa entre cargas e, num 1015, uma nova tentativa depois
// de 6 min. preparar(c) roda em cada Chrome aberto (o da nova tentativa também); rodar(s) faz as cargas com
// s.carregar(fn), e fn(c, prep) devolve o resumo de umaFoto.
export async function noAr(o, preparar, rodar) {
  const vez = await C.pegarVez({ pausa: o.pausa });
  const perfil = o['perfil-novo'] ? undefined : (o.perfil || C.perfilPadrao());
  const abrir = async () => { const c = await C.abrirChrome({ perfil, largura: o.largura, altura: o.altura }); return [c, await preparar(c)]; };
  let [c, prep] = await abrir();
  try {
    return await rodar({
      async carregar(fn) {
        for (let tent = 0; ; tent++) {
          await vez.antesDeCarregar();
          const r = await fn(c, prep);
          vez.depoisDeCarregar();
          if (r.bloqueio === '1015' && tent === 0) {
            console.error('1015 (limite de pedidos): esperando 6 minutos para tentar uma vez');
            vez.marcarBloqueio(6);
            await c.fechar();
            [c, prep] = await abrir();
            continue;
          }
          if (r.bloqueio === '1015') vez.marcarBloqueio(6);
          return r;
        }
      },
    });
  } finally {
    await c.fechar();
    vez.soltar();
  }
}

function conferirTrocas(r, trocas, trocados) {
  r.trocados = trocados;
  if (trocas.length && !trocados.length && !r.bloqueio) r.erros.push('--replace: nenhum pedido casou com ' + trocas.map((t) => t.t).join(', '));
  return r;
}

async function main() {
  const o = C.lerArgs(process.argv.slice(2), { flags: FLAGS, multi: MULTI, apelidos: APELIDOS }, USO);
  if (!o.url === !o.copia) { console.error('passe --url ou --copia (só um). --help mostra o uso.'); process.exit(2); }
  alvoCss(o);
  const trocas = C.lerTrocas(o.replace);
  if (o.copia && trocas.length) throw new Error('--replace é só no ar; na cópia, use --css com --substitui');
  let r;
  if (o.copia) {
    const c = await C.abrirChrome({ semRede: true, largura: o.largura, altura: o.altura });
    try { r = await umaFoto(c, o, { modoCopia: true }); } finally { await c.fechar(); }
  } else if (C.ehLocal(o.url)) {
    const c = await C.abrirChrome({ largura: o.largura, altura: o.altura });
    try { const trocados = await C.trocarRespostas(c, trocas); r = conferirTrocas(await umaFoto(c, o, {}), trocas, trocados); } finally { await c.fechar(); }
  } else {
    r = await noAr(o, (c) => C.trocarRespostas(c, trocas), (s) => s.carregar(async (c, trocados) => conferirTrocas(await umaFoto(c, o, {}), trocas, trocados)));
  }
  if (o.json) { fs.mkdirSync(path.dirname(path.resolve(o.json)), { recursive: true }); fs.writeFileSync(o.json, JSON.stringify(r, null, 1)); }
  console.log(linhaDeResumo(path.basename(o.out || o.json || 'shot'), r));
  if (!o.json && r.medida !== undefined) console.log(JSON.stringify(r.medida).slice(0, 2000));
  if (r.bloqueio === '1015') process.exitCode = C.BLOQUEIO_1015;
  else if (r.bloqueio === 'desafio') { console.error('desafio do CDN ("você é humano?"): não contorne; conte à pessoa e pare as visitas'); process.exitCode = C.BLOQUEIO_DESAFIO; }
  else if (r.erros.length) process.exitCode = 1;
}

if (C.ehPrincipal(import.meta.url)) main().catch((e) => { console.error('ERRO:', e.message); process.exitCode = process.exitCode || 1; });
