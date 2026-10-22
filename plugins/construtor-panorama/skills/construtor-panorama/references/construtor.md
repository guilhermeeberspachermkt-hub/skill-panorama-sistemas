# Páginas no construtor da Panorama: o fluxo completo

Como montar, migrar, editar ou reconstruir uma página no construtor de páginas da Panorama Sistemas, do
primeiro HTML lido até a verificação depois de gravar. Os outros arquivos da skill citam as regras e os
passos daqui pelo número ("regra 2", "passo 7b"): mantenha a numeração.

Tudo aqui foi aprendido em lojas reais da plataforma, a maior parte migrando páginas do site antigo (tema
em twig) para o front-end novo (React/Next), em agosto de 2026. Os números (blocos, caracteres, pixels,
tempos) são medições e foram mantidos. Os identificadores da loja medida não estão aqui: nos exemplos,
`#NNNNNN` é o `#` de uma página, `loja N` é o número da loja, `www.SUA-LOJA.com.br` é o site,
`novo.SUA-LOJA.com.br` é o endereço do front-end novo (o host varia por loja; numa loja que só tem um
front-end, ele não existe) e `.SEU-BODY-CLASS` é a classe do `<body>` da sua página. Os valores da sua loja
estão no perfil dela, em `~/.claude/panorama-lojas/<slug-da-loja>.md`.

Se a sua loja só tem um front-end, o reconhecimento (`reconhecimento-da-loja.md`, passo 2c) diz qual. As
partes sobre migração twig → React valem só para quem migra; o formato do JSON, as duas raízes, as quatro
regras e a verificação valem para qualquer página do construtor.

A regra zero do `SKILL.md` (em qual página gravar, backup, nunca `Excluir`/`Publicar` sem pedido) vale
inteira aqui. Esta página trata do que é próprio do construtor.

## Sumário

0. Confirme o alvo antes de gravar, por script (e o backup do `Blocos:`)
1. O que você está construindo
2. A página é escrita duas vezes: Desktop e Mobile
3. Quatro regras que evitam os erros mais caros
4. Fluxo de trabalho, em nove passos
5. A paleta não é o contrato
6. Duas trilhas, dois públicos
7. Edição pontual numa página que já está no ar

---

## 0. Confirme o alvo antes de gravar, por script

Trabalhe só nas páginas que a pessoa nomeou, e trate a lista como fechada:

- **Página original = somente leitura** (numa migração; numa edição pontual, seção 7). Você vai abri-la para
  ler a estrutura e o CSS (campo `Blocos:`). Pode abrir, e saia por `Cancelar`: `Confirmar` grava mesmo
  quando você acha que não mudou nada. Ela só recebe a versão nova no passo 9, depois do "aprovado" e pelo
  caminho que a pessoa escolher.
- **Grave só na página de rascunho designada.** Se ela não existir, peça uma (quem cria é a pessoa: seção 4,
  primeiro combinado); não promova outra página a cobaia, nem uma que "parece de teste" pelo nome.

Os dois acidentes plausíveis aqui não dão erro, gravam calados na página errada:

1. **Mais de uma linha selecionada.** O checkbox do cabeçalho marca tudo, e a seleção sobrevive à troca
   de filtro. `Alterar` (e `Excluir`) atuam sobre o conjunto. Conte as linhas marcadas pelo DOM
   (`conferirAlvo`). Num admin, o rodapé mostra `Registro(s) Selecionado(s): N`, e é o canário; noutro
   (medido 2026-10), sem linha marcada, ele diz só `Registro(s): N`, e a contagem do DOM é a única.
2. **A página certa, da loja errada.** Num admin com várias lojas, nomes de página se repetem entre elas.
   Ir pelo nome, sem conferir a loja, escreve no site errado.

Por isso `scripts/injetar.js` traz travas que abortam em vez de deixar passar. Abaixo está o **mapa** da
gravação, não a receita: a receita, com o clique certo de cada botão e o transporte de payload grande, está
no passo 6 e em `gravacao-construtor.md`.

```js
// Troque pelos valores da SUA tarefa e do perfil da loja. Nunca reaproveite números de exemplo.
definirLoja({ loja: N, hostAdmin: 'admin.SUA-LOJA.com.br', dominio: 'www.SUA-LOJA.com.br' });
const ALVO = 0;            // o # da página de rascunho, exatamente como está na coluna "#"
const SLUG = 'slug-dela';  // o slug dessa mesma página
const SHA_DO_BACKUP = '';  // o sha do backup local desta página, sem os espaços (logo abaixo)

conferirAlvo(ALVO);              // 1 linha marcada na grade visível, e é este #
await abrirDialogo('Alterar');   // só triggerHandler; aborta se não abrir exatamente 1 diálogo
abaDialogo(/Configura/i);        // clicarBotao não troca a aba (ver injetar.js)
conferirDialogo(SLUG);           // o diálogo é desta página, e o campo Loja dele é a loja definida acima
await conferirSha(undefined, SHA_DO_BACKUP);  // confere: true = o admin ainda tem o que você salvou
injetar(meuJson);                // window.__BACKUP_BLOCOS é só desta aba: o reload apaga
confirmarGravacao();             // sequência completa + travas de loja e de escopo
await verificarGravou(sha);      // na fonte, com o diálogo reaberto
```

`definirLoja` vem primeiro e vale até o próximo `location.reload()`: sem ela, `conferirDialogo` e
`confirmarGravacao` abortam de propósito. A loja é conferida no campo Loja do diálogo `Alterar`; se
`conferirDialogo` pedir para mapear esse campo, rode o snippet F de `reconhecimento-da-loja.md` e passe o
`ng-model` em `definirLoja({..., campoLoja})`. Medido numa loja da plataforma (2026-10-20, só leitura): no
`Alterar Página` de uma página Construtor e de uma página Arquivo há um único campo com "loj" no `ng-model`,
o `data.loja`, uma `DIV` (select próprio, sem `value` e com texto vazio) cujo model é um objeto com `id` (o
número da loja, o mesmo do filtro Loja), `nome` (o nome da loja como no admin), `url` e `icon`. O
`lerCampoLoja` lê o número e o nome desse objeto, e o `conferirDialogo` passa pelo número. Confira na sua.

⚠️ **`verificarGravou` devolve `confere: false` mesmo quando gravou certo.** O servidor normaliza tipos ao
gravar (`false` → `"false"`, `null` → `"null"`, `child: []` desaparece), então o sha nunca bate depois do
round-trip. Prove por conteúdo: contagem de blocos, raízes, `device_show`, tamanho do `style` e um marcador
da versão nova. `armadilhas.md` **27**.

⚠️ **`injetar(meuJson)` só serve para JSON pequeno.** O payload de uma home real teve **293.469 chars** e
não cabe numa chamada de console. O transporte preferido é **gzip+base64 numa única chamada** (medido:
65.241 chars de JSON viraram **4.888** de base64, com o sha conferido dentro da página, de primeira).
Decodifique guardando em `window.__PAYLOAD` numa chamada e chame `injetar` na seguinte. O caminho do
clipboard (`criarCaixaDeCola()` → `ctrl+v` pela ação `key` → `await conferirCola(sha)` → `await
injetarDaCola()`) continua documentado e já levou 293 KB sem corrupção, mas na mesma sessão devolveu 0 chars
duas vezes com o foco provado: duas tentativas e troque de caminho, em vez de caçar o foco. Nos dois casos,
**uma chamada por passo**: clique, espera e conferência juntos estouram os 45 s do CDP e você fica sem saber
onde parou. Detalhe em `gravacao-construtor.md`, passo 3.

⚠️ **Não exija "uma única `<table>` no documento".** Com abas internas abertas há várias `<table>`, e a de
Páginas pode ser a invisível; essa trava, numa versão anterior, abortava a gravação certa. Escope sempre na
grade **visível**: é o que `gradeVisivel()` faz, e todas as travas de `injetar.js` já usam. O canário de
seleção viva em outra aba é o rodapé `Registro(s) Selecionado(s): N`, onde o admin o mostra, e `conferirAlvo`
já lê (noutro admin o rodapé diz só `Registro(s): N`, e vale a contagem do DOM). Para o menu
use `clicarMenu()` (clique simples: o composto abre aba interna duplicada); para os botões, a função depende
do botão: `abrirDialogo()`/`clicarNg()` para o que **abre**, `clicarBotao()`/`confirmarGravacao()` para o
que **confirma** (`gravacao-construtor.md`, passo 1).

Se uma trava abortar, não contorne: releia qual página está selecionada. O aborto é o sistema funcionando.
Se a tela mostra que a condição da trava é verdadeira (a trava leu errado), também pare e mostre a evidência
à pessoa; o que fazer depois está no `SKILL.md`, regra zero, e em `armadilhas.md` 34. Nunca em silêncio.

Identifique a página pelo **`#`** (a coluna numérica), não pelo nome: é o único identificador que não se
repete. A busca por URL, aliás, não acha slug com hífen (ver `gravacao-construtor.md`).

### Backup do `Blocos:` num arquivo local, e a comparação antes de gravar

Antes de sobrescrever qualquer coisa, guarde o conteúdo atual do campo `Blocos:` num arquivo local: o admin
não guarda versões anteriores, e sem backup não há como voltar. O `window.__BACKUP_BLOCOS` que `injetar()`
guarda **não é backup**: ele é tirado na hora de escrever, e o `location.reload()` da verificação o apaga. E a
saída da ferramenta de navegador é cortada perto de 1.000 caracteres (`ferramentas-de-navegador.md`), então
o campo não sai inteiro numa leitura só. A receita:

