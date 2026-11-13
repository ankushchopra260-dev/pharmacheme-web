#!/usr/bin/env python3
"""Builds articles/dimensionless-numbers/index.html (text, for search engines and readers) and the calculator config
assets/js/dimensionless-calc.js (one small calculator per number). Units follow the site: kcal, °C, cP."""
import json, html, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SUBJ = [('flow', 'Fluid flow'), ('part', 'Particles and separation'), ('heat', 'Heat transfer'), ('mass', 'Mass transfer'), ('mix', 'Mixing and agitation'), ('rxn', 'Reaction engineering')]

# id, symbol, name, subject, formula (HTML), ratio, meaning, regimes [(range, meaning)], uses [..], link (url, text) or None,
# calc: inputs [(k, label, unit, default)], js expression for value, js for reading -> [text, cls]
N = []
def n(**k): N.append(k)

# ---------------- fluid flow ----------------
n(id='re', sym='Re', name='Reynolds number', s='flow', f='Re = ρ·v·D / μ',
  ratio='Inertial forces ÷ viscous forces',
  mean='The single most used number in chemical engineering. It tells you whether a flow is smooth and layered (laminar) or chaotic and mixing (turbulent), and so which friction factor, heat transfer and mass transfer correlations apply.',
  reg=[('below 2,100', 'Laminar in a pipe: smooth layers, parabolic velocity profile, poor radial mixing'), ('2,100 to 4,000', 'Transition: unstable, avoid designing here'), ('above 4,000', 'Turbulent: flat profile, good mixing, friction depends on roughness')],
  uses=['Pipe and line sizing, and choosing the friction factor', 'Heat exchanger and jacket correlations', 'Flowmeter selection: orifice and vortex meters need turbulent flow', 'Viscous products: a thick slurry at low velocity is often laminar'],
  link=('/calculators/pipe-pressure-drop/', 'Pipe pressure drop calculator'),
  inp=[('rho', 'Density', 'kg/m³', 998), ('v', 'Velocity', 'm/s', 1.5), ('D', 'Pipe inside diameter', 'm', 0.05), ('mu', 'Viscosity', 'cP', 1.0)],
  js='v.rho*v.v*v.D/(v.mu/1000)', rd="x<2100?['Laminar flow','ok']:x<4000?['Transition: unstable, avoid','warn']:['Turbulent flow','ok']")
n(id='f', sym='f', name='Friction factor (Darcy and Fanning)', s='flow', f='ΔP = f<sub>D</sub>·(L/D)·ρv²/2, with f<sub>D</sub> = 4·f<sub>F</sub>',
  ratio='Wall shear stress ÷ kinetic energy of the flow',
  mean='Turns a pipe length into a pressure drop. Two conventions exist, and mixing them is a classic error: the Darcy factor is four times the Fanning factor. Laminar flow gives f<sub>D</sub> = 64/Re; in turbulent flow it depends on Re and the relative roughness ε/D.',
  reg=[('laminar', 'f<sub>D</sub> = 64/Re, roughness does not matter'), ('turbulent, smooth pipe', 'f<sub>D</sub> about 0.015 to 0.025 for usual plant flows'), ('fully rough', 'f<sub>D</sub> depends only on ε/D; old or corroded pipe can double it')],
  uses=['Pressure drop in lines and headers', 'Pump head and NPSH checks', 'Relief valve inlet and outlet losses'],
  link=('/calculators/pipe-pressure-drop/', 'Pipe pressure drop calculator'),
  inp=[('rho', 'Density', 'kg/m³', 998), ('v', 'Velocity', 'm/s', 1.5), ('D', 'Pipe inside diameter', 'm', 0.05), ('mu', 'Viscosity', 'cP', 1.0), ('e', 'Roughness ε', 'mm', 0.045)],
  js='(function(){var Re=v.rho*v.v*v.D/(v.mu/1000),r=v.e/1000/v.D,A=Math.pow(-2.457*Math.log(Math.pow(7/Re,0.9)+0.27*r),16),B=Math.pow(37530/Re,16);return 8*Math.pow(Math.pow(8/Re,12)+1/Math.pow(A+B,1.5),1/12);})()',
  rd="['Darcy f = '+G(x)+', Fanning f = '+G(x/4)+'. Pressure drop '+G(x*(1/v.D)*v.rho*v.v*v.v/2/1000)+' kPa per metre (Churchill equation)','ok']")
n(id='fr', sym='Fr', name='Froude number', s='flow', f='Fr = v / √(g·L)   (sometimes defined as v²/(g·L))',
  ratio='Inertial forces ÷ gravity forces',
  mean='Governs flows with a free surface, where gravity shapes the liquid: open channels, partly full pipes, waves, and vortices in stirred tanks. Check which definition a correlation uses: one is the square of the other.',
  reg=[('below 0.31 (v/√gD)', 'Gravity drain line runs self-venting: gas escapes back up the line, no gulping or surging'), ('0.31 to 1', 'Drain line may surge and carry gas down; size the line larger'), ('above 1', 'Supercritical flow in channels; jets and hydraulic jumps')],
  uses=['Sizing gravity drain and overflow lines from vessels and columns', 'Vortex formation in unbaffled agitated tanks', 'Hydraulic models of channels and spillways'],
  link=None,
  inp=[('v', 'Liquid velocity (full-pipe basis)', 'm/s', 0.3), ('D', 'Pipe inside diameter', 'm', 0.08)],
  js='v.v/Math.sqrt(9.81*v.D)', rd="x<0.31?['Self-venting gravity flow (Simpson criterion Fr < 0.31)','ok']:['Not self-venting: expect surging and gas carry-under in a gravity drain','warn']")
n(id='eu', sym='Eu', name='Euler number', s='flow', f='Eu = ΔP / (ρ·v²)',
  ratio='Pressure forces ÷ inertial forces',
  mean='A pressure loss expressed in velocity heads. Fitting loss coefficients (K values), orifice and valve coefficients are Euler numbers in disguise: K = 2·Eu.',
  reg=[('constant', 'In turbulent flow through fittings and orifices the Euler number is nearly constant, so ΔP rises with v²')],
  uses=['Loss coefficients for valves, bends, tees and strainers', 'Orifice and nozzle sizing', 'Scaling pressure drop with flow: double the flow, four times the ΔP'],
  link=('/calculators/control-valve-sizing/', 'Control valve sizing'),
  inp=[('dp', 'Pressure drop', 'kPa', 20), ('rho', 'Density', 'kg/m³', 998), ('v', 'Velocity', 'm/s', 2)],
  js='v.dp*1000/(v.rho*v.v*v.v)', rd="['Equivalent loss coefficient K = 2·Eu = '+G(2*x)+' velocity heads','ok']")
n(id='we', sym='We', name='Weber number', s='flow', f='We = ρ·v²·L / σ',
  ratio='Inertial forces ÷ surface tension forces',
  mean='Decides whether drops and bubbles break up. High We means the flow can tear a drop apart; low We means surface tension holds it together. In stirred vessels the drop size in a liquid–liquid dispersion falls as the impeller Weber number rises, roughly d/D ∝ We<sup>−0.6</sup>.',
  reg=[('below about 1', 'Surface tension dominates: drops and bubbles stay whole'), ('about 12', 'Critical value for a drop breaking up in a gas stream'), ('well above 12', 'Atomisation: sprays, mist formation')],
  uses=['Liquid–liquid extraction and dispersion in reactors', 'Spray nozzles, scrubbers and atomisers', 'Mist carry-over from vessels'],
  link=None,
  inp=[('rho', 'Density of the continuous phase', 'kg/m³', 1.2), ('v', 'Relative velocity', 'm/s', 30), ('L', 'Drop diameter', 'mm', 1), ('sig', 'Surface tension', 'mN/m', 72)],
  js='v.rho*v.v*v.v*(v.L/1000)/(v.sig/1000)', rd="x<1?['Surface tension holds the drop together','ok']:x<12?['Drop deforms but should not break','ok']:['Above the critical value (~12): the drop breaks up','warn']")
