/* PharmaChemE cards: gives every .tool-card an icon like the Games cards, an arrow link, and makes the whole card clickable. */
(function () {
  'use strict';
  const RULES = [
    [/vessel-volume/, '🛢️'], [/batch-size/, '⚖️'], [/overall-heat-transfer/, '🧱'], [/batch-cooling-tr/, '🧊'], [/reagent-addition/, '⏱️'],
    [/mixture-density/, '🧪'], [/drying-agent/, '💧'], [/packed-scrubber/, '🧼'],
    [/fault-tree/, '🌳'], [/falling-film/, '🫗'], [/atfd/, '🌪️'], [/qualification/, '✅'], [/condenser-selection/, '♨️'],
    [/runaway/, '🌡️'], [/case-studies/, '📰'], [/what-is-process-safety/, '⚠️'],
    [/dsc|arc-rc|thermal-testing/, '📈'], [/lopa|sil-basics/, '🛡️'], [/hydrogenation/, '🎈'], [/kla|gas-liquid/, '🌬️'], [/quench|reagent/, '🧪'], [/scrubber/, '🧼'],
    [/permit|isolation/, '🔒'], [/line-siz|pressure-drop/, '📏'], [/agitator|mixing/, '🥄'], [/glass-lined/, '🏺'], [/reactor-selection|semi-batch|jacket|limpet/, '🏭'],
    [/storage-tank|breathing/, '🛢️'], [/instrument/, '🎛️'], [/pid-control/, '🎚️'], [/corrosion/, '🔩'], [/materials/, '🧱'], [/balance/, '⚖️'],
    [/etp|effluent|water|dg-power/, '💧'], [/workup|phase-separation/, '🧴'], [/solvent-swap|distillation|solvent-recovery/, '⚗️'], [/flow-chemistry|continuous/, '➰'],
    [/pump/, '⚙️'], [/crystalli/, '💎'], [/dry/, '☀️'], [/dust/, '💥'], [/cost|consumption/, '💰'], [/static|solvent-fire|inerting/, '🔥'], [/hazop/, '🔍'],
    [/how-to-read-a-pid|\/pid\//, '📐'], [/pfd/, '🗺️'], [/heat-exchanger/, '🔀'], [/heat-load/, '🌡️'], [/cycle-time|debottleneck/, '📊'],
    [/management-of-change|lab-to-plant|checklist/, '📋'], [/relief/, '🚨'], [/filtration/, '☕'], [/centrifuge/, '🌀'], [/steam|boiler/, '♨️'],
    [/cooling-tower/, '🌫️'], [/chiller|vam/, '❄️'], [/compressed-air|nitrogen/, '💨'], [/power/, '⚡'], [/molecule/, '🧬'],
  ];
  document.querySelectorAll('.tool-card').forEach(card => {
    if (card.querySelector('.icon')) return;
    const a = card.querySelector('a[href]'); if (!a) return;
    const href = a.getAttribute('href') || '';
    let ic = '📘'; for (const r of RULES) if (r[0].test(href)) { ic = r[1]; break; }
    const sp = document.createElement('span'); sp.className = 'icon'; sp.setAttribute('aria-hidden', 'true'); sp.textContent = ic;
    card.insertBefore(sp, card.firstChild);
    a.classList.add('tc-link'); a.insertAdjacentHTML('beforeend', ' &rarr;');
  });
})();
