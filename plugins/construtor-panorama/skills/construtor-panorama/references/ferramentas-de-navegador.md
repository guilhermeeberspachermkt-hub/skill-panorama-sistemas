# Ferramentas de navegador: limites e manias medidos

Os outros arquivos da skill descrevem a plataforma. Este descreve o **canal**: a ferramenta que conecta o
assistente ao navegador da pessoa. Tudo aqui foi medido entre agosto e outubro de 2026, com a extensão do
Claude para Chrome e com o painel de navegador do aplicativo do Claude para computador. Ferramentas mudam de
versão, e outra ferramenta pode ter outros limites (ou nenhum destes). Quando uma verificação correta
**parecer** falha, olhe esta lista antes de concluir que o site ou o admin estão errados: cada item aqui
já custou um diagnóstico errado.

**Noutra ferramenta** (no Codex, a extensão do ChatGPT para Chrome ou um servidor MCP de navegador, como o
Chrome DevTools MCP), nada disto foi medido. O que a skill precisa da ferramenta, e como testar cada
capacidade, está em `primeiro-uso.md`, 1b. Os itens abaixo valem como hipótese: um limite de tempo, uma saída
cortada ou um filtro que esconde texto podem existir lá também, com outros números. O que você medir vai para
o perfil, na seção "Ambiente", com a data e o nome da ferramenta.

Se não houver ferramenta de navegador conectada, nada disto se aplica: siga o modo guiado do `SKILL.md`.

## 1. O que volta de cada chamada

- **Tempo limite de ~45 s por chamada.** Uma única chamada de JavaScript com `await` de ~3,5–4 s **somado**
  a trabalho de DOM já estourou; 596 KB de `JSON.stringify` somados a um `await` também. Separe em
  chamadas: uma clica, outra espera, outra confere. Nunca "clica + espera + mede" numa chamada só.
- **Saída cortada perto de 1.000 caracteres.** Devolva em fatias (o `fatia()` de
  `reconhecimento-da-loja.md`), não de uma vez.
- **Filtro de saída.** Retornos que parecem base64, JWT, cookie ou query string voltam como
  `[BLOCKED: Base64 encoded data]`, `[BLOCKED: JWT token]`, `[BLOCKED: Cookie/query string data]`, e você
  fica sem saber se a checagem passou. Aconteceu com um `href` com `?utm=`, com um `?v=8` do `<head>`, com
  um sha256 cru e com medidas coladas como `"1520.8x866"` (3 de 6 seções bloqueadas, parecendo DOM
  corrompido). Devolva booleanos, contagens e listas de números; troque `?&=` por outro caractere
  (`.replace(/[?&=]/g, ' ')`), quebre o hash em grupos (`shaLegivel()` de `scripts/injetar.js`) ou devolva
  `charCodeAt`.
- **`navigator.clipboard.readText()` estoura o tempo limite**: abre um prompt de permissão e a chamada
  morre esperando alguém clicar. Não é o clipboard que está inacessível; é a API que exige gesto.

## 2. Abas, janelas e larguras

- **Aba aberta pela ferramenta pode vir estreita.** Todas as abas do grupo da extensão relataram
  `innerWidth` 375 (e 667 de altura) mesmo depois de redimensionar. O admin esconde o menu lateral nessa
  largura, mas os botões continuam no DOM e respondem ao `triggerHandler`: mais um motivo para agir pelo
  DOM. Para medir o computador de verdade no site, abra uma página leve da **mesma origem**
  (`https://www.SUA-LOJA.com.br/robots.txt`) e ponha nela um `<iframe>` do tamanho exato:

  ```js
  (function () {
    var f = document.createElement('iframe');
    f.id = 'teste';
    f.src = '/';                                   // a página a medir, mesma origem
    f.style.cssText = 'width:1920px;height:1080px;border:0;position:absolute;left:0;top:0;transform-origin:0 0;transform:scale(.19)';
    document.body.appendChild(f);
  })()
  // depois: var w = document.getElementById('teste').contentWindow;  w.innerWidth === 1920
  ```

  Dentro do iframe, `innerWidth` é 1920 e o `<body>` é `notMobile`. O `scale` só diminui a imagem para o
  screenshot caber; as medidas lá dentro não mudam. Rode os trechos de medição com `w.eval(codigo)`.
  - **O iframe mede o documento dele, não uma janela.** A rolagem lateral e as larguras lá dentro podem sair
    diferentes das de uma janela de verdade da mesma largura (medido numa loja, 2026-10-22: 112px de rolagem
    lateral na página de produto numa janela real de 1920; 389px e 560px em iframes de 1366 e de 1024, sem
    calibrar). Diga o meio em cada número ("janela de 1920", "`<iframe>` de 1366"), compare a linha de base e
    a prévia só no mesmo meio e na mesma largura, e calibre uma vez por loja contra uma janela de verdade
    (`medir-no-navegador.md`, 6), com o resultado no perfil.
