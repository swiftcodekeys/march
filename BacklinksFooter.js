import React from 'react';

const LINKS = [
    { label: 'Home',          href: 'https://grandviewfence.com' },
    { label: 'All Fencing',   href: 'https://grandviewfence.com/fencing' },
    { label: 'Residential',   href: 'https://grandviewfence.com/residential-commercial' },
    { label: 'Pool & Safety', href: 'https://grandviewfence.com/pool-safety' },
    { label: 'Privacy',       href: 'https://grandviewfence.com/privacy' },
    { label: 'Gates',         href: 'https://grandviewfence.com/walk-drive-gates' },
    { label: 'Accessories',   href: 'https://grandviewfence.com/accessories' },
    { label: 'Horizon',       href: 'https://grandviewfence.com/fencing/horizon' },
    { label: 'Horizon Pro',   href: 'https://grandviewfence.com/fencing/horizon-pro' },
    { label: 'Vanguard',      href: 'https://grandviewfence.com/fencing/vanguard' },
    { label: 'Haven',         href: 'https://grandviewfence.com/fencing/haven' },
    { label: 'Charleston',    href: 'https://grandviewfence.com/fencing/charleston' },
    { label: 'Savannah',      href: 'https://grandviewfence.com/fencing/savannah' },
    { label: 'Pet-Safe',      href: 'https://grandviewfence.com/pet-aluminum-fence' },
    { label: 'Blog',          href: 'https://grandviewfence.com/blog' },
    { label: 'About',         href: 'https://grandviewfence.com/about' },
];

const BacklinksFooter = (props) => {
    var cls = 'backlinks' + (props.panelCollapsed ? ' backlinks-full' : '');
    return (
        <div className={cls}>
            {LINKS.map((link, i) => (
                <React.Fragment key={link.label}>
                    <a href={link.href} target="_blank" rel="noopener">{link.label}</a>
                    {i < LINKS.length - 1 && <span className="sep">&middot;</span>}
                </React.Fragment>
            ))}
        </div>
    );
};

export default BacklinksFooter;
