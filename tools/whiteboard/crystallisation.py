"""Whiteboard lesson: crystallisation. Run: python3 tools/whiteboard/crystallisation.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, main

SLUG = 'crystallisation'
TITLE = 'Crystallisation'
CALC = '/articles/solubility-curve-and-crystallisation-yield/'
CALC_LABEL = 'Read the solubility and yield guide'
ENDS = ['Your crystals will filter like sand.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: crystallisation, where your product decides what shape it wants to be. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Read the solubility and yield guide next."
SPOKEN = (('°C', ' degrees'), ('10 g per 100 g', '10 grams per 100 grams'), (' kg', ' kilograms'))

STEPS = [
    {
        "q": "100 kg dissolved in 300 kg solvent, cooled to 5 °C, where solubility is 10 g per 100 g. Best yield?",
        "opts": [
            ["90 %", False, "90? You forgot how much stays dissolved in 300 kilos."],
            ["70 %", True, "70 percent. Correct!"],
            ["100 %", False, "100? Some always stays in the mother liquor."],
            ["30 %", False, "30 is what's lost, not what you get."],
        ],
        "title": "Yield from solubility",
        "beats": [
            ["At 5 degrees, 100 grams of solvent can hold 10 grams of product.",
             [["t", 20, 86, "5 °C: 10 g per 100 g solvent", 18, "k"]]],
            ["300 kilograms of solvent hold 30 kilograms. That stays in the mother liquor.",
             [["t", 20, 124, "300 kg × 10/100 = 30 kg dissolved", 18, "b"]]],
            ["100 minus 30 leaves 70 kilograms of crystals. 70 percent is the most you can get.",
             [["t", 20, 166, "100 − 30 = 70 kg → 70 %", 21, "r"]]],
            ["Less solvent, a colder end, or an anti-solvent all push it up. Real yield is a little lower, after washing and handling.",
             [["t", 20, 220, "more yield: less solvent,", 17, "g"], ["t", 20, 244, "colder end, anti-solvent", 17, "g"], ["t", 20, 280, "wash losses come off this", 16, "o"]]],
        ],
        "summary": "At 5 °C the solvent holds 10 g of product per 100 g, so 300 kg of solvent keeps 30 kg dissolved in the mother liquor. The maximum crystallised is 100 − 30 = 70 kg, a 70 % yield. Less solvent, a lower final temperature or an anti-solvent raise it; washing and handling losses bring the real yield a little lower.",
    },
    {
        "q": "You crash-cool a batch fast. The crystals come out very fine and filter badly. Why?",
        "opts": [
            ["The solvent evaporated", False, "Nothing evaporated. It's about how fast you cooled."],
            ["Too many new nuclei formed", True, "Yes! Millions of new crystals, none of them big."],
            ["The agitator was off", False, "Agitation matters, but this is about cooling too fast."],
            ["The product decomposed", False, "Fine crystals aren't decomposed. Just tiny."],
        ],
        "title": "Crash cooling",
        "beats": [
            ["Supersaturation is the driving force: how much more is dissolved than the solubility allows.",
             [*axes(40, 64, 320, 250, "temperature", "conc."), ["p", "M50,240 Q200,220 300,90", "b", 3], ["t", 250, 176, "solubility", 15, "b"]]],
            ["Cool slowly, and you stay just above the curve. Existing crystals grow.",
             [["p", "M300,92 Q230,160 120,212", "g", 3], ["t", 120, 178, "slow: growth", 15, "g"]]],
            ["Crash-cool, and supersaturation shoots up. The batch makes millions of new tiny crystals instead.",
             [["p", "M300,92 L120,92", "r", 3], ["t", 130, 84, "fast: nucleation!", 15, "r"]]],
            ["Fine crystals pack tight, filter slowly and hold more mother liquor. Cool slowly, at least at the start.",
             [["t", 20, 290, "fines: slow filtration,", 17, "r"], ["t", 20, 314, "wet, impure cake", 17, "r"], ["t", 20, 352, "cool slowly, esp. at the start", 17, "g"]]],
        ],
        "summary": "Supersaturation, the excess of dissolved product over its solubility, drives crystallisation. Slow cooling keeps supersaturation low so existing crystals grow. Crash cooling drives supersaturation high, and the batch forms huge numbers of new nuclei instead, giving fine crystals that filter slowly and hold more mother liquor. Cool slowly, especially at the start.",
    },
    {
        "q": "Why add seed crystals to a crystallisation?",
        "opts": [
            ["To raise the solubility", False, "Seeds don't change solubility. They give crystals a place to grow."],
            ["To control nucleation", True, "Yes! Growth on your terms, not random nucleation."],
            ["To speed up the cooling", False, "Seeds don't cool anything. The jacket does."],
            ["To add more product", False, "A percent or so of seed barely moves the yield."],
        ],
        "title": "Seeding",
        "beats": [
            ["Without seed, crystals appear at random, often late and all at once.",
             [["t", 20, 86, "no seed: random, late, sudden", 18, "r"]]],
            ["Seed gives the dissolved product a surface to grow on, at low supersaturation.",
             [["c", 90, 150, 8, "o", 3], ["c", 130, 160, 8, "o", 3], ["c", 110, 190, 8, "o", 3], ["a", 160, 170, 220, 170, "k"],
              ["c", 260, 150, 16, "o", 3], ["c", 300, 172, 16, "o", 3], ["c", 270, 200, 16, "o", 3], ["t", 30, 236, "seeds grow", 16, "g"]]],
            ["You get the same crystal form and size, batch after batch.",
             [["t", 20, 280, "same form, same size, each batch", 18, "g"]]],
            ["Use the right polymorph as seed, add it as a slurry, and add it at the right temperature.",
             [["t", 20, 320, "right form, as a slurry,", 17, "b"], ["t", 20, 344, "at the right temperature", 17, "b"]]],
        ],
        "summary": "Without seed, crystals nucleate at random, often late and suddenly. Seed crystals give dissolved product a surface to grow on at low supersaturation, so crystal form and size repeat batch after batch. Seed with the correct polymorph, as a slurry, at the right temperature.",
    },
    {
        "q": "On the solubility chart, where should you add the seed?",
        "opts": [
            ["Below the curve, undersaturated", False, "Undersaturated? Your seed will just dissolve."],
            ["Just inside the metastable zone", True, "Correct! Slightly supersaturated, before it nucleates on its own."],
            ["Far beyond the metastable limit", False, "Too late. It's already nucleating by itself."],
            ["After filtration", False, "After filtration? That's not seeding, that's garnish."],
        ],
        "title": "Metastable zone",
        "beats": [
            ["Below the solubility curve the solution is unsaturated: seed dissolves.",
             [*axes(40, 64, 320, 260, "temperature", "conc."), ["p", "M50,250 Q200,230 300,100", "b", 3], ["t", 262, 162, "solubility", 14, "b"],
              ["t", 200, 236, "seed dissolves", 14, "k"]]],
            ["Just above it is the metastable zone. Supersaturated, but it won't nucleate on its own yet.",
             [["p", "M50,180 Q160,170 260,90", "r", 2], ["t", 60, 172, "metastable limit", 14, "r"]]],
            ["Seed in that zone, close to the solubility curve. Seeds grow, and few new crystals form.",
             [["c", 210, 168, 7, "g", 3], ["t", 222, 182, "seed here", 15, "g"]]],
            ["Then cool slowly enough to stay inside the zone until the end.",
             [["t", 20, 300, "then cool slowly, stay in the zone", 17, "g"]]],
        ],
        "summary": "Below the solubility curve the solution is unsaturated and seed dissolves. Between the solubility curve and the metastable limit it is supersaturated but does not nucleate on its own. Add seed just inside this metastable zone, close to the solubility curve, so the seeds grow with little new nucleation, then cool slowly enough to stay in the zone.",
    },
    {
        "q": "On cooling, the product separates as an oily layer instead of crystals. Best first fix?",
        "opts": [
            ["Cool even faster", False, "Faster cooling pushes supersaturation higher. That's what makes oil."],
            ["Seed earlier, cool slower", True, "Yes! Get crystals growing before the oil can form."],
            ["Stop the agitator", False, "Stopping the agitator just lets the oil settle."],
            ["Add anti-solvent fast", False, "Faster anti-solvent means higher supersaturation. More oil, not less."],
        ],
        "title": "Oiling out",
        "beats": [
            ["Oiling out happens when the product comes out as a liquid. High supersaturation, impurities or a low melting point can cause it.",
             [["p", "M60,80 L60,240 L260,240 L260,80", "k", 3], ["p", "M64,200 L256,200", "o", 3], ["p", "M64,200 L256,200 L256,236 L64,236 Z", "o", 2],
              ["t", 280, 220, "oil", 17, "o"]]],
            ["The oil traps impurities. When it finally sets, you get sticky lumps, not clean crystals.",
             [["t", 20, 280, "oil traps impurities → lumps", 17, "r"]]],
            ["Seed earlier, at lower supersaturation, and cool slower, so crystals form before the oil can.",
             [["t", 20, 320, "seed earlier, cool slower", 18, "g"]]],
            ["If that's not enough, change the solvent ratio or crystallise at a different temperature.",
             [["t", 20, 356, "else: change solvent ratio", 17, "b"], ["t", 20, 380, "or temperature", 17, "b"]]],
        ],
        "summary": "Oiling out is the product separating as a liquid instead of crystals, often caused by high supersaturation, impurities or a low melting point. The oil traps impurities and sets into sticky lumps. Seed earlier at lower supersaturation and cool more slowly so crystals form first; if needed, change the solvent ratio or crystallisation temperature.",
    },
    {
        "q": "Same compound, two different crystal forms (polymorphs). Why does it matter for a drug?",
        "opts": [
            ["It doesn't: same molecule", False, "Same molecule, different packing. The patient can tell the difference."],
            ["Solubility can differ", True, "Correct! And so can stability, and how the drug works in the body."],
            ["Only the colour changes", False, "Colour is the least of it."],
            ["Only the price changes", False, "Price is the least of it. A different form can change how much drug the patient absorbs."],
        ],
        "title": "Polymorphs",
        "beats": [
            ["Polymorphs are the same molecule, packed in a different crystal arrangement.",
             [["p", "M40,80 L100,80 L100,140 L40,140 Z", "o", 3], ["p", "M70,80 L70,140 M40,110 L100,110", "o", 1.5],
              ["p", "M180,80 L240,110 L210,160 L150,130 Z", "b", 3], ["t", 40, 168, "form I", 15, "o"], ["t", 170, 184, "form II", 15, "b"]]],
            ["Different packing can mean different solubility, dissolution rate and stability. That changes how the drug behaves.",
             [["t", 20, 226, "solubility, dissolution,", 18, "r"], ["t", 20, 252, "stability can differ", 18, "r"]]],
            ["The approved form is in the specification. Making the wrong one is a failed batch.",
             [["t", 20, 294, "the form is in the spec", 18, "k"]]],
            ["Control it with the solvent, temperature, cooling rate and the right seed. Read the solubility and yield guide on pharmacheme dot in.",
             [["t", 20, 336, "solvent, temperature, seed", 17, "g"], ["t", 20, 380, "pharmacheme.in → solubility & yield", 16, "b"]]],
        ],
        "summary": "Polymorphs are crystal forms of the same molecule with different packing. They can differ in solubility, dissolution rate and stability, which changes how a drug behaves, so the approved form is part of the specification and the wrong form fails the batch. The form is controlled through solvent, temperature, cooling rate and seeding with the correct polymorph.",
    },
]

if __name__ == '__main__':
    main(globals())
