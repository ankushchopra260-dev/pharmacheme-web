import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from calcpage import page
body = r'''
  <h2 id="how">How the pressure drop is calculated</h2>
  <p><b>Pipe friction</b> uses the Darcy&ndash;Weisbach equation, &Delta;P = f (L/D) &rho;u&sup2;/2, with the Churchill (1977) friction factor. Churchill covers laminar, transitional and turbulent flow in one equation and agrees with Colebrook within about 0.5 % in turbulent flow.</p>
  <p><b>Fittings and valves</b> use Darby&rsquo;s 3-K method: K = K<sub>1</sub>/Re + K<sub>&infin;</sub>(1 + K<sub>d</sub>/D<sub>n</sub><sup>0.3</sup>), with D<sub>n</sub> the nominal size in inches. A single fixed K for an elbow is fine for one pipe size but under-predicts losses in small lines and at low Reynolds number; the 3-K method corrects for both. Entrance from a tank is K = 0.5 and exit into a tank K = 1.0.</p>
  <div class="formula-box">&Delta;P<sub>total</sub> = f (L/D) &rho;u&sup2;/2 + &Sigma;K &rho;u&sup2;/2 + &rho; g &Delta;z + fixed drops</div>
  <h2 id="npsh-how">NPSH available</h2>
  <p>A pump cavitates when the pressure at its eye falls to the liquid&rsquo;s vapour pressure. NPSH available is the head above vapour pressure at the pump inlet:</p>
  <div class="formula-box">NPSHa = (P<sub>vessel</sub> &minus; P<sub>vapour</sub>) / &rho;g + liquid level above pump &minus; suction line loss</div>
  <p>The vapour pressure comes from the Antoine constants on our solvent pages. Hot liquids and vacuum vessels are where pumps cavitate: a methanol receiver under vacuum at 30 &deg;C has only a few metres of NPSH available, all from the liquid level.</p>
  <div class="art-note"><b>On the plant</b><p>If a transfer pump from a distillation receiver &ldquo;loses suction&rdquo; at the end of a batch, the level has dropped and NPSHa with it. Lower the pump, keep a minimum level, shorten and enlarge the suction line, or cool the liquid.</p></div>
'''
faqs = [
  ('How do you calculate pressure drop in a pipe with fittings?', 'Add pipe friction from the Darcy–Weisbach equation, the losses of each fitting and valve (sum of K times ρu²/2), the elevation change ρgΔz, and any fixed drops such as a control valve or filter.'),
  ('What is the 3-K method?', 'A fitting loss method by Darby in which K = K1/Re + K∞(1 + Kd/Dn^0.3). It accounts for both the Reynolds number and the pipe size, so it is more accurate than a single K value for small pipes and viscous liquids.'),
  ('How do you calculate NPSH available?', 'NPSHa = (vessel pressure − vapour pressure)/(ρg) + liquid level above the pump inlet − suction line losses, all in metres of liquid. It must exceed the NPSH required by the pump with a margin.'),
]
related = [('/design-tools/line-sizing/', 'Line sizing'), ('/calculators/pump-power-calculator/', 'Pump power'), ('/articles/line-sizing-and-pressure-drop/', 'Line sizing and pressure drop (article)'), ('/articles/pump-and-mechanical-seal-troubleshooting/', 'Pump and seal troubleshooting')]
print(page('calculators/pipe-pressure-drop', 'Pipe Pressure Drop Calculator with Fittings (3-K Method) and Pump NPSH',
  'Pipe Pressure Drop with Fittings (3-K) and NPSH | PharmaChemE',
  'Liquid line pressure drop with elbows, tees and valves (Darby 3-K), friction factor and elevation, plus pump NPSH available from vapour pressure. Free.',
  'Pipe Pressure Drop and Pump NPSH',
  'Pressure drop in a liquid line with pipe friction, fittings and valves by the 3-K method, entrance, exit and elevation, and the NPSH available at your pump.',
  ['pipe-dp', 'npsh'], body, faqs, related, [('calc-flow.js', {'data-sol': '/assets/data/solvent-lite.json'})],
  jump=[('pipe-dp', 'Pressure drop'), ('npsh', 'NPSH available'), ('guide', 'How it works')],
  keywords='pipe pressure drop calculator, pressure drop fittings, 3K method, Darby 3-K, NPSH available calculation, NPSHa, friction factor Churchill'))
