"""Gera um favorito de PRÉVIA (bookmarklet) para mostrar uma mudança de CSS e/ou JS no site de verdade, sem gravar
nada no admin. Clicar no favorito liga a prévia na aba aberta; clicar de novo desliga. Só quem clicou vê, e só
naquela aba: recarregar a página também desliga.

Uso (Python 3, sem dependências):
    python -I gerar_previa.py --css minha-mudanca.css --depois-de "meu-tema.css" --saida previa-favorito.txt
    python -I gerar_previa.py --css a.css --css b.css --js liga-natal.js \
        --depois-de "meu-tema.css" --nome "Tema de Natal" --saida previa-natal.txt
    python -I gerar_previa.py --css conserto.css --depois-de "style:.minha-regra-do-scss{" --saida previa-scss.txt
    python -I gerar_previa.py --css tema.css --depois-de "page-x.css" --js liga-classe.js --js tema.js \
        --desligar __temaDesligar --resize --transporte --saida previa-tema.txt
    (--classe-body é para uma mudança DENTRO de um tema já ligado. Para mostrar um tema que ainda não está na
    agenda, o --js põe a classe e o --classe-body fica de fora, porque o teste da classe roda antes do JS.)
    (No Git Bash do Windows, não comece o --depois-de com "/": ele vira "C:/Program Files/Git/...". Basta o nome
    do arquivo, porque a busca é por trecho do href.)

Opções:
  --css ARQ         CSS a aplicar (pode repetir; entram na ordem dada). Comentários são retirados. Arquivo com
                    BOM é recusado (salve sem BOM).
  --js ARQ          JavaScript a rodar quando a prévia liga (opcional; pode repetir: rodam na ordem dada, cada um
                    na sua função e no seu try/catch). Se ele precisar desfazer algo ao desligar, defina dentro
                    dele  window.__previaDesligar = function () { ... };  que o favorito chama (com vários --js,
                    cada um pode definir o seu; no desligar, rodam do último para o primeiro).
                    Cada um roda dentro de uma função: "function x(){}" e "var x" no topo ficam locais na prévia.
                    Código que depende de data lê a hora por api.agora = window.__previaAgora || ...; para
                    mostrar uma data futura, um --js fixa window.__previaAgora antes do JS do tema (previa.md,
                    "JS na prévia"): um favorito por data.
  --desligar NOME   (com --js) O JS do tema já exporta a própria função de desligar, em window.NOME (ex.:
                    __temaDesligar). O favorito lê window.NOME antes de rodar o --js; se depois dele window.NOME
                    é uma função NOVA, ele a guarda e a chama no segundo clique (depois do __previaDesligar, se
                    houver), e devolve a window.NOME o que havia antes. Função que já existia antes do --js (de
                    uma versão publicada, de uma prévia velha) nunca é adotada. Assim a prévia roda o arquivo
                    publicado sem embrulho escrito à mão.
  --resize          Dispara window.dispatchEvent(new Event('resize')) depois de ligar e depois de desligar. Para um
                    CSS que muda a largura ou a altura de um contêiner cujo carrossel (Owl) se mediu na carga
                    da página: sem isso, o carrossel sai cortado só na prévia. O resize faz outros componentes se
                    remedirem também: confira "sem a classe, 0 diferenças" com a contraprova
                    (medir-no-navegador.md, 9).
  --classe-body C   Só liga se o <body> tiver essa classe (ex.: a classe do tema que a mudança pressupõe, ou
                    isMobile numa mudança só do celular). Pode repetir: todas têm de estar no <body>.
  --depois-de TXT   Insere o <style> logo depois do <link> de CSS cujo href contém TXT, para a prévia ficar na
                    MESMA posição da cascata que o arquivo publicado vai ter. Use para CSS que vai ser
                    ACRESCENTADO a um arquivo. "#algum-id" acha o elemento pelo id (ex.: o <style> do CSS da
                    página do construtor). "style:TRECHO" acha o <style> da página cujo texto contém TRECHO (o
                    do SCSS de Personalização não tem id e nem sempre é o último do <head>): copie o trecho do
                    <style> servido, que é o CSS já compilado. Se não achar, não liga (alerta na tela). Se mais
                    de um arquivo (ou mais de um <style>) tiver esse trecho, também avisa e não liga: use um
                    trecho maior, que só ele tenha (ex.: "arquivos/meu-tema.css", sem a barra do começo).
  --substitui TXT   Como --depois-de (aceita "#id" e "style:TRECHO"), mas DESLIGA o achado e põe o CSS no lugar
                    dele. Use quando o --css é a versão nova INTEIRA de um arquivo que já está no site (regras
                    mudadas ou apagadas somem na prévia como vão sumir no ar). Se não achar, não liga. Desligar
                    a prévia religa o original (se ele estiver ligado duas vezes na página, as duas cópias).
                    Um <link> é desligado pela folha de estilo dele (link.sheet.disabled), sem mexer no
                    elemento: mexer no disabled do elemento fazia o navegador recarregar o arquivo, e logo depois
                    de desligar a prévia a folha ainda não estava lá (medido: 287 diferenças na hora, 0 depois
                    de 2 s). Um <style> é desligado pelo elemento, que é a folha dele. Se o <link> ainda não tem
                    folha (a página ainda está carregando), o favorito avisa e não liga.
  --fim-do-head     Põe o <style> no fim do <head>, depois de todas as folhas do <head> (e do que os scripts
                    puseram lá). Use só se o arquivo publicado for ficar ali: numa família medida, a /dist, ali ele
                    ganharia do SCSS de Personalização, que no ar vem depois dos arquivos da loja (a prévia
                    mentiria); noutra, a modelo-1, os links do Custom (o Código dentro do <head>) são as últimas
                    folhas do <head>. Confira a ordem na sua loja (medir-no-navegador.md, 1), na página já
                    carregada. Com --css, uma das três opções de posição é obrigatória.
  --id ID           id do <style> (padrão: previa-claude). Use ids diferentes para prévias que convivem.
  --nome TEXTO      Nome mostrado no aviso "Prévia ligada" e nos alertas.
  --sem-aviso       Não mostra o selo "Prévia ligada" no canto da tela (ex.: para prints finais).
  --transporte      Grava também ARQ.gz.b64: o código legível (ARQ.js) em gzip e base64, numa linha, para levar a
                    prévia a um navegador cuja ferramenta não tem upload de arquivo (ferramentas-de-navegador.md,
                    4). Imprime o tamanho e o sha256 do código, que a página confere depois de decodificar.
  --compactar-js    (opcional) Tira os comentários, o recuo, os espaços do fim das linhas e as linhas em branco
                    de cada --js, SÓ dentro do favorito, e só onde tem certeza de como o JS se lê. No favorito,
                    cada espaço e cada quebra de linha viram 3 caracteres (%20, %0A): numa loja, o JS de um tema
                    ocupava ~1,7x o tamanho do arquivo. Onde não há certeza (barra que pode ser divisão ou regex
                    com aspas ou comentário no resto da linha, "<!--" ou "-->" fora de string, #!, CR, U+2028,
                    string, template, regex ou comentário sem fechar), aquele --js vai como está e sai um
                    "AVISO: não compactei ARQ: motivo, linha". A versão compactada é cortada em pedaços de novo e
                    tem de dar os mesmos pedaços do original (fora comentários e espaços), com as mesmas quebras
                    de linha entre eles (o JS põe ponto e vírgula sozinho numa quebra); depois passa no node
                    --check. Sem Node, não compacta (AVISO). Os arquivos de entrada nunca são escritos, e o sha
                    impresso é o do arquivo, que é o que vai para o admin.
  --permitir-nao-ascii  Não avisa de caractere fora do ASCII num --css ou --js. Sem esta opção, cada arquivo
                    com um caractere assim sai num AVISO (não ERRO) com a linha, a coluna e o escape a usar (em
                    CSS, o de 6 dígitos, \\0000e9; em string de JS, \\u00e9; em comentário, sem acento): o
                    favorito funciona com ele, mas o arquivo que vai para o admin vai em ASCII e passa antes pelo
                    montar_tema.py, que recusa. Trocar antes da aprovação evita refazer a prévia e o "aprovado"
                    quando o sha muda.
  --autoteste       Roda os testes internos do compactador de JS e do aviso de caractere fora do ASCII, e sai.
  --saida ARQ.txt   Arquivo com o favorito (uma linha "javascript:..."). Também grava ARQ.js com o código legível,
                    para o Claude rodar na própria aba do navegador e conferir antes de entregar. Por isso use um
                    nome que não seja o de nenhum --css/--js (ex.: previa-barra.txt): o script recusa se for, e
                    também recusa sobrescrever um ARQ.js, ARQ.txt ou ARQ.gz.b64 que ele mesmo não gerou. Se der
                    ERRO, nada é gravado (uma saída anterior fica como estava).

Saída: a linha "ok" e o sha256 de cada --css e --js (dos bytes do arquivo). É esse sha que vai no histórico do
perfil quando a pessoa aprovar. Mudou um byte da fonte depois? Gere o favorito de novo e peça o "aprovado" de
novo. Acima de 55 mil caracteres, um AVISO: o maior favorito medido funcionando tinha ~55 mil. O AVISO diz de onde
vêm os caracteres (o CSS, cada --js e o código fixo do favorito), para saber o que cortar.

Para criar o favorito no Chrome: Ctrl+Shift+O (Gerenciador de favoritos) > menu de três pontos > Adicionar novo
favorito > Nome à vontade > no campo URL, colar o conteúdo inteiro do .txt. Colar direto na barra de endereço não
funciona: o Chrome apaga o "javascript:" do começo.
"""
import argparse
import base64
import binascii
import gzip
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
import urllib.parse
import zlib

