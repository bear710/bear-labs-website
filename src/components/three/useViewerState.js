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

/**
 * The one place that decides what a tap/click *means* for the current
 * state — used identically by every scene's canvas tap handler and by
 * Product3DViewer's primary button, so there is exactly one
 * implementation of "open vs close" rather than two that can drift
 * apart. Returns null while a scripted transition (OPENING/CLOSING) is
 * already running, so a stray tap is simply ignored.
 */
export function getToggleTarget(state) {
    if (state === VIEWER_STATES.IDLE || state === VIEWER_STATES.INSPECTING) return VIEWER_STATES.OPENING;
    if (state === VIEWER_STATES.OPEN || state === VIEWER_STATES.PRODUCT_FOCUS) return VIEWER_STATES.CLOSING;
    return null;
}

export function useViewerState() {
    const [state, dispatch] = useReducer(reducer, VIEWER_STATES.IDLE);

    const go = useCallback((next) => dispatch({ type: 'GO', next }), []);
    const force = useCallback((next) => dispatch({ type: 'FORCE', next }), []);

    return { state, go, force };
}
