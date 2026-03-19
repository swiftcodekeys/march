// ============================================================
// GateRenderer.js — Pure Three.js gate renderer (zero React)
// Extracted from UnifiedCanvas.js (Split 5)
//
// Usage:
//   var renderer = new GateRenderer(containerElement);
//   renderer.buildGate(config);
//   renderer.updateMaterials(config);  // fast color-only update
//   renderer.resize(width, height);
//   renderer.dispose();
// ============================================================

import {
    snap,
    M_HINGE, M_IDENTITY, M_CAPS, CAP_INNER_Y,
    LEAF_TRANSFORMS, M_RAIL_PUPPY,
    CENTER_GAP,
    CLIP_POST, CLIP_PO23, CLIP_PT, CLIP_PB, HEIGHT_CLIP_OFFSET, POST_CLIP_72,
    CLIP_PB_PUPPY_STD, CLIP_PB_PUPPY_CLP,
    ACCENT_CIRCLE_BOTTOM_Y, ACCENT_BUTTERFLY_BOTTOM_Y,
    ACCENT_POSITIONS, ACCENT_BASE_Y,
    FINIAL_POSITIONS, FINIAL_BASE_Y,
    PTRES_Y_UAF201,
    HAVEN_RAIL_T1,
    RES_BOTTOM_RAIL_Y,
} from './spatialConstants';
import { getModelPath, FENCE_STYLES } from './configData';

function GateRenderer(container) {
    var THREE = window.THREE;
    if (!THREE) throw new Error('THREE.js not found on window');

    this._container = container;
    this._animId = null;
    this._lastConfig = null;

    // Scene
    this.scene = new THREE.Scene();
    window._gateScene = this.scene;  // expose for regression testing

    // Camera — exact legacy values
    this.camera = new THREE.PerspectiveCamera(40, 1, 1, 100);
    this.camera.zoom = 1.788;
    this.camera.position.set(0.82, 1.27, 7.2);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.set(0, (6 * Math.PI) / 180, 0);
    this.camera.updateProjectionMatrix();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.style.display = 'block';
    this.renderer.localClippingEnabled = true;
    container.appendChild(this.renderer.domElement);

    // Lighting
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Clipping planes
    // CRITICAL: Post clips use normalized normals (0, -1, 0) — Ultra does the same.
    // Picket clips use NON-normalized normals (0, ±0.735, 0) — matching Ultra exactly.
    // Three.js does NOT auto-normalize plane normals, so the effective clip position
    // is constant/|normal|. With |normal|=0.735 and constant=0.735, clip is at y=1.0.
    // Using normalized (0,-1,0) with same constant would clip at y=0.735 — WRONG.
    this.clips = {
        post:   new THREE.Plane(new THREE.Vector3(0, -1, 0), CLIP_POST),
        post23: new THREE.Plane(new THREE.Vector3(0, -1, 0), CLIP_PO23.e),
        pt:     new THREE.Plane(new THREE.Vector3(0,  0.735, 0), CLIP_PT),
        pb:     new THREE.Plane(new THREE.Vector3(0, -0.735, 0), CLIP_PB),
        pbRes:  new THREE.Plane(new THREE.Vector3(0, -0.735, 0), CLIP_PB),  // separate for puppy
    };

    // Gate group
    this.gate = new THREE.Object3D();
    this.scene.add(this.gate);

    // Environment map — PMREM-processed HDR (matches Ultra exactly)
    this._envMap = null;
    this._bumpMap = null;
    var self = this;

    // Load HDR cube map
    // NOTE: r86 HDRCubeTextureLoader has NO .setPath() method — must use full paths.
    // Also, loadHDRData has a `this.manager` binding quirk (uses undefined, falls back
    // to DefaultLoadingManager) — this is expected and not a bug.
    var hdrPaths = [
        'gate_tool/t/hdr/px.hdr', 'gate_tool/t/hdr/nx.hdr',
        'gate_tool/t/hdr/py.hdr', 'gate_tool/t/hdr/ny.hdr',
        'gate_tool/t/hdr/pz.hdr', 'gate_tool/t/hdr/nz.hdr'
    ];
    if (THREE.HDRCubeTextureLoader) {
        new THREE.HDRCubeTextureLoader()
            .load(THREE.UnsignedByteType, hdrPaths, function(hdrCubeMap) {
                var pmremGenerator = new THREE.PMREMGenerator(hdrCubeMap);
                pmremGenerator.update(self.renderer);

                var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(pmremGenerator.cubeLods, pmremGenerator.numLods);
                pmremCubeUVPacker.update(self.renderer);

                self._envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;

                // Retroactively apply to existing materials
                if (self._lastConfig) {
                    self.updateMaterials(self._lastConfig);
                }

                // Clean up (r86: dispose may not exist on all objects)
                if (pmremGenerator.dispose) pmremGenerator.dispose();
                if (pmremCubeUVPacker.dispose) pmremCubeUVPacker.dispose();
            }, undefined, function(err) {
                // HDR failed — fall back to PNG cube map
                console.warn('HDR env map failed, falling back to PNG:', err);
                var loader = new THREE.CubeTextureLoader();
                loader.setPath('gate_tool/t/hdr/');
                loader.load(['px.png','nx.png','py.png','ny.png','pz.png','nz.png'], function(cubeMap) {
                    self._envMap = cubeMap;
                    if (self._lastConfig) {
                        self.updateMaterials(self._lastConfig);
                    }
                });
            });
    }

    // Load bump map (Ultra uses bm.jpg at 2048x2048, ClampToEdgeWrapping)
    var texLoader = new THREE.TextureLoader();
    texLoader.load('gate_tool/t/bm.jpg', function(texture) {
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        self._bumpMap = texture;

        // Retroactively apply to existing materials
        if (self._lastConfig) {
            self.updateMaterials(self._lastConfig);
        }
    });

    // Start render loop
    (function animate() {
        self._animId = requestAnimationFrame(animate);
        self.renderer.render(self.scene, self.camera);
    })();
}

