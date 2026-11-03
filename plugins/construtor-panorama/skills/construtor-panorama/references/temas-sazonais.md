# Temas sazonais: Black Friday, Esquenta, Natal e outras datas

Como montar, testar, ligar e desligar um tema de data comemorativa numa loja da Panorama Sistemas: a
agenda de skins, o arquivo de tema, a barra promocional com contagem, a Barra do Topo do admin, e o que
conferir antes e depois.

Escrito a partir de uma campanha real de Black Friday (outubro de 2026), medida numa loja real da
plataforma: tema escuro novo no lugar do tema do ano anterior, barra de contagem com duas fases, selo de
campanha nos produtos. Conferido depois noutra loja, de outra família de tema (outubro de 2026): um tema
de novembro com contagem e uma variante de fundo escuro, feitos até a prévia. Os números medidos estão
aqui. Os `#` de página, nomes de arquivo, classes e datas dessas lojas não estão: cada loja cria os seus, e
eles moram no perfil da loja.

**O que depende da família do tema diz onde foi medido.** A família é o conjunto de arquivos de tema que a
plataforma serve (o reconhecimento descobre: `reconhecimento-da-loja.md`, 2i). Neste arquivo: "(família
`/dist`)" foi medido numa loja com `loja.<hash>.css` e `bundle.<hash>.js`; "(família `modelo-1`)", numa
loja com `modelo-1.<hash>.css` e `.js` no CDN da plataforma; "(plataforma, nas duas famílias medidas)" vem
do `platform.<hash>.css`/`.js`, que as duas serviam. Nada disso é garantido na sua loja: confira (ao lado
de cada fato está como medir). Numa família que não é nenhuma dessas, nenhum seletor daqui vale antes de
ser medido.

Antes de começar:

- **Leia o perfil da loja** (`~/.claude/panorama-lojas/<slug-da-loja>.md`). Se ele não existir, não tiver a
  parte de temas ou não disser a família do tema, faça o levantamento da seção 1 e anote o que achar
  (seção 11).
- **A regra zero do `SKILL.md` pesa mais aqui.** A agenda de skins, o `<head>` e os arquivos de tema são
  configuração da **loja inteira**: um `Confirmar` errado muda todas as páginas ao mesmo tempo, inclusive o
  carrinho. Grave só o que a pessoa pediu, no alvo que ela nomeou, com backup do valor anterior e depois de
  mostrar a mudança a ela.
- `Excluir`, `Publicar` e `Despublicar` continuam fora de alcance sem pedido explícito, inclusive para criar
  a página Arquivo de um tema novo.
- Este arquivo trata do que é próprio de um tema de época. O que vale para qualquer CSS (de onde vem um
  estilo, onde pôr a regra, escopo, teste, pôr no ar e voltar) está em `ajustes-visuais.md`; a prévia e a
  aprovação da pessoa, em `previa.md`; as telas do admin, em `mapa-do-admin.md`.

## Sumário

1. As peças de um tema sazonal (e como achá-las numa loja nova)
2. A agenda de skins (Skin Json Input)
3. Testar o tema antes de ligar no site
4. Arquivo de tema isolado: copiar, provar que é igual, só então corrigir
5. A barra promocional da agenda (`.promotionBar`), que depende da família do tema, e o JS legado
6. Barra com fases e contagem num arquivo JS do site
7. A Barra do Topo do admin (Visual › Cabeçalho)
8. Urgência honesta
9. Checklist de lançamento
10. Checklist de volta atrás
11. O que anotar no perfil da loja
12. Fundo escuro no miolo: o roteiro

## 1. As peças de um tema sazonal

Um tema sazonal na Panorama é uma **classe no `<body>`** durante uma janela de datas, mais um CSS que só vale
quando essa classe está lá. Em volta disso há outras peças, cada uma com o seu cache e o seu jeito de voltar
atrás:

| Peça | Onde fica | O que faz | Para valer depois de gravar |
|---|---|---|---|
| Agenda de skins | Único › Lojas › (linha da loja) › Configurações › Tipo = Site › Visual › Modelo e Skin › **Skin Json Input** (chave `skin`) | põe a classe do tema no `<body>` de todas as páginas do tema entre `start` e `end`, e manda a barra promocional (que só funciona onde o tema tem suporte: seção 5) | cache de configuração da loja |
| Arquivo do tema | Loja On-line › Páginas › Tipo = **Arquivo** (ex.: `/skin-tema-novo.css`) | as regras do tema, todas presas à classe | Limpar cache na linha + número novo no `<head>` |
| Linha no `<head>` | Configurações › Integrações › Custom › **Código dentro do `<head>`** (`customCodeOnHead`) | chama o arquivo com um número (`?v=N`) | cache de configuração |
| Arquivos JS do site | páginas Arquivo chamadas no `<head>` | podem apagar ou reescrever a barra, trocar imagens quando a classe do tema está no `<body>` | idem ao arquivo do tema |
| Classe por página | construtor › Estilo CSS/SCSS › **Classe no `<body>`** (`body_class`) | põe a classe numa página só | Limpar cache da página |
| Barra do Topo | Configurações › Visual › Cabeçalho › **Mostrar Barra do Topo?** / **Texto na Barra do Topo** (`headerTopBarShow` / `textoHeaderTopbar`) | faixa de HTML fixo acima do cabeçalho, sem datas | cache de configuração |
| Etiquetas de produto | Loja On-line › **Tags** (o cadastro; `mapa-do-admin.md`, seção 16) | selo de campanha nos cards e na página do produto. **Sem datas**: liga e desliga à mão (`Ativo`), e uma regra de época presa a ela só age dentro da janela da agenda (seção 4, "Etiqueta como gatilho, agenda como interruptor") | não medido |

Caminhos, botões e as camadas de cache em detalhe: `mapa-do-admin.md`, seções 1, 3 e 5 (as etiquetas, 16).

Nem todo tema precisa de um arquivo grande. Para Natal ou Dia das Mães, às vezes é só a barra, um selo e a
cor dos botões: o processo é o mesmo, com menos para conferir. Tema escuro é o caso mais arriscado, porque
mexe no contraste de tudo, inclusive do que o tema da plataforma desenha. Escurecer o miolo das páginas, e
não só as bordas (barra, cabeçalho, rodapé), tem roteiro próprio: seção 12. Uma variante mais estilizada
de um tema (tipografia, ritmo das seções, cards) é uma proposta de estilo: `criterios-de-design.md`, 4.

Uma confusão comum: existem **duas barras**. A `.promotionBar` vem da agenda, tem data e contagem (seções 5
e 6). A Barra do Topo vem do Cabeçalho, é HTML fixo e não tem data (seção 7).

### Levantamento numa loja que você ainda não conhece (só leitura)

0. Leia no perfil a família do tema (`reconhecimento-da-loja.md`, 2i), a ordem da cascata (2e) e os
   endereços que são outro sistema (2d). Se faltar algum, rode esses passos do reconhecimento antes: de uma
   família para outra mudam a barra da agenda (seção 5), a ordem da cascata (seção 4) e os seletores do
   cabeçalho e da Barra do Topo (seção 7).
1. Baixe o HTML da home com UA de computador e de celular (`curl`; em PowerShell, `curl.exe`). Anote a
   classe do `<body>` (há algum `skin-…` ligado agora?), se existe `a.promotionBar` e `.header-top-bar`, e a
   lista de `<link>` e `<script src>` do `<head>`, com os números (`?v=…`, `?updated…`). Os de caminho
   relativo (`/algum-arquivo.css?v=3`) são a saída do Código dentro do `<head>`; os de endereço absoluto com
   hash no nome (`platform.<hash>.css`, `loja.<hash>.css`, `modelo-1.<hash>.js`…) são do tema e dizem a
   família.
2. No admin, abra Configurações › Visual › Modelo e Skin, copie o Skin Json Input inteiro para um arquivo
   local, calcule o sha256 e saia por `Cancelar`.
3. Em Páginas, Tipo = Arquivo, procure os arquivos vistos no `<head>` e os que têm "skin" no nome. Anote `#`,
   URL e se cada um está chamado no `<head>` (temas de anos antigos costumam existir sem estar chamados).
4. Baixe cada JS do `<head>` com o número que o `<head>` usa e procure `promotionBar`, `header-top-bar`,
   `skin-`, `classList.contains`, `hasClass`. Anote arquivo, linha e o que cada ocorrência faz. Baixe também
   os arquivos do tema (os de endereço absoluto com hash, CSS e JS) e conte `countdown` e `promotionBar`
   neles: é metade da resposta a "a barra da agenda funciona nesta família?" (a outra metade e o que
   concluir estão na seção 5).
5. Procure a classe do tema antigo também no CSS da home no ar e no SCSS de Personalização. Os dois vêm no
   HTML que você baixou no passo 1 (o da página em `<style id="builder-custom-css">`, o de Personalização no
   maior `<style>` sem `id` do `<head>`, nas duas famílias medidas; a posição dele muda com a família,
   seção 4), então não precisa abrir diálogo nenhum. Numa loja real, ~90 regras do tema moravam no CSS da
   própria home, e não no arquivo do tema.

Tudo isso é leitura. Nada aqui pede `Confirmar`.

## 2. A agenda de skins (Skin Json Input)

### Formato

O campo inteiro é **uma lista JSON** (`[ … ]`); cada item é um tema com janela de datas. Na loja medida
eram 5 itens, o novo no topo e os de anos anteriores abaixo, desligados por datas no passado:

```json
[
    {
        "name": "meu-tema-AAAA",
        "namespace": "_meutema",
        "bodyClass": "skin-meu-tema-AAAA",
        "start": "AAAA-MM-DD 00:00:00",
        "end": "AAAA-MM-DD 23:59:59",
        "promotionBar": {
            "textLeft": "Texto<br />curto",
            "textMiddle": "Uma frase curta e verdadeira"
        }
    },
    {
        "name": "tema-do-ano-anterior",
        "namespace": "_meutema",
        "bodyClass": "skin-tema-do-ano-anterior",
        "start": "AAAA-MM-DD 00:00:00",
        "end": "AAAA-MM-DD 23:59:59"
    }
]
```

`"_meutema"` é um marcador: use o `namespace` do item que você está imitando (a tabela abaixo explica por
quê). Um item sem barra simplesmente não tem a chave `promotionBar`.

| Campo | O que se sabe |
|---|---|
| `name` | nome do item, para você e para quem vier depois o achar |
| `namespace` | aparece nos itens vistos, mas não sabemos para que serve. Numa loja real, o item novo da Black manteve o `namespace` do item de Black do ano anterior, por cautela, e funcionou. Numa loja sem item anterior, combine com a pessoa, antes, o `namespace` do item de verdade (ex.: `_natal`) e use **o mesmo valor** no item inerte (abaixo), para medir o efeito dele. Se o inerte mostrar qualquer diferença além da classe, pare e pergunte à Panorama Sistemas |
| `bodyClass` | a classe que vai para o `<body>` de **todas** as páginas do tema, inclusive carrinho e checkout quando são do tema. Endereços de outro sistema (rotas em Next.js, como o carrinho de uma loja medida) não recebem a classe nem os arquivos do tema (`mapa-do-admin.md`, seção 15) |
| `start` / `end` | `AAAA-MM-DD HH:MM:SS`, sem fuso escrito |
| `promotionBar` | textos da barra que o servidor monta (seção 5). Aceitam HTML simples (`<br />`, `<b>`). Só ponha esta chave onde o perfil diz que a barra da agenda funciona nesta família: noutra, ela pode dar erro de script (seção 5) |

### Como liga, desliga e troca

- **Liga**: dentro da janela `start`–`end`, a classe aparece no `<body>`. Um arquivo de tema bem feito não
  faz nada sem a classe (seção 4), por isso ele pode ir ao ar dias antes.
- **Desliga**: `end` no passado (uma troca só, no seu item).
- **Troca na hora**: mude só o `bodyClass` do item. Numa loja real esse era o plano de volta: o item novo
  apontava para a classe nova, e trocar o `bodyClass` para a classe do ano anterior devolvia o tema antigo
  inteiro (o arquivo antigo continuava chamado no `<head>`).
- Depois de gravar, o cache de configuração da loja precisa ser limpo (Administrador › Cache, só a linha
  "Configurações da Loja", `loja_config`; `mapa-do-admin.md` seção 5). Em muitas lojas é a pessoa quem faz;
  pergunte antes de fazer você.

O que **não** foi medido, para você não prometer:

- **A virada exata pela data, sem ninguém mexer.** No caso real o item foi gravado com `start` já no passado,
  e as trocas de fase foram feitas pelo JS (seção 6). Entre a hora marcada e o que o visitante vê estão o
  cache da página (o `max-age` do HTML; medido: 5 min na home, nas duas lojas) e, onde houver CDN na frente, a
  cópia da borda (o da sua loja está no perfil, `reconhecimento-da-loja.md`, 2b). Se a hora exata importa (um
  anúncio à meia-noite), olhe o site na virada, ou ponha o `start` um pouco antes.
- **Itens com janelas sobrepostas.** Na loja medida os outros itens tinham datas no passado; não sabemos
  qual vence. Evite sobreposição, ou teste antes numa janela curta.
- **O fuso do `start` e do `end`.** Presume-se o horário de Brasília, mas não foi medido. O item inerte,
  abaixo, mede.

### Loja sem item anterior: comece por um item inerte

Numa loja com a agenda vazia, ou sem um item parecido com o que você quer, não há `namespace` para
reaproveitar, e o fuso e o formato aceito não foram medidos. O primeiro passo seguro é gravar um **item
inerte**, que não deve mudar nada no site, e medir com ele:

