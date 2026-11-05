# Medir no navegador: os trechos de JavaScript

Trechos para colar no console da página (ou rodar pela ferramenta de JavaScript do navegador). Nenhum grava
nada: leem, ou mudam algo só na sua aba até recarregar. Todos devolvem números, booleanos e textos curtos,
sem `?`, `&` ou `=`, porque o filtro de saída da ferramenta bloqueia o que parece query string e a saída é
cortada perto de 1.000 caracteres (`ferramentas-de-navegador.md`). Rode cada um numa chamada separada. Os
que guardam um resultado grande (`window.__folhas`, `window.__a`, `window.__contraste`) devolvem só um
resumo: leia o resto em pedaços (`window.__contraste.slice(8, 16)`).

Os trechos que definem uma função (`window.quemPinta = function ...`) pedem duas coisas da ferramenta
(`primeiro-uso.md`, 1b): que ela aceite instruções, e que o que fica em `window` sobreviva até a chamada
seguinte (chamada 2). Numa ferramenta que só aceita expressão, embrulhe o trecho:
`(() => { <o trecho>; return 'ok'; })()`. Se o que fica em `window` não sobrevive, defina e use a função na
mesma chamada: `(() => { <o trecho>; return quemPinta('.botao', 'color'); })()`. Uma medida que depende do
código da página (as variáveis de um script do tema, por exemplo) também pede a chamada 4.

Para medir o computador numa aba que veio estreita, rode dentro de um `<iframe>` da largura certa
(`ferramentas-de-navegador.md`, seção 2) com `w.eval(codigo)`, e diga que o número veio de um `<iframe>`
(seção 6: ele pode não ser o de uma janela da mesma largura). Para medir o celular, use o HTML de celular
de verdade (`ajustes-visuais.md`, 4.2): janela estreita não é celular. Para saber a largura, o zoom e a
escala de quem aprova, seção 13.

## Sumário

1. Listar as folhas na ordem real (`folhasEmOrdem`)
2. Quem define esta propriedade neste elemento (`quemPinta`)
3. Bissecção: desligar folhas até o valor mudar (`bissecta`)
4. Achar o elemento pelo texto que a pessoa vê (`acharPorTexto`)
5. Variáveis CSS da loja (`variaveisCss`)
6. Rolagem lateral, e quem a causa
7. Área de clique (`zonasMortas`, `livre`)
8. Contraste WCAG (`contraste`)
9. Comparar dois estados (`foto`, `diferencas`) e a contraprova (`cssDaPrevia`)
10. Carrosséis parados
11. Espaço entre seções
12. Varredura de contraste: o texto que sumiu (`varreduraContraste`)
13. Como a pessoa vê: largura, zoom e `devicePixelRatio` (`comoAPessoaVe`)
14. Card que chega depois: o preço pula? (`guardarCardCru`, `puloDoCard`)
15. Deslocamento na carga (CLS) (`medirCLS`)

## 1. Listar as folhas na ordem real

