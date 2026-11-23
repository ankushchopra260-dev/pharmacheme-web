"""Whiteboard lesson: batch heating and cooling. Run: python3 tools/whiteboard/batch_heating_cooling.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, main, reactor

SLUG = 'batch-heating-cooling'
TITLE = 'Batch heating and cooling'
CALC = '/calculators/jacketed-vessel-heat-transfer/'
CALC_LABEL = 'Open the jacketed vessel calculator'
ENDS = ['Your batches will hit temperature on time.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: heating and cooling a batch in a jacketed reactor. Why it always takes longer than you think. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Now work out your own heat-up time in the jacketed vessel calculator."
SPOKEN = ((' kg', ' kilograms'), ('kcal/kg °C', 'kilocalories per kilogram degree'), ('mCp', 'm C p'), ('UA', 'U A'), ('U A', 'U eigh'), ('times A times', 'times eigh times'), ('kcal/h °C', 'kilocalories per hour degree'), ('kcal/°C', 'kilocalories per degree'), ('Cp', 'C p'), ('°C', ' degrees'), ('ΔT', 'temperature difference'))

STEPS = [
    {
        "q": "How much heat does it take to warm 5000 kg of batch (Cp 0.5 kcal/kg °C) from 25 to 75 °C?",
        "opts": [
            ["125,000 kcal", True, "125,000. Correct!"],
            ["250,000 kcal", False, "You forgot the 0.5. That's water's heat capacity, not this batch's."],
            ["12,500 kcal", False, "A zero went missing somewhere. Check again."],
            ["187,500 kcal", False, "That's from 0 to 75, not 25 to 75."],
        ],
        "title": "Heat needed",
        "beats": [
            ["Heat equals mass times heat capacity times the temperature rise.",
             [["t", 20, 86, "Q = m × Cp × ΔT", 24, "b"]]],
            ["5000 times 0.5 times 50 degrees.",
             [["t", 20, 130, "5000 × 0.5 × (75 − 25)", 20, "k"]]],
            ["That's 125,000 kilocalories, plus the vessel steel, often a sizeable extra.",
             [["t", 20, 172, "= 125,000 kcal", 24, "r"], ["t", 20, 204, "+ the vessel steel (often sizeable)", 17, "o"]]],
            ["The heat is the easy part. How long it takes depends on the jacket, as the next questions show.",
             [["t", 20, 252, "how long? → depends on the jacket", 17, "g"]]],
        ],
        "summary": "Heat required is mass × heat capacity × temperature rise: 5000 kg × 0.5 kcal/kg °C × 50 °C = 125,000 kcal, plus some heat for the vessel steel. How long it takes depends on the jacket's heat transfer.",
    },
    {
        "q": "A batch heats quickly at first, then slows down near the jacket temperature. Why?",
        "opts": [
            ["The steam runs out", False, "The steam is still there. It just has less to push against."],
            ["The ΔT keeps shrinking", True, "Yes! Less difference, less heat flow."],
            ["The agitator slows", False, "The agitator runs at the same speed. Look at the driving force."],
            ["The batch gets thicker", False, "Possibly, but even water does this. It's the driving force."],
        ],
        "title": "Shrinking ΔT",
        "beats": [
            ["Heat flow is U times A times the difference between jacket and batch.",
             [["t", 20, 86, "Q = U × A × (T jacket − T batch)", 18, "b"]]],
            ["As the batch warms, that difference shrinks. So the heat flow falls.",
             [*axes(40, 110, 320, 300, "time", "°C"), ["p", "M44,140 L320,140", "r", 1.5], ["t", 240, 134, "jacket 120", 14, "r"],
              ["p", "M44,290 Q110,180 200,156 Q260,146 316,143", "b", 3], ["t", 120, 250, "batch", 15, "b"]]],
            ["The batch creeps towards the jacket temperature but never quite gets there.",
             [["t", 20, 336, "creeps up, never quite reaches", 18, "o"]]],
            ["So the last few degrees are always the slowest.",
             [["t", 20, 368, "last few degrees: slowest", 18, "r"]]],
        ],
        "summary": "Heat flow is U × A × (jacket temperature − batch temperature). As the batch warms, the temperature difference shrinks, so heat flow falls and the batch approaches the jacket temperature ever more slowly. The last few degrees always take the longest.",
    },
    {
        "q": "Jacket 120 °C, batch 25 → 75 °C, mCp 2500 kcal/°C, UA 2500 kcal/h °C. How long?",
        "opts": [
            ["About 20 minutes", False, "Too quick. The shrinking temperature difference slows it."],
            ["About 1 hour 20 minutes", False, "Too slow for this step. Check the log term."],
            ["About 2 hours", False, "That's closer to heating on to 115. Not this step."],
            ["About 45 minutes", True, "About 45 minutes. Correct!"],
        ],
        "title": "Heat-up time",
        "beats": [
            ["For a jacket at constant temperature, time equals m C p over U A, times a log term.",
             [["t", 20, 86, "t = (mCp ÷ UA) × ln[(Tj − T1) ÷ (Tj − T2)]", 15, "b"]]],
            ["m C p over U A is 2500 over 2500: one hour. The log term is the log of 95 over 45, which is about 0.75.",
             [["t", 20, 126, "mCp ÷ UA = 1 h", 19, "k"], ["t", 20, 154, "ln(95 ÷ 45) ≈ 0.75", 19, "k"]]],
            ["So about 0.75 hours. About 45 minutes.",
             [["t", 20, 196, "t ≈ 0.75 h ≈ 45 min", 22, "r"]]],
            ["Going on from 75 to 115 takes the log of 45 over 5, about 2.2 hours. Three times longer for fewer degrees.",
             [["t", 20, 248, "75 → 115 °C: 1 h × ln(45 ÷ 5) ≈ 2.2 h", 17, "o"], ["t", 20, 276, "3 × longer, fewer degrees", 17, "o"]]],
        ],
        "summary": "With a jacket at constant temperature, heat-up time t = (mCp ÷ UA) × ln[(Tj − T1) ÷ (Tj − T2)]. Here mCp ÷ UA = 2500 ÷ 2500 = 1 h and ln(95 ÷ 45) ≈ 0.75, so t ≈ 0.75 h, about 45 minutes. Heating on from 75 to 115 °C takes ln(45 ÷ 5) ≈ 2.2 h, three times longer for fewer degrees.",
    },
    {
        "q": "The same batch, in a taller reactor, covers only half the jacket. Heat-up time?",
        "opts": [
            ["Just as fast", False, "Same batch, but only the wetted wall works. Less area, slower."],
            ["Slower: less wetted wall", True, "Yes! Only the wall touching liquid counts."],
            ["Faster: bigger vessel", False, "A bigger vessel doesn't help if the batch only wets half of it."],
            ["The jacket floods", False, "The jacket doesn't care about the batch level."],
        ],
        "title": "Wetted area",
        "beats": [
            ["Only the wall in contact with the batch transfers heat into it.",
             [*reactor(110, 70, 140, 200, 190), ["t", 196, 218, "wetted area: works", 15, "g"], ["t", 196, 140, "dry wall: no use", 15, "r"]]],
            ["Same mass, less area. m C p over U A goes up, so it takes longer.",
             [["t", 20, 312, "same batch, less area → slower", 18, "r"]]],
            ["A hot jacket above the liquid can bake product onto the dry wall. Check the temperature probe and the agitator blades are under the liquid too.",
             [["t", 20, 342, "hot dry wall → baked product", 17, "o"]]],
            ["Use the area at your actual level, and heat only the jacket zones below it if you can.",
             [["t", 20, 376, "use area at actual level", 18, "g"]]],
        ],
        "summary": "Only the vessel wall in contact with the batch transfers heat, so the same batch in a taller vessel, covering only part of the jacket, heats more slowly. A hot jacket above the liquid can also bake product onto the dry wall. Use the heat transfer area at the actual level, heat only the zones below it where possible, and make sure the temperature probe and agitator are submerged.",
    },
    {
        "q": "A glass-lined reactor cools slowly, even with brine. What usually limits it?",
        "opts": [
            ["The glass lining", True, "The glass! Great for corrosion, poor for heat."],
            ["The steel shell", False, "Steel conducts heat well. It's not the bottleneck."],
            ["The jacket being too cold", False, "Colder brine helps. It's not the limit."],
            ["The batch volume", False, "Volume sets how much heat, not how fast it moves."],
        ],
        "title": "Glass limits U",
        "beats": [
            ["Heat crosses the batch film, the glass, the steel, and the jacket film.",
             [["p", "M140,70 L140,250", "b", 3], ["p", "M149,70 L149,250", "k", 12], ["t", 100, 62, "glass", 15, "b"], ["t", 162, 62, "steel", 15, "k"],
              ["t", 30, 160, "batch", 16, "k"], ["t", 220, 160, "jacket", 16, "k"]]],
            ["Glass conducts heat about forty times worse than carbon steel. A thin layer is still a big resistance.",
             [["t", 20, 290, "glass: ~40 × worse than steel", 18, "r"]]],
            ["So glass-lined reactors have a much lower U than steel ones, often a few hundred kilocalories per square metre per hour per degree.",
             [["t", 20, 326, "U lower than a steel vessel", 18, "o"]]],
            ["Faster agitation helps only a little. Plan for the longer cooling time.",
             [["t", 20, 362, "plan longer cooling time", 18, "g"]]],
        ],
        "summary": "Heat crosses the batch-side film, the glass lining, the steel wall and the jacket-side film. Glass conducts heat roughly forty times worse than steel, so even a thin lining is a large resistance and glass-lined reactors have a much lower overall coefficient U than steel vessels, often a few hundred kcal/h m² °C. Faster agitation helps only a little; plan for longer cooling times.",
    },
    {
        "q": "A glass-lined reactor is at 150 °C. Why not send cold brine straight into the jacket?",
        "opts": [
            ["The brine would freeze", False, "It won't freeze against a 150 degree wall. The glass is the problem."],
            ["Thermal shock can crack the glass", True, "Yes! Glass hates sudden temperature changes."],
            ["The brine pump would trip", False, "The pump's fine. The glass is not."],
            ["It wastes brine", False, "It does, but that's the least of your worries."],
        ],
        "title": "Thermal shock",
        "beats": [
            ["Glass and steel expand differently. A sudden temperature jump stresses the glass.",
             [["p", "M140,70 L140,250", "b", 3], ["p", "M149,70 L149,250", "k", 12], ["p", "M128,120 L136,140 L128,160", "r", 2.5], ["t", 30, 140, "150 °C", 18, "r"],
              ["t", 190, 140, "cold brine", 18, "b"]]],
            ["Too big a jump, hot side or cold side, and the glass can crack or spall. Then the vessel is out of service.",
             [["t", 20, 290, "too big a jump → cracked glass", 18, "r"]]],
            ["Every glass-lined vessel has a thermal shock chart from its maker. Stay inside it.",
             [["t", 20, 326, "follow the maker's shock chart", 18, "g"]]],
            ["Cool in stages: hot water, then cooling water, then brine, draining the jacket between each. Check your timings in the jacketed vessel calculator on pharmacheme dot in.",
             [["t", 20, 356, "stage it: hot water → CW → brine", 17, "g"], ["t", 20, 386, "pharmacheme.in → jacketed vessel", 16, "b"]]],
        ],
        "summary": "Glass and steel expand differently, so a sudden temperature change on either side stresses the lining and can crack or spall the glass, taking the vessel out of service. Every glass-lined vessel has a thermal shock chart from its manufacturer; stay within it and cool in stages, for example hot water, then cooling water, then brine, draining the jacket between each.",
    },
]

if __name__ == '__main__':
    main(globals())
