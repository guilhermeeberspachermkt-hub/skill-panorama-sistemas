# Catálogo da família `/dist` (loja.css + bundle.js), com armadilhas vistas na prática

## Qual catálogo

A plataforma serve mais de uma família de tema twig, e os seletores mudam de uma para outra. Antes de usar
qualquer seletor, leia no perfil da loja a linha "Família do tema" (o passo 2i de
`reconhecimento-da-loja.md` descobre pelos endereços dos arquivos do tema no HTML servido):

| Família | Como aparece no HTML | Catálogo |
|---|---|---|
| `/dist` | `https://<site>/dist/css/loja.<hash>.css` e `/dist/js/bundle.<hash>.js`, no domínio da própria loja | **este arquivo** |
| `modelo-N` | `https://panoverse-cdn.com.br/css/modelo-N.<hash>.css` e `/js/modelo-N.<hash>.js` | `catalogo-modelo-1.md` (medido no `modelo-1`; noutro N, meça cada seletor) |
| front-end novo (React/Next) | `<script id="__NEXT_DATA__">`, classes `pano-*` | nenhum: `construtor.md` e `armadilhas.md` 11c, 17 e 26b |
| desconhecida | nenhum dos anteriores | nenhum: meça cada seletor (`acharPorTexto` e `quemPinta`, `medir-no-navegador.md` 4 e 2) e diga à pessoa que essa parte não tem medição anterior |

As duas famílias twig medidas carregam também a **camada da plataforma**,
`https://panoverse-cdn.com.br/css/platform.<hash>.css` e `/js/platform.<hash>.js` (o mesmo hash nas duas
lojas em 2026-10-20). O que vem dela está marcado *plataforma* nas seções abaixo e vale nas duas famílias;
o resto é da família `/dist`. Os dois catálogos usam os mesmos números de seção: "catálogo da família,
seção N" funciona nos dois.

## Sobre este catálogo

Os seletores da família `/dist` para as partes que mais se pedem para ajustar, e o que já deu errado em cada
uma. Tudo foi medido **numa loja** dessa família, em outubro de 2026. O `loja.<hash>.css` medido trazia as
cores e as fontes da loja (parece montado por loja), temas mudam de versão e cada loja personaliza:
**confira na sua antes de escrever o seletor** (uma linha basta:
`document.querySelectorAll('SELETOR').length`, nos dois aparelhos e nas páginas onde a regra deve valer).
Quando a pessoa falar de um texto que vê ("o botão Comprar") e o seletor não estiver aqui, use
`acharPorTexto` (`medir-no-navegador.md`, 4).

O roteiro (de onde vem o estilo, onde pôr, prévia, pôr no ar, desfazer) está em `ajustes-visuais.md`.

**Sobre os exemplos de CSS.** Eles começam por `body.sua-classe`, que é o modo de época
(`ajustes-visuais.md`, seção 0). Num ajuste permanente, tire o `.sua-classe` e deixe o resto: por exemplo,
`body.sua-classe.isMobile .inner-body > header{…}` vira `body.isMobile .inner-body > header{…}`. `#RRGGBB` é
uma cor medida na sua loja.

## Sumário

1. Estrutura e cabeçalho
2. Menu
3. Card de produto
4. Listas de produto (categoria, busca, campanha)
5. Etiquetas criadas no admin
6. `:has()`, container queries e navegadores antigos
7. Carrosséis (Owl Carousel)
8. Reordenar seções por CSS
9. Barra promocional e barra do topo
10. Avisos de cookies e do app
11. Banner principal, logo e imagens de marca
12. Tipografia do tema
13. Página do produto (medida em parte)
14. Armadilhas de CSS que valem em qualquer família

## 1. Estrutura e cabeçalho

*Plataforma (nas duas famílias medidas):* `body` com `isMobile`/`notMobile` e `page-*`; o miolo é
`#area-body`. *Família `/dist` (medido numa loja, confira):* dentro do `body`, `.inner-body` com `header`,
`.menuBar` (menu), `#area-body` (miolo) e o rodapé, todos filhos diretos de `.inner-body`. Na família
`modelo-1` o cabeçalho do computador fica dentro de um `.header-container` (`catalogo-modelo-1.md`, 1).

- `.inner-body > header` é o cabeçalho; `.header-top` é a primeira faixa dele. Use sempre o `>`
  (`ajustes-visuais.md`, 2.3).
- **Caixas brancas dentro do cabeçalho.** A gaveta da sacola (`.cartInfo .dropdown`) e os termos mais
  buscados (`.mostSearchedTerms`) ficam dentro do `<header>` (nas duas famílias medidas). Num cabeçalho
  escuro, pinte os itens, não o texto do cabeçalho inteiro (`temas-sazonais.md`, 4 e 12, passo 4).