n(id='ca', sym='Ca', name='Capillary number', s='flow', f='Ca = μ·v / σ',
  ratio='Viscous forces ÷ surface tension forces',
  mean='Matters where liquids flow through narrow gaps or pores, or coat surfaces. At low Ca surface tension controls: liquid is held in pores and films stay thin.',
  reg=[('below about 10<sup>−5</sup>', 'Capillary forces dominate: liquid trapped in pores and cake'), ('10<sup>−5</sup> to 10<sup>−3</sup>', 'Mixed'), ('above 10<sup>−3</sup>', 'Viscous forces start to move trapped liquid')],
  uses=['Draining and deliquoring filter cakes', 'Wetting and coating', 'Flow in packed beds and porous media'],
  link=('/calculators/filtration-calculator/', 'Filtration calculator'),
  inp=[('mu', 'Viscosity', 'cP', 1), ('v', 'Velocity', 'm/s', 0.001), ('sig', 'Surface tension', 'mN/m', 72)],
  js='(v.mu/1000)*v.v/(v.sig/1000)', rd="x<1e-5?['Capillary forces dominate','ok']:x<1e-3?['Mixed capillary and viscous control','ok']:['Viscous forces dominate','ok']")
n(id='bo', sym='Bo', name='Bond number (Eötvös number)', s='flow', f='Bo = Δρ·g·L² / σ',
  ratio='Gravity forces ÷ surface tension forces',
  mean='Decides the shape of drops and bubbles and whether gravity or surface tension wins. Below Bo ≈ 1 surface tension holds drops round and liquid clings in small tubes; above it, gravity flattens drops and drains liquid.',
  reg=[('below 1', 'Surface tension wins: round drops, liquid held in small tubes'), ('above 1', 'Gravity wins: flattened drops, liquid drains')],
  uses=['Drop and bubble size in settlers and sparged reactors', 'Why small-bore lines hold liquid slugs', 'Liquid hold-up in packing'],
  link=None,
  inp=[('drho', 'Density difference', 'kg/m³', 997), ('L', 'Size (drop or tube)', 'mm', 3), ('sig', 'Surface tension', 'mN/m', 72)],
  js='v.drho*9.81*Math.pow(v.L/1000,2)/(v.sig/1000)', rd="x<1?['Surface tension dominates','ok']:['Gravity dominates','ok']")
n(id='ma', sym='Ma', name='Mach number', s='flow', f='Ma = v / c, with c = √(γ·R·T / M)',
  ratio='Flow velocity ÷ speed of sound',
  mean='Tells you whether gas compressibility matters. Below about 0.3 a gas can be treated as incompressible. Near Ma = 1 the flow chokes: no more mass can pass however low the downstream pressure.',
  reg=[('below 0.3', 'Compressibility negligible: liquid-style pressure drop methods are fine'), ('0.3 to about 0.7', 'Use compressible-flow methods; many flare and vent headers are limited to this range'), ('approaching 1', 'Choked flow: noise, vibration and high back pressure')],
  uses=['Relief valve tailpipes and flare headers', 'High-velocity gas and steam lines', 'Vent and blowdown sizing'],
  link=('/calculators/relief-valve-sizing/', 'Relief valve sizing'),
  inp=[('v', 'Gas velocity', 'm/s', 60), ('T', 'Temperature', '°C', 40), ('M', 'Molar mass', 'g/mol', 28), ('g', 'Heat capacity ratio γ', '', 1.4)],
  js='v.v/Math.sqrt(v.g*8.314*(v.T+273.15)/(v.M/1000))', rd="['Speed of sound '+F(Math.sqrt(v.g*8.314*(v.T+273.15)/(v.M/1000)),0)+' m/s. '+(x<0.3?'Incompressible treatment is fine.':x<0.7?'Use compressible-flow methods.':'Close to choking: check noise, vibration and back pressure.'),x<0.7?'ok':'warn']")

# ---------------- particles ----------------
n(id='rep', sym='Re<sub>p</sub>', name='Particle Reynolds number', s='part', f='Re<sub>p</sub> = ρ<sub>f</sub>·v·d / μ',
  ratio='Inertial ÷ viscous forces around a particle',
  mean='The Reynolds number based on particle size and the velocity of the particle relative to the fluid. It sets the drag law, and so how fast particles settle or how easily they are carried.',
  reg=[('below 0.3', 'Stokes regime: drag coefficient C<sub>D</sub> = 24/Re<sub>p</sub>, settling velocity ∝ d²'), ('0.3 to 1,000', 'Intermediate regime'), ('1,000 to 2×10<sup>5</sup>', 'Newton regime: C<sub>D</sub> ≈ 0.44, settling velocity ∝ √d')],
  uses=['Settling in decanters, thickeners and knock-out pots', 'Fluidised beds and pneumatic conveying', 'Crystal suspension in agitated vessels'],
  link=('/calculators/knock-out-pot-sizing/', 'Knock-out pot sizing'),
  inp=[('rho', 'Fluid density', 'kg/m³', 998), ('v', 'Relative velocity', 'm/s', 0.002), ('d', 'Particle diameter', 'µm', 100), ('mu', 'Fluid viscosity', 'cP', 1)],
  js='v.rho*v.v*(v.d*1e-6)/(v.mu/1000)', rd="x<0.3?['Stokes regime: C_D = 24/Re = '+G(24/x),'ok']:x<1000?['Intermediate regime','ok']:['Newton regime: C_D about 0.44','ok']")
n(id='ar', sym='Ar', name='Archimedes number', s='part', f='Ar = g·d³·ρ<sub>f</sub>·(ρ<sub>p</sub> − ρ<sub>f</sub>) / μ²',
  ratio='Gravity (buoyancy-corrected) ÷ viscous forces',
  mean='Uses only fluid and particle properties, not the velocity, so it gives the settling velocity directly without trial and error. Also used for the minimum fluidisation velocity and bubble rise.',
  reg=[('below 3.6', 'Stokes regime: Re<sub>p</sub> = Ar/18'), ('3.6 to 10<sup>5</sup>', 'Intermediate: Re<sub>p</sub> ≈ 0.153·Ar<sup>0.714</sup>'), ('above 10<sup>5</sup>', 'Newton regime: Re<sub>p</sub> ≈ 1.74·Ar<sup>0.5</sup>')],
  uses=['Terminal settling velocity of crystals, catalyst and droplets', 'Minimum fluidisation velocity', 'Checking whether a decanter or thickener can separate a solid'],
  link=('/calculators/knock-out-pot-sizing/', 'Knock-out pot sizing'),
  inp=[('d', 'Particle diameter', 'µm', 100), ('rp', 'Particle density', 'kg/m³', 1500), ('rf', 'Fluid density', 'kg/m³', 998), ('mu', 'Fluid viscosity', 'cP', 1)],
  js='9.81*Math.pow(v.d*1e-6,3)*v.rf*(v.rp-v.rf)/Math.pow(v.mu/1000,2)',
  rd="(function(){if(!(x>0))return['The particle must be denser than the fluid to settle','warn'];var re=x<3.6?x/18:x<1e5?0.153*Math.pow(x,0.714):1.74*Math.sqrt(x),vt=re*(v.mu/1000)/(v.rf*v.d*1e-6);return['Settling velocity about '+G(vt*1000)+' mm/s ('+G(vt*3600)+' m/h), Re_p = '+G(re),'ok'];})()")
n(id='stk', sym='Stk', name='Stokes number', s='part', f='Stk = ρ<sub>p</sub>·d²·v / (18·μ·L)',
  ratio='Particle stopping distance ÷ obstacle size',
  mean='Tells you whether a particle or droplet follows the gas around an obstacle or crashes into it. That is how demisters, cyclones and impactors catch droplets and dust.',
  reg=[('below 0.1', 'Particles follow the flow: poor capture'), ('about 1', 'Partial capture'), ('above 1', 'Particles hit the obstacle: good capture by impaction')],
  uses=['Wire-mesh and vane demisters', 'Cyclones and impingement separators', 'Dust and mist sampling'],
  link=('/calculators/knock-out-pot-sizing/', 'Knock-out pot sizing'),
  inp=[('rp', 'Particle or droplet density', 'kg/m³', 1000), ('d', 'Particle diameter', 'µm', 10), ('v', 'Gas velocity', 'm/s', 3), ('mu', 'Gas viscosity', 'cP', 0.018), ('L', 'Obstacle size (wire diameter)', 'mm', 0.28)],
  js='v.rp*Math.pow(v.d*1e-6,2)*v.v/(18*(v.mu/1000)*(v.L/1000))', rd="x<0.1?['Droplets follow the gas: poor capture on this obstacle','warn']:x<1?['Partial capture','ok']:['Good capture by impaction','ok']")

