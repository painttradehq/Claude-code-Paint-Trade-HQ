"""Builds the real-photo wall test set from ADE20K validation (visible wall labels).
ADE20K images are for non-commercial research use: keep the output out of the repo and the product.
Usage: python3 build_set.py <outdir>   (needs pyarrow, fsspec, aiohttp, scipy, pillow, numpy)"""
import sys, io, json, collections, numpy as np, pyarrow.parquet as pq, fsspec
from PIL import Image
from scipy import ndimage as ndi
out = sys.argv[1]
url = "https://huggingface.co/datasets/1aurent/ADE20K/resolve/main/data/validation-00000-of-00001.parquet"
pf = pq.ParquetFile(fsspec.filesystem("http", client_kwargs={"trust_env": True}).open(url, block_size=8 * 1024 * 1024))
want = {'bedroom': 12, 'living_room': 12, 'kitchen': 10, 'dining_room': 8, 'bathroom': 6, 'home_office': 4}
got = collections.Counter(); items = []; n = 0
for g in (1, 2, 3, 4, 5):
    for r in pf.read_row_group(g, columns=['image', 'segmentations', 'scene', 'objects']).to_pylist():
        s = r['scene'][2] if len(r['scene']) > 2 else ''
        if s not in want or got[s] >= want[s]: continue
        im = Image.open(io.BytesIO(r['image']['bytes'])).convert('RGB'); W, H = im.size
        seg = np.asarray(Image.open(io.BytesIO(r['segmentations'][0]['bytes'])).convert('RGB')).astype(np.int32)
        if min(W, H) < 400 or seg.shape[:2] != (H, W): continue
        ndx = {int(o['name_ndx']) for o in r['objects'] if o['name'] == 'wall'}
        cls = np.isin(seg[..., 0] // 10 * 256 + seg[..., 1], list(ndx)) if ndx else np.zeros((H, W), bool)
        if cls.mean() < 0.04: continue
        comps = []
        for b in np.unique(seg[..., 2][cls]):
            lab, k = ndi.label(cls & (seg[..., 2] == b))
            if not k: continue
            sz = ndi.sum(np.ones_like(lab), lab, range(1, k + 1)); j = int(np.argmax(sz))
            if sz[j] >= 0.04 * W * H: comps.append(lab == j + 1)
        comps = sorted(comps, key=lambda w: -w.mean())[:2]
        if not comps: continue
        im.save(f'{out}/i{n}.jpg', quality=95); Image.fromarray((cls * 255).astype(np.uint8)).save(f'{out}/i{n}_cls.png')
        for j, w in enumerate(comps):
            dt = ndi.distance_transform_edt(np.pad(w, 1))[1:-1, 1:-1]; y, x = np.unravel_index(dt.argmax(), dt.shape)
            Image.fromarray((w * 255).astype(np.uint8)).save(f'{out}/i{n}_w{j}.png')
            items.append(dict(img=f'i{n}.jpg', cls=f'i{n}_cls.png', gt=f'i{n}_w{j}.png', x=int(x), y=int(y), w=W, h=H, scene=s, area=float(w.mean())))
        n += 1; got[s] += 1
json.dump(items, open(out + '/items.json', 'w')); print('images', n, 'taps', len(items), dict(got))
