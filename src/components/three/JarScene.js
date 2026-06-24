'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import PlaceholderJar, { JAR_DIMENSIONS } from './PlaceholderJar';
import { resolveJarVariant } from './productConfig';
import { VIEWER_STATES } from './useViewerState';

const FULL_TURNS = 3;

/**
 * Lid open/close timeline + lid/product raycast handlers. Lighting,
 * camera, and ground shadow are shared (see ViewerCanvas) — this
 * component only owns jar geometry and its own interaction.
 *
 * Conforms to the showroom's scene contract:
 *   { product, interactionState, interactionGo, transitionReady }
 */
export default function JarScene({ product, interactionState, interactionGo, transitionReady, reducedMotion }) {
    const lidRef = useRef(null);
    const productRef = useRef(null);
    const tweenRef = useRef(null);
    const variant = resolveJarVariant(product);

    useEffect(() => {
        const lid = lidRef.current;
        if (!lid) return undefined;

        if (tweenRef.current) {
            tweenRef.current.kill();
            tweenRef.current = null;
        }

        if (interactionState === VIEWER_STATES.OPENING) {
            if (reducedMotion) {
                lid.rotation.y = Math.PI * 2 * FULL_TURNS;
                lid.position.set(JAR_DIMENSIONS.lidOpenX, JAR_DIMENSIONS.lidOpenY, JAR_DIMENSIONS.lidOpenZ);
                interactionGo(VIEWER_STATES.OPEN);
                return undefined;
            }
            const tl = gsap.timeline({ onComplete: () => interactionGo(VIEWER_STATES.OPEN) });
            tl.to(lid.rotation, { y: Math.PI * 2 * FULL_TURNS, duration: 1.1, ease: 'power1.in' });
            tl.to(
                lid.position,
                {
                    y: JAR_DIMENSIONS.lidOpenY,
                    x: JAR_DIMENSIONS.lidOpenX,
                    z: JAR_DIMENSIONS.lidOpenZ,
                    duration: 1.0,
                    ease: 'power2.out',
                },
                0.35
            );
            tweenRef.current = tl;
        } else if (interactionState === VIEWER_STATES.CLOSING) {
            if (reducedMotion) {
                lid.rotation.y = 0;
                lid.position.set(0, JAR_DIMENSIONS.lidClosedY, 0);
                interactionGo(VIEWER_STATES.IDLE);
                return undefined;
            }
            const tl = gsap.timeline({ onComplete: () => interactionGo(VIEWER_STATES.IDLE) });
            tl.to(lid.position, { y: JAR_DIMENSIONS.lidClosedY, x: 0, z: 0, duration: 0.9, ease: 'power2.inOut' });
            tl.to(lid.rotation, { y: 0, duration: 0.9, ease: 'power1.out' }, 0.1);
            tweenRef.current = tl;
        }

        return () => {
            if (tweenRef.current) tweenRef.current.kill();
        };
    }, [interactionState, reducedMotion, interactionGo]);

    const handleLidPointerDown = (e) => {
        e.stopPropagation();
        if (!transitionReady) return;
        if (interactionState === VIEWER_STATES.IDLE || interactionState === VIEWER_STATES.INSPECTING) {
            interactionGo(VIEWER_STATES.OPENING);
        }
    };

    const handleProductPointerDown = (e) => {
        e.stopPropagation();
        if (!transitionReady) return;
        if (interactionState === VIEWER_STATES.OPEN) {
            interactionGo(VIEWER_STATES.PRODUCT_FOCUS);
        } else if (interactionState === VIEWER_STATES.PRODUCT_FOCUS) {
            interactionGo(VIEWER_STATES.OPEN);
        }
    };

    const lidInteractive =
        transitionReady && (interactionState === VIEWER_STATES.IDLE || interactionState === VIEWER_STATES.INSPECTING);
    const productInteractive =
        transitionReady && (interactionState === VIEWER_STATES.OPEN || interactionState === VIEWER_STATES.PRODUCT_FOCUS);

    return (
        <group scale={variant.scale}>
            <PlaceholderJar
                lidGroupRef={lidRef}
                productRef={productRef}
                onLidPointerDown={handleLidPointerDown}
                onProductPointerDown={handleProductPointerDown}
                lidInteractive={lidInteractive}
                productInteractive={productInteractive}
                variant={variant}
            />
        </group>
    );
}
