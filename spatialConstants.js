// ============================================================
// spatialConstants.js — Spatial math, transforms, and clipping
// Extracted from UnifiedCanvas.js (Split 2)
//
// ABSOLUTE GROUND TRUTH — Matrix4 world transforms extracted
// from the running 2017 Ultra configurator's Three.js memory.
// 60-inch double gate. Column-major float[16] arrays.
// NO algorithmic calculations. Snap-to-Matrix only.
// ============================================================

export function snap(mesh, m) {
    mesh.matrixAutoUpdate = false;
    mesh.matrix.fromArray(m);
}

export var BG_ASPECT = 1960 / 1096;

export function fitContainBox(cw, ch) {
    var w, h;
    if (cw / ch > BG_ASPECT) {
        h = ch; w = Math.round(ch * BG_ASPECT);
    } else {
        w = cw; h = Math.round(cw / BG_ASPECT);
    }
    return { w: w, h: h, left: Math.round((cw - w) / 2), top: ch - h };
}

// ---- GROUND TRUTH MATRICES (from matrixWorld.elements) ----

export var M_HINGE = [
    [2.220446049250313e-16,0,1,0, 0,1,0,0, -1,0,2.220446049250313e-16,0, -1.778,1.374,0,1],
    [2.220446049250313e-16,0,-1,0, 0,1,0,0, 1,0,2.220446049250313e-16,0, 1.778,1.374,0,1],
    [2.220446049250313e-16,0,1,0, 0,1,0,0, -1,0,2.220446049250313e-16,0, -1.778,0.225,0,1],
    [2.220446049250313e-16,0,-1,0, 0,1,0,0, 1,0,2.220446049250313e-16,0, 1.778,0.225,0,1],
];

export var M_IDENTITY = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

export var M_CAPS = [
    [1.545,0,0,0, 0,1.545,0,0, 0,0,1.545,0, -1.829,1.5725000000000002,0,1],
    [1.545,0,0,0, 0,1.545,0,0, 0,0,1.545,0, 1.829,1.5725000000000002,0,1],
    [1,0,0,0, 0,1,0,0, 0,0,1,0, -1.645,1.5725000000000002,0,1],
    [1,0,0,0, 0,1,0,0, 0,0,1,0, 1.645,1.5725000000000002,0,1],
    [1,0,0,0, 0,1,0,0, 0,0,1,0, -0.044,1.5725,0,1],
    [1,0,0,0, 0,1,0,0, 0,0,1,0, 0.044,1.5725,0,1],
];

export var M_RAIL_T0 = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.489,0,1];
export var M_RAIL_T1 = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.2985,0,1];
export var M_RAIL_B0 = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.727,0,1];
export var M_RAIL_B1 = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.34550000000000003,0,1];
export var M_RAIL_B2 = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.155,0,1];

export var M_PICKET_TOP = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,-0.30519999999999997,0,1];

// Center gap: Phase 3 extraction (center_gap_baseline_60in.json,
// center_gap_baseline_72in.json) proves Ultra's edge-to-edge gap is 0.018.
// The widening logic applies to both sides, so per-side offset = 0.009.
export var CENTER_GAP = 0.009;

// Per-arch inner cap Y positions (M_CAPS indices 4,5 only).
// Extracted from Phase 3 scene dumps:
//   spatial_baseline_uaf200.json        → Standard  y=1.5725
//   arch_positions_arched.json          → Arched    y=1.8775
//   arch_positions_estate.json          → Estate    y=1.8775
//   arch_positions_reverse_arched.json  → Royal     y=1.2675
export var CAP_INNER_Y = {
    s: 1.5725,
    a: 1.8775,
    e: 1.8775,
    r: 1.2675,
};

// ---- CLIPPING CONSTANTS (from extracted clippingPlanes) ----
// Derived from legacy formula: htY + _2_5 where _2_5 = 0.0635
// For 60" height: htY = 1.524, so post clip = 1.5875
//
// Post clip (po40d, po14): ALWAYS 1.5875 regardless of arch style
// Inner stile clip (po23): varies by arch style
//   Estate/Arched: htY + _12 + _2_5 = 1.524 + 0.3048 + 0.0635 = 1.8923
//   Standard:      htY + _2_5       = 1.524 + 0.0635            = 1.5875
//   Royal:         htY - _12 + _2_5 = 1.524 - 0.3048 + 0.0635  = 1.2827
//
// Picket split plane at y=0.735: top half above, bottom half below

export var CLIP_POST = 1.5875;       // Main posts — all arch styles
export var CLIP_PT   = -0.735;       // Picket tops: shows above y=0.735
export var CLIP_PB   = 0.735;        // Picket bottoms: shows below y=0.735

// Inner stile (po23) clip per arch style
export var CLIP_PO23 = {
    e: 1.8923,   // Estate
    a: 1.8923,   // Arched
    s: 1.5875,   // Standard (same as main posts)
    r: 1.2827,   // Royal
};
