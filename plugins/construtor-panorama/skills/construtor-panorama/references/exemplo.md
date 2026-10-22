# Exemplo trabalhado: migrar uma página institucional

Caso real, de uma loja da plataforma: a página institucional "quem somos" do site antigo (twig) — aqui
chamada de `https://www.SUA-LOJA.com.br/quem-somos` — refeita no construtor novo. Escolhida porque é
pequena — **11 blocos** — e ainda assim exercita container, grid, texto rico, ícone e banner. Textos,
slugs e ids da loja medida foram trocados por exemplos; a estrutura, os números e as decisões são os
reais. Os hosts, `#` de página e classes da **sua** loja ficam no perfil dela
(`~/.claude/panorama-lojas/<slug-da-loja>.md`).

O fluxo completo, com as regras e os passos citados aqui, está em `construtor.md`.

A home antiga dessa loja é péssima para aprender, e vale saber o tamanho de uma antes de aceitar
migrá-la: **91 blocos, 32 deles `code`**, com 3 banners e 10 vitrines (contados no campo `Blocos:` em
2026-08-10).

---

## Passo 1 — Ler a árvore da página antiga

O construtor twig emite cada bloco com **`id="block-…"`**, e as classes do elemento são o `class`
daquele bloco. Isso permite reconstruir a árvore inteira sem repositório.

⚠️ **O marcador é o `id`, NÃO a classe `builder-block`** — correção de uma versão anterior deste
arquivo, que custou 30 blocos numa migração real. Medido numa home antiga: **40** elementos
`.builder-block` contra **70** `[id^=block-]` dentro de `#area-body`; blocos de tipo `code`, `imagem`,
`vitrine` e `editor` não recebem aquela classe (recebem `block-imagem-container`,
`block-vitrine-container`, ou classe nenhuma). Ler por `.builder-block` perdeu uma faixa de etiquetas
inteira. Ver `armadilhas.md` 11a.

Rode no console com a página antiga aberta:

```js
(() => {
  const eBloco = el => !!(el.id && el.id.startsWith('block-'));
  const todos = [...document.querySelectorAll('#area-body [id^=block-]')];
  const nivel = el => { let n = 0, p = el.parentElement;
    while (p) { if (eBloco(p)) n++; p = p.parentElement; } return n; };
  return todos.map(el => {
    const cls = [...el.classList].join('.');
    const clone = el.cloneNode(true);
    [...clone.querySelectorAll('[id^=block-], style, script')].forEach(n => n.remove());
    const txt = (clone.innerText || '').trim().replace(/\s+/g, ' ');
    const hs = [...clone.querySelectorAll('h1,h2,h3,h4')].map(h => h.tagName.toLowerCase());
    return '  '.repeat(nivel(el)) + '[' + (cls || 'sem-classe') + ']'
      + (el.dataset.block ? ' nome:"' + el.dataset.block + '"' : '')
      + (hs.length ? ' ' + hs.join(',') : '')
      + (clone.querySelectorAll('img').length ? ' img:' + clone.querySelectorAll('img').length : '')
      + (clone.querySelectorAll('svg').length ? ' svg:' + clone.querySelectorAll('svg').length : '')
      + (txt ? ' txt:' + txt.length : '');
  }).join('\n');
})()
```

✅ O `data-block` do elemento traz o **nome do bloco como a pessoa o batizou** na origem (ex.:
`"Trio de ofertas (Grid 6.3.3)"`, `"Coluna 8 de 12"`) — reaproveite no campo `name` da árvore nova.

Resultado nesta página (`body class` = `page-builder` mais uma classe própria da página, do tipo
`pg-…`; as outras classes da árvore também foram criadas pela loja) — ⚠️ esta árvore foi levantada com
o seletor antigo, então pode faltar bloco `code`/`imagem`/`vitrine`/`editor`; releia com o script acima
antes de usar como referência:

