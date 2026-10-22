# Catálogo da família `modelo-N` (tema modelo no CDN da plataforma), medido no `modelo-1`

Os seletores do tema `modelo-1` para as partes que mais se pedem para ajustar, e o que já se sabe de cada
uma. Tudo foi medido **numa loja** dessa família, em 20 e 21 de outubro de 2026: HTML baixado por `curl`
(computador e celular) da home, de listas (categoria, campanha, busca), de um produto, de institucionais, do
contato, do login, das avaliações da loja, e os arquivos do tema (`modelo-1.<hash>.css`, ~514 KB;
`modelo-1.<hash>.js`, menos de 1 KB; `platform.<hash>.css` e `.js`), mais o que a sessão mediu no navegador.
Outro `modelo-N` não foi medido: lá, use este arquivo como lista do que procurar, não como resposta.

**Confira na sua antes de escrever o seletor.** Uma linha basta:
`document.querySelectorAll('SELETOR').length`, nos dois aparelhos (HTML de celular de verdade,
`ajustes-visuais.md`, 4.2) e nas páginas onde a regra deve valer. Quando a pessoa falar de um texto que vê e
o seletor não estiver aqui, use `acharPorTexto` (`medir-no-navegador.md`, 4).

**Sobre os exemplos de CSS.** Os que começam por `body.sua-classe` estão no modo de época
(`ajustes-visuais.md`, seção 0). Num ajuste permanente, tire o `.sua-classe` e deixe o resto: por exemplo,
`body.sua-classe .tags .tag.tag-minha-etiqueta{…}` vira `body .tags .tag.tag-minha-etiqueta{…}`. `#RRGGBB` é
uma cor medida na sua loja. É a mesma regra do `catalogo-tema-base.md`, "Sobre os exemplos de CSS".

## Como saber que a loja é desta família

O perfil diz (linha "Família do tema", preenchida pelo passo 2i de `reconhecimento-da-loja.md`). No HTML
servido, o tema vem de `https://panoverse-cdn.com.br/css/modelo-N.<hash>.css` e
`https://panoverse-cdn.com.br/js/modelo-N.<hash>.js`, e a chave `modelo` da configuração vale `modelo-N`.
Se o tema vier de `/dist/css/loja.<hash>.css` no domínio da loja, o catálogo é o `catalogo-tema-base.md`;
se não for nenhum dos dois, não há catálogo (a tabela "Qual catálogo" do `catalogo-tema-base.md` diz o que
fazer).

**O que é da plataforma e vale também aqui.** As seções do `catalogo-tema-base.md` marcadas *plataforma*
(avisos de cookies e do app, Owl Carousel, etiquetas com classe gerada pelo nome, `isMobile`/`notMobile` e
`page-*` no `<body>`, `#area-body`, a tipografia do `platform.<hash>.css`) vêm do mesmo
`platform.<hash>.css`/`.js`, que tinha o mesmo hash nas duas lojas medidas em 2026-10-20. Este arquivo só
repete delas o que muda nesta família.

**Muita estrutura é comum às duas famílias** (menu lateral do celular, `body.menu-aberto`,
`.header-top.menuModel-N`, `.product-call-to-action-floating`, `.menu-item-container > a > .menu-content`),
mas não toda: o cabeçalho do computador, o selo de desconto, as etiquetas, a lista de produtos e a barra da
agenda são diferentes. Não copie um seletor de um catálogo para o outro sem medir.

## A cascata desta família, e o que ela muda

Medida numa loja (2026-10-20, home e páginas internas, computador e celular iguais), do mais fraco ao mais
forte:

`platform.<hash>.css` < `modelo-1.<hash>.css` < um `<style>` pequeno sem id < **`<style>` do SCSS de
Personalização** (sem id, começa com `@charset` e as variáveis em `:root`) < `<link>` do Google Fonts <
`<style id="builder-custom-css">` (só nas páginas do construtor) < **`<link>` do Código dentro do
`<head>`**, os últimos do `<head>` < `<style>` por bloco, dentro do `<body>`.