- **Zoom por origem.** O Chrome guarda zoom por site: na mesma janela, `innerWidth` deu 1536 numa medida e
  1707 na seguinte. Imprima `innerWidth` **dentro da mesma chamada** da medição e só compare números
  colhidos na mesma largura.
  - **O zoom é também o que a pessoa vê.** O Chrome guarda o zoom por site e por perfil: a aba que a extensão
    abre no Chrome dela herda o zoom que ela usa naquele site (medido em 2026-10-21: zoom de 90% numa tela de
    1920px deu uma janela de ~2.133px CSS e `devicePixelRatio` 0,9). O layout segue a largura em px CSS: com
    esse zoom, uma regra do SCSS da loja "a partir de 1.750px" valia e o menu ficava numa linha só, o que
    nenhum print de 1440px mostrava.
  - Faça os prints nas larguras comuns pelo `<iframe>` da mesma origem (acima) e mais um na configuração real
    dela: na aba da extensão, como ela está; no painel do aplicativo (outro navegador, sem o zoom dela),
    pergunte a ela ou peça um print, e diga quando o seu print é aproximado. Meça com `comoAPessoaVe`
    (`medir-no-navegador.md`, 13).
  - Medido: o defeito do acento numa fonte de título (`catalogo-tema-base.md`, 14) só apareceu no print na
    configuração dela; os renders de 1440px a 100% não mostravam.
- **Screenshot escalado.** Volta em 1568px contra viewport de 1707 (fator 1,089), com o zoom por origem em
  cima. Um clique por coordenada caiu ~24px ao lado e abriu outra tela, de outra loja. Use a imagem só para
  olhar; aja pelo DOM.
- **Painel ou aba que não está na frente roda como aba de fundo**: imagens `loading="lazy"` não carregam,
  `requestAnimationFrame` não roda e animações CSS ficam paradas (`currentTime` 0 depois de segundos). Não é
  defeito seu. Traga a aba para a frente, conduza o relógio (`el.getAnimations()[0].currentTime = N`) e
  role com `scrollIntoView` (no painel do aplicativo, `scrollTo` falhou). O que um JS agenda por
  `requestAnimationFrame` (o ajuste dos cards que chegam depois, `ajustes-visuais.md`, 2.6) espera a aba voltar
  para a frente: antes de concluir que um card ficou sem o ajuste, traga a aba para a frente e meça de novo.
- **Print atrasado no painel do aplicativo em segundo plano.** O print pode mostrar o estado de antes, e as
  transições ficam paradas (medido em 2026-10-20: um menu lateral abriu, e o print não mostrou). Trazer o
  painel para a frente pela ferramenta não mudou `document.visibilityState`, que continuou `hidden`. Quase
  se concluiu "o menu não abre" por um print velho. Contorno:
  - espere 2–3 s antes do print;
  - antes de concluir algo pelo print, confirme o estado pelo DOM (a classe de aberto, o
    `getBoundingClientRect()` do elemento);
  - quando o print for a prova, ponha um marcador visível com um número que muda a cada tentativa e confira
    que o print mostra o número certo. Tire o marcador antes dos prints que vão para a pessoa:

    ```js
    // troque o número a cada tentativa; para tirar: document.getElementById('__marca').remove()
    (() => {
      let m = document.getElementById('__marca');
      if (!m) {
        m = document.createElement('div'); m.id = '__marca';
        m.style.cssText = 'position:fixed;right:8px;top:8px;z-index:2147483647;background:#ff0;color:#000;font:700 20px/1 monospace;padding:4px 8px;pointer-events:none';
        document.body.appendChild(m);
      }
      m.textContent = '7';
      return m.textContent;
    })()
    ```
- **Print em ladrilhos no painel do aplicativo** (medido em 2026-10-22, no preset de celular): um print
  estourou o tempo, e o seguinte veio com a página repetida em 4 ladrilhos. Aplicar o preset de celular de
  novo e esperar 3 s resolveu. Confira o estado pelo DOM (`isMobile`, `innerWidth`) antes de confiar no
  print, e não mande para a pessoa um print em ladrilhos.
- **Celular no navegador que você controla.** Se a ferramenta emula celular trocando o User-Agent (o
  painel do aplicativo, no preset de celular, emula Android), use e **recarregue depois de trocar**: o
  servidor decide o HTML de celular pelo User-Agent. Confira com
  `document.body.classList.contains('isMobile')` (medido numa loja em 2026-10-22: o preset de celular do
  painel, depois de recarregar, deu `isMobile`). Com a extensão do Claude para Chrome, que não troca o
  User-Agent, os caminhos (preset do painel, modo celular do Chrome pedido à pessoa, `curl` + `<iframe
  srcdoc>`) e o que dizer quando nenhum funciona estão em `previa.md`, "Conferir você mesmo antes de mandar".