```
[container-fluid.fundo-top]
  [container.titulo-center]              h1  txt:445
[page-quem-somos]
  [header]
    [container]
      [row]
        [col-sm-12.copy-sobre-nos]       svg:1  txt:509
        [col-sm-6]                       svg:1  txt:478
        [col-sm-6]                       svg:1  txt:405
[container.box-info]                     txt:19
  [block-banner-container]               h2  img:12  svg:2
```

Pegue também o texto de cada bloco — o mesmo script, trocando `txt:` + comprimento por
`txt.slice(0, 800)`.

**Em página grande, prefira baixar e parsear local.** Rodar no console vai bem para uma olhada, mas em
página com dezenas de blocos a saída satura e você acaba puxando em fatias. Dois motivos concretos:

- a saída é **truncada** e você perde justamente o fim da árvore;
- se estiver dirigindo o navegador por ferramenta (MCP, DevTools remoto), devolver `innerHTML` com
  **URL de imagem versionada** pode ser **bloqueado pelo filtro da extensão** (`BLOCKED: Cookie/query
  string data`). Devolver só tags e texto passa; HTML cru com query string, não.

O caminho sem esses dois problemas — e que também já traz o CSS da página (ver `construtor.md`, passo 1):

```bash
# Bash. Em PowerShell use `curl.exe` — `curl` lá é alias de Invoke-WebRequest.
curl -s https://www.SUA-LOJA.com.br/formas-de-pagamento > original.html
python -m pip install beautifulsoup4 --quiet
```

```python
from bs4 import BeautifulSoup
import re
s = BeautifulSoup(open("original.html", encoding="utf-8").read(), "html.parser")
area = s.select_one("#area-body")
blocos = area.select("[id^=block-]")   # NÃO ".builder-block" — perde code/imagem/vitrine/EDITOR
print(len(blocos), "blocos")
print(s.find("style").get_text())      # o CSS da PÁGINA (campo `style`), inteiro

# ⭐ E a CONFIG de cada bloco: o construtor twig emite um <style> por bloco dentro de
# #area-body, com data-block. É de lá que saem os fundos, os paddings e o `position`.
# Isso dispensa abrir o diálogo `Alterar` da página publicada só para ler.
for st in area.find_all("style"):
    print("CONFIG", st.get("data-block"), re.sub(r"\s+", " ", st.get_text()).strip())

for i, el in enumerate(blocos):
    if el.select_one("[id^=block-]"):             # só as folhas têm conteúdo próprio
        continue
    cls = ".".join(el.get("class") or [])
    nome = el.get("data-block") or ""
    print(f"[{i}] .{cls} {nome!r}", re.sub(r"\s+", " ", el.decode_contents())[:300])
```

Saída típica do laço de config, na `/politica-de-privacidade` (13 `<style>`, 6 faixas):

```
CONFIG Titulo inicial - Política de Privacidade  #block-a1b2c3d4-container{ background-color: #RRGGBB; position: initial; }
CONFIG A sua privacidade é importante para nós.  #block-e5f6g7h8-container{ background-color: null; position: initial; }
CONFIG Placeholder                               #block-i9j0k1l2-container{ padding-top: 50px; padding-bottom: 50px; ... }
```

Leia assim: `background-color: null` é o bloco **sem** fundo (declaração inválida, o navegador
descarta — não confunda com branco explícito), e bloco **sem `<style>` nenhum** está todo no default.
Ver `armadilhas.md` 11a.

Escreva o resultado num arquivo e leia de lá: sem truncamento, sem filtro, e você pode reler quantas
vezes quiser sem voltar ao navegador.

### ⚠️ Baixe a original DUAS vezes: desktop e mobile

O site antigo também decide por **user agent** — o `<body>` vem com `notMobile` ou `isMobile` — e
**serve árvores diferentes**. Se você ler só o HTML de desktop, migra uma página que não é a que o
celular vê.

```bash
curl -s https://www.SUA-LOJA.com.br/prazos > orig-desktop.html
curl -s -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 \
(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" \
     https://www.SUA-LOJA.com.br/prazos > orig-mobile.html
```