Consequência: aqui os arquivos da loja **vencem** o SCSS de Personalização e o CSS da página no empate de
especificidade. Subir especificidade ou pôr `!important` "para vencer o SCSS" é à toa (o contrário da família
`/dist`, `ajustes-visuais.md`, 1.1). Um `<link>` novo no fim do Código dentro do `<head>` fica depois de
tudo do `<head>`: a prévia dele é `--fim-do-head`, se nada mais estilizar depois desse código (confira com
`medir-no-navegador.md`, 1). Confira a ordem na sua loja e anote no perfil: ela é medida, não suposta.

## Sumário

1. Estrutura e cabeçalho
2. Menu
3. Card de produto
4. Listas de produto (categoria, busca, campanha)
5. Etiquetas criadas no admin
6. `:has()`, container queries e navegadores antigos
7. Carrosséis (Owl Carousel)
8. Reordenar seções por CSS
9. Barra promocional e Barra do Topo
10. Avisos e pop-ups
11. Banner principal, logo e ícones
12. Tipografia e variáveis do tema
13. Página do produto (medida em parte)
14. Armadilhas de CSS que valem em qualquer família
15. O que não recebe o tema
16. Rodapé

As seções 1 a 14 têm o mesmo número e o mesmo assunto do `catalogo-tema-base.md`: "catálogo da família,
seção N" funciona nos dois. A 15 e a 16 são só desta família.

## 1. Estrutura e cabeçalho

*Família modelo-1, medido numa loja, 2026-10-20 (confira):*

- **Classes do `<body>`**: `isMobile` ou `notMobile`, `menu-N` e o tipo de página: `page-home` com
  `page-builder` (home do construtor), `page-builder` (outras páginas do construtor), `page-product-list`
  (categoria, campanha **e busca**), `page-product`, `page-html` (institucionais), `page-contact` (contato),
  `page-login page-account page-account-order` (login), `page-store-rating-list` (avaliações da loja). As
  institucionais e o contato tinham mais uma classe em comum: leia a da sua (`document.body.className`).
  Na loja medida o `<body>` tinha `menu-1`, com os três modelos de cabeçalho e menu da configuração valendo
  2: o N do `menu-N` não é o deles; não use como âncora sem medir.
- **`use-floating-header`** é uma classe do `<body>` que, na loja medida, só a home tinha (categoria,
  produto e institucional, não). Confira por página: `document.body.classList.contains('use-floating-header')`.
- **`.inner-body.header-N`**, com N provavelmente o `headerModel` da configuração (na loja medida, `header-2`
  com `headerModel` 2).

**Computador:**

```
.inner-body.header-N
  > .header-container
      > .header-top-bar            (a Barra do Topo)
      > header
          > .container.hidden-sm-down   (logo, .searchContainer, .cartInfo, .menuBar.openMenuModel-N)
  > #area-body
  > footer                         (na home medida, dentro de #area-body: seção 16)
```

**Celular** (não há `.header-container`):

```
.inner-body.header-N
  > .menuOverlay
  > .menuBar.menuModel-N.openMenuModel-N   (menu lateral, seção 2)
  > .header-top-bar
  > header
      > .header-top.menuModel-N             (a.menu, .logo, .cartInfo)
      > .searchContainer
  > #area-body
  > footer
```

O cabeçalho do site é `.inner-body > .header-container > header` no computador e `.inner-body > header` no
celular. Use sempre o `>`: sem ele, a regra pega também o `<header>` de uma seção dentro da página
(`ajustes-visuais.md`, 2.3).

**Dentro do cabeçalho há caixas brancas**: a gaveta da sacola (`.cartInfo .dropdown`) e os termos mais
buscados (`.mostSearchedTerms`). Num cabeçalho escuro, pinte os itens, não o texto do cabeçalho inteiro: a
seção 15 lista essas caixas e o que mais fica fora de `#area-body` (`temas-sazonais.md`, 4 e 12).

### Cabeçalho flutuante: três estados no computador, mais o celular

Com `use-floating-header` no `<body>`, o `modelo-1.<hash>.css` faz o cabeçalho fixo:

```css
body.notMobile.use-floating-header .header-container{position:fixed;top:0;left:0;right:0;z-index:99;background:#fff;…}
```

