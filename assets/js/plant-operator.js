// ================================================================
// PharmaChemE Plant Operator — V1
// Map + character movement (WASD/arrows + tap-to-move) + collision
// + proximity-based equipment interaction (stub for V2 to build on).
// Rendering: HTML5 Canvas. Tile art: Kenney "Tiny Factory" (CC0).
// Reactor sprite: hand-drawn to match, in this project.
// ================================================================

// ---------- Local helpers (kept self-contained — this page doesn't load calculators.js) ----------
function qs(id) { return document.getElementById(id); }
function plateHeader(title, code) {
  return `<div class="plate-header"><h2>${title}</h2><span class="code">${code}</span></div>`;
}

// ---------- Constants ----------
const PO_TILE = 16;          // source tile size in the tileset image
const PO_SCALE = 3;          // on-screen scale factor
const PO_COLS = 15;
const PO_ROWS = 10;
const PO_CANVAS_W = PO_COLS * PO_TILE * PO_SCALE;
const PO_CANVAS_H = PO_ROWS * PO_TILE * PO_SCALE;
const PO_PLAYER_SPEED = 90;  // pixels per second, in source-tile-space (pre-scale)
const PO_INTERACT_RANGE = 22; // source-space pixels

// Tile indices (1-based, row-major, 12 cols per Kenney's Tiny Factory sheet)
const PO_TILES = {
  FLOOR: 2,        // checker floor
  FLOOR_HAZARD: 3, // diagonal hazard stripe floor
  WALL: 11,        // plain dark wall backdrop (tiles cleanly, unlike the raised panel look of tile 9)
  CRATE: 74,       // decorative prop
  BARREL: 78,      // decorative prop
  LOCKER_BLUE: 109, // decorative prop (also doubles as a control-panel look)
  PIPE_H: 80,      // horizontal pipe run w/ valve wheel
  PIPE_V: 17,      // vertical pipe segment
  PLAYER: 121,     // worker sprite
};

// ---------- Map layout ----------
// 0 = floor, 1 = floor_hazard, 9 = wall. Border is walls; interior mostly floor.
function poBuildMap() {
  const floor = [];
  const solid = []; // true = blocks movement
  for (let r = 0; r < PO_ROWS; r++) {
    const floorRow = [];
    const solidRow = [];
    for (let c = 0; c < PO_COLS; c++) {
      const isBorder = r === 0 || r === PO_ROWS - 1 || c === 0 || c === PO_COLS - 1;
      if (isBorder) {
        floorRow.push(PO_TILES.WALL);
        solidRow.push(true);
      } else if (r === 1) {
        // a decorative pipe run just inside the top wall, matching a real plant's overhead piping
        floorRow.push(PO_TILES.PIPE_H);
        solidRow.push(false);
      } else {
        // hazard-stripe walkway around the reactor, else plain checker
        const nearReactor = r >= 3 && r <= 7 && c >= 4 && c <= 9;
        floorRow.push(nearReactor ? PO_TILES.FLOOR_HAZARD : PO_TILES.FLOOR);
        solidRow.push(false);
      }
    }
    floor.push(floorRow);
    solid.push(solidRow);
  }
  return { floor, solid };
}

// ---------- Decorative props (solid, but not interactable \u2014 give the room texture) ----------
function poBuildProps() {
  return [
    { tile: PO_TILES.CRATE, col: 2, row: 2 },
    { tile: PO_TILES.CRATE, col: 2, row: 3 },
    { tile: PO_TILES.BARREL, col: 12, row: 2 },
    { tile: PO_TILES.LOCKER_BLUE, col: 12, row: 6 },
    { tile: PO_TILES.LOCKER_BLUE, col: 12, row: 7 },
    { tile: PO_TILES.BARREL, col: 2, row: 7 },
  ];
}

function poPropRect(p) {
  return { x: p.col * PO_TILE, y: p.row * PO_TILE, w: PO_TILE, h: PO_TILE };
}

