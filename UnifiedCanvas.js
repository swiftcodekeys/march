import React, { useEffect, useRef } from 'react';

// ============================================================
// Legacy unit constants — inches to Three.js scene units
// ============================================================
const U = {
    _1: 0.025, _1_5: 0.037, _2: 0.0508, _2_5: 0.0635,
    _3_625: 0.092, _4_125: 0.105, _5: 0.127, _6: 0.152,
    _6_125: 0.155, _7_5: 0.1905, _12: 0.3048, _13_5: 0.343,
    _14_5: 0.3683, _16: 0.4064, _18: 0.457, _20: 0.508,
    _24: 0.610, _48: 1.219, _60: 1.524, _72: 1.829,
};

// htY = how far top components rise; tY = picket-top slide offset
const HEIGHT_DATA = {
    '36': { tY: -1.219, htY: 0.914 },
    '48': { tY: -0.915, htY: U._48 },
    '54': { tY: -0.762, htY: 1.372 },
    '60': { tY: -0.610, htY: U._60 },
    '72': { tY: -0.305, htY: U._72 },
};

const HINGES = [
    { xS: -1.823, xD: -1.778, z: 0, r: -90 },
    { xS: 1.823, xD: 1.778, z: 0, r: 90 },
    { xS: -1.823, xD: -1.778, z: 0, r: -90 },
    { xS: 1.823, xD: 1.778, z: 0, r: 90 },
];

const PC_POS = [
    { xS: -1.873, xD: -1.829 },
    { xS: 1.873, xD: 1.829 },
    { xS: -1.689, xD: -1.645 },
    { xS: 1.689, xD: 1.645 },
    { xS: -1.828, xD: -0.044 },
    { xS: 1.828, xD: 0.044 },
];

// ============================================================
// Legacy Y-position math from ultra_dsg_minbak.js movY()/viz()
// ============================================================
function calcPositions(config) {
    const ht = config.height || '60';
    const styleId = config.styleId || 'uaf_200';
    const acc = config.accessories || {};

    const hd = HEIGHT_DATA[ht] || HEIGHT_DATA['60'];
    const htY = hd.htY;
    const tY = hd.tY;
    const rH = -0.035;
    const pcY = -0.015;
    const midY = U._12;
    const fsv = (styleId === 'uaf_250') ? -0.152 : 0;
    const f250v = (styleId === 'uaf_250') ? 0.205 : 0;

    let bY = U._6_125;
    if (acc.res) bY = U._2;
    if (acc.ufr) bY += U._2_5;

    const r0y = Math.round((htY + rH + fsv) * 1000) / 1000;

    let r1y;
    if (acc.tcr) {
        r1y = Math.round((htY - U._7_5 + rH + fsv + U._2_5) * 1000) / 1000;
    } else {
        r1y = Math.round((htY - U._7_5 + rH + fsv) * 1000) / 1000;
    }

    const r4y = Math.round(bY * 1000) / 1000;
    const r3y = Math.round((bY + (acc.bcr ? U._5 : U._7_5)) * 1000) / 1000;
    const r2y = Math.round(((r1y + r4y) / 2) * 1000) / 1000;

    const pteY = tY + U._12 + fsv;

    const hngTopY = htY - 0.15;
    const hngBotY = 0.225;

    const pcTopY = htY + pcY + U._2_5;
    const pcCenterY = htY + midY + pcY + U._2_5;

    // Post clipping plane: legacy cpY(pob124Cp, htY + _2_5)
    const postClipY = htY + U._2_5;

    const finY = htY + 0.06 + fsv - f250v;

    const actY = htY + rH - U._3_625 + fsv;
    const acbY = bY - rH;

    return { r0y, r1y, r2y, r3y, r4y, pteY, hngTopY, hngBotY, pcTopY, pcCenterY, postClipY, finY, actY, acbY };
}