e, enquanto o `.header-container` **não** tem a classe `scrolled`, ele fica transparente sobre o banner, com
menu, ícones e textos brancos. Um script inline que o servidor manda na home (no HTML de computador) põe
`scrolled` quando a página rola (`scrollTop > 0`) e tira quando volta ao topo. Sem `use-floating-header`, o
`.header-container` é estático e rola junto. No celular não há `.header-container`: o cabeçalho é estático.

Então uma cor ou um tema de cabeçalho tem **quatro estados** para desenhar e conferir:

| Estado | Onde | Seletor |
|---|---|---|
| home no topo | computador, página com `use-floating-header` | `body.notMobile.use-floating-header .header-container:not(.scrolled) …` |
| home rolada | idem, depois de rolar | `body.notMobile.use-floating-header .header-container.scrolled …` |
| outras páginas | computador, sem `use-floating-header` | `body.notMobile:not(.use-floating-header) .header-container …` |
| celular | todas | `body.isMobile .inner-body > header …` |

- **O próprio tema usa `!important` no estado do topo**: `…:not(.scrolled) .menuBar` e `…:not(.scrolled)
  header` com `background:0 0!important`, e `…:not(.scrolled) svg .fill{fill:#fff!important}`. Para pintar
  esse estado, só com `!important` e especificidade igual ou maior. O SCSS de Personalização da loja medida
  também pintava o estado do topo com `!important`. Meça cada estado com `quemPinta`
  (`medir-no-navegador.md`, 2) antes de decidir.
- **Como chegar a cada estado na sua aba:** `scrollTo(0, 400)` e espere 1 s (o script põe `scrolled`);
  `scrollTo(0, 0)` volta ao topo. Para só medir, também dá para trocar a classe à mão:
  `document.querySelector('.header-container').classList.toggle('scrolled')` (o próximo rolar desfaz).
- **O cabeçalho fixo cobre o começo da página.** O script inline põe a altura do cabeçalho num
  `.header-placeholder`, que não existia no HTML medido: o miolo começa por baixo do cabeçalho fixo (medido
  ~164px do banner coberto, numa home de 1707px). Se for assim na sua, é problema que já existe: leve à
  pessoa, não corrija sem pedido (`criterios-de-design.md`, 3).
- Antes de escrever "o cabeçalho é fixo no site todo" no perfil, meça em pelo menos dois tipos de página: a
  home costuma ser diferente.

## 2. Menu

*Família modelo-1, medido numa loja (confira):*

- **Computador:** `header .menuBar.openMenuModel-N > .container > ul.menu > li > .menu-item-container > a >
  .menu-content` (a mesma cadeia `.menu-item-container > a > .menu-content` da família `/dist`). Item com
  submenu: `li.has-child.is-megamenu`; o megamenu é `.megamenu.sub-menu`, com títulos
  `.megamenu-link-list > .menu-item-container > a.menuitem-title` e itens em
  `.megamenu-submenu-item.sub-menu ul > li`. N provavelmente é o `openMenuModel` da configuração.
- **Celular:** o menu lateral é `.inner-body > .menuBar.menuModel-N.openMenuModel-N` (filhos `.menuHeader`,
  `.user-info`, `.menu-blocks`, `ul.menu`), `position:fixed`, 270px, fundo branco, escondido com
  `translateX(-270px)`. Aberto, o `<body>` ganha `menu-aberto` (posto pelo `platform.<hash>.js`) e aparece o
  `.menuOverlay` (fixo, `z-index` 997; o menu, 999). Ele fica **fora** do `header` e de `#area-body`.
- Item de menu não tem classe própria: ache pelo `href` (`catalogo-tema-base.md`, 2). Mas um JS da loja pode
  tirar o `href` de títulos do menu depois que a página carrega (medido numa loja): confira no DOM da página
  carregada, não no HTML do servidor, antes de ancorar por `href`.
- Os itens e a ordem do menu são conteúdo (tela de menus do admin, não mapeada: `mapa-do-admin.md`, 14).

## 3. Card de produto

*Família modelo-1, medido numa loja (listas no HTML do servidor; as vitrines da home chegam por XHR e não
foram lidas no HTML):*

