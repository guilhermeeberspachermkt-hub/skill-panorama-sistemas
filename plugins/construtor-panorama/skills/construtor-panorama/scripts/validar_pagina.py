#!/usr/bin/env python3
"""
Validador de página do construtor Panorama.

Uso:
    python validar_pagina.py caminho/para/pagina.json [--cor-link '#RRGGBB'] [--base backup.json]

    --cor-link  a cor do link MEDIDA na página original com getComputedStyle. Cada loja tem a
                sua (o perfil da loja, ~/panorama-lojas/<slug-da-loja>.md, guarda a que
                já foi medida). Sem ela, o validador avisa em todo bloco com link, para você medir.
    --base      o backup do campo `Blocos:` de antes da sua mudança (edição pontual numa página que
                já está no ar, construtor.md seção 7). ERRO que já aparece, com o mesmo texto, no
                backup vira AVISO "pré-existente, fora do pedido": liste para a pessoa e não corrija
                sem pedido. Só os ERROS novos reprovam. A comparação é pelo texto da mensagem: um
                ERRO cujo texto mudou (a lista de campos legados cresceu, por exemplo) conta como novo.

Lê também JSON relido do admin, em que o servidor gravou todo escalar como texto ("false", "0",
"null"; armadilhas.md 27): "false" conta como desligado e "null" como vazio.

Aceita os dois formatos:
  - o formato do campo "Blocos:" do admin: {style, block_list, body_class, config}
  - um array de blocos cru: [ {...}, {...} ]

Ele NÃO conserta nada — só aponta o que está errado ou suspeito, para você corrigir
antes de colar no admin. O construtor aceita JSON malformado sem reclamar, então esta
checagem é a rede de segurança que falta.

Este validador é ANTES de colar, e só olha o JSON. O DEPOIS de colar — com a página no ar,
comparada com a original — é o `scripts/verificar_paridade.py`. Os dois se completam.

O QUE ELE CHECA
  Esqueleto: as duas raízes (device_show 'desktop' e 'mobile', cada uma com filhos — raiz
  sem filho = página vazia para quem entra por aquele device), ids de 8 caracteres
  [a-z0-9] únicos, tipos dentro do catálogo, campos de esquema legado (use_slider,
  use_grid, itemsPerGridRow, parentId, only_desktop, only_mobile — copiar JSON de página
  antiga é o jeito mais rápido de introduzi-los), `place` no formato antigo "top left",
  item de `block_list` ou de `child` que não é um bloco {...}, grupo da base (padding, margin,
  display, background, dimensions, border...) que não é objeto, e valor preenchido com o
  toggle do grupo desligado (padding.apply, margin.apply, dimensions.enable,
  background.enable... o valor é simplesmente ignorado na renderização).

  Referências a cadastro (imagem.midia.id, vitrine.vit_id, menu.id, video.ban_id,
  banner_tipo.id): id vazio vira info. O id sai da origem (armadilhas.md item 4); selecionar
  no painel é o último recurso, para referência que não existe lá. Duas regras de
  vitrine dinâmica, medidas numa home real da plataforma, onde 2 das 8 vitrines são
  `operation: history`:
    - vitrine com `origem: "operation"` legitimamente NÃO tem vit_id — cobrar era ruído,
      e ruído é o que faz a pessoa parar de ler a saída; então ela é DISPENSADA da checagem
      de referência;
    - a recíproca é ERRO: `origem: "operation"` SEM o campo `operation` renderiza a
      vitrine VAZIA, sem erro nenhum no admin nem no console.

  E os QUATRO defeitos que já são decidíveis aqui, no JSON, antes de gravar — de oito que
  passaram pela verificação manual numa migração real da home:
    - `margin` em bloco `imagem` (cai no <img> e DISTORCE a imagem em vez de espaçar:
      605x280 numa coluna de 580 com margin-bottom 10px deu âncora 278 e imagem esticada
      para 580x278, quando o correto era 268, e ZERO de espaço até a de baixo)
    - `<script>` em bloco `code` (o React insere por dangerouslySetInnerHTML e script
      inserido por innerHTML não executa — código morto que viaja duas vezes por visita)
    - `vitrine` em grid sem o campo `grid` (o tema faz (itemsPerGridRow?.desktop)||1 e
      renderiza UMA coluna, com todos os produtos empilhados)
    - regra do campo `style` usando classe do TEMA (.pano-*, .swiper*) sem escopo no
      #layout-main-content (o body_class fica no <body>: uma regra assim alcançou 96
      elementos do <header>, 13 do <footer> e o botão flutuante — logo 945x313 em vez de
      180x60, header 418px em vez de 144px)

  Mais tipografia em `editor`/`code`: <p>/<h1..h6> sem font-size explícito e <a> sem
  text-decoration, porque a regra do tema é `p{font-size:1.4em}`, RELATIVA — definir o tamanho
  num ancestral PIORA (um <td> a 16,8px produz <p> a 23,52px). Medido numa faixa de tags de uma
  home real: os <p> saíram a 22,4px e os <a> a 16px na cor de destaque da loja, contra 14px/lh
  21px (cinza) nos <p> da original e 14,4px/lh 20px no h1 dela. Ver armadilhas.md 11c.

Saída: relatório legível. Código de saída 0 se não houver ERRO (avisos não reprovam), 1 se houver.
"""
import json
import re
import sys

CATALOGO = {
    "block", "logo", "editor", "code", "sidebar-menu", "newsletter",
    "menu", "video", "modal", "imagem", "storerating", "vitrine", "banner",
    "accordion",  # fora da paleta, mas renderiza — ver armadilhas.md
}

