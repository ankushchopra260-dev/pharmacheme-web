"""Whiteboard lesson: scrubbers and gas absorption. Run: python3 tools/whiteboard/scrubbers.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import box, column, main

SLUG = 'scrubbers'
TITLE = 'Scrubbers'
CALC = '/calculators/packed-scrubber-calculator/'
CALC_LABEL = 'Open the packed scrubber calculator'
ENDS = ['The vent stack is clean on your watch.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: scrubbers, the last stop before a vent gas reaches the sky. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Now try the packed scrubber calculator."
SPOKEN = (('HCl', 'H C L'), ('NaOH', 'caustic soda'), ('NH₃', 'ammonia'), ('H₂SO₄', 'sulphuric acid'), ('NaCl', 'salt'), ('pH', 'p H'), (' kg', ' kilograms'))


def packed(x, y, w, h):
    """Packed scrubber: column with packing hatch and spray at the top."""
    it = column(x, y, w, h, 0)
    it += [["p", f"M{x + 6},{y + h * 0.3} L{x + w - 6},{y + h * 0.75} M{x + w - 6},{y + h * 0.3} L{x + 6},{y + h * 0.75}", "o", 1.2],
           ["p", f"M{x + 4},{y + h * 0.3} L{x + w - 4},{y + h * 0.3} M{x + 4},{y + h * 0.75} L{x + w - 4},{y + h * 0.75}", "k", 2]]
    return it


STEPS = [
    {
        "q": "HCl gas comes off a reactor vent. Which scrubbing liquid is the usual choice?",
        "opts": [
            ["Toluene", False, "HCl doesn't dissolve well in toluene. You'd just make a solvent vent."],
            ["Water, then caustic", True, "Yes! Water takes the bulk, caustic polishes."],
            ["Dilute sulphuric acid", False, "Acid won't neutralise an acid gas. Wrong team."],
            ["No scrubber needed", False, "HCl to atmosphere? The neighbours, and the board, will object."],
        ],
        "title": "Pick the liquid",
        "beats": [
            ["HCl dissolves very readily in water. A water stage takes most of it, and gives weak acid you may reuse.",
             [*packed(40, 70, 70, 220), ["a", 75, 320, 75, 292, "r"], ["t", 40, 340, "HCl gas in", 15, "r"], ["t", 130, 130, "stage 1: water", 16, "b"],
              ["t", 130, 152, "takes the bulk", 15, "b"]]],
            ["A second stage with dilute caustic soda neutralises what's left.",
             [*packed(240, 70, 70, 220), ["p", "M110,90 L225,90 L225,280 L240,280", "k", 2], ["t", 130, 200, "stage 2: caustic", 16, "g"], ["t", 130, 222, "polishes", 15, "g"]]],
            ["Match the liquid to the gas: alkali for acid gases, acid for alkaline ones.",
             [["t", 20, 372, "acid gas → alkali; alkaline gas → acid", 16, "k"]]],
            ["Very soluble or fast-reacting gases scrub well in short columns.",
             [["a", 275, 70, 275, 46, "k"], ["t", 234, 56, "clean", 14, "g"]]],
        ],
        "summary": "HCl is very soluble in water, so a water stage absorbs most of it, producing weak acid that may be reusable, and a second stage with dilute caustic soda neutralises the remainder. In general, scrub acid gases with alkali and alkaline gases with acid.",
    },
    {
        "q": "How much caustic soda (100 % basis) neutralises 100 kg of HCl?",
        "opts": [
            ["About 55 kg", False, "That's half what you need. Check the molecular weights."],
            ["About 100 kg", False, "Close, but NaOH is a bit heavier per mole than HCl."],
            ["About 110 kg", True, "About 110 kilos. Correct!"],
            ["About 220 kg", False, "Twice too much. It's one to one."],
        ],
        "title": "Caustic needed",
        "beats": [
            ["HCl plus NaOH gives NaCl and water. One mole each.",
             [["t", 20, 86, "HCl + NaOH → NaCl + H₂O", 20, "b"]]],
            ["HCl is 36.5, NaOH is 40. So each kilogram of HCl needs about 1.1 kilograms of caustic.",
             [["t", 20, 128, "36.5 kg HCl : 40 kg NaOH", 19, "k"], ["t", 20, 156, "100 kg HCl → ~110 kg NaOH", 20, "r"]]],
            ["As 10 percent solution, that's about 1100 kilograms of liquid, plus a margin, since you change it before it's all used.",
             [["t", 20, 200, "as 10 % solution: ~1100 kg", 19, "o"]]],
            ["Neutralisation releases about 13.7 kilocalories per mole, and dissolving the gas adds about 18 more. A big HCl surge can make the liquor very hot.",
             [["t", 20, 246, "heat: ~13.7 + ~18 kcal per mol", 18, "r"], ["t", 20, 272, "big surge → very hot liquor", 18, "r"]]],
        ],
        "summary": "HCl + NaOH → NaCl + H₂O, one mole each. With molecular weights of 36.5 and 40, 100 kg of HCl needs about 110 kg of NaOH on a 100 % basis, or about 1100 kg of 10 % solution. Neutralisation releases about 13.7 kcal per mole and dissolving gaseous HCl about 18 kcal per mole more, so a large HCl surge can make the liquor very hot.",
    },
    {
        "q": "The scrubber outlet still shows acid fumes. Flow is fine, but half the packing looks dry. Why?",
        "opts": [
            ["Too much liquid", False, "Too much liquid floods. Yours isn't even wetting it."],
            ["Poor liquid distribution", True, "Yes! Liquid channels down one side and gas sneaks up the dry side."],
            ["The gas is too clean", False, "If it were clean, there'd be no fumes."],
            ["The packing is too new", False, "New packing works fine, if it's wet."],
        ],
        "title": "Wet the packing",
        "beats": [
            ["Absorption happens on the wet packing surface. Dry packing does nothing.",
             [*packed(80, 70, 100, 230), ["p", "M90,140 L120,280", "b", 4], ["t", 200, 150, "liquid channels", 16, "b"], ["t", 200, 220, "dry side:", 16, "r"],
              ["t", 200, 242, "gas sneaks up", 16, "r"]]],
            ["A blocked or tilted distributor, or no redistributor in a tall bed, lets liquid run down one side.",
             [["t", 20, 334, "blocked/tilted distributor", 17, "o"]]],
            ["Gas takes the dry path, the easy way up, and leaves without being scrubbed.",
             [["t", 20, 360, "gas takes the dry path", 17, "r"]]],
            ["Clean and level the distributor. Tall beds need a redistributor every few metres.",
             [["t", 20, 388, "clean + level distributor", 17, "g"]]],
        ],
        "summary": "Gas absorption happens on wetted packing; dry packing does nothing. A blocked or tilted distributor, or a tall bed without redistribution, lets liquid channel down one side while gas rises through the dry side unscrubbed. Clean and level the distributor and fit redistributors every few metres in tall beds.",
    },
    {
        "q": "When should the caustic in a scrubber be changed?",
        "opts": [
            ["Once a month, whatever happens", False, "A busy week can use it up in days. Go by the reading, not the calendar."],
            ["When its colour changes", False, "Colour won't tell you the strength."],
            ["At its pH or strength limit", True, "Yes! Follow the pH, change at the limit."],
            ["Never; it lasts forever", False, "It turns into salt water as it works. Forever is optimistic."],
        ],
        "title": "Spent caustic",
        "beats": [
            ["As caustic soda reacts, it turns into salt. The pH falls batch by batch.",
             [["t", 20, 86, "NaOH → NaCl: pH falls", 20, "k"]]],
            ["Below a certain pH, the scrubber can't hold the gas any more. Breakthrough.",
             [["t", 20, 128, "low pH → breakthrough", 19, "r"]]],
            ["So set a limit, often around pH 10, or better, check the free caustic strength by titration, every shift or with an online meter.",
             [["t", 20, 172, "change at limit (pH ~10, or titrate)", 18, "g"], ["t", 20, 200, "check every shift or online", 17, "g"]]],
            ["Before a big HCl step, start with fresh caustic. Don't start a batch on spent liquor.",
             [["t", 20, 246, "big step? start fresh", 18, "o"]]],
        ],
        "summary": "Caustic soda turns into salt as it reacts, so the scrubber liquor's pH falls with use. Below a certain pH it can no longer hold the gas and breakthrough occurs. Set a limit (often around pH 10, or better, a free-caustic titration), check it every shift or online, and start large acid-gas steps with fresh caustic.",
    },
    {
        "q": "Ammonia comes off a vent. Which scrubbing liquid suits it?",
        "opts": [
            ["Dilute caustic soda", False, "Caustic and ammonia are both alkaline. No reaction, no scrubbing."],
            ["Toluene", False, "Ammonia goes straight through toluene."],
            ["Dilute sulphuric acid", True, "Correct! Acid grabs the ammonia and holds it as a salt."],
            ["Nothing; ammonia is harmless", False, "Ammonia is toxic and smells terrible. Scrub it."],
        ],
        "title": "Alkaline gases",
        "beats": [
            ["Ammonia is alkaline, so it needs an acid to hold it.",
             [["t", 20, 86, "NH₃ is alkaline → acid scrub", 20, "b"]]],
            ["Dilute sulphuric acid turns it into ammonium sulphate, which stays in solution.",
             [["t", 20, 128, "2 NH₃ + H₂SO₄ → (NH₄)₂SO₄", 19, "k"]]],
            ["Water alone absorbs ammonia too, but it loses its grip as the solution builds up and warms.",
             [["t", 20, 172, "water alone: weakens as it loads", 17, "o"]]],
            ["Again, control on pH. Here the pH rises as the acid is used, so change it at the upper limit.",
             [["t", 20, 218, "acid scrubber: pH rises as it works", 17, "g"]]],
        ],
        "summary": "Ammonia is alkaline, so it is scrubbed with dilute sulphuric acid, forming ammonium sulphate that stays in solution. Water alone absorbs ammonia but loses effectiveness as it loads and warms. Control an acid scrubber on pH too; its pH rises as the acid is consumed, so change it at the upper limit.",
    },
    {
        "q": "The scrubber circulation pump trips while a reaction is giving off HCl. What should happen?",
        "opts": [
            ["Keep dosing, the gas will wait", False, "Gas doesn't wait. It goes straight out of the vent."],
            ["An interlock stops the gas-making step", True, "Yes! No scrubbing, no dosing."],
            ["Open the vent wider", False, "That just sends more HCl outside, faster."],
            ["Restart the pump later, after the batch", False, "After the batch, the gas is already out."],
        ],
        "title": "Scrubber trips",
        "beats": [
            ["Without circulation, the packing dries out and the gas goes straight through.",
             [*box(30, 80, 120, 40, "reactor", "k", 16), ["p", "M150,100 L190,100 L190,240", "r", 2.5], ["a", 190, 240, 210, 240, "r"], *packed(210, 60, 70, 200), ["x", 245, 280, 10, "r"], ["t", 200, 304, "pump tripped", 15, "r"]]],
            ["So interlock the scrubber flow, or the pump, to the dosing or heating that makes the gas.",
             [["t", 20, 330, "interlock: low flow → stop dosing", 17, "g"]]],
            ["Alarm on low flow and low pH too, so the operator knows before fumes reach the stack. A standby pump that starts by itself helps, because gas can keep coming after dosing stops.",
             [["t", 20, 356, "alarms: low flow, low pH", 17, "b"]]],
            ["Test those interlocks regularly. Check your scrubber with the packed scrubber calculator on pharmacheme dot in.",
             [["t", 20, 386, "pharmacheme.in → packed scrubber", 16, "b"]]],
        ],
        "summary": "If the scrubber circulation pump trips, the packing dries and gas passes straight through. Interlock low scrubber flow, or the pump, to stop the dosing or heating that generates the gas, add low-flow and low-pH alarms, and test the interlocks regularly.",
    },
]

if __name__ == '__main__':
    main(globals())
