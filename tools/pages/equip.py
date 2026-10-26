import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from calcpage import page
SC = [('calc-equip.js', {'data-sol': '/assets/data/solvent-lite.json'})]
page('calculators/knock-out-pot-sizing', 'Knock-out Pot and Vertical Separator Sizing Calculator (Souders–Brown)',
  'Knock-out Pot / Separator Sizing (Souders–Brown) | PharmaChemE',
  'Size a vertical knock-out pot or gas-liquid separator: Souders–Brown velocity with GPSA K values, diameter and liquid hold-up height.',
  'Knock-out Pot and Vertical Separator Sizing',
  'Diameter of a vertical knock-out pot or gas–liquid separator from the Souders–Brown velocity, with GPSA K values and the liquid hold-up height.',
  ['ko-pot'], r'''
  <h2 id="how">How a knock-out pot is sized</h2>
  <p>Droplets settle out of the gas if the upward gas velocity is below the Souders&ndash;Brown limit:</p>
  <div class="formula-box">v<sub>max</sub> = K &radic;((&rho;<sub>L</sub> &minus; &rho;<sub>G</sub>) / &rho;<sub>G</sub>), &nbsp; D = &radic;(4 Q<sub>actual</sub> / (&pi; v))</div>
  <p>The GPSA Engineering Data Book gives K = 0.107 m/s for vertical drums with a horizontal wire-mesh pad up to 7 barg, falling with pressure, and suggests about half for drums without a mesh pad. In pharma plants knock-out pots protect vacuum pumps, scrubbers and vent headers from liquid carry-over; a pot under vacuum handles a large actual gas volume, so check the nozzles as well as the shell.</p>''',
  [('What K value should I use for a knock-out pot?', 'GPSA gives K = 0.107 m/s for vertical separators with a horizontal mesh pad up to 7 barg, reduced by 0.003 m/s for every 7 bar above that, and about half of these values without a mesh pad.')],
  [('/calculators/packed-scrubber-calculator/', 'Packed scrubber sizing'), ('/articles/vacuum-systems/', 'Vacuum systems'), ('/calculators/unit-converter/', 'Unit converter')], SC,
  keywords='knock out pot sizing, vertical separator sizing, Souders Brown equation, GPSA K value, catch pot, KO drum')
page('calculators/tank-breathing-losses', 'Solvent Tank Filling and Breathing Loss Calculator',
  'Solvent Tank Filling and Breathing Losses | PharmaChemE',
  'Estimate solvent lost each year from a fixed-roof storage tank vent: filling (working) and breathing (standing) losses, with vapour balancing and vent band.',
  'Solvent Tank Filling and Breathing Losses',
  'How much solvent a fixed-roof tank loses from its vent each year when it is filled and as it warms and cools every day.',
  ['tank-loss'], r'''
  <h2 id="how">Where tank losses come from</h2>
  <ul>
    <li><b>Filling (working) loss:</b> each m&sup3; pumped in pushes out a m&sup3; of headspace gas saturated with solvent vapour.</li>
    <li><b>Breathing (standing) loss:</b> the headspace warms in the day and cools at night; the gas and the vapour pressure expand and the vent breathes out. A conservation vent with a pressure band absorbs part of this.</li>
  </ul>
  <p>This calculator gives a conservative physical estimate: the headspace is taken as saturated and no turnover credit is applied, so it gives the upper end. For permit reporting use the full US EPA AP-42 Chapter 7.1 method, which adds tank colour, solar insolation and saturation and turnover factors. Read <a href="{{ '/articles/storage-tank-breathing-losses/' | relative_url }}">solvent storage tanks: breathing losses and vents</a> for the controls that work.</p>''',
  [('How do you calculate tank filling losses?', 'Filling loss = volume pumped in × concentration of saturated vapour in the headspace. Concentration = vapour pressure × molecular weight / (R × T). For toluene at 30 °C that is about 0.18 kg per m³ pumped.'),
   ('Does nitrogen blanketing reduce tank emissions?', 'No. The gas pushed out during filling is still saturated with vapour; it is nitrogen instead of air. Vapour balancing to the tanker and vent condensers reduce the losses.')],
  [('/articles/storage-tank-breathing-losses/', 'Solvent storage tanks (article)'), ('/solvents/', 'Solvent data'), ('/articles/inerting-and-loc/', 'Inerting and LOC')], SC,
  keywords='tank breathing losses, tank filling losses, solvent storage tank emissions, working loss, standing loss, AP-42 tank')
page('calculators/vessel-thickness-calculator', 'Pressure Vessel Thickness and MAWP Calculator (ASME VIII Div. 1)',
  'Vessel Thickness and MAWP (ASME VIII-1) | PharmaChemE',
  'Required shell and head thickness for internal pressure to ASME VIII Div. 1 (UG-27, UG-32): 2:1 ellipsoidal, torispherical and hemispherical heads, MAWP.',
  'Vessel Thickness and MAWP',
  'Minimum shell and head thickness for internal pressure, the MAWP of a chosen plate thickness and the hydrotest pressure, to ASME Section VIII Division 1.',
  ['vessel-thk'], r'''
  <h2 id="how">The Code formulas</h2>
  <div class="formula-box">Cylindrical shell (UG-27): t = PR / (SE &minus; 0.6P)<br>2:1 ellipsoidal head (UG-32): t = PD / (2SE &minus; 0.2P)<br>Torispherical (F&amp;D) head: t = 0.885PL / (SE &minus; 0.1P)<br>Hemispherical head: t = PR / (2SE &minus; 0.2P)
    <small>P design pressure, S allowable stress at design temperature (ASME II Part D), E joint efficiency, R and D inside radius and diameter, L crown radius, all in the corroded condition.</small></div>
  <p>Reactors and receivers in pharma plants usually run under vacuum too, and jacketed vessels see the jacket pressure on the outside. External pressure (UG-28) often decides the shell thickness of such vessels and is not covered here. Use this calculator to screen designs and check vendor drawings; the design itself must be done to the applicable Code edition by a competent engineer.</p>''',
  [('How do you calculate the shell thickness of a pressure vessel?', 'Under ASME VIII Div. 1 UG-27, t = PR/(SE − 0.6P) for circumferential stress, with R the inside radius in the corroded condition, then add the corrosion allowance and forming and mill tolerances.')],
  [('/calculators/vessel-volume-calculator/', 'Vessel volume and level'), ('/articles/lifting-equipment-and-pressure-vessel-testing/', 'Pressure vessel testing'), ('/calculators/relief-valve-sizing/', 'Relief valve sizing')], ['calc-equip.js'],
  keywords='pressure vessel thickness calculator, ASME VIII shell thickness, MAWP calculation, torispherical head thickness, ellipsoidal head thickness')
print('ok')
