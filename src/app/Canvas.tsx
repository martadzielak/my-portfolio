"use client";
import { Canvas, useFrame } from '@react-three/fiber';
import { JSX, Suspense, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function FloatingCow(props: Omit<JSX.IntrinsicElements["primitive"], "object">) {
    const group = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/cow.glb');
    // Animation state
    const direction = useRef({
        centerX: 0,
        centerY: 0,
        radius: 20,
        startAngle: 0,
        endAngle: 0,
        clockwise: true,
    });
    const progressRef = useRef(0);
    const duration = 16; // seconds for one full cross
    // Pick a circle arc for the cow to follow
    function pickCircleArc() {
        // Two types: bottom-left to top-right (clockwise), top-left to bottom-right (counterclockwise)
        const clockwise = Math.random() < 0.5;
        const r = 20;
        let startAngle, endAngle, centerX, centerY;
        if (clockwise) {
            // Bottom-left to top-right
            centerX = 0;
            centerY = 0;
            startAngle = Math.PI * 1.25; // 225deg (bottom-left)
            endAngle = Math.PI * 0.25;   // 45deg (top-right)
        } else {
            // Top-left to bottom-right
            centerX = 0;
            centerY = 0;
            startAngle = Math.PI * 0.75; // 135deg (top-left)
            endAngle = Math.PI * 1.75;   // 315deg (bottom-right)
        }
        return { centerX, centerY, radius: r, startAngle, endAngle, clockwise };
    }
    // Initialize direction
    useEffect(() => {
        direction.current = pickCircleArc();
        progressRef.current = 0;
    }, []);
    useEffect(() => {
        scene.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = new THREE.MeshPhysicalMaterial({
                    color: 0xaaaaaa,
                    roughness: 0.9,
                    metalness: 1.0,
                    clearcoat: 0.9,
                    clearcoatRoughness: 0.03,
                    transmission: 0.0,
                    ior: 2.2,
                    thickness: 1,
                });
            }
        });
    }, [scene]);
    useFrame((state, delta) => {
        if (group.current) {
            progressRef.current += delta / duration;
            if (progressRef.current >= 1) {
                // Pick new arc
                direction.current = pickCircleArc();
                progressRef.current = 0;
            }
            // Interpolate angle
            const p = Math.min(Math.max(progressRef.current, 0), 1);
            const angle = direction.current.startAngle + (direction.current.endAngle - direction.current.startAngle) * p;
            const x = direction.current.centerX + Math.cos(angle) * direction.current.radius;
            const y = direction.current.centerY + Math.sin(angle) * direction.current.radius;
            group.current.position.x = x;
            group.current.position.y = y;
            // Graceful rotation
            group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3 + angle * 0.2;
            group.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
        }
    });
    return <primitive ref={group} {...props} object={scene} />;



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