SAFE = "()=>{};,.:'!-_*"
ASSINATURA = '(function(){var d=document,ID='  # começo de todo .js legível que este script grava
LIMITE_MEDIDO = 55000  # o maior favorito medido funcionando no gerenciador de favoritos tinha ~55 mil caracteres

# Compactador de JS (--compactar-js). Depois destas palavras e pontuações, uma barra abre regex; depois de nome,
# número, ), ], string, regex ou fim de template, é divisão. ) e } são ambíguos: if (x) /re/ e {}\n/re/ abrem
# regex, (a) / 2 e ({}) / 2 dividem. Por isso, depois deles, e depois das palavras que também podem ser nomes de
# variável (of, yield, await), o compactador só segue se o resto da linha não tiver aspas, crase nem comentário: aí
# ler errado não muda o que é comentário, string ou fim de linha.
PALAVRAS_ANTES_DE_REGEX = frozenset('return typeof instanceof in of new delete void throw case do else yield '
                                    'await'.split())
PALAVRAS_DUVIDOSAS = frozenset(('of', 'yield', 'await'))
PONTUACAO_ANTES_DE_REGEX = frozenset('(,=:[!&|?{};+-*%<>~^/')


class JsIncerto(Exception):
    """O compactador não tem certeza de como o JS se lê neste ponto: o JS vai como está."""


def letra_js(c):
    """Letra de nome, palavra-chave ou número (inclui _, $ e o # de campo privado; fora do ASCII, o que não é
    espaço nem controle)."""
    if c.isascii():
        return c.isalnum() or c in '_$#'
    return not unicodedata.category(c).startswith(('Z', 'C'))


