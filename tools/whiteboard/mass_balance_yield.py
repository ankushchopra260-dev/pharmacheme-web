"""Whiteboard lesson: mass balance and yield. Run: python3 tools/whiteboard/mass_balance_yield.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import box, main

SLUG = 'mass-balance-yield'
TITLE = 'Mass balance and yield'
CALC = '/articles/material-and-energy-balance/'
CALC_LABEL = 'Read the material and energy balance guide'
ENDS = ['The costing team wants your number.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: mass balance and yield. Where every kilogram has to be found. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Read the material and energy balance guide next."
SPOKEN = (('1 kmol of', '1 kilomole of'), ('of A ', 'of eigh '), ('Correct! A runs', 'Correct! eigh runs'), (' kmol', ' kilomoles'), ('kmol', 'kilomoles'), (' kg', ' kilograms'), ('MW', 'molecular weight'))

STEPS = [
    {
        "q": "1 kmol of limiting reagent (MW 150) reacts 1 to 1, giving 160 kg of product (MW 200). Molar yield?",
        "opts": [
            ["107 %", False, "That's 160 over 150, a weight ratio. Count the moles instead."],
            ["80 %", True, "80 percent. Correct!"],
            ["75 %", False, "That's 150 over 200. Not quite how yield works."],
            ["94 %", False, "That's 150 over 160. The weight ratio, upside down."],
        ],
        "title": "Molar yield",
        "beats": [
            ["Molar yield compares moles of product with the moles you could have made.",
             [["t", 20, 86, "molar yield = moles made ÷ moles possible", 16, "k"]]],
            ["160 kilograms of product at molecular weight 200 is 0.8 kilomoles.",
             [["t", 20, 128, "160 ÷ 200 = 0.8 kmol product", 19, "b"]]],
            ["One to one, so 1 kilomole of starting material could give 1 kilomole. 0.8 over 1 is 80 percent.",
             [["t", 20, 168, "0.8 ÷ 1.0 = 80 %", 22, "r"]]],
            ["Always base yield on the limiting reagent, and say if it's molar or by weight.",
             [["t", 20, 220, "base it on the limiting reagent", 18, "g"], ["t", 20, 246, "say molar or by weight", 18, "g"]]],
        ],
        "summary": "Molar yield is moles of product made divided by moles that could have been made from the limiting reagent. 160 kg of product with molecular weight 200 is 0.8 kmol; with 1:1 stoichiometry, 1 kmol of starting material could give 1 kmol, so the molar yield is 80 %. Always state whether a yield is molar or by weight.",
    },
    {
        "q": "The same batch gives a weight yield of 107 %. How can that be over 100 %?",
        "opts": [
            ["The product is heavier per mole", True, "Right! Each molecule picked up mass in the reaction."],
            ["The balance was wrong", False, "Maybe, but here there's a simpler reason."],
            ["Solvent was counted as product", False, "Wet product can do that, but here the molecular weights already explain it."],
            ["Weight yield can never go over 100 %", False, "It can, and it does, often."],
        ],
        "title": "Weight yield",
        "beats": [
            ["Weight yield is kilograms of product per kilogram of starting material. 160 over 150 is 107 percent.",
             [["t", 20, 86, "weight yield = 160 ÷ 150 = 107 %", 18, "k"]]],
            ["The product molecule weighs 200, the starting material 150. Each mole gained 50.",
             [*box(30, 120, 110, 50, "SM 150", "o", 18), ["a", 150, 145, 200, 145, "k"], *box(210, 120, 110, 50, "P 200", "b", 18)]],
            ["So a weight yield over 100 percent is normal when the product is heavier.",
             [["t", 20, 220, "heavier product → can exceed 100 %", 17, "g"]]],
            ["Costing uses weight yield. Chemists judge the reaction by molar yield. Know which one you're quoting.",
             [["t", 20, 264, "costing: weight yield", 18, "b"], ["t", 20, 290, "chemistry: molar yield", 18, "b"]]],
        ],
        "summary": "Weight yield is kilograms of product per kilogram of starting material: 160 ÷ 150 = 107 %. It can exceed 100 % when the product molecule is heavier than the starting material, here 200 against 150. Costing usually uses weight yield, while chemists judge reactions by molar yield.",
    },
    {
        "q": "1.0 kmol of A and 1.3 kmol of B react 1 to 1. Which is limiting, and what is B's excess?",
        "opts": [
            ["B limits; A is 30 % excess", False, "Backwards. B is the one with more moles."],
            ["Neither; they're balanced", False, "1.0 and 1.3 aren't balanced. One runs out first."],
            ["A limits; B is 30 % excess", True, "Correct! A runs out first, B is 30 percent over."],
            ["A limits; B is 130 % excess", False, "130 percent is the total B, not the excess."],
        ],
        "title": "Limiting reagent",
        "beats": [
            ["At 1 to 1, the reagent with fewer moles runs out first. That's A.",
             [["t", 20, 86, "A 1.0 kmol   B 1.3 kmol", 19, "k"], ["t", 20, 116, "1 : 1 → A runs out first", 19, "r"]]],
            ["Excess is the extra over what's needed: 0.3 kilomoles over 1.0. 30 percent.",
             [["t", 20, 160, "excess B = 0.3 ÷ 1.0 = 30 %", 19, "b"]]],
            ["Yield is always based on the limiting reagent, here A.",
             [["t", 20, 204, "yield based on A", 19, "g"]]],
            ["Excess helps the costly reagent react fully, but it costs money and must be removed later. Use only as much as earns its keep.",
             [["t", 20, 248, "excess: cost + removal", 18, "o"]]],
        ],
        "summary": "With 1:1 stoichiometry, the reagent with fewer moles, A at 1.0 kmol, runs out first and is limiting. B's excess is 0.3 ÷ 1.0 = 30 %. Yield is based on the limiting reagent; the excess costs money and has to be removed later.",
    },
    {
        "q": "Conversion is 90 % and selectivity to product is 80 %. What is the yield?",
        "opts": [
            ["85 %", False, "Averaging doesn't work here. Multiply."],
            ["90 %", False, "That's just the conversion. Some of it went to by-products."],
            ["72 %", True, "72 percent. Conversion times selectivity. Correct!"],
            ["80 %", False, "That's the selectivity alone. Not all the starting material reacted."],
        ],
        "title": "Conversion vs yield",
        "beats": [
            ["Conversion: how much starting material reacted. 90 percent.",
             [["t", 20, 86, "conversion: 90 % reacted", 19, "k"]]],
            ["Selectivity: how much of what reacted became the product. 80 percent.",
             [["t", 20, 120, "selectivity: 80 % → product", 19, "k"]]],
            ["Yield is conversion times selectivity. 0.9 times 0.8 is 72 percent.",
             [["t", 20, 166, "yield = 0.9 × 0.8 = 72 %", 22, "r"]]],
            ["Low conversion? Look at time, temperature, catalyst. Low selectivity? Look at side reactions and mixing.",
             [["t", 20, 220, "low conversion → time, temp, catalyst", 16, "b"], ["t", 20, 246, "low selectivity → side reactions, mixing", 16, "o"]]],
        ],
        "summary": "Conversion is the fraction of starting material that reacted (90 %); selectivity is the fraction of what reacted that became product (80 %). Yield is conversion × selectivity: 0.9 × 0.8 = 72 %. Low conversion points to time, temperature or catalyst; low selectivity points to side reactions and mixing.",
    },
    {
        "q": "1000 kg went into a batch, but everything measured out adds up to 900 kg. What do you do?",
        "opts": [
            ["Report the yield anyway", False, "With 100 kilos missing? Your yield could be fiction."],
            ["Find the missing 100 kg first", True, "Yes! Close the balance before you trust any number."],
            ["Call it evaporation loss", False, "Maybe some. Measure it before you write it off."],
            ["Blame the weighbridge", False, "Check it, sure. But look elsewhere too."],
        ],
        "title": "Close the balance",
        "beats": [
            ["In equals out plus what's still inside. If it doesn't add up, something is unmeasured.",
             [["t", 20, 86, "in = out + accumulation", 20, "b"]]],
            ["Common hiding places: vapour to the vent or scrubber, hold-up in lines and filters, samples, and spills.",
             [["t", 20, 128, "vent, scrubber", 17, "o"], ["t", 20, 152, "hold-up: lines, filter, dryer", 17, "o"], ["t", 20, 176, "samples, spills", 17, "o"]]],
            ["Check the weights and the densities used for liquids, too. A wrong density hides many kilos.",
             [["t", 20, 220, "check weights + densities", 18, "k"]]],
            ["Close the balance to a few percent before you trust the yield, or the waste figures.",
             [["t", 20, 264, "close it before trusting yield", 18, "g"]]],
        ],
        "summary": "A mass balance must close: in = out + accumulation. A 100 kg gap means something is unmeasured, typically vapour lost to vents or scrubbers, hold-up in lines, filters and dryers, samples or spills, or wrong weights or liquid densities. Close the balance to within a few percent before trusting yield or waste figures.",
    },
    {
        "q": "Recycling mother liquor raises the overall yield. What is the catch?",
        "opts": [
            ["The batch gets bigger", False, "Bigger is manageable. Something sneakier builds up."],
            ["The solvent evaporates", False, "Solvent losses happen, but that's not the catch."],
            ["Nothing; recycle everything", False, "Recycle everything and you'll be recycling junk too."],
            ["Impurities build up", True, "Correct! You need a purge."],
        ],
        "title": "Recycle and purge",
        "beats": [
            ["Mother liquor still holds dissolved product. Recycling it recovers some.",
             [*box(30, 80, 120, 44, "crystallise", "k", 16), *box(200, 80, 120, 44, "filter", "k", 16), ["a", 150, 102, 200, 102, "k"],
              ["p", "M260,124 L260,170 L90,170 L90,124", "b", 2.5], ["a", 90, 140, 90, 126, "b"], ["t", 120, 190, "mother liquor recycle", 15, "b"]]],
            ["But the impurities come back too, and they pile up with every cycle.",
             [["t", 20, 236, "impurities build up each cycle", 18, "r"]]],
            ["Sooner or later they come out with the product, or stay in the wet cake, and the batch fails.",
             [["t", 20, 268, "→ product fails purity", 18, "r"]]],
            ["So purge a part of the liquor every time, and set a limit on the number of recycles. More in the material and energy balance guide on pharmacheme dot in.",
             [["a", 260, 170, 320, 210, "o"], ["t", 250, 230, "purge", 16, "o"], ["t", 20, 310, "purge some, limit cycles", 18, "g"], ["t", 20, 380, "pharmacheme.in → material balance", 16, "b"]]],
        ],
        "summary": "Mother liquor still contains dissolved product, so recycling it raises overall yield. But impurities return too and accumulate each cycle until they crystallise with the product and the batch fails purity. Purge part of the liquor each time and set a limit on the number of recycles.",
    },
]

if __name__ == '__main__':
    main(globals())
