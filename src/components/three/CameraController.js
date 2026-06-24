'use client';
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { VIEWER_STATES } from './useViewerState';

const DEFAULT_VIEWS = {
    inspecting: { position: [0, 1.05, 4.2], target: [0, 0.2, 0] },
    open: { position: [0, 3.6, 2.4], target: [0, 0.5, 0.1] },
    productFocus: { position: [0, 2.6, 0.9], target: [0, 0.45, 0] },
};

/**
 * Owns all camera motion. Mesh components never touch the camera — this
 * keeps jar/vape/ampersand geometry decoupled from view logic. `views`
 * is built per-product by productConfig.buildCameraViews, so this
 * component never needs to know which product is active.
 */
export default function CameraController({ state, reducedMotion, controlsRef, go, views = DEFAULT_VIEWS }) {
    const { camera } = useThree();
    const tweenRef = useRef(null);
    const orbitRef = useRef(null);

    useEffect(() => {
        if (controlsRef) controlsRef.current = orbitRef.current;
    }, [controlsRef]);

    useEffect(() => {
        const controls = orbitRef.current;
        if (!controls || !go) return;
        const handleStart = () => {
            if (state === VIEWER_STATES.IDLE) go(VIEWER_STATES.INSPECTING);
        };
        controls.addEventListener('start', handleStart);
        return () => controls.removeEventListener('start', handleStart);
    }, [state, go]);

    useEffect(() => {
        camera.position.set(...views.inspecting.position);
        if (orbitRef.current) {
            orbitRef.current.target.set(...views.inspecting.target);
            orbitRef.current.update();
        }
        // Runs once per mount (this component remounts whenever the active
        // product changes), so the camera always resets per-product.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const controls = orbitRef.current;
        if (!controls) return;

        let view = null;
        if (state === VIEWER_STATES.OPENING) {
            controls.enabled = false;
            view = views.open;
        } else if (state === VIEWER_STATES.OPEN) {
            controls.enabled = true;
            view = views.open;
        } else if (state === VIEWER_STATES.PRODUCT_FOCUS) {
            controls.enabled = true;
            view = views.productFocus;
        } else if (state === VIEWER_STATES.CLOSING) {
            controls.enabled = false;
            view = views.inspecting;
        } else {
            controls.enabled = true;
            view = views.inspecting;
        }

        if (tweenRef.current) tweenRef.current.kill();

        const duration = reducedMotion ? 0 : state === VIEWER_STATES.OPENING ? 1.6 : 1.1;
        const targetVec = { x: view.target[0], y: view.target[1], z: view.target[2] };

        tweenRef.current = gsap.timeline()
            .to(camera.position, {
                x: view.position[0],
                y: view.position[1],
                z: view.position[2],
                duration,
                ease: 'power2.inOut',
                onUpdate: () => controls.update(),
            })
            .to(
                controls.target,
                {
                    x: targetVec.x,
                    y: targetVec.y,
                    z: targetVec.z,
                    duration,
                    ease: 'power2.inOut',
                    onUpdate: () => controls.update(),
                },
                0
            );

        return () => {
            if (tweenRef.current) tweenRef.current.kill();
        };
    }, [state, reducedMotion, camera, views]);

    return (
        <OrbitControls
            ref={orbitRef}
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minDistance={2.2}
            maxDistance={6.5}
            minPolarAngle={Math.PI * 0.12}
            maxPolarAngle={Math.PI * 0.49}
            rotateSpeed={0.6}
        />
    );
}
