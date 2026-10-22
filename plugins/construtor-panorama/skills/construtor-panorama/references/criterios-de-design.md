# Critérios de design para ajustes visuais

Quatro partes, com pesos diferentes. A primeira depende da marca e se pergunta. A segunda é regra para toda
loja: acessibilidade e uso. A terceira diz o que não é seu para decidir. A quarta é o roteiro de uma
proposta de estilo, quando o pedido é mudar a linguagem visual do site, e não um detalhe.

## 1. O tom da marca: pergunte

Cada loja tem a sua cara, e "bonito" não é critério. Antes de propor um estilo, pergunte à pessoa, em
perguntas fechadas:

- **O tom.** Sóbrio ou chamativo? Quanto de cor de destaque? (Mostre duas prévias se ela não souber dizer.)
- **As cores e fontes da marca.** Meça as que o site já usa (`medir-no-navegador.md`, 5, e a seção 12 do
  catálogo da família do tema: `catalogo-tema-base.md` ou `catalogo-modelo-1.md`) e confirme com ela quais
  são as oficiais. Anote no perfil, em "Medidas do tema desta loja".
- **O que a marca não quer.** Emoji em título, palavras pintadas de outra cor no meio da frase, brilho em
  botão, animação. Alguém da loja costuma ter uma opinião forte sobre isso.
- **Quem mais precisa aprovar** (a agência, o marketing).
- **Pedido vago** ("escuro nas bordas", "mais moderno", "com cara de Black"): proponha uma leitura e **nomeie
  cada interpretação** que você fez sem ela ter pedido (o menu suspenso também fica escuro? a faixa da
  newsletter vai na cor da marca?), cada uma visível num print. Assim a aprovação cobre todas, ou ela corrige
  a que não queria (`previa.md`, "Mandar para a pessoa"). Se o pedido é mudar a linguagem visual inteira, e
  não um detalhe, siga a proposta de estilo da seção 4.

**Um exemplo de tom, de uma loja real.** O pedido foi "premium e sóbrio". Os critérios que saíram dele,
para mostrar o tipo de decisão, não para copiar:

- sem brilho: sombra colorida sem deslocamento (`0 0 11px 4px` na cor de destaque) em hover lia como efeito
  genérico; no lugar, elevação discreta (3px e sombra escura com deslocamento), só em `@media (hover:hover)`
  (no celular o hover gruda depois do toque);
- sem emoji em título e subtítulo, e sem palavra pintada de outra cor no meio da frase: negrito bastava;
- a cor de destaque da marca só para preço, desconto e botão de ação ("se tudo é vermelho, nada é");
- um estilo de título por aparelho (no resultado medido: 26px/600 no computador, 21px/600 no celular, todos
  alinhados à esquerda) e um ritmo de espaço entre seções (80px no computador, 48px no celular), no lugar de
  4 estilos, 3 alinhamentos e espaços de 15 a 130px;
- a mesma borda esquerda para etiqueta, nome, estrelas e preços dentro do card.

Outra loja pode querer o contrário, e vale a marca. O que vale sempre é a coerência: um estilo de título,
um ritmo de espaço, poucas cores de destaque, decididos uma vez e anotados no perfil.

## 2. Legível e usável: regra para toda loja

- **Contraste**, a regra da skill (os outros arquivos apontam para cá). Meça todo texto cuja cor **ou** cujo
  fundo muda, inclusive um elemento levado para outro fundo (uma etiqueta que sai de cima da foto e vai para
  o fundo branco). Mínimos: **4,5:1** para texto normal; **3:1** para texto grande (a partir de 24px, ou
  18,66px em negrito); 3:1 também para uma borda ou um contorno, mas só quando é ele que deixa perceber o
  componente (a borda de um campo, o contorno de um botão sem fundo: WCAG 1.4.11), não para um contorno
  decorativo. Meça o computado (`medir-no-navegador.md`, 8), não a cor do arquivo, e diga os números à pessoa
  (medido numa loja, 2026-10, numa etiqueta movida: o texto, 18,9:1; um contorno decorativo, 4,2:1). Pares
  medidos: `#7c8096` sobre branco = 3,9:1 (reprova) › `#666a7c` = 5,4:1; branco sobre um vermelho de botão
  escuro = 4,86:1; link `#e23b40` sobre fundo escuro = 4,1:1 (reprova) › branco sublinhado. Num tema que muda
  fundo ou cor de texto, varra a página inteira (`medir-no-navegador.md`, 12): a caixa branca que herda o texto
  claro é o defeito mais comum.
