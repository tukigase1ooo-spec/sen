from PIL import Image, ImageDraw, ImageFont
import numpy as np, os, math

BASE = r"C:\Users\takku\OneDrive - Prospex\デスクトップ\AndoTak\my\illustrator-website"
UPL  = os.path.join(BASE, "images", "uploads")
OUT  = os.path.join(BASE, "images", "promo")
WF   = r"C:\Windows\Fonts"

W, H = 1080, 1350

BG      = (12, 10, 24)
BG2     = (20, 16, 40)
PANEL   = (20, 16, 42)
GOLD    = (201, 168, 76)
GOLD_P  = (230, 210, 148)
CREAM   = (245, 240, 232)
SILVER  = (148, 143, 138)
MID     = (88, 84, 80)
LINE_C  = (44, 38, 66)

def fnt(name, size, idx=0):
    for d in [WF]:
        p = os.path.join(d, name)
        try: return ImageFont.truetype(p, size, index=idx)
        except: pass
    return ImageFont.load_default()

def JA(s):   return fnt("NotoSerifJP-VF.ttf", s)
def JAM(s):  return fnt("meiryo.ttc", s, 0)

def mk_bg():
    arr = np.zeros((H, W, 3), "uint8")
    for y in range(H):
        t = y / (H - 1)
        arr[y] = [int(BG[k] + t * (BG2[k] - BG[k])) for k in range(3)]
    return Image.fromarray(arr).convert("RGBA")

def gold_rule(draw, y, lx=60, rx=None):
    if rx is None: rx = W - 60
    draw.line([(lx, y), (rx, y)], fill=(*GOLD, 110), width=1)

def dot_div(draw, y, n=3):
    sp = 16
    sx = (W - n * sp) // 2
    for i in range(n):
        cx = sx + i * sp + sp // 2
        draw.ellipse([cx-2, y-2, cx+2, y+2], fill=(*GOLD, 160))

def corners(draw, mx=30, sz=20):
    g = (*GOLD, 160)
    for fx, fy in [(mx,mx),(W-mx,mx),(mx,H-mx),(W-mx,H-mx)]:
        sx = 1 if fx == mx else -1
        sy = 1 if fy == mx else -1
        draw.line([(fx, fy),(fx+sx*sz, fy)], fill=g, width=1)
        draw.line([(fx, fy),(fx, fy+sy*sz)], fill=g, width=1)

def fit_paste(base, path, bx, by, bw, bh):
    src = Image.open(path).convert("RGBA")
    sw, sh = src.size
    r = min(bw / sw, bh / sh)
    nw, nh = int(sw * r), int(sh * r)
    src = src.resize((nw, nh), Image.LANCZOS)
    px = bx + (bw - nw) // 2
    py = by + (bh - nh) // 2
    base.paste(src, (px, py), src.split()[3])

def header(base, draw):
    """Common header for both sheets."""
    draw.rectangle([0, 0, W, 3], fill=(*GOLD, 220))
    draw.rectangle([0, H-3, W, H], fill=(*GOLD, 220))
    corners(draw)
    draw.text((60, 20), "Sen Tsukigase", font=JAM(18), fill=(*GOLD, 210))
    lbl = "イラスト制作依頼"
    lb = draw.textbbox((0,0), lbl, font=JA(20))
    draw.text((W - 60 - (lb[2]-lb[0]), 20), lbl, font=JA(20), fill=(*CREAM, 220))
    gold_rule(draw, 62)

