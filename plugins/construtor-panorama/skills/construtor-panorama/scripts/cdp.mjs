// cdp.mjs - o que os scripts de Chrome da skill têm em comum. Não roda sozinho: é importado por shot.mjs,
// rodada.mjs, salvar_copia.mjs, larguras.mjs e rev.mjs.
//
// O que está aqui:
//   - achar o Chrome (variável CHROME, ou os caminhos de costume no Windows, no macOS e no Linux);
//   - abrir um Chrome headless próprio e falar com ele pelo protocolo de depuração (CDP), com ou sem rede;
//   - o RITMO DAS VISITAS ao site no ar (references/previa.md, "Ritmo das visitas ao site"):
//       * uma visita por vez no computador inteiro: uma trava em PASTA_VISITAS/trava, respeitada por todos os
//         scripts e por todos os agentes que usam estes scripts;
//       * PAUSA_VISITAS segundos entre o fim de uma carga e o começo da próxima (padrão 6; menos de 5 vira 5);
//       * o mesmo perfil do Chrome (e o cache dele: CSS, JS, fontes e fotos não são baixados de novo) em todas
//         as visitas: PASTA_VISITAS/perfil, ou SHOT_PERFIL;
//       * num 1015 ou 429 (limite de pedidos do CDN), a visita espera 6 minutos com a trava na mão e tenta uma
//         vez; no segundo, o script sai com o código 15. Desafio de "verificar se você é humano": sai com o
//         código 16, sem tentar de novo (não se contorna; a pessoa decide);
//     PASTA_VISITAS padrão: <pasta temporária do sistema>/panorama-visitas;
//   - CSS de prévia na posição certa da cascata (--depois-de, --substitui, --fim-do-head), com a mesma regra do
//     gerar_previa.py: o trecho tem de casar com exatamente um <link> ou <style>;
//   - o relógio da página numa data escolhida (--relogio) e a hora fixa da prévia (--agora, window.__previaAgora).
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import { pathToFileURL } from 'node:url';

export const UA = {
  celular: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  computador: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- argumentos
// opcoes: { flags: ['celular', ...], multi: ['inject', ...], apelidos: { mobile: 'celular' } }
// --chave valor | --flag | --chave=valor. Sem --help, devolve o objeto; com --help, imprime `uso` e sai 0.
export function lerArgs(argv, opcoes, uso) {
  const { flags = [], multi = [], apelidos = {} } = opcoes;
  const o = { _: [] };
  for (const m of multi) o[m] = [];
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i];
    if (a === '--help' || a === '-h') { console.log(uso.trim()); process.exit(0); }
    if (!a.startsWith('--')) { o._.push(a); continue; }
    let v;
    const eq = a.indexOf('=');
    if (eq > 0) { v = a.slice(eq + 1); a = a.slice(0, eq); }
    let k = a.slice(2);
    k = apelidos[k] || k;
    if (flags.includes(k)) { o[k] = true; continue; }
    if (v === undefined) {
      if (i + 1 >= argv.length) throw new Error(`falta o valor de --${k}`);
      v = argv[++i];
    }
    if (multi.includes(k)) o[k].push(v); else o[k] = v;
  }
  return o;
}

// separa uma linha de opções como o shell faria, com "aspas" e 'aspas' (sem variáveis nem escapes de shell)
export function separarOpcoes(linha) {
  const out = [];
  let cur = '', q = null, tem = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (q) { if (c === q) q = null; else cur += c; continue; }
    if (c === '"' || c === "'") { q = c; tem = true; continue; }
    if (/\s/.test(c)) { if (cur || tem) { out.push(cur); cur = ''; tem = false; } continue; }
    cur += c;
  }
  if (q) throw new Error('aspas sem fechar em: ' + linha);
  if (cur || tem) out.push(cur);
  return out;
}

