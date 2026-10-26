import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from calcpage import page
body = r'''
  <h2 id="how">How the steam table is calculated</h2>
  <p>Every value is calculated from <b>IAPWS-IF97</b>, the industrial standard formulation for water and steam used by boiler makers and turbine vendors. It is not interpolated from a printed table, so any pressure or temperature in range gives exact values. We checked our code against the verification values published in the IAPWS release (for example, saturation at 0.1 MPa is 372.755919 K).</p>
  <ul>
    <li><b>Saturated steam table:</b> the boiling temperature and the latent heat at a pressure. Use it for jacket and heater duty: heat given per kg of steam condensed = h<sub>fg</sub>.</li>
    <li><b>Superheated steam:</b> enthalpy and density at any pressure and temperature, and how many degrees of superheat it has.</li>
    <li><b>Flash steam:</b> when hot condensate drops to a lower pressure, part of it boils. Flash fraction = (h<sub>f1</sub> &minus; h<sub>f2</sub>) / h<sub>fg2</sub>.</li>
    <li><b>Desuperheater:</b> water added so that superheated steam leaves at a target temperature. Process heaters work best with steam just above saturation, because the latent heat does the work.</li>
  </ul>
  <div class="art-note"><b>On the plant</b><p>Steam at 3 barg condenses at 143.7 &deg;C and gives 509 kcal/kg; at 10 barg it condenses at 184.1 &deg;C and gives only 478 kcal/kg. Lower steam pressure gives more heat per kg and less flash loss, as long as the temperature difference to the batch is still enough.</p></div>
  <p>Units: 1 kcal = 4.1868 kJ. Gauge pressures assume a 1.01325 bar atmosphere. For boiler fuel, condensate recovery and steam leak costs, see <a href="{{ '/utilities/steam-boiler/' | relative_url }}">Steam &amp; Boiler</a>.</p>
'''
faqs = [
  ('What is the latent heat of steam at 10 barg?', 'Saturated steam at 10 barg (11.01 bar abs) condenses at 184.1 °C. Its latent heat is about 478 kcal/kg (2,000 kJ/kg), and the steam enthalpy is about 664 kcal/kg, from IAPWS-IF97.'),
  ('How do you calculate flash steam?', 'Flash fraction = (hf at the high pressure − hf at the low pressure) ÷ hfg at the low pressure. For condensate at 7 barg flashing to atmosphere about 13 % becomes steam.'),
  ('How much water does a desuperheater need?', 'Water flow = steam flow × (h inlet − h outlet) ÷ (h outlet − h water), with all enthalpies at the steam pressure. Keep the outlet at least 5 to 10 °C above saturation so all the water evaporates.'),
]
related = [('/utilities/steam-boiler/', 'Steam & Boiler: fuel, flash steam and trap losses'), ('/calculators/steam-heating-calculator/', 'Steam needed to heat a batch'), ('/articles/steam-system-efficiency/', 'Steam system efficiency'), ('/calculators/unit-converter/', 'Unit converter')]
print(page('calculators/steam-tables', 'Steam Tables in kcal (IAPWS-IF97): Saturated and Superheated Steam Calculator',
  'Steam Table Calculator in kcal/kg (IAPWS-IF97) | PharmaChemE',
  'Free steam table calculator (IAPWS-IF97): saturation temperature, latent heat in kcal/kg, superheated steam, flash steam and desuperheater water.',
  'Steam Tables, Flash Steam and Desuperheater',
  'Saturated and superheated steam properties in kcal/kg and kJ/kg at any pressure, calculated from IAPWS-IF97, plus flash steam from condensate and desuperheater spray water.',
  ['steam-sat', 'steam-super', 'condensate-flash', 'desuperheater'], body, faqs, related, ['if97.js', 'calc-steam.js'],
  jump=[('steam-sat', 'Saturated steam'), ('steam-super', 'Superheated steam'), ('condensate-flash', 'Flash steam'), ('desuperheater', 'Desuperheater'), ('guide', 'How it works')],
  keywords='steam table, steam table kcal, latent heat of steam, IAPWS-IF97, superheated steam table, flash steam calculator, desuperheater calculation'))
