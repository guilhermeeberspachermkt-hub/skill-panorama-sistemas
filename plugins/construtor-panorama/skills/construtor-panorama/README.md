# construtor-panorama: uma skill para lojas da Panorama Sistemas (Claude e Codex)

Esta pasta é uma **skill**: um conjunto de instruções e scripts que o Claude lê quando você pede ajuda com o
site da sua loja na plataforma Panorama Sistemas. Com ela, o Claude sabe onde fica cada coisa no admin, como
mudar o visual sem quebrar o resto do site e como conferir que a mudança entrou no ar.

Ela foi feita e testada no Claude, e o Codex (da OpenAI) lê skills no mesmo formato. Onde este texto diz
"o Claude", no Codex leia "o Codex". O que muda no Codex está em "Do que você precisa" e "Como instalar".

Ela foi escrita a partir de trabalho real em lojas da plataforma, com tudo o que deu errado no caminho
anotado para não se repetir. Não traz dados de nenhuma loja: na primeira vez que você usar, o Claude
descobre os dados da **sua** loja e guarda num arquivo só seu.

**Sobre o nome.** Ela nasceu para montar páginas no **construtor** de páginas da Panorama e cresceu para os
ajustes visuais em geral, os temas de época e as telas de configuração. O nome ficou, para quem já a tinha
instalada não perder nada numa atualização.

## Seis palavras que aparecem muito

- **Admin**: o site onde você entra com login e senha para cuidar da loja (páginas, produtos, configuração).
- **Arquivo CSS**: um arquivo com as regras de aparência (cores, tamanhos, espaços). No admin da Panorama,
  ele é uma página do tipo "Arquivo".
- **`<head>`**: a parte invisível do topo de cada página do site, onde a loja diz quais arquivos o
  navegador deve carregar. No admin, é o campo "Código dentro do `<head>`".
- **Cache**: uma cópia guardada para o site abrir rápido. É por causa dela que uma mudança pode demorar a
  aparecer.
- **CDN**: um serviço que algumas lojas põem na frente do site para guardar cópias das páginas perto de quem
  visita (o Cloudflare é um deles). Nem toda loja tem um; o Claude descobre se a sua tem.
- **Prévia**: a mudança mostrada no site de verdade, só no seu navegador, sem gravar nada.

## O que ela ajuda a fazer

- **Ajustes visuais em geral:** cor, fonte, tamanho e espaço; botões; cards de produto; selo de desconto;
  menu, cabeçalho e rodapé; banners; avisos de cookies; o visual no celular.
- **Páginas do construtor:** criar, editar ou refazer uma página (seções, vitrines, banners, perguntas
  frequentes, grids), inclusive migrar uma página do site antigo para o novo.
- **Imagens e banners:** subir ou trocar a arte de um banner e a imagem de um bloco, criar um tipo de banner,
  hospedar uma imagem usada num CSS e conferir se ela sai nítida no computador e no celular. A arte, o texto,
  o link e as datas são seus; o Claude conhece o caminho no admin e faz os passos quando você pede.
- **Temas de época:** Black Friday, Natal, Esquenta, Dia das Mães; a agenda de skins; a barra promocional com
  contagem; a Barra do Topo.
- **Telas de configuração da loja:** o código do `<head>`, o logo, o SCSS de Personalização, os arquivos CSS
  e JS do site, e descobrir qual página é a home no ar.
- **"Mudei e não aparece":** quais caches existem, em que ordem limpar e quem limpa cada um.

## Do que você precisa

- **O Claude Code**, na aba Code do aplicativo do Claude para computador ou no terminal, **com a extensão do
  Claude para Chrome conectada**, e você logado no admin da loja nesse Chrome. Foi assim que a skill foi
  desenhada e testada: o Claude lê e grava no admin, roda os scripts e guarda o perfil da loja no seu
  computador. Você mesmo entra no admin; o Claude nunca digita senha.