// ---------- Equipment (V1: one reactor, stub interaction) ----------
// Position is in source-tile-space (col,row of the equipment's top-left tile).
// Reactor sprite is 32x48 source px = 2 tiles wide x 3 tiles tall.
function poBuildEquipment() {
  return [
    {
      id: "R-101",
      label: "Reactor R-101",
      type: "reactor",
      col: 6, row: 3,      // top-left tile position
      wTiles: 2, hTiles: 3,
      state: "idle",
      // Process state (V2): live simulation, updated every frame regardless of
      // whether this equipment's panel is open or the player is nearby.
      temperature: 25,      // \u00b0C, starts at ambient
      agitator: false,
      steamValve: false,
      coolingValve: false,
    },
  ];
}

// ---------- V3: batch sequence (charge \u2192 agitate \u2192 heat \u2192 hold \u2192 cool \u2192 transfer) ----------
const PO_HOLD_TARGET = 60;     // \u00b0C
const PO_HOLD_TOLERANCE = 2;   // \u00b1\u00b0C counted as "at temperature"
const PO_HOLD_DURATION = 15;   // seconds continuously in-range required
const PO_TRANSFER_MAX_TEMP = 35; // \u00b0C, must cool to at least this before transfer is allowed

function poBuildBatch() {
  return {
    product: "API-001",
    charged: false,
    heatAchieved: false,
    holdElapsed: 0,
    holdComplete: false,
    cooled: false,
    transferred: false,
  };
}

// Call every frame (batch progress tracks the reactor's live temperature,
// so it must advance whether or not any panel is open).
function poUpdateBatchProgress(dt) {
  const b = poBatch;
  const eq = poEquipment.find((e) => e.id === "R-101");
  if (!b || !eq || b.transferred) return;

  if (b.charged) {
    const inRange = Math.abs(eq.temperature - PO_HOLD_TARGET) <= PO_HOLD_TOLERANCE;
    if (eq.temperature >= PO_HOLD_TARGET - PO_HOLD_TOLERANCE) b.heatAchieved = true;
    if (!b.holdComplete) {
      if (inRange) {
        b.holdElapsed += dt;
        if (b.holdElapsed >= PO_HOLD_DURATION) b.holdComplete = true;
      } else {
        b.holdElapsed = 0; // must hold *continuously* in range, matching real process discipline
      }
    }
  }
  if (b.holdComplete && eq.temperature <= PO_TRANSFER_MAX_TEMP) b.cooled = true;
}

function poChargeReactor() {
  if (poBatch && !poBatch.charged) poBatch.charged = true;
}

function poTransferReactor() {
  const b = poBatch;
  if (b && b.holdComplete && b.cooled && !b.transferred) {
    b.transferred = true;
  }
}

function poChecklistLine(done, label, extra) {
  return `${done ? "\u2611" : "\u2610"} ${label}${extra ? " " + extra : ""}`;
}

function poRenderChecklist() {
  const b = poBatch;
  if (!b) return;
  const set = (id, text, done) => {
    const el = qs(id);
    if (el) { el.textContent = text; el.style.color = done ? "var(--brass)" : "var(--paper)"; el.style.textDecoration = done ? "line-through" : "none"; }
  };
  set("po-step-charge", poChecklistLine(b.charged, "Charge raw material into R-101"), b.charged);
  set("po-step-heat", poChecklistLine(b.heatAchieved, `Heat to ${PO_HOLD_TARGET}\u00b0C`), b.heatAchieved);
  const holdExtra = b.holdComplete ? "" : `(${b.holdElapsed.toFixed(1)}/${PO_HOLD_DURATION}s)`;
  set("po-step-hold", poChecklistLine(b.holdComplete, `Hold at ${PO_HOLD_TARGET}\u00b0C for ${PO_HOLD_DURATION}s`, holdExtra), b.holdComplete);
  set("po-step-cool", poChecklistLine(b.cooled, `Cool to ${PO_TRANSFER_MAX_TEMP}\u00b0C or below`), b.cooled);
  set("po-step-transfer", poChecklistLine(b.transferred, "Transfer to TK-101"), b.transferred);
  const banner = qs("po-batch-complete");
  if (banner) banner.style.display = b.transferred ? "block" : "none";
}