// lista de prints: uma linha por print, "nome | caminho-ou-URL | opções do shot.mjs"; # começa comentário
export function lerLista(arquivo) {
  const linhas = fs.readFileSync(arquivo, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
  const out = [];
  linhas.forEach((l, i) => {
    const t = l.trim();
    if (!t || t.startsWith('#')) return;
    const partes = t.split('|');
    if (partes.length < 2) throw new Error(`${arquivo}:${i + 1}: esperava "nome | caminho | opções"`);
    out.push({ nome: partes[0].trim(), caminho: partes[1].trim(), opcoes: separarOpcoes(partes.slice(2).join('|').trim()), linha: i + 1 });
  });
  return out;
}

export function juntarUrl(site, caminho) {
  if (/^(https?|file):/i.test(caminho)) return caminho;
  if (!site) throw new Error(`"${caminho}" é um caminho; passe --site https://www.SUA-LOJA.com.br (do perfil)`);
  return site.replace(/\/+$/, '') + '/' + caminho.replace(/^\/+/, '');
}

export function comNc(url, marca) {
  if (/^file:/i.test(url)) return url;
  const [semHash, hash] = url.split('#');
  return semHash + (semHash.includes('?') ? '&' : '?') + 'nc=' + marca + (hash !== undefined ? '#' + hash : '');
}

// nome de arquivo de uma cópia: caminho da URL + aparelho (o mesmo em salvar_copia.mjs e no modo offline)
export function nomeDaCopia(url, celular) {
  let p = url;
  try { const u = new URL(url, 'http://copia.local/'); p = u.pathname + (u.search.replace(/[?&]nc=[^&]*/g, '').replace(/^&/, '?')); } catch (e) {}
  let s = p.replace(/^\/+|\/+$/g, '').replace(/\.html?$/i, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  if (!s) s = 'home';
  if (s.length > 80) s = s.slice(0, 60) + '-' + s.slice(-19);
  return s + (celular ? '--celular' : '--computador') + '.mhtml';
}

export function ehLocal(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(u.hostname) || u.hostname.endsWith('.localhost');
  } catch (e) { return true; }
}

// ---------------------------------------------------------------- Chrome
export function acharChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const cands = [];
  if (process.platform === 'win32') {
    const pf = [process.env['PROGRAMFILES'], process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean);
    for (const b of pf) cands.push(path.join(b, 'Google/Chrome/Application/chrome.exe'));
    for (const b of pf) cands.push(path.join(b, 'Microsoft/Edge/Application/msedge.exe'));
    cands.push('C:/Program Files/Google/Chrome/Application/chrome.exe');
  } else if (process.platform === 'darwin') {
    cands.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium');
  } else {
    for (const n of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
      try { const p = execFileSync('which', [n], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); if (p) cands.push(p); } catch (e) {}
    }
  }
  const achado = cands.find((c) => { try { return fs.statSync(c).isFile(); } catch (e) { return false; } });
  if (!achado) throw new Error('não achei o Chrome; defina a variável CHROME com o caminho do executável');
  return achado;
}

async function portaLivre() {
  const livre = (p) => new Promise((res) => {
    const s = net.createServer();
    s.once('error', () => res(false));
    s.once('listening', () => s.close(() => res(true)));
    s.listen(p, '127.0.0.1');
  });
  for (let i = 0; i < 60; i++) { const p = 9300 + Math.floor(Math.random() * 2600); if (await livre(p)) return p; }
  throw new Error('nenhuma porta livre para o Chrome');
}

