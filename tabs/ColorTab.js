import React, { useState } from 'react';
import { COLORS } from '../configData';
import ImagePopup from './ImagePopup';

var COLOR_PREVIEWS = {
    0: 'assets/ifence_previews/gate_colors/matte_sandstone.png',
    1: 'assets/ifence_previews/gate_colors/bronze.png',
    2: 'assets/ifence_previews/gate_colors/bronze.png',
    3: 'assets/ifence_previews/gate_colors/white.png',
    4: 'assets/ifence_previews/gate_colors/white.png',
    5: 'assets/ifence_previews/gate_colors/black.png',
    6: 'assets/ifence_previews/gate_colors/matte_black.png',
    7: 'assets/ifence_previews/gate_colors/white.png',
};

var ColorTab = function(props) {
    var config = props.config;
    var onConfigChange = props.onConfigChange;

    var hoverState = useState(null);
    var popup = hoverState[0];
    var setPopup = hoverState[1];

    var handleColorChange = function(color) {
        onConfigChange({ ...config, color: color });
    };

    var handleMouseEnter = function(colorId, name, event) {
        var rect = event.currentTarget.getBoundingClientRect();
        var src = COLOR_PREVIEWS[colorId];
        if (!src) return;
        setPopup({
            src: src,
            name: name,
            position: {
                top: rect.top - 10,
                left: rect.left - 220,
            }
        });
    };

    var handleMouseLeave = function() {
        setPopup(null);
    };

    return (
        <div>
            <div className="swatch-row">
                {COLORS.map(function(color) {
                    var isActive = config.color && config.color.id === color.id;
                    var isLight = color.hex === '#f4f4f4' || color.hex === '#f2f2f2' || color.hex === '#e8e8e8';
                    return (
                        <div
                            key={color.id}
                            className="swatch-group"
                            onClick={function() { handleColorChange(color); }}
                            onMouseEnter={function(e) { handleMouseEnter(color.id, color.displayName, e); }}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div
                                className={'swatch' + (isActive ? ' active' : '')}
                                style={{
                                    background: color.hex,
                                    borderColor: isLight && !isActive ? 'rgba(0,0,0,0.1)' : undefined,
                                }}
                            />
                            <div className="swatch-name">{color.displayName}</div>
                        </div>
                    );
                })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#8e95a0', fontWeight: 500 }}>
                Every component individually coated before assembly for complete coverage. Limited Lifetime Warranty.
            </div>
            {popup && <ImagePopup src={popup.src} label={popup.name} position={popup.position} />}
        </div>
    );
};

export default ColorTab;
