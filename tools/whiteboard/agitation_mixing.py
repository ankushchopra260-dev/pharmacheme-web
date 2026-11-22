"""Whiteboard lesson: agitation and mixing. Run: python3 tools/whiteboard/agitation_mixing.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import main, reactor

SLUG = 'agitation-mixing'
TITLE = 'Agitation and mixing'
CALC = '/calculators/mixing-scale-up-calculator/'
CALC_LABEL = 'Open the mixing scale-up calculator'
ENDS = ['Your batches will be well mixed.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: agitators. Spinning metal that decides if your batch works. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Now scale up your own vessel in the mixing calculator."
SPOKEN = (('P/V', 'power per volume'), ('N³', 'N cubed'), ('D⁵', 'D to the fifth'), ('rpm', 'R P M'), ('VFD', 'V F D'), ('D^(2/3)', 'D to the two thirds'), ('D^(−2/3)', 'D to the minus two thirds'))


def impeller_pbt(cx, cy):
    """Pitched-blade turbine, side view."""
    return [["p", f"M{cx - 26},{cy - 8} L{cx - 6},{cy + 8} M{cx + 6},{cy - 8} L{cx + 26},{cy + 8}", "k", 4]]


def impeller_rt(cx, cy):
    """Radial disc turbine, side view."""
    return [["p", f"M{cx - 28},{cy} L{cx + 28},{cy}", "k", 2.5], ["p", f"M{cx - 28},{cy - 9} L{cx - 28},{cy + 9} M{cx - 16},{cy - 9} L{cx - 16},{cy + 9} M{cx + 16},{cy - 9} L{cx + 16},{cy + 9} M{cx + 28},{cy - 9} L{cx + 28},{cy + 9}", "k", 4]]


STEPS = [
    {
        "q": "In turbulent flow, you double the agitator speed. What happens to the power draw?",
        "opts": [
            ["It doubles", False, "If only. Power climbs much faster than speed."],
            ["It goes up 4 times", False, "That's speed squared. Power goes one step further."],
            ["It goes up 8 times", True, "8 times! Speed cubed. The motor feels every rpm."],
            ["It stays the same", False, "The motor's ammeter would like a word."],
        ],
        "title": "Power and speed",
        "beats": [
            ["In turbulent flow, power equals the power number, times density, times speed cubed, times diameter to the fifth.",
             [["t", 20, 86, "P = Np × ρ × N³ × D⁵", 24, "b"]]],
            ["Double the speed: two cubed is 8. Eight times the power.",
             [["t", 20, 132, "2 × speed → 2³ = 8 × power", 20, "r"]]],
            ["Double the impeller diameter at the same speed: two to the fifth is 32. Thirty-two times the power.",
             [["t", 20, 172, "2 × diameter → 2⁵ = 32 × power", 20, "r"]]],
            ["So a small speed change can overload the motor or gearbox: 10 percent more speed is a third more power. Check the motor current when you change speed.",
             [["p", "M60,270 L60,220 Q90,200 120,220 L120,270 Z", "k", 3], ["t", 70, 250, "A", 22, "o"], ["t", 140, 236, "check motor current", 17, "o"],
              ["t", 140, 262, "when speed changes", 17, "o"]]],
        ],
        "summary": "In turbulent flow, agitator power P = Np × ρ × N³ × D⁵, where Np is the power number, N the speed and D the impeller diameter. Doubling the speed raises power 2³ = 8 times; doubling the diameter at the same speed raises it 2⁵ = 32 times. Check motor current whenever agitator speed is changed.",
    },
    {
        "q": "A tank with no baffles, agitator at high speed. What forms?",
        "opts": [
            ["A vortex", True, "Vortex! The whole batch just spins like a washing machine."],
            ["Foam", False, "Foam can follow later. First, think about rotation."],
            ["Nothing much", False, "Nothing much? Run it without baffles and watch it swirl."],
            ["A dead zone at the top", False, "The trouble is the whole batch rotating, not just the top."],
        ],
        "title": "Vortex",
        "beats": [
            ["Without baffles, the liquid spins round with the impeller like a solid body. It looks busy, but little mixing happens.",
             [*reactor(110, 70, 130, 200, None, False), ["p", "M50,110 Q110,190 170,110", "b", 3], *impeller_pbt(110, 210),
              ["a", 70, 160, 150, 160, "o"], ["t", 196, 120, "liquid just", 16, "b"], ["t", 196, 140, "goes round", 16, "b"]]],
            ["The surface dips into a vortex. It can pull air or vapour down into the batch.",
             [["t", 196, 186, "vortex pulls", 16, "r"], ["t", 196, 206, "in air", 16, "r"]]],
            ["Baffles on the wall break the rotation and turn it into top-to-bottom flow. Usually four, about a tenth of the tank diameter wide.",
             [["p", "M46,90 L46,250 M174,90 L174,250", "g", 6], ["t", 20, 300, "4 baffles, ~1/10 of tank diameter", 17, "g"]]],
            ["Glass-lined reactors have only one or two baffles, so they vortex more easily. Keep that in mind at high speed.",
             [["t", 20, 340, "glass-lined: 1-2 baffles only", 17, "o"], ["t", 20, 364, "→ watch for vortex", 17, "o"]]],
        ],
        "summary": "Without baffles the liquid rotates with the impeller like a solid body, giving poor top-to-bottom mixing, and the surface forms a vortex that can draw air or vapour into the batch. Wall baffles, usually four about one-tenth of the vessel diameter wide, break the rotation into axial flow. Glass-lined reactors have only one or two baffles and vortex more easily.",
    },
    {
        "q": "You need to keep heavy solids off the bottom. Which impeller is the usual choice?",
        "opts": [
            ["Radial disc turbine", False, "It throws flow sideways, not down to sweep the base."],
            ["Pitched-blade turbine, pumping down", True, "Yes! Axial flow down, sweeping the bottom."],
            ["Anchor", False, "Anchors are for thick batches. In a thin liquid it just swirls, and solids pile up in the middle of the base."],
            ["No agitator, just recirculation", False, "A pump loop alone won't lift a heavy cake."],
        ],
        "title": "Lift the solids",
        "beats": [
            ["A pitched-blade turbine pumps liquid straight down to the base.",
             [*reactor(110, 70, 130, 200, 110), *impeller_pbt(110, 214), ["a", 90, 228, 90, 256, "b"], ["a", 130, 228, 130, 256, "b"]]],
            ["The flow sweeps across the bottom and up the walls, carrying the solids with it.",
             [["a", 70, 262, 52, 230, "b"], ["a", 150, 262, 168, 230, "b"], ["a", 52, 200, 52, 140, "b"], ["a", 168, 200, 168, 140, "b"],
              ["t", 196, 150, "down, across,", 16, "b"], ["t", 196, 172, "up the walls", 16, "b"]]],
            ["Place it low, about a quarter of the tank diameter off the bottom, so it reaches the corners.",
             [["t", 196, 224, "mount low", 16, "g"], ["t", 196, 246, "~1/4 tank dia.", 16, "g"], ["t", 196, 266, "off base", 16, "g"]]],
            ["Radial turbines throw flow sideways. They suit gas dispersion, not solids.",
             [["t", 20, 320, "axial (pitched blade) → solids", 18, "k"], ["t", 20, 348, "radial (disc turbine) → gas", 18, "k"]]],
        ],
        "summary": "A pitched-blade turbine pumping down sends flow to the base, across the bottom and up the walls, lifting solids. Mount it low, about a quarter of the tank diameter off the base, to reach the corners. Radial disc turbines throw flow sideways and are better suited to gas dispersion than solids suspension.",
    },
    {
        "q": "Scale up 10 times in diameter at the same power per volume. What happens to blend time?",
        "opts": [
            ["About 2.2 times longer", False, "That's ten to the one-third. The exponent is two-thirds."],
            ["About 4.6 times longer", True, "Correct! Bigger tanks mix slower, even with the same P/V."],
            ["About 10 times longer", False, "Too pessimistic. It's longer, but not in step with the diameter."],
            ["It stays the same", False, "Same power per volume doesn't buy the same blend time."],
        ],
        "title": "Scale-up",
        "beats": [
            ["Same power per volume means speed falls as the tank grows: speed goes with diameter to the minus two-thirds.",
             [["t", 20, 86, "same P/V → N ∝ D^(−2/3)", 22, "b"]]],
            ["In turbulent flow, blend time goes with one over speed. So it grows with diameter to the two-thirds.",
             [["t", 20, 130, "blend time ∝ 1/N ∝ D^(2/3)", 22, "b"]]],
            ["Ten times the diameter: ten to the two-thirds is about 4.6. A 10 second blend in the lab is about 46 seconds in the plant.",
             [["t", 20, 178, "10^(2/3) ≈ 4.6", 22, "r"], ["t", 20, 210, "lab 10 s → plant ~46 s", 20, "r"]]],
            ["That's why a fast reaction that worked in the flask can give more impurities in the plant. Dose slower, or into a better-mixed spot.",
             [["t", 20, 262, "fast reaction?", 18, "o"], ["t", 20, 288, "dose slower / better spot", 18, "o"]]],
        ],
        "summary": "At constant power per volume, impeller speed scales with diameter to the power −2/3, and in turbulent flow blend time scales with 1/speed, so it grows with diameter to the power 2/3. Ten times the diameter gives about 4.6 times the blend time: a 10 s lab blend becomes about 46 s in the plant. Fast reactions may give more impurities on scale-up unless dosing is slower or into a better-mixed spot.",
    },
    {
        "q": "A fast reaction where local excess makes impurities. Where should the reagent go in?",
        "opts": [
            ["On the surface near the wall", False, "The wall is the sleepiest spot in the vessel. Worst choice."],
            ["Below the surface, near the impeller", True, "Yes! Into the busiest spot, where it spreads fastest."],
            ["Anywhere, mixing sorts it out", False, "For a fast reaction, the first few seconds decide it."],
            ["Dropped in from the manway", False, "From the manway? That's not dosing, that's hoping."],
        ],
        "title": "Dosing point",
        "beats": [
            ["Near the wall at the surface, flow is slow. The reagent sits in a rich patch and reacts there.",
             [*reactor(110, 70, 130, 200, 110), *impeller_pbt(110, 214), ["a", 170, 60, 160, 108, "r"], ["x", 160, 120, 8, "r"],
              ["t", 196, 110, "surface, wall: slow", 16, "r"]]],
            ["A rich patch means local excess. Side reactions get their chance.",
             [["t", 196, 136, "→ local excess", 16, "r"]]],
            ["A dip pipe that ends near the impeller puts the reagent straight into the most turbulent zone.",
             [["p", "M140,60 L140,196", "g", 3], ["k", 150, 186, "g"], ["t", 196, 200, "near impeller: fast", 16, "g"]]],
            ["Dose only with the agitator running, fit the dip pipe with a siphon break, and dose slowly enough that each drop is mixed before the next one arrives. Try your numbers in the mixing scale-up calculator on pharmacheme dot in.",
             [["t", 20, 310, "sub-surface, near impeller,", 18, "g"], ["t", 20, 336, "and not too fast", 18, "g"], ["t", 20, 380, "pharmacheme.in → mixing scale-up", 16, "b"]]],
        ],
        "summary": "For a fast reaction where local excess gives impurities, dose below the surface near the impeller, where turbulence spreads the reagent quickly. Dosing onto the surface near the wall leaves a rich patch in slow flow, giving side reactions a chance. Dose only with the agitator running and proven, fit the dip pipe with a siphon break so the batch cannot suck back, and dose slowly enough that each addition is mixed before the next arrives.",
    },
    {
        "q": "Gas is fed through a ring sparger under the impeller. Which impeller handles the most gas?",
        "opts": [
            ["Radial disc turbine", True, "Yes! The disc turbine chops the gas into fine bubbles."],
            ["Pitched-blade turbine, pumping down", False, "It floods early with gas: the bubbles just pass through."],
            ["Anchor", False, "An anchor barely touches the gas. Bubbles stroll straight up."],
            ["Marine propeller", False, "Propellers are for blending thin liquids, not gas."],
        ],
        "title": "Gas dispersion",
        "beats": [
            ["Gas rises from the sparger. The impeller has to break it into small bubbles and spread them out.",
             [*reactor(110, 70, 130, 200, 100), ["p", "M84,250 L136,250", "o", 3], ["c", 96, 236, 3, "o", 2], ["c", 112, 232, 3, "o", 2], ["c", 126, 238, 3, "o", 2],
              ["t", 196, 252, "sparger", 16, "o"]]],
            ["A radial disc turbine throws gas and liquid out to the wall in a strong shear zone. Small bubbles, big surface area.",
             [*impeller_rt(110, 216), ["a", 140, 216, 168, 216, "b"], ["a", 80, 216, 52, 216, "b"], ["t", 196, 210, "radial: fine bubbles", 16, "b"]]],
            ["Too much gas and the impeller floods: it spins in its own gas pocket and the gas goes straight up.",
             [["t", 20, 312, "too much gas → flooding", 18, "r"], ["t", 20, 338, "big bubbles round the shaft", 16, "r"]]],
            ["Power always dips when gas comes on. Flooding shows as big bubbles boiling up round the shaft, and power falling further as gas rises. Cut the gas, or raise the speed if the motor has margin.",
             [["t", 20, 376, "fix: less gas, or more speed", 17, "g"]]],
        ],
        "summary": "With gas from a sparger under the impeller, a radial disc turbine handles the most gas: it throws gas and liquid outward through a high-shear zone, making small bubbles. Pitched-blade turbines flood at lower gas rates. If the gas rate is too high for the speed, the impeller floods, spinning in a gas pocket while gas rises straight through; large bubbles erupting around the shaft, with power falling further as gas increases, are the signs. Reduce gas, or raise speed if the motor has margin.",
    },
]

if __name__ == '__main__':
    main(globals())