1. **Leia e anote o sha.** Diálogo recém-aberto da página, aba `Configurações`, nada escrito:

   ```js
   window.__ANTES = lerBlocos();
   ({ chars: __ANTES.length, pedacos: Math.ceil(__ANTES.length / 400), sha: (await conferirSha()).sha })
   ```

   O sha vem em grupos de 8, por causa do filtro de saída; anote-o.
2. **Página pequena** (até umas dezenas de pedaços): rode o primeiro bloco do snippet E de
   `reconhecimento-da-loja.md` (ele define `fatiaExata` e `confereSha`) e copie com `fatiaExata(__ANTES, 0)`,
   `fatiaExata(__ANTES, 1)`…, uma chamada por pedaço. Junte no terminal com o passo 3 do snippet E e salve
   como `blocos-<#>-ANTES-AAAA-MM-DD.json` na pasta de backups do perfil. O sha que o terminal imprime tem de
   ser o do item 1, e `await confereSha(__ANTES, '<sha impresso no terminal>')` tem de dar `true`.
3. **Página grande:** peça à pessoa para clicar no campo `Blocos:`, apertar Ctrl+A e Ctrl+C, colar num
   arquivo de texto e salvar na pasta de backups (ou colar para você salvar). Ela sai por `Cancelar`. Esse
   texto é o que o campo mostra, não o canônico: confira por conteúdo (raízes, contagem de blocos, tamanho do
   `style`) e guarde o sha do item 1 junto, no histórico do perfil.
4. **Logo antes de `injetar`, compare.** Num diálogo aberto agora (o diálogo carrega o que está salvo só na
   abertura; se o seu está aberto desde a leitura, saia por `Cancelar`, recarregue o admin e reabra, porque o
   diálogo velho pode ficar no DOM):
   `await conferirSha(undefined, '<sha do item 1, sem os espaços>')` tem de dar `confere: true`. Se der
   `false`, alguém mexeu na página depois da sua leitura (o admin não avisa edição concorrente,
   `armadilhas.md` 8): não grave, compare com o backup para ver o que mudou, conte à pessoa e refaça a versão
   nova a partir do conteúdo atual.

A comparação não atrapalha a gravação: `conferirSha()` sem texto só lê o que está salvo, e `injetar()` zera o
sha que ela guarda. No rascunho, entre uma gravação sua e a seguinte, o backup é o JSON local que você gravou
da última vez (o servidor normaliza tipos ao gravar, `armadilhas.md` 27, então compare por conteúdo); os itens
1 e 4 valem a cada gravação. Rascunho vazio não tem o que guardar: anote "vazio" no histórico do perfil.

---

## 1. O que você está construindo

Uma página nesse sistema **não é um arquivo de código**. É um documento JSON, uma árvore de blocos, que o
front-end novo (Next.js) recebe via `getServerSideProps` na rota catch-all `/[...slug]` e renderiza
mapeando cada `type` de bloco para um componente React. Você não escreve JSX nem HTML: **descreve a página
como dados**, escolhendo blocos do catálogo e configurando-os. Por baixo, o construtor é um editor visual
de flexbox mais um punhado de componentes de domínio (vitrine, banner, menu, newsletter).

O site antigo, em twig, tem o mesmo conceito de blocos e o mesmo formato de id, e emite cada bloco com
**`id="block-…"`**. Então dá para reconstruir a árvore de qualquer página antiga lendo o HTML renderizado,
sem precisar de acesso ao código da plataforma.

⭐ **E os dois sites não são dois mundos: o registro de página é o mesmo, e os dois front-ends o
renderizam.** Medido numa loja que tinha os dois (agosto de 2026): o endereço do front-end novo
(`novo.SUA-LOJA.com.br/<slug>`) respondeu **200 com `__NEXT_DATA__`** para uma página institucional que
ainda **não** tinha sido migrada, entregando os 15 blocos e as 3 raízes dela. Duas consequências que mudam
o planejamento:

- **A página antiga já está no ar no tema novo, e mal**: sem raiz Mobile, com o CSS de página morto (o
  SCSS do passo 1) e com a tipografia deformada pelo `body` de 16px. Migrar é **substituir** algo que já
  responde, não criar algo que falta; o risco de adiar é maior do que parece.
- **Isso dá um par de comparação de graça:** busque o slug antigo no endereço novo e veja exatamente o que
  a migração precisa consertar, sem gravar nada.

⚠️ E depois de publicada, **a sua página `-v2` responde nos dois hosts** (medido: o `www` serviu por twig e
o `novo` por React). Rascunho publicado está acessível em produção; quem protege é a coluna `Robots` do
cadastro, não o subdomínio. `armadilhas.md` **30** e **7**.

⚠️ O marcador de bloco no HTML antigo é o **`id`**, não a classe `builder-block`: ler pela classe perdeu 30
dos 70 blocos de uma home antiga. Seletor e números no passo 1.

## 2. A página é escrita duas vezes: Desktop e Mobile

O `block_list` de uma página **não** é uma lista de seções. São **duas raízes**, cada uma um `block`
envolvendo a página inteira. Ignorar isso produz páginas que não funcionam como as outras:

```jsonc
[
  { "type": "block", "id": "…", "name": "Desktop", "device_show": "desktop", "child": [ /* a página */ ], "config": { … } },
  { "type": "block", "id": "…", "name": "Mobile",  "device_show": "mobile",  "child": [ /* a página */ ], "config": { … } }
]
```

**O `device_show` corta no servidor**, verificado por teste controlado no front-end novo. Uma página gravada
com 14 blocos (raiz Desktop + raiz Mobile) foi entregue com 7 num pedido de desktop: a subárvore Mobile
inteira não saiu do servidor, e o campo `device_show` desapareceu do JSON entregue depois de consumido. (O
mesmo padrão numa página real de produção: 208 blocos no admin, 105 entregues.) É por isso que `pageProps`
traz `isssrmobile`.

Consequências para o que você gera:

- **Gere as duas raízes.** Só a Desktop significa que quem entra pelo celular não vê nada, ou vê o layout
  errado. As duas árvores não precisam ser iguais, e essa é justamente a vantagem: no celular a ordem pode
  mudar, seções podem sair, imagens podem ser outras.
- **No construtor, o botão `Computador | Celular` no rodapé não é preview**: ele alterna qual das duas
  raízes está sendo editada. Quem não sabe disso edita o Desktop e acha que terminou.
- Dentro de cada raiz você ainda pode usar `device_show` em blocos individuais, mas raramente precisa.

⚠️ **As páginas antigas não estão nesse formato: migrar é reconstruir, não traduzir.** Lido de uma home
antiga: `block_list` com **14 seções no topo**, cada uma com seu próprio `device_show` misturando
`desktop`, `mobile`, `both` e `hidden`. Não há raiz Desktop nem raiz Mobile. Então a árvore da origem
**não mapeia 1:1** para o destino: você lê as seções, decide quais vão para cada raiz e monta as duas do
zero. Quem espera copiar a estrutura e só trocar campos descobre isso no meio da montagem.

## 3. Quatro regras que evitam os erros mais caros

Estas quatro vêm de erros observados na prática, não de preferência estética. Vale entender o motivo de
cada uma, porque isso permite decidir bem nos casos que a skill não previu.

### Regra 1. Não copie o JSON de uma página existente como molde

É o movimento mais natural do mundo e é a principal fonte de páginas quebradas: **o schema mudou**. As
páginas migradas em 2025/2026 (as `-v2` meio migradas, numa loja medida) foram escritas sobre campos
anteriores:

| Conceito | Construtor **hoje** | Páginas legadas |
|---|---|---|
| slider ou grid | `display_mode: "slider"` | `use_slider` + `use_grid` |
| itens por slide | `owl: {desktop, mobile}` | `itemsPerSlide` |
| referência de vitrine | `vitrine: {vit_id, vit_codigo, vit_nome}` | — ⚠️ ver o aviso abaixo |
| itens do banner | `banner_tipo: {id, nome}` | `bannerlist: [ … ]` |
| mídia da imagem | `midia: {id, nomeArquivo}` | `midia: "<url em string>"` |
| posicionamento | `place: "top: 0px; left: 0px;"` | `place: "top left"` |
| visibilidade por device | `device_show` | não usado, substituído por CSS |

⚠️ **`vitrine: {code, id}` não é formato legado: é o formato de saída de hoje.** Verificado gravando
`{vit_id:"NNNN", vit_codigo:"codigo-da-vitrine", vit_nome:"Nome da vitrine"}` e recebendo
`{code:"codigo-da-vitrine", id:NNNN}` com a prateleira cheia. Ou seja: ver `{code,id}` numa página no ar
não é sinal de que ela precise ser remigrada, e escrever `{code,id}` à mão não é o schema atual. E o campo
que faz a prateleira carregar é o **`vit_codigo`** (o componente busca por `vitrine.code`), não o
`vit_id`: grave sempre os três. Detalhe em `blocos.md`, seção `vitrine`.

