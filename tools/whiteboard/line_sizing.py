"""Whiteboard lesson: line sizing and pressure drop. Run: python3 tools/whiteboard/line_sizing.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, main

SLUG = 'line-sizing-pressure-drop'
TITLE = 'Line sizing and pressure drop'
CALC = '/calculators/pipe-pressure-drop/'
CALC_LABEL = 'Open the pipe pressure drop calculator'
ENDS = ['Pipes everywhere just relaxed.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: pipes. Pick the wrong size and you pay for it every day. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Now size your own line in the pipe pressure drop calculator."
SPOKEN = (('ΔP', 'pressure drop'), ('m/s', 'metres per second'), ('ρv²', 'rho v squared'), ('D⁵', 'D to the fifth'), ('D²', 'D squared'),
          ('1/D⁵', 'one over D to the fifth'), ('ρ', 'rho'))

STEPS = [
    {
        "q": "Same flow, but the pipe diameter is halved. What happens to the velocity?",
        "opts": [
            ["It doubles", False, "Doubles? You forgot the area is a circle. Square it."],
            ["It goes up 4 times", True, "4 times. Area goes with diameter squared. Correct!"],
            ["It halves", False, "Halves? Same flow through a smaller hole goes faster, not slower."],
            ["It stays the same", False, "The same flow has to squeeze through a quarter of the area."],
        ],
        "title": "Velocity",
        "beats": [
            ["Velocity is flow divided by the pipe's cross-section area.",
             [["t", 20, 86, "v = Q ÷ area", 24, "b"]]],
            ["Area goes with diameter squared. Half the diameter, a quarter of the area.",
             [["c", 90, 170, 40, "k", 3], ["c", 240, 170, 20, "k", 3], ["t", 60, 236, "D", 18, "k"], ["t", 222, 236, "D/2", 18, "k"],
              ["t", 196, 274, "area ÷ 4", 18, "r"]]],
            ["So the same flow through half the diameter moves four times faster.",
             [["t", 20, 316, "half D → 4 × velocity", 20, "r"]]],
            ["Handy rule for water: one cubic metre an hour in a 25 millimetre bore pipe is a little over half a metre per second.",
             [["t", 20, 360, "1 m³/h in 25 mm ≈ 0.57 m/s", 18, "g"]]],
        ],
        "summary": "Velocity is flow divided by cross-section area, and area goes with diameter squared. Halving the diameter quarters the area, so the same flow moves four times faster. For reference, 1 m³/h of water in a 25 mm bore pipe flows at about 0.57 m/s.",
    },
    {
        "q": "Same flow, diameter halved, turbulent flow. Roughly what happens to the pressure drop?",
        "opts": [
            ["It doubles", False, "If only. Pressure drop is far more sensitive than that."],
            ["It goes up 4 times", False, "That's just the velocity. Friction gets worse faster."],
            ["It goes up about 30 times", True, "About 30 times! Diameter to the fifth. Painful, right?"],
            ["It goes up 100 times", False, "Too much. It's bad, but not quite that bad."],
        ],
        "title": "The fifth power",
        "beats": [
            ["Friction loss goes with length over diameter, times velocity squared.",
             [["t", 20, 86, "ΔP ∝ (L/D) × ρv²", 22, "b"]]],
            ["Velocity goes with one over D squared, so v squared goes with one over D to the fourth. Then one more D from L over D.",
             [["t", 20, 128, "v ∝ 1/D²  →  v² ∝ 1/D⁴", 19, "k"], ["t", 20, 158, "× 1/D  →  ΔP ∝ 1/D⁵", 19, "r"]]],
            ["Two to the fifth is 32. In steel pipe the friction factor rises a little too, so call it 30 times or a bit more.",
             [["t", 20, 204, "2⁵ = 32 → ~30 × ΔP", 22, "r"]]],
            ["Going one pipe size up can cut pressure drop by more than half. Worth checking before you buy a bigger pump.",
             [*axes(40, 236, 320, 360, "diameter", "ΔP"), ["p", "M50,244 Q80,340 310,352", "o", 3], ["t", 150, 300, "one size up → much less ΔP", 15, "o"]]],
        ],
        "summary": "In turbulent flow the friction pressure drop goes with (L/D) × ρv². Velocity goes with 1/D², so v² goes with 1/D⁴, and with the extra 1/D the pressure drop goes roughly with 1/D⁵. Halving the diameter raises it about 2⁵ = 32 times (slightly more in steel pipe, as the friction factor also rises). One pipe size up can cut pressure drop by more than half.",
    },
    {
        "q": "Typical design velocity for a water line on a pump discharge?",
        "opts": [
            ["About 0.1 m/s", False, "0.1? That pipe would be the size of a culvert."],
            ["About 1.5 to 3 m/s", True, "Yes! 1.5 to 3 metres per second."],
            ["About 10 m/s", False, "10 metres per second of water? Erosion and hammer, here we come."],
            ["About 30 m/s", False, "30 is for steam. Water would shake the pipe rack apart."],
        ],
        "title": "Rule-of-thumb speeds",
        "beats": [
            ["Most plants size lines on velocity first, then check the pressure drop.",
             [["t", 20, 86, "size on velocity, check ΔP", 19, "k"]]],
            ["Liquid on a pump discharge: about 1.5 to 3 metres per second.",
             [["t", 20, 132, "pump discharge  1.5-3 m/s", 18, "b"]]],
            ["Pump suction: slower, about 0.6 to 1.5, to protect the NPSH.",
             [["t", 20, 166, "pump suction   0.6-1.5 m/s", 18, "g"]]],
            ["Gravity lines run even slower. Saturated steam, being light, runs at 20 to 40 metres per second.",
             [["t", 20, 200, "gravity flow  < 1 m/s", 18, "o"], ["t", 20, 234, "saturated steam  20-40 m/s", 18, "r"],
              ["t", 20, 300, "then always check the ΔP", 18, "k"]]],
        ],
        "summary": "Lines are usually sized on a typical velocity and then checked for pressure drop. Rough guides: liquid on a pump discharge about 1.5 to 3 m/s, pump suction about 0.6 to 1.5 m/s to protect NPSH, gravity lines below about 1 m/s, and saturated steam about 20 to 40 m/s.",
    },
    {
        "q": "Why is a pump suction line usually one size bigger than the discharge?",
        "opts": [
            ["It looks better", False, "Looks? The pump doesn't care what you think of the piping."],
            ["Less friction, more NPSH", True, "Yes! Every bit of suction friction comes out of NPSH."],
            ["The suction has higher pressure", False, "Suction is the low-pressure side. That's the whole point."],
            ["It's cheaper", False, "Bigger pipe costs more, not less. There's a better reason."],
        ],
        "title": "Suction side",
        "beats": [
            ["Suction friction is a withdrawal from the NPSH available.",
             [["p", "M30,140 L130,140", "k", 7], ["c", 160, 140, 24, "k", 3], ["p", "M160,116 L160,80 L320,80", "k", 4],
              ["t", 30, 120, "suction: big, short", 15, "g"], ["t", 196, 70, "discharge", 15, "k"]]],
            ["A bigger, shorter suction line means slower liquid and less friction, so more NPSH is left at the impeller eye.",
             [["t", 20, 210, "bigger → slower → less friction", 18, "g"], ["t", 20, 238, "→ more NPSH at the eye", 18, "g"]]],
            ["Use an eccentric reducer at the pump, flat side on top, so no vapour pocket forms.",
             [["p", "M60,300 L160,300 L160,322 L130,340 L60,340", "k", 3], ["t", 176, 318, "eccentric reducer,", 16, "b"], ["t", 176, 340, "flat on top", 16, "b"]]],
            ["And keep elbows away from the suction nozzle, so the flow arrives smooth.",
             [["t", 20, 384, "no elbow right at the nozzle", 17, "o"]]],
        ],
        "summary": "Suction friction reduces NPSH available, so pump suction lines are kept short and usually one size larger than the discharge, with lower velocity. Use an eccentric reducer with the flat side on top at the pump so no vapour pocket forms, and avoid elbows right at the suction nozzle.",
    },
    {
        "q": "Steam runs at 25 m/s, water at only 2 m/s. Why can steam go so much faster?",
        "opts": [
            ["Steam pipes are stronger", False, "Same steel, same schedule. Strength isn't the reason."],
            ["Steam is much less dense", True, "Right! Pressure drop goes with density times v squared."],
            ["Steam has no friction", False, "No friction? Steam lines would love that. Not true."],
            ["Steam lines are always shorter", False, "Steam headers run all over the plant. Not short."],
        ],
        "title": "Density matters",
        "beats": [
            ["Pressure drop goes with density times velocity squared.",
             [["t", 20, 86, "ΔP ∝ ρv²", 24, "b"]]],
            ["Water is about 1000 kilograms per cubic metre. Steam at about 7 bar gauge is around 4.",
             [["t", 20, 132, "water ρ ≈ 1000 kg/m³", 18, "k"], ["t", 20, 160, "steam at ~7 barg ρ ≈ 4 kg/m³", 18, "k"]]],
            ["So steam at 25 has a rho v squared of about 2500. Water at 2 is about 4000. Similar, even though steam is twelve times faster.",
             [["t", 20, 206, "steam: 4 × 25² ≈ 2500", 18, "r"], ["t", 20, 234, "water: 1000 × 2² = 4000", 18, "b"]]],
            ["Too fast is still bad for steam: noise, erosion and wet steam hitting bends. Stay in the normal range.",
             [["t", 20, 290, "too fast: noise, erosion", 17, "o"]]],
        ],
        "summary": "Pressure drop goes with density × velocity squared. Water is about 1000 kg/m³ while steam at about 7 barg is around 4 kg/m³, so steam at 25 m/s has ρv² of about 2500, similar to water at 2 m/s (about 4000). Steam can therefore run much faster for a similar pressure drop, though too high a velocity causes noise and erosion.",
    },
    {
        "q": "A quick-closing valve stops water flowing at 1 m/s in a long line. What happens?",
        "opts": [
            ["Nothing; liquids are incompressible", False, "Nearly incompressible, so the pressure has nowhere to go but up."],
            ["A sharp pressure spike", True, "Yes! Water hammer. Bang."],
            ["The pump speeds up", False, "The pump doesn't speed up. The pipe takes the hit."],
            ["The line empties", False, "Empties? The liquid slams to a stop, it doesn't vanish."],
        ],
        "title": "Water hammer",
        "beats": [
            ["Stop a long column of moving water suddenly, and its momentum turns into pressure.",
             [["p", "M20,120 L300,120 M20,150 L300,150", "k", 3], ["v", 312, 135], ["a", 60, 135, 140, 135, "b"], ["t", 40, 100, "moving water", 15, "b"],
              ["x", 312, 135, 12, "r"], ["t", 250, 180, "slammed shut", 15, "r"]]],
            ["The rise is density times wave speed times the change in velocity. For water, about 13 bar for every metre per second stopped.",
             [["t", 20, 222, "ΔP = ρ × wave speed × Δv", 18, "b"], ["t", 20, 252, "water: ~13 bar per 1 m/s", 20, "r"]]],
            ["That's on top of the normal pressure, and it can burst gaskets and jump pipes off supports.",
             [["t", 20, 290, "→ gaskets, supports, bang", 17, "r"]]],
            ["Close valves slowly on long liquid lines, or check the surge if a valve must shut fast. Check your own line in the pipe pressure drop calculator on pharmacheme dot in.",
             [["t", 20, 330, "close valves slowly", 18, "g"], ["t", 20, 380, "pharmacheme.in → pipe pressure drop", 16, "b"]]],
        ],
        "summary": "Suddenly stopping a long column of moving liquid converts its momentum into a pressure surge: water hammer. The rise is about density × pressure-wave speed × change in velocity, roughly 13 bar for each 1 m/s of water stopped in a steel line, on top of the normal pressure. It can burst gaskets and jump pipes off supports, so close valves slowly on long liquid lines, or check the surge where a valve must shut fast.",
    },
]

if __name__ == '__main__':
    main(globals())
