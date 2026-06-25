'use client';
import { useEffect, useMemo, useState } from 'react';
import { useShowroomTransition } from './useShowroomTransition';
import { getProductById, getAdjacentProduct } from './productConfig';
import Product3DViewer from './Product3DViewer';
import ProductInfo from './ProductInfo';
import ProductSelector from './ProductSelector';
import styles from './ProductShowroom.module.css';

const MOBILE_QUERY = '(max-width: 768px)';

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

/**
 * Top-level showroom: one centered product at a time, a selector below,
 * and Prev/Next controls. Coordinates product switching (this file) and
 * per-product interaction (Product3DViewer, keyed by product id) as two
 * separate, loosely-coupled state machines.
 */
export default function ProductShowroom() {
    const { activeProductId, transition, isInteractive, queueSelect, handleExited, handleEntered } =
        useShowroomTransition();
    const activeProduct = useMemo(() => getProductById(activeProductId), [activeProductId]);

    const [mounted, setMounted] = useState(false);
    const [webglSupported, setWebglSupported] = useState(true);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);
        setWebglSupported(detectWebGL());

        const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(reduceMq.matches);
        const reduceHandler = (e) => setReducedMotion(e.matches);
        reduceMq.addEventListener('change', reduceHandler);

        const mobileMq = window.matchMedia(MOBILE_QUERY);
        setIsMobile(mobileMq.matches);
        const mobileHandler = (e) => setIsMobile(e.matches);
        mobileMq.addEventListener('change', mobileHandler);

        return () => {
            reduceMq.removeEventListener('change', reduceHandler);
            mobileMq.removeEventListener('change', mobileHandler);
        };
    }, []);

    const dpr = useMemo(() => {
        if (typeof window === 'undefined') return [1, 1];
        return [1, Math.min(window.devicePixelRatio || 1, 2)];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted]);

    const handlePrev = () => queueSelect(getAdjacentProduct(activeProductId, -1).id);
    const handleNext = () => queueSelect(getAdjacentProduct(activeProductId, 1).id);

    return (
        <div className={styles.showroom}>
            <ProductInfo product={activeProduct} />

            <div className={styles.stageRow}>
                <button
                    type="button"
                    className={styles.navBtn}
                    onClick={handlePrev}
                    aria-disabled={!isInteractive}
                    aria-label="Previous product"
                >
                    ‹
                </button>

                <Product3DViewer
                    key={activeProductId}
                    product={activeProduct}
                    transition={transition}
                    onExited={handleExited}
                    onEntered={handleEntered}
                    mounted={mounted}
                    webglSupported={webglSupported}
                    reducedMotion={reducedMotion}
                    isMobile={isMobile}
                    dpr={dpr}
                />

                <button
                    type="button"
                    className={styles.navBtn}
                    onClick={handleNext}
                    aria-disabled={!isInteractive}
                    aria-label="Next product"
                >
                    ›
                </button>
            </div>

            <ProductSelector activeProduct={activeProduct} onQueueSelect={queueSelect} isInteractive={isInteractive} />
        </div>
    );
}