- **Avisos de primeira visita no print.** O painel do aplicativo é outro navegador, sem os cookies da pessoa:
  ali o site mostra os avisos de primeira visita, e no celular os de cookies e do app cobriram a parte de
  baixo da tela (medido numa loja, 2026-10-22). Duas saídas, e a legenda diz qual:
  - mostrar: é o que uma primeira visita vê;
  - esconder só na sua aba, com um estilo temporário (recarregar desfaz), e pôr "avisos de cookies e do app
    escondidos só no print" na legenda. Os ids são da plataforma nas duas famílias medidas (`#lgpd-message`
    dentro de `#lgpd-overlay`, e `#app-message`: `catalogo-tema-base.md` e `catalogo-modelo-1.md`); confira
    na loja antes:

    ```js
    // só na sua aba; recarregar desfaz. Devolve quantos avisos achou (0: confira os ids nesta loja)
    (() => {
      const sel = '#lgpd-overlay, #lgpd-message, #app-message';
      let s = document.getElementById('__sem_avisos');
      if (!s) { s = document.createElement('style'); s.id = '__sem_avisos'; document.head.appendChild(s); }
      s.textContent = sel + '{visibility:hidden !important}';
      return document.querySelectorAll(sel).length;
    })()
    ```

  Nunca clique em aceitar nem em recusar um aviso no navegador da pessoa: a escolha é dela e fica no
  navegador dela. No painel, também não aceite sem perguntar. Tire o `__sem_avisos` (ou recarregue) antes
  de medir algo que os avisos tocam.
- **Painel dividido e estreito: o celular sai encolhido.** Com o painel do aplicativo dividido, a emulação de
  375px saiu encolhida (medido em 2026-10: ~0,39 do tamanho) e o print ficou ilegível. Peça à pessoa para
  alargar o painel (ou desfazer a divisão) antes do print. Se não der:
  - confira o site no ar por números: `isMobile` no `<body>`, rolagem lateral
    (`document.documentElement.scrollWidth - document.documentElement.clientWidth`; o `innerWidth`
    inclui a barra de rolagem e esconde uma rolagem pequena), contraste (`medir-no-navegador.md`, 8);
  - faça os prints num render local do HTML de celular baixado por `curl`, num `<iframe srcdoc>` de 375px
    com `<base href="https://www.SUA-LOJA.com.br/">` no começo do `<head>` (`ajustes-visuais.md`, 4.2), ou
    numa cópia servida em `127.0.0.1` (seção 4, "Render local de uma cópia");
  - diga à pessoa quais prints são render local: as vitrines, que chegam por XHR, não aparecem ou vêm na
    versão de computador.

## 3. Abas compartilhadas e o estado da página

- **A aba que a pessoa abriu pode não ser visível para você.** Medido em 2026-10-20: a sessão do Claude
  tinha o próprio grupo de abas na extensão, e a aba do admin que a pessoa abriu no Chrome dela não apareceu
  ali. "O admin está aberto no meu Chrome" não basta. Abra uma aba nova no seu grupo e navegue até o admin:
  o cookie de sessão do navegador vale, e ela entra logada.
  - **A aba que você abre no Chrome da pessoa usa a sessão dela.** No admin, o usuário e o perfil de acesso
    são os dela: o que falta para ela falta para você, e quem libera é o administrador da conta ou o suporte
    (`SKILL.md`, regra zero). No site, a sacola, o login e o aceite de cookies também são os dela: pôr um
    produto na sacola para testar muda o carrinho dela (`previa.md`, "Estados que mudam a sessão da pessoa").
    Não apague cookie nem armazenamento do site nessa aba (o que você mesmo guardou, como o pacote de funções
    abaixo, é seu).
  - Se a aba nova abrir na tela de login, a sessão do admin expirou (medido de um dia para o outro). Peça à
    pessoa para entrar; você não digita senha. Entrar com outro usuário é decisão dela; você não pede o login
    de outra pessoa.
  - No dia seguinte o grupo inteiro pode ter sumido. Antes de retomar: abra uma aba nova, confira que ela
    entrou logada, restaure o pacote de funções (`localStorage`, abaixo), rode `definirLoja(...)` de novo e
    recomece pela conferência com o backup.
- **A extensão do Claude para Chrome põe nós próprios no fim do `<body>`** (medido numa loja em 2026-10-22:
  15 elementos). Não são do site: a `foto()` de `medir-no-navegador.md`, 9 compara por elemento, então eles só
  aparecem em `novos` se chegam entre as duas fotos, e nunca em `mudaram`. Os nós desta skill (ids e
  `aria-label` que começam por `__`, como `__marca` e `__entrada_*`, e o `<iframe id="teste">`) ficam fora da
  foto. O estilo `__sem_avisos` (seção 2) muda o estilo de outros elementos: tire antes das duas fotos, ou
  deixe nas duas. Antes de contar "um elemento a mais" como efeito da sua mudança, veja de quem ele é.
- **Fechar aba do grupo pode desfazer o grupo.** Com 3 abas no grupo da extensão, duas foram fechadas (a
  ferramenta confirmou que restava uma) e a terceira saiu do grupo junto; a chamada seguinte respondeu que
  não sabia em qual página agir, e a listagem de abas disse que não havia grupo. Perderam-se as funções
  injetadas, o filtro e a linha marcada, e foi preciso refazer desde o menu. Não feche aba para "limpar";
  feche só as que você criou, e só no fim.
- **Outros agentes podem usar o mesmo grupo de abas.** Fechar uma aba do grupo já derrubou a aba de outro
  agente no meio de um trabalho. Isso foi medido antes; na medição de 2026-10-20 cada sessão tinha o seu
  grupo. O comportamento muda com a versão da ferramenta: não suponha nenhum dos dois, liste as abas que a
  ferramenta enxerga.
