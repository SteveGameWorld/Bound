#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Split a 10x10 thumbnail sprite sheet PNG into 100 JPGs named 01.jpg..100.jpg.

Why this exists:
- No Pillow / ImageMagick required.
- Uses a tiny PNG decoder (8-bit, non-interlaced, RGB/RGBA).
- Detects white gutters (grid lines) to avoid slicing into neighbors.
- Uses macOS built-in `sips` to crop + encode JPEG.

Usage:
  python3 tools/split_sheet_png.py /path/to/sheet.png assets/exthumbs/jpg
"""

from __future__ import annotations

import os
import struct
import subprocess
import sys
import zlib


def _read_u32(b: bytes, off: int) -> int:
    return struct.unpack(">I", b[off : off + 4])[0]


def _paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa = abs(p - a)
    pb = abs(p - b)
    pc = abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def png_stats(path: str):
    """
    Returns:
      width, height, channels,
      x_mean[width], x_var[width], x_bright[width],
      y_mean[height], y_var[height], y_bright[height]
    """
    with open(path, "rb") as f:
        data = f.read()

    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("Not a PNG file")

    off = 8
    width = height = None
    bit_depth = color_type = interlace = None
    idat = bytearray()

    while off + 8 <= len(data):
        ln = _read_u32(data, off)
        typ = data[off + 4 : off + 8]
        chunk = data[off + 8 : off + 8 + ln]
        off = off + 12 + ln

        if typ == b"IHDR":
            width, height, bit_depth, color_type, _comp, _filter, interlace = struct.unpack(
                ">IIBBBBB", chunk
            )
        elif typ == b"IDAT":
            idat.extend(chunk)
        elif typ == b"IEND":
            break

    if width is None or height is None:
        raise ValueError("Missing IHDR")
    if bit_depth != 8:
        raise ValueError(f"Unsupported bit depth: {bit_depth}")
    if interlace != 0:
        raise ValueError("Interlaced PNG not supported")
    if color_type == 2:
        channels = 3
    elif color_type == 6:
        channels = 4
    else:
        raise ValueError(f"Unsupported color type: {color_type}")

    raw = zlib.decompress(bytes(idat))
    stride = width * channels
    expected = height * (1 + stride)
    if len(raw) < expected:
        raise ValueError(f"Corrupt PNG (raw too small): {len(raw)} < {expected}")

    # Column accumulators
    x_sum = [0.0] * width
    x_sumsq = [0.0] * width
    x_bright = [0] * width

    # Row accumulators (store per row)
    y_mean = [0.0] * height
    y_var = [0.0] * height
    y_bright = [0.0] * height

    prev = bytearray(stride)
    p = 0
    for y in range(height):
        ftype = raw[p]
        p += 1
        scan = raw[p : p + stride]
        p += stride

        recon = bytearray(stride)
        if ftype == 0:  # None
            recon[:] = scan
        elif ftype == 1:  # Sub
            for i in range(stride):
                left = recon[i - channels] if i >= channels else 0
                recon[i] = (scan[i] + left) & 0xFF
        elif ftype == 2:  # Up
            for i in range(stride):
                recon[i] = (scan[i] + prev[i]) & 0xFF
        elif ftype == 3:  # Average
            for i in range(stride):
                left = recon[i - channels] if i >= channels else 0
                up = prev[i]
                recon[i] = (scan[i] + ((left + up) >> 1)) & 0xFF
        elif ftype == 4:  # Paeth
            for i in range(stride):
                a = recon[i - channels] if i >= channels else 0
                b = prev[i]
                c = prev[i - channels] if i >= channels else 0
                recon[i] = (scan[i] + _paeth(a, b, c)) & 0xFF
        else:
            raise ValueError(f"Unsupported filter type: {ftype}")

        # Stats for this row + update columns
        row_sum = 0.0
        row_sumsq = 0.0
        row_bright = 0
        for x in range(width):
            i = x * channels
            r = recon[i]
            g = recon[i + 1]
            b = recon[i + 2]
            lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255.0
            row_sum += lum
            row_sumsq += lum * lum

            x_sum[x] += lum
            x_sumsq[x] += lum * lum

            # "very white" pixel
            if r >= 240 and g >= 240 and b >= 240:
                row_bright += 1
                x_bright[x] += 1

        n_row = float(width)
        m = row_sum / n_row
        v = max(0.0, (row_sumsq / n_row) - (m * m))
        y_mean[y] = m
        y_var[y] = v
        y_bright[y] = row_bright / n_row

        prev = recon

    n_col = float(height)
    x_mean = [s / n_col for s in x_sum]
    x_var = [max(0.0, (ss / n_col) - (m * m)) for ss, m in zip(x_sumsq, x_mean)]
    x_bright_ratio = [c / n_col for c in x_bright]

    return width, height, channels, x_mean, x_var, x_bright_ratio, y_mean, y_var, y_bright


def runs_from_mask(mask):
    runs = []
    s = None
    for i, v in enumerate(mask):
        if v and s is None:
            s = i
        if (not v) and s is not None:
            e = i - 1
            runs.append((s, e))
            s = None
    if s is not None:
        runs.append((s, len(mask) - 1))
    return runs


def pick_gutter_runs(mean, var, bright, count, axis_len):
    # Try a few threshold presets (most strict first)
    presets = [
        (0.93, 0.92, 0.0020),
        (0.92, 0.90, 0.0030),
        (0.90, 0.88, 0.0045),
        (0.88, 0.85, 0.0065),
    ]
    cell = axis_len / count
    win = max(10, int(cell * 0.25))

    for mThr, bThr, vThr in presets:
        mask = [(m > mThr and b > bThr and v < vThr) for m, b, v in zip(mean, bright, var)]
        runs = runs_from_mask(mask)
        if not runs:
            continue

        # Precompute run centers and widths
        rinfo = []
        for s, e in runs:
            w = e - s + 1
            c = (s + e) / 2.0
            rinfo.append((s, e, c, w))

        picks = []
        used = set()
        for k in range(1, count):
            exp = k * cell
            best = None
            bestScore = 1e18
            for idx, (s, e, c, w) in enumerate(rinfo):
                if idx in used:
                    continue
                if abs(c - exp) > win:
                    continue
                # Prefer wider gutters, but still close to expected position
                score = abs(c - exp) - min(20.0, float(w)) * 0.45
                if score < bestScore:
                    bestScore = score
                    best = idx
            if best is None:
                break
            used.add(best)
            picks.append(rinfo[best])

        if len(picks) == count - 1:
            picks.sort(key=lambda t: t[2])
            # Edge trims (outer border)
            trim0 = 0
            i = 0
            while i < axis_len and mask[i]:
                i += 1
            if i > 2:
                trim0 = i
            trim1 = axis_len
            i = axis_len - 1
            while i >= 0 and mask[i]:
                i -= 1
            if i < axis_len - 3:
                trim1 = i + 1
            return picks, trim0, trim1

    return None, 0, axis_len


def tile_bounds_from_gutters(picks, trim0, trim1, count):
    # picks: list of (s,e,c,w) for the (count-1) gutters
    bounds = []
    for t in range(count):
        if t == 0:
            s = trim0
            e = picks[0][0] if picks else trim1
        elif t == count - 1:
            s = picks[-1][1] + 1 if picks else trim0
            e = trim1
        else:
            s = picks[t - 1][1] + 1
            e = picks[t][0]
        s = int(max(0, min(s, trim1)))
        e = int(max(0, min(e, trim1)))
        if e <= s:
            # fallback: make it at least 1px
            e = min(trim1, s + 1)
        bounds.append((s, e))  # [s, e)
    return bounds


def main():
    if len(sys.argv) != 3:
        print("Usage: python3 tools/split_sheet_png.py /path/to/sheet.png output_dir", file=sys.stderr)
        sys.exit(2)

    sheet = sys.argv[1]
    out_dir = sys.argv[2]
    cols = 10
    rows = 10

    if not os.path.isfile(sheet):
        raise SystemExit(f"Input not found: {sheet}")
    os.makedirs(out_dir, exist_ok=True)

    w, h, _ch, x_mean, x_var, x_bright, y_mean, y_var, y_bright = png_stats(sheet)

    x_picks, x_trim0, x_trim1 = pick_gutter_runs(x_mean, x_var, x_bright, cols, w)
    y_picks, y_trim0, y_trim1 = pick_gutter_runs(y_mean, y_var, y_bright, rows, h)

    # Fallback to equal split if detection fails
    if x_picks is None:
        x_bounds = [(int((w * i) / cols), int((w * (i + 1)) / cols)) for i in range(cols)]
    else:
        x_bounds = tile_bounds_from_gutters(x_picks, x_trim0, x_trim1, cols)

    if y_picks is None:
        y_bounds = [(int((h * i) / rows), int((h * (i + 1)) / rows)) for i in range(rows)]
    else:
        y_bounds = tile_bounds_from_gutters(y_picks, y_trim0, y_trim1, rows)

    # Crop each tile with a small inset so we never cut into gutters.
    inset = 6

    def crop_rect(col, row):
        x0, x1 = x_bounds[col]
        y0, y1 = y_bounds[row]
        x0 = max(0, x0 + inset)
        y0 = max(0, y0 + inset)
        x1 = min(w, x1 - inset)
        y1 = min(h, y1 - inset)
        cw = max(1, x1 - x0)
        ch = max(1, y1 - y0)
        return x0, y0, cw, ch

    # Produce 100 JPGs
    for idx in range(1, 101):
        i = idx - 1
        col = i % cols
        row = i // cols
        x0, y0, cw, ch = crop_rect(col, row)
        out_name = f"{idx:02d}.jpg"
        out_path = os.path.join(out_dir, out_name)

        # sips:
        # -c height width
        # --cropOffset offsetY offsetX
        cmd = [
            "sips",
            "-c",
            str(ch),
            str(cw),
            "--cropOffset",
            str(y0),
            str(x0),
            "-s",
            "format",
            "jpeg",
            sheet,
            "--out",
            out_path,
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    print(f"OK: wrote 100 files to {out_dir}")


if __name__ == "__main__":
    main()

