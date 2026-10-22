# Como gravar uma página do construtor no admin, e como verificar

Este arquivo é a receita da gravação de uma **página do construtor** pelo campo `Blocos:` (à mão ou por
script) e da verificação depois. Ele também guarda as medições do admin que valem para qualquer gravação:
o clique certo por botão, o diálogo morto, a grade invisível, o modal do `Limpar cache`.

Gravar uma **página tipo Arquivo** (os CSS e JS do site) ou um campo da **configuração da loja** (`<head>`,
agenda de skins, Barra do Topo, logo) tem roteiro próprio, em `gravacao-arquivo-e-head.md`. Os limites da
ferramenta de navegador estão em `ferramentas-de-navegador.md`.

Os números daqui foram medidos numa loja real da plataforma. Os da sua loja (número da loja, endereço do
admin, ids de página, nomes de arquivo) são outros, porque cada loja cria os seus: ficam no perfil dela,
em `~/.claude/panorama-lojas/<slug-da-loja>.md`. Nos exemplos, `#NNNNNN` é um id de página, `loja N` é o
número da loja, `admin.SUA-LOJA.com.br` é o endereço do admin e `/seu-tema.css` é um arquivo do site.

## Antes de qualquer gravação

Quase nenhum erro de gravação aparece como erro: a tela volta ao normal e o site muda (ou deixa de mudar)
em silêncio. Por isso estas regras vêm antes de qualquer receita, e pesam mais ainda quando quem pede não é
desenvolvedor e não tem como conferir o que foi feito:

1. **Leia o perfil da loja.** Ele traz o número da loja, o endereço do admin e o domínio do site. Num admin
   com várias lojas, a mesma grade mostra páginas de todas, e nome de página se repete entre elas.
2. **Grave só o que a pessoa pediu, no lugar que ela indicou** (a regra zero do `SKILL.md`). Diga antes,
   em português simples, o que vai mudar e onde, e espere a resposta. `Excluir`, `Publicar` e
   `Despublicar` só com um pedido à parte que nomeie o botão e a página: um "aprovado" sobre a prévia não
   é esse pedido (`previa.md`, "Aprovação, gravação e conferência"). Com esse pedido, o `Publicar` por
   script segue `gravacao-arquivo-e-head.md`, "Publicar, quando a pessoa pede"; `Excluir` e `Despublicar`
   não têm caminho por script.
3. **Guarde o valor atual num arquivo local antes de trocar**, com a data no nome. O admin não guarda
   versões anteriores: sem esse arquivo não há como voltar. Para o `Blocos:`, a receita (como tirar o campo
   inteiro apesar da saída cortada da ferramenta, e a comparação com o backup logo antes de `injetar`) está
   em `construtor.md`, seção 0, "Backup do `Blocos:`". O `window.__BACKUP_BLOCOS` que `injetar()` guarda
   não serve de backup: o reload da verificação o apaga.
4. **Mostre a prévia antes e espere o "aprovado"** (`previa.md`). Para blocos e layout, a prévia é a página
   de rascunho que a pessoa indicou (`construtor.md`, passo 8); para o CSS da página, o favorito com
   `--depois-de "#builder-custom-css"`. Na página que vai ao ar, grave só o JSON aprovado (`construtor.md`,
   passo 9).
5. **Por script, comece por `definirLoja(...)`** (`scripts/injetar.js`), com os dados do perfil:

   ```js
   definirLoja({ loja: N, hostAdmin: 'admin.SUA-LOJA.com.br', dominio: 'www.SUA-LOJA.com.br' });
   ```

   As funções que gravam abortam sem ela, abortam se ela ainda estiver com o texto de exemplo e abortam se
   a aba estiver em outro admin. O `location.reload()` apaga a definição: rode de novo depois de cada
   reload.