- **Não dependa só da cor**: link sublinhado.
- **Foco de teclado visível** em tudo que é clicável (`:focus-visible` com contorno de 2px): branco sobre fundo
  escuro; da cor de destaque dentro de cartões brancos, onde o branco não apareceria.
- **Área de toque**: no mínimo 24x24px (WCAG 2.5.8), 44px de altura nos botões principais do celular. Aumente
  a área com um `::after` transparente sem mudar o desenho, e confira que ela não encosta em outro alvo.
- Respeite `prefers-reduced-motion`: sem `transition`/`transform` de enfeite para quem pediu menos movimento.
- **O que se mexe sozinho por mais de 5 s** ao lado de outro conteúdo (contagem com segundos, carrossel
  automático, faixa que rola) precisa de um jeito de pausar, parar ou esconder (WCAG 2.2.2). Mostre as opções
  à pessoa (sem segundos; segundos só sem "reduzir movimento" no sistema; um botão de pausar) e deixe a
  decisão com ela; anote no perfil (`temas-sazonais.md`, 6).
- **Nada pula**: altura reservada para o que chega depois (seções 7 e 9 do catálogo da família), classes de
  layout antes da primeira pintura, e a vaga de um elemento que um JS leva para outro lugar
  (`ajustes-visuais.md`, 2.6, itens f e g). Quando a mudança mexe na primeira pintura, meça o deslocamento na
  carga antes e depois (`medirCLS`, `medir-no-navegador.md`, 15): nenhum a mais do que havia.
- **Tamanho real, não só o do CSS.** Texto pequeno e acento de fonte de título se conferem em px reais
  (tamanho do CSS × `devicePixelRatio`), e o zoom do navegador e a escala da tela mudam esse número
  (`medir-no-navegador.md`, 13). O caso medido, um acento que muda de desenho abaixo de ~50px reais, está em
  `catalogo-tema-base.md`, 14.

## 3. O que não é seu para decidir

CSS muda aparência; conteúdo é da pessoa: os textos, os itens de menu, as etiquetas e **a arte das imagens**
(banner ou bloco de categoria com fundo claro desenhado na imagem não escurece por CSS, e filtro estraga a cor
do produto e da marca: ofereça que ela suba uma versão nova no admin e mostre na prévia como fica com a arte
de hoje). Se, medindo, você achar uma promessa que o site não cumpre (banner prometendo mais desconto do que o
maior desconto real do catálogo, cronômetro que zera todo dia, vitrine de "baixaram de preço" com produtos que
não baixaram, selo de garantia sem regra escrita), **leve o achado com os números** e deixe a decisão com ela.
Não esconda nem reescreva por CSS. Os casos e o que conferir antes de um tema de época estão em
`temas-sazonais.md`, seção 8.

**Texto decorativo da campanha** posto por CSS (o `content` de um `::before`), repetido acima de cada vitrine
ou lista, também é conteúdo: quanto e onde é decisão da pessoa. Mostre as opções em prints rotulados (em
todas as vitrines, só na home, em nenhuma). Ele não está no HTML: não conta como texto da página para a busca
nem para a tradução do navegador, e o leitor de tela o lê, a não ser que ele tenha texto alternativo vazio
(`catalogo-tema-base.md`, 14).

