// rodada.mjs - uma rodada de prints sempre nos mesmos lugares, a partir de uma lista: no site no ar (uma visita por
// vez, com a pausa entre cargas e o 1015 tratado em cdp.mjs) ou nas cópias salvas, sem rede (--offline), em
// segundos. Serve para comparar o "hoje" com a prévia e uma versão com a outra. Nada é gravado no site.
//
// Uso:
//   node scripts/rodada.mjs --lista prints.txt --saida pasta [--site https://www.SUA-LOJA.com.br]
//        [--offline pasta-das-copias]
//        [--css proposta.css (--depois-de TRECHO | --substitui TRECHO | --fim-do-head)]
//        [--replace "trecho=>arquivo"]... [--inject arquivo.js]... [--eval "expressão"]...
//        [--medir [--mapa mapa.json]] [--so 01,08] [--agora ISO] [--relogio ISO] [--hide-avisos]
//        [--pausa 6] [--perfil pasta | --perfil-novo]
//
// A lista (um modelo em assets/prints-chave.txt): uma linha por print, "nome | caminho-ou-URL | opções do
// shot.mjs" (# começa comentário). O caminho junta com --site; as opções globais valem para todas as linhas, e as
// da linha acrescentam (--inject, --eval) ou trocam (o resto). O número antes do primeiro "-" do nome é o que o
// --so usa ("08-produto-celular" -> 08).
//
//   --offline    usa a cópia de cada linha (salvar_copia.mjs, com a mesma lista) em vez do site: sem trava, sem
//                pausa, sem rede. --replace não existe aqui: troque o arquivo com --css e --substitui.
//   --medir      carrega scripts/medir_cores.js e grava, por print, fundos, contraste, a varredura de texto abaixo
//                do mínimo e a rolagem lateral; --mapa troca o mapa de seletores (ex.: scripts/mapas/familia-dist.json).
//
// Saída: pasta/prints/NOME.png, pasta/medidas/NOME.json e pasta/resumo.json (uma linha curta por print: ok ou
// erro, rolagem lateral, textos abaixo do mínimo, mensagens de console). No terminal, uma linha por print.
// Códigos: 0 ok, 1 algum print com erro, 15 limite de pedidos (1015) duas vezes (a rodada para), 16 desafio do CDN.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from './cdp.mjs';
import { umaFoto, noAr, linhaDeResumo, FLAGS, MULTI, APELIDOS } from './shot.mjs';

const USO = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^\/\/ ?/gm, '');
const AQUI = path.dirname(fileURLToPath(import.meta.url));

function juntar(glob, linha) {
  const o = { ...glob };
  for (const [k, v] of Object.entries(linha)) {
    if (k === '_') continue;
    if (MULTI.includes(k)) o[k] = [...(glob[k] || []), ...v]; else o[k] = v;
  }
  return o;
}