// abre um Chrome headless próprio. o: { largura, altura, perfil, semRede }
// semRede: o DNS não resolve nada fora de 127.0.0.1 e todo pedido que não é file:, data: ou blob: é derrubado.
export async function abrirChrome(o = {}) {
  if (typeof WebSocket === 'undefined') throw new Error('precisa do Node 22 ou mais novo (WebSocket nativo)');
  const porta = await portaLivre();
  let perfil = o.perfil, temporario = false;
  if (!perfil) { perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'panorama-chrome-')); temporario = true; }
  fs.mkdirSync(perfil, { recursive: true });
  const args = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--mute-audio', `--user-data-dir=${perfil}`, `--remote-debugging-port=${porta}`,
    `--window-size=${o.largura || 1920},${o.altura || 1080}`];
  if (o.semRede) {
    args.push('--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1', '--disable-background-networking',
      '--disable-component-update', '--disable-sync', '--disable-domain-reliability', '--no-pings', '--allow-file-access-from-files');
  }
  args.push('about:blank');
  const proc = spawn(acharChrome(), args, { stdio: 'ignore' });
  let lista = null;
  for (let i = 0; i < 100 && !lista; i++) {
    try { const r = await fetch(`http://127.0.0.1:${porta}/json/list`); if (r.ok) lista = await r.json(); } catch (e) {}
    if (!lista) await sleep(150);
  }
  if (!lista) { try { proc.kill(); } catch (e) {} throw new Error('o Chrome não respondeu'); }
  const alvo = lista.find((t) => t.type === 'page');
  const ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('não conectei no Chrome')); });
  let seq = 0;
  const pend = new Map(), ouvintes = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pend.has(d.id)) {
      const p = pend.get(d.id); pend.delete(d.id);
      if (d.error) p.rej(new Error(p.method + ': ' + d.error.message)); else p.res(d.result);
      return;
    }
    if (d.method) for (const l of ouvintes.slice()) if (l.method === d.method) l.fn(d.params);
  };
  const c = {
    perfil, porta, semRede: !!o.semRede,
    send(method, params = {}) { const id = ++seq; ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => pend.set(id, { res, rej, method })); },
    on(method, fn) { const l = { method, fn }; ouvintes.push(l); return () => { const i = ouvintes.indexOf(l); if (i >= 0) ouvintes.splice(i, 1); }; },
    once(method, ms = 45000) {
      return new Promise((res) => { let tirar; const t = setTimeout(() => { tirar(); res(null); }, ms); tirar = c.on(method, (p) => { clearTimeout(t); tirar(); res(p); }); });
    },
    // limite de tempo em toda avaliação: numa cópia (MHTML) os scripts da página ficam desligados e um setTimeout
    // de dentro da página nunca dispara (medido em 2026-11-03); sem o limite, o script ficaria parado para sempre
    async ev(expr, awaitPromise = true, ms = 60000) {
      let t;
      const limite = new Promise((_, j) => { t = setTimeout(() => j(new Error(`a expressão não terminou em ${ms / 1000} s` + (o.semRede ? ' (na cópia, setTimeout da página não dispara)' : ''))), ms); });
      const r = await Promise.race([c.send('Runtime.evaluate', { expression: expr, awaitPromise, returnByValue: true }), limite]).finally(() => clearTimeout(t));
      if (r.exceptionDetails) { const d = r.exceptionDetails; throw new Error('erro no JS: ' + ((d.exception && d.exception.description) || d.text)); }
      return r.result && r.result.value;
    },
    async fechar() {
      try { await c.send('Browser.close'); } catch (e) {}
      try { ws.close(); } catch (e) {}
      try { proc.kill(); } catch (e) {}
      await sleep(400);
      if (temporario) { try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) {} }
    },
  };
  await c.send('Page.enable');
  await c.send('Runtime.enable');
  await c.send('Network.enable');
  if (o.semRede) {
    c.bloqueados = [];
    await c.send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
    c.on('Fetch.requestPaused', (p) => {
      const u = p.request.url;
      if (/^(file|data|blob):/i.test(u)) c.send('Fetch.continueRequest', { requestId: p.requestId }).catch(() => {});
      else { if (c.bloqueados.length < 200) c.bloqueados.push(u.slice(0, 140)); c.send('Fetch.failRequest', { requestId: p.requestId, errorReason: 'BlockedByClient' }).catch(() => {}); }
    });
  }
  return c;
}

