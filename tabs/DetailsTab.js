import React from 'react';
import { STYLE_FEATURE_GATE, FENCE_STYLES } from '../configData';

var POST_CAP_ITEMS = [
    { id: 'pcf', name: 'Flat', thumb: 'gate_tool/th/th_pstcp_flat.jpg' },
    { id: 'pcb', name: 'Ball', thumb: 'gate_tool/th/th_pstcp_ball.jpg' },
];

var FINIAL_ITEMS = [
    { id: 'fs', name: 'Spear',   thumb: 'gate_tool/th/th_pc_spe.jpg' },
    { id: 'ft', name: 'Trident', thumb: 'gate_tool/th/th_pc_tri.jpg' },
    { id: 'fq', name: 'Quad',    thumb: 'gate_tool/th/th_pc_qua.jpg' },
    { id: 'fp', name: 'Plug',    thumb: 'gate_tool/th/th_pc_plg.jpg' },
];

var ACCENT_ITEMS = [
    { id: 'tcr', name: 'Circle',    thumb: 'gate_tool/th/th_acc_cir.jpg' },
    { id: 'tbu', name: 'Butterfly', thumb: 'gate_tool/th/th_acc_but.jpg' },
    { id: 'scr', name: 'Scroll',    thumb: 'gate_tool/th/th_acc_scr.jpg' },
];

var DetailsTab = function(props) {
    var config = props.config;
    var onConfigChange = props.onConfigChange;
    var gate = STYLE_FEATURE_GATE[config.styleId] || {};
    var style = FENCE_STYLES.find(function(s) { return s.id === config.styleId; }) || FENCE_STYLES[0];

    var availablePostCaps = (gate.postCaps || []);
    var availableFinials = (gate.finials || []);
    var availableAccessories = (gate.accessories || []);

    var filteredPostCaps = POST_CAP_ITEMS.filter(function(pc) {
        return availablePostCaps.indexOf(pc.id) !== -1;
    });

    var filteredFinials = FINIAL_ITEMS.filter(function(f) {
        return availableFinials.indexOf(f.id) !== -1;
    });

    var filteredAccents = ACCENT_ITEMS.filter(function(a) {
        return availableAccessories.indexOf(a.id) !== -1;
    });

    var handlePostCapChange = function(pcId) {
        onConfigChange({ ...config, postCap: pcId });
    };

    var handleFinialChange = function(finId) {
        // Toggle off if already selected
        if (config.finial === finId) {
            onConfigChange({ ...config, finial: null });
        } else {
            onConfigChange({ ...config, finial: finId });
        }
    };

    var toggleAccent = function(accId) {
        var current = config.accessories || {};
        onConfigChange({
            ...config,
            accessories: { ...current, [accId]: !current[accId] },
        });
    };

    return (
        <div className="sections-row">
            {filteredPostCaps.length > 0 && (
                <div className="section-group">
                    <div className="section-title">Post Caps</div>
                    <div className="option-row">
                        {filteredPostCaps.map(function(pc) {
                            var isActive = (config.postCap || 'pcf') === pc.id;
                            return (
                                <div
                                    key={pc.id}
                                    className={'opt-card' + (isActive ? ' active' : '')}
                                    onClick={function() { handlePostCapChange(pc.id); }}
                                >
                                    <div className="opt-card-img">
                                        <img src={pc.thumb} alt={pc.name} />
                                    </div>
                                    <div className="opt-card-label">{pc.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {style.hasFinials && filteredFinials.length > 0 && (
                <div className="section-group">
                    <div className="section-title">Finials</div>
                    <div className="option-row">
                        <div
                            className={'opt-card' + (config.finial === null ? ' active' : '')}
                            onClick={function() { handleFinialChange(null); }}
                        >
                            <div className="opt-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: 'rgba(240,242,245,0.3)', fontSize: '20px' }}>-</span>
                            </div>
                            <div className="opt-card-label">None</div>
                        </div>
                        {filteredFinials.map(function(f) {
                            var isActive = config.finial === f.id;
                            return (
                                <div
                                    key={f.id}
                                    className={'opt-card' + (isActive ? ' active' : '')}
                                    onClick={function() { handleFinialChange(f.id); }}
                                >
                                    <div className="opt-card-img">
                                        <img src={f.thumb} alt={f.name} />
                                    </div>
                                    <div className="opt-card-label">{f.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {filteredAccents.length > 0 && (
                <div className="section-group">
                    <div className="section-title">Accents</div>
                    <div className="option-row">
                        {filteredAccents.map(function(acc) {
                            var isActive = config.accessories && config.accessories[acc.id];
                            return (
                                <div
                                    key={acc.id}
                                    className={'opt-card' + (isActive ? ' active' : '')}
                                    onClick={function() { toggleAccent(acc.id); }}
                                >
                                    <div className="opt-card-img">
                                        <img src={acc.thumb} alt={acc.name} />
                                    </div>
                                    <div className="opt-card-label">{acc.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailsTab;
