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
    CLIP_POST, CLIP_PO23, CLIP_PT, CLIP_PB,
    CLIP_PB_PUPPY_STD, CLIP_PB_PUPPY_CLP,
    ACCENT_CIRCLE_Y, ACCENT_BUTTERFLY_Y,
    ACCENT_CIRCLE_BOTTOM_Y, ACCENT_BUTTERFLY_BOTTOM_Y,
    ACCENT_CIRCLE_X, ACCENT_BUTTERFLY_X,
    FINIAL_X_LEAF1, FINIAL_X_LEAF2,
    FINIAL_BASE_Y, FINIAL_ARCH_OFFSETS,
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
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
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
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(-5, 10, 5);
    this.scene.add(dirLight);

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

    // Start render loop
    var self = this;
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

    gate.traverse(function(child) {
        if (child.isMesh && child.material) {
            child.material.color.setHex(color.threeHex);
            if (color.metalness !== undefined) child.material.metalness = color.metalness;
            if (color.roughness !== undefined) child.material.roughness = color.roughness;
            child.material.needsUpdate = true;
        }
    });
};

// ============================================================
// buildGate — full scene rebuild
// ============================================================
GateRenderer.prototype.buildGate = function(config) {
    var THREE = window.THREE;
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

    // Arch-specific clipping (verified against legacy ultra_dsg_min.js)
    clips.post.constant = CLIP_POST;
    clips.post23.constant = CLIP_PO23[archId] || CLIP_PO23.e;

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
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
        });
    };

    var makeClipMat = function(plane) {
        return new THREE.MeshStandardMaterial({
            color: color.threeHex,
            roughness: color.roughness !== undefined ? color.roughness : 0.1,
            metalness: color.metalness !== undefined ? color.metalness : 0.9,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            clippingPlanes: [plane],
        });
    };

    var loader = new THREE.JSONLoader();

    // HINGES
    loader.load(getModelPath('hinge', config), function(geo) {
        M_HINGE.forEach(function(m) {
            var mesh = new THREE.Mesh(geo, makeMat());
            snap(mesh, m);
            gate.add(mesh);
        });
    });

    // STRUCTURAL FRAME
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

    // PO23 inner stiles — widen center gap for double-leaf gates
    loader.load(getModelPath('po23', config), function(geo) {
        var geoToUse = geo;
        if (isDoubleLeaf && CENTER_GAP > 0) {
            geoToUse = geo.clone();
            for (var i = 0; i < geoToUse.vertices.length; i++) {
                var v = geoToUse.vertices[i];
                if (v.x < 0) v.x -= CENTER_GAP;
                else if (v.x > 0) v.x += CENTER_GAP;
            }
            geoToUse.verticesNeedUpdate = true;
        }
        var mesh = new THREE.Mesh(geoToUse, makeClipMat(clips.post23));
        snap(mesh, M_IDENTITY);
        gate.add(mesh);
    });

    // POST CAPS
    if (config.postCap) {
        loader.load(getModelPath('postCap', config), function(geo) {
            M_CAPS.forEach(function(m, idx) {
                var mesh = new THREE.Mesh(geo, makeMat());
                // Inner caps (indices 4,5): base X stays ±0.044 (no CENTER_GAP push) + arch-aware Y
                // Ultra proof: seam caps at ±0.044 even with CENTER_GAP active on po23
                if (idx >= 4) {
                    var adjusted = m.slice();
                    adjusted[13] = CAP_INNER_Y[archId] || CAP_INNER_Y.s;
                    snap(mesh, adjusted);
                } else {
                    snap(mesh, m);
                }
                gate.add(mesh);
            });
        });
    }

    // TOP RAILS — per-leaf Y positions
    loader.load(getModelPath('railTop', config), function(geo) {
        [lt.railT0, lt.railT1].forEach(function(m) {
            var mesh = new THREE.Mesh(geo, makeMat());
            snap(mesh, m);
            gate.add(mesh);
        });
    });

    // BOTTOM RAILS — per-leaf Y positions
    loader.load(getModelPath('railBot', config), function(geo) {
        var meshB = new THREE.Mesh(geo, makeMat());
        snap(meshB, lt.railB2);
        gate.add(meshB);

        if (config.accessories && config.accessories.mdr) {
            var meshM = new THREE.Mesh(geo, makeMat());
            snap(meshM, lt.railB0);
            gate.add(meshM);
        }

        if (config.accessories && config.accessories.xlr) {
            var meshX = new THREE.Mesh(geo, makeMat());
            snap(meshX, lt.railB1);
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

    // PICKETS — per-leaf Y positions
    // Odd picket top: Vanguard (leaf=2 + hasFinials) staggers odd pickets lower
    var ptOddTransform = (hasFinials && lt.picketTopOddStagger) ? lt.picketTopOddStagger : lt.picketTop;

    // Even pickets
    loader.load(getModelPath('ptEven', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.pt));
        snap(mesh, lt.picketTop);
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

    // Res/extra pickets — Ultra loads these for ALL styles but only makes them
    // visible for Pro spacing styles (pi=201, pi=101). In Ultra's viz():
    //   if(stlArr[gN].pi == '201' || stlArr[gN].pi == '101'){ xtr = true; }
    //   if(xtr==true){ grptx.visible = true; grpbx.visible = true; }
    // pbRes uses separate clip plane for puppy support
    var isProSpacing = styleDef && (styleDef.code === 'UAF-201' || styleDef.code === 'UAS-101');
    loader.load(getModelPath('ptRes', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.pt));
        snap(mesh, lt.picketTop);
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

    // FINIALS — per-picket instancing with arch-following Y
    // Extraction-verified: leaf=1 gets 13/side at butterfly X spacing,
    // leaf=2 gets 7/side at every-other-picket spacing.
    // Y position = base Y + arch offset at each X position.
    if (config.finial && hasFinials) {
        var finialXPositions = (leaf === '1') ? FINIAL_X_LEAF1 : FINIAL_X_LEAF2;
        var finialBaseY = FINIAL_BASE_Y[leaf] || FINIAL_BASE_Y['2'];
        var archOffsets = FINIAL_ARCH_OFFSETS[archId] || FINIAL_ARCH_OFFSETS.s;

        loader.load(getModelPath('finial', config), function(geo) {
            finialXPositions.forEach(function(x, idx) {
                // For leaf=2, use every-other arch offset (indices 0,2,4,...,12)
                var offsetIdx = (leaf === '1') ? idx : idx * 2;
                var archY = (offsetIdx < archOffsets.length) ? archOffsets[offsetIdx] : 0;
                var y = finialBaseY + archY;
                // Place at +x and -x (both sides)
                var meshR = new THREE.Mesh(geo, makeMat());
                snap(meshR, [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,0,1]);
                gate.add(meshR);

                var meshL = new THREE.Mesh(geo, makeMat());
                snap(meshL, [1,0,0,0, 0,1,0,0, 0,0,1,0, -x,y,0,1]);
                gate.add(meshL);
            });
        });
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
        // CIRCLE (top) — 28 circle meshes (14/side), CIRCLE_X positions, Y=1.397
        // Verified: Ultra "Circle" accent, Standard arch, 292v model acc.json
        if (config.accessories.tcr) {
            loader.load(getModelPath('circle', config), function(geo) {
                ACCENT_CIRCLE_X.forEach(function(x) {
                    var mesh = new THREE.Mesh(geo, makeMat());
                    snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, x,ACCENT_CIRCLE_Y,0,1]);
                    gate.add(mesh);
                });
            });
        }
        // CIRCLES AT BASE — 28 circle meshes, CIRCLE_X positions, Y=0.19
        // Verified: Ultra "Circles at Base" accent
        if (config.accessories.bcr) {
            loader.load(getModelPath('circle', config), function(geo) {
                ACCENT_CIRCLE_X.forEach(function(x) {
                    var mesh = new THREE.Mesh(geo, makeMat());
                    snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, x,ACCENT_CIRCLE_BOTTOM_Y,0,1]);
                    gate.add(mesh);
                });
            });
        }
        // BUTTERFLY (top) — 26 butterfly meshes (13/side), BUTTERFLY_X positions, Y=1.363
        // Verified: Ultra "Butterfly" accent, Standard arch, 952v model acb.json
        if (config.accessories.tbu) {
            loader.load(getModelPath('butterfly', config), function(geo) {
                ACCENT_BUTTERFLY_X.forEach(function(x) {
                    var mesh = new THREE.Mesh(geo, makeMat());
                    snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, x,ACCENT_BUTTERFLY_Y,0,1]);
                    gate.add(mesh);
                });
            });
        }
        // BUTTERFLIES AT BASE — 26 butterfly meshes, BUTTERFLY_X positions, Y=0.2185
        // Verified: Ultra "Butterflies at Base" accent (Y differs from circles!)
        if (config.accessories.bbu) {
            loader.load(getModelPath('butterfly', config), function(geo) {
                ACCENT_BUTTERFLY_X.forEach(function(x) {
                    var mesh = new THREE.Mesh(geo, makeMat());
                    snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, x,ACCENT_BUTTERFLY_BOTTOM_Y,0,1]);
                    gate.add(mesh);
                });
            });
        }
    }
};

export default GateRenderer;