```json
{
    "name": "teste-agenda-AAAAMMDD",
    "namespace": "_o-mesmo-do-item-de-verdade",
    "bodyClass": "teste-agenda-AAAAMMDD",
    "start": "AAAA-MM-DD HH:MM:00",
    "end": "AAAA-MM-DD HH:MM:00"
}
```

- **Inerte de verdade:** um `bodyClass` que nenhum CSS ou JS da loja usa (procure o nome nos arquivos do
  `<head>` e no SCSS de Personalização, como no passo 4 do levantamento), e sem `promotionBar`. O
  `namespace` é o do item de verdade (tabela acima): é o efeito dele que o teste mede.
- **Janela que mede o fuso para os dois lados:** `start` uns 15 minutos depois da gravação e `end` umas 4
  horas depois dele, em horário de Brasília, sem encostar em nenhum outro item (se há um tema valendo hoje,
  a janela encostaria nele: não grave o inerte agora). Ele se desliga sozinho. Logo depois de gravar, antes
  do `start`, peça a limpeza do cache de configuração (ou limpe você, se a pessoa pedir): sem isso o site
  nem fica sabendo do item. Uma janela de 30 minutos não serve: num servidor em UTC (3 h adiantado em
  relação a Brasília) ela já passou no relógio dele, a classe nunca aparece, e parece que o formato foi
  recusado.
- É configuração da loja: backup, o "sim" da pessoa, gravação e o cache de configuração (pergunte antes, ou
  faça se a pessoa pediu), como qualquer outra (seção "Como editar sem estragar o resto", abaixo). Diga a ela
  que o site não deve mudar e que o item fica valendo umas 4 horas.
- **Agenda nunca usada: a chave `skin` nem existe** na configuração (medido numa loja, 2026-10;
  `lerCampo('skin')` devolve `existe: false`). Aí não há texto para trocar por script, e as funções que
  gravam recusam: o item inerte é colado pela pessoa, a lista inteira com o item (`[ { …o item… } ]`), e
  você confere antes (a chave ausente, anotada com a data no perfil) e depois
  (reabrir, ler, comparar pelo sha). A sequência: `gravacao-arquivo-e-head.md`, "Campo que nunca foi usado
  (a chave não existe)".

O que ele mede, olhando o HTML da origem (`/?nc=…`, computador e celular) logo depois da limpeza do cache,
a cada minuto ou dois perto do `start` e do `end`, e a cada 15 ou 30 minutos no meio:

1. **Se o formato foi aceito**: a classe aparece no `<body>` em algum momento. Se ela não aparecer em
   nenhum momento das 4 h, nem antes do `start`, aí sim desconfie do formato (ou de um fuso muito
   diferente) e pergunte ao suporte.
2. **O relógio e o fuso do servidor**, pela hora em que a classe aparece e sai:
   - aparece no `start` e sai no `end`, em horário de Brasília: o servidor lê as datas em Brasília;
   - aparece logo depois da limpeza, **antes** do `start`: o servidor está adiantado (em UTC, 3 h). A hora
     em que ela sai diz quanto: ela sai antes do `end` exatamente pela diferença (em UTC, 3 h antes);
   - aparece 1 a 3 h **depois** do `start`: o servidor está atrasado, por essa diferença.

   Anote a diferença no perfil, e use-a em todo item dali em diante (com exceção do `end` de um item com
   `promotionBar` sem JS, a opção a) da seção 7: lá o mesmo `end` é também o fim da contagem do visitante).
   Considere um ou dois minutos de cache.
3. **Se o `namespace` faz alguma coisa**: compare o HTML servido com o item valendo e sem ele. A única
   diferença esperada é a classe no `<body>`. Se aparecer outra coisa (uma barra, um script, uma classe a
   mais), o namespace ou o formato fazem algo que você não sabia: pare, anote e pergunte à Panorama antes
   do item de verdade. Se a diferença aparece no site, diga à pessoa e proponha desligar o inerte já
   (`end` no passado, uma troca só).
4. **Se ele sai sozinho** no `end` (pelo relógio do servidor, item 2).

Depois, apague o item inerte da agenda (é só texto do campo, não `Excluir`) ou deixe-o lá com as datas no
passado, como o histórico; combine com a pessoa. Anote tudo no perfil, na parte da agenda.

### O que perguntar ao suporte da Panorama Sistemas

Para uma loja que vai depender da agenda (uma campanha com hora marcada), vale perguntar por escrito:

- em que fuso o servidor lê `start` e `end`;
- qual item vence quando duas janelas se sobrepõem;
- para que serve o `namespace`, e quais valores o tema da loja reconhece;
- se o tema da loja tem estilo e relógio para a `.promotionBar` (seção 5), para onde aponta o link padrão
  dela e se ele pode ser mudado;
- se a agenda passa pelo mesmo cache de configuração da loja (Administrador › Cache, `loja_config`).

Anote as respostas no perfil, com a data e quem respondeu.

### Como editar sem estragar o resto

A agenda guarda o histórico da loja: itens de outros anos, às vezes de outras pessoas. Na loja medida eram
5 itens, com indentação misturada (tabs e espaços) e espaços no fim de algumas linhas.

1. Guarde o valor inteiro num arquivo local e anote o sha256 (seção 1, passo 2; o snippet E de
   `reconhecimento-da-loja.md` faz a cópia exata).
2. **Insira** o seu item (no caso real, no topo da lista) sem reformatar o resto. Reindentar o JSON muda
   todas as linhas: a comparação fica ilegível e a volta atrás fica difícil de conferir.
3. Antes de gravar, confira por script: o texto novo passa em `JSON.parse`, é uma lista, e fora do seu item
   é idêntico ao backup.
4. Mostre à pessoa o item e as datas, e espere o "pode gravar".
5. Grave, reabra o diálogo e compare com o que você gravou. Depois, o cache de configuração: pergunte antes
   (ou faça, se a pessoa pediu).

Por script, os passos 3 e 5 são as funções `conferirCampoAtual('skin', sha)`, `trocarNaConfig('skin',
pares)`, `confirmarConfigLoja()` e `verificarCampoGravou('skin', sha)` de `scripts/injetar.js`, com as
mesmas travas do `<head>`; a sequência, e como gerar os pares a partir do backup, está em
`gravacao-arquivo-e-head.md` ("Os outros campos"). Se a pessoa preferir, ela cola o valor novo à mão
(Ctrl+A, colar, `Confirmar`), e você confere antes e depois, relendo o campo e comparando pelo sha. Se a
chave `skin` não existe (agenda nunca usada), as funções que gravam recusam: quem cola é a pessoa, sempre,
e você confere depois (`gravacao-arquivo-e-head.md`, "Campo que nunca foi usado (a chave não existe)").

⚠️ **Antes de abrir, pergunte se alguém (a pessoa ou outra pessoa da loja, em outra aba ou em outro
computador) está com o diálogo `Configurações` da loja aberto.** Se estiver, peça que clique em `Cancelar`
lá primeiro. O `Confirmar` de lá, depois, grava por cima o valor carregado antes, e a sua mudança some sem
aviso (ou desfaz a de outra pessoa). Frase para a pessoa: "Antes de eu gravar: você ou alguém da loja está
com a tela Configurações da loja aberta agora, em outra aba ou em outro computador? Se estiver, peça para
fechar clicando em Cancelar. Se alguém clicar em Confirmar lá depois de mim, a minha mudança é desfeita sem
aviso."

## 3. Testar o tema antes de ligar no site

Duas formas, nenhuma toca na agenda.

**a) Classe numa página de teste.** Na página de teste que a pessoa indicar (no caso real, uma cópia da
home publicada com robots noindex), construtor › Estilo CSS/SCSS › Classe no `<body>`: acrescente a classe
do tema às que já existem, por exemplo `page-home` → `skin-tema-novo page-home`. Mostra o tema com o HTML de
verdade servido pelo site, em computador e celular.

Limites: vale só para aquela página. Produto, categoria, carrinho e busca não têm `body_class` de construtor,
e é justamente lá que um tema escuro mais quebra. E nunca deixe a classe do tema no `body_class` da home de
produção: ela continuaria lá depois do `end` da agenda, e o tema não desligaria na home.

**b) Prévia por favorito.** `scripts/gerar_previa.py` gera um favorito que liga e desliga CSS e JS só na
aba aberta (como mandar para a pessoa e o que conta como aprovação: `previa.md`). Para um tema que ainda não está na agenda, o JS da prévia põe a classe:

```js
document.body.classList.add('skin-tema-novo');
window.__previaDesligar = function () { document.body.classList.remove('skin-tema-novo'); };
```

e o CSS vai com `--depois-de` apontando para o `<link>` que vai ficar logo acima da linha nova no `<head>`
(o do tema anterior, se ele estiver chamado no `<head>` servido), para a prévia ficar na mesma posição da
cascata que o arquivo publicado vai ter (`previa.md`, "Arquivo novo"; onde fica a linha nova em relação ao
SCSS de Personalização depende da família, seção 4). Nesse caso não passe `--classe-body`: ele exige que a
classe já esteja no `<body>`, e ela ainda não está. Funciona em qualquer página do tema, inclusive produto e
carrinho (quando o carrinho é do tema: `mapa-do-admin.md`, seção 15).

