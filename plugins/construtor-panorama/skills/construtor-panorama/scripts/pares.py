"""pares.py - mede pelos PIXELS se o foco de teclado aparece, a partir dos pares do rev.mjs.

Para cada parada do Tab, o rev.mjs ({tab: {..., pares: true}}) tira um print COM foco (a) e outro SEM foco (b), da
mesma região, no mesmo instante. Os pixels que mudaram são o indicador de foco; o contraste de cada um é medido
entre a cor com foco e a cor sem foco no mesmo ponto (o fundo ao lado), como pede a WCAG 2.4.13.

Uso:
  python -I -X utf8 scripts/pares.py visita.json [saida.json] [--grupos] [--max 40]

  visita.json   o JSON que o rev.mjs gravou (os passos com "pares")
  saida.json    grava o resultado de cada parada (opcional)
  --grupos      junta as paradas por tipo de elemento (ok / falha) e mostra um exemplo de cada falha
  --max N       quantas falhas listar por passo (padrão 40)

Critério: "visível" = pelo menos o equivalente a um contorno de 1px em volta do elemento (2 x (largura + altura)
px CSS, vezes o dpr ao quadrado) com contraste >= 3:1 entre o pixel com foco e o mesmo pixel sem foco. Pixels que
mudaram menos de 24 em todos os canais (antisserrilhado) não contam.
Precisa do Pillow (pip install pillow).
"""
import json
import re
import sys
from collections import Counter, defaultdict

try:
    from PIL import Image
except ImportError:
    sys.exit('ERRO: precisa do Pillow (pip install pillow)')


def lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def lum(p):
    return 0.2126 * lin(p[0]) + 0.7152 * lin(p[1]) + 0.0722 * lin(p[2])


def ratio(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def hx(p):
    return '#%02x%02x%02x' % p[:3]


def medir(par):
    a = Image.open(par['a']).convert('RGB')
    b = Image.open(par['b']).convert('RGB')
    if a.size != b.size:
        return {'erro': 'tamanhos diferentes', 'visivel': False, 'mudaram': 0, 'com3': 0, 'minimo': 0, 'principais': []}
    w, h = a.size
    pa, pb = a.load(), b.load()
    mud = ok3 = 0
    pares = Counter()
    cache = {}
    for y in range(h):
        for x in range(w):
            ca, cb = pa[x, y], pb[x, y]
            if ca == cb or max(abs(ca[0] - cb[0]), abs(ca[1] - cb[1]), abs(ca[2] - cb[2])) < 24:
                continue
            mud += 1
            r = cache.get((ca, cb))
            if r is None:
                r = cache[(ca, cb)] = ratio(ca, cb)
            if r >= 3:
                ok3 += 1
            pares[(hx(ca), hx(cb), round(r, 2))] += 1
    dpr = par.get('dpr', 1)
    rect = par.get('rect') or [0, 0, w / dpr, h / dpr]
    perim = max(2 * (rect[2] + rect[3]) * dpr * dpr, 40)
    top = [{'com': k[0], 'sem': k[1], 'contraste': k[2], 'px': n} for k, n in pares.most_common(4)]
    return {'mudaram': mud, 'com3': ok3, 'minimo': round(perim), 'visivel': ok3 >= perim, 'principais': top}


def grupos(res):
    g = defaultdict(lambda: [0, 0, None])
    for r in res:
        k = re.sub(r'\.sku-\d+|-\d{3,}', '', r['el'])[:70]
        g[k][0 if r['visivel'] else 1] += 1
        if not r['visivel'] and g[k][2] is None:
            g[k][2] = (r['i'], r['txt'][:18], 'mudaram', r['mudaram'], 'com3', r['com3'], 'min', r['minimo'], (r.get('outline') or '')[:38])
    for k, v in sorted(g.items(), key=lambda kv: -kv[1][1]):
        print('  ok %3d  falha %3d | %s' % (v[0], v[1], k))
        if v[2]:
            print('        exemplo de falha:', v[2])


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args or '--help' in sys.argv or '-h' in sys.argv:
        print(__doc__.strip())
        sys.exit(0 if args or '--help' in sys.argv or '-h' in sys.argv else 2)
    maxf = 40
    if '--max' in sys.argv:
        maxf = int(sys.argv[sys.argv.index('--max') + 1])
        args = [a for a in args if a != str(maxf)]
    v = json.load(open(args[0], encoding='utf-8'))
    out = {}
    for k, p in v.get('passos', {}).items():
        if not (isinstance(p, dict) and 'pares' in p):
            continue
        idx = {x['i']: x for x in p['paradas'] if 'i' in x}
        res = []
        for par in p['pares']:
            m = medir(par)
            info = idx.get(par['i'], {})
            m.update({'i': par['i'], 'el': par['el'], 'txt': par['txt'], 'outline': info.get('outline'), 'cssContraste': info.get('outlineContraste'),
                      'coberto': info.get('coberto'), 'fv': info.get('fv'), 'a': par['a']})
            res.append(m)
        falhas = [r for r in res if not r.get('visivel')]
        out[k] = {'paradas': len(p['paradas']), 'medidas': len(res), 'visiveis': len(res) - len(falhas), 'falhas': falhas, 'todos': res}
        print('%s: %d paradas, %d medidas, %d sem indicador visível (>= 3:1)' % (k, len(p['paradas']), len(res), len(falhas)))
        if '--grupos' in sys.argv:
            grupos(res)
        else:
            for f in falhas[:maxf]:
                print('   FALHA', f['i'], f['el'][:70], '|', f['txt'], '| mudaram', f['mudaram'], 'com3', f['com3'], 'min', f['minimo'], '|', f['outline'], f['cssContraste'], '|', f['principais'][:2])
    if not out:
        print('nenhum passo com pares no JSON (o passo tab precisa de pares: true)')
    if len(args) > 1:
        json.dump(out, open(args[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
