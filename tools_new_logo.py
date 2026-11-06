"""Replace logos with the new 2-name (Hassan & Mourad) artwork: remove the
charcoal background, generate a dark-ink light variant, and report the exact
brand colors (gold + charcoal) so the CSS theme can match the logo."""
from PIL import Image
from collections import Counter
import os, math

SRC = r"C:\Users\Jana Store\AppData\Roaming\Qoder\SharedClientCache\cache\images\45345461\cmtmzkwq-6a23fb83.png"
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT_DIRS = [
    os.path.join(ROOT, "nextjs", "public", "images"),
    os.path.join(ROOT, "Images"),
]

img = Image.open(SRC).convert("RGB")
px = img.load()
w, h = img.size

def corner_color(im):
    p = im.load()
    rs = gs = bs = n = 0
    for cx, cy in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]:
        for dx in range(-4,5):
            for dy in range(-4,5):
                x,y = max(0,min(w-1,cx+dx)), max(0,min(h-1,cy+dy))
                r,g,b = p[x,y]; rs+=r; gs+=g; bs+=b; n+=1
    return (rs//n, gs//n, bs//n)

bg = corner_color(img)

# dominant fg (gold)
c = Counter()
for y in range(0,h,2):
    for x in range(0,w,2):
        r,g,b = px[x,y]
        if math.sqrt((r-bg[0])**2+(g-bg[1])**2+(b-bg[2])**2) > 120:
            c[(r>>4<<4, g>>4<<4, b>>4<<4)] += 1
fg = c.most_common(1)[0][0]
print("bg charcoal:", bg, "hex: #%02X%02X%02X" % bg)
print("gold fg:", fg, "hex: #%02X%02X%02X" % fg)

dx,dy,dz = fg[0]-bg[0], fg[1]-bg[1], fg[2]-bg[2]
dl2 = dx*dx+dy*dy+dz*dz

gold_rgba = Image.new("RGBA",(w,h)); gp = gold_rgba.load()
ink = (30, 30, 32)  # charcoal ink for light variant (matches logo bg tone)
light_rgba = Image.new("RGBA",(w,h)); lp = light_rgba.load()

for y in range(h):
    for x in range(w):
        r,g,b = px[x,y]
        a = ((r-bg[0])*dx+(g-bg[1])*dy+(b-bg[2])*dz)/dl2 if dl2 else 0
        a = max(0.0, min(1.0, a))
        if a <= 0.02:
            gp[x,y]=(0,0,0,0); lp[x,y]=(0,0,0,0)
        else:
            rr = int(max(0,min(255, bg[0]+(r-bg[0])/a)))
            gg = int(max(0,min(255, bg[1]+(g-bg[1])/a)))
            bb = int(max(0,min(255, bg[2]+(b-bg[2])/a)))
            al = int(round(a*255))
            gp[x,y]=(rr,gg,bb,al)
            lp[x,y]=(ink[0],ink[1],ink[2],al)

for d in OUT_DIRS:
    if not os.path.isdir(d):
        continue
    gold_rgba.save(os.path.join(d,"Logo.png"))
    light_rgba.save(os.path.join(d,"Logo-light.png"))
    print("saved ->", d)
print("size:", w, h)