let poBatch = null;

const PO_AMBIENT = 25;
const PO_SAFE_BAND = [20, 75];   // \u00b0C, green
const PO_WARN_MAX = 85;         // \u00b0C, above this is red; between safe max and this is amber

function poTempZone(t) {
  if (t <= PO_SAFE_BAND[1]) return "safe";
  if (t <= PO_WARN_MAX) return "warn";
  return "danger";
}

// Continuous process simulation — always ticks, independent of movement/panels.
// This is deliberately simple cause-and-effect, matching real plant behavior:
// steam+agitator heats fastest; steam alone (no agitation) heats more slowly
// (poor heat distribution without agitation); cooling water cools; with
// everything off, temperature drifts slowly back toward ambient.
function poUpdateProcess(dt) {
  for (const eq of poEquipment) {
    if (eq.type !== "reactor") continue;
    let rate = 0;
    if (eq.steamValve && eq.agitator) rate += 3.0;
    else if (eq.steamValve && !eq.agitator) rate += 1.2;
    if (eq.coolingValve) rate -= 2.2;
    if (!eq.steamValve && !eq.coolingValve) {
      // slow passive drift toward ambient when nothing is active
      rate += (PO_AMBIENT - eq.temperature) * 0.05;
    }
    eq.temperature += rate * dt;
    if (eq.temperature < PO_AMBIENT) eq.temperature = PO_AMBIENT;
  }
}

// ---------- Game state ----------
let poCtx = null;
let poTilesetImg = null;
let poReactorImg = null;
let poAssetsReady = false;
let poMap = null;
let poEquipment = null;
let poProps = [];
let poPlayer = { x: 0, y: 0, w: 12, h: 14, facing: "down" };
let poKeys = {};
let poTapTarget = null; // {x,y} in source-space, or null
let poLastTime = 0;
let poRafId = null;
let poActiveEquipment = null; // equipment currently in interact range
let poInteractionOpen = null; // equipment object if a panel is open

function poRectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Solid rectangles for equipment, in source-space pixels
function poEquipmentRect(eq) {
  return {
    x: eq.col * PO_TILE,
    y: eq.row * PO_TILE,
    w: eq.wTiles * PO_TILE,
    h: eq.hTiles * PO_TILE,
  };
}

function poTileSolidAt(px, py) {
  const c = Math.floor(px / PO_TILE);
  const r = Math.floor(py / PO_TILE);
  if (r < 0 || r >= PO_ROWS || c < 0 || c >= PO_COLS) return true;
  return poMap.solid[r][c];
}

function poCanMoveTo(nx, ny) {
  // Check the player's bounding box corners against tile solidity and equipment rects
  const corners = [
    [nx, ny], [nx + poPlayer.w, ny],
    [nx, ny + poPlayer.h], [nx + poPlayer.w, ny + poPlayer.h],
  ];
  for (const [cx, cy] of corners) {
    if (poTileSolidAt(cx, cy)) return false;
  }
  for (const eq of poEquipment) {
    const r = poEquipmentRect(eq);
    if (poRectsOverlap(nx, ny, poPlayer.w, poPlayer.h, r.x, r.y, r.w, r.h)) return false;
  }
  for (const p of poProps) {
    const r = poPropRect(p);
    if (poRectsOverlap(nx, ny, poPlayer.w, poPlayer.h, r.x, r.y, r.w, r.h)) return false;
  }
  return true;
}

