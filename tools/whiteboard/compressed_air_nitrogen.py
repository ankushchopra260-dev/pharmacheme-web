"""Whiteboard lesson: compressed air and nitrogen. Run: python3 tools/whiteboard/compressed_air_nitrogen.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import box, main

SLUG = 'compressed-air-nitrogen'
TITLE = 'Compressed air and nitrogen'
CALC = '/articles/compressed-air-and-nitrogen/'
CALC_LABEL = 'Read the compressed air and nitrogen guide'
ENDS = ['The utilities bill just went down.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: compressed air and nitrogen. Invisible, everywhere, and expensive. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Read the compressed air and nitrogen guide next."
SPOKEN = (('PSA', 'P S A'), ('O₂', 'oxygen'), ('N₂', 'nitrogen'), ('kW', 'kilowatts'))

STEPS = [
    {
        "q": "Of the electricity a compressor uses, roughly how much ends up as useful work at the air tool?",
        "opts": [
            ["About 10 %", True, "About 10 percent. The rest is mostly heat."],
            ["About 50 %", False, "Far too generous. Most of it leaves as heat."],
            ["About 90 %", False, "If only. Compressed air is one of the costliest utilities."],
            ["All of it", False, "No machine is that good, least of all an air compressor."],
        ],
        "title": "Costly air",
        "beats": [
            ["Compressing air makes heat. Most of the motor's power leaves in the cooling water or air.",
             [*box(30, 80, 120, 50, "compressor", "k", 16), ["a", 150, 105, 220, 105, "b"], ["t", 226, 110, "air", 16, "b"], ["a", 90, 130, 90, 180, "r"],
              ["t", 60, 200, "most → heat", 16, "r"]]],
            ["Then leaks, pressure drops and over-pressure waste more. Only about a tenth does useful work.",
             [["t", 20, 252, "≈ 10 % useful work", 22, "g"]]],
            ["So never use compressed air for cooling people, drying floors or blowing dust. A fan or a blower costs far less.",
             [["t", 20, 296, "no blowing, no cooling people", 18, "o"]]],
            ["Fix leaks first. A plant can lose a fifth or more of its air through leaks nobody hears.",
             [["t", 20, 336, "leaks: often 20 %+ of air", 18, "r"]]],
        ],
        "summary": "Compressing air turns most of the motor's power into heat, and leaks, pressure drops and over-pressure waste more, so only about 10 % ends up as useful work. Avoid using compressed air for jobs a fan or blower can do, and fix leaks first, since plants often lose a fifth or more of their air through them.",
    },
    {
        "q": "You lower the compressor discharge pressure by 1 bar. Roughly what power saving?",
        "opts": [
            ["About 1 %", False, "Too small. Each bar costs a lot more than that."],
            ["About 7 %", True, "About 7 percent. Correct!"],
            ["About 30 %", False, "Too much for one bar. Nice dream though."],
            ["None", False, "Lower pressure always takes less power to make."],
        ],
        "title": "Pressure costs power",
        "beats": [
            ["Compression power rises with the pressure ratio. Every extra bar costs.",
             [["t", 20, 86, "higher pressure → more power", 19, "k"]]],
            ["Around the usual 7 bar, each bar less saves roughly 6 to 8 percent.",
             [["t", 20, 128, "−1 bar ≈ −7 % power", 22, "g"]]],
            ["Leaks drop too, because a hole leaks less at lower pressure.",
             [["t", 20, 172, "and leaks shrink", 18, "g"]]],
            ["Go only as low as the most demanding user truly needs, then give any single high user a booster. Don't run the whole plant high for it.",
             [["t", 20, 218, "one high user? → booster", 18, "b"]]],
        ],
        "summary": "Compression power rises with the pressure ratio, so around a typical 7 bar, each 1 bar reduction saves roughly 6 to 8 % of compressor power, and leaks fall too. If one user needs higher pressure, serve it with a local booster rather than running the whole system high.",
    },
    {
        "q": "Why does instrument air need a low dew point?",
        "opts": [
            ["To raise the air pressure", False, "Dew point has nothing to do with pressure delivered."],
            ["So water can't condense", True, "Yes! Wet air means rust, blocked ports and sticking valves."],
            ["To stop oil getting through", False, "Oil is a filter's job. Dew point is about water."],
            ["Dew point doesn't matter", False, "It matters a lot. Ask anyone with a stuck valve."],
        ],
        "title": "Dry air",
        "beats": [
            ["Compressed air holds water vapour. As it cools in the lines, the water condenses.",
             [["p", "M20,120 L340,120 M20,160 L340,160", "k", 3], ["p", "M200,156 L320,156", "b", 4], ["t", 210, 186, "water in the line", 15, "b"]]],
            ["Water rusts pipes, blocks small ports in positioners, and makes valves stick.",
             [["t", 20, 230, "rust, blocked ports, stuck valves", 17, "r"]]],
            ["Dry it to a pressure dew point below the coldest the air will ever see. Instrument air is often dried to about minus 40 degrees.",
             [["t", 20, 272, "dew point below coldest point", 18, "g"], ["t", 20, 298, "(often around −40 °C)", 16, "g"]]],
            ["Check the dryer regularly, and drain the receivers and filters. Their drains fail quietly.",
             [["t", 20, 340, "check dryer, drain receivers", 18, "k"]]],
        ],
        "summary": "Compressed air carries water vapour that condenses as the air cools in the lines, causing rust, blocked positioner ports and sticking valves. Instrument air is dried to a dew point below the coldest temperature it will meet, often around −40 °C. Check the dryer and drain receivers and filters regularly.",
    },
    {
        "q": "You ask a PSA nitrogen plant for 99.99 % purity instead of 99 %. What happens to its output?",
        "opts": [
            ["It goes up", False, "Higher purity takes more air per cubic metre of nitrogen."],
            ["It stays the same", False, "Purity has a big price in output."],
            ["It falls sharply", True, "Correct! Often to around half."],
            ["It stops completely", False, "It still runs, just with much less gas."],
        ],
        "title": "Purity costs",
        "beats": [
            ["A PSA plant holds oxygen back on a sieve bed and lets nitrogen through.",
             [*box(30, 80, 120, 60, "air → PSA", "k", 16), ["a", 150, 110, 220, 110, "b"], ["t", 226, 116, "N₂", 18, "b"]]],
            ["The purer you want the nitrogen, the less of the air comes out as product.",
             [["t", 20, 186, "purer → less output", 20, "r"]]],
            ["Going from 99 to 99.99 percent can cut the output to around half, for the same compressor.",
             [["t", 20, 226, "99 % → 99.99 %: ~half the flow", 18, "r"]]],
            ["Specify what each user really needs, and check the oxygen limit for each use. Blanketing and purging often manage with 98 to 99 percent.",
             [["t", 20, 270, "match purity to the real need", 18, "g"]]],
        ],
        "summary": "A PSA nitrogen generator holds oxygen back on an adsorbent bed and lets nitrogen through. Higher purity means less of the air leaves as product, so raising purity from 99 % to 99.99 % can roughly halve the output from the same compressor. Specify the purity each user really needs; blanketing and purging often manage with 98 to 99 %.",
    },
    {
        "q": "A vessel was purged with nitrogen. Someone has to go inside. What must be checked?",
        "opts": [
            ["That the vessel is cool", False, "Cool helps, but nitrogen can kill at any temperature."],
            ["Oxygen, by test, on a permit", True, "Yes! At least 19.5 percent, tested, on a permit, and watched."],
            ["That the nitrogen valve is shut", False, "Necessary, but not enough on its own."],
            ["Nothing, nitrogen is harmless", False, "Nitrogen can kill in a few breaths with no warning."],
        ],
        "title": "Nitrogen kills quietly",
        "beats": [
            ["Nitrogen has no colour or smell. It pushes out the oxygen, and a few breaths can knock a person out.",
             [*box(80, 80, 160, 140, "vessel: N₂", "b", 16), ["t", 100, 250, "no smell, no warning", 17, "r"]]],
            ["Before entry: isolate and blind the nitrogen and every other line, ventilate with air, and test the atmosphere.",
             [["t", 20, 296, "isolate + blind all lines, ventilate", 17, "k"]]],
            ["Oxygen must be at least 19.5 percent, and flammable and toxic gas readings must be clear, all by a calibrated meter on the entry permit.",
             [["t", 20, 330, "O₂ ≥ 19.5 %, gas test, permit", 18, "g"]]],
            ["Keep a standby person outside, and monitor continuously. Never go in to rescue without breathing apparatus.",
             [["t", 20, 364, "standby person, continuous O₂", 17, "b"], ["t", 20, 388, "no rescue without breathing apparatus", 15, "r"]]],
        ],
        "summary": "Nitrogen is colourless and odourless and displaces oxygen; a few breaths of nitrogen-rich air can cause collapse without warning. Before entry, isolate and blind the nitrogen and every other line, ventilate with air, confirm oxygen of at least 19.5 % and test for flammable and toxic gas with a calibrated meter, recorded on the entry permit. Keep a standby person outside, monitor continuously, and never attempt rescue without breathing apparatus.",
    },
    {
        "q": "Can you use compressed air to pressure-transfer a flammable solvent?",
        "opts": [
            ["Only if a pump isn't available", False, "Even then, air brings 21 percent oxygen into the vapour space. Use nitrogen."],
            ["Only with nitrogen, never air", True, "Correct! Air plus solvent vapour is a fire waiting for a spark."],
            ["Yes, if the air is dry", False, "Dry air still has 21 percent oxygen."],
            ["Yes, at low pressure", False, "Low pressure still makes a flammable vapour space."],
        ],
        "title": "Never air",
        "beats": [
            ["Air brings 21 percent oxygen into the solvent's vapour space. Now it's a flammable mixture.",
             [*box(40, 80, 120, 140, "solvent", "o", 16), ["a", 20, 70, 60, 100, "b"], ["t", 20, 60, "air", 15, "b"], ["t", 180, 140, "flammable mix", 17, "r"]]],
            ["Static from the flow, or any spark, can ignite it.",
             [["t", 180, 166, "+ static spark", 17, "r"]]],
            ["Use nitrogen for pressure transfers and blanketing, and check the vessel's pressure rating.",
             [["t", 20, 262, "use nitrogen, check rating", 19, "g"]]],
            ["Use different couplings for air and nitrogen, so the hoses can't be swapped, and label them too. More in the compressed air and nitrogen guide on pharmacheme dot in.",
             [["t", 20, 300, "different couplings for air and N₂", 17, "k"], ["t", 20, 380, "pharmacheme.in → air and nitrogen", 16, "b"]]],
        ],
        "summary": "Compressed air brings 21 % oxygen into a solvent's vapour space, creating a flammable mixture that static from the flow or any spark can ignite. Use nitrogen for pressure transfers and blanketing, within the vessel's pressure rating, and use different couplings for air and nitrogen hoses, as well as labels, so they cannot be swapped.",
    },
]

if __name__ == '__main__':
    main(globals())