def tokens_js(src):
    """Corta um JS em pedaços que, juntos, refazem o texto. Devolve [(tipo, texto, linha)], com tipo 'esp' (espaços
    e tabs), 'nl' (quebra de linha), 'cl' (comentário //), 'cb' (comentário /* */), 'str', 'tpl' (pedaço de
    template: da crase ou do } que fecha um ${ até o próximo ${ ou a crase final), 're' (regex com as flags),
    'pal' (nome, palavra-chave ou número) ou 'pont'. Levanta JsIncerto onde não tem certeza."""
    for ch, nome in (('\r', 'CR (fim de linha do Windows)'), ('\u2028', 'U+2028'), ('\u2029', 'U+2029')):
        k = src.find(ch)
        if k >= 0:
            raise JsIncerto('%s na linha %d: o JS conta como quebra de linha' % (nome, src.count('\n', 0, k) + 1))
    if src.startswith('#!'):
        raise JsIncerto('a linha 1 começa com #!')
    toks, sig, pilha = [], [], [0]  # sig: os dois últimos pedaços que não são espaço nem comentário
    n, estado = len(src), {'linha': 1}

    def incerto(motivo, onde):
        raise JsIncerto('%s, linha %d' % (motivo, src.count('\n', 0, onde) + 1))

    def emite(tipo, ini, fim):
        t = src[ini:fim]
        toks.append((tipo, t, estado['linha']))
        estado['linha'] += t.count('\n')
        if tipo not in ('esp', 'nl', 'cl', 'cb'):
            sig.append((tipo, t))
            del sig[:-2]

    def template(ini):  # src[ini] é a crase ou o } que fecha um ${; devolve (fim, abre_outro_${)
        j = ini + 1
        while j < n:
            d = src[j]
            if d == '\\':
                j += 2; continue
            if d == '`':
                return j + 1, False
            if src.startswith('${', j):
                return j + 2, True
            j += 1
        incerto('template sem fechar', ini)

    def confere_resto_da_linha(i, depois_de):
        fim = src.find('\n', i)
        resto = src[i + 1:n if fim < 0 else fim]
        if any(x in resto for x in ('"', "'", '`', '//', '/*')):
            incerto('barra depois de "%s" com aspas, crase ou comentário no resto da linha: não sei se é divisão '
                    'ou regex' % depois_de, i)

    def barra_abre_regex(i):
        if not sig:
            return True
        tipo, t = sig[-1]
        # Dentro de um ${ } de template, errar divisão/regex desloca a pilha: um template seguinte seria lido
        # como código e perderia o texto (o "//" dele e o recuo). As duas conferências do fim usam a mesma
        # leitura, então não pegariam. Nos casos ambíguos, recuse.
        if len(pilha) > 1 and ((tipo == 'pont' and t in (')', '}')) or (tipo == 'pal' and t in PALAVRAS_DUVIDOSAS)):
            incerto('barra depois de "%s" dentro de ${ } de um template: não sei se é divisão ou regex' % t, i)
        if tipo == 'pal':
            if t in PALAVRAS_ANTES_DE_REGEX and not (len(sig) > 1 and sig[-2] == ('pont', '.')):
                if t in PALAVRAS_DUVIDOSAS:
                    confere_resto_da_linha(i, t)
                return True
            return False
        if tipo in ('str', 're'):
            return False
        if tipo == 'tpl':
            return not t.endswith('`')  # depois de "${" vem uma expressão; depois da crase final, divisão
        if t in ('++', '--', ']'):
            return False
        if t == ')':
            confere_resto_da_linha(i, t)
            return False
        if t == '}':
            confere_resto_da_linha(i, t)
            return True
        if t in PONTUACAO_ANTES_DE_REGEX:
            return True
        incerto('barra depois de "%s": não sei se é divisão ou regex' % t, i)

    i = 0
    while i < n:
        c = src[i]
        if c in ' \t':
            j = i
            while j < n and src[j] in ' \t':
                j += 1
            emite('esp', i, j); i = j; continue
        if c == '\n':
            emite('nl', i, i + 1); i += 1; continue
        if src.startswith('//', i):
            j = src.find('\n', i)
            j = n if j < 0 else j
            emite('cl', i, j); i = j; continue
        if src.startswith('/*', i):
            j = src.find('*/', i + 2)
            if j < 0:
                incerto('comentário /* sem fechar', i)
            emite('cb', i, j + 2); i = j + 2; continue
        if c in '"\'':
            j = i + 1
            while True:
                if j >= n:
                    incerto('string sem fechar', i)
                d = src[j]
                if d == '\\':  # escape; barra invertida + quebra de linha continua a string na linha seguinte
                    j += 2; continue
                if d == '\n':
                    incerto('quebra de linha dentro de string', i)
                j += 1
                if d == c:
                    break
            emite('str', i, j); i = j; continue
        if c == '`' or (c == '}' and len(pilha) > 1 and pilha[-1] == 0):
            if c == '}':
                pilha.pop()  # fecha o ${ de um template: o que vem depois é texto do template
            j, abre = template(i)
            emite('tpl', i, j)
            if abre:
                pilha.append(0)
            i = j; continue
        if c == '/':
            if not barra_abre_regex(i):
                emite('pont', i, i + 1); i += 1; continue
            j, classe = i + 1, False
            while True:
                if j >= n or src[j] == '\n':
                    incerto('regex sem fechar (ou uma barra lida como regex)', i)
                d = src[j]
                if d == '\\':
                    if j + 1 < n and src[j + 1] == '\n':
                        incerto('regex sem fechar', i)
                    j += 2; continue
                j += 1
                if classe:
                    if d == ']':
                        classe = False
                elif d == '[':
                    classe = True
                elif d == '/':
                    break
            while j < n and letra_js(src[j]):
                j += 1
            emite('re', i, j); i = j; continue
        if src.startswith('<!--', i) or src.startswith('-->', i):
            incerto('"<!--" ou "-->" fora de string: o navegador pode ler como comentário', i)
        if letra_js(c):
            j = i
            while j < n and letra_js(src[j]):
                j += 1
            emite('pal', i, j); i = j; continue
        if c in '+-' and src.startswith(c * 2, i):
            emite('pont', i, i + 2); i += 2; continue
        if c.isascii() and c.isprintable() and c != '\\':
            if c == '{':
                pilha[-1] += 1
            elif c == '}' and pilha[-1] > 0:
                pilha[-1] -= 1
            emite('pont', i, i + 1); i += 1; continue
        incerto('caractere %r fora de string' % c, i)
    return toks


def pedacos_significativos(toks):
    """Os pedaços que contam (fora espaços e comentários), cada um com "tinha quebra de linha antes" (um comentário
    /* */ com quebra conta como quebra, como no JS)."""
    out, quebra = [], False
    for tipo, t, _ in toks:
        if tipo == 'nl' or (tipo == 'cb' and '\n' in t):
            quebra = True
        elif tipo not in ('esp', 'cl', 'cb'):
            out.append((tipo, t, quebra if out else None))
            quebra = False
    return out