# ---------------- heat transfer ----------------
n(id='nu', sym='Nu', name='Nusselt number', s='heat', f='Nu = h·L / k',
  ratio='Convective heat transfer ÷ conductive heat transfer across the fluid',
  mean='The dimensionless heat transfer coefficient. Correlations give Nu from Re and Pr, and you get h back as h = Nu·k/L. For turbulent flow in tubes, Dittus–Boelter gives Nu = 0.023·Re<sup>0.8</sup>·Pr<sup>0.4</sup> (heating).',
  reg=[('3.66', 'Laminar, fully developed flow in a tube with constant wall temperature'), ('tens to hundreds', 'Turbulent flow in exchangers and jackets'), ('Nu = 0.023·Re<sup>0.8</sup>·Pr<sup>n</sup>', 'Dittus–Boelter: Re above 10,000, Pr 0.7 to 160; n = 0.4 heating, 0.3 cooling')],
  uses=['Film coefficients in exchangers, jackets and coils', 'Comparing heat transfer at lab and plant scale', 'Checking a vendor U value'],
  link=('/calculators/jacketed-vessel-heat-transfer/', 'Jacketed vessel heat transfer'),
  inp=[('Re', 'Reynolds number', '', 50000), ('Pr', 'Prandtl number', '', 7), ('k', 'Fluid conductivity', 'kcal/h·m·°C', 0.52), ('D', 'Tube inside diameter', 'm', 0.025)],
  js='0.023*Math.pow(v.Re,0.8)*Math.pow(v.Pr,0.4)', rd="['Film coefficient h = Nu·k/D = '+F(x*v.k/v.D,0)+' kcal/h·m²·°C (Dittus–Boelter, heating)'+(v.Re<10000?'. Re is below 10,000: the correlation is not valid here.':''),v.Re<10000?'warn':'ok']")
n(id='pr', sym='Pr', name='Prandtl number', s='heat', f='Pr = c<sub>p</sub>·μ / k',
  ratio='Momentum diffusivity ÷ thermal diffusivity',
  mean='A property of the fluid alone. It compares how fast momentum and heat spread. High Pr fluids (oils, thick organics) have a thin thermal boundary layer buried in the velocity layer, so their heat transfer is poor and depends strongly on viscosity.',
  reg=[('about 0.7', 'Gases'), ('about 7 at 20 °C, 2 at 90 °C', 'Water'), ('100 to 10,000', 'Oils, glycols and viscous organics'), ('below 0.05', 'Liquid metals')],
  uses=['Every forced and natural convection correlation', 'Explaining why a viscous batch heats so slowly', 'Thermal fluid (hot oil) system design'],
  link=('/calculators/overall-heat-transfer-coefficient-calculator/', 'Overall heat transfer coefficient'),
  inp=[('cp', 'Specific heat', 'kcal/kg·°C', 1.0), ('mu', 'Viscosity', 'cP', 1.0), ('k', 'Thermal conductivity', 'kcal/h·m·°C', 0.515)],
  js='v.cp*4186.8*(v.mu/1000)/(v.k*1.163)', rd="x<1?['Gas-like: heat spreads faster than momentum','ok']:x<20?['Water-like liquid','ok']:['Viscous liquid: thin thermal layer, poor heat transfer','warn']")
n(id='gr', sym='Gr', name='Grashof number', s='heat', f='Gr = g·β·ΔT·L³ / ν²',
  ratio='Buoyancy forces ÷ viscous forces',
  mean='The natural-convection counterpart of Reynolds. Warm fluid rises because it is lighter; Gr measures how strongly that drives flow. Comparing Gr with Re² tells you whether natural or forced convection controls.',
  reg=[('Gr/Re² well below 1', 'Forced convection controls'), ('Gr/Re² about 1', 'Mixed convection'), ('Gr/Re² well above 1', 'Natural convection controls')],
  uses=['Heat loss from tanks, pipes and vessels without stirring', 'Cooling of a batch with the agitator stopped', 'Storage tank stratification'],
  link=('/calculators/insulation-heat-loss/', 'Insulation heat loss'),
  inp=[('beta', 'Expansion coefficient β', '1/K', 0.00021), ('dT', 'Temperature difference', '°C', 20), ('L', 'Height of the surface', 'm', 1), ('nu', 'Kinematic viscosity', 'mm²/s', 1.0)],
  js='9.81*v.beta*v.dT*Math.pow(v.L,3)/Math.pow(v.nu*1e-6,2)', rd="['Gr = '+x.toExponential(2)+'. Multiply by Pr for the Rayleigh number.','ok']")
n(id='ra', sym='Ra', name='Rayleigh number', s='heat', f='Ra = Gr·Pr = g·β·ΔT·L³ / (ν·α)',
  ratio='Buoyancy ÷ (viscous × thermal diffusion)',
  mean='Sets the natural convection regime and the Nusselt number for free convection. For a vertical surface the boundary layer turns turbulent near Ra = 10<sup>9</sup>.',
  reg=[('below 10<sup>9</sup> (vertical plate)', 'Laminar natural convection: Nu ≈ 0.59·Ra<sup>1/4</sup>'), ('above 10<sup>9</sup>', 'Turbulent natural convection: Nu ≈ 0.10·Ra<sup>1/3</sup>')],
  uses=['Heat loss from vessel walls and hot pipes', 'Cooling of an unstirred batch or a drum', 'Air-side heat transfer on insulated surfaces'],
  link=('/calculators/insulation-heat-loss/', 'Insulation heat loss'),
  inp=[('beta', 'Expansion coefficient β', '1/K', 0.0034), ('dT', 'Surface minus fluid temperature', '°C', 30), ('L', 'Height of the surface', 'm', 2), ('nu', 'Kinematic viscosity', 'mm²/s', 16), ('Pr', 'Prandtl number', '', 0.71)],
  js='9.81*v.beta*v.dT*Math.pow(v.L,3)/Math.pow(v.nu*1e-6,2)*v.Pr', rd="[(x<1e9?'Laminar natural convection, Nu ≈ '+F(0.59*Math.pow(x,0.25),0):'Turbulent natural convection, Nu ≈ '+F(0.1*Math.pow(x,1/3),0))+' (vertical surface)','ok']")
n(id='bi', sym='Bi', name='Biot number', s='heat', f='Bi = h·L / k<sub>solid</sub>, L = volume ÷ surface area',
  ratio='Resistance inside the solid ÷ resistance at its surface',
  mean='Tells you whether a solid heats evenly or with a big temperature difference between surface and centre. Below 0.1 the inside is nearly uniform and simple lumped calculations work.',
  reg=[('below 0.1', 'Lumped: the solid is at one temperature throughout'), ('0.1 to 10', 'Both resistances matter'), ('above 10', 'Inside conduction controls: the surface reaches the fluid temperature quickly, the centre lags')],
  uses=['Heating and cooling drums, bags and blocks of product', 'Thawing frozen material', 'Fire exposure of vessel walls and structural steel'],
  link=None,
  inp=[('h', 'Surface coefficient', 'kcal/h·m²·°C', 10), ('L', 'Volume ÷ surface area', 'm', 0.05), ('k', 'Conductivity of the solid', 'kcal/h·m·°C', 0.2)],
  js='v.h*v.L/v.k', rd="x<0.1?['Lumped: uniform temperature inside','ok']:x<10?['Surface and internal resistance both matter','ok']:['Internal conduction controls: expect a large centre-to-surface difference','warn']")
