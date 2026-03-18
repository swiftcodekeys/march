import React from 'react';

var SCENES = [
    { id: 'gates', label: 'Driveway Gates' },
    { id: 'fencing', label: 'Front Yard' },
    { id: 'backyard', label: 'Back Yard' },
    { id: 'draw', label: 'Draw Your Yard', badge: 'NEW' },
];

var TopNav = function(props) {
    var activeScene = props.activeScene;
    var onSceneChange = props.onSceneChange;
    var onReset = props.onReset;
    var onSaveImage = props.onSaveImage;

    return (
        <nav className="topnav">
            <div className="topnav-left">
                <div className="topnav-logo">
                    <img src="assets/logo.png" alt="Grandview" />
                </div>
                <div className="topnav-brand">
                    <span className="brand-name">Grandview Fence</span>
                    <span className="brand-sub">Design Studio</span>
                </div>
            </div>
            <div className="topnav-center">
                {SCENES.map(function(scene) {
                    return (
                        <button
                            key={scene.id}
                            className={'topnav-tab' + (activeScene === scene.id ? ' active' : '')}
                            onClick={function() { onSceneChange(scene.id); }}
                        >
                            {scene.label}
                            {scene.badge && <span className="badge">{scene.badge}</span>}
                        </button>
                    );
                })}
            </div>
            <div className="topnav-right">
                <button className="nav-btn" onClick={onReset}>{'\u21BA'} Reset</button>
                <button className="nav-btn" onClick={onSaveImage}>{'\uD83D\uDCF7'} Save</button>
                <button className="btn-quote-nav" onClick={function() { /* TODO */ }}>Get Quote &rarr;</button>
            </div>
        </nav>
    );
};

export default TopNav;