GateRenderer.prototype.resize = function(w, h) {
    this.camera.aspect = w / h;
    this.camera.zoom = 1.788;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
};

GateRenderer.prototype.dispose = function() {
    if (this._animId) cancelAnimationFrame(this._animId);
    if (this._envMap) this._envMap.dispose();
    if (this._bumpMap) this._bumpMap.dispose();
    if (this._container && this.renderer.domElement) {
        this._container.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
};

// ============================================================
// updateMaterials — fast color-only update, no geometry reload
// ============================================================
GateRenderer.prototype.updateMaterials = function(config) {
    var THREE = window.THREE;
    var color = config.color || { threeHex: 0x080808, metalness: 0.9, roughness: 0.1 };
    var gate = this.gate;
    var self = this;

    gate.traverse(function(child) {
        if (child.isMesh && child.material) {
            child.material.color.setHex(color.threeHex);
            if (color.metalness !== undefined) child.material.metalness = color.metalness;
            if (color.roughness !== undefined) child.material.roughness = color.roughness;
            // Env map (may have loaded after initial buildGate)
            if (self._envMap) child.material.envMap = self._envMap;
            child.material.envMapIntensity = color.envMapIntensity || 1.0;
            // Bump map (may have loaded after initial buildGate)
            if (self._bumpMap) child.material.bumpMap = self._bumpMap;
            child.material.bumpScale = color.bumpScale || 0.0001;
            child.material.needsUpdate = true;
        }
    });
};

// ============================================================
// buildGate — full scene rebuild
// ============================================================
GateRenderer.prototype.buildGate = function(config) {
    var THREE = window.THREE;
    var self = this;
    var gate = this.gate;
    var clips = this.clips;

    // Clear existing meshes
    while (gate.children.length > 0) gate.remove(gate.children[0]);
    if (!config) return;

    this._lastConfig = config;
    var archId = config.arch || 'e';
    var leaf = config.leaf || '2';
    var isDoubleLeaf = (leaf === '2');

    // Per-leaf spatial transforms (extraction-verified from live Ultra)
    var lt = LEAF_TRANSFORMS[leaf] || LEAF_TRANSFORMS['2'];

    // Look up style metadata for finial/stagger decisions
    var styleDef = FENCE_STYLES.find(function(s) { return s.id === config.styleId; });
    var hasFinials = styleDef ? styleDef.hasFinials : false;

    // fsv: vertical offset for spear family (stlI='s1'). LEAF_TRANSFORMS were extracted
    // from flat family (fsv=0). Ultra applies fsv=-0.152 to ALL rail and picket Y positions
    // for spear styles. We apply it here so the base transforms stay untouched.
    var fsv = (styleDef && styleDef.category === 'spear') ? -0.152 : 0;

    // hOff: height offset. Ultra repositions the TOP of the gate (rails, caps, picket tops,
    // top hinges) by ±0.305m per height step while anchoring the bottom. The mid rail gets
    // half the offset. Bottom rails, bottom hinges, picket bottoms stay fixed.
    // Validated via Playwright scene extraction: 48" vs 60" vs 72" element positions.
    var hOff = HEIGHT_CLIP_OFFSET[config.height] || 0;

    // offsetY: apply both fsv and hOff to a Matrix4 Y position (index 13)
    function offsetY(m, fsvVal, heightVal) {
        var total = (fsvVal || 0) + (heightVal || 0);
        if (total === 0) return m;
        var out = m.slice();
        out[13] = out[13] + total;
        return out;
    }

    // Top rails: full fsv + full height offset
    var railT0    = offsetY(lt.railT0, fsv, hOff);
    var railT1    = offsetY(lt.railT1, fsv, hOff);
    // Mid rail: half fsv + half height offset (anchored between top and bottom)
    var railB0    = offsetY(lt.railB0, fsv / 2, hOff / 2);
    // Bottom rails: no fsv, no height offset (anchored at ground)
    var railB1    = lt.railB1;
    var railB2Raw = lt.railB2;
    var hasRes = config.accessories && config.accessories.res;
    var railB2    = hasRes ? RES_BOTTOM_RAIL_Y : railB2Raw;
    // Picket tops: full fsv + full height offset
    var picketTop = offsetY(lt.picketTop, fsv, hOff);
    var ptOddStagger = (lt.picketTopOddStagger) ? offsetY(lt.picketTopOddStagger, fsv, hOff) : null;

    // Dynamic height clipping (validated against Ultra live tool)
    clips.post.constant = CLIP_POST + hOff;
    if (config.height === '72') {
        clips.post23.constant = POST_CLIP_72;
    } else {
        clips.post23.constant = (CLIP_PO23[archId] || CLIP_PO23.e) + hOff;
    }

    // Puppy clip: tighten res picket bottom when puppy is active
    var hasPuppy = config.accessories && config.accessories.pup;
    if (hasPuppy) {
        clips.pbRes.constant = CLIP_PB_PUPPY_STD;
    } else {
        clips.pbRes.constant = CLIP_PB;
    }

    var color = config.color || { threeHex: 0x080808 };

    var makeMat = function() {
        return new THREE.MeshStandardMaterial({
            color: color.threeHex,
            roughness: color.roughness !== undefined ? color.roughness : 0.1,
            metalness: color.metalness !== undefined ? color.metalness : 0.9,
            envMap: self._envMap || null,
            envMapIntensity: color.envMapIntensity || 1.0,
            bumpMap: self._bumpMap || null,
            bumpScale: color.bumpScale || 0.0001,
            shading: THREE.FlatShading,
            side: THREE.FrontSide,
        });
    };

    var makeClipMat = function(plane) {
        return new THREE.MeshStandardMaterial({
            color: color.threeHex,
            roughness: color.roughness !== undefined ? color.roughness : 0.1,
            metalness: color.metalness !== undefined ? color.metalness : 0.9,
            envMap: self._envMap || null,
            envMapIntensity: color.envMapIntensity || 1.0,
            bumpMap: self._bumpMap || null,
            bumpScale: color.bumpScale || 0.0001,
            shading: THREE.FlatShading,
            side: THREE.FrontSide,
            clippingPlanes: [plane],
        });
    };

    var loader = new THREE.JSONLoader();

    // Mount type: 'p' = post mount (default), 'd' = direct mount (no posts/hinges/caps)
    var isPostMount = (config.mount !== 'd');

    // HINGES — only for post mount
    // Height offset: top hinges (indices 0, 1) move with height; bottom hinges (2, 3) stay fixed
    // Ultra validated: at 60" top hinges Y=1.374, at 48" Y=1.069 (diff=-0.305). Bottom always Y=0.225.
    if (isPostMount) {
        loader.load(getModelPath('hinge', config), function(geo) {
            M_HINGE.forEach(function(m, idx) {
                var mesh = new THREE.Mesh(geo, makeMat());
                var hingeM = (idx <= 1) ? offsetY(m, 0, hOff) : m;
                snap(mesh, hingeM);
                gate.add(mesh);
            });
        });
    }

    // STRUCTURAL FRAME — only for post mount
    if (isPostMount) {
        loader.load(getModelPath('po40d', config), function(geo) {
            var mesh = new THREE.Mesh(geo, makeClipMat(clips.post));
            snap(mesh, M_IDENTITY);
            gate.add(mesh);
        });
        loader.load(getModelPath('po14', config), function(geo) {
            var mesh = new THREE.Mesh(geo, makeClipMat(clips.post));
            snap(mesh, M_IDENTITY);
            gate.add(mesh);
        });
    }

    // PO23 inner stiles — gap is baked into po23.json model geometry (SPATIAL_TRUTH.json)
    // Ultra does NOT vertex-shift po23. Previous CENTER_GAP code was wrong and has been removed.
    loader.load(getModelPath('po23', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.post23));
        snap(mesh, M_IDENTITY);
        gate.add(mesh);
    });

    // POST CAPS — only for post mount
    // Height offset: ALL caps move with height (Ultra validated: outer caps 1.5725→1.2675 at 48")
    if (isPostMount && config.postCap) {
        loader.load(getModelPath('postCap', config), function(geo) {
            M_CAPS.forEach(function(m, idx) {
                var mesh = new THREE.Mesh(geo, makeMat());
                // Inner caps (indices 4,5): arch-aware Y from CAP_INNER_Y
                if (idx >= 4) {
                    var adjusted = m.slice();
                    adjusted[13] = (CAP_INNER_Y[archId] || CAP_INNER_Y.s) + hOff;
                    snap(mesh, adjusted);
                } else {
                    snap(mesh, offsetY(m, 0, hOff));
                }
                gate.add(mesh);
            });
        });
    }

    // TOP RAILS — per-leaf Y positions
    // Haven (UAB-200, gN==4): r1 rail sits at -0.07 offset (compressed top gap)
    // vs standard -0.1905 offset. SPATIAL_TRUTH.json → rails → r1_second_rail_y → haven_gN4
    var railT1Final = (styleDef && styleDef.code === 'UAB-200') ? offsetY(HAVEN_RAIL_T1, 0, hOff) : railT1;
    loader.load(getModelPath('railTop', config), function(geo) {
        [railT0, railT1Final].forEach(function(m) {
            var mesh = new THREE.Mesh(geo, makeMat());
            snap(mesh, m);
            gate.add(mesh);
        });
    });

    // BOTTOM RAILS — per-leaf Y positions (fsv-adjusted)
    loader.load(getModelPath('railBot', config), function(geo) {
        var meshB = new THREE.Mesh(geo, makeMat());
        snap(meshB, railB2);
        gate.add(meshB);

        if (config.accessories && config.accessories.mdr) {
            var meshM = new THREE.Mesh(geo, makeMat());
            snap(meshM, railB0);
            gate.add(meshM);
        }

        if (config.accessories && config.accessories.xlr) {
            var meshX = new THREE.Mesh(geo, makeMat());
            snap(meshX, railB1);
            gate.add(meshX);
        }

        // PUPPY RAIL — extraction truth: puppy_positions_standard.json
        // Adds a rail at Y=0.4598 to block the bottom gap
        if (hasPuppy) {
            var meshP = new THREE.Mesh(geo, makeMat());
            snap(meshP, M_RAIL_PUPPY);
            gate.add(meshP);
        }
    });

    // PICKETS — per-leaf Y positions (fsv-adjusted)
    // Odd picket top: only Vanguard (UAF-250) staggers odd pickets lower (f250v=0.205)
    var isVanguard = styleDef && styleDef.code === 'UAF-250';
    var ptOddTransform = (isVanguard && ptOddStagger) ? ptOddStagger : picketTop;

    // Even pickets
    loader.load(getModelPath('ptEven', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.pt));
        snap(mesh, picketTop);
        gate.add(mesh);
    });
    loader.load(getModelPath('pbEven', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.pb));
        snap(mesh, M_IDENTITY);
        gate.add(mesh);
    });

    // Odd pickets
    loader.load(getModelPath('ptOdd', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.pt));
        snap(mesh, ptOddTransform);
        gate.add(mesh);
    });
    loader.load(getModelPath('pbOdd', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.pb));
        snap(mesh, M_IDENTITY);
        gate.add(mesh);
    });

    // Res/extra pickets — visible only for Pro spacing (pi=201, pi=101).
    // ptRes Y position differs per style (SPATIAL_TRUTH.json → picket_y_positions → grptx_y_by_style):
    //   UAF-201: Y = tY + _12 + fsv - _7_5 = -0.4957 (lower, so tight spacing only below 2nd rail)
    //   UAS-101: Y = tY + _12 + fsv = lt.picketTop (same as normal pickets)
    // pbRes uses separate clip plane for puppy support.
    var isProSpacing = styleDef && (styleDef.code === 'UAF-201' || styleDef.code === 'UAS-101');
    // ptRes Y: UAF-201 uses PTRES_Y_UAF201 (needs height offset), UAS-101 uses picketTop (already offset above)
    var ptResTransform = (styleDef && styleDef.code === 'UAF-201') ? offsetY(PTRES_Y_UAF201, 0, hOff) : picketTop;
    loader.load(getModelPath('ptRes', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.pt));
        snap(mesh, ptResTransform);
        mesh.visible = isProSpacing;
        gate.add(mesh);
    });
    loader.load(getModelPath('pbRes', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.pbRes));
        snap(mesh, M_IDENTITY);
        mesh.visible = isProSpacing;
        gate.add(mesh);
    });

    // UPPER FILLER RAIL
    if (config.accessories && config.accessories.ufr) {
        loader.load(getModelPath('ufr', config), function(geo) {
            var mesh = new THREE.Mesh(geo, makeMat());
            snap(mesh, M_IDENTITY);
            gate.add(mesh);
        });
    }

    // FINIALS — exact positions from Ultra's global position arrays.
    // Ultra uses absolute XYZ positions per leaf+arch combo (both sides included).
    // Category determines which lookup table: spear family uses 'b' prefix,
    // Vanguard (flat w/ spears, mod=250) uses 'f250' prefix.
    if (config.finial && hasFinials) {
        // Ultra's dfin(): stg → 'st'+lfI+arI, modI=='250' → 'f250_'+lfI+arI, else → 'b'+lfI+arI
        var finCategory = styleDef.isStaggered ? 'staggered' :
                          (styleDef.category === 'spear') ? 'spear' : 'flat';
        var finLeafPositions = FINIAL_POSITIONS[finCategory] && FINIAL_POSITIONS[finCategory][leaf];
        var finPositions = finLeafPositions && finLeafPositions[archId];
        var finBaseY = FINIAL_BASE_Y[finCategory] || 1.412;

        if (finPositions) {
            loader.load(getModelPath('finial', config), function(geo) {
                finPositions.forEach(function(pos) {
                    var mesh = new THREE.Mesh(geo, makeMat());
                    snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, pos[0], finBaseY + pos[1], pos[2], 1]);
                    gate.add(mesh);
                });
            });
        }
    }

    // ACCESSORIES
    if (config.accessories) {
        // SCROLL — 2 meshes at ±0.844, Y=0.727 (verified: Ultra "Scroll" accent)
        if (config.accessories.scr) {
            loader.load(getModelPath('scroll', config), function(geo) {
                [[-0.844, 0.727], [0.844, 0.727]].forEach(function(pos) {
                    var mesh = new THREE.Mesh(geo, makeMat());
                    snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, pos[0],pos[1],0,1]);
                    gate.add(mesh);
                });
            });
        }
        // CIRCLE (top) — position arrays from Ultra, per leaf+arch
        // Ultra uses mesh.position.set(x, baseY + pos[1], z) for each accent
        if (config.accessories.tcr) {
            var circlePositions = ACCENT_POSITIONS.circle[leaf] && ACCENT_POSITIONS.circle[leaf][archId];
            if (circlePositions) {
                loader.load(getModelPath('circle', config), function(geo) {
                    circlePositions.forEach(function(pos) {
                        var mesh = new THREE.Mesh(geo, makeMat());
                        mesh.position.set(pos[0], ACCENT_BASE_Y.circle + pos[1], pos[2]);
                        gate.add(mesh);
                    });
                });
            }
        }
        // CIRCLES AT BASE — uses same position arrays but at bottom Y
        // (base accents don't have separate Ultra position arrays yet, so use circle positions with bottom Y)
        if (config.accessories.bcr) {
            var circleBasePositions = ACCENT_POSITIONS.circle[leaf] && ACCENT_POSITIONS.circle[leaf][archId];
            if (circleBasePositions) {
                loader.load(getModelPath('circle', config), function(geo) {
                    circleBasePositions.forEach(function(pos) {
                        var mesh = new THREE.Mesh(geo, makeMat());
                        mesh.position.set(pos[0], ACCENT_CIRCLE_BOTTOM_Y, pos[2]);
                        gate.add(mesh);
                    });
                });
            }
        }
        // BUTTERFLY (top) — position arrays from Ultra, per leaf+arch
        if (config.accessories.tbu) {
            var butterflyPositions = ACCENT_POSITIONS.butterfly[leaf] && ACCENT_POSITIONS.butterfly[leaf][archId];
            if (butterflyPositions) {
                loader.load(getModelPath('butterfly', config), function(geo) {
                    butterflyPositions.forEach(function(pos) {
                        var mesh = new THREE.Mesh(geo, makeMat());
                        mesh.position.set(pos[0], ACCENT_BASE_Y.butterfly + pos[1], pos[2]);
                        gate.add(mesh);
                    });
                });
            }
        }
        // BUTTERFLIES AT BASE — uses butterfly position arrays with bottom Y
        if (config.accessories.bbu) {
            var butterflyBasePositions = ACCENT_POSITIONS.butterfly[leaf] && ACCENT_POSITIONS.butterfly[leaf][archId];
            if (butterflyBasePositions) {
                loader.load(getModelPath('butterfly', config), function(geo) {
                    butterflyBasePositions.forEach(function(pos) {
                        var mesh = new THREE.Mesh(geo, makeMat());
                        mesh.position.set(pos[0], ACCENT_BUTTERFLY_BOTTOM_Y, pos[2]);
                        gate.add(mesh);
                    });
                });
            }
        }
    }
};

export default GateRenderer;