n(id='fo', sym='Fo', name='Fourier number', s='heat', f='Fo = α·t / L², α = k / (ρ·c<sub>p</sub>)',
  ratio='Heat conducted in time t ÷ heat stored',
  mean='Dimensionless time for transient conduction. Heat penetrates about √(α·t), so Fo compares that depth with the size of the object. Charts of centre temperature against Fo and Bi solve most heating and cooling-of-solids problems.',
  reg=[('below 0.05', 'Heat has barely reached the centre'), ('about 0.2 and above', 'The centre is responding; one-term series solutions are accurate'), ('above 1', 'Close to steady state')],
  uses=['Time to heat or cool a drum, block or tray of product', 'Dryer and freezer design', 'How long a vessel wall takes to warm in a fire'],
  link=None,
  inp=[('k', 'Conductivity', 'kcal/h·m·°C', 0.2), ('rho', 'Density', 'kg/m³', 1100), ('cp', 'Specific heat', 'kcal/kg·°C', 0.5), ('t', 'Time', 'h', 12), ('L', 'Half-thickness or radius', 'm', 0.15)],
  js='(v.k/(v.rho*v.cp))*v.t/(v.L*v.L)', rd="x<0.05?['The centre has hardly started to change','warn']:x<1?['Transient: use Bi–Fo charts for the centre temperature','ok']:['Close to steady state','ok']")
n(id='pe', sym='Pe', name='Péclet number (heat)', s='heat', f='Pe = v·L / α = Re·Pr',
  ratio='Heat carried by flow ÷ heat conducted',
  mean='When Pe is large, heat moves with the fluid and conduction along the flow can be ignored. In laminar flow in tubes this sets the length of the thermal entrance region.',
  reg=[('below 1', 'Conduction controls'), ('well above 100', 'Heat is carried by the flow; axial conduction negligible')],
  uses=['Laminar heat exchangers and long thin channels', 'Micro-reactors and flow chemistry', 'Packed and porous beds'],
  link=None,
  inp=[('Re', 'Reynolds number', '', 1000), ('Pr', 'Prandtl number', '', 50)],
  js='v.Re*v.Pr', rd="x<1?['Conduction controls','ok']:x<100?['Both matter','ok']:['Heat carried by the flow','ok']")
n(id='gz', sym='Gz', name='Graetz number', s='heat', f='Gz = Re·Pr·D / L',
  ratio='Heat carried along the tube ÷ heat conducted to the wall',
  mean='Used for laminar flow in tubes. A high Graetz number means a short tube compared with the thermal entrance length: the boundary layer is still thin, so heat transfer is higher than the fully developed value.',
  reg=[('below about 10', 'Thermally developed: Nu tends to 3.66'), ('above about 10', 'Entrance effects: Sieder–Tate Nu = 1.86·Gz<sup>1/3</sup>·(μ/μ<sub>w</sub>)<sup>0.14</sup>')],
  uses=['Laminar heating of viscous products in tubes and coils', 'Hot oil and glycol exchangers', 'Scale-up of continuous flow reactors'],
  link=None,
  inp=[('Re', 'Reynolds number', '', 800), ('Pr', 'Prandtl number', '', 100), ('D', 'Tube diameter', 'm', 0.02), ('L', 'Tube length', 'm', 6)],
  js='v.Re*v.Pr*v.D/v.L', rd="x<10?['Thermally developed: Nu about 3.66','ok']:['Entrance region: Nu ≈ 1.86·Gz^(1/3) = '+F(1.86*Math.pow(x,1/3),1)+' (wall viscosity correction ignored)','ok']")
n(id='st', sym='St', name='Stanton number and Colburn j-factor', s='heat', f='St = h / (ρ·v·c<sub>p</sub>) = Nu / (Re·Pr);   j<sub>H</sub> = St·Pr<sup>2/3</sup>',
  ratio='Heat transferred to the wall ÷ heat carried by the flow',
  mean='Links heat transfer to friction. The Colburn analogy, j<sub>H</sub> ≈ f<sub>Fanning</sub>/2, lets you estimate a heat transfer coefficient from a measured pressure drop, and explains why better heat transfer usually costs pressure drop.',
  reg=[('j<sub>H</sub> ≈ f<sub>F</sub>/2', 'Colburn analogy, turbulent flow, no form drag')],
  uses=['Compact and plate exchanger data, which are given as j and f curves', 'Estimating h from pressure drop', 'Trade-off between heat transfer and pumping power'],
  link=None,
  inp=[('Nu', 'Nusselt number', '', 300), ('Re', 'Reynolds number', '', 50000), ('Pr', 'Prandtl number', '', 7)],
  js='v.Nu/(v.Re*v.Pr)', rd="['Colburn j_H = St·Pr^(2/3) = '+G(x*Math.pow(v.Pr,2/3))+'; by the analogy, Fanning f ≈ '+G(2*x*Math.pow(v.Pr,2/3)),'ok']")

# ---------------- mass transfer ----------------
n(id='sh', sym='Sh', name='Sherwood number', s='mass', f='Sh = k<sub>c</sub>·L / D',
  ratio='Convective mass transfer ÷ diffusive mass transfer',
  mean='The mass transfer twin of Nusselt. Correlations give Sh from Re and Sc, in the same form as Nu from Re and Pr. That is why heat and mass transfer correlations can often be swapped by replacing Nu with Sh and Pr with Sc.',
  reg=[('2', 'A single sphere in still fluid: the diffusion limit'), ('Sh = 2 + 0.6·Re<sup>1/2</sup>·Sc<sup>1/3</sup>', 'Ranz–Marshall for spheres, drops and bubbles')],
  uses=['Dissolution of solids and crystals', 'Mass transfer to drops and bubbles', 'Catalyst particles in slurry reactors'],
  link=('/articles/gas-liquid-mass-transfer-kla/', 'Gas–liquid mass transfer and kLa'),
  inp=[('Re', 'Particle Reynolds number', '', 50), ('Sc', 'Schmidt number', '', 1000), ('D', 'Diffusivity', '×10⁻⁹ m²/s', 1), ('d', 'Particle diameter', 'µm', 200)],
  js='2+0.6*Math.sqrt(v.Re)*Math.pow(v.Sc,1/3)', rd="['Mass transfer coefficient k = Sh·D/d = '+G(x*v.D*1e-9/(v.d*1e-6)*1000)+' mm/s (Ranz–Marshall)','ok']")
n(id='sc', sym='Sc', name='Schmidt number', s='mass', f='Sc = μ / (ρ·D)',
  ratio='Momentum diffusivity ÷ mass diffusivity',
  mean='The mass transfer twin of Prandtl, and a property of the fluid and solute only. Liquids have Sc around 1,000 because molecules diffuse far more slowly than momentum spreads, which is why liquid-side mass transfer is so often the bottleneck.',
  reg=[('0.5 to 2', 'Gases'), ('500 to 2,000', 'Small molecules in water and thin solvents'), ('above 10,000', 'Viscous liquids, large molecules')],
  uses=['Mass transfer correlations', 'Explaining why gas absorption into a liquid is liquid-film controlled', 'Scaling dissolution and extraction'],
  link=('/articles/gas-liquid-mass-transfer-kla/', 'Gas–liquid mass transfer and kLa'),
  inp=[('mu', 'Viscosity', 'cP', 1), ('rho', 'Density', 'kg/m³', 998), ('D', 'Diffusivity', '×10⁻⁹ m²/s', 1)],
  js='(v.mu/1000)/(v.rho*v.D*1e-9)', rd="x<5?['Gas-like','ok']:x<5000?['Typical liquid','ok']:['Viscous liquid: slow diffusion','warn']")
n(id='pem', sym='Pe<sub>m</sub>', name='Péclet number (mass)', s='mass', f='Pe = v·L / D = Re·Sc',
  ratio='Mass carried by flow ÷ mass diffusing',
  mean='Large Péclet numbers mean diffusion cannot even out concentration along the flow. In narrow channels and micro-reactors it tells you whether two streams will mix by diffusion before they leave.',
  reg=[('below 1', 'Diffusion evens out concentration'), ('well above 1', 'Concentration differences are carried with the flow')],
  uses=['Micro-mixers and flow chemistry', 'Chromatography and packed beds', 'Membrane processes'],
  link=('/articles/continuous-flow-chemistry/', 'Continuous flow chemistry'),
  inp=[('v', 'Velocity', 'm/s', 0.01), ('L', 'Length (channel width)', 'mm', 1), ('D', 'Diffusivity', '×10⁻⁹ m²/s', 1)],
  js='v.v*(v.L/1000)/(v.D*1e-9)', rd="['Diffusion across '+F(v.L,1)+' mm takes about '+G(Math.pow(v.L/1000,2)/(v.D*1e-9))+' s; '+(x>1?'flow is faster, so diffusion alone will not mix this channel.':'diffusion keeps up with the flow.'),x>1?'warn':'ok']")
