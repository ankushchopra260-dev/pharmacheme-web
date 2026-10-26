import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from calcpage import page
body = r'''
  <h2 id="how">How to use these calculators</h2>
  <ol>
    <li><b>Find the governing scenario.</b> List every way the equipment can be over-pressured: blocked outlet, control valve or PRV failing open, cooling failure, external fire, thermal expansion, exchanger tube rupture, runaway reaction. The scenario with the largest required area governs. The <a href="{{ '/process-safety/emergency-relief-vent-sizing/' | relative_url }}">relief and vent sizing lesson</a> explains how to choose.</li>
    <li><b>Work out the relief rate</b> for that scenario. The fire-case calculators give it for external fire; for a PRV or control valve failing open, it is the full flow through the failed valve.</li>
    <li><b>Size the valve</b> with the gas/vapour, steam or liquid calculator. Use 10 % overpressure for a single valve, 16 % for multiple valves and 21 % for the fire case.</li>
    <li><b>Pick the orifice</b>: the next API 526 letter at or above the required effective area.</li>
  </ol>
  <div class="formula-box">Gas, critical flow: A = W / (C K<sub>d</sub> P<sub>1</sub> K<sub>b</sub> K<sub>c</sub>) &radic;(T Z / M), &nbsp; C = 0.03948 &radic;(k (2/(k+1))<sup>(k+1)/(k&minus;1)</sup>)<br>Liquid: A = 11.78 Q / (K<sub>d</sub> K<sub>w</sub> K<sub>c</sub> K<sub>v</sub>) &radic;(G / &Delta;P)<br>Fire heat input: Q = 43,200 F A<sub>w</sub><sup>0.82</sup> W (adequate drainage and firefighting)
    <small>SI units: A in mm², W in kg/h, P in kPa abs, T in K, Q in L/min. We checked every SI equation against the US-unit form in API 520; they agree within 0.1 %.</small></div>
  <div class="art-note"><b>Runaway reactions are different</b><p>A reactor that can run away usually needs two-phase relief sizing (DIERS methods), which gives a much larger area than these vapour equations. Do not size a reactor emergency vent with the gas calculator alone; see <a href="{{ '/process-safety/cooling-failure-and-runaway/' | relative_url }}">cooling failure and runaway</a>.</p></div>
  <p>These are design aids based on the published equations. The final selection must use the manufacturer&rsquo;s certified coefficients and be checked by a competent engineer against your scenario analysis and local regulations.</p>
'''
faqs = [
  ('How do you size a pressure relief valve for gas?', 'API 520 gives the area A = W/(C Kd P1 Kb Kc) √(TZ/M) in critical flow, with C from the ratio of specific heats k. Use the relieving pressure (set pressure plus overpressure, absolute) and pick the next API 526 orifice letter above the required area.'),
  ('What overpressure is allowed for a relief valve?', 'Under ASME Section VIII, 10 % above the maximum allowable working pressure for a single valve, 16 % for multiple valves and 21 % for an external fire.'),
  ('How do you calculate the fire case relief load?', 'Find the wetted area up to 7.6 m above grade, calculate heat input Q = 43,200 F A^0.82 W (with adequate drainage and firefighting, A in m²) and divide by the latent heat of the liquid at relieving conditions to get kg/h of vapour.'),
  ('What are the API 526 orifice sizes?', 'Effective areas from D (0.110 in², 71 mm²) through E, F, G, H, J, K, L, M, N, P, Q and R to T (26.0 in², 16,774 mm²).'),
]
related = [('/process-safety/emergency-relief-vent-sizing/', 'Relief and vent sizing (lesson)'), ('/articles/relief-valve-sizing/', 'Relief valve sizing basics'), ('/calculators/steam-tables/', 'Steam tables'), ('/calculators/control-valve-sizing/', 'Control valve Cv and restriction orifice')]
print(page('calculators/relief-valve-sizing', 'Relief Valve Sizing Calculator (API 520 / 521): Gas, Steam, Liquid, Fire Case',
  'PSV Sizing Calculator (API 520/521, Fire Case) | PharmaChemE',
  'Relief valve sizing to API 520: gas and vapour (critical and subcritical), steam, liquid with viscosity correction, API 521 fire case and thermal relief.',
  'Relief Valve Sizing (API 520 and 521)',
  'Size pressure relief valves for gas, vapour, steam and liquid, work out fire-case and thermal-expansion relief loads, and pick the API 526 orifice.',
  ['psv-gas', 'psv-liquid', 'psv-steam', 'fire-wetted', 'fire-gas', 'thermal-relief'], body, faqs, related, ['calc-relief.js'],
  crumbs=[('Calculators', '/calculators/')],
  jump=[('psv-gas', 'Gas / vapour'), ('psv-liquid', 'Liquid'), ('psv-steam', 'Steam'), ('fire-wetted', 'Fire: liquid-filled'), ('fire-gas', 'Fire: gas-filled'), ('thermal-relief', 'Thermal relief'), ('guide', 'How to use')],
  keywords='relief valve sizing calculator, PSV sizing, API 520 calculator, API 521 fire case, safety valve sizing, API 526 orifice, thermal relief valve'))
