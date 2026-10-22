# Mapa do admin da Panorama: onde fica cada coisa fora do construtor

Este mapa descreve o admin da plataforma Panorama Sistemas. Foi levantado numa loja real da família de tema
`/dist` (twig), completado com medições de outra loja que já usava o front-end novo (React), e conferido e
corrigido em outubro de 2026 numa loja da família `modelo-1` (twig, com outro admin). Nomes de
sistema, tela, campo, chave do escopo Angular e botão são da plataforma e se repetiram nos admins medidos,
com exceções anotadas onde apareceram (os filtros da tela Páginas, por exemplo). Já o número das páginas, o
id da loja, os nomes dos arquivos CSS/JS, os domínios e qual página é a home no ar são de cada loja: cada
cliente cria os seus, e eles mudam com o tempo.

Esses dados da loja ficam no **perfil da loja**, em `~/.claude/panorama-lojas/<slug-da-loja>.md`. Se ainda
não existe perfil para a loja em que você vai mexer, faça antes o reconhecimento
(`references/reconhecimento-da-loja.md`): é só leitura e evita gravar no lugar errado. Mesmo com perfil,
reabra a tela e confira nome, URL e loja antes de gravar em qualquer `#`. O perfil é um mapa, não uma
prova.

A Regra zero do `SKILL.md` vale aqui, e pesa mais: estas telas são configuração da **loja inteira**, não
de uma página. Um `Confirmar` errado aqui muda o site todo de uma vez, e quem pediu o ajuste muitas vezes
não é desenvolvedor e não vai perceber o efeito colateral. Grave só o que a pessoa pediu, depois de mostrar
a ela o que vai mudar, e com backup do valor anterior num arquivo local.

O que depende do tema diz onde foi medido: "(família `/dist`, medido numa loja)", "(família `modelo-1`,
medido numa loja)" ou "(plataforma, nas duas famílias medidas)". A família da sua loja está no perfil
(reconhecimento, passo 2i). Numa família que não está aqui, nada disso vale de antemão: meça antes de usar e
diga à pessoa que aquela família ainda não foi medida pela skill.

Este arquivo diz **onde** cada coisa fica e **como** a tela se comporta. O roteiro de cada tipo de tarefa
está ao lado: ajuste visual por CSS (de onde vem um estilo, onde pôr, testar, publicar, desfazer) em
`ajustes-visuais.md`; temas de época, agenda e barras em `temas-sazonais.md`; prévia para a pessoa aprovar
antes de gravar em `previa.md`; o transporte de texto grande e a verificação em `gravacao-arquivo-e-head.md`
(Arquivo e configuração da loja) e `gravacao-construtor.md` (páginas do construtor).

<!-- Outros arquivos citam as seções deste mapa pelo número: não renumere; seção nova entra no fim. -->

## 0. Como o admin é organizado

- **Sistemas.** O botão ao lado do logo, no topo, troca de sistema. Os que importam aqui: **Único**
  (cadastros gerais, inclusive **Lojas**), **Loja On-line** (Páginas, Vitrines, Banners, Menus, Vídeos e as
  telas de etiquetas: Tags, Tags de Produtos e Automação de Tags, seção 16) e **Administrador** (inclusive
  **Cache**). Cada sistema tem o seu menu lateral. Por script, a troca de sistema funcionou com
  `angular.element(a).triggerHandler('click')` no `a[ng-click="main.onClickSystem(menu, $index)"]` cujo texto
  é o nome do sistema, e o item do menu lateral com clique simples (`clicarMenu()`) (medido numa loja). O
  admin lembra o último sistema depois de recarregar: confira em qual sistema você está antes de procurar uma
  tela.
- **Busca do menu.** O campo "O que você está procurando?", no topo do menu lateral, acha a tela pelo nome
  ("cache", "lojas", "páginas"). É o caminho mais curto para a pessoa quando ela não sabe em qual sistema a
  tela mora. Por script, num admin medido, escrever no campo (`value` + evento `input`) não filtrou:
  navegue pelo menu do sistema.
- **Abas internas.** Cada tela aberta vira uma aba interna (com `x`) e não é descartada quando você troca de
  tela. Resultado: várias grades no DOM ao mesmo tempo, e às vezes uma seleção viva numa aba que você não
  está vendo. Por script, escope sempre na grade visível (`gradeVisivel()` do `scripts/injetar.js`) ou
  recarregue o admin ao trocar de seção.
- **Um admin, várias lojas.** O mesmo admin pode atender todas as lojas de um grupo, com as páginas de todas
  na mesma grade (medido: duas lojas num admin; várias noutro). O tamanho da grade varia muito (medido: de
  alguns milhares a cerca de 120 mil registros). Nomes de página se repetem entre as lojas. Filtre sempre
  pela loja e confira a loja da linha antes de gravar.
- **Grades.** Toda grade tem checkbox por linha e um checkbox no cabeçalho que marca tudo. Os botões acima
  da grade (Alterar, Excluir, Publicar, Limpar cache...) agem sobre **todas** as linhas marcadas. O rodapé
  muda de admin para admin: num admin medido, `Registro(s) Selecionado(s): N`; noutro (2026-10), sem linha
  marcada, só `Registro(s): N`, com `Total de Registro(s): N` na paginação. Por isso a seleção se conta pelo
  DOM: as caixas marcadas nas linhas da grade visível, fora do cabeçalho (é o que `conferirAlvo` e
  `conferirLojaNaGrade` fazem, e o `marcadasNoDom` do snippet B de `reconhecimento-da-loja.md`). O rodapé é
  segunda evidência só quando diz "Selecionado(s)": aí ele tem de dizer o mesmo número. Se não houver
  exatamente uma linha marcada, pare e releia a seleção.
- **Janela estreita.** Com viewport estreito o menu lateral some e vários botões ficam ocultos (já
  aconteceu de toda aba aberta pela extensão do navegador vir com 375x667). O admin continua funcionando:
  dispare o botão pelo `triggerHandler` do Angular, escolhendo o elemento único. No caso de
  "Configurações" em Lojas, o certo é o `<button>`; há outros elementos com o mesmo texto.
- **Não clique por coordenada.** O screenshot volta escalado e o admin costuma ter zoom por origem: um
  clique que caiu 24px ao lado abriu outra tela, de outra loja. Aja pelo DOM (`gravacao-construtor.md`,
  "Navegar a tela Páginas por script").

## 1. Configuração da loja

**Caminho:** **Único › Lojas** › marcar a linha da loja (a grade mostra o nome e o endereço do site) ›
botão **Configurações** › no diálogo, select **Tipo** = **Site**.

O diálogo tem, no topo, o select `Tipo` e um campo **"Buscar configuração..."** que filtra os campos pelo
rótulo, útil quando você não sabe em que aba um campo mora. À esquerda ficam as abas **Geral**, **SEO**,
**Visual**, **Integrações / Plugins** e **UTM**. A aba Visual tem as subabas Página do Produto, Lista de
Produtos, Contato, Minha Conta, **Modelo e Skin**, **Logo e Ícone**, **Cabeçalho**, Rodapé, Blog e
Widgets. No rodapé do diálogo, **Confirmar** e **Cancelar**.

Essas são as abas que apareceram para os usuários dos admins medidos; num deles (2026-10) havia também as
abas Atendimento, Redes Sociais e Maioridade, as subabas Vitrines, Blocos e Sumário, e a subaba do logo
escrita "Logo e Icone", sem acento. O perfil de acesso de outro usuário
pode esconder abas, subabas, campos ou o `Confirmar` (seção 14). Uma chave nos dados do diálogo
(`data.configuracao`) não prova que este usuário vê o campo, e a falta dela não prova campo nunca usado:
confira na tela, com a subaba aberta. Um campo que não aparece para este usuário não se grava por script,
mesmo com a chave no escopo: pare, anote no perfil ("Acessos deste usuário no admin") e pergunte (`SKILL.md`,
regra zero).

- **Escopo:** `data.configuracao[data.tipo]`. O select é `ng-model="data.tipo"`; por script, troque com o
  evento `change` e espere uns 2,5 s antes de ler. Outros valores de `Tipo` guardam outra configuração,
  então confira que está em Site.
