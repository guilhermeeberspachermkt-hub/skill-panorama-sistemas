# Changelog

As mudanças de cada versão ficam aqui, da mais nova para a mais antiga. As versões seguem o
[Versionamento Semântico](https://semver.org/lang/pt-BR/): o primeiro número muda quando algo deixa de
funcionar como antes, o segundo quando entra algo novo, o terceiro numa correção.

A cada versão, suba também o `version` de `plugins/construtor-panorama/.claude-plugin/plugin.json` (sem isso,
quem já instalou não recebe a atualização); depois do commit, confira com
`claude plugin tag --dry-run plugins/construtor-panorama`.

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
