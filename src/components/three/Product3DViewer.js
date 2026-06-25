'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useViewerState, VIEWER_STATES, getToggleTarget } from './useViewerState';
import { SHOWROOM_STATES } from './useShowroomTransition';
import InteractionHint from './InteractionHint';
import styles from './Product3DViewer.module.css';

/**
 * FUTURE MODEL SUPPORT
 * Placeholder scenes (PlaceholderJar, VapeScene, AmpersandScene) build
 * from procedural geometry. To swap in a real GLB later, point a
 * product's modelPath at the asset and have its scene component load it
 * via drei's useGLTF, as long as the GLB's nodes are named to match what
 * each scene currently expects:
 *   jar            -> JarBody, Lid, ProductSurface, Label
 *   vapePackage    -> PackageBody, PackageTop, VapeBody, Mouthpiece, LabelFront, LabelBack
 *   ampersandPackage -> ContainerBody, Lid, LabelFront, LabelBack, ProductInterior
 * ProductStage, CameraController, and the showroom selector only depend
 * on productConfig fields and the modelRegistry — no other code needs
 * to change when a GLB is introduced.
 */

const ViewerCanvas = dynamic(() => import('./ViewerCanvas'), {
    ssr: false,
    loading: () => null,
});

const OPEN_STATES = [VIEWER_STATES.OPEN, VIEWER_STATES.PRODUCT_FOCUS];

// One universal label regardless of product type (jar/vape/Ampersand) —
// avoids product-specific wording in both the visible button and its
// aria-label.
const TOGGLE_LABEL_CLOSED = 'Explore Package';
const TOGGLE_LABEL_OPEN = 'Close Package';

/**
 * One product's stage + its toggle/reset controls. Rendered keyed by
 * product id from ProductShowroom — switching products remounts this,
 * which is what resets useViewerState back to idle with no manual
 * cleanup required.
 *
 * The primary button below and every scene's canvas tap handler both
 * call `getToggleTarget(state)` — the single shared decision of what a
 * tap/click means right now — so there is exactly one implementation of
 * open-vs-close, never two that can drift apart.
 */
export default function Product3DViewer({
    product,
    transition,
    onExited,
    onEntered,
    mounted,
    webglSupported,
    reducedMotion,
    isMobile,
    dpr,
}) {
    const { state, go, force } = useViewerState();
    const controlsRef = useRef(null);

    const transitionReady = transition === SHOWROOM_STATES.READY || transition === SHOWROOM_STATES.IDLE;
    const toggleTarget = transitionReady ? getToggleTarget(state) : null;
    const isOpenish = OPEN_STATES.includes(state) || state === VIEWER_STATES.CLOSING;

    const canResetView = transitionReady && (OPEN_STATES.includes(state) || state === VIEWER_STATES.INSPECTING);

    const handleToggle = () => {
        if (toggleTarget) go(toggleTarget);
    };

    const handleResetView = () => {
        if (!canResetView) return;
        if (OPEN_STATES.includes(state)) {
            go(VIEWER_STATES.CLOSING);
        } else if (state === VIEWER_STATES.INSPECTING) {
            force(VIEWER_STATES.IDLE);
        }
    };

    const toggleLabel = isOpenish ? TOGGLE_LABEL_OPEN : TOGGLE_LABEL_CLOSED;

    return (
        <div className={styles.viewer}>
            <div
                className={styles.canvasWrap}
                role="img"
                aria-label={`Interactive 3D preview of ${product.name}. Drag to rotate, tap to ${
                    isOpenish ? 'close' : 'open'
                }, or use the controls below.`}
            >
                {!mounted && (
                    <div className={styles.loadingFallback}>
                        <div className={styles.spinner} />
                    </div>
                )}

                {mounted && !webglSupported && (
                    <div className={styles.webglFallback}>
                        <p>3D preview isn&apos;t available on this device, but the rest of the page works as normal.</p>
                    </div>
                )}

                {mounted && webglSupported && (
                    <ViewerCanvas
                        product={product}
                        transition={transition}
                        onExited={onExited}
                        onEntered={onEntered}
                        interactionState={state}
                        interactionGo={go}
                        reducedMotion={reducedMotion}
                        isMobile={isMobile}
                        controlsRef={controlsRef}
                        dpr={dpr}
                    />
                )}

                {mounted && webglSupported && <InteractionHint state={state} />}
            </div>

            <div className={styles.controls}>
                <button
                    type="button"
                    className={styles.controlBtn}
                    onClick={handleToggle}
                    disabled={!mounted || !webglSupported || !toggleTarget}
                    aria-label={toggleLabel}
                >
                    {toggleLabel}
                </button>
                <button
                    type="button"
                    className={styles.controlBtnSecondary}
                    onClick={handleResetView}
                    disabled={!mounted || !webglSupported || !canResetView}
                    aria-label="Reset view and close the product"
                >
                    Reset View
                </button>
            </div>
        </div>
    );
}
