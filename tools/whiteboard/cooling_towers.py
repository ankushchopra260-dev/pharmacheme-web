"""Whiteboard lesson: cooling towers. Run: python3 tools/whiteboard/cooling_towers.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, main, tower

SLUG = 'cooling-towers'
TITLE = 'Cooling towers'
CALC = '/articles/cooling-tower-calculations/'
CALC_LABEL = 'Read the cooling tower calculations'
ENDS = ['The utilities team wants you.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: cooling towers, where hot water goes to sweat it out. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Now work through the cooling tower calculations."
SPOKEN = (('COC', 'cycles of concentration'), ('m³/h', 'cubic metres an hour'), ('°C', ' degrees'))

STEPS = [
    {
        "q": "Hot water enters at 40 °C and leaves at 32 °C. Wet bulb is 28 °C. What is the approach?",
        "opts": [
            ["8 °C", False, "8 is the range: hot in minus cold out. Close, wrong word."],
            ["4 °C", True, "4 degrees. Correct! Cold water minus wet bulb."],
            ["12 °C", False, "12 is hot water minus wet bulb: range plus approach."],
            ["32 °C", False, "That's just the cold water temperature."],
        ],
        "title": "Range and approach",
        "beats": [
            ["Hot water comes in at the top at 40, and the cooled water leaves the basin at 32.",
             [*tower(40, 70, 150, 200), ["a", 230, 120, 194, 120, "r"], ["t", 236, 126, "hot 40 °C", 16, "r"],
              ["a", 194, 256, 240, 256, "b"], ["t", 246, 262, "cold 32 °C", 16, "b"]]],
            ["Range is hot in minus cold out. 40 minus 32 is 8 degrees. That's how much the tower cools the water.",
             [["t", 20, 300, "range = 40 − 32 = 8 °C", 19, "k"]]],
            ["Approach is cold water minus the wet bulb of the air. 32 minus 28 is 4. That's how close you get to the limit.",
             [["t", 20, 336, "approach = 32 − 28 = 4 °C", 19, "g"]]],
            ["A smaller approach needs a much bigger tower. Many are designed for about 4 to 6 degrees.",
             [["t", 20, 372, "typical design approach 4-6 °C", 17, "o"]]],
        ],
        "summary": "Range is hot water in minus cold water out: 40 − 32 = 8 °C, which is how much the tower cools the water. Approach is cold water out minus the wet bulb temperature of the air: 32 − 28 = 4 °C, which is how close the tower gets to its limit. A smaller approach needs a much bigger tower; many are designed for about 4 to 6 °C.",
    },
    {
        "q": "Why can't a cooling tower cool water below the wet bulb temperature?",
        "opts": [
            ["The fans are too small", False, "Bigger fans get you closer. They never get you past it."],
            ["Evaporation can't cool below it", True, "Yes! At the wet bulb, evaporation can't pull the water any colder."],
            ["Water freezes first", False, "In an Indian summer? Freezing is not on the cards."],
            ["The fill gets in the way", False, "The fill helps. It's not the limit."],
        ],
        "title": "Wet bulb limit",
        "beats": [
            ["A tower cools mostly by evaporation. A little water evaporates and takes heat with it.",
             [["c", 70, 110, 22, "b", 3], ["a", 70, 84, 70, 56, "o"], ["t", 104, 104, "a little evaporates", 16, "o"], ["t", 104, 126, "→ the rest cools", 16, "b"]]],
            ["The wet bulb is the temperature a wet surface settles at, where heat from the air just balances the heat carried off by evaporation.",
             [["p", "M60,170 L60,250", "k", 3], ["c", 60, 262, 12, "b", 3], ["t", 90, 214, "wet wick thermometer", 16, "k"], ["t", 90, 240, "= wet bulb", 18, "b"]]],
            ["Water can get close to it, but never below it. That's the floor.",
             [["t", 20, 300, "cold water ≥ wet bulb, always", 19, "r"]]],
            ["So on a humid monsoon day, the tower can't do as well as on a dry winter day, even with every fan running.",
             [["t", 20, 340, "humid day → higher wet bulb", 17, "o"], ["t", 20, 366, "→ warmer cold water", 17, "o"]]],
        ],
        "summary": "A cooling tower cools mainly by evaporation: a small part of the water evaporates and takes heat from the rest. The wet bulb temperature is the lowest temperature evaporation can reach in that air, so cold water can approach it but never go below it. On a humid day the wet bulb is higher, so the tower delivers warmer water whatever the fans do.",
    },
    {
        "q": "The range is 10 °C. Roughly what share of the circulating water evaporates?",
        "opts": [
            ["About 0.1 %", False, "0.1 % times 580 is under 1 kcal per kg of water. You need 10."],
            ["About 1.5 %", True, "About 1.5 percent. Spot on."],
            ["About 10 %", False, "10 percent? Your make-up pump would never keep up."],
            ["About 25 %", False, "A quarter? That's a kettle, not a tower."],
        ],
        "title": "Evaporation loss",
        "beats": [
            ["Cooling one kilogram of water by 10 degrees takes away 10 kilocalories.",
             [["t", 20, 84, "1 kg × 10 °C = 10 kcal", 20, "k"]]],
            ["Evaporating water takes about 580 kilocalories per kilogram. So 10 kilocalories needs about 1.7 percent.",
             [["t", 20, 124, "evaporation ≈ 580 kcal/kg", 18, "b"], ["t", 20, 152, "10 ÷ 580 ≈ 1.7 %", 18, "b"]]],
            ["Some heat also leaves as warm air, so the real figure is nearer 1.5 percent. About 0.15 percent per degree of range.",
             [["t", 20, 196, "≈ 1.5 % of circulation", 20, "g"], ["t", 20, 224, "(~0.15 % per °C of range)", 16, "g"]]],
            ["For 1000 cubic metres an hour at a 10 degree range, that's about 15 cubic metres an hour gone into the air.",
             [["t", 20, 280, "1000 m³/h, range 10 °C", 18, "k"], ["t", 20, 308, "→ ~15 m³/h evaporates", 18, "r"]]],
        ],
        "summary": "Cooling 1 kg of water by 10 °C removes 10 kcal, and evaporating water takes about 580 kcal/kg, so about 1.7 % would evaporate if all the heat left that way. Some heat leaves as sensible heat in the air, so the usual figure is about 1.5 %, or roughly 0.15 % of circulation per °C of range. For 1000 m³/h at a 10 °C range, about 15 m³/h evaporates.",
    },
    {
        "q": "Cycles of concentration rise from 3 to 6. What happens to blowdown?",
        "opts": [
            ["It doubles", False, "Doubles? Higher cycles means you throw away less, not more."],
            ["It falls by more than half", True, "Correct! From half the evaporation to a fifth of it."],
            ["It stays the same", False, "Cycles are set by blowdown. Change one and the other moves."],
            ["It stops completely", False, "Stop blowdown and the salts build up forever."],
        ],
        "title": "Cycles and blowdown",
        "beats": [
            ["Evaporation leaves the salts behind. The basin water gets more concentrated than the make-up.",
             [*tower(40, 96, 130, 150), ["a", 104, 90, 104, 64, "o"], ["t", 120, 76, "pure vapour out", 15, "o"], ["t", 190, 200, "salts stay", 16, "r"]]],
            ["Cycles of concentration is how many times more concentrated. You control it with blowdown.",
             [["t", 20, 270, "COC = salts in basin ÷ in make-up", 16, "k"]]],
            ["Blowdown equals evaporation over cycles minus one. At 3 cycles it's half the evaporation. At 6 it's a fifth.",
             [["t", 20, 306, "blowdown = E ÷ (COC − 1)", 19, "b"], ["t", 20, 334, "COC 3 → E/2", 17, "b"], ["t", 180, 334, "COC 6 → E/5", 17, "b"]]],
            ["Higher cycles save water and chemicals, but only if treatment stops the scale. Watch the conductivity.",
             [["t", 20, 372, "more cycles → watch scale", 17, "g"]]],
        ],
        "summary": "Evaporation leaves dissolved salts behind, so basin water is more concentrated than make-up; cycles of concentration (COC) is the ratio, controlled by blowdown. Blowdown = evaporation ÷ (COC − 1), so raising COC from 3 to 6 cuts blowdown from half the evaporation to a fifth of it, a fall of 60 %. Higher cycles save water and chemicals only if the water treatment controls scale.",
    },
    {
        "q": "In summer the cold water is 3 °C hotter, with all fans running. What do you check first?",
        "opts": [
            ["Replace the fill", False, "Fill can wait. Check what the weather is doing first."],
            ["Today's wet bulb", True, "Yes! Check the wet bulb before you blame the tower."],
            ["Add more chemicals", False, "Chemicals fix scale, not humidity."],
            ["The pump bypass", False, "That changes flow, not the cooling limit."],
        ],
        "title": "Blame the weather?",
        "beats": [
            ["The tower can only get within its approach of the wet bulb.",
             [["t", 20, 84, "cold water = wet bulb + approach", 18, "k"]]],
            ["If the wet bulb has gone up 3 degrees, the cold water goes up 3 too. The tower is fine.",
             [["t", 20, 126, "wet bulb +3 → cold water +3", 18, "b"], ["k", 280, 116, "g"], ["t", 20, 150, "tower OK, it's the weather", 16, "g"]]],
            ["If the approach has grown at the same load and flow, the tower has a problem: fill fouled, nozzles blocked, fans or belts weak.",
             [["t", 20, 196, "approach grew → tower problem", 18, "r"], ["t", 20, 222, "fill, nozzles, fan, belts", 16, "r"]]],
            ["So log the wet bulb with the cold water every day. The approach trend tells you the truth.",
             [*axes(30, 250, 330, 380, "days", "approach"), ["p", "M34,350 L120,348 L200,330 L320,290", "r", 3], ["t", 220, 292, "fouling!", 16, "r"]]],
        ],
        "summary": "Cold water temperature equals wet bulb plus approach. If the wet bulb has risen by the same amount, the tower is fine and the weather is to blame. If the approach has grown at the same heat load and water flow, the tower has a problem, such as fouled fill, blocked nozzles or weak fans and belts. Logging wet bulb and cold water daily and trending the approach shows which.",
    },
    {
        "q": "The fill slowly clogs with scale and algae. What happens to the tower?",
        "opts": [
            ["It cools better", False, "Better? It's choking. Air and water can't meet."],
            ["The approach widens", True, "Correct. Less contact, bigger approach."],
            ["Nothing changes", False, "Clogged fill always shows up in the approach."],
            ["The range doubles", False, "Range comes from the heat load. Fouling doesn't double it."],
        ],
        "title": "Fouled fill",
        "beats": [
            ["Fill spreads the water into thin films, so air and water touch over a big area.",
             [*tower(40, 70, 150, 200), ["t", 206, 160, "fill = big wet area", 16, "o"]]],
            ["Scale and algae block the passages. Less air gets through, and the water channels down in streams.",
             [["p", "M60,170 L170,170 M60,192 L170,192", "g", 6], ["t", 206, 190, "scale + algae", 16, "g"]]],
            ["Less contact means the water can't get as close to the wet bulb. The approach widens.",
             [["t", 20, 310, "less contact → approach widens", 18, "r"]]],
            ["Keep the biocide and scale treatment on target, and clean the fill at shutdowns, with the fan locked out. Then check the numbers in the cooling tower calculations on pharmacheme dot in.",
             [["t", 20, 346, "treat water, clean fill", 18, "g"], ["t", 20, 380, "pharmacheme.in → cooling towers", 16, "b"]]],
        ],
        "summary": "Fill spreads water into thin films so it meets the air over a large area. Scale and algae block it, cutting air flow and making water channel, so contact falls and the cold water cannot get as close to the wet bulb: the approach widens. Keep biocide and scale treatment on target and clean the fill at shutdowns with the fan isolated and locked out.",
    },
]

if __name__ == '__main__':
    main(globals())