| Parte | Seletor | Observação |
|---|---|---|
| card | `.product.sku-<n>`; nas vitrines, dentro de `.block-product-list .product-list.pl-modelo-default`; nas listas, `.row.pl-modelo-default > .col-* > .product` | o `.product` tem `onclick` que abre o produto: o clique em qualquer lugar do card abre, mas não pelo teclado (`zonasMortas`, que procura `<a>`, conta como morto o que o `onclick` cobre) |
| moldura da foto | `.ar.ar-1.picture` | o primeiro filho é um `<a>` que envolve os cantos de etiquetas e as fotos |
| foto | `.capa.ar-content img` e `img.segunda-foto` | a segunda foto aparece no hover |
| cantos de etiquetas | `.tags.tags-top-right` (e `tags-top-left`, `tags-bottom-left`, `tags-bottom-right`) | dentro do `<a>`: use `.picture .tags`, não `.picture > .tags` |
| selo de % do tema | `.ar .tags .tag-percentual-desconto` | `background:var(--color-primary);color:#fff`, **sem `!important`**, 37x37px, `:after{content:"OFF"}`. Não apareceu em nenhuma página baixada da loja medida (o desconto aparecia como etiqueta do admin e como texto no preço) |
| etiquetas criadas no admin | `.tags .tag.tag-<código-da-etiqueta>` | chegam com `style="background-color:…;color:…"` posto pelo servidor (40 de 40 numa lista medida): **só `!important` vence o atributo** (seção 5) |
| nome | `.product-info > a > h2` | `h3` na família `/dist` |
| estrelas | `.rating .c-rating[data-rating-value]` e `.rating-count` | igual à família `/dist` (`catalogo-tema-base.md`, 3) |
| preços | `.prices.prices-with-discount > .flex-line > .price-from` (riscado), `.price-sale` (o preço), `.price-discount` ("(N% OFF)"); embaixo, `.price-by-cartaoCredito` (parcelado) | no card medido não havia `.price-by-boleto`. Na loja medida, com `layoutPriceMethod` = `pix` (configuração da loja, `mapa-do-admin.md`, 1), o `.price-sale` era o preço do PIX/boleto; o do cartão aparecia no parcelado (`.price-by-cartaoCredito`); e o "(N% OFF)" era calculado sobre o `.price-sale`, arredondado para o inteiro mais perto (8,9% saía "9% OFF"). Com outro valor da chave, não medido |
| variações | `.product-variations .product-variation-item` (amostras de cor) | cada amostra tem `onclick` próprio |

- **Pedido de selo de desconto** ("quero o selo de desconto vermelho"): nesta família são três coisas
  diferentes. Pergunte (ou meça com `acharPorTexto`, `medir-no-navegador.md`, 4) qual é: a etiqueta criada
  no admin (seção 5: cor no `style`, só `!important` vence, ou mudar no cadastro), o selo de % do tema
  (`.tag-percentual-desconto`, se existir na sua) ou o "(N% OFF)" do preço (`.price-discount`).
- **Comprar.** Nos cards medidos não havia botão de compra. O "Comprar" da página do produto é outro
  elemento (seção 13).
- **Card inteiro clicável** já vem do `onclick`. Se a pessoa pedir que o card seja um link de verdade (com
  teclado, botão do meio, "abrir em nova aba"), isso é HTML do tema: CSS não resolve. O `::after` sobre o
  card da família `/dist` (`catalogo-tema-base.md`, 3) só estende o link do nome, e aqui também valeria, mas
  confira com `zonasMortas` e com o Tab.

## 4. Listas de produto (categoria, busca, campanha)

*Família modelo-1, medido numa loja (confira):*

- `body.page-product-list` vale para categoria, página de campanha e busca.
- A grade é `#area-body form#form.block-product-list #area-search .content > .row.pl-modelo-default >
  .col-sm-3.col-6 > .product`. **Não há `.product-list` nas listas** (só nas vitrines): um seletor
  `.product-list .product` da família `/dist` não pega a lista aqui.
- Filtros: `#area-search .col-md-3 > .filters`. No celular os filtros viram uma gaveta fixa (`z-index` 999)
  aberta com `body.filter-aberto`.
