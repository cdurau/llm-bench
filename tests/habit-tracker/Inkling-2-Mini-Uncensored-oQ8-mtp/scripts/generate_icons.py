#!/usr/bin/env python3
"""Generate Rhythm PWA icons (PNG) with Pillow.

Design: warm charcoal rounded canvas, cream heartbeat pulse line,
terracotta beat marker. Rasterized at 4x then downscaled for AA.
"""
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
BG = (23, 22, 20, 255)          # #171614
CREAM = (244, 238, 227, 255)    # warm bone line
ACCENT = (214, 110, 66, 255)    # muted terracotta


def pulse_path(cx, cy, w, h):
    """Heartbeat polyline centered on (cx, cy)."""
    x0, x1 = cx - w / 2, cx + w / 2
    y0 = cy
    pts = [
        (x0, y0),
        (x0 + w * 0.30, y0),
        (x0 + w * 0.40, y0 - h * 0.58),   # tall peak
        (x0 + w * 0.54, y0 + h * 0.62),   # deep valley
        (x0 + w * 0.66, y0),
        (x1, y0),
    ]
    return pts


def draw_icon(size, rounded, maskable, out):
    scale = 4
    S = size * scale
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # background
    radius = int(S * 0.22) if rounded else 0
    if rounded:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=radius, fill=BG)
    else:
        d.rectangle([0, 0, S, S], fill=BG)

    # artwork: scale down for maskable safe zone
    pad = 0.70 if maskable else 0.78
    w = S * pad
    h = S * 0.34
    cx, cy = S / 2, S / 2 + S * 0.015
    pts = pulse_path(cx, cy, w, h)

    lw = int(S * 0.052)
    d.line(pts, fill=CREAM, width=lw, joint="curve")
    # round caps
    r = lw / 2
    for x, y in (pts[0], pts[-1]):
        d.ellipse([x - r, y - r, x + r, y + r], fill=CREAM)
    # accent dot at the tall peak (the heartbeat apex)
    px, py = pts[2]
    rr = int(S * 0.055)
    d.ellipse([px - rr, py - rr, px + rr, py + rr], fill=ACCENT)

    img = img.resize((size, size), Image.LANCZOS)
    img.save(out)


os.makedirs(OUT, exist_ok=True)
draw_icon(512, rounded=False, maskable=False, out=os.path.join(OUT, "icon-512.png"))
draw_icon(192, rounded=False, maskable=False, out=os.path.join(OUT, "icon-192.png"))
draw_icon(512, rounded=False, maskable=True, out=os.path.join(OUT, "icon-maskable-512.png"))
draw_icon(180, rounded=False, maskable=False, out=os.path.join(OUT, "apple-touch-icon.png"))
print("icons written")
