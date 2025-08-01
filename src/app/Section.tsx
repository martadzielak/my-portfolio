'use client';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import styles from './page.module.css';

interface SectionProps {
    heading?: string;
    text: string;
    videoSrc?: string;
    animationType?: 'slideRight' | 'slideLeft' | 'fadeIn' | 'rotateIn' | 'scaleIn' | 'skewIn';
}

export default function Section({ heading, text, videoSrc, animationType = 'slideRight' }: SectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        // Animation variants
        let fromVars: gsap.TweenVars = { opacity: 0 };
        let toVars: gsap.TweenVars = { opacity: 1, duration: 1.1, ease: 'power2.out' };
        switch (animationType) {
            case 'slideLeft':
                fromVars = { ...fromVars, x: -200 };
                toVars = { ...toVars, x: 0 };
                break;
            case 'fadeIn':
                // Only opacity
                break;
            case 'rotateIn':
                fromVars = { ...fromVars, rotate: 30, x: 100 };
                toVars = { ...toVars, rotate: 0, x: 0 };
                break;
            case 'scaleIn':
                fromVars = { ...fromVars, scale: 0.7 };
                toVars = { ...toVars, scale: 1 };
                break;
            case 'skewIn':
                fromVars = { ...fromVars, skewX: 30, x: 100 };
                toVars = { ...toVars, skewX: 0, x: 0 };
                break;
            case 'slideRight':
            default:
                fromVars = { ...fromVars, x: 200, rotate: 10 };
                toVars = { ...toVars, x: 0, rotate: 0 };
                break;
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ref.current,
                start: 'top 90%',
                end: 'bottom 80%',
                scrub: true,
            }
        });

        tl.fromTo(ref.current, fromVars, toVars, 0);

        if (videoSrc && videoRef.current) {
            gsap.fromTo(
                videoRef.current,
                { opacity: 0, x: 200 },
                {
                    opacity: 1,
                    x: 0,
                    scrollTrigger: {
                        trigger: ref.current,
                        start: 'top 60%',
                        end: 'bottom 60%',
                        scrub: true,
                    },
                    duration: 0.7,
                    ease: 'power1.out',
                }
            );
            gsap.to(
                videoRef.current,
                {
                    opacity: 0,
                    x: 200,
                    scrollTrigger: {
                        trigger: ref.current,
                        start: 'bottom 60%',
                        end: 'bottom 40%',
                        scrub: true,
                    },
                    duration: 0.7,
                    ease: 'power1.in',
                }
            );
        }

        return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [videoSrc, animationType]);

    return (
        <div ref={ref} className={styles.section} style={{ opacity: 0 }}>
            {heading && <h3 className={styles.sectionHeading}>{heading}</h3>}
            <p className={styles.sectionText}>{text}</p>
            {videoSrc && (
                <video ref={videoRef} className={styles.video} autoPlay muted loop style={{ opacity: 0 }}>
                    <source src={videoSrc} type="video/mp4" />
                </video>
            )}
        </div>
    );
}
