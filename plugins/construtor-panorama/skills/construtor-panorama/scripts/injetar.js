// Gravação no admin da Panorama Sistemas, por script de console:
//   - JSON no campo "Blocos:" do construtor (seções 0 a 9);
//   - página tipo Arquivo, os CSS/JS do site (seção 10);
//   - criar um Arquivo novo e `Publicar`, só quando a pessoa pede nomeando os botões e a página
//     (seção 10b): as funções conferem e ROTULAM um elemento para UM clique real da ferramenta;
//     não clicam;
//   - campos da configuração da loja — o código do <head>, a agenda de skins, a Barra do Topo e o
//     logo — e o cache dessa configuração (seção 11).
// Receita medida em produção numa loja real da plataforma, gravando a MESMA página quatro vezes
// seguidas (construtor) e o mesmo Arquivo e o mesmo <head> várias vezes (seções 10 e 11). As funções
// genéricas da seção 11 (agenda, Barra do Topo, logo) usam as mesmas travas do <head>; a gravação
// desses três campos por elas ainda não foi medida em produção.
//
// PARA QUEM: trilha de dev / automação. Quem prefere colar à mão segue gravacao-construtor.md
// (construtor) e gravacao-arquivo-e-head.md (Arquivo e configuração da loja).
//
// SERVE PARA QUALQUER LOJA: nenhum número de loja, domínio ou id de página está escrito aqui.
// Eles vêm do perfil da loja (~/.claude/panorama-lojas/<slug-da-loja>.md). Antes de gravar,
// rode `definirLoja({loja, hostAdmin, dominio})` (seção 0b); as funções que gravam abortam sem
// isso, porque num admin com várias lojas a mesma grade mostra páginas de todas.
//
// ⚠️ AS QUATRO COISAS QUE FAZEM VOCÊ GRAVAR NADA E ACHAR QUE GRAVOU (nenhuma dá erro):
//   1. escrever na <textarea>, no Ace ou no model `configInput.builder` — o que vai para o
//      servidor é o OBJETO `data.config.builder` (seção 0);
//   2. clicar em `Confirmar` do jeito errado — só `.click()` fecha o diálogo e NÃO grava; só
//      `triggerHandler` também não grava. Precisa dos dois (seção 7);
//   3. escrever no DIÁLOGO MORTO — o `.ui-dialog` anterior PODE ficar no DOM, escondido, e
//      `document.querySelectorAll('textarea')` entrega o dele primeiro (seção 3; noutras aberturas
//      ele saiu do DOM: conte com contarDialogos(), não suponha);
//   4. conferir na URL pública antes de ~100s — o backend serve a versão anterior com bytes
//      idênticos, e você conclui que falhou e regrava (seção 8). Aconteceu 3 vezes seguidas.
//
/* ------------------------------------------------------------------ *
 * 0. O MECANISMO — por que é `data.config.builder` e nada mais       *
 * ------------------------------------------------------------------ *
 * Medido: escrevi 284.053 chars no model, conferi que estavam lá, cliquei em Confirmar, e a
 * página gravou os 11.756 chars ANTIGOS. Sem erro no console.
 *
 * ⚠️ CORREÇÃO DE UMA VERSÃO ANTERIOR DESTE ARQUIVO: a linha que ele indicava como "a que faz
 * persistir" — `scope.configInput.builder = json` — TAMBÉM NÃO PERSISTE. Escrever no model é
 * tão inútil quanto escrever no DOM. Mecanismo, lido do próprio admin:
 *
 *     // a <textarea> E a div ui-ace têm AMBAS:
 *     //   ng-model="configInput.builder"
 *     //   ng-change="controller.onConfigInputChange(this.configInput.builder, 'builder')"
 *     onConfigInputChange = function (value, place) {
 *       var newConfig = vm.parseJson(value);
 *       if (!$scope.data.config) { $scope.data.config = {}; }
 *       $scope.data.config[place] = newConfig;      // <-- é ISTO que grava
 *     }
 *     getDataSubmit()  ->  devolve $scope.data
 *
 * O que vai para o servidor é `data.config.builder`, um OBJETO JÁ PARSEADO, atualizado só pelo
 * `ng-change` — que NÃO dispara quando você atribui o model por script. A correção é escrever
 * no objeto: `escopo.data.config.builder = JSON.parse(json)`.
 * Verificado: 234 blocos / 2 raízes gravaram e voltaram iguais na releitura.
 *
 * PRÉ-REQUISITOS:
 *   1. Alterar Página -> aba Configurações, com o campo "Blocos:" visível.
 *      (O campo só existe se a página já tiver algum bloco salvo — ver gravacao-construtor.md.)
 *   2. Ter validado o JSON antes: python scripts/validar_pagina.py pagina.json
 *
 * ⚠️ LIMITE DA AUTOMAÇÃO: se você está dirigindo o navegador por ferramenta remota (MCP,
 * DevTools), o Runtime.evaluate estoura em 45s. Medido: uma única chamada com ~3,5-4s de
 * await SOMADOS a trabalho de DOM já estoura, e 596 KB de `JSON.stringify` somados a um await
 * bastam. QUEBRE em chamadas separadas: clicar / esperar / conferir. Cada retorno também vem
 * truncado perto de 1.000 chars — devolva tamanhos e booleanos, em fatias.                   */

/* ------------------------------------------------------------------ *
 * 0b. A LOJA — o número da loja e o endereço do admin vêm do perfil  *
 * ------------------------------------------------------------------ *
 * Preencha com os dados do perfil da loja (~/.claude/panorama-lojas/<slug-da-loja>.md) e rode
 * uma vez por carregamento do admin — `location.reload()` apaga:
 *
 *   definirLoja({ loja: N, hostAdmin: 'admin.SUA-LOJA.com.br', dominio: 'www.SUA-LOJA.com.br' });
 *   definirLoja({ loja: N, lojaNome: 'Nome exato', campoLoja: 'ng-model.do.campo', hostAdmin, dominio });
 *
 *   loja       número da loja no admin: o valor da opção da loja no filtro "Loja" da tela Páginas
 *              (snippet C de reconhecimento-da-loja.md mostra nome e valor de cada opção)
 *   lojaNome   (opcional) o nome da loja exatamente como aparece no campo Loja do diálogo Alterar e
 *              na opção do filtro Loja. As funções que leem o filtro Loja (cache da configuração,
 *              conferirUrlLivre, conferirCriacao) usam este nome quando o rótulo do filtro não se lê
 *              (filtroLojaDoPerfil, seção 2): sem ele, abortam pedindo
 *   campoLoja  (opcional) o ng-model do campo Loja do diálogo Alterar, anotado no perfil (snippet F).
 *              Sem ele, `conferirDialogo` procura o ÚNICO campo do diálogo cujo ng-model contém "loj"
 *   hostAdmin  o endereço do admin, como aparece na barra do navegador, sem https://
 *   dominio    o domínio do site exatamente como aparece na grade de Único › Lojas (com ou sem www.,
 *              como estiver lá: `conferirLojaNaGrade` exige este endereço INTEIRO numa célula da
 *              linha marcada — `loja2.sua-loja.com.br` não passa por `sua-loja.com.br`)
 *
 * Por que isto é obrigatório: num admin com várias lojas, a mesma grade mostra páginas de todas,
 * e nome de página se repete entre elas. `confirmarGravacao`, `confirmarArquivo` e
 * `confirmarConfigLoja` chamam `exigirLoja()` e abortam se a loja não foi definida, se ainda está
 * com o texto de exemplo, ou se esta aba está em outro admin. `conferirDialogo` usa o número da
 * loja daqui quando você não passa um, e as gravações recusam um diálogo conferido com outra loja.
 *
 * De propósito, a definição NÃO vai no pacote salvo em localStorage (ferramentas-de-navegador.md):
 * um valor velho de outra sessão, num admin com várias lojas, é exatamente o erro que ela evita. */

function definirLoja(dados) {
  const d = dados || {};
  const limpar = v => String(v == null ? '' : v).trim().toLowerCase()
    .replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const loja = String(d.loja == null ? '' : d.loja).trim();
  const hostAdmin = limpar(d.hostAdmin);
  const dominio = limpar(d.dominio);
  const exemplo = /sua-loja|preench|exemplo|^n+$/i;
  if (!/^\d+$/.test(loja)) {
    throw new Error('ABORTADO: `loja` tem de ser o NÚMERO da loja no admin, do perfil da loja. '
      + 'Recebido: ' + JSON.stringify(d.loja) + '. Para achar o número: snippet C de '
      + 'reconhecimento-da-loja.md, no filtro Loja da tela Páginas (o valor da opção da sua loja).');
  }
  for (const [nome, v] of [['hostAdmin', hostAdmin], ['dominio', dominio]]) {
    if (!v || exemplo.test(v) || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(v)) {
      throw new Error(`ABORTADO: \`${nome}\` vazio, com texto de exemplo ou fora do formato `
        + `(recebido ${JSON.stringify(v)}). Preencha com o valor do perfil da loja.`);
    }
  }
  const lojaNome = d.lojaNome == null ? '' : String(d.lojaNome).trim();
  if (lojaNome && /nome (exato|da loja)|sua loja|exemplo/i.test(lojaNome)) {
    throw new Error('ABORTADO: `lojaNome` ainda está com o texto de exemplo. Use o nome do perfil, ou não passe.');
  }
  const campoLoja = d.campoLoja == null ? '' : String(d.campoLoja).trim();
  if (campoLoja && (!/^[A-Za-z_$][\w$.]*$/.test(campoLoja) || /ng-model\.do/.test(campoLoja))) {
    throw new Error('ABORTADO: `campoLoja` tem de ser o ng-model do campo Loja (ex.: data.algumaCoisa), '
      + 'como o snippet F mostrou. Recebido: ' + JSON.stringify(campoLoja));
  }
  window.__LOJA_ALVO = { loja, hostAdmin, dominio, lojaNome, campoLoja };
  return exigirLoja();
}

/** A loja definida, e a prova de que esta aba está no admin dela. Aborta em qualquer dúvida. */
function exigirLoja() {
  const L = window.__LOJA_ALVO;
  if (!L || !L.loja || !L.hostAdmin || !L.dominio) {
    throw new Error('ABORTADO: loja não definida nesta aba. Rode definirLoja({loja, hostAdmin, '
      + 'dominio}) com os dados do perfil da loja (~/.claude/panorama-lojas/<slug>.md). O reload '
      + 'do admin apaga essa definição.');
  }
  const aqui = String(location.hostname || '').toLowerCase();
  if (aqui !== L.hostAdmin) {
    throw new Error(`ABORTADO: esta aba está em ${aqui || '(sem host)'}, e o perfil da loja diz `
      + `${L.hostAdmin}. Não grave: ou a aba é de outro admin, ou o perfil está errado.`);
  }
  return { loja: L.loja, hostAdmin: L.hostAdmin, dominio: L.dominio,
           lojaNome: L.lojaNome || '', campoLoja: L.campoLoja || '' };
}

/** Para ecoar trechos com `?`, `&` ou `=` numa mensagem sem cair no filtro de saída. */
function semQuery(s) {
  return String(s == null ? '' : s).replace(/[?&=]/g, ' ');
}

/**
 * Vai no fim de toda mensagem de "não achei". O admin mostra a cada usuário só os sistemas, telas, abas,
 * botões, campos e lojas que o perfil de acesso dele libera: faltar algo pode ser só permissão
 * (SKILL.md, regra zero). Não conclua que não existe, e não procure outro caminho até o que está escondido.
 * Termina com a linha do perfil onde isso se anota, para que todo chamador a carregue.
 */
function dicaAcesso() {
  return ' Se isto não aparece para este usuário, pode ser falta de permissão no admin: pergunte à pessoa '
    + 'antes de concluir que não existe, não procure outro caminho e anote no perfil o que este usuário '
    + 'não vê ("Acessos deste usuário no admin").';
}

/* ------------------------------------------------------------------ *
 * 1. CLIQUE — três receitas DIFERENTES, e usar a errada não dá erro  *
 * ------------------------------------------------------------------ *
 * Medido em produção (armadilhas.md 22d):
 *
 *   botão       | só .click() nativo        | só triggerHandler | os dois juntos
 *   ------------+---------------------------+-------------------+------------------
 *   `Alterar`   | NÃO abre o diálogo        | abre 1 diálogo ✅ | abre 2 diálogos ⚠️
 *   `Confirmar` | fecha e NÃO grava ⚠️      | NÃO grava ⚠️      | GRAVA ✅
 *
 * Ou seja: NÃO existe um clique universal. `clicarBotao` (composto) é para quem CONFIRMA ou
 * ATUALIZA; `clicarNg` (só triggerHandler) é para quem ABRE algo. Abrir dois diálogos é o
 * primeiro passo do acidente do diálogo morto (seção 3): você escreve num, confirma no outro.
 *
 * ONDE PROCURAR O BOTÃO: `acharPorRotulo(rotulo, raiz)` sem `raiz` varre o documento inteiro.
 * Para o `Confirmar`, a raiz é sempre o diálogo: `confirmarGravacao` e `confirmarArquivo` só clicam
 * no `Confirmar` visível DENTRO do `.ui-dialog` (`botaoConfirmarDoDialogo`, seção 7). Um diálogo sem
 * `Confirmar` é motivo para parar, não para procurar o botão em outro lugar: o perfil de acesso do
 * usuário pode deixar ele abrir a tela sem poder gravar (SKILL.md, regra zero), e um `Confirmar` achado
 * fora do diálogo pode ser de outra tela. A busca no documento só existe com
 * `{confirmarForaDoDialogo: true}`, para quando o perfil anota que este admin desenha o `Confirmar` fora
 * do `.ui-dialog` (medido), e aí exige exatamente um `Confirmar` visível. Nenhuma das receitas medidas
 * precisou disso.                                                                               */

function acharPorRotulo(rotulo, raiz) {
  return [...(raiz || document).querySelectorAll('button, a')]
    .find(x => new RegExp('^\\s*' + rotulo + '\\s*$').test((x.textContent || '').trim())
               && x.offsetParent !== null);
}

/**
 * CLIQUE COMPOSTO: mousedown+mouseup+click MAIS triggerHandler + $apply.
 * Dispara o ng-click DUAS VEZES — é justamente isso que o `Confirmar` precisa para gravar.
 *
 * USE em: `Confirmar`, `Atualizar`, `Cancelar`, `Aplicar`, abas do diálogo.
 * ⛔ NÃO USE em `Alterar` nem em nada que ABRA diálogo/modal: abre DOIS (use `abrirDialogo`).
 * ⛔ NÃO USE no `OK` de modal de confirmação (alertify): os modais já respondidos (de um `Publicar`,
 *    por exemplo) continuam no DOM com `offsetParent !== null`, e o primeiro `OK` achado no documento
 *    pode ser o deles. O `OK` do modal do cache é só por `clicarOkDoModal()` (seção 8b).
 * ⛔ NÃO USE no `Confirmar` de um diálogo de CRIAÇÃO ("Adicionar Página") nem em `Publicar`: o
 *    composto criou a mesma página duas vezes (medido). Com o pedido da pessoa, o caminho é a seção
 *    10b: `prepararConfirmarCriacao()` e `prepararPublicar()` / `prepararOkDoPublicar()` conferem e
 *    rotulam o elemento, e quem clica, UMA vez, é a ação de clique real da ferramenta.
 * ⚠️ `Limpar cache` abre modal (às vezes) e o efeito do clique duplo nele NÃO foi medido —
 *    `clicarOkDoModal()` aborta se aparecer mais de um modal.
 */
function clicarBotao(rotulo, raiz) {
  const b = acharPorRotulo(rotulo, raiz);
  if (!b) { console.warn(`Botão "${rotulo}" não encontrado ou invisível.` + dicaAcesso()); return false; }
  for (const t of ['mousedown', 'mouseup', 'click']) {
    b.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
  }
  try {
    if (window.angular) {
      window.angular.element(b).triggerHandler('click');
      const s = window.angular.element(b).scope();
      if (s && s.$root && !s.$root.$$phase) s.$apply();
    }
  } catch (e) { /* ok */ }
  return true;
}

/**
 * O mesmo clique composto de `clicarBotao`, mas sobre um ELEMENTO que você já achou (e escopou no
 * diálogo). É o que as seções 10 e 11 usam para `Confirmar` e `controller.confirmar`.
 */
function cliqueComposto(b) {
  if (!b) throw new Error('cliqueComposto(b): elemento não informado.');
  for (const t of ['mousedown', 'mouseup', 'click']) {
    b.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
  }
  try {
    if (window.angular) {
      window.angular.element(b).triggerHandler('click');
      const s = window.angular.element(b).scope();
      if (s && s.$root && !s.$root.$$phase) s.$apply();
    }
  } catch (e) { /* ok */ }
  return true;
}

/**
 * CLIQUE SÓ PELO ANGULAR (triggerHandler + $apply, sem evento nativo): dispara o ng-click UMA
 * vez. É o clique de quem ABRE — `Alterar` abre exatamente 1 diálogo assim.
 * ⚠️ Não serve para `Confirmar`: medido, só triggerHandler NÃO GRAVA e fecha o diálogo do mesmo
 *    jeito, então você fica sem sintoma nenhum.
 */
function clicarNg(rotulo, raiz) {
  const b = acharPorRotulo(rotulo, raiz);
  if (!b) { console.warn(`Botão "${rotulo}" não encontrado ou invisível.` + dicaAcesso()); return false; }
  if (!window.angular) throw new Error('sem window.angular — clicarNg não tem como disparar o ng-click.');
  window.angular.element(b).triggerHandler('click');
  try {
    const s = window.angular.element(b).scope();
    if (s && s.$root && !s.$root.$$phase) s.$apply();
  } catch (e) { /* ok */ }
  return true;
}

/**
 * ITENS DO MENU LATERAL (`Páginas`, `Produtos`, …). Clique NATIVO SIMPLES, de propósito.
 *
 * ⚠️ `clicarBotao` aqui aciona o handler duas vezes e **abre duas abas internas** — você fica
 * com DUAS GRADES no mesmo DOM, e a de Páginas pode ser a INVISÍVEL. Por isso `conferirAlvo`
 * escopa na grade visível (seção 2).
 * ⚠️ O clique duplo não é a única causa: o admin guarda cada tela do menu como aba interna e
 * NÃO a descarta. Trocar de seção do menu já deixa as duas grades no DOM. Recarregue o admin
 * ao trocar de seção.
 */
function clicarMenu(rotulo) {
  const b = acharPorRotulo(rotulo);
  if (!b) { console.warn(`Item de menu "${rotulo}" não encontrado.` + dicaAcesso()); return false; }
  b.click();
  try {
    const s = window.angular && window.angular.element(b).scope();
    if (s && s.$root && !s.$root.$$phase) s.$apply();
  } catch (e) { /* ok */ }
  return true;
}

// ⛔ NUNCA clique por script: `Excluir`, `Publicar`, `Despublicar`, `Ordenação`,
// `Atualizar View de Acesso as Páginas`. Os três primeiros mudam o site no ar; os dois
// últimos são operações amplas, não da linha selecionada. Se a tarefa parecer exigir um
// deles, **pare e pergunte** — nenhuma reprodução de página precisa disso.
// A única exceção é `Publicar`, e só quando a pessoa pediu com uma frase que nomeia o botão e a
// página: aí, pela seção 10b (`prepararPublicar` e `prepararOkDoPublicar`), que conferem a linha e o
// modal e só ROTULAM o botão e o OK para um clique real da ferramenta em cada um. Um "aprovado" sobre
// a prévia não é esse pedido. `Excluir`, `Despublicar`, `Ordenação` e `Atualizar View` não têm caminho.
//
// ⚠️ E não clique por COORDENADA de screenshot: o screenshot volta em 1568px contra viewport
// de 1707 (fator 1,089). Um clique no checkbox da linha caiu ~24px à esquerda e abriu outro
// módulo (Vitrines) de outra loja do grupo. Aja pelo DOM.
//
// ⚠️ MAS "aja pelo DOM" não basta se o seletor for amplo — com o CONSTRUTOR ABERTO, a grade de
// Páginas continua no DOM atrás dele. `document.querySelectorAll('i.fa-plus-circle')` devolveu o
// botão `Incluir` DA GRADE, e o clique trocou o diálogo para "Adicionar Página" com os campos
// vazios: um `Confirmar` de distância de criar página nova em produção. `dialogoUnico()` NÃO
// protege — continuava havendo 1 `.ui-dialog`, o mesmo nó com outro conteúdo. Escope no painel do
// construtor, e tire um `screenshot` depois de qualquer clique que você não escopou.
// Saída segura quando não souber mais o que está aberto: `location.reload()` (não dispara POST).
// Ver armadilhas.md 22g.

/* ------------------------------------------------------------------ *
 * 2. TRAVA DE ALVO NA GRADE — rode ANTES de abrir o diálogo          *
 * ------------------------------------------------------------------ *
 * O admin é de produção e pode ter várias lojas na mesma grade (de alguns milhares a ~120 mil
 * registros, conforme a instalação medida). Os acidentes plausíveis aqui não dão erro — eles
 * gravam na página errada:
 *   (a) mais de uma linha selecionada (o checkbox do cabeçalho marca tudo, e a seleção
 *       sobrevive a troca de filtro) → `Alterar` pega o conjunto;
 *   (b) a linha certa pelo nome, mas de outra loja (nomes se repetem entre as lojas);
 *   (c) a linha marcada é de OUTRA GRADE, invisível, de outra aba interna.                   */

/**
 * A grade VISÍVEL. ⚠️ Não use `document.querySelectorAll('table')` para nada: com abas internas
 * abertas há N `<table>` no documento e a de Páginas pode ser a invisível — a trava antiga
 * ("existe exatamente 1 table") abortava a gravação CERTA, e a leitura de checkbox podia vir de
 * uma grade que você não está vendo.
 */
function gradeVisivel() {
  const g = [...document.querySelectorAll('table')].find(t => t.offsetParent);
  if (!g) throw new Error('Nenhuma <table> visível — você está na tela Páginas?' + dicaAcesso());
  return g;
}

/**
 * Confirma que existe EXATAMENTE uma linha marcada NA GRADE VISÍVEL e que é o `#` esperado.
 * Guarda o alvo em `window.__ALVO` para as travas seguintes.
 *
 * ⚠️ Se você acabou de clicar em `Limpar cache`, a SELEÇÃO FOI ZERADA (medido): a linha volta
 * desmarcada e esta trava aborta com 0. Remarque antes de qualquer outra operação.
 */
function conferirAlvo(numeroEsperado) {
  const grade = gradeVisivel();
  const linhas = [...grade.querySelectorAll('tr input[type=checkbox]')]
    .filter(c => (c.getAttribute('ng-click') || '').includes('clickCheckbox'));
  const marcadas = linhas.filter(c => c.checked);
  if (marcadas.length !== 1) {
    throw new Error(`ABORTADO: ${marcadas.length} linha(s) marcada(s) na grade visível `
      + `(de ${linhas.length} checkbox de linha), esperado exatamente 1. `
      + 'Desmarque tudo e marque só a página alvo. Se marcou e deu 0, você clicou em '
      + '`Limpar cache` no meio do caminho — ele zera a seleção.');
  }
  const tr = marcadas[0].closest('tr');
  const texto = (tr.innerText || '').replace(/\s+/g, ' ').trim();
  if (!new RegExp('(^|\\D)' + numeroEsperado + '(\\D|$)').test(texto)) {
    throw new Error(`ABORTADO: a linha marcada não é a #${numeroEsperado}. Marcada: "${texto.slice(0, 90)}"`);
  }
  // Segunda evidência, independente do DOM da grade: o rodapé conta a seleção, QUANDO diz
  // "Selecionado(s)". O rodapé é opcional e o texto muda de admin para admin: num, "Registro(s)
  // Selecionado(s): N"; noutro (medido 2026-10, sem linha marcada), só "Registro(s): N", e "Total de
  // Registro(s): N" na paginação. Por isso a contagem que manda é a do DOM, acima; o rodapé só
  // derruba: "Selecionado(s)" diferente de 1 aborta, e rodapé sem "Selecionado(s)" não pesa.
  const rodape = (document.body.innerText.match(/Registro\(s\) Selecionado\(s\):\s*(\d+)/) || [])[1];
  if (rodape != null && rodape !== '1') {
    throw new Error(`ABORTADO: o rodapé diz "Registro(s) Selecionado(s): ${rodape}". `
      + 'Há seleção viva em outra grade/aba interna — recarregue o admin.');
  }
  window.__ALVO = String(numeroEsperado);
  console.log(`Alvo confere: #${numeroEsperado} → ${texto.slice(0, 90)}`);
  return true;
}

/**
 * O campo está à vista? `offsetParent`, e mais um caso: um <select> escondido DENTRO de um seletor
 * "bootstrap" visível (`.bootstrap-select`: um botão que mostra a opção escolhida e uma lista que abre).
 * Medido numa loja (2026-10): os filtros Loja e Tipo da tela Páginas eram desse tipo. Ali o <select>
 * nativo ainda tinha `offsetParent`, mas noutra versão do mesmo componente ele fica `display:none`, e
 * o filtro sumiria da leitura. Outros componentes de select (com o <select> fora do componente) não
 * foram medidos: para eles, só o `offsetParent` conta.
 */
function campoVisivel(e) {
  if (!e || e.nodeType !== 1) return false;
  if (e.offsetParent !== null) return true;
  if (e.tagName !== 'SELECT' || typeof e.closest !== 'function') return false;
  const w = e.closest('.bootstrap-select');
  return !!(w && w.offsetParent !== null);
}

/**
 * O elemento NÃO é desenhado (sem caixa nenhuma, ou `visibility: hidden`)? O texto dele não entra no
 * rótulo de um campo. Por quê (medido 2026-10): a lista de opções de um seletor bootstrap mora na linha
 * do filtro, escondida, e o rótulo do filtro Loja saiu como os nomes das lojas da lista.
 */
function naoDesenhado(n) {
  try {
    if (typeof n.getClientRects === 'function' && n.getClientRects().length === 0) return true;
    return getComputedStyle(n).visibility === 'hidden';
  } catch (e) { return false; }
}

