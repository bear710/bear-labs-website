'use client';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { MODEL_REGISTRY } from './modelRegistry';
import { getTransitionPose } from './productConfig';
import { SHOWROOM_STATES } from './useShowroomTransition';

/**
 * Lives inside the Canvas. Wraps the active product's scene in a group
 * that the showroom slides/rotates in and out on product switches.
 * This is purely a transform animation — it never touches the
 * product's own interaction state (open/extract/reveal).
 */
export default function ProductStage({
    product,
    transition,
    onExited,
    onEntered,
    reducedMotion,
    interactionState,
    interactionGo,
}) {
    const groupRef = useRef(null);
    const tweenRef = useRef(null);

    useLayoutEffect(() => {
        const group = groupRef.current;
        if (!group) return undefined;

        if (tweenRef.current) {
            tweenRef.current.kill();
            tweenRef.current = null;
        }

        if (transition === SHOWROOM_STATES.EXITING) {
            const pose = getTransitionPose(product.exitDirection);
            if (reducedMotion) {
                group.position.set(...pose.position);
                group.rotation.set(0, pose.rotationY, 0);
                onExited();
                return undefined;
            }
            tweenRef.current = gsap
                .timeline({ onComplete: onExited })
                .to(group.position, { x: pose.position[0], y: pose.position[1], z: pose.position[2], duration: 0.38, ease: 'power2.in' })
                .to(group.rotation, { y: pose.rotationY, duration: 0.38, ease: 'power2.in' }, 0)
                .to(group.scale, { x: 0.85, y: 0.85, z: 0.85, duration: 0.38, ease: 'power2.in' }, 0);
        } else if (transition === SHOWROOM_STATES.SWAPPING || transition === SHOWROOM_STATES.ENTERING) {
            const pose = getTransitionPose(product.entryDirection);
            // Snap to the entry pose first (idempotent) so there's never a
            // visible frame at the wrong (center, full-scale) transform
            // before the tween-in below kicks off.
            group.position.set(...pose.position);
            group.rotation.set(0, pose.rotationY, 0);
            group.scale.set(0.85, 0.85, 0.85);

            if (transition === SHOWROOM_STATES.ENTERING) {
                if (reducedMotion) {
                    group.position.set(0, 0, 0);
                    group.rotation.set(0, 0, 0);
                    group.scale.set(1, 1, 1);
                    onEntered();
                    return undefined;
                }
                tweenRef.current = gsap
                    .timeline({ onComplete: onEntered })
                    .to(group.position, { x: 0, y: 0, z: 0, duration: 0.48, ease: 'power2.out' })
                    .to(group.rotation, { y: 0, duration: 0.48, ease: 'power2.out' }, 0)
                    .to(group.scale, { x: 1, y: 1, z: 1, duration: 0.48, ease: 'power2.out' }, 0);
            }
        } else {
            // idle / ready: settled, no drift across repeated cycles
            group.position.set(0, 0, 0);
            group.rotation.set(0, 0, 0);
            group.scale.set(1, 1, 1);
        }

        return () => {
            if (tweenRef.current) tweenRef.current.kill();
        };
    }, [transition, product, reducedMotion, onExited, onEntered]);

    const Scene = MODEL_REGISTRY[product.modelType];
    if (!Scene) return null;

    return (
        <group ref={groupRef}>
            <Scene
                product={product}
                interactionState={interactionState}
                interactionGo={interactionGo}
                transitionReady={transition === SHOWROOM_STATES.READY || transition === SHOWROOM_STATES.IDLE}
                reducedMotion={reducedMotion}
            />
        </group>
    );
}