Na `/prazos` da loja medida: **13 blocos no desktop, 11 no mobile** (contados na época com `.builder-block`, que
subconta — o que importa aqui é a diferença entre os dois arquivos, não o valor absoluto). A seção "O prazo venceu e meu pedido
ainda não chegou" perde `row` e coluna no celular — sobra um `container-fluid` cinza vazio e o e-mail
do SAC **some para quem entra pelo telefone**.

Compare a contagem e a lista de classes dos dois arquivos antes de desenhar a árvore. E quando achar
uma diferença assim, **leve para a pessoa em vez de decidir sozinho**: costuma ser defeito da página
antiga, não intenção — e replicar defeito ou corrigi-lo é decisão de conteúdo, não sua. O modelo de
duas raízes suporta os dois caminhos sem esforço extra.

## Passo 2 — Descrever a árvore em português e confirmar

Antes de escrever JSON, escreva isto e mostre para a pessoa:

```
1. Faixa de abertura com fundo destacado
   └─ Container centralizado: título "Bem-vindo à nossa loja" + parágrafo de apresentação

2. Seção "sobre nós"
   └─ Container
      └─ Linha de colunas
         ├─ Coluna 12/12: "Nossa Missão" (com ícone)
         ├─ Coluna 6/12: "Como Funciona" (com ícone)
         └─ Coluna 6/12: terceiro bloco de texto (com ícone)

3. Faixa de informações
   └─ Banner com 12 imagens (logos/selos) + título
```

Confirmar aqui custa uma frase. Descobrir depois de montar 11 nós custa a tarde.

## Passo 3 — Decidir bloco por bloco

Aqui é onde a hierarquia da regra 2 do `construtor.md` (config nativa → classe do tema → bloco
`code`) opera. Vale registrar o raciocínio, porque ele se repete em
quase toda migração.

| Original | Escolha | Por quê |
|---|---|---|
| `container-fluid.fundo-top` | `block` com `background.enable: true` | Fundo é config, não classe. Um controle no painel em vez de CSS que ninguém acha depois |
| `container.titulo-center` | `block` com `display` flex, `alignItems: center` | O centramento é flexbox nativo. Não precisa da classe `titulo-center` nem do CSS dela |
| `row` + `col-sm-12` / `col-sm-6` | `block` com `class:"row"` / `class:"col-sm-*"` e `display.type:"flex"` na linha | ⚠️ **Corrigido:** o grid do Bootstrap **existe** no tema novo (`.row`, `.col-sm-*` com breakpoint em 576px — medido). Use as classes do tema. Não tente resolver por `dimensions.width`: é **ignorado** (`armadilhas.md` 13). E leia a armadilha do gutter em `blocos.md` antes — a `.row` do tema sai 24px estreita se você não zerar o padding do container |
| Título + parágrafo | `editor` | Texto rico, editável pelo time de conteúdo depois. `code` tiraria essa capacidade |
| Ícone em SVG inline | `imagem`, ou `code` como exceção | Se o ícone estiver cadastrado como mídia, `imagem` — ganha lazy loading e dimensões. Se for SVG inline sem cadastro, `code` é exceção legítima: registre no `name` |
| 12 imagens em sequência | **`banner`** | Ganho decisivo: um bloco referenciando um tipo de banner substitui 12 `<img>` cruas, fica editável no painel, sai com **`alt` de verdade** (o `nome` do cadastro) e, com `apply_aspect_ratio: true` + `width`/`height` numéricos, **reserva o espaço de cada slide** (`aspect-ratio:W/H`) — o que mata o layout shift. ⚠️ **Mas não espere `loading="lazy"` do banner**: o componente nunca passa `loading` (medido: 0 de 4 slides). Isso é do bloco `imagem`, não do `banner` — ver `blocos.md`, seção banner |

Nenhum `accordion` nesta página — então a limitação de FAQ (`armadilhas.md`) não se aplica aqui.

