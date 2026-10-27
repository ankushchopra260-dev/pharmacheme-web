// Loads compatibility data from the live site JS files (single source of truth).
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
function grab(src, startRe, endStr) { const i = src.search(startRe); if (i < 0) throw new Error('not found ' + startRe); const j = src.indexOf(endStr, i); return src.slice(i, j + endStr.length); }
const calc = R('assets/js/calculators.js');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(grab(calc, /const MATERIALS = /, '];') + '\n' + grab(calc, /const RATING_MAP = /, '};') + '\n' + grab(calc, /const CHEM_COMPAT = \{/, '\n};') + '\nthis.MATERIALS=MATERIALS;this.CHEM_COMPAT=CHEM_COMPAT;this.RATING_MAP=RATING_MAP;', ctx);
const mc = R('assets/js/materials-compat.js');
vm.runInContext(grab(mc, /const SRC = \{/, '\n  };') + '\n' + grab(mc, /const BASIS = \{/, '};') + '\n' + grab(mc, /const REAGENT_SRC = \{/, '\n  };') + '\nthis.SRC=SRC;this.BASIS=BASIS;this.REAGENT_SRC=REAGENT_SRC;', ctx);
const mctx = { window: {}, document: { getElementById: () => null } }; vm.createContext(mctx);
vm.runInContext(R('assets/js/mixing-hazards.js'), mctx);
const page = R('calculators/compatibility/index.html');
const TO_CHEM = JSON.parse(page.match(/var TO_CHEM = (\{.*?\});/)[1]);
module.exports = { MATERIALS: ctx.MATERIALS, CHEM_COMPAT: ctx.CHEM_COMPAT, RATING_MAP: ctx.RATING_MAP, SRC: ctx.SRC, BASIS: ctx.BASIS, REAGENT_SRC: ctx.REAGENT_SRC, MIX: mctx.window.PCME_MIX, TO_CHEM };
