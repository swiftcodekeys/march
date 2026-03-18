import React, { useEffect, useRef } from 'react';
import { fitContainBox } from './spatialConstants';
import GateRenderer from './GateRenderer';
import { FENCE_STYLES, getStyleRenderMode } from './configData';

// ============================================================
// PreviewPlaceholder — shown when renderMode === 'preview'
// ============================================================
var PreviewPlaceholder = function(props) {
    var styleName = props.styleName || 'This style';
    return React.createElement('div', {
        style: {
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#0b1220',
            color: '#667788',
            fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        }
    },
        React.createElement('div', {
            style: { fontSize: 48, marginBottom: 16, opacity: 0.4 }
        }, '\u25A8'),
        React.createElement('p', {
            style: { fontSize: 16, fontWeight: 600, marginBottom: 8 }
        }, styleName),
        React.createElement('p', {
            style: { fontSize: 13, opacity: 0.7 }
        }, '3D preview not yet available for this style'),
        React.createElement('p', {
            style: { fontSize: 12, opacity: 0.5, marginTop: 4 }
        }, 'Contact us for a custom quote')
    );
};

// ============================================================
// OverlayPlaceholder — shown when renderMode === 'overlay'
// ============================================================
var OverlayPlaceholder = function(props) {
    var styleName = props.styleName || 'Privacy';
    return React.createElement('div', {
        style: {
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#0b1220',
            color: '#667788',
            fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        }
    },
        React.createElement('div', {
            style: { fontSize: 48, marginBottom: 16, opacity: 0.4 }
        }, '\u25A3'),
        React.createElement('p', {
            style: { fontSize: 16, fontWeight: 600, marginBottom: 8 }
        }, styleName),
        React.createElement('p', {
            style: { fontSize: 13, opacity: 0.7 }
        }, 'Overlay visualization — coming soon'),
        React.createElement('p', {
            style: { fontSize: 12, opacity: 0.5, marginTop: 4 }
        }, 'Privacy fencing uses a different visualization mode')
    );
};

// ============================================================
// UnifiedCanvas — routes to 3D / preview / overlay based on style
// ============================================================
var PANEL_WIDTH = 390; // 370px panel + 20px right margin

var UnifiedCanvas = function(props) {
    var config = props.config;
    var panelCollapsed = props.panelCollapsed;
    var renderMode = getStyleRenderMode(config.styleId);
    var activeStyle = FENCE_STYLES.find(function(s) { return s.id === config.styleId; });
    var styleName = activeStyle ? activeStyle.name : '';

    var outerRef = useRef(null);
    var wrapperRef = useRef(null);
    var mountRef = useRef(null);
    var rendererRef = useRef(null);
    var prevConfigRef = useRef(null);

    // ============================================================
    // SCENE INIT — runs once, creates GateRenderer instance
    // Only runs when renderMode is '3d'
    // ============================================================
    useEffect(function() {
        if (renderMode !== '3d') return;
        if (!window.THREE) return;

        var outer = outerRef.current;
        var wrapper = wrapperRef.current;
        var mount = mountRef.current;
        if (!outer || !wrapper || !mount) return;

        var positionCanvas = function(totalW, totalH, collapsed) {
            var availW = collapsed ? totalW : totalW - PANEL_WIDTH;
            var box = fitContainBox(availW, totalH);
            wrapper.style.width = box.w + 'px';
            wrapper.style.height = box.h + 'px';
            wrapper.style.left = box.left + 'px';
            wrapper.style.top = box.top + 'px';
            wrapper.style.transition = 'left 0.35s cubic-bezier(0.22,1,0.36,1), width 0.35s cubic-bezier(0.22,1,0.36,1)';
            return box;
        };

        var box = positionCanvas(outer.clientWidth, outer.clientHeight, panelCollapsed);

        var gr = new GateRenderer(mount);
        gr.resize(box.w, box.h);
        rendererRef.current = gr;

        var handleResize = function() {
            var b = positionCanvas(outer.clientWidth, outer.clientHeight, panelCollapsed);
            gr.resize(b.w, b.h);
        };
        window.addEventListener('resize', handleResize);

        return function() {
            window.removeEventListener('resize', handleResize);
            gr.dispose();
            rendererRef.current = null;
        };
    }, [renderMode]);

    // ============================================================
    // REPOSITION — when panel collapses/expands
    // ============================================================
    useEffect(function() {
        if (renderMode !== '3d') return;
        var outer = outerRef.current;
        var wrapper = wrapperRef.current;
        var gr = rendererRef.current;
        if (!outer || !wrapper || !gr) return;

        var availW = panelCollapsed ? outer.clientWidth : outer.clientWidth - PANEL_WIDTH;
        var box = fitContainBox(availW, outer.clientHeight);
        wrapper.style.width = box.w + 'px';
        wrapper.style.height = box.h + 'px';
        wrapper.style.left = box.left + 'px';
        wrapper.style.top = box.top + 'px';
        gr.resize(box.w, box.h);
    }, [panelCollapsed, renderMode]);

    // ============================================================
    // GATE ASSEMBLY — fast path for color-only changes
    // Only runs when renderMode is '3d'
    // ============================================================
    useEffect(function() {
        if (renderMode !== '3d') return;
        var gr = rendererRef.current;
        if (!gr) return;

        var prev = prevConfigRef.current;
        prevConfigRef.current = config;

        // Fast path: if only color changed, update materials without rebuild
        if (prev && config &&
            prev.styleId === config.styleId &&
            prev.arch === config.arch &&
            prev.leaf === config.leaf &&
            prev.post === config.post &&
            prev.postCap === config.postCap &&
            prev.finial === config.finial &&
            prev.height === config.height &&
            prev.accessories === config.accessories &&
            prev.color !== config.color) {
            gr.updateMaterials(config);
            return;
        }

        gr.buildGate(config);
    }, [config, renderMode]);

    // ============================================================
    // Dispose renderer when leaving 3D mode
    // ============================================================
    useEffect(function() {
        if (renderMode !== '3d' && rendererRef.current) {
            rendererRef.current.dispose();
            rendererRef.current = null;
        }
    }, [renderMode]);

    // ================================================================
    // LAYOUT — route to appropriate view based on renderMode
    // ================================================================
    if (renderMode === 'preview') {
        return React.createElement(PreviewPlaceholder, { styleName: styleName });
    }

    if (renderMode === 'overlay') {
        return React.createElement(OverlayPlaceholder, { styleName: styleName });
    }

    // renderMode === '3d'
    return (
        <div ref={outerRef} style={{
            width: '100%', height: '100%',
            position: 'relative', backgroundColor: '#0b1220',
        }}>
            <div ref={wrapperRef} style={{ position: 'absolute' }}>
                <img
                    src="assets/backgrounds/tool-background-gate_1960x1096.png"
                    alt=""
                    style={{ width: '100%', height: '100%', display: 'block' }}
                />
                <div ref={mountRef} style={{
                    width: '100%', height: '100%',
                    position: 'absolute', top: 0, left: 0,
                }} />
            </div>
        </div>
    );
};

export default UnifiedCanvas;