- **Gravar:** `ng-click="controller.confirmar($event)"`. Com o clique composto ele grava e mostra
  "Registro inserido com sucesso." duas vezes (o `ng-click` dispara duas vezes; medido de novo em 2026-10).
  Numa alteração isso é inofensivo: grava o mesmo valor duas vezes. O diálogo **não fecha** depois de gravar;
  feche com `fecharConfigLoja()` (seção 12). Depois do Cancelar, o diálogo saiu do DOM numa loja (2026-10:
  0 `.ui-dialog`), enquanto o `Alterar` de uma página do construtor, depois de gravar, continuou lá (medido
  antes): conte com `contarDialogos()`, não suponha, e recarregue o admin antes de reabrir.
- **Só ler:** abra, leia e saia por **Cancelar**. `Confirmar` grava mesmo quando você acha que não mudou
  nada.
- **Conferir na fonte:** feche, reabra Configurações, Tipo = Site, e compare o campo com o que você gravou.
  O diálogo recarrega do que está salvo, então essa releitura é a prova.
- **Depois de gravar:** limpar o cache de configuração da loja (seção 5, camada 2): pergunte antes, ou
  faça se a pessoa pediu. Sem isso o site continua com a configuração antiga.

⚠️ **Dois diálogos de Configurações abertos se sobrescrevem.** Pelo que se viu, o `Confirmar` envia a
configuração que aquele diálogo carregou. Se alguém (a pessoa ou outra pessoa da loja) estiver com
Configurações aberto, em outra aba ou em outro computador, e você gravar o `<head>`, o `Confirmar` de lá,
minutos depois, devolve o `<head>` antigo, sem aviso. Antes de gravar, pergunte se alguém está com esse
diálogo aberto e peça para sair por Cancelar.

| Aba › subaba | Campo na tela | Chave em `data.configuracao[data.tipo]` | O que é |
|---|---|---|---|
| Visual › Modelo e Skin | SCSS de Personalização | `modeloScssAfterAll` (medido numa loja da família `modelo-1`; há também `modeloScssBeforeAll`, vazio lá, e o que o "Before" faz não foi medido). Confira na sua com o snippet G: o campo com o rótulo do SCSS | SCSS global da loja, servido inline em todas as páginas do twig (seção 9) |
| Visual › Modelo e Skin | Skin Json Input | `skin` | Agenda dos temas por data (seção 2). Numa loja que nunca usou a agenda, a chave nem existia (medido) |
| Visual › Modelo e Skin (provável; o rótulo não foi anotado) | o modelo do tema | `modelo` (medido numa loja da família `modelo-1`: `modelo-1`; numa da família `/dist`, 2026-10: `proprio`) | Repete o nome do tema só na família `modelo-N`; na `/dist`, `proprio` é o normal. Quem diz a família é o HTML (`reconhecimento-da-loja.md`, 2i). **Só ler** |
| Visual (subaba não anotada; "Buscar configuração..." acha) | modelos de cabeçalho e de menu | `headerModel`, `openMenuModel`, `mobileMenuModel` (vistos numa loja da família `modelo-1`) | Batem com as classes `inner-body header-N`, `menuBar openMenuModel-N` e `menuModel-N` do HTML. **Só ler**: trocar um deles muda o HTML do cabeçalho do site inteiro |
| Visual (subaba não anotada; "Buscar configuração..." acha) | o preço em destaque nos cards (rótulo não anotado) | `layoutPriceMethod` e `layoutPriceOnList` (medido numa loja da família `modelo-1`: `pix` e `1`; as duas vêm também no `__NEXT_DATA__` das rotas Next.js, `reconhecimento-da-loja.md`, 2d). Numa loja da família `/dist` (2026-10), as duas chaves nem existiam no admin, e o `__NEXT_DATA__` mostrava `"default"` e `1`: o padrão da plataforma | Qual preço o card das listas e vitrines mostra em destaque. Com `pix`, era o do PIX/boleto, e o do cartão ficava à parte, no parcelado (medido numa loja). O que o `"default"` escolhe não foi medido: olhe o card. Um selo de % calculado do card é sobre esse preço (`temas-sazonais.md`, 8). O que cada valor de `layoutPriceOnList` faz não foi medido. **Só ler**: mudar troca o preço que todo card mostra, e isso é conteúdo da pessoa |
| Visual › Página do Produto | Preço Principal / Preço Secundário | `productPageMainPrice` / `productPageSecondaryPrice` (medido numa loja, 2026-10; o valor guardado não foi anotado, só o que a tela escreve) | O preço principal e o secundário da página do produto. Medido numa loja: Tabela Preço e Pix, e a página mostrava primeiro o preço do Pix. Um pedido "junto do preço" precisa dizer de qual. **Só ler**: mudar troca os preços de toda página de produto, e isso é conteúdo da pessoa |
| Visual › Cabeçalho | Mostrar Barra do Topo? / Texto na Barra do Topo | `headerTopBarShow` / `textoHeaderTopbar` | Barra acima do cabeçalho, com HTML livre (seção 7) |
| Visual › Logo e Ícone | logo SVG | `svgLogo` | SVG inline do logo (seção 8) |
| Integrações / Plugins › Custom | Código dentro do `<head>` | `customCodeOnHead` | Os `<link>`/`<script>` dos arquivos CSS/JS da loja e códigos de terceiros (seção 10) |

Na mesma subaba Cabeçalho também ficam "Opção de pagamento exibida no popup do carrinho", "Ocultar menus
sem produtos disponíveis" e a lista "Utilizar Termos mais Buscados" (os termos sugeridos na busca). As
chaves desses não foram mapeadas, nem as das subabas Página do Produto (fora os dois preços da tabela),
Lista de Produtos, Contato, Minha Conta, Rodapé, Blog e Widgets. Antes de escrever CSS para algo que pode ser
uma opção dessas telas, leia os campos (só ler, saída por Cancelar): o snippet G de
`reconhecimento-da-loja.md` lista rótulo, `ng-model` e painel de cada um. O admin monta todas as subabas de
uma vez (medido numa loja, 2026-10: 327 campos no diálogo, os das subabas escondidas inclusive): abra a
subaba que interessa e leia só os campos à vista (`__CAMPOS` do snippet G).

Só estas chaves podem ser gravadas por script, com as travas de `scripts/injetar.js`
(`conferirCampoAtual`, `trocarNaConfig`, `confirmarConfigLoja`, `verificarCampoGravou`): `skin`,
`headerTopBarShow`, `textoHeaderTopbar`, `svgLogo` e `customCodeOnHead`. Roteiro em
`gravacao-arquivo-e-head.md`. O SCSS de Personalização, as chaves do modelo do tema e qualquer outra chave:
só a pessoa, à mão. E as funções trocam texto que já existe: uma chave que não existe no escopo (um campo
que a loja nunca usou; medido: a agenda `skin` de uma loja que nunca usou a agenda; ou, não medido, um campo
que este usuário não vê) não é criada por script.
`lerCampo` devolve `existe: false`, e quem grava o primeiro valor é a pessoa, colando à mão; você confere
depois de reabrir (`gravacao-arquivo-e-head.md`, "Campo que nunca foi usado"). E as funções olham a tela
antes de gravar: `conferirCampoAtual`, o primeiro passo de toda gravação daqui, aborta se a subaba do campo
(a da tabela acima; `abaDaChave` em `scripts/injetar.js`) não aparece no diálogo para este usuário, e
`lerCampo` devolve `abaVisivel: false`, sem tamanho. Abra antes a aba de cima e a subaba, como a pessoa
abriria (`abaDialogo`, uma chamada cada; medido em 2026-10 numa loja: trocou para Integrações / Plugins e
depois para Custom, com as abas em `.pane-item`; se no seu admin não trocar, a pessoa clica). Se este admin
escreve outro rótulo de subaba, anote no perfil e passe `{ aba: /rótulo/i }`; se as abas são outro
elemento, `{ seletorAba: '...' }`. Nenhum dos dois pula a conferência.