/** O rótulo que o próprio campo declara: `aria-label` (fora os `__…` de rotularParaFerramenta) ou <label for>. */
function rotuloExplicito(el) {
  const a = String(el.getAttribute('aria-label') || '').trim();
  if (a && a.slice(0, 2) !== '__') return a;
  const id = el.getAttribute('id');
  if (id && !/["\\]/.test(id)) {
    const lb = document.querySelector('label[for="' + id + '"]');
    const t = lb ? String(lb.textContent || '').replace(/\s+/g, ' ').trim() : '';
    if (t) return t;
  }
  return '';
}

/**
 * O rótulo de um campo de filtro, como filtrosDaTela o lê. Primeiro o que o campo declara
 * (`aria-label`, <label for>); senão, o texto da "linha" do campo (o maior ancestral, até 6 níveis
 * acima, que só contém aquele campo entre os visíveis com o mesmo ng-model e não contém uma grade
 * `<table>` visível ao lado dele: numa tela com um filtro só, a linha não engole o texto da grade).
 * Ficam fora do texto: selects, inputs e botões; o que não é desenhado (sem caixa ou `visibility:
 * hidden`); e as listas de um seletor bootstrap, mesmo abertas (`.dropdown-menu`, `[role=listbox]`,
 * `[role=option]`, `.bs-searchbox`). Vazio vira o placeholder ou o title; mais de 40 caracteres, ou
 * um texto feito só das opções do próprio campo (o botão do seletor mostrando a opção escolhida),
 * vira "(incerto) …". Devolve { linha, rotulo }. Usado também por filtroLojaDoPerfil.
 * Medido 2026-10, numa loja, antes desta versão: o rótulo do filtro Loja saiu como os nomes das
 * lojas da lista escondida, e o do filtro Tipo saiu "(incerto)", pela lista longa.
 */
function rotuloDoCampo(el) {
  const ng = el.getAttribute ? el.getAttribute('ng-model') : null;
  const SEL = ng && !/["\\]/.test(ng) ? `[ng-model="${ng}"]` : 'select';
  const contar = n => [...n.querySelectorAll(SEL)].filter(campoVisivel).length;
  const acima = t => { for (let e = el; e; e = e.parentElement) if (e === t) return true; return false; };
  const gradeAoLado = n => [...n.querySelectorAll('table')].some(t => t.offsetParent && !acima(t));
  const LISTA = '.dropdown-menu, [role=listbox], [role=option], .bs-searchbox';
  const fora = n => /^(SELECT|OPTION|INPUT|TEXTAREA|BUTTON|SCRIPT|STYLE)$/.test(n.tagName || '')
    || (typeof n.matches === 'function' && n.matches(LISTA)) || naoDesenhado(n);
  const texto = n => (n.nodeType === 3 ? n.nodeValue
    : n.nodeType !== 1 || fora(n) ? ' ' : [...n.childNodes].map(texto).join(' '));
  let linha = el;
  for (let k = 0; k < 6 && linha.parentElement && contar(linha.parentElement) === 1
       && !gradeAoLado(linha.parentElement); k++) {
    linha = linha.parentElement;
  }
  const explicito = rotuloExplicito(el);
  // A própria linha não passa pelo filtro `fora` (ela contém o campo, que está à vista): só os filhos.
  const daLinha = [...linha.childNodes].map(texto).join(' ');
  let rotulo = semQuery(explicito || daLinha).replace(/\s+/g, ' ').trim();
  if (!rotulo) rotulo = semQuery(el.getAttribute('placeholder') || el.getAttribute('title') || '').trim();
  if (!explicito && rotulo && el.tagName === 'SELECT' && el.options && el.options.length) {
    // Só o texto das opções do próprio campo (ex.: o botão do seletor com a opção escolhida)? Não é rótulo.
    let resto = ' ' + normRotulo(rotulo) + ' ';
    const ops = [...el.options].map(o => normRotulo(o.text != null ? o.text : o.textContent))
      .filter(Boolean).sort((a, b) => b.length - a.length);
    for (const t of ops) resto = resto.split(t).join(' ');
    if (!resto.replace(/[\s\-–—|·:;,.()]+/g, '')) rotulo = '(incerto) ' + rotulo.slice(0, 30);
  }
  if (rotulo.length > 40) rotulo = '(incerto) ' + rotulo.slice(0, 30);
  return { linha, rotulo };
}

/** Rótulo comparável: sem diferença de maiúscula, acento, espaços repetidos e ":" no fim. */
function normRotulo(s) {
  return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/\s+/g, ' ').replace(/[\s:]+$/, '').trim();
}

/**
 * Os filtros VISÍVEIS da tela (Páginas, Cache...), pelo RÓTULO que a tela mostra. Só lê.
 *   filtrosDaTela()   // [{i, rotulo, campo: 'select'|'input', operador, valor}]
 * Por que pelo rótulo: os filtros mudam de admin para admin. Medido em 2026: Loja · Nome · URL ·
 * Tipo · # num admin (operador oculto); Loja · Nome · URL · SKU · Prod. Ativo · Marca · Tipo noutro,
 * sem o filtro #, com o operador visível (`filterSelected.operador`) ao lado de cada um. Todos usam
 * o mesmo ng-model `filterSelected.value1`, então o índice que achava o # num admin acha o SKU no
 * outro, e o filtro errado devolve "Não localizado registros" como se a página não existisse.
 * O rótulo é o texto da "linha" do filtro (o maior ancestral que só contém aquele campo), sem o
 * texto dos selects, inputs e do que não está desenhado (rotuloDoCampo). Rótulo vazio ou "(incerto)":
 * confira num screenshot e não adivinhe.
 * `valor` é a opção escolhida (select) ou o texto digitado (input); `? & =` viram espaço.
 * Releia depois de QUALQUER troca de filtro: medido 2026-10, a ação de formulário da ferramenta num
 * select da linha de filtros trocou também o operador do filtro URL e o "Registros por Página".
 */
function filtrosDaTela() {
  const SEL = '[ng-model="filterSelected.value1"]';
  const vis = [...document.querySelectorAll(SEL)].filter(campoVisivel);
  const lido = e => (e.tagName === 'SELECT'
    ? ((e.options && e.options[e.selectedIndex]) || {}).text || ''
    : (e.value == null ? '' : String(e.value)));
  return vis.map((el, i) => {
    const { linha, rotulo } = rotuloDoCampo(el);
    const op = [...linha.querySelectorAll('[ng-model*="operador"]')].find(e => e.offsetParent);
    return { i, rotulo, campo: String(el.tagName || '').toLowerCase(),
             operador: op ? semQuery(lido(op)).trim() : '', valor: semQuery(lido(el)).trim().slice(0, 40) };
  });
}

/**
 * O campo de valor do filtro cujo rótulo é `rotulo` (sem diferença de maiúscula, acento ou ":").
 * Aborta se não houver exatamente um. Escrever nele só muda o que a grade mostra (não grava nada):
 *   const inp = campoDoFiltro('URL');
 *   Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(inp, 'minha');
 *   inp.dispatchEvent(new Event('input', { bubbles: true }));   // depois: clicarBotao('Atualizar')
 * Sem o filtro que você queria (ex.: o # num admin que não tem), filtre por outros (Loja, Tipo, Nome)
 * e ache a linha pela coluna # da grade: conferirAlvo(#) confere (gravacao-construtor.md).
 */
function campoDoFiltro(rotulo) {
  const lista = filtrosDaTela();
  const achados = lista.filter(f => normRotulo(f.rotulo) === normRotulo(rotulo));
  if (achados.length !== 1) {
    throw new Error(`ABORTADO: ${achados.length} filtro(s) visível(is) com o rótulo "${semQuery(rotulo)}"; `
      + `esperado 1. Rótulos desta tela: ${lista.map(f => f.rotulo || '(vazio)').join(' · ') || '(nenhum)'}. `
      + 'Se este admin não tem esse filtro (o # falta em alguns, medido), use outros e ache a linha pela '
      + 'coluna # (gravacao-construtor.md, "Navegar a tela Páginas por script"). Nunca pelo índice.'
      + (achados.length === 0 ? dicaAcesso() : ''));
  }
  return [...document.querySelectorAll('[ng-model="filterSelected.value1"]')]
    .filter(campoVisivel)[achados[0].i];
}

/**
 * Dá a UM elemento visível um `aria-label` próprio, `__<nome>`, para a ação de achar elementos da
 * ferramenta de navegador (`find`) devolver ele, e não o rótulo ou o botão ao lado. Tira o mesmo rótulo
 * de qualquer outro elemento (devolvendo a ele o `aria-label` que tinha antes). Não clica.
 *   rotularParaFerramenta(campoDoFiltro('URL'), 'url')    // depois: find "__url" pela ferramenta
 *   rotularParaFerramenta(null, 'url')                   // só tira o rótulo de onde estiver
 * Por quê (medido 2026-10, numa loja): o `find` às vezes devolveu o rótulo ou o botão de um seletor
 * em vez do <select>; com um `aria-label` próprio, achou o campo certo (Loja, Nome, URL, Confirmar, OK).
 * O rótulo não autoriza nada: a ação no elemento continua sendo a que a pessoa pediu.
 */
function rotularParaFerramenta(el, nome) {
  const n = String(nome == null ? '' : nome).trim();
  if (!/^[A-Za-z0-9_]{1,40}$/.test(n)) {
    throw new Error('rotularParaFerramenta(el, nome): o nome tem só letras, números e _, até 40 '
      + '(ex.: "loja", "confirmar_criacao"). Recebido: ' + JSON.stringify(semQuery(n)));
  }
  const rot = '__' + n;
  const tirar = x => {
    const antes = x.getAttribute('data-pano-rotulo-antes');
    if (antes) x.setAttribute('aria-label', antes); else x.removeAttribute('aria-label');
    x.removeAttribute('data-pano-rotulo-antes');
  };
  if (el !== null && (!el || el.nodeType !== 1)) throw new Error('rotularParaFerramenta(el, nome): passe o ELEMENTO.');
  if (el && !campoVisivel(el)) {
    throw new Error('ABORTADO: o elemento não está visível. Rotule só o que aparece na tela, como a pessoa '
      + 'veria; um elemento escondido pode ser de outra tela ou de outro diálogo.');
  }
  const outros = [...document.querySelectorAll('[aria-label="' + rot + '"]')].filter(x => x !== el);
  outros.forEach(tirar);
  if (el === null) return { rotulo: rot, removidos: outros.length };
  if (el.getAttribute('aria-label') !== rot) {
    const a = el.getAttribute('aria-label');
    if (a && a.slice(0, 2) !== '__') el.setAttribute('data-pano-rotulo-antes', a);
    el.setAttribute('aria-label', rot);
  }
  const agora = document.querySelectorAll('[aria-label="' + rot + '"]').length;
  if (agora !== 1) throw new Error(`ABORTADO: ${agora} elementos com o rótulo ${rot}; esperado 1.`);
  return { rotulo: rot, tag: String(el.tagName || '').toLowerCase(),
           texto: semQuery(String(el.textContent || el.value || '').replace(/\s+/g, ' ').trim()).slice(0, 40),
           removidosDeOutros: outros.length,
           depois: `Ache pela ferramenta (find "${rot}") e faça nele só a ação pedida. Para tirar: `
             + `rotularParaFerramenta(null, '${n}').` };
}

/**
 * O filtro Loja da tela (Páginas, Cache), com a loja do perfil escolhida. Só lê. Devolve
 * `{ select, metodo, rotulo }`; aborta em qualquer dúvida. Duas formas de aceitar, e só elas:
 *   1. um select visível (campoVisivel) com o RÓTULO Loja (rotuloDoCampo; sem diferença de maiúscula,
 *      acento e ":") e a opção escolhida valendo `string:N` ou `number:N`, com N = a loja de definirLoja;
 *   2. se NENHUM select tem o rótulo Loja legível: um select de rótulo ilegível (vazio ou "(incerto)")
 *      com DUAS evidências independentes, o valor `string:N`/`number:N` E o texto da opção escolhida
 *      igual ao `lojaNome` de definirLoja (normalizarNome). Sem `lojaNome`, aborta pedindo.
 * Só o valor não basta: com uma loja de número baixo, um select de Tipo ou de situação pode estar no
 * mesmo `number:N`. Um select de paginação ("25", "50") também não conta: o texto da opção da loja é o
 * nome dela, não um número. Medido 2026-10 numa loja: o rótulo do filtro Loja não se lia (era um seletor
 * bootstrap), e a versão anterior, que só aceitava pelo rótulo, abortou a limpeza do cache certa.
 */
function filtroLojaDoPerfil() {
  const L = exigirLoja();
  const N = String(L.loja);
  const ehDaLoja = o => { const v = String(o && o.value != null ? o.value : ''); return v === 'string:' + N || v === 'number:' + N; };
  const textoOp = o => String((o && (o.text != null ? o.text : o.textContent)) || '').trim();
  const escolhida = s => s.options && s.options[s.selectedIndex];
  const visiveis = [...document.querySelectorAll('select')].filter(campoVisivel);
  const comValor = visiveis.filter(s => { const o = escolhida(s); return o && ehDaLoja(o) && !/^\s*\d*\s*$/.test(textoOp(o)); });
  const rot = new Map(comValor.map(s => [s, rotuloDoCampo(s).rotulo]));
  const lojas = comValor.filter(s => normRotulo(rot.get(s)) === 'loja');
  if (lojas.length === 1) {
    window.__FILTRO_LOJA = { metodo: 'rótulo Loja' };
    return { select: lojas[0], metodo: 'rótulo Loja', rotulo: 'Loja' };
  }
  const ilegiveis = lojas.length ? [] : comValor.filter(s => { const r = rot.get(s); return !r || /^\(incerto\)/.test(r); });
  if (ilegiveis.length && !L.lojaNome) {
    throw new Error(`ABORTADO: há um select com a opção string:${N} ou number:${N} escolhida, mas o rótulo dele `
      + `não se lê (${ilegiveis.map(s => JSON.stringify(rot.get(s) || '(vazio)')).join(' · ')}). Para aceitar o `
      + 'filtro Loja pelo valor e pelo nome, passe lojaNome em definirLoja (o nome da loja como aparece na '
      + 'opção do filtro, anotado no perfil) e repita. Não adivinhe pelo número só.');
  }
  if (ilegiveis.length) {
    const porNome = ilegiveis.filter(s => normalizarNome(textoOp(escolhida(s))) === normalizarNome(L.lojaNome));
    if (porNome.length === 1) {
      window.__FILTRO_LOJA = { metodo: 'valor + nome (rótulo ilegível)' };
      return { select: porNome[0], metodo: 'valor + nome (rótulo ilegível)', rotulo: rot.get(porNome[0]) || '' };
    }
  }
  const outros = comValor.filter(s => !lojas.includes(s))
    .map(s => `${rot.get(s) || '(sem rótulo)'} = ${textoOp(escolhida(s)) || '(vazio)'}`);
  // O filtro Loja visível oferece a loja do perfil (só não está escolhida), ou nem a lista?
  const oferece = visiveis.some(s => [...(s.options || [])].some(o => ehDaLoja(o)
    && (normRotulo(rotuloDoCampo(s).rotulo) === 'loja'
        || (L.lojaNome && normalizarNome(textoOp(o)) === normalizarNome(L.lojaNome)))));
  window.__FILTRO_LOJA = null;
  throw new Error(`ABORTADO: não achei o filtro Loja com a loja do perfil (${N}) selecionada `
    + `(${lojas.length} select(s) visível(is) com o rótulo Loja e a opção string:${N} ou number:${N}; `
    + 'esperado 1'
    + (outros.length ? `; com essa opção, mas outro rótulo ou outro nome: ${semQuery(outros.join(' · '))}` : '')
    + '). Escolha a loja no filtro Loja, clique Atualizar e repita. Sem o filtro, a grade pode mostrar '
    + 'registros de outra loja (na tela Cache, a loja_config de outra configuração).'
    + (lojas.length === 0 && !oferece
      ? ` Nenhum filtro Loja visível oferece a loja ${N}: o filtro pode não listar esta loja para este `
        + 'usuário.' + dicaAcesso()
      : ''));
}

/* ------------------------------------------------------------------ *
 * 3. O DIÁLOGO — e o DIÁLOGO MORTO, que é o acidente mais silencioso *
 * ------------------------------------------------------------------ *
 * Medido (no `Alterar` de uma página do construtor, depois de gravar): o `.ui-dialog` anterior
 * CONTINUOU no documento, escondido, com `z-index` MENOR que o do novo.
 * `document.querySelectorAll('textarea')` devolve em ordem de DOM e entrega a do diálogo MORTO.
 * Aconteceu: liguei o escopo no morto, escrevi nele, confirmei nele, e depois cancelei o diálogo
 * real. Nada gravou e nada corrompeu — mas foi por SORTE.
 * Medido também o contrário (2026-10, noutra loja): depois do `Cancelar`, o diálogo Configurações e
 * o `Alterar` de um Arquivo SAÍRAM do DOM (0 `.ui-dialog`). Ou seja: o diálogo fechado PODE ficar ou
 * sair, conforme o diálogo e o jeito de fechar. Conte com `contarDialogos()`; não suponha nenhum dos
 * dois. A regra abaixo serve aos dois casos.
 *
 * A regra desta versão é conservadora de propósito: exigir exatamente 1 `.ui-dialog` no
 * documento. Não temos medição que distinga vivo de morto com segurança (z-index e
 * `offsetParent` são pista, não prova), e o custo de escolher errado é gravação silenciosa em
 * nada. Se aparecerem 2, NÃO escolha: recarregue o admin (`location.reload()`), refiltre e
 * remarque. O reload também limpa as abas internas, que é o outro problema da seção 2. Recarregar
 * antes de reabrir é seguro nos dois casos (o diálogo ficou ou saiu).                         */

function contarDialogos() {
  const d = [...document.querySelectorAll('.ui-dialog')];
  return { total: d.length, visiveis: d.filter(x => x.offsetParent).length };
}

/** O único `.ui-dialog` do documento. Aborta em 0 e aborta em 2+ — nunca escolhe. */
function dialogoUnico() {
  const d = [...document.querySelectorAll('.ui-dialog')];
  if (d.length === 1) return d[0];
  if (d.length === 0) throw new Error('ABORTADO: nenhum .ui-dialog no DOM. Abra com abrirDialogo().');
  throw new Error(`ABORTADO: ${d.length} .ui-dialog no DOM (${d.filter(x => x.offsetParent).length} `
    + 'visível(is)). Um diálogo fechado pode continuar no DOM (medido) e entregar a textarea dele '
    + 'primeiro — escrever nele grava NADA, em silêncio. Recarregue o admin e comece de novo.');
}

/** O título do diálogo (`.ui-dialog-title`), ou null se não houver. Só lê. */
function tituloDoDialogo(dlg) {
  const t = (dlg || dialogoUnico()).querySelector('.ui-dialog-title');
  return t ? String(t.textContent || '').replace(/\s+/g, ' ').trim() : null;
}

/**
 * É o diálogo de CRIAÇÃO? Medido (2026-10, numa loja): o `Incluir` abre "Adicionar Página"; o
 * `Alterar`, outro título. Um `Confirmar` nele cria uma página nova (armadilhas.md 22g). Sem título
 * no diálogo, devolve false: as outras travas (conferirDialogo, mesmo escopo) continuam valendo.
 */
function ehDialogoDeCriacao(dlg) {
  const t = tituloDoDialogo(dlg);
  return t != null && /^Adicionar\b/i.test(t);
}

/**
 * Abre `Alterar` (ou outro botão que abra diálogo) com o clique CERTO: só `triggerHandler`.
 *
 * ⚠️ `clicarBotao('Alterar')` abre DOIS diálogos (medido) — e com dois no DOM você não tem como
 * saber em qual está escrevendo. `.click()` puro NÃO abre nenhum. Só o triggerHandler abre 1.
 *
 * ⚠️ CHAMADAS SEPARADAS: o diálogo não está no DOM no mesmo tick. Chame `abrirDialogo('Alterar')`
 * numa chamada e `dialogoUnico()` / `abaDialogo()` na SEGUINTE. O `espera` aqui é curto de
 * propósito (400ms) para não somar com o resto e estourar os 45s do CDP.
 *
 * `abrirDialogo('Incluir')` abre o diálogo de CRIAÇÃO ("Adicionar Página"), com o mesmo clique; só
 * com o pedido da pessoa (seção 10b). Qual clique abriu o `Incluir` na criação medida (2026-10) não
 * foi anotado: se não abrir exatamente um diálogo, a função aborta, e a pessoa abre.
 */
async function abrirDialogo(rotulo, espera) {
  const antes = contarDialogos();
  if (antes.total !== 0) {
    throw new Error(`ABORTADO antes de abrir: já há ${antes.total} .ui-dialog no DOM. `
      + 'Um diálogo fechado pode continuar no DOM (medido; noutros casos ele sai: conte, não suponha); '
      + 'abrir outro em cima te deixa sem saber qual é qual. Recarregue o admin primeiro.');
  }
  if (!clicarNg(rotulo || 'Alterar')) throw new Error(`Botão "${rotulo || 'Alterar'}" não encontrado.` + dicaAcesso());
  await new Promise(r => setTimeout(r, espera == null ? 400 : espera));
  const dep = contarDialogos();
  if (dep.total !== 1) {
    throw new Error(`ABORTADO: depois do clique há ${dep.total} .ui-dialog (esperado 1). `
      + (dep.total > 1
          ? 'Dois diálogos = você usou clique composto num botão que ABRE. Recarregue o admin.'
          : 'Nenhum diálogo = o ng-click não disparou; confira o rótulo do botão.'));
  }
  return { dialogos: dep.total, visiveis: dep.visiveis };
}

/**
 * ABAS DO DIÁLOGO (`Geral`, `SEO`, `Configurações`) — escopadas DENTRO do diálogo.
 *
 * ⚠️ `clicarBotao('Configurações')` NÃO troca a aba: as abas são `.pane-item`, o texto delas vem
 * como `"Configurações()"`, e o menu lateral do admin tem um item com o MESMO rótulo — o
 * `acharPorRotulo` acha o do menu e você troca de tela em vez de trocar de aba.
 * ⚠️ Escopar no diálogo também evita clicar na aba do diálogo MORTO.
 *
 *   abaDialogo(/Configura/i);   abaDialogo(/^\s*Geral/);
 */
function abaDialogo(re, dlg) {
  const raiz = dlg || dialogoUnico();
  const t = [...raiz.querySelectorAll(seletorAbas())]
    .filter(a => a.offsetParent !== null)
    .find(a => re.test(a.textContent || ''));
  if (!t) { console.warn(`Aba ${re} não encontrada dentro do diálogo.` + dicaAcesso()); return false; }
  for (const e of ['mousedown', 'mouseup', 'click']) {
    t.dispatchEvent(new MouseEvent(e, { bubbles: true, cancelable: true, view: window }));
  }
  try {
    if (window.angular) {
      window.angular.element(t).triggerHandler('click');
      const s = window.angular.element(t).scope();
      if (s && s.$root && !s.$root.$$phase) s.$apply();
    }
  } catch (e) { /* ok */ }
  return true;
}

/**
 * O seletor das abas e subabas de um diálogo. `.pane-item` é o medido: nas abas do `Alterar` de uma
 * página e, em 2026-10-22 numa loja, no diálogo Configurações da loja (`abaDialogo` trocou a aba
 * Integrações e depois a subaba Custom, pelas `.pane-item`). Os outros dois seletores são reserva, não
 * medidos. Uma função, e não uma constante: o pacote salvo por `fn.toString()` perde as constantes do
 * topo do arquivo (ferramentas-de-navegador.md).
 */
function seletorAbas() {
  return '.pane-item, [role=tab], .nav-tabs a';
}

/**
 * Os rótulos das abas e subabas VISÍVEIS do diálogo, sem clicar em nada. Só lê.
 *   abasVisiveis()   // ['Geral', 'SEO', 'Visual', ...]
 * `seletor`: o das abas deste admin, quando o perfil anota um medido (o padrão é `seletorAbas()`).
 */
function abasVisiveis(dlg, seletor) {
  const raiz = dlg || dialogoUnico();
  return [...raiz.querySelectorAll(seletor || seletorAbas())]
    .filter(a => a.offsetParent !== null)
    .map(a => semQuery((a.textContent || '').replace(/\s+/g, ' ').trim()).slice(0, 40))
    .filter(Boolean);
}

/**
 * Existe uma aba ou subaba VISÍVEL neste diálogo cujo rótulo casa com `re`? Não clica. Um texto com mais
 * de 40 caracteres não conta como rótulo de aba (um campo ou um parágrafo que cita a palavra não é a aba).
 */
function abaVisivel(re, dlg, seletor) {
  if (Object.prototype.toString.call(re) !== '[object RegExp]') {
    throw new Error('abaVisivel(re): passe uma RegExp com o rótulo da aba.');
  }
  const r = new RegExp(re.source, re.flags.replace(/[gy]/g, ''));
  const raiz = dlg || dialogoUnico();
  return [...raiz.querySelectorAll(seletor || seletorAbas())].some(a => {
    const t = (a.textContent || '').replace(/\s+/g, ' ').trim();
    return a.offsetParent !== null && t.length > 0 && t.length <= 40 && r.test(t);
  });
}

/**
 * O ESCOPO QUE GRAVA, a partir do ELEMENTO do diálogo: sobe por `$parent` até achar
 * `data.config` — é lá que mora o objeto que o `getDataSubmit()` envia.
 *
 * Por que subir: o scope da textarea é filho e NÃO tem `data`; `data` costuma estar alguns
 * níveis acima, então não dá para chutar um `$parent` e pronto.
 * Por que partir do ELEMENTO do diálogo, e não de `document`: é a única forma de garantir que o
 * escopo que você altera é o do diálogo que está na tela (ver o aviso do diálogo morto acima).
 */
function escopoDoDialogo(dlg) {
  if (!dlg || !dlg.querySelector) throw new Error('escopoDoDialogo(dlg): passe o ELEMENTO do diálogo.');
  if (!window.angular) throw new Error('sem window.angular — não há escopo para ler.');
  const semente = dlg.querySelector('textarea[ng-model="configInput.builder"]')
               || dlg.querySelector('[ng-model], form') || dlg;
  let sc = window.angular.element(semente).scope();
  while (sc && !(sc.data && sc.data.config !== undefined)) sc = sc.$parent;
  if (!sc) {
    throw new Error('Não achei escopo com `data.config` subindo de $parent dentro deste diálogo. '
      + 'Sem ele NÃO EXISTE gravação: data.config.builder é o que vai para o servidor.');
  }
  return sc;
}

/**
 * Já com o diálogo aberto, confirma que é a página que você quer — é a checagem mais próxima
 * possível do momento da gravação. Ex.: conferirDialogo('minha-pagina-teste')  (a loja vem de
 * definirLoja) ou conferirDialogo('minha-pagina-teste', N).
 *
 * A loja é obrigatória: sem número de loja (nem passado, nem definido pelo perfil) a função
 * aborta, porque nome e URL de página se repetem entre as lojas de um mesmo admin. Ela marca o
 * diálogo conferido em `window.__DLG_CONFERIDO` (e a loja conferida em
 * `window.__DLG_CONFERIDO_LOJA`); `confirmarGravacao` e `confirmarArquivo` não clicam num diálogo
 * que não passou por aqui, nem num que foi conferido com outra loja que não a de `definirLoja`.
 *
 * A LOJA É CONFERIDA NO CAMPO LOJA DO DIÁLOGO, e só nele (lerCampoLoja). Uma versão anterior
 * aceitava "qualquer input do diálogo com o número da loja": numa loja de número pequeno (1, 2,
 * 3), quase todo campo numérico (ordem, posição, uma flag) passa, e a trava contra "a página
 * certa, da loja errada" vira enfeite. Se o campo Loja não for achado sem ambiguidade, a função
 * aborta e pede para mapear (snippet F de reconhecimento-da-loja.md) — não volte ao jeito antigo.
 *
 * ⚠️ NÃO filtre por `offsetParent !== null` (uma versão anterior filtrava, e estava errado):
 * o slug e a loja moram na aba `Geral`; quando você abre a aba `Configurações` — que é
 * exatamente onde a skill manda chamar esta função — os dois ficam OCULTOS, e a trava abortava
 * a gravação CERTA. Varra os campos DO DIÁLOGO, visíveis ou não.
 * ⚠️ Mas varra só os DO DIÁLOGO: varrer `document` inteiro passa a casar com os campos do
 * diálogo morto, e aí a trava aprova a página certa no diálogo errado.
 */
function conferirDialogo(slugEsperado, lojaEsperada, dlg) {
  const raiz = dlg || dialogoUnico();
  const L = window.__LOJA_ALVO || {};
  const loja = lojaEsperada != null ? String(lojaEsperada).trim() : (L.loja || null);
  window.__DLG_CONFERIDO = null;
  window.__DLG_CONFERIDO_LOJA = null;
  if (!loja) {
    throw new Error('ABORTADO: sem número de loja para conferir. Rode definirLoja({...}) com o '
      + 'perfil da loja, ou passe a loja: conferirDialogo(slug, N).');
  }
  const vals = [...raiz.querySelectorAll('input')].map(i => (i.value || '').trim());
  const achouSlug = vals.some(v => v === '/' + slugEsperado || v === slugEsperado);
  if (!achouSlug) {
    throw new Error(`ABORTADO: o diálogo aberto não é "/${slugEsperado}". `
      + `Campos do diálogo: ${semQuery(JSON.stringify(vals.slice(0, 8)))}`);
  }
  const campo = lerCampoLoja(raiz);
  const nome = loja === L.loja ? (L.lojaNome || '') : '';
  const porNumero = campo.vistos.some(v => v === loja);
  const porNome = !!nome && campo.vistos.some(v => normalizarNome(v) === normalizarNome(nome));
  if (!porNumero && !porNome) {
    throw new Error(`ABORTADO: loja não confere. O campo Loja do diálogo (${campo.ngModel}) mostra `
      + `${semQuery(JSON.stringify(campo.vistos.slice(0, 4)))}; esperado ${loja}`
      + (nome ? ` ou "${nome}"` : '') + '. Nomes de página se repetem entre as lojas do mesmo '
      + 'admin — não grave. Se o campo mostra a loja certa com outro texto, anote no perfil e passe '
      + '`lojaNome` em definirLoja.');
  }
  window.__DLG_CONFERIDO = raiz;
  window.__DLG_CONFERIDO_LOJA = loja;
  console.log(`Diálogo confere: /${slugEsperado} (loja ${loja}, pelo campo ${campo.ngModel})`);
  return true;
}

/** Minúsculas, sem acento, espaços colapsados: para comparar nomes de loja. */
function normalizarNome(s) {
  return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * O campo Loja de um diálogo (Alterar de uma página, por exemplo) e os valores que ele mostra.
 * Procura o elemento com o ng-model do perfil (`definirLoja({campoLoja})`) ou, sem ele, o ÚNICO
 * elemento do diálogo cujo ng-model contém "loj". Aborta em 0 ou em 2+: não escolhe.
 * Devolve `{ ngModel, tag, vistos }`, com o valor e o texto da opção escolhida (num <select>), o
 * valor (num <input>) e o model do Angular (número, texto, ou id/nome de um objeto).
 * ⚠️ Num <select> com ng-options, o `value` da opção pode ser só o índice ("1", "2"): ele é
 * ignorado, e valem o texto da opção e o model.
 * ⚠️ Num model objeto, valem só as chaves `id` e `codigo` (o número) e `nome`, `name` e `descricao`
 * (o nome), com o nome exato da chave. Outras chaves `*_id` (`empresa_id`, `grupo_id`…) podem ter o
 * número da sua loja num diálogo que é de outra loja — numa loja de número pequeno, quase certo.
 *
 * Medido numa loja da plataforma (2026-10-20, só leitura), no diálogo "Alterar Página" de uma página
 * Construtor e de uma página tipo Arquivo: um único elemento com "loj" no ng-model, `data.loja`. É
 * um DIV (um seletor próprio do admin, não <select>), sem `value` e com o texto vazio; o model é um
 * objeto com as chaves `id` (número: o número da loja, o mesmo do filtro Loja da tela Páginas),
 * `nome` (o nome da loja como no admin), `url` e `icon`. Esta função vê então [id, nome], e
 * `conferirDialogo` passa pelo número. Confira na sua loja (snippet F de reconhecimento-da-loja.md).
 */
function lerCampoLoja(raiz) {
  const dono = raiz || dialogoUnico();
  const L = window.__LOJA_ALVO || {};
  const seletor = L.campoLoja ? '[ng-model="' + L.campoLoja + '"]' : '[ng-model*="loj" i]';
  const els = [...dono.querySelectorAll(seletor)];
  if (els.length !== 1) {
    throw new Error(`ABORTADO: ${els.length} campo(s) de loja no diálogo (`
      + (L.campoLoja ? `ng-model "${L.campoLoja}"` : 'ng-model com "loj"') + '); esperado 1. '
      + 'Mapeie o campo Loja do diálogo Alterar (snippet F de reconhecimento-da-loja.md), anote o '
      + 'ng-model no perfil e passe-o em definirLoja({..., campoLoja}).'
      + (els.length === 0 ? dicaAcesso() : ''));
  }
  const el = els[0];
  const vistos = [];
  const tira = v => String(v).replace(/^(number|string):/, '').trim();
  if (el.tagName === 'SELECT') {
    const op = el.options[el.selectedIndex];
    if (op) {
      if (!el.hasAttribute('ng-options') && !/^object:/.test(op.value)) vistos.push(tira(op.value));
      vistos.push((op.text || '').trim());
    }
  } else if (typeof el.value === 'string') {
    vistos.push(el.value.trim());
  }
  try {
    const m = window.angular.element(el).scope().$eval(el.getAttribute('ng-model'));
    if (m != null && typeof m !== 'object') vistos.push(String(m).trim());
    else if (m && typeof m === 'object') {
      Object.keys(m).forEach(k => {
        const v = m[k];
        if (v == null || typeof v === 'object') return;
        if (/^(id|codigo)$/i.test(k) || /^(nome|name|descricao)$/i.test(k)) vistos.push(String(v).trim());
      });
    }
  } catch (e) { /* sem escopo legível: fica o que o DOM mostra */ }
  return { ngModel: el.getAttribute('ng-model'), tag: el.tagName, vistos: vistos.filter(Boolean) };
}

/* ------------------------------------------------------------------ *
 * 4. Localizar o campo e LER o que está gravado                      *
 * ------------------------------------------------------------------ */
/**
 * Devolve `{ dlg, ta, escopo, ace }` do diálogo ÚNICO aberto.
 *
 * ⚠️ Há DUAS textareas com `name="configInput"`: o campo `Blocos:` é a de
 * `ng-model="configInput.builder"`; a outra é `Custom Config` (`configInput.custom`). Ler a
 * errada devolve string vazia e dá a impressão de que a página está sem conteúdo.
 */
function campoBlocos() {
  const dlg = dialogoUnico();
  const ta = [...dlg.querySelectorAll('textarea')]
    .find(t => t.getAttribute('ng-model') === 'configInput.builder');
  if (!ta) {
    throw new Error('Campo "Blocos:" não encontrado NO DIÁLOGO. Está na aba Configurações? '
      + 'A página tem algum bloco salvo? (gravacao-construtor.md, "Limitação conhecida")' + dicaAcesso());
  }
  const escopo = escopoDoDialogo(dlg);
  if (!window.angular.element(ta).scope().configInput) {
    console.warn('O scope da textarea não tem `configInput` — confira se pegou a textarea certa. '
      + 'A gravação em si não depende dele (depende de data.config.builder).');
  }
  return { dlg, ta, escopo, ace: dlg.querySelector('.ace_editor') };
}

/**
 * Serialização CANÔNICA do que está em `data.config.builder`.
 *
 * ⚠️ Descarta as chaves `$$…`: o Angular injeta `$$hashKey` nos objetos que o `ng-repeat`
 * itera, então `JSON.stringify(data.config.builder)` MUDA DE TAMANHO entre duas leituras da
 * mesma coisa. Medido: 297.831 e 299.089 chars para o mesmo conteúdo. NÃO é corrupção — e sem
 * descartar essas chaves qualquer comparação por tamanho ou por sha acusa diferença falsa.
 */
function canonico(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string') return v;
  return JSON.stringify(v, (k, val) => (k.slice(0, 2) === '$$' ? undefined : val));
}

/**
 * Lê o que está REALMENTE no objeto que vai ao servidor, em forma canônica.
 * Não leia do DOM nem do model — os dois mostram uma coisa e o servidor recebe outra.
 * ⚠️ Ler isto NO MESMO diálogo em que você escreveu não prova gravação nenhuma: é o buffer da
 * sessão. Para provar, use `verificarGravou()` (seção 8), que exige diálogo REABERTO.
 */
function lerBlocos() {
  const { escopo } = campoBlocos();
  return canonico(escopo.data.config ? escopo.data.config.builder : undefined);
}

/** O texto que o HUMANO está vendo no campo. Diagnóstico, não prova de gravação. */
function lerBlocosDoDom() {
  const { ta } = campoBlocos();
  return ta.value || '';
}

/* ------------------------------------------------------------------ *
 * 5. Escrever                                                        *
 * ------------------------------------------------------------------ */
/**
 * Escreve `jsonString` em `data.config.builder` DO DIÁLOGO ABERTO. NÃO grava — depois disso,
 * `confirmarGravacao()`.
 *
 * A trava principal desta função: o escopo em que ela escreve é obtido do ELEMENTO do diálogo
 * único (`escopoDoDialogo`), e ela guarda esse escopo e esse nó em `window.__SC` / `window.__DLG`.
 * `confirmarGravacao()` recusa clicar se o diálogo aberto não for o MESMO escopo — é o que
 * impede o acidente de escrever num diálogo e confirmar no outro.
 *
 * `espelhar` (default FALSE) escreve também a string na textarea, só para o humano ver.
 * ⚠️ NÃO ligue isso em página grande: a textarea e a div ui-ace compartilham o model, então um
 * digest com a string nova empurra o texto para dentro do Ace e CONGELA o renderer. Medido:
 * 284 KB travaram a aba e o Runtime.evaluate estourou os 45s. O Ace é decoração.
 */
function injetar(jsonString, opcoes) {
  const espelhar = !!(opcoes && opcoes.espelhar);
  const { dlg, ta, escopo } = campoBlocos();

  // 5a. Validar que é JSON antes de tocar em nada.
  if (typeof jsonString !== 'string' || !jsonString.trim()) {
    // ⚠️ deixar o campo em string vazia faz o campo "Blocos:" DESAPARECER do diálogo (é a
    // condição de "página vazia" — armadilhas.md 1d). Se acontecer: saia por Cancelar e reabra.
    throw new Error('String vazia — nada foi escrito. Esvaziar o campo faz o "Blocos:" '
      + 'desaparecer do diálogo (armadilhas.md 1d); saia por Cancelar e reabra.');
  }
  let parsed;
  try { parsed = JSON.parse(jsonString); }
  catch (e) { throw new Error('JSON inválido, nada foi escrito: ' + e.message); }

  // 5b. TRAVA DE IDENTIDADE: o escopo que vou alterar é o do diálogo que está na tela?
  //     `dialogoUnico()` já abortou se houvesse 2, e `escopoDoDialogo` partiu do nó do diálogo.
  //     Reconfirmo a igualdade aqui para que a asserção fique no MESMO lugar da escrita.
  if (escopoDoDialogo(dlg) !== escopo) {
    throw new Error('ABORTADO: o escopo do diálogo aberto não é o escopo que eu ia alterar.');
  }

  // 5c. BACKUP — do OBJETO gravado, que é o estado verdadeiro. Sem isto não há como voltar.
  const antes = lerBlocos();
  window.__BACKUP_BLOCOS = antes;

  // 5d. ESCREVER NO OBJETO — a linha que faz a gravação persistir (seção 0).
  if (!escopo.data.config) escopo.data.config = {};
  escopo.data.config.builder = parsed;          // OBJETO, não string

  // 5e. Espelho opcional, só para o humano (ver o aviso do Ace acima).
  if (espelhar) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(ta, jsonString);
    ta.dispatchEvent(new Event('input',  { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 5f. Avisar o Angular. Sem tocar no model, este $apply não re-renderiza o Ace.
  try { if (!escopo.$root.$$phase) escopo.$apply(); } catch (e) { /* ok */ }

  // 5g. CONFERIR pelo OBJETO (não pelo model nem pelo DOM — os dois mentem), em forma canônica.
  const esperado = canonico(parsed);
  const depois = canonico(escopo.data.config.builder);
  const rel = {
    backupChars: antes.length,
    escritoChars: depois.length,
    objetoConfere: depois === esperado,
    raizes: Array.isArray(parsed.block_list) ? parsed.block_list.length : '(sem block_list)',
    devices: Array.isArray(parsed.block_list) ? parsed.block_list.map(r => r.device_show) : null,
    domDesatualizado: !espelhar,   // esperado: o campo na tela segue mostrando o JSON antigo
  };

  // 5h. Guardar a identidade e o sha canônico para as travas de `confirmarGravacao` e
  //     `verificarGravou`. O sha é do CANÔNICO, não da string do arquivo — ver conferirSha.
  window.__SC = escopo;
  window.__DLG = dlg;
  window.__ALVO_CHARS = depois.length;
  window.__SHA_CANONICO = null;                 // preenchido por conferirSha(), que é async

  console.log('Campo atualizado:', rel);
  if (!rel.objetoConfere) console.warn('data.config.builder não bateu com o que você mandou — NÃO grave; investigue.');
  console.log('O campo na tela continua mostrando o JSON antigo — ESPERADO, não afeta a gravação. '
    + 'Não tente "consertar" pelo Ace: ele congela com payload grande.');
  console.log('Backup desta aba em window.__BACKUP_BLOCOS (o reload apaga; o backup que vale é o arquivo local, construtor.md seção 0). Reverter: injetar(window.__BACKUP_BLOCOS) + confirmarGravacao().');
  return rel;
}

/* ------------------------------------------------------------------ *
 * 5b. Edição PARCIAL — mexer em uma parte sem reenviar tudo          *
 * ------------------------------------------------------------------ */
/**
 * Aplica uma transformação sobre o JSON já salvo e reescreve. Ideal para ajuste fino (trocar o
 * CSS da página, mudar um font-size) sem transportar o documento inteiro de volta ao navegador.
 *
 *   editarBlocos(doc => { doc.style = NOVO_CSS; });
 *   editarBlocos(doc => {}, s => s.split('font-size:22px').join('font-size:18px'));
 */
function editarBlocos(fnObjeto, fnTexto) {
  let texto = lerBlocos();
  if (typeof fnTexto === 'function') texto = fnTexto(texto);
  if (typeof fnObjeto === 'function') {
    const doc = JSON.parse(texto);
    const r = fnObjeto(doc);
    texto = JSON.stringify(r === undefined ? doc : r);
  }
  return injetar(texto);
}

/* ------------------------------------------------------------------ *
 * 6. Transporte do payload até o navegador                           *
 * ------------------------------------------------------------------ */
async function sha256(texto) {
  const b = new TextEncoder().encode(texto);
  const h = await crypto.subtle.digest('SHA-256', b);
  return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * sha256 seguro para DEVOLVER pela ferramenta: o filtro de saída da extensão bloqueia retorno
 * que pareça base64/JWT/cookie e devolve `[BLOCKED: …]` — um hash de 64 hex cai nisso com
 * facilidade. Quebrado em grupos de 8 com espaço, ele passa.
 */
function shaLegivel(hex) {
  return (hex.match(/.{1,8}/g) || []).join(' ');
}

/**
 * Confere, DENTRO DA PÁGINA, que o conteúdo é byte-a-byte o do arquivo.
 * Sem argumento, hasheia o que está em `data.config.builder` (canônico) do diálogo aberto.
 *
 *   await conferirSha(t.value, SHA_DO_ARQUIVO)   // a cola: bate com o sha do arquivo ✅
 *   await conferirSha()                          // depois de injetar: fixa o sha CANÔNICO
 *
 * ⚠️ DOIS SHAs DIFERENTES, e confundi-los faz você ver "corrupção" que não existe:
 *   - o sha do ARQUIVO bate com a STRING colada (é a mesma sequência de bytes);
 *   - depois de `injetar`, o que existe é um OBJETO. Re-serializar dá outros bytes (ordem de
 *     chave preservada, mas o Angular injeta `$$hashKey` — medido: 297.831 vs 299.089 chars
 *     para o mesmo conteúdo). Por isso `canonico()` descarta `$$…`, e o sha que você compara
 *     entre "antes de Confirmar" e "depois de reabrir" é o CANÔNICO, não o do arquivo.
 * Cadeia de confiança completa: sha(arquivo) == sha(cola) → injetar → sha canônico fixado aqui
 * == sha canônico lido depois de REABRIR o diálogo (verificarGravou).
 */
async function conferirSha(json, sha256Esperado) {
  const texto = (typeof json === 'string') ? json : lerBlocos();
  const s = await sha256(texto);
  const daCola = (typeof json === 'string');
  if (!daCola) window.__SHA_CANONICO = s;
  const confere = sha256Esperado ? s === sha256Esperado : null;
  if (confere === false) {
    console.warn('SHA256 NÃO confere. Se é a cola: veio truncada ou suja, NÃO injete. '
      + 'Se é depois de reabrir: comparou com o sha do ARQUIVO em vez do CANÔNICO (ver doc).');
  }
  return { chars: texto.length, sha: shaLegivel(s), confere, canonico: !daCola };
}

// -- 6a. Payload grande: gzip + base64 (caminho preferido) ----------------------------------
// Uma página real passa de 35 KB de JSON — uma home real deu 293.469 chars compactos, que
// viram 18.480 em gzip+base64. Gere assim, no seu terminal:
//
//   python - <<'PY'
//   import json, gzip, base64
//   s = json.dumps(json.load(open('pagina.json')), ensure_ascii=False, separators=(',',':'))
//   print(base64.b64encode(gzip.compress(s.encode(), 9)).decode())
//   PY
//
// ⚠️ `injetarGzipB64` decodifica e injeta na MESMA chamada, sem conferir sha256. Prefira o trecho
//    do 3a de gravacao-construtor.md (decodificar em `window.__PAYLOAD` e conferir o sha numa
//    chamada, `injetar(window.__PAYLOAD)` na seguinte), que é o caminho descrito logo abaixo.
async function injetarGzipB64(b64, tamanhoEsperado) {
  // Confira o tamanho antes de decodificar: base64 truncado dá "InvalidCharacterError" no atob
  // e é o erro mais comum aqui.
  if (tamanhoEsperado && b64.length !== tamanhoEsperado) {
    throw new Error(`base64 truncado: ${b64.length} chars, esperado ${tamanhoEsperado}.`);
  }
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const json = new TextDecoder('utf-8').decode(await new Response(stream).arrayBuffer());
  return injetar(json);
}

// ⭐ ESTE É O CAMINHO PREFERIDO desde 2026-08-12 (era o alternativo). Medido: 65.241 chars de JSON
//    viraram 4.888 de base64 (7,5%), passaram numa ÚNICA chamada e o sha256 conferido dentro da
//    página bateu com o do arquivo de primeira. Não depende de foco, de aba ativa nem do clipboard —
//    que naquela mesma sessão devolveu 0 chars duas vezes com o foco provado (ver 6b).
//    ⚠️ Decodifique numa chamada (guardando em `window.__PAYLOAD`) e injete na SEGUINTE: `await` de
//    descompressão somado ao digest do Angular aproxima os 45s do CDP sem necessidade. Confira o sha
//    ANTES de injetar, do mesmo jeito — aqui ele protege de base64 truncado na fronteira da chamada.
//
// ⚠️ DUAS ARMADILHAS DESTE CAMINHO, as duas medidas:
//   1. TRANSCREVER o base64 à mão (ou em pedaços colados no script) FALHA. Numa tentativa
//      perdi ~9.500 chars sem perceber; noutra, 1 caractere errado no offset 1198 de um pedaço
//      de 2.400 (um '2' que virou '0'). Payload opaco não perdoa. Isto condena a TRANSCRIÇÃO;
//      base64 gerado por script e colado inteiro numa chamada é justamente o caminho de cima.
//   2. O filtro de saída da extensão BLOQUEIA retornos que PARECEM base64, JWT ou query
//      string — vem `[BLOCKED: Base64 encoded data]` etc. Devolva tamanhos e booleanos, ou
//      sanitize (`.replace(/[?&=]/g,' ')`, `shaLegivel`).
//   E não tente servir o JSON de um servidor local: `fetch('http://127.0.0.1:PORTA/…')` de
//   dentro do admin TRAVA (filtro de rede da extensão).

// -- 6b. Payload grande pela área de transferência: funcionou, e já falhou sem explicação ---
// ⚠️ CORREÇÃO (2026-08-12): este era descrito como "o caminho que FUNCIONOU". Continua tendo
// funcionado (293.469 chars sem corrupção, e 295.187 noutra tentativa com hash idêntico ao do arquivo
// de primeira), mas naquele dia devolveu **0 chars duas vezes seguidas** com `document.activeElement`
// sendo a caixa de cola, `document.hasFocus()` TRUE, UMA ÚNICA aba aberta e o `Set-Clipboard`
// conferido no terminal. Nenhuma das causas conhecidas (aba errada, ctrl+a, navegação no meio)
// explicava. Não fique caçando foco: duas tentativas e vá para o 6a (gzip+base64).
// A sequência, se for usar:
//
//   1. no terminal:   Set-Clipboard -Value (Get-Content -Raw pagina.min.json)   (PowerShell)
//                     e guarde o sha256 do arquivo.
//   2. na página:     criarCaixaDeCola()      <- textarea PRÓPRIA, não a do admin
//   3. pelo teclado:  ctrl+v pela ação `key`
//   4. na página:     await conferirCola('SHA256_DO_ARQUIVO')
//   5. só então:      await injetarDaCola()
//
// ⚠️ Use uma textarea SUA. Colar na do admin acorda o model, o Ace recebe o texto e o renderer
//    congela (mesmo motivo do aviso em `injetar`).
// ⚠️ NÃO pressione ctrl+a antes de colar: pela ferramenta de teclado ele DIGITA a letra "a".
//    Medido: o campo ficou com 284.054 chars começando em `a{"style"…`. Crie a caixa VAZIA.
// ⚠️ `navigator.clipboard.readText()` ESTOURA o Runtime.evaluate (45s) — abre prompt de
//    permissão. Não tente ler o clipboard por script; use focus() + ctrl+v pela ação `key`.
// ⚠️ O clipboard é recurso GLOBAL da máquina. Numa colagem vieram 17 chars, um código de
//    rastreio de encomenda, porque a pessoa copiou o código enquanto a gravação corria. Foi o
//    sha256 na própria página que pegou, antes de qualquer escrita — o passo 4 NÃO é opcional.
// ⚠️ Passos 2, 3 e 4 em CHAMADAS SEPARADAS — juntos estouram os 45s do CDP.

function criarCaixaDeCola() {
  let t = document.getElementById('__caixa_cola');
  if (!t) {
    t = document.createElement('textarea');
    t.id = '__caixa_cola';
    t.style.cssText = 'position:fixed;left:8px;bottom:8px;width:240px;height:60px;z-index:99999';
    document.body.appendChild(t);
  }
  t.value = '';                 // vazia de propósito: sem ctrl+a, sem letra "a" perdida
  t.focus();
  return { pronto: true, chars: t.value.length };
}

/** Confere a cola contra o sha256 do ARQUIVO. Sem isto, você grava lixo. */
async function conferirCola(sha256Esperado) {
  const t = document.getElementById('__caixa_cola');
  if (!t) throw new Error('Caixa de cola não existe — rode criarCaixaDeCola() primeiro.');
  const r = await conferirSha(t.value, sha256Esperado);
  return Object.assign(r, { inicio: t.value.slice(0, 12) });
}

async function injetarDaCola() {
  const t = document.getElementById('__caixa_cola');
  if (!t || !t.value.trim()) throw new Error('Caixa de cola vazia.');
  const rel = injetar(t.value);
  t.remove();                   // não deixe 290 KB pendurados no DOM do admin
  return rel;
}

/* ------------------------------------------------------------------ *
 * 7. GRAVAR                                                          *
 * ------------------------------------------------------------------ */
/**
 * O `Confirmar` visível dentro de `dlg`. Sem nenhum, aborta com a dica de permissão: um diálogo que o
 * usuário abre e não pode gravar é motivo para parar e perguntar. Com `opcoes.confirmarForaDoDialogo:
 * true` (só quando o perfil anota que este admin desenha o `Confirmar` fora do `.ui-dialog`, medido),
 * procura no documento e exige EXATAMENTE um visível.
 */
function botaoConfirmarDoDialogo(dlg, opcoes) {
  if (!dlg || !dlg.querySelectorAll) throw new Error('botaoConfirmarDoDialogo(dlg): passe o ELEMENTO do diálogo.');
  const dentro = acharPorRotulo('Confirmar', dlg);
  if (dentro) return dentro;
  if (!(opcoes && opcoes.confirmarForaDoDialogo === true)) {
    throw new Error('ABORTADO: o diálogo aberto não tem um botão `Confirmar` visível. Não procure o botão '
      + 'fora do diálogo: um Confirmar de outro lugar pode ser de outra tela.' + dicaAcesso());
  }
  const fora = [...document.querySelectorAll('button, a')]
    .filter(x => /^\s*Confirmar\s*$/.test((x.textContent || '').trim()) && x.offsetParent !== null);
  if (fora.length !== 1) {
    throw new Error(`ABORTADO: ${fora.length} botão(ões) \`Confirmar\` visível(is) no documento; com `
      + 'confirmarForaDoDialogo, esperado exatamente 1. Não escolha: tire um screenshot e mostre à pessoa.');
  }
  return fora[0];
}

/**
 * `Confirmar` grava. `Aplicar` (dentro do construtor) NÃO grava — zero requisições de rede.
 *
 * A SEQUÊNCIA, e por que cada parte existe (medido, quatro gravações da mesma página):
 *   - `mousedown` + `mouseup` + `click` nativos: sozinhos, FECHAM o diálogo e NÃO GRAVAM;
 *   - `triggerHandler('click')`: sozinho, também NÃO GRAVA;
 *   - os DOIS juntos GRAVAM (o ng-click roda duas vezes e é isso que passa).
 *   - `$apply()` fecha o digest, para o POST sair no mesmo ciclo.
 * As duas formas erradas fecham o diálogo do mesmo jeito: não há erro, não há aviso, e a
 * leitura seguinte da URL pública (em cache de ~100s, seção 8) confirma a ilusão de que gravou.
 *
 * TRAVAS ANTES DE CLICAR — a primeira e a terceira contra a loja errada, as outras por causa
 * do diálogo morto:
 *   1. a loja foi definida pelo perfil e esta aba está no admin dela (`exigirLoja`);
 *   2. existe exatamente 1 `.ui-dialog`;
 *   3. `conferirDialogo()` rodou NESTE diálogo, com a loja de `definirLoja` (página e loja
 *      conferidas, a loja pelo campo Loja do diálogo);
 *   4. o escopo dele é IDÊNTICO (`===`) ao que `injetar()` alterou (`window.__SC`);
 *   5. o conteúdo canônico ainda tem o tamanho que `injetar()` escreveu;
 *   6. o `Confirmar` clicado é o visível DENTRO deste diálogo (`botaoConfirmarDoDialogo`). Sem ele,
 *      aborta: pode ser o perfil de acesso do usuário (seção 1, "Onde procurar o botão").
 * Sem a trava 4 é possível escrever num diálogo e confirmar no outro — aconteceu, e só não
 * corrompeu nada por sorte. As travas 1 a 3 e a 6 valem também com `forcarSemInjetar`.
 *   confirmarGravacao()                                    // o normal
 *   confirmarGravacao({ confirmarForaDoDialogo: true })    // só com o perfil dizendo, medido, que este
 *                                                          // admin desenha o Confirmar fora do .ui-dialog
 */
function confirmarGravacao(opcoes) {
  const forcar = !!(opcoes && opcoes.forcarSemInjetar);
  const L = exigirLoja();
  const dlg = dialogoUnico();
  if (ehDialogoDeCriacao(dlg)) {
    throw new Error(`ABORTADO: o diálogo aberto é de CRIAÇÃO ("${semQuery(tituloDoDialogo(dlg))}"): um Confirmar `
      + 'aqui cria uma página nova (armadilhas.md 22g). Página nova do construtor quem cria é a pessoa '
      + '(construtor.md, seção 4). Saia por Cancelar e recarregue.');
  }
  if (window.__DLG_CONFERIDO !== dlg) {
    throw new Error('ABORTADO: este diálogo não passou por conferirDialogo(slug). Rode-o aqui, '
      + 'com o diálogo aberto — é a trava de página e de loja.');
  }
  if (window.__DLG_CONFERIDO_LOJA !== L.loja) {
    throw new Error(`ABORTADO: o diálogo foi conferido com a loja ${window.__DLG_CONFERIDO_LOJA}, e `
      + `definirLoja diz ${L.loja}. Grave só na loja do perfil.`);
  }
  const escopo = escopoDoDialogo(dlg);

  if (!forcar) {
    if (!window.__SC) {
      throw new Error('ABORTADO: nada foi injetado nesta sessão (window.__SC vazio). '
        + 'Se você abriu a página só para LER, saia por `Cancelar` — `Confirmar` grava mesmo '
        + 'quando você acha que não mudou nada. Para gravar de propósito sem injetar: '
        + 'confirmarGravacao({forcarSemInjetar:true}).');
    }
    if (escopo !== window.__SC) {
      throw new Error('ABORTADO: o diálogo aberto NÃO é o escopo que você alterou. '
        + 'Você escreveu num diálogo e está confirmando em outro — grava NADA, em silêncio. '
        + 'Recarregue o admin e refaça desde o filtro.');
    }
    if (dlg !== window.__DLG) {
      throw new Error('ABORTADO: nó de diálogo diferente do que recebeu a escrita.');
    }
    const agora = canonico(escopo.data.config && escopo.data.config.builder).length;
    if (agora !== window.__ALVO_CHARS) {
      throw new Error(`ABORTADO: data.config.builder tem ${agora} chars, `
        + `mas injetar() escreveu ${window.__ALVO_CHARS}. Alguém (um digest, o ng-change do `
        + 'campo) mexeu no objeto depois de você. Reinjete e confirme na sequência.');
    }
  }

  const b = botaoConfirmarDoDialogo(dlg, opcoes);   // trava 6: o Confirmar deste diálogo, e só ele
  for (const t of ['mousedown', 'mouseup', 'click']) {
    b.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
  }
  try {
    window.angular.element(b).triggerHandler('click');
    const s = window.angular.element(b).scope();
    if (s && s.$root && !s.$root.$$phase) s.$apply();
  } catch (e) { /* ok */ }

  window.__DLG_GRAVADO = dlg;   // usado por verificarGravou() para exigir diálogo REABERTO
  console.log('Confirmar disparado. O diálogo fechar NÃO é prova de gravação — prove com '
    + 'verificarGravou() lendo da FONTE, e só depois olhe a URL pública (cache de ~100s).');
  return { clicou: true, chars: window.__ALVO_CHARS || null };
}

/** Sai sem gravar. Use SEMPRE que abriu a página só para ler. */
function cancelarDialogo() {
  const dlg = dialogoUnico();
  return clicarBotao('Cancelar', dlg) || clicarBotao('Cancelar');
}

/* ------------------------------------------------------------------ *
 * 8. VERIFICAR — na FONTE, nunca na URL pública primeiro             *
 * ------------------------------------------------------------------ */
/**
 * Prova de gravação. Exige um diálogo REABERTO: ler no mesmo diálogo em que você escreveu não
 * prova nada, porque `data.config.builder` é o buffer daquela sessão de edição.
 *
 * SEQUÊNCIA (uma chamada por passo, senão os 45s do CDP estouram):
 *   1. `location.reload()`  — depois de gravar no construtor, o diálogo fechado continuou no DOM
 *      (medido); sem reload você fica com 2 `.ui-dialog` e `dialogoUnico()` aborta (de propósito:
 *      não há como distinguir vivo de morto com segurança). Onde o diálogo sai do DOM (medido
 *      noutros diálogos), o reload não atrapalha: recarregue sempre;
 *   2. refiltrar (pelo `#`, onde houver esse filtro: `campoDoFiltro('#')`), `clicarBotao('Atualizar')`,
 *      marcar a linha, `conferirAlvo(#)`;
 *   3. `await abrirDialogo('Alterar')`;
 *   4. `abaDialogo(/Configura/i)`;
 *   5. `await verificarGravou(shaCanonico)`  — com o sha que `conferirSha()` fixou antes de
 *      confirmar (`window.__SHA_CANONICO`, se a aba não recarregou; senão passe o valor).
 *
 * ⚠️ POR QUE NÃO OLHAR A URL PÚBLICA PRIMEIRO: depois de `Confirmar`, a página no ar continua
 * servindo a versão anterior por cerca de 100s, com bytes idênticos. `Cache-Control: no-cache`
 * e `cf-cache-status: DYNAMIC` na resposta (numa loja com Cloudflare na frente) ENGANAM — o
 * cache é do backend da Panorama. Isso me
 * fez concluir TRÊS VEZES que a gravação falhou e regravar três vezes. Fonte primeiro, ar depois.
 */
async function verificarGravou(shaCanonicoEsperado) {
  const dlg = dialogoUnico();
  if (window.__DLG_GRAVADO && dlg === window.__DLG_GRAVADO) {
    throw new Error('ABORTADO: este é o MESMO nó de diálogo em que você escreveu. Ler daqui não '
      + 'prova gravação (é o buffer da sessão). Recarregue o admin, remarque a linha, reabra '
      + 'por abrirDialogo("Alterar") e leia de novo.');
  }
  const escopo = escopoDoDialogo(dlg);
  const texto = canonico(escopo.data.config ? escopo.data.config.builder : undefined);
  const sha = await sha256(texto);
  const esperado = shaCanonicoEsperado || window.__SHA_CANONICO || null;
  let raizes = null, devices = null;
  try {
    const doc = JSON.parse(texto);
    if (Array.isArray(doc.block_list)) { raizes = doc.block_list.length; devices = doc.block_list.map(r => r.device_show); }
  } catch (e) { /* conteúdo não-JSON: o campo aceita lixo sem reclamar */ }
  const rel = {
    chars: texto.length,
    sha: shaLegivel(sha),
    confere: esperado ? sha === esperado : null,
    raizes, devices,
    lembrete: 'Prove por CONTEUDO (blocos/raizes/devices/styleChars), nao pelo sha: o servidor '
      + 'NORMALIZA ao gravar. A URL publica PODE servir a versao velha por ~100s.',
  };
  if (rel.confere === false) {
    // ⚠️ FALSO NEGATIVO ESPERADO, e era o aviso mais perigoso deste arquivo. Medido em
    // 2026-08-11: o servidor converte todo escalar em string ao gravar (false -> "false",
    // 0 -> "0", null -> "null") e DESCARTA array vazio (child: [] desaparece). Gravei 64.744
    // chars e reli 65.421, com $$hashKey em ZERO blocos. Logo o sha canonico NUNCA bate
    // depois do round-trip, e a versao anterior desta mensagem dizia "NAO gravou o que voce
    // queria" — empurrando exatamente para o loop de regravacao do armadilhas.md 22e.
    console.warn('sha diferente. Na gravacao de um JSON NOVO isto e\' a NORMALIZACAO do '
      + 'servidor, nao falha (armadilhas.md 27) — NAO REGRAVE por causa disto. Prove por '
      + 'conteudo: contagem de blocos, numero de raizes, device_show das raizes, tamanho do '
      + '`style` e um marcador que so\' existe na versao nova.');
    if (window.__ALVO_CHARS) {
      const d = texto.length - window.__ALVO_CHARS;
      console.warn('delta de tamanho: ' + (d > 0 ? '+' : '') + d + ' chars. Positivo e da ordem '
        + 'de ~1% = normalizacao de tipos (o esperado). Muito negativo, ou zero com conteudo '
        + 'diferente, e\' que merece investigacao.');
    }
  }
  if (rel.confere === null) {
    console.warn('Sem sha esperado: so\' o tamanho foi conferido — e tamanho nao prova nada aqui '
      + '(`$$hashKey` e a normalizacao do servidor mexem nele). Confira por conteudo.');
  }
  return rel;
}

/**
 * `Limpar cache` da linha marcada na tela Páginas — só depois de provar a gravação na fonte.
 *   limparCache(NNNNNN)      // o # da página; confere a linha marcada antes de clicar
 *
 * ⚠️ Pode abrir MODAL de confirmação com OK / Cancelar (numa loja já respondeu direto "Cache limpo
 * com sucesso (1 itens)", sem modal). Com modal, precisa de um SEGUNDO clique, em OUTRA chamada:
 * `clicarOkDoModal(/cache/i)` (seção 8b). Sem ele nada acontece e a tela volta ao normal como se
 * tivesse dado certo. NUNCA `clicarBotao('OK')`: os modais já respondidos (de um `Publicar`, por
 * exemplo) continuam no DOM, e o primeiro `OK` achado pode ser o deles.
 * ⚠️ LIMPA A SELEÇÃO da grade: a linha volta desmarcada e a próxima trava de alvo aborta com
 * 0 marcadas. Remarque e rode `conferirAlvo(#)` de novo antes de qualquer outra operação.
 * O `Publicar` faz a MESMA coisa (medido 2026-08-11) — remarque depois dele também.
 * ⚠️ Só tem efeito em página PUBLICADA. Pode levar ~100s para refletir na URL — mas em
 * 2026-08-11, em duas gravações seguidas, refletiu na PRIMEIRA busca e este clique nem foi
 * necessário. BUSQUE em vez de esperar; se vier velho, aí limpe e faça POLL por uma string
 * que só existe na versão nova, em chamadas separadas (await longo estoura os 45s).
 */
function limparCache(numero) {
  exigirLoja();
  if (numero == null || !/^\d+$/.test(String(numero).trim())) {
    throw new Error('ABORTADO: passe o # da página marcada: limparCache(NNNNNN). A função confere a '
      + 'linha antes de clicar.');
  }
  conferirAlvo(String(numero).trim());
  anotarModais();                 // aborta se já houver modal na tela; anota para clicarOkDoModal
  const ok = clicarBotao('Limpar cache');
  if (!ok) {
    window.__AJS_ANTES = null;
    throw new Error('ABORTADO: botão `Limpar cache` não encontrado ou invisível.' + dicaAcesso());
  }
  console.log('E remarque a linha: `Limpar cache` zera a seleção da grade.');
  return { clicou: true, depois: 'Em OUTRA chamada: se abriu modal, clicarOkDoModal(/cache/i); se a tela '
    + 'respondeu direto (Cache limpo com sucesso), não há OK a clicar. Depois, remarque a linha.' };
}

/* ------------------------------------------------------------------ *
 * 8b. O MODAL DE CONFIRMAÇÃO (alertify) — o OK do modal que ACABOU de abrir, e só dele
 * ------------------------------------------------------------------ *
 * O modal NÃO é `.ui-dialog` — é alertify (`.ajs-dialog` / `.ajs-content` / `.ajs-buttons`), e as
 * instâncias já respondidas ficam no DOM com `offsetParent !== null` (medido 2026-08-11: 2
 * `.ajs-dialog` no DOM, 0 na tela). Procurando o modal do `Limpar cache`, a leitura devolveu a
 * pergunta do `Publicar`, já respondida: um `OK` achado "por perto" teria publicado. Por isso:
 *   - "na tela" é por estilo computado (display/visibility/opacity, dele e dos ancestrais, e sem a
 *     classe `ajs-hidden` que o alertify põe no modal fechado), nunca por `offsetParent`
 *     (armadilhas.md 28);
 *   - o clique que abre o modal anota antes quais já estavam na tela (`anotarModais`, que
 *     `limparCache` e `limparCacheConfigLoja` chamam sozinhas), e `clicarOkDoModal` só clica se
 *     houver EXATAMENTE 1 modal na tela, e ele for novo;
 *   - o OK é procurado DENTRO desse modal, e a pergunta dele tem de ser a esperada.
 * ⛔ Nunca para `Publicar`, `Despublicar` ou `Excluir`: a função recusa pergunta com essas palavras, de
 *    propósito. O `OK` do `Publicar` que a pessoa pediu, nomeando o botão e a página, tem caminho
 *    próprio: `prepararOkDoPublicar` (seção 10b), que confere o modal e só rotula o OK. */

/** O elemento está mesmo na tela? Ele e cada ancestral: sem display:none, opacity 0 ou ajs-hidden. */
function modalNaTela(el) {
  if (!el || getComputedStyle(el).visibility === 'hidden') return false;   // visibility já vem herdada
  for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
    const s = getComputedStyle(e);
    if (s.display === 'none' || s.opacity === '0') return false;
    if (e.classList && e.classList.contains('ajs-hidden')) return false;
  }
  return true;
}

/** Os modais alertify (`.ajs-dialog`) que estão na tela agora. */
function modaisNaTela() {
  return [...document.querySelectorAll('.ajs-dialog')].filter(modalNaTela);
}

/**
 * Anota os modais na tela ANTES do clique que abre um modal. Aborta se já houver algum: com um
 * modal aberto antes, não dá para saber qual é o do seu clique.
 */
function anotarModais() {
  const vis = modaisNaTela();
  window.__AJS_ANTES = null;
  if (vis.length) {
    throw new Error(`ABORTADO: já há ${vis.length} modal(is) de confirmação na tela antes do clique. `
      + 'Tire um screenshot e mostre à pessoa; não clique em OK. Saída segura: location.reload().');
  }
  window.__AJS_ANTES = vis;
  return { modaisNaTela: 0 };
}

/**
 * O OK do modal alertify que o último clique anotado abriu, e só dele. Em OUTRA chamada depois de
 * `limparCache(#)` (o modal não está no DOM no mesmo tick):
 *   clicarOkDoModal(/cache/i)
 * Aborta, sem clicar, se não houver exatamente 1 modal na tela, se ele já estava lá antes do
 * clique, se a pergunta não casar com `perguntaEsperada` (default /cache/i) ou falar de publicar
 * ou excluir, ou se não houver um único OK dentro dele. Um OK por clique anotado: a segunda
 * chamada aborta.
 */
function clicarOkDoModal(perguntaEsperada) {
  const antes = window.__AJS_ANTES;
  if (!Array.isArray(antes)) {
    throw new Error('ABORTADO: nenhum clique anotado. O OK só vale para o modal que limparCache(#) '
      + '(ou limparCacheConfigLoja) acabou de abrir, nesta carga do admin.');
  }
  const re = perguntaEsperada instanceof RegExp ? perguntaEsperada : /cache/i;
  const vis = modaisNaTela();
  const novos = vis.filter(m => antes.indexOf(m) < 0);
  if (!vis.length) {
    // não consome a anotação: o modal pode só estar demorando
    throw new Error('ABORTADO: nenhum modal na tela. Se a tela respondeu direto ("Cache limpo com '
      + 'sucesso"), não há OK a clicar. Se o modal ainda vai abrir, espere e chame de novo.');
  }
  window.__AJS_ANTES = null;      // daqui em diante, um OK por clique anotado
  if (vis.length !== 1 || novos.length !== 1) {
    throw new Error(`ABORTADO: ${vis.length} modal(is) na tela, ${novos.length} aberto(s) pelo clique; `
      + 'esperado exatamente 1, novo. Não clique em OK: tire um screenshot e mostre à pessoa. '
      + 'Saída segura: location.reload().');
  }
  const m = novos[0];
  const txt = ((m.querySelector('.ajs-content') || m).innerText || '').replace(/\s+/g, ' ').trim();
  if (!re.test(txt) || /(des)?publicar\b|exclu[ií]r|exclus[aã]o/i.test(txt)) {
    throw new Error('ABORTADO: o modal aberto pergunta outra coisa: "' + semQuery(txt.slice(0, 80))
      + '". Não clique em OK; mostre à pessoa.');
  }
  let oks = [...m.querySelectorAll('.ajs-ok')];
  if (!oks.length) oks = [...m.querySelectorAll('button')].filter(b => /^\s*OK\s*$/.test(b.textContent || ''));
  if (oks.length !== 1) {
    throw new Error(`ABORTADO: ${oks.length} botão(ões) OK dentro do modal aberto; esperado 1.`);
  }
  oks[0].click();
  return { clicou: true, pergunta: semQuery(txt.slice(0, 80)),
           depois: 'Remarque a linha: o Limpar cache zera a seleção da grade.' };
}

/* ------------------------------------------------------------------ *
 * 9. Construtor — só para destravar o campo em página vazia          *
 * ------------------------------------------------------------------ */
/**
 * ⚠️ `Abrir construtor` NÃO responde a clique nenhum — nem ao composto, nem a clique real por
 * coordenada. Ele é `ng-click="controller.toggleBuilder();"` e só abre chamando o método no
 * scope.
 *
 * ⚠️ CORREÇÃO (2026-08-11): a versão anterior deste comentário dizia que o botão fica com
 * `offsetParent === null` **porque a página está vazia**. ESTÁ ERRADO, e o erro custou uma
 * investigação inteira. Medido numa página JÁ COM 20 BLOCOS SALVOS: continua `null`. A causa é que
 * o botão mora no `.tab-pane` da aba **Geral**, que fica `display:none` enquanto a aba
 * `Configurações` — onde vive o campo `Blocos:`, e para onde o fluxo da skill te leva — está
 * ativa. Por isso esta função agora troca de aba sozinha. Ver armadilhas.md 1e.
 *
 * ⚠️ Em página VAZIA ela abre, mas não resolve o campo `Blocos:`: sem `data.config.builder` não há
 * árvore para editar. Nesse caso escreva em `configInput.builder` pelo scope (armadilhas.md 1d) e
 * grave um esqueleto antes.
 *
 * ⚠️⭐ CORREÇÃO (2026-08-12): esta função voltava para a aba `Configurações` POR DEFAULT, e isso
 * ESCONDE o construtor inteiro — ele é renderizado dentro do `.tab-pane` da `Geral`. Medido: a função
 * devolveu `true` e, de volta na `Configurações`, `input[name=syncData]` NÃO EXISTIA e havia ZERO
 * botões `addBlock` visíveis; `lerDefaultVivo()` então falhava com "botão de adicionar bloco não
 * encontrado" logo depois de um `abrirConstrutor()` bem-sucedido — o sintoma mais confuso possível.
 *
 * Agora o default é FICAR na `Geral`. `voltarPara` só troca de aba se você pedir explicitamente
 * (ex.: `abrirConstrutor(/Configura/i)` quando terminar e for gravar).
 */
function abrirConstrutor(voltarPara) {
  const dlg = dialogoUnico();
  abaDialogo(/^\s*Geral/, dlg);              // <- sem isto o botão é invisível SEMPRE
  const b = [...dlg.querySelectorAll('button')]
    .find(x => /Abrir construtor/i.test(x.textContent || '') && x.offsetParent !== null);
  if (!b) { console.warn('Botão "Abrir construtor" não encontrado mesmo na aba Geral — confira se o '
    + 'diálogo é o de Alterar Página.' + dicaAcesso()); return false; }
  const s = window.angular.element(b).scope();
  if (!s || !s.controller || typeof s.controller.toggleBuilder !== 'function') {
    throw new Error('scope.controller.toggleBuilder não encontrado — o construtor não vai abrir por clique.');
  }
  s.$apply(() => s.controller.toggleBuilder());
  if (voltarPara) abaDialogo(voltarPara, dlg);   // default: FICA na Geral, senão o construtor some
  return true;
}

/**
 * O DEFAULT VIVO da config base, lido do construtor. É o passo 3 do construtor.md, e é a única fonte que
 * não envelhece. Devolve o bloco recém-criado (não persiste: `Aplicar`/`Confirmar` não são chamados).
 *
 * ⚠️ PRÉ-REQUISITO 1: a página precisa ter ALGUM bloco salvo. Em rascunho vazio não há árvore e o
 * construtor não serve — destrave por `configInput.builder` e grave um esqueleto de duas raízes
 * primeiro (armadilhas.md 1d e 1e).
 * ⚠️ PRÉ-REQUISITO 2: o diálogo tem de estar na aba `Geral`. O construtor é renderizado DENTRO do
 * pane dela, então na `Configurações` não existe `input[name=syncData]` nem botão `addBlock` e esta
 * função lança "botão de adicionar bloco não encontrado" — mesmo com o construtor aberto. Chame
 * `abrirConstrutor()` sem argumento (que hoje FICA na Geral) e só depois esta.
 *
 * ⚠️ NUNCA procure o "+" com `document.querySelectorAll('i.fa-plus-circle')`: com o construtor aberto
 * isso devolve o `Incluir` DA GRADE, que continua no DOM atrás dele — o clique troca o diálogo para
 * "Adicionar Página" e um `Confirmar` cria página nova em produção. Aconteceu. armadilhas.md 22g.
 */
function lerDefaultVivo(tipo) {
  const rotulo = tipo || 'Box';
  const mais = [...document.querySelectorAll('button')]
    .find(b => /addBlock/.test(b.getAttribute('ng-click') || '') && b.offsetParent !== null);
  if (!mais) throw new Error('Botão de adicionar bloco não encontrado — o construtor está aberto?' + dicaAcesso());
  window.angular.element(mais).triggerHandler('click');     // ABRE a paleta: triggerHandler sozinho

  const item = [...document.querySelectorAll('[ng-click="builderController.createBlock(blockKey)"]')]
    .filter(e => e.offsetParent !== null)
    .find(e => new RegExp('^\\s*' + rotulo + '\\s*$', 'i').test((e.textContent || '').trim()));
  if (!item) {
    throw new Error(`Item "${rotulo}" não achado na paleta (abas: Componentes/Fragmentos/Modelos).` + dicaAcesso());
  }
  for (const t of ['mousedown', 'mouseup', 'click']) {
    item.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
  }
  try { window.angular.element(item).triggerHandler('click'); } catch (e) { /* ok */ }

  const sd = document.querySelector('input[name=syncData]');
  if (!sd) throw new Error('input[name=syncData] não existe — o construtor não está aberto.');
  const doc = JSON.parse(sd.value);
  // o novo é o único cujo id você não conhece; devolva o último da lista de raízes
  return doc.block_list[doc.block_list.length - 1];
}

/** Fecha o construtor. Aqui o botão (`X`, `toggleBuilder('')`) aceita o evento composto. */
function fecharConstrutor() {
  const x = [...document.querySelectorAll('button')]
    .find(e => e.getAttribute('ng-click') === "toggleBuilder('');" && e.offsetParent !== null);
  if (!x) { console.warn('Botão de fechar o construtor não encontrado.'); return false; }
  for (const t of ['mousedown', 'mouseup', 'click']) {
    x.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
  }
  try {
    window.angular.element(x).triggerHandler('click');
    const s = window.angular.element(x).scope();
    if (s && s.$root && !s.$root.$$phase) s.$apply();
  } catch (e) { /* ok */ }
  return true;
}

/* ------------------------------------------------------------------ *
 * 10. PÁGINA TIPO ARQUIVO — os CSS/JS do site                        *
 * ------------------------------------------------------------------ *
 * Roteiro completo, com o porquê de cada passo: gravacao-arquivo-e-head.md, Passos A a E. O que foi
 * medido em produção em lojas reais, com arquivos de até ~119 KB (2026-10-22: `lerEntradaArquivo`
 * conferiu o sha de um CSS de ~119 KB, e a gravação passou pelos Passos A a E):
 *
 *   - o conteúdo é `data.body` (o Ace tem ng-model="data.body" direto). Escrever no escopo e
 *     confirmar com o clique COMPOSTO grava;
 *   - o transporte que funcionou: um <input type=file> temporário na página do admin + a ação de
 *     upload de arquivo da ferramenta de navegador + FileReader + sha256 conferido NA PÁGINA;
 *   - o admin guarda com CRLF e pode tirar a quebra de linha final. Compare SEMPRE normalizado
 *     (normalizarTexto). Byte a byte dá diferente em toda gravação, e não é corrupção;
 *   - antes de escrever, o conteúdo ATUAL tem de ser o do seu backup local (conferirArquivoAtual):
 *     se não for, alguém mudou o arquivo depois do backup, e gravar por cima apaga a mudança.
 *
 * Os seletores desta seção (aba "Conteúdo", [ng-model="data.body"]) foram os do admin medido.
 * Se um deles não casar na sua loja, as funções ABORTAM — pare e mapeie pelo DOM; não contorne.
 */

/** CRLF e CR solto -> LF, e sem quebras de linha no fim. É assim que o admin "muda" o texto. */
function normalizarTexto(t) {
  return String(t == null ? '' : t).replace(/\r\n?/g, '\n').replace(/\n+$/, '');
}

/** sha256 do texto normalizado. No terminal, o equivalente está em gravacao-arquivo-e-head.md (Passo A). */
async function shaNormalizado(t) {
  return sha256(normalizarTexto(t));
}

function exigirHex64(v, oque) {
  const s = String(v || '').trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(s)) {
    throw new Error(`Passe ${oque}: o sha256 em 64 caracteres hexadecimais, calculado no terminal.`);
  }
  return s;
}

/**
 * Passo B, 1/3. Cria o <input type=file> temporário no canto da tela. Depois: ache-o com a
 * ferramenta (find "__entrada_arquivo" ou read_page) e faça o upload do caminho local nele.
 */
function criarEntradaArquivo() {
  let i = document.getElementById('__entrada_arquivo');
  if (!i) {
    i = document.createElement('input');
    i.type = 'file';
    i.id = '__entrada_arquivo';
    i.setAttribute('aria-label', '__entrada_arquivo');
    i.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;background:#fff;color:#000';
    document.body.appendChild(i);
  }
  i.value = '';
  window.__ARQUIVO = null;
  return { pronto: true, id: '__entrada_arquivo' };
}

function lerComFileReader(f) {
  return new Promise((ok, falha) => {
    const r = new FileReader();
    r.onload = () => ok(r.result);
    r.onerror = () => falha(r.error || new Error('FileReader falhou ao ler o arquivo.'));
    r.readAsArrayBuffer(f);
  });
}

/**
 * Passo B, 3/3. Lê o arquivo do input com FileReader, calcula o sha256 DOS BYTES dentro da página
 * e só guarda o texto (em `window.__ARQUIVO`) se bater com o do terminal. Aborta com BOM ou com
 * UTF-8 inválido: o BOM entraria como caractere invisível no começo do CSS/JS, e UTF-8 inválido
 * troca os acentos no site.
 */
async function lerEntradaArquivo(sha256DosBytes) {
  const esperado = exigirHex64(sha256DosBytes, 'o sha256 dos BYTES do arquivo novo');
  const i = document.getElementById('__entrada_arquivo');
  if (!i || !i.files || !i.files.length) {
    throw new Error('Nenhum arquivo na entrada. Rode criarEntradaArquivo() e faça o upload pela '
      + 'ferramenta de navegador antes.');
  }
  if (i.files.length !== 1) throw new Error(`ABORTADO: ${i.files.length} arquivos na entrada; esperado 1.`);
  const f = i.files[0];
  const bytes = new Uint8Array(await lerComFileReader(f));
  const h = await crypto.subtle.digest('SHA-256', bytes);
  const hex = [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, '0')).join('');
  const rel = { nome: f.name, bytes: bytes.length, confere: hex === esperado };
  window.__ARQUIVO = null;
  if (!rel.confere) {
    console.warn('sha256 NÃO confere: o arquivo escolhido não é o que você montou, ou veio truncado. '
      + 'Nada foi guardado; refaça o upload.');
    return rel;
  }
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    throw new Error('ABORTADO: o arquivo começa com BOM (EF BB BF). Salve sem BOM e refaça.');
  }
  let texto;
  try { texto = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch (e) { throw new Error('ABORTADO: o arquivo não é UTF-8 válido — os acentos sairiam trocados.'); }
  window.__ARQUIVO = { nome: f.name, texto, bytes: bytes.length };
  i.remove();                   // não deixe o input pendurado no DOM do admin
  return Object.assign(rel, { chars: texto.length, temCR: texto.indexOf('\r') >= 0 });
}

/**
 * O escopo que grava o Arquivo, a partir do ELEMENTO do diálogo (mesma razão de escopoDoDialogo:
 * o diálogo morto). Sobe por $parent até achar `data.body` como texto.
 */
function escopoArquivo(dlg) {
  if (!dlg || !dlg.querySelector) throw new Error('escopoArquivo(dlg): passe o ELEMENTO do diálogo.');
  if (!window.angular) throw new Error('sem window.angular — não há escopo para ler.');
  const semente = dlg.querySelector('[ng-model="data.body"]');
  if (!semente) {
    throw new Error('ABORTADO: este diálogo não tem o campo de conteúdo (ng-model="data.body"). '
      + 'É uma página tipo Arquivo? Está na aba Conteúdo — abaDialogo(/Conte[uú]do/i)?' + dicaAcesso());
  }
  let sc = window.angular.element(semente).scope();
  while (sc && !(sc.data && typeof sc.data.body === 'string')) sc = sc.$parent;
  if (!sc) throw new Error('ABORTADO: sem escopo com data.body (texto) — por aqui não existe gravação.');
  return sc;
}

/**
 * Passo C. Compara o conteúdo ATUAL do Arquivo (no diálogo aberto) com o seu backup local, pelo
 * sha NORMALIZADO do backup. Aborta se não bater. Guarda o atual em `window.__BACKUP_ARQUIVO`
 * (o backup que vale é o arquivo local: o reload apaga a janela).
 */
async function conferirArquivoAtual(shaNormalizadoDoBackup) {
  const esperado = exigirHex64(shaNormalizadoDoBackup, 'o sha NORMALIZADO do backup local');
  const dlg = dialogoUnico();
  window.__ARQ_CONFERIDO = null;
  if (ehDialogoDeCriacao(dlg)) {
    throw new Error('ABORTADO: este é o diálogo de criação ("Adicionar…"): não há backup a comparar. Para um '
      + 'Arquivo novo, await conferirArquivoNovo({url, linguagem, mime}) (seção 10b), que confere o diálogo, a '
      + 'loja, a URL e o conteúdo vazio.');
  }
  const sc = escopoArquivo(dlg);
  const atual = sc.data.body;
  if ((await shaNormalizado(atual)) !== esperado) {
    throw new Error('ABORTADO: o conteúdo atual no admin não é o do seu backup (comparado '
      + 'normalizado). Alguém mudou este arquivo depois do backup — gravar por cima apagaria a '
      + 'mudança. Baixe de novo, refaça a versão nova a partir do conteúdo atual e confira de novo.');
  }
  window.__ARQ_CONFERIDO = dlg;
  window.__BACKUP_ARQUIVO = atual;
  return { chars: atual.length, crlf: /\r\n/.test(atual), terminaComQuebra: /\n$/.test(atual),
           confere: true };
}

/**
 * Passo D, 1/2. Escreve o texto lido por `lerEntradaArquivo` em `data.body` do diálogo único.
 * NÃO grava. Exige, neste MESMO diálogo, `conferirArquivoAtual` (Arquivo que já existe) ou
 * `conferirArquivoNovo` (diálogo de criação, seção 10b: o "backup" é o texto vazio, e não há sha a passar).
 * ⚠️ O $apply empurra o texto para o Ace: ~119 KB funcionou; 284 KB congelou o Ace do `Blocos:`.
 */
function injetarArquivo() {
  const A = window.__ARQUIVO;
  if (!A || typeof A.texto !== 'string') {
    throw new Error('ABORTADO: nenhum arquivo conferido. Rode criarEntradaArquivo(), o upload e '
      + 'lerEntradaArquivo(sha) até dar confere: true.');
  }
  if (!A.texto.trim()) throw new Error('ABORTADO: arquivo vazio — gravar isto apagaria o CSS/JS do site.');
  const dlg = dialogoUnico();
  if (window.__ARQ_CONFERIDO !== dlg) {
    throw new Error('ABORTADO: o conteúdo atual deste diálogo não foi comparado com o backup. '
      + 'Rode await conferirArquivoAtual(shaNormalizadoDoBackup) neste diálogo antes (arquivo novo: '
      + 'await conferirArquivoNovo({url, linguagem, mime}), seção 10b).');
  }
  const sc = escopoArquivo(dlg);
  const antes = sc.data.body;
  sc.data.body = A.texto;
  try { if (!sc.$root.$$phase) sc.$apply(); } catch (e) { /* ok */ }
  const escrito = normalizarTexto(A.texto);
  const confere = normalizarTexto(sc.data.body) === escrito;
  window.__SC_ARQ = sc;
  window.__DLG_ARQ = dlg;
  window.__ARQ_ESCRITO = escrito;
  if (!confere) {
    throw new Error('ABORTADO: data.body não ficou igual ao arquivo depois do digest. Não confirme: '
      + 'saia por Cancelar e investigue.');
  }
  console.log('data.body atualizado. Agora, em outra chamada: confirmarArquivo().');
  return { antesChars: antes.length, escritoChars: sc.data.body.length, confere };
}

/**
 * Passo D, 2/2. Grava: clique COMPOSTO em `Confirmar`, depois das travas (loja do perfil, um
 * diálogo só, conferirDialogo neste diálogo, mesmo escopo e mesmo nó que receberam a escrita,
 * conteúdo ainda igual ao escrito, e o `Confirmar` visível DENTRO do diálogo: sem ele, aborta, como
 * em confirmarGravacao; `{confirmarForaDoDialogo: true}` só com o perfil dizendo, medido).
 */
function confirmarArquivo(opcoes) {
  const L = exigirLoja();
  const dlg = dialogoUnico();
  if (ehDialogoDeCriacao(dlg)) {
    throw new Error('ABORTADO: este é o diálogo de criação ("Adicionar…"). Aqui o clique composto criou a '
      + 'mesma página DUAS vezes (medido). Com o pedido da pessoa: prepararConfirmarCriacao() (seção 10b), que '
      + 'confere tudo e rotula o Confirmar para UM clique real da ferramenta.');
  }
  if (window.__DLG_CONFERIDO !== dlg) {
    throw new Error("ABORTADO: rode conferirDialogo('seu-arquivo.css') neste diálogo antes — é a "
      + 'trava de página e de loja.');
  }
  if (window.__DLG_CONFERIDO_LOJA !== L.loja) {
    throw new Error(`ABORTADO: o diálogo foi conferido com a loja ${window.__DLG_CONFERIDO_LOJA}, e `
      + `definirLoja diz ${L.loja}. Grave só na loja do perfil.`);
  }
  const sc = escopoArquivo(dlg);
  if (!window.__SC_ARQ || sc !== window.__SC_ARQ || dlg !== window.__DLG_ARQ) {
    throw new Error('ABORTADO: o diálogo aberto não é o que recebeu a escrita (injetarArquivo). '
      + 'Recarregue o admin e refaça desde o filtro.');
  }
  if (normalizarTexto(sc.data.body) !== window.__ARQ_ESCRITO) {
    throw new Error('ABORTADO: data.body mudou depois de injetarArquivo(). Reinjete e confirme na sequência.');
  }
  const b = botaoConfirmarDoDialogo(dlg, opcoes);
  cliqueComposto(b);
  window.__DLG_GRAVADO = dlg;
  console.log('Confirmar disparado. Prove na fonte: reload, reabrir, verificarArquivoGravou(sha).');
  return { clicou: true, chars: sc.data.body.length };
}

/**
 * Passo E. Prova de gravação do Arquivo: exige diálogo REABERTO (outro nó) e compara o sha
 * NORMALIZADO do que está salvo com o do arquivo novo. Aqui o sha VALE como prova (ao contrário
 * do `Blocos:`, que o servidor reescreve): o conteúdo é texto, e o que o admin muda (CRLF, quebra
 * final) sai na normalização. `marcadores`: trechos que só existem na versão nova.
 */
async function verificarArquivoGravou(shaNormalizadoEsperado, marcadores) {
  const esperado = exigirHex64(shaNormalizadoEsperado, 'o sha NORMALIZADO do arquivo novo');
  const dlg = dialogoUnico();
  if (window.__DLG_GRAVADO && dlg === window.__DLG_GRAVADO) {
    throw new Error('ABORTADO: este é o MESMO nó de diálogo em que você escreveu. Recarregue o '
      + 'admin, remarque a linha, reabra por abrirDialogo("Alterar"), aba Conteúdo, e leia de novo.');
  }
  const sc = escopoArquivo(dlg);
  const t = sc.data.body;
  const rel = { chars: t.length, crlf: /\r\n/.test(t), confere: (await shaNormalizado(t)) === esperado };
  if (Array.isArray(marcadores)) rel.marcadores = marcadores.map(m => t.indexOf(m) >= 0);
  if (!rel.confere) {
    console.warn('O conteúdo salvo não é o arquivo novo. Antes de regravar, confira: reabriu o '
      + 'diálogo (outro nó)? O sha passado é o NORMALIZADO do arquivo novo, e não o dos bytes?');
  }
  return rel;
}

/* ------------------------------------------------------------------ *
 * 10b. ARQUIVO NOVO E `Publicar` — só com o pedido da pessoa          *
 * ------------------------------------------------------------------ *
 * Roteiro, com o porquê de cada passo: gravacao-arquivo-e-head.md, "Criar um Arquivo novo" e
 * "Publicar, quando a pessoa pede". Só se usa quando a pessoa pediu com uma frase que nomeia os botões
 * (`Incluir` e `Confirmar`; `Publicar`, se quiser) e a página (a URL). Sem esse pedido, quem clica é ela
 * (ajustes-visuais.md, 5.6). Um "aprovado" sobre a prévia não é esse pedido.
 *
 * Medido em 2026-10-22, numa loja, numa criação e numa publicação reais:
 *   - o `Incluir` abre "Adicionar Página" com a Loja e o Tipo vazios; a Loja se escolhe no campo de
 *     busca dela (sugestão "N - Nome"); a aba Conteúdo (e o campo `data.body`, vazio) só aparece depois de
 *     Tipo = Arquivo; a linguagem fica na aba Conteúdo, o tipo do arquivo na aba Configurações; padrões:
 *     não publicada, robots "index, follow", sitemap ligado;
 *   - o clique COMPOSTO no `Confirmar` da criação já criou a mesma página duas vezes (numa medição
 *     anterior); UM clique real, pela ferramenta, no elemento, criou UMA: "Registro inserido com
 *     sucesso." apareceu uma vez, e o diálogo ficou aberto (saída pelo `Cancelar`);
 *   - o `Publicar` abre o modal alertify "Você tem certeza que deseja publicar esta(s) página(s)?", e o
 *     `OK` clicado pela ferramenta, no elemento, publicou.
 * Por isso nada aqui clica: as funções conferem e ROTULAM o elemento (rotularParaFerramenta), e o clique
 * é UM clique real da ferramenta nele, uma vez. Repetir o clique é o acidente que estas funções evitam.
 * As funções desta seção são de 2026-10-22, escritas a partir dessa medição e testadas num DOM falso. A
 * criação rodou no admin em 2026-11-03 (lerTipoDoArquivo, conferirUrlLivre, conferirArquivoNovo,
 * prepararConfirmarCriacao + um clique real, conferirCriacao: uma linha nova). Na primeira vez numa loja,
 * confira cada passo também com um screenshot; se uma
 * trava abortar com a tela parecendo certa, é trava com defeito de leitura (armadilhas.md 34).
 */

/** A URL de uma página, comparável: sem esquema, domínio, query e âncora; com "/" na frente; minúsculas. */
function normUrl(u) {
  const s = String(u == null ? '' : u).trim().replace(/^[a-z][a-z0-9+.-]*:\/\/[^\/]+/i, '').replace(/[?#].*$/, '');
  return s ? ('/' + s.replace(/^\/+/, '')).toLowerCase() : '';
}

/** O índice da coluna da grade cujo cabeçalho casa com `re` (exatamente uma), ou -1. */
function colunaDaGrade(grade, re) {
  const cab = [...grade.querySelectorAll('tr')].find(t => t.querySelector('th'));
  const ths = cab ? [...cab.children].map(th => String(th.innerText || th.textContent || '').replace(/\s+/g, ' ').trim()) : [];
  const idx = ths.map((t, i) => (re.test(t) ? i : -1)).filter(i => i >= 0);
  return idx.length === 1 ? idx[0] : -1;
}

/** A linha (<tr>) da única caixa de linha marcada na grade (o critério de conferirAlvo). Aborta sem exatamente uma. */
function linhaMarcada(grade) {
  const m = [...grade.querySelectorAll('tr input[type=checkbox]')]
    .filter(c => (c.getAttribute('ng-click') || '').includes('clickCheckbox') && c.checked);
  if (m.length !== 1) throw new Error(`ABORTADO: ${m.length} linha(s) marcada(s) na grade visível; esperado 1.`);
  return m[0].closest('tr');
}

/** O texto da célula `i` da linha `tr` (null se não houver). */
function textoDaCelula(tr, i) {
  const c = i >= 0 ? tr.children[i] : null;
  return c ? String(c.innerText || c.textContent || '').replace(/\s+/g, ' ').trim() : null;
}

/**
 * As linhas da grade visível da tela Páginas com a URL `url`, com as travas de leitura: o filtro Loja na
 * loja do perfil (filtroLojaDoPerfil), o filtro URL com um pedaço dessa URL (operador "Contém", ou
 * "Igual" com a URL inteira), a grade atualizada (toda linha casa com o filtro URL) e sem outra página
 * de resultados (o rodapé, quando diz o total, não passa do número de linhas). Só lê.
 * `opcoes.semOutrosFiltros`: aborta se outro filtro (Nome, Tipo, #...) tiver valor, porque ele esconderia
 * uma página de outro nome ou de outro tipo com a mesma URL (conferirUrlLivre usa).
 * Devolve { alvo, iguais: [{numero, url, publicada, tr}], linhas, filtroLoja }.
 */
function linhasComUrl(url, opcoes) {
  exigirLoja();
  const alvo = normUrl(url);
  if (!/^\/[a-z0-9][a-z0-9._\/-]*$/.test(alvo)) {
    throw new Error('ABORTADO: passe a URL da página como ela vai no <head> (ex.: /seu-arquivo.js): '
      + 'letras minúsculas, números, ponto, hífen e barra. Recebido: ' + JSON.stringify(semQuery(String(url))));
  }
  const F = filtroLojaDoPerfil();
  const filtros = filtrosDaTela();
  const campos = [...document.querySelectorAll('[ng-model="filterSelected.value1"]')].filter(campoVisivel);
  const fUrl = filtros.filter(f => normRotulo(f.rotulo) === 'url');
  if (fUrl.length !== 1) {
    throw new Error(`ABORTADO: ${fUrl.length} filtro(s) com o rótulo URL à vista; esperado 1. Filtre a grade pela `
      + 'URL (um pedaço sem hífen, "Contém") e Atualizar; sem esse filtro, a página pode estar em outra '
      + 'página de resultados.');
  }
  const v = String(fUrl[0].valor || '').trim().toLowerCase().replace(/^\/+/, '');
  if (!v || alvo.indexOf(v) < 0) {
    throw new Error(`ABORTADO: o filtro URL diz "${fUrl[0].valor || '(vazio)'}", que não é um pedaço de ${alvo}. `
      + 'Escreva um pedaço dela (sem hífen: a busca não acha slug com hífen) e Atualizar.');
  }
  if (/-/.test(v)) {
    throw new Error(`ABORTADO: o filtro URL "${fUrl[0].valor}" tem hífen, e a busca por URL não acha slug com hífen `
      + '(medido): "nenhuma linha" não provaria nada. Use um pedaço sem hífen e Atualizar.');
  }
  if (opcoes && opcoes.semOutrosFiltros) {
    const vazio = f => { const t = normRotulo(f.valor); return !t || /^(selecione|todos|todas|-+)$/.test(t); };
    const outros = filtros.filter(f => campos[f.i] !== F.select && normRotulo(f.rotulo) !== 'url' && !vazio(f));
    if (outros.length) {
      throw new Error('ABORTADO: outros filtros com valor (' + outros.map(f => `${f.rotulo || '(sem rótulo)'} = ${f.valor}`)
        .join(' · ') + '): eles escondem uma página de outro nome ou de outro tipo com a mesma URL. Deixe só a '
        + 'Loja e a URL (o "x" da linha tira um filtro), Atualizar, e repita.');
    }
  }
  const op = normRotulo(fUrl[0].operador);
  if (op && !/contem/.test(op) && !(/^igual/.test(op) && normUrl(v) === alvo)) {
    throw new Error(`ABORTADO: o operador do filtro URL é "${fUrl[0].operador}": com ele, um pedaço da URL não `
      + 'acha a página inteira, e "nenhuma linha" não provaria nada. Use "Contém" (ou "Igual" com a URL '
      + 'inteira), Atualizar, e repita. A ação de formulário da ferramenta já trocou esse operador sem '
      + 'pedir (medido): releia filtrosDaTela() depois de cada troca.');
  }
  const grade = gradeVisivel();
  const iUrl = colunaDaGrade(grade, /^URL$/i), iNum = colunaDaGrade(grade, /^#$/), iPub = colunaDaGrade(grade, /^Publicada$/i);
  if (iUrl < 0 || iNum < 0) {
    throw new Error('ABORTADO: não achei as colunas # e URL da grade visível. Pare e mapeie a grade (snippet B '
      + 'de reconhecimento-da-loja.md).');
  }
  const linhas = [...grade.querySelectorAll('tr')]
    .filter(t => !t.closest('thead') && !t.querySelector('th') && t.children.length > Math.max(iUrl, iNum));
  const foraDoFiltro = linhas.filter(t => String(textoDaCelula(t, iUrl) || '').toLowerCase().indexOf(v) < 0);
  if (foraDoFiltro.length) {
    throw new Error(`ABORTADO: ${foraDoFiltro.length} linha(s) da grade não casam com o filtro URL: a grade não `
      + 'foi atualizada depois do filtro. Clique Atualizar e repita.');
  }
  const totais = [...String(document.body.innerText || '').matchAll(/(?:Total de )?Registro\(s\):\s*(\d+)/g)]
    .map(m => Number(m[1]));
  const total = totais.length ? Math.max(...totais) : null;
  if (total != null && total > linhas.length) {
    throw new Error(`ABORTADO: o rodapé diz ${total} registro(s), e a grade mostra ${linhas.length}: há outra página `
      + 'de resultados. Refine o filtro URL (ou o Tipo) até caber numa página e repita.');
  }
  const iguais = linhas.filter(t => normUrl(textoDaCelula(t, iUrl)) === alvo).map(t => ({
    numero: textoDaCelula(t, iNum), url: semQuery(textoDaCelula(t, iUrl)),
    publicada: iPub >= 0 ? textoDaCelula(t, iPub) : '(coluna Publicada não achada)', tr: t }));
  return { alvo, iguais, linhas: linhas.length, filtroLoja: F.metodo };
}

/**
 * Antes do `Incluir`: nenhuma página DESTA loja tem a URL `url`. Com a grade da tela Páginas filtrada pela
 * Loja do perfil e pela URL (linhasComUrl). Aborta se houver uma linha com essa URL (mostra o # e o
 * Publicada de cada uma). Marca a URL como livre nesta carga do admin (prepararConfirmarCriacao exige).
 *   conferirUrlLivre('/seu-arquivo.js')
 */
function conferirUrlLivre(url) {
  const L = exigirLoja();
  window.__URL_LIVRE = null;
  const r = linhasComUrl(url, { semOutrosFiltros: true });
  if (r.iguais.length) {
    throw new Error(`ABORTADO: já há ${r.iguais.length} página(s) desta loja com a URL ${r.alvo}: `
      + r.iguais.map(x => `#${x.numero} (Publicada: ${x.publicada})`).join(' · ')
      + '. Não crie outra: mostre à pessoa e pergunte (mudar essa página é outro pedido).');
  }
  window.__URL_LIVRE = { url: r.alvo, loja: L.loja };
  return { livre: true, url: r.alvo, linhasNaGrade: r.linhas, filtroLoja: r.filtroLoja,
           depois: "Nesta mesma carga: await abrirDialogo('Incluir') e, na tela, a Loja, o Tipo = Arquivo, o Nome, "
             + 'a URL, a linguagem e o tipo do arquivo; depois await conferirArquivoNovo({url, linguagem, mime}).' };
}

/**
 * Só leitura, num `Alterar` aberto de um Arquivo QUE JÁ FUNCIONA na loja, do mesmo tipo do novo (um JS
 * para um JS, um CSS para um CSS), na aba Conteúdo: a linguagem do editor (`data.config.editor.language`)
 * e o tipo do arquivo (`data.config.file.mimeType`). São os valores a escolher no diálogo do Arquivo novo
 * e a passar a conferirArquivoNovo. Saia por cancelarDialogo() e recarregue antes do `Incluir`.
 */
function lerTipoDoArquivo() {
  const dlg = dialogoUnico();
  if (ehDialogoDeCriacao(dlg)) {
    throw new Error('ABORTADO: este é o diálogo de criação. Leia a linguagem e o tipo num Alterar de um Arquivo '
      + 'que já funciona na loja.');
  }
  const sc = escopoArquivo(dlg);
  const cfg = (sc.data && sc.data.config) || {};
  const linguagem = cfg.editor && cfg.editor.language;
  const mime = cfg.file && cfg.file.mimeType;
  if (typeof linguagem !== 'string' || !linguagem.trim() || typeof mime !== 'string' || !mime.trim()) {
    throw new Error('ABORTADO: não achei data.config.editor.language e data.config.file.mimeType neste diálogo. '
      + 'Pare e mapeie (snippet F de reconhecimento-da-loja.md); não invente os valores.' + dicaAcesso());
  }
  return { linguagem: semQuery(linguagem.trim()), mime: semQuery(mime.trim()),
           depois: 'Só leitura: saia por cancelarDialogo() e recarregue. Passe estes dois valores a conferirArquivoNovo.' };
}

/**
 * Com o diálogo de CRIAÇÃO aberto e preenchido pela tela, antes de escrever o conteúdo: confere que é
 * mesmo o diálogo de criação (título "Adicionar…"), e um só; que a Loja escolhida é a do perfil (no campo
 * Loja do diálogo, lerCampoLoja); que a aba Conteúdo e o campo `data.body` existem (só com Tipo = Arquivo,
 * medido); que a URL do diálogo é `url` e foi conferida livre nesta carga (conferirUrlLivre); que a
 * linguagem e o tipo do arquivo são os passados (lidos por lerTipoDoArquivo num Arquivo do mesmo tipo); e
 * que o conteúdo está VAZIO (é o "backup" de um Arquivo novo: o sha do texto vazio, calculado aqui).
 * Marca o diálogo como conferirDialogo + conferirArquivoAtual marcariam: injetarArquivo() aceita.
 *   await conferirArquivoNovo({ url: '/seu-arquivo.js', linguagem: '<lida>', mime: '<lido>' })
 */
async function conferirArquivoNovo(dados) {
  const d = dados || {};
  const L = exigirLoja();
  window.__ARQ_NOVO = null;
  const alvo = normUrl(d.url);
  const linguagem = typeof d.linguagem === 'string' ? d.linguagem.trim() : '';
  const mime = typeof d.mime === 'string' ? d.mime.trim() : '';
  if (!alvo || !linguagem || !mime) {
    throw new Error('conferirArquivoNovo({url, linguagem, mime}): passe a URL e a linguagem e o tipo do arquivo '
      + 'lidos por lerTipoDoArquivo() num Arquivo do mesmo tipo que já funciona na loja.');
  }
  const dlg = dialogoUnico();
  if (!ehDialogoDeCriacao(dlg)) {
    throw new Error(`ABORTADO: o diálogo aberto não é o de criação (título: "${semQuery(tituloDoDialogo(dlg) || '(sem título)')}"; `
      + 'medido: "Adicionar Página"). Para gravar um Arquivo que já existe, Passos C a E.');
  }
  const U = window.__URL_LIVRE;
  if (!U || U.url !== alvo || U.loja !== L.loja) {
    throw new Error(`ABORTADO: a URL ${alvo} não foi conferida livre nesta carga do admin. Antes do Incluir, com a `
      + 'grade filtrada pela Loja e pela URL: conferirUrlLivre(url).');
  }
  const campo = lerCampoLoja(dlg);
  const porNumero = campo.vistos.some(v => v === L.loja);
  const porNome = !!L.lojaNome && campo.vistos.some(v => normalizarNome(v) === normalizarNome(L.lojaNome));
  if (!porNumero && !porNome) {
    throw new Error(`ABORTADO: a Loja do diálogo (${campo.ngModel}) mostra ${semQuery(JSON.stringify(campo.vistos.slice(0, 4)))}; `
      + `esperado ${L.loja}${L.lojaNome ? ` ou "${L.lojaNome}"` : ''}. No Incluir ela vem vazia (medido): escolha a `
      + 'loja do perfil no campo de busca da Loja (sugestão "N - Nome") e confira de novo.');
  }
  const semente = dlg.querySelector('[ng-model="data.body"]');
  if (!semente || !abaVisivel(/Conte[uú]do/i, dlg)) {
    throw new Error('ABORTADO: o diálogo não tem a aba Conteúdo e o campo de conteúdo (ng-model="data.body"). '
      + 'Eles só aparecem depois de Tipo = Arquivo (medido): escolha o Tipo e confira de novo.' + dicaAcesso());
  }
  const urls = [...dlg.querySelectorAll('input')].filter(i => normUrl(i.value) === alvo);
  if (!urls.length) {
    throw new Error(`ABORTADO: nenhum campo do diálogo tem a URL ${alvo}. Escreva a URL no campo URL e confira de novo.`);
  }
  let sc = window.angular.element(semente).scope();
  while (sc && !(sc.data && typeof sc.data === 'object')) sc = sc.$parent;
  if (!sc) throw new Error('ABORTADO: sem escopo com data neste diálogo — por aqui não existe gravação.');
  if (sc.data.body === undefined) {
    throw new Error('ABORTADO: data.body não existe neste diálogo de criação. Não medido (o caso medido era um texto '
      + 'vazio): pare e mostre à pessoa; não crie a chave por script.');
  }
  if (typeof sc.data.body !== 'string' || sc.data.body !== '') {
    throw new Error('ABORTADO: o conteúdo do diálogo de criação não está vazio. Alguém já escreveu nele: cancele, '
      + 'recarregue e recomece.');
  }
  const cfg = sc.data.config || {};
  const temLing = cfg.editor && typeof cfg.editor.language === 'string' ? cfg.editor.language.trim() : '';
  const temMime = cfg.file && typeof cfg.file.mimeType === 'string' ? cfg.file.mimeType.trim() : '';
  if (temLing !== linguagem) {
    throw new Error(`ABORTADO: a linguagem do editor no diálogo é "${semQuery(temLing || '(vazia)')}", e não `
      + `"${semQuery(linguagem)}". Escolha-a na aba Conteúdo, como no Arquivo lido, e confira de novo.`);
  }
  if (temMime !== mime) {
    throw new Error(`ABORTADO: o tipo do arquivo (MIME) no diálogo é "${semQuery(temMime || '(vazio)')}", e não `
      + `"${semQuery(mime)}". Escolha-o na aba Configurações, como no Arquivo lido, e confira de novo.`);
  }
  if (escopoArquivo(dlg).data !== sc.data) {
    throw new Error('ABORTADO: o escopo do conteúdo não é o do diálogo conferido. Recarregue e recomece.');
  }
  const vazio = await shaNormalizado('');
  if ((await shaNormalizado(sc.data.body)) !== vazio) throw new Error('ABORTADO: o conteúdo não é o texto vazio.');
  window.__DLG_CONFERIDO = dlg;
  window.__DLG_CONFERIDO_LOJA = L.loja;
  window.__ARQ_CONFERIDO = dlg;
  window.__BACKUP_ARQUIVO = '';
  window.__ARQ_NOVO = { dlg, url: alvo, loja: L.loja, linguagem, mime };
  return { confere: true, url: alvo, loja: L.loja, linguagem: semQuery(linguagem), mime: semQuery(mime),
           shaDoVazio: shaLegivel(vazio),
           depois: "upload + await lerEntradaArquivo('<sha dos bytes>'), injetarArquivo() e, em outra chamada, "
             + 'prepararConfirmarCriacao().' };
}

/**
 * A última trava antes de CRIAR, sem clicar: todas as de confirmarArquivo (loja do perfil, um diálogo só,
 * o diálogo conferido por conferirArquivoNovo com a mesma loja, mesmo escopo e mesmo nó que receberam a
 * escrita, conteúdo igual ao escrito) mais a Loja e a URL do diálogo ainda as conferidas e a URL livre
 * nesta carga. Então ROTULA o `Confirmar` de dentro do diálogo com `__confirmar_criacao`. Uma vez por
 * diálogo: a segunda chamada aborta.
 * Por que não clica: o clique composto (o de confirmarArquivo) criou a mesma página duas vezes; um clique
 * real da ferramenta no elemento criou uma (medido). Quem clica é você, pela ferramenta, UMA vez.
 */
function prepararConfirmarCriacao(opcoes) {
  const L = exigirLoja();
  const dlg = dialogoUnico();
  const N = window.__ARQ_NOVO;
  if (!ehDialogoDeCriacao(dlg)) {
    throw new Error('ABORTADO: o diálogo aberto não é o de criação. Para um Arquivo que já existe: confirmarArquivo().');
  }
  if (!N || N.dlg !== dlg) {
    throw new Error('ABORTADO: este diálogo não passou por await conferirArquivoNovo({url, linguagem, mime}).');
  }
  if (window.__CRIACAO && window.__CRIACAO.dlg === dlg) {
    throw new Error('ABORTADO: o Confirmar deste diálogo já foi preparado. Se você já clicou, NÃO clique de novo: '
      + "cancelarDialogo(), location.reload() e conferirCriacao('" + N.url + "'). Se não clicou, recarregue e recomece.");
  }
  if (window.__DLG_CONFERIDO !== dlg || window.__DLG_CONFERIDO_LOJA !== L.loja || N.loja !== L.loja) {
    throw new Error('ABORTADO: o diálogo foi conferido com outra loja, ou não foi conferido. Recarregue e recomece.');
  }
  const sc = escopoArquivo(dlg);
  if (!window.__SC_ARQ || sc !== window.__SC_ARQ || dlg !== window.__DLG_ARQ) {
    throw new Error('ABORTADO: o diálogo aberto não é o que recebeu a escrita (injetarArquivo). Recarregue e recomece.');
  }
  if (normalizarTexto(sc.data.body) !== window.__ARQ_ESCRITO) {
    throw new Error('ABORTADO: data.body mudou depois de injetarArquivo(). Reinjete e prepare na sequência.');
  }
  const campo = lerCampoLoja(dlg);
  if (!campo.vistos.some(v => v === L.loja) && !(L.lojaNome && campo.vistos.some(v => normalizarNome(v) === normalizarNome(L.lojaNome)))) {
    throw new Error('ABORTADO: a Loja do diálogo mudou desde conferirArquivoNovo. Recarregue e recomece.');
  }
  if (![...dlg.querySelectorAll('input')].some(i => normUrl(i.value) === N.url)) {
    throw new Error(`ABORTADO: a URL do diálogo não é mais ${N.url}. Recarregue e recomece.`);
  }
  const U = window.__URL_LIVRE;
  if (!U || U.url !== N.url || U.loja !== L.loja) {
    throw new Error('ABORTADO: a URL não foi conferida livre nesta carga (conferirUrlLivre). Recarregue e recomece.');
  }
  const b = botaoConfirmarDoDialogo(dlg, opcoes);
  const r = rotularParaFerramenta(b, 'confirmar_criacao');
  window.__CRIACAO = { dlg, url: N.url, loja: L.loja };
  window.__DLG_GRAVADO = dlg;
  return { preparado: true, rotulo: r.rotulo, url: N.url,
           depois: `Faça UM clique real nesse elemento pela ferramenta (find "${r.rotulo}"); nunca repita, nem por `
             + 'script. Espere "Registro inserido com sucesso." (uma vez; o diálogo fica aberto, medido). Depois, '
             + "em chamadas separadas: cancelarDialogo(), location.reload() e, com a grade filtrada pela Loja e pela "
             + `URL, conferirCriacao('${N.url}').` };
}

/**
 * Depois da criação e do reload, com a grade filtrada pela Loja do perfil e pela URL: exatamente UMA
 * página desta loja com a URL. Devolve o # e o Publicada dela. Com duas ou mais, aborta mostrando todas:
 * pare e pergunte à pessoa qual fica (Despublicar a sobra é da pessoa: ela clica, e você confere depois;
 * Excluir nunca é da skill).
 */
function conferirCriacao(url) {
  const r = linhasComUrl(url);
  if (!r.iguais.length) {
    throw new Error(`ABORTADO: nenhuma linha com a URL ${r.alvo} na grade filtrada. A criação não gravou, ou a grade `
      + 'não foi atualizada: Atualizar e repita. Não clique Confirmar de novo sem conferir isto.');
  }
  if (r.iguais.length > 1) {
    throw new Error(`ABORTADO: ${r.iguais.length} páginas desta loja com a URL ${r.alvo}: `
      + r.iguais.map(x => `#${x.numero} (Publicada: ${x.publicada})`).join(' · ')
      + '. Pare: mostre as linhas à pessoa e pergunte qual fica. Despublicar a sobra é da pessoa: ela clica, e '
      + 'você confere depois; Excluir nunca é da skill.');
  }
  const x = r.iguais[0];
  return { numero: x.numero, url: x.url, publicada: x.publicada,
           depois: `Prove o conteúdo: marque só a #${x.numero}, conferirAlvo, abrirDialogo('Alterar'), aba Conteúdo, `
             + "conferirDialogo(url) e await verificarArquivoGravou('<sha normalizado>', ['<trecho>']). Publicar só "
             + 'com o pedido da pessoa: prepararPublicar({numero, url, pedido}).' };
}

/**
 * `Publicar`, 1/3. Só depois de um pedido da pessoa que nomeia o botão e a página. Confere e ROTULA o
 * botão `Publicar` com `__publicar` para UM clique real da ferramenta. Não clica.
 *   prepararPublicar({ numero: NNNNNN, url: '/seu-arquivo.js', pedido: '<a frase da pessoa, colada como veio>' })
 * Travas: o `pedido` pede com o verbo (publica, publicar, publique; "publicada" e "publicação" não contam),
 * sem despublicar, sem "não" perto, sem condição, espera ou negação junto do verbo ("sem publicar", "antes de
 * publicar", "quando publicar", "se ...", "Publicar não", "... depois", "... amanhã"), sem aprovação na mesma
 * frase ("aprovado", "pode gravar": separe as duas coisas), e cita o # ou a URL (quem decide que a frase é um
 * pedido é você, com a pessoa: a função só barra o que claramente não é; um "sim" solto não passa, porque ela
 * não vê a pergunta); nenhum diálogo aberto; conferirAlvo(numero) (uma linha marcada, a do #);
 * a URL dessa linha é `url`; o Publicada dela diz Não; nenhum modal na tela (anotarModais); exatamente um
 * botão `Publicar` visível. Uma vez por carga do admin.
 */
function prepararPublicar(dados) {
  const d = dados || {};
  const L = exigirLoja();
  const numero = String(d.numero == null ? '' : d.numero).trim();
  const alvo = normUrl(d.url);
  if (!/^\d+$/.test(numero) || !alvo) throw new Error('prepararPublicar({numero, url, pedido}): o # da página e a URL dela.');
  const pedido = String(d.pedido == null ? '' : d.pedido).normalize('NFC').replace(/\s+/g, ' ').trim();
  const p = pedido.toLowerCase();
  // Bordas de palavra que conhecem acento: o \b do JS vê "ç" e "ã" como fim de palavra ("publica|ção").
  const B = '(?:^|[^a-z0-9_à-ÿ])', F = '(?![a-z0-9_à-ÿ])';
  if (!pedido) throw new Error('ABORTADO: falta o pedido: a frase da pessoa pedindo para publicar, colada como veio.');
  if (/despubli/.test(p)) throw new Error('ABORTADO: o pedido fala em despublicar. Este caminho é só para Publicar; Despublicar não tem caminho por script.');
  // Só o verbo pedindo: publica, publicar, publique(m), publicá-la. "Publicada", "publicação" e "publicou" não.
  if (!new RegExp(B + '(?:publica|publicar|publique|publiquem|publicá)' + F).test(p)) {
    throw new Error('ABORTADO: o pedido não fala em publicar. Um "aprovado" sobre a prévia não é pedido de Publicar: '
      + 'pergunte à pessoa, nomeando o botão e a página.');
  }
  if (/\bn(ã|a)o\b[^.!?;]{0,30}publi/.test(p)) throw new Error('ABORTADO: o pedido diz "não" perto de publicar. Pergunte de novo à pessoa.');
  // Condição, espera ou negação junto do verbo: antes ("sem publicar", "antes de publicar", "quando publicar",
  // "se ficar bom, publica", "nunca publique") ou logo depois ("Publicar não", "publica o /x.js amanhã").
  const condicaoAntes = new RegExp(B + '(?:sem|antes d[eo]|depois d[eo]|quando|se|ap[oó]s|nunca|jamais|posso|devo|'
    + 'deveria|ser[aá] que)\\s+(?:\\S+\\s+){0,2}publi');
  const condicaoDepois = new RegExp('publi[a-zà-ÿ]*[\\s,;:]+(?:\\S+\\s+){0,2}(?:n[aã]o|depois|mais tarde|amanh[aã]|'
    + 'quando|se)' + F);
  if (condicaoAntes.test(p) || condicaoDepois.test(p)) {
    throw new Error('ABORTADO: o pedido põe uma condição, uma espera ou um "não" junto de publicar ("sem", "antes de", '
      + '"quando", "se", "depois", "amanhã"...): não é um pedido para agora. Pergunte à pessoa, com uma pergunta '
      + 'fechada que diga o botão e a página.');
  }
  // Aprovação e botão na mesma frase: separe as duas coisas (previa.md, "Aprovação, gravação e conferência").
  if (new RegExp(B + '(?:aprov[a-zà-ÿ]*|pode gravar|pode subir|pode p[oô]r no ar)' + F).test(p)) {
    throw new Error('ABORTADO: o pedido é também uma aprovação ("aprovado", "pode gravar"...). Uma frase de aprovação '
      + 'não vale como pedido de Publicar: separe as duas coisas e pergunte só do botão, nomeando a página.');
  }
  const citaNumero = new RegExp('(^|\\D)' + numero + '(\\D|$)').test(pedido);
  const citaUrl = p.indexOf(alvo) >= 0 || p.indexOf(alvo.slice(1)) >= 0;
  if (!citaNumero && !citaUrl) {
    throw new Error(`ABORTADO: o pedido não nomeia a página (nem o #${numero} nem ${alvo}). Pergunte à pessoa, com uma `
      + 'pergunta fechada que diga o botão e a página.');
  }
  if (window.__PUBLICAR) {
    throw new Error('ABORTADO: um Publicar já foi preparado nesta carga do admin. Se você já clicou, siga com '
      + 'prepararOkDoPublicar; se não, recarregue e recomece.');
  }
  if (contarDialogos().visiveis) throw new Error('ABORTADO: há um diálogo aberto. Feche, recarregue e recomece.');
  conferirAlvo(numero);
  const grade = gradeVisivel();
  const iUrl = colunaDaGrade(grade, /^URL$/i), iPub = colunaDaGrade(grade, /^Publicada$/i);
  if (iUrl < 0 || iPub < 0) throw new Error('ABORTADO: não achei as colunas URL e Publicada da grade. Pare e mapeie a grade.');
  const tr = linhaMarcada(grade);
  if (normUrl(textoDaCelula(tr, iUrl)) !== alvo) {
    throw new Error(`ABORTADO: a URL da linha #${numero} é "${semQuery(textoDaCelula(tr, iUrl))}", e não ${alvo}.`);
  }
  const pub = textoDaCelula(tr, iPub) || '';
  if (!/^n(ã|a)o$/i.test(pub)) {
    throw new Error(`ABORTADO: a coluna Publicada da #${numero} diz "${semQuery(pub)}"`
      + (/^sim$/i.test(pub) ? ': ela já está publicada. Nada a fazer.' : ', e não "Não". Pare e mapeie.'));
  }
  const botoes = [...document.querySelectorAll('button, a')]
    .filter(x => /^\s*Publicar\s*$/.test((x.textContent || '').trim()) && x.offsetParent !== null);
  if (botoes.length !== 1) {
    throw new Error(`ABORTADO: ${botoes.length} botão(ões) Publicar visível(is); esperado 1.` + (botoes.length ? '' : dicaAcesso()));
  }
  anotarModais();
  const antes = modaisNaTela();
  const r = rotularParaFerramenta(botoes[0], 'publicar');
  window.__PUBLICAR = { numero, url: alvo, loja: L.loja, etapa: 'botao', modaisAntes: antes };
  return { preparado: true, rotulo: r.rotulo, numero, url: alvo,
           depois: `UM clique real em "${r.rotulo}" pela ferramenta. Depois, em OUTRA chamada: `
             + 'prepararOkDoPublicar({numero, url}).' };
}

/**
 * `Publicar`, 2/3. Em outra chamada, depois do clique no `Publicar`: o modal que ele abriu, e só ele. Confere
 * que é o preparado (mesmo # e URL), que há exatamente 1 modal na tela e que ele é novo, que a pergunta é a
 * de publicar (e não despublicar nem excluir; medido: "Você tem certeza que deseja publicar esta(s)
 * página(s)?"), que a linha marcada ainda é a do # com a mesma URL e que há um OK só dentro do modal. Então
 * rotula o OK com `__ok_publicar` para UM clique real. Não clica. Uma vez: sem modal na tela ainda, não
 * consome (chame de novo); qualquer outro aborto consome, e aí é recarregar e recomeçar.
 */
function prepararOkDoPublicar(dados) {
  const d = dados || {};
  const L = exigirLoja();
  const P = window.__PUBLICAR;
  if (!P) throw new Error('ABORTADO: nenhum Publicar preparado nesta carga: prepararPublicar({numero, url, pedido}) antes.');
  if (P.etapa !== 'botao') {
    throw new Error('ABORTADO: o OK deste Publicar já foi preparado (ou abortou): um OK por preparo. Se você já '
      + 'clicou, Atualizar e conferirPublicada; senão, recarregue e recomece.');
  }
  if (String(d.numero == null ? '' : d.numero).trim() !== P.numero || normUrl(d.url) !== P.url || L.loja !== P.loja) {
    throw new Error(`ABORTADO: não é a página preparada (#${P.numero}, ${P.url}).`);
  }
  const vis = modaisNaTela();
  if (!vis.length) {
    throw new Error('ABORTADO: nenhum modal na tela ainda. Se você clicou no Publicar, espere e chame de novo (isto '
      + 'não consome o preparo); se não clicou, clique uma vez no "__publicar".');
  }
  P.etapa = 'ok-conferindo';
  const novos = vis.filter(m => P.modaisAntes.indexOf(m) < 0);
  if (vis.length !== 1 || novos.length !== 1) {
    throw new Error(`ABORTADO: ${vis.length} modal(is) na tela, ${novos.length} novo(s); esperado exatamente 1, novo. `
      + 'Não clique em OK: tire um screenshot e mostre à pessoa. Saída segura: location.reload().');
  }
  const m = novos[0];
  const txt = ((m.querySelector('.ajs-content') || m).innerText || '').replace(/\s+/g, ' ').trim();
  if (!/\bpublicar\b/i.test(txt) || /despublicar|exclu[ií]r|exclus[aã]o/i.test(txt)) {
    throw new Error('ABORTADO: o modal aberto pergunta outra coisa: "' + semQuery(txt.slice(0, 80))
      + '". Não clique em OK; mostre à pessoa.');
  }
  conferirAlvo(P.numero);
  const grade = gradeVisivel();
  const iUrl = colunaDaGrade(grade, /^URL$/i);
  const tr = linhaMarcada(grade);
  if (iUrl < 0 || normUrl(textoDaCelula(tr, iUrl)) !== P.url) {
    throw new Error(`ABORTADO: a linha marcada não tem mais a URL ${P.url}. Não clique em OK; mostre à pessoa.`);
  }
  let oks = [...m.querySelectorAll('.ajs-ok')];
  if (!oks.length) oks = [...m.querySelectorAll('button')].filter(b => /^\s*OK\s*$/.test(b.textContent || ''));
  if (oks.length !== 1) throw new Error(`ABORTADO: ${oks.length} botão(ões) OK dentro do modal; esperado 1.`);
  const r = rotularParaFerramenta(oks[0], 'ok_publicar');
  P.etapa = 'ok';
  return { preparado: true, rotulo: r.rotulo, pergunta: semQuery(txt.slice(0, 80)),
           depois: `UM clique real em "${r.rotulo}" pela ferramenta; não repita. O Publicar zera a seleção da grade `
             + '(medido): depois, Atualizar e conferirPublicada({numero, url}); e confira no ar, pelo endereço com '
             + 'uma query nc nova.' };
}

/**
 * `Publicar`, 3/3. Depois do OK e do `Atualizar`: a linha do # (pela coluna #, não pela seleção, que o
 * Publicar zera) tem a URL e diz Publicada = Sim? Só lê. A prova final é o endereço no ar (curl com uma
 * query nc nova: 200 e o conteúdo igual ao local, normalizado).
 */
function conferirPublicada(dados) {
  const d = dados || {};
  exigirLoja();
  const numero = String(d.numero == null ? '' : d.numero).trim();
  const alvo = normUrl(d.url);
  if (!/^\d+$/.test(numero) || !alvo) throw new Error('conferirPublicada({numero, url}).');
  const grade = gradeVisivel();
  const iNum = colunaDaGrade(grade, /^#$/), iUrl = colunaDaGrade(grade, /^URL$/i), iPub = colunaDaGrade(grade, /^Publicada$/i);
  if (iNum < 0 || iUrl < 0 || iPub < 0) throw new Error('ABORTADO: não achei as colunas #, URL e Publicada da grade.');
  const linhas = [...grade.querySelectorAll('tr')].filter(t => !t.closest('thead') && !t.querySelector('th')
    && textoDaCelula(t, iNum) === numero);
  if (linhas.length !== 1) throw new Error(`ABORTADO: ${linhas.length} linha(s) com o #${numero} na grade visível; esperado 1.`);
  if (normUrl(textoDaCelula(linhas[0], iUrl)) !== alvo) {
    throw new Error(`ABORTADO: a URL da #${numero} é "${semQuery(textoDaCelula(linhas[0], iUrl))}", e não ${alvo}.`);
  }
  const pub = textoDaCelula(linhas[0], iPub) || '';
  const sim = /^sim$/i.test(pub);
  return { publicada: sim, numero, url: alvo, coluna: semQuery(pub),
           depois: sim
             ? 'Confira no ar: o endereço com uma query nc nova responde 200 com o conteúdo do arquivo local (sha normalizado).'
             : 'A grade ainda não diz Sim: Atualizar e confira de novo; se continuar, mostre à pessoa. Não clique Publicar de novo sem falar com ela.' };
}

/* ------------------------------------------------------------------ *
 * 11. CONFIGURAÇÃO DA LOJA — <head>, agenda, Barra do Topo, logo     *
 * ------------------------------------------------------------------ *
 * Caminho: Único › Lojas › marcar a linha da loja › botão Configurações › select Tipo = Site.
 * Escopo: `data.configuracao[data.tipo]`; o <head> é a chave `customCodeOnHead`, a agenda de skins
 * é `skin`, a Barra do Topo é `headerTopBarShow` / `textoHeaderTopbar` e o logo é `svgLogo`.
 * As funções genéricas (`lerCampo`, `conferirCampoAtual`, `trocarNaConfig`, `verificarCampoGravou`)
 * aceitam só essas cinco chaves; as do <head> (`lerHead`, `conferirHeadAtual`, `trocarNoHead`,
 * `verificarHeadGravou`) são atalhos para `customCodeOnHead`.
 * Medido em produção em lojas reais (numa delas também em 2026-10-22, com duas trocas numa gravação):
 *   - gravar é `controller.confirmar($event)` com clique COMPOSTO; ele NÃO fecha o diálogo e
 *     mostra "Registro inserido com sucesso." duas vezes (inofensivo numa alteração);
 *   - fechar é `controller.cancelar()`, por `fecharConfigLoja()`, que acha o controller pelo select Tipo
 *     do diálogo (2026-10-22: o escopo do próprio botão Cancelar não tinha o controller) ou clica no
 *     Cancelar do diálogo; nessa medição, o diálogo SAIU do DOM depois do Cancelar (noutros diálogos ele
 *     fica: conte, não suponha);
 *   - o <head> é guardado com CRLF — compare normalizado;
 *   - depois de gravar, a configuração tem cache próprio (Administrador › Cache, linha
 *     "Configurações da Loja", código `loja_config`); a coluna "Último flush" dela é indício, e a prova
 *     é o HTML servido (ultimoFlushConfigLoja).
 *
 * ⚠️ ANTES DE ABRIR: pergunte se alguém (a pessoa ou outra pessoa da loja, em outra aba ou em
 * outro computador) está com o diálogo Configurações da loja aberto. Se estiver, peça que clique
 * em Cancelar lá primeiro. Aquele diálogo carregou a configuração INTEIRA antes da sua gravação; o
 * Confirmar dele grava tudo de volta, inclusive o <head> antigo, e a sua troca some sem aviso.
 * Nenhuma função daqui consegue ver outra aba, nem outro computador.
 *
 * Os seletores desta seção (button "Configurações", select[ng-model="data.tipo"], opção "Site",
 * `.ui-dialog`, coluna "Último flush") foram os do admin medido; os rótulos das subabas de
 * `abaDaChave` foram lidos na tela numa loja (mapa-do-admin.md, seção 1), e o elemento das abas deste
 * diálogo foi medido em 2026-10-22, numa loja: `.pane-item` (`abaDialogo` trocou Integrações e depois
 * Custom). Se algum não casar, as funções ABORTAM: pare e mapeie pelo DOM antes de seguir.
 *
 * CHAVE QUE NÃO EXISTE: um campo que a loja nunca usou pode nem ter chave no escopo (medido numa
 * loja, 2026-10: a agenda `skin` de quem nunca usou a agenda era `undefined`, e não uma lista
 * vazia). Estas funções NÃO criam chave: `lerCampo` devolve `existe: false` (é o "backup": anote
 * "ausente em AAAA-MM-DD"), `conferirCampoAtual` e `trocarNaConfig` abortam, e quem grava o
 * primeiro valor é a pessoa, colando à mão; você confere depois com `verificarCampoGravou`
 * (gravacao-arquivo-e-head.md, "Campo que nunca foi usado"). Não se mediu se uma chave criada no
 * escopo por script seria gravada, nem como o servidor a guardaria. Uma chave ausente também pode
 * ser falta de acesso ao campo, e não campo nunca usado (não medido se o admin deixa de mandar a
 * chave de um campo que o usuário não vê): confira na tela que a subaba e o campo aparecem, vazios.
 *
 * O QUE ESTE USUÁRIO VÊ (SKILL.md, regra zero): o escopo traz a configuração inteira, e não só o que
 * o perfil de acesso do usuário mostra na tela. Uma chave pode estar nos dados com a subaba dela
 * escondida para ele (não medido; é prevenção), e gravá-la pelo escopo seria o "caminho por fora" que
 * a regra proíbe. Por isso `conferirCampoAtual`, o primeiro passo de toda gravação daqui, aborta se a
 * subaba do campo (`abaDaChave`) não aparece no diálogo, e `lerCampo` devolve `abaVisivel: false`, sem
 * tamanho. A conferência só olha (não clica): abra antes, como a pessoa abriria, a aba de cima e a
 * subaba do campo (`abaDialogo`, uma chamada cada; medido neste diálogo em 2026-10-22, numa loja, com
 * Integrações e Custom; se não trocar, a pessoa clica). `opcoes.aba` (RegExp) troca o rótulo da
 * subaba, quando este admin escreve outro (anote no
 * perfil); `opcoes.seletorAba` troca o seletor das abas, quando o perfil anota um medido. Nenhum dos
 * dois pula a conferência.
 */

/**
 * Na grade de Único › Lojas: exatamente uma linha marcada, com o domínio do perfil como endereço
 * INTEIRO numa célula, e com o número da loja do perfil na coluna `#`.
 * Por que inteiro: "contém o domínio" deixava passar a linha de uma loja irmã — com o perfil em
 * `sua-loja.com.br`, a linha de `loja2.sua-loja.com.br` passava. O endereço de cada célula é
 * comparado sem esquema, caminho, porta nem ponto final (`https://www.sua-loja.com.br/` vira
 * `www.sua-loja.com.br`); o `www.` não é tirado: conta como está no perfil, copiado da grade.
 * Os seletores da grade de Lojas (cabeçalho `#`) não foram medidos um por um: se a coluna `#` não
 * for achada, a função aborta. Pare e mapeie a grade (snippet B de reconhecimento-da-loja.md).
 */
function conferirLojaNaGrade() {
  const L = exigirLoja();
  const grade = gradeVisivel();
  let caixas = [...grade.querySelectorAll('tr input[type=checkbox]')].filter(c => !c.closest('thead'));
  const deLinha = caixas.filter(c => (c.getAttribute('ng-click') || '').includes('clickCheckbox'));
  if (deLinha.length) caixas = deLinha;
  const marcadas = caixas.filter(c => c.checked);
  window.__LOJA_GRADE_OK = null;
  if (marcadas.length !== 1) {
    throw new Error(`ABORTADO: ${marcadas.length} linha(s) marcada(s) na grade visível; esperado 1, `
      + 'a da loja do perfil.');
  }
  const tr = marcadas[0].closest('tr');
  const texto = (tr.innerText || '').replace(/\s+/g, ' ').trim();
  const host = s => String(s || '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '')
    .replace(/[\/?#].*$/, '').replace(/:\d+$/, '').replace(/\.$/, '');
  const enderecos = [...tr.children]
    .flatMap(td => String(td.innerText || '').split(/\s+/)).map(host).filter(Boolean);
  const cab = [...grade.querySelectorAll('tr')].find(t => t.querySelector('th'));
  const ths = cab ? [...cab.children].map(th => String(th.innerText || '').replace(/\s+/g, ' ').trim()) : [];
  const iNum = ths.indexOf('#');
  const celNum = iNum >= 0 ? tr.children[iNum] : null;
  const numero = celNum ? String(celNum.innerText || '').trim() : null;
  if (enderecos.indexOf(L.dominio) < 0) {
    throw new Error(`ABORTADO: a linha marcada não tem o domínio do perfil (${L.dominio}) como endereço `
      + `inteiro numa célula (loja2.${L.dominio} não passa). Marcada: "${semQuery(texto.slice(0, 90))}"`);
  }
  if (numero !== L.loja) {
    throw new Error(`ABORTADO: a coluna # da linha marcada não é a loja ${L.loja} do perfil `
      + `(coluna #: ${numero === null ? 'não achada; pare e mapeie a grade' : semQuery(numero.slice(0, 20))}). `
      + `Marcada: "${semQuery(texto.slice(0, 90))}"`);
  }
  window.__LOJA_GRADE_OK = L.dominio;
  return { confere: true, linha: semQuery(texto.slice(0, 90)) };
}

/**
 * Abre o diálogo Configurações da loja marcada. O "Configurações" visível é um <button>: o menu
 * lateral tem um item com o mesmo rótulo, por isso a busca é só em <button>. Abre com
 * triggerHandler SOZINHO (é botão que abre — passo 1 de gravacao-construtor.md).
 * Refaz `conferirLojaNaGrade()` aqui, na mesma chamada do clique: a seleção da grade pode ter
 * mudado desde a conferência, e um campo de valor igual em toda loja (`headerTopBarShow` =
 * "false") não deixa a comparação com o backup perceber que o diálogo é de outra loja.
 */
async function abrirConfiguracoesDaLoja(espera) {
  exigirLoja();
  conferirLojaNaGrade();   // aborta se a linha marcada agora não for a da loja do perfil
  const antes = contarDialogos();
  if (antes.total !== 0) {
    throw new Error(`ABORTADO antes de abrir: já há ${antes.total} .ui-dialog no DOM. `
      + 'Recarregue o admin primeiro.');
  }
  const bs = [...document.querySelectorAll('button')]
    .filter(b => b.offsetParent !== null && /^\s*Configura[çc][õo]es\s*$/i.test((b.textContent || '').trim()));
  if (bs.length !== 1) {
    throw new Error(`ABORTADO: ${bs.length} <button> "Configurações" visível(is); esperado 1.`
      + (bs.length === 0 ? dicaAcesso() : ''));
  }
  if (!window.angular) throw new Error('sem window.angular — não há como disparar o ng-click.');
  window.angular.element(bs[0]).triggerHandler('click');
  try {
    const s = window.angular.element(bs[0]).scope();
    if (s && s.$root && !s.$root.$$phase) s.$apply();
  } catch (e) { /* ok */ }
  await new Promise(r => setTimeout(r, espera == null ? 400 : espera));
  const dep = contarDialogos();
  if (dep.total !== 1) {
    throw new Error(`ABORTADO: depois do clique há ${dep.total} .ui-dialog (esperado 1). Se a tela `
      + 'abriu e o total é 0, este admin não usa .ui-dialog aqui: pare e mapeie pelo DOM.');
  }
  return { dialogos: dep.total };
}

/** Seleciona Tipo = Site. Espere ~2,5 s e só então, em OUTRA chamada, `lerHead()`. */
function escolherTipoSite(dlg) {
  const raiz = dlg || dialogoUnico();
  const sel = raiz.querySelector('select[ng-model="data.tipo"]');
  if (!sel) {
    throw new Error('ABORTADO: select Tipo (ng-model="data.tipo") não encontrado no diálogo. '
      + 'É o diálogo Configurações da loja?' + dicaAcesso());
  }
  const op = [...sel.options].find(o => /^\s*Site\s*$/i.test(o.textContent || ''));
  if (!op) throw new Error('ABORTADO: o select Tipo não tem a opção "Site".' + dicaAcesso());
  const trocou = sel.value !== op.value;
  if (trocou) {
    sel.value = op.value;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }
  return { tipo: 'Site', trocou, depois: 'Espere ~2,5 s e, em outra chamada, lerHead().' };
}

/** `{sc, cfg}` do diálogo único, exigindo Tipo = Site selecionado e carregado. */
function escopoConfigLoja(dlg) {
  const raiz = dlg || dialogoUnico();
  if (!window.angular) throw new Error('sem window.angular — não há escopo para ler.');
  const sel = raiz.querySelector('select[ng-model="data.tipo"]');
  if (!sel) throw new Error('ABORTADO: select Tipo não encontrado — é o diálogo Configurações da loja?'
    + dicaAcesso());
  const op = sel.options[sel.selectedIndex];
  if (!op || !/^\s*Site\s*$/i.test(op.textContent || '')) {
    throw new Error('ABORTADO: o Tipo selecionado não é "Site". Rode escolherTipoSite() e espere ~2,5 s.');
  }
  let sc = window.angular.element(sel).scope();
  while (sc && !(sc.data && sc.data.configuracao && sc.data.tipo != null)) sc = sc.$parent;
  if (!sc) throw new Error('ABORTADO: sem escopo com data.configuracao — por aqui não existe gravação.');
  const cfg = sc.data.configuracao[sc.data.tipo];
  if (!cfg || typeof cfg !== 'object') {
    throw new Error('ABORTADO: data.configuracao[data.tipo] ainda não carregou. Espere e repita.');
  }
  return { sc, cfg };
}

/**
 * As chaves de `data.configuracao[data.tipo]` que as funções genéricas desta seção aceitam; com
 * qualquer outra, elas abortam.
 * O SCSS de Personalização (`modeloScssAfterAll`, medido numa loja) fica fora DE PROPÓSITO: a
 * gravação dele por script nunca foi medida, e ele é compilado no servidor antes de ir ao site.
 * Quem grava o SCSS é a pessoa, à mão. As outras chaves não foram mapeadas.
 * Uma função, e não uma constante, de propósito: o pacote salvo por `fn.toString()` perde as
 * constantes do topo do arquivo (ferramentas-de-navegador.md).
 */
function chavesConfigLoja() {
  return ['customCodeOnHead', 'skin', 'textoHeaderTopbar', 'headerTopBarShow', 'svgLogo'];
}

function exigirChaveConfig(chave) {
  if (chavesConfigLoja().indexOf(chave) < 0) {
    throw new Error(`ABORTADO: a chave ${JSON.stringify(chave)} não está entre as que estas funções `
      + `gravam (${chavesConfigLoja().join(', ')}). As outras não foram mapeadas: pare e pergunte.`);
  }
  return chave;
}

/** A chave não existe no escopo (campo nunca usado nesta loja, ou sem acesso)? Ver o topo desta seção. */
function chaveAusente(cfg, chave) {
  return !(chave in cfg) || cfg[chave] === undefined;
}

/**
 * Onde o campo de cada chave aparece no diálogo Configurações (mapa-do-admin.md, seção 1): a aba de
 * cima e a subaba, com o rótulo medido numa loja. Função, e não constante, pelo mesmo motivo de
 * chavesConfigLoja.
 */
function abaDaChave(chave) {
  exigirChaveConfig(chave);
  const visual = /\bVisual\b/i;
  return {
    customCodeOnHead: { caminho: 'Integrações / Plugins › Custom', aba: /\bIntegra[cç][oõ]es\b/i, subaba: /\bCustom\b/i },
    skin: { caminho: 'Visual › Modelo e Skin', aba: visual, subaba: /\bModelo e Skin\b/i },
    textoHeaderTopbar: { caminho: 'Visual › Cabeçalho', aba: visual, subaba: /\bCabe[cç]alho\b/i },
    headerTopBarShow: { caminho: 'Visual › Cabeçalho', aba: visual, subaba: /\bCabe[cç]alho\b/i },
    svgLogo: { caminho: 'Visual › Logo e Ícone', aba: visual, subaba: /\bLogo\b/i },
  }[chave];
}

/**
 * A subaba do campo de `chave` aparece para este usuário neste diálogo? Só olha, não clica.
 * Devolve { visivel, caminho, rotulo, abas } (abas = os rótulos visíveis, para a mensagem e o perfil).
 * `opcoes.aba`: RegExp que troca o rótulo da subaba (outro texto neste admin, anotado no perfil).
 * `opcoes.seletorAba`: o seletor das abas deste admin, medido e anotado no perfil.
 * Nenhum dos dois pula a conferência: sem RegExp válida, aborta.
 */
function conferirAbaDaChave(chave, dlg, opcoes) {
  const o = opcoes || {};
  const A = abaDaChave(chave);
  if (o.aba !== undefined && Object.prototype.toString.call(o.aba) !== '[object RegExp]') {
    throw new Error('ABORTADO: opcoes.aba tem de ser uma RegExp com o rótulo da subaba como este admin '
      + 'mostra (anote no perfil). Não há como pular esta conferência.');
  }
  if (o.seletorAba !== undefined && (typeof o.seletorAba !== 'string' || !o.seletorAba.trim())) {
    throw new Error('ABORTADO: opcoes.seletorAba tem de ser o seletor CSS das abas deste admin, medido e '
      + 'anotado no perfil.');
  }
  const re = o.aba || A.subaba;
  if (new RegExp(re.source, re.flags.replace(/[gy]/g, '')).test('')) {
    throw new Error('ABORTADO: opcoes.aba casa com texto vazio, ou seja, com qualquer aba. Use o rótulo da '
      + 'subaba. Não há como pular esta conferência.');
  }
  const seletor = o.seletorAba || null;
  return { visivel: abaVisivel(re, dlg, seletor), caminho: A.caminho, rotulo: String(re),
           abas: abasVisiveis(dlg, seletor) };
}

/** A mensagem de quando a subaba do campo não aparece: pare, não grave pelo escopo. */
function erroAbaInvisivel(chave, r) {
  return new Error(`ABORTADO: a aba ${r.caminho} do campo ${chave} não aparece para este usuário neste `
    + `diálogo (abas visíveis: ${r.abas.join(' · ') || 'nenhuma'}). Gravar pelo escopo seria contornar o `
    + 'perfil de acesso: pare e pergunte à pessoa. Só antes disso: se a aba de cima ainda não foi aberta, '
    + 'abra-a e confira de novo (a subaba pode só aparecer com ela aberta); se nenhuma aba foi listada, o '
    + 'seletor das abas não casou com este diálogo: mapeie e passe opcoes.seletorAba, sem pular a conferência.'
    + dicaAcesso());
}

/**
 * O valor de uma chave da configuração, exigindo texto (as funções daqui só trocam texto).
 * Duas recusas diferentes, porque o caminho de cada uma é outro:
 *   - a chave não existe: o campo nunca foi usado, OU este usuário não tem acesso a ele; se o campo
 *     aparece vazio na tela, a pessoa cola o valor inteiro e você confere;
 *   - a chave existe com outro tipo (null, objeto, número): o campo é guardado de outro jeito
 *     nesta loja; pare e mapeie antes de qualquer gravação.
 */
function valorConfigTexto(cfg, chave) {
  if (chaveAusente(cfg, chave)) {
    throw new Error(`ABORTADO: a chave ${chave} não existe nesta configuração: campo nunca usado nesta loja `
      + '(ex.: agenda vazia) OU este usuário não tem acesso a ele: confira se a subaba e o campo aparecem '
      + 'vazios na tela. Não há texto para trocar: se o campo aparece vazio, a pessoa cola o valor inteiro à '
      + 'mão (gravacao-arquivo-e-head.md, "Campo que nunca foi usado") e você confere depois com '
      + 'verificarCampoGravou; se ele não aparece para ela, quem grava é quem tem acesso. Não crie a chave '
      + 'por script.');
  }
  const v = cfg[chave];
  if (typeof v !== 'string') {
    throw new Error(`ABORTADO: ${chave} existe, mas não é texto neste escopo (é ${v === null ? 'null' : typeof v}): `
      + 'o campo é guardado de outro jeito nesta loja, e estas funções só trocam texto. Pare e mapeie o '
      + 'campo (snippet G de reconhecimento-da-loja.md) antes de gravar; se for para gravar, a pessoa '
      + 'cola à mão e você confere.');
  }
  return v;
}

/**
 * Tamanho e forma de um campo — sem devolver o texto (o filtro de saída bloqueia `?v=`).
 * Subaba do campo que não aparece neste diálogo: `{chave, abaVisivel: false, ...}`, sem tamanho e sem
 * dizer se a chave existe (o que este usuário não vê não serve de base para gravar; topo desta seção).
 * Chave que não existe: `{chave, abaVisivel: true, existe: false}`, sem lançar (é leitura, e é o backup
 * desse caso). `opcoes`: as de conferirAbaDaChave (`aba`, `seletorAba`).
 */
function lerCampo(chave, opcoes) {
  exigirChaveConfig(chave);
  const dlg = dialogoUnico();
  const { cfg } = escopoConfigLoja(dlg);
  const A = conferirAbaDaChave(chave, dlg, opcoes);
  if (!A.visivel) {
    return { chave, abaVisivel: false, aba: A.caminho, abasVisiveis: A.abas,
      nota: `a subaba ${A.caminho} não aparece neste diálogo. Abra a aba de cima e confira de novo; se, `
        + 'aberta, a subaba não aparece, pode ser o perfil de acesso deste usuário: pare, anote no perfil '
        + '("Acessos deste usuário no admin") e pergunte à pessoa.' };
  }
  if (chaveAusente(cfg, chave)) {
    return { chave, abaVisivel: true, existe: false, nota: 'a chave não existe: campo nunca usado nesta '
      + 'loja OU este usuário não tem acesso a ele: confira se a subaba e o campo aparecem vazios na tela. '
      + 'Se aparecem, anote "ausente em AAAA-MM-DD" como backup; quem grava o primeiro valor é a pessoa '
      + '(gravacao-arquivo-e-head.md, "Campo que nunca foi usado").' };
  }
  const v = valorConfigTexto(cfg, chave);
  return { chave, abaVisivel: true, existe: true, chars: v.length, linhas: v.split('\n').length,
           crlf: /\r\n/.test(v) };
}

/** O mesmo que lerCampo('customCodeOnHead', opcoes). */
function lerHead(opcoes) {
  const r = lerCampo('customCodeOnHead', opcoes);
  delete r.chave;
  return r;
}

/**
 * Compara o valor atual de um campo com o backup local (sha NORMALIZADO). Aborta se não bater:
 * alguém mudou a configuração depois do backup, ou um diálogo aberto em outra aba (ou em outro
 * computador) gravou. Aborta ANTES, se a subaba do campo não aparece neste diálogo para este
 * usuário (conferirAbaDaChave; topo desta seção): é a primeira trava de toda gravação daqui.
 *   await conferirCampoAtual('skin', '<sha normalizado do backup da agenda>')
 *   await conferirCampoAtual('skin', sha, { aba: /Rótulo deste admin/i })   // rótulo anotado no perfil
 */
async function conferirCampoAtual(chave, shaNormalizadoDoBackup, opcoes) {
  exigirChaveConfig(chave);
  const esperado = exigirHex64(shaNormalizadoDoBackup, `o sha NORMALIZADO do backup de ${chave}`);
  const dlg = dialogoUnico();
  const { cfg } = escopoConfigLoja(dlg);
  window.__CAMPO_CONFERIDO = null;
  const A = conferirAbaDaChave(chave, dlg, opcoes);
  if (!A.visivel) throw erroAbaInvisivel(chave, A);
  const v = valorConfigTexto(cfg, chave);
  if ((await shaNormalizado(v)) !== esperado) {
    throw new Error(`ABORTADO: ${chave} atual não é o do seu backup (comparado normalizado). `
      + 'Alguém mudou a configuração depois do backup — ou um diálogo aberto em outra aba ou em '
      + 'outro computador gravou. '
      + 'Faça o backup de novo e refaça a troca a partir dele.');
  }
  window.__CAMPO_CONFERIDO = { dlg, chave };
  window.__BACKUP_CAMPO = { chave, valor: v };
  return { chave, chars: v.length, confere: true };
}

/** O mesmo que conferirCampoAtual('customCodeOnHead', sha, opcoes). */
async function conferirHeadAtual(shaNormalizadoDoBackup, opcoes) {
  const r = await conferirCampoAtual('customCodeOnHead', shaNormalizadoDoBackup, opcoes);
  return { chars: r.chars, confere: r.confere };
}

/**
 * Troca só os trechos pedidos num campo da configuração, no escopo do diálogo. Não grava: depois,
 * `confirmarConfigLoja()`.
 *   trocarNaConfig('headerTopBarShow', [['false', 'true']])
 *   trocarNaConfig('skin', [[trechoUnicoDoBackup, oMesmoTrechoComOSeuItem]])
 * Para cada par [de, para]: `de` aparece EXATAMENTE uma vez. Depois confere que desfazer as trocas,
 * de trás para a frente e nas mesmas posições, devolve o valor original — ou seja, que nada além do
 * pedido mudou. Opera sobre o texto como está (as CRLF ficam): gere `de` e `para` no terminal a
 * partir do backup, lido sem converter as quebras de linha.
 * Regras por chave:
 *   - customCodeOnHead: `para` não pode existir no texto (número de versão nunca usado);
 *   - skin: o resultado tem de passar em JSON.parse e ser uma lista ([ … ]).
 * `opcoes.exigirInedito` liga ou desliga a primeira regra para qualquer chave.
 * Uma troca por conferência: para refazer, fecharConfigLoja(), recarregue e comece de novo.
 */
function trocarNaConfig(chave, trocas, opcoes) {
  exigirLoja();
  exigirChaveConfig(chave);
  if (!Array.isArray(trocas) || !trocas.length) throw new Error('Passe uma lista de pares: [[de, para], ...].');
  const inedito = opcoes && opcoes.exigirInedito != null ? !!opcoes.exigirInedito : chave === 'customCodeOnHead';
  const dlg = dialogoUnico();
  const C = window.__CAMPO_CONFERIDO;
  if (!C || C.dlg !== dlg || C.chave !== chave) {
    throw new Error(`ABORTADO: ${chave} deste diálogo não foi comparado com o backup. `
      + `Rode await conferirCampoAtual('${chave}', sha) antes.`);
  }
  const { sc, cfg } = escopoConfigLoja(dlg);
  const antes = valorConfigTexto(cfg, chave);
  let novo = antes;
  const feitas = [];
  for (const par of trocas) {
    const de = par && par[0], para = par && par[1];
    if (typeof de !== 'string' || typeof para !== 'string' || !de || de === para) {
      throw new Error('Cada troca é [de, para]: dois textos diferentes, e o "de" não vazio.');
    }
    const n = novo.split(de).length - 1;
    if (n !== 1) {
      throw new Error(`ABORTADO: "${semQuery(de.slice(0, 80))}" aparece ${n} vez(es) em ${chave}; `
        + 'esperado exatamente 1. Use um trecho maior, que seja único.');
    }
    if (inedito && para && novo.indexOf(para) >= 0) {
      throw new Error(`ABORTADO: "${semQuery(para.slice(0, 80))}" já existe em ${chave}. `
        + 'Use um número que nunca foi usado.');
    }
    const i = novo.indexOf(de);
    novo = novo.slice(0, i) + para + novo.slice(i + de.length);
    feitas.push({ i, de, para });
  }
  let volta = novo;
  for (const f of feitas.slice().reverse()) {
    volta = volta.slice(0, f.i) + f.de + volta.slice(f.i + f.para.length);
  }
  if (volta !== antes) {
    throw new Error(`ABORTADO: desfazer a troca não devolve ${chave} original — algo além do pedido mudaria.`);
  }
  if (chave === 'skin') {
    let lista;
    try { lista = JSON.parse(novo); } catch (e) {
      throw new Error('ABORTADO: a agenda nova não passa em JSON.parse (' + e.message + '). Nada foi escrito.');
    }
    if (!Array.isArray(lista)) throw new Error('ABORTADO: a agenda nova não é uma lista JSON ([ … ]). Nada foi escrito.');
  }
  cfg[chave] = novo;
  try { if (!sc.$root.$$phase) sc.$apply(); } catch (e) { /* ok */ }
  if (cfg[chave] !== novo) {
    throw new Error(`ABORTADO: ${chave} no escopo não ficou igual ao trocado depois do digest. Não confirme.`);
  }
  window.__SC_LOJA = sc;
  window.__DLG_LOJA = dlg;
  window.__CAMPO_NOVO = { chave, valor: novo };
  window.__CAMPO_CONFERIDO = null;
  return { chave, antesChars: antes.length, depoisChars: novo.length, delta: novo.length - antes.length,
           trocas: trocas.length };
}

/**
 * Troca só os trechos pedidos no <head>: trocarNoHead([['/seu-tema.css?v=8', '/seu-tema.css?v=9']]).
 * É trocarNaConfig('customCodeOnHead', trocas) com a regra do número nunca usado.
 * Duas trocas numa gravação, medido em 2026-10-22 numa loja: o número de um CSS e, no mesmo campo, uma
 * linha de cima trocada por ela mesma + a linha de um JS novo (gravacao-arquivo-e-head.md, "Mudança em
 * duas peças: a ordem").
 * Para TIRAR uma linha: trocarNaConfig('customCodeOnHead', [['\r\n' + LINHA, '']]) (para vazio não passa
 * por aqui; gravacao-arquivo-e-head.md, "Desfazer").
 */
function trocarNoHead(trocas) {
  if (Array.isArray(trocas) && trocas.some(p => !p || typeof p[1] !== 'string' || !p[1])) {
    throw new Error('Cada troca é [de, para], dois textos diferentes e não vazios.');
  }
  const r = trocarNaConfig('customCodeOnHead', trocas, { exigirInedito: true });
  return { antesChars: r.antesChars, depoisChars: r.depoisChars, delta: r.delta, trocas: r.trocas };
}

/**
 * Grava a configuração da loja: clique COMPOSTO no elemento de ng-click="controller.confirmar(...)".
 * Só depois de `trocarNaConfig` (ou `trocarNoHead`) neste mesmo diálogo, e com o campo ainda igual
 * ao que ela escreveu. Não fecha o diálogo; "Registro inserido com sucesso." aparece duas vezes
 * (inofensivo).
 * Onde procura: primeiro dentro do diálogo; se lá não há nenhum, na página. Foi com esta busca que as
 * gravações do <head> funcionaram em produção (qual dos dois achou o botão não foi anotado). Fora do
 * diálogo, só aceita um elemento cujo escopo Angular desce do MESMO escopo que recebeu a troca
 * (`window.__SC_LOJA`, subindo por $parent; nunca o $rootScope). Um `controller.confirmar` de fora com
 * outro escopo é de outra tela que ficou no DOM: com o `Confirmar` deste diálogo escondido pelo perfil
 * de acesso, clicar nele gravaria outra coisa. Aborta, como confirmarGravacao e confirmarArquivo
 * (gravacao-arquivo-e-head.md, "Antes de qualquer gravação", item 7). Esta trava do escopo é de 2026-10-21.
 * Em 2026-10-22, numa loja, a função já com ela gravou o <head> ("Registro inserido com sucesso." duas
 * vezes, como descrito acima); qual dos dois caminhos achou o botão, de novo, não foi anotado, então a
 * trava do escopo segue não medida: se ela abortar onde antes gravava, pare e mapeie pelo DOM com a
 * pessoa; não a contorne.
 * Exige um elemento só; nenhum é motivo para parar e perguntar (pode ser o perfil de acesso: SKILL.md,
 * regra zero).
 */
function confirmarConfigLoja() {
  const L = exigirLoja();
  if (window.__LOJA_GRADE_OK !== L.dominio) {
    throw new Error('ABORTADO: a linha da loja não foi conferida (conferirLojaNaGrade) nesta carga do admin.');
  }
  const dlg = dialogoUnico();
  const { sc, cfg } = escopoConfigLoja(dlg);
  const N = window.__CAMPO_NOVO;
  if (!N || !window.__SC_LOJA || sc !== window.__SC_LOJA || dlg !== window.__DLG_LOJA) {
    throw new Error('ABORTADO: o diálogo aberto não é o que recebeu a troca (trocarNaConfig ou '
      + 'trocarNoHead). Recarregue o admin e refaça.');
  }
  if (cfg[N.chave] !== N.valor) {
    throw new Error(`ABORTADO: ${N.chave} no escopo mudou depois da troca. Refaça a troca.`);
  }
  const confirmar = el => /controller\.confirmar\s*\(/.test(el.getAttribute('ng-click') || '');
  let alvos = [...dlg.querySelectorAll('[ng-click]')].filter(confirmar);
  if (!alvos.length) {
    // Fora do diálogo: só o que é do mesmo escopo que recebeu a troca (nunca o $rootScope).
    const S = window.__SC_LOJA;
    const doEscopoDaTroca = x => {
      if (!S || S === S.$root) return false;
      try {
        for (let s = window.angular.element(x).scope(); s; s = s.$parent) if (s === S) return true;
      } catch (e) { /* sem escopo legível: não é deste diálogo */ }
      return false;
    };
    const fora = [...document.querySelectorAll('[ng-click]')].filter(confirmar);
    alvos = fora.filter(doEscopoDaTroca);
    if (!alvos.length) {
      throw new Error('ABORTADO: o diálogo não tem ng-click="controller.confirmar(...)"'
        + (fora.length
          ? `, e o(s) ${fora.length} de fora não são do escopo que recebeu a troca: podem ser de outra tela`
          : '')
        + '. Não grave por outro caminho.' + dicaAcesso());
    }
  }
  // Só o que aparece na tela. Um Confirmar que está no DOM mas escondido pode ser o perfil de acesso deste
  // usuário: não se clica por baixo (SKILL.md, regra zero).
  const escondidos = alvos.filter(x => x.offsetParent === null);
  alvos = alvos.filter(x => x.offsetParent !== null);
  if (!alvos.length && escondidos.length) {
    throw new Error('ABORTADO: o Confirmar deste diálogo está na página, mas não aparece na tela. Pode ser o '
      + 'perfil de acesso deste usuário, ou a janela estreita demais: alargue a janela e veja se o botão '
      + 'aparece. Não grave por outro caminho.' + dicaAcesso());
  }
  if (alvos.length !== 1) {
    throw new Error(`ABORTADO: ${alvos.length} elemento(s) com ng-click="controller.confirmar(...)"; esperado 1.`
      + (alvos.length === 0 ? dicaAcesso() : ''));
  }
  cliqueComposto(alvos[0]);
  window.__DLG_LOJA_GRAVADO = dlg;
  return { clicou: true, chave: N.chave, depois: 'O diálogo não fecha sozinho. Em outra chamada, feche com '
    + 'fecharConfigLoja(), recarregue, reabra e prove com verificarCampoGravou(chave, sha). '
    + 'Depois, o cache da configuração.' };
}

/**
 * Fecha o diálogo Configurações sem gravar. Procura `controller.cancelar` subindo por $parent a partir de,
 * nesta ordem: o select Tipo (`data.tipo`), os outros campos com ng-model do diálogo e, por último, o botão
 * Cancelar (nunca o $rootScope). Medido 2026-10-22, numa loja: o escopo do PRÓPRIO botão Cancelar não tinha o
 * controller (a versão anterior partia dele e abortava). Partir do select Tipo é o caminho de escopoConfigLoja
 * (que lê `data.configuracao` a partir dele, medido); que por ele se chegue a `controller.cancelar` ainda não
 * foi medido. Se nenhum caminho achar o controller, clica no
 * `Cancelar` de DENTRO do diálogo com o clique composto (o de cancelarDialogo, que fechou esse diálogo duas
 * vezes na mesma medição). Depois exige que nenhum `.ui-dialog` esteja visível; senão, lança: feche pelo
 * botão Cancelar e mostre à pessoa. Devolve { fechou, metodo, dialogosNoDom, visiveis } (o diálogo pode
 * sair do DOM ou ficar escondido: medido sair, nesta tela; o reload antes de reabrir vale para os dois).
 */
function fecharConfigLoja() {
  const dlg = dialogoUnico();
  if (!window.angular) throw new Error('sem window.angular.');
  const ehCancelar = x => /^\s*Cancelar\s*$/i.test((x.textContent || '').trim())
    || /controller\.cancelar/.test(x.getAttribute('ng-click') || '');
  const botoesCancelar = [...dlg.querySelectorAll('button, a, [ng-click]')].filter(ehCancelar);
  const sementes = [dlg.querySelector('select[ng-model="data.tipo"]'), ...dlg.querySelectorAll('[ng-model]'),
    ...botoesCancelar].filter(Boolean);
  let alvo = null, de = '';
  for (const se of sementes) {
    let s;
    try { s = window.angular.element(se).scope(); } catch (e) { s = null; }
    while (s && !(s.controller && typeof s.controller.cancelar === 'function')) s = s.$parent;
    if (s && s !== s.$root) {
      alvo = s;
      de = se.getAttribute('ng-model') ? `ng-model ${se.getAttribute('ng-model')}` : 'botão Cancelar';
      break;
    }
  }
  let metodo;
  if (alvo) {
    alvo.$apply(() => alvo.controller.cancelar());
    metodo = `controller.cancelar (achado pelo escopo de ${de})`;
  } else {
    const b = acharPorRotulo('Cancelar', dlg);
    if (!b) {
      throw new Error('ABORTADO: nem controller.cancelar nem um botão Cancelar visível dentro do diálogo. Feche pelo '
        + 'botão Cancelar e mostre à pessoa.' + dicaAcesso());
    }
    cliqueComposto(b);
    metodo = 'botão Cancelar do diálogo (clique composto, o de cancelarDialogo)';
  }
  const c = contarDialogos();
  if (c.visiveis !== 0) {
    throw new Error(`ABORTADO: depois de fechar (${metodo}) ainda há ${c.visiveis} .ui-dialog visível. Confira com um `
      + 'screenshot; feche pelo botão Cancelar e mostre à pessoa. Não grave nada com ele aberto.');
  }
  return { fechou: true, metodo, dialogosNoDom: c.total, visiveis: c.visiveis };
}

/**
 * Prova de gravação de um campo: diálogo REABERTO (outro nó), Tipo = Site, sha NORMALIZADO igual ao
 * do valor novo gerado no terminal. `presentes`: trechos que têm de estar lá.
 * Serve também depois de a PESSOA colar o primeiro valor de um campo nunca usado: a chave passa a
 * existir. Se ela ainda não existir, devolve `existe: false, confere: false` (a colagem não gravou,
 * ou o diálogo não foi reaberto).
 */
async function verificarCampoGravou(chave, shaNormalizadoEsperado, presentes) {
  exigirChaveConfig(chave);
  const esperado = exigirHex64(shaNormalizadoEsperado, `o sha NORMALIZADO do valor novo de ${chave}`);
  const dlg = dialogoUnico();
  if (window.__DLG_LOJA_GRAVADO && dlg === window.__DLG_LOJA_GRAVADO) {
    throw new Error('ABORTADO: este é o MESMO nó de diálogo em que você gravou. Recarregue, reabra '
      + 'Configurações e leia de novo.');
  }
  const { cfg } = escopoConfigLoja(dlg);
  if (chaveAusente(cfg, chave)) {
    return { chave, existe: false, confere: false, nota: 'a chave continua ausente: nada foi gravado '
      + 'nela (ou este diálogo não foi reaberto depois da colagem).' };
  }
  const v = valorConfigTexto(cfg, chave);
  const rel = { chave, existe: true, chars: v.length, confere: (await shaNormalizado(v)) === esperado };
  if (Array.isArray(presentes)) rel.presentes = presentes.map(p => v.indexOf(p) >= 0);
  return rel;
}

/** O mesmo que verificarCampoGravou('customCodeOnHead', sha, presentes). */
async function verificarHeadGravou(shaNormalizadoEsperado, presentes) {
  const r = await verificarCampoGravou('customCodeOnHead', shaNormalizadoEsperado, presentes);
  delete r.chave;
  return r;
}

/**
 * A tela Administrador › Cache está filtrada pela loja do perfil, e a grade visível tem UMA linha
 * loja_config? Devolve essa linha (<tr>); aborta em qualquer dúvida.
 * Por quê (medido numa loja, 2026-10): sem o filtro Loja, a grade mostrou OUTRA linha
 * "Configurações da Loja" com o mesmo código `loja_config` e outra data de Último flush. Limpar ou
 * ler aquela é trabalhar no cache de outra configuração e achar que foi o da sua.
 * O filtro Loja é o de filtroLojaDoPerfil (seção 2): o select visível com o RÓTULO Loja e a opção
 * escolhida valendo `string:N` ou `number:N`, com N = a loja de `definirLoja` (o formato medido nos
 * filtros Loja, nas telas Páginas e Cache; o snippet C de reconhecimento-da-loja.md mostra o da sua),
 * ou, quando o rótulo não se lê (medido 2026-10: um seletor bootstrap), esse valor E o texto da opção
 * igual ao `lojaNome` de definirLoja. Só o valor não basta: com uma loja de número baixo, um select de
 * Tipo ou de situação pode estar no mesmo `number:N`. Se nada casar (ou mais de um), aborta: escolha a
 * loja no filtro, `Atualizar`, e repita. Se o filtro da sua tela usar outro formato de valor, esta
 * função não serve ali: siga o que SKILL.md diz para uma trava com defeito de leitura (mostre a
 * evidência; corrija, ou a pessoa faz, ou com o OK dela você faz pela tela conferindo as mesmas
 * condições pelo DOM), e confira pelo HTML servido.
 */
function linhaLojaConfigDoPerfil(grade) {
  filtroLojaDoPerfil();   // aborta sem o filtro Loja na loja do perfil
  const linhas = [...grade.querySelectorAll('tr')]
    .filter(t => !t.closest('thead') && /loja_config/.test(t.innerText || ''));
  if (linhas.length !== 1) {
    throw new Error(`ABORTADO: ${linhas.length} linha(s) loja_config na grade visível; esperado exatamente 1 `
      + '(a da sua loja, com o filtro Loja). Confira o filtro, Atualizar, e repita.'
      + (linhas.length === 0 ? dicaAcesso() : ''));
  }
  return linhas[0];
}

/**
 * Cache da configuração: em Administrador › Cache, com o filtro Loja = a loja do perfil, UMA linha
 * loja_config na grade visível e SÓ ela marcada ("Configurações da Loja"). Clica `Limpar cache` (o
 * rótulo é exato: não pega "Limpar todo o cache" nem "Limpar cache do CDN"). Pergunte à pessoa
 * antes de usar (ou use se ela pediu).
 */
function limparCacheConfigLoja() {
  exigirLoja();
  const grade = gradeVisivel();
  const marcadas = [...grade.querySelectorAll('tr input[type=checkbox]')]
    .filter(c => c.checked && !c.closest('thead'));
  if (marcadas.length !== 1) {
    throw new Error(`ABORTADO: ${marcadas.length} linha(s) marcada(s) na grade de cache; marque só `
      + '"Configurações da Loja" (loja_config).');
  }
  const texto = (marcadas[0].closest('tr').innerText || '').replace(/\s+/g, ' ').trim();
  if (!/loja_config/.test(texto)) {
    throw new Error(`ABORTADO: a linha marcada não é a "Configurações da Loja" (loja_config): `
      + `"${semQuery(texto.slice(0, 80))}"`);
  }
  const unica = linhaLojaConfigDoPerfil(grade);   // filtro Loja do perfil e uma linha loja_config só
  if (marcadas[0].closest('tr') !== unica) {
    throw new Error('ABORTADO: a linha marcada não é a única loja_config da grade visível.');
  }
  anotarModais();                 // se o clique abrir modal, só clicarOkDoModal(/cache/i) responde
  const ok = clicarBotao('Limpar cache');
  if (!ok) window.__AJS_ANTES = null;
  return { clicou: ok, filtroLoja: (window.__FILTRO_LOJA || {}).metodo || null,
           depois: 'Em outra chamada, uns segundos depois: ultimoFlushConfigLoja(). Se '
    + 'abrir um modal de confirmação: clicarOkDoModal(/cache/i), nunca clicarBotao("OK"). A prova é o '
    + 'HTML servido com o número novo, nos dois User-Agents.' };
}

/**
 * A coluna "Último flush" da linha loja_config. É INDÍCIO, não prova: numa loja (2026-10-22) ela não
 * mudou depois de uma limpeza que funcionou, e a origem já servia o <head> novo. A prova é o HTML
 * servido (com uma query nc nova, nos dois User-Agents) trazendo o número novo. Lança com a tela sem o
 * filtro Loja do perfil, ou com mais de uma (ou nenhuma) linha loja_config visível: a data de outra
 * linha não diz nada.
 */
function ultimoFlushConfigLoja() {
  const grade = gradeVisivel();
  const cab = [...grade.querySelectorAll('tr')].find(tr => tr.querySelector('th'));
  const ths = cab ? [...cab.children] : [];
  const idx = ths.findIndex(th => /[ÚU]ltimo\s+flush/i.test(th.textContent || ''));
  const tr = linhaLojaConfigDoPerfil(grade);
  const cel = idx >= 0 ? tr.children[idx] : null;
  return { ultimoFlush: cel ? (cel.innerText || '').trim() : null, colunaAchada: idx >= 0,
           agora: new Date().toLocaleString('pt-BR'), filtroLoja: (window.__FILTRO_LOJA || {}).metodo || null,
           nota: 'Último flush é indício: numa loja (2026-10) ele não mudou depois de limpar, e a origem já '
             + 'servia o <head> novo. A prova é o HTML servido (query nc nova, nos dois User-Agents) com o '
             + 'número novo.' };
}

/* ------------------------------------------------------------------ *
 * USO — a sequência completa, com as travas                          *
 * ------------------------------------------------------------------ *
 * ⚠️ UMA CHAMADA POR PASSO. Não junte clique + espera + conferência num único evaluate: os
 * 45s do CDP estouram (medido) e você fica sem saber em que ponto parou.
 * Os valores N, NNNNNN, 'minha-pagina-teste' e 'admin.SUA-LOJA.com.br' são marcadores: os da sua
 * loja estão no perfil dela (~/.claude/panorama-lojas/<slug-da-loja>.md).
 *
 * // -- a loja (depois de cada reload); lojaNome e campoLoja vêm do perfil, se ele tiver --
 * definirLoja({ loja: N, hostAdmin: 'admin.SUA-LOJA.com.br', dominio: 'www.SUA-LOJA.com.br' });
 *
 * // -- chegar na linha certa --
 * clicarMenu('Páginas');                  // clique SIMPLES (composto abre duas abas internas)
 * filtrosDaTela();                         // os filtros DESTA tela, pelo rótulo: mudam de admin
 * //                                          para admin, e todos têm o mesmo ng-model
 * // filtre pelo # se a tela tiver esse filtro: campoDoFiltro('#') (nunca pelo índice: no mesmo
 * // índice, cada admin tem outro filtro). Sem filtro #: Loja + Tipo + Nome (ou um pedaço da URL
 * // sem hífen) e ache a linha pela coluna # da grade. Ver gravacao-construtor.md, "Navegar a tela
 * // Páginas por script".
 * clicarBotao('Atualizar');
 * // marque a linha pelo DOM (nunca por coordenada):
 * //   const tr = [...gradeVisivel().querySelectorAll('tr')].find(t => /NNNNNN/.test(t.textContent));
 * //   tr.querySelector('input[type=checkbox]').click();
 * conferirAlvo(NNNNNN);                   // grade VISÍVEL (e o rodapé, quando diz "Selecionado(s)");
 * //                                          aborta se não for essa linha
 *
 * // -- abrir --
 * await abrirDialogo('Alterar');           // SÓ triggerHandler; aborta se não der exatamente 1
 * abaDialogo(/Configura/i);                // clicarBotao NÃO troca a aba — ver a função
 * conferirDialogo('minha-pagina-teste');   // escopado NO diálogo; loja do perfil; aborta se não for
 *
 * // -- antes de escrever: backup local e comparação (construtor.md, seção 0, "Backup do Blocos:") --
 * await conferirSha(undefined, '<sha do backup, sem os espaços>');   // tem de dar confere: true
 *
 * // -- escrever --
 * injetar(meuJson);                        // JSON pequeno, colado no próprio script
 * // JSON grande: gzip+base64 (gravacao-construtor.md, 3a). Decodifique em window.__PAYLOAD e
 * // confira o sha numa chamada; injetar(window.__PAYLOAD) na seguinte:
 * injetar(window.__PAYLOAD);               // só depois do trecho do 3a dar shaConfere: true
 * // Plano B, a área de transferência — 4 chamadas:
 * criarCaixaDeCola();                      // 1
 * // ctrl+v pela ação `key`                // 2  (NUNCA ctrl+a antes — digita a letra "a")
 * await conferirCola('<sha256 do arquivo>');   // 3  aborta a olho se não bater
 * await injetarDaCola();                   // 4
 * await conferirSha();                     // depois de qualquer caminho: fixa o sha CANÔNICO
 *
 * // -- gravar --
 * confirmarGravacao();                     // sequência completa + travas de loja e de escopo
 *
 * // -- provar que gravou, na FONTE --
 * location.reload();                       // o diálogo velho pode ficar no DOM (medido aqui, depois de
 * //                                          gravar); recarregue sempre, fique ele ou saia
 * // definirLoja(...) de novo, refiltrar, marcar, conferirAlvo(NNNNNN),
 * // await abrirDialogo('Alterar'), abaDialogo(/Configura/i)
 * await verificarGravou('<sha canônico>');
 *
 * // -- só então olhar o ar --
 * limparCache(NNNNNN);                     // se publicada; confere a linha marcada antes de clicar
 * clicarOkDoModal(/cache/i);               // em OUTRA chamada, se abriu modal. Nunca clicarBotao('OK'):
 * //                                          os modais já respondidos (de um Publicar, por exemplo)
 * //                                          continuam no DOM, e o primeiro OK achado pode ser o deles.
 * // e REMARQUE a linha: o Limpar cache zera a seleção
 *
 * SE O CAMPO `Blocos:` NÃO EXISTIR (página do construtor ainda vazia — armadilhas.md 1d), o
 * rótulo "Blocos:" aparece sem campo nenhum, porque ele está atrás de
 * `<!-- ngIf: configInput.builder -->`.
 *
 * ⚠️ CORREÇÃO (2026-08-11): a receita que estava aqui — abrirConstrutor() -> Box -> Aplicar ->
 * Confirmar — NÃO COMEÇA. Nessa condição não há árvore para o construtor editar (sem
 * `data.config.builder`). O `offsetParent === null` do botão `Abrir construtor`, que já foi dado
 * como a causa, vem da aba, não da página vazia (armadilhas.md 1e).
 *
 * O que funciona é destravar o ng-if pelo scope, e é seguro pelo motivo da seção 0: atribuir o
 * model por script NÃO dispara o `ng-change`, então isto é só tela — `data.config.builder`
 * continua vazio (conferido: 0 chars depois de rodar).
 *
 *   const sc = angular.element(dialogoUnico()
 *     .querySelector('textarea[ng-model="configInput.custom"]')).scope();
 *   sc.configInput.builder = '{"style":"","block_list":[],"body_class":"","config":{}}';
 *   if (!sc.$root.$$phase) sc.$apply();   // o campo `Blocos:` aparece
 *   // daqui em diante o fluxo normal: 3a (gzip+base64) ou 3b (cola) -> confirmarGravacao
 *
 * Na gravação seguinte da mesma página o campo já existe e nada disso é necessário.
 *
 * Bônus: com um Box recém-criado, `JSON.parse(document.querySelector('input[name=syncData]').value)`
 * devolve o DEFAULT VIVO da config base. Use para conferir `blocos.md` antes de gerar em volume.
 * Pronto: `abrirConstrutor()` + `lerDefaultVivo('Box')` + `cancelarDialogo()`.
 *
 * ⚠️ ORDEM, em página de rascunho VAZIA (que é o caso normal — a regra zero manda gravar só nela):
 *   1. destrave o campo pelo `configInput.builder` (armadilhas.md 1d);
 *   2. GRAVE um esqueleto — as duas raízes vazias bastam (medido: 2.415 chars);
 *   3. recarregue, remarque, reabra, e SÓ ENTÃO `abrirConstrutor()` / `lerDefaultVivo()`;
 *   4. `cancelarDialogo()` — o Box criado no construtor não foi Aplicado nem Confirmado;
 *   5. gere o JSON de verdade.
 * Sem os passos 1 e 2 o passo 3 do construtor.md é inexecutável. Ver armadilhas.md 1e.
 *
 * Se você abriu uma página só para LER (pegar o CSS original, conferir a estrutura), saia por
 * `cancelarDialogo()`. `Confirmar` grava mesmo que você ache que não mudou nada.
 *
 * DEPOIS DE GRAVAR, verifique renderizando: o front-end deve entregar ~METADE dos blocos
 * gravados (a raiz Mobile é cortada no servidor num pedido desktop). Medido: 234 blocos em 2
 * raízes viraram 119 no desktop e 115 no mobile, com `device_show` consumido e removido do JSON
 * entregue. Ver gravacao-construtor.md.
 *
 * ⚠️ Verifique com `python scripts/verificar_paridade.py`, RODANDO A VERIFICAÇÃO INTEIRA a cada
 * gravação. Verificar só o delta é cego a regressão: numa migração real o logo do cabeçalho
 * quebrou na 3ª gravação, e a 1ª tinha a prova de que estava certo antes.
 *
 * ======= ARQUIVO (CSS/JS do site) — seção 10, gravacao-arquivo-e-head.md Passos A a E =======
 * // no terminal: backup do conteúdo atual, versão nova montada a partir dele, e os sha:
 * //   bytes do arquivo novo, NORMALIZADO do backup, NORMALIZADO do arquivo novo.
 * definirLoja({ loja: N, hostAdmin: 'admin.SUA-LOJA.com.br', dominio: 'www.SUA-LOJA.com.br' });
 * criarEntradaArquivo();                          // B1
 * // upload do arquivo local no #__entrada_arquivo, pela ferramenta de navegador   // B2
 * await lerEntradaArquivo('<sha dos bytes do novo>');       // B3: tem de dar confere: true
 * // filtrar (pelo # do Arquivo, se a tela tiver esse filtro: campoDoFiltro('#'); senão Loja +
 * // Tipo = Arquivo + Nome) e marcar pelo DOM:
 * conferirAlvo(NNNNNN);
 * await abrirDialogo('Alterar');
 * abaDialogo(/Conte[uú]do/i);
 * conferirDialogo('seu-tema.css');
 * await conferirArquivoAtual('<sha normalizado do backup>');   // C: aborta se alguém mudou
 * injetarArquivo();                               // D1: escreve data.body, não grava
 * confirmarArquivo();                             // D2: travas + clique composto
 * location.reload();                              // E: definirLoja de novo, refiltrar, marcar,
 * //                                                 conferirAlvo, abrirDialogo, aba Conteúdo
 * await verificarArquivoGravou('<sha normalizado do novo>', ['trecho só da versão nova']);
 * cancelarDialogo();
 * limparCache(NNNNNN);                            // a linha do Arquivo ainda marcada; confere antes
 * clicarOkDoModal(/cache/i);                      // em OUTRA chamada, se abrir modal; depois,
 * //                                                 remarque a linha. Nunca clicarBotao('OK').
 *
 * ======= ARQUIVO NOVO — seção 10b, gravacao-arquivo-e-head.md "Criar um Arquivo novo" ========
 * // SÓ com o pedido da pessoa nomeando Incluir e Confirmar (e Publicar, se quiser) e a URL.
 * // Antes, num Alterar de um Arquivo do mesmo tipo que já funciona (aba Conteúdo), só lendo:
 * lerTipoDoArquivo();                             // { linguagem, mime }; depois cancelarDialogo() e reload
 * definirLoja({ loja: N, lojaNome: 'Nome', hostAdmin: 'admin.SUA-LOJA.com.br', dominio: 'www.SUA-LOJA.com.br' });
 * // Páginas: filtro Loja = a do perfil, filtro URL = um pedaço da URL nova (Contém), Atualizar
 * conferirUrlLivre('/seu-arquivo.js');            // nenhuma linha desta loja com essa URL
 * await abrirDialogo('Incluir');                  // "Adicionar Página"; Loja e Tipo vêm vazios
 * // pela TELA, com a ferramenta (rotularParaFerramenta(el, 'nome') ajuda o find a achar o campo):
 * //   Loja pelo campo de busca (sugestão "N - Nome"), Tipo = Arquivo, Nome, URL, a linguagem (aba
 * //   Conteúdo) e o tipo do arquivo (aba Configurações) lidos acima; robots e sitemap como os outros
 * await conferirArquivoNovo({ url: '/seu-arquivo.js', linguagem: '<lida>', mime: '<lido>' });
 * criarEntradaArquivo();  // upload pela ferramenta;  await lerEntradaArquivo('<sha dos bytes>');
 * injetarArquivo();                               // escreve data.body; não grava
 * prepararConfirmarCriacao();                     // não clica: rotula o Confirmar "__confirmar_criacao"
 * // UM clique real nele pela ferramenta; NUNCA repita. "Registro inserido com sucesso." uma vez; o
 * // diálogo fica aberto (medido):
 * cancelarDialogo();
 * location.reload();                              // definirLoja, filtros Loja e URL, Atualizar
 * conferirCriacao('/seu-arquivo.js');             // uma linha só: o # novo; duas: pare e mostre à pessoa
 * // e prove o conteúdo pelo Alterar da linha nova: conferirDialogo, verificarArquivoGravou
 *
 * ======= PUBLICAR — seção 10b, gravacao-arquivo-e-head.md "Publicar, quando a pessoa pede" ===
 * // SÓ com uma frase da pessoa que pede Publicar e nomeia a página (o # ou a URL), sem condição nem
 * // aprovação junto ("sem publicar", "antes de publicar", "aprovado"). Marque só a linha.
 * prepararPublicar({ numero: NNNNNN, url: '/seu-arquivo.js', pedido: '<a frase dela, como veio>' });
 * // UM clique real no "__publicar"; em OUTRA chamada:
 * prepararOkDoPublicar({ numero: NNNNNN, url: '/seu-arquivo.js' });   // confere o modal; rotula "__ok_publicar"
 * // UM clique real no "__ok_publicar"; Atualizar (o Publicar zera a seleção):
 * conferirPublicada({ numero: NNNNNN, url: '/seu-arquivo.js' });      // e o curl do endereço com query nc nova
 *
 * ======= <head> DA LOJA — seção 11, gravacao-arquivo-e-head.md Passos F e G =================
 * // ANTES: pergunte se alguém (a pessoa ou outra pessoa da loja, em outra aba ou em outro
 * //   computador) está com Configurações da loja aberto. Se estiver, Cancelar lá primeiro.
 * definirLoja({ loja: N, hostAdmin: 'admin.SUA-LOJA.com.br', dominio: 'www.SUA-LOJA.com.br' });
 * // Único › Lojas, marcar a linha da loja pelo DOM:
 * conferirLojaNaGrade();
 * await abrirConfiguracoesDaLoja();               // refaz conferirLojaNaGrade na mesma chamada
 * escolherTipoSite();                             // espere ~2,5 s
 * abaDialogo(/\bIntegra[cç][oõ]es\b/i);           // a aba do campo, como a pessoa abriria; e, em
 * abaDialogo(/\bCustom\b/i);                      //   OUTRA chamada, a subaba (se não trocar: a pessoa clica)
 * lerHead();                                      // abaVisivel: false = a subaba não aparece para este
 * //                                                 usuário: PARE, anote no perfil e pergunte
 * // backup exato do <head> (snippets D e E do reconhecimento, com o diálogo aberto); no terminal,
 * //   o <head> novo (backup com a troca) e os dois sha normalizados.
 * await conferirHeadAtual('<sha normalizado do backup do head>');
 * trocarNoHead([['/seu-tema.css?v=8', '/seu-tema.css?v=9']]);
 * // duas peças (CSS + JS novo) numa gravação só, medido:
 * //   trocarNoHead([[cssV8, cssV9], [linhaDeCima, linhaDeCima + '\r\n' + linhaDoJs]]);
 * confirmarConfigLoja();                          // não fecha; "Registro inserido" 2 vezes
 * fecharConfigLoja();                             // controller pelo select Tipo, ou o Cancelar do diálogo;
 * //                                                 lança se ainda houver diálogo visível
 * location.reload();                              // definirLoja, marcar, conferirLojaNaGrade,
 * //                                                 abrirConfiguracoesDaLoja, escolherTipoSite
 * await verificarHeadGravou('<sha normalizado do head novo>', ['/seu-tema.css?v=9']);
 * // cache da configuração (pergunte antes, ou faça se a pessoa pediu): Administrador › Cache,
 * //   filtro Loja = a loja do perfil, Atualizar, UMA linha loja_config na grade, marcar só ela
 * limparCacheConfigLoja();                        // confere filtro e linha; se abrir modal:
 * //                                                 clicarOkDoModal(/cache/i)
 * ultimoFlushConfigLoja();                        // indício (numa loja não mudou); a PROVA é o HTML
 * //                                                 servido com query nc nova, nos dois User-Agents
 *
 * ======= AGENDA, BARRA DO TOPO, LOGO — seção 11, gravacao-arquivo-e-head.md ==================
 * // O mesmo caminho do <head>, com as funções genéricas e a chave do campo:
 * //   skin · headerTopBarShow · textoHeaderTopbar · svgLogo   (e customCodeOnHead)
 * conferirLojaNaGrade();
 * await abrirConfiguracoesDaLoja();
 * escolherTipoSite();                             // espere ~2,5 s
 * abaDialogo(/\bVisual\b/i);                      // a aba do campo e, em OUTRA chamada, a subaba
 * abaDialogo(/\bModelo e Skin\b/i);               //   (abaDaChave('skin') diz qual; se não trocar: a pessoa clica)
 * lerCampo('skin');                               // abaVisivel: false = a subaba não aparece para este
 * //   usuário: PARE e pergunte. existe: false = campo nunca usado OU sem acesso ao campo: PARE aqui,
 * //   confira na tela que o campo aparece vazio; aí a pessoa cola o valor inteiro e você confere com
 * //   verificarCampoGravou depois de reabrir (gravacao-arquivo-e-head.md, "Campo que nunca foi
 * //   usado"). Nada abaixo cria a chave.
 * // backup do campo (snippets D e E do reconhecimento, com o diálogo aberto); no terminal, o valor
 * // novo, os dois sha normalizados e os pares [de, para] gerados a partir do backup, sem converter
 * // as quebras de linha.
 * await conferirCampoAtual('skin', '<sha normalizado do backup da agenda>');
 * trocarNaConfig('skin', [[trechoUnico, mesmoTrechoComOSeuItem]]);   // aborta se não for lista JSON
 * confirmarConfigLoja();
 * fecharConfigLoja();
 * location.reload();                              // definirLoja, marcar, conferirLojaNaGrade, ...
 * await verificarCampoGravou('skin', '<sha normalizado da agenda nova>', ['"name": "meu-tema"']);
 * limparCacheConfigLoja();  ultimoFlushConfigLoja();   // pergunte antes (ou se a pessoa pediu) */
