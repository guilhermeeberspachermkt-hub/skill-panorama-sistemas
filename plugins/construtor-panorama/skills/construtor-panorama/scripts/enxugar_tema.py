"""enxugar_tema.py - gera, da versão COMENTADA de um tema, a versão ENXUTA que vai para o site: a mesma coisa sem os
comentários, com um único comentário no topo, que aponta para a página do admin onde a comentada fica guardada,
despublicada (ajustes-visuais.md, 5.2, "A versão comentada no admin").

Uso (rode com os arquivos na pasta trabalho/ do perfil):
  python -I scripts/enxugar_tema.py trabalho/seu-tema-v5-comentado.css --saida trabalho/seu-tema-v5.css \\
         --pagina NNNNNN --url /seu-tema-comentado.css [--conferir servido.css] [--sobrescrever]
         [--permitir-nao-ascii]

  COMENTADA             a versão comentada inteira. Na primeira vez, o arquivo no ar como está (quando é ele que
                        tem os comentários) ou a versão de trabalho que o conferir_css.mjs prova ter as mesmas
                        regras do arquivo servido; depois, a saída do montar_tema.py --base <a comentada atual>.
                        Aceita CRLF (o admin devolve o texto assim) e acento nos comentários.
  --saida ARQ           a versão enxuta: é ela que vai para o Arquivo do site e ganha o número novo no <head>.
  --pagina / --url      o # e o endereço da página tipo Arquivo, despublicada, que guarda a comentada no admin.
                        Entram no comentário do topo, para quem lê o arquivo no ar (outro assistente, um dev) achar a
                        comentada.
  --conferir ARQ        compara a enxuta gerada com ARQ (em geral, o arquivo que o site serve hoje, baixado com ?nc=)
                        pelo sha256 normalizado. Como a mesma comentada dá sempre a mesma enxuta, IGUAL prova que o
                        arquivo no ar saiu desta comentada, sem ninguém ter editado a enxuta no admin. DIFERENTE
                        sai com código 1, depois de gravar a --saida, para você comparar as duas.
  --sobrescrever        deixa gravar por cima de uma --saida que já existe.
  --permitir-nao-ascii  aceita caractere fora do ASCII na enxuta (o padrão é ERRO: ajustes-visuais.md, 2.2).

O que ele faz: tira os comentários /* */ de fora das strings, os espaços do fim das linhas e as linhas em
branco, com a mesma função do montar_tema.py --publicar (ERRO onde tirar um comentário juntaria dois nomes,
como "a/**/b", ou mudaria um escape, como "\\e9/**/"), e põe o comentário do topo (depois de um @charset, se
houver). O comentário leva o sha256 normalizado da comentada, para provar de qual ela saiu; sem data, o mesmo
arquivo de entrada dá sempre o mesmo resultado. Medido (2026-11) numa comentada de 204 KB, 2/5 dela comentário: a
enxuta ficou com 125 KB, e o gzip, de ~46 KB para ~15 KB (o arquivo que estava no ar, com parte dos comentários,
tinha 190 KB e ~41 KB em gzip). Tirar também o recuo e juntar as regras numa linha só não mudava o gzip (diferença
abaixo de 1%), e por isso este script não faz isso.

O que ele confere (ERRO, e nada gravado, se falhar): comentários fechados e chaves equilibradas nas duas
versões; uma comentada sem nenhuma regra (vazia, ou só comentário); a mesma lista de regras e declarações nas duas (como o --publicar do montar_tema.py); a enxuta em
ASCII, salvo --permitir-nao-ascii; a --saida diferente da entrada.

Imprime, para as duas: bytes, sha256 dos bytes (os do arquivo como está no disco: é o que o lerEntradaArquivo
confere no upload), sha256 normalizado (CRLF > LF, sem quebra no fim: o que se
compara com o admin) e o tamanho em gzip; depois, os próximos comandos. A prova de que o NAVEGADOR vê as mesmas
regras é o conferir_css.mjs (regra a regra, no Chrome), e a de que a tela não muda, o conferir_troca.mjs (no site,
na mesma carga): rode os dois antes de gravar. Sai com 0 (ok) ou 1 (ERRO).
"""
import argparse
import gzip
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # o montar_tema.py ao lado (com -I não entra sozinho)
sys.dont_write_bytecode = True  # sem __pycache__ dentro da pasta da skill
import montar_tema as M  # noqa: E402


def cabecalho(pagina, url, sha_comentada):
    return ('/* Versao ENXUTA deste arquivo (sem comentarios). A versao COMENTADA, com o porque de cada regra e os\n'
            '   numeros das secoes, fica no admin: pagina Arquivo #%s %s (Loja On-line > Paginas),\n'
            '   despublicada de proposito. Gerada por enxugar_tema.py da comentada de sha256 normalizado %s.\n'
            '   Para mudar o tema: edite a comentada, gere esta de novo e grave as duas. */\n'
            % (pagina, url, sha_comentada[:12]))