⚠️ **"Páginas legadas" aqui são as `-v2` meio migradas, não as originais em twig.** A distinção importa e é
fácil errar: lida de uma home antiga, a origem em twig guarda `vitrine: {vit_id, vit_codigo, vit_nome, …}`
e `banner_tipo: {id, codigo, nome, …}` (os nomes **atuais**), enquanto usa `modelo`/`use_slider` no lugar
de `display_mode`. Ou seja, a deriva é por campo, não por página. Copiar a **referência de cadastro** da
origem em twig é seguro e recomendado (`armadilhas.md` item 4); copiar a **configuração de slider/grid**
dela, não.

Use as páginas existentes para entender **o que** a página faz: quais seções tem, em que ordem, qual o
conteúdo. Nunca para descobrir **como** escrever o JSON: isso vem de `blocos.md`, extraído dos defaults que
o construtor gera hoje. Sintoma de ter caído nessa: o JSON parece certo, o construtor aceita, e a página
renderiza errado ou ignora configurações. A saída tentadora aí é desistir do nativo e jogar HTML num bloco
`code`, o que troca um problema pequeno por um permanente. Volte ao catálogo.

### Regra 2. Prefira o bloco nativo, e saiba por quê

Existe uma hierarquia, e ela tem justificativa medida.

**Nível 1: configuração de bloco.** Layout, espaçamento, alinhamento, direção, posição, overflow, fundo e
visibilidade por device **são configuração**, não CSS. A seção `LAYOUT` do painel cobre tudo isso;
`device_show` cobre device. Escrever classe CSS para fazer o que um controle já faz custa bytes em toda
visita (ver nível 2) e some da interface: quem edita depois não vê nada no painel.

**Exceção que não é violação: largura de página e grid de colunas.** Aqui a config nativa não "decepciona",
ela **não funciona**. O renderizador impõe `width`/`max-width: 1320px` em todo bloco e **ignora
`dimensions.width`** (medido). Use as **utilidades do tema** (`class: "container-fluid"`, `"container"`,
`"row"`, `"col-sm-*"`): elas vêm do tema, carregadas uma vez, e não viram CSS de página. Quatro cuidados
que derrubam a primeira tentativa:

- bloco com `class:"row"` precisa de `display.type:"flex"` explícito;
- **a `.row` do tema sai 24px estreita**, porque a classe gerada por bloco aplica `max-width:100%` e isso
  mata a margem negativa dela. Há **três** receitas medidas em `blocos.md` (seção de grid), e escolher
  errado custa 5px por coluna. **Se a página é texto em coluna única (institucional, política, prazos), a
  terceira dispensa o bloco `row` inteiro** e fecha em 0px com uma regra de CSS: o tema novo é Bootstrap 5,
  onde o gutter da coluna vem de `.row > *` e não da classe `col-*`, então sem `row` o `padding` do
  `.container` **é** o gutter. Medido numa `/politica-de-privacidade`: 39 blocos contra 60 da estrutura de
  5 níveis, desvio **0px em 6 seções**;
- `padding` de bloco **substitui** o do tema em vez de somar: numa `col-sm-*` dentro de `.row`, preencher só
  `top`/`bottom` apaga os 12px laterais, que vêm de `.row > *`, não da classe da coluna;
- `padding` é **ignorado** em bloco `editor` (ponha na coluna que envolve o texto), e `editor`/`code`
  precisam de `display.type:"block"`: no `flex` do default cada `<h2>` e `<p>` vira item lado a lado.

Larguras e tabela em `blocos.md`; o porquê em `armadilhas.md` item 13. Isso não contradiz o nível 2: o que
ele condena é *inventar* classe e escrever o CSS dela na página.

**Nível 2: `Classe CSS` mais CSS no tema.** E quando você escrever CSS de página, leia a **regra 4**
antes: ele não fica confinado ao miolo, e foi assim que uma migração quebrou o cabeçalho do site inteiro. O
CSS de página (`style` no `syncData`) viaja **duas vezes** em cada resposta do front-end novo: uma na tag
`<style>` e outra dentro do `__NEXT_DATA__`, que carrega a definição da página inteira para o navegador.
CSS recorrente (grid, colunas, utilitários de device, reset, tipografia) não pertence à página; pertence ao
tema, uma vez. Se cada página carregar sua cópia, o site termina com dezenas de réplicas livres para
divergir. Onde pôr CSS que vale para várias páginas está em `ajustes-visuais.md`, seção 2.

**Nível 3: bloco `code`, como exceção justificada.** Legítimo quando não existe componente para o efeito
(contador, layout promocional único), ou quando reproduzir com config nativa seria desproporcional. Não é
proibido: é a escotilha de emergência.

⚠️ **Exceção medida, e é grande: no FAQ o bloco nativo perde o texto.** O `accordion` fechado não tem corpo
no DOM: o componente faz `o ? jsx("div",{children:t}) : null`, e `o` começa em `config.expand`. Então só
existem dois estados: sem `expand`, fechado e **fora do HTML**; com `expand:true`, no HTML mas **aberto**. O
que a original fazia (fechado **e** no HTML) é impossível, e não há saída por CSS: colapsar o corpo com
`expand:true` faz o 1º clique pôr `o=false` e **desmontar**. Medido numa home: 8 perguntas renderizavam, 8
respostas (9 `<p>`, 2.192 chars) não; o miolo ficou com **175 palavras contra 513** da original, **28%** de
cobertura de texto. Trocado por `<details>/<summary>` dentro de bloco `editor` (que faz
`dangerouslySetInnerHTML` de `config.code`), foi a **100%**, e o admin **não sanitiza** essas tags
(conferido no HTML entregue: 8 de cada, nos dois devices). O prejuízo do nativo é de DOM e indexação, não
visual: na carga as duas aparecem fechadas. Mecanismo em `armadilhas.md` 18a.

⚠️ **`flexBehavior` é ignorado em bloco `code`** (mais um caso de config que o renderizador descarta,
`armadilhas.md` 13): mesmo com `enable:true` e `flex_grow:1` o wrapper sai com `flex-grow: 0`, e com o pai em
`flex; justify-content:center` uma faixa de tags deu **757px** num container de **1200** (itens de 174 em vez
de 280). A correção é no **pai**, que passa a `display:block`: aí a faixa dá **1180** e os itens **280**, os
números da original. Ver `armadilhas.md` 22f.

O ganho do nativo é medido, numa home `-v2`, mesma página e mesmo renderizador: `<img>` dentro de bloco
`code` sai **0 de 8** com `loading="lazy"` e **0 de 8** com `width`+`height`. O bloco `imagem` sai com lazy
sempre, mas **só ganha `width`/`height` com `use_custom_size: true`** e `width`/`height` preenchidos (medidos
na original); aí o servidor resolve a mídia para a variante naquele tamanho. Numa página com 85 imagens, lazy
é a maior alavanca de performance disponível, e as dimensões evitam layout shift (Core Web Vitals). HTML cru
não recebe nenhum dos dois.

⚠️ **Isto é do bloco `imagem`, não do `banner`:** o componente de banner **nunca passa `loading`** (medido:
**0 de 4** slides, nos dois devices). O que o banner tem contra layout shift é `apply_aspect_ratio: true`
**mais** `width`/`height` numéricos, que emitem `aspect-ratio:W/H` em cada slide, e um `alt` de verdade,
tirado do cadastro, que o `imagem` não tem (ele crava o id do bloco). Ver `blocos.md`, seção banner.

O ganho é **decisivo** onde o componente encapsula comportamento que não se reproduz à mão (`vitrine`,
`banner`, `newsletter`, `menu`, `video`, `storerating`, `modal`) e **marginal** em invólucro fino como
`imagem` e `editor`. Ainda assim prefira: o marginal aqui é justamente lazy loading e dimensões.

Quando um bloco `code` sobreviver à decisão, **preencha `name` explicando por que ele é `code` e não
nativo**. O campo existe e é grátis. Sem isso, seis meses depois ninguém sabe se foi decisão técnica ou
pressa.

### Regra 3. Valor sem toggle ligado não faz nada

Vários grupos de config são governados por um interruptor: `padding.apply`, `margin.apply`,
`spacing.enable`, `background.enable`, `dimensions.enable`, `customize_borders.enable`,
`flexBehavior.enable`.

Quando o interruptor está `false`, os valores continuam no JSON e **são ignorados na renderização**.
Preencher `margin.top: "60px"` sem ligar `margin.apply` produz um JSON que parece perfeito e não faz nada, e
o bug é difícil de ver porque não há erro, só ausência de efeito. Ligue o toggle sempre que preencher o
grupo.

### Regra 4. O CSS de página alcança o tema: escope no miolo

O `body_class` da página fica no **`<body>`**. Então **toda** regra do campo `style` vale para cabeçalho,
rodapé e elementos flutuantes, não só para o que você montou. Isso não é teoria: foi o defeito mais grave de
uma migração real.

A regra escrita foi `.SEU-BODY-CLASS .pano-link-anchor{display:block;width:100%}`, para esticar **duas**
imagens do miolo. Medido contra uma página de controle do mesmo site novo, o efeito colateral: logo do
cabeçalho **945x313** em vez de 180x60, `<header>` com **418px** em vez de 144, logo do rodapé ~248px em vez
de 160, e o botão flutuante de WhatsApp virou barra verde de 100vw em vez de pílula 132x36.

Por que tão longe do alvo: das **127** `.pano-link-anchor` da página, **96 estavam no `<header>`**, 13 no
`<footer>`, **1 no botão flutuante** (que fica fora dos dois, irmão depois do `</footer>`: não basta olhar
header e footer) e só 17 no miolo.