# grupos de config governados por toggle: (chave_do_grupo, chave_do_toggle, campos_de_valor)
TOGGLES = [
    ("padding", "apply", ["top", "right", "bottom", "left"]),
    ("margin", "apply", ["top", "right", "bottom", "left"]),
    ("dimensions", "enable", ["width", "height"]),
    ("spacing", "enable", []),
    ("flexBehavior", "enable", []),
    ("customize_borders", "enable", []),
]

# grupos da base de config que, quando aparecem, são objetos {...} (blocos.md, a base de config)
GRUPOS_BASE = ["padding", "margin", "display", "background", "dimensions", "border",
               "flexBehavior", "spacing", "customize_borders"]

# campos de esquema antigo que não devem ser gerados.
#
# NOTA sobre "bannerlist" — esta nota já esteve ERRADA e contradizia blocos.md/armadilhas.md.
# O correto, testado ponta a ponta: a fonte da verdade é `banner_tipo`; o servidor o resolve
# PARA uma `bannerlist` na entrega e remove o `banner_tipo`. Por isso você VÊ bannerlist ao ler
# uma página pronta — mas escrevê-la à mão NÃO funciona: o pipeline devolve `bannerlist: []` e o
# carrossel sai vazio. "bannerlist" fica fora de LEGADO_CHAVES só porque não é erro de esquema:
# quem trata o caso é a checagem específica de banner mais abaixo (bannerlist sem banner_tipo
# vira AVISO). Se o master do tipo não tem o tamanho que você precisa: no site novo (React), a
# saída é bloco `code` com carrossel em CSS; numa página servida pelo site em twig, ligue
# "Tamanho personalizado" no bloco (use_custom_size + width/height), que escolhe a variante
# servida (imagens-e-banners.md, 7). Ver blocos.md (seção banner) e armadilhas.md item 4.
LEGADO_CHAVES = ["use_slider", "use_grid", "itemsPerGridRow",
                 "parentId", "only_desktop", "only_mobile"]

# referências a cadastro (id vazio => precisa selecionar no painel).
# banner tratado à parte: aceita banner_tipo.id OU bannerlist preenchido.
REFERENCIAS = {
    "imagem": ("midia", "id"),
    "vitrine": ("vitrine", "vit_id"),
    "menu": ("menu", "id"),
    "video": ("video", "ban_id"),
}

ERROS, AVISOS, INFOS = [], [], []
def erro(m): ERROS.append(m)
def aviso(m): AVISOS.append(m)
def info(m): INFOS.append(m)


# O servidor grava TODO escalar como texto: `false` volta "false", `0` volta "0", `null` volta
# "null" (armadilhas.md 27). Um JSON relido do campo `Blocos:` — o backup de uma edição pontual,
# e a versão nova montada a partir dele — chega assim, e para o Python "false" é verdadeiro.
# Sem estas duas funções, todo bloco `imagem` relido do admin dava ERRO falso de "margin.apply
# ligado", e um toggle "false" com valor preenchido passava calado.
def ligado(v):
    """O interruptor está ligado? Aceita booleano e o texto que o admin devolve."""
    if isinstance(v, str):
        return v.strip().lower() not in ("", "false", "0", "null", "undefined")
    return bool(v)


def preenchido(v):
    """O campo tem valor? "", "null" e "0" (como o admin devolve o vazio e o zero) não contam."""
    if v is None or v is False:
        return False
    return str(v).strip().lower() not in ("", "null", "undefined", "false", "0")


# --------------------------------------------------------------------------- #
# CSS de página: o que vaza para o tema                                        #
# --------------------------------------------------------------------------- #
# `body_class` fica no <body>, então TODA regra do campo `style` alcança header, rodapé e
# elementos flutuantes. O que vaza é regra que usa classe DO TEMA. Medido na migração da
# home: `.container` e `.row` tiveram 0 ocorrências em header/footer (sempre foram seguras);
# `.pano-link-anchor` tinha 127 ocorrências na página, 96 no <header>, 13 no <footer> e 1 no
# botão flutuante de WhatsApp (que fica FORA de header e footer — irmão depois do </footer>).
CLASSE_TEMA_RE = re.compile(r"\.(pano-[A-Za-z0-9_-]+|swiper[A-Za-z0-9_-]*)")

# O <main> do tema novo. Contém as âncoras do miolo e NÃO contém header, rodapé nem
# flutuantes — é onde escopar.
MIOLO_TEMA = "#layout-main-content"

# A cor do link NÃO é uma constante: cada loja tem a sua, e ela tem de ser MEDIDA na original
# com getComputedStyle. Numa loja real, `platform.css` e `loja.css` declaravam uma cor para `a`
# e o computado era outra (a --primary-color da loja). Ver armadilhas.md 23. Vem de --cor-link.
COR_HEX_RE = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
COR_LINK = None   # preenchida por main() a partir de --cor-link


def _tirar_keyframes(css):
    """Remove blocos @keyframes INTEIROS, corpo incluso (as chaves aninham).

    ⚠️ `0%`, `17.33%` NAO sao seletores. Hoje eles nao geram ERRO aqui por sorte — `checar_style`
    so' reclama de seletor que casa `.pano-*`/`.swiper*`, e uma porcentagem nao casa. Mas um
    `@keyframes` cujo passo contenha classe do tema geraria ERRO falso, e o `verificar_paridade.py`
    tem uma funcao de mesmo nome que JA' remove os keyframes — duas funcoes homonimas com
    comportamentos diferentes e' armadilha para a proxima checagem que alguem acrescentar aqui.
    """
    fora, i = [], 0
    padrao = re.compile(r"@(?:-\w+-)?keyframes\b[^{]*\{", re.I)
    while True:
        m = padrao.search(css, i)
        if not m:
            fora.append(css[i:])
            break
        fora.append(css[i:m.start()])
        prof, j = 1, m.end()
        while j < len(css) and prof:
            if css[j] == "{":
                prof += 1
            elif css[j] == "}":
                prof -= 1
            j += 1
        i = j
    return "".join(fora)


