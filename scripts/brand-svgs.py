"""Desenha os SVGs da marca Itinus em `public/brand/` (texto convertido em curvas).

Só é preciso rodar ao mudar o DESENHO; os PNGs saem de `npm run brand:assets`.
Requer `pip install fonttools` e a fonte variável Nunito (Google Fonts, OFL):

    python scripts/brand-svgs.py public/brand caminho/para/Nunito[wght].ttf
"""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
FONT = Path(sys.argv[2])

AMBER = "#c97f0a"
INK = "#26251f"
WHITE = "#ffffff"


def load(weight):
    return instancer.instantiateVariableFont(TTFont(FONT), {"wght": weight})


def text_path(font, text, size, x0=0.0, baseline=0.0, tracking=0.0, swap=None):
    """Devolve (d, largura, posições x de cada glifo) do texto em curvas."""
    swap = swap or {}
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    upm = font["head"].unitsPerEm
    scale = size / upm
    x = x0
    ink_right = x0
    parts, xs = [], []
    for ch in text:
        name = swap.get(ch) or cmap[ord(ch)]
        pen = SVGPathPen(gs)
        tpen = TransformPen(pen, (scale, 0, 0, -scale, x, baseline))
        gs[name].draw(tpen)
        bp = BoundsPen(gs)
        gs[name].draw(TransformPen(bp, (scale, 0, 0, scale, x, 0)))
        if bp.bounds:
            ink_right = bp.bounds[2]
        parts.append(pen.getCommands())
        xs.append((x, name))
        x += gs[name].width * scale + tracking
    return " ".join(parts), max(x - tracking, ink_right) - x0, xs


def glyph_bounds(font, name, size):
    gs = font.getGlyphSet()
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    s = size / font["head"].unitsPerEm
    xmin, ymin, xmax, ymax = bp.bounds
    return xmin * s, ymin * s, xmax * s, ymax * s


# ---------------------------------------------------------------- símbolo
# Um itinerário: três paradas ligadas por uma estrada que serpenteia e chega
# a um pino de destino. Desenhado numa grade 100x100.
def symbol_body(route, stop_fill, pin_hole):
    return f"""
  <path d="M17 86 H 48 C 62 86, 62 64, 48 64 H 34 C 20 64, 20 42, 34 42 H 46" fill="none" stroke="{route}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="17" cy="86" r="9" fill="{route}"/>
  <circle cx="17" cy="86" r="3.8" fill="{stop_fill}"/>
  <path d="M70 6 C 81.6 6, 90 14.4, 90 25.4 C 90 37.5, 77 48.5, 70 56 C 63 48.5, 50 37.5, 50 25.4 C 50 14.4, 58.4 6, 70 6 Z" fill="{route}"/>
  <circle cx="70" cy="25.4" r="7" fill="{pin_hole}"/>"""


def svg(w, h, body, title="Itinus", bg=None, vb=None):
    vb = vb or f"0 0 {w:g} {h:g}"
    rect = f'\n  <rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w:g}" height="{h:g}" role="img" aria-label="{title}">\n'
            f"  <title>{title}</title>{rect}{body}\n</svg>\n")


def write(name, content):
    (OUT / name).write_text(content)
    print("ok", name)


# símbolo solto (fundo transparente)
write("itinus-symbol.svg", svg(100, 100, symbol_body(AMBER, WHITE, WHITE)))
write("itinus-symbol-white.svg", svg(100, 100, symbol_body(WHITE, AMBER, AMBER)))


# ícone de app: fundo âmbar cheio, símbolo branco dentro da zona segura (80%)
def app_icon(radius, inset):
    s = (100 - 2 * inset) / 100
    body = (f'\n  <rect width="100" height="100" rx="{radius}" fill="{AMBER}"/>'
            f'\n  <g transform="translate({inset} {inset}) scale({s:.4f})">{symbol_body(WHITE, AMBER, AMBER)}\n  </g>')
    return svg(100, 100, body)


write("itinus-app-icon.svg", app_icon(22, 17))          # favicon/apple/pwa "any"
write("itinus-app-icon-maskable.svg", app_icon(0, 24))  # pwa maskable: sangra até a borda

# ---------------------------------------------------------------- nome
font = load(800)
SIZE = 100.0
# "itinus" em minúsculas: os pingos dos dois "i" viram paradas âmbar.
dotless = {"i": "idotless"} if "idotless" in font.getGlyphSet() else {"i": "dotlessi"}
d, width, xs = text_path(font, "itinus", SIZE, tracking=-1.5, swap=dotless)
xmin, ymin, xmax, ymax = glyph_bounds(font, dotless["i"], SIZE)
stem_w = xmax - xmin
dot_r = stem_w * 0.62
x_height = ymax
dot_cy = -(x_height + dot_r * 1.85)
dots = [x + (xmin + xmax) / 2 for (x, name) in xs if name == dotless["i"]]
top = dot_cy - dot_r
asc = -top


def wordmark_body(ink, dot, dx=0.0, dy=0.0):
    circles = "".join(f'\n  <circle cx="{cx + dx:.2f}" cy="{dot_cy + dy:.2f}" r="{dot_r:.2f}" fill="{dot}"/>' for cx in dots)
    return f'\n  <path transform="translate({dx:.2f} {dy:.2f})" d="{d}" fill="{ink}"/>{circles}'


W = width + 2
H = asc + 2
write("itinus-wordmark.svg", svg(W, H, wordmark_body(INK, AMBER, 1, asc + 1)))
write("itinus-wordmark-white.svg", svg(W, H, wordmark_body(WHITE, AMBER, 1, asc + 1)))

# ---------------------------------------------------------------- horizontal
# símbolo com a altura do conjunto; nome alinhado pela linha de base.
SYM = asc * 1.18
GAP = SYM * 0.16
tx = SYM + GAP
total_w = tx + width + 2
total_h = SYM
base = SYM * 0.5 + (asc) * 0.5 - 0  # centraliza a caixa [topo do pingo, base]


def horizontal(ink, route, stop, tagline=None, tag_ink=None):
    TAG = 30 if tagline else 0  # faixa da linha de apoio sob o nome
    h = max(SYM, asc + TAG)
    s = SYM / 100
    body = f'\n  <g transform="translate(0 {(h - SYM) / 2:.2f}) scale({s:.4f})">{symbol_body(route, stop, stop)}\n  </g>'
    by = (h - TAG + asc) / 2 if not tagline else (h - (asc + TAG)) / 2 + asc
    body += wordmark_body(ink, AMBER, tx, by)
    if tagline:
        tf = load(700)
        td, tw, _ = text_path(tf, tagline, 17, tracking=0)
        spacing = (width - tw) / (len(tagline) - 1)  # distribui até a largura do nome
        td, tw, _ = text_path(tf, tagline, 17, tracking=spacing)
        body += f'\n  <path transform="translate({tx:.2f} {by + 26:.2f})" d="{td}" fill="{tag_ink}"/>'
    return svg(total_w, h, body)


write("itinus-horizontal.svg", horizontal(INK, AMBER, WHITE))
write("itinus-horizontal-white.svg", horizontal(WHITE, WHITE, AMBER))
write("itinus-horizontal-tagline.svg", horizontal(INK, AMBER, WHITE, "GESTÃO COMERCIAL", "#6b6857"))