- **O congelamento de altura dos cards da família `/dist`** (`.on-hover-details-started` com altura no
  `style`, `catalogo-tema-base.md`, 4) **não foi achado** no `modelo-1.<hash>.css`, no `.js` nem no
  `platform.<hash>.js`. O evento `ProductList:instanciar` existe (é da plataforma). Antes de supor que a
  prévia precisa refazer alturas, olhe se algum card ganhou `style` de altura depois de carregar:
  `document.querySelectorAll('.pl-modelo-default .product[style*="height"]').length`.

## 5. Etiquetas criadas no admin

- A classe sai do código da etiqueta, como na família `/dist` (plataforma: `catalogo-tema-base.md`, 5, com o
  escape de acento e o redesenho do texto).
- **A cor vem no atributo `style`** (`background-color` e `color`), posto pelo servidor a partir do cadastro
  (medido numa loja: todas as etiquetas das listas, da busca e do produto). O atributo vence qualquer regra
  sem `!important`, de qualquer especificidade. Para mudar a cor por CSS:

  ```css
  body.sua-classe .tags .tag.tag-minha-etiqueta{background-color:#RRGGBB !important;color:#RRGGBB !important;}
  ```

  Antes, pergunte se a cor não deve mudar no próprio cadastro da etiqueta (conteúdo da pessoa; Loja On-line ›
  Tags, lida só em parte: `mapa-do-admin.md`, seção 16): lá ela muda em todo lugar, inclusive onde o seu CSS
  não chega (seção 15).
- Confira quantas têm `style`: `document.querySelectorAll('.tags .tag[style]').length`.

## 6. `:has()`, container queries e navegadores antigos

É do navegador, não do tema: vale o que está no `catalogo-tema-base.md`, 6.

## 7. Carrosséis (Owl Carousel)

*Plataforma (o `owlCarousel` vem do `platform.<hash>.js`, nas duas famílias medidas):* a anatomia, o
autoplay, as bolinhas e a vitrine que empurra a página estão no `catalogo-tema-base.md`, 7. O que se viu
nesta família, numa loja:

- As classes do bloco dizem o desenho: `owl-desktop-N` e `owl-mobile-N` (itens por tela), `with-nav`,
  `with-nav-inside`, `with-dots`. As vitrines da home são
  `.block-product-list .product-list.pl-modelo-default.with-slider.owl-carousel` e chegam com
  `.item.item-placeholder` vazias (6 por vitrine no computador, 3 no celular, na home medida) até o XHR
  dos produtos.
- O banner principal tinha a classe `.banner-principal`, que também apareceu na loja da família `/dist` e
  não está no CSS de nenhum dos dois temas: vem do bloco. Confira a do seu.
- **Um JS da loja pode montar um Owl dentro da Barra do Topo** (medido numa loja). O Owl mede a largura
  quando monta; uma prévia que muda a largura do container depois disso corta o carrossel **só na prévia**.
  Carrossel montado antes da prévia: gere o favorito com `--resize` (`previa.md`, "JS na prévia") e, no
  teste de "0 diferenças", faça a contraprova (`medir-no-navegador.md`, 9).

## 8. Reordenar seções por CSS

Vale o `catalogo-tema-base.md`, 8, com um cuidado a mais: na home medida desta família o `footer` estava
**dentro** de `#area-body` (seção 16). Um `display:flex` + `order` em `#area-body` mexeria no rodapé também.
Confira com `!!document.querySelector('#area-body > footer')`.

## 9. Barra promocional e Barra do Topo

*Família modelo-1, medido numa loja (confira):*

- **Barra do Topo** (Configurações › Visual › Cabeçalho, `headerTopBarShow` / `textoHeaderTopbar`): no
  computador, `.inner-body > .header-container > .header-top-bar`, dentro do cabeçalho (na página com
  cabeçalho flutuante, ela flutua junto); no celular, `.inner-body > .header-top-bar`, estática. Para os dois
  aparelhos: `.inner-body .header-top-bar` (ou cada caminho com o seu `>`). O tema pinta com
  `background:var(--header-top-bar-background);color:var(--header-top-bar-color,#fff)` (quase a mesma regra
  da família `/dist`): mudar as variáveis muda a barra.