- **Margem que vaza do cabeçalho.** Uma `margin-top` no primeiro filho do `<header>` (no caso medido,
  `.header-top{margin-top:10px}` vindo do SCSS de Personalização) atravessa `header`, `.inner-body` e `body`,
  que não têm padding nem borda, e empurra a página. Sem tema escuro ninguém vê (é tudo branco); com ele,
  aparece uma faixa clara no topo. Correção, só no aparelho afetado:

  ```css
  body.sua-classe.isMobile .inner-body > header{padding-top:10px;}
  body.sua-classe.isMobile .inner-body > header > .header-top{margin-top:0;}
  ```

  O cabeçalho passa a começar no topo da tela e o resto da página fica exatamente onde estava.
- **Busca presa no topo do celular.** O cabeçalho do celular (medido: 121px, logo 56px e busca 50px) some ao
  rolar. `position:sticky` com `top` negativo prende só a faixa de baixo:

  ```css
  body.sua-classe.page-home.isMobile .inner-body > header{position:sticky;top:-61px;z-index:900;}
  ```

  O `top` é "altura do cabeçalho menos a faixa que fica" e muda junto com qualquer padding acima (com a
  correção anterior, -61px virou -71px). `sticky` não tira o cabeçalho do fluxo (nada mais se mexe) e só
  funciona sem ancestral com `overflow` diferente de `visible`. Camadas medidas: menu lateral 999, aviso de
  cookies 998, aviso do app 997, cabeçalho preso 900 — e bolinhas de carrossel com 999, que passariam por cima
  do cabeçalho preso (baixe para 11). A lista de sugestões da busca é `position:absolute` na página: rolando
  com ela aberta, ela rola e o campo fica.

## 2. Menu

*Família `/dist` (medido numa loja, confira):* `.menuBar .menu > li > .menu-item-container > a > .menu-content`
(a mesma cadeia apareceu na família `modelo-1`, dentro do `header`).

- Item de menu **não tem classe própria**. Para destacar um, ache pelo link, cobrindo endereço relativo e
  absoluto:

  ```css
  body.sua-classe.notMobile .menuBar .menu > li > .menu-item-container > a:is([href^="/campanha"],[href^="https://www.SUA-LOJA.com.br/campanha"]) > .menu-content{…}
  ```

  Confira no DOM da página carregada que o `href` está lá: um JS da loja pode tirá-lo depois da carga
  (medido numa loja da família `modelo-1`).
- O tema põe fundo cinza claro no hover dos itens: zere no item destacado e ponha o hover dentro de
  `@media (hover:hover)`.
- Para não mudar a altura da barra (medido: 43,5px), tire do padding do link o que a pílula acrescenta
  (12px › 6px para uma pílula de 31px). O menu se distribui com `justify`: confira em 1366 e 1024 que continua
  numa linha.
- No celular o menu é uma lista lateral clara: um item escuro ali é o único escuro da lista. Mantenha a altura
  da linha (medido: 45,5px).
- Os itens e a ordem do menu vêm da tela de menus do admin, que não foi mapeada (`mapa-do-admin.md`, seção
  14): mudar o que o menu contém é conteúdo, e é da pessoa.

## 3. Card de produto

*Família `/dist` (medido numa loja, confira):*

| Parte | Seletor | Observação |
|---|---|---|
| card | `.product` (nas vitrines da home, dentro de `.block-product-list`) | o card leva também a classe `sku-<código>` (medido numa loja): acha um produto pelo código numa lista ou no resultado da busca do site (`reconhecimento-da-loja.md`, 2d) |
| moldura da foto | `.picture` | em algumas listas tem `overflow:hidden` e corta o que passa dela |
| foto | `.ar-content img` | a segunda foto aparece no hover |
| cantos de etiquetas | `.tags.tags-top-right` (e os outros cantos) | |
| selo de desconto | `.tags .tag.tag-percentual-desconto` | família `/dist`: no `loja.css`, `background` e `color` com `!important`, `padding:7px 14px`; texto medido 8,96px. Para mudar a cor, só com `!important` (`ajustes-visuais.md`, 1.2). Na família `modelo-1` o selo do tema não tem `!important` (`catalogo-modelo-1.md`, 3) |
| outras etiquetas | `.tag.tag-envio-imediato`, e as criadas no admin (seção 5) | |
| nome | `.product-info > a` com `h3` | nomes cortados em 2 linhas |
| estrelas | `.rating .c-rating[data-rating-value]` | `data-rating-value="0"` = 5 estrelas vazias, "nota zero" (16 de 29 cards medidos). Esconda com `visibility:hidden`, não `display:none`, para os cards continuarem alinhados |
| preços | `.prices .price-from` (riscado), `.prices .price-by-boleto` (preço à vista e o texto "à vista no pix") | o riscado e o "à vista" medidos em `#7c8096` sobre branco: 3,9:1, abaixo do mínimo, inclusive fora de qualquer tema (esse cinza está no `platform.<hash>.css`) |