## 2. Agenda dos temas (Skin Json Input)

O roteiro de um tema de época (testar antes, arquivo de tema isolado, barra com contagem, checklists de
lançamento e de volta) está em `temas-sazonais.md`. Aqui fica o que a tela é e como ela se comporta.

O campo inteiro é uma lista JSON (`[ … ]`). Cada item põe uma classe no `<body>` do **site inteiro**
(as páginas de outro sistema ficam de fora: seção 15) enquanto a data de hoje estiver dentro da janela do
item:

```json
[
    {
        "name": "meu-tema-2026",
        "namespace": "_meutema",
        "bodyClass": "skin-meu-tema-2026",
        "start": "2026-11-01 00:00:00",
        "end": "2026-11-30 23:59:59",
        "promotionBar": { "textLeft": "Texto<br />da esquerda", "textMiddle": "Frase do meio com <b>destaque</b>" }
    },
    {
        "name": "tema-antigo",
        "namespace": "_meutema",
        "bodyClass": "skin-tema-antigo",
        "start": "2025-11-01 00:00:00",
        "end": "2025-11-30 23:59:59"
    }
]
```

- É o liga/desliga dos temas sazonais (Black Friday, Esquenta, Natal, Dia das Mães...). Ligar = um item
  cuja janela inclui hoje. Desligar = data de fim no passado. Trocar de tema = trocar o `bodyClass`.
  Isso também serve de botão de voltar: se o tema novo der problema, aponte o `bodyClass` para o tema
  anterior e peça (ou faça, com pedido) a limpeza do cache de configuração.
- A classe sozinha não muda nada no visual. Quem dá o visual é um arquivo CSS (seção 3) cujas regras
  começam por `body.SUA-CLASSE`. Por isso dá para publicar o arquivo antes e ligar a agenda depois: sem a
  classe no `<body>`, o arquivo não age.
- Itens antigos costumam ficar na lista, desligados com datas no passado (numa loja medida, vários tinham
  `start` igual a `end`, num dia de anos atrás). Não apague: são o histórico e o modelo do próximo tema.
  Numa loja medida, o item novo foi posto no topo da lista e funcionou.
- **`promotionBar`:** com o item ativo, o servidor manda uma barra `a.promotionBar` com `textLeft`,
  `textMiddle` e uma contagem até o `end` do item. Na família `/dist` (medido numa loja, 2026-10) ela fica
  logo abaixo do menu no computador e logo abaixo do cabeçalho no celular, e o relógio escreve nos elementos
  `.countdownDays`, `.countdownHours`, `.countdownMinutes` e `.countdownSeconds` dentro dela, com a função
  `countdown()` do JS do tema. O link da barra vem do tema, não da agenda (numa loja medida, apontava para um
  endereço que dava 404). Quem não roda JavaScript, como o Google, lê o texto que o servidor mandou.
- ⚠️ **A barra da agenda depende da família do tema.** Numa loja da família `modelo-1` (medido em 2026-10),
  nem o CSS nem o JS do tema tinham `promotionBar` ou `countdown`: ligar a barra daria uma barra sem estilo e
  um erro de script, se o servidor mandar o mesmo script da família `/dist` (lá a loja nunca tinha usado a
  agenda, e o script não foi visto). Antes de oferecer essa barra, veja no perfil se ela funciona na
  família da loja; se não estiver medido, meça (`reconhecimento-da-loja.md`, 2f) e siga
  `temas-sazonais.md`, seção 5.
- **Chave ausente.** Numa loja que nunca usou a agenda, a chave `skin` nem existia na configuração (medido):
  não há texto para trocar. O primeiro item é colado pela pessoa, e você confere depois
  (`gravacao-arquivo-e-head.md`, "Campo que nunca foi usado"). Antes, confira na tela que o campo Skin Json
  Input aparece, vazio, na subaba Modelo e Skin: a chave ausente também pode ser um campo que este usuário
  não vê (não medido), e aí quem cola é quem tem acesso.
- ⚠️ **Os JS da própria loja podem apagar ou reescrever essa barra.** Numa loja medida, um arquivo JS do
  `<head>` tinha `$(".promotionBar").remove()` logo no início e, mais abaixo, reescrevia texto e link com
  dados de uma campanha antiga. Se a barra não aparece, procure `promotionBar` nos JS da loja antes de
  concluir que a agenda falhou (o reconhecimento faz essa busca).
- O `namespace` parece ligar o item a comportamentos do tema; o que cada valor faz não foi medido. Para um
  tema que deve se comportar como um já existente, reaproveite o namespace dele. Numa loja sem item
  anterior, combine antes com a pessoa o `namespace` do item de verdade e grave um item inerte com esse mesmo
  valor: ele mede o formato, o fuso e o efeito do namespace, e não deve mudar o site. Pergunte também ao
  suporte da Panorama (`temas-sazonais.md`, seção 2).
- **Teste numa página antes de ligar no site.** O construtor tem a classe por página em Estilo CSS/SCSS ›
  "Classe no `<body>`" (`body_class`). Numa página de teste, pôr a classe do tema ali mostra o tema só
  nela, com o arquivo CSS já publicado.
- Antes de editar, guarde o JSON inteiro num arquivo local. Depois de gravar, reabra e confira que os
  outros itens ficaram idênticos (compare o texto fora do item alterado).
- Datas no formato `AAAA-MM-DD HH:MM:SS`. Presume-se horário de Brasília; não foi medido (o item inerte
  mede). Se dois itens valerem no mesmo dia, não se sabe qual vence, então evite sobreposição.
- A agenda é para tema de época. Um ajuste permanente não entra nela: ficaria valendo por cima de todo tema
  futuro, com precedência desconhecida (`ajustes-visuais.md`, seção 0).

## 3. Arquivos CSS/JS do site = páginas do tipo "Arquivo"

**Caminho:** **Loja On-line › Páginas** › filtro Loja = a sua › filtro Tipo = **Arquivo** (tipo id 28).

- **Conteúdo:** aba **Conteúdo** do diálogo `Alterar`, `data.body` (editor ui-ace com `ng-model` direto).
  Linguagem do editor em `data.config.editor.language` (`"sass"` é o que se usa para CSS) e MIME servido em
  `data.config.file.mimeType`.
- **Servido cru:** a plataforma não compila SCSS nesse arquivo, mesmo com a linguagem "sass" no editor.
  SCSS (`$variável`, `@mixin`) quebra; aninhamento simples só funciona nos navegadores com aninhamento nativo
  (Chrome 120+, Safari 17.2+) e é ignorado nos outros, sem erro (`ajustes-visuais.md`, 2.2). Escreva CSS
  plano.
- **Cache:** o tempo muda de loja para loja. Medido: `Cache-Control: max-age=86400` (24 h) numa loja que tinha
  o Cloudflare na frente, com `Age` de 2 a 7 dias na borda dele; `max-age=1800` (30 min) noutra, sem CDN
  visível nos cabeçalhos. Leia o da sua loja (`reconhecimento-da-loja.md`, 2f) e use o valor do perfil quando
  falar com a pessoa. Nos dois casos, depois de editar o arquivo, suba o cache-buster dele no `<head>` (seção
  10): é a única forma confiável de todo visitante receber a versão nova.
- O admin guarda o conteúdo com CRLF e sem quebra de linha no fim (medido). Para comparar com o arquivo
  local, normalize.
- **Criar um arquivo novo:** Páginas › Incluir, Tipo Arquivo, URL `/seu-tema.css`. Nas lojas medidas, o
  arquivo novo foi criado e publicado para passar a ser servido; o efeito de despublicar um Arquivo não foi
  medido. O diálogo "Adicionar Página" vem com Loja e Tipo vazios, e a aba Conteúdo só aparece depois de
  Tipo = Arquivo (medido numa loja, 2026-10). ⚠️ O `Confirmar` da criação com clique composto criou a página
  duas vezes; um clique real, pela ferramenta do navegador, no elemento, criou uma (2026-10); o disparo só
  por `triggerHandler` não foi medido (seção 12). Os campos do diálogo e o roteiro em cliques para a pessoa:
  `ajustes-visuais.md`, seção 5.6; o caminho por script, só quando a pessoa pede nomeando os botões e a
  página: `gravacao-arquivo-e-head.md`, "Criar um Arquivo novo".
