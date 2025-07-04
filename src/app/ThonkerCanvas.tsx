"use client";
import { Canvas, useFrame } from '@react-three/fiber';
import { JSX, Suspense, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function FloatingThonker(props: JSX.IntrinsicElements["primitive"]) {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/thonker.glb');

    useFrame(({ clock }) => {
        if (group.current) {
            // Gentle floating animation
            const t = clock.getElapsedTime();
            group.current.position.y = Math.sin(t) * 0.2;
            group.current.position.x = Math.sin(t * 0.3) * 0.5;
            group.current.rotation.y = Math.sin(t * 0.5) * 0.2;
        }
    });

    return <primitive ref={group} {...props} object={scene} />;
}

export default function ThonkerCanvas() {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            width: '100vw',
            height: '100vh',
        }}>
            <Canvas camera={{ position: [0, 0, 3] }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[2, 2, 2]} intensity={0.7} />
                <Suspense fallback={null}>
                    <FloatingThonker />
                </Suspense>
            </Canvas>
        </div>
    );
}

// If using next.config.js, ensure /public/thonker.glb exists