def enxugar(texto, pagina, url):
    """Devolve a versão enxuta de `texto` (já em LF). Levanta M.Problema se não der para tirar um comentário."""
    limpa = M.sem_comentarios_publicar(texto)
    cab = cabecalho(pagina, url, M.sha(M.normalizado(texto.encode('utf-8'))))
    if limpa.startswith('@charset'):  # @charset só vale no primeiro byte: o comentário vem depois dele
        fim = limpa.find('\n') + 1
        return limpa[:fim] + cab + limpa[fim:]
    return cab + limpa


def descrever(rotulo, b):
    return ('%-10s %7d bytes | gzip %6d | sha256 %s | normalizado %s'
            % (rotulo, len(b), len(gzip.compress(b, 6, mtime=0)), M.sha(b), M.sha(M.normalizado(b))))


def main():
    for st in (sys.stdout, sys.stderr):  # sem isto, acentos saem trocados no Git Bash do Windows
        try:
            st.reconfigure(encoding='utf-8')
        except Exception:
            pass
    ap = argparse.ArgumentParser(description='Gera a versão enxuta (sem comentários) de um tema comentado.')
    ap.add_argument('comentada')
    ap.add_argument('--saida', required=True)
    ap.add_argument('--pagina', required=True)
    ap.add_argument('--url', required=True)
    ap.add_argument('--conferir')
    ap.add_argument('--sobrescrever', action='store_true')
    ap.add_argument('--permitir-nao-ascii', action='store_true')
    a = ap.parse_args()

    pagina = a.pagina.lstrip('#')
    if not pagina.isdigit():
        M.erro('--pagina é o número (#) da página tipo Arquivo que guarda a comentada, por exemplo 123456')
    if not re.fullmatch(r'/[A-Za-z0-9._~/-]+', a.url):
        M.erro('--url é o endereço da página da comentada, começando por /, sem espaço nem acento '
               '(por exemplo /seu-tema-comentado.css)')
    if os.path.exists(a.saida):
        if M.mesmo_arquivo(a.saida, a.comentada):
            M.erro('a --saida é a própria comentada: gravar apagaria a entrada. Use um nome novo.')
        if not a.sobrescrever:
            M.erro('%s já existe. Use outro nome ou --sobrescrever.' % a.saida)

    b_com, texto = M.ler(a.comentada, 'a comentada', cr_proibido=False)
    texto = texto.replace('\r\n', '\n')
    if '\r' in texto:
        M.erro('%s tem CR solto (sem LF) na linha %d. Normalize os fins de linha para LF.'
               % (a.comentada, M.linha_de(texto, texto.index('\r'))))
    problema = M.estrutura(texto)
    if problema:
        M.erro('na comentada, ' + problema)
    try:
        enxuta = enxugar(texto, pagina, a.url)
    except M.Problema as e:
        M.erro('na comentada, %s' % e)

    if not M.sem_comentarios_publicar(texto).strip():
        M.erro('a comentada não tem nenhuma regra (vazia, ou só comentário): confira se o arquivo é o certo')
    problema = M.estrutura(enxuta)
    if problema:
        M.erro('na enxuta, %s (interno: avise quem mantém a skill)' % problema)
    if not M.mesmas_regras(texto, enxuta):
        M.erro('a enxuta não tem a mesma lista de regras da comentada (interno: avise quem mantém a skill)')
    if not a.permitir_nao_ascii:
        M.recusa_nao_ascii(a.saida + ' (a enxuta)', enxuta)

    b_enx = enxuta.encode('utf-8')
    servido = None
    if a.conferir:
        servido, _ = M.ler(a.conferir, 'o arquivo a conferir', cr_proibido=False)
    try:
        with open(a.saida, 'wb') as f:
            f.write(b_enx)
    except OSError as e:
        M.erro('não consegui gravar %s (%s)' % (a.saida, e))
    menos = len(texto.encode('utf-8')) - len(b_enx)
    print(descrever('comentada', b_com) + (' (com CRLF no disco)' if b'\r' in b_com else ''))
    print(descrever('enxuta', b_enx))
    print('a enxuta tem %d bytes a menos (-%d%%); a mesma lista de regras e declarações da comentada.'
          % (menos, round(100 * menos / max(1, len(texto.encode('utf-8'))))))
    if servido is not None:
        igual = M.sha(M.normalizado(servido)) == M.sha(M.normalizado(b_enx))
        print('--conferir %s: %s' % (a.conferir, 'IGUAL (o arquivo saiu desta comentada)' if igual else
              'DIFERENTE: o arquivo não é a enxuta desta comentada. Alguém editou um dos dois, ou a comentada não '
              'é a certa: compare com o conferir_css.mjs antes de seguir'))
        if not igual:
            sys.exit(1)
    print('\nPróximos passos (ajustes-visuais.md, 5.2, "A versão comentada no admin"):')
    print('  node scripts/conferir_css.mjs <o arquivo servido hoje> "%s" "%s"' % (a.comentada, a.saida))
    print('  node scripts/conferir_troca.mjs --url <uma página> --css "%s" --substitui "<trecho do href do arquivo>"'
          % a.saida)
    print('  e grave as duas: a enxuta no Arquivo do site, a comentada na página #%s.' % pagina)


if __name__ == '__main__':
    main()
