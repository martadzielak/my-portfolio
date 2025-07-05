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
    useFrame((state, delta) => {
        if (group.current) {
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
            group.current.position.x = x;
            group.current.position.y = y;
            // Gentle floating rotation
            group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3;
            group.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
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

