"""Whiteboard lesson: hydrogenation safety. Run: python3 tools/whiteboard/hydrogenation_safety.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, main, reactor

SLUG = 'hydrogenation-safety'
TITLE = 'Hydrogenation safety'
CALC = '/articles/hydrogenation-safety/'
CALC_LABEL = 'Read the hydrogenation safety guide'
ENDS = ['The autoclave is in safe hands.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: hydrogenation. The lightest gas, a catalyst that can catch fire on its own, and very little room for mistakes. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Read the hydrogenation safety guide next."
SPOKEN = (('H₂', 'hydrogen'), ('O₂', 'oxygen'), ('N₂', 'nitrogen'), ('Pd/C', 'palladium on carbon'), ('MIE', 'M I E'), ('mJ', 'millijoules'))

STEPS = [
    {
        "q": "What is hydrogen's flammable range in air?",
        "opts": [
            ["About 1 to 8 %", False, "That's more like toluene vapour. Hydrogen's range is huge."],
            ["About 4 to 75 %", True, "4 to 75 percent. Almost any leak can burn."],
            ["About 10 to 20 %", False, "Far too narrow. Hydrogen burns across a huge range."],
            ["About 20 to 40 %", False, "Far too narrow. It starts burning at just 4 percent."],
        ],
        "title": "Wide range",
        "beats": [
            ["Hydrogen burns in air anywhere from about 4 percent to about 75 percent.",
             [["p", "M30,140 L330,140", "k", 2.5], ["p", "M42,140 L255,140", "r", 9], ["t", 30, 170, "4 %", 16, "r"], ["t", 240, 170, "75 %", 16, "r"],
              ["t", 100, 120, "flammable", 17, "r"]]],
            ["Compare toluene vapour, about 1 to 7 percent. Hydrogen's window is enormous.",
             [["p", "M33,200 L51,200", "o", 9], ["t", 70, 206, "toluene ~1-7 %", 16, "o"]]],
            ["It also ignites with a tiny spark, about 0.02 millijoules. Far less than static from a person.",
             [["t", 20, 260, "MIE ≈ 0.02 mJ: tiny spark", 19, "r"]]],
            ["So assume any hydrogen leak can ignite. Keep air out of the system and hydrogen in.",
             [["t", 20, 306, "air out, hydrogen in", 20, "g"]]],
        ],
        "summary": "Hydrogen is flammable in air from about 4 % to about 75 %, a far wider range than toluene (about 1 to 7 %), and its minimum ignition energy is only about 0.02 mJ. Assume any hydrogen leak can ignite: keep air out of the system and hydrogen in.",
    },
    {
        "q": "Before letting hydrogen into a reactor, what must you do?",
        "opts": [
            ["Open the hydrogen slowly", False, "Slowly mixing hydrogen into air is still mixing hydrogen into air."],
            ["Purge air out with nitrogen", True, "Yes! No air, no fire."],
            ["Heat the reactor first", False, "Heating a vessel of air and solvent vapour? Please, no."],
            ["Vent the reactor to atmosphere", False, "Venting leaves the air inside. You have to push it out."],
        ],
        "title": "Purge first",
        "beats": [
            ["Hydrogen and air must never meet inside the reactor.",
             [["t", 20, 86, "H₂ + air inside = never", 20, "r"]]],
            ["Pressurise with nitrogen, vent, and repeat. Each cycle drops the oxygen.",
             [*axes(40, 110, 320, 270, "cycles", "O₂ %"), ["p", "M44,124 L100,124 L100,190 L160,190 L160,236 L220,236 L220,256 L300,256", "b", 3]]],
            ["Check the oxygen is low enough with an analyser, typically below 1 percent, before any hydrogen goes in.",
             [["t", 20, 310, "check O₂ with an analyser", 18, "g"]]],
            ["At the end, do the same in reverse: purge the hydrogen out with nitrogen before opening.",
             [["t", 20, 346, "end: purge H₂ out with N₂", 18, "g"], ["t", 20, 372, "before opening", 16, "g"]]],
        ],
        "summary": "Hydrogen and air must never mix inside the reactor. Before hydrogen goes in, purge the air out with nitrogen, usually by repeated pressure-and-vent cycles, and confirm low oxygen with an analyser. At the end, purge the hydrogen out with nitrogen before opening the reactor.",
    },
    {
        "q": "Filtering spent palladium-on-carbon catalyst. What is the key hazard?",
        "opts": [
            ["It blinds the filter cloth", False, "Fine carbon can blind cloth, but the real danger is fire."],
            ["It can catch fire if it dries", True, "Yes! Spent catalyst is pyrophoric."],
            ["It dissolves in the filtrate", False, "It stays solid. That's why you filter it."],
            ["There is no hazard once the reaction is over", False, "The catalyst still holds hydrogen and is very active."],
        ],
        "title": "Hot catalyst",
        "beats": [
            ["Spent hydrogenation catalysts hold hydrogen and are very active. Dry and in air, they can glow and ignite solvent.",
             [["p", "M60,120 L280,120 L250,220 L90,220 Z", "k", 3], ["t", 110, 180, "catalyst cake", 16, "o"]]],
            ["So never let the cake run dry. Keep it covered with liquid, ideally water.",
             [["t", 20, 262, "never let the cake dry", 19, "r"], ["t", 120, 100, "keep it wet!", 18, "r"]]],
            ["Filter under nitrogen, and wash the cake with water before it's exposed.",
             [["t", 20, 298, "filter under N₂, water wash", 18, "g"]]],
            ["Store spent catalyst under water, in a closed container, and send it for metal recovery.",
             [["t", 20, 334, "store under water, closed", 17, "g"]]],
        ],
        "summary": "Spent hydrogenation catalysts such as palladium on carbon hold hydrogen and are very active; if the cake dries in air it can glow and ignite the solvent. Never let it run dry, filter under nitrogen, wash with water before exposure, and store it water-wet in a closed container for metal recovery.",
    },
    {
        "q": "Raising the stirrer speed makes hydrogen uptake much faster. What does that tell you?",
        "opts": [
            ["The catalyst is dead", False, "A dead catalyst wouldn't speed up with stirring."],
            ["Mass transfer limits it", True, "Correct! Hydrogen can't dissolve fast enough."],
            ["The reaction is finished", False, "A finished reaction takes up no hydrogen at all."],
            ["The pressure gauge is faulty", False, "The uptake really changed. It's the mixing."],
        ],
        "title": "Mass transfer",
        "beats": [
            ["Hydrogen has to dissolve from the gas into the liquid before it can reach the catalyst.",
             [*reactor(110, 70, 140, 200, 120), ["c", 90, 170, 3, "b", 2], ["c", 120, 190, 3, "b", 2], ["t", 200, 110, "gas → liquid", 16, "b"],
              ["t", 200, 132, "→ catalyst", 16, "b"]]],
            ["Hydrogen is not very soluble, so that step is often the slowest.",
             [["t", 20, 312, "low solubility → slow step", 18, "o"]]],
            ["If faster stirring speeds things up, mass transfer is the limit. Better gas dispersion, higher pressure, or a gas-inducing impeller help.",
             [["t", 20, 344, "stir faster helps → mass transfer limit", 16, "r"], ["t", 20, 368, "more dispersion, higher pressure", 16, "g"]]],
            ["Watch the heat when you do: faster uptake means faster heat release.",
             [["t", 200, 220, "faster uptake", 15, "r"], ["t", 200, 240, "= more heat", 15, "r"]]],
        ],
        "summary": "Hydrogen must dissolve into the liquid before it reaches the catalyst, and its low solubility often makes this the slowest step. If faster stirring increases uptake, gas-liquid mass transfer is limiting; better dispersion, higher pressure or a gas-inducing impeller help. Faster uptake also means faster heat release.",
    },
    {
        "q": "Reducing a nitro group with hydrogen is strongly exothermic. How is the heat usually controlled?",
        "opts": [
            ["By the hydrogen feed rate", True, "Yes! Hydrogen is the dosed reagent. Limit it, and you limit heat."],
            ["By adding all the catalyst at once", False, "That speeds it up. More heat, faster."],
            ["By turning off the cooling", False, "Cooling off during a strong exotherm? No."],
            ["By raising the stirrer speed", False, "Faster stirring speeds up hydrogen uptake. More heat, not less."],
        ],
        "title": "Hydrogen is the dose",
        "beats": [
            ["Nitro to amine releases a lot of heat, around 130 kilocalories per mole.",
             [["t", 20, 86, "nitro → amine ≈ 130 kcal/mol", 19, "r"]]],
            ["The hydrogen is the reagent you're dosing. Feed it at a rate the cooling can handle.",
             [["t", 20, 126, "H₂ feed rate = heat rate", 20, "b"]]],
            ["Use a pressure controller or a flow limit on the hydrogen, with an interlock that cuts the hydrogen on high temperature.",
             [["t", 20, 166, "flow limit, high-T interlock", 18, "g"]]],
            ["Nitro compounds and some reduction intermediates can be unstable. Check thermal data, and never let the batch run hot hoping it'll finish faster.",
             [["t", 20, 210, "check thermal stability data", 18, "o"]]],
        ],
        "summary": "Reducing a nitro group to an amine releases around 130 kcal per mole. In hydrogenation, hydrogen is the dosed reagent, so the heat release is controlled through the hydrogen feed rate, using a pressure controller or flow limit interlocked to high temperature. Some nitro intermediates are thermally unstable, so check thermal data and never run hot to finish faster.",
    },
    {
        "q": "Where should hydrogen gas detectors be placed in a hydrogenation room?",
        "opts": [
            ["Near the floor", False, "That's for heavy vapours. Hydrogen goes the other way."],
            ["At the high points, near the ceiling", True, "Correct! Hydrogen is very light and rises."],
            ["Outside the building only", False, "By then it's too late inside."],
            ["None needed with good ventilation", False, "Ventilation helps. Detection tells you it's working."],
        ],
        "title": "Detect up high",
        "beats": [
            ["Hydrogen is about fourteen times lighter than air. It rises and gathers under the roof.",
             [["p", "M40,80 L320,80 L320,280 L40,280 Z", "k", 3], ["a", 180, 240, 180, 110, "b"], ["t", 190, 180, "H₂ rises", 16, "b"]]],
            ["So put detectors at the high points, and above likely leak spots like flanges and valves.",
             [["c", 120, 96, 8, "r", 2.5], ["c", 240, 96, 8, "r", 2.5], ["t", 70, 130, "detectors high", 15, "r"]]],
            ["Give the roof a high vent so it can't build up, and keep ignition sources out.",
             [["p", "M300,80 L300,60 L330,60", "k", 3], ["t", 20, 316, "high vents, no ignition sources", 17, "g"]]],
            ["Hydrogen flames are almost invisible in daylight. Don't walk up to a suspected leak. Isolate the supply from a distance and check with a thermal camera or flame detector. More in the hydrogenation safety guide on pharmacheme dot in.",
             [["t", 20, 350, "invisible flame: isolate remotely", 17, "r"], ["t", 20, 386, "pharmacheme.in → hydrogenation", 16, "b"]]],
        ],
        "summary": "Hydrogen is about fourteen times lighter than air and collects under the roof, so detectors go at high points and above likely leak sources such as flanges and valves. Provide high-level ventilation and exclude ignition sources. Hydrogen flames are nearly invisible in daylight, so do not approach a suspected leak; isolate it remotely and check with a thermal camera or flame detector.",
    },
]

if __name__ == '__main__':
    main(globals())
