'use client';

/**
 * Restrained, premium 3-point setup. No shadow-casting lights here —
 * ground contact shadow is handled separately (drei ContactShadows) to
 * keep this lightweight on mobile GPUs.
 */
export default function LightingRig() {
    return (
        <>
            <ambientLight intensity={0.35} />
            <directionalLight position={[3, 4, 2]} intensity={1.1} color="#ffffff" />
            <directionalLight position={[-3, 1.5, -2]} intensity={0.4} color="#81CBD2" />
            <pointLight position={[0, 2.5, 1.5]} intensity={0.5} color="#ffe9b0" distance={8} decay={2} />
        </>
    );
}