def compacta_js(src):
    """Tira os comentários, o recuo, os espaços do fim das linhas e as linhas em branco, só do que está em código
    (o que está dentro de string, template e regex fica igual). Um comentário /* */ vira quebra de linha se tinha
    uma (o JS põe ponto e vírgula sozinho nela) e espaço se não tinha. Levanta JsIncerto."""
    toks = tokens_js(src)
    passo = []
    for tipo, t, _ in toks:
        if tipo == 'cl':
            continue  # a quebra de linha depois dele fica
        if tipo == 'cb':
            tipo, t = ('nl', '\n') if '\n' in t else ('esp', ' ')
        if tipo == 'esp' and passo and passo[-1][0] == 'esp':
            passo[-1] = ('esp', ' ')
            continue
        passo.append((tipo, t))
    proximo, seguinte = [None] * len(passo), None
    for k in range(len(passo) - 1, -1, -1):
        proximo[k] = seguinte
        if passo[k][0] != 'esp':
            seguinte = passo[k][0]
    out, comeco = [], True  # comeco: no começo de uma linha que começa em código
    for k, (tipo, t) in enumerate(passo):
        if tipo == 'esp':
            if comeco or proximo[k] in (None, 'nl'):
                continue
            out.append(t)
        elif tipo == 'nl':
            if comeco:
                continue  # linha em branco (ou só com comentário)
            out.append('\n'); comeco = True
        else:
            out.append(t); comeco = False
    novo = ''.join(out)
    try:
        iguais = pedacos_significativos(tokens_js(novo)) == pedacos_significativos(toks)
    except JsIncerto:
        iguais = False
    if not iguais:
        raise JsIncerto('interno: a versão compactada não dá os mesmos pedaços do original')
    return novo


def autoteste():
    casos = [
        ('a = b / c; // x\n', 'a = b / c;\n'),
        ('x = /\\/\\*nao/.test(s) // c\n', 'x = /\\/\\*nao/.test(s)\n'),
        ('var t = `a ${ `b ${c}` } // nao`; // sim\n', 'var t = `a ${ `b ${c}` } // nao`;\n'),
        ("var s = '//'; // c\n", "var s = '//';\n"),
        ('var s = "/*"; /* c */\n', 'var s = "/*";\n'),
        ('function f() {\n    return /re/g; // c\n}\n', 'function f() {\nreturn /re/g;\n}\n'),
        ('var r = /[/]/; // c\n', 'var r = /[/]/;\n'),
        ('var t = `\n    um\n\n    dois`; // c\n  x();\n', 'var t = `\n    um\n\n    dois`;\nx();\n'),
        ('function g(x) {\n  return /* \n */ x;\n}\n', 'function g(x) {\nreturn\nx;\n}\n'),
        ('a = 1; /* x */ b = 2;\n', 'a = 1; b = 2;\n'),
        ('/* topo */\n\n\na();\n\n\n    b(); // fim', 'a();\nb();'),
        ('i++ / 2; // c\n', 'i++ / 2;\n'),
        ('x = (a) / 2\n', 'x = (a) / 2\n'),
        ('x = a.return / 2 // c\n', 'x = a.return / 2\n'),
        ('s.replace(/[/]+/g, "-") // c\n', 's.replace(/[/]+/g, "-")\n'),
        ('t = `${/re/.source}` // c\n', 't = `${/re/.source}`\n'),
        ("var s = 'a\\\n    b'; // c\n", "var s = 'a\\\n    b';\n"),
        ('o = { a: { b: `x ${ {c: 1}.c }` } }; // c\n', 'o = { a: { b: `x ${ {c: 1}.c }` } };\n'),
        ('\tvar a = 1;\t\n', 'var a = 1;\n'),
    ]
    for entrada, esperado in casos:
        obtido = compacta_js(entrada)
        assert obtido == esperado, (entrada, obtido)
    recusas = [
        "if (x) {}\n/'/.test(s)\n",
        'if (a) /x/.test(s) // c\n',
        'var o = {} / 2;\n',
        '<!-- x\n',
        'while (x --> 0) {}\n',
        "var s = 'abc\n",
        '/* aberto',
        '`abc',
        '#!/usr/bin/env node\nx()\n',
        'a();\r\nb();\n',
        'a();\u2028b();\n',
        'for (const r of /a/g.exec(s) || []) {} // c\n',
        'x = a \\u0062\n',
        'x = 1\x0b+ 2\n',
        "var t = `a ${ (function(){ if (s) /{/g.test(s) / 1; return 1 })()\n} b`;\nvar u = `\n    // fica\n`;\n",
        "var t = `a ${ {a:8} / 2 } b / c\nd`;\nvar u = `\n   // fica\n`;\n",
    ]
    for ruim in recusas:
        try:
            compacta_js(ruim)
        except JsIncerto:
            continue
        raise AssertionError('passou: %r' % ruim)
    node = shutil.which('node')
    conferidos = 0
    if node:
        with tempfile.TemporaryDirectory(prefix='previa-autoteste-') as d:
            for entrada, esperado in casos:
                for codigo in (entrada, esperado):
                    p = os.path.join(d, 'c.js')
                    with open(p, 'w', encoding='utf-8', newline='\n') as f:
                        f.write('(function(){' + codigo + '\n})();\n')
                    r = subprocess.run([node, '--check', p], capture_output=True, text=True, encoding='utf-8',
                                       errors='replace')
                    assert r.returncode == 0, (codigo, r.stderr)
                    conferidos += 1
    extra = (', %d node --check' % conferidos) if node else ' (sem Node: node --check não rodou)'
    # caractere fora do ASCII: AVISO com linha, coluna e o escape de cada linguagem; ASCII puro não avisa
    av = aviso_nao_ascii('a.css', 'a{x:y}\nbody .caf\u00e9{x:y}\n', js=False)
    assert av and 'linha 2, coluna 10' in av and '\\0000e9' in av and 'montar_tema.py' in av, av
    av = aviso_nao_ascii('a.js', 'var s = "\u00e7";\n', js=True)
    assert av and 'linha 1, coluna 10' in av and '\\u00e7' in av, av
    assert aviso_nao_ascii('a.css', 'a{content:"\\0000e9"}\n', js=False) is None
    print('autoteste ok: %d compactações, %d recusas%s, aviso de caractere fora do ASCII'
          % (len(casos), len(recusas), extra))


def aviso_nao_ascii(caminho, texto, js):
    """AVISO (não ERRO) para caractere fora do ASCII num --css ou --js: no favorito ele funciona, mas o arquivo
    que vai para o admin deve ir em ASCII (ajustes-visuais.md, 2.2), e o montar_tema.py recusa. Trocar depois da
    aprovação muda o sha e obriga a refazer a prévia e o "aprovado". Devolve o texto do aviso ou None."""
    achados, linha, col = [], 1, 0
    for ch in texto:
        if ch == '\n':
            linha += 1; col = 0; continue
        col += 1
        if ord(ch) > 127:
            achados.append((linha, col, ch))
    if not achados:
        return None
    l, c, ch = achados[0]
    cp = ord(ch)
    if js:
        dica = 'em string de JS, use %s; em comentário, escreva sem acento' % (
            '\\u%04x' % cp if cp <= 0xFFFF else '\\u{%x}' % cp)
    else:
        dica = 'em seletor ou em content, use o escape de 6 dígitos \\%06x; em comentário, escreva sem acento' % cp
    return ('%s tem %d caractere(s) fora do ASCII; o primeiro na linha %d, coluna %d: "%s" (U+%04X). No favorito '
            'funciona, mas o arquivo que vai para o admin vai em ASCII (ajustes-visuais.md, 2.2) e passa antes pelo '
            'montar_tema.py, que recusa isso: %s. Troque agora, antes de pedir a aprovação (trocar depois muda o '
            'sha, e a prévia e o "aprovado" têm de ser refeitos). Se o arquivo vai mesmo com UTF-8, passe '
            '--permitir-nao-ascii. A ferramenta de escrever arquivo pode ter trocado um escape digitado pelo '
            'caractere: gere a barra por código (chr(92)).' % (caminho, len(achados), l, c, ch, cp, dica))


