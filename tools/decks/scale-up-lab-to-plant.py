#!/usr/bin/env python3
"""Builds the Scale-up training deck. Run: python3 tools/decks/scale-up-lab-to-plant.py
All numbers are calculated here from stated, illustrative assumptions (kcal and °C)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from deck_lib import *

# ---- geometry: cylindrical vessel, height = diameter, jacket on the side wall (illustrative)
def geom(V):
    D = (4 * V / math.pi) ** (1 / 3); A = math.pi * D * D
    return D, A, A / V
U, DT, QL = 150.0, 30.0, 25.0          # kcal/h·m2·°C, jacket driving force °C, heat released kcal per litre of batch
Dl, Al, avl = geom(0.001); Dp, Ap, avp = geom(10.0)
ratio = avl / avp                        # area per volume, lab over plant
capl = U * avl * DT / 1000; capp = U * avp * DT / 1000   # kcal/h per litre
tdose_lab = QL / capl * 60; tdose_plant = QL / capp      # min, h  (lab fastest possible; plant fastest possible)
L = (10.0 / 0.001) ** (1 / 3)            # length ratio, 1 L to 10 m3
def heatup(m, A):                        # solvent, cp 0.5, steam side 120 °C, 25 to 65 °C
    return m * 0.5 / (U * A) * math.log((120 - 25) / (120 - 65)) * 60   # minutes
hl, hp = heatup(0.8, Al), heatup(8000, Ap)
f = lambda x, d=1: f'{x:.{d}f}'
def g(x):                                # compact ratio text
    return f'x {x:.0f}' if x >= 10 else f'x {x:.2f}' if x >= 0.1 else f'x {x:.3f}' if x >= 0.001 else f'x {x:.1e}'

S = []
S.append(cover('cover', 'Scale-up training', 'Scale-up:<br>flask to<br>plant', 'Why a process that works in the lab can fail in a big vessel, and what to check before the first batch',
 "Welcome. Every product we make started in a flask. Scale-up is the job of moving it into a vessel thousands of times bigger without losing yield, quality or safety. Today is not about equations for their own sake. It is about five things that change when a vessel gets bigger, and the questions that catch problems before the batch does. Ask the room: who has seen a batch behave differently from the lab result? Take two quick stories. Those stories are the reason we are here."))

S.append(stats('hook', 'The same chemistry, a different world',
 [(g(ratio).replace('x ', '') + 'x', 'less cooling surface per litre in a 10 m3 vessel than in a 1 L flask'),
  (f(tdose_plant, 1) + ' h', 'shortest dosing time for a step the flask can run in about 9 minutes (illustrative)'),
  (f(hp, 0) + ' min', 'to heat the plant vessel by 40 °C, against a few minutes in the flask')],
 'The chemistry did not change. The vessel did.',
 f"These numbers are calculated, not measured, and you will redo them yourself on the live page. Take a 1 litre flask and a 10 cubic metre vessel, both shaped the same. The bigger vessel holds ten thousand times more material but has only about {f(Ap/Al,0)} times more wall to cool through, so each litre has about {f(ratio,0)} times less cooling surface. (Click.) A step that the flask could take in 10 minutes needs a few hours in the plant if the same heat has to leave through the jacket. (Click.) And everything that is heated or cooled takes longer. (Click.) Scale-up is mostly the story of those three effects: heat, mixing and time."))

S.append(compare('same', 'What stays the same, what changes',
 ('Stays the same', ['The chemistry and the reaction paths', 'Rate constants at the same temperature and concentration', 'Heat of reaction per kilogram', 'Solubility and physical properties']),
 ('Changes with size', ['Cooling and heating surface per litre', 'How fast things mix', 'Times for heating, cooling, charging and transfer', 'Local concentration where a feed enters', 'Wall material and hold times']),
 "First, clear the idea that scale-up changes the chemistry. It does not. On the left, what stays the same. A kilogram of reaction mass releases the same heat in a flask or a reactor. (Click.) On the right, what changes with size. Most of these are about the equipment, not the reaction. The surface per litre falls, mixing slows, every operation takes longer, and a feed that disperses in a second in a flask may take much longer to spread in a large vessel. Our job is to find which of these matter for this process."))

S.append(table('geo', 'Flask versus plant vessel, same shape',
 ['', 'Volume', 'Diameter', 'Jacket area', 'Area per litre'],
 [['Lab flask', '1 L', f'{f(Dl*100,1)} cm', f'{f(Al,3)} m2', f'{f(Al,3)} m2/L'],
  ['Pilot vessel', '100 L', f'{f(geom(0.1)[0]*100,0)} cm', f'{f(geom(0.1)[1],2)} m2', f'{f(geom(0.1)[2]/1000,4)} m2/L'],
  ['Plant vessel', '10 m3', f'{f(Dp*100,0)} cm', f'{f(Ap,1)} m2', f'{f(avp/1000,4)} m2/L']],
 f"Here are three vessels that all have height equal to diameter, with the jacket on the side wall. (Click through the rows.) Volume grows with the cube of the diameter. Wall area grows only with the square. So the area per litre falls as the vessel grows. This is the single most important fact in scale-up. Real vessels differ in shape and have a bottom jacket and coils, but the trend is the same. (Click.) Notice the plant vessel has {f(ratio,0)} times less jacket per litre than the flask.",
 note='Illustrative geometry: height equal to diameter, jacket on the side wall only. Real vessels differ, the trend does not.'))

S.append(guess('area', 'Guess: how much less cooling per litre?',
 'A 1 L flask and a 10 m3 vessel have the same shape. How many times less jacket area does each litre of the large vessel have?',
 f'about {f(ratio,0)}x', f'Area per litre is 4 divided by the diameter for this shape. The flask is {f(Dl*100,0)} cm across and the plant vessel {f(Dp*100,0)} cm, a ratio of {f(L,1)}, so each litre has {f(ratio,0)} times less wall.',
 "Let the room guess first. Most people say two or three times, because 10 cubic metres feels like a normal vessel. Write the guesses on the board. (Click.) The answer is about 22. The wall grows with diameter squared while the volume grows with diameter cubed, so the ratio is the ratio of the diameters. Ask: if the jacket is that much weaker per litre, what does that mean for a reaction that gives out heat?"))

S.append(bullets('heat', 'Heat made grows faster than heat removed',
 ['Heat released grows with the volume of the batch', 'Heat removed through the wall grows only with its area', 'The gap widens as the vessel grows', 'Fast steps that were easy in the flask become the limit'],
 "Four short points. Heat released by a reaction depends on how much material is reacting, so it grows with volume. (Click.) Heat removed through the wall depends on the wall area, which grows more slowly. (Click.) So the gap widens with size. (Click.) The practical result is that a step the flask handled by simply adding everything in ten minutes may be the step that limits the plant. Ask the room which steps in their own products are exothermic, and write them on the board.",
 callout=('V vs A', 'volume goes with size cubed, wall area with size squared')))

S.append(table('dose', 'Same reaction: the shortest safe dosing time',
 ['', 'Lab flask, 1 L', 'Plant vessel, 10 m3'],
 [['Heat released per litre of batch', f'{QL:.0f} kcal', f'{QL:.0f} kcal'],
  ['Cooling capacity per litre', f'{f(capl,0)} kcal/h', f'{f(capp,1)} kcal/h'],
  ['Shortest dosing time that the jacket can follow', f'{f(tdose_lab,0)} min', f'{f(tdose_plant,1)} h']],
 f"Here is the same reaction in both vessels. Assume it releases {QL:.0f} kilocalories per litre of batch, the jacket coefficient is {U:.0f} kilocalories per hour per square metre per degree, and the jacket can hold a {DT:.0f} degree driving force. (Click.) Per litre, the flask can remove about {f(capl,0)} kilocalories an hour. (Click.) The plant vessel removes about {f(capp,1)}. (Click.) If the heat is released as fast as it is added, the flask can follow a dosing time of about {f(tdose_lab,0)} minutes. The plant needs at least {f(tdose_plant,1)} hours. That is not a mistake in the recipe. It is the new limit. This is why the recipe for the plant is not the recipe for the flask.",
 note='Illustrative: cooling capacity = U x area per litre x driving force. Real values come from your own reactor data and calorimetry.'))

S.append(bullets('accum', 'Dosing faster than heat can leave',
 ['If feed goes in faster than it reacts, unreacted feed piles up', 'If cooling then fails, all of it can react at once', 'A reaction that "went fine" on every batch can still hide this', 'Dose-controlled means the feed rate sets the heat release'],
 "Two limits sit behind the dosing time. One is the jacket, which we just calculated. The other is the reaction itself. If the feed goes in faster than it reacts, unreacted material accumulates. (Click.) If something then stops, such as the agitator, the cooling or the temperature falling too low for the reaction to start, that stored material can react quickly. (Click.) This is the root of many runaway incidents, and the earlier runaway reactions module covers it in detail. (Click.) A good scale-up wants a reaction that is dose-controlled, where stopping the feed quickly stops the heat. (Click.) A short lab test can show which type you have.",
 callout=('Stop the feed', 'and the heat should stop. If it does not, find out why before scaling up.')))

S.append(table('rules', 'Mixing rules: keep one thing the same',
 ['Keep constant', 'Agitator speed', 'Tip speed', 'Power per litre', 'Blend time'],
 [[('Speed (rpm)'), 'x 1', g(L), g(L**2), 'x 1'],
  [('Power per litre'), g(L**(-2/3)), g(L**(1/3)), 'x 1', g(L**(2/3))],
  [('Tip speed'), g(1/L), 'x 1', g(1/L), g(L)],
  [('Reynolds number'), g(1/L**2), g(1/L), g(1/L**4), g(L**2)]],
 f"This is the hard truth about mixing: you can keep only one thing the same. Read across each row for a scale of 1 litre to 10 cubic metres, which is a length ratio of {f(L,1)}. Keep the speed and the tip speed rises {f(L,0)} times and the power per litre rises by about {f(L**2,0)} times, which is impossible. (Click.) Keep the power per litre the same, which is the common choice, and the speed drops to about one eighth, the tip speed rises, and the blend time grows by about {f(L**(2/3),1)} times. (Click.) Keep the tip speed and the power per litre collapses and blending takes {f(L,0)} times longer. (Click.) Keep Reynolds number and the numbers become absurd. So we choose the rule that protects the step that matters, and we accept the rest. If the step is fast and mixing sensitive, blend time is what we protect.",
 note=f'Geometrically similar vessels, 1 L to 10 m3, length ratio {f(L,1)}. Power per litre goes with speed cubed times diameter squared.'))

S.append(mythfact('myths', 'Three scale-up myths',
 [('"Same rpm gives the same mixing."', 'Myth', 'Tip speed and power per litre change a lot.'),
  ('"If it works at 1 L, it works at 10 m3."', 'Myth', 'Heat, mixing and time all change.'),
  ('"A slower dosing time at scale is normal."', 'Fact', 'The jacket sets the limit, not the recipe.')],
 "Three statements. Ask the room to call each one before you click. (Click.) Same rpm in a bigger vessel does not give the same mixing. We just saw the tip speed and power per litre change by large factors. (Click.) Working at one litre does not guarantee ten cubic metres. The lab shows the chemistry works, not that the plant can carry the heat and the mixing. (Click.) A longer dosing time at scale is often exactly right. If the jacket cannot follow, the dosing has to slow down, and that is a design decision, not a failure."))

S.append(cards('mixsens', 'Where mixing hurts a process',
 [('Fast reactions', 'Feed meets a hot, concentrated zone near the inlet and forms by-products.'),
  ('Crystallisation', 'Uneven supersaturation gives fines, lumps or a different crystal size.'),
  ('Gas and liquid', 'Transfer rate into the liquid falls when bubble size and gas hold-up change.'),
  ('Solids', 'Solids settle in dead zones or lift too slowly from the bottom.')],
 "Four places where poor mixing shows up. Fast reactions: if the reaction is quicker than the mixing, the product is made in a patchy way and by-products appear. (Click.) Crystallisation: the feed and the cooling reach different parts of the vessel at different times, so the crystals differ. (Click.) Gas and liquid: the amount of gas absorbed depends on bubble size and gas hold-up, which change with vessel size and agitator. (Click.) Solids: a catalyst or a slurry may sit in a corner of a large vessel. Ask the room which of the four applies to their own product."))

S.append(table('time', 'Everything takes longer',
 ['Operation', 'Lab flask', 'Plant vessel'],
 [['Heat 40 °C, steam at 120 °C on the jacket', f'about {f(hl,0)} min', f'about {f(hp,0)} min'],
  ['Charge a solvent or solid', 'seconds', 'tens of minutes'],
  ['Transfer to the next vessel', 'seconds', 'minutes to hours'],
  ['Filter or centrifuge a batch', 'minutes', 'hours'],
  ['Dry a bed of solids', 'short', 'much deeper bed, much longer']],
 f"Time is the third effect. The heat-up row is calculated: {f(hl,0)} minutes in the flask, about {f(hp,0)} in the plant vessel with these assumptions. (Click through the rows.) The other rows are typical trends and will differ by plant. Charging, transfer, filtering and drying all take longer. Why does it matter? Because the material sits longer at temperature, in contact with other things, or between steps. A product that is stable for twenty minutes in a flask may degrade over three hours in the plant.",
 note='Heat-up: solvent, specific heat 0.5 kcal/kg·°C, 25 to 65 °C, U = 150 kcal/h·m2·°C. Other rows are typical trends, not measured data.'))

S.append(bullets('hold', 'Hold times and cycle time',
 ['Time at temperature adds up across heating, hold and cooling', 'Impurities can grow while material waits', 'Every extra hour of a slow step is an hour of plant time', 'Ask the lab: how long can this hold, and at what temperature?'],
 "Hold time is how long a product or intermediate can sit before it degrades. (Click.) In the lab, nobody notices. In the plant, the heating, the transfer and the filtration add up. (Click.) And the cycle time of the batch grows, which affects how many batches the plant can make. (Click.) So before scale-up we ask the lab for hold-time data at the planned temperatures. If there is none, that is a gap to close, not an assumption to make."))

S.append(cards('solids', 'Solids behave differently at scale',
 [('Crystallising', 'Use the same cooling profile shape and seeding point, not the same time.'),
  ('Filtering', 'A taller cake is more resistant. Measure the cake resistance in the lab.'),
  ('Washing', 'Wash ratio is the same, but channels in a large cake can leave patches.'),
  ('Drying', 'A deeper bed and a slower heat supply mean longer, uneven drying.')],
 "Solids need their own thought. Crystallising: copy the shape of the cooling profile and the seeding point, not the clock time. The metastable zone and the seeding rules from the lab still apply. (Click.) Filtering: a thicker cake offers more resistance, so measure the cake resistance in the lab and use it to estimate the plant filtering time. (Click.) Washing: the wash ratio is the same, but channels in a thick cake can leave unwashed patches. (Click.) Drying: a deeper bed and the limited heat supply give longer, less even drying. The crystallisation scale-up article on this site covers the solubility and seeding side."))

S.append(table('measure', 'What to measure in the lab first',
 ['Measure', 'Why it matters'],
 [['Heat of reaction and heat release rate (calorimetry)', 'Sets the dosing time and the cooling needed'],
  ['Accumulation during dosing', 'Shows if the process is dose-controlled'],
  ['Effect of stirring and feed point', 'Shows if mixing limits the product'],
  ['Solubility and metastable zone', 'Sets seeding and cooling profile'],
  ['Cake resistance of the filtered solid', 'Estimates plant filtration time'],
  ['Hold-time stability at process temperature', 'Shows how much extra time the product tolerates']],
 "This is the lab work that makes scale-up predictable. Read each row aloud. Calorimetry gives the heat and the rate, so we can compare with the plant's cooling. (Click.) The accumulation test shows how much feed stays unreacted. (Click.) The stirring test shows whether the product depends on mixing. (Click.) Solubility and the metastable zone drive the crystallisation steps. (Click.) Cake resistance and hold time are cheap to measure and expensive to guess. If a row is missing for your product, that is the first job."))

S.append(bullets('steps', 'Scale up in steps, and scale down to test',
 ['Move through lab, kilo lab, pilot, then plant', 'Rule of thumb: keep each step to tens of times in volume, not thousands', 'Use a small vessel to copy the plant, such as the same dosing time and mixing', 'Compare each step with the one before and explain every difference'],
 "Nobody goes from a flask to a ten cubic metre reactor in one jump if they can avoid it. (Click.) A common rule of thumb keeps each step to a factor of tens in volume. It is a guide, not a law. (Click.) Scale-down is the other half. Use the small vessel to copy what the plant will do, for example the planned dosing time and a similar mixing level. If the product is the same under plant-like conditions, you gain confidence. (Click.) And at every step, write down what is different from the last one and why."))

S.append(live('tryit', 'Now you call it: five live checks',
 [('Surface per litre.', 'Give the vessel size and see how much cooling area each litre has.'),
  ('Dosing time.', 'Set the heat release and see the shortest time the jacket can follow.'),
  ('Mixing rule.', 'Pick the rule and see what happens to speed, tip speed and blend time.'),
  ('Heat-up time.', 'Choose the size and see how long it takes to heat.'),
  ('If cooling stops.', 'See how high the temperature goes if feed has accumulated.')],
 "Open the live page on the second screen. These five checks follow the slides. Ask the room to guess before you click Reveal on each. Station one repeats the surface per litre. Station two shows the dosing time, and you can change the heat release and the jacket. Station three is the mixing rule. Station four shows heating time. Station five links to safety: how hot does it get if the feed accumulated and cooling stopped? All inputs can be changed. Use your own product's numbers if you have them."))

S.append(cards('before', 'Before the first plant batch',
 [('Agree the limits', 'Dosing time, temperature, hold times and stop points, written down.'),
  ('Check the equipment', 'Jacket, condenser, agitator and relief capacity against the planned batch.'),
  ('Plan the sampling', 'Extra samples and temperature checks at the steps the lab found sensitive.'),
  ('Agree who can stop', 'Anyone who sees the warning signs can stop the feed.')],
 "A first plant batch is an experiment with a plan. Agree the limits first: the dosing time, the temperature range, the hold times and where the batch can safely be stopped. (Click.) Check the equipment against the plan, including the jacket, the condenser, the agitator and the relief. (Click.) Plan extra samples and temperature checks at the steps the lab found sensitive. (Click.) And make sure everyone on shift knows they can stop the feed if the signs appear. A batch that is stopped early and understood is better than a batch that is finished and not understood."))

S.append(bullets('signs', 'During the batch: signs to watch',
 ['Temperature rising above the set point at the planned dose rate', 'Jacket outlet temperature climbing or the coolant flow at maximum', 'Reaction slower to start than in the lab, with no heat seen', 'Agitator current, foam or colour different from the lab or earlier batches'],
 "These are warning signs. Read them together. Temperature above the set point at the planned dose rate means the heat removal is behind. (Click.) A jacket outlet that is warming and a coolant valve at full open say the jacket is at its limit. (Click.) A reaction that does not start when it should is a warning in a semi-batch process, because feed may be accumulating. (Click.) Different agitator current, foam or colour tells you the mixing or the chemistry is not the same as before. Stopping the feed is the first action, then ask why."))

S.append(rules('close', 'Five questions to ask in every scale-up',
 ['Can the jacket remove the heat at the planned dosing time?', 'Is the mixing enough for the step that is mixing sensitive?', 'Which steps take longer, and does the product tolerate it?', 'What is the worst case if cooling or the agitator stops?', 'What did we measure, and what did we only assume?'],
 "Read the five questions aloud and ask the room to repeat the first one. Then take questions. If time allows, ask each table to pick a product they know and answer the five questions for it, naming the missing data. The best result from today is a short list of gaps on the board with an owner and a date. The related articles, the mixing scale-up calculator and the process modelling tools on this site help with the numbers."))

n = build('scale-up-lab-to-plant', 'Scale-up: lab to plant', S)
print(n, 'slides')