n(id='le', sym='Le', name='Lewis number', s='mass', f='Le = α / D = Sc / Pr',
  ratio='Thermal diffusivity ÷ mass diffusivity',
  mean='Matters when heat and mass transfer happen together, as in drying, humidification and cooling towers. For air and water vapour Le is about 0.85, close enough to 1 that the wet-bulb temperature is nearly the adiabatic saturation temperature, which makes psychrometric charts simple.',
  reg=[('about 0.85', 'Air and water vapour'), ('much greater than 1', 'Organic vapours in air: wet-bulb and adiabatic saturation temperatures differ')],
  uses=['Dryer design and wet-bulb temperature', 'Cooling towers and humidifiers', 'Evaporation of solvents into gas streams'],
  link=None,
  inp=[('Sc', 'Schmidt number', '', 0.6), ('Pr', 'Prandtl number', '', 0.71)],
  js='v.Sc/v.Pr', rd="Math.abs(x-1)<0.25?['Close to 1: heat and mass transfer behave alike (air–water)','ok']:['Far from 1: heat and mass transfer behave differently; correct the wet-bulb temperature','warn']")
n(id='ha', sym='Ha', name='Hatta number', s='mass', f='Ha = √(k<sub>1</sub>·D) / k<sub>L</sub>   (first-order reaction)',
  ratio='Reaction in the liquid film ÷ diffusion through the film',
  mean='Decides where a gas–liquid reaction happens. A slow reaction takes place in the bulk liquid, so you need liquid volume. A fast reaction takes place in the film at the interface, so you need interfacial area, and the reaction speeds up absorption by an enhancement factor about equal to Ha.',
  reg=[('below 0.3', 'Slow: reaction in the bulk; the bulk volume and k<sub>L</sub>a matter'), ('0.3 to 3', 'Intermediate'), ('above 3', 'Fast: reaction in the film; interfacial area matters, absorption enhanced about Ha times')],
  uses=['Gas scrubbing with reactive solutions', 'Hydrogenation, oxidation and chlorination', 'Choosing between a bubble column, packed column and stirred tank'],
  link=('/calculators/packed-scrubber-calculator/', 'Packed scrubber calculator'),
  inp=[('k1', 'First-order rate constant', '1/s', 10), ('D', 'Diffusivity of the gas in the liquid', '×10⁻⁹ m²/s', 2), ('kL', 'Liquid-side coefficient', '×10⁻⁴ m/s', 2)],
  js='Math.sqrt(v.k1*v.D*1e-9)/(v.kL*1e-4)', rd="x<0.3?['Slow reaction in the bulk: provide liquid volume and kLa','ok']:x<3?['Intermediate regime','ok']:['Fast reaction in the film: absorption enhanced about '+F(x,1)+' times; provide interfacial area','ok']")

# ---------------- mixing ----------------
n(id='rei', sym='Re<sub>i</sub>', name='Impeller Reynolds number', s='mix', f='Re = ρ·N·D² / μ   (N in rev/s, D = impeller diameter)',
  ratio='Inertial ÷ viscous forces at the impeller',
  mean='Sets the mixing regime in a stirred vessel. In turbulent flow the power number is constant and baffles matter; in laminar flow the power draw is proportional to viscosity and close-clearance impellers are needed.',
  reg=[('below 10', 'Laminar: use anchors, helical ribbons; power ∝ μ·N²·D³'), ('10 to 10,000', 'Transitional'), ('above 10,000', 'Turbulent: constant power number, baffles needed')],
  uses=['Choosing the impeller type', 'Power and blend time correlations', 'Scale-up of reactors and crystallisers'],
  link=('/calculators/mixing-scale-up-calculator/', 'Mixing scale-up calculator'),
  inp=[('rho', 'Density', 'kg/m³', 1000), ('N', 'Speed', 'rpm', 90), ('D', 'Impeller diameter', 'm', 0.8), ('mu', 'Viscosity', 'cP', 1)],
  js='v.rho*(v.N/60)*v.D*v.D/(v.mu/1000)', rd="x<10?['Laminar: a turbine will not mix this well; use a close-clearance impeller','warn']:x<10000?['Transitional','ok']:['Turbulent','ok']")
n(id='np', sym='N<sub>p</sub>', name='Power number', s='mix', f='N<sub>p</sub> = P / (ρ·N³·D⁵)',
  ratio='Drag on the impeller ÷ inertial forces',
  mean='Each impeller type has its own power number, nearly constant in turbulent flow. Shaft power then follows from P = N<sub>p</sub>·ρ·N³·D⁵: double the speed and the power rises eight times. Working backwards from a measured power tells you what the impeller is really doing, which is useful when the drawing does not match the vessel.',
  reg=[('about 5', 'Rushton disc turbine'), ('about 1.3', 'Pitched blade turbine, 45°'), ('about 0.3', 'Hydrofoil'), ('about 0.35', 'Retreat curve (glass-lined, one baffle)')],
  uses=['Motor and gearbox sizing', 'Power per volume for scale-up', 'Comparing impellers'],
  link=('/calculators/agitator-simulator/', 'Agitator simulator'),
  inp=[('P', 'Measured shaft power', 'kW', 1.5), ('rho', 'Density', 'kg/m³', 1000), ('N', 'Speed', 'rpm', 90), ('D', 'Impeller diameter', 'm', 0.8), ('V', 'Liquid volume', 'm³', 6)],
  js='v.P*1000/(v.rho*Math.pow(v.N/60,3)*Math.pow(v.D,5))', rd="[(x>3.5?'Close to a Rushton turbine (about 5). ':x>0.9?'Close to a pitched blade turbine (about 1.3). ':'Close to a hydrofoil or retreat curve (0.3 to 0.4). ')+'Power per volume '+G(v.P/v.V)+' kW/m³: '+(v.P/v.V<0.1?'gentle blending.':v.P/v.V<0.5?'normal blending.':v.P/v.V<1.5?'solids suspension and reactions.':v.P/v.V<3?'gas dispersion.':'very high for a batch reactor.')+' Use measured power net of no-load losses.','ok']")
n(id='nq', sym='N<sub>q</sub>', name='Flow (pumping) number', s='mix', f='N<sub>q</sub> = Q / (N·D³)',
  ratio='Liquid pumped by the impeller ÷ impeller swept volume per revolution',
  mean='How much liquid the impeller pushes out per revolution. With the vessel volume it gives the turnover time, a quick measure of how often the whole batch passes through the impeller.',
  reg=[('about 0.5 to 0.8', 'Turbines and hydrofoils in turbulent flow')],
  uses=['Turnover time and circulation', 'Comparing axial and radial impellers', 'Heat transfer and feed dispersion checks'],
  link=('/calculators/agitator-simulator/', 'Agitator simulator'),
  inp=[('Q', 'Pumping rate (from CFD, vendor or test)', 'm³/h', 2200), ('N', 'Speed', 'rpm', 90), ('D', 'Impeller diameter', 'm', 0.8), ('V', 'Liquid volume', 'm³', 6)],
  js='(v.Q/3600)/((v.N/60)*Math.pow(v.D,3))', rd="[(x>0.6?'Typical of a good turbine or hydrofoil. ':x>0.3?'Low for a turbine. ':'Very low: check the figures. ')+'The batch passes through the impeller every '+G(v.V/v.Q*3600)+' s','ok']")
