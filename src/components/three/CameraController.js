'use client';
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import { VIEWER_STATES } from './useViewerState';

export const CAMERA_VIEWS = {
    inspecting: { position: [0, 1.05, 4.2], target: [0, 0.2, 0] },
    topDown: { position: [0, 3.6, 2.4], target: [0, 0.5, 0.1] },
    productFocus: { position: [0, 2.6, 0.9], target: [0, 0.45, 0] },
};

/**
 * Owns all camera motion. Mesh components never touch the camera —
 * this keeps jar geometry/animation logic decoupled from view logic.
 */
export default function CameraController({ state, reducedMotion, controlsRef, go }) {
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
        camera.position.set(...CAMERA_VIEWS.inspecting.position);
        if (orbitRef.current) {
            orbitRef.current.target.set(...CAMERA_VIEWS.inspecting.target);
            orbitRef.current.update();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const controls = orbitRef.current;
        if (!controls) return;

        let view = null;
        if (state === VIEWER_STATES.OPENING) {
            controls.enabled = false;
            view = CAMERA_VIEWS.topDown;
        } else if (state === VIEWER_STATES.OPEN) {
            controls.enabled = true;
            view = CAMERA_VIEWS.topDown;
        } else if (state === VIEWER_STATES.PRODUCT_FOCUS) {
            controls.enabled = true;
            view = CAMERA_VIEWS.productFocus;
        } else if (state === VIEWER_STATES.CLOSING) {
            controls.enabled = false;
            view = CAMERA_VIEWS.inspecting;
        } else {
            controls.enabled = true;
            view = CAMERA_VIEWS.inspecting;
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
    }, [state, reducedMotion, camera]);

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
