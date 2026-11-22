"""Whiteboard lesson: drying basics. Run: python3 tools/whiteboard/drying_basics.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, main

SLUG = 'drying-basics'
TITLE = 'Drying basics'
CALC = '/articles/drying-and-dryer-scale-up/'
CALC_LABEL = 'Read the dryer scale-up guide'
ENDS = ['Your product will pass LOD first time.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: dryers. The last step, and the one everyone waits on. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Read the dryer scale-up guide next."
SPOKEN = (('LOD', 'L O D'), ('kcal', 'kilocalories'), ('mbar', 'millibar'), ('°C', ' degrees'))

STEPS = [
    {
        "q": "A wet cake has 20 % LOD (wet basis). What is its moisture on a dry basis?",
        "opts": [
            ["20 %", False, "Same number, different basis. They're not the same."],
            ["16 %", False, "Wrong way round. Dry basis is always the bigger number."],
            ["25 %", True, "25 percent. Spot on."],
            ["80 %", False, "80 is the dry solid. Not the moisture."],
        ],
        "title": "Wet vs dry basis",
        "beats": [
            ["Take 100 kilograms of wet cake. 20 kilograms is solvent, 80 is dry solid.",
             [["p", "M40,80 L140,80 L140,240 L40,240 Z", "k", 3], ["p", "M40,112 L140,112", "k", 2], ["t", 48, 102, "20 kg liquid", 14, "b"],
              ["t", 56, 180, "80 kg solid", 15, "o"]]],
            ["LOD, on a wet basis, divides by the total: 20 over 100 is 20 percent.",
             [["t", 160, 120, "wet basis:", 17, "k"], ["t", 160, 146, "20 ÷ 100 = 20 %", 18, "b"]]],
            ["Dry basis divides by the dry solid only: 20 over 80 is 25 percent.",
             [["t", 160, 190, "dry basis:", 17, "k"], ["t", 160, 216, "20 ÷ 80 = 25 %", 18, "r"]]],
            ["Dryer calculations use dry basis, because the dry solid doesn't change while you dry. Always say which one you mean.",
             [["t", 20, 290, "dryer maths uses dry basis", 18, "g"], ["t", 20, 318, "always say which basis", 18, "g"]]],
        ],
        "summary": "In 100 kg of wet cake at 20 % LOD there are 20 kg of liquid and 80 kg of dry solid. Wet-basis moisture divides by the total (20 ÷ 100 = 20 %); dry-basis moisture divides by the dry solid (20 ÷ 80 = 25 %). Dryer calculations use the dry basis because the dry solid stays constant, so always state which basis is meant.",
    },
    {
        "q": "In the constant-rate period of drying, what controls how fast it dries?",
        "opts": [
            ["Heat and vapour at the surface", True, "Yes! The surface is still wet. It dries like a puddle."],
            ["Moisture moving inside particles", False, "That's the falling-rate period, later on."],
            ["The particle size only", False, "Size matters later. Early on, it's all about the surface."],
            ["Nothing; it's random", False, "Random? Drying follows a very tidy curve."],
        ],
        "title": "Drying curve",
        "beats": [
            ["Plot drying rate against moisture. At first the surface is fully wet, and the rate is steady.",
             [*axes(40, 64, 320, 260, "moisture", "rate"), ["p", "M300,140 L170,140", "b", 3], ["t", 186, 128, "constant rate", 15, "b"]]],
            ["In this part, it dries like a puddle: the rate depends on heat getting in and vapour getting away.",
             [["t", 20, 300, "constant: heat in, vapour out", 17, "b"]]],
            ["Then the surface starts to dry out. The rate falls, because moisture must travel from inside.",
             [["p", "M170,140 Q100,160 60,250", "r", 3], ["t", 60, 180, "falling", 15, "r"], ["t", 20, 326, "falling: moisture from inside", 17, "r"]]],
            ["Heat and vacuum speed up the first part, as long as the cake doesn't crust or melt. In the falling part the product warms up, so keep the jacket below what it can take, and give it time.",
             [["t", 20, 364, "falling part: watch product °C", 17, "g"]]],
        ],
        "summary": "Early in drying the surface is fully wet and evaporates like a puddle, so the rate is constant and set by heat transfer in and vapour removal. When the surface starts to dry, moisture has to move from inside the particles and the rate falls. Heat and vacuum speed up the constant-rate period as long as the cake does not crust or melt; in the falling-rate period the product warms towards the jacket temperature, so limit the jacket to what the product can take and allow time.",
    },
    {
        "q": "Why dry a heat-sensitive product in a vacuum tray dryer?",
        "opts": [
            ["Vacuum heats the product", False, "Vacuum heats nothing. It changes the boiling point."],
            ["Solvent boils cooler", True, "Yes! Same drying, lower temperature."],
            ["It removes the oxygen only", False, "Less oxygen helps, but that's not the main reason."],
            ["Vacuum improves heat transfer", False, "The opposite. Less gas means poorer contact. It's the lower boiling point that helps."],
        ],
        "title": "Why vacuum?",
        "beats": [
            ["Lower the pressure and the boiling point drops.",
             [*axes(40, 64, 320, 230, "pressure", "boils at"), ["p", "M44,220 Q140,150 300,80", "b", 3]]],
            ["Water boils at 100 degrees at atmospheric pressure, about 46 at 100 millibar, and about 33 at 50.",
             [["t", 20, 266, "water: 1013 mbar → 100 °C", 17, "k"], ["t", 20, 290, "100 mbar → ~46 °C", 17, "b"], ["t", 20, 314, "50 mbar → ~33 °C", 17, "b"]]],
            ["So the product dries well below the temperature where it melts, darkens or breaks down.",
             [["t", 20, 350, "dries below its damage limit", 17, "g"]]],
            ["Keep the condenser cold enough to catch the vapour, or the vacuum pump does all the work.",
             [["t", 20, 382, "cold condenser before the pump", 17, "o"]]],
        ],
        "summary": "Lowering the pressure lowers the boiling point: water boils at 100 °C at atmospheric pressure, about 46 °C at 100 mbar and about 33 °C at 50 mbar. A vacuum dryer can therefore remove solvent well below the temperature at which a heat-sensitive product melts, discolours or decomposes. Keep the condenser cold enough to catch the vapour.",
    },
    {
        "q": "Roughly how much heat does it take to evaporate 100 kg of water in a dryer?",
        "opts": [
            ["About 5,700 kcal", False, "Ten times too little. Evaporation is expensive."],
            ["About 57,000 kcal", True, "About 57,000. Latent heat does the heavy lifting."],
            ["About 570,000 kcal", False, "Ten times too much. Count the zeros."],
            ["About 570 kcal", False, "That's for one kilogram, not a hundred."],
        ],
        "title": "Heat to evaporate",
        "beats": [
            ["Most of the heat goes into evaporation, not into warming things up.",
             [["t", 20, 86, "evaporation is the big one", 19, "k"]]],
            ["Water's latent heat at around 50 degrees is about 570 kilocalories per kilogram.",
             [["t", 20, 126, "latent heat ≈ 570 kcal/kg", 20, "b"]]],
            ["100 kilograms times 570 is about 57,000 kilocalories. Plus heat for the solid, the dryer and the losses.",
             [["t", 20, 170, "100 × 570 ≈ 57,000 kcal", 21, "r"], ["t", 20, 200, "+ solid, dryer, losses", 17, "o"]]],
            ["Solvents need far less per kilogram. Methanol about 260, toluene about 85. That's one reason water is the slow one.",
             [["t", 20, 250, "methanol ≈ 260 kcal/kg", 17, "k"], ["t", 20, 276, "toluene ≈ 85 kcal/kg", 17, "k"], ["t", 20, 310, "water is the slow one", 18, "g"]]],
        ],
        "summary": "Most dryer heat goes into evaporation. Water's latent heat at around 50 °C is about 570 kcal/kg, so evaporating 100 kg needs about 57,000 kcal, plus heat for the solid, the dryer and losses. Organic solvents need far less per kilogram (methanol about 260, toluene about 85 kcal/kg), which is why removing water is the slow part.",
    },
    {
        "q": "With a very hot jacket from the start, the product forms a hard crust and stays wet inside. Why?",
        "opts": [
            ["The cake was loaded too thin", False, "Thin cakes dry evenly. Too much heat too early is the problem."],
            ["The surface sealed itself", True, "Correct! Case hardening. The crust traps the moisture."],
            ["The vacuum was too good", False, "Good vacuum isn't the problem. Too much heat is."],
            ["The batch was too small", False, "Batch size doesn't make a crust. Heat does."],
        ],
        "title": "Case hardening",
        "beats": [
            ["Too much heat early dries the outside before moisture inside can get out.",
             [["c", 120, 150, 60, "o", 6], ["c", 120, 150, 50, "b", 2], ["t", 92, 156, "wet core", 16, "b"], ["t", 200, 110, "hard crust", 17, "o"]]],
            ["The dry skin shrinks and closes its pores. Now the inside can barely breathe.",
             [["t", 200, 150, "pores closed", 17, "r"]]],
            ["You get a product that's dry on the surface but fails LOD, or lumps that need milling.",
             [["t", 20, 250, "fails LOD, lumps", 18, "r"]]],
            ["Start with moderate heat, then raise it in steps as the rate falls, watching the product temperature and staying below its safe limit.",
             [["t", 20, 300, "start moderate,", 18, "g"], ["t", 20, 326, "raise in steps, watch product °C", 17, "g"]]],
        ],
        "summary": "If the product is heated hard from the start, its surface dries before inner moisture can escape, forming a crust whose closed pores trap moisture: case hardening. The result is product that is dry outside but fails LOD, or hard lumps. Start with moderate heat and raise it in steps as the drying rate falls, keeping the product temperature below its safe limit.",
    },
    {
        "q": "How do you tell when a batch in a vacuum dryer is nearly dry?",
        "opts": [
            ["A fixed number of hours", False, "Hours alone ignore how wet the batch came in."],
            ["Product temperature rises", True, "Yes! Then confirm with an LOD sample."],
            ["The vacuum gets worse", False, "Vacuum usually gets better as the vapour stops."],
            ["The colour changes", False, "Colour change is more likely damage than dryness."],
        ],
        "title": "End point",
        "beats": [
            ["While solvent is evaporating, the product stays cool, near the boiling point at that vacuum.",
             [*axes(40, 64, 320, 240, "time", "°C"), ["p", "M44,90 L300,90", "r", 1.5], ["t", 230, 84, "jacket", 14, "r"],
              ["p", "M44,200 L170,200", "b", 3], ["t", 60, 192, "product: cool while wet", 14, "b"]]],
            ["When the solvent runs out, there's nothing to soak up the heat. The product temperature climbs.",
             [["p", "M170,200 Q230,196 260,110 L300,100", "o", 3], ["t", 180, 150, "rising → nearly dry", 14, "o"]]],
            ["The vacuum also gets better, and the condenser stops collecting.",
             [["t", 20, 280, "vacuum improves, condensate stops", 16, "k"]]],
            ["Then take a sample and confirm with LOD. Read the dryer scale-up guide on pharmacheme dot in for more.",
             [["t", 20, 320, "confirm with an LOD sample", 18, "g"], ["t", 20, 380, "pharmacheme.in → dryer scale-up", 16, "b"]]],
        ],
        "summary": "While solvent evaporates, the product stays near its boiling point at the dryer vacuum. When the solvent runs out, the product temperature climbs towards the jacket temperature, the vacuum improves and condensate collection stops. These signs show the batch is nearly dry; confirm with an LOD sample.",
    },
]

if __name__ == '__main__':
    main(globals())