n(id='fri', sym='Fr<sub>i</sub>', name='Impeller Froude number', s='mix', f='Fr = N²·D / g',
  ratio='Inertial (centrifugal) forces ÷ gravity at the impeller',
  mean='Controls the surface vortex. In an unbaffled vessel the vortex deepens as Fr rises and can reach the impeller, drawing in gas. Baffles break the swirl, so in baffled vessels Fr matters mainly for surface aeration and for drawing down floating solids.',
  reg=[('low', 'Flat surface'), ('rising', 'Deeper vortex in unbaffled vessels, surface aeration in baffled ones')],
  uses=['Unbaffled and glass-lined vessels with one baffle', 'Drawing down floating powders', 'Avoiding air entrainment'],
  link=('/articles/agitator-design/', 'Agitator design'),
  inp=[('N', 'Speed', 'rpm', 90), ('D', 'Impeller diameter', 'm', 0.8)],
  js='Math.pow(v.N/60,2)*v.D/9.81', rd="['Fr = '+G(x)+'. Keep it the same at scale-up only when the free surface or vortex is what matters.','ok']")
n(id='nth', sym='Nθ', name='Blend time number', s='mix', f='N·θ<sub>95</sub> = 5.2 / (N<sub>p</sub><sup>1/3</sup>·(D/T)²)   (turbulent, H = T)',
  ratio='Blend time ÷ time for one impeller revolution',
  mean='In turbulent flow the number of impeller revolutions needed to blend to 95 % uniformity is constant for a given geometry. That gives the blend time directly, and shows why blend time rises on scale-up at equal power per volume.',
  reg=[('constant in turbulent flow', 'Blend time θ = Nθ / N')],
  uses=['Feed addition and fast reactions', 'pH control and neutralisation', 'Scale-up of mixing-sensitive steps'],
  link=('/calculators/mixing-scale-up-calculator/', 'Mixing scale-up calculator'),
  inp=[('Np', 'Power number', '', 1.3), ('DT', 'Impeller ÷ vessel diameter D/T', '', 0.4), ('N', 'Speed', 'rpm', 90)],
  js='5.2/(Math.pow(v.Np,1/3)*v.DT*v.DT)', rd="['Blend time to 95 % about '+G(x/(v.N/60))+' s (Grenville correlation, turbulent)','ok']")

# ---------------- reaction engineering ----------------
n(id='da', sym='Da', name='Damköhler number', s='rxn', f='Da = k·τ   (first order; τ = residence or batch time)',
  ratio='Reaction rate ÷ transport (flow) rate',
  mean='Compares how fast the reaction goes with how long the material stays. Small Da means the material leaves before reacting; large Da means conversion is complete. For a first-order reaction, a CSTR gives X = Da/(1 + Da) and a plug flow reactor gives X = 1 − e<sup>−Da</sup>.',
  reg=[('below 0.1', 'Little conversion'), ('about 1', 'Partial conversion; reactor type matters'), ('above 5', 'Near-complete conversion in a plug flow reactor')],
  uses=['Sizing CSTRs and tubular reactors', 'Flow chemistry residence time', 'Comparing reaction and mixing or heat removal times'],
  link=('/process-modelling/reaction-kinetics-fitting/', 'Reaction kinetics fitting'),
  inp=[('k', 'First-order rate constant', '1/min', 0.05), ('tau', 'Residence time', 'min', 60)],
  js='v.k*v.tau', rd="['Conversion: plug flow '+F((1-Math.exp(-x))*100,1)+' %, single CSTR '+F(x/(1+x)*100,1)+' %','ok']")
n(id='th', sym='φ', name='Thiele modulus', s='rxn', f='φ = L·√(k / D<sub>eff</sub>);   effectiveness η = tanh φ / φ (slab)',
  ratio='Reaction rate inside a catalyst pellet ÷ diffusion into it',
  mean='Tells you whether the inside of a catalyst particle is being used. At large φ the reactant is consumed near the outer surface and the centre does nothing; smaller particles or more open pores help.',
  reg=[('below 0.4', 'No diffusion limitation: η above about 0.95'), ('0.4 to 3', 'Partial limitation'), ('above 3', 'Strong limitation: η ≈ 1/φ, only the outer shell works')],
  uses=['Choosing catalyst particle size', 'Hydrogenation catalyst (Pd/C, Raney nickel) loading', 'Explaining why a finer catalyst grade runs faster'],
  link=('/articles/hydrogenation-and-reduction/', 'Hydrogenation and reduction'),
  inp=[('L', 'Particle volume ÷ surface (d/6 for a sphere)', 'µm', 5), ('k', 'First-order rate constant (per particle volume)', '1/s', 50), ('D', 'Effective diffusivity', '×10⁻⁹ m²/s', 0.5)],
  js='(v.L*1e-6)*Math.sqrt(v.k/(v.D*1e-9))', rd="['Effectiveness factor η = '+F(Math.tanh(x)/x*100,1)+' %. '+(x<0.4?'The whole particle is used.':x<3?'Some internal limitation.':'Only the outer shell works; use smaller particles.'),x<3?'ok':'warn']")
n(id='bod', sym='Bo<sub>d</sub>', name='Bodenstein number (axial Péclet)', s='rxn', f='Bo = v·L / D<sub>ax</sub>',
  ratio='Transport by flow ÷ back-mixing (axial dispersion)',
  mean='Measures how close a flow reactor is to plug flow. It comes from a tracer test. Large values mean little back-mixing, close to plug flow; small values mean the reactor behaves like a stirred tank. A rough equivalent number of tanks in series is Bo/2.',
  reg=[('below 1', 'Close to a single stirred tank'), ('10 to 100', 'Intermediate'), ('above 100', 'Close to plug flow')],
  uses=['Tubular and flow reactors', 'Packed beds and columns', 'Residence time distribution tests'],
  link=('/articles/continuous-flow-chemistry/', 'Continuous flow chemistry'),
  inp=[('v', 'Velocity', 'm/s', 0.05), ('L', 'Reactor length', 'm', 10), ('D', 'Axial dispersion coefficient', 'm²/s', 0.001)],
  js='v.v*v.L/v.D', rd="['About '+F(Math.max(1,x/2),0)+' equivalent tanks in series. '+(x>100?'Close to plug flow.':x>10?'Some back-mixing.':'Strong back-mixing.'),'ok']")
n(id='arr', sym='γ', name='Arrhenius number', s='rxn', f='γ = E<sub>a</sub> / (R·T)',
  ratio='Activation energy ÷ thermal energy',
  mean='Measures how sensitive a reaction is to temperature. High γ means a small temperature rise speeds the reaction a lot. That is good for control by temperature, and dangerous when cooling is lost, because the heat release accelerates.',
  reg=[('10 to 20', 'Mild temperature sensitivity'), ('about 20 to 40', 'Typical organic reactions: the rate roughly doubles every 10 °C'), ('above 40', 'Very temperature-sensitive: small excursions matter')],
  uses=['Thermal runaway screening', 'Choosing the reaction temperature', 'Scaling batch times between temperatures'],
  link=('/process-safety/', 'Process safety'),
  inp=[('Ea', 'Activation energy', 'kcal/mol', 18), ('T', 'Temperature', '°C', 60)],
  js='v.Ea*1000/(1.98720*(v.T+273.15))', rd="['The rate rises '+F(Math.exp(v.Ea*1000/1.9872*(1/(v.T+273.15)-1/(v.T+283.15))),2)+' times for a 10 °C rise at '+F(v.T,0)+' °C','ok']")

QUESTIONS = [
  ('Will flow in this pipe be laminar or turbulent?', 're'), ('How much pressure will this line lose?', 'f'), ('Will this gravity drain line surge or carry gas?', 'fr'),
  ('Will this drop or jet break up?', 'we'), ('Is gas compressibility important in this line?', 'ma'), ('How fast will these crystals or droplets settle?', 'ar'),
  ('Will this demister catch the droplets?', 'stk'), ('What film coefficient can I expect?', 'nu'), ('Why does this viscous batch heat so slowly?', 'pr'),
  ('How much heat does an unstirred tank lose?', 'ra'), ('Will this drum heat evenly?', 'bi'), ('How long until the centre warms up?', 'fo'),
  ('Is liquid-side mass transfer the bottleneck?', 'sc'), ('Is my gas–liquid reaction in the film or the bulk?', 'ha'), ('Which impeller suits this viscosity?', 'rei'),
  ('How much power will the agitator draw?', 'np'), ('How long will blending take?', 'nth'), ('What conversion will this residence time give?', 'da'),
  ('Is my catalyst particle too big?', 'th'), ('Is my flow reactor close to plug flow?', 'bod'), ('How dangerous is a temperature rise?', 'arr')]

