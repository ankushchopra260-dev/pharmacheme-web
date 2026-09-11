const SOLVENT_DB = {"Toluene":{"A":6.95087,"B":1342.31,"C":219.187,"latent":84.0,"density":867,"cp":0.41,"mw":92.0},"Methanol":{"A":8.08097,"B":1582.271,"C":239.726,"latent":263.0,"density":791,"cp":0.60669,"mw":32.0},"MDC":{"A":7.0803,"B":1138.91,"C":231.45,"latent":97.0,"density":1330,"cp":0.289474,"mw":85.0},"Water":{"A":8.07131,"B":1730.63,"C":233.426,"latent":539.0,"density":1000,"cp":1.0,"mw":18.0},"Ethanol":{"A":8.1122,"B":1592.864,"C":226.184,"latent":202.0,"density":789,"cp":0.587561,"mw":46.0},"Cyclohexane":{"A":7.264753,"B":1434.148339,"C":246.720693,"latent":85.0,"density":779,"cp":0.444293,"mw":84.0},"Ethyl acetate":{"A":7.10179,"B":1244.95,"C":217.881,"latent":87.6,"density":895,"cp":0.455502,"mw":88.0},"Acetone":{"A":7.11714,"B":1210.595,"C":229.664,"latent":124.0,"density":786,"cp":0.512,"mw":58.08},"Xylene":{"A":6.99053,"B":1453.43,"C":215.3,"latent":82.9,"density":870,"cp":0.41,"mw":106.16},"NMP":{"A":7.54826,"B":1979.68,"C":222.2,"latent":127.3,"density":1030,"cp":0.502,"mw":99.13},"IPA":{"A":8.87829,"B":2010.33,"C":252.636,"latent":159.0,"density":785,"cp":0.368421,"mw":82.4},"Acetonitrile":{"A":7.0735,"B":1279.2,"C":224.01,"latent":174.0,"density":786,"cp":0.54,"mw":41.05},"n-Heptane":{"A":6.89385,"B":1264.37,"C":216.636,"latent":87.221233,"density":684,"cp":0.534537,"mw":100.0},"abietic acid":{"A":7.06195,"B":1850.91,"C":66.1306},"acenaphthene":{"A":7.16063,"B":2033.35,"C":197.714},"acetal":{"A":7.28439,"B":1445.63,"C":224.685},"acetaldehyde":{"A":7.25504,"B":1110.4,"C":233.451},"acetamide":{"A":7.40993,"B":1808.24,"C":178.098},"acetanilide":{"A":7.49658,"B":2229.78,"C":179.279},"acetic acid":{"A":7.8152,"B":1800.03,"C":246.894},"acetic anhydride":{"A":8.81453,"B":2394.8,"C":264.961},"acetone cyanohydrin":{"A":8.91995,"B":3024.38,"C":310.947},"acetophenone":{"A":7.39996,"B":1901.19,"C":218.697},"acetylacetone":{"A":7.43842,"B":1599.97,"C":210.655},"acetyl chloride":{"A":7.34554,"B":1271.26,"C":233.984},"acetylene":{"A":7.31465,"B":790.209,"C":262.859},"acrolein":{"A":7.38041,"B":1343.54,"C":245.902},"acrylamide":{"A":6.4374,"B":894.333,"C":58.8579},"acrylic acid":{"A":7.82557,"B":1817.73,"C":226.609},"acrylonitrile":{"A":7.4321,"B":1482.76,"C":248.44},"adipic acid":{"A":8.52199,"B":2969.1,"C":188.477},"adiponitrile":{"A":7.61843,"B":2295.33,"C":189.49},"allene":{"A":6.92395,"B":833.311,"C":240.605},"allyl acetate":{"A":7.45775,"B":1609.44,"C":247.641},"allyl alcohol":{"A":7.96765,"B":1704.51,"C":238.003},"allylamine":{"A":7.32854,"B":1274.12,"C":233.166},"3-amino-1-propanol":{"A":8.07048,"B":1946.9,"C":187.65},"1-amino-2,2-dimethylbutane":{"A":6.87335,"B":1182.53,"C":182.684},"1-amino-2,3-dimethylbutane":{"A":6.94084,"B":1180.99,"C":185.882},"2-amino-2,3-dimethylbutane":{"A":6.95778,"B":1218.6,"C":194.398},"1-amino-2-ethylbutane":{"A":6.98809,"B":1289.13,"C":178.246},"1-amino-2-methylpentane":{"A":6.9913,"B":1264.03,"C":180.662},"2-amino-2-methylpentane":{"A":6.87708,"B":1156.29,"C":185.343},"3-amino-2-methylpentane":{"A":6.9294,"B":1265.92,"C":177.501},"1-amino-2-propanol":{"A":8.01915,"B":1807.96,"C":192.396},"1-amino-3,3-dimethylbutane":{"A":6.86631,"B":1235.92,"C":177.274},"2-amino-3,3-dimethyl butane":{"A":6.82011,"B":1130.77,"C":185.049},"1-amino-3-methylpentane":{"A":7.05717,"B":1264.03,"C":180.662},"2-amino-3-methylpentane":{"A":6.9294,"B":1265.92,"C":177.501},"3-amino-3-methylpentane":{"A":6.86897,"B":1215.12,"C":179.381},"1-amino-4-methylpentane":{"A":6.99241,"B":1255.58,"C":181.475},"2-amino-4-methylpentane":{"A":6.93942,"B":1190.84,"C":184.91},"p-aminoazobenzene":{"A":7.47943,"B":2420.19,"C":166.437},"p-aminodiphenyl":{"A":7.44251,"B":2227.77,"C":186.514},"p-aminodiphenylamine":{"A":7.66753,"B":2520.35,"C":172.53},"2-aminoethoxyethanol":{"A":8.14609,"B":2165.16,"C":170.364},"N-aminoethyl ethanolamine":{"A":8.46342,"B":2421.58,"C":189.922},"N-aminoethyl piperazine":{"A":7.57065,"B":1980.02,"C":201.794},"2-aminohexane":{"A":6.99013,"B":1273.04,"C":179.794},"3-aminohexane":{"A":6.98809,"B":1289.13,"C":178.246},"6-aminohexanol":{"A":8.26771,"B":2347.46,"C":200.922},"p-tert-amylphenol":{"A":7.38313,"B":2007.72,"C":183.931},"anethole":{"A":7.29113,"B":1918.63,"C":199.732},"aniline":{"A":7.29291,"B":1668.15,"C":193.636},"anisole":{"A":7.32615,"B":1674.45,"C":223.096},"anthracene":{"A":7.62455,"B":2759.81,"C":239.75},"anthraquinone":{"A":8.49022,"B":3820.73,"C":301.228},"ascorbic acid":{"A":10.2475,"B":3536.95,"C":116.281},"azelaic acid":{"A":8.35296,"B":2820.61,"C":155.238},"azulene":{"A":7.71999,"B":2566.46,"C":288.342},"benzaldehyde":{"A":7.25411,"B":1734.8,"C":217.931},"benzene":{"A":7.06437,"B":1296.93,"C":229.916},"1,2,3-benzenetriol":{"A":9.38415,"B":3798.12,"C":275.326},"benzoic acid":{"A":7.41844,"B":1824.74,"C":152.886},"benzonitrile":{"A":7.36682,"B":1868.3,"C":225.472},"benzophenone":{"A":7.64336,"B":2518.51,"C":222.727},"benzothiophene":{"A":7.16508,"B":1854.63,"C":212.993},"benzotrichloride":{"A":7.03224,"B":1802.94,"C":220.794},"benzotrifluoride":{"A":7.03951,"B":1363.9,"C":225.913},"benzoyl chloride":{"A":7.54146,"B":2017.05,"C":235.784},"benzyl acetate":{"A":7.3784,"B":1914.89,"C":212.258},"benzyl alcohol":{"A":7.92338,"B":2060.53,"C":203.928},"benzylamine":{"A":7.40339,"B":1813.01,"C":216.379},"benzyl benzoate":{"A":7.49894,"B":2356.69,"C":186.813},"benzyl chloride":{"A":7.195,"B":1731.66,"C":221.989},"benzyl dichloride":{"A":7.34379,"B":2033.3,"C":241.742},"benzyl ethyl ether":{"A":7.32289,"B":1799.43,"C":220.087},"biacetylene":{"A":6.5326,"B":761.685,"C":198.268},"bicyclohexyl":{"A":7.27281,"B":2010.95,"C":218.827},"bis(chloromethyl) ether":{"A":7.25172,"B":1441.52,"C":224.949},"bis(cyanoethyl) ether":{"A":7.85429,"B":2474.89,"C":191.768},"bisphenol a":{"A":7.13999,"B":1756.42,"C":51.8844},"cis-1-bromo-1-butene":{"A":6.83966,"B":1075.86,"C":185.61},"trans-1-bromo-1-butene":{"A":6.83616,"B":1098.81,"C":183.104},"2-bromo-1-butene":{"A":6.80854,"B":1051.64,"C":186.748},"3-bromo-1-butene":{"A":6.791,"B":1112.47,"C":179.505},"4-bromo-1-butene":{"A":6.85069,"B":1116.09,"C":182.341},"cis-1-bromo-1-decene":{"A":7.09388,"B":1626.22,"C":160.994},"trans-1-bromo-1-decene":{"A":7.09388,"B":1626.22,"C":160.994},"cis-1-bromo-1-dodecene":{"A":7.18345,"B":1792.1,"C":155.513},"trans-1-bromo-1-dodecene":{"A":7.18345,"B":1792.1,"C":155.513},"cis-1-bromo-1-eicosene":{"A":7.30086,"B":2267.25,"C":137.947},"trans-1-bromo-1-eicosene":{"A":7.30086,"B":2267.25,"C":137.947},"cis-1-bromo-1-heptadecene":{"A":7.32559,"B":2138.36,"C":144.095},"trans-1-bromo-1-heptadecene":{"A":7.32559,"B":2138.36,"C":144.095},"cis-1-bromo-1-heptene":{"A":6.95558,"B":1361.36,"C":171.095},"trans-1-bromo-1-heptene":{"A":6.95558,"B":1361.36,"C":171.095},"cis-1-bromo-1-hexadecene":{"A":7.31197,"B":2079.35,"C":146.257},"trans-1-bromo-1-hexadecene":{"A":7.31197,"B":2079.35,"C":146.257},"cis-1-bromo-1-hexene":{"A":6.91272,"B":1270.51,"C":175.115},"trans-1-bromo-1-hexene":{"A":6.91272,"B":1270.51,"C":175.115},"cis-1-bromo-1-nonadecene":{"A":7.32122,"B":2233.28,"C":139.946},"trans-1-bromo-1-nonadecene":{"A":7.32122,"B":2233.28,"C":139.946},"cis-1-bromo-1-nonene":{"A":7.04732,"B":1538.25,"C":164.195},"trans-1-bromo-1-nonene":{"A":7.04732,"B":1538.25,"C":164.195},"cis-1-bromo-1-octadecene":{"A":7.32915,"B":2188.91,"C":142.073},"trans-1-bromo-1-octadecene":{"A":7.32915,"B":2188.91,"C":142.073},"cis-1-bromo-1-octene":{"A":7.00217,"B":1437.21,"C":168.724},"trans-1-bromo-1-octene":{"A":7.00217,"B":1437.21,"C":168.724},"cis-1-bromo-1-pentadecene":{"A":7.28944,"B":2016.18,"C":148.326},"trans-1-bromo-1-pentadecene":{"A":7.28944,"B":2016.18,"C":148.326},"cis-1-bromo-1-pentene":{"A":6.87345,"B":1176.84,"C":179.754},"trans-1-bromo-1-pentene":{"A":6.87345,"B":1176.84,"C":179.754},"2-bromo-1-pentene":{"A":6.84283,"B":1146.59,"C":181.395},"3-bromo-1-pentene":{"A":6.83395,"B":1148.98,"C":180.649},"4-bromo-1-pentene":{"A":6.83358,"B":1151.68,"C":180.361},"5-bromo-1-pentene":{"A":6.8853,"B":1219.21,"C":176.462},"cis-1-bromo-1-propene":{"A":6.81089,"B":979.705,"C":191.484},"trans-1-bromo-1-propene":{"A":6.80835,"B":993.911,"C":189.862},"2-bromo-1-propene":{"A":6.78209,"B":945.427,"C":193.938},"3-bromo-1-propene":{"A":7.35721,"B":1433.47,"C":250.22},"cis-1-bromo-1-tetradecene":{"A":7.25959,"B":1946.58,"C":150.55},"trans-1-bromo-1-tetradecene":{"A":7.25959,"B":1946.58,"C":150.55},"cis-1-bromo-1-tridecene":{"A":7.22381,"B":1871.57,"C":152.941},"trans-1-bromo-1-tridecene":{"A":7.22381,"B":1871.57,"C":152.941},"cis-1-bromo-1-undecene":{"A":7.13956,"B":1712.11,"C":158.021},"trans-1-bromo-1-undecene":{"A":7.13956,"B":1712.11,"C":158.021},"1-bromo-2,2-dimethylbutane":{"A":6.89916,"B":1259.49,"C":176.585},"1-bromo-2,2-dimethylpropane":{"A":6.74106,"B":1108.06,"C":181.044},"1-bromo-2,3-dimethylbutane":{"A":6.77746,"B":1222.91,"C":173.837},"2-bromo-2,3-dimethylbutane":{"A":7.10497,"B":1411.09,"C":201.053},"1-bromo-cis-2-butene":{"A":6.83254,"B":1123.79,"C":180.379},"1-bromo-trans-2-butene":{"A":6.83254,"B":1123.79,"C":180.379},"2-bromo-cis-2-butene":{"A":6.79053,"B":1058.37,"C":184.901},"2-bromo-trans-2-butene":{"A":6.78692,"B":1082.16,"C":182.244},"3-bromo-2-ethyl-1-propene":{"A":6.84461,"B":1134.02,"C":182.725},"1-bromo-2-ethylbutane":{"A":6.71999,"B":1210.12,"C":171.902},"cis-1-bromo-2-methyl-1-butene":{"A":6.8231,"B":1164.47,"C":178.378},"trans-1-bromo-2-methyl-1-butene":{"A":6.8231,"B":1164.47,"C":178.378},"3-bromo-2-methyl-1-butene":{"A":6.78741,"B":1112.69,"C":181.894},"4-bromo-2-methyl-1-butene":{"A":6.84461,"B":1134.02,"C":182.725},"1-bromo-2-methyl-1-propene":{"A":6.78842,"B":1072.11,"C":183.366},"3-bromo-2-methyl-1-propene":{"A":6.8028,"B":1088.87,"C":182.631},"1-bromo-2-methyl-cis-2-butene":{"A":6.82062,"B":1183.36,"C":176.359},"1-bromo-2-methyl-trans-2-butene":{"A":6.82062,"B":1183.36,"C":176.359},"1-bromo-2-methylbutane":{"A":6.85575,"B":1189.69,"C":178.797},"2-bromo-2-methylbutane":{"A":6.74032,"B":1113.33,"C":180.465},"1-bromo-2-methylpentane":{"A":6.89674,"B":1279.44,"C":174.591},"2-bromo-2-methylpentane":{"A":7.68278,"B":1850.66,"C":242.895},"3-bromo-2-methylpentane":{"A":6.84404,"B":1215.67,"C":177.927},"1-bromo-2-methylpropane":{"A":6.82042,"B":1088.09,"C":184.662},"2-bromo-2-methylpropane":{"A":6.70881,"B":1000.45,"C":188.099},"1-bromo-cis-2-pentene":{"A":6.87054,"B":1198.76,"C":177.463},"1-bromo-trans-2-pentene":{"A":6.87054,"B":1198.76,"C":177.463},"2-bromo-cis-2-pentene":{"A":6.82493,"B":1150.97,"C":179.82},"2-bromo-trans-2-pentene":{"A":6.82493,"B":1150.97,"C":179.82},"3-bromo-cis-2-pentene":{"A":6.82567,"B":1145.58,"C":180.397},"3-bromo-trans-2-pentene":{"A":6.82567,"B":1145.58,"C":180.397},"4-bromo-cis-2-pentene":{"A":6.81521,"B":1160.04,"C":178.345},"4-bromo-trans-2-pentene":{"A":6.81521,"B":1160.04,"C":178.345},"5-bromo-cis-2-pentene":{"A":6.86983,"B":1204.24,"C":176.89},"5-bromo-trans-2-pentene":{"A":6.86983,"B":1204.24,"C":176.89},"1-bromo-3,3-dimethylbutane":{"A":6.84123,"B":1238.13,"C":175.625},"2-bromo-3,3-dimethylbutane":{"A":6.72361,"B":1180.24,"C":175.131},"cis-1-bromo-3-methyl-1-butene":{"A":6.81759,"B":1142.54,"C":180.223},"trans-1-bromo-3-methyl-1-butene":{"A":6.81759,"B":1142.54,"C":180.223},"2-bromo-3-methyl-1-butene":{"A":6.78815,"B":1107.55,"C":182.453},"3-bromo-3-methyl-1-butene":{"A":6.71815,"B":1081.27,"C":181.517},"4-bromo-3-methyl-1-butene":{"A":6.83661,"B":1130.17,"C":182.649},"1-bromo-3-methyl-2-butene":{"A":6.82536,"B":1147.87,"C":180.152},"2-bromo-3-methyl-2-butene":{"A":6.7737,"B":1149.42,"C":177.261},"1-bromo-3-methylbutane":{"A":6.85579,"B":1189.41,"C":178.825},"2-bromo-3-methylbutane":{"A":6.80014,"B":1154.73,"C":179.324},"1-bromo-3-methylpentane":{"A":6.89542,"B":1290.6,"C":173.476},"2-bromo-3-methylpentane":{"A":6.84404,"B":1215.67,"C":177.927},"3-bromo-3-methylpentane":{"A":6.95052,"B":1301.81,"C":189.878},"1-bromo-4-methylpentane":{"A":6.89575,"B":1287.81,"C":173.755},"2-bromo-4-methylpentane":{"A":6.84328,"B":1221.67,"C":177.311},"bromobenzene":{"A":7.13213,"B":1615.76,"C":223.972},"1-bromobutane":{"A":7.25188,"B":1456.01,"C":231.502},"2-bromobutane":{"A":7.23919,"B":1435.76,"C":238.205},"bromochlorodifluoromethane":{"A":7.04234,"B":1021.9,"C":249.569},"bromochloromethane":{"A":7.30547,"B":1357.06,"C":238.654},"1-bromodecane":{"A":7.55047,"B":2129.17,"C":215.358},"1-bromodocosane":{"A":7.37833,"B":2563.59,"C":162.001},"1-bromododecane":{"A":7.59557,"B":2268.78,"C":205.309},"1-bromodotriacontane":{"A":6.64653,"B":2423,"C":147.437},"1-bromoeicosane":{"A":7.32284,"B":2339.51,"C":140.677},"bromoethane":{"A":7.31438,"B":1260.42,"C":245.939},"bromoform":{"A":7.04365,"B":1526.6,"C":217.523},"1-bromoheneicosane":{"A":7.44003,"B":2557.73,"C":164.001},"1-bromohentriacontane":{"A":6.70862,"B":2441.39,"C":149.803},"1-bromoheptacosane":{"A":6.73458,"B":2252.5,"C":128.493},"1-bromoheptadecane":{"A":7.5757,"B":2467.11,"C":176.488},"1-bromoheptane":{"A":7.36161,"B":1802.33,"C":223.334},"1-bromoheptatriacontane":{"A":6.39519,"B":2350.69,"C":137.88},"1-bromohexacosane":{"A":6.98574,"B":2467.06,"C":154.001},"1-bromohexadecane":{"A":7.59139,"B":2437.36,"C":181.422},"1-bromohexane":{"A":7.45417,"B":1793.95,"C":236.962},"2-bromohexane":{"A":6.89677,"B":1279.16,"C":174.619},"3-bromohexane":{"A":6.89764,"B":1271.9,"C":175.344},"1-bromohexatriacontane":{"A":6.44305,"B":2364.26,"C":139.702},"1-bromonaphthalene":{"A":7.26796,"B":2139.41,"C":206.554},"1-bromononacosane":{"A":6.18881,"B":1785.33,"C":66.7022},"1-bromononadecane":{"A":7.41975,"B":2391.59,"C":152.906},"1-bromononane":{"A":7.52501,"B":2052.39,"C":220.525},"1-bromononatriacontane":{"A":6.31696,"B":2330.12,"C":135.12},"1-bromooctacosane":{"A":6.45576,"B":2006.26,"C":97.1988},"1-bromooctadecane":{"A":7.49757,"B":2427.7,"C":163.844},"1-bromooctane":{"A":7.49972,"B":1970.73,"C":225.866},"1-bromooctatriacontane":{"A":6.35562,"B":2340.18,"C":136.469},"1-bromopentacosane":{"A":7.10362,"B":2504.13,"C":156.001},"1-bromopentadecane":{"A":7.62504,"B":2431.01,"C":190.413},"1-bromopentane":{"A":9.01055,"B":2883.39,"C":340.804},"2-bromopentane":{"A":6.85688,"B":1181.21,"C":179.68},"3-bromopentane":{"A":6.85644,"B":1184.49,"C":179.338},"1-bromopentatriacontane":{"A":6.49209,"B":2378.29,"C":141.574},"1-bromopropane":{"A":7.33043,"B":1403.41,"C":244.4},"2-bromopropane":{"A":7.27146,"B":1339.77,"C":245.732},"1-bromotetracontane":{"A":6.27921,"B":2320.55,"C":133.835},"1-bromotetracosane":{"A":7.20969,"B":2536.72,"C":158.001},"1-bromotetradecane":{"A":7.62292,"B":2383.07,"C":195.534},"1-bromotetratriacontane":{"A":6.54234,"B":2392.77,"C":143.49},"p-bromotoluene":{"A":7.3498,"B":1871.14,"C":234.343},"1-bromotriacontane":{"A":6.78193,"B":2481.09,"C":154.995},"bromotrichloromethane":{"A":7.1184,"B":1455.22,"C":238.507},"1-bromotricosane":{"A":7.30114,"B":2554.95,"C":160.001},"1-bromotridecane":{"A":7.63156,"B":2352.16,"C":203.114},"bromotrifluoroethylene":{"A":7.018,"B":1010.75,"C":246.808},"bromotrifluoromethane":{"A":6.9716,"B":800.838,"C":253.656},"1-bromotritriacontane":{"A":6.59381,"B":2407.68,"C":145.446},"1-bromoundecane":{"A":7.57362,"B":2200.78,"C":210.169},"1,2-butadiene":{"A":7.27134,"B":1169.61,"C":255.545},"butadiene (1,3 butadiene)":{"A":7.02238,"B":998.751,"C":245.563},"butane":{"A":7.00961,"B":1022.48,"C":248.145},"1,2-butanediol":{"A":9.55708,"B":3097.79,"C":273},"1,3-butanediol":{"A":8.97864,"B":2583.12,"C":216.613},"1,4-butanediol":{"A":9.37541,"B":3080.18,"C":246.268},"butanol":{"A":7.62121,"B":1543.89,"C":208.029},"sec-butanol":{"A":7.56142,"B":1448.35,"C":209.886},"tert-butanol":{"A":7.13278,"B":1068.74,"C":168.931},"1-butene":{"A":7.0342,"B":1013.6,"C":250.292},"cis-2-butene":{"A":7.02701,"B":1028.06,"C":244.234},"trans-2-butene":{"A":7.06654,"B":1038.12,"C":247.135},"cis-2-butene-1,4-diol":{"A":9.40227,"B":3113.76,"C":242.464},"trans-2-butene-1,4-diol":{"A":9.49439,"B":3242.29,"C":253.397},"cis-2-butenoic acid":{"A":7.60698,"B":1752.54,"C":198.917},"trans-2-butenoic acid":{"A":7.49988,"B":1701.16,"C":183.292},"cis-(1-butenyl)benzene":{"A":7.05973,"B":1638.51,"C":203.09},"trans-(1-butenyl)benzene":{"A":7.05723,"B":1670.28,"C":201.251},"2-butoxyethanol":{"A":8.29012,"B":2182.89,"C":232.223},"2-sec-butyl-1,3-propanediol":{"A":9.56529,"B":3396.12,"C":273},"1-butyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.19432,"B":1985.24,"C":187.105},"2-butyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.19321,"B":2003.48,"C":186.085},"butyl acetate":{"A":7.23548,"B":1515.76,"C":222.077},"sec-butyl acetate":{"A":7.32351,"B":1539.86,"C":234.604},"tert-butyl acetate":{"A":7.07055,"B":1327.54,"C":220.856},"butyl acrylate":{"A":7.32729,"B":1687.45,"C":231.652},"butylamine":{"A":7.21033,"B":1316.41,"C":226.655},"sec-butylamine":{"A":7.17241,"B":1290.85,"C":237.787},"tert-butylamine":{"A":7.15888,"B":1216.94,"C":240.061},"butylbenzene":{"A":7.18472,"B":1720.37,"C":216.413},"sec-butylbenzene":{"A":6.90771,"B":1536.8,"C":208.305},"tert-butylbenzene":{"A":6.88707,"B":1509.57,"C":207.654},"butyl benzoate":{"A":7.59592,"B":2225.32,"C":221.955},"butyl butanoate":{"A":7.32431,"B":1719.58,"C":221.989},"sec-butyl butanoate":{"A":6.98455,"B":1352.83,"C":177.659},"tert-butyl butanoate":{"A":6.94196,"B":1290.79,"C":181.839},"p-tert-butylcatechol":{"A":7.78202,"B":2265.73,"C":177.43},"butylcyclohexane":{"A":6.87773,"B":1570.94,"C":212.057},"butylcyclopentane":{"A":7.05154,"B":1551.44,"C":215.372},"sec-butylcyclopentane":{"A":6.95241,"B":1482.16,"C":209.674},"tert-butylcyclopentane":{"A":6.8417,"B":1411.38,"C":211.479},"1-butylcyclopentene":{"A":7.02187,"B":1512.98,"C":209.36},"butyl decyl sulfide":{"A":7.78265,"B":2485.95,"C":211.297},"butyl dodecyl sulfide":{"A":7.22342,"B":2014.32,"C":140},"tert-butylformamide":{"A":7.31893,"B":1800.86,"C":203.771},"butyl formate":{"A":7.3709,"B":1546.73,"C":238.376},"sec-butyl formate":{"A":6.82272,"B":1125.4,"C":195.097},"tert-butyl formate":{"A":6.75103,"B":1054.36,"C":189.629},"sec-butyl glycolate":{"A":7.92251,"B":2068.51,"C":232.782},"4-tert-butylheptane":{"A":6.83947,"B":1431.85,"C":187.7},"butyl heptyl sulfide":{"A":7.09661,"B":1759.04,"C":170.4},"butyl hexadecyl sulfide":{"A":7.18259,"B":2111.53,"C":119.001},"butyl hexyl sulfide":{"A":7.16824,"B":1809.06,"C":195.094},"butyl isocyanate":{"A":7.30431,"B":1503.29,"C":224.841},"butyl isocyanide":{"A":6.95055,"B":1242.13,"C":180.713},"sec-butyl isocyanide":{"A":6.89682,"B":1185.65,"C":183.38},"tert-butyl isocyanide":{"A":6.78399,"B":1088.6,"C":187.402},"butyl mercaptan":{"A":7.14944,"B":1415.11,"C":233.055},"sec-butyl mercaptan":{"A":7.15048,"B":1391.49,"C":240.922},"tert-butyl mercaptan":{"A":6.92597,"B":1187.37,"C":229.308},"butyl methacrylate":{"A":7.19482,"B":1609.88,"C":212.325},"1-butylnaphthalene":{"A":7.32328,"B":2164.31,"C":197.795},"2-butylnaphthalene":{"A":7.59916,"B":2467.29,"C":233.904},"1-sec-butylnaphthalene":{"A":6.73898,"B":1854.71,"C":207.724},"2-sec-butylnaphthalene":{"A":8.51736,"B":3993.45,"C":396.231},"1-tert-butylnaphthalene":{"A":7.15868,"B":2021.32,"C":194.207},"2-tert-butylnaphthalene":{"A":7.20867,"B":2087.26,"C":202.184},"butyl nonanoate":{"A":7.6466,"B":2030.51,"C":196.21},"butyl nonyl sulfide":{"A":7.13871,"B":1863.9,"C":157.9},"4-tert-butyloctane":{"A":6.86245,"B":1484.49,"C":181.835},"butyl octyl sulfide":{"A":7.61843,"B":2223.04,"C":205.383},"butyl pentadecyl sulfide":{"A":7.20937,"B":2103.03,"C":124},"butyl pentyl sulfide":{"A":7.15298,"B":1737.33,"C":199.813},"2-butylphenol":{"A":7.13364,"B":1701.13,"C":165},"3-butylphenol":{"A":7.25024,"B":1800.2,"C":165},"4-butylphenol":{"A":7.25167,"B":1805.16,"C":165},"2-sec-butylphenol":{"A":7.16713,"B":1684.52,"C":165},"3-sec-butylphenol":{"A":7.18027,"B":1727.74,"C":165},"4-sec-butylphenol":{"A":7.18785,"B":1753.4,"C":165},"2-tert-butylphenol":{"A":7.04719,"B":1621.06,"C":165},"3-tert-butylphenol":{"A":7.06984,"B":1696.56,"C":165},"4-tert-butylphenol":{"A":7.06947,"B":1695.28,"C":165},"butyl propanoate":{"A":7.39996,"B":1681.36,"C":225.452},"sec-butyl propanoate":{"A":7.38037,"B":1412.36,"C":180.889},"tert-butyl propanoate":{"A":7.58433,"B":1535.55,"C":185.069},"butyl stearate":{"A":7.76507,"B":2544.16,"C":170.889},"butyl tetradecyl sulfide":{"A":7.13143,"B":2069.41,"C":135},"butyl tridecyl sulfide":{"A":7.25728,"B":2069.41,"C":135},"butyl undecyl sulfide":{"A":7.22529,"B":1980.43,"C":146},"butyl valerate":{"A":7.58116,"B":1951.79,"C":228.743},"butyl vinyl ether":{"A":7.21206,"B":1398.28,"C":229.015},"2-butyne-1,4-diol":{"A":8.51955,"B":2280.56,"C":166.445},"butyraldehyde":{"A":7.21736,"B":1317.94,"C":229.115},"butyric acid":{"A":7.68706,"B":1778.18,"C":206.702},"butyric anhydride":{"A":7.66787,"B":1931.49,"C":208.482},"gamma-butyrolactone":{"A":7.67415,"B":2147.61,"C":244.041},"butyronitrile":{"A":7.36921,"B":1593.17,"C":237.353},"camphene":{"A":6.99704,"B":1573.98,"C":221.884},"camphor":{"A":6.94819,"B":1641.75,"C":196.218},"carbon dioxide":{"A":7.58828,"B":861.82,"C":271.883},"carbon disulfide":{"A":7.2179,"B":1303.79,"C":254.394},"carbon monoxide":{"A":6.72527,"B":295.228,"C":268.243},"carbon tetrabromide":{"A":8.4814,"B":2690.19,"C":290.841},"carbon tetrachloride":{"A":7.01144,"B":1278.54,"C":232.888},"carbon tetrafluoride":{"A":6.95192,"B":536.118,"C":259.748},"carbon tetraiodide":{"A":6.57159,"B":1575.05,"C":108.292},"carbonyl fluoride":{"A":7.01104,"B":623.786,"C":234.03},"carbonyl sulfide":{"A":7.00667,"B":833.067,"C":252.064},"2-chloro-1,1,1,2-tetrafluoroethane":{"A":6.96877,"B":895.337,"C":230.978},"2-chloro-1,1,1-trifluoroethane":{"A":7.38732,"B":1244.22,"C":269.993},"1-chloro-1,1,2,2-tetrafluoroethane":{"A":7.06944,"B":968.741,"C":243.018},"1-chloro-1,1,2-trifluoroethane":{"A":7.28251,"B":1101.48,"C":238.24},"1-chloro-1,1-difluoroethane":{"A":7.30141,"B":1135.31,"C":266.834},"2-chloro-1,1-difluoroethane":{"A":7.29712,"B":1286.52,"C":256.21},"2-chloro-1,1-difluoroethylene":{"A":7.10734,"B":969.906,"C":248.08},"1-chloro-1,2,2-trifluoroethane":{"A":7.56641,"B":1246.19,"C":248.963},"1-chloro-1,2-difluoroethane":{"A":6.77633,"B":840.473,"C":208.214},"cis-1-chloro-1-butene":{"A":6.68017,"B":970.337,"C":191.895},"trans-1-chloro-1-butene":{"A":6.67811,"B":982.14,"C":190.542},"2-chloro-1-butene":{"A":6.65068,"B":948.171,"C":193.014},"3-chloro-1-butene":{"A":6.64036,"B":959.521,"C":191.223},"4-chloro-1-butene":{"A":6.69151,"B":1003.06,"C":189.222},"cis-1-chloro-1-decene":{"A":6.93471,"B":1557.58,"C":161.218},"trans-1-chloro-1-decene":{"A":6.93471,"B":1557.58,"C":161.218},"cis-1-chloro-1-dodecene":{"A":7.02519,"B":1731.27,"C":154.741},"trans-1-chloro-1-dodecene":{"A":7.02519,"B":1731.27,"C":154.741},"cis-1-chloro-1-eicosene":{"A":7.15787,"B":2219.54,"C":135.941},"trans-1-chloro-1-eicosene":{"A":7.15787,"B":2219.54,"C":135.941},"1-chloro-1-fluoroethane":{"A":7.20144,"B":1178.58,"C":256.631},"cis-1-chloro-1-heptadecene":{"A":7.17402,"B":2087.51,"C":142.235},"trans-1-chloro-1-heptadecene":{"A":7.17402,"B":2087.51,"C":142.235},"cis-1-chloro-1-heptene":{"A":6.79657,"B":1270,"C":174.331},"trans-1-chloro-1-heptene":{"A":6.79657,"B":1270,"C":174.331},"cis-1-chloro-1-hexadecene":{"A":7.15828,"B":2029.08,"C":144.365},"trans-1-chloro-1-hexadecene":{"A":7.15828,"B":2029.08,"C":144.365},"cis-1-chloro-1-hexene":{"A":6.75445,"B":1167.18,"C":180.013},"trans-1-chloro-1-hexene":{"A":6.75445,"B":1167.18,"C":180.013},"cis-1-chloro-1-nonadecene":{"A":7.17489,"B":2185.3,"C":137.91},"trans-1-chloro-1-nonadecene":{"A":7.17489,"B":2185.3,"C":137.91},"cis-1-chloro-1-nonene":{"A":6.88774,"B":1466.3,"C":164.942},"trans-1-chloro-1-nonene":{"A":6.88774,"B":1466.3,"C":164.942},"cis-1-chloro-1-octadecene":{"A":7.17991,"B":2140.97,"C":140.006},"trans-1-chloro-1-octadecene":{"A":7.17991,"B":2140.97,"C":140.006},"cis-1-chloro-1-octene":{"A":6.84124,"B":1371.13,"C":169.208},"trans-1-chloro-1-octene":{"A":6.84124,"B":1371.13,"C":169.208},"cis-1-chloro-1-pentadecene":{"A":7.13437,"B":1960.42,"C":146.889},"trans-1-chloro-1-pentadecene":{"A":7.13437,"B":1960.42,"C":146.889},"cis-1-chloro-1-pentene":{"A":6.71693,"B":1056.84,"C":186.997},"trans-1-chloro-1-pentene":{"A":6.71693,"B":1056.84,"C":186.997},"2-chloro-1-pentene":{"A":6.68534,"B":1045.45,"C":186.792},"3-chloro-1-pentene":{"A":6.67542,"B":1055.6,"C":185.185},"4-chloro-1-pentene":{"A":6.67387,"B":1065.96,"C":184.03},"5-chloro-1-pentene":{"A":6.72754,"B":1101.09,"C":183.241},"cis-1-chloro-1-propene":{"A":6.65084,"B":872.543,"C":198.642},"trans-1-chloro-1-propene":{"A":6.64843,"B":884.09,"C":197.255},"2-chloro-1-propene":{"A":7.04889,"B":1139.05,"C":250.63},"3-chloro-1-propene":{"A":7.05562,"B":1230.85,"C":249.869},"cis-1-chloro-1-tetradecene":{"A":7.10323,"B":1888.81,"C":149.33},"trans-1-chloro-1-tetradecene":{"A":7.10323,"B":1888.81,"C":149.33},"cis-1-chloro-1-tridecene":{"A":7.06641,"B":1812.12,"C":151.942},"trans-1-chloro-1-tridecene":{"A":7.06641,"B":1812.12,"C":151.942},"cis-1-chloro-1-undecene":{"A":6.98081,"B":1647.13,"C":157.739},"trans-1-chloro-1-undecene":{"A":6.98081,"B":1647.13,"C":157.739},"1-chloro-2,2-dimethylbutane":{"A":6.62688,"B":1112.58,"C":179.999},"1-chloro-2,2-dimethylpropane":{"A":6.58927,"B":1006.01,"C":186.974},"1-chloro-2,3-dimethylbutane":{"A":6.68568,"B":1147.14,"C":179.493},"2-chloro-2,3-dimethylbutane":{"A":6.57399,"B":1080.19,"C":180.482},"1-chloro-2,4-dinitrobenzene":{"A":7.75735,"B":2391.91,"C":175.644},"1-chloro-cis-2-butene":{"A":6.67129,"B":1023.46,"C":185.807},"1-chloro-trans-2-butene":{"A":6.67093,"B":1025.77,"C":185.543},"2-chloro-cis-2-butene":{"A":6.63112,"B":963.625,"C":190.146},"2-chloro-trans-2-butene":{"A":6.63298,"B":953.015,"C":191.39},"3-chloro-2-ethyl-1-propene":{"A":6.68453,"B":1050.65,"C":186.216},"1-chloro-2-ethylbutane":{"A":6.74026,"B":1178.18,"C":179.271},"1-chloro-2-fluoroethane":{"A":6.72621,"B":949.078,"C":193.809},"cis-1-chloro-2-methyl-1-butene":{"A":6.66837,"B":1044.64,"C":185.809},"trans-1-chloro-2-methyl-1-butene":{"A":6.66837,"B":1044.64,"C":185.809},"3-chloro-2-methyl-1-butene":{"A":6.62763,"B":1041.51,"C":184.173},"4-chloro-2-methyl-1-butene":{"A":6.67988,"B":1081.81,"C":182.756},"1-chloro-2-methyl-1-propene":{"A":6.63055,"B":966.909,"C":189.76},"3-chloro-2-methyl-1-propene":{"A":6.64457,"B":982.982,"C":188.97},"1-chloro-2-methyl-cis-2-butene":{"A":6.66155,"B":1091.12,"C":180.6},"1-chloro-2-methyl-trans-2-butene":{"A":6.66264,"B":1083.37,"C":181.468},"1-chloro-2-methylbutane":{"A":7.07153,"B":1386.46,"C":230.301},"2-chloro-2-methylbutane":{"A":6.81907,"B":1185.1,"C":215.309},"1-chloro-2-methylpentane":{"A":6.74238,"B":1162.13,"C":180.949},"2-chloro-2-methylpentane":{"A":6.62882,"B":1098.4,"C":181.562},"3-chloro-2-methylpentane":{"A":6.6893,"B":1120.48,"C":182.355},"1-chloro-2-methylpropane":{"A":6.66332,"B":982.579,"C":190.919},"2-chloro-2-methylpropane":{"A":6.96058,"B":1176.32,"C":237.729},"1-chloro-cis-2-pentene":{"A":6.709,"B":1110.59,"C":181.108},"1-chloro-trans-2-pentene":{"A":6.70864,"B":1113.21,"C":180.82},"2-chloro-cis-2-pentene":{"A":6.66758,"B":1049.8,"C":185.23},"2-chloro-trans-2-pentene":{"A":6.66758,"B":1049.8,"C":185.23},"3-chloro-cis-2-pentene":{"A":6.66837,"B":1044.64,"C":185.809},"3-chloro-trans-2-pentene":{"A":6.66837,"B":1044.64,"C":185.809},"4-chloro-cis-2-pentene":{"A":6.65776,"B":1059.86,"C":183.613},"4-chloro-trans-2-pentene":{"A":6.65776,"B":1059.86,"C":183.613},"5-chloro-cis-2-pentene":{"A":6.70937,"B":1107.97,"C":181.395},"5-chloro-trans-2-pentene":{"A":6.70937,"B":1107.97,"C":181.395},"1-chloro-3,3-dimethylbutane":{"A":6.62688,"B":1112.58,"C":179.999},"2-chloro-3,3-dimethylbutane":{"A":6.57433,"B":1077.65,"C":180.769},"cis-1-chloro-3-methyl-1-butene":{"A":6.6593,"B":1049.56,"C":184.772},"trans-1-chloro-3-methyl-1-butene":{"A":6.6593,"B":1049.56,"C":184.772},"2-chloro-3-methyl-1-butene":{"A":6.6291,"B":1031.82,"C":185.278},"3-chloro-3-methyl-1-butene":{"A":6.5653,"B":984.061,"C":187.082},"4-chloro-3-methyl-1-butene":{"A":6.67581,"B":1053.01,"C":185.474},"1-chloro-3-methyl-2-butene":{"A":6.66083,"B":1096.29,"C":180.021},"2-chloro-3-methyl-2-butene":{"A":6.61941,"B":1038.81,"C":183.862},"1-chloro-3-methylbutane":{"A":7.26558,"B":1547.55,"C":254.428},"2-chloro-3-methylbutane":{"A":6.64617,"B":1047.65,"C":185.434},"1-chloro-3-methylpentane":{"A":6.73922,"B":1186.2,"C":178.432},"2-chloro-3-methylpentane":{"A":6.69115,"B":1107.34,"C":183.765},"3-chloro-3-methylpentane":{"A":6.62723,"B":1110,"C":180.283},"4-chloro-3-nitrobenzotrifluoride":{"A":7.4342,"B":1894.16,"C":193.989},"1-chloro-4-methylpentane":{"A":6.74061,"B":1175.5,"C":179.551},"2-chloro-4-methylpentane":{"A":6.68888,"B":1123.5,"C":182.031},"chloroacetaldehyde":{"A":7.27707,"B":1342.1,"C":220.432},"chloroacetic acid":{"A":7.6413,"B":1820.08,"C":192.982},"chloroacetyl chloride":{"A":7.29542,"B":1419.24,"C":215.487},"m-chloroaniline":{"A":7.40372,"B":1952.27,"C":203.141},"p-chloroaniline":{"A":7.40172,"B":1957.87,"C":202.57},"chlorobenzene":{"A":7.18342,"B":1574.53,"C":234.229},"p-chlorobenzotrifluoride":{"A":7.16969,"B":1548.6,"C":222.073},"m-chlorobenzoyl chloride":{"A":7.54675,"B":2099.23,"C":225.056},"1-chlorobutane":{"A":7.12193,"B":1329.37,"C":235.017},"2-chlorobutane":{"A":7.25318,"B":1378.58,"C":247.194},"1-chlorodecane":{"A":7.25952,"B":1868.3,"C":200.808},"chlorodifluoromethane":{"A":7.07154,"B":848.817,"C":243.376},"1-chlorodocosane":{"A":6.95946,"B":2092.35,"C":118.001},"1-chlorododecane":{"A":7.30956,"B":2009.02,"C":190.451},"1-chlorodotriacontane":{"A":6.19739,"B":1888.14,"C":85.3027},"1-chloroeicosane":{"A":6.97391,"B":1979.91,"C":110.718},"2-chloroethanol":{"A":8.36278,"B":2112.72,"C":256.794},"chlorofluoromethane":{"A":7.92235,"B":1587.64,"C":324.003},"chloroform":{"A":7.11148,"B":1232.79,"C":230.213},"1-chloroheneicosane":{"A":7.02818,"B":2102.72,"C":123.001},"1-chlorohentriacontane":{"A":6.26814,"B":1913.53,"C":88.909},"1-chloroheptacosane":{"A":6.37004,"B":1826.23,"C":80.3899},"1-chloroheptadecane":{"A":7.35256,"B":2271.12,"C":167.883},"1-chloroheptane":{"A":7.16071,"B":1608.42,"C":215.369},"1-chloroheptatriacontane":{"A":5.91505,"B":1790.07,"C":70.9567},"1-chlorohexacosane":{"A":6.54067,"B":1933.42,"C":94.2759},"1-chlorohexadecane":{"A":7.30623,"B":2172.24,"C":164.256},"1-chlorohexane":{"A":7.12663,"B":1508.6,"C":220.224},"2-chlorohexane":{"A":6.74096,"B":1172.83,"C":179.83},"3-chlorohexane":{"A":6.74131,"B":1170.15,"C":180.11},"1-chlorohexatriacontane":{"A":5.96841,"B":1808.33,"C":73.6764},"1-chloronaphthalene":{"A":7.14388,"B":1931.55,"C":193.79},"m-chloronitrobenzene":{"A":7.42076,"B":1956.77,"C":195.411},"p-chloronitrobenzene":{"A":7.39602,"B":1951.27,"C":190.155},"1-chlorononacosane":{"A":5.97308,"B":1554.22,"C":42.6146},"1-chlorononadecane":{"A":7.11701,"B":2092.1,"C":130.862},"1-chlorononane":{"A":7.20883,"B":1767.2,"C":203.096},"1-chlorononatriacontane":{"A":5.82882,"B":1762.61,"C":66.8986},"1-chlorooctacosane":{"A":6.18126,"B":1701.23,"C":63.4531},"1-chlorooctadecane":{"A":7.18475,"B":2122.15,"C":141.072},"1-chlorooctane":{"A":7.17727,"B":1682.87,"C":208.218},"1-chlorooctatriacontane":{"A":5.87137,"B":1776.04,"C":68.8827},"1-chloropentacosane":{"A":6.68545,"B":2014.23,"C":104.414},"1-chloropentadecane":{"A":7.33542,"B":2161.98,"C":173.335},"chloropentafluoroethane":{"A":7.01458,"B":870.384,"C":249.665},"1-chloropentane":{"A":7.21236,"B":1494.95,"C":236.74},"2-chloropentane":{"A":7.05365,"B":1356.55,"C":228.571},"3-chloropentane":{"A":6.69986,"B":1079.68,"C":184.919},"1-chloropentatriacontane":{"A":6.02329,"B":1827.27,"C":76.4757},"m-chlorophenol":{"A":7.95713,"B":2396.76,"C":258.295},"p-chlorophenol":{"A":7.88595,"B":2340.65,"C":247.69},"chloroprene":{"A":7.0847,"B":1285.63,"C":246.42},"1-chloropropane":{"A":7.11195,"B":1208.24,"C":239.039},"2-chloropropane":{"A":6.85852,"B":1009.5,"C":218.091},"1-chlorotetracontane":{"A":5.78738,"B":1749.77,"C":65.0064},"1-chlorotetracosane":{"A":6.78302,"B":2040.86,"C":108.001},"1-chlorotetradecane":{"A":7.34738,"B":2134.36,"C":181.012},"1-chlorotetratriacontane":{"A":6.07972,"B":1846.89,"C":79.35},"p-chlorotoluene":{"A":7.13594,"B":1605.85,"C":214.891},"m-chlorotoluene":{"A":7.1374,"B":1620.34,"C":218.365},"1-chlorotriacontane":{"A":6.38297,"B":1989.1,"C":99.9644},"1-chlorotricosane":{"A":6.87717,"B":2070.11,"C":113.001},"1-chlorotridecane":{"A":7.3403,"B":2082.9,"C":187.071},"chlorotrifluoroethylene":{"A":7.02751,"B":881.594,"C":240.451},"chlorotrifluoromethane":{"A":7.05316,"B":746.56,"C":260.34},"1-chlorotritriacontane":{"A":6.13774,"B":1867.18,"C":82.2942},"1-chloroundecane":{"A":7.29439,"B":1951.07,"C":196.722},"chrysene":{"A":7.30847,"B":2609.83,"C":148.439},"citraconic acid":{"A":8.11441,"B":2587.85,"C":160.618},"citric acid":{"A":9.37143,"B":3305.17,"C":123.373},"m-cresol":{"A":7.26723,"B":1670.93,"C":178.653},"p-cresol":{"A":7.45834,"B":1768.27,"C":184.313},"trans-crotonaldehyde":{"A":7.28193,"B":1460.08,"C":227.652},"trans-crotonitrile":{"A":7.45169,"B":1653.01,"C":240.409},"cis-crotonitrile":{"A":7.47046,"B":1633.44,"C":248.446},"cumene":{"A":7.10691,"B":1577.97,"C":220.977},"cumene hydroperoxide":{"A":6.95989,"B":1116.91,"C":104.264},"p-cumylphenol":{"A":7.52176,"B":2371.68,"C":176.035},"cyanogen":{"A":7.24606,"B":947.481,"C":238.201},"cyanogen chloride":{"A":7.5797,"B":1265.43,"C":256.454},"cyclobutane":{"A":7.11632,"B":1109.64,"C":249.476},"cyclobutene":{"A":7.17769,"B":1102.63,"C":254.012},"cyclodecane":{"A":6.90113,"B":1618.66,"C":200.62},"cyclododecane":{"A":6.85731,"B":1720.19,"C":193.59},"cycloeicosane":{"A":6.83775,"B":2061.09,"C":172.88},"cycloheptadecane":{"A":6.84231,"B":1951.16,"C":179.53},"cycloheptane":{"A":7.0113,"B":1417.93,"C":224.495},"1,3,5-cycloheptatriene":{"A":7.33889,"B":1585.78,"C":240.209},"cyclohexadecane":{"A":6.84404,"B":1910.28,"C":182},"1,3-cyclohexadiene":{"A":7.14886,"B":1359.07,"C":238.088},"1,4-cyclohexanedicarboxylic acid":{"A":8.034,"B":2688.93,"C":125.95},"cyclohexanol":{"A":7.14994,"B":1405.48,"C":168.37},"cyclohexanone":{"A":7.60652,"B":1884.55,"C":243.036},"cyclohexanone oxime":{"A":7.41015,"B":1821.35,"C":194.123},"cyclohexene":{"A":7.0229,"B":1300.39,"C":230.976},"cyclohexylamine":{"A":7.36494,"B":1647.76,"C":232.966},"cyclohexylbenzene":{"A":7.00955,"B":1753.02,"C":184.47},"cyclohexyl isocyanate":{"A":7.52412,"B":1795.14,"C":217.608},"cyclohexyl peroxide":{"A":7.91206,"B":2068.6,"C":194.3},"cyclononadecane":{"A":6.83935,"B":2026.65,"C":174.97},"cyclononane":{"A":6.92639,"B":1551.5,"C":205.104},"cyclooctadecane":{"A":6.84087,"B":1988.94,"C":177.25},"1,5-cyclooctadiene":{"A":7.14156,"B":1594.32,"C":224.067},"cyclooctane":{"A":6.99639,"B":1527.08,"C":219.9},"1,3,5,7-cyclooctatetraene":{"A":6.96737,"B":1439.91,"C":212.343},"cyclopentadecane":{"A":6.84622,"B":1866.36,"C":184.66},"cyclopentadiene":{"A":7.26828,"B":1326.36,"C":260.807},"cyclopentane":{"A":7.04267,"B":1202.53,"C":239.69},"cyclopentanethiol":{"A":7.10422,"B":1510.95,"C":225.577},"cyclopentanone":{"A":7.56585,"B":1727.86,"C":238.153},"cyclopentene":{"A":7.09158,"B":1209.22,"C":242.943},"cyclopropane":{"A":7.0298,"B":904.465,"C":250.776},"cyclotetradecane":{"A":6.84906,"B":1819.48,"C":187.51},"cyclotridecane":{"A":6.85256,"B":1772.83,"C":190.36},"cycloundecane":{"A":6.86335,"B":1664.74,"C":197.01},"m-cymene":{"A":7.11317,"B":1675.81,"C":220.871},"p-cymene":{"A":7.13238,"B":1671.47,"C":216.013},"D-limonene":{"A":7.06744,"B":1691.15,"C":227.441},"decafluorobutane":{"A":7.06833,"B":1002.58,"C":241.421},"cis-decahydronaphthalene":{"A":7.02551,"B":1695.68,"C":213.301},"trans-decahydronaphthalene":{"A":6.82768,"B":1544.81,"C":204.091},"decanal":{"A":7.45314,"B":1888.66,"C":198.063},"decane":{"A":7.21745,"B":1693.93,"C":216.459},"1,2-decanediol":{"A":9.65155,"B":3744.22,"C":273.001},"1,3-decanediol":{"A":7.60016,"B":2182.89,"C":232.223},"1,4-decanediol":{"A":9.65163,"B":3960.93,"C":273.001},"1,10-decanediol":{"A":9.70657,"B":3904.34,"C":273.001},"decanenitrile":{"A":7.17122,"B":1726.02,"C":159.298},"2-decanethiol":{"A":7.15356,"B":1809.06,"C":195.094},"decanoic acid":{"A":7.3443,"B":1755.03,"C":123.197},"1-decanol":{"A":7.03752,"B":1579.82,"C":149.864},"2-decanol":{"A":6.80298,"B":1341.69,"C":125.078},"3-decanol":{"A":8.61878,"B":2770.58,"C":273},"4-decanol":{"A":8.61878,"B":2771.44,"C":273},"5-decanol":{"A":8.61876,"B":2719.79,"C":273},"2-decanone":{"A":7.40209,"B":1852.35,"C":199.497},"1-decene":{"A":7.17365,"B":1656.67,"C":215.316},"1-decyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.39501,"B":2398.89,"C":170.411},"2-decyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.39466,"B":2406.02,"C":170.031},"decyl acetate":{"A":6.87474,"B":1609.86,"C":159.077},"decylamine":{"A":7.654,"B":2086.71,"C":216.674},"decylbenzene":{"A":7.4989,"B":2283.54,"C":196.586},"decyl butanoate":{"A":6.34862,"B":1187.08,"C":62.3129},"decylcyclohexane":{"A":7.31408,"B":2127.35,"C":182.262},"decylcyclopentane":{"A":7.17072,"B":1953.27,"C":175.928},"1-decylcyclopentene":{"A":7.25553,"B":1998.77,"C":187.89},"decyl formate":{"A":7.00261,"B":1632.58,"C":160.635},"decyl mercaptan":{"A":7.35259,"B":1955.29,"C":198.051},"1-decylnaphthalene":{"A":7.4838,"B":2513.19,"C":166.991},"2-decylnaphthalene":{"A":7.48312,"B":2527.73,"C":166.231},"decyl propanoate":{"A":7.42575,"B":1992.34,"C":156.455},"1-decyne":{"A":7.07163,"B":1583.08,"C":203.739},"2-decyne":{"A":7.07436,"B":1643.12,"C":207.222},"3-decyne":{"A":7.07535,"B":1625.05,"C":208.122},"dehydroabietylamine":{"A":7.49099,"B":2586.95,"C":174.289},"2,6-di-tert-butyl-p-cresol":{"A":7.41286,"B":2010.21,"C":178.703},"di-sec-butyl ether":{"A":7.23165,"B":1515.43,"C":227.258},"di-tert-butyl ether":{"A":7.04933,"B":1401.98,"C":229.075},"di-pentyl ether":{"A":7.6263,"B":2007.96,"C":236.38},"di-propylamine":{"A":7.36576,"B":1469.89,"C":218.887},"di-t-butyl peroxide":{"A":7.09393,"B":1395.39,"C":220.201},"diacetone alcohol":{"A":8.63179,"B":2570.51,"C":279.12},"diallyl maleate":{"A":7.7475,"B":2167.26,"C":198.476},"dibenzofuran":{"A":7.20786,"B":2284.28,"C":243.198},"dibenzopyrrole":{"A":7.47115,"B":2545.26,"C":199.771},"dibenzyl ether":{"A":7.33137,"B":2084.84,"C":180.145},"1,1-dibromo-2,2-dimethylpropane":{"A":7.10828,"B":1456.13,"C":164.444},"1,3-dibromo-2,2-dimethylpropane":{"A":6.92256,"B":1388.08,"C":160.436},"1,3-dibromo-2-(bromomethyl)propane":{"A":7.34427,"B":1665.6,"C":153.163},"1,3-dibromo-2-ethylpropane":{"A":6.98518,"B":1375.11,"C":165.296},"1,1-dibromo-2-methylbutane":{"A":7.05033,"B":1408.22,"C":165.652},"1,2-dibromo-2-methylbutane":{"A":6.98422,"B":1384.37,"C":164.372},"1,3-dibromo-2-methylbutane":{"A":7.05033,"B":1408.22,"C":165.652},"1,4-dibromo-2-methylbutane":{"A":7.11054,"B":1434.13,"C":166.529},"2,3-dibromo-2-methylbutane":{"A":7.12314,"B":1535.82,"C":191.164},"1,1-dibromo-2-methylpropane":{"A":7.01369,"B":1310.55,"C":170.104},"1,2-dibromo-2-methylpropane":{"A":6.94749,"B":1291.03,"C":168.466},"1,3-dibromo-2-methylpropane":{"A":7.06487,"B":1414.87,"C":163.158},"1,1-dibromo-3-methylbutane":{"A":7.05033,"B":1408.22,"C":165.652},"1,2-dibromo-3-methylbutane":{"A":7.05033,"B":1408.22,"C":165.652},"1,3-dibromo-3-methylbutane":{"A":6.98518,"B":1375.11,"C":165.296},"2,2-dibromo-3-methylbutane":{"A":6.92643,"B":1349.84,"C":164.354},"m-dibromobenzene":{"A":7.22786,"B":1893.89,"C":217.673},"1,1-dibromobutane":{"A":7.48829,"B":1751.2,"C":222.079},"1,2-dibromobutane":{"A":7.82182,"B":2131.34,"C":265.048},"1,3-dibromobutane":{"A":7.06487,"B":1414.87,"C":163.158},"1,4-dibromobutane":{"A":7.11908,"B":1504.6,"C":158.005},"2,2-dibromobutane":{"A":6.94909,"B":1277.1,"C":169.916},"1,1-dibromodecane":{"A":7.71055,"B":2317.8,"C":202.903},"dibromodifluoromethane":{"A":7.22244,"B":1203.61,"C":254.436},"1,1-dibromodocosane":{"A":7.53655,"B":2781.22,"C":163.374},"1,1-dibromododecane":{"A":7.6433,"B":2324.1,"C":178},"1,1-dibromodotriacontane":{"A":6.59384,"B":2356.08,"C":115.546},"1,1-dibromoeicosane":{"A":7.53283,"B":2600.48,"C":146.001},"1,1-dibromoethane":{"A":6.98532,"B":1330.25,"C":216.095},"1,2-dibromoethane":{"A":7.22206,"B":1605.23,"C":238.402},"1,1-dibromoheneicosane":{"A":7.56668,"B":2728.29,"C":158.238},"1,1-dibromohentriacontane":{"A":6.65053,"B":2374.47,"C":117.881},"1,1-dibromoheptacosane":{"A":6.67224,"B":2194.39,"C":98.7768},"1,1-dibromoheptadecane":{"A":7.65768,"B":2565.18,"C":158.001},"1,1-dibromoheptane":{"A":7.58699,"B":2038.68,"C":211.193},"1,1-dibromoheptatriacontane":{"A":6.33918,"B":2276.46,"C":105.247},"1,1-dibromohexacosane":{"A":6.90972,"B":2386.09,"C":121.242},"1,1-dibromohexadecane":{"A":7.67336,"B":2530.47,"C":162.001},"1,1-dibromohexane":{"A":7.55575,"B":1950.86,"C":215.302},"1,1-dibromohexatriacontane":{"A":6.3891,"B":2291.79,"C":107.251},"dibromomethane":{"A":7.23867,"B":1423.39,"C":229.675},"1,1-dibromononacosane":{"A":6.15884,"B":1771.66,"C":44.4654},"1,1-dibromononadecane":{"A":7.58772,"B":2598.21,"C":150.001},"1,1-dibromononane":{"A":7.68389,"B":2245.16,"C":207.441},"1,1-dibromononatriacontane":{"A":6.2583,"B":2253.98,"C":102.356},"1,1-dibromooctacosane":{"A":6.41436,"B":1978.79,"C":72.0012},"1,1-dibromooctadecane":{"A":7.62948,"B":2588.02,"C":154.001},"1,1-dibromooctane":{"A":7.63062,"B":2140.01,"C":208.547},"1,1-dibromooctatriacontane":{"A":6.29823,"B":2264.92,"C":103.759},"1,1-dibromopentacosane":{"A":7.142,"B":2581.09,"C":142.721},"1,1-dibromopentadecane":{"A":7.67889,"B":2490.2,"C":166.001},"1,1-dibromopentane":{"A":7.5111,"B":1840.56,"C":217.504},"1,2-dibromopentane":{"A":7.1071,"B":1467.91,"C":163.328},"1,3-dibromopentane":{"A":7.10537,"B":1485.58,"C":161.654},"1,4-dibromopentane":{"A":7.10259,"B":1515.04,"C":158.863},"1,5-dibromopentane":{"A":7.15749,"B":1608.09,"C":153.714},"2,2-dibromopentane":{"A":6.9851,"B":1375.85,"C":165.223},"2,3-dibromopentane":{"A":7.04842,"B":1426.77,"C":163.849},"2,4-dibromopentane":{"A":7.04741,"B":1436.91,"C":162.864},"3,3-dibromopentane":{"A":6.986,"B":1367.33,"C":166.073},"1,1-dibromopentatriacontane":{"A":6.43227,"B":2304.53,"C":108.896},"1,1-dibromopropane":{"A":7.48574,"B":1668.45,"C":228.819},"1,2-dibromopropane":{"A":7.73989,"B":1946.68,"C":260.617},"1,3-dibromopropane":{"A":7.08608,"B":1391.56,"C":163.61},"2,2-dibromopropane":{"A":6.91913,"B":1173.91,"C":175.592},"1,1-dibromotetracontane":{"A":6.21935,"B":2243.63,"C":101.039},"1,1-dibromotetracosane":{"A":7.31207,"B":2691.2,"C":154.323},"1,1-dibromotetradecane":{"A":7.6744,"B":2439.94,"C":170.001},"1,2-dibromotetrafluoroethane":{"A":7.04279,"B":1204.83,"C":242.224},"1,1-dibromotetratriacontane":{"A":6.48474,"B":2321.1,"C":111.048},"1,1-dibromotriacontane":{"A":6.75259,"B":2442.52,"C":126.853},"1,1-dibromotricosane":{"A":7.45698,"B":2778.32,"C":163.13},"1,1-dibromotridecane":{"A":7.66246,"B":2386.04,"C":174.001},"1,1-dibromotritriacontane":{"A":6.53858,"B":2338.29,"C":113.266},"1,1-dibromoundecane":{"A":7.61835,"B":2255.07,"C":182},"dibutylamine":{"A":7.48571,"B":1694.45,"C":209.117},"dibutyl disulfide":{"A":7.44733,"B":2035.74,"C":214.588},"dibutyl ether":{"A":7.2781,"B":1602.15,"C":224.059},"dibutyl maleate":{"A":7.77306,"B":2265.01,"C":182.978},"dibutyl phthalate":{"A":7.96819,"B":2657.06,"C":182.284},"dibutyl sebacate":{"A":8.05682,"B":2749.98,"C":182.295},"dibutyl sulfide":{"A":7.14886,"B":1717.84,"C":220.489},"dibutyl sulfone":{"A":7.53616,"B":2199.42,"C":181.601},"2,2-dichloro-1,1,1-trifluoroethane":{"A":7.15748,"B":1162.31,"C":243.879},"1,2-dichloro-1,1,2,2-tetrafluoroethane":{"A":6.93513,"B":971.739,"C":235.91},"1,2-dichloro-1,1,2-trifluoroethane":{"A":7.17371,"B":1184.39,"C":246.346},"1,2-dichloro-1,1-difluoroethane":{"A":7.08804,"B":1139.79,"C":224.278},"1,1-dichloro-1,2,2,2-tetrafluoroethane":{"A":6.81468,"B":908.598,"C":227.948},"1,1-dichloro-1,2,2-trifluoroethane":{"A":6.48034,"B":810.882,"C":195.424},"1,1-dichloro-1,2-difluoroethane":{"A":6.72825,"B":924.483,"C":198.105},"1,2-dichloro-1,2-difluoroethane":{"A":6.91184,"B":1016.92,"C":205.473},"3,4-dichloro-1-butene":{"A":7.15997,"B":1469.73,"C":228.613},"1,1-dichloro-1-fluoroethane":{"A":7.03003,"B":1114.1,"C":236.759},"1,2-dichloro-1-fluoroethane":{"A":7.1129,"B":1292.87,"C":231.693},"1,1-dichloro-2,2-difluoroethane":{"A":7.14134,"B":1281.28,"C":240.732},"1,1-dichloro-2,2-dimethylpropane":{"A":6.60334,"B":1174.08,"C":170.549},"1,3-dichloro-2,2-dimethylpropane":{"A":6.65792,"B":1198.31,"C":171.257},"1,3-dichloro-2-(chloromethyl)-propane":{"A":6.82386,"B":1210.43,"C":177.358},"1,3-dichloro-trans-2-butene":{"A":6.84743,"B":1305.45,"C":200.26},"1,4-dichloro-cis-2-butene":{"A":7.20409,"B":1622.24,"C":222.735},"1,4-dichloro-trans-2-butene":{"A":7.14203,"B":1580.32,"C":214.751},"1,3-dichloro-2-ethylpropane":{"A":6.77565,"B":1240.06,"C":173.536},"1,1-dichloro-2-fluoroethane":{"A":6.76674,"B":904.775,"C":200.984},"1,1-dichloro-2-methylbutane":{"A":6.72516,"B":1170.67,"C":177.667},"1,2-dichloro-2-methylbutane":{"A":6.54613,"B":1096.42,"C":165.134},"1,3-dichloro-2-methylbutane":{"A":6.71929,"B":1218.41,"C":172.571},"1,4-dichloro-2-methylbutane":{"A":8.24204,"B":2426.69,"C":284.136},"2,3-dichloro-2-methylbutane":{"A":6.07777,"B":825.282,"C":129.146},"1,1-dichloro-2-methylpropane":{"A":6.68377,"B":1089.32,"C":181.441},"1,2-dichloro-2-methylpropane":{"A":6.62229,"B":1073.35,"C":179.878},"1,3-dichloro-2-methylpropane":{"A":6.72937,"B":1188.4,"C":173.791},"1,1-dichloro-3-methylbutane":{"A":6.72423,"B":1177.96,"C":176.888},"1,2-dichloro-3-methylbutane":{"A":6.71987,"B":1213.51,"C":173.095},"1,3-dichloro-3-methylbutane":{"A":6.73504,"B":1249.73,"C":177.55},"2,2-dichloro-3-methylbutane":{"A":6.60334,"B":1174.08,"C":170.549},"1,2-dichloro-4-nitrobenzene":{"A":7.45941,"B":2047.53,"C":191.345},"dichloroacetaldehyde":{"A":7.31971,"B":1394.97,"C":225.411},"dichloroacetic acid":{"A":7.64801,"B":1869.04,"C":198.063},"dichloroacetyl chloride":{"A":7.3096,"B":1456.95,"C":219.973},"3,4-dichloroaniline":{"A":7.40698,"B":2094.32,"C":190.864},"m-dichlorobenzene":{"A":7.1895,"B":1727.33,"C":227.815},"p-dichlorobenzene":{"A":7.10142,"B":1635.69,"C":213.488},"2,4-dichlorobenzotrifluoride":{"A":7.19574,"B":1677.64,"C":211.299},"1,1-dichlorobutane":{"A":7.02745,"B":1371.35,"C":216.915},"1,2-dichlorobutane":{"A":6.73303,"B":1159.31,"C":176.947},"1,3-dichlorobutane":{"A":6.72986,"B":1184.43,"C":174.222},"1,4-dichlorobutane":{"A":7.16122,"B":1610.3,"C":222.302},"2,2-dichlorobutane":{"A":6.62372,"B":1063.16,"C":181.046},"1,1-dichlorodecane":{"A":7.1767,"B":1838.95,"C":181.072},"dichlorodifluoromethane":{"A":6.92438,"B":865.658,"C":243.873},"1,1-dichlorodocosane":{"A":7.21871,"B":2495.16,"C":159.201},"1,1-dichlorododecane":{"A":7.3172,"B":2071.8,"C":184.001},"1,1-dichlorodotriacontane":{"A":6.39714,"B":2214.57,"C":124.794},"1,1-dichloroeicosane":{"A":7.26123,"B":2391.71,"C":152.001},"1,1-dichloroethane":{"A":7.18316,"B":1269.43,"C":237.755},"1,2-dichloroethane":{"A":7.29525,"B":1407.85,"C":235.48},"1,1-dichloroethylene":{"A":7.21678,"B":1181.12,"C":240.84},"cis-1,2-dichloroethylene":{"A":7.21953,"B":1290.28,"C":236.887},"trans-1,2-dichloroethylene":{"A":7.21356,"B":1244.35,"C":239.497},"dichlorofluoromethane":{"A":7.19968,"B":1118.18,"C":250.007},"1,1-dichloroheneicosane":{"A":7.20158,"B":2389.39,"C":148.001},"1,1-dichlorohentriacontane":{"A":6.4588,"B":2234.16,"C":127.42},"1,1-dichloroheptacosane":{"A":6.47181,"B":2037.38,"C":103.358},"1,1-dichloroheptadecane":{"A":7.36037,"B":2333.85,"C":164.001},"1,1-dichloroheptane":{"A":7.09075,"B":1618.06,"C":197.344},"1,1-dichloroheptatriacontane":{"A":6.14985,"B":2140.04,"C":114.638},"1,1-dichlorohexacosane":{"A":6.70344,"B":2226.58,"C":127.474},"1,1-dichlorohexadecane":{"A":7.37017,"B":2298.55,"C":168.001},"1,1-dichlorohexane":{"A":7.0797,"B":1551.14,"C":205.418},"1,1-dichlorohexatriacontane":{"A":6.19673,"B":2153.78,"C":116.527},"1,1-dichlorononacosane":{"A":5.97077,"B":1625.8,"C":45.1566},"1,1-dichlorononadecane":{"A":7.3068,"B":2381.19,"C":156.001},"1,1-dichlorononane":{"A":7.15791,"B":1777.9,"C":187.679},"1,1-dichlorononatriacontane":{"A":6.07392,"B":2120.03,"C":111.939},"1,1-dichlorooctacosane":{"A":6.22736,"B":1837.61,"C":76.1061},"1,1-dichlorooctadecane":{"A":7.33996,"B":2363.35,"C":160.001},"1,1-dichlorooctane":{"A":7.11328,"B":1688.37,"C":190.91},"1,1-dichlorooctatriacontane":{"A":6.1114,"B":2129.75,"C":113.246},"1,1-dichloropentacosane":{"A":6.91035,"B":2389.73,"C":147.053},"1,1-dichloropentadecane":{"A":7.36936,"B":2253.25,"C":172.001},"1,1-dichloropentane":{"A":7.04985,"B":1461.54,"C":210.772},"1,2-dichloropentane":{"A":6.77497,"B":1245.87,"C":172.932},"1,3-dichloropentane":{"A":6.77249,"B":1267.46,"C":170.686},"1,4-dichloropentane":{"A":6.77039,"B":1286.36,"C":168.721},"1,5-dichloropentane":{"A":7.25292,"B":1760.19,"C":222.595},"2,2-dichloropentane":{"A":6.66395,"B":1148.86,"C":176.68},"2,3-dichloropentane":{"A":6.72114,"B":1202.89,"C":174.227},"2,4-dichloropentane":{"A":6.71801,"B":1229.42,"C":171.396},"3,3-dichloropentane":{"A":6.66231,"B":1161.88,"C":175.253},"1,1-dichloropentatriacontane":{"A":6.24487,"B":2168.11,"C":118.492},"3,4-dichlorophenyl isocyanate":{"A":7.31694,"B":1980.97,"C":218.705},"1,1-dichloropropane":{"A":7.09171,"B":1336.28,"C":229.239},"1,2-dichloropropane":{"A":7.19794,"B":1452.97,"C":240.189},"1,3-dichloropropane":{"A":7.17359,"B":1494.76,"C":227.804},"2,2-dichloropropane":{"A":6.85964,"B":1156.29,"C":221.3},"2,3-dichloropropene":{"A":7.08177,"B":1391.7,"C":238.683},"1,1-dichlorotetracontane":{"A":6.03737,"B":2110.85,"C":110.718},"1,1-dichlorotetracosane":{"A":7.06201,"B":2482.18,"C":157.653},"1,1-dichlorotetradecane":{"A":7.35921,"B":2198.9,"C":176.001},"1,1-dichlorotetratriacontane":{"A":6.2943,"B":2183.02,"C":120.528},"2,4-dichlorotoluene":{"A":7.22326,"B":1806.35,"C":214.874},"1,1-dichlorotriacontane":{"A":6.52218,"B":2254.33,"C":130.089},"1,1-dichlorotricosane":{"A":7.16608,"B":2518.28,"C":161.66},"1,1-dichlorotridecane":{"A":7.34102,"B":2136.44,"C":180.001},"1,1-dichlorotritriacontane":{"A":6.34505,"B":2198.51,"C":122.631},"1,1-dichloroundecane":{"A":7.28794,"B":2000.84,"C":188.001},"dicumyl peroxide":{"A":7.26813,"B":2500,"C":173.974},"cis-dicyano-1-butene":{"A":7.62757,"B":2022.1,"C":198.147},"trans-dicyano-1-butene":{"A":7.59946,"B":1992.92,"C":196.499},"trans-1,4-dicyano-2-butene":{"A":8.07044,"B":2105.6,"C":178.883},"dicyclohexylamine":{"A":7.44029,"B":2149.81,"C":215.653},"1,1-dicyclohexylbutane":{"A":7.09261,"B":2006.11,"C":183.336},"1,1-dicyclohexyldecane":{"A":7.26012,"B":2348.5,"C":169.271},"1,1-dicyclohexyldodecane":{"A":7.2549,"B":2416.56,"C":165.471},"1,1-dicyclohexylethane":{"A":7.00715,"B":1892.54,"C":187.478},"1,1-dicyclohexylheptane":{"A":7.20123,"B":2194.43,"C":175.921},"1,1-dicyclohexylhexadecane":{"A":7.09822,"B":2456.39,"C":158.441},"1,1-dicyclohexylhexane":{"A":7.16878,"B":2136.27,"C":178.201},"dicyclohexylmethane":{"A":6.96533,"B":1812.58,"C":190.968},"1,1-dicyclohexylnonane":{"A":7.24812,"B":2303.14,"C":171.361},"1,1-dicyclohexyloctane":{"A":7.22811,"B":2250.34,"C":173.641},"1,1-dicyclohexylpentadecane":{"A":7.1575,"B":2459.74,"C":160.151},"1,1-dicyclohexylpentane":{"A":7.13217,"B":2073.26,"C":180.671},"1,1-dicyclohexylpropane":{"A":7.0501,"B":1954.08,"C":185.124},"1,1-dicyclohexyltetradecane":{"A":7.20303,"B":2454.42,"C":161.861},"1,1-dicyclohexyltridecane":{"A":7.23522,"B":2440.95,"C":163.571},"1,1-dicyclohexylundecane":{"A":7.26285,"B":2385.45,"C":167.371},"1,3-dicyclopentadiene":{"A":7.03965,"B":1633.48,"C":222.923},"didecylamine":{"A":7.95723,"B":2830.27,"C":198.533},"didecyl disulfide":{"A":7.16328,"B":2175.98,"C":118.104},"didecyl ether":{"A":7.60514,"B":2489.01,"C":210.001},"didecyl sulfide":{"A":7.18259,"B":2111.53,"C":119.001},"didodecylamine":{"A":6.38315,"B":1527.6,"C":33.1656},"dieicosylamine":{"A":8.95047,"B":4850.56,"C":273.15},"diethanolamine":{"A":8.38018,"B":2515.64,"C":188.552},"2,2-diethyl-1,3-propanediol":{"A":9.48105,"B":3346.32,"C":273},"2,2-diethyl-1-butanol":{"A":8.37085,"B":2447.74,"C":273},"3,3-diethyl-2-methylpentane":{"A":7.03691,"B":1615.77,"C":219.062},"3,3-diethyl-2-pentanol":{"A":8.35371,"B":2522.19,"C":273},"diethylamine":{"A":7.13819,"B":1232.29,"C":233.998},"2,6-diethylaniline":{"A":7.00468,"B":1811.59,"C":203.794},"m-diethylbenzene":{"A":7.11264,"B":1687.95,"C":217.731},"p-diethylbenzene":{"A":7.21059,"B":1743.19,"C":218.815},"diethylbutylamine":{"A":6.96501,"B":1295.53,"C":181.207},"diethyl carbonate":{"A":7.35888,"B":1527.4,"C":214.285},"1,1-diethylcyclopentane":{"A":6.95272,"B":1469.57,"C":210.405},"1,cis-2-diethylcyclopentane":{"A":6.94154,"B":1475.6,"C":209.824},"1,trans-2-diethylcyclopentane":{"A":6.94339,"B":1456.43,"C":210.97},"1,cis-3-diethylcyclopentane":{"A":6.94263,"B":1464.28,"C":210.5},"1,trans-3-diethylcyclopentane":{"A":6.94263,"B":1464.28,"C":210.5},"diethyldecylamine":{"A":7.06255,"B":1629.45,"C":142.659},"diethyl disulfide":{"A":7.30561,"B":1708.48,"C":232.135},"diethyldocosylamine":{"A":6.12541,"B":1300,"C":8.66667},"diethyldodecylamine":{"A":6.98615,"B":1633.33,"C":120.855},"diethyldotriacontylamine":{"A":9.17263,"B":4675.76,"C":273.15},"diethyleicosylamine":{"A":6.21472,"B":1292.67,"C":14.7358},"diethylene glycol":{"A":7.69649,"B":2078.72,"C":186.657},"diethylene glycol dibutyl ether":{"A":8.2454,"B":2692.36,"C":245.877},"diethylene glycol diethyl ether":{"A":7.81212,"B":2076.78,"C":232.141},"diethylene glycol dimethyl ether":{"A":7.70009,"B":1914.68,"C":237.537},"diethylene glycol ethyl ether acetate":{"A":7.96013,"B":2311.6,"C":237.7},"diethylene glycol monobutyl ether":{"A":8.45594,"B":2485.47,"C":214.814},"diethylene triamine":{"A":8.28968,"B":2477.17,"C":250.884},"diethyl ether":{"A":7.04631,"B":1112.55,"C":232.657},"diethylheneicosylamine":{"A":6.07502,"B":1250,"C":8.33333},"diethylhentriacontylamine":{"A":9.25726,"B":4700.4,"C":273.15},"diethylheptacosylamine":{"A":9.25091,"B":4504.62,"C":273.15},"diethylheptadecylamine":{"A":6.61146,"B":1498.91,"C":60.782},"3,3-diethylheptane":{"A":6.9085,"B":1508.77,"C":187.7},"3,4-diethylheptane":{"A":6.95567,"B":1498.32,"C":187.7},"3,5-diethylheptane":{"A":6.95423,"B":1493.72,"C":187.7},"4,4-diethylheptane":{"A":6.89941,"B":1478.84,"C":187.7},"diethylheptylamine":{"A":7.03991,"B":1500.32,"C":162.732},"diethylhexacosylamine":{"A":9.14011,"B":4382.45,"C":273.15},"diethylhexadecylamine":{"A":6.83837,"B":1666.17,"C":92.0111},"3,3-diethylhexane":{"A":7.06458,"B":1606.73,"C":217.729},"3,4-diethylhexane":{"A":7.10466,"B":1613.61,"C":218.113},"diethylhexatriacontylamine":{"A":9.2586,"B":4905.47,"C":273.15},"diethylhexylamine":{"A":7.05598,"B":1471.99,"C":173.557},"diethylisopropylamine":{"A":6.86449,"B":1172.9,"C":185.925},"diethyl ketone":{"A":7.26062,"B":1460.76,"C":231.531},"diethyl maleate":{"A":7.84429,"B":2272.67,"C":232.878},"diethyl malonate":{"A":7.61186,"B":1959.8,"C":215.343},"1,2-diethylnaphthalene":{"A":8.19596,"B":3421.71,"C":331.505},"1,4-diethylnaphthalene":{"A":8.19596,"B":3421.71,"C":331.505},"1,6-diethylnaphthalene":{"A":8.19596,"B":3421.71,"C":331.505},"1,7-diethylnaphthalene":{"A":8.19596,"B":3421.71,"C":331.505},"2,3-diethylnaphthalene":{"A":8.19596,"B":3421.71,"C":331.505},"diethylnonacosylamine":{"A":9.16334,"B":4536.93,"C":273.15},"diethylnonadecylamine":{"A":6.29312,"B":1308.83,"C":20.5619},"diethylnonylamine":{"A":7.03567,"B":1567.75,"C":146.328},"diethyloctacosylamine":{"A":9.26291,"B":4557.77,"C":273.15},"diethyloctadecylamine":{"A":6.41988,"B":1371.23,"C":35.456},"3,3-diethyloctane":{"A":6.93253,"B":1567.35,"C":181.835},"3,4-diethyloctane":{"A":6.97984,"B":1561.05,"C":181.835},"3,5-diethyloctane":{"A":6.97693,"B":1551.75,"C":181.835},"3,6-diethyloctane":{"A":6.98415,"B":1575,"C":181.835},"4,4-diethyloctane":{"A":6.92555,"B":1544.42,"C":181.835},"4,5-diethyloctane":{"A":6.97693,"B":1551.75,"C":181.835},"diethyloctylamine":{"A":7.06936,"B":1557.06,"C":158.743},"diethyl oxalate":{"A":7.4848,"B":1811.09,"C":207.673},"diethylpentacosylamine":{"A":6.2713,"B":1450,"C":9.66667},"diethylpentadecylamine":{"A":6.90998,"B":1687.7,"C":101.872},"3,3-diethylpentane":{"A":7.09525,"B":1578.99,"C":228.471},"diethylpentatriacontylamine":{"A":9.17719,"B":4805.08,"C":273.15},"diethylpentylamine":{"A":7.01117,"B":1378.6,"C":177.771},"2,3-diethylphenol":{"A":7.21813,"B":1721.27,"C":165},"2,4-diethylphenol":{"A":7.21224,"B":1702.25,"C":165},"2,5-diethylphenol":{"A":7.21046,"B":1696.57,"C":165},"2,6-diethylphenol":{"A":7.1965,"B":1652.91,"C":165},"3,4-diethylphenol":{"A":7.27815,"B":1933.6,"C":165},"3,5-diethylphenol":{"A":7.2419,"B":1801.13,"C":165},"diethyl phthalate":{"A":7.68399,"B":2304.78,"C":185.845},"diethylpropylamine":{"A":6.92101,"B":1202.94,"C":185.744},"diethyl succinate":{"A":7.64782,"B":1958.15,"C":194.271},"diethyl sulfate":{"A":7.17299,"B":1780.2,"C":204.905},"diethyl sulfide":{"A":7.20449,"B":1423.41,"C":237.112},"diethyltetracosylamine":{"A":6.21945,"B":1400,"C":9.33333},"diethyltetradecylamine":{"A":7.03065,"B":1759.49,"C":119.991},"diethyltetratriacontylamine":{"A":9.26604,"B":4828.19,"C":273.15},"diethyltriacontylamine":{"A":9.25679,"B":4655.42,"C":273.15},"diethyltricosylamine":{"A":6.1735,"B":1350,"C":9},"diethyltridecylamine":{"A":6.98254,"B":1669.94,"C":116.132},"diethyltritriacontylamine":{"A":9.26487,"B":4789,"C":273.15},"diethylundecylamine":{"A":7.07943,"B":1685.38,"C":138.412},"1,1-difluoro-2,2-dimethylpropane":{"A":6.63839,"B":893.081,"C":202.155},"1,3-difluoro-2,2-dimethylpropane":{"A":6.69398,"B":910.394,"C":202.79},"1,3-difluoro-2-(fluoromethyl)-propane":{"A":6.86451,"B":896.064,"C":209.793},"1,3-difluoro-2-ethylpropane":{"A":6.8116,"B":952.003,"C":203.442},"1,1-difluoro-2-methylbutane":{"A":6.7546,"B":934.204,"C":202.85},"1,2-difluoro-2-methylbutane":{"A":6.69398,"B":910.394,"C":202.79},"1,3-difluoro-2-methylbutane":{"A":6.7546,"B":934.204,"C":202.85},"1,4-difluoro-2-methylbutane":{"A":6.8116,"B":952.003,"C":203.442},"2,3-difluoro-2-methylbutane":{"A":6.63839,"B":893.081,"C":202.155},"1,1-difluoro-2-methylpropane":{"A":6.70691,"B":900.707,"C":202.411},"1,2-difluoro-2-methylpropane":{"A":6.64441,"B":888.36,"C":201.04},"1,3-difluoro-2-methylpropane":{"A":6.74794,"B":996.121,"C":194.587},"1,1-difluoro-3-methylbutane":{"A":6.7546,"B":934.204,"C":202.85},"1,2-difluoro-3-methylbutane":{"A":6.7546,"B":934.204,"C":202.85},"1,3-difluoro-3-methylbutane":{"A":6.69398,"B":910.394,"C":202.79},"2,2-difluoro-3-methylbutane":{"A":6.63839,"B":893.081,"C":202.155},"m-difluorobenzene":{"A":7.21033,"B":1393.09,"C":231.255},"p-difluorobenzene":{"A":7.20567,"B":1376.63,"C":229.456},"1,1-difluorobutane":{"A":7.20361,"B":1204.08,"C":237.542},"1,2-difluorobutane":{"A":6.75439,"B":961.853,"C":198.311},"1,3-difluorobutane":{"A":6.74938,"B":988.212,"C":195.446},"1,4-difluorobutane":{"A":6.79812,"B":1053.75,"C":191.199},"2,2-difluorobutane":{"A":6.64666,"B":877.953,"C":202.236},"2,3-difluorobutane":{"A":6.6994,"B":936.946,"C":198.365},"1,1-difluorodecane":{"A":6.90744,"B":1436.98,"C":173.868},"1,1-difluorodocosane":{"A":7.11168,"B":2145.05,"C":156.001},"1,1-difluorododecane":{"A":7.14499,"B":1769.63,"C":196},"1,1-difluorodotriacontane":{"A":6.38015,"B":2005.62,"C":135.142},"1,1-difluoroeicosane":{"A":7.07461,"B":2071.74,"C":164.001},"1,1-difluoroethane":{"A":7.11973,"B":928.549,"C":244.854},"1,2-difluoroethane":{"A":7.0601,"B":1124.53,"C":238.572},"cis-1,2-difluoroethene":{"A":10.4281,"B":3891.37,"C":540.888},"trans-1,2-difluoroethene":{"A":10.4281,"B":3891.37,"C":540.888},"1,1-difluoroethylene":{"A":6.95654,"B":695.51,"C":256.297},"1,1-difluoroheneicosane":{"A":7.18764,"B":2157.72,"C":160.001},"1,1-difluorohentriacontane":{"A":6.4392,"B":2022.78,"C":137.453},"1,1-difluoroheptacosane":{"A":6.39469,"B":1778.61,"C":107.166},"1,1-difluoroheptadecane":{"A":7.10809,"B":1982.59,"C":176.001},"1,1-difluoroheptane":{"A":7.01248,"B":1339.88,"C":204.595},"1,1-difluoroheptatriacontane":{"A":6.11596,"B":1930.86,"C":124.839},"1,1-difluorohexacosane":{"A":6.60627,"B":1923.45,"C":126.3},"1,1-difluorohexadecane":{"A":7.12991,"B":1954.59,"C":180.001},"1,1-difluorohexane":{"A":7.04305,"B":1289.56,"C":214.824},"1,1-difluorohexatriacontane":{"A":6.15946,"B":1942.37,"C":126.432},"difluoromethane":{"A":7.2902,"B":863.592,"C":247.503},"1,1-difluorononacosane":{"A":5.91489,"B":1431.73,"C":56.8851},"1,1-difluorononadecane":{"A":7.07972,"B":2040.67,"C":168.001},"1,1-difluorononane":{"A":6.9346,"B":1406.14,"C":183.872},"1,1-difluorononatriacontane":{"A":6.02457,"B":1906.53,"C":121.449},"1,1-difluorooctacosane":{"A":6.15544,"B":1603.66,"C":82.7232},"1,1-difluorooctadecane":{"A":7.10524,"B":2019.28,"C":172.001},"1,1-difluorooctane":{"A":6.96837,"B":1374.27,"C":194.208},"1,1-difluorooctatriacontane":{"A":6.07358,"B":1919.87,"C":123.319},"1,1-difluoropentacosane":{"A":6.79163,"B":2042.2,"C":141.192},"1,1-difluoropentadecane":{"A":7.14335,"B":1918.14,"C":184},"1,1-difluoropentane":{"A":7.11549,"B":1252.09,"C":226.677},"1,2-difluoropentane":{"A":6.793,"B":1049.55,"C":193.277},"1,3-difluoropentane":{"A":6.79073,"B":1063.01,"C":191.875},"1,4-difluoropentane":{"A":6.7881,"B":1079.16,"C":190.193},"1,5-difluoropentane":{"A":6.8373,"B":1151.59,"C":185.564},"2,2-difluoropentane":{"A":6.68171,"B":971.977,"C":196.023},"2,3-difluoropentane":{"A":6.74477,"B":983.22,"C":197.609},"2,4-difluoropentane":{"A":6.74477,"B":983.22,"C":197.609},"3,3-difluoropentane":{"A":6.68142,"B":973.534,"C":195.852},"1,1-difluoropentatriacontane":{"A":6.21238,"B":1957.36,"C":128.519},"1,1-difluoropropane":{"A":7.0471,"B":1026.09,"C":238.284},"1,2-difluoropropane":{"A":6.72245,"B":851.585,"C":206.672},"1,3-difluoropropane":{"A":6.76734,"B":936.002,"C":199.533},"2,2-difluoropropane":{"A":6.61827,"B":781.114,"C":209.396},"1,1-difluorotetracontane":{"A":5.99205,"B":1899.45,"C":120.514},"1,1-difluorotetracosane":{"A":6.9213,"B":2097.01,"C":148.001},"1,1-difluorotetradecane":{"A":7.13713,"B":1868.53,"C":188},"1,1-difluorotetratriacontane":{"A":6.26678,"B":1972.9,"C":130.67},"1,1-difluorotriacontane":{"A":6.50907,"B":2043.5,"C":140.217},"1,1-difluorotricosane":{"A":7.02396,"B":2129.58,"C":152.001},"1,1-difluorotridecane":{"A":7.16291,"B":1832.74,"C":192},"1,1-difluorotritriacontane":{"A":6.32269,"B":1988.99,"C":132.879},"1,1-difluoroundecane":{"A":7.15715,"B":1719.09,"C":200},"diglycolic acid":{"A":8.28041,"B":2600.1,"C":144.686},"diheptadecylamine":{"A":8.91081,"B":4583.71,"C":273.15},"diheptylamine":{"A":7.14619,"B":1733.21,"C":134.344},"diheptyl disulfide":{"A":7.57764,"B":2385.29,"C":187.141},"diheptyl ether":{"A":7.55861,"B":2207.92,"C":210},"diheptyl sulfide":{"A":7.76195,"B":2485.95,"C":211.297},"dihexadecylamine":{"A":8.91541,"B":4502.71,"C":273.15},"dihexyl adipate":{"A":8.01511,"B":2699.82,"C":177.84},"dihexylamine":{"A":6.77993,"B":1339.93,"C":103.849},"dihexyl disulfide":{"A":7.56669,"B":2305.32,"C":198.461},"dihexyl ether":{"A":7.5023,"B":1976.43,"C":201.962},"dihexyl sulfide":{"A":7.98677,"B":2223.04,"C":205.383},"2,5-dihydrofuran":{"A":7.15647,"B":1271.44,"C":231.516},"1,3-dihydroxy-2-methylbenzene":{"A":7.39139,"B":1820.36,"C":138.576},"1,4-dihydroxy-2-methylbenzene":{"A":7.38751,"B":1876.95,"C":133.482},"1,2-dihydroxy-3-methylbenzene":{"A":7.39531,"B":1766.92,"C":143.388},"1,2-dihydroxy-4-methylbenzene":{"A":7.39297,"B":1798.36,"C":140.558},"1,3-dihydroxy-4-methylbenzene":{"A":7.39029,"B":1836.08,"C":137.161},"1,3-dihydroxy-5-methylbenzene":{"A":7.38668,"B":1889.53,"C":132.349},"1,1-diiodo-2,2-dimethylpropane":{"A":6.55572,"B":1359.49,"C":146.68},"1,3-diiodo-2,2-dimethylpropane":{"A":6.60972,"B":1385.4,"C":147.83},"1,3-diiodo-2-(iodomethyl)-propane":{"A":6.74014,"B":1639.98,"C":128.189},"1,3-diiodo-2-ethylpropane":{"A":6.72484,"B":1445.1,"C":149.444},"1,1-diiodo-2-methylbutane":{"A":6.66938,"B":1418.53,"C":148.374},"1,2-diiodo-2-methylbutane":{"A":6.60972,"B":1385.4,"C":147.83},"1,3-diiodo-2-methylbutane":{"A":6.66938,"B":1418.53,"C":148.374},"1,4-diiodo-2-methylbutane":{"A":6.72484,"B":1445.1,"C":149.444},"2,3-diiodo-2-methylbutane":{"A":6.55572,"B":1359.49,"C":146.68},"1,1-diiodo-2-methylpropane":{"A":6.42355,"B":1139.72,"C":118.535},"1,2-diiodo-2-methylpropane":{"A":6.33496,"B":1081.84,"C":112.38},"1,3-diiodo-2-methylpropane":{"A":6.49535,"B":1180.86,"C":123.089},"1,1-diiodo-3-methylbutane":{"A":6.66938,"B":1418.53,"C":148.374},"1,2-diiodo-3-methylbutane":{"A":6.66938,"B":1418.53,"C":148.374},"1,3-diiodo-3-methylbutane":{"A":6.60972,"B":1385.4,"C":147.83},"2,2-diiodo-3-methylbutane":{"A":6.55572,"B":1359.49,"C":146.68},"1,1-diiodobutane":{"A":6.49535,"B":1180.86,"C":123.089},"1,2-diiodobutane":{"A":6.48855,"B":1174.76,"C":122.013},"1,3-diiodobutane":{"A":6.49535,"B":1180.86,"C":123.089},"1,4-diiodobutane":{"A":6.57085,"B":1224.98,"C":127.92},"2,2-diiodobutane":{"A":6.33496,"B":1081.84,"C":112.38},"2,3-diiodobutane":{"A":6.42355,"B":1139.72,"C":118.535},"1,1-diiododecane":{"A":6.96041,"B":1929.29,"C":132.021},"1,1-diiododocosane":{"A":7.27561,"B":3297.66,"C":134.907},"1,1-diiodododecane":{"A":7.04828,"B":2131.33,"C":124.77},"1,1-diiododotriacontane":{"A":4.75234,"B":1600,"C":10.6667},"1,1-diiodoeicosane":{"A":7.1311,"B":2814.5,"C":92.5013},"1,1-diiodoethane":{"A":6.29573,"B":965.122,"C":103.62},"1,2-diiodoethane":{"A":6.50432,"B":1174.16,"C":124.031},"1,1-diiodoheneicosane":{"A":7.09145,"B":2865.46,"C":87.9592},"1,1-diiodohentriacontane":{"A":4.74446,"B":1550,"C":10.3333},"1,1-diiodoheptacosane":{"A":7.46767,"B":4746.74,"C":305.006},"1,1-diiodoheptadecane":{"A":7.17259,"B":2602.58,"C":105.36},"1,1-diiodoheptane":{"A":6.81704,"B":1632.75,"C":142.552},"1,1-diiodoheptatriacontane":{"A":4.7861,"B":1850,"C":12.3333},"1,1-diiodohexacosane":{"A":7.5666,"B":4680.81,"C":291.969},"1,1-diiodohexadecane":{"A":7.16379,"B":2516.64,"C":109.421},"1,1-diiodohexane":{"A":6.77004,"B":1537.7,"C":146.005},"1,1-diiodohexatriacontane":{"A":4.78001,"B":1800,"C":12},"diiodomethane":{"A":6.56525,"B":1211.8,"C":146.897},"1,1-diiodononacosane":{"A":7.0714,"B":4446.18,"C":285.383},"1,1-diiodononadecane":{"A":7.1573,"B":2752.86,"C":96.909},"1,1-diiodononane":{"A":6.91314,"B":1828.98,"C":135.569},"1,1-diiodononatriacontane":{"A":4.79745,"B":1950,"C":13},"1,1-diiodooctacosane":{"A":7.29829,"B":4662.26,"C":302.683},"1,1-diiodooctadecane":{"A":7.17081,"B":2681.77,"C":101.192},"1,1-diiodooctane":{"A":6.86503,"B":1729.97,"C":139.076},"1,1-diiodooctatriacontane":{"A":4.7919,"B":1900,"C":12.6667},"1,1-diiodopentacosane":{"A":7.58981,"B":4469.38,"C":265.025},"1,1-diiodopentadecane":{"A":7.14565,"B":2425.3,"C":113.384},"1,1-diiodopentane":{"A":6.72484,"B":1445.1,"C":149.444},"1,2-diiodopentane":{"A":6.72484,"B":1445.1,"C":149.444},"1,3-diiodopentane":{"A":6.72484,"B":1445.1,"C":149.444},"1,4-diiodopentane":{"A":6.72484,"B":1445.1,"C":149.444},"1,5-diiodopentane":{"A":6.78096,"B":1471.93,"C":150.475},"2,2-diiodopentane":{"A":6.60972,"B":1385.4,"C":147.83},"2,3-diiodopentane":{"A":6.66938,"B":1418.53,"C":148.374},"2,4-diiodopentane":{"A":6.66938,"B":1418.53,"C":148.374},"3,3-diiodopentane":{"A":6.60972,"B":1385.4,"C":147.83},"1,1-diiodopentatriacontane":{"A":4.77361,"B":1750,"C":11.6667},"1,1-diiodopropane":{"A":6.3189,"B":983.738,"C":105.399},"1,2-diiodopropane":{"A":6.63954,"B":1393.87,"C":143.825},"1,3-diiodopropane":{"A":6.68429,"B":1397.89,"C":144.53},"2,2-diiodopropane":{"A":6.15864,"B":880.116,"C":95.5061},"1,1-diiodotetracontane":{"A":4.80274,"B":2000,"C":13.3333},"1,1-diiodotetracosane":{"A":7.5409,"B":4140.13,"C":227.214},"1,1-diiodotetradecane":{"A":7.11947,"B":2329.85,"C":117.258},"1,1-diiodotetratriacontane":{"A":4.76689,"B":1700,"C":11.3333},"1,1-diiodotriacontane":{"A":5.78265,"B":2356.23,"C":13.4874},"1,1-diiodotricosane":{"A":7.43097,"B":3734.86,"C":182.49},"1,1-diiodotridecane":{"A":7.08658,"B":2231.5,"C":121.051},"1,1-diiodotritriacontane":{"A":4.75981,"B":1650,"C":11},"1,1-diiodoundecane":{"A":7.00583,"B":2030.31,"C":128.424},"diisobutylamine":{"A":7.43551,"B":1714.21,"C":237.261},"diisobutyl ketone":{"A":7.34997,"B":1720.84,"C":216.788},"diisodecyl phthalate":{"A":7.915,"B":3354.55,"C":216.504},"diisooctyl phthalate":{"A":7.99481,"B":3048.3,"C":175.22},"diisopropanolamine":{"A":8.69663,"B":2401.26,"C":164.134},"diisopropylamine":{"A":6.89567,"B":1118.39,"C":194.663},"m-diisopropylbenzene":{"A":7.01959,"B":1711.81,"C":210.423},"p-diisopropylbenzene":{"A":7.03004,"B":1703.4,"C":200.033},"diisopropyl ether":{"A":7.20537,"B":1354.97,"C":245.019},"diisopropyl sulfide":{"A":7.1154,"B":1481.93,"C":229.918},"diketene":{"A":7.58867,"B":1694.83,"C":233.95},"2,4'-dimethlbiphenyl":{"A":7.21952,"B":1999.88,"C":186.94},"1,2-dimethoxyethane":{"A":7.30039,"B":1418.59,"C":236.928},"2,2-dimethyl,3,3-diethylhexane":{"A":6.76997,"B":1485.02,"C":181.835},"2,3-dimethyl-(1-thiaethyl)-benzene":{"A":7.1609,"B":1846.63,"C":193.858},"2,4-dimethyl-(1-thiaethyl)-benzene":{"A":7.1609,"B":1846.63,"C":193.858},"2,5-dimethyl-(1-thiaethyl)-benzene":{"A":7.1609,"B":1846.63,"C":193.858},"2,6-dimethyl-(1-thiaethyl)-benzene":{"A":7.1609,"B":1846.63,"C":193.858},"3,4-dimethyl-(1-thiaethyl)-benzene":{"A":7.1609,"B":1846.63,"C":193.858},"3,5-dimethyl-(1-thiaethyl)-benzene":{"A":7.1609,"B":1846.63,"C":193.858},"dimethyl-1,1-dimethylpropylamine":{"A":6.74151,"B":1156.86,"C":181.651},"2,3-dimethyl-1,2-butanediol":{"A":9.37242,"B":3115,"C":273},"3,3-dimethyl-1,2-butanediol":{"A":9.37241,"B":3106.23,"C":273},"dimethyl-1,2-dimethylpropylamine":{"A":6.86105,"B":1197.42,"C":183.491},"4,4-dimethyl-1,2-pentanediol":{"A":9.4059,"B":3372.69,"C":273},"2,3-dimethyl-1,3-butadiene":{"A":6.91902,"B":1204.77,"C":229.562},"2,2-dimethyl-1,3-butanediol":{"A":9.3724,"B":3086.1,"C":273},"2,3-dimethyl-1,3-butanediol":{"A":9.37242,"B":3115,"C":273},"2,2-dimethyl-1,3-pentanediol":{"A":9.4058,"B":3167.88,"C":273},"2,3-dimethyl-1,3-pentanediol":{"A":9.4059,"B":3372.69,"C":273},"2,2-dimethyl-1,3-propanediol":{"A":9.44141,"B":3122.83,"C":272.997},"2,2-dimethyl-1,4-butanediol":{"A":9.37242,"B":3115,"C":273},"3,4-dimethyl-1,4-pentanediol":{"A":9.4059,"B":3372.69,"C":273},"2,2-dimethyl-1,5-pentanediol":{"A":9.48101,"B":3261.16,"C":273},"3,3-dimethyl-1,5-pentanediol":{"A":9.48101,"B":3261.16,"C":273},"2,2-dimethyl-1-butanol":{"A":7.0876,"B":1303.25,"C":172.996},"2,3-dimethyl-1-butanol":{"A":7.23206,"B":1412.38,"C":175.592},"3,3-dimethyl-1-butanol":{"A":7.35268,"B":1458.46,"C":183.141},"2,3-dimethyl-1-butene":{"A":6.996,"B":1225.84,"C":242.271},"3,3-dimethyl-1-butene":{"A":6.91634,"B":1115.98,"C":235.289},"3,3-dimethyl-1-butyne":{"A":6.73565,"B":1009.76,"C":224.226},"1,cis-2-dimethyl-1-ethylcyclopentane":{"A":6.88902,"B":1425.48,"C":211.64},"1,trans-2-dimethyl-1-ethylcyclopentane":{"A":6.88902,"B":1425.48,"C":211.64},"1,cis-3-dimethyl-1-ethylcyclopentane":{"A":6.89153,"B":1400.38,"C":213.16},"1,trans-3-dimethyl-1-ethylcyclopentane":{"A":6.89153,"B":1400.38,"C":213.16},"2,4-dimethyl-1-ethylnaphthalene":{"A":8.8486,"B":4489.14,"C":439.968},"4,6-dimethyl-1-ethylnaphthalene":{"A":8.8486,"B":4489.14,"C":439.968},"2,2-dimethyl-1-heptanol":{"A":8.42447,"B":2577.8,"C":273},"4,6-dimethyl-1-heptanol":{"A":8.50271,"B":2557.12,"C":273},"6,6-dimethyl-1-heptanol":{"A":8.42444,"B":2521.52,"C":273},"2,2-dimethyl-1-hexanol":{"A":7.26728,"B":1420.6,"C":151.36},"2,3-dimethyl-1-hexanol":{"A":8.4508,"B":2488.95,"C":273},"2,4-dimethyl-1-hexanol":{"A":8.4508,"B":2495.36,"C":273},"2,5-dimethyl-1-hexanol":{"A":8.45082,"B":2517.64,"C":273},"3,3-dimethyl-1-hexanol":{"A":8.37088,"B":2491.67,"C":273},"3,4-dimethyl-1-hexanol":{"A":8.45082,"B":2527.95,"C":273},"3,5-dimethyl-1-hexanol":{"A":8.45083,"B":2539.93,"C":273},"4,4-dimethyl-1-hexanol":{"A":8.37088,"B":2497.16,"C":273},"4,5-dimethyl-1-hexanol":{"A":8.45083,"B":2533.52,"C":273},"5,5-dimethyl-1-hexanol":{"A":8.37088,"B":2497.16,"C":273},"2,3-dimethyl-1-hexene":{"A":6.943,"B":1329.34,"C":216.749},"2,4-dimethyl-1-hexene":{"A":6.94485,"B":1333.31,"C":216.875},"2,5-dimethyl-1-hexene":{"A":6.94625,"B":1335.87,"C":216.991},"3,3-dimethyl-1-hexene":{"A":6.80242,"B":1225.62,"C":208.531},"3,4-dimethyl-1-hexene":{"A":6.93555,"B":1332.21,"C":216.557},"3,5-dimethyl-1-hexene":{"A":6.90587,"B":1280.38,"C":214.103},"4,4-dimethyl-1-hexene":{"A":6.81199,"B":1243.79,"C":209.191},"4,5-dimethyl-1-hexene":{"A":6.92458,"B":1312.77,"C":215.639},"5,5-dimethyl-1-hexene":{"A":6.79607,"B":1215.67,"C":207.996},"2,2-dimethyl-1-octanol":{"A":8.47469,"B":2690.66,"C":273},"2,6-dimethyl-1-octanol":{"A":8.55073,"B":2737.72,"C":273},"3,7-dimethyl-1-octanol":{"A":8.55073,"B":2749.91,"C":273},"4,5-dimethyl-1-octanol":{"A":8.55073,"B":2749.06,"C":273},"4,6-dimethyl-1-octanol":{"A":8.55073,"B":2749.06,"C":273},"4,7-dimethyl-1-octanol":{"A":8.55073,"B":2749.06,"C":273},"7,7-dimethyl-1-octanol":{"A":8.4747,"B":2712.2,"C":273},"2,2-dimethyl-1-pentanol":{"A":8.31544,"B":2315.15,"C":273},"2,3-dimethyl-1-pentanol":{"A":7.48948,"B":1559.91,"C":174.473},"2,4-dimethyl-1-pentanol":{"A":8.39657,"B":2382.81,"C":273},"3,3-dimethyl-1-pentanol":{"A":7.32804,"B":1459.8,"C":163.249},"3,4-dimethyl-1-pentanol":{"A":7.89792,"B":1925.12,"C":218.712},"4,4-dimethyl-1-pentanol":{"A":8.31547,"B":2353.21,"C":273},"2,3-dimethyl-1-pentene":{"A":6.89157,"B":1219.03,"C":219.659},"2,4-dimethyl-1-pentene":{"A":6.96754,"B":1269.66,"C":229.068},"3,3-dimethyl-1-pentene":{"A":6.75306,"B":1120.95,"C":212.002},"3,4-dimethyl-1-pentene":{"A":6.86554,"B":1190.58,"C":217.986},"4,4-dimethyl-1-pentene":{"A":6.90795,"B":1223.39,"C":231.268},"3,3-dimethyl-1-pentyne":{"A":6.7559,"B":1113.24,"C":217.282},"3,4-dimethyl-1-pentyne":{"A":6.81421,"B":1163.29,"C":215.748},"4,4-dimethyl-1-pentyne":{"A":6.76015,"B":1136.26,"C":216.821},"2,2-dimethyl-1-propanethiol":{"A":7.03278,"B":1380.49,"C":228.809},"2,2-dimethyl-1-propanol":{"A":7.27679,"B":1279.01,"C":177.849},"dimethyl-2,2-dimethylpropylamine":{"A":6.74175,"B":1155.13,"C":181.833},"2,3-dimethyl-2,3-butanediol":{"A":9.20493,"B":2819.3,"C":273},"2,3-dimethyl-2,3-diphenylbutane":{"A":7.1468,"B":2118.37,"C":180.722},"2,3-dimethyl-2,3-pentanediol":{"A":9.24416,"B":3345.21,"C":273},"2,4-dimethyl-2,3-pentanediol":{"A":9.32983,"B":2960.1,"C":273},"2,4-dimethyl-2,4-pentanediol":{"A":9.24399,"B":2989.74,"C":273},"2,3-dimethyl-2-butanol":{"A":7.02103,"B":1216.83,"C":175.305},"3,3-dimethyl-2-butanol":{"A":6.9491,"B":1166.75,"C":166.791},"3,3-dimethyl-2-butanone":{"A":6.91427,"B":1312.9,"C":219.202},"2,3-dimethyl-2-butene":{"A":6.88803,"B":1197.57,"C":225.653},"2,3-dimethyl-2-tert-butyl-1-butanol":{"A":8.19111,"B":2473.8,"C":273},"2,3-dimethyl-2-ethyl-1-butanol":{"A":8.29873,"B":2415.58,"C":273},"3,3-dimethyl-2-ethyl-1-butanol":{"A":8.29873,"B":2415.58,"C":273},"3,3-dimethyl-2-ethyl-1-butene":{"A":6.74521,"B":1220.64,"C":205.869},"5,5-dimethyl-2-ethyl-1-hexanol":{"A":8.40589,"B":2684.36,"C":273},"2,4-dimethyl-2-ethyl-1-pentanol":{"A":8.35371,"B":2523.01,"C":273},"1,1-dimethyl-2-ethylcyclopentane":{"A":6.89089,"B":1406.66,"C":212.78},"1,cis-3-dimethyl-cis-2-ethylcyclopentane":{"A":6.87726,"B":1447.19,"C":210.12},"1,cis-3-dimethyl-trans-2-ethylcyclopentane":{"A":6.8819,"B":1400.26,"C":212.97},"1,trans-3-dimethyl-cis-2-ethylcyclopentane":{"A":6.87969,"B":1422.16,"C":211.64},"3,4-dimethyl-2-ethylphenol":{"A":7.22336,"B":1766.77,"C":165},"3,5-dimethyl-2-ethylphenol":{"A":7.25145,"B":1865.61,"C":165},"2,3-dimethyl-2-heptanol":{"A":8.35369,"B":2489.34,"C":273},"2,4-dimethyl-2-heptanol":{"A":8.35369,"B":2489.34,"C":273},"2,5-dimethyl-2-heptanol":{"A":8.35369,"B":2489.34,"C":273},"2,6-dimethyl-2-heptanol":{"A":8.35366,"B":2429.95,"C":273},"4,6-dimethyl-2-heptanol":{"A":8.43202,"B":2592.41,"C":273},"5,6-dimethyl-2-heptanol":{"A":8.43201,"B":2581.31,"C":273},"2,3-dimethyl-2-hexanol":{"A":7.39364,"B":1508.47,"C":174.163},"2,4-dimethyl-2-hexanol":{"A":7.59421,"B":1642.33,"C":197.739},"2,5-dimethyl-2-hexanol":{"A":7.28676,"B":1396.39,"C":164.432},"3,3-dimethyl-2-hexanol":{"A":8.29869,"B":2345.13,"C":273},"3,4-dimethyl-2-hexanol":{"A":8.37846,"B":2440.96,"C":273},"3,5-dimethyl-2-hexanol":{"A":8.37842,"B":2380.47,"C":273},"4,4-dimethyl-2-hexanol":{"A":8.29869,"B":2355.97,"C":273},"4,5-dimethyl-2-hexanol":{"A":8.37843,"B":2390.64,"C":273},"5,5-dimethyl-2-hexanol":{"A":8.29871,"B":2378.46,"C":273},"2,3-dimethyl-2-hexene":{"A":6.96827,"B":1394.27,"C":219.34},"2,4-dimethyl-2-hexene":{"A":6.91471,"B":1314.01,"C":215.141},"2,5-dimethyl-2-hexene":{"A":6.88619,"B":1295.82,"C":211.321},"3,4-dimethyl-cis-2-hexene":{"A":6.93583,"B":1350.33,"C":217.002},"3,4-dimethyl-trans-2-hexene":{"A":6.93583,"B":1350.33,"C":217.002},"3,5-dimethyl-cis-2-hexene":{"A":6.92147,"B":1324.44,"C":215.778},"3,5-dimethyl-trans-2-hexene":{"A":6.92147,"B":1324.44,"C":215.778},"4,4-dimethyl-cis-2-hexene":{"A":6.78348,"B":1224.11,"C":207.66},"4,4-dimethyl-trans-2-hexene":{"A":6.78348,"B":1224.11,"C":207.66},"4,5-dimethyl-cis-2-hexene":{"A":6.9005,"B":1304.02,"C":214.407},"4,5-dimethyl-trans-2-hexene":{"A":6.9005,"B":1304.02,"C":214.407},"5,5-dimethyl-cis-2-hexene":{"A":6.78586,"B":1228.95,"C":207.807},"5,5-dimethyl-trans-2-hexene":{"A":6.77618,"B":1212.11,"C":207.067},"1,3-dimethyl-2-isopropylbenzene":{"A":7.06822,"B":1675.76,"C":201.19},"1,4-dimethyl-2-isopropylbenzene":{"A":7.06895,"B":1666.55,"C":201.722},"dimethyl-2-methylbutylamine":{"A":6.862,"B":1190.49,"C":184.179},"2,4-dimethyl-2-octanol":{"A":8.40589,"B":2678.83,"C":273},"2,7-dimethyl-2-octanol":{"A":8.40589,"B":2678.83,"C":273},"3,7-dimethyl-2-octanol":{"A":8.4822,"B":2715.83,"C":273},"2,3-dimethyl-2-pentanol":{"A":7.43628,"B":1485.28,"C":187.043},"2,4-dimethyl-2-pentanol":{"A":7.50626,"B":1520.15,"C":195.65},"3,3-dimethyl-2-pentanol":{"A":8.36084,"B":2372.16,"C":285.873},"3,4-dimethyl-2-pentanol":{"A":8.32314,"B":2318.43,"C":273},"4,4-dimethyl-2-pentanol":{"A":7.43087,"B":1477.3,"C":186.677},"3,3-dimethyl-2-pentanone":{"A":7.58364,"B":1898.06,"C":273},"3,4-dimethyl-2-pentanone":{"A":7.65753,"B":1934.57,"C":273},"4,4-dimethyl-2-pentanone":{"A":7.58363,"B":1871.72,"C":273},"2,3-dimethyl-2-pentene":{"A":6.92461,"B":1294.65,"C":222.757},"2,4-dimethyl-2-pentene":{"A":6.85493,"B":1194.33,"C":217.228},"3,4-dimethyl-cis-2-pentene":{"A":6.88277,"B":1236.38,"C":219.695},"3,4-dimethyl-trans-2-pentene":{"A":6.89068,"B":1250.42,"C":220.335},"4,4-dimethyl-cis-2-pentene":{"A":6.87142,"B":1224.24,"C":226.35},"4,4-dimethyl-trans-2-pentene":{"A":6.78414,"B":1149.06,"C":217.64},"dimethyl-2-pentylamine":{"A":6.86429,"B":1174.28,"C":185.788},"4,4-dimethyl-2-pentyne":{"A":6.69985,"B":1126.39,"C":211.941},"1,4-dimethyl-2-phenyl benzene":{"A":7.0217,"B":1885.22,"C":188.27},"1,3-dimethyl-2-propylbenzene":{"A":7.12179,"B":1726.74,"C":199.556},"1,4-dimethyl-2-propylbenzene":{"A":7.12264,"B":1715.75,"C":200.183},"3,3-dimethyl-2-thiabutane":{"A":6.48522,"B":1045.71,"C":191.221},"3,3-dimethyl-2-thiapentane":{"A":6.8912,"B":1345.4,"C":207.478},"3,4-dimethyl-2-thiapentane":{"A":6.95135,"B":1365.93,"C":207.565},"4,4-dimethyl-2-thiapentane":{"A":6.8912,"B":1345.4,"C":207.478},"2,4-dimethyl-3,3-diethylhexane":{"A":6.82492,"B":1506,"C":181.835},"2,5-dimethyl-3,3-diethylhexane":{"A":6.81105,"B":1461.4,"C":181.835},"2,2-dimethyl-3,3-diethylpentane":{"A":6.75303,"B":1458.67,"C":187.7},"2,4-dimethyl-3,3-diethylpentane":{"A":6.8088,"B":1479.67,"C":187.7},"2,2-dimethyl-3,4-diethylhexane":{"A":6.81105,"B":1461.4,"C":181.835},"2,3-dimethyl-3,4-diethylhexane":{"A":6.83031,"B":1523.85,"C":181.835},"2,4-dimethyl-3,4-diethylhexane":{"A":6.82492,"B":1506,"C":181.835},"2,5-dimethyl-3,4-diethylhexane":{"A":6.86607,"B":1481.86,"C":181.835},"3,4-dimethyl-3,4-diethylhexane":{"A":6.78299,"B":1529.01,"C":181.835},"2,2-dimethyl-3-tert-butylhexane":{"A":6.71504,"B":1448.7,"C":181.835},"2,2-dimethyl-3-ethyl-1-pentanol":{"A":8.35371,"B":2522.19,"C":273},"2,3-dimethyl-3-ethyl-2-pentanol":{"A":8.20499,"B":2453.65,"C":273},"4,4-dimethyl-3-ethyl-2-pentanol":{"A":8.28294,"B":2489.57,"C":273},"5,5-dimethyl-3-ethyl-3-hexanol":{"A":8.26031,"B":2473.76,"C":273},"2,4-dimethyl-3-ethyl-3-isopropylpentane":{"A":6.7828,"B":1513.33,"C":181.835},"2,2-dimethyl-3-ethyl-3-pentanol":{"A":8.20495,"B":2379.89,"C":273},"2,4-dimethyl-3-ethyl-3-pentanol":{"A":8.28291,"B":2435.81,"C":273},"1,1-dimethyl-3-ethylcyclopentane":{"A":6.89217,"B":1394.11,"C":213.54},"1,cis-2-dimethyl-cis-3-ethylcyclopentane":{"A":6.87726,"B":1447.19,"C":210.12},"1,cis-2-dimethyl-trans-3-ethylcyclopentane":{"A":6.87938,"B":1425.29,"C":211.45},"1,trans-2-dimethyl-cis-3-ethylcyclopentane":{"A":6.88158,"B":1403.39,"C":212.78},"1,trans-2-dimethyl-trans-3-ethylcyclopentane":{"A":6.87938,"B":1425.29,"C":211.45},"2,2-dimethyl-3-ethylheptane":{"A":6.84227,"B":1440.78,"C":187.7},"2,3-dimethyl-3-ethylheptane":{"A":6.84781,"B":1458.67,"C":187.7},"2,4-dimethyl-3-ethylheptane":{"A":6.90276,"B":1474.85,"C":187.7},"2,5-dimethyl-3-ethylheptane":{"A":6.89851,"B":1461.24,"C":187.7},"2,6-dimethyl-3-ethylheptane":{"A":6.89851,"B":1461.24,"C":187.7},"3,4-dimethyl-3-ethylheptane":{"A":6.8546,"B":1481.03,"C":187.7},"3,5-dimethyl-3-ethylheptane":{"A":6.84781,"B":1458.67,"C":187.7},"4,4-dimethyl-3-ethylheptane":{"A":6.84227,"B":1440.78,"C":187.7},"2,5-dimethyl-3-ethylnaphthalene":{"A":8.8486,"B":4489.14,"C":439.968},"2,2-dimethyl-3-ethyloctane":{"A":6.86956,"B":1507.09,"C":181.835},"2,3-dimethyl-3-ethyloctane":{"A":6.87791,"B":1534.23,"C":181.835},"2,4-dimethyl-3-ethyloctane":{"A":6.92643,"B":1532.62,"C":181.835},"2,5-dimethyl-3-ethyloctane":{"A":6.92211,"B":1518.86,"C":181.835},"2,6-dimethyl-3-ethyloctane":{"A":6.92643,"B":1532.62,"C":181.835},"2,7-dimethyl-3-ethyloctane":{"A":6.925,"B":1528.04,"C":181.835},"3,4-dimethyl-3-ethyloctane":{"A":6.87515,"B":1525.18,"C":181.835},"3,5-dimethyl-3-ethyloctane":{"A":6.86956,"B":1507.09,"C":181.835},"3,6-dimethyl-3-ethyloctane":{"A":6.87376,"B":1520.66,"C":181.835},"4,4-dimethyl-3-ethyloctane":{"A":6.87237,"B":1516.13,"C":181.835},"4,5-dimethyl-3-ethyloctane":{"A":6.92928,"B":1541.8,"C":181.835},"2,2-dimethyl-3-ethylpentane":{"A":7.09332,"B":1541.78,"C":232.161},"2,3-dimethyl-3-ethylpentane":{"A":7.12831,"B":1592.54,"C":230.225},"2,4-dimethyl-3-ethylpentane":{"A":7.1514,"B":1590.45,"C":235.7},"2,4-dimethyl-3-ethylphenol":{"A":7.22336,"B":1766.77,"C":165},"2,5-dimethyl-3-ethylphenol":{"A":7.20081,"B":1692.79,"C":165},"2,6-dimethyl-3-ethylphenol":{"A":7.20081,"B":1692.79,"C":165},"2,2-dimethyl-3-heptanol":{"A":8.35368,"B":2467.44,"C":273},"2,3-dimethyl-3-heptanol":{"A":8.35367,"B":2446.37,"C":273},"2,6-dimethyl-3-heptanol":{"A":8.43196,"B":2486.92,"C":273},"3,5-dimethyl-3-heptanol":{"A":8.35368,"B":2461.97,"C":273},"3,6-dimethyl-3-heptanol":{"A":7.98299,"B":2137.4,"C":245.92},"2,2-dimethyl-3-hexanol":{"A":8.59057,"B":2630.39,"C":304.583},"2,3-dimethyl-3-hexanol":{"A":7.96787,"B":2010.57,"C":237.032},"2,4-dimethyl-3-hexanol":{"A":8.54694,"B":2555.59,"C":291.03},"2,5-dimethyl-3-hexanol":{"A":7.72056,"B":1750.91,"C":202.777},"3,4-dimethyl-3-hexanol":{"A":7.66079,"B":1704.75,"C":204.643},"3,5-dimethyl-3-hexanol":{"A":8.25371,"B":2257.6,"C":268.183},"4,4-dimethyl-3-hexanol":{"A":7.85366,"B":1907.2,"C":224.524},"4,5-dimethyl-3-hexanol":{"A":8.37841,"B":2357.65,"C":273},"5,5-dimethyl-3-hexanol":{"A":7.80664,"B":1838.07,"C":220.149},"2,2-dimethyl-cis-3-hexene":{"A":6.86383,"B":1287.97,"C":217.935},"2,2-dimethyl-trans-3-hexene":{"A":6.79688,"B":1218.2,"C":210.227},"2,3-dimethyl-cis-3-hexene":{"A":6.9288,"B":1337.47,"C":216.404},"2,3-dimethyl-trans-3-hexene":{"A":6.9288,"B":1337.47,"C":216.404},"2,4-dimethyl-cis-3-hexene":{"A":6.90892,"B":1303.75,"C":214.662},"2,4-dimethyl-trans-3-hexene":{"A":6.90532,"B":1296.02,"C":214.431},"2,5-dimethyl-cis-3-hexene":{"A":6.97196,"B":1335.33,"C":224.394},"2,5-dimethyl-trans-3-hexene":{"A":6.86734,"B":1250.05,"C":211.568},"3,4-dimethyl-cis-3-hexene":{"A":6.97114,"B":1397.57,"C":219.676},"3,4-dimethyl-trans-3-hexene":{"A":6.97114,"B":1397.57,"C":219.676},"4,4-dimethyl-3-isopropyl-1-pentanol":{"A":8.33673,"B":2487.08,"C":273},"3,4-dimethyl-3-isopropyl-2-pentanol":{"A":8.26245,"B":2453.22,"C":273},"2,4-dimethyl-3-isopropyl-3-pentanol":{"A":8.26249,"B":2515.93,"C":273},"1,2-dimethyl-3-isopropylbenzene":{"A":7.06728,"B":1687.59,"C":200.506},"2,2-dimethyl-3-isopropylheptane":{"A":6.81105,"B":1461.4,"C":181.835},"2,3-dimethyl-3-isopropylheptane":{"A":6.82628,"B":1510.46,"C":181.835},"2,4-dimethyl-3-isopropylheptane":{"A":6.86895,"B":1490.91,"C":181.835},"2,5-dimethyl-3-isopropylheptane":{"A":6.86607,"B":1481.86,"C":181.835},"2,6-dimethyl-3-isopropylheptane":{"A":6.86723,"B":1485.48,"C":181.835},"2,2-dimethyl-3-isopropylhexane":{"A":6.78598,"B":1404.69,"C":187.7},"2,3-dimethyl-3-isopropylhexane":{"A":6.79693,"B":1439.96,"C":187.7},"2,4-dimethyl-3-isopropylhexane":{"A":6.84598,"B":1438.17,"C":187.7},"2,5-dimethyl-3-isopropylhexane":{"A":6.83888,"B":1415.8,"C":187.7},"2,4-dimethyl-3-isopropylpentane":{"A":7.03264,"B":1563.62,"C":219.559},"dimethyl-3-methylbutylamine":{"A":6.86253,"B":1186.75,"C":184.55},"2,2-dimethyl-3-octanol":{"A":8.40584,"B":2579.36,"C":273},"2,3-dimethyl-3-octanol":{"A":8.40583,"B":2553.11,"C":273},"2,7-dimethyl-3-octanol":{"A":8.48215,"B":2615.82,"C":273},"3,5-dimethyl-3-octanol":{"A":8.40584,"B":2573.83,"C":273},"3,6-dimethyl-3-octanol":{"A":8.40583,"B":2569.14,"C":273},"3,7-dimethyl-3-octanol":{"A":8.40585,"B":2591.24,"C":273},"2,2-dimethyl-3-pentanol":{"A":7.60402,"B":1612.63,"C":205.427},"2,3-dimethyl-3-pentanol":{"A":7.56959,"B":1599.26,"C":201.083},"2,4-dimethyl-3-pentanol":{"A":7.71085,"B":1680.4,"C":209.106},"2,2-dimethyl-3-pentanone":{"A":7.58363,"B":1871.72,"C":273},"2,4-dimethyl-3-pentanone":{"A":7.22513,"B":1509.18,"C":222.992},"dimethyl-3-pentylamine":{"A":6.86156,"B":1193.68,"C":183.863},"2,4-dimethyl-3-propyl-3-pentanol":{"A":8.33674,"B":2493.36,"C":273},"1,2-dimethyl-3-propylbenzene":{"A":7.12099,"B":1737.06,"C":198.967},"2,2-dimethyl-3-thiapentane":{"A":6.91504,"B":1340.42,"C":211.851},"2,2-dimethyl-4,4-diethylhexane":{"A":6.76997,"B":1485.02,"C":181.835},"2,3-dimethyl-4,4-diethylhexane":{"A":6.83031,"B":1523.85,"C":181.835},"3,3-dimethyl-4,4-diethylhexane":{"A":6.78299,"B":1529.01,"C":181.835},"2,2-dimethyl-4-ethyl-3-hexanol":{"A":8.33675,"B":2509.73,"C":273},"2,4-dimethyl-4-ethyl-3-hexanol":{"A":8.33675,"B":2508.91,"C":273},"1,cis-2-dimethyl-cis-4-ethylcyclopentane":{"A":6.87877,"B":1431.55,"C":211.07},"1,cis-2-dimethyl-trans-4-ethylcyclopentane":{"A":6.87877,"B":1431.55,"C":211.07},"1,trans-2-dimethyl-cis-4-ethylcyclopentane":{"A":6.88095,"B":1409.65,"C":212.4},"1,cis-3-dimethyl-cis-4-ethylcyclopentane":{"A":6.87938,"B":1425.29,"C":211.45},"1,cis-3-dimethyl-trans-4-ethylcyclopentane":{"A":6.8819,"B":1400.26,"C":212.97},"1,trans-3-dimethyl-cis-4-ethylcyclopentane":{"A":6.86659,"B":1569.24,"C":202.71},"1,trans-3-dimethyl-trans-4-ethylcyclopentane":{"A":6.87938,"B":1425.29,"C":211.45},"2,2-dimethyl-4-ethylheptane":{"A":6.83089,"B":1405.04,"C":187.7},"2,3-dimethyl-4-ethylheptane":{"A":6.90276,"B":1474.85,"C":187.7},"2,4-dimethyl-4-ethylheptane":{"A":6.83378,"B":1413.98,"C":187.7},"2,5-dimethyl-4-ethylheptane":{"A":6.89708,"B":1456.7,"C":187.7},"2,6-dimethyl-4-ethylheptane":{"A":6.88983,"B":1434.03,"C":187.7},"3,3-dimethyl-4-ethylheptane":{"A":6.84781,"B":1458.67,"C":187.7},"3,4-dimethyl-4-ethylheptane":{"A":6.84918,"B":1463.14,"C":187.7},"3,5-dimethyl-4-ethylheptane":{"A":6.90557,"B":1483.93,"C":187.7},"1,2-dimethyl-4-ethylnaphthalene":{"A":8.8486,"B":4489.14,"C":439.968},"2,2-dimethyl-4-ethyloctane":{"A":6.85664,"B":1466.42,"C":181.835},"2,3-dimethyl-4-ethyloctane":{"A":6.92643,"B":1532.62,"C":181.835},"2,4-dimethyl-4-ethyloctane":{"A":6.86245,"B":1484.49,"C":181.835},"2,5-dimethyl-4-ethyloctane":{"A":6.9192,"B":1509.69,"C":181.835},"2,6-dimethyl-4-ethyloctane":{"A":6.91626,"B":1500.52,"C":181.835},"2,7-dimethyl-4-ethyloctane":{"A":6.91626,"B":1500.52,"C":181.835},"3,3-dimethyl-4-ethyloctane":{"A":6.87237,"B":1516.13,"C":181.835},"3,4-dimethyl-4-ethyloctane":{"A":6.87653,"B":1529.7,"C":181.835},"3,5-dimethyl-4-ethyloctane":{"A":6.92643,"B":1532.62,"C":181.835},"3,6-dimethyl-4-ethyloctane":{"A":6.925,"B":1528.04,"C":181.835},"4,5-dimethyl-4-ethyloctane":{"A":6.87515,"B":1525.18,"C":181.835},"2,3-dimethyl-4-ethylphenol":{"A":7.21599,"B":1742.09,"C":165},"2,5-dimethyl-4-ethylphenol":{"A":7.20081,"B":1692.79,"C":165},"2,6-dimethyl-4-ethylphenol":{"A":7.20259,"B":1698.46,"C":165},"3,5-dimethyl-4-ethylphenol":{"A":7.24758,"B":1851.51,"C":165},"2,2-dimethyl-4-heptanol":{"A":8.35367,"B":2446.37,"C":273},"2,4-dimethyl-4-heptanol":{"A":8.35366,"B":2432.14,"C":273},"2,6-dimethyl-4-heptanol":{"A":7.80665,"B":1884.08,"C":204.641},"3,3-dimethyl-4-heptanol":{"A":8.35368,"B":2457.32,"C":273},"3,5-dimethyl-4-heptanol":{"A":8.432,"B":2553.55,"C":273},"1,2-dimethyl-4-isopropylbenzene":{"A":7.06749,"B":1684.96,"C":200.658},"1,3-dimethyl-4-isopropylbenzene":{"A":7.06819,"B":1676.09,"C":201.171},"2,2-dimethyl-4-isopropylheptane":{"A":6.79952,"B":1425.76,"C":181.835},"2,3-dimethyl-4-isopropylheptane":{"A":6.86895,"B":1490.91,"C":181.835},"2,4-dimethyl-4-isopropylheptane":{"A":6.81387,"B":1470.32,"C":181.835},"2,5-dimethyl-4-isopropylheptane":{"A":6.86462,"B":1477.34,"C":181.835},"2,6-dimethyl-4-isopropylheptane":{"A":6.85579,"B":1450.21,"C":181.835},"3,3-dimethyl-4-isopropylheptane":{"A":6.81667,"B":1479.23,"C":181.835},"3,4-dimethyl-4-isopropylheptane":{"A":6.82628,"B":1510.46,"C":181.835},"3,5-dimethyl-4-isopropylheptane":{"A":6.87181,"B":1499.96,"C":181.835},"2,2-dimethyl-4-octanol":{"A":8.40583,"B":2558.08,"C":273},"2,4-dimethyl-4-octanol":{"A":8.40583,"B":2562.78,"C":273},"2,5-dimethyl-4-octanol":{"A":8.48214,"B":2598.18,"C":273},"2,6-dimethyl-4-octanol":{"A":8.99464,"B":3090.83,"C":310.548},"2,7-dimethyl-4-octanol":{"A":10.1122,"B":4298.84,"C":392.471},"3,4-dimethyl-4-octanol":{"A":8.40583,"B":2562.78,"C":273},"3,6-dimethyl-4-octanol":{"A":8.48214,"B":2598.18,"C":273},"4,6-dimethyl-4-octanol":{"A":8.40583,"B":2562.78,"C":273},"4,7-dimethyl-4-octanol":{"A":8.40583,"B":2569.14,"C":273},"1,3-dimethyl-4-phenyl benzene":{"A":7.19095,"B":1972.75,"C":187.7},"1,2-dimethyl-4-propylbenzene":{"A":7.12145,"B":1731.07,"C":199.309},"1,3-dimethyl-4-propylbenzene":{"A":7.12204,"B":1723.41,"C":199.746},"2,2-dimethyl-4-propylheptane":{"A":6.85222,"B":1452.88,"C":181.835},"2,3-dimethyl-4-propylheptane":{"A":6.92211,"B":1518.86,"C":181.835},"2,4-dimethyl-4-propylheptane":{"A":6.85955,"B":1475.46,"C":181.835},"2,5-dimethyl-4-propylheptane":{"A":6.91626,"B":1500.52,"C":181.835},"2,6-dimethyl-4-propylheptane":{"A":6.9082,"B":1475.78,"C":181.835},"3,3-dimethyl-4-propylheptane":{"A":6.86956,"B":1507.09,"C":181.835},"3,4-dimethyl-4-propylheptane":{"A":6.87237,"B":1516.13,"C":181.835},"3,5-dimethyl-4-propylheptane":{"A":6.925,"B":1528.04,"C":181.835},"2,2-dimethyl-5-ethylheptane":{"A":6.83663,"B":1422.91,"C":187.7},"2,3-dimethyl-5-ethylheptane":{"A":6.90135,"B":1470.31,"C":187.7},"2,4-dimethyl-5-ethylheptane":{"A":6.89851,"B":1461.24,"C":187.7},"2,5-dimethyl-5-ethylheptane":{"A":6.84505,"B":1449.72,"C":187.7},"3,3-dimethyl-5-ethylheptane":{"A":6.84087,"B":1436.31,"C":187.7},"3,4-dimethyl-5-ethylheptane":{"A":6.90696,"B":1488.47,"C":187.7},"1,3-dimethyl-5-ethylnaphthalene":{"A":8.8486,"B":4489.14,"C":439.968},"1,4-dimethyl-5-ethylnaphthalene":{"A":7.83447,"B":2902.8,"C":273.73},"2,2-dimethyl-5-ethyloctane":{"A":6.85955,"B":1475.46,"C":181.835},"2,3-dimethyl-5-ethyloctane":{"A":6.92211,"B":1518.86,"C":181.835},"2,4-dimethyl-5-ethyloctane":{"A":6.92066,"B":1514.28,"C":181.835},"2,5-dimethyl-5-ethyloctane":{"A":6.86531,"B":1493.53,"C":181.835},"2,6-dimethyl-5-ethyloctane":{"A":6.92356,"B":1523.45,"C":181.835},"3,3-dimethyl-5-ethyloctane":{"A":6.86245,"B":1484.49,"C":181.835},"3,4-dimethyl-5-ethyloctane":{"A":6.92786,"B":1537.21,"C":181.835},"3,5-dimethyl-5-ethyloctane":{"A":6.861,"B":1479.97,"C":181.835},"4,4-dimethyl-5-ethyloctane":{"A":6.86956,"B":1507.09,"C":181.835},"2,3-dimethyl-5-ethylphenol":{"A":7.21599,"B":1742.09,"C":165},"2,4-dimethyl-5-ethylphenol":{"A":7.22358,"B":1767.51,"C":165},"3,4-dimethyl-5-ethylphenol":{"A":7.22358,"B":1767.51,"C":165},"1,3-dimethyl-5-isopropylbenzene":{"A":7.0694,"B":1660.97,"C":202.045},"1,3-dimethyl-5-phenyl benzene":{"A":7.2545,"B":2019.55,"C":186.75},"1,3-dimethyl-5-propylbenzene":{"A":7.12318,"B":1708.89,"C":200.575},"1,3-dimethyl-6-ethylnaphthalene":{"A":7.92871,"B":3036.01,"C":289.177},"1,4-dimethyl-6-ethylnaphthalene":{"A":8.33317,"B":3640.75,"C":355.478},"2,2-dimethyl-6-ethyloctane":{"A":6.86531,"B":1493.53,"C":181.835},"2,3-dimethyl-6-ethyloctane":{"A":6.92928,"B":1541.8,"C":181.835},"2,4-dimethyl-6-ethyloctane":{"A":6.9192,"B":1509.69,"C":181.835},"2,5-dimethyl-6-ethyloctane":{"A":6.92643,"B":1532.62,"C":181.835},"2,6-dimethyl-6-ethyloctane":{"A":6.87237,"B":1516.13,"C":181.835},"3,3-dimethyl-6-ethyloctane":{"A":6.86956,"B":1507.09,"C":181.835},"3,4-dimethyl-6-ethyloctane":{"A":6.92786,"B":1537.21,"C":181.835},"3,5-dimethyl-6-ethyloctane":{"A":6.92643,"B":1532.62,"C":181.835},"4,4-dimethyl-6-ethyloctane":{"A":6.86245,"B":1484.49,"C":181.835},"2,3-dimethyl-6-ethylphenol":{"A":7.21599,"B":1742.09,"C":165},"2,4-dimethyl-6-ethylphenol":{"A":7.20104,"B":1693.53,"C":165},"2,5-dimethyl-6-ethylphenol":{"A":7.20081,"B":1692.79,"C":165},"3,4-dimethyl-6-ethylphenol":{"A":7.22336,"B":1766.77,"C":165},"1,2-dimethyl-7-ethylnaphthalene":{"A":8.72789,"B":4282.65,"C":420.181},"dimethyl-sec-butylamine":{"A":6.81847,"B":1109.86,"C":187.859},"dimethyl-tert-butylamine":{"A":6.7012,"B":1059.35,"C":187.29},"1,4a-dimethyl-cis-decahydronaphthalene":{"A":6.89242,"B":1673.64,"C":197.2},"1,4a-dimethyl-trans-decahydronaphthalene":{"A":6.89404,"B":1651.57,"C":198.53},"dimethyl-propylamine":{"A":6.46436,"B":919.461,"C":190.579},"dimethylacetylene":{"A":6.86957,"B":1009.54,"C":226.118},"dimethylaluminum chloride":{"A":6.8335,"B":1342.79,"C":213.714},"dimethylamine":{"A":7.16171,"B":1005.33,"C":227.96},"p-dimethylaminobenzaldehyde":{"A":7.76756,"B":2740.88,"C":246.031},"2,2'-dimethylbiphenyl":{"A":7.26677,"B":1964.82,"C":189.98},"3,3'-dimethylbiphenyl":{"A":7.32993,"B":2094.02,"C":184.66},"3,4'-dimethylbiphenyl":{"A":7.13718,"B":1992.96,"C":185.23},"4,4'-dimethylbiphenyl":{"A":7.19175,"B":2053.43,"C":183.33},"2,3-dimethylbiphenyl":{"A":7.15097,"B":1982.12,"C":186.18},"3,4-dimethylbiphenyl":{"A":7.22477,"B":2030.46,"C":185.42},"2,6-dimethylbiphenyl":{"A":7.25343,"B":1976.56,"C":189.03},"2,2-dimethylbutanal":{"A":7.04624,"B":1299.61,"C":208},"2,3-dimethylbutanal":{"A":7.12068,"B":1361,"C":208},"3,3-dimethylbutanal":{"A":7.04624,"B":1299.61,"C":208},"2,2-dimethylbutane":{"A":6.93954,"B":1169.51,"C":238.418},"2,3-dimethylbutane":{"A":6.98947,"B":1220.01,"C":238.956},"2,2-dimethylbutanenitrile":{"A":6.8205,"B":1213.9,"C":179.122},"2,3-dimethylbutanenitrile":{"A":6.88393,"B":1233.93,"C":180.242},"3,3-dimethylbutanenitrile":{"A":6.81808,"B":1233.06,"C":177.176},"dimethylbutylamine":{"A":6.56108,"B":1027.26,"C":185.126},"1,1-dimethylcyclobutane":{"A":6.91449,"B":1147.02,"C":228.36},"1,cis-2-dimethylcyclobutane":{"A":6.89337,"B":1180.01,"C":226.08},"1,trans-2-dimethylcyclobutane":{"A":6.89694,"B":1155.04,"C":227.6},"1,cis-3-dimethylcyclobutane":{"A":6.89671,"B":1156.6,"C":227.505},"1,trans-3-dimethylcyclobutane":{"A":6.89809,"B":1147.24,"C":228.075},"1,1-dimethylcyclohexane":{"A":6.86464,"B":1363.21,"C":222.636},"cis-1,2-dimethylcyclohexane":{"A":6.86433,"B":1395.63,"C":220.561},"trans-1,2-dimethylcyclohexane":{"A":6.92012,"B":1420.58,"C":228.259},"cis-1,3-dimethylcyclohexane":{"A":6.89241,"B":1384.05,"C":224.923},"trans-1,3-dimethylcyclohexane":{"A":6.89366,"B":1402.52,"C":225.047},"cis-1,4-dimethylcyclohexane":{"A":6.89096,"B":1402.12,"C":225.323},"trans-1,4-dimethylcyclohexane":{"A":6.87792,"B":1369.34,"C":223.224},"1,2-dimethylcyclohexene":{"A":6.87201,"B":1399.97,"C":212.784},"1,3-dimethylcyclohexene":{"A":6.87544,"B":1365.97,"C":214.851},"1,4-dimethylcyclohexene":{"A":6.86933,"B":1368.78,"C":214.68},"1,5-dimethylcyclohexene":{"A":6.87515,"B":1368.78,"C":214.68},"1,6-dimethylcyclohexene":{"A":6.87416,"B":1378.47,"C":214.091},"3,3-dimethylcyclohexene":{"A":6.89122,"B":1345.05,"C":216.39},"3,cis-4-dimethylcyclohexene":{"A":6.8769,"B":1352.06,"C":215.697},"3,trans-4-dimethylcyclohexene":{"A":6.8769,"B":1352.06,"C":215.697},"3,cis-5-dimethylcyclohexene":{"A":6.85517,"B":1352.06,"C":215.697},"3,trans-5-dimethylcyclohexene":{"A":6.8769,"B":1352.06,"C":215.697},"3,cis-6-dimethylcyclohexene":{"A":6.84934,"B":1352.06,"C":215.697},"3,trans-6-dimethylcyclohexene":{"A":6.8769,"B":1352.06,"C":215.697},"4,4-dimethylcyclohexene":{"A":6.89181,"B":1339.53,"C":216.724},"4,cis-5-dimethylcyclohexene":{"A":6.87521,"B":1368.19,"C":214.716},"4,trans-5-dimethylcyclohexene":{"A":6.8769,"B":1352.06,"C":215.697},"1,1-dimethylcyclopentane":{"A":7.04515,"B":1331.61,"C":231.916},"cis-1,2-dimethylcyclopentane":{"A":7.03128,"B":1366.11,"C":229.616},"trans-1,2-dimethylcyclopentane":{"A":7.07143,"B":1368.89,"C":234.786},"cis-1,3-dimethylcyclopentane":{"A":7.14306,"B":1421.81,"C":242.813},"trans-1,3-dimethylcyclopentane":{"A":7.07206,"B":1369.35,"C":234.986},"1,2-dimethylcyclopentene":{"A":6.88821,"B":1301.19,"C":218.898},"1,3-dimethylcyclopentene":{"A":6.89333,"B":1258,"C":221.52},"1,4-dimethylcyclopentene":{"A":6.89286,"B":1261.76,"C":221.292},"1,5-dimethylcyclopentene":{"A":6.88958,"B":1289.3,"C":219.62},"3,3-dimethylcyclopentene":{"A":6.90975,"B":1250.1,"C":222.28},"3,cis-4-dimethylcyclopentene":{"A":6.89356,"B":1256.13,"C":221.634},"3,cis-5-dimethylcyclopentene":{"A":6.89356,"B":1256.13,"C":221.634},"3,trans-5-dimethylcyclopentene":{"A":6.89356,"B":1256.13,"C":221.634},"4,4-dimethylcyclopentene":{"A":6.90975,"B":1250.1,"C":222.28},"1,1-dimethylcyclopropane":{"A":6.94274,"B":1038.68,"C":235.08},"1,cis-2-dimethylcyclopropane":{"A":6.92537,"B":1087.96,"C":231.964},"1,trans-2-dimethylcyclopropane":{"A":6.93009,"B":1060.31,"C":233.64},"3,trans-4-dimethylcyclopentene":{"A":6.89356,"B":1256.13,"C":221.634},"2,2-dimethyldecane":{"A":6.92696,"B":1549.01,"C":181.835},"2,3-dimethyldecane":{"A":6.98981,"B":1593.62,"C":181.835},"2,4-dimethyldecane":{"A":6.98128,"B":1565.7,"C":181.835},"2,5-dimethyldecane":{"A":6.97839,"B":1556.4,"C":181.835},"2,6-dimethyldecane":{"A":6.97839,"B":1556.4,"C":181.835},"2,7-dimethyldecane":{"A":6.98415,"B":1575,"C":181.835},"2,8-dimethyldecane":{"A":6.98699,"B":1584.31,"C":181.835},"2,9-dimethyldecane":{"A":6.98699,"B":1584.31,"C":181.835},"3,3-dimethyldecane":{"A":6.92976,"B":1558.18,"C":181.835},"3,4-dimethyldecane":{"A":6.98841,"B":1588.96,"C":181.835},"3,5-dimethyldecane":{"A":6.98128,"B":1565.7,"C":181.835},"3,6-dimethyldecane":{"A":6.98272,"B":1570.35,"C":181.835},"3,7-dimethyldecane":{"A":6.98415,"B":1575,"C":181.835},"3,8-dimethyldecane":{"A":6.98841,"B":1588.96,"C":181.835},"4,4-dimethyldecane":{"A":6.92413,"B":1539.84,"C":181.835},"4,5-dimethyldecane":{"A":6.98415,"B":1575,"C":181.835},"4,6-dimethyldecane":{"A":6.97839,"B":1556.4,"C":181.835},"4,7-dimethyldecane":{"A":6.97984,"B":1561.05,"C":181.835},"5,5-dimethyldecane":{"A":6.92129,"B":1530.67,"C":181.835},"5,6-dimethyldecane":{"A":6.98272,"B":1570.35,"C":181.835},"dimethyldecylamine":{"A":6.91902,"B":1605.51,"C":162.58},"2',3'-dimethyldiphenylmethane":{"A":7.23532,"B":2088.29,"C":182.57},"2',4'-dimethyldiphenylmethane":{"A":7.23552,"B":2084.86,"C":182.76},"2',5'-dimethyldiphenylmethane":{"A":7.23571,"B":2081.43,"C":182.95},"2',6'-dimethyldiphenylmethane":{"A":7.23532,"B":2088.29,"C":182.57},"3',4'-dimethyldiphenylmethane":{"A":7.23513,"B":2091.73,"C":182.38},"3',5'-dimethyldiphenylmethane":{"A":7.23591,"B":2077.99,"C":183.14},"2',2\"-dimethyldiphenylmethane":{"A":7.23532,"B":2088.29,"C":182.57},"2',3\"-dimethyldiphenylmethane":{"A":7.23571,"B":2081.43,"C":182.95},"2',4\"-dimethyldiphenylmethane":{"A":7.23513,"B":2091.73,"C":182.38},"3',3\"-dimethyldiphenylmethane":{"A":7.23591,"B":2077.99,"C":183.14},"3',4\"-dimethyldiphenylmethane":{"A":7.23532,"B":2088.29,"C":182.57},"4',4\"-dimethyldiphenylmethane":{"A":7.23475,"B":2098.6,"C":182},"dimethyl disulfide":{"A":7.25695,"B":1502.73,"C":233.641},"dimethyldocosylamine":{"A":6.81139,"B":1978.56,"C":103.376},"2,2-dimethyldodecane":{"A":6.95703,"B":1661.96,"C":167.72},"2,3-dimethyldodecane":{"A":7.01979,"B":1716.52,"C":167.72},"2,4-dimethyldodecane":{"A":7.00053,"B":1654.97,"C":167.72},"dimethyldodecylamine":{"A":6.93878,"B":1699.65,"C":147.842},"dimethyldotriacontylamine":{"A":8.93207,"B":4587.76,"C":273.15},"dimethyleicosylamine":{"A":6.7246,"B":1737.14,"C":72.9335},"dimethylethanolamine":{"A":7.83644,"B":1693.76,"C":207.786},"dimethyl ether":{"A":7.19658,"B":984.579,"C":252.976},"dimethylethylamine":{"A":6.35036,"B":808.052,"C":195.899},"2,3-dimethylfuran":{"A":7.05959,"B":1272.44,"C":210},"2,4-dimethylfuran":{"A":7.06031,"B":1274.75,"C":210},"2,5-dimethylfuran":{"A":7.05741,"B":1265.51,"C":210},"3,4-dimethylfuran":{"A":7.03543,"B":1198.69,"C":210},"dimethylheneicosylamine":{"A":6.57059,"B":1640.53,"C":54.6148},"dimethylhentriacontylamine":{"A":9.09343,"B":4660.39,"C":273.15},"dimethylheptacosylamine":{"A":6.06296,"B":1450,"C":9.66667},"2,2-dimethylheptadecane":{"A":6.96397,"B":1864.37,"C":137.6},"2,3-dimethylheptadecane":{"A":7.01361,"B":1920.1,"C":137.6},"2,4-dimethylheptadecane":{"A":6.98404,"B":1828.4,"C":137.6},"dimethylheptadecylamine":{"A":6.92968,"B":1866.1,"C":116.896},"2,2-dimethylheptane":{"A":7.09917,"B":1506.94,"C":224.544},"2,3-dimethylheptane":{"A":7.05755,"B":1497.89,"C":218.116},"2,4-dimethylheptane":{"A":7.01462,"B":1433.82,"C":213.953},"2,5-dimethylheptane":{"A":7.03511,"B":1458.75,"C":215.134},"2,6-dimethylheptane":{"A":7.09083,"B":1512.02,"C":223.937},"3,4-dimethylheptane":{"A":7.06512,"B":1505.63,"C":219.218},"3,5-dimethylheptane":{"A":7.03209,"B":1459.3,"C":215.521},"4,4-dimethylheptane":{"A":7.0273,"B":1471.25,"C":219.607},"dimethylheptatriacontylamine":{"A":9.11753,"B":4934.18,"C":273.15},"dimethylheptylamine":{"A":6.75468,"B":1328.99,"C":171.066},"dimethylhexacosylamine":{"A":6.01047,"B":1400,"C":9.33333},"2,2-dimethylhexadecane":{"A":6.97664,"B":1836.16,"C":143.3},"2,3-dimethylhexadecane":{"A":7.03013,"B":1893.34,"C":143.3},"2,4-dimethylhexadecane":{"A":7.00229,"B":1806.44,"C":143.3},"dimethylhexadecylamine":{"A":6.83575,"B":1740.69,"C":110.132},"2,2-dimethylhexane":{"A":7.05852,"B":1411.47,"C":231.017},"2,3-dimethylhexane":{"A":7.04189,"B":1411.43,"C":223.588},"2,4-dimethylhexane":{"A":7.01809,"B":1378.84,"C":223.843},"2,5-dimethylhexane":{"A":7.05401,"B":1400.91,"C":226.581},"3,3-dimethylhexane":{"A":7.06105,"B":1441.06,"C":232.763},"3,4-dimethylhexane":{"A":7.03917,"B":1420.61,"C":223.898},"dimethylhexatriacontylamine":{"A":8.9511,"B":4760.01,"C":273.15},"dimethylhexylamine":{"A":6.63591,"B":1202.55,"C":175.246},"dimethylisobutylamine":{"A":6.82409,"B":1074.57,"C":191.507},"dimethylisopropylamine":{"A":6.78089,"B":1012.6,"C":193.635},"dimethyl maleate":{"A":7.53524,"B":1922.72,"C":208.096},"1,2-dimethylnaphthalene":{"A":7.15048,"B":1913.6,"C":181.875},"1,3-dimethylnaphthalene":{"A":7.47479,"B":2292.97,"C":233.915},"1,4-dimethylnaphthalene":{"A":7.56895,"B":2419.97,"C":248.881},"1,5-dimethylnaphthalene":{"A":7.22357,"B":1992.38,"C":193.773},"1,6-dimethylnaphthalene":{"A":7.38014,"B":2168.76,"C":219.008},"1,7-dimethylnaphthalene":{"A":6.97776,"B":1712.3,"C":154.935},"1,8-dimethylnaphthalene":{"A":7.09895,"B":1930.64,"C":187.7},"2,3-dimethylnaphthalene":{"A":7.22831,"B":2008.97,"C":194.088},"2,6-dimethylnaphthalene":{"A":7.26313,"B":2046.22,"C":204.926},"2,7-dimethylnaphthalene":{"A":7.27802,"B":2063.76,"C":206.334},"dimethylnonacosylamine":{"A":8.91651,"B":4437.14,"C":273.15},"dimethylnonadecylamine":{"A":6.71797,"B":1671.91,"C":67.7167},"2,2-dimethylnonane":{"A":6.89899,"B":1477.48,"C":187.7},"2,3-dimethylnonane":{"A":6.96413,"B":1525.94,"C":187.7},"2,4-dimethylnonane":{"A":6.95279,"B":1489.12,"C":187.7},"2,5-dimethylnonane":{"A":6.95423,"B":1493.72,"C":187.7},"2,6-dimethylnonane":{"A":6.95423,"B":1493.72,"C":187.7},"2,7-dimethylnonane":{"A":6.95567,"B":1498.32,"C":187.7},"2,8-dimethylnonane":{"A":6.95993,"B":1512.13,"C":187.7},"3,3-dimethylnonane":{"A":6.90178,"B":1486.55,"C":187.7},"3,4-dimethylnonane":{"A":6.96274,"B":1521.33,"C":187.7},"3,5-dimethylnonane":{"A":6.95567,"B":1498.32,"C":187.7},"3,6-dimethylnonane":{"A":6.95851,"B":1507.53,"C":187.7},"3,7-dimethylnonane":{"A":6.96134,"B":1516.73,"C":187.7},"4,4-dimethylnonane":{"A":6.89618,"B":1468.42,"C":187.7},"4,5-dimethylnonane":{"A":6.95851,"B":1507.53,"C":187.7},"4,6-dimethylnonane":{"A":6.95423,"B":1493.72,"C":187.7},"5,5-dimethylnonane":{"A":6.89476,"B":1463.89,"C":187.7},"dimethylnonylamine":{"A":6.79505,"B":1462.35,"C":158.599},"dimethyloctacosylamine":{"A":8.47227,"B":4065.83,"C":273.15},"2,2-dimethyloctadecane":{"A":6.94364,"B":1889.62,"C":132.1},"2,3-dimethyloctadecane":{"A":6.98896,"B":1943.57,"C":132.1},"2,4-dimethyloctadecane":{"A":6.95782,"B":1847.29,"C":132.1},"dimethyloctadecylamine":{"A":6.89407,"B":1867.43,"C":109.314},"2,2-dimethyloctane":{"A":7.12586,"B":1602.06,"C":220.495},"2,3-dimethyloctane":{"A":7.06006,"B":1565.51,"C":210.271},"2,4-dimethyloctane":{"A":7.02287,"B":1501.25,"C":206.532},"2,5-dimethyloctane":{"A":7.05764,"B":1538.09,"C":209.733},"2,6-dimethyloctane":{"A":7.16267,"B":1617.87,"C":217.454},"2,7-dimethyloctane":{"A":7.02337,"B":1511.62,"C":205.021},"3,3-dimethyloctane":{"A":7.03178,"B":1546.95,"C":211.461},"3,4-dimethyloctane":{"A":7.06886,"B":1571.95,"C":211.933},"3,5-dimethyloctane":{"A":7.06509,"B":1552.38,"C":211.593},"3,6-dimethyloctane":{"A":7.04102,"B":1535.7,"C":208.331},"4,4-dimethyloctane":{"A":7.02474,"B":1530.76,"C":211.888},"4,5-dimethyloctane":{"A":7.07898,"B":1576.63,"C":213.413},"dimethyloctatriacontylamine":{"A":8.94928,"B":4837.48,"C":273.15},"dimethyloctylamine":{"A":6.73915,"B":1382.38,"C":167.285},"dimethylpentacosylamine":{"A":5.96301,"B":1350,"C":9},"2,2-dimethylpentadecane":{"A":6.98123,"B":1800.9,"C":149.2},"2,3-dimethylpentadecane":{"A":7.0381,"B":1859.14,"C":149.2},"2,4-dimethylpentadecane":{"A":7.01201,"B":1777.24,"C":149.2},"dimethylpentadecylamine":{"A":6.90419,"B":1772.89,"C":123.647},"2,2-dimethylpentane":{"A":7.03664,"B":1321.9,"C":238.893},"2,3-dimethylpentane":{"A":7.05945,"B":1360.19,"C":235.73},"2,4-dimethylpentane":{"A":7.02311,"B":1303.23,"C":234.125},"3,3-dimethylpentane":{"A":7.04247,"B":1359.48,"C":240.607},"dimethylpentatriacontylamine":{"A":8.94756,"B":4720.84,"C":273.15},"dimethylpentylamine":{"A":6.62816,"B":1131.33,"C":179.901},"dimethyl phthalate":{"A":7.70841,"B":2379.23,"C":209.14},"2,2-dimethylpropanal":{"A":7.02634,"B":1198.06,"C":215},"2,2-dimethylpropanenitrile":{"A":6.77837,"B":1126.39,"C":183.4},"2,2-dimethylpropanoic acid":{"A":7.06183,"B":1327.97,"C":153.82},"1,2-dimethylpropyl acetate":{"A":6.90195,"B":1246.39,"C":181.459},"1,1-dimethylpropylamine":{"A":6.89943,"B":1081.94,"C":192.232},"1,2-dimethylpropylamine":{"A":6.91414,"B":1107.93,"C":190.693},"2,2-dimethylpropylamine":{"A":6.89078,"B":1081.29,"C":192.65},"1,1-dimethylpropyl butanoate":{"A":7.7438,"B":1767.64,"C":176.329},"1,2-dimethylpropyl butanoate":{"A":7.674,"B":1748.98,"C":175.379},"2,2-dimethylpropyl butanoate":{"A":7.57011,"B":1700.94,"C":175.569},"1,1-dimethylpropyl formate":{"A":6.78399,"B":1151.82,"C":182.599},"1,2-dimethylpropyl formate":{"A":6.89113,"B":1211.91,"C":182.029},"2,2-dimethylpropyl formate":{"A":6.75419,"B":1159.95,"C":181.649},"1,1-dimethylpropyl propanoate":{"A":7.48169,"B":1579.34,"C":178.989},"1,2-dimethylpropyl propanoate":{"A":7.45104,"B":1576.08,"C":178.229},"2,2-dimethylpropyl propanoate":{"A":7.32142,"B":1520.95,"C":178.229},"2,3-dimethylpyridine":{"A":7.23968,"B":1651.58,"C":217.702},"2,4-dimethylpyridine":{"A":7.21927,"B":1628.65,"C":216.999},"2,5-dimethylpyridine":{"A":7.3137,"B":1689.62,"C":224.157},"2,6-dimethylpyridine":{"A":7.16488,"B":1526.96,"C":212.378},"3,4-dimethylpyridine":{"A":7.21549,"B":1705.32,"C":214.313},"3,5-dimethylpyridine":{"A":7.22532,"B":1685.34,"C":216.024},"2,3-dimethylquinoline":{"A":6.927,"B":1602.97,"C":133.168},"2,4-dimethylquinoline":{"A":7.43865,"B":2150.78,"C":204.676},"2,6-dimethylquinoline":{"A":7.4351,"B":2139.44,"C":204.355},"2,7-dimethylquinoline":{"A":6.95173,"B":1618.3,"C":133.027},"2,8-dimethylquinoline":{"A":7.04778,"B":1658.79,"C":148.081},"3,4-dimethylquinoline":{"A":9.01091,"B":3750.62,"C":320.836},"3,6-dimethylquinoline":{"A":7.04343,"B":1717.58,"C":142.621},"3,7-dimethylquinoline":{"A":7.04323,"B":1720.52,"C":142.348},"3,8-dimethylquinoline":{"A":7.04535,"B":1691.13,"C":145.078},"4,5-dimethylquinoline":{"A":7.04452,"B":1702.44,"C":144.027},"4,6-dimethylquinoline":{"A":7.04302,"B":1723.46,"C":142.075},"4,8-dimethylquinoline":{"A":7.04284,"B":1725.96,"C":141.843},"5,6-dimethylquinoline":{"A":7.04284,"B":1725.96,"C":141.843},"5,7-dimethylquinoline":{"A":7.0426,"B":1729.34,"C":141.529},"6,7-dimethylquinoline":{"A":7.04263,"B":1728.9,"C":141.57},"dimethyl silane":{"A":6.73312,"B":853.361,"C":241.12},"2,3-dimethylstyrene":{"A":7.05759,"B":1649.24,"C":202.44},"3,4-dimethylstyrene":{"A":7.05759,"B":1649.24,"C":202.44},"2,6-dimethylstyrene":{"A":7.05759,"B":1649.24,"C":202.44},"2,4-dimethylstyrene":{"A":7.05759,"B":1649.24,"C":202.44},"3,5-dimethylstyrene":{"A":7.05759,"B":1649.24,"C":202.44},"2,5-dimethylstyrene":{"A":7.05759,"B":1649.24,"C":202.44},"dimethyl sulfate":{"A":6.79362,"B":1496.99,"C":193.786},"dimethyl sulfide":{"A":7.1438,"B":1193.73,"C":242.693},"dimethyl sulfoxide":{"A":7.25197,"B":1733.52,"C":207.58},"dimethyl terephthalate":{"A":8.04387,"B":2819.15,"C":258.023},"dimethyltetracosylamine":{"A":5.91347,"B":1300,"C":8.66667},"2,2-dimethyltetradecane":{"A":6.97298,"B":1753.29,"C":154.45},"2,3-dimethyltetradecane":{"A":7.03275,"B":1812.11,"C":154.45},"2,4-dimethyltetradecane":{"A":7.00828,"B":1735.39,"C":154.45},"dimethyltetradecylamine":{"A":6.87237,"B":1705.74,"C":125.338},"2,2-dimethyltetrahydrofuran":{"A":6.9172,"B":1219.8,"C":210},"2,3-dimethyltetrahydrofuran":{"A":6.90599,"B":1235.13,"C":210},"2,4-dimethyltetrahydrofuran":{"A":6.90702,"B":1238.46,"C":210},"2,5-dimethyltetrahydrofuran":{"A":7.10868,"B":1387.32,"C":235.638},"3,3-dimethyltetrahydrofuran":{"A":6.92651,"B":1250.12,"C":210},"3,4-dimethyltetrahydrofuran":{"A":6.9215,"B":1286.96,"C":210},"dimethyltetratriacontylamine":{"A":8.51303,"B":4343.29,"C":273.15},"2,2-dimethylthiacyclohexane":{"A":6.91349,"B":1466.94,"C":209.735},"2,cis-3-dimethylthiacyclohexane":{"A":6.90019,"B":1446.12,"C":210.667},"2,trans-3-dimethylthiacyclohexane":{"A":6.90019,"B":1446.12,"C":210.667},"2,cis-4-dimethylthiacyclohexane":{"A":6.90019,"B":1446.12,"C":210.667},"2,trans-4-dimethylthiacyclohexane":{"A":6.90019,"B":1446.12,"C":210.667},"2,cis-5-dimethylthiacyclohexane":{"A":6.90019,"B":1446.12,"C":210.667},"2,trans-5-dimethylthiacyclohexane":{"A":6.90019,"B":1446.12,"C":210.667},"2,cis-6-dimethylthiacyclohexane":{"A":6.90019,"B":1446.12,"C":210.667},"2,trans-6-dimethylthiacyclohexane":{"A":6.90019,"B":1446.12,"C":210.667},"3,3-dimethylthiacyclohexane":{"A":6.91349,"B":1466.94,"C":209.735},"3,cis-4-dimethylthiacyclohexane":{"A":6.90019,"B":1446.12,"C":210.667},"3,trans-4-dimethylthiacyclohexane":{"A":6.90019,"B":1446.12,"C":210.667},"3,cis-5-dimethylthiacyclohexane":{"A":6.90019,"B":1446.12,"C":210.667},"3,trans-5-dimethylthiacyclohexane":{"A":6.90019,"B":1446.12,"C":210.667},"4,4-dimethylthiacyclohexane":{"A":6.91349,"B":1466.94,"C":209.735},"2,2-dimethylthiacyclopentane":{"A":6.93062,"B":1384.11,"C":214.893},"2,cis-3-dimethylthiacyclopentane":{"A":6.91551,"B":1362.9,"C":215.826},"2,trans-3-dimethylthiacyclopentane":{"A":6.91551,"B":1362.9,"C":215.826},"2,cis-4-dimethylthiacyclopentane":{"A":6.91551,"B":1362.9,"C":215.826},"2,trans-4-dimethylthiacyclopentane":{"A":6.91551,"B":1362.9,"C":215.826},"2,cis-5-dimethylthiacyclopentane":{"A":6.89354,"B":1413.37,"C":209.691},"2,trans-5-dimethylthiacyclopentane":{"A":6.92344,"B":1439.4,"C":214.056},"3,3-dimethylthiacyclopentane":{"A":6.93062,"B":1384.11,"C":214.893},"3,cis-4-dimethylthiacyclopentane":{"A":6.91551,"B":1362.9,"C":215.826},"3,trans-4-dimethylthiacyclopentane":{"A":6.91551,"B":1362.9,"C":215.826},"2,2-dimethylthiacyclopropane":{"A":6.96935,"B":1261.97,"C":222.66},"2,cis-3-dimethylthiacyclopropane":{"A":6.95531,"B":1197.14,"C":226.143},"2,trans-3-dimethylthiacyclopropane":{"A":6.95531,"B":1197.14,"C":226.143},"2,3-dimethylthiophene":{"A":7.05405,"B":1476.06,"C":212.096},"2,4-dimethylthiophene":{"A":7.05341,"B":1472.79,"C":212.267},"2,5-dimethylthiophene":{"A":7.05552,"B":1460.01,"C":213.027},"3,4-dimethylthiophene":{"A":7.05425,"B":1487.62,"C":211.45},"2,3-dimethylthiophenol":{"A":7.15604,"B":1770.81,"C":197.903},"2,4-dimethylthiophenol":{"A":7.15803,"B":1742.88,"C":199.48},"2,5-dimethylthiophenol":{"A":7.15877,"B":1732.79,"C":200.05},"2,6-dimethylthiophenol":{"A":7.15604,"B":1770.81,"C":197.903},"3,4-dimethylthiophenol":{"A":7.15604,"B":1770.81,"C":197.903},"3,5-dimethylthiophenol":{"A":7.15604,"B":1770.81,"C":197.903},"dimethyltriacontylamine":{"A":8.91994,"B":4487.97,"C":273.15},"dimethyltricosylamine":{"A":6.21713,"B":1413.12,"C":13.5588},"2,2-dimethyltridecane":{"A":6.96928,"B":1710.53,"C":161.38},"2,3-dimethyltridecane":{"A":7.0315,"B":1769.77,"C":161.38},"2,4-dimethyltridecane":{"A":7.01049,"B":1703,"C":161.38},"dimethyltridecylamine":{"A":6.95521,"B":1753.18,"C":143.292},"dimethyltritriacontylamine":{"A":8.93561,"B":4632.83,"C":273.15},"2,2-dimethylundecane":{"A":6.93972,"B":1604.16,"C":174.22},"2,3-dimethylundecane":{"A":7.00409,"B":1658.46,"C":174.22},"2,4-dimethylundecane":{"A":6.98655,"B":1602.14,"C":174.22},"dimethylundecylamine":{"A":6.87187,"B":1600.97,"C":148.14},"2,6-dimethyt-2-octanol":{"A":8.40589,"B":2678.83,"C":273},"m-dinitrobenzene":{"A":7.67726,"B":2265.85,"C":172.552},"p-dinitrobenzene":{"A":7.626,"B":2196.41,"C":164.021},"2,4-dinitrotoluene":{"A":8.78892,"B":3801.17,"C":326.531},"2,5-dinitrotoluene":{"A":7.75934,"B":2401.34,"C":175.376},"2,6-dinitrotoluene":{"A":7.8446,"B":2316.41,"C":181.812},"3,4-dinitrotoluene":{"A":7.76013,"B":2488.08,"C":173.075},"3,5-dinitrotoluene":{"A":8.23258,"B":3032.95,"C":251.868},"dinonadecylamine":{"A":8.94347,"B":4772.22,"C":273.15},"dinonylamine":{"A":7.79218,"B":2571.72,"C":189.626},"dinonyl disulfide":{"A":7.45129,"B":2406.77,"C":157.581},"dinonyl ether":{"A":7.78823,"B":2439.4,"C":179.235},"dinonylphenol":{"A":7.94799,"B":3040.36,"C":151.16},"dinonyl sulfide":{"A":7.13143,"B":2069.41,"C":135},"dioctadecylamine":{"A":8.93168,"B":4684.28,"C":273.15},"dioctylamine":{"A":7.64892,"B":2327.91,"C":186.226},"dioctyl disulfide":{"A":7.57974,"B":2466.8,"C":178.96},"dioctyl ether":{"A":7.71618,"B":2276.42,"C":184.286},"dioctyl phthalate":{"A":7.77433,"B":2614.83,"C":150.346},"dioctyl sulfide":{"A":7.22342,"B":2014.32,"C":140},"1,4-dioxane":{"A":7.29909,"B":1485.85,"C":234.976},"dipentadecylamine":{"A":8.90295,"B":4397.06,"C":273.15},"dipentylamine":{"A":7.14957,"B":1585.69,"C":168.463},"dipentyl disulfide":{"A":7.51339,"B":2180.25,"C":206.724},"dipentyl sulfide":{"A":7.16824,"B":1809.06,"C":195.094},"1,1-diphenyl-1-butene":{"A":7.20804,"B":2067.15,"C":183.007},"1,1-diphenyl-1-decene":{"A":7.41598,"B":2487.18,"C":166.421},"1,1-diphenyl-1-dodecene":{"A":7.44141,"B":2582.4,"C":162.241},"1,1-diphenyl-1-heptene":{"A":7.32733,"B":2287.29,"C":174.401},"1,1-diphenyl-1-hexadecene":{"A":7.36385,"B":2669.2,"C":155.401},"1,1-diphenyl-1-hexene":{"A":7.28999,"B":2203.08,"C":177.859},"1,1-diphenyl-1-nonene":{"A":7.39183,"B":2426.44,"C":168.891},"1,1-diphenyl-1-octene":{"A":7.36167,"B":2363.02,"C":171.361},"1,1-diphenyl-1-pentadecene":{"A":7.40205,"B":2662.65,"C":156.921},"1,1-diphenyl-1-pentene":{"A":7.24948,"B":2136.7,"C":180.336},"1,1-diphenyl-1-propene":{"A":7.1649,"B":2026.76,"C":184.09},"1,1-diphenyl-1-tetradecene":{"A":7.42714,"B":2644.29,"C":158.631},"1,1-diphenyl-1-tridecene":{"A":7.43985,"B":2618.44,"C":160.341},"1,1-diphenyl-1-undecene":{"A":7.43307,"B":2537.11,"C":164.331},"diphenylacetylene":{"A":7.13222,"B":2112.56,"C":197.057},"diphenylamine":{"A":7.52551,"B":2362.64,"C":206.676},"1,1-diphenylbutane":{"A":7.0577,"B":1960.11,"C":184.985},"1,1-diphenyldecane":{"A":7.35095,"B":2375.48,"C":170.411},"1,1-diphenyldodecane":{"A":7.56469,"B":2583.91,"C":165.661},"1,1-diphenylethane":{"A":7.26963,"B":2097.99,"C":205.4},"1,2-diphenylethane":{"A":7.29419,"B":2111.24,"C":197.874},"1,1-diphenylethene":{"A":7.13961,"B":1973.74,"C":186.351},"diphenyl ether":{"A":7.50605,"B":2253.82,"C":228.977},"1,1-diphenylheptane":{"A":7.36881,"B":2286.82,"C":175.541},"1,1-diphenylhexadecane":{"A":7.734,"B":2803.11,"C":159.581},"1,1-diphenylhexane":{"A":7.32681,"B":2218.71,"C":178.005},"diphenylmethane":{"A":7.26088,"B":2020.65,"C":197.058},"diphenylmethane-4,4'-diisocyanate":{"A":7.74262,"B":2435.36,"C":165.068},"1,1-diphenylnonane":{"A":7.44432,"B":2410.31,"C":171.171},"1,1-diphenyloctane":{"A":7.409,"B":2351.31,"C":173.261},"1,1-diphenylpentadecane":{"A":7.68144,"B":2745.53,"C":160.911},"1,1-diphenylpentane":{"A":7.28572,"B":2151.32,"C":180.501},"1,1-diphenylpropane":{"A":7.20387,"B":2024.96,"C":185.189},"1,2-diphenylpropane":{"A":7.19816,"B":2023.82,"C":185.105},"1,3-diphenylpropane":{"A":7.25174,"B":2102.19,"C":182.247},"2,2-diphenylpropane":{"A":7.08107,"B":1960.53,"C":185.574},"1,1-diphenyltetradecane":{"A":7.64124,"B":2691.69,"C":162.431},"1,3-diphenyltriazene":{"A":7.46274,"B":2336.42,"C":173.072},"1,1-diphenyltridecane":{"A":7.60715,"B":2641.79,"C":163.951},"1,1-diphenylundecane":{"A":7.52636,"B":2528.9,"C":167.371},"dipropyl disulfide":{"A":6.86706,"B":1478.81,"C":179.478},"dipropylene glycol":{"A":9.91532,"B":3715.61,"C":296.398},"dipropyl ether":{"A":7.1768,"B":1378.14,"C":231.157},"dipropyl sulfide":{"A":7.23226,"B":1610.82,"C":227.33},"dipropyl sulfone":{"A":7.47607,"B":2113.1,"C":189.993},"ditetradecylamine":{"A":5.99654,"B":1400,"C":9.33333},"ditridecylamine":{"A":5.89939,"B":1300,"C":8.66667},"diundecylamine":{"A":6.76733,"B":1784.19,"C":77.0727},"m-divinylbenzene":{"A":7.25031,"B":1855.2,"C":225.079},"divinyl ether":{"A":7.18155,"B":1146.68,"C":238.323},"DL-2,3 -dimethyl-1,4-butanediol":{"A":9.53875,"B":3307.6,"C":273},"DL-2,3-butanediol":{"A":9.26941,"B":2777.13,"C":254.001},"DL-2,3-dibromobutane":{"A":7.0094,"B":1348.9,"C":166.223},"DL-2,3-dichlorobutane":{"A":6.67862,"B":1126.98,"C":177.244},"DL-2,4-dimethyl-1,5-pentanediol":{"A":9.56529,"B":3396.12,"C":273},"DL-2,4-pentanediol":{"A":9.50761,"B":3141.1,"C":273},"DL-erythro-2,3-pentanediol":{"A":9.50761,"B":3146.74,"C":273},"DL-erythro-4-methyl-2,3-pentanediol":{"A":9.46086,"B":3418.8,"C":273},"DL-threo-2,3-pentanediol":{"A":9.50761,"B":3146.74,"C":273},"DL-threo-4-methyl-2,3-pentanediol":{"A":9.46086,"B":3418.8,"C":273},"docosane":{"A":7.0838,"B":2054,"C":120.1},"1-docosene":{"A":6.89383,"B":1920.69,"C":111.616},"docosylamine":{"A":7.01933,"B":2108.85,"C":102.568},"docosylbenzene":{"A":6.49315,"B":1771.43,"C":52.3836},"docosylcyclohexane":{"A":6.34928,"B":1692.15,"C":46.8678},"docosylcyclopentane":{"A":6.68673,"B":2017.04,"C":99.9764},"1-docosyne":{"A":8.22013,"B":3616.74,"C":311.379},"dodecanal":{"A":7.70673,"B":2201.53,"C":206.189},"dodecane":{"A":7.22883,"B":1807.47,"C":199.381},"1,2-dodecanediol":{"A":9.592,"B":3899.21,"C":273.001},"1,3-dodecanediol":{"A":9.59203,"B":3973.04,"C":273.001},"1,4-dodecanediol":{"A":9.59208,"B":4114.01,"C":273.001},"1,12-dodecanediol":{"A":9.63162,"B":4050.49,"C":273.001},"dodecanenitrile":{"A":7.25091,"B":1883.87,"C":154.081},"1-dodecanethiol":{"A":7.62037,"B":2309.1,"C":212.597},"2-dodecanethiol":{"A":7.08349,"B":1804.21,"C":164.1},"dodecanoic acid":{"A":7.70218,"B":2158.17,"C":148.926},"1-dodecanol":{"A":6.88921,"B":1589.5,"C":134.693},"2-dodecanol":{"A":6.83609,"B":1455.54,"C":116},"2-dodecanone":{"A":7.3123,"B":1852.68,"C":171.372},"1-dodecene":{"A":7.25069,"B":1817.08,"C":202.471},"dodecyl acetate":{"A":6.14197,"B":1091.05,"C":69.5593},"dodecylamine":{"A":7.90516,"B":2434.67,"C":225.374},"dodecylbenzene":{"A":7.50144,"B":2304.19,"C":171.065},"dodecyl butanoate":{"A":5.12874,"B":800,"C":5.33333},"dodecylcyclohexane":{"A":7.15507,"B":2073.96,"C":157.512},"dodecylcyclopentane":{"A":7.15194,"B":2004.09,"C":158.308},"1-dodecylcyclopentene":{"A":7.31581,"B":2130.48,"C":182.38},"dodecyl formate":{"A":7.37325,"B":1961.4,"C":155.391},"1-dodecylnaphthalene":{"A":7.50542,"B":2614.89,"C":162.431},"2-dodecylnaphthalene":{"A":7.50445,"B":2636.82,"C":161.291},"dodecyl propanoate":{"A":8.00439,"B":2455.63,"C":151.61},"1-dodecyne":{"A":7.16571,"B":1769.54,"C":197.96},"2-dodecyne":{"A":7.18385,"B":1848.7,"C":203.627},"3-dodecyne":{"A":7.19497,"B":1835.75,"C":206.118},"n-dohexacontane":{"A":7.21101,"B":2620.2,"C":-22.9},"dotriacontane":{"A":7.1439,"B":2296.1,"C":71.6},"1-dotriacontene":{"A":6.24451,"B":1600,"C":10.6667},"dotriacontylamine":{"A":8.72949,"B":4539.45,"C":273.15},"dotriacontylbenzene":{"A":6.51602,"B":1900,"C":12.6667},"dotriacontylcyclohexane":{"A":6.48157,"B":1900,"C":12.6667},"dotriacontylcyclopentane":{"A":5.58191,"B":1649.42,"C":103.651},"1-dotriacontyne":{"A":6.02721,"B":1895.03,"C":139.286},"eicosanal":{"A":7.28186,"B":2184.32,"C":135.318},"eicosane":{"A":7.27683,"B":2208.52,"C":158.612},"1,2-eicosanediol":{"A":8.60182,"B":3964.66,"C":273.001},"1,3-eicosanediol":{"A":8.60183,"B":4027.6,"C":273.001},"1,4-eicosanediol":{"A":8.60186,"B":4147.77,"C":273.001},"1,20-eicosanediol":{"A":8.57105,"B":4051.45,"C":273.001},"eicosanenitrile":{"A":7.2474,"B":2281.12,"C":136.404},"1-eicosanethiol":{"A":7.14758,"B":2154.87,"C":122.026},"2-eicosanethiol":{"A":7.12936,"B":2111.53,"C":119.001},"eicosanoic acid":{"A":7.39566,"B":2344.88,"C":122.37},"1-eicosanol":{"A":7.04203,"B":1914.84,"C":104.163},"2-eicosanol":{"A":6.94626,"B":1772.54,"C":70.0004},"2-eicosanone":{"A":8.17892,"B":3310.53,"C":273.001},"1-eicosene":{"A":7.45581,"B":2299.83,"C":160.304},"eicosyl acetate":{"A":7.64398,"B":2700,"C":190},"eicosylamine":{"A":7.75427,"B":2708.23,"C":172.711},"eicosylbenzene":{"A":6.78,"B":1957.42,"C":82.0069},"eicosyl butanoate":{"A":5.09651,"B":1200,"C":8},"eicosylcyclohexane":{"A":6.6272,"B":1864.06,"C":75.5616},"eicosylcyclopentane":{"A":6.83951,"B":2042.36,"C":105.916},"eicosyl formate":{"A":9.14753,"B":4100,"C":190},"eicosyl propanoate":{"A":8.58931,"B":4000,"C":190},"1-eicosyne":{"A":7.86389,"B":2948.04,"C":251.6},"2-eicosyne":{"A":7.96194,"B":3159.45,"C":269.801},"3-eicosyne":{"A":7.62458,"B":2607.92,"C":219.757},"alpha-epichlorohydrin":{"A":7.10839,"B":1408.87,"C":217.147},"1,2-epoxybutane":{"A":7.19535,"B":1337.15,"C":246.496},"epsilon-caprolactam":{"A":7.49418,"B":2131.64,"C":192.056},"epsilon-caprolactone":{"A":7.83109,"B":2521.98,"C":268.612},"erythro-4,4-dimethyl-2,3-pentanediol":{"A":9.33007,"B":3480.41,"C":273},"ethane":{"A":6.95335,"B":699.106,"C":260.264},"4-ethenyl-1,2-dimethylbenzene":{"A":7.05759,"B":1649.24,"C":202.44},"2-ethenyl-1,3-dimethylbenzene":{"A":7.05759,"B":1649.24,"C":202.44},"2-ethenyl-1,4-dimethylbenzene":{"A":7.05743,"B":1651.24,"C":202.325},"1-ethenyl-2,4-dimethylbenzene":{"A":7.0551,"B":1681.03,"C":200.599},"1-ethenyl-3,5-dimethylbenzene":{"A":7.05759,"B":1649.24,"C":202.44},"2-ethoxyethanol":{"A":8.17206,"B":1925.93,"C":228.985},"2-(2-ethoxyethoxy)ethanol":{"A":8.33772,"B":2276.2,"C":215.123},"2-ethoxyethyl acetate":{"A":7.3211,"B":1640.21,"C":213.092},"1-ethyl,cis-decahydronaphthalene":{"A":6.94771,"B":1828.48,"C":189.6},"2-ethyl-(1-thiaethyl)-benzene":{"A":7.17207,"B":1818.12,"C":195.68},"3-ethyl-(1-thiaethyl)-benzene":{"A":7.17101,"B":1833.69,"C":194.804},"4-ethyl-(1-thiaethyl)-benzene":{"A":7.17101,"B":1833.69,"C":194.804},"2-ethyl-1,2-butanediol":{"A":9.45075,"B":3107.58,"C":273},"2-ethyl-1,3-butadiene":{"A":6.91354,"B":1208.81,"C":224.75},"2-ethyl-1,3-butanediol":{"A":9.53869,"B":3194.79,"C":273},"2-ethyl-1,3-pentanediol":{"A":9.55208,"B":3319.56,"C":273},"2-ethyl-1,3-propanediol":{"A":9.49492,"B":3142.03,"C":273},"2-ethyl-1,4-butanediol":{"A":9.53869,"B":3194.79,"C":273},"2-ethyl-1,5-pentanediol":{"A":9.6387,"B":3279.47,"C":273},"2-ethyl-1-butanol":{"A":7.49564,"B":1498.18,"C":178.145},"2-ethyl-1-butene":{"A":6.96578,"B":1233.99,"C":237.411},"2-ethyl-1-heptanol":{"A":8.57327,"B":2685.99,"C":273},"3-ethyl-1-heptanol":{"A":8.5733,"B":2732.39,"C":273},"5-ethyl-1-heptanol":{"A":8.57327,"B":2685.99,"C":273},"2-ethyl-1-hexanol":{"A":7.05552,"B":1461.65,"C":165.52},"3-ethyl-1-hexanol":{"A":8.52318,"B":2555.15,"C":273},"4-ethyl-1-hexanol":{"A":8.52318,"B":2555.15,"C":273},"2-ethyl-1-hexene":{"A":7.29597,"B":1581.28,"C":238.147},"3-ethyl-1-hexene":{"A":7.02826,"B":1375.8,"C":221.421},"4-ethyl-1-hexene":{"A":6.93567,"B":1298.39,"C":210.207},"2-ethyl-1-octanol":{"A":8.61878,"B":2764.84,"C":273},"3-ethyl-1-octanol":{"A":8.61878,"B":2764.84,"C":273},"2-ethyl-1-pentanol":{"A":8.34385,"B":2324.35,"C":259.469},"3-ethyl-1-pentanol":{"A":8.47025,"B":2453.76,"C":273},"2-ethyl-1-pentene":{"A":7.01452,"B":1325.43,"C":226.639},"3-ethyl-1-pentene":{"A":7.08935,"B":1346.26,"C":235.778},"3-ethyl-1-pentyne":{"A":6.88599,"B":1207.2,"C":217.409},"3-ethyl-2,2,3-trimethylpentane":{"A":6.99025,"B":1608.63,"C":221.938},"3-ethyl-2,2,4-trimethylpentane":{"A":6.98282,"B":1529.68,"C":217.601},"3-ethyl-2,2-dimethylhexane":{"A":6.99962,"B":1527.84,"C":214.832},"4-ethyl-2,2-dimethylhexane":{"A":6.97668,"B":1468.7,"C":211.571},"3-ethyl-2,3,4-trimethylpentane":{"A":7.02118,"B":1619.09,"C":221.599},"3-ethyl-2,3-dimethylhexane":{"A":7.01446,"B":1569.31,"C":215.933},"4-ethyl-2,3-dimethylhexane":{"A":7.04818,"B":1569.99,"C":215.824},"3-ethyl-2,3-pentanediol":{"A":9.40578,"B":3131.01,"C":273},"3-ethyl-2,4-dimethylhexane":{"A":7.05494,"B":1572.89,"C":216.708},"4-ethyl-2,4-dimethylhexane":{"A":7.11162,"B":1618.74,"C":221.499},"3-ethyl-2,4-pentanediol":{"A":9.49075,"B":3176.08,"C":273},"3-ethyl-2,5-dimethylhexane":{"A":7.03413,"B":1529.46,"C":214.141},"2-ethyl-2-heptanol":{"A":8.42444,"B":2521.52,"C":273},"3-ethyl-2-heptanol":{"A":8.50271,"B":2557.12,"C":273},"3-ethyl-2-hexanol":{"A":8.45078,"B":2456.36,"C":273},"4-ethyl-2-hexanol":{"A":8.45078,"B":2455.52,"C":273},"3-ethyl-cis-2-hexene":{"A":7.05483,"B":1441.41,"C":224.33},"3-ethyl-trans-2-hexene":{"A":7.05483,"B":1441.41,"C":224.33},"4-ethyl-cis-2-hexene":{"A":7.01043,"B":1378.58,"C":220.827},"4-ethyl-trans-2-hexene":{"A":7.01043,"B":1378.58,"C":220.827},"1-ethyl-2-isopropylbenzene":{"A":7.0786,"B":1649.31,"C":202.9},"3-ethyl-2-methylheptane":{"A":7.07029,"B":1568.64,"C":213.214},"4-ethyl-2-methylheptane":{"A":7.0759,"B":1550.6,"C":213.414},"5-ethyl-2-methylheptane":{"A":7.06932,"B":1557.16,"C":212.059},"3-ethyl-2-methylhexane":{"A":7.05625,"B":1490.43,"C":218.943},"4-ethyl-2-methylhexane":{"A":7.04242,"B":1459.93,"C":217},"3-ethyl-2-methylpentane":{"A":7.03756,"B":1416.51,"C":225.113},"3-ethyl-2-pentanol":{"A":8.39655,"B":2344.19,"C":273},"3-ethyl-2-pentanone":{"A":7.72556,"B":1991.19,"C":273},"3-ethyl-2-pentene":{"A":7.00427,"B":1331.43,"C":226.883},"1-ethyl-2-propylbenzene":{"A":7.13109,"B":1714.69,"C":200.43},"3-ethyl-2-thiapentane":{"A":6.99484,"B":1388.02,"C":205.518},"4-ethyl-3,3-dimethylhexane":{"A":7.01947,"B":1571.58,"C":216.822},"3-ethyl-3,4-dimethylhexane":{"A":7.02629,"B":1574.73,"C":217.757},"ethyl-3-ethoxypropionate":{"A":7.44459,"B":1710.72,"C":209.847},"3-ethyl-3-heptanol":{"A":8.42444,"B":2523.46,"C":273},"3-ethyl-3-hexanol":{"A":7.87807,"B":1895.63,"C":220.334},"4-ethyl-3-hexanol":{"A":8.01738,"B":2008.74,"C":227.066},"3-ethyl-3-hexene":{"A":7.03608,"B":1407.08,"C":222.626},"1-ethyl-3-isopropylbenzene":{"A":7.07806,"B":1655.9,"C":202.52},"3-ethyl-3-methylheptane":{"A":7.05165,"B":1581.48,"C":215.366},"4-ethyl-3-methylheptane":{"A":7.09069,"B":1591.99,"C":215.945},"3-ethyl-3-methylhexane":{"A":7.04317,"B":1506.86,"C":221.41},"3-ethyl-3-octanol":{"A":8.47466,"B":2640.3,"C":273},"6-ethyl-3-octanol":{"A":8.55069,"B":2675.34,"C":273},"3-ethyl-3-pentanol":{"A":7.72429,"B":1710.58,"C":210.673},"1-ethyl-3-propylbenzene":{"A":7.13162,"B":1708.02,"C":200.81},"4-ethyl-4-heptanol":{"A":8.42443,"B":2505.72,"C":273},"1-ethyl-4-isopropylbenzene":{"A":7.07683,"B":1671.05,"C":201.646},"3-ethyl-4-isopropylheptane":{"A":6.92356,"B":1523.45,"C":181.835},"4-ethyl-4-isopropylheptane":{"A":6.87515,"B":1525.18,"C":181.835},"3-ethyl-4-methylheptane":{"A":7.08435,"B":1589.61,"C":215.151},"4-ethyl-4-methylheptane":{"A":7.05163,"B":1570.23,"C":215.67},"3-ethyl-4-methylhexane":{"A":7.06079,"B":1504.1,"C":219.425},"3-ethyl-4-octanol":{"A":8.55068,"B":2641.31,"C":273},"4-ethyl-4-octanol":{"A":8.47464,"B":2605.89,"C":273},"1-ethyl-4-propylbenzene":{"A":7.13057,"B":1721.36,"C":200.05},"3-ethyl-4-propylheptane":{"A":6.97547,"B":1547.11,"C":181.835},"4-ethyl-4-propylheptane":{"A":6.92129,"B":1530.67,"C":181.835},"3-ethyl-5-methylheptane":{"A":7.04659,"B":1535.39,"C":210.362},"ethyl-sec-butylamine":{"A":6.94749,"B":1165.73,"C":188.656},"ethyl-tert-butylamine":{"A":6.83428,"B":1070.06,"C":192.663},"4a-ethyl-cis-decahydronaphthalene":{"A":6.95338,"B":1741.96,"C":194.73},"4a-ethyl-trans-decahydronaphthalene":{"A":6.95518,"B":1716.33,"C":196.25},"1-ethyl-trans-decahydronaphthalene":{"A":6.94872,"B":1812.46,"C":190.55},"2-ethyl-trans-decahydronaphthalene":{"A":6.9545,"B":1725.94,"C":195.68},"2-ethyl-cis-decahydronaphthalene":{"A":6.95294,"B":1748.37,"C":194.35},"3-ethyl-o-xylene":{"A":7.10646,"B":1715.42,"C":211.994},"4-ethyl-o-xylene":{"A":7.22714,"B":1764.94,"C":216.296},"2-ethyl-m-xylene":{"A":7.20901,"B":1741.12,"C":212.235},"4-ethyl-m-xylene":{"A":7.30983,"B":1843.95,"C":227.893},"5-ethyl-m-xylene":{"A":7.22685,"B":1748.77,"C":218.603},"2-ethyl-p-xylene":{"A":7.29636,"B":1826.51,"C":226.824},"1-ethyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.11255,"B":1832.57,"C":193.482},"2-ethyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.11188,"B":1842.66,"C":192.906},"ethylacetoacetate":{"A":7.6595,"B":1957.82,"C":228.899},"ethylacetylene":{"A":7.1714,"B":1070.62,"C":241.457},"ethyl acrylate":{"A":7.26219,"B":1428.92,"C":226.634},"ethyl aluminum sesquichloride":{"A":8.00942,"B":1908.3,"C":163.09},"ethylamine":{"A":7.21885,"B":1073.47,"C":230.876},"ethylbenzene":{"A":7.1561,"B":1559.55,"C":228.582},"ethyl benzoate":{"A":7.50855,"B":2047.03,"C":228.94},"2-ethylbiphenyl":{"A":7.21197,"B":1968.23,"C":188.466},"3-ethylbiphenyl":{"A":7.26929,"B":2065.34,"C":184.668},"4-ethylbiphenyl":{"A":7.16265,"B":2004.88,"C":185.23},"2-ethylbutanal":{"A":7.18235,"B":1397.14,"C":208},"2-ethylbutanenitrile":{"A":6.93608,"B":1303.41,"C":176.412},"ethyl butanoate":{"A":7.3746,"B":1613.76,"C":237.608},"ethylbutylamine":{"A":7.00228,"B":1214.51,"C":186.679},"ethyl butyl ether":{"A":7.2167,"B":1400.33,"C":230.763},"ethyl sec-butyl ether":{"A":6.95756,"B":1187.15,"C":210},"ethyl tert-butyl ether":{"A":6.83271,"B":1117.6,"C":210},"ethyl butyl sulfide":{"A":7.16605,"B":1570.05,"C":222.126},"2-ethyl butyric acid":{"A":7.6032,"B":1858.25,"C":199.698},"ethyl chloride":{"A":7.13047,"B":1097.6,"C":246.009},"ethyl chloroformate":{"A":8.05861,"B":1577.17,"C":211.753},"ethyl cyanoacetate":{"A":7.34501,"B":1731.5,"C":181.865},"ethylcyclobutane":{"A":6.96049,"B":1208.34,"C":225.586},"ethylcyclohexane":{"A":6.96671,"B":1473.49,"C":228.828},"1-ethylcyclohexene":{"A":6.93892,"B":1420.19,"C":212.972},"3-ethylcyclohexene":{"A":6.94064,"B":1403.09,"C":213.994},"4-ethylcyclohexene":{"A":6.94019,"B":1407.51,"C":213.73},"ethylcyclopentane":{"A":7.09118,"B":1429.42,"C":236.03},"1-ethylcyclopentene":{"A":6.95572,"B":1324.87,"C":218.797},"3-ethylcyclopentene":{"A":6.95891,"B":1297.63,"C":220.424},"4-ethylcyclopentene":{"A":6.95874,"B":1299.03,"C":220.34},"ethylcyclopropane":{"A":6.98612,"B":1100.65,"C":232.173},"3-ethyldecane":{"A":7.04446,"B":1626.05,"C":181.835},"4-ethyldecane":{"A":7.03774,"B":1603.89,"C":181.835},"5-ethyldecane":{"A":7.03484,"B":1594.46,"C":181.835},"ethyldecylamine":{"A":6.77185,"B":1337.69,"C":102.786},"ethyl decyl sulfide":{"A":7.61843,"B":2223.04,"C":205.383},"2-ethyldiphenylmethane":{"A":7.24487,"B":2071.17,"C":183.737},"3-ethyldiphenylmethane":{"A":7.24473,"B":2073.51,"C":183.608},"4-ethyldiphenylmethane":{"A":7.24366,"B":2092.4,"C":182.565},"ethyldocosylamine":{"A":6.3895,"B":1538.64,"C":33.5243},"ethyldodecylamine":{"A":7.20606,"B":1802.96,"C":140.846},"ethyl dodecyl sulfide":{"A":7.78265,"B":2485.95,"C":211.297},"ethyldotriacontylamine":{"A":8.89717,"B":4597.4,"C":273.15},"ethyleicosylamine":{"A":6.77558,"B":1798.48,"C":77.7688},"ethylene":{"A":6.96636,"B":649.806,"C":262.73},"ethylene carbonate":{"A":7.47542,"B":1944.57,"C":185.23},"ethylenediamine":{"A":7.64595,"B":1600.32,"C":218.58},"ethylene glycol":{"A":9.69941,"B":3147.1,"C":264.246},"ethylene glycol diacetate":{"A":7.03914,"B":1418.58,"C":150.643},"ethylene glycol monopropyl ether":{"A":8.48552,"B":2290.88,"C":257.391},"ethyleneimine":{"A":7.13426,"B":1171.65,"C":219.609},"ethylene oxide":{"A":7.26969,"B":1114.78,"C":243.301},"ethylene sulfide":{"A":7.14085,"B":1244.63,"C":237.244},"ethyl fluoride":{"A":7.24052,"B":957.955,"C":257.429},"ethyl formate":{"A":7.21764,"B":1252.8,"C":234.565},"2-ethylfuran":{"A":7.0667,"B":1266.23,"C":210},"3-ethylfuran":{"A":7.06575,"B":1263.22,"C":210},"ethylheneicosylamine":{"A":6.60351,"B":1688.72,"C":58.6294},"ethylhentriacontylamine":{"A":8.89065,"B":4544.34,"C":273.15},"ethylheptacosylamine":{"A":6.02161,"B":1450,"C":9.66667},"ethylheptadecylamine":{"A":7.86353,"B":2700.14,"C":193.901},"ethyl heptadecyl sulfide":{"A":7.20937,"B":2103.03,"C":124},"3-ethylheptane":{"A":7.21986,"B":1628.26,"C":232.057},"4-ethylheptane":{"A":7.12967,"B":1538.44,"C":220.874},"ethylheptatriacontylamine":{"A":8.91655,"B":4811.39,"C":273.15},"ethylheptylamine":{"A":7.08904,"B":1487.11,"C":172.681},"ethyl heptyl sulfide":{"A":7.15298,"B":1737.33,"C":199.813},"ethylhexacosylamine":{"A":5.97588,"B":1400,"C":9.33333},"ethylhexadecylamine":{"A":7.76234,"B":2550.59,"C":187.499},"ethyl hexadecyl sulfide":{"A":7.13143,"B":2069.41,"C":135},"2-ethylhexanal":{"A":7.35291,"B":1689.29,"C":217.09},"3-ethylhexane":{"A":7.05503,"B":1420.12,"C":221.671},"ethylhexatriacontylamine":{"A":8.93343,"B":4788.53,"C":273.15},"2-ethylhexyl acetate":{"A":7.50916,"B":1918.21,"C":215.849},"2-ethylhexyl acrylate":{"A":7.77677,"B":2222.15,"C":237.874},"ethylhexylamine":{"A":7.04831,"B":1395.85,"C":176.937},"ethyl hexyl sulfide":{"A":7.09805,"B":1717.84,"C":220.489},"ethylidene diacetate":{"A":6.9943,"B":1371.33,"C":164.375},"ethyl iodide":{"A":7.26806,"B":1396.07,"C":245.911},"ethyl isobutanoate":{"A":7.37463,"B":1561.51,"C":237.631},"ethylisobutylamine":{"A":6.94749,"B":1165.73,"C":188.656},"ethyl isobutyl ether":{"A":6.9574,"B":1186.69,"C":210},"ethyl isocyanide":{"A":6.87239,"B":1068.49,"C":189.186},"ethylisopropylamine":{"A":6.93178,"B":1090.83,"C":193.277},"ethyl isopropyl ether":{"A":6.8725,"B":1049.82,"C":210},"ethyl isopropyl ketone":{"A":6.99939,"B":1276.64,"C":196.572},"ethyl isovalerate":{"A":7.23567,"B":1578.65,"C":228.203},"ethyl lactate":{"A":9.09091,"B":2915.95,"C":315.049},"ethyl mercaptan":{"A":7.1629,"B":1202.03,"C":245.711},"ethyl methacrylate":{"A":7.18289,"B":1492.18,"C":229.851},"1-ethylnaphthalene":{"A":7.10905,"B":1937.1,"C":199.804},"2-ethylnaphthalene":{"A":7.2061,"B":2000.9,"C":204.264},"ethyl nitrate":{"A":7.17012,"B":1338.7,"C":224.891},"ethylnonacosylamine":{"A":8.88484,"B":4449.89,"C":273.15},"ethylnonadecylamine":{"A":6.95647,"B":1924.23,"C":99.1269},"3-ethylnonane":{"A":7.01883,"B":1554.65,"C":187.7},"4-ethylnonane":{"A":7.01315,"B":1535.99,"C":187.7},"5-ethylnonane":{"A":7.00737,"B":1517.34,"C":187.7},"ethylnonylamine":{"A":6.60191,"B":1163.38,"C":90.6435},"ethyl nonyl sulfide":{"A":7.09661,"B":1759.04,"C":170.4},"ethyloctacosylamine":{"A":8.89387,"B":4408.47,"C":273.15},"ethyloctadecylamine":{"A":7.98414,"B":2870.99,"C":201.573},"ethyl octadecyl sulfide":{"A":7.18259,"B":2111.53,"C":119.001},"3-ethyloctane":{"A":7.11666,"B":1601.8,"C":211.642},"4-ethyloctane":{"A":7.12109,"B":1599.22,"C":213.5},"ethyloctatriacontylamine":{"A":8.94057,"B":4866.89,"C":273.15},"ethyloctylamine":{"A":7.13621,"B":1578.08,"C":168.843},"ethyl octyl sulfide":{"A":7.16824,"B":1809.06,"C":195.094},"ethylpentacosylamine":{"A":5.92822,"B":1350,"C":9},"ethylpentadecylamine":{"A":7.84024,"B":2589.03,"C":200.042},"ethyl pentadecyl sulfide":{"A":7.25728,"B":2069.41,"C":135},"3-ethylpentane":{"A":7.10931,"B":1402.17,"C":238.129},"ethylpentatriacontylamine":{"A":8.91205,"B":4729.39,"C":273.15},"ethylpentylamine":{"A":7.0104,"B":1303.5,"C":181.649},"ethyl pentyl sulfide":{"A":7.05063,"B":1575.03,"C":210.873},"m-ethylphenol":{"A":6.99776,"B":1542.16,"C":170.08},"p-ethylphenol":{"A":7.49026,"B":1904.24,"C":195.127},"ethyl propanoate":{"A":7.19297,"B":1375.07,"C":219.783},"1-ethylpropyl acetate":{"A":6.95426,"B":1276.08,"C":181.269},"1-ethylpropylamine":{"A":6.95953,"B":1138.07,"C":190.028},"ethylpropylamine":{"A":6.90202,"B":1095.37,"C":192.099},"1-ethylpropyl butanoate":{"A":7.66369,"B":1745.51,"C":174.999},"ethyl propyl ether":{"A":7.11567,"B":1232.15,"C":227.094},"1-ethylpropyl formate":{"A":6.83139,"B":1191.09,"C":180.889},"1-ethylpropyl propanoate":{"A":7.39237,"B":1554.41,"C":177.469},"ethyl propyl sulfide":{"A":7.13461,"B":1466.79,"C":226.32},"2-ethylpyridine":{"A":7.25236,"B":1627.2,"C":222.825},"3-ethylpyridine":{"A":7.45184,"B":1856.94,"C":239.241},"4-ethylpyridine":{"A":7.27374,"B":1741.83,"C":227.308},"3-ethylquinoline":{"A":7.05246,"B":1708.38,"C":143.521},"6-ethylquinoline":{"A":7.05314,"B":1699.1,"C":144.382},"8-ethylquinoline":{"A":7.05463,"B":1678.94,"C":146.255},"m-ethylstyrene":{"A":7.06662,"B":1644.77,"C":202.891},"p-ethylstyrene":{"A":7.06603,"B":1652.17,"C":202.463},"ethyltetracosylamine":{"A":5.87851,"B":1300,"C":8.66667},"ethyltetradecylamine":{"A":7.71755,"B":2419.13,"C":193.157},"ethyl tetradecyl sulfide":{"A":7.22342,"B":2014.32,"C":140},"2-ethyltetrahydrofuran":{"A":6.99081,"B":1311.09,"C":210},"3-ethyltetrahydrofuran":{"A":6.99984,"B":1342.8,"C":210},"ethyltetratriacontylamine":{"A":8.92134,"B":4700.44,"C":273.15},"2-ethylthiacyclohexane":{"A":6.96647,"B":1485.42,"C":209.78},"3-ethylthiacyclohexane":{"A":6.96647,"B":1485.42,"C":209.78},"4-ethylthiacyclohexane":{"A":6.96647,"B":1485.42,"C":209.78},"2-ethylthiacyclopentane":{"A":6.97349,"B":1498.62,"C":209.17},"3-ethylthiacyclopentane":{"A":6.97127,"B":1524.31,"C":207.65},"2-ethylthiacyclopropane":{"A":7.01195,"B":1338.7,"C":219.05},"2-ethylthiophene":{"A":7.05715,"B":1451.45,"C":213.54},"3-ethylthiophene":{"A":7.05608,"B":1457.84,"C":213.16},"m-ethylthiophenol":{"A":7.167,"B":1756.95,"C":198.91},"p-ethylthiophenol":{"A":7.167,"B":1756.95,"C":198.91},"m-ethyltoluene":{"A":7.07202,"B":1610.69,"C":222.972},"p-ethyltoluene":{"A":7.04821,"B":1580.26,"C":217.186},"ethyltriacontylamine":{"A":8.90964,"B":4516.5,"C":273.15},"ethyltricosylamine":{"A":6.19192,"B":1411.68,"C":11.3466},"ethyltridecylamine":{"A":7.42041,"B":2059.21,"C":161.611},"ethyl tridecyl sulfide":{"A":7.22529,"B":1980.43,"C":146},"ethyltritriacontylamine":{"A":8.89,"B":4633.98,"C":273.15},"ethylundecylamine":{"A":6.988,"B":1560.45,"C":120.933},"ethyl undecyl sulfide":{"A":7.13871,"B":1863.9,"C":157.9},"ethyl vanillin":{"A":8.18401,"B":2413.87,"C":161.324},"ethyl vinyl ether":{"A":7.14878,"B":1179.62,"C":240.84},"ethynylbenzene":{"A":6.87809,"B":1377.31,"C":201.512},"fluoranthene":{"A":7.85111,"B":3122.76,"C":245.485},"fluorene":{"A":7.31877,"B":2211.16,"C":200.948},"cis-1-fluoro-1-butene":{"A":6.69721,"B":860.982,"C":204.401},"trans-1-fluoro-1-butene":{"A":6.69721,"B":860.982,"C":204.401},"2-fluoro-1-butene":{"A":6.6633,"B":860.957,"C":203.117},"3-fluoro-1-butene":{"A":6.66211,"B":830.235,"C":206.283},"4-fluoro-1-butene":{"A":6.71801,"B":846.718,"C":206.941},"cis-1-fluoro-1-decene":{"A":6.94912,"B":1369.46,"C":178.137},"trans-1-fluoro-1-decene":{"A":6.94912,"B":1369.46,"C":178.137},"cis-1-fluoro-1-dodecene":{"A":7.03576,"B":1553.76,"C":169.714},"trans-1-fluoro-1-dodecene":{"A":7.03576,"B":1553.76,"C":169.714},"cis-1-fluoro-1-eicosene":{"A":7.1506,"B":2229.84,"C":134.956},"trans-1-fluoro-1-eicosene":{"A":7.1506,"B":2229.84,"C":134.956},"cis-1-fluoro-1-heptadecene":{"A":7.17348,"B":2004.76,"C":148.38},"trans-1-fluoro-1-heptadecene":{"A":7.17348,"B":2004.76,"C":148.38},"cis-1-fluoro-1-heptene":{"A":6.81441,"B":1104.58,"C":190.965},"trans-1-fluoro-1-heptene":{"A":6.81441,"B":1104.58,"C":190.965},"cis-1-fluoro-1-hexadecene":{"A":7.16011,"B":1919.19,"C":152.723},"trans-1-fluoro-1-hexadecene":{"A":7.16011,"B":1919.19,"C":152.723},"cis-1-fluoro-1-hexene":{"A":6.77219,"B":1020.76,"C":195.352},"trans-1-fluoro-1-hexene":{"A":6.77219,"B":1020.76,"C":195.352},"cis-1-fluoro-1-nonadecene":{"A":7.16988,"B":2161.29,"C":139.507},"trans-1-fluoro-1-nonadecene":{"A":7.16988,"B":2161.29,"C":139.507},"cis-1-fluoro-1-nonene":{"A":6.90382,"B":1279.21,"C":182.374},"trans-1-fluoro-1-nonene":{"A":6.90382,"B":1279.21,"C":182.374},"cis-1-fluoro-1-octadecene":{"A":7.17714,"B":2085.86,"C":143.979},"trans-1-fluoro-1-octadecene":{"A":7.17714,"B":2085.86,"C":143.979},"cis-1-fluoro-1-octene":{"A":6.85859,"B":1190.81,"C":186.645},"trans-1-fluoro-1-octene":{"A":6.85859,"B":1190.81,"C":186.645},"cis-1-fluoro-1-pentadecene":{"A":7.13833,"B":1830.29,"C":157.017},"trans-1-fluoro-1-pentadecene":{"A":7.13833,"B":1830.29,"C":157.017},"cis-1-fluoro-1-pentene":{"A":6.73282,"B":939.521,"C":199.824},"trans-1-fluoro-1-pentene":{"A":6.73282,"B":939.521,"C":199.824},"2-fluoro-1-pentene":{"A":6.70493,"B":910.859,"C":201.708},"3-fluoro-1-pentene":{"A":6.69709,"B":907.589,"C":201.66},"4-fluoro-1-pentene":{"A":6.69709,"B":907.589,"C":201.66},"5-fluoro-1-pentene":{"A":6.74026,"B":992.044,"C":195.043},"cis-1-fluoro-1-propene":{"A":6.66628,"B":785.205,"C":209.106},"trans-1-fluoro-1-propene":{"A":6.66628,"B":785.205,"C":209.106},"2-fluoro-1-propene":{"A":6.6505,"B":722.052,"C":215.542},"3-fluoro-1-propene":{"A":6.27804,"B":722.052,"C":215.542},"cis-1-fluoro-1-tetradecene":{"A":7.10946,"B":1739.13,"C":161.273},"trans-1-fluoro-1-tetradecene":{"A":7.10946,"B":1739.13,"C":161.273},"cis-1-fluoro-1-tridecene":{"A":7.07484,"B":1646.66,"C":165.501},"trans-1-fluoro-1-tridecene":{"A":7.07484,"B":1646.66,"C":165.501},"cis-1-fluoro-1-undecene":{"A":6.99347,"B":1461.15,"C":173.922},"trans-1-fluoro-1-undecene":{"A":6.99347,"B":1461.15,"C":173.922},"1-fluoro-2,2-dimethylbutane":{"A":7.01292,"B":1234.88,"C":222},"1-fluoro-2,2-dimethylpropane":{"A":7.11983,"B":1254.75,"C":256},"1-fluoro-2,3-dimethylbutane":{"A":6.90281,"B":1218.67,"C":222},"2-fluoro-2,3-dimethylbutane":{"A":6.88491,"B":1156.58,"C":222},"cis-1-fluoro-2-butene":{"A":6.69721,"B":860.982,"C":204.401},"trans-1-fluoro-2-butene":{"A":6.69721,"B":860.982,"C":204.401},"cis-2-fluoro-2-butene":{"A":6.64591,"B":862.248,"C":202.011},"trans-2-fluoro-2-butene":{"A":6.64591,"B":862.248,"C":202.011},"3-fluoro-2-ethyl-1-propene":{"A":6.70493,"B":910.859,"C":201.708},"1-fluoro-2-ethylbutane":{"A":6.8213,"B":1107.79,"C":222},"cis-1-fluoro-2-methyl-1-butene":{"A":6.68457,"B":924.918,"C":199.199},"trans-1-fluoro-2-methyl-1-butene":{"A":6.68457,"B":924.918,"C":199.199},"3-fluoro-2-methyl-1-butene":{"A":6.64921,"B":893.407,"C":201.039},"4-fluoro-2-methyl-1-butene":{"A":6.70493,"B":910.859,"C":201.708},"1-fluoro-2-methyl-1-propene":{"A":6.64323,"B":874.479,"C":200.575},"3-fluoro-2-methyl-1-propene":{"A":6.65918,"B":879.599,"C":200.949},"1-fluoro-2-methyl-cis-2-butene":{"A":6.68457,"B":924.918,"C":199.199},"1-fluoro-2-methyl-trans-2-butene":{"A":6.68457,"B":924.918,"C":199.199},"1-fluoro-2-methylbutane":{"A":7.00467,"B":1173.73,"C":228.72},"2-fluoro-2-methylbutane":{"A":7.01008,"B":1190.88,"C":243.601},"1-fluoro-2-methylpentane":{"A":7.01953,"B":1258.17,"C":222},"2-fluoro-2-methylpentane":{"A":6.89771,"B":1200.45,"C":222},"3-fluoro-2-methylpentane":{"A":6.95154,"B":1196.79,"C":222},"1-fluoro-2-methylpropane":{"A":7.1853,"B":1170.82,"C":256},"2-fluoro-2-methylpropane":{"A":6.90613,"B":1016.15,"C":240.339},"1-fluoro-cis-2-pentene":{"A":6.73282,"B":939.521,"C":199.824},"1-fluoro-trans-2-pentene":{"A":6.73282,"B":939.521,"C":199.824},"2-fluoro-cis-2-pentene":{"A":6.68457,"B":924.918,"C":199.199},"2-fluoro-trans-2-pentene":{"A":6.68457,"B":924.918,"C":199.199},"3-fluoro-cis-2-pentene":{"A":6.68457,"B":924.918,"C":199.199},"3-fluoro-trans-2-pentene":{"A":6.68457,"B":924.918,"C":199.199},"4-fluoro-cis-2-pentene":{"A":6.67678,"B":921.607,"C":199.146},"4-fluoro-trans-2-pentene":{"A":6.67678,"B":921.607,"C":199.146},"5-fluoro-cis-2-pentene":{"A":6.73282,"B":939.521,"C":199.824},"5-fluoro-trans-2-pentene":{"A":6.73282,"B":939.521,"C":199.824},"1-fluoro-3,3-dimethylbutane":{"A":6.95633,"B":1213.28,"C":222},"2-fluoro-3,3-dimethylbutane":{"A":6.8355,"B":1154.77,"C":222},"cis-1-fluoro-3-methyl-1-butene":{"A":6.67678,"B":921.607,"C":199.146},"trans-1-fluoro-3-methyl-1-butene":{"A":6.67678,"B":921.607,"C":199.146},"2-fluoro-3-methyl-1-butene":{"A":6.64921,"B":893.407,"C":201.039},"3-fluoro-3-methyl-1-butene":{"A":6.58229,"B":866.995,"C":200.859},"4-fluoro-3-methyl-1-butene":{"A":6.69709,"B":907.589,"C":201.66},"1-fluoro-3-methyl-2-butene":{"A":6.68457,"B":924.918,"C":199.199},"2-fluoro-3-methyl-2-butene":{"A":6.63686,"B":910.446,"C":198.555},"1-fluoro-3-methylbutane":{"A":7.2535,"B":1353.35,"C":256},"2-fluoro-3-methylbutane":{"A":7.1899,"B":1309.96,"C":256},"1-fluoro-3-methylpentane":{"A":7.02577,"B":1280.79,"C":222},"2-fluoro-3-methylpentane":{"A":6.9578,"B":1218.41,"C":222},"3-fluoro-3-methylpentane":{"A":6.88491,"B":1156.58,"C":222},"1-fluoro-4-methylpentane":{"A":7.02204,"B":1267.22,"C":222},"2-fluoro-4-methylpentane":{"A":6.9578,"B":1218.41,"C":222},"fluorobenzene":{"A":7.13144,"B":1351.52,"C":233.227},"1-fluorobutane":{"A":7.1435,"B":1166.07,"C":241.052},"2-fluorobutane":{"A":7.01419,"B":1087.22,"C":237.935},"1-fluorodecane":{"A":7.22115,"B":1682.91,"C":201.538},"1-fluorodocosane":{"A":7.23258,"B":2319.49,"C":169.001},"1-fluorododecane":{"A":7.21559,"B":1781.81,"C":186.05},"1-fluorodotriacontane":{"A":6.41051,"B":2152.1,"C":155.714},"1-fluoroeicosane":{"A":6.96318,"B":1886.95,"C":121.221},"fluoroform":{"A":7.18249,"B":725.191,"C":250.743},"1-fluoroheneicosane":{"A":7.29345,"B":2314.43,"C":171.501},"1-fluorohentriacontane":{"A":6.4717,"B":2168.65,"C":157.932},"1-fluoroheptacosane":{"A":6.72239,"B":2187.78,"C":156.501},"1-fluoroheptadecane":{"A":7.10635,"B":1905.49,"C":147.948},"1-fluoroheptane":{"A":7.19226,"B":1467.98,"C":222.585},"1-fluoroheptatriacontane":{"A":6.16488,"B":2089.01,"C":147.105},"1-fluorohexacosane":{"A":6.84942,"B":2234.33,"C":159.001},"1-fluorohexadecane":{"A":7.12174,"B":1882.45,"C":154.876},"1-fluorohexane":{"A":7.1708,"B":1374.62,"C":228.926},"2-fluorohexane":{"A":7.02478,"B":1277.17,"C":222},"3-fluorohexane":{"A":7.02066,"B":1262.24,"C":222},"1-fluorohexatriacontane":{"A":6.21142,"B":2100.63,"C":148.706},"1-fluorononacosane":{"A":6.28875,"B":1873.62,"C":119.782},"1-fluorononadecane":{"A":7.0266,"B":1907.35,"C":131.071},"1-fluorononane":{"A":7.21771,"B":1621.13,"C":208.799},"1-fluorononatriacontane":{"A":6.08238,"B":2069.72,"C":144.471},"1-fluorooctacosane":{"A":6.58577,"B":2134.06,"C":154.001},"1-fluorooctadecane":{"A":7.06312,"B":1909.3,"C":140.517},"1-fluorooctane":{"A":7.21056,"B":1551.57,"C":216.05},"1-fluorooctatriacontane":{"A":6.12661,"B":2080.31,"C":145.926},"1-fluoropentacosane":{"A":6.96541,"B":2273.08,"C":161.501},"1-fluoropentadecane":{"A":7.15848,"B":1872.96,"C":163.845},"1-fluoropentane":{"A":7.13705,"B":1265.03,"C":234.417},"2-fluoropentane":{"A":6.92088,"B":1110.92,"C":219.675},"3-fluoropentane":{"A":6.93892,"B":1115.98,"C":222},"1-fluoropentatriacontane":{"A":6.25923,"B":2112.77,"C":150.371},"1-fluoropropane":{"A":7.00443,"B":975.851,"C":239.849},"2-fluoropropane":{"A":6.82343,"B":860.678,"C":227.642},"1-fluorotetracontane":{"A":6.04614,"B":2062.04,"C":143.445},"1-fluorotetracosane":{"A":7.06817,"B":2298.86,"C":164.001},"1-fluorotetradecane":{"A":7.13255,"B":1807.54,"C":167.131},"1-fluorotetratriacontane":{"A":6.30833,"B":2125.4,"C":152.098},"p-fluorotoluene":{"A":7.1726,"B":1484.79,"C":229.351},"1-fluorotriacontane":{"A":6.53464,"B":2185.66,"C":160.185},"1-fluorotricosane":{"A":7.15775,"B":2315.97,"C":166.501},"1-fluorotridecane":{"A":7.17668,"B":1800.39,"C":177.098},"1-fluorotritriacontane":{"A":6.35875,"B":2138.52,"C":153.881},"1-fluoroundecane":{"A":7.21326,"B":1731.73,"C":193.713},"formaldehyde":{"A":7.46432,"B":1078.39,"C":254.377},"formamide":{"A":7.63804,"B":2012.7,"C":203.234},"formanilide":{"A":7.53199,"B":2137.43,"C":188.545},"formic acid":{"A":8.41278,"B":2247.58,"C":305.729},"fumaric acid":{"A":7.50353,"B":1665.01,"C":70.1806},"furan":{"A":7.13277,"B":1145.36,"C":238.023},"furfural":{"A":7.71516,"B":1917.45,"C":234.93},"furfuryl alcohol":{"A":8.2317,"B":2128.37,"C":227.76},"glutaric acid":{"A":8.04576,"B":2432.01,"C":148.479},"glutaric anhydride":{"A":7.88053,"B":2538.84,"C":218.256},"glutaronitrile":{"A":7.85683,"B":2587.97,"C":234.088},"glycerol":{"A":9.90788,"B":3821.36,"C":253.806},"glyceryl triacetate":{"A":7.74878,"B":2162.45,"C":185.221},"guaiacol":{"A":7.89985,"B":2204.47,"C":234.222},"halothane":{"A":6.55116,"B":951.73,"C":209.103},"heneicosane":{"A":7.07687,"B":2022.5,"C":125.5},"heneicosanenitrile":{"A":7.19134,"B":2290.31,"C":134.33},"1-heneicosene":{"A":6.98584,"B":1963.02,"C":123.199},"heneicosylamine":{"A":7.19297,"B":2231.36,"C":122.458},"heneicosylbenzene":{"A":6.64024,"B":1865.35,"C":67.1797},"heneicosylcyclohexane":{"A":6.49605,"B":1785.33,"C":61.8343},"heneicosylcyclopentane":{"A":6.76888,"B":2033,"C":102.882},"1-heneicosyne":{"A":8.04371,"B":3273.97,"C":280.135},"hentriacontane":{"A":7.14547,"B":2276.9,"C":75.9},"1-hentriacontene":{"A":6.01819,"B":1461.55,"C":8.8505},"hentriacontylamine":{"A":8.7196,"B":4485.06,"C":273.15},"hentriacontylbenzene":{"A":6.46377,"B":1850,"C":12.3333},"hentriacontylcyclohexane":{"A":6.43623,"B":1850,"C":12.3333},"hentriacontylcyclopentane":{"A":5.72218,"B":1718.57,"C":103.839},"1-hentriacontyne":{"A":6.09198,"B":1921.05,"C":143.242},"n-heptacontane":{"A":7.22067,"B":2662.5,"C":-39.5},"heptacosane":{"A":7.11471,"B":2188.5,"C":94.8},"1-heptacosene":{"A":6.2286,"B":1551.84,"C":42.5433},"heptacosylamine":{"A":5.76543,"B":1350,"C":9},"heptacosylbenzene":{"A":6.1121,"B":1546.49,"C":1.60011},"heptacosylcyclohexane":{"A":6.23447,"B":1650,"C":11},"heptacosylcyclopentane":{"A":6.27543,"B":1965.46,"C":106.993},"1-heptacosyne":{"A":8.3422,"B":4496.67,"C":404.357},"heptadecanal":{"A":7.59576,"B":2366.09,"C":176.828},"heptadecane":{"A":7.25896,"B":2028.11,"C":161.086},"1,2-heptadecanediol":{"A":9.11678,"B":4059.62,"C":273.001},"1,3-heptadecanediol":{"A":9.11679,"B":4128.22,"C":273.001},"1,4-heptadecanediol":{"A":9.11683,"B":4259.2,"C":273.001},"1,17-heptadecanediol":{"A":9.11084,"B":4174.12,"C":273.001},"heptadecanenitrile":{"A":7.33198,"B":2189.36,"C":142.861},"1-heptadecanethiol":{"A":7.39235,"B":2295,"C":160.685},"2-heptadecanethiol":{"A":7.22832,"B":2069.41,"C":135},"heptadecanoic acid":{"A":7.35248,"B":2072.1,"C":100.784},"1-heptadecanol":{"A":6.96026,"B":1797.05,"C":116.512},"2-heptadecanol":{"A":6.89532,"B":1657.99,"C":85.0003},"2-heptadecanone":{"A":7.4683,"B":2226.6,"C":166.364},"1-heptadecene":{"A":7.36258,"B":2126.37,"C":174.12},"heptadecyl acetate":{"A":7.6754,"B":2550,"C":190},"heptadecylamine":{"A":7.56304,"B":2397.6,"C":169.063},"heptadecylbenzene":{"A":7.08791,"B":2133.92,"C":118.218},"heptadecyl butanoate":{"A":5.10563,"B":1050,"C":7},"heptadecylcyclohexane":{"A":6.9428,"B":2046.35,"C":112.781},"heptadecylcyclopentane":{"A":6.9848,"B":2027.13,"C":116.941},"heptadecyl formate":{"A":9.11363,"B":3650,"C":190},"heptadecyl propanoate":{"A":8.25996,"B":3400,"C":190},"1-heptadecyne":{"A":7.13747,"B":1929.84,"C":154.361},"2-heptadecyne":{"A":7.37031,"B":2251.56,"C":190.518},"3-heptadecyne":{"A":7.36546,"B":2203.59,"C":191.363},"n-heptahexacontane":{"A":7.21879,"B":2647.9,"C":-33.6},"1-heptanal":{"A":7.32102,"B":1635.48,"C":215.534},"1,2-heptanediol":{"A":9.63878,"B":3453.33,"C":273},"1,3-heptanediol":{"A":9.63881,"B":3527.68,"C":273},"1,4-heptanediol":{"A":7.16002,"B":1435.29,"C":93.4098},"1,6-heptanediol":{"A":9.6387,"B":3279.47,"C":273},"1,7-heptanediol":{"A":10.5427,"B":4544.41,"C":331.118},"2,3-heptanediol":{"A":9.56529,"B":3396.12,"C":273},"2,4-heptanediol":{"A":9.56529,"B":3396.12,"C":273},"2,6-heptanediol":{"A":9.56529,"B":3396.12,"C":273},"heptanenitrile":{"A":7.03431,"B":1467.06,"C":168.71},"2-heptanethiol":{"A":7.08682,"B":1575.03,"C":210.873},"heptanoic acid":{"A":7.32832,"B":1656.28,"C":149.408},"1-heptanol":{"A":7.18822,"B":1482.06,"C":167.773},"2-heptanol":{"A":7.92389,"B":1897.51,"C":217.061},"3-heptanol":{"A":7.71058,"B":1690.91,"C":193.402},"4-heptanol":{"A":7.8339,"B":1789.72,"C":206.635},"2-heptanone":{"A":7.16218,"B":1551.82,"C":211.559},"3-heptanone":{"A":7.22074,"B":1520.57,"C":202.967},"4-heptanone":{"A":7.60043,"B":1857.3,"C":249.527},"heptatriacontane":{"A":7.16756,"B":2380,"C":51.2},"1-heptatriacontene":{"A":6.47072,"B":1850,"C":12.3333},"heptatriacontylamine":{"A":8.74357,"B":4767.3,"C":273.15},"1-heptatriacontyne":{"A":5.74292,"B":1772.73,"C":119.38},"1-heptene":{"A":7.0899,"B":1371.22,"C":232.136},"cis-2-heptene":{"A":7.06158,"B":1400.63,"C":236.608},"trans-2-heptene":{"A":7.1336,"B":1414.38,"C":234.628},"cis-3-heptene":{"A":7.02687,"B":1361.01,"C":232.516},"trans-3-heptene":{"A":7.17463,"B":1442.86,"C":240.362},"1-heptyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.31141,"B":2210.91,"C":178.011},"2-heptyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.31065,"B":2224.89,"C":177.251},"heptyl acetate":{"A":7.00947,"B":1541.36,"C":180.932},"heptylamine":{"A":7.38735,"B":1682.44,"C":216.434},"heptylbenzene":{"A":7.25666,"B":1945.86,"C":198.582},"heptyl butanoate":{"A":6.82421,"B":1528.67,"C":162.554},"heptylcyclohexane":{"A":7.10051,"B":1835.18,"C":189.998},"heptylcyclopentane":{"A":7.11422,"B":1770.7,"C":194.118},"1-heptylcyclopentene":{"A":7.1397,"B":1773.36,"C":197.39},"heptyl formate":{"A":6.94976,"B":1418.49,"C":170.515},"heptyl mercaptan":{"A":7.21232,"B":1700.98,"C":215.759},"1-heptylnaphthalene":{"A":7.39867,"B":2313.01,"C":174.971},"2-heptylnaphthalene":{"A":7.3983,"B":2320.14,"C":174.591},"heptyl propanoate":{"A":6.8848,"B":1503.8,"C":165.575},"1-heptyne":{"A":7.2638,"B":1554.66,"C":254.993},"2-heptyne":{"A":6.91852,"B":1318.37,"C":214.515},"3-heptyne":{"A":6.92415,"B":1306.53,"C":215.972},"hexachloro-1,3-butadiene":{"A":6.60811,"B":1484.18,"C":183.191},"hexachlorobenzene":{"A":6.63176,"B":1444.53,"C":75.7115},"hexachlorocyclopentadiene":{"A":7.09079,"B":1829.59,"C":195.584},"hexachloroethane":{"A":6.69959,"B":1377.5,"C":173.867},"hexacosane":{"A":7.10961,"B":2164.3,"C":99.6},"1-hexacosene":{"A":6.38418,"B":1641.95,"C":57.6761},"hexacosylamine":{"A":6.1621,"B":1485.48,"C":3.7122},"hexacosylbenzene":{"A":6.24846,"B":1635.45,"C":15.6376},"hexacosylcyclohexane":{"A":6.1268,"B":1576.82,"C":11.777},"hexacosylcyclopentane":{"A":6.40455,"B":2016.72,"C":108.323},"1-hexacosyne":{"A":8.45447,"B":4513.25,"C":400.747},"hexadecanal":{"A":7.60512,"B":2321.81,"C":180.46},"hexadecane":{"A":7.36235,"B":2094.08,"C":180.407},"1,2-hexadecanediol":{"A":9.25172,"B":4058.27,"C":273.001},"1,3-hexadecanediol":{"A":9.25174,"B":4128.37,"C":273.001},"1,4-hexadecanediol":{"A":9.25178,"B":4262.18,"C":273.001},"1,16-hexadecanediol":{"A":9.30068,"B":4181.48,"C":273.001},"hexadecanenitrile":{"A":7.33475,"B":2142.14,"C":144.954},"1-hexadecanethiol":{"A":7.38074,"B":2235.41,"C":162.757},"2-hexadecanethiol":{"A":7.19413,"B":2014.32,"C":140},"hexadecanoic acid":{"A":8.58266,"B":3341.95,"C":235.116},"1-hexadecanol":{"A":6.93175,"B":1747.21,"C":119.31},"2-hexadecanol":{"A":6.87873,"B":1619.16,"C":91.0003},"2-hexadecanone":{"A":7.5392,"B":2262.56,"C":178.696},"1-hexadecene":{"A":7.45309,"B":2193.98,"C":194.974},"hexadecyl acetate":{"A":7.71781,"B":2500,"C":190},"hexadecylamine":{"A":7.48138,"B":2275.78,"C":166.673},"hexadecylbenzene":{"A":6.59124,"B":1709.22,"C":83.6545},"hexadecyl butanoate":{"A":5.10929,"B":1000,"C":6.66667},"hexadecylcyclohexane":{"A":6.95175,"B":2003.81,"C":113.214},"hexadecylcyclopentane":{"A":6.91514,"B":1897.48,"C":106.324},"1-hexadecylcyclopentene":{"A":7.34912,"B":2320.21,"C":173.261},"hexadecyl formate":{"A":9.10049,"B":3500,"C":190},"hexadecyl propanoate":{"A":8.13369,"B":3200,"C":190},"1-hexadecyne":{"A":7.10989,"B":1864.84,"C":156.948},"2-hexadecyne":{"A":7.34772,"B":2187.32,"C":193.671},"3-hexadecyne":{"A":7.34926,"B":2150.63,"C":195.292},"1,2-hexadiene":{"A":6.96077,"B":1226.27,"C":224.56},"1,cis-3-hexadiene":{"A":6.94618,"B":1212.01,"C":225.13},"1,trans-3-hexadiene":{"A":6.94618,"B":1212.01,"C":225.13},"1,cis-4-hexadiene":{"A":6.94975,"B":1186.71,"C":226.65},"1,trans-4-hexadiene":{"A":6.94975,"B":1186.71,"C":226.65},"1,5-hexadiene":{"A":7.05328,"B":1270.64,"C":245.07},"2,3-hexadiene":{"A":6.94918,"B":1196.43,"C":226.08},"cis-2,trans-4-hexadiene":{"A":7.06647,"B":1332.12,"C":234.758},"cis-2,cis-4-hexadiene":{"A":6.92807,"B":1229.56,"C":223.8},"trans-2,trans-4-hexadiene":{"A":6.97629,"B":1249.62,"C":223.221},"hexaethylbenzene":{"A":7.6139,"B":2455.63,"C":220.811},"hexafluoroacetone":{"A":7.04955,"B":872.277,"C":236.513},"hexafluorobenzene":{"A":7.22141,"B":1329.93,"C":226.134},"hexafluoroethane":{"A":6.99088,"B":723.544,"C":254.242},"1,1,1,2,2,3-hexafluoropropane":{"A":6.89584,"B":841.265,"C":208.329},"1,1,1,2,3,3-hexafluoropropane":{"A":6.70224,"B":814.052,"C":206.923},"1,1,1,3,3,3-hexafluoropropane":{"A":6.79355,"B":833.01,"C":213.597},"1,1,2,2,3,3-hexafluoropropane":{"A":6.78562,"B":844.924,"C":206.38},"hexafluoropropylene":{"A":6.93705,"B":900.849,"C":251.69},"n-hexahexacontane":{"A":7.21737,"B":2642.7,"C":-31.6},"hexamethylbenzene":{"A":7.39576,"B":2358.05,"C":258.827},"hexamethylcyclotrisiloxane":{"A":6.89602,"B":1350.23,"C":201.168},"hexamethyldisilazane":{"A":7.30838,"B":1581.26,"C":231.139},"hexamethyldisiloxane":{"A":7.12803,"B":1433.96,"C":237.103},"hexamethylenediamine":{"A":7.54526,"B":1828.87,"C":190.197},"hexamethyleneimine":{"A":7.1137,"B":1427.99,"C":205.657},"2,2,3,3,4,4-hexamethylhexane":{"A":6.63649,"B":1494.14,"C":181.835},"2,2,3,3,4,5-hexamethylhexane":{"A":6.66965,"B":1442.92,"C":181.835},"2,2,3,3,5,5-hexamethylhexane":{"A":6.61085,"B":1405.61,"C":181.835},"2,2,3,4,4,5-hexamethylhexane":{"A":6.67849,"B":1472.87,"C":181.835},"2,2,3,4,5,5-hexamethylhexane":{"A":6.65789,"B":1404.45,"C":181.835},"2,3,3,4,4,5-hexamethylhexane":{"A":6.67849,"B":1472.87,"C":181.835},"2,2,3,3,4,4-hexamethylpentane":{"A":6.6044,"B":1421.29,"C":187.7},"hexamethyl phosphoramide":{"A":8.0642,"B":2397.83,"C":229.599},"hexanal":{"A":7.34663,"B":1588.31,"C":227.359},"hexane":{"A":6.9895,"B":1216.92,"C":227.451},"1,2-hexanediol":{"A":9.61605,"B":3347.42,"C":273},"1,3-hexanediol":{"A":9.61609,"B":3421.52,"C":273},"1,4-hexanediol":{"A":9.61615,"B":3562.99,"C":273},"1,5-hexanediol":{"A":10.4322,"B":4270.05,"C":328.464},"1,6-hexanediol":{"A":8.862,"B":2626.62,"C":196.146},"2,3-hexanediol":{"A":9.53869,"B":3182.47,"C":273},"2,5-hexanediol":{"A":9.53874,"B":3287.68,"C":273},"3,4-hexanediol":{"A":9.53875,"B":3307.6,"C":273},"hexanenitrile":{"A":7.57546,"B":1927.95,"C":247.07},"2-hexanethiol":{"A":6.9792,"B":1426.46,"C":209.155},"hexanoic acid":{"A":7.47273,"B":1747.23,"C":174.802},"1-hexanol":{"A":7.34748,"B":1538.76,"C":187.498},"2-hexanol":{"A":7.3119,"B":1461.05,"C":189.837},"3-hexanol":{"A":7.38185,"B":1516.14,"C":201.443},"2-hexanone":{"A":7.24056,"B":1522.85,"C":221.597},"3-hexanone":{"A":7.19422,"B":1482.66,"C":220.234},"hexatriacontane":{"A":7.16373,"B":2364.6,"C":55.1},"1-hexatriacontene":{"A":6.42412,"B":1800,"C":12},"hexatriacontylamine":{"A":8.73437,"B":4718.85,"C":273.15},"hexatriacontylbenzene":{"A":6.71994,"B":2100,"C":14},"hexatriacontylcyclohexane":{"A":6.68516,"B":2100,"C":14},"hexatriacontylcyclopentane":{"A":5.04958,"B":1379.63,"C":104.138},"1-hexatriacontyne":{"A":5.79493,"B":1796.17,"C":123.369},"1-hexene":{"A":7.07214,"B":1270.42,"C":239.628},"cis-2-hexene":{"A":7.09973,"B":1315.64,"C":242.963},"trans-2-hexene":{"A":7.0103,"B":1252.84,"C":235.52},"cis-3-hexene":{"A":7.07141,"B":1279.52,"C":238.882},"trans-3-hexene":{"A":7.05706,"B":1263.56,"C":235.469},"1-hexyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.27463,"B":2135.62,"C":181.051},"2-hexyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.27366,"B":2152.93,"C":180.101},"hexyl acetate":{"A":7.47682,"B":1820.45,"C":224.594},"hexylamine":{"A":7.34589,"B":1579.36,"C":222.214},"hexylbenzene":{"A":7.29541,"B":1948.01,"C":215.155},"hexyl butanoate":{"A":6.81383,"B":1463.2,"C":166.031},"hexylcyclohexane":{"A":7.07462,"B":1764.46,"C":196.02},"hexylcyclopentane":{"A":7.08212,"B":1694.02,"C":200.103},"1-hexylcyclopentene":{"A":7.0991,"B":1691.53,"C":201},"hexylene glycol":{"A":8.61143,"B":2229.3,"C":191.516},"hexyl formate":{"A":6.92151,"B":1333.68,"C":174.562},"hexyl mercaptan":{"A":7.19912,"B":1628.29,"C":224.406},"1-hexylnaphthalene":{"A":7.40324,"B":2323.85,"C":191.851},"2-hexylnaphthalene":{"A":7.36137,"B":2243.1,"C":177.631},"hexyl propanoate":{"A":6.88448,"B":1438.51,"C":169.299},"1-hexyne":{"A":7.21967,"B":1336.56,"C":236.713},"2-hexyne":{"A":6.89243,"B":1229.19,"C":221.889},"3-hexyne":{"A":7.01524,"B":1318.15,"C":237.623},"hydracrylonitrile":{"A":8.73052,"B":2834.99,"C":263.638},"hydrazobenzene":{"A":7.54296,"B":2186.08,"C":169.05},"hydrogen cyanide":{"A":8.02579,"B":1608.28,"C":286.893},"p-hydroquinone":{"A":8.09136,"B":2463.24,"C":187.741},"p-hydroxybenzaldehyde":{"A":7.96259,"B":2654.79,"C":212.413},"hydroxycaproic acid":{"A":8.39777,"B":2557.41,"C":160.705},"2-hydroxyethyl acrylate":{"A":8.38431,"B":2402.31,"C":225.655},"8-hydroxyquinoline":{"A":7.50383,"B":2097.73,"C":186.907},"indane":{"A":7.19185,"B":1723.24,"C":221.757},"indene":{"A":7.11961,"B":1655.45,"C":207.927},"indole":{"A":7.18748,"B":1870.12,"C":181.239},"cis-1-iodo-1-butene":{"A":6.63024,"B":1231.85,"C":160.543},"trans-1-iodo-1-butene":{"A":6.64197,"B":1128.39,"C":172.511},"2-iodo-1-butene":{"A":6.61076,"B":1115.7,"C":172.271},"3-iodo-1-butene":{"A":6.60308,"B":1112.65,"C":172.068},"4-iodo-1-butene":{"A":6.65789,"B":1133.27,"C":173.189},"cis-1-iodo-1-decene":{"A":6.91334,"B":1628.09,"C":153.739},"trans-1-iodo-1-decene":{"A":6.91334,"B":1628.09,"C":153.739},"cis-1-iodo-1-dodecene":{"A":7.00642,"B":1789.62,"C":148.783},"trans-1-iodo-1-dodecene":{"A":7.00642,"B":1789.62,"C":148.783},"cis-1-iodo-1-eicosene":{"A":7.15514,"B":2259.86,"C":132.707},"trans-1-iodo-1-eicosene":{"A":7.15514,"B":2259.86,"C":132.707},"cis-1-iodo-1-heptadecene":{"A":7.16381,"B":2130.27,"C":138.38},"trans-1-iodo-1-heptadecene":{"A":7.16381,"B":2130.27,"C":138.38},"cis-1-iodo-1-heptene":{"A":6.76948,"B":1377.62,"C":162.266},"trans-1-iodo-1-heptene":{"A":6.76948,"B":1377.62,"C":162.266},"cis-1-iodo-1-hexadecene":{"A":7.14616,"B":2070.62,"C":140.453},"trans-1-iodo-1-hexadecene":{"A":7.14616,"B":2070.62,"C":140.453},"cis-1-iodo-1-hexene":{"A":6.72413,"B":1293.37,"C":165.524},"trans-1-iodo-1-hexene":{"A":6.72413,"B":1293.37,"C":165.524},"cis-1-iodo-1-nonadecene":{"A":7.16957,"B":2224.29,"C":134.633},"trans-1-iodo-1-nonadecene":{"A":7.16957,"B":2224.29,"C":134.633},"cis-1-iodo-1-nonene":{"A":6.86484,"B":1546.84,"C":156.261},"trans-1-iodo-1-nonene":{"A":6.86484,"B":1546.84,"C":156.261},"cis-1-iodo-1-octadecene":{"A":7.17203,"B":2181.84,"C":136.442},"trans-1-iodo-1-octadecene":{"A":7.17203,"B":2181.84,"C":136.442},"cis-1-iodo-1-octene":{"A":6.81674,"B":1461.31,"C":159.275},"trans-1-iodo-1-octene":{"A":6.81674,"B":1461.31,"C":159.275},"cis-1-iodo-1-pentadecene":{"A":7.1202,"B":2007.04,"C":142.426},"trans-1-iodo-1-pentadecene":{"A":7.1202,"B":2007.04,"C":142.426},"cis-1-iodo-1-pentene":{"A":6.68153,"B":1208.91,"C":169.076},"trans-1-iodo-1-pentene":{"A":6.68153,"B":1208.91,"C":169.076},"2-iodo-1-pentene":{"A":6.65578,"B":1149.14,"C":174.061},"3-iodo-1-pentene":{"A":6.64805,"B":1145.23,"C":173.967},"4-iodo-1-pentene":{"A":6.64805,"B":1145.23,"C":173.967},"5-iodo-1-pentene":{"A":6.69732,"B":1218.44,"C":169.256},"cis-1-iodo-1-propene":{"A":6.61126,"B":1016.02,"C":180.169},"trans-1-iodo-1-propene":{"A":6.61126,"B":1016.02,"C":180.169},"2-iodo-1-propene":{"A":6.57705,"B":1025.18,"C":177.359},"3-iodo-1-propene":{"A":6.91697,"B":1287.53,"C":216.99},"cis-1-iodo-1-tetradecene":{"A":7.08726,"B":1940.44,"C":144.3},"trans-1-iodo-1-tetradecene":{"A":7.08726,"B":1940.44,"C":144.3},"cis-1-iodo-1-tridecene":{"A":7.04904,"B":1865.63,"C":146.582},"trans-1-iodo-1-tridecene":{"A":7.04904,"B":1865.63,"C":146.582},"cis-1-iodo-1-undecene":{"A":6.96081,"B":1710.19,"C":151.164},"trans-1-iodo-1-undecene":{"A":6.96081,"B":1710.19,"C":151.164},"1-iodo-2,2-dimethylbutane":{"A":7.58102,"B":1570.86,"C":177.982},"1-iodo-2,2-dimethylpropane":{"A":7.40715,"B":1423.64,"C":180.523},"1-iodo-2,3-dimethylbutane":{"A":7.44317,"B":1547.56,"C":174.203},"2-iodo-2,3-dimethylbutane":{"A":7.44743,"B":1510.28,"C":177.282},"1-iodo-cis-2-butene":{"A":6.64055,"B":1139.88,"C":171.181},"1-iodo-trans-2-butene":{"A":6.64055,"B":1139.88,"C":171.181},"2-iodo-cis-2-butene":{"A":6.59909,"B":1079.28,"C":175.313},"2-iodo-trans-2-butene":{"A":6.59909,"B":1079.28,"C":175.313},"3-iodo-2-ethyl-1-propene":{"A":6.65578,"B":1149.14,"C":174.061},"1-iodo-2-ethylbutane":{"A":7.37958,"B":1525.77,"C":173.153},"cis-1-iodo-2-methyl-1-butene":{"A":6.63748,"B":1161.77,"C":171.426},"trans-1-iodo-2-methyl-1-butene":{"A":6.63748,"B":1161.77,"C":171.426},"3-iodo-2-methyl-1-butene":{"A":6.59887,"B":1144.98,"C":171.101},"4-iodo-2-methyl-1-butene":{"A":6.65372,"B":1165.94,"C":172.179},"1-iodo-2-methyl-1-propene":{"A":6.59909,"B":1079.28,"C":175.313},"3-iodo-2-methyl-1-propene":{"A":6.6172,"B":1066.69,"C":178.018},"1-iodo-2-methyl-cis-2-butene":{"A":6.63748,"B":1161.77,"C":171.426},"1-iodo-2-methyl-trans-2-butene":{"A":6.63748,"B":1161.77,"C":171.426},"1-iodo-2-methylbutane":{"A":7.53791,"B":1512.7,"C":178.815},"2-iodo-2-methylbutane":{"A":7.40919,"B":1407.78,"C":181.879},"1-iodo-2-methylpentane":{"A":7.57656,"B":1610.11,"C":174.886},"2-iodo-2-methylpentane":{"A":7.44743,"B":1510.28,"C":177.282},"3-iodo-2-methylpentane":{"A":7.51703,"B":1544.67,"C":177.384},"1-iodo-2-methylpropane":{"A":7.50285,"B":1405.79,"C":183.749},"2-iodo-2-methylpropane":{"A":6.76368,"B":1210.96,"C":211.863},"1-iodo-cis-2-pentene":{"A":6.6849,"B":1180.08,"C":172.264},"1-iodo-trans-2-pentene":{"A":6.6849,"B":1180.08,"C":172.264},"2-iodo-cis-2-pentene":{"A":6.63748,"B":1161.77,"C":171.426},"2-iodo-trans-2-pentene":{"A":6.63748,"B":1161.77,"C":171.426},"3-iodo-cis-2-pentene":{"A":6.63748,"B":1161.77,"C":171.426},"3-iodo-trans-2-pentene":{"A":6.63748,"B":1161.77,"C":171.426},"4-iodo-cis-2-pentene":{"A":6.62978,"B":1157.82,"C":171.326},"4-iodo-trans-2-pentene":{"A":6.62978,"B":1157.82,"C":171.326},"5-iodo-cis-2-pentene":{"A":6.6849,"B":1180.08,"C":172.264},"5-iodo-trans-2-pentene":{"A":6.6849,"B":1180.08,"C":172.264},"1-iodo-3,3-dimethylbutane":{"A":7.51432,"B":1568.33,"C":175.476},"2-iodo-3,3-dimethylbutane":{"A":7.38243,"B":1500.38,"C":175.298},"cis-1-iodo-3-methyl-1-butene":{"A":6.62978,"B":1157.82,"C":171.326},"trans-1-iodo-3-methyl-1-butene":{"A":6.62978,"B":1157.82,"C":171.326},"2-iodo-3-methyl-1-butene":{"A":6.60102,"B":1127.37,"C":173.128},"3-iodo-3-methyl-1-butene":{"A":6.53477,"B":1095.72,"C":172.634},"4-iodo-3-methyl-1-butene":{"A":6.64805,"B":1145.23,"C":173.967},"1-iodo-3-methyl-2-butene":{"A":6.63748,"B":1161.77,"C":171.426},"2-iodo-3-methyl-2-butene":{"A":6.59059,"B":1143.62,"C":170.562},"1-iodo-3-methylbutane":{"A":7.53703,"B":1519.92,"C":178.227},"2-iodo-3-methylbutane":{"A":7.4757,"B":1468.83,"C":179.666},"1-iodo-3-methylpentane":{"A":7.57438,"B":1630.12,"C":173.308},"2-iodo-3-methylpentane":{"A":7.51703,"B":1544.67,"C":177.384},"3-iodo-3-methylpentane":{"A":7.44743,"B":1510.28,"C":177.282},"1-iodo-4-methylpentane":{"A":7.5747,"B":1627.11,"C":173.545},"2-iodo-4-methylpentane":{"A":7.51657,"B":1548.64,"C":177.064},"iodobenzene":{"A":7.1286,"B":1736.98,"C":220.463},"1-iodobutane":{"A":9.30096,"B":3155.24,"C":360.93},"2-iodobutane":{"A":7.50303,"B":1404.5,"C":183.858},"1-iododecane":{"A":9.52782,"B":4189.76,"C":366.622},"1-iododocosane":{"A":7.52371,"B":2720.74,"C":158.001},"1-iodododecane":{"A":9.47246,"B":4307.24,"C":355.238},"1-iododotriacontane":{"A":6.60042,"B":2454.72,"C":143.942},"1-iodoeicosane":{"A":8.08037,"B":3214.07,"C":211.144},"iodoform":{"A":7.42936,"B":2270.36,"C":281.13},"1-iodoheneicosane":{"A":7.64434,"B":2753.32,"C":160.001},"1-iodohentriacontane":{"A":6.65151,"B":2468.61,"C":145.683},"1-iodoheptacosane":{"A":6.52165,"B":2083.58,"C":102.28},"1-iodoheptadecane":{"A":8.83561,"B":3911.58,"C":285.879},"1-iodoheptane":{"A":9.48545,"B":3807.89,"C":372.599},"1-iodoheptatriacontane":{"A":6.36369,"B":2393.43,"C":136.199},"1-iodohexacosane":{"A":6.92099,"B":2492.79,"C":150.001},"1-iodohexadecane":{"A":9.01052,"B":4044.82,"C":302.872},"1-iodohexane":{"A":9.44303,"B":3626.39,"C":371.287},"2-iodohexane":{"A":7.5762,"B":1613.44,"C":174.623},"3-iodohexane":{"A":7.57656,"B":1610.11,"C":174.886},"1-iodohexatriacontane":{"A":6.40862,"B":2404.57,"C":137.605},"1-iodononacosane":{"A":5.9734,"B":1664.05,"C":45.0763},"1-iodononadecane":{"A":8.35035,"B":3459.86,"C":237.569},"1-iodononane":{"A":9.53154,"B":4093.33,"C":370.47},"1-iodononatriacontane":{"A":6.291,"B":2378.05,"C":134.336},"1-iodooctacosane":{"A":6.27013,"B":1912.49,"C":79.2691},"1-iodooctadecane":{"A":8.60077,"B":3690.42,"C":262.183},"1-iodooctane":{"A":9.51257,"B":3959.7,"C":371.972},"1-iodooctatriacontane":{"A":6.32689,"B":2385.47,"C":135.226},"1-iodopentacosane":{"A":7.08693,"B":2565.73,"C":152.001},"1-iodopentadecane":{"A":9.23707,"B":4272.69,"C":328.202},"1-iodopentane":{"A":9.38224,"B":3410.1,"C":367.516},"2-iodopentane":{"A":7.53911,"B":1502.85,"C":179.618},"3-iodopentane":{"A":7.5383,"B":1509.41,"C":179.083},"1-iodopentatriacontane":{"A":6.44741,"B":2413.64,"C":138.735},"1-iodopropane":{"A":7.32543,"B":1566.19,"C":249.929},"2-iodopropane":{"A":7.20587,"B":1433.28,"C":241.89},"1-iodotetracontane":{"A":6.256,"B":2371.18,"C":133.532},"1-iodotetracosane":{"A":7.24442,"B":2631.26,"C":154.001},"1-iodotetradecane":{"A":9.33822,"B":4317.84,"C":338.665},"1-iodotetratriacontane":{"A":6.49333,"B":2424.13,"C":140.036},"1-iodotriacontane":{"A":6.74173,"B":2526.01,"C":153.252},"1-iodotricosane":{"A":7.39061,"B":2683.33,"C":156.001},"1-iodotridecane":{"A":9.37559,"B":4263.77,"C":342.491},"1-iodotritriacontane":{"A":6.54301,"B":2438.7,"C":141.91},"1-iodoundecane":{"A":9.51548,"B":4271.88,"C":362.373},"isobutane":{"A":6.93388,"B":953.92,"C":247.077},"isobutanol":{"A":7.45936,"B":1386.1,"C":195.079},"isobutene":{"A":6.99506,"B":984.226,"C":246.124},"isobutyl acetate":{"A":7.42094,"B":1584.82,"C":232.421},"isobutyl acrylate":{"A":7.28452,"B":1545.97,"C":219.06},"isobutylamine":{"A":7.31147,"B":1329.9,"C":232.428},"isobutylbenzene":{"A":7.22936,"B":1726.18,"C":224.166},"isobutyl butanoate":{"A":7.12551,"B":1576.62,"C":214.532},"isobutylcyclopentane":{"A":6.95436,"B":1461.75,"C":210.89},"isobutyl formate":{"A":7.48932,"B":1586.24,"C":246.128},"isobutyl isobutyrate":{"A":7.13476,"B":1554.49,"C":217.922},"isobutyl isocyanide":{"A":6.89754,"B":1180.5,"C":183.897},"isobutyl mercaptan":{"A":7.13583,"B":1389.59,"C":238.087},"1-isobutylnaphthalene":{"A":7.38845,"B":2212.41,"C":211.314},"2-isobutylnaphthalene":{"A":8.51736,"B":3993.45,"C":396.231},"2-isobutylphenol":{"A":7.18027,"B":1727.74,"C":165},"3-isobutylphenol":{"A":7.18027,"B":1727.74,"C":165},"4-isobutylphenol":{"A":7.18049,"B":1728.47,"C":165},"isobutyl propanoate":{"A":6.73991,"B":1194.11,"C":172.829},"isobutyraldehyde":{"A":7.27632,"B":1294.63,"C":230.435},"isobutyric acid":{"A":7.83371,"B":1878.15,"C":224.503},"isobutyronitrile":{"A":7.22199,"B":1443.15,"C":228.824},"isodecanol":{"A":8.0139,"B":2167.2,"C":202.353},"isopentane":{"A":7.03015,"B":1140.45,"C":247.012},"isopentyl acetate":{"A":7.19136,"B":1566.48,"C":221.306},"isopentyl formate":{"A":7.20108,"B":1483.57,"C":219.297},"isopentyl isovalerate":{"A":7.75828,"B":2194.42,"C":255.911},"isopentyl propanoate":{"A":6.90741,"B":1346.13,"C":174.809},"isophorone":{"A":7.46901,"B":2105.9,"C":243.781},"isophthalic acid":{"A":8.1389,"B":3078.64,"C":105.656},"isophthaloyl chloride":{"A":7.58236,"B":2162.03,"C":184.006},"isoprene":{"A":6.77329,"B":1016.97,"C":227.195},"2-isopropyl-1,3-propanediol":{"A":9.53875,"B":3307.6,"C":273},"2-isopropyl-1,4-butanediol":{"A":9.56529,"B":3396.12,"C":273},"3-isopropyl-1-heptanol":{"A":8.55074,"B":2768.06,"C":273},"2-isopropyl-1-pentanol":{"A":8.45088,"B":2637.93,"C":273},"2-isopropyl-1-pentene":{"A":6.99006,"B":1377.64,"C":222.254},"3-isopropyl-2-methylhexane":{"A":7.16708,"B":1703.49,"C":230.72},"4-isopropyl-4-heptanol":{"A":8.40583,"B":2558.08,"C":273},"isopropyl-tert-butyl-ether":{"A":7.58035,"B":1898.73,"C":298.516},"isopropyl acetate":{"A":7.25879,"B":1411.2,"C":233.84},"isopropylamine":{"A":7.10093,"B":1091.81,"C":226.316},"isopropyl butanoate":{"A":6.94593,"B":1271.73,"C":181.839},"isopropylcyclohexane":{"A":7.10247,"B":1608.06,"C":226.147},"isopropylcyclopentane":{"A":6.97625,"B":1431.99,"C":223.236},"isopropylcyclopropane":{"A":6.95221,"B":1165.39,"C":227.919},"isopropyl formate":{"A":6.8883,"B":1086.52,"C":203.023},"4-isopropylheptane":{"A":7.0796,"B":1568.33,"C":214.611},"isopropyl isocyanide":{"A":6.85746,"B":1094.77,"C":188.101},"isopropyl mercaptan":{"A":7.08951,"B":1222.68,"C":237.953},"1-isopropylnaphthalene":{"A":7.18066,"B":1956.92,"C":187.323},"2-isopropylnaphthalene":{"A":7.22203,"B":2005.83,"C":193.842},"isopropyl nitrate":{"A":6.46665,"B":1018.49,"C":183.521},"4-isopropylnonane":{"A":6.97839,"B":1556.4,"C":181.835},"5-isopropylnonane":{"A":6.97839,"B":1556.4,"C":181.835},"4-isopropyloctane":{"A":6.95279,"B":1489.12,"C":187.7},"2-isopropylphenol":{"A":7.11432,"B":1606.62,"C":165},"3-isopropylphenol":{"A":7.13465,"B":1671.76,"C":165},"4-isopropylphenol":{"A":7.1364,"B":1677.56,"C":165},"isopropyl phenyl sulfide":{"A":7.12914,"B":1731.11,"C":199.48},"isopropyl propanoate":{"A":6.92682,"B":1196.92,"C":185.829},"2-isopropylthiophene":{"A":7.10889,"B":1534.5,"C":209.93},"3-isopropylthiophene":{"A":7.05172,"B":1527.26,"C":209.17},"isoquinoline":{"A":7.25457,"B":1988.76,"C":211.452},"itaconic acid":{"A":8.01966,"B":2452.04,"C":149.308},"ketene":{"A":7.08594,"B":858.093,"C":253.869},"L-glutamic acid":{"A":8.37894,"B":2866.38,"C":124.488},"lactic acid":{"A":8.37365,"B":1952.65,"C":181.639},"lactonitrile":{"A":8.06761,"B":1985.95,"C":199.035},"levulinic acid":{"A":7.60898,"B":1888.91,"C":153.701},"linoleic acid":{"A":8.138,"B":2780.12,"C":173.974},"lysine":{"A":8.02421,"B":2474.46,"C":139.244},"m,a-dimethylstyrene":{"A":7.02013,"B":1609.57,"C":203.85},"maleic acid":{"A":8.20381,"B":2375.2,"C":154.365},"maleic anhydride":{"A":8.24739,"B":2494.7,"C":262.86},"malic acid":{"A":9.00618,"B":2855.85,"C":137.384},"malononitrile":{"A":7.81263,"B":2293.92,"C":246.777},"3-mercaptopropionic acid":{"A":7.89705,"B":2241.03,"C":218.905},"mesitylene":{"A":7.26105,"B":1695.83,"C":222.415},"mesityl oxide":{"A":7.11665,"B":1480.62,"C":219.745},"meso-2,3-butanediol":{"A":9.47429,"B":2979.26,"C":273},"meso-2,3-dibromobutane":{"A":7.01039,"B":1339.81,"C":167.143},"meso-2,3-dichlorobutane":{"A":6.67983,"B":1117.89,"C":178.257},"meso-2,3-dimethyl-1,4-butanediol":{"A":9.53875,"B":3307.6,"C":273},"meso-2,4-dimethyl-1,5-pentanediol":{"A":9.56529,"B":3396.12,"C":273},"meso-2,4-pentanediol":{"A":9.50761,"B":3141.1,"C":273},"methacrolein":{"A":7.12901,"B":1298.1,"C":237.564},"2-methacrylamide":{"A":7.40149,"B":1843.79,"C":193.007},"methacrylic acid":{"A":7.31085,"B":1534.44,"C":185.373},"methacrylonitrile":{"A":7.31473,"B":1521.42,"C":252.833},"methane":{"A":6.84566,"B":435.621,"C":271.361},"methanesulfonic acid":{"A":9.21833,"B":3354.46,"C":241.453},"methoxyacetic acid":{"A":7.65398,"B":1849.97,"C":182.467},"2-methoxyethanol":{"A":8.09715,"B":1805.18,"C":221.663},"2-(2-methoxyethoxy)ethanol":{"A":8.28868,"B":2210.73,"C":215.198},"p-methoxyphenol":{"A":7.5936,"B":2038.72,"C":189.743},"3-methoxypropionitrile":{"A":7.543,"B":1855.32,"C":232.101},"2-methyl-(1-thiaethyl)-benzene":{"A":7.1366,"B":1740.11,"C":199.152},"3-methyl-(1-thiaethyl)-benzene":{"A":7.1366,"B":1740.11,"C":199.152},"4-methyl-(1-thiaethyl)-benzene":{"A":7.13486,"B":1764.45,"C":197.77},"3-methyl-(1-thiapropyl)-benzene":{"A":7.1742,"B":1787.73,"C":197.39},"4-methyl-(1-thiapropyl)-benzene":{"A":7.17396,"B":1791.1,"C":197.2},"methyl-1,1-dimethylpropylamine":{"A":6.82068,"B":1158.51,"C":183.579},"2-methyl-1,1-diphenylethane":{"A":7.18886,"B":2038.09,"C":184.09},"3-methyl-1,1-diphenylethane":{"A":7.18905,"B":2034.7,"C":184.28},"4-methyl-1,1-diphenylethane":{"A":7.18866,"B":2041.49,"C":183.9},"3-methyl-1,2-butadiene":{"A":6.9337,"B":1119.33,"C":235.331},"2-methyl-1,2-butanediol":{"A":9.41665,"B":3019.56,"C":273},"3-methyl-1,2-butanediol":{"A":9.50761,"B":3134.47,"C":273},"methyl-1,2-dimethylpropylamine":{"A":6.9412,"B":1208.83,"C":184.452},"2-methyl-1,2-diphenylethane":{"A":7.24367,"B":2092.3,"C":182.57},"3-methyl-1,2-diphenylethane":{"A":7.24386,"B":2088.85,"C":182.76},"4-methyl-1,2-diphenylethane":{"A":7.24543,"B":2061.32,"C":184.28},"2-methyl-1,2-hexanediol":{"A":9.48101,"B":3261.16,"C":273},"3-methyl-1,2-pentadiene":{"A":6.9164,"B":1193.32,"C":225.7},"4-methyl-1,2-pentadiene":{"A":6.90404,"B":1189.67,"C":225.7},"2-methyl-1,2-pentanediol":{"A":9.4508,"B":3218.31,"C":273},"2-methyl-1,2-propanediol":{"A":9.381,"B":2931.59,"C":273},"2-methyl-1,3-butanediol":{"A":11.3636,"B":5013.74,"C":391.049},"3-methyl-1,3-butanediol":{"A":9.42897,"B":3090.73,"C":273},"2-methyl-1,cis-3-pentadiene":{"A":6.89808,"B":1207.43,"C":224.56},"2-methyl-1,trans-3-pentadiene":{"A":6.89808,"B":1207.43,"C":224.56},"3-methyl-1,cis-3-pentadiene":{"A":6.89766,"B":1210.56,"C":224.37},"3-methyl-1,trans-3-pentadiene":{"A":6.89766,"B":1210.56,"C":224.37},"4-methyl-1,3-pentadiene":{"A":6.89795,"B":1208.37,"C":224.503},"2-methyl-1,3-pentanediol":{"A":9.53873,"B":3284.36,"C":273},"3-methyl-1,3-pentanediol":{"A":9.45078,"B":3172.18,"C":273},"1-methyl-1,3-propanediol":{"A":9.55716,"B":3251.38,"C":273},"2-methyl-1,4-butanediol":{"A":9.50757,"B":3068.19,"C":273},"2-methyl-1,4-pentadiene":{"A":6.925,"B":1130.35,"C":229.5},"3-methyl-1,4-pentadiene":{"A":6.91499,"B":1143.89,"C":228.55},"4-methyl-1,4-pentanediol":{"A":9.45081,"B":3246.9,"C":273},"4-methyl-1,5-hexanediol":{"A":9.56529,"B":3396.12,"C":273},"5-methyl-1,5-hexanediol":{"A":9.48101,"B":3261.16,"C":273},"2-methyl-1,5-pentanediol":{"A":9.53875,"B":3307.6,"C":273},"3-methyl-1,5-pentanediol":{"A":9.61613,"B":3511.8,"C":273},"3-methyl-1,6-hexanediol":{"A":9.6387,"B":3279.47,"C":273},"2-methyl-1-butanethiol":{"A":7.07323,"B":1438.31,"C":224.075},"3-methyl-1-butanethiol":{"A":6.76876,"B":1261.91,"C":206.224},"2-methyl-1-butanol":{"A":7.43675,"B":1395.79,"C":177.668},"3-methyl-1-butanol":{"A":7.50977,"B":1559.43,"C":205.685},"2-methyl-1-butene":{"A":6.9903,"B":1118.31,"C":240.98},"3-methyl-1-butene":{"A":7.0492,"B":1117.71,"C":248.08},"2-methyl-1-butene-3-yne":{"A":6.92374,"B":1110.19,"C":242.35},"3-methyl-1-butyne":{"A":7.23284,"B":1184.88,"C":243.26},"2-methyl-1-decene":{"A":7.11965,"B":1667.84,"C":202.767},"2-methyl-1-dodecene":{"A":7.19556,"B":1839.61,"C":195.053},"1-methyl-1-ethylcyclohexane":{"A":7.04666,"B":1592.23,"C":230.051},"1-methyl-1-ethylcyclopentane":{"A":7.21303,"B":1573.21,"C":241.621},"1-methyl-1-ethylcyclopropane":{"A":6.95009,"B":1159.68,"C":228.214},"2-methyl-1-ethylnaphthalene":{"A":7.279,"B":2055.64,"C":194.383},"methyl-1-ethylpropylamine":{"A":6.94496,"B":1182.68,"C":187.003},"2-methyl-1-heptadecene":{"A":7.31191,"B":2189.63,"C":179.15},"2-methyl-1-heptanol":{"A":8.3426,"B":2344.8,"C":253.71},"3-methyl-1-heptanol":{"A":8.25743,"B":2311.67,"C":243.95},"4-methyl-1-heptanol":{"A":8.25322,"B":2293.32,"C":243.671},"5-methyl-1-heptanol":{"A":7.95729,"B":2018.72,"C":211.061},"6-methyl-1-heptanol":{"A":7.67593,"B":1763.38,"C":180.045},"2-methyl-1-heptene":{"A":7.07956,"B":1448.12,"C":225.593},"3-methyl-1-heptene":{"A":7.03175,"B":1381.24,"C":221.753},"4-methyl-1-heptene":{"A":7.03707,"B":1392.19,"C":222.163},"5-methyl-1-heptene":{"A":7.0398,"B":1396.3,"C":222.431},"6-methyl-1-heptene":{"A":7.03956,"B":1395.74,"C":222.416},"2-methyl-1-hexadecene":{"A":7.30228,"B":2131.15,"C":182},"2-methyl-1-hexanol":{"A":7.62555,"B":1642.6,"C":183.193},"3-methyl-1-hexanol":{"A":7.42439,"B":1506.24,"C":159.509},"4-methyl-1-hexanol":{"A":7.46454,"B":1542.97,"C":163.619},"5-methyl-1-hexanol":{"A":7.704,"B":1748.87,"C":190.596},"2-methyl-1-hexene":{"A":7.06007,"B":1357.85,"C":233.064},"3-methyl-1-hexene":{"A":7.05288,"B":1319.14,"C":232.284},"4-methyl-1-hexene":{"A":7.14435,"B":1400.33,"C":241.714},"5-methyl-1-hexene":{"A":6.97852,"B":1268.49,"C":224.251},"3-methyl-1-hexyne":{"A":6.88617,"B":1210.72,"C":217.275},"4-methyl-1-hexyne":{"A":6.88592,"B":1230.8,"C":216.308},"5-methyl-1-hexyne":{"A":6.8861,"B":1233.82,"C":216.197},"1-methyl-1-isopropylcyclopentane":{"A":6.89912,"B":1442.09,"C":210.88},"2-methyl-1-isopropylnaphthalene":{"A":7.89318,"B":3035.91,"C":293.423},"methyl-1-methylbutylamine":{"A":6.9412,"B":1208.83,"C":184.452},"2-methyl-1-nonadecene":{"A":7.30164,"B":2281.24,"C":174.02},"2-methyl-1-nonanol":{"A":8.61882,"B":2840.31,"C":273},"4-methyl-1-nonanol":{"A":8.88007,"B":3050.97,"C":292.558},"5-methyl-1-nonanol":{"A":8.61879,"B":2793.54,"C":273},"7-methyl-1-nonanol":{"A":8.61879,"B":2793.54,"C":273},"3-methyl-1-nonanol":{"A":8.61879,"B":2793.54,"C":273},"2-methyl-1-nonene":{"A":7.0804,"B":1576.54,"C":207.004},"2-methyl-1-octadecene":{"A":7.3121,"B":2239.97,"C":176.49},"2-methyl-1-octanol":{"A":8.57328,"B":2691.68,"C":273},"3-methyl-1-octanol":{"A":8.57328,"B":2691.68,"C":273},"4-methyl-1-octanol":{"A":8.57328,"B":2691.68,"C":273},"5-methyl-1-octanol":{"A":8.57328,"B":2691.68,"C":273},"6-methyl-1-octanol":{"A":8.57329,"B":2726.7,"C":273},"7-methyl-1-octanol":{"A":8.57329,"B":2726.7,"C":273},"2-methyl-1-octene":{"A":7.04178,"B":1482,"C":211.517},"2-methyl-1-pentadecene":{"A":7.28454,"B":2065.52,"C":185.04},"2-methyl-1-pentanol":{"A":7.89558,"B":1844.53,"C":219.821},"3-methyl-1-pentanol":{"A":7.22812,"B":1389.6,"C":167.247},"4-methyl-1-pentanol":{"A":7.12665,"B":1312.92,"C":157.425},"2-methyl-1-pentene":{"A":6.96749,"B":1218.09,"C":235.963},"3-methyl-1-pentene":{"A":7.07154,"B":1245.54,"C":243.032},"4-methyl-1-pentene":{"A":7.00315,"B":1215.15,"C":240.912},"3-methyl-1-pentyne":{"A":6.85717,"B":1114.1,"C":222.482},"4-methyl-1-pentyne":{"A":6.85559,"B":1124.6,"C":221.764},"cis-(1-methyl-1-propenyl)benzene":{"A":7.01598,"B":1571.12,"C":205.94},"trans-(1-methyl-1-propenyl)benzene":{"A":7.01051,"B":1638.28,"C":202.007},"(2-methyl-1-propenyl)benzene":{"A":7.01225,"B":1616.25,"C":203.297},"1-methyl-1-propylcyclopentane":{"A":6.95411,"B":1455.23,"C":211.26},"2-methyl-1-propylnaphthalene":{"A":8.69093,"B":4211.46,"C":412.589},"2-methyl-1-tetradecene":{"A":7.26001,"B":1993.72,"C":188.27},"2-methyl-1-tridecene":{"A":7.39515,"B":1993.08,"C":191.5},"2-methyl-1-undecene":{"A":7.15844,"B":1755.52,"C":198.796},"methyl-2,2-dimethylpropylamine":{"A":6.82068,"B":1158.51,"C":183.579},"2-methyl-2,3-butanediol":{"A":9.33578,"B":2885.37,"C":273},"1-methyl-2,3-diethylbenzene":{"A":7.12204,"B":1723.41,"C":199.746},"2-methyl-2,3-pentadiene":{"A":6.90066,"B":1195.18,"C":225.32},"2-methyl-2,3-pentanediol":{"A":9.37249,"B":3282.26,"C":273},"3-methyl-2,3-pentanediol":{"A":9.37249,"B":3282.26,"C":273},"1-methyl-2,4-diethylbenzene":{"A":7.12246,"B":1718.08,"C":200.05},"2-methyl-2,4-hexanediol":{"A":9.4059,"B":3372.69,"C":273},"3-methyl-2,4-hexanediol":{"A":9.4909,"B":3508.9,"C":273},"4-methyl-2,4-hexanediol":{"A":9.4059,"B":3372.69,"C":273},"5-methyl-2,4-hexanediol":{"A":9.4909,"B":3508.9,"C":273},"2-methyl-2,4-pentanediol":{"A":9.37239,"B":3054.29,"C":273},"3-methyl-2,4-pentanediol":{"A":6.80996,"B":1158.1,"C":83.2459},"1-methyl-2,5-diethylbenzene":{"A":7.12191,"B":1725.07,"C":199.651},"2-methyl-2,5-hexanediol":{"A":9.4059,"B":3372.69,"C":273},"1-methyl-2,6-diethyl benzene":{"A":7.12148,"B":1730.74,"C":199.328},"1-methyl-2-(1-methylethenyl)benzene":{"A":7.08891,"B":1592.69,"C":206.282},"cis-1-methyl-2-(1-propenyl)benzene":{"A":7.05035,"B":1646.38,"C":202.44},"2-methyl-2-butanethiol":{"A":6.89364,"B":1290.08,"C":222.36},"3-methyl-2-butanethiol":{"A":7.01231,"B":1383.58,"C":225.124},"3-methyl-2-butanol":{"A":6.89288,"B":1154.86,"C":176.346},"2-methyl-2-butene":{"A":7.098,"B":1184.97,"C":242.425},"trans-2-methyl-2-butenoic acid":{"A":6.65803,"B":1199.04,"C":118.94},"cis-2-methyl-2-butenoic acid":{"A":6.70775,"B":1207.06,"C":130.413},"3-methyl-2-butenoic acid":{"A":6.727,"B":1250.36,"C":130.09},"1-methyl-2-butylbenzene":{"A":7.12979,"B":1731.38,"C":199.48},"1-methyl-2-sec-butylbenzene":{"A":7.07699,"B":1669.07,"C":201.76},"1-methyl-2-tert-butyl benzene":{"A":6.95995,"B":1637.22,"C":200.915},"2-methyl-2-ethyl-1,3-propanediol":{"A":9.45083,"B":3277.13,"C":273},"2-methyl-2-ethyl-1-butanol":{"A":7.25486,"B":1374.63,"C":157.27},"3-methyl-2-ethyl-1-butanol":{"A":7.77355,"B":1798.76,"C":205.638},"3-methyl-2-ethyl-1-butene":{"A":6.90882,"B":1239.76,"C":221.419},"1-methyl-2-ethyl-1-hexanol":{"A":8.50273,"B":2596.48,"C":273},"3-methyl-2-ethyl-1-hexanol":{"A":8.5301,"B":2646.23,"C":275.418},"4-methyl-2-ethyl-1-hexanol":{"A":8.50275,"B":2631.07,"C":273},"5-methyl-2-ethyl-1-hexanol":{"A":8.50274,"B":2618.98,"C":273},"2-methyl-2-ethyl-1-pentanol":{"A":7.60887,"B":1726.89,"C":188.143},"3-methyl-2-ethyl-1-pentanol":{"A":8.45081,"B":2505.66,"C":273},"4-methyl-2-ethyl-1-pentanol":{"A":7.81361,"B":1874.62,"C":203.533},"3-methyl-2-ethyl-1-pentene":{"A":6.91701,"B":1311.24,"C":213.37},"4-methyl-2-ethyl-1-pentene":{"A":6.94182,"B":1327.67,"C":216.631},"1-methyl-cis-2-ethylcyclohexane":{"A":6.86386,"B":1438.48,"C":205.051},"1-methyl-trans-2-ethylcyclohexane":{"A":6.8615,"B":1421.58,"C":205.419},"1-methyl-cis-2-ethylcyclopentane":{"A":6.93565,"B":1405.78,"C":218.642},"1-methyl-trans-2-ethylcyclopentane":{"A":6.94761,"B":1392.25,"C":221.146},"1-methyl-cis-2-ethylcyclopropane":{"A":6.93943,"B":1190.3,"C":226.268},"1-methyl-trans-2-ethylcyclopropane":{"A":6.94328,"B":1163.96,"C":227.855},"1-methyl-2-ethylnaphthalene":{"A":7.28826,"B":2077.74,"C":195.416},"4-methyl-2-ethylphenol":{"A":7.17063,"B":1661.88,"C":165},"3-methyl-2-ethylthiophene":{"A":7.09708,"B":1557.53,"C":208.41},"2-methyl-2-heptanol":{"A":7.47686,"B":1538.11,"C":177.959},"3-methyl-2-heptanol":{"A":8.4637,"B":2459.13,"C":274.376},"4-methyl-2-heptanol":{"A":7.91215,"B":1944.7,"C":214.918},"5-methyl-2-heptanol":{"A":8.14773,"B":2171.02,"C":240.298},"6-methyl-2-heptanol":{"A":7.75764,"B":1804.95,"C":198.206},"2-methyl-2-heptene":{"A":7.05896,"B":1450.88,"C":224.654},"3-methyl-cis-2-heptene":{"A":7.05859,"B":1448.35,"C":224.68},"3-methyl-trans-2-heptene":{"A":7.05859,"B":1448.35,"C":224.68},"4-methyl-cis-2-heptene":{"A":7.01426,"B":1385.39,"C":221.166},"4-methyl-trans-2-heptene":{"A":7.01426,"B":1385.39,"C":221.166},"5-methyl-cis-2-heptene":{"A":7.02922,"B":1412.53,"C":222.499},"5-methyl-trans-2-heptene":{"A":7.02922,"B":1412.53,"C":222.499},"6-methyl-cis-2-heptene":{"A":7.02543,"B":1405.67,"C":222.156},"6-methyl-trans-2-heptene":{"A":7.02543,"B":1405.67,"C":222.156},"2-methyl-2-hexanol":{"A":7.56106,"B":1573.52,"C":193.405},"3-methyl-2-hexanol":{"A":8.03712,"B":1995.65,"C":235.031},"4-methyl-2-hexanol":{"A":7.2193,"B":1301.26,"C":148.933},"5-methyl-2-hexanol":{"A":7.81367,"B":1788.52,"C":211.573},"3-methyl-2-hexanone":{"A":7.72556,"B":2000.88,"C":273},"4-methyl-2-hexanone":{"A":7.21533,"B":1515.46,"C":210.625},"5-methyl-2-hexanone":{"A":7.25964,"B":1590.91,"C":218.518},"2-methyl-2-hexene":{"A":7.00221,"B":1327.58,"C":226.709},"3-methyl-cis-2-hexene":{"A":7.00901,"B":1339.87,"C":227.305},"3-methyl-trans-2-hexene":{"A":7.00139,"B":1326.08,"C":226.639},"4-methyl-cis-2-hexene":{"A":6.95452,"B":1260.55,"C":223.124},"4-methyl-trans-2-hexene":{"A":6.95918,"B":1268.64,"C":223.505},"5-methyl-cis-2-hexene":{"A":6.96645,"B":1281.3,"C":224.11},"5-methyl-trans-2-hexene":{"A":6.9614,"B":1272.35,"C":223.695},"4-methyl-2-hexyne":{"A":6.8449,"B":1242.3,"C":213.849},"5-methyl-2-hexyne":{"A":6.84669,"B":1253.52,"C":213.616},"4-methyl-2-isobutyl-1-pentanol":{"A":8.47589,"B":2668.85,"C":273},"1-methyl-2-isobutylbenzene":{"A":7.07699,"B":1669.07,"C":201.76},"3-methyl-2-isopropyl-1-butanol":{"A":8.37846,"B":2451.95,"C":273},"3-methyl-2-isopropyl-1-butene":{"A":6.82481,"B":1237.38,"C":209.737},"4-methyl-2-isopropyl-1-hexanol":{"A":8.47588,"B":2652.06,"C":273},"5-methyl-2-isopropyl-1-hexanol":{"A":8.4822,"B":2722.28,"C":273},"4-methyl-2-isopropyl-1-pentanol":{"A":8.42617,"B":2550.87,"C":273},"1-methyl-cis-2-isopropylcyclopentane":{"A":6.88901,"B":1438.46,"C":210.88},"1-methyl-trans-2-isopropylcyclopentane":{"A":6.89117,"B":1416.5,"C":212.21},"3-methyl-2-isopropylnaphthalene":{"A":7.89318,"B":3035.91,"C":293.423},"3-methyl-2-isopropylphenol":{"A":7.1575,"B":1680.74,"C":165},"4-methyl-2-isopropylphenol":{"A":7.1575,"B":1680.74,"C":165},"5-methyl-2-isopropylphenol":{"A":7.16423,"B":1702.66,"C":165},"methyl-2-methylbutylamine":{"A":6.9412,"B":1208.83,"C":184.452},"2-methyl-2-nonanol":{"A":8.4747,"B":2723.39,"C":273},"3-methyl-2-nonanol":{"A":8.55074,"B":2760.4,"C":273},"5-methyl-2-nonanol":{"A":8.55074,"B":2760.4,"C":273},"6-methyl-2-nonanol":{"A":8.55074,"B":2760.4,"C":273},"7-methyl-2-nonanol":{"A":8.55074,"B":2760.4,"C":273},"8-methyl-2-nonanol":{"A":8.55074,"B":2760.4,"C":273},"2-methyl-2-octanol":{"A":8.42443,"B":2500.17,"C":273},"3-methyl-2-octanol":{"A":8.50271,"B":2551.5,"C":273},"5-methyl-2-octanol":{"A":8.50271,"B":2551.5,"C":273},"7-methyl-2-octanol":{"A":8.50271,"B":2551.5,"C":273},"4-methyl-2-pentanol":{"A":7.55995,"B":1625.62,"C":215.719},"2-methyl-2-pentanol":{"A":7.18816,"B":1283.65,"C":176.604},"3-methyl-2-pentanol":{"A":7.17326,"B":1316.3,"C":172.445},"3-methyl-2-pentanone":{"A":7.09264,"B":1420.94,"C":219.968},"4-methyl-2-pentanone":{"A":7.15329,"B":1421.73,"C":216.266},"3-methyl-trans-2-pentene":{"A":6.89621,"B":1180.05,"C":223.43},"2-methyl-2-pentene":{"A":6.9866,"B":1245.72,"C":236.107},"3-methyl-cis-2-pentene":{"A":7.05827,"B":1283.19,"C":239.469},"4-methyl-cis-2-pentene":{"A":6.98469,"B":1204.59,"C":237.146},"4-methyl-trans-2-pentene":{"A":7.01711,"B":1227.64,"C":238.197},"4-methyl-2-pentyne":{"A":6.81352,"B":1147.44,"C":218.638},"2-methyl-2-propyl-1,3-propanediol":{"A":9.48106,"B":3364.15,"C":273},"4-methyl-2-propyl-1-hexanol":{"A":8.55072,"B":2727.23,"C":273},"4-methyl-2-propyl-1-pentanol":{"A":8.50898,"B":2617.1,"C":273},"1-methyl-2-propylbenzene":{"A":7.43034,"B":1969.2,"C":247.906},"1-methyl-cis-2-propylcyclopentane":{"A":6.94184,"B":1472.49,"C":210.01},"1-methyl-trans-2-propylcyclopentane":{"A":6.94375,"B":1452.74,"C":211.19},"1-methyl-2-propylnaphthalene":{"A":8.14486,"B":3344.76,"C":323.135},"3-methyl-2-propylnaphthalene":{"A":8.04483,"B":3196.57,"C":306.748},"3-methyl-2-propylphenol":{"A":7.26114,"B":1869.74,"C":165},"4-methyl-2-propylphenol":{"A":7.27815,"B":1933.6,"C":165},"5-methyl-2-propylphenol":{"A":7.27815,"B":1933.6,"C":165},"3-methyl-2-thiahexane":{"A":7.00711,"B":1423.32,"C":205.939},"4-methyl-2-thiahexane":{"A":7.00923,"B":1428.66,"C":206.055},"5-methyl-2-thiahexane":{"A":7.00466,"B":1417.7,"C":205.782},"3-methyl-2-thiapentane":{"A":6.83558,"B":1258.24,"C":206.159},"4-methyl-2-thiapentane":{"A":6.86134,"B":1276.67,"C":208.229},"2-methyl-3,3-diethylheptane":{"A":6.87928,"B":1538.75,"C":181.835},"4-methyl-3,3-diethylheptane":{"A":6.882,"B":1547.8,"C":181.835},"2-methyl-3,3-diethylhexane":{"A":6.85594,"B":1485.5,"C":187.7},"1-methyl-3,4-diethylbenzene":{"A":7.12282,"B":1713.42,"C":200.316},"2-methyl-3,4-diethylheptane":{"A":6.92356,"B":1523.45,"C":181.835},"3-methyl-3,4-diethylheptane":{"A":6.87653,"B":1529.7,"C":181.835},"4-methyl-3,4-diethylheptane":{"A":6.87653,"B":1529.7,"C":181.835},"2-methyl-3,4-diethylhexane":{"A":6.90276,"B":1474.85,"C":187.7},"3-methyl-3,4-diethylhexane":{"A":6.85594,"B":1485.5,"C":187.7},"3-methyl-3,4-hexanediol":{"A":9.4059,"B":3372.69,"C":273},"1-methyl-3,5-diethylbenzene":{"A":7.12359,"B":1703.76,"C":200.867},"2-methyl-3,5-diethylheptane":{"A":6.92356,"B":1523.45,"C":181.835},"3-methyl-3,5-diethylheptane":{"A":6.87097,"B":1511.61,"C":181.835},"4-methyl-3,5-diethylheptane":{"A":6.9307,"B":1546.39,"C":181.835},"1-methyl-3-(1-methylethenyl)benzene":{"A":7.08531,"B":1634.92,"C":203.85},"cis-1-methyl-3-(1-propenyl)benzene":{"A":7.05035,"B":1646.38,"C":202.44},"2-methyl-3-butenoic acid":{"A":6.93065,"B":1376.94,"C":163.148},"3-methyl-3-butenoic acid":{"A":6.93888,"B":1380.51,"C":163.338},"1-methyl-3-butylbenzene":{"A":7.13057,"B":1721.36,"C":200.05},"1-methyl-3-sec-butylbenzene":{"A":7.07752,"B":1662.49,"C":202.14},"1-methyl-3-tert-butylbenzene":{"A":6.9628,"B":1601.36,"C":203.041},"2-methyl-3-ethyl-1,4-butanediol":{"A":9.56529,"B":3396.12,"C":273},"1-methyl-3-ethyl-1-hexanol":{"A":8.50274,"B":2614.2,"C":273},"2-methyl-3-ethyl-1-pentanol":{"A":8.4508,"B":2494.52,"C":273},"3-methyl-3-ethyl-1-pentanol":{"A":8.37086,"B":2458.72,"C":273},"4-methyl-3-ethyl-1-pentanol":{"A":8.4508,"B":2494.52,"C":273},"2-methyl-3-ethyl-1-pentene":{"A":7.04278,"B":1411.64,"C":229.177},"3-methyl-3-ethyl-1-pentene":{"A":6.83038,"B":1274.67,"C":210.736},"4-methyl-3-ethyl-1-pentene":{"A":6.91771,"B":1301.96,"C":215.016},"2-methyl-3-ethyl-2-hexanol":{"A":8.35368,"B":2468.27,"C":273},"2-methyl-3-ethyl-2-pentanol":{"A":7.44388,"B":1542.07,"C":180.146},"3-methyl-3-ethyl-2-pentanol":{"A":8.29869,"B":2345.13,"C":273},"4-methyl-3-ethyl-2-pentanol":{"A":8.37844,"B":2402.46,"C":273},"2-methyl-3-ethyl-2-pentene":{"A":6.88139,"B":1304.15,"C":208.99},"4-methyl-3-ethyl-cis-2-pentene":{"A":6.93583,"B":1350.33,"C":217.002},"4-methyl-3-ethyl-trans-2-pentene":{"A":6.92848,"B":1338.24,"C":216.32},"2-methyl-3-ethyl-3-heptanol":{"A":8.40584,"B":2574.66,"C":273},"5-methyl-3-ethyl-3-heptanol":{"A":8.40584,"B":2573.83,"C":273},"2-methyl-3-ethyl-3-hexanol":{"A":8.3537,"B":2501.66,"C":273},"4-methyl-3-ethyl-3-hexanol":{"A":8.35368,"B":2472.92,"C":273},"5-methyl-3-ethyl-3-hexanol":{"A":8.35366,"B":2435.42,"C":273},"2-methyl-3-ethyl-3-isopropylhexane":{"A":6.87515,"B":1525.18,"C":181.835},"2-methyl-3-ethyl-3-pentanol":{"A":8.29869,"B":2345.94,"C":273},"1-methyl-cis-3-ethylcyclohexane":{"A":6.90042,"B":1444.71,"C":211.416},"1-methyl-trans-3-ethylcyclohexane":{"A":6.84202,"B":1401.49,"C":202.805},"1-methyl-cis-3-ethylcyclopentane":{"A":6.93371,"B":1379.73,"C":219.331},"1-methyl-trans-3-ethylcyclopentane":{"A":6.964,"B":1406.31,"C":223.315},"1-methyl-3-ethylnaphthalene":{"A":7.19948,"B":1964.44,"C":181.872},"2-methyl-3-ethylnaphthalene":{"A":7.40725,"B":2222.98,"C":214.1},"2-methyl-3-ethylnonane":{"A":6.98272,"B":1570.35,"C":181.835},"3-methyl-3-ethylnonane":{"A":6.93115,"B":1562.76,"C":181.835},"4-methyl-3-ethylnonane":{"A":6.98128,"B":1565.7,"C":181.835},"5-methyl-3-ethylnonane":{"A":6.97984,"B":1561.05,"C":181.835},"2-methyl-3-ethyloctane":{"A":6.95851,"B":1507.53,"C":187.7},"3-methyl-3-ethyloctane":{"A":6.90687,"B":1503.33,"C":187.7},"4-methyl-3-ethyloctane":{"A":6.95993,"B":1512.13,"C":187.7},"3-methyl-3-ethylpentane":{"A":7.04885,"B":1456.81,"C":231.249},"2-methyl-3-ethylphenol":{"A":7.17761,"B":1684.34,"C":165},"4-methyl-3-ethylphenol":{"A":7.19089,"B":1728.34,"C":165},"2-methyl-3-ethylthiophene":{"A":7.09826,"B":1544.3,"C":209.17},"2-methyl-3-heptanol":{"A":7.85222,"B":1872.41,"C":209.037},"3-methyl-3-heptanol":{"A":7.71862,"B":1760.81,"C":202.968},"4-methyl-3-heptanol":{"A":8.74829,"B":2695.03,"C":303.916},"5-methyl-3-heptanol":{"A":8.5737,"B":2501.01,"C":285.723},"6-methyl-3-heptanol":{"A":8.45076,"B":2410.95,"C":273},"2-methyl-cis-3-heptene":{"A":7.00658,"B":1371.77,"C":220.489},"2-methyl-trans-3-heptene":{"A":6.98758,"B":1355.85,"C":218.15},"3-methyl-cis-3-heptene":{"A":7.05483,"B":1441.41,"C":224.33},"3-methyl-trans-3-heptene":{"A":7.05483,"B":1441.41,"C":224.33},"4-methyl-cis-3-heptene":{"A":7.05859,"B":1448.35,"C":224.68},"4-methyl-trans-3-heptene":{"A":7.05859,"B":1448.35,"C":224.68},"5-methyl-cis-3-heptene":{"A":7.00658,"B":1371.77,"C":220.489},"5-methyl-trans-3-heptene":{"A":7.00658,"B":1371.77,"C":220.489},"6-methyl-cis-3-heptene":{"A":7.01782,"B":1391.99,"C":221.474},"6-methyl-trans-3-heptene":{"A":7.04781,"B":1417.59,"C":225.194},"2-methyl-3-hexanol":{"A":7.57243,"B":1559.4,"C":187.38},"3-methyl-3-hexanol":{"A":7.61898,"B":1621.96,"C":199.517},"4-methyl-3-hexanol":{"A":8.39654,"B":2327.64,"C":273},"5-methyl-3-hexanol":{"A":8.06327,"B":2001.09,"C":238.127},"2-methyl-3-hexanone":{"A":7.30388,"B":1571.09,"C":222.203},"4-methyl-3-hexanone":{"A":7.72555,"B":1981.5,"C":273},"5-methyl-3-hexanone":{"A":7.72555,"B":1981.5,"C":273},"2-methyl-cis-3-hexene":{"A":6.95346,"B":1258.61,"C":223.041},"2-methyl-trans-3-hexene":{"A":6.95297,"B":1257.88,"C":222.997},"3-methyl-cis-3-hexene":{"A":6.92412,"B":1264.07,"C":217.231},"3-methyl-trans-3-hexene":{"A":6.9519,"B":1279.99,"C":220.868},"2-methyl-3-hexyne":{"A":6.84592,"B":1228.67,"C":214.669},"1-methyl-3-isobutylbenzene":{"A":7.07752,"B":1662.49,"C":202.14},"2-methyl-3-isopropyl-3-hexanol":{"A":8.33135,"B":2534.5,"C":273},"2-methyl-3-isopropyl-3-pentanol":{"A":8.27782,"B":2434.05,"C":273},"1-methyl-cis-3-isopropylcyclopentane":{"A":6.89086,"B":1419.64,"C":212.02},"1-methyl-trans-3-isopropylcyclopentane":{"A":6.89086,"B":1419.64,"C":212.02},"2-methyl-3-isopropylheptane":{"A":6.90178,"B":1471.67,"C":187.7},"1-methyl-3-isopropylnaphthalene":{"A":7.80195,"B":2905.61,"C":278.174},"2-methyl-3-isopropyloctane":{"A":6.925,"B":1528.04,"C":181.835},"2-methyl-3-isopropylphenol":{"A":7.22148,"B":1906.77,"C":165},"4-methyl-3-isopropylphenol":{"A":7.16327,"B":1699.49,"C":165},"methyl-3-methylbutylamine":{"A":6.94331,"B":1193.97,"C":185.901},"2-methyl-3-nonanol":{"A":8.55072,"B":2729.5,"C":273},"3-methyl-3-nonanol":{"A":8.47469,"B":2695.41,"C":273},"5-methyl-3-nonanol":{"A":8.55072,"B":2732.05,"C":273},"2-methyl-3-octanol":{"A":8.50272,"B":2569.21,"C":273},"3-methyl-3-octanol":{"A":8.42446,"B":2561.17,"C":273},"4-methyl-3-octanol":{"A":8.50272,"B":2579.61,"C":273},"6-methyl-3-octanol":{"A":8.50272,"B":2579.61,"C":273},"7-methyl-3-octanol":{"A":8.50272,"B":2579.61,"C":273},"2-methyl-3-pentanol":{"A":7.17751,"B":1306.1,"C":177.468},"3-methyl-3-pentanol":{"A":7.40879,"B":1473.55,"C":203.023},"1-methyl-3-propylbenzene":{"A":7.4265,"B":1952.01,"C":247.44},"1-methyl-cis-3-propylcyclopentane":{"A":6.94324,"B":1457.93,"C":210.88},"1-methyl-trans-3-propylcyclopentane":{"A":6.94324,"B":1457.93,"C":210.88},"2-methyl-3-propylphenol":{"A":7.23302,"B":1770.7,"C":165},"4-methyl-3-propylphenol":{"A":7.27815,"B":1933.6,"C":165},"2-methyl-3-thiahexane":{"A":7.06541,"B":1450.58,"C":214.597},"4-methyl-3-thiahexane":{"A":7.08037,"B":1469.65,"C":216.304},"5-methyl-3-thiahexane":{"A":7.06796,"B":1460.62,"C":214.614},"2-methyl-3-thiapentane":{"A":6.67507,"B":1153.47,"C":196.624},"2-methyl-4,4-diethylheptane":{"A":6.86673,"B":1498.05,"C":181.835},"3-methyl-4,4-diethylheptane":{"A":6.88064,"B":1543.27,"C":181.835},"2-methyl-4,4-diethylhexane":{"A":6.84644,"B":1454.19,"C":187.7},"3-methyl-4,4-diethylhexane":{"A":6.86124,"B":1503.41,"C":187.7},"2-methyl-4,5-diethylheptane":{"A":6.92066,"B":1514.28,"C":181.835},"3-methyl-4,5-diethylheptane":{"A":6.92786,"B":1537.21,"C":181.835},"1-methyl-4-(1-methylethenyl)benzene":{"A":7.08504,"B":1638.22,"C":203.66},"cis-1-methyl-4-(1-propenyl)benzene":{"A":7.04942,"B":1658.11,"C":201.76},"trans-1-methyl-4-(1-propenyl)benzene":{"A":7.04816,"B":1674.48,"C":200.81},"1-methyl-4-butylbenzene":{"A":7.13005,"B":1728.04,"C":199.67},"1-methyl-4-sec-butylbenzene":{"A":7.07673,"B":1672.37,"C":201.57},"1-methyl-4-tert-butylbenzene":{"A":6.96189,"B":1612.58,"C":202.376},"2-methyl-4-tert-butylheptane":{"A":6.80389,"B":1439.12,"C":181.835},"3-methyl-4-tert-butylheptane":{"A":6.81105,"B":1461.4,"C":181.835},"4-methyl-4-tert-butylheptane":{"A":6.7673,"B":1476.22,"C":181.835},"2-methyl-4-ethyl-3-hexanol":{"A":8.43197,"B":2508.29,"C":273},"3-methyl-4-ethyl-3-hexanol":{"A":8.35368,"B":2472.92,"C":273},"2-methyl-4-ethyl-3-isopropylhexane":{"A":6.91626,"B":1500.52,"C":181.835},"1-methyl-cis-4-ethylcyclohexane":{"A":6.76719,"B":1334.33,"C":192.336},"1-methyl-trans-4-ethylcyclohexane":{"A":7.05785,"B":1592.63,"C":233.283},"1-methyl-4-ethylnaphthalene":{"A":7.1896,"B":1956.82,"C":180.146},"2-methyl-4-ethylnaphthalene":{"A":7.30903,"B":2094.43,"C":198.973},"2-methyl-4-ethylnonane":{"A":6.97839,"B":1556.4,"C":181.835},"3-methyl-4-ethylnonane":{"A":6.98272,"B":1570.35,"C":181.835},"4-methyl-4-ethylnonane":{"A":6.92413,"B":1539.84,"C":181.835},"5-methyl-4-ethylnonane":{"A":6.97984,"B":1561.05,"C":181.835},"2-methyl-4-ethyloctane":{"A":6.9499,"B":1479.93,"C":187.7},"3-methyl-4-ethyloctane":{"A":6.95851,"B":1507.53,"C":187.7},"4-methyl-4-ethyloctane":{"A":6.89899,"B":1477.48,"C":187.7},"2-methyl-4-ethylphenol":{"A":7.17851,"B":1687.28,"C":165},"3-methyl-4-ethylphenol":{"A":7.18209,"B":1699,"C":165},"2-methyl-4-ethyl thiophene":{"A":7.09649,"B":1564.14,"C":208.03},"3-methyl-4-ethyl thiophene":{"A":6.97206,"B":1535.05,"C":209.702},"2-methyl-4-heptanol":{"A":7.74252,"B":1768.07,"C":197.572},"3-methyl-4-heptanol":{"A":8.43894,"B":2425.81,"C":271.744},"4-methyl-4-heptanol":{"A":7.72914,"B":1770.52,"C":204.081},"1-methyl-4-isobutylbenzene":{"A":7.07699,"B":1669.07,"C":201.76},"2-methyl-4-isopropylheptane":{"A":6.89275,"B":1443.1,"C":187.7},"3-methyl-4-isopropylheptane":{"A":6.89993,"B":1465.77,"C":187.7},"4-methyl-4-isopropylheptane":{"A":6.84781,"B":1458.67,"C":187.7},"1-methyl-4-isopropylnaphthalene":{"A":8.03471,"B":3243.56,"C":317.079},"2-methyl-4-isopropyloctane":{"A":6.91626,"B":1500.52,"C":181.835},"3-methyl-4-isopropyloctane":{"A":6.92356,"B":1523.45,"C":181.835},"4-methyl-4-isopropyloctane":{"A":6.87237,"B":1516.13,"C":181.835},"2-methyl-4-isopropylphenol":{"A":5.8197,"B":768.23,"C":31.4019},"3-methyl-4-isopropylphenol":{"A":7.17063,"B":1723.86,"C":165},"2-methyl-4-nonanol":{"A":8.55072,"B":2732.05,"C":273},"4-methyl-4-nonanol":{"A":8.47469,"B":2695.41,"C":273},"5-methyl-4-nonanol":{"A":8.55072,"B":2732.05,"C":273},"7-methyl-4-nonanol":{"A":8.55072,"B":2732.05,"C":273},"2-methyl-4-octanol":{"A":8.50272,"B":2569.21,"C":273},"3-methyl-4-octanol":{"A":8.5027,"B":2546.72,"C":273},"4-methyl-4-octanol":{"A":8.42444,"B":2516.81,"C":273},"5-methyl-4-octanol":{"A":8.50271,"B":2557.12,"C":273},"6-methyl-4-octanol":{"A":8.50271,"B":2557.12,"C":273},"7-methyl-4-octanol":{"A":8.50271,"B":2557.12,"C":273},"1-methyl-4-propylbenzene":{"A":7.19301,"B":1743.52,"C":223.943},"2-methyl-4-propylheptane":{"A":6.94697,"B":1470.73,"C":187.7},"3-methyl-4-propylheptane":{"A":6.95423,"B":1493.72,"C":187.7},"4-methyl-4-propylheptane":{"A":6.89618,"B":1468.42,"C":187.7},"2-methyl-4-propyloctane":{"A":6.96806,"B":1523.87,"C":181.835},"3-methyl-4-propyloctane":{"A":6.97693,"B":1551.75,"C":181.835},"4-methyl-4-propyloctane":{"A":6.91841,"B":1521.51,"C":181.835},"2-methyl-4-propylphenol":{"A":7.23324,"B":1771.44,"C":165},"3-methyl-4-propylphenol":{"A":7.26114,"B":1869.74,"C":165},"2-methyl-5,5-diethylheptane":{"A":6.87237,"B":1516.13,"C":181.835},"3-methyl-5,5-diethylheptane":{"A":6.87376,"B":1520.66,"C":181.835},"4-methyl-5-ethyl-3-heptanol":{"A":8.48214,"B":2609.38,"C":273},"1-methyl-5-ethylnaphthalene":{"A":7.15085,"B":1899.15,"C":174.762},"2-methyl-5-ethylnaphthalene":{"A":7.18995,"B":1942.91,"C":180.881},"2-methyl-5-ethylnonane":{"A":6.97547,"B":1547.11,"C":181.835},"3-methyl-5-ethylnonane":{"A":6.974,"B":1542.46,"C":181.835},"4-methyl-5-ethylnonane":{"A":6.97839,"B":1556.4,"C":181.835},"5-methyl-5-ethylnonane":{"A":6.92271,"B":1535.26,"C":181.835},"2-methyl-5-ethyloctane":{"A":6.95279,"B":1489.12,"C":187.7},"3-methyl-5-ethyloctane":{"A":6.9499,"B":1479.93,"C":187.7},"4-methyl-5-ethyloctane":{"A":6.95567,"B":1498.32,"C":187.7},"2-methyl-5-ethylphenol":{"A":7.17866,"B":1687.76,"C":165},"3-methyl-5-ethylphenol":{"A":7.19089,"B":1728.34,"C":165},"3-methyl-5-ethylthiophene":{"A":7.0991,"B":1535.05,"C":209.702},"2-methyl-5-ethyl thiophene":{"A":7.09734,"B":1554.55,"C":208.581},"2-methyl-5-isopropyloctane":{"A":6.91773,"B":1505.11,"C":181.835},"3-methyl-5-isopropyloctane":{"A":6.9192,"B":1509.69,"C":181.835},"4-methyl-5-isopropyloctane":{"A":6.92211,"B":1518.86,"C":181.835},"2-methyl-5-isopropylphenol":{"A":7.17085,"B":1724.6,"C":165},"3-methyl-5-isopropylphenol":{"A":7.17663,"B":1744.1,"C":165},"2-methyl-5-nonanol":{"A":8.55072,"B":2732.05,"C":273},"3-methyl-5-nonanol":{"A":8.55072,"B":2732.05,"C":273},"5-methyl-5-nonanol":{"A":7.81933,"B":2099.66,"C":223.16},"2-methyl-5-propyloctane":{"A":6.96806,"B":1523.87,"C":181.835},"3-methyl-5-propyloctane":{"A":6.97253,"B":1537.81,"C":181.835},"4-methyl-5-propyloctane":{"A":6.97547,"B":1547.11,"C":181.835},"2-methyl-5-propylphenol":{"A":7.23302,"B":1770.7,"C":165},"3-methyl-5-propylphenol":{"A":7.25589,"B":1850.66,"C":165},"1-methyl-6-ethylnaphthalene":{"A":7.08391,"B":1835.44,"C":163.688},"2-methyl-6-ethylnaphthalene":{"A":7.2996,"B":2068.06,"C":198.005},"2-methyl-6-ethylnonane":{"A":6.97839,"B":1556.4,"C":181.835},"3-methyl-6-ethylnonane":{"A":6.97984,"B":1561.05,"C":181.835},"4-methyl-6-ethylnonane":{"A":6.97547,"B":1547.11,"C":181.835},"2-methyl-6-ethyloctane":{"A":6.95851,"B":1507.53,"C":187.7},"3-methyl-6-ethyloctane":{"A":6.95851,"B":1507.53,"C":187.7},"4-methyl-6-ethyloctane":{"A":6.95567,"B":1498.32,"C":187.7},"2-methyl-6-ethylphenol":{"A":7.15755,"B":1620.88,"C":165},"3-methyl-6-ethylphenol":{"A":7.17338,"B":1670.67,"C":165},"1-methyl-6-isopropylnaphthalene":{"A":8.03471,"B":3243.56,"C":317.079},"2-methyl-6-isopropylphenol":{"A":6.3495,"B":1093.05,"C":89.6205},"2-methyl-6-propylphenol":{"A":7.23302,"B":1770.7,"C":165},"1-methyl-7-ethylnaphthalene":{"A":7.34074,"B":2120.02,"C":204.35},"2-methyl-7-ethylnaphthalene":{"A":7.2996,"B":2068.06,"C":198.005},"2-methyl-7-ethylnonane":{"A":6.98415,"B":1575,"C":181.835},"3-methyl-7-ethylnonane":{"A":6.98128,"B":1565.7,"C":181.835},"4-methyl-7-ethylnonane":{"A":6.98128,"B":1565.7,"C":181.835},"1-methyl-7-isopropylnaphthalene":{"A":7.05887,"B":1843.91,"C":160.333},"1-methyl-8-ethylnaphthalene":{"A":7.33925,"B":2133.84,"C":203.608},"2-methyl-8-ethylnaphthalene":{"A":7.18995,"B":1942.91,"C":180.881},"2-methyl-8-isopropylnaphthalene":{"A":7.08735,"B":1878.83,"C":164.644},"methyl-butylamine":{"A":7.00538,"B":1158.82,"C":189.857},"methyl-sec-butylamine":{"A":6.93168,"B":1096.24,"C":192.118},"methyl-tert-butylamine":{"A":6.89149,"B":1068.41,"C":193.391},"1-methyl-cis-decahydronaphthalene":{"A":6.90657,"B":1754.55,"C":192.83},"1-methyl-trans-decahydronaphthalene":{"A":6.90824,"B":1729.18,"C":194.35},"2-methyl-cis-decahydronaphthalene":{"A":6.91243,"B":1668.93,"C":197.96},"2-methyl-trans-decahydronaphthalene":{"A":6.9143,"B":1643.57,"C":199.48},"4a-methyl-cis-decahydronaphthalene":{"A":6.91266,"B":1665.76,"C":198.15},"4a-methyl-trans-decahydronaphthalene":{"A":6.91501,"B":1634.05,"C":200.05},"methyl-propylamine":{"A":6.98544,"B":1062.68,"C":195.899},"1-methyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.07391,"B":1751.37,"C":197.088},"2-methyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.07405,"B":1749.42,"C":197.2},"methyl 1,1-dimethylpropyl ether":{"A":6.85338,"B":1177.07,"C":210},"methyl 1,2-dimethylpropyl ether":{"A":6.90692,"B":1179.65,"C":210},"methyl 1-ethylpropyl ether":{"A":6.96815,"B":1218.03,"C":210},"methyl 1-methylbutyl ether":{"A":6.9727,"B":1231.66,"C":210},"methyl 2,2-dimethylpropyl ether":{"A":6.84847,"B":1162.52,"C":210},"methyl 2-methylbutyl ether":{"A":6.97119,"B":1227.11,"C":210},"methyl 3-methylbutyl ether":{"A":6.97119,"B":1227.11,"C":210},"N-methylacetamide":{"A":7.41637,"B":1829.08,"C":198.275},"methyl acetate":{"A":7.28036,"B":1276.29,"C":233.155},"methyl acetoacetate":{"A":7.53543,"B":1813.98,"C":218.017},"methylacetylene":{"A":7.11874,"B":923.311,"C":241.079},"methyl acrylate":{"A":7.29607,"B":1387.88,"C":234.137},"methylal":{"A":7.16103,"B":1197.95,"C":238.031},"methylamine":{"A":7.36379,"B":1025.4,"C":235.062},"N-methylaniline":{"A":7.74401,"B":2085.01,"C":232.863},"methyl benzoate":{"A":7.3207,"B":1825.16,"C":211.583},"2-methylbenzofuran":{"A":7.22082,"B":1766.5,"C":209.527},"1-methylbiphenyl":{"A":7.19863,"B":1924.86,"C":190.493},"3-methylbiphenyl":{"A":7.19885,"B":1985.81,"C":187.187},"4-methylbiphenyl":{"A":7.23977,"B":1995.09,"C":187.7},"methyl bromide":{"A":7.34062,"B":1146.12,"C":253.43},"2-methylbutanal":{"A":7.17,"B":1316.78,"C":215},"3-methylbutanal":{"A":7.17084,"B":1319.61,"C":215},"2-methylbutanenitrile":{"A":6.89173,"B":1223.31,"C":179.596},"3-methylbutanenitrile":{"A":6.8899,"B":1237.49,"C":178.172},"methyl butanoate":{"A":7.20355,"B":1402.13,"C":221.612},"3-methylbutanoic acid":{"A":7.69432,"B":1822.54,"C":203.53},"1-methylbutyl acetate":{"A":6.94421,"B":1275.46,"C":180.889},"2-methylbutyl acetate":{"A":6.94136,"B":1295.27,"C":178.989},"1-methylbutylamine":{"A":6.95763,"B":1145.45,"C":189.268},"2-methylbutylamine":{"A":6.96309,"B":1156.53,"C":187.805},"3-methylbutylamine":{"A":6.96096,"B":1160.26,"C":187.368},"1-methylbutyl butanoate":{"A":7.38164,"B":1606.79,"C":174.999},"2-methylbutyl butanoate":{"A":7.09876,"B":1485.13,"C":173.099},"3-methylbutyl butanoate":{"A":7.67441,"B":2015.89,"C":241.539},"methyl butyl ether":{"A":7.10128,"B":1182.58,"C":210},"methyl sec-butyl ether":{"A":7.15243,"B":1273.31,"C":239.086},"methyl tert-butyl ether":{"A":7.07597,"B":1233.7,"C":238.879},"1-methylbutyl formate":{"A":6.87062,"B":1206.71,"C":181.839},"2-methylbutyl formate":{"A":6.82506,"B":1190.68,"C":181.269},"1-methylbutyl propanoate":{"A":7.36008,"B":1543.28,"C":177.469},"2-methylbutyl propanoate":{"A":7.12228,"B":1451.68,"C":175.189},"methyl butyl sulfide":{"A":7.14399,"B":1490.96,"C":226.299},"2-methylbutyric acid":{"A":7.68526,"B":1883.34,"C":215},"methyl chloride":{"A":7.15229,"B":963.608,"C":249.811},"methyl chloroacetate":{"A":7.40326,"B":1554.93,"C":214.006},"methyl chloroformate":{"A":7.44868,"B":1364.54,"C":227.876},"methyl chlorosilane":{"A":7.04725,"B":1054.78,"C":244.46},"methyl cyanoacetate":{"A":7.53151,"B":1895.57,"C":202.5},"methylcyclobutane":{"A":6.94406,"B":1070.84,"C":233.243},"methylcyclohexane":{"A":7.00107,"B":1375.13,"C":232.819},"1-methylcyclohexanol":{"A":7.66323,"B":1686.73,"C":195.694},"cis-2-methylcyclohexanol":{"A":8.10339,"B":2130.94,"C":243.025},"trans-2-methylcyclohexanol":{"A":8.03432,"B":2068.83,"C":234.941},"cis-3-methylcyclohexanol":{"A":7.70311,"B":1761.78,"C":197.34},"trans-3-methylcyclohexanol":{"A":7.74609,"B":1790.81,"C":200.079},"cis-4-methylcyclohexanol":{"A":7.51059,"B":1600.23,"C":174.638},"trans-4-methylcyclohexanol":{"A":7.56987,"B":1652.14,"C":181.341},"1-methylcyclohexene":{"A":6.90891,"B":1322.59,"C":218.044},"3-methylcyclohexene":{"A":6.91169,"B":1297.95,"C":219.531},"4-methylcyclohexene":{"A":6.91159,"B":1298.8,"C":219.48},"N-methylcyclohexylamine":{"A":7.21504,"B":1577.43,"C":215.096},"methylcyclopentadiene":{"A":7.16296,"B":1344.84,"C":241.277},"methylcyclopentane":{"A":7.06372,"B":1304.45,"C":240.043},"1-methylcyclopentene":{"A":6.93473,"B":1234.35,"C":228.685},"3-methylcyclopentene":{"A":7.24211,"B":1452.03,"C":262.926},"4-methylcyclopentene":{"A":6.98436,"B":1257.37,"C":231.251},"methylcyclopropane":{"A":6.97325,"B":980.512,"C":238.861},"2-methyldecane":{"A":7.0205,"B":1560.21,"C":187.7},"3-methyldecane":{"A":7.02164,"B":1563.99,"C":187.7},"4-methyldecane":{"A":7.01869,"B":1554.19,"C":187.7},"5-methyldecane":{"A":7.01601,"B":1545.32,"C":187.7},"methyldecylamine":{"A":6.65525,"B":1211.31,"C":94.7237},"methyl decyl sulfide":{"A":7.09661,"B":1759.04,"C":170.4},"methyl dichlorosilane":{"A":7.23413,"B":1272.21,"C":250.69},"methyl diethanolamine":{"A":8.74332,"B":2501.48,"C":179.692},"methyldiethylamine":{"A":6.83838,"B":1030.8,"C":194.462},"methyldiisopropylamine":{"A":6.80578,"B":1162.39,"C":184.154},"2-methyldiphenylmethane":{"A":7.20293,"B":2015,"C":185.705},"3-methyldiphenylmethane":{"A":7.20318,"B":2010.7,"C":185.945},"4-methyldiphenylmethane":{"A":7.20264,"B":2019.97,"C":185.428},"methyldipropylamine":{"A":6.92018,"B":1208.86,"C":185.17},"methyldocosylamine":{"A":6.56977,"B":1645.8,"C":54.1411},"2-methyldodecane":{"A":7.05546,"B":1685.39,"C":174.22},"3-methyldodecane":{"A":7.05661,"B":1689.2,"C":174.22},"methyl dodecanoate":{"A":7.33074,"B":1992.81,"C":180.98},"methyldodecylamine":{"A":6.95296,"B":1544.49,"C":118.283},"methyl dodecyl sulfide":{"A":7.13871,"B":1863.9,"C":157.9},"methyldotriacontylamine":{"A":8.9459,"B":4555.79,"C":273.15},"methyleicosylamine":{"A":6.91462,"B":1870.01,"C":93.5845},"2-methylenebutanoic acid":{"A":6.82278,"B":1270.53,"C":142.308},"(1-methylenepropyl)benzene":{"A":7.02158,"B":1600.08,"C":204.42},"methylethanolamine":{"A":7.69194,"B":1731.91,"C":201.98},"methylethyl-sec-butylamine":{"A":6.86671,"B":1157.66,"C":187.438},"methylethyl-tert-butylamine":{"A":6.74447,"B":1135.47,"C":183.885},"methylethylamine":{"A":6.86968,"B":943.96,"C":200.649},"methylethylbutylamine":{"A":6.91904,"B":1217.03,"C":184.379},"methyl ethyl ether":{"A":6.62951,"B":760.22,"C":195.446},"methylethylisobutylamine":{"A":6.86509,"B":1168.74,"C":186.338},"methylethylisopropylamine":{"A":6.81952,"B":1103.08,"C":188.56},"methyl ethyl ketone":{"A":7.29427,"B":1400.37,"C":237.655},"methylethylpropylamine":{"A":6.87728,"B":1122.49,"C":189.371},"methyl ethyl sulfide":{"A":6.98835,"B":1211.78,"C":228.013},"methyl fluoride":{"A":7.17217,"B":755.926,"C":254.481},"N-methylformamide":{"A":7.49425,"B":1885,"C":209.081},"methyl formate":{"A":7.26545,"B":1178.19,"C":236.959},"2-methylfuran":{"A":7.17114,"B":1275.53,"C":232.604},"3-methylfuran":{"A":6.99595,"B":1133.72,"C":210},"methylglutaronitrile":{"A":7.62007,"B":2204.98,"C":202.259},"methylheneicosylamine":{"A":6.75141,"B":1764.54,"C":74.8838},"methylhentriacontylamine":{"A":8.94899,"B":4509.57,"C":273.15},"methylheptacosylamine":{"A":6.01047,"B":1400,"C":9.33333},"2-methylheptadecane":{"A":7.06388,"B":1904.55,"C":143.3},"3-methylheptadecane":{"A":7.0654,"B":1909.43,"C":143.3},"methylheptadecylamine":{"A":7.53255,"B":2335.59,"C":168.091},"methyl heptadecyl sulfide":{"A":7.13143,"B":2069.41,"C":135},"2-methylheptane":{"A":7.12709,"B":1473.84,"C":229.44},"3-methylheptane":{"A":7.12293,"B":1477.48,"C":229.359},"4-methylheptane":{"A":7.12417,"B":1473.51,"C":229.542},"methylheptatriacontylamine":{"A":8.97849,"B":4781.49,"C":273.15},"methylheptylamine":{"A":7.08179,"B":1428.49,"C":175.037},"methyl heptyl sulfide":{"A":7.08052,"B":1717.84,"C":220.489},"methylhexacosylamine":{"A":5.95598,"B":1350,"C":9},"2-methylhexadecane":{"A":7.07554,"B":1871.69,"C":149.2},"3-methylhexadecane":{"A":7.07706,"B":1876.56,"C":149.2},"methylhexadecylamine":{"A":7.54861,"B":2317.61,"C":175.511},"methyl hexadecyl sulfide":{"A":7.25728,"B":2069.41,"C":135},"2-methylhexane":{"A":7.0583,"B":1340.21,"C":230.768},"3-methylhexane":{"A":7.08748,"B":1370.78,"C":234.008},"methylhexatriacontylamine":{"A":8.96561,"B":4740.97,"C":273.15},"methylhexylamine":{"A":7.04774,"B":1339.28,"C":179.407},"methyl hexyl sulfide":{"A":7.05063,"B":1575.03,"C":210.873},"2-methylindene":{"A":7.08766,"B":1657.67,"C":209.192},"1-methylindene":{"A":7.10152,"B":1711.34,"C":206.962},"methyl iodide":{"A":7.33367,"B":1316.43,"C":253.207},"methylisobutylamine":{"A":6.93253,"B":1094.01,"C":193.011},"methyl isobutyl ether":{"A":7.1429,"B":1261.86,"C":237.516},"methyl isocyanate":{"A":7.05663,"B":1162.78,"C":239.607},"methyl isocyanide":{"A":6.83764,"B":995.205,"C":192.506},"methyl isopropenyl ketone":{"A":7.12747,"B":1390.61,"C":229.46},"methylisopropylamine":{"A":6.36271,"B":676.394,"C":143.86},"methyl isopropyl ether":{"A":7.17957,"B":1184.12,"C":244.686},"methyl isopropyl ketone":{"A":7.04182,"B":1260.87,"C":208.621},"methyl isopropyl sulfide":{"A":7.06781,"B":1326.81,"C":232.139},"methyl mercaptan":{"A":7.07246,"B":1008.88,"C":234.729},"methyl methacrylate":{"A":6.95921,"B":1254.41,"C":207.274},"1-methylnaphthalene":{"A":7.26987,"B":2027.9,"C":217.356},"2-methylnaphthalene":{"A":7.03802,"B":1805.88,"C":193.348},"methylnonacosylamine":{"A":8.92886,"B":4403.89,"C":273.15},"2-methylnonadecane":{"A":7.01251,"B":1946.44,"C":132.1},"3-methylnonadecane":{"A":7.01404,"B":1951.3,"C":132.1},"methylnonadecylamine":{"A":7.55403,"B":2442.39,"C":163.637},"methyl nonadecyl sulfide":{"A":7.18259,"B":2111.53,"C":119.001},"2-methylnonane":{"A":7.12921,"B":1599.75,"C":209.553},"3-methylnonane":{"A":7.17549,"B":1649.33,"C":216.241},"4-methylnonane":{"A":7.26574,"B":1726.16,"C":227.957},"5-methylnonane":{"A":7.17032,"B":1641.14,"C":217.443},"methylnonatriacontylamine":{"A":8.985,"B":4859.85,"C":273.15},"methylnonylamine":{"A":7.1562,"B":1601.18,"C":167.513},"methyl nonyl sulfide":{"A":7.16824,"B":1809.06,"C":195.094},"methyloctacosylamine":{"A":6.056,"B":1450,"C":9.66667},"2-methyloctadecane":{"A":7.04321,"B":1929.69,"C":137.6},"3-methyloctadecane":{"A":7.04474,"B":1934.56,"C":137.6},"methyloctadecylamine":{"A":7.59025,"B":2435.39,"C":170.13},"methyl octadecyl sulfide":{"A":7.20937,"B":2103.03,"C":124},"2-methyloctane":{"A":7.13732,"B":1553.89,"C":221.781},"3-methyloctane":{"A":7.17567,"B":1594.94,"C":227.131},"4-methyloctane":{"A":7.18954,"B":1601.06,"C":229.145},"methyloctatriacontylamine":{"A":8.99068,"B":4827.71,"C":273.15},"methyloctylamine":{"A":7.11847,"B":1516.17,"C":171.085},"methyl octyl sulfide":{"A":7.15298,"B":1737.33,"C":199.813},"methyl oleate":{"A":7.84266,"B":2556.27,"C":171.334},"methylpentacosylamine":{"A":5.90641,"B":1300,"C":8.66667},"2-methylpentadecane":{"A":7.07426,"B":1828.55,"C":154.45},"3-methylpentadecane":{"A":7.07487,"B":1830.5,"C":154.45},"methylpentadecylamine":{"A":7.5557,"B":2283.57,"C":181.476},"methyl pentadecyl sulfide":{"A":7.22342,"B":2014.32,"C":140},"2-methylpentanal":{"A":7.18264,"B":1398.09,"C":208},"3-methylpentanal":{"A":7.18968,"B":1421.93,"C":208},"4-methylpentanal":{"A":7.18968,"B":1421.93,"C":208},"2-methylpentane":{"A":7.07893,"B":1274.64,"C":243.362},"3-methylpentane":{"A":7.07774,"B":1282.36,"C":242.278},"2-methylpentanenitrile":{"A":6.9354,"B":1309.08,"C":175.865},"3-methylpentanenitrile":{"A":6.93341,"B":1326.1,"C":174.222},"4-methylpentanenitrile":{"A":6.93308,"B":1328.93,"C":173.948},"methylpentatriacontylamine":{"A":8.96713,"B":4693.46,"C":273.15},"methylpentylamine":{"A":7.01922,"B":1248.59,"C":184.309},"methyl pentyl ether":{"A":7.03909,"B":1284.91,"C":210},"methyl tert-pentyl ether":{"A":7.0937,"B":1361.9,"C":236.97},"methyl pentyl sulfide":{"A":6.96487,"B":1321.44,"C":195.551},"methyl phenyl sulfide":{"A":7.11404,"B":1673.52,"C":202.33},"methyl propanoate":{"A":7.22919,"B":1333.79,"C":227.283},"methyl propyl ether":{"A":6.98441,"B":1084.66,"C":225.749},"methylpropylisopropylamine":{"A":6.86278,"B":1184.95,"C":184.729},"methyl propyl ketone":{"A":7.3543,"B":1548.1,"C":243.751},"methyl propyl sulfate":{"A":7.16586,"B":1780.2,"C":204.905},"methyl propyl sulfide":{"A":7.08299,"B":1355.32,"C":226.969},"2-methylpyridine":{"A":7.15496,"B":1505.99,"C":222.949},"3-methylpyridine":{"A":7.10475,"B":1521.86,"C":216.154},"4-methylpyridine":{"A":7.24381,"B":1612.96,"C":224.341},"N-methylpyrrole":{"A":6.99512,"B":1345.77,"C":214.356},"N-methylpyrrolidine":{"A":7.09753,"B":1339.57,"C":238.53},"2-methylquinoline":{"A":6.64644,"B":1496.63,"C":150.846},"3-methylquinoline":{"A":7.3893,"B":2057,"C":203.951},"4-methylquinoline":{"A":7.20782,"B":1899.06,"C":173.224},"5-methylquinoline":{"A":7.00516,"B":1659.08,"C":142.265},"6-methylquinoline":{"A":7.37567,"B":2090.93,"C":200.092},"7-methylquinoline":{"A":7.25586,"B":1924.93,"C":182.249},"8-methylquinoline":{"A":7.31931,"B":1960.24,"C":193.724},"methyl salicylate":{"A":7.55785,"B":1854.43,"C":175.998},"methyl silane":{"A":7.10688,"B":873.39,"C":263.567},"alpha-methylstyrene":{"A":7.12904,"B":1641.01,"C":220.782},"m-methylstyrene":{"A":7.23895,"B":1742.14,"C":228.144},"p-methylstyrene":{"A":7.09,"B":1630.34,"C":214.55},"3-methyl sulfolane":{"A":7.40961,"B":2174.62,"C":204.177},"methyltetracosylamine":{"A":6.15815,"B":1369.86,"C":6.97904},"2-methyltetradecane":{"A":7.07676,"B":1789.91,"C":161.38},"3-methyltetradecane":{"A":7.07838,"B":1795.22,"C":161.38},"methyltetradecylamine":{"A":7.35711,"B":2020.65,"C":158.411},"methyl tetradecyl sulfide":{"A":7.22529,"B":1980.43,"C":146},"2-methyltetrahydrofuran":{"A":7.13891,"B":1339.48,"C":234.353},"3-methyltetrahydrofuran":{"A":6.99166,"B":1430.57,"C":210},"methyltetratriacontylamine":{"A":8.95511,"B":4647.75,"C":273.15},"2-methylthiacyclohexane":{"A":6.98269,"B":1520.9,"C":217.742},"3-methylthiacyclohexane":{"A":6.98187,"B":1537.93,"C":216.969},"4-methylthiacyclohexane":{"A":6.97811,"B":1536.36,"C":216.33},"2-methylthiacyclopentane":{"A":6.95471,"B":1415.7,"C":215.026},"3-methylthiacyclopentane":{"A":6.95225,"B":1433.83,"C":213.832},"2-methylthiacyclopropane":{"A":6.99497,"B":1231.22,"C":224.864},"2-methylthiophene":{"A":7.05816,"B":1392.74,"C":220.843},"3-methylthiophene":{"A":7.09187,"B":1423.77,"C":222.653},"m-methylthiophenol":{"A":7.20546,"B":1762.66,"C":212.484},"p-methylthiophenol":{"A":7.25212,"B":1811.83,"C":219.582},"methyltriacontylamine":{"A":8.94116,"B":4461.32,"C":273.15},"methyl trichlorosilane":{"A":7.18818,"B":1370.66,"C":251.814},"methyltricosylamine":{"A":6.37075,"B":1512.68,"C":31.4414},"2-methyltridecane":{"A":7.0684,"B":1740.45,"C":167.72},"3-methyltridecane":{"A":7.06957,"B":1744.28,"C":167.72},"methyltridecylamine":{"A":7.11758,"B":1741.4,"C":134.021},"methyl tridecyl sulfide":{"A":7.78265,"B":2485.95,"C":211.297},"methyltritriacontylamine":{"A":8.93872,"B":4592.8,"C":273.15},"2-methylundecane":{"A":7.03727,"B":1632.18,"C":181.835},"3-methylundecane":{"A":7.04629,"B":1632.18,"C":181.835},"4-methylundecane":{"A":7.04488,"B":1627.46,"C":181.835},"5-methylundecane":{"A":7.04061,"B":1613.32,"C":181.835},"6-methylundecane":{"A":7.04061,"B":1613.32,"C":181.835},"methylundecylamine":{"A":6.79909,"B":1370.45,"C":105.758},"methyl undecyl sulfide":{"A":7.61843,"B":2223.04,"C":205.383},"methyl vinyl ether":{"A":7.08447,"B":1016.34,"C":236.276},"monoethanolamine":{"A":8.36214,"B":2117.92,"C":215.389},"morpholine":{"A":7.40162,"B":1593.63,"C":224.51},"N,N-dietyhlaniline":{"A":7.19346,"B":1811.59,"C":203.794},"N,N-dimethylacetamide":{"A":7.29998,"B":1703.98,"C":219.488},"N,N-dimethylaniline":{"A":7.40583,"B":1907.55,"C":228.017},"N,N-dimethylformamide":{"A":7.24128,"B":1597.92,"C":213.457},"N,N'-diphenyl-p-phenylenediamine":{"A":7.75195,"B":2747.44,"C":149.175},"naphthalene":{"A":7.17709,"B":1858.77,"C":214.657},"neopentane":{"A":6.98736,"B":1079.25,"C":253.312},"neopentyl acetate":{"A":6.8226,"B":1219.07,"C":181.269},"neopentyl glycol":{"A":8.29043,"B":2021.78,"C":163.889},"1-nitro-2,2-dimethylbutane":{"A":6.97792,"B":1387.51,"C":169.657},"1-nitro-2,2-dimethylpropane":{"A":6.90098,"B":1305.5,"C":174.239},"1-nitro-2,3-dimethylbutane":{"A":7.0407,"B":1433.59,"C":168.623},"2-nitro-2,3-dimethylbutane":{"A":6.91939,"B":1364,"C":168.742},"1-nitro-2-ethylbutane":{"A":7.10167,"B":1445.48,"C":170.611},"1-nitro-2-methylbutane":{"A":6.97386,"B":1365.35,"C":171.579},"2-nitro-2-methylbutane":{"A":6.9087,"B":1304.43,"C":174.049},"1-nitro-2-methylpentane":{"A":7.10135,"B":1448.45,"C":170.341},"2-nitro-2-methylpentane":{"A":6.97674,"B":1398.56,"C":168.601},"3-nitro-2-methylpentane":{"A":7.0426,"B":1415.62,"C":170.297},"1-nitro-2-methylpropane":{"A":6.93045,"B":1283.37,"C":175.189},"2-nitro-2-methylpropane":{"A":6.8715,"B":1219.47,"C":178.419},"1-nitro-3,3-dimethylbutane":{"A":6.97705,"B":1395.69,"C":168.876},"2-nitro-3,3-dimethylbutane":{"A":6.92122,"B":1347.07,"C":170.399},"1-nitro-3-methylbutane":{"A":6.97796,"B":1371.72,"C":171.199},"2-nitro-3-methylbutane":{"A":6.94898,"B":1323.12,"C":174.239},"1-nitro-3-methylpentane":{"A":7.10135,"B":1448.45,"C":170.341},"2-nitro-3-methylpentane":{"A":7.04255,"B":1416.06,"C":170.257},"3-nitro-3-methylpentane":{"A":6.97766,"B":1389.95,"C":169.424},"1-nitro-4-methyl pentane":{"A":7.10135,"B":1448.45,"C":170.341},"2-nitro-4-methylpentane":{"A":7.0426,"B":1415.62,"C":170.297},"m-nitroaniline":{"A":8.2219,"B":2845.38,"C":226.884},"p-nitroaniline":{"A":8.29954,"B":3020.35,"C":221.391},"nitrobenzene":{"A":7.53814,"B":2018.37,"C":222.575},"3-nitrobenzotrifluoride":{"A":7.40372,"B":1847.44,"C":205.683},"1-nitrobutane":{"A":8.15671,"B":2456.1,"C":312.632},"2-nitrobutane":{"A":7.4743,"B":1822.25,"C":257.003},"1-nitrodecane":{"A":7.33358,"B":1873.17,"C":154.675},"1-nitrododecane":{"A":7.40645,"B":2023.76,"C":150.177},"1-nitroeicosane":{"A":7.33526,"B":2355.91,"C":134.889},"nitroethane":{"A":7.52569,"B":1645.15,"C":240.115},"nitroglycerine":{"A":8.32302,"B":2305.8,"C":173.838},"1-nitroheptadecane":{"A":7.45245,"B":2296.78,"C":140.399},"1-nitroheptane":{"A":7.20071,"B":1622.52,"C":162.591},"1-nitrohexadecane":{"A":7.46444,"B":2256.61,"C":142.319},"1-nitrohexane":{"A":7.15516,"B":1535.04,"C":165.628},"2-nitrohexane":{"A":7.10036,"B":1457.81,"C":169.49},"3-nitrohexane":{"A":7.10036,"B":1457.81,"C":169.49},"nitromethane":{"A":7.5385,"B":1588.83,"C":239.919},"1-nitrononadecane":{"A":7.38879,"B":2343.81,"C":136.924},"1-nitrononane":{"A":7.29119,"B":1791.47,"C":157.195},"1-nitrooctadecane":{"A":7.42753,"B":2326.11,"C":138.602},"1-nitrooctane":{"A":7.24631,"B":1709.78,"C":159.657},"1-nitropentadecane":{"A":7.46443,"B":2209.91,"C":144.132},"1-nitropentane":{"A":7.11103,"B":1445.16,"C":169.028},"2-nitropentane":{"A":6.9789,"B":1339.29,"C":174.809},"3-nitropentane":{"A":6.9789,"B":1339.29,"C":174.809},"1-nitropropane":{"A":7.52378,"B":1717.69,"C":238.777},"2-nitropropane":{"A":7.49159,"B":1671.27,"C":242.22},"1-nitrotetradecane":{"A":7.45387,"B":2154.28,"C":146.08},"m-nitrotoluene":{"A":7.86534,"B":2473.15,"C":264.314},"p-nitrotoluene":{"A":8.10268,"B":2714.94,"C":281.417},"1-nitrotridecane":{"A":7.43414,"B":2090.77,"C":148.174},"1-nitroundecane":{"A":7.37246,"B":1950.9,"C":152.34},"nonacosane":{"A":7.12559,"B":2233.6,"C":85.4},"1-nonacosene":{"A":5.90038,"B":1362.54,"C":11.2379},"nonacosylamine":{"A":5.86027,"B":1450,"C":9.66667},"nonacosylbenzene":{"A":6.36225,"B":1750,"C":11.6667},"nonacosylcyclohexane":{"A":6.33476,"B":1750,"C":11.6667},"nonacosylcyclopentane":{"A":6.00313,"B":1848.46,"C":105.014},"1-nonacosyne":{"A":7.87158,"B":4049.27,"C":374.353},"nonadecanal":{"A":7.43282,"B":2295.28,"C":154.235},"nonadecane":{"A":7.28529,"B":2171.97,"C":163.227},"1,2-nonadecanediol":{"A":8.79034,"B":4012.58,"C":273.001},"1,3-nonadecanediol":{"A":8.79036,"B":4077.59,"C":273.001},"1,4-nonadecanediol":{"A":8.79039,"B":4201.72,"C":273.001},"nonadecanenitrile":{"A":7.2892,"B":2259.7,"C":138.591},"1-nonadecanethiol":{"A":7.25347,"B":2225.21,"C":136.882},"2-nonadecanethiol":{"A":7.17271,"B":2103.03,"C":124},"nonadecanoic acid":{"A":7.93765,"B":2717.94,"C":151.478},"1-nonadecanol":{"A":7.36374,"B":2102.91,"C":111.243},"2-nonadecanol":{"A":6.93991,"B":1741.35,"C":75.0004},"2-nonadecanone":{"A":8.21269,"B":3284.44,"C":273.001},"1-nonadecene":{"A":7.42605,"B":2242.82,"C":164.424},"nonadecyl acetate":{"A":7.59737,"B":2650,"C":190},"nonadecylamine":{"A":7.65358,"B":2568.26,"C":168.107},"nonadecylbenzene":{"A":6.89704,"B":2027.16,"C":94.7424},"nonadecyl butanoate":{"A":5.09928,"B":1150,"C":7.66667},"nonadecylcyclohexane":{"A":6.74649,"B":1935.45,"C":88.6746},"nonadecylcyclopentane":{"A":6.8985,"B":2045.35,"C":109.086},"nonadecyl formate":{"A":9.13705,"B":3950,"C":190},"nonadecyl propanoate":{"A":8.48694,"B":3800,"C":190},"1-nonadecyne":{"A":7.63091,"B":2590,"C":218.243},"2-nonadecyne":{"A":7.7364,"B":2796.1,"C":236.852},"3-nonadecyne":{"A":7.56665,"B":2526.67,"C":212.214},"n-nonahexacontane":{"A":7.22079,"B":2657.8,"C":-37.6},"1-nonanal":{"A":7.42543,"B":1825.65,"C":206.718},"nonane":{"A":7.1884,"B":1607.74,"C":222.414},"1,19-nonanecanediol":{"A":8.7672,"B":4108.71,"C":273.001},"1,2-nonanediol":{"A":9.65882,"B":3653.35,"C":273.001},"1,3-nonanediol":{"A":9.65885,"B":3727.92,"C":273.001},"1,4-nonanediol":{"A":9.6589,"B":3870.29,"C":273.001},"1,9-nonanediol":{"A":9.72045,"B":3816.52,"C":273.001},"nonanenitrile":{"A":7.12671,"B":1641.6,"C":162.232},"2-nonanethiol":{"A":7.13884,"B":1737.33,"C":199.813},"nonanoic acid":{"A":7.58695,"B":1969.53,"C":162.903},"1-nonanol":{"A":7.04565,"B":1520.83,"C":152.06},"2-nonanol":{"A":7.87942,"B":1966.54,"C":194.918},"3-nonanol":{"A":8.57326,"B":2662.36,"C":273},"4-nonanol":{"A":8.57326,"B":2652.68,"C":273},"5-nonanol":{"A":8.57326,"B":2664.64,"C":273},"2-nonanone":{"A":7.38404,"B":1797.86,"C":205.238},"nonatriacontane":{"A":7.16922,"B":2408.8,"C":43.7},"1-nonatriacontene":{"A":6.56006,"B":1950,"C":13},"nonatriacontylamine":{"A":8.74355,"B":4849.36,"C":273.15},"1-nonatriacontyne":{"A":5.64776,"B":1728.04,"C":111.529},"1-nonene":{"A":7.10879,"B":1541.77,"C":217.79},"1-nonyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.3731,"B":2339.95,"C":172.881},"2-nonyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.37256,"B":2350.58,"C":172.311},"nonyl acetate":{"A":5.89477,"B":826.776,"C":64.3161},"nonylamine":{"A":7.54556,"B":1942.47,"C":214.216},"nonylbenzene":{"A":7.4709,"B":2224.93,"C":202.677},"nonyl butanoate":{"A":6.9072,"B":1685.55,"C":156.626},"nonylcyclohexane":{"A":7.15013,"B":1965.61,"C":178.895},"nonylcyclopentane":{"A":7.14708,"B":1891.13,"C":181.166},"1-nonylcyclopentene":{"A":7.21891,"B":1929.33,"C":190.74},"nonyl formate":{"A":6.87363,"B":1502.05,"C":163.618},"nonyl mercaptan":{"A":7.32205,"B":1896.42,"C":207.201},"1-nonylnaphthalene":{"A":7.31648,"B":2456.35,"C":187.922},"2-nonylnaphthalene":{"A":7.46051,"B":2463.38,"C":168.891},"nonylphenol":{"A":7.82454,"B":2412.87,"C":180.216},"nonyl propanoate":{"A":7.22297,"B":1816.06,"C":159.21},"1-nonyne":{"A":7.32146,"B":1762.38,"C":246.066},"2-nonyne":{"A":7.01825,"B":1534.87,"C":209.071},"3-nonyne":{"A":7.0196,"B":1519.18,"C":209.96},"2-norbornene":{"A":6.94054,"B":1353.53,"C":237.903},"o,a-dimethylstyrene":{"A":7.02362,"B":1567.98,"C":206.282},"o-chloroaniline":{"A":7.40423,"B":1879.69,"C":206.706},"o-chlorobenzoic acid":{"A":7.62541,"B":2162.82,"C":168.849},"o-chloronitrobenzene":{"A":7.43046,"B":2007.47,"C":195.387},"o-chlorophenol":{"A":7.95322,"B":2302.63,"C":279.572},"o-chlorotoluene":{"A":7.18144,"B":1645.9,"C":223.563},"o-cresol":{"A":7.36792,"B":1727.17,"C":193.918},"o-cymene":{"A":7.11311,"B":1691,"C":221.366},"o-dichlorobenzene":{"A":6.97294,"B":1596.2,"C":209.647},"o-diethylbenzene":{"A":7.04299,"B":1639.33,"C":210.404},"o-difluorobenzene":{"A":7.08993,"B":1298.09,"C":216.889},"o-dinitrobenzene":{"A":7.67129,"B":2326.99,"C":166.904},"o-ethylaniline":{"A":7.43607,"B":1922.54,"C":212.549},"o-ethylphenol":{"A":7.407,"B":1816.05,"C":196.712},"o-ethylstyrene":{"A":7.06735,"B":1635.7,"C":203.415},"o-ethylthiophenol":{"A":7.16724,"B":1753.58,"C":199.1},"o-ethyltoluene":{"A":7.04815,"B":1615.2,"C":222.406},"o-methylstyrene":{"A":7.17481,"B":1668.05,"C":218.652},"o-methylthiophenol":{"A":7.23715,"B":1793.05,"C":217.395},"o-nitroaniline":{"A":8.28978,"B":2810.04,"C":234.666},"o-nitroanisole":{"A":7.55875,"B":2185.16,"C":194.121},"o-nitrotoluene":{"A":7.69137,"B":2219.18,"C":238.825},"o-phenylenediamine":{"A":7.51273,"B":2028.77,"C":186.147},"o-terphenyl":{"A":7.42184,"B":2386.78,"C":189.753},"o-toluic acid":{"A":7.58639,"B":2036.9,"C":174.019},"o-toluidine":{"A":7.27584,"B":1747.7,"C":197.253},"octacosane":{"A":7.12084,"B":2211.6,"C":90},"1-octacosene":{"A":6.06147,"B":1451.26,"C":26.2781},"octacosylamine":{"A":5.81377,"B":1400,"C":9.33333},"octacosylbenzene":{"A":6.31285,"B":1700,"C":11.3333},"octacosylcyclohexane":{"A":6.28535,"B":1700,"C":11.3333},"octacosylcyclopentane":{"A":6.14116,"B":1910,"C":105.826},"1-octacosyne":{"A":8.13913,"B":4324.82,"C":394.473},"octadecanal":{"A":7.49719,"B":2305.85,"C":162.493},"octadecane":{"A":7.34072,"B":2172.97,"C":170.513},"1,2-octadecanediol":{"A":8.96257,"B":4044.37,"C":273.001},"1,3-octadecanediol":{"A":8.96258,"B":4111.28,"C":273.001},"1,4-octadecanediol":{"A":8.96262,"B":4239.02,"C":273.001},"1,18-octadecanediol":{"A":8.94776,"B":4149.8,"C":273.001},"octadecanenitrile":{"A":7.31707,"B":2229.94,"C":140.663},"1-octadecanethiol":{"A":7.31342,"B":2245.85,"C":146.655},"2-octadecanethiol":{"A":7.19784,"B":2085.13,"C":129},"octadecanoic acid":{"A":7.86912,"B":2572.31,"C":140.468},"1-octadecanol":{"A":7.03073,"B":1877.62,"C":117.448},"2-octadecanol":{"A":6.90963,"B":1696.13,"C":80.0004},"2-octadecanone":{"A":8.23053,"B":3241.93,"C":273.001},"1-octadecene":{"A":7.31231,"B":2093.33,"C":157.556},"octadecyl acetate":{"A":7.63532,"B":2600,"C":190},"octadecylamine":{"A":7.60988,"B":2483.32,"C":168.118},"octadecylbenzene":{"A":7.00426,"B":2092.43,"C":107.447},"octadecyl butanoate":{"A":5.1023,"B":1100,"C":7.33333},"octadecylcyclohexane":{"A":6.85652,"B":2002.83,"C":101.767},"octadecylcyclopentane":{"A":6.94665,"B":2039.99,"C":112.741},"octadecyl formate":{"A":9.12578,"B":3800,"C":190},"octadecyl propanoate":{"A":8.37742,"B":3600,"C":190},"1-octadecyne":{"A":7.15065,"B":1981.93,"C":151.16},"2-octadecyne":{"A":7.36684,"B":2286.35,"C":184.66},"3-octadecyne":{"A":7.36877,"B":2246.54,"C":186.572},"octafluoro-2-butene":{"A":6.96659,"B":994.3,"C":246.147},"octafluorocyclobutane":{"A":7.06892,"B":970.741,"C":237.765},"octafluorocyclopentene":{"A":6.19304,"B":681.29,"C":178.69},"octafluoropropane":{"A":7.20679,"B":959.438,"C":258.535},"n-octahexacontane":{"A":7.21987,"B":2652.9,"C":-35.6},"octamethylcyclotetrasiloxane":{"A":6.90464,"B":1445.51,"C":184.239},"1-octanal":{"A":7.38945,"B":1738.96,"C":211.697},"octane":{"A":7.14462,"B":1498.96,"C":225.874},"1,2-octanediol":{"A":9.65382,"B":3555.83,"C":273},"1,3-octanediol":{"A":9.65385,"B":3630.35,"C":273},"1,4-octanediol":{"A":9.6539,"B":3772.61,"C":273.001},"1,8-octanediol":{"A":9.72125,"B":3721.2,"C":273.001},"octanenitrile":{"A":7.08062,"B":1555.96,"C":165.285},"2-octanethiol":{"A":7.05078,"B":1609.48,"C":199.569},"octanoic acid":{"A":7.50163,"B":1856.28,"C":161.821},"1-octanol":{"A":7.16033,"B":1536.79,"C":163.905},"2-octanol":{"A":6.99299,"B":1420.06,"C":165.53},"3-octanol":{"A":8.10218,"B":2103.25,"C":228.117},"4-octanol":{"A":7.9921,"B":2007.41,"C":216.139},"2-octanone":{"A":7.08502,"B":1475.8,"C":178.43},"octatriacontane":{"A":7.16932,"B":2394.7,"C":47.4},"1-octatriacontene":{"A":6.51602,"B":1900,"C":12.6667},"octatriacontylamine":{"A":8.73859,"B":4804.26,"C":273.15},"1-octatriacontyne":{"A":5.69192,"B":1749.46,"C":115.337},"1-octene":{"A":7.09965,"B":1461.11,"C":225.041},"cis-2-octene":{"A":7.16218,"B":1527.15,"C":231.058},"trans-2-octene":{"A":7.09038,"B":1501.41,"C":231.665},"cis-3-octene":{"A":7.15222,"B":1507.87,"C":230.115},"trans-3-octene":{"A":7.11187,"B":1509.58,"C":233.486},"cis-4-octene":{"A":7.15021,"B":1504.72,"C":229.904},"trans-4-octene":{"A":7.05997,"B":1464,"C":228.05},"1-octyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.34473,"B":2278.16,"C":175.351},"2-octyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.34399,"B":2292.25,"C":174.591},"octyl acetate":{"A":6.91213,"B":1517.31,"C":165.081},"octylamine":{"A":7.54133,"B":1879.97,"C":223.783},"octylbenzene":{"A":7.34646,"B":2082.73,"C":201.988},"octyl butanoate":{"A":6.85659,"B":1604.05,"C":159.457},"octylcyclohexane":{"A":7.12617,"B":1901.79,"C":184.361},"octylcyclopentane":{"A":7.12421,"B":1827.14,"C":186.873},"1-octylcyclopentene":{"A":7.17999,"B":1852.82,"C":193.97},"octyl formate":{"A":7.73249,"B":2151.95,"C":244.747},"octyl mercaptan":{"A":7.26085,"B":1796.44,"C":211.103},"tert-octyl mercaptan":{"A":7.02083,"B":1591.27,"C":228.513},"1-octylnaphthalene":{"A":7.4322,"B":2385.48,"C":172.121},"2-octylnaphthalene":{"A":7.43167,"B":2396.25,"C":171.551},"p-tert-octylphenol":{"A":7.38595,"B":2115.6,"C":179.147},"octyl propanoate":{"A":6.60773,"B":1312.32,"C":124.12},"1-octyne":{"A":7.2556,"B":1537.1,"C":225.155},"2-octyne":{"A":6.86715,"B":1339.47,"C":198.286},"3-octyne":{"A":6.85797,"B":1316.63,"C":197.909},"oleic acid":{"A":8.0641,"B":2729.09,"C":166.667},"oxalic acid":{"A":8.20735,"B":2370.64,"C":149.212},"oxazole":{"A":7.28388,"B":1352.11,"C":237.583},"p,a-dimethytstyrene":{"A":7.01987,"B":1612.82,"C":203.66},"paraldehyde":{"A":7.26159,"B":1471.15,"C":211.721},"pentachlorobenzene":{"A":7.1273,"B":1826.04,"C":154.012},"pentachloroethane":{"A":6.92727,"B":1495.9,"C":209.802},"pentachlorofluoroethane":{"A":6.68077,"B":1162.78,"C":168.097},"pentacosane":{"A":7.10352,"B":2138.8,"C":104.6},"1-pentacosene":{"A":6.53579,"B":1732.58,"C":73.0336},"pentacosylamine":{"A":6.37987,"B":1636.53,"C":28.7065},"pentacosylbenzene":{"A":6.38649,"B":1722.73,"C":29.4097},"pentacosylcyclohexane":{"A":6.2602,"B":1660.59,"C":25.3884},"pentacosylcyclopentane":{"A":6.52704,"B":2063.1,"C":109.816},"1-pentacosyne":{"A":8.49456,"B":4420.58,"C":388.456},"pentadecanal":{"A":7.65123,"B":2325.09,"C":190.397},"pentadecane":{"A":7.29987,"B":1985.73,"C":178.677},"1,2-pentadecanediol":{"A":9.36666,"B":4040.69,"C":273.001},"1,3-pentadecanediol":{"A":9.36669,"B":4112.05,"C":273.001},"1,4-pentadecanediol":{"A":9.36673,"B":4248.28,"C":273.001},"1,15-pentadecanediol":{"A":9.37932,"B":4172.04,"C":273.001},"pentadecanenitrile":{"A":7.32676,"B":2085.98,"C":147.187},"1-pentadecanethiol":{"A":7.42034,"B":2243.94,"C":173.602},"2-pentadecanethiol":{"A":7.19548,"B":1980.43,"C":146},"pentadecanoic acid":{"A":7.64964,"B":2187.3,"C":119.766},"1-pentadecanol":{"A":8.12423,"B":2621.38,"C":195.077},"2-pentadecanol":{"A":6.86263,"B":1576.8,"C":97.0003},"2-pentadecanone":{"A":7.54693,"B":2221.04,"C":183.994},"1-pentadecene":{"A":7.29191,"B":1986.27,"C":181.83},"pentadecyl acetate":{"A":7.76275,"B":2450,"C":190},"pentadecylamine":{"A":7.41658,"B":2173.34,"C":166.157},"pentadecylbenzene":{"A":7.77891,"B":2645.34,"C":174.066},"pentadecyl butanoate":{"A":5.11336,"B":950,"C":6.33333},"pentadecylcyclohexane":{"A":7.02845,"B":2045.58,"C":126.182},"pentadecylcyclopentane":{"A":6.89767,"B":1871.14,"C":113.972},"1-pentadecylcyclopentene":{"A":7.35504,"B":2283.42,"C":175.351},"pentadecyl formate":{"A":8.79736,"B":3239.51,"C":197.685},"pentadecyl propanoate":{"A":7.99756,"B":3000,"C":190},"1-pentadecyne":{"A":7.3573,"B":2093.13,"C":199.573},"2-pentadecyne":{"A":7.32145,"B":2119.41,"C":197.277},"3-pentadecyne":{"A":7.31941,"B":2082.66,"C":198.216},"1,2-pentadiene":{"A":6.88699,"B":1126.51,"C":236.335},"cis-1,3-pentadiene":{"A":6.8682,"B":1119.38,"C":236.661},"trans-1,3-pentadiene":{"A":6.73433,"B":1039.11,"C":227.633},"1,4-pentadiene":{"A":6.75043,"B":1022.71,"C":238.334},"2,3-pentadiene":{"A":6.99884,"B":1168.69,"C":235.549},"pentaerythritol":{"A":10.673,"B":4244.33,"C":186.84},"pentaerythritol tetranitrate":{"A":8.50487,"B":2380.81,"C":153.477},"pentaethylbenzene":{"A":7.56363,"B":2346.39,"C":224.053},"pentafluoroethane":{"A":6.99473,"B":811.133,"C":245.168},"1,1,1,2,2-pentafluoropropane":{"A":6.59647,"B":695.465,"C":207.172},"1,1,1,2,3-pentafluoropropane":{"A":6.74066,"B":785.524,"C":206.662},"1,1,1,3,3-pentafluoropropane":{"A":6.74066,"B":785.524,"C":206.662},"1,1,2,2,3-pentafluoropropane":{"A":6.77934,"B":893.656,"C":203.229},"1,1,2,3,3-pentafluoropropane":{"A":6.83643,"B":915.725,"C":204.65},"n-pentahexacontane":{"A":7.22221,"B":2637.4,"C":-29.5},"2,2,3,4,4-pentamethyl-3-ethylpentane":{"A":6.63414,"B":1485.7,"C":181.835},"2,2,3,4,4-pentamethyl-3-pentanol":{"A":8.04589,"B":2414.16,"C":273},"pentamethylbenzene":{"A":7.09984,"B":1800.5,"C":194.958},"2,2,3,3,4-pentamethylheptane":{"A":6.72029,"B":1466.05,"C":181.835},"2,2,3,3,5-pentamethylheptane":{"A":6.71238,"B":1440.04,"C":181.835},"2,2,3,3,6-pentamethylheptane":{"A":6.71104,"B":1435.7,"C":181.835},"2,2,3,4,4-pentamethylheptane":{"A":6.72289,"B":1474.72,"C":181.835},"2,2,3,4,5-pentamethylheptane":{"A":6.76683,"B":1460.5,"C":181.835},"2,2,3,4,6-pentamethylheptane":{"A":6.75853,"B":1434.12,"C":181.835},"2,2,3,5,5-pentamethylheptane":{"A":6.70288,"B":1409.71,"C":181.835},"2,2,3,5,6-pentamethylheptane":{"A":6.75965,"B":1437.63,"C":181.835},"2,2,3,6,6-pentamethylheptane":{"A":6.70011,"B":1401.05,"C":181.835},"2,2,4,4,5-pentamethylheptane":{"A":6.71504,"B":1448.7,"C":181.835},"2,2,4,4,6-pentamethylheptane":{"A":6.70094,"B":1403.65,"C":181.835},"2,2,4,5,5-pentamethylheptane":{"A":6.7015,"B":1405.38,"C":181.835},"2,2,4,5,6-pentamethylheptane":{"A":6.7543,"B":1420.93,"C":181.835},"2,2,4,6,6-pentamethylheptane":{"A":6.69016,"B":1370.55,"C":181.835},"2,2,5,5,6-pentamethylheptane":{"A":6.7015,"B":1405.38,"C":181.835},"2,3,3,4,4-pentamethylheptane":{"A":6.72418,"B":1479.06,"C":181.835},"2,3,3,4,5-pentamethylheptane":{"A":6.77492,"B":1486.91,"C":181.835},"2,3,3,4,6-pentamethylheptane":{"A":6.76819,"B":1464.9,"C":181.835},"2,3,3,5,5-pentamethylheptane":{"A":6.72029,"B":1466.05,"C":181.835},"2,3,3,5,6-pentamethylheptane":{"A":6.76409,"B":1451.7,"C":181.835},"2,3,4,4,5-pentamethylheptane":{"A":6.77492,"B":1486.91,"C":181.835},"2,3,4,4,6-pentamethylheptane":{"A":6.76132,"B":1442.91,"C":181.835},"2,3,4,5,5-pentamethylheptane":{"A":6.7709,"B":1473.7,"C":181.835},"2,3,4,5,6-pentamethylheptane":{"A":6.82308,"B":1485.58,"C":181.835},"2,4,4,5,5-pentamethylheptane":{"A":6.71504,"B":1448.7,"C":181.835},"3,3,4,4,5-pentamethylheptane":{"A":6.72801,"B":1492.08,"C":181.835},"3,3,4,5,5-pentamethylheptane":{"A":6.7318,"B":1505.1,"C":181.835},"2,2,3,3,4-pentamethylhexane":{"A":6.69644,"B":1418.27,"C":187.7},"2,2,3,3,5-pentamethylhexane":{"A":6.67883,"B":1360.45,"C":187.7},"2,2,3,4,4-pentamethylhexane":{"A":6.69896,"B":1426.84,"C":187.7},"2,2,3,4,5-pentamethylhexane":{"A":6.73839,"B":1395.29,"C":187.7},"2,2,3,5,5-pentamethylhexane":{"A":6.67272,"B":1341.2,"C":187.7},"2,2,4,4,5-pentamethylhexane":{"A":6.68613,"B":1384,"C":187.7},"2,3,3,4,4-pentamethylhexane":{"A":6.70021,"B":1431.13,"C":187.7},"2,3,3,4,5-pentamethylhexane":{"A":6.74771,"B":1425.73,"C":187.7},"2,2,3,3,4-pentamethylpentane":{"A":6.94212,"B":1568.22,"C":220.077},"2,2,3,4,4-pentamethylpentane":{"A":6.97171,"B":1575.01,"C":225.704},"pentanal":{"A":7.27832,"B":1453.59,"C":227.549},"pentane":{"A":7.00877,"B":1134.15,"C":238.678},"1,2-pentanediol":{"A":9.58802,"B":3232.87,"C":273},"1,3-pentanediol":{"A":9.58805,"B":3313.38,"C":273},"1,4-pentanediol":{"A":7.55211,"B":1577.57,"C":135.715},"1,5-pentanediol":{"A":9.21354,"B":2982.19,"C":231.918},"2-pentanethiol":{"A":7.05377,"B":1407.84,"C":224.971},"3-pentanethiol":{"A":7.12107,"B":1455.59,"C":229.378},"pentanoic acid":{"A":7.61722,"B":1828.33,"C":200.516},"1-pentanol":{"A":7.45784,"B":1516.51,"C":193.53},"2-pentanol":{"A":7.61023,"B":1502.48,"C":198.688},"3-pentanol":{"A":7.7147,"B":1573.76,"C":210.267},"pentatriacontane":{"A":7.15799,"B":2348.6,"C":59.1},"1-pentatriacontene":{"A":6.37615,"B":1750,"C":11.6667},"pentatriacontylamine":{"A":8.73939,"B":4681.88,"C":273.15},"pentatriacontylbenzene":{"A":6.66543,"B":2050,"C":13.6667},"pentatriacontylcyclohexane":{"A":6.62397,"B":2050,"C":13.6667},"pentatriacontylcyclopentane":{"A":5.17665,"B":1445.83,"C":103.763},"1-pentatriacontyne":{"A":5.84797,"B":1819.77,"C":127.303},"1-pentene":{"A":7.02741,"B":1132.42,"C":243.136},"cis-2-pentene":{"A":7.05033,"B":1160.24,"C":241.338},"trans-2-pentene":{"A":7.05181,"B":1161.52,"C":242.135},"1-pentene-3-yne":{"A":7.12893,"B":1270.25,"C":239.765},"1-pentene-4-yne":{"A":6.99974,"B":1169.1,"C":241.337},"trans-2-pentenoic acid":{"A":6.96646,"B":1459.4,"C":157.202},"cis-2-pentenoic acid":{"A":6.9705,"B":1416.83,"C":161.44},"trans-3-pentenoic acid":{"A":6.96831,"B":1439.53,"C":159.18},"cis-3-pentenoic acid":{"A":6.99194,"B":1229.6,"C":180.09},"4-pentenoic acid":{"A":6.9864,"B":1433.1,"C":161.06},"tert-pentyl-alcohol":{"A":7.00538,"B":1125.64,"C":170.91},"1-pentyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.23511,"B":2062.2,"C":183.97},"2-pentyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.23403,"B":2080.62,"C":182.95},"pentyl acetate":{"A":7.33379,"B":1636,"C":218.395},"tert-pentyl acetate":{"A":6.87619,"B":1223.46,"C":182.219},"pentylamine":{"A":7.34146,"B":1488.24,"C":229.138},"pentylbenzene":{"A":7.33675,"B":1937.75,"C":229.409},"pentyl butanoate":{"A":6.80187,"B":1391.68,"C":169.926},"pentylcyclohexane":{"A":7.04049,"B":1683.04,"C":200.89},"pentylcyclopentane":{"A":7.05449,"B":1613.88,"C":206.072},"1-pentylcyclopentene":{"A":7.05949,"B":1604.57,"C":204.99},"pentyl formate":{"A":7.46279,"B":1612.1,"C":218.384},"pentyl mercaptan":{"A":7.15741,"B":1514.57,"C":227.513},"1-pentylnaphthalene":{"A":7.46457,"B":2337.72,"C":203},"2-pentylnaphthalene":{"A":7.48938,"B":2381.4,"C":206.724},"pentyl propanoate":{"A":6.89741,"B":1374.75,"C":173.517},"1-pentyne":{"A":7.2117,"B":1223.32,"C":242.283},"2-pentyne":{"A":6.80954,"B":1078.84,"C":218.534},"alpha-phellandrene":{"A":7.16911,"B":1695.59,"C":220.401},"beta-phellandrene":{"A":7.14903,"B":1675.74,"C":218.609},"phenanthrene":{"A":7.5004,"B":2565.81,"C":215.12},"p-phenetidine":{"A":7.51883,"B":2094.46,"C":196.735},"phenetole":{"A":7.30227,"B":1706.4,"C":215.935},"phenol":{"A":7.54098,"B":1801.28,"C":204.687},"1-phenyl-2,2-dimethylpropane":{"A":6.97145,"B":1593.96,"C":203.66},"1-phenyl-2-methylbutane":{"A":7.08478,"B":1675.58,"C":201.57},"2-phenyl-2-methylbutane":{"A":6.96979,"B":1614.44,"C":202.448},"2-phenyl-2-propanol":{"A":8.03839,"B":2245.56,"C":233.391},"1-phenyl-3-methylbutane":{"A":7.08428,"B":1681.85,"C":201.209},"2-phenyl-3-methylbutane":{"A":7.03158,"B":1624.11,"C":203.28},"phenylbenzene (biphenyl)":{"A":7.1367,"B":1883.14,"C":187.48},"m-phenylenediamine":{"A":7.92349,"B":2597.74,"C":228.301},"p-phenylenediamine":{"A":7.5568,"B":2078.94,"C":177.749},"2-phenylethanol":{"A":8.25639,"B":2462.01,"C":239.1},"1-phenylhexadecane":{"A":7.84553,"B":2723.46,"C":170.552},"phenylhydrazine":{"A":7.69242,"B":2180.88,"C":209.754},"phenyl isocyanate":{"A":7.6215,"B":1942.05,"C":244.056},"phenyl mercaptan":{"A":7.06085,"B":1549.9,"C":201.647},"1-phenylnaphthalene":{"A":7.34289,"B":2325.7,"C":187.214},"2-phenylpentane":{"A":7.08665,"B":1652.48,"C":202.9},"3-phenylpentane":{"A":7.08638,"B":1655.78,"C":202.71},"1-phenyltetradecane":{"A":7.75362,"B":2611.34,"C":181.89},"phosgene":{"A":7.13083,"B":1060.08,"C":241.87},"phthalic acid":{"A":8.16112,"B":2473.61,"C":143.61},"phthalic anhydride":{"A":9.30387,"B":4271.98,"C":380.602},"alpha-pinene":{"A":7.06153,"B":1621.22,"C":231.645},"beta-pinene":{"A":7.01375,"B":1583.34,"C":217.063},"piperazine":{"A":7.37904,"B":1564.9,"C":201.893},"piperidine":{"A":7.13925,"B":1427.24,"C":228.756},"propane":{"A":7.01887,"B":889.864,"C":257.084},"1,2-propanediamine":{"A":7.56852,"B":1579.22,"C":217.586},"1,3-propanediol":{"A":9.73868,"B":3368.78,"C":276.828},"1,2-propanediol (propylene glycol)":{"A":9.18762,"B":2651.27,"C":232.783},"propanoic acid":{"A":7.66944,"B":1727.17,"C":219.512},"propargyl alcohol":{"A":8.03112,"B":1838.05,"C":243.282},"propargyl chloride":{"A":7.02798,"B":1230.74,"C":238.915},"cis-1-propenylbenzene":{"A":6.97224,"B":1510.68,"C":199.22},"trans-1-propenylbenzene":{"A":6.9217,"B":1462.53,"C":191.924},"2-propenylbenzene":{"A":7.01198,"B":1490.6,"C":205.019},"beta-propiolactone":{"A":7.49489,"B":1754.89,"C":218.335},"propionaldehyde":{"A":7.30641,"B":1285.88,"C":242.556},"propionic anhydride":{"A":7.88478,"B":2020.68,"C":234.815},"propionitrile":{"A":7.29327,"B":1480.58,"C":238.197},"2-propyl-1,3-propanediol":{"A":9.61598,"B":3192.54,"C":273},"2-propyl-1,4-butanediol":{"A":9.6387,"B":3279.47,"C":273},"2-propyl-1-heptanol":{"A":8.6188,"B":2816.78,"C":273},"2-propyl-1-hexanol":{"A":8.57324,"B":2629.05,"C":273},"3-propyl-1-hexanol":{"A":8.57324,"B":2629.05,"C":273},"2-propyl-1-pentanol":{"A":7.58795,"B":1653.77,"C":172.332},"2-propyl-1-pentene":{"A":7.07147,"B":1435.25,"C":224.788},"4-propyl-4-heptanol":{"A":8.47465,"B":2612.32,"C":273},"1-propyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.15315,"B":1908.39,"C":190.284},"2-propyl-[1,2,3,4-tetrahydronaphthalene]":{"A":7.15217,"B":1923.86,"C":189.41},"propyl acetate":{"A":7.22305,"B":1408.02,"C":222.76},"propyl acrylate":{"A":7.21702,"B":1440.91,"C":213.296},"propyl alcohol":{"A":7.77374,"B":1518.16,"C":213.076},"propylamine":{"A":7.27675,"B":1257.56,"C":237.574},"propylbenzene":{"A":7.18167,"B":1655.21,"C":225.615},"propyl butanoate":{"A":7.36547,"B":1681.07,"C":231.55},"propyl butyl sulfide":{"A":7.15241,"B":1575.03,"C":210.873},"propylcyclohexane":{"A":6.92797,"B":1529.11,"C":221.073},"propylcyclopentane":{"A":7.01197,"B":1485.23,"C":228.559},"1-propylcyclopentene":{"A":6.98716,"B":1417.81,"C":214.072},"propylcyclopropane":{"A":7.00721,"B":1217.33,"C":225.862},"propyl decyl sulfide":{"A":7.13871,"B":1863.9,"C":157.9},"propyl dodecyl sulfide":{"A":7.22529,"B":1980.43,"C":146},"propylene":{"A":7.01672,"B":860.992,"C":255.895},"propyleneimine":{"A":7.20945,"B":1270,"C":232.545},"1,2-propylene oxide":{"A":7.16778,"B":1158,"C":236.22},"1,3-propylene oxide":{"A":7.17849,"B":1240.34,"C":240.757},"propyl formate":{"A":7.21129,"B":1355.8,"C":232.264},"propyl heptadecyl sulfide":{"A":7.18259,"B":2111.53,"C":119.001},"4-propylheptane":{"A":7.08282,"B":1541.67,"C":209.378},"propyl heptyl sulfide":{"A":7.16824,"B":1809.06,"C":195.094},"propyl hexadecyl sulfide":{"A":7.20937,"B":2103.03,"C":124},"propyl hexyl sulfide":{"A":7.15298,"B":1737.33,"C":199.813},"propyl isocyanide":{"A":6.91079,"B":1147.02,"C":185.622},"propylisopropylamine":{"A":6.94736,"B":1166.58,"C":188.573},"propyl isopropyl ether":{"A":6.95564,"B":1181.7,"C":210},"propyl mercaptan":{"A":7.11863,"B":1284.31,"C":235.338},"propyl methacrylate":{"A":7.17755,"B":1547.39,"C":219.281},"1-propylnaphthalene":{"A":7.34885,"B":2130.42,"C":204.003},"2-propylnaphthalene":{"A":7.34066,"B":2123.5,"C":202.627},"propyl nitrate":{"A":7.72383,"B":1721.67,"C":245.486},"4-propylnonane":{"A":7.03045,"B":1580.33,"C":181.835},"5-propylnonane":{"A":7.02749,"B":1570.91,"C":181.835},"propyl nonyl sulfide":{"A":7.61843,"B":2223.04,"C":205.383},"4-propyloctane":{"A":7.00737,"B":1517.34,"C":187.7},"propyl octyl sulfide":{"A":7.09661,"B":1759.04,"C":170.4},"propyl pentadecyl sulfide":{"A":7.13143,"B":2069.41,"C":135},"propyl pentyl sulfide":{"A":7.09805,"B":1717.84,"C":220.489},"2-propylphenol":{"A":7.17613,"B":1651.12,"C":165},"3-propylphenol":{"A":7.19073,"B":1698.11,"C":165},"4-propylphenol":{"A":7.19739,"B":1720.16,"C":165},"propyl phenyl sulfide":{"A":7.18304,"B":1794.89,"C":197.2},"propyl propanoate":{"A":7.20119,"B":1501.07,"C":224.94},"propyl tetradecyl sulfide":{"A":7.25728,"B":2069.41,"C":135},"2-propylthiophene":{"A":7.10723,"B":1552.72,"C":208.885},"3-propylthiophene":{"A":7.10649,"B":1561.01,"C":208.41},"propyl tridecyl sulfide":{"A":7.22342,"B":2014.32,"C":140},"propyl undecyl sulfide":{"A":7.78265,"B":2485.95,"C":211.297},"pyrene":{"A":7.4202,"B":2698,"C":199.552},"pyridine":{"A":7.1874,"B":1463.63,"C":224.598},"pyrocatechol":{"A":8.71149,"B":3032.88,"C":274.659},"pyromellitic acid":{"A":9.19171,"B":3487.92,"C":103.832},"pyrrole":{"A":7.20345,"B":1451.6,"C":205.963},"pyrrolidine":{"A":7.15003,"B":1291.56,"C":215.958},"2-pyrrolidone":{"A":7.5694,"B":2089.39,"C":200.634},"pyruvic acid":{"A":8.30281,"B":2241.01,"C":248.318},"quinoline":{"A":7.23233,"B":1909.9,"C":201.305},"resorcinol":{"A":7.96913,"B":2282.29,"C":172.036},"salicylaldehyde":{"A":8.34867,"B":2565.85,"C":272.761},"salicylic acid":{"A":7.97042,"B":2114.97,"C":159.697},"sebacic acid":{"A":8.44589,"B":2959.84,"C":162.919},"sorbitol":{"A":10.2336,"B":4586.45,"C":119.915},"spiropentane":{"A":7.22104,"B":1250.41,"C":249.058},"cis-stilbene":{"A":7.20754,"B":1941.61,"C":186.898},"trans-stilbene":{"A":7.14773,"B":2030.21,"C":169.302},"styrene":{"A":6.94579,"B":1443.88,"C":210.039},"succinic acid":{"A":8.14478,"B":2441.39,"C":145.942},"succinic anhydride":{"A":8.03192,"B":2582.17,"C":237.855},"succinonitrile":{"A":7.4738,"B":2086.17,"C":187.208},"sulfolane":{"A":7.415,"B":2207.21,"C":201.794},"t-butyl hydroperoxide":{"A":8.0104,"B":1874.75,"C":233.128},"tartaric acid":{"A":9.67704,"B":3399.75,"C":113.391},"terephthalic acid":{"A":8.13159,"B":3394.38,"C":87.6035},"m-terphenyl":{"A":7.56576,"B":2631.92,"C":184.933},"p-terphenyl":{"A":7.34905,"B":2408.68,"C":163.067},"alpha-terpinene":{"A":7.13456,"B":1673.54,"C":216.227},"gamma-terpinene":{"A":7.13775,"B":1703.3,"C":217.124},"terpinolene":{"A":6.92978,"B":1574.26,"C":203.804},"1,1,2,2-tetrabromoethane":{"A":7.52538,"B":1775.96,"C":138.874},"1,1,1,2-tetrabromoethane":{"A":7.44775,"B":1775.96,"C":138.874},"1,1,1,2-tetrabromopropane":{"A":7.41161,"B":1771.5,"C":140.991},"1,1,1,3-tetrabromopropane":{"A":7.47343,"B":1834.39,"C":139.421},"1,1,2,2-tetrabromopropane":{"A":7.41523,"B":1724.39,"C":145.289},"1,1,2,3-tetrabromopropane":{"A":7.54518,"B":1885.55,"C":139.245},"1,1,3,3-tetrabromopropane":{"A":7.5429,"B":1918.11,"C":136.427},"1,2,2,3-tetrabromopropane":{"A":7.47578,"B":1802.43,"C":142.262},"1,1,2,2-tetrachloro-1,2-difluoroethane":{"A":6.95599,"B":1269.97,"C":218.785},"1,1,2,2-tetrachloro-1-fluoroethane":{"A":6.71849,"B":1118.2,"C":174.776},"1,1,1,2-tetrachloro-2,2-difluoroethane":{"A":7.0158,"B":1308.4,"C":224.923},"1,1,1,2-tetrachloro-2-fluoroethane":{"A":6.71775,"B":1118.69,"C":174.559},"1,2,3,4-tetrachlorobenzene":{"A":7.49767,"B":2230.43,"C":229.006},"1,2,3,5-tetrachlorobenzene":{"A":7.69517,"B":2438.36,"C":260.377},"1,2,4,5-tetrachlorobenzene":{"A":7.3799,"B":2054.22,"C":211.487},"1,1,1,2-tetrachloroethane":{"A":7.03897,"B":1467.16,"C":222.34},"1,1,2,2-tetrachloroethane":{"A":6.91043,"B":1378.88,"C":197.086},"tetrachloroethylene":{"A":7.06892,"B":1458.45,"C":226.986},"1,1,1,2-tetrachloropropane":{"A":6.68611,"B":1210.06,"C":167.994},"1,1,1,3-tetrachloropropane":{"A":6.73939,"B":1255.93,"C":166.49},"1,1,2,2-tetrachloropropane":{"A":6.68465,"B":1223.09,"C":166.542},"1,1,2,3-tetrachloropropane":{"A":6.7963,"B":1331.75,"C":162.123},"1,1,3,3-tetrachloropropane":{"A":6.79941,"B":1301.58,"C":165.305},"1,2,2,3-tetrachloropropane":{"A":6.73796,"B":1269.2,"C":165.051},"tetrachlorothiophene":{"A":7.16956,"B":1850.87,"C":198.174},"tetracontane":{"A":7.16731,"B":2422.3,"C":40.1},"1-tetracontene":{"A":6.60984,"B":2000,"C":13.3333},"tetracontylamine":{"A":8.7483,"B":4888.5,"C":273.15},"1-tetracontyne":{"A":5.59858,"B":1705.07,"C":107.38},"tetracosane":{"A":7.09722,"B":2112,"C":109.6},"1-tetracosene":{"A":6.66817,"B":1804.88,"C":86.5542},"tetracosylamine":{"A":6.61038,"B":1808.03,"C":55.782},"tetracosylbenzene":{"A":6.52691,"B":1814.28,"C":43.5948},"tetracosylcyclohexane":{"A":6.39756,"B":1750.45,"C":39.7485},"tetracosylcyclopentane":{"A":6.49,"B":1957.3,"C":95.3121},"1-tetracosyne":{"A":8.46927,"B":4238.07,"C":369.361},"tetradecanal":{"A":7.70907,"B":2346.17,"C":202.924},"tetradecane":{"A":7.26165,"B":1914.86,"C":183.519},"1,2-tetradecanediol":{"A":9.4614,"B":4007.58,"C":273.001},"1,3-tetradecanediol":{"A":9.46142,"B":4079.98,"C":273.001},"1,4-tetradecanediol":{"A":9.46147,"B":4218.2,"C":273.001},"1,14-tetradecanediol":{"A":9.48335,"B":4146.4,"C":273.001},"tetradecanenitrile":{"A":7.30909,"B":2025.17,"C":149.326},"1-tetradecanethiol":{"A":7.4252,"B":2211.27,"C":180.384},"2-tetradecanethiol":{"A":7.16278,"B":1926.46,"C":151.9},"tetradecanoic acid":{"A":7.91297,"B":2450.62,"C":160.791},"1-tetradecanol":{"A":6.91214,"B":1670.73,"C":127.436},"2-tetradecanol":{"A":6.85008,"B":1536.11,"C":103},"2-tetradecanone":{"A":7.41282,"B":2035.25,"C":171.083},"1-tetradecene":{"A":7.2715,"B":1926.44,"C":187.657},"2-tetradecene":{"A":7.11328,"B":1903.65,"C":186.773},"tetradecyl acetate":{"A":7.81046,"B":2400,"C":190},"tetradecylamine":{"A":8.14238,"B":2767.92,"C":234.764},"tetradecylbenzene":{"A":6.84018,"B":1873.51,"C":119.183},"tetradecyl butanoate":{"A":7.26007,"B":2458.53,"C":165.094},"tetradecylcyclohexane":{"A":7.0646,"B":2043.82,"C":134.499},"tetradecylcyclopentane":{"A":6.97952,"B":1918.14,"C":128.976},"1-tetradecylcyclopentene":{"A":7.35067,"B":2237.75,"C":177.63},"tetradecyl formate":{"A":7.95491,"B":2424.89,"C":150.926},"tetradecyl propanoate":{"A":7.85038,"B":2800,"C":190},"1-tetradecyne":{"A":7.5873,"B":2229.71,"C":221.754},"3-tetradecyne":{"A":7.27867,"B":2002.64,"C":200.367},"1,2,3,4-tetraethylbenzene":{"A":7.52422,"B":2245.91,"C":232.668},"1,2,3,5-tetraethylbenzene":{"A":7.42588,"B":2131.99,"C":218.567},"1,2,4,5-tetraethylbenzene":{"A":7.41784,"B":2121.02,"C":217.48},"tetraethylene glycol":{"A":9.07325,"B":2968.08,"C":171.457},"tetraethylene glycol dimethyl ether":{"A":8.25962,"B":2682.07,"C":222.836},"tetraethylenepentamine":{"A":8.5453,"B":2903.29,"C":179.543},"1,1,1,2-tetrafluoroethane":{"A":7.01019,"B":902.327,"C":244.514},"1,1,2,2-tetrafluoroethane":{"A":7.19118,"B":954.119,"C":241.404},"tetrafluoroethylene":{"A":7.00263,"B":714.849,"C":249.07},"1,1,1,2-tetrafluoropropane":{"A":6.67947,"B":782.252,"C":206.929},"1,1,1,3-tetrafluoropropane":{"A":6.74258,"B":889.782,"C":201.008},"1,1,2,2-tetrafluoropropane":{"A":6.71557,"B":884.505,"C":203.805},"1,1,2,3-tetrafluoropropane":{"A":6.83792,"B":919.456,"C":205.506},"1,1,3,3-tetrafluoropropane":{"A":6.83792,"B":919.456,"C":205.506},"1,2,2,3-tetrafluoropropane":{"A":6.73926,"B":880.26,"C":201.288},"n-tetrahexacontane":{"A":7.21871,"B":2631.8,"C":-27.3},"tetrahydrofuran":{"A":7.10537,"B":1256.68,"C":232.621},"tetrahydrofurfuryl alcohol":{"A":8.29744,"B":2297.33,"C":246.126},"1,2,3,4-tetrahydronaphthalene":{"A":7.16735,"B":1806.14,"C":213.732},"tetrahydrothiophene":{"A":7.11636,"B":1491.31,"C":230.974},"1,1,1,2-tetraiodoethane":{"A":6.60592,"B":1667.17,"C":106.211},"1,1,2,2-tetraiodoethane":{"A":6.65667,"B":1713.42,"C":107.813},"1,1,1,2-tetraiodopropane":{"A":6.59045,"B":1729.35,"C":102.399},"1,1,1,3-tetraiodopropane":{"A":6.64454,"B":1762.36,"C":104.03},"1,1,2,2-tetraiodopropane":{"A":6.59045,"B":1729.35,"C":102.399},"1,1,2,3-tetraiodopropane":{"A":6.70479,"B":1803.36,"C":105.023},"1,1,3,3-tetraiodopropane":{"A":6.70479,"B":1803.36,"C":105.023},"1,2,2,3-tetraiodopropane":{"A":6.64454,"B":1762.36,"C":104.03},"2,2,3,3-tetramethyl-1-butanol":{"A":8.14756,"B":2348.03,"C":272.971},"2,3,4,4-tetramethyl-2-hexanol":{"A":8.1911,"B":2458.66,"C":273},"3,3,5,5-tetramethyl-2-hexanol":{"A":8.1911,"B":2457.87,"C":273},"2,3,3,4-tetramethyl-2-pentanol":{"A":8.13449,"B":2379.13,"C":273},"2,3,4,4-tetramethyl-2-pentanol":{"A":8.13449,"B":2379.13,"C":273},"3,3,4,4-tetramethyl-2-pentanol":{"A":8.13449,"B":2379.92,"C":273},"2,2,3,4-tetramethyl-3-ethylhexane":{"A":6.72546,"B":1483.4,"C":181.835},"2,2,3,5-tetramethyl-3-ethylhexane":{"A":6.71238,"B":1440.04,"C":181.835},"2,2,4,4-tetramethyl-3-ethylhexane":{"A":6.72029,"B":1466.05,"C":181.835},"2,2,4,5-tetramethyl-3-ethylhexane":{"A":6.76132,"B":1442.91,"C":181.835},"2,2,5,5-tetramethyl-3-ethylhexane":{"A":6.69309,"B":1379.41,"C":181.835},"2,3,4,4-tetramethyl-3-ethylhexane":{"A":6.73054,"B":1500.76,"C":181.835},"2,3,4,5-tetramethyl-3-ethylhexane":{"A":6.77625,"B":1491.31,"C":181.835},"2,2,3,4-tetramethyl-3-ethylpentane":{"A":6.69896,"B":1426.84,"C":187.7},"2,2,4,4-tetramethyl-3-ethylpentane":{"A":6.69133,"B":1401.13,"C":187.7},"2,2,3,4-tetramethyl-3-hexanol":{"A":8.1911,"B":2469.29,"C":273},"2,2,3,5-tetramethyl-3-hexanol":{"A":8.19122,"B":2725.99,"C":273},"2,2,4,4-tetramethyl-3-hexanol":{"A":8.1911,"B":2458.66,"C":273},"2,2,5,5-tetramethyl-3-hexanol":{"A":8.19104,"B":2352.43,"C":273},"2,3,4,4-tetramethyl-3-hexanol":{"A":8.19113,"B":2517.09,"C":273},"2,3,5,5-tetramethyl-3-hexanol":{"A":8.19113,"B":2521.61,"C":273},"2,4,4,5-tetramethyl-3-hexanol":{"A":8.26755,"B":2557.89,"C":273},"3,4,4,5-tetramethyl-3-hexanol":{"A":8.19113,"B":2522.4,"C":273},"3,4,5,5-tetramethyl-3-hexanol":{"A":8.19111,"B":2485.22,"C":273},"2,2,3,4-tetramethyl-3-isopropylpentane":{"A":6.67599,"B":1464.31,"C":181.835},"2,2,4,4-tetramethyl-3-isopropylpentane":{"A":6.66317,"B":1421.54,"C":181.835},"2,2,3,4-tetramethyl-3-pentanol":{"A":8.13448,"B":2349.44,"C":273},"2,2,4,4-tetramethyl-3-pentanol":{"A":8.13446,"B":2311.6,"C":273},"2,2,3,3-tetramethyl-4-ethylhexane":{"A":6.72159,"B":1470.39,"C":181.835},"2,2,3,4-tetramethyl-4-ethylhexane":{"A":6.73054,"B":1500.76,"C":181.835},"2,2,3,5-tetramethyl-4-ethylhexane":{"A":6.76271,"B":1447.31,"C":181.835},"2,2,4,5-tetramethyl-4-ethylhexane":{"A":6.71636,"B":1453.04,"C":181.835},"2,3,3,4-tetramethyl-4-ethylhexane":{"A":6.73054,"B":1500.76,"C":181.835},"2,3,3,5-tetramethyl-4-ethylhexane":{"A":6.7709,"B":1473.7,"C":181.835},"1,2,3,4-tetramethylbenzene":{"A":7.00693,"B":1655.57,"C":196.141},"1,2,3,5-tetramethylbenzene":{"A":7.27117,"B":1818.38,"C":216.175},"1,2,4,5-tetramethylbenzene":{"A":7.27724,"B":1809.75,"C":214.802},"2,2,3,3-tetramethylbutane":{"A":6.83046,"B":1278.39,"C":217.222},"1,1,2,2-tetramethylcyclopentane":{"A":6.83789,"B":1372.04,"C":213.73},"1,1,cis-2,trans-3-tetramethylcyclopentane":{"A":6.82902,"B":1359.37,"C":214.3},"1,1,cis-2,cis-4-tetramethylcyclopentane":{"A":6.82902,"B":1359.37,"C":214.3},"1,1,cis-2,trans-4-tetramethylcyclopentane":{"A":6.82902,"B":1359.37,"C":214.3},"1,1,3,3-tetramethylcyclopentane":{"A":6.8428,"B":1325.47,"C":216.588},"1,1,cis-3,cis-4-tetramethylcyclopentane":{"A":6.82806,"B":1368.63,"C":213.73},"1,1,cis-3,trans-4-tetramethylcyclopentane":{"A":6.83178,"B":1333.44,"C":215.896},"1,2,2,cis-3-tetramethylcyclopentane":{"A":6.82649,"B":1384.06,"C":212.78},"1,2,2,trans-3-tetramethylcyclopentane":{"A":6.82649,"B":1384.06,"C":212.78},"1,cis-2,cis-3,cis-4-tetramethylcyclopentane":{"A":6.81586,"B":1402.65,"C":211.45},"1,cis-2,cis-3,trans-4-tetramethylcyclopentane":{"A":6.81802,"B":1381.09,"C":212.78},"1,cis-2,trans-3,cis-4-tetramethylcyclopentane":{"A":6.82025,"B":1359.54,"C":214.11},"1,cis-2,trans-3,trans-4-tetramethylcyclopentane":{"A":6.81802,"B":1381.09,"C":212.78},"1,trans-2,cis-3,trans-4-tetramethylcyclopentane":{"A":6.82143,"B":1348.46,"C":214.794},"1,trans-2,trans-3,cis-4-tetramethylcyclopentane":{"A":6.82025,"B":1359.54,"C":214.11},"1,1,cis-2,cis-3-tetramethylcyclopentane":{"A":6.82649,"B":1384.06,"C":212.78},"2,2,3,3-tetramethylheptane":{"A":6.74142,"B":1419.55,"C":187.7},"2,2,3,4-tetramethylheptane":{"A":6.79151,"B":1422.32,"C":187.7},"2,2,3,5-tetramethylheptane":{"A":6.78876,"B":1413.5,"C":187.7},"2,2,3,6-tetramethylheptane":{"A":6.78318,"B":1395.88,"C":187.7},"2,2,4,4-tetramethylheptane":{"A":6.72797,"B":1376.13,"C":187.7},"2,2,4,5-tetramethylheptane":{"A":6.78177,"B":1391.47,"C":187.7},"2,2,4,6-tetramethylheptane":{"A":6.77202,"B":1361.53,"C":187.7},"2,2,5,5-tetramethylheptane":{"A":6.72242,"B":1358.78,"C":187.7},"2,2,5,6-tetramethylheptane":{"A":6.78177,"B":1391.47,"C":187.7},"2,2,6,6-tetramethylheptane":{"A":6.71819,"B":1345.77,"C":187.7},"2,3,3,4-tetramethylheptane":{"A":6.79961,"B":1448.78,"C":187.7},"2,3,3,5-tetramethylheptane":{"A":6.79151,"B":1422.32,"C":187.7},"2,3,3,6-tetramethylheptane":{"A":6.79014,"B":1417.91,"C":187.7},"2,3,4,4-tetramethylheptane":{"A":6.79423,"B":1431.14,"C":187.7},"2,3,4,5-tetramethylheptane":{"A":6.85155,"B":1456.07,"C":187.7},"2,3,4,6-tetramethylheptane":{"A":6.84457,"B":1433.69,"C":187.7},"2,3,5,5-tetramethylheptane":{"A":6.78598,"B":1404.69,"C":187.7},"2,3,5,6-tetramethylheptane":{"A":6.84598,"B":1438.17,"C":187.7},"2,4,4,5-tetramethylheptane":{"A":6.78876,"B":1413.5,"C":187.7},"2,4,4,6-tetramethylheptane":{"A":6.77463,"B":1369.46,"C":187.7},"2,4,5,5-tetramethylheptane":{"A":6.79151,"B":1422.32,"C":187.7},"3,3,4,4-tetramethylheptane":{"A":6.74664,"B":1436.93,"C":187.7},"3,3,4,5-tetramethylheptane":{"A":6.79827,"B":1444.37,"C":187.7},"3,3,5,5-tetramethylheptane":{"A":6.74142,"B":1419.55,"C":187.7},"3,4,4,5-tetramethylheptane":{"A":6.80358,"B":1462.02,"C":187.7},"2,2,3,3-tetramethylhexane":{"A":7.11854,"B":1638.45,"C":226.305},"2,2,3,4-tetramethylhexane":{"A":6.98343,"B":1543.35,"C":217.378},"2,2,3,5-tetramethylhexane":{"A":6.91187,"B":1438.42,"C":208.425},"2,2,4,4-tetramethylhexane":{"A":7.02641,"B":1579.53,"C":227.203},"2,2,4,5-tetramethylhexane":{"A":6.94875,"B":1468.9,"C":213.201},"2,2,5,5-tetramethylhexane":{"A":6.93252,"B":1408.45,"C":210.14},"2,3,3,4-tetramethylhexane":{"A":6.98015,"B":1562.45,"C":216.548},"2,3,3,5-tetramethylhexane":{"A":6.94751,"B":1488.3,"C":212.864},"2,3,4,4-tetramethylhexane":{"A":6.98091,"B":1552.99,"C":217.16},"2,3,4,5-tetramethylhexane":{"A":6.97175,"B":1504.09,"C":211.454},"3,3,4,4-tetramethylhexane":{"A":6.98334,"B":1603.4,"C":220.822},"1,2,3,4-tetramethylnaphthalene":{"A":7.95793,"B":3085.24,"C":295.413},"1,2,3,6-tetramethylnaphthalene":{"A":7.86278,"B":2949.66,"C":279.805},"1,2,4,6-tetramethylnaphthalene":{"A":7.95793,"B":3085.24,"C":295.413},"1,2,4,7-tetramethylnaphthalene":{"A":7.95793,"B":3085.24,"C":295.413},"1,2,4,8-tetramethylnaphthalene":{"A":7.86278,"B":2949.66,"C":279.805},"1,2,5,6-tetramethylnaphthalene":{"A":7.95793,"B":3085.24,"C":295.413},"1,2,5,8-tetramethylnaphthalene":{"A":7.7702,"B":2820.59,"C":264.619},"1,2,6,8-tetramethylnaphthalene":{"A":7.38271,"B":2310.92,"C":201.059},"1,3,5,8-tetramethylnaphthalene":{"A":7.38271,"B":2310.92,"C":201.059},"1,3,6,7-tetramethylnaphthalene":{"A":7.38271,"B":2310.92,"C":201.059},"1,4,5,8-tetramethylnaphthalene":{"A":7.38271,"B":2310.92,"C":201.059},"1,4,6,7-tetramethylnaphthalene":{"A":7.38271,"B":2310.92,"C":201.059},"2,3,6,7-tetramethylnaphthalene":{"A":7.35979,"B":2282.32,"C":197.3},"2,2,3,3-tetramethyloctane":{"A":6.76997,"B":1485.02,"C":181.835},"2,2,3,4-tetramethyloctane":{"A":6.81806,"B":1483.69,"C":181.835},"2,2,3,5-tetramethyloctane":{"A":6.81387,"B":1470.32,"C":181.835},"2,2,3,6-tetramethyloctane":{"A":6.81667,"B":1479.23,"C":181.835},"2,2,3,7-tetramethyloctane":{"A":6.81667,"B":1479.23,"C":181.835},"2,2,4,4-tetramethyloctane":{"A":6.75915,"B":1449.86,"C":181.835},"2,2,4,5-tetramethyloctane":{"A":6.80677,"B":1448.03,"C":181.835},"2,2,4,6-tetramethyloctane":{"A":6.80389,"B":1439.12,"C":181.835},"2,2,4,7-tetramethyloctane":{"A":6.8036,"B":1438.23,"C":181.835},"2,2,5,5-tetramethyloctane":{"A":6.74795,"B":1414.74,"C":181.835},"2,2,5,6-tetramethyloctane":{"A":6.81105,"B":1461.4,"C":181.835},"2,2,5,7-tetramethyloctane":{"A":6.80389,"B":1439.12,"C":181.835},"2,2,6,6-tetramethyloctane":{"A":6.74937,"B":1419.12,"C":181.835},"2,2,6,7-tetramethyloctane":{"A":6.81247,"B":1465.86,"C":181.835},"2,2,7,7-tetramethyloctane":{"A":6.74937,"B":1419.12,"C":181.835},"2,3,3,4-tetramethyloctane":{"A":6.82628,"B":1510.46,"C":181.835},"2,3,3,5-tetramethyloctane":{"A":6.81667,"B":1479.23,"C":181.835},"2,3,3,6-tetramethyloctane":{"A":6.81944,"B":1488.15,"C":181.835},"2,3,3,7-tetramethyloctane":{"A":6.81944,"B":1488.15,"C":181.835},"2,3,4,4-tetramethyloctane":{"A":6.81944,"B":1488.15,"C":181.835},"2,3,4,5-tetramethyloctane":{"A":6.87605,"B":1513.54,"C":181.835},"2,3,4,6-tetramethyloctane":{"A":6.87323,"B":1504.48,"C":181.835},"2,3,4,7-tetramethyloctane":{"A":6.87181,"B":1499.96,"C":181.835},"2,3,5,5-tetramethyloctane":{"A":6.81806,"B":1483.69,"C":181.835},"2,3,5,6-tetramethyloctane":{"A":6.87323,"B":1504.48,"C":181.835},"2,3,5,7-tetramethyloctane":{"A":6.86607,"B":1481.86,"C":181.835},"2,3,6,6-tetramethyloctane":{"A":6.81527,"B":1474.77,"C":181.835},"2,3,6,7-tetramethyloctane":{"A":6.87464,"B":1509.01,"C":181.835},"2,4,4,5-tetramethyloctane":{"A":6.81247,"B":1465.86,"C":181.835},"2,4,4,6-tetramethyloctane":{"A":6.80389,"B":1439.12,"C":181.835},"2,4,4,7-tetramethyloctane":{"A":6.80244,"B":1434.67,"C":181.835},"2,4,5,5-tetramethyloctane":{"A":6.81387,"B":1470.32,"C":181.835},"2,4,5,6-tetramethyloctane":{"A":6.87181,"B":1499.96,"C":181.835},"2,4,5,7-tetramethyloctane":{"A":6.86068,"B":1465.13,"C":181.835},"2,4,6,6-tetramethyloctane":{"A":6.80677,"B":1448.03,"C":181.835},"2,5,5,6-tetramethyloctane":{"A":6.81667,"B":1479.23,"C":181.835},"2,5,6,6-tetramethyloctane":{"A":6.81944,"B":1488.15,"C":181.835},"3,3,4,4-tetramethyloctane":{"A":6.77261,"B":1493.81,"C":181.835},"3,3,4,5-tetramethyloctane":{"A":6.8222,"B":1497.08,"C":181.835},"3,3,4,6-tetramethyloctane":{"A":6.81944,"B":1488.15,"C":181.835},"3,3,5,5-tetramethyloctane":{"A":6.76595,"B":1471.83,"C":181.835},"3,3,5,6-tetramethyloctane":{"A":6.81527,"B":1474.77,"C":181.835},"3,3,6,6-tetramethyloctane":{"A":6.75597,"B":1439.76,"C":181.835},"3,4,4,5-tetramethyloctane":{"A":6.82628,"B":1510.46,"C":181.835},"3,4,4,6-tetramethyloctane":{"A":6.81806,"B":1483.69,"C":181.835},"3,4,5,5-tetramethyloctane":{"A":6.82082,"B":1492.61,"C":181.835},"3,4,5,6-tetramethyloctane":{"A":6.87885,"B":1522.59,"C":181.835},"4,4,5,5-tetramethyloctane":{"A":6.76997,"B":1485.02,"C":181.835},"2,2,3,3-tetramethylpentane":{"A":6.92311,"B":1455.54,"C":219.789},"2,2,3,4-tetramethylpentane":{"A":7.01955,"B":1500.49,"C":229.518},"2,2,4,4-tetramethylpentane":{"A":6.9758,"B":1436.93,"C":228.61},"2,3,3,4-tetramethylpentane":{"A":7.02486,"B":1518.1,"C":224.762},"2,3,4,5-tetramethylphenol":{"A":7.23935,"B":1852.38,"C":165},"2,3,4,6-tetramethylphenol":{"A":7.22548,"B":1803.04,"C":165},"2,3,5,6-tetramethylphenol":{"A":7.22265,"B":1793.18,"C":165},"tetramethylsilane":{"A":6.8719,"B":1060.66,"C":239.108},"tetranitromethane":{"A":6.98372,"B":1345.1,"C":202.141},"tetraphenylethylene":{"A":7.90699,"B":2818.91,"C":140.795},"tetratriacontane":{"A":7.15874,"B":2331.9,"C":63.1},"1-tetratriacontene":{"A":6.33376,"B":1700,"C":11.3333},"tetratriacontylamine":{"A":8.74438,"B":4638.96,"C":273.15},"tetratriacontylbenzene":{"A":6.6168,"B":2000,"C":13.3333},"tetratriacontylcyclohexane":{"A":6.58223,"B":2000,"C":13.3333},"tetratriacontylcyclopentane":{"A":5.30825,"B":1513.57,"C":103.528},"1-tetratriacontyne":{"A":5.90859,"B":1845.26,"C":131.445},"thiacyclobutane":{"A":7.12433,"B":1379.92,"C":230.202},"thiacyclodecane":{"A":6.90921,"B":1742.64,"C":193.59},"thiacyclododecane":{"A":6.89464,"B":1830.63,"C":188.08},"thiacycloeicosane":{"A":6.87331,"B":2121.65,"C":170.41},"thiacycloheneicosane":{"A":6.87156,"B":2153.05,"C":168.511},"thiacycloheptadecane":{"A":6.8778,"B":2023.68,"C":176.3},"thiacycloheptane":{"A":10.1272,"B":4808.53,"C":490.023},"thiacyclohexadecane":{"A":6.87969,"B":1989,"C":178.39},"thiacyclohexane":{"A":7.01195,"B":1486.57,"C":218.096},"thiacyclononadecane":{"A":6.87479,"B":2090.09,"C":172.31},"thiacyclononane":{"A":6.9198,"B":1685.07,"C":197.2},"thiacyclooctadecane":{"A":6.87618,"B":2058.45,"C":174.21},"thiacyclooctane":{"A":6.93308,"B":1618.39,"C":201.38},"thiacyclopentadecane":{"A":6.88218,"B":1951.35,"C":180.67},"thiacyclotetradecane":{"A":6.88528,"B":1913.94,"C":182.95},"thiacyclotridecane":{"A":6.88937,"B":1873.68,"C":185.42},"thiacycloundecane":{"A":6.90111,"B":1787.99,"C":190.74},"2-thianonadecane":{"A":8.40367,"B":3442.11,"C":250.247},"(1-thiapropyl)-benzene":{"A":7.14722,"B":1728.11,"C":200.05},"thioacetic-acid":{"A":6.87681,"B":1022.59,"C":168.894},"thiophene":{"A":7.06944,"B":1296.79,"C":225.437},"threo-4,4-dimethyl-2,3-pentanediol":{"A":9.33007,"B":3480.41,"C":273},"p-tolualdehyde":{"A":7.3225,"B":1813.93,"C":204.386},"m-toluenediamine":{"A":7.61109,"B":2208.99,"C":182.99},"toluene diisocyanate":{"A":7.39464,"B":1984.39,"C":189.623},"p-toluic acid":{"A":7.57616,"B":2079.93,"C":167.977},"m-toluidine":{"A":7.41381,"B":1909.19,"C":217.775},"p-toluidine":{"A":7.52469,"B":1948.19,"C":219.268},"tri-o-cresyl phosphate":{"A":9.9896,"B":3914.38,"C":237.263},"triacontane":{"A":7.12997,"B":2254.6,"C":80.9},"1-triacontene":{"A":6.14834,"B":1535.5,"C":21.9262},"triacontylamine":{"A":8.73528,"B":4444.42,"C":273.15},"triacontylbenzene":{"A":6.41023,"B":1800,"C":12},"triacontylcyclohexane":{"A":6.38276,"B":1800,"C":12},"triacontylcyclopentane":{"A":5.86298,"B":1784.39,"C":104.352},"1-triacontyne":{"A":6.16544,"B":1949.02,"C":147.377},"1,1,1-tribromo-2-methylpropane":{"A":7.15269,"B":1556.78,"C":151.845},"1,1,2-tribromo-2-methylpropane":{"A":7.14839,"B":1608.27,"C":146.858},"1,1,3-tribromo-2-methylpropane":{"A":7.28257,"B":1623.03,"C":153.354},"1,2,3-tribromo-2-methylpropane":{"A":7.2122,"B":1606.57,"C":150.914},"1,1,1-tribromobutane":{"A":7.21452,"B":1579.5,"C":153.469},"1,1,2-tribromobutane":{"A":7.28235,"B":1625.58,"C":153.121},"1,1,3-tribromobutane":{"A":7.28257,"B":1623.03,"C":153.354},"1,1,4-tribromobutane":{"A":7.3454,"B":1652.53,"C":154.333},"1,2,2-tribromobutane":{"A":7.21379,"B":1587.93,"C":152.674},"1,2,3-tribromobutane":{"A":7.28135,"B":1637.22,"C":152.051},"1,2,4-tribromobutane":{"A":7.34561,"B":1650.01,"C":154.559},"1,3,3-tribromobutane":{"A":7.22176,"B":1501.31,"C":160.849},"2,3,3-tribromobutane":{"A":7.1544,"B":1537.33,"C":153.729},"1,1,1-tribromodecane":{"A":7.46968,"B":2080.51,"C":141.381},"1,1,1-tribromododecane":{"A":7.54903,"B":2232.04,"C":138.136},"1,1,1-tribromoeicosane":{"A":7.54245,"B":2609.68,"C":124.82},"1,1,1-tribromoethane":{"A":7.15514,"B":1415.73,"C":158.218},"1,1,2-tribromoethane":{"A":7.28093,"B":1517.82,"C":156.019},"1,1,1-tribromoheptadecane":{"A":7.63001,"B":2530.59,"C":129.846},"1,1,1-tribromoheptane":{"A":7.33624,"B":1831.58,"C":147.09},"1,1,1-tribromohexadecane":{"A":7.63313,"B":2483.51,"C":131.589},"1,1,1-tribromohexane":{"A":7.2928,"B":1747.58,"C":149.098},"1,1,1-tribromononadecane":{"A":7.58584,"B":2591.07,"C":126.702},"1,1,1-tribromononane":{"A":7.42577,"B":2000.28,"C":143.11},"1,1,1-tribromooctadecane":{"A":7.61463,"B":2566.77,"C":128.22},"1,1,1-tribromooctane":{"A":7.38088,"B":1917.06,"C":145.008},"1,1,1-tribromopentadecane":{"A":7.6251,"B":2430.09,"C":133.214},"1,1,1-tribromopentane":{"A":7.25169,"B":1665.45,"C":151.034},"1,1,1-tribromopropane":{"A":7.18195,"B":1496.2,"C":155.862},"1,1,2-tribromopropane":{"A":7.24838,"B":1552.44,"C":154.448},"1,1,3-tribromopropane":{"A":7.30976,"B":1592.12,"C":154.48},"1,2,2-tribromopropane":{"A":7.18223,"B":1493.24,"C":156.152},"1,2,3-tribromopropane":{"A":7.30522,"B":1644.74,"C":149.584},"1,1,1-tribromotetradecane":{"A":7.60732,"B":2371.39,"C":134.721},"1,1,1-tribromotridecane":{"A":7.58147,"B":2305.01,"C":136.359},"1,1,1-tribromoundecane":{"A":7.51129,"B":2156.92,"C":139.81},"tributylamine":{"A":7.68482,"B":2143.4,"C":232.171},"tributyl borate":{"A":6.73482,"B":1805.5,"C":234.973},"1,2,2-trichloro-1,1-difluoroethane":{"A":7.07112,"B":1253.9,"C":227.337},"1,1,2-trichloro-1,2,2-trifluoroethane":{"A":6.97091,"B":1142.27,"C":231.677},"1,1,2-trichloro-1,2-difluoroethane":{"A":7.07039,"B":1256.05,"C":227.304},"1,1,2-trichloro-1-fluoroethane":{"A":6.87891,"B":1171.53,"C":205.022},"1,1,1-trichloro-2,2,2-trifluoroethane":{"A":7.25611,"B":1310.37,"C":253.615},"1,1,1-trichloro-2,2-difluoroethane":{"A":7.07365,"B":1259.97,"C":227.506},"1,1,1-trichloro-2-fluoroethane":{"A":7.12634,"B":1403.6,"C":237.758},"1,1,2-trichloro-2-fluoroethane":{"A":7.61234,"B":1625.36,"C":241.516},"1,1,1-trichloro-2-methylpropane":{"A":6.64561,"B":1177.41,"C":170.892},"1,1,2-trichloro-2-methylpropane":{"A":6.64481,"B":1184.25,"C":170.126},"1,1,3-trichloro-2-methylpropane":{"A":6.76281,"B":1221.99,"C":172.935},"1,2,3-trichloro-2-methylpropane":{"A":6.69453,"B":1256.96,"C":165.589},"trichloroacetaldehyde":{"A":7.25772,"B":1419.91,"C":226.71},"trichloroacetyl chloride":{"A":7.24512,"B":1488.96,"C":223.167},"1,2,4-trichlorobenzene":{"A":7.39117,"B":2027.84,"C":236.596},"1,2,3-trichlorobenzene":{"A":7.42844,"B":2063.53,"C":235.161},"1,3,5-trichlorobenzene":{"A":7.42973,"B":2022.18,"C":236.142},"1,1,1-trichlorobutane":{"A":6.70357,"B":1178.13,"C":174.189},"1,1,2-trichlorobutane":{"A":6.76123,"B":1235.39,"C":171.514},"1,1,3-trichlorobutane":{"A":7.04181,"B":1439.39,"C":192.925},"1,1,4-trichlorobutane":{"A":6.81814,"B":1257.39,"C":172.501},"1,2,2-trichlorobutane":{"A":6.69374,"B":1264.45,"C":164.773},"1,2,3-trichlorobutane":{"A":6.75553,"B":1286.68,"C":166.071},"1,2,4-trichlorobutane":{"A":6.81206,"B":1311.91,"C":166.863},"1,3,3-trichlorobutane":{"A":6.69954,"B":1211.89,"C":170.506},"2,3,3-trichlorobutane":{"A":6.64526,"B":1180.38,"C":170.559},"1,1,1-trichlorodecane":{"A":6.98001,"B":1702.41,"C":153.303},"1,1,1-trichlorododecane":{"A":7.06565,"B":1862.69,"C":148.104},"1,1,1-trichloroeicosane":{"A":7.12066,"B":2281.47,"C":131.102},"1,1,1-trichloroethane":{"A":7.00718,"B":1253.2,"C":229.624},"1,1,2-trichloroethane":{"A":7.14357,"B":1457.65,"C":228.099},"trichloroethylene":{"A":7.19536,"B":1419.51,"C":242.056},"trichlorofluoromethane":{"A":6.99349,"B":1081.98,"C":239.265},"1,1,1-trichloroheptadecane":{"A":7.17639,"B":2178.91,"C":137.245},"1,1,1-trichloroheptane":{"A":6.83774,"B":1445.91,"C":162.413},"1,1,1-trichlorohexadecane":{"A":7.1713,"B":2129.05,"C":139.225},"1,1,1-trichlorohexane":{"A":6.79092,"B":1356.95,"C":166.036},"1,1,1-trichlorononadecane":{"A":7.15205,"B":2256.02,"C":133.189},"1,1,1-trichlorononane":{"A":6.93315,"B":1620.69,"C":155.94},"1,1,1-trichlorooctadecane":{"A":7.17027,"B":2222.6,"C":135.156},"1,1,1-trichlorooctane":{"A":6.88547,"B":1534,"C":159.055},"1,1,1-trichloropentadecane":{"A":7.15641,"B":2070.85,"C":141.341},"1,1,1-trichloropentane":{"A":6.74621,"B":1264.88,"C":170.231},"1,1,1-trichloropropane":{"A":6.66582,"B":1081.25,"C":179.666},"1,1,2-trichloropropane":{"A":6.71828,"B":1170.83,"C":173.106},"1,1,3-trichloropropane":{"A":6.77034,"B":1228.3,"C":170.246},"1,2,2-trichloropropane":{"A":6.65996,"B":1124.97,"C":174.679},"1,2,3-trichloropropane":{"A":7.15238,"B":1612.2,"C":220.575},"1,1,1-trichlorotetradecane":{"A":7.13302,"B":2005.35,"C":143.603},"1,1,1-trichlorotridecane":{"A":7.10226,"B":1936.68,"C":145.772},"1,1,1-trichloroundecane":{"A":7.02449,"B":1784.3,"C":150.609},"tricosane":{"A":7.09051,"B":2083.8,"C":114.8},"1-tricosene":{"A":6.79262,"B":1874.14,"C":100.097},"tricosylamine":{"A":6.82295,"B":1964.06,"C":80.2225},"tricosylbenzene":{"A":6.32876,"B":1661.43,"C":35.8622},"tricosylcyclohexane":{"A":6.18522,"B":1582.73,"C":29.9755},"tricosylcyclopentane":{"A":6.59359,"B":1991.78,"C":97.4654},"1-tricosyne":{"A":8.37255,"B":3958.14,"C":342.745},"1-tridecanal":{"A":7.61338,"B":2142.83,"C":185.784},"tridecane":{"A":7.342,"B":1958.01,"C":203.429},"1,2-tridecanediol":{"A":9.53625,"B":3959.99,"C":273.001},"1,3-tridecanediol":{"A":9.53627,"B":4033.21,"C":273.001},"1,4-tridecanediol":{"A":9.53632,"B":4173.01,"C":273.001},"1,13-tridecanediol":{"A":9.56724,"B":4105.47,"C":273.001},"tridecanenitrile":{"A":7.28335,"B":1957.46,"C":151.621},"1-tridecanethiol":{"A":7.41106,"B":2158.27,"C":185.603},"2-tridecanethiol":{"A":7.1179,"B":1863.9,"C":157.9},"tridecanoic acid":{"A":7.67341,"B":2209.93,"C":149.014},"1-tridecanol":{"A":6.92012,"B":1653.37,"C":135.32},"2-tridecanol":{"A":6.8296,"B":1488.69,"C":109},"2-tridecanone":{"A":7.21343,"B":1868.68,"C":168.725},"1-tridecene":{"A":7.35746,"B":1970.61,"C":207.417},"tridecyl acetate":{"A":7.75524,"B":2300,"C":190},"tridecylamine":{"A":7.2686,"B":1944.23,"C":163.1},"tri-N-decylamine":{"A":9.42857,"B":4446.91,"C":273.15},"tridecylbenzene":{"A":7.57877,"B":2386.94,"C":166.8},"tridecyl butanoate":{"A":12.3594,"B":8223.72,"C":494.177},"tridecylcyclohexane":{"A":7.12823,"B":2079.95,"C":148.187},"tridecylcyclopentane":{"A":7.12123,"B":2006.63,"C":147.806},"1-tridecylcyclopentene":{"A":7.33709,"B":2187.63,"C":179.91},"tridecyl formate":{"A":7.62665,"B":2169.62,"C":153.073},"tridecyl propanoate":{"A":7.69073,"B":2600,"C":190},"1-tridecyne":{"A":7.2687,"B":1918.85,"C":203.295},"2-tridecyne":{"A":7.22602,"B":1935.6,"C":200.455},"3-tridecyne":{"A":7.22981,"B":1913.47,"C":201.978},"tridodecylamine":{"A":9.45922,"B":4744.02,"C":273.15},"trieicosylamine":{"A":9.27854,"B":5381.45,"C":273.15},"triethanolamine":{"A":8.44235,"B":2922.52,"C":185.639},"triethyl aluminum":{"A":14.835,"B":12972.3,"C":891.17},"triethylamine":{"A":7.15625,"B":1403.04,"C":239.392},"1,2,3-triethylbenzene":{"A":7.22336,"B":1839.35,"C":206.055},"1,2,4-triethylbenzene":{"A":7.3066,"B":1926.97,"C":217.886},"1,3,5-triethylbenzene":{"A":7.20241,"B":1812.07,"C":203.296},"triethylenediamine":{"A":7.14935,"B":1499.93,"C":177.393},"triethylene glycol":{"A":10.2245,"B":4208.28,"C":295.198},"triethylene glycol dimethyl ether":{"A":7.7215,"B":2009.47,"C":199.12},"triethylene tetramine":{"A":8.10228,"B":2320.5,"C":177.916},"3,3,4-triethylhexane":{"A":6.88335,"B":1552.33,"C":181.835},"triethyl phosphate":{"A":7.87023,"B":2317.27,"C":249.437},"1,1,1-trifluoro-2-methylpropane":{"A":6.68903,"B":839.927,"C":208.647},"1,1,2-trifluoro-2-methylpropane":{"A":6.68903,"B":839.927,"C":208.647},"1,1,3-trifluoro-2-methylpropane":{"A":6.80672,"B":879.193,"C":209.246},"trifluoroacetic acid":{"A":7.50596,"B":1399.76,"C":230.84},"1,1,1-trifluorobutane":{"A":7.14988,"B":1081.14,"C":236.55},"1,1,2-trifluorobutane":{"A":6.80672,"B":879.193,"C":209.246},"1,1,3-trifluorobutane":{"A":6.80672,"B":879.193,"C":209.246},"1,1,4-trifluorobutane":{"A":6.86451,"B":896.064,"C":209.793},"1,2,2-trifluorobutane":{"A":6.72945,"B":846.993,"C":207.726},"1,2,3-trifluorobutane":{"A":6.80672,"B":879.193,"C":209.246},"1,2,4-trifluorobutane":{"A":6.86451,"B":896.064,"C":209.793},"1,3,3-trifluorobutane":{"A":6.72945,"B":846.993,"C":207.726},"2,3,3-trifluorobutane":{"A":6.68903,"B":839.927,"C":208.647},"1,1,1-trifluorodecane":{"A":7.22905,"B":1659.07,"C":212.55},"1,1,1-trifluorododecane":{"A":7.27574,"B":1813.13,"C":204.55},"1,1,1-trifluoroeicosane":{"A":7.2509,"B":2169.97,"C":172.551},"1,1,1-trifluoroethane":{"A":7.07645,"B":846.165,"C":249.078},"1,1,2-trifluoroethane":{"A":6.77457,"B":841.127,"C":212.319},"trifluoroethene":{"A":8.70142,"B":1858.36,"C":371.413},"1,1,1-trifluoroheptadecane":{"A":7.30378,"B":2085.65,"C":184.551},"1,1,1-trifluoroheptane":{"A":7.16566,"B":1394.93,"C":224.55},"1,1,1-trifluorohexadecane":{"A":7.28321,"B":2027.53,"C":188.551},"1,1,1-trifluorohexane":{"A":7.14603,"B":1294.71,"C":228.55},"1,1,1-trifluorononadecane":{"A":7.26495,"B":2141.87,"C":176.551},"1,1,1-trifluorononane":{"A":7.21462,"B":1579.89,"C":216.55},"1,1,1-trifluorooctadecane":{"A":7.17133,"B":2044.65,"C":180.551},"1,1,1-trifluorooctane":{"A":7.1781,"B":1484.93,"C":220.55},"1,1,1-trifluoropentadecane":{"A":7.27457,"B":1975.21,"C":192.551},"1,1,1-trifluoropentane":{"A":7.13634,"B":1189.63,"C":232.55},"1,1,1-trifluoropropane":{"A":7.05706,"B":950.305,"C":240.55},"1,1,2-trifluoropropane":{"A":6.77248,"B":801.11,"C":214.032},"1,1,3-trifluoropropane":{"A":6.82998,"B":816.858,"C":214.583},"1,2,2-trifluoropropane":{"A":6.67704,"B":760.712,"C":210.916},"1,2,3-trifluoropropane":{"A":6.82998,"B":816.858,"C":214.583},"1,1,1-trifluorotetradecane":{"A":7.28945,"B":1933.41,"C":196.55},"1,1,1-trifluorotridecane":{"A":7.27102,"B":1868.25,"C":200.55},"1,1,1-trifluoroundecane":{"A":7.25173,"B":1737.66,"C":208.55},"triheptadecylamine":{"A":9.32726,"B":5177.46,"C":273.15},"triheptylamine":{"A":6.44215,"B":1318.59,"C":40.2525},"n-trihexacontane":{"A":7.21503,"B":2626.1,"C":-25.1},"trihexadecylamine":{"A":9.35545,"B":5109.46,"C":273.15},"trihexylamine":{"A":6.64438,"B":1299.04,"C":81.161},"1,1,1-triiocloheptadecane":{"A":7.13088,"B":2868.24,"C":83.4698},"1,1,1-triiodo-2-methylpropane":{"A":6.57065,"B":1543.38,"C":124.758},"1,1,2-triiodo-2-methylpropane":{"A":6.57065,"B":1543.38,"C":124.758},"1,1,3-triiodo-2-methylpropane":{"A":6.68462,"B":1609.82,"C":126.902},"1,2,3-triiodo-2-methylpropane":{"A":6.62467,"B":1572.8,"C":126.14},"1,1,1-triiodobutane":{"A":6.62467,"B":1572.8,"C":126.14},"1,1,2-triiodobutane":{"A":6.68462,"B":1609.82,"C":126.902},"1,1,3-triiodobutane":{"A":6.68462,"B":1609.82,"C":126.902},"1,1,4-triiodobutane":{"A":6.74014,"B":1639.98,"C":128.189},"1,2,2-triiodobutane":{"A":6.62467,"B":1572.8,"C":126.14},"1,2,3-triiodobutane":{"A":6.68462,"B":1609.82,"C":126.902},"1,2,4-triiodobutane":{"A":6.74014,"B":1639.98,"C":128.189},"1,3,3-triiodobutane":{"A":6.62467,"B":1572.8,"C":126.14},"2,2,3-triiodobutane":{"A":6.57065,"B":1543.38,"C":124.758},"1,1,1-triiododecane":{"A":6.90804,"B":2172.56,"C":108.227},"1,1,1-triiodododecane":{"A":6.99806,"B":2382.47,"C":101.656},"1,1,1-triiododononadecane":{"A":7.12052,"B":3020.83,"C":75.3491},"1,1,1-triiodoeicosane":{"A":7.09709,"B":3082.59,"C":71.0763},"1,1,1-triiodoethane":{"A":6.54774,"B":1392.91,"C":131.659},"1,1,2-triiodoethane":{"A":6.66064,"B":1455.13,"C":133.982},"1,1,1-triiodoheptane":{"A":6.76211,"B":1863.33,"C":117.48},"1,1,1-triiodohexadecane":{"A":7.11994,"B":2780.25,"C":87.3342},"1,1,1-triiodohexane":{"A":6.71429,"B":1763.96,"C":120.425},"1,1,1-triiodononane":{"A":6.85986,"B":2068.09,"C":111.386},"1,1,1-triiodooctadecane":{"A":7.13145,"B":2948.91,"C":79.4775},"1,1,1-triiodooctane":{"A":6.81091,"B":1964.84,"C":114.469},"1,1,1-triiodopentadecane":{"A":7.09989,"B":2686.36,"C":91.0781},"1,1,1-triiodopentane":{"A":6.66824,"B":1667.04,"C":123.31},"1,1,1-triiodopropane":{"A":6.58428,"B":1481.39,"C":128.922},"1,1,2-triiodopropane":{"A":6.64366,"B":1517.08,"C":129.745},"1,1,3-triiodopropane":{"A":6.69856,"B":1546.09,"C":131.105},"1,2,2-triiodopropane":{"A":6.58428,"B":1481.39,"C":128.922},"1,2,3-triiodopropane":{"A":6.69856,"B":1546.09,"C":131.105},"1,1,1-triiodotetradecane":{"A":7.07203,"B":2587.94,"C":94.7086},"1,1,1-triiodotridecane":{"A":7.03766,"B":2486.26,"C":98.2324},"1,1,1-triiodoundecane":{"A":6.95447,"B":2277.61,"C":104.986},"trimellitic anhydride":{"A":8.21048,"B":2807.76,"C":136.967},"2,2,3-trimethyl-1-butanol":{"A":8.24244,"B":2305.5,"C":273},"2,3,3-trimethyl-1-butanol":{"A":8.24245,"B":2321.59,"C":273},"2,3,3-trimethyl-1-butene":{"A":6.95371,"B":1268.94,"C":233.668},"3,3,5-trimethyl-1-hexanol":{"A":8.35372,"B":2549.56,"C":273},"3,4,4-trimethyl-1-hexanol":{"A":8.35372,"B":2539.43,"C":273},"3,5,5-trimethyl-1-hexanol":{"A":8.35372,"B":2550.38,"C":273},"4,5,5-trimethyl-1-hexanol":{"A":8.35375,"B":2599.65,"C":273},"2,2,3-trimethyl-1-pentanol":{"A":7.50271,"B":1653.16,"C":183.18},"2,2,4-trimethyl-1-pentanol":{"A":7.68641,"B":1793.29,"C":204.867},"2,3,3-trimethyl-1-pentanol":{"A":8.29874,"B":2431.84,"C":273},"2,3,4-trimethyl-1-pentanol":{"A":8.37849,"B":2506.94,"C":273},"2,4,4-trimethyl-1-pentanol":{"A":7.8087,"B":1917.64,"C":218.14},"3,3,4-trimethyl-1-pentanol":{"A":8.29872,"B":2404.74,"C":273},"3,4,4-trimethyl-1-pentanol":{"A":8.29872,"B":2404.74,"C":273},"2,3,3-trimethyl-1-pentene":{"A":6.73853,"B":1209.83,"C":205.304},"2,3,4-trimethyl-1-pentene":{"A":6.82685,"B":1255.61,"C":210.194},"2,4,4-trimethyl-1-pentene":{"A":6.91487,"B":1333.24,"C":229.057},"3,3,4-trimethyl-1-pentene":{"A":6.7161,"B":1184.86,"C":203.936},"3,4,4-trimethyl-1-pentene":{"A":6.71291,"B":1179.17,"C":203.71},"2,3,3-trimethyl-2-butanol":{"A":8.09015,"B":2104.57,"C":273},"1,3,5-trimethyl-2-ethylbenzene":{"A":7.11252,"B":1739.42,"C":198.644},"2,4,6-trimethyl-2-heptanol":{"A":8.33676,"B":2541.66,"C":273},"2,5,6-trimethyl-2-heptanol":{"A":8.33676,"B":2542.47,"C":273},"4,6,6-trimethyl-2-heptanol":{"A":8.33676,"B":2541.66,"C":273},"2,3,4-trimethyl-2-hexanol":{"A":8.28295,"B":2516.59,"C":273},"2,4,4-trimethyl-2-hexanol":{"A":8.205,"B":2480.28,"C":273},"2,4,5-trimethyl-2-hexanol":{"A":8.28295,"B":2516.59,"C":273},"2,5,5-trimethyl-2-hexanol":{"A":8.205,"B":2480.28,"C":273},"2,3,3-trimethyl-2-pentanol":{"A":7.94246,"B":2073.58,"C":249.666},"2,3,4-trimethyl-2-pentanol":{"A":8.22674,"B":2304.1,"C":273},"2,4,4-trimethyl-2-pentanol":{"A":7.62622,"B":1717.78,"C":215.589},"3,3,4-trimethyl-2-pentanol":{"A":8.22677,"B":2341.53,"C":273},"3,4,4-trimethyl-2-pentanol":{"A":7.4639,"B":1587.97,"C":188.484},"2,3,4-trimethyl-2-pentene":{"A":6.85304,"B":1305.1,"C":212.295},"2,4,4-trimethyl-2-pentene":{"A":6.88636,"B":1320.64,"C":224.794},"3,4,4-trimethyl-cis-2-pentene":{"A":6.72445,"B":1217.28,"C":204.7},"3,4,4-trimethyl-trans-2-pentene":{"A":6.72672,"B":1219.14,"C":204.998},"2,2,4-trimethyl-3,3-diethylpentane":{"A":6.72801,"B":1492.08,"C":181.835},"2,2,4-trimethyl-3-ethyl-3-pentanol":{"A":8.1911,"B":2463.98,"C":273},"1,2,4-trimethyl-3-ethylbenzene":{"A":7.11147,"B":1753.38,"C":197.846},"2,2,3-trimethyl-3-ethylheptane":{"A":6.76997,"B":1485.02,"C":181.835},"2,2,4-trimethyl-3-ethylheptane":{"A":6.81387,"B":1470.32,"C":181.835},"2,2,5-trimethyl-3-ethylheptane":{"A":6.81105,"B":1461.4,"C":181.835},"2,2,6-trimethyl-3-ethylheptane":{"A":6.81105,"B":1461.4,"C":181.835},"2,3,4-trimethyl-3-ethylheptane":{"A":6.82897,"B":1519.39,"C":181.835},"2,3,5-trimethyl-3-ethylheptane":{"A":6.82151,"B":1494.84,"C":181.835},"2,3,6-trimethyl-3-ethylheptane":{"A":6.81944,"B":1488.15,"C":181.835},"2,4,4-trimethyl-3-ethylheptane":{"A":6.81667,"B":1479.23,"C":181.835},"2,4,5-trimethyl-3-ethylheptane":{"A":6.87464,"B":1509.01,"C":181.835},"2,4,6-trimethyl-3-ethylheptane":{"A":6.86752,"B":1486.38,"C":181.835},"2,5,5-trimethyl-3-ethylheptane":{"A":6.81105,"B":1461.4,"C":181.835},"3,4,4-trimethyl-3-ethylheptane":{"A":6.77654,"B":1507.01,"C":181.835},"3,4,5-trimethyl-3-ethylheptane":{"A":6.82763,"B":1514.93,"C":181.835},"2,2,3-trimethyl-3-ethylhexane":{"A":6.74142,"B":1419.55,"C":187.7},"2,2,4-trimethyl-3-ethylhexane":{"A":6.79014,"B":1417.91,"C":187.7},"2,2,5-trimethyl-3-ethylhexane":{"A":6.78318,"B":1395.88,"C":187.7},"2,3,4-trimethyl-3-ethylhexane":{"A":6.8062,"B":1470.84,"C":187.7},"2,3,5-trimethyl-3-ethylhexane":{"A":6.79151,"B":1422.32,"C":187.7},"2,4,4-trimethyl-3-ethylhexane":{"A":6.79423,"B":1431.14,"C":187.7},"2,2,3-trimethyl-3-heptanol":{"A":8.26031,"B":2469.19,"C":273},"2,2,6-trimethyl-3-heptanol":{"A":8.33675,"B":2525.28,"C":273},"2,3,6-trimethyl-3-heptanol":{"A":8.33675,"B":2525.28,"C":273},"3,5,5-trimethyl-3-heptanol":{"A":8.26033,"B":2520.85,"C":273},"2,2,3-trimethyl-3-hexanol":{"A":8.20495,"B":2375.1,"C":273},"2,2,4-trimethyl-3-hexanol":{"A":8.28288,"B":2387.72,"C":273},"2,2,5-trimethyl-3-hexanol":{"A":8.28286,"B":2339.09,"C":273},"2,3,4-trimethyl-3-hexanol":{"A":8.28287,"B":2370.7,"C":273},"2,3,5-trimethyl-3-hexanol":{"A":8.28287,"B":2370.7,"C":273},"2,4,4-trimethyl-3-hexanol":{"A":8.28289,"B":2398.52,"C":273},"2,5,5-trimethyl-3-hexanol":{"A":8.28288,"B":2386.91,"C":273},"3,4,4-trimethyl-3-hexanol":{"A":8.20493,"B":2337.29,"C":273},"3,5,5-trimethyl-3-hexanol":{"A":8.20493,"B":2336.49,"C":273},"2,2,3-trimethyl-3-isopropylhexane":{"A":6.72159,"B":1470.39,"C":181.835},"2,2,4-trimethyl-3-isopropylhexane":{"A":6.75993,"B":1438.51,"C":181.835},"2,2,5-trimethyl-3-isopropylhexane":{"A":6.74712,"B":1398.97,"C":181.835},"2,3,4-trimethyl-3-isopropylhexane":{"A":6.7802,"B":1504.52,"C":181.835},"2,3,5-trimethyl-3-isopropylhexane":{"A":6.76683,"B":1460.5,"C":181.835},"2,4,4-trimethyl-3-isopropylhexane":{"A":6.76409,"B":1451.7,"C":181.835},"2,2,4-trimethyl-3-isopropylpentane":{"A":6.73293,"B":1377.9,"C":187.7},"2,3,4-trimethyl-3-isopropylpentane":{"A":6.7542,"B":1447.49,"C":187.7},"2,2,3-trimethyl-3-pentanol":{"A":7.78541,"B":1886.21,"C":232.58},"2,2,4-trimethyl-3-pentanol":{"A":7.56515,"B":1648.39,"C":200.894},"2,3,4-trimethyl-3-pentanol":{"A":8.3631,"B":2440.02,"C":288.073},"1,2,3-trimethyl-4-ethylbenzene":{"A":7.11053,"B":1766.01,"C":197.124},"2,2,3-trimethyl-4-ethylheptane":{"A":6.81527,"B":1474.77,"C":181.835},"2,2,4-trimethyl-4-ethylheptane":{"A":6.76189,"B":1458.64,"C":181.835},"2,2,5-trimethyl-4-ethylheptane":{"A":6.80533,"B":1443.58,"C":181.835},"2,2,6-trimethyl-4-ethylheptane":{"A":6.79657,"B":1416.86,"C":181.835},"2,3,3-trimethyl-4-ethylheptane":{"A":6.82356,"B":1501.54,"C":181.835},"2,3,4-trimethyl-4-ethylheptane":{"A":6.8222,"B":1497.08,"C":181.835},"2,3,5-trimethyl-4-ethylheptane":{"A":6.87464,"B":1509.01,"C":181.835},"2,3,6-trimethyl-4-ethylheptane":{"A":6.86607,"B":1481.86,"C":181.835},"2,4,5-trimethyl-4-ethylheptane":{"A":6.81806,"B":1483.69,"C":181.835},"2,4,6-trimethyl-4-ethylheptane":{"A":6.80389,"B":1439.12,"C":181.835},"2,5,5-trimethyl-4-ethylheptane":{"A":6.81387,"B":1470.32,"C":181.835},"3,3,4-trimethyl-4-ethylheptane":{"A":6.77654,"B":1507.01,"C":181.835},"3,3,5-trimethyl-4-ethylheptane":{"A":6.82082,"B":1492.61,"C":181.835},"3,4,5-trimethyl-4-ethylheptane":{"A":6.83164,"B":1528.32,"C":181.835},"2,2,3-trimethyl-4-ethylhexane":{"A":6.79151,"B":1422.32,"C":187.7},"2,2,4-trimethyl-4-ethylhexane":{"A":6.73878,"B":1410.86,"C":187.7},"2,2,5-trimethyl-4-ethylhexane":{"A":6.77751,"B":1378.26,"C":187.7},"2,3,3-trimethyl-4-ethylhexane":{"A":6.80094,"B":1453.19,"C":187.7},"2,3,4-trimethyl-4-ethylhexane":{"A":6.79693,"B":1439.96,"C":187.7},"2,3,5-trimethyl-4-ethylhexane":{"A":6.84878,"B":1447.12,"C":187.7},"3,3,4-trimethyl-4-ethylhexane":{"A":6.75429,"B":1463.01,"C":187.7},"2,2,4-trimethyl-4-heptanol":{"A":8.26029,"B":2442.29,"C":273},"2,2,5-trimethyl-4-heptanol":{"A":8.33673,"B":2481.63,"C":273},"2,2,6-trimethyl-4-heptanol":{"A":8.33673,"B":2481.63,"C":273},"2,4,5-trimethyl-4-heptanol":{"A":8.33673,"B":2481.63,"C":273},"2,4,6-trimethyl-4-heptanol":{"A":8.33673,"B":2482.44,"C":273},"3,3,6-trimethyl-4-heptanol":{"A":8.33673,"B":2481.63,"C":273},"2,2,5-trimethyl-4-isopropylhexane":{"A":6.74712,"B":1398.97,"C":181.835},"2,3,5-trimethyl-4-isopropylhexane":{"A":6.81606,"B":1463.26,"C":181.835},"1,2,3-trimethyl-5-ethylbenzene":{"A":7.11167,"B":1750.72,"C":197.998},"1,2,4-trimethyl-5-ethylbenzene":{"A":7.11237,"B":1741.41,"C":198.53},"2,2,3-trimethyl-5-ethylheptane":{"A":6.81387,"B":1470.32,"C":181.835},"2,2,4-trimethyl-5-ethylheptane":{"A":6.80677,"B":1448.03,"C":181.835},"2,2,5-trimethyl-5-ethylheptane":{"A":6.75499,"B":1436.68,"C":181.835},"2,2,6-trimethyl-5-ethylheptane":{"A":6.80677,"B":1448.03,"C":181.835},"2,3,3-trimethyl-5-ethylheptane":{"A":6.81667,"B":1479.23,"C":181.835},"2,3,4-trimethyl-5-ethylheptane":{"A":6.87605,"B":1513.54,"C":181.835},"2,3,5-trimethyl-5-ethylheptane":{"A":6.81667,"B":1479.23,"C":181.835},"2,3,6-trimethyl-5-ethylheptane":{"A":6.87039,"B":1495.43,"C":181.835},"2,4,4-trimethyl-5-ethylheptane":{"A":6.81387,"B":1470.32,"C":181.835},"2,4,5-trimethyl-5-ethylheptane":{"A":6.82082,"B":1492.61,"C":181.835},"3,3,4-trimethyl-5-ethylheptane":{"A":6.82356,"B":1501.54,"C":181.835},"3,3,5-trimethyl-5-ethylheptane":{"A":6.77261,"B":1493.81,"C":181.835},"3,4,4-trimethyl-5-ethylheptane":{"A":6.82763,"B":1514.93,"C":181.835},"1,2,4-trimethyl-6-ethylbenzene":{"A":7.11237,"B":1741.41,"C":198.53},"trimethylamine":{"A":6.94803,"B":981.847,"C":238.535},"1,2,3-trimethylbenzene":{"A":7.29803,"B":1789.65,"C":229.034},"1,2,4-trimethylbenzene":{"A":7.29329,"B":1763.35,"C":230.248},"2,3'-trimethylbiphenyl":{"A":7.29847,"B":2036.27,"C":186.94},"2,2,3-trimethylbutane":{"A":6.95435,"B":1285.26,"C":234.634},"1,1,2-trimethylcyclohexane":{"A":6.94273,"B":1506.31,"C":225.636},"1,1,3-trimethylcyclohexane":{"A":6.88664,"B":1423.78,"C":218.801},"1,1,4-trimethylcyclohexane":{"A":6.96341,"B":1488.77,"C":229.663},"1,cis-2,cis-3-trimethylcyclohexane":{"A":7.18023,"B":1775.68,"C":260.004},"1,cis-2,trans-3-trimethylcyclohexane":{"A":7.12655,"B":1712.77,"C":252.409},"1,trans-2,cis-3-trimethylcyclohexane":{"A":7.07006,"B":1628.89,"C":244.827},"1,cis-2,cis-4-trimethylcyclohexane":{"A":7.19435,"B":1769.23,"C":262.158},"1,cis-2,trans-4-trimethylcyclohexane":{"A":7.12513,"B":1699.23,"C":252.355},"1,trans-2,cis-4-trimethylcyclohexane":{"A":7.12376,"B":1685.77,"C":252.31},"1,trans-2,trans-4-trimethylcyclohexane":{"A":7.12339,"B":1670.16,"C":252.447},"cis,cis-1,3,5-trimethylcyclohexane":{"A":6.50756,"B":1109.19,"C":167.326},"1,cis-3,cis-5-trimethylcyclohexane":{"A":6.91826,"B":1464.01,"C":224.198},"cis,trans-1,3,5-trimethylcyclohexane":{"A":6.74735,"B":1259.42,"C":185.173},"1,cis-3,trans-5-trimethylcyclohexane":{"A":7.14842,"B":1694.9,"C":255.935},"1,1,2-trimethylcyclopentane":{"A":6.89769,"B":1352.09,"C":222.874},"1,1,3-trimethylcyclopentane":{"A":6.90859,"B":1330.51,"C":225.44},"1,cis-2,cis-3-trimethylcyclopentane":{"A":6.85592,"B":1353.28,"C":217.439},"1,cis-2,trans-3-trimethylcyclopentane":{"A":6.85907,"B":1337.21,"C":218.63},"1,trans-2,cis-3-trimethylcyclopentane":{"A":6.88171,"B":1331.51,"C":222.602},"1,cis-2,cis-4-trimethylcyclopentane":{"A":6.84752,"B":1325.54,"C":217.167},"1,cis-2,trans-4-trimethylcyclopentane":{"A":6.86539,"B":1340.05,"C":219.577},"1,trans-2,cis-4-trimethylcyclopentane":{"A":6.86663,"B":1315.52,"C":220.76},"1,1,2-trimethylcyclopropane":{"A":6.89286,"B":1129.3,"C":229.037},"1,cis-2,cis-3-trimethylcyclopropane":{"A":6.88104,"B":1169.91,"C":226.46},"1,cis-2,trans-3-trimethylcyclopropane":{"A":6.88388,"B":1150.31,"C":227.657},"2,2,3-trimethylheptane":{"A":6.98152,"B":1511.32,"C":210.941},"2,2,4-trimethylheptane":{"A":6.96492,"B":1462.88,"C":209.877},"2,2,5-trimethylheptane":{"A":6.96153,"B":1468.3,"C":209.004},"2,2,6-trimethylheptane":{"A":6.9372,"B":1436.9,"C":205.291},"2,3,3-trimethylheptane":{"A":6.99216,"B":1531.96,"C":212.408},"2,3,4-trimethylheptane":{"A":7.03388,"B":1550.68,"C":213.471},"2,3,5-trimethylheptane":{"A":7.06065,"B":1577.57,"C":216.713},"2,3,6-trimethylheptane":{"A":6.9979,"B":1501.74,"C":208.748},"2,4,4-trimethylheptane":{"A":6.99734,"B":1501.67,"C":213.781},"2,4,5-trimethylheptane":{"A":7.02361,"B":1528.5,"C":212.444},"2,4,6-trimethylheptane":{"A":6.9716,"B":1445.59,"C":205.766},"2,5,5-trimethylheptane":{"A":6.96672,"B":1480.75,"C":209.595},"3,3,4-trimethylheptane":{"A":7.00517,"B":1552.26,"C":214.453},"3,3,5-trimethylheptane":{"A":7.0502,"B":1556.29,"C":217.567},"3,4,4-trimethylheptane":{"A":7.01159,"B":1554.96,"C":215.323},"3,4,5-trimethylheptane":{"A":7.12971,"B":1626.17,"C":220.217},"2,2,3-trimethylhexane":{"A":6.96485,"B":1433.93,"C":217.506},"2,2,4-trimethylhexane":{"A":6.97344,"B":1412.33,"C":218.55},"2,2,5-trimethylhexane":{"A":7.06137,"B":1478.01,"C":229.455},"2,3,3-trimethylhexane":{"A":6.992,"B":1472.03,"C":220.366},"2,3,4-trimethylhexane":{"A":7.0358,"B":1496.67,"C":221.16},"2,3,5-trimethylhexane":{"A":6.99147,"B":1429.28,"C":216.351},"2,4,4-trimethylhexane":{"A":7.01244,"B":1463.45,"C":223.546},"3,3,4-trimethylhexane":{"A":7.00502,"B":1492.7,"C":221.465},"1,2,3-trimethylindene":{"A":7.36551,"B":2064.49,"C":224.491},"1,2,3-trimethylnaphthalene":{"A":6.63966,"B":1408.87,"C":91.8152},"1,2,4-trimethylnaphthalene":{"A":7.02335,"B":1804.25,"C":153.543},"1,2,5-trimethylnaphthalene":{"A":7.31087,"B":2125.64,"C":199.822},"1,2,6-trimethylnaphthalene":{"A":6.96852,"B":1738.22,"C":145.232},"1,2,7-trimethylnaphthalene":{"A":7.20694,"B":1996.82,"C":183.573},"1,2,8-trimethylnaphthalene":{"A":7.33601,"B":2175.03,"C":203.202},"1,3,5-trimethylnaphthalene":{"A":7.2452,"B":2065.09,"C":188.668},"1,3,6-trimethylnaphthalene":{"A":7.07844,"B":1858.53,"C":162.758},"1,3,7-trimethylnaphthalene":{"A":7.35135,"B":2173.92,"C":206.276},"1,3,8-trimethylnaphthalene":{"A":7.76864,"B":2726.48,"C":272.811},"1,4,5-trimethylnaphthalene":{"A":7.25977,"B":2084.1,"C":190.936},"1,4,6-trimethylnaphthalene":{"A":7.13496,"B":1914.95,"C":172.137},"2,3,6-trimethylnaphthalene":{"A":7.14454,"B":1922.26,"C":173.84},"1,6,7-trimethylnaphthalene":{"A":7.27091,"B":2078.49,"C":193.449},"2,2,3-trimethylnonane":{"A":6.87515,"B":1525.18,"C":181.835},"2,2,4-trimethylnonane":{"A":6.86245,"B":1484.49,"C":181.835},"2,2,5-trimethylnonane":{"A":6.86245,"B":1484.49,"C":181.835},"2,2,6-trimethylnonane":{"A":6.861,"B":1479.97,"C":181.835},"2,2,7-trimethylnonane":{"A":6.86815,"B":1502.57,"C":181.835},"2,2,8-trimethylnonane":{"A":6.86815,"B":1502.57,"C":181.835},"2,3,3-trimethylnonane":{"A":6.87791,"B":1534.23,"C":181.835},"2,3,4-trimethylnonane":{"A":6.9307,"B":1546.39,"C":181.835},"2,3,5-trimethylnonane":{"A":6.925,"B":1528.04,"C":181.835},"2,3,6-trimethylnonane":{"A":6.92786,"B":1537.21,"C":181.835},"2,3,7-trimethylnonane":{"A":6.93211,"B":1550.98,"C":181.835},"2,3,8-trimethylnonane":{"A":6.9307,"B":1546.39,"C":181.835},"2,4,4-trimethylnonane":{"A":6.861,"B":1479.97,"C":181.835},"2,4,5-trimethylnonane":{"A":6.92356,"B":1523.45,"C":181.835},"2,4,6-trimethylnonane":{"A":6.9192,"B":1509.69,"C":181.835},"2,4,7-trimethylnonane":{"A":6.92211,"B":1518.86,"C":181.835},"2,4,8-trimethylnonane":{"A":6.91773,"B":1505.11,"C":181.835},"2,5,5-trimethylnonane":{"A":6.861,"B":1479.97,"C":181.835},"2,5,6-trimethylnonane":{"A":6.925,"B":1528.04,"C":181.835},"2,5,7-trimethylnonane":{"A":6.92211,"B":1518.86,"C":181.835},"2,5,8-trimethylnonane":{"A":6.9192,"B":1509.69,"C":181.835},"2,6,6-trimethylnonane":{"A":6.861,"B":1479.97,"C":181.835},"2,6,7-trimethylnonane":{"A":6.92928,"B":1541.8,"C":181.835},"2,7,7-trimethylnonane":{"A":6.87097,"B":1511.61,"C":181.835},"3,3,4-trimethylnonane":{"A":6.87791,"B":1534.23,"C":181.835},"3,3,5-trimethylnonane":{"A":6.861,"B":1479.97,"C":181.835},"3,3,7-trimethylnonane":{"A":6.86815,"B":1502.57,"C":181.835},"3,3,6-trimethylnonane":{"A":6.87237,"B":1516.13,"C":181.835},"3,4,4-trimethylnonane":{"A":6.87515,"B":1525.18,"C":181.835},"3,4,5-trimethylnonane":{"A":6.9307,"B":1546.39,"C":181.835},"3,4,6-trimethylnonane":{"A":6.92643,"B":1532.62,"C":181.835},"3,4,7-trimethylnonane":{"A":6.9307,"B":1546.39,"C":181.835},"3,5,5-trimethylnonane":{"A":6.86245,"B":1484.49,"C":181.835},"3,5,6-trimethylnonane":{"A":6.92643,"B":1532.62,"C":181.835},"3,5,7-trimethylnonane":{"A":6.92356,"B":1523.45,"C":181.835},"3,6,6-trimethylnonane":{"A":6.861,"B":1479.97,"C":181.835},"4,4,5-trimethylnonane":{"A":6.87237,"B":1516.13,"C":181.835},"4,4,6-trimethylnonane":{"A":6.86245,"B":1484.49,"C":181.835},"4,5,5-trimethylnonane":{"A":6.87237,"B":1516.13,"C":181.835},"4,5,6-trimethylnonane":{"A":6.92786,"B":1537.21,"C":181.835},"2,2,3-trimethyloctane":{"A":6.84644,"B":1454.19,"C":187.7},"2,2,4-trimethyloctane":{"A":6.83592,"B":1420.68,"C":187.7},"2,2,5-trimethyloctane":{"A":6.83521,"B":1418.44,"C":187.7},"2,2,6-trimethyloctane":{"A":6.83947,"B":1431.85,"C":187.7},"2,2,7-trimethyloctane":{"A":6.83378,"B":1413.98,"C":187.7},"2,3,3-trimethyloctane":{"A":6.85054,"B":1467.61,"C":187.7},"2,3,4-trimethyloctane":{"A":6.90417,"B":1479.39,"C":187.7},"2,3,5-trimethyloctane":{"A":6.89993,"B":1465.77,"C":187.7},"2,3,6-trimethyloctane":{"A":6.90417,"B":1479.39,"C":187.7},"2,3,7-trimethyloctane":{"A":6.90276,"B":1474.85,"C":187.7},"2,4,4-trimethyloctane":{"A":6.83521,"B":1418.44,"C":187.7},"2,4,5-trimethyloctane":{"A":6.89851,"B":1461.24,"C":187.7},"2,4,6-trimethyloctane":{"A":6.89564,"B":1452.17,"C":187.7},"2,4,7-trimethyloctane":{"A":6.8913,"B":1438.56,"C":187.7},"2,5,5-trimethyloctane":{"A":6.83663,"B":1422.91,"C":187.7},"2,5,6-trimethyloctane":{"A":6.90135,"B":1470.31,"C":187.7},"2,6,6-trimethyloctane":{"A":6.84227,"B":1440.78,"C":187.7},"3,3,4-trimethyloctane":{"A":6.85054,"B":1467.61,"C":187.7},"3,3,5-trimethyloctane":{"A":6.83947,"B":1431.85,"C":187.7},"3,3,6-trimethyloctane":{"A":6.84367,"B":1445.25,"C":187.7},"3,4,4-trimethyloctane":{"A":6.84918,"B":1463.14,"C":187.7},"3,4,5-trimethyloctane":{"A":6.90557,"B":1483.93,"C":187.7},"3,4,6-trimethyloctane":{"A":6.90276,"B":1474.85,"C":187.7},"3,5,5-trimethyloctane":{"A":6.83378,"B":1413.98,"C":187.7},"4,4,5-trimethyloctane":{"A":6.84781,"B":1458.67,"C":187.7},"trimethylolpropane":{"A":10.529,"B":4294.67,"C":272.635},"2,2,3-trimethylpentane":{"A":7.02209,"B":1416.58,"C":232.214},"2,2,4-trimethylpentane":{"A":6.99021,"B":1358.75,"C":231.405},"2,3,3-trimethylpentane":{"A":7.03244,"B":1443.86,"C":233.013},"2,3,4-trimethylpentane":{"A":7.07131,"B":1452.82,"C":233.223},"2,3,4-trimethylphenol":{"A":7.18231,"B":1729.2,"C":165},"2,3,5-trimethylphenol":{"A":7.17999,"B":1721.39,"C":165},"2,3,6-trimethylphenol":{"A":7.18209,"B":1728.47,"C":165},"2,4,5-trimethylphenol":{"A":7.17999,"B":1721.39,"C":165},"2,4,6-trimethylphenol":{"A":7.15816,"B":1650.2,"C":165},"3,4,5-trimethylphenol":{"A":7.20306,"B":1801.52,"C":165},"trimethyl phosphate":{"A":7.62138,"B":2069.63,"C":243.878},"2,4,6-trimethylpyridine":{"A":7.27424,"B":1741.56,"C":225.55},"trimethyl silane":{"A":6.90193,"B":1030.41,"C":249.55},"2,2,3-trimethylthiacyclopropane":{"A":6.92835,"B":1265.02,"C":221.75},"2,3,4-trimethylthiophene":{"A":7.26221,"B":1660.06,"C":206.187},"2,3,5-trimethylthiophene":{"A":7.08675,"B":1565.64,"C":207.745},"1,3,5-trinitrobenzene":{"A":9.85104,"B":6399.03,"C":443.202},"2,4,6-trinitrotoluene":{"A":7.35106,"B":2010.84,"C":149.978},"trinonadecylamine":{"A":9.28913,"B":5313.45,"C":273.15},"trinonylamine":{"A":6.3335,"B":1350,"C":9},"trioctadecylamine":{"A":9.30789,"B":5245.46,"C":273.15},"trioctylamine":{"A":6.16848,"B":1200,"C":8},"trioxane":{"A":7.34399,"B":1484.18,"C":218.039},"tripentadecylamine":{"A":9.4015,"B":5041.47,"C":273.15},"tripentylamine":{"A":6.83325,"B":1403.73,"C":112.154},"triphenylethylene":{"A":7.347,"B":2553.77,"C":175.95},"triphenyl phosphate":{"A":8.18951,"B":3328.64,"C":213.517},"triphenylphosphine":{"A":7.72816,"B":2717.52,"C":183.621},"tripropylamine":{"A":7.59939,"B":1754.25,"C":215.275},"tritetradecylamine":{"A":9.44949,"B":4973.47,"C":273.15},"tritriacontane":{"A":7.14856,"B":2314.4,"C":67.3},"1-tritriacontene":{"A":6.2899,"B":1650,"C":11},"tritriacontylamine":{"A":8.72458,"B":4582.39,"C":273.15},"tritriacontylbenzene":{"A":6.56701,"B":1950,"C":13},"tritriacontylcyclohexane":{"A":6.5325,"B":1950,"C":13},"tritriacontylcyclopentane":{"A":5.44368,"B":1582.39,"C":103.432},"1-tritriacontyne":{"A":5.96393,"B":1869.19,"C":135.266},"tritridecylamine":{"A":9.46483,"B":4873.16,"C":273.15},"triundecylamine":{"A":9.4483,"B":4604.79,"C":273.15},"undecanal":{"A":7.64132,"B":2112.13,"C":210.678},"undecane":{"A":7.18058,"B":1706.26,"C":200.897},"1,2-undecanediol":{"A":9.6299,"B":3826.74,"C":273.001},"1,3-undecanediol":{"A":9.62993,"B":3900.99,"C":273.001},"1,4-undecanediol":{"A":9.62998,"B":4042.76,"C":273.001},"1,11-undecanediol":{"A":9.67757,"B":3982.9,"C":273.001},"undecanenitrile":{"A":7.25467,"B":1822.67,"C":156.721},"1-undecanethiol":{"A":7.22678,"B":1845.59,"C":167.267},"2-undecanethiol":{"A":7.09207,"B":1759.04,"C":170.4},"undecanoic acid":{"A":7.57033,"B":2016.72,"C":145.848},"1-undecanol":{"A":6.91093,"B":1551.12,"C":139.882},"2-undecanol":{"A":6.8416,"B":1417.96,"C":123},"2-undecanone":{"A":7.10455,"B":1672.11,"C":168.055},"1-undecene":{"A":7.17524,"B":1699.83,"C":203.153},"undecyl acetate":{"A":7.91687,"B":2200,"C":190},"undecylamine":{"A":7.1033,"B":1698.33,"C":159.211},"undecylbenzene":{"A":7.48314,"B":2272.37,"C":180.494},"undecyl butanoate":{"A":5.1353,"B":750,"C":5},"undecylcyclohexane":{"A":7.16018,"B":2045.12,"C":164.793},"undecylcyclopentane":{"A":7.16056,"B":1978.5,"C":166.683},"1-undecylcyclopentene":{"A":7.28818,"B":2067.23,"C":185.04},"undecyl formate":{"A":7.16557,"B":1783.44,"C":157.899},"1-undecylnaphthalene":{"A":7.49911,"B":2566.44,"C":164.711},"2-undecylnaphthalene":{"A":7.49828,"B":2584.68,"C":163.761},"undecyl propanoate":{"A":7.68048,"B":2201.69,"C":153.928},"1-undecyne":{"A":7.12695,"B":1685.36,"C":201.907},"2-undecyne":{"A":7.1278,"B":1746.01,"C":205.117},"3-undecyne":{"A":7.12408,"B":1720.43,"C":205.45},"valeronitrile":{"A":7.36051,"B":1665.31,"C":230.446},"vanillin":{"A":7.81755,"B":2260.06,"C":172.954},"vinyl acetate":{"A":7.34453,"B":1393.85,"C":239.762},"vinylacetic acid":{"A":6.87443,"B":1288.84,"C":153.724},"vinylacetonitrile":{"A":7.4065,"B":1617.88,"C":238.968},"vinylacetylene":{"A":6.77495,"B":901.122,"C":226.305},"vinyl bromide":{"A":7.67449,"B":1403.35,"C":276.951},"vinyl chloride":{"A":6.89716,"B":897.722,"C":236.887},"vinylcyclohexene":{"A":7.16585,"B":1528.42,"C":228.837},"vinyl fluoride":{"A":7.24752,"B":857.669,"C":268.611},"vinyl formate":{"A":7.18214,"B":1177.3,"C":226.856},"vinyl iodide":{"A":6.60168,"B":911.131,"C":188.871},"vinyl propionate":{"A":6.6846,"B":993.683,"C":170.035},"2,3-xylenol":{"A":7.61977,"B":2001.18,"C":205.363},"2,4-xylenol":{"A":7.50567,"B":1885.49,"C":196.705},"2,5-xylenol":{"A":7.80247,"B":2106.55,"C":216.837},"2,6-xylenol":{"A":7.45107,"B":1874,"C":208.973},"3,4-xylenol":{"A":7.67221,"B":2014.61,"C":193.464},"3,5-xylenol":{"A":7.19633,"B":1689,"C":169.638}};
// ---------- Helpers ----------
function qs(id) { return document.getElementById(id); }
function fmt(n) {
  if (n === null || n === undefined || !isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 0.001 || abs > 1e6)) return n.toExponential(3);
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}
function lmtd(a, b) {
  if (!isFinite(a) || !isFinite(b) || a <= 0 || b <= 0) return NaN;
  if (Math.abs(a - b) < 1e-9) return a;
  return (a - b) / Math.log(a / b);
}
function setReadout(id, value, sub, warn) {
  const box = qs(id);
  if (!box) return;
  box.classList.toggle("warn", !!warn);
  qs(id + "-val").textContent = value;
  if (sub !== undefined) qs(id + "-sub").textContent = sub;
}
function fieldHTML(id, label, unit, def) {
  return `<label class="field"><span class="lbl">${label}</span><div class="field-row">
    <input type="number" id="${id}" value="${def}" step="any">
    ${unit ? `<span class="unit">${unit}</span>` : ""}
  </div></label>`;
}
function selectHTML(id, label, options, selected) {
  const opts = options.map((o) => `<option value="${o}" ${o === selected ? "selected" : ""}>${o}</option>`).join("");
  return `<label class="field"><span class="lbl">${label}</span><select id="${id}">${opts}</select></label>`;
}
function readoutHTML(id, label) {
  return `<div class="readout" id="${id}"><span class="lbl">${label}</span><span class="val" id="${id}-val">—</span><span class="sub" id="${id}-sub"></span></div>`;
}
function sectionHTML(text) {
  return `<div class="section-label"><span class="txt">${text}</span><span class="rule"></span></div>`;
}
function plateHeader(title, code) {
  return `<div class="plate-header"><h2>${title}</h2><span class="code">${code}</span></div>`;
}

// ---------- Constants ----------
const REACTOR_MOC = { SS: 200, Graphite: 150 };
const HX_TYPES = { "Corrugated": 700, "Shell&Tube": 250, "Graphite": 50 };
const COND_UTILITIES = {
  CTW: { tin: 25, tout: 30, density: 995 },
  CHW: { tin: 8, tout: 13, density: 999 },
  CHB: { tin: -5, tout: 0, density: 1000 },
};
const STEAM_TABLE = [
  { p: "1", t: 120.42, density: 0.712405, velocity: 30 },
  { p: "1.5", t: 127.62, density: 0.755, velocity: 30 },
  { p: "2", t: 133.69, density: 0.79091, velocity: 30 },
  { p: "2.4", t: 138.01, density: 0.816467, velocity: 50 },
  { p: "3", t: 143.75, density: 0.850425, velocity: 50 },
  { p: "3.4", t: 147.2, density: 0.870835, velocity: 50 },
  { p: "4", t: 151.96, density: 0.898995, velocity: 50 },
];
const SOLVENT_NAMES = Object.keys(SOLVENT_DB).sort();
const IMPELLER_NP = {
  "Ruston turbine 3 blade": 3.3,
  "Ruston turbine 4 blade": 4.3,
  "Ruston turbine 5 blade": 5.4,
  "Ruston turbine 6 blade": 6,
  "Paddle with 2 blades": 5.4,
  "Paddle with 4 blades": 2,
  "PBT": 1.27,
  "Anchor": 0.6,
  "RCI": 0.4,
};


// ---------- Chemical-Material Compatibility reference data ----------
// Materials (columns), in display order. Names follow common industry/Cole-Parmer usage.
const MATERIALS = ["SS316", "SS304", "Mild Steel (MS)", "Cast Iron", "Aluminum", "Hastelloy C276", "Titanium", "PTFE", "PEEK", "PVDF (Kynar)", "PP", "PVC", "CPVC", "PE (HDPE/LDPE)", "Nylon", "Viton (FKM)", "EPDM", "Nitrile (Buna-N)", "Neoprene", "Glass-Lined Steel"];
// Rating codes: E=Excellent, G=Good, F=Fair, N=Not Recommended
const RATING_MAP = { E: "Excellent", G: "Good", F: "Fair", N: "Not Recommended" };
// Each array aligns 1:1 with MATERIALS above (20 columns).
const CHEM_COMPAT = {
  "Water, Distilled":                ["E","E","F","F","G","E","E","E","E","E","E","E","E","E","G","E","E","E","E","E"],
  "Sulfuric Acid (<10%)":             ["F","N","N","N","N","G","G","E","G","E","G","G","G","G","N","G","F","F","F","E"],
  "Sulfuric Acid (10-75%)":           ["F","N","N","N","N","G","F","E","F","E","F","F","F","F","N","F","N","N","N","E"],
  "Sulfuric Acid (75-100%)":          ["F","N","G","G","N","G","N","E","F","F","N","N","N","N","N","N","N","N","N","E"],
  "Hydrochloric Acid (37%)":          ["N","N","N","N","N","F","N","E","F","E","G","G","G","G","N","G","N","N","N","E"],
  "Nitric Acid (5-10%)":              ["E","E","N","N","G","F","E","E","F","F","F","F","F","F","N","N","N","N","N","E"],
  "Nitric Acid (Concentrated)":       ["G","G","N","N","G","N","G","E","N","N","N","N","N","N","N","N","N","N","N","E"],
  "Acetic Acid, Glacial":             ["G","F","N","N","F","E","E","E","G","G","G","F","F","G","N","F","G","N","F","E"],
  "Phosphoric Acid (>40%)":           ["G","F","N","N","N","G","G","E","G","E","G","G","G","G","N","G","F","F","F","E"],
  "Sodium Hydroxide (20%)":           ["E","E","G","G","N","G","F","E","G","F","E","G","G","E","G","F","E","G","G","F"],
  "Sodium Hydroxide (50%)":           ["F","F","G","G","N","G","F","E","G","F","G","F","F","G","F","N","G","F","G","N"],
  "Ammonia, Anhydrous":               ["E","E","G","G","G","G","G","E","G","F","G","G","G","G","G","N","G","N","G","G"],
  "Chlorine (Dry)":                   ["F","N","G","F","N","G","N","E","F","G","F","F","F","F","N","G","N","N","F","G"],
  "Sodium Hypochlorite (<20%)":       ["F","F","N","N","N","G","E","E","G","E","G","G","G","G","N","G","F","N","F","G"],
  "Toluene (Toluol)":                 ["E","E","E","E","E","E","E","E","E","G","F","N","N","F","G","G","N","F","F","E"],
  "Xylene":                           ["E","E","E","E","E","E","E","E","E","G","F","N","N","F","G","G","N","F","F","E"],
  "Benzene":                          ["E","E","E","E","E","E","E","E","E","F","F","N","N","F","G","G","N","F","F","E"],
  "Cyclohexane":                      ["E","E","E","E","E","E","E","E","E","G","G","F","F","G","G","G","N","G","G","E"],
  "Acetone":                          ["E","E","E","E","E","E","E","E","F","N","G","N","N","F","G","N","G","F","F","E"],
  "Methanol":                         ["E","E","G","G","G","E","E","E","G","G","G","F","F","G","G","F","G","G","G","E"],
  "Ethanol":                          ["E","E","G","G","G","E","E","E","G","G","G","F","F","G","G","F","G","G","G","E"],
  "Isopropyl Alcohol":                ["E","E","G","G","G","E","E","E","G","G","G","F","F","G","G","F","G","G","G","E"],
  "Methylene Chloride":               ["E","E","E","E","F","E","E","E","F","F","N","N","N","N","F","F","N","N","N","E"],
  "Chloroform":                       ["E","E","E","E","F","E","E","E","F","F","N","N","N","N","F","F","N","N","N","E"],
  "Ethyl Acetate":                    ["E","E","G","G","G","E","E","E","F","F","G","N","N","F","F","N","G","N","F","E"],
  "Hexane":                           ["E","E","E","E","E","E","E","E","E","G","G","F","F","G","G","G","N","G","G","E"],
  "Methyl Ethyl Ketone (MEK)":        ["E","E","G","G","G","E","E","E","F","N","F","N","N","F","G","N","G","F","F","E"],
  "N,N-Dimethylformamide (DMF)":      ["E","E","G","G","F","E","E","E","F","N","F","N","N","F","F","N","F","N","F","E"],
  "Dimethyl Sulfoxide (DMSO)":        ["E","E","G","G","F","E","E","E","G","N","G","N","N","F","F","N","G","F","F","E"],
  "Tetrahydrofuran (THF)":            ["E","E","G","G","F","E","E","E","F","N","F","N","N","F","F","N","F","N","N","E"],
  "Diethyl Ether":                    ["E","E","G","G","F","E","E","E","F","F","F","N","N","F","F","N","F","N","F","E"],
  "Ethylene Glycol":                  ["E","E","G","G","G","E","E","E","E","G","E","G","G","E","G","G","E","G","G","E"],
  "Glycerin":                         ["E","E","G","G","G","E","E","E","E","E","E","E","E","E","G","E","E","G","G","E"],
  "Formaldehyde (40%)":               ["G","G","F","F","F","G","G","E","G","G","G","G","G","G","F","F","G","F","G","G"],
  "Hydrogen Peroxide (30%)":          ["G","F","N","N","F","G","G","E","G","G","G","G","G","F","N","G","F","F","F","G"],
  "Bromine":                          ["N","N","N","N","N","F","F","E","F","G","F","F","F","F","N","G","N","N","N","G"],
  "Salt Brine (NaCl, saturated)":     ["F","N","F","F","F","E","E","E","E","E","E","E","E","E","G","E","E","E","E","E"],
  "Triethylamine":                    ["E","E","G","G","F","E","E","E","F","F","F","F","F","F","F","N","F","F","F","E"],
  "Aniline":                          ["G","G","F","F","F","E","E","E","F","F","F","N","N","F","N","N","F","N","N","E"],
  "Phenol (Carbolic Acid)":           ["G","F","F","F","F","E","E","E","F","F","F","N","N","F","N","N","F","N","N","E"],
  "Formic Acid":                      ["F","F","N","N","N","G","G","E","G","G","G","F","F","F","N","F","F","N","F","E"],
  "Oxalic Acid (cold)":               ["F","N","N","N","N","G","G","E","G","E","G","G","G","G","N","G","F","F","F","E"],
  "Citric Acid":                      ["E","G","N","N","F","E","E","E","E","E","E","E","E","E","F","G","G","G","G","E"],
  "Potassium Hydroxide (Caustic)":    ["E","E","G","G","N","G","F","E","G","F","E","G","G","E","G","F","E","G","G","F"],
  "Ferric Chloride":                  ["N","N","N","N","N","G","G","E","G","E","G","G","G","G","N","G","F","F","F","E"],
};
const CHEM_COMPAT_NAMES = Object.keys(CHEM_COMPAT).sort();


// ============ TAB DEFINITIONS ============
const TABS = [
  { id: "solvent-recovery", label: "Solvent Recovery", desc: "Batch vacuum distillation design — boiling point, heat load, recovery time, condenser sizing, vacuum pump capacity.", render: renderSolventRecovery, init: initSolventRecovery },
  { id: "scale-up", label: "Mixing / Scale-up", desc: "Reactor geometry, agitation, Reynolds number, tip speed, Power, P/V, torque — compare across plants or scales.", render: renderScaleUp, init: initScaleUp },
  { id: "coupon-study", label: "Corrosion Coupon", desc: "Weight-loss corrosion rate (mpy) from coupon exposure data, with Excellent/Good/Satisfactory rating.", render: renderCouponStudy, init: initCouponStudy },
  { id: "filtration-eval", label: "Filtration Evaluation", desc: "B\u00fcchner filtration trial \u2014 specific cake resistance and flux, with a Good/Moderate/Slow verdict.", render: renderFiltrationEvaluation, init: initFiltrationEvaluation },
  { id: "centrifuge", label: "Centrifuge Cake Weight", desc: "Basket centrifuge cake weight and G-force from basket geometry, cake thickness, and bulk density.", render: renderCentrifuge, init: initCentrifuge },
  { id: "pump-power", label: "Pump Power Rating", desc: "Theoretical hydraulic power, pump shaft power, and motor power from flow, head, and efficiencies.", render: renderPumpPower, init: initPumpPower },
  { id: "materials-compat", label: "Materials & Corrosion", desc: "Chemical-to-material compatibility reference \u2014 pick a process fluid, see ratings across SS316, Hastelloy, PTFE, common plastics, and elastomers.", render: renderMaterialsCompat, init: initMaterialsCompat },
  { id: "mol-builder", label: "Structure Builder", desc: "Draw a 2D structure (atoms, bonds, ring and functional-group templates) and get molecular formula, weight, atom/bond counts, and SMILES both ways \u2014 chemistry computed by OpenChemLib.", render: renderMolBuilder, init: initMolBuilder },
  { id: "batch-troubleshoot", label: "Batch Troubleshooter", desc: "Click-through operator game \u2014 flip valves and equipment states on a live reactor panel until the reading settles into the green band.", render: renderBatchTroubleshooter, init: initBatchTroubleshooter },
];


// ================================================================
// Molecular Structure Builder — PharmaChemE Structure Editor
// Chemistry/data layer powered by OpenChemLib (window.OCL), an
// established open-source cheminformatics toolkit — NOT a hand-
// rolled valence/SMILES engine. This module only owns rendering
// and interaction; formula, molecular weight, implicit-hydrogen
// counts, and SMILES parsing/generation all come from OCL.
// ================================================================

// ---------- 4. Chemistry/calculation layer (thin OCL bindings) ----------
const MB_ATOMIC_NO = { C: 6, N: 7, O: 8, S: 16, P: 15, F: 9, Cl: 17, Br: 35, I: 53 };
const MB_EL_BY_NO = { 6: "C", 7: "N", 8: "O", 16: "S", 15: "P", 9: "F", 17: "Cl", 35: "Br", 53: "I" };
const MB_VALENCE = { C: 4, N: 3, O: 2, S: 2, P: 3, F: 1, Cl: 1, Br: 1, I: 1 };
const MB_ELEMENTS = ["C", "N", "O", "S", "P", "F", "Cl", "Br", "I"];
const MB_ELEMENT_COLORS = { C: "#1a1a1a", N: "#2149C4", O: "#C42121", S: "#9C8A00", P: "#C4661A", F: "#1E8449", Cl: "#1E8449", Br: "#8B4513", I: "#6C3483" };
const MB_RING_KINDS = ["cyclopentane", "cyclohexane", "benzene", "cyclohexene", "pyridine"];
const MB_FG_KINDS = ["OH", "NH2", "COOH", "CHO", "NO2", "OMe", "F", "Cl", "Br", "I"];
const MB_BOND_LEN = 40;
const MB_VB_W = 700, MB_VB_H = 380;
const MB_HISTORY_CAP = 60;

function mbAtomicNo(el) { return MB_ATOMIC_NO[el] || 6; }

function mbEnsureHelpers() {
  try { mbMol.ensureHelperArrays(window.OCL.Molecule.cHelperNeighbours); } catch (e) { /* ignore */ }
}

function mbCurrentDegree(atomIdx, excludeBond) {
  let deg = 0;
  for (let b = 0; b < mbMol.getAllBonds(); b++) {
    if (b === excludeBond) continue;
    const a1 = mbMol.getBondAtom(0, b), a2 = mbMol.getBondAtom(1, b);
    if (a1 === atomIdx || a2 === atomIdx) deg += mbMol.getBondOrder(b);
  }
  return deg;
}

function mbValenceOK(atomIdx, addedOrder, excludeBond) {
  if (mbMol.getAtomCharge(atomIdx)) return true; // charged atoms (e.g. our own NO2 template) bypass the simple check
  const el = MB_EL_BY_NO[mbMol.getAtomicNo(atomIdx)];
  const max = MB_VALENCE[el];
  if (max == null) return true;
  return mbCurrentDegree(atomIdx, excludeBond) + addedOrder <= max;
}

function mbFindBondBetween(a, b) {
  for (let bd = 0; bd < mbMol.getAllBonds(); bd++) {
    const x1 = mbMol.getBondAtom(0, bd), x2 = mbMol.getBondAtom(1, bd);
    if ((x1 === a && x2 === b) || (x1 === b && x2 === a)) return bd;
  }
  return null;
}

function mbNextFreeDirection(atomIdx) {
  const angles = [];
  for (let b = 0; b < mbMol.getAllBonds(); b++) {
    const a1 = mbMol.getBondAtom(0, b), a2 = mbMol.getBondAtom(1, b);
    let other = null;
    if (a1 === atomIdx) other = a2; else if (a2 === atomIdx) other = a1;
    if (other != null) {
      angles.push(Math.atan2(mbMol.getAtomY(other) - mbMol.getAtomY(atomIdx), mbMol.getAtomX(other) - mbMol.getAtomX(atomIdx)));
    }
  }
  if (!angles.length) return 0;
  angles.sort((a, b) => a - b);
  let bestGap = -1, bestMid = 0;
  for (let i = 0; i < angles.length; i++) {
    const a = angles[i];
    const b = i === angles.length - 1 ? angles[0] + 2 * Math.PI : angles[i + 1];
    const gap = b - a;
    if (gap > bestGap) { bestGap = gap; bestMid = a + gap / 2; }
  }
  return bestMid;
}

// Ring templates: {n, elements[], doubleAt[] (bond index i = bond between ring[i]/ring[i+1])}
function mbRingBlueprint(kind) {
  const C6 = ["C", "C", "C", "C", "C", "C"];
  switch (kind) {
    case "cyclopentane": return { n: 5, elements: ["C", "C", "C", "C", "C"], doubles: [] };
    case "cyclohexane": return { n: 6, elements: C6, doubles: [] };
    case "benzene": return { n: 6, elements: C6, doubles: [0, 2, 4] };
    case "cyclohexene": return { n: 6, elements: C6, doubles: [0] };
    case "pyridine": return { n: 6, elements: ["N", "C", "C", "C", "C", "C"], doubles: [0, 2, 4] };
    default: return { n: 6, elements: C6, doubles: [] };
  }
}

function mbInsertRing(kind) {
  const bp = mbRingBlueprint(kind);
  const cx = 100 + ((mbMol.getAllAtoms() * 41) % (MB_VB_W - 160));
  const cy = 90 + ((mbMol.getAllAtoms() * 29) % (MB_VB_H - 160));
  const radius = MB_BOND_LEN / (2 * Math.sin(Math.PI / bp.n));
  const ids = [];
  for (let i = 0; i < bp.n; i++) {
    const angle = (Math.PI * 2 * i) / bp.n - Math.PI / 2;
    const idx = mbMol.addAtom(mbAtomicNo(bp.elements[i]));
    mbMol.setAtomX(idx, cx + radius * Math.cos(angle));
    mbMol.setAtomY(idx, cy + radius * Math.sin(angle));
    ids.push(idx);
  }
  for (let i = 0; i < bp.n; i++) {
    const bd = mbMol.addBond(ids[i], ids[(i + 1) % bp.n]);
    if (bp.doubles.includes(i)) mbMol.setBondOrder(bd, 2);
  }
}

function mbAttachGroup(kind, atomIdx) {
  const theta = mbNextFreeDirection(atomIdx);
  const p0 = { x: mbMol.getAtomX(atomIdx), y: mbMol.getAtomY(atomIdx) };
  const placeFrom = (base, angle, dist) => ({ x: base.x + Math.cos(angle) * dist, y: base.y + Math.sin(angle) * dist });
  const newAtom = (el, pt, charge) => {
    const idx = mbMol.addAtom(mbAtomicNo(el));
    mbMol.setAtomX(idx, pt.x); mbMol.setAtomY(idx, pt.y);
    if (charge) mbMol.setAtomCharge(idx, charge);
    return idx;
  };
  const bond = (a, b, order) => { const bd = mbMol.addBond(a, b); if (order && order !== 1) mbMol.setBondOrder(bd, order); };

  if (["OH", "NH2", "F", "Cl", "Br", "I"].includes(kind)) {
    const el = kind === "OH" ? "O" : kind === "NH2" ? "N" : kind;
    const a1 = newAtom(el, placeFrom(p0, theta, MB_BOND_LEN));
    bond(atomIdx, a1, 1);
  } else if (kind === "OMe") {
    const p1 = placeFrom(p0, theta, MB_BOND_LEN);
    const o = newAtom("O", p1); bond(atomIdx, o, 1);
    const c = newAtom("C", placeFrom(p1, theta, MB_BOND_LEN)); bond(o, c, 1);
  } else if (kind === "CHO") {
    const p1 = placeFrom(p0, theta, MB_BOND_LEN);
    const c = newAtom("C", p1); bond(atomIdx, c, 1);
    const o = newAtom("O", placeFrom(p1, theta - Math.PI / 3, MB_BOND_LEN)); bond(c, o, 2);
  } else if (kind === "COOH") {
    const p1 = placeFrom(p0, theta, MB_BOND_LEN);
    const c = newAtom("C", p1); bond(atomIdx, c, 1);
    const o1 = newAtom("O", placeFrom(p1, theta - Math.PI / 3, MB_BOND_LEN)); bond(c, o1, 2);
    const o2 = newAtom("O", placeFrom(p1, theta + Math.PI / 3, MB_BOND_LEN)); bond(c, o2, 1);
  } else if (kind === "NO2") {
    const p1 = placeFrom(p0, theta, MB_BOND_LEN);
    const n = newAtom("N", p1, 1); bond(atomIdx, n, 1);
    const o1 = newAtom("O", placeFrom(p1, theta - Math.PI / 3, MB_BOND_LEN)); bond(n, o1, 2);
    const o2 = newAtom("O", placeFrom(p1, theta + Math.PI / 3, MB_BOND_LEN), -1); bond(n, o2, 1);
  }
}

function mbRescaleAndCenter(mol) {
  const n = mol.getAllAtoms();
  if (!n) return;
  let totalLen = 0, count = 0;
  for (let b = 0; b < mol.getAllBonds(); b++) {
    const a1 = mol.getBondAtom(0, b), a2 = mol.getBondAtom(1, b);
    totalLen += Math.hypot(mol.getAtomX(a2) - mol.getAtomX(a1), mol.getAtomY(a2) - mol.getAtomY(a1));
    count++;
  }
  const avgLen = count ? totalLen / count : 1;
  const scale = avgLen > 0 ? MB_BOND_LEN / avgLen : 1;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = mol.getAtomX(i) * scale, y = mol.getAtomY(i) * scale;
    mol.setAtomX(i, x); mol.setAtomY(i, y);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  for (let i = 0; i < n; i++) {
    mol.setAtomX(i, mol.getAtomX(i) - cx + MB_VB_W / 2);
    mol.setAtomY(i, mol.getAtomY(i) - cy + MB_VB_H / 2);
  }
}

// ---------- 1. Data model: snapshot / restore (undo-redo substrate) ----------
let mbMol = null;
let mbHistory = [];
let mbFuture = [];

function mbSnapshot() {
  const atoms = [];
  for (let i = 0; i < mbMol.getAllAtoms(); i++) {
    atoms.push({ no: mbMol.getAtomicNo(i), x: mbMol.getAtomX(i), y: mbMol.getAtomY(i), charge: mbMol.getAtomCharge(i) });
  }
  const bonds = [];
  for (let b = 0; b < mbMol.getAllBonds(); b++) {
    bonds.push({ a: mbMol.getBondAtom(0, b), b: mbMol.getBondAtom(1, b), order: mbMol.getBondOrder(b) });
  }
  return { atoms, bonds };
}

function mbRestore(snap) {
  const mol = new window.OCL.Molecule(Math.max(32, snap.atoms.length + 8), Math.max(32, snap.bonds.length + 8));
  snap.atoms.forEach((a) => {
    const idx = mol.addAtom(a.no);
    mol.setAtomX(idx, a.x); mol.setAtomY(idx, a.y);
    if (a.charge) mol.setAtomCharge(idx, a.charge);
  });
  snap.bonds.forEach((bd) => {
    const bi = mol.addBond(bd.a, bd.b);
    if (bd.order !== 1) mol.setBondOrder(bi, bd.order);
  });
  mbMol = mol;
}

function mbPushHistory() {
  mbHistory.push(mbSnapshot());
  if (mbHistory.length > MB_HISTORY_CAP) mbHistory.shift();
  mbFuture = [];
}

function mbUndo() {
  if (!mbHistory.length) return;
  mbFuture.push(mbSnapshot());
  mbRestore(mbHistory.pop());
  mbSelectedAtom = null; mbSelectedBond = null;
  mbUpdate();
}

function mbRedo() {
  if (!mbFuture.length) return;
  mbHistory.push(mbSnapshot());
  mbRestore(mbFuture.pop());
  mbSelectedAtom = null; mbSelectedBond = null;
  mbUpdate();
}

// ---------- Toolbar / interaction state ----------
let mbPrimary = "atom";     // "select"|"atom"|"bond"|"double"|"triple"|"ring"|"fg"
let mbAtomEl = "C";
let mbPendingFG = null;
let mbSelectedAtom = null;
let mbSelectedBond = null;
let mbDragging = false, mbMoved = false;
let mbDragStartId = null, mbDragStartPt = null, mbDragCur = null, mbDragOrder = 1;
let mbMoveAtomIdx = null, mbMoveHistoryPushed = false;
let mbWarnTimer = null;

function mbFlashWarning(msg) {
  const el = qs("mb-warning");
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = msg ? "1" : "0";
  clearTimeout(mbWarnTimer);
  if (msg) mbWarnTimer = setTimeout(() => { el.style.opacity = "0"; }, 2200);
}

// ---------- 2. Rendering layer (SVG, white chemistry canvas) ----------
function mbLabelFor(atomIdx) {
  const el = MB_EL_BY_NO[mbMol.getAtomicNo(atomIdx)] || "?";
  let h = 0;
  try { h = mbMol.getImplicitHydrogens(atomIdx); } catch (e) { /* ignore */ }
  const charge = mbMol.getAtomCharge(atomIdx);
  let label = el;
  if (h > 0) label += (h === 1 ? "H" : "H" + h);
  if (charge === 1) label += "+";
  else if (charge > 1) label += "+" + charge;
  else if (charge === -1) label += "\u2212";
  else if (charge < -1) label += String(charge);
  return label;
}

function mbGetScale(svg) {
  const rect = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const scale = Math.min(rect.width / vb.width, rect.height / vb.height) || 1;
  return { rect, vb, scale };
}

function mbSvgPoint(svg, clientX, clientY) {
  const { rect, vb, scale } = mbGetScale(svg);
  const offsetX = (rect.width - vb.width * scale) / 2;
  const offsetY = (rect.height - vb.height * scale) / 2;
  return { x: (clientX - rect.left - offsetX) / scale + vb.x, y: (clientY - rect.top - offsetY) / scale + vb.y };
}

function mbHitRadius(svg) {
  const { scale } = mbGetScale(svg);
  return Math.max(16, 22 / scale);
}

function mbFindAtomNear(x, y, excludeIdx, radius) {
  for (let i = 0; i < mbMol.getAllAtoms(); i++) {
    if (i === excludeIdx) continue;
    if (Math.hypot(mbMol.getAtomX(i) - x, mbMol.getAtomY(i) - y) < radius) return i;
  }
  return null;
}

function mbFindBondNear(x, y, thresh) {
  for (let b = 0; b < mbMol.getAllBonds(); b++) {
    const a1 = mbMol.getBondAtom(0, b), a2 = mbMol.getBondAtom(1, b);
    const x1 = mbMol.getAtomX(a1), y1 = mbMol.getAtomY(a1), x2 = mbMol.getAtomX(a2), y2 = mbMol.getAtomY(a2);
    const dx = x2 - x1, dy = y2 - y1, lenSq = dx * dx + dy * dy || 1;
    let t = ((x - x1) * dx + (y - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    if (Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)) < thresh) return b;
  }
  return null;
}

function mbRenderCanvas() {
  const svg = qs("mb-canvas");
  if (!svg || !mbMol) return;
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const ns = "http://www.w3.org/2000/svg";

  for (let b = 0; b < mbMol.getAllBonds(); b++) {
    const a1 = mbMol.getBondAtom(0, b), a2 = mbMol.getBondAtom(1, b);
    const x1 = mbMol.getAtomX(a1), y1 = mbMol.getAtomY(a1), x2 = mbMol.getAtomX(a2), y2 = mbMol.getAtomY(a2);
    const order = mbMol.getBondOrder(b);
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const offsets = order === 1 ? [0] : order === 2 ? [-3, 3] : [-4.5, 0, 4.5];
    const isSel = b === mbSelectedBond;
    offsets.forEach((off) => {
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", x1 + nx * off); line.setAttribute("y1", y1 + ny * off);
      line.setAttribute("x2", x2 + nx * off); line.setAttribute("y2", y2 + ny * off);
      line.setAttribute("stroke", isSel ? "#1565C0" : "#111");
      line.setAttribute("stroke-width", isSel ? "3.2" : "2.2");
      line.setAttribute("stroke-linecap", "round");
      svg.appendChild(line);
    });
  }

  if (mbDragging && mbMoved && mbDragStartPt && mbDragCur) {
    const preview = document.createElementNS(ns, "line");
    preview.setAttribute("x1", mbDragStartPt.x); preview.setAttribute("y1", mbDragStartPt.y);
    preview.setAttribute("x2", mbDragCur.x); preview.setAttribute("y2", mbDragCur.y);
    preview.setAttribute("stroke", "#1565C0"); preview.setAttribute("stroke-width", "2");
    preview.setAttribute("stroke-dasharray", "4,3");
    svg.appendChild(preview);
  }

  for (let i = 0; i < mbMol.getAllAtoms(); i++) {
    const x = mbMol.getAtomX(i), y = mbMol.getAtomY(i);
    const el = MB_EL_BY_NO[mbMol.getAtomicNo(i)] || "?";
    const isHetero = el !== "C" || mbMol.getAtomCharge(i) !== 0;
    const isSel = i === mbSelectedAtom;
    const g = document.createElementNS(ns, "g");
    g.setAttribute("transform", `translate(${x},${y})`);

    if (isSel) {
      const ring = document.createElementNS(ns, "circle");
      ring.setAttribute("r", "13"); ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", "#1565C0"); ring.setAttribute("stroke-width", "1.6");
      ring.setAttribute("stroke-dasharray", "3,2");
      g.appendChild(ring);
    }

    if (isHetero) {
      const label = mbLabelFor(i);
      const textW = label.length * 8 + 4;
      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("x", -textW / 2); rect.setAttribute("y", -9);
      rect.setAttribute("width", textW); rect.setAttribute("height", "18");
      rect.setAttribute("fill", "#fff");
      g.appendChild(rect);
      const text = document.createElementNS(ns, "text");
      text.setAttribute("text-anchor", "middle"); text.setAttribute("dy", "5");
      text.setAttribute("fill", MB_ELEMENT_COLORS[el] || "#111");
      text.setAttribute("font-family", "Arial, sans-serif");
      text.setAttribute("font-size", "13"); text.setAttribute("font-weight", "600");
      text.textContent = label;
      g.appendChild(text);
    } else {
      const dot = document.createElementNS(ns, "circle");
      dot.setAttribute("r", "2.2"); dot.setAttribute("fill", "#666");
      g.appendChild(dot);
    }
    svg.appendChild(g);
  }
}

function mbUpdate() {
  mbEnsureHelpers();
  mbRenderCanvas();
  mbRenderInfo();
}

function mbRenderInfo() {
  let formula = "\u2014", mw = "\u2014", smiles = "\u2014", heavyCount = 0, totalCount = 0, bondCount = 0;
  if (mbMol && mbMol.getAllAtoms() > 0) {
    try { const f = mbMol.getMolecularFormula(); formula = f.formula; mw = fmt(f.relativeWeight); }
    catch (e) { formula = "(disconnected / invalid)"; }
    try { smiles = mbMol.toSmiles(); } catch (e) { smiles = "(unavailable for this structure)"; }
    heavyCount = mbMol.getAllAtoms();
    let hCount = 0;
    for (let i = 0; i < heavyCount; i++) { try { hCount += mbMol.getImplicitHydrogens(i); } catch (e) { /* ignore */ } }
    totalCount = heavyCount + hCount;
    bondCount = mbMol.getAllBonds();
  }
  setReadout("mb-formula", formula);
  setReadout("mb-mw", mw);
  setReadout("mb-atoms", heavyCount ? `${heavyCount} heavy / ${totalCount} total` : "\u2014");
  setReadout("mb-bonds", heavyCount ? String(bondCount) : "\u2014");
  const smilesBox = qs("mb-smiles-out");
  if (smilesBox) smilesBox.textContent = smiles;
}

// ---------- 3. Interaction layer (pointer events: mouse + touch unified) ----------
function mbHandlePointerDown(e) {
  e.preventDefault();
  const svg = qs("mb-canvas");
  try { svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  const { x, y } = mbSvgPoint(svg, e.clientX, e.clientY);
  const hitR = mbHitRadius(svg);

  if (mbPrimary === "select") {
    const hitAtom = mbFindAtomNear(x, y, null, hitR);
    if (hitAtom != null) {
      mbSelectedAtom = hitAtom; mbSelectedBond = null;
      mbMoveAtomIdx = hitAtom; mbMoveHistoryPushed = false;
      mbRenderCanvas();
      return;
    }
    const hitBond = mbFindBondNear(x, y, hitR * 0.5);
    mbSelectedBond = hitBond; mbSelectedAtom = null;
    mbRenderCanvas();
    return;
  }

  if (mbPrimary === "fg" && mbPendingFG) {
    const hitAtom = mbFindAtomNear(x, y, null, hitR);
    if (hitAtom != null) {
      mbPushHistory();
      mbAttachGroup(mbPendingFG, hitAtom);
      mbPendingFG = null;
      mbUpdate();
    } else {
      mbFlashWarning("Click an existing atom to attach the group");
    }
    return;
  }

  if (mbPrimary === "bond" || mbPrimary === "double" || mbPrimary === "triple") {
    const order = mbPrimary === "bond" ? 1 : mbPrimary === "double" ? 2 : 3;
    const hitBond = mbFindBondNear(x, y, hitR * 0.5);
    if (hitBond != null) {
      const a1 = mbMol.getBondAtom(0, hitBond), a2 = mbMol.getBondAtom(1, hitBond);
      if (mbValenceOK(a1, order, hitBond) && mbValenceOK(a2, order, hitBond)) {
        mbPushHistory();
        mbMol.setBondOrder(hitBond, order);
        mbUpdate();
      } else {
        mbFlashWarning("Exceeds normal valence for this atom");
      }
      return;
    }
    const hitAtom = mbFindAtomNear(x, y, null, hitR);
    mbDragStartId = hitAtom;
    mbDragStartPt = hitAtom != null ? { x: mbMol.getAtomX(hitAtom), y: mbMol.getAtomY(hitAtom) } : { x, y };
    mbDragCur = { ...mbDragStartPt }; mbDragging = true; mbMoved = false; mbDragOrder = order;
    return;
  }

  if (mbPrimary === "atom") {
    const hitAtom = mbFindAtomNear(x, y, null, hitR);
    mbDragStartId = hitAtom;
    mbDragStartPt = hitAtom != null ? { x: mbMol.getAtomX(hitAtom), y: mbMol.getAtomY(hitAtom) } : { x, y };
    mbDragCur = { ...mbDragStartPt }; mbDragging = true; mbMoved = false; mbDragOrder = 1;
  }
}

function mbSnapEndpoint(startPt, x, y) {
  const dx = x - startPt.x, dy = y - startPt.y;
  const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 6)) * (Math.PI / 6);
  return { x: startPt.x + Math.cos(angle) * MB_BOND_LEN, y: startPt.y + Math.sin(angle) * MB_BOND_LEN };
}

function mbHandlePointerMove(e) {
  const svg = qs("mb-canvas");
  if (!svg) return;
  const { x, y } = mbSvgPoint(svg, e.clientX, e.clientY);

  if (mbMoveAtomIdx != null) {
    if (!mbMoveHistoryPushed) { mbPushHistory(); mbMoveHistoryPushed = true; }
    mbMol.setAtomX(mbMoveAtomIdx, x); mbMol.setAtomY(mbMoveAtomIdx, y);
    mbRenderCanvas();
    return;
  }
  if (!mbDragging) return;
  const dx = x - mbDragStartPt.x, dy = y - mbDragStartPt.y;
  if (Math.hypot(dx, dy) > 6) mbMoved = true;
  mbDragCur = mbMoved ? mbSnapEndpoint(mbDragStartPt, x, y) : { ...mbDragStartPt };
  mbRenderCanvas();
}

function mbHandlePointerUp() {
  if (mbMoveAtomIdx != null) { mbMoveAtomIdx = null; mbUpdate(); return; }
  if (!mbDragging) { return; }
  mbDragging = false;
  const svg = qs("mb-canvas");
  const hitR = svg ? mbHitRadius(svg) : 18;

  if (mbPrimary === "atom") {
    const el = mbAtomEl;
    if (!mbMoved) {
      mbPushHistory();
      if (mbDragStartId != null) {
        mbMol.setAtomicNo(mbDragStartId, mbAtomicNo(el));
      } else {
        const a = mbMol.addAtom(mbAtomicNo(el));
        mbMol.setAtomX(a, mbDragStartPt.x); mbMol.setAtomY(a, mbDragStartPt.y);
      }
      mbUpdate();
    } else {
      let startId = mbDragStartId;
      const endHit = mbFindAtomNear(mbDragCur.x, mbDragCur.y, startId, hitR);
      const okStart = startId == null || mbValenceOK(startId, 1);
      const okEnd = endHit == null || mbValenceOK(endHit, 1);
      if (okStart && okEnd) {
        mbPushHistory();
        if (startId == null) { startId = mbMol.addAtom(mbAtomicNo(el)); mbMol.setAtomX(startId, mbDragStartPt.x); mbMol.setAtomY(startId, mbDragStartPt.y); }
        let endId = endHit;
        if (endId == null) { endId = mbMol.addAtom(mbAtomicNo(el)); mbMol.setAtomX(endId, mbDragCur.x); mbMol.setAtomY(endId, mbDragCur.y); }
        if (mbFindBondBetween(startId, endId) == null) mbMol.addBond(startId, endId);
        mbUpdate();
      } else {
        mbFlashWarning("Exceeds normal valence for this atom");
      }
    }
  } else if (mbPrimary === "bond" || mbPrimary === "double" || mbPrimary === "triple") {
    if (mbMoved) {
      const order = mbDragOrder;
      let startId = mbDragStartId;
      const endHit = mbFindAtomNear(mbDragCur.x, mbDragCur.y, startId, hitR);
      const okStart = startId == null || mbValenceOK(startId, order);
      const okEnd = endHit == null || mbValenceOK(endHit, order);
      if (okStart && okEnd) {
        mbPushHistory();
        if (startId == null) { startId = mbMol.addAtom(6); mbMol.setAtomX(startId, mbDragStartPt.x); mbMol.setAtomY(startId, mbDragStartPt.y); }
        let endId = endHit;
        if (endId == null) { endId = mbMol.addAtom(6); mbMol.setAtomX(endId, mbDragCur.x); mbMol.setAtomY(endId, mbDragCur.y); }
        const exists = mbFindBondBetween(startId, endId);
        if (exists == null) { const bd = mbMol.addBond(startId, endId); if (order !== 1) mbMol.setBondOrder(bd, order); }
        else mbMol.setBondOrder(exists, order);
        mbUpdate();
      } else {
        mbFlashWarning("Exceeds normal valence for this atom");
      }
    }
  }

  mbDragStartId = null; mbDragStartPt = null; mbDragCur = null; mbMoved = false;
}

function mbDeleteSelected() {
  if (mbSelectedAtom != null) {
    mbPushHistory();
    mbMol.deleteAtom(mbSelectedAtom);
    mbSelectedAtom = null;
    mbUpdate();
  } else if (mbSelectedBond != null) {
    mbPushHistory();
    mbMol.deleteBond(mbSelectedBond);
    mbSelectedBond = null;
    mbUpdate();
  } else {
    mbFlashWarning("Select an atom or bond first, then press Delete");
  }
}

function mbClearAll() {
  mbPushHistory();
  mbMol = new window.OCL.Molecule(64, 64);
  mbSelectedAtom = null; mbSelectedBond = null;
  mbUpdate();
}

function mbImportSmiles() {
  const input = qs("mb-smiles-in");
  const status = qs("mb-import-status");
  const text = input.value.trim();
  if (!text) return;
  try {
    const parser = new window.OCL.SmilesParser();
    const parsed = parser.parseMolecule(text);
    parsed.ensureHelperArrays(window.OCL.Molecule.cHelperNeighbours);
    mbRescaleAndCenter(parsed);
    mbPushHistory();
    mbMol = parsed;
    mbSelectedAtom = null; mbSelectedBond = null;
    mbUpdate();
    if (status) { status.textContent = "Imported successfully."; status.style.color = "var(--brass)"; }
  } catch (e) {
    if (status) { status.textContent = "Could not parse that SMILES string."; status.style.color = "var(--rust)"; }
  }
}

// ---------- UI: toolbar + panel markup ----------
function mbPrimaryBtn(id, label) {
  return `<button type="button" class="pill${mbPrimary === id ? " active" : ""}" data-mb-primary="${id}">${label}</button>`;
}

function mbToolbarHTML() {
  const primaryRow = [
    mbPrimaryBtn("select", "Select"),
    mbPrimaryBtn("atom", "Atom"),
    mbPrimaryBtn("bond", "Bond"),
    mbPrimaryBtn("double", "Double"),
    mbPrimaryBtn("triple", "Triple"),
    mbPrimaryBtn("ring", "Ring"),
    mbPrimaryBtn("fg", "Functional Group"),
  ].join("");
  const actionRow = [
    `<button type="button" class="pill" id="mb-delete" style="border-color:var(--rust); color:var(--rust);">Delete</button>`,
    `<button type="button" class="pill" id="mb-undo">Undo</button>`,
    `<button type="button" class="pill" id="mb-redo">Redo</button>`,
    `<button type="button" class="pill" id="mb-clear" style="border-color:var(--rust); color:var(--rust);">Clear</button>`,
  ].join("");

  let subRow = "";
  if (mbPrimary === "atom") {
    subRow = MB_ELEMENTS.map((el) => `<button type="button" class="pill${mbAtomEl === el ? " active" : ""}" data-mb-el="${el}">${el}</button>`).join("");
  } else if (mbPrimary === "ring") {
    subRow = MB_RING_KINDS.map((r) => `<button type="button" class="pill" data-mb-ring="${r}">${r.charAt(0).toUpperCase() + r.slice(1)}</button>`).join("");
  } else if (mbPrimary === "fg") {
    subRow = MB_FG_KINDS.map((g) => `<button type="button" class="pill${mbPendingFG === g ? " active" : ""}" data-mb-fg="${g}">${g}</button>`).join("");
  }

  return `
    <div class="pill-group" style="margin-bottom:8px;">${primaryRow}</div>
    ${subRow ? `<div class="pill-group" style="margin-bottom:8px;">${subRow}</div>` : ""}
    <div class="pill-group">${actionRow}</div>
  `;
}

function mbToolHintText() {
  switch (mbPrimary) {
    case "select": return "Click an atom or bond to select it (then use Delete). Drag a selected atom to move it.";
    case "atom": return `Click empty canvas to place ${mbAtomEl}, click an existing atom to relabel it to ${mbAtomEl}, or drag to draw a new bond.`;
    case "bond": case "double": case "triple": return "Drag between atoms to draw a bond, or click an existing bond to set its order.";
    case "ring": return "Click a ring template to drop it onto the canvas.";
    case "fg": return mbPendingFG ? `Click an existing atom to attach \u2013${mbPendingFG}.` : "Pick a functional group, then click an atom to attach it.";
    default: return "";
  }
}

function renderMolBuilder() {
  return `
    ${plateHeader("PharmaChemE Structure Builder", "OPENCHEMLIB-POWERED \u2014 FORMULA, MW, SMILES")}
    <div id="mb-toolbar" style="margin-bottom:6px;">${mbToolbarHTML()}</div>
    <div id="mb-hint" style="font-size:0.72rem; color:var(--muted-dim); font-family:var(--f-sans); margin-bottom:4px; min-height:1.2em;">${mbToolHintText()}</div>
    <div id="mb-warning" style="font-size:0.75rem; color:var(--rust); font-family:var(--f-sans); font-weight:600; min-height:1.2em; opacity:0; transition:opacity 0.2s;"></div>
    <div style="border:1px solid var(--grid-line); border-radius:4px; overflow:hidden; margin-top:6px;">
      <svg id="mb-canvas" width="100%" height="380" viewBox="0 0 ${MB_VB_W} ${MB_VB_H}" style="display:block; background:#ffffff; touch-action:none; cursor:crosshair;"></svg>
    </div>
    <div class="grid cols-2" style="margin-top:16px;">
      ${readoutHTML("mb-formula", "Molecular Formula")}
      ${readoutHTML("mb-mw", "Molecular Weight (g/mol)")}
      ${readoutHTML("mb-atoms", "Atom Count")}
      ${readoutHTML("mb-bonds", "Bond Count")}
    </div>
    <div class="readout" style="margin-top:12px; align-items:flex-start; flex-direction:column;">
      <span class="lbl">SMILES (Structure \u2192 SMILES, live)</span>
      <span id="mb-smiles-out" style="font-family:var(--f-mono); font-size:0.9rem; color:var(--paper); word-break:break-all; margin-top:4px;">\u2014</span>
    </div>
    <div style="margin-top:16px;">
      <label class="field"><span class="lbl">SMILES \u2192 Structure (paste a SMILES string and import)</span>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <input type="text" id="mb-smiles-in" placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O" style="flex:1; min-width:220px; padding:10px; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">
          <button type="button" class="pill active" id="mb-import-btn" style="padding:10px 18px;">Import</button>
        </div>
      </label>
      <div id="mb-import-status" style="font-size:0.75rem; margin-top:4px; min-height:1.2em;"></div>
    </div>
    <p style="font-size:0.75rem; color:var(--muted-dim); font-family:var(--f-sans); margin-top:16px;">
      Chemistry (formula, molecular weight, valence, implicit hydrogens, SMILES parsing and generation) is computed by OpenChemLib, an established open-source cheminformatics library \u2014 not a hand-built parser. This editor covers common organic structures with standard valences (C, N, O, S, P, F, Cl, Br, I) plus the NO\u2082 group's formal charges; it does not model expanded sulfur/phosphorus valence states, additional stereochemistry, or ring fusion onto an existing atom. Drawing a bond that would exceed an atom's normal valence is blocked with a warning. Undo/Redo covers every drawing action for this session (cleared on Clear or on leaving the tab).
    </p>
  `;
}

function initMolBuilder() {
  mbMol = window.OCL ? new window.OCL.Molecule(64, 64) : null;
  mbHistory = []; mbFuture = [];
  mbPrimary = "atom"; mbAtomEl = "C"; mbPendingFG = null;
  mbSelectedAtom = null; mbSelectedBond = null;
  mbDragging = false; mbMoved = false;
  mbDragStartId = null; mbDragStartPt = null; mbDragCur = null;
  mbMoveAtomIdx = null; mbMoveHistoryPushed = false;

  if (!window.OCL) {
    const box = qs("mb-canvas");
    if (box && box.parentElement) box.parentElement.innerHTML = `<p style="padding:24px; font-family:var(--f-sans); color:var(--rust);">The chemistry engine did not load. Please reopen this tool.</p>`;
    return;
  }

  const svg = qs("mb-canvas");
  svg.addEventListener("pointerdown", mbHandlePointerDown);
  svg.addEventListener("pointermove", mbHandlePointerMove);
  svg.addEventListener("pointerup", mbHandlePointerUp);
  svg.addEventListener("pointercancel", mbHandlePointerUp);

  qs("mb-toolbar").addEventListener("click", (e) => {
    const primaryBtn = e.target.closest("[data-mb-primary]");
    if (primaryBtn) {
      mbPrimary = primaryBtn.dataset.mbPrimary;
      if (mbPrimary !== "fg") mbPendingFG = null;
      qs("mb-toolbar").innerHTML = mbToolbarHTML();
      qs("mb-hint").textContent = mbToolHintText();
      return;
    }
    const elBtn = e.target.closest("[data-mb-el]");
    if (elBtn) { mbAtomEl = elBtn.dataset.mbEl; qs("mb-toolbar").innerHTML = mbToolbarHTML(); qs("mb-hint").textContent = mbToolHintText(); return; }
    const ringBtn = e.target.closest("[data-mb-ring]");
    if (ringBtn) { mbPushHistory(); mbInsertRing(ringBtn.dataset.mbRing); mbUpdate(); return; }
    const fgBtn = e.target.closest("[data-mb-fg]");
    if (fgBtn) { mbPendingFG = fgBtn.dataset.mbFg; qs("mb-toolbar").innerHTML = mbToolbarHTML(); qs("mb-hint").textContent = mbToolHintText(); return; }
    if (e.target.id === "mb-delete") { mbDeleteSelected(); return; }
    if (e.target.id === "mb-undo") { mbUndo(); return; }
    if (e.target.id === "mb-redo") { mbRedo(); return; }
    if (e.target.id === "mb-clear") { mbClearAll(); return; }
  });

  qs("mb-import-btn").addEventListener("click", mbImportSmiles);
  mbUpdate();
}
// ---------- Solvent Recovery ----------
function computeBoilingPointOnly(cfg) {
  const d = SOLVENT_DB[cfg.solvent];
  const P = parseFloat(cfg.vacuum);
  const Tb = d.B / (d.A - Math.log10(P)) - d.C;
  return { Tb };
}

// Shared boiling-point helper for the Heat Load tool only (kept local so the
// separate Boiling Point / Condenser / Vacuum Pump tools are not touched).
function hlBoilingPoint(cfg) {
  const d = SOLVENT_DB[cfg.solvent];
  const P = parseFloat(cfg.vacuum);
  return d.B / (d.A - Math.log10(P)) - d.C;
}

// Auto-suggests Heating Utility Type from the solvent boiling point. Only sets
// a default \u2014 the user can still change it manually afterward via the dropdown.
const HL_HEATING_TYPE_BP_THRESHOLD = 95;
function hlAutoHeatingType(caseObj) {
  const d = SOLVENT_DB[caseObj.solvent];
  if (!d) return;
  const P = parseFloat(caseObj.vacuum);
  if (!isFinite(P) || P <= 0) return;
  const Tb = hlBoilingPoint(caseObj);
  if (!isFinite(Tb)) return;
  caseObj.heatingType = Tb <= HL_HEATING_TYPE_BP_THRESHOLD ? "Hot Water" : "Steam";
}

// Minimum acceptable HW-to-boiling-point driving force (\u00b0C). Below this the
// jacket duty is considered impractically small even though technically positive.
const HW_MIN_DRIVING_FORCE = 5;

function computeHeatLoadRecovery(cfg) {
  const num = (v) => parseFloat(v);
  const Tb = hlBoilingPoint(cfg);

  const capL = num(cfg.capacity);
  const V_m3 = capL / 1000;
  const L = num(cfg.jacketLength);
  const D = Math.sqrt((4 * V_m3) / (Math.PI * L));
  const jacketAreaCalc = Math.PI * D * L;
  const jacketArea = cfg.jacketAreaBasis === "User Entered" ? num(cfg.jacketAreaManual) : jacketAreaCalc;
  const ffeA = cfg.ffeRequired === "YES" ? num(cfg.ffeArea) : 0;
  const effectiveArea = jacketArea + ffeA;
  const U = num(cfg.u);

  const density = num(cfg.density), cp = num(cfg.cp), latent = num(cfg.latent);
  const distilledL = num(cfg.qtyDistilled);
  const massDistilled = distilledL * (density / 1000);
  const T1 = num(cfg.initialTemp);
  const Qtotal = massDistilled * cp * (Tb - T1) + massDistilled * latent;

  const steamRow = STEAM_TABLE.find((r) => String(r.p) === String(cfg.steamPressure)) || STEAM_TABLE[0];
  const steamDiaM = (num(cfg.steamPipeDia) * 25.4) / 1000;
  const steamPipeArea = (Math.PI / 4) * steamDiaM * steamDiaM;
  const Q_steam = steamPipeArea * steamRow.velocity * 539 * 3600 * steamRow.density;

  let hwAvailDT = null, hwMean = null, hwJacketDT = null;
  let hwStatus = "n/a", hwMessage = "";
  let Q_avail, Q_jacket;

  if (cfg.heatingType === "Hot Water") {
    const hwSupply = num(cfg.hwSupply);
    const hwReturn = num(cfg.hwReturn);
    hwAvailDT = hwSupply - hwReturn;
    hwMean = (hwSupply + hwReturn) / 2;
    hwJacketDT = hwMean - Tb;

    if (hwJacketDT < 0) {
      hwStatus = "invalid";
      hwMessage = "HW temperature is below the solvent boiling point \u2014 invalid heating condition.";
    } else if (hwJacketDT < HW_MIN_DRIVING_FORCE) {
      hwStatus = "warning";
      hwMessage = "Very low temperature driving force \u2014 review feasibility.";
    } else {
      hwStatus = "ok";
      hwMessage = "Heating condition acceptable.";
    }

    const hwFlowKgHr = num(cfg.hwFlow) * 1000;
    Q_avail = hwFlowKgHr * 1 * hwAvailDT;
    Q_jacket = hwStatus === "invalid" ? NaN : U * effectiveArea * hwJacketDT;
  } else {
    // Steam path \u2014 unchanged from the original LMTD-based approach.
    const jacketT1 = steamRow.t;
    const jacketT2 = steamRow.t - num(cfg.steamJacketDT);
    const dT1j = jacketT1 - Tb, dT2j = jacketT2 - Tb;
    const LMTD_jacket = lmtd(dT1j, dT2j);
    Q_avail = Q_steam;
    Q_jacket = U * effectiveArea * LMTD_jacket;
  }

  const Q_effective = Math.min(Q_avail, Q_jacket);
  const Q_actual = Q_effective * (1 - num(cfg.jacketLossPct) / 100);
  const recoveryTime = Qtotal / Q_actual;

  return {
    Tb, jacketArea, jacketAreaCalc, ffeA, effectiveArea, Qtotal, Q_avail, Q_jacket, recoveryTime,
    hwAvailDT, hwMean, hwJacketDT, hwStatus, hwMessage,
  };
}

function computeCondenserSizing(cfg) {
  const num = (v) => parseFloat(v);
  const d = SOLVENT_DB[cfg.solvent];
  const P = num(cfg.vacuum);
  const Tb = d.B / (d.A - Math.log10(P)) - d.C;

  const distilledL = num(cfg.qtyDistilled);
  const recoveryTime = num(cfg.recoveryTime);
  const density = num(cfg.density), latent = num(cfg.latent);
  const massFlowCond = (distilledL / recoveryTime) * (density / 1000);
  const Q_cond = massFlowCond * latent;

  const U_cond = HX_TYPES[cfg.hxType];
  const condTin = num(cfg.condTin), condTout = num(cfg.condTout);
  const dT1c = Tb - condTout, dT2c = Tb - condTin;
  const LMTD_cond = lmtd(dT1c, dT2c);
  const areaBase = Q_cond / (U_cond * LMTD_cond);
  const areaFinal = areaBase * (1 + num(cfg.designMargin) / 100);

  const utilFlowKgHr = Q_cond / (condTout - condTin);
  const utilDensity = COND_UTILITIES[cfg.condUtility].density;
  const utilVolM3Hr = utilFlowKgHr / utilDensity;
  const pipeAreaM2 = utilVolM3Hr / 3600 / num(cfg.condVelocity);
  const pipeDiaM = Math.sqrt((4 * pipeAreaM2) / Math.PI);
  const pipeDiaMm = pipeDiaM * 1000;
  const pipeDiaIn = pipeDiaMm / 25.4;

  return { Tb, Q_cond, areaBase, areaFinal, pipeDiaMm, pipeDiaIn };
}

function computeVacuumPumpOnly(cfg) {
  const num = (v) => parseFloat(v);
  const d = SOLVENT_DB[cfg.solvent];
  const P = num(cfg.vacuum);
  const Tb = d.B / (d.A - Math.log10(P)) - d.C;

  const V_m3 = num(cfg.capacity) / 1000;
  const distilledL = num(cfg.qtyDistilled);
  const recoveryTime = num(cfg.recoveryTime);
  const density = num(cfg.density), mw = num(cfg.mw);

  const leakNozzle = num(cfg.nozzleCount) * num(cfg.nozzleSize) * 0.018;
  const leakGasket = num(cfg.gasket3in) * 3.14 * 3 * 0.005 + num(cfg.gasket05in) * 3.14 * 0.5 * 0.005 + num(cfg.gasketPerimeter) * 0.005;
  const leakValve = num(cfg.valveCount) * 3.14 * num(cfg.valveDia) * 0.02;
  const totalLeakLbHr = leakNozzle + leakGasket + leakValve;
  const totalLeakLbMin = totalLeakLbHr / 60;
  const pumpLeakage = totalLeakLbMin * (379 / 29) * (760 / P) * 0.028 * 60;

  const lossVolL = distilledL * (num(cfg.lossPct) / 100);
  const lossMassKg = lossVolL * (density / 1000);
  const P_kPa = P * 0.133;
  const mRT_M = (lossMassKg * 8.314 * (273 + Tb)) / mw;
  const pumpEvaporation = mRT_M / (recoveryTime * P_kPa);

  const evacT = num(cfg.evacTime);
  const pumpEvacuation = (V_m3 / evacT) * Math.log(760 / P);

  const totalPumpCap = P >= 760 ? NaN : Math.max(pumpLeakage, pumpEvacuation) + pumpEvaporation;

  return { Tb, pumpLeakage, pumpEvacuation, pumpEvaporation, totalPumpCap };
}

// -- Sub-tool configs --
const BP_DEFAULTS = { solvent: "MDC", vacuum: "760" };
const HL_DEFAULTS = {
  capacity: "7000", moc: "SS", u: String(REACTOR_MOC.SS), jacketLength: "2.4",
  jacketAreaBasis: "Calculated", jacketAreaManual: "",
  ffeRequired: "NO", ffeArea: "12",
  solvent: "MDC", vacuum: "760", qtyDistilled: "3600", initialTemp: "20",
  density: "1330", cp: "0.289474", latent: "97",
  heatingType: "Hot Water",
  hwSupply: "90", hwReturn: "80", hwFlow: "6",
  steamPressure: "1", steamPipeDia: "1", steamJacketDT: "10",
  jacketLossPct: "5",
};
const CD_DEFAULTS = {
  solvent: "MDC", vacuum: "760", qtyDistilled: "3600", recoveryTime: "8.14",
  density: "1330", latent: "97",
  hxType: "Shell&Tube", condUtility: "CHW", condTin: "8", condTout: "13", condVelocity: "1", designMargin: "20",
};
const VP_DEFAULTS = {
  solvent: "MDC", vacuum: "760", capacity: "7000", qtyDistilled: "3600", recoveryTime: "8.14",
  density: "1330", mw: "85",
  nozzleCount: "8", nozzleSize: "2.2", gasket3in: "0", gasket05in: "1", gasketPerimeter: "12",
  valveCount: "6", valveDia: "2", lossPct: "30", evacTime: "0.33",
};

const SR_SUB_TOOLS = [
  { id: "boiling", label: "Boiling Point at Vacuum", desc: "Antoine equation \u2014 boiling point of a solvent at any applied vacuum." },
  { id: "heatload", label: "Heat Load & Recovery Time", desc: "Reactor geometry, solvent, and heating utility \u2192 total heat load and theoretical recovery time." },
  { id: "condenser", label: "Condenser Sizing", desc: "Solvent, quantity distilled, and a known recovery time \u2192 condenser duty and area." },
  { id: "vacuumpump", label: "Vacuum Pump Capacity", desc: "Leakage, evaporation, and evacuation load \u2192 required vacuum pump capacity." },
];

let srSubActive = null;
let srCases = {
  boiling: [{ label: "Case 1", ...BP_DEFAULTS }, { label: "Case 2", ...BP_DEFAULTS }],
  heatload: [{ label: "Reactor 1", ...HL_DEFAULTS }, { label: "Reactor 2", ...HL_DEFAULTS }],
  condenser: [{ label: "Case 1", ...CD_DEFAULTS }, { label: "Case 2", ...CD_DEFAULTS }],
  vacuumpump: [{ label: "Case 1", ...VP_DEFAULTS }, { label: "Case 2", ...VP_DEFAULTS }],
};

function renderSolventRecovery() {
  if (!srSubActive) {
    const cards = SR_SUB_TOOLS.map((t) => `
      <div class="dash-card" data-sr-open="${t.id}">
        <h3>${t.label}</h3>
        <p>${t.desc}</p>
        <span class="dash-open">Open \u2192</span>
      </div>
    `).join("");
    return `
      ${plateHeader("Solvent Recovery", "CHOOSE A CALCULATION")}
      <div class="dash-grid">${cards}</div>
    `;
  }
  const tool = SR_SUB_TOOLS.find((t) => t.id === srSubActive);
  return `
    <button id="sr-back" class="pill" style="margin-bottom:16px;">\u2190 Solvent Recovery</button>
    ${plateHeader(tool.label, "")}
    <div style="display:flex; justify-content:flex-end; margin-bottom:16px;">
      <button id="sr-add-case" class="pill" style="background:var(--brass); color:var(--bg-deep); border-color:var(--brass);">+ Add case</button>
    </div>
    <div class="comparison-table-scroll">
      <table id="sr-comparison-table" class="comparison-table" style="border-collapse:collapse; width:100%;"></table>
    </div>
  `;
}

const SR_FIELD_DEFS = {
  boiling: {
    compute: computeBoilingPointOnly,
    inputRows: [
      { label: "Solvent", field: "solvent", type: "solvent" },
      { label: "Vacuum applied (torr)", field: "vacuum", type: "input" },
    ],
    resultRows: [
      ["Boiling point at vacuum", (m) => `${fmt(m.Tb)} \u00b0C`],
    ],
  },
  heatload: {
    compute: computeHeatLoadRecovery,
    inputRows: [
      { label: "Capacity (L)", field: "capacity", type: "input" },
      { label: "MOC / HX type (sets default U)", field: "moc", type: "select", options: Object.keys(REACTOR_MOC) },
      { label: "Overall heat transfer coefficient, U (kcal/m\u00b2\u00b7hr\u00b7\u00b0C)", field: "u", type: "input" },
      { label: "Jacket area basis", field: "jacketAreaBasis", type: "select", options: ["Calculated", "User Entered"] },
      { label: "Assumed straight length (m)", field: "jacketLength", type: "input", calcAreaOnly: true },
      { label: "Jacket area \u2014 user entered (m\u00b2)", field: "jacketAreaManual", type: "input", manualAreaOnly: true },
      { label: "FFE required", field: "ffeRequired", type: "select", options: ["YES", "NO"] },
      { label: "Proposed FFE area (m\u00b2)", field: "ffeArea", type: "input" },
      { label: "Solvent", field: "solvent", type: "solvent" },
      { label: "Vacuum applied (torr)", field: "vacuum", type: "input" },
      { label: "Qty. to be distilled (L)", field: "qtyDistilled", type: "input" },
      { label: "Initial mass temperature (\u00b0C)", field: "initialTemp", type: "input" },
      { label: "Density (kg/m\u00b3) \u2014 auto/manual", field: "density", type: "input" },
      { label: "Specific heat, Cp (kcal/kg.C)", field: "cp", type: "input" },
      { label: "Latent heat (kcal/kg)", field: "latent", type: "input" },
      { label: "Heating utility type", field: "heatingType", type: "select", options: ["Hot Water", "Steam"] },
      { label: "HW supply temperature (\u00b0C)", field: "hwSupply", type: "input", hwOnly: true },
      { label: "HW return temperature (\u00b0C)", field: "hwReturn", type: "input", hwOnly: true },
      { label: "HW flow rate (m\u00b3/hr)", field: "hwFlow", type: "input", hwOnly: true },
      { label: "Steam pressure (kg/cm\u00b2)", field: "steamPressure", type: "select", options: STEAM_TABLE.map((r) => String(r.p)), steamOnly: true },
      { label: "Steam pipe diameter (in)", field: "steamPipeDia", type: "input", steamOnly: true },
      { label: "Steam jacket \u0394T (\u00b0C)", field: "steamJacketDT", type: "input", steamOnly: true },
      { label: "Heat loss in transfer (%)", field: "jacketLossPct", type: "input" },
    ],
    resultRows: [
      ["Boiling point at vacuum", (m) => `${fmt(m.Tb)} \u00b0C`],
      ["Effective jacket area", (m) => `${fmt(m.effectiveArea)} m\u00b2<div style="color:var(--muted); font-size:0.7rem;">Jacket ${fmt(m.jacketArea)} + FFE ${fmt(m.ffeA)}</div>`],
      ["HW available \u0394T (calculated)", (m) => m.hwAvailDT === null ? "N/A (Steam)" : `${fmt(m.hwAvailDT)} \u00b0C`],
      ["HW mean temperature (calculated)", (m) => m.hwMean === null ? "N/A (Steam)" : `${fmt(m.hwMean)} \u00b0C`],
      ["HW jacket \u0394T (calculated)", (m) => m.hwJacketDT === null ? "N/A (Steam)" : `${fmt(m.hwJacketDT)} \u00b0C`],
      ["HW driving-force check", (m) => {
        if (m.hwStatus === "n/a") return `<span style="color:var(--muted);">N/A (Steam)</span>`;
        const color = m.hwStatus === "invalid" ? "var(--rust)" : m.hwStatus === "warning" ? "var(--brass)" : "var(--paper)";
        return `<span style="color:${color};">${m.hwMessage}</span>`;
      }],
      ["Total heat load", (m) => `${fmt(m.Qtotal)} Kcal`],
      ["Heat available \u2014 utility", (m) => `${fmt(m.Q_avail)} Kcal/hr`],
      ["Heat transferable \u2014 jacket", (m) => `${fmt(m.Q_jacket)} Kcal/hr`],
      ["Recovery time", (m) => `<span style="color:${!isFinite(m.recoveryTime) || m.recoveryTime <= 0 ? "var(--rust)" : "var(--brass)"}">${fmt(m.recoveryTime)} Hr</span>`],
    ],
  },
  condenser: {
    compute: computeCondenserSizing,
    inputRows: [
      { label: "Solvent", field: "solvent", type: "solvent" },
      { label: "Vacuum applied (torr)", field: "vacuum", type: "input" },
      { label: "Qty. to be distilled (L)", field: "qtyDistilled", type: "input" },
      { label: "Recovery time (hr)", field: "recoveryTime", type: "input" },
      { label: "Density (kg/m\u00b3) \u2014 auto/manual", field: "density", type: "input" },
      { label: "Latent heat (kcal/kg)", field: "latent", type: "input" },
      { label: "HX type", field: "hxType", type: "select", options: Object.keys(HX_TYPES) },
      { label: "Utility", field: "condUtility", type: "select", options: Object.keys(COND_UTILITIES) },
      { label: "Utility inlet temp (\u00b0C)", field: "condTin", type: "input" },
      { label: "Utility outlet temp (\u00b0C)", field: "condTout", type: "input" },
      { label: "Pipe velocity, assumed (m/s)", field: "condVelocity", type: "input" },
      { label: "Design margin (%)", field: "designMargin", type: "input" },
    ],
    resultRows: [
      ["Boiling point at vacuum", (m) => `${fmt(m.Tb)} \u00b0C`],
      ["Condenser duty", (m) => `${fmt(m.Q_cond)} Kcal/hr`],
      ["Condenser area (theoretical)", (m) => `${fmt(m.areaFinal)} m\u00b2<div style="color:var(--muted); font-size:0.7rem;">Base ${fmt(m.areaBase)} m\u00b2</div>`],
      ["Condenser utility pipe", (m) => `${fmt(m.pipeDiaMm)} mm (${fmt(m.pipeDiaIn)}")`],
    ],
  },
  vacuumpump: {
    compute: computeVacuumPumpOnly,
    inputRows: [
      { label: "Solvent", field: "solvent", type: "solvent" },
      { label: "Vacuum applied (torr)", field: "vacuum", type: "input" },
      { label: "Reactor capacity (L)", field: "capacity", type: "input" },
      { label: "Qty. to be distilled (L)", field: "qtyDistilled", type: "input" },
      { label: "Recovery time (hr)", field: "recoveryTime", type: "input" },
      { label: "Density (kg/m\u00b3) \u2014 auto/manual", field: "density", type: "input" },
      { label: "Molecular weight \u2014 auto/manual", field: "mw", type: "input" },
      { label: "Process nozzles on reactor", field: "nozzleCount", type: "input" },
      { label: "Avg. nozzle size (in)", field: "nozzleSize", type: "input" },
      { label: "Gaskets, 3\"", field: "gasket3in", type: "input" },
      { label: "Gaskets, 1/2\"", field: "gasket05in", type: "input" },
      { label: "Reactor gasket perimeter (in)", field: "gasketPerimeter", type: "input" },
      { label: "Valve count", field: "valveCount", type: "input" },
      { label: "Valve diameter (in)", field: "valveDia", type: "input" },
      { label: "Solvent loss to vacuum (%)", field: "lossPct", type: "input" },
      { label: "Evacuation time (hr)", field: "evacTime", type: "input" },
    ],
    resultRows: [
      ["Boiling point at vacuum", (m) => `${fmt(m.Tb)} \u00b0C`],
      ["Pump cap. \u2014 leakage/evac", (m) => `${fmt(Math.max(m.pumpLeakage, m.pumpEvacuation))} m\u00b3/hr`],
      ["Pump cap. \u2014 evaporation load", (m) => `${fmt(m.pumpEvaporation)} m\u00b3/hr`],
      ["Vacuum pump capacity", (m) => isFinite(m.totalPumpCap) ? `${fmt(m.totalPumpCap)} m\u00b3/hr` : "N/A (atmospheric)"],
    ],
  },
};

function srBoilingOptionsHtml() {
  const bpCases = srCases.boiling;
  const opts = bpCases.map((c, i) => `<option value="${i}">${c.label} \u2014 ${c.solvent} @ ${c.vacuum} torr</option>`).join("");
  return `<option value="">\u2199 Pull from Boiling Point\u2026</option>${opts}`;
}

function srHeatLoadOptionsHtml() {
  const hlCases = srCases.heatload;
  const metrics = hlCases.map(computeHeatLoadRecovery);
  const opts = hlCases.map((c, i) => `<option value="${i}">${c.label} \u2014 ${fmt(metrics[i].recoveryTime)} hr</option>`).join("");
  return `<option value="">\u2199 Pull from Heat Load\u2026</option>${opts}`;
}

function srApplyPullFromBoiling(idx, bpIdx) {
  const bpCfg = srCases.boiling[bpIdx];
  const target = srCases[srSubActive][idx];
  target.solvent = bpCfg.solvent;
  target.vacuum = bpCfg.vacuum;
  if (srSubActive === "heatload") hlAutoHeatingType(target);
}

function srApplyPullFromHeatLoad(idx, hlIdx) {
  const hlCfg = srCases.heatload[hlIdx];
  const hlMetrics = computeHeatLoadRecovery(hlCfg);
  const target = srCases[srSubActive][idx];
  target.solvent = hlCfg.solvent;
  target.vacuum = hlCfg.vacuum;
  target.qtyDistilled = hlCfg.qtyDistilled;
  target.recoveryTime = String(hlMetrics.recoveryTime);
  if ("capacity" in target) target.capacity = hlCfg.capacity;
}


/* ---------- Responsive case navigator ----------
   Desktop: all cases remain side-by-side.
   Mobile: one case column is shown at a time; swipe or use arrows to move.
*/
const comparisonCaseState = {};

function enhanceComparisonTable(tableId) {
  const table = qs(tableId);
  if (!table) return;

  const scrollParent = table.parentElement;
  const host = scrollParent?.parentElement || scrollParent;
  let nav = host?.querySelector(`.case-nav[data-for="${tableId}"]`);
  const caseCount = table.querySelector("thead tr")?.children.length - 1;
  if (!Number.isFinite(caseCount) || caseCount < 1) return;

  if (!nav) {
    nav = document.createElement("div");
    nav.className = "case-nav";
    nav.dataset.for = tableId;
    nav.innerHTML = `
      <button type="button" data-case-prev aria-label="Previous case">‹</button>
      <div class="case-position"></div>
      <button type="button" data-case-next aria-label="Next case">›</button>
    `;
    host.insertBefore(nav, scrollParent);

    nav.querySelector("[data-case-prev]").addEventListener("click", () => {
      const state = comparisonCaseState[tableId] || { index: 0 };
      state.index = Math.max(0, state.index - 1);
      comparisonCaseState[tableId] = state;
      applyComparisonCase(tableId);
    });
    nav.querySelector("[data-case-next]").addEventListener("click", () => {
      const state = comparisonCaseState[tableId] || { index: 0 };
      const currentCaseCount = table.querySelector("thead tr")?.children.length - 1;
      state.index = Math.min(Math.max(0, currentCaseCount - 1), state.index + 1);
      comparisonCaseState[tableId] = state;
      applyComparisonCase(tableId);
    });

    let startX = null;
    table.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) startX = e.touches[0].clientX;
    }, { passive: true });
    table.addEventListener("touchend", (e) => {
      if (startX === null || e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) < 45) return;
      const state = comparisonCaseState[tableId] || { index: 0 };
      const currentCaseCount = table.querySelector("thead tr")?.children.length - 1;
      state.index += dx < 0 ? 1 : -1;
      state.index = Math.max(0, Math.min(Math.max(0, currentCaseCount - 1), state.index));
      comparisonCaseState[tableId] = state;
      applyComparisonCase(tableId);
    }, { passive: true });
  }

  const state = comparisonCaseState[tableId] || { index: 0 };
  state.index = Math.max(0, Math.min(caseCount - 1, state.index));
  comparisonCaseState[tableId] = state;
  applyComparisonCase(tableId);
}

function applyComparisonCase(tableId) {
  const table = qs(tableId);
  if (!table) return;

  const scrollParent = table.parentElement;
  const host = scrollParent?.parentElement || scrollParent;
  const nav = host?.querySelector(`.case-nav[data-for="${tableId}"]`);
  const headerCells = table.querySelector("thead tr")?.children;
  const caseCount = headerCells ? headerCells.length - 1 : 0;
  if (!caseCount) return;

  const state = comparisonCaseState[tableId] || { index: 0 };
  const mobile = window.matchMedia("(max-width: 600px)").matches;

  table.querySelectorAll("tr").forEach((tr) => {
    const cells = Array.from(tr.children);
    if (cells.length <= 1) return;
    if (cells.length === 1 || cells[0].colSpan > 1) return;

    cells.forEach((cell, idx) => {
      if (idx === 0) {
        cell.style.display = "";
      } else {
        cell.style.display = mobile && idx !== state.index + 1 ? "none" : "";
      }
    });
  });

  if (nav) {
    nav.querySelector(".case-position").textContent =
      `Case ${state.index + 1} of ${caseCount}`;
    nav.querySelector("[data-case-prev]").disabled = state.index === 0;
    nav.querySelector("[data-case-next]").disabled = state.index === caseCount - 1;
  }
}

function refreshComparisonTables() {
  [
    "sr-comparison-table",
    "su-table",
    "cp-table",
    "ft-table",
    "cf-table",
    "pp-table"
  ].forEach((id) => {
    if (qs(id)) enhanceComparisonTable(id);
  });
}

window.addEventListener("resize", refreshComparisonTables);

function srRenderStructure() {
  const def = SR_FIELD_DEFS[srSubActive];
  const cases = srCases[srSubActive];
  const n = cases.length;
  const showBoilingPull = srSubActive === "heatload" || srSubActive === "condenser" || srSubActive === "vacuumpump";
  const showHeatLoadPull = srSubActive === "condenser" || srSubActive === "vacuumpump";
  let html = "<thead><tr>";
  html += suThCell("Case", true);
  cases.forEach((r, i) => {
    html += `<th style="padding:8px 12px; text-align:left; border-bottom:2px solid var(--brass-dim); min-width:200px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
        <input data-sr-label="${i}" value="${r.label}" style="padding:6px 8px; font-size:0.9rem; font-weight:700; background:transparent; color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-display); width:100%;">
        ${n > 1 ? `<button data-sr-remove="${i}" style="color:var(--rust); font-size:1rem; line-height:1; background:none; border:none; cursor:pointer;">\u2715</button>` : ""}
      </div>
      ${showBoilingPull ? `<select data-sr-pull-bp="${i}" style="width:100%; padding:4px 6px; font-size:0.7rem; background:var(--panel-raised); color:var(--muted); border:1px solid var(--grid-line); font-family:var(--f-sans); margin-bottom:4px;">${srBoilingOptionsHtml()}</select>` : ""}
      ${showHeatLoadPull ? `<select data-sr-pull-hl="${i}" style="width:100%; padding:4px 6px; font-size:0.7rem; background:var(--panel-raised); color:var(--muted); border:1px solid var(--grid-line); font-family:var(--f-sans);">${srHeatLoadOptionsHtml()}</select>` : ""}
    </th>`;
  });
  html += "</tr></thead><tbody id=\"sr-input-body\">";
  html += suSectionRow("Inputs", n);
  def.inputRows.forEach((row) => {
    html += "<tr>" + suThCell(row.label, true);
    cases.forEach((r, i) => {
      const disabled = (row.hwOnly && r.heatingType !== "Hot Water") || (row.steamOnly && r.heatingType !== "Steam") ||
        (row.calcAreaOnly && r.jacketAreaBasis === "User Entered") || (row.manualAreaOnly && r.jacketAreaBasis !== "User Entered");
      if (disabled) {
        html += suTdCell(`<span style="color:var(--muted-dim); font-family:var(--f-mono); font-size:0.85rem;">N/A</span>`);
        return;
      }
      if (row.type === "select") {
        const opts = row.options.map((o) => `<option value="${o}" ${o === r[row.field] ? "selected" : ""}>${o}</option>`).join("");
        html += suTdCell(`<select data-sr-field="${row.field}" data-sr-idx="${i}" data-sr-kind="select" style="width:100%; padding:6px 8px; font-size:0.85rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">${opts}</select>`);
      } else if (row.type === "solvent") {
        html += suTdCell(`<div class="solvent-picker">
          <input type="text" autocomplete="off" data-sr-field="solvent" data-sr-idx="${i}" data-sr-kind="input" data-sr-solvent-input value="${r.solvent}" placeholder="Search solvent" style="width:100%; padding:6px 8px; font-size:0.85rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">
          <div class="solvent-options" data-sr-solvent-options="${i}"></div>
        </div>`);
      } else {
        html += suTdCell(`<input type="number" data-sr-field="${row.field}" data-sr-idx="${i}" data-sr-kind="input" value="${r[row.field]}" style="width:100%; padding:6px 8px; font-size:0.9rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">`);
      }
    });
    html += "</tr>";
  });
  html += "</tbody>";

  qs("sr-comparison-table").innerHTML = html;
  const table = qs("sr-comparison-table");
  const inputBody = qs("sr-input-body");
  const resultsBody = document.createElement("tbody");
  resultsBody.id = "sr-results-body";
  inputBody.after(resultsBody);

  table.querySelectorAll("[data-sr-field]").forEach((el) => {
    const isSelect = el.dataset.srKind === "select";
    el.addEventListener(isSelect ? "change" : "input", () => {
      const idx = parseInt(el.dataset.srIdx, 10);
      const field = el.dataset.srField;
      const arr = srCases[srSubActive];
      if (field === "solvent") {
        // Custom autocomplete handles solvent selection. Only commit exact DB matches.
        const d = SOLVENT_DB[el.value];
        if (!d) return;
        const hasFull = d.density != null;
        arr[idx].solvent = el.value;
        if ("density" in arr[idx]) arr[idx].density = hasFull ? String(d.density) : "";
        if ("cp" in arr[idx]) arr[idx].cp = d.cp != null ? String(d.cp) : "";
        if ("latent" in arr[idx]) arr[idx].latent = d.latent != null ? String(d.latent) : "";
        if ("mw" in arr[idx]) arr[idx].mw = d.mw != null ? String(d.mw) : "";
      } else if (field === "condUtility") {
        const u = COND_UTILITIES[el.value];
        arr[idx].condUtility = el.value;
        arr[idx].condTin = String(u.tin);
        arr[idx].condTout = String(u.tout);
      } else if (field === "moc") {
        arr[idx].moc = el.value;
        arr[idx].u = String(REACTOR_MOC[el.value]);
      } else if (field === "jacketAreaBasis") {
        arr[idx].jacketAreaBasis = el.value;
        if (el.value === "User Entered" && !arr[idx].jacketAreaManual) {
          arr[idx].jacketAreaManual = fmt(computeHeatLoadRecovery(arr[idx]).jacketAreaCalc);
        }
      } else {
        arr[idx][field] = el.value;
      }
      if (isSelect) srRenderStructure();
      srRenderResults();
    });
  });
  // Custom solvent autocomplete: avoids the browser-native datalist overlay on mobile.
  const renderSolventOptions = (input, forceOpen = true) => {
    const idx = parseInt(input.dataset.srIdx, 10);
    const box = table.querySelector(`[data-sr-solvent-options="${idx}"]`);
    if (!box) return;
    const q = input.value.trim().toLowerCase();
    const matches = SOLVENT_NAMES.filter((name) => name.toLowerCase().includes(q)).slice(0, 16);
    box.innerHTML = matches.length
      ? matches.map((name) => `<div class="solvent-option" data-solvent-value="${name.replace(/"/g, '&quot;')}">${name}</div>`).join("")
      : `<div class="solvent-no-match">No matching solvent</div>`;
    box.classList.toggle("open", forceOpen);
  };

  table.querySelectorAll("[data-sr-solvent-input]").forEach((input) => {
    input.addEventListener("focus", () => renderSolventOptions(input));
    input.addEventListener("input", () => renderSolventOptions(input));
    input.addEventListener("blur", () => {
      setTimeout(() => {
        const idx = parseInt(input.dataset.srIdx, 10);
        table.querySelector(`[data-sr-solvent-options="${idx}"]`)?.classList.remove("open");
      }, 180);
    });
  });

  table.querySelectorAll("[data-sr-solvent-options]").forEach((box) => {
    box.addEventListener("mousedown", (e) => {
      const option = e.target.closest("[data-solvent-value]");
      if (!option) return;
      e.preventDefault();
      const idx = parseInt(box.dataset.srSolventOptions, 10);
      const input = table.querySelector(`[data-sr-solvent-input][data-sr-idx="${idx}"]`);
      const value = option.dataset.solventValue;
      if (!input || !SOLVENT_DB[value]) return;
      const d = SOLVENT_DB[value];
      const arr = srCases[srSubActive];
      arr[idx].solvent = value;
      if ("density" in arr[idx]) arr[idx].density = d.density != null ? String(d.density) : "";
      if ("cp" in arr[idx]) arr[idx].cp = d.cp != null ? String(d.cp) : "";
      if ("latent" in arr[idx]) arr[idx].latent = d.latent != null ? String(d.latent) : "";
      if ("mw" in arr[idx]) arr[idx].mw = d.mw != null ? String(d.mw) : "";
      if (srSubActive === "heatload") hlAutoHeatingType(arr[idx]);
      srRenderStructure();
      srRenderResults();
    });
  });

  table.querySelectorAll("[data-sr-label]").forEach((el) => {
    el.addEventListener("input", () => {
      const idx = parseInt(el.dataset.srLabel, 10);
      srCases[srSubActive][idx].label = el.value;
    });
  });
  if (srSubActive === "heatload") {
    table.querySelectorAll('[data-sr-field="vacuum"]').forEach((el) => {
      el.addEventListener("change", () => {
        const idx = parseInt(el.dataset.srIdx, 10);
        const arr = srCases[srSubActive];
        hlAutoHeatingType(arr[idx]);
        srRenderStructure();
        srRenderResults();
      });
    });
  }
  table.querySelectorAll("[data-sr-pull-bp]").forEach((el) => {
    el.addEventListener("change", () => {
      const idx = parseInt(el.dataset.srPullBp, 10);
      if (el.value !== "") {
        srApplyPullFromBoiling(idx, parseInt(el.value, 10));
        srRenderStructure();
        srRenderResults();
      }
    });
  });
  table.querySelectorAll("[data-sr-pull-hl]").forEach((el) => {
    el.addEventListener("change", () => {
      const idx = parseInt(el.dataset.srPullHl, 10);
      if (el.value !== "") {
        srApplyPullFromHeatLoad(idx, parseInt(el.value, 10));
        srRenderStructure();
        srRenderResults();
      }
    });
  });
  table.querySelectorAll("[data-sr-remove]").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = parseInt(el.dataset.srRemove, 10);
      const arr = srCases[srSubActive];
      if (arr.length > 1) {
        arr.splice(idx, 1);
        srRenderStructure();
        srRenderResults();
      }
    });
  });
}

function srRenderResults() {
  const body = qs("sr-results-body");
  if (!body) return;
  const def = SR_FIELD_DEFS[srSubActive];
  const cases = srCases[srSubActive];
  const n = cases.length;
  const metrics = cases.map(def.compute);
  let html = suSectionRow("Results", n);
  def.resultRows.forEach(([label, fn]) => {
    html += "<tr>" + suThCell(label, true);
    metrics.forEach((m) => {
      html += suTdCell(`<div style="color:var(--brass); font-family:var(--f-mono); font-size:0.95rem;">${fn(m)}</div>`);
    });
    html += "</tr>";
  });
  body.innerHTML = html;
  enhanceComparisonTable("sr-comparison-table");
}

function initSolventRecovery() {
  srSubActive = null;
  renderAndWireSolventRecovery();
}

function renderAndWireSolventRecovery() {
  qs("panels").querySelector("#sr-hub-slot")?.remove();
  const panelHtml = renderSolventRecovery();
  const container = qs("panels");
  container.innerHTML = "";
  const slot = document.createElement("div");
  slot.id = "sr-hub-slot";
  slot.innerHTML = panelHtml;
  container.appendChild(slot);

  if (!srSubActive) {
    container.querySelectorAll("[data-sr-open]").forEach((card) => {
      card.addEventListener("click", () => {
        srSubActive = card.dataset.srOpen;
        renderAndWireSolventRecovery();
      });
    });
  } else {
    qs("sr-back").addEventListener("click", () => {
      srSubActive = null;
      renderAndWireSolventRecovery();
    });
    qs("sr-add-case").addEventListener("click", () => {
      const def = { boiling: BP_DEFAULTS, heatload: HL_DEFAULTS, condenser: CD_DEFAULTS, vacuumpump: VP_DEFAULTS }[srSubActive];
      const prefix = srSubActive === "heatload" ? "Reactor" : "Case";
      const newCase = { label: `${prefix} ${srCases[srSubActive].length + 1}`, ...def };
      if (srSubActive === "heatload") hlAutoHeatingType(newCase);
      srCases[srSubActive].push(newCase);
      srRenderStructure();
      srRenderResults();
    });
    srRenderStructure();
    srRenderResults();
  }
}




// ---------- Mixing / Scale-up (multi-reactor comparison) ----------
const SCALEUP_DEFAULTS = {
  capacity: "7000", T: "1980", Ltt: "1925", dishAdd: "435",
  rmVol: "3200.65", density: "1064.84", viscosityCp: "0.36",
  rpm: "96", typeBottom: "PBT", typeMiddle: "PBT", typeTop: "PBT",
  dBottom: "920", dMiddle: "920", dTop: "920",
};
let scaleupReactors = [
  { label: "Reactor 1", ...SCALEUP_DEFAULTS },
  { label: "Reactor 2", ...SCALEUP_DEFAULTS },
];

function computeReactorMetrics(r) {
  const num = (x) => parseFloat(x);
  const T_ = num(r.T), L_ = num(r.Ltt), cap = num(r.capacity), rm = num(r.rmVol);
  const rho = num(r.density), mu = num(r.viscosityCp) / 1000;
  const N = num(r.rpm) / 60;
  const Db = num(r.dBottom), Dm = num(r.dMiddle), Dt = num(r.dTop);
  const Npb = IMPELLER_NP[r.typeBottom], Npm = IMPELLER_NP[r.typeMiddle], Npt = IMPELLER_NP[r.typeTop];

  const T_m = T_ / 1000;
  const calcVol = (Math.PI / 4) * T_m * T_m * L_ + (Math.PI / 24) * Math.pow(T_m, 3) * 1000;
  const Lp = L_ + num(r.dishAdd);
  const H = (Lp / calcVol) * (rm / 1000);
  const clearWall = T_ - Db;
  const clearImpellers = (H / (3 - 0.5)) * 1000;
  const LT = L_ / T_;
  const DTbottom = Db / T_, DTmiddle = Dm / T_, DTtop = Dt / T_;
  const occupancy = (rm / cap) * 100;

  const Re = Math.pow(Db / 1000, 2) * N * rho / mu;
  const regime = Re > 10000 ? "Turbulent" : Re < 100 ? "Laminar" : "Transitional";
  const tipSpeed = Math.PI * (Db / 1000) * N;

  const Power = Npt * rho * Math.pow(N, 3) * Math.pow(Dt / 1000, 5)
    + Npb * rho * Math.pow(N, 3) * Math.pow(Db / 1000, 5)
    + Npm * rho * Math.pow(N, 3) * Math.pow(Dm / 1000, 5);
  const PV = Power / rm;
  const microMixTime = (5.2 * T_ * T_) / Math.pow(Npb, 1 / 3) / N / (Db * Db);
  const shearRate = Math.sqrt(PV / mu);
  const torque = Power / (2 * Math.PI * N);
  const torqueV = torque / rm;

  return { calcVol, H, clearWall, clearImpellers, LT, DTbottom, DTmiddle, DTtop, occupancy, Re, regime, tipSpeed, Power, PV, microMixTime, shearRate, torque, torqueV };
}

const SCALEUP_INPUT_ROWS = [
  { section: "Reactor Geometry" },
  { label: "Reactor capacity (L)", field: "capacity", type: "input" },
  { label: "Diameter, T (mm)", field: "T", type: "input" },
  { label: "Height, Tan-to-Tan (mm)", field: "Ltt", type: "input" },
  { label: "Dish height addition (mm)", field: "dishAdd", type: "input" },
  { section: "Reaction Mass" },
  { label: "RM volume during operation (L)", field: "rmVol", type: "input" },
  { label: "Density of fluid (kg/m³)", field: "density", type: "input" },
  { label: "Viscosity of fluid (cP)", field: "viscosityCp", type: "input" },
  { section: "Agitation" },
  { label: "RPM", field: "rpm", type: "input" },
  { label: "Impeller type — Bottom", field: "typeBottom", type: "select" },
  { label: "Impeller dia — Bottom (mm)", field: "dBottom", type: "input" },
  { label: "Impeller type — Middle", field: "typeMiddle", type: "select" },
  { label: "Impeller dia — Middle (mm)", field: "dMiddle", type: "input" },
  { label: "Impeller type — Top", field: "typeTop", type: "select" },
  { label: "Impeller dia — Top (mm)", field: "dTop", type: "input" },
];

function renderScaleUp() {
  return `
    ${plateHeader("Mixing / Scale-up Comparison", "P/V · TIP SPEED · Re · TORQUE")}
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <p style="font-size:0.75rem; color:var(--muted); font-family:var(--f-sans); max-width:60%;">
        Compare plants, scales, or pilot-to-commercial side by side. Scroll right for more columns.
      </p>
      <button id="su-add-reactor" class="pill" style="background:var(--brass); color:var(--bg-deep); border-color:var(--brass);">+ Add reactor</button>
    </div>
    <div class="comparison-table-scroll">
      <table id="su-table" class="comparison-table" style="border-collapse:collapse; width:100%;"></table>
    </div>
    <p style="font-size:0.7rem; color:var(--muted-dim); font-family:var(--f-sans); margin-top:16px;">
      For scale-up, match P/V, tip speed, Re, or Torque/V (per your chosen criterion) across columns rather than expecting every row to match — no single basis holds all parameters constant simultaneously.
    </p>
  `;
}

function suThCell(text, sticky) {
  return `<th style="padding:8px 12px; text-align:left; font-family:var(--f-sans); font-weight:600; font-size:0.75rem; color:var(--muted); border-bottom:1px solid var(--grid-line); white-space:nowrap; min-width:220px; ${sticky ? "position:sticky; left:0; background:var(--panel); z-index:1;" : ""}">${text}</th>`;
}
function suTdCell(inner) {
  return `<td style="padding:8px 12px; vertical-align:top; border-bottom:1px solid var(--grid-line); min-width:160px;">${inner}</td>`;
}
function suSectionRow(text, n) {
  return `<tr><td colspan="${n + 1}" style="padding-top:16px; padding-bottom:4px;"><span style="font-size:0.7rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--brass); font-weight:600; font-family:var(--f-sans);">${text}</span></td></tr>`;
}

function suRenderStructure() {
  const n = scaleupReactors.length;
  const impellerOptions = Object.keys(IMPELLER_NP);
  let html = "<thead><tr>";
  html += suThCell("Reactor", true);
  scaleupReactors.forEach((r, i) => {
    html += `<th style="padding:8px 12px; text-align:left; border-bottom:2px solid var(--brass-dim); min-width:200px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <input data-su-label="${i}" value="${r.label}" style="padding:6px 8px; font-size:0.9rem; font-weight:700; background:transparent; color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-display); width:100%;">
        ${n > 1 ? `<button data-su-remove="${i}" style="color:var(--rust); font-size:1rem; line-height:1; background:none; border:none; cursor:pointer;">✕</button>` : ""}
      </div>
    </th>`;
  });
  html += "</tr></thead><tbody id=\"su-input-body\">";

  SCALEUP_INPUT_ROWS.forEach((row) => {
    if (row.section) {
      html += suSectionRow(row.section, n);
      return;
    }
    html += "<tr>" + suThCell(row.label, true);
    scaleupReactors.forEach((r, i) => {
      if (row.type === "select") {
        const opts = impellerOptions.map((o) => `<option value="${o}" ${o === r[row.field] ? "selected" : ""}>${o}</option>`).join("");
        html += suTdCell(`<select data-su-field="${row.field}" data-su-idx="${i}" data-su-kind="select" style="width:100%; padding:6px 8px; font-size:0.85rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">${opts}</select>`);
      } else {
        html += suTdCell(`<input type="number" data-su-field="${row.field}" data-su-idx="${i}" data-su-kind="input" value="${r[row.field]}" style="width:100%; padding:6px 8px; font-size:0.9rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">`);
      }
    });
    html += "</tr>";
  });
  html += "</tbody>";

  qs("su-table").innerHTML = html;
  const table = qs("su-table");
  const inputBody = qs("su-input-body");
  const resultsBody = document.createElement("tbody");
  resultsBody.id = "su-results-body";
  inputBody.after(resultsBody);

  table.querySelectorAll("[data-su-field]").forEach((el) => {
    const evt = el.dataset.suKind === "select" ? "change" : "input";
    el.addEventListener(evt, () => {
      const idx = parseInt(el.dataset.suIdx, 10);
      const field = el.dataset.suField;
      scaleupReactors[idx][field] = el.value;
      suRenderResults();
    });
  });
  table.querySelectorAll("[data-su-label]").forEach((el) => {
    el.addEventListener("input", () => {
      const idx = parseInt(el.dataset.suLabel, 10);
      scaleupReactors[idx].label = el.value;
    });
  });
  table.querySelectorAll("[data-su-remove]").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = parseInt(el.dataset.suRemove, 10);
      if (scaleupReactors.length > 1) {
        scaleupReactors.splice(idx, 1);
        suRenderStructure();
        suRenderResults();
      }
    });
  });
}

function suRenderResults() {
  const body = qs("su-results-body");
  if (!body) return;
  const n = scaleupReactors.length;
  const metrics = scaleupReactors.map(computeReactorMetrics);
  const resultRows = [
    ["Calculated reactor volume", (m) => `${fmt(m.calcVol)} L`],
    ["Height of RM volume (H)", (m) => `${fmt(m.H)} m`],
    ["Impeller–wall clearance", (m) => `${fmt(m.clearWall)} mm`],
    ["Inter-impeller clearance (calc.)", (m) => `${fmt(m.clearImpellers)} mm`],
    ["L/T", (m) => fmt(m.LT)],
    ["D/T (bottom / middle / top)", (m) => `${fmt(m.DTbottom)} / ${fmt(m.DTmiddle)} / ${fmt(m.DTtop)}`],
    ["%Occupancy", (m) => `${fmt(m.occupancy)} %`],
    ["Reynolds number (agitator)", (m) => `${fmt(m.Re)}<div style="color:${m.regime !== "Laminar" ? "var(--rust)" : "var(--muted)"}; font-size:0.7rem;">${m.regime}</div>`],
    ["Tip speed", (m) => `${fmt(m.tipSpeed)} m/s`],
    ["Power", (m) => `${fmt(m.Power)} W`],
    ["P/V", (m) => `${fmt(m.PV)} W/L`],
    ["Micro-mixing time", (m) => `${fmt(m.microMixTime)} s`],
    ["Shear rate (P/V basis)", (m) => `${fmt(m.shearRate)} 1/s`],
    ["Torque", (m) => `${fmt(m.torque)} Nm<div style="color:var(--muted); font-size:0.7rem;">P / (2π·N)</div>`],
    ["Torque/V", (m) => `${fmt(m.torqueV)} Nm/L`],
  ];
  let html = suSectionRow("Results", n);
  resultRows.forEach(([label, fn]) => {
    html += "<tr>" + suThCell(label, true);
    metrics.forEach((m) => {
      html += suTdCell(`<div style="color:var(--brass); font-family:var(--f-mono); font-size:0.95rem;">${fn(m)}</div>`);
    });
    html += "</tr>";
  });
  body.innerHTML = html;
  enhanceComparisonTable("su-table");
}

function initScaleUp() {
  suRenderStructure();
  suRenderResults();
  qs("su-add-reactor").addEventListener("click", () => {
    scaleupReactors.push({ label: `Reactor ${scaleupReactors.length + 1}`, ...SCALEUP_DEFAULTS });
    suRenderStructure();
    suRenderResults();
  });
}

// ---------- Corrosion Coupon Study ----------
function computeCouponMetrics(cfg) {
  const num = (v) => parseFloat(v);
  const initial = num(cfg.initialWeight), final = num(cfg.finalWeight);
  const L = num(cfg.length), W = num(cfg.width), H = num(cfg.height);
  const time = num(cfg.time);

  const weightLoss = initial - final;
  const volume = L * W * H;
  const density = initial / volume;
  const area = 2 * (L * W + W * H + H * L);
  const Rcorr = (weightLoss * 365 * 24 * 10) / 0.0254 / density / time / area;

  let rating;
  if (Rcorr < 2) rating = "Excellent";
  else if (Rcorr < 20) rating = "Good";
  else if (Rcorr < 50) rating = "Satisfactory";
  else rating = "Unsatisfactory";

  return { weightLoss, volume, density, area, Rcorr, rating };
}

const COUPON_DEFAULTS = {
  product: "M10", coupon: "SS316", temperature: "90",
  description: "Reaction mass after PTSA addition",
  initialWeight: "20.6184", finalWeight: "20.6174", time: "24",
  length: "5", width: "0.3", height: "2",
};

let couponReactors = [
  { label: "Coupon 1", ...COUPON_DEFAULTS },
  { label: "Coupon 2", ...COUPON_DEFAULTS },
];

const COUPON_INPUT_ROWS = [
  { section: "Identification" },
  { label: "Product", field: "product", type: "text" },
  { label: "Coupon material", field: "coupon", type: "text" },
  { label: "Temperature (\u00b0C)", field: "temperature", type: "text" },
  { label: "Description / conditions", field: "description", type: "text" },
  { section: "Weighing & Exposure" },
  { label: "Initial weight (g)", field: "initialWeight", type: "input" },
  { label: "Final weight (g)", field: "finalWeight", type: "input" },
  { label: "Time of exposure (hr)", field: "time", type: "input" },
  { section: "Coupon Dimensions" },
  { label: "Length (cm)", field: "length", type: "input" },
  { label: "Width (cm)", field: "width", type: "input" },
  { label: "Height (cm)", field: "height", type: "input" },
];

function renderCouponStudy() {
  return `
    ${plateHeader("Corrosion Coupon Study", "WEIGHT-LOSS METHOD, MPY")}
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <p style="font-size:0.75rem; color:var(--muted); font-family:var(--f-sans); max-width:60%;">
        Compare coupons across materials, products, or conditions side by side.
      </p>
      <button id="cp-add-coupon" class="pill" style="background:var(--brass); color:var(--bg-deep); border-color:var(--brass);">+ Add coupon</button>
    </div>
    <div class="comparison-table-scroll">
      <table id="cp-table" class="comparison-table" style="border-collapse:collapse; width:100%;"></table>
    </div>
    <p style="font-size:0.75rem; color:var(--muted-dim); font-family:var(--f-sans); margin-top:16px;">
      Basis: Excellent &lt;2 mpy · Good &lt;20 mpy · Satisfactory &lt;50 mpy · Unsatisfactory \u226550 mpy.
    </p>
  `;
}

function cpRenderStructure() {
  const n = couponReactors.length;
  let html = "<thead><tr>";
  html += suThCell("Coupon", true);
  couponReactors.forEach((r, i) => {
    html += `<th style="padding:8px 12px; text-align:left; border-bottom:2px solid var(--brass-dim); min-width:200px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <input data-cp-label="${i}" value="${r.label}" style="padding:6px 8px; font-size:0.9rem; font-weight:700; background:transparent; color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-display); width:100%;">
        ${n > 1 ? `<button data-cp-remove="${i}" style="color:var(--rust); font-size:1rem; line-height:1; background:none; border:none; cursor:pointer;">\u2715</button>` : ""}
      </div>
    </th>`;
  });
  html += "</tr></thead><tbody id=\"cp-input-body\">";

  COUPON_INPUT_ROWS.forEach((row) => {
    if (row.section) {
      html += suSectionRow(row.section, n);
      return;
    }
    html += "<tr>" + suThCell(row.label, true);
    couponReactors.forEach((r, i) => {
      if (row.type === "text") {
        html += suTdCell(`<input type="text" data-cp-field="${row.field}" data-cp-idx="${i}" value="${r[row.field]}" style="width:100%; padding:6px 8px; font-size:0.85rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-sans);">`);
      } else {
        html += suTdCell(`<input type="number" data-cp-field="${row.field}" data-cp-idx="${i}" value="${r[row.field]}" style="width:100%; padding:6px 8px; font-size:0.9rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">`);
      }
    });
    html += "</tr>";
  });
  html += "</tbody>";

  qs("cp-table").innerHTML = html;
  const table = qs("cp-table");
  const inputBody = qs("cp-input-body");
  const resultsBody = document.createElement("tbody");
  resultsBody.id = "cp-results-body";
  inputBody.after(resultsBody);

  table.querySelectorAll("[data-cp-field]").forEach((el) => {
    el.addEventListener("input", () => {
      const idx = parseInt(el.dataset.cpIdx, 10);
      const field = el.dataset.cpField;
      couponReactors[idx][field] = el.value;
      cpRenderResults();
    });
  });
  table.querySelectorAll("[data-cp-label]").forEach((el) => {
    el.addEventListener("input", () => {
      const idx = parseInt(el.dataset.cpLabel, 10);
      couponReactors[idx].label = el.value;
    });
  });
  table.querySelectorAll("[data-cp-remove]").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = parseInt(el.dataset.cpRemove, 10);
      if (couponReactors.length > 1) {
        couponReactors.splice(idx, 1);
        cpRenderStructure();
        cpRenderResults();
      }
    });
  });
}

function cpRenderResults() {
  const body = qs("cp-results-body");
  if (!body) return;
  const n = couponReactors.length;
  const metrics = couponReactors.map(computeCouponMetrics);
  const ratingColor = (r) => (r === "Excellent" ? "var(--brass)" : r === "Good" ? "var(--paper)" : "var(--rust)");
  let html = suSectionRow("Results", n);
  const rows = [
    ["Weight loss (g)", (m) => fmt(m.weightLoss)],
    ["Volume (cm\u00b3)", (m) => fmt(m.volume)],
    ["Density, back-calculated (g/cm\u00b3)", (m) => fmt(m.density)],
    ["Surface area (cm\u00b2)", (m) => fmt(m.area)],
  ];
  rows.forEach(([label, fn]) => {
    html += "<tr>" + suThCell(label, true);
    metrics.forEach((m) => {
      html += suTdCell(`<div style="color:var(--brass); font-family:var(--f-mono); font-size:0.95rem;">${fn(m)}</div>`);
    });
    html += "</tr>";
  });
  html += "<tr>" + suThCell("Corrosion rate (mills/yr)", true);
  metrics.forEach((m) => {
    html += suTdCell(`<div style="color:var(--brass); font-family:var(--f-mono); font-size:0.95rem;">${fmt(m.Rcorr)}</div><div style="color:${ratingColor(m.rating)}; font-size:0.75rem; font-weight:600;">${m.rating}</div>`);
  });
  html += "</tr>";
  body.innerHTML = html;
  enhanceComparisonTable("cp-table");
}

function initCouponStudy() {
  cpRenderStructure();
  cpRenderResults();
  qs("cp-add-coupon").addEventListener("click", () => {
    couponReactors.push({ label: `Coupon ${couponReactors.length + 1}`, ...COUPON_DEFAULTS });
    cpRenderStructure();
    cpRenderResults();
  });
}

// ---------- Filtration Evaluation ----------
function linregSlope(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((sum, x, i) => sum + (x - mx) * (ys[i] - my), 0);
  const den = xs.reduce((sum, x) => sum + (x - mx) * (x - mx), 0);
  return num / den;
}

const N_READINGS = 14;

function computeFiltrationMetrics(cfg) {
  const num = (v) => parseFloat(v);
  const area = 0.785 * Math.pow(num(cfg.buchnerDia) / 100, 2);
  const flux = (num(cfg.filtrateVol) / 1000) / (area * num(cfg.filtrationTime));
  const concentration = ((num(cfg.wetCakeWt) * num(cfg.solidsFraction)) / num(cfg.slurryVol)) * 1000;

  const readings = cfg.readings.filter((r) => r.time !== "" && r.volume !== "" && !isNaN(num(r.time)) && !isNaN(num(r.volume)));
  const F = readings.map((r) => num(r.volume) / 1e6);
  const G = readings.map((r, i) => (num(readings[i].time) * 60) / F[i]);
  const slope = readings.length >= 2 ? linregSlope(F, G) : NaN;

  const dP_pa = num(cfg.vacuum) * 133.322;
  const mu_pas = num(cfg.viscosity) * 0.001;
  const alpha = (2 * area * area * dP_pa * slope) / (mu_pas * concentration);

  const fluxClass = flux < 20 ? "Poor Filtration" : flux < 40 ? "Moderate Filtration" : "Good Filtration";
  const alphaClass = alpha < 1e8 ? "Good Filtration" : alpha < 1e9 ? "Moderate Filtration" : alpha < 1e10 ? "Slow Filtration" : "Very Slow Filtration";
  const result = cfg.evalBasis === "Cake Resistance" ? alphaClass : fluxClass;

  return { area, flux, concentration, slope, alpha, fluxClass, alphaClass, result, nReadings: readings.length };
}

function defaultReadings(withData) {
  const data = [
    [1, 30], [2, 40], [3, 60], [4, 70], [5, 100], [6, 105],
    [7, 112], [8, 117], [9, 122], [10, 126], [11, 130], [12, 135], [13, 140], [14, 143],
  ];
  return Array.from({ length: N_READINGS }).map((_, i) => (
    withData ? { time: String(data[i][0]), volume: String(data[i][1]) } : { time: "", volume: "" }
  ));
}

const FILTRATION_DEFAULTS = {
  filterCloth: "5", buchnerDia: "5", vacuum: "500",
  slurryVol: "1000", filtrateVol: "650", slurryTemp: "30",
  wetCakeWt: "230", cakeThickness: "150", viscosity: "0.3",
  filtrationTime: "20", solidsFraction: "0.2", evalBasis: "Flux",
};

let filtrationTrials = [
  { label: "Trial 1", ...FILTRATION_DEFAULTS, readings: defaultReadings(true) },
  { label: "Trial 2", ...FILTRATION_DEFAULTS, readings: defaultReadings(false) },
];

const FILTRATION_SCALAR_ROWS = [
  { label: "Filter cloth size (\u00b5m)", field: "filterCloth" },
  { label: "Buchner filter diameter (cm)", field: "buchnerDia" },
  { label: "Applied vacuum (mmHg)", field: "vacuum" },
  { label: "Volume of slurry (mL)", field: "slurryVol" },
  { label: "Filtrate volume (mL)", field: "filtrateVol" },
  { label: "Slurry temperature (\u00b0C)", field: "slurryTemp" },
  { label: "Weight of wet cake (g)", field: "wetCakeWt" },
  { label: "Cake thickness/height (mm)", field: "cakeThickness" },
  { label: "Slurry viscosity (cP)", field: "viscosity" },
  { label: "Filtration time (min)", field: "filtrationTime" },
  { label: "Assumed dry-solids fraction of wet cake", field: "solidsFraction" },
];

function renderFiltrationEvaluation() {
  return `
    ${plateHeader("Filtration Evaluation", "B\u00dcCHNER TRIAL, t/V vs V")}
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <p style="font-size:0.75rem; color:var(--muted); font-family:var(--f-sans); max-width:60%;">
        Compare filtration trials \u2014 different slurries, products, or conditions \u2014 side by side.
      </p>
      <button id="ft-add-trial" class="pill" style="background:var(--brass); color:var(--bg-deep); border-color:var(--brass);">+ Add trial</button>
    </div>
    <div class="comparison-table-scroll">
      <table id="ft-table" class="comparison-table" style="border-collapse:collapse; width:100%;"></table>
    </div>
    <p style="font-size:0.75rem; color:var(--muted-dim); font-family:var(--f-sans); margin-top:16px;">
      Specific cake resistance uses the actual t/V vs V regression slope. Flux basis: Poor &lt;20, Moderate &lt;40, Good \u226540 L/m\u00b2.min. Cake-resistance basis: Good &lt;1e8, Moderate &lt;1e9, Slow &lt;1e10, Very Slow \u22651e10 m/kg.
    </p>
  `;
}

function ftRenderStructure() {
  const n = filtrationTrials.length;
  let html = "<thead><tr>";
  html += suThCell("Trial", true);
  filtrationTrials.forEach((r, i) => {
    html += `<th style="padding:8px 12px; text-align:left; border-bottom:2px solid var(--brass-dim); min-width:200px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <input data-ft-label="${i}" value="${r.label}" style="padding:6px 8px; font-size:0.9rem; font-weight:700; background:transparent; color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-display); width:100%;">
        ${n > 1 ? `<button data-ft-remove="${i}" style="color:var(--rust); font-size:1rem; line-height:1; background:none; border:none; cursor:pointer;">\u2715</button>` : ""}
      </div>
    </th>`;
  });
  html += "</tr></thead><tbody id=\"ft-input-body\">";

  html += suSectionRow("Filter, Slurry & Cake", n);
  FILTRATION_SCALAR_ROWS.forEach((row) => {
    html += "<tr>" + suThCell(row.label, true);
    filtrationTrials.forEach((r, i) => {
      html += suTdCell(`<input type="number" data-ft-field="${row.field}" data-ft-idx="${i}" value="${r[row.field]}" style="width:100%; padding:6px 8px; font-size:0.9rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">`);
    });
    html += "</tr>";
  });
  html += "<tr>" + suThCell("Evaluation basis", true);
  filtrationTrials.forEach((r, i) => {
    const opts = ["Flux", "Cake Resistance"].map((o) => `<option value="${o}" ${o === r.evalBasis ? "selected" : ""}>${o}</option>`).join("");
    html += suTdCell(`<select data-ft-field="evalBasis" data-ft-idx="${i}" style="width:100%; padding:6px 8px; font-size:0.85rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">${opts}</select>`);
  });
  html += "</tr>";

  html += suSectionRow("Time vs Filtrate Volume (5+ readings recommended)", n);
  for (let rIdx = 0; rIdx < N_READINGS; rIdx++) {
    html += "<tr>" + suThCell(`Reading ${rIdx + 1} \u2014 min / mL`, true);
    filtrationTrials.forEach((r, i) => {
      html += suTdCell(`<div style="display:flex; gap:4px;">
        <input type="number" data-ft-reading="${rIdx}" data-ft-key="time" data-ft-idx="${i}" value="${r.readings[rIdx].time}" placeholder="min" style="width:50%; padding:6px 8px; font-size:0.85rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">
        <input type="number" data-ft-reading="${rIdx}" data-ft-key="volume" data-ft-idx="${i}" value="${r.readings[rIdx].volume}" placeholder="mL" style="width:50%; padding:6px 8px; font-size:0.85rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">
      </div>`);
    });
    html += "</tr>";
  }
  html += "</tbody>";

  qs("ft-table").innerHTML = html;
  const table = qs("ft-table");
  const inputBody = qs("ft-input-body");
  const resultsBody = document.createElement("tbody");
  resultsBody.id = "ft-results-body";
  inputBody.after(resultsBody);

  table.querySelectorAll("[data-ft-field]").forEach((el) => {
    const isSelect = el.tagName === "SELECT";
    el.addEventListener(isSelect ? "change" : "input", () => {
      const idx = parseInt(el.dataset.ftIdx, 10);
      filtrationTrials[idx][el.dataset.ftField] = el.value;
      ftRenderResults();
    });
  });
  table.querySelectorAll("[data-ft-reading]").forEach((el) => {
    el.addEventListener("input", () => {
      const idx = parseInt(el.dataset.ftIdx, 10);
      const rIdx = parseInt(el.dataset.ftReading, 10);
      const key = el.dataset.ftKey;
      filtrationTrials[idx].readings[rIdx][key] = el.value;
      ftRenderResults();
    });
  });
  table.querySelectorAll("[data-ft-label]").forEach((el) => {
    el.addEventListener("input", () => {
      const idx = parseInt(el.dataset.ftLabel, 10);
      filtrationTrials[idx].label = el.value;
    });
  });
  table.querySelectorAll("[data-ft-remove]").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = parseInt(el.dataset.ftRemove, 10);
      if (filtrationTrials.length > 1) {
        filtrationTrials.splice(idx, 1);
        ftRenderStructure();
        ftRenderResults();
      }
    });
  });
}

function ftRenderResults() {
  const body = qs("ft-results-body");
  if (!body) return;
  const n = filtrationTrials.length;
  const metrics = filtrationTrials.map(computeFiltrationMetrics);
  const resultColor = (r) => (r.includes("Good") ? "var(--brass)" : r.includes("Moderate") ? "var(--paper)" : "var(--rust)");
  let html = suSectionRow("Results", n);
  const rows = [
    ["Filtration area (m\u00b2)", (m) => fmt(m.area)],
    ["Permeation flux (L/m\u00b2.min)", (m) => `${fmt(m.flux)}<div style="color:var(--muted); font-size:0.7rem;">${m.fluxClass}</div>`],
    ["Concentration (kg/m\u00b3)", (m) => fmt(m.concentration)],
    ["Regression slope (readings used)", (m) => `<span style="color:${m.nReadings < 5 ? "var(--rust)" : "var(--brass)"}">${fmt(m.slope)}</span><div style="color:var(--muted); font-size:0.7rem;">${m.nReadings} readings</div>`],
    ["Specific cake resistance (m/kg)", (m) => `${fmt(m.alpha)}<div style="color:var(--muted); font-size:0.7rem;">${m.alphaClass}</div>`],
  ];
  rows.forEach(([label, fn]) => {
    html += "<tr>" + suThCell(label, true);
    metrics.forEach((m) => {
      html += suTdCell(`<div style="color:var(--brass); font-family:var(--f-mono); font-size:0.95rem;">${fn(m)}</div>`);
    });
    html += "</tr>";
  });
  html += "<tr>" + suThCell("Result", true);
  metrics.forEach((m) => {
    html += suTdCell(`<div style="color:${resultColor(m.result)}; font-family:var(--f-mono); font-size:1rem; font-weight:600;">${m.result}</div>`);
  });
  html += "</tr>";
  body.innerHTML = html;
  enhanceComparisonTable("ft-table");
}

function initFiltrationEvaluation() {
  ftRenderStructure();
  ftRenderResults();
  qs("ft-add-trial").addEventListener("click", () => {
    filtrationTrials.push({ label: `Trial ${filtrationTrials.length + 1}`, ...FILTRATION_DEFAULTS, readings: defaultReadings(false) });
    ftRenderStructure();
    ftRenderResults();
  });
}

// ---------- Centrifuge Cake Weight ----------
function computeCentrifugeMetrics(cfg) {
  const num = (v) => parseFloat(v);
  const Db = num(cfg.basketDia);
  const t = num(cfg.cakeThickness);
  const H = num(cfg.height);
  const BD = num(cfg.bulkDensity);
  const RPM = num(cfg.rpm);

  const Da = Db - (2 * t) / 1000;
  const Aa = (22 / 28) * (Db * Db - Da * Da);
  const V = H * Aa;
  const W = V * BD;

  const R_mm = (Db * 1000) / 2;
  const gForce = 1.12 * R_mm * Math.pow(RPM / 1000, 2);

  return { Da, Aa, V, W, R_mm, gForce };
}

const CENTRIFUGE_DEFAULTS = {
  basketDia: "1.5", lipDia: "250", cakeThickness: "160", height: "0.6", bulkDensity: "600", rpm: "800",
};

let centrifugeCases = [
  { label: "60\" \u2014 After Filtration", ...CENTRIFUGE_DEFAULTS },
  { label: "60\" \u2014 After Washing", ...CENTRIFUGE_DEFAULTS },
];

const CENTRIFUGE_INPUT_ROWS = [
  { label: "Basket diameter, Db (m)", field: "basketDia" },
  { label: "Lip diameter, Dl (mm)", field: "lipDia" },
  { label: "Maximum cake thickness, t (mm)", field: "cakeThickness" },
  { label: "Height, H (m)", field: "height" },
  { label: "Bulk density of cake, BD (kg/m\u00b3)", field: "bulkDensity" },
  { label: "RPM of centrifuge", field: "rpm" },
];

function renderCentrifuge() {
  return `
    ${plateHeader("Centrifuge Cake Weight & G-Force", "BASKET CENTRIFUGE SIZING")}
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <p style="font-size:0.75rem; color:var(--muted); font-family:var(--f-sans); max-width:60%;">
        Compare centrifuge sizes, baskets, or filtration/washing scenarios side by side.
      </p>
      <button id="cf-add-case" class="pill" style="background:var(--brass); color:var(--bg-deep); border-color:var(--brass);">+ Add case</button>
    </div>
    <div class="comparison-table-scroll">
      <table id="cf-table" class="comparison-table" style="border-collapse:collapse; width:100%;"></table>
    </div>
    <p style="font-size:0.75rem; color:var(--muted-dim); font-family:var(--f-sans); margin-top:16px;">
      Bulk density (BD) is an entered value from your own cake-weight trial, not back-calculated. Lip diameter is recorded for reference; it doesn't enter the volume calculation. G-Force = 1.12 \u00d7 R(mm) \u00d7 (RPM/1000)\u00b2.
    </p>
  `;
}

function cfRenderStructure() {
  const n = centrifugeCases.length;
  let html = "<thead><tr>";
  html += suThCell("Case", true);
  centrifugeCases.forEach((r, i) => {
    html += `<th style="padding:8px 12px; text-align:left; border-bottom:2px solid var(--brass-dim); min-width:200px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <input data-cf-label="${i}" value="${r.label}" style="padding:6px 8px; font-size:0.9rem; font-weight:700; background:transparent; color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-display); width:100%;">
        ${n > 1 ? `<button data-cf-remove="${i}" style="color:var(--rust); font-size:1rem; line-height:1; background:none; border:none; cursor:pointer;">\u2715</button>` : ""}
      </div>
    </th>`;
  });
  html += "</tr></thead><tbody id=\"cf-input-body\">";

  html += suSectionRow("Inputs", n);
  CENTRIFUGE_INPUT_ROWS.forEach((row) => {
    html += "<tr>" + suThCell(row.label, true);
    centrifugeCases.forEach((r, i) => {
      html += suTdCell(`<input type="number" data-cf-field="${row.field}" data-cf-idx="${i}" value="${r[row.field]}" style="width:100%; padding:6px 8px; font-size:0.9rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">`);
    });
    html += "</tr>";
  });
  html += "</tbody>";

  qs("cf-table").innerHTML = html;
  const table = qs("cf-table");
  const inputBody = qs("cf-input-body");
  const resultsBody = document.createElement("tbody");
  resultsBody.id = "cf-results-body";
  inputBody.after(resultsBody);

  table.querySelectorAll("[data-cf-field]").forEach((el) => {
    el.addEventListener("input", () => {
      const idx = parseInt(el.dataset.cfIdx, 10);
      centrifugeCases[idx][el.dataset.cfField] = el.value;
      cfRenderResults();
    });
  });
  table.querySelectorAll("[data-cf-label]").forEach((el) => {
    el.addEventListener("input", () => {
      const idx = parseInt(el.dataset.cfLabel, 10);
      centrifugeCases[idx].label = el.value;
    });
  });
  table.querySelectorAll("[data-cf-remove]").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = parseInt(el.dataset.cfRemove, 10);
      if (centrifugeCases.length > 1) {
        centrifugeCases.splice(idx, 1);
        cfRenderStructure();
        cfRenderResults();
      }
    });
  });
}

function cfRenderResults() {
  const body = qs("cf-results-body");
  if (!body) return;
  const n = centrifugeCases.length;
  const metrics = centrifugeCases.map(computeCentrifugeMetrics);
  let html = suSectionRow("Results", n);
  const rows = [
    ["Annular diameter, Da (m)", (m) => fmt(m.Da)],
    ["Annular area, Aa (m\u00b2)", (m) => fmt(m.Aa)],
    ["Volume, V (m\u00b3)", (m) => fmt(m.V)],
    ["Max. cake weight / lot, W (kg)", (m) => fmt(m.W)],
    ["Radius of centrifuge (mm)", (m) => fmt(m.R_mm)],
    ["G-Force", (m) => `${fmt(m.gForce)} G`],
  ];
  rows.forEach(([label, fn]) => {
    html += "<tr>" + suThCell(label, true);
    metrics.forEach((m) => {
      html += suTdCell(`<div style="color:var(--brass); font-family:var(--f-mono); font-size:0.95rem;">${fn(m)}</div>`);
    });
    html += "</tr>";
  });
  body.innerHTML = html;
  enhanceComparisonTable("cf-table");
}

function initCentrifuge() {
  cfRenderStructure();
  cfRenderResults();
  qs("cf-add-case").addEventListener("click", () => {
    centrifugeCases.push({ label: `Case ${centrifugeCases.length + 1}`, ...CENTRIFUGE_DEFAULTS });
    cfRenderStructure();
    cfRenderResults();
  });
}

// ---------- Pump Power Rating ----------
function computePumpMetrics(cfg) {
  const num = (v) => parseFloat(v);
  const density = num(cfg.density);
  const Q = num(cfg.flowRate);
  const head = num(cfg.head);
  const g = 9.81;
  const etaPump = num(cfg.etaPump);
  const etaMotor = num(cfg.etaMotor);

  const dP = density * g * head;
  const theoreticalKw = (Q * dP) / 3600 / 1000;
  const shaftKw = theoreticalKw / etaPump;
  const motorKw = shaftKw / etaMotor;
  const motorHp = motorKw * 1.34102;

  return { density, dP, theoreticalKw, shaftKw, motorKw, motorHp };
}

const PUMP_DEFAULTS = { solvent: "Water", density: "1000", flowRate: "8", head: "60", etaPump: "0.7", etaMotor: "0.9" };

let pumpCases = [
  { label: "Pump 1", ...PUMP_DEFAULTS },
  { label: "Pump 2", ...PUMP_DEFAULTS },
];

function renderPumpPower() {
  return `
    ${plateHeader("Pump Power Rating", "Q \u00b7 \u0394P \u00b7 \u03b7(pump) \u00b7 \u03b7(motor)")}
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <p style="font-size:0.75rem; color:var(--muted); font-family:var(--f-sans); max-width:60%;">
        Compare pump/motor sizing across services or duty points side by side.
      </p>
      <button id="pp-add-pump" class="pill" style="background:var(--brass); color:var(--bg-deep); border-color:var(--brass);">+ Add pump</button>
    </div>
    <div class="comparison-table-scroll">
      <table id="pp-table" class="comparison-table" style="border-collapse:collapse; width:100%;"></table>
    </div>
  `;
}

function ppRenderStructure() {
  const n = pumpCases.length;
  const solventOptions = SOLVENT_NAMES;
  let html = "<thead><tr>";
  html += suThCell("Pump", true);
  pumpCases.forEach((r, i) => {
    html += `<th style="padding:8px 12px; text-align:left; border-bottom:2px solid var(--brass-dim); min-width:200px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <input data-pp-label="${i}" value="${r.label}" style="padding:6px 8px; font-size:0.9rem; font-weight:700; background:transparent; color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-display); width:100%;">
        ${n > 1 ? `<button data-pp-remove="${i}" style="color:var(--rust); font-size:1rem; line-height:1; background:none; border:none; cursor:pointer;">\u2715</button>` : ""}
      </div>
    </th>`;
  });
  html += "</tr></thead><tbody id=\"pp-input-body\">";

  html += suSectionRow("Inputs", n);
  html += "<tr>" + suThCell("Solvent", true);
  pumpCases.forEach((r, i) => {
    html += suTdCell(`<div class="solvent-picker">
      <input type="text" autocomplete="off" data-pp-field="solvent" data-pp-idx="${i}" data-pp-solvent-input value="${r.solvent}" placeholder="Search solvent" style="width:100%; padding:6px 8px; font-size:0.85rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">
      <div class="solvent-options" data-pp-solvent-options="${i}"></div>
    </div>`);
  });
  html += "</tr>";
  html += "<tr>" + suThCell("Density (kg/m\u00b3)", true);
  pumpCases.forEach((r, i) => {
    html += suTdCell(`<input type="number" data-pp-field="density" data-pp-idx="${i}" value="${r.density}" style="width:100%; padding:6px 8px; font-size:0.9rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">`);
  });
  html += "</tr>";
  [["Flow rate, Q (m\u00b3/hr)", "flowRate"], ["Head (m)", "head"], ["\u03b7 pump (from pump curve)", "etaPump"], ["\u03b7 motor (from manufacturer)", "etaMotor"]].forEach(([label, field]) => {
    html += "<tr>" + suThCell(label, true);
    pumpCases.forEach((r, i) => {
      html += suTdCell(`<input type="number" data-pp-field="${field}" data-pp-idx="${i}" value="${r[field]}" style="width:100%; padding:6px 8px; font-size:0.9rem; background:var(--bg-deep); color:var(--paper); border:1px solid var(--grid-line); font-family:var(--f-mono);">`);
    });
    html += "</tr>";
  });
  html += "</tbody>";

  qs("pp-table").innerHTML = html;
  const table = qs("pp-table");
  const inputBody = qs("pp-input-body");
  const resultsBody = document.createElement("tbody");
  resultsBody.id = "pp-results-body";
  inputBody.after(resultsBody);

  table.querySelectorAll("[data-pp-field]").forEach((el) => {
    const isSelect = el.tagName === "SELECT";
    el.addEventListener(isSelect ? "change" : "input", () => {
      const idx = parseInt(el.dataset.ppIdx, 10);
      const field = el.dataset.ppField;
      if (field === "solvent") return;
      pumpCases[idx][field] = el.value;
      ppRenderResults();
    });
  });
  // Custom solvent autocomplete: same pattern used by the Solvent Recovery module.
  // Avoids the browser-native keyboard/autocomplete overlay on mobile and reuses SOLVENT_DB.
  const ppRenderSolventOptions = (input, forceOpen = true) => {
    const idx = parseInt(input.dataset.ppIdx, 10);
    const box = table.querySelector(`[data-pp-solvent-options="${idx}"]`);
    if (!box) return;
    const q = input.value.trim().toLowerCase();
    const matches = SOLVENT_NAMES.filter((name) => name.toLowerCase().includes(q)).slice(0, 16);
    box.innerHTML = matches.length
      ? matches.map((name) => `<div class="solvent-option" data-solvent-value="${name.replace(/"/g, '&quot;')}">${name}</div>`).join("")
      : `<div class="solvent-no-match">No matching solvent</div>`;
    box.classList.toggle("open", forceOpen);
  };

  table.querySelectorAll("[data-pp-solvent-input]").forEach((input) => {
    input.addEventListener("focus", () => ppRenderSolventOptions(input));
    input.addEventListener("input", () => ppRenderSolventOptions(input));
    input.addEventListener("blur", () => {
      setTimeout(() => {
        const idx = parseInt(input.dataset.ppIdx, 10);
        table.querySelector(`[data-pp-solvent-options="${idx}"]`)?.classList.remove("open");
      }, 180);
    });
  });

  table.querySelectorAll("[data-pp-solvent-options]").forEach((box) => {
    box.addEventListener("mousedown", (e) => {
      const option = e.target.closest("[data-solvent-value]");
      if (!option) return;
      e.preventDefault();
      const idx = parseInt(box.dataset.ppSolventOptions, 10);
      const input = table.querySelector(`[data-pp-solvent-input][data-pp-idx="${idx}"]`);
      const value = option.dataset.solventValue;
      if (!input || !SOLVENT_DB[value]) return;
      const d = SOLVENT_DB[value];
      pumpCases[idx].solvent = value;
      if ("density" in pumpCases[idx]) pumpCases[idx].density = d.density != null ? String(d.density) : "";
      ppRenderStructure();
      ppRenderResults();
    });
  });
  table.querySelectorAll("[data-pp-label]").forEach((el) => {
    el.addEventListener("input", () => {
      const idx = parseInt(el.dataset.ppLabel, 10);
      pumpCases[idx].label = el.value;
    });
  });
  table.querySelectorAll("[data-pp-remove]").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = parseInt(el.dataset.ppRemove, 10);
      if (pumpCases.length > 1) {
        pumpCases.splice(idx, 1);
        ppRenderStructure();
        ppRenderResults();
      }
    });
  });
}

function ppRenderResults() {
  const body = qs("pp-results-body");
  if (!body) return;
  const n = pumpCases.length;
  const metrics = pumpCases.map(computePumpMetrics);
  let html = suSectionRow("Results", n);
  const rows = [
    ["\u0394P = \u03c1gh (Pa)", (m) => fmt(m.dP)],
    ["Theoretical power (kW)", (m) => fmt(m.theoreticalKw)],
    ["Pump shaft power (kW)", (m) => fmt(m.shaftKw)],
    ["Motor power requirement", (m) => `${fmt(m.motorKw)} kW<div style="color:var(--muted); font-size:0.7rem;">${fmt(m.motorHp)} hp</div>`],
  ];
  rows.forEach(([label, fn]) => {
    html += "<tr>" + suThCell(label, true);
    metrics.forEach((m) => {
      html += suTdCell(`<div style="color:var(--brass); font-family:var(--f-mono); font-size:0.95rem;">${fn(m)}</div>`);
    });
    html += "</tr>";
  });
  body.innerHTML = html;
  enhanceComparisonTable("pp-table");
}

function initPumpPower() {
  ppRenderStructure();
  ppRenderResults();
  qs("pp-add-pump").addEventListener("click", () => {
    pumpCases.push({ label: `Pump ${pumpCases.length + 1}`, ...PUMP_DEFAULTS });
    ppRenderStructure();
    ppRenderResults();
  });
}

// ---------- Chemical-Material Compatibility ----------
function renderMaterialsCompat() {
  return `
    ${plateHeader("Chemical\u2013Material Compatibility", "REFERENCE STARTING POINT \u2014 VERIFY BEFORE MOC")}
    <div style="margin-bottom:16px;">
      ${selectHTML("mc-chem", "Chemical / Process Fluid", CHEM_COMPAT_NAMES, CHEM_COMPAT_NAMES[0])}
    </div>
    <div class="comparison-table-scroll">
      <table id="mc-table" style="border-collapse:collapse; width:100%;"></table>
    </div>
    <p style="font-size:0.75rem; color:var(--muted-dim); font-family:var(--f-sans); margin-top:16px;">
      Ratings are a compiled starting reference, not a substitute for a vendor datasheet or in-house trial \u2014 always confirm against your actual concentration, temperature, and duty before finalizing MOC. Chloride-bearing streams need a separate pitting/SCC review even where stainless is rated Good.
    </p>
  `;
}

function mcRatingColor(code) {
  return code === "E" ? "var(--brass)" : code === "G" ? "var(--paper)" : code === "F" ? "var(--muted)" : "var(--rust)";
}

function mcRenderTable(chemName) {
  const table = qs("mc-table");
  if (!table) return;
  const codes = CHEM_COMPAT[chemName] || [];
  let html = "<thead><tr>" + suThCell("Material", true) + suThCell("Rating", false) + "</tr></thead><tbody>";
  MATERIALS.forEach((mat, i) => {
    const code = codes[i] || "N";
    const label = RATING_MAP[code] || "No Data";
    html += "<tr>" + suThCell(mat, true) + suTdCell(`<div style="color:${mcRatingColor(code)}; font-weight:600; font-size:0.9rem;">${label}</div>`) + "</tr>";
  });
  html += "</tbody>";
  table.innerHTML = html;
}

function initMaterialsCompat() {
  mcRenderTable(qs("mc-chem").value);
  qs("mc-chem").addEventListener("change", (e) => mcRenderTable(e.target.value));
}

// ---------- Batch Operator Troubleshooter (interactive valve game) ----------
// BT_SCENARIOS now lives in troubleshooter-scenarios.js (loaded before this file wherever needed)

const BT_MAX_ROUNDS = 6;
let btState = { order: [], idx: 0, score: 0, incidents: 0, cleanRounds: 0, efficientRounds: 0, bestStreak: 0, streak: 0 };
let btRound = { a: 0, b: 0, clicks: 0, sawDangerous: false, solved: false };

function btShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function btEnsureStyle() {
  if (qs("bt-style")) return;
  const style = document.createElement("style");
  style.id = "bt-style";
  style.textContent = `
    @keyframes btFlash { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
    .bt-alarm { animation: btFlash 0.9s infinite; background: linear-gradient(90deg, #3a1414, #4a1717); border: 1px solid #7a2222; color: #ffb3ac; padding: 12px 16px; font-family: var(--f-mono); font-size: 0.8rem; letter-spacing: 0.05em; margin-bottom: 14px; }
    .bt-ctrl { cursor: pointer; }
    .bt-ctrl:hover .bt-ctrl-panel { stroke: var(--brass); }
    .bt-streak { display: inline-block; padding: 3px 10px; border-radius: 12px; background: var(--panel-raised); border: 1px solid var(--brass-dim); color: var(--brass); font-family: var(--f-mono); font-size: 0.7rem; margin-left: 8px; }
    .bt-badge-chip { display: inline-block; padding: 6px 14px; margin: 4px; border-radius: 16px; background: var(--panel-raised); border: 1px solid var(--brass); color: var(--brass); font-family: var(--f-mono); font-size: 0.75rem; }
  `;
  document.head.appendChild(style);
}

function btOperatorSVG(x, y) {
  return `<g transform="translate(${x},${y})">
    <circle cx="0" cy="-18" r="7" style="fill:var(--muted);"/>
    <path d="M -9 10 Q -9 -8 0 -8 Q 9 -8 9 10 Z" style="fill:var(--muted-dim);"/>
  </g>`;
}

function btControlSVG(id, x, y, ctrl, stateIdx) {
  const on = stateIdx === 1;
  const leverX = on ? 14 : -14;
  return `<g class="bt-ctrl" id="${id}" transform="translate(${x},${y})">
    <rect class="bt-ctrl-panel" x="-30" y="-22" width="60" height="44" rx="6" style="fill:var(--panel-raised); stroke:var(--grid-line); stroke-width:1.5;"/>
    <line x1="-16" y1="0" x2="16" y2="0" style="stroke:var(--muted-dim); stroke-width:3;"/>
    <circle cx="${leverX}" cy="0" r="9" style="fill:${on ? "var(--brass)" : "var(--rust)"};"/>
    <text x="0" y="-30" text-anchor="middle" style="font-family:var(--f-sans); font-size:9px; letter-spacing:0.05em; fill:var(--muted); text-transform:uppercase;">${ctrl.label}</text>
    <text x="0" y="36" text-anchor="middle" style="font-family:var(--f-mono); font-size:10px; font-weight:600; fill:${on ? "var(--brass)" : "var(--rust)"};">${ctrl.states[stateIdx]}</text>
  </g>`;
}

function btDiagramSVG(sc, a, b, vesselTone) {
  const vesselFill = vesselTone === "good" ? "rgba(63,182,121,0.18)" : vesselTone === "bad" ? "rgba(224,82,74,0.16)" : "rgba(201,162,39,0.12)";
  const vesselStroke = vesselTone === "good" ? "var(--brass)" : vesselTone === "bad" ? "var(--rust)" : "var(--brass-dim)";
  return `<svg viewBox="0 0 480 220" style="width:100%; max-width:480px; display:block; margin:0 auto;">
    ${btOperatorSVG(75, 165)}
    ${btOperatorSVG(405, 165)}
    <line x1="90" y1="110" x2="150" y2="110" style="stroke:var(--grid-line); stroke-width:4;"/>
    <line x1="330" y1="110" x2="390" y2="110" style="stroke:var(--grid-line); stroke-width:4;"/>
    ${btControlSVG("bt-ctrlA", 75, 110, sc.ctrlA, a)}
    ${btControlSVG("bt-ctrlB", 405, 110, sc.ctrlB, b)}
    <rect x="150" y="55" width="180" height="120" rx="16" style="fill:${vesselFill}; stroke:${vesselStroke}; stroke-width:2; transition:fill 0.3s, stroke 0.3s;"/>
    <line x1="240" y1="55" x2="240" y2="35" style="stroke:var(--muted-dim); stroke-width:3;"/>
    <circle cx="240" cy="30" r="6" style="fill:var(--muted-dim);"/>
    <text x="240" y="20" text-anchor="middle" style="font-family:var(--f-display); font-weight:800; font-size:13px; fill:var(--paper);">${sc.reactorLabel}</text>
    <text x="240" y="120" text-anchor="middle" id="bt-vessel-val" style="font-family:var(--f-mono); font-size:22px; font-weight:700; fill:${vesselTone === "good" ? "var(--brass)" : vesselTone === "bad" ? "var(--rust)" : "var(--paper)"};"></text>
    <text x="240" y="140" text-anchor="middle" id="bt-vessel-lbl" style="font-family:var(--f-sans); font-size:9px; letter-spacing:0.06em; fill:var(--muted); text-transform:uppercase;"></text>
  </svg>`;
}

function btComputeTone(sc, a, b) {
  const cell = sc.table[String(a) + String(b)];
  const [lo, hi] = sc.metric.band;
  if (sc.success(a, b)) return "good";
  return cell.dangerous ? "bad" : "amber";
}

function btShowStart() {
  btEnsureStyle();
  const root = qs("bt-root");
  if (!root) return;
  root.innerHTML = `
    <p style="font-family:var(--f-sans); color:var(--muted); font-size:0.85rem; line-height:1.6;">
      You're running a batch/semi-batch reactor suite. Each round drops a live upset on the panel \u2014 no diagnosis given.
      Click the control stations either side of the vessel to change valve and equipment states until the reading settles into the green band.
    </p>
    <button class="pill active" id="bt-start-btn" style="margin-top:8px;">Start Shift</button>
  `;
  qs("bt-start-btn").addEventListener("click", btStartShift);
}

function btStartShift() {
  btState = { order: btShuffle(BT_SCENARIOS.map((_, i) => i)).slice(0, BT_MAX_ROUNDS), idx: 0, score: 0, incidents: 0, cleanRounds: 0, efficientRounds: 0, bestStreak: 0, streak: 0 };
  btShowAlarm();
}

function btShowAlarm() {
  const root = qs("bt-root");
  const sc = BT_SCENARIOS[btState.order[btState.idx]];
  root.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
      <span style="font-family:var(--f-sans); font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted);">Round ${btState.idx + 1} of ${btState.order.length}</span>
      <span style="font-family:var(--f-sans); font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted);">Score ${btState.score}${btState.streak >= 2 ? `<span class="bt-streak">\u{1F525} x${btState.streak}</span>` : ""}</span>
    </div>
    <div class="bt-alarm">\u26A0 ALARM \u2014 ${sc.tag} \u2014 ${sc.title.toUpperCase()}</div>
    <button class="pill active" id="bt-ack-btn">Go to Panel</button>
  `;
  qs("bt-ack-btn").addEventListener("click", btShowScenario);
}

function btShowScenario() {
  const root = qs("bt-root");
  const sc = BT_SCENARIOS[btState.order[btState.idx]];
  btRound = { a: 0, b: 0, clicks: 0, sawDangerous: sc.table["00"].dangerous, solved: false };
  root.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
      <span style="font-family:var(--f-sans); font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted);">Round ${btState.idx + 1} of ${btState.order.length}</span>
      <span style="font-family:var(--f-sans); font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted);">Score ${btState.score}${btState.streak >= 2 ? `<span class="bt-streak">\u{1F525} x${btState.streak}</span>` : ""}</span>
    </div>
    <h3 style="font-family:var(--f-display); font-weight:800; font-size:1.15rem; margin:4px 0 8px;">${sc.title}</h3>
    ${btBatchSheetHTML(sc.recipe)}
    <p style="font-family:var(--f-sans); font-size:0.83rem; line-height:1.55; border-left:2px solid var(--brass-dim); padding-left:12px; margin:12px 0;">${sc.narrative}</p>
    <div id="bt-diagram" style="margin:16px 0;"></div>
    <div id="bt-outcome"></div>
  `;
  btRenderDiagram(sc);
}

function btBatchSheetHTML(recipe) {
  return `<div class="grid cols-3" style="margin-bottom:6px;">
    ${[["Product", recipe.product], ["Batch Size", recipe.batch], ["Reactor", recipe.reactor], ["Step", recipe.step], ["Target", recipe.target]]
      .map(([k, v]) => `<label class="field"><span class="lbl">${k}</span><div class="field-row"><span class="unit" style="width:100%; text-align:left; border:1px solid var(--grid-line);">${v}</span></div></label>`)
      .join("")}
  </div>`;
}

function btRenderDiagram(sc) {
  const tone = btComputeTone(sc, btRound.a, btRound.b);
  const dwrap = qs("bt-diagram");
  dwrap.innerHTML = btDiagramSVG(sc, btRound.a, btRound.b, tone);
  const cell = sc.table[String(btRound.a) + String(btRound.b)];
  qs("bt-vessel-val").textContent = cell.v + sc.metric.unit;
  qs("bt-vessel-lbl").textContent = sc.metric.label;
  qs("bt-ctrlA").addEventListener("click", () => btToggle(sc, "a"));
  qs("bt-ctrlB").addEventListener("click", () => btToggle(sc, "b"));

  if (tone === "good" && !btRound.solved) {
    btRound.solved = true;
    btResolveRound(sc);
  }
}

function btToggle(sc, which) {
  if (btRound.solved) return;
  btRound.clicks += 1;
  if (which === "a") btRound.a = btRound.a === 0 ? 1 : 0;
  else btRound.b = btRound.b === 0 ? 1 : 0;
  const cell = sc.table[String(btRound.a) + String(btRound.b)];
  if (cell.dangerous) btRound.sawDangerous = true;
  btRenderDiagram(sc);
}

function btResolveRound(sc) {
  let pts = 100;
  if (btRound.clicks > 2) pts -= (btRound.clicks - 2) * 15;
  if (btRound.sawDangerous) { pts -= 25; btState.incidents += 1; }
  pts = Math.max(10, pts);
  btState.score += pts;

  if (!btRound.sawDangerous) btState.cleanRounds += 1;
  if (btRound.clicks <= 2) { btState.efficientRounds += 1; btState.streak += 1; btState.bestStreak = Math.max(btState.bestStreak, btState.streak); }
  else btState.streak = 0;

  const out = qs("bt-outcome");
  out.innerHTML = `
    <div class="readout" style="margin-top:12px; text-align:left;">
      <span class="lbl" style="color:var(--brass);">STABILIZED &nbsp;(+${pts} pts)</span>
      <span class="sub" style="display:block; font-size:0.8rem; margin-top:6px; color:var(--paper); text-transform:none; letter-spacing:normal;">
        Settled in ${btRound.clicks} click${btRound.clicks === 1 ? "" : "s"}${btRound.sawDangerous ? " \u2014 but you passed through a dangerous configuration along the way." : "."}
      </span>
    </div>
    <button class="pill active" id="bt-continue-btn" style="margin-top:12px;">${btState.idx + 1 >= btState.order.length ? "See Shift Summary" : "Next Alarm"}</button>
  `;
  qs("bt-continue-btn").addEventListener("click", () => {
    btState.idx += 1;
    if (btState.idx >= btState.order.length) btShowSummary();
    else btShowAlarm();
  });
}

function btLevelForScore(score) {
  if (score >= 500) return "Shift-in-Charge";
  if (score >= 350) return "Senior Operator";
  if (score >= 200) return "Field Operator";
  return "Trainee Operator";
}

function btBadges() {
  const badges = [];
  if (btState.incidents === 0) badges.push("\u2728 Clean Shift");
  if (btState.efficientRounds === btState.order.length) badges.push("\u{1F3AF} Minimum Moves");
  if (btState.bestStreak >= 3) badges.push("\u{1F525} Streak Master");
  if (btState.cleanRounds === btState.order.length) badges.push("\u{1F6E1}\uFE0F No Near Misses");
  return badges;
}

function btShowSummary() {
  const root = qs("bt-root");
  const badge = btLevelForScore(btState.score);
  const badges = btBadges();
  root.innerHTML = `
    <div style="text-align:center; padding:20px 0;">
      <h3 style="font-family:var(--f-display); font-weight:800; font-size:1.3rem; margin:0 0 8px;">Shift Complete</h3>
      <div style="display:inline-block; margin:8px 0 16px; padding:8px 20px; border:1px solid var(--brass); border-radius:20px; color:var(--brass); font-family:var(--f-mono); font-size:0.9rem;">${badge}</div>
      <div class="grid cols-3">
        <div class="readout"><span class="lbl">Score</span><span class="val">${btState.score}</span></div>
        <div class="readout${btState.incidents > 0 ? " warn" : ""}"><span class="lbl">Incidents</span><span class="val">${btState.incidents}/${btState.order.length}</span></div>
        <div class="readout"><span class="lbl">Best Streak</span><span class="val">${btState.bestStreak}</span></div>
      </div>
      ${badges.length ? `<div style="margin-top:16px;">${badges.map((b) => `<span class="bt-badge-chip">${b}</span>`).join("")}</div>` : ""}
      <p style="font-family:var(--f-sans); color:var(--muted-dim); font-size:0.8rem; margin-top:18px;">Fewer clicks and clean diagnosis score highest \u2014 passing through a dangerous configuration always costs you, even if you land on the fix eventually.</p>
      <button class="pill active" id="bt-restart-btn" style="margin-top:10px;">Run Another Shift</button>
    </div>
  `;
  qs("bt-restart-btn").addEventListener("click", btShowStart);
}

function renderBatchTroubleshooter() {
  return `
    ${plateHeader("Batch Operator Troubleshooter", "OPERATIONAL EXCELLENCE \u2014 TRAINING SIM")}
    <div id="bt-root"></div>
  `;
}

function initBatchTroubleshooter() {
  btEnsureStyle();
  btShowStart();
}

