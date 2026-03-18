import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import UnifiedCanvas from './UnifiedCanvas';
import TopNav from './TopNav';
import FloatingPanel from './FloatingPanel';
import BacklinksFooter from './BacklinksFooter';
import SocialProof from './SocialProof';
import { COLORS, FENCE_STYLES } from './configData';
import QuizPage from './quiz/QuizPage';

var STORAGE_KEY = 'gv_config';

function buildHashString(config) {
    var parts = [
        'style=' + config.styleId,
        'color=' + (config.color ? config.color.id : ''),
        'height=' + config.height,
        'arch=' + config.arch,
        'leaf=' + (config.leaf || ''),
        'mount=' + (config.mount || ''),
        'finial=' + (config.finial || ''),
        'postCap=' + (config.postCap || ''),
    ];
    return parts.join('&');
}

function parseHash() {
    var hash = window.location.hash.replace(/^#/, '');
    if (!hash) return null;
    var params = {};
    hash.split('&').forEach(function(pair) {
        var kv = pair.split('=');
        if (kv.length === 2) {
            params[kv[0]] = decodeURIComponent(kv[1]);
        }
    });
    return params;
}

function buildConfigFromParams(params, defaultConfig) {
    if (!params || !params.style) return null;

    // Validate style exists
    var style = FENCE_STYLES.find(function(s) { return s.id === params.style; });
    if (!style) return null;

    // Validate color exists
    var color = COLORS.find(function(c) { return c.id === params.color; });

    var config = Object.assign({}, defaultConfig, {
        styleId: params.style,
        height: params.height || defaultConfig.height,
        arch: params.arch || defaultConfig.arch,
        leaf: params.leaf || defaultConfig.leaf,
        mount: params.mount || defaultConfig.mount,
        finial: params.finial || (style.hasFinials ? 'fs' : null),
        postCap: params.postCap || defaultConfig.postCap,
    });
    if (color) config.color = color;

    return config;
}

function loadFromStorage(defaultConfig) {
    try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        var saved = JSON.parse(raw);
        if (!saved || !saved.styleId) return null;

        // Validate style
        var style = FENCE_STYLES.find(function(s) { return s.id === saved.styleId; });
        if (!style) return null;

        // Resolve color object (stored as id reference)
        if (saved.color && saved.color.id) {
            var color = COLORS.find(function(c) { return c.id === saved.color.id; });
            if (color) saved.color = color;
        }

        return saved;
    } catch (e) {
        return null;
    }
}

var DesignStudio = function() {
    var defaultStyle = FENCE_STYLES[0];
    var defaultConfig = {
        styleId: defaultStyle.id,
        height: '60',
        color: COLORS[5], // Gloss Black
        post: defaultStyle.postDefault,
        postCap: 'pcf',
        arch: 'e',
        leaf: defaultStyle.leafDefault,
        finial: null,
        accessories: {},
        mount: 'p',
    };

    // Determine initial config: URL hash > localStorage > default
    var initialConfig = defaultConfig;
    var hashParams = parseHash();
    var fromHash = buildConfigFromParams(hashParams, defaultConfig);
    if (fromHash) {
        initialConfig = fromHash;
    } else {
        var fromStorage = loadFromStorage(defaultConfig);
        if (fromStorage) {
            initialConfig = fromStorage;
        }
    }

    var configState = useState(initialConfig);
    var config = configState[0];
    var setConfig = configState[1];

    var tabState = useState('gates');
    var activeTab = tabState[0];
    var setActiveTab = tabState[1];

    var configTabState = useState('style');
    var activeConfigTab = configTabState[0];
    var setActiveConfigTab = configTabState[1];

    var panelState = useState(false);
    var panelCollapsed = panelState[0];
    var setPanelCollapsed = panelState[1];

    var handleReset = function() {
        setConfig(defaultConfig);
        setActiveConfigTab('style');
    };

    var handleSaveImage = function() {
        alert('Save Image coming soon');
    };

    // Auto-save to localStorage and update URL hash on config change
    useEffect(function() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (e) {
            // localStorage may be unavailable
        }
        var hashString = buildHashString(config);
        window.history.replaceState(null, '', '#' + hashString);
    }, [config]);

    return (
        <div className="app-shell">
            <TopNav activeScene={activeTab} onSceneChange={setActiveTab} onReset={handleReset} onSaveImage={handleSaveImage} />
            <div className="viewport-wrap">
                <UnifiedCanvas config={config} panelCollapsed={panelCollapsed} />
                {!panelCollapsed && <SocialProof />}
                <BacklinksFooter />
                <FloatingPanel
                    activeTab={activeConfigTab}
                    onTabChange={setActiveConfigTab}
                    config={config}
                    onConfigChange={setConfig}
                    collapsed={panelCollapsed}
                    onToggleCollapse={function() { setPanelCollapsed(!panelCollapsed); }}
                />
            </div>
        </div>
    );
};

var App = function() {
    return (
        <Routes>
            <Route path="/fence-quiz" element={<QuizPage />} />
            <Route path="/*" element={<DesignStudio />} />
        </Routes>
    );
};

export default App;
