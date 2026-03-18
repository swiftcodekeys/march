import React from 'react';
import { FENCE_STYLES, COLORS, ARCH_STYLES } from './configData';
import StyleTab from './tabs/StyleTab';
import ColorTab from './tabs/ColorTab';
import SizeTab from './tabs/SizeTab';
import OptionsTab from './tabs/OptionsTab';
import PuppyPicketsTab from './tabs/PuppyPicketsTab';
import DetailsTab from './tabs/DetailsTab';
import QuoteTab from './tabs/QuoteTab';

var TABS = [
    { id: 'style', label: 'Style' },
    { id: 'color', label: 'Color' },
    { id: 'size', label: 'Size' },
    { id: 'options', label: 'Options' },
    { id: 'puppyPickets', label: 'Puppy' },
    { id: 'details', label: 'Details' },
    { id: 'quote', label: 'Quote' },
];

var STYLE_URLS = {
    uaf_200: 'https://grandviewfence.com/fencing/horizon',
    uaf_201: 'https://grandviewfence.com/fencing/horizon-pro',
    uaf_250: 'https://grandviewfence.com/fencing/vanguard',
    uab_200: 'https://grandviewfence.com/fencing/haven',
    uas_100: 'https://grandviewfence.com/fencing/charleston',
    uas_101: 'https://grandviewfence.com/fencing/charleston-pro',
    uas_150: 'https://grandviewfence.com/fencing/savannah',
};

function getHeader(activeTab, config) {
    var style = FENCE_STYLES.find(function(s) { return s.id === config.styleId; }) || FENCE_STYLES[0];
    var colorName = config.color ? config.color.displayName : 'Black';
    var archObj = ARCH_STYLES.find(function(a) { return a.id === config.arch; });
    var archName = archObj ? archObj.name : 'Estate';
    var leafLabel = config.leaf === '1' ? 'Single Gate' : 'Double Gate';

    switch (activeTab) {
        case 'style':
            return {
                step: 'Step 1 of 7',
                title: 'Choose Your Gate Style',
                subtitle: style.name + ' — ' + style.subtitle,
                showProductLink: true,
                linkLabel: 'View ' + style.name + ' Page',
                linkUrl: STYLE_URLS[style.id] || 'https://grandviewfence.com/fencing',
            };
        case 'color':
            return {
                step: 'Step 2 of 7',
                title: 'ProCoat Powder Coat Finish',
                subtitle: colorName + ' — Premium Finish',
                showProductLink: true,
                linkLabel: 'All Finishes',
                linkUrl: 'https://grandviewfence.com/accessories',
            };
        case 'size':
            return {
                step: 'Step 3 of 7',
                title: 'Gate Dimensions',
                subtitle: config.height + '" Height — ' + leafLabel,
            };
        case 'options':
            return {
                step: 'Step 4 of 7',
                title: 'Gate Options',
                subtitle: 'Customize — Arch, Rails & More',
            };
        case 'puppyPickets':
            return {
                step: 'Step 5 of 7',
                title: 'Puppy Picket Styles',
                subtitle: 'Keep Pets Safe — 10 Styles Available',
                showProductLink: true,
                linkLabel: 'Pet-Safe Fencing',
                linkUrl: 'https://grandviewfence.com/pet-aluminum-fence',
            };
        case 'details':
            return {
                step: 'Step 6 of 7',
                title: 'Fine Details',
                subtitle: 'Post Caps, Finials & Accents',
            };
        case 'quote':
            return {
                step: 'Step 7 of 7',
                title: 'Your Configuration',
                subtitle: 'Ready to Order? — Get your instant quote',
            };
        default:
            return {
                step: 'Step 1 of 7',
                title: 'Choose Your Gate Style',
                subtitle: style.name + ' — ' + style.subtitle,
            };
    }
}