- **`.promotionBar` (a barra da agenda de skins): não ponha no item.** Nem o `platform.<hash>.css` nem o
  `modelo-1.<hash>.css` estilizam `.promotionBar`, e nenhum JS do tema define a função `countdown`, que o
  script inline que o servidor manda com a barra chama (na família `/dist` ela vem do `bundle.<hash>.js`).
  A loja medida nunca tinha usado a agenda: o HTML e o script da barra não foram vistos nesta família.
  Ligar `promotionBar` na agenda daria uma barra sem estilo e um erro de script **se** o servidor mandar o
  mesmo script da família `/dist`. E o erro não ficaria na barra: a plataforma roda as funções do
  `window.onReady` uma depois da outra, sem `try/catch` (lido no `platform.<hash>.js`, 2026-10; não
  executado), e as que vêm depois da barra não rodariam. Não se mediu se uma função `countdown` própria
  evitaria o erro: não tente. A contagem vai numa barra sua, com o item da agenda sem `promotionBar`
  (`temas-sazonais.md`, 5 e 7, "Numa família sem a barra da agenda"). Antes de falar da barra da agenda com
  a pessoa, veja no perfil se ela funciona na loja (reconhecimento, 2f).
- Relógio, cronômetro e reserva de altura: `catalogo-tema-base.md`, 9, e `temas-sazonais.md`, 6.

## 10. Avisos e pop-ups

- `#lgpd-message` (cookies) e `#app-message` (baixar o app): *plataforma*, os estilos vêm do
  `platform.<hash>.css`. Vale o `catalogo-tema-base.md`, 10 (primeira visita, aba anônima, não use
  `display`).
- **Pop-up do construtor** (um bloco de modal numa página): é montado por script (`Ergo.modal`, do
  `platform.<hash>.js`) com a classe `type-builder` (na loja medida, `#blockModal`), **fora** de
  `#area-body`, e só aparece depois de um tempo ou de uma ação, conforme o bloco. Num tema que muda cor de
  texto, confira com ele aberto (seção 15).

## 11. Banner principal, logo e ícones

*Família modelo-1, medido numa loja (confira):*

- **Logo**: SVG inline (Visual › Logo e Ícone, `svgLogo`), com a altura
  `header .logo svg{height:var(--header-logo-height,60px)}`; no celular `.header-top .logo svg{height:30px}`;
  no rodapé, `footer .footer-menu .logo svg` com `--footer-logo-height`. O SVG pode trazer um `<style>`
  próprio com classe genérica, que vale para o documento inteiro, e o mesmo SVG pode aparecer no rodapé:
  `mapa-do-admin.md`, 8 (inclusive a opção de logo "sobre a cor primária", `svgLogoContrast`).
- **Ícones** do cabeçalho e do rodapé usam a classe `.fill`: `header .fill{fill:var(--header-icon-color,#000)}`,
  `footer .fill{fill:var(--footer-icon-color,#000)}`. No estado do topo do cabeçalho flutuante,
  `svg .fill{fill:#fff!important}` (seção 1).
- **Setas e bolinhas do banner** e as imagens de marca: `catalogo-tema-base.md`, 11. A arte do banner é
  conteúdo da pessoa.

## 12. Tipografia e variáveis do tema

- *Plataforma:* `platform.<hash>.css` dá ao `body` `font-size:12px`, `color:#292b2c` e
  `background-color:#fff`. O branco do fundo vem daí (importa num tema escuro: `temas-sazonais.md`, 12).
- *Família modelo-1:* o tema põe `body,input,select{font-family:var(--font-family)}` e declara ~44
  variáveis no `html` com valores padrão (`--font-family`; `--color-primary`, `--color-secondary`,
  `--color-text` e as de hover e "inverse"; `--menu-*`; `--btn-*`; `--header-top-bar-background`,
  `--header-logo-height`, `--header-background`, `--header-menu-bar-background`; `--footer-*`). O SCSS de
  Personalização da loja medida as redefinia em `:root` com as cores da marca. `:root` pesa mais que `html`
  (uma pseudo-classe contra uma tag), então o `:root` do SCSS vence o `html` do tema em qualquer ordem.
- **Mudar uma variável muda o site inteiro onde ela é usada.** Liste com `variaveisCss`
  (`medir-no-navegador.md`, 5), mostre na prévia e veja antes se a tela de configuração tem a opção
  (`ajustes-visuais.md`, 2.1).
