# Armadilhas e pontos não resolvidos

Leia antes de prometer prazo ou paridade com uma página antiga. Cada item abaixo já custou tempo de
alguém.

A numeração não é sequencial (há `1b`, `10b`, `11a`…) porque outros arquivos da skill citam os itens
pelo número. **Não renumere** — acrescente no fim ou com sufixo de letra. O item **M**, no topo, é o único
sem número: é método de medição, e vale para todos os outros.

Cada assunto tem **um** dono aqui; onde o assunto reaparece, o texto é resumo com ponteiro. Se você achar
duas explicações completas da mesma coisa, uma delas envelheceu — conserte a que estiver errada e
transforme a outra em ponteiro.

**De onde vêm os números.** Tudo aqui foi medido em lojas reais da plataforma Panorama, durante
migrações do site antigo (twig) para o site novo (React) e ajustes de tema. Os números de medição —
tamanhos, contagens, tempos — são reais e foram mantidos. Os identificadores da loja medida (`#` de
página, número da loja, domínio, nomes de arquivo, cores da marca) foram trocados por marcadores como
`#NNNNNN`, `SUA-LOJA.com.br`, `#RRGGBB` e `.SEU-BODY-CLASS`; as classes que a loja medida criou
ganharam nomes neutros (como `.faixa-de-tags`), e na sua loja os nomes são outros. Os da **sua** loja ficam no perfil
dela (`~/panorama-lojas/<slug-da-loja>.md`), não aqui. Quando um fato depende do tema, ele diz
onde foi medido — família `/dist`, família `modelo-1`, plataforma (nas duas) ou front-end novo (React) —
e vale onde foi medido, não em toda loja: as famílias diferem de uma loja para outra, e o tema muda com o
tempo. Confira na sua antes de confiar num número (`SKILL.md`, "Família do tema"; o que já se viu mudar de
uma família para a outra está no item 32).

As regras e os passos citados como "regra N" e "passo N" estão em `construtor.md`; a regra zero
(segurança: em qual página gravar, backup, nunca `Excluir`/`Publicar` sem pedido) está no `SKILL.md`.

---

## M. ⭐ MÉTODO DE MEDIÇÃO — leia antes de medir qualquer coisa

A lição mais transferível deste arquivo: **três conclusões erradas numa única sessão vieram de medir
do jeito errado, não de raciocinar errado.** Cinco regras, cada uma com o item que guarda a prova:

1. **Para aparência computada, a fonte é o NAVEGADOR — arquivo estático subdetermina.** O ícone do
   "Ver mais" de uma home medida (classe `.icone-ver-mais`, criada pela loja) não aparece em **nenhuma das 13
   folhas de estilo** baixadas da original, e na página computa 18×18 na cor primária da loja. Três
   achados de agentes foram rejeitados por causa disso, e os três estavam certos. → **item 23**
2. **Uma medição é um instantâneo, e instantâneo de animação mente.** Uma faixa de etiquetas da home
   (classe `.faixa-de-tags`, criada pela loja) tem `opacity:0` no CSS e um script sobe para `opacity:1`
   **inline**: duas leituras (4s e 5s) deram `0` e a conclusão foi "faixa invisível no ar" —
   **errada, ela aparece**. Quando a conclusão é sobre *o que a pessoa vê*, **tire um screenshot**;
   resolvia em um passo. → **item 23a**
3. **Animação CSS não avança em aba que não está sendo pintada**: `playState: "running"` com
   `currentTime` **0** depois de 3,6s. Conduza o tempo à mão (`el.getAnimations()[0].currentTime = N`)
   ou você conclui que a animação está quebrada. → **item 23b**
4. **Não clique por coordenada de screenshot**: ele volta escalado (**1568px** contra viewport de
   **1707**, fator **1,089**), e um clique 24px fora **abriu outro módulo de outra loja**. Aja pelo
   DOM. → **item 22a**
5. **`innerWidth` não é confiável e `resize_window` pode não mudar o viewport** (janela pedida em 800,
   `innerWidth` continuou **1707**). Para largura estreita, constrinja o container e meça.
   → **item 23c**

E a que fecha as cinco: **antes de rejeitar um achado de aparência, meça na página renderizada.**
Ausência no arquivo que você baixou não é ausência no navegador. O corolário para texto está no
**item 9b** — no HTML cru o `grep` mente para o outro lado, dizendo que existe o que não está no DOM.

## 0. ⭐ O CSS da sua página VAZA para o tema — cabeçalho, rodapé e botões flutuantes

O defeito mais grave que uma sessão de migração já produziu aqui, e o mais fácil de repetir: o
`body_class` fica no `<body>`, então **toda regra do campo `style` alcança o site inteiro** — header,
menu, rodapé, botão flutuante de WhatsApp. Não existe fronteira entre "CSS da página" e "CSS do tema".

O caso medido: para esticar **duas** imagens do miolo, escrevi

```css
.SEU-BODY-CLASS .pano-link-anchor{display:block;width:100%}   /* ⚠️ quebra o tema inteiro */
```

Resultado, contra outra página do MESMO site novo, já publicada e com `body_class` próprio (a página de
controle):

| | Com a regra solta | Correto |
|---|---|---|
| logo do header | **945×313** | 180×60 |
| altura do `<header>` | **418px** | 144px |
| logo do rodapé | **~248px** | 160px |
| botão flutuante de WhatsApp | **barra verde de 100vw** | pílula 132×36 |

Por que o alcance é tão grande: das **127** `.pano-link-anchor` da página, **96 estão no `<header>`**,
**13 no `<footer>`**, **1 no botão flutuante** e só **17 no miolo**.

⚠️ **O botão flutuante não está dentro de `header` nem de `footer`** — é irmão, depois do `</footer>`.
Contar só os dois containers dá a falsa impressão de que a regra está contida.

⚠️ **Escopar nas suas próprias classes conserta o tema mas deixa buraco.** As 17 âncoras do miolo
estavam em 4 grupos: 4 em `.swiper-slide` (banner), 2 em `.meia-promo`, 8 em `.moldura-categoria`, 3 em
`.col-sm-6`. Escopar só nas duas classes que eu mesmo criei (`.meia-promo`, `.moldura-categoria`) cobriu
10 e **deixou 7 de fora** — foi a primeira tentativa, incompleta.

**A correção que fecha as duas pontas** é escopar no `<main>` do tema, que contém as 17 âncoras do
miolo e não contém header, rodapé nem flutuantes:

```css
.SEU-BODY-CLASS #layout-main-content .pano-link-anchor{display:block;width:100%}
```

O que vaza e o que não vaza: `.container` e `.row` tiveram **0 ocorrências** em header/footer — as
regras do item 11b sempre foram seguras. **O que vaza é regra que usa classe DO TEMA** (`pano-*`,
`swiper-*`, e qualquer nome que você não inventou). Antes de escrever uma, conte as ocorrências dela
em `header`, `footer` e fora dos dois.

**Técnica de prova (use sempre, não é opcional):** baixe **outra** página do site novo como controle e compare
o recorte do `<header>` — **por estrutura, não byte a byte** (o parágrafo seguinte diz por quê; byte a byte
foi o que a primeira medição usou, e a comparação de hoje é de árvore de tags/classes mais conjunto de
`href`). Na página migrada os dois eram **idênticos, 28.127 chars, mesmo SHA1**; o `<footer>` tinha **51.407
chars** nos dois e diferia em **2 tokens `data-cfemail`** (o ofuscador de e-mail da Cloudflare, que aquela
loja tinha na frente do site). Com header e rodapé provados iguais, a única variável restante é o seu `style`
— e aí a comparação de geometria vira conclusiva. O `scripts/verificar_paridade.py` faz essa contagem e já
sugere o seletor escopado.

⚠️ **O controle tem de ser do MESMO device da página nova.** Comparar a sua página mobile com um
controle desktop acusa vazamento onde não há: o `<header>` mobile tem **~23 tags** contra **~259** do
desktop, e a leitura ingênua dessa diferença é "seu CSS está quebrando o cabeçalho". Byte a byte
também é frágil demais: o script hoje compara **árvore de tags/classes + conjunto de `href`** e tem
guarda de device trocado, justamente por isso.

⚠️ Esta armadilha reaparece com outro nome no **item 24a** (regra larga de `pano-carousel-*` que
alcançou as amostras de cor dentro do card). Toda vez que você escrever CSS com classe **do tema**,
conte antes quantos elementos ela pega — em `header`, em `footer`, e nos filhos aninhados do alvo.

## 1. A paleta não é o limite do sistema — o JSON é

O caso que revelou isso: o bloco `accordion` ("Expansível") **não está entre os 13 tipos da paleta**
(verificado no nível raiz e dentro de um container `block`; nos dois casos a lista termina em `Logo`).
Mas **escrito à mão no JSON ele renderiza normalmente no site** — confirmado com o time de
desenvolvimento. Páginas existentes dependem dele: na loja medida, a home `-v2` tinha 8 e a página de
FAQ era feita disso.

Isso vale como princípio geral, e é a informação mais estratégica deste arquivo:

**A paleta é uma conveniência da interface, não o contrato.** O contrato é o JSON. Um tipo pode
renderizar sem estar na paleta.

Duas consequências práticas:

- **FAQ não está bloqueado.** O `accordion` existe e renderiza — **com uma exceção medida.** O bloco
  nativo não renderiza o corpo enquanto fechado, então o texto da resposta **não existe no HTML** (numa
  home, pode ser a maior parte dele — medido: 72%). Leia o **item 18a** antes de decidir; ele tem o
  mecanismo, os dois estados possíveis do nativo e o preço de cada caminho. A regra, uma só em toda a
  skill: em FAQ **novo** (migração ou página nova), use `<details>/<summary>` em bloco `editor`, e as
  respostas ficam no HTML. Numa página que **já** tem FAQ em `accordion`, acrescente no mesmo formato e
  leve a troca para `<details>` à pessoa como decisão separada (o `accordion` deixa as respostas fora do
  HTML até o clique).
- **A trilha de dev pode mais que a interface.** Quem gera JSON alcança tipos que quem clica não
  alcança. Isso deixa de ser conveniência e passa a ser argumento técnico: para páginas que precisam de
  `accordion`, gerar JSON é o único caminho.

Cuidado que segue de pé: como `accordion` não é criável, **não existe default oficial dele**. A única
fonte é o formato observado em páginas existentes — exatamente o que a regra 1 do `construtor.md`
manda evitar. É a exceção à regra, e por isso precisa de cuidado extra: gere, aplique na página de
rascunho combinada com a pessoa e **confira renderizando** antes de usar em página real. O formato está em
`blocos.md`.

**Ainda em aberto:** se `accordion` é o único tipo nessa situação. Como a paleta não é a fronteira,
podem existir outros tipos renderizáveis que ninguém lista. Vale perguntar ao time se há um registro de
`type → componente` no código — seria a fonte completa, e tornaria este catálogo definitivo em vez de
observado.

## 1b. Esquecer a raiz Mobile

A armadilha mais custosa do modelo de duas raízes: gerar só a árvore `Desktop`. A página fica perfeita
no computador e **vazia no celular**, porque o servidor corta por `device_show` e não há nada para
entregar. Como quem revisa normalmente olha no desktop, o defeito passa.

Sintoma na verificação: o front-end entrega o **mesmo** número de blocos que você gravou. Deveria
entregar cerca de metade. Ver `gravacao-construtor.md`.

E no construtor: quem não sabe que `Computador | Celular` alterna árvore (e não preview) edita o Desktop
e vai embora achando que terminou.

## 1c. Duas textareas com o mesmo `name`

Na aba `Configurações` do diálogo `Alterar Página`, os campos `Custom Config:` e `Blocos:` **têm o mesmo
`name="configInput"`**. Distinguem-se só pelo `ng-model`: `configInput.custom` e `configInput.builder`.

Ler o errado por script devolve string vazia — e a conclusão natural, errada, é que a página está sem
conteúdo. Escrever no errado é pior.

## 1d. O campo `Blocos:` não abre em página vazia — e o contorno documentado NÃO funciona

Página do construtor recém-criada, sem nenhum bloco salvo, não libera o editor de JSON: o rótulo
`Blocos:` aparece e **não há campo nenhum** ao lado dele.

O mecanismo, lido no DOM do diálogo (2026-08-11, numa página de rascunho vazia):

```html
<div class="form-group">
  <label class="control-label col-sm-3" for="configBlocks">Blocos:</label>
  <!-- ngIf: configInput.builder -->        <!-- <- o campo só existe se isto for truthy -->
</div>
```

⚠️ **Correção de uma versão anterior deste item**, que mandava "adicionar um bloco qualquer pelo
construtor (`abrirConstrutor()` → `+` → Box → `Aplicar` → `Confirmar`)". **Não dá para começar** por
ali — mas **a causa que este item deu está errada**, e o erro custou uma investigação inteira. Ver 1e.

**O contorno que funciona**, e ele é seguro justamente pelo motivo que faz existir a seção "O que grava é
`data.config.builder`" do `gravacao-construtor.md`: atribuir o model por script **não dispara o `ng-change`**, então isto é só tela.

```js
const sc = angular.element(dialogoUnico()
  .querySelector('textarea[ng-model="configInput.custom"]')).scope();
sc.configInput.builder = '{"style":"","block_list":[],"body_class":"","config":{}}';
if (!sc.$root.$$phase) sc.$apply();          // o ng-if renderiza -> o campo Blocos: aparece
```

Medido depois disso: o campo existe e `data.config.builder` continua com **0 chars** — o placeholder
de tela **não** vai para o banco. A partir daí `escopoDoDialogo()` funciona e o fluxo normal
(`injetar` → `confirmarGravacao`) segue igual.

Na gravação seguinte da mesma página o campo já existe (medido: 101.726 chars formatados) e nada
disso é necessário.

## 1e. ⭐ `Abrir construtor` está na aba **Geral** — não é "página vazia" que o esconde

⚠️ **Correção do item 1d e do `injetar.js`**, que atribuíam o `offsetParent === null` do botão à
condição de página vazia. **Não é.** Medido em 2026-08-11 numa página **já com 20 blocos salvos**, com o
diálogo aberto na aba `Configurações`:

```
botaoConstrutor: 1   construtorVisivel: [false]
display: inline-block   visibility: visible   offsetParent: null   w×h: 0×0
ancestrais: DIV.col-sm-7 > DIV.form-group > DIV.ng-scope > DIV.form-horizontal
            > DIV.tab-pane  <- display:none
```

O botão está dentro do `.tab-pane` da aba **`Geral`**, e esse pane fica `display:none` enquanto a
`Configurações` está ativa. Contado no diálogo: **3 panes** — `Geral` (tem `Abrir construtor`, não tem
`Blocos:`), `SEO`, e `Configurações` (tem `Blocos:`, não tem o botão).

Ou seja: **o fluxo da skill sempre esconde o botão**, porque `abaDialogo(/Configura/i)` é o passo
anterior. A página estar vazia era coincidência de quando se observou.

**O que fazer** — troque de aba antes:

```js
abaDialogo(/^\s*Geral/, dlg);            // <- sem isto o botão é invisível SEMPRE
const b = [...dlg.querySelectorAll('button')]
  .find(x => /Abrir construtor/i.test(x.textContent||'') && x.offsetParent !== null);
angular.element(b).scope().$apply(s => s.controller.toggleBuilder());
```

`scripts/injetar.js` faz isso desde 2026-08-11 (`abrirConstrutor()` troca para `Geral` sozinho).

⚠️⭐ **Correção de 2026-08-12: ele também precisa FICAR na `Geral`.** O construtor inteiro é
renderizado dentro daquele `.tab-pane`, então voltar para a `Configurações` — que era o default de
`abrirConstrutor(voltarPara)` — **esconde o construtor**: medido numa página de rascunho, com o construtor aberto e
o diálogo na `Configurações`, `input[name=syncData]` **não existia** e havia **0** botões `addBlock`
visíveis. O sintoma é dos piores de diagnosticar, porque `abrirConstrutor()` devolve `true` e é o
`lerDefaultVivo()` seguinte que estoura com "botão de adicionar bloco não encontrado" — parece
problema da paleta, e é aba. Hoje o default é ficar na `Geral`; passe a aba explicitamente
(`abrirConstrutor(/Configura/i)`) só quando terminar de usar o construtor.

⚠️ **Continua verdade que em página VAZIA o construtor não resolve o campo `Blocos:`** — mas por outro
motivo: com `data.config.builder` indefinido não há o que editar. O contorno pelo `configInput.builder`
do item 1d é o certo, e ele funciona.

### E há uma consequência de ordem para o passo 3 do `construtor.md`

O passo 3 manda ler o **default vivo** criando um Box no construtor **da sua própria página de
rascunho** — e a regra zero do `SKILL.md` manda que essa seja a única página em que você grava. Mas rascunho novo
costuma estar **vazio**, e vazio não tem campo `Blocos:` nem construtor útil. A ordem que funciona,
medida:

1. destrave o campo pelo `configInput.builder` (item 1d);
2. **grave um esqueleto** — as duas raízes vazias bastam (medido: 2.415 chars). O validador acusa "raiz
   sem filhos" nesse esqueleto: é esperado, e esses dois ERROS não bloqueiam só nesta gravação técnica;
3. reabra, vá na aba **`Geral`**, abra o construtor, crie o Box, leia `syncData`;
4. saia por `Cancelar` (o Box do construtor não foi `Aplicar`ado nem `Confirmar`ado — não persiste);
5. só então gere o JSON de verdade.

Custa uma gravação a mais numa página que é sua para gravar. Sem isso, o passo 3 é inexecutável.

## 2. Deriva de schema entre o construtor e as páginas existentes

Detalhado na regra 1 do `construtor.md`, repetido aqui porque é a armadilha mais provável: as páginas migradas usam
nomes de campo de uma versão anterior. Copiar o JSON delas produz schema antigo.

