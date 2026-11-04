"""Monta e confere um arquivo CSS de tema ou de ajustes antes da prévia e da gravação.

Dois modos:
  - versão nova de um arquivo que já está no ar (--base): a versão no ar, byte a byte, mais as seções novas no
    fim. O diff é só o que você acrescentou, e desfazer é colar a anterior.
  - arquivo novo (sem --base): as seções, na ordem dada, separadas por uma linha em branco.

Uso (Python 3, só a biblioteca padrão):
    python -I scripts/montar_tema.py --base seu-tema-v3.css --secao secao-selo.css --secao secao-menu.css \
        --saida seu-tema-v4.css
    python -I scripts/montar_tema.py --secao base.css --secao cabecalho.css --classe sua-classe \
        --js sua-classe.js --saida sua-classe-v1.css
    python -I scripts/montar_tema.py --secao base.css --secao cabecalho.css --classe sua-classe \
        --saida sua-classe-v1.css --publicar sua-classe-v1-publicar.css

Opções:
  --secao ARQ           Seção a acrescentar (obrigatória; pode repetir; entra na ordem dada). Cada seção tem de
                        estar completa: comentários e chaves abrem e fecham dentro dela.
  --base ARQ            Cópia exata do arquivo no ar (o backup, com fim de linha LF). Sem ela, o arquivo é novo.
  --sha-base HEX        (com --base) O sha256 anotado no backup do arquivo no ar: a base tem de bater, nos bytes
                        ou normalizada (CRLF->LF, sem quebras no fim, como o admin guarda).
  --classe C            Modo de época: todo seletor das seções começa por body.C (ou html... body.C), com a
                        classe logo depois de "body" (body.C.isMobile, e não body.isMobile.C). Assim, sem a classe
                        no <body>, o arquivo não muda nada.
  --permitir REGEX      Exceção à regra da classe (pode repetir): um seletor ou uma @regra cujo texto casa com
                        REGEX (re.search; ancore com ^ e $) passa e aparece na lista de exceções usadas.
                        @keyframes cujo nome começa pela classe passa sem exceção.
  --js ARQ              O JS do tema (opcional; pode repetir). Não entra no CSS: só é conferido (BOM, CR, ASCII e
                        node --check, se houver Node) e tem o sha impresso.
  --permitir-nao-ascii  Aceita caracteres fora do ASCII nas seções e no --js.
  --sobrescrever        Deixa gravar por cima de uma --saida (ou --publicar) que já existe.
  --saida ARQ           O arquivo montado, a "versão de trabalho" (com os comentários). Nunca pode ser uma das
                        entradas.
  --publicar ARQ        (opcional) Grava também a "versão de publicar": a mesma coisa sem os comentários /* */ das
                        seções, sem espaços no fim das linhas e sem linhas em branco dentro das seções (numa loja,
                        ~23% do arquivo de trabalho era comentário, e cada byte vai para todo visitante). Sem
                        --base, ela começa por uma linha ASCII que diz de qual versão de trabalho veio (nome, sha256
                        de 12 dígitos, data; por causa da data, montar de novo noutro dia muda o sha: monte uma
                        vez, gere a prévia dela e grave essa mesma). Com --base, é a base byte a byte (os
                        comentários do que já está no ar ficam) mais as seções sem comentários. É dela que sai a
                        gravação (e, num arquivo novo, a prévia; com --base, a prévia da pessoa é a de acréscimo,
                        abaixo); o --js não é mexido (é pequeno, e os comentários dele guiam quem edita o bloco
                        de configuração no admin).
                        Cada seção nova guarda, na versão de publicar, uma linha ASCII com o número e o título do
                        primeiro cabeçalho dela ("/* 18. Titulo ate 60 caracteres */"): o arquivo no ar continua
                        numerado, e a próxima rodada lê o último número nele (medido: sem essa linha, a versão
                        publicada "terminava" na seção anterior, e a seção seguinte ganhou um número repetido).
                        Recusa (ERRO) um comentário colado entre dois nomes (".a/**/.b", "1px/**/2px": sem ele, os
                        dois se juntariam) ou logo depois de um escape como \\e9 (sem ele, o espaço seguinte viraria
                        parte do escape). Confere que a lista de regras (seletores e declarações, espaços
                        normalizados) é a mesma da versão de trabalho.
                        Com o tema em duas páginas (a comentada guardada no admin, ajustes-visuais.md 5.2), não
                        use --publicar: monte a comentada nova com --base <a comentada> e gere a do site com o
                        enxugar_tema.py, que tira também os comentários da base.
  --autoteste           Roda os testes internos (corte de seletores, leitor de CSS, classe, versão de publicar,
                        números de seção) e sai.

Conferências. Qualquer uma que falhe sai com ERRO e não grava nada (uma saída anterior fica como estava):
  - toda entrada é UTF-8, sem BOM; base e seções sem CR (normalize para LF antes);
  - seções e --js só com ASCII, salvo --permitir-nao-ascii (em seletor e em content, use o escape de 6 dígitos,
    como \\0000e9 para "é"; em string de JS, \\u00e9; em comentário, escreva sem acento). Na base, só AVISO:
    o que já está no ar fica como está;
  - comentários e strings fechados, chaves equilibradas fora de comentários e strings (na base também: um
    comentário ou uma chave aberta no fim da base engoliria as seções);
  - nas seções, CSS plano: sem regra dentro de regra, sem SCSS ($variável, @include, @mixin, #{}), sem
    comentário //, sem texto solto fora de regra, sem vírgula sobrando numa lista de seletores;
  - os seletores são lidos por um leitor que pula comentários e strings, entra em @media, @supports, @container
    e @layer, pula os passos de @keyframes, e corta as listas só nas vírgulas fora de (), [] e strings
    (":is(p, td, ul:not(.links) > li)" e '[title="a,b"]' contam como um seletor);
  - com --classe: seletor sem a classe é ERRO (ou exceção com --permitir); @import, @charset e regras que pintam
    :root, html, body ou * sem a classe são ERRO sempre (agiriam sem a classe); @font-face, @keyframes de nome
    que não começa pela classe e outras @regras são ERRO salvo --permitir;
  - sem --classe (modo permanente): AVISO para seletores que não começam por aparelho, tipo de página ou região
    (body.isMobile/notMobile, body.page-*, #area-body, .inner-body >, footer): releia cada um; @import fora do
    começo de um arquivo novo é ERRO (o navegador ignora);
  - a saída nunca é uma entrada (no Windows, sem diferença de maiúsculas) e só sobrescreve com --sobrescrever;
  - com --publicar: as mesmas conferências (ASCII, chaves, classe) também na versão de publicar, e a mesma lista de
    regras nas duas; o --publicar não pode ser uma entrada nem a --saida.

Números de seção (só AVISO; o arquivo é gravado). Cabeçalho de seção é um comentário no começo da linha com
decoração opcional (=, -, #, *), a palavra Seção opcional e um número (18, 8.8, 8.2b, 12a) seguido de ".", ")",
":" ou espaço; sem decoração nem a palavra, o número vem com ".", ")" ou ":" ("/* 2 colunas */" não conta).
Sub-números são outros números (8 e 8.8 não se repetem). AVISO quando:
  - uma seção nova repete um número da base ou de outra seção nova (com a linha de cada um, o maior número da
    base e a próxima livre);
  - com --base, uma seção nova não tem cabeçalho numerado;
  - uma --secao tem cabeçalhos de mais de uma seção (18 e 19; 18 e 18.1 são uma só): na versão de publicar fica
    só a linha do primeiro;
  - com --base, há regras depois do comentário de fim ("/* ==== fim 17 ==== */") da última seção numerada: uma
    versão publicada perdeu o cabeçalho de uma seção, e o último número tem de vir do histórico do perfil.
Números que já se repetiam na base saem só como nota.

Imprime: bytes e sha256 da saída, o sha256 normalizado (para comparar com o texto relido do admin), o tamanho e
o sha de cada entrada, quantos seletores foram conferidos, as exceções usadas, os números de seção (o maior da
base e a próxima livre) e o comando do gerar_previa.py. Com --base, são dois comandos: (1) para a pessoa, só as
seções novas com --depois-de o arquivo no ar (favorito pequeno); (2) para você, o arquivo inteiro com
--substitui, para conferir que os dois dão 0 diferenças. Com --publicar, o mesmo para a versão de publicar,
quanto ela é menor, e o arquivo inteiro da prévia é ela: a gravação usa a versão de publicar; anote no histórico
o sha das seções, o da versão de publicar e o da versão de trabalho. Sai com 0 (ok) ou 1 (ERRO).
"""
import argparse
import datetime
import hashlib
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata

