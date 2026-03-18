# Grandview Design Studio — CLAUDE.md

## Working Directory
```
C:\Users\sarah\Desktop\App Repos\Testing-VS code\designstudio\designstudio\designstudioworkingmvp
```
Also on GitHub: https://github.com/swiftcodekeys/march

**This is the ONLY repo to work in.** Do NOT use `grandview_design_studio_gates` or `Downloads/.../designstudioworkingmvp`.

---

## Architecture
- **Vanilla JS + HTML** app (NOT React/Webpack — ignore any README that says otherwise)
- `app.js` — main entry point, state management, 2D fence renderer
- `GateRenderer.js` — Pure Three.js gate renderer (no React), uses legacy Three.js r86
- `gate_tool/js/ultra_dsg_min.js` — Ultra's obfuscated gate engine (SOURCE OF TRUTH for all rendering math)
- `gate_tool/js/ultra_dsg_minbak.js` — backup of Ultra source (do not modify)
- `SPATIAL_TRUTH.json` — verified constants extracted from ultra_dsg_min.js (see below)
- `spatialConstants.js` — extraction-verified Matrix4 transforms from Ultra's live tool
- `configData.js` — all product configuration, style definitions, feature gating
- `gate_tool/` — Ultra assets: 3D models (`m/`), textures (`t/`), thumbnails (`th/`)
- Build: static files served via `serve.ps1` or any local HTTP server

---

## MANDATORY VERIFICATION RULE — READ THIS FIRST

**Before making ANY change to rendering code:**

1. Find the relevant value in `SPATIAL_TRUTH.json`
2. Confirm it matches `gate_tool/js/ultra_dsg_min.js`
3. Confirm what the Ultra live tool shows at https://www.ultrafence.com/design-studio/gates/index.html
4. Only then write the change

**Never change a number based on visual intuition or "seems right" reasoning.**
**Never make a change and then verify — verify FIRST, then change.**
**One fix = one commit. Never batch unrelated changes.**

If steps 1-3 don't all agree — STOP and report the discrepancy. Do not guess.

---

## SPATIAL_TRUTH.json — Source of Truth

