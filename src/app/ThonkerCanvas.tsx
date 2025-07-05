"use client";
import { Canvas, useFrame } from '@react-three/fiber';
import { JSX, Suspense, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function FloatingThonker(props: Omit<JSX.IntrinsicElements["primitive"], "object">) {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/cow.glb');
    // Animation state
    const direction = useRef({ x1: 0, y1: 0, x2: 0, y2: 0 });
    const progressRef = useRef(0);
    const duration = 8; // seconds for one full diagonal cross
    // Pick two points on opposite sides for a diagonal
    function pickDiagonalPoints() {
        const r = 12; // radius just outside the view
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = angle1 + Math.PI + (Math.random() - 0.5) * Math.PI * 0.3; // mostly opposite
        return {
            x1: Math.cos(angle1) * r,
            y1: Math.sin(angle1) * r,
            x2: Math.cos(angle2) * r,
            y2: Math.sin(angle2) * r,
        };
    }
    // Initialize direction
    useEffect(() => {
        direction.current = pickDiagonalPoints();
        progressRef.current = 0;
    }, []);
    useEffect(() => {
        scene.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = new THREE.MeshPhysicalMaterial({
                    color: 0xffffff,
                    roughness: 0.05, // glossy
                    metalness: 0.3,
                    clearcoat: 1,
                    clearcoatRoughness: 0.01,
                    transmission: 0.8, // semi-transparent
                    ior: 1.4,
                    envMapIntensity: 10,
                    opacity: 0.5,
                    transparent: true,
                    thickness: 4,
                });
            }
        });
    }, [scene]);
    useFrame((state, delta) => {
        if (group.current) {
            progressRef.current += delta / duration;
            if (progressRef.current >= 1) {
                // Pick new diagonal
                const prev = direction.current;
                direction.current = pickDiagonalPoints();
                // Start new movement from where the last ended
                direction.current.x1 = prev.x2;
                direction.current.y1 = prev.y2;
                progressRef.current = 0;
            }
            // Smooth progress
            const p = Math.min(Math.max(progressRef.current, 0), 1);
            // Ease in/out
            const smooth = p < 0.15 ? 0 : p > 0.85 ? 1 : (p - 0.15) / 0.7;
            group.current.position.x = direction.current.x1 + (direction.current.x2 - direction.current.x1) * smooth;
            group.current.position.y = direction.current.y1 + (direction.current.y2 - direction.current.y1) * smooth;
            // Graceful rotation
            group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3 + (direction.current.x2 - direction.current.x1) * 0.02 * smooth;
            group.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
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