def mil(n):
    return '{:,}'.format(n).replace(',', '.')


def node_aceita(node, codigo, pasta):
    """node --check de um código num arquivo temporário (apagado depois)."""
    fd, tmp = tempfile.mkstemp(prefix='.previa-conferindo-', suffix='.js', dir=pasta)
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(codigo.encode('utf-8'))
        r = subprocess.run([node, '--check', tmp], capture_output=True, text=True, encoding='utf-8',
                           errors='replace')
        return r.returncode == 0
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


def mesmo_arquivo(a, b):
    """Compara caminhos como o sistema compara (no Windows, sem diferença de maiúsculas e minúsculas)."""
    if os.path.normcase(os.path.realpath(a)) == os.path.normcase(os.path.realpath(b)):
        return True
    try:
        return os.path.samefile(a, b)  # o mesmo arquivo por outro nome (link, nome curto do Windows)
    except OSError:
        return False


def comeca_com(caminho, prefixo):
    with open(caminho, 'rb') as f:
        return f.read(len(prefixo.encode('utf-8'))) == prefixo.encode('utf-8')


def transporte_nosso(caminho):
    """True se o .gz.b64 decodifica para um .js legível que este script gravou."""
    try:
        with open(caminho, 'rb') as f:
            dados = base64.b64decode(f.read().strip(), validate=True)
        return gzip.decompress(dados).startswith(ASSINATURA.encode('utf-8'))
    except (OSError, ValueError, binascii.Error, EOFError, zlib.error):
        return False


def le_texto(caminho):
    try:
        with open(caminho, encoding='utf-8') as f:
            texto = f.read().replace('\r\n', '\n')
    except (OSError, UnicodeDecodeError) as e:
        sys.exit('ERRO: não consegui ler ' + caminho + ' (' + str(e) + '). Confira o caminho e salve em UTF-8 '
                 'sem BOM.')
    if texto.startswith('\ufeff'):
        sys.exit('ERRO: ' + caminho + ' começa com BOM (EF BB BF). Salve sem BOM: ele estragaria a primeira '
                 'regra na prévia e no arquivo publicado.')
    return texto