const UnifiedCanvas = ({ config }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const groupsRef = useRef(null);
    const clipPlaneRef = useRef(null);

    // ============================================================
    // SCENE INIT — runs once
    // ============================================================
    useEffect(() => {
        const THREE = window.THREE;
        if (!THREE) return;

        const mount = mountRef.current;
        const width = mount.clientWidth;
        const height = mount.clientHeight;

        console.log('=== SCENE INIT ===');
        console.log('  mount size:', width, 'x', height);

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Camera — legacy values
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.zoom = 1.788;
        camera.rotation.order = 'YXZ';
        camera.position.set(0.82, 1.27, 7.2);
        camera.rotation.y = (6 * Math.PI) / 180;
        camera.rotation.x = 0;
        camera.rotation.z = 0;
        camera.updateProjectionMatrix();
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.display = 'block';

        // Enable clipping planes for post height control
        renderer.localClippingEnabled = true;
        console.log('  localClippingEnabled:', renderer.localClippingEnabled);

        rendererRef.current = renderer;
        mount.appendChild(renderer.domElement);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 1.0));

        // Post clipping plane: clips everything above Y = constant
        // Plane normal (0,-1,0) means: keep fragments where -Y + constant >= 0, i.e. Y <= constant
        var clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.5875);
        clipPlaneRef.current = clipPlane;

        // Groups
        const groups = {
            grrt: new THREE.Object3D(),
            grrb: new THREE.Object3D(),
            grpte: new THREE.Object3D(),
            grpbe: new THREE.Object3D(),
            posts: new THREE.Object3D(),
            hngs: new THREE.Object3D(),
            grpc: new THREE.Object3D(),
            grufr: new THREE.Object3D(),
            grfin: new THREE.Object3D(),
            gracc: new THREE.Object3D(),
        };
        Object.values(groups).forEach(g => scene.add(g));
        groupsRef.current = groups;

        // Render loop
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Resize — use mount div's actual dimensions
        const handleResize = () => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            if (w === 0 || h === 0) return;
            camera.aspect = w / h;
            camera.zoom = 1.788;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mount && renderer.domElement) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, []);

    // ============================================================
    // GATE ASSEMBLY — rebuild on every config change
    // ============================================================
    useEffect(() => {
        const THREE = window.THREE;
        const groups = groupsRef.current;
        const clipPlane = clipPlaneRef.current;
        if (!THREE || !groups || !clipPlane) return;

        // Clear all groups
        Object.values(groups).forEach(g => {
            while (g.children.length > 0) g.remove(g.children[0]);
        });

        if (!config) return;

        // ---- Positions ----
        const pos = calcPositions(config);

        // Update the post clipping plane
        clipPlane.constant = pos.postClipY;
        console.log('=== ASSEMBLY ===');
        console.log('  height:', config.height, '→ postClipY:', pos.postClipY);
        console.log('  r0y:', pos.r0y, 'r1y:', pos.r1y, 'r4y:', pos.r4y);

        // ---- Material ----
        const color = config.color || { threeHex: 0x080808, metalness: 0.2, roughness: 0.2 };
        const makeMat = () => new THREE.MeshStandardMaterial({
            color: color.threeHex,
            roughness: color.roughness,
            metalness: color.metalness,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
        });

        // Post material — WITH clipping plane to slice top off
        const makePostMat = () => new THREE.MeshStandardMaterial({
            color: color.threeHex,
            roughness: color.roughness,
            metalness: color.metalness,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            clippingPlanes: [clipPlane],
            clipShadows: false,
        });

        const loader = new THREE.JSONLoader();
        const base = 'gate_tool/m/';

        const leafNum = config.leaf || '2';
        const archId = config.arch || 'e';
        const postId = config.post || 'po14';
        const isDouble = leafNum === '2';

        const rtI = 'rt' + leafNum + archId;
        const rbI = 'rb' + leafNum;
        const pteI = 'pt' + leafNum + archId + 'e';
        const pbeI = 'pb' + leafNum + 'e';

        // POST — one mesh at origin, geometry has both L+R posts baked in.
        // Clipping plane slices the top at htY + _2_5.
        loader.load(base + '0/' + postId + '.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, makePostMat());
            groups.posts.add(mesh);
        });

        // TOP RAILS
        loader.load(base + '1/' + rtI + '.json', function (geometry) {
            var mat = makeMat();
            var r0 = new THREE.Mesh(geometry, mat);
            var r1 = r0.clone();
            r1.material = mat.clone();
            r0.position.setY(pos.r0y);
            r1.position.setY(pos.r1y);
            groups.grrt.add(r0);
            groups.grrt.add(r1);
        });

        // BOTTOM RAILS
        loader.load(base + '1/' + rbI + '.json', function (geometry) {
            var mat = makeMat();
            var r4 = new THREE.Mesh(geometry, mat);
            var r3 = r4.clone(); r3.material = mat.clone();
            var r2 = r4.clone(); r2.material = mat.clone();
            r4.position.setY(pos.r4y);
            r3.position.setY(pos.r3y);
            r2.position.setY(pos.r2y);
            groups.grrb.add(r4);
            groups.grrb.add(r3);
            groups.grrb.add(r2);
        });

        // PICKET TOPS
        loader.load(base + '2/' + pteI + '.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, makeMat());
            mesh.position.setY(pos.pteY);
            groups.grpte.add(mesh);
        });

        // PICKET BOTTOMS
        loader.load(base + '2/' + pbeI + '.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, makeMat());
            groups.grpbe.add(mesh);
        });

        // HINGES
        loader.load(base + '3/hng.json', function (geometry) {
            for (var i = 0; i < 4; i++) {
                var hng = new THREE.Mesh(geometry, makeMat());
                var xPos = isDouble ? HINGES[i].xD : HINGES[i].xS;
                var yPos = (i < 2) ? pos.hngTopY : pos.hngBotY;
                hng.position.set(xPos, yPos, HINGES[i].z);
                hng.rotation.y = (HINGES[i].r * Math.PI) / 180;
                groups.hngs.add(hng);
            }
        });

        // POST CAPS
        if (config.postCap) {
            loader.load(base + '3/' + config.postCap + '.json', function (geometry) {
                for (var i = 0; i < 6; i++) {
                    var pc = new THREE.Mesh(geometry, makeMat());
                    var xPos = isDouble ? PC_POS[i].xD : PC_POS[i].xS;
                    var yPos = (i < 4) ? pos.pcTopY : pos.pcCenterY;
                    pc.position.set(xPos, yPos, 0);
                    if (i === 0 || i === 1) {
                        pc.scale.set(1.545, 1.545, 1.545);
                    }
                    groups.grpc.add(pc);
                }
            });
        }

        // UPPER FILLER RAIL
        if (config.accessories && config.accessories.ufr) {
            loader.load(base + '3/ufr' + leafNum + '.json', function (geometry) {
                var mesh = new THREE.Mesh(geometry, makeMat());
                groups.grufr.add(mesh);
            });
        }

        // FINIALS
        if (config.finial) {
            loader.load(base + '3/' + config.finial + '.json', function (geometry) {
                var mesh = new THREE.Mesh(geometry, makeMat());
                mesh.position.setY(pos.finY);
                groups.grfin.add(mesh);
            });
        }

        // ACCESSORIES
        if (config.accessories) {
            if (config.accessories.tcr || config.accessories.scr || config.accessories.bcr) {
                loader.load(base + '3/acs.json', function (geometry) {
                    var mesh = new THREE.Mesh(geometry, makeMat());
                    if (config.accessories.tcr) mesh.position.setY(pos.actY);
                    else if (config.accessories.bcr) mesh.position.setY(pos.acbY);
                    groups.gracc.add(mesh);
                });
            }
            if (config.accessories.tbu || config.accessories.bbu) {
                loader.load(base + '3/acb.json', function (geometry) {
                    var mesh = new THREE.Mesh(geometry, makeMat());
                    if (config.accessories.tbu) mesh.position.setY(pos.actY);
                    else if (config.accessories.bbu) mesh.position.setY(pos.acbY);
                    groups.gracc.add(mesh);
                });
            }
        }

    }, [config]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundColor: '#0b1220',
        }}>
            <img
                src="assets/backgrounds/tool-background-gate_1960x1096.png"
                alt=""
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center bottom',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            />
            <div ref={mountRef} style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
            }} />
        </div>
    );
};

export default UnifiedCanvas;
