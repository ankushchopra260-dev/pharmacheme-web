import json
B=json.load(open('groups_base.json'))
D={
 'C|CN,H,H,H':(17.69,'acetonitrile'),
 'C|H,H,H,NO2':(-19.31,'nitromethane'),
 'C[B]|C[B],C[B],NO2':(-1.96,'nitrobenzene, nitrotoluenes, nitroanilines (4 compounds)'),
 'N|C,C,CO':(6.5,'N,N-dimethylformamide and N,N-dimethylacetamide'),
 'CO|N,N':(-28.9,'urea'),
 'CO|H,O':(-32.31,'formic acid and formates'),
 'CO|N,O':(-30.37,'ethyl carbamate'),
 'C|C,H,H,I':(8.51,'7 alkyl iodides'),
 'C|H,H,H,I':(3.58,'methyl iodide'),
 'C|C,C,H,I':(10.60,'2-iodopropane'),
 'C|C,C,C,I':(13.39,'tert-butyl iodide'),
 'C[B]|C[B],C[B],I':(23.20,'iodobenzene and iodotoluenes'),
 'C|C,C,C,NO2':(-11.73,'2-methyl-2-nitropropane'),
 'C|H,H,NO2,NO2':(-14.39,'dinitromethane'),
 'C|CN,CN,H,H':(63.46,'malononitrile'),
 'C[d]|C,CN,C[d]':(33.66,'1-cyanocyclohexene'),
 'C[t]|CO,C[t]':(24.09,'ethyl 2-pentynoate'),
 'C[d]|C,C[d],C[t]':(9.83,'2-methyl-1-buten-3-yne'),
 'C[t]|C[t],C[t]':(28.09,'1,3-butadiyne'),
 'C[d]|C[d],C[d],O':(9.86,'furan derivatives'),
 'C[t]|C[t],Cl':(27.87,'chloroethyne'),
 'C[t]|Br,C[t]':(38.75,'bromoethyne'),
 'C[d]|C[d],H,I':(24.75,'vinyl iodide'),
 'CO|C,I':(-19.96,'acetyl iodide'),
 'C|H,H,H,H':(-17.81,'methane (ATcT)'),
}
for k,(v,src) in D.items():
    if k in B['groups']: print('exists',k); continue
    B['groups'][k]={'v':v,'n':k,'src':'derived here from '+src}
json.dump(B,open('groups_all.json','w'),indent=0); print(len(B['groups']))
