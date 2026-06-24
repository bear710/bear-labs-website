'use client';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import PlaceholderJar, { JAR_DIMENSIONS } from './PlaceholderJar';
import TemporaryJarModel from './TemporaryJarModel';
import ModelLoadBoundary from './ModelLoadBoundary';
import { resolveJarVariant } from './productConfig';
import { VIEWER_STATES, getToggleTarget } from './useViewerState';
import { usePointerToggle } from './usePointerToggle';

const FULL_TURNS = 3;

// Open position is expressed as a delta from whatever the lid's actual
// closed position turns out to be (captured at mount, see below) —
// JarScene never hard-codes an absolute target, so it works identically
// whether the lid comes from the procedural placeholder or the imported
// GLB (or, later, the final Bear Labs asset) without caring which.
const OPEN_DELTA = {
    y: JAR_DIMENSIONS.lidOpenY - JAR_DIMENSIONS.lidClosedY,
    x: JAR_DIMENSIONS.lidOpenX,
    z: JAR_DIMENSIONS.lidOpenZ,
};

/**
 * Lid open/close timeline + a single tap-to-toggle handler covering the
 * whole jar. Lighting, camera, and ground shadow are shared (see
 * ViewerCanvas) — this component only owns jar geometry and its own
 * interaction.
 *
 * Renders the imported GLB (TemporaryJarModel) with the procedural
 * PlaceholderJar as both the Suspense loading fallback and the
 * ModelLoadBoundary error fallback, so a slow network or a bad asset
 * never blocks or crashes the showroom.
 *
 * Conforms to the showroom's scene contract:
 *   { product, interactionState, interactionGo, transitionReady }
 */
export default function JarScene({ product, interactionState, interactionGo, transitionReady, reducedMotion }) {
    const lidObjectRef = useRef(null);
    const closedPoseRef = useRef(null);
    const productRef = useRef(null);
    const tweenRef = useRef(null);
    const variant = resolveJarVariant(product);

    // Bumped every time the underlying lid Object3D actually changes
    // (e.g. the Suspense fallback swaps to the real loaded model) so the
    // animation effect below re-evaluates against the fresh object
    // instead of silently continuing to target a detached one.
    const [lidGeneration, setLidGeneration] = useState(0);

    const setLidRef = useCallback((node) => {
        lidObjectRef.current = node;
        if (node) {
            closedPoseRef.current = { x: node.position.x, y: node.position.y, z: node.position.z };
            setLidGeneration((g) => g + 1);
        }
    }, []);

    useEffect(() => {
        const lid = lidObjectRef.current;
        const closed = closedPoseRef.current;
        if (!lid || !closed) return undefined;

        if (tweenRef.current) {
            tweenRef.current.kill();
            tweenRef.current = null;
        }

        if (interactionState === VIEWER_STATES.OPENING) {
            const open = { x: closed.x + OPEN_DELTA.x, y: closed.y + OPEN_DELTA.y, z: closed.z + OPEN_DELTA.z };
            if (reducedMotion) {
                lid.rotation.y = Math.PI * 2 * FULL_TURNS;
                lid.position.set(open.x, open.y, open.z);
                interactionGo(VIEWER_STATES.OPEN);
                return undefined;
            }
            const tl = gsap.timeline({ onComplete: () => interactionGo(VIEWER_STATES.OPEN) });
            tl.to(lid.rotation, { y: Math.PI * 2 * FULL_TURNS, duration: 1.1, ease: 'power1.in' });
            tl.to(lid.position, { ...open, duration: 1.0, ease: 'power2.out' }, 0.35);
            tweenRef.current = tl;
        } else if (interactionState === VIEWER_STATES.CLOSING) {
            if (reducedMotion) {
                lid.rotation.y = 0;
                lid.position.set(closed.x, closed.y, closed.z);
                interactionGo(VIEWER_STATES.IDLE);
                return undefined;
            }
            const tl = gsap.timeline({ onComplete: () => interactionGo(VIEWER_STATES.IDLE) });
            tl.to(lid.position, { ...closed, duration: 0.9, ease: 'power2.inOut' });
            tl.to(lid.rotation, { y: 0, duration: 0.9, ease: 'power1.out' }, 0.1);
            tweenRef.current = tl;
        }

        return () => {
            if (tweenRef.current) tweenRef.current.kill();
        };
    }, [interactionState, reducedMotion, interactionGo, lidGeneration]);

    const toggleEnabled = transitionReady && getToggleTarget(interactionState) !== null;
    const handleTap = () => {
        const target = getToggleTarget(interactionState);
        if (target) interactionGo(target);
    };
    const pointerHandlers = usePointerToggle(handleTap, toggleEnabled);

    const fallback = <PlaceholderJar lidGroupRef={setLidRef} productRef={productRef} variant={variant} />;

    return (
        <group scale={variant.scale} {...pointerHandlers}>
            <ModelLoadBoundary fallback={fallback}>
                <Suspense fallback={fallback}>
                    <TemporaryJarModel lidGroupRef={setLidRef} productRef={productRef} variant={variant} />
                </Suspense>
            </ModelLoadBoundary>
        </group>
    );
}
