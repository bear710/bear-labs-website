'use client';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import JarScene from './JarScene';

/**
 * Isolated so Product3DViewer can lazy-load this (and the three.js/R3F
 * bundle) via next/dynamic with ssr:false, keeping WebGL entirely off
 * the server render path.
 */
export default function ViewerCanvas({ state, go, reducedMotion, controlsRef, dpr }) {
    return (
        <Canvas
            dpr={dpr}
            gl={{ antialias: true, powerPreference: 'low-power' }}
            camera={{ fov: 42, near: 0.1, far: 50 }}
            shadows={false}
        >
            <Suspense fallback={null}>
                <JarScene state={state} go={go} reducedMotion={reducedMotion} controlsRef={controlsRef} />
            </Suspense>
        </Canvas>
    );
}
