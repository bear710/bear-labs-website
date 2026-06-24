'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { VIEWER_STATES, getToggleTarget } from './useViewerState';
import { usePointerToggle } from './usePointerToggle';

/**
 * Placeholder compact case for the ingestible. Deliberately simple, per
 * the brief — replace with a GLB exposing ContainerBody, Lid,
 * LabelFront, LabelBack, ProductInterior nodes later.
 */
export const AMPERSAND_DIMENSIONS = {
    lidClosedY: 0.14,
    lidOpenY: 0.42,
    lidOpenRotationX: -1.05,
};

export default function AmpersandScene({ product, interactionState, interactionGo, transitionReady, reducedMotion }) {
    const lidRef = useRef(null);
    const interiorRef = useRef(null);
    const tweenRef = useRef(null);

    const bodyMaterial = useMemo(
        () => new THREE.MeshPhysicalMaterial({ color: '#13151a', roughness: 0.25, metalness: 0.5, clearcoat: 0.5 }),
        []
    );
    const lidMaterial = useMemo(
        () => new THREE.MeshPhysicalMaterial({ color: '#0c0d10', roughness: 0.2, metalness: 0.6, clearcoat: 0.6 }),
        []
    );
    const labelMaterial = useMemo(
        () => new THREE.MeshStandardMaterial({ color: product.accent || '#FFE032', roughness: 0.45, metalness: 0.1 }),
        [product.accent]
    );
    const interiorMaterial = useMemo(
        () => new THREE.MeshStandardMaterial({ color: '#f2ead8', roughness: 0.5, metalness: 0 }),
        []
    );

    useEffect(() => {
        return () => {
            bodyMaterial.dispose();
            lidMaterial.dispose();
            labelMaterial.dispose();
            interiorMaterial.dispose();
        };
    }, [bodyMaterial, lidMaterial, labelMaterial, interiorMaterial]);

    useEffect(() => {
        const lid = lidRef.current;
        if (!lid) return undefined;

        if (tweenRef.current) {
            tweenRef.current.kill();
            tweenRef.current = null;
        }

        if (interactionState === VIEWER_STATES.OPENING) {
            if (reducedMotion) {
                lid.position.y = AMPERSAND_DIMENSIONS.lidOpenY;
                lid.rotation.x = AMPERSAND_DIMENSIONS.lidOpenRotationX;
                interactionGo(VIEWER_STATES.OPEN);
                return undefined;
            }
            const tl = gsap.timeline({ onComplete: () => interactionGo(VIEWER_STATES.OPEN) });
            tl.to(lid.position, { y: AMPERSAND_DIMENSIONS.lidOpenY, duration: 0.7, ease: 'power2.out' });
            tl.to(lid.rotation, { x: AMPERSAND_DIMENSIONS.lidOpenRotationX, duration: 0.7, ease: 'power2.out' }, 0);
            tweenRef.current = tl;
        } else if (interactionState === VIEWER_STATES.CLOSING) {
            if (reducedMotion) {
                lid.position.y = AMPERSAND_DIMENSIONS.lidClosedY;
                lid.rotation.x = 0;
                interactionGo(VIEWER_STATES.IDLE);
                return undefined;
            }
            const tl = gsap.timeline({ onComplete: () => interactionGo(VIEWER_STATES.IDLE) });
            tl.to(lid.rotation, { x: 0, duration: 0.6, ease: 'power2.inOut' });
            tl.to(lid.position, { y: AMPERSAND_DIMENSIONS.lidClosedY, duration: 0.6, ease: 'power2.inOut' }, 0);
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
        <group {...pointerHandlers}>
            <mesh name="ContainerBody" material={bodyMaterial} position={[0, -0.06, 0]}>
                <boxGeometry args={[0.85, 0.32, 0.55]} />
            </mesh>
            <mesh name="LabelFront" material={labelMaterial} position={[0, -0.06, 0.276]}>
                <planeGeometry args={[0.5, 0.18]} />
            </mesh>
            <mesh name="LabelBack" material={labelMaterial} position={[0, -0.06, -0.276]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[0.5, 0.18]} />
            </mesh>
            <mesh name="ProductInterior" ref={interiorRef} material={interiorMaterial} position={[0, -0.04, 0]}>
                <boxGeometry args={[0.62, 0.05, 0.38]} />
            </mesh>
            <group name="Lid" ref={lidRef} position={[0, AMPERSAND_DIMENSIONS.lidClosedY, -0.27]}>
                <mesh material={lidMaterial} position={[0, 0, 0.27]}>
                    <boxGeometry args={[0.87, 0.1, 0.57]} />
                </mesh>
            </group>
        </group>
    );
}
