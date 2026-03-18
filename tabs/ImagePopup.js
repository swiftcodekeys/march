import React from 'react';

var ImagePopup = function(props) {
    var src = props.src;
    var label = props.label || props.alt || '';
    var position = props.position; // { top, left }

    if (!src || !position) return null;

    return (
        <div className="img-popup" style={{ top: position.top, left: position.left }}>
            <img src={src} alt={label} />
            {label && <div className="img-popup-label">{label}</div>}
        </div>
    );
};

export default ImagePopup;
