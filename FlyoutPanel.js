import React from 'react';

const TAB_HEADERS = {
    style:        { title: 'Choose Your Gate Style',   selected: 'Select a style', showProductLink: true },
    color:        { title: 'ProCoat Powder Coat Finish', selected: 'Select a color', showProductLink: true },
    size:         { title: 'Gate Dimensions',           selected: 'Configure size' },
    options:      { title: 'Gate Options',              selected: 'Customize your gate' },
    puppyPickets: { title: 'Puppy Picket Styles',       selected: 'Keep pets safe' },
    details:      { title: 'Fine Details',              selected: 'Post caps, finials & accents' },
    quote:        { title: 'Your Configuration',        selected: 'Ready to order?' },
};

const PLACEHOLDER_TEXT = {
    style:        'Style options coming soon',
    color:        'Color swatches coming soon',
    size:         'Size controls coming soon',
    options:      'Option cards coming soon',
    puppyPickets: 'Puppy picket options coming soon',
    details:      'Detail options coming soon',
    quote:        'Quote summary coming soon',
};

const FlyoutPanel = ({ activeTab, config, onConfigChange }) => {
    var header = TAB_HEADERS[activeTab] || TAB_HEADERS.style;
    var placeholder = PLACEHOLDER_TEXT[activeTab] || 'Coming soon';

    return (
        <div className="flyout">
            <div className="flyout-header">
                <div>
                    <div className="flyout-title">{header.title}</div>
                    <div className="flyout-selected">{header.selected}</div>
                </div>
                {header.showProductLink && (
                    <a
                        href="https://grandviewfence.com/fencing/horizon"
                        className="btn-product"
                        target="_blank"
                        rel="noopener"
                    >
                        View Product Page &rarr;
                    </a>
                )}
            </div>
            <div className="flyout-body">
                <div className="flyout-content" key={activeTab}>
                    <div className="flyout-placeholder">{placeholder}</div>
                </div>
            </div>
        </div>
    );
};

export default FlyoutPanel;
