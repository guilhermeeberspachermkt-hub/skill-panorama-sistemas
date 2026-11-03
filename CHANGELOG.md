# Changelog

As mudanças de cada versão ficam aqui, da mais nova para a mais antiga. As versões seguem o
[Versionamento Semântico](https://semver.org/lang/pt-BR/): o primeiro número muda quando algo deixa de
funcionar como antes, o segundo quando entra algo novo, o terceiro numa correção.

A cada versão, suba também o `version` de `plugins/construtor-panorama/.claude-plugin/plugin.json` (sem isso,
quem já instalou não recebe a atualização); depois do commit, confira com
`claude plugin tag --dry-run plugins/construtor-panorama`.

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