- **Card inteiro clicável.** Só a foto e o nome são links: o preço, as estrelas e a moldura não abrem o
  produto. O nome ganha um `::after` que cobre o card (o `.product-info` é `static`, então o `::after` se
  estica até o `.product`):

  ```css
  body.sua-classe.notMobile .block-product-list .product{position:relative;}
  body.sua-classe.notMobile .block-product-list .product .product-info > a::after{content:"";position:absolute;inset:-10px;z-index:2;}
  body.sua-classe.notMobile .block-product-list .product .picture{z-index:3;}   /* a foto acima: hover da 2ª foto continua */
  ```

  Confira com `zonasMortas` (`medir-no-navegador.md`, 7) que não sobrou linha sem link e que nenhum outro
  botão do card ficou por baixo. O carrossel do tema cancela o clique que vem depois de um arraste, então
  arrastar não abre o produto (medido nos dois aparelhos).
- **Canto alargado bloqueia clique.** Esticar o canto das etiquetas (`left:10px`) para mover uma delas criou,
  nas listas do computador, uma faixa de ~173x24px fora do link da foto que não abria nada. Resolve com
  `pointer-events:none` no canto e `pointer-events:auto` nas etiquetas.
- **Comprar no card.** Se a loja mostra um botão de compra rápida no card, ele é outro elemento que o
  `Comprar` da página do produto (seção 13): pergunte de qual a pessoa está falando.
- **Qual preço é o principal do card** depende da configuração `layoutPriceMethod` da loja
  (`mapa-do-admin.md`, 1). Medido numa loja da família `modelo-1` (`catalogo-modelo-1.md`, 3). Na loja
  medida da família `/dist` (2026-10), as chaves do card nem existiam no admin: vale o padrão da plataforma
  (`default`), e o que ele escolhe não foi medido; olhe o card. Confira antes de calcular um % a partir do
  "de" e do "por" do card (`temas-sazonais.md`, 8).

## 4. Listas de produto (categoria, busca, campanha)

*Família `/dist` (medido numa loja, confira):* `body.page-product-list`, `.product-list .product`.

- **O miolo da lista é `#area-body`**: nas listas (categoria e busca) não existe `#layout-main-content`, que é
  das páginas do construtor (medido numa loja, 2026-11). O texto da categoria fica em `.category-information`,
  e a descrição longa, a que se abre por "ler mais", em `.read-more-content`: é ali que entra a cor colada pelo
  admin, a da conferência de `previa.md` ("a cor colada no admin"), e o mapa `scripts/mapas/familia-dist.json`
  já aponta para lá. Abra o "ler mais" antes de medir.
- **Busca pelo endereço:** `/buscar/<termo>`. Numa loja (2026-11), `/buscar/mesa%20branca` virou a busca
  "mesa 20branca", e `/buscar/sofa` levou à categoria Sofá. Para um print de busca, use uma palavra só, que não
  seja nome de categoria, e confira no print o termo que a página mostra.
- **Paginação por script:** o clique automatizado no número da página não navegou num Chrome de script, com e
  sem a prévia (medido numa loja, 2026-11). Antes de concluir que a paginação quebrou, peça à pessoa que
  confira no Chrome dela.

- **No computador, o tema congela a altura de cada card** quando monta a lista (o evento
  `ProductList:instanciar` é da plataforma; o congelamento, com cards `.on-hover-details-started` e `style` de
  altura no `.product-container`, só foi achado na família `/dist`). No ar, o seu CSS já está lá quando o
  tema mede. Na prévia, não: refaça a medição (`ajustes-visuais.md`, 3.3).
- No computador, **cada imagem do carrossel interno do card também tem a classe `picture`**: uma regra em
  `.picture` estica o carrossel. Exclua com `:not(.product-picture-slider .picture)`.
- No celular os cantos de etiquetas ficam dentro de um `<a>`: use `.picture .tags`, não `.picture > .tags`.
- A lista é uma grade só: reservar espaço num card (para uma etiqueta abaixo da foto) obriga a reservar em
  todos, ou os preços desalinham.

## 5. Etiquetas criadas no admin

*Plataforma (a classe gerada pelo código foi vista nas duas famílias):*

- A plataforma gera a classe a partir do **Código** da etiqueta (a coluna Código de Loja On-line › Tags,
  `mapa-do-admin.md`, seção 16), **mantendo acentos**: uma etiqueta de código `preço-especial`
  gera `tag-preço-especial`. No CSS, escape o caractere: `.tag-pre\0000e7o-especial` (6 dígitos dispensam o
  espaço depois do escape; `ajustes-visuais.md`, 2.2). Confira o nome real:
  `[...document.querySelectorAll('.tags .tag')].map(t => t.className)`.
- **A cor pode vir no atributo `style`.** Numa loja da família `modelo-1`, todas as etiquetas chegavam com
  `style="background-color:…;color:…"` posto pelo servidor, e aí só `!important` vence
  (`catalogo-modelo-1.md`, 5). Confira na sua: `document.querySelectorAll('.tags .tag[style]').length`.
- *Família `/dist`:* elas vêm **antes** do selo de desconto no mesmo canto: `order:2` põe a etiqueta embaixo
  do selo.