- **Guarde o pacote de funções em `localStorage`**, por origem: sobrevive a reload e a aba nova
  (`sessionStorage` morre com a aba). Guarde o texto inteiro de `scripts/injetar.js`, e restaure com
  `(0, eval)(localStorage.getItem('__pano_bundle')); typeof definirLoja`, que tem de devolver `"function"`.
  É o eval indireto, que roda no escopo global da página. Com `new Function(...)()` as funções ficam presas
  dentro dela e `definirLoja` não existe, sem erro nenhum (testado em Node com o `injetar.js` inteiro:
  `typeof definirLoja` deu `"undefined"` com `new Function` e `"function"` com `(0, eval)`). Se em vez do
  arquivo inteiro você serializar funções soltas com `fn.toString()`, troque o alias local por `window.`
  antes de guardar: o `toString()` perde o closure, e um `const W = window` no topo do pacote vira
  `W is not defined` (é por isso que `scripts/injetar.js` não usa constantes de topo). O `definirLoja(...)`
  não vai no pacote de propósito: rode-o de novo a cada reload.
  - **O pacote é seu, mas é uma gravação fora da pasta da pessoa**: fica no navegador dela, no `localStorage`
    do admin. O mesmo vale para o que você guardar no `localStorage` do site (o código de uma prévia, um
    ajudante de medição). Se ela restringiu onde você pode gravar (uma pasta só), diga isso antes e, no fim,
    apague o que guardou: `localStorage.removeItem('__pano_bundle')` no admin, e cada chave sua no site (anote
    as chaves enquanto trabalha). Confira com `localStorage.getItem(...) === null`. Só as suas: o resto do
    armazenamento é dela.
- **Na primeira vez numa aba do admin (e sempre que o `injetar.js` mudar), leve o arquivo pelo upload**, o
  mesmo transporte da seção 4, e confira o sha256 dentro da página antes de rodar qualquer linha dele:

  1. No terminal, na pasta da skill, o sha256 dos bytes do arquivo:
     `python -I -c "import hashlib; print(hashlib.sha256(open('scripts/injetar.js','rb').read()).hexdigest())"`
  2. Na aba do admin, uma entrada de arquivo temporária:

     ```js
     (() => {
       const i = document.createElement('input');
       i.type = 'file'; i.id = '__entrada_pacote'; i.setAttribute('aria-label', '__entrada_pacote');
       i.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;background:#fff;color:#000';
       document.body.appendChild(i);
       return 'ok';
     })()
     ```

  3. Ache `__entrada_pacote` pela ferramenta e faça o upload do caminho local de `scripts/injetar.js`.
  4. Em outra chamada, leia, confira, guarde e carregue (devolve booleano e tipo, não o hash):

     ```js
     const i = document.getElementById('__entrada_pacote');
     const b = await i.files[0].arrayBuffer();
     const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', b))]
       .map(x => x.toString(16).padStart(2, '0')).join('');
     const ok = h === 'COLE-O-SHA256-DO-TERMINAL';
     if (ok) { const t = new TextDecoder('utf-8').decode(b); localStorage.setItem('__pano_bundle', t); (0, eval)(t); i.remove(); }
     ({ confere: ok, bytes: b.byteLength, funcoes: typeof definirLoja })
     ```

  Sem `confere: true`, pare: o arquivo escolhido não é o da skill, ou veio truncado. Este caminho foi medido
  numa aba do admin em 2026-10-22, com o `injetar.js` de ~143 KB: upload e sha conferidos. O `injetar.js`
  desta versão tem uns 193 KB (2026-10-22, com as funções de criar Arquivo e de `Publicar`), e um arquivo
  maior que o medido ainda não foi levado assim: o sha conferido na página é o que prova que chegou inteiro.
  Sem upload na sua ferramenta, mande o arquivo em gzip+base64 numa chamada, como no 3a de
  `gravacao-construtor.md` (com ~193 KB, dá uns 80 mil caracteres; uma chamada desse tamanho não foi medida;
  o maior medido numa chamada tinha ~16,6 mil, seção 4), e só rode `(0, eval)` no texto decodificado depois
  do sha conferir.
- **Depois de cada reload**, restaure e confira que o pacote guardado é o desta versão da skill (um pacote
  velho, de outra sessão, tem travas velhas):

  ```js
  const t = localStorage.getItem('__pano_bundle'); (0, eval)(t);
  ({ funcoes: typeof definirLoja, confere: (await sha256(t)) === 'COLE-O-SHA256-DO-TERMINAL' })
  ```

  Com `confere: false`, refaça a primeira carga. Depois, `definirLoja(...)` com os dados do perfil.

## 4. Arquivos locais e o que vem de fora

- **`fetch` ou `<script src>` para `127.0.0.1` é bloqueado** no admin e no site (filtro de rede da
  extensão). Servir um arquivo num servidor local não funciona.
