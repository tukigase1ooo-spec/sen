from PIL import Image, ImageDraw, ImageFont
import numpy as np
import os
import math

FONTS_DIR = r"C:\Users\AndoTak\.claude\plugins\cache\anthropic-agent-skills-ja\example-skills\4aca3672d289\skills\canvas-design\canvas-fonts"
WIN_FONTS = r"C:\Windows\Fonts"
OUTPUT_DIR = r"C:\Users\AndoTak\OneDrive - Prospex\デスクトップ\AndoTak\my\illustrator-website\images\promo"

W, H = 1200, 630

# ── Palette ──────────────────────────────────────────────────
BG1       = (10, 9, 22)
BG2       = (22, 18, 44)
BG3       = (32, 26, 60)
GOLD      = (201, 168, 76)
GOLD_DIM  = (140, 112, 45)
GOLD_PALE = (230, 205, 140)
CREAM     = (245, 240, 232)
SILVER    = (160, 155, 145)
WHITE_KEY = (228, 225, 215)
BLACK_KEY = (20, 18, 28)

# ── Fonts ────────────────────────────────────────────────────
def fnt(path, size, idx=0):
    try:
        return ImageFont.truetype(path, size, index=idx)
    except Exception as e:
        print(f"  font warn: {path} sz={size} → {e}")
        return ImageFont.load_default()

JA  = f"{WIN_FONTS}/NotoSerifJP-VF.ttf"
JAM = f"{WIN_FONTS}/meiryo.ttc"
IT  = f"{FONTS_DIR}/Italiana-Regular.ttf"
CP  = f"{FONTS_DIR}/CrimsonPro-Italic.ttf"
CPS = f"{FONTS_DIR}/CrimsonPro-Regular.ttf"
JU  = f"{FONTS_DIR}/Jura-Light.ttf"
IS  = f"{FONTS_DIR}/InstrumentSans-Regular.ttf"

# ── Helpers ──────────────────────────────────────────────────
def gradient(w, h, c1, c2, mode="v"):
    a = np.zeros((h, w, 3), np.uint8)
    for i in range(h if mode != "h" else w):
        t = i / (h - 1 if mode != "h" else w - 1)
        col = tuple(int(c1[k] + t * (c2[k] - c1[k])) for k in range(3))
        if mode == "v":
            a[i, :] = col
        elif mode == "h":
            a[:, i] = col
        else:
            t2 = i / (h - 1)
            a[i, :] = tuple(int(c1[k] + t2 * (c2[k] - c1[k])) for k in range(3))
    return Image.fromarray(a, "RGB")

def blend(base, overlay, x, y, alpha=255):
    if overlay.mode != "RGBA":
        overlay = overlay.convert("RGBA")
    mask = overlay.split()[3]
    if alpha < 255:
        mask = mask.point(lambda p: int(p * alpha / 255))
    base.paste(overlay, (x, y), mask)

def draw_line(draw, x1, y1, x2, y2, color, width=1, alpha=255):
    c = color + (alpha,)
    draw.line([(x1, y1), (x2, y2)], fill=c, width=width)

def centered_text(draw, text, font, y, color, width=W, x_offset=0, alpha=255):
    bb = draw.textbbox((0, 0), text, font=font)
    tw = bb[2] - bb[0]
    x = x_offset + (width - tw) // 2
    if isinstance(color, tuple) and len(color) == 3:
        color = color + (alpha,)
    draw.text((x, y), text, font=font, fill=color)