- **O nome não diz o que o arquivo faz.** Abra e leia, e anote no perfil o papel de cada um: tema sazonal,
  estilos de um tipo de página, cabeçalho, rodapé, ajustes por JS... Arquivos de temas antigos costumam
  continuar na lista sem estar no `<head>`; esses não estão no ar pelo `<head>`, mas um Arquivo publicado
  fora dele pode servir uma página só, chamado por ela ou por um JS (os grupos: `reconhecimento-da-loja.md`,
  3b, item 2). E a lista tem também os arquivos do sistema (`robots.txt`, `ads.txt`, o manifest, os de
  `/.well-known/`), que não se mexem.
- **Os JS da loja rodam em todas as páginas do tema** (vêm do `<head>`; as de outro sistema ficam de fora,
  seção 15), muitas vezes com jQuery e `window.onReady`. Um erro de sintaxe num deles para todos os scripts
  daquele arquivo: numa loja medida, o mesmo arquivo cuidava do botão de WhatsApp, do ano do rodapé e da
  barra do topo. Código novo num JS da loja vai dentro de `try/catch`, e o arquivo é conferido com um
  analisador de sintaxe antes de gravar. Um erro dentro de uma função posta no `window.onReady` também para
  as funções que vêm depois dela: a plataforma as roda em sequência, sem `try/catch`, na inicialização da
  página (lido no `platform.<hash>.js`, o mesmo nas duas famílias medidas, 2026-10; não executado). O
  `try/catch` vai dentro da função.

## 4. Qual página é a home no ar

**Loja On-line › Páginas** › filtro Loja = a sua › Tipo = **Construtor** › URL = `/`. Pode haver várias
(numa loja medida, uma por mês ou por campanha) ou uma só, a mesma há muito tempo (noutra loja). Conte no
reconhecimento e anote no perfil. A do ar é **a única com Publicada = Sim**.

- Pode haver também uma "Página Inicial" antiga (tipo 1) com outro URL, que não é a home atual. E numa loja
  que ainda não migrou para o construtor, a home pode ser justamente a do tipo Página Inicial: se nenhuma
  Construtor com URL `/` estiver publicada, procure sem o filtro Tipo.
- Trocar a home é publicar uma e despublicar a outra. Isso muda o site no ar: só com pedido explícito, e
  normalmente quem faz é a pessoa.
- A home pode mudar sem aviso: numa loja medida, com uma home por mês ou por campanha, a do ar foi trocada no
  meio de um trabalho no tema. Mesmo numa loja com uma home só, antes de mexer em algo da home, confira de
  novo qual está publicada; não confie no perfil para isso.
- Depois de mudar o `<head>`, a home precisou de `Limpar cache` na linha dela, além do cache de
  configuração.

## 5. Caches: até quatro camadas, nesta ordem

Quando uma mudança não aparece, não conclua que a gravação falhou. Primeiro confira na fonte (reabra e
leia o campo); se o valor novo está lá, gravou, e o resto é cache ou cascata. Desça pelas camadas na ordem;
se depois delas a mudança ainda não aparece, siga o diagnóstico da seção 13. Anote no perfil quem limpa
cada camada naquela loja. A quarta, o CDN, só existe numa loja que tem um na frente do site (o perfil diz,
pelo reconhecimento, 2b); sem ele, são três camadas, e cada passo abaixo vale do mesmo jeito.

1. **Arquivo CSS/JS.** O tempo de cache é o medido na sua loja (perfil, "Cache e CDN"; medidos: 24 h numa loja
   com CDN na frente, com cópias de dias na borda dele, e 30 min noutra, sem CDN visível). Suba o cache-buster
   do arquivo no `<head>` (seção 10), o que já exige a camada 2. Na prática também se fez `Limpar cache` na
   linha do Arquivo, em Páginas, depois de gravar; não se mediu se é necessário.
2. **Configuração da loja** (`<head>`, agenda, Barra do Topo, logo, SCSS de Personalização). Fica em
   **Administrador › Cache** (a pessoa acha pela busca do menu, "cache"): filtro Loja = a loja certa,
   marcar **só** a linha **"Configurações da Loja"** (código `loja_config`) e clicar **Limpar cache**. Não
   use "Limpar todo o cache" nem "Limpar cache do CDN": são operações amplas, e o alcance delas não foi
   medido. A tela mostra "Processando", e a coluna "Último flush" daquela linha costuma ficar com a hora de
   agora. Isso é **indício, não prova**: numa loja (2026-10), o "Último flush" não mudou depois de uma
   limpeza que funcionou, e a origem já servia o `<head>` novo. A prova é o HTML servido com uma query nova
   (`?nc=`), com User-Agent de computador e de celular, pedindo o número novo do arquivo. Em muitas lojas é
   a própria pessoa quem limpa; pergunte antes de fazer você.
   ⚠️ Sem o filtro Loja, a grade pode mostrar outra linha "Configurações da Loja" (`loja_config`), com outra
   data de "Último flush" (medido numa loja). Só leia ou limpe com o filtro Loja = a sua e com exatamente
   uma linha `loja_config` na grade visível. Por script, `limparCacheConfigLoja()` e
   `ultimoFlushConfigLoja()` abortam fora dessas condições (`gravacao-arquivo-e-head.md`, Passo G). Quando o
   rótulo do filtro Loja não se lê (numa loja, 2026-10, saiu como os nomes das opções, e a função abortou),
   elas aceitam o filtro pelo valor da opção (`string:N` ou `number:N`) junto com o `lojaNome` do perfil
   (`reconhecimento-da-loja.md`, 3d). Se abortarem mesmo assim, não contorne em silêncio: mostre à pessoa o
   que a função leu e o que a tela mostra (`SKILL.md`, regra zero).
3. **Cache da página.** Em Páginas, marque **só** a linha da página e clique **Limpar cache**. Já se viu
   abrir um modal de confirmação (alertify, `OK`/`Cancelar`, precisa do segundo clique; por script, só
   `clicarOkDoModal(/cache/i)`: os modais já respondidos continuam no DOM, e o primeiro `OK` do documento
   pode ser o de um `Publicar`) e já se viu não abrir, respondendo "Cache limpo com sucesso (1 itens)".
   Trate os dois casos (`gravacao-construtor.md`, passo 5).
   Lembre que ele limpa a seleção da grade: remarque antes da próxima operação. Há também um cache do
   backend que pode servir a versão anterior da página por uns 100 s depois de gravar
   (`gravacao-construtor.md`, passo 5).
4. **CDN / borda, só se a loja tiver um CDN na frente** (numa loja medida, o Cloudflare). Antes de tudo, veja
   no perfil se a loja tem um CDN na frente (`reconhecimento-da-loja.md`, 2b): `cf-cache-status`, `cf-ray` ou
   `server: cloudflare` nos cabeçalhos = Cloudflare. Sem nenhum desses, com `server: Apache` e
   `cache-control: private` no HTML (medido noutra loja), não há cache compartilhado visível: esta camada não
   existe ali, as camadas 1 a 3 valem iguais, e `?nc=` só pula o cache do navegador. Com CDN, as páginas ficam
   um tempo na borda: numa loja medida, a home com `Cache-Control: max-age=300, stale-while-revalidate=60` (5
   min) e as categorias com `max-age=600`. Cada loja pode ter regras diferentes; leia os cabeçalhos
   `cache-control`, `cf-cache-status`, `age` e `last-modified` da resposta para saber de quando é a cópia. Uma
   query qualquer (`/?nc=123`) vira outro objeto de cache, dá `MISS` e mostra o que a origem entrega agora. O
   cache varia por User-Agent: confira celular e computador separadamente. Medido numa loja com Cloudflare
   (2026-10): 2 minutos depois de limpar o cache de configuração, o HTML do computador sem query já vinha
   novo, e uma cópia do celular ainda vinha velha (`Age` de 551 s). Diga à pessoa que o celular pode mostrar o
   antigo por mais alguns minutos, e não prometa um prazo fixo: confira de novo, com e sem query, nos dois
   User-Agents. Numa mudança em duas peças com aperto de mão (`ajustes-visuais.md`, 2.6), a cópia velha mostra
   o site antigo inteiro, não meia mudança. Quem limpa o CDN costuma ser a TI da loja; com o cache-buster
   subido, em geral não precisa. A regra de subir o cache-buster vale com CDN ou sem.

