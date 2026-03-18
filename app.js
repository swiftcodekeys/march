import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import UnifiedCanvas from './UnifiedCanvas';
import TopNav from './TopNav';
import BottomStrip from './BottomStrip';
import FlyoutPanel from './FlyoutPanel';
import BacklinksFooter from './BacklinksFooter';
import { COLORS, FENCE_STYLES } from './configData';
import QuizPage from './quiz/QuizPage';

const DesignStudio = () => {
    const [activeTab, setActiveTab] = useState('gates');
    const [activeConfigTab, setActiveConfigTab] = useState('style');
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
        mount: 'p',
    });

    return (
        <div className="app-shell">
            <TopNav activeScene={activeTab} onSceneChange={setActiveTab} />
            <div className="viewport-wrap">
                <UnifiedCanvas config={config} />
            </div>
            <FlyoutPanel activeTab={activeConfigTab} config={config} onConfigChange={setConfig} />
            <BottomStrip activeTab={activeConfigTab} onTabChange={setActiveConfigTab} />
            <BacklinksFooter />
        </div>
    );
};

const App = () => {
    return (
        <Routes>
            <Route path="/fence-quiz" element={<QuizPage />} />
            <Route path="/*" element={<DesignStudio />} />
        </Routes>
    );
};

export default App;
