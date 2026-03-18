import React from 'react';

const TABS = [
    { id: 'style', label: 'Style' },
    { id: 'color', label: 'Color' },
    { id: 'size', label: 'Size' },
    { id: 'options', label: 'Options' },
    { id: 'puppyPickets', label: 'Puppy Pickets' },
    { id: 'details', label: 'Details' },
    { id: 'quote', label: 'Quote' },
];

const BottomStrip = ({ activeTab, onTabChange }) => {
    return (
        <div className="bottom-strip">
            {TABS.map(tab => (
                <button
                    key={tab.id}
                    className={'strip-tab' + (activeTab === tab.id ? ' active' : '')}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default BottomStrip;
