"""Whiteboard lesson: distillation basics. Run: python3 tools/whiteboard/distillation_basics.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, column, main

SLUG = 'distillation-basics'
TITLE = 'Distillation basics'
CALC = '/calculators/batch-distillation-simulator/'
CALC_LABEL = 'Open the batch distillation simulator'
ENDS = ['Columns behave when you walk past.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. I live in distillation columns, so this one's personal. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Now run a batch of your own in the distillation simulator."
SPOKEN = (('R = L / D', 'R equals L over D'), ('ΔP', 'pressure drop'), ('Rmin', 'R minimum'), ('Nmin', 'N minimum'),
          ('x-y', 'x y'), ('IPA', 'I P A'), ('THF', 'T H F'), ('wt %', 'percent by weight'))

STEPS = [
    {
        "q": "You raise the reflux ratio and keep the reboiler steam the same. What happens?",
        "opts": [
            ["More distillate, same purity", False, "More distillate from the same steam? Physics would like a word."],
            ["Purer top product, but less of it", True, "Yes! Purer, but slower. The steam meter decides the rest."],
            ["The column pressure falls", False, "Pressure is set by the condenser and the vent, not the reflux knob."],
            ["Nothing changes", False, "Nothing? Then why does every column have a reflux valve?"],
        ],
        "title": "Reflux ratio",
        "beats": [
            ["At the top, the vapour is condensed. Part of it goes back down the column as reflux. The rest leaves as distillate.",
             [*column(40, 70, 56, 250, 5), ["p", "M68,66 L68,50 L150,50 L150,70", "k", 3], ["c", 150, 84, 14, "b", 2.5],
              ["t", 172, 88, "condenser", 15, "b"], ["p", "M150,98 L150,130", "k", 3], ["p", "M150,130 L100,130", "k", 3],
              ["a", 120, 130, 98, 130, "g"], ["t", 108, 150, "reflux L", 15, "g"], ["a", 150, 130, 240, 130, "o"], ["t", 244, 136, "distillate D", 15, "o"]]],
            ["The reflux ratio is reflux over distillate.",
             [["t", 140, 196, "R = L / D", 26, "k"]]],
            ["More liquid coming down washes the heavy component out of the rising vapour. The top gets purer.",
             [["a", 76, 170, 76, 250, "g"], ["a", 58, 260, 58, 180, "r"], ["t", 140, 240, "more L → purer top", 17, "g"]]],
            ["But the reboiler makes only so much vapour. Send more back as reflux, and less comes out as product. More of both needs more steam.",
             [["t", 140, 280, "same steam → less D", 17, "o"], ["t", 140, 306, "more of both → more steam", 17, "r"]]],
        ],
        "summary": "At the top of the column the vapour is condensed; part returns as reflux (L) and the rest leaves as distillate (D). The reflux ratio R = L/D. More reflux washes the heavy component out of the rising vapour, so the top product gets purer, but with the same reboiler steam less distillate comes out. Getting more of both needs more steam.",
    },
    {
        "q": "What happens at minimum reflux?",
        "opts": [
            ["You'd need zero trays", False, "Zero trays? That's a pipe, not a column."],
            ["You'd need an infinite number of trays", True, "Infinite. Correct. Good luck fitting that in the plant."],
            ["You get the best purity", False, "The best purity comes at the most reflux, not the least."],
            ["The column floods", False, "Flooding is about too much vapour or liquid traffic. Different headache."],
        ],
        "title": "Trays vs reflux",
        "beats": [
            ["Plot the trays you need against the reflux ratio.",
             [*axes(40, 64, 330, 290, "reflux ratio", "trays needed")]],
            ["Cut the reflux, and the trays needed shoot up. At minimum reflux, you'd need infinite trays.",
             [["p", "M84,70 Q96,236 200,256 L320,262", "b", 3], ["p", "M80,70 L80,290", "r", 1.5], ["t", 64, 310, "Rmin", 15, "r"],
              ["t", 92, 100, "→ infinite trays", 16, "r"]]],
            ["Push it the other way, to total reflux, and you need the fewest trays, Nmin. But no product comes out.",
             [["p", "M40,268 L330,268", "g", 1.5], ["t", 210, 286, "Nmin at total reflux", 14, "g"]]],
            ["Real columns run at about 1.2 to 1.5 times the minimum. A trade between trays you build and steam you burn.",
             [["p", "M88,200 L88,290 M100,226 L100,290", "o", 2], ["t", 92, 338, "1.2 to 1.5 × Rmin", 20, "o"],
              ["t", 92, 366, "trays vs steam", 17, "k"]]],
        ],
        "summary": "Plotting trays needed against reflux ratio gives a curve that shoots to infinity at minimum reflux and flattens to the minimum number of stages at total reflux, where no product is taken. Practical columns run at about 1.2 to 1.5 times the minimum reflux ratio, trading the number of trays against reboiler steam.",
    },
    {
        "q": "You raise the reboiler steam. Column ΔP shoots up and top purity drops. What's happening?",
        "opts": [
            ["Weeping", False, "Weeping is the opposite: too little vapour. You've got too much."],
            ["Flooding", True, "Flooding. Yes! The column is choking on vapour."],
            ["Dry trays", False, "Dry trays wouldn't push the pressure drop up like that."],
            ["Low reflux", False, "You touched the steam, not the reflux. Look at what changed."],
        ],
        "title": "Flooding",
        "beats": [
            ["Too much vapour holds the liquid up on the trays. It can't get down the downcomers.",
             [*column(40, 70, 70, 260, 5), ["p", "M50,110 L104,110 L104,94 L50,94 Z", "b", 2], ["p", "M46,150 L100,150 L100,132 L46,132 Z", "b", 2],
              ["a", 132, 300, 132, 120, "r"], ["t", 140, 210, "too much vapour", 16, "r"]]],
            ["Liquid piles up, tray on tray, and gets carried up with the vapour. The pressure drop climbs fast.",
             [["p", "M50,190 L104,190 L104,170 L50,170 Z", "b", 2], ["t", 140, 110, "liquid backs up", 16, "b"], ["t", 140, 134, "ΔP shoots up", 16, "r"]]],
            ["That liquid drags heavy component to the top, so the top purity drops.",
             [["t", 140, 262, "heavy carried to top", 16, "o"], ["t", 140, 284, "→ purity drops", 16, "o"]]],
            ["Cut the steam back and let the column settle. Foaming gives the same signs, so check the feed as well.",
             [["k", 20, 352, "g"], ["t", 42, 360, "cut steam, let it settle", 17, "k"], ["t", 42, 386, "foaming? check the feed", 16, "k"]]],
        ],
        "summary": "Too much vapour holds liquid up on the trays so it cannot drain through the downcomers. Liquid backs up tray on tray and is carried upward, the pressure drop rises fast and heavy component reaches the top, so purity falls. Cut the reboiler steam and let the column settle; foaming gives similar signs, so check the feed too.",
    },
    {
        "q": "At very low boil-up, liquid drains straight through the tray holes. What is that called?",
        "opts": [
            ["Flooding", False, "Flooding is too much vapour. You've got too little."],
            ["Weeping", True, "Weeping. The tray is literally crying. Correct!"],
            ["Entrainment", False, "Entrainment carries liquid up. Yours is falling down."],
            ["Foaming", False, "Foam needs vapour to make it. There's hardly any here."],
        ],
        "title": "Weeping",
        "beats": [
            ["A sieve tray has holes. The vapour pushing up through them holds the liquid on the tray.",
             [["p", "M30,140 L330,140", "k", 4], ["p", "M30,124 q40,-6 80,0 t80,0 t80,0 t70,0", "b", 2.5],
              ["a", 80, 190, 80, 148, "r"], ["a", 180, 190, 180, 148, "r"], ["a", 280, 190, 280, 148, "r"], ["t", 30, 214, "vapour holds the liquid up", 16, "r"]]],
            ["Too little vapour, and the liquid drips through the holes instead of crossing the tray.",
             [["c", 120, 158, 3, "b", 2], ["c", 122, 174, 3, "b", 2], ["c", 230, 160, 3, "b", 2], ["c", 232, 178, 3, "b", 2],
              ["t", 30, 244, "too little → liquid drips through", 16, "b"]]],
            ["Vapour and liquid then miss each other, and the tray stops separating well.",
             [["t", 30, 274, "→ efficiency falls", 17, "o"]]],
            ["So every column has a window. Enough vapour to stop weeping, not so much that it floods.",
             [["p", "M30,330 L330,330", "k", 2], ["p", "M100,330 L260,330", "g", 9], ["t", 30, 356, "weeping", 15, "b"],
              ["t", 150, 318, "good", 16, "g"], ["t", 276, 356, "flooding", 15, "r"], ["t", 140, 380, "vapour rate →", 14, "k"]]],
        ],
        "summary": "On a sieve tray the vapour flowing up through the holes holds the liquid on the tray. At too low a vapour rate the liquid drips through the holes instead of crossing the tray. This is weeping, and it cuts tray efficiency. Each column has an operating window: enough vapour to stop weeping, not so much that it floods.",
    },
    {
        "q": "Ethanol and water: why can't plain distillation get past about 95.6 % ethanol by weight?",
        "opts": [
            ["The column is too short", False, "A taller column won't help. You could build it to the moon."],
            ["It forms an azeotrope", True, "Azeotrope! Correct. The mixture boils like a single liquid."],
            ["Ethanol decomposes", False, "Ethanol is fine. It's just being stubborn."],
            ["Water boils first", False, "Water boils at 100. Ethanol goes up first."],
        ],
        "title": "Azeotrope",
        "beats": [
            ["Plot vapour composition against liquid composition. Normally the vapour is richer in the light component.",
             [*axes(40, 64, 320, 300, "liquid x", "vapour y"), ["p", "M40,300 L320,64", "k", 1.5],
              ["p", "M40,300 Q90,120 290,90 Q306,80 320,64", "b", 3], ["t", 56, 96, "vapour richer", 15, "b"], ["a", 96, 104, 112, 146, "b"]]],
            ["At about 95.6 percent ethanol by weight, that's about 89 mole percent, the curve crosses the diagonal. Vapour and liquid are the same. No separation, however many trays you add.",
             [["c", 292, 88, 7, "r", 3], ["t", 200, 220, "curve meets", 16, "r"], ["t", 200, 240, "diagonal: stuck", 16, "r"]]],
            ["That's an azeotrope. It boils at about 78.2 degrees, just below pure ethanol. IPA and water do the same, at about 87 percent.",
             [["t", 20, 336, "azeotrope ~95.6 wt % at ~78.2 °C", 17, "k"], ["t", 20, 360, "IPA–water: ~87 wt %", 16, "k"]]],
            ["To get past it, plants use molecular sieves or add an entrainer. Pressure swing works for some other pairs, like THF and water.",
             [["t", 20, 390, "→ molecular sieves or an entrainer", 16, "g"]]],
        ],
        "summary": "Ethanol and water form an azeotrope at about 95.6 % ethanol by weight, boiling at about 78.2 °C. There the vapour has the same composition as the liquid, so the x-y curve meets the diagonal and more trays cannot separate them further. IPA and water form a similar azeotrope at about 87 % IPA. Molecular sieves or an entrainer get past it; pressure-swing distillation suits azeotropes that shift strongly with pressure, such as THF–water.",
    },
    {
        "q": "Batch distillation: the top temperature starts creeping up. What does it tell you?",
        "opts": [
            ["The condenser is fouled", False, "A fouled condenser shows up in the vent and the pressure first."],
            ["The light component is running out", True, "Yes! The light stuff is nearly gone."],
            ["The steam is too low", False, "Less steam would slow it down, not push the top temperature up."],
            ["The column is flooding", False, "Flooding shows in the pressure drop first. Not this time."],
        ],
        "title": "Watch the top",
        "beats": [
            ["While the light solvent comes over, the top temperature sits flat at its boiling point.",
             [*axes(40, 64, 330, 260, "time", "top temp"), ["p", "M44,220 L150,220", "b", 3], ["t", 54, 210, "light solvent", 15, "b"]]],
            ["As it runs out, heavier stuff reaches the top, and the temperature creeps up.",
             [["p", "M150,220 Q190,218 210,130", "r", 3], ["t", 222, 196, "creeping up!", 16, "r"]]],
            ["That's the moment to change receivers. Take the in-between as a separate cut, and recycle it.",
             [["p", "M210,130 Q216,110 320,108", "k", 3], ["p", "M150,64 L150,260 M216,64 L216,260", "o", 1.5],
              ["t", 152, 80, "mid cut", 15, "o"], ["t", 20, 300, "change receiver, recycle the mid cut", 16, "o"]]],
            ["Or raise the reflux to stretch the clean cut a little longer. Try it in the batch distillation simulator on pharmacheme dot in.",
             [["t", 20, 332, "or more reflux → longer clean cut", 16, "g"], ["t", 20, 380, "pharmacheme.in → batch distillation", 16, "b"]]],
        ],
        "summary": "In batch distillation the top temperature stays at the light component's boiling point while it distils. When it starts creeping up, the light component is running out and heavier material is reaching the top. Change receivers, collect the in-between as a separate mid cut to recycle, or raise the reflux to stretch the clean cut.",
    },
]

if __name__ == '__main__':
    main(globals())
