// larguras.mjs - rolagem lateral (scrollWidth - clientWidth) e quem a causa, em várias larguras de computador
// numa carga só (carrega na primeira largura e depois só muda o tamanho da janela) e, à parte, no HTML de celular
// a 375. No ar (com a trava e o ritmo das visitas) ou nas cópias salvas (--offline). Só lê: não clica nem digita.
// Meça antes de ligar a prévia (a linha de base) e depois, com --css: o critério é "nenhuma rolagem a mais".
//
// Uso:
//   node scripts/larguras.mjs (--url URL | --copia pagina.mhtml | --lista prints.txt [--site S] [--offline pasta])
//        [--larguras 1920,1366,1100,1024] [--aparelhos computador,celular]
//        [--css proposta.css (--depois-de TRECHO | --substitui TRECHO | --fim-do-head)] [--inject f.js]...
//        [--saida pasta] [--pausa 6] [--perfil pasta]
//
// Com --lista (a mesma do rodada.mjs), mede cada caminho diferente da lista uma vez por aparelho.
// --copia/--offline: a cópia de computador serve às larguras de computador, a de celular ao 375.
// Saída: uma linha por página e aparelho no terminal e, com --saida, larguras.json e larguras.md (a tabela).
// Atenção: as larguras depois da primeira são medidas por resize, não por carga nova. Para a rolagem lateral
// costuma bastar; quando um número mudar muito, confira com uma carga nova (shot.mjs --largura N).
// Códigos: 0 ok, 1 erro, 15 limite de pedidos (1015) duas vezes, 16 desafio do CDN.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as C from './cdp.mjs';
import { noAr } from './shot.mjs';

const USO = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^\/\/ ?/gm, '');
const MEDIDOR = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'medir_cores.js'), 'utf8');

async function medirPagina(c, p, o, ctx) {
  const out = { nome: p.nome, aparelho: p.celular ? 'celular' : 'computador', doc: null, medidas: [], erros: [] };
  const larguras = p.celular ? [375] : String(o.larguras || '1920,1366,1100,1024').split(',').map(Number);
  await C.aparelho(c, { celular: p.celular, largura: larguras[0], altura: p.celular ? 812 : 1080 });
  const tirar = c.on('Network.responseReceived', (x) => { if (x.type === 'Document' && out.doc === null) out.doc = x.response.status; });
  try {
    const carregou = c.once('Page.loadEventFired', 45000);
    const alvo = p.copia ? pathToFileURL(path.resolve(p.copia)).href : (C.ehLocal(p.url) ? p.url : C.comNc(p.url, ctx.nc));
    await c.send('Page.navigate', { url: alvo });
    await carregou; await C.sleep(p.copia ? 600 : +(o.wait || 3500));
    if (!p.copia) { const b = await c.ev(C.EXPR_BLOQUEIO); if (b || out.doc === 429) { out.bloqueio = b || '1015'; return out; } }
    if (o.css) { const r = await c.ev(C.exprCss(fs.readFileSync(o.css, 'utf8'), { depoisDe: o['depois-de'], substitui: o.substitui, fimDoHead: !!o['fim-do-head'] })); if (r.erro) throw new Error('CSS não entrou: ' + r.erro); out.css = r.modo + ' ' + r.onde; }
    for (const f of o.inject || []) { await c.ev(fs.readFileSync(f, 'utf8') + '\n;1'); await C.sleep(250); }
    await c.ev(MEDIDOR + '\n;1');
    for (let i = 0; i < larguras.length; i++) {
      const w = larguras[i];
      if (i > 0) {
        await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
        await C.sleep(1200); await c.ev('window.dispatchEvent(new Event("resize"));1'); await C.sleep(1300);
      }
      const r = await c.ev('window.__medirRolagem()');
      out.medidas.push({ largura: w, modo: i === 0 ? 'carga' : 'resize', lateral: r.lateral, culpados: r.culpados.slice(0, 5), culpadosTotal: r.culpadosTotal });
    }
  } catch (e) { out.erros.push(e.message.slice(0, 300)); } finally { tirar(); }
  return out;
}

