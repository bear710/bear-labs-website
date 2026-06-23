'use client';
import { VIEWER_STATES } from './useViewerState';
import styles from './Product3DViewer.module.css';

const COPY = {
    [VIEWER_STATES.IDLE]: 'Drag to rotate · tap the lid to open',
    [VIEWER_STATES.INSPECTING]: 'Drag to rotate · tap the lid to open',
    [VIEWER_STATES.OPENING]: 'Opening…',
    [VIEWER_STATES.OPEN]: 'Drag to look around · tap the product to focus',
    [VIEWER_STATES.PRODUCT_FOCUS]: 'Tap the product again to step back',
    [VIEWER_STATES.CLOSING]: 'Closing…',
};

export default function InteractionHint({ state }) {
    const text = COPY[state] || COPY[VIEWER_STATES.IDLE];
    return (
        <p className={styles.hint} aria-hidden="true">
            {text}
        </p>
    );
}