`SPATIAL_TRUTH.json` in the repo root is the single verified reference for all spatial constants.
It was extracted from `ultra_dsg_min.js` and covers:
- Camera parameters
- Height Y offsets (48"/60"/72")
- Style fsv offsets (flat=0, spear=-0.152)
- Pro spacing rules (xtr visibility)
- Clipping plane normals and constants
- Rail Y positions (r0–r4)
- Post cap positions (including center seam ±0.044)
- Hinge positions
- po23 center stile behavior
- Finial Y offsets by arch
- Finial position array variable names
- All style definitions (gN, stlI, modI, pi, fin, xtr, fsv)

**Do NOT edit SPATIAL_TRUTH.json without re-verifying against ultra_dsg_min.js.**

---

## Critical Rules

1. **Ultra is the source of truth.** Every rendering value must trace back to `ultra_dsg_min.js` via `SPATIAL_TRUTH.json`.
2. **Never make random changes.** If something doesn't look right, look it up in SPATIAL_TRUTH.json first.
3. **One fix = one commit.** Don't batch unrelated changes.
4. **Branding:** "ProCoat (powder coat finish)" — never "Powercoat™". Never use Ultra branding in UI.
5. **Colors:** Black, Satin Black, Bronze, Satin Bronze, Beige, Satin Khaki, White, Satin White, Forest Green.
6. **Do NOT modify** `gate_tool/js/ultra_dsg_min.js` or `gate_tool/js/ultra_dsg_minbak.js`.

---

## Ultra Source of Truth

Obfuscated Ultra gate code at `gate_tool/js/ultra_dsg_min.js`. Key verified facts:

### Res/Pro Spacing — VERIFIED, FIXED in commit a2e525b
- `xtr` controls extra pickets: `if(stlArr[gN].pi == '201' || stlArr[gN].pi == '101'){ xtr = true; }`
- Extra picket groups (`grptx`/`grpbx`) always loaded but only visible when `xtr==true`
- Pro spacing styles: UAF-201 (Horizon Pro) and UAS-101 (Charleston Pro)
- Fix: `mesh.visible = isProSpacing`

### po23 Center Gap — CRITICAL, NOT YET FIXED (BUG-1)
- **The gap is baked into the po23.json model geometry for double leaf**
- Ultra does NOT vertex-shift po23 in code
- The CENTER_GAP vertex manipulation in GateRenderer.js is WRONG and must be removed
- Fix: remove the `if (isDoubleLeaf && CENTER_GAP > 0)` vertex shift block entirely

### Center Seam Post Caps — NOT YET FIXED (BUG-2)
- pc4 and pc5 (center seam caps) must be at exactly x = ±0.044
- CENTER_GAP must NOT be applied to pc4/pc5 X positions
- Arch-aware Y adjustment IS correct and should stay

### Pro Spacing Y Position — NOT YET FIXED (BUG-3)
- `grptx` (ptRes in GateRenderer) needs its own Y offset, not lt.picketTop
- UAF-201 no accent: Y = `tY + 0.3048 + fsv - 0.1905`
- UAS-101 no accent: Y = `tY + 0.3048 + fsv`
- See SPATIAL_TRUTH.json → picket_y_positions → grptx_y_by_style

### Finials — Fixed in commit d7289c8, NEEDS VISUAL VERIFICATION
- Ultra uses global position arrays: `b{leaf}{arch}` for spear family, `f250_{leaf}{arch}` for Vanguard
- Positions are absolute XYZ, both sides included (no mirroring needed)
- Test: Charleston + Estate arch — finials should align with picket tops along the arch curve

### Camera Parameters — from Ultra scrape, VERIFIED
- PerspectiveCamera(40, w/h, 1, 100), zoom=1.788
- position(0.82, 1.27, 7.2), rotation.y=6°, rotation.order="YXZ"

### Clipping Planes — CRITICAL, from SPATIAL_TRUTH.json
- Post clips: normalized normal (0, -1, 0) — Ultra does the same
- Picket clips: NON-normalized normals (0, ±0.735, 0) — matching Ultra exactly
- Three.js does NOT auto-normalize plane normals
- With |normal|=0.735 and constant=±0.735, effective clip is at y=1.0
- DO NOT normalize these normals — it would change the clip position

### Height Y-Offsets — VERIFIED
- 48" = tY -0.915, 60" = tY -0.610, 72" = tY -0.305
- Uses clipping planes (`renderer.localClippingEnabled = true`)

### Color PBR Values — from Ultra source
| Color | Hex | Roughness | Metalness | Bump |
|-------|-----|-----------|-----------|------|
| Textured Khaki | 0xcdbeaf | 0.4 | 0.2 | 0.002 |
| Gloss Bronze | 0x42382c | 0.1 | 0.3 | 0.0001 |
| Textured Bronze | 0x42382c | 0.4 | 0.3 | 0.0015 |
| Gloss White | 0xF8F5F6 | 0.2 | 0.2 | 0.0001 |
| Textured White | 0xF8F5F6 | 0.2 | 0.1 | 0.002 |
| Gloss Black | 0x080808 | 0.2 | 0.2 | 0.0001 |
| Textured Black | 0x0c0c0c | 0.4 | 0.2 | 0.0015 |
| Silver | 0xFEF8F2 | 0.2 | 0.8 | 0.0002 |

---

## What's Been Done

1. ✅ Deep project decomposition into 3 splits with specs
2. ✅ Scraped all 3 Ultra design studio tools (fence, gates, fence-image) — data in `C:\Users\sarah\ultra_scrape_data.md`
3. ✅ Fixed res/pro spacing pickets — only visible for Pro styles (commit a2e525b)
4. ✅ Enabled 3D rendering for Horizon Pro and Charleston Pro
5. ✅ Fixed finial positions using Ultra's exact XYZ arrays (NEEDS VISUAL VERIFICATION)
6. ✅ Created SPATIAL_TRUTH.json — verified constant reference from ultra_dsg_min.js
7. ✅ Agreed on UI redesign direction: Option B (top tabs + bottom strip)

---

## What Needs To Be Done Next

### Immediate — Fix 3 Rendering Bugs (use CLAUDE_CODE_PROMPT.md)

1. **BUG-1: Charleston center gap** — remove CENTER_GAP vertex shift from po23 loader
2. **BUG-2: Horizon center seam post caps** — confirm x=±0.044, no CENTER_GAP push
3. **BUG-3: Pro spacing Y position** — ptRes needs own Y offset per SPATIAL_TRUTH grptx_y_by_style
4. **VERIFY finial fix** — Charleston + Estate arch, finials should align with picket tops

### After Rendering Is Correct

5. **Add leaf selector** to UI (single/double gate) — config already supports it
6. **Add mount type selector** — post mount vs direct mount, with thumbnails from `gate_tool/th/`
7. **Fix `res` (flush bottom)** — lower bottom rail Y from 0.155 to 0.0508 when enabled

### UI Redesign (Option B: Top Tabs + Bottom Strip)
- Switch from dark left sidebar to top tab navigation
- Tabs: Driveway Gates | Yard Fencing | Visualize My Home (coming soon) | Estimate My Project (coming soon)
- Use Ultra's thumbnail images from `gate_tool/th/` for all selectors
- Color swatches with prominent names
- Match Grandview website brand: clean, white/light blue, professional
- Website screenshots at `C:\Users\sarah\Desktop\webscreenshots\`
- Backlinks from tool to product pages on grandviewfence.com
- "Get Quote" button prefills contact form with configuration

### Phase 2 — Fence Tool
- Front/back yard fence overlays (2D overlay system already works)
- Fence-image mode (orthographic camera + user photo upload)

### Phase 3 — Advanced Features
- Google Maps property estimator
- Live quote calculator

---

## Thumbnail Image Reference

All in `gate_tool/th/`:
- **Styles:** th_st_uaf_200.jpg, th_st_uaf_201.jpg, th_st_uaf_250.jpg, th_st_uab_200.jpg, th_st_uas_100.jpg, th_st_uas_101.jpg, th_st_uas_150.jpg
- **Puppy Pickets:** th_pup_std.jpg, th_pup_fls.jpg, th_pup_plg.jpg, th_pup_pls.jpg, th_pup_qua.jpg, th_pup_qus.jpg, th_pup_spe.jpg, th_pup_sps.jpg, th_pup_tri.jpg, th_pup_trs.jpg
- **Post Caps:** th_pstcp_flat.jpg, th_pstcp_ball.jpg
- **Finials:** th_pc_spe.jpg, th_pc_tri.jpg, th_pc_qua.jpg, th_pc_plg.jpg
- **Mount/Leaf:** th_so_sngpl.jpg, th_so_sngpo.jpg, th_so_dblpl.jpg, th_so_dblpo.jpg
- **Arch:** th_so_ares.jpg, th_so_arar.jpg, th_so_arrv.jpg, th_so_arst.jpg
- **Accessories:** th_acc_cir.jpg, th_acc_but.jpg, th_acc_scr.jpg, th_acc_bcr.jpg, th_acc_bbu.jpg
- **Options:** th_ft_mdr.jpg (mid rail), th_ft_res.jpg (flush bottom), th_ft_ufr.jpg (upper finial rail)

---

## Commit Message Format

```
fix(BUG-1): short description of what was wrong and what was changed
fix(BUG-2): short description
feat: short description for new features
chore: dependency or config changes
```

Push after every commit: `git push`