**Escope no container do miolo do tema**, que contém as 17 e não contém header, rodapé nem flutuantes:

```css
.SEU-BODY-CLASS #layout-main-content .pano-link-anchor { … }
```

⚠️ Escopar só nas classes criadas pela loja (no caso medido, `.meia-promo` e `.moldura-categoria`) **conserta o
tema e deixa o trabalho incompleto**: pegou 10 das 17 âncoras do miolo. `#layout-main-content` pega as 17.

O que vaza é regra que usa **classe do tema** (`pano-*`, `swiper-*`, `btn-*`). `.container` e `.row`
tiveram **0 ocorrências** em header e footer: na loja medida (front-end novo, 2026-08), essas duas eram
seguras; noutra loja ou num tema personalizado, conte antes ou escope em `#layout-main-content`, que é de
graça. O mesmo vale para
seletor de tag (`td`, `p`, `a`): a tag pode existir no cabeçalho ou no rodapé, e o validador só cobra escopo
de regra com classe do tema.

**Técnica de prova, e ela é barata:** baixe outra página do site novo como controle e compare o recorte do
`<header>`. Na migração medida os dois recortes eram byte a byte idênticos (28.127 chars, mesmo SHA1) e o
`<footer>` idêntico a menos de 2 tokens `data-cfemail`; logo a única variável era o `style` da página.
`scripts/verificar_paridade.py --controle …` automatiza isso, conta as âncoras afetadas e já sugere o
seletor escopado. Ele compara **estrutura** (árvore de tags/classes + conjunto de `href`), não bytes: nonce,
link ativo e hash de styled-components mudam legitimamente por página.

⚠️ **Baixe o controle com o mesmo device da sua página.** O `<header>` mobile do tema tem **~23 tags**
contra **~259** do desktop, e comparar cruzado acusa vazamento onde não há (`armadilhas.md` 0).

Detalhe de cada bloco em `blocos.md`; o mecanismo e os casos vizinhos em `armadilhas.md`.

---

## 4. Fluxo de trabalho, em nove passos

Os passos 1 a 7 montam e conferem a página no rascunho; o 8 é a aprovação da pessoa sobre o rascunho, e o 9
leva a versão aprovada para a página real. Para uma mudança pequena numa página que já está no ar (duas
perguntas a mais no FAQ, um texto trocado), o caminho curto é a seção 7.

⚠️ **Combine três coisas com a pessoa antes de começar**, porque as três travam a entrega no fim:

1. **Em qual página gravar** (o `#`), como diz a regra zero. Se a loja não tem rascunho, quem cria é a
   pessoa (o clique composto em `Incluir` já criou página em dobro, `mapa-do-admin.md`, seção 12). Em
   cliques: Loja On-line › Páginas › `Incluir` › Loja = a do perfil (confira no diálogo: o padrão pode ser
   outra loja); Nome = "<nome da original> - rascunho"; URL = "/<url-da-original>-v2"; Tipo =
   **Construtor**; Robots = `noindex, nofollow` e Página no Sitemap = Não (a tela não foi mapeada campo a
   campo: se ela não achar esses campos, peça que diga o que aparece) › `Confirmar` **uma vez**. Ela confere
   na grade que nasceu **uma** linha e diz o `#` (se nasceram duas, pare e siga `mapa-do-admin.md`, seção
   12: qual fica é decisão dela). Outra saída é ela clonar a original: o clone nasce com URL
   `<slug>-log-<número>` e `noindex, nofollow` (`armadilhas.md` 10b), e com o conteúdo da original. O
   rascunho criado por `Incluir` nasce vazio, e vazio pede um esqueleto antes do default vivo (passo 3).
2. **Autorização para publicar esse rascunho.** Página despublicada responde **404** na URL pública e no
   preview do construtor (medido, `armadilhas.md` 6b), então **sem publicar não há verificação nenhuma**, e
   verificar é o passo 7. Publicar está na lista do que só se faz com pedido explícito, então tem de ser
   pedido, e o momento certo de pedir é agora, não depois de gravar. Leve os fatos: publicar afeta só o
   domínio do campo `URL:` da página; confira antes as colunas `Robots` e `Página no Sitemap`. Muitas vezes
   quem publica é a própria pessoa.
3. **Qual página serve de controle.** O passo 7 não roda sem ela: é o que separa "o tema é assim" de "eu
   quebrei o tema" (regra 4). Peça uma que já esteja publicada e que **você não vai tocar**. Se o perfil da
   loja já tem uma página de controle anotada, confirme que ela continua publicada.

Baixe os HTML **agora**, antes de montar qualquer coisa, e trabalhe sobre os arquivos: a original e a de
controle, cada uma no computador e no celular (User-Agent de iPhone). O verificador aceita caminho local,
então reverificar depois não depende da rede nem do cache de ~100 s.

```bash
# Bash. No PowerShell use `curl.exe`: lá, `curl` é apelido do Invoke-WebRequest e o `>` grava objeto.
IPHONE="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
U=https://www.SUA-LOJA.com.br/pagina-original
C=https://novo.SUA-LOJA.com.br/pagina-de-controle   # do site novo (loja com um front-end só: do site)
curl -s "$U" > orig-desktop.html
curl -s -A "$IPHONE" "$U" > orig-mobile.html
curl -s "$C" > controle-desktop.html
curl -s -A "$IPHONE" "$C" > controle-mobile.html
```

### Passo 1. Entenda a página alvo antes de abrir o catálogo

Se existe uma versão antiga, leia a estrutura dela pelo HTML renderizado. Um trecho de JavaScript no
console resolve; há um pronto em `exemplo.md`. Se não existe versão antiga, comece pelo conteúdo e pelas
seções, não pelos blocos.

⚠️ O seletor é **`#area-body [id^=block-]`, não `.builder-block`**. Medido numa home antiga: **40**
`.builder-block` contra **70** `[id^=block-]`. Blocos `code`, `imagem`, `vitrine` **e `editor`** não
recebem essa classe (recebem `block-imagem-container`, `block-vitrine-container`, ou classe nenhuma). Ler
pela classe perde **30 blocos**, e numa migração real perdeu uma faixa inteira. O **nível** de cada bloco
vem de contar ancestrais com `id` começando em `block-`, não de classe.

⚠️ Por causa do `editor`, o seletor errado perde blocos até em página só de texto: numa
`/politica-de-privacidade`, sem nenhum `code`/`imagem`/`vitrine`, `.builder-block` deu **24** contra **30**;
os 6 que faltavam eram exatamente os 6 `editor`. Numa `/troca-ou-devolucao`, **12 contra 15**, pelo mesmo
motivo.

⚠️⭐ **Antes de confiar na árvore que você leu, cheque se a origem tem tag mal fechada, e saiba que o
BeautifulSoup e o navegador vão dar árvores diferentes se tiver.** Numa `/troca-ou-devolucao` havia um
`</strongs>` (com S): o `bs4` fecha a tag na fronteira do bloco e reporta as 3 seções como **irmãs no nível
0**; o navegador reabre o `<strong>` órfão e aninha as seções 2 e 3 **dentro dele**, deixando **20 dos 25
elementos de texto em `font-weight:700`**. Os scripts da skill usam `bs4`; o passo 1 usa o console. Os dois
divergem exatamente onde a origem está quebrada.

```python
seg = html[html.find('id="area-body"'):]
for t in ('strong','b','em','i','span','div','p'):
    ab = len(re.findall(r'<%s\b' % t, seg, re.I)); fe = len(re.findall(r'</%s>' % t, seg, re.I))
    if ab != fe: print('DESBALANCEADO', t, ab, fe)
```

Achou? É defeito **da original**, e a decisão é da pessoa, não sua (`armadilhas.md` **20** e **20a**). E
note que nem o `verificar_paridade.py` pega: ele compara texto, e deu **100,0% de cobertura** com a página
inteira em negrito.

Aproveite dois atributos da origem: **`data-block` traz o nome do bloco** como a pessoa o batizou
("Trio de ofertas (Grid 6.3.3)", "Coluna 8 de 12"), que você reaproveita direto no campo `name`; e as
classes do elemento são o `class` daquele bloco.

**Separe o que é página do que é tema antes de qualquer coisa.** Cabeçalho, menu, rodapé, newsletter e
blocos de ajuda aparecem no HTML da página antiga mas **pertencem ao tema**: o site novo já os renderiza.
Recriá-los duplica a seção. Só é da página o que está dentro de `#area-body` (ver `armadilhas.md` 11a, com
o trecho de JS que faz a separação).

⚠️ Ser tema **não** põe o cabeçalho fora do seu alcance: o seu CSS de página chega nele. Ver regra 4.

**Pegue também o CSS da página original**, não só o HTML, e ele já está no arquivo que você baixou: o
construtor antigo emite o CSS de página no **primeiro `<style>` do documento** (em duas páginas
institucionais medidas, 175 caracteres, cinco regras). Prefira este caminho: ele evita a etapa mais
arriscada do fluxo, que é abrir o diálogo de gravação de uma página publicada e indexada só para ler.

