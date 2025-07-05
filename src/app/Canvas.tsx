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
    const direction = useRef({ x1: 0, y1: 0, x2: 0, y2: 0 });
    const progressRef = useRef(0);
    const duration = 16; // seconds for one full move
    // Pick two random points within the visible area (always on screen)
    // For camera z=3, x/y in [-1.5, 1.5] is always visible
    function pickRandomPoints() {
        const r = 1.3; // stay well within the view
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = angle1 + Math.PI + (Math.random() - 0.5) * Math.PI * 0.7;
        return {
            x1: Math.cos(angle1) * r,
            y1: Math.sin(angle1) * r,
            x2: Math.cos(angle2) * r,
            y2: Math.sin(angle2) * r,
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
            const smooth = p < 0.15 ? 0 : p > 0.85 ? 1 : (p - 0.15) / 0.7;
            const x = direction.current.x1 + (direction.current.x2 - direction.current.x1) * smooth;
            const y = direction.current.y1 + (direction.current.y2 - direction.current.y1) * smooth;
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

