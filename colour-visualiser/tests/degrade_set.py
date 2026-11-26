"""Makes phone-like copies of a test set: soft focus, grain, dim light, colour cast, heavy JPEG.
Usage: python3 degrade_set.py <setdir> <outdir> <typical|poor>"""
import sys, os, shutil, json, numpy as np
from PIL import Image, ImageFilter
src, out, level = sys.argv[1:4]
P = {'typical': dict(blur=1.6, noise=6, gain=0.85, cast=(1.03, 1.0, 0.94), q=62, motion=0),
     'poor':    dict(blur=2.6, noise=13, gain=0.55, cast=(1.08, 1.0, 0.86), q=40, motion=7)}[level]
os.makedirs(out, exist_ok=True); rng = np.random.default_rng(7)
for f in os.listdir(src):
    if not f.endswith('.jpg'): shutil.copy(f'{src}/{f}', f'{out}/{f}'); continue
    im = Image.open(f'{src}/{f}').convert('RGB'); k = max(im.size) / 1400          # strengths are in app-scale pixels
    im = im.filter(ImageFilter.GaussianBlur(P['blur'] * k))
    a = np.asarray(im).astype(np.float32)
    if P['motion']:                                                               # horizontal hand shake
        n = max(3, int(P['motion'] * k) | 1); ker = np.ones(n, np.float32) / n
        a = np.apply_along_axis(lambda r: np.convolve(r, ker, mode='same'), 1, a)
    a = a * P['gain'] * np.array(P['cast'], np.float32)
    a += rng.normal(0, P['noise'], a.shape) * (0.6 + 0.4 * (1 - a / 255))          # more grain in the shadows
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(f'{out}/{f}', quality=P['q'])
print(level, 'written to', out)
