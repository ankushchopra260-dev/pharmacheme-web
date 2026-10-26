import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from calcpage import page
body = r'''
  <h2 id="how">Conversions plant engineers get wrong</h2>
  <ul>
    <li><b>Gauge, absolute and vacuum.</b> Boiling points, vapour pressure and gas density all need <i>absolute</i> pressure. A gauge reads above atmosphere; a plant vacuum gauge usually reads mmHg <i>below</i> atmosphere. 700 mmHg vacuum is about 60 mmHg absolute at sea level, but only about 15 mmHg absolute at an altitude where the atmosphere is 715 mmHg.</li>
    <li><b>kg/cm&sup2; is not bar.</b> 1 kg/cm&sup2; = 0.980665 bar. On a 10 kg/cm&sup2;g design pressure the difference is 0.2 bar.</li>
    <li><b>Heat duty.</b> 1 kW = 860 kcal/h, and 1 TR (refrigeration ton) = 3,024 kcal/h = 3.517 kW.</li>
    <li><b>U values.</b> 1 kcal/h&middot;m&sup2;&middot;&deg;C = 1.163 W/m&sup2;&middot;K. A U of 300 kcal/h&middot;m&sup2;&middot;&deg;C is 349 W/m&sup2;&middot;K.</li>
    <li><b>Normal and standard gas volumes.</b> Nm&sup3; is usually at 0 &deg;C, Sm&sup3; at 15 &deg;C (some vendors use 20 &deg;C); 1 Nm&sup3; of air is 1.29 kg. Always ask which reference a nitrogen or compressed-air vendor means.</li>
    <li><b>Temperature differences</b> convert without the offset: a 10 &deg;C rise is a 10 K or 18 &deg;F rise.</li>
  </ul>
  <p>Conversion factors are the exact or NIST SP 811 values; kcal and BTU are International Table values (1 kcal = 4.1868 kJ).</p>
'''
faqs = [
  ('How do you convert mmHg vacuum to absolute pressure?', 'Absolute pressure = atmospheric pressure − vacuum reading. At sea level 760 mmHg − 700 mmHg vacuum = 60 mmHg absolute (80 mbar). At altitude, use the local atmospheric pressure.'),
  ('How many kcal/h is 1 kW?', '1 kW = 859.85 kcal/h (International Table calorie), usually rounded to 860 kcal/h. 1 TR of refrigeration is 3.517 kW or about 3,024 kcal/h.'),
  ('What is the difference between Nm3/h and Sm3/h?', 'Both are gas flows at a reference condition. Nm³/h is usually at 0 °C and 1.01325 bar abs, Sm³/h at 15 °C and 1.01325 bar abs, so 1 Nm³ = 1.055 Sm³ of the same gas.'),
]
related = [('/calculators/steam-tables/', 'Steam tables'), ('/calculators/solvent-recovery-calculator/', 'Boiling point under vacuum'), ('/utilities/compressed-air-nitrogen/', 'Compressed air and nitrogen'), ('/calculators/', 'All calculators')]
print(page('calculators/unit-converter', 'Unit Converter for Chemical Engineers: Pressure, Vacuum, kcal, TR, U Value, Nm3/h',
  'Unit Converter: Vacuum, kcal, TR, Nm³/h | PharmaChemE',
  'Convert gauge, absolute and vacuum pressure, kcal/h, kW and TR, U values, viscosity and flows, and gas flow between Nm³/h, Sm³/h, SCFM, actual m³/h and kg/h.',
  'Unit Converter for Process Engineers',
  'Pressure with gauge, absolute and vacuum readings, heat duty in kcal/h, kW and TR, U values, viscosity, flows and more, plus gas flow at normal, standard and actual conditions.',
  ['unit-convert', 'gas-volume'], body, faqs, related, ['calc-units.js'],
  jump=[('unit-convert', 'Unit converter'), ('gas-volume', 'Gas flow Nm³/h, Sm³/h'), ('guide', 'Common mistakes')],
  keywords='unit converter chemical engineering, mmHg vacuum to absolute, kcal to kW, TR to kW, Nm3/h to Sm3/h, kg/cm2 to bar, U value conversion'))
