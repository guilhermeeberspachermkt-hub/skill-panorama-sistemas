"""comparar_prints.py - junta prints de várias versões num quadro só, com o nome de cada uma, para a pessoa comparar
(hoje x prévia, direção A x B x C). Os prints têm de ser do mesmo lugar: mesma página, largura e rolagem (a mesma
linha da lista do rodada.mjs).

Uso:
  python -I -X utf8 scripts/comparar_prints.py --saida quadro.jpg [--titulo "Produto, computador 1920"] \
      --item "Hoje=hoje/prints/08-produto-1920.png" --item "Prévia A=a/prints/08-produto-1920.png" ... \
      [--corte "0,0,1920,900"] [--largura 1600] [--colunas 1] [--nota "render local de uma cópia de 2026-11-03"]

  --item     "rótulo=caminho do print" (repita; na ordem do quadro)
  --corte    x,y,w,h aplicado a todos os prints (em px do print)
  --largura  largura final de cada painel (redimensiona mantendo a proporção)
  --colunas  1 = um embaixo do outro; 2 ou mais = grade (bom para celular)
  --nota     uma linha no pé do quadro (o que o quadro não mostra, ou de onde vieram os prints)
Grava .jpg (qualidade 88) ou .png, conforme a extensão de --saida. Precisa do Pillow (pip install pillow).
"""
import argparse
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit('ERRO: precisa do Pillow (pip install pillow)')


def fonte(tam, negrito=False):
    nomes = (['segoeuib.ttf', 'arialbd.ttf', 'DejaVuSans-Bold.ttf', 'Arial Bold.ttf'] if negrito
             else ['segoeui.ttf', 'arial.ttf', 'DejaVuSans.ttf', 'Arial.ttf'])
    pastas = ['C:/Windows/Fonts/', '/usr/share/fonts/truetype/dejavu/', '/Library/Fonts/', '/System/Library/Fonts/Supplemental/', '']
    for n in nomes:
        for p in pastas:
            try:
                return ImageFont.truetype(p + n, tam)
            except OSError:
                pass
    return ImageFont.load_default()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--saida', required=True)
    ap.add_argument('--titulo', default='')
    ap.add_argument('--item', action='append', required=True, help='"rótulo=caminho" (repita)')
    ap.add_argument('--corte')
    ap.add_argument('--largura', type=int, default=0)
    ap.add_argument('--colunas', type=int, default=1)
    ap.add_argument('--nota', default='')
    a = ap.parse_args()

    paineis = []
    for it in a.item:
        if '=' not in it:
            sys.exit('ERRO: --item "%s": use "rótulo=caminho"' % it)
        rotulo, caminho = it.split('=', 1)
        im = Image.open(caminho).convert('RGB')
        if a.corte:
            x, y, w, h = [int(v) for v in a.corte.split(',')]
            im = im.crop((x, y, min(x + w, im.width), min(y + h, im.height)))
        if a.largura and im.width != a.largura:
            im = im.resize((a.largura, round(im.height * a.largura / im.width)), Image.LANCZOS)
        paineis.append((rotulo, im))

    cab, margem, col = 46, 18, max(1, a.colunas)
    w = max(p[1].width for p in paineis)
    h = max(p[1].height for p in paineis)
    linhas = (len(paineis) + col - 1) // col
    topo = 64 if a.titulo else 10
    rod = 40 if a.nota else 10
    W = margem + col * (w + margem)
    H = topo + linhas * (cab + h + margem) + rod
    out = Image.new('RGB', (W, H), (245, 245, 245))
    d = ImageDraw.Draw(out)
    if a.titulo:
        d.text((margem, 16), a.titulo, fill=(20, 20, 20), font=fonte(30, True))
    for i, (rot, im) in enumerate(paineis):
        cx = margem + (i % col) * (w + margem)
        cy = topo + (i // col) * (cab + h + margem)
        d.rectangle([cx, cy, cx + w, cy + cab - 6], fill=(30, 30, 30))
        d.text((cx + 12, cy + 7), rot, fill=(255, 255, 255), font=fonte(24, True))
        out.paste(im, (cx, cy + cab))
        d.rectangle([cx - 1, cy + cab - 1, cx + im.width, cy + cab + im.height], outline=(180, 180, 180))
    if a.nota:
        d.text((margem, H - rod + 6), a.nota, fill=(60, 60, 60), font=fonte(20))
    if a.saida.lower().endswith(('.jpg', '.jpeg')):
        out.save(a.saida, quality=88, optimize=True)
    else:
        out.save(a.saida, optimize=True)
    print('ok', a.saida, out.size)


if __name__ == '__main__':
    main()
