'use client';
import { useEffect, useMemo } from 'react';
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

const DEFAULT_VARIANT = {
    glassColor: '#1a1d1f',
    labelColor: '#2a2d30',
    lidColor: '#0d0f10',
    lidMetalness: 0.55,
    productColor: '#b5751f',
    accent: null,
};

export default function PlaceholderJar({ lidGroupRef, productRef, variant = DEFAULT_VARIANT }) {
    const glassMaterial = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: variant.glassColor,
                transparent: true,
                opacity: 0.55,
                roughness: 0.12,
                metalness: 0.05,
                clearcoat: 1,
                clearcoatRoughness: 0.15,
                side: THREE.DoubleSide,
            }),
        [variant.glassColor]
    );

    const baseMaterial = useMemo(
        () => new THREE.MeshStandardMaterial({ color: '#101214', roughness: 0.4, metalness: 0.2 }),
        []
    );

    const labelMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: variant.labelColor,
                roughness: 0.55,
                metalness: 0.1,
                transparent: true,
                opacity: 0.92,
                side: THREE.DoubleSide,
            }),
        [variant.labelColor]
    );

    const labelAccentMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: variant.accent || variant.labelColor,
                roughness: 0.4,
                metalness: 0.15,
            }),
        [variant.accent, variant.labelColor]
    );

    const lidMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: variant.lidColor,
                roughness: 0.35,
                metalness: variant.lidMetalness,
            }),
        [variant.lidColor, variant.lidMetalness]
    );

    const productMaterial = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: variant.productColor,
                roughness: 0.3,
                metalness: 0,
                clearcoat: 0.6,
                clearcoatRoughness: 0.25,
            }),
        [variant.productColor]
    );

    useEffect(() => {
        return () => {
            glassMaterial.dispose();
            baseMaterial.dispose();
            labelMaterial.dispose();
            labelAccentMaterial.dispose();
            lidMaterial.dispose();
            productMaterial.dispose();
        };
    }, [glassMaterial, baseMaterial, labelMaterial, labelAccentMaterial, lidMaterial, productMaterial]);

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
                {/* Thin accent ring — the only per-product color cue, kept restrained */}
                <mesh material={labelAccentMaterial} position={[0, 0.16, 0]}>
                    <cylinderGeometry args={[JAR_DIMENSIONS.radius + 0.025, JAR_DIMENSIONS.radius + 0.025, 0.03, 48, 1, true]} />
                </mesh>
            </group>

            {/* ProductSurface: visible concentrate fill, revealed once the lid clears the opening */}
            <mesh
                name="ProductSurface"
                ref={productRef}
                material={productMaterial}
                position={[0, JAR_DIMENSIONS.productY, 0]}
            >
                <cylinderGeometry args={[JAR_DIMENSIONS.radius - 0.1, JAR_DIMENSIONS.radius - 0.1, 0.18, 48]} />
            </mesh>

            {/* Lid: separately selectable/animatable mesh group */}
            <group
                name="Lid"
                ref={lidGroupRef}
                position={[0, JAR_DIMENSIONS.lidClosedY, 0]}
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