async function main() {
  const g = C.lerArgs(process.argv.slice(2), { flags: [...FLAGS, 'medir'], multi: MULTI, apelidos: APELIDOS }, USO);
  if (!g.lista || !g.saida) { console.error('passe --lista e --saida (--help mostra o uso)'); process.exit(2); }
  const so = g.so ? new Set(String(g.so).split(',').map((s) => s.trim())) : null;
  const itens = C.lerLista(g.lista).filter((l) => !so || so.has(l.nome.split('-')[0]));
  if (!itens.length) { console.error('nenhum print na lista' + (so ? ' com --so ' + g.so : '')); process.exit(2); }
  const trocas = C.lerTrocas(g.replace);
  if (g.offline && trocas.length) throw new Error('--replace é só no ar; offline, use --css com --substitui');
  const medidor = g.medir ? fs.readFileSync(path.join(AQUI, 'medir_cores.js'), 'utf8') : null;
  const mapa = g.mapa ? fs.readFileSync(g.mapa, 'utf8') : 'null';
  for (const d of ['prints', 'medidas']) fs.mkdirSync(path.join(g.saida, d), { recursive: true });
  const nc = 'rod' + Date.now().toString(36);
  const resumo = [];
  let parou = null;

  const opcoesDe = (l) => {
    const linha = C.lerArgs(l.opcoes, { flags: FLAGS, multi: MULTI, apelidos: APELIDOS }, '');
    const o = juntar(g, linha);
    const url = C.juntarUrl(g.site || (g.offline ? 'http://copia.local' : ''), l.caminho);
    if (g.offline) { o.copia = path.join(g.offline, C.nomeDaCopia(url, !!o.celular)); delete o.url; }
    else o.url = url;
    o.out = path.join(g.saida, 'prints', l.nome + '.png');
    if (medidor) {
      o.inject = [...(o.inject || [])];
      o.eval = [...(o.eval || []), medidor + '\n;1'];
      o.measure = `Promise.resolve(window.__medirCores({mapa:${mapa}}))`;
    }
    return o;
  };
  const registrar = (l, o, r) => {
    fs.writeFileSync(path.join(g.saida, 'medidas', l.nome + '.json'), JSON.stringify(r, null, 1));
    const m = r.medida || {};
    resumo.push({ nome: l.nome, ok: !r.erros.length && !r.bloqueio, bloqueio: r.bloqueio, erros: r.erros,
      rolagemLateral: m.rolagem ? m.rolagem.lateral : undefined, abaixoDoMinimo: m.baixoContraste ? m.baixoContraste.abaixoDoMinimo : undefined,
      console: r.console.length, css: r.css ? (r.css.ok ? r.css.modo : r.css.erro) : undefined });
    console.log(linhaDeResumo(l.nome, r) + (m.rolagem ? ' | rolagem ' + m.rolagem.lateral + 'px' : '') + (m.baixoContraste ? ' | ' + m.baixoContraste.abaixoDoMinimo + ' textos abaixo do mínimo' : ''));
  };

  if (g.offline) {
    const c = await C.abrirChrome({ semRede: true });
    try {
      for (const l of itens) {
        const o = opcoesDe(l);
        if (!fs.existsSync(o.copia)) { registrar(l, o, { erros: ['sem cópia: ' + o.copia + ' (salvar_copia.mjs com a mesma lista)'], console: [] }); continue; }
        registrar(l, o, await umaFoto(c, o, { modoCopia: true }));
      }
    } finally { await c.fechar(); }
  } else {
    await noAr(g, (c) => C.trocarRespostas(c, trocas), async (s) => {
      for (const l of itens) {
        const o = opcoesDe(l);
        const r = await s.carregar(async (c, trocados) => { const n0 = trocados.length; const x = await umaFoto(c, o, { nc }); x.trocados = trocados.slice(n0); return x; });
        registrar(l, o, r);
        if (r.bloqueio) { parou = r.bloqueio; break; }
      }
    });
    if (trocas.length && !resumo.some((x) => x.ok)) console.error('aviso: nenhum print terminou bem; confira se o --replace casou (medidas/*.json, "trocados")');
  }
  fs.writeFileSync(path.join(g.saida, 'resumo.json'), JSON.stringify({ quando: new Date().toISOString(), modo: g.offline ? 'offline' : 'no ar', css: g.css || null, prints: resumo }, null, 1));
  const ruins = resumo.filter((x) => !x.ok).length;
  console.log(`fim: ${resumo.length} prints, ${ruins} com erro ou bloqueio | ${path.join(g.saida, 'resumo.json')}`);
  if (parou === '1015') process.exitCode = C.BLOQUEIO_1015;
  else if (parou === 'desafio') { console.error('desafio do CDN: não contorne; conte à pessoa e pare as visitas'); process.exitCode = C.BLOQUEIO_DESAFIO; }
  else if (ruins) process.exitCode = 1;
}

main().catch((e) => { console.error('ERRO:', e.message); process.exitCode = process.exitCode || 1; });
