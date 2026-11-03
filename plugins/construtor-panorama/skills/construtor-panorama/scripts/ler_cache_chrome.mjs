// ler_cache_chrome.mjs - tira respostas do cache em disco de um perfil do Chrome (o formato "blockfile", o padrão
// do Chrome no Windows), SÓ LENDO o disco, sem rede: para recuperar uma resposta que uma visita já trouxe (o HTML
// de uma vitrine que chegou por XHR, um CSS) sem visitar o site de novo. Último recurso: a cópia do
// salvar_copia.mjs já traz o que estava na página.
//
// Uso:
//   node scripts/ler_cache_chrome.mjs --perfil pasta-do-perfil --filtro "trecho do endereço" [--saida pasta]
//
//   --perfil  a pasta do perfil (a de SHOT_PERFIL, ou <pasta temporária>/panorama-visitas/perfil); o cache fica
//             em Default/Cache/Cache_Data. Feche o Chrome desse perfil antes (os arquivos mudam enquanto ele roda).
//   --filtro  só as entradas cujo endereço contém o trecho
//   --saida   grava o corpo de cada resposta achada num arquivo (nome pelo fim do endereço + um número)
// Imprime, por entrada: o endereço, o tamanho, a compressão e se deu para ler. Outros formatos de cache (o
// "simple cache" do Linux e do Android) não são lidos: o script avisa e sai.
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { lerArgs } from './cdp.mjs';

const USO = fs.readFileSync(new URL(import.meta.url), 'utf8').split('\nimport ')[0].replace(/^\/\/ ?/gm, '');
const o = lerArgs(process.argv.slice(2), { flags: [], multi: [], apelidos: {} }, USO);
if (!o.perfil || !o.filtro) { console.error('passe --perfil e --filtro (--help mostra o uso)'); process.exit(2); }
const cands = [path.join(o.perfil, 'Default', 'Cache', 'Cache_Data'), path.join(o.perfil, 'Default', 'Cache'), o.perfil];
const dir = cands.find((d) => fs.existsSync(path.join(d, 'data_1')));
if (!dir) { console.error('não achei data_1 (cache blockfile) em ' + cands.join(', ') + '; este perfil usa outro formato de cache'); process.exit(1); }

const files = {};
const rd = (n) => (files[n] ??= fs.readFileSync(path.join(dir, n)));
const BS = { 1: 36, 2: 256, 3: 1024, 4: 4096, 5: 8, 6: 104, 7: 48 };
function readAddr(a, size) {
  if (!(a & 0x80000000)) return null;
  const t = (a & 0x70000000) >>> 28;
  if (t === 0) return rd('f_' + (a & 0x0fffffff).toString(16).padStart(6, '0')).subarray(0, size);
  const fileN = (a & 0x00ff0000) >>> 16, start = a & 0xffff, nb = ((a & 0x03000000) >>> 24) + 1;
  const b = rd('data_' + fileN); const off = 8192 + start * BS[t];
  return b.subarray(off, off + Math.min(size, nb * BS[t]));
}
const d1 = rd('data_1');
const out = [];
let n = 0;
for (let off = 8192; off + 256 <= d1.length; off += 256) {
  const keyLen = d1.readInt32LE(off + 32); if (keyLen <= 0 || keyLen > 4096) continue;
  let key; const longKey = d1.readUInt32LE(off + 36);
  try {
    if (longKey) { const k = readAddr(longKey, keyLen); key = k ? k.toString('latin1') : ''; }
    else key = d1.subarray(off + 96, off + 96 + keyLen).toString('latin1');
  } catch (e) { continue; }
  if (!key.includes(o.filtro)) continue;
  const sizes = [0, 1, 2, 3].map((i) => d1.readInt32LE(off + 40 + 4 * i));
  const addrs = [0, 1, 2, 3].map((i) => d1.readUInt32LE(off + 56 + 4 * i));
  let head = null, body = null;
  try { head = readAddr(addrs[0], sizes[0]); body = readAddr(addrs[1], sizes[1]); } catch (e) {}
  const hs = head ? head.toString('latin1') : '';
  const enc = ((hs.match(/content-encoding\x00?:?\s*([a-z]+)/i) || [])[1] || '').toLowerCase();
  let txt = null, err = null;
  if (body) {
    try { txt = enc === 'br' ? zlib.brotliDecompressSync(body) : enc === 'gzip' ? zlib.gunzipSync(body) : enc === 'zstd' && zlib.zstdDecompressSync ? zlib.zstdDecompressSync(body) : body; }
    catch (x) { err = String(x).slice(0, 120); }
  }
  // a chave começa pelo isolamento de rede ("_dk_" e o site de quem pediu); o endereço é o último pedaço
  const url = (key.match(/(https?:\/\/\S+)$/) || [key])[0];
  const item = { url: url.slice(0, 200), bytes: sizes[1], compressao: enc || 'nenhuma', lido: !!txt, erro: err || undefined };
  if (txt && o.saida) {
    fs.mkdirSync(o.saida, { recursive: true });
    const base = (url.split('?')[0].split('/').filter(Boolean).pop() || 'resposta').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
    item.arquivo = path.join(o.saida, `${String(++n).padStart(3, '0')}-${base}`);
    fs.writeFileSync(item.arquivo, txt);
  }
  out.push(item);
}
for (const i of out) console.log([i.url, i.bytes + ' bytes', i.compressao, i.lido ? 'lido' : 'NÃO LIDO' + (i.erro ? ' (' + i.erro + ')' : ''), i.arquivo || ''].filter(Boolean).join(' | '));
console.log(`${out.length} entradas com "${o.filtro}"`);
