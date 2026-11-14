#!/usr/bin/env python3
"""Builds process-modelling/batch-mass-balance-flowsheet/index.html (the tool itself is assets/js/batch-flowsheet.js)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
url = 'https://www.pharmacheme.in/process-modelling/batch-mass-balance-flowsheet/'
title = 'Batch Mass Balance and Block Flow Diagram Tool'
seo = 'Batch Mass Balance and Block Flow Diagram Tool | PharmaChemE'
desc = 'Free batch mass balance tool: enter charges as in the lab procedure (g, mL, V, eq), scale to plant and get a block flow diagram, stream table and yield.'
assert len(seo) <= 62 and len(desc) <= 160, (len(seo), len(desc))
faq = [
    ('How do you do a mass balance for a batch process?', 'List every step in order with what is charged in it. For each step, work out what leaves: the layer cut to waste, the distillate, the mother liquor, the dryer condensate. Whatever does not leave goes on to the next step. Over the whole batch, everything charged must equal the product plus all the other streams; if it does not, a reaction is unbalanced or a stream has been missed.'),
    ('How do you scale a lab procedure to a plant batch?', 'Divide the plant quantity of the key raw material by its quantity in the procedure. That scale factor multiplies every charge. Charges written as volumes (V, mL per g of key material) are converted with the density, and mole equivalents with the molar masses.'),
    ('What is process mass intensity (PMI)?', 'The total mass of everything charged, including solvents, water and reagents, divided by the mass of product. It is the usual green chemistry measure in pharmaceuticals. Typical API steps run from about 10 to well over 100 kg per kg.'),
    ('What is the E-factor?', 'The mass of waste per kg of product: total charged minus product, divided by product. It equals PMI minus one. Counting recovered solvent as not wasted gives a lower, second figure.'),
    ('What does "volumes" (V) mean in a procedure?', 'Millilitres of liquid per gram of key starting material (or litres per kg). 10 V of toluene for 100 g of starting material is 1,000 mL, which at 0.867 g/mL is 867 g.'),
    ('How is the adiabatic temperature rise worked out?', 'Heat released = −ΔH (kcal/mol) × moles reacted. Divided by the mass in the vessel times its heat capacity, it gives the temperature rise if no heat were removed. Above about 50 °C, loss of cooling can cause a runaway, so a hazard study is needed.')]
sd = {"@context": "https://schema.org", "@graph": [
    {"@type": "WebApplication", "name": title, "description": desc, "url": url, "applicationCategory": "EngineeringApplication", "operatingSystem": "Any (runs in a web browser)", "isAccessibleForFree": True,
     "offers": {"@type": "Offer", "price": "0", "priceCurrency": "INR"},
     "author": {"@type": "Person", "@id": "https://www.pharmacheme.in/about/#ankush-chopra", "name": "Ankush Chopra", "url": "https://www.pharmacheme.in/about/"},
     "publisher": {"@type": "Organization", "@id": "https://www.pharmacheme.in/#organization", "name": "PharmaChemE", "url": "https://www.pharmacheme.in/"}},
    {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}]}
fm = '---\nlayout: default\ntitle: "%s"\nseo_title: "%s"\ndescription: "%s"\nstructured_data: |\n%s\nbreadcrumbs:\n  - label: "Process Modelling"\n    url: /process-modelling/\n  - label: "Batch Mass Balance and Flowsheet"\n    url: /process-modelling/batch-mass-balance-flowsheet/\nlast_modified_at: 2026-11-14\n---\n' % (
    title, seo, desc, '\n'.join('  ' + l for l in json.dumps(sd, indent=2, ensure_ascii=False).split('\n')))
faqh = ''.join(f'<h3>{q}</h3><p>{a}</p>' for q, a in faq)
body = '''<link rel="stylesheet" href="{{ '/assets/css/batch-flowsheet.css' | relative_url }}?v={{ site.time | date: '%s' }}">
<div class="container ut-head">
  <h1>Batch mass balance and block flow diagram</h1>
  <p>Enter a batch process step by step, with the charges written the way the lab procedure gives them: grams, millilitres, volumes or mole equivalents. The tool scales them to your plant batch and follows every material through reactions, layer cuts, distillation, crystallisation, filtration and drying. You get a block flow diagram, a stream table, the yield, process mass intensity, and where the effluent and solvents go. Your flowsheet is kept in this browser only; nothing is uploaded.</p>
</div>
<div class="container"><div id="bfd-app"><noscript><p>This tool needs JavaScript.</p></noscript></div></div>
<div class="container article-body" style="margin-top:28px;">
  <h2>How each step is modelled</h2>
  <ul>
    <li><b>Charge / add:</b> materials go into the vessel. A gas that does not react leaves to the scrubber.</li>
    <li><b>React:</b> the first reactant is converted by the percentage you give; the others are used in proportion to their coefficients, and if one runs out it limits the reaction. Products are formed from the molar masses, so the reaction must balance by mass (the tool checks). With a heat of reaction it gives the heat released and the adiabatic temperature rise.</li>
    <li><b>Separate layers:</b> each material follows the layer set in the materials table. You choose which layer is kept and how much product is lost to the other one.</li>
    <li><b>Distil / concentrate:</b> removes a share of all volatile materials, or of one chosen solvent. Most of the distillate is collected and a small part escapes as vapour. Real distillation takes off the lighter solvent first, so distilling one solvent at a time is closer to the plant.</li>
    <li><b>Crystallise:</b> product above its solubility in the final liquid comes out as solid. The solubility is per 100 g of all volatile liquids together.</li>
    <li><b>Filter and wash:</b> the cake keeps liquid up to the wet cake LOD you set, taken from the wash first, so a good wash leaves the mother liquor impurities in the filtrate. A share of the product dissolves in the wash.</li>
    <li><b>Dry:</b> volatile liquid is removed down to the final LOD; product dissolved in the cake liquor deposits on the solid. Other non-volatile liquid stays in the product and lowers its assay. A small handling loss can be set.</li>
  </ul>
  <h2>Reading the results</h2>
  <ul>
    <li><b>Mass balance:</b> everything charged must equal the final stream plus the other streams. If it does not close, a reaction does not balance by mass.</li>
    <li><b>Yield:</b> product out against the theoretical amount from the key material (when the reaction starts from it), or against the product charged for a purification or crystallisation step.</li>
    <li><b>Process mass intensity (PMI)</b> and <b>E-factor</b> show how much material the batch uses per kg of product. Both are per kg of product in the final stream. Solvents usually make up most of it, so the solvent table shows how much of each goes to recovery (reagents that react are left out).</li>
    <li><b>Stream table:</b> S-1, S-2 and so on are the batch after each step; W-1, W-2 and so on are the streams that leave. Download it as a spreadsheet (.xlsx) or PDF for a report or a tech transfer file. The PDF carries a link that reopens the same flowsheet.</li>
  </ul>
  <p>The example loaded at first is made up for illustration: an amide coupling of a starting material with an acid chloride and triethylamine in toluene, a water quench and wash, concentration, heptane crystallisation, centrifuging and drying. Replace it with your own process, or press Start blank.</p>
  <h2>Frequently asked questions</h2>
  ''' + faqh + '''
  <p class="pm-small">A free screening tool for engineers and students. It follows the simple step models described above; real partitioning, distillation and crystallisation depend on the system, so confirm critical numbers with lab and plant data.</p>
  <div class="related-box">
    <h3>Related</h3>
    <a href="{{ '/exclusive/bfd-tool/' | relative_url }}">BFD tool (offline app): equipment, utilities and costing from a lab procedure</a>
    <a href="{{ '/process-modelling/solubility-curve-crystallisation/' | relative_url }}">Solubility curve and crystallisation</a>
    <a href="{{ '/process-modelling/solvent-swap-simulator/' | relative_url }}">Solvent swap simulator</a>
    <a href="{{ '/articles/process-engineering-deliverables/' | relative_url }}">Process engineering deliverables</a>
    <a href="{{ '/process-safety/' | relative_url }}">Process safety</a>
  </div>
</div>
<script src="{{ '/assets/js/batch-flowsheet.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
'''
os.makedirs(os.path.join(ROOT, 'process-modelling/batch-mass-balance-flowsheet'), exist_ok=True)
open(os.path.join(ROOT, 'process-modelling/batch-mass-balance-flowsheet/index.html'), 'w', encoding='utf-8').write(fm + body)
print('ok')
