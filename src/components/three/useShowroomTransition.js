'use client';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { PRODUCTS } from './productConfig';

/**
 * Showroom-level transition state — deliberately separate from each
 * product's own open/extract/reveal state (useViewerState). The two
 * coordinate only through "is the showroom resting" gating; neither
 * reads the other's internals.
 */
export const SHOWROOM_STATES = {
    IDLE: 'idle',
    EXITING: 'exiting',
    SWAPPING: 'swapping',
    ENTERING: 'entering',
    READY: 'ready',
};

const RESTING_STATES = [SHOWROOM_STATES.IDLE, SHOWROOM_STATES.READY];

const initialState = {
    activeProductId: PRODUCTS[0].id,
    pendingProductId: null,
    transition: SHOWROOM_STATES.IDLE,
};

function reducer(state, action) {
    switch (action.type) {
        case 'SELECT': {
            if (!RESTING_STATES.includes(state.transition)) return state;
            if (action.id === state.activeProductId) return state;
            return { ...state, pendingProductId: action.id, transition: SHOWROOM_STATES.EXITING };
        }
        case 'EXITED': {
            if (state.transition !== SHOWROOM_STATES.EXITING) return state;
            return {
                ...state,
                activeProductId: state.pendingProductId,
                pendingProductId: null,
                transition: SHOWROOM_STATES.SWAPPING,
            };
        }
        case 'BEGIN_ENTER': {
            if (state.transition !== SHOWROOM_STATES.SWAPPING) return state;
            return { ...state, transition: SHOWROOM_STATES.ENTERING };
        }
        case 'ENTERED': {
            if (state.transition !== SHOWROOM_STATES.ENTERING) return state;
            return { ...state, transition: SHOWROOM_STATES.READY };
        }
        default:
            return state;
    }
}

export function useShowroomTransition() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const isInteractive = RESTING_STATES.includes(state.transition);

    // Holds at most one pending destination — the *latest* one requested
    // while the showroom was mid-transition. Never a queue of keystrokes:
    // every new request simply overwrites whatever was queued before.
    const queuedIdRef = useRef(null);

    // Swapping is a real, observable state, but it never needs to render
    // anything itself — advance straight to entering on the next tick.
    useEffect(() => {
        if (state.transition === SHOWROOM_STATES.SWAPPING) {
            dispatch({ type: 'BEGIN_ENTER' });
        }
    }, [state.transition]);

    // Once the showroom settles, apply whatever destination was last
    // requested during the transition (if any, and if it still differs
    // from where we ended up). This is what lets rapid input collapse to
    // "go to wherever the user pointed last" instead of being dropped.
    useEffect(() => {
        if (!isInteractive) return;
        const queued = queuedIdRef.current;
        queuedIdRef.current = null;
        if (queued && queued !== state.activeProductId) {
            dispatch({ type: 'SELECT', id: queued });
        }
    }, [isInteractive, state.activeProductId]);

    const select = useCallback((id) => dispatch({ type: 'SELECT', id }), []);

    // The one entry point UI should call. Safe to call as often as you
    // like — while resting it applies immediately; while transitioning it
    // never starts a second transition, it just updates the queued intent.
    const queueSelect = useCallback((id) => {
        queuedIdRef.current = id;
        dispatch({ type: 'SELECT', id });
    }, []);

    const handleExited = useCallback(() => dispatch({ type: 'EXITED' }), []);
    const handleEntered = useCallback(() => dispatch({ type: 'ENTERED' }), []);

    return {
        activeProductId: state.activeProductId,
        transition: state.transition,
        isInteractive,
        select,
        queueSelect,
        handleExited,
        handleEntered,
    };
}
