#!/usr/bin/env python3
"""Deck: Runaway reactions and safe dosing. Run: python3 tools/decks/runaway-reactions-safe-dosing.py"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from deck_lib import *

S = []
S.append(cover('cover', 'Process safety training', 'Runaway<br>reactions',
    'Safe dosing, accumulation and what happens when cooling fails',
    "Welcome. Today is about one question: if cooling stopped right now, how hot would this reactor get? Every one of us has a part in that answer. The operator controls the dosing, the supervisor checks the interlocks, the engineer knows the heat of reaction, and the plant head approves the safeguards. Keep it interactive. I will ask you to guess numbers before I show them, and near the end the room will call safe or unsafe on live cases. First question to start: who here has seen a reactor temperature climb faster than expected during an addition? Keep that picture in mind."))

S.append(stats('hook', 'Heat is easy to make and hard to remove',
    [('~2', 'kJ/kg/K: heat capacity of a typical organic reaction mass'),
     ('~100 K', 'Adiabatic rise of a moderately exothermic step (illustrative)'),
     ('0 K', 'Temperature rise the cooling system prevents once it has failed')],
    'Cooling only helps while it works. Safety is about what is left in the reactor when it stops.',
    "Start with three numbers. A typical reaction mass has a heat capacity near 2 kJ per kilogram per kelvin, so it takes a lot of heat to warm it, but a lot of heat is also available. (Click.) A moderately exothermic step can raise the whole mass by around a hundred kelvin if no heat leaves. That number is illustrative, not from any one process. (Click.) And once cooling fails, the cooling system prevents none of that. Ask the room: in our plant, what is the first thing that stops when we lose power? Take two answers. Then reveal the closing line.", 'dark'))

S.append(cards('whyrun', 'Why reactions run away', [
    ('Heat made rises fast', 'Reaction rate roughly doubles for every 10 K. Heat release climbs exponentially with temperature.'),
    ('Heat removed rises slowly', 'Cooling through the wall is proportional to the temperature difference. It grows in a straight line.'),
    ('Reagent can pile up', 'If it is dosed faster than it reacts, unreacted reagent waits in the reactor like stored fuel.'),
    ('Big vessels cool worse', 'Volume grows faster than wall area as we scale up, so heat removal per litre falls.')],
    "Four reasons, one by one. (Click.) Heat made: reaction rate roughly doubles for every ten degrees, so heat release rises exponentially. (Click.) Heat removed rises in a straight line with the temperature difference across the wall. (Click.) Accumulation: reagent added faster than it reacts is stored energy. (Click.) Scale-up: our plant vessels have much less wall area per litre than a lab flask. Ask the room: which of these four do you think causes most trouble in our plant, and why? Write the votes on the board and come back to them at the end.", 'light'))

S.append(compare('curves', 'Two curves decide the outcome',
    ('Heat made by the reaction', ['Curves upward, exponential in T', 'Doubles roughly every 10 K', 'Depends on how much reagent is present', 'Cannot be switched off instantly']),
    ('Heat removed by cooling', ['A straight line in T', 'Limited by wall area and jacket temperature', 'Falls to zero if cooling fails', 'Needs the agitator running to work']),
    "Draw the two curves on the board while this slide is up. (Click.) The reaction heat curve bends upward. (Click.) The cooling line is straight. At low temperature the line is above the curve, so the reactor is stable. Where the curve crosses above the line, any small rise makes more heat than we can remove, and the temperature keeps climbing. That crossing is the point of no return. Ask the room: what can we change to move the cooling line up, and what can we change to push the reaction curve down? Expect answers like a colder jacket, a slower feed or more agitation.", 'dark'))

S.append(bullets('dtad', 'Adiabatic temperature rise', [
    'Q = heat released by the reagent charge, in kJ',
    'm = mass of the reaction mixture, in kg',
    'cp = heat capacity of the mixture, in kJ/kg/K',
    'No cooling: the whole mass absorbs all the heat'],
    "This is the first formula. Delta T adiabatic equals Q divided by m times cp. Read the four lines in turn. (Click each.) Q is the heat the reagent would release if it all reacted. m is the mass of everything in the reactor. cp is the heat capacity of that mixture. And adiabatic means no heat leaves, which is exactly what a cooling failure looks like. It is not a measurement of how hard the reaction is. It is a measure of how far the temperature could go. Ask the room: if we double the concentration, what happens to this number? It doubles, and so does the risk.", 'light', callout=('ΔTad = Q / (m·cp)', 'The temperature the batch would climb by with no heat removed.')))

S.append(guess('g1', 'Guess before you calculate',
    'Reaction mass cp is 2.0 kJ/kg/K. The reagent is 1.0 mol per kg of mixture and releases 160 kJ/mol. What is the adiabatic rise?',
    '80 K',
    'Q per kg = 1.0 mol × 160 kJ/mol = 160 kJ/kg. Divide by cp: 160 / 2.0 = 80 K. Started at 60 °C, that reaches 140 °C.',
    "Read the question and give people a minute. Ask three people to call out a number before anyone looks at the answer. Many will say 160, forgetting to divide by the heat capacity. (Click to reveal.) Heat per kilogram is 160 kilojoules. Divide by 2.0 and the rise is 80 kelvin. Start at 60 and you reach 140 degrees, which is above the boiling point of most of our common solvents. Ask: what would happen to the pressure in the reactor at that temperature? Then say the lesson: a modest looking charge can heat the whole batch past its boiling point.", 'dark'))

S.append(cards('semibatch', 'Batch or semi-batch?', [
    ('Batch: all in at once', 'All the energy is present from the start. Safe only for mild reactions or small scale.'),
    ('Semi-batch: dose slowly', 'The feed controls the heat. We add reagent only as fast as the cooling can handle.'),
    ('The promise', 'If every drop reacts as it arrives, stopping the feed stops the heat.'),
    ('The catch', 'If reagent does not react on arrival, dosing builds up stored energy instead.')],
    "Why do we dose at all? Because slow dosing lets us control heat with a valve. (Click.) A batch reaction has all the fuel present from the beginning. (Click.) In semi-batch, the feed rate sets the heat rate. (Click.) The promise is that every drop reacts immediately. (Click.) The catch is accumulation, which is the subject of the next slides. Ask the room: which of our steps do we add slowly, and why? Then ask: how do we know the reagent is reacting as it goes in? If nobody has a good answer, the room has just found the gap.", 'light'))

S.append(bullets('accum', 'Accumulation: the hidden fuel', [
    'Dose rate higher than reaction rate: reagent builds up',
    'Low temperature slows the reaction and increases accumulation',
    'Wrong catalyst, poor mixing or late initiation do the same',
    'A sudden start then releases all of it together'],
    "Accumulation is reagent that has been added but has not yet reacted. (Click.) It happens when we dose faster than the reaction consumes. (Click.) The classic trap is running the reaction cold. It feels safe, but a cold reaction is a slow reaction, so reagent stacks up. (Click.) Poor mixing, a missing catalyst or an initiation delay do the same. (Click.) Then something starts the reaction and all the stored reagent reacts together. Ask the room: have you ever had a reaction that did nothing for a while, then took off? That is accumulation. The answer is never to heat up in a hurry. It is to stop the feed and investigate.", 'dark', callout=('X_acc', 'Fraction of the dosed reagent that is unreacted at a given moment.')))

S.append(compare('fastslow', 'Feed-controlled or accumulating?',
    ('Feed-controlled (safe pattern)', ['Reaction is fast at process temperature', 'Reagent is consumed as it arrives', 'X_acc is small, below about 10 %', 'Stop the feed and the heat stops']),
    ('Accumulating (dangerous pattern)', ['Reaction is slow, cold or not yet started', 'Reagent builds up in the reactor', 'X_acc is large, 30 % or more', 'Stopping the feed does not stop the heat']),
    "Two patterns to recognise. (Click.) On the left the reaction is quick and reagent never builds up. Stop the feed and the temperature falls. Those percentages are rules of thumb to make the point, not limits. (Click.) On the right the reaction is slow, so reagent builds up. Stop the feed and the temperature can still rise, because the stored reagent keeps reacting. Ask the room: how can the operator tell from the panel which pattern is happening? Look at the reactor temperature minus jacket temperature, or heat flow from calorimetry. If the temperature difference falls while we are still dosing, the reaction is not keeping up.", 'light'))

S.append(stats('mtsr', 'MTSR: the worst case after a failure',
    [('60 °C', 'Process temperature, Tp'),
     ('+40 K', 'X_acc 0.5 times a full-batch ΔTad of 80 K'),
     ('100 °C', 'MTSR = Tp + X_acc × ΔTad')],
    'MTSR is the temperature the reactor reaches if cooling fails at the worst moment.',
    "MTSR stands for maximum temperature of the synthesis reaction. It is the temperature we would reach if cooling failed at the worst moment, which is when accumulation is highest. The formula is simple. MTSR equals process temperature plus the accumulated fraction times the adiabatic rise. (Click.) Here Tp is 60. (Click.) Half the reagent is unreacted, and a full-batch rise of 80 kelvin makes 40. (Click.) So MTSR is 100 degrees. Ask the room: if we halve the accumulation, what happens? We lose 20 kelvin of risk. The lesson is that accumulation is something we can control by dose time and temperature.", 'dark'))

S.append(table('levels', 'Four temperatures to know',
    ['Symbol', 'Name', 'Question it answers'],
    [['Tp', 'Process temperature', 'Where do we normally run?'],
     ['MTSR', 'Max temperature of synthesis reaction', 'How hot after a cooling failure?'],
     ['MTT', 'Max temperature for technical reasons', 'What is the vessel limit, such as boiling at relief pressure?'],
     ['TD24', 'Decomposition temperature, 24 h', 'Where does a 24 hour time to runaway begin?']],
    "Every safety study for a reaction ends up comparing these four temperatures. (Click each row.) Tp is where we run. MTSR is where we end up if cooling fails. MTT is the technical limit, for example the boiling point at the relief valve set pressure or the vessel design temperature. TD24 is the temperature at which the reaction mass would take 24 hours to reach its maximum rate under adiabatic conditions. If MTSR stays below both MTT and TD24, we have a lot of margin. Ask the room: which of these four do we have written down for our key processes? Often the answer is only Tp.", 'light',
    note='Rule: the order of these four temperatures sets the criticality class.'))

S.append(bullets('mtt', 'MTT: the technical limit', [
    'Boiling point at the relief valve set pressure',
    'Or the design temperature of the vessel, lining or gasket',
    'Boiling can cool, but it also makes vapour and pressure',
    'Above MTT the reaction is out of the safe design envelope'],
    "MTT is the highest temperature the equipment can safely hold. (Click.) Often it is the boiling point at the relief valve set pressure. (Click.) It can also be the design temperature of glass lining, gaskets or the shell. (Click.) Boiling can remove heat, but only if the condenser and relief system can handle the vapour. Many incidents come from vapour rates beyond the vent capacity. (Click.) Above MTT we are outside the design basis. Ask the room: what is the lowest temperature limit in our reactor, a lining, a gasket or a boiling point? The weakest part sets the limit, not the reactor shell.", 'dark'))

S.append(bullets('tmr', 'TMRad and TD24: how much time?', [
    'TMRad = time from a given temperature to the maximum rate, with no cooling',
    'TD24 = the temperature where TMRad is 24 hours',
    'Rule of thumb: every 10 K lower roughly doubles TMRad',
    'Hours of warning means time to act; minutes means no time'],
    "Temperature is only half the story. Time matters. TMRad is the time to maximum rate under adiabatic conditions. (Click.) Starting from a given temperature, it tells us how long before the reaction mass runs away. (Click.) TD24 is simply the temperature where that time is 24 hours. (Click.) A rough rule says that every 10 kelvin lower roughly doubles the time. It depends on the activation energy, so treat it as an estimate. (Click.) If we have hours, an operator can respond. If we have minutes, only an automatic safeguard can help. Ask the room: how long does our shift take to notice and respond to an alarm at night?", 'light'))

S.append(table('classes', 'Stoessel criticality classes',
    ['Class', 'Cooling failure leads to', 'What it means'],
    [['1', 'MTSR below MTT and TD24', 'No boiling, no decomposition'],
     ['2', 'MTSR below TD24 and MTT, with MTT above TD24', 'Safe on MTSR; keep MTT in mind'],
     ['3', 'MTSR above MTT, below TD24', 'Boiling reached; vent must cope'],
     ['4', 'MTSR above TD24, MTT below TD24', 'Decomposition triggered after MTT'],
     ['5', 'MTSR above TD24, TD24 below MTT', 'Decomposition before boiling; redesign']],
    "This is the Stoessel scheme in simplified form. We compare the four temperatures and get five classes. (Click each row.) Class 1 and 2 are the comfortable ones, because the cooling failure does not reach boiling or a decomposition. Class 3 reaches boiling, so we must prove the vent and condenser can handle the vapour. Classes 4 and 5 can trigger decomposition, and class 5 does so before boiling can help. Class 5 needs a different process or different conditions. Ask the room: which class would we want our own processes to be? Then ask which ones we have actually classified. This slide is a teaching summary. Check against the original reference before using it.", 'dark',
    note='Simplified teaching summary of the commonly taught scheme. Confirm against Stoessel, Thermal Safety of Chemical Processes, for design work.'))

S.append(compare('stopfeed', 'Does stopping the feed stop the reaction?',
    ('Yes, when accumulation is low', ['The reaction consumes the reagent in minutes', 'Heat output falls quickly', 'Temperature starts to drop', 'Feed stop is a strong safeguard']),
    ('No, when accumulation is high', ['Stored reagent keeps reacting', 'Heat continues for a long time', 'Temperature can still rise to MTSR', 'Cooling is needed even after feed stop']),
    "This is the most important question of the session. (Click.) With low accumulation, stopping the feed removes the fuel supply and the temperature falls. (Click.) With high accumulation, the fuel is already inside. Stopping the feed does not remove it. The reactor can still climb all the way to MTSR, and if cooling has also failed, nothing brings it back. Ask the room: in our procedure, what do we tell the operator to do when temperature goes high? Many procedures say stop the feed, and that is right, but only half the job. The next question is whether cooling is working.", 'light'))

S.append(cards('failures', 'Four ways to lose control', [
    ('Cooling failure', 'Power, utility or pump loss. Heat removal drops to zero, so the batch warms adiabatically.'),
    ('Agitation failure', 'Reagent lies in an unmixed layer. A restarted agitator mixes it all at once.'),
    ('Dosing too fast', 'A wrong rate, a stuck valve or a wrong pump setting adds energy faster than cooling can remove.'),
    ('Wrong conditions', 'A cold start, wrong catalyst or wrong charge can make the reaction slow and build up reagent.')],
    "Four ways it goes wrong. (Click.) Cooling failure: a utility trips and nothing carries the heat away. (Click.) Agitation failure is the sneaky one. Reagent sits as an unmixed layer, the reaction looks calm, then someone restarts the stirrer and everything reacts together. That is why many procedures say do not restart the agitator without checking. (Click.) Dosing too fast. (Click.) Wrong conditions, for example the wrong temperature or a missed charge. Ask the room: which of these has the plant seen? Ask what we did about it. Remind everyone that near misses count and are worth reporting.", 'dark'))

S.append(stats('scale', 'Scale-up: wall area per litre falls',
    [('1000×', 'Volume when vessel size goes up 10 times in each direction'),
     ('100×', 'Wall area for the same change'),
     ('1/10', 'Wall area per litre, so heat removal per litre')],
    'A dose time that is safe in the lab can be unsafe in the plant.',
    "A reaction is a volume process and cooling is a surface process. If a vessel is ten times larger in each direction, its volume grows by a thousand and its wall area by a hundred. (Click.) That is the volume. (Click.) That is the area. (Click.) So the wall area per litre is only a tenth. The reaction makes the same heat per litre, but cooling per litre falls to a tenth. Dose times must therefore get longer on scale-up, not stay the same. Ask the room: have we ever copied a lab addition time straight into the plant? What happened to the temperature? Practical lesson: check heat removal before accepting the lab dose time.", 'light'))

S.append(bullets('controls', 'Safe dosing controls', [
    'High-temperature interlock stops the feed automatically',
    'Dosing only starts above a minimum temperature, and stops below it',
    'Agitator proof, cooling flow and jacket temperature all checked',
    'Quench or dump route sized and tested for the worst case'],
    "Now what do we put in place. (Click.) A high temperature interlock that stops the feed without waiting for an operator. (Click.) A minimum temperature for starting the feed, so we do not accumulate in a cold, slow reaction. (Click.) Proof that the agitator is running, cooling flow is present and the jacket is at the right temperature. (Click.) A quench or dump route, which must be sized and tested for the worst case and not just installed. Ask the room: which of these four does our plant have on every reactor, and which are only on some? Interlocks that are bypassed to save time are not safeguards. Say that plainly.", 'dark'))

S.append(guess('worked', 'Worked example: will it stay safe?',
    'Tp is 60 °C. ΔTad is 80 K. The feed was just stopped, with 40 % of the reagent unreacted when cooling failed. The solvent boils at 85 °C. What temperature does the batch reach?',
    '92 °C',
    'MTSR = 60 + 0.40 × 80 = 92 °C. That is above the 85 °C boiling point, so the batch boils and the vent must handle the vapour. Class 3 or worse.',
    "Work this through in four steps on the board. Process temperature 60. Accumulation 0.40. Adiabatic rise 80. (Click to reveal.) MTSR is 60 plus 32, which is 92 degrees. Boiling point is 85. So after a cooling failure at this moment the batch passes its boiling point. Ask the room: what would we change? Good answers: lengthen dose time, raise Tp slightly so the reaction is faster and accumulation is lower, or add a stronger interlock. Point out that we got this from four numbers and a pencil. No simulation was needed to see the problem.", 'dark'))

S.append(live('tryit', 'Now you call it: five live checks', [
    ('Adiabatic rise:', 'how hot if all the heat stays in?'),
    ('Accumulation:', 'does the feed outrun the reaction?'),
    ('Criticality class:', 'set the four temperatures'),
    ('Scale-up:', 'can the plant remove the heat?'),
    ('Safeguards:', 'which protections are missing?')],
    "Open the live page now: pharmacheme.in/training/modules/runaway-reactions-safe-dosing/live/ (the Open live checks button on the module page opens it in a new tab). It has the five stations in this order, plus a semi-batch dosing simulator with a cooling failure switch. Tick show answers immediately if you want to skip the reveal. For each station: explain the idea in one line, set the situation, let the room call safe or unsafe, then reveal. Pick people from different roles. Ask an operator about safeguards, an engineer about the adiabatic rise, and the plant head about the scale-up question. About 20 minutes."))

S.append(mythfact('myths', 'Myth or fact?', [
    ('A slow reaction is a safe reaction.', 'Myth', 'Slow reactions build up reagent. The hazard is stored energy.'),
    ('If cooling fails, stopping the feed saves us.', 'Myth', 'Only if little reagent has built up. Otherwise MTSR can still be reached.'),
    ('A longer dose time lowers the worst case.', 'Fact', 'More time for the reagent to react before the next lot arrives, usually lowering X_acc.')],
    "Three statements. Ask the room to vote with raised hands before each reveal. (Click.) A slow reaction is safe? Myth. Slow reactions accumulate reagent. (Click.) If cooling fails, stopping the feed saves us? Myth, unless accumulation is low. (Click.) A longer dose time lowers the worst case? Fact, in most cases, because reagent has time to react. The caveat is that if the reaction is very slow at the process temperature, a longer dose time may not help. In that case we raise the temperature or fix the cause. Ask: which of the three surprised you? Write the answer down. Those are the gaps for our next shift talk.", 'light'))

S.append(cards('roles', 'What each of us will do from Monday', [
    ('Operators', 'Check agitator, cooling and jacket before dosing. Never bypass a temperature interlock.'),
    ('Supervisors', 'Do not allow dosing to start cold. If the temperature runs high, stop the feed and call the engineer.'),
    ('Engineers', 'Find heat of reaction, ΔTad and accumulation for each exothermic step. List the four temperatures.'),
    ('Plant head', 'Fund tested dump and quench routes. Review dose times at every scale-up.')],
    "Before showing these, ask each group: what is one thing you can change next week? Write the answers on the board, then reveal the suggestions one by one. (Click four times.) The point is that each role holds a different lever. Operators hold the moment of dosing. Supervisors hold the start conditions and the escalation. Engineers own the numbers. The plant head owns the money and the culture around bypassing safeguards. Ask each group to commit to one action in writing before they leave the room, and put a date on it. At the next meeting, check how many were done.", 'dark'))

S.append(rules('rules', 'Five rules to take back to the plant', [
    'Know ΔTad: Q divided by m times cp.',
    'Dose slowly and prove the reagent reacts.',
    'Never run cold and add fast.',
    'Compute MTSR and compare with MTT.',
    'Never bypass the temperature interlock.'],
    "Read the five rules aloud and ask the room to repeat the first one. Rule one: know the adiabatic rise. Two: dose slowly, and prove the reagent is reacting. Three: never run cold and add fast, because that is how accumulation starts. Four: calculate MTSR and compare it with the technical limit. Five: never bypass the temperature interlock. Then take questions. If time allows, ask each table to name the one rule they think is most often broken here, and why. Close by reminding everyone that the numbers on these slides are teaching values. Real decisions need measured data for the real process."))

n = build('runaway-reactions-safe-dosing', 'Runaway Reactions and Safe Dosing', S)
print('slides', n)
