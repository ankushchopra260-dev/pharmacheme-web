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

S.append(live('tryit', 'Now you call it: the live page',
 [('Agitators and mixing.', 'Pick an agitator, watch the flow pattern and a dye blend, see power and blend time.'),
  ('Heat transfer.', 'See which resistance controls, and what a faster agitator really buys.'),
  ('Dosing time.', 'Set the heat release and see the shortest time the jacket can follow.'),
  ('Mixing rule.', 'Pick the rule and see what happens to speed, tip speed and blend time.'),
  ('If cooling stops.', 'See how high the temperature goes if feed has accumulated.')],
 "Open the live page on the second screen. It has an agitator guide, a mixing simulator with a moving flow pattern, a heat-transfer simulator, five quick checks, a dosing simulator and a quiz. Start with the mixing and heat-transfer simulators if the room works with agitators every day. Ask the room to guess before you click Reveal on each. Station one repeats the surface per litre. Station two shows the dosing time, and you can change the heat release and the jacket. Station three is the mixing rule. Station four shows heating time. Station five links to safety: how hot does it get if the feed accumulated and cooling stopped? All inputs can be changed. Use your own product's numbers if you have them."))

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


# ---------------------------------------------------------------- interactive and extra slides
import deck_lib as dl
import json as _json

def drag_slide():
    t = dl.DARK
    inner = dl._h2('Drag the vessel size', t) + """
<div onclick="event.stopPropagation()" style="position:absolute;left:128px;top:250px;width:900px">
 <p style="font-size:30px;color:#B8C7D3;margin:0 0 6px">Same shape, same chemistry. Move the slider.</p>
 <p id="dr-v" style="font-family:'Oswald',Arial,sans-serif;font-size:130px;font-weight:600;color:#F2A900;line-height:1.05;margin:0 0 10px">10 m3</p>
 <input id="dr-s" type="range" min="0" max="4.5" step="0.01" value="4" aria-label="Vessel size" style="width:900px;height:48px;accent-color:#F2A900">
 <div style="display:flex;gap:16px;margin:26px 0 34px">
  <button class="dr-p" data-x="0">1 L flask</button><button class="dr-p" data-x="2">100 L</button><button class="dr-p" data-x="3">1 m3</button><button class="dr-p" data-x="4">10 m3</button><button class="dr-p" data-x="4.5">30 m3</button>
 </div>
 <p style="font-size:28px;color:#B8C7D3;margin:0 0 10px">Cooling wall per litre, compared with the flask</p>
 <div style="width:900px;height:54px;background:#1B2E3E;border-radius:8px;overflow:hidden"><div id="dr-b" style="height:54px;width:5%;background:#F2A900;transition:width .25s"></div></div>
 <p id="dr-bt" style="font-size:34px;color:#EEF1F3;margin:12px 0 0;font-weight:600"></p>
</div>
<div onclick="event.stopPropagation()" style="position:absolute;left:1120px;top:250px;width:672px;display:grid;grid-template-columns:1fr;gap:0">
 <div class="dr-r"><span>Diameter</span><b id="dr-d"></b></div>
 <div class="dr-r"><span>Wall per litre</span><b id="dr-w"></b></div>
 <div class="dr-r"><span>Cooling per litre</span><b id="dr-c"></b></div>
 <div class="dr-r hot"><span>Shortest dosing time for 25 kcal per litre</span><b id="dr-t"></b></div>
 <div class="dr-r"><span>Heat 25 to 65 °C with steam at 120 °C</span><b id="dr-h"></b></div>
 <div class="dr-r"><span>Blend time vs flask, same power per litre</span><b id="dr-m"></b></div>
</div>
<style>.dr-p{font:600 28px 'Public Sans',Arial,sans-serif;color:#EEF1F3;background:#1B2E3E;border:2px solid #2A3E50;border-radius:10px;padding:12px 20px;cursor:pointer}.dr-p:hover{border-color:#F2A900}
.dr-r{display:flex;justify-content:space-between;align-items:baseline;gap:20px;border-bottom:2px solid #2A3E50;padding:18px 0}.dr-r span{font-size:28px;color:#B8C7D3;line-height:1.25;width:320px}.dr-r b{white-space:nowrap;font-family:'Oswald',Arial,sans-serif;font-size:52px;font-weight:600;color:#EEF1F3}.dr-r.hot b{color:#F2A900}</style>
<script>(function(){var s=document.getElementById('dr-s');if(!s)return;var q=function(i){return document.getElementById(i)};
function f(x,d){return x>=100?Math.round(x).toLocaleString('en-IN'):x>=10?x.toFixed(1):x.toFixed(d==null?2:d)}
function upd(){var V=Math.pow(10,parseFloat(s.value)),Vm=V/1000,D=Math.pow(4*Vm/Math.PI,1/3),av=4/D,A=Math.PI*D*D,av0=4/Math.pow(4*0.001/Math.PI,1/3);
 q('dr-v').textContent=V>=1000?f(Vm,V>=10000?0:1)+' m3':Math.round(V)+' L';
 q('dr-d').textContent=D>=1?f(D,2)+' m':Math.round(D*100)+' cm';
 q('dr-w').textContent=f(av/1000,4)+' m2/L';
 var cap=150*av*30/1000;q('dr-c').textContent=f(cap,1)+' kcal/h';
 var td=25/cap;q('dr-t').textContent=td<1?Math.round(td*60)+' min':f(td,1)+' h';
 var th=0.8*V*0.5/(150*A)*Math.log(95/55)*60;q('dr-h').textContent=th<1?'under 1 min':Math.round(th)+' min';
 q('dr-m').textContent='x '+f(Math.pow(V,2/9),1);
 var r=av/av0;q('dr-b').style.width=Math.max(2,r*100)+'%';q('dr-bt').textContent=r>=0.995?'1x: the flask':'1 / '+f(1/r,r>0.5?1:0)+' of the flask';}
s.addEventListener('input',upd);s.addEventListener('keydown',function(e){e.stopPropagation()});
document.querySelectorAll('.dr-p').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();s.value=b.getAttribute('data-x');upd()});b.addEventListener('keydown',function(e){e.stopPropagation()})});upd();})();</script>
"""
    notes = ("Now make it physical. Open this slide and let someone in the room drag the slider. Start at the one litre flask, then move up. Watch three numbers: the wall per litre bar shrinks, the shortest dosing time grows, and the heating time grows. Ask: at what size does the dosing time first go beyond an hour? Beyond a shift? Use the buttons to jump to a size. "
             "Same assumptions as before: height equal to diameter, jacket on the side wall, U of 150 kilocalories per hour per square metre per degree, a 30 degree driving force and 25 kilocalories released per litre. All illustrative. Click outside the slider to move to the next slide.")
    return dl._sec('drag', 'dark', inner, notes)[0]

