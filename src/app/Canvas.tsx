"use client";
import { Canvas, useFrame } from '@react-three/fiber';
import { JSX, Suspense, useEffect, useRef, useState } from 'react';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { OBJLoader } from 'three-stdlib';

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
    // Drag state
    const dragging = useRef(false);
    const draggingActive = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const orbiting = useRef(false);
    const orbitingActive = useRef(false);
    const lastPointer = useRef<{ x: number; y: number } | null>(null);
    // Animation state
    const direction = useRef<{ x1: number; y1: number; x2: number; y2: number; mainAngle: number }>({ x1: 0, y1: 0, x2: 0, y2: 0, mainAngle: 0 });
    const progressRef = useRef(0);
    const duration = 6; // seconds for one full move (much quicker)
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
    // Drag and orbit handlers
    // Removed: Global drag/orbit handlers
    // Only keep the handleCowPointerDown, handleCowPointerMove, handleCowPointerUp handlers on the cow mesh and transparent box
    // Store manual rotation so it persists after orbiting
    const manualRotation = useRef<{ x: number; y: number } | null>(null);

    useFrame((state, delta) => {
        if (group.current) {
            if (!dragging.current && !orbiting.current) {
                // Removed: Make cow follow cursor more closely
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
            // Set cow scale to 0.8 (20% smaller)
            group.current.scale.set(0.8, 0.8, 0.8);
        }
    });
    // Helper to get pointer position in 3D world (for pointer events)
    function getPointerPos(e: PointerEvent | MouseEvent | TouchEvent) {
        let clientX, clientY;
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if ('clientX' in e) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            return null;
        }
        // Map screen to world coordinates (approximate)
        const x = ((clientX / window.innerWidth) * 2 - 1) * 1.5;
        const y = -((clientY / window.innerHeight) * 2 - 1) * 1.5;
        return { x, y, clientX, clientY };
    }

    // Add a transparent clickable mesh for interaction
    const handleCowPointerDown = (e: PointerEvent) => {
        e.stopPropagation();
        // Stop floating on pointer down
        dragging.current = false;
        orbiting.current = false;
        if (e.pointerType === 'mouse' && e.button === 0 && e.shiftKey) {
            // Orbit: Shift+mousedown
            orbiting.current = true;
            orbitingActive.current = true;
            lastPointer.current = { x: e.clientX, y: e.clientY };
            window.addEventListener('mousemove', handleGlobalOrbitMove);
            window.addEventListener('mouseup', handleGlobalOrbitUp);
        } else if (e.pointerType === 'mouse' && e.button === 0) {
            // Drag: plain mousedown
            dragging.current = true;
            draggingActive.current = true;
            const pos = getPointerPos(e);
            if (pos && group.current) {
                dragOffset.current.x = group.current.position.x - pos.x;
                dragOffset.current.y = group.current.position.y - pos.y;
            }
            window.addEventListener('mousemove', handleGlobalDragMove);
            window.addEventListener('mouseup', handleGlobalDragUp);
        } else if (e.pointerType === 'touch') {
            // Touch: fallback to local drag
            dragging.current = true;
            const pos = getPointerPos(e);
            if (pos && group.current) {
                dragOffset.current.x = group.current.position.x - pos.x;
                dragOffset.current.y = group.current.position.y - pos.y;
            }
        }
    };
    // Global orbit move handler
    function handleGlobalOrbitMove(e: MouseEvent) {
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
    }
    // Global orbit up handler
    function handleGlobalOrbitUp() {
        if (orbiting.current) {
            orbiting.current = false;
            orbitingActive.current = false;
            lastPointer.current = null;
            window.removeEventListener('mousemove', handleGlobalOrbitMove);
            window.removeEventListener('mouseup', handleGlobalOrbitUp);
        }
    }
    // Global drag move handler
    function handleGlobalDragMove(e: MouseEvent) {
        if (dragging.current && group.current) {
            const pos = getPointerPos(e);
            if (pos) {
                group.current.position.x = pos.x + dragOffset.current.x;
                group.current.position.y = pos.y + dragOffset.current.y;
            }
        }
    }
    // Global drag up handler
    function handleGlobalDragUp() {
        if (dragging.current) {
            dragging.current = false;
            draggingActive.current = false;
            window.removeEventListener('mousemove', handleGlobalDragMove);
            window.removeEventListener('mouseup', handleGlobalDragUp);
        }
    }
    const handleCowPointerUp = (e: PointerEvent) => {
        e.stopPropagation();
        // Only end orbit/drag if not using global mouseup
        if (!orbitingActive.current) {
            orbiting.current = false;
        }
        if (!draggingActive.current) {
            dragging.current = false;
        }
        lastPointer.current = null;
    };
    // No-op: all drag/orbit handled globally for mouse
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleCowPointerMove = (_: PointerEvent) => { };
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