6. **O que não aparece pode ser permissão.** Um botão (`Alterar`, `Confirmar`, `Limpar cache`), uma aba ou
   um campo que a receita usa e não aparece para este usuário: pare, anote no perfil ("Acessos deste
   usuário no admin") e pergunte. Não grave por outro caminho: o escopo de um campo que não aparece na
   tela, uma chamada direta ao servidor, outro diálogo, outro login (`SKILL.md`, regra zero). Por script,
   `confirmarGravacao` aborta se o diálogo não tem o `Confirmar` dele, em vez de procurar outro na página
   (passo 4).

---

## O caminho oficial: o campo `Blocos:`

Existe um editor de JSON no admin. É por ele que a skill entrega.

```
Loja On-line → Páginas
  → conferir o filtro Loja (a loja do perfil)
  → selecionar a linha da página
  → Alterar
  → aba Configurações
  → campo Blocos:        ← o JSON da página inteira, editável
  → Confirmar            ← grava
```

O campo é uma `textarea` espelhada por um editor Ace com numeração de linha. Colar o JSON ali e clicar
`Confirmar` substitui a página. Não precisa abrir o construtor.

Colar **à mão** funciona porque a colagem dispara o `ng-change` do campo. **Por script ele não dispara**,
e aí `Confirmar` grava o conteúdo antigo em silêncio (seção seguinte). Cuidado também com o tamanho: o Ace
congelou com um payload de **284 KB** escrito por script (medido); colagem humana nesse tamanho não foi
testada.

⚠️ **Há duas textareas com o mesmo `name="configInput"`** na aba `Configurações`: uma é o campo
`Custom Config:`, a outra é o `Blocos:`. Por script, **desambigue pelo `ng-model`**, nunca pelo `name`:

| Campo na tela | `ng-model` |
|---|---|
| `Custom Config:` | `configInput.custom` |
| **`Blocos:`** | **`configInput.builder`** |

Ler o errado devolve string vazia e dá a impressão de que a página está sem conteúdo.

### O que grava é `data.config.builder`, não `configInput.builder`

É o erro mais caro da automação, porque a tela confirma o que não aconteceu: escrever na `<textarea>`, no
editor Ace **ou no model `configInput.builder`** mostra o texto novo, você clica em `Confirmar`, e a página
grava o conteúdo antigo, sem erro nenhum. Medido: o model tinha **284.053 chars** conferidos, e a página
gravou os **11.756 chars antigos**.

`configInput` é só o buffer da tela (atribuir `scope.configInput.builder = json` também não grava). O
mecanismo, lido do próprio admin:

- a `<textarea>` **e** a div `ui-ace` têm as duas `ng-model="configInput.builder"` e
  `ng-change="controller.onConfigInputChange(this.configInput.builder, 'builder')"`;
- `getDataSubmit()` devolve `$scope.data`;
- e o `ng-change` faz:

```js
onConfigInputChange = function(value, place) {
  var newConfig = vm.parseJson(value);
  if (!$scope.data.config) { $scope.data.config = {}; }
  $scope.data.config[place] = newConfig;      // ← o destino real
}
```

Ou seja: o que vai para o banco é **`data.config.builder`, um objeto já parseado**, atualizado só pelo
`ng-change` — que não dispara quando você atribui o model por script. Escrever `configInput` sem disparar
o `ng-change` deixa `data.config.builder` com o conteúdo anterior, e é isso que é gravado.

O valor atribuído é **objeto**, não string: quem faria o `JSON.parse` é o `parseJson` do controller, e você
está pulando ele. **Confira sempre por `sc.data.config.builder`**, nunca por `textarea.value` nem por
`configInput.builder`. Como chegar nesse `sc` está no passo 2, porque chegar nele **pelo elemento errado**
é o segundo erro mais caro deste arquivo.

`scripts/injetar.js` já faz essa parte: `escopoDoDialogo(dlg)` sobe a cadeia de `$parent` a partir do nó
do diálogo, `injetar()` escreve o objeto em `data.config.builder` e `lerBlocos()` confere pelo objeto, não
pelo DOM.

**Como saber se a sua cópia do `injetar.js` é a atual:** ela tem `definirLoja`, `exigirLoja`,
`abrirDialogo`, `clicarNg`, `dialogoUnico`, `escopoDoDialogo`, `confirmarGravacao`, `verificarGravou`,
`lerDefaultVivo` (com `abrirConstrutor` trocando para a aba `Geral` sozinho) e as funções de Arquivo e de
`<head>` (`lerEntradaArquivo`, `confirmarArquivo`, `trocarNoHead`, `trocarNaConfig`, `confirmarConfigLoja`),
responde o modal do `Limpar cache` só por `clicarOkDoModal`, confere a loja pelo campo Loja do diálogo
(`lerCampoLoja`), nas páginas e nos Arquivos clica só no `Confirmar` de dentro do diálogo
(`botaoConfirmarDoDialogo`) e, na configuração da loja, exige a subaba do campo visível para o usuário
(`abaDaChave`, `abaVisivel`). Uma cópia que confere a loja por "qualquer campo do diálogo com o número da
loja" é antiga e quase não protege numa loja de número pequeno. Uma cópia
que procura `scopeDosDados`, ou que escreve no Ace e em `configInput.builder`, também é antiga: ela partia de um
elemento achado no `document` e chegava ao diálogo **morto** do passo 2, e gravava conteúdo antigo em
silêncio.

---

# A gravação por script, em cinco passos

A lição comum a todos os passos é uma só:

> ⚠️ **Nenhum dos erros aqui dá erro.** Não há exceção, não há aviso no console, e a tela volta ao estado
> normal como se tivesse funcionado. O clique errado no `Confirmar` fecha o diálogo igual ao certo; o
> escopo errado aceita a escrita; a URL pública pode devolver bytes idênticos por ~100 s. A única defesa é
> asserção que **aborta** — um `console.warn` que ninguém lê é indistinguível de sucesso.

`injetar.js` traz as funções, e nele **as duas formas de clique são funções separadas**: `clicarNg()` /
`abrirDialogo()` (só `triggerHandler`, para quem **abre**) e `clicarBotao()` / `confirmarGravacao()`
(sequência completa, para quem **confirma**). O `clicarBotao` sozinho não serve para o `Alterar`: abre dois
diálogos (passo 1). Se a sua cópia tiver um `clicarBotao` único usado para tudo, ela é antiga.

## Passo 1 — abrir o diálogo: `triggerHandler` sozinho

Os botões do admin são `ng-click`. O `clicarBotao()` de `injetar.js` dispara `mousedown`+`mouseup`+`click`
**e** `angular.element(b).triggerHandler('click')` — ou seja, aciona o `ng-click` **duas vezes**. O efeito
disso **depende do botão**. Medido em produção, gravando a mesma página quatro vezes:

| botão | só `.click()` nativo | só `triggerHandler` | os dois juntos (`clicarBotao`) |
|---|---|---|---|
| `Alterar` | **não abre** o diálogo | abre **1** diálogo (certo) | abre **2** diálogos (errado) |
| `Confirmar` | fecha o diálogo e **não grava** | **não grava** | **grava** (certo) |

Não existe um clique universal: o composto é obrigatório no `Confirmar` e errado no `Alterar`, onde produz
o segundo diálogo que envenena o passo 2. Abra assim:

```js
const b = [...document.querySelectorAll('button, a')]
  .find(x => /^\s*Alterar\s*$/.test((x.textContent||'').trim()) && x.offsetParent !== null);
angular.element(b).triggerHandler('click');        // só isto — nada de mousedown/mouseup/click
```

Depois disso, a aba: `clicarBotao('Configurações')` **não troca a aba** (as abas são `.pane-item`, o texto
vem como `"Configurações()"`, e o menu lateral tem um item com o mesmo rótulo — o `acharPorRotulo` acha o
errado). Use `abaDialogo(/Configura/i)`.

Os demais botões da tela (`Atualizar`, `Cancelar`, `Limpar cache` e as abas) foram dirigidos com o evento
composto e funcionaram; não foram medidos um por um como `Alterar` e `Confirmar`. Duas exceções já
conhecidas:

- **itens do menu lateral** querem clique **simples** (`clicarMenu()`): o composto abre **duas abas
  internas** e você fica com duas grades no DOM (passo 2);
- **`Abrir construtor`** não responde a clique nenhum, nem composto nem real por coordenada. É
  `ng-click="controller.toggleBuilder();"` e só abre pelo scope — use `abrirConstrutor()`.
  Ele fica na aba **`Geral`**, não na `Configurações`: como o fluxo de gravação te leva para a
  `Configurações`, o botão aparece com `offsetParent === null` **sempre**, com página cheia ou vazia
  (medido numa página com 20 blocos salvos; `armadilhas.md` **1e**). Por isso `abrirConstrutor()` troca
  de aba sozinho.
  ⚠️ **E o construtor inteiro mora nesse pane — voltar para a `Configurações` o esconde.** Medido:
  `abrirConstrutor()` devolveu `true` e, de volta na `Configurações`, `input[name=syncData]` **não
  existia** e havia **0** botões `addBlock` visíveis; `lerDefaultVivo()` falhava com "botão de adicionar
  bloco não encontrado" logo depois de abrir. Por isso o `voltarPara` de `abrirConstrutor()` é `null` por
  default: fique na `Geral` enquanto usar o construtor e volte para a `Configurações` só para gravar.

## Passo 2 — exija um diálogo só, e ligue pelo elemento dele

**Diálogo velho pode não sair do DOM.** Medido no `Alterar` de uma página do construtor: depois de gravar
(ou depois de um `Alterar` que abriu dois), o `.ui-dialog` anterior continuou no documento, escondido com
**`z-index` menor** que o do novo. Ele não estava `display:none`: os campos dele existiam, respondiam, e o
Angular deles ainda tinha scope vivo. (Noutros diálogos, medido o contrário: em 2026-10, numa loja, o
diálogo Configurações e o `Alterar` de um Arquivo saíram do DOM depois do `Cancelar`, com 0 `.ui-dialog`.
Conte com `contarDialogos()`, não suponha; a regra abaixo vale para os dois casos.)

E `document.querySelectorAll('textarea')` devolve **em ordem de DOM**, ou seja, entrega a textarea do
diálogo **morto**. Aconteceu: o escopo foi ligado no morto, o JSON escrito nele, o `Confirmar` clicado
nele — e depois o diálogo real foi cancelado. Nada gravou e nada corrompeu, mas foi por sorte: o mesmo
descuido com o diálogo de outra página na frente grava no lugar errado.

A regra tem três partes, e as três são necessárias: **exija exatamente 1 diálogo**, **ligue pelo
elemento do diálogo** (nunca por `document.querySelectorAll`), e **antes de `Confirmar` prove que o escopo
do diálogo aberto é o mesmo que você alterou**.

```js
function dialogoUnico() {
  const dlgs = [...document.querySelectorAll('.ui-dialog')];
  if (dlgs.length !== 1) throw new Error('ABORTADO: ' + dlgs.length + ' diálogos no DOM. '
    + 'Saia por Cancelar, recarregue o admin e reabra com triggerHandler sozinho.');
  return dlgs[0];                                   // aborte — não escolha um por z-index
}

function escopoDoDialogo(dlg) {
  const ta = dlg.querySelector('textarea[ng-model="configInput.builder"]');   // escopado no diálogo
  if (!ta) throw new Error('ABORTADO: este diálogo não tem o campo Blocos: — está na aba Configurações?');
  let sc = angular.element(ta).scope();
  while (sc && !(sc.data && sc.data.config !== undefined)) sc = sc.$parent;
  if (!sc) throw new Error('ABORTADO: sem scope com data.config — por aqui não existe gravação.');
  return sc;
}

const SC = escopoDoDialogo(dialogoUnico());
window.__SC = SC;                                   // guarde: o passo 4 compara com isto
```

O `while` existe porque o scope da textarea é filho e não tem `data`; não dá para chutar um `$parent` só.

A mesma disciplina vale para a **grade**: com abas internas abertas há **N `<table>`** no documento, e a de
`Páginas` pode ser a **invisível** — uma trava `document.querySelectorAll('table').length === 1` aborta a
gravação certa, e quem varre o `document` inteiro conta checkbox de uma grade que você não está vendo. O
`conferirAlvo()` de `injetar.js` escopa em `gradeVisivel()`. À mão:

```js
const grade = [...document.querySelectorAll('table')].find(t => t.offsetParent);
const marcadas = [...grade.querySelectorAll('tr input[type=checkbox]')].filter(c => c.checked);
if (marcadas.length !== 1) throw new Error('ABORTADO: ' + marcadas.length + ' linhas marcadas.');
```

Confirme pela grade visível: `marcadas.length === 1` **dentro da grade visível**. O rodapé é segunda
evidência só quando diz `Registro(s) Selecionado(s)`, e aí tem de dizer 1; noutro admin (2026-10), sem linha
marcada, ele dizia só `Registro(s): N` (`mapa-do-admin.md`, seção 0). E, com o diálogo aberto,
`conferirDialogo('minha-pagina-teste')` confere a URL e a loja do perfil **dentro do diálogo** — a loja no
campo Loja do diálogo, e só nele (`lerCampoLoja`; se ela pedir para mapear o campo, é o snippet F de
`reconhecimento-da-loja.md`). `confirmarGravacao()` não clica sem ela, nem num diálogo conferido com outra
loja, nem num diálogo de criação ("Adicionar Página": um `Confirmar` ali cria página nova).

Medido numa loja da plataforma (2026-10-20, só leitura): o campo Loja do diálogo `Alterar`, numa página
Construtor e numa tipo Arquivo, é `data.loja`, um `DIV` (seletor próprio do admin, sem `value` e com o
texto vazio) cujo model é um objeto `{id, nome, url, icon}`. O `id` é o número da loja, o mesmo do filtro
Loja, e é por ele que a trava passa. `lerCampoLoja()` lê só as chaves `id`/`codigo` e
`nome`/`name`/`descricao` de um model assim: outra chave `*_id` (`empresa_id`, por exemplo) pode ter o
número da sua loja num diálogo de outra loja. Confira na sua com o snippet F.

## Passo 3 — transportar o JSON: sha256 não é opcional, e há dois caminhos

Payload real de uma home migrada: **293.469 chars** de JSON compacto; gzip+base64 dá **18.480 chars**.

Três caminhos já foram descartados por medição:

- ⚠️ **Transcrever base64 à mão falha.** Numa tentativa se perderam **~9.500 chars**; noutra, **1 caractere
  errado no offset 1198** de um pedaço de 2.400 (um `2` virou `0`). Payload opaco não perdoa: o dano só
  aparece no `JSON.parse`. Isto condena base64 **transcrito**, não base64 gerado por script colado inteiro
  numa chamada — que é o caminho 3a.
- ⚠️ **`fetch('http://127.0.0.1:PORTA/…')` de dentro do admin trava** — filtro de rede da extensão.
  Servir o JSON num servidor local não funciona.
- ⚠️ **`navigator.clipboard.readText()` estoura o `Runtime.evaluate`**: abre um **prompt de permissão**,
  e a chamada morre nos **45 s** do CDP esperando alguém clicar. Não é o clipboard que está inacessível — é
  a API que exige gesto.

(Para um arquivo local inteiro há um terceiro transporte, o `<input type=file>` com o upload da
ferramenta de navegador; ele está descrito em `gravacao-arquivo-e-head.md`, Passo B, e serve aqui também.)

### 3a. gzip+base64 numa única chamada — comece por aqui

Medido: **65.241 chars** de JSON viraram **4.888 de base64** (7,5%), passaram numa única chamada de
`javascript_tool` e o sha256 conferido **dentro da página** bateu com o do arquivo na primeira tentativa.
Não depende de foco, de aba ativa nem do clipboard. Medido também (2026-10-21) para levar uma prévia ao
painel do aplicativo, que não tem upload de arquivo: **~16,6 KB** de base64 numa chamada, sha conferido na
página (`ferramentas-de-navegador.md`, seção 4).

```bash
python - <<'PY'
import json, gzip, base64, hashlib
s = open('pagina.min.json', encoding='utf-8').read()
print(base64.b64encode(gzip.compress(s.encode('utf-8'), 9)).decode())
print('sha', hashlib.sha256(s.encode('utf-8')).hexdigest())
PY
```

```js
// uma chamada: decodifica, NÃO injeta, e devolve veredito
const bin = atob(b64), bytes = new Uint8Array(bin.length);
for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
const json = new TextDecoder('utf-8').decode(await new Response(
  new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
window.__PAYLOAD = json;
({ chars: json.length, shaConfere: (await sha256(json)) === 'SHA_DO_ARQUIVO' })
// só na chamada seguinte: injetar(window.__PAYLOAD)
```

**Confira o sha antes de injetar.** Aqui ele protege de base64 truncado na fronteira da chamada, que é o
modo de falha deste transporte: dá `InvalidCharacterError` no `atob` **ou**, pior, decodifica e produz JSON
inválido. Devolva `{chars, shaConfere}`, nunca o JSON (o filtro de saída bloqueia o que parece base64 —
ver `ferramentas-de-navegador.md`).

Guarde o resultado em `window.__PAYLOAD` e **injete na chamada seguinte**: decodificar (com `await`) e
injetar (com o digest do Angular) na mesma chamada aproxima os 45 s do CDP sem necessidade.

### 3b. Clipboard — funcionou, e já falhou sem explicação

O clipboard já levou 293 KB sem corrupção. Mas numa sessão **`ctrl+v` pela ação `key` devolveu 0 chars
duas vezes seguidas**, com `document.activeElement` sendo a textarea de cola, `document.hasFocus()`
**true**, **uma única aba** aberta no Chrome e o `Set-Clipboard` conferido no terminal (sha idêntico ao do
arquivo, 65.241 chars, acentos preservados). Não havia navegação em outra aba no meio. O que decide não se
sabe — é por isso que o 3a vem primeiro.

Se for usar, a trava de sha256 é o que transforma o problema numa rodada perdida em vez de lixo gravado:
foi ela que pegou os 0 chars antes de qualquer escrita. Duas ou três tentativas e troque de caminho — não
fique caçando foco.

O caminho do clipboard, em **chamadas separadas** (juntas estouram os 45 s):

1. no terminal: `Set-Clipboard -Value (Get-Content -Raw caminho\pagina.min.json)` e guarde o **sha256 do
   arquivo**;
2. na página: `criarCaixaDeCola()` — uma `<textarea>` **própria**, nunca a do admin (a do admin acorda o
   model, empurra o texto para o Ace e **congela o renderer**);
3. pelo teclado: **`ctrl+v` pela ação `key`**, sem coordenada;
4. `await conferirCola('<sha256 do arquivo>')`;
5. só então `await injetarDaCola()`.

⚠️ **Não pressione `ctrl+a` antes de colar**: pela ferramenta de teclado ele **digita a letra "a"**.
Medido: o campo ficou com **284.054 chars** começando em `a{"style"…`. Crie a caixa **vazia** — sem seleção
não há o que limpar.

### O clipboard é recurso global: outra pessoa pode sobrescrever o seu payload no meio

Aconteceu: numa colagem vieram **17 chars**, um código de rastreio de encomenda, porque a pessoa na máquina
copiou o código enquanto a gravação corria. O `Set-Clipboard` tinha funcionado; o clipboard simplesmente
mudou de dono entre o passo 1 e o passo 3.

**A conferência de sha256 dentro da página pegou antes de qualquer escrita**, e é por isso que ela é
obrigatória e não "boa prática". Sem ela, 17 chars entram em `data.config.builder`, o `JSON.parse` falha
(ou pior, passa) e você grava lixo numa página do site. Não relaxe essa checagem nem em payload pequeno: o
custo é uma chamada.

```js
async function sha256(t) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2,'0')).join('');
}
// devolva BOOLEANO e TAMANHO, não o hash cru (filtro de saída)
const t = document.getElementById('__caixa_cola');
({ chars: t.value.length, confere: (await sha256(t.value)) === '<sha256 do arquivo>' });
```

## Passo 4 — Confirmar: a sequência completa, e só ela grava

Antes de clicar, prove que você está no diálogo que alterou:

```js
if (escopoDoDialogo(dialogoUnico()) !== window.__SC)
  throw new Error('ABORTADO: o diálogo aberto não é o escopo que eu alterei.');
```

Depois, o clique — **os quatro eventos**, no `Confirmar` de dentro do diálogo:

```js
const b = [...dialogoUnico().querySelectorAll('button, a')]
  .find(x => /^\s*Confirmar\s*$/.test((x.textContent||'').trim()) && x.offsetParent !== null);
if (!b) throw new Error('ABORTADO: o diálogo não tem Confirmar visível. Pode ser permissão: pergunte.');
for (const t of ['mousedown','mouseup','click'])
  b.dispatchEvent(new MouseEvent(t, {bubbles:true, cancelable:true, view:window}));
angular.element(b).triggerHandler('click');         // ← sem este, não grava
```

`confirmarGravacao()` faz isso depois de seis travas: loja do perfil (`exigirLoja`), um diálogo só, escopo
`===` ao que `injetar()` alterou, mesmo nó de diálogo conferido por `conferirDialogo()` (com a loja do
perfil), mesmo tamanho canônico e um `Confirmar` visível **dentro** do diálogo (sem ele, aborta).
Um diálogo que abre sem `Confirmar` pode ser o perfil de acesso do usuário (ele vê, mas não grava), e um
`Confirmar` achado em outro lugar da página pode ser de outra tela (item 6 de "Antes de qualquer
gravação"). A busca na página inteira só existe com `confirmarGravacao({ confirmarForaDoDialogo: true })`,
quando o perfil anota que este admin desenha o `Confirmar` fora do `.ui-dialog` (medido), e aí exige
exatamente um visível. Nenhuma gravação medida precisou disso.

⚠️ **As duas formas erradas fecham o diálogo do mesmo jeito.** Só `.click()` nativo: fecha e não grava. Só
`triggerHandler`: não grava. Não há erro, não há aviso, e a leitura seguinte da URL pública — que pode
estar em cache por ~100 s (passo 5) — **confirma a ilusão de que gravou**. Foi a combinação desses dois
silêncios que produziu três regravações desnecessárias na mesma sessão.

## Passo 5 — verificar na fonte primeiro, depois limpar cache, depois a URL

### A URL pública pode ter cache de servidor de ~100 s e devolver bytes idênticos

Depois de `Confirmar`, a URL pode continuar servindo a versão **anterior** por cerca de **100 s**, com bytes
idênticos aos de antes da gravação. E os cabeçalhos **enganam**: na loja medida, com Cloudflare na frente,
a resposta vinha com `Cache-Control: no-cache` e `cf-cache-status: DYNAMIC`, o que faz parecer que não há
cache nenhum. Não é CDN nem navegador — **o cache é do backend da Panorama**, e nenhum header da resposta o
denuncia.

Este é o diagnóstico errado mais caro do fluxo: você grava, busca, vê o conteúdo velho, conclui que o
`Confirmar` falhou e **grava de novo**. Aconteceu **três vezes seguidas** numa sessão — três gravações
completas de ~293 KB para consertar um problema que não existia.

Não trate os ~100 s como certeza: noutro dia, duas gravações seguidas numa página de teste (64.744 e
64.790 chars) refletiram na **primeira** busca depois do `Confirmar`, e a segunda já servia o `style`
corrigido **antes** de qualquer `Limpar cache`. O que decide não se sabe (tamanho da página? mudança no
backend?). A ordem abaixo continua valendo porque o custo é assimétrico, mas **busque em vez de esperar**:
se vier velho, aí sim `Limpar cache` e poll.

**A ordem que resolve:**

1. **Fonte.** Saia por `Cancelar`, recarregue, reabra `Alterar` (com `triggerHandler` sozinho), volte à aba
   `Configurações` e leia `data.config.builder` do escopo. O diálogo recarrega do que está **salvo**, e é
   essa releitura que prova a gravação:

   ```js
   const sc = escopoDoDialogo(dialogoUnico());
   const s = JSON.stringify(sc.data.config.builder);
   ({ chars: s.length,
      raizes: (sc.data.config.builder.block_list || []).length,
      temMarcador: s.includes('UMA-STRING-QUE-SO-EXISTE-NA-VERSAO-NOVA') });   // booleanos e tamanhos
   ```

   Isso **só vale depois de reabrir**. Ler `configInput.builder` — ou mesmo `data.config.builder` — no
   **mesmo** diálogo em que você escreveu não prova nada: é o seu próprio buffer.

2. **`Limpar cache`** na tela `Páginas`, com a linha selecionada. Só tem efeito em página publicada. Numa
   loja real ele já respondeu direto "Cache limpo com sucesso (1 itens)", e noutro momento abriu **modal de
   confirmação** com `OK`/`Cancelar` — nesse caso **precisa de um segundo clique em `OK`, só por
   `clicarOkDoModal(/cache/i)`**, em outra chamada, ou nada acontece e a tela volta ao normal como se
   tivesse funcionado. Trate os dois casos. Por script, o primeiro clique é `limparCache(NNNNNN)`, que
   confere a linha marcada antes. Nunca `clicarBotao('OK')`: os modais já respondidos (de um `Publicar`,
   por exemplo) continuam no DOM, e o primeiro `OK` achado pode ser o deles (abaixo).

3. **Só então busque a URL.** Faça **poll** por uma string que só existe na versão nova, em chamadas
   separadas (um `await` longo estoura os 45 s), em vez de esperar um tempo fixo. Medido: em várias
   gravações seguidas, recarregar 10 ou 30 s depois ainda entregou a versão anterior; o reflexo levou
   **100 s**, dentro da janela de **60 a 120 s** já observada.

### `Limpar cache` e `Publicar` limpam a seleção da grade

A linha volta **desmarcada**, e a próxima trava de alvo aborta ("0 linha(s) marcada(s)") mesmo estando tudo
correto. **Remarque a linha antes de qualquer operação seguinte** — a trava não está com defeito.

### O modal de confirmação é alertify, e o fechado continua "visível"

`Publicar` e `Limpar cache`, quando abrem modal com `OK`/`Cancelar`, **não usam `.ui-dialog`**: os
containers são `.ajs-dialog` / `.ajs-content` / `.ajs-buttons`. E **as instâncias já respondidas ficam no
DOM com `offsetParent !== null`**: procurando o modal do `Limpar cache`, a leitura devolveu a pergunta do
`Publicar`, já respondida, e por um fio o `OK` errado não foi clicado. Medido: **2** `.ajs-dialog` no DOM,
**0** visíveis de verdade. Use estilo computado, não `offsetParent`:

```js
[...document.querySelectorAll('.ajs-dialog')].filter(x => { const s = getComputedStyle(x);
  return s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; })
```

`clicarOkDoModal(/cache/i)` de `injetar.js` faz essa conta e clica só no `OK` de dentro do modal que o
`limparCache(NNNNNN)` acabou de abrir: o `limparCache` anota antes quais modais estavam na tela (e aborta se
já houver algum), e o `clicarOkDoModal` aborta, sem clicar, se não houver exatamente um modal na tela, se
ele não for novo, ou se a pergunta não falar de cache ou falar de publicar ou excluir. Ver `armadilhas.md`
**28**.

### O tamanho do JSON muda entre duas leituras, e não é corrupção

`JSON.stringify(data.config.builder)` deu **297.831** numa leitura e **299.089** na seguinte, sem ninguém
escrever nada no meio. Causa: o AngularJS injeta a chave **`$$hashKey`** nos objetos que itera
(`ng-repeat`), então a árvore ganha chaves conforme a interface percorre os blocos.

Consequência prática: **não compare a gravação por igualdade de tamanho**. Compare o que é estável — número
de raízes, contagem de blocos por tipo, e a presença de um marcador que só existe na versão nova. E não gere
`$$hashKey` (nem `$hashKey`, nem `row_index_grid`) no JSON que você escreve: é lixo do AngularJS, ver
`armadilhas.md` item 4.

### E há uma segunda causa, que invalida o sha como prova no `Blocos:`: o servidor normaliza

Mais importante que o `$$hashKey`, porque não é ruído, é transformação sistemática. Medido: gravados
**64.744** chars, relidos **65.421** (+677), com `$$hashKey` em **zero** blocos. O servidor converte **todo
escalar em string** (`false`→`"false"`, `0`→`"0"`, `null`→`"null"`) e **descarta array vazio**
(`child: []` sumiu dos 12 blocos `editor`).

Logo `await verificarGravou(sha)` devolve `confere: false` em **toda** gravação nova de JSON. **Não regrave
por causa disso.** A prova válida é conteúdo, não hash:

```js
const o = escopoDoDialogo(dialogoUnico()).data.config.builder;   // diálogo REABERTO
let n = 0; (function w(l){(l||[]).forEach(b=>{n++; w(b.child)})})(o.block_list);
({ blocos: n, raizes: o.block_list.length, devices: o.block_list.map(r=>r.device_show),
   styleChars: o.style.length, bodyClass: o.body_class,
   marcador: o.style.indexOf('ALGO-QUE-SO-EXISTE-NA-VERSAO-NOVA') >= 0 })
```

(No Arquivo e no `<head>` é diferente: ali o conteúdo é texto, e o sha **normalizado** vale como prova —
ver `gravacao-arquivo-e-head.md`.) Mecanismo completo, a lista do que muda de tipo e a contradição que isso cria com o
`expand` do `accordion`: `armadilhas.md` item **27**.

---

## Navegar a tela Páginas por script

Cinco detalhes que travam a automação:

- **Os filtros mudam de admin para admin: ache cada um pelo rótulo, nunca pelo índice.** Medido em 2026:
  - num admin, **Loja · Nome · URL · Tipo · #**: Loja e Tipo são `<select>`, os outros três são `<input>`,
    e cada filtro tem também um operador oculto (10 elementos com o `ng-model`
    `filterSelected.value1`, 5 visíveis);
  - noutro, **Loja · Nome · URL · SKU · Prod. Ativo · Marca · Tipo**, **sem filtro `#`**, com o operador
    visível (`filterSelected.operador`) ao lado de cada um.

  Nos dois, todo campo de valor é `[ng-model="filterSelected.value1"]`, então a posição não diz qual
  filtro ele é: o terceiro `<input>` visível era o `#` no primeiro admin e é o SKU no segundo. O número no
  filtro errado devolve "Não localizado registros", e parece que a página não existe. Cada linha tem um `x`
  vermelho que remove o filtro.

  Para ver os filtros da tela, só lendo: `filtrosDaTela()` de `scripts/injetar.js` (sem o pacote
  carregado, cole as funções `semQuery`, `campoVisivel`, `naoDesenhado`, `rotuloExplicito`, `rotuloDoCampo`,
  `normRotulo`, `filtrosDaTela` e `campoDoFiltro` de lá; as do meio são usadas pelas outras). Ela devolve,
  para cada filtro visível, `{i, rotulo, campo, operador, valor}`: o rótulo que a tela mostra, se é `select` ou
  `input`, o operador (se estiver à vista) e o valor atual. `campoDoFiltro('Rótulo')` devolve o campo de
  valor daquele rótulo e aborta se não houver exatamente um. Rótulo vazio ou "(incerto)": confira num
  screenshot e mapeie à mão, sem adivinhar. Anote no perfil os rótulos, na ordem, e se a tela tem o filtro
  `#` (`reconhecimento-da-loja.md`, passo 3b).

  **Filtros feitos de seletor "bootstrap".** Medido em 2026-10, numa loja: Loja e Tipo eram um botão que
  mostra a opção escolhida e uma lista que abre, sobre um `<select>` escondido. A versão anterior de
  `rotuloDoCampo` leu o rótulo da Loja como os nomes das lojas da lista escondida, e o do Tipo como
  "(incerto)", pela lista longa. Hoje ficam fora do rótulo o que não está desenhado e as listas desses
  seletores, mesmo abertas, e um `aria-label` ou `<label for>` do campo vence; um rótulo feito só das opções
  do campo vira "(incerto)" (testado num DOM falso; no admin, confira com `filtrosDaTela()` e um
  screenshot). Onde o filtro Loja continuar sem rótulo legível, as funções que dependem dele
  (cache da configuração, `conferirUrlLivre`, `conferirCriacao`) o aceitam pelo valor da opção e pelo
  `lojaNome` de `definirLoja` (`filtroLojaDoPerfil`).

  **Sem o filtro `#`:** filtre por Loja, Tipo e Nome (ou um pedaço da URL sem hífen) e ache a linha pela
  coluna `#` da grade. `conferirAlvo(NNNNNN)` confere a linha marcada pelo número, então o filtro só precisa
  deixar a linha à vista. Num admin medido, a grade também lista produtos como páginas (tipo "Produto
  Derivação"): mantenha o filtro Tipo, ou a grade se enche deles.
- **A busca por URL não acha slug com hífen.** O autocomplete do filtro devolve "Nada encontrado contendo
  minha-pagina-teste" para uma página que existe. Contornos: filtrar pelo **`#` da página** (ex.:
  `NNNNNN`), onde houver esse filtro, ou escrever no input por script e clicar `Atualizar`:
  ```js
  const inp = campoDoFiltro('URL');   // pelo rótulo da tela; aborta se não houver exatamente um
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
  set.call(inp, 'minha-pagina-teste');
  inp.dispatchEvent(new Event('input', {bubbles:true}));
  // depois: clicarBotao('Atualizar'), e filtrosDaTela() para conferir o valor que ficou
  ```
  Buscar por um pedaço curto sem hífen (`minha`, `teste`) também funciona. Nos `<select>` (Loja, Tipo),
  escolha pela ação de formulário da ferramenta de navegador (pelo elemento, nunca por coordenada) ou peça
  à pessoa: a troca por script (`value` + evento `change`) não foi medida nesses filtros. Num seletor
  "bootstrap" (medido 2026-10), a ação de formulário funcionou no `<select>` escondido na primeira carga e,
  depois de um reload, só abrindo o botão e clicando na opção pelo elemento. E a mesma ação, num select da
  linha de filtros, trocou também o operador do filtro URL e o "Registros por Página": depois de **qualquer**
  troca, releia `filtrosDaTela()` inteiro (os valores e os operadores dos outros filtros) e o select de
  registros por página antes de confiar na grade. Se o `find` da ferramenta devolver o rótulo ou o botão em
  vez do campo, `rotularParaFerramenta(el, 'nome')` dá a ele um `aria-label` só dele (`__nome`) para o
  `find` achar (medido: serviu para Loja, Nome, URL, Confirmar e OK). O que a ferramenta de navegador faz
  nesses campos (a ação de formulário que muda outros selects da fileira, o seletor com menu que só responde
  ao botão depois de um reload, o `find` que devolve o rótulo): `ferramentas-de-navegador.md`, seção 6.
- **O clique certo é diferente por botão** — `triggerHandler` sozinho no `Alterar`, sequência completa no
  `Confirmar`, clique simples nos itens de menu. Tabela e motivo no passo 1.
- **Duas grades no mesmo DOM não vêm só de clique duplo.** O admin guarda cada tela do menu como **aba
  interna e não a descarta**: ir em `Vitrines` e depois em `Páginas` deixa as **duas** grades no DOM, mesmo
  com `clicarMenu` (clique simples). Medido. Então, ao trocar de seção do menu, recarregue o admin — ou
  escope na grade visível (passo 2), que funciona sem recarregar.
- **O diálogo reabre na aba `Geral`** e **recarrega o campo do que está salvo**. Toda vez que reabrir,
  volte à aba `Configurações` e releia — qualquer edição não gravada foi descartada. (É isso que torna a
  releitura do passo 5 uma prova válida.)

⚠️ **Não clique por coordenada nesta tela.** O screenshot volta **escalado**: **1568 px** contra viewport de
**1707** (fator **1,089**), e o admin costuma estar com **zoom por origem** (`outerWidth` 1536 contra
`innerWidth` 1707). Medido: um clique no checkbox da linha caiu **~24 px** à esquerda e **abriu outra aba
interna, de outro módulo e de outra loja do grupo** (Vitrines). Nada foi alterado — foi sorte; o mesmo
deslocamento perto de `Excluir` não teria sido. **Aja pelo DOM:**

```js
const tr = [...grade.querySelectorAll('tr')].find(t => /NNNNNN/.test(t.textContent));
tr.querySelector('input[type=checkbox]').click();
```

## Limites medidos da ferramenta de navegador

Não são detalhes do admin, são do canal, e cada um já custou um diagnóstico errado. Estão juntos em
`ferramentas-de-navegador.md`: o tempo limite de 45 s por chamada (separe clicar, esperar e conferir), a
saída cortada perto de 1.000 caracteres, o filtro que bloqueia o que parece base64, JWT ou query string
(devolva booleanos e tamanhos), a aba que vem estreita, e como guardar o pacote de funções em
`localStorage` para ele sobreviver a um reload. Leia antes da primeira gravação por script.

### O Ace congela com payload grande, e string vazia mata o campo

- `ace.edit(el).setValue(json)` com **284 KB congela o renderer**: o `Runtime.evaluate` estoura em **45 s**
  e a aba fica sem responder. **Não espelhe no Ace em página grande.** O Ace é só para humano ver, e nem ele
  nem o model do Angular são o que grava no `Blocos:`.
- Setar o campo para `''` faz o campo `Blocos:` **desaparecer** do diálogo — é a condição de "página vazia"
  (`armadilhas.md` item 1d). Saia por `Cancelar` e reabra.

## Formato do campo `Blocos:`

Quatro chaves de topo — **não é o mesmo formato do `syncData`**:

```jsonc
{
  "style": "",           // CSS da página
  "block_list": [ … ],   // as duas raízes: Desktop e Mobile (ver blocos.md)
  "body_class": "",      // classe aplicada no <body>
  "config": {            // flags de header/footer, valores em string
    "header_is_floating": "false", "header_is_floating_mobile": "false",
    "header_top_bar_hide": "false", "header_hide": "false", "footer_hide": "false"
  }
}
```

Se o seu `style` tem `@keyframes` e você gera o JSON por Python, **cuidado com formatação `%`**: numa
string passada por `%`-formatting todo `%` literal sai **dobrado** (`0%%,17.33%%`) e a animação morre sem
erro. Use `.format`/f-string ou dobre de propósito.

## Limitação conhecida: página vazia não abre o campo

**O campo não fica disponível em página do construtor que ainda não tem nada salvo.** Numa página
recém-criada e vazia o rótulo `Blocos:` aparece e **não há campo nenhum** ao lado: ele está atrás de
`<!-- ngIf: configInput.builder -->`.

O contorno `abrirConstrutor()` → `+` → `Box` → `Aplicar` → `Confirmar` **não começa**: sem
`data.config.builder` não há árvore para o construtor editar. (E o botão não está invisível "porque a página
está vazia": ele mora na aba `Geral`, com página cheia também — `armadilhas.md` **1e**.)

O que funciona é destravar o `ng-if` pelo scope, e é seguro pelo próprio motivo de "O que grava é
`data.config.builder`" (atribuir o model por script **não** dispara o `ng-change`, então nada disso vai para
o banco):

```js
const sc = angular.element(dialogoUnico()
  .querySelector('textarea[ng-model="configInput.custom"]')).scope();
sc.configInput.builder = '{"style":"","block_list":[],"body_class":"","config":{}}';
if (!sc.$root.$$phase) sc.$apply();     // agora o campo Blocos: existe
```

Conferido depois de rodar: o campo existe e `data.config.builder` continua com **0 chars**. Daí o fluxo
normal segue igual (o 3a: decodificar em `window.__PAYLOAD` e conferir o sha numa chamada,
`injetar(window.__PAYLOAD)` na seguinte; ou o 3b: `criarCaixaDeCola` → `ctrl+v` → `conferirCola` →
`injetarDaCola`; depois `confirmarGravacao`). Na gravação seguinte da mesma página o campo já existe e
nada disso é necessário. Detalhe em `armadilhas.md` **1d**.

## Antes de colar: valide

Rode o validador que acompanha a skill sobre o JSON gerado. Ele não conserta nada — aponta o que está
errado ou suspeito. Como o campo aceita JSON quebrado sem reclamar, esta é a rede de segurança.

```
python scripts/validar_pagina.py caminho/para/pagina.json [--cor-link '#RRGGBB'] [--base backup.json]
```

Checa as duas raízes, ids únicos de 8 caracteres, a regra do
toggle, campos de esquema legado, o formato do `accordion`, e avisa sobre referências de cadastro vazias e
excesso de bloco `code`. Pega também os quatro defeitos que dá para decidir sem navegador: CSS de página
usando classe do tema sem escopo no miolo, `<script>` em bloco `code`, `margin` em bloco `imagem`, e
`vitrine` em grid sem o campo `grid`. Só entregue depois de sair com "0 erro(s)". Duas exceções: o esqueleto
de duas raízes vazias do passo 3 do `construtor.md` (os dois ERROS de "raiz sem filhos" são esperados nessa
gravação técnica) e a edição pontual numa página que já está no ar, em que você roda com `--base
backup.json` e só os ERROS novos bloqueiam (`construtor.md`, seção 7).

`--cor-link` é a cor do link **medida** na página original com `getComputedStyle` (cada loja tem a sua; o
perfil da loja guarda a que já foi medida). Sem ela, o validador avisa em todo bloco com link, para você
medir: numa loja real, as folhas declaravam uma cor e o computado era outra (a `--primary-color` da loja), e
uma página saiu com o link na cor errada por confiar no arquivo.

Ele **não** cobra `vit_id` de vitrine com `origem: "operation"` (2 das 8 vitrines de uma home real são
`operation: history` e legitimamente não têm) — mas **acusa como erro** vitrine com `origem: "operation"`
**sem** o campo `operation`, que renderiza vazia sem dar erro.

## Injeção por script (automação de dev)

Para colar em muitas páginas sem clicar campo a campo, `scripts/injetar.js` traz uma função por passo deste
arquivo. O mapa, para você não reimplementar nada à mão:

| passo | funções |
|---|---|
| antes de tudo | `definirLoja` (dados do perfil) · `exigirLoja` (as gravações chamam sozinhas) |
| clique | `clicarNg` (abre) · `clicarBotao` / `cliqueComposto` (confirma/atualiza) · `clicarMenu` (menu, clique simples) |
| filtros da tela | `filtrosDaTela` (os filtros visíveis, pelo rótulo; só lê) · `campoDoFiltro('Rótulo')` (o campo daquele rótulo; aborta se não houver exatamente um) · `campoVisivel` (conta o `<select>` escondido de um seletor "bootstrap" visível) · `filtroLojaDoPerfil` (o filtro Loja na loja do perfil, pelo rótulo ou pelo valor e o `lojaNome`) · `rotularParaFerramenta(el, 'nome')` (um `aria-label` `__nome` num elemento só, para o `find` da ferramenta) |
| 1 — abrir | `abrirDialogo` (aborta se não abrir exatamente 1) · `abaDialogo` · `abrirConstrutor` |
| 2 — um diálogo / escopo | `contarDialogos` · `dialogoUnico` · `escopoDoDialogo` · `campoBlocos` · `conferirDialogo` · `lerCampoLoja` · `gradeVisivel` · `conferirAlvo` |
| 3 — transportar | `injetarGzipB64` (decodifica e injeta sem conferir sha: prefira o trecho do 3a) · `criarCaixaDeCola` · `conferirCola` · `conferirSha` · `shaLegivel` · `injetarDaCola` · `criarEntradaArquivo` · `lerEntradaArquivo` |
| escrever | `injetar` · `editarBlocos` · `lerBlocos` · `canonico` (descarta `$$hashKey`) |
| 4 — gravar | `confirmarGravacao` (seis travas antes de clicar; a sexta é o `Confirmar` de dentro do diálogo, `botaoConfirmarDoDialogo`) · `cancelarDialogo` |
| 5 — verificar | `verificarGravou` (exige diálogo reaberto) · `limparCache(#)` (confere a linha) · `clicarOkDoModal(/cache/i)` (o `OK` do modal que ele abriu, e só dele) |
| passo 3 do `construtor.md` | `abrirConstrutor` (troca para a aba `Geral` sozinho) · `lerDefaultVivo('Box')` |
| Arquivo (CSS/JS) | `escopoArquivo` · `conferirArquivoAtual` · `injetarArquivo` · `confirmarArquivo` · `verificarArquivoGravou` · `normalizarTexto` · `shaNormalizado` |
| Arquivo novo e `Publicar` (só com o pedido da pessoa nomeando os botões e a página) | `lerTipoDoArquivo` · `conferirUrlLivre` · `conferirArquivoNovo` · `prepararConfirmarCriacao` · `conferirCriacao` · `prepararPublicar` · `prepararOkDoPublicar` · `conferirPublicada` (conferem e rotulam UM elemento para UM clique real da ferramenta; não clicam) |
| `<head>` da loja | `conferirLojaNaGrade` · `abrirConfiguracoesDaLoja` · `escolherTipoSite` · `lerHead` · `conferirHeadAtual` · `trocarNoHead` · `confirmarConfigLoja` · `fecharConfigLoja` (o `controller.cancelar` pelo select Tipo, ou o `Cancelar` do diálogo; lança se o diálogo continuar visível) · `verificarHeadGravou` |
| outros campos da configuração | `lerCampo` (`abaVisivel: false` quando a subaba do campo não aparece para o usuário; `existe: false` num campo nunca usado ou sem acesso) · `conferirCampoAtual` (aborta se a subaba não aparece: `abaDaChave`, `abaVisivel`, `abasVisiveis`) · `trocarNaConfig` · `verificarCampoGravou` (agenda, Barra do Topo, logo; nenhuma cria chave) |
| cache da configuração | `limparCacheConfigLoja` · `ultimoFlushConfigLoja` (as duas exigem o filtro Loja na loja do perfil e uma linha `loja_config` só; o "Último flush" é indício, e a prova é o HTML servido) |

O roteiro das cinco últimas linhas (Arquivo, Arquivo novo e `Publicar`, `<head>`, outros campos, cache) está
em `gravacao-arquivo-e-head.md`.

As travas de `confirmarGravacao`: loja do perfil e aba no admin dele, um único diálogo, `conferirDialogo()`
rodado nesse diálogo com a loja do perfil, escopo `===` ao que `injetar()` alterou, mesmo nó de diálogo,
mesmo tamanho canônico e o `Confirmar` de dentro do diálogo. `injetar()` escreve o objeto em `data.config.builder`, e o espelho na textarea/Ace é opção
**desligada por padrão** (`{espelhar: true}`), porque em payload grande o Ace congela.

Se a sua cópia não tiver `abrirDialogo`/`dialogoUnico`/`confirmarGravacao`/`verificarGravou`, ela não tem
nenhuma das travas do diálogo morto: atualize, ou execute os passos 1, 2, 4 e 5 à mão pelos trechos deste
arquivo.

## O caminho pelo construtor (alternativo)

Serve para ajustes visuais e para o time de conteúdo. Dentro do construtor:

```
Abrir construtor → editar → Aplicar → fechar → Confirmar
```

**`Aplicar` não salva.** Verificado: zero requisições de rede. Ele serializa o estado do construtor para
`<input name="syncData">`, cujo formato é `{style, block_list, preview}` — note que traz `preview` e não
traz `body_class` nem `config`. Quem grava é `Confirmar`.

O lado bom: `Aplicar` é seguro para experimentar à vontade. Sair sem `Confirmar` deixa a página intacta;
`Cancelar` descarta.

O editor de CSS da página e o campo `Classe no <body>` ficam no ícone `</>` no topo do painel do construtor.
A engrenagem ao lado guarda as flags de header e footer.

**O botão `Computador | Celular` no rodapé do construtor não é preview** — ele alterna qual das duas raízes
você está editando. Ver `blocos.md`.

## Verificação — não é opcional

Não há validação de schema conhecida. O campo aceita JSON malformado e o sintoma aparece só na página. E a
ordem de verificação é a do passo 5: **fonte, `Limpar cache`, e só então a URL** — medir a URL primeiro pode
devolver o passado com bytes idênticos.

**Pré-requisito: a página precisa estar publicada.** Despublicada, a URL responde "Página não mapeada" e o
preview do construtor também — não há como verificar renderizando. Ver `armadilhas.md` item 6b, e combine
a publicação com a pessoa no começo da tarefa, não depois de gravar.

### Passo obrigatório: `scripts/verificar_paridade.py`

```
python scripts/verificar_paridade.py --nova URL --original URL --controle URL \
        --json pagina.json --mobile [--cor-link '#RRGGBB'] [--testar-imagens]
```

Com arquivo local em `--nova`/`--original`, `--mobile` não serve (o script avisa e ignora a opção, em vez
de reler o mesmo arquivo de computador): rode uma vez com os HTML de computador e outra com os de celular
(`construtor.md`, passo 7a).

`--controle` é outra página do **site novo** (mesmo tema, outro `body_class`) — é ela que prova que uma
diferença no header é sua e não do tema. O script existe porque numa migração que "deu certo" **oito
defeitos passaram** pela verificação manual (4 deles a pessoa achou só olhando a tela), e ele pegou os oito
nos artefatos daquela sessão. Ele também imprime um bloco de JS para colar no console **das duas páginas**,
que cobre o que não dá para ver offline. `--cor-link` tem o mesmo papel que no validador.

Duas coisas que o script faz e que mudam como você lê a saída:

- a comparação de texto é por **shingles de 6 palavras** sobre o texto corrido do container, com uma
  métrica de **cobertura em %** ("28,0% do texto da original aparece na nova" foi o número mais revelador
  de uma sessão; virou 100,0% depois da correção). Comparar elementos-folha dava **17 falsos positivos por
  device**, porque twig e React aninham diferente;
- `--nova`, `--original` e `--controle` aceitam **caminho de arquivo local** além de URL, o que permite
  reverificar contra HTML já salvo sem depender da página no ar.

**Rodar o script não basta — os cinco erros de método que deixaram os 8 defeitos passar estão em
`armadilhas.md` item 21, e quatro deles são disciplina sua, não do script.** Em uma linha cada: reexecute a
bateria **inteira** a cada gravação (verificação incremental é cega a regressão), use screenshot para
**fidelidade** e não para presença, trate **anomalia numérica** como achado, e compare as duas páginas
**lado a lado no mesmo ponto de scroll**.

Os passos abaixo continuam valendo — o script não substitui a leitura do `__NEXT_DATA__`.

**1. Depois de `Confirmar` (e de `Limpar cache`), navegue a URL pública e leia:**

```js
const L = window.__NEXT_DATA__.props.pageProps.pageParams.layout;
let n = 0; const tipos = {};
(function w(l) { l.forEach(b => { n++; tipos[b.type] = (tipos[b.type] || 0) + 1;
  if (Array.isArray(b.child)) w(b.child); }); })(L.blockList);
console.log({ blocos: n, tipos, css: L.blockStyle.length, bodyClass: L.blockBodyClass });
```

**Esperado: o front-end entrega cerca de metade do que você gravou.** Num pedido de desktop, a subárvore
`Mobile` é cortada no servidor antes de sair. Se o número vier igual ao que você gravou, alguma coisa está
errada — provavelmente o `device_show` das raízes.

Confirmado de ponta a ponta: gravando **14 blocos** (raiz Desktop + raiz Mobile) pelo campo `Blocos:`, o
front-end de desktop entregou **7** — só a raiz Desktop, e o campo `device_show` sumiu do JSON entregue
depois de consumido. Na mesma prova, blocos `accordion` escritos à mão (fora da paleta) renderizaram e
abriram/fecharam ao clique. Reconfirmado em escala: **234 blocos gravados** (2 raízes) entregaram **119 no
desktop** e **115 no mobile**, com `isSsrMobile` false/true conforme o user-agent.

**Não meça "desktop" numa janela abaixo de 993 px.** O tema novo decide por **viewport**, não por
user-agent: `isMobile = !!width && width <= 992 || isSsrMobile`. Entre 576 e 992 px de largura, a nova e a
original mostram **árvores diferentes** — a original decide no servidor por UA e nunca muda ao
redimensionar. Comparar as duas nessa faixa é inválido.

**Grep no HTML cru não prova que o texto está no DOM.** O `__NEXT_DATA__` carrega a página inteira, então
um `grep` acha texto que não está renderizado — foi assim que as respostas de um FAQ pareceram presentes
quando o `accordion` fechado nem monta o corpo (`armadilhas.md` 18a). Quem mede texto tem de excluir
`<script>`.

**2. `fetch()` não serve para ler página despublicada** — devolve um shell genérico sem `pageParams`, com
tamanho idêntico para páginas diferentes. Navegue a aba de verdade.

**3. Confira o que o nativo deu de graça.** Bloco `imagem` deve renderizar com `loading` e dimensões:

```js
[...document.querySelectorAll('img')].map(i => ({
  lazy: i.hasAttribute('loading'), dim: i.hasAttribute('width') && i.hasAttribute('height')
}));
```

**4. Se mexeu em página que já tinha conteúdo, compare antes e depois.** O backup é o arquivo local do
`Blocos:` (`construtor.md`, seção 0, "Backup do `Blocos:`"); o `window.__BACKUP_BLOCOS` que `injetar()`
guarda some no reload. Sem backup não há como voltar.

**5. Para aparência computada, meça no navegador — arquivo estático subdetermina.** Uma regra pode existir
na página e em nenhuma das folhas que você baixou (`armadilhas.md` item 23), animação **não avança em aba
não pintada** (`currentTime` ficou em 0 depois de 3,6 s — conduza `el.getAnimations()[0].currentTime = N`),
e `opacity:0` inicial pode virar `1` **inline** por JS (item 23a). Uma medição só é instantâneo, e
instantâneo de animação mente.

---

## Cache e publicação

A tela `Páginas` tem `Limpar cache`, que só tem efeito em página publicada. A mecânica do cache, a ordem de
verificação e a perda de seleção estão no **passo 5**; os caches de Arquivo e de configuração da loja, nos
Passos E a G de `gravacao-arquivo-e-head.md`.

**Página despublicada não responde com conteúdo** — devolve "Página não mapeada - @todo: 404" e
`pageParams` vazio, e o preview do construtor mostra o mesmo (medido com par de controle; `armadilhas.md`
item 6b). Na prática: **verificar renderizando exige a página publicada**, então combine isso com a pessoa no
início da tarefa, não depois de gravar.

Antes de suspeitar da gravação, **prove de que lado está o problema** — é o passo 5: reabra o diálogo e leia
`data.config.builder`. Se o conteúdo novo está lá, gravou; o resto é cache ou cascata (o roteiro
inteiro do "mudei e não aparece" está em `mapa-do-admin.md`, seção 13).

Antes de publicar qualquer rascunho, confira na grade as colunas **`Robots`** (deve ser `noindex,
nofollow`) e **`Página no Sitemap`** (deve ser `Não`). Quem clica em `Publicar` é a pessoa; por script, só
com o pedido dela nomeando o botão e a página (`gravacao-arquivo-e-head.md`, "Publicar, quando a pessoa
pede"). **Não existe header `x-robots-tag` no subdomínio de
preview** — medido. Ver `armadilhas.md` item 7.

## Higiene ao trabalhar em produção

- experimente na página de teste que a pessoa indicar; criar ou publicar uma página só com pedido dela;
- `Aplicar` é seguro. `Confirmar`, `Publicar`, `Despublicar` e `Excluir` gravam;
- antes de mexer em página do fluxo de alguém, pergunte: não há trava nem aviso de edição concorrente — e na
  configuração da loja isso vale em dobro (`gravacao-arquivo-e-head.md`, Passo F);
- clonar uma página gera novo id de página mas copia os ids de bloco intactos, e é um bom jeito de a pessoa
  criar uma bancada a partir de algo real. Clonar é criar página: só a pessoa faz, ou pede com essas palavras;
- e a regra que atravessa todo este arquivo: **toda checagem é asserção que aborta.** Nenhum dos erros de
  gravação dá erro, então um `console.warn` que ninguém lê é indistinguível de sucesso.
