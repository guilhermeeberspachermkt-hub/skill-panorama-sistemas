#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verificar_paridade.py — confere a pagina REPRODUZIDA contra a ORIGINAL, e confere que o
CSS de pagina nao vazou para o tema.

POR QUE ELE EXISTE
    Verificacao "por seletor escolhido a mao" so' pega o que voce ja' desconfiava. Numa
    migracao real da home, oito defeitos passaram por medicao manual, entre eles o logo do
    cabecalho renderizando 945x313 em vez de 180x60 — porque o cabecalho nunca estava na
    lista de coisas a medir. Este script nao tem lista: ele varre.

    A medida que mais rendeu foi a COBERTURA DE TEXTO. Ela saiu 28,0% na primeira rodada
    (175 palavras de miolo contra 513 da original) e foi ela, e so' ela, que revelou que as
    8 respostas do FAQ — 9 <p>, 2192 caracteres — nao estavam no DOM: o bloco `accordion`
    fechado nao renderiza o corpo, ele NAO existe no HTML (nao e' display:none). Na tela as
    duas paginas pareciam iguais, porque a original tambem carrega com as respostas
    escondidas; o prejuizo era de DOM e indexacao. Depois de trocar por <details>/<summary>
    em bloco `editor`, a cobertura foi para 100,0%. Se voce ler um numero so' desta saida,
    leia esse.

USO
    python verificar_paridade.py --nova https://novo.SUA-LOJA.com.br/minha-pagina \\
                                  --original https://www.SUA-LOJA.com.br/ \\
                                  --controle https://novo.SUA-LOJA.com.br/outra-pagina \\
                                  --json pagina.json --cor-link '#RRGGBB'

    (os enderecos acima sao marcadores: os da sua loja estao no perfil dela,
     ~/panorama-lojas/<slug-da-loja>.md)

    --nova       (obrigatorio) a pagina reproduzida, no site novo
    --original   a pagina de referencia, no site antigo
    --controle   QUALQUER outra pagina do site NOVO. E' o que separa "tema" de "estrago meu":
                 se o header dela e o da sua pagina forem iguais, o tema esta intacto.
                 Baixe o controle com o MESMO device da nova (ver guarda no item 5 abaixo).
    --json       o JSON que voce gravou (le o campo `style` e faz o lint de config)
    --miolo      seletor do container do conteudo (default: #layout-main-content)
    --mobile     tambem baixa tudo com user-agent de iPhone e compara os dois devices. So' com
                 URL em --nova/--original: com arquivo local nao ha o que baixar (ele releria o
                 MESMO arquivo e acusaria um ERRO falso de isssrmobile), entao o script avisa e
                 ignora a opcao. Com arquivo local, rode de novo com os HTML de celular.
    --cor-link   a cor do link MEDIDA na original com getComputedStyle (#RRGGBB). Cada loja
                 tem a sua (o perfil da loja guarda a que ja' foi medida). Sem ela, o lint
                 avisa em todo bloco com link, para voce medir.

    --nova, --original e --controle aceitam CAMINHO DE ARQUIVO LOCAL, nao so' URL. Serve
    para reverificar contra HTML ja' salvo — e' assim que se prova que uma mudanca no
    proprio verificador ainda pega um defeito conhecido, sem depender da pagina no ar (que
    muda) nem da rede. Com arquivo local, rode uma vez por device, sem --mobile:
        python verificar_paridade.py --nova nova-desktop.html --original orig-desktop.html \\
               --controle controle-desktop.html --json pagina.json
        python verificar_paridade.py --nova nova-mobile.html --original orig-mobile.html \\
               --controle controle-mobile.html --json pagina.json
    Com arquivo salvo, compare snapshots do MESMO tipo: se um lado foi
    salvo com a prateleira ja' montada pelo AJAX e o outro nao, o texto dos produtos conta
    como ausente. Medido no par mobile: 99,0% em vez de 100,0%, e as 10 palavras "ausentes"
    eram preco e chamada de um produto.

O QUE ELE PEGA (cada item aqui ja' passou batido numa migracao real)
    1. CSS de pagina vazando para header/rodape/flutuantes  <- o mais importante.
       Regra por regra, conta quantos elementos ela alcanca dentro do <header>, do <footer>
       e fora do miolo; qualquer um > 0 e' ERRO. Blocos @keyframes sao IGNORADOS (`0%`,
       `17.33%` nao sao seletores: sem isso saiam 8 avisos de ruido para uma animacao de 5
       passos) e @media e' DESEMBRULHADO em vez de descartado, porque regra que vaza vaza
       igual dentro de media query.
    2. COBERTURA DE TEXTO por shingles de 6 palavras sobre o texto corrido do container,
       reportada em % ("X% do texto da original aparece na nova"), mais as faixas
       contiguas ausentes de cada lado. Nao compara elemento com elemento: twig e React
       aninham diferente e a comparacao por elemento-folha dava 17 falsos positivos por
       device. <script> fica fora da conta — o __NEXT_DATA__ carrega a pagina inteira, e
       um grep no HTML cru jura que o texto existe quando ele nao esta no DOM.
    3. link faltando por device, comparando CONJUNTO de destinos (nao contagem) e ignorando
       <a> dentro de <a>; multiplicidade e' detalhe de markup e sai como info.
    4. imagem quebrada, recorte diferente da original, alt errado, sem lazy, sem dimensoes.
    5. header e rodape contra a pagina de controle por ESTRUTURA — arvore de tags/classes
       mais conjunto de hrefs — e nao byte a byte, porque nonce, link ativo e hash de
       styled-components mudam legitimamente por pagina. Tem guarda de DEVICE TROCADO: o
       <header> mobile do tema tem ~23 tags contra ~259 do desktop, e sem a guarda a
       mensagem mandava voce cacar um vazamento de CSS que nao existe.
    6. config que nao funciona no bloco (margin em `imagem`, padding em `editor`, vitrine
       em grid sem o campo `grid`, ...)
    7. <script> morto dentro de bloco `code`
    8. numero de blocos entregue por device (o corte de device_show funcionou?)
    9. h1 ausente

O QUE ELE **NAO** PEGA — precisa de navegador, e o script imprime o JS pronto para colar:
    tipografia computada, geometria renderizada, irmaos com a mesma config medindo
    diferente, estados :hover, e as vitrines (que o tema novo monta no cliente). Regra que
    mira conteudo montado no cliente ou estado (:hover, [open], :checked) casa 0 elementos
    no HTML do servidor POR DEFINICAO — o script rebaixa isso a info em vez de acusar CSS
    morto. Sobra uma familia que ele NAO consegue rebaixar sozinho, porque precisa dos dois
    devices: o campo `style` e' UM SO' para as duas raizes, entao regra cujo markup existe so'
    na raiz Mobile casa 0 no HTML de desktop (medido: as duas classes de uma faixa rotativa que
    so' existia no Mobile deram 4 avisos no par desktop, com 1 ocorrencia de cada no mobile).
    Rode os dois lados antes de apagar
    CSS por causa de um "CSS morto?". PSEUDO-ELEMENTO e' diferente: `::after`, `::marker` e
    `::-webkit-details-marker` o parser de seletor nem aceita, e cada um sai como AVISO
    "Seletor nao suportado pelo parser" (medido: 4 avisos no <details> do FAQ). Sao ruido
    conhecido, nao defeito da pagina — confira a mao e siga. Reordenacao de texto (esta na
    pagina, no lugar errado) e alteracao menor que 6 palavras dentro de um trecho longo
    tambem passam, de proposito.
"""
import argparse
import gzip
import io
import json
import os
import re
import sys
import urllib.request
from collections import Counter

UA_DESKTOP = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
UA_MOBILE = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
             "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")

ERROS, AVISOS, INFOS = [], [], []
def erro(m):  ERROS.append(m)
def aviso(m): AVISOS.append(m)
def info(m):  INFOS.append(m)

try:
    from bs4 import BeautifulSoup, NavigableString
except ImportError:
    sys.stderr.write("Falta beautifulsoup4:  python -m pip install beautifulsoup4\n")
    raise SystemExit(2)


# ---------------------------------------------------------------------------
# rede
# ---------------------------------------------------------------------------
def baixar(url, mobile=False):
    """Aceita URL http(s) **ou caminho de arquivo local**.

    O caminho local existe para que se possa reverificar contra HTML ja' salvo — e' assim que
    se prova que uma mudanca no proprio verificador ainda pega um defeito conhecido, sem
    depender da pagina no ar (que muda) nem da rede. Sem isto, `--nova arquivo.html` estourava
    com `ValueError: unknown url type`, e um pipe para `head` engolia o traceback: o script
    parecia ter rodado limpo.
    """
    if "://" not in url[:10]:
        if not os.path.isfile(url):
            raise SystemExit("ERRO: %r nao e' URL nem arquivo existente." % url)
        with io.open(url, encoding="utf-8", errors="replace") as fh:
            return fh.read()
    req = urllib.request.Request(url, headers={
        "User-Agent": UA_MOBILE if mobile else UA_DESKTOP,
        "Accept-Encoding": "gzip",
    })
    with urllib.request.urlopen(req, timeout=60) as r:
        dados = r.read()
        if r.headers.get("Content-Encoding") == "gzip":
            dados = gzip.decompress(dados)
        return dados.decode("utf-8", "replace")


def status(url):
    """Devolve (codigo, bytes). Nao levanta — 000 quando a conexao falha."""
    req = urllib.request.Request(url, headers={"User-Agent": UA_DESKTOP})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, len(r.read())
    except urllib.error.HTTPError as e:
        return e.code, 0
    except Exception:
        return 0, 0


# ---------------------------------------------------------------------------
# 1. VAZAMENTO DE CSS DE PAGINA  (a checagem que justifica este script)
# ---------------------------------------------------------------------------
def _tirar_keyframes(css):
    """Remove blocos @keyframes inteiros (incluindo o corpo, que tem chaves aninhadas).

    ⚠️ Necessario porque `0%`, `17.33%` etc. NAO sao seletores. Sem isto o script cospe um
    aviso "Seletor nao suportado pelo parser" por passo da animacao — medido: 8 avisos de
    ruido para uma unica animacao de 5 passos. E ruido treina a pessoa a ignorar a saida.
    """
    fora, i = [], 0
    while True:
        m = re.compile(r"@(?:-\w+-)?keyframes\b[^{]*\{", re.I).search(css, i)
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


# Classe DO TEMA: e' o que vaza. Classe sua (`.txt`, `.faq-item`) nao pode vazar, porque
# so' existe onde voce a escreveu. Mesma expressao do validar_pagina.py.
CLASSE_TEMA_RE = re.compile(r"\.(pano-[A-Za-z0-9_-]+|swiper[A-Za-z0-9_-]*)")

TAGS_TEXTO = ("p", "h1", "h2", "h3", "h4", "h5", "h6", "a", "li", "ol", "ul", "td",
              "strong", "em")

# A cor do link NAO e' uma constante: cada loja tem a sua, e ela tem de ser MEDIDA na original
# com getComputedStyle. Numa loja real as folhas declaravam uma cor e o computado era outra (a
# --primary-color da loja). Vem de --cor-link; sem ela, o lint avisa em todo bloco com link.
COR_HEX_RE = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")


def regras_tipografia(css):
    """Do campo `style`, quais TAGS recebem quais propriedades — e sob quais classes.

    Existe porque a cobranca de tipografia abaixo olhava so' `style=` INLINE e ignorava o
    campo `style` do MESMO json que ela recebe. Medido: 18 avisos por device numa pagina
    cuja tipografia estava 100% especificada por regra escopada — e que mediu, no
    navegador, identica a' original. Gemea da funcao homonima em validar_pagina.py.

    Devolve (tag, {props}, {classes do seletor}). Quem consome compara com as classes do
    PROPRIO bloco: no `editor` a unica classe que chega e' `config.class` (item 13).
    """
    out = []
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = _tirar_keyframes(css)
    css = re.sub(r"@media[^{]*\{", "", css)
    for sel_bruto, corpo in re.findall(r"([^{}]+)\{([^{}]*)\}", css):
        props = {p.split(":")[0].strip().lower() for p in corpo.split(";") if ":" in p}
        if not props:
            continue
        for sel in sel_bruto.split(","):
            sel = sel.strip()
            if not sel or sel.startswith("@"):
                continue
            ultimo = sel.split()[-1].split(">")[-1].strip()
            m = re.match(r"^([a-z][a-z0-9]*)", ultimo)
            if not m or m.group(1) not in TAGS_TEXTO:
                continue
            if re.search(r"::?[a-z-]+$", ultimo):
                continue                      # :hover / ::after nao cobrem o estado base
            out.append((m.group(1), props, set(re.findall(r"\.([A-Za-z_][\w-]*)", sel))))
    return out


def tipografia_coberta(regras, tag, prop, classes_do_bloco, body_class):
    """A regra de pagina ja' define `prop` para `tag` num bloco com estas classes?"""
    disponiveis = set(classes_do_bloco) | ({body_class} if body_class else set())
    return any(t == tag and prop in props and classes <= disponiveis
               for t, props, classes in regras)


def seletores_do_style(css):
    """Seletores do CSS de pagina, ignorando @keyframes e desembrulhando @media.

    @media e' DESEMBRULHADO em vez de descartado, de proposito: uma regra que vaza para o
    tema vaza igual dentro de media query, e a checagem de vazamento precisa ve-la.
    """
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = _tirar_keyframes(css)
    css = re.sub(r"@(?:media|supports|layer|container)[^{]*\{", "", css)   # achata, mantem o miolo
    sels = []
    for bloco in re.findall(r"([^{}]+)\{[^{}]*\}", css):
        for s in bloco.split(","):
            s = s.strip()
            if s and not s.startswith("@"):
                sels.append(s)
    return sels


def checar_vazamento(soup, css, miolo_sel):
    """Para cada regra do CSS de pagina, conta quantos elementos ela alcanca DENTRO do
    header, do rodape e fora do miolo. Qualquer um > 0 e' ERRO.

    O motivo: `body_class` fica no <body>, entao uma regra como
    `.minha-classe .pano-link-anchor{width:100%}` desce para o tema inteiro. Medido numa
    migracao real: das 127 .pano-link-anchor da pagina, 96 estavam no <header>, 13 no
    <footer> e 1 no botao flutuante — o logo foi de 180x60 para 945x313."""
    if not css.strip():
        info("CSS de pagina vazio — nada a vazar. Otimo.")
        return
    header = soup.find("header")
    footer = soup.find("footer")
    miolo = soup.select_one(miolo_sel)
    if miolo is None:
        aviso("Miolo %r nao encontrado — a checagem de vazamento fica cega. "
              "Passe --miolo com o seletor certo." % miolo_sel)
        return

    def dentro(el, ancestral):
        if ancestral is None:
            return False
        for p in el.parents:
            if p is ancestral:
                return True
        return False

    print("  %-58s %6s %6s %8s" % ("regra", "header", "footer", "fora-do-miolo"))
    for sel in seletores_do_style(css):
        try:
            achados = soup.select(sel)
        except Exception:
            aviso("Seletor nao suportado pelo parser, confira a mao: %s" % sel)
            continue
        if not achados:
            # ⚠️ "CSS morto" so' se o conteudo alvo for renderizado no servidor. No tema novo
            # a vitrine e o corpo do accordion sao montados no CLIENTE, entao regra que mira
            # produto/prateleira/accordion legitimamente casa 0 elementos no SSR.
            # Alem do conteudo montado no cliente, regra de ESTADO casa 0 por definicao no HTML
            # estatico: `:hover`, `:focus`, `[open]` de <details>, `[aria-expanded=true]`.
            # Acusar isso de CSS morto e' ruido garantido — nenhuma delas pode casar.
            estado = any(p in sel for p in (":hover", ":focus", ":active", "[open]",
                                            "aria-expanded", ":checked", ":target"))
            cliente = estado or any(p in sel for p in ("product", "showcase", "vitrine",
                                                       "prateleira", "accordion", "swiper",
                                                       "carousel"))
            # ⚠️ TERCEIRA familia, medida numa home real: o campo `style` e' UM SO' para as DUAS
            # raizes, e a regra de uma faixa rotativa so' tinha markup na raiz Mobile.
            # Rodando o par DESKTOP ela casa 0 e saia como "CSS morto?"
            # — 4 avisos por rodada, com conserto nenhum. Nao ha como decidir aqui com um HTML
            # so': o aviso diz a hipotese para voce checar no outro device antes de apagar CSS.
            (info if cliente else aviso)(
                "Regra sem elemento correspondente no HTML do servidor: %s%s"
                % (sel, " — provavelmente conteudo montado no cliente (vitrine/accordion); "
                        "confira no navegador, nao e' necessariamente CSS morto." if cliente
                        else " (CSS morto?) — antes de apagar, confira o OUTRO device: o campo "
                             "`style` e' unico para as duas raizes, entao regra que so' tem "
                             "markup no Mobile casa 0 no HTML de desktop, e vice-versa."))
            continue
        n_h = sum(1 for e in achados if dentro(e, header))
        n_f = sum(1 for e in achados if dentro(e, footer))
        n_fora = sum(1 for e in achados
                     if not dentro(e, miolo) and e is not miolo
                     and e.name not in ("body", "html"))
        marca = "  <-- VAZOU" if (n_h or n_f or n_fora) else ""
        print("  %-58s %6d %6d %8d%s" % (sel[:58], n_h, n_f, n_fora, marca))
        if n_h or n_f:
            erro("A regra `%s` alcanca %d elemento(s) do <header> e %d do <footer>. "
                 "Escope no miolo: `%s %s`."
                 % (sel, n_h, n_f, miolo_sel, sel.split()[-1]))
        elif n_fora:
            erro("A regra `%s` alcanca %d elemento(s) FORA do miolo (ex.: botao flutuante, "
                 "que fica irmao do <footer>). Escope no miolo." % (sel, n_fora))


def comparar_com_controle(soup_nova, soup_ctrl):
    """Header/footer da sua pagina contra outra pagina do MESMO site novo. Se forem
    iguais, o tema esta intacto e qualquer diferenca visual vem do seu conteudo."""
    # ⚠️ GUARDA DE DEVICE TROCADO, decidida UMA VEZ pelo <header> e valendo para os dois
    # recortes. A guarda por-tag (abaixo) so' dispara no perfil do header (~23 tags no mobile
    # contra ~259 no desktop); o <footer> mobile tem 217 tags contra 215 do controle desktop,
    # passa reto por ela e sai como ERRO "suspeite do seu CSS de pagina vazando" — a conclusao
    # falsa que a guarda existe para evitar, no MESMO comando em que ela acertou o header.
    # Medido. Se o header diz device trocado, a comparacao do footer tambem e' invalida: aborte
    # as duas, porque um ERRO falso aqui manda a pessoa reescrever CSS que esta' correto.
    # ⚠️ Esta secao imprime AQUI, na hora, alem de registrar em INFOS/AVISOS/ERROS. Ate 2026-08-11
    # ela so' registrava, entao o cabecalho "--- 2. Header/footer contra pagina de controle ---"
    # saia' VAZIO e as conclusoes apareciam ~30 linhas abaixo, no bloco de info do rodape. Lia-se
    # como "a checagem nao rodou" — justamente a checagem que separa "o tema e' assim" de "eu
    # quebrei o tema", que e' o motivo de o --controle existir.
    ha, hb = soup_nova.find("header"), soup_ctrl.find("header")
    if ha is not None and hb is not None:
        na, nb = len(_estrutura(ha)), len(_estrutura(hb))
        if min(na, nb) < 60 and max(na, nb) > 180:
            print("  DEVICE TROCADO — nao comparei (header: %d tags vs %d no controle)" % (na, nb))
            aviso("DEVICE TROCADO: o <header> da sua pagina tem %d tags e o do controle %d "
                  "(~23 no mobile contra ~259 no desktop). Nao comparei header nem footer — a "
                  "diferenca seria de device, nao de vazamento. Baixe o controle com o MESMO "
                  "user-agent da pagina nova e rode de novo." % (na, nb))
            return
    for tag in ("header", "footer"):
        a = soup_nova.find(tag)
        b = soup_ctrl.find(tag)
        if a is None or b is None:
            print("  <%s>  AUSENTE em uma das paginas — nao deu para comparar" % tag)
            aviso("<%s> ausente em uma das paginas — nao deu para comparar." % tag)
            continue
        sa, sb = str(a), str(b)
        if sa == sb:
            print("  <%s>  byte-identico ao controle (%d chars) — tema intacto" % (tag, len(sa)))
            info("<%s> IDENTICO ao da pagina de controle (%d chars) — tema intacto." % (tag, len(sa)))
            continue
        # ⚠️ Igualdade de string e' criterio binario para algo com variacao legitima por
        # pagina (link ativo, nonce, ofuscador de e-mail, hash de styled-components). Medido:
        # o <footer> da home tinha o MESMO tamanho do controle e SHA1 diferente — a mensagem
        # antiga chamava isso de "provavelmente token aleatorio" com base so' no tamanho, o que
        # e' fragil por construcao. O que interessa aqui e' a ESTRUTURA: se a arvore de tags e
        # o conjunto de destinos batem, o tema esta intacto e a diferenca e' conteudo por pagina.
        est_a, est_b = _estrutura(a), _estrutura(b)
        alvos_a, alvos_b = _destinos(a), _destinos(b)
        # ⚠️ DEVICE TROCADO, nao vazamento. O <header> mobile do tema tem ~23 tags e o desktop
        # ~259: comparar mobile contra um controle de desktop da uma diferenca gigante e a
        # mensagem manda "suspeite do seu CSS de pagina vazando" — mandando a pessoa cacar um
        # bug que nao existe. Aconteceu comigo ao rodar a pagina mobile com o controle desktop.
        if min(len(est_a), len(est_b)) < 60 and max(len(est_a), len(est_b)) > 180:
            aviso("<%s>: %d tags na sua pagina contra %d no controle — diferenca desse tamanho e' "
                  "DEVICE TROCADO, nao vazamento. Baixe o controle com o mesmo user-agent "
                  "(mobile com mobile, desktop com desktop) e rode de novo."
                  % (tag, len(est_a), len(est_b)))
            continue
        if est_a == est_b and alvos_a == alvos_b:
            print("  <%s>  estrutura e destinos identicos (%d tags, %d hrefs) — tema intacto"
                  % (tag, len(est_a), len(alvos_a)))
            info("<%s> estrutura e destinos IDENTICOS ao controle (%d tags, %d hrefs); só o texto "
                 "de algum no' difere. Tema intacto." % (tag, len(est_a), len(alvos_a)))
        elif est_a == est_b:
            print("  <%s>  mesma arvore, %d href(s) so' na sua e %d so' no controle"
                  % (tag, len(alvos_a - alvos_b), len(alvos_b - alvos_a)))
            aviso("<%s> mesma arvore de tags/classes do controle, mas %d href(s) só na sua pagina "
                  "e %d só no controle — normal se o tema marca o link da pagina atual."
                  % (tag, len(alvos_a - alvos_b), len(alvos_b - alvos_a)))
        else:
            print("  <%s>  ERRO: estrutura diferente do controle (%d vs %d tags)"
                  % (tag, len(est_a), len(est_b)))
            erro("<%s> ESTRUTURA diferente da pagina de controle (%d vs %d tags). O tema deveria "
                 "ser igual — suspeite do seu CSS de pagina vazando." % (tag, len(est_a), len(est_b)))


def _estrutura(tag):
    """Arvore de tags+classes, ignorando texto e atributos volateis."""
    return [(t.name, " ".join(sorted(t.get("class") or []))) for t in tag.find_all(True)]


def _destinos(tag):
    return {a.get("href") for a in tag.find_all("a") if a.get("href")}


# ---------------------------------------------------------------------------
# 2. INVENTARIO DE IMAGENS
# ---------------------------------------------------------------------------
RE_MIDIA = re.compile(r"/img\.panorama/(\w+)/(\d+)/([^/?\"']+)")

def imagens(soup, raiz_sel=None):
    raiz = soup.select_one(raiz_sel) if raiz_sel else soup
    if raiz is None:
        return []
    out = []
    for im in raiz.find_all("img"):
        src = im.get("src") or ""
        m = RE_MIDIA.search(src)
        tam = None
        if m:
            t = re.search(r"-(\d+)x(\d+)\.[a-z]+$", m.group(3))
            tam = (int(t.group(1)), int(t.group(2))) if t else None
        out.append({
            "src": src,
            "tabela": m.group(1) if m else None,
            "id": m.group(2) if m else None,
            "arquivo": m.group(3) if m else None,
            "tamanho": tam,
            "alt": im.get("alt"),
            "lazy": im.has_attr("loading"),
            "dim": im.has_attr("width") and im.has_attr("height"),
            # `aspect-ratio` inline reserva o espaco do slide sem width/height, e e' o UNICO
            # remedio de layout shift que o bloco `banner` tem (apply_aspect_ratio + width/height
            # numericos -> style="width:100%;height:auto;aspect-ratio:W/H"). Sem ler isto, o
            # script acusa "sem width+height" numa imagem que JA' tem a altura reservada.
            "ar": "aspect-ratio" in (im.get("style") or ""),
        })
    return out


def checar_imagens(nova, original, testar_url):
    print("  %-9s %-8s %-11s %-5s %-4s %s" % ("tabela", "id", "tamanho", "lazy", "dim", "alt"))
    for im in nova:
        if not im["id"]:
            continue
        print("  %-9s %-8s %-11s %-5s %-4s %s" % (
            im["tabela"], im["id"],
            ("%dx%d" % im["tamanho"]) if im["tamanho"] else "master",
            "sim" if im["lazy"] else "NAO",
            "sim" if im["dim"] else "NAO",
            (im["alt"] or "")[:34]))
        if im["alt"] and re.fullmatch(r"[a-z0-9]{8}", im["alt"]):
            aviso("Imagem %s com alt=%r — isso e' o ID DO BLOCO, nao texto alternativo. "
                  "O bloco `imagem` grava `alt: e.id` no codigo do tema e nao expoe campo "
                  "de alt; so' o time do tema resolve." % (im["id"], im["alt"]))
        # ⚠️ O bloco `banner` NUNCA emite `loading` — medido, 0 de 4 slides nos dois devices —
        # e nao ha config que mude isso. Cobrar lazy dele produz um aviso sem conserto, que
        # mandava "troque por bloco `imagem`" (perder o carrossel por causa de um atributo que
        # o componente nao expoe).
        #
        # O discriminador NAO pode ser o sufixo de tamanho: as slides desta home saem com
        # `-3840x935` / `-1360x800` no nome, porque o master do TIPO tem esse tamanho — a regra
        # antiga (`tabela == banner and not tamanho`) so' pegava banner servido no master sem
        # sufixo e deixava 4 falsos avisos por device. O que separa de verdade e' o `loading`:
        # bloco `imagem` sai com lazy SEMPRE, entao `<img>` da tabela de banner SEM lazy e'
        # slide de banner ou `<img>` cru em bloco `code` — dois casos, e a mensagem diz os dois,
        # porque so' um deles tem conserto.
        if im["tabela"] == "banner" and not im["lazy"]:
            info("Imagem %s: da tabela de banner e sem `loading`. Se e' slide de bloco `banner`, "
                 "NAO e' defeito — o componente nunca passa `loading` e nao ha config para isso; "
                 "contra layout shift use apply_aspect_ratio + width/height numericos. Se e' "
                 "`<img>` cru em bloco `code`, ai' sim troque por bloco `imagem` (que sai com "
                 "lazy)." % im["id"])
        elif not im["lazy"]:
            aviso("Imagem %s sem loading=lazy — se for de bloco `code`, troque por bloco "
                  "`imagem`." % im["id"])
        if not im["dim"]:
            if im["ar"]:
                info("Imagem %s sem width/height, mas com `aspect-ratio` inline — o espaco JA' "
                     "esta reservado (e' o que apply_aspect_ratio faz). Sem defeito." % im["id"])
            elif not (im["tabela"] == "banner" and not im["lazy"]):
                aviso("Imagem %s sem width+height (layout shift). Ligue use_custom_size + "
                      "apply_aspect_ratio." % im["id"])
            else:
                aviso("Imagem %s (slide de banner) sem width/height E sem aspect-ratio: altura "
                      "ZERO ate a imagem chegar. Ligue apply_aspect_ratio e preencha width/height "
                      "NUMERICOS — sem os dois numeros o aspect-ratio sai `undefined`." % im["id"])

    if testar_url:
        print("\n  conferindo HTTP de cada imagem:")
        for im in nova:
            if not im["src"].startswith("http"):
                continue
            cod, n = status(im["src"])
            marca = "" if cod == 200 else "   <-- QUEBRADA"
            print("    %3s %8d b  %s%s" % (cod or "erro", n, im["arquivo"] or im["src"][:50], marca))
            if cod != 200:
                erro("Imagem %s respondeu HTTP %s: %s" % (im["id"], cod, im["src"]))

    if original:
        po = {i["id"]: i for i in original if i["id"]}
        pn = {i["id"]: i for i in nova if i["id"]}
        faltando = set(po) - set(pn)
        sobrando = set(pn) - set(po)
        if faltando:
            erro("Midias que existem na original e NAO na nova: %s" % sorted(faltando))
        if sobrando:
            aviso("Midias na nova que nao existem na original: %s" % sorted(sobrando))
        for mid in sorted(set(po) & set(pn)):
            a, b = po[mid]["tamanho"], pn[mid]["tamanho"]
            if a and b and a != b:
                ra, rb = a[0] / a[1], b[0] / b[1]
                if abs(ra - rb) > 0.01:
                    erro("Midia %s: a original exibe %dx%d (proporcao %.4f) e a nova pede "
                         "%dx%d (%.4f) — RECORTE DIFERENTE, muda a area visivel da foto."
                         % (mid, a[0], a[1], ra, b[0], b[1], rb))
                else:
                    info("Midia %s: %dx%d na original, %dx%d na nova — mesma proporcao, "
                         "so' resolucao." % (mid, a[0], a[1], b[0], b[1]))
            if po[mid]["alt"] and pn[mid]["alt"] != po[mid]["alt"]:
                aviso("Midia %s: alt %r na original, %r na nova."
                      % (mid, po[mid]["alt"], pn[mid]["alt"]))


# ---------------------------------------------------------------------------
# 3. LINKS E TEXTO
# ---------------------------------------------------------------------------
def links(soup, raiz_sel):
    """Hrefs do miolo, ignorando <a> que esteja DENTRO de outro <a>.

    ⚠️ Mesma raiz do falso positivo de texto: o twig da origem embrulha imagem e legenda do
    card em duas ancoras aninhadas para o mesmo destino; o React emite uma. Medido: 8 ancoras
    aninhadas na original, 0 na nova. O empate 33/33 de hoje e' coincidencia, nao robustez —
    mude o markup do tema e voltam 8 erros falsos. `<a>` dentro de `<a>` e' HTML invalido de
    todo modo, e o navegador so' honra a de fora.

    O que isto deixa passar, de proposito: destino alcancavel SO' por ancora aninhada deixa de
    ser contado. Medido numa home real: a original levava para `/` pela area da imagem do card
    de categoria (ancora interna) enquanto o titulo levava para `/categoria`; na nova as duas
    levam para `/categoria`. Antes desta mudanca isso aparecia como ERRO de link faltando; e' diferenca
    real, mas sem prejuizo — e nao vale o custo de 8 erros falsos por device para pega-la.
    """
    raiz = soup.select_one(raiz_sel) or soup
    return [a.get("href") for a in raiz.find_all("a")
            if a.get("href") and not any(p.name == "a" for p in a.parents)]


_IGNORA_TEXTO = ("script", "style", "noscript", "template")


def texto_plano(soup, raiz_sel):
    """Texto corrido do miolo, sem script/style. Nao depende de aninhamento nenhum.

    ⚠️ Excluir <script> nao e' detalhe: no tema novo o __NEXT_DATA__ carrega a definicao
    inteira da pagina, entao um texto que NAO esta no DOM aparece dentro do <script> e um
    `grep` no HTML cru diz que ele existe. Foi assim que as 8 respostas do FAQ pareceram
    presentes (9 <p>, 2192 caracteres) quando na verdade o bloco `accordion` fechado nao
    renderiza o corpo — ele nao existe no DOM.
    """
    raiz = soup.select_one(raiz_sel) or soup
    partes = []
    for s in raiz.find_all(string=True):
        # ⚠️ find_all(string=True) devolve TAMBEM comentario, CDATA e doctype — `Comment` e
        # companhia herdam de NavigableString. Sem este filtro, um comentario HTML da original
        # (`<!--...-->`) conta como texto visivel e o verificador acusa "texto ausente na nova" para
        # algo que nunca esteve na tela. Custou um falso positivo no primeiro teste deste
        # proprio conserto. `type(s) is NavigableString` aceita so' o texto de verdade.
        if type(s) is not NavigableString:
            continue
        pai, pular = s.parent, False
        while pai is not None and getattr(pai, "name", None):
            if pai.name in _IGNORA_TEXTO:
                pular = True
                break
            pai = pai.parent
        if not pular:
            partes.append(str(s))
    return re.sub(r"\s+", " ", " ".join(partes).replace("\xa0", " ")).strip()


_PALAVRA = re.compile(r"[^\W_]+", re.UNICODE)


def palavras(txt):
    return _PALAVRA.findall(txt.casefold())


def _shingles(pal, k):
    if len(pal) < k:
        return {" ".join(pal)} if pal else set()
    return {" ".join(pal[i:i + k]) for i in range(len(pal) - k + 1)}


def _faixas_ausentes(pal, shingles_do_outro, k):
    """Indices de shingle que nao existem do outro lado, agrupados em faixas contiguas."""
    total = max(1, len(pal) - k + 1)
    falta = [i for i in range(total) if " ".join(pal[i:i + k]) not in shingles_do_outro]
    faixas, ini, ant = [], None, None
    for i in falta:
        if ini is None:
            ini = ant = i
        elif i == ant + 1:
            ant = i
        else:
            faixas.append((ini, ant))
            ini = ant = i
    if ini is not None:
        faixas.append((ini, ant))
    return faixas


CF_EMAIL_RE = re.compile(r"^/cdn-cgi/l/email-protection(#.*)?$")


def norm_href(h):
    """A original tem href relativo em alguns links (ex.: `categoria/subcategoria` sem a barra).
    Normalizar evita falso positivo — mas a diferenca de barra e' reportada como aviso.

    ⚠️ E normaliza a ofuscacao de e-mail da CLOUDFLARE, que era ERRO falso em toda pagina
    com e-mail, numa loja com a Cloudflare na frente (sem ela, nada disto aparece e a
    normalizacao nao muda nada). A Cloudflare ofusca de DUAS formas, e o site antigo e o
    novo usam formas diferentes para o MESMO endereco:
        original: <a class="__cf_email__" data-cfemail="aad9..." href="/cdn-cgi/l/email-protection">
        nova:     <a href="/cdn-cgi/l/email-protection#7e0d...">
    Medido numa pagina de politica de privacidade: os dois hashes decodificam para o MESMO
    endereco (`sac@SUA-LOJA.com.br`; byte 0 e' a chave, XOR no resto). O script acusava
    "destino existe na original e NAO existe na nova" — falso. Colapsa as duas num token.
    """
    if not h:
        return h
    if CF_EMAIL_RE.match(h):
        return "/cdn-cgi/l/email-protection"
    return h if h.startswith(("http", "#", "mailto:", "tel:")) else "/" + h.lstrip("/")


def decodificar_cfemail(hex_str):
    """Decodifica o `data-cfemail` / o hash do href. Use para PROVAR que e' o mesmo e-mail."""
    try:
        b = bytes.fromhex(hex_str.lstrip("#"))
        return "".join(chr(x ^ b[0]) for x in b[1:])
    except Exception:
        return None


def checar_links(nova, original, rotulo):
    """ERRO so' para DESTINO que existe na original e nao existe na nova.

    ⚠️ A versao anterior comparava CONTAGEM por href e produzia erro para diferenca de markup.
    Medido: um card de categoria vem com duas ancoras para o mesmo destino no twig e uma no
    React (ou vice-versa), e o mesmo destino alcancavel dos dois lados aparecia como
    "1 vez na original e 2 na nova". O que importa para a pessoa e' se da' para CHEGAR no
    destino; multiplicidade e' detalhe de markup e virou info.
    """
    cn, co = Counter(map(norm_href, nova)), Counter(map(norm_href, original))
    brutos_n, brutos_o = set(nova), set(original)
    print("  %s: %d links na nova, %d na original (%d destinos distintos vs %d)"
          % (rotulo, len(nova), len(original), len(set(cn)), len(set(co))))
    for href in sorted(set(co) - set(cn), key=lambda x: x or ""):
        erro("%s: destino %r existe na original e NAO existe na nova." % (rotulo, href))
    for href in sorted(set(cn) - set(co), key=lambda x: x or ""):
        aviso("%s: destino %r só existe na nova." % (rotulo, href))
    dif = [(h, co[h], cn[h]) for h in sorted(set(co) & set(cn), key=lambda x: x or "")
           if co[h] != cn[h]]
    if dif:
        info("%s: %d destino(s) alcancavel(is) nos dois lados com contagem de ancoras diferente "
             "(markup, nao acesso): %s" % (rotulo, len(dif),
             ", ".join("%s %d->%d" % d for d in dif[:6])))
    so_barra = {h for h in brutos_o if h and not h.startswith(("http", "#", "/"))
                and ("/" + h) in brutos_n}
    for h in sorted(so_barra):
        info("%s: href %r na original virou %r na nova (barra inicial). A original usava "
             "caminho relativo; normalizar e' melhora, nao defeito." % (rotulo, h, "/" + h))
    # e-mail ofuscado pela Cloudflare (so' numa loja com ela na frente): prove que os dois lados
    # apontam para o MESMO endereco
    cf = [h for h in list(brutos_n) + list(brutos_o) if h and CF_EMAIL_RE.match(h) and "#" in h]
    enderecos = {decodificar_cfemail(h.split("#", 1)[1]) for h in cf}
    enderecos.discard(None)
    if enderecos:
        info("%s: e-mail ofuscado pela Cloudflare nos dois lados (formas diferentes do mesmo "
             "recurso). Decodificado: %s" % (rotulo, ", ".join(sorted(enderecos))))


def checar_textos(soup_nova, soup_orig, sel_nova, sel_orig, rotulo, k=6):
    """Compara o texto do miolo por SHINGLES de k palavras, nao por elemento-folha.

    ⚠️ POR QUE MUDOU. A versao anterior colhia apenas elementos-FOLHA (`h1..h6, p, span,
    button, a, li` sem filhos de texto) e comparava string por string com um Counter. Como o
    twig da origem e o React do destino aninham diferente, o MESMO texto visivel era extraido
    em pedacos diferentes e virava "texto da original ausente na nova". Medido na home:
    **17 falsos positivos por device**, numa pagina em que todos aqueles textos estavam
    presentes — inclusive um titulo de secao que aparecia 5 vezes na nova e 2 na original.

    Um checador que grita errado 17 vezes e' pior que nenhum: ensina a pessoa a ignora-lo, e
    entao o achado verdadeiro passa junto com o ruido.

    Buscar shingles no texto corrido do container nao depende de aninhamento. O que ela deixa
    de pegar, de proposito: reordenacao (o texto existe, em lugar errado) e alteracao menor que
    k palavras dentro de um trecho longo. Em troca, quando ela acusa, e' de verdade.
    """
    tn, to = texto_plano(soup_nova, sel_nova), texto_plano(soup_orig, sel_orig)
    pn, po = palavras(tn), palavras(to)
    sn, so = _shingles(pn, k), _shingles(po, k)
    cobertura = 100.0 * len(so & sn) / len(so) if so else 100.0
    print("  %s: %d palavras na nova, %d na original — %.1f%% do texto da original "
          "aparece na nova" % (rotulo, len(pn), len(po), cobertura))
    for ini, fim in _faixas_ausentes(po, sn, k):
        trecho = " ".join(po[ini:fim + k])
        erro("%s: texto da original AUSENTE na nova (%d palavras): %r"
             % (rotulo, fim + k - ini, trecho[:120]))
    for ini, fim in _faixas_ausentes(pn, so, k):
        trecho = " ".join(pn[ini:fim + k])
        aviso("%s: texto novo, sem correspondente na original (%d palavras): %r"
              % (rotulo, fim + k - ini, trecho[:120]))


# ---------------------------------------------------------------------------
# 4. LINT DO JSON — config que o renderizador ignora ou aplica errado
# ---------------------------------------------------------------------------
def ligado(v):
    """O interruptor esta' ligado? O servidor grava todo escalar como texto (armadilhas.md 27):
    um JSON relido do admin traz "false", e "false" e' verdadeiro para o Python. Sem isto, o
    lint de uma edicao pontual (versao nova montada a partir do backup) acusava ERRO falso de
    padding/margin em todo bloco `editor` e `imagem`."""
    if isinstance(v, str):
        return v.strip().lower() not in ("", "false", "0", "null", "undefined")
    return bool(v)


def _grupo(c, chave):
    g = c.get(chave)
    return g if isinstance(g, dict) else {}


def lint_json(doc, miolo_sel, cor_link=None):
    # A tipografia pode estar resolvida no campo `style` em vez de inline em cada elemento.
    # Precisa vir ANTES de andar(), que e' quem cobra. Ver regras_tipografia.
    bc_doc = (str(doc.get("body_class") or "").split() or [""])[0]
    regras_txt = regras_tipografia(doc.get("style") or "")

    def andar(l, prof=0):
        for b in l or []:
            c = b.get("config")
            c = c if isinstance(c, dict) else {}
            t = b.get("type")
            bid = b.get("id")

            # margin em `imagem` cai no <img> e, com apply_aspect_ratio (height:100%),
            # INFLA a ancora e DISTORCE a imagem. Medido: 605x280 numa coluna de 580 com
            # margin-bottom 10px -> ancora 278, imagem esticada para 580x278 (certo: 268),
            # e ZERO de espaco entre ela e a de baixo.
            if t == "imagem" and ligado(_grupo(c, "margin").get("apply")):
                erro("bloco `imagem` %s tem margin.apply — isso DISTORCE a imagem em vez de "
                     "espacar. Para separar imagens empilhadas use display.gap no bloco da "
                     "COLUNA que as contem." % bid)
            if t == "imagem" and ligado(_grupo(c, "padding").get("apply")):
                aviso("bloco `imagem` %s tem padding.apply — o bloco nao tem wrapper proprio "
                      "(renderiza <a><img>), entao o padding cai no <img>. Ponha num bloco "
                      "`block` em volta." % bid)
            if t == "editor" and ligado(_grupo(c, "padding").get("apply")):
                erro("bloco `editor` %s tem padding.apply — e' IGNORADO. Ponha o padding no "
                     "bloco que envolve o texto." % bid)
            if t in ("editor", "code") and _grupo(c, "display").get("type") != "block":
                erro("bloco `%s` %s sem display.type 'block' — no flex do default cada <p> e "
                     "<h2> vira item lado a lado." % (t, bid))
            if t == "imagem" and ligado(c.get("use_custom_size")) and not ligado(c.get("apply_aspect_ratio")):
                erro("bloco `imagem` %s com use_custom_size e SEM apply_aspect_ratio — a "
                     "altura trava e a imagem distorce." % bid)
            if c.get("class") == "row" and _grupo(c, "display").get("type") != "flex":
                erro("bloco %s tem class 'row' sem display.type 'flex' — as colunas empilham."
                     % bid)
            if t == "code" and re.search(r"<script", c.get("code") or "", re.I):
                erro("bloco `code` %s contem <script> — o React insere por "
                     "dangerouslySetInnerHTML e script inserido por innerHTML NAO EXECUTA. "
                     "E' codigo morto viajando duas vezes em cada visita." % bid)
            if t in ("editor", "code"):
                cod = c.get("code") or ""
                cls_bloco = set(str(c.get("class") or "").split())
                # `li` e `td` entraram porque o 11c so' listava <p>/<h2>/<a>: nao existe regra
                # de `li` em nenhum dos dois temas, e o `body` e' 12px na original contra 16px
                # no tema novo — toda lista migra 33% maior sem sintoma no JSON.
                for tag in re.findall(r"<(p|h1|h2|h3|h4|h5|h6|li|td)(?![\w-])([^>]*)>", cod):
                    if "font-size" in tag[1] or tipografia_coberta(
                            regras_txt, tag[0], "font-size", cls_bloco, bc_doc):
                        continue
                    aviso("bloco `%s` %s tem <%s> sem font-size — nem inline, nem por regra do "
                          "campo `style` que alcance este bloco. A regra do tema e' "
                          "`p{font-size:1.4em}`, RELATIVA, e o `body` do tema novo e' 16px "
                          "contra 12px da original: o <p> sai a 22,4px em vez de 16,8px."
                          % (t, bid, tag[0]))
                    break
                if re.search(r"<a\b(?![^>]*text-decoration)", cod) and not tipografia_coberta(
                        regras_txt, "a", "text-decoration", cls_bloco, bc_doc):
                    aviso("bloco `%s` %s tem <a> sem text-decoration — nem inline, nem por regra "
                          "do campo `style`. O tema novo sublinha links por padrao." % (t, bid))
                # ⚠️ A COR do link nao e' decidivel offline. Medido numa loja real: as folhas
                # declaravam uma cor para `a` e o computado da original era outra (a
                # --primary-color da loja). Uma gravacao real saiu com o link na cor errada por
                # confiar no arquivo. Ver armadilhas.md 23. A cor medida vem de --cor-link.
                estilo = (doc.get("style") or "").lower()
                if re.search(r"<a\b", cod) and not (cor_link and cor_link.lower() in estilo):
                    if cor_link:
                        aviso("bloco `%s` %s tem <a> e o campo `style` nao menciona %s (a cor do "
                              "link medida na original, --cor-link). Confira se o link vai sair "
                              "nessa cor: as folhas do tema podem declarar outra." % (t, bid, cor_link))
                    else:
                        aviso("bloco `%s` %s tem <a> e a cor do link nao foi informada "
                              "(--cor-link). MECA a cor do link na original com getComputedStyle: "
                              "as folhas podem declarar uma cor e o computado ser outra "
                              "(--primary-color da loja)." % (t, bid))
            if t == "vitrine" and c.get("display_mode") == "grid" and not c.get("grid"):
                erro("vitrine %s em display_mode 'grid' sem o campo `grid` — o tema faz "
                     "(itemsPerGridRow?.desktop)||1 e renderiza UMA coluna. Grave "
                     "grid:{desktop:'6',mobile:'2'} (numero de COLUNAS; nao e' o 12/N do "
                     "Bootstrap que o construtor twig usava)." % bid)
            andar(b.get("child"), prof + 1)

    andar(doc.get("block_list"))

    css = doc.get("style") or ""
    bc = doc.get("body_class") or ""
    # ⚠️ So' avisa quando a regra usa classe DO TEMA. A versao anterior avisava para
    # QUALQUER regra composta, inclusive as que usam so' a sua propria classe (`.txt p`) —
    # que nao podem vazar por definicao, e que a secao 1 deste mesmo script mede como
    # 0/0/0 em header/footer/fora-do-miolo 50 linhas acima na mesma execucao. Medido: 7
    # avisos por device contradizendo a propria saida do script.
    # `.container` e `.row` sao a excecao conhecida: 0 ocorrencias em header/footer.
    GRID_TEMA_RE = re.compile(r"\.(container|container-fluid|row|col-(xs|sm|md|lg|xl)(-\d{1,2})?)\b")
    for sel in seletores_do_style(css):
        alvo = sel.replace("." + bc, "").strip() if bc else sel
        if miolo_sel.lstrip("#.") in sel or not alvo or " " not in alvo:
            continue
        if CLASSE_TEMA_RE.search(sel):
            aviso("Regra `%s` usa classe do TEMA e NAO esta escopada em `%s` — o body_class fica "
                  "no <body>, entao ela alcanca header, rodape e flutuantes. Medido: uma regra "
                  "assim pegou 96 elementos do <header> e 13 do <footer>." % (sel, miolo_sel))
        elif GRID_TEMA_RE.search(sel):
            info("Regra `%s` usa utilidade de grid do tema sem escopo no `%s`. E' a excecao "
                 "medida (.container/.row: 0 ocorrencias em header e footer), mas escopar e' "
                 "de graca." % (sel, miolo_sel))


# ---------------------------------------------------------------------------
# 5. BLOCOS ENTREGUES POR DEVICE
# ---------------------------------------------------------------------------
def layout_entregue(html):
    m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.S)
    if not m:
        return None
    try:
        d = json.loads(m.group(1))
        pp = d["props"]["pageProps"]
        return pp.get("pageParams", {}).get("layout"), pp.get("isssrmobile")
    except Exception:
        return None


def contar(bl):
    n, tipos = 0, Counter()
    def w(l):
        nonlocal n
        for b in l or []:
            n += 1
            tipos[b.get("type")] += 1
            w(b.get("child"))
    w(bl)
    return n, tipos


# ---------------------------------------------------------------------------
# 6. o que so' o navegador ve — imprime o JS pronto
# ---------------------------------------------------------------------------
JS_NAVEGADOR = r"""
// ---------------------------------------------------------------------------
// Cole no console da PAGINA NOVA e depois na ORIGINAL, e compare as duas saidas.
// Pega o que o script offline nao alcanca: tipografia computada, geometria e
// irmaos com a mesma config medindo diferente.
// ---------------------------------------------------------------------------
(() => {
  const R = e => { const r = e.getBoundingClientRect();
                   return Math.round(r.width) + 'x' + Math.round(r.height); };
  const out = ['innerWidth ' + innerWidth + ' dpr ' + devicePixelRatio];

  // 1. tipografia de TODA folha de texto (pega <p> herdando 1.4em do tema)
  const vistos = new Set();
  document.querySelectorAll('#layout-main-content *, #area-body *').forEach(e => {
    if (e.children.length) return;
    const t = (e.textContent || '').trim();
    if (t.length < 3 || vistos.has(t)) return;
    vistos.add(t);
    const s = getComputedStyle(e);
    out.push('TXT <' + e.tagName.toLowerCase() + '> ' + s.fontSize + '/' + s.lineHeight
      + ' w' + s.fontWeight + ' ' + s.color
      + (s.textDecorationLine !== 'none' ? ' ' + s.textDecorationLine : '')
      + '  ' + t.slice(0, 34));
  });

  // 2. IRMAOS COM A MESMA CONFIG MEDINDO DIFERENTE — foi assim que passou uma imagem
  //    esticada 10px (278 contra 268) que estava na minha propria saida de medicao.
  document.querySelectorAll('#layout-main-content div, #area-body div').forEach(p => {
    const f = [...p.children].filter(c => c.querySelector && c.querySelector('img'));
    if (f.length < 2) return;
    const hs = f.map(c => Math.round(c.getBoundingClientRect().height));
    const ws = f.map(c => Math.round(c.getBoundingClientRect().width));
    if (new Set(ws).size === 1 && new Set(hs).size > 1) {
      const im = f.map(c => c.querySelector('img'));
      const ar = im.map(i => i.getAttribute('width') + 'x' + i.getAttribute('height'));
      if (new Set(ar).size === 1)
        out.push('!! IRMAOS ANOMALOS em ' + (p.id || p.className).slice(0, 30)
          + ': pedem ' + ar[0] + ' e medem alturas ' + hs.join('/')
          + ' — provavel margin em bloco `imagem` (distorce em vez de espacar)');
    }
  });

  // 3. imagem que nao carregou
  document.querySelectorAll('img').forEach(i => {
    if (i.complete && i.naturalWidth === 0)
      out.push('!! IMG QUEBRADA ' + (i.getAttribute('src') || '').slice(-60));
  });

  // 4. geometria do grid e das seccoes
  ['.container', '.row', '.col-sm-3', '.col-sm-6', '.col-sm-7', '.col-md-5'].forEach(s => {
    const e = document.querySelector(s);
    if (e) out.push('GRID ' + s + ' ' + R(e));
  });
  out.push('SECOES ' + [...document.querySelectorAll('#layout-main-content > * > *, #area-body > *')]
    .map(e => Math.round(e.getBoundingClientRect().height)).join(','));

  // 5. o tema esta intacto?
  const logo = document.querySelector('.pano-logo-svg, header .logo svg, header img');
  if (logo) out.push('LOGO ' + R(logo) + '  <- compare com outra pagina do MESMO site');
  const h = document.querySelector('header');
  if (h) out.push('HEADER ' + R(h));
  out.push('H1 na pagina: ' + document.querySelectorAll('h1').length);

  return out.join('\n');
})()
"""


# ---------------------------------------------------------------------------
def eh_url(x):
    """Mesmo criterio de `baixar`: o resto e' caminho de arquivo local."""
    return bool(x) and "://" in x[:10]


def main():
    # No Windows, com a saida canalizada (e' como os assistentes rodam os comandos), o Python escreve em
    # cp1252: o primeiro emoji do texto da pagina (um alt "🔥 Oferta") derrubava o script com
    # UnicodeEncodeError antes do resumo de erros, e os acentos saiam trocados. `python -I`
    # ignora o PYTHONUTF8, entao a correcao tem de estar aqui (a mesma do gerar_previa.py).
    for st in (sys.stdout, sys.stderr):
        try:
            st.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--nova", required=True)
    ap.add_argument("--original")
    ap.add_argument("--controle")
    ap.add_argument("--json")
    ap.add_argument("--miolo", default="#layout-main-content")
    ap.add_argument("--miolo-original", default="#area-body")
    ap.add_argument("--mobile", action="store_true",
                    help="so' com URL em --nova/--original; com arquivo local, rode de novo com "
                         "os HTML de celular")
    ap.add_argument("--testar-imagens", action="store_true",
                    help="faz um HTTP em cada imagem (mais lento)")
    ap.add_argument("--cor-link",
                    help="cor do link MEDIDA na original (#RRGGBB), do perfil da loja")
    a = ap.parse_args()
    if a.cor_link is not None and not COR_HEX_RE.match(a.cor_link.strip()):
        ap.error("--cor-link precisa ser uma cor hexadecimal medida, como #1a2b3c "
                 "(recebido %r). Meca na original com getComputedStyle." % a.cor_link)
    cor_link = a.cor_link.strip() if a.cor_link else None
    # --mobile so' faz sentido com URL. Com arquivo local, `baixar(..., mobile=True)` relia o MESMO
    # arquivo de computador: acusava "isssrmobile=False" (ERRO falso) e refazia a secao 7 com os
    # arquivos de computador sob o rotulo "mobile", sem nunca conferir o celular.
    mobile_local = a.mobile and (not eh_url(a.nova) or bool(a.original and not eh_url(a.original)))

    print("=" * 74)
    print("VERIFICACAO DE PARIDADE")
    print("=" * 74)

    html_nova = baixar(a.nova)
    s_nova = BeautifulSoup(html_nova, "html.parser")
    print("nova     : %s (%d chars, body class %r)"
          % (a.nova, len(html_nova), " ".join((s_nova.body.get("class") or []) if s_nova.body else [])))

    if re.search(r"n[ãa]o mapeada|@todo", html_nova, re.I):
        erro("A pagina nova responde 'Pagina nao mapeada' — ela esta DESPUBLICADA. "
             "Sem publicar nao ha verificacao possivel.")

    # ---- CSS de pagina -----------------------------------------------------
    css = ""
    doc = None
    if a.json:
        doc = json.load(io.open(a.json, encoding="utf-8"))
        css = doc.get("style") or ""
        print("json     : %s (style com %d chars)" % (a.json, len(css)))
    else:
        lay = layout_entregue(html_nova)
        if lay and lay[0]:
            css = lay[0].get("blockStyle") or ""
            print("style    : lido do __NEXT_DATA__ (%d chars)" % len(css))

    print("\n--- 1. CSS de pagina vazando para o tema " + "-" * 33)
    checar_vazamento(s_nova, css, a.miolo)

    print("\n--- 2. Header/footer contra pagina de controle " + "-" * 27)
    if a.controle:
        s_ctrl = BeautifulSoup(baixar(a.controle), "html.parser")
        comparar_com_controle(s_nova, s_ctrl)
    else:
        print("  (pulada — sem --controle)")
        aviso("Sem --controle: NAO da' para saber se uma diferenca no header/rodape e' sua ou do "
              "tema. E' a unica checagem que separa 'o tema e' assim' de 'eu quebrei o tema'. "
              "Passe outra pagina JA' PUBLICADA do site novo, baixada com o MESMO user-agent.")

    # ---- blocos entregues --------------------------------------------------
    print("\n--- 3. Blocos entregues por device " + "-" * 39)
    lay = layout_entregue(html_nova)
    # ⚠️ O rotulo do device NAO pode ser a string fixa "desktop". Rodando o par MOBILE por
    # caminho local, a saida dizia `desktop: 515 palavras na nova` ao lado de
    # `raizes ['Mobile'], isssrmobile=True` — o rotulo contradizendo o dado na mesma tela, que e'
    # exatamente o tipo de ruido que treina a pessoa a ignorar a saida. Deduza do que veio.
    rotulo = "desktop"
    if lay and lay[0]:
        nomes = [(b.get("name") or "").strip().lower() for b in lay[0]["blockList"]]
        if lay[1] or (nomes and all(n == "mobile" for n in nomes)):
            rotulo = "mobile"
    if lay and lay[0]:
        n, tipos = contar(lay[0].get("blockList"))
        print("  %s: %d blocos, raizes %s, isssrmobile=%s"
              % (rotulo, n, [b.get("name") for b in lay[0]["blockList"]], lay[1]))
        if doc:
            escrito, _ = contar(doc.get("block_list"))
            print("  gravado no admin: %d blocos" % escrito)
            if n >= escrito:
                erro("O front entregou %d de %d blocos. Deveria entregar cerca de METADE — "
                     "o corte por device_show nao funcionou (confira as duas raizes)."
                     % (n, escrito))
        if len(lay[0]["blockList"]) != 1:
            aviso("O front entregou %d raizes; o normal e' 1 (a do device pedido)."
                  % len(lay[0]["blockList"]))
    # Mesma razao da secao 7: se --nova JA' e' o mobile, isto reimprime a linha de cima.
    if a.mobile and rotulo != "mobile" and mobile_local:
        aviso("--mobile ignorado: com arquivo local em --nova/--original nao ha o que baixar com "
              "user-agent de iPhone (ele releria o MESMO arquivo de computador). O celular NAO foi "
              "conferido nesta rodada: rode de novo com os HTML baixados com user-agent de iPhone "
              "(--nova nova-mobile.html --original orig-mobile.html --controle controle-mobile.html).")
    elif a.mobile and rotulo != "mobile":
        html_m = baixar(a.nova, mobile=True)
        lay_m = layout_entregue(html_m)
        if lay_m and lay_m[0]:
            nm, _ = contar(lay_m[0].get("blockList"))
            print("  mobile : %d blocos, raizes %s, isssrmobile=%s"
                  % (nm, [b.get("name") for b in lay_m[0]["blockList"]], lay_m[1]))
            if not lay_m[1]:
                erro("Pedido com user-agent de iPhone veio com isssrmobile=%r." % lay_m[1])
    elif a.mobile and lay and not lay[1]:
        erro("O que veio em --nova e' a variante mobile mas isssrmobile=%r." % lay[1])

    # ---- imagens -----------------------------------------------------------
    print("\n--- 4. Imagens " + "-" * 59)
    im_nova = imagens(s_nova, a.miolo)
    im_orig = None
    s_orig = None
    if a.original:
        s_orig = BeautifulSoup(baixar(a.original), "html.parser")
        im_orig = imagens(s_orig, a.miolo_original)
    checar_imagens(im_nova, im_orig, a.testar_imagens)

    # ---- links e texto -----------------------------------------------------
    if s_orig is not None:
        print("\n--- 5. Links " + "-" * 61)
        checar_links(links(s_nova, a.miolo), links(s_orig, a.miolo_original), rotulo)
        print("\n--- 6. Textos " + "-" * 60)
        checar_textos(s_nova, s_orig, a.miolo, a.miolo_original, rotulo)
        # ⚠️ So' vale re-buscar com UA de celular se o que veio em --nova JA' NAO e' o mobile.
        # Quando voce passa os artefatos mobile (o caminho recomendado: arquivo local, sem
        # depender da rede), `rotulo` ja' e' "mobile" e a secao 7 repetia as secoes 5 e 6
        # sobre os MESMOS bytes — DOBRANDO cada achado e cada ERRO na contagem final.
        # Medido: "2 erro(s)" onde havia 1 defeito real.
        if a.mobile and rotulo != "mobile" and not mobile_local:
            print("\n--- 7. Links e textos no MOBILE " + "-" * 42)
            s_nm = BeautifulSoup(baixar(a.nova, mobile=True), "html.parser")
            s_om = BeautifulSoup(baixar(a.original, mobile=True), "html.parser")
            checar_links(links(s_nm, a.miolo), links(s_om, a.miolo_original), "mobile")
            checar_textos(s_nm, s_om, a.miolo, a.miolo_original, "mobile")
        elif a.mobile and rotulo == "mobile":
            info("--mobile ignorado: o que veio em --nova/--original JA' e' a variante mobile "
                 "(secoes 5 e 6 acima), entao re-buscar duplicaria cada achado.")

    # ---- h1 ----------------------------------------------------------------
    miolo = s_nova.select_one(a.miolo)
    h1n = len(miolo.find_all("h1")) if miolo else 0
    if s_orig is not None:
        mo = s_orig.select_one(a.miolo_original)
        h1o = len(mo.find_all("h1")) if mo else 0
        print("\n--- 8. H1 " + "-" * 64)
        print("  original: %d h1   nova: %d h1" % (h1o, h1n))
        if h1n == 0 and h1o > 0:
            aviso("A nova ficou SEM <h1> e a original tinha %d. Promova um titulo visivel." % h1o)

    # ---- lint do JSON ------------------------------------------------------
    if doc:
        print("\n--- 9. Lint da config dos blocos " + "-" * 41)
        lint_json(doc, a.miolo, cor_link)
        print("  (sem saida aqui significa que nenhum padrao conhecido de config-que-nao-"
              "funciona foi encontrado)")

    # ---- relatorio ---------------------------------------------------------
    print("\n" + "=" * 74)
    for m in ERROS:
        print("  ERRO   " + m)
    for m in AVISOS:
        print("  AVISO  " + m)
    for m in INFOS:
        print("  info   " + m)
    print("-" * 74)
    print("%d erro(s), %d aviso(s)." % (len(ERROS), len(AVISOS)))
    print("\nAINDA FALTA O NAVEGADOR: tipografia computada, geometria, irmaos anomalos e as")
    print("vitrines (que o tema novo monta no cliente). Cole este JS na nova E na original,")
    print("com a MESMA largura de janela, e compare as duas saidas:")
    print(JS_NAVEGADOR)
    return 1 if ERROS else 0


if __name__ == "__main__":
    raise SystemExit(main())
