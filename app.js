import React, { useState } from 'react';
import UnifiedCanvas from './UnifiedCanvas';
import Sidebar from './Sidebar';
import { COLORS, FENCE_STYLES } from './configData';

const App = () => {
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
        <div style={styles.container}>
            <Sidebar config={config} onConfigChange={setConfig} />
            <div style={styles.canvasArea}>
                <UnifiedCanvas config={config} />
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
    },
    canvasArea: {
        flex: 1,
        position: 'relative',
    },
};

export default App;
