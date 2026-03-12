import React from 'react';
import {
    FENCE_STYLES, COLORS, HEIGHTS, POST_CAPS, FINIALS,
    POSTS, ARCH_STYLES, ACCESSORIES, OPTION_LABELS
} from './configData';

const Sidebar = ({ config, onConfigChange }) => {
    const selectedStyle = FENCE_STYLES.find(s => s.id === config.styleId) || FENCE_STYLES[0];

    const update = (key, value) => {
        onConfigChange({ ...config, [key]: value });
    };

    const toggleAccessory = (accId) => {
        const current = config.accessories || {};
        onConfigChange({
            ...config,
            accessories: { ...current, [accId]: !current[accId] }
        });
    };

    const handleStyleChange = (styleId) => {
        const style = FENCE_STYLES.find(s => s.id === styleId);
        onConfigChange({
            ...config,
            styleId: styleId,
            post: style.postDefault,
            leaf: style.leafDefault,
            finial: style.hasFinials ? 'fs' : null,
            accessories: {},
        });
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.logo}>
                <h1 style={styles.title}>Grandview</h1>
                <p style={styles.subtitle}>Design Studio</p>
            </div>

            {/* GATE STYLE — Dropdown */}
            <Section title="Gate Style">
                <select
                    value={config.styleId}
                    onChange={(e) => handleStyleChange(e.target.value)}
                    style={styles.select}
                >
                    {FENCE_STYLES.map(style => (
                        <option key={style.id} value={style.id}>
                            {style.name} — {style.subtitle} ({style.code})
                        </option>
                    ))}
                </select>
            </Section>

            {/* HEIGHT */}
            <Section title="Height">
                <div style={styles.chipRow}>
                    {HEIGHTS.map(h => (
                        <button
                            key={h.id}
                            onClick={() => update('height', h.id)}
                            style={{
                                ...styles.chip,
                                ...(config.height === h.id ? styles.chipActive : {})
                            }}
                        >
                            {h.label}
                        </button>
                    ))}
                </div>
            </Section>

            {/* COLOR */}
            <Section title="Color">
                <div style={styles.colorRow}>
                    {COLORS.map(c => (
                        <button
                            key={c.id}
                            onClick={() => update('color', c)}
                            title={c.name}
                            style={{
                                ...styles.colorSwatch,
                                backgroundColor: c.hex,
                                ...(config.color && config.color.id === c.id ? styles.colorSwatchActive : {})
                            }}
                        />
                    ))}
                </div>
                <p style={styles.colorLabel}>
                    {config.color ? config.color.name : 'Gloss Black'}
                </p>
            </Section>

            {/* POST TYPE — Dropdown */}
            <Section title="Post">
                <select
                    value={config.post || 'po14'}
                    onChange={(e) => update('post', e.target.value)}
                    style={styles.select}
                >
                    {POSTS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </Section>

            {/* POST CAP */}
            <Section title="Post Cap">
                <div style={styles.chipRow}>
                    <button
                        onClick={() => update('postCap', null)}
                        style={{
                            ...styles.chip,
                            ...(!config.postCap ? styles.chipActive : {})
                        }}
                    >
                        None
                    </button>
                    {POST_CAPS.filter(pc => selectedStyle.options.includes(pc.id)).map(pc => (
                        <button
                            key={pc.id}
                            onClick={() => update('postCap', pc.id)}
                            style={{
                                ...styles.chip,
                                ...(config.postCap === pc.id ? styles.chipActive : {})
                            }}
                        >
                            {pc.name}
                        </button>
                    ))}
                </div>
            </Section>

            {/* ARCH STYLE — Dropdown */}
            <Section title="Arch Style">
                <select
                    value={config.arch || 'e'}
                    onChange={(e) => update('arch', e.target.value)}
                    style={styles.select}
                >
                    {ARCH_STYLES.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
            </Section>

            {/* FINIALS */}
            {selectedStyle.hasFinials && (
                <Section title="Finial Style">
                    <select
                        value={config.finial || ''}
                        onChange={(e) => update('finial', e.target.value || null)}
                        style={styles.select}
                    >
                        <option value="">None</option>
                        {FINIALS.filter(f => selectedStyle.options.includes(f.id)).map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                </Section>
            )}

            {/* OPTIONS */}
            <Section title="Options">
                {selectedStyle.options
                    .filter(o => !['pcf','pcb','fs','ft','fq','fp'].includes(o))
                    .map(optId => (
                        <label key={optId} style={styles.checkRow}>
                            <input
                                type="checkbox"
                                checked={!!(config.accessories && config.accessories[optId])}
                                onChange={() => toggleAccessory(optId)}
                                style={styles.checkbox}
                            />
                            <span>{OPTION_LABELS[optId] || ACCESSORIES[optId]?.name || optId}</span>
                        </label>
                    ))}
            </Section>

            {/* ACCESSORIES */}
            <Section title="Accessories">
                {selectedStyle.accessories
                    .filter(a => a !== 'rem')
                    .map(accId => (
                        <label key={accId} style={styles.checkRow}>
                            <input
                                type="checkbox"
                                checked={!!(config.accessories && config.accessories[accId])}
                                onChange={() => toggleAccessory(accId)}
                                style={styles.checkbox}
                            />
                            <span>{ACCESSORIES[accId]?.name || accId}</span>
                        </label>
                    ))}
            </Section>

            {/* GET QUOTE */}
            <div style={styles.quoteSection}>
                <button style={styles.quoteBtn}>
                    Get a Quote
                </button>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => {
    const [open, setOpen] = React.useState(true);
    return (
        <div style={styles.section}>
            <button onClick={() => setOpen(!open)} style={styles.sectionHeader}>
                <span>{title}</span>
                <span style={styles.chevron}>{open ? '▾' : '▸'}</span>
            </button>
            {open && <div style={styles.sectionBody}>{children}</div>}
        </div>
    );
};

const styles = {
    sidebar: {
        width: 320,
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: '#16213e',
        color: '#e0e0e0',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        fontSize: 14,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #0f3460',
    },
    logo: {
        padding: '24px 20px 16px',
        borderBottom: '1px solid #0f3460',
        textAlign: 'center',
    },
    title: {
        margin: 0,
        fontSize: 22,
        fontWeight: 700,
        color: '#ffffff',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    subtitle: {
        margin: '4px 0 0',
        fontSize: 11,
        color: '#8899aa',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    section: {
        borderBottom: '1px solid #0f3460',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '12px 20px',
        background: 'none',
        border: 'none',
        color: '#8899aa',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        cursor: 'pointer',
    },
    chevron: {
        fontSize: 12,
    },
    sectionBody: {
        padding: '0 20px 16px',
    },
    select: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: 8,
        border: '1px solid #2a2a4e',
        background: '#1a1a2e',
        color: '#ccc',
        fontSize: 13,
        cursor: 'pointer',
        appearance: 'auto',
    },
    chipRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        padding: '6px 14px',
        borderRadius: 20,
        border: '1px solid #2a2a4e',
        background: '#1a1a2e',
        color: '#ccc',
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 0.15s',
    },
    chipActive: {
        background: '#e94560',
        borderColor: '#e94560',
        color: '#fff',
    },
    colorRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
    },
    colorSwatch: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '2px solid #2a2a4e',
        cursor: 'pointer',
        transition: 'all 0.15s',
    },
    colorSwatchActive: {
        borderColor: '#e94560',
        boxShadow: '0 0 0 2px #e94560',
    },
    colorLabel: {
        marginTop: 8,
        fontSize: 12,
        color: '#8899aa',
    },
    checkRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '4px 0',
        cursor: 'pointer',
        fontSize: 13,
    },
    checkbox: {
        accentColor: '#e94560',
    },
    quoteSection: {
        padding: '20px',
        marginTop: 'auto',
    },
    quoteBtn: {
        width: '100%',
        padding: '14px',
        borderRadius: 10,
        border: 'none',
        background: 'linear-gradient(135deg, #e94560, #c73450)',
        color: '#fff',
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
        letterSpacing: 1,
    },
};

export default Sidebar;
