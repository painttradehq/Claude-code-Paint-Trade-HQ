import json,sys,numpy as np
d=json.load(open(sys.argv[1])); ks=list(d[0]['R'])
print(' '*14+'  '.join(f"{k:>11s}" for k in ks))
for grp in ['skirting','frame','door','ALLTRIM','WALL']:
    v=[x for x in d if (x['name']!='WALL' if grp=='ALLTRIM' else x['name']==grp)]
    if not v: continue
    print(f"{grp:9s}n={len(v):2d} "+'  '.join(f"{np.mean([x['R'][k]['iou'] for x in v]):11.2f}" for k in ks))
    if grp=='WALL': print('  trim painted'+'  '.join(f"{np.mean([x['R'][k]['onTrim'] for x in v]):11.2f}" for k in ks))
    if grp=='ALLTRIM': print('  share >0.7  '+'  '.join(f"{np.mean([x['R'][k]['iou']>.7 for x in v]):11.2f}" for k in ks))
