import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from calcpage import page
body = r'''
  <h2 id="how">How control valves are sized</h2>
  <p>The flow coefficient C<sub>v</sub> is the flow of water in US gallons per minute that passes with a 1 psi drop; K<sub>v</sub> is the same in m&sup3;/h at 1 bar (C<sub>v</sub> = 1.156 K<sub>v</sub>). The calculators use the ISA-75.01.01 / IEC 60534-2-1 equations for turbulent flow with the valve the same size as the pipe.</p>
  <div class="formula-box">Liquid: C<sub>v</sub> = (Q / 0.865) &radic;((&rho;/&rho;<sub>0</sub>) / &Delta;p), &nbsp; &Delta;p limited to F<sub>L</sub>&sup2; (p<sub>1</sub> &minus; F<sub>F</sub> p<sub>v</sub>)<br>Gas and steam: C<sub>v</sub> = W / (27.3 Y &radic;(x p<sub>1</sub> &rho;<sub>1</sub>)), &nbsp; Y = 1 &minus; x / (3 F<sub>&gamma;</sub> x<sub>T</sub>), x limited to F<sub>&gamma;</sub> x<sub>T</sub>
    <small>Q in m³/h, W in kg/h, pressures in bar abs, density in kg/m³.</small></div>
  <ul>
    <li><b>Choked liquid flow</b> means the valve is cavitating or flashing. Extra pressure drop gives no more flow, and the trim erodes. Split the drop, use anti-cavitation trim or choose a valve with a higher F<sub>L</sub>.</li>
    <li><b>Choked gas flow</b> is limited by the upstream pressure. It is often unavoidable for large drops, but it gives high outlet velocity and noise.</li>
    <li><b>F<sub>L</sub> and x<sub>T</sub></b> depend on the valve style and trim. The presets are typical values from the standard; use the vendor&rsquo;s figures for the valve you buy.</li>
  </ul>
  <h2 id="ro-how">Restriction orifices</h2>
  <p>A restriction orifice is a plate with a bored hole that takes a fixed pressure drop or limits flow, for example nitrogen to a blanketing header or a minimum-flow bypass on a pump. For liquids, part of the drop across the plate is recovered downstream; the calculator sizes the bore for the <i>permanent</i> loss using the ISO 5167-2 relation. For gases, a choked orifice passes a flow set only by the upstream pressure, which makes it a simple flow limiter.</p>
  <div class="art-note"><b>On the plant</b><p>A nitrogen restriction orifice sized for normal blanketing flow also sets the maximum flow if a pressure regulator fails open. Check the downstream vessel&rsquo;s relief valve against that flow.</p></div>
'''
faqs = [
  ('How do you calculate the Cv of a control valve for liquid?', 'Cv = (Q/0.865) × √(SG/Δp) with Q in m³/h and Δp in bar, where Δp is limited to the choked value FL²(p1 − FF·pv). Kv = Cv/1.156.'),
  ('What is choked flow in a control valve?', 'For liquids, the point where the pressure inside the valve falls to the vapour pressure, so the valve cavitates or flashes and more pressure drop gives no more flow. For gases, the point where the flow reaches sonic velocity, set by x = Fγ·xT.'),
  ('How do you size a restriction orifice for gas?', 'If the downstream to upstream pressure ratio is below (2/(k+1))^(k/(k−1)), the flow is choked: W = C·A·P1·√(kM/(ZRT)·(2/(k+1))^((k+1)/(k−1))). Solve for the bore area A and diameter.'),
]
related = [('/calculators/pipe-pressure-drop/', 'Pipe pressure drop and NPSH'), ('/calculators/relief-valve-sizing/', 'Relief valve sizing'), ('/articles/instrumentation-basics/', 'Instrumentation basics'), ('/calculators/steam-tables/', 'Steam tables')]
print(page('calculators/control-valve-sizing', 'Control Valve Cv Calculator (ISA-75.01 / IEC 60534) and Restriction Orifice Sizing',
  'Control Valve Cv and Restriction Orifice Sizing | PharmaChemE',
  'Control valve Cv and Kv for liquid, gas and steam to ISA-75.01 / IEC 60534 with choked flow, plus restriction orifice bore sizing for liquid and gas.',
  'Control Valve Cv and Restriction Orifice Sizing',
  'Required Cv and Kv for liquids, gases and steam with choked-flow checks, and the bore of a restriction orifice for a liquid or a gas.',
  ['cv-liquid', 'cv-gas', 'ro-liquid', 'ro-gas'], body, faqs, related, ['if97.js', 'calc-valves.js'],
  jump=[('cv-liquid', 'Cv liquid'), ('cv-gas', 'Cv gas and steam'), ('ro-liquid', 'Orifice, liquid'), ('ro-gas', 'Orifice, gas'), ('guide', 'How it works')],
  keywords='control valve Cv calculator, Kv calculation, control valve sizing liquid gas steam, choked flow, restriction orifice calculation, RO sizing'))