def footer(base, draw, page):
    gold_rule(draw, H - 56)
    draw.text((60, H-44), "@Tukigase1000", font=JAM(14), fill=(*GOLD, 200))
    pg = f"{page} / 2"
    pb = draw.textbbox((0,0), pg, font=JAM(14))
    draw.text(((W-(pb[2]-pb[0]))//2, H-44), pg, font=JAM(14), fill=(*MID, 160))
    url = "tukigases-sen.netlify.app"
    ub = draw.textbbox((0,0), url, font=JAM(14))
    draw.text((W - 60 - (ub[2]-ub[0]), H-44), url, font=JAM(14), fill=(*SILVER, 180))

# ══════════════════════════════════════════════════════════════════════
# SHEET 1 — フランチェスカ ｜ 基本料金 ＋ ご依頼の流れ
# ══════════════════════════════════════════════════════════════════════
def sheet1():
    base = mk_bg()
    draw = ImageDraw.Draw(base, "RGBA")
    header(base, draw)

    # ── Two-column: illustration left | pricing right ──────────────
    COL_L = 500      # left column width
    COL_R_X = 516    # right column start x
    COL_Y = 72       # top of panel
    COL_H = 530      # panel height

    # Illustration panel background
    draw.rectangle([0, COL_Y, COL_L, COL_Y + COL_H], fill=(*PANEL, 255))
    fit_paste(base, os.path.join(UPL, "フランチェスカ.png"), 0, COL_Y, COL_L, COL_H)

    # Vertical separator
    draw = ImageDraw.Draw(base, "RGBA")
    draw.line([(COL_L + 6, COL_Y + 24), (COL_L + 6, COL_Y + COL_H - 24)],
              fill=(*GOLD, 55), width=1)

    # ── Right: Pricing ─────────────────────────────────────────────
    RX = COL_R_X
    ry = COL_Y + 32

    draw.text((RX, ry), "基 本 料 金", font=JA(15), fill=(*GOLD, 200))
    ry += 28
    gold_rule(draw, ry, lx=RX, rx=W-52)
    ry += 18

    # Big price
    price = "¥10,000 〜 ¥50,000"
    pb_box = draw.textbbox((0,0), price, font=JA(34))
    draw.text((RX, ry), price, font=JA(34), fill=(*CREAM, 255))
    ry += (pb_box[3] - pb_box[1]) + 14

    # Commercial note
    draw.text((RX, ry), "商用利用の場合", font=JAM(13), fill=(*SILVER, 185))
    ry += 20
    draw.text((RX, ry), "基本料金 の +30〜50%", font=JA(15), fill=(*GOLD_P, 210))
    ry += 28
    draw.text((RX, ry), "※費用は予告なく変更する場合があります", font=JAM(11), fill=(*MID, 150))
    ry += 34

    # Thin divider
    draw.line([(RX, ry), (W-52, ry)], fill=(*LINE_C, 200), width=1)
    ry += 20

    draw.text((RX, ry), "イラスト依頼・受付中", font=JA(14), fill=(*SILVER, 170))
    ry += 24
    draw.text((RX, ry), "一次創作・二次創作 どちらも可", font=JA(14), fill=(*SILVER, 170))
    ry += 34

    draw.line([(RX, ry), (W-52, ry)], fill=(*LINE_C, 200), width=1)
    ry += 20

    # Web CTA (no button — just text)
    draw.text((RX, ry), "詳細はウェブページをご確認ください", font=JAM(13), fill=(*SILVER, 185))
    ry += 22
    url2 = "tukigases-sen.netlify.app/contact.html"
    draw.text((RX, ry), url2, font=JAM(12), fill=(*GOLD_P, 170))
    ry += 22

    # Page number (bottom of right panel)
    pn_y = COL_Y + COL_H - 28
    draw.text((RX, pn_y), "1 / 2", font=JAM(12), fill=(*MID, 130))

    # ── Section: ご依頼の流れ ───────────────────────────────────────
    sec_y = COL_Y + COL_H + 22
    gold_rule(draw, sec_y)
    dot_div(draw, sec_y + 14)
    sec_y += 32

    draw.text((60, sec_y), "ご依頼の流れ", font=JA(22), fill=(*CREAM, 235))
    sec_y += 44

    steps = [
        "お問い合わせ",
        "依頼内容確認及び見積り",
        "ご入金",
        "ラフ確認（修正 2 回まで無料）",
        "納品",
        "ご確認後 修正を行い完了",
    ]
    STEP_H = 96
    NR = 20   # number circle radius

    for i, step in enumerate(steps):
        cy = sec_y + STEP_H * i + STEP_H // 2
        nx = 60 + NR

        # Circle
        draw.ellipse([nx-NR, cy-NR, nx+NR, cy+NR],
                     outline=(*GOLD, 180), width=1, fill=(*GOLD, 14))
        n = str(i+1)
        nb = draw.textbbox((0,0), n, font=JAM(14))
        draw.text((nx-(nb[2]-nb[0])//2, cy-(nb[3]-nb[1])//2-2), n,
                  font=JAM(14), fill=(*GOLD, 230))

        # Connector line
        if i < len(steps)-1:
            draw.line([(nx, cy+NR+4), (nx, cy+STEP_H-NR-4)], fill=(*GOLD, 45), width=1)

        # Step text
        draw.text((60+NR*2+16, cy-14), step, font=JA(20), fill=(*CREAM, 235))

    sec_y += STEP_H * len(steps)
    footer(base, draw, 1)
    base.convert("RGB").save(os.path.join(OUT, "commission_01.png"), quality=95)
    print("Saved commission_01.png")


# ══════════════════════════════════════════════════════════════════════
# SHEET 2 — 眼鏡らむち + せ・ん・ぱ・い ｜ 受付中・オプション・注意事項
# ══════════════════════════════════════════════════════════════════════
def sheet2():
    base = mk_bg()
    draw = ImageDraw.Draw(base, "RGBA")
    header(base, draw)

    # ── Two illustration thumbnails ────────────────────────────────
    TH_Y = 72
    TH_H = 380
    GAP  = 8
    TW   = (W - 60*2 - GAP) // 2   # each thumbnail width
    LX   = 60
    RX   = LX + TW + GAP

    # 眼鏡らむち (light bg → dark panel behind it)
    draw.rectangle([LX, TH_Y, LX+TW, TH_Y+TH_H], fill=(*PANEL, 255))
    fit_paste(base, os.path.join(UPL, "眼鏡らむち.png"), LX, TH_Y, TW, TH_H)

    # せ・ん・ぱ・い
    draw = ImageDraw.Draw(base, "RGBA")
    draw.rectangle([RX, TH_Y, RX+TW, TH_Y+TH_H], fill=(*PANEL, 255))
    fit_paste(base, os.path.join(UPL, "せ・ん・ぱ・い💜.jpg"), RX, TH_Y, TW, TH_H)

    draw = ImageDraw.Draw(base, "RGBA")

    # Caption gradient overlay at bottom of each thumbnail
    for tx in [LX, RX]:
        for alpha_step in range(40):
            a = int(alpha_step / 39 * 180)
            yyy = TH_Y + TH_H - 40 + alpha_step
            if yyy < TH_Y + TH_H:
                draw.line([(tx, yyy), (tx+TW, yyy)], fill=(*BG, a), width=1)

    cap1 = "眼鏡らむち（白波らむね様 / ぶいすぽっ）"
    cap2 = "せ・ん・ぱ・い💜（紫宮るな様 / ぶいすぽっ）"
    draw.text((LX+8, TH_Y+TH_H-26), cap1, font=JAM(11), fill=(*SILVER, 175))
    draw.text((RX+8, TH_Y+TH_H-26), cap2, font=JAM(11), fill=(*SILVER, 175))

    # Thumbnail border highlight
    draw.rectangle([LX, TH_Y, LX+TW, TH_Y+TH_H], outline=(*GOLD, 40), width=1)
    draw.rectangle([RX, TH_Y, RX+TW, TH_Y+TH_H], outline=(*GOLD, 40), width=1)

    # ── Sections ───────────────────────────────────────────────────
    ITEM_H = 34
    sec_y = TH_Y + TH_H + 24

    # ── 受付中の依頼 ────────────────────────────────────────────────
    gold_rule(draw, sec_y)
    dot_div(draw, sec_y + 14)
    sec_y += 32

    draw.text((60, sec_y), "受付中の依頼", font=JA(20), fill=(*CREAM, 235))
    # Sub label
    sub = "一次創作・二次創作 どちらもお受けしております"
    sb = draw.textbbox((0,0), sub, font=JAM(12))
    draw.text((W-60-(sb[2]-sb[0]), sec_y+5), sub, font=JAM(12), fill=(*SILVER, 155))
    sec_y += 40

    accepts = [
        "背景なしイラスト",
        "SD（ミニキャラ）イラスト",
        "背景付きイラスト",
        "キャラクターデザイン",
    ]
    # 2-column layout
    col_w = (W - 60*2) // 2
    for j, item in enumerate(accepts):
        col = j % 2
        row = j // 2
        ix = 60 + col * col_w + 24
        iy = sec_y + row * ITEM_H
        s = 4
        draw.polygon([(ix-12, iy+ITEM_H//2), (ix-12+s*2, iy+ITEM_H//2-s),
                      (ix-12+s*2, iy+ITEM_H//2+s)], fill=(*GOLD, 180))
        draw.text((ix, iy+6), item, font=JA(17), fill=(*CREAM, 225))
    sec_y += math.ceil(len(accepts)/2) * ITEM_H + 10
    draw.text((60+24, sec_y), "など", font=JAM(13), fill=(*SILVER, 155))
    sec_y += 32

    # ── オプション ─────────────────────────────────────────────────
    gold_rule(draw, sec_y)
    dot_div(draw, sec_y + 14)
    sec_y += 32

    draw.text((60, sec_y), "オプション", font=JA(20), fill=(*CREAM, 235))
    sec_y += 40

    opts = ["表情差分", "PSD納品", "著作権譲渡", "3回目以降の修正"]
    for j, opt in enumerate(opts):
        col = j % 2
        row = j // 2
        ix = 60 + col * col_w + 24
        iy = sec_y + row * ITEM_H
        s = 4
        draw.polygon([(ix-12, iy+ITEM_H//2), (ix-12+s*2, iy+ITEM_H//2-s),
                      (ix-12+s*2, iy+ITEM_H//2+s)], fill=(*GOLD, 180))
        draw.text((ix, iy+6), opt, font=JA(17), fill=(*CREAM, 225))
    sec_y += math.ceil(len(opts)/2) * ITEM_H + 10
    draw.text((60+24, sec_y), "など", font=JAM(13), fill=(*SILVER, 155))
    sec_y += 32

    # ── 注意事項 ───────────────────────────────────────────────────
    gold_rule(draw, sec_y)
    dot_div(draw, sec_y + 14)
    sec_y += 32

    draw.text((60, sec_y), "注意事項", font=JA(20), fill=(*CREAM, 235))
    sec_y += 40

    notes = [
        "ご利用用途の記載をお願いします",
        "実績として掲載可能な依頼のみお受けしております",
        "返信が遅い場合、納品が遅れる場合があります",
        "費用は予告なく変更する場合があります",
        "現在、実績非公開でのご依頼はお受けしておりません",
    ]
    NOTE_H = 36
    for note in notes:
        draw.text((60+8, sec_y+2), "※", font=JAM(12), fill=(*GOLD, 160))
        draw.text((60+26, sec_y), note, font=JAM(15), fill=(*SILVER, 200))
        sec_y += NOTE_H

    footer(base, draw, 2)
    base.convert("RGB").save(os.path.join(OUT, "commission_02.png"), quality=95)
    print("Saved commission_02.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("Generating commission sheets...")
    sheet1()
    sheet2()
    print("Done.")
