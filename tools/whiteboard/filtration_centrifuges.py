"""Whiteboard lesson: filtration and centrifuges. Run: python3 tools/whiteboard/filtration_centrifuges.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, main

SLUG = 'filtration-centrifuges'
TITLE = 'Filtration and centrifuges'
CALC = '/calculators/filtration-calculator/'
CALC_LABEL = 'Open the filtration calculator'
ENDS = ['Your cakes will come out dry.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: filters and centrifuges, where batches go to get squeezed. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Now try your own filtration numbers in the filtration calculator."
SPOKEN = (('rpm', 'R P M'), ('ω²r', 'omega squared r'), ('LOD', 'L O D'), ('O₂', 'oxygen'), ('V²', 'V squared'))


def basket(cx, cy, r):
    """Centrifuge basket seen from above: wall and cake ring."""
    return [["c", cx, cy, r, "k", 3], ["c", cx, cy, r - 10, "o", 4], ["c", cx, cy, 4, "k", 3]]


STEPS = [
    {
        "q": "Constant-pressure filter, cloth ignored. How long to filter twice the volume?",
        "opts": [
            ["Twice as long", False, "Twice? The cake keeps getting thicker as you go."],
            ["About 4 times as long", True, "4 times! The growing cake slows you down."],
            ["The same time", False, "Same time? The cake would like to disagree."],
            ["8 times as long", False, "Too much. It goes with volume squared, not cubed."],
        ],
        "title": "Growing cake",
        "beats": [
            ["As you filter, the cake gets thicker, and the thicker cake resists flow more.",
             [["p", "M60,80 L60,220 L240,220 L240,80", "k", 3], ["p", "M64,200 L236,200", "k", 1.5], ["p", "M64,200 L236,200 L236,180 L64,180 Z", "o", 2],
              ["p", "M64,170 L236,170", "o", 1.5], ["t", 250, 196, "cake grows", 16, "o"], ["a", 150, 100, 150, 168, "b"]]],
            ["At constant pressure, the filtration time goes with the volume squared.",
             [["t", 20, 262, "t ∝ V²  (cloth ignored)", 20, "b"]]],
            ["Twice the volume means four times the time. The last part of the batch is always the slowest.",
             [["t", 20, 296, "2 × V → 4 × time", 20, "r"]]],
            ["That's why thick cakes are slow. Sometimes two thinner loads are quicker than one thick one.",
             [["t", 20, 340, "two thin loads can beat", 17, "g"], ["t", 20, 364, "one thick load", 17, "g"]]],
        ],
        "summary": "During constant-pressure filtration the cake thickens and its resistance grows with the volume filtered. Ignoring cloth resistance, filtration time goes with volume squared, so twice the volume takes about four times as long, and the end of each batch is the slowest. Two thinner loads can be quicker than one thick one.",
    },
    {
        "q": "The cake is soft and compressible. You double the filter pressure. What happens to the rate?",
        "opts": [
            ["It doubles", False, "Only for a hard, incompressible cake. Yours squashes."],
            ["It rises less than double", True, "Yes! The cake squashes and closes up."],
            ["It goes up 4 times", False, "4 times? Pressure isn't that generous, even on hard cakes."],
            ["It always stops", False, "It doesn't stop. It just doesn't help as much as you hoped."],
        ],
        "title": "Squashed cake",
        "beats": [
            ["For a hard, gritty cake, flow goes up roughly in step with pressure.",
             [*axes(40, 64, 320, 260, "pressure", "rate"), ["p", "M44,256 L300,90", "g", 3], ["t", 140, 120, "hard cake", 15, "g"]]],
            ["A soft cake squashes under pressure. Its pores close, so its resistance goes up.",
             [["p", "M44,256 Q140,170 300,160", "r", 3], ["t", 230, 184, "soft cake", 15, "r"]]],
            ["Push harder, and you can even pack it tight enough to blind the cloth.",
             [["t", 20, 300, "too much pressure → blinded", 18, "r"]]],
            ["Better fixes: bigger crystals from the crystalliser, a thinner cake, or a filter aid where the solids are waste, like carbon.",
             [["t", 20, 340, "bigger crystals, thinner cake", 17, "g"], ["t", 20, 364, "(filter aid only for waste solids)", 15, "g"]]],
        ],
        "summary": "For a hard, incompressible cake the filtration rate rises roughly in proportion to pressure. A soft, compressible cake squashes as pressure rises, closing its pores, so the rate rises less than in proportion and can barely change, and very high pressure can blind the cloth. Better fixes are larger crystals or a thinner cake; filter aid suits only waste solids such as carbon, since it stays in the cake.",
    },
    {
        "q": "The cake cracks just before washing. What happens to the wash?",
        "opts": [
            ["It works better", False, "Better? The wash takes the easy way out through the cracks."],
            ["It channels through the cracks", True, "Correct! Channelling. The cake stays dirty."],
            ["Nothing changes", False, "Cracks change everything. Liquid always takes the easy path."],
            ["The wash stops completely", False, "It flows all right. Just in the wrong place."],
        ],
        "title": "Cracked cake",
        "beats": [
            ["A cake cracks when it's sucked or blown too dry, or shrinks as it drains.",
             [["p", "M40,120 L320,120 L320,180 L40,180 Z", "o", 3], ["p", "M120,120 L130,150 L118,180 M230,120 L222,152 L236,180", "k", 2],
              ["t", 40, 108, "cake", 16, "o"]]],
            ["Wash liquid takes the easy way, straight down the cracks. Most of the cake never sees it.",
             [["a", 125, 90, 125, 200, "b"], ["a", 230, 90, 230, 200, "b"], ["t", 40, 230, "wash goes down the cracks", 17, "b"]]],
            ["The mother liquor stays in the cake, and so do the impurities.",
             [["t", 40, 262, "impurities stay in", 17, "r"]]],
            ["Keep the cake wet before washing, or smooth the cracks, or reslurry wash it.",
             [["t", 20, 310, "keep it wet before washing", 17, "g"], ["t", 20, 336, "smooth cracks, or reslurry", 17, "g"]]],
        ],
        "summary": "A cake cracks if it is sucked or blown too dry or shrinks as it drains. Wash liquid then channels down the cracks and misses most of the cake, leaving mother liquor and impurities behind. Keep the cake wet until washing, smooth the cracks, or reslurry wash it.",
    },
    {
        "q": "A centrifuge basket of half a metre radius spins at 1000 rpm. Roughly what g-force?",
        "opts": [
            ["About 50 times gravity", False, "Ten times too little. Square omega, then times the radius."],
            ["About 560 times gravity", True, "About 560 times gravity. Correct!"],
            ["About 1000 times gravity", False, "rpm and g-force aren't the same number. Do the maths."],
            ["About 5600 times gravity", False, "Ten times too much. Check the radius."],
        ],
        "title": "G-force",
        "beats": [
            ["G-force is omega squared times radius, divided by g.",
             [*basket(80, 140, 56), ["t", 160, 120, "G = ω²r ÷ g", 22, "b"]]],
            ["1000 rpm is about 105 radians per second. Squared, that's about 11 thousand.",
             [["t", 160, 160, "ω = 2π × 1000/60", 17, "k"], ["t", 160, 186, "≈ 105 rad/s", 17, "k"]]],
            ["Times half a metre, divided by 9.81. About 560 times gravity.",
             [["t", 20, 240, "105² × 0.5 ÷ 9.81 ≈ 560 g", 21, "r"]]],
            ["The same speed on a bigger basket gives more g. And more g squeezes more liquid out of the cake.",
             [["t", 20, 290, "bigger basket, same rpm → more g", 17, "g"]]],
        ],
        "summary": "Centrifugal force in g is ω²r ÷ g. At 1000 rpm, ω = 2π × 1000 ÷ 60 ≈ 105 rad/s, so with a 0.5 m radius G ≈ 105² × 0.5 ÷ 9.81 ≈ 560 g. At the same speed a larger basket gives more g, which squeezes more liquid from the cake.",
    },
    {
        "q": "You spin longer, but the cake's LOD stops falling after a few minutes. Why?",
        "opts": [
            ["The centrifuge is broken", False, "It's working fine. The cake is just holding on."],
            ["Pore liquid won't spin out", True, "Yes! Capillary liquid. More time won't shift it."],
            ["The cake got wetter", False, "It didn't get wetter. It just stopped getting drier."],
            ["The motor slowed down", False, "Check the speed if you like. That's not it."],
        ],
        "title": "Spin limit",
        "beats": [
            ["Early on, free liquid between the crystals spins out fast.",
             [*axes(40, 64, 320, 240, "spin time", "LOD"), ["p", "M44,80 Q90,200 160,214 L300,218", "b", 3], ["t", 70, 130, "fast drop", 15, "b"]]],
            ["What's left is held in the fine pores and on the crystal surface, by capillary forces.",
             [["t", 190, 204, "flat: capillary liquid", 15, "r"]]],
            ["More spin time barely helps. Higher g, bigger crystals, or a final wash with a thin, low-surface-tension solvent help more.",
             [["t", 20, 280, "more time: little gain", 17, "r"], ["t", 20, 306, "more g, bigger crystals,", 17, "g"], ["t", 20, 330, "low-viscosity final wash", 17, "g"]]],
            ["So set the spin time where the curve flattens, not longer.",
             [["t", 20, 372, "stop where the curve flattens", 17, "k"]]],
        ],
        "summary": "Free liquid between crystals spins out quickly, so LOD falls fast at first. The liquid left is held in fine pores and on crystal surfaces by capillary forces, and extra spin time barely moves it. Higher g, larger crystals or a final wash with a low-viscosity, low-surface-tension solvent help more. Set the spin time where the LOD curve flattens.",
    },
    {
        "q": "Before spinning a cake wet with toluene, what must be done?",
        "opts": [
            ["Inert it, check the oxygen", True, "Correct! Spinning basket plus solvent vapour: keep the oxygen out."],
            ["Open the lid to let vapour out", False, "Open the lid?! That lets air in. Exactly wrong."],
            ["Nothing, it's a few litres", False, "A few litres of toluene can fill the casing with flammable vapour. Plenty for a flash fire."],
            ["Heat it to dry faster", False, "Heat? You'd just make more vapour."],
        ],
        "title": "Inert first",
        "beats": [
            ["A spinning basket full of solvent vapour is a fire waiting for a spark. Static from the cake or the bag can give one.",
             [*basket(80, 150, 56), ["t", 160, 120, "solvent vapour", 17, "r"], ["t", 160, 146, "+ static spark", 17, "r"]]],
            ["So purge with nitrogen first, and keep it on while spinning.",
             [["t", 20, 240, "purge with nitrogen", 19, "b"]]],
            ["Check the oxygen with an analyser. The interlock must stop the machine starting, and stop feeding, if oxygen is above the limit. Set it safely below the solvent's limiting oxygen value: often an alarm near 5 percent and a trip near 8, lower for some solvents.",
             [["t", 20, 276, "O₂ below limit, interlocked", 19, "b"]]],
            ["Earth the machine and use conductive bags. Then check the numbers in the filtration calculator on pharmacheme dot in.",
             [["t", 20, 316, "earth machine, conductive bags", 17, "g"], ["t", 20, 380, "pharmacheme.in → filtration", 16, "b"]]],
        ],
        "summary": "A centrifuge spinning a solvent-wet cake is full of flammable vapour, and static from the cake or bags can ignite it. Purge with nitrogen before spinning and keep the purge on, with an oxygen analyser interlocked to block start-up and stop feeding if oxygen is above the limit, set safely below the solvent's limiting oxygen concentration (often an alarm near 5 % and a trip near 8 %, lower for some solvents). Earth the machine and use conductive bags.",
    },
]

if __name__ == '__main__':
    main(globals())
