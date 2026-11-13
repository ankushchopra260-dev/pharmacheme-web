import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from calcpage import page
page('calculators/mccabe-thiele', 'McCabe-Thiele Calculator: Theoretical Stages, Minimum Reflux and Feed Stage',
  'McCabe-Thiele Calculator: Stages, Rmin, Feed | PharmaChemE',
  'Free McCabe-Thiele calculator: real solvent VLE (UNIFAC), q-line, minimum reflux, stages, feed stage, tray efficiency, Fenske, Gilliland and duties.',
  'McCabe-Thiele Calculator',
  'Draws the full McCabe-Thiele diagram for a binary distillation column and counts the stages. Pick two solvents and the equilibrium curve comes from real mixture data, azeotropes included, or use a constant relative volatility or your own x-y points. You get minimum reflux, minimum stages, the optimum feed stage, real trays at your tray efficiency, every stage composition and temperature, flows and condenser and reboiler duties in kcal/h.',
  ['mccabe'], r'''
  <h2 id="how">How the McCabe-Thiele method works</h2>
  <p>The method draws three things on one x-y chart for the light (more volatile) component: the <b>equilibrium curve</b>, the <b>operating lines</b> from the mass balance, and the <b>q-line</b> for the feed. Stepping between the curve and the lines, from the distillate down to the bottoms, counts the theoretical stages. Each horizontal step is one equilibrium stage; each vertical step is the mass balance to the stage below.</p>
  <div class="formula-box">Rectifying line: y = R/(R + 1)·x + x<sub>D</sub>/(R + 1)<br>q-line: y = q/(q − 1)·x − z<sub>F</sub>/(q − 1)<br>Stripping line: through (x<sub>B</sub>, x<sub>B</sub>) and the point where the other two lines meet<br>
    <small>R = L/D, the reflux ratio. q = heat to turn one mole of feed into saturated vapour ÷ molar latent heat: 1 for saturated liquid, 0 for saturated vapour, above 1 for a cold feed.</small></div>
  <h3>Minimum reflux and minimum stages</h3>
  <p>As the reflux falls, the operating lines move towards the equilibrium curve and the steps get smaller. At the <b>minimum reflux</b> a line touches the curve and the stages become infinite. For an ideal mixture the touch is at the q-line. For a non-ideal mixture such as ethanol and water, the line can touch the curve higher up: a <b>tangent pinch</b>. This calculator tests both lines against the whole curve, so it finds either kind. At <b>total reflux</b> the operating lines become the diagonal and the stages are fewest; the Fenske equation gives the same number when the relative volatility is constant.</p>
  <div class="formula-box">Fenske: N<sub>min</sub> = ln[(x<sub>D</sub>/(1 − x<sub>D</sub>))·((1 − x<sub>B</sub>)/x<sub>B</sub>)] ÷ ln α<sub>avg</sub><br>Material balance: D = F(z<sub>F</sub> − x<sub>B</sub>)/(x<sub>D</sub> − x<sub>B</sub>), B = F − D</div>
  <h3>Choosing the reflux ratio</h3>
  <p>More reflux means fewer stages but more steam in the reboiler and more cooling water in the condenser. Most columns are designed at 1.1 to 1.5 times the minimum reflux. The "Reflux against stages" table shows the trade-off for your case: stages fall quickly just above the minimum, then hardly change while the energy keeps rising.</p>
  <h3>From theoretical stages to real trays</h3>
  <p>A real tray does not reach equilibrium. Enter a Murphree efficiency and the calculator steps against a pseudo-equilibrium curve (dashed), which gives the number of real trays directly. The reboiler is taken as one ideal stage. For packing, divide the theoretical stages in the column by the stages per metre, or multiply them by the HETP, from the packing supplier.</p>
  <h3>Equilibrium data</h3>
  <ul>
    <li><b>Two solvents, real mixture:</b> activity coefficients from modified UNIFAC (Dortmund) and Antoine vapour pressures, at your column pressure. This shows azeotropes such as ethanol–water and IPA–water.</li>
    <li><b>Two solvents, ideal:</b> Raoult's law. Good for similar molecules such as benzene and toluene; poor for water with solvents.</li>
    <li><b>Constant relative volatility:</b> quick textbook and exam problems.</li>
    <li><b>Your own data:</b> paste measured or published x-y points; the curve is drawn through them without overshoot.</li>
  </ul>
  <p>Compositions can be entered in wt % (for solvents) and the calculator converts them to mole fractions, which the method needs. Results also show the stage compositions back in wt %.</p>
  <div class="art-note"><b>Where the method stops</b><p>McCabe-Thiele assumes constant molar overflow: equal moles of vapour and liquid move up and down each section. It is good when the two latent heats per mole are close, and it is a design screen, not a rating. For mixtures with two liquid phases (such as toluene–water), large heat effects, or more than two components, use a rigorous simulation. Two-liquid regions are not split here.</p></div>
''',
  [('What is the McCabe-Thiele method used for?', 'It finds the number of theoretical stages, the minimum reflux and the best feed stage for a binary distillation column, by stepping between the equilibrium curve and the operating lines on an x-y diagram.'),
   ('How do you find the minimum reflux ratio?', 'Lower the reflux until an operating line touches the equilibrium curve. For an ideal mixture this happens where the q-line meets the curve: Rmin = (xD − y*)/(y* − x*). For non-ideal mixtures the touch can be a tangent higher up, so the whole curve must be checked.'),
   ('What is the q-line?', 'The q-line shows the feed condition. It starts at the feed composition on the diagonal with slope q/(q − 1): vertical for saturated liquid, horizontal for saturated vapour, and leaning right for a cold liquid feed.'),
   ('How many real trays do I need?', 'Divide the theoretical stages in the column by the overall tray efficiency, or step with a Murphree efficiency as this calculator does. Typical tray efficiencies are 50 to 80 %. Take the reboiler as one theoretical stage.'),
   ('Why can I not get pure ethanol from ethanol-water distillation?', 'Ethanol and water form an azeotrope near 89 mol % ethanol at atmospheric pressure, where vapour and liquid have the same composition. The steps cannot cross it, so ordinary distillation stops there.')],
  [('/articles/distillation-basics/', 'Distillation basics: VLE, relative volatility and stages'), ('/calculators/batch-distillation-simulator/', 'Batch distillation simulator'), ('/process-modelling/solvent-swap-simulator/', 'Solvent swap simulator'), ('/solvents/methanol/', 'Methanol properties'), ('/solvents/ethanol/', 'Ethanol properties')],
  ['batch-distill-engine.js', 'mccabe-engine.js', ('calc-mccabe.js', {'data-unifac': '/assets/data/unifac-do.json', 'data-sol': '/assets/data/solvent-lite.json'})],
  jump=[('how', 'How it works'), ('faq', 'FAQ')],
  keywords='McCabe Thiele calculator, McCabe Thiele method, theoretical stages calculator, minimum reflux ratio calculator, distillation column stages, q-line, Fenske equation, Gilliland correlation, feed stage location')
print('ok')
