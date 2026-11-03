// salvar_copia.mjs - salva cópias das páginas da loja para iterar o CSS OFFLINE (shot.mjs --copia,
// rodada.mjs --offline, larguras.mjs --offline): uma visita por página e aparelho, com a trava e o ritmo das
// visitas de cdp.mjs, e depois nenhuma. Ver references/previa.md, "Iterar offline, confirmar no ar".
//
// Uso:
//   node scripts/salvar_copia.mjs --url URL [--celular] --saida pasta-das-copias
//   node scripts/salvar_copia.mjs --lista prints.txt [--site https://www.SUA-LOJA.com.br] --saida pasta-das-copias
//        [--sem-rolar] [--relogio ISO] [--agora ISO] [--pausa 6] [--perfil pasta]
//
// Na --lista (o mesmo arquivo do rodada.mjs), cada endereço + aparelho diferente vira uma cópia; das opções da
// linha, só --celular, --relogio e --agora contam. O nome do arquivo sai do caminho e do aparelho
// (ex.: moveis-quarto--computador.mhtml), e o rodada.mjs --offline acha a cópia pelo mesmo nome.
//
// A cópia é um MHTML do Chrome com o DOM de DEPOIS que os scripts da página rodaram (vitrines e carrosséis
// montados), as folhas de estilo na mesma ordem (cada <style> vira um <link data-era-style> no mesmo lugar), as
// fotos e as fontes que já tinham carregado (a página é rolada inteira antes, a não ser com --sem-rolar). Os
// scripts não vão: aberta sem rede, a cópia não conta visita nem dispara pixel. Ela é de uma data e de um
// aparelho: o que depende de JS (menu aberto por clique, contagem andando) e o que chega depois não estão nela.
// Grava também copias.json na pasta (endereço, aparelho, data, tamanho e sha256 de cada cópia).
// Códigos de saída: 0 ok, 1 erro, 15 limite de pedidos (1015) duas vezes, 16 desafio do CDN.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as C from './cdp.mjs';
import { noAr } from './shot.mjs';

const USO = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^\/\/ ?/gm, '');

async function main() {
  const o = C.lerArgs(process.argv.slice(2), { flags: ['celular', 'sem-rolar'], multi: [], apelidos: { mobile: 'celular' } }, USO);
  if (!o.saida || (!o.url === !o.lista)) { console.error('passe --saida e --url ou --lista (--help mostra o uso)'); process.exit(2); }
  const paginas = [], vistos = new Set();
  const add = (url, op) => {
    const k = C.nomeDaCopia(url, !!op.celular);
    if (vistos.has(k)) return;
    vistos.add(k); paginas.push({ url, celular: !!op.celular, relogio: op.relogio, agora: op.agora, arquivo: k });
  };
  if (o.url) add(o.url, o);
  else for (const l of C.lerLista(o.lista)) {
    const op = C.lerArgs(l.opcoes, { flags: ['celular', 'hide-avisos', 'rolar', 'full', 'perfil-novo', 'sem-nc', 'fim-do-head'], multi: ['inject', 'eval', 'replace'], apelidos: { mobile: 'celular' } }, '');
    add(C.juntarUrl(o.site, l.caminho), { celular: op.celular, relogio: op.relogio || o.relogio, agora: op.agora || o.agora });
  }
  fs.mkdirSync(o.saida, { recursive: true });
  const indice = path.join(o.saida, 'copias.json');
  let idx = {};
  try { idx = JSON.parse(fs.readFileSync(indice, 'utf8')); } catch (e) {}
  const nc = 'copia' + Date.now().toString(36);
  let parou = null;
  const salvar = async (c, p) => {
    const r = { url: p.url, celular: p.celular, doc: null, erros: [] };
    await C.aparelho(c, { celular: p.celular });
    const ids = [];
    if (p.relogio) ids.push((await c.send('Page.addScriptToEvaluateOnNewDocument', { source: C.exprRelogio(p.relogio) })).identifier);
    if (p.agora) ids.push((await c.send('Page.addScriptToEvaluateOnNewDocument', { source: C.exprAgora(p.agora) })).identifier);
    const tirar = c.on('Network.responseReceived', (x) => { if (x.type === 'Document' && r.doc === null) r.doc = x.response.status; });
    try {
      const carregou = c.once('Page.loadEventFired', 45000);
      await c.send('Page.navigate', { url: C.ehLocal(p.url) ? p.url : C.comNc(p.url, nc) });
      await carregou; await C.sleep(2500);
      if (!C.ehLocal(p.url)) { const bl = await c.ev(C.EXPR_BLOQUEIO); if (bl || r.doc === 429) { r.bloqueio = bl || '1015'; return r; } }
      await c.ev('document.fonts ? document.fonts.ready.then(function(){return 1}) : 1');
      if (!o['sem-rolar']) { await c.ev(C.EXPR_ROLAR); await C.sleep(1000); }
      r.estilosConvertidos = await c.ev(C.EXPR_PREPARAR_COPIA);
      r.body = (await c.ev('document.body.className.replace(/\\s+/g," ").trim()')).slice(0, 200);
      r.titulo = (await c.ev('document.title')).slice(0, 100);
      r.fotosSemCarregar = await c.ev('[].filter.call(document.images,function(i){return !(i.complete&&i.naturalWidth)}).length');
      const snap = await c.send('Page.captureSnapshot', { format: 'mhtml' });
      const dest = path.join(o.saida, p.arquivo);
      fs.writeFileSync(dest, snap.data);
      r.arquivo = p.arquivo; r.bytes = Buffer.byteLength(snap.data); r.sha256 = crypto.createHash('sha256').update(snap.data).digest('hex');
      r.data = new Date().toISOString();
    } catch (e) { r.erros.push(e.message.slice(0, 300)); }
    finally { tirar(); for (const id of ids) await c.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: id }).catch(() => {}); }
    return r;
  };
  const uma = async (s, p) => {
    const r = await s.carregar((c) => salvar(c, p));
    if (r.arquivo) idx[r.arquivo] = r;
    fs.writeFileSync(indice, JSON.stringify(idx, null, 1));
    console.log([p.arquivo, r.bloqueio ? 'BLOQUEIO ' + r.bloqueio : r.erros.length ? 'ERRO ' + r.erros.join(' / ') : 'ok',
      'doc ' + r.doc, r.bytes ? Math.round(r.bytes / 1024) + ' KB' : '', r.fotosSemCarregar ? r.fotosSemCarregar + ' fotos sem carregar' : ''].filter(Boolean).join(' | '));
    return r;
  };
  const todas = async (s) => {
    for (const p of paginas) {
      const r = await uma(s, p);
      if (r.bloqueio) { parou = r.bloqueio; break; }
    }
  };
  if (paginas.every((p) => C.ehLocal(p.url))) {
    const c = await C.abrirChrome({});
    try { await todas({ carregar: (fn) => fn(c) }); } finally { await c.fechar(); }
  } else await noAr(o, async () => null, todas);
  if (parou === '1015') process.exitCode = C.BLOQUEIO_1015;
  else if (parou === 'desafio') { console.error('desafio do CDN: não contorne; conte à pessoa e pare as visitas'); process.exitCode = C.BLOQUEIO_DESAFIO; }
}

main().catch((e) => { console.error('ERRO:', e.message); process.exitCode = process.exitCode || 1; });