function poFindNearestEquipment() {
  const px = poPlayer.x + poPlayer.w / 2;
  const py = poPlayer.y + poPlayer.h / 2;
  let best = null, bestDist = Infinity;
  for (const eq of poEquipment) {
    const r = poEquipmentRect(eq);
    const ecx = r.x + r.w / 2, ecy = r.y + r.h / 2;
    const dx = px - ecx, dy = py - ecy;
    // distance from player center to nearest edge of equipment rect (approx via center distance minus half-diagonal)
    const dist = Math.hypot(dx, dy) - Math.hypot(r.w, r.h) / 2;
    if (dist < bestDist) { bestDist = dist; best = eq; }
  }
  if (best && bestDist <= PO_INTERACT_RANGE) return best;
  return null;
}

function poUpdate(dt) {
  poUpdateProcess(dt); // the plant keeps running regardless of movement/panel state
  poUpdateBatchProgress(dt);
  poRenderChecklist();

  if (poInteractionOpen) {
    poRefreshOpenPanel();
    return; // movement frozen while a panel is open, but the process above still ticked
  }

  let dx = 0, dy = 0;
  if (poKeys["w"] || poKeys["arrowup"]) dy -= 1;
  if (poKeys["s"] || poKeys["arrowdown"]) dy += 1;
  if (poKeys["a"] || poKeys["arrowleft"]) dx -= 1;
  if (poKeys["d"] || poKeys["arrowright"]) dx += 1;

  if (dx !== 0 || dy !== 0) {
    poTapTarget = null; // keyboard overrides tap-to-move
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
  } else if (poTapTarget) {
    const cx = poPlayer.x + poPlayer.w / 2, cy = poPlayer.y + poPlayer.h / 2;
    const tdx = poTapTarget.x - cx, tdy = poTapTarget.y - cy;
    const tdist = Math.hypot(tdx, tdy);
    if (tdist < 3) {
      poTapTarget = null;
    } else {
      dx = tdx / tdist; dy = tdy / tdist;
    }
  }

  if (dx !== 0) {
    const nx = poPlayer.x + dx * PO_PLAYER_SPEED * dt;
    if (poCanMoveTo(nx, poPlayer.y)) poPlayer.x = nx;
    poPlayer.facing = dx > 0 ? "right" : "left";
  }
  if (dy !== 0) {
    const ny = poPlayer.y + dy * PO_PLAYER_SPEED * dt;
    if (poCanMoveTo(poPlayer.x, ny)) poPlayer.y = ny;
    poPlayer.facing = dy > 0 ? "down" : "up";
  }

  poActiveEquipment = poFindNearestEquipment();
}

function poDrawTile(ctx, tileIndex, dx, dy) {
  const col = (tileIndex - 1) % 12;
  const row = Math.floor((tileIndex - 1) / 12);
  ctx.drawImage(
    poTilesetImg,
    col * PO_TILE, row * PO_TILE, PO_TILE, PO_TILE,
    dx * PO_SCALE, dy * PO_SCALE, PO_TILE * PO_SCALE, PO_TILE * PO_SCALE
  );
}

