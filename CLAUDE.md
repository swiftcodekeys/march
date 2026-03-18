# Grandview Design Studio — CLAUDE.md

## Working Directory
```
C:\Users\sarah\Desktop\App Repos\Testing-VS code\designstudio\designstudio\designstudioworkingmvp
```
GitHub: https://github.com/swiftcodekeys/designstudioworkingmvp
Branch: `feat/fence-quiz`

**This is the ONLY repo to work in.** Do NOT use `grandview_design_studio_gates` or `Downloads/.../designstudioworkingmvp`.

---

## Architecture

- **React + Webpack** app with vanilla CSS
- `index.js` → `app.js` → `TopNav.js` + `UnifiedCanvas.js` (3D) + `FloatingPanel.js` (controls)
- `GateRenderer.js` — Pure Three.js gate renderer (no React), uses legacy Three.js r86
- `configData.js` — All product configuration, style definitions, feature gating
- `spatialConstants.js` — Extraction-verified Matrix4 transforms from Ultra's live tool
- `gate_tool/` — Ultra assets: 3D models (`m/`), textures (`t/`), thumbnails (`th/`)
- Build: `npx webpack --mode development` or `npm start` (dev server on port 3000)

### Key Components
| File | Purpose |
|------|---------|
| `app.js` | React app shell, state management, config persistence (localStorage + URL hash) |
| `FloatingPanel.js` | White frosted floating panel — tabs, header, body, footer with progress + Next/Back |
| `TopNav.js` | Dark nav bar with scene tabs, Reset, Save Image, Get Quote buttons |
| `UnifiedCanvas.js` | Routes to 3D / preview / overlay based on style's renderMode |
| `GateRenderer.js` | Three.js scene: camera, lighting, materials, model loading, clipping, accents, finials |
| `spatialConstants.js` | All verified spatial constants from Ultra extraction |
| `configData.js` | Styles, colors, heights, arches, accessories, feature gating per style |
| `styles.css` | Light-theme design system with documented tokens |
| `tabs/*.js` | 7 tab content components (Style, Color, Size, Options, PuppyPickets, Details, Quote) |
| `tabs/ImagePopup.js` | Reusable hover popup for enlarged thumbnails |
| `BacklinksFooter.js` | SEO backlinks to grandviewfence.com product pages |
| `SocialProof.js` | Social proof pill overlay |

---

## MANDATORY VERIFICATION RULE

**Before making ANY change to rendering code:**

1. Find the relevant value in `SPATIAL_TRUTH.json`
2. Confirm it matches `gate_tool/js/ultra_dsg_min.js`
3. Confirm what the Ultra live tool shows at https://www.ultrafence.com/design-studio/gates/index.html
4. Only then write the change

**Use Playwright to scrape Ultra's live tool runtime values — never guess.**
**One fix = one commit. Never batch unrelated changes.**

---

## UI Design System (Light Theme)

### Layout
- Dark TopNav (56px) → Full-screen Viewport (driveway bg) → White FloatingPanel (370px, right side)
- Panel: frosted glass (`rgba(255,255,255,0.95)` + `backdrop-filter: blur(20px)`)
- Panel collapses with ‹/› handle
- Backlinks + social proof as viewport overlays

### Design Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--brand` | `#6BA3C2` | Active states, checkmarks, nav |
| `--cta` | `#d4753a` | CTA buttons ONLY (Next, Get Quote) |
| `--panel` | `rgba(255,255,255,0.95)` | Floating panel |
| `--text-primary` | `#1a1a2e` | Titles |
| `--text-secondary` | `#5a6270` | Body text |
| `--text-hint` | `#8e95a0` | Labels |
| `--border` | `#e8eaed` | Borders |

### Typography (3 levels only)
- Title: 20px / 800 / -0.3px
- Body: 14px / 600 / 0
- Label: 11px / 700 / 1.5px / uppercase

---

## What's Done

### UI Redesign — COMPLETE
- Light-theme floating panel over full-screen viewport
- 7 tabs with step indicators, progress dots, Next/Back
- iFence-style image hover popups on colors, post caps, finials, puppy pickets
- Reset + Save Image in nav, panel collapse/expand
- All verified with Playwright

### Renderer Features — COMPLETE
- **Flush bottom (res):** Y=0.155 → Y=0.0508 when res=true (verified vs Ultra `_2=0.0508`)
- **Mount type:** Direct mount hides posts/hinges/caps
- **Leaf count:** Model paths + transforms key on config.leaf (working)
- **Circle/butterfly accents:** Position arrays from Ultra, ACCENT_BASE_Y=1.397 matches Ultra group posY
- **Finials:** Exact XYZ arrays from Ultra per style/leaf/arch
- **Pro spacing:** Res pickets visible only for UAF-201/UAS-101
- **Height clipping:** 48/60/72" via clipping planes
- **HDR environment map + bump map:** Per-color envMapIntensity from Ultra scrape

---

## What Needs To Be Done