GRUPOS = {'media', 'supports', 'container', 'layer', 'starting-style'}  # @regras que contêm regras de estilo
SCSS = re.compile(r'(?<![\w-])\$[A-Za-z_][\w-]*'
                  r'|@(?:mixin|include|extend|use|forward|if|else|each|for|while|function|return)\b'
                  r'|#\{')
ANCORA = re.compile(  # modo permanente: começos que dizem onde a regra vale (plataforma, nas duas famílias medidas)
    r'^(?:html\S*\s+)?(?:'
    r'(?:body)?\.(?:isMobile|notMobile|page-[\w-]+)(?![\w-])'
    r'|(?:body\S*\s+)?#area-body(?![\w-])'
    r'|(?:body\S*\s+)?\.inner-body\S*\s*>'
    r'|(?:body\S*\s+)?footer(?![\w-])'
    r')')
RAIZ = re.compile(r'^(?:html\S*\s+)?(?::root|html|body|\*)(?:[.#:\[][^\s>+~]*)?$')


class Problema(Exception):
    pass


def erro(msg):
    sys.exit('ERRO: ' + msg)


def linha_de(texto, i):
    return texto.count('\n', 0, i) + 1


def mesmo_arquivo(a, b):
    """Compara caminhos como o sistema compara (no Windows, sem diferença de maiúsculas e minúsculas)."""
    if os.path.normcase(os.path.realpath(a)) == os.path.normcase(os.path.realpath(b)):
        return True
    try:
        return os.path.samefile(a, b)
    except OSError:
        return False


def normalizado(b):
    return b.replace(b'\r\n', b'\n').rstrip(b'\n')


def sha(b):
    return hashlib.sha256(b).hexdigest()


def ler(caminho, papel, cr_proibido=True):
    try:
        with open(caminho, 'rb') as f:
            b = f.read()
    except OSError as e:
        erro('não consegui ler %s %s (%s)' % (papel, caminho, e))
    if b.startswith(b'\xef\xbb\xbf'):
        erro('%s começa com BOM (EF BB BF). Salve sem BOM: ele estragaria a primeira regra.' % caminho)
    try:
        t = b.decode('utf-8')
    except UnicodeDecodeError as e:
        erro('%s não é UTF-8 (byte inválido na linha %d). Salve em UTF-8 sem BOM.'
             % (caminho, b[:e.start].count(b'\n') + 1))
    if cr_proibido and '\r' in t:
        erro('%s tem CR (fim de linha do Windows) na linha %d. Normalize para LF antes (o admin devolve o texto '
             'com CRLF; a base é o backup normalizado), para a montagem ser byte a byte.'
             % (caminho, linha_de(t, t.index('\r'))))
    return b, t


def fora_do_ascii(texto):
    out, linha, col = [], 1, 0
    for ch in texto:
        if ch == '\n':
            linha += 1; col = 0; continue
        col += 1
        if ord(ch) > 127:
            out.append((linha, col, ch))
    return out


def recusa_nao_ascii(caminho, texto, js=False):
    achados = fora_do_ascii(texto)
    if not achados:
        return
    l, c, ch = achados[0]
    cp = ord(ch)
    if js:
        esc = '\\u%04x' % cp if cp <= 0xFFFF else '\\u{%x}' % cp
        dica = 'em string de JS, use %s; em comentário, escreva sem acento' % esc
    else:
        dica = ('em seletor ou em content, use o escape de 6 dígitos %s (ajustes-visuais.md, 2.2); em comentário, '
                'escreva sem acento' % ('\\%06x' % cp))
    erro('%s tem %d caractere(s) fora do ASCII; o primeiro na linha %d, coluna %d: "%s" (U+%04X). %s. Se o arquivo '
         'vai mesmo com UTF-8, passe --permitir-nao-ascii.' % (caminho, len(achados), l, c, ch, cp, dica))


def sem_comentarios(texto):
    """Troca /* */ por espaços (as quebras de linha ficam, para o número da linha continuar certo), respeitando
    strings. Levanta Problema se um comentário não fecha."""
    out, i, n, q = [], 0, len(texto), None
    while i < n:
        c = texto[i]
        if q:
            out.append(c)
            if c == '\\' and i + 1 < n:
                out.append(texto[i + 1]); i += 2; continue
            if c == q or c == '\n':  # em CSS a string termina na quebra de linha (o leitor acusa)
                q = None
            i += 1; continue
        if c in '"\'':
            q = c; out.append(c); i += 1; continue
        if texto.startswith('/*', i):
            j = texto.find('*/', i + 2)
            if j < 0:
                raise Problema('linha %d: comentário /* sem fechar (tudo o que vem depois vira comentário)'
                               % linha_de(texto, i))
            out.append(''.join('\n' if ch == '\n' else ' ' for ch in texto[i:j + 2]))
            i = j + 2; continue
        out.append(c); i += 1
    return ''.join(out)


def mascara_strings(texto):
    """O mesmo texto com o miolo das strings trocado por espaços (para procurar sintaxe fora delas)."""
    out, i, n, q = [], 0, len(texto), None
    while i < n:
        c = texto[i]
        if q:
            if c == '\\' and i + 1 < n:
                out.append('  '); i += 2; continue
            if c == q or c == '\n':
                q = None; out.append(c)
            else:
                out.append(' ')
            i += 1; continue
        if c in '"\'':
            q = c
        out.append(c); i += 1
    return ''.join(out)


def estrutura(texto):
    """Para a base e para o arquivo inteiro: comentários fechados e chaves equilibradas fora de comentários e de
    strings. Devolve o problema em texto, ou None."""
    try:
        s = mascara_strings(sem_comentarios(texto))
    except Problema as e:
        return str(e)
    prof = 0
    for i, c in enumerate(s):
        if c == '{':
            prof += 1
        elif c == '}':
            prof -= 1
            if prof < 0:
                return 'linha %d: chave } sobrando' % linha_de(s, i)
    if prof:
        return 'fica(m) %d chave(s) { aberta(s) no fim' % prof
    return None


def partes_seletor(sel):
    """Corta uma lista de seletores nas vírgulas de fora de (), [] e strings. Devolve os seletores com os espaços
    normalizados. Levanta Problema se sobrar uma parte vazia (o navegador descarta a regra inteira)."""
    partes, atual, prof, q, i, n = [], [], 0, None, 0, len(sel)
    while i < n:
        c = sel[i]
        if q:
            atual.append(c)
            if c == '\\' and i + 1 < n:
                atual.append(sel[i + 1]); i += 2; continue
            if c == q:
                q = None
        elif c == '\\' and i + 1 < n:
            atual.append(c); atual.append(sel[i + 1]); i += 2; continue
        elif c in '"\'':
            q = c; atual.append(c)
        elif c in '([':
            prof += 1; atual.append(c)
        elif c in ')]':
            prof -= 1; atual.append(c)
        elif c == ',' and prof == 0:
            partes.append(''.join(atual)); atual = []
        else:
            atual.append(c)
        i += 1
    partes.append(''.join(atual))
    partes = [' '.join(p.split()) for p in partes]
    if any(not p for p in partes):
        raise Problema('vírgula sobrando na lista de seletores "%s": o navegador descarta a regra inteira' % sel[:80])
    return partes


