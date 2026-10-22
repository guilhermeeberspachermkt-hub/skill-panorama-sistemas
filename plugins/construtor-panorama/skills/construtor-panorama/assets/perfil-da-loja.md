# Perfil da loja: NOME DA LOJA

<!--
Modelo da skill construtor-panorama. Como usar:
- Copie para ~/.claude/panorama-lojas/<slug-da-loja>.md (no Windows, C:\Users\<usuário>\.claude\panorama-lojas\).
  Nunca dentro da pasta da skill: este arquivo é particular de quem usa e não vai junto quando a skill é compartilhada.
  Se a pessoa restringiu onde você pode gravar ("só nesta pasta"), o perfil, os backups e o trabalho vão para a pasta
  dela: escreva aqui o caminho e a data do combinado (reconhecimento, passo 5).
- Preencha com a configuração inicial (references/primeiro-uso.md): o ambiente (passo 1), as respostas da pessoa
  (passo 2) e o reconhecimento (references/reconhecimento-da-loja.md). Onde não conferiu, escreva "não verificado".
- Resposta que vale só para agora ("só eu mexo no admin agora") vai em "Respostas momentâneas", com data e hora, e
  é perguntada de novo antes da gravação a que se refere. O que ficou sem resposta vai em "Perguntas em aberto",
  com o momento de perguntar e o padrão seguro: nunca um espaço em branco.
- Ponha a data em cada seção. O perfil é um mapa, não uma prova: antes de gravar, reconfira o que muda sem aviso
  (home no ar, cache-buster do arquivo, item ativo da agenda, conteúdo atual do campo).
- No modo guiado (sem ferramenta de navegador), marque o que veio de cópia da pessoa: "copiado pela pessoa em AAAA-MM-DD".
- Escreva cada medida com a página e o aparelho onde foi medida ("na home, computador"). Antes de escrever "no site
  todo", meça em pelo menos dois tipos de página: a home costuma ser diferente (cabeçalho flutuante, classes próprias).
- Os exemplos deste modelo vêm de lojas medidas e de famílias de tema diferentes (marcados como "família /dist" ou
  "família modelo-1"). Anote o que a SUA loja mostrou, nunca o exemplo.
- Uma correção é uma linha nova com a data, não a linha antiga apagada.
- Não guarde aqui senha, token, chave de API nem dado de cliente.
- Pode apagar estes comentários depois de preencher.
-->

## Identificação

Conferido em: AAAA-MM-DD

