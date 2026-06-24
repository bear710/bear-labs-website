'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import PlaceholderJar, { JAR_DIMENSIONS } from './PlaceholderJar';
import { resolveJarVariant } from './productConfig';
import { VIEWER_STATES, getToggleTarget } from './useViewerState';
import { usePointerToggle } from './usePointerToggle';

const FULL_TURNS = 3;

/**
 * Lid open/close timeline + a single tap-to-toggle handler covering the
 * whole jar. Lighting, camera, and ground shadow are shared (see
 * ViewerCanvas) — this component only owns jar geometry and its own
 * interaction.
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

    const toggleEnabled = transitionReady && getToggleTarget(interactionState) !== null;
    const handleTap = () => {
        const target = getToggleTarget(interactionState);
        if (target) interactionGo(target);
    };
    const pointerHandlers = usePointerToggle(handleTap, toggleEnabled);

    return (
        <group scale={variant.scale} {...pointerHandlers}>
            <PlaceholderJar lidGroupRef={lidRef} productRef={productRef} variant={variant} />
        </group>
    );
}