class Leitor:
    """Lê um CSS sem comentários e anota os itens: ('seletor', texto, linha), ('grupo', prelúdio, linha) para
    @media e parecidos, ('at', prelúdio, linha) para @regras com bloco (@font-face, @keyframes...),
    ('instrucao', texto, linha) para @import, @charset e outras com ';', e ('aninhado', prelúdio, linha) para
    regra dentro de regra."""

    def __init__(self, texto):
        self.s, self.n, self.itens = texto, len(texto), []

    def linha(self, i):
        return linha_de(self.s, i)

    def pula_string(self, i):
        q, j = self.s[i], i + 1
        while j < self.n:
            c = self.s[j]
            if c == '\\':
                j += 2; continue
            if c == q:
                return j + 1
            if c == '\n':
                break
            j += 1
        raise Problema('linha %d: string sem fechar (aspas abertas)' % self.linha(i))

    def prelude(self, i):
        """De i até '{', ';' ou '}' fora de strings, () e []. Devolve (texto, j, terminador), j no terminador."""
        prof, j = 0, i
        while j < self.n:
            c = self.s[j]
            if c in '"\'':
                j = self.pula_string(j); continue
            if c == '\\':
                j += 2; continue
            if c in '([':
                prof += 1
            elif c in ')]':
                prof -= 1
                if prof < 0:
                    raise Problema('linha %d: "%s" sobrando' % (self.linha(j), c))
            elif c in '{;}':
                if prof > 0:
                    raise Problema('linha %d: parêntese ou colchete aberto antes de "%s"' % (self.linha(j), c))
                return self.s[i:j], j, c
            j += 1
        return self.s[i:j], j, ''

    def fecha_bloco(self, i, ini, prelud, marcar_aninhado):
        """i logo depois do '{'. Devolve o índice logo depois do '}' que fecha o bloco."""
        prof, j, viu = 0, i, False
        while j < self.n:
            c = self.s[j]
            if c in '"\'':
                j = self.pula_string(j); continue
            if c == '\\':
                j += 2; continue
            if c == '{':
                prof += 1
                if marcar_aninhado and not viu:
                    viu = True
                    self.itens.append(('aninhado', prelud, self.linha(j)))
            elif c == '}':
                if prof == 0:
                    return j + 1
                prof -= 1
            j += 1
        raise Problema('linha %d: a chave { de "%s" não fecha' % (self.linha(ini), prelud[:60]))

    def lista(self, i=0, dono=None, ini=0):
        while True:
            while i < self.n and self.s[i].isspace():
                i += 1
            if i >= self.n:
                if dono is not None:
                    raise Problema('linha %d: a chave { de "%s" não fecha' % (self.linha(ini), dono[:60]))
                return i
            if self.s[i] == '}':
                if dono is None:
                    raise Problema('linha %d: chave } sobrando' % self.linha(i))
                return i + 1
            texto, j, term = self.prelude(i)
            pre, lin = ' '.join(texto.split()), self.linha(i)
            if term == ';' and pre.startswith('@'):
                self.itens.append(('instrucao', pre, lin))
                i = j + 1; continue
            if term in (';', '}', ''):
                raise Problema('linha %d: texto solto fora de regra: "%s" (fora das chaves, ele estraga a regra '
                               'seguinte)' % (lin, pre[:60]))
            if pre.startswith('@'):
                m = re.match(r'@([-\w]+)', pre)
                nome = re.sub(r'^-[a-z]+-', '', (m.group(1) if m else '').lower())
                if nome in GRUPOS:
                    self.itens.append(('grupo', pre, lin))
                    i = self.lista(j + 1, pre, i); continue
                self.itens.append(('at', pre, lin))
                i = self.fecha_bloco(j + 1, i, pre, False); continue
            if not pre:
                raise Problema('linha %d: { sem seletor' % lin)
            for sel in partes_seletor(pre):
                self.itens.append(('seletor', sel, lin))
            i = self.fecha_bloco(j + 1, i, pre, True)


def ler_css(texto):
    """Sem comentários, confere a sintaxe e devolve os itens do Leitor. Levanta Problema."""
    limpo = sem_comentarios(texto)
    fora = mascara_strings(limpo)
    m = SCSS.search(fora)
    if m:
        raise Problema('linha %d: "%s" é SCSS, e o arquivo é servido cru: escreva CSS puro (ajustes-visuais.md, 2.2)'
                       % (linha_de(fora, m.start()), m.group(0)))
    m = re.search(r'(?m)(?:^|[;{}])[ \t]*//', fora)
    if m:
        raise Problema('linha %d: comentário // não existe em CSS (o navegador junta o texto com a regra seguinte '
                       'e descarta as duas); use /* */' % linha_de(fora, m.end()))
    leitor = Leitor(limpo)
    leitor.lista()
    aninhado = [x for x in leitor.itens if x[0] == 'aninhado']
    if aninhado:
        _, pre, lin = aninhado[0]
        raise Problema('linha %d: regra dentro de regra (CSS aninhado) em "%s". Escreva plano: navegador sem '
                       'aninhamento nativo ignora (ajustes-visuais.md, 2.2)' % (lin, pre[:60]))
    return leitor.itens


# Cabeçalho de seção: comentário no começo da linha; depois de "/*", decoração opcional (=, -, #, * e espaços,
# inclusive as quebras de um bloco de comentário), a palavra Seção/Secao/Section opcional e um número como 18,
# 8.8, 8.2b ou 12a, seguido de ".", ")", ":" ou espaço. Sem decoração e sem a palavra, o número tem de vir com
# ".", ")" ou ":" ("/* 2 colunas */" não é cabeçalho; "/* 18. Título */" é). Sub-números são outros números:
# 8 e 8.8 não se repetem.
NUM_SECAO = re.compile(r'(?P<palavra>(?i:se[cç][aã]o|section)\s*)?(?P<num>\d+(?:\.\d+)*[a-z]?)(?P<sinal>[.):])?'
                       r'(?=\s|$)')
FECHO_SECAO = re.compile(r'(?i:fim|end|final)\b')  # "/* ==== fim 17 ==== */": fecha a seção de cima
DECORACAO = ' \t\n=-#*'


def comentarios_de_linha(texto):
    """Os comentários /* */ que começam no começo de uma linha (só espaços antes), fora de strings. Devolve
    [(ini, fim, conteúdo)], ini no "/*" e fim logo depois do "*/"."""
    out, i, n, q = [], 0, len(texto), None
    while i < n:
        c = texto[i]
        if q:
            if c == '\\' and i + 1 < n:
                i += 2; continue
            if c == q or c == '\n':
                q = None
            i += 1; continue
        if c in '"\'':
            q = c; i += 1; continue
        if texto.startswith('/*', i):
            j = texto.find('*/', i + 2)
            if j < 0:
                break
            k = texto.rfind('\n', 0, i) + 1
            if not texto[k:i].strip(' \t'):
                out.append((i, j + 2, texto[i + 2:j]))
            i = j + 2; continue
        i += 1
    return out


def norm_num(num):
    """'08.1' e '8.1' são o mesmo número; '8.2b' fica '8.2b'."""
    m = re.fullmatch(r'([\d.]+?)([a-z]?)', num)
    return '.'.join(str(int(p)) for p in m.group(1).split('.')) + m.group(2)