Uma quinta coisa que parece cache e é: numa loja medida, os produtos das vitrines chegam depois, por uma
requisição própria (`/?operation=loadVitrine`), com cache de 600 s (medido numa loja; onde há CDN, a borda
guarda por esse tempo). Mudança de cadastro de produto (preço, etiqueta) pode levar uns 10 min para aparecer
nas prateleiras.

## 6. Lições de gravação fora do construtor

- **Backup antes, comparação depois.** Antes de qualquer gravação em configuração ou em Arquivo, salve o
  valor atual num arquivo local com a data no nome (a pasta de backups fica anotada no perfil). Grave só se
  o valor atual for exatamente o do backup: se mudou, outra pessoa mexeu, e você conversa antes de
  sobrescrever. Depois, reabra e compare.
- **Mostre antes de gravar.** Para quem não é desenvolvedor, diga em uma frase o que muda no site, em qual
  campo, e como desfazer. Grave depois do sim.
- **Texto grande num campo** (arquivo CSS, `<head>`): não digite nem transcreva. Dois transportes já
  funcionaram, os dois com sha256 conferido dentro da página antes de atribuir:
  - gzip+base64 numa única chamada (`gravacao-construtor.md`, passo 3a);
  - um `<input type=file>` injetado no DOM do admin, o arquivo local enviado pela ferramenta de upload de
    arquivo do navegador e lido com `FileReader`. Medido numa loja com um CSS de cerca de 115 KB: confere o
    sha256 na página, atribui a `data.body` (ou à chave da configuração) e dispara o `Confirmar` composto
    (`gravacao-arquivo-e-head.md`, Passo B).
- **Quebras de linha:** o admin devolve CRLF. Compare sempre normalizado, ou guarde o sha calculado sobre o
  texto com CRLF.
- **Conferir no ar:** depois das camadas de cache, busque o arquivo e a página com uma query nova
  (`?nc=...`), com User-Agent de computador e de celular, e compare o arquivo servido com o local (sha
  depois de normalizar as quebras).
- **Testar sem gravar nada:** injete o CSS por `<style>` no navegador, logo depois do `<link>` do arquivo
  que ele vai complementar (mesma posição na cascata), ou alterne a classe do `<body>` com um favorito
  `javascript:(()=>{document.body.classList.toggle('SUA-CLASSE-DE-TEMA')})()`. O favorito tem de ser
  criado pelo gerenciador de favoritos: colado na barra de endereço, o Chrome descarta o `javascript:`.
  Numa loja da família `/dist`, as listas de produto do computador congelam a altura de cada card quando
  montam; uma prévia injetada depois disso precisa refazer essa medição, senão corta os preços. Numa da
  família `modelo-1`, foi um carrossel Owl montado por um JS da loja que mediu antes da prévia, e a prévia
  precisou disparar `resize` ao ligar e ao desligar (`previa.md`). No site publicado não acontece,
  porque o estilo já está carregado quando o tema mede. O roteiro completo da prévia, com o
  gerador de favorito, está em `previa.md` e em `ajustes-visuais.md`, seção 3.
- **Desfazer:** guarde a versão anterior de todo arquivo que publicar. Voltar é colar a anterior, subir o
  cache-buster para um número novo e o cache de configuração (pergunte antes, ou faça se a pessoa pediu).
  Para a agenda, voltar é trocar o `bodyClass` ou pôr a data de fim no passado.

## 7. Barra do Topo (Visual › Cabeçalho)

- `headerTopBarShow` é o select "Mostrar Barra do Topo?" (o valor guardado é texto, por exemplo
  `"false"`), e `textoHeaderTopbar` é o HTML livre da barra (editor Ace).
- Onde ela é renderizada depende da família do tema. Na família `/dist` (medido numa loja), como
  `.inner-body > .header-top-bar`, antes do `<header>`. Na família `modelo-1` (medido numa loja), no
  computador fica dentro do cabeçalho, `.inner-body > .header-container > .header-top-bar`, e no celular
  direto em `.inner-body > .header-top-bar`. Confira na sua com o snippet A do reconhecimento, que conta as
  duas posições; o catálogo da família, seção 1, tem o resto.
- Fixa ou não, também depende: na família `/dist` (medido por simulação numa loja), ela rola junto com a
  página e sai da tela, e fixar exige CSS. Na família `modelo-1`, ela vai junto com o cabeçalho, que numa
  loja medida era fixo só na home.
- O estilo dela costuma morar no SCSS de Personalização e nos CSS da loja. JS da loja pode capturar o
  clique: numa loja medida, um JS mandava qualquer clique na barra para uma página de campanha. Procure
  `header-top-bar` nos JS da loja.
- O texto costuma guardar barras de campanhas antigas comentadas com `<!-- -->`, para reaproveitar.
- É outra barra, de outro lugar, que a `promotionBar` da agenda (seção 2). Dá para ter as duas ao mesmo
  tempo, uma em cima da outra.

## 8. Logo (Visual › Logo e Ícone)

- `svgLogo` é o SVG do logo, inline no HTML. As classes e a estrutura internas dependem de como o arquivo
  foi exportado: numa loja medida eram `.st0` (texto) e `.st1` (símbolo), sem `<g>`, e uma regra de tema
  antigo que mirava `.logo g path` deixou de pegar quando o logo foi trocado.
- ⚠️ **Um SVG exportado de editor pode trazer um `<style>` próprio**, com classe genérica (noutra loja
  medida, um `<g>` e uma única classe `.cls-1`, pintada por `.cls-1{fill:...}` dentro do SVG). Inline no
  HTML, esse `<style>` vale para o documento inteiro: pinta qualquer elemento com a mesma classe, e o mesmo
  SVG costuma aparecer também no rodapé. Para mudar a cor do logo num tema, mire o lugar
  (`header .logo svg .cls-1`, e o do rodapé à parte) com especificidade maior que a da classe sozinha, e
  confira que nenhum outro SVG da página usa a mesma classe (`document.querySelectorAll('.cls-1').length`,
  trocando pela classe da sua loja). O snippet D do reconhecimento diz se o logo tem `<style>` e o que ele
  pinta.
- Há também o logo para usar sobre a cor primária: as chaves `svgLogoContrast` e `svgIconContrast` (uma
  opção nativa; vazias numa loja medida). Se a loja já tem um, um tema escuro pode precisar dele, e não de
  CSS; trocar o logo é conteúdo e é da pessoa.
- Antes de escrever CSS que muda a cor do logo (tema escuro, por exemplo), leia o SVG atual e anote no
  perfil as classes que ele usa, se ele tem `<style>` interno e em que lugares da página ele aparece. Se o
  logo for trocado, revise essas regras.

## 9. SCSS de Personalização (Visual › Modelo e Skin)

- SCSS global da loja (medido: cerca de 104 KB numa loja, 34 KB noutra), compilado pela plataforma e
  servido inline num `<style>` sem `id` em todas as páginas do twig (plataforma, nas duas famílias
  medidas).
- **A posição dele na cascata depende da família** (seção 10). Na família `/dist` (medido numa loja) ele vem
  depois dos links do `<head>`, então ganha empate de especificidade contra os arquivos da loja. Na família
  `modelo-1` (medido numa loja) ele vem antes do CSS da página e dos links da loja, então perde o empate
  para eles. O passo 2e do reconhecimento dá o veredito da sua loja ("SCSS antes/depois dos links da loja"),
  e é ele que está no perfil.
- É o lugar dos estilos permanentes da loja, mas é um campo enorme e compartilhado: um erro de sintaxe ou
  uma regra solta afeta o site inteiro. Para mudanças novas, prefira um arquivo CSS próprio (seção 3), que
  liga e desliga por uma linha do `<head>` e se desfaz colando a versão anterior.
