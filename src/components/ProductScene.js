'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const PRODUCT_CONFIGS = [
    {
        geometry: 'torus',
        color: '#FFE032',
        emissive: '#FFE032',
        distort: 0.3,
        speed: 2,
        scale: 2.2,
        args: [1, 0.4, 64, 32],
    },
    {
        geometry: 'icosahedron',
        color: '#81CBD2',
        emissive: '#81CBD2',
        distort: 0.4,
        speed: 1.5,
        scale: 2,
        args: [1.2, 1],
    },
    {
        geometry: 'cylinder',
        color: '#6BC4CC',
        emissive: '#6BC4CC',
        distort: 0.2,
        speed: 1.8,
        scale: 2,
        args: [0.3, 0.3, 2.5, 32],
    },
    {
        geometry: 'octahedron',
        color: '#FFE032',
        emissive: '#FFE032',
        distort: 0.35,
        speed: 2.5,
        scale: 2.2,
        args: [1.3, 0],
    },
];

function ProductMesh({ config, visible }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current && visible) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    const GeometryComponent = useMemo(() => {
        switch (config.geometry) {
            case 'torus': return <torusGeometry args={config.args} />;
            case 'icosahedron': return <icosahedronGeometry args={config.args} />;
            case 'cylinder': return <cylinderGeometry args={config.args} />;
            case 'octahedron': return <octahedronGeometry args={config.args} />;
            default: return <sphereGeometry args={[1, 32, 32]} />;
        }
    }, [config]);

    return (
        <Float
            speed={1.5}
            rotationIntensity={0.4}
            floatIntensity={0.6}
        >
            <mesh
                ref={meshRef}
                scale={visible ? config.scale : 0}
                visible={visible}
            >
                {GeometryComponent}
                <MeshDistortMaterial
                    color={config.color}
                    emissive={config.emissive}
                    emissiveIntensity={0.15}
                    roughness={0.2}
                    metalness={0.8}
                    distort={config.distort}
                    speed={config.speed}
                    envMapIntensity={1}
                />
            </mesh>
        </Float>
    );
}

function GlowOrb({ color, visible }) {
    return (
        <mesh visible={visible} position={[0, 0, -2]}>
            <sphereGeometry args={[3, 32, 32]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.05}
                side={THREE.BackSide}
            />
        </mesh>
    );
}

export default function ProductScene({ activeIndex }) {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
            dpr={[1, 1.5]}
        >
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <pointLight position={[-5, -5, 5]} intensity={0.5} color="#81CBD2" />
            <pointLight position={[5, -3, -5]} intensity={0.3} color="#FFE032" />

            {PRODUCT_CONFIGS.map((config, i) => (
                <ProductMesh
                    key={i}
                    config={config}
                    visible={activeIndex === i}
                />
            ))}

            {PRODUCT_CONFIGS.map((config, i) => (
                <GlowOrb
                    key={`glow-${i}`}
                    color={config.color}
                    visible={activeIndex === i}
                />
            ))}

            <Environment preset="city" />
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={1}
                maxPolarAngle={Math.PI / 1.8}
                minPolarAngle={Math.PI / 3}
            />
        </Canvas>
    );
}