def cabecalhos(texto):
    """Lê os cabeçalhos de seção e os comentários de fim de seção. Devolve (cabeçalhos, fechos):
    cabeçalhos = [{'num', 'titulo', 'linha', 'ini', 'fim'}], fechos = [{'linha', 'ini', 'fim'}]."""
    cabs, fechos = [], []
    for ini, fim, conteudo in comentarios_de_linha(texto):
        k = 0
        while k < len(conteudo) and conteudo[k] in DECORACAO:
            k += 1
        deco = any(ch in '=-#*' for ch in conteudo[:k])
        if FECHO_SECAO.match(conteudo, k):
            fechos.append({'linha': linha_de(texto, ini), 'ini': ini, 'fim': fim})
            continue
        m = NUM_SECAO.match(conteudo, k)
        if not m or not (deco or m.group('palavra') or m.group('sinal')):
            continue
        resto = conteudo[m.end():].split('\n', 1)[0]
        titulo = ' '.join(resto.strip(DECORACAO).split())
        cabs.append({'num': norm_num(m.group('num')), 'sinal': m.group('sinal') or '.', 'titulo': titulo,
                     'linha': linha_de(texto, ini + 2 + m.start('num')), 'ini': ini, 'fim': fim})
    return cabs, fechos


def maior_numero(cabs):
    nums = [int(re.match(r'\d+', c['num']).group(0)) for c in cabs]
    return max(nums) if nums else None


def linha_de_cabecalho(cab):
    """A linha que a versão de publicar guarda de um cabeçalho: ASCII, uma linha, título até 60 caracteres."""
    t = unicodedata.normalize('NFKD', cab['titulo']).encode('ascii', 'ignore').decode('ascii')
    t = ' '.join(t.replace('*/', '').replace('/*', '').split())[:60].rstrip()
    sinal = cab.get('sinal') or '.'  # o do original ("12a)", "21:"); sem ele, "." (sem decoração, é o que conta)
    return ('/* %s%s %s */' % (cab['num'], sinal, t)) if t else ('/* %s%s */' % (cab['num'], sinal))


def com_cabecalho(limpa, cab):
    """Põe a linha do cabeçalho no começo de uma seção sem comentários (depois de um @charset, que só vale no
    primeiro byte do arquivo)."""
    linha = linha_de_cabecalho(cab) + '\n'
    if limpa.startswith('@charset'):
        fim = limpa.find('\n') + 1
        return limpa[:fim] + linha + limpa[fim:]
    return linha + limpa


def conferir_numeros(base_t, secoes_t):
    """Números de seção: o que a base já usa, o que as seções novas usam e o que se repete. Devolve (informações
    para imprimir, avisos, cabeçalho de cada seção nova ou None)."""
    info, avisos, primeiros = [], [], []
    base_cabs, base_fechos = cabecalhos(base_t) if base_t is not None else ([], [])
    m = maior_numero(base_cabs)
    livre = ('maior número na base: %d; a próxima livre é %d' % (m, m + 1)) if m is not None else ''
    if base_t is not None:
        if base_cabs:
            u = base_cabs[-1]
            info.append('seções numeradas na base: %d cabeçalho(s); %s; o último é %s, na linha %d'
                        % (len(base_cabs), livre, u['num'], u['linha']))
            vistos = {}
            for c in base_cabs:
                vistos.setdefault(c['num'], []).append(c['linha'])
            rep = ['%s (linhas %s)' % (k, ', '.join(map(str, v))) for k, v in vistos.items() if len(v) > 1]
            if rep:
                info.append('nota: a base já tem números repetidos: %s. Ficam como estão (já estão no ar).'
                            % '; '.join(rep))
            fechos = [f for f in base_fechos if f['ini'] >= u['fim']]
            if fechos:
                depois = mascara_strings(sem_comentarios(base_t[fechos[-1]['fim']:]))
                if '{' in depois:
                    avisos.append('há seções sem cabeçalho no fim da base: depois do comentário de fim da linha %d '
                                  '(a seção %s fechou ali) ainda há regras. Uma versão publicada pode ter perdido o '
                                  'cabeçalho de uma seção, e aí o último número não é %s: confira o último número '
                                  'no histórico do perfil antes de numerar a seção nova.'
                                  % (fechos[-1]['linha'], u['num'], u['num']))
        else:
            info.append('a base não tem seções numeradas (cabeçalho "/* N. título */")')
    novos = []
    for arq, t in secoes_t:
        cabs = cabecalhos(t)[0]
        primeiros.append(cabs[0] if cabs else None)
        if not cabs and base_t is not None:
            avisos.append('a seção %s não tem cabeçalho numerado ("/* N. título */"): numere (ajustes-visuais.md, '
                          '2.2). Sem ele, a versão de publicar não leva o número, e a próxima rodada não sabe qual '
                          'é a última seção.' % arq)
        topos = sorted({int(re.match(r'\d+', c['num']).group(0)) for c in cabs})
        if len(topos) > 1:
            avisos.append('a seção %s tem cabeçalhos de mais de uma seção (%s): na versão de publicar fica só a '
                          'linha do primeiro (%s). Separe numa --secao por número, para o arquivo no ar guardar '
                          'todos.' % (arq, ', '.join(map(str, topos)), cabs[0]['num']))
        novos.extend((arq, c) for c in cabs)
    if novos:
        info.append('seções novas: ' + ', '.join('%s (%s, linha %d)' % (c['num'], os.path.basename(arq), c['linha'])
                                                 for arq, c in novos))
    rep = []
    for k, (arq, c) in enumerate(novos):
        onde = ['na base, linha %d' % b['linha'] for b in base_cabs if b['num'] == c['num']]
        onde += ['em %s, linha %d' % (a2, c2['linha']) for a2, c2 in novos[:k] if c2['num'] == c['num']]
        if onde:
            rep.append('%s, linha %d: o número %s já existe (%s)' % (arq, c['linha'], c['num'], '; '.join(onde)))
    if rep:
        avisos.append('número de seção repetido:\n  ' + '\n  '.join(rep) + '\n  Renumere a seção nova antes da '
                      'prévia (o número fica no arquivo no ar)' + ('; ' + livre if livre else '') + '.')
    return info, avisos, primeiros


JUNTA = frozenset('{}();:,>+~[]"\'')  # pontuação que não se junta com o vizinho quando um comentário some
ESCAPE_HEX_NO_FIM = re.compile(r'\\[0-9A-Fa-f]{1,6}$')  # \e9: o primeiro espaço depois dele é parte do escape


def sem_comentarios_publicar(texto):
    """Para a versão de publicar: tira os comentários /* */ de fora das strings, os espaços e tabs do fim das
    linhas e as linhas em branco. Em CSS um comentário não vale como espaço, então tirar é o que o navegador já
    faz, salvo onde dois pedaços se juntariam: "a/**/b" vira "ab", "1px/**/2px" vira "1px2px", e depois de
    "\\e9" o espaço seguinte passaria a ser parte do escape. Nesses casos, Problema (separe com espaço ou tire à
    mão)."""
    out, i, n, q = [], 0, len(texto), None
    pendente = None  # (linha, caractere antes) do comentário tirado, até o próximo caractere
    while i < n:
        c = texto[i]
        if q:
            out.append(c)
            if c == '\\' and i + 1 < n:
                out.append(texto[i + 1]); i += 2; continue
            if c == q or c == '\n':
                q = None
            i += 1; continue
        if texto.startswith('/*', i):
            j = texto.find('*/', i + 2)
            if j < 0:
                raise Problema('linha %d: comentário /* sem fechar' % linha_de(texto, i))
            if ESCAPE_HEX_NO_FIM.search(''.join(out[-8:])):
                raise Problema('linha %d: comentário logo depois de um escape (como \\e9): sem o comentário, o '
                               'espaço ou a quebra seguinte viraria parte do escape. Separe com um espaço antes '
                               'do comentário ou tire à mão' % linha_de(texto, i))
            if pendente is None:
                pendente = (linha_de(texto, i), out[-1] if out else '')
            i = j + 2; continue
        if pendente is not None:
            lin, antes = pendente
            pendente = None
            if (antes and not antes.isspace() and not c.isspace() and antes not in JUNTA and c not in JUNTA):
                raise Problema('linha %d: comentário colado entre dois nomes ("%s/*...*/%s"): sem ele, os dois se '
                               'juntariam. Separe com espaço ou tire à mão' % (lin, antes, c))
        if c in '"\'':
            q = c
        out.append(c); i += 1
    linhas = []
    for linha in ''.join(out).split('\n'):
        r = linha.rstrip(' \t')
        if r != linha and ESCAPE_HEX_NO_FIM.search(r):
            r += ' '  # o espaço que o escape consome
        if r.strip():
            linhas.append(r)
    return '\n'.join(linhas) + '\n' if linhas else ''


