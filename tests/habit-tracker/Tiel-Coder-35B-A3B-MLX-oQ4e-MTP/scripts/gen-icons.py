#!/usr/bin/env python3
"""Erzeugt einfache, gültige PNG-Icons für die Rhythm PWA (Ring-Motiv)."""
import struct
import zlib
import math

BG = (247, 246, 243, 255)        # warmer Bone-Hintergrund
RING = (181, 140, 106, 255)      # Terrakotta-Ring
RING_BG = (233, 229, 223, 255)   # dezenter Ring-Spur


def make(size):
    w = h = size
    cx = cy = (size - 1) / 2.0
    # Ring-Mittelpunktsradius und Stärke
    r = size * 0.30
    stroke = size * 0.11

    px = bytearray()
    for y in range(h):
        px.append(0)  # Filtertyp 0 (none) pro Zeile
        for x in range(w):
            # Hintergrund
            r_, g_, b_, a_ = BG
            dx = x + 0.5 - cx
            dy = y + 0.5 - cy
            dist = math.sqrt(dx * dx + dy * dy)
            # Dezente Spur des Rings
            if abs(dist - r) < stroke:
                r_, g_, b_, a_ = RING_BG
            # Hauptring: 270-Bogen (Lücke unten rechts)
            if abs(dist - r) < stroke / 2.0:
                ang = math.atan2(dy, dx)  # -pi..pi
                deg = math.degrees(ang)   # 0 rechts, 90 unten (screen-y)
                # Lücke zwischen -40 und 20 Grad (unten/rechts)
                if -45 <= deg <= 30:
                    r_, g_, b_, a_ = BG
                else:
                    r_, g_, b_, a_ = RING
            px.extend((r_, g_, b_, a_))

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return c + struct.pack(">I", crc)

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)  # 8-bit, RGBA
    idat = zlib.compress(bytes(px), 9)
    png = sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")
    return png


def main():
    import os
    out = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
    os.makedirs(out, exist_ok=True)
    for name, size in [
        ("icon-192.png", 192),
        ("icon-512.png", 512),
        ("icon-512-maskable.png", 512),
    ]:
        data = make(size)
        with open(os.path.join(out, name), "wb") as f:
            f.write(data)
        print(f"wrote {name} ({len(data)} bytes)")


if __name__ == "__main__":
    main()