| Item | Valor |
|---|---|
| Nome da loja (exato, como no admin) | _(pergunta 3 da configuração inicial; se o admin tem várias lojas, qual delas)_ |
| Slug deste perfil | |
| Endereço do admin | `https://admin.SUA-LOJA.com.br` _(pergunta 2; confirmado pela pessoa em AAAA-MM-DD; até ela confirmar: "a confirmar", e nada se grava)_ |
| Host do admin na barra do navegador (o `hostAdmin` de `definirLoja`) | `admin.SUA-LOJA.com.br` _(sem https://)_ |
| Endereço do site no ar | `https://www.SUA-LOJA.com.br` _(pergunta 1; se responde em mais de um endereço, qual é o oficial)_ |
| Domínio como aparece em Único › Lojas (o `dominio` de `definirLoja`) | _(copie exatamente como a grade mostra, com ou sem `www.`)_ |
| Outros endereços que servem a loja | _(pelo 2j do reconhecimento, com a contagem por aparelho: os da loja (subdomínio do site novo, com o front-end que ele serve; host de imagens; um host que só o celular usa), os da plataforma e os de terceiros. "Nenhum outro" só depois do 2j)_ |
| Número da loja no admin (o `loja` de `definirLoja`) | `N` _(coluna `#` de Único › Lojas; o mesmo valor da opção no filtro Loja, snippet C)_ |
| Campo Loja do diálogo Alterar (`ng-model`, o `campoLoja`) | _(snippet F; "não verificado" até a primeira gravação por script. Exemplo do que anotar, como se mediu numa loja da plataforma: "`data.loja`, um único campo, `DIV` sem `value`; `model` = objeto com `id`, `nome`, `url`, `icon`; `id` = número da loja; visto no Alterar de uma página Construtor e de uma Arquivo, AAAA-MM-DD")_ |
| O que esse campo mostra (o `lojaNome`, se não for o número) | _(ex.: "o número, em `model.id`: `lojaNome` não é preciso para o Alterar", ou o nome exato, se só o nome aparecer). O `lojaNome` serve também à tela Administrador › Cache: quando o rótulo do filtro Loja não se lê, as funções do cache conferem o valor da opção junto com esse nome (reconhecimento, 3d). Anote o nome exatamente como a opção do filtro mostra_ |
| Outras lojas no mesmo admin | _(nomes e números; cuidado com nomes de página repetidos)_ |
| Front-end | _(twig / front-end novo em React; por endereço)_ |
| Família do tema (reconhecimento, 2i) | _(`/dist` / `modelo-N` / front-end novo / desconhecida; data)_ |
| Arquivos do tema, com o hash | _(ex.: `.../css/platform.<hash>.css`, `.../css/modelo-1.<hash>.css`, `.../js/modelo-1.<hash>.js`; ou `https://<site>/dist/css/loja.<hash>.css` e `/dist/js/bundle.<hash>.js`)_ |
| Chave `modelo` e modelos de cabeçalho e menu (snippet D, só leitura) | _(ex., família modelo-1: `modelo` = `modelo-1`; `headerModel` N → `inner-body header-N`; `openMenuModel` N; `mobileMenuModel` N; classe `menu-N` no `<body>`. Ex., família /dist, numa loja medida (2026-10): `modelo` = `proprio`, o normal ali, sem contradizer o HTML; `headerModel` ausente; `mobileMenuModel` N → `menuModel-N` no celular. Anote o que o snippet D mostrar, mesmo "ausente"; a família vem do HTML, 2i)_ |
| Endereços fora do tema (outro sistema; reconhecimento, 2c e 2d) | _(ex.: o carrinho e `/assistencia`, Next.js: `<body>` sem classe, sem os arquivos da loja. "Nenhum achado" se o 2d não achou; a pessoa já sabe que o tema não chega lá?)_ |
| Filtros da tela Páginas (rótulos, na ordem; saída de `filtrosDaTela()`, reconhecimento 3b) | _(ex.: "Loja · Nome · URL · Tipo · #" ou "Loja · Nome · URL · SKU · Prod. Ativo · Marca · Tipo, com operador"; tem filtro `#`? sim/não; os produtos aparecem como páginas? Algum filtro é um menu próprio (botão + lista) por cima de um `<select>` escondido? Se `filtrosDaTela()` leu um rótulo como os nomes das opções ou "(incerto)", escreva "mapeado à mão com screenshot, AAAA-MM-DD" e o rótulo que a tela mostra; vale também para o filtro Loja da tela Cache)_ |

`definirLoja` para esta loja (rode de novo depois de cada reload do admin):

```js
definirLoja({ loja: N, hostAdmin: 'admin.SUA-LOJA.com.br', dominio: 'www.SUA-LOJA.com.br' });
// com o campo Loja mapeado: definirLoja({ loja: N, campoLoja: '...', lojaNome: '...', hostAdmin, dominio });
// lojaNome também quando o rótulo do filtro Loja não se lê (tela Cache e, na tela Páginas, conferirUrlLivre e conferirCriacao; reconhecimento, 3d)
```

## Ambiente (configuração inicial, passo 1)

Conferido em: AAAA-MM-DD, neste computador _(noutro computador ou noutro cliente, confira de novo:
`primeiro-uso.md`, passo 1)_

| Item | O que se viu |
|---|---|
| Cliente | _(Claude Code: aba Code do aplicativo ou terminal / Claude no chat / Codex / outro)_ |
| Modo de trabalho | _(completo / guiado, e por quê: "sem ferramenta de navegador", "chat: não entra no admin")_ |
| Ferramenta de navegador | _(extensão do Claude para Chrome conectada / só o painel do aplicativo, sem a sessão do admin / nenhuma)_ |
| O admin abriu logado pela ferramenta? | _(sim, AAAA-MM-DD / tela de login: a pessoa entrou / não testado. Claude nunca digita senha)_ |
| Python | _(versão e o comando que funciona: `python` ou `python3`; "não encontrado": sem prévia nem gravação pelo caminho da skill)_ |
| Node.js | _(versão / não encontrado: os JS ficam sem `node --check`, e os scripts avisam)_ |
| beautifulsoup4 | _(versão / não instalado: só `verificar_paridade.py` precisa)_ |
| curl e rede até o site | _(o código que o site respondeu, com a data; se bloqueado, por quê e o que ficou sem ler)_ |
| Pasta do perfil | _(a padrão, gravável / outra, combinada em AAAA-MM-DD: o caminho. No chat: perfil entregue como arquivo à pessoa)_ |

## Pessoas e combinados

| Assunto | Quem / como |
|---|---|
| Quem pede e aprova alterações | _(pergunta 4; pode ser "eu". O "sim" vale quando chega pela conversa, mesmo que quem aprova seja outra pessoa)_ |
| Quem mais mexe no admin | _(pergunta da hora certa: antes da primeira gravação na configuração da loja. Quem tem acesso e mexe: a loja, a agência, a TI; num admin com várias lojas, também quem cuida das outras. "Alguém editando agora?" não vai aqui: é pergunta de cada gravação, e a resposta vai em "Respostas momentâneas", com a hora)_ |
| Quem decide publicar / despublicar | _(pergunta da hora certa: quando uma tarefa precisar de `Publicar`. Até lá, o padrão "nada se publica". Um pedido para você publicar vale só para a página que ele nomeia, com o botão: anote data e página)_ |
| Quem limpa o cache de configuração da loja (Administrador › Cache › `loja_config`) | _(pergunta 5: a pessoa / Claude com pedido dela / outra pessoa / "não sei". Com "não sei", o padrão "pedir a cada limpeza", nunca em branco. Uma resposta dada na prática ("limpa pra mim") vale para aquela tarefa: anote data e alcance)_ |
| Quem cuida do CDN, se a loja tiver um (o Cloudflare, por exemplo) | _(só se o reconhecimento achou um CDN pelos cabeçalhos, 2b: aí é pergunta do resumo, e costuma ser a TI. Sem CDN identificado: "não se aplica: nenhum CDN identificado pelos cabeçalhos, AAAA-MM-DD". Padrão: no CDN você não mexe)_ |
| Quem cuida de GTM e pixels de anúncio | _(pergunta da hora certa: antes de mexer no `<head>` perto desses códigos; até lá, não se mexe neles)_ |
| Acessos deste usuário no admin | _(o que não aparece para ele, com a data: sistemas, telas, abas, botões, campos, lojas no filtro; ex.: "sem a aba Cabeçalho no diálogo Configurações", "sem `Confirmar` em Páginas". "Tudo o que a skill usa apareceu" se nada faltou. Se o diálogo Configurações deste admin escreve outro rótulo de subaba ou desenha as abas com outro elemento, anote o rótulo e o seletor medidos (`opcoes.aba`, `opcoes.seletorAba` de `injetar.js`); se o `Confirmar` de um diálogo fica fora do `.ui-dialog`, anote com a data da medição (`confirmarForaDoDialogo`). Quem libera acesso: o administrador da conta ou o suporte)_ |
| Página de teste autorizada (para prévias e construtor) | `#NNNNNN` `/url-de-teste` _(pergunta 6, mais as candidatas achadas no reconhecimento, 3b, item 5, e confirmadas pela pessoa, com a data; "nenhuma achada" só depois de procurar)_ |
| Limites combinados | _(pergunta 7: pastas, páginas, telas ou arquivos em que não se mexe ou que não se leem, nas palavras dela, com a data; "nenhum" se ela disse "não". Um veto ao trabalho antigo: o histórico sai do arquivo servido, `primeiro-uso.md`, passo 4, item c)_ |
| Página de controle (publicada, que não se mexe) | `#NNNNNN` `/url` |

Respostas momentâneas _(valem só no momento em que foram dadas: pergunte de novo antes da gravação indicada, e
nunca estenda para outro dia; `primeiro-uso.md`, passo 2)_:

| Data e hora | Pergunta | Resposta, nas palavras dela | Perguntar de novo antes de |
|---|---|---|---|
| AAAA-MM-DD HH:MM | _(ex.: quem mais mexe no admin)_ | _(ex.: "só eu mexo no admin agora")_ | _(ex.: cada gravação na configuração da loja)_ |

Perguntas em aberto _(o que ficou sem resposta, com o momento de perguntar e o padrão seguro que vale até lá)_:

- _(ex.: "quem cuida do CDN: perguntar antes da primeira gravação; até lá, no CDN não se mexe")_

## Home no ar

Conferido em: AAAA-MM-DD _(a home pode mudar sem aviso: reconfira antes de mexer)_

Quantas homes a loja costuma ter: _(uma por campanha ou por mês / uma só, a mesma há tempo; quantas Construtor com URL
`/` existem hoje)_

| # | Nome | Tipo | URL | Publicada | Desde |
|---|---|---|---|---|---|
| `#NNNNNN` | | Construtor | `/` | Sim | |

Ids de bloco (`#block-…`) e classes de bloco que os CSS da loja miram, e se existem nesta home (reconhecimento,
2f): _(arquivo e seção; "existe" / "não existe mais nesta home"; a regra que não casa não se apaga: a pessoa sabe?)_

Homes anteriores (despublicadas) e a "Página Inicial" antiga, se houver:

| # | Nome | Tipo | URL | Observação |
|---|---|---|---|---|
| | | | | |

## Arquivos CSS/JS da loja (Páginas tipo Arquivo)

Conferido em: AAAA-MM-DD

| # | URL | Para que serve | Dono (quem criou / quem cuida) | No `<head>`? | Cache-buster atual | Última seção | Última alteração |
|---|---|---|---|---|---|---|---|
| `#NNNNNN` | `/seu-tema.css` | _(tema sazonal X, ativo com a classe `skin-...`)_ | _(ex.: "Claude, a pedido de <pessoa>, AAAA-MM-DD", confirmado por ela)_ | sim | `?v=N` | _(o número da última seção da versão no ar, ex.: 12; a próxima é 13)_ | AAAA-MM-DD |
| `#NNNNNN` | `/seus-ajustes.js` | _(tudo o que ele faz, não só a parte da tarefa; se mexe em `.promotionBar`, `.header-top-bar`, `<body>`; as datas escritas no código e o que acontece em cada uma)_ | _(ex.: "a loja", "agência X"; ou "origem: não verificada")_ | sim, `defer` | `?updatedNN` | — | |
| `#NNNNNN` | `/tema-antigo.css` | _(fora do ar: não está no `<head>`)_ | | não | — | | |

- **Dono:** pergunte à pessoa por cada arquivo em que a tarefa pode mexer e escreva a resposta com a data
  ("dito pela pessoa em AAAA-MM-DD"). Um arquivo criado por uma sessão anterior do Claude para esta loja só é
  "seu" com essa linha preenchida e confirmada pela pessoa; sem registro, pergunte antes de editar.
- **Última seção** (arquivos de tema com seções numeradas): o número da última seção da versão **no ar**,
  atualizado a cada linha do histórico. Leia no arquivo servido, não na cópia de trabalho: a versão publicada
  pode ter perdido comentários (o `montar_tema.py --base` avisa número repetido). Com os números fora de
  ordem no arquivo, vale o maior (reconhecimento, 2f).
- **No `<head>`?**: _sim_ (com `defer` ou `async`, como o 2f leu do HTML servido), _publicado fora do
  `<head>`_ (o CSS de uma página, chamado por ela ou por um JS), _não publicado_ ou _do sistema_
  (`robots.txt`, `ads.txt`, o manifest, os de `/.well-known/`: não se mexe). Duas linhas com a mesma URL: as
  duas, e qual está publicada.

## Código dentro do `<head>` (Integrações / Plugins › Custom)

Conferido em: AAAA-MM-DD

- Tamanho total: N caracteres; quebras de linha: _(CRLF / LF)_
- Linhas de `<link>`/`<script>` da loja, na ordem (a ordem é a cascata):

```
/arquivo-1.js?updatedNN
/arquivo-2.css?v=N
...
```

- Códigos de terceiros (não mexer sem pedido): _(no campo: pixels, verificações de domínio, metatags...; no
  `<head>` servido e fora do campo, com de onde vêm: uma opção da configuração da plataforma, o GTM, um JS; e
  de quem é cada um. Reconhecimento, passo 4)_
- Linhas comentadas que guardam coisas antigas: _(quais)_

## Ordem da cascata vista no site

Conferido em: AAAA-MM-DD, na página ... _(cole a saída do passo 2e do reconhecimento: a lista e o veredito)_

```
(saída do 2e)
veredito: SCSS antes dos links da loja / SCSS depois dos links da loja
```

- Chave do SCSS de Personalização (snippet G) e tamanho no admin (snippet D): _(ex.: `modeloScssAfterAll`, N chars;
  `modeloScssBeforeAll` vazio)_
- Consequência para um arquivo novo da loja: _(vence o SCSS no empate / perde para ele)_

Os dois exemplos medidos, só para comparar (não copie: cole o da sua loja):

- família `/dist` (uma loja, 2026-10): `platform.<hash>.css` < `loja.<hash>.css` < `<style id="builder-custom-css">`
  < links da loja < `<style>` do SCSS < estilos por bloco. Veredito: SCSS depois dos links da loja.
- família `modelo-1` (uma loja, 2026-10): `platform.<hash>.css` < `modelo-1.<hash>.css` < `<style>` do SCSS <
  Google Fonts < `<style id="builder-custom-css">` < links da loja < estilos por bloco. Veredito: SCSS antes dos
  links da loja.

## Agenda dos temas (Visual › Modelo e Skin › Skin Json Input)

Conferido em: AAAA-MM-DD

A chave `skin` existe? _(sim / não: `lerCampo('skin')` dá `existe: false`, "ausente em AAAA-MM-DD"; é agenda nunca
usada se o campo aparece vazio na tela, na linha abaixo; sem a chave, o primeiro item é colado pela pessoa, e você
confere depois de reabrir)_

O campo Skin Json Input aparece na tela para este usuário? _(sim, vazio: a agenda nunca foi usada / não aparece: pode
ser o perfil de acesso, pergunte e anote em "Acessos deste usuário no admin". Uma chave ausente nos dados sozinha não
diz qual dos dois é; data)_

| name | bodyClass | namespace | start | end | promotionBar | Situação |
|---|---|---|---|---|---|---|
| | `skin-...` | | | | sim / não | _(vale hoje / desligado)_ |

Arquivo CSS que dá o visual de cada `bodyClass`: _(liga com a tabela de arquivos)_

- Item inerte (temas-sazonais.md, seção 2): _(data; formato aceito? a classe apareceu a que horas e saiu a que
  horas, contra o `start` e o `end` em horário de Brasília? diferença do servidor: adiantado/atrasado quanto;
  o `namespace` usado e se mudou algo no HTML)_
- Respostas do suporte da Panorama sobre a agenda: _(data, quem respondeu, o quê)_

## Barras

Conferido em: AAAA-MM-DD

- Barra do Topo (Visual › Cabeçalho): `headerTopBarShow` = `"..."`; texto com N chars; o que está ativo e o que
  está comentado: _(resumo)_
- Viradas da campanha: _(cada data e hora — `start`, `inicio` da barra, trocas de fase, `end` — quem olha o
  site e limpa o cache da home; quem liga e quem desliga a Barra do Topo, e em que data)_
- Barra do Topo no HTML: _(onde fica: `.inner-body > .header-top-bar` ou dentro de `.header-container`; por aparelho)_
- Barra da agenda (`promotionBar`) funciona nesta família? _(sim / não; data e como mediu: `countdown` em algum JS do
  tema? alguma regra para `.promotionBar` no CSS do tema, no SCSS ou nos arquivos da loja? Reconhecimento, 2f)_
- `promotionBar` da agenda: _(aparece? com qual texto? algum JS da loja apaga ou reescreve? qual arquivo e linha)_
- Para onde levam os cliques de cada barra: _(o endereço e o código HTTP de cada um, reconhecimento 2g; link do
  servidor / do texto da Barra do Topo / de um JS da loja. Os que dão 404, a pessoa sabe?)_
- Páginas de campanha citadas (pela pessoa, pelo menu, pelas barras): _(quais respondem 200 e quais dão 404;
  data)_

## Logo (Visual › Logo e Ícone)

Conferido em: AAAA-MM-DD

- `svgLogo`: N chars; tem `<g>`? _(sim/não)_; classes internas: _(ex.: `.st0` texto, `.st1` símbolo)_
- `<style>` interno no SVG? _(sim/não; que classes ele pinta, ex.: `.cls-1`; ele vale para a página inteira)_
- O mesmo SVG aparece em que lugares? _(ex.: cabeçalho e rodapé; outro SVG da página usa a mesma classe?)_
- Logo sobre a cor primária (`svgLogoContrast` / `svgIconContrast`): _(vazio / N chars)_
- Regras de CSS que dependem dessas classes: _(arquivo e seção; revisar se o logo for trocado)_

## Cache e CDN

Conferido em: AAAA-MM-DD

| Camada | Valor medido nesta loja | Quem limpa |
|---|---|---|
| CDN identificado pelos cabeçalhos (reconhecimento, 2b) | _(sim: qual, por qual cabeçalho, ex.: `cf-cache-status` = Cloudflare / não identificado: ex.: só `server: Apache` e `cache-control: private`. Sem CDN, a parte da borda na linha do HTML e a linha "Queries no CDN" ficam "não se aplica")_ | |
| Arquivos CSS/JS: `max-age` medido (reconhecimento, 2f) | `Cache-Control: max-age=...` _(medidos: 86400 numa loja, 1800 noutra)_; `stale-while-revalidate`, se houver; `Age` visto na borda, se houver CDN: ... | subir o cache-buster no `<head>` |
| Configuração da loja | linha `loja_config` existe? último flush visto: ... _(com o filtro Loja = a sua e uma linha só; sem o filtro pode aparecer outra `loja_config`; valor da opção da loja no filtro: `string:N` ou `number:N`. O "Último flush" é indício: numa loja ele não mudou depois de uma limpeza que funcionou; a prova é o `<head>` servido com `?nc=`. As funções do cache funcionaram nesta tela? Se abortaram por não ler o rótulo do filtro, anote e passe `lojaNome`)_ | |
| Página | modal de confirmação apareceu? _(sim/não)_ | |
| HTML das páginas (e a borda, se houver CDN) | home `max-age=...`; categorias `max-age=...`; `private`? _(só o navegador guarda)_; varia por User-Agent? _(com CDN: a cópia do celular atrasou depois de uma mudança? quanto, pelo `Age`; data)_ | |
| Queries no CDN (só com CDN; reconhecimento, 2b; opcional) | _(`?nc=` / `utm_*` / `gclid` / `fbclid`: `MISS`, `BYPASS` ou `HIT`; data)_ | _(as regras são da TI)_ |

## Medidas do tema desta loja

Conferido em: AAAA-MM-DD _(sempre no navegador, com `getComputedStyle`; o arquivo CSS não basta. Na coluna "Onde
mediu", a página e o aparelho; antes de escrever "no site todo", meça em pelo menos dois tipos de página)_

| Medida | Valor | Onde mediu |
|---|---|---|
| Cor do link no miolo (para `--cor-link` dos scripts) | `#RRGGBB` | _(página e aparelho)_ |
| Fundo do `<body>` | `#RRGGBB` | _(por front-end, se houver dois)_ |
| Tamanho de fonte do `<body>` e do `<p>` | | |
| Fontes usadas (texto, títulos, selos) | | |
| Cores da marca (principal, botão, preço) | | |
| Cores do tema de época ativo (as mais repetidas no CSS dele; reconhecimento, 2h) | | _(arquivo e data)_ |
| Cabeçalho (altura) e contêiner do miolo (largura) | | _(home e produto; computador / celular)_ |
| Elementos fixos na tela e o `z-index` de cada um (WhatsApp, avisos de cookies e do app, barras) | | _(página e aparelho)_ |
| Variáveis CSS da loja que importam (`variaveisCss()`) | _(ex.: `--primary-color` = `#RRGGBB`)_ | |
| Opções nativas que substituem CSS (snippet G: rótulo, subaba, chave) | | |
| Seletores medidos (página do produto, botão Comprar, preços) | | _(computador / celular)_ |
| Rolagem lateral sem a prévia (linha de base) | _(por largura: 1920 / 1366 / 1280 / 1100 / 1024 / celular; `medir-no-navegador.md`, 6; data)_ | _(página)_ |
| Preço principal do card (`layoutPriceMethod`; snippet D, ou o `__NEXT_DATA__` de uma rota Next.js, reconhecimento 2d) | _(o valor da chave e o preço que o card mostra em destaque; ex., numa loja medida: `pix`, o preço do PIX/boleto, com o do cartão no parcelado. Ex. de outra, família /dist: "ausente no admin; padrão da plataforma `default` e `1`, pelo `__NEXT_DATA__`; o card mostra em destaque o preço ...")_ | _(um selo de % calculado do card é sobre este preço: `temas-sazonais.md`, 8)_ |
| Preços da página do produto, principal / secundário (`productPageMainPrice` / `productPageSecondaryPrice`; snippet D, e Visual › Página do Produto na tela) | _(o que a tela escreve e o valor da chave; e qual a página mostra primeiro. Ex., numa loja medida: Tabela Preço / Pix, com o preço do Pix mostrado primeiro)_ | _(um pedido "junto do preço" na página do produto diz de qual dos dois; página e aparelho)_ |
| Como quem aprova vê o site (janela em px CSS, zoom do Chrome na origem do site, `devicePixelRatio`, celular que usa) | _(ex.: "janela de ~2.133px CSS numa tela de 1920, zoom 90%, `devicePixelRatio` 0,9", medido numa loja; `comoAPessoaVe`, `medir-no-navegador.md`, 13)_ | _(data; aba da extensão ou perguntado a ela)_ |

## Etiquetas que o tema ou os seus arquivos estilizam (Loja On-line › Tags)

Conferido em: AAAA-MM-DD _(só quando um pedido envolve uma etiqueta; grade de Tags com o filtro Loja = a sua,
reconhecimento 3b, item 4; `mapa-do-admin.md`, seção 16)_

| Código | ID | Ativa? | Classe gerada | Onde o CSS a usa | Quem desliga e quando |
|---|---|---|---|---|---|
| _(como na grade, com acento)_ | | _(sim / não)_ | `tag-...` _(com o mesmo acento)_ | _(arquivo e seção; SCSS de Personalização; "nenhum")_ | _(quem, data, hora e fuso, alinhados com a hora em que a classe do tema sai de fato: `temas-sazonais.md`, 4)_ |

- Etiquetas parecidas (com e sem acento, uma antiga inativa) e regras que não casam com nada (CSS órfão): _(quais,
  em que arquivo; regra dos outros não se apaga: a pessoa sabe?)_
- Produtos com a etiqueta usados como páginas-alvo, e como foram achados: _(lista da pessoa / amostra dos cards da
  busca e das listas; a amostra não é a lista inteira)_

## Campanhas e decisões da pessoa

_(Calendário das campanhas, com datas e horários de início e fim; e decisões que valem até segunda ordem, com
a data em que foram tomadas. Exemplos de tipo: "não fixar a Barra do Topo por enquanto", "não mudar a ordem
da home", "o selo de desconto fica como está", "selo de % calculado: desligado / sobre o preço do cartão / com 'no
PIX'", "texto decorativo da campanha só na home", "lembrada de que a contagem nova ficou mais visível; manteve os
segundos", "direções de estilo mostradas: A, B e C; escolheu B". O que ela ainda não decidiu também entra, como
pendente, com o padrão que vale até lá.)_

- AAAA-MM-DD: ...

## Manias do tema desta loja

_(Tudo o que já surpreendeu uma vez, com data e onde foi visto. Exemplos de tipo: uma regra do SCSS de
Personalização que vaza margem; uma regra do CSS do tema com `!important` que só cede com `!important`; uma
cor posta pelo admin num `style` inline; um JS que apaga uma barra; uma classe gerada pela plataforma com acento;
listas que congelam a altura dos cards; um carrossel que mede antes da prévia; a sessão do admin que expira de um
dia para o outro. Os problemas do site achados de passagem, com o número medido, também vão aqui:
`criterios-de-design.md`, 3.)_

- AAAA-MM-DD: ...

## Pastas: backups e trabalho

- Combinado com a pessoa em AAAA-MM-DD: _(a pasta padrão, testada na configuração inicial, `primeiro-uso.md`, 1d / a
  pasta que ela indicou, com a restrição dela, se houver: "grave só em ...")_.
- Backups: `~/.claude/panorama-lojas/<slug>/backups/` _(ou outra combinada com a pessoa)_. Nome dos
  arquivos: `<campo-ou-arquivo>-ANTES-AAAA-MM-DD.<ext>` (um por gravação, antes de gravar).
- Trabalho: `~/.claude/panorama-lojas/<slug>/trabalho/` _(ou outra combinada)_. As seções de CSS, as versões
  inteiras de cada arquivo (`-v1`, `-v2`…; de cada uma, a de trabalho, comentada, e a de publicar), os scripts
  de montagem, os favoritos de prévia e os prints de antes e depois. O que um agente auxiliar deixou numa pasta
  temporária (direções, prints) vem para cá antes de ser mostrado à pessoa: uma pasta temporária pode ser limpa.
- Gravações fora dessas pastas, ditas à pessoa antes: o pacote de funções no `localStorage` da aba do admin
  (`__pano_bundle`), as chaves que você criou no `localStorage` do site _(liste)_ e as cópias de screenshots que a
  ferramenta do agente guarda sozinha _(onde, se souber)_. Apagadas no fim? _(data; nunca as chaves da pessoa)_
- O que mudou, quando e como voltar vai no histórico abaixo, e não num arquivo solto.

## Histórico de alterações

| Data | O que mudou | Onde (tela, campo, `#`) | sha publicado (e o da versão de trabalho) | Backup do antes | Como desfazer | Conferido no ar |
|---|---|---|---|---|---|---|
| AAAA-MM-DD | _(num arquivo de tema com seções: "seção N acrescentada; última seção agora N", e a coluna "Última seção" da tabela de arquivos atualizada)_ | | _(sha256 da versão de publicar, a mesma da prévia aprovada; entre parênteses, o da versão de trabalho, a comentada)_ | | | _(computador / celular)_ |
