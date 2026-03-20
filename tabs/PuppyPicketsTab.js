import React, { useState } from 'react';
import { STYLE_FEATURE_GATE } from '../configData';
import ImagePopup from './ImagePopup';

var PUPPY_VARIANTS = [
    { id: 'fls', name: 'Flush',     thumb: 'assets/ifence_previews/gate_puppy_pickets/flush_puppies_97.png' },
    { id: 'std', name: 'Standard',  thumb: 'assets/ifence_previews/gate_puppy_pickets/classic_puppies_100.png' },
    { id: 'plg', name: 'Classic Plugged',   thumb: 'assets/ifence_previews/gate_puppy_pickets/nouveau_puppies_94.png' },
    { id: 'pls', name: 'Staggered Plugged', thumb: 'assets/ifence_previews/gate_puppy_pickets/nouveau_puppies_staggered_91.png' },
    { id: 'spe', name: 'Classic Spear',     thumb: 'assets/ifence_previews/gate_puppy_pickets/bella_puppies_82.png' },
    { id: 'sps', name: 'Staggered Spear',   thumb: 'assets/ifence_previews/gate_puppy_pickets/bella_puppies_staggered_79.png' },
    { id: 'tri', name: 'Classic Tri-Finial', thumb: 'assets/ifence_previews/gate_puppy_pickets/fleur_de_lis_puppies_76.png' },
    { id: 'trs', name: 'Staggered Tri-Finial', thumb: 'assets/ifence_previews/gate_puppy_pickets/fleur_de_lis_puppies_staggered_73.png' },
    { id: 'qua', name: 'Classic Quad-Finial', thumb: 'assets/ifence_previews/gate_puppy_pickets/excelsior_puppies_88.png' },
    { id: 'qus', name: 'Staggered Quad-Finial', thumb: 'assets/ifence_previews/gate_puppy_pickets/excelsior_puppies_staggered_85.png' },
];

var PuppyPicketsTab = function(props) {
    var config = props.config;
    var onConfigChange = props.onConfigChange;
    var gate = STYLE_FEATURE_GATE[config.styleId] || {};
    var supportsPuppy = (gate.options || []).indexOf('pup') !== -1;

    var hoverState = useState(null);
    var popup = hoverState[0];
    var setPopup = hoverState[1];

    if (!supportsPuppy) {
        return (
            <div style={{ textAlign: 'center', color: '#5a6270', fontSize: '15px', fontWeight: 500 }}>
                Puppy pickets are not available for this style. Try Horizon, Vanguard, Haven, Charleston, or Savannah.
            </div>
        );
    }

    var currentPup = config.accessories && config.accessories.pup;

    var handlePuppyClick = function(variantId) {
        var current = config.accessories || {};
        if (currentPup === variantId) {
            var updated = { ...current };
            delete updated.pup;
            onConfigChange({ ...config, accessories: updated });
        } else {
            onConfigChange({
                ...config,
                accessories: { ...current, pup: variantId },
            });
        }
    };

    var handleMouseEnter = function(src, alt, event) {
        var rect = event.currentTarget.getBoundingClientRect();
        setPopup({
            src: src,
            alt: alt,
            position: {
                top: rect.top - 10,
                left: rect.left - 290,
            }
        });
    };

    var handleMouseLeave = function() {
        setPopup(null);
    };

    return (
        <div className="option-row">
            {PUPPY_VARIANTS.map(function(variant) {
                var isActive = currentPup === variant.id;
                return (
                    <div
                        key={variant.id}
                        className={'opt-card' + (isActive ? ' active' : '')}
                        onClick={function() { handlePuppyClick(variant.id); }}
                        onMouseEnter={function(e) { handleMouseEnter(variant.thumb, variant.name, e); }}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="opt-card-img">
                            <img src={variant.thumb} alt={variant.name} />
                        </div>
                        <div className="opt-card-label">{variant.name}</div>
                    </div>
                );
            })}
            {popup && <ImagePopup src={popup.src} alt={popup.alt} position={popup.position} />}
        </div>
    );
};

export default PuppyPicketsTab;