// computador ou celular. No celular: User-Agent de Android (o servidor manda o HTML de celular, body.isMobile),
// 375x812, dpr 2 e toque. Trocar o aparelho só vale para a PRÓXIMA carga.
export async function aparelho(c, { celular = false, largura, altura, dpr } = {}) {
  const w = +(largura || (celular ? 375 : 1920)), h = +(altura || (celular ? 812 : 1080)), d = +(dpr || (celular ? 2 : 1));
  await c.send('Emulation.setUserAgentOverride', { userAgent: celular ? UA.celular : UA.computador, platform: celular ? 'Android' : 'Windows' });
  await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: d, mobile: celular });
  await c.send('Emulation.setTouchEmulationEnabled', { enabled: celular, maxTouchPoints: celular ? 5 : 1 });
  return { largura: w, altura: h, dpr: d, celular };
}

// troca a resposta de todo pedido cujo endereço contém o trecho pelo arquivo local, só neste Chrome
// (a simulação da gravação de um Arquivo da loja: a página como ela fica depois de gravar).
export async function trocarRespostas(c, trocas) {
  if (!trocas.length) return [];
  const reps = trocas.map((x) => ({ t: x.t, f: x.f, body: fs.readFileSync(x.f).toString('base64') }));
  const trocados = [];
  await c.send('Fetch.enable', { patterns: reps.map((x) => ({ urlPattern: '*' + x.t + '*', requestStage: 'Request' })) });
  c.on('Fetch.requestPaused', (p) => {
    const u = p.request.url, r = reps.find((x) => u.includes(x.t));
    if (!r) { c.send('Fetch.continueRequest', { requestId: p.requestId }).catch(() => {}); return; }
    const tipo = /\.css(\?|$)/i.test(u) ? 'text/css; charset=utf-8' : /\.js(\?|$)/i.test(u) ? 'application/javascript; charset=utf-8' : 'application/octet-stream';
    trocados.push(u.slice(0, 160) + ' <= ' + path.basename(r.f));
    c.send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: tipo }, { name: 'Cache-Control', value: 'no-store' }], body: r.body }).catch(() => {});
  });
  return trocados;
}

export function lerTrocas(lista) {
  return (lista || []).map((v) => {
    const i = v.indexOf('=>');
    if (i <= 0) throw new Error(`--replace "${v}": use "trecho=>arquivo"`);
    const f = v.slice(i + 2);
    if (!fs.existsSync(f)) throw new Error(`--replace: não achei ${f}`);
    return { t: v.slice(0, i), f };
  });
}

// ---------------------------------------------------------------- 1015, 429 e desafios
export const BLOQUEIO_1015 = 15, BLOQUEIO_DESAFIO = 16;
export const EXPR_BLOQUEIO = `(function(){var t=(document.title+' '+(document.body?document.body.innerText.slice(0,3000):''));
  if(/Error 1015|You are being rate limited|rate limited/i.test(t)) return '1015';
  if(/Just a moment|Checking your browser|Verify you are human|Verifique se você é humano|cf-chl|Attention Required/i.test(t)||document.querySelector('#challenge-form,#cf-challenge-running,iframe[src*="challenges.cloudflare.com"]')) return 'desafio';
  return '';})()`;

// ---------------------------------------------------------------- trava e ritmo das visitas
export function pastaVisitas() {
  const p = process.env.PASTA_VISITAS || path.join(os.tmpdir(), 'panorama-visitas');
  fs.mkdirSync(p, { recursive: true });
  return p;
}
export function perfilPadrao() { return process.env.SHOT_PERFIL || path.join(pastaVisitas(), 'perfil'); }
export function pausaMs(valor) {
  const s = Number(valor || process.env.PAUSA_VISITAS || 6);
  return Math.max(5, Math.min(60, Number.isFinite(s) ? s : 6)) * 1000;
}
function vivo(pid) { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } }

