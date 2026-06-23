'use client';
import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Shared dimensions so CameraController and JarScene can reason about
 * jar geometry without re-deriving magic numbers.
 *
 * FUTURE GLB SUPPORT: when a real GLB replaces this procedural jar, it
 * should expose nodes named exactly "JarBody", "Lid", "ProductSurface"
 * and "Label" (matching the group/mesh `name` props below) so the rest
 * of the viewer (lid ref, camera targets, raycast targets) keeps working
 * unmodified. See README note in Product3DViewer.js.
 */
export const JAR_DIMENSIONS = {
    radius: 0.95,
    wallHeight: 1.7,
    topY: 0.85,
    bottomY: -0.85,
    lidClosedY: 0.975,
    lidOpenY: 2.25,
    lidOpenX: 0.95,
    lidOpenZ: 0.35,
    productY: 0.45,
};

export default function PlaceholderJar({
    lidGroupRef,
    productRef,
    onLidPointerDown,
    onProductPointerDown,
    lidInteractive = true,
    productInteractive = false,
}) {
    const glassMaterial = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: '#1a1d1f',
                transparent: true,
                opacity: 0.55,
                roughness: 0.12,
                metalness: 0.05,
                clearcoat: 1,
                clearcoatRoughness: 0.15,
                side: THREE.DoubleSide,
            }),
        []
    );

    const baseMaterial = useMemo(
        () => new THREE.MeshStandardMaterial({ color: '#101214', roughness: 0.4, metalness: 0.2 }),
        []
    );

    const labelMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#2a2d30',
                roughness: 0.55,
                metalness: 0.1,
                transparent: true,
                opacity: 0.92,
                side: THREE.DoubleSide,
            }),
        []
    );

    const lidMaterial = useMemo(
        () => new THREE.MeshStandardMaterial({ color: '#0d0f10', roughness: 0.35, metalness: 0.55 }),
        []
    );

    const productMaterial = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: '#b5751f',
                roughness: 0.3,
                metalness: 0,
                clearcoat: 0.6,
                clearcoatRoughness: 0.25,
            }),
        []
    );

    return (
        <group>
            {/* JarBody: outer wall + base, open-ended so interior is visible once the lid is removed */}
            <group name="JarBody">
                <mesh material={glassMaterial} position={[0, 0, 0]}>
                    <cylinderGeometry
                        args={[JAR_DIMENSIONS.radius, JAR_DIMENSIONS.radius, JAR_DIMENSIONS.wallHeight, 48, 1, true]}
                    />
                </mesh>
                <mesh material={baseMaterial} position={[0, JAR_DIMENSIONS.bottomY - 0.03, 0]}>
                    <cylinderGeometry args={[JAR_DIMENSIONS.radius, JAR_DIMENSIONS.radius, 0.06, 48]} />
                </mesh>
                {/* Label: placeholder band, swap for textured mesh later */}
                <mesh name="Label" material={labelMaterial} position={[0, -0.1, 0]}>
                    <cylinderGeometry args={[JAR_DIMENSIONS.radius + 0.02, JAR_DIMENSIONS.radius + 0.02, 0.5, 48, 1, true]} />
                </mesh>
            </group>

            {/* ProductSurface: visible concentrate fill, revealed once the lid clears the opening */}
            <mesh
                name="ProductSurface"
                ref={productRef}
                material={productMaterial}
                position={[0, JAR_DIMENSIONS.productY, 0]}
                onPointerDown={productInteractive ? onProductPointerDown : undefined}
            >
                <cylinderGeometry args={[JAR_DIMENSIONS.radius - 0.1, JAR_DIMENSIONS.radius - 0.1, 0.18, 48]} />
            </mesh>

            {/* Lid: separately selectable/animatable mesh group */}
            <group
                name="Lid"
                ref={lidGroupRef}
                position={[0, JAR_DIMENSIONS.lidClosedY, 0]}
                onPointerDown={lidInteractive ? onLidPointerDown : undefined}
            >
                <mesh material={lidMaterial}>
                    <cylinderGeometry args={[1.0, 1.0, 0.25, 48]} />
                </mesh>
                <mesh material={lidMaterial} position={[0, 0.155, 0]}>
                    <cylinderGeometry args={[1.02, 1.02, 0.06, 48]} />
                </mesh>
            </group>
        </group>
    );
}