## Passo 4 — O JSON

Seção 1 completa, para servir de molde. Note que **todo** campo da config base aparece: partir do
default e alterar só o necessário evita omitir campo que o construtor espera.

⚠️ **Este molde já foi corrigido duas vezes — o que mudou desde a primeira versão:**

1. **A largura saiu de `dimensions` e foi para `class`.** O exemplo usava `dimensions.enable: true`
   com `width: "1140px"` / `"100%"`. Medido depois: o renderizador **ignora `dimensions.width`**
   (`armadilhas.md` item 13). Agora a faixa é `class: "container-fluid"` e o miolo `class: "container"`.
   Para colunas, `row` + `col-sm-*`, com a receita de gutter de `blocos.md`.
2. **A config base mudou de tipo** em `background.size_custom` (`0`), `background.backgroundPreview`
   (`[]`), `dimensions.*` (`null`/`false`) e `border` (virou **objeto**). Já corrigidos abaixo — mas
   releia o default vivo no `syncData` de um `Box` novo antes de gerar em volume.

```jsonc
[
  {
    "type": "block",
    "id": "a1f4k9m2",
    "name": "Faixa de abertura",
    "child": [
      {
        "type": "block",
        "id": "b7x2p5qd",
        "name": "Container centralizado",
        "child": [
          {
            "type": "editor",
            "id": "c3m8t1vz",
            "name": "",
            "child": [],
            "opened": false,
            "device_show": "both",
            "config": {
              "code": "<h1>Bem-vindo à nossa loja</h1><p>Texto de apresentação da loja: quem somos, desde quando atendemos e o que nos diferencia.</p>",
              "positioning": "initial",
              "place": "top: 0px; left: 0px;",
              "display": { "type": "block", "direction": "row", "alignItems": "flex-start",
                           "justifyContent": "flex-start", "gap": "0px", "flex_wrap": false },
              "flexBehavior": { "enable": false, "flex_grow": 0, "flex_shrink": 1, "flex_basis": "0px" },
              "spacing": { "enable": false },
              "padding": { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" },
              "margin": { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" },
              "background": { "enable": false, "color": null, "image": { "id": "", "nomeArquivo": "" },
                              "repeat": "repeat", "positionX": "50%", "positionY": "50%",
                              "size": "auto", "size_custom": 0, "backgroundPreview": [] },
              "dimensions": { "enable": false, "width": null, "height": null, "responsive_width": false },
              "class": "",
              "customize_borders": { "enable": false },
              "border": { "width":  { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" },
                          "style": "solid",
                          "color": null,
                          "radius": { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" } },
              "overflow": "visible"
            }
          }
        ],
        "opened": false,
        "device_show": "both",
        "config": {
          "positioning": "initial",
          "place": "top: 0px; left: 0px;",
          "display": { "type": "flex", "direction": "column", "alignItems": "center",
                       "justifyContent": "flex-start", "gap": "16px", "flex_wrap": false },
          "flexBehavior": { "enable": false, "flex_grow": 0, "flex_shrink": 1, "flex_basis": "0px" },
          "spacing": { "enable": false },
          "padding": { "apply": true, "type": "single", "top": "48px", "right": "16px",
                       "bottom": "48px", "left": "16px" },
          "margin": { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" },
          "background": { "enable": false, "color": null, "image": { "id": "", "nomeArquivo": "" },
                          "repeat": "repeat", "positionX": "50%", "positionY": "50%",
                          "size": "auto", "size_custom": 0, "backgroundPreview": [] },
          "dimensions": { "enable": false, "width": null, "height": null, "responsive_width": false },
          "class": "container",
          "customize_borders": { "enable": false },
          "border": { "width":  { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" },
                      "style": "solid",
                      "color": null,
                      "radius": { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" } },
          "overflow": "visible"
        }
      }
    ],
    "opened": false,
    "device_show": "both",
    "config": {
      "positioning": "initial",
      "place": "top: 0px; left: 0px;",
      "display": { "type": "flex", "direction": "row", "alignItems": "flex-start",
                   "justifyContent": "center", "gap": "0px", "flex_wrap": false },
      "flexBehavior": { "enable": false, "flex_grow": 0, "flex_shrink": 1, "flex_basis": "0px" },
      "spacing": { "enable": false },
      "padding": { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" },
      "margin": { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" },
      "background": { "enable": true, "color": "#ebebeb", "image": { "id": "", "nomeArquivo": "" },
                      "repeat": "repeat", "positionX": "50%", "positionY": "50%",
                      "size": "auto", "size_custom": 0, "backgroundPreview": [] },
      "dimensions": { "enable": false, "width": null, "height": null, "responsive_width": false },
      "class": "container-fluid",
      "customize_borders": { "enable": false },
      "border": { "width":  { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" },
                  "style": "solid",
                  "color": null,
                  "radius": { "apply": false, "type": "single", "top": "", "right": "", "bottom": "", "left": "" } },
      "overflow": "visible"
    }
  }
]
```

