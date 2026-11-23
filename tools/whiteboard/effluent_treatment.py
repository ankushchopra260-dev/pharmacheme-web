"""Whiteboard lesson: effluent treatment basics. Run: python3 tools/whiteboard/effluent_treatment.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import box, main

SLUG = 'effluent-treatment-basics'
TITLE = 'Effluent treatment basics'
CALC = '/articles/etp-basics/'
CALC_LABEL = 'Read the ETP basics guide'
ENDS = ['The ETP in-charge wants you on the team.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: the effluent plant, where every lost kilogram of solvent ends up. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Read the ETP basics guide next."
SPOKEN = (('BOD/COD', 'B O D to C O D'), ('COD', 'C O D'), ('BOD', 'B O D'), ('TDS', 'T D S'), ('MEE', 'M E E'), ('ZLD', 'Z L D'), ('ETP', 'E T P'),
          ('mg/L', 'milligrams per litre'), ('m³/day', 'cubic metres a day'), ('kg/day', 'kilograms a day'), ('1 kg', '1 kilogram'), (' kg', ' kilograms'))

STEPS = [
    {
        "q": "For the same effluent, which is usually higher: COD or BOD?",
        "opts": [
            ["BOD", False, "BOD only counts what bugs can eat in a few days. COD counts more."],
            ["COD", True, "Yes! COD oxidises nearly everything, BOD only the easy part."],
            ["Always exactly equal", False, "They measure different things, so they're rarely equal."],
            ["BOD, because bugs are thorough", False, "Bugs are picky, not thorough. COD catches what they leave."],
        ],
        "title": "COD vs BOD",
        "beats": [
            ["COD uses a strong chemical oxidant to burn nearly all the organic matter. Result in a few hours.",
             [["t", 20, 86, "COD: chemical, nearly all organics", 18, "r"], ["t", 20, 110, "result in hours", 15, "r"]]],
            ["BOD measures the oxygen bacteria use over a few days. In India the test is 3 days at 27 degrees. Only what's easily biodegradable counts.",
             [["t", 20, 152, "BOD: bacteria, 3 days at 27 °C", 18, "g"], ["t", 20, 176, "only the easy part", 15, "g"]]],
            ["So COD is almost always higher than BOD.",
             [["p", "M60,300 L60,210 L120,210 L120,300", "r", 3], ["p", "M180,300 L180,250 L240,250 L240,300", "g", 3], ["p", "M40,300 L280,300", "k", 2],
              ["t", 70, 320, "COD", 16, "r"], ["t", 190, 320, "BOD", 16, "g"]]],
            ["Plants track COD daily because it's quick. BOD tells you how well the biology can cope.",
             [["t", 20, 360, "COD daily; BOD for biology", 18, "k"]]],
        ],
        "summary": "COD uses a strong chemical oxidant to oxidise nearly all organic matter and gives a result within hours. BOD measures the oxygen bacteria consume over a few days (3 days at 27 °C in Indian standards), covering only the readily biodegradable part, so COD is almost always higher. Plants track COD daily; BOD shows how well biological treatment can cope.",
    },
    {
        "q": "An effluent stream has a BOD/COD ratio of 0.15. What does that tell you?",
        "opts": [
            ["It's easy to treat biologically", False, "Easy would be 0.4 or more. 0.15 is tough going."],
            ["It's poorly biodegradable", True, "Yes! The bugs can't eat most of it."],
            ["It has no organics", False, "It has plenty. The bugs just don't like them."],
            ["The test went wrong", False, "Maybe, but 0.15 is common for pharma effluent."],
        ],
        "title": "Biodegradability",
        "beats": [
            ["The BOD to COD ratio shows how much of the organic load bacteria can actually eat.",
             [["t", 20, 86, "BOD ÷ COD = how much is edible", 18, "b"]]],
            ["Around 0.4 or more treats well biologically. 0.15 means most of it is hard for the bugs.",
             [["p", "M30,150 L330,150", "k", 2.5], ["p", "M30,150 L110,150", "r", 8], ["p", "M200,150 L330,150", "g", 8],
              ["t", 40, 178, "< 0.2 tough", 15, "r"], ["t", 220, 178, "≥ 0.4 good", 15, "g"], ["c", 90, 150, 6, "k", 3], ["t", 75, 132, "0.15", 15, "k"]]],
            ["Typical culprits: solvents the bugs dislike, toxic or ring compounds, and high salt.",
             [["t", 20, 226, "culprits: solvents, toxic or", 17, "o"], ["t", 20, 250, "ring compounds, salt", 17, "o"]]],
            ["Treat that stream separately first: recover the solvent, strip it, or pre-treat it, before it reaches the aeration tank.",
             [["t", 20, 296, "segregate + pre-treat:", 18, "g"], ["t", 20, 320, "recover, strip, oxidise", 18, "g"]]],
        ],
        "summary": "The BOD/COD ratio indicates how much of the organic load bacteria can degrade. About 0.4 or more treats well biologically; 0.15 means most of the load is hard for bacteria, often due to solvents, toxic or ring compounds, or salt. Segregate such streams and pre-treat them, by solvent recovery, stripping or oxidation, before biological treatment.",
    },
    {
        "q": "50 m³/day of effluent at 20,000 mg/L COD. What is the daily COD load?",
        "opts": [
            ["100 kg/day", False, "Ten times too little. Milligrams per litre is grams per cubic metre."],
            ["1000 kg/day", True, "1000 kilos a day. Correct!"],
            ["10,000 kg/day", False, "Ten times too much. Check the units."],
            ["20,000 kg/day", False, "That's the concentration, not the load."],
        ],
        "title": "COD load",
        "beats": [
            ["Milligrams per litre is the same as grams per cubic metre.",
             [["t", 20, 86, "1 mg/L = 1 g/m³", 22, "b"]]],
            ["20,000 grams per cubic metre times 50 cubic metres is a million grams. 1000 kilograms a day.",
             [["t", 20, 130, "20,000 g/m³ × 50 m³", 20, "k"], ["t", 20, 162, "= 1000 kg COD/day", 22, "r"]]],
            ["Load, not concentration, sizes the biology and the aeration.",
             [["t", 20, 206, "load sizes the plant", 18, "g"]]],
            ["A small stream at very high COD can carry more load than a big dilute one. Find those streams first.",
             [["t", 20, 252, "small, strong streams", 18, "o"], ["t", 20, 276, "often carry the load", 18, "o"]]],
        ],
        "summary": "1 mg/L equals 1 g/m³, so 20,000 mg/L × 50 m³/day = 1,000,000 g/day, or 1000 kg COD per day. The load, not the concentration, sizes biological treatment and aeration, and a small, very strong stream can carry more load than a large dilute one.",
    },
    {
        "q": "1 kg of methanol is lost to drain. Roughly how much COD does it add?",
        "opts": [
            ["About 0.5 kg", False, "Too little. Burning it takes more oxygen than its own weight."],
            ["About 1.5 kg", True, "About 1.5 kilos. Correct!"],
            ["About 1 kg", False, "Close, but oxidising methanol takes 1.5 times its weight in oxygen."],
            ["None; methanol evaporates", False, "Some evaporates, but plenty stays in the water."],
        ],
        "title": "Solvent to COD",
        "beats": [
            ["COD is the oxygen needed to oxidise the organics fully.",
             [["t", 20, 86, "COD = oxygen to burn it all", 19, "k"]]],
            ["Methanol plus one and a half oxygen molecules gives carbon dioxide and water.",
             [["t", 20, 128, "CH₃OH + 1.5 O₂ → CO₂ + 2 H₂O", 19, "b"]]],
            ["32 grams of methanol needs 48 grams of oxygen. So 1 kilogram adds about 1.5 kilograms of COD.",
             [["t", 20, 170, "32 g needs 48 g O₂", 19, "k"], ["t", 20, 198, "→ 1 kg methanol ≈ 1.5 kg COD", 19, "r"]]],
            ["Toluene is worse, about 3.1 kilograms of COD per kilogram. Recovering solvent is the cheapest COD reduction there is.",
             [["t", 20, 244, "toluene ≈ 3.1 kg COD per kg", 18, "o"], ["t", 20, 278, "recover solvent → cut COD", 19, "g"]]],
        ],
        "summary": "COD is the oxygen needed to oxidise organics fully. CH₃OH + 1.5 O₂ → CO₂ + 2 H₂O, so 32 g of methanol needs 48 g of oxygen and 1 kg of methanol adds about 1.5 kg of COD. Toluene adds about 3.1 kg COD per kg. Recovering solvent at source is the cheapest COD reduction.",
    },
    {
        "q": "What dissolved oxygen level is usually kept in an aeration tank?",
        "opts": [
            ["Zero", False, "Zero oxygen and the aerobic bugs suffocate."],
            ["About 2 mg/L", True, "About 2. Correct!"],
            ["About 8 mg/L", False, "Near saturation wastes blower power for little gain."],
            ["As high as possible", False, "Higher just costs power. The bugs are happy at about 2."],
        ],
        "title": "Aeration",
        "beats": [
            ["Aerobic bacteria need oxygen to eat the organics. Blowers or surface aerators supply it.",
             [["p", "M40,100 L40,240 L320,240 L320,100", "k", 3], ["p", "M43,120 q70,-6 140,0 t134,0", "b", 2.5], ["c", 120, 200, 4, "b", 2], ["c", 180, 180, 4, "b", 2],
              ["c", 240, 210, 4, "b", 2], ["t", 120, 270, "air bubbles feed the bugs", 15, "b"]]],
            ["About 1.5 to 2 milligrams per litre keeps them working. Below 1, they slow down and the sludge can turn bad.",
             [["t", 20, 312, "target DO ≈ 1.5-2 mg/L", 19, "g"], ["t", 20, 338, "below 1 → sluggish, bad sludge", 17, "r"]]],
            ["Much higher just burns blower power. Aeration is often the biggest power user in the ETP.",
             [["t", 20, 370, "too high → wasted power", 17, "o"]]],
            ["Measure dissolved oxygen in the tank, and control the blowers on it.",
             [["t", 20, 396, "control blowers on DO", 15, "b"]]],
        ],
        "summary": "Aerobic bacteria need oxygen to degrade organics. A dissolved oxygen level of about 1.5 to 2 mg/L keeps them working; below about 1 mg/L treatment slows and sludge quality suffers, while much higher levels waste blower power, often the largest power use in the ETP. Measure DO in the tank and control the blowers on it.",
    },
    {
        "q": "A stream has very high TDS (dissolved salts). Will the biological plant remove it?",
        "opts": [
            ["Yes, bugs eat salt", False, "Bugs don't eat salt. Too much of it actually harms them."],
            ["No, it needs evaporation", True, "Correct! Biology removes organics, not salts."],
            ["Yes, if aerated longer", False, "More air won't make salt disappear."],
            ["Yes, with more sludge", False, "More sludge won't take the salt out of the water."],
        ],
        "title": "Salts and ZLD",
        "beats": [
            ["Biological treatment removes organics. Dissolved salts pass straight through.",
             [*box(20, 80, 140, 40, "biology", "g", 16), ["t", 176, 98, "organics: out", 15, "g"], ["t", 176, 120, "salts: pass through", 15, "r"]]],
            ["High salt also stresses the bacteria, so strong salty streams are kept apart.",
             [["t", 20, 170, "high salt stresses the bugs", 17, "r"]]],
            ["Salty streams go to a multiple effect evaporator, the MEE. The salt is then dried, for example in an agitated thin film dryer.",
             [*box(20, 200, 90, 40, "MEE", "b", 16), ["a", 110, 220, 150, 220, "k"], *box(150, 200, 120, 40, "dryer", "b", 16), ["t", 20, 268, "evaporate, then dry the salt", 17, "b"]]],
            ["The condensate goes back through treatment or polishing, then gets reused. That's how zero liquid discharge, ZLD, plants close the loop. More in the ETP basics guide on pharmacheme dot in.",
             [["t", 20, 312, "condensate treated, reused → ZLD", 18, "g"], ["t", 20, 380, "pharmacheme.in → ETP basics", 16, "b"]]],
        ],
        "summary": "Biological treatment removes organics, not dissolved salts, and high salt stresses the bacteria, so strong saline streams are segregated. They go to a multiple effect evaporator (MEE), and the salt is dried, for example in an agitated thin film dryer, while the condensate is treated or polished and reused. This is how zero liquid discharge (ZLD) plants close the loop.",
    },
]

if __name__ == '__main__':
    main(globals())