A ordem da cascata **muda de uma família de tema para outra** (medido: `ajustes-visuais.md`, 1.1). Liste antes
de decidir onde a regra mora ou se ela precisa de mais especificidade, e anote no perfil ("Ordem da
cascata").

```js
// Folhas de estilo na ordem em que o navegador aplica (a última vence no empate).
// Ex.: folhasEmOrdem()   e, se a lista vier cortada, folhasEmOrdem(15, 30)
window.folhasEmOrdem = function (desde, ate) {
  var scss = -1, scssChars = -1, builder = -1, loja = [], foraDoHead = 0, todas = [];
  [].forEach.call(document.styleSheets, function (s, i) {
    var n = s.ownerNode, noHead = !!n.closest('head'), regras = -1;
    try { regras = s.cssRules.length; } catch (e) {}              // -1 = folha de outro domínio
    var chars = (n.textContent || '').length, href = n.getAttribute('href') || '';
    var lugar = s.href ? new URL(s.href).pathname.slice(-40)
      : '#' + (n.id || '') + ' ' + (n.closest('#area-body') ? 'bloco' : noHead ? 'head' : 'body');
    if (n.tagName === 'STYLE' && n.id === 'builder-custom-css') builder = i;
    else if (n.tagName === 'STYLE' && !n.id && noHead && chars > scssChars) { scss = i; scssChars = chars; }
    // arquivo da loja = <link> do <head> com caminho relativo ("/arquivo.css"), fora do tema ("/dist/")
    if (n.tagName === 'LINK' && noHead && /^\/(?!\/|dist\/)/.test(href)) loja.push(i);
    if (!noHead) foraDoHead++;
    todas.push([i, n.tagName === 'LINK' ? 'link' : 'style', lugar, regras, chars].concat(s.disabled ? ['desligada'] : []));
  });
  var depois = scss < 0 || !loja.length ? null : scss > loja[loja.length - 1] ? true : scss < loja[0] ? false : null;
  window.__folhas = todas;
  return {
    resumo: { scss: scss, scssChars: scssChars, builder: builder,
      linksDaLoja: loja.length ? [loja[0], loja[loja.length - 1]] : [], scssDepoisDosLinks: depois,
      veredito: scss < 0 ? 'nenhum style grande sem id no head' : !loja.length ? 'nenhum link da loja no head'
        : depois === true ? 'SCSS depois dos links da loja' : depois === false ? 'SCSS antes dos links da loja'
        : 'SCSS no meio dos links da loja: anote a posição exata',
      foraDoHead: foraDoHead, total: todas.length },
    folhas: todas.slice(desde || 0, ate || 15)
  };
};
```

Como ler:

- `folhas`: `[índice, tag, caminho ou lugar, número de regras (-1 = outro domínio), caracteres inline]`, mais
  `'desligada'` se for o caso. O índice é o mesmo que `quemPinta` e `bissecta` devolvem.
- `resumo.scss` é o **maior `<style>` sem id do `<head>`**: um palpite para o SCSS de Personalização. Confira
  pelo tamanho, que deve ser um pouco menor que o do campo no admin (sai compilado: medidos ~74 mil
  caracteres servidos para ~104 mil no admin numa loja, ~24 mil para ~34 mil noutra).
- `resumo.linksDaLoja`: o primeiro e o último `<link>` do `<head>` com caminho relativo (os Arquivos do Código
  dentro do `<head>`; o tema da família `/dist` fica de fora, e os do CDN da plataforma já são endereços
  completos).
- `scssDepoisDosLinks` e `veredito`: **`true` / "SCSS depois dos links da loja"** foi o medido na família
  `/dist` (o SCSS vence os arquivos da loja no empate); **`false` / "SCSS antes dos links da loja"**, na
  `modelo-1` (os arquivos da loja vencem). `null` quer dizer que falta uma das duas pontas, ou que o SCSS está
  no meio: leia a lista inteira e anote a posição.
- Rode na home e numa página que não é do construtor (sem `#builder-custom-css`, o resto da ordem aparece
  sozinho). O mesmo veredito sai do HTML baixado por `curl` (`reconhecimento-da-loja.md`, 2e).

## 2. Quem define esta propriedade neste elemento

Percorre todas as folhas (entrando em `@media` e `@supports` que valem agora, e em `@container` e `@layer`
sem avaliar a condição — confira a `condicao` devolvida), testa cada seletor com `matches()` e devolve todas
as regras que declaram a propriedade para o elemento. Use o nome **longo** da propriedade
(`background-color`, `margin-top`): o navegador expande os atalhos, então uma regra com `background:`
aparece quando você pergunta `background-color`.

```js
// Ex.: quemPinta('.product .tag-percentual-desconto', 'background-color')
window.quemPinta = function (seletor, prop, n) {
  var el = document.querySelectorAll(seletor)[n || 0];
  if (!el) return 'nenhum elemento com esse seletor';
  // pseudo-elementos e estados (:hover...) saem para o teste; a regra volta marcada com estado:true
  var limpa = function (s) {
    return s.replace(/::?(before|after|marker|placeholder|selection|first-line|first-letter)\b/g, '')
            .replace(/:(hover|focus-visible|focus-within|focus|active|visited)\b/g, '');
  };
  // divide a lista de seletores só nas vírgulas de fora de ( ), [ ] e aspas
  var partes = function (sel) {
    var out = [], prof = 0, aspa = '', ini = 0;
    for (var i = 0; i < sel.length; i++) {
      var c = sel.charAt(i);
      if (c === '\\') { i++; continue; }
      if (aspa) { if (c === aspa) aspa = ''; continue; }
      if (c === '"' || c === "'") aspa = c;
      else if (c === '(' || c === '[') prof++;
      else if (c === ')' || c === ']') prof--;
      else if (c === ',' && prof === 0) { out.push(sel.slice(ini, i)); ini = i + 1; }
    }
    out.push(sel.slice(ini));
    return out;
  };
  var semFiltro = function (s) { return String(s).replace(/[?&=]/g, '·').slice(0, 160); };
  var out = [];
  [].forEach.call(document.styleSheets, function (folha, i) {
    var regras; try { regras = folha.cssRules; } catch (e) { return; }
    (function anda(lista, cond) {
      [].forEach.call(lista, function (r) {
        if (r instanceof CSSStyleRule) {
          var v = r.style.getPropertyValue(prop);
          if (v) partes(r.selectorText).forEach(function (s) {
            var ok = false; try { ok = el.matches(limpa(s).trim() || '*'); } catch (e) {}
            if (ok) out.push({ folha: i, seletor: semFiltro(s.trim()), valor: semFiltro(v),
              important: r.style.getPropertyPriority(prop) === 'important', estado: s !== limpa(s), condicao: cond });
          });
        } else if (r.cssRules && !(r instanceof CSSKeyframesRule)) {
          var vale = r instanceof CSSMediaRule ? matchMedia(r.media.mediaText).matches
                   : r instanceof CSSSupportsRule ? CSS.supports(r.conditionText) : true;
          if (vale) anda(r.cssRules, (cond + ' ' + (r.conditionText || '')).trim());
        }
      });
    })(regras, '');
  });
  return { computado: semFiltro(getComputedStyle(el).getPropertyValue(prop)),
           inline: el.style.getPropertyValue(prop) || null, regras: out };
};
```

Leia o resultado assim: das regras sem `estado`, a vencedora é a de `!important` se houver; senão, a de maior
especificidade; no empate, a de maior número de `folha`. O índice de `folha` é o mesmo da lista da seção 1.
Um `inline` preenchido (atributo `style=""`, posto por script ou pelo servidor, como a cor das etiquetas do
admin numa loja da família `modelo-1`) vence toda regra sem `!important`. Limite: CSS aninhado nativo (regra
dentro de regra) não é percorrido. Quando a conta não fechar, faça a bissecção (seção 3): ela não depende de
calcular nada.

## 3. Bissecção: desligar folhas até o valor mudar

O jeito mais seguro de achar quem vence, porque pergunta ao navegador em vez de deduzir. Desliga uma folha por
vez (`disabled`, só nesta aba, nada é gravado), lê o computado e religa.

```js
// Ex.: bissecta('.inner-body > header', 'margin-top')
window.bissecta = function (seletor, prop, n) {
  var el = document.querySelectorAll(seletor)[n || 0];
  if (!el) return 'nenhum elemento';
  var base = getComputedStyle(el).getPropertyValue(prop), muda = [];
  [].forEach.call(document.styleSheets, function (f, i) {
    if (f.disabled) return;
    f.disabled = true;
    var v = getComputedStyle(el).getPropertyValue(prop);
    f.disabled = false;
    if (v !== base) muda.push([i, v.replace(/[?&=]/g, '·').slice(0, 80)]);
  });
  return { valor: base.replace(/[?&=]/g, '·').slice(0, 80), atributoStyle: !!el.style.getPropertyValue(prop), folhasQueMudam: muda };
};
```

Se nenhuma folha muda o valor e `atributoStyle` é `true`, o dono é o atributo `style` (um script, ou o
servidor). Se nada muda nada, o valor é o padrão do navegador ou vem por herança: rode no pai. O caso real
que só a bissecção resolveu está em `ajustes-visuais.md`, 1.3.

## 4. Achar o elemento pelo texto que a pessoa vê

A pessoa fala do que vê ("o botão Comprar", "o preço no Pix"); `quemPinta` e `bissecta` precisam de um
seletor. Este trecho devolve os elementos **visíveis** cujo texto próprio (ou `value`, ou `aria-label`)
contém o termo, com tag, id, classes, tamanho, se é clicável e três ancestrais. Rode nos dois aparelhos: o
HTML do celular é outro.

```js
// Ex.: acharPorTexto('Comprar')   acharPorTexto('pix', 15)
window.acharPorTexto = function (termo, max) {
  var t = String(termo).toLowerCase(), out = [];
  var desc = function (e) {
    var cls = e.className && e.className.baseVal != null ? e.className.baseVal : String(e.className || '');
    return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '')
      + cls.trim().split(/\s+/).filter(Boolean).slice(0, 6).map(function (c) { return '.' + c; }).join('');
  };
  [].forEach.call(document.querySelectorAll('body *'), function (e) {
    if (out.length >= (max || 10)) return;
    var r = e.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var proprio = [].map.call(e.childNodes, function (n) { return n.nodeType === 3 ? n.textContent : ''; }).join('');
    var rotulo = (proprio + ' ' + (e.getAttribute('value') || '') + ' ' + (e.getAttribute('aria-label') || '')).toLowerCase();
    if (rotulo.indexOf(t) < 0) return;
    var anc = [], p = e.parentElement;
    for (var i = 0; i < 3 && p && p !== document.body; i++, p = p.parentElement) anc.push(desc(p));
    out.push({ el: desc(e).replace(/[?&=]/g, '·'),
      clicavel: !!e.closest('a,button,[onclick],[ng-click],input[type=submit],input[type=button]'),
      tamanho: [Math.round(r.width), Math.round(r.height)], ancestrais: anc.map(function (a) { return a.replace(/[?&=]/g, '·'); }) });
  });
  return { largura: innerWidth, celular: document.body.classList.contains('isMobile'), achados: out };
};
```

Com o resultado: escolha o seletor mais estável (uma classe do tema, de preferência uma que o catálogo da
família já lista; não classe com hash, não `#block-…`), confira que ele casa com **um** elemento por página
(`document.querySelectorAll(SELETOR).length`) em mais de uma página do mesmo tipo, e só então passe a
`quemPinta`. Se o texto vier de um `::before` ou de uma imagem, ele não aparece aqui: procure pelo ancestral.
`clicavel: true` não garante teclado: um `<a>` sem `href` é clicável com o mouse e não recebe foco pelo Tab
(medido numa loja: `document.querySelectorAll('a:not([href])').length`).

## 5. Variáveis CSS da loja

Uma cor pode vir de uma variável da loja e não de uma regra que dê para achar por busca no arquivo (numa
loja medida, a cor do link era a `--primary-color`; noutra, de outra família, as cores do tema eram todas
variáveis `--color-*`, `--btn-*`, `--header-*`, `--footer-*`, redefinidas pelo SCSS de Personalização). Este
trecho lista as variáveis declaradas em `:root`, `html` ou `body`, com o valor computado agora:

```js
// Ex.: variaveisCss('color|cor|primary')
window.variaveisCss = function (filtro) {
  var nomes = {};
  [].forEach.call(document.styleSheets, function (f) {
    var regras; try { regras = f.cssRules; } catch (e) { return; }
    (function anda(lista) {
      [].forEach.call(lista, function (r) {
        if (r instanceof CSSStyleRule && /(^|,)\s*(:root|html|body)\b/.test(r.selectorText)) {
          for (var i = 0; i < r.style.length; i++) if (r.style[i].indexOf('--') === 0) nomes[r.style[i]] = 1;
        } else if (r.cssRules) anda(r.cssRules);
      });
    })(regras);
  });
  var cs = getComputedStyle(document.body), out = [];
  Object.keys(nomes).sort().forEach(function (n) {
    if (filtro && !new RegExp(filtro, 'i').test(n)) return;
    out.push([n, cs.getPropertyValue(n).trim().replace(/[?&=]/g, '·').slice(0, 60)]);
  });
  return { total: Object.keys(nomes).length, variaveis: out.slice(0, 40) };
};
```

Se a cor que a pessoa quer mudar é uma variável, mudar a variável muda o site inteiro onde ela é usada:
mostre isso na prévia, e veja antes se a tela de configuração tem uma opção para ela
(`ajustes-visuais.md`, 2.1). Anote no perfil as variáveis que importam. O valor devolvido é o do `body`: uma
variável redeclarada num elemento mais perto (num estado do cabeçalho, por exemplo) vale ali e não aparece
aqui. Para ela, leia no próprio elemento: `getComputedStyle(el).getPropertyValue('--nome')`.

## 6. Rolagem lateral, e quem a causa

**Meça primeiro sem a prévia**, em cada largura da matriz (`ajustes-visuais.md`, 4.1), e guarde o número no
perfil: rolagem lateral que já existe não é sua. Medido numa loja: um painel do tema causava ~30px de
rolagem entre 1280 e 1707px antes de qualquer mudança. Com a prévia ligada, compare com esse número: só a
diferença é da mudança. A que já existia vai para a pessoa como problema do site (`criterios-de-design.md`,
3).

```js
(() => {
  const vw = document.documentElement.clientWidth;
  const fora = [...document.querySelectorAll('body *')].filter(e => {
    const r = e.getBoundingClientRect();
    if (!r.width || (r.right <= vw + 1 && r.left >= -1)) return false;
    for (let p = e.parentElement; p && p !== document.body; p = p.parentElement)
      if (getComputedStyle(p).overflowX !== 'visible') return false;   // um ancestral corta: não rola
    return true;
  });
  return { meio: window.top === window ? 'janela' : 'iframe', innerWidth, scrollWidth: document.documentElement.scrollWidth,
           clientWidth: vw, rolagem: document.documentElement.scrollWidth - vw, culpados: fora.length,
           primeiros: fora.slice(0, 5).map(e => [e.tagName, e.id || '', String(e.className).slice(0, 40)]) };
})()
```

`rolagem` (`scrollWidth` menos `clientWidth`) maior que 0 é rolagem lateral. Use o `clientWidth`, não o
`innerWidth`: o `innerWidth` inclui a barra de rolagem vertical e esconde uma rolagem pequena. Carrosséis têm
itens fora da tela de propósito, dentro de um ancestral que corta: o filtro acima os ignora.

**Diga de onde veio o número.** Dentro de um `<iframe>` (o da largura certa, no topo deste arquivo), o trecho
mede o documento do `<iframe>`, e o número pode não ser o de uma janela de verdade da mesma largura. Medido
numa loja (2026-10, página do produto): 112px numa janela real de 1920px; 389px num `<iframe>` de 1366 e
560px num de 1024, sem calibrar (não se sabe quanto disso é da largura e quanto é do `<iframe>`). Então:

- rotule cada número com o meio e a largura: "janela de 1920" ou "`<iframe>` de 1366" (o campo `meio`);
- compare a linha de base e a prévia só no mesmo meio e na mesma largura;
- uma vez por loja, calibre: meça o `<iframe>` e uma janela de verdade da mesma largura (o preset do painel
  do aplicativo, ou um print da pessoa) e anote os dois no perfil.

## 7. Área de clique (`elementFromPoint`)

Mostra o que realmente recebe o clique num ponto, inclusive algo por cima. Dois usos medidos: cards em que só
a foto e o nome eram link (156 de 372 linhas do card não abriam o produto, no computador) e o botão flutuante
do WhatsApp cobrindo o "aceito" dos cookies em 1280px (2 de 5 pontos caíam nele).

```js
// Linhas de um card que não caem num link dele (3 pontos por linha). O card tem de estar na tela.
window.zonasMortas = function (card) {
  card.scrollIntoView({ block: 'center' });
  var r = card.getBoundingClientRect(), mortas = 0, linhas = 0;
  for (var y = Math.ceil(r.top) + 1; y < r.bottom - 1; y++) {
    linhas++;
    if ([0.2, 0.5, 0.8].some(function (f) {
      var el = document.elementFromPoint(r.left + r.width * f, y);
      return !(el && card.contains(el) && el.closest('a'));
    })) mortas++;
  }
  return [linhas, mortas];
};
// Os 4 cantos e o meio de um botão caem nele mesmo? (false = alguma coisa está por cima)
window.livre = function (btn) {
  var b = btn.getBoundingClientRect();
  return [[b.left + 2, b.top + 2], [b.right - 2, b.top + 2], [b.left + 2, b.bottom - 2], [b.right - 2, b.bottom - 2],
          [(b.left + b.right) / 2, (b.top + b.bottom) / 2]].map(function (p) {
    var e = document.elementFromPoint(p[0], p[1]); return !!e && (e === btn || btn.contains(e));
  });
};
```

`zonasMortas` procura `<a>`. Num card que abre o produto por `onclick` no próprio card (medido numa loja da
família `modelo-1`), ele conta como morto o que o mouse abre: confira o `onclick` antes de concluir, e lembre
que `onclick` não abre pelo teclado.

## 8. Contraste (WCAG)

Entre o texto e o fundo que de fato está atrás dele, compondo fundos semitransparentes:

```js
window.contraste = function (el) {
  var rgb = function (s) { var m = s.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  var lum = function (c) { return [c.r, c.g, c.b].map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
                                   .reduce(function (s, v, i) { return s + v * [0.2126, 0.7152, 0.0722][i]; }, 0); };
  var junta = function (c, f) { return { r: c.r * c.a + f.r * (1 - c.a), g: c.g * c.a + f.g * (1 - c.a), b: c.b * c.a + f.b * (1 - c.a) }; };
  var camadas = [];
  for (var p = el; p; p = p.parentElement) {
    var cs = getComputedStyle(p);
    if (cs.backgroundImage !== 'none') return 'fundo com imagem ou gradiente: meça no screenshot';
    var b = rgb(cs.backgroundColor); if (b.a > 0) camadas.push(b); if (b.a >= 0.999) break;
  }
  var f = { r: 255, g: 255, b: 255 };
  for (var i = camadas.length - 1; i >= 0; i--) f = junta(camadas[i], f);
  var t = rgb(getComputedStyle(el).color); t = junta(t, f);
  var a = lum(t), c = lum(f);
  return Math.round((Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05) * 100) / 100;
};
```

Mede só ancestrais: texto posicionado por cima de uma foto ou de outro bloco que não é pai dele, meça no
screenshot. Meça todo texto cuja cor **ou** cujo fundo muda, inclusive um elemento levado para outro fundo, e
diga os números à pessoa; os mínimos (4,5:1, 3:1 para texto grande, e quando uma borda conta) estão em
`criterios-de-design.md`, 2. Para varrer a página inteira de uma vez, seção 12.

## 9. Comparar dois estados

Com e sem a classe, com e sem a prévia, com e sem uma das duas peças de uma mudança em CSS e JS
(`ajustes-visuais.md`, 2.6, item g). Tire uma foto do estilo computado, mude o estado, tire outra, compare.
Antes, tire duas fotos seguidas **sem mudar nada**: se der diferença, há ruído (carrossel andando, imagem
carregando) — pare o autoplay (seção 10) e espere as imagens.

A foto guarda o estilo **por elemento**, não pela posição na página: o mesmo elemento é comparado nos dois
estados, e um nó que um JS move ou insere não desloca a comparação dos outros. Medido numa loja (2026-10),
com a versão antiga, que comparava por posição: um JS que movia um nó só deu 2.653 diferenças falsas, e uma
foto tirada com a página ainda carregando deu 2.740. Por isso a `foto()` devolve um texto, em vez da foto,
enquanto a página carrega ou enquanto uma folha de estilo ligada ainda não tem `.sheet` (uma folha que acabou
de ser religada: espere 2 s). E deixa de fora os nós das ferramentas: ids e `aria-label` que começam por
`__` (as entradas de arquivo e as marcas desta skill), o `<iframe id="teste">`
(`ferramentas-de-navegador.md`, 2), o `<style>` e o aviso da prévia (`data-previa`, `data-previa-aviso`) e
a cópia do `puloDoCard` (`data-pulo-do-card`, seção 14).

```js
// Foto do estilo computado de cada elemento do <body>, guardada por ELEMENTO (um Map).
// Ex.: window.__a = foto(), window.__a.size || window.__a     (um texto no lugar do número: leia e tire de novo)
//      foto(true) fotografa mesmo assim (uma folha que nunca carrega, um 404, ou uma página que não termina)
window.foto = function (mesmoAssim) {
  var limpa = function (s) { return String(s).replace(/[?&=]/g, '·'); };
  if (!mesmoAssim) {
    if (document.readyState !== 'complete') return 'a página ainda carrega (' + document.readyState + '): espere e tire de novo';
    var pendentes = [].filter.call(document.querySelectorAll('link[rel~="stylesheet"]'), function (l) { return !l.disabled && !l.sheet; });
    if (pendentes.length) return pendentes.length + ' folha(s) ligada(s) ainda sem .sheet (acabou de ser religada): '
      + pendentes.slice(0, 3).map(function (l) { return limpa((l.getAttribute('href') || '').split('?')[0].slice(-40)); }).join(' ')
      + ' : espere 2 s e tire de novo';
  }
  var daFerramenta = function (e) {
    for (; e && e !== document.body; e = e.parentElement) {
      var id = e.id || '', rotulo = e.getAttribute('aria-label') || '';
      if (id.indexOf('__') === 0 || rotulo.indexOf('__') === 0 || id === 'teste' || e.hasAttribute('data-previa')
          || e.hasAttribute('data-previa-aviso') || e.hasAttribute('data-pulo-do-card')) return true;
    }
    return false;
  };
  var props = ['color', 'background-color', 'font-size', 'font-weight', 'line-height', 'margin-top', 'margin-bottom',
               'padding-top', 'padding-bottom', 'display', 'position', 'width', 'height', 'opacity', 'border-top-color'];
  var m = new Map();
  [].forEach.call(document.querySelectorAll('body *'), function (e) {
    if (daFerramenta(e)) return;
    var cs = getComputedStyle(e);
    m.set(e, props.map(function (p) { return cs.getPropertyValue(p); }).join('|'));
  });
  return m;
};
// mudaram: o mesmo elemento com estilo diferente. sumiram e novos: elementos que estão só numa das fotos.
// Ex.: diferencas(__a, __b)   diferencas(__a, __b, 10) para até 10 exemplos de cada
window.diferencas = function (a, b, max) {
  if (!(a instanceof Map) || !(b instanceof Map)) return 'uma das fotos é um texto (a foto recusou): leia, espere e tire de novo';
  max = max || 5;
  var desc = function (e) {
    var cls = e.className && e.className.baseVal != null ? e.className.baseVal : String(e.className || '');
    return (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '')
      + cls.trim().split(/\s+/).filter(Boolean).slice(0, 3).map(function (c) { return '.' + c; }).join(''))
      .replace(/[?&=]/g, '·').slice(0, 60);
  };
  var r = { mudaram: 0, sumiram: 0, novos: 0, exemplos: { mudaram: [], sumiram: [], novos: [] } };
  var conta = function (tipo, e) { r[tipo]++; if (r.exemplos[tipo].length < max) r.exemplos[tipo].push(desc(e)); };
  a.forEach(function (v, e) { if (!b.has(e)) conta('sumiram', e); else if (b.get(e) !== v) conta('mudaram', e); });
  b.forEach(function (v, e) { if (!a.has(e)) conta('novos', e); });
  return r;
};
```

Como ler:

- `mudaram` tem de dar **0** nos testes de "nada mudou" (sem a classe, uma página que não devia mudar, cada
  peça sozinha: `ajustes-visuais.md`, 4.1). Num antes e depois da própria mudança, ele conta o que ela
  mexeu, inclusive os vizinhos que andaram (a caixa do preço que ficou mais alta).
- `novos` e `sumiram` são elementos que estão só numa das fotos. Explique cada um pelos `exemplos` antes de
  seguir. A caixa que um JS seu cria aparece em `novos`. Um nó que ele **move** continua o mesmo elemento: não
  aparece aqui, e em `mudaram` no máximo uma vez, se o estilo dele mudou com o lugar novo. Nós que uma
  extensão do navegador põe no fim do `<body>` também aparecem em `novos`, se chegam entre as duas fotos
  (medido numa loja: 15 nós da extensão do Claude para Chrome). Itens que o carrossel recria aparecem em
  `sumiram` e em `novos`: pare o autoplay (seção 10).
- A foto fica na janela da aba (`window.__a`) até recarregar. Recarregou: tire as duas de novo.

### Contraprova: a diferença veio do CSS ou do JS da prévia?

A prévia pode fazer mais do que injetar CSS: o `--js` mexe no DOM, e o `--resize` faz carrosséis e outros
componentes se medirem de novo (medido numa loja: uma vitrine mudou 112px de altura, e o primeiro teste de
"0 diferenças" deu 7 diferenças que não eram do CSS). **Diferença inesperada no teste de 0 diferenças: faça
a contraprova antes de mexer no CSS.**

```js
// Contraprova: liga e desliga só o CSS da prévia (o JS dela, e o resize, continuam feitos).
// id: o --id do gerar_previa.py (padrão previa-claude). Religa o que a prévia tinha desligado (--substitui).
// Mexe na FOLHA de um <link> (sheet.disabled), não no elemento: desligar e religar o elemento faz o navegador
// buscar a folha de novo, e por um instante ela fica sem .sheet (medido: 287 diferenças falsas logo depois, 0 em 2 s).
window.cssDaPrevia = function (ligado, id) {
  id = id || 'previa-claude';
  var s = document.getElementById(id), esperar = 0;
  if (!s || s.tagName !== 'STYLE') return 'não achei o style ' + id + ': a prévia está ligada nesta aba';
  s.disabled = !ligado;                                   // num <style>, é o mesmo que s.sheet.disabled
  [].forEach.call(document.querySelectorAll('[data-previa-desligado="' + id + '"]'), function (l) {
    if (l.tagName === 'LINK' && l.disabled) {             // favorito antigo: desligou o elemento, e a folha saiu
      if (!ligado) { l.disabled = false; esperar++; }
      return;
    }
    if (l.sheet) l.sheet.disabled = !!ligado; else esperar++;
  });
  return (ligado ? 'CSS da prévia ligado' : 'CSS da prévia desligado; o JS dela continua')
    + (esperar ? '. ' + esperar + ' folha(s) recarregando: espere 2 s antes da foto' : '');
};
```

1. Sem a prévia: `window.__a = foto(), window.__a.size || window.__a`.
2. Ligue a prévia (o favorito, ou o `.js` legível do gerador): `window.__b = foto(), window.__b.size || window.__b`.
3. `cssDaPrevia(false)`, espere se ela pedir, e `window.__c = foto(), window.__c.size || window.__c`; depois
   `cssDaPrevia(true)`. Se a prévia usa `--resize`, dispare o mesmo `resize` depois de cada troca
   (`window.dispatchEvent(new Event('resize'))`) e espere um segundo antes da foto.
4. `diferencas(__c, __b)` são as do **CSS**; `diferencas(__a, __c)` são as do **JS ou do resize**, não do
   CSS. No modo de época, sem a classe no `<body>`, as do CSS têm de dar `mudaram: 0`, `novos: 0` e
   `sumiram: 0`; as outras, explique antes de seguir (o JS de uma barra que monta só com a classe não deveria
   deixar nenhuma).

Com um favorito gerado antes de 2026-10-22 (ele desligava o elemento do `<link>`), a contraprova pede para
esperar ao religar; no fim, recarregue a página, que desfaz tudo. Depois de desligar uma prévia `--substitui`
desse favorito antigo, espere 2 s antes da foto: a `foto()` recusa enquanto a folha não volta.

## 10. Carrosséis parados

Owl Carousel (*plataforma*: o `owlCarousel` vem do `platform.<hash>.js`, nas duas famílias medidas; confira):
parar o autoplay antes de medir e de fotografar, e ler a configuração de cada um.

```js
jQuery('.owl-carousel').trigger('stop.owl.autoplay');
jQuery('.owl-carousel').map(function () {
  var o = jQuery(this).data('owl.carousel'), b = this.closest('[id^=block-]');
  return o ? [[b ? b.id : '', !!o.settings.autoplay, o.settings.autoplayTimeout, !!o.settings.loop]] : null;
}).get()
```

## 11. Espaço entre seções

Meça do fim do que **se vê** numa seção (texto, foto, faixa de fundo) ao começo do que se vê na seguinte,
não de caixa a caixa: margens se juntam (colapsam), padding transparente não se vê e bolinhas de carrossel
ficam `position:absolute` alguns pixels para fora. Foi esse critério que mostrou espaços de 15 a 130px entre
seções numa home que "parecia" regular.

## 12. Varredura de contraste: o texto que sumiu

Num tema que muda o fundo ou a cor do texto (fundo escuro, sobretudo), o defeito mais provável é a **cor
herdada**: caixas brancas do tema sem cor de texto própria herdam o texto claro e o texto some. Medido numa
loja, com uma prévia de fundo escuro: os balões de validação `.validatorLog` (criados pelo JS da plataforma),
as linhas alternadas da lista de avaliações da loja, as faixas do acompanhamento de pedido e a consulta
avulsa de pedido. Nenhuma estava nas páginas baixadas no reconhecimento: só apareceram procurando. Este
trecho varre todos os elementos visíveis com texto próprio e devolve os que ficam abaixo do mínimo.

```js
// Ex.: varreduraContraste()   varreduraContraste(4.5, 8)   e depois window.__contraste.slice(8, 16)
// Precisa do contraste() da seção 8 rodado antes nesta aba.
window.varreduraContraste = function (min, max) {
  if (typeof window.contraste !== 'function') return 'rode antes o trecho da seção 8 (contraste)';
  min = min || 4.5; max = max || 8;
  var desc = function (e) {
    var cls = e.className && e.className.baseVal != null ? e.className.baseVal : String(e.className || '');
    return (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '')
      + cls.trim().split(/\s+/).filter(Boolean).slice(0, 3).map(function (c) { return '.' + c; }).join(''))
      .replace(/[?&=]/g, '·').slice(0, 60);
  };
  var verificados = 0, comImagem = 0, abaixo = [];
  [].forEach.call(document.querySelectorAll('body *'), function (e) {
    if (/^(script|style|noscript|template|option)$/i.test(e.tagName)) return;
    var temTexto = [].some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
    if (!temTexto) return;
    var r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    if (!r.width || !r.height || cs.visibility === 'hidden') return;
    if (e.checkVisibility && !e.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return;
    verificados++;
    var c = window.contraste(e);
    if (typeof c !== 'number') { comImagem++; return; }
    var px = parseFloat(cs.fontSize), grande = px >= 24 || (parseInt(cs.fontWeight, 10) >= 700 && px >= 18.66);
    if (c < (grande ? Math.min(min, 3) : min)) abaixo.push([desc(e), c, [Math.round(r.width), Math.round(r.height)]]);
  });
  abaixo.sort(function (a, b) { return a[1] - b[1]; });
  window.__contraste = abaixo;
  return { verificados: verificados, comImagem: comImagem, abaixoDoMinimo: abaixo.length, piores: abaixo.slice(0, max) };
};
```

Como ler: `piores` traz `[elemento, razão, [largura, altura]]`, do pior para o melhor, até `max` itens; o
resto está em `window.__contraste`. O mínimo é 4,5:1 (texto normal) e 3:1 para texto grande (24px, ou
18,66px em negrito), como em `criterios-de-design.md`, 2. `comImagem` conta os textos sobre imagem ou
degradê, que o trecho não sabe medir: veja esses no print.

**Quando rodar:** com a prévia ligada, em cada tipo de página e em cada estado, porque elemento escondido
(tamanho zero) não entra na conta:

- formulário enviado com erro (cadastro, contato, CEP do produto), para os balões de validação aparecerem;
- menus e gavetas abertos (menu lateral do celular, painel da sacola, filtros), sugestões da busca abertas,
  pop-ups e avisos de cookies e do app (aba anônima);
- páginas que o reconhecimento não baixou: conta (logada: peça à pessoa que entre; você não digita senha),
  acompanhamento e consulta de pedido, avaliações da loja, institucionais, carrinho (se for do tema);
- num tema que muda cor, cada estado da lista de `temas-sazonais.md`, 12, passo 10, um por um: o que fica
  dentro do `<header>` (a gaveta da sacola, os termos mais buscados) herda a cor do cabeçalho. A sacola com
  produto muda a sessão de quem está no site: siga `previa.md`, "Conferir você mesmo antes de mandar".

Para cada achado, `quemPinta` (seção 2) no elemento mostra de onde vem o fundo e a cor; a correção é dar
cor de texto própria à caixa, não escurecer o fundo dela sem a pessoa ver. O roteiro do fundo escuro está em
`temas-sazonais.md`, 12, e as caixas brancas já conhecidas de cada família no catálogo dela (seções 14 e,
na `modelo-1`, 15).

## 13. Como a pessoa vê: largura, zoom e `devicePixelRatio`

O layout segue a largura da janela em px CSS; o desenho das letras segue os px reais da tela. Os dois mudam
com o zoom do navegador e com a escala da tela, e o Chrome guarda o zoom por site e por perfil
(`ferramentas-de-navegador.md`, 2). Medido numa loja (2026-10-21): o Chrome de quem aprovava estava com 90%
de zoom no site, numa tela de 1920px, e a janela tinha ~2.133px CSS (`innerWidth`) e `devicePixelRatio` 0,9.
Com isso, uma regra do SCSS da loja "a partir de 1.750px" valia e o menu ficava numa linha só, o que nenhum
print de 1440px mostrava; e um defeito de acento em fonte de título só apareceu nessa configuração
(`catalogo-tema-base.md`, 14). Rode o trecho na aba que mostra o site como a pessoa vê (com a extensão do
Claude para Chrome, a aba que você abre no Chrome dela herda o zoom que ela usa naquele site) e anote o
resultado no perfil, uma vez por loja e por pessoa.

```js
// Ex.: comoAPessoaVe()   comoAPessoaVe([1024, 1200, 1440, 1750])
window.comoAPessoaVe = function (larguras) {
  larguras = larguras || [1024, 1200, 1440, 1750];
  var dpr = window.devicePixelRatio || 1;
  return {
    innerWidth: innerWidth, clientWidth: document.documentElement.clientWidth, outerWidth: outerWidth,
    dpr: Math.round(dpr * 1000) / 1000,
    zoomAprox: Math.round(outerWidth / innerWidth * 100) / 100,      // aproximado: bordas e painéis laterais contam
    tela: [screen.width, screen.height],
    celular: document.body.classList.contains('isMobile'),
    // quais @media (min-width) valem agora, na largura em px CSS desta janela
    consultas: larguras.map(function (w) { return [w, matchMedia('(min-width: ' + w + 'px)').matches]; })
  };
};
```

Como ler:

- **px reais = px CSS × `dpr`.** Um título de 53px com `dpr` 0,9 tem ~48px reais. O `dpr` junta a escala da
  tela no sistema (um notebook em 125% dá 1,25 com o zoom em 100%) e o zoom do navegador naquele site (90%
  numa tela em 100% dá 0,9).
- `zoomAprox` (`outerWidth / innerWidth`) separa, por aproximação, o zoom do navegador da escala da tela: ~1
  é zoom em 100%, ~0,9 é 90%. Bordas da janela e painéis laterais (o DevTools, o painel da extensão) mexem
  nele, e ele não foi medido contra um zoom conhecido: confirme com a pessoa (no Chrome, aparece uma lupa na
  barra de endereço quando o zoom do site não está em 100%).
- `consultas`: para cada largura pedida, se um `@media (min-width: …)` dessa largura vale agora. Passe as
  larguras das regras do tema (as do SCSS de Personalização, por exemplo) e as da sua mudança.
- `celular`: se a página é o HTML de celular (`isMobile`). Zoom não transforma computador em celular: o
  servidor decide pelo User-Agent (`ajustes-visuais.md`, 2.3).
- O trecho só diz algo de quem aprova se rodar no navegador dela. No painel do aplicativo (outro navegador,
  sem o zoom dela), ele mede o painel: pergunte a ela, ou peça um print.
- Um `<iframe>` com a largura em px CSS dela, na mesma origem (`ferramentas-de-navegador.md`, 2), mostra o
  layout que ela vê, mas não o desenho das letras: numa aba sua com `dpr` 1, um título de 53px sai com 53px
  reais, e o defeito de acento que ela vê com ~48px reais não aparece. Para esse, vale o print da aba dela, ou
  um print feito por ela.

## 14. Card que chega depois: o preço pula?

Um JS que mexe nos cards (preço maior, "R$" menor num `<span>`, um selo) trata os cards que já estão na
página quando liga; os que chegam depois (vitrines por XHR, cópias do Owl) dependem de um observador
(`ajustes-visuais.md`, 2.6). Se ele age depois da primeira pintura, o visitante vê o card com o preço do CSS e
depois vê o preço pular. Medido numa loja (2026-10), com o JS agendado por um `setTimeout` de 120 ms: num
card posto numa lista de campanha, 28px em 0 ms, no quadro seguinte e em 60 ms, e 31,1px em ~300 ms (a
largura do preço foi de 139 para 133px); numa vitrine da home, de 28 para 38px.

Os dois trechos abaixo repetem isso **só na sua aba**: o primeiro guarda uma cópia crua de um card, com a
prévia desligada; o segundo, com a prévia ligada, põe a cópia na lista (como um card que chega por XHR), lê
o tamanho e a largura do preço em 0 ms, no quadro seguinte, em 60 ms e em 300 ms, e tira a cópia. Nada é
gravado, e a sacola e a sessão de ninguém mudam.

```js
// 1) Com a prévia (ou o JS novo) DESLIGADA: guarda uma cópia crua de um card, como o servidor manda.
//    Ex.: guardarCardCru('.pl-modelo-default .product')   numa página de lista (família modelo-1);
//         na família /dist, '.product-list .product' (catálogo da família, 3 e 4)
window.guardarCardCru = function (seletorCard, n) {
  var card = document.querySelectorAll(seletorCard)[n || 0];
  if (!card) return 'nenhum card com esse seletor';
  window.__cardCru = { copia: card.cloneNode(true), seletor: seletorCard, n: n || 0 };
  return 'cópia guardada: ligue a prévia e rode puloDoCard';
};
// 2) Com a prévia LIGADA e a aba na frente: põe a cópia crua ao lado do original (como um card que chega
//    por XHR), lê o tamanho e a largura do preço em quatro momentos e tira a cópia.
//    Ex.: await puloDoCard('.price-sale')
window.puloDoCard = function (seletorPreco) {
  var g = window.__cardCru, card = g && document.querySelectorAll(g.seletor)[g.n];
  if (!g) return 'rode antes guardarCardCru, com a prévia desligada';
  if (!card) return 'o card original sumiu: rode guardarCardCru de novo';
  var clone = g.copia.cloneNode(true), t0 = performance.now(), amostras = [];
  clone.setAttribute('data-pulo-do-card', '');
  var mede = function (quando) {
    var p = clone.querySelector(seletorPreco), r = p && p.getBoundingClientRect();
    amostras.push([quando, Math.round(performance.now() - t0),
      p ? parseFloat(getComputedStyle(p).fontSize) : -1, p ? Math.round(r.width * 10) / 10 : -1]);
  };
  card.after(clone);
  mede('0ms');                                     // só o CSS: este estado nunca chega a ser pintado
  return new Promise(function (fim) {
    var acabou = false;
    var termina = function (aviso) {
      if (acabou) return;
      acabou = true;
      clone.remove();
      var q = amostras[1], f = amostras[amostras.length - 1];
      fim({ amostras: amostras,
            pula: aviso ? null : q[2] !== f[2] || Math.abs(q[3] - f[3]) > 1,
            restos: document.querySelectorAll('[data-pulo-do-card]').length, aviso: aviso || '' });
    };
    setTimeout(function () { termina('o quadro não veio em 2 s: traga a aba para a frente e repita'); }, 2000);
    // esta microtarefa entra na fila depois da do observador do tema (a inserção veio antes):
    // o quadro é lido depois do que o observador agendou, e antes da pintura
    Promise.resolve().then(function () {
      requestAnimationFrame(function () {
        mede('quadro');                            // o que o visitante vê primeiro
        setTimeout(function () {
          mede('60ms');
          setTimeout(function () { mede('300ms'); termina(); }, 240);
        }, 60);
      });
    });
  });
};
```

Como ler:

- `amostras`: `[momento, ms desde a inserção, font-size em px, largura em px]`; -1 quer dizer que o preço não
  estava no card naquele momento (o JS trocou o elemento).
- `0ms` é o card só com o CSS, antes de qualquer JS, e nunca é pintado. O que o visitante vê primeiro é o
  `quadro`: lido no quadro seguinte, depois do que um `MutationObserver` do tema agendou ao ver o card
  chegar, e antes da pintura.
- `pula: true`: o `quadro` e os `300ms` diferem (no tamanho, ou em mais de 1px de largura), e o visitante vê o
  preço mudar. Com o agendamento por `requestAnimationFrame` (`ajustes-visuais.md`, 2.6, item b), o `quadro`
  já deve vir com o valor final; confira com o trecho (na loja medida, o agendamento foi trocado, mas o pulo
  não foi medido de novo depois da troca).
- `pula: null` com `aviso`: o quadro não veio, porque a aba estava em segundo plano, onde
  `requestAnimationFrame` não roda (`ferramentas-de-navegador.md`, 2). Traga a aba para a frente e repita.
- `restos` tem de ser 0: a cópia saiu.
- A cópia crua é guardada **com a prévia desligada** porque um card já tratado traz as marcas do JS ("já está
  certo: não mexe") e não pularia nunca.
- Rode numa página de lista (categoria ou campanha), onde a grade é simples. Numa vitrine com carrossel, a
  cópia entra dentro do item do carrossel, e a largura medida pode não ser a de um card de verdade.

## 15. Deslocamento na carga (CLS)

A prévia entra com a página pronta e não mostra a primeira pintura (`ajustes-visuais.md`, 3.4). Uma reserva
de espaço, uma classe posta no `<html>` antes da pintura ou um JS que leva um elemento para outro lugar
(`ajustes-visuais.md`, 2.6, itens f e g) só se medem numa carga de verdade. Este trecho soma os
deslocamentos de layout que o navegador registrou desde a carga (o `buffered` traz os que vieram antes de
você rodar) e mais `ms` milissegundos, sem contar os que vêm logo depois de um clique ou toque
(`hadRecentInput`), e diz quais elementos mais se mexeram. Só o Chrome e os navegadores derivados dele
registram `layout-shift`.

```js
// Ex.: await medirCLS()   await medirCLS(5000) numa página lenta
window.medirCLS = function (ms) {
  var PO = window.PerformanceObserver;
  if (!PO || (PO.supportedEntryTypes || []).indexOf('layout-shift') < 0) return 'este navegador não registra layout-shift: use o Chrome';
  var desc = function (n) {
    var e = n && n.nodeType === 1 ? n : n && n.parentElement;
    if (!e) return '(nó que já saiu da página)';
    var cls = e.className && e.className.baseVal != null ? e.className.baseVal : String(e.className || '');
    return (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '')
      + cls.trim().split(/\s+/).filter(Boolean).slice(0, 3).map(function (c) { return '.' + c; }).join(''))
      .replace(/[?&=]/g, '·').slice(0, 60);
  };
  var soma = 0, mudancas = 0, porFonte = {};
  var anota = function (lista) {
    lista.forEach(function (en) {
      if (en.hadRecentInput) return;                       // logo depois de um clique ou toque: não conta
      soma += en.value; mudancas++;
      (en.sources || []).forEach(function (s) { var d = desc(s.node); porFonte[d] = (porFonte[d] || 0) + en.value; });
    });
  };
  return new Promise(function (fim) {
    var po = new PO(function (l) { anota(l.getEntries()); });
    po.observe({ type: 'layout-shift', buffered: true });
    setTimeout(function () {
      anota(po.takeRecords ? po.takeRecords() : []);
      po.disconnect();
      var r3 = function (x) { return Math.round(x * 1000) / 1000; };
      fim({ cls: r3(soma), mudancas: mudancas,
            fontes: Object.keys(porFonte).sort(function (x, y) { return porFonte[y] - porFonte[x]; }).slice(0, 5)
              .map(function (k) { return [k, r3(porFonte[k])]; }),
            largura: innerWidth, celular: document.body.classList.contains('isMobile') });
    }, ms || 3000);
  });
};
```

Como medir:

1. **Uma carga nova.** Abra a página com `?nc=` e um número novo (a página não vem do cache:
   `ajustes-visuais.md`, 5.4), com a aba **na frente**: numa aba em segundo plano o navegador não pinta, e não
   há deslocamento para registrar (`ferramentas-de-navegador.md`, 2). Não role nem clique antes de medir: o
   que a rolagem carrega também mexe na página.
2. **Rode `await medirCLS()`** logo depois da carga, no computador e no celular (HTML de celular de verdade:
   `celular: true`), em cada página que a mudança toca, e repita duas ou três vezes: o número varia com a
   rede (a vitrine que chega por XHR, a fonte que carrega).
3. **Antes e depois.** O antes é o site sem a mudança: a linha de base, anotada no perfil com a data, a
   página e o aparelho. O depois é com a mudança no ar, ou num render local de uma cópia do HTML com os
   arquivos novos na mesma posição do `<head>` (`ferramentas-de-navegador.md`, 4). O favorito de prévia não
   serve para isto: ele entra depois da primeira pintura.

Como ler:

- `cls` é a soma dos deslocamentos. O "bom" do Google é até 0,1 para a visita inteira; o Google conta a pior
  janela de 5 s, e a soma dá igual ou mais, o que basta para comparar antes e depois. A meta da sua mudança:
  **nenhum deslocamento a mais** do que a linha de base, na mesma página, no mesmo aparelho e na mesma
  largura.
- `fontes`: os elementos que mais se mexeram, `[elemento, soma]`. O que já se mexia antes (uma vitrine que
  chega por XHR, catálogo da família, 7) não é seu: vai para a pessoa como problema do site
  (`criterios-de-design.md`, 3).
- Trecho novo (2026-10), testado fora do navegador e ainda não rodado numa loja: na primeira vez, anote no
  perfil o resultado junto com o que você viu na tela (pulou ou não pulou).