Se o JS do tema que vai ao ar já tem a própria função de desligar, com outro nome, `--desligar NOME` faz o
favorito adotá-la, e a prévia roda o arquivo publicado sem embrulho escrito à mão (`previa.md`, "JS na
prévia").

O que a prévia não mostra, porque entra depois de a página carregar:

- **scripts do site que leem a classe na carga**, como um JS que troca um selo ou um logo para a versão
  branca quando o tema escuro está ligado (seção 4);
- **medidas que o tema faz uma vez só.** Nas listas do computador da família `/dist` (medido numa loja), o
  tema congela a altura de cada card ao montar a lista (o evento `ProductList:instanciar` é da plataforma;
  os cards congelados ganham `.on-hover-details-started` e altura no `style`; `catalogo-tema-base.md`, 4).
  Um CSS que muda a altura dos cards, injetado depois, corta os preços na prévia, e não no site publicado.
  No caso real, o favorito passou a remedir ao ligar e a devolver as alturas originais ao desligar. Na
  família `modelo-1` esse congelamento não apareceu (medido noutra loja; `catalogo-modelo-1.md`, 4): meça
  antes de supor;
- **carrosséis que mediram a largura na carga** (Owl, da plataforma, nas duas famílias medidas). Numa loja,
  um CSS do tema que mudava a largura do container cortou o carrossel da Barra do Topo só na prévia. O
  `--resize` do gerador dispara um `resize` ao ligar e ao desligar; ele também remonta outras partes (lá,
  uma vitrine mudou 112px de altura), e o teste de "0 diferenças" passa a precisar da contraprova
  (`medir-no-navegador.md`, 9);
- **o que só o `<head>` faz antes da primeira pintura**, como a reserva de altura da barra (seção 6).

A prévia serve para a pessoa aprovar o visual. A conferência que vale é no ar (seção 9).

**Quando a classe do tema já está no ar.** Tudo acima supõe o caso comum: o arquivo vai ao ar antes do
`start`, e a classe ainda não está no `<body>`. Se o item da agenda já vale hoje (a classe aparece no
`<body>` do HTML servido; levantamento da seção 1, passo 1), acrescentar uma seção ao arquivo desse tema não
é inerte:

- **Gravar é lançar.** A origem responde a qualquer `?v` com o conteúdo de agora (`armadilhas.md`, 33;
  deduzido do comportamento com `?nc=`, não medido diretamente). Logo que o Arquivo é gravado (e o cache da
  linha é limpo), quem não tem uma cópia guardada (um visitante novo; onde há CDN, uma cópia da borda que
  venceu) já recebe a seção nova; o número novo no `<head>` só garante que todo mundo a receba.
- **"Sem a classe, 0 diferenças" não segura mais nada**: a classe já está lá. Trate como uma mudança
  permanente (`ajustes-visuais.md`, 0, "Dois modos"): a trava é a prévia aprovada pela pessoa, mais uma
  página que não deveria mudar, com 0 diferenças com a prévia ligada (o mesmo tipo de página onde a mudança
  não se aplica e outro tipo de página: `ajustes-visuais.md`, 4.1).
- **Mudança com CSS e JS**: o aperto de mão das duas peças (`ajustes-visuais.md`, 2.6 (g); aqui, seção 6),
  para cada peça sozinha não mudar nada, e a ordem de gravar de `gravacao-arquivo-e-head.md` ("Mudança em
  duas peças: a ordem").
- **Diga à pessoa antes de pedir o "sim"**: "a classe da campanha já está no site, então gravar este arquivo
  já põe a mudança no ar". O "sim" dela vale para essa hora. Se ela quer a gravação inerte até outro dia, a
  mudança precisa de outra trava: um arquivo novo, cujo interruptor é a linha no `<head>`
  (`ajustes-visuais.md`, 2.1), ou uma data no JS (o `inicio` da seção 6).

Medido numa loja da família `/dist` (2026-10): uma seção nova foi acrescentada ao arquivo de um tema cuja
classe já estava no ar. O que segurou o lançamento foi a prévia aprovada, o aperto de mão (cada peça
sozinha: 0 diferenças) e uma página do mesmo tipo onde a mudança não se aplicava (0 diferenças).

## 4. Arquivo de tema isolado

Quando já existe o tema do ano passado e a pessoa quer "o mesmo, mas corrigido", o caminho natural é editar
o arquivo antigo. Evite: ele está chamado no `<head>`, então cada `Confirmar` muda o site no ar (e o cache
dos Arquivos, de 30 min a 24 h nas lojas medidas, espalha a mudança aos poucos), não há onde testar antes, e
voltar atrás depende de lembrar do que era.

O que funcionou numa loja real:

1. **Arquivo novo, classe nova.** Uma página Arquivo nova (ex.: `/skin-tema-novo.css`) com uma classe nova
   (`skin-tema-novo`). Criar e publicar a página são pedidos explícitos da pessoa. ⚠️ `Incluir` com clique
   composto criou a página **duas vezes** (mesma URL, dois `#`): o mais seguro é a pessoa clicar; se você
   disparar, um disparo só, e confira a grade antes de repetir. Se nascer duplicata, pare: mostre as duas
   linhas (`#`, URL, Publicada) à pessoa e pergunte qual fica. Despublicar a sobra é da pessoa: ela clica,
   e você confere depois; `Excluir` nunca é da skill. A receita para criar por script, com um clique
   real só no `Confirmar`, está em `gravacao-arquivo-e-head.md`.
2. **Junte todas as regras do tema antigo, não só as do arquivo dele.** Na loja medida estavam em cinco
   lugares: o arquivo do tema (~121 regras e os `@keyframes`), o CSS da própria home (~90 regras com a classe
   antiga), um CSS do cabeçalho, um CSS da área do cliente (os dois chamados no `<head>`) e o SCSS de
   Personalização.
3. **Reescreva a classe**: `body.skin-tema-antigo …` → `body.skin-tema-novo …`. As regras que vieram do CSS
   da home ganham `:where(.page-home)`, para continuarem só na home sem somar especificidade. As regras do
   arquivo antigo que valem sem a classe ficam de fora: já estão no ar pelo arquivo antigo.
4. **Prove que é igual antes de corrigir.** Com a classe nova no lugar da antiga, o estilo computado dá 0
   diferenças contra o tema antigo; sem classe nenhuma, 0 diferenças contra o site de hoje. No caso real: 0
   diferenças em 12 combinações de página e aparelho (entre elas home, produto, categoria, carrinho e login,
   no computador e no celular). Sem essa prova, quando algo mudar você não sabe se foi a cópia ou a correção.
5. **Correções em seções numeradas no fim do arquivo**, cada uma com um comentário curto: o que muda, por
   quê, o que foi medido. Cada versão nova é a versão no ar, byte a byte, mais as seções novas no fim.
   Guarde cada versão num arquivo local (`-v1`, `-v2`…, na pasta `trabalho/` do perfil): é o seu caminho de
   volta.
6. **Confira por script antes de pôr no ar.** `scripts/montar_tema.py` monta o arquivo dos dois jeitos
   (arquivo novo a partir de seções, ou a versão no ar byte a byte mais as seções novas, com `--base`) e
   aborta sem escrever nada se algo não bater. Como rodar e o que ele imprime: `ajustes-visuais.md`, 5.2. O
   que ele confere:
   - com `--base`, o começo do arquivo novo é idêntico à versão publicada, e com `--sha-base` a base tem de
     bater com o sha256 anotado no backup;
   - comentários fechados e chaves `{` `}` equilibradas, contadas fora de comentários e de strings;
   - com `--classe`, todo seletor começa pela classe do tema (`body.skin-tema-novo`, ou
     `html.… body.skin-tema-novo`); cada exceção entra por `--permitir` e sai listada, para você justificar;
   - nenhum BOM, nenhum `\r`, fim de linha LF; caractere fora do ASCII só com escape (`\0000e7`).

   Use o da skill, e não um escrito na hora: numa loja, um script de montagem feito à mão separava a lista
   de seletores com `re.split(r',(?![^(]*\))', …)`, que corta `:is(p, td, ul:not(.links) > li)` no meio, e
   acusou "seletor sem a classe" onde não havia. O da skill conta a profundidade dos parênteses.
7. **Uma linha no `<head>`**, logo abaixo da linha do tema antigo:
   `<link rel="stylesheet" href="/skin-tema-novo.css?v=1">`. A posição importa: em empate de
   especificidade, quem vem depois vence. Onde o SCSS de Personalização fica em relação a essa linha depende
   da família (abaixo).

### A cascata depende da família do tema

A ordem das folhas no documento é a ordem da cascata: em empate de especificidade, a de baixo vence. Ela
não é a mesma em toda loja. Medido em duas (2026-10), do mais fraco ao mais forte:

| Família | Ordem |
|---|---|
| `/dist` (medido numa loja) | `platform.<hash>.css` < `loja.<hash>.css` < CSS da página (`<style id="builder-custom-css">`) < os `<link>` do Código dentro do `<head>`, na ordem em que aparecem < `<style>` do SCSS de Personalização < estilos por bloco do construtor |
| `modelo-1` (medido noutra) | `platform.<hash>.css` < `modelo-1.<hash>.css` < `<style>` do SCSS de Personalização < CSS da página < os `<link>` do Código dentro do `<head>` (as últimas folhas do `<head>`) < estilos por bloco do construtor |

Consequências:

- **na `/dist`, o SCSS de Personalização vence o seu arquivo de tema** em empate de especificidade: para
  ganhar de uma regra dele, especificidade maior, medida com `quemPinta` (`medir-no-navegador.md`, 2);
- **na `modelo-1`, o seu arquivo vence o SCSS e o CSS da página** em empate: não suba especificidade nem
  ponha `!important` à toa, só onde a medida mostrar que precisa;
- **numa família desconhecida, a ordem é a que você medir.** Em qualquer caso, liste a ordem antes de
  decidir (`medir-no-navegador.md`, 1; `reconhecimento-da-loja.md`, 2e) e confira que ela está no perfil;
- regra antiga com `!important` só cai com `!important` e especificidade igual ou maior. Na `/dist`, o tema
  pinta o selo de desconto (`.tags .tag-percentual-desconto`, no `loja.<hash>.css`) com `!important`; na
  `modelo-1`, o selo do tema não tem `!important`, mas a cor das etiquetas criadas no admin vem num
  `style=""` no próprio elemento, que só `!important` vence; e o SCSS de uma loja pode forçar uma cor do
  mesmo jeito (medido: o estado do topo do cabeçalho flutuante, seção 12, passo 4).

### O arquivo é servido cru

O conteúdo da página Arquivo (`data.body`) sai como está, sem compilar SCSS (mesmo com a linguagem do
editor em `sass`), com o cache que a loja dá aos Arquivos (medido: `max-age=86400` numa loja, `max-age=1800`
noutra; o da sua está no perfil, `reconhecimento-da-loja.md`, 2f). Escreva CSS plano (aninhamento só
funciona nos navegadores mais novos; `ajustes-visuais.md`, 2.2) e, depois de cada edição, suba o número no
`<head>`, senão o navegador guarda a versão velha por esse tempo e, onde há CDN na frente, a borda pode
servi-la por dias (medido numa loja com Cloudflare; `mapa-do-admin.md`, seções 3 e 5).

Cada byte vai para todo visitante: no caso real o arquivo passou de 100 KB, com ~29 KB só de comentários
(noutra loja, ~23% do arquivo de trabalho era comentário). Monte a versão de publicar, sem os comentários
de trabalho, com `montar_tema.py --publicar` (`ajustes-visuais.md`, 5.2), e guarde a versão de trabalho,
comentada, na pasta `trabalho/` do perfil: a explicação longa fica nela e no perfil. Com `--base`, a parte
que já está no ar fica como está, byte a byte, e só as seções novas saem sem comentário. A prévia e a
gravação usam a versão de publicar, e o histórico guarda o sha das duas.

O admin guarda o corpo dos Arquivos e o `<head>` com CRLF e sem quebra de linha no fim (medido). Para
comparar o que está lá com o seu arquivo, normalize (`\r\n` → `\n`, sem `\n` final) antes do sha.

### JS que depende da classe do tema

Procure nos JS do site pela classe antiga (`classList.contains('skin-…')`, `hasClass`, `.skin-…`). Na loja
medida, um JS trocava o selo de um parceiro pela versão branca quando o `<body>` tinha a classe do tema
escuro. Com a classe nova, o selo voltaria escuro sobre fundo escuro; o JS passou a aceitar as duas
classes antes do lançamento.

### Etiqueta como gatilho, agenda como interruptor

Uma regra de época que age sobre uma etiqueta de produto (mudar o selo de lugar, de cor, de tamanho)
depende de duas coisas que ligam e desligam de jeitos diferentes:

- **a classe do tema**, que a agenda põe e tira por data (seção 2);
- **a etiqueta**, que não tem data: a grade de Loja On-line › Tags não tem coluna de início nem de fim, e a
  etiqueta liga e desliga à mão, pelo `Ativo` (lido numa loja, 2026-10; o formulário não foi aberto:
  `mapa-do-admin.md`, seção 16).

A regra só age dentro da janela da agenda. Fora dela, antes do `start` e depois do `end`, uma etiqueta
ativa aparece onde e como o tema a desenha sem você (numa loja, de volta em cima da foto do produto, com o
desenho de fora da campanha). O teste "sem a classe, 0 diferenças" não pega isso: a diferença não vem do
seu arquivo, vem da etiqueta. Mesmo assim, a pessoa precisa saber antes de aprovar:

- **Combine, antes de gravar, quem desliga a etiqueta e quando**, alinhado com o fim do item da agenda: a
  data e a hora, em horário de Brasília, em que a classe sai de fato (o `end` lido no relógio do servidor;
  o fuso: seção 2, "Loja sem item anterior"). Desligar antes do `end` tira o selo (dos cards também)
  enquanto o tema ainda vale; desligar depois deixa o selo, nesse intervalo, no lugar e no desenho de
  sempre. A escolha é da pessoa.
- **Ligar a etiqueta antes do `start`** mostra o selo no lugar de sempre até a classe chegar. Se ela quer
  o selo só no lugar novo, ligar a etiqueta e o `start` andam juntos.
- **Selo de campanha depois da campanha é promessa** (um "preço de campanha" num produto que já voltou ao
  preço normal): seção 8.
- **Etiqueta desativada ou renomeada deixa a regra sem alvo**: a classe sai do código (abaixo, "A classe
  da etiqueta sai do nome"), e a regra antiga fica órfã (`catalogo-tema-base.md`, 5). Não apague regra dos
  outros: diga à pessoa e anote.
- O cadastro de etiquetas é conteúdo da pessoa (`mapa-do-admin.md`, seção 16): quem liga e desliga é ela,
  ou quem ela indicar.

Anote no perfil, em "Campanhas e decisões da pessoa" (e na linha da etiqueta, se o perfil tiver a tabela
das etiquetas): a etiqueta (código e ID), a regra que depende dela e quem desliga, com data, hora e fuso.
No fim da campanha, ela entra na lista do que alguém desliga à mão (seções 9 e 10).

### Lições do tema escuro que valem para qualquer tema

Medidas no caso real e, onde está dito, noutra loja, de outra família. Confira os seletores na sua loja.
Para escurecer o miolo das páginas, e não só as bordas, siga também a seção 12.

- **O tema chega a páginas e a estados que ninguém abre na revisão.** Confira por tipo de página e por
  aparelho: home, listas (categoria, busca, página de campanha), produto (inclusive as listas de
  recomendação embaixo), carrinho e checkout (se forem do tema), conta, rodapé, avisos de cookies e do app.
  Um selo de desconto corrigido só na home continuou com a cor do tema nas listas, na busca e na página do
  produto até a versão seguinte. O contrário também acontece: numa loja, o carrinho era outro sistema
  (Next.js) e não recebia o tema nem a classe; o reconhecimento (2d) lista esses endereços, e a pessoa
  precisa saber que lá o site fica como está (`mapa-do-admin.md`, seção 15). E há os estados que ninguém
  abre: a sacola, a busca, o megamenu, os avisos. Noutra loja, a gaveta da sacola e o painel de busca só
  foram conferidos com uma variante nova do tema porque uma nota de outra sessão, no perfil, lembrou deles.
  A lista, e como abrir cada um na sua aba: seção 12, passo 10.
- **Regra de cabeçalho pega outros `<header>`.** A regra do tema que pintava o cabeçalho do site
  (`.inner-body header`) pintou também o `<header>` de uma seção da home. Use o caminho com `>` que a sua
  família tem: `.inner-body > header` (família `/dist`; e o celular da `modelo-1`) ou
  `.inner-body > .header-container > header` (computador da `modelo-1`, medido noutra loja). Confira com
  `document.querySelectorAll('SELETOR').length` nos dois aparelhos.
- **Cabeçalho escuro: pinte os itens, não o texto do cabeçalho inteiro.** Dentro do `<header>` ficam duas
  caixas brancas que abrem por cima da página: a gaveta da sacola (`.cartInfo .dropdown`, com a
  `.sacola-inner`) e os termos mais buscados (`.mostSearchedTerms`, o painel do campo de busca). Nas duas
  famílias medidas (lido no CSS do tema, 2026-10), os itens dos termos não têm cor de texto própria e herdam
  a do cabeçalho; a gaveta tem cor só na caixa (`color:#333`) e no nome do produto, e o resto dela herda.
  Uma cor clara no `header` apaga os termos; uma regra larga (`header a`, `header span`, `header *`) apaga
  também partes da gaveta. Pinte item por item: os links do menu e do cabeçalho, os ícones (na `modelo-1`,
  `.fill`, `catalogo-modelo-1.md`, 11; na `/dist`, ache com `quemPinta` a regra que pinta o SVG), o logo
  (abaixo) e a Barra do Topo. Confira na sua com a sacola aberta (vazia e com um produto dentro; este, sem
  mexer na sacola da pessoa) e com o painel de busca aberto: `quemPinta` (`medir-no-navegador.md`, 2) num
  item de cada painel e `varreduraContraste` (mesmo arquivo, 12) nesses estados. As sugestões que aparecem
  ao digitar (`.autocomplete-suggestions`) também são brancas, mas ficam fora do cabeçalho, no fim do
  `<body>` (seção 12, passo 2). A lista desses estados, e como abrir cada um na sua aba (inclusive a sacola
  com produto): seção 12, passo 10.
- **Fundo escuro mostra o que o branco escondia.** Um `margin-top:10px` do CSS da loja no primeiro filho do
  `<header>` vazava para fora dele (margem que colapsa) e abria uma faixa clara de 10px acima do cabeçalho do
  celular, invisível no tema claro. A correção foi trocar a margem por `padding` do próprio cabeçalho.
- **O logo é SVG inline** (Visual › Logo e Ícone). O tema antigo mirava `.logo g path`, e o SVG atual não
  tinha `<g>`: a regra parou de pegar sem ninguém ver. Leia o SVG e mire as classes dele. Se o logo for
  trocado no admin, revise o tema. Noutra loja, o SVG exportado de um editor trazia um `<style>` próprio com
  uma classe genérica (`.cls-1{fill:…}`): inline no HTML, esse `<style>` vale para o documento inteiro, e o
  mesmo SVG aparecia também no rodapé. Mire o lugar (`header .logo svg .cls-1`, e o do rodapé à parte), com
  especificidade maior que a classe sozinha, e confira que nenhum outro SVG da página usa a mesma classe
  (`mapa-do-admin.md`, seção 8).
- **A classe da etiqueta sai do nome, com acento.** Numa loja real, a etiqueta de campanha gerou uma classe
  com `ç`: uma etiqueta de código `preço-especial` gera `tag-preço-especial`. No CSS, use o escape `\0000e7`
  no lugar do `ç` (`.tag-pre\0000e7o-especial`), para não depender da codificação do arquivo. Se o nome da
  etiqueta mudar no admin, a classe muda junto (`catalogo-tema-base.md`, 5). Numa loja da família
  `modelo-1`, a cor da etiqueta vinha do cadastro num `style=""` no próprio elemento, que só `!important`
  vence; na `/dist` isso não foi conferido. Veja na sua:
  `document.querySelectorAll('.tags .tag[style]').length`.
- **Recurso novo de CSS em bloco único.** Regras com `:has()` e container queries foram para dentro de
  `@supports`: navegador antigo (iOS 15, Firefox < 121, Chrome < 105) fica com tudo ou nada, e não com metade
  das regras e a etiqueta torta.
- **Mudar a ordem das seções por CSS** (flex + `order` no `#area-body`) funciona, mas pede `flex:none` (uma
  coluna encolheu para 1px de altura), largura explícita (blocos esticaram até 2.575px no celular), e a ordem
  do Tab e do leitor de tela continua a do HTML. Se a ordem nova é para ficar, mova o bloco no construtor.
- **`#block-…` no CSS do tema é frágil.** Numa loja medida, a home era trocada a cada mês ou campanha (uma
  página nova com URL `/`, a anterior despublicada), e os ids mudavam; noutra, havia uma home só, a mesma
  desde o ano anterior. O perfil diz qual é o caso da sua (`mapa-do-admin.md`, seção 4). Nos dois,
  escreva de um jeito que, sem casar, nada quebre: só o espaçamento volta ao padrão.
- **Hover só com mouse**: `@media (hover:hover)`. No celular o efeito "grudava" depois do toque. Transições
  com `prefers-reduced-motion`.
- **Foco de teclado visível** sobre fundo escuro, com contorno branco: os temas das duas famílias medidas
  apagam o foco de vários botões (`outline:0`).

## 5. A barra promocional da agenda (`.promotionBar`)

Quando o item ativo da agenda tem `promotionBar`, o servidor manda uma barra pronta. Se ela funciona
depende da família do tema e dos CSS da loja.

### A barra da agenda depende da família do tema

Medido em duas lojas (2026-10):

- **Família `/dist` (medido numa loja).** Junto com a barra, o servidor manda um script inline que chama
  `countdown(…)`, uma função do `bundle.<hash>.js` do tema, e escreve os números nos elementos da barra. O
  estilo não vinha do tema (nem o `loja.<hash>.css` nem o `platform.<hash>.css` têm regra de
  `.promotionBar`): vinha de CSS da própria loja (o CSS da home e arquivos de tema). Sem esses CSS, a
  aparência dela não foi medida.
- **Família `modelo-1` (medido noutra).** Nenhum arquivo do tema (`platform` e `modelo-1`, CSS e JS) tem
  `countdown` ou `promotionBar`. A loja nunca tinha usado a agenda, então o HTML da barra não foi visto lá.
  Se o servidor mandar a mesma barra e o mesmo script, ela sai sem estilo nenhum, e o script dá erro
  (`countdown` não existe) dentro do `window.onReady`.
- **Um erro no `window.onReady` não fica só na barra** (plataforma: lido no `platform.<hash>.js`, o mesmo
  arquivo nas duas lojas, 2026-10; não executado). A plataforma roda as funções do `window.onReady` uma
  depois da outra, sem `try/catch`, no meio da inicialização da página: um erro numa delas impede as que vêm
  depois e o que a inicialização faria em seguida.

### Antes de oferecer a barra da agenda: ela funciona nesta família?

Vale para as opções a) e c) da seção 7, que ligam a `promotionBar` no item. Leia no perfil a linha "barra
da agenda". Se ela não estiver lá, meça antes de falar da barra com a pessoa (só leitura) e anote:

1. **O relógio.** No console de uma página da loja já carregada: `typeof window.countdown`. `"function"`:
   a função que o script do servidor chama existe. `"undefined"`: não existe, e ligar a barra dá o erro
   acima. Pelo `curl`, a pista é a mesma: `countdown` nos JS do tema.
2. **O estilo.** Conte `promotionBar` nos CSS do tema, no HTML da home (o SCSS de Personalização e o CSS da
   página vêm nele; se a barra estiver no ar hoje, o próprio HTML dela também conta: separe) e nos CSS da
   loja (`reconhecimento-da-loja.md`, 2f). Zero em todos: a barra sairia sem estilo.
3. **Anote no perfil:** "barra da agenda: funciona / não funciona nesta família", com a data, os números e
   onde estavam.

A contagem nos arquivos do tema, pelo `curl` e com o comando pronto, está em `reconhecimento-da-loja.md`,
2f ("A barra da agenda tem suporte no tema?"). O `typeof` do passo 1 é a prova mais direta: ele testa
exatamente a função que o script do servidor chama.

O que concluir:

- **Relógio e estilo:** as opções a) e c) da seção 7 estão disponíveis (a c, só com o HTML da barra visto
  na sua loja).