- **Sem a extensão, ou em outro lugar, a skill funciona em modo guiado**: o Claude prepara e confere cada
  mudança, e você faz os cliques no admin, com a lista que ele passar.
  - **No chat do Claude** (claude.ai, ou o aplicativo fora da aba Code), a skill roda numa máquina na nuvem,
    sem acesso ao seu computador nem ao seu admin: o Claude explica, escreve o código, gera a prévia e guia
    você, mas não grava no admin sozinho. Se a máquina da nuvem não alcançar o site, ele pode pedir que você
    mande o código da página (Ctrl+U no Chrome, copiar e colar). O perfil da loja vem como um arquivo para
    você baixar e guardar: anexe-o no começo da próxima conversa. O chat com a extensão do Chrome não foi
    testado com esta skill.
  - **No Codex** (da OpenAI), que lê skills no mesmo formato, o admin depende de uma ferramenta de navegador
    que rode as conferências da skill dentro da página: a extensão do ChatGPT para Chrome (no aplicativo do
    ChatGPT, em Configurações › Computer Use) ou um servidor MCP de navegador. Na primeira vez, a skill testa
    o que a ferramenta consegue fazer e diz; sem ela, o admin vai pelo modo guiado. Por padrão, o Codex
    bloqueia a internet e a gravação fora da pasta aberta: ele vai pedir a sua permissão para ler o site e
    para guardar o perfil. Para pedir menos, abra o Codex com a pasta `panorama-lojas` (abaixo) como pasta do
    projeto. No Codex, numa loja real, foram testadas a configuração inicial, as leituras do admin e uma
    gravação por script numa página que não aparece no site, conferida pelo sha.
- **Login no admin da sua loja.** Se você não tem, ou não sabe o endereço do admin, peça a quem cuida da loja
  (a agência, a TI) ou ao suporte da Panorama Sistemas.
- **Python 3**, para gerar a prévia e conferir o que vai ser gravado. Sem ele dá para conversar sobre o que
  mudar e receber um passo a passo de cliques, mas não para mandar uma prévia nem gravar pelo caminho da
  skill. O pacote `beautifulsoup4` (`python -m pip install beautifulsoup4`) só serve ao script que compara
  páginas do construtor (`verificar_paridade.py`); para ajustes visuais e temas, não precisa. O Node.js é
  opcional: ele confere o código JavaScript antes de gravar, e sem ele os scripts avisam. Com o Node 22 (ou
  mais novo) e o Google Chrome instalados, o Claude tira os prints e as medidas da prévia num Chrome próprio,
  que não usa a sua sessão: nas cópias salvas das páginas, sem rede, em segundos, e no site só para a
  conferência final, uma página por vez e com pausa entre elas (para o CDN da loja não bloquear o seu
  computador). O pacote `pillow` (opcional) monta os quadros de comparação e mede o foco de teclado.