// espera a vez (uma visita por vez no computador), segura a trava e devolve { antesDeCarregar, bloqueio, soltar }.
// antesDeCarregar(): espera a pausa desde a última carga (e o fim de um bloqueio 1015 marcado por outro processo).
export async function pegarVez({ quem = path.basename(process.argv[1] || 'script'), pausa, esperaMax = 25 * 60 * 1000 } = {}) {
  const dir = pastaVisitas();
  const trava = path.join(dir, 'trava'), ultima = path.join(dir, 'ultima-carga'), bloq = path.join(dir, 'bloqueio-ate');
  const t0 = Date.now();
  let avisou = false;
  for (;;) {
    try {
      const fd = fs.openSync(trava, 'wx');
      fs.writeSync(fd, JSON.stringify({ pid: process.pid, quem, desde: new Date().toISOString() }));
      fs.closeSync(fd);
      break;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      let info = null;
      try { info = JSON.parse(fs.readFileSync(trava, 'utf8')); } catch (x) {}
      const velha = info && Date.now() - Date.parse(info.desde) > 30 * 60 * 1000;
      if (!info || !vivo(info.pid) || velha) { try { fs.unlinkSync(trava); } catch (x) {} continue; }
      if (!avisou) { console.error(`esperando a vez: ${info.quem} (pid ${info.pid}) está visitando o site desde ${info.desde}`); avisou = true; }
      if (Date.now() - t0 > esperaMax) throw new Error('esperei a vez por tempo demais; outra visita segura a trava em ' + trava);
      await sleep(1000);
    }
  }
  const soltarSync = () => { try { const i = JSON.parse(fs.readFileSync(trava, 'utf8')); if (i.pid === process.pid) fs.unlinkSync(trava); } catch (e) {} };
  process.on('exit', soltarSync);
  for (const s of ['SIGINT', 'SIGTERM']) process.once(s, () => { soltarSync(); process.exit(130); });
  const ms = pausaMs(pausa);
  return {
    async antesDeCarregar() {
      const lerNum = (f) => { try { return +fs.readFileSync(f, 'utf8') || 0; } catch (e) { return 0; } };
      const ate = Math.max(lerNum(ultima) + ms, lerNum(bloq));
      const falta = ate - Date.now();
      if (falta > 0) { if (falta > 15000) console.error(`pausa de ${Math.round(falta / 1000)} s antes da próxima carga`); await sleep(falta); }
    },
    depoisDeCarregar() { fs.writeFileSync(ultima, String(Date.now())); },
    marcarBloqueio(min = 6) { fs.writeFileSync(bloq, String(Date.now() + min * 60 * 1000)); },
    soltar() { try { fs.writeFileSync(ultima, String(Date.now())); } catch (e) {} soltarSync(); },
  };
}