**Não confirmado:** se o renderizador aceita o formato legado indefinidamente ou se é compatibilidade
temporária. Se for temporária, o que já foi migrado precisa de segunda passada — e isso muda o
planejamento de forma significativa. Vale perguntar antes de migrar volume.

## 3. Valores sem toggle são silenciosamente ignorados

`padding.apply`, `margin.apply`, `spacing.enable`, `background.enable`, `dimensions.enable`,
`customize_borders.enable`, `flexBehavior.enable`.

Sem erro, sem aviso, sem efeito. Quando um espaçamento "não pega", é o primeiro lugar para olhar.

⚠️ **O inverso também existe, e engana mais:** há config que o renderizador ignora **mesmo com o
toggle ligado** — `dimensions.width` em qualquer bloco, e a seção `LAYOUT` **inteira** em bloco
`editor`. Se o toggle está `true` e ainda assim não pega, o segundo lugar para olhar é o item 13.

⚠️ **E há o terceiro caso: `0` não é `0`.** O tema lê vários números com `||`, então **todo valor
falsy cai no default** — `spaceBetween: slider_space_between || 5`. Consequência medida: deixar
`slider_space_between` em `null` dá **5px** de respiro entre produtos (a original tinha
`.owl-item{margin-right:10px}`), e escrever **`0` para "sem respiro" também devolve 5px**. Se você quer
o número da original, escreva o número (`10`); se quer zero de verdade, config não alcança — é regra de
página.

## 4. `midia` e as referências que não são URL

`imagem.midia`, `banner.banner_tipo`, `vitrine.vitrine`, `menu.menu`, `video.video`: todos são
**referências a registros cadastrados no admin**, não caminhos ou URLs.

✅ **Você quase sempre CONSEGUE esses ids — leia o campo `Blocos:` da página de origem.** Uma versão
anterior desta skill dizia que id de tipo/agrupamento "só existe no admin, o usuário seleciona no
painel" e mandava entregar vazio. **Está errado, e é a saída preguiçosa.** A página antiga guarda a
referência inteira no próprio JSON. Ordem de preferência:

**1. O JSON da página de origem (melhor — dá o MAPEAMENTO).** `Alterar` → aba `Configurações` → leia
com `lerBlocos()` (de `scripts/injetar.js`) → **saia por `Cancelar`**. Percorra a árvore e colete as
referências:

⚠️ A leitura **só vale em diálogo recém-aberto** (aí ele traz o que está salvo) e **só para leitura**. Para
*conferir uma gravação sua*, reabra antes de ler (`gravacao-construtor.md`, passo 5). E não pegue a
`textarea` por `document.querySelectorAll`: ele devolve em ordem de DOM, então entrega a do diálogo
**morto** quando outro diálogo continua no documento, e as referências lidas seriam as de outra página,
sem erro nenhum (`gravacao-construtor.md`, passo 2). `lerBlocos()` parte de `dialogoUnico()` e aborta se
houver dois diálogos.

```js
// diálogo recém-aberto da página de ORIGEM, aba Configurações.
// lerBlocos() parte de dialogoUnico(): aborta se houver 2 diálogos no DOM.
const doc = JSON.parse(lerBlocos());

const refs = [];
(function w(l){ (l||[]).forEach(b => { const c = b.config || {};
  if (b.type === 'vitrine') refs.push(['vitrine', c.vitrine?.vit_id, c.vitrine?.vit_codigo, b.device_show, c.origem, c.limit]);
  if (b.type === 'banner')  refs.push(['banner',  c.banner_tipo?.id, c.banner_tipo?.codigo, b.device_show, c.limit, c.modelo]);
  if (Array.isArray(b.child)) w(b.child); }); })(doc.block_list);
refs;   // ⚠️ projete os campos assim; devolver o objeto inteiro estoura o transporte
```

Se `dialogoUnico()` abortar, recarregue o admin e reabra só a origem.

Isso responde a pergunta que importa — **qual** vitrine/banner cada bloco usa — e nenhuma outra fonte
responde: a página renderizada não expõe o id (o servidor entrega a lista já resolvida).

**2. A grade do cadastro (dá o CATÁLOGO).** `Loja On-line → Vitrines` tem colunas `#`, `Código`,
`Nome`, `Página`; o `#` é o `vit_id`. Serve para conferir o que a origem devolveu, e para escolher
quando a página nova vai ter uma prateleira que a antiga não tinha. Filtre pela loja — a lista por
loja costuma ser curta (medido: 9 linhas numa loja), bem diferente da tela de Páginas, que numa conta
com várias lojas passava de 100 mil linhas.

**3. Entregar vazio e pedir para selecionar no painel.** Continua honesto, mas agora é o **último**
recurso — use quando a referência não existir na origem (bloco novo) e ninguém souber qual escolher.

Inventar id produz bloco que não renderiza e não diz por quê. Não vale.

⚠️ **O picker grava um objeto GORDO, não o mínimo do catálogo.** Lido de uma home real:
`vitrine` traz `loj_nome, loj_icon, loj_url, loj_id, vit_id, vit_tipo, vit_codigo, vit_nome, pagi_id,
pagi_loj_url, pagi_url, referencia_base_filter…`; `banner_tipo` traz `loja/icon, loja/url, loja/nome,
loja/id, id, codigo, nome, midiaTipo/nome, midiaTipo/id` — mais `$hashKey` e `row_index_grid`, que são
lixo do AngularJS e **não** devem ser gerados. **Não foi verificado se a forma mínima
(`{vit_id, vit_nome}` / `{id, nome}`) basta para renderizar.** Enquanto ninguém testar: copie da
origem o objeto sem as chaves `$hashKey`/`row_index_grid`, e confira renderizando.

Onde cada cadastro vive: `Loja On-line → Vitrines` · `→ Banners` e `→ Tipo de Banners` · `→ Menus` ·
`→ Vídeos`.

**Banner — a VARIANTE da imagem não é ajustável no nativo (testado):** `banner_tipo` é a fonte da verdade;
na entrega o servidor o resolve para uma `bannerlist` no **tamanho-base/master** do cadastro (ex.: 577×450)
e o `src` de cada slide já vem pronto do payload (`src: e.midia`). Cuidado com a pegadinha: escrever
`bannerlist` **à mão** (sem `banner_tipo`) parece certo — é o que se vê nas páginas prontas — mas o
pipeline a devolve **vazia** (carrossel em branco). Só renderiza o que sai do `banner_tipo`. Logo, se você
precisa de um recorte que o master não tem (medido: a original serve `...-1360x800.jpg` no mobile e a nova
serve o `master`), o banner nativo **não alcança** — a saída é um bloco `code` com carrossel em CSS puro
(sem `<script>`, que não roda em `code`). `loading="lazy"` também não tem saída por config: o componente
nunca passa `loading` ao `<img>`. Detalhe e exemplo em `blocos.md` (seção banner).

⚠️ **Correção: `apply_aspect_ratio` NÃO é descartado — ele reserva o espaço do slide.** Uma versão
anterior desta skill listava `apply_aspect_ratio` junto de `midia_size`/`owl` como campo jogado fora na
entrega. Está errado, e o efeito de acreditar nisso é **CLS**: o banner nasce com altura 0 e empurra a
página quando a imagem chega. O componente faz (lido no `app.js`, offset ~1.209.568):

```js
s = i?.apply_aspect_ratio, o = Number(i?.width), l = Number(i?.height),
c = o && l ? `${o}/${l}` : void 0
... jsx(tm.I, {style: s ? {width:"100%", height:"auto", aspectRatio: c} : void 0, ...})
```

Ou seja: **`apply_aspect_ratio: true` MAIS `width`/`height` preenchidos** (`Number()` aceita string:
`"3840"` serve; `use_custom_size` não é necessário) e cada slide sai com
`style="width:100%;height:auto;aspect-ratio:W/H"` — que é o que a original fazia com
`<div class="ar ar-3840-935">` e padding-top percentual. Sem `width`/`height` numéricos o `aspect-ratio`
vira `undefined`, o `style` sai sem ele, e daí a conclusão errada de que o campo era ignorado. Verificado
no HTML entregue: 4 slides com `aspect-ratio:3840/935` no desktop e 4 com `aspect-ratio:1360/800` no
mobile. Proporções medidas: o tipo de banner do desktop tinha master 3840×935; o do mobile, 1360×800
(dois tipos cadastrados, um por raiz).

## 4b. `parentId`, `only_desktop` e `only_mobile` são resíduo

Aparecem em páginas antigas e não devem ser gerados.

`parentId`: numa página medida, 16 blocos o tinham e **nenhum** apontava para o pai real na árvore —
zero de dezesseis coerentes. Gerar um `parentId` "correto" não ajuda e cria a ilusão de que a hierarquia
depende dele; ela depende de `child`.

⚠️ **Correção: o renderizador não "ignora" — ele SOBRESCREVE.** Ao descer na árvore ele faz
`parentId && (t = {...t, parentId})` com o id do pai **real**, então o que você escrever em bloco filho é
substituído. E existe **exatamente um consumidor** em todo o tema: a `vitrine` sem produtos dispara
`ON_ACCORDION_CONTENT_ERROR-<parentId>` e o `accordion` pai **se apaga inteiro** (ver `blocos.md`, seção
`accordion`). A instrução prática não muda — não gere o campo —, mas o motivo é outro, e o efeito
colateral é real.

`only_desktop` / `only_mobile`: geração anterior do controle de device, `false` em todos os blocos onde
apareciam. Hoje é `device_show`.

## 5. `Aplicar` não salva

Custa uma sessão de trabalho perdida quando alguém descobre do jeito errado. `Aplicar` é client-side;
`Confirmar` no diálogo `Alterar Página` é que grava. Detalhes em `gravacao-construtor.md`.

O lado bom: `Aplicar` é seguro para experimentar à vontade.

## 6. `fetch()` mente sobre página despublicada

Ler a URL com `fetch()` de dentro do próprio site devolve um shell genérico, sem `pageParams`, com
tamanho idêntico para páginas diferentes. Parece que a página está vazia.

Navegue a aba de verdade e leia `window.__NEXT_DATA__`.

## 6b. Página despublicada NÃO renderiza — e isso colide com a regra de não publicar

⚠️ **Correção de uma versão anterior desta skill**, que dizia "páginas despublicadas respondem na URL
pública com conteúdo quando navegadas — servem bem como rascunho visível". **Não servem.**

Medido em 2026-08-10 no site novo de uma loja (`novo.SUA-LOJA.com.br` — o host do site novo varia por
loja; o seu fica no perfil), com par de controle:

| Página | `Publicada` | Resposta |
|---|---|---|
| uma home `-v2` publicada | Sim | renderiza, `pageParams.layout` completo |
| o clone dela (`…-log-NNNNNN`) | Não | **"Página não mapeada - @todo: 404"**, `pageParams` = `{}` |
| `/prazos-v2` (antes de publicar) | Não | idem |
| `/prazos-v2` (depois) | Sim | renderiza |

E o mais importante: **o preview dentro do próprio construtor passa pela mesma rota e mostra o mesmo
404.** Não existe caminho de visualização que contorne isso.

**A consequência é de processo, não técnica.** O `construtor.md` manda verificar renderizando (passos
6 e 7) e a regra zero proíbe `Publicar` sem pedido explícito — e as duas coisas não cabem juntas numa
página nova.
Então: **combine a publicação do rascunho no começo da tarefa**, junto com a página alvo, não depois
de gravar. Argumentos para a conversa: publicar afeta só o domínio configurado na página (o campo
`URL:` do diálogo diz qual), a coluna `Robots` costuma ser `noindex, nofollow`, e `Página no Sitemap`
costuma ser `Não`. Confira os três **antes** de propor.

Se a pessoa não quiser publicar, diga na entrega que a verificação medida não foi feita — e o que
ficou sem cobertura é justamente o item 13, que não tem sintoma no JSON.

## 7. Quem protege o rascunho é o cadastro da página, não o subdomínio

⚠️ **Correção de uma versão anterior desta skill**, que afirmava existir um header
`x-robots-tag: noindex, nofollow, noarchive, nosnippet, noai, noimageai` aplicado ao subdomínio de
preview inteiro. **Não existe.** Medido em 2026-08-10:

```bash
curl -sI https://novo.SUA-LOJA.com.br/prazos-v2 | grep -i x-robots   # nada
curl -sI https://www.SUA-LOJA.com.br/prazos     | grep -i x-robots   # nada
```

O que protege de fato é o campo **`Robots` do cadastro da página**, visível como coluna na grade
`Páginas`. Rascunho/clone costuma vir `noindex, nofollow`; página de produção vem `index, follow`.
Some-se a coluna `Página no Sitemap`.

Consequência prática: **antes de publicar um rascunho, confira a coluna `Robots` da linha.** Não
assuma que estar no subdomínio novo basta — não basta. E se a linha disser `index, follow`, você está
olhando para uma página de produção (ver item 10b).

## 8. Duas pessoas no mesmo construtor se sobrescrevem

Não há lock nem aviso de edição concorrente. Antes de abrir uma página que está no fluxo de trabalho de
alguém, pergunte. E antes de gravar numa página, pergunte se alguém está com o `Alterar` (ou o construtor)
dela aberto: o `Confirmar` de lá envia o que o diálogo carregou na abertura (`getDataSubmit()` devolve
`$scope.data`, `gravacao-construtor.md`) e desfaz a sua gravação, sem aviso. A comparação com o backup logo
antes de gravar (`construtor.md`, seção 0) pega quem gravou depois da sua leitura; quem ainda está com o
diálogo aberto, só a pergunta pega.

Para experimentar, use a página de rascunho combinada com a pessoa. Se ela quiser uma cópia, quem clona é
ela (ou ela pede com essas palavras): clonar cria uma página nova em produção, com URL `<slug>-log-<número>`
(item 10b).

## 9. CSS de página viaja duas vezes

O campo `style` aparece na tag `<style>` **e** dentro do `__NEXT_DATA__`, que carrega a definição
completa da página para o navegador. O mesmo vale para o HTML dentro de blocos `code`: renderizado no
DOM e repetido no JSON.

Numa home `-v2` medida: 16.292 caracteres de HTML cru em blocos `code` e 8.324 de CSS de página — cada
um pagando o dobro em toda visita. É o argumento quantitativo para preferir config nativa.

## 9b. ⚠️ `grep` no HTML cru diz que o texto existe quando ele NÃO está no DOM

Consequência direta do item 9, e ela **inverteu um diagnóstico inteiro**: como o `__NEXT_DATA__`
carrega a definição completa da página, **todo texto de bloco `editor`/`code` aparece no HTML cru mesmo
quando o DOM não o renderiza**. Foi assim que as 8 respostas do FAQ pareceram presentes: o `grep` achava
as 2.192 chars dentro do JSON do `<script>`, e no DOM não havia nenhuma (item 18a).

Regra: para medir **texto entregue**, extraia o texto do DOM **excluindo `<script>`, `<style>`,
`<template>` e `<noscript>`** — nunca `grep` no arquivo. É o que o `verificar_paridade.py` faz hoje
(`texto_plano()`), e o que ele **não** fazia quando produziu o falso positivo.

Duas pegadinhas menores da mesma família, ambas medidas:

- **Comentário HTML conta como texto** se você usar `find_all(string=True)` no BeautifulSoup: `Comment`
  herda de `NavigableString`, então `<!--CODIGO MODIFICADO-->` da original entrou na contagem e gerou
  falso positivo **no conserto do próprio script**. Filtre por `type(s) is NavigableString`.
- **Contar elementos-folha compara aninhamento, não conteúdo.** Twig e React aninham diferente, e a
  comparação por `Counter` de folhas dava **17 falsos positivos por device**. A métrica que sobreviveu é
  **cobertura por shingles de 6 palavras** sobre o texto corrido do container — ver item 21.

## 10. `Fragmentos` e `Modelos` existem e são pouco explorados

Na tela `Criar`, ao lado de `Componentes`:

- **`Fragmentos`** — esqueletos de grid prontos. Na conta medida eram dois, com medidas marcadas.
- **`Modelos`** — páginas completas. Na conta medida eram dois, sendo um a home inteira de uma das
  lojas da conta. Confira o que aparece na sua.

**Pergunta em aberto, de alto valor:** dá para **criar** Fragmentos e Modelos novos? Se sim, muda a
estratégia da migração — uma biblioteca de Fragmentos para as seções recorrentes resolveria a
duplicação de markup e CSS de forma nativa, **sem ninguém precisar mexer no tema**. E um Modelo por
arquétipo faria cada página começar montada em vez de em branco.

Antes de propor promover CSS ao tema, verifique esta pergunta, e também com quem o tema é
compartilhado: numa conta com várias lojas no mesmo admin, o tema pode valer para todas elas, e mexer
nele afeta sites que não são o alvo do trabalho. Os arquivos do tema (de qualquer família) são da Panorama e
não são seus para editar.

## 11. Nomes de tipo não seguem padrão

`imagem` e `vitrine` em português; `code`, `menu`, `video`, `newsletter` em inglês; `storerating`
colado; `sidebar-menu` com hífen. Não há regra — consulte `blocos.md` em vez de deduzir.

## 10b. O clone e a original aparecem lado a lado na busca — e o clone é o de baixo

Clonar uma página gera slug no padrão **`<slug-original>-log-<numero>`** (ex.: a cópia de
`/formas-de-pagamento` vira `/formas-de-pagamento-log-NNNNNN`). Consequência que morde:
**o slug do clone contém o slug da original**, então qualquer busca por URL devolve **as duas**, em
linhas vizinhas. Confirmado ao vivo (números trocados por marcadores):

```
NNNNNN  Formas de Pagamento V2  /formas-de-pagamento-log-NNNNNN   Sitemap:Não  noindex, nofollow
MMMMMM  Formas de Pagamento     /formas-de-pagamento              Sitemap:Sim  index, follow
```

Errar a linha por um pixel grava na página **publicada e indexada** do site. Três formas de distinguir,
em ordem de confiabilidade:

1. **o `#`** — único, não se repete. É por ele que você identifica (e `conferirAlvo(numero)` valida).
2. **a coluna `Robots`** — a original de produção é `index, follow`; rascunho/clone costuma ser
   `noindex, nofollow`. Boa checagem de sanidade: **se a linha diz `index, follow`, não grave nela.** Ela
   serve para escolher o rascunho de uma migração. Quando a pessoa nomeou a página no ar como alvo (uma
   edição pontual, `construtor.md` seção 7, ou a versão aprovada indo para a original, o passo 9 de lá),
   o `#` que ela nomeou decide, e `index, follow` é o esperado.
3. o nome (`… V2`) e a coluna `Página no Sitemap` (`Sim` na original).

Note também que **estar `Publicada: Sim` não quer dizer que é a página real** — o clone também está
publicado, só que fora do índice. Não use "Publicada" para decidir onde gravar.

## 11a. Metade do que você vê na página antiga é do TEMA, não da página

Ao ler o HTML renderizado de uma página antiga, você vê seções que **não pertencem à página** —
cabeçalho, menu, rodapé, newsletter ("Fique por dentro das melhores ofertas"), bloco de ajuda
("Precisa de ajuda?"), selos de pagamento do rodapé. O tema já renderiza tudo isso em toda página.
Reconstruir no `block_list` **duplica**: a seção aparece duas vezes no site novo.

Medido na `/formas-de-pagamento`: das 14 imagens da página, **1** era da página; as outras 13 eram
tema. E as duas seções de maior destaque visual no fim da página (newsletter e ajuda) eram as duas
do rodapé.

⚠️ **Correção de uma versão anterior desta skill**, que mandava separar por `.builder-block` e dizia
"só é da página o que está dentro de `.builder-block`". A regra de separar tema de página continua
certa; **o seletor estava errado e perde blocos**. Medido na home antiga de uma loja:

| Seletor | Blocos encontrados |
|---|---|
| `.builder-block` | **40** |
| `#area-body [id^=block-]` | **70** |

Os 30 que faltavam: blocos de tipo **`code`, `imagem`, `vitrine` e `editor` não recebem a classe
`builder-block`** — recebem `block-imagem-container`, `block-vitrine-container`, ou classe nenhuma.
Lendo por `.builder-block` eu perdi uma faixa de etiquetas inteira da home e não notei.

⚠️ **O `editor` entrou nessa lista em 2026-08-11 e é o que engana mais**, porque uma página
institucional é feita dele: na `/politica-de-privacidade`, que **não tem nenhum `code`, `imagem` nem
`vitrine`**, `.builder-block` deu **24** contra **30** de `[id^=block-]`. Os 6 que faltam são
exatamente os 6 `editor` — a folha de cada seção, `<div id="block-…-container" class="font-escura">`,
sem a classe. Ou seja: **o seletor errado perde blocos até numa página que só tem texto.**

### ⭐ Bônus grande: a CONFIG de cada bloco da origem está no HTML público

O construtor twig emite, dentro de `#area-body`, **um `<style>` por bloco que tem config**, com
`data-block` no próprio `<style>` e o CSS daquele bloco. Na `/politica-de-privacidade` são **13**:

```html
<div data-block="Titulo inicial - Política de Privacidade" class="builder-block container-fluid"
     id="block-a1b2c3d4-container">
  <style data-block="Titulo inicial - Política de Privacidade">
  #block-a1b2c3d4-container{ background-color: #RRGGBB; position: initial; }
  </style>
```

Foi de lá que saíram os fundos das 6 faixas (a cor primária da loja medida, `null`,
`#f3f3f3`, ausente, `#f3f3f3`, ausente) e os `padding-top/bottom: 50px` dos editores — **sem abrir o
admin**. Duas leituras úteis:

- `background-color: null` sai literalmente assim quando o bloco não tem fundo: é declaração
  inválida, o navegador descarta. Não confunda com fundo branco explícito.
- bloco sem `<style>` nenhum = **toda a config no default**.

⚠️ Isto **dispensa a etapa mais arriscada do fluxo**. O passo 1 do `construtor.md` manda ler o CSS de página
no primeiro `<style>` do documento (correto, são as regras do campo `style`) e, para o resto, abrir o
diálogo `Alterar` da página **publicada e indexada** só para ler. Para config de bloco, não precisa:

```python
area = BeautifulSoup(html, "html.parser").select_one("#area-body")
for st in area.find_all("style"):
    print(st.get("data-block"), re.sub(r"\s+", " ", st.get_text()).strip())
```

O que continua **só** no admin é a referência de cadastro (`vitrine.vit_id`, `banner_tipo.id`) —
item 4.

Seleção correta, e o nível vem de contar ancestrais com `id` começando em `block-`:

```js
const blocos = [...document.querySelectorAll('#area-body [id^=block-]')].map(el => {
  let n = 0, p = el.parentElement;
  while (p) { if (p.id && p.id.startsWith('block-')) n++; p = p.parentElement; }
  return { id: el.id, nivel: n, nome: el.dataset.block, tag: el.tagName, cls: el.className };
});
```

✅ **Bônus: o atributo `data-block` traz o NOME do bloco na origem** (ex.: `"Trio de ofertas (Grid
6.3.3)"`, `"Coluna 8 de 12"`). Reaproveite no campo `name` da árvore nova — sai de graça e a página fica
navegável no construtor.

Para descartar o tema, o teste de ancestral continua valendo — só troque a condição de "é da página":

```js
// true = pertence à página; 'tema' = header/footer; false = nem um nem outro
function daPagina(el){ let e=el; while(e){ if(e.id && e.id.startsWith('block-')) return true;
  if(e.tagName==='FOOTER'||e.tagName==='HEADER') return 'tema'; e=e.parentElement; } return false; }
```

Confirme também na página nova (que já tem o tema aplicado) se a seção aparece sozinha — se aparecer,
não a recrie.

## 11b. `.container` tem larguras diferentes nos dois sites (e a diferença troca de sinal)

O mesmo nome de classe se comporta diferente nos dois sites, e **não é só "o novo é mais estreito"** —
depende da viewport:

| | Site antigo | Site novo |
|---|---|---|
| `.container` | **1200px fixo** (medido a 1536 e a 1707 de viewport) | Bootstrap 5 responsivo, degraus **540 / 720 / 960 / 1140 / 1320** |

Ou seja: numa viewport de 830px o novo dá 720px (mais **estreito** que a original); num desktop largo
ele vai a 1320px (mais **largo** que os 1200 da original). Reusar `class:"container"` sem mais nada
erra nos dois extremos, em direções opostas.

**A correção que funciona** (medida, resultado a 1px da original): use as classes do tema para a
estrutura — `container-fluid` na faixa, `container` no miolo, `row`, `col-sm-*` — e trave a largura com
uma regra de página escopada pelo `body_class`:

```css
.SEU-BODY-CLASS .container{max-width:1200px}
```

São cerca de 40 caracteres (41 na página medida, com a classe dela), e a especificidade `(0,2,0)`
vence o `.container` do tema `(0,1,0)` independente da ordem em que as folhas entram. Não tente resolver por `dimensions.width` — ele é ignorado (ver item 13).

`.container-fluid` tem `max-width:none` e **fura** o teto de 1320px que o renderizador impõe a todo
bloco; é ele que faz a faixa de fundo ir de ponta a ponta.

Meça as duas páginas na **mesma** viewport antes de concluir.

## 11c. O tema novo deforma `<p>`, `<h2>`, `<h3>`, `<ol>`, `<li>` **e `<a>`** — e a raiz é o `body`

Texto dentro de bloco `editor`/`code` **sem estilo explícito** sai diferente do site antigo. Medido no
tema em 2026-08-10, contra a página `/prazos` de uma loja (os números da original variam por página e
por loja — meça a sua; as cores de link e de destaque são as da loja medida):

| | Tema do site novo | Original |
|---|---|---|
| `<p>` | **22,4px** / lh 33,6px / cor `#212529` | 16,8px / lh 25,2px / cor `#292b2c`, `margin-bottom:16px` |
| `<h2>` | 32px / lh **38,4px** / peso **500** / cor `#212529` | 32px / lh 35,2px / peso **600** / `margin-bottom:8px` |
| `<h3>` | 28px / lh **33,6px** / peso 500 / `#212529` | 28px / lh **30,8px** / peso 500 / `#292b2c` |
| `<ol>` / `<ul>` | `padding-left: 2rem` = **32px** | **40px** (default do navegador, ninguém reseta) |
| `<li>` | **16px** / lh 24px / `#212529` | **12px** / lh 18px / `#292b2c` |
| `<a>` | a cor primária da loja medida, **`text-decoration: underline`** | mesma cor, **sem sublinhado** |

### ⭐ A raiz de tudo: o `body` dos dois sites tem tamanho e cor DIFERENTES

Isto explica a tabela inteira e é o que faltava. Medido nas folhas que cada site carrega:

| | `font-size` | `line-height` | `color` |
|---|---|---|---|
| original (`platform.css`, `body`) | **12px** | 1.5 | `#292b2c` |
| tema novo (`--bs-body-font-size`) | **1rem = 16px** | 1.5 | `#212529` |

Duas consequências que decidem método:

- **A regra `p{font-size:1.4em}` é a MESMA nos dois sites** — ela não vem do Bootstrap de nenhum dos
  dois, vem do `loja.css` da loja medida (família `/dist`), que era **o mesmo arquivo de ~27 KB** servido
  nas duas pontas (inline no `<style>` do site antigo, em `/api/loja.css` no novo; não é o
  `/dist/css/loja.<hash>.css` do tema). Confira o da sua loja: a regra pode estar lá ou não. Então o
  `<p>` não muda porque a regra mudou; muda porque `1.4em` de 12px é 16,8px e de 16px é **22,4px**. É
  por isso que definir tamanho num ancestral **piora** em vez de corrigir.
- ⚠️ **`<li>` é o pior dos casos e não estava nesta lista:** não existe regra de `li` em **nenhum**
  dos dois temas, então ele herda o `body` puro — **toda lista migra de 12px para 16px, 33% maior**.
  Numa página institucional com lista (prazos, direitos do titular, passo a passo) isso é visível e
  não tem sintoma no JSON. Os dois scripts da skill cobram `li` e `td` desde 2026-08-11.

### ⚠️ A COR do link não sai do CSS — meça

Custou uma gravação inteira em 2026-08-11. Na loja medida (família `/dist`), `platform.css` **e**
`loja.css` declaravam `a{color:#e23b40}` e nada que dê para achar por `grep` sobrescreve — mas o
**computado** da original era **a cor primária da loja**, a `--primary-color` dela (cada loja tem a
sua). Gravei a página com o link **vermelho**, e só peguei no passo 7b comparando `getComputedStyle` nas
duas páginas.

É o item 23 com outro rosto, e o mais traiçoeiro dele: aqui a folha **existe**, eu **achei** a regra,
e ela mesmo assim não é o que vale. Regra prática: **para cor, a derivação por arquivo não conta como
medição** — abra as duas páginas e leia `getComputedStyle(a).color`.

⚠️ **O `<a>` é o que mais escapa.** A cor bate sozinha, então o link "parece certo" — e sai sublinhado
em toda a página migrada. Ponha `text-decoration:none` explícito em cada link.

⚠️ **A medida do `<h2>` mudou desde a versão anterior desta skill** (que dizia 28,7px). O peso 500
continua valendo. É a segunda vez que um número deste bloco envelhece: **meça, não copie a tabela.**

⚠️ **A regra do `<p>` é `font-size:1.4em`, não `1.4rem`.** Isso muda a correção por completo: como é
relativa ao pai, **definir `font-size` num ancestral não resolve — piora**. Um `<td>` com
`font-size:16.8px` produz `<p>` a **23,52px** (16,8 × 1,4). O tamanho tem de estar **no próprio `<p>`**.

Correção: fixe `font-size`, `line-height`, cor e margens **em cada `<h2>` e cada `<p>`** do HTML do
bloco, inclusive nos que estão dentro de `<table>` — é justamente lá que se esquece.