Não precisa conferir nada disso sozinho: na primeira vez, o Claude confere e diz o que falta (veja "O primeiro
uso").

## Como instalar

**Copiando a pasta.** Copie a pasta `construtor-panorama` inteira (com `SKILL.md`, `references`, `scripts` e
`assets`) para a pasta de skills do Claude:

- Windows: `C:\Users\<seu usuário>\.claude\skills\construtor-panorama\`
- macOS e Linux: `~/.claude/skills/construtor-panorama/`

Se a pasta `skills` não existir, crie. Depois, abra uma conversa nova do Claude Code: a skill entra sozinha
quando o pedido for sobre o site ou o admin da loja.

**No Codex**, a pasta de skills pessoais é `~/.agents/skills/` (no Windows,
`C:\Users\<seu usuário>\.agents\skills\`): copie para lá a pasta `construtor-panorama` inteira, ou peça ao
próprio Codex, com o `$skill-installer`, que instale a skill a partir do endereço desta pasta no GitHub. A
skill se chama com `$construtor-panorama` no começo da mensagem ou pela lista de `/skills`. Se ela não
aparecer, feche e abra o Codex. A instalação como plugin, pelo catálogo, está no README do repositório.

**Pelo pacote `.skill`.** Se você recebeu um arquivo `construtor-panorama.skill`, instale pelo lugar onde o seu
Claude gerencia skills, ou descompacte o arquivo (é um zip) e copie a pasta como acima.

**Para atualizar**, substitua a pasta pela versão nova. O perfil da sua loja não fica dentro dela, então não
se perde.

## O primeiro uso

Comece com esta mensagem (pode copiar e colar; no Codex, ponha `$construtor-panorama` antes):

> Quero usar a skill construtor-panorama com a minha loja na Panorama Sistemas. Comece pela configuração
> inicial: veja o que está instalado aqui, me faça as perguntas de uma vez e olhe a loja só para ler, sem
> mudar nada no site nem no admin. Antes de qualquer mudança, me mostre o resumo do que você achou.

Se você chegar direto com um pedido ("quero o botão de comprar verde"), o Claude faz a configuração inicial
antes, do mesmo jeito. Ela tem cinco passos, e nenhum muda nada na sua loja:

1. **O Claude confere o que tem à mão**: em qual Claude está rodando, se a extensão do Chrome está conectada e
   o admin abre com você logado, se o Python e o Node estão instalados, se ele consegue guardar o perfil da
   loja no seu computador e se consegue ler o site. Ele diz o que falta e como resolver.
2. **Ele faz sete perguntas, numa mensagem só**: o endereço do site, o endereço do admin e o nome da loja como
   aparece no admin (estas três são necessárias); quem aprova as mudanças (pode ser "eu"); quem limpa o cache
   da loja no admin ("não sei" vale); se há uma página de teste ("não tenho" vale); e se há algum limite,
   pastas, páginas, telas ou arquivos em que ele não deve mexer ou que não deve ler ("não" vale). Uma resposta
   que vale só para agora ("só eu mexo no admin agora") ele anota com a data e pergunta de novo antes de
   gravar.
3. **Ele olha a loja só para ler**: o site, no computador e no celular (quais arquivos de estilo a loja usa,
   qual família de tema da plataforma serve o site, qual tema de época está ativo, quais barras estão
   ligadas, se a loja tem um CDN na frente do site) e, com você logado, as telas de Lojas, Páginas e Cache do
   admin, sem gravar nada.
4. **Ele mostra um resumo do que achou e espera você corrigir**, antes de qualquer prévia ou mudança: o que não
   conseguiu ver no admin (pode ser falta de acesso do seu usuário), as páginas de teste que achou e as
   perguntas que ficaram em aberto.
5. **Ele avisa que está pronto**, com o que consegue fazer daí, alguns exemplos de pedido e as regras de
   segurança que segue.

O que ele aprende fica num **perfil da loja**, em `~/panorama-lojas/<nome-da-loja>.md` (no Windows,
`C:\Users\<seu usuário>\panorama-lojas\`), ou noutra pasta que vocês combinarem. Nas próximas vezes ele
lê esse perfil e só reconfere o que muda com frequência (qual home está no ar, o número de versão dos
arquivos). Até a versão 1.2.0, a pasta padrão era `~/.claude/panorama-lojas/`: se você já tem essa pasta, a
skill continua usando ela, e não precisa mover nada.

## Como é um pedido típico

1. Você diz o que quer mudar.
2. O Claude mostra uma **prévia** no site de verdade, sem gravar nada: um favorito do navegador que liga e
   desliga a mudança só na sua aba, e prints de antes e depois no computador e no celular.
3. Você olha e responde "aprovado", ou pede ajustes (cada ajuste gera uma prévia nova).
4. Só depois do "aprovado": o Claude guarda uma cópia do que está no ar (o backup), grava a mudança no admin,
   reabre a tela para conferir e passa pelos caches.
5. Ele confere no site, no computador e no celular, e anota no perfil o que mudou, onde está o backup e como
   desfazer.

Se você preferir fazer a mudança com as suas mãos, peça os passos: o Claude descreve os cliques com os nomes
que aparecem na tela.

Para uma mudança de estilo maior ("mais moderno", "mais agressivo", "dar uma estilizada no layout"), o
Claude mostra antes 2 ou 3 direções, com prints de cada uma, e você escolhe.

## Segurança: o que a skill faz para proteger a sua loja

O admin da Panorama é o site no ar. Não há ambiente de teste, e a skill não conta com o admin para voltar
atrás: as páginas do construtor têm um histórico de versões (o botão `Log`), mas o que ele guarda e restaura
ainda não foi medido, e no resto do admin ela age como se não houvesse histórico nenhum. Por isso a skill
segue algumas regras, mesmo quando você está com pressa:

- **Nada é gravado sem o seu "sim"** sobre aquela mudança específica, depois de ver a prévia (numa página do
  construtor, a prévia é uma página de rascunho que vocês combinam antes; uma mudança que não aparece no site
  vai com a explicação do que muda e o seu "sim").
- **Backup antes de toda gravação**, num arquivo no seu computador, com a data no nome. É o que permite
  voltar atrás.
- **Publicar** páginas e as operações em massa do admin só acontecem se você pedir, nomeando o botão e a
  página. Um "aprovado" sobre a prévia não aperta botão nenhum. Com o seu pedido, o Claude pode criar um
  arquivo novo e clicar em Publicar nele, um clique de cada vez, depois de conferir a linha e a pergunta do
  admin. **Excluir, Despublicar e Restaurar Versão** (no histórico de versões de uma página) ficam com você:
  você clica, e o Claude confere depois.
- **Só o que você nomeou.** Se não ficar claro em qual página ou arquivo mexer, o Claude pergunta em vez de
  escolher um "parecido". Ele identifica as páginas pelo número (`#`) e confere a loja, porque um mesmo admin
  pode ter várias lojas com páginas de nomes iguais.
- **Configuração da loja vale para o site inteiro.** Antes de gravar nela, o Claude pergunta se alguém (você
  ou outra pessoa da loja) está com a tela de Configurações aberta, em outra aba ou em outro computador: quem
  confirmar depois, ali, desfaz a mudança sem perceber.
- **Senhas e dados de clientes ficam fora.** Você faz o login; nada disso vai para o perfil.
- **O seu carrinho e a sua conta no site são seus.** Para testar a aparência, o Claude não põe produto no seu
  carrinho a não ser que você diga que pode, tira depois o que pôs e nunca vai além do carrinho: nada de
  finalizar compra, pagar ou mexer nos dados da sua conta. Antes disso, ele prefere uma simulação ou um
  print que você mesmo tire.
- **Se o Claude não achar uma tela do admin**, ele pergunta se o seu usuário tem acesso a ela, em vez de
  procurar outro caminho. Quem libera acesso é o administrador da conta ou o suporte da Panorama Sistemas.

O que vale a pena você saber:

- **Caches atrasam o que você vê.** Uma mudança leva de segundos a alguns minutos para aparecer depois que os
  caches certos são limpos. Sem limpar, ela pode não aparecer nunca (o cache da configuração da loja não
  expira sozinho) ou demorar de minutos a dias, conforme a loja (um arquivo CSS/JS sem número novo no
  `<head>`). O Claude diz qual cache falta limpar e quem costuma limpar cada um (às vezes é você; se a loja tiver
  um CDN na frente do site, como o Cloudflare, a TI que cuida dele).
- **Conteúdo é decisão sua.** Preço, promessa de desconto, contagem regressiva e texto de garantia são da loja.
  Se o Claude achar que algo pode confundir o cliente, ele avisa, e a decisão continua sua.
- **O perfil da loja é particular.** Ele fica fora da pasta da skill de propósito. Se você compartilhar a skill
  com outra pessoa, compartilhe só a pasta `construtor-panorama`, não a pasta `panorama-lojas`.

## O que tem na pasta

| Arquivo | O que é |
|---|---|
| `SKILL.md` | A porta de entrada: regras de segurança, o perfil da loja e para onde ir em cada tipo de pedido. |
| `references/primeiro-uso.md` | A configuração inicial: o que o Claude confere, as sete perguntas, o resumo e o "pronto". |
| `references/reconhecimento-da-loja.md` | O reconhecimento da loja, só de leitura, passo a passo. |
| `assets/perfil-da-loja.md` | O modelo do perfil da loja. |
| `assets/prints-chave.txt`, `assets/plano-revisao.mjs` | Os modelos da lista de prints de uma prévia e do plano de revisão da versão escolhida. |
| `references/ajustes-visuais.md` | Ajustes visuais por CSS, do diagnóstico até ir ao ar e à volta. |
| `references/catalogo-tema-base.md` | As partes do tema da família `/dist` (`loja.css` + `bundle.js`: menu, card, selo, barras...), as partes da plataforma comuns às famílias medidas, e o que já deu errado em cada uma. No topo, a tabela de qual catálogo usar em cada família. |
| `references/catalogo-modelo-1.md` | As partes do tema da família `modelo-N` (medido no `modelo-1`), com a mesma numeração de seções. |
| `references/medir-no-navegador.md` | Os trechos que o Claude usa para medir o site no navegador, inclusive a varredura de contraste (o texto que sumiu num fundo novo), a contraprova (a diferença veio do CSS ou do JS da prévia?) e como você vê o site (a largura da sua janela e o zoom do seu navegador), e o deslocamento na carga (a página pula enquanto carrega?). |
| `references/criterios-de-design.md` | O tom da marca, acessibilidade, o que é decisão sua e como o Claude propõe uma mudança de estilo maior (2 ou 3 direções, para você escolher). |
| `references/temas-sazonais.md` | Temas de época, agenda de skins e barras promocionais. |
| `references/mapa-do-admin.md` | Onde fica cada coisa no admin, fora do construtor, as camadas de cache e o que fazer quando "mudei e não aparece". |
| `references/previa.md` | Como a prévia é feita e como você a liga no seu navegador. |
| `references/construtor.md` | Páginas do construtor: regras e fluxo completo. |
| `references/blocos.md`, `exemplo.md`, `armadilhas.md` | Catálogo de blocos, um exemplo completo e os problemas já encontrados. |
| `references/imagens-e-banners.md` | Imagens e banners: os cadastros (Mídias, Tipos de Mídia, Tamanhos, Tipo de Banner, Banners), subir ou trocar uma arte, o endereço das imagens no CDN (para usar num CSS), testar num clone da página, o cache dos banners e a nitidez. |
| `references/gravacao-construtor.md` | Como o Claude grava uma página do construtor e confere a gravação. |
| `references/gravacao-arquivo-e-head.md` | Como o Claude grava os arquivos CSS/JS e a configuração da loja, e como você grava à mão. |
| `references/ferramentas-de-navegador.md` | Limites da ferramenta de navegador, para o Claude não confundir com defeito do site. |
| `scripts/` | Os scripts de prévia (`gerar_previa.py`), de montagem e conferência de um CSS de tema (`montar_tema.py`) e da versão enxuta de um tema comentado (`enxugar_tema.py`), de validação (`validar_pagina.py`) e de conferência (`verificar_paridade.py`) das páginas do construtor, e as funções usadas no admin (`injetar.js`). Os de prints e medidas num Chrome próprio (`salvar_copia.mjs`, `shot.mjs`, `rodada.mjs`, `larguras.mjs`, `rev.mjs` e os que eles carregam na página), os que provam que duas versões de um CSS dão a mesma tela (`conferir_css.mjs`, regra a regra; `conferir_troca.mjs`, no site, na mesma carga) e os de conferir os prints (`pares.py`, `comparar_prints.py`). Cada um mostra o uso com `--help`. |

## Limites conhecidos

Algumas coisas da plataforma ainda não foram medidas e estão marcadas assim nos arquivos: o fuso horário da
agenda de skins, qual item vence quando dois temas se sobrepõem, e o que o campo `namespace` da agenda faz
(a skill mede o fuso e o efeito do `namespace` com um teste que não muda o site, evita que dois temas se
sobreponham e sugere perguntar ao suporte da Panorama). Também não foram mapeadas a tela de Menus nem a
página do produto, medida só em parte (nas duas famílias, uma loja cada): nelas o Claude só lê e mede antes
de propor. As telas de Banners e Tipo de Banner foram mapeadas em 2026-11-06 em duas lojas, uma de cada
família; as de Mídias (com Tipos e Tamanhos de Mídia), no mesmo dia, só na loja da família `/dist`. O que
ficou de fora delas está no fim de `references/imagens-e-banners.md`. As telas de etiquetas (Tags) foram só
lidas, não mapeadas campo a campo.

A plataforma tem mais de uma família de tema, isto é, mais de um conjunto de arquivos que dá a aparência
ao site. A skill foi medida em duas (a `/dist` e a `modelo-1`), cada uma numa loja. Elas diferem em coisas
que importam: a ordem em que os estilos se aplicam, onde fica a Barra do Topo, como o selo de desconto é
pintado, se a barra promocional da agenda funciona. Por isso o reconhecimento descobre a família da sua loja
antes de tudo. Noutra família, ou num tema muito personalizado, nenhum catálogo vale inteiro: o Claude mede
cada seletor no seu site antes de usar, e a prévia mostra o resultado antes de gravar. Algumas páginas podem
ser de outro sistema da plataforma (numa loja medida, o carrinho): o tema e os ajustes não chegam a elas, e
o Claude diz quais são.

A skill foi testada no Claude Code com a extensão do Claude para Chrome, em duas lojas. No chat do Claude ela
não foi testada, e funciona em modo guiado. No Codex, com a extensão do ChatGPT para Chrome, foram testadas
numa loja real a configuração inicial, as leituras do admin e uma gravação por script numa página que não
aparece no site, conferida pelo sha. Sem uma
ferramenta de navegador que rode as conferências dentro do admin, ela funciona em modo guiado. Nem toda loja
tem um CDN na frente do site: o
reconhecimento mede, e os passos de cache valem com ou sem ele.

Esta skill não é um produto da Panorama Sistemas e não substitui o suporte da plataforma.
