import json,sys,numpy as np
d=json.load(open(sys.argv[1])); keys=[k for k in d[0]['R'] if k!='npts']
print(f"taps {len(d)}  images {len(set(x['img'] for x in d))}  encode ms median {np.median([x['encMs'] for x in d]):.0f}  decode ms {np.median([x['T']['dec'] for x in d]):.0f}  edge ms {np.median([x['T']['edge'] for x in d]):.0f}")
print(f"{'method':22s} {'IoU':>6s} {'medIoU':>6s} {'recall':>6s} {'spill':>6s} {'nonwall':>7s} {'IoU>.8':>6s} {'IoU<.5':>6s}")
rows=[]
for k in keys:
    v=np.array([[x['R'][k][m] for m in ('iou','recall','spill','nonwall')] for x in d]); iou=v[:,0]
    rows.append((iou.mean(),f"{k:22s} {iou.mean():6.3f} {np.median(iou):6.3f} {v[:,1].mean():6.3f} {v[:,2].mean():6.3f} {v[:,3].mean():7.3f} {(iou>.8).mean():6.2f} {(iou<.5).mean():6.2f}"))
for _,r in sorted(rows,reverse=True): print(r)