⚠️⭐ **E prefira por um motivo mais forte que o risco: o campo guardado não é CSS.** Medido numa
`/troca-ou-devolucao`, o campo `style` do admin tinha **319 chars de SCSS aninhado**
(`.titulo { .font-clara { h2{…} } }`) e o `<style>` renderizado tinha **175 chars de CSS plano** com as
mesmas regras achatadas: **o twig compilava o campo, o renderizador novo o injeta cru**, e o navegador
descarta o bloco aninhado inteiro (medido em agosto de 2026; num navegador com aninhamento nativo, Chrome
120+ e Safari 17.2+, parte do aninhamento simples pode aplicar, e a sua prévia num Chrome atual pode parecer
certa: `mapa-do-admin.md`, seção 3). Quem seguir o "plano B" do parágrafo abaixo e copiar o campo para a
página nova não recebe erro, não é pego pelo validador, e **não estiliza nada** para quem usa navegador sem
aninhamento. As duas fontes estão em **linguagens diferentes** (`armadilhas.md` **29**). A conclusão não
muda: escreva CSS plano.

⚠️⭐ **E leia esse CSS sabendo que o site antigo é Bootstrap 4, não 3: a `.row` dele já é flex.** Então
regra da origem em classe de coluna (`margin:auto`, `align-self`, `align-items`, `justify-content`,
`order`) tem efeito de **flex**, não de bloco, e é fácil descartá-la como inerte. Numa institucional (`/uma-institucional`), um
`.titulo{margin:auto}` centralizava o texto verticalmente (**152px** de folga de cada lado, medidos), e
reproduzir com o `flex-start` do default punha o `<h1>` 152px fora de lugar, **com a altura da faixa
idêntica**, então nem a aritmética de padding nem os dois scripts denunciam. `armadilhas.md` **11d**.

⭐ **E a config de cada bloco também está no HTML público**: o construtor twig emite **um `<style>` por
bloco** dentro de `#area-body`, com `data-block` e o CSS daquele bloco. Numa `/politica-de-privacidade` eram
**13**, e foi de lá que saíram os fundos das 6 faixas (a cor da marca da loja e `#f3f3f3`) e os
`padding: 50px` dos editores, sem abrir o admin. Leia com
`BeautifulSoup(html).select_one("#area-body").find_all("style")`. Duas convenções: `background-color: null`
sai literalmente assim quando o bloco **não** tem fundo (declaração inválida, o navegador descarta; não é
branco explícito), e bloco **sem `<style>`** está todo no default. Ver `armadilhas.md` 11a.

O campo `Blocos:` do admin continua sendo a fonte autoritativa e o plano B: abra por `Alterar Página →
Configurações` e **saia por `Cancelar`**. Na prática ele só é **necessário** para o que não aparece
renderizado: a referência de cadastro (`vitrine.vit_id`, `banner_tipo.id`, `armadilhas.md` item 4). Em
qualquer caso, o CSS computado do navegador é o que confirma.

### Passo 2. Desenhe a árvore em português antes de escrever JSON

Algo como "seção com fundo → container → título e parágrafo". Mostre essa árvore para a pessoa e confirme
antes de gerar. Corrigir a árvore custa uma frase; corrigir 40 nós de JSON custa muito mais.

### Passo 3. Escolha os blocos

`blocos.md` tem os 13 tipos, os defaults e as chaves de cada um. Comece de um default e altere só o que
precisa: não invente campos, e não omita os que vêm por padrão.

⚠️ **Os defaults escritos na skill já envelheceram duas vezes.** Antes de gerar em volume, releia o default
vivo: crie um `Box` no construtor **da sua própria página de rascunho** (não escolha outra "descartável",
pela regra zero) e leia `JSON.parse(document.querySelector('input[name=syncData]').value)`. É a única fonte
que não envelhece. Numa conferência, seis campos da config base estavam errados no catálogo (`border` tinha
virado objeto). Em agosto de 2026 a conferência voltou limpa: o default vivo bateu campo a campo, inclusive
os seis que já estiveram errados. Confira mesmo assim: é justamente por conferir que se sabe disso.

⚠️ **Não são 30 segundos, e em página de rascunho vazia isto não começa.** Duas coisas atrapalham, as duas
medidas:

- **O botão `Abrir construtor` fica na aba `Geral`**, e o fluxo de gravação leva você para a
  `Configurações`: de lá ele está no DOM com `offsetParent === null` sempre, com página cheia ou vazia.
  Chame `abaDialogo(/^\s*Geral/)` antes (`armadilhas.md` **1e** corrige o diagnóstico anterior, que culpava
  a página vazia). E **fique na `Geral`**: o construtor é renderizado dentro daquele pane, então voltar para a
  `Configurações` o esconde, `input[name=syncData]` deixa de existir e o `lerDefaultVivo()` falha com "botão
  de adicionar bloco não encontrado" logo depois de um `abrirConstrutor()` que devolveu `true`. Por isso
  `abrirConstrutor()` não volta de aba por default.
- **Rascunho recém-criado não tem campo `Blocos:` nem árvore para o construtor abrir.** A ordem que
  funciona: destrave o campo pelo `configInput.builder` (`armadilhas.md` 1d) → **grave um esqueleto** com
  as duas raízes vazias (2.415 chars) → reabra → aba `Geral` → construtor → Box → leia `syncData` → saia por
  `Cancelar` → só então gere o JSON de verdade. Custa uma gravação a mais na página que já é sua para gravar.
  (O validador acusa "raiz sem filhos" nesse esqueleto: é esperado, e esses dois ERROS não bloqueiam só
  nesta gravação técnica.)

⚠️ **Dentro do construtor, escope toda busca no painel dele.**
`document.querySelectorAll('i.fa-plus-circle')` devolve primeiro o **`Incluir` da grade**, que fica atrás do
construtor: o clique troca o diálogo para "Adicionar Página", e um `Confirmar` cria página nova em produção.
Os seletores certos são `button[ng-click*="builderController.addBlock"]` e
`[ng-click="builderController.createBlock(blockKey)"]`. `armadilhas.md` **22g**.

⚠️ **Se a página tem FAQ, a decisão é aqui.** Em FAQ **novo** (migração ou página nova), use
`<details>/<summary>` em bloco `editor`: as respostas ficam no HTML. Numa página que **já** tem FAQ em
`accordion`, acrescente no mesmo formato e leve a troca para `<details>` à pessoa como decisão separada: o
`accordion` deixa as respostas fora do HTML até o clique (regra 2: 28% de cobertura de texto).

### Passo 4. Monte o JSON, as duas raízes

Estrutura em `blocos.md`. Gere `id` novo para cada bloco: 8 caracteres `[a-z0-9]`, único **dentro da
página** (não é único no sistema: clonar uma página copia os ids intactos, então não há registro global a
consultar).

⚠️ **Toda regra que você escrever no campo `style` começa em `.SEU-BODY-CLASS #layout-main-content`**: é o
momento de aplicar a regra 4, não depois. Sem esse escopo, uma regra de duas imagens do miolo levou o logo do
cabeçalho a 945x313.

⚠️ **Fundo é explícito, como tipografia.** Na loja medida, o `body` da original era `#ffffff` e o do tema
novo **`#f8f8f8`** (confira na sua). Seção com `background.enable: false` é transparente nos dois lados,
então ela **muda de cor sozinha** na migração, e nada no JSON denuncia. Numa `/troca-ou-devolucao` a faixa
sem fundo caiu a **5 unidades** da faixa vizinha `#f3f3f3` e a fronteira entre as duas seções sumiu; na
original era branco contra cinza. Se a original mostra branco, grave `background.enable: true, color:
"#ffffff"`: é config de bloco, não custa CSS e não vaza. Quem pega esse defeito é o **screenshot**, não o
script. `armadilhas.md` **31**.

### Passo 5. Valide antes de entregar

Rode `python scripts/validar_pagina.py sua-pagina.json` (no Windows, `python3` pode ser só o atalho da
Microsoft Store, que sai com 9009 sem rodar nada; use `python`). Ele checa as duas raízes, ids, a regra do
toggle, campos legados e o formato do `accordion`, e mais quatro defeitos que já passaram por verificação
manual e são decidíveis aqui, antes de gravar: regra do campo `style` com classe do tema sem escopo no miolo,
`<script>` em bloco `code`, `margin` em bloco `imagem`, e `vitrine` em grid sem o campo `grid`. Não conserta
nada, só aponta. Corrija os ERROS antes de seguir: o construtor aceita JSON quebrado sem reclamar, então
pular esta etapa empurra o defeito para a página. Duas exceções: o esqueleto do passo 3 (as duas raízes
vazias), e a edição pontual numa página que já está no ar, em que só os ERROS novos bloqueiam (`--base
backup.json`, seção 7).

Ele considera o campo `style` ao cobrar tipografia, e cobra `<li>` e `<td>` além de `<p>`/`<h*>`, porque
`li` herda o `body` (12px na original medida, 16px no tema novo). Se a página usa a cor de link da marca,
passe `--cor-link '#RRGGBB'` com a cor **medida** no navegador (anotada no perfil da loja): ele avisa se o
`style` não a fixa.

**Vitrine com `origem: "operation"` não tem cadastro** e por isso não é cobrada por `vit_id`: ela monta a
lista pela operação (`operation: history`, últimos vistos e afins; numa home real, **2 das 8** eram assim).
Já `origem: "operation"` **sem** o campo `operation` é ERRO: **renderiza vazia sem reclamar**.

### Passo 6. Entregue