def piano_strip(draw, ox, oy, nw=10, scale=1.0, alpha=180):
    ww = int(52 * scale)
    wh = int(150 * scale)
    bw = int(31 * scale)
    bh = int(94 * scale)
    gap = int(2 * scale)
    bar = int(14 * scale)

    positions = [ox + i * (ww + gap) for i in range(nw)]

    # White keys
    for px in positions:
        col = WHITE_KEY + (alpha,)
        draw.rectangle([px, oy + bar, px + ww, oy + bar + wh],
                        fill=col, outline=(120, 118, 110, alpha), width=1)

    # Black keys (pattern: after 0,1 — skip 2 — after 3,4,5)
    bk_pattern = [0, 1, 3, 4, 5, 7, 8]
    for bi in bk_pattern:
        if bi < nw - 1:
            bx = positions[bi] + ww - bw // 2
            col = BLACK_KEY + (alpha,)
            draw.rectangle([bx, oy + bar, bx + bw, oy + bar + bh], fill=col)

    # Top bar
    total = nw * (ww + gap) - gap
    draw.rectangle([ox, oy, ox + total, oy + bar], fill=BLACK_KEY + (alpha,))

def gold_rule(draw, y, margin=80, alpha=200):
    draw.line([(margin, y), (W - margin, y)], fill=GOLD + (alpha,), width=1)

def dot_row(draw, y, n=5, alpha=160):
    spacing = 18
    total = n * spacing
    sx = (W - total) // 2
    for i in range(n):
        cx = sx + i * spacing + spacing // 2
        draw.ellipse([cx - 2, y - 2, cx + 2, y + 2], fill=GOLD + (alpha,))

def corner_marks(draw, margin=28, size=20, alpha=160):
    c = GOLD + (alpha,)
    w = 1
    # TL
    draw.line([(margin, margin), (margin + size, margin)], fill=c, width=w)
    draw.line([(margin, margin), (margin, margin + size)], fill=c, width=w)
    # TR
    draw.line([(W - margin - size, margin), (W - margin, margin)], fill=c, width=w)
    draw.line([(W - margin, margin), (W - margin, margin + size)], fill=c, width=w)
    # BL
    draw.line([(margin, H - margin - size), (margin, H - margin)], fill=c, width=w)
    draw.line([(margin, H - margin), (margin + size, H - margin)], fill=c, width=w)
    # BR
    draw.line([(W - margin, H - margin - size), (W - margin, H - margin)], fill=c, width=w)
    draw.line([(W - margin - size, H - margin), (W - margin, H - margin)], fill=c, width=w)

