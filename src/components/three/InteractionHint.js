'use client';
import { VIEWER_STATES } from './useViewerState';
import styles from './Product3DViewer.module.css';

const OPEN_STATES = [VIEWER_STATES.OPEN, VIEWER_STATES.PRODUCT_FOCUS];

const COPY_BY_TYPE = {
    open: {
        closed: 'Drag to rotate · tap to open',
        open: 'Drag to inspect · tap to close',
        [VIEWER_STATES.OPENING]: 'Opening…',
        [VIEWER_STATES.CLOSING]: 'Closing…',
    },
    extract: {
        closed: 'Drag to rotate · tap to reveal',
        open: 'Drag to inspect · tap to return',
        [VIEWER_STATES.OPENING]: 'Extracting…',
        [VIEWER_STATES.CLOSING]: 'Returning…',
    },
    reveal: {
        closed: 'Drag to rotate · tap to reveal',
        open: 'Drag to inspect · tap to close',
        [VIEWER_STATES.OPENING]: 'Revealing…',
        [VIEWER_STATES.CLOSING]: 'Closing…',
    },
};

export default function InteractionHint({ state, product }) {
    const copy = COPY_BY_TYPE[product?.interactionType] || COPY_BY_TYPE.open;
    let text;
    if (state === VIEWER_STATES.OPENING || state === VIEWER_STATES.CLOSING) {
        text = copy[state];
    } else if (OPEN_STATES.includes(state)) {
        text = copy.open;
    } else {
        text = copy.closed;
    }
    return (
        <p className={styles.hint} aria-hidden="true">
            {text}
        </p>
    );
}
