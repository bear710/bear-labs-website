'use client';
import { useCallback, useReducer } from 'react';

/**
 * Explicit state machine for the jar viewer.
 * States: idle -> inspecting -> opening -> open -> productFocus
 *                                   ^                    |
 *                                   |--------- closing <-|
 */
export const VIEWER_STATES = {
    IDLE: 'idle',
    INSPECTING: 'inspecting',
    OPENING: 'opening',
    OPEN: 'open',
    PRODUCT_FOCUS: 'productFocus',
    CLOSING: 'closing',
};

const TRANSITIONS = {
    [VIEWER_STATES.IDLE]: [VIEWER_STATES.INSPECTING, VIEWER_STATES.OPENING],
    [VIEWER_STATES.INSPECTING]: [VIEWER_STATES.OPENING, VIEWER_STATES.IDLE],
    [VIEWER_STATES.OPENING]: [VIEWER_STATES.OPEN],
    [VIEWER_STATES.OPEN]: [VIEWER_STATES.PRODUCT_FOCUS, VIEWER_STATES.CLOSING],
    [VIEWER_STATES.PRODUCT_FOCUS]: [VIEWER_STATES.CLOSING],
    [VIEWER_STATES.CLOSING]: [VIEWER_STATES.IDLE],
};

function reducer(state, action) {
    switch (action.type) {
        case 'GO': {
            const allowed = TRANSITIONS[state] || [];
            if (!allowed.includes(action.next)) return state;
            return action.next;
        }
        case 'FORCE':
            return action.next;
        default:
            return state;
    }
}

export function useViewerState() {
    const [state, dispatch] = useReducer(reducer, VIEWER_STATES.IDLE);

    const go = useCallback((next) => dispatch({ type: 'GO', next }), []);
    const force = useCallback((next) => dispatch({ type: 'FORCE', next }), []);

    return { state, go, force };
}
