'use client'
import React, { useRef, useEffect } from 'react';

const STAR_COUNT = 200;
const STAR_COLORS = ['#fff', '#b5e3ff', '#ffe3f7', '#e3ffe7'];

function randomBetween(a: number, b: number) {
    return a + Math.random() * (b - a);
}

export default function GalaxyBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            if (!canvas) return;
            canvas.width = width;
            canvas.height = height;
        }
        window.addEventListener('resize', resize);

        // Orbit center
        const cx = () => width / 2;
        const cy = () => height / 2;
        // Generate stars in orbits, closer to camera (smaller radius range)
        const stars = Array.from({ length: STAR_COUNT }, () => {
            const angle = randomBetween(0, Math.PI * 2);
            // Closer to center: radius between 60% and 90% of the way out
            const minR = Math.min(width, height) * 0.6 / 2;
            const maxR = Math.min(width, height) * 0.9 / 2;
            const radius = randomBetween(minR, maxR);
            return {
                baseRadius: radius,
                angle,
                r: randomBetween(0.7, 2.2), // slightly larger for "closer"
                color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
                speed: randomBetween(0.0002, 0.0012) / 3, // 3x slower
                twinkle: Math.random() * Math.PI * 2,
            };
        });

        function draw() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            const now = performance.now();
            for (const star of stars) {
                // Orbit motion
                star.angle += star.speed * 16; // 16ms/frame approx
                const x = cx() + Math.cos(star.angle) * star.baseRadius;
                const y = cy() + Math.sin(star.angle) * star.baseRadius;
                // Twinkle
                const twinkle = 0.5 + 0.5 * Math.sin(now * 0.001 + star.twinkle);
                ctx.globalAlpha = twinkle;
                ctx.beginPath();
                ctx.arc(x, y, star.r, 0, 2 * Math.PI);
                ctx.fillStyle = star.color;
                ctx.shadowColor = star.color;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            ctx.globalAlpha = 1;
            requestAnimationFrame(draw);
        }
        draw();

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    );
}
