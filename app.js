import React, { useState } from 'react';
import Nav from './Nav';
import UnifiedCanvas from './UnifiedCanvas';
import Sidebar from './Sidebar';
import { COLORS, FENCE_STYLES } from './configData';

const App = () => {
    const [activeTab, setActiveTab] = useState('gates');
    const defaultStyle = FENCE_STYLES[0];
    const [config, setConfig] = useState({
        styleId: defaultStyle.id,
        height: '60',
        color: COLORS[5], // Gloss Black
        post: defaultStyle.postDefault,
        postCap: 'pcf',
        arch: 'e',
        leaf: defaultStyle.leafDefault,
        finial: null,
        accessories: {},
    });

    return (
        <div style={styles.shell}>
            <Nav activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === 'gates' ? (
                <div style={styles.container}>
                    <Sidebar config={config} onConfigChange={setConfig} />
                    <div style={styles.canvasArea}>
                        <UnifiedCanvas config={config} />
                    </div>
                </div>
            ) : (
                <div style={styles.placeholder}>
                    <p style={styles.placeholderText}>
                        {activeTab === 'fencing' ? 'Yard Fencing' : 'Yard Layout'} — Coming Soon
                    </p>
                </div>
            )}
        </div>
    );
};

const styles = {
    shell: {
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
    },
    container: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
    },
    canvasArea: {
        flex: 1,
        position: 'relative',
    },
    placeholder: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: '#667788',
        fontSize: 18,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        letterSpacing: 1,
    },
};

export default App;