- **Para levar um arquivo local para a página** (um CSS, um JS de prévia, um HTML de celular), crie um
  `<input type="file">` na página (`criarEntradaArquivo()` de `scripts/injetar.js`), ache-o pela
  ferramenta (na extensão do Chrome, a busca por "__entrada_arquivo" ou a leitura da página) e use a ação
  de upload de arquivo da ferramenta (na extensão do Chrome, `file_upload`) com o caminho local. Leia com
  `FileReader` e confira o sha256 dentro da página antes de usar (`lerEntradaArquivo(sha)`). Medido com
  arquivos de até ~143 KB (o `injetar.js`, 2026-10-22; o `lerEntradaArquivo` com um tema de ~119 KB, no mesmo
  dia).
- **O painel do aplicativo não tem ação de upload de arquivo** (medido em 2026-10). Leve o código em
  gzip+base64 numa chamada, decodifique com `DecompressionStream` e confira o sha256 na página antes de rodar
  (a receita do 3a de `gravacao-construtor.md`). Medido: ~10 mil e ~16,6 mil caracteres de base64 numa
  chamada, com o sha conferido na página, para levar uma prévia ao site. Para a prévia, o
  `gerar_previa.py --transporte` grava o `.gz.b64` e imprime o sha256 do código legível. No site não há o
  `sha256()` do `injetar.js`; este trecho é inteiro:

  ```js
  // uma chamada: decodifica, confere e guarda; NÃO roda ainda
  const b64 = 'COLE-AQUI-O-CONTEUDO-DO-.gz.b64';
  const bin = atob(b64), bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))]
    .map(x => x.toString(16).padStart(2, '0')).join('');
  window.__previaCodigo = new TextDecoder('utf-8').decode(buf);
  ({ bytes: buf.byteLength, confere: h === 'COLE-O-SHA256-QUE-O-GERADOR-IMPRIMIU' })
  ```

  Só com `confere: true`, na chamada seguinte: `(0, eval)(window.__previaCodigo)` na própria página, ou
  `document.getElementById('teste').contentWindow.eval(window.__previaCodigo)` no `<iframe>` da largura
  certa (seção 2). Com `confere: false`, o base64 chegou cortado: gere de novo e mande inteiro, não remende.
  Devolva só `{bytes, confere}`: o filtro de saída bloqueia o que parece base64 (seção 1).
- **O clipboard é da máquina, não da sessão.** Numa colagem vieram 17 caracteres de outra coisa, porque a
  pessoa copiou algo enquanto a gravação corria. Só a conferência do sha256 dentro da página pega isso.
- **Cópias salvas num Chrome sem rede** (o caminho preferido, com Node 22 e o Chrome instalados):
  `scripts/salvar_copia.mjs` salva a página como ela ficou depois dos scripts, com as folhas na ordem da
  cascata e as fotos, e `shot.mjs --copia` / `rodada.mjs --offline` abrem a cópia num Chrome próprio, sem rede,
  em segundos (`previa.md`, "Iterar offline, confirmar no ar"). Medido em 2026-11-03 num site de teste local:
  a ordem das folhas, o `id` dos `<style>`, as fotos e o HTML que chegou por XHR saíram iguais na cópia. Os
  scripts da página não rodam na cópia.
- **Render local de uma cópia**, para comparar direções e medir larguras sem tocar no site no ar, no admin nem
  nas abas da pessoa, quando os scripts acima não rodam. Medido em 2026-10-21: cópias salvas das páginas,
  servidas em `127.0.0.1` e abertas no painel de navegador do aplicativo, também por agentes auxiliares; com a
  extensão do Chrome, não medido. O caminho:
  1. salve as cópias (`curl`, ou as da pasta do reconhecimento) numa pasta só delas, separada da pasta do
     perfil com os backups;
  2. em cada cópia, ponha `<base href="https://www.SUA-LOJA.com.br/">` no começo do `<head>`, para imagens, CSS
     e JS virem do site;
  3. tire da cópia os scripts de medição (GTM, gtag, pixels), para um render local não contar visita nem
     disparar evento nas contas da loja;
  4. ponha na cópia o que a prévia põe: o CSS montado no mesmo lugar da cascata em que o arquivo vai ficar, e o
     JS que liga a classe (ou rode o `.js` legível do favorito na aba);
  5. sirva só essa pasta, só em `127.0.0.1`:
     `python -I -m http.server 8765 --bind 127.0.0.1 --directory <pasta-das-copias>`. Sem o `--bind 127.0.0.1`
     (ou com `0.0.0.0`), o servidor abre a pasta para a rede; e nunca sirva a pasta do perfil;
  6. abra `http://127.0.0.1:8765/<copia>.html` no navegador que você controla e tire os prints;
  7. no fim, pare o servidor.
  - Limites: o que chega por XHR (as vitrines) pode não vir, ou vir na versão de computador; a cópia é de uma
    data. Como `fetch` e `<script src>` do site no ar para `127.0.0.1` são bloqueados (o primeiro item desta
    seção), o render local serve só para cópias: ele não leva um arquivo local para a página no ar.
  - Ao mandar para a pessoa, o print leva "render local de uma cópia de AAAA-MM-DD" na legenda e no nome do
    arquivo (seção 5).
  - Para medir o deslocamento na carga de uma mudança ainda não publicada (`medirCLS`,
    `medir-no-navegador.md`, 15), a cópia precisa dos arquivos novos na mesma posição do `<head>` em que vão
    ficar: em `<style>` e `<script>` no lugar da linha, ou num endereço absoluto do próprio `127.0.0.1` (com
    o `<base>` do passo 2, um endereço relativo vai ao site no ar, onde o arquivo novo ainda não existe). O
    favorito de prévia não serve, porque entra depois da primeira pintura.
  - Agentes auxiliares (os que geram ou revisam direções): só cópias e renders locais, nunca o admin nem as
    abas da pessoa (`criterios-de-design.md`, 4).