- **Variável declarada mais perto vence.** As da busca (`--search-input-color`, `--search-input-border` e
  outras) são declaradas em `body.notMobile.use-floating-header .header-container:not(.scrolled)`: uma
  `--search-input-color` posta no `:root` ou no `body` não chega à busca nesse estado. Declare a variável
  no mesmo elemento (ou mais perto), com especificidade igual ou maior.
- **Variável sem valor usa o padrão de cada regra**, e eles não são iguais: `var(--footer-color,#666)` numa
  regra, `#555` noutra, `#333` noutra. Definir `--footer-color` unifica todas de uma vez: confira que era
  isso que se queria.
- Fontes carregadas: `[...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status)`; regras
  relativas (`em`) e `<li>`/`<td>` herdando o `body`: `catalogo-tema-base.md`, 12.
- **Fonte de título com acento em tamanho pequeno.** Numa loja desta família, uma fonte de título do Google
  Fonts desenhava errado o til e o agudo das maiúsculas abaixo de ~50px reais. O caso, a correção usada e o
  que conferir estão no `catalogo-tema-base.md`, 14.

## 13. Página do produto (medida em parte: meça na sua loja)

*Família modelo-1, HTML de computador e de celular de um produto, numa loja:*

- Bloco principal: `#area-body .main-container .product-header-area > #area-summary.area-summary >
  .product-summary`.
- Preços: `.product-summary .prices`, com `.price-from` e `.price-options` (`.price-option-boleto`,
  `.price-option-creditcard`).
- **Comprar**: `.product-summary .can-sell .call-to-action-area .product-call-to-action a.addCarrinho` e,
  igual, a barra de compra flutuante `.product-call-to-action-floating a.addCarrinho` (fixa no rodapé da tela
  só no celular: `.isMobile .product-summary .product-call-to-action-floating{position:fixed;z-index:995}`).
  Os dois estão no HTML dos dois aparelhos: escope por aparelho.
- **Na loja medida, o `a.addCarrinho` não tinha `href`**: não recebe foco pelo Tab, e um
  `.addCarrinho:focus-visible` nunca casa. Não se sabe se é do tema ou da loja: confira
  (`document.querySelector('a.addCarrinho:not([href])')`). CSS não corrige: leve à pessoa
  (`criterios-de-design.md`, 3).
- Frete: `.box-frete-favorito .can-sell.calculo-frete`. Sem estoque: `a.unavailable-btn` (formulário de
  "avise-me").
- O resto (abas, avaliações, recomendações) não foi medido. Siga as perguntas e as medidas do
  `catalogo-tema-base.md`, 13.
- **Box de compra na faixa de 1024 a 1199px** (o iPad deitado recebe o site de computador:
  `ajustes-visuais.md`, 4.1). Numa loja (2026-10), com o preço do `.price-value` a 38px, a borda direita do
  box passava da tela de 1024 a ~1120px (em 1024, ~50px do Comprar ficavam fora). A causa apontada: a coluna
  do resumo (`.area-summary`) é item flex com `min-width:auto`, e a linha do preço (`.price-with-tag`, com o
  preço e o "(N% OFF)", sem quebra) não encolhe. Correção usada: preço menor nessa faixa, dentro de
  `@media (max-width:1199.98px)`, e `flex-wrap:wrap` na linha do preço. Sem o preço de 38px, a versão anterior
  do tema de época já cortava ~37px em 1024: meça a linha de base sem a sua mudança. Meça nessa faixa nos
  casos da `ajustes-visuais.md`, 4.1 (texto, preço, botão, ou algo posto junto do preço ou do box de compra).

## 14. Armadilhas de CSS que valem em qualquer família

No `catalogo-tema-base.md`, 14: degradê com borda transparente, a camada padrão com `:where()`, a cor
herdada pelas caixas brancas do tema, `:root` contra `html`, a variável declarada mais perto, o acento de
fonte de título em tamanho real pequeno (medido nesta família, seção 12) e o texto decorativo em
`::before`/`::after`, que o leitor de tela lê. Nesta família, as caixas brancas sem cor de texto própria medidas
foram os balões de validação `.validatorLog` (criados pelo `platform.<hash>.js`), os painéis da busca
(`.mostSearchedTerms` e `.autocomplete-suggestions`, `background:#fff`) e trechos de páginas que o
reconhecimento não baixa (seção 15).