def choice(sid, title, scenario, opts, notes, theme='light'):
    t = dl.DARK if theme == 'dark' else dl.LIGHT
    rows = ''
    for k, (txt, ok, why) in enumerate(opts):
        rows += (f'<div class="ch-o" tabindex="0" role="button" data-ok="{1 if ok else 0}" data-why="{E(why)}" '
                 f'style="position:absolute;left:128px;top:{380 + k*146}px;width:1664px;height:130px;display:flex;align-items:center;gap:28px;padding:0 36px;'
                 f'background:{t["card"]};border:3px solid {t["line"]};border-radius:14px;cursor:pointer">'
                 f'<span style="font-family:\'Oswald\',Arial,sans-serif;font-size:60px;font-weight:600;color:#F2A900;width:60px">{"ABC"[k]}</span>'
                 f'<span style="font-size:36px;line-height:1.3;color:{t["fg"]}">{E(txt)}</span></div>')
    inner = (dl._h2(title, t) + f'<p style="position:absolute;left:128px;top:236px;width:1664px;font-size:38px;line-height:1.35;color:{t["fg"]}">{E(scenario)}</p>' + rows +
             f'<div class="ch-f" style="position:absolute;left:128px;top:836px;width:1664px;min-height:120px;font-size:32px;line-height:1.4;color:{t["fg"]}"><span style="color:{t["mut"]}">Click an answer. You can try again.</span></div>'
             f'<style>.ch-o:hover,.ch-o:focus{{border-color:#F2A900!important;outline:none}}.ch-o.ok{{border-color:#2C8A5B!important;background:#DFF1E7!important}}.ch-o.no{{border-color:#A23B1E!important;background:#F6E1DA!important}}</style>'
             f'<script>(function(){{var sec=document.getElementById("{sid}");sec.querySelectorAll(".ch-o").forEach(function(o){{function go(e){{e.stopPropagation();var ok=o.getAttribute("data-ok")==="1";'
             f'sec.querySelectorAll(".ch-o").forEach(function(x){{x.classList.remove("ok","no")}});o.classList.add(ok?"ok":"no");'
             f'sec.querySelector(".ch-f").innerHTML="<b style=\\"color:"+(ok?"#2C8A5B":"#A23B1E")+"\\">"+(ok?"Correct. ":"Not quite. ")+"</b>"+o.getAttribute("data-why");}}'
             f'o.addEventListener("click",go);o.addEventListener("keydown",function(e){{e.stopPropagation();if(e.key==="Enter"||e.key===" "){{e.preventDefault();go(e)}}}});}});}})();</script>')
    return dl._sec(sid, theme, inner, notes)[0]

