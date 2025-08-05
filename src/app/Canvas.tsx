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
    const dragOffset = useRef({ x: 0, y: 0 });
    const orbiting = useRef(false);
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
    useEffect(() => {
        if (!group.current) return;
        // Helper to get pointer position in 3D world
        function getPointerPos(e: MouseEvent | TouchEvent) {
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
        function onPointerDown(e: MouseEvent | TouchEvent) {
            e.preventDefault();
            // Orbit mode: 3-finger touch or any mousedown
            let isOrbit = false;
            if ('touches' in e && e.touches.length === 3) {
                isOrbit = true;
            } else if (e instanceof MouseEvent && e.button === 0) {
                // Left mouse button (any mousedown)
                isOrbit = true;
            }
            if (isOrbit) {
                orbiting.current = true;
                const pos = getPointerPos(e);
                if (pos) lastPointer.current = { x: pos.clientX, y: pos.clientY };
            } else {
                dragging.current = true;
                const pos = getPointerPos(e);
                if (pos && group.current) {
                    dragOffset.current.x = group.current.position.x - pos.x;
                    dragOffset.current.y = group.current.position.y - pos.y;
                }
            }
        }
        function onPointerMove(e: MouseEvent | TouchEvent) {
            if (orbiting.current && group.current) {
                const pos = getPointerPos(e);
                if (pos && lastPointer.current) {
                    const dx = pos.clientX - lastPointer.current.x;
                    const dy = pos.clientY - lastPointer.current.y;
                    group.current.rotation.y += dx * 0.01;
                    group.current.rotation.x += dy * 0.01;
                    lastPointer.current = { x: pos.clientX, y: pos.clientY };
                }
                return;
            }
            if (!dragging.current || !group.current) return;
            const pos = getPointerPos(e);
            if (pos) {
                group.current.position.x = pos.x + dragOffset.current.x;
                group.current.position.y = pos.y + dragOffset.current.y;
            }
        }
        function onPointerUp() {
            dragging.current = false;
            orbiting.current = false;
            lastPointer.current = null;
        }
        // Mouse events
        window.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        // Touch events
        window.addEventListener('touchstart', onPointerDown, { passive: false });
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('touchend', onPointerUp);
        window.addEventListener('touchcancel', onPointerUp);
        return () => {
            window.removeEventListener('mousedown', onPointerDown);
            window.removeEventListener('mousemove', onPointerMove);
            window.removeEventListener('mouseup', onPointerUp);
            window.removeEventListener('touchstart', onPointerDown);
            window.removeEventListener('touchmove', onPointerMove);
            window.removeEventListener('touchend', onPointerUp);
            window.removeEventListener('touchcancel', onPointerUp);
        };
    }, [cowObj]);
    // Track pointer/touch state globally
    const pointerDown = useRef(false);
    useEffect(() => {
        function onAnyPointerDown() { pointerDown.current = true; }
        function onAnyPointerUp() { pointerDown.current = false; }
        window.addEventListener('mousedown', onAnyPointerDown);
        window.addEventListener('mouseup', onAnyPointerUp);
        window.addEventListener('touchstart', onAnyPointerDown);
        window.addEventListener('touchend', onAnyPointerUp);
        window.addEventListener('touchcancel', onAnyPointerUp);
        return () => {
            window.removeEventListener('mousedown', onAnyPointerDown);
            window.removeEventListener('mouseup', onAnyPointerUp);
            window.removeEventListener('touchstart', onAnyPointerDown);
            window.removeEventListener('touchend', onAnyPointerUp);
            window.removeEventListener('touchcancel', onAnyPointerUp);
        };
    }, []);
    useFrame((state, delta) => {
        if (group.current) {
            if (!dragging.current && !orbiting.current && !pointerDown.current) {
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
                group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3;
                group.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
            }
            // Set cow scale to 0.8 (20% smaller)
            group.current.scale.set(0.8, 0.8, 0.8);
        }
    });
    return cowObj ? <primitive ref={group} {...props} object={cowObj} /> : null;



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

