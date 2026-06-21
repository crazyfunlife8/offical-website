# -*- coding: utf-8 -*-
# 三面照「存證單」：左|正|右 三面，每面蓋灰黑罪名章，做成泛黃相紙
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

ASSET = "_imgtest"
OUT = "_imgtest/arc-mugshot-evidence.png"
rng = np.random.default_rng(11)

def font(paths, size):
    for p in paths:
        try: return ImageFont.truetype(p, size)
        except Exception: continue
    return ImageFont.load_default()

MSJH_B = "C:/Windows/Fonts/msjhbd.ttc"
MSJH   = "C:/Windows/Fonts/msjh.ttc"
MONO   = "C:/Windows/Fonts/consola.ttf"

# ── 灰黑罪名章（蓋在每面亮區）──
def make_stamp(crime, statute, w):
    h = int(w * 0.46); INK = (24, 24, 28)
    cv = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(cv)
    d.rounded_rectangle([6, 6, w-6, h-6], radius=14, outline=INK+(255,), width=max(4,w//120))
    d.rounded_rectangle([18, 18, w-18, h-18], radius=9, outline=INK+(255,), width=2)
    f_top = font([MSJH], int(h*0.135)); f_cr = font([MSJH_B], int(h*0.30)); f_st = font([MSJH], int(h*0.135))
    def ctr(t, f, y):
        tw = d.textlength(t, font=f); d.text(((w-tw)/2, y), t, font=f, fill=INK+(255,))
    ctr("立 案 · 罪 名", f_top, h*0.14); ctr(crime, f_cr, h*0.34); ctr(statute, f_st, h*0.74)
    a = np.array(cv.split()[3])
    noise = (rng.random((h, w)) * 255).astype("uint8")
    a[np.array(Image.fromarray(noise, "L").filter(ImageFilter.GaussianBlur(0.6))) > 234] = 0
    cv.putalpha(Image.fromarray((a * 0.97).astype("uint8"), "L"))
    return cv.rotate(rng.integers(-9, -4), expand=True, resample=Image.BICUBIC)

# ── 載入一面、裁成直幅、蓋章 ──
def panel(path, pw, ph, crime, statute):
    im = Image.open(path).convert("RGB")
    w, h = im.size; cw = int(h * pw / ph)
    if cw <= w: x0 = (w-cw)//2; im = im.crop((x0, 0, x0+cw, h))
    else: ch = int(w * ph / pw); y0 = (h-ch)//2; im = im.crop((0, y0, w, y0+ch))
    im = im.resize((pw, ph), Image.LANCZOS).convert("RGBA")
    # 罪名改走頁面打字控罪清單（小照片蓋章會糊、讀不到）→ 照片保持乾淨
    # 細白框
    ImageDraw.Draw(im).rectangle([0, 0, pw-1, ph-1], outline=(245, 240, 228, 255), width=3)
    return im

side_h, front_h, ar = 560, 624, 0.80
sw, fw = int(side_h*ar), int(front_h*ar)
pad, gap, capb = 38, 18, 60
CW = pad + sw + gap + fw + gap + sw + pad
CH = pad + front_h + capb

# 泛黃相紙底
canvas = Image.new("RGBA", (CW, CH), (243, 235, 214, 255))

pL = panel(f"{ASSET}/arc-mugshot-bw-leftflip.png", sw, side_h, "嚴重破壞系統維護生態", "違反《軟體維運秩序法》§5")
pF = panel(f"{ASSET}/arc-mugshot-bw.png",          fw, front_h, "嚴重影響社群演算法", "違反《社群安寧法》§9")
pR = panel(f"{ASSET}/arc-mugshot-bw-right.png",     sw, side_h, "嚴重擾亂市場競爭秩序", "違反《公平競爭法》§7")

yF = pad; yS = pad + (front_h - side_h)//2
xL = pad; xF = pad + sw + gap; xR = xF + fw + gap
canvas.alpha_composite(pL, (xL, yS)); canvas.alpha_composite(pF, (xF, yF)); canvas.alpha_composite(pR, (xR, yS))

canvas = canvas.convert("RGB")
arr = np.asarray(canvas).astype(float)

# 暖色泛黃 + 降一點對比
arr *= np.array([1.0, 0.975, 0.90])
canvas = Image.fromarray(np.clip(arr, 0, 255).astype("uint8"))
canvas = ImageEnhance.Contrast(canvas).enhance(0.94)

# foxing 疊（multiply 低濃度）
fox = Image.open(f"{ASSET}/arc-foxing-b.png").convert("L").resize((CW, CH))
foxrgb = Image.merge("RGB", [fox]*3)
canvas = Image.blend(canvas, Image.composite(canvas, foxrgb, fox.point(lambda v: 255-(255-v)//3)), 0.0) \
         if False else Image.fromarray(np.clip(np.asarray(canvas)*(0.86+0.14*np.asarray(fox)[...,None]/255), 0, 255).astype("uint8"))

# 細顆粒
g = rng.normal(0, 5.5, (CH, CW, 1))
canvas = Image.fromarray(np.clip(np.asarray(canvas).astype(float)+g, 0, 255).astype("uint8"))

# 幾道輕刮痕
d = ImageDraw.Draw(canvas)
for _ in range(3):
    x = int(rng.integers(pad, CW-pad)); d.line([(x, pad), (x+rng.integers(-12, 12), CH-capb)],
        fill=(255, 252, 244), width=1)

# 底部打字機字幕（像歸檔標籤）
cap = font([MONO], 21)
d.text((pad+4, CH-capb+18), "ND-UT-0001  /  UNUSUAL SUBJECT  /  三面存證  /  不正常人類軟體開發  /  立案 2020",
       font=font([MSJH], 20), fill=(70, 56, 38))

canvas.save(OUT, quality=90)
print("saved", OUT, canvas.size)