- **Relógio sem estilo:** a barra funciona, mas a aparência é sua (CSS preso à classe do tema), e a prévia
  mostra antes.
- **Sem relógio:** não ponha `promotionBar` no item. Se o servidor mandar o mesmo script da `/dist` (na
  `modelo-1` não foi visto), ele chama uma função que não existe, e nenhum estilo seu evita o erro. As
  opções são as da seção 7, "Numa família sem a barra da agenda".

### A estrutura, medida numa loja (família `/dist`)

Confira na sua, no HTML de computador e no de celular de um dia em que a barra está no ar:

```html
<a class="promotionBar" href="/ENDERECO-DO-TEMA?itm_midia=…">
  <div class="container"><div class="row">
    <div class="… onLeft …"> textLeft </div>
    <div class="… hidden-xs-down onMiddle …"> textMiddle </div>
    <div class="… onRight …"> Tempo restante: … .countdownDays .countdownHours .countdownMinutes .countdownSeconds (números em <b>) </div>
  </div></div>
</a>
```

- No computador ela fica logo abaixo da barra do menu; no celular, logo abaixo do cabeçalho (família
  `/dist`).
- **O link vem do tema e não muda pela agenda.** Na loja medida ele apontava para um endereço que dava 404.
  Para quem não roda JavaScript, só um redirecionamento desse endereço (no servidor, ou no CDN, se a loja
  tiver um, com quem cuida deles) resolve.
- **A contagem do tema vai até o `end` do item.** O script inline (contém `timetoPromotionBar`) lê o `end`
  sem fuso (`dayjs('AAAA-MM-DD HH:MM:SS')`, ou seja, no fuso do aparelho de quem visita). Se o `end` foi
  posto longe "por segurança", a barra mostra uma contagem que não termina em nada. No caso real: `end` no
  fim do ano e ~73 dias de contagem para uma campanha que acabava bem antes (seção 8).
- **Quem não roda JavaScript lê o texto do servidor.** O robô do Google, por exemplo, vê o `textMiddle`
  mesmo que um JS troque a barra para o visitante. Mantenha esse texto verdadeiro também.

### Antes de ligar a barra: leia o JS legado

A barra que o visitante vê é a soma de três coisas: o HTML do servidor, o CSS dos temas e o JS dos arquivos
do site. Numa loja real, configurar `promotionBar` na agenda **não mudava nada**, porque:

- um arquivo JS do site apagava a barra na carga, sem condição: `$(".promotionBar").remove();`;
- outras linhas do mesmo arquivo trocavam o link da barra por um endereço que dava 404, e de novo a cada vez
  que uma lista de produtos montava (evento `ProductList:instanciar`);
- outra linha reescrevia o conteúdo da barra com o texto da campanha do ano anterior;
- o CSS do tema antigo escondia a barra (`display:none` e `opacity:0`), e um `setTimeout` do JS punha
  `opacity:1` depois.

Tirar só a linha que apaga teria posto no ar o texto do ano anterior com link quebrado.

Como inspecionar, sem gravar nada:

1. Liste os `<script src>` do `<head>` no HTML servido e baixe cada um **com o mesmo número** que o `<head>`
   usa: é isso que o visitante recebe. Compare com o conteúdo da página Arquivo no admin (normalizando
   CRLF). Se divergirem, alguém editou sem subir o número, e o que está no admin não é o que está no ar.
2. Procure `promotionBar`, `countdown`, o nome da classe do tema e endereços de campanha. Anote linha e
   efeito de cada ocorrência.
3. Leve a lista à pessoa antes de mexer. Esses arquivos fazem outras coisas: no caso real, o mesmo arquivo
   tinha breadcrumb, links e textos do rodapé, troca de e-mail e o ano do copyright. Mude só as linhas da
   barra. O que funcionou: um script que gera o arquivo novo a partir do backup do arquivo no ar e, antes de
   trocar cada linha, confere que ela é exatamente a esperada, abortando se não for. Depois, um diff prova
   que o resto ficou idêntico.
4. Repare se o arquivo é chamado **sem** `defer`/`async` no `<head>`. Isso decide se ele consegue reservar
   a altura da barra antes da primeira pintura (seção 6).

## 6. Barra com fases e contagem num arquivo JS do site

Quando a campanha tem fases (Esquenta, depois Black, depois nada), a barra do servidor não basta: ela tem um
texto só e conta até o `end` do item. O padrão que funcionou numa loja real (família `/dist`) foi um bloco
no início do arquivo JS do site que já mexia na barra, refazendo o conteúdo dela de acordo com a fase. Onde
a barra da agenda não funciona (seção 5), os mesmos cuidados valem para uma barra toda sua, montada pelo seu
JS (seção 7, "Numa família sem a barra da agenda"): noutra loja, da família `modelo-1`, foi assim, com uma
fase só.

**Configuração no topo, em texto puro.** Quem vai editar na próxima campanha talvez não seja dev. Um bloco
com o link e a lista de fases, e um aviso de que dali para baixo não precisa mexer:

```js
var config = {
    link: '/pagina-da-campanha?itm_midia=barra-topo',
    inicio: 'AAAA-MM-DDT00:00:00-03:00',      // antes disto, nada aparece (horário de Brasília)
    fases: [
        {
            ate: 'AAAA-MM-DDT00:00:00-03:00',  // fim da fase, horário de Brasília (meia-noite do dia seguinte)
            esquerda: 'Esquenta',               // rótulo pequeno ('' = sem rótulo)
            destaque: 'Black Friday',           // em negrito
            meio: 'Uma frase curta e verdadeira', // só no computador
            contagem: 'O Esquenta termina em',  // computador (false = fase sem relógio)
            contagemCurta: 'Termina em'         // celular e janela estreita
            // link: '/outra-pagina'            // opcional: troca o link só nesta fase
        }
        // mais uma fase: copie o bloco { … }, ponha uma vírgula entre os dois e troque a data e os textos
    ]
};
```

O que importa, testado no caso real (e, onde está dito, noutra loja):

- **Fases por data de fim.** A fase atual é a primeira cujo `ate` ainda não passou; a seguinte começa
  quando a anterior acaba. Depois do `ate` da última, a barra e a classe do `<html>` saem sozinhas: ninguém
  precisa lembrar de desligar. Data inválida numa fase é ignorada, com aviso no console.
