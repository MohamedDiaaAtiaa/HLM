"""Regenerate the hero banner to match the new HM (Hassan & Mourad) brand:
charcoal gradient background, subtle gold glow, thin gold frame, and the new
gold logo centered. Keeps the original 1361x802 aspect ratio."""
from PIL import Image, ImageDraw, ImageFilter
import os, math

ROOT = os.path.dirname(os.path.abspath(__file__))
LOGO_PATHS = [
    os.path.join(ROOT, "Images", "Logo.png"),
    os.path.join(ROOT, "nextjs", "public", "images", "Logo.png"),
]
OUT_PATHS = [
    os.path.join(ROOT, "Images", "Banner - Hero.png"),
    os.path.join(ROOT, "nextjs", "public", "images", "Banner - Hero.png"),
    os.path.join(ROOT, "Images", "Banner-Hero-v2.png"),
    os.path.join(ROOT, "nextjs", "public", "images", "Banner-Hero-v2.png"),
]

W, H = 1361, 802
GOLD = (192, 160, 32)
top = (35, 35, 35)      # #232323
bottom = (20, 20, 20)   # #141414

# Vertical gradient
banner = Image.new("RGB", (W, H), bottom)
d = banner.load()
for y in range(H):
    t = y / (H - 1)
    r = int(top[0] + (bottom[0] - top[0]) * t)
    g = int(top[1] + (bottom[1] - top[1]) * t)
    b = int(top[2] + (bottom[2] - top[2]) * t)
    for x in range(W):
        d[x, y] = (r, g, b)

# Radial gold glow behind the logo
glow = Image.new("L", (W, H), 0)
gd = glow.load()
cx, cy = W // 2, int(H * 0.46)
maxr = math.hypot(W * 0.5, H * 0.55)
for y in range(H):
    for x in range(W):
        dist = math.hypot(x - cx, y - cy) / maxr
        v = int(max(0, (1 - dist)) ** 2 * 55)
        gd[x, y] = v
gold_layer = Image.new("RGB", (W, H), GOLD)
banner = Image.composite(gold_layer, banner, glow.filter(ImageFilter.GaussianBlur(60)))

draw = ImageDraw.Draw(banner)

# Thin gold outer frame
m = 34
draw.rectangle([m, m, W - m, H - m], outline=(150, 125, 30), width=2)
# Corner accents
acc = 46
for (px, py, sx, sy) in [(m, m, 1, 1), (W - m, m, -1, 1), (m, H - m, 1, -1), (W - m, H - m, -1, -1)]:
    draw.line([(px, py), (px + acc * sx, py)], fill=GOLD, width=4)
    draw.line([(px, py), (px, py + acc * sy)], fill=GOLD, width=4)

# Center the new logo
logo = Image.open(LOGO_PATHS[0]).convert("RGBA")
target_w = int(W * 0.60)
scale = target_w / logo.width
logo = logo.resize((target_w, int(logo.height * scale)), Image.LANCZOS)
lx = (W - logo.width) // 2
ly = (H - logo.height) // 2 - 10

# Soft drop shadow for depth
shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sh_alpha = logo.split()[3].point(lambda a: int(a * 0.35))
sh_img = Image.new("RGBA", logo.size, (0, 0, 0, 255))
shadow.paste(sh_img, (lx + 6, ly + 12), sh_alpha)
shadow = shadow.filter(ImageFilter.GaussianBlur(14))
banner = Image.alpha_composite(banner.convert("RGBA"), shadow).convert("RGB")

banner = banner.convert("RGBA")
banner.alpha_composite(logo, (lx, ly))
banner = banner.convert("RGB")

for p in OUT_PATHS:
    if os.path.isdir(os.path.dirname(p)):
        banner.save(p)
        print("saved ->", p)