function poRender() {
  const ctx = poCtx;
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, PO_CANVAS_W, PO_CANVAS_H);

  for (let r = 0; r < PO_ROWS; r++) {
    for (let c = 0; c < PO_COLS; c++) {
      poDrawTile(ctx, poMap.floor[r][c], c * PO_TILE, r * PO_TILE);
    }
  }

  for (const p of poProps) {
    poDrawTile(ctx, p.tile, p.col * PO_TILE, p.row * PO_TILE);
  }

  for (const eq of poEquipment) {
    const r = poEquipmentRect(eq);
    ctx.drawImage(poReactorImg, r.x * PO_SCALE, r.y * PO_SCALE, r.w * PO_SCALE, r.h * PO_SCALE);

    if (eq.type === "reactor") {
      const zone = poTempZone(eq.temperature);
      ctx.fillStyle = poZoneColor(zone);
      ctx.font = `bold ${11 * PO_SCALE / 3}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${eq.temperature.toFixed(0)}\u00b0C`, (r.x + r.w / 2) * PO_SCALE, (r.y - 14) * PO_SCALE);
    }
    if (poActiveEquipment === eq) {
      ctx.fillStyle = "#F7C282";
      ctx.font = `${12 * PO_SCALE / 3}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Press E", (r.x + r.w / 2) * PO_SCALE, (r.y - 4) * PO_SCALE);
    }
  }

  poDrawPlayer(ctx);
}

// Draws the worker sprite (tile 121) anchored so its feet sit on the player's
// hitbox bottom edge, flipped horizontally when facing left.
function poDrawPlayer(ctx) {
  const p = poPlayer;
  const col = (PO_TILES.PLAYER - 1) % 12;
  const row = Math.floor((PO_TILES.PLAYER - 1) / 12);
  const cx = (p.x + p.w / 2) * PO_SCALE;
  const bottomY = (p.y + p.h) * PO_SCALE;
  const size = PO_TILE * PO_SCALE;

  ctx.save();
  if (p.facing === "left") {
    ctx.translate(cx, 0);
    ctx.scale(-1, 1);
    ctx.translate(-cx, 0);
  }
  ctx.drawImage(
    poTilesetImg,
    col * PO_TILE, row * PO_TILE, PO_TILE, PO_TILE,
    cx - size / 2, bottomY - size, size, size
  );
  ctx.restore();
}

function poLoop(ts) {
  const dt = poLastTime ? (ts - poLastTime) / 1000 : 0;
  poLastTime = ts;
  poUpdate(Math.min(dt, 0.05));
  poRender();
  poRafId = requestAnimationFrame(poLoop);
}

function poZoneColor(zone) {
  return zone === "safe" ? "#8FD19E" : zone === "warn" ? "#F7C282" : "#E0625A";
}

function poControlBtn(eq, key, onLabel, offLabel) {
  const on = !!eq[key];
  return `<button type="button" class="pill${on ? " active" : ""}" data-po-toggle="${key}" style="margin:3px 0; width:100%; text-align:left;">${on ? onLabel : offLabel}</button>`;
}

function poPanelBodyHTML(eq) {
  const zone = poTempZone(eq.temperature);
  const b = poBatch;
  const canCharge = b && !b.charged;
  const canTransfer = b && b.holdComplete && b.cooled && !b.transferred;
  return `
    <div class="plate-header"><h2>${eq.label}</h2><span class="code">${eq.id}</span></div>
    <div style="display:flex; align-items:baseline; gap:8px; margin:12px 0 16px;">
      <span style="font-family:var(--f-sans); color:var(--muted); font-size:0.8rem;">Temperature</span>
      <span id="po-panel-temp" style="font-family:var(--f-mono); font-size:1.4rem; font-weight:700; color:${poZoneColor(zone)};">${eq.temperature.toFixed(1)}\u00b0C</span>
    </div>
    <div style="display:flex; flex-direction:column; gap:6px; max-width:260px;">
      <button type="button" class="pill${!canCharge ? "" : " active"}" data-po-action="charge" ${!canCharge ? "disabled" : ""} style="margin:3px 0; width:100%; text-align:left; opacity:${!canCharge && !b.charged ? "1" : b.charged ? "0.5" : "1"};">${b && b.charged ? "Raw Material: Charged" : "Charge Raw Material"}</button>
      ${poControlBtn(eq, "agitator", "Agitator: ON", "Agitator: OFF")}
      ${poControlBtn(eq, "steamValve", "Steam Valve: OPEN", "Steam Valve: CLOSED")}
      ${poControlBtn(eq, "coolingValve", "Cooling Water: OPEN", "Cooling Water: CLOSED")}
      <button type="button" class="pill${canTransfer ? " active" : ""}" data-po-action="transfer" ${canTransfer ? "" : "disabled"} style="margin:3px 0; width:100%; text-align:left; opacity:${canTransfer ? "1" : "0.5"};">${b && b.transferred ? "Transferred to TK-101" : "Transfer to TK-101"}</button>
    </div>
    <p style="font-family:var(--f-sans); color:var(--muted-dim); font-size:0.78rem; margin-top:14px; max-width:320px;">
      Steam + agitator heats fastest; steam alone heats slower (poor heat distribution without agitation). Cooling water cools. With both closed, temperature drifts back toward ambient. This keeps running even after you close this panel and walk away.
    </p>
    <button type="button" class="pill" id="po-close-btn" style="margin-top:14px;">Close</button>
  `;
}

function poOpenInteraction(eq) {
  poInteractionOpen = eq;
  poPanelSignature = poComputePanelSignature(eq);
  const panel = qs("po-panel");
  if (panel) {
    panel.style.display = "block";
    panel.innerHTML = poPanelBodyHTML(eq);
    poWirePanelButtons(eq);
  }
}

function poWirePanelButtons(eq) {
  const panel = qs("po-panel");
  if (!panel) return;
  panel.querySelectorAll("[data-po-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.poToggle;
      eq[key] = !eq[key];
      panel.innerHTML = poPanelBodyHTML(eq);
      poWirePanelButtons(eq);
    });
  });
  const chargeBtn = panel.querySelector('[data-po-action="charge"]');
  if (chargeBtn) chargeBtn.addEventListener("click", () => {
    poChargeReactor();
    panel.innerHTML = poPanelBodyHTML(eq);
    poWirePanelButtons(eq);
  });
  const transferBtn = panel.querySelector('[data-po-action="transfer"]');
  if (transferBtn) transferBtn.addEventListener("click", () => {
    poTransferReactor();
    panel.innerHTML = poPanelBodyHTML(eq);
    poWirePanelButtons(eq);
  });
  const closeBtn = qs("po-close-btn");
  if (closeBtn) closeBtn.addEventListener("click", poCloseInteraction);
}

// Called every frame while a panel is open, to keep the displayed temperature live
// without rebuilding the whole panel (which would drop button state/listeners needlessly).
let poPanelSignature = null;

function poComputePanelSignature(eq) {
  const b = poBatch;
  return [eq.agitator, eq.steamValve, eq.coolingValve, b && b.charged, b && b.holdComplete, b && b.cooled, b && b.transferred].join("|");
}

function poRefreshOpenPanel() {
  const eq = poInteractionOpen;
  if (!eq) return;
  const tempEl = qs("po-panel-temp");
  if (tempEl) {
    const zone = poTempZone(eq.temperature);
    tempEl.textContent = eq.temperature.toFixed(1) + "\u00b0C";
    tempEl.style.color = poZoneColor(zone);
  }
  // The temperature reading updates every frame above, but button enabled/disabled
  // state (Charge/Transfer) only needs to change when an underlying flag actually
  // flips \u2014 which can happen from the passive simulation, not just from a click
  // (e.g., "cooled" becoming true on its own as temperature drifts down). Detect
  // that with a cheap signature check rather than rebuilding the panel every frame.
  const sig = poComputePanelSignature(eq);
  if (sig !== poPanelSignature) {
    poPanelSignature = sig;
    const panel = qs("po-panel");
    if (panel) {
      panel.innerHTML = poPanelBodyHTML(eq);
      poWirePanelButtons(eq);
    }
  }
}

function poCloseInteraction() {
  poInteractionOpen = null;
  const panel = qs("po-panel");
  if (panel) { panel.style.display = "none"; panel.innerHTML = ""; }
}

function poHandleKeyDown(e) {
  const k = e.key.toLowerCase();
  poKeys[k] = true;
  if (k === "e") {
    if (poInteractionOpen) poCloseInteraction();
    else if (poActiveEquipment) poOpenInteraction(poActiveEquipment);
  }
  if (k === "escape" && poInteractionOpen) poCloseInteraction();
}
function poHandleKeyUp(e) {
  poKeys[e.key.toLowerCase()] = false;
}

function poHandleCanvasTap(e) {
  if (poInteractionOpen) return;
  const canvas = qs("po-canvas");
  const rect = canvas.getBoundingClientRect();
  const scaleX = PO_CANVAS_W / rect.width, scaleY = PO_CANVAS_H / rect.height;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const sx = (clientX - rect.left) * scaleX / PO_SCALE;
  const sy = (clientY - rect.top) * scaleY / PO_SCALE;
  poTapTarget = { x: sx, y: sy };
}

function poLoadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function renderPlantOperator() {
  return `
    ${plateHeader("Plant Operator", "V3 \u2014 FULL BATCH SEQUENCE")}
    <div id="po-hint" style="font-size:0.75rem; color:var(--muted-dim); font-family:var(--f-sans); margin-bottom:6px;">
      Move: WASD / Arrow keys (or tap the floor on touch devices). Press E near equipment to interact.
    </div>
    <div style="border:1px solid var(--grid-line); border-radius:4px; overflow:hidden; touch-action:none; max-width:100%;">
      <canvas id="po-canvas" width="${PO_CANVAS_W}" height="${PO_CANVAS_H}" style="display:block; width:100%; height:auto; image-rendering:pixelated; background:#2b2130;"></canvas>
    </div>
    <div id="po-panel" class="plate" style="display:none; margin-top:16px; background:var(--panel); border:1px solid var(--grid-line); border-radius:4px; padding:20px;"></div>
    <div style="margin-top:16px; background:var(--panel); border:1px solid var(--grid-line); border-radius:4px; padding:20px;">
      <div class="plate-header"><h2>Batch Instructions</h2><span class="code">API-001 \u2014 R-101</span></div>
      <ul style="list-style:none; padding:0; margin:12px 0 0; font-family:var(--f-mono); font-size:0.85rem; line-height:1.9;">
        <li id="po-step-charge">\u2610 Charge raw material into R-101</li>
        <li id="po-step-heat">\u2610 Heat to ${PO_HOLD_TARGET}\u00b0C</li>
        <li id="po-step-hold">\u2610 Hold at ${PO_HOLD_TARGET}\u00b0C for ${PO_HOLD_DURATION}s</li>
        <li id="po-step-cool">\u2610 Cool to ${PO_TRANSFER_MAX_TEMP}\u00b0C or below</li>
        <li id="po-step-transfer">\u2610 Transfer to TK-101</li>
      </ul>
      <div id="po-batch-complete" style="display:none; margin-top:12px; color:var(--brass); font-family:var(--f-sans); font-weight:600;">
        \u2705 Batch API-001 complete. Walk up to R-101 and press E if you'd like to review it, or refresh the page to run another batch.
      </div>
    </div>
  `;
}

function initPlantOperator() {
  const canvas = qs("po-canvas");
  poCtx = canvas.getContext("2d");
  poMap = poBuildMap();
  poEquipment = poBuildEquipment();
  poProps = poBuildProps();
  poBatch = poBuildBatch();
  poPlayer = { x: 4 * PO_TILE, y: 4 * PO_TILE, w: 12, h: 14, facing: "down" };
  poKeys = {}; poTapTarget = null; poActiveEquipment = null; poInteractionOpen = null;
  poLastTime = 0;

  Promise.all([
    poLoadImage("/assets/img/plant-tileset.png"),
    poLoadImage("/assets/img/reactor-sprite.png"),
  ]).then(([tileset, reactor]) => {
    poTilesetImg = tileset;
    poReactorImg = reactor;
    poAssetsReady = true;
    document.addEventListener("keydown", poHandleKeyDown);
    document.addEventListener("keyup", poHandleKeyUp);
    canvas.addEventListener("mousedown", poHandleCanvasTap);
    canvas.addEventListener("touchstart", function (e) { e.preventDefault(); poHandleCanvasTap(e); }, { passive: false });
    if (poRafId) cancelAnimationFrame(poRafId);
    poRafId = requestAnimationFrame(poLoop);
  }).catch((err) => {
    const mount = canvas.parentElement;
    if (mount) mount.innerHTML = `<p style="padding:20px; color:var(--rust); font-family:var(--f-sans);">Could not load plant graphics. Please reload the page.</p>`;
  });
}
