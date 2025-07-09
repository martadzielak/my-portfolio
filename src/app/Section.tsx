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
}

export default function Section({ heading, text, videoSrc }: SectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const pRef = useRef<HTMLParagraphElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (!ref.current || !pRef.current || (videoSrc && !videoRef.current)) return;
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ref.current,
                start: 'top 90%',
                end: 'bottom 80%',
                scrub: true,
            }
        });
        tl.fromTo(ref.current, { opacity: 0, x: 200, rotate: 10 }, { opacity: 1, x: 0, rotate: 0, duration: 1.1, ease: 'power2.out' }, 0);
        if (videoSrc && videoRef.current) {
            gsap.fromTo(
                videoRef.current,
                { opacity: 0, rotate: -20, x: 100 },
                {
                    opacity: 1,
                    rotate: 0,
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
                    rotate: 20,
                    x: -100,
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
            if (tl.scrollTrigger) tl.scrollTrigger.kill();
            tl.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [videoSrc]);
    return (
        <div ref={ref} className={styles.section} style={{ opacity: 0 }}>
            {heading && <h3 className={styles.sectionHeading}>{heading}</h3>}
            <p ref={pRef} className={styles.sectionText}>{text}</p>
            {videoSrc && (
                <video ref={videoRef} className={styles.video} autoPlay muted loop style={{ opacity: 0 }}>
                    <source src={videoSrc} type="video/mp4" />
                </video>
            )}
        </div>
    );
}
