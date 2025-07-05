"use client";
import { Canvas, useFrame } from '@react-three/fiber';
import { JSX, Suspense, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function FloatingCow(props: Omit<JSX.IntrinsicElements["primitive"], "object">) {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/cow.glb');
    // State for direction
    const direction = useRef<{ x1: number, y1: number, x2: number, y2: number }>({ x1: 0, y1: 0, x2: 0, y2: 0 });
    const progressRef = useRef(0);
    // Cow moves slower, appears on screen 1.5x more often
    const duration = 24; // seconds for one full move (was 16, now slower)
    // Reduce the off-screen radius so the cow crosses the screen more often
    function pickRandomPoints() {
        const r = 16; // was 24, now 1.5x closer to center
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = angle1 + Math.PI + (Math.random() - 0.5) * Math.PI * 0.5;
        return {
            x1: Math.cos(angle1) * r,
            y1: Math.sin(angle1) * r,
            x2: Math.cos(angle2) * r,
            y2: Math.sin(angle2) * r,
        };
    }

    useEffect(() => {
        direction.current = pickRandomPoints();
        progressRef.current = 0;
    }, []);

    useFrame((state, delta) => {
        if (group.current && direction.current) {
            // Progress from 0 to 1
            progressRef.current += delta / duration;
            if (progressRef.current > 1) {
                // When finished, pick new random direction and reset progress
                // But keep the cow at the end point for a smooth transition
                const prev = direction.current;
                direction.current = pickRandomPoints();
                // Start new movement from where the last ended
                direction.current.x1 = prev.x2;
                direction.current.y1 = prev.y2;
                progressRef.current = 0;
            }
            // Ease in/out for smoother entry/exit
            const p = progressRef.current;
            const smooth = p < 0.2 ? 0 : p > 0.8 ? 1 : (p - 0.2) / 0.6;
            group.current.position.x = direction.current.x1 + (direction.current.x2 - direction.current.x1) * smooth;
            group.current.position.y = direction.current.y1 + (direction.current.y2 - direction.current.y1) * smooth;
            group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
        }
    });

    return <primitive ref={group} {...props} object={scene} scale={1.2} />;
}

export default function CowCanvas() {
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
                    <FloatingCow />
                </Suspense>
            </Canvas>
        </div>
    );
}

// If using next.config.js, ensure /public/thonker.glb exists