- **A barra só aparece a partir do início, e com o tema.** Só com datas de fim, a primeira fase vale assim
  que o JS vai ao ar: num Natal preparado em novembro, publicar o arquivo já põe a contagem de Natal no meio
  da Black Friday. Duas travas:
  - **um `inicio` na configuração** (exemplo acima), em todos os casos: antes dele, o bloco não monta barra
    nem põe a classe no `<html>`. Se faltar ou for inválido, o bloco não mostra nada e avisa no console (na
    dúvida, inerte). Na opção b da seção 7 não há classe de tema, e o `inicio` é a única trava;
  - **a classe do tema**, quando a barra é de um tema (opção c da seção 7). No caso real, o bloco só montava
    a barra com a classe do tema no `<body>` (e fora do carrinho e do checkout), e a reserva de altura no
    CSS também estava presa à classe.

  O `inicio` não foi medido no caso real (lá a trava era a classe): teste com o relógio simulado **antes**
  do início (sem barra, sem classe no `<html>`). Sem nenhuma das duas travas, publicar o JS já põe a barra
  no ar.
- **Fuso sempre explícito, `-03:00`.** `new Date('AAAA-MM-DDT00:00:00-03:00')` é o mesmo instante para todo
  mundo. Sem o fuso, a data é lida no fuso do aparelho: em Manaus a fase acabaria uma hora depois, em
  Fernando de Noronha uma hora antes, e fora do país, qualquer hora. (Brasília fica em -03:00 o ano todo
  enquanto não houver horário de verão; não há desde 2019.) Para "até o fim de 31/10", use a meia-noite do
  dia 1º e arredonde os segundos que faltam **para cima**: o relógio chega a zero na hora exata.
- **Textos escapados** (`&`, `<`, `>`, `"`) ao montar o HTML: a configuração é texto puro, e um `<`
  digitado não quebra a barra.
- **Classes novas com prefixo próprio** (ex.: `tb-…`) no lugar das do tema (`countdownDays` e companhia).
  O relógio do tema continua rodando, mas sem achar os elementos dele não escreve por cima. Medido (família
  `/dist`): os dois relógios rodando juntos, nenhum número trocado.
- **Tudo em `try/catch`.** Se algo der errado, a barra é apagada e o resto do arquivo segue. Um erro de
  sintaxe num arquivo JS derruba **todos** os scripts daquele arquivo, não só a barra. Valide antes de
  gravar (`node --check arquivo.js`). Se o seu código entra no `window.onReady`, o `try/catch` vai dentro da
  função: lá um erro para também as funções que vêm depois (seção 5).
- **Fora do carrinho e do checkout**: o link tiraria a pessoa da compra. Quando o carrinho é do tema, a
  exclusão é pelas classes `page-cart` e `page-checkout` do `<body>`, no JS e no CSS (medido numa loja).
  Quando o carrinho é outro sistema (Next.js: `<body>` sem classe nenhuma e sem os `<link>` do Código dentro
  do `<head>`; medido noutra loja, numa rota `/finalizar-compra/…`), o tema e a barra nem chegam lá. O
  reconhecimento (2d) diz qual é o caso (`mapa-do-admin.md`, seção 15). Mantenha a exclusão por classe no
  CSS e no JS mesmo assim: é inofensiva, e vale no dia em que o carrinho for do tema.
- **Altura reservada antes da primeira pintura.** O bloco roda no `<head>` (arquivo chamado sem `defer`),
  quando o `<body>` ainda não existe. Se há fase valendo, ele põe uma classe no `<html>` (ex.:
  `tb-barra-ativa`), e o CSS do tema reserva a altura da barra com ela: 44px no computador e 36px no celular,
  no caso real. Medido: 0 deslocamento de layout na carga, inclusive com a página chegando devagar (primeira
  pintura 1,5 s antes do JavaScript). O contrário também foi medido na mesma loja, num teste de reordenar a
  home com o mesmo truque de classe no `<html>`: posta depois de a página aparecer (por uma tag comum do GTM,
  por exemplo), a classe fez o conteúdo pular de uma vez, com deslocamento de 0,13 a 0,16; o limite "bom" do
  Google é 0,1 para a visita inteira. Se o seu arquivo é chamado com `defer`, a decisão da classe tem de ir
  num `<script>` pequeno no Código dentro do `<head>`, com o mesmo `inicio` e as mesmas datas das fases. Aí
  são dois lugares para manter iguais: anote isso no perfil e no comentário da configuração. Esse é o
  caminho para uma barra que não depende de classe nenhuma do servidor (opção b da seção 7). A regra geral
  de com ou sem `defer` (e o teste de `document.readyState` que deixa o mesmo arquivo funcionar no `<head>`,
  com `defer` e na prévia) está em `ajustes-visuais.md`, 2.6 (h); aqui ficam as razões próprias da barra.
- **Barra de um tema da agenda: a vaga pode ser reservada só por CSS.** A classe do tema já vem no `<body>`
  do HTML do servidor, antes de qualquer script. O CSS do tema, preso a essa classe, pode reservar a vaga da
  barra desde a primeira pintura (`body.sua-classe … {min-height:…}`, ou o espaço que a contagem vai ocupar
  numa faixa que já existe), e aí o JS pode ser `defer`. Para o JS não montar a contagem quando o CSS não
  está no ar (um gravado sem o outro), use um "aperto de mão": o CSS declara uma variável num elemento que
  só ele pinta (`body.sua-classe .sua-barra{--sua-barra-ok:1}`), e o JS só monta se
  `getComputedStyle(elemento).getPropertyValue('--sua-barra-ok').trim() === '1'`. Medido numa loja da
  família `modelo-1` (2026-10), na prévia: a contagem entrou numa faixa que já existia sem mudar a altura
  dela; no ar não foi medido. O `inicio` e a classe continuam sendo as travas de data.

  **O aperto de mão pode ir nos dois sentidos.** O de cima protege o caso "só o JS no ar". O contrário, "só
  o CSS no ar", deixa a vaga reservada vazia (ou um elemento escondido à espera do JS que não veio). Para
  fechar os dois: a variável do CSS libera o JS, e a reserva do CSS só vale com uma classe que o JS põe no
  `<html>` ao carregar e tira quando decide não agir ou num erro (no `catch`):
  `html.sua-marca-js body.sua-classe …`. Assim, cada peça sozinha não muda nada. Medido numa loja da
  família `/dist` (2026-10), num par CSS + JS que levava um elemento do tema para outro lugar: na prévia, só
  o CSS deu 0 diferenças, e só o JS, 0 diferenças e nada movido; no ar, gravado um passo de cada vez, nenhum
  passo mudou o site antes da troca no `<head>`. O custo do segundo sentido: a classe tem de estar no
  `<html>` antes da primeira pintura, então o JS vai sem `defer` (`ajustes-visuais.md`, 2.6 (h)). Quando a
  vaga não muda nada sozinha (a contagem entra numa faixa que já existe, sem mudar a altura dela, como no
  caso medido acima), o primeiro sentido basta, e o JS pode ser `defer`. Não é receita só de barra: vale
  para qualquer par CSS + JS (`ajustes-visuais.md`, 2.6 (g)).
- **Computador e celular recebem HTML diferente** do servidor (`body.isMobile` / `body.notMobile`;
  plataforma, nas duas famílias medidas). No celular: uma linha só, sem a frase do meio, com o texto curto da
  contagem. Medido no caso real: cabe a partir de 340px de largura, e abaixo de 350px o rótulo sai.
  Algarismos tabulares (`font-variant-numeric: tabular-nums`) para a barra não mudar de largura a cada
  segundo.
- **Contagem com segundos é conteúdo que se mexe sozinho.** O critério 2.2.2 do WCAG (pausar, parar,
  ocultar) pede, para informação que se atualiza sozinha ao lado de outro conteúdo, um jeito de pausar,
  parar ou esconder, ou de controlar a frequência da atualização. Mostre as opções à pessoa: sem segundos (a
  contagem muda uma vez por minuto: menos movimento, mas ainda se atualiza sozinha); segundos só para quem
  não pediu "reduzir movimento" no sistema (`prefers-reduced-motion`; numa loja, a pessoa escolheu este); um
  botão de pausar ou esconder, que é o que atende o critério de forma direta. A decisão é dela; anote no
  perfil. Em qualquer caso, não ponha `aria-live` no relógio: o leitor de tela anunciaria cada mudança. Uma
  contagem mais visível (maior, mais forte) também é escolha dela: numa proposta de estilo, ela entra
  desligada, como opção (`criterios-de-design.md`, 4). Se ela escolher, lembre-a da escolha dos segundos em
  uma linha, com o motivo, e mantenha a decisão dela; anote no perfil que ela foi lembrada.
- **Ir ao ar pela metade não quebra.** O JS e o CSS ficam em páginas Arquivo diferentes, e alguém pode
  gravar um sem o outro. Desenhe para isso: no caso real, CSS novo com JS antigo deixava a barra apagada,
  JS novo com CSS antigo deixava a barra escondida, e nada pulava nos dois casos (testado). A barra só
  aparecia com os dois. Um jeito geral de garantir isso é o aperto de mão (acima, "Barra de um tema da
  agenda").
- **Relógio do aparelho.** A contagem usa a hora do aparelho de quem visita; aparelho com hora errada vê a
  contagem errada. É aceitável para uma barra; não use isso para liberar preço.
- **Teste com relógio simulado.** Deixe a hora atrás de uma função (`api.agora = window.__previaAgora ||
  function () { return Date.now(); };`; o `window.__previaAgora` é como o favorito de prévia fixa a hora,
  `previa.md`, "JS na prévia") e, no teste, troque por datas fixas. Confira 1 segundo antes do `inicio` (nada), cada
  fase, a troca na hora certa e a saída depois da última. No caso real: a fase 1 batia com o cálculo até a
  meia-noite de Brasília; com o relógio no meio da fase 2, o texto dela; 1 segundo depois do fim, barra e
  classe do `<html>` fora. Console sem erros e sem rolagem lateral em todas as larguras.
- **Medir cliques**: um parâmetro no link (`?itm_midia=barra-topo`) ou o seletor da barra (ex.:
  `a.promotionBar.tb`) numa tag do GTM.
- **Mexer nos cards (preço, selo) é outro trabalho.** Um JS de tema que muda os cards depois da carga (o
  preço maior, um selo) precisa pegar também os cards que chegam depois (vitrines por XHR, clones do
  carrossel), sem o preço pular na tela, e cancelar cada agendamento com a função certa:
  `ajustes-visuais.md`, 2.6; para medir o pulo do card que chega depois, `medir-no-navegador.md`, 14. Um
  selo de % calculado é, além disso, conteúdo (seção 8).

A prévia da barra precisa do **mesmo** bloco do arquivo que vai ao ar, não de uma cópia reescrita. No caso real,
o mesmo script gerava o arquivo JS e o favorito de prévia a partir da mesma fonte, e conferia que o bloco
era idêntico nos dois.

Para editar as fases depois: página Arquivo do JS › trocar datas e textos › mostrar à pessoa › Confirmar ›
reabrir e comparar › Limpar cache na linha › número novo no `<head>` › cache de configuração (pergunte
antes, ou faça se a pessoa pediu). Cuidado com aspas e vírgulas: é o erro de sintaxe que derruba o arquivo
inteiro.

## 7. A Barra do Topo do admin (Visual › Cabeçalho)

Configurações › Visual › Cabeçalho › **Mostrar Barra do Topo?** (`headerTopBarShow`) e **Texto na Barra do
Topo** (`textoHeaderTopbar`).

- **HTML fixo, sem datas.** Igual em todas as páginas, sem início nem fim: alguém precisa desligar quando a
  campanha acabar. Combine quem e quando, e anote no perfil.
- Onde ela fica depende da família. Família `/dist` (medido numa loja): `.inner-body > .header-top-bar`,
  antes do `<header>`; lá, os estilos dela vinham do SCSS de Personalização e de um CSS do cabeçalho chamado
  no `<head>`. Família `modelo-1` (medido noutra): no computador, dentro do cabeçalho,
  `.inner-body > .header-container > .header-top-bar`; no celular, que não tem `.header-container`,
  `.inner-body > .header-top-bar` (`catalogo-modelo-1.md`, 1). Confira na sua, nos dois aparelhos, com a
  barra ligada: `[...document.querySelectorAll('.header-top-bar')].map(e => e.parentElement.className)`.
- **Fixa ou não ao rolar, conforme a família.** Na `/dist` ela não fica fixa: some junto com a página
  (simulado numa loja real; a pessoa decidiu não fixar). Na `modelo-1`, no computador, ela vai junto com o
  `.header-container`, que é fixo onde o `<body>` tem `use-floating-header` (na loja medida, só na home) e
  rola com a página nas outras.
- **Um JS legado pode sequestrar o clique.** Na loja medida, um JS do cabeçalho mandava qualquer clique na
  barra para um endereço fixo de uma campanha antiga. Procure `header-top-bar` nos JS do site antes de pôr link.
- Na loja medida, o campo guardava barras de campanhas antigas comentadas (`<!-- … -->`). Não apague esse
  histórico sem pedir; mexa só na parte ativa.
- É configuração da loja: backup do valor, mostrar à pessoa, `Confirmar`, reabrir e comparar, cache de
  configuração (pergunte antes, ou faça se a pessoa pediu). Por script, as chaves `headerTopBarShow` e `textoHeaderTopbar` passam pelas mesmas funções e
  travas da agenda (`gravacao-arquivo-e-head.md`, "Os outros campos"); ou a pessoa cola à mão e você confere
  antes e depois, relendo o campo e comparando pelo sha.

### Qual barra para qual pedido

Um pedido como "uma barra no topo com contagem até 24/12" parece um só e tem três respostas. Antes de
oferecer a opção a) (ou a c), confira no perfil se a barra da agenda funciona nesta família; se não estiver
medido, meça (seção 5; `reconhecimento-da-loja.md`, 2f e 2i) antes de falar dela com a pessoa. Oferecer e
depois voltar atrás custa a confiança dela e o tempo dos dois. Antes de escolher, faça também duas
perguntas, porque as duas mudam a data que vai no código:

- **"Até 24/12 à 00:00 ou às 23:59, horário de Brasília?"** "Até 24/12" é ambíguo, e a contagem chega a zero
  numa hora exata.
- **"O que acaba em 24/12?"** O preço, o frete grátis, o brinde, a entrega antes do Natal? A contagem precisa
  terminar em algo real (seção 8).

| Opção | Onde aparece | Até quando conta | Bom para | Cuidados |
|---|---|---|---|---|
| **a) `.promotionBar` da agenda**, sem JS (seção 5) | na família `/dist` (medido numa loja), logo **abaixo do menu** no computador (não no topo) e abaixo do cabeçalho no celular; noutra família, onde o tema puser (meça) | até o `end` do item, que é também quando o tema sai; lida no fuso do aparelho de quem visita | campanha com tema e data, sem código novo | **Só se o perfil diz que a barra da agenda funciona nesta família** (seção 5); senão, b) ou uma barra toda sua (abaixo da tabela). `end` = fim da contagem; se o tema deve durar além disso, um **segundo item, consecutivo e sem `promotionBar`** (o `start` dele logo depois do `end` do primeiro, sem sobreposição: qual vence não foi medido). Se o item inerte mostrou que o servidor lê as datas fora de Brasília, a opção a) não acerta as duas coisas: corrigir o `end` pela diferença faz a contagem do visitante errar pela mesma diferença; nesse caso, use b) ou c), com `-03:00`. O link vem do tema e pode dar 404 (seção 5). A barra do servidor só existe com o item no ar. A prévia é um mock: um `--js` que monta o mesmo HTML da seção 5 no mesmo lugar (abaixo do menu no computador, abaixo do cabeçalho no celular), com os textos do item (`previa.md`). Diga à pessoa que o relógio, o link e a posição exata só se confirmam no ar, e espere o "aprovado" sobre esse mock. Leia antes os JS da loja que mexem nela: o mock entra depois deles e não mostra o que eles fazem |
| **b) Barra do Topo + contagem num Arquivo JS novo** | **acima do cabeçalho**, no topo de verdade | até a data escrita no JS, com fuso `-03:00` | "no topo", com contagem, sem depender da agenda | criar o Arquivo e publicá-lo são pedidos da pessoa (`ajustes-visuais.md`, 5.6); ligar no `<head>` **sem `defer`**; tudo em `try/catch`; um `inicio` no JS, para a linha no `<head>` poder ir antes sem mostrar nada; sai sozinha depois da data; altura reservada por uma classe no `<html>` antes da primeira pintura (seção 6); a posição da Barra do Topo muda com a família (acima); a Barra do Topo em si não tem data: alguém liga na data combinada e desliga no fim (combine quem; seção 9, passo 6b) |
| **c) JS que reescreve a `.promotionBar`** (seção 6) | onde a `.promotionBar` aparece (a) | por fases, cada uma com a sua data em `-03:00` | campanha com fases (Esquenta, Black) e um JS da loja que já mexe na barra | também liga a `promotionBar` no item: **só onde a barra da agenda funciona** (seção 5), porque o script do servidor roda junto, e só com o HTML da barra visto e medido na sua loja; o padrão da seção 6 inteiro: `inicio` e classe do tema como travas, mesmo bloco no arquivo e na prévia, relógio simulado, fora do carrinho e do checkout |

Sem contagem nem data, o caso é mais simples: a Barra do Topo para um aviso fixo (frete, cupom,
atendimento), ligada e desligada à mão.

### Numa família sem a barra da agenda

Quando a seção 5 mostra que a barra da agenda não funciona (sem relógio), a) e c) ficam de fora, e o item da
agenda vai sem `promotionBar`. Sobram:

- **b)**, como na tabela: Barra do Topo e contagem num JS seu, com datas em `-03:00`, sem depender da
  agenda.
- **Uma barra toda sua, presa ao tema.** A contagem num JS do tema, montada num lugar que você escolhe e
  mede (no topo, numa faixa que já existe, ou num elemento novo), com o CSS e o JS presos à classe do tema:
  ela só existe enquanto o item da agenda vale, e o `inicio` e o fim no JS seguem sendo as datas da
  contagem. Numa loja da família `modelo-1` (2026-10, até a prévia) foi assim: a contagem entrou na Barra do
  Topo, que já estava ligada, com a vaga reservada por CSS preso à classe e o JS `defer` com o "aperto de
  mão" (seção 6, "Barra de um tema da agenda"). A Barra do Topo continua sem data: o texto dela é o mesmo
  antes e depois da campanha, e só a contagem vem e vai com o tema.

Os dois pedem tudo o que a seção 6 pede (travas, fuso, `try/catch`, relógio simulado, o mesmo bloco no
arquivo e na prévia), e criar os Arquivos novos é pedido da pessoa (`ajustes-visuais.md`, 5.6).

## 8. Urgência honesta

Contagem regressiva, "até X% OFF" e preço "de/por" convencem porque o visitante acredita neles. Num tema
sazonal é fácil pôr no ar um número que não é verdade sem ninguém ter decidido isso: uma data posta longe
"por segurança", um banner reaproveitado do ano passado. O seu papel é **apontar, com números, e deixar a
decisão com a pessoa**. Não recuse o trabalho e não reescreva a oferta por conta própria.

Casos vistos numa loja real (o mecanismo; os números eram daquela campanha):

- **Contagem que recomeça todo dia.** O cronômetro de uma vitrine de "ofertas do dia" contava até um horário
  fixo e, passada a hora, somava 24 h; os produtos e os preços eram os mesmos dias seguidos.
- **Contagem até a data técnica.** A barra da agenda contava até o `end` do item, posto longe "por
  segurança", para uma campanha que acabava bem antes (seção 5).
- **Contagem de fase cujas ofertas continuam.** "O Esquenta termina em" sugere que os preços acabam ali. Se
  eles seguem na fase seguinte, a contagem promete uma perda que não existe. A sugestão levada à pessoa:
  amarrar a contagem a algo que de fato acaba (um benefício só daquela fase) ou contar para o começo da
  próxima ("A Black Friday começa em").
- **"Até X%" que o destino não entrega.** A home tinha mais de dez promessas diferentes de "até X%"; o maior
  desconto real do catálogo era bem menor que o maior prometido, e o mesmo destino aparecia com percentuais
  diferentes no celular e no computador.
- **Percentual calculado no card** (noutra loja, da família `modelo-1`, 2026-10). Um selo "-N%" que o tema
  ou o seu JS calcula a partir do "de" e do "por" do card é uma promessa, como o "até X%": diga sobre qual
  preço ele é calculado. Com a chave `layoutPriceMethod` = `pix` (configuração da loja; chave da
  plataforma, medida nessa loja), o preço principal do card, o "por", é o do PIX/boleto, e não o do
  cartão: o % passa o desconto de quem paga no cartão. Medido lá: ~3,6 pontos a mais, em média, em 77
  cards (listas, busca e vitrine); um produto com ~4% de desconto no cartão mostraria -8%; alguns produtos
  só ganhavam selo por causa do desconto do PIX; e a página do produto, aberta pelo card, não mostrava
  esse número.
- **Selo de garantia sem regra.** Um selo de "preço garantido" em vários banners, a etiqueta em quase nenhum
  produto, e a regra da garantia não estava escrita no site.

O que conferir antes de ligar um tema:

- Toda contagem termina em algo real (fim de preço, de frete, de brinde), na data certa, igual no computador
  e no celular.
- Todo "até X%" bate com o maior desconto que o visitante encontra **no destino daquele banner**. Calcule a
  partir da vitrine ou lista de destino, não do banner do ano passado.
- O texto do servidor (`textMiddle` da agenda) também é verdadeiro: é o que lê quem não roda JavaScript.
- Selo ou etiqueta de campanha está em **todos** os produtos que têm a condição, e a regra está escrita numa
  página que o selo ou o banner leva.
- Preço de referência ("de") é preço praticado de verdade. Subir o "de" pouco antes da campanha para o
  desconto parecer maior é a "metade do dobro", prática que órgãos de defesa do consumidor costumam autuar.
  Se a pessoa mencionar algo assim, sinalize o risco com clareza. Isso não é parecer jurídico: a decisão, e a
  consulta a quem cuida do jurídico da loja, é dela.
- **Selo de % calculado: sobre qual preço.** Antes de calcular, leia o `layoutPriceMethod` da loja
  (`mapa-do-admin.md`, 1; só leitura: mudá-lo troca o preço que todo card mostra). Com `pix`, as opções
  para a pessoa são: calcular sobre o preço do cartão (o total do parcelado no card), escrever "no PIX"
  junto do selo, ou não mostrar selo. O padrão é desligado até ela escolher, mesmo quando um rascunho, um
  agente auxiliar ou uma síntese o traz ligado. Arredonde para baixo (8,9% vira -8%, nunca -9%) e meça o
  "(N% OFF)" do próprio tema, que pode arredondar diferente: numa loja, para o mesmo produto, o selo
  arredondado para baixo dava -8%, e o "(9% OFF)" do tema, que a loja escondia nos cards, 9%.

## 9. Checklist de lançamento

**Antes de gravar qualquer coisa**

- [ ] Perfil da loja lido; a pessoa nomeou cada alvo: o `#` da página Arquivo do tema, o `#` do JS da barra
  (se houver), o item da agenda e as datas.
- [ ] Combinado quem limpa o cache de configuração, e quando.
- [ ] Backups locais, com data no nome: o `<head>` (texto exato), a agenda inteira com sha256, o conteúdo
  atual de cada página Arquivo que vai mudar (o do admin e o servido) e, se a barra for a Barra do Topo, o
  `textoHeaderTopbar` inteiro e o valor de `headerTopBarShow`.
- [ ] Arquivo do tema: sem a classe, 0 diferenças contra o site de hoje (só prova algo enquanto a classe não
  está no ar: linha abaixo); se for cópia de um tema antigo, 0 diferenças contra ele antes das correções;
  checagens do script de montagem (prefixo idêntico à versão no ar, chaves, seletores presos à classe, LF).
