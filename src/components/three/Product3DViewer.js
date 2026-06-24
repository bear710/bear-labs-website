'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useViewerState, VIEWER_STATES } from './useViewerState';
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

const OPEN_LABELS = {
    open: 'Open Jar',
    extract: 'Extract Vape',
    reveal: 'Reveal Product',
};

const RESET_LABELS = {
    open: 'Reset the jar to its closed state',
    extract: 'Reset the vape back into its package',
    reveal: 'Reset the package to its closed state',
};

/**
 * One product's stage + its own Open/Reset controls. Rendered keyed by
 * product id from ProductShowroom — switching products remounts this,
 * which is what resets useViewerState back to idle with no manual
 * cleanup required.
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
    const { state, go } = useViewerState();
    const controlsRef = useRef(null);

    const transitionReady = transition === SHOWROOM_STATES.READY || transition === SHOWROOM_STATES.IDLE;
    const canOpen = transitionReady && (state === VIEWER_STATES.IDLE || state === VIEWER_STATES.INSPECTING);
    const canReset = transitionReady && (state === VIEWER_STATES.OPEN || state === VIEWER_STATES.PRODUCT_FOCUS);

    const handleOpen = () => {
        if (canOpen) go(VIEWER_STATES.OPENING);
    };

    const handleReset = () => {
        if (canReset) go(VIEWER_STATES.CLOSING);
    };

    const openLabel = OPEN_LABELS[product.interactionType] || OPEN_LABELS.open;
    const resetLabel = RESET_LABELS[product.interactionType] || RESET_LABELS.open;

    return (
        <div className={styles.viewer}>
            <div
                className={styles.canvasWrap}
                role="img"
                aria-label={`Interactive 3D preview of ${product.name}. Drag to rotate, or use the controls below.`}
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

                {mounted && webglSupported && <InteractionHint state={state} product={product} />}
            </div>

            <div className={styles.controls}>
                <button
                    type="button"
                    className={styles.controlBtn}
                    onClick={handleOpen}
                    disabled={!mounted || !webglSupported || !canOpen}
                    aria-label={openLabel}
                >
                    {openLabel}
                </button>
                <button
                    type="button"
                    className={styles.controlBtn}
                    onClick={handleReset}
                    disabled={!mounted || !webglSupported || !canReset}
                    aria-label={resetLabel}
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