## 5. Mandar prints e arquivos para a pessoa

Use o meio que a sua ferramenta oferecer para mandar arquivos na conversa (no Claude Code para computador,
a ferramenta de enviar arquivo ao usuário). Se não houver, salve os prints numa pasta do perfil
(`~/panorama-lojas/<slug>/trabalho/`) e diga à pessoa o caminho. Para o favorito de prévia, mande o
conteúdo do `.txt` (ou o caminho dele) e as instruções de `previa.md`. O nome de cada print diz o que ele é: a
largura (ou "como você vê"), "opção" para o que não está na versão para aprovar, e "render local" com a data da
cópia para o que não veio do site no ar (`previa.md`, "Mandar para a pessoa").

**A ferramenta do agente guarda cópias dela.** Os prints que a ferramenta de navegador tira ficam também numa
pasta de resultados da própria ferramenta, fora das pastas do perfil (medido no Claude Code para computador,
2026-10-22: dentro de `~/.claude/projects/`). Isso não é da skill e você não controla. Copie para
`trabalho/` (ou para a pasta que a pessoa indicou) cada print que mandar, e diga à pessoa onde a ferramenta
guarda o resto, sobretudo quando ela restringiu onde você pode gravar.

## 6. Formulários do admin pela ferramenta

Medido em 2026-10-22, numa loja, na fileira de filtros da tela Páginas e nos diálogos de criar um Arquivo.
Valem como hipótese noutra ferramenta ou noutra versão.

- **A ação de formulário da ferramenta mexeu em mais de um campo.** Trocar um `<select>` da fileira de
  filtros pela ação de formulário (na extensão do Chrome, `form_input`) trocou também outros selects da
  mesma fileira: o operador do filtro URL e o "Registros por Página". Depois de cada troca, releia
  `filtrosDaTela()` (`scripts/injetar.js`) e o seletor de registros por página, e só siga com tudo como você
  deixou. Uma grade com menos linhas por página esconde a linha que você procura.
- **Seletor com menu (botão + lista) por cima de um `<select>` escondido.** Na primeira carga, a ação de
  formulário no `<select>` escondido funcionou; depois de um reload, só funcionou abrir o botão do seletor e
  clicar na opção pela referência do elemento. Confira o valor escolhido pelo DOM depois de cada tentativa,
  e nunca pela imagem.
- **A busca de elementos devolveu o vizinho.** A ação de achar elementos (na extensão do Chrome, `find`) às
  vezes devolveu o rótulo ou o botão do seletor, e não o `<select>`. Dê ao elemento certo um `aria-label`
  próprio por script, `rotularParaFerramenta(el, 'nome')` de `scripts/injetar.js`, e ache-o por `__nome`.
  Serviu para Loja, Nome, URL, `Confirmar` e OK. O rótulo só ajuda a achar: não autoriza clique nenhum, e
  cada clique continua sendo o que a pessoa pediu, com as travas do roteiro.

## 7. Codex: a extensão do ChatGPT para Chrome

Medido em 2026-11-04, numa loja, no Codex do aplicativo do ChatGPT para Windows, com a extensão do ChatGPT
para Chrome conectada (Configurações › Computer Use), em três testes sem gravar nada no admin: a
configuração inicial, uma rodada com as chamadas de `primeiro-uso.md`, 1b, no site público (desfeitas no
fim), e uma rodada no admin, só de leitura. É uma medição só, numa versão da ferramenta; confira na sua com
as mesmas chamadas.

