# Catálogo de blocos e schema

Índice:
1. [Estrutura da página](#1-estrutura-da-página)
2. [Campos de raiz do bloco](#2-campos-de-raiz-do-bloco)
3. [Config base](#3-config-base-13-chaves-em-todo-bloco)
3b. [Escopo do CSS de página](#3b-escopo-do-css-de-página)
3c. [O mapa config → CSS, e o que o servidor poda na entrega](#3c-o-mapa-config--css-e-o-que-o-servidor-poda-na-entrega)
4. [Os 13 tipos](#4-os-13-tipos)
5. [Config específica por tipo](#5-config-específica-por-tipo)
6. [Dicionário interface ↔ JSON](#6-dicionário-interface--json)
7. [Tipos de página](#7-tipos-de-página)

Os defaults abaixo foram extraídos criando um bloco de cada tipo no construtor e lendo o JSON que ele
próprio gerou. São os valores oficiais atuais — o construtor é da plataforma, então valem para qualquer
loja Panorama. Quando este arquivo fala do "tema" (o bundle, as classes, as utilidades de grid), é o
front-end novo (React/Next), medido numa loja em agosto de 2026: ele é da plataforma, mas muda com as
versões, então confira na sua (`SKILL.md`, "Família do tema"). As medições (tamanhos, contagens) foram
feitas em lojas reais; ids de mídia, de vitrine, de tipo de banner e de página aparecem aqui como
marcadores (`NNNNNN`), porque cada loja cadastra os seus. Os da sua loja ficam no perfil dela
(`~/panorama-lojas/<slug-da-loja>.md`).

As regras citadas como "regra N" e os passos como "passo N" estão em `construtor.md`.

---

## 1. Estrutura da página

O que o admin guarda — é isso que vai no campo `Blocos:` (ver `gravacao-construtor.md`):

```jsonc
{
  "style": "",           // CSS da página. Prefira vazio; CSS recorrente pertence ao tema
  "block_list": [ … ],   // DUAS raízes: Desktop e Mobile
  "body_class": "",      // classe aplicada no <body>
  "config": {            // flags de header/footer, valores em STRING
    "header_is_floating": "false", "header_is_floating_mobile": "false",
    "header_top_bar_hide": "false", "header_hide": "false", "footer_hide": "false"
  }
}
```

O construtor usa um formato ligeiramente diferente no campo `syncData` (`{style, block_list, preview}`
— com `preview`, sem `body_class` nem `config`). Para gerar, use o formato do campo `Blocos:` acima.

O que o front-end recebe em `pageProps.pageParams.layout`:

```jsonc
{
  "blockList": [ … ],      // camelCase, e já cortado por device
  "blockStyle": "…",        // = style
  "blockConfig": { … },     // = config
  "blockBodyClass": "…"     // = body_class
}
```

⚠️ Admin usa `block_list` / `body_class` / `config`; front-end entrega `blockList` / `blockBodyClass` /
`blockConfig`. Ao gerar para o admin, use snake_case.

Header e footer não são blocos: vêm do layout base e só se controlam pelas flags de `config`.

### As duas raízes

`block_list` tem exatamente dois itens, cada um um `block` envolvendo a página inteira:

```jsonc
[
  { "type": "block", "id": "d3sk7p0a", "name": "Desktop", "device_show": "desktop",
    "child": [ /* a página para computador */ ], "config": { /* base */ } },
  { "type": "block", "id": "m0b1l3x9", "name": "Mobile", "device_show": "mobile",
    "child": [ /* a página para celular */ ], "config": { /* base */ } }
]
```

**O corte acontece no servidor.** Medido numa página real: admin com 208 blocos (106 na Desktop, 102 na
Mobile), front-end de desktop recebendo 105. A subárvore Mobile não sai do servidor, e o campo
`device_show` é removido do JSON entregue depois de usado.

As duas árvores não precisam ser iguais — é a vantagem do modelo. No mobile a ordem pode mudar, seções
podem sair, imagens podem ser outras.

No construtor, o botão `Computador | Celular` do rodapé alterna qual raiz está sendo editada. Não é
preview.

## 2. Campos de raiz do bloco

Gere estes seis. É o que o construtor produz ao criar um bloco:

```jsonc
{
  "type": "block",         // um dos 13 tipos da seção 4
  "id": "k7082hnm",         // 8 chars [a-z0-9], único DENTRO da página
  "name": "",               // painel: GERAL → Nome do Bloco. Rótulo só para o admin
  "child": [],              // filhos. Qualquer bloco aceita, mas faz sentido em block/modal
  "opened": false,          // estado de expansão na árvore do admin. Ruído; deixe false
  "device_show": "both"     // painel: GERAL → Exibir em
}
```

**Só três são realmente obrigatórios:** `type`, `id` e `config`. Numa página real, 21 de 208 blocos
tinham apenas esses três e renderizavam bem — o renderizador tolera a ausência do resto. Isso importa
por dois motivos: não se assuste ao ler página antiga com blocos magros, e não conclua que um JSON está
quebrado só porque falta `opened` ou `name`. Ao **gerar**, mande os seis: é o que o construtor faria, e
uniformidade facilita a vida de quem for editar depois.

⚠️ **Com uma ressalva medida em 2026-08-12: o construtor NÃO emite `child` em bloco `editor`.** Lido do
`syncData` de um `Editor` recém-criado, as chaves de raiz são `type, id, opened, device_show, name,
config` — sem `child` (o `Box` sai com as sete, `child` incluído). Como o servidor **descarta array
vazio** na gravação (item 27 do `armadilhas.md`), mandar `child: []` no `editor` é inofensivo e mantém o
JSON uniforme; só não conclua, ao comparar com o construtor, que o seu gerador está errado.

Campos que aparecem em páginas antigas e que você **não** deve gerar:

| Campo | O que é |
|---|---|
| `parentId` | **O renderizador reescreve.** Ao descer na árvore ele faz `parentId && (t = {...t, parentId})` com o id do pai real, então o que você escrever em bloco filho é sobrescrito (em bloco de raiz não há pai e o seu valor sobrevive, sem consumidor). Numa página medida, 16 blocos tinham o campo e **nenhum** apontava para o pai real. Não gere |
| `only_desktop` / `only_mobile` | Geração anterior do controle de device. Estavam `false` em todos os blocos onde apareciam — vestígio sem efeito. Hoje é `device_show` |

⚠️ **Na entrega, o bloco fica com CINCO chaves de raiz: `type`, `id`, `name`, `config` e `child`.**
Contado nos 111 blocos entregues de uma home real (os **218** gravados menos a raiz Mobile; a mesma home
aparece com `234 → 119` em outros lugares da skill, que é a versão anterior à troca do FAQ — ver
`armadilhas.md` item 12): `opened`, `device_show`, `parentId` e o resto somem.
Duas consequências: **ler uma página no ar não te diz quais chaves você pode escrever** (é o motivo
mecânico da regra 1 do `construtor.md`), e **`name` não é só rótulo de admin** — o `accordion` usa `name`
como título quando `config.title` está vazio (ver a seção dele).

Campos observados em `block` de páginas antigas, não presentes em blocos criados hoje, **utilidade não
verificada**: `title`, `subtitle` e `title_device_show` (título de seção nativo no container;
`title_device_show` aceita `"both"` e `"hidden"`). Pode ser um recurso útil que ninguém usa, pode ser
legado. Se for testar, teste na página de rascunho combinada com a pessoa (regra zero do `SKILL.md`).

### `device_show`

| Valor | Painel |
|---|---|
| `"both"` | Ambos |
| `"desktop"` | Computador |
| `"mobile"` | Celular |
| `"none"` | Nenhum — bloco aparece acinzentado na árvore |
| `"hidden"` | (observado em página antiga, sem equivalente no painel) — **não renderiza**, igual a `"none"` |

⚠️ **`"hidden"` existe em produção** — uma seção inteira da home antiga. A dúvida de versões
anteriores desta skill (`"none"` ou ignorado?) está resolvida pelo código do renderizador, que só
renderiza em três casos:

```js
let s = t?.device_show || "both";
if (!("both" === s || "mobile" === s && r || "desktop" === s && !r)) return null;   // r = isMobile
```

Qualquer valor fora de `both`/`mobile`/`desktop` — `"hidden"`, `"none"`, um erro de digitação —
**cai no `return null` e o bloco desaparece com a subárvore**, sem erro no console. Ao migrar, não
replique `"hidden"`: decida se a seção entra e use `"none"` (ou não gere o bloco).

Este é o mecanismo nativo de visibilidade por device, e é o mesmo campo do construtor twig antigo.

**Verificado: corta no servidor.** Numa página real, o admin guardava 208 blocos e o front-end de
desktop recebeu 105 — a subárvore com `device_show: "mobile"` não foi enviada, e o campo `device_show`
foi removido do JSON entregue depois de consumido. Não é esconder com CSS: é não renderizar.

Por isso o padrão das duas raízes (seção 1) é melhor que duplicar bloco e esconder com classes
`only-desktop` / `only-mobile`, como fazem páginas mais antigas: naquele padrão as duas variantes
viajam no HTML e uma é escondida.

Dentro de cada raiz, `device_show` em bloco individual continua válido, mas raramente é necessário —
se a diferença é grande, ela pertence à outra árvore.

## 3. Config base (13 chaves, em todo bloco)

```jsonc
{
  "positioning": "initial",
  "place": "top: 0px; left: 0px;",
  "display": {
    "type": "flex",                    // flex | block | grid  (painel: Flexível | Bloco | Grid)
    "direction": "row",
    "alignItems": "flex-start",
    "justifyContent": "flex-start",
    "gap": "0px",
    "flex_wrap": false
  },
  "flexBehavior": { "enable": false, "flex_grow": 0, "flex_shrink": 1, "flex_basis": "0px" },
  "spacing": { "enable": false },
  "padding": { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" },
  "margin":  { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" },
  "background": { "enable": false, "color": null, "image": { "id": "", "nomeArquivo": "" },
                  "repeat": "repeat", "positionX": "50%", "positionY": "50%",
                  "size": "auto", "size_custom": 0, "backgroundPreview": [] },
  "dimensions": { "enable": false, "width": null, "height": null, "responsive_width": false },
  "class": "",
  "customize_borders": { "enable": false },
  "border": { "width":  { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" },
              "style": "solid",
              "color": null,
              "radius": { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" } },
  "overflow": "visible"                // visible | hidden | auto
}
```

⚠️ **Cinco campos aqui já foram documentados errado.** O bloco acima foi relido do `syncData` de um
`Box` criado pelo construtor em 2026-08-10; se você viu outra coisa numa versão anterior desta skill,
esta é a correta. Os que mudaram de tipo, porque é onde o erro passa despercebido:

| campo | valor **errado** que circulou | valor real |
|---|---|---|
| `background.size_custom` | `""` | `0` |
| `background.backgroundPreview` | `""` | `[]` |
| `dimensions.width` / `height` | `""` | `null` |
| `dimensions.responsive_width` | `""` | `false` |
| `border.width` / `border.radius` | `""` (string) | **objeto** `{apply,type,top,right,bottom,left}` |
| `border.style` / `border.color` | `""` / `""` | `"solid"` / `null` |

Se for gerar JSON, **releia o default vivo em vez de confiar nesta tabela**: crie um Box no construtor
da sua própria página de rascunho (regra zero do `SKILL.md`) e leia
`document.querySelector('input[name=syncData]').value`. É a única fonte que não envelhece.

✅ **Reconferido em 2026-08-12** numa página de rascunho, nos três tipos que uma página institucional usa: `block`
(13 chaves), `editor` (14, a extra é `code: ""`) e `imagem` (20, as 7 específicas exatamente como a
seção 5 as lista). Bate **campo a campo** com o bloco acima, inclusive os seis que já estiveram
errados. Duas conferências limpas seguidas (11 e 12/08) — mas o custo de conferir é um Box, e é
justamente por conferir que se sabe disso.

**Os toggles importam.** `padding.apply`, `margin.apply`, `spacing.enable`, `background.enable`,
`dimensions.enable`, `customize_borders.enable`, `flexBehavior.enable`: quando `false`, os valores do
grupo são ignorados na renderização. Ligue junto com preencher.

⚠️ **`background.enable: false` não é "fundo branco" — é transparente, e os dois sites têm cores de
`body` DIFERENTES.** Medido: `#ffffff` na original (twig) contra **`#f8f8f8`** no tema novo. Logo toda
seção sem fundo **muda de cor sozinha** na migração, sem sintoma no JSON e sem o `verificar_paridade.py`
notar. Na `/troca-ou-devolucao` isso pôs a faixa sem fundo a **5 unidades** da faixa vizinha `#f3f3f3` e
a fronteira entre as seções desapareceu. **Em migração, trate fundo como trata tipografia: explícito.**
Se a original mostra branco, grave `background.enable: true, color: "#ffffff"`. `armadilhas.md` **31**.

⚠️ **`padding` e `margin` de bloco SUBSTITUEM os do tema — não somam.** Medido: uma `col-sm-6` com
`padding.apply: true`, `top/bottom: "50px"` e `right/left: "0px"` renderiza `padding: 50px 0px` — os
**12px laterais que o tema dá à coluna somem**, e o texto cola na borda. Se você só quer espaçamento
vertical numa coluna, **repita o lateral** (`right`/`left` com o gutter que você quer). O mesmo vale
para `margin` — é assim que se neutraliza a margem negativa do `.row` (ver seção de grid).

O mecanismo, porque ele muda o que "substituir" significa: a config **não** emite a propriedade
`padding` inteira — emite **quatro longhands**, `padding-top/right/bottom/left`, um por lado
preenchido (mapa completo em 3c). Então `"0px"` num lado **zera** o do tema, e um lado deixado
**vazio (`""`)** produz uma declaração inválida (`padding-left: ;`) que o navegador descarta — nesse
caso o do tema **sobrevive**. Sair repetindo o lateral é a receita segura porque não depende dessa
sutileza; o comportamento do lado vazio foi lido no bundle e **não medido no ar**.

`display` é o **flexbox do bloco** — não confundir com visibilidade, que é `device_show`.

`place` no formato atual é CSS literal (`"top: 0px; left: 0px;"`). Páginas legadas têm `"top left"`;
não replique esse formato.

## 3b. Escopo do CSS de página

⭐ **O `body_class` fica no `<body>`, então TODA regra do campo `style` alcança header, rodapé e
elementos flutuantes.** Isto está aqui porque metade das configurações deste catálogo se resolve com uma
regra de CSS — e a regra `.SEU-BODY-CLASS .pano-link-anchor{…}` (sem escopo no miolo), escrita para
**duas** imagens do miolo, pegou **127** elementos (96 no `<header>`) e levou o logo do cabeçalho de 180×60 a **945×313**.

Três fatos, que é o que você precisa para escrever uma regra aqui:

1. **Escope no `<main>` do tema**, não nas suas próprias classes (escopar em `.meia-promo`/`.moldura-categoria`
   pegou 10 das 17 âncoras do miolo):
   ```css
   .SEU-BODY-CLASS #layout-main-content .pano-link-anchor{display:block;width:100%}
   ```
2. **O que vaza é classe DO TEMA** (`pano-*`, `swiper-*`). `.container` e `.row` deram **0 ocorrências**
   em header/footer — é por isso que as receitas de grid da seção 6 podem escopar só pelo `body_class`.
3. **Antes de escrever, conte as ocorrências** da classe em `header`, `footer`, fora dos dois **e nos
   filhos aninhados do alvo** (o carrossel dentro do carrossel do card de produto:
   `armadilhas.md` 24a).

Medidas completas, o que quebrou e a técnica de prova com página de controle: `armadilhas.md` item **0**.
`scripts/verificar_paridade.py` faz essa conferência e já sugere o seletor escopado.

## 3c. O mapa config → CSS, e o que o servidor poda na entrega

Esta seção existe porque metade das surpresas de layout deixa de ser surpresa quando você sabe **quais
chaves de config viram CSS e quais não viram nada**. Lido no bundle do tema (`app.js`), é uma tabela
literal — só o que está nela é emitido:

| config | CSS emitido | | config | CSS emitido |
|---|---|---|---|---|
| `display.type` | `display` | | `padding.top/right/bottom/left` | `padding-top/right/bottom/left` |
| `display.direction` | `flex-direction` | | `margin.top/right/bottom/left` | `margin-top/right/bottom/left` |
| `display.alignItems` | `align-items` | | `dimensions.width` / `.height` | `width` / `height` |
| `display.justifyContent` | `justify-content` | | `background.color` | `background-color` |
| `display.gap` | `gap` | | `background.repeat` | `background-repeat` |
| `flexBehavior.flex_grow` | `flex-grow` | | `background.positionX` / `positionY` | `background-position-x` / `-y` |
| `flexBehavior.flex_shrink` | `flex-shrink` | | `background.size` | `background-size` |
| `flexBehavior.flex_basis` | `flex-basis` | | `overflow` | `overflow` |
| `positioning` | `position` | | | |

Fora da tabela, com tratamento especial: `place` (a string é quebrada em `; ` e depois em `:` — é por
isso que o formato tem de ser `"top: 0px; left: 0px;"` e o legado `"top left"` **não emite nada**),
`background.image` (vira `url("…")`), `border.radius` (só se algum lado estiver preenchido),
`display.flex_wrap` (só quando verdadeiro, e emite `flex-wrap: wrap`), `border.width` (um lado só, ou
os quatro em `border-width`) e `dimensions.responsive_width`. `class` não é CSS: vai para o
`className`. `spacing`, `padding.type` e `margin.type` **não produzem nada**.

Cinco comportamentos do emissor que explicam defeitos reais:

- ⭐ **Todo bloco recebe `display`, e o default é `flex`**: no fim do emissor, depois de tudo, vem
  `t.display || (t.display = "flex")`. Não é o tema nem o Bootstrap — é o construtor. É a raiz do
  `<h2>` e `<p>` lado a lado em bloco de texto e do `<a>` do bloco `imagem` colapsando em 0×0.
- ⭐ **O wrapper de bloco tem `max-width:100%` cravado** (`styled.div(["max-width:100%;", …])`). É
  isso que mata o transbordo da margem negativa do `.row` do tema e encolhe toda coluna em 24px
  (item 13 do `armadilhas.md`, e as três receitas da seção de grid — a terceira não depende disso,
  porque não usa `.row`).
- **Grupo com `enable` falso é apagado antes de virar CSS** — é o outro lado da regra do toggle.
  ⚠️ E há uma armadilha latente: quando `spacing.enable` é falso o emissor apaga **`padding` e
  `margin` junto**, mesmo com `apply: true`. Na prática ela não dispara porque o servidor poda
  `spacing` na entrega (**0 dos 111 blocos** entregues de uma home real tinham a chave) — mas se
  algum dia um `spacing:{enable:false}` chegar ao cliente, todo espaçamento do bloco vai com ele.
- **Valor `null` continua sendo emitido** (o filtro compara com as *strings* `"null"`, `"false"`,
  `"undefined"`, não com os valores), então sai `width: undefined;` — declaração inválida, ignorada
  pelo navegador. Ligar `dimensions.enable` sem preencher não faz nada, e nem avisa.
- `dimensions.width` **está** no mapa. Ainda assim, medido no ar, largura por `dimensions` não pega
  (`armadilhas.md` item 13) — a prática continua sendo classe do tema. Se um dia for tentar, tente
  com `enable: true` **e** valor de verdade, e meça; não confie nesta linha nem na outra sem medir.

### O servidor entrega uma config PODADA

Contado nos 111 blocos de uma home real, comparando o que foi gravado com o que chegou em
`pageParams.layout`: **sobrevive só o que difere do default**. Um bloco gravado com as 13 chaves da
config base chegou assim:

```json
{"display":{"justifyContent":"center"},
 "padding":{"apply":true,"top":"20px","right":"0px","bottom":"20px","left":"0px"},
 "margin":{"apply":true,"top":"20px","right":"0px","bottom":"20px","left":"0px"},
 "background":{"color":"#ffffff"}}
```

`positioning`, `place`, `spacing`, `flex_wrap`, `overflow`, `dimensions`, `border` e até
`display.type` desapareceram — todos estavam no default. Numa vitrine, desapareceram também
`origem: "vitrine"`, `limit: 12`, `display_mode: "slider"`, `showcaseProductLayout: "MODEL_ONE"`,
`showcaseFooterComponent: "NOT_SHOW"` e `midia_size` inteiro.

⚠️ **Consequência que decide método:** a config entregue **não é o catálogo do que você pode
escrever**, e a ausência de uma chave lá não prova que ela não existe nem que não funciona. Quem
monta lendo `__NEXT_DATA__` de uma página no ar conclui que metade dos campos não existe. O catálogo
vem do default que o próprio construtor gera (regra 1 do `construtor.md`); a entrega serve para conferir o
que **chegou**, não para descobrir o que **cabe**.

## 4. Os 13 tipos

A aba `Componentes` da tela `Criar` oferece exatamente 13 — reconferido em 2026-08-11, os mesmos 13 e
com estes nomes. Os nomes internos misturam português e inglês, com um hífen no meio — **não são
adivinháveis**, consulte a tabela.

⚠️ **`Componentes` não é a tela inteira:** ao lado dela existem as abas **`Fragmentos`** (esqueletos de
grid prontos) e **`Modelos`** (páginas completas). Elas não entram nesta tabela porque não são tipos —
mas são a resposta provável para reúso em migração de volume. Ver `armadilhas.md` item **10**.

| Interface | `type` | Chaves | Específicas | Papel |
|---|---|---|---|---|
| Box | `block` | 13 | 0 | Container de layout. O bloco mais usado |
| Logo | `logo` | 13 | 0 | Logo da loja |
| Editor | `editor` | 14 | 1 | Texto rico |
| Código | `code` | 14 | 1 | HTML cru. Exceção justificada |
| Menu em Barra Lateral | `sidebar-menu` | 14 | 1 | Menu lateral |
| Newsletter | `newsletter` | 17 | 4 | Captura de e-mail |
| Menu | `menu` | 18 | 5 | Menu de navegação |
| Vídeo | `video` | 18 | 5 | Player |
| Modal | `modal` | 19 | 6 | Janela sobreposta. Container |
| Imagem | `imagem` | 20 | 7 | Imagem com link |
| Avaliações da Loja | `storerating` | 22 | 9 | Depoimentos e notas |
| Vitrine | `vitrine` | 30 | 17 | Prateleira de produtos |
| Banner | `banner` | 33 | 20 | Carrossel ou grid de banners |

`block` e `logo` não têm nenhuma chave específica: são a base pura.

### O 14º tipo: `accordion`, fora da paleta mas funcional

| Interface | `type` | Chaves | Papel |
|---|---|---|---|
| Expansível | `accordion` | 3 (+`expand`) | Item de FAQ / conteúdo que abre e fecha |

`accordion` **não aparece na paleta**, mas **escrito à mão no JSON renderiza normalmente** —
confirmado com o time de desenvolvimento. Para FAQ, a regra é uma só em toda a skill: em FAQ **novo**
(migração ou página nova), use `<details>/<summary>` em bloco `editor`, e as respostas ficam no HTML. Numa
página que **já** tem FAQ em `accordion`, acrescente no mesmo formato e leve a troca para `<details>` à
pessoa como decisão separada (o `accordion` deixa as respostas fora do HTML até o clique).

⚠️ **O motivo, medido: o corpo do accordion fechado não existe no DOM.** Se o texto das
respostas é parte importante do que a página tem para indexar, o nativo custa esse texto — na home
foram **2.192 chars, 28% do texto da original**. A saída testada é `<details>/<summary>` num bloco
**`editor`** (não `code`: o `editor` guarda o HTML no mesmo campo que o rich text do painel edita).
Leia `armadilhas.md` **18a** antes de escolher — está lá o mecanismo, os dois estados possíveis do
nativo e o CSS que reproduz a caixa da original.

Ele é a exceção à regra de nunca copiar JSON legado, porque não há default oficial para extrair: como
não é criável pela interface, a única fonte é o formato observado em páginas existentes. Veja o formato
na seção 5 e **confirme renderizando na página de rascunho combinada** antes de usar em página real.

A lição maior: a paleta é conveniência da interface, não o contrato. Ver `armadilhas.md` item 1.

## 5. Config específica por tipo

Some estas à config base. Valores mostrados são os defaults.

### `block` (Box) · `logo`
Nenhuma chave específica.

### `accordion` (Expansível) — formato observado, não default oficial

Não segue o padrão de config base. Formato lido de uma página em produção, com 8 deles (textos e id
trocados por exemplos):

```jsonc
{
  "type": "accordion",
  "id": "f4q1x7k2",
  "name": "FAQ 1: Qual o prazo de entrega?",       // rótulo para o admin
  "title": "Qual o prazo de entrega?",             // no NÍVEL DE RAIZ — e INERTE, não é lido
  "subtitle": "",
  "title_device_show": "both",                     // "both" | "hidden" — também não é lido aqui
  "device_show": "both",
  "opened": false,
  "config": {
    "title": "Qual o prazo de entrega?",           // ESTE é o que o renderizador usa
    "variant": "small",
    "class": "faq-item",
    "expand": false                                // openByDefault — leia o aviso abaixo
  },
  "child": [ /* um bloco editor com a resposta */ ]
}
```

O componente inteiro, lido do bundle do tema — são cinco linhas, e elas respondem todas as dúvidas de
formato que este bloco carregava por ser observado em vez de gerado:

```js
({children:e, builderItem:t, ...r}) => {
  let [i,n] = useState(!1);                                  // i = erro de conteúdo vindo do filho
  useEffect(() => { …addListener(`${ON_ACCORDION_CONTENT_ERROR}-${t.id}`, e => n(e?.detail))… }, []);
  let a = t.config.title || t.name;                          // <-- title da CONFIG, ou o name
  return i || !t.child ? null                                // <-- sem child, NADA renderiza
    : jsx("div", {...r, children: jsx(gl, {title:a, openByDefault:t?.config?.expand,
                                          variant:t?.config?.variant, children:e})})
}
```

O que sai disso, ponto por ponto:

- ⚠️ **O `title` da RAIZ não é lido.** O renderizador usa `config.title || name`. Uma versão anterior
  desta skill dizia "preencha os dois iguais, não há como saber qual ele usa" — agora se sabe: o que
  vale é `config.title`. Mantenha o da raiz só porque as páginas existentes o têm; ele é inerte.
  Corolário útil: **sem `config.title` a pergunta vem do `name`**, então não deixe os dois vazios ou
  sobra uma linha clicável sem texto.
- ⚠️ **`accordion` sem `child` não renderiza NADA** — nem a pergunta (`!t.child ? null`). Se um FAQ
  aparecer com itens faltando, confira o `child` antes de suspeitar do CSS.
- ⭐ **Um filho que falha derruba o accordion inteiro.** Ele escuta
  `ON_ACCORDION_CONTENT_ERROR-<id do accordion>` e, ao receber, devolve `null`. Quem dispara é a
  **`vitrine`**: sem produtos, ela faz `trigger(ON_ACCORDION_CONTENT_ERROR-${e.parentId})`, e
  `parentId` é o id do pai **direto**, injetado pelo renderizador (seção 2 — é o único consumidor
  desse campo em todo o tema). Ou seja: `vitrine` como filha direta de `accordion` **apaga o
  accordion** quando a prateleira vem vazia — e com `origem: "operation"` + `operation: "history"`
  isso vale para **todo visitante sem histórico**. É recurso, não bug (esconde seção vazia), mas
  acontece em silêncio e é indiagnosticável sem saber disso.
- **`config` tem só `title`, `variant`, `class` e `expand`** — sem `display`, `padding`, `margin` nem o
  resto da base, e o componente não lê nenhum deles. Não acrescente a base achando que completa: o
  `accordion` **não tem config de layout**, então o respiro entre itens precisa de **1 regra de
  página** (medido: `margin-bottom: 8px` na classe do item).
- **A resposta vem em `child`**, tipicamente um único `editor`. Manter a resposta como `editor` é o que
  permite ao time de conteúdo editar pelo painel.
- `variant` tem **dois** valores e a diferença é visual real: `"small"` (o das páginas existentes) dá
  título `uppercase` pequeno, `padding: 10px 0` e **borda inferior**; ausente ou qualquer outro valor
  cai no default `"big"`, com título maior, sem uppercase e **borda superior**. `class`: `"faq-item"`
  nas páginas existentes, com CSS na página — tente primeiro sem classe.
- `title_device_show` na raiz vem do padrão de `block` antigo; este componente não o consulta.

#### ⚠️ `config.expand` → `openByDefault`: dois estados, e nenhum é o da original

`expand` é a única chave de comportamento do bloco. Ela vira `openByDefault` no componente interno, que
faz `useState(true == openByDefault)` e monta o corpo **condicionalmente** (`o ? jsx("div") : null`):

| `config.expand` | corpo no HTML? | como carrega |
|---|---|---|
| ausente / `false` | **não** | fechado ✅ |
| `true` (**booleano**, não a string `"true"`) | sim ✅ | **aberto** ❌ |

⚠️⭐ **E há uma dúvida aberta que pode tornar a segunda linha inalcançável pelo campo `Blocos:`.**
Medido em 2026-08-11: **o admin converte todo escalar em string ao gravar** — `false` vira `"false"`,
`0` vira `"0"` (`armadilhas.md` **27**). Se isso vale para o `expand`, você grava `true` e o componente
recebe `"true"`; como ele faz `useState(!0 == a)` e em JS `true == "true"` é **`false`**, o accordion
**nunca abriria por default**. Não testei — a página que revelou a normalização não tem `accordion`.
**Teste antes de migrar um FAQ por este caminho**: grave `expand: true`, leia o `__NEXT_DATA__` da URL
e veja se chegou booleano ou string. Se chegar string, o caminho é o construtor (que grava pelo
`syncData`) — ou o `<details>` do `armadilhas.md` 18a, que não depende de `expand` nenhum.

A combinação da página original — **fechado e com o texto no HTML** — é **impossível** no bloco nativo,
e não há saída por CSS: com `expand: true` e o corpo colapsado por regra, o primeiro clique põe o estado
em `false` e **desmonta** o conteúdo, então o item nunca abre. Medido na home: 8 perguntas renderizando
e 8 respostas (9 `<p>`, **2.192 chars**) fora do DOM, **28,0% do texto da original** presente; trocando
por `<details>` em bloco `editor`, **100,0%**. O mecanismo, o preço de cada caminho e o CSS que
reproduz a caixa da original estão em `armadilhas.md` **18a** — leia antes de escolher.

#### ✅ Verificado em produção: renderiza e abre

8 `accordion` escritos à mão renderizaram e **abriram ao clique** (item de **55px → 138px**), com o
`editor` filho exibindo a resposta. Procurar o texto da resposta no HTML com o item fechado dá **falso
negativo** — é o item 18 do `armadilhas.md`.

O visual é o do **tema novo**, não o da página antiga: `.pano-accordion-section` com padding `10px 0` e
borda inferior, título em `text-transform: uppercase` 12px, marcador em SVG 20×20. A original medida
tinha caixa branca, borda `1px` clara, radius 7px, a cor primária da loja, 16px e um "+"
textual. Altura do item:
**55px na nova contra 61,6px na original**. Não é bug: é decisão de pessoa se a paridade visual importa.

⚠️ **As classes do tema são hash de styled-components** (`.foayRI`, `.dGBZmQ`) e **mudam a cada
build** — ancore o seu CSS na sua própria `class`, nunca nelas.

**Verifique renderizando** antes de entregar em página real: é o único tipo do catálogo sem default
oficial, e portanto o único onde vale desconfiar do que está escrito aqui.

### `editor` · `code`
```jsonc
{ "code": "" }
```
Os dois guardam HTML na **mesma chave** e os dois o injetam **cru**, por
`dangerouslySetInnerHTML: {__html: config.code}`. A diferença é de ferramenta e de wrapper, não de
poder: `editor` é o que o rich text do painel edita (o time de conteúdo mexe sem ver JSON), `code` é
campo de HTML puro.

⭐ **É esse `dangerouslySetInnerHTML` que faz tag não-nativa funcionar** — `<details>`/`<summary>`,
`<table>`, `<dl>`. E **o admin não sanitiza na gravação**: verificado no HTML entregue, 8 `<details>` e
8 `<summary>` sobreviveram nos dois devices. É a base da saída de FAQ do `armadilhas.md` 18a e do
padrão de tabela da seção 5b.

⚠️ **`<script>` não roda em nenhum dos dois** (item abaixo), e `<style>` dentro do `code` é CSS de
página disfarçado — viaja duas vezes por visita (`armadilhas.md` item 9) e vaza para o tema como
qualquer outro (seção 3b).

#### ⚠️ O `editor` NÃO recebe a classe de layout do bloco — a seção `LAYOUT` inteira é inerte nele

Isto generaliza (e explica) o "`padding` é ignorado em `editor`" do `armadilhas.md` item 13. Os dois
tipos são renderizados por caminhos diferentes:

```js
editor: ({builderItem:e, ...t}) => jsx(gf, {...t, className: e?.config?.class, …})   // className SOBRESCRITO
code:   ({builderItem:e, ...t}) => jsx(yx, {...t, builderItem:e, …})                 // wrapper padrão
```

No `editor`, o `className` que o renderizador tinha montado — a classe gerada com **todo** o CSS da
config (seção 3c) — é substituído por `config.class`. Contado no HTML entregue de uma home real:
**0 de 29 blocos `editor`** carregam a classe de layout (`sc-8c891b19-0`), enquanto ela aparece **126
vezes** na página, inclusive nos blocos `code`. Consequência prática:

| | `editor` | `code` |
|---|---|---|
| `padding`, `margin`, `background`, `border`, `overflow`, `dimensions` | **nada** | aplica |
| `display.type` | **nada** (o wrapper dele já é um `div`, ou seja `block`) | aplica |
| `class` | aplica (é o único que chega) | aplica |
| `flexBehavior` | nada | **também não** — ver `armadilhas.md` 22f |

**O que fazer:** espaçamento, fundo e borda de texto vão no bloco `block` que **envolve** o `editor` —
nunca no `editor`. Continue mandando `display.type: "block"` nos dois (é o que o construtor escreveria,
e é grátis), mas conte com o efeito só no `code`.

⚠️ **No `code` o `display: flex` do default é destrutivo, e isso está medido:** com `block`, `<h2>` e
`<p>` ocupam 780px cada e a seção tem 245px de altura; com `flex`, os mesmos elementos caem para 392px
e 388px e a seção encolhe para 214px — **cada `<h2>` e cada `<p>` vira um item flex lado a lado**. Não
há erro, só um texto em colunas que ninguém pediu, e o sintoma (linhas curtas demais) é fácil de
atribuir à largura da coluna. Lembre que o default vem do próprio construtor
(`t.display || (t.display = "flex")`, seção 3c), não do tema.

⚠️ **O wrapper do `editor` traz uma regra de link embutida:** `a{color: PRIMARY; text-decoration:
underline}` (`PRIMARY` é a cor primária da loja). É a origem do link colorido e sublinhado do
`armadilhas.md` 11c — e ela está **no wrapper do
editor**, então vence qualquer `<a>` que você deixar sem estilo. Em `code`, que usa o wrapper comum,
essa regra específica não entra (as globais do tema, sim).

⚠️ **TODO elemento de texto precisa de `font-size`, `line-height`, `font-weight`, `color`, margem e —
em `<a>` — `text-decoration` explícitos. Inclusive os que você não converteu.** O tema deforma `<h2>`
e `<p>`, e a regra do `<p>` é `1.4em` (**relativa**), então definir tamanho no elemento pai
**aumenta** o do parágrafo em vez de corrigir. Ver `armadilhas.md` item 11c.

⚠️ **"TODO" inclui `<h3>`, `<ol>` e `<li>`, que ficaram de fora da lista até 2026-08-11 — e o `<li>` é
o pior.** Não existe regra de `li` em **nenhum** dos dois temas, então ele herda o `body`: **12px na
original contra 16px no tema novo** (`--bs-body-font-size: 1rem`). Toda lista migra **33% maior**, sem
sintoma no JSON. Junto com ela: `<ol>` tem `padding-left: 2rem` (32px) no tema novo contra os 40px do
default do navegador na original, e `<h3>` muda de `line-height` (30,8 → 33,6px, porque o tema novo usa
`1.2` e o antigo `1.1`).

⚠️ **A COR do link não se deriva do CSS.** Na loja medida, as folhas declaravam `a{color:#e23b40}`
nas duas pontas e o computado da original era **a cor primária da loja** (a `--primary-color` dela). Custou uma gravação
com o link vermelho. Meça com
`getComputedStyle` — `armadilhas.md` 11c e 23.

**Duas formas de aplicar isso, e a escolha é de volume.** Inline em cada elemento é o que a seção 5b
deste arquivo faz na tabela de parcelamento, e é o certo para poucos elementos. Para texto corrido
em quantidade, uma regra escopada na `class` do próprio `editor` sai muito mais barata: medido numa
página de 26 `<p>`, 10 `<h3>` e 12 `<li>` por raiz, **688 chars de CSS de página contra ~8.000 chars de
`style=` inline por raiz** — e o CSS de página viaja duas vezes por visita (`armadilhas.md` item 9), o
inline também.
A regra não vaza porque a classe é **sua** (seção 3b: o que vaza é classe do tema). Os dois scripts da
skill aceitam as duas formas desde 2026-08-11; antes, só a inline, e a regra de página rendia 18 avisos
falsos.

Caso medido, e o erro foi exatamente o "inclusive os que você não converteu": numa faixa de etiquetas
estilizei só o que era `<h1>` e deixei os outros 3 rótulos herdarem o tema. Os `<p>` saíram a
**22,4px** (pela regra `p{font-size:1.4em}`) e os `<a>` a **16px na cor primária da loja**, contra
**14px / 14,4px em `#777`** na original.

⚠️ **`<script>` em bloco `code` NÃO EXECUTA.** O React insere por `dangerouslySetInnerHTML`, e script
inserido por `innerHTML` não roda; além disso o site novo **não carrega jQuery** (`grep jquery` = 0).
Numa migração copiei 811 chars de jQuery + owlCarousel da origem **em cada raiz**: código morto
viajando duas vezes por visita (uma no DOM, outra no `__NEXT_DATA__`). Interação em bloco `code` tem
de sair de CSS (`@keyframes`, `scroll-snap`, `:target`, `:checked`) — ver a seção do `banner`.

⚠️ **Se você gera o campo `style` por script, cuide do `%` do `@keyframes`.** Passando a string por
formatação `%` do Python, **todo `%` literal sai dobrado** (`0%,17.33%` vira `0%%,17.33%%`) e a animação
inteira morre calada — o navegador descarta a regra e o carrossel/faixa fica parado no primeiro quadro.
Use `.format()`, f-string ou concatenação para blocos com `@keyframes`. E para conferir a animação:
`getComputedStyle` mente em aba não pintada (`armadilhas.md` 23b), então conduza o tempo com
`el.getAnimations()[0].currentTime = N`.

### `sidebar-menu`
```jsonc
{ "variation": "fancy" }
```

### `newsletter`
```jsonc
{ "orientation": "horizontal", "requireName": true, "requireEmail": true, "requirePhone": false }
```

### `menu`
```jsonc
{ "orientation": "horizontal", "columns": 1, "justify": "space-between",
  "variation": "dropdown_list", "menu": { "id": "", "nome": "" } }
```
`menu` referencia um menu cadastrado em `Loja On-line → Menus`. Sem id válido não renderiza.

### `video`
```jsonc
{ "video_autoplay": false, "video_loop": false, "video_muted": true,
  "video_controls": true, "video": { "ban_id": "", "ban_nome": "" } }
```
Painel: `Reproduzir automaticamente` → `video_autoplay` · `Exibir controles` → `video_controls` ·
`Repetir automaticamente` → `video_loop` · `Iniciar sem som` → `video_muted`.
O prefixo `ban_` é herança: vídeo reaproveita a tabela de banners.

### `modal`
```jsonc
{ "automatic_opening": false, "automatic_opening_time": 1, "opening_recurrence": "once",
  "use_custom_size": false, "width": null, "height": null }
```
`opening_recurrence`: `"once"` (Exibir uma vez) ou o valor equivalente a Exibir sempre.
Aceita `child` — o conteúdo do modal são blocos filhos.

Três detalhes lidos no bundle, porque cada um custa uma rodada de teste:

- **`automatic_opening_time` está em segundos** (`1000 * Number(tempo)`); vazio ou 0 abre na hora.
- **`"once"` é guardado num cookie `hideModal` cujo valor é o ID DO BLOCO.** Enquanto ele existir o
  modal não abre — se "não abre mais", limpe o cookie antes de suspeitar do JSON. Trocar o `id` do
  bloco também "reativa" o modal, o que engana na hora de comparar duas versões da página.
- **`dimensions.enable` VENCE `use_custom_size`**: o tamanho sai de `dimensions.width/height` quando o
  grupo está ligado, e só cai em `width`/`height` da raiz da config quando não está. Este é o **único**
  bloco do catálogo que lê `use_custom_size` no cliente (no `imagem` quem age é o servidor; no `banner`
  o campo não faz nada).

### `imagem`
```jsonc
{ "apply_aspect_ratio": false, "use_custom_size": false, "width": null, "height": null,
  "midia": { "id": "", "nomeArquivo": "" }, "link": "",
  "midia_size": { "id": "", "codigo": "" } }
```
⚠️ `midia` é **referência a mídia cadastrada**, não URL. Páginas legadas trazem URL em string; não
replique. Sem id de mídia válido a imagem não aparece — se você não tem o id, entregue o JSON com
`midia` vazio e avise que alguém precisa selecionar a imagem no painel.

O id da mídia **sai da URL da imagem renderizada** na página antiga:
`.../img.panorama/imagem/{ID}/{arquivo}` — o `{ID}` (um número de 6 dígitos na loja medida) é o
`midia.id`.

✅ **`use_custom_size: true` + `width`/`height` funciona, e você quase sempre quer.** Testado: o
servidor resolve a mídia para a variante no tamanho pedido (`…/nome-do-arquivo-580x580.png`) e emite
`width` e `height` no `<img>`. **Sem ele a imagem sai só com `loading="lazy"`, sem dimensões** — ou
seja, o ganho de performance do bloco nativo descrito na regra 2 do `construtor.md` só vem completo
com este campo ligado. Meça a imagem na original e passe o tamanho.

⚠️ **Ligou `use_custom_size`? Ligue `apply_aspect_ratio: true` junto.** Sozinho, o `use_custom_size`
trava a **altura** no valor que você passou enquanto a largura continua encolhendo com a coluna — a
imagem **distorce**, e o `object-fit` do tema é `fill`, então ela estica mesmo. Medido: pedindo
580×580 numa coluna de 564px, o `<img>` saiu **564×580** (proporção 0,972) no desktop; no mobile, onde
a coluna é bem mais estreita, o esticamento fica gritante. Com `apply_aspect_ratio: true` foi para
564×564, proporção 1,000 — sem uma linha de CSS.

Corolário para a paridade: com a proporção correta, a imagem passa a caber na largura **real** da
coluna. Se a original tinha gutter diferente do tema (10px contra 12px), a seção fica alguns pixels
mais baixa. É o preço certo a pagar — imagem distorcida é pior que 16px de altura.

`link` é caminho relativo, começando por `/` (ex. `"/categoria/subcategoria"`).

#### ⚠️ O bloco `imagem` NÃO tem wrapper próprio — e isso causa três defeitos

Implementação lida do bundle do tema (`_app.js`):

```js
imagem: ({builderItem: e, ...t}) => {
  let {width:r, height:i} = e.config, n = e?.config?.link, a = e.config?.apply_aspect_ratio,
      s = {loading:"lazy", width:r, height:i, aspectRatio:`${r}/${i}`, src: e.config?.midia},
      o = a ? {width:"100%",height:"100%"} : void 0;
  return n ? jsx(tm.I, {redirectLink:n, style:o, alt: e.id || "", ...t, ...s})
           : jsx(tm.A, {style:o, alt: e.id || "", ...t, ...s}) }
```

Ele emite `<a class="pano-link-anchor"><img style="width:100%;height:100%">` e **nenhuma div de
wrapper**. Consequências medidas:

1. ⚠️ **Como item flex o `<a>` não estica e COLAPSA.** A moldura de uma categoria fechou em **0×0**
   (padding 26 e conteúdo zero) e a imagem do promo ficou em **250px** dentro de uma metade de
   **600px**. Correção: `display.type: "block"` no bloco que envolve, **mais** a regra escopada da
   seção 3b (`.SEU-BODY-CLASS #layout-main-content .pano-link-anchor{display:block;width:100%}`).
2. ⚠️ **`margin` no bloco cai no `<img>` e DISTORCE em vez de espaçar.** Com `apply_aspect_ratio`
   (que é o que emite `height:100%`), a margem **infla a âncora**: uma imagem 605×280 numa coluna de
   580 com `margin-bottom: 10px` deu âncora de **278px** e imagem esticada para **580×278** — o
   correto era **268** — e **zero** de espaço entre ela e a de baixo. Para espaçar imagens empilhadas
   use **`display.gap` no bloco da COLUNA**: com gap, 268 + 10 + 268 = **546**, exatamente a altura da
   coluna vizinha.
3. ⚠️ **O `alt` está cravado em `e.id`** (`alt: e.id || ""`): sai o id do bloco (`alt="x1y2z3w4"`),
   e **não existe campo de alt na config** — não invente um. É pedido para o time do tema da
   plataforma.

Detalhes do mesmo componente, todos verificados:

- **`apply_aspect_ratio` é o que emite `style="width:100%;height:100%"`**, e o `aspect-ratio` vem de
  `${width}/${height}`. Logo **pedir um tamanho de outra proporção muda o RECORTE**: 600×348 sobre um
  master 250×150 é 1,7241 contra 1,6667. Peça um tamanho na mesma proporção (600×360).
- **O CDN de imagens da plataforma gera variante pelo sufixo `-LARGxALT`, inclusive AMPLIANDO**:
  `banner-exemplo-600x348.jpg` a partir de um master 250×150 devolveu 200 com 40.750 bytes.
- **O renderizador slugifica o `nomeArquivo`**: gravei `"Banner Exemplo.jpg"` e saiu
  `banner-exemplo-600x348.jpg`. Não normalize à mão.
- **Resolve a mídia por id em qualquer tabela**: uma mídia que vive na tabela de *banner* foi
  referenciada num bloco `imagem` e ele emitiu `/img.panorama/banner/NNNNNN/…` sozinho.
- **Retina: peça 2× o tamanho CSS** — 116×116 para exibir em 58×58.

### `storerating` (Avaliações da Loja)
```jsonc
{ "origem": "lista", "modelo": "horizontal", "limit": 12, "display_mode": "fixed",
  "min_stars": 1, "slider_dots": false, "slider_page_info": false,
  "slider_autoplay": false, "slider_autoplay_speed": null }
```

### `vitrine`
```jsonc
{ "origem": "vitrine",                        // Origem dos Produtos
  "modelo": "default",                         // Modelo
  "limit": 12,
  "display_mode": "slider",                    // slider | grid
  "vitrine": { "vit_id": "", "vit_nome": "" }, // ⚠️ ao preencher, inclua vit_codigo — ver abaixo
  "owl": { "desktop": "", "mobile": "" },      // itens por coluna/slide
  "showcaseFooterComponent": "NOT_SHOW",       // painel: "No rodapé"
  "showcaseProductLayout": "MODEL_ONE",        // painel: "Layout do produto na vitrine"
  "midia_size": { "id": "", "codigo": "" },    // painel: "Tamanho da Foto"
  "grid_row_gap": "",
  "slider_dots": false, "slider_page_info": false, "slider_autoplay": false,
  "slider_loop": false, "slider_autoplay_speed": null, "slider_space_between": null,
  "slider_nav": "none" }
```

`origem` conhecidos: `"vitrine"` (vitrine cadastrada) e `"operation"` (lista dinâmica). Com
`"operation"` entra também `operation` — visto: `"history"` (Últimos vistos). Há uma opção
"Panorama Ads" no painel cujo valor não foi capturado.

**Produtos nunca ficam no JSON.** A vitrine é referência; o back-end resolve. Vitrines se cadastram em
`Loja On-line → Vitrines` — é de lá que sai o `vit_id`.

✅ **E isso não é perda de SEO na migração**, pergunta que aparece toda vez: os produtos entram por
`fetch` no cliente (`showcaseGetLoadData`) e não estão no HTML — mas **a página antiga também montava
as prateleiras no cliente**. O texto que a migração de fato pode perder é outro, e está na seção do
`accordion`.

#### ⚠️ O campo que faz a prateleira carregar é o `vit_codigo`, não o `vit_id`

Lido no componente, é a primeira coisa que ele faz:

```js
let m = h?.vitrine?.code,                                    // h = config do bloco
    f = h?.origem === "operation" ? h?.operation : null,
    g = m || f;                                              // g = a chave da prateleira
… payload: { showcaseCode: e, operation: t, purePath: r }    // o fetch vai por CÓDIGO
```

O `code` que ele lê é o `vit_codigo` que você gravou (o servidor renomeia — ver abaixo). O `vit_id`
**não participa da busca dos produtos**. Verificado gravando `{vit_id:"NNNN", vit_codigo:"codigo-da-vitrine",
vit_nome:"Nome da Vitrine"}` e recebendo `{code:"codigo-da-vitrine", id:NNNN}` (o id já como número),
com a prateleira cheia.

⚠️ **Logo, grave sempre o `vit_codigo`** — a forma mínima `{vit_id, vit_nome}` que circulava nesta skill
é uma aposta: se o `code` não chegar, `m` fica `undefined`, `g` também (com `origem: "vitrine"`), o fetch
nunca sai e a prateleira aparece **vazia, sem erro nenhum**. **Não foi testado** se o servidor consegue
preencher o `code` a partir do `vit_id` sozinho, e é um teste caro de errar — o picker do painel já grava
os três, e ao copiar da origem você copia os três de graça, descartando só
`$hashKey`/`row_index_grid` (`armadilhas.md` item 4).

#### ⚠️ O servidor RENOMEIA campos na entrega

Verificado gravando e relendo o JSON entregue:

| você grava | o front-end recebe |
|---|---|
| `owl` | `itemsPerSlide` |
| `grid` | `itemsPerGridRow` |
| `vitrine: {vit_id, vit_codigo, vit_nome}` | `vitrine: {id, code}` (o `vit_nome` é descartado) |

⚠️ A terceira linha desfaz uma confusão antiga (o aviso também está na regra 1 do `construtor.md`):
`{code, id}` **não é formato legado** — é o formato de **saída** do de hoje. Ver uma página no ar com `vitrine:{code,id}` não é sinal de que
ela precise ser remigrada, e escrever `{code, id}` à mão não é o schema atual.

- ⚠️ **`grid` não aparece no default vivo do bloco** (nem `itemsPerGridRow`) — o controle provavelmente
  só surge no painel quando `display_mode` é `grid`. Mas **sem `grid` o modo grid vira UMA coluna**: o
  tema faz `(itemsPerGridRow?.desktop)||1` e empilha todos os produtos numa fila.
- ⚠️ **O valor é o NÚMERO DE COLUNAS** — `6` significa seis por linha. O construtor twig usava a
  convenção 12/N do Bootstrap (`grid.desktop: "2"` queria dizer `col-lg-2`, ou seja seis por linha),
  então **copiar o número da origem dá 2 colunas**, errado. Verificado: gravei
  `grid: {desktop:"6", mobile:"2"}` e a entrega trouxe `itemsPerGridRow: {desktop:6, mobile:2}`.
- ⚠️ **Não escreva `itemsPerGridRow` direto**: é o nome de SAÍDA, e o `validar_pagina.py` o marca como
  campo legado — corretamente.
- ⚠️ **`origem: "operation"` + `operation: "history"` (Últimos vistos) NÃO renderiza nada** para
  visitante sem histórico: o componente faz `if(!_) return null`. Não conclua que quebrou. E se essa
  vitrine for filha direta de um `accordion`, ela **apaga o accordion** (ver a seção do `accordion`).
- ✅ **Vitrine com `origem: "operation"` legitimamente não tem `vit_id`** — a chave dela é o campo
  `operation`. Cobrar `vit_id` nesse caso é ruído (o `validar_pagina.py` já não cobra). O **erro** de
  verdade é o inverso: `origem: "operation"` **sem** o campo `operation` renderiza vazio, sem erro.
- `midia_size` observados em produção, numa loja: `{id:"N", codigo:"cape"}` 600×600 na maioria das
  vitrines e `{id:"N", codigo:"list2"}` 280×280 em uma delas. Os presets são cadastrados; confira os da
  sua loja (e veja o item abaixo antes de gastar tempo com eles).
- ⚠️ **`midia_size` não chega ao front-end, e o painel não denuncia.** A string `midia_size` aparece
  **0 vez** nos dois bundles do tema (1,9 MB + 1,1 MB), o servidor a **poda** na entrega, e o fetch dos
  produtos leva só `{showcaseCode, operation, purePath}`. O tamanho da foto do produto vem do cadastro
  da vitrine / da API, não do bloco: mexer em "Tamanho da Foto" aqui não muda pixel nenhum.
- **`modelo` (`"default"` / `"horizontal"`) também não é lido** — quem decide slider ou grid é
  `display_mode`. `modelo` é campo da era twig que o painel continua gravando; mantenha o que o
  construtor escrever e não tire conclusão dele.
- **`slider_space_between`: o fallback é 5, não 0.** O tema faz `spaceBetween: slider_space_between || 5`
  (para o `banner`, o mesmo trecho usa `|| 0`). ⚠️ Então **não escreva `0` para "sem espaço"** — o `||`
  devolve 5 e você fica com 5px que não pediu. Para reproduzir o `.owl-item{margin-right:10px}` da
  original, escreva o **número** `10` (medido: é o valor da original).
- **`slider_nav` faz duas coisas ao mesmo tempo:** liga as setas (`!!slider_nav && slider_nav != "none"`)
  e diz a posição (`navPosition: slider_nav || null`). `"inside"` / `"outside"` / `"none"`.
- **`slider_autoplay_speed` está em SEGUNDOS** — o carrossel faz `delay: Number(speed) * 1000`, com
  fallback **2,5s** quando não há valor, e só liga com `slider_autoplay` estritamente `true`.
- `limit` corta a lista **depois** de receber (`products.slice(0, limit || 12)`), então baixar o `limit`
  não economiza requisição, só renderização.

#### ⚠️ Não há controle para as amostras de cor — e das 8 chaves do card, só 2 são suas

O card de produto recebe exatamente 8 chaves, e a origem de cada uma decide o que você pode fazer:

| chave | de onde vem | o que faz |
|---|---|---|
| `showcaseProductLayout` | **do seu bloco** | painel "Layout do produto na vitrine". Default `MODEL_ONE` |
| `showcaseFooterComponent` | **do seu bloco** | só o **rodapé** do card: `NOT_SHOW` / `ADD_TO_CART` / `OFFER_TIMER` |
| `orientation` | cravado `VERTICAL` no tema | — |
| `priceExhibitionType` | config da LOJA (`layoutPriceMethod`) | formato do preço, igual em todo o site (medido numa loja da família `modelo-1`, 2026-10: valor `pix`, e o preço em destaque no card era o do PIX/boleto, não o do cartão; um % calculado sobre ele exagera o desconto de quem paga no cartão, `temas-sazonais.md`, 8) |
| `priceExhibitionMode` | config da LOJA (`layoutPriceOnList`) | idem |
| `productListShow2ndPicture` | props do card (default `true`) | 2ª foto no hover |
| `productListShowDimensions` | props do card (default `false`) | medidas do produto |
| `pageProductListTitle` | props do card | qual campo vira o título |

**Nenhuma controla a variação por cor.** As amostras são um carrossel **dentro** do card, e há dois
caminhos para escondê-las — CSS de página (só nesta página) ou `derivacoes[].opcoes.exibirDerivacao`
no cadastro do produto (site inteiro, e o valor é a **string** `"false"`). Os dois seletores, a
contagem medida (**29 elementos, ~52px por card**) e o erro que destrói as setas das amostras
(**64 botões pegos em vez de 6**, e o combinador `>` que é obrigatório) estão em `armadilhas.md` **24**
e **24a** — leia antes de escrever qualquer regra `pano-carousel-*`.

⚠️ **Tag de produto no card não se estiliza por CSS de página.** O estilo vem do CADASTRO da
tag (`config.color`, `background`, `altura`, `largura`), o tema tem estilo embutido para apenas 3
slugs, e o ícone da tag é lido e descartado (`mediaId`, 1 ocorrência em 1,9 MB de bundle). A
classe estável é a mesma para todas as tags — ver `armadilhas.md` 26 e 26a.

### `banner`
```jsonc
{ "banner_tipo": { "id": "", "nome": "" },     // tipo cadastrado em Tipo de Banners
  "limit": 1,
  "modelo": "slider",
  "owl": { "desktop": "", "mobile": "" },
  "midia_size": { "id": "", "codigo": "" },
  "apply_aspect_ratio": false, "use_custom_size": false, "use_size_via_css": false,
  "width": null, "height": null,
  "list_show_title": false, "show_item_title": false,
  "grid_row_gap": 0,
  "slider_dots": false, "slider_page_info": false, "slider_autoplay": false,
  "slider_loop": false, "slider_autoplay_speed": null, "slider_space_between": null,
  "slider_nav": "none" }
```

As imagens não ficam no bloco: vêm do **tipo de banner** referenciado em `banner_tipo`, cadastrado em
`Loja On-line → Banners` e `Tipo de Banners`. `limit` controla quantas entram.

`owl` é herança de nome do Owl Carousel do site twig.

#### Como o renderizador ATUAL consome o banner (testado ponta a ponta — grave e verifique)

Confirmado gravando pelo campo `Blocos:` e lendo `__NEXT_DATA__` na URL pública. **Importante, porque o
formato ENTREGUE engana:**

- `banner_tipo` é a **fonte da verdade**. No armazenamento você guarda `banner_tipo: {id, …}`; na entrega
  o **servidor resolve** o tipo para uma **`bannerlist`** materializada (`{id, nome, link, midia,
  tipoConteudo, config}`) e **remove o `banner_tipo`**. Por isso, ao ler uma página pronta (uma home `-v2` etc.)
  você vê `bannerlist` e nenhum `banner_tipo` — e conclui, errado, que dá para escrever `bannerlist` à mão.
- **Escrever `bannerlist` direto (sem `banner_tipo`) NÃO funciona:** o pipeline de entrega a devolve
  **vazia** (`bannerlist: []`, carrossel em branco). Testado. O que renderiza é sempre o que sai da
  resolução do `banner_tipo`.
- Essa resolução entrega a imagem no **tamanho-base/master** do cadastro (num tipo medido, 577×450,
  quase quadrada) e o `src` de cada slide vem **pronto** do payload (`src: e.midia`): **o banner nativo
  não deixa você escolher o tamanho/recorte da imagem** — você fica com o master do tipo.
- ⚠️ **Correção de uma versão anterior desta seção**, que listava `owl` e `apply_aspect_ratio` como
  "descartados na entrega". **Os dois funcionam.** `owl` é apenas **renomeado** para `itemsPerSlide`
  (igual à vitrine), e `apply_aspect_ratio` é lido pelo componente — ver o item abaixo. Descartados de
  verdade, porque **não aparecem nenhuma vez** nos bundles do tema: `midia_size`, `use_size_via_css`,
  `list_show_title` e `show_item_title`. `use_custom_size` aparece **uma** vez, e é no `modal` — no
  `banner` ele não faz nada (no bloco `imagem` ele age no **servidor**, resolvendo a variante da mídia,
  e é por isso que lá funciona sem aparecer no bundle).

#### ✅ `apply_aspect_ratio` + `width`/`height` numéricos reservam o espaço do slide

Este é o único controle de geometria que o banner nativo tem, e ele resolve o problema que a página
antiga resolvia com `<div class="ar ar-3840-935">` (padding-top percentual): **cada slide passa a ter
altura reservada antes da imagem carregar**, sem CSS de página. Lido no bundle:

```js
let s = i?.apply_aspect_ratio, o = Number(i?.width), l = Number(i?.height),
    c = o && l ? `${o}/${l}` : void 0;
… jsx(Img, { style: s ? {width:"100%", height:"auto", aspectRatio:c} : void 0, alt:e?.nome,
             redirectLink:e?.link, src:e.midia })
```

Verificado no HTML entregue, nos dois devices, **4 slides cada**:

```html
<img style="width:100%;height:auto;aspect-ratio:3840/935" alt="…" src="…-3840x935.jpg">   <!-- desktop -->
<img style="width:100%;height:auto;aspect-ratio:1360/800" alt="…" src="…-1360x800.jpg">   <!-- mobile  -->
```

- **Passe `width`/`height` como número** (ou string numérica — o `Number()` converte; o servidor entrega
  já convertido). Sem os dois, `c` fica `undefined` e você recebe `width:100%` com **altura zero até a
  imagem chegar** — que é o layout shift que você estava tentando evitar.
- **Use a proporção do master do tipo**, não a que você queria: a caixa fica com a proporção que você
  pediu e a imagem é esticada dentro dela (o `object-fit` do tema é `fill` — ver a seção do bloco
  `imagem`), ou seja proporção diferente **não recorta, deforma**. Medida numa home: o tipo do desktop
  tinha master **3840×935** e o do mobile **1360×800** — dois tipos diferentes, um por raiz.
- ⚠️ **O que não dá por config, e não invente campo para isso:** (1) `loading="lazy"` — o componente
  nunca passa `loading`, e medi **0 de 4** slides com o atributo nos dois devices, então o ganho de
  performance da regra 2 do `construtor.md` **não** vale para o banner (vale para o bloco `imagem`); (2) a **variante**
  do arquivo, que vem resolvida no payload.
- ✅ O que você ganha de graça e o bloco `imagem` não tem: **`alt` de verdade**, tirado do `nome` do
  banner no cadastro (o `imagem` crava o id do bloco — ver a seção dele).
- Números do carrossel, lidos no mesmo trecho: `spaceBetween: slider_space_between || 0` (**diferente da
  vitrine, que cai em 5**), `navPosition: slider_nav || "inside"`, `autoplaySpeed` em **segundos**
  (`× 1000`, fallback 2,5s) e autoplay só com `slider_autoplay` estritamente `true`.

**Consequência prática (regra de decisão):**

- Se o master do `banner_tipo` já tem o tamanho/proporção que você quer → use o banner nativo (autoplay,
  dots, `aspect-ratio`, editável no painel). É sempre a primeira escolha.
- Se você precisa de um tamanho/recorte que o master não tem (ex.: casar com página antiga que exibe a
  variante panorâmica `-1255x500` enquanto o master é 577×450) → **o nativo não alcança.** Aí a exceção é
  um bloco `code` com um carrossel em CSS puro apontando para as URLs no tamanho certo. O CDN de
  imagens da plataforma (no caso medido, `storage.panoverse-cdn.com.br`; confira o host nas URLs de
  imagem da sua loja) gera variantes on-the-fly pelo sufixo **`-LARGxALT.jpg`** (confirmado:
  `-1255x500`, `-1920x600`). Lembre: **`<script>` não roda** em bloco `code` (o React usa
  `dangerouslySetInnerHTML`), então autoplay/controles têm de sair de CSS (`@keyframes`, `scroll-snap`),
  não de JS. A receita medida de carrossel por `@keyframes` (trilha, clone do 1º item, tempos) está no
  `armadilhas.md` item **25**.

> Diferença de master por tipo, medida numa loja: um tipo de banner de seção tinha master 577×450; os
> banners de topo da home `-v2` tinham master 1920×430. Por isso a home saía panorâmica pelo nativo e a
> outra página não — não é config, é o tamanho do arquivo cadastrado.

#### Mapa do painel do banner (controle → campo → valores) — confirmado abrindo o painel

Seção **TIPO E TAMANHO**:

| Controle | Campo | Valores |
|---|---|---|
| Tipo de Banner | `banner_tipo` | objeto `{id, codigo, nome, "midiaTipo/id", "midiaTipo/nome"}` — id/codigo vêm do cadastro (ex.: `{id:"NNNNNN", codigo:"codigo-do-tipo"}`) |
| Controlar tamanho por CSS | `use_size_via_css` | bool. **Liga o modo "o tamanho vem do CSS"** e esconde os 3 controles abaixo |
| Tamanho personalizado | `use_custom_size` | bool; quando on, usa `width`/`height` |
| Tamanho da Mídia | `midia_size` | `{id, codigo}` — preset de resolução/recorte cadastrado |
| Manter proporção entre largura e altura | `apply_aspect_ratio` | bool |

Seção **MODELO**:

| Controle | Campo | Valores |
|---|---|---|
| Limite de Banners | `limit` | número |
| Modelo | `modelo` | **`slider` \| `grid` \| `fixo`** |
| Setas | `slider_nav` | **Não exibir=`none` \| Por dentro=`inside` \| Por fora=`outside`** |
| Itens por slide no PC | `owl.desktop` | número |
| Itens por slide no Celular | `owl.mobile` | número |
| Espaçamento horizontal | `slider_space_between` | número (px) |
| Paginação | `slider_dots` | bool |
| Numeração (ex: 2/5) | `slider_page_info` | bool |
| Avançar slides automaticamente | `slider_autoplay` | bool |
| Avançar a cada N segundos | `slider_autoplay_speed` | número |
| (loop) | `slider_loop` | bool |

Seções **GERAL** e **LAYOUT**: iguais a todo bloco (`name`, `device_show`, e a config base).
`grid_row_gap`, `list_show_title`, `show_item_title` aparecem conforme o `modelo` (grid/listagem).

#### ⚠️ Tamanho da imagem do banner: você **não** controla no nativo

Fecha a conclusão da seção acima, com a distinção que importa: o **arquivo** exibido é sempre o master
do `banner_tipo` — `midia_size` e `use_size_via_css` não chegam ao componente e não existe campo que
troque a resolução. O que você controla é o **espaço que o slide ocupa**, por `apply_aspect_ratio` +
`width`/`height` (ver acima) — e para isso a proporção certa é a **do master**, porque proporção
diferente deforma. Se o próprio arquivo não serve, é bloco `code`, não ajuste de config.

A largura do *container* é assunto separado: no site novo `.container` é estreito (Bootstrap, ~720px numa
viewport de ~950px), diferente do `.container` largo do site antigo (~100% até 1320px, na página onde
isto foi medido; noutras páginas o antigo era 1200px fixo — `armadilhas.md` 11b. Meça a sua). Para uma seção
larga como no original, **não use `.container`**: use `.container-fluid` ou uma utilidade própria
(`max-width:1320px; margin:auto`) no `blockStyle`. Teste renderizando antes de fechar.

## 5b. Padrão: listas e "tabelas" de muitas linhas iguais

Páginas institucionais vivem disso: tabela de parcelamento, prazos por região, comparativo de planos.
No construtor antigo isso era feito com **uma `row` por linha** e duas colunas (`col-sm-8` para o
rótulo, `col-sm-4` alinhado à direita para o valor) — na `/formas-de-pagamento` são **13 `row line`**
seguidas, ~39 blocos só para a tabela de parcelas.

Não copie essa estrutura. Escolha pelo que a linha **é**:

| Situação | Faça | Por quê |
|---|---|---|
| Linhas são **dados tabulares** (parcela → juros, região → prazo) | **um bloco `editor`** com uma `<table>` (ou `<dl>`) | 1 bloco em vez de 39; continua **editável no painel** (o `editor` é rich text); `<table>` é o HTML semanticamente correto e responde melhor em leitor de tela |
| Linhas têm **estrutura visual rica** (ícone + título + texto, card) | um bloco `block` por item, com filhos nativos | cada item vira editável e reordenável pelo painel |
| Linhas são **conteúdo dinâmico** (produtos) | `vitrine` | o back-end resolve |

O ganho de escolher `editor` com `<table>` aqui é grande e vale registrar: **39 blocos → 1**, sem
perder edição pelo painel. É diferente de usar bloco `code`: `code` é HTML cru fora do editor de
texto; o `editor` guarda HTML no mesmo campo que o rich text do painel edita.

⚠️ **O padrão tem um custo escondido: você perde o empilhamento responsivo.** No site antigo cada
linha era `col-sm-8` + `col-sm-4`, e o Bootstrap empilha as duas colunas sozinho abaixo do breakpoint
`sm`. Uma `<table>` com larguras em `%` **não empilha** — no celular a coluna do valor fica com ~150px
e um texto tipo "(Sempre lembrando que a parcela mínima é de R$ 30,00.)" desfia em oito linhas.

Você tem de devolver isso por media query no `style` da página. `!important` é necessário porque os
estilos das células são inline:

```css
@media(max-width:767px){
  .SEU-BODY-CLASS #layout-main-content td{display:block!important;width:auto!important}
  .SEU-BODY-CLASS #layout-main-content tr td:first-child{border-bottom:0!important;padding-bottom:0!important}
  .SEU-BODY-CLASS #layout-main-content tr td:last-child{padding-top:6px!important}
}
```

São ~200 caracteres de CSS de página. Continua valendo muito a pena contra 38 blocos a menos — mas
**conte esse custo ao decidir**, e não esqueça de aplicá-lo: no desktop nada denuncia o problema.

Cuidado ao estilizar a tabela: o tema novo deforma `<p>` **e** `<h2>` (ver `armadilhas.md` 11c) e pode
ter regras próprias de `table`. Defina `font-size`, `border-collapse` e a borda inferior da linha
explicitamente, e confira renderizando.

**Receita medida, que reproduziu a `/formas-de-pagamento` a 1px da original.** A `row line` do site
antigo tem `padding-top: 20px` + `margin-top: 20px` + `border-bottom: 1px` — os 40px viram um único
`padding-top` na célula (`#RRGGBB` é a cor primária da sua loja, medida com `getComputedStyle`; o texto é exemplo):

```html
<table style="width:100%;border-collapse:collapse;margin:0">
  <tr>
    <td style="padding:40px 12px 16px;border-bottom:1px solid #RRGGBB;
               font-size:16.8px;line-height:25.2px;color:#292b2c;vertical-align:top;width:66.666%">
      <p style="margin:0;font-size:16.8px;line-height:25.2px">1 Parcela</p>
    </td>
    <td style="…mesmo…;width:33.334%">
      <p style="margin:0;font-size:16.8px;line-height:25.2px"><strong>desconto de X%</strong></p>
    </td>
  </tr>
</table>
```

Três detalhes que custaram uma rodada de gravação cada:

- **o `font-size` tem de estar no `<p>`, não só no `<td>`** — a regra do tema é `1.4em`, relativa: um
  `<td>` a 16,8px produz `<p>` a 23,52px;
- **a primeira linha também leva o `padding-top`** (no original ela tem a mesma `margin-top` das outras);
- **padding que existe só numa coluna do original não pode virar padding da célula inteira** — a célula
  aplica nas duas e infla a mais alta. Devolva como `margin-top` do `<p>` daquele lado.

## 6. Dicionário interface ↔ JSON

Use os nomes da coluna "Interface" ao orientar quem monta pela tela.

| `type` | Interface |
|---|---|
| `block` | Box |
| `code` | Código |
| `editor` | Editor |
| `imagem` | Imagem |
| `banner` | Banner |
| `vitrine` | Vitrine |
| `modal` | Modal |
| `menu` | Menu |
| `sidebar-menu` | Menu em Barra Lateral |
| `newsletter` | Newsletter |
| `video` | Vídeo |
| `logo` | Logo |
| `storerating` | Avaliações da Loja |
| `accordion` | Expansível *(renderiza, mas não está na paleta — só via JSON)* |

Anatomia do painel de qualquer bloco — três seções, as duas últimas iguais para todos:

1. **Seção específica**, com o nome do tipo (ex. `VITRINE`, `CONFIGURAÇÃO`). Props do componente.
2. **`GERAL`** — `Nome do Bloco` → `name`; `Exibir em` → `device_show`.
3. **`LAYOUT`** — toda a config base.

Controles de `LAYOUT` e onde escrevem:

| Controle | Campo |
|---|---|
| Exibição: Flexível / Bloco / Grid | `display.type` |
| Direção | `display.direction` |
| Quebrar linha | `display.flex_wrap` |
| Alinhamento | `display.alignItems` |
| Disposição | `display.justifyContent` |
| Espaçamento | `display.gap` |
| Ajustar comportamento em container flexível | `flexBehavior.enable` |
| Ajustar padding & margin | `padding.apply` / `margin.apply` |
| Ajustar dimensões | `dimensions.enable` |
| Classe CSS | `class` |
| Posicionamento | `positioning` |
| Alterar fundo | `background.enable` |
| Ajustar bordas | `customize_borders.enable` |
| Overflow | `overflow` |

Convenção de nome usada pela equipe para colunas de grid: `"Coluna 8 de 12"`.

### Utilidades de grid do tema (use para largura de página e colunas)

O tema do site fornece, **globalmente** (não é CSS de página), utilidades no estilo Bootstrap. Verificado
em produção:

| Classe | O que faz (lido no CSS do front-end novo; na medição o arquivo era `038fd592bd0a5d74.css` — o nome é hash e muda a cada build) |
|---|---|
| `container` | Bootstrap 5 **responsivo**: degraus 540 / 720 / 960 / 1140 / **1320**. `width:100%` + `margin:auto` + padding lateral `calc(var(--bs-gutter-x)*.5)` = **12px** |
| `container-fluid` | largura total, **sem regra de `max-width`** — é o único que fura o teto de 1320px imposto pelo renderizador |
| `row` | `display:flex; flex-wrap:wrap` + `margin: 0 calc(-.5*var(--bs-gutter-x))` = **-12px**. ⚠️ ver aviso abaixo |
| `col-sm-8` / `col-sm-12` | **só `flex:0 0 auto; width:66.66666667%` / `width:100%`** — e a regra vive dentro de `@media(min-width:576px)`, então **abaixo de 576px elas empilham sozinhas** |
| `.row > *` | **`flex-shrink:0; width:100%; max-width:100%; padding: 0 12px`** |

⚠️ **Correção importante: o padding da coluna NÃO vem da classe `col-*`.** Uma versão anterior desta
tabela dizia "`col-sm-*` … padding lateral 12px". Está errado — o tema novo é **Bootstrap 5**, onde o
gutter é aplicado por **`.row > *`**, um seletor de filho direto. A classe da coluna só carrega
`width`.

Consequência prática, e ela é grande: **coluna fora de uma `.row` não recebe padding nenhum do tema**.
Isso libera uma estrutura mais curta que a do site antigo (ver a terceira receita abaixo) — e explica
por que, se você usar `col-sm-*` sem `row`, o texto cola na borda até você pôr o padding por config.

⚠️ **Bloco com `class:"row"` precisa de `display.type:"flex"` na config.** A classe que o renderizador
gera para cada bloco sobrescreve o `display:flex` do `.row` do tema; com o default `"block"` as colunas
**empilham** em vez de ficarem lado a lado. Ver `armadilhas.md` item 13.

#### ⚠️ O gutter do tema não reproduz o grid antigo — a linha sai 24px estreita

Esta é a armadilha mais cara do grid, e ela **não aparece no JSON nem no painel**: você usa
`container` + `row` + `col-sm-*` como manda a tabela acima e as colunas saem **24px mais estreitas**
que na página antiga. Medido numa migração real: coluna de 588px onde a original tem 600, imagem de
564px onde a original tem 580, seção 16px mais baixa.

O mecanismo: a classe que o renderizador gera por bloco aplica **`max-width: 100%`**. O `.row` do tema
depende de `margin: 0 -12px` para *transbordar* o padding do `.container` e voltar à largura cheia —
e `max-width:100%` **impede esse transbordo**. A margem negativa continua lá (desloca a linha para a
esquerda), mas a largura fica travada no content box do pai: 1176 em vez de 1200.

**A receita que fecha a 0px** (medida contra `/prazos`, três seções, desvio máximo 0). Em vez de lutar
com o gutter do tema, zere-o e devolva o da página antiga na coluna:

| bloco | config |
|---|---|
| `.container` | `padding.apply: true`, os quatro lados `"0px"` → content box vira os 1200px cheios |
| `.row` | `margin.apply: true`, os quatro lados `"0px"` → mata o `-12px` do tema, linha = 1200px |
| `.col-sm-*` | `padding.apply: true`, `right`/`left` = **o gutter da original** (10px na `/prazos`) |

Resultado: coluna de 600px com conteúdo de 580px — idêntico ao site antigo, sem uma linha de CSS de
página. Meça o gutter da original antes (`getComputedStyle` do `.row` e da coluna); 10px é o valor do
construtor twig, não uma constante universal.

Custo a conhecer: com o `.container` sem padding, o respiro lateral no celular passa a vir só do
`.container-fluid` (12px) + o da coluna. Se a original tinha mais, devolva na raiz **Mobile** — é
exatamente para isso que existem duas raízes.

#### ⚠️ Correção: em página que trava o `.container`, a receita acima perde 5px por coluna

A receita da tabela anterior foi medida contra `/prazos`, cujo `.container` do tema já casava com a
original. Numa home com `.container` travado em **1200px** e gutter de **10px** ela deu **row de 1150
e coluna de 287,5** — **5px a menos por coluna**, porque zerar a `margin` do `.row` também mata o
transbordo que devolve os 2×10px das pontas.

A variante que fechou com desvio **ZERO** nessa página **mantém** o padding e devolve a margem
negativa por regra de página:

| bloco | o que fazer |
|---|---|
| `.container` | **manter** `padding: 10px` por config **+** regra de página `max-width: 1200px` |
| `.row` | regra de página `max-width: none; margin: 0 -10px` — o `max-width:100%` da classe gerada por bloco é justamente o que impedia o transbordo da margem negativa |
| colunas | `padding: 10px` por config |

Medido, nova contra original:

| elemento | nova | original |
|---|---|---|
| `.container` | 1200 | 1200 |
| `.row` | 1200 | 1200 |
| `col-sm-3` | 293×127 | 292,5×127 |
| `col-sm-6` | 600 | 600 |
| `col-sm-7` | 700 | 700 |
| `col-md-5` | 500 | 500 |
| imagem da seção de três ofertas | 580×546 | 580×546 |
| cartão de categoria | 273×112 | 273×112 |
| moldura | 110×110 | 110×110 |
| `.with-promo` | 1200×348 | 1200×348 |

Desvio máximo **1px** (uma `row` de 254 contra 253).

#### ⭐ Terceira receita, e é a mais curta: SEM bloco `row`

Medida em 2026-08-11 reproduzindo a `/politica-de-privacidade` (`.container` travado em **1200px**,
gutter **10px**, colunas `col-sm-12` e uma `col-sm-8`). Fechou com **desvio 0px nas 6 seções**, nos
dois devices, com **uma** regra de largura e **nenhum** bloco `row`.

Ela só existe porque o padding da coluna vem de `.row > *` e não da classe `col-*` (aviso da tabela
acima). Sem `row`, o `padding` do `.container` **é** o gutter:

| bloco | config | por quê |
|---|---|---|
| `.container-fluid` (faixa) | `padding.apply: true`, os quatro lados `"0px"` | mata os 12px do tema. **É o que faz o mobile bater**: sem isso o texto perde 12px de cada lado |
| `.container` (miolo) | `padding: 50px 10px` + regra de página `max-width:1200px` | borda-a-borda 1200, content box **1180** — idêntico ao `col-sm-12` da original |
| `editor` | direto dentro do `.container` | não precisa de `row` nem de coluna |

Só a seção que tinha `col-sm-8` na original leva coluna, e aí o `.container` vai com **padding lateral
`0px`** (content box 1200) para que `66,667%` dê os **800px** da original, com `padding: 0 10px` na
coluna → conteúdo **780px**. Medido nas duas páginas: `800` e `800`.

Aritmética das três receitas, para a original de 1200/10 (é o que decide qual usar):

| | `.container` content | linha | `col-sm-12` conteúdo | `col-sm-8` conteúdo | regras de página |
|---|---|---|---|---|---|
| receita 1 (zera tudo) | 1200 | 1200 | 1180 ✅ | 800 ✅ | 1 (`max-width`) |
| receita 2 (devolve margem) | 1180 | 1200 | 1180 ✅ | 800 ✅ | 2 |
| **receita 3 (sem `row`)** | **1180** | — | **1180 ✅** | 800 ✅ (container sem padding) | **1** |

**Como escolher entre as três:** se a página é de texto em coluna única — institucional, política,
prazos, FAQ —, use a **3**: menos blocos (na `/politica-de-privacidade`, 39 no total contra 60 da
estrutura de 5 níveis), uma regra de CSS, e nada de `flex_wrap`/`display:flex` para esquecer. Se a
página tem grid de verdade (2+ colunas por linha), você precisa da `row`: use a **1** se o
`.container` do tema já serve, e a **2** se a original trava a largura num valor próprio — aí o
`max-width` de página você vai escrever de todo jeito, e ele pede o `margin: 0 -gutter` no `.row`
junto, senão faltam os 2×gutter das pontas.

Nos três casos meça o gutter da original antes. E note que a receita 2 continua sendo a única que
precisa vencer o `max-width:100%` do wrapper de bloco — as outras duas não dependem dessa disputa.

⚠️ **Medir o gutter não basta: meça também a POSIÇÃO das colunas dentro da linha.** O site antigo é
**Bootstrap 4** (medido na folha dele), logo a `.row` da origem **já é flex** e qualquer
`margin:auto` / `align-self` / `align-items` que o CSS de página da origem aplique numa coluna tem
efeito de flex — numa institucional (`/uma-institucional`), um `.titulo{margin:auto}` centralizava o texto verticalmente com
**152px** de folga de cada lado, e reproduzir com o `flex-start` do default punha o título 152px
fora de lugar **sem mudar a altura da faixa**. Receita 2 aplicada com desvio 0px e ainda assim
errada no eixo vertical: `armadilhas.md` **11d**.

✅ **Receita 2 verificada de novo em 2026-08-12** (`/uma-institucional` migrada para uma página de rascunho,
original 1200/10): as quatro faixas fecharam em **580 · 382,8 · 200,8 · 383,6** contra os mesmos números da original — desvio
**0px** —, com `.container` 1200 (padding 10), `.row` 1200 (`margin: 0 -10px`, `max-width: none`) e
colunas de conteúdo 1180 / 580 / 380. As duas regras de página são as da tabela, sem mais nada.

⚠️ **A `/prazos-v2` medida, no ar, usa a receita 1, não a 2** (`blockStyle` de 39 chars, literalmente
`.<body_class da página> .container{max-width:1200px}`), embora a original dela trave a largura. Ou seja: o critério
"trava → receita 2" não é lei, é o caso em que a 2 é *necessária* — e ela só é necessária quando você
mantém o padding do container **e** precisa da linha cheia. Confira a aritmética acima em vez de
decorar a regra.

As regras usadas nas três são de `.container` e `.row`, que são **seguras** contra vazamento para o
tema (seção 3b) — mas escopar em `#layout-main-content` é de graça e elimina a dúvida.

#### ⚠️ Pai `flex` + `justify-content: center` encolhe o filho ao conteúdo — a saída é o pai em `block`

Vale para qualquer filho, e é fatal em bloco `code`: num pai `display: flex` com
`justifyContent: "center"`, o filho não estica — ele fica do tamanho do **conteúdo**. Medido: uma faixa
em bloco `code` deu **757px** dentro de um `.container` de **1200**, e os 4 itens dela **174px** em vez
de 280.

A correção óbvia — ligar `flexBehavior.enable: true, flex_grow: 1` no filho — **não funciona em bloco
`code`**: o DOM sai com `flex-grow: 0` mesmo assim (`armadilhas.md` 22f). O que resolve pela config
nativa é **trocar o PAI para `display.type: "block"`**: aí o filho é bloco e ocupa 100% naturalmente.
Resultado medido depois da troca: faixa **1180px**, itens **280px**, passo 300 — os números da original.

Regra prática: **centralizar não é trabalho de `justify-content` quando o filho é o único e deve ocupar
a linha.** Pai em `block` já centraliza (o filho toma a largura toda) e ainda funciona em `code`.

⚠️ **`container` não é 1200px.** Se você está reproduzindo uma página antiga, a largura dela é outra
(na `/formas-de-pagamento`, 1200px fixo). Trave com uma regra de página escopada pelo `body_class` —
`.SEU-BODY-CLASS .container{max-width:1200px}`, cerca de 40 caracteres, especificidade suficiente para vencer o
tema. Ver `armadilhas.md` item 11b.

**Por que isto importa:** largura e grid são o caso em que a config nativa **não funciona**, não
apenas "decepciona": o renderizador impõe `width`/`max-width: 1320px` em todo bloco e **ignora
`dimensions.width`** (medido — `armadilhas.md` item 13). Para largura de página e grid de colunas,
**use estas classes do tema**. Isso não é o anti-padrão da regra 2: essas classes vêm do tema,
carregadas uma vez — não viram CSS de página. O que a regra 2 condena é **inventar** classe nova e
escrever o CSS dela na página (como uma home `-v2` medida fez, reescrevendo o Bootstrap).

Continue usando a config nativa de `LAYOUT` (flex direction, gap, alinhamento, padding) para o
*miolo* das seções — ela é ótima nisso. A divisão prática: **largura de página e colunas → classes do
tema; espaçamento e arranjo interno → config nativa.**

### Onde acha cada id: mídia sai da URL, tipo/vitrine sai do JSON da origem

Duas fontes diferentes, e nenhuma das duas é "peça para o usuário":

- **Id de mídia individual → da URL renderizada.** `.../img.panorama/{banner|imagem}/{ID}/{arquivo}`.
  Para uma imagem solta (fundo de hero, ilustração de seção) basta ler a página pública.
- **Id de tipo de banner e de vitrine → do campo `Blocos:` da página de origem.** Esses **não**
  aparecem na página renderizada, porque o servidor resolve o agrupamento e entrega só a lista pronta
  (renomeada para `bannerlist`). Mas eles estão guardados no JSON do admin: `config.vitrine.vit_id` e
  `config.banner_tipo.id`. Abra a origem por `Alterar → Configurações`, extraia, e **saia por
  `Cancelar`**. O script pronto está em `armadilhas.md` item 4.

⚠️ Uma versão anterior desta skill dizia que id de tipo "só no admin, o usuário seleciona no painel".
É a saída preguiçosa: perde o **mapeamento** (qual vitrine em qual prateleira), que é justamente o que
ninguém consegue reconstruir depois. A grade `Loja On-line → Vitrines` complementa, dando o catálogo
(`#` = `vit_id`, mais `Código`, `Nome` e `Página`) — mas é a origem que diz qual usar onde.

⚠️ O objeto gravado pelo picker é **gordo** (`loj_id`, `vit_tipo`, `vit_codigo`, `pagi_url`, …, e o
lixo `$hashKey`/`row_index_grid`). Ver `armadilhas.md` item 4 antes de decidir o que copiar.

## 7. Tipos de página

`pageParams.type` no front-end; campo `Tipo` no diálogo `Alterar Página`. Página livre por blocos é
**`25` — Construtor**. É o tipo a usar para institucional, landing e conteúdo.

| id | Tipo | id | Tipo |
|---|---|---|---|
| 1 | Página Inicial | 17 | Minha Conta - Endereços |
| 2 | Produto | 18 | Minha Conta - Meu Cadastro |
| 3 | Categoria | 19 | Contato |
| 4 | Lista de Produtos | 20 | Blog - Lista de Posts |
| 5 | Busca | 21 | Blog - Post |
| 6 | Personalizada | 22 | Recadastramento de Senha |
| 7 | Html | 23 | Sitemap |
| 8 | Erros | 24 | Redirecionamento |
| 9 | Checkout | **25** | **Construtor** |
| 10 | Avaliar Produto | 26 | Produto Base |
| 11 | Carrinho | 27 | Avaliações da Loja |
| 12 | Login | 28 | Arquivo |
| 13 | Minha Conta | 29 | Lista de Compre Junto |
| 14 | M.C. - Avaliação de Itens | 30 | Minha Conta - SAC |
| 15 | M.C. - Lista de Pedidos | | |
| 16 | M.C. - Detalhes do Pedido | | |

Qual página é a home no ar varia por loja e por época, e três formas foram vistas: numa loja, a
home era uma `Página Inicial` (1) e as homes `-v2` em construção eram `Construtor` (25); noutra, a home
no ar era uma página `Construtor` com URL `/`, uma por campanha, e só a publicada valia; numa terceira,
uma `Construtor` com URL `/` só, a mesma havia meses. Confira na grade de Páginas (`mapa-do-admin.md`)
e anote no perfil da loja. Virar a chave envolve troca de tipo, de slug ou de publicação — e publicar é
operação que só se faz com pedido explícito (regra zero).

A lista acima não é fechada: num admin medido em 2026-10, a grade de Páginas também mostrava produtos,
com um tipo "Produto Derivação" (o id não foi medido). Filtre sempre pelo Tipo que você procura.

O tipo **`28` — Arquivo** é o dos arquivos CSS/JS do site (o tema sazonal, os scripts da loja). Não é
construtor: o conteúdo é texto cru, servido como está. Ver `mapa-do-admin.md`.