O caminho é o campo `Blocos:` em `Alterar Página → Configurações`, na página de rascunho. Antes de escrever, o
backup e a comparação da seção 0 ("Backup do `Blocos:`"). **`gravacao-construtor.md` é a receita: leia antes
de gravar, não improvise a partir daqui.** São cinco passos (abrir o diálogo → exigir **um** diálogo →
transportar com sha256 → `Confirmar` → verificar **na fonte**), e `scripts/injetar.js` traz as funções. O
essencial, porque **nenhum destes erros dá erro** (todos gravam nada, ou gravam calados no lugar errado):

- **O que grava é `data.config.builder`**, um objeto já parseado. Escrever na `<textarea>`/Ace não persiste,
  e **`configInput.builder` também não**: ele é só o texto que o humano vê, e o `ng-change` que o transporta
  não dispara quando você atribui o model por script. Custou uma gravação silenciosa: 284.053 chars
  escritos, `Confirmar` clicado, e a página gravou os **11.756 chars antigos**.
- **O clique certo é diferente por botão** (`armadilhas.md` 22d). `Alterar`: só `.click()` nativo **não
  abre**; só `triggerHandler` abre **1** diálogo; os dois juntos abrem **2**. `Confirmar`: só `.click()`
  fecha o diálogo e **não grava**; só `triggerHandler` **não grava**;
  `mousedown`+`mouseup`+`click`+`triggerHandler` **grava**.
- **Exija exatamente 1 diálogo (`dialogoUnico()`) e ligue o escopo pelo elemento dele.** O diálogo velho pode
  não sair do DOM (medido aqui, no `Alterar` do construtor; noutros diálogos ele sai: conte com
  `contarDialogos()`): fica escondido com `z-index` menor que o do novo, e `document.querySelectorAll('textarea')`
  devolve em ordem de DOM, logo entrega a do diálogo **morto**. Aconteceu numa sessão real: a escrita e o
  `Confirmar` foram no diálogo morto, e o vivo foi cancelado; nada gravou, e foi por sorte que nada
  corrompeu. Antes de `Confirmar`, prove que o escopo do diálogo aberto é o mesmo que você alterou.
- **Confira o sha256 dentro da página** antes de atribuir (`conferirCola` / `conferirSha`): é obrigatório,
  não zelo. O clipboard é recurso **global** da máquina: numa colagem vieram 17 caracteres de outra coisa,
  porque a pessoa copiou um texto enquanto a gravação rodava. E não chame `navigator.clipboard.readText()`:
  abre prompt de permissão e **estoura o `Runtime.evaluate`** (45 s). Use textarea própria + `focus()` +
  `ctrl+v`.
- ⚠️ Não espelhe o JSON no editor Ace em página grande: `ace.edit(el).setValue()` com **284 KB** congela o
  renderer e a aba para de responder. Setar o campo para string vazia faz o campo `Blocos:` **desaparecer**
  do diálogo: saia por `Cancelar` e reabra.
- ⚠️ **Em página vazia o campo `Blocos:` não existe**, e o contorno antigo (`abrirConstrutor()` → Box →
  `Aplicar`) **não começa**. Destrave pelo scope:
  `sc.configInput.builder = '{"style":"","block_list":[],"body_class":"","config":{}}'` + `$apply()`. É
  seguro porque o `ng-change` não dispara por script, então nada disso vai para o banco (`armadilhas.md`
  1d). O `offsetParent === null` do botão `Abrir construtor` **não** é sintoma de página vazia: ele mora na
  aba `Geral` e some quando você vai para a `Configurações`, com página cheia ou vazia (`armadilhas.md`
  **1e**).
- ⚠️⭐ **`verificarGravou(sha)` devolve `confere: false` em toda gravação nova, e não é falha.** O servidor
  **normaliza** ao gravar: converte todo escalar em string (`false`→`"false"`, `0`→`"0"`, `null`→`"null"`) e
  **descarta array vazio** (`child: []` some). Medido: 64.744 chars gravados, 65.421 relidos, `$$hashKey` em
  **zero** blocos. Logo o sha não pode bater. **Não regrave por causa disso**: prove por conteúdo (contagem
  de blocos, número de raízes, `device_show` das raízes, tamanho do `style` e um marcador que só existe na
  versão nova). Ver `armadilhas.md` **27**, que também traz a contradição que isso cria com o `expand` do
  `accordion`.

**Depois de `Confirmar`, a URL pública pode servir a versão anterior por ~100 s**, com bytes idênticos. É
cache do backend da Panorama, e `Cache-Control: no-cache` mais `cf-cache-status: DYNAMIC` na resposta
(numa loja com Cloudflare na frente) **enganam**. Numa sessão, isso levou a concluir três vezes que a
gravação tinha falhado, e a regravar três vezes. Mas não conte com os 100 s: em duas gravações seguidas
medidas depois, a URL entregou o conteúdo novo
na primeira busca e o `Limpar cache` não foi necessário. E numa loja com Cloudflare guardando as páginas
(numa medida, 5 min), a borda soma mais um atraso. **Busque em vez de esperar**; se vier velho, aí sim limpe
e faça poll. A ordem certa:

1. **Verifique na fonte**: recarregue, reabra o diálogo e leia `data.config.builder`. Se o conteúdo novo
   está lá, gravou. (O tamanho oscila entre leituras, 297.831 contra 299.089 chars, porque o Angular injeta
   `$$hashKey` nos objetos que itera **e** porque o servidor normaliza tipos. Não é corrupção, e não compare
   por sha nem por tamanho: compare conteúdo.)
2. `Limpar cache`, que **limpa a seleção da grade**: a linha volta desmarcada e a trava de alvo da próxima
   operação aborta. Remarque antes de seguir.
3. Só então busque a URL (com uma query nova, `?nc=...`, para passar pelo cache do navegador e, onde houver
   CDN, pela borda).

Na URL, confira que o front-end novo entregou **cerca de metade** do que você gravou: se veio igual, o corte
por device não funcionou. Confira **os dois lados**: com User-Agent de desktop deve vir a raiz `Desktop`, e
com o de celular (`curl -A "…iPhone…"`) a raiz `Mobile`, com `isssrmobile: true`. Só um dos dois não prova
nada.

⚠️ **Se a URL responder "Página não mapeada - @todo: 404", a página está despublicada.** Não é erro seu, e não
adianta reescrever JSON. Reabra o diálogo e leia o campo `Blocos:` para provar que gravou; depois volte à
autorização de publicar (o segundo combinado do começo deste fluxo).

### Passo 7. Verifique, do jeito que pega o que você não suspeitava

⚠️ Medir a altura de cada seção por uma lista de seletores é necessário e **insuficiente**: numa migração
real esse passo foi executado com cuidado e **8 defeitos passaram**, incluindo o cabeçalho do site quebrado,
e a pessoa achou 4 deles só olhando a tela. Faça na ordem abaixo, inteira.

**Dois indicadores de primeira linha, e o primeiro costuma ser esquecido: a cobertura de texto em %** e a
**altura de cada seção**. O `verificar_paridade.py` imprime, por device, quanto do texto da original (em
faixas de 6 palavras) reaparece na nova. Foi o número mais revelador de uma sessão inteira: **28,0%**. A
página parecia certa na tela e **72% do texto indexável não estava no DOM**, porque as respostas do FAQ
ficam fora dele enquanto o item está fechado (regra 2). Depois do conserto, **100,0%**. Cobertura abaixo de
100% é defeito com nome e endereço, não aproximação: vá ler o trecho que o script imprime. A altura por seção
fecha o resto; o alvo alcançado em duas páginas reais foi desvio de 1px.

**a) Rode o script de paridade e zere os ERROS.** `--nova`, `--original` e `--controle` aceitam **caminho
local**, não só URL: use os arquivos que você baixou no início do fluxo. Eles não dependem da rede nem do
cache de ~100 s, e é assim que se prova que uma mudança no próprio verificador ainda pega um defeito
conhecido.

Com arquivo local, rode duas vezes e **sem** `--mobile`: ele só serve com URL. Com arquivo, ele releria o
mesmo arquivo de computador e acusaria um ERRO falso de `isssrmobile`; a cópia atual do script avisa e ignora
a opção.

```bash
python scripts/verificar_paridade.py --nova nova-desktop.html --original orig-desktop.html \
       --controle controle-desktop.html --json a-sua-pagina.json
python scripts/verificar_paridade.py --nova nova-mobile.html --original orig-mobile.html \
       --controle controle-mobile.html --json a-sua-pagina.json
```

`nova-*` é o rascunho no site novo, baixado com os dois User-Agents (os mesmos `curl` do começo desta
seção, com `?nc=...`) depois de publicar e a cada gravação; `controle-*` você baixou no começo.

Ele pega offline o que a inspeção manual não vê: **cobertura de texto** por device, vazamento de CSS para
header/footer/flutuantes (com o seletor escopado já sugerido), `<script>` em bloco `code`, `margin` em bloco
`imagem`, `vitrine` em grid sem o campo `grid`, links que faltam no mobile, recorte de imagem fora de
proporção, tipografia sem `font-size` e `alt` igual ao id. Testado retroativamente contra a migração
quebrada, acusou os **8 defeitos**. O `--controle` não é opcional na prática: é o que separa "o tema é assim"
de "eu quebrei o tema". Precisa do pacote `beautifulsoup4`.

Como ler a saída, e como saber que a cópia do script é a atual:

- A **cobertura em %** (shingles de 6 palavras) aparece por device. Uma avalanche de "texto ausente" por
  elemento-folha é de versão antiga do script (dava **17 falsos positivos por device** só porque o twig e o
  React aninham diferente). Os outros cinco falsos positivos antigos estão em `armadilhas.md` 21.