def forma_canonica(texto):
    """Sem comentários, com os espaços de fora das strings reduzidos a um e tirados junto da pontuação de JUNTA: o
    que se compara entre a versão de trabalho e a de publicar (um nome colado no outro muda a forma)."""
    s = sem_comentarios(texto)
    out, i, n, q, esp = [], 0, len(s), None, False
    while i < n:
        c = s[i]
        if q:
            out.append(c)
            if c == '\\' and i + 1 < n:
                out.append(s[i + 1]); i += 2; continue
            if c == q or c == '\n':
                q = None
            i += 1; continue
        if c.isspace():
            esp = True; i += 1; continue
        if esp and out and out[-1] not in JUNTA and c not in JUNTA:
            out.append(' ')
        esp = False
        if c == '\\' and i + 1 < n:
            out.append(c); out.append(s[i + 1]); i += 2; continue
        if c in '"\'':
            q = c
        out.append(c); i += 1
    return ''.join(out)


def mesmas_regras(trabalho, publicar):
    """True se as duas versões têm a mesma lista de regras (o que o Leitor acha) e as mesmas declarações."""
    def itens(t):
        return [(tipo, forma_canonica(x)) for tipo, x, _ in ler_css(t)]
    return itens(trabalho) == itens(publicar) and forma_canonica(trabalho) == forma_canonica(publicar)


def nome_ascii(caminho):
    return re.sub(r'[^A-Za-z0-9._-]', '_', os.path.basename(caminho))


def conferir_itens(itens, classe, permitidos, tem_base):
    """Confere os seletores e as @regras das seções. Devolve (erros, usados, sem_ancora, n_sel, avisos)."""
    erros, usados, sem_ancora, avisos, n_sel = [], [], [], [], 0
    classe_rx = re.compile(r'^(?:html\S*\s+)?body\.' + re.escape(classe) + r'(?![\w-])') if classe else None
    import_ok = not tem_base  # num arquivo novo, @import só vale no começo da primeira seção

    def permitido(texto):
        for rx, c in permitidos:
            if c.search(texto):
                return rx
        return None

    for arq, k, tipo, texto, lin in itens:
        onde = '%s, linha %d' % (arq, lin)
        if tipo == 'grupo':
            continue
        if tipo == 'instrucao':
            nome = texto.split()[0].lower()
            if nome == '@import':
                if classe:
                    erros.append('%s: %s carregaria outro arquivo para todo visitante, com ou sem a classe.'
                                 % (onde, texto[:60]))
                elif not (import_ok and k == 0):
                    erros.append('%s: %s depois de outras regras é ignorado pelo navegador.' % (onde, texto[:60]))
                else:
                    avisos.append('%s: %s carrega outro arquivo para todo visitante: confira se é isso.'
                                  % (onde, texto[:60]))
                continue
            if nome == '@charset':
                if classe:
                    erros.append('%s: @charset não é preciso num arquivo ASCII e só vale no primeiro byte do '
                                 'arquivo; tire.' % onde)
                else:
                    avisos.append('%s: @charset só vale no primeiro byte do arquivo; aqui é ignorado.' % onde)
                continue
            if nome not in ('@layer',):
                import_ok = False
            if classe:
                rx = permitido(texto)
                if rx:
                    usados.append((rx, texto, onde))
                else:
                    erros.append('%s: %s vale para a página inteira, com ou sem a classe. Se é isso mesmo, libere '
                                 'com --permitir.' % (onde, texto[:60]))
            continue
        import_ok = False
        if tipo == 'at':
            if not classe:
                continue
            m = re.match(r'@(-[a-z]+-)?keyframes\s+(\S+)', texto, re.I)
            if m and re.match(re.escape(classe) + r'(?![A-Za-z0-9])', m.group(2).strip('"\'')):
                continue  # nome que começa pela classe (sua-classe-pisca): não colide com o de outro CSS
            rx = permitido(texto)
            if rx:
                usados.append((rx, texto, onde))
                continue
            if m:
                erros.append('%s: %s: o nome de uma animação vale para a página inteira; se outro CSS da loja '
                             'usar "%s", o seu substitui o dele mesmo sem a classe. Use um nome que comece pela '
                             'classe (%s-...) ou libere com --permitir \'^%s$\'.'
                             % (onde, texto[:60], m.group(2), classe, texto))
            elif texto.lower().startswith('@font-face'):
                erros.append('%s: @font-face vale sem a classe. Se a família de fonte tem um nome que nenhum CSS '
                             'da loja usa, ela não muda nada enquanto o tema não está ligado: libere com '
                             '--permitir \'^@font-face\' e diga à pessoa que a fonte vai junto.' % onde)
            else:
                erros.append('%s: %s vale sem a classe; se é isso mesmo, libere com --permitir.' % (onde, texto[:60]))
            continue
        # tipo == 'seletor'
        n_sel += 1
        if classe_rx:
            if classe_rx.search(texto):
                continue
            if RAIZ.match(texto):
                erros.append('%s: "%s" pinta a página inteira sem a classe (e --permitir não libera isto). Ponha a '
                             'regra em body.%s (variáveis CSS também: valem para tudo dentro do <body>).'
                             % (onde, texto[:80], classe))
                continue
            rx = permitido(texto)
            if rx:
                usados.append((rx, texto, onde))
            else:
                erros.append('%s: seletor sem a classe logo depois de body: "%s"' % (onde, texto[:80]))
        else:
            if ANCORA.match(texto):
                continue
            rx = permitido(texto)
            if rx:
                usados.append((rx, texto, onde))
                continue
            sem_ancora.append('%s: %s' % (onde, texto[:80]))
    return erros, usados, sem_ancora, n_sel, avisos


