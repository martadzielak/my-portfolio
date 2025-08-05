"use client";
import { Canvas, useFrame } from '@react-three/fiber';
import { JSX, Suspense, useEffect, useRef, useState } from 'react';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { OBJLoader } from 'three-stdlib';
import { ThreeEvent } from '@react-three/fiber';

function FloatingCow(props: Omit<JSX.IntrinsicElements["primitive"], "object">) {
    const group = useRef<THREE.Group>(null);
    const [cowObj, setCowObj] = useState<THREE.Group | null>(null);
    // Load textures (ensure they are loaded before applying to material)
    const [texturesLoaded, setTexturesLoaded] = useState(false);
    const [loadedDiffuse, setLoadedDiffuse] = useState<THREE.Texture | null>(null);
    const [loadedNormal, setLoadedNormal] = useState<THREE.Texture | null>(null);
    const [loadedRoughness, setLoadedRoughness] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        const loader = new TextureLoader();
        let loaded = 0;
        loader.load('/Cow_Quad_Diffuse.png', (tex: THREE.Texture) => { setLoadedDiffuse(tex); loaded++; if (loaded === 3) setTexturesLoaded(true); });
        loader.load('/Cow_Quad_Normal.png', (tex: THREE.Texture) => { setLoadedNormal(tex); loaded++; if (loaded === 3) setTexturesLoaded(true); });
        loader.load('/Cow_Quad_Roughness.png', (tex: THREE.Texture) => { setLoadedRoughness(tex); loaded++; if (loaded === 3) setTexturesLoaded(true); });
    }, []);

    useEffect(() => {
        const loader = new OBJLoader();
        loader.load('/cow.obj', (obj: THREE.Group) => {
            setCowObj(obj);
        });
    }, []);

    useEffect(() => {
        if (!texturesLoaded || !cowObj) return;
        cowObj.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.material = new THREE.MeshStandardMaterial({
                    map: loadedDiffuse ?? undefined,
                    normalMap: loadedNormal ?? undefined,
                    roughnessMap: loadedRoughness ?? undefined,
                    color: 0xffffff,
                    roughness: 1.0,
                    metalness: 0.0,
                });
                mesh.material.needsUpdate = true;
            }
        });
    }, [cowObj, texturesLoaded, loadedDiffuse, loadedNormal, loadedRoughness]);
    // Orbiting state
    const orbiting = useRef(false);
    const orbitingActive = useRef(false);
    const lastPointer = useRef<{ x: number; y: number } | null>(null);
    // Animation state
    const direction = useRef<{ x1: number; y1: number; x2: number; y2: number; mainAngle: number }>({ x1: 0, y1: 0, x2: 0, y2: 0, mainAngle: 0 });
    const progressRef = useRef(0);
    const duration = 6; // seconds for one full move (much quicker)
    // Add state for scale animation
    const [targetScale, setTargetScale] = useState(0.8);
    // Pick two random points just outside opposite corners for a "tossed ball" effect
    function pickRandomPoints() {
        // For camera z=3, x/y in [-1.5, 1.5] is visible, so use r=2.1 for off-screen
        // Pick one of four corners for start, and the diagonally opposite for end
        const corners = [
            { x: -2.1, y: -2.1 }, // bottom left
            { x: 2.1, y: -2.1 },  // bottom right
            { x: 2.1, y: 2.1 },   // top right
            { x: -2.1, y: 2.1 },  // top left
        ];
        const startIdx = Math.floor(Math.random() * 4);
        const endIdx = (startIdx + 2) % 4; // diagonally opposite
        return {
            x1: corners[startIdx].x,
            y1: corners[startIdx].y,
            x2: corners[endIdx].x,
            y2: corners[endIdx].y,
            mainAngle: Math.atan2(corners[endIdx].y - corners[startIdx].y, corners[endIdx].x - corners[startIdx].x)
        };
    }
    // Initialize direction
    useEffect(() => {
        direction.current = pickRandomPoints();
        progressRef.current = 0;
    }, []);
    // Orbit handlers
    // Removed: Global drag/orbit handlers
    // Only keep the handleCowPointerDown, handleCowPointerMove, handleCowPointerUp handlers on the cow mesh and transparent box
    // Store manual rotation so it persists after orbiting
    const manualRotation = useRef<{ x: number; y: number } | null>(null);

    useFrame((state, delta) => {
        if (group.current) {
            if (!orbiting.current) {
                progressRef.current += delta / duration;
                if (progressRef.current >= 1) {
                    // Pick new random direction
                    const prev = direction.current;
                    direction.current = pickRandomPoints();
                    // Start new movement from where the last ended
                    direction.current.x1 = prev.x2;
                    direction.current.y1 = prev.y2;
                    progressRef.current = 0;
                }
                // Interpolate position
                const p = Math.min(Math.max(progressRef.current, 0), 1);
                // Main path
                const xMain = direction.current.x1 + (direction.current.x2 - direction.current.x1) * p;
                const yMain = direction.current.y1 + (direction.current.y2 - direction.current.y1) * p;
                // Add a little bounce (parabolic arc)
                const arcHeight = 0.7;
                const arc = Math.sin(Math.PI * p) * arcHeight;
                // Perpendicular to main direction
                const perpAngle = direction.current.mainAngle + Math.PI / 2;
                const x = xMain + Math.cos(perpAngle) * arc;
                const y = yMain + Math.sin(perpAngle) * arc;
                // Only follow the random path, not the mouse
                group.current.position.x += (x - group.current.position.x) * 0.1;
                group.current.position.y += (y - group.current.position.y) * 0.1;
            }
            // Gentle floating rotation (unless orbiting)
            if (!orbiting.current) {
                if (manualRotation.current) {
                    group.current.rotation.x = manualRotation.current.x;
                    group.current.rotation.y = manualRotation.current.y;
                } else {
                    group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3;
                    group.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
                }
            }
            // Animate scale smoothly toward targetScale
            const current = group.current.scale.x;
            group.current.scale.setScalar(current + (targetScale - current) * 0.15);
        }
    });
    // --- Mobile orbiting handlers (merged with pointer events) ---
    // Store last pointer/touch position for drag/orbit
    // const lastPointer = useRef<{ x: number; y: number } | null>(null); // <-- REMOVE THIS LINE

    // Pointer down: begin orbiting on desktop (always), or one-finger touch (mobile)
    const handleCowPointerDown = (e: ThreeEvent<PointerEvent>) => {
        // Stop floating immediately
        progressRef.current = 0;
        setTargetScale(0.8 * 1.05); // 5% bigger
        if (e.pointerType === 'touch') {
            // Touch: always orbit on one finger
            lastPointer.current = { x: e.clientX, y: e.clientY };
            orbiting.current = true;
            orbitingActive.current = true;
        } else {
            // Desktop: always orbit on mousedown
            lastPointer.current = { x: e.clientX, y: e.clientY };
            orbiting.current = true;
            orbitingActive.current = true;
            // Add global mouseup listener to ensure orbiting stops only when mouse is released
            window.addEventListener('mouseup', handleGlobalPointerUp);
        }
    };

    // Global pointer up for desktop to stop orbiting only when mouse is released
    function handleGlobalPointerUp() {
        orbiting.current = false;
        orbitingActive.current = false;
        lastPointer.current = null;
        setTargetScale(0.8); // Restore to normal size
        window.removeEventListener('mouseup', handleGlobalPointerUp);
    }

    // Pointer up: stop orbit and restore floating/scale (for touch)
    const handleCowPointerUp = (e?: ThreeEvent<PointerEvent>) => {
        if (e && e.pointerType === 'touch') {
            orbiting.current = false;
            orbitingActive.current = false;
            lastPointer.current = null;
            setTargetScale(0.8); // Restore to normal size
        }
        // For desktop, orbiting is stopped by global mouseup
    };

    // Pointer move: handle orbit (desktop/touch)
    const handleCowPointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (orbiting.current && group.current && lastPointer.current) {
            const dx = e.clientX - lastPointer.current.x;
            const dy = e.clientY - lastPointer.current.y;
            group.current.rotation.y += dx * 0.01;
            group.current.rotation.x += dy * 0.01;
            manualRotation.current = {
                x: group.current.rotation.x,
                y: group.current.rotation.y,
            };
            lastPointer.current = { x: e.clientX, y: e.clientY };
        }
    };

    return cowObj ? (
        <group ref={group}>
            <primitive {...props} object={cowObj}
                onPointerDown={handleCowPointerDown}
                onPointerUp={handleCowPointerUp}
                onPointerMove={handleCowPointerMove}
                onPointerLeave={handleCowPointerUp}
            />
            {/* Transparent mesh for easier interaction */}
            <mesh
                position={[0, 0, 0]}
                scale={[1.2, 1.2, 1.2]}
                onPointerDown={handleCowPointerDown}
                onPointerUp={handleCowPointerUp}
                onPointerMove={handleCowPointerMove}
                onPointerLeave={handleCowPointerUp}
            >
                <boxGeometry args={[1.5, 1.2, 0.8]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
        </group>
    ) : null;



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
            <Canvas camera={{ position: [0, 0, 3] }} shadows>
                <ambientLight intensity={2.5} color={0xffffff} />
                <directionalLight position={[2, 2, 2]} intensity={3.5} color={0xffffff} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0001} />
                <directionalLight position={[-2, 2, 2]} intensity={1.5} color={0xffffff} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0001} />
                <Suspense fallback={null}>
                    <FloatingCow />
                </Suspense>
            </Canvas>
        </div>
    );
}

