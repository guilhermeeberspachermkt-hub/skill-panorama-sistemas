# Imagens e banners: subir arte nova e trocar a que está no ar

Medido em 2026-11-06 em duas lojas, chamadas aqui de **loja A** (família `/dist`) e **loja B** (família
`modelo-1`). Na loja A a pessoa da loja conduziu o admin e a skill só leu; na loja B a skill fez o caminho
inteiro, a pedido da pessoa: tipo de banner novo, três artes, clone da home, cache e conferência no HTML
servido. Os números citados (tamanhos, contagens, tempos) são medições; os identificadores (ids, códigos,
nomes de pasta) de cada loja ficam no perfil dela. Até a versão 1.3.0 este caminho não estava mapeado.

Nas duas, a home medida é servida pelo site antigo (twig): banners em `owl-carousel` e (na loja A, onde se
procurou) sem `__NEXT_DATA__`. Numa página do site novo (React/Next), o banner chega pronto no `bannerlist`,
com o arquivo no tamanho-base do tipo (`blocos.md`, bloco `banner`, "Como o renderizador do site novo
(React) consome o banner"). Ali, o que as seções 2, 6 (item 5) e 7 dizem do HTML e do tamanho servido não
foi medido: meça antes de prometer tamanho ou nitidez.

## 0. Primeiro, de quem é a decisão

A **arte** de um banner, o **texto** dela, o **nome** (que vira o texto alternativo da imagem, seção 3), o
**link** e as **datas** de entrada e saída são conteúdo, e conteúdo é da pessoa (`SKILL.md`, "Como falar
com quem não é desenvolvedor"). A skill sabe **o caminho**: confere o cadastro, diz em que tamanho a arte
tem de sair, aponta o risco (um "até X%" que não bate com o destino, uma proporção que vai deformar, uma
imagem que vai sair borrada no celular) e, com o pedido da pessoa, faz os passos no admin. Ela não escolhe
sozinha a imagem nem o texto.

Vale a regra de sempre: abrir para ler é permitido, a saída é por `Cancelar`, e antes de gravar vêm o
backup, a prévia (numa mudança que se vê) e o "sim" (`SKILL.md`, regra zero). `Excluir` aqui é
especialmente caro: uma arte apagada não volta, e a grade de Mídias pode ter dezenas de milhares de linhas
(25 mil na loja A, já sem as fotos de produto). Para tirar uma arte do ar, prefira **Situação = Pausado**;
não conte com a Data Final (seção 8).

**O que é o backup aqui.** Quase nada nestas telas é um campo de texto para copiar. Por isso o backup é o
estado que a gravação muda, salvo num arquivo local na pasta de backups do perfil, com a data no nome:

- **Criar** um Tipo de Banner, uma Mídia, um clone ou uma arte num tipo que você acabou de criar: não há
  valor antigo a guardar. Antes de abrir o `Incluir`, com nenhum diálogo aberto (`SKILL.md`, "O caminho
  comum", passo 1), mostre à pessoa a lista escrita de cada registro a criar: o tipo (loja, nome, código e
  Tipo de Mídia); cada arte (nome, link, ordem, datas, situação e arquivo); cada mídia (arquivo e tipo). O
  "sim" dela sobre essa lista é o pedido para esses `Incluir` e os `Confirmar` deles. Criar **página** é
  outra regra: o clone pede um pedido à parte, que nomeie o botão e a página (seção 4). Depois, anote o `#`
  de cada registro no perfil (seção 3, passo 7). Para desfazer: uma arte vai para Situação = Pausado (pelo
  `Alterar`, o que não foi medido: seção 3, "Trocar só a arte"); um tipo ou uma mídia sem uso pode ficar
  onde está; `Excluir` nunca é da skill (se a pessoa quiser apagar, ela clica, e você confere depois).
- **Criar, pausar ou alterar uma arte num tipo que já existia** (o atalho "Trocar só a arte", no fim da
  seção 3, e o caminho (b) da seção 4): trate o tipo como em uso por uma página no ar. O backup é a lista
  das artes dele, lida na grade de Banners com os filtros Loja = a sua e Cód. Tipo de Banner. `Contém`
  também pega códigos parecidos: confira o `bantip_codigo` exato (por script, seção 9). De cada arte,
  guarde `ban_id`, Nome, Link, Ordem, Situação, Data Início e Data Final, mais o `src` da imagem no HTML
  servido. Confira de novo logo antes de gravar: se mudou, outra pessoa mexeu, e você conversa antes.
- **Trocar o tipo, a mídia ou o tamanho de um bloco** numa página que já existia (o caminho (a) da seção 4,
  a troca da imagem de um bloco imagem da seção 3b): o backup é o `Blocos:` da página (`construtor.md`,
  seção 0, "Backup do `Blocos:`"). Anote junto o que o painel mostra, que é o que a pessoa reconhece: Tipo
  de Banner; Mídia, com id e nome; Tamanho personalizado; Tamanho da Mídia; Largura × Altura; Link. A mídia
  antiga continua no acervo enquanto ninguém a exclui: o id dela basta para voltar.

Em todos os casos, antes do "sim", diga as quatro coisas da `SKILL.md`: o que muda, em quais páginas e
aparelhos, quem vê e como desfazer.

## 1. Os cinco cadastros, e como um alimenta o outro

```
Tipos de Mídia ──┬─> Tamanhos dos Tipos de Mídia   (as resoluções cadastradas de cada tipo)
                 │
                 ├─> Mídia (o arquivo)  ──────────────> bloco imagem (uma imagem só, escolhida na página)
                 │
                 └─> Tipo de Banner ──> Banner (arte + link + ordem + datas) ──> bloco banner
```

| Cadastro | Onde fica | O que guarda |
|---|---|---|
| **Tipos de Mídia** | Único › Mídia › Tipos de Mídia (ou a lupa do campo Tipo, em Adicionar Mídia) | A classificação das imagens: `#`, Nome e **Código**. O código entra na URL do arquivo (seção 2). **Muda de loja para loja**: 18 tipos na loja A, 12 na loja B, com nomes diferentes. Nunca suponha pelo nome: leia (seção 5) |
| **Tamanhos dos Tipos de Mídia** | Único › Mídia › Tamanhos dos Tipos de Mídia (também um botão **Tamanhos** na grade de Tipos de Mídia) | Por tipo, um ou mais tamanhos: Código do Tamanho, Largura, Altura, Modo de Encaixe, Crop, ResizeUp. Medido na loja A: 59 linhas; o tamanho `default` do tipo do banner de topo era 1920×496, encaixe `Cover`, Crop Sim (recorta para preencher) |
| **Mídias** | Único › Mídia › Mídias (ou a lupa do campo Mídia, no bloco imagem) | O acervo de arquivos. Grade com miniatura, nome do arquivo e o tipo embaixo. Medido na loja A: 25 mil registros, com o filtro **Código do Tipo Não Contém `produto`** já posto, para tirar as fotos de produto da frente (na loja B a grade não foi contada) |
| **Tipo de Banner** | A lupa do campo Tipo de Banner (no cadastro de Banner ou no bloco banner do construtor). Pode não estar no menu (seção 6, item 7) | O "álbum" que o bloco banner aponta: Loja, **Tipo de Mídia**, Nome e Código |
| **Banners** | Loja On-line › Banners | Cada arte: Loja, Tipo de Banner, **Ordem**, Nome, **Link**, Data Início, Data Final, **Situação**, Tipo de Conteúdo e o **arquivo**. Medido: de 100 a 2 mil registros, conforme o admin |

Três consequências práticas:

- **Subir um banner também cria uma mídia.** A arte enviada pela tela Banners aparece na grade de Mídias
  (medido na loja A), e o código na URL dela é o do Tipo de Mídia do tipo de banner (medido na loja B;
  seção 2).
- **O bloco imagem não passa por Tipo de Banner.** Ele aponta direto para uma mídia, pelo id dela. Trocar a
  imagem dele: seção 3b.
- **O link mora em lugares diferentes.** No bloco imagem, o link é um campo do painel do construtor: trocar o
  destino é editar a página. No banner, o link é de cada arte, no cadastro: trocar o destino não toca na
  página.

## 2. A URL de uma imagem do admin

Medido nas duas lojas, o endereço de uma mídia segue:

```
https://storage.panoverse-cdn.com.br/<pasta-da-loja>/<código-do-tipo-de-mídia>/<id-da-mídia>/<arquivo>
```

- **`<pasta-da-loja>` muda de um admin para outro** (medido: nomes diferentes nos dois admins, um deles
  terminando em `.img`). Num admin com várias lojas não se mediu se cada loja tem a sua (o cadastro de Mídia
  nem tem campo Loja, seção 6, item 4). Leia a sua numa URL de imagem do HTML servido e anote no perfil.
  Confira também o host: ele é da plataforma, mas não custa ler.
- **Na página servida, a imagem de um bloco vem com um sufixo de tamanho**, e o formato dele depende de onde
  vem o tamanho, não da loja (seção 7): `…/<arquivo>-<LARG>x<ALT>.png` quando vem da Largura × Altura do
  bloco ("Tamanho personalizado" ligado; medido no bloco imagem da loja A e nos mini banners da loja B) e
  `…-<LARG>x<ALT>-cover.png` quando vem do cadastro de Tamanhos (medido no banner do topo da loja A, cujo
  tamanho tinha encaixe `Cover`). O sufixo se soma ao nome: um arquivo enviado já com o tamanho no nome saiu
  `…-1410x600-1410x600.png`, e num bloco de 1200×600 saiu `…-1600x800-1200x600.png` (loja A): o tamanho
  servido é o **último** par. Já as imagens que o tema escreve fora dos blocos saíram sem sufixo, iguais à
  URL da grade de Mídias: no menu (nas duas lojas), no rodapé e num CSS (loja A). É o servidor de imagens
  gerando uma variante; seção 7.
- **O nome do arquivo é normalizado na subida**: minúsculas, um hífen no lugar de espaço e de sublinhado
  (`_ ` virou um hífen só), parênteses tirados. Medido na loja A, com um nome do tipo
  `Nome Da Arte_ Campanha (1).png` → `nome-da-arte-campanha-1.png` (o nome foi trocado aqui; o padrão é o
  medido).
  ⚠️ Acentos: em artes antigas da loja B, `promoção` virou `promoc-a-o` e `grátis` virou `gra-tis` — hífen
  no meio da palavra, o jeito típico de nome de arquivo vindo de Mac. **Nomeie uma cópia do arquivo antes
  de subir** (não renomeie o original dela), sem acento, com o lugar e o tamanho
  (`home-mini-banner-1-1212x460.png`): a busca da tela Mídias é pelo nome, e um arquivo com o nome que o
  programa deu ("imagem (3).png", data e hora) não se acha depois.
- **Onde hospedar uma imagem usada num CSS** (um fundo de Natal, um ícone de selo), a pergunta que a 1.3.0
  deixava em aberto. É uma gravação no admin, e a imagem é da pessoa (seção 0):
  1. Só com o pedido dela e a imagem que ela escolher. Diga antes que subir cria um registro no acervo de
     Mídias, que talvez apareça para as outras lojas do admin (seção 6, item 4) e que só sai com `Excluir`;
     espere o "sim". Nomeie uma cópia do arquivo, sem acento (item acima); não renomeie o original dela.
  2. Único › Mídia › Mídias › `Incluir`: só Arquivo e Tipo. Um arquivo só (o seletor aceita vários, seção 6,
     item 6), pela ferramenta de upload (seção 9). No Tipo, abra a lupa e leia Nome e **Código**: use o de
     código `imagem` (existia nas duas lojas medidas) ou, para SVG, o tipo de SVG, cujo código na URL era
     `svg` numa loja e `SVG` na outra. Copie o código da lista, não digite. Se não houver um que sirva,
     pergunte. `Confirmar` **uma** vez e confira que o total da grade subiu 1.
  3. Na grade, ache a linha nova (na loja A ela veio em primeiro) e leia a URL dela (o ícone de link ou o
     `src` da miniatura: não se registrou de qual dos dois saiu a URL medida). Confira que ela segue a seção
     acima, **sem** sufixo de tamanho, e que a pasta é a da sua loja (o perfil diz qual). A tela não tem
     campo Loja; na loja A, num admin com várias lojas, o arquivo caiu na pasta da loja, mas não se sabe o
     que decide isso.
  4. Peso (PNG ou JPG): a URL sem sufixo veio, na loja A, com 1798×875, de um PNG enviado com 1,3 MB (não
     se comparou com as dimensões do arquivo enviado, nem se mediu o peso servido): trate-a como o arquivo
     inteiro, sem redução. Se a imagem aparece menor que isso, peça ao CDN a variante
     `…/<arquivo>-<LARG>x<ALT>.png` na mesma proporção do arquivo (só isso foi medido), no tamanho de que a
     tela precisa (largura em tela × `devicePixelRatio`, seção 7). Confira o 200, as dimensões e o peso, e
     diga à pessoa o peso das duas. Num SVG, use a URL sem sufixo (nas duas lojas os SVG servidos vinham sem
     ele).
  5. Confirme a URL escolhida com a pessoa. O CSS que a usa segue `ajustes-visuais.md` (prévia, Arquivo,
     número novo no `<head>`). Continua valendo: nunca aponte para imagem de outro site.

## 3. Subir um banner novo, do zero ao ar

O caminho inteiro, feito de ponta a ponta na loja B. O tipo (passo 2) se cria pela lupa do campo Tipo de
Banner, que existe no cadastro de Banner (passo 3) e no painel do bloco (passo 4). Na loja A ele nasceu pela
lupa do bloco e já foi selecionado ali, antes de haver arte: o passo 4 veio antes do 3, e o bloco ficou
invisível até a arte entrar (seção 6, item 2) — por isso, só num clone. O que não muda: o tipo existe antes
das artes, **a arte aponta para um tipo, e o bloco da página aponta para o mesmo tipo**, e a página no ar
nunca aponta para um tipo sem arte ativa.

0. **Ache o bloco, o par do celular e o tipo, só lendo.** Na página servida (com `?nc=`), ache o bloco do
   lugar de que a pessoa fala pelo `id="block-…"`, veja pelo HTML se ele parece banner ou imagem (seção 6,
   item 5), mostre num print qual é e confirme com ela. Depois leia o campo `Blocos:` da página no ar, pelo
   DOM: `Alterar` › aba `Configurações` › `lerBlocos()` › saia por `Cancelar` (`armadilhas.md` 4). O script
   de lá coleta só banner e vitrine: aqui, projete **todos** os blocos, com `b.id`, `b.type`, `b.name`,
   `b.device_show` e, do `config`, `use_custom_size`, `width` e `height` (a Largura × Altura do bloco); num
   banner, também `config.banner_tipo` com `id`, `codigo`, `midiaTipo/nome` e `midiaTipo/id` (seção 5). Só
   esses campos: devolver o objeto inteiro estoura o transporte. O bloco de mesmo `id` decide: o `type`
   dele diz se é `banner` ou `imagem`, e o tipo de banner está em `config.banner_tipo`. O par
   do celular é o bloco com o outro `device_show` no mesmo lugar da árvore (na loja B, um irmão no mesmo
   Box). Quando o par usa `Exibir em`, ele não vem no HTML de computador, porque o servidor manda só os
   blocos do aparelho pedido (medido na loja B; `blocos.md`, `device_show`). Confira o `id` dele no HTML
   baixado com User-Agent de celular. O par pode usar **outro** tipo: leia o tipo dos dois (seção 5).
   Prefira esse caminho a abrir o construtor da página no ar, onde as grades das lupas têm `Incluir`,
   `Alterar` e `Excluir`, e o `Incluir` gravou na hora (seção 9). Se abrir, saia sem `Aplicar`, pelo `X` e
   pelo `Cancelar` do diálogo da página.
1. **Saiba qual Tipo de Mídia usar** (seção 5) e **em que tamanho a arte vai sair** (seção 7). Não escolha
   pelo nome.
2. **Crie o Tipo de Banner**, depois do "sim" sobre a lista escrita do tipo e de cada arte (seção 0), dado
   com nenhum diálogo aberto. Lupa do campo Tipo de Banner › `Incluir`: Loja (o select lista as lojas do
   admin; medido na loja B, uma opção vazia e as duas lojas dele: escolha a do perfil e confira o nome),
   Tipo de Mídia, Nome e **Código**. O campo Código não estava no diálogo vazio da loja A: apareceu depois
   que Loja e Tipo de Mídia foram escolhidos. Para o código, siga o jeito de nomear que a loja já usa, mas
   sempre em minúsculas, com hífen, sem espaço nem acento: na loja B havia códigos antigos com espaço e
   barra, que não servem de modelo. `Confirmar` (um clique real; abrir e confirmar na lupa: seção 9).
   ⚠️ O que acontece depois **variou**: na loja A o diálogo fechou e a grade voltou com a linha nova já
   marcada; na loja B o diálogo **voltou vazio** e ficou aberto. Nos dois casos, confira na grade que nasceu
   **uma** linha (ela pode estar na última página) antes de seguir, e nunca aperte `Confirmar` de novo por
   achar que não gravou.
   **Um tipo novo para cada tipo em uso no lugar:** se o par do celular usa outro tipo (passo 0), crie
   também o do celular, com o Tipo de Mídia do tipo atual dele, e ponha as artes do celular na lista escrita
   da seção 0. Se a proporção do par for outra (a Largura × Altura no `Blocos:`, ou o sufixo do `src`
   servido, seção 2), peça à pessoa a arte do celular antes de seguir.
3. **Cadastre as artes.** Loja On-line › Banners › `Incluir`:
   - **Loja** (o campo Tipo de Banner só aparece depois dela)
   - **Tipo de Banner** — o criado no passo 2
   - **Ordem** — a posição no carrossel (1, 2, 3…)
   - **Nome** — vira o `alt` **e** o `title` da imagem no site, e o `data-t` do link (medido na loja B, onde
     os nomes gravados saíram assim; na loja A, `alt`, `title` e `data-t` vinham iguais entre si). É o que o
     Google e o leitor de tela leem. Proponha à pessoa um nome que diga o que está escrito na arte
     (a categoria ou a oferta que ela anuncia), não um rótulo de posição como "Mini banner 1", e grave o que
     ela escolher
   - **Link** — para onde o clique leva. Um banner sem link é um clique que não leva a lugar nenhum
   - **Data Início** e **Data Final** — com hora (se a arte entra e sai sozinha pela data não foi medido;
     seção 8). O padrão lido na loja A era o dia 1 do mês corrente, já no passado, e uma data cinco anos à
     frente: com Situação `Ativo`, num tipo que uma página já usa, a arte entra no ar assim que o cache de
     banners virar. Pergunte à pessoa as datas de entrada e de saída e grave as dela
   - **Situação** — `Ativo` para aparecer (a outra opção vista é `Pausado`)
   - **Tipo de Conteúdo** — `Imagem` (a grade tem coluna de provedor de vídeo: há outros tipos)
   - **Imagem** — o arquivo, por um seletor de arquivo comum do navegador. Antes de subir, confira largura ×
     altura de cada arquivo contra o tamanho que a página pede (seção 7). Se a proporção não bater, mostre
     à pessoa antes: com Tamanho personalizado ligado não se mediu se o servidor recorta ou estica (as artes
     medidas tinham a proporção exata do bloco)
   `Confirmar`. O aviso é "Registro inserido com sucesso." e o diálogo **volta vazio**, pronto para a próxima.
   ⚠️ Medido na loja B: no diálogo que volta vazio, **Situação e Tipo de Conteúdo vêm em branco, e com eles
   em branco os campos Link e Imagem somem do formulário**. Escolha os dois de novo e confira **todos** os
   campos antes de cada `Confirmar`.
   Um `Confirmar` por arte: o aviso e o diálogo vazio mostram que gravou, e nunca se aperta `Confirmar` de
   novo por achar que não gravou. Depois da última, saia do diálogo vazio por `Cancelar` e confira na grade
   de Banners (filtro Cód. Tipo de Banner) que há **uma** linha por arte, com Ordem, Situação e datas
   certas. Se nasceu linha a mais, pare e mostre as linhas à pessoa.
4. **Ligue o bloco ao tipo.** É uma gravação de página do construtor, com os cuidados da edição pontual
   (`construtor.md`, seção 7, itens 1, 2 e 7: ninguém com a página aberta, backup do `Blocos:` e a
   comparação logo antes de gravar). No clone, que é a prévia, gravar antes do "aprovado" é o combinado
   (`SKILL.md`, "Página do construtor", passo 8): ponha "apontar o bloco do clone (e o par) para o tipo novo"
   na lista escrita da seção 0, e o "sim" sobre ela vale para essa gravação. Na página real (seção 4,
   caminho a), vale a seção 7 inteira. Antes de abrir o construtor: pergunte se alguém está com o
   `Alterar` ou o construtor desta página aberto e peça para sair por `Cancelar` (`armadilhas.md` 8); faça o
   backup do `Blocos:` e, num diálogo aberto agora, a comparação com ele (`construtor.md`, seção 0, "Backup
   do `Blocos:`"); a linha marcada pelo `#` passa por `conferirAlvo`. O caminho preferido é trocar o
   `banner_tipo` direto no `Blocos:` (seção 9, "No construtor"). Pela tela, tudo pelo DOM, nunca por
   coordenada: abra o bloco Banner (e o par dele no celular, se houver — passo 0 e seção 6, item 5), clique
   na lupa do campo Tipo de Banner, ponha o filtro **Loja = a sua**, marque **só** a linha do tipo novo
   daquele bloco (no par do celular, o tipo novo do celular; confira o `#` e o Código) e clique
   `Selecionar`. Depois `Aplicar` e feche o construtor (o `X`, "Fechar
   Construtor"). De volta ao diálogo da página, antes do `Confirmar`: `conferirDialogo(slug)` e compare
   `lerBlocos()` com o backup. A diferença tem de ser só o `banner_tipo` (e, se você mexeu no tamanho,
   `use_custom_size`, `width` e `height`) dos blocos pretendidos. Se houver outra diferença, ou nenhuma, não
   confirme: saia por `Cancelar` e mostre à pessoa (esta leitura depois do construtor não foi medida). Grave
   com `confirmarGravacao({ forcarSemInjetar: true })`, que mantém as travas de loja, de diálogo e do botão,
   e confira por conteúdo com o diálogo reaberto (`armadilhas.md` 27). Sem ferramenta de navegador, a
   pessoa faz os cliques e você confere com ela, passo a passo.
   ⚠️ Medido na loja A: a grade da lupa abre com o filtro Loja em "Nada selecionado", que mostra os tipos de
   **todas** as lojas do admin (302 linhas), e as colunas são só `#`, Código e Nome: sem o filtro, nada na
   linha diz de que loja ela é.
   ⚠️ Com o tipo ainda vazio, **o banner some e não reserva espaço**: o resto da página sobe (medido na loja
   A, na prévia do construtor; na página servida não foi medido). Por isso este passo se faz num clone
   (seção 4), e **nunca** na página que está no ar enquanto o tipo não tiver arte ativa. Na página real ele
   só entra depois, com as artes já cadastradas e ativas e o clone conferido: é o caminho (a) da seção 4.
5. **O cache de banners.** Em Administrador › Cache há **uma** linha `banner` para os banners da loja
   inteira, não uma por arte (medido na loja B: com o filtro Loja, sobrou uma). Ela não é "a linha que você
   acabou de gravar": como o cache de configuração, pergunte antes de limpá-la (ou faça, se ela pediu; na
   loja A quem limpou foi a pessoa), e anote no perfil quem limpa. O caminho: filtro **Loja = a sua**,
   Nome **Contém** `banner`, conferir que sobrou **uma** linha,
   marcar só ela e `Limpar cache` (`mapa-do-admin.md`, 5). Nunca use "Limpar todo o cache" nem "Limpar
   cache do CDN". Limpe uma vez, depois de terminar **todas** as mudanças do cadastro (cadastrar as novas e
   pausar as antigas), não no meio delas. Não se mediu se a arte nova aparece sem essa limpeza, nem em
   quanto tempo. Se a página foi regravada, o `Limpar cache` na linha dela, em Páginas, é parte da gravação.
6. **Confira no HTML servido**, com uma query nova (`?nc=`), nos dois User-Agents: o `src` das imagens, o
   `alt`, o `href` e o tamanho do arquivo (seção 7). Se ainda vier o antigo, espere uns 2 minutos e refaça
   (seção 6, item 8). Depois, prints de computador e celular para a pessoa.
7. **Perfil, e o que ficou no admin.** No fim, anote no histórico do perfil:
   - o `#` do tipo novo;
   - os `ban_id` e os ids de mídia criados (o id está no `src`, seção 2);
   - o `#` do clone, com Publicada e Robots;
   - o que foi pausado;
   - como desfazer cada coisa.

   Diga à pessoa o que ficou no admin e o que é decisão dela: despublicar ou excluir o clone, levar ou não
   para a página real (seção 4) e o que fazer com as artes antigas.

**Trocar só a arte de um banner que já existe** parece mais curto: cadastrar a arte nova no tipo que a
página já usa e pausar a antiga, sem tocar no construtor. Mas ele **grava direto no que está no ar**. A arte
entra no site a partir do `Confirmar`, sem prévia na página. O cache `banner` pode atrasar a troca, por um
tempo não medido, mas não a segura. E o tipo é compartilhado: a troca vale para toda página que use aquele
tipo, inclusive a home, se ela o usar. Um clone da página **não** isola uma troca feita no cadastro. Nas
telas medidas, nada mostra quais páginas usam um tipo (a grade de Tipos de Banner traz só #, Código e
Nome). Pergunte à pessoa e, sem resposta, trate o tipo como compartilhado. Faça antes o passo 0 do caminho
inteiro (o bloco, o par do celular e o tipo de cada um, só lendo). Depois dele, e antes de qualquer
gravação, mostre à pessoa os dois caminhos e deixe que ela escolha:

- **o seguro**: o caminho inteiro acima, com tipo novo e clone (seção 4). Só vai ao ar no fim;
- **o direto**: vai ao ar na hora.

No direto, nesta ordem:

0. **Os dois aparelhos.** Com o passo 0 do caminho inteiro feito: se o par do celular usa outro tipo, a
   troca é nos dois tipos (backup, cadastro pausado e troca em cada um). Se a proporção do par for outra (a
   Largura × Altura no `Blocos:`, ou o sufixo do `src` servido, seção 2), peça à pessoa a arte do celular
   antes de seguir.
1. **Backup.** Guarde num arquivo com data, na pasta de backups, as linhas atuais do tipo (seção 9, "Ler a
   grade": `ban_id`, nome, link, ordem, situação, datas) e as URLs das imagens servidas (seção 0, "O que é
   o backup aqui").
2. **Prévia, sem gravar nada.** Mostre as artes novas ao lado das atuais, no tamanho em que vão aparecer
   (seção 7). Outra opção é um render local de uma cópia da página, com o `src` trocado pelo arquivo novo
   (`ferramentas-de-navegador.md`, seção 4, "Render local de uma cópia"). Nesse render, copie as artes para
   a pasta das cópias e use o endereço absoluto (`http://127.0.0.1:PORTA/<arte>.png`): com o `<base>` da
   cópia, um endereço relativo vai ao site, onde a arte nova não existe. Se trocar o `src` com a página já
   aberta, troque também nos `.owl-item.cloned`, que o carrossel em loop cria. Diga o que essa prévia não
   mostra: o recorte e a nitidez finais saem do servidor de imagens (seção 7).
3. **As quatro coisas e o "sim".** Diga o que muda, em quais páginas e aparelhos, quem vê e como desfazer.
   Na mesma mensagem, a lista escrita de cada arte nova (seção 0): o Nome (vira o `alt` e o `title`;
   proponha um que diga o que a arte anuncia), o Link (proponha o da arte que ela substitui, lido no
   backup), a Ordem (a da arte que ela substitui), as datas de entrada e saída e o arquivo; e pergunte se
   você pode limpar a linha `banner` (passo 5 do caminho inteiro). Espere o "sim" sobre essa lista, com
   nenhum diálogo aberto, e só depois abra o `Incluir`.
4. **Cadastre as artes novas pausadas.** Faça o passo 3 do caminho inteiro, acima ("Cadastre as artes"),
   com duas diferenças: o Tipo de Banner é o que a página já usa (o `id` lido no passo 0), não um tipo
   novo; e **Situação = Pausado**. Com `Ativo` e a Data Início padrão (medida na loja A: dia 1 do mês
   corrente, já no passado), elas entram no ar ao lado das antigas. ⚠️ Cadastrar já pausada não foi medido
   (na loja B, Link e Imagem só voltaram ao formulário com Situação = `Ativo` e Tipo de Conteúdo =
   `Imagem`). Se, com `Pausado`, os campos Link e Imagem não aparecerem, saia por `Cancelar` e ofereça à
   pessoa as duas saídas: o caminho seguro (tipo novo e clone, seção 4), ou cadastrar com `Ativo`, sabendo
   que cada arte entra no ar ao lado das antigas a partir do `Confirmar` (ou de quando o cache `banner`
   virar) e fica assim até o passo 5. A escolha é dela. Depois do `Confirmar`, confira na grade que a linha
   nova ficou `Pausado` (na loja B, as artes `Pausado` de um tipo em uso não apareciam no HTML servido).
5. **Troque as artes.** Confira que a grade ainda é a do backup. Então, uma logo depois da outra, ative as
   novas e pause as antigas: Banners › marcar **uma** linha, pelo `ban_id` › `Alterar` › Situação ›
   `Confirmar`. Abra o `Alterar` com um clique real pela referência do botão, nunca com o composto (na tela
   Páginas, o composto no `Alterar` abriu dois diálogos: `mapa-do-admin.md`, 12). Antes de mudar a
   Situação, `dialogoUnico()` tem de achar um diálogo só, com o Nome e o Link da linha marcada. O
   `Confirmar` também é um clique real. Depois, releia a linha pelo modelo da grade (`ban_situacao`, seção
   9) e confira que só a Situação mudou. Se ela não mudou, não clique de novo: pare e conte à pessoa.
   ⚠️ Mudar a Situação pelo `Alterar` **não foi medido** (seção 10), nem qual clique grava esse
   `Confirmar`. Se o diálogo pedir o arquivo de novo ou mostrar algo inesperado, saia por `Cancelar` e
   pergunte.
6. **Cache e conferência.** Limpe o cache `banner` uma vez, depois de todas as trocas, e confira no HTML
   servido: os passos 5 e 6 do caminho inteiro, acima.

Para desfazer: reativar as antigas e pausar as novas, pelo mesmo `Alterar`.

## 3b. Trocar a imagem de um bloco imagem

Telas lidas na loja A (2026-11-06; a pessoa conduziu o admin e a skill leu). ⚠️ **A troca não foi gravada
em nenhuma das duas lojas.** Os passos abaixo juntam telas medidas e caminhos que a skill já usa, e o que
não foi medido está marcado.

O bloco imagem não passa por Tipo de Banner (seção 1). No painel dele, a seção IMAGEM E TAMANHO tem:
**Mídia** (o id, a lupa e o nome do arquivo), **Tamanho personalizado** com **Largura** × **Altura** (é o
que decide o arquivo servido, seção 7), **Manter proporção** e **Link**. Na seção GERAL fica o **Nome do
Bloco**: na loja A ele saiu como o `alt` e o `title` da imagem (na loja B, o bloco imagem da home saiu com
`alt` vazio; `blocos.md`, bloco `imagem`). Trocar a imagem é **editar a página**. Na página que está no ar,
siga a edição pontual de `construtor.md`, seção 7: ninguém mais com a página aberta, backup do `Blocos:`,
prévia, "sim", gravar, conferir. Antes, confirme pelo `type` no `Blocos:` e pelo HTML que o lugar é mesmo
um bloco imagem (seção 3, passo 0; seção 6, item 5). Veja também se há um bloco par para o celular (campo
**Exibir em**): se houver, a troca vale para os dois.

1. **Suba a arte que a pessoa escolheu**, com o "sim" dela (seção 0): Único › Mídia › Mídias › `Incluir`.
   O diálogo "Adicionar Mídia" tem só **Arquivo** e **Tipo**, sem Loja e sem Nome. Por isso, nomeie o
   arquivo antes de subir (seção 2) e use o mesmo Tipo da imagem atual (o código do tipo está na URL dela,
   seção 2). Escolha um arquivo só: o seletor aceita vários (seção 6, item 6). O `Confirmar` (um clique
   real, seção 9) grava no acervo na hora, mas não muda o site. Na loja A, a mídia nova apareceu em primeiro
   na grade e o total subiu 1. Leia ali o **id** e o **nome normalizado** dela.
2. **Prévia, sem gravar:** um favorito que troca o `src` do `<img>` do bloco pela variante da mídia nova no
   tamanho do bloco (`…/<id>/<arquivo-sem-extensão>-LARGxALT.<extensão>`, seção 7), no computador e no
   celular (`previa.md`). Outra opção é um clone da página (seção 4). Espere o "sim".
3. **Grave só a mídia do bloco.** Pelo `Blocos:`, o caminho oficial (`gravacao-construtor.md`): no bloco
   certo, troque `midia.id` e `midia.nomeArquivo` pelo id e pelo nome lidos no passo 1, no formato que o
   backup já traz (`blocos.md`, bloco `imagem`), e não mexa em mais nada. Pelo painel, se a pessoa preferir
   (pelo DOM, seção 9): bloco Imagem › lupa do campo Mídia (abre o diálogo "Mídias", já com o filtro Código
   do Tipo Não Contém `produto`) › marque **só** a mídia nova › `Selecionar` › confira no campo o id e o
   nome › `Aplicar` › feche o construtor › as conferências do passo 4 da seção 3 › `Confirmar` no diálogo da
   página. ⚠️ Não medido: nenhum dos dois caminhos foi gravado num bloco imagem.
4. **`Limpar cache`** na linha da página, em Páginas. Depois confira o HTML servido, com um `?nc=` novo, nos
   dois User-Agents: `block-imagem-container`, o `src` com o id novo e o `-LARGxALT` do bloco, o `alt` e o
   `href`. Se ainda vier o antigo, espere uns 2 minutos (seção 6, item 8).

**Proporção, nome e link.** Peça a arte na proporção exata da Largura × Altura do bloco, no dobro do tamanho
em que ela aparece (seção 7). Se a arte vier em outra proporção, peça a variante direto no CDN e veja o que
sai: não se mediu se o servidor recorta ou estica a imagem. Mudar Largura × Altura muda a altura do lugar na
página. Isso é decisão da pessoa, com prévia. Se a arte nova diz outra coisa, proponha à pessoa um Nome do
Bloco e um Link novos: é conteúdo dela.

**Para desfazer:** cole o backup do `Blocos:` e grave de novo, ou ponha de volta o id antigo no campo Mídia.
A mídia antiga continua no acervo: não a exclua.

## 4. Testar num clone da página

Para ver a arte nova na página de verdade sem tocar na que está no ar, a pessoa da loja usa o histórico de
versões: Páginas › marcar a linha › `Log` › marcar a versão mais recente › `Criar nova página`. Abre
"Adicionar Página" já preenchida (Nome `<nome> (Log #NNNN)`, URL `/<slug>-log-NNNN`, que na home sai
`/-log-NNNN`, Tipo Construtor), e o `Confirmar` cria a cópia, com os mesmos ids de bloco da original.
Detalhe e riscos em `armadilhas.md` 36.

Quem cria o clone é a pessoa, ou você com um pedido dela que nomeie o botão `Criar nova página` e a página:
criar página é gravar no admin, e o "sim" sobre uma lista (seção 0) não basta aqui (`armadilhas.md` 8).
**Antes** do `Confirmar`, avise que o clone pode nascer **publicado, indexável e no sitemap** (medido na
loja B) e combine três coisas:

- Se vier assim, o conserto de Robots e Sitemap pela aba SEO do clone. O "sim" para isso se pede agora
  (`armadilhas.md` 36, itens 1 e 4).
- Se vier **despublicado** (medido na loja A), pode não dar para conferir no HTML servido (seção 3, passo
  6). No site novo (React/Next), página despublicada não abre (`armadilhas.md` 6b). No site antigo (twig)
  isso não foi medido, e na loja A a prévia do construtor mostrou a página e a arte nova. Se o site não
  abrir o clone, conferir ali precisa de `Publicar`, e `Publicar` só com um pedido que nomeie o botão e a
  página (o caminho dele: `mapa-do-admin.md`, 12). Sem esse pedido, diga que a conferência no site não foi
  feita.
- No fim, despublicar ou excluir o clone é decisão dela, e quem clica é ela ("Depois do teste", abaixo).

No "Adicionar Página", desmarque **Registrar acessos**.

**Se ela pedir que você crie o clone**, tudo pelo DOM, pela referência do elemento: marque a linha da
página pelo `#` (`conferirAlvo`), abra o `Log`, marque a versão mais recente e clique em
`Criar nova página`. Nunca em `Restaurar Versão`, que fica ao lado: ele é da pessoa (ela clica; ninguém
mediu o que ele faz). No "Adicionar Página", confira a Loja e a URL (`/-log-NNNN` na home) e desmarque
Registrar acessos. O `Confirmar` é **um** clique real, no botão de dentro do diálogo
(`rotularParaFerramenta`; o composto criou páginas em dobro: `mapa-do-admin.md`, 12), e nunca se repete.
As funções de criação do `injetar.js` (`conferirArquivoNovo`, `prepararConfirmarCriacao`) são de Arquivo e
abortam aqui, e `conferirCriacao` recusa a URL `/-log-NNNN` da home, que começa com hífen. Por isso,
confira na grade, filtrada pela Loja e por `log` na URL, que nasceu **uma** linha nova, antes de qualquer
outro passo. Na loja B quem criou o clone foi a skill, a pedido da pessoa; o jeito de cada clique não foi
anotado.

⚠️ **Na loja B o clone nasceu publicado, com `index, follow` e no sitemap** — uma cópia pública da home.
Confira na hora a coluna Publicada e a aba SEO e, com o "sim" combinado, corrija Robots e Sitemap
(`armadilhas.md` 36, item 4). Um clone publicado com `noindex` tem uma vantagem: dá para conferir no site
real, nos dois aparelhos.

Para levar o resultado para a página real há três caminhos, e **nenhum dos três foi feito numa página
real** (em 2026-11-06, nas duas lojas, a home real não foi tocada; (a) só foi feito no clone, e (b) e (c)
não foram feitos): trate os três como plano e confira cada passo. Os três mudam o site no ar. O "aprovado"
sobre o clone aprova o conteúdo; gravar pede um pedido que nomeie a página e um "sim" à parte
(`construtor.md`, passo 9). Nos três, o cache pode segurar o antigo por uns 2 minutos (seção 6, item 8), e
o desfazer passa pelo mesmo cache.

(a) **Apontar o bloco da página real (e o par dele no celular, se houver) cada um para o seu tipo novo**
(seção 3, passo 2), copiando
também o tamanho do bloco do clone, se ele mudou (seção 7): é o passo 4 da seção 3, agora na página real. É
gravar na página no ar: siga `construtor.md`, seção 7 (perguntar se alguém está com o `Alterar` ou o
construtor dela aberto, backup do `Blocos:`, comparar com o backup logo antes de gravar). Antes, procure nos
CSS da loja quem usa a classe `.ar-…` desse bloco, o id dele ou a classe do container: mexer no bloco pelo
construtor troca essa classe e cria uma regra presa ao id (seção 6, item 9). Desfazer é gravar de volta o
backup do `Blocos:`. Apontar de novo para o tipo antigo pelo construtor seria outra gravação, e não se mediu
se ela devolve a classe antiga.

(b) **Cadastrar as artes novas no tipo que a página já usa e pausar as velhas**: não toca na página, mas
vale para toda página que usa aquele tipo (seção 3). Também não leva o tamanho novo do bloco, então o ganho
de nitidez da seção 7 se perde. Pausar um banner que já existe não foi medido. Siga "Trocar só a arte"
(seção 3), com o backup da lista de artes do tipo (nome, ordem, link, datas e situação de cada uma).
Desfazer é pausar as novas e reativar as velhas.

(c) **Fazer do próprio clone a nova home.** É o caminho (b) do `construtor.md`, passo 9: trocar a URL do
clone para `/`, publicar o clone e despublicar a home atual (`mapa-do-admin.md`, 4). A troca de URL e o
`Publicar` só com um pedido que os nomeie (o `Publicar` pelo caminho dele, `mapa-do-admin.md`, 12); o
`Despublicar` da home atual é da pessoa: ela clica, e você confere depois. Antes, diga a ela o que o teste
deixou no clone: Robots `noindex, nofollow`, fora do sitemap e "Registrar acessos" desmarcado. Esses três
voltam ao que a home atual tem (leia no `Alterar` dela) junto com a troca, ou a home nova sai do Google e
para de contar acessos. Não ponha `index, follow` antes, com o clone ainda publicado em `/-log-NNNN`: isso
recria a cópia pública da home (`armadilhas.md` 36).

**Depois do teste**, o clone continua no admin (publicado, se nasceu assim). `Despublicar` é da pessoa: ela
clica, e você confere depois; `Excluir` nunca é da skill. Anote no perfil o `#`, a URL e o estado dele
(Publicada, Robots, Sitemap).

## 5. Qual Tipo de Mídia usar: leia, não adivinhe

Os nomes enganam. Na loja A havia dois Tipos de Mídia de nome quase igual para o topo (os nomes ficam no
perfil dela); o topo do computador servia as artes pelo código de um deles, e o do celular não foi lido. Na
loja B, os mini banners da home usavam um tipo de banner cujo Tipo de Mídia era "Imagem". A única fonte é o
que a loja já usa:

1. Leia o **Tipo de Banner** do bloco daquele lugar, e o do par do celular, no `Blocos:` da página que está
   no ar (seção 3, passo 0). Numa home real, o `config.banner_tipo` trazia também `midiaTipo/nome` e
   `midiaTipo/id` (`armadilhas.md` 4: é a cópia que o painel gravou quando o tipo foi escolhido).
2. Confira, só lendo, no `src` das artes servidas: o código do Tipo de Mídia é o pedaço depois da pasta da
   loja (`…/<pasta-da-loja>/<código>/<id>/…`, seção 2), e o nome dele está na grade de Único › Mídia ›
   Tipos de Mídia (#, Nome, Código). Os dois têm de bater com o passo 1. Se não baterem, ou se o passo 1 não
   trouxer o `midiaTipo`, leia o **Tipo de Mídia** na grade de Tipos de Banner: abra a lupa do campo Tipo de
   Banner no cadastro (Banners › `Incluir` › Loja › lupa), ponha o filtro Loja = a sua, ache o tipo pelo `#`
   (o `id` do `banner_tipo`) e leia `midiaTipo/nome` no modelo da linha, por script (seção 9). Ali, nada de
   `Selecionar`, `Incluir`, `Alterar` ou `Excluir`; saia dos dois diálogos por `Cancelar`. Não abra o
   construtor da página no ar só para ler (seção 3, passo 0).
3. O tipo novo copia esse. Anote no perfil, por lugar (topo do computador, topo do celular, mini banners…).

## 6. Armadilhas medidas

1. ⚠️ **O tipo não se muda depois.** A ajuda ("?") ao lado do campo Tipo de Conteúdo, no cadastro de
   Banner, diz: "O tipo do banner só pode ser definido ao criar o banner. Em banners já cadastrados, a
   alteração do tipo não é permitida." Não se provou se vale para o Tipo de Banner, para o Tipo de Conteúdo
   ou para os dois: trate como os dois. Confira antes do `Confirmar`. Se errou, é cadastrar de novo e pausar
   a errada (pausar pelo `Alterar` não foi medido: seção 3, "Trocar só a arte"). O botão `Duplicar` da
   grade não foi medido: não o use sem medir.
2. ⚠️ **Tipo de banner vazio = bloco invisível e página que sobe** (medido na prévia do construtor, loja
   A). Nunca aponte a página que está no ar para um tipo sem arte ativa — nem deixe as datas de todas as
   artes vencerem.
3. ⚠️ **O cache de banners é outro.** Além do cache da página e do de configuração da loja, há a linha de
   código `banner` em Administrador › Cache. **Com o filtro Loja vazio, a grade mostrou três linhas
   "Banners"** num admin com várias lojas (loja A; pelo jeito, uma por loja, o que não se conferiu), com
   "Último flush" diferentes: ponha o filtro na sua e confira que sobrou uma.
4. ⚠️ **A tela Mídias não tem campo Loja** (medido no `Incluir`: só Arquivo e Tipo), enquanto a de Banners
   exige a Loja. Não se mediu se o acervo é por loja ou do admin inteiro; trate como do admin inteiro.
5. ⚠️ **A URL da imagem não diz que tipo de bloco a mostra.** Um tipo de banner com Tipo de Mídia "Imagem"
   serve as artes em `…/imagem/<id>/…`, igual ao bloco imagem. Na loja B, os três mini banners da home
   pareciam blocos imagem pela URL e eram **um bloco banner** com `owl-desktop-3 owl-mobile-1` (três lado a
   lado no computador, carrossel de um no celular) — e com **um bloco par para o celular**: outro bloco
   banner, no mesmo Box (container) do bloco do computador, que o construtor mostra apagado na vista
   Computador (cada um vale para um aparelho, pelo Exibir em). O servidor manda no HTML só o bloco que vale
   para o User-Agent: na cópia de computador da home só havia o bloco do computador, e na de celular, só o
   do celular. Conferir com um User-Agent só não mostra o outro bloco, nem a troca feita nele. Mudou um,
   mude o par (na loja B, a Largura/Altura foi trocada nos dois). Decida pelo `type` do bloco no `Blocos:`
   (seção 3, passo 0), com o HTML como segunda prova (`<a … class="item" data-t="…">` dentro de
   `owl-carousel` = banner; `block-imagem-container` = imagem; medido no site antigo, twig), nunca pela
   URL: o caminho de troca é outro.
6. **O seletor de arquivo** do cadastro de Mídia aceita **vários arquivos** e **não filtra extensão**
   (`accept` vazio, medido). Quem barra formato errado, se barrar, é o servidor.
7. ⚠️ **"Tipo de Banners" pode não estar no menu.** Na loja B a lista completa do menu Loja On-line foi
   lida, e o item não existia; na loja A ele não apareceu na parte visível. O caminho que funcionou nas duas
   foi a **lupa** do campo Tipo de Banner. Item que falta pode ser permissão (`SKILL.md`, regra zero).
8. ⚠️ **O cache demora, e o "Último flush" pode não mudar.** Medido na loja B: depois de `Limpar cache` na
   linha `banner` e na linha da página, o HTML servido continuou antigo por cerca de 1 a 2 minutos — até uma
   mudança de Robots, já confirmada na grade — e depois virou sozinho; o "Último flush" ficou com a data
   velha. Não conclua que a gravação falhou: refaça o `?nc=` uns 2 minutos depois. Se nem assim mudar,
   `mapa-do-admin.md`, 13.
9. ⚠️ **Ao regravar a página pelo construtor, a classe da caixa de proporção pode mudar.** Medido na loja
   B: `ar-606-230` virou `ar-606px-230px`. A regra que reserva o espaço é gerada junto, escopada pelo id do
   bloco, então a proporção não muda. Mas um CSS que se segure em `.ar-606-230` para de agir em silêncio.
   Prenda o CSS no id do bloco ou na Classe CSS do painel, nunca na classe `.ar-…`.
   Na mesma gravação, o bloco editado (e só ele) ganhou um `<style data-block="NOME DO BLOCO">` que antes
   não existia:
   `#block-XXXX-container{ background-size: auto; … background-repeat: repeat; … position: initial; }`
   (medido na loja B, nos dois aparelhos). É a config do bloco saindo no HTML (`armadilhas.md`, "Bônus
   grande" do `data-block`). Presa ao id, essa regra vence qualquer regra só de classe, inclusive a da
   Classe CSS do painel, que dê `position` ou fundo a esse container. Antes de gravar na página real,
   procure nos CSS da loja regras para o id do bloco e para a classe do container dele (ex.:
   `.block-banner-container`). Depois de gravar, confira a página servida nos dois aparelhos.
10. **Relato da pessoa da loja A, não reproduzido:** ligar "Tamanho personalizado" no bloco **banner**, em vez
    de usar um tamanho do cadastro, "já deu problema" uma vez. Na loja B, os dois blocos banner dos mini
    banners da home (um para o computador, outro para o celular), com "Tamanho personalizado" ligado,
    funcionaram em 606×230 e em 909×345, nas três larguras medidas (computador, celular e 1024 px).
    Confira a página servida nos dois aparelhos sempre que mexer nele.

## 7. Tamanho e nitidez: o bloco manda no arquivo servido

O servidor de imagens entrega uma **variante** do arquivo original, gerada no tamanho que a página pede. Quem
decide esse tamanho, medido no site antigo (twig) das duas lojas (no site novo, o banner vem no tamanho-base
do tipo: veja o começo do arquivo):

| Bloco | "Tamanho personalizado" | Arquivo servido | Medido em |
|---|---|---|---|
| banner | desligado | o tamanho da linha de Tamanhos dos Tipos de Mídia que o campo **Tamanho da Mídia** do painel aponta, com o encaixe dela: `-1920x496-cover`. Medido uma vez: o campo mostrava o `#` e o código (`default`) da linha 1920×496 Cover do tipo do topo. Não se testou trocar o campo e ver o arquivo servido mudar | loja A |
| banner | ligado | Largura × Altura do bloco: `-606x230`, depois `-909x345` | loja B |
| imagem | ligado | Largura × Altura do bloco: `-1410x600` | loja A |

Isso quer dizer que **mandar uma arte em alta resolução não basta**: na loja B, artes de 1212×460 saíam como
606×230 (57 KB), porque era o que o bloco pedia. O servidor gerou na hora as variantes pedidas na mesma
proporção do arquivo: pedir `…/<arquivo>-909x345.png` e `…-1212x460.png` direto no CDN devolveu 200 e o
tamanho pedido (115 KB e 191 KB). Outra proporção não foi pedida (seção 10).

**Como conferir se está nítido**, sem achismo:

1. No navegador, na página servida: o tamanho do arquivo (`img.naturalWidth`) e o tamanho em tela
   (`getBoundingClientRect().width`), mais o `devicePixelRatio`.
2. Pixels necessários = largura em tela × `devicePixelRatio`. Arquivo menor que isso = imagem um pouco
   borrada naquela tela.
3. Meça em três larguras: celular (375, densidade 2), computador largo e, num carrossel que muda de itens
   por slide, **logo abaixo do ponto em que ele muda** (confira também 1024, o iPad deitado). Esse ponto
   está no script do bloco, no HTML servido. Nas duas lojas medidas ele era 1190 px; na loja B,
   `responsive:{0:{items:1…},1190:{items:3…}}`, ou seja, uma arte por vez abaixo de 1190 px. Medido na
   loja B, num carrossel de três por slide: computador (janela de 1707 px, densidade 1,125) 460 px em tela,
   pede 518; celular 355 px, pede 710; em 1024 px (densidade 1,25), já com uma por slide, 994 px, pede
   ~1243. É na faixa de uma por vez que a imagem fica maior.

**Como corrigir, se a pessoa quiser:** arquivo menor que o necessário é uma **proposta** para a pessoa, não
parte da troca: subir o tamanho troca peso por nitidez, e a escolha é dela. Mostre a conta com o peso de cada
opção (o tamanho atual, 1,5× e 2×, medidos pedindo a variante direto no CDN) e siga a que ela escolher. Na
loja B, 1,5× (909×345) cobriu o computador largo e o celular medidos. Nem 1,5× nem 2× (1212×460) cobriram
1024 px com densidade 1,25, que pedia ~1243. Mudar o tamanho do bloco é gravar na página: faça no clone e
leve para a real pelo caminho (a) da seção 4. Direto na página no ar, é edição pontual (`construtor.md`,
seção 7), com backup, prévia e o "sim" (`SKILL.md`, regra zero). Suba Largura e Altura **mantendo a
proporção**. Como a caixa que reserva o espaço usa a proporção, o layout não se mexe um pixel: medido,
`padding-top: calc((230/606)*100%)` virou `calc((345/909)*100%)`, os dois 0,3795. O custo, medido: na loja
B, a mesma arte pesava 57 KB em 606×230, 115 KB em 909×345 e 191 KB em 1212×460, e as três em 909×345 somam
387 KB (115 + 117 + 155); o peso das três juntas em 606×230 não foi medido. O primeiro slide vem sem
`loading` e os outros com `lazy`; quanto isso economiza não foi medido (no computador as três aparecem
juntas). Num bloco com par no celular, mude **os dois**.

**Peça a arte no dobro do tamanho em que ela aparece**, na proporção exata do bloco — e então ajuste o bloco
para servir o tamanho escolhido. A loja B recebeu as artes assim (1212×460 para um bloco 606:230) e por isso
pôde subir a nitidez sem pedir arte nova.

## 8. As datas de início e fim

O cadastro de Banner tem Data Início e Data Final **com hora** (visto nas duas lojas). **Não se mediu** se a
arte entra sozinha quando chega a Data Início, se sai sozinha quando passa a Data Final, em que fuso vale a
hora, nem quanto o cache atrasa a troca (o `banner`, seção 6, itens 3 e 8, e o da página). Até medir, não
prometa à pessoa que a arte entra ou sai sozinha, e não use a data para tirar uma arte do ar: o caminho é
**Situação = Pausado** (seção 0).

Numa campanha de época, combine as datas com a agenda de skins (`temas-sazonais.md`) e com a contagem
regressiva, se houver. Trate as artes como algo que alguém desliga à mão (`temas-sazonais.md`, seção 9, "Fim
da campanha combinado"): anote no perfil quem pausa cada arte, a que horas e quem confere. Em cada virada,
confira no HTML servido, com `?nc=`, que a arte entrou ou saiu. Se a que devia sair continuar no ar, pause-a
e limpe o cache `banner` (seção 3, passo 5), com o "sim" da pessoa. Se o carrossel puder ficar sem arte
ativa, vale a seção 6, item 2.

Para medir, e só se a pessoa pedir (é gravação: seção 0), use uma arte num tipo de banner novo, ligado só a
um clone (seção 4), com Data Início uns 15 minutos à frente e Data Final algumas horas depois. Confira o
clone no HTML servido antes, durante e depois de cada data, e anote no perfil o que viu, com a hora.

## 9. Por script

`scripts/injetar.js` não cobre estas telas: as travas são suas, a cada `Confirmar`. Antes de cada um,
confira pelo DOM o título do diálogo, a Loja (pelo id), o alvo (o tipo, a página pela URL) e **todos** os
campos — e, numa grade, que há **uma** linha marcada e que ela é a certa.

**O `Confirmar` de um diálogo de criação** ("Adicionar Tipo de Banner", "Adicionar Banner", "Adicionar
Mídia") é **um** clique real da ferramenta, no botão de dentro do diálogo certo (`rotularParaFerramenta`, de
`scripts/injetar.js`, ajuda o `find` a achar esse botão). Nunca use o clique composto (`clicarBotao`,
`cliqueComposto`) nem `triggerHandler` nele: o composto dispara o `ng-click` duas vezes (`armadilhas.md`
22d), e no "Adicionar Página" criou a mesma página duas vezes (`mapa-do-admin.md`, 12). Depois do clique,
espere o aviso "Registro inserido com sucesso." uma vez e não clique de novo, mesmo que o diálogo volte
vazio e aberto (seção 3). Anote o total da grade antes de começar; ao sair, confira que ele subiu
exatamente o número de cadastros que você fez e que as linhas novas são as suas. Se sobrou uma a mais, pare
e mostre as linhas à pessoa: `Excluir` não é da skill.

**Para abrir** `Incluir` ou `Alterar` nestas grades, também um clique real pela referência do botão, nunca
o composto (na tela Páginas, o composto no `Alterar` abriu dois diálogos: `mapa-do-admin.md`, 12). Numa
grade de tela (Banners, Mídias), aberta com nenhum diálogo, logo depois `dialogoUnico()` tem de achar um
diálogo só; se achar zero ou dois, pare. Numa lupa, que abre por cima de outro diálogo (o Tipo de Banner
se cria pela lupa do "Adicionar Banner" ou do construtor, seção 3, passo 2), `dialogoUnico()` aborta de
propósito. Ali, conte os `.ui-dialog` antes e depois do clique em `Incluir` (`contarDialogos()`), guardando
quais eram: tem de haver exatamente um a mais, e o novo tem de ter o título certo ("Adicionar Tipo de
Banner", no `.ui-dialog-title`); senão, pare e mapeie pelo DOM (não se mediu se a lupa e o diálogo que ela
abre são `.ui-dialog`). O `Confirmar` do tipo é o de dentro desse diálogo novo. Qual clique abriu esses
diálogos nas medições não foi anotado. O `Confirmar` de um `Alterar` aqui (pausar ou ativar uma arte) não
foi medido: um clique real, e depois a linha relida pelo modelo da grade (seção 3, "Trocar só a arte",
passo 5).

O que funcionou, medido na loja B com a extensão do Claude para Chrome:

- **Campos de sugestão** (Loja, Tipo de Banner): escrever o id em
  `input[ng-model="suggestController.id_value"]` do grupo daquele rótulo e disparar `input`, `change` e
  `blur` pelo `angular.element(el).triggerHandler(...)`. O nome aparece sozinho no campo ao lado
  (`suggestController.suggest_value`): leia-o para conferir. O campo Tipo do cadastro de Mídia tem o mesmo
  par de campos (lido na loja A), mas não foi preenchido por script.
- **Selects** (Situação, Tipo de Conteúdo, Tipo de Mídia, Loja no Adicionar Tipo de Banner): achar a opção
  pelo **texto**, atribuir o `value` dela e `triggerHandler('change')`.
- **Datas:** dois pares `model.data` / `model.hora`, na ordem início e fim.
- **Arquivo:** a ferramenta de upload de arquivo do navegador, no `input[type=file]` do diálogo. Não clique
  no botão "Escolher arquivo": ele abre a janela do sistema, que a ferramenta não vê. A ação de upload pede
  o caminho local: peça à pessoa os arquivos no computador (o caminho, ou que ela os copie para a pasta
  `trabalho/` do perfil), porque uma imagem colada na conversa pode não existir como arquivo. Sem ação de
  upload na ferramenta (o painel do aplicativo não tem; no Codex não foi medida:
  `ferramentas-de-navegador.md`, 4 e 7), quem escolhe o arquivo no diálogo é a pessoa, com o nome combinado
  (seção 2). Antes do `Confirmar`, confira pelo DOM o nome e o tamanho em bytes de
  `input[type=file].files[0]` contra o arquivo local. Não monte o arquivo por script na página: não foi
  medido.
- **Ler a grade:** `angular.element(tr).scope().row` traz o registro inteiro. Banners: `ban_id`, `ban_nome`,
  `ban_link`, `ban_ordem`, `ban_situacao` (1 = Ativo), `ban_tipo_conteudo` (1 = Imagem),
  `ban_data_hora_inicio`, `ban_data_hora_fim`, `bantip_codigo`, `loj_id`. Tipos de Banner: `id`, `codigo`,
  `nome`, `midiaTipo/nome`, `loja/id`. Páginas: `id`, `nome`, `url`, `publicada`, `loja/id`.
- **Paginar** uma grade de diálogo: os elementos com `ng-click` de `onClickPagination` (o da última página
  usa `pages[pages.length - 2].number`). A grade de Banners aceita até 100 por página.
- **No construtor, também pelo DOM, nunca por coordenada** (`SKILL.md`, regra zero; não há exceção nesta
  tela). Ali não é só o `Confirmar` da página que grava. As lupas do painel abrem grades com `Incluir`,
  `Alterar` e `Excluir` (medido nas lupas de Tipo de Banner e de Mídia, na loja A). Na loja A, `Incluir` ›
  `Confirmar` na lupa do Tipo de Banner criou o tipo na hora (de 302 para 303 registros), antes de qualquer
  `Confirmar` da página. Trate `Alterar` e `Excluir` dali como gravação também. E o `Confirmar` da página
  grava junto qualquer campo que um clique fora do lugar tenha mudado: outro bloco, o `Exibir em`, outro
  tipo.
  - **Para trocar o tipo, a mídia ou o tamanho de um bloco, prefira o campo `Blocos:`**, pelo caminho de
    `gravacao-construtor.md` (backup com `lerBlocos()`, `injetar`, `confirmarGravacao`). As chaves
    (`blocos.md`): `banner_tipo` (com `id`, `codigo` e `nome` lidos da linha da grade de Tipos, no formato
    que o próprio bloco já tem no backup), `midia` no bloco imagem, e `use_custom_size`, `width` e `height`.
  - **Pela tela**, clique no elemento pela referência da ferramenta (`find`/`read_page`) ou por
    `rotularParaFerramenta(el, 'nome')`. Largura e Altura são campos de um painel React, e atribuir `.value`
    não grava. O que funcionou (loja B) foi clique triplo no campo, digitar e Tab; fazer esse clique pela
    referência do campo não foi medido. Dê o clique triplo pela referência e confira depois o valor no
    painel; se ele não mudar, siga o item abaixo ("Se o painel não se deixar achar pelo DOM"). Depois do
    `Aplicar`, com o construtor ainda aberto, leia o `syncData` (`gravacao-construtor.md`, "O caminho pelo
    construtor") e compare os blocos com o backup: só podem ter mudado as chaves pretendidas, nos blocos
    pretendidos. Se houver qualquer outra diferença, não confirme: mostre à pessoa e saia por `Cancelar`.
  - **Se o painel não se deixar achar pelo DOM**, pare. A pessoa faz aquele passo pela tela (como no modo
    guiado do `SKILL.md`), e você confere o resultado no `syncData` antes do `Confirmar`.

## 10. O que ainda não foi medido

- A tela **Propagação de Mídia** (Único › Mídia › Propagação): chegou a ser aberta na loja A, mas o que ela
  mostra não foi lido nem registrado.
- O botão **Reprocessar Mídia**, na grade de Mídias.
- O botão **Histórico**, na grade de Banners (visto na loja B).
- Se o acervo de Mídias é por loja ou do admin inteiro (seção 6, item 4).
- Quanto tempo o cache `banner` guarda sozinho, sem limpeza.
- Trocar o arquivo de um banner que já existe pelo `Alterar` (aqui sempre se cadastrou arte nova).
- Criar **Tipo de Mídia** novo: na loja A o usuário disse não ter essa permissão.
- Mudar a Situação (pausar, despausar) de uma arte pelo `Alterar`, e qual clique grava o `Confirmar` dele;
  cadastrar uma arte já como `Pausado` (e se, com `Pausado`, os campos Link e Imagem aparecem).
- O botão `Duplicar` da grade de Banners: se a cópia nasce Ativa, com as mesmas datas, e se abre diálogo
  antes de gravar.
- Trocar a imagem de um bloco imagem até o fim, pelo `Blocos:` ou pela lupa do campo Mídia (`Selecionar`,
  `Aplicar`, gravar a página): na loja A a lupa foi aberta, mas a troca não foi feita (seção 3b).
- Se a arte entra e sai sozinha pela Data Início e pela Data Final, em que fuso vale a hora e quanto os
  caches (o `banner` e o da página) atrasam a troca (seção 8).
- O que o servidor faz com uma arte de proporção diferente da do bloco, com Tamanho personalizado ligado
  (recorta ou estica).
- Trocar o **Tamanho da Mídia** de um bloco banner, com Tamanho personalizado desligado, e conferir que o
  arquivo servido muda. E o que acontece com esse campo quando o bloco passa para um tipo de banner de outro
  Tipo de Mídia.
- `Visualizar` e `Alterar` de um Tipo de Banner: não foram abertos. A grade da lupa mostra só #, Código e
  Nome; na loja B o Tipo de Mídia foi lido pelo modelo da linha, por script (seções 5 e 9).
- O peso máximo e os formatos que o servidor aceita no upload: o seletor não filtra (seção 6, item 6) e um
  PNG de 1,3 MB entrou, mas o limite não foi medido.
- Duas artes ativas com a mesma Ordem no mesmo tipo, o que acontece entre cadastrar a arte nova e pausar a
  antiga (seção 3, "Trocar só a arte"; seção 4, caminho b): qual aparece primeiro, ou se o carrossel mostra
  as duas.