def sha256_arquivo(caminho):
    with open(caminho, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()


def tira_comentarios_css(css):
    """Troca comentários /* */ por espaços, respeitando strings (um "/*" dentro de url("...") não é comentário)."""
    out, i, n, q = [], 0, len(css), None
    while i < n:
        c = css[i]
        if q:
            out.append(c)
            if c == '\\' and i + 1 < n:
                out.append(css[i + 1]); i += 2; continue
            if c == q:
                q = None
            i += 1; continue
        if c in '"\'':
            q = c; out.append(c); i += 1; continue
        if css.startswith('/*', i):
            j = css.find('*/', i + 2)
            if j < 0:
                sys.exit('ERRO: comentário /* sem fechar no CSS')
            out.append(''.join('\n' if ch == '\n' else ' ' for ch in css[i:j + 2]))
            i = j + 2; continue
        out.append(c); i += 1
    if q:
        sys.exit('ERRO: string sem fechar no CSS')
    return ''.join(out)


def chaves_ok(css):
    s, d, q, i = css, 0, None, 0
    while i < len(s):
        ch = s[i]
        if q:
            if ch == '\\':
                i += 2; continue
            if ch == q:
                q = None
        elif ch in '"\'':
            q = ch
        elif ch == '{':
            d += 1
        elif ch == '}':
            d -= 1
            if d < 0:
                return False
        i += 1
    return d == 0


def compacta_css(css):
    """Junta as linhas sem colar palavras: a quebra some perto de { } ; , e vira espaço nos outros casos."""
    linhas = [l.strip() for l in tira_comentarios_css(css).split('\n') if l.strip()]
    out = ''
    for l in linhas:
        if out and not (out[-1] in '{};,' or l[0] in '{}'):
            out += ' '
        out += l
    return out


def main():
    for st in (sys.stdout, sys.stderr):  # sem isto, acentos saem trocados no Git Bash do Windows
        try:
            st.reconfigure(encoding='utf-8')
        except Exception:
            pass
    if '--autoteste' in sys.argv[1:]:
        autoteste()
        return
    ap = argparse.ArgumentParser(description='Gera um favorito de prévia (bookmarklet) de CSS/JS.')
    ap.add_argument('--css', action='append', default=[])
    ap.add_argument('--js', action='append', default=[])
    ap.add_argument('--desligar')
    ap.add_argument('--resize', action='store_true')
    ap.add_argument('--classe-body', action='append', default=[])
    ap.add_argument('--depois-de')
    ap.add_argument('--substitui')
    ap.add_argument('--fim-do-head', action='store_true')
    ap.add_argument('--id', default='previa-claude')
    ap.add_argument('--nome', default='Prévia')
    ap.add_argument('--sem-aviso', action='store_true')
    ap.add_argument('--transporte', action='store_true')
    ap.add_argument('--compactar-js', action='store_true')
    ap.add_argument('--permitir-nao-ascii', action='store_true')
    ap.add_argument('--saida', required=True)
    a = ap.parse_args()
    if not a.css and not a.js:
        sys.exit('ERRO: passe pelo menos um --css ou um --js')
    if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_-]*', a.id):
        sys.exit('ERRO: --id só com letras, números, - e _')
    if a.desligar is not None:
        if not a.js:
            sys.exit('ERRO: --desligar diz qual função do --js desliga a prévia; passe o --js junto.')
        if not re.fullmatch(r'[A-Za-z_$][A-Za-z0-9_$]*', a.desligar):
            sys.exit('ERRO: --desligar recebe o nome de uma função em window (letras, números, _ e $; sem ponto), '
                     'ex.: --desligar __temaDesligar')
        if a.desligar.startswith('__previa'):
            sys.exit('ERRO: nomes que começam com __previa são do próprio favorito (o __previaDesligar já é '
                     'adotado sem esta opção). Passe o nome da função que o JS do tema exporta.')
    if sum(1 for x in (a.depois_de, a.substitui, a.fim_do_head) if x) > 1:
        sys.exit('ERRO: use só uma de --depois-de, --substitui e --fim-do-head')
    alvo = a.substitui or a.depois_de
    if alvo is not None and alvo.startswith('style:') and not alvo[len('style:'):].strip():
        sys.exit('ERRO: depois de "style:" escreva um trecho do texto do <style> que só ele tenha '
                 '(ex.: "style:.minha-regra{"), copiado do <style> servido.')
    if alvo is not None and not alvo.strip():
        sys.exit('ERRO: o trecho de --depois-de/--substitui está vazio')
    if a.css and not (a.depois_de or a.substitui or a.fim_do_head):
        sys.exit('ERRO: diga onde o CSS entra na cascata: --depois-de "arquivo.css" (acrescenta a um arquivo), '
                 '--depois-de "style:trecho" (logo depois do <style> que tem esse trecho, como o do SCSS de '
                 'Personalização, que não tem id), --substitui "arquivo.css" (versão nova inteira de um arquivo) '
                 'ou --fim-do-head. No fim do <head> o estilo vem depois de todas as folhas do <head>; use só se '
                 'o arquivo publicado for ficar ali (numa família medida, a /dist, ali ele ganharia do SCSS de '
                 'Personalização; noutra, a modelo-1, os links do Custom, o Código dentro do <head>, são as '
                 'últimas folhas do <head>). Noutro lugar, a prévia mentiria. Confira a ordem: '
                 'medir-no-navegador.md, 1.')

    base, ext = os.path.splitext(a.saida)
    if ext.lower() != '.txt':
        sys.exit('ERRO: --saida tem de terminar em .txt (o código legível vai para o mesmo nome com .js).')
    legivel = base + '.js'
    transporte = base + '.gz.b64'
    pasta = os.path.dirname(os.path.abspath(legivel))
    if not os.path.isdir(pasta):
        sys.exit('ERRO: a pasta de --saida não existe: ' + pasta)
    entradas = a.css + a.js
    destinos = [a.saida, legivel] + ([transporte] if a.transporte else [])
    for destino in destinos:
        for entrada in entradas:
            if mesmo_arquivo(destino, entrada):
                sys.exit('ERRO: gravar %s apagaria o arquivo de entrada %s (o que vai para o admin). Use outro '
                         'nome em --saida, por exemplo previa-%s' % (destino, entrada, os.path.basename(a.saida)))
    for destino, comeco in ((legivel, ASSINATURA), (a.saida, 'javascript:')):
        if os.path.exists(destino) and not comeca_com(destino, comeco):
            sys.exit('ERRO: %s já existe e não foi gerado por este script. Use outro nome em --saida, '
                     'por exemplo previa-%s' % (destino, os.path.basename(a.saida)))
    if a.transporte and os.path.exists(transporte) and not transporte_nosso(transporte):
        sys.exit('ERRO: %s já existe e não foi gerado por este script (não decodifica para um favorito de '
                 'prévia). Use outro nome em --saida, por exemplo previa-%s' % (transporte, os.path.basename(a.saida)))

    css, avisos = '', []
    for arq in a.css:
        parte = le_texto(arq)
        if not chaves_ok(tira_comentarios_css(parte)):
            sys.exit('ERRO: chaves { } desbalanceadas em ' + arq)
        if not a.permitir_nao_ascii:
            av = aviso_nao_ascii(arq, parte, js=False)
            if av:
                avisos.append(av)
        css += compacta_css(parte)
    for c in a.classe_body:
        if not re.fullmatch(r'-?[A-Za-z_][A-Za-z0-9_-]*', c):
            sys.exit('ERRO: --classe-body não parece um nome de classe: ' + c)
    # as quebras de linha viram %0A no favorito e voltam a ser quebras quando ele roda, então // funciona
    jss = [(arq, le_texto(arq)) for arq in a.js]
    if not a.permitir_nao_ascii:
        for arq, src in jss:
            av = aviso_nao_ascii(arq, src, js=True)
            if av:
                avisos.append(av)
    shas = [(arq, sha256_arquivo(arq)) for arq in entradas]  # dos bytes do arquivo, como o histórico anota
    compactados = []
    if a.compactar_js and not jss:
        avisos.append('--compactar-js só mexe nos --js, e não há nenhum: nada foi compactado (o CSS já entra sem '
                      'comentários).')
    if a.compactar_js and jss:
        node = shutil.which('node')
        if not node:
            avisos.append('não compactei o JS: sem Node não há como conferir a versão compactada (node --check). '
                          'O favorito leva o JS como está.')
        else:
            novos = []
            for arq, src in jss:
                try:
                    novo = compacta_js(src)
                except JsIncerto as e:
                    avisos.append('não compactei %s: %s. Ele vai como está no favorito.' % (arq, e))
                    novos.append((arq, src)); continue
                if not node_aceita(node, '(function(){' + novo + '\n})();\n', pasta):
                    avisos.append('não compactei %s: a versão compactada não passou no node --check. Ele vai como '
                                  'está no favorito.' % arq)
                    novos.append((arq, src)); continue
                compactados.append((arq, len(src), len(novo), len(urllib.parse.quote(src, safe=SAFE)),
                                    len(urllib.parse.quote(novo, safe=SAFE))))
                novos.append((arq, novo))
            jss = novos

    # Acha o alvo da posição. "#id" acha <style>/<link> pelo id (ex.: o CSS da página do construtor);
    # "style:TRECHO" acha o <style> cujo texto contém o trecho (fora os do SVG e os de prévias); outro texto acha
    # os <link rel=stylesheet> cujo href contém o texto. Se casar com mais de um (hrefs diferentes, ou mais de um
    # <style>), avisa e não liga: ficar com um deles em silêncio mostraria outra cascata. O mesmo arquivo ligado
    # duas vezes conta como um (o <style> entra depois da última cópia; --substitui desliga todas).
    achar = ("var ALVO=" + json.dumps(alvo or '') + ",l=null,ms=[],hs=[],EST=ALVO.indexOf('style:')===0,"
             "TR=EST?ALVO.slice(6):'';"
             "if(EST){var st=d.querySelectorAll('style');for(var k=0;k<st.length;k++){var e=st[k];"
             "if(e.id===ID||e.hasAttribute('data-previa')||(e.namespaceURI&&"
             "e.namespaceURI!=='http://www.w3.org/1999/xhtml'))continue;"
             "if((e.textContent||'').indexOf(TR)>-1){l=e;ms.push(e);hs.push(k);}}}"
             "else if(ALVO.charAt(0)==='#'){l=d.getElementById(ALVO.slice(1));if(l){ms.push(l);hs.push(ALVO);}}"
             "else{var ls=d.querySelectorAll('link[rel=\"stylesheet\"]');for(var k=0;k<ls.length;k++){"
             "var h=ls[k].getAttribute('href')||'';if(h.indexOf(ALVO)>-1){l=ls[k];ms.push(l);"
             "if(hs.indexOf(h)<0)hs.push(h);}}}"
             "var QUAL=EST?'um <style> com o trecho \"'+(TR.length>60?TR.slice(0,60)+'\\u2026':TR)+'\"':ALVO;"
             "if(hs.length>1){alert(NOME+': '+hs.length+(EST?' blocos <style> desta página têm o trecho \"'"
             "+(TR.length>60?TR.slice(0,60)+'\\u2026':TR)+'\".':' arquivos CSS desta página têm \"'+ALVO+'\" no "
             "endereço.')+' Use um trecho maior, que só um deles tenha. A prévia não foi ligada.');return;}")
    aviso = '' if a.sem_aviso else (
        "var av=d.createElement('div');av.setAttribute('data-previa-aviso',ID);"
        "av.textContent=NOME+' ligada \\u2014 clique no favorito de novo para desligar';"
        "av.style.cssText='position:fixed;left:8px;bottom:8px;z-index:2147483647;background:#111;color:#fff;"
        "font:600 12px/1.3 system-ui,sans-serif;padding:6px 10px;border-radius:6px;border:1px solid #444;"
        "pointer-events:none;opacity:.92;box-sizing:border-box;max-width:calc(100vw - 16px)';"
        "d.body.appendChild(av);")
    # o teste das classes roda ANTES do --js: classe que o próprio --js põe não entra aqui
    classes = ("var CS=" + json.dumps(a.classe_body) + ";for(var q=0;q<CS.length;q++){"
               "if(!d.body.classList.contains(CS[q])){alert(NOME+': '+(CS[q]==='isMobile'?'esta página não é a "
               "versão de celular (falta a classe isMobile no <body>). No computador, use o modo celular do Chrome "
               "(F12, Ctrl+Shift+M, escolher um celular, F5) ou abra no celular.':'esta página não tem a classe '"
               "+CS[q]+' no <body>.')+' A prévia não foi ligada.');return;}}" if a.classe_body else '')
    resize = "try{window.dispatchEvent(new Event('resize'));}catch(e){}" if a.resize else ''
    # um __previaDesligar solto (de antes, ou de um JS que deu erro) nunca é adotado por esta nem por outra prévia
    solta = ("try{delete window.__previaDesligar;}catch(e){}"
             "if(typeof window.__previaDesligar!=='undefined'){try{window.__previaDesligar=undefined;}catch(e){}}")
    if jss:
        # cada --js na sua função e no seu try/catch; os __previaDesligar que eles definirem são guardados em ordem
        # e chamados do último para o primeiro. Com --desligar, a função window[FN] é adotada só se for NOVA.
        rodar_js = ("var P_FS=[],P_ER=0,P_FN=" + json.dumps(a.desligar) + ",P_AN,P_EX=false;"
                    "if(P_FN){try{P_EX=(P_FN in window);P_AN=window[P_FN];}catch(e){}}")
        for arq, src in jss:
            rodar_js += (solta + "try{(function(){" + src + "\n})();}catch(e){P_ER=1;console.log(NOME+': erro no "
                         "JS da prévia ('+" + json.dumps(os.path.basename(arq)) + "+'): '+e);}"
                         "var g=window.__previaDesligar;if(typeof g==='function'){P_FS.push(g);}")
        rodar_js += (solta
                     + "if(P_FS.length===1){window['__previaDesligar_'+ID]=P_FS[0];}else if(P_FS.length>1){"
                     "window['__previaDesligar_'+ID]=function(){for(var z=P_FS.length-1;z>=0;z--){"
                     "try{P_FS[z]();}catch(e){}}};}"
                     "if(P_FN){var P_NV;try{P_NV=window[P_FN];}catch(e){}if(typeof P_NV==='function'&&P_NV!==P_AN){"
                     "window['__previaDesligarFn_'+ID]={f:P_NV,nome:P_FN,antes:P_AN,existia:P_EX};}}"
                     "if(P_ER){alert(NOME+': o JS da prévia deu erro (veja o console). Para voltar ao normal, "
                     "recarregue a página.');}")
    else:
        rodar_js = ''
    codigo = (
        ASSINATURA + json.dumps(a.id) + ",NOME=" + json.dumps(a.nome) + ";"
        "var s=d.getElementById(ID);"
        "if(s){s.parentNode.removeChild(s);"
        "var avs=d.querySelectorAll('[data-previa-aviso=\"'+ID+'\"]');for(var i=0;i<avs.length;i++)avs[i].remove();"
        # religa o que o --substitui desligou: um <link> pela folha dele (e pelo elemento, se um favorito de
        # uma versão anterior o desligou por ali); um <style> pelo elemento, que é a folha dele
        "var des=d.querySelectorAll('[data-previa-desligado=\"'+ID+'\"]');for(var j=0;j<des.length;j++){"
        "var dl=des[j];if(String(dl.tagName).toUpperCase()==='LINK'){if(dl.disabled){dl.disabled=false;}"
        "if(dl.sheet){dl.sheet.disabled=false;}}else{dl.disabled=false;}"
        "dl.removeAttribute('data-previa-desligado');}"
        "var f=window['__previaDesligar_'+ID];if(typeof f==='function'){try{f();}catch(e){}}"
        "try{delete window['__previaDesligar_'+ID];}catch(e){}"
        # a função adotada pelo --desligar: chama, e devolve a window[nome] o que havia antes da prévia
        "var o=window['__previaDesligarFn_'+ID];if(o&&typeof o.f==='function'){try{o.f();}catch(e){}"
        "try{if(window[o.nome]===o.f){if(o.existia){window[o.nome]=o.antes;}"
        "else if(!(delete window[o.nome])){window[o.nome]=undefined;}}}catch(e){}}"
        "try{delete window['__previaDesligarFn_'+ID];}catch(e){}"
        + resize + "return;}"
        + classes
        + "s=d.createElement('style');s.id=ID;s.setAttribute('data-previa',ID);s.textContent=" + json.dumps(css) + ";"
        # --substitui: um <link> é desligado pela folha dele (sheet.disabled), sem tocar no elemento. Mexer no
        # disabled do elemento fazia o navegador recarregar a folha, e logo depois de desligar a prévia o .sheet
        # ainda era null (medido: 287 diferenças na hora, 0 depois de 2 s). Um <link> ainda sem folha (carregando,
        # ou que não carregou) não tem o que desligar: avisa e não liga, antes de mexer em qualquer coisa.
        + (achar + "if(!l){alert(NOME+': não achei '+QUAL+' na página. A prévia não foi ligada.');return;}"
           "for(var m=0;m<ms.length;m++){if(String(ms[m].tagName).toUpperCase()==='LINK'&&!ms[m].sheet){"
           "alert(NOME+': o arquivo '+(ms[m].getAttribute('href')||'')+' ainda não carregou nesta página. Espere a "
           "página terminar de carregar e clique de novo. A prévia não foi ligada.');return;}}"
           "for(var m=0;m<ms.length;m++){var ql=ms[m];if(String(ql.tagName).toUpperCase()==='LINK'){"
           "ql.sheet.disabled=true;}else{ql.disabled=true;}ql.setAttribute('data-previa-desligado',ID);}"
           "l.parentNode.insertBefore(s,l.nextSibling);"
           if a.substitui else
           achar + "if(!l){alert(NOME+': não achei '+QUAL+' na página. A prévia não foi ligada (em outro lugar ela "
           "mostraria outra cascata).');return;}l.parentNode.insertBefore(s,l.nextSibling);"
           if a.depois_de else "d.head.appendChild(s);")
        + aviso
        + rodar_js
        + resize
        + "})()"
    )
    fav = 'javascript:' + urllib.parse.quote(codigo, safe=SAFE)
    if urllib.parse.unquote(fav[len('javascript:'):]) != codigo:
        sys.exit('ERRO: o favorito não decodifica de volta para o mesmo código')
    bytes_legivel = (codigo + '\n').encode('utf-8')
    b64 = base64.b64encode(gzip.compress(bytes_legivel, 9, mtime=0)).decode('ascii') if a.transporte else ''
    if a.transporte and gzip.decompress(base64.b64decode(b64)) != bytes_legivel:
        sys.exit('ERRO: o transporte não decodifica de volta para o mesmo código')

    # Confere num arquivo temporário e só então grava as saídas: com ERRO, nada muda na pasta.
    fd, tmp = tempfile.mkstemp(prefix='.previa-conferindo-', suffix='.js', dir=pasta)
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(bytes_legivel)
        if shutil.which('node'):
            r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True, encoding='utf-8',
                               errors='replace')
            if r.returncode != 0:
                sys.exit('ERRO: o código gerado não é JavaScript válido (nada foi gravado):\n'
                         + r.stderr.replace(tmp, legivel))
        os.replace(tmp, legivel)
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)
    with open(a.saida, 'w', encoding='utf-8', newline='\n') as f:
        f.write(fav + '\n')
    if a.transporte:
        with open(transporte, 'w', encoding='ascii', newline='\n') as f:
            f.write(b64 + '\n')
    js_total = sum(len(src) for _, src in jss)
    print('ok: %s (%d caracteres) e %s | CSS %d caracteres%s' % (
        a.saida, len(fav), legivel, len(css), (' | JS %d caracteres' % js_total) if jss else ''))
    for arq, h in shas:
        print('  sha256 %s  %s' % (h, arq))
    if a.transporte:
        print('  transporte: %s (%d caracteres de base64) | sha256 do código legível %s' % (
            transporte, len(b64), hashlib.sha256(bytes_legivel).hexdigest()))
    for arq, antes, depois, fav_antes, fav_depois in compactados:
        print('  JS compactado só no favorito: %s %s -> %s caracteres (no favorito, %s -> %s); o arquivo publicado '
              'continua com o sha impresso acima' % (arq, mil(antes), mil(depois), mil(fav_antes), mil(fav_depois)))
    if len(fav) > LIMITE_MEDIDO:
        # de onde vêm os caracteres: o CSS vai como string JSON, cada JS vai cru; tudo passa pelo quote do favorito
        partes = ['CSS %s' % mil(len(urllib.parse.quote(json.dumps(css), safe=SAFE)))] if css else []
        conta = len(urllib.parse.quote(json.dumps(css), safe=SAFE)) if css else 0
        ja = {x[0] for x in compactados}
        for arq, src in jss:
            q = len(urllib.parse.quote(src, safe=SAFE))
            conta += q
            partes.append('JS %s %s (%s no %s, %sx%s)' % (
                os.path.basename(arq), mil(q), mil(len(src)), 'texto compactado' if arq in ja else 'arquivo',
                ('%.1f' % (q / max(len(src), 1))).replace('.', ','), '' if arq in ja else ', sem --compactar-js'))
        partes.append('código fixo do favorito %s' % mil(len(fav) - conta))
        dica = ''
        if any(arq not in ja for arq, _ in jss):
            dica = (' O recuo e as quebras do JS custam ~1,7x no favorito (cada espaço e cada quebra de linha viram '
                    '3 caracteres); --compactar-js tira comentários e recuo do JS só no favorito.')
        if css:
            dica += (' O CSS já entra sem comentários e com as linhas juntas: o que sobra é tirar o que não é '
                     'desta prévia (seções de outra mudança).')
        avisos.append('o favorito tem %s caracteres; o maior medido funcionando no gerenciador de favoritos '
                      'tinha ~55 mil. Acima disso a instalação não foi medida: teste antes de mandar (ou peça à '
                      'pessoa para confirmar o selo "Prévia ligada"); se não instalar, os prints são a prévia '
                      '(previa.md). De onde vêm: %s.%s' % (mil(len(fav)), '; '.join(partes), dica))
    sys.stdout.flush()
    for av in avisos:
        print('AVISO: ' + av, file=sys.stderr)


if __name__ == '__main__':
    main()
