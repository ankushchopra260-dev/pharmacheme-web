#!/usr/bin/env python3
"""Deck: Pumps, seals and vacuum for operators. Run: python3 tools/decks/pumps-seals-vacuum.py"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from deck_lib import *

S = []
S.append(cover('cover', 'Operator training', 'Pumps, seals<br>and vacuum', 'What keeps them running, what kills them, and what you can check every shift',
 "Welcome. Pumps, mechanical seals and vacuum systems are the equipment operators touch most and the equipment that fails most often in our plant. Today is not a lecture on theory. It is about what you can see, hear and feel on your round, and the small habits that stop a failure before it becomes a shutdown. Ask the room first: who has heard a pump that sounded like gravel, and what did you do? Keep their answers on the board. We will come back to them when we reach cavitation. About eighty minutes, with live checks near the end."))

S.append(stats('numbers', 'Three numbers every pump operator uses',
 [('10 m', 'of water column is about 1 bar of pressure'), ('1.01 bar', 'is atmosphere, measured absolutely, at sea level'), ('0 bar', 'absolute is a perfect vacuum, the floor')],
 'A pump only moves liquid. Pressure and head tell you what it has to push against.',
 "Three numbers will carry us through the session. One bar is about ten metres of water column. That is why we talk about head in metres: a pump that makes thirty metres of head makes about three bar on water. Atmosphere is about one point oh one bar absolute, and nothing can go below zero absolute. That floor matters for the suction side and for vacuum. Ask the room: if a vessel gauge reads minus point nine bar, how much pressure is actually left? Hold the answer, we return to it in the vacuum section.", theme='light'))

S.append(compare('types', 'Two families of pumps',
 ('Centrifugal', ['Spins the liquid, so pressure builds with speed', 'Smooth flow, simple, handles large flows', 'Flow depends on what the pipe pushes back with', 'Never run against a closed discharge for long']),
 ('Positive displacement', ['Traps a fixed volume and pushes it forward', 'Nearly constant flow whatever the pressure', 'Handles thick liquids and slurries better', 'Must never run against a closed discharge: needs a relief valve']),
 "Almost every pump in the plant is one of two kinds. A centrifugal pump spins the liquid in an impeller. Flow depends on what the system pushes back with. Close the valve and it just churns and heats the liquid. A positive displacement pump traps a volume and pushes it out, so it keeps pushing even against a closed valve until something breaks, which is why it carries a relief valve. Ask the room: name one pump in your area of each kind, and say which one you would be more afraid to run against a closed valve."))

S.append(cards('jobs', 'Which pump for which job',
 [('Centrifugal', 'Water, solvent transfer, circulation and cooling duty'), ('Gear or lobe', 'Thick liquids, oils and resins at steady flow'), ('Diaphragm', 'Slurries, drum emptying, and a pump that can run dry'), ('Screw or progressive cavity', 'Viscous and shear-sensitive liquids')],
 "Here is the quick map. Plain solvents and water, which is most of what we move, go on centrifugal pumps. When the liquid is thick, as with oils and resin-like mixtures, a gear or lobe pump keeps a steady flow. Air-operated diaphragm pumps are what we use for slurries and for emptying drums because they tolerate solids and can run dry for a short time. Ask the room: which pumps in our plant are in the wrong service for what they carry today? Do not name people, name the pumps and what they are asked to do."))

S.append(bullets('curve', 'The pump curve and its best point',
 ['Every centrifugal pump has a curve: more flow means less head', 'The pump makes the most head at zero flow, called shut-off', 'There is one flow where it runs most efficiently, the best efficiency point', 'Far left of it: heat and vibration. Far right: overload and cavitation'],
 "This is the curve printed on every pump nameplate or data sheet. Flow runs across the bottom and head up the side. The more flow you ask for, the less head the pump can make. At the top left sits shut-off, where flow is zero. Somewhere in the middle is the best efficiency point, the flow where the pump is happiest, with the lowest vibration and longest seal life. Ask the room: where on the curve do you think our pump runs most of the time, and how would you know? We will use the next slides to find out.",
 theme='dark', callout=('BEP', 'Best efficiency point: aim to run within about 70 to 120 % of it.')))

S.append(guess('closed', 'Guess: you close the discharge valve fully',
 'A centrifugal pump is running. The operator shuts the discharge valve and leaves the pump running. What happens?',
 'Heat', 'Flow stops, but the motor still delivers power, which becomes heat in the liquid. In minutes it can boil, crack the casing and destroy the seal. Shut off the pump first, then the valve.',
 "Give the room ten seconds to shout answers before the click. Many will say nothing happens, because flow is zero and the pump feels safe. The truth is that all the motor power goes into churning the liquid inside the casing. It warms up, then boils, the seal faces lose their liquid film, and the casing can crack. On a small pump this takes a few minutes. Ask the room: have you ever touched a casing that was too hot to hold, and what was the valve position at the time?", theme='light'))

S.append(compare('throttle', 'Throttle the discharge, never the suction',
 ('Discharge valve', ['Pump keeps its full inlet pressure', 'The valve absorbs the extra head', 'Flow falls along the pump curve', 'Fine for control, but it wastes energy']),
 ('Suction valve', ['Steals pressure before the impeller', 'NPSH available drops straight away', 'Liquid flashes to vapour: cavitation', 'Never use it to control flow']),
 "Both valves reduce flow, but they do it in very different places. A discharge valve takes the extra head after the pump. The pump still sees a full inlet, and it stays healthy. A suction valve takes pressure away before the impeller. The liquid gets close to boiling, forms vapour bubbles, and the pump cavitates. On the right the suction valve is for isolation only: fully open or fully closed. Ask the room: have you seen a suction valve left half closed because the discharge one was stuck? What did the pump sound like?", theme='dark'))

S.append(bullets('system', 'The system curve and the operating point',
 ['The pipe also has a curve: static head plus friction that rises with flow squared', 'The pump runs where the two curves cross: the operating point', 'Closing a valve makes the system curve steeper and the point moves left', 'A bigger impeller or more speed lifts the pump curve and moves it right'],
 "The pump does not choose its flow. The pipe and valves do. Plot what the system needs, which is the static lift plus friction that grows fast with flow. Where that line crosses the pump curve is the operating point. Close a valve and the system line gets steeper, so the point slides left. Open it and the point slides right. The live simulator at the end lets you try this. Ask the room: if the flow is lower than the process needs, name three things that could move the operating point, other than the valve.",
 theme='light', callout=('Where they cross', 'The pump curve and the system curve meet at the flow you actually get.')))

S.append(stats('npsh', 'NPSH: the pressure margin at the pump inlet',
 [('NPSHa', 'what the plant gives: pressure above the vapour pressure at the inlet'), ('NPSHr', 'what the pump needs, from its data sheet, rising with flow'), ('NPSHa > NPSHr', 'with at least a metre or about 30 % to spare')],
 'Keep the liquid above its vapour pressure and it stays liquid.',
 "NPSH stands for net positive suction head. It is just a margin, measured in metres of liquid: how far the pressure at the pump inlet sits above the pressure where the liquid would turn to vapour. NPSHa is what our suction system provides. NPSHr is what the pump manufacturer says it needs, and it rises with flow. If available is smaller than required, bubbles form at the impeller eye and collapse. Ask the room: which is easier to change in the field, available or required? Hold that thought for the next slide.", theme='dark'))

S.append(table('npshfactors', 'What raises or lowers NPSH available',
 ['Change at the suction', 'Effect on NPSH available', 'Typical cause'],
 [['Tank level goes up', 'Rises', 'Filling the tank'], ['Liquid gets hotter', 'Falls: vapour pressure climbs', 'Warm day, steam tracing, hot batch'],
  ['Strainer or line blocks', 'Falls: friction loss grows', 'Dirty strainer, half-closed valve'], ['Tank under vacuum or low pressure', 'Falls', 'Vacuum on the receiver'], ['Pump placed higher than the tank', 'Falls: negative static head', 'Suction lift']],
 "This table is the practical version of NPSH. Raising the tank level helps. Heating the liquid hurts, because its vapour pressure goes up quickly, which is why a pump that is fine in the morning can cavitate in the afternoon. A blocked strainer adds friction. A tank under vacuum has less pressure pushing the liquid in. And a pump above the liquid level, a lift, subtracts. Ask the room: on a hot day, which of our pumps do you worry about first, and what do you check?",
 theme='light', note='Remember: NPSH required of the pump does not change. You change what the plant supplies.'))

S.append(guess('worked', 'Work it out: water from an open tank',
 'Open tank, water at 30 &deg;C (vapour pressure 4.2 kPa), liquid 2 m above the pump, 0.5 m of suction losses. The pump needs 3 m. Margin?'.replace('&deg;', '°'),
 '8.4 m', 'NPSHa = (101.3 - 4.2) kPa / (1000 x 9.81) = 9.9 m, plus 2 m, minus 0.5 m = 11.4 m. Margin over the 3 m required is 8.4 m. Safe.',
 "Let the room work this on paper for a minute before the click. Atmospheric pressure minus vapour pressure, divided by density and gravity, gives about nine point nine metres. Add the two metres of liquid above the pump, subtract half a metre of friction, and you get eleven point four. The pump needs three, so the margin is more than eight metres. This is easy. Now think about acetone at forty degrees with a metre of suction loss, which you will test in the live checks. Ask the room: what number do you expect to change most?", theme='dark'))

S.append(cards('cavitation', 'Cavitation: how you will know',
 [('It sounds wrong', 'Rattling, like gravel or marbles inside the pump'), ('It shakes', 'Vibration and a noisy bearing housing'), ('Numbers fall', 'Flow, discharge pressure and motor current go unsteady'), ('It damages', 'Pitted impeller, failed seals and bearings over time')],
 "Cavitation is vapour bubbles forming at the impeller inlet and collapsing as they move into higher pressure. Each collapse is a tiny hammer blow on the metal. You will hear it as gravel or marbles in the pump. You may feel vibration on the bearing housing. The flow and pressure gauges wander and the motor current drops or swings. Left alone, the impeller is eaten away and the seals follow. Ask the room: what is the first thing you check when you hear it? We want: suction valve open, strainer clean, tank level, and temperature.", theme='light'))

S.append(bullets('dryrun', 'Never run dry, and prime before you start',
 ['A pump full of air cannot pull liquid: centrifugal pumps are not self-priming', 'Vent the casing and fill it with liquid before the start', 'Check the tank level and the suction valve are open', 'Start with the discharge valve slightly open, then open it fully', 'Stop at once if flow, pressure or sound does not settle in a minute'],
 "Dry running is the fastest way to destroy a pump. The seal and the bearings rely on the liquid itself for lubrication and cooling. Centrifugal pumps cannot pull liquid through air. So before starting, vent the casing until liquid comes out of the vent, confirm the tank has level, and check the suction valve is open. Start with the discharge slightly open for a smooth start, then open it. If nothing changes in a minute, stop and look. Ask the room: which pumps in our plant sit above their tank, and how do you prime them?", theme='dark'))

S.append(cards('seals', 'A mechanical seal in four ideas',
 [('Two flat faces', 'One turns with the shaft, one stands still, a liquid film between them'), ('The film is everything', 'It lubricates, cools and leaks a few drops of vapour'), ('Flush keeps it cool', 'A flush plan brings clean, cool liquid to the faces'), ('Single or double', 'A double seal has a barrier fluid between two seals for toxic or flammable duty')],
 "A mechanical seal looks complicated but the idea is simple. One flat face turns with the shaft and one stays fixed. Between them sits a film of liquid thinner than a hair. That film lubricates and cools. A small flush line or a barrier fluid keeps the faces cool and clean. A single seal is fine for plain liquids. For toxic, flammable or hot liquids we use a double seal with a barrier fluid kept above process pressure. Ask the room: which pumps in our plant have double seals, and who checks the barrier tank level each shift?", theme='light'))

S.append(table('sealfail', 'Why seals fail and what to do',
 ['Cause', 'What you see', 'Operator action'],
 [['Dry running', 'Burnt, scored faces', 'Check level and prime before start'], ['Heat, no flush', 'Carbon deposit, cracked faces', 'Open the flush line, cooling water on'], ['Solids in the liquid', 'Worn, grooved faces', 'Report the strainer and flush condition'], ['Misalignment, bad bearings', 'Leak within days of fitting', 'Report vibration and noise early'], ['Barrier pressure lost', 'Barrier tank level or pressure moves', 'Stop and report: never top up and ignore']],
 "Nearly every seal failure we see comes from five causes. Dry running burns the faces. Lost flush or cooling overheats them. Solids grind them. Misalignment or a worn bearing makes them open and close with every turn. And on a double seal, losing the barrier pressure lets process liquid out or in. Notice that almost all of these start with a small sign that the operator can see on the round. Ask the room: which of these do you think we cause ourselves, and which come from the way the pump was installed? Be honest, this is about learning, not blame.", theme='dark'))

S.append(stats('gauge', 'Gauge and absolute: do not mix them',
 [('0 barg', 'is 1.01 bar absolute: atmosphere'), ('-0.5 barg', 'is 0.51 bar absolute: half a bar left'), ('-0.9 barg', 'is 0.11 bar absolute: a strong vacuum')],
 'Vapour pressure is always absolute. Convert before you compare.',
 "A vacuum gauge usually reads below zero gauge. But the liquid does not care about gauge, it responds to absolute pressure, which is gauge plus atmosphere. Minus half a bar gauge is about half a bar absolute. Minus nought point nine bar gauge leaves only about one tenth of a bar absolute, a hundred millibar. Vapour pressures in the tables are absolute, so always convert before you ask whether a liquid will boil. Go back to the question from the start: a gauge at minus point nine bar means how much pressure is actually left? About one tenth.", theme='light'))

S.append(cards('vacsources', 'Where our vacuum comes from',
 [('Liquid ring pump', 'Robust, handles vapour and a little liquid, uses a seal liquid'), ('Dry screw pump', 'No seal liquid, so cleaner, but sensitive to condensate and solids'), ('Steam ejector', 'No moving parts, uses steam, and needs the right motive pressure')],
 "Three kinds of vacuum source cover most of our plant. A liquid ring pump uses a ring of seal liquid, usually water or a solvent, and tolerates wet vapour well. The seal liquid has to stay cool and clean. A dry screw pump has no seal liquid, so nothing contaminates the process, but condensate or solids inside can damage it. A steam ejector has no moving parts and runs on steam pressure, so low steam pressure shows up as poor vacuum. Ask the room: which source do we have on each reactor and what is the first thing you check when the vacuum falls?", theme='dark'))

S.append(bullets('boiling', 'Vapour pressure: boiling under vacuum',
 ['A liquid boils when its vapour pressure equals the pressure above it', 'Lower the pressure and the boiling temperature falls', 'A warm liquid under strong vacuum can flash, foam and carry over', 'A pump on that line will cavitate and a vacuum pump will flood'],
 "Boiling is not only a matter of heat. It is the point where vapour pressure equals the pressure above the liquid. Lower the pressure and a cool liquid will boil. Water at about sixty millibar absolute boils at around thirty-six degrees. That is how we distil heat-sensitive products at low temperature. But the same effect hurts us when a warm liquid goes into a vacuum vessel too fast: it flashes, foams and carries liquid into the vacuum line. Ask the room: have you seen foam in a vacuum line, and what was the temperature at the time?",
 theme='light', callout=('36 °C', 'Water boils at about this temperature at 60 mbar absolute.')))

S.append(bullets('leaks', 'Vacuum not holding? Find the leak',
 ['Isolate the vessel and watch the pressure rise: that is the leak rate', 'Compare it with the last good test on the same vessel', 'Check flanges, gaskets, sight glasses, agitator seals, bottom valve and instrument tappings', 'To find the spot, pressurise with nitrogen and use soap solution, never a flame', 'Fix, then repeat the isolation test and record the result'],
 "A vacuum that does not hold costs hours of batch time and a lot of steam or power. First find out how bad it is. Isolate the vessel from the vacuum system, close it, and watch how fast the absolute pressure rises. That is your leak rate, and you should record it. Then look at the usual suspects: flanges, gaskets, sight glasses, the agitator seal, the bottom valve. To find the exact point, pressurise with nitrogen and use soap solution. Never use a flame near solvents. Ask the room: where was the last vacuum leak we found, and how long did it take?", theme='dark'))

S.append(table('checklist', 'Your daily round: what good looks like',
 ['Check', 'Good', 'Report if'],
 [['Sound and vibration', 'Smooth hum', 'Gravel, knock, new vibration'], ['Seal area and flush', 'Dry or a few drops, flush flowing', 'Dripping, smoke, hot flush line'], ['Suction and discharge gauges', 'Steady and normal', 'Swinging or lower than usual'], ['Casing and bearing temperature', 'Warm, can touch', 'Too hot to hold'], ['Vacuum level and seal liquid', 'At the set value, ring clean', 'Falling vacuum, cloudy seal liquid'], ['Strainer and valves', 'Clean and fully open', 'Half-closed suction, dirty strainer']],
 "This is the checklist you can take on your round. It needs no tools, only attention. Listen, feel, look, and note anything different from last time. The key habit is to report early. A pump that has started to sound different may run for weeks before it fails, and a quick report gives maintenance time to plan. Ask the room: which two of these would you add for our plant, and which one is hardest to do properly on a busy shift?",
 theme='light', note='Write down what you see. A number in the log is worth more than a memory.'))

S.append(live('tryit', 'Now you call it: five live checks',
 [('Will it cavitate?', 'Liquid, temperature and level'), ('Where does it run?', 'Close the valve, find the flow'), ('Will it boil?', 'Liquid, temperature and vacuum'), ('Name the seal failure', 'Symptom to cause'), ('Speed change', 'Flow, head and power')],
 "Open the live page now: pharmacheme.in/training/modules/pumps-seals-vacuum/live/ (the button on the module page opens it in a new tab). It has the five stations in this order, plus a pump curve simulator with a valve slider. Tick show answers immediately if you want to skip the reveal. Each station follows the same rhythm: I set the situation, the room calls it, then I reveal. Ask a supervisor about the cavitation check, an operator about the seal case, and an engineer about the boiling check."))

S.append(mythfact('myths', 'Myth or fact?',
 [('"Closing the discharge valve fully is a safe way to park a centrifugal pump."', 'Myth', 'Power turns to heat in the casing. Stop the pump first.'),
  ('"A strainer that looks half-blocked is fine until flow drops."', 'Myth', 'It lowers NPSH first. Cavitation starts before flow falls.'),
  ('"A seal weeping a few drops at start-up can settle on its own."', 'Fact', 'New faces can bed in. Keep watching; steady dripping is a failure.')],
 "Three statements, one at a time. Ask the room to vote with a show of hands before each click. The first one is a myth: power goes to heat, and a fully closed valve can boil the liquid in minutes. The second is also a myth. The strainer loss steals NPSH, and cavitation can start long before the flow visibly falls. The third is a fact, but with a limit. A new seal can weep slightly while the faces bed in, but if it keeps dripping it is not settling, it is failing. Ask: which of these did you believe before today?", theme='light'))

S.append(rules('rules', 'Five rules to take back to the plant',
 ['Prime, vent and check the level before every start.', 'Throttle on the discharge. Never on the suction.', 'Never run against a closed valve or dry.', 'Keep flush, cooling and barrier at the right values.', 'Listen, feel, look, and report early.'],
 "Read the five rules aloud and ask the room to repeat the first one. Then take questions. If time allows, ask each table to name the one rule they think is most often broken here, and the first thing they would change next week. Close by thanking the operators in the room: they are the first line of defence, they hear the pump before anyone else does, and a quick word to maintenance is worth more than any instrument."))

if __name__ == '__main__':
    ids = [s.split('id="')[1].split('"')[0] for s in S]
    assert len(ids) == len(set(ids))
    n = build('pumps-seals-vacuum', 'Pumps, seals and vacuum for operators', S)
    print('slides', len(S))
