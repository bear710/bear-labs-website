'use client';
import { VIEWER_STATES } from './useViewerState';
import styles from './Product3DViewer.module.css';

const OPEN_STATES = [VIEWER_STATES.OPEN, VIEWER_STATES.PRODUCT_FOCUS];

// One universal wording regardless of product type (jar/vape/Ampersand).
const COPY = {
    closed: 'Drag to rotate · tap to explore',
    open: 'Drag to inspect · tap to close',
    [VIEWER_STATES.OPENING]: 'Opening…',
    [VIEWER_STATES.CLOSING]: 'Closing…',
};

export default function InteractionHint({ state }) {
    let text;
    if (state === VIEWER_STATES.OPENING || state === VIEWER_STATES.CLOSING) {
        text = COPY[state];
    } else if (OPEN_STATES.includes(state)) {
        text = COPY.open;
    } else {
        text = COPY.closed;
    }
    return (
        <p className={styles.hint} aria-hidden="true">
            {text}
        </p>
    );
}