## 15. O que não recebe o tema

Dois casos, que importam sobretudo num tema que muda fundo ou cor de texto (`temas-sazonais.md`, 12).

**Endereços que são outro sistema.** Numa loja desta família, o carrinho (`/finalizar-compra/…`) e uma área
de assistência eram rotas Next.js dentro do site twig: `<body>` sem classe nenhuma, estáticos de
`cdn.panoramasistemas.com.br/_next/`, sem os `<link>` do Código dentro do `<head>`. Nem o tema, nem a classe
da agenda, nem os Arquivos da loja chegam lá (`mapa-do-admin.md`, 15). O reconhecimento lista quais são
(perfil, "Endereços fora do tema"); diga à pessoa que o ajuste não chega a essas páginas.

**Partes da página fora de `#area-body`.** Uma cor de texto posta em `#area-body` não chega a elas, e uma
posta no `body` chega a todas, inclusive às caixas brancas onde o texto claro some:

| Parte | Onde fica | Fundo |
|---|---|---|
| cabeçalho e Barra do Topo | `.inner-body > .header-container` (computador) ou `.inner-body > .header-top-bar` + `header` (celular) | do tema, por estado (seção 1) |
| painel da sacola | dentro do cabeçalho (`.cartInfo .dropdown`) | branco |
| menu lateral do celular e o fundo escuro dele | `.inner-body > .menuBar`, `.menuOverlay` | branco |
| termos mais buscados (painel que abre no campo de busca) | `header .searchContainer .searchForm .mostSearchedTerms`, dentro do cabeçalho | branco; os itens sem cor de texto própria |
| sugestões da busca (ao digitar) | `.autocomplete-suggestions`, posta no fim do `<body>` pelo autocomplete do `platform.<hash>.js` (`appendTo: document.body`), que o `modelo-1.<hash>.js` liga no campo de busca | branco, sem cor de texto (só o `strong` tem) |
| avisos de cookies e do app | `#lgpd-overlay` / `#lgpd-message`, `#app-message` | do `platform.<hash>.css` |
| pop-ups do construtor | `#blockModal.type-builder` (seção 10) | o do bloco |
| rodapé | irmão de `#area-body`, ou dentro dele na home medida (seção 16) | do tema |

Dentro de `#area-body` também há caixas brancas sem cor própria: os balões `.validatorLog`. Para achar o
texto que sumiu, use a varredura de contraste (`medir-no-navegador.md`, 12) com menus, gavetas, sugestões e
pop-ups abertos e com um formulário enviado com erro. Como abrir cada parte na sua aba, uma por uma:
`temas-sazonais.md`, 12, passo 10.

## 16. Rodapé

*Família modelo-1, medido numa loja (confira):*

- `footer`, com os filhos `.footer-newsletter`, `.footer-information`, `.footer-menu`, `.footer-checkout`,
  `.footer-copyright` e `.powered-by`. No celular, os títulos do `.footer-menu` abrem e fecham
  (`.title.temSub`).
- **Onde ele fica:** nas listas, no produto, nas institucionais e no login, `footer` é irmão de `#area-body`
  (filho de `.inner-body`). Na home medida, uma página do construtor, ele estava **dentro** de `#area-body`:
  o `#area-body` não fechava antes do rodapé (a causa não foi apurada). Uma regra em `#area-body` pode pegar
  o rodapé: para o miolo sem ele, use `#area-body > :not(footer)`, e confira com
  `!!document.querySelector('#area-body > footer')` em cada tipo de página.
- Cores pelas variáveis `--footer-*` (`--footer-background`, `--footer-color`, `--footer-border`,
  `--footer-newsletter-background`, `--footer-newsletter-color`, `--footer-icon-color`,
  `--footer-copyright-color`), cada uma com um padrão diferente em cada regra (seção 12).
- Uma coluna do rodapé vazia (sem itens cadastrados) é conteúdo: leve à pessoa (`criterios-de-design.md`, 3).