# ═══════════════════════════════════════════════════════════════
# IMAGE 1 — 動く。魅せる。伝わる。
# ═══════════════════════════════════════════════════════════════
def make_image1():
    img = gradient(W, H, BG1, BG2).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    # Faint diagonal gradient overlay
    for i in range(H):
        t = i / H
        alpha = int(30 + t * 20)
        draw.line([(0, i), (W, i)], fill=BG3 + (alpha,), width=1)

    # Piano keys — wave flowing from left, slightly tilted
    for k in range(14):
        wave_y = int(H * 0.58 + math.sin(k * 0.6) * 18)
        wave_alpha = max(40, 130 - k * 7)
        sc = 0.72 - k * 0.018
        if sc > 0.2:
            piano_strip(draw, ox=-30 + k * 88, oy=wave_y, nw=2, scale=sc, alpha=wave_alpha)

    # Horizontal gold rules
    gold_rule(draw, 48, margin=60, alpha=120)
    gold_rule(draw, H - 48, margin=60, alpha=120)

    # Corner marks
    corner_marks(draw, margin=24, size=16)

    # Thin vertical accent line (left)
    draw.line([(72, 80), (72, H - 80)], fill=GOLD + (60,), width=1)

    # Label top
    f_tag = fnt(IS, 13)
    centered_text(draw, "SEN TSUKIGASE  ·  PORTFOLIO  ·  WEB DESIGN", f_tag, 22, SILVER, alpha=180)

    # Main title
    f_title = fnt(JA, 74)
    title = "動く。魅せる。伝わる。"
    bb = draw.textbbox((0, 0), title, font=f_title)
    tw = bb[2] - bb[0]
    tx = (W - tw) // 2
    # Shadow
    draw.text((tx + 2, 164 + 2), title, font=f_title, fill=(0, 0, 0, 80))
    draw.text((tx, 164), title, font=f_title, fill=CREAM + (255,))

    # Gold underline accent under title
    ul_y = 164 + (bb[3] - bb[1]) + 14
    draw.line([(tx + tw // 4, ul_y), (tx + tw * 3 // 4, ul_y)], fill=GOLD + (200,), width=2)

    # Subtitle
    f_sub = fnt(JA, 28)
    sub = "動的なウェブサイトで、あなたの世界観を表現"
    centered_text(draw, sub, f_sub, ul_y + 22, SILVER, alpha=220)

    # Dot separator
    dot_row(draw, ul_y + 80, n=5, alpha=140)

    # Tagline (Latin)
    f_la = fnt(IT, 28)
    centered_text(draw, "Illustration  ·  Design  ·  Music  ·  Web", f_la, ul_y + 100, GOLD, alpha=200)

    # Bottom name
    f_name = fnt(CP, 22)
    centered_text(draw, "Sen Tsukigase", f_name, H - 62, GOLD_PALE, alpha=220)

    img = img.convert("RGB")
    img.save(os.path.join(OUTPUT_DIR, "promo_01_dynamic.png"), quality=95)
    print("  OK promo_01_dynamic.png")

# ═══════════════════════════════════════════════════════════════
# IMAGE 2 — 一人で、すべてを。
# ═══════════════════════════════════════════════════════════════
def make_image2():
    img = gradient(W, H, BG1, (18, 14, 36)).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    # Gold vertical divider (center)
    draw.line([(W // 2, 80), (W // 2, H - 80)], fill=GOLD + (40,), width=1)

    # Gold horizontal divider (center)
    draw.line([(80, H // 2), (W - 80, H // 2)], fill=GOLD + (40,), width=1)

    # ── 4 quadrant icons ──────────────────────────────────────
    quad_cx = [W // 4, W * 3 // 4, W // 4, W * 3 // 4]
    quad_cy = [H // 4 + 10, H // 4 + 10, H * 3 // 4 - 10, H * 3 // 4 - 10]
    quad_labels_ja = ["イラスト", "デザイン", "音楽", "ウェブ制作"]
    quad_labels_en = ["Illustration", "Design", "Music", "Web"]

    icon_r = 44
    icon_alpha = 200

    for i, (cx, cy) in enumerate(zip(quad_cx, quad_cy)):
        # Outer circle
        draw.ellipse([cx - icon_r, cy - icon_r, cx + icon_r, cy + icon_r],
                     outline=GOLD + (icon_alpha,), width=1)
        # Inner circle faint fill
        draw.ellipse([cx - icon_r + 2, cy - icon_r + 2, cx + icon_r - 2, cy + icon_r - 2],
                     fill=GOLD + (12,))

        if i == 0:  # Illustration: brush strokes
            for k in range(4):
                angle = math.radians(-30 + k * 25)
                x1 = cx + int(math.cos(angle) * 18)
                y1 = cy + int(math.sin(angle) * 28)
                x2 = cx + int(math.cos(angle) * 8)
                y2 = cy + int(math.sin(angle) * -10)
                draw.line([(x1, y1), (x2, y2)], fill=GOLD + (icon_alpha,), width=2)
            # brush tip
            draw.ellipse([cx - 4, cy - 32, cx + 4, cy - 24], fill=GOLD + (icon_alpha,))

        elif i == 1:  # Design: geometric diamond
            pts = [(cx, cy - 28), (cx + 20, cy), (cx, cy + 28), (cx - 20, cy)]
            draw.polygon(pts, outline=GOLD + (icon_alpha,), fill=GOLD + (30,))
            draw.polygon([(cx, cy - 14), (cx + 10, cy), (cx, cy + 14), (cx - 10, cy)],
                         fill=GOLD + (icon_alpha,))

        elif i == 2:  # Music: mini piano keys
            kw, kh = 10, 30
            bkh = 18
            for k in range(5):
                kx = cx - 26 + k * (kw + 2)
                draw.rectangle([kx, cy - kh // 2, kx + kw, cy + kh // 2],
                                fill=WHITE_KEY + (icon_alpha,), outline=SILVER + (icon_alpha,), width=1)
            # 3 black keys
            for bk in [0, 1, 3]:
                bx = cx - 26 + bk * (kw + 2) + kw - 4
                draw.rectangle([bx, cy - kh // 2, bx + 7, cy - kh // 2 + bkh],
                                fill=BLACK_KEY + (icon_alpha,))

        elif i == 3:  # Web: code brackets
            f_code = fnt(f"{FONTS_DIR}/JetBrainsMono-Regular.ttf", 26)
            for txt, dx in [("</>", 0)]:
                bb = draw.textbbox((0, 0), txt, font=f_code)
                tw = bb[2] - bb[0]
                th = bb[3] - bb[1]
                draw.text((cx - tw // 2, cy - th // 2), txt, font=f_code, fill=GOLD + (icon_alpha,))

        # Label below icon
        f_lab_ja = fnt(JA, 18)
        f_lab_en = fnt(IS, 13)
        ja_bb = draw.textbbox((0, 0), quad_labels_ja[i], font=f_lab_ja)
        jw = ja_bb[2] - ja_bb[0]
        draw.text((cx - jw // 2, cy + icon_r + 10), quad_labels_ja[i],
                  font=f_lab_ja, fill=CREAM + (200,))
        en_bb = draw.textbbox((0, 0), quad_labels_en[i], font=f_lab_en)
        ew = en_bb[2] - en_bb[0]
        draw.text((cx - ew // 2, cy + icon_r + 34), quad_labels_en[i],
                  font=f_lab_en, fill=SILVER + (160,))

    # Gold rules
    gold_rule(draw, 44, margin=60, alpha=100)
    gold_rule(draw, H - 44, margin=60, alpha=100)
    corner_marks(draw, margin=24, size=14)

    # Top label
    f_tag = fnt(IS, 13)
    centered_text(draw, "SEN TSUKIGASE  ·  CREATIVE WORKS", f_tag, 20, SILVER, alpha=160)

    # --- Overlay title block (center, semi-transparent) ---
    # Title centered
    f_title = fnt(JA, 52)
    title = "一人で、すべてを。"
    bb = draw.textbbox((0, 0), title, font=f_title)
    tw = bb[2] - bb[0]
    th = bb[3] - bb[1]
    tx = (W - tw) // 2
    ty = (H - th) // 2 - 14

    # Dark pill background
    pad = 20
    draw.rounded_rectangle([tx - pad, ty - pad // 2, tx + tw + pad, ty + th + pad // 2],
                             radius=4, fill=(10, 9, 22, 210))
    draw.text((tx, ty), title, font=f_title, fill=CREAM + (255,))

    # Gold underline
    draw.line([(tx + tw // 3, ty + th + 6), (tx + tw * 2 // 3, ty + th + 6)],
              fill=GOLD + (200,), width=2)

    # Subtitle just below pill
    f_sub = fnt(JA, 22)
    sub = "イラスト・デザイン・音楽・ウェブ ─ 多彩な表現力"
    s_bb = draw.textbbox((0, 0), sub, font=f_sub)
    sw = s_bb[2] - s_bb[0]
    draw.text(((W - sw) // 2, ty + th + pad // 2 + 16), sub,
              font=f_sub, fill=SILVER + (200,))

    img = img.convert("RGB")
    img.save(os.path.join(OUTPUT_DIR, "promo_02_range.png"), quality=95)
    print("  OK promo_02_range.png")

# ═══════════════════════════════════════════════════════════════
# IMAGE 3 — 世界にひとつの、あなたのサイト。
# ═══════════════════════════════════════════════════════════════
def make_image3():
    img = gradient(W, H, (8, 7, 18), BG2).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    # Radial glow around center-right piano key
    key_cx, key_cy = 820, 310
    for r in range(220, 0, -10):
        alpha = int(3 + (220 - r) * 0.05)
        col = (120, 90, 30, alpha)
        draw.ellipse([key_cx - r, key_cy - r, key_cx + r, key_cy + r], fill=col)

    # Large single illuminated white piano key (hero element)
    kw, kh = 110, 290
    kx = key_cx - kw // 2
    ky = key_cy - kh // 2

    # Key shadow
    draw.rectangle([kx + 6, ky + 6, kx + kw + 6, ky + kh + 6], fill=(0, 0, 0, 100))

    # Key body with gradient
    for row in range(kh):
        t = row / kh
        r = int(240 - t * 30)
        g = int(238 - t * 28)
        b = int(228 - t * 20)
        draw.line([(kx, ky + row), (kx + kw, ky + row)], fill=(r, g, b, 255))

    # Key outline
    draw.rectangle([kx, ky, kx + kw, ky + kh], outline=GOLD + (160,), width=2)

    # Gold shine line on key
    draw.line([(kx + 8, ky + 10), (kx + 8, ky + kh - 20)], fill=GOLD + (80,), width=3)

    # Key top cap
    cap_h = 20
    for row in range(cap_h):
        t = row / cap_h
        rr = int(30 - t * 10)
        draw.line([(kx, ky - cap_h + row), (kx + kw, ky - cap_h + row)],
                  fill=(rr, rr, rr + 5, 255))

    # Gold horizontal rules
    gold_rule(draw, 44, margin=60, alpha=110)
    gold_rule(draw, H - 44, margin=60, alpha=110)
    corner_marks(draw, margin=24, size=14)

    # Left vertical accent
    draw.line([(64, 72), (64, H - 72)], fill=GOLD + (50,), width=1)

    # Top label
    f_tag = fnt(IS, 13)
    centered_text(draw, "ORIGINAL  ·  HANDCRAFTED  ·  WEB  CREATION", f_tag, 20, SILVER, alpha=160)

    # Title (left-aligned, left half)
    f_title = fnt(JA, 52)
    title1 = "世界にひとつの、"
    title2 = "あなたのサイト。"
    tx = 90
    draw.text((tx, 150), title1, font=f_title, fill=CREAM + (255,))
    draw.text((tx, 220), title2, font=f_title, fill=CREAM + (255,))

    # Gold rule under title
    bb1 = draw.textbbox((0, 0), title1, font=f_title)
    rule_w = bb1[2] - bb1[0]
    draw.line([(tx, 290), (tx + rule_w * 2 // 3, 290)], fill=GOLD + (200,), width=2)

    # Subtitle
    f_sub = fnt(JA, 24)
    sub = "一から丁寧に作り上げる、"
    sub2 = "オリジナルウェブ制作"
    draw.text((tx, 314), sub, font=f_sub, fill=SILVER + (220,))
    draw.text((tx, 348), sub2, font=f_sub, fill=SILVER + (220,))

    # URL bottom left
    f_url = fnt(IS, 16)
    draw.text((tx, H - 62), "tukigases-sen.netlify.app", font=f_url, fill=GOLD + (200,))

    # Decorative dots right side
    for k in range(6):
        dot_x = 680 + k * 22
        draw.ellipse([dot_x - 2, H - 58, dot_x + 2, H - 54], fill=GOLD + (100 + k * 15,))

    img = img.convert("RGB")
    img.save(os.path.join(OUTPUT_DIR, "promo_03_original.png"), quality=95)
    print("  OK promo_03_original.png")

# ═══════════════════════════════════════════════════════════════
# IMAGE 4 — 創作の相談、いつでも。
# ═══════════════════════════════════════════════════════════════
def make_image4():
    img = gradient(W, H, (11, 10, 24), (16, 14, 34)).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

    # Floating musical notes (decorative)
    notes = ["♪", "♫", "♩", "♬", "♪", "♫", "♩"]
    note_pos = [(120, 80), (260, 140), (480, 60), (700, 110), (900, 75), (1050, 130), (1140, 90)]
    f_note = fnt(JA, 28)
    for note, (nx, ny) in zip(notes, note_pos):
        alpha = 50 + int(abs(math.sin(nx * 0.01)) * 60)
        draw.text((nx, ny), note, font=f_note, fill=GOLD + (alpha,))

    # Faint piano keys strip at very bottom (decorative)
    piano_strip(draw, ox=-20, oy=H - 60, nw=18, scale=0.38, alpha=35)

    # Gold rules
    gold_rule(draw, 48, margin=60, alpha=110)
    gold_rule(draw, H - 54, margin=60, alpha=110)
    corner_marks(draw, margin=24, size=14)

    # Small gold diamond center top ornament
    cx_d, cy_d = W // 2, 48
    s = 5
    draw.polygon([(cx_d, cy_d - s), (cx_d + s, cy_d), (cx_d, cy_d + s), (cx_d - s, cy_d)],
                 fill=GOLD + (200,))

    # Top label
    f_tag = fnt(IS, 13)
    centered_text(draw, "SEN TSUKIGASE  ·  CONTACT", f_tag, 22, SILVER, alpha=160)

    # Thin vertical lines (frame feel)
    for lx in [60, W - 60]:
        draw.line([(lx, 76), (lx, H - 76)], fill=GOLD + (45,), width=1)

    # Main title
    f_title = fnt(JA, 64)
    title = "創作の相談、いつでも。"
    bb = draw.textbbox((0, 0), title, font=f_title)
    tw = bb[2] - bb[0]
    th = bb[3] - bb[1]
    tx = (W - tw) // 2
    ty = 160

    # Subtle glow behind title
    for gk in range(3):
        draw.text((tx + gk - 1, ty + gk - 1), title, font=f_title, fill=(201, 168, 76, 18))
    draw.text((tx, ty), title, font=f_title, fill=CREAM + (255,))

    # Thin gold underline
    ul_y = ty + th + 10
    draw.line([(tx + tw // 5, ul_y), (tx + tw * 4 // 5, ul_y)], fill=GOLD + (180,), width=1)

    # Subtitle block
    f_sub = fnt(JA, 26)
    sub_lines = [
        "ウェブサイト制作・イラスト・デザインのご依頼はこちら",
    ]
    sy = ul_y + 26
    for line in sub_lines:
        sb = draw.textbbox((0, 0), line, font=f_sub)
        sw = sb[2] - sb[0]
        draw.text(((W - sw) // 2, sy), line, font=f_sub, fill=SILVER + (210,))
        sy += (sb[3] - sb[1]) + 10

    # CTA arrow block
    f_cta_la = fnt(CP, 20)
    f_cta_url = fnt(IS, 19)
    cta_y = sy + 28

    # CTA background pill
    cta_text = "Contact"
    url_text = "tukigases-sen.netlify.app"
    cta_bb = draw.textbbox((0, 0), cta_text, font=f_cta_la)
    url_bb = draw.textbbox((0, 0), url_text, font=f_cta_url)
    total_cta_w = (cta_bb[2] - cta_bb[0]) + 30 + (url_bb[2] - url_bb[0])
    pill_x = (W - total_cta_w - 60) // 2
    pill_y = cta_y - 10
    pill_h = 44
    draw.rounded_rectangle([pill_x, pill_y, pill_x + total_cta_w + 60, pill_y + pill_h],
                             radius=22, outline=GOLD + (180,), width=1, fill=GOLD + (18,))

    # CTA text
    draw.text((pill_x + 20, cta_y - 2), cta_text, font=f_cta_la, fill=GOLD + (240,))
    arrow_x = pill_x + 20 + (cta_bb[2] - cta_bb[0]) + 12
    draw.text((arrow_x - 2, cta_y - 2), "→", font=fnt(IS, 18), fill=GOLD + (200,))
    draw.text((arrow_x + 20, cta_y - 1), url_text, font=f_cta_url, fill=CREAM + (230,))

    # Bottom tagline
    f_bottom = fnt(CP, 18)
    centered_text(draw, "Together, we create something beautiful.", f_bottom, H - 50, SILVER, alpha=160)

    img = img.convert("RGB")
    img.save(os.path.join(OUTPUT_DIR, "promo_04_contact.png"), quality=95)
    print("  OK promo_04_contact.png")

# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Generating promo images...")
    make_image1()
    make_image2()
    make_image3()
    make_image4()
    print("Done.")