### Priority 1: Remaining Renderer Bugs
1. **BUG-1: Charleston center gap** — Remove CENTER_GAP vertex shift from po23 loader. The gap is baked into po23.json geometry. Ultra does NOT vertex-shift po23.
2. **BUG-2: Center seam post caps** — pc4/pc5 at x=±0.044, no CENTER_GAP push. Arch-aware Y is correct.
3. **BUG-3: Pro spacing Y position** — ptRes needs own Y offset per style:
   - UAF-201: Y = tY + 0.3048 + fsv - 0.1905 = -0.4957
   - UAS-101: Y = tY + 0.3048 + fsv = lt.picketTop

### Priority 2: Puppy Picket Refinement
Basic puppy works (rail + clip). Missing: puppy finials for classic variants.

**Ultra's puppy behavior (from Playwright scrape):**
- Puppy pickets REUSE existing bottom picket models — no separate geometry
- `pupfl` (flush): rail at bY+0.4064, bY=0.0508
- `pupst` (standard): rail at bY+0.3048
- `pupcl` (classic): rail at bY+0.1905, finials at r3y+0.076
- Puppy finial models: `m/3/{fp|fs|ft|fq}.json` (same as gate finials)
- Position arrays: pf1/pf2 (classic), pf1s/pf2s (staggered)

### Priority 3: Polish & Ship
- PDF download (button exists, shows "coming soon" alert)
- Loading states and transitions
- Mobile responsiveness
- Cross-browser testing
- "Get Quote" form integration with grandviewfence.com

---

## Ultra Rendering Math (Verified via Playwright)

### Key Constants
| Variable | Value | Meaning |
|----------|-------|---------|
| `_2` | 0.0508 | 2" in meters — flush bottom rail Y |
| `_2_5` | 0.0635 | 2.5" — U-frame offset |
| `_7_5` | 0.1905 | 7.5" — classic puppy rail offset |
| `_12` | 0.3048 | 12" — standard puppy rail offset |
| `_16` | 0.4064 | 16" — flush puppy rail offset |
| `rH` | -0.035 | Rail height offset |
| `bY` | 0.155 | Normal bottom rail Y |
| `fsv` | -0.152 | Spear family vertical offset (flat=0) |

### Accent Y Placement
- **Circle group Y:** 1.397 (Ultra scene.children[21].position.y)
- **Butterfly group Y:** 1.363
- Mesh positions from position arrays are ADDED to group Y
- Our code: `mesh.position.set(pos[0], ACCENT_BASE_Y + pos[1], pos[2])` — correct

### Mount Type
- Post (p): po40d + po14 visible, hinges at x=±1.823
- Direct (d): posts hidden, caps hidden, hinges at x=±1.778

### Puppy Picket Types
| Name | pupid | pfinid | Rail Y |
|------|-------|--------|--------|
| Flush | pupfl | "" | bY+0.4064 |
| Standard | pupst | "" | bY+0.3048 |
| Classic Plugged | pupcl | pfp | bY+0.1905 |
| Classic Spear | pupcl | pfs | bY+0.1905 |
| Classic Tri | pupcl | pft | bY+0.1905 |
| Classic Quad | pupcl | pfq | bY+0.1905 |
| + staggered variants (pfps, pfss, pfts, pfqs) |

---

## Thumbnail Image Reference

All in `gate_tool/th/`:
- **Styles:** th_st_uaf_200.jpg through th_st_uas_150.jpg (7 styles)
- **Puppy Pickets:** th_pup_std.jpg through th_pup_trs.jpg (10 variants)
- **Post Caps:** th_pstcp_flat.jpg, th_pstcp_ball.jpg
- **Finials:** th_pc_spe.jpg, th_pc_tri.jpg, th_pc_qua.jpg, th_pc_plg.jpg
- **Mount/Leaf:** th_so_sngpl.jpg, th_so_sngpo.jpg, th_so_dblpl.jpg, th_so_dblpo.jpg
- **Arch:** th_so_ares.jpg, th_so_arar.jpg, th_so_arrv.jpg, th_so_arst.jpg
- **Accents:** th_acc_cir.jpg, th_acc_but.jpg, th_acc_scr.jpg, th_acc_bcr.jpg, th_acc_bbu.jpg
- **Options:** th_ft_mdr.jpg, th_ft_res.jpg, th_ft_ufr.jpg

---

## Critical Rules

1. **Ultra is the source of truth.** Every rendering value must trace back to `ultra_dsg_min.js` via `SPATIAL_TRUTH.json`.
2. **Use Playwright to validate** — scrape Ultra's live runtime values, don't guess.
3. **One fix = one commit.**
4. **Branding:** "ProCoat (powder coat finish)" — never "Powercoat™". No Ultra branding in UI.
5. **Colors:** Black, Satin Black, Bronze, Satin Bronze, Beige, Satin Khaki, White, Satin White, Forest Green (Silver).
6. **Do NOT modify** `gate_tool/js/ultra_dsg_min.js`.

## Commit Message Format
```
fix(BUG-N): short description
feat: short description for new features
chore: dependency or config changes
```