- Numa loja com a Cloudflare na frente, o e-mail ofuscado por ela (`/cdn-cgi/l/email-protection`,
  `<span data-cfemail>`) é decodificado e sai como `info`, não como link ausente. Sem Cloudflare, nada disso
  aparece.
- O aviso "não escopada em `#layout-main-content`" só aparece para regra com classe **do tema**; regra só com
  classe sua não vaza.
- Com `--mobile` e um artefato que já é mobile, ele diz que ignorou a duplicata, em vez de contar cada achado
  duas vezes. Com `--mobile` e arquivo de computador, ele avisa que o celular **não** foi conferido: rode a
  segunda linha acima.
- A **seção 2** (header/footer contra o controle) imprime na hora, por exemplo `<header> byte-identico ao
  controle (28127 chars)`. Sem `--controle`, ela imprime `(pulada — sem --controle)` e emite AVISO. Se a sua
  cópia deixa a seção 2 em branco, ela é antiga.

**b) Cole no console das duas páginas o JS que o script imprime, com a mesma largura de janela**, e compare
as duas saídas. Ele cobre o que não dá para ver offline: tipografia computada de **toda** folha de texto,
geometria do grid, **irmãos com a mesma config medindo diferente**, imagem que não carregou, tamanho do logo e
contagem de `<h1>`.

⚠️ **"Mesma janela" não garante mesma viewport.** O Chrome guarda **zoom por origem**, e o site antigo e o
novo são origens diferentes: na mesma janela, mediu-se `innerWidth` 1536 num e 1707 no outro. Imprima
`innerWidth` junto. E **nunca compare "desktop" abaixo de 993px**: o tema novo decide por **viewport**
(`isMobile = width<=992 || isSsrMobile`) e a página antiga decide no servidor por **user-agent**; entre 576 e
992px as duas mostram árvores diferentes e a comparação é inválida.

⚠️ **E o zoom muda entre chamadas.** Medido na mesma janela, alternando entre as duas páginas: `innerWidth`
deu **1536 → 1707 → 1536 → 1707** em quatro medições, sem ninguém redimensionar. Isso **fabricou um
defeito**: a primeira comparação acusou desvio de 0,1–0,2px em 3 de 6 seções; remedindo as duas a 1536, o
desvio foi **0 nas seis**. Portanto imprima `innerWidth` **dentro da mesma chamada da medição**, não numa
chamada anterior, e só compare números colhidos na mesma largura. Abas abertas pela extensão do navegador
também já reportaram 375x667 sem motivo aparente. Ver `armadilhas.md` 23c.

**c) Compare visualmente lado a lado, seção por seção, no mesmo ponto de scroll.** Screenshot serve para
**fidelidade** ("está igual à original?"), não para presença ("a seção apareceu"). Conferir presença foi
exatamente o que deixou passar uma faixa laranja e desalinhada que estava visível numa imagem já olhada.

**d) Reexecute a verificação completa depois de cada gravação, nunca só o delta.** Verificação incremental é
cega a regressão: numa migração de 3 gravações, o logo quebrou na 3ª, e a 1ª tinha screenshot do topo
mostrando o cabeçalho **correto**. Repetir a conferência anterior teria pegado na hora.

**e) Anomalia numérica sem explicação é achado, não curiosidade.** Três imagens irmãs, mesma config, mediram
`580x546, 580x278, 580x268`. Anotou-se "estranho" e o trabalho seguiu; era uma imagem esticada por `margin`
no bloco `imagem`. O dado estava na própria saída. Se dois elementos com a mesma config medem diferente,
pare e explique antes de continuar.

**f) Para aparência computada, o navegador é a fonte, e uma medição só pode pegar estado transitório.**

- **Arquivo estático subdetermina.** Uma classe criada pela loja medida (`.icone-ver-mais`) não aparecia em
  **nenhuma** das 13 folhas de estilo da original e ainda assim computava 18x18, fundo laranja,
  `border-radius:50%`, `margin-left:8px` e svg branco. Numa revisão, três achados foram rejeitados porque a
  regra não estava no arquivo, e os três eram verdadeiros.
- **Uma leitura só pode ser um instante ruim.** Uma faixa (`.faixa-de-tags`, na loja medida) tinha `opacity:0` no
  CSS e um script punha `style="opacity:1"` **inline** depois do carrossel; duas leituras (4 s e 5 s) deram
  0 e a conclusão "faixa invisível no ar" estava **errada**: ela aparecia, e um screenshot resolvia em um
  passo. `opacity` inicial mais `transition` é assinatura de fade-in por JS: procure o setter em
  `element.style`, não nas folhas. Mesma classe de erro: as setas do carrossel só existem depois do AJAX dos
  produtos mais scroll, então medir antes devolve 0x0 e uma conclusão falsa.
- **Animação CSS não avança em aba que não está sendo pintada**: `playState: "running"` com `currentTime`
  **0** depois de 3,6 s. Conduza o relógio: `el.getAnimations()[0].currentTime = N`. Pelo mesmo motivo, num
  painel de navegador escondido as imagens `lazy` não carregam.
- **Screenshot vem escalado** (1568px contra viewport de 1707, fator 1,089): um clique por coordenada caiu
  24px fora e **abriu outro módulo de outra loja**. Aja pelo DOM, sempre.

**Depois disso, o detalhe:** onde a altura de uma seção divergir, desça naquela seção com `getComputedStyle`
de `fontSize`, `lineHeight`, `marginBottom` e `padding` do bloco, e `getBoundingClientRect()` das colunas.
Diferença constante repetida em várias seções é quase sempre **margem de `<h2>` ou `<p>`**; diferença numa
seção só costuma ser **padding que ficou no bloco errado**.

⚠️⭐ **Mas altura igual não é seção certa: meça a posição também.** Um defeito de alinhamento vertical dentro
da linha não mexe na altura de nada: quando a altura da seção é mandada pela coluna mais alta, mover a outra
coluna 152px deixa **as quatro faixas com desvio 0px**, cobertura de texto em **100%** e os dois scripts em
**0 erros**. Compare `rect.top - pai.top` e `pai.bottom - rect.bottom` de cada coluna, nas duas páginas, e não
só `rect.height`. Foi assim que se achou o `margin:auto` do `armadilhas.md` **11d**; o outro jeito de achar é
o item (c), screenshot lado a lado. Para achar o elemento que realmente contém o texto (e não um `div`
embrulhando tudo), desça até o mais profundo:
`all.find(e => ![...e.children].some(c => c.textContent.includes(txt)))`.

**O script cobre (a) e só (a).** De (b) a (f), console nas duas páginas, lado a lado, verificação completa a
cada gravação, anomalia explicada e medir no navegador, é disciplina sua, e foram esses cinco que deixaram
passar os 8 defeitos. Autópsia em `armadilhas.md` 21.

**Referência do que dá para alcançar**, medido em páginas reais:

- Uma `/formas-de-pagamento` foi reproduzida com **desvio máximo de 1px** em 6 seções; 66 blocos originais
  viraram 37 por device, e o CSS de página caiu de 175 para 41 caracteres.
- Numa home (bem maior), **234 blocos gravados em 2 raízes → 119 entregues no desktop e 115 no mobile**, com
  desvio máximo de 1px no grid.
- O melhor resultado, que é a régua para página institucional de texto, foi uma `/politica-de-privacidade`:
  **desvio 0px nas 6 seções** (medindo as duas na mesma `innerWidth`), **100,0% de cobertura de texto** no
  desktop, tipografia computada com **todas** as assinaturas iguais (`h2` 32/35,2/600, `h3` 28/30,8/500, `p`
  16,8/25,2, `li` 12/18, `a` na cor de link medida da loja), `<header>` **byte-idêntico** ao controle nos dois
  devices e **0** vazamento de CSS. Custo: **39 blocos** (20 Desktop + 19 Mobile) contra 30+27 da origem,
  **688 chars** de CSS de página, e a estrutura de 3 níveis da terceira receita de grid. Duas gravações: a
  primeira saiu com o link vermelho porque a cor foi derivada do CSS em vez de medida (`armadilhas.md` 23).
- A menor de todas, útil como piso de esforço, foi uma `/troca-ou-devolucao`: **15 blocos da origem → 20
  gravados (10 por device)**, `style` de **972 chars**, **100,0% de cobertura de texto** nos dois devices,
  `<header>` byte-idêntico ao controle, **0** vazamento, e **desvio 0px em 20 de 21 elementos de texto**. A
  exceção é um parágrafo que ficou 25,2px mais baixo porque a **correção de um `</strongs>` da origem** tirou
  o negrito e ele passou a caber em 1 linha (`armadilhas.md` **20a**). Duas gravações: a segunda só para pôr
  `#ffffff` explícito numa faixa que a original mostrava branca e o tema novo pintava de `#f8f8f8`
  (`armadilhas.md` **31**).

### Passo 8. Mostre o rascunho e espere o "aprovado"

No construtor, a prévia é a própria página de rascunho combinada no começo (`previa.md`, tabela). Gravar
nela antes do "aprovado" é o que foi combinado; gravar na página que vai receber a versão nova (a original,
numa migração), não.

Mande para a pessoa (`previa.md`, "Mandar para a pessoa"):

