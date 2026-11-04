# Ajustes visuais numa loja da plataforma Panorama

Guia para mudar a aparência do site de uma loja que roda na Panorama Sistemas — cor, tamanho, espaço,
posição, um componente do tema — sem mexer no que é dos outros e com volta garantida. Vale para qualquer
época do ano. Tema sazonal (Black Friday, Natal, Esquenta) é um caso particular: seção 2.5 e
`references/temas-sazonais.md`; as telas do admin estão em `references/mapa-do-admin.md`.

Tudo aqui foi aprendido fazendo, numa loja real da plataforma da família de tema `/dist`, em outubro de
2026 (um tema escuro de Black Friday inteiro e, depois, selo de desconto, menu, cards de produto, avisos de
cookies e cabeçalho do celular), e conferido noutra loja, da família `modelo-1`, no mesmo mês. Onde as duas
diferem, o texto diz qual é qual. Os números citados são medições dessas lojas. Servem de ordem de grandeza e
de prova de que o mecanismo existe; na sua loja, meça de novo antes de usar qualquer um deles.

**Família do tema** é o conjunto de arquivos de tema que a plataforma serve à loja, reconhecido pelos
endereços dos `<link>` e `<script src>` do HTML servido (`reconhecimento-da-loja.md`, 2i; o perfil diz qual
é). Ela muda a ordem da cascata, os seletores e o que a agenda de skins faz. Um fato marcado "família
`/dist`" ou "família `modelo-1`" foi medido numa loja dessa família; "plataforma" vale nas duas.

Quando ler: sempre que o pedido for "mudar a cara" de alguma coisa no site e não for montar uma página no
construtor (para isso, `references/construtor.md` e `references/blocos.md`). Se o pedido é mudar a linguagem
visual inteira ("estilizar o layout", "algo mais agressivo"), comece pela proposta de estilo
(`criterios-de-design.md`, 4) e volte aqui com a direção escolhida. Este arquivo é o roteiro. Ao lado dele:

| Arquivo | Quando abrir |
|---|---|
| `catalogo-tema-base.md` | para escrever o seletor na família `/dist`: cabeçalho, menu, card, listas, etiquetas, carrosséis, barras, avisos, logo, tipografia e página do produto, com as armadilhas vistas; no topo, a tabela "Qual catálogo" para as outras famílias; na seção 14, as armadilhas de CSS que valem em qualquer família |
| `catalogo-modelo-1.md` | o mesmo, para a família `modelo-N` (medido no `modelo-1`), com os mesmos números de seção |
| `medir-no-navegador.md` | os trechos de JavaScript para medir: ordem das folhas (com o veredito do SCSS), quem pinta, bissecção, achar pelo texto, variáveis CSS, rolagem lateral (com a linha de base sem a prévia, e se o número veio de janela ou de `<iframe>`), área de clique, contraste, comparar estados elemento a elemento e a contraprova, varredura de contraste, como a pessoa vê (largura, zoom, `devicePixelRatio`), o card que chega depois (o preço pula?) e o deslocamento na carga (CLS) |
| `criterios-de-design.md` | o tom da marca, acessibilidade, o que não é seu para decidir e a proposta de estilo (2 ou 3 direções, régua, síntese; a pessoa escolhe) |
| `ferramentas-de-navegador.md` | quando uma medição correta parecer falha (aba estreita, zoom, filtro de saída) |

## Sumário

0. Antes de começar
1. De onde vem um estilo
2. Onde pôr a mudança, e por quê
3. Prévia sem gravar nada
4. Testar e medir
5. Pôr no ar
6. Desfazer
7. Lista de conferência final

Nesta skill, **pôr no ar** é o processo inteiro (gravar, número novo no `<head>`, caches, conferir).
**`Publicar`** é só o botão da tela Páginas, que não se aperta sem pedido explícito da pessoa.

---

## 0. Antes de começar

**A regra zero do `SKILL.md` vale aqui inteira, e pesa mais.** Uma página do construtor afeta uma URL; um
arquivo CSS ligado no `<head>` afeta **todas as páginas, nos dois aparelhos, em minutos**. Um `Confirmar`
errado aqui não quebra uma página, quebra a loja. Por isso: só grave o que a pessoa pediu, com backup do
valor anterior, e nunca `Excluir`, `Publicar` ou `Despublicar` sem pedido explícito e específico.

**Leia o perfil da loja** em `~/.claude/panorama-lojas/<slug-da-loja>.md`. É de lá que saem o domínio, o
número da loja, a família do tema e a ordem da cascata (o catálogo e a posição da prévia dependem delas), os
endereços que são outro sistema, o `#` e a URL do arquivo de ajustes, a linha dele no `<head>`, o número
atual do `?v=`, o cache medido dos Arquivos, a classe de controle, a home no ar, quem limpa cada cache e as
pastas de trabalho e de backups. Se não houver perfil, faça a configuração inicial de
`references/primeiro-uso.md`, que termina no reconhecimento (`references/reconhecimento-da-loja.md`; molde em
`assets/perfil-da-loja.md`), antes de qualquer outra coisa.
Nunca reaproveite número de página, nome de arquivo ou classe de outra loja: cada cliente cria os seus.

Nos exemplos deste guia:

| Nos exemplos | Na sua loja (vem do perfil) |
|---|---|
| `https://www.SUA-LOJA.com.br` | domínio público |
| `admin.SUA-LOJA.com.br` | endereço do admin |
| `loja N` | número da loja no sistema Único |
| `#NNNNNN` | `#` da página tipo Arquivo que guarda o seu CSS |
| `/seu-tema.css` | URL dessa página (é o que vai no `<link>`) |
| `seu-tema-v4.css` | cópia local, versionada, do que está ou vai para o ar (na pasta `trabalho/` do perfil) |
| `sua-classe` | classe do `<body>` que liga os seus ajustes de época |
| `#RRGGBB` | uma cor medida na sua loja com `getComputedStyle` |

### Dois modos: ajuste permanente e ajuste de época

Decida no começo, porque muda o seletor, o interruptor e o teste:

| | Ajuste permanente (o botão, o menu, o card de sempre) | Ajuste de época (Natal, Black, Dia das Mães) |
|---|---|---|
| Classe própria no `<body>` | **não**: o seletor diz aparelho, tipo de página e região (`body.isMobile.page-product #area-body …`) | **sim**: toda regra começa por `body.sua-classe` |
| O que liga e desliga | a linha do arquivo no `<head>` | a agenda de skins, que põe e tira a classe por data |
| Antes de ligar, quem vê | só quem usa a prévia (favorito) | a prévia, ou a classe numa página de teste (se a classe já está no ar, todo visitante, assim que o arquivo é gravado: trate como permanente, `temas-sazonais.md`, 3) |
| `--classe` no `scripts/montar_tema.py` (5.2) | sem | `--classe sua-classe` |

A agenda de skins nunca serve para ajuste permanente: um item "eterno" na agenda se sobreporia ao item do
Natal ou da Black, e qual dos dois vence quando as janelas se sobrepõem não foi medido
(`temas-sazonais.md`, seção 2). Também não invente uma classe para um ajuste permanente: sem a agenda, nada
a poria no `<body>` do site inteiro. Nos exemplos deste guia e do catálogo, `body.sua-classe` é o modo de
época; no permanente, tire o `.sua-classe` e deixe o resto (`body.notMobile.page-product-list …`).

### Combine três coisas com a pessoa antes de escrever CSS

As três travam a entrega no fim:

1. **O que muda, em quais páginas e em qual aparelho.** "O selo de desconto vermelho" não diz se é só na home
   ou também nas listas e na página do produto. Pergunte, ou mostre a prévia nas duas e deixe escolher.
2. **Onde a mudança vai morar** (seção 2): o arquivo de ajustes que a loja já tem, ou um novo. **Se a loja
   ainda não tem um arquivo seu**, combine agora a criação dele (quem clica `Incluir`, `Confirmar` e
   `Publicar`: a pessoa, ou você, se ela pedir nomeando os botões e a página) e a linha nova no `<head>`:
   seção 5.6. Sem isso, o ajuste não vai ao ar.
3. **Se pode gravar, e quem limpa os caches.** Prévia não precisa de permissão nenhuma: não grava nada.
   Gravar e limpar o cache de configuração da loja precisam de "sim" explícito.

### O roteiro, numa tela

1. Ache de onde vem o estilo que você quer mudar (seção 1).
2. Decida onde a mudança mora, em qual modo, e o que a liga e desliga (seção 2).
3. Escreva a regra já escopada por aparelho, tipo de página e região, e pela classe no modo de época
   (seção 2.3).
4. Mostre a prévia, sem gravar, no navegador da pessoa (seção 3). Ela aprova olhando.
5. Teste e meça nas páginas e larguras que importam (seção 4); no modo de época, com e sem a classe.
6. Ponha no ar com backup, número novo no `<head>` e as camadas de cache (seção 5; a do CDN, só onde houver).
7. Confira na origem, computador e celular (seção 5.5), e de novo no navegador.
8. Deixe escrito como desfazer, antes de precisar, no histórico do perfil (seção 6).

---

## 1. De onde vem um estilo

### 1.1 As camadas, e a ordem em que elas se aplicam

A ordem decide quem vence quando duas regras têm a mesma especificidade: **a que vem depois ganha**. As
camadas foram as mesmas nas duas famílias twig medidas; a **ordem** entre elas, não (quadro abaixo da
tabela). Noutra família, confira as duas coisas (`medir-no-navegador.md`, 1).

| Camada | Onde se edita | Como aparece no HTML | O que saber |
|---|---|---|---|
| **Plataforma e tema** | não se edita | `<link>` para `https://panoverse-cdn.com.br/css/platform.<hash>.css` (plataforma, nas duas famílias medidas) e para o CSS do tema da família: `https://<site>/dist/css/loja.<hash>.css` (família `/dist`) ou `https://panoverse-cdn.com.br/css/modelo-N.<hash>.css` (família `modelo-N`) | O hash muda a cada versão do tema (cache de 1 ano medido na família `/dist`). Grandes: `platform` ~366 KB, `loja` ~458 KB (com ~93% das regras sem uso na home), `modelo-1` ~514 KB, sem compressão. O `loja.css` medido trazia as cores e fontes da loja e `!important` em regras de componente (o selo de desconto, `catalogo-tema-base.md`, 3); o `modelo-1.css` traz valores padrão, e as cores da loja chegam pelas variáveis do SCSS de Personalização (`catalogo-modelo-1.md`, 12). |
| **CSS da página** | construtor › Estilo CSS/SCSS (campo `style`) | um `<style id="builder-custom-css">` no `<head>` (o id medido nas duas famílias; confira) | Só existe naquela página. ~13,6 KB numa home medida, ~11 KB noutra. No renderizador novo ele entra cru: SCSS não é compilado (`armadilhas.md` 29; e 2.2). |
| **Arquivos do `<head>`** (páginas tipo Arquivo) | Loja On-line › Páginas › Tipo **Arquivo**; ligados em Único › Lojas › Configurações › Integrações › Custom › **Código dentro do `<head>`** (`customCodeOnHead`) | `<link rel="stylesheet" href="/arquivo.css?v=N">` (caminho relativo), na ordem em que estão escritos | Servidos **crus** (SCSS não é compilado), com o cache medido na sua loja (perfil; medidos `max-age` de 24 h numa loja e de 30 min noutra). Entre eles, o de baixo vence no empate. |
| **SCSS de Personalização** | Configurações › Visual › Modelo e Skin | um `<style>` grande, sem id, no `<head>` | Compilado pela plataforma. Medidos ~104 KB no admin e ~74 KB servidos numa loja; ~34 KB e ~24 KB noutra. A posição dele muda com a família (quadro abaixo). |
| **Estilo por bloco** | a configuração de cada bloco no construtor | um `<style>` por bloco dentro do `<body>` (74 numa home medida, 14 KB), com seletor `#block-xxxxxxxx` | O id dá especificidade alta: para vencer, mire o mesmo id ou use `!important`. |
| **`style=""` no elemento** | scripts do tema e da loja; às vezes o próprio servidor | atributo `style` no próprio elemento | Vence qualquer regra sem `!important`. Exemplos vistos: o carrossel calculando larguras, o fade-in que põe `opacity:1`, as listas que congelam a altura dos cards (família `/dist`, `catalogo-tema-base.md`, 4) e, vindo do servidor, a cor das etiquetas criadas no admin (família `modelo-1`, `catalogo-modelo-1.md`, 5). |

