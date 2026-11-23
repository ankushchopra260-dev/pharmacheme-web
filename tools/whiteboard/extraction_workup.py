"""Whiteboard lesson: liquid-liquid extraction and workup. Run: python3 tools/whiteboard/extraction_workup.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, main

SLUG = 'liquid-extraction-workup'
TITLE = 'Extraction and workup'
CALC = '/articles/workup-and-phase-separation/'
CALC_LABEL = 'Read the workup and phase separation guide'
ENDS = ['Your layers will split clean.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: workup. Two liquids that won't mix, and a product that has to pick a side. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Read the workup and phase separation guide next."
SPOKEN = (('pKa', 'p K a'), ('pH', 'p H'), ('DCM', 'D C M'), ('K =', 'K equals'))


def layers(x, y, w, h, split, top, bottom, ct="o", cb="b"):
    """Vessel with two liquid layers, labelled."""
    return [["p", f"M{x},{y} L{x},{y + h} L{x + w},{y + h} L{x + w},{y}", "k", 3],
            ["p", f"M{x + 3},{split} L{x + w - 3},{split}", "k", 2],
            ["t", x + 10, split - 14, top, 15, ct], ["t", x + 10, split + 26, bottom, 15, cb]]


STEPS = [
    {
        "q": "Partition coefficient 4 (organic over water), one extraction, equal volumes. How much is extracted?",
        "opts": [
            ["25 %", False, "25 is one over four. The organic holds four parts out of five."],
            ["80 %", True, "80 percent. Correct!"],
            ["100 %", False, "100? Some always stays in the water."],
            ["40 %", False, "Not quite. Work out the split between the two layers."],
        ],
        "title": "Partition coefficient",
        "beats": [
            ["K is the concentration in the organic layer divided by the concentration in the water.",
             [["t", 20, 86, "K = C organic ÷ C water = 4", 20, "b"]]],
            ["With equal volumes, the product splits four parts to one.",
             [*layers(60, 110, 160, 150, 185, "organic: 4 parts", "water: 1 part")]],
            ["Four out of five parts is 80 percent in the organic. 20 percent stays in the water.",
             [["t", 20, 300, "4 ÷ (4 + 1) = 80 % extracted", 19, "r"]]],
            ["In general, fraction extracted is K times the volume ratio over one plus that.",
             [["t", 20, 340, "fraction = KR ÷ (1 + KR)", 18, "g"], ["t", 20, 364, "R = V organic ÷ V water", 15, "g"]]],
        ],
        "summary": "The partition coefficient K is the product's concentration in the organic layer divided by its concentration in the water. With K = 4 and equal volumes the product splits four parts to one, so 4 ÷ 5 = 80 % is extracted in one pass. In general the fraction extracted is KR ÷ (1 + KR), where R is organic volume over water volume.",
    },
    {
        "q": "Same K of 4. Is one extraction with the full solvent better, or two with half each?",
        "opts": [
            ["One with the full volume", False, "One big wash gets 80 percent. Two halves beat it."],
            ["Two with half each", True, "Two halves win: about 89 percent against 80."],
            ["They are exactly equal", False, "Same solvent, different result. Split it."],
            ["One full, if stirred longer", False, "Longer stirring helps reach balance, but the split still favours two washes."],
        ],
        "title": "Split the solvent",
        "beats": [
            ["One extraction with the full volume leaves 1 over 5 behind: 20 percent.",
             [["t", 20, 86, "one full: left = 1/(1+4) = 20 %", 18, "k"]]],
            ["With half the volume, each extraction leaves 1 over 3 behind.",
             [["t", 20, 126, "half volume: left = 1/(1+2) = 1/3", 18, "b"]]],
            ["Two of them leave one third of one third: one ninth, about 11 percent. So about 89 percent extracted.",
             [["t", 20, 168, "two halves: 1/3 × 1/3 = 1/9", 19, "r"], ["t", 20, 196, "→ ~89 % extracted vs 80 %", 19, "r"]]],
            ["More, smaller extractions always beat one big one. But each extra step costs time and handling, so two or three is usually enough.",
             [*axes(40, 230, 320, 360, "number of washes", "left"), ["p", "M50,250 Q100,330 300,350", "o", 3], ["t", 170, 300, "2-3 is usually enough", 15, "o"]]],
        ],
        "summary": "With K = 4, one extraction with the full solvent volume leaves 1/(1+4) = 20 % behind. With half the volume each pass leaves 1/(1+2) = 1/3, so two passes leave 1/9, about 11 %, extracting about 89 %. Several smaller extractions always beat one large one, though two or three passes are usually enough in practice.",
    },
    {
        "q": "A stubborn emulsion forms after a wash. What is a good first fix?",
        "opts": [
            ["Stir harder", False, "Harder stirring makes finer droplets. That's how you got here."],
            ["Add brine (salt water)", True, "Yes! Salt makes the water layer heavier and less friendly to the organic."],
            ["Add more of the same water", False, "More water usually just makes more emulsion."],
            ["Drain it all together", False, "Then the next step gets an emulsion. Fix it here."],
        ],
        "title": "Emulsions",
        "beats": [
            ["An emulsion is fine droplets that won't settle. Fine solids, soapy by-products or too much stirring cause it.",
             [*layers(60, 80, 160, 170, 160, "organic", "water"), ["p", "M66,150 L214,150 L214,172 L66,172 Z", "o", 2], ["t", 230, 166, "emulsion", 16, "o"]]],
            ["Brine raises the water layer's density and ionic strength. Droplets merge and the layers split.",
             [["t", 20, 290, "brine: heavier, saltier water", 18, "g"], ["t", 20, 314, "→ droplets merge", 18, "g"]]],
            ["Other fixes: give it time, warm it gently, well below the solvent's boiling point, adjust the pH, or filter out the fine solids that hold it.",
             [["t", 20, 352, "time, warm, pH, filter solids", 17, "b"]]],
            ["And next time, stir gently during the wash. It's easier to prevent an emulsion than break one.",
             [["t", 20, 384, "next time: gentler stirring", 17, "k"]]],
        ],
        "summary": "An emulsion is fine droplets that will not settle, often caused by fine solids, surfactant-like by-products or too much stirring. Adding brine raises the water layer's density and ionic strength so droplets coalesce. Other fixes are time, gentle warming (well below the solvent's boiling point), adjusting pH or filtering out stabilising solids; gentler stirring prevents it.",
    },
    {
        "q": "An acid product (pKa 4.5) must move into the water layer. Roughly what pH should the water be?",
        "opts": [
            ["About pH 3.5", False, "Below the pKa the acid is mostly neutral, and it stays in the organic."],
            ["About pH 4.5", False, "At the pKa only half is ionised, and the neutral half still prefers the organic."],
            ["About pH 7", True, "Correct! Two or more units above the pKa, it's ionised and loves water."],
            ["About pH 2", False, "At pH 2 the acid is neutral, and it stays in the organic."],
        ],
        "title": "pH swing",
        "beats": [
            ["An acid like this is mostly neutral below its pKa, and ionised above it.",
             [["p", "M30,140 L330,140", "k", 2.5], ["p", "M180,128 L180,152", "k", 3], ["t", 158, 120, "pKa 4.5", 15, "k"],
              ["t", 30, 176, "neutral: organic", 16, "o"], ["t", 200, 176, "ionised: water", 16, "b"]]],
            ["Two pH units above the pKa, about 99 percent is ionised. So pH 6.5 or more pulls it into the water.",
             [["p", "M240,128 L240,152", "b", 3], ["t", 224, 120, "6.5", 15, "b"], ["t", 20, 220, "pKa + 2 → ~99 % ionised", 19, "b"]]],
            ["Two units below, about pH 2.5, it's neutral and stays in the organic.",
             [["p", "M120,128 L120,152", "o", 3], ["t", 108, 120, "2.5", 15, "o"], ["t", 20, 252, "pKa − 2 → ~99 % neutral", 19, "o"]]],
            ["So wash at high pH to pull the acid out, separate, then acidify the water to get it back. Acidifying a carbonate wash gives off carbon dioxide, so add acid slowly and vent. Bases work the other way round.",
             [["t", 20, 300, "pull out at high pH,", 18, "g"], ["t", 20, 324, "acidify to recover", 18, "g"], ["t", 20, 356, "bases: the reverse", 16, "k"]]],
        ],
        "summary": "An acid is mostly neutral below its pKa and ionised above it. Two pH units above the pKa (here pH 6.5 or higher) about 99 % is ionised and moves into water; two units below (about pH 2.5) it is neutral and stays in the organic layer. Extract the acid into water at high pH, separate, then acidify to recover it; bases behave the other way round.",
    },
    {
        "q": "Dichloromethane (DCM) and water in a separator. Which layer is on top?",
        "opts": [
            ["DCM on top", False, "DCM is heavier than water. It sinks."],
            ["Water on top", True, "Yes! DCM is about 1.33. Water floats on it."],
            ["They mix into one layer", False, "DCM and water barely mix. You get two layers."],
            ["Whichever was added first", False, "Order doesn't matter. Density decides."],
        ],
        "title": "Which way up?",
        "beats": [
            ["Density decides. Water is 1.0. DCM is about 1.33, so it goes to the bottom.",
             [*layers(40, 80, 130, 160, 160, "water 1.0", "DCM 1.33", "b", "o")]],
            ["Toluene at 0.87 and ethyl acetate at 0.90 float on water.",
             [*layers(200, 80, 130, 160, 160, "toluene 0.87", "water 1.0", "o", "b")]],
            ["Careful: a salty water layer can be heavier than you expect, and close densities can even flip the layers.",
             [["t", 20, 290, "salty water: heavier", 18, "r"], ["t", 20, 314, "close densities can flip!", 18, "r"]]],
            ["When in doubt, add a few drops of water to a sample and see which layer grows. Never guess on a plant cut.",
             [["t", 20, 356, "test a sample: add water drops", 17, "g"]]],
        ],
        "summary": "Density decides which layer is on top. Water is 1.0 and dichloromethane about 1.33, so DCM sinks and water floats; toluene (0.87) and ethyl acetate (0.90) float on water. Salty water layers are heavier than expected and close densities can invert layers, so when in doubt, add a few drops of water to a sample and see which layer grows.",
    },
    {
        "q": "In the plant separator, a hazy rag layer sits between the two phases. What do you do with it?",
        "opts": [
            ["Send it with the product layer", False, "And carry water and junk into the next step? Risky."],
            ["Take it as a separate cut to rework", True, "Yes! Keep it apart, settle or rework it later."],
            ["Send it to the drain", False, "It often holds product. Don't pour yield away."],
            ["Ignore it, it's harmless", False, "It's where solids and impurities gather. Not harmless."],
        ],
        "title": "The rag layer",
        "beats": [
            ["The rag layer holds fine solids, emulsion and impurities at the interface.",
             [*layers(60, 70, 160, 190, 170, "organic", "water"), ["p", "M66,160 L214,160 L214,180 L66,180 Z", "o", 2], ["t", 230, 176, "rag layer", 16, "o"]]],
            ["Drain the bottom layer slowly, watching the sight glass, and stop at the rag.",
             [["p", "M140,260 L140,290", "k", 3], ["v", 140, 300], ["t", 20, 334, "drain slowly, watch sight glass", 17, "k"]]],
            ["Take the rag into a separate container. Let it settle, filter it, or rework it as your approved procedure allows.",
             [["t", 20, 362, "rag → separate cut, settle or rework", 16, "g"]]],
            ["Drain flammable solvents slowly, with the vessel and container earthed. More in the workup guide on pharmacheme dot in.",
             [["t", 230, 300, "earthed", 16, "r"], ["t", 20, 392, "pharmacheme.in → workup", 15, "b"]]],
        ],
        "summary": "A rag layer at the interface holds fine solids, emulsion and impurities, and often some product. Drain the bottom layer slowly while watching the sight glass, stop at the rag, and take it as a separate cut to settle, filter or rework as the approved procedure allows. Drain flammable solvents slowly with the vessel and container earthed.",
    },
]

if __name__ == '__main__':
    main(globals())