function renderTabContent(activeTab, config, onConfigChange) {
    switch (activeTab) {
        case 'style':
            return <StyleTab config={config} onConfigChange={onConfigChange} />;
        case 'color':
            return <ColorTab config={config} onConfigChange={onConfigChange} />;
        case 'size':
            return <SizeTab config={config} onConfigChange={onConfigChange} />;
        case 'options':
            return <OptionsTab config={config} onConfigChange={onConfigChange} />;
        case 'puppyPickets':
            return <PuppyPicketsTab config={config} onConfigChange={onConfigChange} />;
        case 'details':
            return <DetailsTab config={config} onConfigChange={onConfigChange} />;
        case 'quote':
            return <QuoteTab config={config} onConfigChange={onConfigChange} />;
        default:
            return <StyleTab config={config} onConfigChange={onConfigChange} />;
    }
}

var FloatingPanel = function(props) {
    var activeTab = props.activeTab;
    var onTabChange = props.onTabChange;
    var config = props.config;
    var onConfigChange = props.onConfigChange;
    var collapsed = props.collapsed;
    var onToggleCollapse = props.onToggleCollapse;

    var header = getHeader(activeTab, config);

    var currentIndex = TABS.findIndex(function(t) { return t.id === activeTab; });
    if (currentIndex < 0) currentIndex = 0;

    var isFirst = currentIndex === 0;
    var isLast = currentIndex === TABS.length - 1;
    var isBeforeLast = currentIndex === TABS.length - 2;

    var nextLabel = '';
    if (isLast) {
        nextLabel = 'Get Instant Quote \u2192';
    } else if (isBeforeLast) {
        nextLabel = 'Get Quote \u2192';
    } else {
        nextLabel = 'Next: ' + TABS[currentIndex + 1].label + ' \u2192';
    }

    var panelClassName = 'float-panel' + (collapsed ? ' collapsed' : '');

    var handleNext = function() {
        if (!isLast) {
            onTabChange(TABS[currentIndex + 1].id);
        }
    };

    var handleBack = function() {
        if (!isFirst) {
            onTabChange(TABS[currentIndex - 1].id);
        }
    };

    return (
        <div>
            <button
                className={'collapse-handle' + (collapsed ? ' panel-hidden' : '')}
                onClick={onToggleCollapse}
                title={collapsed ? 'Expand panel' : 'Collapse panel'}
            >
                {collapsed ? '\u203A' : '\u2039'}
            </button>
            <div className={panelClassName}>
                <div className="panel-tabs">
                    {TABS.map(function(tab) {
                        return (
                            <button
                                key={tab.id}
                                className={'panel-tab' + (activeTab === tab.id ? ' active' : '')}
                                onClick={function() { onTabChange(tab.id); }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="panel-header">
                    <div className="panel-step">{header.step}</div>
                    <div className="panel-title">{header.title}</div>
                    <div className="panel-subtitle">{header.subtitle}</div>
                    {header.showProductLink && header.linkUrl && (
                        <a
                            href={header.linkUrl}
                            className="btn-product"
                            target="_blank"
                            rel="noopener"
                            style={{ marginTop: 8, display: 'inline-block' }}
                        >
                            {header.linkLabel} &rarr;
                        </a>
                    )}
                </div>

                <div className="panel-body">
                    <div key={activeTab}>
                        {renderTabContent(activeTab, config, onConfigChange)}
                    </div>
                </div>

                <div className="panel-footer">
                    <button
                        className="btn-back"
                        onClick={handleBack}
                        disabled={isFirst}
                        style={isFirst ? { opacity: 0.4, cursor: 'default' } : {}}
                    >
                        &larr; Back
                    </button>
                    <div className="progress-dots">
                        {TABS.map(function(tab, i) {
                            return (
                                <span
                                    key={tab.id}
                                    className={'progress-dot' + (i <= currentIndex ? ' done' : '')}
                                    title={tab.label}
                                />
                            );
                        })}
                    </div>
                    <button
                        className={'btn-next' + (isLast ? ' cta-pulse' : '')}
                        onClick={handleNext}
                    >
                        {nextLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FloatingPanel;