QUIZ = [
  ('Water flows at 1.5 m/s in a 50 mm pipe. The flow is:', ['Laminar', 'Transitional', 'Turbulent'], 2, 'Re = 998 × 1.5 × 0.05 / 0.001 ≈ 75,000, far above 4,000.'),
  ('The Darcy friction factor is how many times the Fanning factor?', ['2', '4', '8'], 1, 'f_Darcy = 4 f_Fanning. Mixing them up gives a pressure drop four times too high or too low.'),
  ('Which number decides whether a solid heats evenly inside?', ['Biot', 'Nusselt', 'Prandtl'], 0, 'Biot compares internal and surface resistance; below 0.1 the solid is nearly uniform.'),
  ('A liquid has Sc ≈ 1000. This means:', ['Molecules diffuse much more slowly than momentum spreads', 'Mass transfer is very fast', 'The liquid is a gas'], 0, 'High Schmidt number: diffusion is slow, so liquid-side mass transfer is often the bottleneck.'),
  ('A gas–liquid reaction has Ha = 10. Where does it happen?', ['In the bulk liquid', 'In the liquid film at the interface', 'In the gas'], 1, 'Ha above 3: fast reaction in the film, so interfacial area matters.'),
  ('Doubling the agitator speed in turbulent flow raises the power by:', ['2 times', '4 times', '8 times'], 2, 'P = Np ρ N³ D⁵, so power goes with speed cubed.'),
  ('For a first-order reaction with Da = 2, a plug flow reactor gives about:', ['67 % conversion', '86 % conversion', '99 % conversion'], 1, 'X = 1 − e^(−2) = 0.86. A single CSTR would give 2/3 = 67 %.'),
  ('Gas flow is usually treated as incompressible below Mach:', ['0.3', '0.7', '1.0'], 0, 'Below Ma ≈ 0.3 density changes are small.')]

FAQ = [
  ('What is a dimensionless number?', 'A combination of quantities in which all the units cancel, so the result is a pure number. Most are ratios of two effects, such as inertia to viscosity (Reynolds) or convection to conduction (Nusselt). Because they have no units, the same value means the same behaviour at any size, which is why they are used for correlations and scale-up.'),
  ('Why are dimensionless numbers important in chemical engineering?', 'They let one correlation cover many fluids, sizes and conditions; they decide which flow or transfer regime applies; and they are the basis of scale-up by similarity. Keeping the right dimensionless number constant between lab and plant keeps the behaviour that matters the same.'),
  ('What is the difference between the Nusselt and Biot numbers?', 'Both are h·L/k, but Nusselt uses the conductivity of the fluid and describes convection at a surface, while Biot uses the conductivity of the solid and compares the resistance inside a solid with that at its surface.'),
  ('Which dimensionless numbers are used in heat transfer?', 'Mainly Nusselt (the dimensionless heat transfer coefficient), Reynolds and Prandtl for forced convection, Grashof and Rayleigh for natural convection, Biot and Fourier for heating and cooling of solids, and Graetz, Péclet and Stanton for special cases.'),
  ('Which dimensionless numbers matter for agitated vessels?', 'The impeller Reynolds number sets the regime, the power number gives the shaft power, the flow number the pumping rate, the Froude number the vortex, and the blend time number the mixing time. In gas–liquid and liquid–liquid systems the Weber number also matters.'),
  ('Can you keep all dimensionless numbers the same on scale-up?', 'No. Geometric similarity fixes the shape, but you cannot keep Reynolds, Froude, power per volume and blend time all constant at a different size. You choose the number that controls the step that matters most and accept changes in the others.')]

def esc(t): return t  # content is trusted, already HTML

