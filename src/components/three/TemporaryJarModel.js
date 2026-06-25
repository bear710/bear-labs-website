'use client';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { JAR_DIMENSIONS } from './PlaceholderJar';

/**
 * Temporary imported-GLB jar adapter — a drop-in visual replacement for
 * PlaceholderJar, isolated in its own file so it can be swapped for the
 * final Bear Labs asset later without touching JarScene, ProductStage,
 * or productConfig. See the README block in Product3DViewer.js for the
 * expected node-naming contract this style of adapter must satisfy.
 *
 * Source asset: public/models/placeholder-concentrate-jar/
 *   placeholder-concentrate-jar-optimized.glb (449.7 KB, 106,863 tris,
 *   Meshopt-compressed, 4 flat root nodes, no textures).
 */
export const JAR_MODEL_URL = '/models/placeholder-concentrate-jar/placeholder-concentrate-jar-optimized.glb';

const NODE_NAMES = {
    jarBody: 'Circle_006', // "Main Glass Shader" material
    productFill: 'Circle_014', // "Wax" material — temporary cream/concentrate surface
    lidMain: 'Circle_013', // "Plastic" material
    lidBadge: 'Circle_012', // "Gallium" material — metallic cap detail
};

/**
 * The ONLY place the Meshopt decoder is configured. Uses the official
 * three.js decoder (three/examples/jsm), not drei's bundled three-stdlib
 * copy — drei's own built-in Draco/Meshopt handling is explicitly
 * disabled (the two `false` arguments below) so exactly one decoder is
 * ever wired up. This only affects the GLTFLoader instance drei creates
 * for THIS url; every other/future useGLTF call in the app is
 * unaffected and keeps drei's normal defaults.
 */
function configureLoader(loader) {
    loader.setMeshoptDecoder(MeshoptDecoder);
}

// Preloads once, client-side only (this whole file is only ever reached
// through JarScene's dynamic, ssr:false viewer chain). drei caches by
// URL, so all 9 jar products that use this adapter share one fetch/parse
// no matter how many times the customer switches between them.
useGLTF.preload(JAR_MODEL_URL, false, false, configureLoader);

// The procedural placeholder's own closed silhouette is the sizing
// reference, so the imported model "occupies approximately the same
// visual area" without requiring any camera/shadow constant elsewhere
// in the showroom to change. ~= body wall + lid cap, closed.
const TARGET_HEIGHT = JAR_DIMENSIONS.topY - JAR_DIMENSIONS.bottomY + 0.4;
const GROUND_Y = JAR_DIMENSIONS.bottomY;

// Documented, non-destructive nudge for the temporary cream mesh only —
// raise this (in normalized showroom units) if visual testing shows the
// fill sitting too low inside the jar to read once the lid lifts away.
// Verified visually after integration; left at 0 because the source
// mesh already sits at the jar's mouth height once normalized.
const PRODUCT_FILL_Y_NUDGE = 0;

// The source asset's AUTHORED lid position is a "product display" shot
// (lid already lifted off, posed in the air to show the cream) — not a
// resting/closed pose. Its raw Y sits roughly 68 model-units above the
// jar's own rim (taller than the body itself), which is what made the
// lid render fully detached. The fix seats the lid directly on the
// body's rim instead of trusting that authored Y. A small overlap
// (fraction of the lid's own height) pushes it slightly down into the
// rim so it reads as sealed rather than just tangent/touching.
const LID_SEAT_OVERLAP_RATIO = 0.16;

function clampMinLightness(hex, minLightness) {
    const color = new THREE.Color(hex);
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);
    if (hsl.l < minLightness) color.setHSL(hsl.h, hsl.s, minLightness);
    return color;
}

function cloneMeshNode(scene, name) {
    const source = scene.getObjectByName(name);
    if (!source) return null;
    // Shallow clone: a new Mesh sharing the SAME geometry (and, for now,
    // material) references as the cached scene. Never mutates the
    // cached graph and never duplicates the ~100k-triangle buffers —
    // only the lightweight Object3D wrapper is duplicated.
    const clone = source.clone(false);
    clone.name = name;
    return clone;
}

