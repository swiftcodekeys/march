/**
 * LandingHero.js — Sky gradient hero section for the fence quiz landing page.
 */
import React from 'react';
import { COLORS, FONTS } from '../styles/quizStyles';
import useMediaQuery from '../useMediaQuery';

const styles = {
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #78afcf 0%, #9dc5db 40%, #c4dde9 70%, #e8f1f5 100%)',
    paddingTop: 96,
    paddingBottom: 72,
    textAlign: 'center',
  },
  clouds: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 720,
    margin: '0 auto',
    padding: '0 24px',
  },
  h1: {
    fontSize: 54,
    fontWeight: 800,
    color: COLORS.white,
    letterSpacing: -1.5,
    lineHeight: 1.1,
    margin: 0,
    fontFamily: FONTS.inter,
  },
  sub: {
    fontSize: 19,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 20,
    lineHeight: 1.5,
    fontFamily: FONTS.inter,
  },
  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 36,
    padding: '16px 36px',
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.white,
    background: COLORS.orange,
    border: 'none',
    borderRadius: 28,
    cursor: 'pointer',
    fontFamily: FONTS.inter,
    boxShadow: '0 4px 24px rgba(242,101,34,0.35)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  trust: {
    marginTop: 20,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FONTS.inter,
  },
};

export default function LandingHero({ onStart }) {
  var isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div style={styles.wrapper}>
      {/* Subtle cloud shapes */}
      <div style={styles.clouds}>
        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1200 500">
          <ellipse cx="200" cy="120" rx="180" ry="60" fill="rgba(255,255,255,0.15)" />
          <ellipse cx="320" cy="100" rx="140" ry="50" fill="rgba(255,255,255,0.12)" />
          <ellipse cx="800" cy="160" rx="200" ry="55" fill="rgba(255,255,255,0.1)" />
          <ellipse cx="950" cy="140" rx="120" ry="40" fill="rgba(255,255,255,0.13)" />
          <ellipse cx="500" cy="300" rx="160" ry="45" fill="rgba(255,255,255,0.08)" />
        </svg>
      </div>

      <div style={styles.content}>
        <h1 style={Object.assign({}, styles.h1, isMobile ? { fontSize: 36 } : {})}>
          See Your Perfect Fence&nbsp;&mdash; Before You Buy
        </h1>
        <p style={Object.assign({}, styles.sub, isMobile ? { fontSize: 16 } : {})}>
          Answer 15 quick questions. We'll match you to the right system and show
          you exactly what it looks like.
        </p>
        <button
          style={styles.cta}
          onClick={onStart}
          onMouseEnter={function (e) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(242,101,34,0.45)';
          }}
          onMouseLeave={function (e) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(242,101,34,0.35)';
          }}
        >
          Start the Quiz
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <p style={styles.trust}>Free &middot; 3 minutes &middot; Instant results</p>
      </div>
    </div>
  );
}