Repare em três coisas:

- **`padding.apply: true`** junto com os valores. Sem o toggle, o padding não seria aplicado.
- **`dimensions` fica no default** (`enable: false`, `width: null`). Largura não sai daí — sai da
  `class`. O padrão "valor sem toggle não faz nada" continua valendo para `padding`, `margin`,
  `background` e `spacing`, que é onde ele importa.
- **`class` só com utilidade do tema**, e vazia no `editor`. Nenhuma linha de CSS de página foi
  necessária para esta seção — era esse o objetivo, comparar com os 8.324 caracteres que uma home
  `-v2` medida carregava. Classe do tema não é CSS de página; classe inventada é.

Para a linha de colunas da seção 2, a forma que **funciona hoje**: a linha é um `block` com
`class: "row"` e `display.type: "flex"` + `flex_wrap: true` (sem os dois a linha empilha); cada coluna
é um `block` com `class: "col-sm-12"` ou `"col-sm-6"`. Elas empilham sozinhas abaixo de 576px, que é
onde a regra de largura do tema deixa de valer. Se a página antiga tinha gutter diferente de 12px,
aplique a receita de `blocos.md` (zerar padding do `.container` e margin da `.row`, devolver o gutter
no `padding` lateral das colunas) — foi assim que a `/prazos` fechou com desvio de 0px.

⚠️ **Essa receita tem uma variante, e escolher errado custa 5px por coluna.** Ela só fecha exato quando
o `.container` do tema já casa com a original. Se a original **trava** a largura (a home antiga trava em
1200px com gutter de 10px), zerar a `margin` do `.row` também mata o transbordo dos 2×10px das pontas e
a linha sai com 1150. Aí a variante correta é manter o padding e devolver a margem negativa por regra de
página. As duas tabelas estão em `blocos.md`, seção de grid.

## Passo 5 — Entregar e verificar

Siga `gravacao-construtor.md`. Nesta página, as referências saem da origem:

- os **ícones**, se forem virar bloco `imagem`, precisam de id de mídia, e ele vem da URL da imagem
  renderizada (`.../img.panorama/imagem/{ID}/...`);
- o **banner de 12 imagens** precisa do `banner_tipo`, e ele vem do campo `Blocos:` da página original
  (`armadilhas.md` item 4: `Alterar` → aba `Configurações`, leia com `lerBlocos()`, saia por `Cancelar`).

Entregar vazio é o último recurso: só quando a referência não existe na origem, e aí diga à pessoa o que
falta selecionar no painel. Inventar id nunca: produz bloco que não renderiza e não diz por quê.

A página antiga tinha um `blockBodyClass` próprio (do tipo `pg-…`). Só replique se houver CSS de tema
dependendo dessa classe; se a página foi montada nativa, ela não precisa. Se replicar, lembre que todo
CSS de página escrito com ela alcança o cabeçalho e o rodapé (`armadilhas.md` item 0).
