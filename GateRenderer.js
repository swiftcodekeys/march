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
    M_RAIL_T0, M_RAIL_T1, M_RAIL_B0, M_RAIL_B1, M_RAIL_B2,
    M_PICKET_TOP, CENTER_GAP,
    CLIP_POST, CLIP_PO23, CLIP_PT, CLIP_PB,
} from './spatialConstants';
import { getModelPath } from './configData';

function GateRenderer(container) {
    var THREE = window.THREE;
    if (!THREE) throw new Error('THREE.js not found on window');

    this._container = container;
    this._animId = null;
    this._lastConfig = null;

    // Scene
    this.scene = new THREE.Scene();

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
    this.clips = {
        post:   new THREE.Plane(new THREE.Vector3(0, -1, 0), CLIP_POST),
        post23: new THREE.Plane(new THREE.Vector3(0, -1, 0), CLIP_PO23.e),
        pt:     new THREE.Plane(new THREE.Vector3(0,  1, 0), CLIP_PT),
        pb:     new THREE.Plane(new THREE.Vector3(0, -1, 0), CLIP_PB),
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
    var isDoubleLeaf = (config.leaf === '2');

    // Arch-specific clipping (verified against legacy ultra_dsg_min.js)
    clips.post.constant = CLIP_POST;
    clips.post23.constant = CLIP_PO23[archId] || CLIP_PO23.e;

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

    // TOP RAILS
    loader.load(getModelPath('railTop', config), function(geo) {
        [M_RAIL_T0, M_RAIL_T1].forEach(function(m) {
            var mesh = new THREE.Mesh(geo, makeMat());
            snap(mesh, m);
            gate.add(mesh);
        });
    });

    // BOTTOM RAILS
    loader.load(getModelPath('railBot', config), function(geo) {
        var meshB = new THREE.Mesh(geo, makeMat());
        snap(meshB, M_RAIL_B2);
        gate.add(meshB);

        if (config.accessories && config.accessories.mdr) {
            var meshM = new THREE.Mesh(geo, makeMat());
            snap(meshM, M_RAIL_B0);
            gate.add(meshM);
        }

        if (config.accessories && config.accessories.xlr) {
            var meshX = new THREE.Mesh(geo, makeMat());
            snap(meshX, M_RAIL_B1);
            gate.add(meshX);
        }

        // PUPPY — fake rail removed. Ultra uses clipping planes, not a mesh.
        // Puppy clipping implementation is deferred (not in this batch).
    });

    // PICKETS — even
    loader.load(getModelPath('ptEven', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.pt));
        snap(mesh, M_PICKET_TOP);
        gate.add(mesh);
    });
    loader.load(getModelPath('pbEven', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.pb));
        snap(mesh, M_IDENTITY);
        gate.add(mesh);
    });

    // PICKETS — odd
    loader.load(getModelPath('ptOdd', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.pt));
        snap(mesh, M_PICKET_TOP);
        gate.add(mesh);
    });
    loader.load(getModelPath('pbOdd', config), function(geo) {
        var mesh = new THREE.Mesh(geo, makeClipMat(clips.pb));
        snap(mesh, M_IDENTITY);
        gate.add(mesh);
    });

    // PICKETS — residential spacing
    if (config.accessories && config.accessories.res) {
        loader.load(getModelPath('ptRes', config), function(geo) {
            var mesh = new THREE.Mesh(geo, makeClipMat(clips.pt));
            snap(mesh, M_PICKET_TOP);
            gate.add(mesh);
        });
        loader.load(getModelPath('pbRes', config), function(geo) {
            var mesh = new THREE.Mesh(geo, makeClipMat(clips.pb));
            snap(mesh, M_IDENTITY);
            gate.add(mesh);
        });
    }

    // UPPER FILLER RAIL
    if (config.accessories && config.accessories.ufr) {
        loader.load(getModelPath('ufr', config), function(geo) {
            var mesh = new THREE.Mesh(geo, makeMat());
            snap(mesh, M_IDENTITY);
            gate.add(mesh);
        });
    }

    // FINIALS
    if (config.finial) {
        loader.load(getModelPath('finial', config), function(geo) {
            var mesh = new THREE.Mesh(geo, makeMat());
            snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.584,0,1]);
            gate.add(mesh);
        });
    }

    // ACCESSORIES
    if (config.accessories) {
        // SCROLL — extraction truth: accent_positions_scroll.json
        if (config.accessories.scr) {
            loader.load(getModelPath('scroll', config), function(geo) {
                [[-0.844, 0.727], [0.844, 0.727]].forEach(function(pos) {
                    var mesh = new THREE.Mesh(geo, makeMat());
                    snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, pos[0],pos[1],0,1]);
                    gate.add(mesh);
                });
            });
        }
        // TOP SCROLL — single accent at top rail height
        if (config.accessories.tcr) {
            loader.load(getModelPath('scroll', config), function(geo) {
                var mesh = new THREE.Mesh(geo, makeMat());
                snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.397,0,1]);
                gate.add(mesh);
            });
        }
        // BOTTOM SCROLL — single accent at bottom rail height
        if (config.accessories.bcr) {
            loader.load(getModelPath('scroll', config), function(geo) {
                var mesh = new THREE.Mesh(geo, makeMat());
                snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.19,0,1]);
                gate.add(mesh);
            });
        }
        // TOP BUTTERFLY — single accent at top rail height
        if (config.accessories.tbu) {
            loader.load(getModelPath('butterfly', config), function(geo) {
                var mesh = new THREE.Mesh(geo, makeMat());
                snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.397,0,1]);
                gate.add(mesh);
            });
        }
        // BOTTOM BUTTERFLY — single accent at bottom rail height
        if (config.accessories.bbu) {
            loader.load(getModelPath('butterfly', config), function(geo) {
                var mesh = new THREE.Mesh(geo, makeMat());
                snap(mesh, [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.19,0,1]);
                gate.add(mesh);
            });
        }
    }
};

export default GateRenderer;
