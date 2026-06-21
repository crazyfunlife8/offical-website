# -*- coding: utf-8 -*-
# 合成部落格 OG 分享卡（1200x630）：做舊紙底 + 機密章 + 巢洞徽記 + 碑刻標題
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
ASSET = "_imgtest"
OUT = "assets/images/og/blog.jpg"

INK   = (32, 18, 10)      # 暖近黑（標題）
GOLD  = (138, 106, 50)    # 舊金（副標 / 索引）
BLUE  = (31, 79, 143)     # 冷電藍（校樣線）
FAINT = (90, 74, 56)      # 淡褐（次要文字）


def font(paths, size):
    for p, idx in paths:
        try:
            return ImageFont.truetype(p, size, index=idx)
        except Exception:
            continue
    return ImageFont.load_default()

# 注意：mingliub.ttc 是「Ext-B 罕用字」擴充字型、無常用字 → 不可當中文標題字
MING_B = [("C:/Windows/Fonts/mingliu.ttc", 0), ("C:/Windows/Fonts/kaiu.ttf", 0),
          ("C:/Windows/Fonts/msjhbd.ttc", 0)]
MING   = [("C:/Windows/Fonts/mingliu.ttc", 0), ("C:/Windows/Fonts/times.ttf", 0)]  # 副標拉丁襯線
MONO_B = [("C:/Windows/Fonts/consolab.ttf", 0), ("C:/Windows/Fonts/consola.ttf", 0),
          ("C:/Windows/Fonts/arialbd.ttf", 0)]
MONO   = [("C:/Windows/Fonts/consola.ttf", 0), ("C:/Windows/Fonts/arial.ttf", 0)]

f_title = font(MING_B, 138)
f_sub   = font(MING,   50)
f_brand = font(MONO_B, 26)
f_idx   = font(MONO,   24)

# ── 底圖：做舊紙鋪滿（依寬縮放後置中裁切）──
paper = Image.open(f"{ASSET}/arc-paper.png").convert("RGB")
scale = W / paper.width
paper = paper.resize((W, int(paper.height * scale)), Image.LANCZOS)
top = (paper.height - H) // 2
base = paper.crop((0, top, W, top + H)).copy()

# ── 暗角（卷宗躺桌上的立體感）──
vig = Image.new("L", (W, H), 0)
ImageDraw.Draw(vig).ellipse([-W * 0.25, -H * 0.35, W * 1.25, H * 1.35], fill=255)
vig = vig.filter(ImageFilter.GaussianBlur(130))
dark = Image.new("RGB", (W, H), (24, 15, 8))
base = Image.composite(base, dark, vig)

draw = ImageDraw.Draw(base)

def tracked(d, xy, text, fnt, fill, tracking=0):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=fnt, fill=fill)
        x += d.textlength(ch, font=fnt) + tracking
    return x

PAD = 90

# ── 巢洞徽記 + 機構行（左上）──
nest = Image.open(f"{ASSET}/arc-nesthole.png").convert("RGBA")
nest = nest.resize((58, int(58 * nest.height / nest.width)), Image.LANCZOS)
base.paste(nest, (PAD, 66), nest)
tracked(draw, (PAD + 76, 74), "NEST DIGITAL", f_brand, INK, 2)
tracked(draw, (PAD + 76, 108), "ABNORMAL OBSERVATION FILE", f_idx, FAINT, 1)

# ── 主標題（碑刻；描邊加粗成碑刻凹刻感）──
draw.text((PAD, 246), "不正常觀點", font=f_title, fill=INK,
          stroke_width=2, stroke_fill=INK)

# ── 副標 + 校樣線 ──
sub_y = 408
draw.text((PAD + 4, sub_y), "Unconventional Takes", font=f_sub, fill=GOLD)
draw.rectangle([PAD + 6, sub_y + 70, PAD + 470, sub_y + 73], fill=BLUE)

# ── 底部索引條 ──
tracked(draw, (PAD + 6, 556), "ARCHIVE NO. ND-UT-2026  /  FIELD NOTES", f_idx, FAINT, 1)

# ── 機密章（右上負空間、輕微旋轉；縮小避開標題末字）──
stamp = Image.open(f"{ASSET}/arc-stamp-confidential.png").convert("RGBA")
sw = 300
stamp = stamp.resize((sw, int(sw * stamp.height / stamp.width)), Image.LANCZOS)
stamp = stamp.rotate(-9, expand=True, resample=Image.BICUBIC)
base.paste(stamp, (W - stamp.width - 52, 58), stamp)

# ── 迴紋針（右上紙緣）──
clip = Image.open(f"{ASSET}/arc-clip.png").convert("RGBA")
cw = 84
clip = clip.resize((cw, int(cw * clip.height / clip.width)), Image.LANCZOS)
base.paste(clip, (W - cw - 92, -30), clip)

base.save(OUT, "JPEG", quality=88, optimize=True)
print("saved", OUT, base.size)