def build():
    by = {s: [x for x in N if x['s'] == s] for s, _ in SUBJ}
    sname = dict(SUBJ)
    # summary table
    tbl = ''.join(f'<tr data-s="{x["s"]}"><td><a href="#{x["id"]}"><b>{x["sym"]}</b> {x["name"]}</a></td><td>{x["f"].split(";")[0].split("   (")[0]}</td><td>{x["ratio"]}</td><td>{sname[x["s"]]}</td></tr>' for x in N)
    cards = ''
    for s, title in SUBJ:
        cards += f'<h2 id="sub-{s}" class="dn-sub" data-s="{s}">{title}</h2>\n'
        for x in by[s]:
            regs = ''.join(f'<tr><td>{a}</td><td>{b}</td></tr>' for a, b in x['reg'])
            uses = ''.join(f'<li>{u}</li>' for u in x['uses'])
            lk = f'<p class="dn-link">Try it on a real case: <a href="{{{{ \'{x["link"][0]}\' | relative_url }}}}">{x["link"][1]}</a></p>' if x['link'] else ''
            cards += f'''<section class="dn-card" id="{x['id']}" data-s="{s}" data-k="{html.escape(x['name'].lower() + ' ' + x['ratio'].lower() + ' ' + ' '.join(x['uses']).lower())}">
  <h3><span class="dn-sym">{x['sym']}</span> {x['name']}</h3>
  <div class="formula-box">{x['f']}</div>
  <p class="dn-ratio"><b>Ratio of:</b> {x['ratio']}</p>
  <p>{x['mean']}</p>
  <div class="art-table-wrap"><table class="art-table dn-reg"><thead><tr><th>Value</th><th>What it means</th></tr></thead><tbody>{regs}</tbody></table></div>
  <p class="dn-uses-h"><b>Where you use it</b></p><ul class="dn-uses">{uses}</ul>
  <div class="dn-calc" data-n="{x['id']}"></div>
  {lk}
</section>
'''
    qs = ''.join(f'<li><a href="#{q[1]}">{q[0]}</a> <span>→ {next(x["sym"] for x in N if x["id"] == q[1])}</span></li>' for q in QUESTIONS)
    chips = '<button type="button" class="dn-chip on" data-f="all">All</button>' + ''.join(f'<button type="button" class="dn-chip" data-f="{s}">{t}</button>' for s, t in SUBJ)
    faqh = ''.join(f'<h3>{q}</h3><p>{a}</p>' for q, a in FAQ)
    title = 'Dimensionless Numbers in Chemical Engineering: Meaning, Formula and Where to Use Them'
    seo = 'Dimensionless Numbers in Chemical Engineering | PharmaChemE'
    desc = 'Key dimensionless numbers by subject: Reynolds, Nusselt, Prandtl, Sherwood, Hatta, power number, Damköhler and more, with meaning, formulas and calculators.'
    assert len(seo) <= 62 and len(desc) <= 160, (len(seo), len(desc))
    sd = {"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "headline": title, "description": desc,
         "author": {"@type": "Person", "@id": "https://www.pharmacheme.in/about/#ankush-chopra", "name": "Ankush Chopra", "url": "https://www.pharmacheme.in/about/"},
         "publisher": {"@type": "Organization", "@id": "https://www.pharmacheme.in/#organization", "name": "PharmaChemE", "url": "https://www.pharmacheme.in/"},
         "datePublished": "2026-11-13", "dateModified": "2026-11-13"},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}
    fm = f'''---
layout: default
title: "{title}"
seo_title: "{seo}"
description: "{desc}"
breadcrumbs:
  - label: Articles
    url: /articles/
  - label: Dimensionless Numbers
    url: /articles/dimensionless-numbers/
structured_data: |
''' + '\n'.join('  ' + l for l in json.dumps(sd, indent=2, ensure_ascii=False).split('\n')) + '''
last_modified_at: 2026-11-13
---
'''
    quiz = json.dumps([{'q': q, 'o': o, 'a': a, 'w': w} for q, o, a, w in QUIZ], ensure_ascii=False)
    body = f'''<link rel="stylesheet" href="{{{{ '/assets/css/articles.css' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}">
<link rel="stylesheet" href="{{{{ '/assets/css/dimensionless.css' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}">

<div class="container article-body" style="padding:32px 20px 64px;">
  <h1>Dimensionless Numbers in Chemical Engineering</h1>
  <p class="article-meta">Fundamentals &middot; Flow, heat, mass, mixing and reaction &middot; <span class="art-updated">November 2026</span></p>

  <p class="art-lede">A dimensionless number is a ratio of two competing effects with all the units cancelled out: inertia against viscosity, convection against conduction, reaction against diffusion. Because it has no units, the same value means the same behaviour in a lab flask and a plant reactor. That is why correlations, regime maps and scale-up rules are all written in dimensionless numbers. This guide covers {len(N)} numbers used every day in chemical and pharmaceutical plants, grouped by subject. For each one you get what it means, the values that matter, where it is used, and a calculator that works it out and tells you what your number means.</p>

  <nav class="art-toc" aria-label="In this article"><b>In this article</b><ol>
    <li><a href="#idea">How to read a dimensionless number</a><span>Basics</span></li>
    <li><a href="#table">All numbers at a glance</a></li>
    <li><a href="#which">Which number do I need?</a></li>
    {''.join(f'<li><a href="#sub-{s}">{t}</a><span>{len(by[s])} numbers</span></li>' for s, t in SUBJ)}
    <li><a href="#scale">Dimensionless numbers and scale-up</a><span>Going deeper</span></li>
    <li><a href="#quiz">Check yourself: quick quiz</a></li>
    <li><a href="#faq">Questions people ask</a></li>
  </ol></nav>

  <h2 id="idea">How to read a dimensionless number <span class="lvl l1">Basics</span></h2>
  <p>Almost every dimensionless number is a ratio: <b>this effect ÷ that effect</b>. Read it that way and the value explains itself. A Reynolds number of 75,000 means inertia beats viscosity by a wide margin, so the flow is turbulent. A Biot number of 0.02 means heat crosses the inside of a solid fifty times more easily than its surface, so the solid heats evenly.</p>
  <ul>
    <li><strong>Far from 1:</strong> one effect dominates, and you can usually ignore the other.</li>
    <li><strong>Close to 1:</strong> both effects matter, and simple rules break down.</li>
    <li><strong>Regime limits</strong> (such as Re = 2,100 in a pipe) come from experiments, and are approximate.</li>
    <li><strong>Correlations</strong> such as Nu = 0.023·Re<sup>0.8</sup>·Pr<sup>0.4</sup> link dimensionless numbers, so one equation covers every fluid, size and speed in its range.</li>
  </ul>
  <p>Units must be consistent inside each number. The calculators below take plant units (kcal, °C, cP, mm) and convert them for you.</p>

  <h2 id="table">All numbers at a glance</h2>
  <div class="dn-tools"><div class="dn-chips" role="group" aria-label="Filter by subject">{chips}</div><input type="search" class="dn-search" placeholder="Search: e.g. settling, vortex, catalyst" aria-label="Search the dimensionless numbers"></div>
  <div class="art-table-wrap"><table class="art-table dn-all"><thead><tr><th>Number</th><th>Formula</th><th>Ratio of</th><th>Subject</th></tr></thead><tbody>{tbl}</tbody></table></div>

  <h2 id="which">Which number do I need?</h2>
  <ul class="dn-q">{qs}</ul>

  {cards}

  <h2 id="scale">Dimensionless numbers and scale-up <span class="lvl l3">Going deeper</span></h2>
  <p>Two systems behave the same if they are <b>geometrically similar</b> (same shape) and their important dimensionless numbers are equal. This is the principle of similarity, and it is the basis of every scale-up rule. The difficulty is that you rarely can keep them all equal at once:</p>
  <ul>
    <li>In a stirred vessel scaled up by a factor of 10 in diameter, keeping the impeller Reynolds number constant would cut the speed 100 times. Keeping the Froude number constant would raise the power per volume about 30 times. You cannot keep both.</li>
    <li>Keeping power per volume constant, the usual choice, raises the Reynolds number, leaves the power number unchanged in turbulent flow, and makes the blend time longer.</li>
    <li>Keeping heat transfer similar is harder still, because the wall area per volume falls as the vessel grows, whatever the agitation.</li>
  </ul>
  <p>So you identify the number that controls the step that matters, keep that one constant, and check what happens to the others. The <a href="{{{{ '/calculators/mixing-scale-up-calculator/' | relative_url }}}}">mixing scale-up calculator</a> and the <a href="{{{{ '/training/modules/scale-up-lab-to-plant/' | relative_url }}}}">scale-up training module</a> work through this.</p>

  <h2 id="quiz">Check yourself: quick quiz</h2>
  <div class="dn-quiz" data-quiz='{html.escape(quiz, quote=True)}'><noscript><p>The quiz needs JavaScript.</p></noscript></div>

  <h2 id="faq">Questions people ask</h2>
  {faqh}

  <h2>Sources and further reading</h2>
  <ul class="art-sources">
    <li>Bird R.B., Stewart W.E., Lightfoot E.N., <i>Transport Phenomena</i>, 2nd ed., Wiley, 2002</li>
    <li>Green D.W., Southard M.Z. (eds.), <i>Perry's Chemical Engineers' Handbook</i>, 9th ed., McGraw-Hill, 2019</li>
    <li>Incropera F.P., DeWitt D.P., Bergman T.L., Lavine A.S., <i>Fundamentals of Heat and Mass Transfer</i>, 7th ed., Wiley, 2011</li>
    <li>Levenspiel O., <i>Chemical Reaction Engineering</i>, 3rd ed., Wiley, 1999</li>
    <li>Paul E.L., Atiemo-Obeng V.A., Kresta S.M. (eds.), <i>Handbook of Industrial Mixing</i>, Wiley, 2004</li>
    <li>Churchill S.W., Friction-factor equation spans all fluid-flow regimes, <i>Chem. Eng.</i> 84 (1977) 91–92; Simpson L.L., Sizing piping for process plants, <i>Chem. Eng.</i> 75 (1968) 192</li>
  </ul>

  <div class="related-box">
    <h3>Related</h3>
    <a href="{{{{ '/calculators/pipe-pressure-drop/' | relative_url }}}}">Pipe pressure drop calculator</a>
    <a href="{{{{ '/calculators/mixing-scale-up-calculator/' | relative_url }}}}">Mixing scale-up calculator</a>
    <a href="{{{{ '/articles/gas-liquid-mass-transfer-kla/' | relative_url }}}}">Gas–liquid mass transfer and kLa</a>
    <a href="{{{{ '/articles/agitator-design/' | relative_url }}}}">Agitator design</a>
    <a href="{{{{ '/articles/heat-exchanger-design-basics/' | relative_url }}}}">Heat exchanger design basics</a>
  </div>
</div>
<script src="{{{{ '/assets/js/dimensionless-calc.js' | relative_url }}}}?v={{{{ site.time | date: '%s' }}}}"></script>
'''
    os.makedirs(os.path.join(ROOT, 'articles/dimensionless-numbers'), exist_ok=True)
    open(os.path.join(ROOT, 'articles/dimensionless-numbers/index.html'), 'w', encoding='utf-8').write(fm + body)
    # calculator config
    js = ['/* Dimensionless numbers article: one calculator per number, plus filter, search and quiz. Generated by tools/pages/dimensionless.py */', '(function () {', "'use strict';",
          "var F = function (x, d) { return isFinite(x) ? Number(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '–'; };",
          "var G = function (x) { if (!isFinite(x)) return '–'; var a = Math.abs(x); return a === 0 ? '0' : a >= 1e6 || a < 1e-3 ? x.toExponential(2) : a >= 1000 ? F(x, 0) : a >= 100 ? F(x, 1) : a >= 1 ? F(x, 2) : F(x, 3); };",
          'var C = {};']
    for x in N:
        js.append(f"C[{json.dumps(x['id'])}] = {{ sym: {json.dumps(html.unescape(x['sym']).replace('<sub>','').replace('</sub>',''))}, inp: {json.dumps(x['inp'], ensure_ascii=False)}, f: function (v) {{ return {x['js']}; }}, r: function (x, v) {{ return {x['rd']}; }} }};")
    js.append(open(os.path.join(ROOT, 'tools/pages/dimensionless_ui.js'), encoding='utf-8').read())
    js.append('})();')
    open(os.path.join(ROOT, 'assets/js/dimensionless-calc.js'), 'w', encoding='utf-8').write('\n'.join(js))
    print(len(N), 'numbers')

if __name__ == '__main__':
    build()
