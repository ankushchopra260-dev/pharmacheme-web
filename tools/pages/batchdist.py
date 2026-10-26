import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from calcpage import page
body = r'''
  <h2 id="how">What the simulator does</h2>
  <p>It follows a batch still with a packed or trayed column, a total condenser and a reflux drum, minute by minute. At every stage the liquid and vapour are in equilibrium, calculated with <b>modified UNIFAC (Dortmund)</b> activity coefficients. Non-ideal behaviour is therefore included: methanol&ndash;water, IPA&ndash;water and other azeotropes behave as they do on the plant, and the distillate never gets past an azeotrope. Simulators that assume Raoult&rsquo;s law (ideal mixtures) cannot show this.</p>
  <ol>
    <li><b>Start-up at total reflux:</b> the column fills and the light component concentrates at the top before any distillate is drawn.</li>
    <li><b>Cuts:</b> distillate is drawn at the reflux ratio of each cut until its end condition is met. Typical end conditions are a top temperature (end of the pure solvent fraction), a still temperature (end of recovery) or a mass.</li>
    <li><b>Results:</b> the mass and composition of every cut and the residue, the time, the heat to the reboiler, and temperature and composition profiles over time.</li>
  </ol>
  <p>Model checks: the activity coefficients match the open-source reference implementation to machine precision; with no column and no reflux the result reproduces the Rayleigh equation exactly; and the mass balance closes. For ethanol and water, the distillate approaches but does not cross the azeotrope.</p>
  <div class="art-note"><b>On the plant</b><p>Use the simulator to compare options before a trial: more stages or a higher reflux for a purer first cut, the time and steam it costs, and where to switch receivers. Real columns lose some separation to heat losses, entrainment and less-than-ideal packing, so set the plant receiver changes from the top temperature, as the simulator does, and confirm the cuts by GC.</p></div>
  <p>Limits: one liquid phase (systems that split into two layers, such as toluene&ndash;water, need a decanter model); no pressure drop along the column; constant boil-up. For the heat-up time and vacuum stripping of a single solvent use the <a href="{{ '/calculators/solvent-recovery-calculator/' | relative_url }}">solvent recovery calculator</a>; for swapping one solvent for another, the <a href="{{ '/process-modelling/solvent-swap-simulator/' | relative_url }}">solvent swap simulator</a>.</p>
'''
faqs = [
  ('How do you simulate a batch distillation?', 'Model the still, each column stage and the reflux drum as well-mixed holdups in vapour-liquid equilibrium, and integrate the component balances over time at the chosen boil-up rate and reflux ratio, switching receivers when each cut condition is reached.'),
  ('Why does batch distillation need non-ideal VLE?', 'Most solvent mixtures are not ideal. Methanol–water, IPA–water and ethyl acetate–ethanol show strong deviations or azeotropes, so an ideal (Raoult’s law) model overstates the purity you can reach and understates the time.'),
  ('What is a good reflux ratio for batch solvent recovery?', 'It depends on the separation. A higher reflux ratio gives a purer distillate but takes longer and uses more steam. Compare reflux ratios in the simulator and pick the lowest one that meets the purity of the recovered solvent.'),
]
related = [('/solvents/azeotropes/', 'Azeotrope calculator and table'), ('/calculators/solvent-recovery-calculator/', 'Solvent recovery calculator'), ('/articles/distillation-basics/', 'Distillation basics'), ('/articles/solvent-recovery-troubleshooting/', 'Solvent recovery troubleshooting')]
print(page('calculators/batch-distillation-simulator', 'Batch Distillation Simulator: Solvent Recovery Cuts with UNIFAC (Non-ideal VLE)',
  'Batch Distillation Simulator (UNIFAC, Cuts) | PharmaChemE',
  'Simulate batch solvent recovery: stages, reflux ratio and cuts with non-ideal VLE (modified UNIFAC). Cut masses, compositions, time, steam and profiles.',
  'Batch Distillation Simulator',
  'Simulate a batch still with a column for solvent recovery: choose the charge, stages, boil-up and reflux for each cut, and see the cut masses and purities, time and heat, with real (non-ideal) mixture behaviour.',
  ['batch-dist'], body, faqs, related, ['batch-distill-engine.js', ('calc-batchdist.js', {'data-unifac': '/assets/data/unifac-do.json', 'data-sol': '/assets/data/solvent-lite.json'})],
  keywords='batch distillation simulator, batch distillation calculation, solvent recovery simulation, reflux ratio batch distillation, UNIFAC, Rayleigh distillation'))