**A primeira tela do celular.** Levar um elemento para outro lugar pode tirá-lo da primeira tela (o que se
vê sem rolar), ou pôr outra coisa no lugar dele. Medido numa loja (2026-10): no celular, uma etiqueta levada
de cima da foto para junto do preço foi parar abaixo das fotos e das opções de cor, fora da primeira tela.
Para cada opção, mostre a primeira tela do celular antes e depois e diga o que sai dela e o que entra; a
escolha é da pessoa.

**Problemas que já existem no site.** Defeitos achados de passagem, que não são do pedido (um botão que não
recebe foco pelo teclado, rolagem lateral causada pelo tema, uma coluna vazia no rodapé, o cabeçalho cobrindo
parte do banner), não se corrigem sem pedido: leve à pessoa com o número medido e anote no perfil, em "Manias
do tema desta loja". Eles são também a linha de base dos seus testes: meça antes de ligar a prévia
(`medir-no-navegador.md`, 6), para não atribuir à sua mudança o que já estava lá, nem esconder o que ela
piorou.

## 4. Proposta de estilo: mudar a linguagem visual

**Quando.** A pessoa pede para "estilizar o layout", "ser mais agressivo", "deixar mais moderno" ou "mudar a
cara do site", ou quer uma variante de um tema já aprovado que mexe na tipografia, no ritmo das seções, nos
cards, nas setas, no menu ou no preço. Não é um ajuste pontual (uma cor, um botão): é uma linguagem visual
nova, e há mais de uma resposta boa. Por isso você mostra opções, e ela escolhe.

**O que fica fixo antes de desenhar:**

- **A marca**: cores, fontes e logo, medidos e confirmados com ela (seção 1).
- **O que ela já aprovou ou disse que gostou** (o fundo de uma versão anterior, um cinza, uma contagem): não
  muda calado. Se uma direção mexe nisso, a mudança entra na lista "o que mudou", abaixo.
- **O conteúdo** (seção 3): nenhuma direção liga selo de %, texto novo, contagem maior ou cor fora da marca.
  Se uma direção pede um deles, ele entra desligado e aparece só como opção, num print rotulado.

**Duas ou três direções.** Cada uma com uma tese de uma frase e a lista do que ela muda. As três de uma loja
(2026-10), como exemplo do tipo de diferença, não para copiar:

| Direção | Tese | O que muda |
|---|---|---|
| varejo | força de campanha, de loja de oferta | faixas e selos que já existem, mais fortes; cor da campanha em mais lugares (selo ou texto novo é conteúdo: entra desligado) |
| editorial | o produto em destaque, como numa revista | tipografia grande, ritmo das seções, menos caixa e borda |
| brilho | luz e destaque sem mexer no layout | brilho, linhas e cor de destaque; a estrutura fica igual |

Cada direção é um conjunto de seções próprio, com o mesmo escopo das outras (`ajustes-visuais.md`, 0 e 2.3):
no modo de época, preso à classe do tema; no modo permanente ("mais moderno" ou "mudar a cara do site" fora
de uma campanha), sem classe nenhuma (não invente uma: `ajustes-visuais.md`, 0) e escopado por aparelho,
tipo de página e região. Renderizado nas mesmas páginas e larguras das outras (a matriz de
`ajustes-visuais.md`, 4.1), com o conteúdo desligado.
Onde renderizar: a prévia na sua aba, ou um render local de cópias do HTML (`ajustes-visuais.md`, 4.2;
`ferramentas-de-navegador.md`, 4), que compara direções sem tocar no site no ar nem nas abas da pessoa.

**A régua.** Dê a cada direção uma nota de 1 a 10 em cada critério, com uma linha de motivo:

| Critério | A pergunta |
|---|---|
| marca | parece a loja? as cores, as fontes e o tom continuam os dela? |
| força da campanha | dá para ver de longe que é a campanha? (no modo permanente: o que ela pediu, o "mais moderno" ou o "mais ousado", aparece de longe?) |
| legibilidade | contraste medido (`medir-no-navegador.md`, 8 e 12); tamanhos reais (seção 2); palavras acentuadas em caixa alta nos títulos (`catalogo-tema-base.md`, 14); a faixa de 1024 a ~1100px (`ajustes-visuais.md`, 4.1) |
| robustez | no modo de época, tudo preso à classe e "sem a classe, 0 diferenças" (enquanto a classe não está no ar; com ela no ar, os outros testes da 4.1); numa mudança em CSS e JS, cada peça sozinha dá 0 (`ajustes-visuais.md`, 2.6, item g); no permanente, tudo escopado por aparelho, tipo de página e região, e 0 diferenças numa página que não devia mudar (`ajustes-visuais.md`, 4.1); não mexe em altura de card nem em carrossel sem precisar; o tamanho do arquivo, que vai para todo visitante |
| risco de conteúdo | o que a direção acrescenta que é conteúdo (um selo, um texto repetido, uma contagem maior), e se está desligado |

Numa loja (2026-10), as notas da avaliação foram: a direção de varejo levou 9 em força e 5 em marca; a
editorial, 9 em marca e 7 em força; a de brilho, 9 em robustez e 5 em força. Nenhuma ganhou em tudo, e é por
isso que a pessoa precisa ver as três.

**A síntese.** A versão que você recomenda é uma direção com enxertos nomeados ("a editorial, com a faixa de
benefícios da de varejo": restilizar uma faixa que já existe; texto novo nela é conteúdo e vai para
"Decisões da pessoa", desligado). Ela vem com duas listas obrigatórias:

1. **O que mudou em relação ao que a pessoa já viu ou aprovou.** Visto numa loja: a síntese deixou só a home
   em preto puro, e o resto continuou no cinza escuro que a pessoa tinha aprovado. Nomeie cada mudança e
   mostre as duas no print (`previa.md`, "Mandar para a pessoa", parte 3).
2. **Decisões da pessoa.** Cada item de conteúdo, com o padrão desligado: o selo de % (e sobre qual preço ele
   é calculado: `temas-sazonais.md`, 8), um texto decorativo repetido (onde: seção 3), uma contagem maior ou
   com segundos (seção 2), uma cor fora da marca.

**Mostre as opções, não só a vencedora.** Mande um conjunto de prints de cada direção e da síntese, nas mesmas
páginas, larguras e rolagem, com o nome da opção no arquivo e na legenda, e a linha da régua de cada uma. Ela
escolhe: a síntese, uma direção pura ou a mistura que ela pedir. Gosto é dela. A aprovação nomeia uma versão
só (`previa.md`, "Aprovação, gravação e conferência"). Visto numa loja: só os prints da vencedora foram
mandados, e a pessoa não viu as outras duas para comparar.

**Agentes auxiliares** (subagentes que geram, avaliam ou revisam direções) trabalham só com cópias locais e
renders locais: nunca no admin, nunca nas abas da pessoa, e não gravam nada. O que eles entregam é rascunho.
Confira contra o perfil da loja e contra as regras da skill antes de mostrar. Visto numa loja (2026-10): a
síntese de um agente veio com o selo de % ligado, desligado só depois da revisão, e mandava limpar o cache
de uma CDN que a loja não tem (o perfil dizia que não havia CDN identificada).

**Depois da escolha**, o caminho é o de sempre, nesta ordem: a versão que vai para o admin montada por script
(`montar_tema.py --publicar`, `ajustes-visuais.md`, 5.2), a prévia gerada dela (`previa.md`), o "aprovado"
sobre ela (o sha aprovado é o da versão de publicar) e a gravação. Não gere a prévia da versão comentada para
montar a de publicar só depois do "aprovado": aí o arquivo que vai ao ar não é o que ela viu, e a aprovação
tem de ser pedida de novo (`previa.md`, "Grave exatamente o que foi aprovado").