- [ ] A classe já está no ar (o item da agenda vale hoje)? Então gravar = lançar: a trava é a prévia
  aprovada e uma página que não deveria mudar, e o "sim" da pessoa vale para agora (seção 3, "Quando a
  classe do tema já está no ar").
- [ ] Duas peças (CSS + JS): cada uma sozinha dá 0 diferenças (prévia de cada uma na sua aba), com o aperto
  de mão de `ajustes-visuais.md`, 2.6 (g) (seção 6, "Barra de um tema da agenda"); a ordem de gravar em
  `gravacao-arquivo-e-head.md`, "Mudança em duas peças: a ordem".
- [ ] Conferido com a classe ligada em home, listas (categoria, busca, página da campanha), produto,
  carrinho (se for do tema), conta e rodapé, no computador e no celular, nas larguras de
  `ajustes-visuais.md`, 4.1 (no computador, 1920, 1366 e 1280 sempre; 1024 e ~1100 nos casos de lá), e na
  configuração de quem aprova (a janela, o zoom e o `devicePixelRatio` dela, no perfil;
  `medir-no-navegador.md`, 13): contraste, sem rolagem lateral a mais do que havia antes, console sem erros
  novos. Os endereços que são outro sistema (`mapa-do-admin.md`, seção 15) ficam como estão, e a pessoa
  sabe disso.
- [ ] Fundo escuro no miolo: o roteiro da seção 12 seguido, inclusive a varredura de contraste.
- [ ] Tema que muda cor (fundo escuro, também só no cabeçalho): os estados do passo 10 da seção 12 abertos
  e varridos; os pendentes, ditos à pessoa e anotados no perfil.
- [ ] Barra: JS legado lido e alterado só no que é da barra (diff); `inicio` e fases com `-03:00`; relógio
  simulado antes do `inicio` (nada aparece) e nas viradas; fora do carrinho e do checkout (por classe,
  seção 6); 0 deslocamento na carga; sintaxe validada.
- [ ] JS que agenda e cancela (a barra, um JS que mexe nos cards): cada cancelamento usa a função do
  agendamento (`cancelAnimationFrame` para `requestAnimationFrame`, `clearTimeout` para `setTimeout`),
  reconferido depois de qualquer troca; desligar deixa 0 restos (`ajustes-visuais.md`, 2.6).
- [ ] Se a barra é a da agenda (opção a ou c da seção 7): o perfil diz que ela funciona nesta família
  (seção 5), com a data da medida.
- [ ] Contagem com segundos: a decisão da pessoa sobre pausar, esconder ou tirar os segundos (seção 6),
  anotada no perfil.
- [ ] Urgência honesta conferida (seção 8), inclusive sobre qual preço um selo de % é calculado, e os
  pontos levados à pessoa.
- [ ] Prévia mostrada e aprovada pela pessoa.

**Ordem para pôr no ar.** Cada passo só é seguro sozinho se o que ele grava estiver inerte: o arquivo do
tema sem a classe no `<body>`, o JS da barra com um `inicio` no futuro (e, na opção c da seção 7, preso à
classe do tema), a Barra do Topo desligada. Antes de cada passo, diga à pessoa se ele muda o site agora; se
mudar, é lançamento, e precisa do "sim" para essa data. Com a classe do tema já no ar, o passo 1 não é
inerte: é o lançamento (seção 3, "Quando a classe do tema já está no ar"). Numa mudança em duas peças (CSS
e JS), a ordem e a prova de cada passo estão em `gravacao-arquivo-e-head.md`, "Mudança em duas peças: a
ordem". Para levar texto grande ao admin e conferir por sha dentro da página, use o transporte de
`gravacao-arquivo-e-head.md` (e as lições de `mapa-do-admin.md`, seção 6). Cada limpeza do cache de
configuração ou da home, abaixo, segue o combinado: pergunte antes (ou faça, se a pessoa pediu).

1. Página Arquivo do tema: colar › Confirmar › reabrir e comparar com o arquivo local › Limpar cache na
   linha. Sem a classe no ar, o site não muda; com ela, muda agora (seção 3).
2. Página Arquivo do JS, se houver: o mesmo. Com o `inicio` no futuro (e, na opção c, a trava da classe),
   o site não muda; numa mudança em duas peças, o aperto de mão também segura (seção 6). Se o Arquivo do JS
   é novo, criá-lo e publicá-lo são pedidos explícitos da pessoa, que nomeiam o botão e a página
   (`ajustes-visuais.md`, 5.6; a receita em `gravacao-arquivo-e-head.md`); sem a linha no `<head>`, ele não
   muda o site.
3. `<head>`: a linha nova (`?v=1`) ou os números novos, numa gravação só. Confira que, fora das linhas
   trocadas, o texto ficou idêntico (mesmo comprimento, mesma string).
4. Cache de configuração da loja (pergunte antes, ou faça se a pessoa pediu). Confira que o arquivo servido
   é o novo (baixe a URL com o número do `<head>` e compare o sha com o local, normalizado) e que o site
   continua igual: sem a classe e sem a barra.
5. Se a pessoa quiser ver o tema servido antes: a classe no `body_class` da página de teste (seção 3a).
6. Agenda: o item com as datas combinadas › Confirmar › reabrir e comparar › cache de configuração
   (pergunte antes, ou faça se a pessoa pediu). Com o `start` já valendo, é aqui que o tema aparece; com o
   `start` no futuro, só na virada ("Item com início no futuro", abaixo).
   - **6b. Barra do Topo** (opção b da seção 7): `textoHeaderTopbar` com o HTML aprovado › Confirmar ›
     reabrir e comparar. Se `headerTopBarShow` já está `"true"` (outro aviso no ar), trocar o texto já muda
     o site: é lançamento, e vai na data combinada. `headerTopBarShow` = `"true"` só na data combinada: ela
     não tem data, e ligada antes aparece antes. Depois, cache de configuração (pergunte antes, ou faça se
     a pessoa pediu). Combine e anote no perfil quem liga e quem desliga.
7. "Limpar cache" na linha da home no ar: a página publicada com URL `/`. Confira qual é: numa loja medida
   ela mudava a cada campanha (o perfil diz se a sua tem uma só). Não é a linha que você gravou: pergunte
   antes (ou faça, se a pessoa pediu). Na loja medida, a home precisou disso além do cache de configuração.
8. Espere o cache das páginas: o `max-age` do HTML que o perfil anotou (medido: 5 min na home, nas duas
   lojas). Onde há CDN na frente (perfil; `reconhecimento-da-loja.md`, 2b), uma query qualquer
   (`/?nc=123`) passa por fora da cópia da borda, e a borda guarda separado por User-Agent: confira
   computador e celular. Sem CDN identificado, a query só passa por fora do cache do seu navegador.

**Conferência no ar**

**Item com início no futuro** (o caso comum: Natal preparado em novembro). A conferência no ar só vale
depois do `start`. Combine com a pessoa, e anote no perfil, quem olha o site em cada virada (o `start`, o
`inicio` da barra, cada troca de fase, o fim da contagem e o `end`) e a que horas. Nessa hora: `Limpar
cache` na linha da home no ar (passo 7; confira de novo qual é, e pergunte antes, ou faça se a pessoa
pediu), espere o cache das páginas (passo 8) e confira a classe no `<body>` e a barra no computador e no
celular. Até lá, diga à pessoa que o que foi gravado ainda não aparece no site.

- [ ] Home, categoria, produto, carrinho (se for do tema), busca e a página da campanha, no computador e no
  celular: a classe no `<body>`, o arquivo novo carregado (com o número certo), a barra na fase certa, nada
  pulando.
- [ ] Prints de antes e depois guardados.
- [ ] Perfil da loja atualizado: o que mudou, onde estão os backups, como voltar.
- [ ] Fim da campanha combinado: o que some sozinho (agenda, fases da barra) e o que alguém precisa
  desligar à mão (Barra do Topo, banners, etiquetas). Cada etiqueta com data, hora (alinhada com a hora em
  que a classe sai de fato, no fuso medido: seção 2) e quem desliga, anotados no perfil (seção 4, "Etiqueta
  como gatilho, agenda como interruptor").

## 10. Checklist de volta atrás

Do mais rápido ao mais completo. Em todos os casos: mostre à pessoa o que vai gravar, grave, reabra e
compare, peça a limpeza do cache de configuração (ou faça, se a pessoa pediu), espere o cache das páginas (e
o da CDN, onde houver) e confira no ar como no lançamento.

| Problema | Como voltar |
|---|---|
| O tema novo está ruim e é preciso o do ano anterior agora | agenda: `bodyClass` do item volta para a classe antiga. Só funciona se o arquivo antigo continua chamado no `<head>` |
| É para desligar o tema | agenda: `end` do seu item no passado, trocando só esse trecho (seção 2). Colar o backup inteiro só se a agenda ainda for exatamente a que você gravou (`await conferirCampoAtual('skin', '<sha normalizado da agenda nova>')`) |
| Uma versão do arquivo do tema saiu errada | colar a versão anterior na página Arquivo › Limpar cache na linha › **número novo** no `<head>` (ex.: voltar da v7 para a v6 usando `?v=8`) |
| O JS da barra quebrou algo | colar o backup do arquivo JS › Limpar cache na linha › número novo no `<head>`. O CSS da barra pode ficar: sem o JS, ele não faz nada |
| O `<head>` ficou errado | desfaça só a sua troca: confira que o `<head>` no admin ainda é o que você gravou (`await conferirHeadAtual('<sha normalizado do head novo>')`), troque no sentido contrário (linha acrescentada: `gravacao-arquivo-e-head.md`, "Desfazer") e, onde a troca era um número, use um número **novo**, nunca o antigo. Se o `<head>` não for mais o que você gravou, alguém mexeu depois: mostre a diferença à pessoa antes de gravar |
| A Barra do Topo precisa sair | `headerTopBarShow` = `"false"` (troca só desse valor), ou desfazer a sua troca no `textoHeaderTopbar` › cache de configuração (pergunte antes, ou faça se a pessoa pediu) |
| Uma etiqueta da campanha continua ativa depois do `end` (o selo voltou ao lugar e ao desenho de sempre) ou apareceu antes do `start` | quem ficou combinado (seção 4, "Etiqueta como gatilho, agenda como interruptor") desliga o `Ativo` da etiqueta em Loja On-line › Tags (`mapa-do-admin.md`, seção 16), na data e na hora anotadas no perfil. O cadastro é conteúdo da pessoa; nenhum arquivo seu muda |

- **Número novo, sempre.** Ele garante que o navegador (e o CDN, onde houver) busque o que está na origem
  agora. Um número já usado pode estar guardado com o conteúdo de outro momento (de uma edição feita sem subir
  o número, por exemplo).
- **Voltar atrás nunca precisa de `Excluir`.** Nem de `Publicar` ou `Despublicar`, a não ser que a pessoa
  peça.
- Depois de voltar, registre no perfil o que aconteceu e qual versão ficou no ar.

## 11. O que anotar no perfil da loja

Na parte de temas do perfil (`~/.claude/panorama-lojas/<slug-da-loja>.md`; modelo em
`assets/perfil-da-loja.md`):

- a família do tema e os arquivos dele, com o hash e a data (`reconhecimento-da-loja.md`, 2i), e a ordem
  da cascata medida (2e);
- barra da agenda: funciona / não funciona nesta família, com a data, os números de `countdown` e
  `promotionBar` e onde estavam (seção 5);
- os endereços que são outro sistema e não recebem o tema nem a classe (`mapa-do-admin.md`, seção 15);
- arquivos de tema: `#`, URL, classe, se estão chamados no `<head>` e com qual número;
- arquivos JS que mexem na barra ou testam a classe do tema: `#`, URL, linhas e o que fazem;
- etiquetas que o tema estiliza ou que uma regra sua usa como gatilho: código, ID, se está ativa, a classe
  gerada, onde o CSS a usa, e quem desliga cada uma e quando (data, hora e fuso; seção 4, "Etiqueta como
  gatilho, agenda como interruptor");
- onde está o backup da agenda e o sha; resumo dos itens (nome, classe, janela);
- a home no ar hoje (`#` e nome), se a loja costuma ter uma home por campanha ou uma só, e como achar a
  próxima;
- quem limpa o cache de configuração; o `max-age` medido do HTML e dos Arquivos; se há CDN na frente (pelos
  cabeçalhos), quanto tempo ela guarda as páginas e quem cuida dela; quem cuida do GTM;
- o calendário da campanha e as decisões da pessoa (ex.: "não fixar a Barra do Topo", "não mudar a ordem da
  home por enquanto", "contagem com segundos, sem eles com reduzir movimento", "a arte escura dos banners
  fica para depois", "texto decorativo da campanha só na home");
- histórico das versões que foram ao ar (data, número no `<head>`, sha) e o caminho de volta de cada uma;
- se a chave `skin` existia antes do primeiro item (agenda nunca usada: "ausente em AAAA-MM-DD");
- o que o item inerte mediu (fuso do servidor, formato aceito, efeito do `namespace`) e as respostas do
  suporte da Panorama;
- num tema de fundo escuro, as caixas claras sem cor de texto própria que a varredura achou e onde (seção
  12), para a próxima campanha começar por elas;
- os estados da seção 12, passo 10: quais foram conferidos (com a data e como foram abertos), quais ficaram
  pendentes e se a pessoa sabe dos pendentes;
- o `layoutPriceMethod` lido (qual preço o card mostra em destaque) e a decisão da pessoa sobre um selo de
  % calculado: desligado, sobre o preço do cartão ou com "no PIX" (seção 8);
- a configuração de quem aprova: a janela em px CSS, o zoom do navegador no site e o `devicePixelRatio`,
  com a data e como foi medida (`medir-no-navegador.md`, 13).

O perfil fica fora da pasta da skill de propósito: são dados de uma loja, e a skill é a mesma para todas.

## 12. Fundo escuro no miolo: o roteiro

Escurecer as bordas (Barra do Topo, cabeçalho, rodapé) é o pedido comum, e as lições da seção 4, o passo 4
abaixo (os estados do cabeçalho e as caixas brancas dentro dele) e os estados do passo 10 que ficam dentro
do cabeçalho bastam.
Escurecer o miolo, o fundo das páginas, mexe no contraste de tudo o que a plataforma, o tema e a loja
desenham, inclusive em telas que ninguém abre na revisão. O roteiro abaixo foi seguido numa loja da família
`modelo-1` (2026-10, até a prévia; não foi ao ar). O que está marcado "nas duas famílias medidas" apareceu
também na loja da família `/dist`; o resto, meça na sua.

**Em dois tempos** (`previa.md`, "Fluxo em dois tempos"). No rascunho rápido entram a paleta, os passos 1 a 3
(quem pinta o branco, a cor do texto no `#area-body` e a camada padrão), a varredura das páginas dos
prints-chave (`rodada.mjs --medir`) e, na mensagem, o que já se sabe dos passos 6 e 7 (arte clara nas imagens,
endereços de outro sistema que continuam claros). Os passos 4, 5 e 8 a 10 (os estados, todas as telas, o
tamanho, "sem a classe" e o que abre por cima da página) são da revisão profunda, só da versão que a pessoa
gostou.

Antes de escrever, defina a paleta (fundo da página, superfície dos cartões, linha, texto, texto secundário,
títulos, link, campos e a cor da marca) e meça o contraste de cada par. Se a pessoa já deu cores ou um guia de
marca, a paleta parte deles; se não, num pedido grande ela vai no rascunho como proposta sua, nomeada na
mensagem ("o que eu decidi sem você ter pedido", `previa.md`, "Mandar para a pessoa"), e a pessoa a corrige na
opinião dela, sem uma ida e volta antes do primeiro print. O contraste se mede como em
`criterios-de-design.md`, 2 (`contraste`, `medir-no-navegador.md`, 8). Uma cor de marca escura costuma
servir como fundo de botão ou selo com texto branco, e não como texto ou link sobre o fundo escuro (numa
loja: 2,1:1 como link, 8,9:1 como fundo de botão com texto branco).

1. **Quem pinta o branco.** O fundo branco da página vem do `platform.<hash>.css`
   (`body{background-color:#fff}`; plataforma, nas duas famílias medidas). Na loja medida, `.inner-body`,
   `#area-body` e os blocos do construtor eram transparentes, e algumas páginas tinham fundo próprio (a de
   login, cinza claro). Pinte o `body`, preso à classe do tema, e confira em cada tipo de página, com
   `quemPinta` (`medir-no-navegador.md`, 2), quem ainda pinta fundo claro: containers do tema, regras da
   loja (SCSS e Arquivos) e fundos postos em blocos do construtor.
2. **A cor do texto vai no `#area-body`, não no `body`.** Ficam fora do miolo a gaveta da sacola
   (`.sacola-inner`) e os termos mais buscados (`.mostSearchedTerms`), os dois dentro do `<header>`, as
   sugestões que aparecem ao digitar na busca (`.autocomplete-suggestions`, no fim do `<body>`) e o aviso
   de cookies (`#lgpd-message`), nas duas famílias medidas; e, quando aparecem, o pop-up do construtor
   (`#blockModal`, `.novaJanela`, criado por script da plataforma) e o aviso do app no celular
   (`#app-message`), medido numa loja. Eles continuam em caixa branca: com a cor clara no `body`, o texto
   deles herdaria o claro e sumiria (a lista da família `modelo-1`: `catalogo-modelo-1.md`, 15). Confira
   também onde fica o rodapé: numa loja, na home, um bloco do construtor deixava um `div` aberto e o
   `<footer>` caía dentro do `#area-body`; lá, a camada padrão (passo 3) usou
   `:where(#area-body > :not(footer))` para pular o rodapé, que tinha cores próprias.
3. **Uma camada padrão de peso mínimo.** Links, botões, campos, check e radio, linhas (`hr`) e tabelas do
   miolo, com `:where()`: `body.sua-classe :where(#area-body) :where(a:not(.btn)){color:#RRGGBB;}` pesa só o
   que pesa `body.sua-classe` (0,1,1). Qualquer regra mais específica do tema, da loja ou das suas seções
   seguintes vence sem `!important`. O que se mostrou útil nessa camada, na loja medida:
   - `color-scheme:dark` nos campos, check e radio: as partes nativas (a seta e a lista do `select`, a
     marca do check) acompanham o escuro;
   - preenchimento automático: `:-webkit-autofill` com uma sombra interna da cor do campo e
     `-webkit-text-fill-color`, senão o navegador volta a pintar o campo de claro;
   - foco: anel branco com halo escuro (`outline:2px solid #fff;box-shadow:0 0 0 4px #000`), que aparece no
     escuro e sobre foto clara;
   - hover só com mouse (`@media (hover:hover)`), como na seção 4.

   Depois dela, seções por tipo de página (listas, produto, conta…) tratam o que a camada não pega.
4. **Os estados do cabeçalho, um por um.** O catálogo da família, seção 1, diz quantos são. Na `modelo-1`
   (medido numa loja), no computador: a home no topo (`use-floating-header` no `<body>`, cabeçalho
   transparente sobre o banner, sem `.scrolled`), a home rolada (`.scrolled`, posto por script) e as outras
   páginas (cabeçalho estático); no celular, sem `.header-container`. O SCSS da loja pintava o estado do topo
   com `!important`, e só `!important` venceu. Para chegar a cada estado na sua aba: `scrollTo(0, 400)` e
   espere, ou ponha e tire a classe `.scrolled` só para medir (`catalogo-modelo-1.md`, 1). Em qualquer
   família, não pinte o texto do cabeçalho inteiro: a gaveta da sacola e os termos mais buscados
   (`.mostSearchedTerms`) ficam dentro dele, em caixas brancas, e as sugestões que aparecem ao digitar
   (`.autocomplete-suggestions`) vão para o fim do `<body>` (o autocomplete do `platform.<hash>.js` usa
   `appendTo: document.body`), também em caixa branca e fora de `#area-body` (passo 2;
   `catalogo-modelo-1.md`, 15). Os outros estados que abrem por cima da página, e como chegar a cada um na
   sua aba, estão no passo 10.
5. **Varredura de contraste em todas as telas, inclusive as que o reconhecimento não baixou.** Com a prévia
   ligada, rode `varreduraContraste` (`medir-no-navegador.md`, 12) em cada tipo de página e em cada estado:
   formulário enviado com erro (os balões de validação `.validatorLog`, criados pelo JS da plataforma; como
   chegar a eles sem enviar dado: passo 10), conta (logada: peça à pessoa que entre; você não digita
   senha), acompanhamento de pedido, consulta de pedido sem login, avaliações da loja, contato, páginas
   institucionais, carrinho (se for do tema), menus e gavetas abertos (passo 10). O risco maior é a cor
   herdada: numa loja, as caixas que sumiram eram caixas claras do tema **sem cor de texto própria**, que
   herdavam o texto claro do miolo (os balões de validação, as linhas pares da lista de avaliações da loja,
   as faixas do acompanhamento de pedido, a consulta avulsa de pedido). Nenhuma estava nas páginas baixadas:
   só uma segunda revisão, procurando de propósito o que podia quebrar, as achou. Anote no perfil as que
   achar (seção 11).
6. **Imagens com fundo claro desenhado na arte** (banner, bloco de categoria) não escurecem por CSS, e
   filtro (`invert`, `brightness`) estraga a cor de produto e de marca (ele serve para logo de fundo
   transparente: `catalogo-tema-base.md`, 11). Trocar a arte é conteúdo da pessoa: ofereça que ela suba uma
   versão escura no admin e mostre na prévia como fica com a arte de hoje. Numa loja, três blocos de
   categoria da home tinham fundo claro na arte.
7. **Endereços de outro sistema continuam claros.** O carrinho, o checkout ou outras rotas em Next.js
   (`mapa-do-admin.md`, seção 15) não recebem o tema nem a classe. Diga à pessoa, antes da aprovação, que
   nessas páginas o site continua claro, e mostre um print de uma delas junto com os da prévia: ir de uma
   página escura para um carrinho claro é o que o visitante vai ver.
8. **Tamanho.** Um tema escuro completo fica grande: numa loja, ~95 KB com os comentários de trabalho, e o
   favorito da prévia passou de 99 mil caracteres; a variante mais estilizada do mesmo tema, 122 KB e ~139
   mil (o gerador avisa acima de ~55 mil; o que pesa em cada parte: `previa.md`, "O gerador"). Antes de
   publicar, gere a versão de publicar, sem os comentários de trabalho (`montar_tema.py --publicar`; seção
   4, "O arquivo é servido cru"). Num arquivo novo, a prévia sai dela, e é sobre ela que a pessoa aprova: o
   sha aprovado é o do arquivo que vai ao ar (`previa.md`, "Grave exatamente o que foi aprovado"), e o
   histórico guarda também o da versão de trabalho. Numa versão nova de um tema no ar (`--base`), a prévia
   da pessoa é a de acréscimo, e você confere 0 diferenças contra o arquivo inteiro (`ajustes-visuais.md`,
   5.2).
9. **"Sem a classe, 0 diferenças", com contraprova.** Como em todo tema (seção 4, passo 4). Se a prévia
   dispara `resize` (`--resize`, seção 3b), uma diferença pode vir do resize e não do CSS: desligue só o
   `<style>` da prévia e compare de novo antes de mexer no CSS (`medir-no-navegador.md`, 9). Numa loja, as 7
   diferenças do primeiro teste eram todas do resize.
10. **Os estados que abrem por cima da página, um por um.** Gavetas, painéis, menus, avisos e pop-ups só
    aparecem quando alguém clica, digita, passa o mouse ou chega pela primeira vez: não estão nas páginas
    baixadas nem no primeiro print, e escapam da revisão (seção 4). O que fica dentro do `<header>` herda a
    cor do cabeçalho: abra cada um com o tema ligado, também num tema que só escurece as bordas. Os
    seletores abaixo foram lidos numa loja da família `modelo-1` (2026-10); "plataforma" quer dizer que vêm
    do `platform.<hash>.css` ou `.js`, e "duas famílias", que apareceram também na `/dist`. Noutra família,
    meça.

    | Estado | Onde fica | Como abrir na sua aba |
    |---|---|---|
    | sacola vazia | `.cartInfo .dropdown` (com a `.sacola-inner`), dentro do `<header>`; aberta, ganha a classe `show`, posta pelo `platform.<hash>.js` (duas famílias) | um clique no ícone da sacola; outro clique fecha |
    | sacola com produto | o mesmo lugar, com os itens | muda a sessão da pessoa: veja "Sacola com produto", abaixo da tabela |
    | termos mais buscados | `.mostSearchedTerms`, dentro do `<header>` (duas famílias) | um clique no campo de busca, sem digitar |
    | sugestões ao digitar | `.autocomplete-suggestions`, no fim do `<body>` (plataforma, duas famílias) | duas ou três letras no campo de busca, sem enviar nem escolher uma sugestão (a escolha abre o produto); elas aparecem meio segundo depois (`modelo-1`); apague depois |
    | megamenu (computador) | `.megamenu`, mostrado pelo `:hover` do item (`.is-megamenu:hover .megamenu`; `modelo-1`) | passe o mouse pela ferramenta (`hover`): `:hover` não se liga por script. Para medir parado, uma regra só na sua aba que mostra o megamenu de um item, dita como simulação |
    | menu lateral (celular) | `.inner-body > .menuBar` e o `.menuOverlay`, fora do `<header>`; aberto, `menu-aberto` no `<body>` e no `<html>` (`modelo-1`; a classe vem do `platform.<hash>.js`) | no HTML de celular, um toque no botão do menu (`a.menu`) |
    | filtros das listas (celular) | `filter-aberto` no `<body>` (`modelo-1`) | no HTML de celular, numa lista, o botão de filtros (`a.filter-btn`) |
    | aviso de cookies | `#lgpd-message`, dentro de `#lgpd-overlay`, fora de `#area-body` (plataforma, duas famílias) | só aparece para quem ainda não aceitou: veja "Avisos de primeira visita", abaixo |
    | aviso do app (celular) | `#app-message` (estilo da plataforma; visto num celular de verdade, numa loja) | o mesmo cuidado do de cookies ("Avisos de primeira visita", abaixo); só no celular, e só onde a loja oferece app |
    | pop-up do construtor | `#blockModal.type-builder`, posto no fim do `<body>` pelo `Ergo.modal` (plataforma) | abre sozinho depois dos segundos do bloco (`automatic_opening_time`, no script da página) ou por uma ação, conforme o bloco: veja "Pop-up do construtor", abaixo |
    | janelas da plataforma (erro, confirmação, resposta da newsletter) | `.novaJanela_overlay` com `type-alert` ou `type-window`, também no fim do `<body>` pelo `Ergo.modal` (plataforma) | quase sempre vêm depois de um envio: veja "Janelas e balões", abaixo |
    | balões de validação | `.validatorLog`, criados pelo JS da plataforma, dentro de `#area-body` | aparecem num formulário enviado com erro: veja "Janelas e balões", abaixo |

    - **Sacola com produto, e os outros estados que mudam a sessão da pessoa.** Com a extensão, a sua aba
      usa a sessão dela: a sacola, o login e o aceite de cookies são dela. Pôr um produto na sacola não é
      compra, mas muda o carrinho dela. Pela ordem de preferência: um render local ou uma simulação na sua
      aba (diga que é simulação); uma sessão que não é a dela (peça antes também: pôr na sacola ali pode
      contar nas medições da loja, não medido); um print que ela mesma tira; e, só com o OK
      dela para essa ação, no navegador dela: ponha um item, confira, tire o que pôs e confira que a sacola
      voltou ao que era. Nunca vá além da sacola: sem checkout, sem pagamento, sem login, sem dado de conta
      ou de entrega (`SKILL.md`, regra zero; `previa.md`, "Conferir você mesmo antes de mandar", "Estados
      que mudam a sessão da pessoa"). Numa loja, a sacola com produto ficou sem conferir por isso: diga à
      pessoa que ficou pendente.
    - **Avisos de primeira visita (cookies e app).** O aceite do aviso de cookies fica no `localStorage` do
      site (`aceiteLgpd`), e o aviso volta 30 dias depois do aceite (lido no script da página, nas duas
      famílias medidas, 2026-10). Não apague cookie nem armazenamento do site no navegador dela: use uma
      sessão que não é a dela (o painel do aplicativo é outro navegador) ou peça um print numa janela
      anônima. Na sua aba, pôr a classe `lgpd-message-opened` no `#lgpd-message` simula a abertura (lido no
      script e no `platform.<hash>.css`, não executado: confira, e diga que é simulação).
    - **Pop-up do construtor.** Com `opening_recurrence` = `once` no script do bloco, fechar o pop-up grava
      um cookie (`hideModal`, 365 dias), e quem já fechou pode não vê-lo de novo (lido no script da página,
      numa loja; não medido). Não apague esse cookie: espere o tempo numa sessão que não é a dela, ou peça
      um print.
    - **Janelas e balões que vêm de um envio.** Não envie formulário, nem vazio, sem o OK da pessoa, e não
      digite dado nenhum (nem e-mail, nem CEP). Peça a ela que mostre, ou simule na sua aba e diga que é
      simulação. Para as janelas, a função da plataforma que monta a de erro só desenha na página:
      `Ergo.error({titulo: 'Simulação', subTitulo: 'texto de teste'})`, fechada com `Ergo.close('error')`
      (lido no `platform.<hash>.js`, 2026-10: sem `request.url`, o `Ergo.modal` não chama o servidor; não
      executado: confira no painel de rede que nada saiu).

    Em cada estado aberto: `quemPinta` num item (`medir-no-navegador.md`, 2) e `varreduraContraste` (mesmo
    arquivo, 12). Anote no perfil quais foram conferidos (com a data e como foram abertos) e quais ficaram
    pendentes (seção 11); os pendentes vão para a pessoa antes do "aprovado". O que fica fora de
    `#area-body` em cada família: `catalogo-modelo-1.md`, 15, e `catalogo-tema-base.md`, 10 e 14.

O resto é como em qualquer tema: a prévia e o "aprovado" da pessoa antes de gravar (`previa.md`), o arquivo
isolado preso à classe (seção 4), o lançamento e a volta atrás (seções 9 e 10).