- o endereço do rascunho (com `?nc=...`) e o da original, para ela abrir os dois;
- os prints lado a lado, original e rascunho, no computador e no celular, na mesma largura e no mesmo ponto
  de rolagem (passo 7c);
- o que você conferiu (cobertura de texto, cabeçalho igual ao controle, desvio por seção) e o que ficou
  diferente de propósito, com o aval dela (o FAQ em `<details>`, um defeito da original corrigido);
- o que a prévia não mostra: numa loja com os dois front-ends, como a página vai ficar no endereço antigo
  (passo 9).

Conta como resposta um "aprovado" sobre **esta** versão do rascunho. Qualquer ajuste depois pede nova
gravação no rascunho, a verificação inteira de novo (7d) e nova rodada de aprovação. Anote no histórico do
perfil o sha256 do arquivo local aprovado: é ele, e só ele, que vai para a página real no passo 9.

⚠️ "Aprovado" ou "pode subir" sobre o rascunho aprovam o **conteúdo**. Nenhuma frase de aprovação é pedido
para apertar `Publicar` ou `Despublicar`, nem para trocar a URL de uma página: cada um desses só com um
pedido que nomeie o botão e a página. Se a resposta vier com "publicar", separe as duas coisas antes de
qualquer gravação, como em `previa.md` ("Aprovação, gravação e conferência").

### Passo 9. Leve a versão aprovada para a página real, pelo caminho que a pessoa escolher

Isso muda o site no ar: a decisão é da pessoa, e a regra zero vale inteira. Pergunte qual caminho ela quer.

**(a) Gravar o JSON aprovado no `Blocos:` da página original** (o `#` dela). Mantém URL, SEO e publicação.
Mas o registro é um só para os dois endereços (seção 1): numa loja com os dois front-ends, o endereço antigo
(twig) também passa a mostrar a versão nova, e lá o CSS escopado em `#layout-main-content` não age (o miolo do
twig é `#area-body`). Para mostrar como vai ficar, abra o rascunho no endereço antigo: publicado, ele
responde lá também.

**(b) Trocar URL, publicar o rascunho ou despublicar a original.** Cada botão, e cada troca de URL, só com um
pedido que o nomeie. Leve os fatos antes: o rascunho nasceu com `Robots` `noindex, nofollow` e fora do
sitemap, então, se ele virar a página real, esses dois campos mudam junto, ou a página sai do Google; e página
despublicada responde 404 (`armadilhas.md` 6b). A troca de URL não foi medida: se ela escolher esse caminho,
ela faz (ou pede botão a botão) e você confere cada passo na grade. Numa página nova, sem original, este é o
único caminho.

No caminho (a), antes de gravar na original:

1. pergunte se alguém está com o `Alterar` dela aberto e peça para sair por `Cancelar` (seção 7, item 1);
2. faça o backup do `Blocos:` da original (seção 0, "Backup do `Blocos:`");
3. diga em uma frase e espere o "sim" sobre ela: "Vou trocar o conteúdo da página #NNNNNN /url pelo que você
   aprovou no rascunho. Muda no site novo e também no endereço antigo. Para voltar, eu colo o backup de hoje.";
4. grave **exatamente** o arquivo aprovado (o sha do passo 8 confere no transporte), com `conferirAlvo`,
   `conferirDialogo` e a comparação com o backup feitos na original;
5. rode a verificação dos passos 6 e 7 inteira, agora no endereço da original.

A regra "se a linha diz `index, follow`, não grave nela" (`armadilhas.md` 10b) serve para escolher o
rascunho; aqui, a original é a página que a pessoa nomeou para receber a versão aprovada. No fim, lembre a
pessoa de que o rascunho continua publicado (e responde nos dois endereços, seção 1); despublicar é decisão
dela.

Depois de terminar, anote no perfil da loja o `#` das páginas, o que foi feito, onde está o backup do
`Blocos:` anterior e como desfazer (colar o backup e gravar de novo).

---

## 5. A paleta não é o contrato

A tela `Criar` oferece 13 tipos, mas essa é a lista do que a interface cria por clique; o contrato é o
JSON. O caso conhecido é o `accordion` ("Expansível"): fora da paleta, escrito à mão renderiza. Então **não
desista de um tipo por ele não estar na paleta** (imitá-lo em bloco `code` perde a edição pelo painel e vira
markup para alguém manter), e note que a trilha por script alcança mais que a interface.

O preço: tipo fora da paleta **não tem default oficial**. A única fonte é o formato observado em páginas
existentes, justamente o que a regra 1 manda evitar. É a exceção consciente, e por isso exige verificar
renderizando antes de entregar. E "renderiza" não é "serve": o `accordion` do FAQ é o contraexemplo da regra
2.

## 6. Duas trilhas, dois públicos

**Por script (Claude grava pelo navegador, ou entrega o JSON pronto).** Gere o `block_list` completo e siga
`gravacao-construtor.md` para injetar, ou entregue o arquivo para a pessoa colar no campo `Blocos:`. É o caminho para
migração em volume e para páginas grandes.

**Pela interface (a pessoa monta clicando).** Não entregue JSON: traduza o resultado em passos de clique,
usando os nomes que aparecem na tela. O dicionário está em `blocos.md`: o `type` `block` chama-se **Box** no
painel, `code` é **Código**, `accordion` é **Expansível**. Falar "adicione um bloco `block`" para quem está
olhando a interface não ajuda ninguém.

Quando não estiver claro qual trilha, pergunte. As duas respostas são úteis e a diferença entre elas é
grande. Para quem não é desenvolvedor, a trilha pela interface costuma ser a mais confortável em páginas
pequenas; em páginas grandes, ofereça gravar por script na página de rascunho e mostrar o resultado antes de
levar qualquer coisa para a página real (passos 8 e 9).

## 7. Edição pontual numa página que já está no ar

Pedido típico: "acrescenta duas perguntas no FAQ da página de trocas", "troca o texto da segunda faixa". A
página que a pessoa nomeou é o alvo: o "somente leitura" da seção 0 e a regra "se a linha diz `index,
follow`, não grave nela" (`armadilhas.md` 10b) valem para migração, não aqui. O resto da regra zero vale
inteiro, e a prévia e o "aprovado" vêm antes de qualquer gravação. Nada aqui pede `Publicar`: a página já
está no ar.

1. **Pergunte se alguém está com o `Alterar` (ou o construtor) dessa página aberto**, em outra aba ou outro
   computador, e peça para sair por `Cancelar`. O `Confirmar` de lá envia o que o diálogo carregou na
   abertura e desfaz a sua gravação, sem aviso (`armadilhas.md` 8).
2. **Backup e "antes":** o `Blocos:` num arquivo local (seção 0, "Backup do `Blocos:`") e o HTML da página no
   ar, no endereço que você vai verificar depois (o do site novo), computador e celular (os `curl` do começo
   da seção 4): é o "antes" da verificação. Baixe também a página de controle, nos dois aparelhos (o terceiro
   combinado da seção 4: peça uma, se o perfil não tiver).
3. **Peça o texto exato** do que entra (perguntas e respostas, palavra por palavra). Conteúdo é decisão dela.
4. **Monte a versão nova a partir do backup, num arquivo local, mexendo só no trecho pedido.** Copie o
   formato que a página já usa ali (o mesmo tipo de bloco, a mesma `class`, o mesmo HTML; num FAQ em
   `accordion`, `accordion`, como no passo 3) e faça a mudança nas duas raízes, se houver duas. Id novo só
   para bloco novo (8 caracteres `[a-z0-9]`, que não exista na página). O que estiver fora do pedido (formato
   antigo, FAQ em `accordion`, falta de raiz Mobile, CSS sem escopo) não é seu para consertar: vai para a
   pessoa como lista de decisões.
5. **Valide contra o backup:** `python scripts/validar_pagina.py nova.json --base backup.json`. ERRO que já
   estava no backup vira AVISO ("pré-existente"): liste esses para a pessoa e não mexa neles. Só os ERROS
   novos bloqueiam. (O validador e o `verificar_paridade.py` leem o JSON relido do admin, em que o servidor
   gravou os escalares como texto: `"false"` conta como desligado, `armadilhas.md` 27.)
6. **Prévia na página no ar, sem gravar:** um favorito `--js` que insere o trecho novo no lugar dele, no
   computador e no celular (`previa.md`, com os prints de antes e depois), ou um rascunho que a pessoa criar
   ou clonar (clonar cria página nova em produção: só ela faz, ou pede com essas palavras). Espere o
   "aprovado" sobre essa prévia.
7. **Grave:** num diálogo aberto agora, a comparação com o backup (seção 0, item 4), e então o transporte do
   passo 6 (`gravacao-construtor.md`) com o arquivo aprovado, `confirmarGravacao()` e a verificação na fonte.
   Para uma troca curta de texto, `editarBlocos(doc => …)` faz o mesmo sem transportar o documento inteiro,
   desde que a troca seja exatamente a do arquivo validado e aprovado.
8. **Verificação inteira** (passo 7), com `--original` no HTML de "antes" do item 2 e `--miolo-original
   "#layout-main-content"` (o "antes" é do site novo, e o default do script é o miolo do site antigo,
   `#area-body`): o texto de antes tem de aparecer 100% na nova, e o `<header>` continuar igual ao controle.
   Confira no ar contra os prints da prévia e anote no perfil o que mudou, onde está o backup e como desfazer
   (colar o backup e gravar de novo).
