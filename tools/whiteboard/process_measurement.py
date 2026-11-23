"""Whiteboard lesson: process measurement. Run: python3 tools/whiteboard/process_measurement.py [--no-audio]
Drawing items and voice setup: see wblib.py."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from wblib import axes, main, reactor

SLUG = 'process-measurement'
TITLE = 'Flow, level and pressure measurement'
CALC = '/articles/instrumentation-basics/'
CALC_LABEL = 'Read the instrumentation basics guide'
ENDS = ['The instrument team wants your number.', 'Not bad. Bubbles is watching.', 'Bubbles wins this round.']
INTRO = "Hi, I'm Bubbles. Today: plant instruments. If the reading is wrong, everything after it is wrong too. Six questions. Ready?"
OUTRO_WEB = "That's the lesson. Read the instrumentation basics guide next."
SPOKEN = (('DP', 'D P'), ('ΔP', 'D P'), ('ρg', 'rho g'), ('√', 'root'))

STEPS = [
    {
        "q": "A DP flowmeter's pressure drop reads 25 % of its range. What is the flow, as % of maximum?",
        "opts": [
            ["25 %", False, "Flow isn't proportional to the DP. It goes with the square root."],
            ["50 %", True, "50 percent. Square root of a quarter. Correct!"],
            ["6 %", False, "That's squaring it. Go the other way: square root."],
            ["75 %", False, "Not quite. Take the square root of 0.25."],
        ],
        "title": "Square-root flow",
        "beats": [
            ["An orifice or venturi makes a pressure drop that grows with flow squared.",
             [["p", "M20,110 L340,110 M20,170 L340,170", "k", 3], ["p", "M170,110 L170,130 M170,170 L170,150", "k", 4], ["t", 140, 96, "orifice", 15, "k"],
              ["t", 20, 210, "ΔP ∝ flow²", 22, "b"]]],
            ["So flow goes with the square root of the DP. A quarter of the DP is half the flow.",
             [["t", 20, 252, "flow ∝ √ΔP", 22, "b"], ["t", 20, 286, "√0.25 = 0.5 → 50 % flow", 20, "r"]]],
            ["Modern transmitters do the square root for you. Check whether yours is set to linear or square root.",
             [["t", 20, 330, "check: square root on or off?", 18, "o"]]],
            ["If it's done twice, or not at all, every reading is wrong.",
             [["t", 20, 362, "twice or never → wrong flow", 18, "r"]]],
        ],
        "summary": "An orifice or venturi produces a pressure drop proportional to flow squared, so flow goes with the square root of the DP: 25 % of DP range is √0.25 = 50 % of maximum flow. Check whether the square root is applied in the transmitter or the control system; applying it twice, or not at all, makes every reading wrong.",
    },
    {
        "q": "Why does an orifice flowmeter read poorly at low flow?",
        "opts": [
            ["The orifice blocks at low flow", False, "Blockage is possible, but it isn't the main reason."],
            ["The DP signal gets tiny", True, "Yes! At 10 percent flow the DP is only 1 percent."],
            ["Low flow is always laminar", False, "Not always. The real issue is the signal size."],
            ["The transmitter switches off", False, "It stays on. The signal just gets lost in the noise."],
        ],
        "title": "Turndown",
        "beats": [
            ["Because DP goes with flow squared, it falls away fast at low flow.",
             [*axes(40, 64, 320, 250, "flow %", "DP %"), ["p", "M44,246 Q190,246 310,74", "b", 3]]],
            ["At 10 percent flow, the DP is only 1 percent of range. Small errors become big flow errors.",
             [["p", "M71,246 L71,236", "r", 3], ["t", 60, 230, "10 % → 1 %", 15, "r"], ["t", 20, 290, "10 % flow → 1 % DP", 20, "r"]]],
            ["So a DP meter is good over about a 4 to 1 flow range. Below a quarter of maximum, trust it less.",
             [["t", 20, 330, "good turndown ~4:1", 19, "g"]]],
            ["For wide ranges use two transmitters, or a different meter: a mass flowmeter, or a magnetic one for conductive liquids like water.",
             [["t", 20, 366, "wide range → other meter type", 18, "k"]]],
        ],
        "summary": "Because DP goes with flow squared, it falls away quickly at low flow: at 10 % flow the DP is only 1 % of range, so small errors become large flow errors. An orifice meter is typically good over about a 4:1 flow range; for wider ranges use two transmitters or a different meter type, such as a mass flowmeter, or a magnetic flowmeter for conductive liquids like water.",
    },
    {
        "q": "DP level set up for water, but the tank holds toluene (0.87). Real level 2 metres. Reading?",
        "opts": [
            ["2 m", False, "Only if the liquid matches the calibration. It doesn't."],
            ["About 1.74 m", True, "Right! Lighter liquid, less DP, lower reading."],
            ["About 2.3 m", False, "Toluene is lighter than water, so the DP is smaller, not bigger."],
            ["It can't read toluene at all", False, "It reads, just wrongly unless you correct the density."],
        ],
        "title": "Density and level",
        "beats": [
            ["A DP level transmitter measures the weight of the liquid column: density times g times height.",
             [["p", "M60,80 L60,260 L180,260 L180,80", "k", 3], ["p", "M63,140 L177,140", "b", 2.5], ["dim", 200, 141, 259, "b"], ["t", 210, 206, "2 m", 16, "b"],
              ["t", 20, 300, "ΔP = ρ × g × h", 21, "b"]]],
            ["Set up for water, it treats every bit of DP as water. Toluene is only 0.87 times as heavy as water.",
             [["t", 20, 336, "toluene 0.87 → less ΔP", 18, "o"]]],
            ["So it reads 0.87 times 2: about 1.74 metres. Real level is higher than shown.",
             [["t", 20, 368, "reads 0.87 × 2 ≈ 1.74 m (low!)", 18, "r"]]],
            ["Always set the actual density, and remember it changes with temperature and with what's in the tank.",
             [["t", 220, 120, "set the real", 15, "g"], ["t", 220, 140, "density", 15, "g"]]],
        ],
        "summary": "A DP level transmitter measures the hydrostatic pressure ρ × g × h. If it is set up for water but the tank holds toluene (relative density 0.87), the pressure is only 0.87 times that of water and a real 2 m level reads about 1.74 m, so the tank is fuller than shown. Set the actual density, remembering it changes with temperature and composition.",
    },
    {
        "q": "Why is a mass flowmeter often chosen for dosing solvents and reagents?",
        "opts": [
            ["It is the cheapest meter", False, "Far from it. You pay for what it does."],
            ["It reads mass directly", True, "Correct! Recipes are in kilograms, and so is the meter."],
            ["It needs no straight pipe and no power", False, "Little straight pipe, true. But it needs power."],
            ["It works only on water", False, "It works on almost any liquid. That's the point."],
        ],
        "title": "Mass flow",
        "beats": [
            ["Most meters measure volume or velocity. To get kilograms you need the density, and density moves with temperature.",
             [["t", 20, 86, "volume meter × density = mass", 18, "k"], ["t", 20, 112, "density changes with temperature", 16, "o"]]],
            ["A Coriolis mass flowmeter vibrates its tubes, and the flow twists them. The twist is proportional to mass flow.",
             [["p", "M40,180 Q100,140 160,180 Q220,220 280,180", "b", 3], ["t", 60, 230, "twist ∝ mass flow", 18, "b"]]],
            ["So it reads kilograms directly, and gives density as a bonus. Ideal for dosing to a recipe.",
             [["t", 20, 276, "reads kg directly + density", 18, "g"]]],
            ["Keep it full of liquid. Gas bubbles or a part-full tube spoil the reading.",
             [["t", 20, 316, "keep it full: no gas bubbles", 18, "r"]]],
        ],
        "summary": "Most flowmeters measure volume or velocity, so converting to kilograms needs a density that changes with temperature. A mass flowmeter vibrates its tubes, and the flow twists them in proportion to mass flow, so it reads mass directly and gives density too, which suits dosing to a recipe. Keep it full of liquid; gas bubbles spoil the reading.",
    },
    {
        "q": "What should sit between a steam line and its pressure gauge?",
        "opts": [
            ["Nothing; mount it straight on", False, "Straight on, live steam cooks the gauge."],
            ["A siphon (pigtail)", True, "Yes! The siphon fills with water and keeps the steam off."],
            ["A strainer to catch scale", False, "A strainer won't stop the heat."],
            ["A check valve", False, "A check valve would trap pressure and make the gauge lie."],
        ],
        "title": "Gauge siphon",
        "beats": [
            ["Live steam would overheat the gauge's mechanism and ruin it.",
             [["p", "M20,250 L340,250", "r", 6], ["t", 20, 238, "steam", 15, "r"]]],
            ["A siphon, a coil or U of pipe, fills with condensate. The water passes pressure but keeps the heat away.",
             [["p", "M180,250 L180,220 Q150,200 180,180 Q210,160 180,140 L180,120", "b", 3], ["c", 180, 100, 18, "k", 3], ["t", 220, 104, "gauge", 15, "k"],
              ["t", 220, 180, "siphon: water", 15, "b"], ["t", 220, 200, "inside", 15, "b"]]],
            ["Add an isolation valve, so the gauge can be changed without stopping the line. Fill the siphon with water before you first open it.",
             [["v", 180, 132], ["t", 20, 300, "isolation valve for changing it", 17, "g"]]],
            ["On pulsing services, a snubber steadies the needle. And pick a range so normal pressure sits mid-scale.",
             [["t", 20, 336, "pulsing → snubber", 17, "k"], ["t", 20, 362, "normal pressure ≈ mid-scale", 17, "k"]]],
        ],
        "summary": "Live steam would overheat and ruin a pressure gauge, so a siphon (a coil or U of pipe) is fitted; it fills with condensate that passes pressure but keeps heat away. Add an isolation valve so the gauge can be changed in service, use a snubber on pulsing services, and choose a range that puts normal pressure near mid-scale.",
    },
    {
        "q": "A reactor temperature reads low and lags during heating. What is a common cause?",
        "opts": [
            ["The steam is too hot", False, "Hotter steam would make the batch read higher, not lag."],
            ["Probe not deep enough", True, "Yes! Part-dipped, it reads the vapour space and the nozzle."],
            ["The agitator is too fast", False, "Good mixing helps the probe, not hurts it."],
            ["Digital displays always lag", False, "The display is quick. The probe is the slow part."],
        ],
        "title": "Probe in the liquid",
        "beats": [
            ["The probe sits in a thermowell. The thermowell must sit well under the liquid at your lowest working level.",
             [*reactor(130, 70, 150, 220, 210), ["p", "M190,40 L190,218", "k", 5], ["t", 210, 130, "thermowell", 15, "k"], ["t", 222, 196, "too short!", 15, "r"]]],
            ["If it barely dips in, it reads partly the vapour space and the cooler nozzle. Low and slow.",
             [["t", 20, 326, "part-dipped → low, slow reading", 17, "r"]]],
            ["Air gaps inside the well, or a probe not pushed to the bottom, add more lag.",
             [["t", 20, 354, "probe to the bottom of the well", 17, "o"]]],
            ["Check the well length against the minimum batch level. More in the instrumentation basics guide on pharmacheme dot in.",
             [["t", 20, 386, "pharmacheme.in → instrumentation", 16, "b"]]],
        ],
        "summary": "A temperature probe sits in a thermowell that must be well under the liquid at the lowest working level. If it barely dips in, it partly senses the vapour space and the cooler nozzle and reads low and slowly; air gaps or a probe not pushed to the bottom of the well add lag. Check well length against the minimum batch level.",
    },
]

if __name__ == '__main__':
    main(globals())