call1 = choice('call1', 'Your call: the 10-minute dosing',
 'The flask dosed a step in 10 minutes. The plant vessel has about 22 times less cooling wall per litre. What do you set for the plant?',
 [('Keep 10 minutes and run the agitator faster', False, 'Faster stirring helps the film on the wall a little. It cannot make up a 22-fold gap in cooling surface per litre.'),
  ('Set the dosing time from the jacket limit: about 3 hours or more', True, 'The jacket sets the pace. Dosing time is the shortest time that the heat can leave, plus a margin.'),
  ('Dose half the feed fast, then slow down', False, 'That front-loads the heat when the batch is least able to take it. Spread the heat evenly, or ease the feed rate so the jacket keeps up.')],
 "Give the room a minute. Ask for a show of hands for each option before anyone clicks. The agitator speed has a small effect on the wall film, not a twenty-fold one. The right call is to set the dosing time from what the jacket can remove, with a margin, so about three hours or more for these numbers. Starting fast and slowing down puts the worst heat load at the start. If someone suggests colder coolant, say yes, it helps in proportion to the driving force, but it will not close a 22-fold gap, and it can slow the reaction and cause accumulation.")

call2 = choice('call2', 'Your call: nothing is happening',
 'A fifth of the feed is in. The temperature has not moved and there is no sign of heat. The lab batch started within a minute. What do you do?',
 [('Keep dosing. It will start soon', False, 'Feed keeps piling up unreacted. When the reaction finally starts, all of it can react at once.'),
  ('Stop the feed and find out why', True, 'No heat means the reaction is not consuming the feed. Stop, hold, and find the cause before adding more.'),
  ('Raise the temperature to get it going', False, 'A hotter batch may start suddenly with a large stock of unreacted feed. That is how runaways begin.')],
 "This is the classic accumulation trap. Ask the room which is the natural reaction for most of us: to keep going, or to warm it up. Both are tempting and both are dangerous. If feed goes in and nothing reacts, it is building up. Stop the feed, hold the batch, check the agitator, the temperature, the catalyst or the quality of the material, and the sample. Only restart after you understand why. Later in the session, the live simulator shows how much the stock grows when a reaction is slow.")

call3 = choice('call3', 'Your call: a fast, mixing-sensitive step',
 'A fast reaction makes a by-product where the feed meets the batch. In the plant vessel you can only protect one of three things. Which?',
 [('The same rpm as the lab', False, 'The same rpm raises tip speed and power per litre by large factors, and is not a goal in itself.'),
  ('A blend time close to the lab, as far as the agitator and the feed point allow', True, 'For fast reactions, how quickly the feed spreads decides the by-product. Match that, and use a better feed point or a dilute feed to help.'),
  ('The same tip speed as the lab', False, 'Tip speed controls shear. It is not what decides how fast a feed is spread through the batch.')],
 "For a fast, mixing-sensitive step, the number that matters is how quickly the feed is spread through the batch: the blend time. With equal power per litre it grows by about eight times at this scale, so we cannot match it by speed alone. Practical answers: feed at the impeller or below the surface, dilute the feed, split the feed across two points, or slow the feed. Same rpm and same tip speed are choices of convenience, not of purpose.")

case = dl.bullets('case', 'A real case: when cooling was lost',
 ['A plant making a fuel additive, on its 175th batch, December 2007', 'The first step of the reaction was exothermic and ran away after the cooling failed', 'The reactor burst about ten minutes after the first report of a cooling problem', 'Four people were killed and 32 injured, most of them outside the plant', 'Investigators found a cooling system with single points of failure, a relief system too small for a runaway, and no recognition of the hazard'],
 "This is a real case, from the investigation by the US Chemical Safety Board of T2 Laboratories in Jacksonville, Florida, on 19 December 2007. It was a small plant, making a fuel additive in a batch reactor. On the 175th batch, in the first step, cooling was lost and the reaction ran away. About ten minutes after the first report of a cooling problem, the reactor burst. Four people died and 32 were injured, most of them in neighbouring businesses. The board found the cooling system had single points of failure, the relief system could not handle a runaway, and the people involved were not aware of the runaway hazard. Three of the first ten batches had also shown unexpected exotherms, which were warnings. Ask the room: which of our five questions would have caught this? Question one, can the jacket remove the heat, and question four, what is the worst case if cooling stops. Source: US Chemical Safety and Hazard Investigation Board, T2 Laboratories investigation report.",
 callout=('~10 min', 'from the first report of a cooling problem to the reactor bursting'))