- **Redesenhar o texto da etiqueta** (uma palavra em negrito, por exemplo): CSS não pega uma palavra do texto.
  Esconda o original com `font-size:0` (ele continua no admin e para leitores de tela) e desenhe com
  `::before`/`::after`, com texto alternativo vazio para não ler duas vezes, e uma declaração de reserva para
  navegador antigo:

  ```css
  body.sua-classe .tags .tag.tag-minha-etiqueta{font-size:0 !important;line-height:0 !important;}
  body.sua-classe .tags .tag.tag-minha-etiqueta::before{content:"PRE\0000c7O\0000a0";content:"PRE\0000c7O\0000a0" / "";font-size:10.5px;}
  body.sua-classe .tags .tag.tag-minha-etiqueta::after{content:"ESPECIAL";content:"ESPECIAL" / "";font-size:10.5px;font-weight:700;}
  ```

  Se o nome da etiqueta mudar no admin, o CSS para de casar (e o texto desenhado também precisa mudar).
- O que a etiqueta promete ("preço garantido", "só hoje") é conteúdo: a regra tem de estar escrita no site
  e a etiqueta em todos os produtos que têm a condição (`criterios-de-design.md`, 3).
- **Regra de etiqueta que não casa com nada** (ou duas grafias da mesma etiqueta nos arquivos da loja e no
  SCSS de Personalização, com e sem acento). Abra Loja On-line › Tags (só leitura, `mapa-do-admin.md`, 16)
  e procure o código: etiqueta inativa, renomeada, ou uma grafia parecida. Medido numa loja (2026-10): o
  SCSS e um arquivo da loja estilizavam uma etiqueta antiga, inativa, e a etiqueta ativa, de nome parecido
  com acento, gerava outra classe. Não apague regra dos outros: conte à pessoa e anote no perfil ("Manias do
  tema desta loja").
- **A etiqueta não tem data** (o Ativo se liga e desliga à mão, `mapa-do-admin.md`, 16): uma regra presa à
  classe do tema e a uma etiqueta só age dentro da janela da agenda; antes e depois, a etiqueta ativa volta
  ao lugar e ao desenho do tema (`temas-sazonais.md`, 4).

## 6. `:has()`, container queries e navegadores antigos

É do navegador, não do tema: vale em qualquer família. Para posicionar algo em relação à foto quadrada do
card, a foto vira container (`container-type:inline-size`) e `100cqw` é a altura dela; `:has()` reserva
espaço só nos cards (ou listas) que têm a etiqueta. Medido na revisão: navegadores que entendem **só parte**
disso (iOS 15, Firefox < 121, Chrome < 105) deixavam a etiqueta torta. Ponha o conjunto inteiro dentro de um
`@supports` e deixe fora dele uma versão que funciona sozinha (os seletores abaixo são da família `/dist`):

```css
/* vale em todos: etiqueta sobre a foto */
body.sua-classe .tags .tag.tag-minha-etiqueta{…}
/* só onde tudo funciona: etiqueta abaixo da foto */
@supports (top:1cqw) and selector(:has(a)){
  body.sua-classe.page-product-list .product-list .product .picture{container-type:inline-size;}
  body.sua-classe.page-product-list .product-list .product .picture .tags .tag.tag-minha-etiqueta{position:absolute !important;top:calc(100cqw - 2px);}
  body.sua-classe.page-product-list .product-list:has(.tag-minha-etiqueta) .product .picture{margin-bottom:40px;}
}
```

A reserva de espaço para um elemento que um JS leva para outro lugar (o `:has()` preso a uma classe que o JS
põe no `<html>`, solta quando ele termina) segue a mesma regra do `@supports`: `ajustes-visuais.md`, 2.6,
item g.

## 7. Carrosséis (Owl Carousel)

*Plataforma (o `owlCarousel` vem do `platform.<hash>.js`, nas duas famílias medidas; confira):*
`.owl-carousel`, `.owl-loaded` (depois de montar), `.owl-stage`, `.owl-item` e `.owl-item.cloned` (cópias
para o giro infinito — **contam em dobro** quando você conta links ou produtos),
`.owl-nav button.owl-prev/.owl-next`, `.owl-dots-container .owl-dots .owl-dot span`. As medidas abaixo são
de uma loja da família `/dist`.

- Autoplay: medido 9 de 10 carrosséis girando (de 2 a 5 s) numa home de celular. A pausa "no hover" do Owl, no
  toque, pausa só enquanto o dedo está na tela. Desligar o autoplay é configuração do bloco no construtor,
  não CSS. Para medir, pare (`medir-no-navegador.md`, 10).
- **Carrossel montado antes da prévia.** O Owl mede as larguras quando monta; uma prévia que muda a largura
  do container depois disso corta o carrossel só na prévia. Gere o favorito com `--resize` (`previa.md`, "JS
  na prévia") e faça a contraprova no teste de "0 diferenças" (`medir-no-navegador.md`, 9).
- **Bolinhas do celular quase sem área de toque**: cada uma era um botão de 13x0px; só a barrinha de 9x4px
  recebia o toque. Área de 24x24 (o mínimo do WCAG 2.5.8) sem mudar o desenho:

  ```css
  body.sua-classe.isMobile #area-body .owl-dots-container .owl-dot{height:24px;padding:10px 4px !important;}
  body.sua-classe.isMobile #area-body .owl-dots-container .owl-dot span{width:16px;height:4px;margin:0;}
  ```

- **Vitrine que chega por XHR empurra a página.** Os produtos chegam depois e a faixa cresce (medido: de 194
  para 547px no computador, 353px de pulo; ~349px no celular). Reserve a altura **só enquanto o carrossel não
  montou**, com a altura medida da lista cheia:

  ```css
  body.sua-classe.page-home.notMobile #area-body .block-product-list .product-list.owl-carousel:not(.owl-loaded){min-height:373px;}
  ```

  Meça a altura real na sua loja, nas larguras da matriz: com cards de alturas diferentes (uma etiqueta a
  mais), a reserva muda.
- `mix-blend-mode` não funciona dentro do carrossel: o `transform` do Owl isola a mistura.

## 8. Reordenar seções por CSS

`display:flex` + `order` no `#area-body` muda a ordem visual sem mexer no construtor, e tem três armadilhas
medidas: as colunas `.col-sm` encolhem para 1px (use `flex:none` nos filhos); o `.container` do tema tem
largura fixa e, no flex, os blocos esticaram até 2.575px no celular (use `width:min(100%, LARGURA)`); e as
margens deixam de colapsar. Pior: **a ordem do teclado e do leitor de tela continua a do HTML**. Um JS que
move o nó (`ajustes-visuais.md`, 2.6, item f) faz o contrário: a ordem de leitura segue o lugar novo, mas
quem não roda JS (o robô de busca na primeira passada, uma falha do JS) vê o lugar antigo. Serve para
um teste A/B curto (com a classe no `<html>` antes da pintura, `ajustes-visuais.md`, 2.6); se a variante
ganhar, mova o bloco no construtor e apague o CSS. Antes, confira se o rodapé não está dentro de
`#area-body` (`!!document.querySelector('#area-body > footer')`): numa home da família `modelo-1` estava, e
o flex mexeria nele também.

## 9. Barra promocional e barra do topo

- **`.promotionBar`** vem do item da agenda de skins (`promotionBar` no JSON da agenda). *Família `/dist`
  (medido numa loja):* no computador logo abaixo do menu, no celular logo abaixo do cabeçalho. O texto vem do
  servidor (é o que quem não roda JavaScript lê, o Google inclusive); o link padrão vem do tema e não muda
  pela agenda; o script inline que o servidor manda com a barra chama `countdown(...)`, que nessa família vem
  do `bundle.<hash>.js` do tema. Na loja medida, quem a escondia (`opacity:0`) era o CSS do tema antigo da
  loja, e quem a mostrava era um `setTimeout` num JS da loja (`temas-sazonais.md`, 5). Sem esses arquivos,
  isso não foi medido: no primeiro dia do item, confira no ar se ela aparece. **Noutra família ela pode nem
  funcionar**: na `modelo-1` medida, nenhum CSS estiliza a barra e nenhum JS do tema define `countdown`
  (`catalogo-modelo-1.md`, 9). Veja no perfil se a barra da agenda funciona na família da loja antes de
  oferecê-la.
- **Antes de concluir que a barra não existe**, procure `promotionBar` nos arquivos JS da loja: na loja medida
  um deles apagava a barra (`$(".promotionBar").remove()`) e outro trocava o link dela.
- **Barra do topo** (Configurações › Visual › Cabeçalho, `headerTopBarShow` / `textoHeaderTopbar`): HTML
  livre. *Família `/dist`:* renderizada como `.inner-body > .header-top-bar`, antes do `<header>`, e
  **estática**: rola junto e some (simulado). Prender exige CSS. Na família `modelo-1`, no computador, ela fica
  dentro do `.header-container` (`catalogo-modelo-1.md`, 9).
- Qual barra para qual pedido ("uma barra no topo com contagem até tal dia"): `temas-sazonais.md`, seção 7.
- Para uma barra que aparece por JavaScript não empurrar a página, reserve a altura antes da pintura com a
  classe no `<html>` (`ajustes-visuais.md`, 2.6). Medido: com a reserva, 0 de deslocamento mesmo com a página
  chegando devagar. Quando a barra depende da classe que a agenda põe no `<body>` (essa classe já vem no HTML
  do servidor), a vaga pode ser reservada por CSS estático preso a ela, com o JS `defer`
  (`temas-sazonais.md`, 6), desde que a vaga sem o JS não faça estrago; se ela ficaria vazia, o aperto de mão
  nos dois sentidos, e o JS sem `defer` (`ajustes-visuais.md`, 2.6, itens g e h).
- Relógio: `font-variant-numeric:tabular-nums`, senão ele muda de largura a cada segundo (medido: até 7px). O
  cronômetro de ofertas do tema tem largura fixa (135px) menor que o texto "23h29m39s" (~160px): o "s" vazava
  24px. `width:auto;white-space:nowrap`.
- Barra com link para fora não deve aparecer no carrinho nem no checkout: tira a pessoa da compra. Onde o
  carrinho é do tema twig, exclua pelas classes `page-cart` e `page-checkout` (medido numa loja da família
  `/dist`). Onde ele é outro sistema (Next.js: `<body>` sem classe e sem os `<link>` do Código dentro do
  `<head>`, medido noutra loja em `/finalizar-compra/…`), a barra nem chega lá (`mapa-do-admin.md`, 15);
  mantenha a exclusão por classe assim mesmo, inofensiva, para o dia em que o carrinho for twig.

## 10. Avisos de cookies e do app

*Plataforma (os estilos vêm do `platform.<hash>.css`, nas duas famílias medidas; confira):* `#lgpd-message`
(botão `#lgpd-accept`, link `#lgpd-accept-link`) e, no celular, `#app-message` (`.app-message-actions`,
`#app-reject`, `#app-accept`).

- Só aparecem na **primeira visita**: teste em aba anônima.
- Abrem e fecham por `transform` (`translateY`) e classes do tema. Não use `display` para escondê-los nem
  mexa no `transform`: o fechamento para de funcionar.
- No celular os dois apareciam empilhados (cookies 355x140 por cima do app 375x146), 18,5% da tela, em cima do
  título da primeira vitrine (medido numa loja da família `/dist`).
- O botão flutuante do WhatsApp (53x53, fixo no canto, `z-index` 10000 na loja medida) cobria o "aceito" em
  1280px e a borda da caixa em 1366px. Afastar a caixa das laterais (`left:90px;right:90px`) resolveu;
  confirme com `livre(botao)` (`medir-no-navegador.md`, 7) nas três larguras.
- O tema apaga o contorno de foco dos botões: devolva com `:focus-visible` (`criterios-de-design.md`, 2).
- Ficam fora de `#area-body`: uma cor de texto posta só no miolo não chega a eles (seção 14).

## 11. Banner principal, logo e imagens de marca

*Família `/dist` (medido numa loja, confira):*

- **Setas do banner principal (computador):** `.owl-nav button` dentro do bloco do banner. Na loja medida o
  bloco tinha a classe `.banner-principal` (posta no bloco; ela apareceu também numa loja da família
  `modelo-1`) e `.with-nav-inside`; confira a classe do seu bloco. Medidas 35x50 com 30% de opacidade por cima
  da arte; 44x44, aparecendo com o mouse ou o foco, ficou melhor. Em aparelho sem mouse (iPad, que recebe o
  site de computador), deixe sempre visíveis.
- **As imagens dos banners** vêm do cadastro de banners (`imagens-e-banners.md`): trocar a arte é conteúdo, e
  é da pessoa; o caminho, o tamanho e o cache estão lá. Por CSS, mexa só no que está em volta (setas, bolinhas,
  espaço).
- **Logo**: SVG inline (Configurações › Visual › Logo e Ícone, `svgLogo`). Na loja medida, os caminhos tinham
  classes `.st0`/`.st1` e **nenhum `<g>`**: o tema do ano anterior mirava `.logo g path` e não pegava nada.
  Noutra loja, o SVG trazia um `<style>` próprio com classe genérica, que vale para o documento inteiro
  (`mapa-do-admin.md`, 8). Inspecione o SVG da sua; se o logo for trocado, revise.
- Logos de marca clareados por filtro (`grayscale` + `brightness(0)` + `invert`) funcionam em PNG com fundo
  transparente; um PNG com fundo opaco vira um bloco cinza. Filtro próprio para aquela imagem, ancorado no
  endereço dela (`ajustes-visuais.md`, 2.4). Isso vale para logo com fundo transparente, **não para arte**:
  um banner ou um bloco de categoria com fundo claro desenhado na imagem não escurece por CSS, e um filtro
  estraga a cor do produto e da marca. Trocar a arte é da pessoa (`temas-sazonais.md`, 12).

## 12. Tipografia do tema

- *Plataforma:* o `platform.<hash>.css` dá ao `body` `font-size:12px`, `line-height:1.5`, `color:#292b2c` e
  `background-color:#fff`, com uma pilha de fontes do sistema; o tema da família troca a fonte por uma
  variável no `html` (`--font-family`). Confira o `body` da sua loja antes de supor um tamanho.
- Há regras **relativas** no tema e na loja (ex.: `p{font-size:1.4em}`): definir o tamanho num ancestral
  multiplica em vez de corrigir. Ponha o tamanho no próprio elemento.
- `<li>` e `<td>` sem regra herdam o `body`.
- Fontes da loja: `[...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status)`. Use as mesmas
  (a loja medida usava duas famílias, uma para texto e outra para etiquetas).
- Fonte de título nova, ou num tamanho novo: confira os acentos das maiúsculas em px reais (seção 14).

## 13. Página do produto (medida em parte: família `/dist`, numa loja, 2026-10; confira)

É onde cai o pedido mais comum ("quero o botão de comprar verde", "o selo junto do preço"), então comece por
perguntar, e depois meça. Parte da página foi medida nesta família; a da `modelo-1` está no
`catalogo-modelo-1.md`, 13.

*Família `/dist` (medido numa loja, 2026-10, HTML de computador e de celular; confira):*

| Parte | Seletor | Observação |
|---|---|---|
| foto principal | `#big-photo` | no computador, um bloco simples; no celular, uma galeria Owl dentro dele, com as etiquetas do admin só no primeiro `.item` de verdade (ignore os `.cloned`, seção 7) |
| etiquetas da foto | `#big-photo .tags > .tag` (canto `.tags.tags-top-right`) | `position:absolute` no canto da foto; as etiquetas do admin vêm antes do selo de % (seção 5) |
| título | `.product-summary > h1` | no computador, dentro de `.product-header-area .product-summary`; no celular há **dois** `.product-summary`, e o do título (`.without-box`) fica **acima** das fotos |
| caixa do preço principal | `.product-header-area .product-summary > .prices` | uma por página, nos dois aparelhos; `.prices` sozinho casou com dezenas de elementos (os cards das recomendações) |
| recomendações | o card da seção 3 | uma mudança no card muda as recomendações também |

O botão Comprar, a quantidade e o frete não foram medidos nesta família.

**A página se refaz?** *Família `/dist`, numa loja (2026-10):* o JS da troca de variação (lido no código da
página) tem um caminho por AJAX que refaz o `#area-summary` quando o `isGroupImage` do produto é verdadeiro.
Com ele falso, a troca de cor levou a outra URL (medido), e aquela página do produto nem tinha
`#area-summary`. Confira os dois na sua loja antes de mover qualquer coisa por JS (`ajustes-visuais.md`, 2.6,
item f, "A página que se refaz depois da carga").

**Pergunte à pessoa, com perguntas fechadas:**

- **Qual "Comprar"?** O botão da página do produto, o de compra rápida no card das listas (seção 3), o
  "Finalizar" do carrinho, ou todos? Cada um é um elemento diferente, e às vezes um tem classe que o outro
  não tem.
- **Qual preço?** O à vista (no Pix ou no boleto), o parcelado, o "de" riscado? Na página do produto eles
  costumam ser elementos separados, e a configuração da loja decide o principal e o secundário
  (`productPageMainPrice` e `productPageSecondaryPrice`, `mapa-do-admin.md`, 1; medido numa loja: principal =
  Tabela Preço, secundário = Pix, e o primeiro preço mostrado era o do Pix). "Junto do preço" tem de dizer
  qual.
- **Só no computador, só no celular, ou nos dois?** No celular pode haver uma barra de compra fixa no rodapé
  da tela, que é outro elemento. E levar algo para junto do preço, no celular, pode tirá-lo da primeira tela
  (`criterios-de-design.md`, 3).
- **E no hover e no foco?** Botão verde com hover vermelho do tema é o defeito mais provável.

As perguntas podem virar opções rotuladas na prévia, em vez de perguntas antes, só quando cada opção
responde a uma pergunta de forma explícita ("A: acima do preço à vista; B: acima do nome"), com um conjunto
de prints por opção, e a pessoa escolhe. Senão, pergunte antes.

**Meça, nos dois aparelhos (HTML de celular de verdade, `ajustes-visuais.md`, 4.2):**

1. `acharPorTexto('Comprar')` (`medir-no-navegador.md`, 4) devolve tag, id, classes e três ancestrais de cada
   elemento visível com esse texto. Escolha o seletor mais estável (classe do tema, não classe com hash,
   não `#block-…`) e confira que ele casa com **um** elemento por página
   (`document.querySelectorAll(SELETOR).length`), em dois ou três produtos diferentes: com e sem o alvo (a
   etiqueta, por exemplo), com e sem variação, e sem estoque.
2. `quemPinta(SELETOR, 'background-color')` e `quemPinta(SELETOR, 'color')` mostram se o tema usa
   `!important` ou uma variável da loja. Se for uma variável (`--primary-color`, por exemplo), a cor pode ser
   uma opção nativa da configuração (`ajustes-visuais.md`, 2.1), e mudá-la mudaria o site inteiro: pergunte
   antes.
3. Repita para `:hover`, `:focus-visible` e `:disabled` (botão de produto sem estoque). Confira também se o
   botão recebe foco pelo Tab: numa loja da família `modelo-1`, o Comprar era um `<a>` sem `href` e não
   recebia (`catalogo-modelo-1.md`, 13).
4. Contraste do texto sobre a cor nova (`medir-no-navegador.md`, 8): branco sobre verde claro costuma
   reprovar.
5. Com a mudança ligada, troque a variação (cor, tamanho) e a quantidade, e veja se o tema refaz o bloco ou
   vai para outra URL (`vigiarTroca`, `ajustes-visuais.md`, 2.6, item f). O frete pede um CEP, que você não
   digita: peça à pessoa, ou diga "frete não testado".
6. Os vizinhos que andaram: a quantidade, o frete e o botão Comprar, com
   `Math.round(el.getBoundingClientRect().top)` antes e depois, em px, e diga à pessoa (medido numa loja:
   tudo abaixo do preço desceu 33px com uma etiqueta posta acima dele).

Escopo do seletor: `body.page-product` mais aparelho e região. Anote no perfil, em "Medidas do tema desta
loja", os seletores que você mediu.

## 14. Armadilhas de CSS que valem em qualquer família

São do CSS e do navegador, não de um tema: valem nas duas famílias e no front-end novo.

- **Degradê com borda transparente.** `background` em atalho com `linear-gradient`, num elemento com
  `border` transparente, repete o degradê embaixo da borda (o fundo se posiciona dentro do padding e se pinta
  até a borda) e desenha uma linha de 1 a 2px com a outra ponta do degradê (medido numa loja, 2026-10).
  Ponha `background-repeat:no-repeat` (ou `background-origin:border-box`) junto do degradê:

  ```css
  body.sua-classe .minha-faixa{border:2px solid transparent;background:linear-gradient(90deg,#RRGGBB,#RRGGBB) no-repeat;}
  ```

- **Camada padrão sem peso.** Num tema que muda cores do site inteiro (fundo escuro), as regras gerais de
  links, botões, campos e tabelas vão dentro de `:where()`, que tem especificidade zero: as regras
  específicas do tema e da loja continuam vencendo onde já pintavam. Roteiro em `temas-sazonais.md`, 12.
- **Cor herdada some na caixa branca.** Caixas do tema com fundo branco e sem cor de texto própria herdam a
  cor do ancestral: com o texto do site claro, o texto delas some. Medidas: os balões de validação
  `.validatorLog` (criados pelo `platform.<hash>.js`; o CSS do tema das duas famílias dá `background:#fff` e
  nenhuma `color`) e a lista de sugestões da busca (`.autocomplete-suggestions`). Ponha a cor do texto no
  miolo (`#area-body`), não no `body`, confira as caixas uma a uma e rode a varredura de contraste
  (`medir-no-navegador.md`, 12) com formulários enviados com erro, menus e gavetas abertos.
- **`:root` pesa mais que `html`.** Os dois são o mesmo elemento, mas `:root` é uma pseudo-classe (0,1,0) e
  `html` uma tag (0,0,1): uma variável declarada em `:root` vence a mesma variável em `html` em qualquer
  ordem.
- **Variável declarada mais perto vence.** Uma variável vale no elemento onde foi declarada e nos filhos;
  se o tema a declara num ancestral mais próximo (num estado do cabeçalho, por exemplo), a sua no `:root`
  não chega. Declare no mesmo elemento, com especificidade igual ou maior (`catalogo-modelo-1.md`, 12).
- **Fonte de título e acento em tamanho real pequeno.** Uma fonte de título pode desenhar mal os acentos das
  maiúsculas em tamanho pequeno. Medido numa loja da família `modelo-1` (2026-10, Chrome no Windows, Tenor
  Sans 400 do Google Fonts): abaixo de ~50px **reais**, o til e o agudo das maiúsculas saíam como circunflexo
  e grave ("RECOMENDAÇÕES", "BALCÕES"). O tamanho do CSS não basta: px reais = px CSS × `devicePixelRatio`,
  e o zoom do navegador e a escala da tela mudam o `devicePixelRatio` (um título de 53px com o zoom em 90%
  tem ~48px reais; um piso de 50px no CSS não segurou). A correção usada foi o peso 600 nos títulos que
  podem ter acento: a fonte só tem o 400, e o negrito sintético que o navegador desenha não tinha o defeito;
  os textos sem acento (rótulos, o nome da campanha) ficaram no 400. Outra saída, usada na mesma loja nos
  títulos pequenos (as abas da página do produto): a fonte de texto da loja no lugar da de título. Com uma
  fonte de título nova, ou num tamanho novo, confira palavras acentuadas em caixa alta (Ã, Õ, Ç, É, Ê) na
  configuração real de quem aprova (`medir-no-navegador.md`, 13), com o zoom da ferramenta no print. Num
  print seu com `devicePixelRatio` 1, o título sai no tamanho do CSS e o defeito pode não aparecer: na loja
  medida, só o print na configuração da pessoa mostrou. No celular (`devicePixelRatio` de 2 a 3), os px
  reais são maiores; não medido.
- **Texto decorativo em `::before`/`::after`.** O leitor de tela lê o `content`: um nome de campanha
  desenhado acima de cada vitrine seria lido antes de cada título. Para ele pular, declare duas vezes, a
  segunda com texto alternativo vazio:

  ```css
  body.sua-classe .minha-vitrine .titulo::before{content:"TEXTO";content:"TEXTO" / "";}
  ```

  O navegador que não entende a segunda forma fica com a primeira (e lê o texto). Acento no `content`:
  escape de 6 dígitos (`ajustes-visuais.md`, 2.2). Repetir o texto em toda vitrine é decisão da pessoa
  (`criterios-de-design.md`, 3).
