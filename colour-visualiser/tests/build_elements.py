"""Builds the all-elements test set (walls, ceilings, doors, frames, skirting, cabinets) from ADE20K validation.
ADE20K images are research-only: keep the output out of the repo and the product.
Usage: python3 build_elements.py <outdir>"""
import sys, io, os, json, collections, numpy as np, pyarrow.parquet as pq, fsspec
from PIL import Image
from scipy import ndimage as ndi
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
url = "https://huggingface.co/datasets/1aurent/ADE20K/resolve/main/data/validation-00000-of-00001.parquet"
pf = pq.ParquetFile(fsspec.filesystem("http", client_kwargs={"trust_env": True}).open(url, block_size=8 * 1024 * 1024))
def kind(nm):
    l = nm.lower()
    if l == 'wall': return 'wall'
    if l == 'ceiling': return 'ceiling'
    if 'skirting' in l or 'baseboard' in l: return 'skirting'
    if 'door frame' in l or 'doorframe' in l or 'casing' in l or 'window frame' in l: return 'frame'
    if l == 'door' or l.startswith('door,') or l == 'double door': return 'door'
    if l.startswith('cabinet') or l.startswith('cupboard') or l.startswith('wardrobe'): return 'cabinet'
    return None
cap = {'wall': 16, 'ceiling': 14, 'door': 14, 'frame': 16, 'skirting': 20, 'cabinet': 14}
minarea = {'wall': .05, 'ceiling': .04, 'door': .01, 'frame': .0015, 'skirting': .0012, 'cabinet': .015}
per = collections.Counter(); items = []; n = 0
for g in (1, 2, 3, 4, 5, 6, 0):
    for r in pf.read_row_group(g, columns=['image', 'segmentations', 'scene', 'objects']).to_pylist():
        if len(r['scene']) < 3 or r['scene'][1] != 'home or hotel': continue
        objs = {}
        for o in r['objects']:
            k = kind(o['name'])
            if k and per[k] < cap[k]: objs[int(o['name_ndx'])] = k
        if not objs: continue
        im = Image.open(io.BytesIO(r['image']['bytes'])).convert('RGB'); W, H = im.size
        seg = np.asarray(Image.open(io.BytesIO(r['segmentations'][0]['bytes'])).convert('RGB')).astype(np.int32)
        if min(W, H) < 500 or seg.shape[:2] != (H, W): continue
        cid = seg[..., 0] // 10 * 256 + seg[..., 1]; found = []
        for c, k in objs.items():
            m = cid == c; best = None
            for b in np.unique(seg[..., 2][m]):
                lab, cnt = ndi.label(m & (seg[..., 2] == b))
                if not cnt: continue
                sz = ndi.sum(np.ones_like(lab), lab, range(1, cnt + 1)); j = int(np.argmax(sz))
                if sz[j] >= minarea[k] * W * H and (best is None or sz[j] > best[0]): best = (sz[j], lab == j + 1)
            if best is not None: found.append((k, best[1]))
        # rarest kinds first, at most three pieces per photo
        found = sorted(found, key=lambda t: per[t[0]] / cap[t[0]])[:3]
        found = [t for t in found if per[t[0]] < cap[t[0]]]
        if not found: continue
        im.save(f'{out}/i{n}.jpg', quality=95)
        for j, (k, w) in enumerate(found):
            dt = ndi.distance_transform_edt(np.pad(w, 1))[1:-1, 1:-1]; y, x = np.unravel_index(dt.argmax(), dt.shape)
            Image.fromarray((w * 255).astype(np.uint8)).save(f'{out}/i{n}_w{j}.png')
            items.append(dict(img=f'i{n}.jpg', cls=f'i{n}_w{j}.png', gt=f'i{n}_w{j}.png', x=int(x), y=int(y), w=W, h=H, area=float(w.mean()), name=k)); per[k] += 1
        n += 1
        if all(per[k] >= cap[k] for k in cap): break
json.dump(items, open(out + '/items.json', 'w')); print('photos', n, 'pieces', dict(per))