- **A ferramenta.** Duas: `mcp__cua_repl.js`, um console JavaScript com uma API própria (`cua`), e
  `mcp__cua_repl.js_reset`, que reinicia esse console. Pela API: `cua.getState()` lista os navegadores
  conectados (o Chrome da extensão e um navegador interno do aplicativo, que não tem a sessão dela);
  `cua.createBrowserTab` abre uma aba no Chrome dela; na aba, `getByRole(...).click()` clica,
  `getScreenshot()` tira o print, e `getAXState` e `domSnapshot` leem a página. Para rodar JavaScript na
  página, há **dois caminhos, e só um serve a esta skill**:

  | Caminho | O que é | O que se mediu |
  |---|---|---|
  | `tab.playwright.evaluate(expr)` (e `locator.evaluate`, `evaluateAll`) | a documentação diz "Evaluate JavaScript in a read-only page scope": uma cópia só de leitura do HTML, não a página | devolve leituras simples (contas, textos, contagens, estilos). Falham: `setAttribute` ("is not a function"), guardar em `window` ("object is not extensible"), `(0, eval)`, `crypto`, `btoa`, `localStorage`; o jQuery dá `'undefined'`; `offsetParent` não existe (por isso os snippets B e C não acharam a grade nem os filtros, que estavam na tela, sem iframe); e só aceita expressão (um `;` no fim dá `SyntaxError`) |
  | o CDP da aba: `const cdp = await tab.capabilities.get('cdp')` e `cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })` | o acesso de desenvolvedor do Chrome (Chrome DevTools Protocol), na página de verdade. A documentação diz: "for development use. Prefer higher-level Browser Use APIs", e "Raw CDP access is scoped to the tab's current web origin" | **as cinco chamadas do 1b passaram**: no site público, guardar em `window` entre chamadas, mudar a página, `crypto.subtle` com `await`, `btoa` e `localStorage`; no admin, o layout (a grade com `offsetParent`, sem iframe), o jQuery do admin (`'function'`) e o `(0, eval)`. Os snippets B e C leram a grade e os filtros. O `injetar.js` (~200 KB) foi levado em gzip+base64 numa chamada só, de ~82 mil caracteres, e o sha256 conferiu na página; carregado com `(0, eval)` e guardado no `localStorage`, ele rodou as funções do admin (fase 2, abaixo). Saídas de 5.000 caracteres e de base64 voltaram inteiras, sem corte nem bloqueio. O resultado vem dentro de `{ result: { value } }` |

- **Use o CDP para os trechos da skill**, e o `evaluate` só para uma leitura simples. Diga à pessoa, antes,
  que vai usar o acesso de desenvolvedor da extensão. A documentação do CDP pede que toda mudança deixada na
  página seja contada à pessoa no fim: é o que a skill já faz com o pacote de funções no `localStorage`
  (seção 3), que você apaga no fim.
- **O CDP pode ficar indisponível.** Três vezes ele respondeu `Raw CDP is unavailable while Browser Use is
  resolving a paused document response`, antes de rodar qualquer coisa: uma no admin, logo depois de abrir a
  tela Páginas, e duas numa aba nova no site público, com 5 s entre elas, num momento em que o ChatGPT
  estava instável (reconexões, troca de modelo no meio da conversa). Repetido mais tarde, numa aba nova, ele
  funcionou no site e no admin. A causa não foi medida. Comece cada aba por uma chamada pequena (`1 + 1`)
  para saber se ele está disponível; se não estiver, espere uns segundos e tente mais uma vez; se repetir,
  conte à pessoa e siga pelo modo guiado, sem procurar outro caminho para rodar o código na página.
- **Confira o `exceptionDetails` de cada chamada, e pare no primeiro.** O CDP não falha quando uma função
  da skill aborta: ele devolve `{ exceptionDetails, result }`, e o `ABORTADO: ...` fica lá dentro. Num lote
  de chamadas, a seguinte roda mesmo assim, se você não conferir (medido, fase 2: depois do aborto de uma
  trava, a conferência seguinte rodou no mesmo lote). Uma chamada por passo, e, no seu console:

  ```js
  const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception || {}).description || r.exceptionDetails.text);
  r.result.value
  ```

  Um `ABORTADO: ...` de uma função da skill é uma trava: pare e mostre à pessoa. Um erro de sintaxe na
  expressão que você mesmo escreveu não é trava: corrija e mande de novo, uma vez.
- **No CDP, tire o `await` do começo dos trechos da skill.** Os arquivos escrevem `await
  verificarArquivoGravou(...)`, como no console do Chrome. O `Runtime.evaluate` recusa esse `await` solto
  (medido, fase 2c: `SyntaxError: await is only valid in async functions and the top level bodies of
  modules`, e a função não rodou). Mande a chamada sem ele, `verificarArquivoGravou('<sha>', ['<trecho>'])`,
  ou embrulhada, `(async () => { return await verificarArquivoGravou('<sha>', ['<trecho>']); })()`: com
  `awaitPromise: true`, o CDP espera a promessa e devolve o resultado (medido nas rodadas 0b e 0c, com o
  trecho embrulhado).

- **Recarregue e navegue pela ferramenta, nunca por `location.reload()` dentro do CDP.** Na fase 2b, um
  `location.reload()` mandado pelo `Runtime.evaluate` deixou a aba presa: o `Page.getFrameTree` expirou em
  10 s, e o CDP respondeu `Raw CDP is unavailable while Browser Use is resolving a paused document response`
  por mais de 5 s; ele só voltou a responder uns 2,5 minutos depois. Na fase 2, o `tab.reload()` da API da
  ferramenta, no mesmo admin, deixou o CDP responder em 7 s. É uma medição de cada; a documentação do CDP
  pede para preferir a API da ferramenta. Depois de recarregar, teste com `1 + 1` a cada uns 20 s, por até
  3 minutos, antes de desistir.