formulas = dl.table('formulas', 'Six formulas worth keeping',
 ['What', 'Formula', 'Use it to'],
 [['Wall per volume (height = diameter)', '4 / D', 'See why bigger vessels cool worse per litre'],
  ['Cooling per litre', 'U × (wall / volume) × (T − Tjacket)', 'Find what the jacket can remove'],
  ['Shortest dosing time', 'Heat per litre ÷ cooling per litre', 'Set the dosing time for a heat-limited step'],
  ['Heat-up time', '(m·cp / UA) × ln[(Ts − T1) / (Ts − T2)]', 'Estimate heating and cooling times'],
  ['Power per litre', 'proportional to N³ × D²', 'Compare agitator scale-up rules'],
  ['Temperature if cooling stops', 'T + accumulated fraction × ΔT adiabatic', 'Judge the worst case']],
 "A formula sheet for the room to keep. All six are simple on purpose. Read each row: what it tells you, then when to use it. None replaces calorimetry or a proper study, but each one gives a quick check that a plan is not obviously wrong. Ask everyone to circle the one they would use first on their own product.",
 note='Illustrative first-pass checks. Use measured data and a proper thermal study for design.')

def after(sid, slide):
    for k, x in enumerate(S):
        if x.startswith(f'<section id="{sid}"'):
            S.insert(k + 1, slide); return
    raise SystemExit('missing ' + sid)
agit = dl.table('agitators', 'Agitators: pick by the job',
 ['Agitator', 'Flow', 'Power no.', 'Best for'],
 [['Hydrofoil', 'Axial', '0.3', 'Thin liquids, solids, gentle crystals'],
  ['Pitched blade turbine', 'Axial and radial', '1.3', 'General reactions, solids, blending'],
  ['Rushton disc turbine', 'Radial', '5', 'Gas dispersion, liquid-liquid, fast feeds'],
  ['Retreat curve (glass-lined)', 'Radial with swirl', '0.35', 'Corrosive duties, general blending'],
  ['Anchor', 'Swirl at the wall', 'laminar', 'Thick masses, heat transfer at the wall'],
  ['Helical ribbon', 'Up the wall, laminar', 'laminar', 'Very thick masses, pastes, polymers']],
 "Six agitators cover most batch plants. Read across each row: the flow it makes, its power number and its job. The power number tells you how much power the agitator draws at a given speed and size: a Rushton turbine draws about fifteen times more than a hydrofoil of the same size at the same speed. Axial impellers pump top to bottom and are good for blending and lifting solids. Radial impellers throw liquid at the wall and make shear, which is what gas and liquid-liquid dispersions need. Glass-lined reactors use a retreat curve impeller because the shape can be coated, and it usually has one baffle, so top-to-bottom mixing is weaker. In thick liquids, a turbine only stirs a small zone around itself; an anchor sweeps the wall for heat transfer, and a helical ribbon turns the whole batch over. On the live page, the agitator guide shows each one, and the mixing simulator lets you watch the flow pattern and a dye blending.",
 note='Typical turbulent power numbers for baffled vessels. Variants differ: confirm with the supplier curve.')

resist = dl.stats('resist', 'Where the heat gets stuck',
 [('49 %', 'of the resistance sits in the wall of a glass-lined reactor (illustrative solvent batch)'),
  ('+12 %', 'more U when the agitator speed is doubled in a stainless steel vessel'),
  ('8x', 'more agitator power for that doubling: power goes with speed cubed')],
 'Find the largest resistance before you buy more rpm.',
 "Heat leaves the batch through four resistances in series: the liquid film inside, the wall, any fouling, and the jacket film. Only the first one depends on the agitator. These numbers come from the heat-transfer simulator on the live page, for methanol, a pitched blade turbine at 90 rpm in a 10 cubic metre vessel and plain cooling-water jacket. In a glass-lined reactor about half of the resistance is the glass and the steel. (Click.) In stainless steel, doubling the speed raises the overall coefficient by about twelve percent, because the inside film coefficient rises only with speed to the power two thirds, and it is only one of four resistances. (Click.) And the power goes up eight times, which also puts heat into the batch. (Click.) So before asking for a faster agitator, find out which resistance is largest. For thick masses it is the inside film, and there the agitator matters a lot: about 88 percent of the resistance in the anchor example on the live page.")

after('mixsens', agit); after('dose', resist)
after('geo', drag_slide()); after('dose', call1); after('accum', call2); after('mixsens', call3); after('steps', formulas); after('signs', case)

n = build('scale-up-lab-to-plant', 'Scale-up: lab to plant', S)
print(n, 'slides')
