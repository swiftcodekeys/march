import React from 'react';

var CATEGORIES = [
    { key: 'style', label: 'Style' },
    { key: 'color', label: 'Color' },
    { key: 'size', label: 'Size' },
    { key: 'options', label: 'Options' },
    { key: 'puppy', label: 'Puppy Pickets' },
    { key: 'details', label: 'Details' },
];

function getCategoryStatus(config) {
    return {
        style: true,     // always has default
        color: true,     // always has default
        size: true,      // always has default
        options: true,   // arch always has default 'e'
        puppy: !!(config.accessories && config.accessories.pup),
        details: !!config.finial,
    };
}

var ProgressIndicator = function(props) {
    var config = props.config;
    var status = getCategoryStatus(config);
    var doneCount = 0;

    CATEGORIES.forEach(function(cat) {
        if (status[cat.key]) doneCount++;
    });

    return (
        <div className="progress-indicator">
            <div className="progress-dots">
                {CATEGORIES.map(function(cat) {
                    return (
                        <span
                            key={cat.key}
                            className={'progress-dot' + (status[cat.key] ? ' done' : '')}
                            title={cat.label}
                        />
                    );
                })}
            </div>
            <span className="progress-text">{doneCount} of 6 configured</span>
        </div>
    );
};

export default ProgressIndicator;
