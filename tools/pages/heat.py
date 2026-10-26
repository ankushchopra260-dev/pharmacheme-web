import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from calcpage import page
J = r'''
  <h2 id="how">How the jacket calculation works</h2>
  <p>Heat passes from the jacket fluid, through the jacket film, the steel wall (and glass for a glass-lined reactor), fouling, and the batch-side film. The overall coefficient is the sum of these resistances:</p>
  <div class="formula-box">1/U = 1/h<sub>batch</sub> + t<sub>wall</sub>/k<sub>wall</sub> (+ t<sub>glass</sub>/k<sub>glass</sub>) + R<sub>fouling</sub> + 1/h<sub>jacket</sub><br>Batch side: h D<sub>v</sub>/k = C Re<sup>2/3</sup> Pr<sup>1/3</sup> (&mu;/&mu;<sub>w</sub>)<sup>M</sup>, &nbsp; Re = D<sub>impeller</sub>&sup2; N &rho; / &mu;</div>
  <ul>
    <li><b>Batch side</b> depends on the agitator: speed, impeller size and type. Doubling the speed raises h by about 2<sup>2/3</sup> = 1.6 times.</li>
    <li><b>Steam in the jacket</b> condenses with a very high coefficient; it rarely limits.</li>
    <li><b>Liquid in a limpet coil or baffled jacket</b> needs velocity: below about 1 m/s the jacket film often becomes the limit.</li>
    <li><b>Glass-lined reactors</b> are usually limited by the glass and the thick wall, not by the films.</li>
  </ul>
  <p>The batch temperature is taken as constant (a snapshot). For heat-up or cool-down time use the <a href="{{ '/process-modelling/heating-cooling-time-simulator/' | relative_url }}">heating and cooling time simulator</a>; if you already know the film coefficients, the <a href="{{ '/calculators/overall-heat-transfer-coefficient-calculator/' | relative_url }}">overall U calculator</a>.</p>
'''
page('calculators/jacketed-vessel-heat-transfer', 'Jacketed Vessel Heat Transfer Calculator: Film Coefficients, U and Duty',
  'Jacketed Vessel Heat Transfer Coefficient | PharmaChemE',
  'Agitated jacketed reactor heat transfer: batch-side film from the impeller, jacket-side film for steam, limpet coil or baffled jacket, overall U and duty.',
  'Jacketed Vessel Heat Transfer',
  'Batch-side film coefficient from the agitator, jacket-side coefficient for steam, a limpet (half-pipe) coil or a baffled jacket, then the overall U and the heat transferred.',
  ['jacket-ht'], J, [
   ('How do you calculate the heat transfer coefficient in an agitated vessel?', 'Use Nu = C Re^(2/3) Pr^(1/3) (μ/μw)^M with Re = D²Nρ/μ based on the impeller, and Nu = h·Dvessel/k. C and M depend on the impeller type (about 0.36 to 0.54).'),
   ('What limits heat transfer in a glass-lined reactor?', 'Usually the glass layer and the thick steel wall, which together can be more than half of the total resistance. Higher agitator speed helps less than in a stainless reactor.')],
  [('/calculators/overall-heat-transfer-coefficient-calculator/', 'Overall U calculator'), ('/process-modelling/heating-cooling-time-simulator/', 'Heating and cooling time'), ('/articles/jacket-and-limpet-coil-design/', 'Jacket and limpet coil design'), ('/calculators/steam-tables/', 'Steam tables')],
  ['if97.js', 'calc-heat.js'], keywords='jacketed vessel heat transfer coefficient, agitated vessel heat transfer, limpet coil heat transfer, reactor U value calculation')
