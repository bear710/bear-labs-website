'use client';
import { VIEWER_STATES } from './useViewerState';
import styles from './Product3DViewer.module.css';

const COPY_BY_TYPE = {
    open: {
        [VIEWER_STATES.IDLE]: 'Drag to rotate · tap the lid to open',
        [VIEWER_STATES.INSPECTING]: 'Drag to rotate · tap the lid to open',
        [VIEWER_STATES.OPENING]: 'Opening…',
        [VIEWER_STATES.OPEN]: 'Drag to look around · tap the product to focus',
        [VIEWER_STATES.PRODUCT_FOCUS]: 'Tap the product again to step back',
        [VIEWER_STATES.CLOSING]: 'Closing…',
    },
    extract: {
        [VIEWER_STATES.IDLE]: 'Drag to rotate · tap the package to extract the vape',
        [VIEWER_STATES.INSPECTING]: 'Drag to rotate · tap the package to extract the vape',
        [VIEWER_STATES.OPENING]: 'Extracting…',
        [VIEWER_STATES.OPEN]: 'Drag to look around · tap the vape to focus',
        [VIEWER_STATES.PRODUCT_FOCUS]: 'Tap the vape again to step back',
        [VIEWER_STATES.CLOSING]: 'Returning to package…',
    },
    reveal: {
        [VIEWER_STATES.IDLE]: 'Drag to rotate · tap the lid to reveal',
        [VIEWER_STATES.INSPECTING]: 'Drag to rotate · tap the lid to reveal',
        [VIEWER_STATES.OPENING]: 'Revealing…',
        [VIEWER_STATES.OPEN]: 'Drag to look around',
        [VIEWER_STATES.PRODUCT_FOCUS]: 'Drag to look around',
        [VIEWER_STATES.CLOSING]: 'Closing…',
    },
};

export default function InteractionHint({ state, product }) {
    const copy = COPY_BY_TYPE[product?.interactionType] || COPY_BY_TYPE.open;
    const text = copy[state] || copy[VIEWER_STATES.IDLE];
    return (
        <p className={styles.hint} aria-hidden="true">
            {text}
        </p>
    );
}