// ---------------------------------------------------------------- CSS na posição da cascata
// alvo: { depoisDe | substitui | fimDoHead }. depoisDe/substitui: trecho do href de um <link>, '#id' de um
// <style>/<link>, ou 'style:TRECHO' do texto de um <style> (fora os de SVG e os de prévia). Tem de casar com 1.
// Devolve uma expressão JS que liga (ou religa) o CSS e diz onde ele entrou; 'desligar' tira e religa o que tirou.
export function exprCss(css, alvo = {}, id = 'previa-css') {
  const espec = alvo.substitui || alvo.depoisDe || '';
  const modo = alvo.substitui ? 'substitui' : alvo.depoisDe ? 'depoisDe' : alvo.fimDoHead ? 'fimDoHead' : '';
  return `(function(){
  var ID=${JSON.stringify(id)}, CSS=${JSON.stringify(css)}, ESP=${JSON.stringify(espec)}, MODO=${JSON.stringify(modo)};
  ${FUNCOES_ALVO}
  desligar(ID);
  if(!MODO) return {erro:'diga onde o CSS entra: --depois-de, --substitui ou --fim-do-head'};
  var alvo=null;
  if(MODO!=='fimDoHead'){ var a=acharAlvo(ESP); if(a.erro) return a; alvo=a.el; }
  var s=document.createElement('style'); s.id=ID; s.setAttribute('data-previa',ID); s.textContent=CSS;
  if(MODO==='fimDoHead') document.head.appendChild(s); else alvo.parentNode.insertBefore(s, alvo.nextSibling);
  if(MODO==='substitui'){ if(!alvo.sheet) { s.remove(); return {erro:'o alvo ainda não carregou a folha: '+ESP}; } alvo.sheet.disabled=true; alvo.setAttribute('data-previa-desligou',ID); }
  document.body && document.body.offsetHeight;
  return {ok:true, modo:MODO, onde: alvo ? (alvo.tagName.toLowerCase()+' '+(alvo.getAttribute('href')||alvo.id||'')).slice(0,120) : 'fim do head', regras: s.sheet ? s.sheet.cssRules.length : null};
})()`;
}
export function exprDesligarCss(id = 'previa-css') {
  return `(function(){ ${FUNCOES_ALVO} return desligar(${JSON.stringify(id)}); })()`;
}
const FUNCOES_ALVO = `
  function desligar(id){ var n=0; var v=document.getElementById(id); if(v){ v.remove(); n++; }
    [].forEach.call(document.querySelectorAll('[data-previa-desligou="'+id+'"]'),function(e){ if(e.sheet) e.sheet.disabled=false; e.removeAttribute('data-previa-desligou'); n++; });
    return n; }
  function textoDoLink(l){ try { return decodeURIComponent(escape(atob(l.getAttribute('href').split(',')[1]))); } catch(x){ return ''; } }
  function acharAlvo(esp){
    var c=[];
    if(esp.indexOf('style:')===0){ var t=esp.slice(6);
      c=[].filter.call(document.querySelectorAll('style'),function(s){ return !s.closest('svg') && !s.hasAttribute('data-previa') && s.textContent.indexOf(t)>=0; });
      /* numa cópia salva (salvar_copia.mjs), cada <style> virou um <link data-era-style> no mesmo lugar */
      c=c.concat([].filter.call(document.querySelectorAll('link[data-era-style]'),function(l){ return textoDoLink(l).indexOf(t)>=0; })); }
    else if(esp.charAt(0)==='#'){ var e=document.getElementById(esp.slice(1)); if(e) c=[e]; }
    else { c=[].filter.call(document.querySelectorAll('link[rel~="stylesheet"]'),function(l){ return (l.getAttribute('href')||'').indexOf(esp)>=0 || (l.href||'').indexOf(esp)>=0; }); }
    if(c.length!==1) return {erro:(c.length?'mais de um':'nenhum')+' alvo casou com '+JSON.stringify(esp)+' ('+c.length+')'};
    return {el:c[0]};
  }`;

// ---------------------------------------------------------------- relógio e hora da prévia
// --relogio: a página inteira (o Date de todos os scripts) acha que é a data dada, desde o <head>, e o relógio
// anda a partir dela. Também define window.__previaAgora com a mesma hora (a convenção de temas-sazonais.md).
export function exprRelogio(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) throw new Error('data inválida: ' + iso + ' (use 2026-12-02T10:00:00-03:00)');
  return `(function(){var D=Date,off=${t}-D.now();
 function F(a,b,c,d,e,f,g){ if(!(this instanceof F)) return new D(D.now()+off).toString(); var n=arguments.length;
  return n===0?new D(D.now()+off):n===1?new D(a):new D(a,b,c===undefined?1:c,d||0,e||0,f||0,g||0); }
 F.prototype=D.prototype; F.now=function(){return D.now()+off}; F.parse=D.parse; F.UTC=D.UTC; window.Date=F;
 window.__previaAgora=function(){return D.now()+off;}; })();`;
}
// --agora: só window.__previaAgora, parado na hora dada (o Date da página continua o de verdade)
export function exprAgora(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) throw new Error('data inválida: ' + iso);
  return `window.__previaAgora=function(){return ${t};};1`;
}