def seletores_do_style(css):
    """Extrai os seletores de um CSS simples (ignora @keyframes, achata @media)."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = _tirar_keyframes(css)
    css = re.sub(r"@media[^{]*\{", "", css)
    sels = []
    for bloco in re.findall(r"([^{}]+)\{[^{}]*\}", css):
        for s in bloco.split(","):
            s = s.strip()
            if s and not s.startswith("@"):
                sels.append(s)
    return sels


def checar_style(css, body_class):
    """Regra do campo `style` que usa classe do TEMA e não está escopada no miolo → ERRO.

    Foi o defeito mais grave de uma migração real: `.minha-home .pano-link-anchor
    {display:block;width:100%}` (com `minha-home` no body_class), escrita para duas imagens do
    miolo, quebrou o tema inteiro.
    Medido contra outra página do MESMO site novo:
        logo do header   945x313  (correto 180x60)
        altura do header 418px    (correto 144px)
        logo do rodapé   ~248px   (correto 160px)
        botão de WhatsApp barra verde de 100vw (correto: pílula 132x36)
    """
    for sel in seletores_do_style(css):
        m = CLASSE_TEMA_RE.search(sel)
        if not m:
            continue
        if MIOLO_TEMA in sel:
            continue  # escopado no <main> do tema — é a correção certa
        sufixo = sel.split()[-1]
        prefixo = ("." + body_class + " ") if body_class else ""
        erro(f"CSS de página: a regra `{sel}` usa a classe do TEMA `{m.group(0)}` e NÃO está "
             f"escopada em `{MIOLO_TEMA}`. Como o body_class fica no <body>, ela desce para "
             f"header, rodapé e flutuantes. Medido: uma regra assim alcançou 96 elementos do "
             f"<header>, 13 do <footer> e o botão flutuante — o logo virou 945x313 (correto "
             f"180x60) e o header 418px (correto 144px). Escreva "
             f"`{prefixo}{MIOLO_TEMA} {sufixo}`.")
        if "pano-link-anchor" in sel:
            # A tentativa intuitiva de conserto (escopar nas próprias classes) é incompleta:
            # medido, das 17 .pano-link-anchor do miolo, 4 estavam em .swiper-slide, 10 em duas
            # classes próprias da página (2 numa, 8 na outra) e 3 em .col-sm-6 — escopar nas
            # duas classes próprias deixou 7 de fora.
            aviso(f"Sobre `{sel}`: escopar só nas suas PRÓPRIAS classes conserta o tema mas deixa "
                  f"parte das âncoras do miolo de fora (medido: 7 das 17 ficaram sem a regra). "
                  f"Escope no `{MIOLO_TEMA}`, que cobre as 17 e não alcança o tema.")


TAGS_TEXTO = ("p", "h1", "h2", "h3", "h4", "h5", "h6", "a", "li", "ol", "ul", "td", "strong", "em")


def regras_tipografia(css):
    """Do campo `style`, quais TAGS recebem quais propriedades — e sob quais classes.

    Existe porque a checagem de tipografia abaixo cobrava `style=` INLINE no elemento e
    ignorava o campo `style` da própria página que ela está validando. Numa migração real
    isso rendeu 18 avisos numa página cuja tipografia estava 100% especificada por regra
    escopada — e que mediu, no navegador, idêntica à original (`p` 16,8/25,2, `h2`
    32/35,2/600, `li` 12/18). Checador que grita errado 18 vezes ensina a ser ignorado;
    é o mesmo defeito que o `armadilhas.md` 21 registra sobre o outro script.

    Devolve lista de (tag, {props}, {classes do seletor}). Quem consome compara o conjunto
    de classes com as do PRÓPRIO bloco: uma regra `.txt p{...}` só cobre bloco cuja
    `config.class` tenha `txt`.
    """
    out = []
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = _tirar_keyframes(css)
    css = re.sub(r"@media[^{]*\{", "", css)
    for sel_bruto, corpo in re.findall(r"([^{}]+)\{([^{}]*)\}", css):
        props = {p.split(":")[0].strip().lower()
                 for p in corpo.split(";") if ":" in p}
        if not props:
            continue
        for sel in sel_bruto.split(","):
            sel = sel.strip()
            if not sel or sel.startswith("@"):
                continue
            ultimo = sel.split()[-1].split(">")[-1].strip()
            m = re.match(r"^([a-z][a-z0-9]*)", ultimo)
            if not m or m.group(1) not in TAGS_TEXTO:
                continue           # o último simples não é uma tag de texto
            if re.search(r"::?[a-z-]+$", ultimo):
                continue           # pseudo-elemento/classe: :hover, ::after — não é o estado base
            classes = set(re.findall(r"\.([A-Za-z_][\w-]*)", sel))
            out.append((m.group(1), props, classes))
    return out


def tipografia_coberta(regras, tag, prop, classes_do_bloco, body_class):
    """A regra de página já define `prop` para `tag` num bloco com estas classes?"""
    disponiveis = set(classes_do_bloco) | ({body_class} if body_class else set())
    for t, props, classes in regras:
        if t == tag and prop in props and classes <= disponiveis:
            return True
    return False


def achatar(blocos):
    out = []
    def w(lista):
        for b in lista:
            if isinstance(b, dict):
                out.append(b)
                filhos = b.get("child")
                if isinstance(filhos, list):
                    w(filhos)
    w(blocos)
    return out


def validar(doc):
    # --- descobrir a lista de blocos e o formato ---
    regras_txt, body_class, cor_do_style = [], "", ""
    if isinstance(doc, dict):
        if "block_list" not in doc:
            erro("Objeto de topo não tem 'block_list'.")
            return
        block_list = doc["block_list"]
        for chave in ("style", "body_class", "config"):
            if chave not in doc:
                aviso(f"Formato do campo Blocos incompleto: falta a chave de topo '{chave}'. "
                      f"O admin espera {{style, block_list, body_class, config}}.")
        body_class = (str(doc.get("body_class") or "").split() or [""])[0]
        if doc.get("style"):
            info(f"'style' tem {len(doc['style'])} caracteres de CSS de página. "
                 f"CSS recorrente pertence ao tema, não à página (ver references/construtor.md, regra 2, nível 2).")
            checar_style(doc["style"], body_class)
            # a tipografia pode estar resolvida AQUI em vez de inline — ver regras_tipografia
            regras_txt = regras_tipografia(doc["style"])
            cor_do_style = doc["style"]
    elif isinstance(doc, list):
        block_list = doc
        aviso("Recebido um array cru de blocos. Para colar no admin, embrulhe em "
              "{style:'', block_list:[...], body_class:'', config:{...}}.")
    else:
        erro("JSON não é nem objeto nem array.")
        return

    if not isinstance(block_list, list) or not block_list:
        erro("'block_list' vazio ou não é lista.")
        return

    # --- as duas raízes ---
    ds_raizes = [str(r.get("device_show")) for r in block_list if isinstance(r, dict)]
    if len(block_list) == 2 and set(ds_raizes) == {"desktop", "mobile"}:
        for r in block_list:
            if not (isinstance(r.get("child"), list) and r["child"]):
                erro(f"A raiz '{r.get('name') or r.get('device_show')}' está sem filhos — "
                     f"quem entrar por esse device vê a página vazia. (Se isto é o esqueleto do "
                     f"passo 3 do construtor.md, as duas raízes vazias gravadas só para destravar um "
                     f"rascunho vazio, este ERRO é esperado e não bloqueia essa gravação técnica.)")
    else:
        aviso("Esperado exatamente 2 raízes, uma com device_show 'desktop' e outra 'mobile' "
              f"(ver references/construtor.md, seção das duas raízes). Encontrado: {len(block_list)} raiz(es), "
              f"device_show={ds_raizes}. Se isto é um fragmento de seção e não uma página inteira, ignore.")

    todos = achatar(block_list)

    # Item que não é objeto (número, texto, null) numa lista `child` ou em `block_list`: `achatar`
    # pula, e ele passava calado, com exit 0. O construtor grava sem reclamar.
    def nao_objetos(lista, onde):
        for x in lista:
            if not isinstance(x, dict):
                erro(f"item de bloco não é objeto: {json.dumps(x, ensure_ascii=False)[:40]} em {onde}. "
                     f"Cada item de 'block_list' e de 'child' é um bloco {{...}} (ver blocos.md).")
            elif isinstance(x.get("child"), list):
                nao_objetos(x["child"], f"'child' de {x.get('type')} '{x.get('id')}'")
    nao_objetos(block_list, "'block_list'")

    # JSON malformado mas plausível derrubava o validador com traceback (id numérico: TypeError;
    # config em lista: AttributeError). Aqui ele vira ERRO explicado, e o resto da checagem segue.
    for b in todos:
        c = b.get("config")
        if c is not None and not isinstance(c, dict):
            erro(f"{b.get('type')} '{b.get('id')}': 'config' tem de ser um objeto {{...}}, "
                 f"veio {type(c).__name__}.")
            b["config"] = {}
        if b.get("id") is not None and not isinstance(b["id"], str):
            erro(f"{b.get('type')}: 'id' tem de ser texto de 8 caracteres [a-z0-9], veio {b['id']!r}.")
            b["id"] = str(b["id"])
        if b.get("type") is not None and not isinstance(b["type"], str):
            erro(f"bloco '{b.get('id')}': 'type' tem de ser texto (ver blocos.md), veio {b['type']!r}.")
            b["type"] = str(b["type"])
        # grupo da base em texto, número ou lista: as checagens de toggle abaixo o pulavam. "null" e ""
        # (o vazio como o admin devolve, armadilhas.md 27) não são defeito.
        for grupo in GRUPOS_BASE:
            g = (b.get("config") or {}).get(grupo)
            if g is not None and not isinstance(g, dict) and preenchido(g):
                erro(f"{b.get('type')} '{b.get('id')}': '{grupo}' tem de ser um objeto {{...}} (formato em "
                     f"blocos.md), veio {type(g).__name__}: {json.dumps(g, ensure_ascii=False)[:40]}.")

    # --- ids ---
    ids = [b.get("id") for b in todos]
    faltando_id = [b.get("type") for b in todos if not b.get("id")]
    if faltando_id:
        erro(f"{len(faltando_id)} bloco(s) sem 'id': {faltando_id[:6]}")
    mal_formado = [i for i in ids if i and not re.fullmatch(r"[a-z0-9]{8}", i)]
    if mal_formado:
        erro(f"id(s) fora do formato de 8 caracteres [a-z0-9]: {mal_formado[:6]}")
    repetidos = sorted({i for i in ids if i and ids.count(i) > 1})
    if repetidos:
        erro(f"id(s) repetido(s) no documento (têm de ser únicos na página): {repetidos[:6]}")

    # --- tipos ---
    fora = sorted({b.get("type") for b in todos if b.get("type") not in CATALOGO})
    if fora:
        erro(f"Tipo(s) que não existem no catálogo: {fora}. Ver blocos.md.")

    # --- legado ---
    blob = json.dumps(todos, ensure_ascii=False)
    leg = [k for k in LEGADO_CHAVES if f'"{k}"' in blob]
    if leg:
        erro(f"Campo(s) de esquema legado presentes: {leg}. Não copie JSON de páginas antigas — "
             f"gere a partir dos defaults do catálogo (ver references/construtor.md, regra 1).")
    if '"top left"' in blob:
        aviso("Encontrado place no formato antigo \"top left\". O formato atual é "
              "\"top: 0px; left: 0px;\".")

    # --- toggles, tipos e referências ---
    for b in todos:
        t = b.get("type")
        cfg = b.get("config") or {}

        if t == "accordion":
            # `expand` é a única chave de comportamento do accordion (blocos.md, seção accordion):
            # é do formato documentado, não é "config a mais".
            chaves = set(cfg.keys())
            formato = {"title", "variant", "class", "expand"}
            if not chaves <= formato:
                aviso(f"accordion '{b.get('id')}' tem config além de title/variant/class/expand "
                      f"({sorted(chaves - formato)}). O formato observado é enxuto.")
            if not cfg.get("title"):
                erro(f"accordion '{b.get('id')}' sem 'title' — é a linha que abre e fecha.")
            if not (isinstance(b.get("child"), list) and b["child"]):
                aviso(f"accordion '{b.get('id')}' sem filho — a resposta costuma ser um bloco editor em 'child'.")
            continue  # accordion não segue a base; pula toggles

        for grupo, tog, campos in TOGGLES:
            g = cfg.get(grupo)
            if not isinstance(g, dict):
                continue
            tem_valor = any(preenchido(g.get(c)) for c in campos) if campos else False
            if tem_valor and not ligado(g.get(tog)):
                erro(f"{t} '{b.get('id')}': '{grupo}' tem valor preenchido mas '{grupo}.{tog}' está desligado — "
                     f"o valor será ignorado na renderização.")
        bg = cfg.get("background")
        if isinstance(bg, dict) and preenchido(bg.get("color")) and not ligado(bg.get("enable")):
            erro(f"{t} '{b.get('id')}': background.color preenchido com background.enable desligado.")

        # referências vazias
        # ⚠️ Vitrine com `origem: operation` NÃO tem cadastro: ela é dinâmica e monta a lista
        # pela operação (`operation: history` = últimos vistos, e afins). Cobrar `vit_id` dela
        # é ruído — e ruído é o que faz a pessoa parar de ler a saída do validador. Medido numa
        # home real: 2 das 8 vitrines são `operation: history`, corretamente sem vit_id.
        if t in REFERENCIAS and not (t == "vitrine" and str(cfg.get("origem") or "") == "operation"):
            campo, idkey = REFERENCIAS[t]
            ref = cfg.get(campo)
            if not isinstance(ref, dict) or not preenchido(ref.get(idkey)):
                info(f"{t} '{b.get('id')}': '{campo}' sem id. É referência a cadastro: tire da origem "
                     f"(mídia pela URL da imagem renderizada; vitrine e banner pelo campo Blocos: da "
                     f"página de origem, armadilhas.md item 4). Só se não existir na origem, diga à "
                     f"pessoa o que selecionar no painel do admin.")
        # a recíproca é defeito de verdade: vitrine dinâmica sem a operação definida não monta
        # lista nenhuma, e o bloco sai vazio sem erro.
        if t == "vitrine" and str(cfg.get("origem") or "") == "operation" \
                and not str(cfg.get("operation") or "").strip():
            erro(f"vitrine '{b.get('id')}': origem='operation' sem o campo 'operation' "
                 f"(ex.: 'history'). A vitrine renderiza vazia, sem erro nenhum.")

        # banner: a fonte da verdade é banner_tipo. bannerlist escrito à mão é ESVAZIADO
        # na entrega (testado) — ver armadilhas.md / blocos.md.
        if t == "banner":
            bt = cfg.get("banner_tipo")
            bl = cfg.get("bannerlist")
            tem_tipo = isinstance(bt, dict) and preenchido(bt.get("id"))
            tem_lista = isinstance(bl, list) and len(bl) > 0
            if tem_lista and not tem_tipo:
                aviso(f"banner '{b.get('id')}': tem bannerlist mas NÃO tem banner_tipo. O pipeline de "
                      f"entrega ignora bannerlist escrito à mão e o carrossel sai VAZIO. Use banner_tipo "
                      f"(o servidor resolve as imagens). Precisa de um tamanho que o master do tipo não "
                      f"tem? No site novo (React), faça o carrossel num bloco 'code' em CSS; numa página "
                      f"servida pelo site em twig, ligue 'Tamanho personalizado' no bloco (use_custom_size "
                      f"+ width/height). Ver blocos.md (seção banner) e imagens-e-banners.md, 7.")
            elif not tem_tipo:
                info(f"banner '{b.get('id')}': 'banner_tipo' sem id — tire da página de origem (campo "
                     f"Blocos:, armadilhas.md item 4); só se não existir lá, diga à pessoa qual tipo "
                     f"selecionar no painel do admin (o servidor resolve as imagens a partir dele; ver "
                     f"blocos.md).")

        # ---------------------------------------------------------------- #
        # config que o renderizador ACEITA e aplica ERRADO                 #
        # ---------------------------------------------------------------- #
        # Estas quatro passaram por uma verificação manual numa migração real. Não são
        # erro de esquema — o admin grava, o front entrega, e o resultado sai torto.

        # `imagem` NÃO tem wrapper próprio: o componente renderiza
        # <a class="pano-link-anchor"><img style="width:100%;height:100%"> e nada mais.
        # Por isso padding e margin do bloco caem no <img>. Ver blocos.md (bloco imagem).
        if t == "imagem":
            mg, pd = cfg.get("margin"), cfg.get("padding")
            if isinstance(mg, dict) and ligado(mg.get("apply")):
                erro(f"imagem '{b.get('id')}': margin.apply ligado — a margem cai no <img> e, com "
                     f"apply_aspect_ratio (que emite height:100%), INFLA a âncora e DISTORCE a "
                     f"imagem em vez de espaçar. Medido: uma imagem 605x280 numa coluna de 580 com "
                     f"margin-bottom 10px deu âncora de 278px e imagem esticada para 580x278 (o "
                     f"correto era 268), com ZERO de espaço até a de baixo. Para separar imagens "
                     f"empilhadas use display.gap no bloco da COLUNA: 268 + 10 + 268 = 546, que "
                     f"fechou exato com a coluna vizinha.")
            if isinstance(pd, dict) and ligado(pd.get("apply")):
                aviso(f"imagem '{b.get('id')}': padding.apply ligado — o bloco não tem wrapper "
                      f"próprio (renderiza <a><img>), então o padding cai no <img>. Ponha o "
                      f"padding no bloco que envolve a imagem.")
            if ligado(cfg.get("use_custom_size")) and not ligado(cfg.get("apply_aspect_ratio")):
                erro(f"imagem '{b.get('id')}': use_custom_size ligado e apply_aspect_ratio "
                     f"desligado — sem o aspect_ratio a altura trava no valor pedido e a imagem "
                     f"distorce. Ligue os dois, e peça um tamanho na MESMA proporção do master "
                     f"(pedir 600x348 num master 250x150 muda o recorte: 1,7241 contra 1,6667).")

        # vitrine em grid sem o campo `grid`: o tema faz (itemsPerGridRow?.desktop)||1.
        # Lembre que `itemsPerGridRow` é o nome de SAÍDA (o servidor renomeia `grid` na
        # entrega) e está em LEGADO_CHAVES — escrever esse nome à mão dá erro, corretamente.
        if t == "vitrine" and cfg.get("display_mode") == "grid":
            g = cfg.get("grid")
            desk = str((g or {}).get("desktop") or "").strip() if isinstance(g, dict) else ""
            if not desk:
                erro(f"vitrine '{b.get('id')}': display_mode 'grid' sem o campo `grid`. O tema faz "
                     f"(itemsPerGridRow?.desktop)||1 e renderiza UMA coluna, com todos os produtos "
                     f"empilhados. Grave grid:{{desktop:'6',mobile:'2'}} — o servidor renomeia para "
                     f"itemsPerGridRow na entrega (verificado: gravei grid:{{desktop:'6',mobile:'2'}} "
                     f"e saiu itemsPerGridRow:{{desktop:6,mobile:2}}).")
            elif desk.isdigit() and 1 <= int(desk) <= 4:
                aviso(f"vitrine '{b.get('id')}': grid.desktop = '{desk}'. No tema novo esse valor é o "
                      f"NÚMERO DE COLUNAS; o construtor twig usava a convenção 12/N do Bootstrap "
                      f"(grid.desktop '2' queria dizer col-lg-2, ou seja 6 por linha). Se você copiou "
                      f"o número da página de origem, o certo aqui provavelmente é 6.")

        # <script> em bloco `code`: o React insere por dangerouslySetInnerHTML e script
        # inserido por innerHTML não roda. Além disso o site novo não carrega jQuery
        # (grep jquery no bundle = 0 ocorrências).
        if t == "code" and re.search(r"<script\b", cfg.get("code") or "", re.I):
            erro(f"code '{b.get('id')}': tem <script> no campo `code` e ele NÃO EXECUTA — o React "
                 f"insere o HTML por dangerouslySetInnerHTML, e script inserido por innerHTML não "
                 f"roda; o site novo também não carrega jQuery. Isso é código morto que viaja duas "
                 f"vezes em cada visita (uma no DOM, outra no __NEXT_DATA__). Apague. Se o "
                 f"comportamento é necessário, é pedido para o time do tema.")

        # Tipografia: em `editor`/`code`, herdar do tema é armadilha. A regra do tema é
        # `p{font-size:1.4em}`, RELATIVA. Medido: <p> saíram a 22,4px e <a> a 16px na cor
        # de destaque da loja, contra 14px/14,4px em cinza da original.
        if t in ("editor", "code"):
            cod = cfg.get("code") or ""
            cls_bloco = set(str(cfg.get("class") or "").split())
            def resolvido(tag, prop):
                return tipografia_coberta(regras_txt, tag, prop, cls_bloco, body_class)
            # ⚠️ `editor` NÃO recebe a classe de layout do bloco (item 13): a única classe que
            # chega nele é `config.class`. Logo uma regra de página só cobre este bloco se as
            # classes do seletor estiverem em `config.class` (ou no body_class).
            # ⚠️ `li` e `td` entraram aqui depois de uma migração real: o 11c listava só
            # <p>, <h2> e <a>, e o <li> é o pior dos que faltavam. Não existe regra de `li`
            # em nenhum dos dois temas, então ele herda o `body` — que é 12px na original e
            # 16px no tema novo (`--bs-body-font-size:1rem`). Toda lista migra 33% maior,
            # sem nada no JSON denunciando.
            faltando = set()
            for m in re.finditer(r"<(p|h[1-6]|li|td)(?![\w-])([^>]*)>", cod):
                tag = m.group(1)
                if "font-size" in m.group(2) or resolvido(tag, "font-size"):
                    continue
                faltando.add(tag)
            if faltando:
                aviso(f"{t} '{b.get('id')}': <{sorted(faltando)[0]}> sem font-size — nem inline, nem "
                      f"por regra do campo `style` que alcance este bloco. A regra do tema é "
                      f"`p{{font-size:1.4em}}`, RELATIVA: medido, `body` 16px do tema novo contra "
                      f"12px da original faz o <p> sair a 22,4px em vez de 16,8px. Em bloco de "
                      f"texto, TODO elemento precisa de font-size, line-height, font-weight e color "
                      f"explícitos — inclusive <h3>, <ol> e <li>, que o 11c não listava: sem regra "
                      f"de `li`, a lista migra de 12px para 16px (33% maior).")
            if re.search(r"<a\b", cod):
                if not (re.search(r"<a\b[^>]*text-decoration", cod)
                        or resolvido("a", "text-decoration")):
                    aviso(f"{t} '{b.get('id')}': <a> sem text-decoration — nem inline, nem por "
                          f"regra do campo `style`. O tema novo sublinha o link "
                          f"(`a{{text-decoration:underline}}`).")
                # ⚠️ A COR do link NÃO é decidível aqui, e derivar do CSS dá errado: numa
                # migração real `platform.css` e `loja.css` declaravam uma cor para `a` e o
                # computado da original era outra (a --primary-color da loja). A página foi
                # gravada com o link na cor errada e só se viu no passo 7b. Por isso o aviso só
                # cala quando a cor MEDIDA (--cor-link) está no campo `style`.
                if not (COR_LINK and COR_LINK.lower() in (cor_do_style or "").lower()):
                    if COR_LINK:
                        aviso(f"{t} '{b.get('id')}': o campo `style` não menciona {COR_LINK}, a cor "
                              f"do link medida na original (--cor-link). Confira se o link sai "
                              f"nessa cor — as folhas do tema podem declarar outra. Ver "
                              f"armadilhas.md 23.")
                    else:
                        aviso(f"{t} '{b.get('id')}': confira a COR do link MEDINDO na original "
                              f"(`getComputedStyle`), não lendo o CSS: numa loja real as folhas "
                              f"declaravam uma cor e o computado era outra (a --primary-color da "
                              f"loja). Passe a cor medida em --cor-link. Ver armadilhas.md 23 — "
                              f"arquivo estático subdetermina.")

    # --- info: proporção de class "própria" (classes do tema não contam) ---
    # O tema fornece utilidades globais de grid; usá-las é idiomático e não é CSS de página.
    THEME_RE = re.compile(r"^(container|container-fluid|row|col-(xs|sm|md|lg|xl)-\d{1,2}|col-(xs|sm|md|lg|xl)|d-none|d-block|d-flex|text-center|text-left|text-right)$")
    def so_tema(cls):
        toks = [t for t in str(cls or "").split() if t]
        return toks and all(THEME_RE.match(t) for t in toks)
    # ⚠️ `editor` e `code` estão FORA desta conta. Neles a seção LAYOUT é inerte — o
    # renderizador do `editor` faz `className: config.class` e descarta a classe gerada
    # (item 13: 0 de 29 blocos `editor` a carregavam). Logo a tipografia daquele texto só
    # pode sair de `config.class` + regra de página, ou de style inline em cada elemento.
    # Cobrar "use config nativa" ali empurra para o que não funciona; e a alternativa inline
    # custou, numa página medida, ~8.000 chars por raiz contra 688 de regra escopada.
    conta = [b for b in todos if b.get("type") not in ("accordion", "editor", "code")]
    if conta:
        propria = [b for b in conta if str((b.get("config") or {}).get("class") or "").strip() and not so_tema((b.get("config") or {}).get("class"))]
        if propria:
            aviso(f"{len(propria)} bloco(s) de layout com classe CSS própria (fora das utilidades do "
                  f"tema). Layout costuma sair por config nativa (LAYOUT/flex) ou pelas utilidades do "
                  f"tema (container/row/col-*); classe própria vira CSS de página — ver "
                  f"references/construtor.md, regra 2, níveis 1 e 2. (Blocos `editor`/`code` não entram nesta conta: neles a classe "
                  f"própria é o único caminho para tipografia.)")
        else:
            info("Layout resolvido por config nativa e/ou utilidades do tema (container/row/col-*) — bom.")

    # --- info: composição ---
    tipos = {}
    for b in todos:
        tipos[b.get("type")] = tipos.get(b.get("type"), 0) + 1
    brutos = tipos.get("code", 0)
    if brutos and brutos / len(todos) > 0.3:
        aviso(f"{brutos} de {len(todos)} blocos são 'code' (HTML cru, {round(brutos/len(todos)*100)}%). "
              f"Prefira blocos nativos; use 'code' como exceção e explique no campo 'name' (ver regra 2).")
    info(f"Total: {len(todos)} blocos. Composição: {tipos}")


def _uso():
    print("uso: python validar_pagina.py caminho/para/pagina.json [--cor-link '#RRGGBB'] [--base backup.json]")
    print("     python validar_pagina.py --help    (o que ele checa, e o efeito de ignorar)")
    sys.exit(2)


def _carregar(caminho, aceitar_bom=False):
    """Lê o JSON. Arquivo que não abre ou não é UTF-8 sai com explicação (exit 2), sem traceback.

    `aceitar_bom` é para o --base: o backup de página grande é colado pela pessoa num editor de
    texto, que pode salvar com BOM. O JSON que vai para o admin continua sem essa folga.
    """
    try:
        with open(caminho, encoding="utf-8-sig" if aceitar_bom else "utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"ERRO: JSON inválido em {caminho} — {e}")
        sys.exit(1)
    except UnicodeDecodeError:
        print(f"ERRO: {caminho} não é UTF-8 — salve o arquivo em UTF-8 e rode de novo.")
        sys.exit(2)
    except OSError as e:
        print(f"ERRO: não consegui abrir {caminho}: {e.strerror or e}")
        sys.exit(2)


def _rodar(doc):
    """Roda `validar` do zero e devolve (erros, avisos, infos).

    Rede de segurança: um JSON com tipo inesperado num lugar que nenhuma checagem previu vira
    ERRO explicado, não traceback (o exit continua 1, então nada passa por isso).
    """
    del ERROS[:], AVISOS[:], INFOS[:]
    try:
        validar(doc)
    except Exception as e:  # noqa: BLE001 - qualquer quebra aqui é de formato do JSON
        erro(f"O validador não conseguiu ler este JSON até o fim ({type(e).__name__}: {e}). "
             f"Algum campo tem um tipo inesperado: confira o formato em blocos.md. Se o JSON "
             f"estiver certo, é defeito do validador.")
    return list(ERROS), list(AVISOS), list(INFOS)


def main():
    global COR_LINK
    # No Windows, com a saída canalizada (é como os assistentes rodam os comandos), o Python escreve em
    # cp1252: os acentos saem trocados e um emoji derruba o script. `python -I` ignora o
    # PYTHONUTF8, então a correção tem de estar aqui (a mesma do gerar_previa.py).
    for st in (sys.stdout, sys.stderr):
        try:
            st.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    # `--help` tem de imprimir ajuda. Antes, qualquer argumento que nao fosse arquivo caia no
    # open() e o script morria com `FileNotFoundError: ... '--help'` — um traceback no lugar do
    # texto de uso, que e' a pior primeira impressao possivel para um validador.
    args = sys.argv[1:]
    if len(args) == 1 and args[0] in ("-h", "--help", "/?"):
        print(__doc__.strip())
        sys.exit(0)
    # --cor-link '#RRGGBB'  ou  --cor-link=#RRGGBB ; --base backup.json  ou  --base=backup.json
    resto, i, base = [], 0, None
    while i < len(args):
        a = args[i]
        if a in ("--cor-link", "--base"):
            if i + 1 >= len(args):
                _uso()
            if a == "--cor-link":
                COR_LINK = args[i + 1].strip()
            else:
                base = args[i + 1]
            i += 2
            continue
        if a.startswith("--cor-link="):
            COR_LINK = a.split("=", 1)[1].strip()
            i += 1
            continue
        if a.startswith("--base="):
            base = a.split("=", 1)[1]
            i += 1
            continue
        resto.append(a)
        i += 1
    if COR_LINK is not None and not COR_HEX_RE.match(COR_LINK):
        print(f"ERRO: --cor-link precisa ser uma cor hexadecimal medida, como #1a2b3c (recebido "
              f"{COR_LINK!r}). Meça na original com getComputedStyle.")
        sys.exit(2)
    if len(resto) != 1 or resto[0].startswith("--") or (base is not None and not base.strip()):
        _uso()
    caminho = resto[0]
    doc = _carregar(caminho)

    # Edição pontual (construtor.md, seção 7): o que já estava errado no backup não é seu para
    # corrigir. Rebaixa a AVISO o ERRO cujo texto já aparece na base, uma vez por ocorrência.
    pre_existentes = []
    if base is not None:
        erros_base, _, _ = _rodar(_carregar(base, aceitar_bom=True))
    erros, avisos, infos = _rodar(doc)
    if base is not None:
        sobra = list(erros_base)
        novos = []
        for m in erros:
            if m in sobra:
                sobra.remove(m)
                pre_existentes.append(m)
            else:
                novos.append(m)
        erros = novos
        avisos = [f"pré-existente (já está em {base}), fora do pedido: {m}"
                  for m in pre_existentes] + avisos

    print("=" * 60)
    print(f"Validação de: {caminho}" + (f"   (comparado com a base {base})" if base else ""))
    print("=" * 60)
    for m in erros:
        print(f"  ERRO   {m}")
    for m in avisos:
        print(f"  AVISO  {m}")
    for m in infos:
        print(f"  info   {m}")
    print("-" * 60)
    print(f"{len(erros)} erro(s), {len(avisos)} aviso(s).")
    if pre_existentes:
        print(f"{len(pre_existentes)} ERRO(S) já estavam no backup e viraram AVISO: liste-os para a "
              f"pessoa como decisões dela e não os corrija sem pedido. Só os ERROS novos bloqueiam.")
    if erros:
        print("Corrija os ERROS antes de colar no admin. Avisos são sinais de atenção, não bloqueiam.")
    else:
        print("Sem erros. Revise os avisos e, ao colar, verifique renderizando (ver gravacao-construtor.md).")
    sys.exit(1 if erros else 0)


if __name__ == "__main__":
    main()