Não confie em número decorado: **meça a original**. (A versão anterior desta armadilha dizia "13px no
desktop" — na `/formas-de-pagamento` o corpo é 16,8px. O valor varia por página.)

⚠️ **O que mais escapa é o elemento que você NÃO converteu.** Na faixa de etiquetas da home eu
estilizei só o que era `<h1>` e deixei os outros 3 rótulos herdarem o tema. Medido: os `<p>` saíram a
**22,4px** (a regra relativa `p{font-size:1.4em}`) e os `<a>` a **16px na cor primária da loja**,
contra o que a original tem de fato — `<p>` **14px / lh 21px / peso 600 / `#777`** e o `<h1>` da faixa
**14,4px / lh 20px / peso 600 / `#777`**. Regra prática: em bloco `editor`/`code`, **todo** elemento de texto precisa
de `font-size`, `line-height`, `font-weight`, `color` e — em `<a>` — `text-decoration` explícitos,
inclusive os que você não mexeu.

⚠️ **`line-height` é o número que se esquece depois de acertar o `font-size`.** A 1ª versão da faixa
pôs `line-height: 20px` nos `<p>` (o valor do `<h1>`, que é 14,4px) quando o medido no `<p>` da original
é **21px**. Meça os dois valores em cada elemento, não só o tamanho.

## 11d. ⭐ O site ANTIGO é Bootstrap **4**, não 3 — então `margin:auto` numa coluna CENTRALIZA

Descoberto em 2026-08-12 migrando uma página institucional (`/uma-institucional`) de uma loja, e por pouco não gravou um defeito
invisível. Baixando a folha do tema antigo da plataforma que a própria original linka (no caso medido,
`panoverse-cdn.com.br/css/platform.<hash>.css`, **365.731 chars** — o hash do nome muda a cada build;
pegue o link do `<head>` da sua página). É a camada da plataforma: em outubro de 2026 o mesmo arquivo, com o
mesmo hash, servia as duas famílias de tema medidas (`SKILL.md`, "Família do tema"):

```css
.row      { display:flex; flex-wrap:wrap; margin-right:-10px; margin-left:-10px }   /* offset 12916 */
@media (min-width:576px){ .col-sm-6 { flex:0 0 50%; max-width:50% } }               /* offset 18613 */
```

Há `col-xl-*`, que o Bootstrap 3 não tem, e o HTML da origem os usa. **A `.row` do site antigo já é
flex**, e as colunas dele já são itens flex.

### A consequência que morde: CSS da origem em classe de coluna tem efeito de FLEX

A `/uma-institucional` medida tinha `.titulo{margin:auto}` no CSS de página (classes criadas pela loja),
aplicado numa `<div class="builder-block col-sm-6 titulo font-clara">`. Lendo isso como Bootstrap 3 (float), a
conclusão natural é "`margin:auto` aí é inerte". **É o contrário:** em item flex, `margin:auto` no eixo
cruzado cancela o `stretch` e reparte a folga. Medido na original:

| | medido |
|---|---|
| `getComputedStyle(coluna).marginTop` / `marginBottom` | **152px** / **152px** (resolvidos, não "auto") |
| `coluna.top - row.top` / `row.bottom - coluna.bottom` | **152** / **152** |
| altura da linha / da coluna de texto | 580 / 276 |

Ou seja: o texto é **centralizado verticalmente** ao lado da imagem quadrada. Reproduzindo com o
`alignItems: "flex-start"` que é o default do construtor, o `<h1>` nasce **152px acima** do lugar e
sobram **304px de faixa colorida vazia** embaixo.

⚠️ **E nada denuncia.** A altura da faixa é **580 nos dois casos** (`max(276, 580)`, mandada pela
coluna da imagem), então toda a aritmética de padding fecha, o `validar_pagina.py` passa, e o
`verificar_paridade.py` dá **100,0% de cobertura de texto** — a folga só *mudou de lugar*. Quem pega é
comparar a posição, não o tamanho, ou o screenshot lado a lado.

**A correção**, e ela é config, não CSS: `display.alignItems: "center"` no bloco da `row`. É valor de
painel, e é seguro **quando a outra coluna tem exatamente a altura da linha** (aqui a da imagem tem
580 = 580, e medi `coluna.top - row.top === 0` antes e depois). Se as duas colunas forem mais baixas
que a linha, `center` move as duas — aí o equivalente fiel é `margin` com `top`/`bottom` em `"auto"`
na coluna, lembrando de preencher os quatro lados (`right`/`left` em `"0px"`).

### O que mais muda por ser BS4

- ✅ **O breakpoint `sm` é 576px nas DUAS pontas** (BS4 antigo, BS5 novo), então `col-sm-*` mapeia
  1:1 e **não existe** a faixa de divergência 576–767 que se supõe ao assumir BS3 (onde `sm` = 768).
  Uma preocupação a menos — mas note que ela é substituída pela do item **17**: o tema novo troca de
  árvore em `width <= 992`, e é essa a faixa que invalida comparação.
- O gutter é **10px** e a margem negativa da `.row` é **-10px** nessa folha, que é exatamente o par
  que as receitas de grid de `blocos.md` esperam.
- **Onde vive o padding lateral da coluna muda de lugar entre as duas versões**, e é o motivo de a
  terceira receita de grid existir (ver `blocos.md`). No BS4 antigo ele está na **regra-base que lista
  todas as classes de coluna** — `.col-sm-1,…,.col-xl-12{position:relative;width:100%;min-height:1px;
  padding-right:10px;padding-left:10px}`, offset 14020 da folha, e ela **inclui** `.col-sm-6`. No BS5
  do tema novo ele está em **`.row > *`**. Consequência prática: no site antigo uma coluna **fora** de
  uma `.row` ainda recebe os 10px; no tema novo, **não recebe nada** — é o que libera a receita 3.
  (⚠️ Não confunda com `.no-gutters > [class*=col-]{padding:0}`, que existe na mesma folha, é do
  próprio Bootstrap e **está escopado** em `.no-gutters` — grep desatento lê isso como "o tema zera o
  padding da coluna" e conclui que os 10px medidos vêm de outro lugar.)

**Regra prática:** antes de montar, leia o CSS de página da origem procurando `margin:auto`,
`align-self`, `align-items`, `justify-content` e `order` em classes que caem em coluna ou em linha.
No BS4 elas têm efeito de flex. E **meça a POSIÇÃO** (`rect.top - pai.top`), não só a altura: defeito
de alinhamento vertical não aparece em nenhuma soma de padding.

## 12. Escopo real, para calibrar expectativa

Numa loja medida, filtro `Loja = <a loja>` + `Tipo = Construtor`: **81 páginas**. As `-v2` visíveis
lá estavam **em migração, não finalizadas** — a composição delas (25% a 100% de blocos `code` em
alguns casos) podia ser andaime, não resultado pretendido. Na sua loja o número e o estado serão
outros; a lição é a mesma.

Não trate as páginas existentes como referência de qualidade nem de método. Pergunte ao time qual é o
estado pretendido antes de imitar o que está lá.

**Tamanho de uma página grande, medido.** A home de uma loja foi reproduzida por inteiro numa página
de rascunho:
**234 blocos em 2 raízes**, JSON compacto de **293.469 chars**, entregando **119 blocos no desktop** e
**115 no mobile**. Deu certo, e ainda assim **8 defeitos passaram pela verificação manual** — 4 deles o
usuário achou só olhando a tela.

⚠️ **A mesma home aparece com DUAS contagens nesta skill, e as duas estão certas** — não "arredonde" uma
para a outra. `234 → 119/115` é a versão com o FAQ em `accordion` nativo (8 `accordion` + 8 `editor` por
raiz). Depois da troca por `<details>` (item 18a) os 8 `accordion` de cada raiz saíram e a página ficou
com **218 blocos gravados → 111 entregues no desktop e 107 no mobile** (recontado no JSON e nos dois
HTML entregues). Quando cruzar números entre arquivos, confira **de qual versão** o número é: as
contagens por tipo do desktop final são `block 63 · editor 29 · imagem 13 · vitrine 4 · banner 1 ·
code 1`. Use isso para calibrar prazo: o trabalho não termina na gravação, e a
verificação da home custou mais que a montagem. Ver item 21.

## 13. O renderizador ignora parte da config — e o JSON entregue não denuncia

A armadilha mais cara da lista, porque **não há sintoma no JSON**: você lê `pageParams.layout` e a
config está lá, correta, com o toggle ligado. O DOM simplesmente não a aplica. Só aparece comparando
`getComputedStyle` com a original. Os casos medidos até hoje — trate como amostra, não como fronteira;
a lista cresceu em cada sessão que mediu de verdade:

| Config | O que acontece | O que fazer |
|---|---|---|
| `dimensions.width` / `dimensions.enable` | **Ignorado.** O renderizador impõe `width` e `max-width` em **todo** bloco, via a classe que ele mesmo gera | Largura e grid saem das classes do tema (`container-fluid` / `container` / `row` / `col-sm-*`), nunca de `dimensions` |
| `display.type` num bloco com `class:"row"` | A classe gerada por bloco **sobrescreve** o `display:flex` do `.row` do tema. Com o default `"block"`, as colunas **empilham** | Bloco com `class:"row"` **precisa** de `display.type:"flex"` (e `flex_wrap:true`) explícito |
| **`margin: 0 -12px` do `.row` do tema** | **Não expande a linha.** A classe gerada aplica `max-width:100%`, que impede o transbordo: a `.row` fica com o content box do pai (1176 em vez de 1200) e **toda coluna encolhe 24px** | **TRÊS** receitas medidas em `blocos.md` (seção de grid). Para texto em coluna única, a terceira **dispensa a `.row`** e fecha em 0px com 1 regra de página. Com grid de verdade: se o `.container` do tema serve, zere o `padding` dele e a `margin` da `.row` por config e devolva o gutter no `padding` lateral das colunas; se a original **trava** a largura, mantenha o padding e devolva a margem negativa por regra de página (`max-width:none; margin:0 -gutter` na `.row`) — zerar a margem nesse caso perde 5px por coluna |
| **a seção `LAYOUT` INTEIRA em bloco `editor`** | **Ignorada** — não é só o `padding`. O renderizador do `editor` faz `{...t, className: config.class}` e **sobrescreve** a classe gerada, aquela que carrega todo o CSS da config. Contado no HTML entregue: **0 de 29** blocos `editor` têm a classe de layout, contra **126** ocorrências dela na página. Logo `padding`, `margin`, `background`, `border`, `overflow`, `dimensions` e `display.type` não fazem nada ali. Em `code` aplicam | Espaçamento, fundo e borda de texto vão no bloco `block` que **envolve** o `editor`. Tabela `editor` × `code` em `blocos.md`, seção `editor · code` |
| `padding` / `margin` numa `col-sm-*` | **Substitui** o do tema, não soma: preencher só `top`/`bottom` **apaga os 12px laterais** e o texto cola na borda. ⚠️ E esses 12px vêm de **`.row > *`**, não da classe `col-*` (o tema novo é Bootstrap 5) — logo coluna **fora** de uma `.row` já nasce sem padding nenhum, e você tem de pôr o gutter por config de todo jeito | Repita o lateral que você quer em `right`/`left` toda vez que ligar `padding.apply` |
| `margin` em bloco **`imagem`** | ⚠️ **Pior que ignorada: aplicada no lugar errado.** Cai no `<img>` (não há wrapper) e, com `apply_aspect_ratio`, **distorce a imagem** | Nunca ponha `margin` em bloco `imagem`. Espaçamento de imagens empilhadas vai no `display.gap` da **coluna**. Ver item 14 |
| `flexBehavior` em bloco **`code`** | **Ignorado**, mesmo com `enable:true, flex_grow:1`: o wrapper sai com `flex-grow: 0`. Dentro de pai `flex; justify-content:center` o bloco **encolhe para o tamanho do conteúdo** — medido: faixa de **757px** num `.container` de **1200**, itens de 174 em vez de 280 | **Ponha o PAI em `display:block`.** Aí o wrapper do `code` é filho de bloco e ocupa 100% naturalmente — resultado medido: faixa 1180, itens 280, passo 300, os números da original. Ver item 22f |

Isto reduz o alcance da regra "prefira configuração de bloco a CSS" (regra 2 do `construtor.md`): ela vale para
fundo, espaçamento interno, direção e alinhamento — **não** para largura, grid e padding de texto.

Sintoma clássico: a página renderiza com o conteúdo certo, mas tudo empilhado, sem centralizar, e a
faixa de fundo parando antes da borda. Antes de reescrever o JSON, **inspecione a cadeia de pais no
DOM** e compare `width`/`max-width`/`display` computados com o que você mandou.

## 14. O bloco `imagem` não tem wrapper próprio — e isso causa três defeitos

Lido no bundle do tema (`_app.js`), o componente renderiza
`<a class="pano-link-anchor"><img style="width:100%;height:100%">` — **sem criar `div` de wrapper**, e
com `alt: e.id || ""` cravado. Três consequências medidas, todas na mesma sessão:

1. **Como item flex, o `<a>` não estica e COLAPSA.** A moldura de categoria fechou em **0×0** e a
   imagem do promo ficou em **250px dentro de uma metade de 600px**. Correção: `display.type: "block"`
   no bloco que envolve, **mais** a regra escopada do item 0.
2. **`margin` no bloco cai no `<img>` e distorce em vez de espaçar** — com `apply_aspect_ratio` ela
   infla a âncora (medido: **278px** onde o correto era **268**) e não sobra espaço nenhum entre as
   imagens. Espaçamento de imagens empilhadas vai no `display.gap` do bloco da **coluna**.
3. **O `alt` sai como o id do bloco** (por exemplo, `alt="a1b2c3d4"`) e **não existe campo de alt na config** — não
   invente um. É pedido para o time do tema; registre como pendência de acessibilidade na entrega.

Os números completos, o trecho do bundle e os detalhes de recorte e do CDN de imagens da plataforma estão em
`blocos.md`, na seção do bloco `imagem`.

⚠️ Sintoma do caso 2 que é fácil desprezar: **duas imagens irmãs com a mesma config medindo diferente**
(278 e 268). Se ver isso, não escreva "estranho" e siga — é a imagem esticada. Ver item 21, ponto 4.

## 15. Vitrine: o servidor RENOMEIA campos na entrega

O nome que você grava não é o nome que volta. Verificado gravando e relendo:

| Você grava | O servidor entrega |
|---|---|
| `owl` | `itemsPerSlide` |
| `grid` | `itemsPerGridRow` |

Gravei `grid: {desktop:"6", mobile:"2"}` e o entregue trouxe `itemsPerGridRow: {desktop:6, mobile:2}`.

Três pegadinhas em cima disso:

- ⚠️ **Escrever `itemsPerGridRow` direto é errado** — é o nome de **saída**, e o
  `scripts/validar_pagina.py` o marca como campo legado, corretamente. Grave `grid`.
- ⚠️ **Sem `grid`, a vitrine em modo grid renderiza UMA coluna** com todos os produtos empilhados: o
  tema faz `(itemsPerGridRow?.desktop) || 1`. O default vivo do bloco `vitrine` **não traz** `grid` nem
  `itemsPerGridRow` (o controle provavelmente só aparece no painel quando `display_mode` é grid), então
  copiar o default não basta.
- ⚠️ **O número é a QUANTIDADE DE COLUNAS no tema novo** (6 = 6 por linha). O construtor twig usava a
  convenção 12/N do Bootstrap (`grid.desktop: "2"` queria dizer `col-lg-2`, ou seja **6 por linha**).
  Copiar o número da origem dá **2 colunas** — errado. Converta: `12 / valor_da_origem`.

Detalhes menores observados na mesma home: `midia_size` `{id:"N", codigo:"cape"}` 600×600 na maioria
das vitrines e `{id:"N", codigo:"list2"}` 280×280 numa delas (os presets são cadastrados por loja; confira
os da sua).

⚠️ **Vitrine de origem `operation` + `operation: "history"` ("Últimos vistos") NÃO RENDERIZA NADA** para
visitante sem histórico — o componente faz `if(!_) return null`. Não conclua que quebrou; teste com
histórico ou aceite o vazio.

Três consequências para quem valida vitrine, todas medidas na home (8 vitrines, **2 delas
`operation: history`**):

- **Vitrine com `origem: "operation"` legitimamente NÃO tem `vit_id`** — cobrar o id nesse caso é ruído,
  e o `validar_pagina.py` deixou de cobrar.
- ⚠️ **Mas `origem: "operation"` SEM o campo `operation` renderiza vazia e não reclama** — nem no JSON,
  nem no console, nem na tela. Virou ERRO no validador porque é indistinguível de "a vitrine sumiu".
- **Vitrine não custa SEO, nos dois sites.** A original **também** monta os produtos no cliente, então
  "os produtos não estão no HTML entregue" **não é** um achado de paridade — é o comportamento das duas
  pontas. Compare a moldura (título, quantidade de cards depois do AJAX), não o texto dos produtos.
  Ver item 21 sobre por que "CSS morto" e "texto ausente" viram falso positivo em conteúdo montado no
  cliente.

Para esconder as amostras de cor do card, e para a regra de CSS que **destrói** essas amostras, ver
itens 24 e 24a.

## 16. `<script>` em bloco `code` NÃO EXECUTA

O React insere o HTML por `dangerouslySetInnerHTML`, e **script inserido por `innerHTML` não roda**.
Além disso o site novo **não carrega jQuery** (`grep jquery` = 0 no bundle).

Custo medido de copiar sem pensar: **811 chars** de jQuery + `owlCarousel` trazidos da origem **em cada
uma das duas raízes** — código morto viajando duas vezes por visita (uma no DOM, outra no
`__NEXT_DATA__`, ver item 9). Comportamento interativo tem de sair de config nativa, de CSS puro, ou de
pedido ao time do tema.

## 17. O tema novo troca de árvore por VIEWPORT; a original troca por USER-AGENT

O corte por `device_show` funciona ponta a ponta (234 blocos gravados → 119 entregues na raiz `Desktop`,
115 na `Mobile`, com `device_show` consumido e removido do JSON entregue e `isssrmobile` false/true
conforme o user-agent). A armadilha está em **quem decide qual árvore mostrar**:

| | Como decide |
|---|---|
| Site novo (React) | **viewport**: no `app.js`, `isMobile = !!width && width <= 992 \|\| isSsrMobile` |
| Site antigo (twig) | **user-agent**, no servidor — nunca muda ao redimensionar |

Consequência para quem mede paridade: **entre 576 e 992px de largura as duas páginas mostram árvores
diferentes**, e comparar "desktop" abaixo de 993px é **inválido**. Meça o desktop a ≥ 993px de viewport
e o mobile com user-agent de celular. Ver também item 11b: a mesma medida de `.container` muda de sinal
conforme a viewport.

## 18. A resposta do `accordion` não está no DOM enquanto o item está fechado

Procurar o texto da resposta **no DOM** dá **falso negativo**: parece que o conteúdo não foi gravado. Abra
o item e meça — 8 accordion escritos à mão abriram ao clique (**55px → 138px**) e o `editor` filho apareceu
com a resposta.

⚠️ E o `grep` no **arquivo HTML** dá o falso oposto: o texto aparece porque o `__NEXT_DATA__` carrega a
página inteira, mesmo com o DOM sem nada (item 9b). Duas fontes, dois enganos opostos: **o JSON diz que
gravou, o DOM diz o que é entregue ao leitor e ao robô.** Você precisa das duas leituras para saber onde
está o problema — e é a segunda que conta para indexação (item 18a).

### 18a. ⭐ O mecanismo, e por que ele custa 72% do texto indexável da página

Não é `display:none`: o corpo **não existe** no DOM quando fechado. Lido no bundle (`app.js`, o
componente interno do accordion):

```js
let gl = function({title:e, children:t, ..., openByDefault:a=!1, ...s}) {
  let [o,l] = useState(!0==a);                       // estado inicial = config.expand
  return jsxs(go.K_, {..., children:[
    jsxs(go.u, {onClick(){ l(!o) }, children:[ jsx(go.J6,{children:e||""}), ...ícone +/- ]}),
    o ? jsx("div",{children:t}) : null                // <-- render CONDICIONAL
  ]})
}
```

Como `useState(openByDefault)` roda igual no servidor, o bloco nativo oferece **só dois estados, e
nenhum é o da original**:

| `config.expand` | corpo no HTML? | visual na carga |
|---|---|---|
| ausente / `false` | **não** | fechado ✅ |
| `true` (booleano) | sim ✅ | **aberto** ❌ |

E não há saída por CSS: com `expand:true` e o corpo colapsado por CSS, o 1º clique põe `o=false` e
**desmonta** o conteúdo — o item nunca abre.

**Medido numa home real (rascunho migrado contra a original em twig):** as 8 perguntas renderizavam, as 8 respostas
(9 `<p>`, **2.192 chars**) não. O texto do miolo era **175 palavras contra 513** da original — 28%.
As respostas do FAQ são a maior parte do texto indexável daquela home.

⚠️ **Não confunda com diferença visual.** A original fazia `.faq .answer{display:none}` e revelava
por clique (classe `.show`), então **na carga as duas páginas mostram o FAQ fechado** — o delta
visível inicial é ZERO. O prejuízo é de DOM/indexação, não de aparência. Se você medir "a olho",
não vê nada.

**A saída, testada em produção:** `<details>/<summary>` num bloco `editor`. `editor` e `code` fazem
`dangerouslySetInnerHTML: {__html: config.code}`, então HTML cru sobrevive — e **o admin NÃO
sanitiza `<details>`/`<summary>` ao gravar** (verificado: 8 de cada no DOM entregue, nos dois
devices). Fica fechado, o conteúdo fica no HTML, zero JS, e dá para reproduzir o CSS da original. As
cores abaixo são marcadores — `var(--cor-primaria)` é a cor primária da sua loja e `#RRGGBB` a borda clara;
meça as suas com `getComputedStyle` e troque:

```css
/* var(--cor-primaria) e #RRGGBB: troque pelas cores medidas na sua loja */
.SEU-BODY-CLASS #layout-main-content .faq-q>summary{cursor:pointer;padding:21px;border:1px solid #RRGGBB;
  background:#fff;border-radius:7px;color:var(--cor-primaria);font-size:16px;list-style:none;display:flex;
  justify-content:space-between;align-items:center;gap:5px}
.SEU-BODY-CLASS #layout-main-content .faq-q>summary::-webkit-details-marker{display:none}
.SEU-BODY-CLASS #layout-main-content .faq-q>summary::after{content:'+'}
.SEU-BODY-CLASS #layout-main-content .faq-q[open]>summary{background:var(--cor-primaria);color:#fff}
.SEU-BODY-CLASS #layout-main-content .faq-q[open]>summary::after{content:'-'}
.SEU-BODY-CLASS #layout-main-content .faq-a{border:1px solid #RRGGBB;background:#fff;padding:13px;
  margin:-9px 0 4px;border-radius:7px}
```

Resultado depois de trocar: **100,0% do texto da original presente**, nos dois devices (era 28,0%).

A correção durável não está na sua mão: pedir ao time do tema da plataforma (a Panorama) que `gl`
renderize os filhos sempre e esconda por CSS. Aí volta a ser `accordion` nativo.

Dois avisos que vêm com ele:

- ⚠️ **As classes do tema são hash de styled-components** (`.foayRI`, `.dGBZmQ`) e **mudam a cada
  build** — nunca ancore CSS de página nelas.
- O visual é o do tema novo, não o da original: `.pano-accordion-section` com `padding: 10px 0` e borda
  inferior, título `uppercase` 12px, marcador em SVG 20×20, item de **55px** — contra caixa branca,
  borda `1px` clara, radius 7px, a cor primária da loja medida, 16px, "+" textual e item de **61,6px** na original.
  Não há config de layout no `accordion`, então o respiro entre itens precisa de **1 regra de página**
  (`margin-bottom: 8px` na classe do item).

## 19. A extensão do navegador bloqueia e trunca o que você tenta ler da página

Limites medidos da automação, que fazem uma verificação correta **parecer** falha:

- ⚠️ **O filtro de saída BLOQUEIA retornos que parecem base64, JWT ou query string** —
  `[BLOCKED: Base64 encoded data]`, `[BLOCKED: JWT token]`, `[BLOCKED: Cookie/query string data]`.
  Aconteceu com um `href` que tinha `?utm=`. Sanitize antes de devolver
  (`.replace(/[?&=]/g,' ')`), ou melhor: **devolva veredito, não valor** — booleanos, contagens e
  tamanhos passam sempre; `charCodeAt` também.
  ⚠️ **E o detector de JWT dispara em MEDIDA, não só em token.** Medido em 2026-08-11: devolvendo
  geometria como `"1520.8x866"` (dois decimais unidos por letra) voltou **`[BLOCKED: JWT token]`** —
  numa lista de 6 seções, **3 vieram bloqueadas e 3 passaram**, o que parece corrupção aleatória do
  DOM. Devolva **números** (`[1520.8, 866]`), nunca a medida concatenada em string.
- ⚠️ **`ctrl+v` pela ação `key` vai para a aba FOCADA do Chrome, não para o `tabId` que você passa.**
  Medido: depois de navegar outra aba no meio do fluxo, a cola caiu lá e a `<textarea>` do admin ficou
  com **0 chars** — indistinguível de falha de clipboard (o `Set-Clipboard` tinha funcionado, 47.655
  chars conferidos no terminal). Não intercale navegação em outra aba entre `criarCaixaDeCola()` e o
  `ctrl+v`. A conferência de sha256 pega, mas você perde uma rodada.
- **A aba do admin que a pessoa abriu não aparece para a ferramenta**: cada sessão tem o próprio grupo de
  abas, e usar o `tabId` dela dá "Couldn't determine which page this action targets". Crie a sua e navegue
  (o cookie de sessão do admin vale); de um dia para o outro o grupo pode sumir e o login expirar.
  Detalhe e o que refazer: `ferramentas-de-navegador.md`, seção 3.
- ⚠️⭐ **E FECHAR aba do grupo DESFAZ o grupo**, com o mesmo erro acima na chamada seguinte e
  "No tab group exists" na listagem de abas da ferramenta — perdi as funções injetadas, o filtro e a linha marcada
  no meio de uma gravação. Não feche aba para "limpar"; e guarde o pacote de funções em
  **`localStorage`** (por origem, sobrevive a reload e a aba nova), não em `sessionStorage`. Medidas e
  a pegadinha do `fn.toString()` sem closure: `ferramentas-de-navegador.md`, seção 3.
- **A saída de cada chamada é truncada perto de 1.000 chars.** Devolva em fatias, não de uma vez.
- **Uma única chamada com ~3,5–4s de `await` somado a trabalho de DOM estoura o timeout de 45s do CDP.**
  Separe em chamadas: clicar / esperar / conferir. E não faça `JSON.stringify` do config inteiro junto de
  outra coisa: 596 KB somados a um `await` já bastam para estourar.
- ⚠️ **`navigator.clipboard.readText()` estoura o `Runtime.evaluate`** — abre prompt de permissão e a
  chamada morre nos 45s. Não existe contorno; pelo clipboard (o plano B, 3b de `gravacao-construtor.md`),
  o que funciona é colar em `<textarea>` própria com `ctrl+v` pela ação `key`. Receita e conferência de
  hash no item 22c.
- `Publicar` e `Limpar cache` abrem **modal de confirmação** — precisa de um segundo clique em `OK`.
  Por script, o `OK` é só por `clicarOkDoModal(/cache/i)` de `scripts/injetar.js`, nunca
  `clicarBotao('OK')` (item 28).
  (Em outubro de 2026, noutra loja, o `Limpar cache` da linha respondeu direto "Cache limpo com
  sucesso (1 itens)", sem modal. Trate os dois casos: olhe a tela antes de procurar o `OK`.)
- `fetch('http://127.0.0.1:PORTA/...')` de dentro do admin **trava** (filtro de rede da extensão):
  servir o JSON num servidor local **não funciona**. O transporte preferido é gzip+base64 numa chamada, com
  o sha conferido na página (`gravacao-construtor.md`, 3a); o clipboard (3b) é o plano B.

## 20. Defeitos da PRÓPRIA original que você vai encontrar — decisão de conteúdo, leve para a pessoa

Migração fiel reproduz bug fiel. Achados na home antiga de uma loja real — a sua terá outros, mas
os tipos de defeito se repetem; nenhum é seu para decidir sozinho:

| O que está lá | Por que importa |
|---|---|
| O **único `<h1>` da home** está dentro de uma faixa decorativa de etiquetas (um `<h1>` com um rótulo de duas palavras) | A reprodução ficou com **0 `<h1>`** porque converteram para `<span>` — com a justificativa, falsa, de que "a faixa é invisível" (item 23a). Zero é pior que um h1 fraco: **reproduza o `<h1>`** e ofereça um título descritivo como alternativa. Se você clonar o item para fazer o loop girar, o clone tem de virar `<span aria-hidden>` ou a página fica com **dois** `<h1>` — item 25 |
| Uma seção de três ofertas tem a `.row` em `device_show: desktop` mas os wrappers em `both` | **Faixa vazia no celular** |
| Duas seções inteiras em `device_show: "hidden"` (um topo e uma oferta relâmpago antigos) | Não renderizam. Não vale reproduzir |
| Um bloco `code` com `<div class="gradient"></div>` | **Nenhum CSS** para essa classe em lugar nenhum |
| `<script>` chamando `$('#mybtn')` quando o elemento é `id="my-btn"` | **Nunca funcionou** — e no site novo script em `code` nem roda (item 16) |
| `alt` com o nome de um cômodo numa imagem que mostra **outro** | Erro de acessibilidade herdado |
| `href="categoria/subcategoria"` sem a barra inicial | Relativo: resolve errado fora da raiz |

Traga todos os que achar na entrega como lista de decisão, com a recomendação. Corrigir em silêncio também é
errado — quebra a paridade que a pessoa pediu.

## 20a. ⭐ Tag mal fechada na origem: o navegador propaga, o BeautifulSoup não — e você lê árvores diferentes

O caso, medido na página `/troca-ou-devolucao` de uma loja (a original, ainda em twig) em 2026-08-11. O
2º parágrafo da 1ª seção tem

```html
<strong>um trecho em negrito no meio do parágrafo,</strongs>
```

**`</strongs>`, com S.** Não é fechamento de nada, então o `<strong>` nunca fecha — e o algoritmo de
*adoption agency* do navegador **reabre o `<strong>` fora do `<p>`** e segue embrulhando o resto do
documento. Efeito medido com `getComputedStyle`: **20 dos 25 elementos de texto da página** renderizam
em `font-weight: 700`, incluindo os 7 `<li>` da política de devolução. Os títulos escapam só porque
têm regra própria de peso.

**E as duas ferramentas da skill discordam sobre isso:**

| | o que reporta |
|---|---|
| `bs4` (`html.parser`), usado pelos scripts | fecha o `<strong>` na fronteira do bloco → as **3 seções aparecem como irmãs no nível 0** |
| navegador (passo 1, JS no console) | `#area-body > strong > [seção 2]` → **seções 2 e 3 aninhadas dentro do `<strong>`** |

Ou seja, as duas fontes divergem **exatamente onde a origem tem marcação quebrada**, que é onde você
mais precisa acertar. A cadeia de ancestrais no navegador é o que denuncia:

```js
let e = document.querySelector('#area-body p'), c = [];
while (e && e.tagName !== 'HTML') { c.push(e.tagName + ' fw=' + getComputedStyle(e).fontWeight); e = e.parentElement; }
c;   // um <STRONG> entre #area-body e a seção = tag órfã
```

⚠️ **Nenhum dos dois scripts pega isto.** O `verificar_paridade.py` compara **texto**, não peso: ele deu
**100,0% de cobertura** com a página inteira em negrito. Quem pega é o JS do passo 7b, que imprime
`font-weight` de cada folha — e só se você **comparar** as duas saídas em vez de olhar só a nova.

**Checagem barata, que vale para qualquer origem** (roda no HTML baixado, antes de montar):

```python
seg = html[html.find('id="area-body"'):]
for t in ('strong','b','em','i','span','div','p'):
    ab = len(re.findall(r'<%s\b' % t, seg, re.I)); fe = len(re.findall(r'</%s>' % t, seg, re.I))
    if ab != fe: print('DESBALANCEADO', t, ab, fe)
```

E a decisão é **de conteúdo, não sua** (item 20): reproduzir fiel carrega o bug. Na
`/troca-ou-devolucao` medida, a pessoa responsável pela loja optou por **corrigir**; consequência
medida e esperada: o parágrafo 3
caiu de 2 linhas para 1 (texto sem negrito é mais estreito) e a seção ficou **25,2px** — exatamente um
`line-height` — mais baixa que a original. Anomalia de altura explicada não é defeito; anomalia **sem**
explicação é (item 21, ponto 4).

## 21. ⭐ Por que a verificação manual falha — a lição de processo

Isto explica os 8 defeitos da home melhor que qualquer um deles. **Cinco erros de método**, todos
cometidos na mesma sessão:

1. **Verifiquei por lista de seletores escolhida por mim.** Só podia pegar o que eu já suspeitava. O
   cabeçalho nunca entrou na lista, porque a skill diz que header e rodapé são tema — verdade, mas
   **o meu CSS alcança o tema** (item 0), e isso a skill não avisava.
2. **Verifiquei apenas o DELTA de cada gravação.** Gravei 3 vezes; o logo quebrou na 3ª, e a 1ª tinha
   screenshot do topo mostrando o cabeçalho **correto**. Reexecutar a verificação anterior teria pegado
   na hora. **Verificação incremental é cega a regressão** — reexecute a bateria inteira a cada
   gravação.
3. **Usei screenshot para conferir PRESENÇA** ("a seção apareceu"), **não FIDELIDADE** ("está igual à
   original"). A faixa de tags aparecia laranja e desigual na imagem que eu mesmo olhei.
4. **Desprezei uma anomalia numérica.** Medi `.borda` e saiu `580×546, 580×278, 580×268`: duas imagens
   irmãs com a mesma config medindo diferente. Escrevi que era "estranho" e segui. Era a imagem
   esticada do item 14. **O dado estava na minha própria saída.**
5. **Nunca comparei as duas páginas lado a lado no mesmo ponto de scroll.**

**O que fazer no lugar:** rode `scripts/verificar_paridade.py`, que existe por causa desta lista.

```
python scripts/verificar_paridade.py --nova URL --original URL --controle URL \
       --json pagina.json --mobile [--testar-imagens]
```

(`python` ou `python3`, conforme a máquina — no Windows, `python3` costuma ser o atalho da Microsoft
Store, que sai com código 9009 sem rodar nada.)

Testado retroativamente contra os artefatos da época quebrada, ele pegou **os 8 defeitos**: vazamento
de CSS (ERRO, 96 header + 13 footer, e sugere o seletor escopado), `<script>` em `code` (ERRO ×2),
`margin` em imagem (ERRO, aponta o bloco), vitrine grid sem `grid` (ERRO ×2), links faltando no mobile
(ERRO ×3), recorte da promo (ERRO ×2), tipografia sem `font-size` (AVISO) e `alt` igual ao id (AVISO).
Com o CSS corrigido: **0 erros, sem falso positivo.**

Ele também imprime um bloco de JS pronto para colar no console **das duas páginas**, cobrindo o que não
dá para ver offline: tipografia computada de toda folha de texto, geometria do grid, **irmãos com a
mesma config medindo diferente** (o caso 278×268), imagem que não carregou, tamanho do logo e contagem
de `<h1>`.

**O número que você deve ler primeiro é a COBERTURA DE TEXTO.** Ele mede quantos shingles de 6 palavras
da original aparecem na nova, sobre o texto corrido do container. Foi o número mais revelador da sessão:
**28,0%** com o FAQ em `accordion` nativo, **100,0%** depois de trocar por `<details>` (item 18a). Uma
lista de seletores nunca teria dito isso — nenhum seletor estava errado; o texto simplesmente não existia.

⚠️ **Quatro saídas do script você tem de ler como INFO, não como defeito** (eram falso positivo até
serem rebaixadas):

- **"CSS morto?" para conteúdo montado no CLIENTE** — vitrine e corpo de accordion não estão no HTML
  estático, então a regra que os estiliza casa 0 elementos e parece morta. Não está. Ver item 15.
- **"CSS morto?" para regra de ESTADO** — `:hover`, `[open]`, `::after`, `::-webkit-details-marker` casam
  0 por definição em HTML estático.
- **"CSS morto?" para regra da OUTRA raiz** — o campo `style` é **um só para as duas raízes**, e o HTML
  entregue é de **uma**. Medido nesta home: as duas classes da faixa rotativa de etiquetas, que só
  existe no Mobile (`.faixa-rotativa` e `.faixa-rotativa-item`, criadas na migração), deram **4 avisos** no par
  desktop; conferido, as classes aparecem **1 vez cada no
  mobile e 0 no desktop**. Antes de apagar CSS por causa desse aviso, rode o outro device.
- **Pseudo-elemento vira AVISO de parser, não de defeito** — `::after`, `::marker`,
  `::-webkit-details-marker` o parser de seletor do BeautifulSoup nem aceita: **4 avisos** no `<details>`
  do FAQ, todos ruído conhecido.

⚠️ **Não canalize a saída do script para `head`.** Um `| head` engoliu o traceback de um
`ValueError: unknown url type` (o `--original` era caminho local, e o `baixar()` da época só aceitava
URL): o script pareceu ter rodado limpo e a conclusão foi "sem defeitos". Leia a saída inteira, ou
redirecione para arquivo. Hoje `baixar()` aceita caminho local — mas o hábito do `head` continua sendo o
jeito mais fácil de transformar erro em silêncio.

### 21a. ⭐ Auditoria adversarial: separe "é verdade?" de "importa?"

A verificação da home foi refeita com refutação adversarial: **52 achados, 23 sobreviveram, 29
derrubados**, ao custo de **161 agentes e 9,8M tokens** para uma página. **É desproporcional** — três
céticos por achado sobre 52 achados é demais. Se repetir, corte o número de céticos ou triem antes.

E o defeito de desenho, que é a parte transferível: **uma lente de "gravidade" com poder de votar
`refutado` mata achado VERDADEIRO por discordância de importância.** Aconteceu com um achado correto —
"você trocou o `<h1>` por `<span>`" — que era literalmente o que o código fazia (item 20). O veredito
tem de ser em duas perguntas separadas: **`é verdade?`** (só evidência decide) e **`importa?`** (só
prioriza). Quem mistura as duas perde achado real e não percebe, porque a saída diz "refutado".

## 22. ⭐ Dirigindo o admin por ferramenta: o que grava ou navega errado sem dar erro

São seis (22a a 22f), todas encontradas gravando páginas reais, e **nenhuma dá erro** — duas mudam de tela
em silêncio e uma deixa você acreditar que gravou.

⚠️ **22a, 22b e 22c estão aqui; 22d, 22e e 22f estão mais abaixo, depois do item 23a** (foram escritas em
sessões diferentes e a numeração não pode ser mexida porque outros arquivos citam por número). Se você
procurou 22d e não achou, é por isso: busque no arquivo, não role a partir daqui. As três de baixo são as
mais caras — clique certo por botão (22d), cache de ~100s da página no ar (22e), `flexBehavior` em bloco
`code` (22f).

**22a. Clique por coordenada de screenshot acerta o alvo errado.** O screenshot volta em **1568px** e
o viewport real era **1707px** — fator **1,089**. Um clique no checkbox da linha (251, 293) caiu ~24px
à esquerda e **abriu outra aba interna, de outro módulo e de OUTRA LOJA** da mesma conta (Vitrines,
1.432 registros). Nada foi alterado, mas foi sorte: o mesmo deslocamento perto de `Excluir` não teria
sido. **Aja pelo DOM**, não por coordenada: ache o elemento por texto/atributo e dispare o evento nele.
⚠️ **Qual evento depende do botão** — `.click()` puro não abre o diálogo `Alterar`, mas o composto de
`clicarBotao()` abre **dois**; para abrir é `triggerHandler` sozinho (`abrirDialogo()`/`clicarNg()`),
para confirmar é o composto. Tabela no **item 22d**. Se precisar do teclado, `key` não usa coordenada e
é seguro.

**22b. A trava "uma única grade" aborta a gravação CERTA.** O `document.querySelectorAll('table')
.length === 1` de uma versão anterior da skill conta as grades de **todas as abas internas abertas** — com a aba Vitrines
aberta em segundo plano dá 2, e a trava aborta mesmo estando tudo correto. Pior: a grade de Páginas
pode ser a **invisível**. Escope na grade **visível**:

```js
const grade = [...document.querySelectorAll('table')].find(t => t.offsetParent);
const cb = [...grade.querySelectorAll('tr input[type=checkbox]')]
             .filter(c => (c.getAttribute('ng-click')||'').includes('clickCheckbox'));
if (cb.length !== 1) throw new Error('esperava 1 checkbox de linha, achei ' + cb.length);
```

Confira depois `marcadas.length === 1` **dentro da grade visível** e, quando o rodapé diz
`Registro(s) Selecionado(s)`, que ele diga 1. O rodapé muda de admin para admin: num deles, sem linha
marcada, ele diz só `Registro(s): N` (medido 2026-10). A contagem que manda é a do DOM.

**22c. O clipboard é um recurso GLOBAL da máquina — confira o `sha256` na própria página, sempre.** O
caminho testado para levar o JSON até o campo é `<textarea>` própria → `focus()` → **`ctrl+v` pela ação
`key`** (sem coordenada; `readText()` não serve, ver item 19) → **`crypto.subtle.digest('SHA-256', …)`
na página** e comparar com o hash do arquivo **antes** de injetar. Medido: 295.187 chars colados com hash
idêntico, em uma tentativa.

⚠️ **A conferência não é cerimônia.** Numa colagem o que chegou foi **um código de rastreio de
encomenda (17 chars)**: a pessoa na frente do computador copiou o código enquanto a gravação acontecia. O hash pegou
antes de qualquer escrita. Sem ele, 17 chars de lixo teriam ido para o campo `Blocos:` de uma página real
— e o `Confirmar` não teria reclamado.

## 23. ⭐ Para aparência computada, o navegador é a fonte — arquivo estático subdetermina

Rejeitei três achados de aparência porque `grep` nas **13 folhas de estilo** da original não achava
`.icone-ver-mais` (classe criada pela loja medida) em lugar nenhum. Estava errado nos três. Medido com
`getComputedStyle` na própria página:

| | medido na original |
|---|---|
| `.icone-ver-mais` (círculo do "Ver mais") | 18×18, `background` na cor da loja, `radius 50%`, `margin-left 8px`, svg **branco** |
| seta do carrossel | 38×38, `absolute`, `left:-45px` (FORA do card), `#fff`, `box-shadow 0 1px 2px rgba(0,0,0,.12)`, `opacity .3`, `radius 50px` |
| espaço entre produtos | `.owl-item{margin-right:10px}` |

A regra existe na página e não nos arquivos que eu tinha baixado. **Ausência nos arquivos que você
pegou não é ausência no navegador.** E o carrossel só existe depois do AJAX: medir antes de rolar e
esperar dá `0×0 static` e conclusão errada.

No tema novo as classes equivalentes são estáveis (`pano-carousel-prev-button`,
`pano-carousel-next-button`, dentro de `.pano-carousel-container`, que já é `position:relative`) —
essas dá para ancorar; as hasheadas do styled-components, não.

### 23a. ⚠️ Uma medição só pode pegar estado TRANSITÓRIO — confira com screenshot

Corolário do item 23, e custou uma conclusão errada inteira. A faixa de etiquetas da home antiga
medida (classe `.faixa-de-tags`, criada pela loja) tem no CSS de página:

```css
body .faixa-de-tags{ ...; opacity:0; transition:90ms linear opacity }
```

Conclusão que eu tirei disso e afirmei com confiança: *"a faixa é invisível no ar"*. Medi
`getComputedStyle` na página, duas vezes, esperando 4s e 5s — as duas devolveram `opacity: "0"`, o que
pareceu confirmar. Uma versão anterior deste arquivo até registrava que "nada devolve `opacity: 1`,
conferido em todos os css do tema antigo e no bundle".

**Está errado. A faixa aparece.** Um script sobe a opacidade **inline** depois que o owl-carousel fica
pronto (fade-in anti-FOUC):

```
.faixa-de-tags  ->  style="opacity: 1;"     // setado por JS, não por regra de CSS
```

Três lições, em ordem de importância:

1. **Screenshot resolve em um passo o que a medição errou em dois.** Um `screenshot` da região mostrava
   as 4 tags na tela. Quando a conclusão é sobre *o que a pessoa vê*, olhe — não deduza de números.
2. **`opacity` inicial em CSS + `transition` é assinatura de fade-in por JS.** Se você lê
   `opacity:0` junto de `transition:...opacity`, presuma que algo sobe para 1 e vá procurar o setter
   em `element.style`, não só nas folhas de estilo. Grepar CSS e bundle **não acha** `el.style.opacity = 1`.
3. **Estado transitório precisa de duas medições separadas no tempo**, ou de uma depois de
   `document.readyState === 'complete'` mais uma folga. Uma medição só é um instantâneo, e
   instantâneo de animação mente.

Para conferir se o valor veio de regra ou de script:

```js
const el = document.querySelector('.faixa-de-tags');
el.getAttribute('style');            // '(nenhum)' vs 'opacity: 1;'  <- decide a questão
getComputedStyle(el).opacity;        // o valor final, seja de onde vier
```

### 22d. ⭐ O clique certo é DIFERENTE em `Alterar` e em `Confirmar` — e errar não dá erro

Medido em produção, gravando a mesma página quatro vezes. `clicarBotao()` faz
`mousedown`+`mouseup`+`click` **e** `angular.element(b).triggerHandler('click')`. Os dois juntos
disparam o `ng-click` **duas vezes** — e o efeito depende do botão:

| botão | só `.click()` nativo | só `triggerHandler` | os dois juntos |
|---|---|---|---|
| `Alterar` | **não abre** o diálogo | abre **1** diálogo ✅ | abre **2** diálogos ⚠️ |
| `Confirmar` | fecha o diálogo e **NÃO grava** ⚠️ | **não grava** ⚠️ | **grava** ✅ |

Ou seja: use `triggerHandler` sozinho no `Alterar` e a sequência completa no `Confirmar`. As duas
formas erradas do `Confirmar` fecham o diálogo igual — não há erro, nem aviso, e a leitura seguinte
da página (em cache, ver 22e) confirma a ilusão de que gravou.

**E diálogo velho pode não sair do DOM.** Depois de gravar, o `.ui-dialog` anterior pode continuar no
documento, escondido, com o `z-index` MENOR que o do novo (medido no `Alterar` de uma página do construtor;
em 2026-10, noutra loja, o diálogo Configurações e o `Alterar` de um Arquivo saíram do DOM depois do
`Cancelar`, com 0 `.ui-dialog`: os dois acontecem, então conte, não suponha). `document.querySelectorAll('textarea')`
devolve em ordem de DOM, então você liga o escopo ao diálogo **morto**, escreve nele, confirma nele
— e nada acontece. Ligue sempre pelo elemento do diálogo, e exija que exista exatamente um:

```js
const dlgs = [...document.querySelectorAll('.ui-dialog')];
if (dlgs.length !== 1) throw new Error('dialogos: ' + dlgs.length);   // aborte, nao escolha
const ta = dlgs[0].querySelector('textarea[ng-model="configInput.builder"]');
// ... e antes de Confirmar, prove que o dialogo aberto e' o mesmo escopo que voce alterou:
if (escopoDoDialogo(dlgs[0]) !== window.__SC) throw new Error('dialogo != escopo alterado');
```

### 22e. ⭐ A página no ar PODE ter cache de servidor — verificar cedo dá "não gravou"

Depois de `Confirmar`, a URL pública **pode** continuar servindo a versão anterior por cerca de
**100s**, com bytes idênticos. `Cache-Control: no-cache` e, numa loja medida, com o Cloudflare na frente,
`cf-cache-status: DYNAMIC` na resposta enganam: o cache é do backend da Panorama, não do CDN nem do navegador.

⚠️ Os cabeçalhos dependem do host e da loja: noutra loja da plataforma, medida em outubro de 2026, a
Cloudflare guardava **cada página por 5 min** (`max-age=300`, `cf-cache-status` diferente de
`DYNAMIC`). E noutra ainda, sem CDN visível nos cabeçalhos (sem `cf-cache-status`), o HTML vinha
`private`, guardado só pelo navegador. Leia `cf-cache-status`, `age` e `last-modified` da resposta antes de
concluir qualquer coisa; as camadas de cache estão no `mapa-do-admin.md`, seção 5.

Isso produz o diagnóstico errado mais caro da automação: você grava, busca, vê o conteúdo velho,
conclui que o `Confirmar` falhou e **grava de novo** — repetidamente. Aconteceu três vezes seguidas
numa sessão.

⚠️ **Mas não conte com os ~100s como regra: em 2026-08-11 ele não apareceu nenhuma vez.** Numa página
de rascunho, em **duas** gravações seguidas (64.744 e 64.790 chars), a URL entregou o conteúdo novo na **primeira**
busca depois do `Confirmar` — e a segunda já servia o `style` corrigido **antes** de eu clicar em
`Limpar cache` (que acabou não sendo necessário). Não sei o que decide: pode ser tamanho de página,
pode ter mudado no backend.

**A ordem de verificação não muda por isso** — fonte primeiro, ar depois — porque o custo de inverter
é assimétrico: quando o cache existe você regrava de graça três vezes; quando não existe você só
gastou uma releitura do diálogo. Mas **não espere 100s por hábito**: busque, e se vier velho, aí sim
`Limpar cache` e poll.

**Verifique na FONTE, não na página:** reabra o diálogo e leia `data.config.builder` do escopo. Se o
conteúdo novo está lá, gravou. Depois, para ver no ar: clique `Limpar cache` (aceitável na página de
rascunho, depois de gravar) e só então busque.

⚠️ **`Limpar cache` limpa a SELEÇÃO da grade.** A linha volta desmarcada, e a próxima trava de alvo
aborta. Remarque antes de qualquer outra operação.

⚠️ **E ao conferir na fonte, não compare TAMANHO de string: o Angular polui o objeto.** Ele injeta
`$$hashKey` em todo objeto que itera com `ng-repeat`, então `JSON.stringify(data.config.builder)` **muda
de tamanho entre duas leituras da mesma gravação** — medido **297.831** e **299.089** chars. Isso **não é
corrupção** e não significa que alguém escreveu no meio. Confira presença de conteúdo (contagem de blocos,
um trecho conhecido, o `sha256` do que você mandou), não o comprimento. Mesma família do item 4b:
`$hashKey` e `row_index_grid` são lixo do AngularJS e não devem ser gerados.

### 22f. `flexBehavior` é ignorado em bloco `code` — e o pai flex encolhe o filho

**Mora no item 13** (tabela de config ignorada), porque é dessa família. Resumo: bloco `code` dentro de
pai `display:flex` sai com `flex-grow: 0` mesmo com `flexBehavior.enable:true, flex_grow:1`, e encolhe
para o conteúdo — **757px** dentro de um `.container` de **1200**. A correção é pôr o **pai** em
`display:block`, não insistir no `flexBehavior`.

O sintoma é o mesmo do item 14 caso 1 (o `<a>` do bloco `imagem` colapsando como item flex): **em bloco
`code` e em bloco `imagem`, o wrapper que o renderizador gera não estica.** Se o seu bloco mediu menos
que o pai, verifique primeiro se o pai é flex.

### 23b. Animação CSS não avança em aba que não está sendo pintada

Ao verificar `@keyframes` por script: `getComputedStyle(el).transform` pode ficar parado no valor
inicial mesmo com `playState: "running"`, porque o navegador congela o relógio da animação em aba
não visível. Medido: `currentTime` continuou **0** depois de 3,6s de espera.

Não conclua que a animação está quebrada. Conduza o tempo à mão:

```js
const a = el.getAnimations()[0];
a.currentTime = 0;    getComputedStyle(el).transform;   // quadro inicial
a.currentTime = 5000; getComputedStyle(el).transform;   // 5s dentro do ciclo
```

Foi assim que se provou que a faixa rotativa andava um slot exato (`translateX(-400px)` numa trilha
de 2000 com 5 slots de 400).

### 23c. `innerWidth` não é confiável, e `resize_window` pode não mudar o viewport

Terceiro corolário do item 23, e este afeta a **decisão de qual árvore você está vendo** (item 17: o tema
novo escolhe Desktop/Mobile por `width <= 992`). Medições que quebram a suposição:

- **Zoom aplicado por ORIGEM deixa `window.innerWidth` inconsistente com o que a página está usando para
  decidir layout.** Se você mediu com zoom diferente de 100%, o número não vale.
- ⚠️ **E ele MUDA entre chamadas, sem você redimensionar nada.** Medido em 2026-08-11, na mesma janela,
  alternando entre a original e a nova: `innerWidth` deu **1536 → 1707 → 1536 → 1707** em quatro
  medições. Consequência concreta: a primeira comparação de altura de seção acusou desvio de
  **0,1–0,2px em 3 de 6 seções** (original medida a 1707, nova a 1536); remedindo as duas a **1536**, o
  desvio foi **0 nas seis**. Ou seja, o zoom fabricou um defeito que não existia — e num caso menos
  sortudo teria escondido um que existe. **Imprima `innerWidth` DENTRO da mesma chamada de cada
  medição**, não numa chamada anterior, e só compare números colhidos na mesma largura.
- **`resize_window` pode simplesmente não mudar o viewport**: pedida a janela em **800**, `innerWidth`
  continuou **1707**. Se você acredita no comando e não confere, mede o desktop achando que é mobile —
  e conclui que "o mobile está com o layout do desktop", que é o defeito mais comum de todos, agora
  fabricado por você.
- **E o contrário também acontece.** Medido em outubro de 2026: abas abertas pela extensão do navegador
  passaram a reportar viewport de **375×667** sem ninguém pedir. O site da loja servia a árvore mobile
  e o admin escondia o menu lateral (os botões continuavam no DOM, só invisíveis). Quem não confere
  mede o mobile achando que é o desktop.
- **Painel de navegador oculto não carrega imagem `lazy`.** Com o painel embutido escondido, as
  imagens com `loading="lazy"` nunca entram — não é regressão do seu CSS. Tire a conclusão numa aba
  visível.

**O que fazer:** confira `innerWidth` **depois** de redimensionar, e antes de concluir qualquer coisa. Para
testar comportamento em largura estreita sem depender do redimensionamento, **constrinja o container do
bloco** (`el.style.width = '360px'`) e meça os filhos. Não substitui o teste de árvore (que depende de
user-agent/SSR), mas responde a pergunta de layout sem mentir sobre o viewport.

## 24. Esconder as amostras de cor do card da vitrine — e o carrossel dentro do carrossel

**Não existe config no bloco `vitrine` para isso.** O card recebe exatamente 8 chaves —
`orientation`, `priceExhibitionMode`, `priceExhibitionType`, `showcaseProductLayout`,
`showcaseFooterComponent`, `pageProductListTitle`, `productListShow2ndPicture`,
`productListShowDimensions` — e nenhuma controla a variação por cor. `showcaseFooterComponent`
é só o rodapé do card (`NOT_SHOW` / `ADD_TO_CART` / `OFFER_TIMER`).

Dois caminhos, com alcances diferentes:

| caminho | alcance | como |
|---|---|---|
| **CSS de página** | só a página | esconder o carrossel de amostras dentro do card (seletor abaixo) |
| **cadastro do produto** | site inteiro (PDP, listagens) | o tema respeita `derivacoes[].opcoes.exibirDerivacao === "false"` — **string**, não booleano |

```css
.SEU-BODY-CLASS #layout-main-content .pano-showcase-product-container
  [class*="pano-carousel-container-product-"]{display:none}
```

Contado no DOM: **29 elementos, 1 por card, todos dentro do card**. Tira ~52px de altura de cada card.

### ⚠️ 24a. Cada card tem um carrossel PRÓPRIO — regra larga de `pano-carousel-*` destrói as amostras

As amostras de cor ficam num carrossel aninhado, com container
`pano-carousel-container-product-*`, dentro do carrossel da prateleira
(`pano-carousel-container-builder-showcase-<id do bloco>`). Então uma regra escrita para as setas
da prateleira atinge as setas das amostras também. Medido nesta home:

| seletor | quantos botões pega |
|---|---|
| `.SEU-BODY-CLASS #layout-main-content .pano-carousel-pagination-button` | **64** (6 da prateleira + **58 das amostras**) |
| `…[class*="pano-carousel-container-builder-showcase-"] > [class*="pano-carousel-pagination-button"]` | **6** ✅ |

Com a regra larga, as setas das amostras viraram círculos brancos de 38px jogados 45px para fora de
uma caixa de 162px — apareceram como dois chevrons pálidos nas bordas do card, e foi o usuário quem
notou. É o mesmo erro do item 0 com outro nome: **classe do tema sem contar o alcance.**

O combinador de **filho direto** é obrigatório aqui: descendente não resolve, porque o carrossel das
amostras está *dentro* do container da prateleira.

## 25. Reproduzir carrossel por `@keyframes`: o clone duplica o `<h1>`, e o `%` dobra

Quando a origem tem um carrossel de `<script>` (que **não roda** em bloco `code`, item 16), a saída sem JS
é trilha + `overflow:hidden` + `@keyframes`. Funciona — mas tem duas armadilhas que não dão erro.

O caso medido: a faixa de etiquetas de uma home antiga tinha dois owl configurados no `<script>` removido —
`.notMobile → items:4, loop:false, margin:20, autoplay:true, autoplayTimeout:3000` e
`.isMobile → items:1, loop:true, margin:20, autoplay:true, autoplayTimeout:3000`. Reprodução:

- **Desktop (4 lado a lado):** pai `display:flex; gap:20px` e cada item `flex:1 1 0; min-width:0`. Isso é o
  `items:4, margin:20` do owl e **acompanha a largura do container**, o que travar `280px` no duro não faz.
  Medido num container de 1180: itens de **280**, passo **300** — os números da original. (O pai tem de ser
  `display:block` no bloco que envolve o `code`; ver item 13 / 22f.)
- **Mobile (1 por vez, girando a cada 3s):** janela com `overflow:hidden`, trilha de **5 slots** (os 4 itens
  **mais um clone do 1º**), `@keyframes` de **15s** (5 × 3s), passos de **-20%**, com parada em **17,33%**
  (2,6s de dwell) e transição de 2,67% (0,4s). O clone existe para o loop não dar salto para trás: o quadro
  em **-80%** é idêntico ao de **0%**. Verificado no ar: 5 slots e `translateX(-400px)` a 5s numa trilha de
  2000.

⚠️ **O clone DUPLICA o que está dentro dele — inclusive o `<h1>`.** O primeiro item da faixa é o único
`<h1>` da home (item 20), então clonar cru deixa a página **com dois `<h1>` no mobile**. No clone, troque a
tag por `<span>` e ponha `aria-hidden="true"` (o leitor de tela não deve ler o rótulo duas vezes). Cuidado
com a assimetria: **no clone** virar `<span>` é a correção; **no item real** virar `<span>` foi justamente o
defeito do item 20. A regra é **um** `<h1>` — nem zero, nem dois.

⚠️ **`@keyframes` num campo `style` gerado por Python: todo `%` literal precisa ir DOBRADO.** Se a string
passa por formatação `%` (`"..." % {"b": BODY_CLASS}`), `0%,17.33%` tem de ser escrito `0%%,17.33%%`. Sem
isso, `%{` vira especificador de conversão inválido e o gerador estoura na cara (fácil de achar); e se o
caractere seguinte formar um especificador **válido**, o CSS sai corrompido em silêncio — `@keyframes`
inválido o navegador ignora sem uma linha de console, e você fica com uma faixa parada e nenhum sintoma.

E acrescente a saída para quem pediu menos movimento — é uma linha:

```css
@media(prefers-reduced-motion:reduce){ .SEU-BODY-CLASS #layout-main-content .faixa-rotativa{animation:none} }
```

## 26. Tag de produto no card: o estilo vem do CADASTRO, e o ícone o tema joga fora

Sintoma relatado por quem usa: na home antiga as tags de cadastro do card (duas etiquetas próprias da
loja, que aqui vamos chamar de "Tag A" e "Tag B") eram pílulas com borda e ícone; no site novo saem
como **texto colorido solto**, sem caixa.

Não é a página, nem o construtor. Lido no bundle (módulo 29679), o componente da tag é:

```js
y = function({tag: e, discount: t, ...r}) {
  let a = e.codigo, s = e.config,
      {styles: o, text: l} = ( n = {height: s.altura, width: s.largura,
                                    color: s.color, background: s.background},
                               {styles: n, text: s.text, mediaId: e.midia?.raw} ),
      c = a=="envio-imediato" ? "Envio imediato"
        : a=="frete-gratis"   ? "Frete grátis"
        : (a=="percentual-desconto" && t) ? `${t}% OFF` : null;
  return jsx(m, {...r, tagCode: a, tagStyles: o, children: c || l})
}
```

Três consequências, cada uma medida:

**1. O estilo é dado, não CSS.** `e.config` traz `altura`, `largura`, `color`, `background` e o tema
injeta isso no componente (`tagStyles`). Medido nessas tags de uma loja real: `color` =
um laranja **preenchido** e `background` **vazio** → texto laranja sem pílula. A
regra base do styled-component não define `color` (só `font-size`, `border-radius`, `width`,
`justify-content`) e o pai tem `rgb(33,37,41)`, então o laranja só pode vir do cadastro. **O conserto
é preencher `background` no cadastro da tag** — vale para o site inteiro, sem uma linha de CSS.

**2. `tagStyles` só carrega 4 propriedades.** Não há `border` nem `padding` — e não há ícone: o
componente calcula `mediaId: e.midia?.raw` e **nunca usa**. `mediaId` aparece **1 única vez nos
1,9 MB do bundle**, na atribuição. O cadastro tem o campo de mídia, o tema lê e descarta.

**3. Estilo embutido existe só para 3 slugs**: `envio-imediato`, `frete-gratis` e
`percentual-desconto`. Os dois primeiros recebem quase o desenho que as tags A e B tinham na
original — fundo branco, borda `1px solid GRAY_800` (`= var(--gray-800, #EAEAED)`, **a mesma cor** que
a original escrevia), `padding:3px 3px 3px 20px` e ícone SVG de 16px inline no `::before`. O switch é:

```js
e => { switch (e.tagCode) { case "envio-imediato": case "frete-gratis": return f
                            case "percentual-desconto": return g } }        // sem default
```

Sem `default`, tag de cadastro não casa e recebe **nada**. O pedido ao time é um `default`, não um
desenho novo.

⚠️ **Nenhum dos 7 tokens do tema é literal** — todos são `var(--nome, fallback)` e o bundle **não
declara nenhuma** dessas custom properties (`:root` = 0 ocorrências em `app.js`). Você sempre cai no
fallback, mas um stylesheet servido fora do bundle pode declarar e mudar tudo em silêncio. Pior, há
colisão de nome: `TAG` e `LINK` leem os dois `--font-size-link` (só o fallback difere, 10px e 11px), e
`SMALLEST` e `SMALL` leem os dois `--spacing-small` (2px e 4px). No dia em que o tema declarar essas
vars, os pares colapsam no mesmo valor sem aviso.

### ⚠️ 26a. CSS de página NÃO consegue estilizar uma tag específica

A única classe estável é `pano-product-item-tag-container`, **compartilhada por todas** (medido: 66
tags numa home, 3 textos distintos). O que distingue uma tag da outra é hash de styled-components
(`drDUUw` para uma, `evxrrZ` para outra) — que **muda a cada build**, e ancorar nele é proibido pelo
item 0. Não há `data-*` com o slug.

Então uma regra de página atinge **todas** as tags, inclusive `frete-gratis`/`envio-imediato`, que já
têm estilo próprio e ficariam com dois estilos somados. Para tag, o caminho é cadastro — não página.

**Como era no tema antigo, para comparar:** ele estilizava **por slug** (a classe é `tag-` + o código
da tag no cadastro), então qualquer tag nova podia ganhar estilo no CSS da loja:

```css
.tag.tag-tag-a, .tag.tag-tag-b, .tag.tag-tag-c{
  font-size:10px!important; background:#fff; color:#000!important;
  border:1px solid #eaeaed; padding:6px 5px 5px 27px!important }
.tag-tag-a:before{ position:absolute; content:""; width:16px; height:16px; left:5px;
  background-image:url(".../img.panorama/imagem/NNNNNN/icone-da-tag.png");
  background-size:100%; background-repeat:no-repeat; background-position:50% }
```

⚠️ O código da tag vira classe **literal**, inclusive com acento: uma tag de código `preço-especial`
gera `.tag-preço-especial`. No CSS, escreva o `ç` escapado (`.tag-pre\0000e7o-especial`), que casa
independente da codificação com que o arquivo é servido. Medido no site em twig de uma loja, em
outubro de 2026 — o tema antigo ainda emite essa classe; o novo não (26a).

**Pedido preciso para o time do tema**, se a paridade importar: dar um `default` ao switch que aplique
a variante já existente, usando como ícone o `mediaId` que o componente já lê e descarta. E corrigir a
unidade de `largura`/`altura` (ver 26c).

### ⭐ 26b. A CAUSA RAIZ não é o cadastro — é o CSS global da loja, que o tema novo não carrega

Passei um bom tempo tratando o cadastro como a origem do visual antigo. **Não era.** O markup real de
uma página de listagem antiga (`curl https://www.SUA-LOJA.com.br/<uma-listagem>`, que é PHP e vem
pronta do servidor — a home NÃO serve, ela monta as tags por JS):

```html
<div class="tags tags-top-left">
  <div class="tag tag-tag-a" style="background-color: white; color: #RRGGBB">Tag A</div>
  <div class="tag tag-tag-b" style="background-color: ; color: #RRGGBB">Tag B</div>
</div>
```

Os dois sites leem **o mesmo cadastro**, e o antigo o aplicava como `style` inline. Repare no
`background-color: ` **vazio** da segunda: no site antigo ela ficava bonita do mesmo jeito, porque o
`#fff` vinha do CSS. Ou seja: **o cadastro nunca foi a fonte do visual — era um override opcional em
cima do CSS.** É por isso que ninguém nunca o preencheu.

E esse CSS morava no **CSS customizado da loja**, que o tema antigo injetava inline em toda página
(`old-global-custom.css`, também presente no `<style>` do HTML). **O tema novo não injetava nada disso**
quando foi medido (2026-08, no site novo de uma loja) — verificado com 4 marcadores independentes
daquele arquivo (duas classes de tag, um selo de loja e uma regra de botão): **0 ocorrências** em todos
os dumps do site novo, contra 7 e 2 no antigo. Naquele momento não existia camada de CSS por loja no
tema novo; a plataforma muda, então confira na sua loja (procure no HTML do site novo um trecho que só
exista no seu CSS customizado). Some-se a 26a e o resultado é
que **não há lugar nenhum, fora do cadastro, para estilizar uma tag** — e o cadastro expõe 4
propriedades.

⚠️ **Duas coisas do CSS antigo que eu afirmei e estavam ERRADAS — não repita:**

1. **A borda cinza nunca apareceu.** `.tags .tag:not(.tag-percentual-desconto){border:1px solid
   transparent}` é **(0,3,0)**; `.tag.tag-tag-a{border:1px solid #eaeaed}` é **(0,2,0)** e
   **sem `!important`** (o autor pôs `!important` em `font-size`, `color` e `padding`, e esqueceu em
   `border`). A transparente ganha. Confirmei que não existe nenhuma `.tags .tag-tag-*` que mudasse
   isso. Pedir a borda ao time é **acrescentar**, não restaurar.
2. **O `color` do cadastro também nunca apareceu.** O inline `color:#RRGGBB` do cadastro perdia para
   `color:#000!important` do stylesheet. O laranja que aparece hoje é uma cor que estava guardada no
   cadastro havia anos e nunca foi vista. Trocar para `#000` **restaura**, não muda.

Lição geral: em CSS antigo, **`!important` seletivo é pista de briga de cascata perdida** — antes de
tratar uma declaração como "o visual da original", conte a especificidade da regra que competia.

**Regressão de fora do escopo, mas real:** o CSS antigo escondia o container em 5 contextos, e o tema
novo não tem equivalente (o corpo de `T` não tem nenhum guard além de `if(!tagList)`), então as tags
passaram a aparecer sobre imagem de hero e de banner com produtos:

```css
.block-product-list .pl-modelo-slider-hero .product .tags{display:none}
.block-product-list .pl-modelo-grid-hero   .product .tags{display:none}
.notMobile .block-banner-container.with-products .tags{display:none}
.isMobile  .block-banner-container.with-products .tags{display:none}
body.page-home.isMobile #bigbanner .tags{display:none}
```

### ⚠️ 26c. `Cor do fundo` é injeção de CSS crua — funciona, e ainda assim não use

O tema faz `e => css(["",""], e?.tagStyles)` com um **objeto**, e o serializador do
styled-components 5.3.6 só faz `String(i).trim()`. Um agente extraiu o stylis do próprio bundle e
rodou: um valor com `;` no campo `Cor do fundo` vira **7 declarações válidas**, e um `&:before{…}`
aninhado vira **duas regras reais**. Vírgula, `url()`, `/` e `//` sobrevivem (a vírgula ganha um `\r`
no scanner e o `u=/[\0\r\f]/g` o remove antes de emitir). Então `background` como shorthand com
`url(...)` funciona **sem truque nenhum**, e paridade total é alcançável pelo campo.

**Cinco motivos concretos para não fazer**, todos verificados no bundle:

- **Falha silenciosa total.** Em produção a injeção é por CSSOM: `insertRule=function(e,t){try{...}
  catch(e){return !1}}`, e o chamador ignora `false`. Uma aspa esquecida não derruba uma declaração —
  derruba **a regra inteira** da tag, sem erro no console.
- **Um `}` acidental cria regra fantasma** no stylesheet global (saída provada: `.hash .hash{color:red}`).
- **`largura`/`altura` saem sem unidade** (`width:50`, inválido, descartado — é por isso que a tag mede
  68×22 e não 50×50). Quando o time corrigir, vai ser `${s.altura}px` (o idioma do próprio bundle, 36
  ocorrências), e todo cadastro que já tiver `"50px"` vira `50pxpx`. **Deixe esses dois vazios.**
- **A variante interpola DEPOIS.** `tagStyles` é a 3ª interpolação, o `switch` é a 4ª. No dia em que
  ganhar um `case`/`default` para a família (que é justamente o conserto certo), ele sobrescreve
  `color`, `background`, `border` e `padding` do cadastro de uma vez.
- **O `:before` mede do CONTAINER, não da tag.** `s.f0` (módulo 72521) é `styled(Box).attrs({direction:
  "row"})` e **não declara `position`** — a tag é `static`. Só coincide porque `tags-top-left` é
  `align-items:flex-start`. Trocar `Posição` para "Superior Direita" (um clique no mesmo formulário)
  descola o ícone. **O ícone nativo do `frete-gratis` tem o mesmo defeito latente** — vale reportar.

**Mais armadilhas do formulário de tag, independentes disso:**

- `e.config.position` é lido **sem optional chaining no `config`**. Tag gravada sem `config` lança
  `TypeError` e derruba o card inteiro.
- `position` fora das 4 strings exatas (`top-left`, `top-right`, `bottom-left`, `bottom-right` —
  inclusive diferença de caixa) não cai em filtro nenhum e a tag **desaparece**, sem erro. Não há
  `default` nem container de reserva.
- `ordemExibicao` e `Texto Alternativo` **não têm consumidor** no bundle; não há `.sort` em lugar
  nenhum, a ordem da pilha vem crua da API.
- Na loja medida, cada família de tag tinha **ícone próprio** (três arquivos de mídia diferentes para
  quatro tags, um deles em SVG). Não existe regra genérica: um `default` no switch teria de ler o ícone
  de cada tag.
- O Preview do admin é `/internal-builder-preview`, **rota do mesmo bundle** — ele renderiza qualquer
  hack com fidelidade total e dá falsa confiança: valida o hoje, nunca o refactor.

## 27. ⭐ O admin STRINGIFICA todo escalar ao gravar — e `verificarGravou(sha)` sempre acusa falso

Medido em 2026-08-11 numa página de rascunho, gravando e relendo o campo `Blocos:`: **escrevi 64.744 chars, reli
65.421** (+677). Nada foi corrompido — o servidor **normalizou** na ida:

| eu gravo | volta como |
|---|---|
| `false` / `true` (booleano) | `"false"` / `"true"` (**string**) |
| `0` (número) | `"0"` (string) |
| `null` | `"null"` (string) |
| `"child": []` | **a chave desaparece** (nos 12 blocos `editor`) |
| `"backgroundPreview": []` | **desaparece** |

Contado no que voltou: 39 blocos, mas `child` presente em apenas **27** — os 12 sem filhos perderam a
chave. `$$hashKey` era **0**.

### A consequência que morde: o falso negativo

⚠️ **`verificarGravou(sha)` NUNCA pode bater numa gravação nova**, porque o sha canônico é do que você
mandou e o que está salvo passou pela normalização. Ele devolve `confere: false` e imprime *"NÃO gravou
o que você queria"* — empurrando exatamente para o loop de regravação que o **22e** existe para evitar.
Aconteceu comigo; só não regravei porque parei para explicar os +677 chars.

**Como provar a gravação sem o sha**, e é isto que vale como prova:

```js
// no diálogo REABERTO depois de recarregar o admin
const o = escopoDoDialogo(dialogoUnico()).data.config.builder;
let n = 0; (function w(l){(l||[]).forEach(b=>{n++; w(b.child)})})(o.block_list);
({ blocos: n, raizes: o.block_list.length, devices: o.block_list.map(r=>r.device_show),
   styleChars: o.style.length, bodyClass: o.body_class,
   marcador: o.style.indexOf('UMA-STRING-SO-DA-VERSAO-NOVA') >= 0 })
```

Contagem de blocos + raízes + `device_show` + tamanho do `style` + um marcador que só existe na versão
nova. Foi assim que provei a 2ª gravação (39 blocos, 2 raízes, `style` 688 chars com a cor de link medida e sem
`#e23b40`).

### A contradição que ninguém testou ainda, e é caro errar

O **18a** manda gravar `accordion.config.expand` como booleano `true`, "**não** a string `"true"`",
porque o componente faz `useState(!0 == a)` — e em JS `true == "true"` é **`false`** (o `==` converte
`"true"` para `NaN`). Se o admin stringifica todo booleano, **essa instrução pode ser impossível pelo
campo `Blocos:`**: você grava `true` e o que chega ao componente é `"true"`, ou seja o accordion
**nunca abre por default**.

Não testei — a página que revelou a normalização não tem `accordion`. **Teste antes de migrar
qualquer FAQ pelo campo `Blocos:`**: grave um `accordion` com `expand: true`, leia o `__NEXT_DATA__`
da URL e veja se chegou booleano ou string. Se chegar string, `expand` só funciona pelo construtor
(que grava pelo `syncData`, outro caminho) — ou não funciona.

Para a config normal isto **não** atrapalha: `padding.apply: "true"` é string truthy e o emissor
aplica; `"false"` também é truthy, mas o grupo então sai com valores vazios que produzem declaração
inválida e o navegador descarta. Medido: a página renderizou com desvio 0px. É só o `==` do accordion
que é sensível ao tipo.

Fora do construtor a normalização é outra, e engana do mesmo jeito: nas páginas tipo **Arquivo** (os
CSS/JS do site), o admin guarda o corpo com **quebras de linha CRLF e sem a quebra final** (medido em
outubro de 2026). O sha do arquivo local nunca bate com o do campo salvo; normalize os dois lados
(CRLF → LF, sem espaço final) antes de comparar.

## 28. `Publicar` também limpa a seleção, e o modal de confirmação não é `.ui-dialog`

Duas coisas pequenas que juntas custaram uma leitura errada, medidas em 2026-08-11.

**`Publicar` zera a seleção da grade**, igual ao `Limpar cache` (o 22e documentava só o segundo).
Depois do `OK`, a linha volta desmarcada e a próxima trava de alvo aborta com 0 marcadas.

**O modal de confirmação é alertify, não `.ui-dialog`**: os containers são `.ajs-dialog` /
`.ajs-content` / `.ajs-buttons`. E o pior:

⚠️ **as instâncias fechadas ficam no DOM com `offsetParent !== null`.** Procurando o modal do
`Limpar cache` eu li `"Você tem certeza que deseja publicar esta(s) página(s)?"` — a pergunta
**anterior**, já respondida. Se eu tivesse clicado no `OK` que achei por perto sem olhar, teria
disparado a ação errada.

Checagem que funciona (`offsetParent` não serve aqui):

```js
[...document.querySelectorAll('.ajs-dialog')].filter(x => {
  const s = getComputedStyle(x);
  return s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
})
```

Medido: **2** `.ajs-dialog` no DOM e **0** visíveis de verdade. O `screenshot` resolveu em um passo —
é o item **M.2** aplicado a modal em vez de animação: quando a conclusão é sobre *o que está na tela*,
olhe.

Por script, `clicarOkDoModal(/cache/i)` de `scripts/injetar.js` faz essa conta e clica só no `OK` de dentro
do único modal na tela, aberto pelo `limparCache(#)` que acabou de rodar (ele anota antes os modais na tela e
aborta se já houver algum). A função recusa pergunta que fale de publicar ou excluir, e continua recusando.
Quando a pessoa pede o `Publicar`, nomeando o botão e a página, o caminho é outro, com as mesmas contas e sem
clique por script: `prepararPublicar` e `prepararOkDoPublicar` conferem a linha e o modal e só rotulam o botão e
o `OK` para um clique real da ferramenta em cada um (`gravacao-arquivo-e-head.md`, "Publicar, quando a pessoa
pede"; medido em 2026-10-22, numa loja: o modal pergunta "Você tem certeza que deseja publicar esta(s)
página(s)?", e o `OK` pela ferramenta publicou).

## 22g. Com o construtor ABERTO, query ampla no `document` acerta a grade e troca o diálogo

Irmã da 22a, e tão perigosa quanto — só que aqui o erro não é coordenada, é **escopo de seletor**.
Medido em 2026-08-11: com o construtor aberto por cima do diálogo `Alterar Página`, procurei o "+" de
adicionar bloco com

```js
document.querySelectorAll('i.fa-plus-circle')   // ⛔ varre o documento inteiro
```

e o primeiro resultado foi o **`Incluir` da grade de Páginas**, que continua no DOM atrás do
construtor. O clique **trocou o diálogo**: o título virou **"Adicionar Página"** com `Nome`, `Loja`,
`URL` e `Tipo` **vazios**. Um `Confirmar` ali cria página nova em produção. Descartei com
`location.reload()`, que não dispara POST nenhum — é a saída segura para qualquer diálogo em que você
não sabe mais o que está aberto.

⚠️ **`dialogoUnico()` não protege disto:** continuava havendo **1** `.ui-dialog` no DOM — o mesmo nó,
com outro conteúdo. As travas da skill cuidam de *dois diálogos*, não de *um diálogo que virou outro*.
A defesa é olhar: `screenshot` depois de qualquer clique que você não tenha certeza de ter escopado. Desde
2026-10, `confirmarGravacao` e `confirmarArquivo` também recusam um diálogo cujo título começa com
"Adicionar" (`ehDialogoDeCriacao`); criar um Arquivo, só com o pedido da pessoa, tem caminho próprio
(`gravacao-arquivo-e-head.md`, "Criar um Arquivo novo").

Os seletores certos dentro do construtor, lidos do DOM:

| alvo | seletor |
|---|---|
| "+" que adiciona bloco | `button[ng-click*="builderController.addBlock"]` |
| item da paleta (Box, Editor, …) | `[ng-click="builderController.createBlock(blockKey)"]` |
| árvore de blocos | `.block-tree-item-info` (o rótulo), `.block-child` (o grupo) |

E a regra geral: **enquanto o construtor estiver aberto, escope toda busca no painel dele**, nunca em
`document`. O admin não descarta a tela de baixo.

## 29. ⭐ O campo `style` é guardado em **SCSS aninhado** — o twig compilava, o React não

Descoberto em 2026-08-11 comparando a mesma página antiga, ainda não migrada, nos dois front-ends. O que está guardado
no campo `Blocos:` (e entregue como `blockStyle` pelo site novo) são **319 chars de SCSS**:

```scss
.titulo {
    margin: auto;
    .font-clara {          /* <- aninhamento: isto NÃO é CSS */
        h2{ color: white; font-weight: 600; }
        p{ color: white; }
    }
}
.font-escura { h2{ font-weight: 600; } p{ } }
```

O que a página antiga **renderiza** no primeiro `<style>` do documento são **175 chars de CSS plano**,
com as mesmas cinco regras achatadas (`.titulo .font-clara h2{…}`). Ou seja: **o construtor twig
compilava o campo; o renderizador novo o injeta cru**, e o navegador descarta o bloco aninhado inteiro
(medido em agosto de 2026; num navegador com aninhamento nativo, Chrome 120+ e Safari 17.2+, parte do
aninhamento simples pode aplicar, e a sua prévia num Chrome atual pode parecer certa: `mapa-do-admin.md`,
seção 3). A conclusão não muda: escreva CSS plano, porque quem visita com navegador sem aninhamento não vê
nada.

Três consequências, e a segunda é a que morde:

1. **A instrução do passo 1 do `construtor.md` — ler o CSS no primeiro `<style>` do documento — está certa, mas
   por um motivo que ela não diz:** aquilo é a **saída compilada**, não o campo. Continue usando essa
   fonte.
2. ⚠️ **O "plano B" da mesma seção — abrir o diálogo e ler o campo `Blocos:` — devolve SCSS.** Copiar
   esse texto para a página nova não dá erro, não aparece no validador, e **simplesmente não estiliza
   nada** no navegador sem aninhamento nativo. As duas fontes que a skill trata como equivalentes estão em
   **linguagens diferentes**.
3. **Qualquer página antiga ainda não migrada já está no ar no tema novo com o CSS morto** — ver item
   30. É parte do motivo de elas parecerem "quase certas" e estarem erradas.

Se precisar do campo mesmo assim, achate à mão; não existe compilador no caminho novo. E ao **gerar**,
escreva sempre CSS plano — o que a skill já manda por outros motivos (regra 4 / item 0).

## 30. ⭐ O site novo já serve TODAS as páginas antigas — migrar é substituir, não criar

É tentador tratar "site antigo em twig" e "site novo em React" como dois mundos — na loja medida, um
em `www.` e outro em `novo.` (os hosts da sua loja ficam no perfil dela). **Não são: o registro de
página é o mesmo, e os dois front-ends o renderizam.** Medido em 2026-08-11:

```
https://novo.SUA-LOJA.com.br/troca-ou-devolucao   -> 200, __NEXT_DATA__ presente
   pageParams.type 25 · blockList com 15 blocos e 3 RAÍZES · blockBodyClass "<o da página antiga>"
   blockStyle: os 319 chars de SCSS do item 29 (mortos)
```

Isto é a página antiga — **não migrada** — entregue pelo React. Consequências que mudam o
planejamento:

- **A página antiga não está "esperando ser migrada": ela já está no ar no tema novo**, sem raiz
  Mobile (as 3 raízes são as 3 seções, todas `both`), com o CSS de página morto e com a tipografia
  deformada pelo `body` de 16px (item 11c). O risco de **não** migrar é maior do que a skill sugere.
- **Reproduzir uma página não é criar uma URL nova** — é preparar a substituição de um conteúdo que já
  responde nos dois hosts.
- ⚠️ **A sua página `-v2`, depois de publicada, também responde nos DOIS** (medido: o host antigo
  serviu uma `/troca-e-devolucao-v2` com 109 KB via twig e o novo com 198 KB via React). Se a `-v2` é rascunho,
  ela está acessível em produção — e a única proteção continua sendo a coluna `Robots` do cadastro
  (item 7), não o subdomínio.
- Corolário útil para verificar: dá para ver **como a original se comporta no tema novo** sem migrar
  nada, buscando o slug antigo no host novo. É um par de comparação de graça, e mostra exatamente o
  que a migração tem de consertar.

## 31. O `body` do tema novo é `#f8f8f8`; o da original é `#fff` — seção sem fundo muda de cor

Medido nas duas pontas com `getComputedStyle(document.body).backgroundColor`, numa loja (rode a mesma
linha na sua; o tom pode variar com a configuração da loja):

| | `body` |
|---|---|
| original (twig) | `rgb(255,255,255)` |
| tema novo (React) | **`rgb(248,248,248)`** |

Seção com `background.enable: false` é transparente nos dois lados — então ela **muda de cor sozinha**
na migração, sem nada no JSON denunciar. Na `/troca-ou-devolucao` a faixa 2 (sem fundo) caiu a **5
unidades** da faixa 3 (`#f3f3f3`) e a fronteira entre as duas seções **sumiu**; na original era branco
contra cinza, uma separação visível.

**Regra prática, irmã da regra de tipografia do item 11c:** em migração, **fundo também é explícito**.
Se a original mostra branco, grave `background.enable: true, color: "#ffffff"` — é config de bloco,
não custa CSS de página e não vaza. Só deixe transparente quando você quiser de fato o fundo do tema.

⚠️ Nenhum dos dois scripts pega isto: o `verificar_paridade.py` não compara cor de fundo e o JSON está
"correto". Quem pega é o **screenshot** — foi assim que apareceu aqui (item 21, ponto 3: use imagem
para fidelidade, não só para presença).

## 32. Duas famílias de tema: o que muda de uma loja para outra

Medido em outubro de 2026, comparando uma loja da família `/dist` com uma da família `modelo-1`
(`SKILL.md`, "Família do tema"). Cada linha é só um ponteiro: a explicação mora no arquivo citado. Antes de
usar um fato da skill que dependa do tema, veja de qual família ele é e qual é a da sua loja (perfil).

Do tema (o que se viu na `modelo-1` e não na `/dist`, salvo a primeira linha):

- **A camada da plataforma era a mesma nas duas** (`platform.<hash>.css`/`.js`, mesmo hash no mesmo dia): o
  que vem dela vale nas duas. → `catalogo-tema-base.md`, as partes marcadas "plataforma"
- **A cascata se inverte**: na `/dist` o SCSS de Personalização vem depois dos links da loja; na `modelo-1`,
  antes deles e do CSS do construtor. → `ajustes-visuais.md`, 1.1 (quadro "A ordem depende da família do
  tema"), e `medir-no-navegador.md`, 1 (`folhasEmOrdem`, com o veredito)
- **A Barra do Topo fica dentro do cabeçalho fixo** no computador (`.header-container > .header-top-bar`).
  → `catalogo-modelo-1.md`, seções 1 e 9
- **Cabeçalho flutuante só na home** (`use-floating-header`), com quatro estados para desenhar (o topo, a
  home rolada, as outras páginas e o celular). → `catalogo-modelo-1.md`, seção 1
- **Selo e etiquetas**: as etiquetas do admin vêm com `style=""` inline, e o selo de % do tema não tem
  `!important`. → `catalogo-modelo-1.md`, seções 3 e 5
- **Lista de produtos sem `.product-list`** (só as vitrines têm). → `catalogo-modelo-1.md`, seção 4
- **O rodapé dentro de `#area-body`** numa home do construtor. → `catalogo-modelo-1.md`, seção 16
- **O tema não estiliza a barra da agenda (`.promotionBar`) nem define a função `countdown`** (a barra não
  foi vista no ar nessa família). → `temas-sazonais.md`, seção 5

Da loja e do admin (mudaram junto, mas não se sabe se dependem da família):

- **Carrinho e outras rotas em Next.js** dentro do site twig: sem o tema, sem os Arquivos, sem a classe de
  época. → `mapa-do-admin.md`, seção 15
- **Logo SVG com `<style>` próprio**, que pinta a classe dele no documento inteiro. → `mapa-do-admin.md`,
  seção 8
- **Cache dos Arquivos e CDN**: `max-age=86400` com Cloudflare numa loja; `max-age=1800`, sem CDN visível,
  noutra. → `mapa-do-admin.md`, seção 5
- **Filtros da tela Páginas diferentes**, sem o filtro `#` num admin. → `gravacao-construtor.md`, "Navegar
  a tela Páginas por script"
- **A chave `skin` da agenda pode nem existir** (agenda nunca usada). → `gravacao-arquivo-e-head.md`,
  "Campo que nunca foi usado"
- **Uma home só**, a mesma há muito tempo, em vez de uma por campanha. → `mapa-do-admin.md`, seção 4
- **A chave do SCSS de Personalização** apareceu (`modeloScssAfterAll`). → `mapa-do-admin.md`, seção 1
- **Sem o filtro Loja, a tela de Cache mostra outra linha `loja_config`**. → `gravacao-arquivo-e-head.md`,
  Passo G

## 33. A origem responde a qualquer `?v` com o conteúdo atual: gravar o Arquivo sem subir o número não deixa a mudança fora do ar

É fácil pensar que, enquanto o `<head>` pede `/seu-tema.css?v=8`, o conteúdo novo do Arquivo fica guardado,
esperando o `?v=9`. Não fica. O número no `<head>` não escolhe uma versão do arquivo: a origem só tem uma, a
atual, e entrega essa a qualquer query. É o que a skill usa no backup: baixar o arquivo com uma query que
nunca foi usada (`?nc=<agora>`) devolve o conteúdo de agora do admin (`gravacao-arquivo-e-head.md`, Passo A).

Daí: quem não tem cópia guardada (o visitante novo, o navegador cuja cópia venceu pelo `max-age` e, numa loja
com CDN, a borda quando a cópia dela expira) recebe o conteúdo novo pelo endereço com o número **antigo**,
assim que você grava o Arquivo. O número novo garante que **todos** recebam a versão nova; ele não garante que
**ninguém** a receba antes. Isto é dedução do comportamento do `?nc=`, não uma medida direta com um visitante.

O que muda na prática:

- uma mudança que mexe no visual não fica "fora do ar" entre o `Confirmar` do Arquivo e o número novo no
  `<head>`: trate a gravação do Arquivo como o lançamento, e grave só o que foi aprovado;
- numa mudança em duas peças (CSS + JS), a gravação do CSS sozinha só é segura se as peças tiverem o aperto de
  mão (`ajustes-visuais.md`, 2.6, item g): sem ele, a parte do CSS age antes do JS chegar
  (`gravacao-arquivo-e-head.md`, "Mudança em duas peças: a ordem");
- num tema de época, a proteção é a classe que ainda não está no `<body>`. Num tema de época cuja classe já
  está no ar, gravar a seção nova é lançar: `temas-sazonais.md`, 3, "Quando a classe do tema já está no ar".

## 34. A trava abortou, mas a tela diz que estava tudo certo: trava com defeito de leitura

Medido em 2026-10-22, numa loja: `limparCacheConfigLoja()` abortou dizendo que o filtro Loja não estava na
loja do perfil. Na tela, estava: o filtro tinha a loja certa escolhida (opção `string:N`), e a grade tinha uma
linha `loja_config` só, marcada. O defeito era da leitura: o filtro Loja era um seletor "bootstrap", e
`rotuloDoCampo` leu como rótulo os nomes das lojas da lista escondida dele, em vez de "Loja". A sessão
conferiu à mão as mesmas condições da trava e limpou pela tela, e anotou a dúvida: isto é contornar a trava,
ou é o caminho manual?

A resposta tem dois lados:

- **a trava que acertou** (a condição que ela exige é falsa: outra linha marcada, outra loja, outro diálogo):
  pare, releia o que está selecionado e em qual loja, e pergunte. Fazer pela tela o que a função recusou é
  exatamente o acidente que ela evita;
- **a trava com defeito de leitura** (a condição é verdadeira, e a função não conseguiu ler): também pare, e
  mostre à pessoa a evidência, o que a função leu e o que a tela mostra, com um screenshot. Depois, uma de
  três: (a) corrigir a leitura e rodar de novo; (b) a pessoa fazer pela tela; (c) com o OK dela para aquela
  ação, você fazer o mesmo passo pela tela, depois de conferir pelo DOM as mesmas condições da trava, e anotar
  no histórico do perfil como foi. Nunca em silêncio, e nunca para uma condição que você não conseguiu
  provar.

Este caso foi corrigido em `injetar.js` (2026-10; testado num DOM falso e, desde 2026-11-02, rodado no admin
de uma loja, onde `limparCacheConfigLoja` limpou com o filtro lido como "valor + nome (rótulo ilegível)"): o rótulo ignora
o que não está desenhado e as listas dos seletores, e o filtro Loja de rótulo ilegível passa pelo valor da
opção **e** pelo `lojaNome` de `definirLoja` (`filtroLojaDoPerfil`). A regra fica para o próximo defeito de
leitura (`SKILL.md`, regra zero; `gravacao-arquivo-e-head.md`, Passo G).

## 35. Carrossel girando parece diferença de CSS

Medido em 2026-11, numa loja (família `/dist`). A tarefa era provar que a versão sem comentários de um tema não
mudava a tela, trocando o arquivo na mesma carga da página e comparando o estilo e a caixa de cada elemento. No
produto e na categoria, a troca deu 0 diferenças. Na home, deu 286; numa segunda rodada, 575. Todas estavam dentro
de `.owl-stage`, a faixa dos carrosséis Owl da home, que giram sozinhos, e nenhuma fora. Duas fotos sem troca
nenhuma, com o mesmo intervalo, davam 0 ou centenas, conforme um slide passava ou não entre elas. Com o autoplay
dos 5 carrosséis parado (`jQuery('.owl-carousel').trigger('stop.owl.autoplay')`), a home deu 0 antes, durante e
depois da troca.

O que fazer: antes de concluir que um CSS mudou a tela, separe o que se mexe sozinho. É a regra 2 do item M,
aplicada à comparação. O `scripts/conferir_troca.mjs` já faz isso:

- para o autoplay que reconhece (Owl e Slick, com jQuery; Swiper), os vídeos e as animações;
- tira duas fotos antes da troca e duas depois;
- o que muda entre as duas do mesmo lado sai da conta e é listado à parte, com o bloco em que está.

O que fica fora da conta não foi conferido. Se a lista de instáveis for grande, ou cair num bloco que importa
para a mudança, pare esse bloco de outro jeito e rode de novo.
