'use client';
import { useEffect, useRef } from 'react';
import { ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import LightingRig from './LightingRig';
import CameraController from './CameraController';
import PlaceholderJar, { JAR_DIMENSIONS } from './PlaceholderJar';
import { VIEWER_STATES } from './useViewerState';

const FULL_TURNS = 3;

/**
 * Orchestrates the lid open/close GSAP timeline and owns the raycast
 * handlers for the lid + product surface. Camera motion lives entirely
 * in CameraController so the two concerns never tangle.
 */
export default function JarScene({ state, go, reducedMotion, controlsRef }) {
    const lidRef = useRef(null);
    const productRef = useRef(null);
    const tweenRef = useRef(null);

    useEffect(() => {
        const lid = lidRef.current;
        if (!lid) return undefined;

        if (tweenRef.current) {
            tweenRef.current.kill();
            tweenRef.current = null;
        }

        if (state === VIEWER_STATES.OPENING) {
            if (reducedMotion) {
                lid.rotation.y = Math.PI * 2 * FULL_TURNS;
                lid.position.set(JAR_DIMENSIONS.lidOpenX, JAR_DIMENSIONS.lidOpenY, JAR_DIMENSIONS.lidOpenZ);
                go(VIEWER_STATES.OPEN);
                return undefined;
            }
            const tl = gsap.timeline({ onComplete: () => go(VIEWER_STATES.OPEN) });
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
        } else if (state === VIEWER_STATES.CLOSING) {
            if (reducedMotion) {
                lid.rotation.y = 0;
                lid.position.set(0, JAR_DIMENSIONS.lidClosedY, 0);
                go(VIEWER_STATES.IDLE);
                return undefined;
            }
            const tl = gsap.timeline({ onComplete: () => go(VIEWER_STATES.IDLE) });
            tl.to(lid.position, { y: JAR_DIMENSIONS.lidClosedY, x: 0, z: 0, duration: 0.9, ease: 'power2.inOut' });
            tl.to(lid.rotation, { y: 0, duration: 0.9, ease: 'power1.out' }, 0.1);
            tweenRef.current = tl;
        }

        return () => {
            if (tweenRef.current) tweenRef.current.kill();
        };
    }, [state, reducedMotion, go]);

    const handleLidPointerDown = (e) => {
        e.stopPropagation();
        if (state === VIEWER_STATES.IDLE || state === VIEWER_STATES.INSPECTING) {
            go(VIEWER_STATES.OPENING);
        }
    };

    const handleProductPointerDown = (e) => {
        e.stopPropagation();
        if (state === VIEWER_STATES.OPEN) {
            go(VIEWER_STATES.PRODUCT_FOCUS);
        } else if (state === VIEWER_STATES.PRODUCT_FOCUS) {
            go(VIEWER_STATES.OPEN);
        }
    };

    const lidInteractive = state === VIEWER_STATES.IDLE || state === VIEWER_STATES.INSPECTING;
    const productInteractive = state === VIEWER_STATES.OPEN || state === VIEWER_STATES.PRODUCT_FOCUS;

    return (
        <>
            <color attach="background" args={['#070707']} />
            <LightingRig />
            <PlaceholderJar
                lidGroupRef={lidRef}
                productRef={productRef}
                onLidPointerDown={handleLidPointerDown}
                onProductPointerDown={handleProductPointerDown}
                lidInteractive={lidInteractive}
                productInteractive={productInteractive}
            />
            <ContactShadows
                position={[0, JAR_DIMENSIONS.bottomY - 0.05, 0]}
                opacity={0.55}
                scale={6}
                blur={2.4}
                far={2}
                resolution={256}
                color="#000000"
            />
            <CameraController state={state} reducedMotion={reducedMotion} controlsRef={controlsRef} go={go} />
        </>
    );
}