// esconde só na aba do script os avisos de cookies, de LGPD, de app e de notificação (diga isso na legenda)
export const SELETORES_AVISOS = '#lgpd-overlay,.lgpd-message,#lgpd-message,.lgpd,.lgpd-container,.lgpd-cookies,[class*="lgpd"],.cookies,#cookies,.cookie-bar,.box-cookies,[class*="cookie"],[id*="cookie"],#app-overlay,#app-message,.app-message,.app-banner,.smartbanner,#smartbanner,.banner-app,.alert-app,.box-app,.popup-app,.app-download,.onesignal-slidedown-container,#onesignal-slidedown-container,#onesignal-bell-container,.push-notification';
export function exprEsconder(extra) {
  const sel = SELETORES_AVISOS + (extra ? ',' + extra : '');
  return `(function(){var s=document.getElementById('__esconde-avisos')||document.createElement('style');s.id='__esconde-avisos';s.setAttribute('data-previa','avisos');s.textContent=${JSON.stringify(sel + '{display:none!important}')};document.head.appendChild(s);return 1})()`;
}
// antes de salvar uma cópia: o MHTML do Chrome tira cada <style> do lugar e o põe no começo do <head>, o que
// muda a ordem da cascata. Aqui cada <style> (fora os de SVG) vira um <link> no mesmo lugar, com os mesmos
// atributos (o id fica) e o texto num endereço data:, marcado com data-era-style. Medido em 2026-11-03 num site
// de teste local: a ordem das folhas e o id saíram iguais na cópia aberta sem rede.
export const EXPR_PREPARAR_COPIA = `(async function(){var n=0;
  var ss=[].filter.call(document.querySelectorAll('style'),function(s){return !s.closest('svg') && !s.hasAttribute('data-previa');});
  for (var i=0;i<ss.length;i++){ var s=ss[i], t=s.textContent;
    if(!t.trim() && s.sheet) t=[].map.call(s.sheet.cssRules,function(r){return r.cssText}).join('\\n');
    var l=document.createElement('link'); l.rel='stylesheet';
    for (var k=0;k<s.attributes.length;k++){ var a=s.attributes[k]; if(a.name!=='type') l.setAttribute(a.name,a.value); }
    l.setAttribute('data-era-style','1'); l.href='data:text/css;charset=utf-8;base64,'+btoa(unescape(encodeURIComponent(t)));
    var p=new Promise(function(r){l.onload=r;l.onerror=r;setTimeout(r,3000);}); s.parentNode.insertBefore(l,s); await p; s.remove(); n++; }
  return n;})()`;

// rola a página inteira devagar (fotos preguiçosas e vitrines que chegam depois) e volta ao topo
export const EXPR_ROLAR = '(async function(){var d=document.documentElement;d.style.scrollBehavior="auto";var h=d.scrollHeight;for(var y=0;y<h;y+=600){scrollTo(0,y);await new Promise(function(r){setTimeout(r,160)});h=d.scrollHeight;}await new Promise(function(r){setTimeout(r,1500)});scrollTo(0,0);await new Promise(function(r){setTimeout(r,400)});return h})()';

export function ehPrincipal(metaUrl) {
  try { return metaUrl === pathToFileURL(path.resolve(process.argv[1])).href; } catch (e) { return false; }
}

// rodado sozinho (node scripts/cdp.mjs --help), mostra este cabeçalho e onde está a trava agora
if (ehPrincipal(import.meta.url)) {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^\/\/ ?/gm, '').trim());
  const t = path.join(process.env.PASTA_VISITAS || path.join(os.tmpdir(), 'panorama-visitas'), 'trava');
  let ch;
  try { ch = acharChrome(); } catch (e) { ch = 'NÃO ACHEI (defina CHROME)'; }
  const node = +process.versions.node.split('.')[0] >= 22 ? 'ok' : 'precisa do 22 ou mais novo';
  console.log('\nTrava agora: ' + (fs.existsSync(t) ? fs.readFileSync(t, 'utf8') : 'livre') + ' (' + t + ')');
  console.log(`Node ${process.versions.node} (${node}) | Chrome: ${ch}`);
}