- Ele também é fonte de efeito colateral. Numa loja medida, `.header-top{margin-top:10px}` vinda dele
  vazava para fora do `<header>` (colapso de margem) e criava uma faixa clara de 10px acima do cabeçalho
  escuro no celular. Ao investigar "de onde vem esse estilo", inclua este `<style>`.
- No front-end novo (React), medido em outra loja em agosto de 2026, o CSS personalizado da loja não era
  injetado nas páginas. Confira qual front-end a sua loja usa (o reconhecimento mostra). Nas rotas Next.js
  soltas dentro de um site twig (seção 15), o `__NEXT_DATA__` trazia `"modeloScssAfterAll":"/api/loja.css"`,
  e uma delas carregava `/api/loja.css`: pode ser o SCSS compilado, mas o conteúdo não foi medido.
- **Chave:** `modeloScssAfterAll` (medido numa loja da família `modelo-1`; há também `modeloScssBeforeAll`,
  vazio lá, e o que o "Before" faz não foi medido). Confira na sua com o snippet G (o campo com o rótulo do
  SCSS). Mesmo com a chave conhecida, ela fica fora das funções que gravam: quem grava o SCSS é a pessoa, à
  mão, com uma cópia do campo inteiro guardada antes.

## 10. Código dentro do `<head>` (Integrações / Plugins › Custom)

- `customCodeOnHead` vai cru para o `<head>` de todas as páginas do tema (as de outro sistema ficam de fora:
  seção 15). Costuma ter metatags, os `<script>` dos JS da loja, os `<link rel="stylesheet">` dos CSS da
  loja (todos páginas do tipo Arquivo, seção 3, cada um com um cache-buster como `?v=N`, `?updatedNN` ou
  uma data) e códigos de terceiros, como pixels de anúncio.
- A ordem dos `<link>` é a ordem da cascata entre os arquivos da loja: o de baixo ganha empate.
- A ordem completa **muda com a família do tema**. As duas medidas, do mais fraco ao mais forte:
  - família `/dist` (medido numa loja, 2026-10): `platform.<hash>.css` < CSS do tema (`loja.<hash>.css`) <
    CSS da página do construtor (`<style id="builder-custom-css">`) < links do Custom, na ordem em que
    aparecem < `<style>` do SCSS de Personalização < estilos por bloco;
  - família `modelo-1` (medido numa loja, 2026-10): `platform.<hash>.css` < CSS do tema
    (`modelo-1.<hash>.css`) < `<style>` do SCSS de Personalização < um link do Google Fonts < CSS da página
    do construtor < links do Custom (os últimos do `<head>`) < estilos por bloco.

  Na primeira, o SCSS vence os arquivos da loja no empate; na segunda, os arquivos da loja vencem o SCSS e o
  CSS da página. Confira na sua loja com o passo 2e do reconhecimento, que lista as folhas na ordem do
  documento e dá o veredito, e use a ordem do perfil.
- **Editar:** troque só a linha alvo e prove que o resto ficou idêntico (mesmo texto fora da troca,
  comprimento esperado). Um pixel de anúncio apagado sem querer some das métricas sem dar erro nenhum.
- O admin guardou esse texto com quebras de linha CRLF (medido). Ao comparar com um backup local ou
  calcular sha256, normalize as quebras, ou calcule sobre o texto exatamente como está no admin.
- **Ligar um CSS novo no site** = acrescentar `<link rel="stylesheet" href="/seu-tema.css?v=1">` na posição
  certa da cascata, normalmente logo depois do arquivo que ele complementa. Se ele fica antes ou depois do
  SCSS de Personalização não depende da linha que você escolhe: depende da família (o item acima).
  **Desligar** = tirar a linha ou comentá-la com `<!-- -->`.
- **Atualizar um arquivo já ligado** = subir o número do cache-buster dele (seção 3). Use sempre um número
  novo, também para voltar a uma versão anterior: um número antigo pode estar em cache com outro conteúdo.

## 11. Tela Páginas, em resumo

O detalhe de navegação por script está em `gravacao-construtor.md` ("Navegar a tela Páginas por script").
O mínimo:

- **Filtros:** mudam de admin para admin. Medido em 2026-10: Loja · Nome · URL · Tipo · `#` num admin;
  Loja · Nome · URL · SKU · Prod. Ativo · Marca · Tipo noutro, sem filtro `#` e com um seletor de operador
  (`filterSelected.operador`) ao lado de cada campo. Loja e Tipo são `<select>`, e podem estar escondidos
  atrás de um menu próprio (um botão e uma lista; medido numa loja, 2026-10, no Tipo): aí a leitura do
  rótulo pode sair errada (os nomes das opções, ou "(incerto)") e a escolha da opção pela ferramenta pode
  precisar abrir o botão e clicar na opção (`reconhecimento-da-loja.md`, 3b; `ferramentas-de-navegador.md`,
  seção 6). Os campos compartilham
  `ng-model="filterSelected.value1"`, então por script ache cada um pelo rótulo, nunca pela posição
  (`filtrosDaTela()` e `campoDoFiltro('Rótulo')` de `scripts/injetar.js`; `gravacao-construtor.md`,
  "Navegar a tela Páginas por script"), e anote no perfil os da sua tela, na ordem. A busca por URL não
  acha slug com hífen; filtre pelo `#`, se a tela tiver esse filtro, ou por um pedaço sem hífen, e ache a
  linha pela coluna `#`.
