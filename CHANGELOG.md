# Changelog

As mudanças de cada versão ficam aqui, da mais nova para a mais antiga. As versões seguem o
[Versionamento Semântico](https://semver.org/lang/pt-BR/): o primeiro número muda quando algo deixa de
funcionar como antes, o segundo quando entra algo novo, o terceiro numa correção.

A cada versão, suba também o `version` de `plugins/construtor-panorama/.claude-plugin/plugin.json` (Claude
Code) e de `plugins/construtor-panorama/plugin.json` (Codex), os dois com o mesmo número (sem isso, quem já
instalou não recebe a atualização); depois do commit, confira com
`claude plugin tag --dry-run plugins/construtor-panorama`.

## [1.4.0] - 2026-11-07

Imagens e banners. Até a 1.3.0 a skill sabia ligar um bloco a um tipo de banner que já existia, e mais nada:
a tela Banners estava na lista de "não mapeadas", e ela não sabia onde a loja sobe um arquivo de imagem nem
que endereço ele recebe. Esta versão mapeia esses cadastros em duas lojas reais, de duas famílias de tema, em
2026-11-06: numa, acompanhando a pessoa da loja conduzir o admin; na outra, fazendo o caminho de um banner de
ponta a ponta a pedido dela (tipo de banner novo, três artes, clone da home, cache, nitidez e conferência no
HTML servido, no computador e no celular). A home real das duas lojas não foi tocada. A versão também corrige
fatos que valiam só para o site novo (React) e a frase de que o admin não guarda versões anteriores, e acerta
quem aperta `Despublicar`, `Restaurar Versão` e `Excluir`.

### O que entrou

- **`references/imagens-e-banners.md`**, novo:
  - um aviso no começo: as duas homes medidas são servidas pelo site antigo (twig), e o que o arquivo diz do
    HTML e do tamanho servido não foi medido no site novo (React/Next);
  - de quem é cada decisão (a arte, o nome, o link e as datas são da pessoa), o que é o backup nestas telas,
    onde quase nada é um campo de texto para copiar, e o pedido para criar: o "sim" da pessoa sobre a lista
    escrita de cada registro (o tipo; cada arte com nome, link, ordem, datas e arquivo; cada mídia) é o
    pedido para os `Incluir` desses cadastros, e criar página, como o clone, continua exigindo um pedido à
    parte, que nomeie o botão e a página (seção 0);
  - os cinco cadastros e como um alimenta o outro (Tipos de Mídia → Tamanhos dos Tipos de Mídia → Mídias;
    Tipo de Banner → Banners), e onde cada um fica (seção 1);
  - o caminho em cliques para subir um banner (feito de ponta a ponta numa loja) e para trocar a imagem de um
    bloco imagem (telas lidas; a troca não foi gravada), nas seções 3 e 3b. O passo 0 da seção 3 acha, só
    lendo, o bloco, o par dele no celular e o tipo, pelo `Blocos:` da página (`lerBlocos()`), de preferência
    sem abrir o construtor;
  - o atalho "Trocar só a arte", no tipo que a página já usa: ele grava direto no que está no ar, então a
    pessoa escolhe entre ele e o caminho com clone, e ele vai com os dois aparelhos conferidos, o backup da
    lista de artes, prévia, o "sim" e as artes novas cadastradas como `Pausado` (seção 3);
  - como testar num clone da página, o que combinar com a pessoa antes de criá-lo e três caminhos para levar
    o resultado à página real, nenhum deles feito numa página real (seção 4);
  - qual Tipo de Mídia usar: ler o que a loja já usa, não escolher pelo nome (seção 5);
  - nove armadilhas medidas e um relato da pessoa de uma das lojas, não reproduzido (seção 6);
  - as datas de início e fim de cada arte (com hora; se a arte entra e sai sozinha não foi medido), na
    seção 8;
  - os passos por script (seção 9): o que funcionou, medido numa loja com a extensão do Claude para Chrome;
    as travas de cada `Confirmar`, que num diálogo de criação é **um** clique real, nunca o composto; e o
    construtor também pelo DOM, nunca por coordenada. E o que ainda não foi medido (seção 10).
- **A URL das imagens**, que responde a pergunta que `mapa-do-admin.md` deixava em aberto, "onde hospedar
  uma imagem usada num CSS" (`imagens-e-banners.md`, 2):
  `https://storage.panoverse-cdn.com.br/<pasta-da-loja>/<código-do-tipo-de-mídia>/<id>/<arquivo>`,
  com o nome normalizado na subida. A pasta muda de um admin para outro e vai no perfil; na página servida, a
  imagem de um bloco ganha um sufixo de tamanho. A seção traz os passos para subir uma imagem usada num CSS,
  com o pedido e o "sim" da pessoa.
- **Nitidez** (`imagens-e-banners.md`, 7): o arquivo servido é uma variante no tamanho que o bloco pede, não
  o que se enviou. Numa loja, artes de 1212×460 saíam como 606×230 e ficavam abaixo do necessário no
  celular. A seção ensina a conta (largura em tela × `devicePixelRatio`) em três larguras, uma delas logo
  abaixo do ponto em que o carrossel muda de itens por slide (1190 px nas duas lojas), a testar a variante
  direto no CDN antes de mexer e a subir o tamanho do bloco mantendo a proporção, sem mexer no layout. Subir
  o tamanho é uma proposta à pessoa, com o peso de cada opção.
- **O cache `banner`** (`mapa-do-admin.md`, 5 e 13): outra linha na mesma tela do `loja_config`, com os
  mesmos cuidados (filtro Loja = a sua, uma linha só, perguntar antes de limpar; a regra zero do `SKILL.md`
  a põe ao lado do cache de configuração). Medido numa loja sem CDN: depois da limpeza, o HTML servido seguiu
  antigo por 1 a 2 minutos, e o "Último flush" da linha não mudou. O roteiro de "mudei e não aparece"
  (seção 13) passou a citar a arte do banner e essa linha.
- **As lupas do construtor gravam** (`armadilhas.md` 5; `gravacao-construtor.md`, "O caminho pelo
  construtor" e "Higiene"; `imagens-e-banners.md`, 9). O `Aplicar` continua sem gravar, mas as grades que as
  lupas do painel abrem (Tipo de Banner, Mídia) têm `Incluir`, `Alterar` e `Excluir` do próprio cadastro.
  Medido numa loja, em 2026-11-06: `Incluir` › `Confirmar` na lupa do Tipo de Banner criou o tipo na hora,
  antes de qualquer `Confirmar` da página; o `Alterar` e o `Excluir` dali não foram medidos e contam como
  gravação. Por isso, para só ler o tipo de banner ou o Tipo de Mídia de um lugar da página, o caminho é o
  `Blocos:` pelo `Alterar` da página (aba `Configurações`, `lerBlocos()`, saída por `Cancelar`) e o `src`
  servido, que traz o código do Tipo de Mídia, conferido na tela Único › Mídia › Tipos de Mídia. Abrir o
  construtor da página no ar só para ler ficou desaconselhado (`armadilhas.md` 4, `blocos.md`,
  `mapa-do-admin.md` 14 e o perfil da loja).
- **`armadilhas.md` 36:** a tela "Logs das Páginas" (botão `Log` em Páginas), com `Restaurar Versão` e
  `Criar nova página` — o caminho para clonar a home antes de mexer nela. ⚠️ Numa das lojas o clone nasceu
  **publicado, com `index, follow` e no sitemap**: o item diz o que combinar antes de criar e o que conferir
  e corrigir logo depois.
- **O clone como rascunho** (`construtor.md`, seção 4, item 1): ao montar ou migrar uma página, o rascunho
  pode nascer de um clone da original pelo `Log`, com o conteúdo e os ids de bloco dela. Clonar é criar
  página: só a pessoa faz, ou pede com essas palavras. O mapa da tela Páginas (`mapa-do-admin.md`, 11)
  ganhou o botão `Log` e os campos da aba SEO do `Alterar` (Título SEO, Descrição SEO, "Incluir página no
  Sitemap?" e Robots). Em `mapa-do-admin.md`, 12, o caminho por script de "Criar um Arquivo novo" ficou só
  para Tipo = Arquivo: as travas dele abortam no "Adicionar Página" de um Construtor, como o do clone, que
  segue `imagens-e-banners.md`, 4, e `armadilhas.md` 36.
- **Quem aperta `Despublicar`, `Restaurar Versão` e `Excluir`.** `Restaurar Versão` (no diálogo do `Log`)
  entrou na lista de botões da regra zero (`SKILL.md`; `mapa-do-admin.md`, 11; o comentário de
  `scripts/injetar.js`). E a regra de quem clica passou a ser, nos lugares listados abaixo, a que
  `mapa-do-admin.md` 12, `gravacao-arquivo-e-head.md`, `ajustes-visuais.md`, `temas-sazonais.md` e
  `scripts/injetar.js` já seguiam na 1.3.0: `Despublicar` e `Restaurar Versão` (ninguém mediu o que ele
  restaura) são da pessoa, que clica, e a skill confere depois; `Excluir` nunca é da skill; `Publicar` segue
  o caminho próprio, com um pedido que nomeie o botão e a página. Foram acertados a regra zero e o passo 9 de
  "Página do construtor" (`SKILL.md`), o item 2 de "Antes de qualquer gravação" de `gravacao-construtor.md` e
  de `gravacao-arquivo-e-head.md` (e a "Higiene" do primeiro, que pôs `Restaurar Versão` entre os botões que
  gravam), `construtor.md` (a abertura, o backup do `Blocos:` e os passos 8 e 9), `mapa-do-admin.md` (4 e
  11), `previa.md` ("Aprovação, gravação e conferência") e os dois README. O do repositório passou
  `Excluir`, `Despublicar` e `Restaurar Versão` para "O que ela nunca faz"; o da pasta da skill diz que os
  três ficam com a pessoa. A mensagem de "pronto" de `primeiro-uso.md` passou a
  dizer que `Excluir`, `Despublicar` e `Restaurar Versão` ficam com a pessoa, e que só `Publicar` e as
  operações em massa vão com um pedido que nomeie o botão e a página.
- **O caminho comum** (`SKILL.md`), nos cadastros de imagem e banner: o "sim" sobre a lista escrita é o
  pedido dos `Incluir` (passo 1); o backup é o estado que a gravação muda (passo 2); sem texto a transportar,
  cada campo se confere pelo DOM antes de cada `Confirmar`, que num diálogo de criação é um clique real
  (passo 4); a verificação relê a linha na grade (passo 5); e os caches são só os que a mudança toca, com a
  linha `banner` uma vez, depois de todas as mudanças do cadastro (passo 6).
- **Prévia e aprovação** (`previa.md`): em "Qual prévia para qual mudança", uma linha para a arte nova num
  banner (a página num clone; sem clone, os arquivos novos ao lado das artes no ar, dizendo que não é a
  página) e uma para a imagem de um bloco imagem (um favorito que troca o `src` na página no ar). Em
  "Aprovação, gravação e conferência", o pedido à parte que nomeia o botão e a página ficou para a tela
  Páginas (`Incluir` de página ou de Arquivo, inclusive o `Criar nova página` do `Log`, e `Publicar`); nos
  cadastros Tipos de Banner, Banners e Mídias, o pedido de cada `Incluir` é o "sim" da pessoa sobre a lista
  escrita do que vai ser criado (`imagens-e-banners.md`, seção 0).
- **Temas de época** (`temas-sazonais.md`): as artes de banner entraram na tabela das peças de uma campanha
  (o cadastro, as datas com hora e o cache), e o "Fim da campanha combinado" diz o que fazer com elas: a Data
  Final alinhada com a saída do tema; uma arte para depois da campanha em cada tipo que a página usa,
  `Ativo` e com Data Início nessa hora, para o bloco não ficar vazio, cadastrada pelo passo 0 e pelos
  passos 0 a 4 do caminho direto de
  `imagens-e-banners.md`, 3; como não se mediu se a Data Início a segura, a conferência no HTML servido e,
  se ela já aparecer, a troca à mão na hora da saída; e quem confere no dia, quem faz a troca e quem pausa a
  arte que continuar no ar.
- **O perfil da loja** (`assets/perfil-da-loja.md`): a seção "Imagens e banners" (a pasta da loja no CDN, os
  Tipos de Mídia usados, o tipo e o tamanho de cada lugar, se o usuário pode criar Tipo de Mídia e os clones
  de teste), a linha `banner` na tabela de cache e, na linha Front-end, como saber pelo HTML servido se a
  página é do site novo ou do antigo.
- **Subir o arquivo da arte** (`imagens-e-banners.md`, 9; `ferramentas-de-navegador.md`, 7): a arte e a
  mídia vão pela ação de upload da ferramenta, no `input` do diálogo, com o nome e o tamanho conferidos pelo
  DOM antes do `Confirmar`; sem essa ação (o painel do aplicativo; no Codex, não medido), quem escolhe o
  arquivo é a pessoa.
- **O HTML do site antigo (twig)** nos blocos `imagem` e `banner` (`blocos.md`): um modelo de cada, com
  marcadores, e o que muda o trabalho. No banner, `owl-desktop-N`/`owl-mobile-N` são os "Itens por slide",
  e abaixo do ponto de troca lido no script da página (1190 px nas duas lojas) já vale o número do celular;
  a Classe CSS do painel vai para o `<div>` interno; e uma imagem com `/imagem/` no caminho pode ser de um
  banner. A classe da caixa de proporção (`.ar-…`) tem dois formatos e pode trocar ao regravar a página:
  não se prende CSS nela.
- `blocos.md`: os rótulos das seções GERAL e LAYOUT do painel (Nome do Bloco, Exibir em, Classe CSS,
  Posicionamento, Alterar fundo) e "Slider infinito (loop)".
- **A descrição da skill** (o cabeçalho de `SKILL.md`, que decide quando ela é chamada) ganhou imagens e
  banners (subir ou trocar a arte, tipo de banner, mídias, tamanhos) e o pedido de exemplo "trocar o banner
  da home". Saíram `block_list`, "banner" e "prateleira" da lista do construtor (o banner foi para "imagens e
  banners") e o exemplo "refazer no site novo a página antiga" (a descrição ficou com 967 caracteres; na
  1.3.0, 973). A migração continua em "migrar do twig para o React", e a prateleira, na tabela "Qual é o
  pedido".
- **Onde mais a novidade aparece:** a frase de abertura e as tabelas "Qual é o pedido" e Referências do
  `SKILL.md`, os dois README e as descrições dos manifestos do plugin (Claude Code e Codex) e do
  `.claude-plugin/marketplace.json` citam imagens e banners. No Codex, a descrição curta do plugin virou
  "Visual, páginas e banners", e a da skill, em `agents/openai.yaml`, ficou mais curta e passou a citar
  banners. Em "Testes e limites", o README do repositório conta as medições de 2026-11-06. Em "Limites
  conhecidos", o README da pasta da skill tirou Banners das telas não mapeadas. Em `mapa-do-admin.md`, a
  seção 0 ganhou o grupo Único › Mídia; na 14, Banners, Tipo de Banner e Mídias passaram a "Já mapeadas, em
  arquivo próprio", "Onde hospedar uma imagem usada num CSS" saiu das pendências e entrou Único › Mídia ›
  Propagação (aberta numa loja, sem o conteúdo lido). O catálogo da família `/dist` (`catalogo-tema-base.md`,
  11) aponta para o arquivo novo.

### O que estava errado

- **"O admin não guarda versões anteriores"** (`SKILL.md`, regra zero) estava errado para as páginas do
  construtor, que têm log de versões; para Arquivos, `<head>` e configuração da loja, não foi medido (não se
  testou o `Log` com um Arquivo marcado, e os Arquivos são linhas da mesma tela Páginas). A frase foi
  corrigida e diz isso; o backup local continua obrigatório, porque o log não foi medido por dentro. O mesmo
  motivo foi acertado onde se repetia: `construtor.md` (backup do `Blocos:`), `gravacao-construtor.md`,
  `gravacao-arquivo-e-head.md` (item 3 de "Antes de qualquer gravação"), `primeiro-uso.md` (1d) e os dois
  README.
- **"O clone nasce `noindex, nofollow`"** (`construtor.md`, seção 4; `armadilhas.md` 7 e 10b): numa das
  lojas medidas ele nasceu publicado, `index, follow` e no sitemap. Agora os textos mandam conferir
  Publicada, Robots e Página no Sitemap logo depois de criar, e separar o clone da página real pelo `#`, não
  pelo Robots.
- **"Página despublicada dá 404, até na prévia do construtor"** (`armadilhas.md` 6b; `construtor.md`, seção
  4, item 2, e passo 9; `SKILL.md`, "Página do construtor"): foi medido no site novo (React/Next), e agora
  os textos dizem isso. No site antigo (twig), a URL de uma página despublicada não foi medida, e numa loja,
  em 2026-11-06, a prévia do construtor mostrou um clone que não estava publicado, com a arte nova. Essa
  prévia não é a conferência no HTML servido.
- **O bloco `imagem` "não tem wrapper próprio", o `alt` "está cravado no id do bloco" e o `object-fit` "é
  `fill`"** (`blocos.md`; `armadilhas.md` 13 e 14; `construtor.md`, regra 2): isso vale para o site novo
  (React/Next). Nas lojas cuja home é servida pelo site antigo (twig) — medido em duas, uma `/dist` e uma
  `modelo-1` —, o bloco sai com wrapper e caixa de proporção, `object-fit: cover`, `loading="lazy"` e
  `width`/`height`. O `alt` e o `title` saíram do **Nome do Bloco** do painel numa delas; na outra, o único
  bloco imagem da home saiu com `alt=""`. O defeito do `alt` não aparece ali; os da âncora que colapsa e da
  margem que distorce não foram testados.
- **"O banner nativo não deixa escolher o tamanho da imagem"** (`blocos.md`; `armadilhas.md` 4;
  `construtor.md`, regra 2; o aviso de `scripts/validar_pagina.py`): no site antigo (twig), o arquivo servido
  é uma variante que você escolhe — pelo cadastro de Tamanhos (`-1920x496-cover`, que recorta) ou, com
  "Tamanho personalizado" ligado, pela Largura × Altura do bloco. O bloco `code` com carrossel em CSS fica
  como saída só do site novo. A medição de `loading` ("0 de 4 slides") também não vale no twig: do segundo
  slide em diante ele existe.
- **"Tipo de Banners" em Loja On-line** (`armadilhas.md`, `mapa-do-admin.md`, `blocos.md`): numa loja medida
  o item não estava no menu (a lista inteira foi lida); na outra, não apareceu na parte visível. O caminho
  que funcionou nas duas foi a lupa do campo Tipo de Banner. **Menus** também não estava na lista inteira;
  os textos dizem que pode ser falta de permissão ou a tela estar em outro lugar.
- **Os exemplos de URL de imagem** (`blocos.md`, `armadilhas.md`, `exemplo.md`) traziam o nome da pasta de
  uma loja medida, como se fosse da plataforma. Agora usam `PASTA-DA-LOJA` (que entrou na lista de
  marcadores do `SKILL.md`) e dizem que o trecho seguinte é o código do Tipo de Mídia, não o tipo do bloco.
- **O código `newline='\n'`** de `gravacao-arquivo-e-head.md` (Passo A) tinha saído quebrado na 1.3.0, com
  uma quebra de linha de verdade no lugar do `\n`. Voltou a ser `newline='\n'`.

### O que ainda não foi medido

- Levar o resultado de um clone para a página real: nenhum dos três caminhos de `imagens-e-banners.md`,
  seção 4, foi feito numa página real.
- Trocar a imagem de um bloco imagem até o fim, pelo `Blocos:` ou pela lupa do campo Mídia
  (`imagens-e-banners.md`, 3b).
- Pausar ou reativar uma arte pelo `Alterar`, e cadastrar uma arte já como `Pausado`: o atalho "Trocar só a
  arte" e o desfazer de uma arte dependem disso (`imagens-e-banners.md`, 3).
- Se a arte entra e sai sozinha pela Data Início e pela Data Final, em que fuso vale a hora e quanto os
  caches atrasam a troca (`imagens-e-banners.md`, 8).
- O que `Restaurar Versão` restaura, quantas versões o log guarda, se há log para Arquivos e para a
  configuração da loja (`armadilhas.md` 36) e do que depende o clone nascer publicado ou não.
- No site antigo (twig), o que a URL pública de uma página despublicada responde (`armadilhas.md` 6b).
- O `Alterar` e o `Excluir` das lupas do construtor: só o `Incluir` foi medido gravando (`armadilhas.md` 5).
- As telas Mídias, Tipos de Mídia e Tamanhos dos Tipos de Mídia foram lidas numa loja só, a da família
  `/dist`. O resto está em `imagens-e-banners.md`, seção 10.

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