> **A ordem depende da família do tema.** As duas medidas, do mais fraco ao mais forte (2026-10, uma loja
> de cada):
>
> - **família `/dist`**: `platform` < `loja.<hash>.css` < CSS da página (`#builder-custom-css`) < links do
>   Código dentro do `<head>` < **SCSS de Personalização** < estilos por bloco. O SCSS vence os arquivos da
>   loja no empate: quando a medição mostrar que é ele quem pinta, suba a especificidade da sua regra.
> - **família `modelo-1`**: `platform` < `modelo-1.<hash>.css` < **SCSS de Personalização** < Google Fonts <
>   CSS da página < links do Código dentro do `<head>`, os últimos do `<head>` < estilos por bloco. Os arquivos
>   da loja vencem o SCSS e o CSS da página no empate: **não** suba especificidade nem ponha `!important` "para
>   vencer o SCSS", seria à toa.
>
> Liste a ordem da sua loja antes de decidir (`medir-no-navegador.md`, 1, que diz "SCSS antes" ou "SCSS
> depois dos links da loja") e anote no perfil. Noutra família, a ordem pode ser uma terceira.

Numa loja da família `/dist` eram **18 folhas externas**, todas bloqueando a renderização, mais ~88 KB de
`<style>` no `<head>`; numa da `modelo-1`, 6 folhas externas e ~35 KB de `<style>`.

Antes de tudo isso, há uma camada que não é CSS seu: **as opções da tela de configuração** (Visual ›
Página do Produto, Lista de Produtos, Cabeçalho, Modelo e Skin…) e as **variáveis CSS da loja** (como uma
`--primary-color`). Numa loja medida, a cor do link não vinha de nenhuma regra `a{color:…}` achada nos
arquivos, e sim de uma variável da loja. Veja 2.1.

### 1.2 Especificidade e `!important`, o mínimo para decidir

- Conta-se assim: ids > classes, atributos e pseudo-classes > tags. `body.sua-classe.page-home .x` (3 classes
  + 1 tag) vence `.x` (1 classe) em qualquer ordem. Empate: vence a que vem depois (1.1).
- `!important` inverte o jogo: uma declaração com `!important` vence qualquer uma sem, de qualquer camada,
  inclusive o `style=""` do JavaScript. Entre duas com `!important`, volta a valer especificidade e ordem.
- Consequência prática, medida na família `/dist`: o selo de desconto do tema tem `background` e `color` com
  `!important` no `loja.css`. Uma regra sua sem `!important` **não pega**, por mais específica que seja. Com
  `!important` e um seletor mais específico (`body.sua-classe .tags .tag.tag-percentual-desconto`), pega.
- Na família `modelo-1` o selo do tema não tem `!important`, mas as etiquetas criadas no admin chegam com a
  cor no atributo `style=""` posto pelo servidor: o atributo vence qualquer regra sem `!important`, então ali
  também só `!important` pega (`catalogo-modelo-1.md`, 5). Meça antes (`quemPinta` mostra `inline`).
- Temas antigos com `!important` largo (ex.: `#area-body strong{color:… !important}`) obrigam as suas
  correções a usar `!important` também. Use só onde a medição mostrou que precisa, e diga no comentário por quê.
- Para **restringir sem aumentar** a especificidade — ao copiar regras de outro arquivo e querer que elas se
  comportem igual —, envolva o filtro em `:where()`: `:where(.page-home) .x` pesa o mesmo que `.x`.

### 1.3 Meça em vez de deduzir

Os trechos estão em `medir-no-navegador.md`. Os que respondem "de onde vem":

- **a ordem real das folhas** (seção 1, `folhasEmOrdem`): devolve cada `<link>` e `<style>` na ordem em que
  o navegador aplica, com o número de regras, e o veredito "SCSS antes" ou "depois dos links da loja";
- **`quemPinta(seletor, propriedade)`** (seção 2): todas as regras que declaram aquela propriedade para o
  elemento, com `!important` e condição de `@media`;
- **`bissecta(seletor, propriedade)`** (seção 3): desliga uma folha por vez, só na sua aba, até o valor
  mudar. É o jeito mais seguro, porque pergunta ao navegador em vez de deduzir;
- **`acharPorTexto('Comprar')`** (seção 4): quando a pessoa fala do texto que vê ("o botão Comprar") e você
  ainda não sabe o seletor;
- **as variáveis CSS da loja** (seção 5).

Caso real que só a bissecção resolveu (família `/dist`, numa loja): no celular, uma faixa clara de 10px
aparecia acima do cabeçalho escuro. Nenhum arquivo do tema sazonal pintava aquilo. A bissecção apontou o
`<style>` do SCSS de Personalização: `.header-top{margin-top:10px}`. Como o `<header>`, o `.inner-body` e o
`body` não tinham padding nem borda, a margem do primeiro filho **vazava** para fora do cabeçalho e empurrava
a página inteira (colapso de margens). Correção em `catalogo-tema-base.md`, 1.

### 1.4 O computado é a fonte da verdade

- **Para cor, achar a regra no arquivo não basta.** Medido: dois arquivos declaravam `a{color:#e23b40}` e o
  computado era outro, vindo de uma variável CSS da loja. Leia `getComputedStyle(el).color`.
- **Uma leitura só pode pegar um instante ruim.** `opacity:0` no CSS mais um script que põe `opacity:1`
  depois do carrossel montar é um fade-in: ler cedo dá "invisível". Setas de carrossel e cards de vitrine só
  existem depois do XHR dos produtos (e às vezes do scroll); medir antes dá 0x0.
- **Vitrines chegam depois** (plataforma, nas duas famílias medidas). O servidor manda a vitrine com
  `div.item.item-placeholder` vazias (7 numa loja da família `/dist`, com 20px no computador e 16px no
  celular; 6 por vitrine no computador e 3 no celular numa da `modelo-1`) e os produtos vêm por XHR quando o
  JavaScript da plataforma termina. Espere `.owl-loaded` no carrossel ou os `.product` aparecerem antes de
  medir altura.

---

## 2. Onde pôr a mudança, e por quê

### 2.1 Decisão rápida

| A mudança é... | Ponha em | Por quê |
|---|---|---|
| algo que a tela de configuração já oferece (uma cor da marca, uma opção em Visual › Página do Produto, Lista de Produtos, Cabeçalho) | **a opção nativa** | Quem vier depois acha no lugar óbvio, e o tema aplica a opção em todo lugar que a usa. Antes de escrever CSS, leia as subabas Visual (só ler, saída por Cancelar; o snippet G de `reconhecimento-da-loja.md` lista os campos) e as variáveis CSS da loja (`medir-no-navegador.md`, 5). Gravar a opção é configuração da loja: se a chave dela não estiver entre as mapeadas (`gravacao-arquivo-e-head.md`), quem grava é a pessoa, à mão, e você confere. |
| visual do site inteiro, ou de um tipo de página (todas as listas, todas as páginas de produto, o cabeçalho) | **um arquivo CSS seu, tipo Arquivo, ligado no `<head>`** | Uma linha liga e desliga, tem número de versão, não mexe no arquivo de ninguém e você guarda cópia de cada versão. |
| de uma página só, montada no construtor | **CSS da página**, escopado no miolo e na `body_class` dela | Morre com a página; não pesa nas outras. Cuidado: vaza para o cabeçalho se não escopar (regra 4 do `construtor.md`). |
| algo que um controle do bloco já faz (espaço, fundo, alinhamento, visibilidade por aparelho) | **configuração do bloco** no construtor | Quem editar depois vê no painel; CSS escondido não aparece para ninguém. |
| tema de uma época (Black, Natal) | **arquivo próprio + classe própria**, ligada pela agenda de skins | Seção 2.5. |
| uma mudança de época para um tema que já está no site | **uma seção nova, numerada, no arquivo desse tema** (se ele é seu, 2.2), ou um arquivo novo seu | Na seção nova, tudo do tema fica junto e desfazer é voltar uma versão; mas, se a classe já está no ar, gravar é lançar (`temas-sazonais.md`, 3). Num arquivo novo, a linha dele no `<head>` é um interruptor só dessa mudança, e é mais um arquivo que todo visitante baixa. |
| JavaScript (2.6) | **um Arquivo JS novo, seu** (o padrão) | Tem o próprio interruptor (uma linha no `<head>`), e um erro nele não para o JS de ninguém. Num JS da loja que já existe, só se ele é seu (2.2) e a pessoa preferir: um erro de sintaxe ali para o resto daquele arquivo. |
| uma reserva de espaço que esconde ou segura um elemento antes de um JS agir | **só com o aperto de mão das duas peças** (2.6, item g) | Sem ele, se o JS falha ou ainda não está no ar, a reserva esconde o elemento ou deixa um buraco. Com ele, sem o JS a reserva não age. |
| conserto no SCSS de Personalização | só se não houver outro jeito | Campo enorme (~104 KB numa loja, ~34 KB noutra), compartilhado, e uma mudança ali não se desliga sem editar de novo. Quem grava é a pessoa, à mão (`mapa-do-admin.md`, 9). Prefira sobrepor no seu arquivo. |

Quando mais de uma linha serve (a seção nova ou o arquivo novo; o JS novo ou o JS da loja; com ou sem a
reserva), apresente como escolha fechada, com o custo de cada uma em uma frase, e a pessoa decide. Anote a
decisão no perfil ("Campanhas e decisões da pessoa").

### 2.2 Um arquivo seu, ligado no `<head>`

O padrão que funcionou: **um arquivo por assunto, de propriedade clara** (o arquivo de ajustes da loja, o
tema da Black deste ano), criado uma vez e depois só atualizado. Se ainda não existe, seção 5.6.

- **Não edite arquivos dos outros** (o CSS do cabeçalho feito pela agência, o tema do ano passado). Se uma
  regra deles está errada, sobreponha no seu e conte à pessoa. Assim, desfazer o seu nunca quebra o deles.
  Um arquivo só conta como seu quando a coluna de dono do perfil ("Arquivos CSS/JS da loja") diz que ele
  foi criado pelo Claude para esta loja, a pedido da pessoa, **e** ela confirma. Um arquivo que uma sessão
  anterior criou e que o perfil não registra (o nome parece seu, o histórico não diz nada): pergunte de quem
  é antes de editar, e anote a resposta na coluna.
- **Posição no `<head>`**: logo depois dos arquivos que você precisa vencer. Onde ele fica em relação ao SCSS
  de Personalização e ao CSS da página depende da família (1.1, perfil "Ordem da cascata"): na `/dist`, todo
  link do Código dentro do `<head>` vem antes do SCSS, que vence o seu no empate (suba a especificidade onde
  a medição mostrar que precisa); na `modelo-1`, os links do Código dentro do `<head>` são as últimas folhas
  do `<head>`, e o seu vence o SCSS e o CSS da página no empate.
- **Escreva CSS plano, sem aninhamento.** O Arquivo é servido cru. CSS aninhado (SCSS) só funciona nos
  navegadores com aninhamento nativo (Chrome 120+, Safari 17.2+) e é ignorado nos outros — medido num arquivo
  de terceiros que estilizava o carrinho só nesses navegadores, sem ninguém saber. A sua prévia, num Chrome
  atual, pode mostrar a regra aninhada funcionando enquanto o visitante com navegador antigo não vê nada.
  `$variável`, `@mixin` e `@extend` não funcionam em navegador nenhum.
- **Prefira ASCII no arquivo.** O arquivo não depende então da codificação com que foi salvo ou servido.
  Cada linguagem tem o seu escape:
  - **no CSS** (seletor e `content`), escapes de **6 dígitos**: `\0000e7` para "ç", `\0000e3` para "ã". Com
    menos de 6 dígitos, se o caractere seguinte for um algarismo ou uma letra de `a` a `f`, ele entra no
    código: `\00e3e` não é "ãe", é outro caractere. Com 6 dígitos o escape termina sozinho (com menos, só um
    espaço logo depois o termina);
  - **numa string de JS**, o escape do JS: `\u00e7` para "ç" (o de 6 dígitos do CSS não vale ali). Um
    seletor dentro de uma string de JS (`querySelector('.tag-pre\u00e7o')`) leva o escape do JS;
  - **em comentário**, sem acento ("preco", "secao").
- **A ferramenta de gravar arquivo do agente pode desfazer o escape.** Medido duas vezes numa sessão
  (2026-10): o `\u00e7` digitado num JS chegou ao disco como o "ç" literal, também dentro de um `replace` em
  Python no mesmo comando. Gere a barra por código (em Python, `chr(92) + 'u00e7'`) e deixe o
  `montar_tema.py` conferir antes da prévia: ele recusa caractere fora do ASCII nas seções e no `--js` (5.2),
  e foi ele que pegou o caso medido.
- **Comente cada seção** com o que faz, por quê, o que foi medido e a data, e numere as seções (seção 9,
  seção 10…). Diff, prévia e desfazer passam a ser por seção. Mas comentário viaja para todo visitante:
  medido um arquivo de 115 KB com ~29 KB de comentários. Com `montar_tema.py --publicar` (5.2), as seções
  novas vão ao ar só com uma linha de cabeçalho (o número e o título), e a versão comentada fica na pasta
  `trabalho/` do perfil; a história longa fica nela e no perfil da loja. O que já está no ar com comentário
  fica como está (com `--base`, a base vai byte a byte). Num tema longo, o melhor é guardar a versão
  comentada **no admin**, numa página tipo Arquivo despublicada, e pôr no site só a versão enxuta, com um
  único comentário que aponta para ela. Assim as notas ficam com a loja, e não num computador só, e quem
  abrir o arquivo no site (outro Claude, um dev) sabe onde elas estão. Medido numa loja: de ~41 KB para
  ~15 KB transferidos por visita, com as mesmas regras (5.2, "A versão comentada no admin").
- **O número da seção nova vem da versão no ar.** Antes de numerar, leia o último número da versão no ar (a
  que vai de base) e a coluna "Última seção" do perfil ("Arquivos CSS/JS da loja"). Medido numa loja
  (2026-10): uma seção nova levou o número de uma que já estava no ar; e a versão publicada pelo `--publicar`
  de antes, que tirava todo comentário das seções novas, ficou sem o cabeçalho da seção nova: lido o arquivo
  no ar, ele parecia terminar no número anterior. O `montar_tema.py --base` avisa número repetido e diz qual
  é o próximo livre (`8` e `8.8` são números diferentes); se ele avisa "há seções sem cabeçalho no fim da
  base" (regras depois do comentário de fim da última seção numerada, como `/* ==== fim 17 ==== */`), o
  último número vem do histórico do perfil, não do arquivo. Ele também avisa quando uma seção nova não tem
  cabeçalho numerado, e quando uma `--secao` tem mais de um número (18 e 19; 18 e 18.1 são uma seção só):
  só o primeiro fica na versão de publicar. Com a versão comentada guardada no admin (5.2), a enxuta do site
  não tem cabeçalho de seção nenhum: os números vêm da comentada, que é a base do `montar_tema.py`.

### 2.3 Escopo: aparelho, tipo de página, região e, no modo de época, a classe

Toda regra começa dizendo **quando vale**. É o que impede que um ajuste do card da home mude a página do
produto, ou que o tema da Black pinte o carrinho.

**O interruptor.** Tenha sempre um jeito de desligar sem editar o CSS:

- **ajuste permanente**: o próprio `<link>` no `<head>` é o interruptor (tirar a linha e limpar o cache de
  configuração desliga tudo; antes de limpar o cache, pergunte, ou faça se a pessoa pediu). Sem classe
  própria, o arquivo age no momento em que a linha entra no `<head>`: quem vê antes disso é só quem liga a
  prévia (seção 3);
- **ajuste de época**: **uma classe sua no `<body>`** no começo de cada seletor. Sem a classe, o arquivo não
  faz nada. A classe entra numa página de teste pelo construtor (Estilo CSS/SCSS › "Classe no `<body>`",
  `body_class`) e, no site inteiro, pela agenda de skins (`references/mapa-do-admin.md`, seção 2). Foi assim
  na loja medida: arquivo publicado e inerte, testado numa página de teste com a classe, ligado depois pela
  agenda, e desligado trocando o `bodyClass`.

**O aparelho.** O servidor decide pelo **User-Agent** e manda **HTML diferente** para celular e computador,
com `isMobile` ou `notMobile` no `<body>` (tema twig; plataforma, nas duas famílias medidas). Uma janela
estreita no computador continua recebendo o HTML de computador. Medido no tema novo de uma loja: o `<header>`
do celular tinha ~23 tags contra ~259 no computador; no twig as árvores também diferem (o celular tem blocos
que o computador não tem; na família `modelo-1`, o cabeçalho do computador fica num `.header-container` que
o celular não tem). Então:

- escreva a parte de cada aparelho com `.isMobile` ou `.notMobile` no seletor, cada uma completa, em vez de
  uma regra para os dois com exceções por cima (na loja medida, a versão com exceções precisou ser refeita);
- largura dentro de um aparelho é `@media` normal: o computador estreito (1024–1199px) ainda é `notMobile`;
- iPad recebe o site de computador e não tem mouse: efeitos de hover vão dentro de `@media (hover:hover)`.

No tema novo em React (HTML com `<script id="__NEXT_DATA__">` e classes `pano-*`), o celular é decidido
também por largura (≤ 992px). Confira qual é o da sua loja: `!!document.getElementById('__NEXT_DATA__')`.

**No front-end novo, a skill não tem medição** de classe de aparelho no `<body>`, de seletores do tema, nem
de quais `<link>` do Código dentro do `<head>` chegam à página. Os catálogos (`catalogo-tema-base.md`,
`catalogo-modelo-1.md`) são só do twig, e o escopo por `body.isMobile`/`body.notMobile` desta seção também:
não presuma nenhum deles. Antes de escrever CSS:

1. confira no HTML servido pelo endereço novo, nos dois User-Agents (4.2), se os `<link>` do Código dentro
   do `<head>` aparecem (o do seu arquivo ou, se ele ainda não existe, os que a loja já tem). Se não
   aparecem, um Arquivo ligado no `<head>` não age ali: pare e pergunte ao suporte da Panorama Sistemas.
   Medido numa loja, o front-end novo não injetava o SCSS de Personalização (`reconhecimento-da-loja.md`,
   2c; `armadilhas.md`, 26b);
2. leia `document.body.className` no HTML de celular e no de computador. Se nenhuma classe disser o
   aparelho, escope com `@media (max-width: 992px)` (a mesma regra do front-end novo, `armadilhas.md`, 17)
   e teste dos dois lados de 992px;
3. diga à pessoa que essa parte não foi medida, e meça na loja dela cada seletor antes de usá-lo
   (`medir-no-navegador.md`).

Se a loja tem os dois endereços (twig e React), pergunte em qual a mudança vale.

**O tipo de página.** Classes do `<body>` (plataforma, vistas nas duas famílias; confira): `page-home`,
`page-builder` (página do construtor), `page-product` (página do produto), `page-product-list` (categoria,
busca, listas de campanha). Medidas só numa família: `page-cart` e `page-checkout` (`/dist`); `page-html`
(institucionais), `page-contact`, `page-login` e `page-store-rating-list` (`modelo-1`). Use
`:not(.page-home)` para "fora da home". **Páginas de outro sistema** (rotas Next.js dentro do site twig,
como o carrinho de uma loja medida em `/finalizar-compra/…`) não têm classe nenhuma no `<body>` nem
recebem os Arquivos do `<head>`: o ajuste não chega lá (`mapa-do-admin.md`, 15). O perfil lista quais são
("Endereços fora do tema").

**A região.** O miolo da página é `#area-body` no tema twig (plataforma) e `#layout-main-content` no tema
novo. O cabeçalho do site é `.inner-body > header` na família `/dist` e no celular da `modelo-1`, e
`.inner-body > .header-container > header` no computador da `modelo-1` — **com o `>`**: sem ele a regra pega
também qualquer `<header>` de uma seção dentro da página (medido: o tema escuro pintou de preto o título de
uma seção da home que usava `<header>`). O rodapé costuma ser irmão de `#area-body`, mas numa home da família
`modelo-1` estava dentro dele (`catalogo-modelo-1.md`, 16): confira antes de pôr uma regra larga no
`#area-body`. Botões flutuantes (WhatsApp) ficam fora do cabeçalho e do rodapé: olhar só os dois não basta.

```css
/* Ajuste permanente: aparelho + página + região + alvo */
body.notMobile.page-product-list #area-body .product .prices { … }
body.isMobile.page-home .inner-body > header { … }
/* Ajuste de época: a mesma coisa, com a classe na frente */
body.sua-classe.notMobile.page-product-list #area-body .product .prices { … }
```

### 2.4 Âncoras que duram e âncoras que morrem

- **Duram:** classes do tema (as do catálogo da família, conferidas na sua loja), classes do `<body>`, ids de
  componentes da plataforma (`#lgpd-message`), o `href` de um link (bom para item de menu sem classe própria,
  `catalogo-tema-base.md`, 2; confira no DOM carregado, porque um JS da loja pode tirá-lo).
- **Morrem caladas:** `#block-xxxxxxxx` (o id do bloco do construtor) — some quando a home é trocada por
  outra página, o que aconteceu no meio do trabalho na loja medida. Classes com hash (`.foayRI`, do tema
  novo) mudam a cada versão do tema: nunca use. Classes que a loja pôs num bloco do construtor também morrem
  com a página.
- **Morrem de propósito:** o endereço de uma imagem (`img[src*="/123456/"]`). Útil quando a regra só faz
  sentido para aquele arquivo de imagem: se subirem outro, a regra para de casar, que é o certo.
- Quando usar âncora que pode morrer, **escreva no comentário o que acontece quando ela parar de casar** ("o
  espaço volta ao padrão, uns 10px; nada quebra"). Se a resposta for "quebra", escolha outra âncora.

### 2.5 Tema de época: copie, não edite o do ano passado

O padrão que deu certo: em vez de editar o tema do ano anterior, **uma classe nova e um arquivo novo** com a
cópia do tema antigo trocando a classe; provar que a cópia é idêntica (0 diferenças de estilo computado em
home, lista, produto, carrinho e conta, nos dois aparelhos) e **só então** corrigir. O tema antigo continua
lá, intacto, e voltar é trocar o `bodyClass` da agenda de volta. O roteiro completo (agenda, arquivo de tema
isolado, barra promocional com contagem, checklists de lançamento e de volta) está em
`references/temas-sazonais.md`; as telas, em `references/mapa-do-admin.md`.

### 2.6 Quando a mudança precisa de JavaScript

Prefira CSS. Quando não der (texto que muda por data, uma classe que precisa estar lá antes da primeira
pintura):

- **Um erro de sintaxe num arquivo JS para tudo o que vem depois dele no mesmo arquivo.** Numa loja medida,
  um arquivo JS da loja que mexia na barra tinha também o WhatsApp do rodapé e o ano do copyright. Ponha o
  seu bloco dentro de `try { … } catch (e) {}`, com a configuração (datas, textos) no topo e o resto marcado
  "não precisa mexer". Se o seu código entra no `window.onReady`, o `try/catch` vai dentro da função: a
  plataforma roda essas funções em sequência, sem `try/catch`, e um erro numa delas para as seguintes (lido
  no `platform.<hash>.js`, 2026-10; `temas-sazonais.md`, 5).
- **Classe que muda layout tem de estar lá antes da primeira pintura.** No `<head>` o `<body>` ainda não
  existe, então ponha a classe no `<html>` com um script no Código dentro do `<head>`:
  `document.documentElement.classList.add('minha-variante')`. Medido: a mesma classe posta depois, por uma
  tag comum do GTM com a página já desenhada, deu deslocamento de layout (CLS) de 0,13 a 0,16 de uma vez (o
  limite "bom" do Google é 0,1 para a visita inteira). Posta no `<head>`: 0.
- **Classe que o servidor já manda no `<body>`** (a do tema ligado pela agenda) dispensa esse script: a
  vaga de uma barra pode ser reservada por CSS estático preso a ela, e o JS pode ser `defer`
  (`temas-sazonais.md`, 6; item h, abaixo). Se, sem o JS, a vaga reservada ficaria vazia (ou um elemento
  ficaria escondido), prenda a reserva também a uma classe que o JS põe no `<html>` (o aperto de mão nos dois
  sentidos, item g); aí o JS vai sem `defer` (item h).
- Não reescreva por script texto que é do admin. Se o texto precisa mudar, mude no admin.
- **JS que mexe nos cards depois da carga** (um "R$" menor num `<span>`, um selo calculado, uma classe por
  card). Aprendido numa loja da família `modelo-1` (2026-10), num JS de tema que aumentava o preço dos cards:
  - (a) **Os cards que chegam depois** (as vitrines vêm por XHR, 1.4; o Owl clona itens,
    `catalogo-tema-base.md`, 7) pedem um `MutationObserver`. Observe o menor contêiner que já existe na carga
    e recebe os cards (meça antes se o bloco da vitrine vem no HTML do servidor). Se tiver de ser o `body` com
    `subtree`, não peça `characterData` sem precisar (uma contagem que muda a cada segundo dispara o
    observador a cada segundo), descarte logo as mutações dos seus próprios nós e as do relógio, agende uma
    varredura por quadro, nunca uma por mutação, e leia todas as medidas antes de escrever qualquer uma (um
    cálculo de layout só). Se o evento `ProductList:instanciar` da plataforma cobre o caso na sua loja,
    prefira ele (meça em quais listas e vitrines ele dispara).
  - (b) **Antes da próxima pintura.** Agende com `requestAnimationFrame`, não com um `setTimeout` com atraso.
    Medido: com um `setTimeout` de 120 ms, o card tardio aparecia com o preço do CSS e depois o preço pulava
    (de 28 para 38px numa vitrine da home). Meça com `puloDoCard` (`medir-no-navegador.md`, 14). Numa aba que
    não está na frente, o `requestAnimationFrame` não roda: traga a aba para a frente antes de concluir que o
    card não foi tratado (`ferramentas-de-navegador.md`, 2).
  - (c) **Cancele com a função do agendamento.** O número que o `requestAnimationFrame` devolve se cancela
    com `cancelAnimationFrame`; o do `setTimeout`, com `clearTimeout`. São contadores diferentes: com a
    função errada, o seu agendamento continua, e o número pode ser o de um timer de outro script, que você
    cancela sem querer. Guarde junto do número qual dos dois foi usado e, depois de trocar o agendamento,
    releia cada cancelamento. Medido: o agendamento virou `requestAnimationFrame` e o desligar continuou com
    `clearTimeout`; a releitura do desligar pegou, antes de gerar o favorito.
  - (d) **Idempotente.** Marque o que já tratou (uma classe sua no card), confira "já está certo: não mexe"
    antes de escrever (evita laço com o seu próprio observador), nunca embrulhe duas vezes (o "R$" num
    `<span>` dentro de outro) e tenha, para cada mudança, o jeito de desfazê-la, inclusive as que ficam fora
    dos cards (uma classe no `<html>` ou no `<body>`, um atributo, uma caixa).
  - (e) **O desligar desfaz tudo, em todo caminho.** A função de desligar (`__previaDesligar`, ou a do
    próprio tema, passada com `--desligar`: `previa.md`, "JS na prévia") desconecta o observador, cancela o
    quadro e os timers com a função certa, tira os ouvintes de evento, desembrulha o que embrulhou e tira as
    classes, os atributos e os nós que pôs, também no caminho "nada a fazer nesta página" (sem o alvo).
    Confira "0 restos" (`document.querySelectorAll('.sua-marca').length === 0`, uma contagem por marca, e as
    classes do `<html>` e do `<body>`) **também numa página onde a mudança não se aplica**: medido numa loja
    (2026-10), um JS deixou a classe dele no `<body>` depois de desligar, num produto sem o alvo. E os testes
    de "nada mudou" da 4.1, com `mudaram: 0` (`medir-no-navegador.md`, 9).

Os itens (f) a (h) valem para qualquer JS seu, não só para o dos cards.

#### (f) Levar um elemento que o tema desenha para outro lugar

Pedido típico: "o selo que fica em cima da foto, quero junto do preço". Se a origem e o destino estão no
mesmo contêiner, prefira CSS (`order`, `position`: catálogo da família, 8). Se não estão, é um JS que move o
nó. Medido numa loja da família `/dist` (2026-10): uma etiqueta do admin levada de cima da foto principal
para logo acima do preço, na página do produto, com o CSS e o JS presos um ao outro (item g). O JS:

1. **age só nas condições dele**: a classe do tipo de página (`page-product`), a classe do tema se é de
   época, e o sinal do CSS (item g). Fora delas, não faz nada e não deixa nada;
2. **acha a origem e o destino por seletores que casam com um elemento só**:
   `document.querySelectorAll(SELETOR).length` igual a 1 em duas ou três páginas, nos dois aparelhos. Numa
   galeria Owl do celular, o primeiro `.item` de verdade, nunca um `.cloned` (catálogo da família, 7). Mais
   de um, ou nenhum: não move;
3. **move o mesmo nó** (`insertBefore`, `appendChild`). Nunca clone e nunca reescreva o texto que vem do
   admin: o texto, a cor e o desenho continuam os do admin e do tema;
4. **guarda de onde ele saiu**: o pai e o irmão seguinte, para devolver ao mesmo lugar;
5. **é idempotente**: uma classe de marca diz "já movi" (rodar de novo não faz nada);
6. **roda dentro de `try/catch`**, e no erro o elemento fica onde estava, ou volta para lá;
7. **exporta a função de desfazer**, que devolve o nó ao pai e ao irmão guardados e tira a caixa e toda
   classe e atributo que pôs, em todo caminho, inclusive "nada a mover nesta página" (item e);
8. **começa pela checagem do `readyState`** (as duas últimas linhas do esqueleto abaixo): assim funciona no
   `<head>`, com `defer` e na prévia, que roda com a página já pronta (item h).

O esqueleto, com o aperto de mão do item g (troque `ORIGEM .alvo`, `DESTINO`, `sua-classe` e `sua-marca`):

```js
/* Leva ORIGEM .alvo para o comeco de DESTINO. Par da secao N do seu CSS (o lugar, a reserva e o sinal). */
(function () {
  var raiz = document.documentElement;
  raiz.classList.add('sua-marca-js');                    // liga a reserva do CSS antes da pintura (item g)
  function mover() {
    var b = document.body, alvo = null, pai = null, prox = null, caixa = null;
    var desfazer = function () {                         // em todo caminho, inclusive "nada a mover"
      if (caixa && alvo.parentNode === caixa) pai.insertBefore(alvo, prox && prox.parentNode === pai ? prox : null);
      if (caixa && caixa.parentNode) caixa.parentNode.removeChild(caixa);
      if (b) b.classList.remove('sua-marca-movido');
      raiz.classList.remove('sua-marca-js');
      window.__suaMarcaDesfazer = undefined;
    };
    try {
      if (!b || !b.classList.contains('sua-classe') || !b.classList.contains('page-product')
          || getComputedStyle(b).getPropertyValue('--sua-marca').trim() !== '1') {   // fora das condicoes: nada
        raiz.classList.remove('sua-marca-js');
        return;
      }
      if (b.classList.contains('sua-marca-movido')) return;                         // ja moveu
      var alvos = document.querySelectorAll('ORIGEM .alvo'), destinos = document.querySelectorAll('DESTINO');
      if (alvos.length === 1 && destinos.length === 1) {
        alvo = alvos[0]; pai = alvo.parentNode; prox = alvo.nextSibling;
        caixa = document.createElement('div');
        caixa.className = 'sua-marca';
        caixa.appendChild(alvo);                                                     // o mesmo no, nao uma copia
        destinos[0].insertBefore(caixa, destinos[0].firstChild);
      }
      b.classList.add('sua-marca-movido');               // com ou sem alvo, na mesma tarefa: solta a reserva
      if (!caixa) raiz.classList.remove('sua-marca-js');
      window.__suaMarcaDesfazer = desfazer;
    } catch (e) {
      try { desfazer(); } catch (e2) {}                  // no erro: o alvo volta, a reserva sai
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mover);
  else mover();
})();
```

Diga à pessoa, com os prints: depois de um JS mover o elemento, o leitor de tela e o Tab o encontram no lugar
novo (por CSS seria o contrário: a ordem de leitura continua a do HTML, catálogo da família, 8); e quem não
roda JS (o robô de busca na primeira passada, um navegador com o JS desligado, uma falha do JS) vê o
elemento no lugar antigo.

Os dois riscos que a prévia não mostra:

- **a primeira pintura**: o JS age depois que o HTML chega; sem reserva, o elemento aparece na origem e
  depois pula, e o que está abaixo do destino desce. Reserve (item g) e meça com `medirCLS`
  (`medir-no-navegador.md`, 15);
- **a página que se refaz depois da carga** (abaixo).

A prova: "0 restos" depois do desfazer (as marcas, a caixa e as classes do `<html>` e do `<body>`), também
numa página sem o alvo; e a comparação por elemento (`medir-no-navegador.md`, 9) entre antes de ligar e
depois de desfazer: `mudaram: 0`, `novos: 0`, `sumiram: 0` (o nó devolvido é o mesmo elemento).

**A página que se refaz depois da carga.** Na página do produto, trocar a variação (cor, tamanho), a
quantidade ou o frete pode fazer o tema refazer um bloco inteiro: o elemento movido some, ou volta para a
origem, ou aparece duas vezes. Antes de gravar, na sua aba, com a mudança ligada, troque uma variação e a
quantidade e veja se a origem ou o destino foram refeitos, ou se a página foi para outra URL:

```js
// Ex.: vigiarTroca(['ORIGEM', 'DESTINO']); troque a variação e a quantidade, espere 2 s e rode __troca()
window.vigiarTroca = function (seletores) {
  seletores = [].concat(seletores);
  var antes = seletores.map(function (s) { return document.querySelector(s); }), conta = seletores.map(function () { return 0; });
  var mo = new MutationObserver(function (lista) {
    lista.forEach(function (m) {
      antes.forEach(function (c, i) {
        if (c && (c === m.target || c.contains(m.target)
            || [].some.call(m.removedNodes, function (n) { return n === c || (n.contains && n.contains(c)); }))) conta[i]++;
      });
    });
  });
  mo.observe(document.getElementById('area-body') || document.body, { childList: true, subtree: true });
  window.__troca = function () {
    mo.disconnect();
    return seletores.map(function (s, i) {
      return [s.replace(/[?&=]/g, '·'), conta[i], !!antes[i] && antes[i].isConnected && document.querySelector(s) === antes[i]];
    });
  };
  return 'vigiando: troque a variação e a quantidade, espere 2 s e rode __troca()';
};
```

`__troca()` devolve, para cada contêiner, `[seletor, mudanças de filhos dentro dele, se continua o mesmo
nó]`. Se `__troca` não existe mais, a troca levou a outra URL: a página recarregou e o JS roda de novo nela.
Zero mudanças e o mesmo nó: o tema não refez nada. Se refez, decida com a pessoa: reaplicar a partir de um
`MutationObserver` no ancestral que não é refeito, do jeito idempotente dos itens (a) a (e), ou trocar o
movimento por uma alternativa só de CSS. O frete pede um CEP, e você não digita dados da pessoa
(`previa.md`, "Conferir você mesmo antes de mandar"): diga "frete não testado", ou peça a ela que troque o
CEP enquanto você vigia. O medido na família `/dist` está no catálogo dela, 13.

#### (g) Mudança em duas peças (CSS + JS): uma não age sem a outra

Quando a mudança tem um CSS (o lugar, o estilo, a reserva) e um JS (o movimento), as duas peças vão ao ar em
momentos diferentes: a gravação de cada arquivo, a linha do `<head>`, o cache de cada uma e, numa loja com CDN
na frente, a borda, que guarda uma cópia por aparelho. Sozinha, cada peça pode deixar meia mudança no ar.
Medido numa loja (2026-10), antes do aperto de mão: com só o CSS, a etiqueta sumia da foto e sobrava um espaço
vazio de 33px; com só o JS, ela mudava de lugar sem o estilo da caixa. O aperto de mão vai nos dois sentidos:

- **o CSS dá o sinal** com uma variável que só ele declara, nas mesmas condições das regras:
  `body.sua-classe.page-product{--sua-marca:1;}`. O JS só age se
  `getComputedStyle(document.body).getPropertyValue('--sua-marca').trim() === '1'` (para a folha já estar
  carregada quando ele lê, a linha do JS entra logo depois do `<link>` do CSS: item h);
- **o JS dá o sinal** com uma classe que põe no `<html>` ao carregar (`sua-marca-js`): as regras de reserva
  do CSS só valem com ela, e o JS a tira quando decide não agir (sem o sinal do CSS, sem o alvo, no erro).

Medido na mesma loja, com o aperto de mão: só o CSS no ar, 0 diferenças; só o JS no ar, 0 diferenças e nada
movido; as duas, a mudança. Na gravação, cada passo ficou inerte até a linha do `<head>`; a ordem está em
`gravacao-arquivo-e-head.md`, "Mudança em duas peças: a ordem".

**A reserva de espaço antes da primeira pintura.** Reserve no destino a altura do que vai chegar, só nas
páginas em que o alvo existe na origem (`:has()`), só enquanto a classe do JS está no `<html>`, e só até o
JS pôr `sua-marca-movido` no `<body>`, o que ele faz na mesma tarefa em que insere a caixa:

```css
/* o sinal para o JS */
body.sua-classe.page-product{--sua-marca:1;}
/* a caixa no lugar novo */
body.sua-classe.page-product DESTINO > .sua-marca{…}
/* antes de o JS mover: o alvo some da origem e o destino guarda a altura medida */
@supports selector(:has(a)){
  html.sua-marca-js body.sua-classe.page-product:not(.sua-marca-movido) ORIGEM .alvo{visibility:hidden;}
  html.sua-marca-js body.sua-classe.page-product:not(.sua-marca-movido):has(ORIGEM .alvo) DESTINO::before{content:"";display:block;height:33px;}
}
```

- A reserva fica toda dentro do `@supports`; fora dele, a versão básica, sem reserva: num navegador sem
  `:has()`, o alvo aparece na origem e muda de lugar quando o JS roda (catálogo da família, 6).
- Sem o JS no ar, não há a classe no `<html>`, e a reserva não age (nada some). JS com erro: o `catch` tira a
  classe, e o alvo fica (ou volta) na origem.
- A altura é a medida: o elemento mais o espaço até o vizinho (medido numa loja: 33px, no computador). Meça
  em cada aparelho e largura da 4.1; se ela muda, uma regra por `@media`. Se o destino já usa o `::before`,
  reserve com `padding-top`.
- Meça o deslocamento na carga antes e depois (`medirCLS`, `medir-no-navegador.md`, 15).

**Prévia e teste.** Para a pessoa, um favorito só com as duas peças (`--css` com `--depois-de` e o `--js`,
mais `--desligar __suaMarcaDesfazer` para o favorito desligar pela função do próprio JS: `previa.md`, "JS na
prévia"). Na sua aba, teste também cada peça sozinha (só o CSS da seção; só o JS) e
confira, em cada uma, 0 diferenças (4.1). O favorito não mostra a primeira pintura: a reserva se mede depois
de pôr no ar, ou num render local (3.4).

#### (h) Com ou sem `defer`

- O JS que põe uma classe no `<html>` antes da primeira pintura (a reserva do item g, uma variante de layout)
  vai no `<head>` **sem** `defer` nem `async`: a primeira linha roda antes de o `<body>` existir.
- O JS sem nada a fazer antes da pintura pode ir com `defer` (não segura a página).
- Nos dois casos, o trabalho no DOM espera pela checagem do `readyState` (item f, passo 8). Com ela, o mesmo
  arquivo funciona no `<head>`, com `defer` e na prévia, que roda com a página pronta (medido numa loja,
  2026-10, no `<head>` sem `defer` e na prévia).
- A linha no `<head>`: `<script src="/seu-arquivo.js?v=1"></script>`, com o `defer` só no segundo caso.
- **Onde ela entra, num aperto de mão (item g): logo depois do `<link>` do CSS do par.** Um `<script>` sem
  `defer` depois de uma folha de estilo só roda quando a folha chegou; então, quando o JS procura a variável
  do CSS, ela já se lê (deduzido das regras do HTML, não medido). Acima da folha, numa página sem outro
  script depois dela, o `DOMContentLoaded` pode vir antes da folha: o JS não lê o sinal, não age, e a mudança
  falta naquela carga (falha segura, mas intermitente). Se a linha tiver de ir acima, o JS, sem o sinal e com
  `document.readyState !== 'complete'`, tenta de novo uma vez no `load` da `window` antes de desistir, e só
  então tira a classe do `<html>`. Numa loja medida (2026-10-22), a linha foi acima do CSS e funcionou,
  provavelmente porque o `<head>` tem scripts com `defer`, que esperam as folhas antes de rodar. A troca do
  `<head>` que põe a linha nesse lugar: `gravacao-arquivo-e-head.md`, "Mudança em duas peças: a ordem".

---

## 3. Prévia sem gravar nada

A prévia é a melhor ferramenta deste guia: mostra a mudança no site de verdade, com os produtos e banners de
hoje, **sem gravar nada**. Só quem ligou vê, só naquela aba, e recarregar a página desfaz. Nenhuma mudança
visual vai para o admin sem a pessoa ver a prévia e aprovar: o roteiro de aprovação (qual prévia para qual
mudança, o que mandar para a pessoa, o que conta como "aprovado") está em `references/previa.md`.

### 3.1 Injetar na mesma posição da cascata

O erro clássico é pôr o `<style>` num lugar diferente do que o arquivo vai ter. O fim do `<head>` fica
depois de tudo do `<head>`: na família `/dist`, depois do SCSS de Personalização, e ali a prévia ganha de
regras que, publicadas, perderiam. **A prévia mente.** (Na `modelo-1`, os links do Código dentro do `<head>`
já são as últimas folhas do `<head>`; mesmo assim, confira.) Ponha logo depois do `<link>` do arquivo onde a
regra vai morar:

```js
(function () {
  var ID = 'previa-ajuste', d = document, s = d.getElementById(ID);
  if (s) { s.remove(); return 'prévia desligada'; }
  s = d.createElement('style'); s.id = ID;
  // seletor da família /dist (medido numa loja); na família modelo-N, o seletor sai de catalogo-modelo-1.md
  s.textContent = "body.notMobile .tags .tag.tag-percentual-desconto{background:#RRGGBB !important}";
  // o arquivo onde a regra vai morar; arquivo novo: o <link> que vai ficar logo acima da linha nova
  var lk = d.querySelector('link[rel="stylesheet"][href*="/seu-tema.css"]');
  if (!lk) return 'NÃO LIGUEI: esse <link> não está nesta página (a prévia mentiria em outra posição)';
  lk.after(s);
  return 'prévia ligada';
})()
```

Se a versão nova **substitui** o arquivo (regras mudadas ou apagadas), desligue o arquivo atual durante a
prévia (`lk.sheet.disabled = true`) e injete a versão inteira; se ela só **acrescenta** seções, injetar só
as seções novas depois do `<link>` dá o mesmo resultado de pôr no ar. Confira a posição com
`medir-no-navegador.md`, 1.

Para simular a classe do tema numa página que ainda não a tem (modo de época):
`document.body.classList.toggle('sua-classe')`.

### 3.2 Favorito de prévia para a pessoa ver no navegador dela

Para a pessoa aprovar sem depender de você, gere um favorito (bookmarklet) com `scripts/gerar_previa.py`:

```bash
python -I scripts/gerar_previa.py --css trabalho/secao-selo.css --classe-body sua-classe \
       --depois-de "seu-tema.css" --nome "Selo vermelho" --saida trabalho/previa-selo.txt
```

- `--depois-de` põe o estilo logo depois do arquivo (3.1) e, se não achar o arquivo na página, não liga;
  `--substitui` desliga o arquivo e põe a versão inteira no lugar; `--classe-body` recusa ligar em página sem
  a classe: use só quando a classe já está no `<body>` (tema já ligado, ou página de teste); para um tema que
  ainda não está na agenda, quem põe a classe é o `--js` (`temas-sazonais.md`, 3b); `--js` roda um
  JavaScript junto. Sem uma posição (`--depois-de`, `--substitui` ou `--fim-do-head`), o gerador recusa CSS.
- Outras opções, descritas em `previa.md` ("O gerador" e "JS na prévia"): `--depois-de "style:TRECHO"` (logo
  depois do `<style>` sem id que contém o trecho, como o do SCSS de Personalização), `--desligar NOME` (JS de
  tema que exporta a própria função de desligar), `--js` repetido (um arquivo que põe a classe ou fixa a
  hora, e o JS do tema sem embrulho), `--resize` (carrossel que já se mediu antes da prévia, 3.3)
  e `--transporte` (o código em gzip+base64, para levar a prévia a um navegador sem upload de arquivo).
- O script também grava o `.js` legível: **rode-o você primeiro** na aba do navegador e confira, antes de
  entregar o favorito.
- Para instalar no Chrome: Ctrl+Shift+O (Gerenciador de favoritos) › três pontos › Adicionar novo favorito ›
  no campo URL, colar o conteúdo inteiro do `.txt`. Colado na barra de endereço não funciona: o Chrome apaga o
  `javascript:` do começo.
- Tamanho: um favorito de ~55 mil caracteres (CSS de várias seções mais o JavaScript de uma barra com
  contagem) funcionou numa loja; noutra, foram gerados favoritos de ~46, ~99 e ~139 mil, e a instalação dos
  dois maiores no gerenciador de favoritos não foi medida. Medido no de ~139 mil (2026-10): ~102 mil vinham
  do CSS, já sem os comentários, e ~34 mil do JS, porque o recuo e as quebras de linha do JS custam ~1,7x no
  favorito (sem comentários e sem recuo, esse JS caberia em ~15 mil). O gerador avisa acima de 55 mil e diz
  de onde vêm os caracteres (o CSS, cada `--js` e o código fixo do favorito). Para o JS, `--compactar-js`
  tira comentários e recuo só dentro do favorito, onde tem certeza, conferido pedaço por pedaço e pelo Node
  (no caso medido, ~34 mil → ~15 mil; o sha continua o do arquivo). Para o resto, tire o que não é desta
  prévia (seções que não mudam) ou peça à pessoa para confirmar que o selo "Prévia ligada" apareceu, e tenha
  os prints como reserva (`previa.md`, "O gerador").
- Para a pessoa ver o celular no próprio Chrome: F12 › ícone de celular (Ctrl+Shift+M) › escolher um aparelho ›
  **recarregar a página**. O DevTools troca o User-Agent e o servidor manda o HTML de celular; o favorito
  funciona ali também. Se ela não quiser mexer nisso, os prints do celular que você mandar bastam.

Diga à pessoa, junto com o favorito: clicar liga, clicar de novo desliga, recarregar desfaz, e ninguém mais vê.

### 3.3 Prévias que precisam refazer medições do tema

Alguns componentes medem o layout **uma vez**, quando montam. Um estilo que chega depois disso (a prévia
sempre chega depois) encontra medidas velhas. Dois casos medidos:

- **Carrossel (Owl, plataforma).** O Owl mede as larguras dos itens quando monta. Numa loja, uma prévia que
  mudava a largura do container da Barra do Topo (onde um JS da loja montava um Owl) cortava o carrossel —
  **só na prévia**. Gere o favorito com `--resize`: ele dispara um `resize` ao ligar e ao desligar, e o Owl
  se mede de novo. Esse `resize` remede também outros componentes (na mesma loja, uma vitrine mudou 112px de
  altura): no teste de "sem a classe, 0 diferenças", faça a contraprova antes de culpar o CSS
  (`medir-no-navegador.md`, 9).
- **Altura congelada dos cards (família `/dist`).** Nas listas do computador o tema congela a altura de cada
  card no evento `ProductList:instanciar` (`style` inline com `height`, `max-height` e `min-height`). Uma
  etiqueta que deixava o card 40px mais alto aparecia com os preços cortados — **só na prévia**; publicado, o
  estilo já está lá quando o tema mede. Na família `modelo-1` esse congelamento não foi achado
  (`catalogo-modelo-1.md`, 4). A prévia refaz a medição ao ligar e devolve as alturas ao desligar. Passe isto
  com `--js` no `gerar_previa.py`:

```js
// Listas do computador (família /dist, confira): refaz a altura congelada dos cards; devolve ao desligar.
var Q = '.product.on-hover-details-started';
document.querySelectorAll(Q).forEach(function (p) {
  var c = p.querySelector('.product-container'); if (!c) return;
  if (!p.dataset.previaAltura) p.dataset.previaAltura = JSON.stringify([p.style.height, c.style.maxHeight, c.style.minHeight]);
  p.classList.remove('on-hover-details-started');
  p.style.height = c.style.maxHeight = c.style.minHeight = '';
  var h = Math.round(c.offsetHeight) + 'px';
  p.style.height = c.style.maxHeight = c.style.minHeight = h;
  p.classList.add('on-hover-details-started');
});
window.__previaDesligar = function () {
  document.querySelectorAll(Q).forEach(function (p) {
    var c = p.querySelector('.product-container'); if (!c || !p.dataset.previaAltura) return;
    var v = JSON.parse(p.dataset.previaAltura);
    p.style.height = v[0]; c.style.maxHeight = v[1]; c.style.minHeight = v[2];
    delete p.dataset.previaAltura;
  });
};
```

Se a mudança tem JavaScript de verdade (uma barra, um relógio), gere o arquivo publicado e o favorito **a
partir da mesma fonte, por script**, para a prévia rodar exatamente o código que vai para o ar; e ao desligar,
desfaça tudo: devolva o DOM original (guarde um `cloneNode(true)` antes) e religue os eventos que desligou.
Se o JS do tema já exporta a própria função de desligar, `--desligar NOME` faz o favorito usá-la, sem
embrulho escrito à mão (`previa.md`, "JS na prévia").

### 3.4 O que uma prévia não mostra

- **A primeira pintura.** O favorito entra com a página pronta. Altura reservada, classe posta no `<head>`,
  um JS que move um elemento (2.6, itens f e g), deslocamento de layout na carga: na prévia a página pula,
  publicada não (ou o contrário). Meça com `medirCLS` (`medir-no-navegador.md`, 15), antes e depois: depois
  de pôr no ar, ou num render local de uma cópia do HTML com os arquivos novos na posição do `<head>` (4.2,
  jeito 4).
- **O que só o servidor faz**: texto que vem da agenda, HTML de celular (use o modo celular, 3.2), cache.
- **Navegador antigo.** A prévia roda no Chrome de quem olha; uma regra que só um Chrome atual entende
  (aninhamento, `:has()`) parece certa ali e some no navegador antigo do visitante (2.2,
  `catalogo-tema-base.md`, 6).
- **Outras abas e outras pessoas.** Prévia é sua.

---

## 4. Testar e medir

### 4.1 Matriz mínima

| | Computador | Celular (HTML de celular) |
|---|---|---|
| Larguras | 1920x1080, 1366x768 e 1280x720 **sempre** (é em 1280 que flutuantes começam a cobrir botões); **1024 e ~1100** também, sempre que a mudança mexe em tamanho de texto, preço ou botão, põe ou move alguma coisa dentro ou logo ao lado do preço ou do box de compra (uma etiqueta levada para junto do preço conta), ou muda a altura deles: o Safari do iPad pede o site de computador por padrão, então o iPad deitado recebe o HTML de computador (`notMobile`), e numa loja um preço maior empurrou o box de compra para fora da tela entre 1024 e ~1120px (`catalogo-modelo-1.md`, 13). Pelo mesmo motivo, o iPad em pé (768–834px) recebe o HTML de computador: numa loja, as setas de uma vitrine cobriram o fim do título entre 768 e ~1000px. E a configuração de quem aprova (linha abaixo) | 375x812 e 390x844; 340–350 para o caso mais estreito |
| Páginas | home, uma categoria, resultado de busca, uma lista de campanha, página de produto (com as recomendações), carrinho (se for do tema, 2.3), login/conta, uma institucional | as mesmas |
| Estados | **com e sem a classe** (modo de época, enquanto ela não está no ar); primeira visita (avisos de cookies e do app abertos: aba anônima); mouse em cima e foco de teclado (Tab); sacola aberta, vazia e com produto (com produto, muda a sessão de quem está no site: `previa.md`, "Conferir você mesmo antes de mandar"); termos mais buscados e sugestões da busca; megamenu; pop-up do construtor. Num tema que muda cor, todos os estados da lista de `temas-sazonais.md`, 12, passo 10 | primeira visita; menu lateral aberto; busca com sugestões abertas; sacola aberta; filtros das listas abertos |
| Configuração de quem aprova | a largura da janela em px CSS, o zoom do navegador no site e o `devicePixelRatio` de quem vai aprovar (perfil; `medir-no-navegador.md`, 13): um print nessa configuração, além das larguras acima. Medido numa loja: com 90% de zoom numa tela de 1920px, a janela tinha ~2.133px CSS, e o layout e o desenho das letras eram outros | o celular que ela usa, se ela aprova pelo celular |

Esta tabela é a lista de larguras da skill: os outros arquivos apontam para cá, em vez de repetir.

**Os testes de "nada mudou" se somam; não são alternativas.** Cada um compara duas fotos do estilo
computado (`medir-no-navegador.md`, 9): `mudaram` tem de dar 0, e cada elemento em `novos` ou `sumiram`
precisa de explicação. Faça todos os que valem para a mudança:

1. **Modo de época, enquanto a classe não está no ar: sem a classe, 0 diferenças.** Prova que o arquivo
   gravado não mexe em nada até a agenda ligar a classe. Com a classe já no ar (o tema já ligado), este teste
   não segura nada, porque gravar é lançar (`temas-sazonais.md`, 3, "Quando a classe do tema já está no
   ar"): valem os outros dois.
2. **Sempre, com a prévia ligada, páginas que não deveriam mudar**: uma do mesmo tipo onde a mudança não se
   aplica (um produto sem a etiqueta) **e** uma de outro tipo (uma lista ou a home). Uma página que é outro
   sistema (perfil, "Endereços fora do tema") não muda nunca e não prova nada.
3. **Mudança em duas peças (CSS e JS): cada peça sozinha dá 0** (2.6, item g).

Com JS, mais o "0 restos" depois de desligar, também numa página onde a mudança não se aplica (2.6, itens e
e f). Se aparecer diferença que você não esperava, faça a contraprova (`medir-no-navegador.md`, 9) antes de
mexer no CSS: ela separa o que é do CSS do que é do JS da prévia.

**Meça a linha de base antes de ligar a prévia.** Rolagem lateral, contraste e áreas de clique, em cada
largura da matriz, **sem** a prévia (`medir-no-navegador.md`, 6): o que já existia não é seu. Numa loja, um
painel do tema causava ~30px de rolagem lateral entre 1280 e 1707px antes de qualquer mudança. O critério é
"**sem rolagem lateral a mais do que havia antes**"; a que já existia vai para a pessoa como problema do site
(`criterios-de-design.md`, 3). Diga de onde veio cada número (janela, ou `<iframe>` de N px) e compare a
linha de base com a prévia só no mesmo meio e na mesma largura. Medido numa loja (2026-10): 112px numa
janela de 1920, e 389 e 560px em `<iframe>` de 1366 e 1024, sem calibrar; não se sabe quanto disso é do
`<iframe>` (`medir-no-navegador.md`, 6). O contraste se mede em todo texto cuja cor ou cujo fundo muda
(`criterios-de-design.md`, 2).

### 4.2 O celular é decidido no servidor

Janela estreita não é celular (2.3). Quatro jeitos de ver o HTML de celular:

1. **No navegador da pessoa**: DevTools em modo aparelho e recarregar (3.2).
2. **No navegador que você controla**: se a ferramenta emula celular trocando o User-Agent
   (`ferramentas-de-navegador.md`, seção 2), use e **recarregue depois de trocar**. Confira:
   `document.body.classList.contains('isMobile')`.
3. **Pelo `curl`**, para ler o HTML e medir sem navegador:

```bash
# Bash. No PowerShell use curl.exe (curl lá é apelido do Invoke-WebRequest).
D=https://www.SUA-LOJA.com.br
UA_CEL='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
curl -s -A "$UA_CEL" "$D/?nc=$RANDOM" > home-celular.html
grep -o '<body[^>]*class="[^"]*"' home-celular.html    # tem de ter isMobile
```

Para medir esse HTML num navegador de computador: carregue o arquivo na página (`<input type=file>`,
`ferramentas-de-navegador.md`, seção 4) e ponha num `<iframe srcdoc>` de 375px dentro de uma página da
mesma origem, com `<base href="https://www.SUA-LOJA.com.br/">` no começo do `<head>`. Limite: o que chega
depois por XHR (as vitrines) vem com o User-Agent do navegador, de computador. Para esses pedaços, use o
jeito 1 ou 2.

4. **Cópia salva com o HTML de celular**: `salvar_copia.mjs --celular` (ou uma linha `--celular` na lista)
   salva a página como o servidor manda para o celular, e `shot.mjs --copia ... --celular` /
   `rodada.mjs --offline` a abrem a 375px, sem rede (`previa.md`, "Iterar offline, confirmar no ar"). Sem os
   scripts, o **render local de uma cópia** servida em `127.0.0.1` (`ferramentas-de-navegador.md`, 4): a cópia
   salva do HTML de celular (ou de computador), aberta no navegador que você controla. Serve para comparar
   direções de uma proposta de estilo (`criterios-de-design.md`, 4) e medir larguras sem tocar no site no ar
   nem nas abas da pessoa. As vitrines por XHR podem não vir, e a cópia é de uma data: o print vai rotulado
   como render local.

### 4.3 Medidas que pegam defeito

Os trechos estão em `medir-no-navegador.md`: rolagem lateral e quem a causa (6), área de clique com
`elementFromPoint` (7), contraste WCAG contra o fundo que de fato está atrás (8), comparar dois estados do
estilo computado (9), carrosséis parados (10) e espaço entre seções medido pelo que se vê (11). Devolva
números e verdadeiro/falso, não textos com `?`, `=` ou medidas coladas como `"1520.8x866"`: o filtro de
saída da ferramenta bloqueia (`ferramentas-de-navegador.md`).

Mais três, para mudanças maiores: como a pessoa vê (13: largura, zoom e `devicePixelRatio` de quem aprova),
o pulo do card que chega depois (14), quando um JS mexe nos cards (2.6), e o deslocamento na carga (15:
`medirCLS`), quando a mudança mexe na primeira pintura (2.6, itens f e g). Numa mudança de fonte ou de tamanho
de título, confira também as palavras acentuadas em caixa alta (Ã, Õ, Ç, É, Ê) nos títulos, no zoom real de
quem aprova: o caso medido está em `catalogo-tema-base.md`, 14.

### 4.4 Screenshots

- Antes e depois **no mesmo ponto de rolagem**, lado a lado. Screenshot prova fidelidade ("está como devia?"),
  não presença ("apareceu?").
- O screenshot vem **escalado**: um clique por coordenada já caiu 24px fora e abriu outro módulo. Aja pelo
  DOM, sempre; use a imagem só para olhar.
- Pare carrosséis antes (`medir-no-navegador.md`, 10), senão a foto pega um banner no meio da troca.

### 4.5 Quando uma verificação correta parece falha

Aba que vem com 375px, zoom por origem, painel escondido que não carrega imagens, arquivo local bloqueado,
filtro de saída, saída cortada, abas compartilhadas com outros agentes: está tudo em
`ferramentas-de-navegador.md`, com o contorno de cada um.

---

## 5. Pôr no ar

Só com o "sim" da pessoa sobre a prévia. Pôr no ar, aqui, é: gravar o arquivo, mudar o número no `<head>` e
passar pelas camadas de cache. O botão `Publicar` só entra quando um arquivo novo é criado (5.6), e só
com pedido explícito. O detalhe de cada tela do admin está em `references/mapa-do-admin.md`; o transporte de
texto grande para campo do admin, com conferência de sha256, em `references/gravacao-arquivo-e-head.md`.

### 5.1 Antes de gravar

1. **Confira que a sua cópia local do que está no ar é mesmo o que está no ar**: baixe o arquivo servido
   (5.5) e compare com o conteúdo do admin. O admin guarda o texto com **CRLF e sem quebra de linha no fim**:
   compare normalizando, não por sha cru.
2. **Backup**: salve o conteúdo atual do arquivo e o Código dentro do `<head>` inteiro em arquivos locais com
   data no nome, na pasta de backups do perfil. Sem backup não há volta.
3. **Ninguém mais editando.** Antes de abrir, pergunte se alguém (a pessoa ou outra pessoa da loja, em outra
   aba ou em outro computador) está com o diálogo `Configurações` da loja aberto. Se estiver, peça que clique
   em `Cancelar` lá primeiro: o `Confirmar` de lá, depois, grava o `<head>` antigo por cima do seu. Frase
   para a pessoa: "Antes de eu gravar: você ou alguém da loja está com a tela Configurações da loja aberta
   agora, em outra aba ou em outro computador? Se estiver, peça para fechar clicando em Cancelar. Se alguém
   clicar em Confirmar lá depois de mim, a minha mudança é desfeita sem aviso."

### 5.2 Montar a versão nova por script

Versão nova = **a versão no ar, byte a byte, mais as seções novas no fim**. Assim o diff é só o que você
acrescentou e desfazer é colar a anterior. Para um arquivo que ainda não existe (um tema de época novo), a
versão 1 é só as seções. Monte com `scripts/montar_tema.py`, que confere e aborta (rode com os arquivos na
pasta `trabalho/` do perfil):

```bash
# Arquivo que já está no ar: a versão no ar (cópia exata, em LF) + as seções novas, na ordem
python -I scripts/montar_tema.py --base trabalho/seu-tema-v3.css \
       --secao trabalho/secao-selo.css --secao trabalho/secao-menu.css \
       --saida trabalho/seu-tema-v4.css
# Arquivo novo de um tema de época: só as seções, todo seletor preso à classe; com o JS do tema, se houver
python -I scripts/montar_tema.py --secao trabalho/tema-cabecalho.css --secao trabalho/tema-cards.css \
       --classe sua-classe --js trabalho/sua-classe.js --saida trabalho/sua-classe-v1.css
# Com a versão de publicar (sem os comentários das seções): a prévia e a gravação saem dela
python -I scripts/montar_tema.py --secao trabalho/tema-cabecalho.css --secao trabalho/tema-cards.css \
       --classe sua-classe --js trabalho/sua-classe.js --saida trabalho/sua-classe-v1.css \
       --publicar trabalho/sua-classe-v1-publicar.css
```

O que ele confere antes de gravar (se algo falha, sai com ERRO e não grava nada):

- arquivos em UTF-8 sem BOM e sem `\r` (normalize para LF antes); nenhum caractere fora do ASCII, a não ser
  com `--permitir-nao-ascii` (no CSS, os escapes de 6 dígitos; no `--js`, `\u00e7`; nos comentários, sem
  acento: 2.2); comentários fechados; chaves equilibradas, contadas fora de comentários e de strings;
- nas seções, CSS plano: regra dentro de regra, SCSS (`$variável`, `@include`, `@mixin`, `#{}`), comentário
  `//`, texto solto fora de regra e vírgula sobrando numa lista de seletores são ERRO; a base não pode
  terminar com comentário ou chave aberta (engoliriam as seções); com `--sha-base HEX`, a base tem de bater
  com o sha256 anotado no backup (nos bytes ou normalizada);
- com `--base`, que a saída começa pela base, byte a byte;
- com `--classe`, que todo seletor das seções começa por `body.sua-classe` (ou `html… body.sua-classe`). A
  lista de seletores é dividida só nas vírgulas de fora de parênteses, colchetes e aspas: `:is(p, td,
  ul:not(.links) > li)` é um seletor só (um corte ingênuo por vírgula acusava "seletor sem a classe" onde
  não havia). Exceção, só com `--permitir REGEX`, e cada uma usada sai listada. `@import`, `@charset` e
  regras que pintam `:root`, `html`, `body` ou `*` sem a classe são recusados sempre, e `--permitir` não
  libera: agiriam sem a classe (ponha variáveis CSS em `body.sua-classe{…}`). `@font-face`, `@keyframes` de
  nome que não começa pela classe e outras @regras com bloco também são recusados, salvo `--permitir` (uma
  fonte ou uma animação de nome que nenhum CSS da loja usa não muda nada sem a classe); `@keyframes
  sua-classe-…` passa sem exceção;
- sem `--classe` (ajuste permanente), um AVISO para cada seletor novo que não começa por aparelho, tipo de
  página ou região (`body.isMobile`, `body.notMobile`, `body.page-*`, `#area-body`, `.inner-body >`,
  `footer`): releia você mesmo, porque uma classe solta (`.prices{…}`) pega o site inteiro; `@import` fora
  do começo de um arquivo novo é ERRO (o navegador ignora);
- que a saída não é um dos arquivos de entrada, e que uma saída que já existe só é trocada com
  `--sobrescrever`;
- com `--js`, as mesmas conferências de codificação e `node --check`, se houver Node.

E imprime: o tamanho em bytes, o sha256 dos bytes e o sha256 normalizado (CRLF › LF, sem quebra no fim, o que
se compara com o admin), quantos seletores conferiu, as exceções usadas, os números de seção (o maior da base
e a próxima livre, com os AVISOs da 2.2) e o comando do `gerar_previa.py`. Arquivo novo: um comando, com a
saída (ou a versão de publicar). Com `--base`, dois: o de acréscimo, só com as seções novas (`--depois-de` o
arquivo no ar), que é o favorito da pessoa, e o do arquivo inteiro (`--substitui`), que é a sua conferência,
e os dois têm de dar 0 diferenças (`previa.md`, "Favorito grande"). Se mudar um byte depois, monte de novo,
gere a prévia de novo e peça a aprovação de novo (`previa.md`).

**Versão de publicar (`--publicar ARQ`).** Cada byte do arquivo vai para todo visitante, e numa loja ~23% do
arquivo de trabalho era comentário. Com `--publicar`, o script grava, além da `--saida` (a versão de trabalho,
comentada), a versão de publicar: as seções sem os comentários `/* */` (fica uma linha de cabeçalho por
seção nova, com o número e o título, para o arquivo no ar continuar numerado: 2.2), sem espaços no fim das
linhas e sem linhas em branco dentro delas. "Versão de publicar" é nome para você; com a pessoa, diga "a versão sem
comentários que vai para o site" (`previa.md`, "Mandar para a pessoa"). Ela deixa a versão comentada na pasta
`trabalho/` e, com `--base`, os comentários do que já está no ar continuam indo para o site; para guardar a
comentada no admin e tirar também esses, veja "A versão comentada no admin", abaixo.

- Sem `--base`, ela começa por uma linha ASCII que diz de qual versão de trabalho veio (nome, sha256 de 12
  dígitos e data). Por causa da data, montar de novo noutro dia muda o sha: monte uma vez, gere a prévia dela
  e grave essa mesma.
- Com `--base`, ela é a versão no ar, byte a byte (os comentários que já estão no ar ficam), mais as seções
  sem comentários, cada uma com a linha de cabeçalho dela.
- O `--js` não é mexido: é pequeno, e os comentários dele guiam quem edita o bloco de configuração no admin.
- Ela passa pelas mesmas conferências (ASCII, chaves, classe), e o script confere que a lista de regras
  (seletores e declarações) é a mesma da versão de trabalho. É ERRO um comentário colado entre dois nomes
  (`.a/**/.b`, `1px/**/2px`: sem ele, os dois se juntariam) ou logo depois de um escape como `\e9` (sem ele,
  o espaço seguinte viraria parte do escape). Separe com espaço ou tire o comentário à mão. O `--publicar`
  não pode ser uma entrada nem a `--saida`.
- Imprime, para as duas, bytes, sha256 e sha256 normalizado; para a de publicar, também quanto ela é menor
  (`-N bytes (-P%)`). O comando do arquivo inteiro (e o único, num arquivo novo) aponta para a de publicar;
  com `--base`, o de acréscimo aponta para as seções.
- `python -I scripts/montar_tema.py --autoteste` roda os testes internos (corte de seletores, leitor de CSS,
  classe, versão de publicar e números de seção).

A gravação usa a versão de publicar. Arquivo novo: a prévia sai dela, e o sha aprovado é o dela. Com
`--base`: a pessoa aprova o favorito de acréscimo (o sha das seções), e a versão de publicar é a base mais as
mesmas regras (o script confere), com 0 diferenças contra o acréscimo na sua aba; anote o sha das seções, o
da versão de publicar e o da versão de trabalho (`previa.md`, "Grave exatamente o que foi aprovado").

Anote no histórico do perfil da loja (`~/.claude/panorama-lojas/<slug>.md`) o tamanho e o sha de cada versão
publicada (com `--publicar`, o da versão de publicar e, entre parênteses, o da versão de trabalho, como na
coluna do histórico do perfil): é o que permite provar, depois, qual versão está no ar.

**A versão comentada no admin (o tema em duas páginas).** O `--publicar` resolve as seções novas, mas deixa
duas coisas. A versão comentada fica na pasta `trabalho/` de quem mexeu, e o arquivo no ar só diz que ela "fica
com quem mantém o tema": noutro computador, ou para outro Claude ou um dev que abra o arquivo no site, ela não
existe. E os comentários do que já estava no ar continuam indo para todo visitante. Medido numa loja (2026-11):
um tema de 190 KB, com ~2/5 de comentário, passava ~41 KB (gzip) por visita; a versão enxuta, com as mesmas 769
regras, passa ~15 KB. A saída, quando a pessoa quer (pergunte: a página nova é dela, e criar página é pedido
dela), é guardar o tema em duas páginas tipo Arquivo:

- **A do site** (`/seu-tema.css`, a do `<head>`) leva a versão **enxuta**: sem comentários, com um único
  comentário no topo, que diz o `#` e o endereço da comentada.
- **A da comentada** (`/seu-tema-comentado.css`, com um nome como "<tema> - versao comentada (consulta, nao
  publicar)") leva a versão **comentada**, que é a fonte: o porquê de cada regra e os números das seções. Ela
  fica **despublicada de propósito**. No site, o endereço dá 404 e nenhuma página a carrega; no admin, abre-se
  pelo `Alterar` da linha e sai-se por `Cancelar`. Não entra no `<head>` e nunca é publicada: publicada, seria
  um segundo CSS grande, acessível no site sem que nenhuma página precise dele.

A primeira vez, com o tema já no ar:

1. Ache a comentada. Pode ser o próprio arquivo no ar, quando é ele que tem os comentários, ou a versão de
   trabalho da pasta `trabalho/`. A de trabalho só serve se `node scripts/conferir_css.mjs <o servido>
   <a de trabalho>` der 0 diferentes. Se der diferença, alguém mexeu no admin depois dela: mostre à pessoa e
   combine qual vale.
2. Crie a página da comentada. A pergunta fechada: "Crio a página `/seu-tema-comentado.css` na loja <nome>,
   despublicada, com a versão comentada do tema (`Incluir` › `Confirmar`, sem `Publicar`)?". Com o sim, siga
   `gravacao-arquivo-e-head.md`, "Criar um Arquivo novo", grave nela a comentada e confira ao reabrir. Ela não
   muda o site: nenhuma página a carrega. Anote o `#` no perfil. Medido: uma comentada de 204 KB entrou pelo
   `injetarArquivo` e conferiu ao reabrir.
3. Gere a enxuta, com o `#` da página:
   `python -I scripts/enxugar_tema.py trabalho/seu-tema-comentado.css --saida trabalho/seu-tema-enxuto.css
   --pagina NNNNNN --url /seu-tema-comentado.css`. No Git Bash do Windows, rode com `MSYS_NO_PATHCONV=1`,
   senão o `/seu-tema-comentado.css` do `--url` vira um caminho do Windows antes de chegar ao script (medido).
4. Prove que nada muda:
   - `node scripts/conferir_css.mjs <o servido> <a comentada> <a enxuta>` tem de dar 0 diferentes. É a prova
     das regras, regra a regra, no Chrome;
   - `node scripts/conferir_troca.mjs --url <página> --css <a enxuta> --substitui "seu-tema.css"` tem de dar 0
     diferentes na mesma carga do site, numa página de cada tipo (produto, uma lista, a home), no computador e
     com `--celular`. É o complemento na tela: ele não vê `:hover`, `::placeholder` e o que a página não
     carregou (o cabeçalho do script diz tudo o que fica de fora). Na home, os carrosséis fazem "diferenças"
     que não são do CSS; o script para o autoplay e tira da conta o que se mexe sozinho (`armadilhas.md` 35).
5. Não é uma mudança visual, mas troca o arquivo inteiro do site. Mostre à pessoa os números (bytes, KB
   transferidos, as duas conferências com 0) e ofereça a prévia de sempre: o favorito da enxuta no lugar do
   arquivo no ar (`gerar_previa.py --css <a enxuta> --substitui "seu-tema.css"`; se ele passar do tamanho que
   o favorito aguenta, prints de antes e depois pelo `shot.mjs --css <a enxuta> --substitui ...`, nas mesmas
   páginas). Pule a prévia só se ela disser que pode pular (`SKILL.md`, regra zero). Grave só com o OK dela
   para essa gravação.
6. Grave a enxuta no Arquivo do site (5.3), suba o número no `<head>` (5.4) e confira na origem que o arquivo
   servido é a enxuta (5.5). No histórico do perfil, anote o sha da enxuta e o da comentada.

Daí em diante, em toda mudança:

1. A base é a **comentada**, na cópia local da pasta `trabalho/` (a da última gravação). A página dela é
   despublicada, então o `?nc=` do Passo A de `gravacao-arquivo-e-head.md` dá 404. Prove a cópia de duas formas:
   - contra o admin: no `Alterar` da página da comentada, `await conferirArquivoAtual('<sha normalizado da
     cópia>')` (Passo C) tem de passar; saia por `Cancelar`;
   - contra o site: `enxugar_tema.py <a cópia> --saida <qualquer> --pagina NNNNNN --url ... --conferir <o
     arquivo servido hoje, baixado com ?nc=>` tem de dar IGUAL. A mesma comentada dá sempre a mesma enxuta, e
     o IGUAL prova que ninguém editou a enxuta direto no admin. DIFERENTE: pare, mostre a diferença à pessoa
     (`conferir_css.mjs <o servido> <a enxuta gerada>`) e leve a mudança para a comentada antes de seguir.

   Sem a cópia local (outro computador, a pasta perdida), peça à pessoa: abrir o `Alterar` da página da
   comentada, clicar no editor da aba Conteúdo, apertar Ctrl+A e Ctrl+C, colar num arquivo `.css` em
   `trabalho/` (ou colar para você salvar) e sair por `Cancelar`. Depois, as mesmas duas provas. Copiar em
   pedaços pela ferramenta (o snippet E de `reconhecimento-da-loja.md`) daria centenas de chamadas num tema
   de 200 KB.
2. Monte a comentada nova com `montar_tema.py --base <a comentada> --secao ... --saida <a comentada nova>`,
   **sem `--publicar`**. Os números das seções saem da comentada.
3. Gere a enxuta nova com `enxugar_tema.py` e confira `conferir_css.mjs <a comentada nova> <a enxuta nova>` = 0.
4. A prévia é a de sempre: o favorito de acréscimo, só com as seções (`--depois-de` o arquivo no ar). A sua
   conferência é o arquivo inteiro com a enxuta nova (`--substitui`), com 0 diferenças entre os dois
   (`previa.md`, "Favorito grande").
5. Com o "aprovado", grave **as duas antes de subir o número**, cada uma com backup, `conferirArquivoAtual` e
   `verificarArquivoGravou`:
   - primeiro a comentada, na página dela. Nenhuma página a carrega, então gravá-la não muda o site;
   - depois a enxuta, no Arquivo do site.

   Se a da enxuta falhar, o site fica como estava, mas a comentada já descreve a versão nova: termine a enxuta
   ou cole de volta na página da comentada o backup dela, antes de encerrar. Só a enxuta ganha número novo no
   `<head>`, porque a comentada não é carregada.
6. No histórico do perfil, anote o sha das seções (o aprovado), o da enxuta (o que está no ar) e o da
   comentada. Guarde a comentada nova em `trabalho/`: é a base da próxima vez.

O admin devolve o texto das duas com CRLF: compare sempre pelo sha normalizado (CRLF › LF, sem quebra no
fim), que os dois scripts imprimem. A enxuta não é editada à mão. Mudou a comentada, gere a enxuta de novo: o
comentário do topo leva o sha da comentada de que ela saiu, e isso prova o par.

### 5.3 Gravar o arquivo

Loja On-line › Páginas › filtro Tipo = **Arquivo** › marcar **só** a linha do `#NNNNNN` (confira nome, URL e
loja) › Alterar › aba Conteúdo (campo `data.body`) › colar a versão nova › Confirmar › **reabrir e comparar**
com o local (normalizando CRLF) › marcar só a linha › Limpar cache.

Por script, o caminho que funcionou para arquivos: `<input type="file">` injetado no admin + ferramenta de
upload do navegador + sha256 conferido dentro da página, depois `data.body` no escopo e o `Confirmar` com o
clique composto (`references/gravacao-arquivo-e-head.md`, Passos B a E).

### 5.4 Número novo no `<head>` e as camadas de cache (até quatro)

Quando uma mudança "não aparece", **não conclua que a gravação falhou**: confira na fonte (reabrir) e desça
pelas camadas, nesta ordem. Se ainda assim não aparecer, o diagnóstico completo está em
`mapa-do-admin.md`, seção 13.

| # | Camada | Quanto tempo | Como passar | Como provar |
|---|---|---|---|---|
| 1 | **Arquivo CSS/JS** | o `max-age` medido na sua loja (perfil, "Cache e CDN"). Medidos: `max-age=86400` (24 h) numa loja, e na prática mais (com CDN na frente, arquivos chegando da borda com `Age` de 2 a 7 dias, já vencidos); `max-age=1800` (30 min) noutra, sem CDN visível | **subir o número** no `<link>` do `<head>`: `/seu-tema.css?v=3` › `?v=4`, em qualquer caso | o `<head>` servido tem o número novo (5.5) |
| 2 | **Configuração da loja** (`<head>`, agenda, barra do topo, logo) | até alguém limpar | Administrador › Cache › Loja = a sua › marcar **só** "Configurações da Loja" (`loja_config`) › Limpar cache. Peça à pessoa ou peça permissão para fazer | o `<head>` servido com `?nc=` tem o número novo, nos dois User-Agents (5.5). A coluna "Último flush" da linha é só indício: numa loja (2026-10), ela não mudou depois de limpar, e a origem já servia o `<head>` novo |
| 3 | **Cache da página** | — | na grade de Páginas, marcar **só** a linha da página (a home no ar, por exemplo) › Limpar cache. Se não é a linha que você acabou de gravar (a home, por exemplo), pergunte antes, ou faça se a pessoa pediu | "Cache limpo com sucesso"; atenção: limpa a seleção da grade |
| 4 | **CDN / borda**, só se a loja tiver um CDN na frente (numa loja medida, o Cloudflare) | páginas: `max-age=300` (5 min) na home, 600 nas categorias, mais `stale-while-revalidate=60` (medido numa loja com Cloudflare). Sem CDN, esta camada não existe | esperar; ou ver a origem com uma query qualquer (`/?nc=123`) | cabeçalhos `cf-cache-status` (no Cloudflare; MISS = veio da origem agora), `age`, `last-modified` |

**Há CDN na frente?** O perfil diz (o reconhecimento mede pelos cabeçalhos). `cf-cache-status`, `cf-ray` ou
`server: cloudflare` = Cloudflare. Sem nenhum deles, com `Server: Apache` e `Cache-Control: private` no HTML
(medido noutra loja), não há cache compartilhado visível: a camada 4 não existe ali, e o `?nc=` só pula o
cache do navegador. Subir o número no `<head>` continua valendo nos dois casos.

Detalhes que já enganaram (os da borda, medidos numa loja com o Cloudflare na frente):

- **No `<head>`, troque só o número.** Confira depois que o resto ficou idêntico (mesmo comprimento fora da
  troca). O admin guarda esse campo com CRLF.
- **Nunca reuse um número antigo**, nem para voltar a uma versão anterior: o navegador de quem já visitou e,
  onde houver CDN, a borda podem guardar aquele número com o conteúdo de outra época. Sempre um número que
  nunca foi usado.
- **O HTML varia por User-Agent** (o servidor monta um por aparelho), e a borda, onde houver, guarda uma
  cópia de cada: confira computador e celular separadamente.
- **Numa loja com CDN, cada query string vira uma cópia separada na borda**, e `utm_source` na URL faz a borda
  pular o cache (`BYPASS`, com `Set-Cookie`, medido no Cloudflare). Para testar cache, use `?nc=`, nunca
  `?utm_…`.
- Depois de mudar o `<head>`, a home precisou do item 3 além do 2.

### 5.5 Conferir na origem, nos dois aparelhos

```bash
D=https://www.SUA-LOJA.com.br
UA_PC='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36'
UA_CEL='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
N=$RANDOM$RANDOM
# 1) o <head> da origem já pede a versão nova? (computador e celular)
curl -s -A "$UA_PC"  "$D/?nc=$N" | grep -o 'seu-tema\.css?v=[0-9]*'
curl -s -A "$UA_CEL" "$D/?nc=$N" | grep -o 'seu-tema\.css?v=[0-9]*'
# 2) a classe está no <body>? o celular recebeu isMobile?
curl -s -A "$UA_CEL" "$D/?nc=$N" | grep -o '<body[^>]*class="[^"]*"'
# 3) só com CDN na frente (perfil): de quando é a cópia que a borda serve agora (sem ?nc).
#    Sem CDN, a linha mostra só server e cache-control: não há cópia de borda a medir.
curl -s -A "$UA_PC" -D - -o /dev/null "$D/" | grep -i -E '^(cf-cache-status|cf-ray|server|age|cache-control|last-modified):'
```

E o arquivo servido é igual ao local? Compare ignorando CRLF e a quebra final:

```python
"""python -I conferir_servido.py https://www.SUA-LOJA.com.br/seu-tema.css seu-tema-v4.css"""
import random, sys, urllib.request
url, local = sys.argv[1], sys.argv[2]
ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36'
req = urllib.request.Request(url + ('&' if '?' in url else '?') + 'nc=%d' % random.randrange(10**9), headers={'User-Agent': ua})
with urllib.request.urlopen(req) as r:
    servido, h = r.read(), r.headers
norm = lambda b: b.replace(b'\r\n', b'\n').rstrip(b'\n')
loc = open(local, 'rb').read()
print('igual:', norm(servido) == norm(loc), '| servido', len(servido), 'bytes | local', len(loc), 'bytes')
# cf-cache-status só existe com o Cloudflare na frente; None = cabeçalho ausente
print('cf-cache-status:', h.get('cf-cache-status'), '| server:', h.get('server'), '| age:', h.get('age'),
      '| cache-control:', h.get('cache-control'))
```

Depois, a matriz da 4.1 no navegador, agora com o arquivo no ar. Lembre do item (d) do passo 7 do
`construtor.md`: a verificação **inteira** a cada mudança no ar, não só o que mudou.

### 5.6 Primeira vez: a loja ainda não tem um arquivo de ajustes seu

É o caso mais comum numa loja que começa a usar a skill. Combine no começo, antes de escrever CSS, porque
sem estes três "sim" o arquivo não vai ao ar:

1. **criar** uma página tipo Arquivo nova, por exemplo `/ajustes-<slug>.css` (a URL é escolha da loja);
2. **publicar** essa página: sem `Publicar` a URL não responde, e página despublicada dá 404;
3. **acrescentar uma linha** no Código dentro do `<head>`.

O padrão é **a pessoa** clicar em `Incluir`, `Confirmar` e `Publicar`, ou você, se ela pedir nomeando os
botões e a página (o roteiro por script está em `gravacao-arquivo-e-head.md`, "Criar um Arquivo novo" e
"Publicar, quando a pessoa pede"; frases de aprovação não contam como esse pedido). O clique composto no
`Confirmar` do `Incluir` criou a página duas vezes numa loja; um clique real só, pela ferramenta, no
elemento, criou uma (2026-10; o disparo só por `triggerHandler` não foi medido). A skill prepara o conteúdo,
diz o valor de cada campo e confere depois.

O diálogo do `Incluir`, medido numa loja (2026-10): o título é "Adicionar Página"; Loja e Tipo vêm vazios; as
abas são Geral e Configurações, e a aba Conteúdo só aparece depois de Tipo = Arquivo; a linguagem do editor
fica na aba Conteúdo e o tipo MIME na Configurações; os padrões são Publicada "não", robots
`index, follow` e Página no Sitemap ligada. O que conferir nele:

| Campo | O que pôr | Por quê |
|---|---|---|
| Loja | a loja do perfil | vem vazia (medido): escolha pelo campo de busca dela, na sugestão "N - Nome" da loja do perfil. Deixe também o filtro Loja da grade nessa loja antes de clicar, e confira o campo no diálogo; um Arquivo criado na loja errada não é servido no site certo |
| Nome | algo que diga o dono e o assunto (`Ajustes visuais - <loja>`) | o nome não diz o que o arquivo faz; quem vier depois lê a grade |
| URL | `/ajustes-<slug>.css` | é o que vai no `<link>`; minúsculas, sem acento, sem espaço |
| Tipo | **Arquivo** | outro tipo não é servido como arquivo; só com ele aparece a aba Conteúdo |
| Linguagem do editor (aba Conteúdo) e tipo MIME (aba Configurações) | os mesmos de um Arquivo do mesmo tipo que já funciona na loja (no admin medido, um CSS com a linguagem `sass` e o MIME de CSS; um JS, noutra loja, com a linguagem JavaScript e `application/javascript`) | abra um Arquivo da loja do mesmo tipo, leia os dois valores e saia por Cancelar; não invente |
| Robots e Página no Sitemap | os mesmos dos outros Arquivos da loja | é um arquivo, não uma página para o Google; o padrão do diálogo (robots `index, follow`, Sitemap ligado) pode não ser o deles |
| Conteúdo | o CSS aprovado na prévia | — |

Se a loja não tem nenhum Arquivo CSS para copiar: linguagem `sass` (`mapa-do-admin.md`, 3) e, na lista de
tipo MIME, a opção de CSS. Anote "não verificado" no perfil. Para a pessoa, diga o valor de cada campo pelo
nome que aparece na tela, sem falar em "MIME".

**Se o Arquivo novo é um JS** (a barra da opção b de `temas-sazonais.md`, seção 7): linguagem e MIME iguais
aos de um Arquivo JS que já funciona na loja (abra, leia, saia por Cancelar); se a loja não tiver nenhum,
pergunte ao suporte da Panorama Sistemas. No `<head>` (passo 2 de "Depois, a skill", abaixo), a linha é
`<script src="/barra-<slug>.js?v=1"></script>`, com ou sem `defer` pelo item (h) da 2.6: sem `defer` nem
`async` quando o JS precisa agir antes da primeira pintura (a reserva da vaga pela classe no `<html>`). Sem
`defer`, o bloco roda antes do `<body>`: confira no HTML servido se o que ele usa (jQuery, por exemplo) já
foi carregado antes dessa linha; se não foi, não use. Valide com `node --check` antes de colar. Com um
`inicio` no futuro (`temas-sazonais.md`, seção 6), essa linha não muda o site; sem ele, ela já é o
lançamento da barra.

Em cliques, para a pessoa fazer:

1. Loja On-line › Páginas › `Incluir`.
2. Preencha os campos acima. Na aba de conteúdo, cole o CSS aprovado.
3. `Confirmar` **uma vez**, e espere. Na grade, filtre pelo nome e confira que nasceu **uma** linha.
4. Marque só a linha nova › `Publicar` › `OK`, se o admin pedir.
5. Me diga o `#` da linha nova.

Se nascer duplicata, pare: mostre as duas linhas (`#`, URL, Publicada) à pessoa e pergunte qual fica.
Despublicar a sobra é da pessoa: ela clica, e você confere depois; `Excluir` nunca é da skill.

Depois, a skill:

1. confere que `https://www.SUA-LOJA.com.br/ajustes-<slug>.css?nc=…` responde com o conteúdo (5.5);
2. faz o backup do `<head>` e acrescenta **uma linha** `<link rel="stylesheet" href="/ajustes-<slug>.css?v=1">`
   logo depois dos arquivos que ela precisa vencer (`gravacao-arquivo-e-head.md`, Passo F: a troca é a linha
   do `<link>` de cima, que é única, pela mesma linha seguida da linha nova); Confirmar (na tela de
   configuração ele não fecha o diálogo e pode mostrar "Registro inserido" duas vezes: numa alteração, é
   inofensivo); reabre e compara. Se o campo tem conteúdo mas nenhum `<link>` da loja, use como `de` a
   última linha do campo (única, tirada do backup) e como `para` a mesma linha seguida de CRLF e da linha
   nova. Se o campo está vazio, `trocarNoHead` não serve (o `de` não pode ser vazio): a pessoa cola a linha
   à mão e você confere. Onde essa linha cai depende da família (1.1). Na `/dist`, logo antes do `<style>`
   do SCSS de Personalização, e nenhuma opção do gerador põe a prévia exatamente ali: use `--depois-de` com
   o último `<link>` do tema e avise a pessoa que, nas páginas do construtor, a prévia fica antes do CSS da
   página, e no ar fica depois. Na `modelo-1`, no fim do `<head>`, depois do CSS da página: ali
   `--fim-do-head` é a posição publicada, se nada mais estilizar depois do Código dentro do `<head>`
   (confira com `medir-no-navegador.md`, 1). Detalhes em `previa.md`, "Arquivo novo";
3. pede à pessoa a limpeza do cache de configuração da loja (ou limpa, se ela pedir:
   `gravacao-arquivo-e-head.md`, Passo G), pergunta antes do `Limpar cache` da home (não é a linha que a
   skill gravou; ou limpa, se ela pedir), espera a borda, se houver CDN, e confere (5.5);
4. anota no perfil o `#`, a URL, a linha do `<head>` e o `?v=1`.

No modo de época, com o arquivo novo inerte (classe que ainda não está no `<body>`), esta etapa **não muda
nada no site**: prove isso com "sem a classe, 0 diferenças" antes de seguir. Isso vale só enquanto a classe
não está no ar: com o tema já ligado pela agenda, o arquivo novo não é inerte, e a linha no `<head>` já é o
lançamento, como no modo permanente (`temas-sazonais.md`, 3). No modo permanente, a linha no `<head>` já
põe o ajuste no ar: a prévia aprovada vem antes dela. Numa mudança em duas peças, o aperto de mão deixa cada
passo inerte até a linha do `<head>` (2.6, item g).

---

## 6. Desfazer

Escreva o caminho de volta **antes** de pôr no ar, no histórico do perfil da loja
(`~/.claude/panorama-lojas/<slug>.md`). Do mais rápido ao mais completo:

1. **Desligar a classe** (modo de época). Tema por agenda: trocar o `bodyClass` do item de volta (ou pôr a
   data de fim no passado), uma troca só, no seu item, e o cache de configuração (pergunte antes, ou faça
   se a pessoa pediu). Página: tirar a classe da `body_class`. O arquivo fica lá, inerte.
2. **Voltar uma versão.** Colar a versão anterior (`seu-tema-v3.css`) no `#NNNNNN`, Confirmar, Limpar cache
   na linha, **número novo** no `<head>` (`?v=5`, nunca o `?v=3` de antes, 5.4), cache de configuração
   (pergunte antes, ou faça se a pessoa pediu).
3. **Tirar o arquivo do site** (no modo permanente, é o interruptor). Tirar a linha do `<link>` do
   `<head>`: backup novo do `<head>`, conferido como no Passo F (`gravacao-arquivo-e-head.md`), e uma troca
   só, dessa linha (como em `gravacao-arquivo-e-head.md`, "Desfazer"); depois, o cache de configuração
   (pergunte antes, ou faça se a pessoa pediu). Não cole o `<head>` do backup antigo por cima: ele apagaria
   o que outra pessoa mudou depois e traria de volta números antigos de outros arquivos. Despublicar a
   página Arquivo é da pessoa (ela clica, e você confere depois); normalmente não precisa.

Depois de desfazer, confira do mesmo jeito que depois de pôr no ar (5.5 e 4.1). Guarde todos os backups: o
`<head>` antes de cada mudança, o arquivo antes de cada versão, o JSON da agenda antes de editar.

---

## 7. Lista de conferência final

- [ ] O perfil da loja foi lido (ou criado) e nenhum número, arquivo ou classe veio de outra loja.
- [ ] Sei a família do tema e a ordem da cascata desta loja (perfil), e os seletores vêm do catálogo dessa
      família, conferidos aqui (ou foram medidos um a um, se não há catálogo).
- [ ] Sei se o ajuste é permanente ou de época, e o seletor segue o modo.
- [ ] Sei de onde vem o estilo que mudei (`quemPinta` ou `bissecta`), e a minha regra vence pelo motivo certo.
- [ ] Conferi se a tela de configuração já tinha uma opção nativa para isso.
- [ ] Cada regra diz quando vale: aparelho, tipo de página, região e, no modo de época, a classe.
- [ ] A prévia foi mostrada na mesma posição da cascata e a pessoa aprovou.
- [ ] Matriz da 4.1: computador 1920/1366/1280 sempre (e 1024 e ~1100 nos casos da 4.1: texto, preço,
      botão, ou algo posto junto do preço ou do box de compra), um print na configuração de quem aprova e
      celular com HTML de celular, nas páginas que a mudança toca.
- [ ] JS (2.6): cada cancelamento usa a função do agendamento; o desligar deixa 0 restos, também numa página
      onde a mudança não se aplica; um nó movido volta ao mesmo lugar (itens e e f); numa mudança em duas
      peças, cada uma sozinha dá 0 diferenças (item g).
- [ ] Os testes de "nada mudou" da 4.1 que valem aqui, somados, com `mudaram: 0` e cada `novos`/`sumiram`
      explicado (com contraprova, se apareceu diferença). Sem rolagem lateral a mais do que havia antes
      (medida sem a prévia, no mesmo meio e largura). Contraste medido em todo texto cuja cor ou fundo mudou
      (`criterios-de-design.md`, 2), com os números ditos à pessoa. Áreas de clique conferidas com
      `elementFromPoint`.
- [ ] Mudança que mexe na primeira pintura (reserva, classe no `<html>`, JS que move): deslocamento na carga
      medido antes e depois (`medirCLS`), sem aumento.
- [ ] Backup do arquivo e do `<head>` feito antes de gravar; versão nova = versão no ar + seções novas; com
      `--publicar`, a gravação é a versão de publicar (num arquivo novo, a mesma da prévia; com `--base`, a
      base mais as regras do favorito de acréscimo, com 0 diferenças entre os dois: 5.2).
- [ ] Gravado, reaberto e comparado; número **novo** no `<head>`; as camadas de cache passadas (a do CDN, só
  onde houver).
- [ ] Conferido na origem com `curl` (computador e celular) e de novo no navegador, verificação inteira.
- [ ] O caminho de volta está no histórico do perfil da loja, e o perfil foi atualizado (versão no ar,
      número do `?v=`, data).