- **Produtos como páginas:** num dos admins medidos, os produtos também apareciam na grade (um tipo "Produto
  Derivação"). Mantenha sempre o filtro Tipo.
- **Tipos** que aparecem aqui: Construtor (25), Arquivo (28), Página Inicial (1). A tabela completa está em
  `blocos.md`, seção "Tipos de página".
- **Colunas** úteis: `#` (o único identificador que não se repete), Nome, URL, Publicada, `Robots` e
  `Página no Sitemap`.
- **Diálogo `Alterar`:** abas Geral, SEO e Configurações (no Arquivo, também Conteúdo). Ele reabre na aba
  Geral e recarrega do que está salvo.
- **Botões que mudam o site no ar ou agem em massa** e só se usam com pedido explícito e específico da
  pessoa: `Excluir`, `Publicar`, `Despublicar`, `Ordenação`, `Atualizar View de Acesso as Páginas`.
  `Limpar cache` é aceitável na linha que você acabou de gravar. `Publicar` por script, só depois de um
  pedido que nomeie o botão e a página, e só pelo caminho de `prepararPublicar` e `prepararOkDoPublicar`
  (`gravacao-arquivo-e-head.md`, "Publicar, quando a pessoa pede"): eles conferem a linha e o modal e marcam
  um elemento para **um** clique real. Uma frase de aprovação ("aprovado", "pode seguir") não é esse pedido.
  O modal medido (2026-10) dizia "Você tem certeza que deseja publicar esta(s) página(s)?". `clicarOkDoModal`
  recusa esse modal de propósito; não o use para isso.

## 12. Qual clique funciona em qual botão

Os botões do admin são `ng-click`, e o disparo certo muda de botão para botão. Errar não dá erro: ou não
acontece nada, ou acontece duas vezes. Medido em produção:

| Onde | Botão | O que funcionou | Observação |
|---|---|---|---|
| Páginas | `Alterar` | só `angular.element(b).triggerHandler('click')` | `.click()` não abre; o clique composto abre dois diálogos |
| Diálogo `Alterar` | `Confirmar` | composto: `mousedown`+`mouseup`+`click` e `triggerHandler` | só `.click()` fecha sem gravar; só `triggerHandler` não grava; por script, só o de dentro do `.ui-dialog` (`botaoConfirmarDoDialogo`: sem ele, aborta) |
| Diálogo `Alterar` | abas | `abaDialogo()` do `injetar.js` | `clicarBotao('Configurações')` acha o item do menu com o mesmo nome |
| Diálogo `Alterar` | `Abrir construtor` | pelo escopo, `controller.toggleBuilder()` (`abrirConstrutor()`) | não responde a clique; mora na aba Geral |
| Páginas | `Incluir` › `Confirmar` | o composto criou **duas** páginas iguais; **um clique real**, pela ferramenta do navegador, no elemento, criou **uma** (medido 2026-10: "Registro inserido com sucesso." uma vez, e o diálogo ficou aberto) | disparo só por `triggerHandler` não foi medido; por script, `prepararConfirmarCriacao` marca o botão para esse clique único (ver abaixo) |
| Páginas | `Limpar cache` | composto (por script, `limparCache(#)`); o `OK` do modal alertify, quando ele aparece, só por `clicarOkDoModal(/cache/i)`, nunca `clicarBotao('OK')` | limpa a seleção da grade |
| Páginas | `Publicar` | só com pedido que nomeie o botão e a página; por script, `prepararPublicar` marca o botão e `prepararOkDoPublicar` marca o `OK` do modal, cada um para **um** clique real; depois, `conferirPublicada` | o modal medido (2026-10): "Você tem certeza que deseja publicar esta(s) página(s)?"; `clicarOkDoModal` recusa esse modal de propósito; limpa a seleção da grade |
| Menu lateral | itens | clique simples (`clicarMenu()`) | o composto abre a tela duas vezes |
| Topo | troca de sistema | `angular.element(a).triggerHandler('click')` no `a[ng-click*="onClickSystem"]` cujo texto é o sistema | medido numa loja; o admin lembra o último sistema depois do reload |
| Menu lateral | busca "O que você está procurando?" | `value` + evento `input` **não filtrou** (medido num admin) | navegue pelo menu do sistema |
| Único › Lojas | `Configurações` | `triggerHandler` no `<button>` | há outros elementos com o mesmo texto |
| Diálogo Configurações | `Confirmar` | composto | grava, mostra "Registro inserido com sucesso." duas vezes e não fecha; por script, `confirmarConfigLoja` exige um `controller.confirmar` só, procurado primeiro no diálogo; fora dele, só aceita um do mesmo escopo Angular que recebeu a troca (trava de 2026-10-21, não medida no admin), e aborta sem nenhum |
| Diálogo Configurações | abas e subabas | `abaDialogo()` do `injetar.js` (medido 2026-10 numa loja: trocou Integrações / Plugins e Custom; abas em `.pane-item`; se no seu não trocar, a pessoa clica) | `conferirCampoAtual` exige a subaba do campo à vista (`abaDaChave`) e não clica nela |
| Diálogo Configurações | `Cancelar` | `fecharConfigLoja()`: o escopo do próprio botão Cancelar não tem o `controller` (medido 2026-10); ela acha o `controller` pelo select Tipo do diálogo, ou clica no Cancelar dele | é a saída de quem só leu; depois, conte os `.ui-dialog` (numa loja, o diálogo saiu do DOM) |
| Administrador › Cache | `Limpar cache` | funcionou; o tipo de disparo não foi anotado | o "Último flush" é indício, não prova (numa loja não mudou depois de uma limpeza que funcionou, 2026-10); a prova é o HTML servido com `?nc=` (seção 5) |

Sobre criar página (`Incluir`): o composto cria em dobro, e um clique real, pela ferramenta, criou uma só
(medido 2026-10); o disparo só por `triggerHandler` não foi medido. O padrão continua sendo a pessoa clicar
em `Confirmar` na criação. Se ela pedir que você crie, nomeando os botões e a página, siga o caminho por
script de `gravacao-arquivo-e-head.md`, "Criar um Arquivo novo": as travas conferem o diálogo, e
`prepararConfirmarCriacao` não clica, só marca o `Confirmar` para **um** clique real seu, pela referência do
elemento. Nunca repita o clique; confira a grade antes de qualquer outro passo (`conferirCriacao`). Se nascer
duplicata, pare: mostre as duas linhas (`#`, URL, Publicada) à pessoa e pergunte qual fica. Despublicar a
sobra é da pessoa: ela clica, e você confere depois; `Excluir` nunca é da skill. (As duas linhas têm a
mesma URL: despublicar a errada, num Arquivo que está no `<head>`, pode deixar no ar a cópia sem o conteúdo
certo, e o CSS ou o JS do site some.)

## 13. Diagnóstico: "mudei e não aparece"

Cache é a causa mais comum, mas não a única. Siga a ordem, que vai do mais barato de conferir ao mais caro,
e pare no primeiro passo que explicar o que a pessoa vê. Pergunte antes de limpar qualquer cache.

1. **Onde mudou.** Qual tela, qual `#`, qual loja? Foi clicado `Confirmar`, ou o diálogo foi fechado por
   `Cancelar` ou ainda está aberto? Numa tela de construtor, `Aplicar` não grava. Num admin com várias lojas,
   a mudança pode ter ido para a página de mesmo nome de outra loja (seção 0).
2. **Gravou?** Feche, reabra e leia o campo (seção 1, "Conferir na fonte"; `gravacao-construtor.md`, passo
   5). Se o valor antigo voltou, não gravou: veja o clique certo (seção 12) e se alguém com o diálogo
   Configurações aberto (em outra aba ou em outro computador) gravou por cima (seção 1).
3. **O servido contém a mudança?** Baixe com uma query nova (`?nc=…`), com User-Agent de computador e de
   celular, e procure um trecho que só existe na versão nova: no arquivo (a URL do Arquivo), no `<style>`
   inline (SCSS de Personalização) ou no `<style id="builder-custom-css">` (CSS de página do construtor).
4. **O `<head>` servido pede o número novo do arquivo?** Se pede o antigo, falta o cache-buster ou o cache de
   configuração (seção 5, camadas 1 e 2). Se o arquivo editado **nem aparece** no `<head>`, ele não está
   ligado no site: é um Arquivo antigo, ou outro com nome parecido (seção 3).
5. **As camadas 2 a 4 de cache** (seção 5): configuração da loja, página, CDN (se a loja tiver um). Numa
   loja com CDN, a query nova do passo 3 já pula a borda: se a origem tem a mudança e a URL sem query não, é
   só esperar a borda. Sem CDN (o perfil diz), não há borda a esperar: com a origem certa, siga para o passo
   6 e, no fim, o 8.
6. **A regra vence?** Se o CSS novo está no servido e a tela não muda, é cascata. Comece pela ordem do
   perfil (seção 10): na família `/dist` o SCSS de Personalização vem depois dos arquivos e ganha empate, e o
   `loja.css` tem `!important` em componentes (medido numa loja); na família `modelo-1` o SCSS vem antes,
   mas uma etiqueta do admin traz a cor num `style` inline (medido numa loja). Nas duas: um script põe
   `style` inline; a cor vem de uma variável CSS da loja; uma chave desbalanceada anula tudo que vem depois
   dela no arquivo; SCSS aninhado num Arquivo servido cru não vale em navegador antigo. Meça com `quemPinta`
   e `bissecta` (`medir-no-navegador.md`, 2 e 3) na página e no aparelho em que a pessoa olhou.
7. **É o aparelho, a página ou o front-end certos?** O celular recebe outro HTML (`isMobile`/`notMobile`),
   e a regra pode ter sido escrita para o outro. A regra pode estar presa a um tipo de página
   (`page-product-list`) ou a uma classe que só existe numa página (a home costuma ter classes só dela).
   Num front-end novo (React), o SCSS de Personalização não era injetado (seção 9). A página pode ser de
   outro sistema, onde o tema nem chega (seção 15). Se a loja tem dois endereços, confira em qual a pessoa
   olhou.
8. **O navegador da pessoa.** Peça para abrir numa aba anônima, ou recarregar sem cache (Ctrl+Shift+R). Se
   lá aparece, era a cópia guardada no navegador dela, e o resto do mundo já vê.

Anote no perfil, em "Manias do tema desta loja", a causa que você achou: na próxima vez, ela é a primeira
suspeita.

## 14. Telas não mapeadas

**Antes: a tela pode existir e só não aparecer para você.** O admin mostra a cada usuário só os sistemas,
telas, abas, botões, campos e lojas que o perfil de acesso dele libera. Se um caminho desta skill não
aparece (um item de menu, uma aba do diálogo Configurações, o `Confirmar`, uma loja no filtro), confira no
perfil, em "Acessos deste usuário no admin", e pergunte à pessoa antes de concluir que a loja não tem
aquilo. Não procure outro caminho até a tela escondida (`SKILL.md`, regra zero).

Estas telas existem e a skill não as mapeou. Use só para **ler**, e com a regra de sempre: abrir para ler é
permitido, a saída é por `Cancelar`, e nada se grava sem o pedido da pessoa e um backup.

- **Loja On-line › Banners.** As artes e os links dos banners. Trocar uma arte, um link ou a ordem é
  **conteúdo**, e é da pessoa; a skill pode ajustar por CSS o que está em volta (setas, bolinhas, espaço: o
  catálogo da família da loja, `catalogo-tema-base.md` ou `catalogo-modelo-1.md`, seções 7 e 11). Para ler:
  filtro Loja = a sua, e anote no perfil os tipos de banner que a home usa.
- **Loja On-line › Menus.** Os itens e a ordem do menu. Mudar o que o menu contém é conteúdo; destacar um
  item por CSS é ajuste (o catálogo da família, seção 2).
- **Loja On-line › Tags, Tags de Produtos e Automação de Tags** (as etiquetas dos produtos). Lidas em parte,
  só a grade de Tags: seção 16.
- **Onde hospedar uma imagem usada num CSS** (um fundo de Natal, um ícone de selo). Não foi medido onde a
  loja pode subir um arquivo de imagem e qual URL ele recebe. Antes de escrever `background-image`,
  pergunte à pessoa onde as imagens da loja ficam (o cadastro de banners e de mídias tem URLs no CDN de
  imagens da plataforma) e use uma URL que ela confirmar. Não aponte para imagem de outro site.

Quando uma dessas telas for mapeada, a seção nova entra no fim deste arquivo.

## 15. Páginas que são outro sistema (Next.js)

Um site twig pode ter endereços que outro sistema da plataforma serve. Medido numa loja da família `modelo-1`
(2026-10): o carrinho (`/finalizar-compra/...`) e `/assistencia/...`. Eles não recebem o tema, e o que se faz
pelo admin para o tema não chega a eles. O reconhecimento acha esses endereços (`reconhecimento-da-loja.md`,
2c e 2d), e o perfil guarda a lista, em "Endereços fora do tema".

Como se reconhece, no HTML servido:

- `<script id="__NEXT_DATA__">`, com a rota no formato `"page":"/<rota>/[[...slug]]"` (medido:
  `/finalizar-compra/[[...slug]]` e `/assistencia/[[...slug]]`);
- folhas e scripts de `cdn.panoramasistemas.com.br/_next/`;
- `<body>` sem classe nenhuma: sem `isMobile`/`notMobile`, sem `page-*` e sem a classe da agenda (`skin-...`);
- sem `#area-body` e sem `#layout-main-content`, e sem nada do "Código dentro do `<head>`" (nem os `<link>`
  da loja, nem as metatags de verificação que estavam lá);
- numa delas, um `<link>` para `/api/loja.css`, e no `__NEXT_DATA__` das duas a chave
  `"modeloScssAfterAll":"/api/loja.css"`. O conteúdo desse arquivo não foi medido: não conte com ele.
- no `__NEXT_DATA__` das duas, outras chaves da configuração da loja, com os valores do admin
  (`layoutPriceMethod`, `layoutPriceOnList`, os modelos de cabeçalho e menu, `headerTopBarShow`): uma leitura
  sem admin, mas de uma cópia servida (`reconhecimento-da-loja.md`, 2d).

O que isso quer dizer para o trabalho:

- **Nada ali se edita por Arquivo, pelo `<head>` ou pela agenda.** Um tema de época, um arquivo de ajuste ou
  uma barra não aparecem nessas páginas. O lado bom: um tema que deu errado também não quebra o carrinho.
- **Diga à pessoa**, em português simples, antes de ela aprovar a prévia: "o tema e os ajustes não chegam ao
  carrinho e a estas páginas; elas continuam como são hoje". Se ela quiser estilo ali, o caminho é o suporte
  da Panorama Sistemas: a skill não mexe.
- **Códigos de terceiros do `<head>`** (pixels, verificações) também não chegam a essas páginas pelo campo
  do admin (medido pelas metatags). Se a pessoa contar com um pixel no carrinho, diga isso a ela: como o
  carrinho é medido é assunto do suporte.
- **Mantenha a exclusão por classe** (`body.page-cart`, `body.page-checkout`) nos CSS e JS de tema: ela é
  inofensiva aqui e vale numa loja em que o carrinho é twig (medido numa loja da família `/dist`).
- **Num tema escuro**, essas páginas continuam claras, e o visitante passa de uma para a outra: mostre isso
  nos prints da prévia.

## 16. Etiquetas: Loja On-line › Tags, Tags de Produtos e Automação de Tags

Lidas numa loja da família `/dist` (2026-10), só leitura e só em parte: a grade de Tags foi lida; os
formulários e as outras duas telas, não. Tudo aqui é **conteúdo da pessoa**: criar, renomear, ligar,
desligar ou mudar uma etiqueta, e pôr ou tirar uma etiqueta de um produto. A skill lê; quem muda é a pessoa.
Leia sempre com o filtro Loja = a sua (o mesmo admin pode atender várias lojas, seção 0).

- **Tags.** A grade lista as etiquetas, com as colunas ID, Código, Nome, Ativo, Texto da Tag e Texto
  Alternativo. A classe que o HTML recebe sai do **Código**, com os acentos (medido: um código com "ç" deu a
  classe `tag-` com o mesmo "ç"; o escape para o CSS está no catálogo da família, seção 5). Mudar o Código
  deve mudar a classe (deduzido, não medido), e o CSS que mirava a antiga para de casar.
- **Uma etiqueta não tem datas.** Não há início nem fim: ela vale enquanto Ativo = Sim, e alguém liga e
  desliga à mão. Uma regra de tema de época presa à classe da agenda e a uma etiqueta só age dentro da janela
  da agenda; antes do `start` e depois do `end`, a etiqueta ativa aparece no lugar e no desenho padrão do tema
  (`temas-sazonais.md`, seção 4, "Etiqueta como gatilho, agenda como interruptor"). Combine com a pessoa
  quem desliga a etiqueta e quando (data, hora e fuso, alinhados com a hora em que a classe do tema sai de
  fato), e anote no perfil.
- **Etiqueta desligada ou renomeada deixa CSS órfão.** Na loja medida, a mesma campanha tinha duas
  etiquetas: uma antiga, inativa, de código sem acento, que o SCSS de Personalização e um arquivo da loja
  ainda estilizavam, e uma nova, ativa, de código com acento, que só o arquivo do tema de época estilizava.
  Uma regra `.tag-…` que não casa com nada costuma ser isso: procure o código na grade antes de concluir.
  Regra dos outros não se apaga: conte à pessoa e anote no perfil.
- **O formulário de uma etiqueta não foi aberto.** Se ele tem campo de posição, de cor ou de ícone no
  front-end twig, não se sabe (o que se leu do front-end novo, em React, está em `armadilhas.md`, 26). Nas
  duas famílias medidas, a cor chegou num `style` inline posto pelo servidor (o catálogo da família, seção
  5). Abrir só para ler é permitido, saindo por Cancelar; anote o que viu.
- **Tags de Produtos.** Pelo nome, o vínculo entre produto e etiqueta, o lugar para listar os produtos que
  têm uma etiqueta. Não foi aberta. Até ser mapeada, a lista dos produtos com a etiqueta X vem da pessoa ou de
  uma amostra dos cards (`reconhecimento-da-loja.md`, 2d, "Produtos com uma etiqueta"), e você diz qual dos
  dois usou.
- **Automação de Tags.** Pelo nome, regras que põem e tiram etiquetas sozinhas. Não foi aberta. Se houver
  uma regra para a etiqueta do pedido, uma etiqueta tirada à mão de um produto pode voltar (não medido):
  pergunte à pessoa antes de contar com ela ligada ou desligada num produto.
