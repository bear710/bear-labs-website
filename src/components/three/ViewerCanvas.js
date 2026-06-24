'use client';
import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import LightingRig from './LightingRig';
import CameraController from './CameraController';
import ProductStage from './ProductStage';
import { buildCameraViews } from './productConfig';
import { JAR_DIMENSIONS } from './PlaceholderJar';

// Ground-contact-shadow height per model type. Keyed by modelType (not
// product id) so it stays generic across every product that shares a
// model type.
const SHADOW_Y = {
    jar: JAR_DIMENSIONS.bottomY - 0.08,
    vapePackage: -0.66,
    ampersandPackage: -0.24,
};

/**
 * Isolated so Product3DViewer can lazy-load this (and the three.js/R3F
 * bundle) via next/dynamic with ssr:false, keeping WebGL entirely off
 * the server render path. Holds everything shared across products —
 * lighting, camera, ground shadow — so individual scenes only own
 * their own geometry/interaction.
 */
export default function ViewerCanvas({
    product,
    transition,
    onExited,
    onEntered,
    interactionState,
    interactionGo,
    reducedMotion,
    isMobile,
    controlsRef,
    dpr,
}) {
    const views = useMemo(() => buildCameraViews(product, { mobile: isMobile }), [product, isMobile]);
    const shadowY = SHADOW_Y[product.modelType] ?? -0.9;

    return (
        <Canvas
            dpr={dpr}
            gl={{ antialias: true, powerPreference: 'low-power' }}
            camera={{ fov: 42, near: 0.1, far: 50 }}
            shadows={false}
        >
            <color attach="background" args={['#070707']} />
            <Suspense fallback={null}>
                <LightingRig />
                <ProductStage
                    product={product}
                    transition={transition}
                    onExited={onExited}
                    onEntered={onEntered}
                    reducedMotion={reducedMotion}
                    interactionState={interactionState}
                    interactionGo={interactionGo}
                />
                <ContactShadows
                    position={[0, shadowY, 0]}
                    opacity={0.55}
                    scale={6}
                    blur={2.4}
                    far={2}
                    resolution={256}
                    color="#000000"
                />
                <CameraController
                    state={interactionState}
                    reducedMotion={reducedMotion}
                    controlsRef={controlsRef}
                    go={interactionGo}
                    views={views}
                />
            </Suspense>
        </Canvas>
    );
}