function tabela(res, o) {
  const ws = [...String(o.larguras || '1920,1366,1100,1024').split(',').map(Number), 375];
  const linhas = {};
  for (const r of res) for (const m of r.medidas) {
    const c = m.culpados[0] ? m.culpados[0].el.split(' < ')[0] : '';
    (linhas[r.nome] = linhas[r.nome] || {})[m.largura] = m.lateral + 'px' + (m.lateral > 0 && c ? ' (' + c.slice(0, 45) + ')' : '');
  }
  const t = ['| página | ' + ws.join(' | ') + ' |', '|---'.repeat(ws.length + 1) + '|'];
  for (const [n, v] of Object.entries(linhas)) t.push('| ' + n + ' | ' + ws.map((w) => v[w] || '-').join(' | ') + ' |');
  t.push('', `${ws[0]} = carga nova; as outras de computador = resize da mesma aba; 375 = carga nova com o HTML de celular.` + (o.css ? ' Com a prévia ' + path.basename(o.css) + '.' : ' Sem prévia (linha de base).'));
  return t.join('\n');
}

async function main() {
  const o = C.lerArgs(process.argv.slice(2), { flags: ['fim-do-head', 'perfil-novo'], multi: ['inject'], apelidos: {} }, USO);
  const aparelhos = String(o.aparelhos || 'computador,celular').split(',');
  const paginas = [];
  const add = (nome, url, copiaDir, copia) => {
    for (const a of aparelhos) {
      const celular = a.trim() === 'celular';
      const p = { nome, celular, url };
      if (copia) p.copia = copia;
      else if (copiaDir) p.copia = path.join(copiaDir, C.nomeDaCopia(url, celular));
      paginas.push(p);
    }
  };
  if (o.url) add('página', o.url);
  else if (o.copia) paginas.push({ nome: path.basename(o.copia), celular: /--celular\.mhtml$/.test(o.copia), copia: o.copia });
  else if (o.lista) {
    const vistos = new Set();
    for (const l of C.lerLista(o.lista)) {
      if (vistos.has(l.caminho)) continue; vistos.add(l.caminho);
      const url = C.juntarUrl(o.site || (o.offline ? 'http://copia.local' : ''), l.caminho);
      add(C.nomeDaCopia(url, false).replace(/--computador\.mhtml$/, ''), url, o.offline);
    }
  } else { console.error('passe --url, --copia ou --lista (--help mostra o uso)'); process.exit(2); }
  const nc = 'larg' + Date.now().toString(36);
  const res = [];
  let parou = null;
  const imprimir = (r) => console.log(`${r.nome} ${r.aparelho}: ` + (r.bloqueio ? 'BLOQUEIO ' + r.bloqueio : r.erros.length ? 'ERRO ' + r.erros.join(' / ') : r.medidas.map((m) => `${m.largura}=${m.lateral}px` + (m.lateral > 0 && m.culpados[0] ? ' (' + m.culpados[0].el.split(' < ')[0].slice(0, 40) + ')' : '')).join(' ')));
  if (paginas.every((p) => p.copia || C.ehLocal(p.url))) {
    const c = await C.abrirChrome({ semRede: paginas.some((p) => p.copia) });
    try {
      for (const p of paginas) {
        // a lista pode não ter este aparelho para esta página: sem cópia, pula (e diz)
        if (p.copia && !fs.existsSync(p.copia)) { console.log(`${p.nome} ${p.celular ? 'celular' : 'computador'}: sem cópia (${path.basename(p.copia)}), pulei`); continue; }
        const r = await medirPagina(c, p, o, { nc }); res.push(r); imprimir(r);
      }
    } finally { await c.fechar(); }
  } else {
    await noAr(o, async () => null, async (s) => {
      for (const p of paginas) {
        const r = await s.carregar((c) => medirPagina(c, p, o, { nc }));
        res.push(r); imprimir(r);
        if (r.bloqueio) { parou = r.bloqueio; break; }
      }
    });
  }
  if (o.saida) {
    fs.mkdirSync(o.saida, { recursive: true });
    fs.writeFileSync(path.join(o.saida, 'larguras.json'), JSON.stringify(res, null, 1));
    fs.writeFileSync(path.join(o.saida, 'larguras.md'), tabela(res, o) + '\n');
    console.log('tabela: ' + path.join(o.saida, 'larguras.md'));
  }
  if (parou === '1015') process.exitCode = C.BLOQUEIO_1015;
  else if (parou === 'desafio') process.exitCode = C.BLOQUEIO_DESAFIO;
  else if (res.some((r) => r.erros.length)) process.exitCode = 1;
}

main().catch((e) => { console.error('ERRO:', e.message); process.exitCode = process.exitCode || 1; });