I = r'''
  <h2 id="how">How insulation heat loss is calculated</h2>
  <p>Heat flows from the pipe through the insulation (conduction) and then leaves the outer surface by natural or forced convection and radiation. The surface temperature is solved so that both heat flows match, as in ASTM C680.</p>
  <div class="formula-box">q = (T<sub>pipe</sub> &minus; T<sub>air</sub>) / [ ln(D<sub>s</sub>/D<sub>o</sub>)/(2&pi;k) + 1/((h<sub>conv</sub> + h<sub>rad</sub>) &pi; D<sub>s</sub>) ]</div>
  <p>Use it to check personnel protection (surface temperature), to price the heat lost from bare steam and hot oil lines, and to compare insulation thicknesses. Valves and flanges left bare lose about as much as a metre or more of bare pipe each, so count them too.</p>
'''
page('calculators/insulation-heat-loss', 'Insulation Heat Loss Calculator for Pipes: Surface Temperature and Cost',
  'Pipe Insulation Heat Loss Calculator (kcal/h·m) | PharmaChemE',
  'Heat loss from insulated or bare pipes in kcal/h per metre, outer surface temperature for personnel protection and yearly cost, with convection and radiation.',
  'Insulation Heat Loss Calculator',
  'Heat lost from an insulated or bare pipe, the outer surface temperature and what it costs in a year, with natural or wind convection and radiation.',
  ['insulation'], I, [
   ('How much heat does a bare steam pipe lose?', 'It depends on size, temperature and wind. A bare 80 NB pipe at 180 °C in still air at 30 °C loses about 650 kcal/h per metre; 50 mm of mineral wool insulation (k = 0.045 W/m·K) cuts this by more than 90 %.'),
   ('What surface temperature is safe to touch?', 'Many plants insulate for personnel protection so that surfaces stay at or below about 60 °C. ASTM C1055 gives guidance on burn injury from hot surfaces.')],
  [('/utilities/steam-boiler/', 'Steam & Boiler'), ('/articles/steam-system-efficiency/', 'Steam system efficiency'), ('/calculators/steam-tables/', 'Steam tables')],
  ['calc-heat.js'], keywords='insulation heat loss calculator, pipe heat loss, bare pipe heat loss kcal, insulation thickness, surface temperature personnel protection')
Lm = r'''
  <h2 id="how">LMTD and the F correction factor</h2>
  <p>The log mean temperature difference applies to pure counter-current or co-current flow. In a shell-and-tube exchanger with several tube passes, part of the flow is co-current, so the mean driving force is lower: LMTD &times; F. F comes from the Bowman, Mueller and Nagle equation using</p>
  <div class="formula-box">R = (T<sub>hot,in</sub> &minus; T<sub>hot,out</sub>) / (t<sub>cold,out</sub> &minus; t<sub>cold,in</sub>), &nbsp; P = (t<sub>cold,out</sub> &minus; t<sub>cold,in</sub>) / (T<sub>hot,in</sub> &minus; t<sub>cold,in</sub>)<br>Area = Q / (U &times; F &times; LMTD)</div>
  <p>We checked the F equation against the effectiveness&ndash;NTU method; they agree to four decimal places. If F falls below about 0.75 to 0.8, add shell passes or use a counter-current exchanger. For a complete exchanger design see <a href="{{ '/articles/heat-exchanger-design-basics/' | relative_url }}">heat exchanger design basics</a>.</p>
'''
page('calculators/lmtd-calculator', 'LMTD Calculator with F Correction Factor for Shell and Tube Heat Exchangers',
  'LMTD and F Correction Factor Calculator | PharmaChemE',
  'LMTD for counter-current and co-current flow, F correction factor for 1-2 and 2-4 shell-and-tube exchangers (Bowman equation), and the heat transfer area.',
  'LMTD and F Correction Factor',
  'Log mean temperature difference, the F correction for shell-and-tube exchangers with one or two shell passes, and the area for your duty and U.',
  ['lmtd'], Lm, [
   ('How do you calculate the F correction factor?', 'Calculate R = (Thi − Tho)/(tco − tci) and P = (tco − tci)/(Thi − tci), then use the Bowman, Mueller and Nagle equation for a 1-2 exchanger. For two shells in series apply it to the P of each shell.'),
   ('What is a good F correction factor?', 'Designs usually keep F above about 0.75 to 0.8. Lower values mean a temperature cross is close and the exchanger performance is sensitive to small changes.')],
  [('/articles/heat-exchanger-design-basics/', 'Heat exchanger design basics'), ('/calculators/overall-heat-transfer-coefficient-calculator/', 'Overall U'), ('/calculators/jacketed-vessel-heat-transfer/', 'Jacketed vessel heat transfer')],
  ['calc-heat.js'], keywords='LMTD calculator, F correction factor, log mean temperature difference, shell and tube heat exchanger area, 1-2 exchanger')
print('ok')