export default function TemporaryJarModel({ lidGroupRef, productRef, variant }) {
    const { scene } = useGLTF(JAR_MODEL_URL, false, false, configureLoader);

    // Built once per mount (re-running only if the product variant
    // changes, which already remounts this whole component via the
    // showroom's per-product `key`). Clones the 4 mesh nodes + their
    // materials; never touches the cached `scene` or its geometry.
    const built = useMemo(() => {
        const jarBodySource = scene.getObjectByName(NODE_NAMES.jarBody);
        const productFillSource = scene.getObjectByName(NODE_NAMES.productFill);
        const lidMainSource = scene.getObjectByName(NODE_NAMES.lidMain);
        const lidBadgeSource = scene.getObjectByName(NODE_NAMES.lidBadge);
        if (!jarBodySource || !productFillSource || !lidMainSource || !lidBadgeSource) {
            // Caught by ModelLoadBoundary in JarScene, which falls back
            // to the procedural placeholder.
            throw new Error(
                `placeholder-concentrate-jar-optimized.glb is missing an expected node (have: ${scene.children
                    .map((c) => c.name)
                    .join(', ')})`
            );
        }

        // ---- normalization, calculated from the asset's own bounding box ----
        const fullBox = new THREE.Box3();
        fullBox.expandByObject(jarBodySource);
        fullBox.expandByObject(productFillSource);
        fullBox.expandByObject(lidMainSource);
        fullBox.expandByObject(lidBadgeSource);
        const size = fullBox.getSize(new THREE.Vector3());
        const center = fullBox.getCenter(new THREE.Vector3());

        const scale = TARGET_HEIGHT / size.y;
        // Center horizontally (x/z), rest the base exactly on the same
        // ground level the procedural jar uses.
        const offset = new THREE.Vector3(-center.x * scale, GROUND_Y - fullBox.min.y * scale, -center.z * scale);

        // ---- lid pivot: the LID's OWN bbox center, not the whole
        // assembly's — keeps rotation centered on the cap itself even if
        // it isn't perfectly concentric with the jar body in the source
        // asset (inspected visually; see report). ----
        const lidBox = new THREE.Box3();
        lidBox.expandByObject(lidMainSource);
        lidBox.expandByObject(lidBadgeSource);
        const lidCenter = lidBox.getCenter(new THREE.Vector3());
        const lidHeight = lidBox.max.y - lidBox.min.y;

        // The body's own rim height (excludes the lid/fill so this is
        // purely "how tall is the jar body"), used to seat the lid.
        const bodyOnlyBox = new THREE.Box3();
        bodyOnlyBox.expandByObject(jarBodySource);
        const seatedLidCenterY = bodyOnlyBox.max.y + lidHeight * (0.5 - LID_SEAT_OVERLAP_RATIO);
        // Keep the lid's own authored X/Z (already closely aligned with
        // the body's own horizontal center) — only Y needed correcting.
        const lidClosedCenter = new THREE.Vector3(lidCenter.x, seatedLidCenterY, lidCenter.z);

        const jarBody = cloneMeshNode(scene, NODE_NAMES.jarBody);
        const productFill = cloneMeshNode(scene, NODE_NAMES.productFill);
        const lidMain = cloneMeshNode(scene, NODE_NAMES.lidMain);
        const lidBadge = cloneMeshNode(scene, NODE_NAMES.lidBadge);

        // Re-home the lid meshes' local positions relative to their own
        // authored center (preserves lidMain/lidBadge's correct shape
        // relative to each other) — the GROUP they're parented to below
        // uses the seated center instead, so the rigid lid unit as a
        // whole sits on the rim without altering its internal layout.
        lidMain.position.sub(lidCenter);
        lidBadge.position.sub(lidCenter);
        productFill.position.y += PRODUCT_FILL_Y_NUDGE;

        const lidClosedPosition = lidClosedCenter.clone().multiplyScalar(scale).add(offset);

        // ---- materials: cloned from the source (no textures to lose),
        // then tinted per-product. Never mutates the cached originals. ----
        const glassMat = jarBody.material.clone();
        Object.assign(glassMat, {
            transparent: true,
            opacity: 0.55,
            roughness: 0.12,
            metalness: 0.05,
            side: THREE.DoubleSide,
            // Avoids the usual transparent-glass self-sorting artifacts
            // on a single convex-ish shell; cheaper than physical
            // transmission and visually sufficient for a closed jar.
            depthWrite: false,
        });
        jarBody.material = glassMat;

        const lidMat = lidMain.material.clone();
        lidMat.roughness = 0.35;
        lidMat.metalness = variant.lidMetalness;
        // Several variants' lidColor is near-black, which against this
        // canvas's black background made the closed lid read as a dark
        // void/hole rather than a solid cap. Floor its lightness so it
        // always catches a visible highlight while staying dark/premium.
        lidMat.color = clampMinLightness(variant.lidColor, 0.16);
        lidMain.material = lidMat;

        const badgeMat = lidBadge.material.clone();
        badgeMat.roughness = 0.4;
        badgeMat.metalness = 0.6;
        badgeMat.color = new THREE.Color(variant.accent || '#9a9a9a');
        lidBadge.material = badgeMat;

        const fillMat = productFill.material.clone();
        fillMat.roughness = 0.3;
        fillMat.metalness = 0;
        fillMat.color = new THREE.Color(variant.productColor);
        productFill.material = fillMat;

        return {
            jarBody,
            productFill,
            lidMain,
            lidBadge,
            scale,
            offset,
            lidClosedPosition,
            materials: [glassMat, lidMat, badgeMat, fillMat],
        };
    }, [scene, variant]);

    // Cleanup is scoped to resources THIS adapter created (the cloned
    // materials) — the shared cached geometry from useGLTF is never
    // disposed here.
    useEffect(() => {
        return () => {
            built.materials.forEach((m) => m.dispose());
        };
    }, [built]);

    return (
        <>
            <group name="JarBody" position={built.offset.toArray()} scale={built.scale}>
                <primitive object={built.jarBody} />
                <primitive object={built.productFill} ref={productRef} />
            </group>
            <group name="Lid" ref={lidGroupRef} position={built.lidClosedPosition.toArray()} scale={built.scale}>
                <primitive object={built.lidMain} />
                <primitive object={built.lidBadge} />
            </group>
        </>
    );
}
