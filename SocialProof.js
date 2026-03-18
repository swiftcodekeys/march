import React, { useState, useEffect } from 'react';

var MESSAGES = [
    'Most chosen this month: <strong>Charleston</strong> in Satin Black',
    'Trending now: <strong>Horizon</strong> in Bronze',
    '<strong>Savannah</strong> is the #1 pick for curb appeal',
    'Homeowners love <strong>Vanguard</strong> with Spear finials',
    'Most popular color this spring: <strong>Satin Bronze</strong>',
    'Top seller for pool safety: <strong>Haven</strong> in Black',
    '<strong>Charleston Pro</strong> — best for pet owners',
    'Estate arch is the most requested upgrade',
    'New this season: <strong>Beige</strong> is making a comeback',
    'Over 500 gates configured this month',
];

var SocialProof = function() {
    var state = useState(0);
    var index = state[0];
    var setIndex = state[1];

    useEffect(function() {
        var timer = setInterval(function() {
            setIndex(function(prev) { return (prev + 1) % MESSAGES.length; });
        }, 15000);
        return function() { clearInterval(timer); };
    }, []);

    return (
        <div
            className="social-proof-pill"
            key={index}
            dangerouslySetInnerHTML={{ __html: MESSAGES[index] }}
        />
    );
};

export default SocialProof;
