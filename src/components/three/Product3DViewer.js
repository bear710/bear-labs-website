'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useViewerState, VIEWER_STATES } from './useViewerState';
import InteractionHint from './InteractionHint';
import styles from './Product3DViewer.module.css';

/**
 * FUTURE MODEL SUPPORT
 * PlaceholderJar currently builds the jar from procedural geometry.
 * To swap in a real model later, replace PlaceholderJar's contents with
 * a drei <primitive object={gltf.scene} /> (via useGLTF), as long as the
 * GLB contains nodes named exactly:
 *   - JarBody          (the glass body)
 *   - Lid               (the separately-animatable lid, same local origin
 *                         used here: closed at y≈0.975, open at y≈2.25)
 *   - ProductSurface    (raycastable mesh for the product-focus interaction)
 *   - Label             (the label band)
 * JarScene, CameraController, and the click handlers only depend on the
 * lid/product refs and those names — no other code needs to change.
 */

const ViewerCanvas = dynamic(() => import('./ViewerCanvas'), {
    ssr: false,
    loading: () => null,
});

function detectWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
    } catch {
        return false;
    }
}

export default function Product3DViewer() {
    const { state, go } = useViewerState();
    const [mounted, setMounted] = useState(false);
    const [webglSupported, setWebglSupported] = useState(true);
    const [reducedMotion, setReducedMotion] = useState(false);
    const controlsRef = useRef(null);

    useEffect(() => {
        setMounted(true);
        setWebglSupported(detectWebGL());

        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (e) => setReducedMotion(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const dpr = useMemo(() => {
        if (typeof window === 'undefined') return [1, 1];
        return [1, Math.min(window.devicePixelRatio || 1, 2)];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted]);

    const canOpen = state === VIEWER_STATES.IDLE || state === VIEWER_STATES.INSPECTING;
    const canReset = state === VIEWER_STATES.OPEN || state === VIEWER_STATES.PRODUCT_FOCUS;

    const handleOpen = () => {
        if (canOpen) go(VIEWER_STATES.OPENING);
    };

    const handleReset = () => {
        if (canReset) go(VIEWER_STATES.CLOSING);
    };

    return (
        <div className={styles.viewer}>
            <div
                className={styles.canvasWrap}
                role="img"
                aria-label="Interactive 3D preview of a Bear Labs concentrate jar. Drag to rotate, or use the Open and Reset buttons below."
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
                        state={state}
                        go={go}
                        reducedMotion={reducedMotion}
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
                    onClick={handleOpen}
                    disabled={!mounted || !webglSupported || !canOpen}
                    aria-label="Open the jar lid"
                >
                    Open Jar
                </button>
                <button
                    type="button"
                    className={styles.controlBtn}
                    onClick={handleReset}
                    disabled={!mounted || !webglSupported || !canReset}
                    aria-label="Reset the jar to its closed state"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
