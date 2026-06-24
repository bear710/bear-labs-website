'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { VIEWER_STATES, getToggleTarget } from './useViewerState';
import { usePointerToggle } from './usePointerToggle';

/**
 * Placeholder mylar package + cartridge. Simple geometry only, per the
 * Phase 2 brief — replace with a GLB exposing PackageBody, PackageTop,
 * VapeBody, Mouthpiece, LabelFront, LabelBack nodes later.
 */
export const VAPE_DIMENSIONS = {
    packageClosedY: 0,
    packageOpenY: -0.1,
    packageOpenZ: -0.55,
    vapeHiddenY: 0.15,
    vapeOpenY: 1.05,
    vapeOpenZ: 0.45,
};

export default function VapeScene({ product, interactionState, interactionGo, transitionReady, reducedMotion }) {
    const packageRef = useRef(null);
    const vapeRef = useRef(null);
    const tweenRef = useRef(null);

    const packageMaterial = useMemo(
        () => new THREE.MeshPhysicalMaterial({ color: '#15171a', roughness: 0.3, metalness: 0.1, clearcoat: 0.4 }),
        []
    );
    const labelMaterial = useMemo(
        () => new THREE.MeshStandardMaterial({ color: product.accent || '#81CBD2', roughness: 0.45, metalness: 0.1 }),
        [product.accent]
    );
    const bodyMaterial = useMemo(
        () => new THREE.MeshStandardMaterial({ color: '#1c1e22', roughness: 0.25, metalness: 0.65 }),
        []
    );
    const mouthpieceMaterial = useMemo(
        () => new THREE.MeshStandardMaterial({ color: '#0a0b0c', roughness: 0.4, metalness: 0.3 }),
        []
    );

    useEffect(() => {
        return () => {
            packageMaterial.dispose();
            labelMaterial.dispose();
            bodyMaterial.dispose();
            mouthpieceMaterial.dispose();
        };
    }, [packageMaterial, labelMaterial, bodyMaterial, mouthpieceMaterial]);

    useEffect(() => {
        const pkg = packageRef.current;
        const vape = vapeRef.current;
        if (!pkg || !vape) return undefined;

        if (tweenRef.current) {
            tweenRef.current.kill();
            tweenRef.current = null;
        }

        if (interactionState === VIEWER_STATES.OPENING) {
            if (reducedMotion) {
                pkg.position.set(0, VAPE_DIMENSIONS.packageOpenY, VAPE_DIMENSIONS.packageOpenZ);
                vape.position.set(0, VAPE_DIMENSIONS.vapeOpenY, VAPE_DIMENSIONS.vapeOpenZ);
                interactionGo(VIEWER_STATES.OPEN);
                return undefined;
            }
            const tl = gsap.timeline({ onComplete: () => interactionGo(VIEWER_STATES.OPEN) });
            tl.to(pkg.position, { y: VAPE_DIMENSIONS.packageOpenY, z: VAPE_DIMENSIONS.packageOpenZ, duration: 0.9, ease: 'power2.inOut' });
            tl.to(vape.position, { y: VAPE_DIMENSIONS.vapeOpenY, z: VAPE_DIMENSIONS.vapeOpenZ, duration: 1.0, ease: 'power2.out' }, 0.25);
            tweenRef.current = tl;
        } else if (interactionState === VIEWER_STATES.CLOSING) {
            if (reducedMotion) {
                pkg.position.set(0, VAPE_DIMENSIONS.packageClosedY, 0);
                vape.position.set(0, VAPE_DIMENSIONS.vapeHiddenY, 0);
                interactionGo(VIEWER_STATES.IDLE);
                return undefined;
            }
            const tl = gsap.timeline({ onComplete: () => interactionGo(VIEWER_STATES.IDLE) });
            tl.to(vape.position, { y: VAPE_DIMENSIONS.vapeHiddenY, z: 0, duration: 0.8, ease: 'power2.inOut' });
            tl.to(pkg.position, { y: VAPE_DIMENSIONS.packageClosedY, z: 0, duration: 0.8, ease: 'power2.inOut' }, 0.1);
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
            {/* PackageBody + PackageTop: mylar pouch placeholder, opens by sliding back/down */}
            <group name="PackageBody" ref={packageRef} position={[0, VAPE_DIMENSIONS.packageClosedY, 0]}>
                <mesh material={packageMaterial}>
                    <boxGeometry args={[0.9, 1.35, 0.16]} />
                </mesh>
                <mesh name="LabelFront" material={labelMaterial} position={[0, 0.1, 0.082]}>
                    <planeGeometry args={[0.62, 0.62]} />
                </mesh>
                <mesh name="LabelBack" material={labelMaterial} position={[0, 0.1, -0.082]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[0.62, 0.62]} />
                </mesh>
                <mesh name="PackageTop" material={packageMaterial} position={[0, 0.72, 0]}>
                    <boxGeometry args={[0.9, 0.12, 0.16]} />
                </mesh>
            </group>

            {/* VapeBody + Mouthpiece: starts tucked behind the package, lifts out on open */}
            <group ref={vapeRef} position={[0, VAPE_DIMENSIONS.vapeHiddenY, 0]}>
                <mesh name="VapeBody" material={bodyMaterial}>
                    <cylinderGeometry args={[0.11, 0.11, 0.85, 24]} />
                </mesh>
                <mesh name="Mouthpiece" material={mouthpieceMaterial} position={[0, 0.5, 0]}>
                    <coneGeometry args={[0.075, 0.18, 24]} />
                </mesh>
            </group>
        </group>
    );
}
