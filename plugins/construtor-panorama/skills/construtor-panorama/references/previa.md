# Prévia antes de gravar: a pessoa vê, aprova, e só então vai para o admin

**A regra:** nenhuma mudança visual vai para o admin antes de a pessoa ver essa mudança funcionando no site
dela e dizer que aprova. O caminho é sempre o mesmo:

1. escrever a mudança em arquivo local;
2. montar a prévia e conferir você mesmo;
3. mandar os prints e o favorito para a pessoa;
4. esperar o "aprovado";
5. gravar exatamente o que foi aprovado;
6. conferir no ar contra a prévia.

**Por que vale o trabalho:**

- Gravar no admin é produção: vale para todo visitante, passa por até quatro camadas de cache (`mapa-do-admin.md`) e desfazer custa outro ciclo de cache.
- A prévia não custa nada, não sai da aba de quem olha e some ao recarregar.
- Ela também pega o erro mais comum, que é a pessoa ter imaginado outra coisa. Isso só aparece quando ela vê.

## Fluxo em dois tempos: rascunho rápido, opinião, revisão profunda

**Quando.** Pedido visual grande: muda fundo ou cor de várias regiões, mais de um tipo de página, ou a
linguagem visual do site (uma proposta de estilo, `criterios-de-design.md`, 4; um tema de época novo; "fundo
escuro no produto e nas listas"). Um ajuste pontual (a cor de um botão) segue direto pelo caminho de sempre.

**Por quê.** Medido numa loja (2026-11-03): um pedido de fundo escuro no produto, nas listas e nas vitrines levou
~4h40 até a primeira prévia, ~89% dele em agentes (três direções completas, dois juízes, duas rodadas de revisão
adversarial, a segunda sem nada obrigatório) e em rodadas de 21 prints no site real, com pausas por causa do
CDN. A primeira opinião da pessoa foi sobre a parte mais polida. Um rascunho de 45 minutos teria trazido essa
opinião ~3 horas antes. O que a pessoa vai mudar, você só sabe depois que ela vê.

**Tempo 1: o rascunho rápido.** Meta: a pessoa com os prints e o favorito em ~45 minutos.

1. **Uma direção, a que você recomenda.** Se o pedido tem duas ou três leituras boas, as outras vão só como
   esboço: dois prints cada (computador a 1920 e celular), sem a régua completa e sem revisão
   (`criterios-de-design.md`, 4).
2. **De 6 a 8 prints-chave**, nos lugares onde a mudança mais aparece, mais uma página que não deve mudar. O
   modelo é `assets/prints-chave.txt`: copie para a pasta `trabalho/` do perfil e troque os caminhos pelos do
   perfil ("Páginas de conferência").
3. **Itere offline** ("Iterar offline, confirmar no ar", abaixo): `salvar_copia.mjs` uma vez com a lista, e
   `rodada.mjs --offline` a cada versão do CSS, em segundos e sem visitar o site.
4. **O mínimo do rascunho**, antes de mandar:
   - o CSS entrou na posição da cascata que o arquivo vai ter (a linha `css depoisDe ...` de cada print);
   - nenhuma mensagem de console nova;
   - `rodada.mjs --medir`: nenhum texto abaixo do mínimo nas regiões que mudaram (ou o que sobrou, listado na
     mensagem);
   - a página de controle igual à de hoje, e o celular com o HTML de celular (`--celular`, `isMobile`).
5. **Confirme no ar uma vez**: a mesma lista, sem `--offline` (8 cargas, uns 3 minutos com as pausas). Os prints
   que vão para a pessoa saem daqui.
6. **O favorito** (`gerar_previa.py`, do mesmo CSS) e a mensagem do rascunho.

| Etapa do rascunho | Meta |
|---|---|
| perfil, `quemPinta` das regiões principais e o CSS da direção | 15–20 min |
| `salvar_copia.mjs` (uma carga por página e aparelho; 5 na lista modelo) | ~2 min |
| iterar offline (`rodada.mjs --offline`, segundos por rodada) | ~15 min |
| confirmar no ar (`rodada.mjs`, a mesma lista) | ~3 min |
| favorito e mensagem | ~5 min |

**A mensagem do rascunho pede opinião, não "aprovado".** São as partes de "Mandar para a pessoa" (abaixo), com
duas trocas: a parte 2 diz que é um rascunho, para ela dizer se o caminho é esse; e a mensagem fecha com uma
pergunta aberta sobre o que ela mudaria, e a lista do que você ainda não conferiu (os estados, as larguras do
meio, as telas que ninguém abre, a data de corte). Os prints do rascunho levam "rascunho" no nome e na
legenda.

**Tempo 2: a opinião da pessoa.** Um ajuste pedido volta ao tempo 1, offline e em segundos. "Gostei" e
"pode ser essa" escolhem a direção; não são o "aprovado" de gravar ("Aprovação, gravação e conferência",
abaixo).

**Tempo 3: a revisão profunda, só da versão que a pessoa gostou.** Aqui entra tudo o que o rascunho deixou de
fora, e só aqui:

- os estados: hover e foco com Tab de verdade (`rev.mjs`, e `pares.py` para medir o indicador de foco pelos
  pixels), menus, gavetas e avisos (num tema que muda cor, os de `temas-sazonais.md`, 12, passo 10);
- o celular de verdade e a matriz inteira de larguras (`larguras.mjs`; `ajustes-visuais.md`, 4.1);
- a data de corte: o site na data em que a campanha acaba e no dia seguinte (`--relogio`);
- a cor colada no admin: descrições com cor e fundo escritos no HTML (`__R.inline` do `rev.js`; o campo
  `corColada` do `medir_cores.js`);
- os testes de "nada mudou" e o escopo (`ajustes-visuais.md`, 4.1; `escopo.js`);
- depois, "Conferir você mesmo antes de mandar" e a mensagem com o "aprovado" (abaixo).

**Revisão adversarial** (um agente que procura defeito de propósito): no máximo uma rodada, e no tempo 3. Uma
segunda rodada só quando a primeira achou algo obrigatório, e só sobre o que mudou para corrigir. Obrigatório
é o que bloqueia o "aprovado": texto abaixo do mínimo de contraste ou sumido, seletor vazando para outra página
ou região, conteúdo ligado sem a pessoa escolher, rolagem lateral a mais, ou uma regra desta skill quebrada. O
resto vai para a pessoa como opção.

## Ritmo das visitas ao site

Um CDN que limita pedidos (o Cloudflare, numa loja medida) bloqueia quem carrega páginas demais, e já devolveu o
erro 1015 ("You are being rate limited") a uma rodada de prints. O bloqueio pega o computador inteiro (os
agentes, a sua aba e a da pessoa) por minutos. Toda visita ao site no ar, por script ou pela ferramenta de
navegador, segue estas regras:

- **Um Chrome por vez, e um só agente visita o site por vez.** Os outros agentes trabalham nas cópias
  (abaixo). No briefing de um agente, diga se ele visita o site ou só as cópias.
- **De 5 a 6 segundos entre uma carga e a próxima.**
- **O mesmo perfil do Chrome em todas as visitas**, para o cache dele: CSS, JS, fontes e fotos não são baixados
  de novo a cada print.
- **Num 1015, espere 6 minutos e tente uma vez.** Se vier de novo, pare as visitas e conte à pessoa.
- **Um desafio de "verifique se você é humano"**: pare e conte à pessoa. Não se contorna.

Os scripts de visita (`shot.mjs`, `rodada.mjs`, `salvar_copia.mjs`, `larguras.mjs`, `rev.mjs`) já fazem isso
sozinhos, pelo `scripts/cdp.mjs`: uma trava na pasta `panorama-visitas` da pasta temporária do sistema
(respeitada por todos os scripts e por todos os agentes que os usam; `node scripts/cdp.mjs` mostra quem está
com ela), 6 s de pausa (`PAUSA_VISITAS`, de 5 a 60), o perfil compartilhado `panorama-visitas/perfil` e a espera
de 6 minutos num 1015 (código de saída 15 no segundo; 16 num desafio). Uma carga do site é uma carga, venha do
script ou da ferramenta de navegador: com a ferramenta, siga as mesmas regras à mão. Na cópia, nada disso conta:
ela não visita o site.

## Iterar offline, confirmar no ar

Mudar o CSS e ver o resultado é o laço que mais se repete numa prévia, e no site no ar cada volta custa
cargas e pausas (uma rodada de 21 prints levava de 6 a 10 minutos). Numa cópia salva, aberta num Chrome sem
rede, a mesma rodada leva segundos.

1. **Salve as cópias uma vez**, com a lista dos prints:
   `node scripts/salvar_copia.mjs --lista prints.txt --site https://www.SUA-LOJA.com.br --saida copias`.
   É uma carga por página e aparelho. A cópia (MHTML) guarda o DOM de depois que os scripts da página rodaram
   (vitrines e carrosséis montados), as folhas na mesma ordem da cascata, e as fotos e fontes já carregadas.
2. **Itere nas cópias**: `node scripts/rodada.mjs --lista prints.txt --offline copias --saida r1 --css
   proposta.css --depois-de "seu-tema.css" --medir`. Um print avulso: `shot.mjs --copia`. As larguras:
   `larguras.mjs --lista prints.txt --offline copias`. A revisão de estados: `rev.mjs plano.mjs --copia ...`.
3. **Confirme no ar** só no fim, com a mesma lista e o mesmo CSS, sem `--offline`: os prints para a pessoa.
4. **Simule a gravação no ar** antes do "aprovado", quando a mudança é um arquivo inteiro: `--replace
   "seu-tema.css=>seu-tema-v2-publicar.css"` faz o Chrome do script receber o arquivo novo no lugar do que
   está no ar, como se já estivesse gravado (só naquele Chrome). É a prova de que a versão de publicar dá o que
   a prévia mostrou.

**O que a cópia não tem**, e por isso vai para a confirmação no ar: os scripts da página não rodam nela (menu
aberto por clique, contagem andando, um JS de tema seu; um `setTimeout` da página não dispara, então o que você
roda na cópia é síncrono), o que chega depois da carga, e o que muda com a data. Ela é de um dia e de um
aparelho: a cópia de computador não serve para o celular. As fontes da cópia podem não ser as do site: numa
loja (2026-11-04), o print da cópia saiu com outra fonte, e a quebra de linha dos nomes mudou; tamanho de
texto, quebra de linha e altura de card se confirmam no ar. O hover de CSS funciona; o Tab anda pelos links, mas
um `<button>` ficou fora dele na cópia (medido num site de teste local, 2026-11-03): a revisão do foco de
teclado (`rev.mjs` com `tab`) vale no ar. Print de cópia que for para a pessoa leva "cópia de AAAA-MM-DD" no
nome e na legenda (`ferramentas-de-navegador.md`, seção 5).

**Sem Node 22 ou sem Chrome no computador** (no chat do Claude, por exemplo), os scripts não rodam: o
rascunho segue pela ferramenta de navegador, com a mesma lista de prints e o mesmo ritmo de visitas.

## Qual prévia para qual mudança

| A mudança é… | A prévia é… | Como |
|---|---|---|
| CSS **novo** acrescentado a um arquivo do site (página tipo Arquivo) | favorito que injeta o CSS logo depois do arquivo | `gerar_previa.py --css novo.css --depois-de "nome-do-arquivo.css"` (com a versão nova montada por `montar_tema.py --base`, ele imprime este comando, para a pessoa, e o do arquivo inteiro com `--substitui`, para você conferir: "Favorito grande", abaixo) |
| Versão nova **inteira** de um arquivo CSS que já está no site (regras mudadas ou apagadas) | favorito que desliga o arquivo velho e põe o novo no lugar | `gerar_previa.py --css arquivo-v2.css --substitui "nome-do-arquivo.css"` (o `arquivo-v2.css` montado por `scripts/montar_tema.py`, `ajustes-visuais.md` 5.2; com `--publicar`, a versão de publicar que ele grava, que é a que vai para o admin) |
| CSS de um Arquivo **que ainda não existe** (primeira vez, `ajustes-visuais.md` 5.6; tema novo) | favorito na posição em que o `<link>` novo vai entrar | decida antes logo abaixo de qual linha do `<head>` o `<link>` novo entra e use `--depois-de "<o arquivo dessa linha>"`; essa mesma linha é o `de` do `trocarNoHead`. Sem nenhum arquivo da loja no `<head>`, a posição depende da família do tema (abaixo, "Arquivo novo") |
| CSS da página no construtor (Estilo CSS/SCSS) | favorito no `<style>` da página | regras novas: `--css novo.css --depois-de "#builder-custom-css"`; regras mudadas ou apagadas: `--css estilo-inteiro-novo.css --substitui "#builder-custom-css"` (confira o id na loja; ver abaixo) |
| Conserto no SCSS de Personalização (quem grava é a pessoa, à mão) | favorito logo depois do `<style>` do SCSS servido. Ele não tem id e nem sempre é o último do `<head>`: numa família medida vem depois dos arquivos da loja, noutra vem antes do CSS da página e deles (`medir-no-navegador.md`, 1) | `--css conserto.css --depois-de "style:<trecho único do SCSS servido>"`, em CSS puro (como escolher o trecho: abaixo) |
| Tema por classe no `<body>` (agenda de skins, classe da página) | favorito que liga a classe e o CSS do tema | `--css tema.css --depois-de "<arquivo logo acima da linha nova>.css" --js liga-classe.js` (exemplo abaixo; se o arquivo do tema já está no `<head>`, ele mesmo é o alvo: `--depois-de` ou `--substitui "tema.css"`). Tema com JS: `--js liga-classe.js --js tema.js --desligar <a função de desligar do tema>` |
| HTML de configuração: Barra do Topo, barra da agenda (`.promotionBar`, que só existe com o item no ar e só numa família em que ela funciona: perfil e `temas-sazonais.md`, 5), logo SVG, aviso | favorito com JS que monta o HTML no mesmo lugar onde a plataforma o renderiza | `--js barra.js` com `window.__previaDesligar` |
| JS de um arquivo do site (um `.js` da loja ligado no `<head>`) | favorito que desfaz o que a versão velha fez e roda a nova | `--js novo.js` (cuidados abaixo); `--desligar` se ele exporta a própria função de desligar |
| Blocos e layout no construtor | a **página de rascunho**, no fluxo do construtor (`construtor.md`, passo 8) | sem favorito: a prévia é a própria página de rascunho |
| Trecho novo numa página do construtor que já está no ar (edição pontual: perguntas a mais no FAQ, um texto trocado) | favorito com JS que insere o trecho no lugar onde ele vai ficar, na página no ar | `--js trecho.js` com `window.__previaDesligar` (`construtor.md`, seção 7) |
| Arte nova num banner (cadastro Banners, `imagens-e-banners.md`) | a página com as artes novas num **clone** dela: tipo de banner novo com as artes, e o bloco do clone apontado para ele (`imagens-e-banners.md`, seções 3 e 4). Trocar a arte no tipo que a página já usa vai ao ar no `Confirmar`, em toda página com aquele tipo: aí não há prévia na página | o clone, o tipo e as artes são gravações em produção. O clone é página nova: quem cria é a pessoa, ou você com um pedido dela que nomeie `Criar nova página` (no `Log`) e a página; logo depois, confira Publicada, Robots e Sitemap dele (`armadilhas.md` 36). O tipo e as artes, com o "sim" dela sobre a lista escrita do que vai ser criado (`imagens-e-banners.md`, seção 0). Sem clone (o caminho direto: `imagens-e-banners.md`, seção 3, "Trocar só a arte"): mostre os arquivos novos ao lado das artes no ar, no tamanho em que o bloco vai servir (`imagens-e-banners.md`, 7), diga que não é a página e deixe ela decidir se segue com esse limite |
| Imagem de um bloco imagem | favorito com JS que troca o `src` daquele `<img>` na página no ar | suba antes o arquivo em Único › Mídia › Mídias, com o "sim" dela sobre o arquivo e o Tipo (grava no acervo, mas não muda o site; `imagens-e-banners.md`, seções 0 e 3b), e use a URL lida na grade, com o mesmo sufixo de tamanho do `src` atual (`imagens-e-banners.md`, 7): `--js troca-imagem.js` com `window.__previaDesligar` (`construtor.md`, seção 7) |
| Código no `<head>` que não é visual (pixel, tag, GTM) | não há o que ver | mostre a linha que entra e a que sai, e o que cada uma faz |

Se nenhum método mostra a mudança (lógica do servidor, checkout, e-mail), diga isso à pessoa. Proponha o mais próximo possível (um mock no DOM, a página de rascunho) e deixe ela decidir se segue com esse limite. Endereços que são outro sistema (o front-end novo, React/Next; numa loja medida, o carrinho e a assistência, rotas Next.js dentro de um site twig: perfil, "Endereços fora do tema") não recebem o CSS do tema, os Arquivos da loja nem a classe do `<body>`: uma prévia de tema não tem o que mostrar ali.

## O gerador: `scripts/gerar_previa.py`

```bash
python -I scripts/gerar_previa.py --css mudanca.css --depois-de "meu-tema.css" \
    --classe-body skin-do-tema --nome "Prévia selo vermelho" --saida previa-selo.txt
```

**O que ele grava:**

- `previa-selo.txt`: uma linha `javascript:…`, que é o favorito. O `--saida` tem de terminar em `.txt`.
- `previa-selo.js`: o mesmo código legível, para você rodar na sua aba. Ele vai para o nome do `--saida`
  com `.js`; por isso o `--saida` nunca pode ter o nome de um `--css` ou `--js`. Com
  `--js barra.js --saida barra.txt`, o `barra.js`, que é o arquivo que vai para o admin, seria trocado pelo
  favorito; o gerador recusa. Use `previa-<assunto>.txt`.
- com `--transporte`, `previa-selo.gz.b64`: o código legível em gzip e base64, numa linha, para levar a
  prévia a um navegador cuja ferramenta não tem upload de arquivo (`ferramentas-de-navegador.md`, seção 4).

**O que ele imprime:** a linha `ok` com os tamanhos e, logo abaixo, o **sha256 de cada `--css` e `--js`**
(dos bytes do arquivo). É esse sha que vai para o histórico quando a pessoa aprovar. Com `--transporte`, o
tamanho do `.gz.b64` e o sha256 do código legível, que a página confere depois de decodificar. Se o favorito
passar de 55 mil caracteres, um **AVISO** que diz de onde vêm os caracteres: o CSS, cada `--js` (com quantas
vezes ele cresceu no favorito) e o código fixo do favorito.

**Caractere fora do ASCII num `--css` ou `--js`:** um AVISO (não ERRO) com o arquivo, a linha, a coluna e o
escape a usar (em seletor e em `content`, o de 6 dígitos, `\0000e7`; em string de JS, `\u00e7`; em
comentário, escreva sem acento). No favorito o caractere funciona, mas o arquivo que vai para o admin vai em
ASCII (`ajustes-visuais.md`, 2.2) e passa antes pelo `montar_tema.py`, que recusa. Troque **antes** de pedir o
"aprovado": trocar depois muda o sha, e a prévia e a aprovação têm de ser refeitas. A ferramenta de escrever
arquivo do agente pode trocar um `\u00e7` digitado pelo próprio "ç" (medido duas vezes numa loja, 2026-10-22):
gere a barra por código (`chr(92)`) e confira com o gerador. `--permitir-nao-ascii` cala o aviso, para um
arquivo que vai mesmo com UTF-8.

**Favorito grande.** Medidas, para não prometer o que não foi visto: um favorito de ~55 mil caracteres
funcionou no gerenciador de favoritos (numa loja); noutra, foram gerados favoritos de ~46, ~99 e ~139 mil, e a
instalação dos dois maiores não foi medida. No de ~139 mil, ~102 mil vinham do CSS (já sem comentários) e ~34
mil do JS; sem comentários e sem recuo, o JS caía para ~15 mil. Por isso o aviso fica nos 55 mil medidos.

- **O JS cresce no favorito.** Cada espaço e cada quebra de linha viram 3 caracteres (`%20`, `%0A`): no caso
  medido, o JS ocupava ~1,7x o tamanho do arquivo.
- **`--compactar-js`** (opcional) tira os comentários, o recuo, os espaços do fim das linhas e as linhas em
  branco de cada `--js`, só dentro do favorito:
  - o arquivo de entrada não muda, e o sha impresso continua o dele: é o arquivo que vai para o admin e para o
    histórico. A linha `JS compactado só no favorito: A -> B caracteres` diz quanto saiu;
  - só compacta onde tem certeza de como o JS se lê (o que está dentro de string, template e regex fica igual).
    Onde não tem, aquele `--js` vai como está, com um `AVISO: não compactei ARQ: motivo, linha`. Os motivos:
    uma barra depois de `)` ou `}` (ou de `of`, `yield`, `await`) com aspas, crase ou comentário no resto da
    linha, porque ali ela pode ser divisão ou regex; `<!--` ou `-->` fora de string; `#!` no começo; CR,
    U+2028 ou U+2029; string, template, regex ou comentário sem fechar;
  - confere a versão compactada: cortada em pedaços de novo, ela tem de dar os mesmos pedaços do original (fora
    comentários e espaços), com as mesmas quebras de linha entre eles (o JS põe ponto e vírgula sozinho numa
    quebra), e passar no `node --check`. Sem Node, não compacta (AVISO);
  - o `.js` legível e o `.gz.b64` levam o código do favorito, já compactado;
  - testado em 2026-10-21: no JS de um tema e em ~5.800 arquivos JS de pacotes npm, a árvore de sintaxe do
    compactado saiu igual à do original em todos os que ele compactou (e recusou os de `#!` e as barras
    ambíguas). `python -I scripts/gerar_previa.py --autoteste` roda os casos difíceis.
- **O CSS já entra sem comentários** e com as linhas juntas. Se ele sozinho passa dos 55 mil, compactar não
  resolve: tire o que não é desta prévia (seções de outra mudança) ou use os prints como prévia ("Mandar para a
  pessoa", abaixo).
- **Tema grande com seções novas no fim** (`montar_tema.py --base`, `ajustes-visuais.md` 5.2): o favorito do
  arquivo inteiro (`--substitui`) leva o tema todo, e o de acréscimo (`--depois-de` o arquivo no ar) leva só as
  seções novas. O `montar_tema.py --base` imprime os dois comandos:
  1. **para a pessoa, o de acréscimo** (as seções novas; o gerador tira os comentários, e o `montar_tema.py` já
     confere que a versão que vai ao ar tem as mesmas regras delas);
  2. **para você, o do arquivo inteiro**, que é o arquivo que vai para o admin, no lugar do que está no ar.

  Na sua aba, ligue um de cada vez (com o mesmo `--id`, clicar num desliga o outro), tire a foto de cada um
  (`medir-no-navegador.md`, 9) e exija `mudaram` 0 entre as duas, nas páginas e larguras da conferência. Isso
  mostra que o acréscimo dá o mesmo resultado que o arquivo que vai para o admin; que a base é a cópia do que
  está no ar quem prova é o `--sha-base` do `montar_tema.py` (`ajustes-visuais.md`, 5.2). Medido numa loja
  (2026-10-22): tema de ~119 KB, favorito do arquivo inteiro com 82.812 caracteres, o de acréscimo com ~10
  mil, e 0 diferenças entre os dois.

**Antes de gravar, ele confere, e se algo falhar sai com ERRO sem gravar nada** (uma saída anterior fica
como estava):

- que nenhuma das saídas é um arquivo de entrada (no Windows, sem diferença de maiúsculas), nem um
  `.js`, `.txt` ou `.gz.b64` que ele mesmo não gerou;
- arquivos sem BOM (o BOM estragaria a primeira regra, na prévia e no arquivo publicado);
- chaves `{ }` balanceadas;
- que o favorito (e o `.gz.b64`) decodifica de volta para o mesmo código;
- `node --check`, se houver Node.

**O favorito:**

- **liga e desliga**: clicar de novo remove tudo e religa o que tinha sido desligado;
- mostra um selo "Prévia ligada" no canto (`--sem-aviso` tira o selo, para prints finais);
- com `--classe-body`, recusa ligar numa página que não tem a classe que a mudança pressupõe. Pode
  repetir (`--classe-body sua-classe --classe-body isMobile`): todas têm de estar no `<body>` (repetido, medido
  numa loja em 2026-10-22). O teste roda **antes** do `--js`, então não passe a classe que o próprio `--js` põe
  (`temas-sazonais.md`, 3b).

**A posição na cascata decide se a prévia diz a verdade.** Um `<style>` num lugar diferente do que o arquivo
publicado vai ter mostra outra cascata: ganha, no empate, de regras que no ar ganhariam dele, ou perde para
elas. Aí a prévia aprova algo que no ar sai diferente. A ordem das folhas **muda de uma família de tema para
outra** (medido: numa loja da família `/dist`, o SCSS de Personalização vem depois dos arquivos da loja; numa
da família `modelo-1`, vem antes do CSS da página e deles). Nunca suponha: liste a ordem na página
(`medir-no-navegador.md`, 1) e confira a do perfil.

- **Acrescentar** a um arquivo: use `--depois-de` com o nome do arquivo. Se o favorito não achar o arquivo
  na página, ele avisa e não liga. Se mais de um arquivo da página tiver esse trecho no endereço, o favorito
  também avisa e não liga: use um trecho maior, que só ele tenha (por exemplo `arquivos/meu-tema.css`, sem a
  barra do começo).
- **Logo depois do SCSS de Personalização** (o conserto que a pessoa vai acrescentar no fim do SCSS): use
  `--depois-de "style:TRECHO"`. O favorito procura o `<style>` da página cujo texto contém o trecho (fora os
  `<style>` de dentro de um SVG e os de outras prévias) e insere a prévia logo depois dele. Nenhum, ou mais de
  um: avisa e não liga.
  - Copie o trecho do `<style>` **servido**, que é o CSS já compilado, e não da fonte que a pessoa vê no
    admin: o servidor compila o SCSS e muda espaços e quebras (medido nas duas famílias: o servido vem
    compactado). Prefira o fim de uma regra que a pessoa escreveu, sem aspas, como `.minha-regra{`.
  - Confira na aba que só um `<style>` tem o trecho, antes de gerar o favorito:
    `(() => { const t = 'TRECHO'; return [...document.querySelectorAll('style')].filter(s => !s.closest('svg') && !s.hasAttribute('data-previa') && s.textContent.includes(t)).length; })()`
    tem de dar `1` (conta como o favorito conta: sem os `<style>` de SVG e de prévias).
- **Arquivo novo** (ainda não está no `<head>`): não há `<link>` dele para achar. Use `--depois-de` com o
  arquivo cuja linha vai ficar **logo acima** da linha nova no `<head>`; essa mesma linha é o `de` do
  `trocarNoHead` na gravação.
  - Se nenhum arquivo da loja estiver no Código dentro do `<head>`, o lugar da linha nova depende da família
    do tema (perfil, "Família do tema"; confira com `medir-no-navegador.md`, 1, na página já carregada, que
    lista também o que os scripts puseram no `<head>` depois):
    - **família `/dist`** (medido numa loja, 2026-10): o Código do `<head>` sai depois do CSS da página
      (`#builder-custom-css`) e antes do `<style>` do SCSS de Personalização, e nenhuma opção põe a prévia
      exatamente ali. Use `--depois-de` com o último `<link>` do tema (o `loja.<hash>.css`, por exemplo
      `--depois-de "dist/css/loja."`) e diga à pessoa o limite: nas páginas do construtor, a prévia fica
      antes do CSS da página, e no ar a linha nova fica depois (`ajustes-visuais.md`, 5.6). Não use
      `--fim-do-head` só para a prévia ligar: lá ela ganharia do SCSS de Personalização, e no ar não ganha.
    - **família `modelo-1`** (medido numa loja, 2026-10): os `<link>` do Código do `<head>` são as últimas
      folhas do `<head>`, depois do SCSS e do CSS da página. Se a lista mostra que nada de estilo vem depois
      do lugar da linha nova (nenhum `<style>` ou `<link>` posto por script no fim do `<head>`),
      `--fim-do-head` é a posição publicada. Se algo vem depois, a prévia ganharia dele e no ar não: diga o
      limite à pessoa.
    - **outra família**: liste a ordem, escolha a opção que põe a prévia onde a linha vai ficar e, se
      nenhuma põe, diga o limite à pessoa antes de pedir o "aprovado".
- **Trocar** o arquivo: use `--substitui` (aceita também `#id` e `style:TRECHO`). O favorito desliga o
  `<link>` velho pela folha de estilo dele (`link.sheet.disabled`), sem mexer no elemento, e desligar a prévia
  volta na hora. Até 2026-10-22 o favorito desligava o elemento `<link>`, e o navegador recarregava o arquivo:
  logo depois de desligar, a folha ainda não estava lá (medido numa loja: 287 diferenças na hora, 0 depois de
  2 s). Com um favorito gerado antes disso, espere 2 s antes da foto. A troca para a folha foi testada num DOM
  simulado: na primeira prévia real, confira que a foto logo depois de desligar dá `mudaram: 0` (a `foto()`
  recusa enquanto a folha religada não volta: `medir-no-navegador.md`, 9) e anote no perfil. Se o arquivo
  ainda não carregou na página, o favorito avisa e não liga.
- **Fim do `<head>`**: só com `--fim-do-head`, quando essa for mesmo a posição. Sem uma das três opções, o
  gerador recusa CSS.
- Anote a ordem no perfil da loja, com a data.

**Detalhes que já morderam:**

- No Git Bash do Windows, `--depois-de "/arquivo.css"` vira `C:/Program Files/Git/arquivo.css`. Passe só o nome, sem a barra: a busca é por trecho do `href`.
- SCSS que só o servidor entende (`$variavel`, `@mixin`, `@extend`) não funciona na prévia. Escreva a mudança em CSS puro, ou a prévia não vale. Aninhamento simples o Chrome atual entende, mas a prévia no seu Chrome pode funcionar e o visitante com navegador antigo não ver: escreva plano (`ajustes-visuais.md`, 2.2). O `scripts/montar_tema.py` recusa aninhamento e SCSS nas seções.
- O `id` do `<style>` com o CSS da página do construtor muda de plataforma para plataforma (`builder-custom-css` nas duas famílias medidas). Confira na loja (`document.querySelectorAll('style[id]')`) antes de usar `#builder-custom-css`.

### JS na prévia

O código de cada `--js` roda dentro de uma função e de um `try/catch`, uma vez por clique. Pode repetir o
`--js`: os arquivos rodam na ordem dada. Se um deles precisa desfazer algo ao desligar, defina dentro dele:

```js
window.__previaDesligar = function () { /* remove o que este código criou */ };
```

O favorito guarda essa função e a chama no segundo clique (com vários `--js`, cada um pode ter a sua; no
desligar, rodam do último para o primeiro). Se o código der erro no meio, o favorito avisa; o segundo
clique ainda roda a função que ele chegou a definir, e o resto só sai recarregando a página.

**O JS do tema já tem a própria função de desligar** (por exemplo `window.__temaDesligar`, que ele também
usa para limpar uma cópia anterior de si mesmo): passe `--desligar __temaDesligar`. O favorito lê
`window.__temaDesligar` antes de rodar o `--js`; se depois dele houver ali uma função **nova**, ele a guarda,
chama no segundo clique (depois do `__previaDesligar`) e devolve a `window.__temaDesligar` o que havia antes.
Uma função que já existia antes do `--js` (da versão publicada, de uma prévia velha) nunca é adotada. Assim a
prévia roda o **arquivo publicado sem mudar um byte**, sem embrulho escrito à mão: o que a pessoa aprova é o
arquivo que vai para o admin. Medido numa loja (2026-10-22), num ciclo até a gravação: o favorito adotou a
função de desligar do JS do tema.

**Mudança em duas peças** (`ajustes-visuais.md`, 2.6, item g): um favorito com o CSS (`--css` + `--depois-de`)
e o JS (`--js`), e `--desligar __suaMarcaDesfazer` (o nome que o JS exporta) para desligar pela função do
próprio JS; na sua aba, teste também cada peça sozinha (0 diferenças em cada uma).

**Carrossel que se mediu antes da prévia: `--resize`.** Carrosséis (o Owl, da plataforma, nas duas famílias
medidas) medem os itens quando montam. Um CSS que muda a largura ou a altura do contêiner chega depois e
encontra medidas velhas: o carrossel sai cortado **só na prévia** (medido numa loja com o carrossel da Barra
do Topo montado por um JS da loja). Com `--resize`, o favorito dispara `window.dispatchEvent(new Event('resize'))`
depois de ligar e depois de desligar, e o carrossel se remede. O resize remede outros componentes também
(medido: uma vitrine mudou 112px de altura), e isso aparece como diferença no teste "sem a classe, 0
diferenças" sem ter vindo do CSS. Diferença inesperada com `--resize`: faça a contraprova
(`medir-no-navegador.md`, 9; o trecho `cssDaPrevia(false)` desliga só o `<style>` da prévia e religa o que
ela desligou) antes de mexer no CSS. O caso parecido das alturas de card congeladas
(família `/dist`) está em `ajustes-visuais.md`, 3.3.

**Cuidados:**

- **A versão velha do JS já rodou** quando a página carregou. A prévia de um JS novo precisa primeiro remover o que a velha criou, com os mesmos seletores. Senão aparecem as duas coisas.
- Desfazer a velha nem sempre é possível. Nesse caso, diga "para voltar ao normal, recarregue a página".
- **Código que depende de data** (contagem, fases) lê a hora num lugar só, uma função que a prévia possa trocar: o `api.agora` da seção 6 de `temas-sazonais.md`. Para a prévia conseguir trocá-la, a função aceita uma hora de fora: `api.agora = window.__previaAgora || function () { return Date.now(); };`.
  - Para a pessoa ver uma data futura, gere **um favorito por data** (ex.: `previa-natal-01dez.txt`, `previa-natal-25dez.txt`) e diga qual data cada um mostra: ela não tem como mudar a hora pelo console.
  - O primeiro `--js` de cada um fixa a hora, `window.__previaAgora = function () { return new Date('AAAA-12-01T10:00:00-03:00').getTime(); };`, e o seguinte é o próprio arquivo que vai ao ar (`--js relogio-01dez.js --js tema.js`). O `__previaDesligar` do primeiro apaga o `window.__previaAgora`.
- O código precisa poder rodar com a página já carregada. `DOMContentLoaded` já passou.
- **O `--js` roda dentro de uma função.** `function x(){}` e `var x` no topo do arquivo ficam locais na prévia e globais no arquivo publicado. Se outro código chama essas funções (um `onclick` no HTML da Barra do Topo, outro script da loja), na prévia ele chama a versão velha ou dá erro. Na fonte, escreva `window.x = function () { … };` para o que precisa ser global.
- **Observador, quadros e timers.** O desligar (o `__previaDesligar` ou a função do tema, `--desligar`) desconecta o `MutationObserver`, cancela cada agendamento com a função dele (`cancelAnimationFrame` para `requestAnimationFrame`, `clearTimeout` para `setTimeout`) e devolve o DOM ao que era. Depois do segundo clique, confira:
  - 0 restos: `document.querySelectorAll('.sua-marca').length === 0`, e nenhuma classe ou atributo que o JS pôs no `<html>` e no `<body>`, também numa página onde a novidade não age;
  - a foto de antes de ligar contra a de depois de desligar: `diferencas(antes, depois).mudaram === 0` (`medir-no-navegador.md`, 9). Ela compara elemento por elemento, e não pela posição: um nó que o JS moveu e devolveu não vira milhares de diferenças (medido numa loja: a comparação por posição deu 2.653 falsas). O que sair em `novos` ou `sumiram` você explica (nós da extensão do navegador, `ferramentas-de-navegador.md`, 3) ou é resto;
  - com a classe do tema ainda fora do ar, também "sem a classe, 0 diferenças" (`ajustes-visuais.md`, 2.6).

**Exemplo: ligar um tema por classe** (o CSS do tema entra pelo `--css` no mesmo favorito):

```js
document.body.classList.add('skin-natal');
window.__previaDesligar = function () { document.body.classList.remove('skin-natal'); };
```

Com o JS do tema junto, montado e conferido pelo `scripts/montar_tema.py`:

```bash
python -I scripts/gerar_previa.py --css skin-natal-v1.css --depois-de "<arquivo logo acima da linha nova>" \
    --js liga-classe.js --js skin-natal.js --desligar __natalDesligar --nome "Prévia Natal" \
    --saida previa-natal.txt
```

## Conferir você mesmo antes de mandar

Esta é a conferência de antes do "aprovado". Num pedido visual grande, ela é o tempo 3 ("Fluxo em dois
tempos", acima) e roda só na versão que a pessoa gostou; o rascunho tem o mínimo de lá. As medidas abaixo
também saem pelos scripts, no Chrome deles (`rodada.mjs --medir`, `larguras.mjs`, `rev.mjs`), com o mesmo CSS.

Rode o `.js` na página, na sua aba, e verifique:

- **Desktop, na largura exata** (as da matriz de `ajustes-visuais.md`, 4.1). Se a aba que a ferramenta abre vem estreita (`ferramentas-de-navegador.md`, seção 2):
  - abra uma página leve do mesmo domínio (ex.: `/robots.txt`);
  - crie um `<iframe>` da largura certa (1920, 1366 e 1280; 1024 e ~1100 nos casos de `ajustes-visuais.md`, 4.1, que é a lista completa) apontando para a página. Os números de dentro do `<iframe>` (rolagem lateral, larguras) podem sair diferentes dos de uma janela de verdade: diga o meio em cada número (`ferramentas-de-navegador.md`, seção 2);
  - rode o código com `iframe.contentWindow.eval(codigo)`.
  - Código grande não cabe numa chamada. Se a ferramenta tem upload de arquivo, leve o `.js` por `<input type=file>` + upload, com o sha256 conferido na página (como no Passo B de `gravacao-arquivo-e-head.md`). Se não tem (o painel do aplicativo, medido em 2026-10), gere com `--transporte` e leve o `.gz.b64` numa chamada, decodificado e conferido pelo sha na página antes de rodar (`ferramentas-de-navegador.md`, seção 4; medido numa loja em 2026-10-22, num ciclo até a gravação). `fetch` de servidor local é bloqueado.
- **Celular de verdade.** A plataforma decide celular pelo User-Agent, no servidor (classe `isMobile` no `<body>`, nas duas famílias medidas). Estreitar a janela do computador **não** mostra o site de celular. Se a sua ferramenta emula celular trocando o User-Agent:
  1. ligue a emulação e **recarregue**;
  2. só então rode o código;
  3. com a aba em segundo plano, as imagens preguiçosas não carregam: role com `scrollIntoView` (`ferramentas-de-navegador.md`, seção 2).
- **Painel pequeno.** Com o painel do aplicativo dividido e estreito, a emulação de 375px sai encolhida (medido em 2026-10: ~0,39 do tamanho) e o print fica ilegível. Peça à pessoa para alargar o painel ou desfazer a divisão antes dos prints. Se não der, confira o site no ar por números (`isMobile`, rolagem lateral, contraste) e faça os prints num render local do HTML de celular (`curl` + `<iframe srcdoc>`, abaixo, ou uma cópia servida em `127.0.0.1`: `ferramentas-de-navegador.md`, seção 4, "Render local de uma cópia"), e diga à pessoa quais prints são render local (`ferramentas-de-navegador.md`, seção 2).
- **Com a extensão do Claude para Chrome**, a aba que você controla não troca o User-Agent. Caminhos, do melhor ao mais limitado:
  1. se o aplicativo também tem o navegador embutido (o painel), use o preset de celular dele, **recarregue** e confira `isMobile` (`ferramentas-de-navegador.md`, seção 2; medido numa loja em 2026-10-22: deu `isMobile`);
  2. peça à pessoa: "Na aba que eu estou usando, aperte F12, depois Ctrl+Shift+M, escolha um celular na lista de cima e aperte F5." Confira `document.body.classList.contains('isMobile')` antes de medir ou fotografar (não medido com a extensão);
  3. o HTML de celular pelo `curl`, num `<iframe srcdoc>` de 375px (`ajustes-visuais.md`, 4.2), serve para o que vem do servidor; rode o código da prévia lá dentro com `iframe.contentWindow.eval(codigo)` (não medido). As vitrines, que chegam depois por XHR com o User-Agent do computador, não servem. A mesma cópia servida em `127.0.0.1` e aberta no painel do aplicativo é outro caminho, com os mesmos limites (`ferramentas-de-navegador.md`, seção 4, "Render local de uma cópia").
- **Numa mudança só do celular**, nunca mande print de janela estreita como se fosse do celular. Se nenhum caminho acima mostrou a mudança no HTML de celular de verdade, diga antes de pedir o "aprovado": "Não consegui ver a versão de celular com a mudança. Confira no seu celular, ou no modo celular do Chrome, antes de aprovar." Nesse caso, a versão de celular fica toda sem a sua conferência (layout, rolagem lateral, vitrines), e a pessoa precisa saber disso. Print de render local conta como print de celular só com o aviso: "estes prints são do HTML de celular renderizado aqui; as vitrines não aparecem (ou vêm na versão de computador)".
- **O que olhar:**
  - nenhum erro no console;
  - sem rolagem lateral **a mais do que havia antes**: meça primeiro sem a prévia, em cada largura (`document.documentElement.scrollWidth - document.documentElement.clientWidth`, ou o campo `rolagem` do trecho de `medir-no-navegador.md`, 6), e compare com a prévia ligada. A rolagem que já existia não é sua (medido numa loja: um painel do tema já causava ~30px entre 1280 e 1707px); ela vai para a pessoa como problema do site (`medir-no-navegador.md`, 6);
  - contraste de todo texto cuja cor ou cujo fundo mudou, inclusive o de um elemento movido para outro fundo (a regra: `criterios-de-design.md`, 2; como medir: `medir-no-navegador.md`, 8);
  - os estados que a mudança toca (hover, foco, menu aberto; num tema que muda cor, todos os da lista de `temas-sazonais.md`, 12, passo 10);
  - **uma página que não deveria mudar**, para pegar seletor que vazou: `diferencas(...).mudaram === 0`, e cada `novos`/`sumiram` explicado (`ajustes-visuais.md`, 4.1, os três testes somados). Escolha uma que receba o tema: um endereço que é outro sistema (perfil, "Endereços fora do tema") não muda nunca e não prova nada. O conjunto completo está na 4.1: o mesmo tipo de página sem a novidade (um produto sem a etiqueta, por exemplo) **e** outro tipo de página (uma lista ou a home);
  - desligar a prévia volta a página ao estado de antes: foto de antes contra a de depois de desligar, `mudaram` 0, e 0 restos (`medir-no-navegador.md`, 9);
  - diferença que você não esperava: antes de mexer no CSS, a contraprova (`medir-no-navegador.md`, 9) separa o que veio do CSS do que veio do JS ou do `--resize`.
- **Prints antes e depois:** mesma página, mesma largura, mesma rolagem. Um par para o computador e um para o celular. Antes de concluir algo por um print do painel do aplicativo em segundo plano, confira o estado pelo DOM: o print pode vir atrasado ou repetido em ladrilhos (`ferramentas-de-navegador.md`, seção 2).
  - **Avisos de primeira visita.** Num navegador sem os cookies da pessoa (o painel do aplicativo), os avisos de cookies e do app cobrem a parte de baixo da tela do celular (medido numa loja, 2026-10-22). Escolha um dos dois e diga qual na legenda: mostrar (é o que uma primeira visita vê), ou esconder **só na sua aba** com um estilo temporário (recarregar desfaz; o trecho está em `ferramentas-de-navegador.md`, seção 2), com "avisos de cookies e do app escondidos só no print" na legenda. Nunca clique em aceitar no navegador da pessoa (o aceite é dela), e no painel também não aceite sem perguntar.
- **Como a pessoa vê.** Além da matriz de larguras, tire um print na configuração de quem aprova: a largura da janela em px CSS, o zoom do Chrome no site e o `devicePixelRatio` dela (px reais = px CSS × `devicePixelRatio`).
  - Meça uma vez por loja e por pessoa com `comoAPessoaVe` (`medir-no-navegador.md`, 13) e anote no perfil; meça de novo se ela disser que trocou de tela ou de zoom.
  - Na aba da extensão, que herda o zoom dela, o print sai como ela vê. No painel do aplicativo (outro navegador, sem o zoom dela), pergunte ou peça um print dela, e diga quando o seu print é aproximado (`ferramentas-de-navegador.md`, seção 2, "Zoom por origem").
  - Medido numa loja (2026-10-21): com zoom de 90%, a janela dela tinha ~2.133px CSS, uma regra do SCSS da loja "a partir de 1.750px" valia, e um defeito de acento numa fonte de título só apareceu no print nessa configuração.
- **Estados que mudam a sessão da pessoa.** Abrir a sacola com um produto, ver a conta logada, ver o aviso de cookies de primeira visita: para chegar a esses estados é preciso mudar o estado de alguém no site. Por ordem de preferência:
  1. um render local (`ferramentas-de-navegador.md`, seção 4) ou uma simulação na sua aba (o HTML do estado montado no lugar, com o tema ligado); diga à pessoa que é simulação;
  2. uma sessão que não é a dela: o painel do aplicativo é outro navegador, sem os cookies dela. Mesmo assim, pôr um produto na sacola ali pode contar como "adicionou ao carrinho" nas medições da loja (não medido): peça antes, e diga isso ao pedir;
  3. pedir que ela mesma abra o estado e mande o print;
  4. no navegador dela, só com o OK dela para essa ação: ponha um produto na sacola, confira, tire o que pôs e confira que a sacola voltou ao que era.
  - Nunca vá além da sacola: sem checkout, sem pagamento, sem login, sem dado de conta ou de entrega (nem CEP). Pôr na sacola não é compra, mas muda o carrinho dela.
  - Não apague cookie nem armazenamento do site para ver a primeira visita: na aba da extensão, eles são os dela (`ferramentas-de-navegador.md`, seção 3).
  - Um estado que ficou sem conferir é dito à pessoa antes do "aprovado" ("Mandar para a pessoa", abaixo: o que a prévia não mostra).

## Sem ferramenta de navegador (modo guiado)

Sem navegador conectado, você não roda o `.js` nem tira prints: a conferência da seção anterior fica com a pessoa, e ela precisa saber disso. Mande o favorito e diga: "Não consegui ver esta prévia. Confira, por favor: (1) a página X no computador; (2) a mesma página no modo celular do Chrome (F12, Ctrl+Shift+M, escolha um aparelho e aperte F5); (3) uma página que não deveria mudar, por exemplo [a página]. E me mande prints de antes e depois." Troque o colchete por uma página que recebe o tema e que a mudança não toca (o carrinho, se na loja ele não for outro sistema: perfil, "Endereços fora do tema"). Se aparecer o alerta "não achei … A prévia não foi ligada", não contorne: a posição está errada. Sem o "aprovado" dela sobre essa prévia, não passe a lista de cliques para gravar.

## Mandar para a pessoa

Mande os prints e o favorito pelo meio que a sua ferramenta oferecer para mandar arquivos (`ferramentas-de-navegador.md`, seção 5).

**Os prints dizem o que são**, no nome do arquivo ou na legenda:

- a largura ("1440px", "celular") e, quando for o caso, que é a configuração dela ("como você vê: zoom 90%");
- os prints da versão para aprovar saem com o que ela já escolheu, e o conteúdo novo que ela não escolheu sai
  desligado (selo, texto, contagem maior). Uma opção que não está nessa versão (o selo ligado, outra cor) vai em
  print à parte, com "opção" no nome do arquivo e na legenda;
- render local leva "render local" e a data da cópia no nome e na legenda
  (`ferramentas-de-navegador.md`, seção 4).

**Nos textos para a pessoa, não diga "versão de publicar"** (o nome que `montar_tema.py --publicar` dá ao
arquivo sem comentários, `ajustes-visuais.md`, 5.2): diga "a versão sem comentários que vai para o site". Com
"publicar" na pergunta, ela pode responder "pode publicar", e `Publicar` é um botão da tela Páginas que nenhuma
aprovação inclui ("Aprovação, gravação e conferência", abaixo).

**Várias direções ou variantes na mesa** (uma proposta de estilo, `criterios-de-design.md`, 4, ou duas versões
de um tema): mande um conjunto de prints por opção, nas mesmas páginas, larguras e rolagem, com o nome da
opção no arquivo e na legenda, e uma linha que diz o que cada uma muda. Mande as opções, não só a que você
recomenda. Feche com uma pergunta fechada que nomeia uma só: "Posso preparar a versão X para gravar?". "Tanto
faz" não é escolha ("Não conta", abaixo).

- **Para escolher, um par por opção basta:** o computador a 1920 (ou na configuração de quem aprova) e o celular
  de verdade. A matriz inteira em cada opção custa caro e quase tudo vai para o lixo. A opção que você
  recomenda vai com os prints-chave do rascunho; as outras, com o par ("Fluxo em dois tempos", acima).
- **A opção escolhida ganha a matriz inteira antes do "aprovado"** (`ajustes-visuais.md`, 4.1): as larguras,
  o foco de teclado, o contraste, o `quemPinta` e o `elementFromPoint` da caixa nova. "Gostei da A" é escolha,
  não aprovação: prepare a versão da A, confira (o tempo 3), mande os prints dela e só então pergunte.
- **A mensagem diz o que ainda não foi conferido** em cada opção (por exemplo "a opção B só foi vista a 1920 e
  no celular"), na parte do que a prévia não mostra (abaixo).

A mensagem tem cinco partes:

1. **"Nada foi gravado no site."** A prévia só existe na aba de quem clicar.
2. **O que muda e onde olhar:** quais páginas, celular ou computador, e o que comparar.
3. **O que eu decidi sem você ter pedido.** Um pedido vago tem mais de uma leitura, e cada escolha sua
   entra na prévia. Liste as escolhas, cada uma visível num print, para o "aprovado" cobrir cada uma ou ela
   corrigir. Exemplo, para "escuro nas bordas": "deixei o menu suspenso escuro também; a faixa da newsletter
   ficou na cor da marca. Se preferir de outro jeito, me diga." Sem essa parte, ela aprova o conjunto sem
   saber que havia escolha (`criterios-de-design.md`, 1). Entra aqui também o que mudou em relação a uma
   versão que ela já viu e aprovou, ou disse que gostou (ex.: "a home ficou preta pura; o resto continua no
   cinza que você aprovou"): nomeie a mudança e mostre as duas no print.
4. **Como ligar o favorito no computador (Chrome):**
   1. abra o gerenciador de favoritos (Ctrl+Shift+O);
   2. no menu ⋮, escolha "Adicionar novo favorito";
   3. dê um nome curto e sem espaço (ex.: `previaselo`);
   4. abra o arquivo `.txt` que eu mandei (no Bloco de Notas), aperte Ctrl+A e Ctrl+C, e cole no campo URL com Ctrl+V;
   5. abra a página da loja e clique no favorito; clique de novo para desligar.
   - Colar na barra de endereço não funciona: o Chrome apaga o `javascript:` do começo.
   - Se o gerador avisou que o favorito passou de 55 mil caracteres: peça à pessoa para confirmar que o selo
     "Prévia ligada" apareceu no canto da tela, e mande os prints de qualquer jeito. Se o favorito não
     instalar, os prints são a prévia, e você tira dele o que não é desta prévia (seções de outra mudança;
     com `--compactar-js`, os comentários e o recuo do JS) antes de mandar de novo.
   - Não peça para ela colar o código no console do navegador: o Chrome avisa contra isso, e é o hábito que
     golpes exploram.
5. **No celular** (obrigatório quando a mudança é só do celular e ela não usa o modo celular do Chrome):
   - Chrome Android, com os favoritos sincronizados: abra a página da loja, digite o nome do favorito na barra de endereço e toque na sugestão com a estrela. Por isso o nome curto.
   - Safari iOS: favorito de qualquer página, depois editar o endereço e colar o código. Para usar, abra pelo menu de favoritos com a página da loja aberta.
   - Se não der, os prints de celular bastam, mas só os feitos com o HTML de celular de verdade (`isMobile`), ou os de render local com o aviso da seção anterior.

**Mudança só do celular** (a plataforma decide o celular no servidor e põe `isMobile` no `<body>`): gere o favorito com `--classe-body isMobile --nome "Prévia do celular"`, para que no computador ele avise em vez de ligar sem mostrar nada. Diga: "Esta mudança é só para o celular. No computador comum, o favorito vai avisar que a página não é de celular, e isso é o esperado. Para ver no computador: F12, depois Ctrl+Shift+M, escolha um celular, aperte F5 e clique no favorito. Ou abra no seu celular (passo 5)."

Feche assim: "Se estiver bom, responda **aprovado**. Aí eu ponho no ar: a mudança passa a valer para todos os visitantes [no celular] [nas páginas de produto], depois que eu limpar os caches (em geral de segundos a alguns minutos; eu confiro e te aviso). Antes eu guardo uma cópia do que está no ar; para voltar atrás, é só me pedir. Se quiser ajustar algo, me diga o quê e eu mando uma prévia nova."

- Troque os colchetes pelo caso real: aparelho e páginas. Se quem grava é a pessoa (SCSS de Personalização), troque "eu ponho no ar" pelo passo a passo dela.
- Se a mudança também precisa de um clique em `Incluir` ou `Publicar` (arquivo novo, `ajustes-visuais.md` 5.6), diga na mesma mensagem que esse clique é outro passo, e de quem é: da pessoa, ou seu, se ela pedir nomeando o botão e a página. O "aprovado" não inclui botão nenhum.
- Se a mudança passa pelo cache de configuração da loja (`<head>`, agenda, Barra do Topo, logo), diga na mesma mensagem que essa limpeza é perguntada à parte, ou é dela se ela costuma limpar (`gravacao-arquivo-e-head.md`, Passo G).

Diga também o que a prévia **não** mostra, quando houver algo assim:

- uma fase futura, se não houver um favorito com a data dela;
- um efeito que depende de cache;
- uma parte que só existe depois de gravar;
- a versão de celular, se você não conseguiu vê-la (seção anterior), e quais prints são render local;
- a posição na cascata, se nenhuma opção do gerador pôs a prévia exatamente onde o arquivo vai ficar
  ("Arquivo novo", acima);
- um estado que você não abriu para não mexer na sessão dela (a sacola com produto, a conta logada, o aviso de
  primeira visita: "Estados que mudam a sessão da pessoa", na seção anterior);
- a configuração dela, se o print "como você vê" é aproximado ("Como a pessoa vê", na seção anterior).

## Aprovação, gravação e conferência

- **Conta como aprovação** um sim claro sobre **esta** prévia: "aprovado", "pode gravar", "pode pôr no ar", "pode subir". Essas frases autorizam pôr no ar o que foi aprovado (gravar, número novo no `<head>`, o `Limpar cache` da linha que você gravou, conferir), e só isso. O cache de configuração da loja e a linha `banner` de Administrador › Cache continuam perguntados antes (ou limpos porque a pessoa pediu: `SKILL.md`, regra zero; `imagens-e-banners.md`, seção 3, passo 5).
- **Nenhuma aprovação é pedido de botão.** Na tela Páginas, `Incluir` (página ou Arquivo novo, e também o `Criar nova página` do `Log`) e `Publicar`, em página nova ou já existente, só com um pedido à parte que nomeie o botão e a página. `Despublicar` e `Restaurar Versão` (no diálogo do `Log`, `armadilhas.md` 36; ninguém mediu o que ele restaura) são da pessoa: ela clica, e você confere depois. `Excluir` nunca é da skill.
  - Por isso a skill não sugere "pode publicar" como resposta: na fala do dia a dia, "publicar" quer dizer pôr no ar; na tela Páginas, é um botão.
  - Se a resposta vier com "publicar", confirme antes de gravar, separando as duas coisas: "Posso gravar o que você aprovou?" e, só se a tarefa tiver uma página que precisa do botão, "Quer também que eu clique em `Publicar` na página #NNNNNN `/url`? A partir daí ela abre para qualquer visitante."
  - Na primeira vez (`ajustes-visuais.md` 5.6), quem clica em `Incluir` e `Publicar` é a pessoa, ou você, se ela pedir nomeando o botão e a página. O caminho por script, com as travas, está em `gravacao-arquivo-e-head.md`: "Criar um Arquivo novo" e "Publicar, quando a pessoa pede".
  - Nos cadastros de imagem e banner (Tipos de Banner, Banners, Mídias), o pedido para cada `Incluir` é o "sim" da pessoa sobre a lista escrita do que vai ser criado: o tipo; cada arte com nome, link, ordem, datas e arquivo (`imagens-e-banners.md`, seção 0). O "aprovado" de uma prévia não é essa lista, e um registro fora dela pede outro "sim". O `Confirmar` de cada diálogo de criação é um clique real (`imagens-e-banners.md`, seção 9).
- **Não conta:**
  - "ficou bom" sobre um detalhe com outro ponto ainda em aberto, nem aprovação de uma prévia anterior;
  - "sem preferência", "tanto faz", "pode ser", "você que sabe", sem dizer qual versão: não é um sim sobre
    esta prévia. Faça uma pergunta fechada ("Posso gravar a versão X, a dos prints?") e espere. Com duas
    variantes na mesa, a pergunta nomeia uma só.
- **Grave exatamente o que foi aprovado.** A prévia sai dos mesmos arquivos que vão para o admin, não de uma cópia ajeitada.
  - Anote o sha256 dos arquivos aprovados (o hash, uma impressão digital do conteúdo) e a data no histórico do perfil da loja (`~/panorama-lojas/<slug>.md`). O sha que vai no histórico é o que o `gerar_previa.py` imprimiu para cada `--css` e `--js` do favorito aprovado.
  - **Com `montar_tema.py --publicar`**, é a versão de publicar que vai para o admin. Anote também o sha da versão de trabalho (a comentada) para achar a fonte depois: o script imprime os dois (`ajustes-visuais.md`, 5.2).
    - Arquivo novo (sem `--base`): a prévia sai da versão de publicar, e o sha aprovado é o dela.
    - Versão nova de um arquivo no ar (`--base`): a prévia da pessoa é a de acréscimo, e o sha que o gerador imprime é o das seções; a versão de publicar é a base, byte a byte, mais as mesmas regras dessas seções (o `montar_tema.py` confere), e você comparou na sua aba os dois favoritos, com 0 diferenças ("Favorito grande", acima). Anote os três shas (seções, versão de publicar, versão de trabalho) e o resultado da comparação.
  - **Com o tema em duas páginas** (a comentada guardada no admin, `ajustes-visuais.md`, 5.2): a prévia da pessoa é a de acréscimo, como acima, e o que vai para o Arquivo do site é a enxuta do `enxugar_tema.py`, com a comentada gravada antes, na página dela. Anote o sha das seções (o aprovado), o da enxuta e o da comentada.
  - **Com `--compactar-js`**, o favorito leva o JS sem comentários e sem recuo, conferido pedaço por pedaço contra o arquivo; o sha aprovado continua o do arquivo, que vai para o admin como está.
  - **Mudou um byte da fonte depois de gerar o favorito** (até um degradê só mais suave)? Gere o favorito e os prints de novo e peça o "aprovado" de novo. Antes de mandar, e de novo antes de gravar, confira que o sha do arquivo é o que o gerador imprimiu.
  - Na gravação (`gravacao-arquivo-e-head.md` ou `gravacao-construtor.md`), confira que o que entra no admin é o aprovado:
    - com `--substitui` (arquivo inteiro), o sha dos bytes do arquivo novo é o sha anotado na aprovação;
    - com `--depois-de` (acréscimo), o arquivo novo é o backup byte a byte seguido dos trechos aprovados, na mesma ordem do `--css` da prévia, montado pelo `scripts/montar_tema.py --base` (`ajustes-visuais.md`, 5.2) a partir dos mesmos arquivos cujo sha você anotou; o script confere que a saída começa pela base, byte a byte, e imprime o sha das seções. Com `--publicar`, o que vai para o admin é a base seguida dos mesmos trechos sem comentários (o script confere que as regras são as mesmas), cada um com uma linha de cabeçalho com o número da seção; anote o sha das duas versões;
    - no `Blocos:` do construtor, o JSON gravado é o arquivo aprovado no rascunho.
- **Qualquer mudança depois da aprovação** pede prévia nova, mesmo "pequena". A exceção é o mecanismo de publicação, que não muda o visual: o número do `?v=` no `<head>`, por exemplo.
- **Depois de gravar e passar pelos caches**, compare o site no ar com os prints da prévia, nas mesmas páginas e larguras.
  - Se ficou diferente, a cascata ou a ordem no ar não era a que a prévia assumiu.
  - Investigue antes de remendar, e conte à pessoa o que mudou.
- **Pular a prévia só se a pessoa pedir**, com essas palavras ("pode subir direto"). Uma emergência não muda isso.
  - Mesmo assim, faça backup e conferência como sempre.
  - Registre que foi sem prévia.