def autoteste():
    casos = [
        ('body.x :is(p, td, ul:not(.links) > li), body.x a', ['body.x :is(p, td, ul:not(.links) > li)', 'body.x a']),
        ('a[title="a,b"]', ['a[title="a,b"]']),
        ("a[title='c,d'], b", ["a[title='c,d']", 'b']),
        ('.a\\,b, c', ['.a\\,b', 'c']),
        ('  body.x   .a ,\n body.x .b ', ['body.x .a', 'body.x .b']),
        ('body.x :has(> .a, + .b) .c, body.x .d', ['body.x :has(> .a, + .b) .c', 'body.x .d']),
        ('body.x :is(.a, :not(.b, .c)), body.x .e', ['body.x :is(.a, :not(.b, .c))', 'body.x .e']),
        ('body.x :where(:is(a, b), c) d', ['body.x :where(:is(a, b), c) d']),
    ]
    for entrada, esperado in casos:
        obtido = partes_seletor(entrada)
        assert obtido == esperado, (entrada, obtido)
    # a classe: passa quando vem logo depois de body, no começo; falha quando só aparece depois
    def classe_x(css):
        return conferir_itens([('t.css', 0) + x for x in ler_css(css)], 'x', [], False)[0]
    assert not classe_x('body.x .a:has(.b, .c){color:red}\nhtml.y body.x .d{color:red}')
    assert classe_x(':is(.a, .b) body.x{color:red}')
    assert classe_x('body.isMobile.x .a{color:red}') and classe_x('.a, body.x .b{color:red}')
    # versão de publicar: tira comentários e espaços do fim, não cola nomes, não mexe em string
    pub = [
        ('body.x .a{color:red} /* c */\n\n\n/* outro */\nbody.x .b{x:y}   \n',
         'body.x .a{color:red}\nbody.x .b{x:y}\n'),
        ('body.x .a::before{content:"/* fica */"}\n', 'body.x .a::before{content:"/* fica */"}\n'),
        ('body.x .a{x:y}/* c */body.x .b{x:y}', 'body.x .a{x:y}body.x .b{x:y}\n'),
        ('body.x .a,/* c */\nbody.x .b{margin:0/* c */;}\n', 'body.x .a,\nbody.x .b{margin:0;}\n'),
        ('body.x .caf\\e9 \nbody.x .b{x:y}\n', 'body.x .caf\\e9 \nbody.x .b{x:y}\n'),
        ('/* so comentario */\n', ''),
    ]
    for entrada, esperado in pub:
        obtido = sem_comentarios_publicar(entrada)
        assert obtido == esperado, (entrada, obtido)
        assert not obtido or mesmas_regras(entrada, obtido), entrada
    for ruim in ('body.x .a/**/.b{x:y}', 'body.x a/**/b{x:y}', 'body.x .a{margin:1px/**/2px}',
                 'body.x a/**//**/b{x:y}', 'body.x .caf\\e9/* c */ .b{x:y}',
                 'body.x .a{x:y} /* aberto'):
        try:
            sem_comentarios_publicar(ruim)
            raise AssertionError('passou: ' + ruim)
        except Problema:
            pass
    assert not mesmas_regras('body.x .a{x:y}', 'body.x .a{x:z}')
    assert not mesmas_regras('body.x a b{x:y}', 'body.x ab{x:y}')
    try:
        partes_seletor('a, ')
        raise AssertionError('vírgula sobrando passou')
    except Problema:
        pass
    itens = ler_css('@charset "x";\n@media (min-width:1px){body.x .a, body.x .b{color:red}}\n'
                    '@keyframes k{0%{opacity:0}50%,to{opacity:1}}\nbody.x .c::before{content:"{,}"}\n'
                    '@supports (display:grid){@media print{body.x .d{x:y}}}')
    tipos = [(t, x) for t, x, _ in itens]
    assert tipos == [('instrucao', '@charset "x"'), ('grupo', '@media (min-width:1px)'), ('seletor', 'body.x .a'),
                     ('seletor', 'body.x .b'), ('at', '@keyframes k'), ('seletor', 'body.x .c::before'),
                     ('grupo', '@supports (display:grid)'), ('grupo', '@media print'), ('seletor', 'body.x .d')], tipos
    for ruim in ('body .a{color:red; .b{x:y}}', 'body .a{x:y', 'x:y;', '/* aberto', 'body :is(.a {x:y}',
                 '$a: 1;', 'body .a{x:y}\n// nota'):
        try:
            ler_css(ruim)
            raise AssertionError('passou: ' + ruim)
        except Problema:
            pass
    assert estrutura('a{x:"}"}') is None and estrutura('a{x:y') and estrutura('a{} /* x')
    # cabeçalhos de seção: formatos lidos e não lidos
    cabs = cabecalhos('/* ======\n   1. Home\n   ====== */\na{}\n/* ==== 8. Busca ==== */\n/* ---- 8.2b Lista ---- */\n'
                      '/* ==== 8.8 Novidades ==== */\n/* Seção 12: Etiqueta */\n/* 13a) Toque */\n'
                      '/* ## 14 - Barra */\n/* 18. Publicada */\n/* 2 colunas */\n/* 33px de folga */\n'
                      '/* ==== fim 8. Busca ==== */\na{content:"/* 19. dentro de string */"}\n  /* 20. recuado */\n'
                      'a{} /* 21. depois de regra */\n/* 4,5:1 */\n')[0]
    assert [c['num'] for c in cabs] == ['1', '8', '8.2b', '8.8', '12', '13a', '14', '18', '20'], cabs
    assert cabs[0]['titulo'] == 'Home' and cabs[0]['linha'] == 2 and cabs[1]['titulo'] == 'Busca', cabs
    assert cabecalhos('/* ==== fim 17 ==== */')[1] and norm_num('08.10') == '8.10'
    # números repetidos: 17 + 17 avisa; 8 e 8.8 não; a próxima livre
    base = '/* ==== 8. A ==== */\na{}\n/* ==== 8.8 B ==== */\nb{}\n/* ==== 17. C ==== */\nc{}\n/* ==== fim 17 ==== */'
    info, avs, prim = conferir_numeros(base, [('n.css', '/* ==== 17. Nova ==== */\nd{}\n')])
    assert len(avs) == 1 and 'repetido' in avs[0] and 'a próxima livre é 18' in avs[0], avs
    info, avs, prim = conferir_numeros(base, [('n.css', '/* ==== 8.9 Nova ==== */\nd{}\n')])
    assert not avs and 'maior número na base: 17' in info[0] and prim[0]['num'] == '8.9', (info, avs)
    info, avs, _ = conferir_numeros(base, [('a.css', '/* 18. A */\nd{}\n'), ('b.css', '/* 18. B */\ne{}\n')])
    assert len(avs) == 1 and 'b.css, linha 1' in avs[0] and 'em a.css, linha 1' in avs[0], avs
    info, avs, _ = conferir_numeros(base + '\nd{x:y}\n', [('n.css', '/* 18. N */\ne{}\n')])
    assert len(avs) == 1 and 'sem cabeçalho no fim da base' in avs[0], avs
    info, avs, _ = conferir_numeros(base, [('n.css', '/* 18. N */\ne{}\n/* 18.1 sub */\nf{}\n')])
    assert not avs, avs  # 18 e 18.1: uma seção só
    info, avs, _ = conferir_numeros(base, [('n.css', '/* 18. N */\ne{}\n/* 19. O */\nf{}\n')])
    assert len(avs) == 1 and 'mais de uma seção (18, 19)' in avs[0], avs
    # a versão de publicar guarda uma linha por seção, em ASCII, e as regras não mudam
    sec = '/* ==== 18. Etiqueta — preço (2026-10-22) ====\n   longo */\nbody.x .a{x:y}\n/* d */\nbody.x .b{x:y}\n'
    pubsec = com_cabecalho(sem_comentarios_publicar(sec), cabecalhos(sec)[0][0])
    assert pubsec == '/* 18. Etiqueta preco (2026-10-22) */\nbody.x .a{x:y}\nbody.x .b{x:y}\n', pubsec
    assert mesmas_regras(sec, pubsec) and cabecalhos(pubsec)[0][0]['num'] == '18'
    assert com_cabecalho('@charset "x";\na{}\n', {'num': '1', 'titulo': ''}) == '@charset "x";\n/* 1. */\na{}\n'
    for orig, linha in (('/* 13a) Toque */', '/* 13a) Toque */'), ('/* Secao 21: x */', '/* 21: x */'),
                        ('/* ==== 8.9 Sub ==== */', '/* 8.9. Sub */')):
        c = cabecalhos(orig)[0][0]
        assert linha_de_cabecalho(c) == linha and cabecalhos(linha)[0][0]['num'] == c['num'], (orig, c)
    print('autoteste ok: %d cortes de seletor, leitor de CSS, estrutura, classe, %d casos da versão de publicar e '
          'números de seção' % (len(casos), len(pub)))


