import React from 'react';

const SCENES = [
    { id: 'gates', label: 'Driveway Gates' },
    { id: 'fencing', label: 'Front Yard' },
    { id: 'backyard', label: 'Back Yard' },
    { id: 'draw', label: 'Draw Your Yard', badge: 'NEW' },
];

const TopNav = ({ activeScene, onSceneChange }) => {
    return (
        <nav className="topnav">
            <div className="topnav-left">
                <div className="topnav-logo">
                    <img src="assets/logo.png" alt="Grandview" />
                </div>
                <div className="topnav-brand">
                    <span className="name">Grandview <span className="fence">Fence</span></span>
                    <span className="tool-name">Design Studio</span>
                </div>
            </div>
            <div className="topnav-divider"></div>
            <div className="topnav-center">
                {SCENES.map(scene => (
                    <button
                        key={scene.id}
                        className={'topnav-tab' + (activeScene === scene.id ? ' active' : '')}
                        onClick={() => onSceneChange(scene.id)}
                    >
                        {scene.label}
                        {scene.badge && <span className="badge">{scene.badge}</span>}
                    </button>
                ))}
            </div>
            <div className="topnav-right">
                <button className="btn-quote-nav">Get Instant Quote &rarr;</button>
            </div>
        </nav>
    );
};

export default TopNav;