- **Gravação por script no Codex: medida de ponta a ponta, num Arquivo despublicado.** Numa loja,
  2026-11-04: a fase 2b gravou e a fase 2c provou, numa aba nova, depois de um `tab.reload()` pela API
  (o CDP respondeu de primeira): `verificarArquivoGravou` deu `confere: true` e o trecho marcador presente
  (185 caracteres relidos, com CRLF: o admin guarda assim, e o sha normalizado conferiu). Ainda não
  medidos no Codex: o clique real num elemento rotulado (`Publicar`, criação por script), o `Limpar cache`
  (`limparCache`, `clicarOkDoModal`), a gravação do `<head>` e da configuração da loja, e uma gravação numa
  página que está no ar. Na primeira vez numa loja, diga isso à pessoa e comece por uma página que não
  aparece no site, combinada com ela.
- **A fase 2b, em detalhe.** No Arquivo despublicado da fase 2: com o "sim" pedido de diálogo fechado, o
  `Alterar` reaberto, o `lerArquivoGzipB64`, o `conferirArquivoAtual`, o `injetarArquivo` e o `confirmarArquivo`
  rodaram, e o admin mostrou "Registro alterado com sucesso.". O Passo E (reabrir e conferir pelo sha) parou
  no reload acima. O aviso de sucesso não prova o conteúdo gravado: sem o Passo E pelo CDP, a prova é a do
  modo guiado (a pessoa abre o `Alterar`, copia o Conteúdo e cola para você, que compara pelo sha
  normalizado: `SKILL.md`, "Modo guiado"), ou o Passo E numa aba nova, mais tarde (foi o que a fase 2c
  fez).
- **A fase 2, antes:** o caminho até a gravação rodou. Numa loja, 2026-11-04, num Arquivo despublicado que a
  pessoa criou: o pacote carregado pelo CDP, `definirLoja`, os filtros (`filtrosDaTela`,
  `rotularParaFerramenta`), `conferirUrlLivre`, `conferirCriacao`,
  `conferirAlvo`, `abrirDialogo('Alterar')`, `abaDialogo`, `conferirDialogo`, `lerTipoDoArquivo`,
  `lerCampoLoja`, o backup, o `lerArquivoGzipB64` (184 bytes, sha conferido) e o `conferirArquivoAtual`
  funcionaram. Enquanto o Codex esperava o "sim" da pessoa, o diálogo do `Alterar` sumiu da tela; depois do
  "sim", o `conferirDialogo` abortou ("nenhum .ui-dialog no DOM"), e nada foi gravado: a trava fez o papel
  dela. Por isso o `SKILL.md` ("O caminho comum de toda gravação", item 1) manda pedir o "sim" com o diálogo
  fechado (e a fase 2b passou).
- **A sua aba fica no Chrome da pessoa.** Ela vê o diálogo que você abriu e pode fechá-lo achando que é
  dela. Diga qual aba é a sua (o título, o grupo de abas do Codex) e peça que ela não mexa nela enquanto
  você trabalha. Ao pedir que ela feche outros diálogos `Alterar` da mesma página, diga "nas suas abas, não
  na minha".
- **Fechar a aba do agente pode derrubar a conexão.** No fim da fase 2, o `tab.close()` da aba do admin
  respondeu `native pipe closed before response`, e depois o Chrome não aparecia mais em `cua.getState()`;
  nas fases 2b e 2c, o mesmo `tab.close()` funcionou, e o Chrome da pessoa continuou aberto. Salve o
  relatório e tudo o que precisa guardar **antes** de fechar a aba, feche só a que você abriu, e depois
  pergunte à pessoa se o Chrome dela continua aberto.
- **Ainda não medido:** o envio de arquivo (a API anuncia `waitForEvent('filechooser')` e `setFiles`). Não
  faz falta: o transporte em gzip+base64 numa chamada de CDP funcionou (seção 4), e um Arquivo vai assim
  pelo `lerArquivoGzipB64` (`gravacao-arquivo-e-head.md`, Passo B).
- **O que funcionou também:** a aba abriu no Chrome dela, e o admin entrou logado (num dos testes, a aba nova
  caiu na tela de login, e a pessoa entrou nela). O clique num link por papel e nome navegou. O print voltou.
- **Num filtro feito de menu (o bootstrap-select do filtro Loja), o mesmo nome aparece duas vezes:** no item
  do menu (`a[role=option]`) e no `<option>` escondido. Um localizador por texto da API do Codex recusou
  por ambiguidade (modo estrito), sem clicar. Escolha o item do menu por um seletor dele e confira o
  filtro com `filtrosDaTela()` depois (seção 6).
- **O Codex não abre arquivo local nem servidor local na aba.** O `cua.createBrowserTab` recusou `file://`
  (só aceita HTTP e HTTPS), e um servidor local iniciado por `Start-Process` foi bloqueado pela política
  (2026-11-04). A galeria HTML de comparação dos prints, quem abre é a pessoa: no Chrome dela, Ctrl+O e o
  arquivo. Não procure outro caminho para abrir.
- **A extensão precisa estar ligada a cada conversa.** Numa conversa nova, depois de reabrir o aplicativo, o
  Chrome não apareceu em `cua.getState()` até a pessoa abrir o Chrome e conferir a extensão. Se não aparecer,
  peça isso a ela; não siga por outro navegador.
- **Licença por site.** Nesses testes, a conexão com o Chrome não pediu confirmação visível. A documentação da
  extensão diz que ela pede licença por site; se pedir, a escolha é da pessoa: "permitir para este site", e
  não para todos.