def main():
    for st in (sys.stdout, sys.stderr):  # sem isto, acentos saem trocados no Git Bash do Windows
        try:
            st.reconfigure(encoding='utf-8')
        except Exception:
            pass
    if '--autoteste' in sys.argv[1:]:
        autoteste()
        return
    ap = argparse.ArgumentParser(description='Monta e confere um arquivo CSS de tema ou de ajustes.')
    ap.add_argument('--secao', action='append', default=[])
    ap.add_argument('--base')
    ap.add_argument('--sha-base')
    ap.add_argument('--classe')
    ap.add_argument('--permitir', action='append', default=[])
    ap.add_argument('--js', action='append', default=[])
    ap.add_argument('--permitir-nao-ascii', action='store_true')
    ap.add_argument('--sobrescrever', action='store_true')
    ap.add_argument('--saida', required=True)
    ap.add_argument('--publicar')
    a = ap.parse_args()
    if not a.secao:
        erro('passe pelo menos uma --secao')
    if a.sha_base and not a.base:
        erro('--sha-base confere a --base; passe a --base junto')
    if a.sha_base and not re.fullmatch(r'[0-9a-fA-F]{64}', a.sha_base):
        erro('--sha-base tem de ser um sha256 (64 caracteres de 0-9 e a-f)')
    if a.classe is not None and not re.fullmatch(r'-?[A-Za-z_][A-Za-z0-9_-]*', a.classe):
        erro('--classe não parece um nome de classe: ' + a.classe)
    permitidos = []
    for rx in a.permitir:
        try:
            permitidos.append((rx, re.compile(rx)))
        except re.error as e:
            erro('--permitir %r não é uma expressão regular válida (%s)' % (rx, e))

    entradas = a.secao + ([a.base] if a.base else []) + a.js
    for entrada in entradas:
        if mesmo_arquivo(a.saida, entrada):
            erro('a --saida %s é a entrada %s: gravar apagaria a entrada. Use um nome novo (ex.: -v4.css).'
                 % (a.saida, entrada))
    if a.publicar is not None:
        for entrada in entradas:
            if mesmo_arquivo(a.publicar, entrada):
                erro('o --publicar %s é a entrada %s: gravar apagaria a entrada. Use um nome novo (ex.: '
                     '-v4-publicar.css).' % (a.publicar, entrada))
        if mesmo_arquivo(a.publicar, a.saida):
            erro('o --publicar e a --saida são o mesmo arquivo (%s): a versão de trabalho e a de publicar são dois '
                 'arquivos. Use, por exemplo, %s' % (a.saida, re.sub(r'(\.css)?$', '-publicar.css', a.saida, 1)))
    for destino, opcao in ((a.saida, '--saida'), (a.publicar, '--publicar')):
        if destino is None:
            continue
        if os.path.exists(destino) and not a.sobrescrever:
            erro('%s já existe. Use um nome novo (cada versão no seu arquivo: é o caminho de volta) ou passe '
                 '--sobrescrever.' % destino)
        if not os.path.isdir(os.path.dirname(os.path.abspath(destino))):
            erro('a pasta de %s não existe: %s' % (opcao, os.path.dirname(os.path.abspath(destino))))

    avisos = []
    base_b = b''
    if a.base:
        base_b, base_t = ler(a.base, 'a base')
        p = estrutura(base_t)
        if p:
            erro('a base %s: %s. O que vier depois dela ficaria dentro disso; confira se a cópia está inteira.'
                 % (a.base, p))
        if a.sha_base and a.sha_base.lower() not in (sha(base_b), sha(normalizado(base_b))):
            erro('a base %s não bate com o --sha-base (nem nos bytes, nem normalizada). Ela não é a cópia do que '
                 'está no ar: baixe ou releia de novo.' % a.base)
        n = len(fora_do_ascii(base_t))
        if n:
            avisos.append('a base tem %d caractere(s) fora do ASCII; já estão no ar e ficam como estão.' % n)

    secoes, itens = [], []
    for k, arq in enumerate(a.secao):
        b, t = ler(arq, 'a seção')
        if not t.strip():
            erro('a seção %s está vazia' % arq)
        if not a.permitir_nao_ascii:
            recusa_nao_ascii(arq, t)
        try:
            achados = ler_css(t)
        except Problema as e:
            erro('%s, %s' % (arq, e))
        secoes.append((arq, b))
        itens.extend((arq, k) + x for x in achados)

    # Números de seção: a seção nova não pode repetir um número da base nem de outra seção nova (só AVISO)
    info_num, avs_num, cab_secao = conferir_numeros(base_t if a.base else None,
                                                    [(arq, b.decode('utf-8')) for arq, b in secoes])
    avisos.extend(avs_num)

    jss = []
    for arq in a.js:
        b, t = ler(arq, 'o JS')
        if not a.permitir_nao_ascii:
            recusa_nao_ascii(arq, t, js=True)
        jss.append((arq, b))

    # Conferência dos seletores e das @regras das seções
    erros, usados, sem_ancora, n_sel, avs = conferir_itens(itens, a.classe, permitidos, bool(a.base))
    avisos.extend(avs)
    if erros:
        mais = '' if len(erros) <= 12 else '\n  ... e mais %d' % (len(erros) - 12)
        erro('%d problema(s) nas seções:\n  ' % len(erros) + '\n  '.join(erros[:12]) + mais)
    if sem_ancora:
        mais = '' if len(sem_ancora) <= 12 else '\n  ... e mais %d' % (len(sem_ancora) - 12)
        avisos.append('%d seletor(es) não começam por aparelho, tipo de página ou região (body.isMobile/notMobile, '
                      'body.page-*, #area-body, .inner-body >, footer). Releia cada um: uma classe solta '
                      '(.prices{...}) pega o site inteiro.\n  ' % len(sem_ancora) + '\n  '.join(sem_ancora[:12]) + mais)
    for rx, _ in permitidos:
        if not any(u[0] == rx for u in usados):
            avisos.append('--permitir %r não casou com nada (erro de digitação?)' % rx)

    # node --check no JS do tema
    node = shutil.which('node')
    for arq, _ in jss:
        if node:
            r = subprocess.run([node, '--check', arq], capture_output=True, text=True, encoding='utf-8',
                               errors='replace')
            if r.returncode != 0:
                erro('%s não passou no node --check (nada foi gravado):\n%s' % (arq, r.stderr.strip()))
        else:
            avisos.append('Node não encontrado: %s ficou sem a verificação de sintaxe (node --check).' % arq)

    # Montagem
    if a.base:
        corpo = b''.join(b'\n' + b.strip(b'\n') + b'\n' for _, b in secoes)
        saida = base_b + corpo
        if saida[:len(base_b)] != base_b or saida[len(base_b):] != corpo:
            erro('interno: a saída não começa pela base byte a byte')
    else:
        saida = b'\n'.join(b.strip(b'\n') + b'\n' for _, b in secoes)
    p = estrutura(saida.decode('utf-8'))
    if p:
        erro('interno: o arquivo montado ficou com %s' % p)

    # Versão de publicar: as mesmas seções sem comentários, conferidas de novo (nada é gravado se falhar)
    pub = None
    if a.publicar is not None:
        limpas, itens_pub = [], []
        for k, (arq, b) in enumerate(secoes):
            t = b.decode('utf-8')
            try:
                limpa = sem_comentarios_publicar(t)
            except Problema as e:
                erro('%s, %s (versão de publicar; nada foi gravado)' % (arq, e))
            if not limpa:
                avisos.append('a seção %s só tem comentários: não entra na versão de publicar.' % arq)
                continue
            try:
                iguais = mesmas_regras(t, limpa)
                itens_pub.extend((arq, k) + x for x in ler_css(limpa))
            except Problema as e:
                erro('interno: a versão de publicar de %s não passou no leitor de CSS: %s (nada foi gravado)'
                     % (arq, e))
            if not iguais:
                erro('interno: sem os comentários, %s ficou com outra lista de regras ou de declarações (nada foi '
                     'gravado). Tire os comentários dessa seção à mão.' % arq)
            if not a.permitir_nao_ascii:
                recusa_nao_ascii(arq + ' (versão de publicar)', limpa)
            if cab_secao[k] is not None:
                # uma linha ASCII com o número e o título: o arquivo no ar continua numerado (medido: sem ela, a
                # versão publicada "terminava" na seção anterior, e a seção seguinte ganhou um número repetido)
                limpa = com_cabecalho(limpa, cab_secao[k])
            limpas.append(limpa.encode('utf-8'))
        erros_pub = conferir_itens(itens_pub, a.classe, permitidos, bool(a.base))[0]
        if erros_pub:
            erro('interno: a versão de publicar não passou na conferência das seções (nada foi gravado):\n  '
                 + '\n  '.join(erros_pub[:12]))
        if a.base:
            pub = base_b + b''.join(b'\n' + x for x in limpas)
            if pub[:len(base_b)] != base_b:
                erro('interno: a versão de publicar não começa pela base byte a byte')
        else:
            cab = ('/* %s | versao de publicar gerada por montar_tema.py de %s (sha256 %s) em %s; a versao comentada '
                   'fica com quem mantem o tema */\n' % (nome_ascii(a.publicar), nome_ascii(a.saida), sha(saida)[:12],
                                                         datetime.date.today().isoformat())).encode('ascii')
            corpo_pub = b'\n'.join(limpas)
            if corpo_pub.startswith(b'@charset'):  # @charset só vale no primeiro byte: o cabeçalho vem depois
                fim = corpo_pub.find(b'\n') + 1
                pub = corpo_pub[:fim] + cab + corpo_pub[fim:]
            else:
                pub = cab + corpo_pub
            try:
                if not mesmas_regras(saida.decode('utf-8'), pub.decode('utf-8')):
                    erro('interno: a versão de publicar ficou com outra lista de regras (nada foi gravado)')
            except Problema as e:
                erro('interno: a versão de publicar não passou no leitor de CSS: %s (nada foi gravado)' % e)
        p = estrutura(pub.decode('utf-8'))
        if p:
            erro('interno: a versão de publicar ficou com %s (nada foi gravado)' % p)

    def grava(caminho, dados):
        fd, tmp = tempfile.mkstemp(prefix='.montando-', suffix='.css',
                                   dir=os.path.dirname(os.path.abspath(caminho)))
        try:
            with os.fdopen(fd, 'wb') as f:
                f.write(dados)
            os.replace(tmp, caminho)
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)
        with open(caminho, 'rb') as f:
            if f.read() != dados:
                erro('o arquivo gravado %s não bate com o montado: grave de novo' % caminho)

    grava(a.saida, saida)
    if pub is not None:
        grava(a.publicar, pub)

    rotulo = ' | versão de trabalho (com os comentários)' if pub is not None else ''
    print('ok: %s | %d bytes | sha256 %s%s' % (a.saida, len(saida), sha(saida), rotulo))
    print('  sha256 normalizado (CRLF->LF, sem quebras no fim; compare com o texto relido do admin): %s'
          % sha(normalizado(saida)))
    if pub is not None:
        menos = len(saida) - len(pub)
        print('ok: %s | %d bytes | sha256 %s | versão de publicar: -%d bytes (-%s%%)' % (
            a.publicar, len(pub), sha(pub), menos, ('%.1f' % (100.0 * menos / max(len(saida), 1))).replace('.', ',')))
        print('  sha256 normalizado (compare com o texto relido do admin): %s' % sha(normalizado(pub)))
    if a.base:
        print('  base: %s | %d bytes | sha256 %s | normalizado %s | o arquivo novo começa por ela, byte a byte'
              % (a.base, len(base_b), sha(base_b), sha(normalizado(base_b))))
    for arq, b in secoes:
        print('  seção: %s | %d bytes | sha256 %s' % (arq, len(b), sha(b)))
    for arq, b in jss:
        print('  js: %s | %d bytes | sha256 %s | node --check %s'
              % (arq, len(b), sha(b), 'ok' if node else 'não rodou'))
    print('  seletores conferidos: %d%s | exceções usadas: %d' % (
        n_sel, (' (presos a body.%s)' % a.classe) if a.classe else ' (modo permanente: sem classe)', len(usados)))
    for rx, texto, onde in usados:
        print('    exceção %r: %s (%s)' % (rx, texto[:80], onde))
    for linha in info_num:
        print('  ' + linha)
    q = (lambda x: '"%s"' % x)
    vai = a.publicar if pub is not None else a.saida  # o arquivo da prévia é o que vai para o admin
    js = (' ' + ' '.join('--js %s' % q(x) for x in a.js)) if a.js else ''
    if a.base:
        # Duas prévias: a da pessoa, só com as seções novas logo depois do arquivo no ar (favorito pequeno; o
        # gerar_previa tira os comentários, e este script já provou que a versão que vai ao ar tem as mesmas
        # regras), e a sua conferência, com o arquivo inteiro no lugar do que está no ar. Medido num tema de
        # ~119 KB: 82.812 caracteres no favorito inteiro contra ~10 mil só da seção, e 0 diferenças entre os dois.
        print('Prévia (previa.md, "Qual prévia para qual mudança" e "Favorito grande"), em duas:')
        print('  1. para a pessoa, só as seções novas: python -I scripts/gerar_previa.py %s --depois-de '
              '"<trecho do endereço do arquivo no ar>"%s --nome "Prévia" --saida previa-<assunto>.txt'
              % (' '.join('--css %s' % q(x) for x in a.secao), js))
        print('  2. para você, o arquivo inteiro no lugar do que está no ar: python -I scripts/gerar_previa.py '
              '--css %s --substitui "<trecho do endereço do arquivo no ar>"%s --nome "Prévia inteira" '
              '--saida previa-<assunto>-inteira.txt' % (q(vai), js))
        print('  Ligue uma de cada vez na sua aba (com o mesmo --id, clicar numa desliga a outra) e compare as fotos '
              '(medir-no-navegador.md, 9): mudaram tem de dar 0 entre as duas.')
        if pub is not None:
            print('  A gravação usa a versão de publicar; anote no histórico o sha das seções (o que a pessoa '
                  'aprovou), o da versão de publicar (o que vai para o admin) e o da versão de trabalho.')
    else:
        print('Prévia (previa.md, "Qual prévia para qual mudança"): python -I scripts/gerar_previa.py --css %s '
              '--depois-de "<arquivo logo acima da linha nova>"%s --nome "Prévia" --saida previa-<assunto>.txt'
              % (q(vai), js))
        if pub is not None:
            print('  A prévia e a gravação usam a versão de publicar; anote no histórico o sha das duas.')
    if not a.base:
        print('  arquivo novo: a posição da linha nova depende da família do tema (previa.md, "Arquivo novo").')
    if a.classe:
        print('  modo de época: a classe %s entra pelo --js da prévia (um --js que põe a classe, antes do JS do '
              'tema; previa.md, "JS na prévia"), e --desligar se o JS do tema exporta a própria função de desligar.'
              % a.classe)
    for av in avisos:
        sys.stdout.flush()
        print('AVISO: ' + av, file=sys.stderr)


if __name__ == '__main__':
    main()
