# Changelog

As mudanças de cada versão ficam aqui, da mais nova para a mais antiga. As versões seguem o
[Versionamento Semântico](https://semver.org/lang/pt-BR/): o primeiro número muda quando algo deixa de
funcionar como antes, o segundo quando entra algo novo, o terceiro numa correção.

A cada versão, suba também o `version` de `plugins/construtor-panorama/.claude-plugin/plugin.json` (Claude
Code) e de `plugins/construtor-panorama/plugin.json` (Codex), os dois com o mesmo número (sem isso, quem já
instalou não recebe a atualização); depois do commit, confira com
`claude plugin tag --dry-run plugins/construtor-panorama`.

## [1.3.0] - 2026-11-05

O Codex, da OpenAI, como segundo cliente. O formato da skill já era o que o Codex lê; esta versão acrescenta
o catálogo e o manifesto do plugin para ele, tira da skill o que só fazia sentido no Claude e diz o que a
skill precisa de uma ferramenta de navegador. Testada no Codex numa loja real, com a extensão do ChatGPT para
Chrome: a configuração inicial, as leituras do admin, uma gravação por script num Arquivo despublicado
(conferida pelo sha) e um pedido de propostas para as listas de produto, do rascunho à revisão profunda, sem
gravar nada. Ainda não medidos no Codex: o clique em `Publicar` ou na criação por script, a limpeza de cache,
a gravação do `<head>` e da configuração da loja, e uma gravação numa página que está no ar.

### O que mudou

- **Instalação no Codex:** o catálogo `.agents/plugins/marketplace.json` (o Codex também lê o
  `.claude-plugin/marketplace.json`, como formato compatível), o manifesto `plugins/construtor-panorama/plugin.json`
  no formato portátil, com o nome, a descrição, os pedidos de exemplo e o ícone que o Codex mostra
  (`assets/icon.svg`), e o `agents/openai.yaml` da skill, para quem copia só a pasta. O README tem os três
  jeitos de instalar no Codex: o plugin pelo catálogo, o `$skill-installer` e a cópia da pasta.
- **A pasta das lojas:** a padrão passa a ser `~/panorama-lojas/`, que não depende do cliente. Quem já tem
  `~/.claude/panorama-lojas/` continua nela, sem mover nada (`SKILL.md`, "A pasta antiga"); os trechos de
  terminal do primeiro uso e do reconhecimento escolhem a antiga quando ela existe.
- **O que a skill precisa do navegador** (`primeiro-uso.md`, 1b): uma tabela de capacidades (abrir aba no
  Chrome logado, rodar JavaScript na página e receber o valor, clique de verdade, enviar arquivo, print), o
  que cada uma permite e o que fazer sem ela, com um teste de uma linha para a principal. Sem "rodar
  JavaScript e receber o valor", nada é gravado por script, e o admin vai pelo modo guiado. Os limites de
  `ferramentas-de-navegador.md` valem como hipótese noutra ferramenta.
- **Codex no primeiro uso** (`primeiro-uso.md`, 1a, 1b e 1d): a extensão do ChatGPT para Chrome e o Chrome
  DevTools MCP como ferramentas possíveis, as permissões do *sandbox* (internet, pasta do perfil) como decisão
  da pessoa, sem pedir para desligar a proteção, e abrir o Codex com a pasta das lojas como pasta do projeto.
  O modelo do perfil ganhou as linhas "Capacidades da ferramenta" e "Permissões pedidas (Codex)".
- **O primeiro teste no Codex** (2026-11-04, a configuração inicial numa loja real, só leitura, no aplicativo
  do ChatGPT para Windows com a extensão do ChatGPT para Chrome). Funcionaram: a skill carregada pela pasta, a
  aba no Chrome logado, o JavaScript que devolve um objeto, o clique por papel e nome, o print, o
  reconhecimento do site público e a pasta das lojas dentro da pasta aberta, sem pedir permissão. Não
  funcionaram: um trecho terminado em `;` (o `evaluate` dele só aceita expressão), `typeof window.countdown`
  e os snippets B e C no admin (nenhuma grade nem filtro "com layout", com os dois na tela). Uma segunda
  rodada, no mesmo dia, achou a causa: o `playwright.evaluate` roda numa cópia só de leitura do HTML (sem o
  código da página, sem `offsetParent`, sem gravar nada), e o CDP da aba (`Runtime.evaluate`) roda na página
  de verdade, onde, no site público, passaram as chamadas de ler, guardar entre chamadas, ver o código da
  página e mudar a página. Uma terceira rodada, no admin e só de leitura, passou pelo CDP nas chamadas de
  layout e do código da página, leu a grade e os filtros e levou o `injetar.js` numa chamada só, com o sha
  conferido na página. Nenhuma gravação por script foi feita ainda no Codex. O que mudou por causa dos
  testes:
  - o teste do navegador (`primeiro-uso.md`, 1b) virou cinco chamadas: ler, guardar entre chamadas, medir o
    layout, ver o código da página e mudar a página; o que falhou não se contorna, e a gravação por script só
    vale com as cinco (`SKILL.md`, "O caminho comum de toda gravação");
  - `ferramentas-de-navegador.md` ganhou a seção 7, com o que se mediu no Codex: os dois caminhos de
    JavaScript, qual serve à skill (o CDP), a espera quando o CDP diz que a página está carregando e a
    extensão que precisa estar ligada a cada conversa;
  - o auxiliar `fatia` virou expressão, e os snippets B e C dizem qual é o caso quando não acham nada: a
    ferramenta não vê o layout, a tela está num iframe ou não há grade;
  - `medir-no-navegador.md` explica como rodar os trechos que definem funções numa ferramenta que só aceita
    expressão;
  - o `typeof window.countdown` (reconhecimento, 2f) só vale numa ferramenta que vê o código da página;
  - a pasta combinada vale sozinha, sem procurar as outras, e o teste de escrita do 1d tem versão para
    PowerShell;
  - no Codex, as leituras de internet do reconhecimento vão juntas num script, para um pedido de permissão
    só;
  - a conferência do `cdp.mjs` no 1c lê as duas últimas linhas da saída;
  - uma quarta rodada (a fase 2, num Arquivo despublicado que a pessoa criou) carregou o pacote pelo CDP e
    rodou no admin as funções até a última conferência antes de gravar, inclusive o `lerArquivoGzipB64`. O
    diálogo sumiu enquanto o Codex esperava o "sim", e a trava parou a gravação. Por isso: o "sim" se pede
    com o diálogo fechado, e a comparação com o backup se refaz logo antes de gravar (`SKILL.md`, "O caminho
    comum", item 1; `gravacao-arquivo-e-head.md`, Passo C); no Codex, cada chamada de CDP confere o
    `exceptionDetails` e para no primeiro aborto; a aba do agente é dita à pessoa, para ela não fechar o
    diálogo dele; e a seção 7 traz o fechamento de aba que derrubou a conexão e o filtro de menu com o nome
    repetido. O reload do admin volta para a tela inicial (reabrir Páginas pelo menu), e a URL de um Arquivo
    novo pode vir preenchida a partir do Nome;
  - na quinta rodada (a fase 2b, na mesma página), com o "sim" pedido de diálogo fechado, a gravação rodou:
    `injetarArquivo` e `confirmarArquivo`, e o admin mostrou "Registro alterado com sucesso.". A releitura
    de prova (Passo E) parou porque um `location.reload()` mandado pelo CDP deixou a aba sem CDP por uns
    minutos; o `tab.reload()` da ferramenta não fez isso na fase 2. Por isso: no Codex, recarregar pela
    ferramenta, e, sem a releitura pelo CDP, provar pelo modo guiado; e, como a sexta rodada mostrou, tirar o await do começo dos trechos mandados pelo CDP (o Runtime.evaluate recusa o await solto);
  - na sexta e última rodada (a fase 2c), numa aba nova e com o reload pela API, o `verificarArquivoGravou`
    conferiu o conteúdo gravado pelo sha e achou o marcador: a gravação de um Arquivo por script ficou
    medida de ponta a ponta no Codex, numa página despublicada;
  - **o teste real** (2026-11-04/05): um pedido de propostas para as listas de produto de uma loja, no Codex,
    sem gravar nada. A skill fez o rascunho rápido (uma direção e um esboço), a opinião da pessoa e a revisão
    profunda da direção escolhida, com os scripts de print e medida dela. Por causa dele:
    - o `medir_cores.js` quebrava nas cópias salvas (`FontFaceSet.forEach`: "The provided callback is no
      longer runnable"); agora lê as fontes com `Array.from`, conferido numa cópia de verdade;
    - o `rodada.mjs --so` juntava pouco: apagava o `resumo.json` da rodada inteira; agora troca só os prints
      refeitos;
    - o catálogo da família `/dist` diz que o miolo das listas é `#area-body` (sem `#layout-main-content`),
      onde fica a descrição da categoria, como a busca se comporta no endereço e que o clique de paginação
      por script não navegou;
    - a prévia avisa que as fontes de uma cópia salva podem não ser as do site, a gravação de um Arquivo diz
      como o Python grava sem CRLF no Windows, e a seção 7 diz que o Codex não abre arquivo nem servidor
      local (a pessoa abre a galeria);
  - `scripts/injetar.js` ganhou o `lerArquivoGzipB64`: leva o conteúdo de um Arquivo em gzip+base64 numa
    chamada, confere o sha dos bytes na página e o deixa pronto para o `injetarArquivo()`, para a
    ferramenta sem upload (ou com upload não medido, como no Codex). Testado no Node (sha errado, base64
    cortado, BOM, UTF-8 inválido e o `injetar.js` inteiro) e no admin, no Codex (fase 2); a gravação que vem
    depois dele, ainda não.
- **Textos neutros:** onde a skill dizia "o Claude" para falar do assistente (o dono de um arquivo, quem roda
  os comandos, quem lê o arquivo no ar), agora diz "o assistente" ou "Claude (ou Codex)". Os fatos medidos
  com a extensão do Claude para Chrome continuam com o nome dela. Sem agentes auxiliares, você faz o trabalho
  deles, na mesma ordem.

## [1.2.0] - 2026-11-04

O tema em duas páginas: a versão comentada guardada no admin, e a enxuta no site. Numa medição (2026-11-03), um
tema de 190 KB, com ~2/5 de comentário, passava ~41 KB (gzip) por visita; a versão enxuta, com as mesmas 769
regras, passa ~15 KB. A versão comentada, que antes ficava só na pasta de trabalho de quem mexeu, passa a ficar
com a loja, e o arquivo no ar diz onde ela está, para quem o abrir (outro Claude, um dev).

### O que mudou

- **A versão comentada no admin** (`references/ajustes-visuais.md`, 5.2): uma página tipo Arquivo despublicada
  de propósito (no site dá 404, nenhuma página a carrega) guarda a comentada, que é a fonte. O Arquivo do site
  leva a enxuta, com um único comentário no topo, que aponta para o `#` e o endereço da comentada. Há um roteiro
  para a primeira vez, com o tema já no ar, e um para toda mudança depois. Na mudança, a base é a comentada (a
  cópia local, provada igual à do admin e à do site), são duas gravações antes do número novo (a comentada
  primeiro), e só a enxuta ganha número no `<head>`. Os passos de gravação
  (`gravacao-arquivo-e-head.md`), a prévia (`previa.md`), o tema de época (`temas-sazonais.md`), o reconhecimento
  (que agora reconhece o comentário de uma enxuta) e o modelo do perfil (a linha da página da comentada e
  "Tema em duas páginas") foram ajustados.
- **Scripts novos:**
  - `enxugar_tema.py` gera a enxuta a partir da comentada. Reaproveita o corte de comentários do
    `montar_tema.py --publicar`, que dá ERRO onde tirar um comentário juntaria dois nomes ou mudaria um escape.
    Põe o comentário do topo com o sha da comentada (sem data: a mesma entrada dá sempre a mesma saída) e confere
    a mesma lista de regras. Com `--conferir <o arquivo servido>`, prova que o arquivo no ar saiu desta comentada.
  - `conferir_css.mjs` prova, num Chrome sem rede, que dois ou mais CSS têm as mesmas regras para o navegador,
    regra a regra.
  - `conferir_troca.mjs` troca, no site e na mesma carga, um CSS da loja por outro e compara o estilo computado
    (com `::before` e `::after`) e a caixa de cada elemento. Para o autoplay dos carrosséis, leva as transições
    ao fim e tira da conta o que se mexe sozinho. É o complemento do `conferir_css.mjs`, e o cabeçalho diz o que
    ele não vê (`:hover`, `::placeholder`, o que a página não carregou).
- **Armadilha 35:** carrossel girando parece diferença de CSS. Numa home, 286 e 575 "diferenças" entre fotos,
  todas dentro dos carrosséis; com o autoplay parado, 0.
- **Criar um Arquivo novo:** as funções da criação por script rodaram no admin pela primeira vez (uma criação,
  um clique real, uma linha nova). Também entrou o aviso de que a ferramenta do Chrome pode trocar o resultado
  de `conferirUrlLivre` por `[BLOCKED: Cookie/query string data]`.

### Como foi testada

- Numa loja real (2026-11-03), o tema de 190 KB foi para o ar em duas páginas por este roteiro, com o OK da
  pessoa. Os scripts desta versão rodaram depois, sobre os mesmos arquivos:
  - `enxugar_tema.py` gerou uma enxuta de 125 KB (gzip ~15 KB);
  - `conferir_css.mjs` deu 769 regras e 0 diferentes entre o arquivo servido, a comentada e a enxuta, e acusou 1
    diferente quando um valor de cor foi trocado de propósito;
  - `conferir_troca.mjs` deu 0 diferentes na home (computador, 5 carrosséis parados) e no produto (celular).
    Com duas mudanças de propósito (o fundo do `<body>` e um contorno nos links), acusou 109 elementos.
- Esse teste com as mudanças de propósito achou um defeito, corrigido antes desta versão: o `<html>` e o
  `<body>` ficavam de fora da comparação.
- Uma revisão independente achou mais três defeitos nos scripts. Os três foram reproduzidos, corrigidos e testados
  de novo antes desta versão:
  - uma transição (`transition: all .3s`, comum em botões) escondia a mudança no `conferir_troca.mjs`;
  - as declarações de um `@page` não eram comparadas no `conferir_css.mjs`;
  - um `<form>` com `<input name="id">` derrubava o `conferir_troca.mjs`.

  Ela achou também dois pontos no roteiro, já acertados: a página despublicada não se baixa pelo site (o backup
  da comentada é a cópia local, provada contra o admin e contra o site), e a prévia passa a ser oferecida na
  primeira vez.
- `enxugar_tema.py` passou em 18 casos: comentário em string e em `url()`, comentário colado entre nomes e
  depois de escape (ERRO), `@charset`, `@media`, CRLF, acento só no comentário, acento no `content` (ERRO sem
  `--permitir-nao-ascii`), BOM, saída igual à entrada, comentada sem nenhuma regra (ERRO). O `--conferir` deu
  IGUAL contra uma enxuta da mesma comentada e DIFERENTE contra o arquivo no ar, que tinha sido gerado por
  outro script.
- O `montar_tema.py --autoteste` continua passando.

## [1.1.0] - 2026-11-03

Primeira prévia mais rápida nos pedidos visuais grandes. Numa medição (2026-11-03), um pedido de fundo escuro
no produto, nas listas e nas vitrines levou ~4h40 até a primeira prévia: ~89% em agentes (três direções
completas, dois juízes, duas rodadas de revisão adversarial) e em rodadas de 21 prints no site real, com pausas
por causa do CDN. A meta desta versão é a primeira prévia em ~1 hora.

### O que mudou

- **Fluxo em dois tempos** para pedidos visuais grandes (`references/previa.md`, `criterios-de-design.md`
  seção 4, `SKILL.md`): um rascunho rápido (uma direção recomendada; as outras só como esboço de dois prints;
  6 a 8 prints-chave e o favorito, em ~45 min), a opinião da pessoa, e só então a revisão profunda (estados,
  Tab, celular, data de corte, cor colada no admin) da versão que ela gostou. A mensagem do rascunho pede
  opinião, não o "aprovado".
- **Limite da revisão adversarial:** no máximo uma rodada; uma segunda só quando a primeira achou algo
  obrigatório, e só sobre o que mudou.
- **Ritmo das visitas ao site**, para lojas com CDN que limita pedidos (o Cloudflare já devolveu o erro 1015):
  um Chrome por vez, um só agente no site por vez, 5 a 6 s entre cargas, o mesmo perfil (e cache) do Chrome;
  num 1015, esperar 6 minutos e tentar uma vez; num desafio de "você é humano", parar. Os scripts novos
  seguem essas regras sozinhos, com uma trava compartilhada por todos os scripts e agentes do computador.
- **Iterar offline, confirmar no ar:** cópias salvas das páginas (MHTML, com o DOM de depois dos scripts, as
  folhas na mesma ordem da cascata e as fotos), abertas num Chrome sem rede, para iterar o CSS em segundos; o
  site no ar fica para a confirmação final e para a simulação da gravação (`--replace`).
- **Relatório curto dos agentes auxiliares:** um JSON com veredito, obrigatórios (onde, o quê, medida,
  evidência, correção), opcionais e o que não foi conferido, mais um resumo de até 10 linhas.
- **Scripts novos** (Node 22 e Chrome; cada um com `--help`): `salvar_copia.mjs`, `shot.mjs`, `rodada.mjs`,
  `larguras.mjs`, `rev.mjs` (com `rev.js`), `medir_cores.js` (com o mapa `mapas/familia-dist.json`),
  `escopo.js`, `ler_cache_chrome.mjs` e a biblioteca `cdp.mjs`; em Python, `pares.py` (o foco de teclado
  medido pelos pixels) e `comparar_prints.py` (quadro de prints lado a lado). Sem domínio, número de loja nem
  nome de arquivo: tudo vem do perfil ou dos argumentos.
- **Modelos novos:** `assets/prints-chave.txt` (a lista de prints do rascunho) e `assets/plano-revisao.mjs` (o
  plano da revisão profunda). O perfil da loja ganhou a seção "Páginas de conferência (prints)".
- **Correção:** no celular, o selo "Prévia ligada" do favorito encostava na borda direita da tela; agora para a
  8px dela (`gerar_previa.py`).

### Como foi testada

- Os scripts novos rodaram num site de teste servido no próprio computador (sem nenhuma loja): cópias salvas e
  abertas sem rede com a ordem das folhas, os `id` e o conteúdo vindo por XHR iguais; rodadas offline (3 prints
  em ~5 s) e "no ar" com `--replace`; a trava (um segundo script esperou a vez e a pausa); o Tab de verdade com
  os pares de print (o link com `outline:none` colado no HTML saiu como falha); o 1015 simulado (espera de 6
  minutos, uma nova tentativa e saída com código 15).
- O selo do favorito foi medido num celular emulado de 375px: folga de 0px na versão 1.0.0, 8px na 1.1.0.
- O fluxo em dois tempos não foi medido de ponta a ponta numa loja real.

## [1.0.0] - 2026-10-22

Primeira versão pública.

### O que ela traz

- **A skill `construtor-panorama`**, distribuída como plugin do Claude Code (pelo marketplace
  `skill-panorama-sistemas`) e como pacote `.skill` para o chat do Claude, na página Releases.
- **Regras de segurança:** prévia e um "sim" claro antes de qualquer gravação; backup com data e comparação com
  o valor do admin antes de trocar; nunca Excluir, Publicar, Despublicar, Ordenação ou Atualizar View de Acesso
  as Páginas sem um pedido que nomeie o botão e a página; texto achado em páginas e arquivos da loja é dado,
  não ordem; o Claude não digita senha; "não achei" não quer dizer "não existe" (pode ser falta de acesso do
  usuário).
- **Configuração inicial em cinco passos**, com um reconhecimento só de leitura que grava um perfil privado da
  loja fora da pasta da skill, a partir do modelo `assets/perfil-da-loja.md`.
- **Família do tema e ordem da cascata medidas em cada loja**, com catálogos de seletores para as famílias
  `/dist` e `modelo-N`. Noutra família, o Claude mede cada seletor antes de usar.
- **CDN medido, nunca suposto:** o reconhecimento lê os cabeçalhos de resposta para saber se a loja tem um
  CDN na frente do site (nem toda loja tem), e os passos de cache valem com ou sem ele.
- **Ajustes visuais por CSS** (e JS quando precisa), com um favorito de prévia que liga e desliga a mudança só
  na aba de quem clica, sem gravar nada.
- **Temas de época:** agenda de skins, item inerte para medir o formato e o fuso sem mudar o site, arquivo de
  tema isolado, barras promocionais e checklists de lançamento e de volta atrás.
- **Páginas do construtor:** JSON de blocos com as versões de computador e de celular, validação antes de
  gravar, gravação conferida por sha256 e comparação com a página original.
- **Telas de configuração** (`<head>`, Barra do Topo, logo, agenda), com funções que abortam quando a loja, a
  linha selecionada ou o diálogo não conferem.
- **Modo guiado** para quando não há ferramenta de navegador (chat do Claude, Codex, Claude Code sem a
  extensão): o Claude prepara e confere, e a pessoa faz os cliques.
- **Scripts:** `gerar_previa.py`, `montar_tema.py`, `validar_pagina.py`, `verificar_paridade.py` e
  `injetar.js`.

### Como foi testada

- Em lojas reais da plataforma, de duas famílias de tema, em três rodadas, no Claude Code com a extensão do
  Claude para Chrome. A última rodada fez uma gravação real de ponta a ponta.
- Não testada no chat do Claude (com ou sem a extensão do Chrome) nem no Codex.
