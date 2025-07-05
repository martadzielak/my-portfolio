import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import styles from './page.module.css';

export default function Section1() {
    const ref = useRef<HTMLDivElement>(null);
    const pRef = useRef<HTMLParagraphElement>(null);
    useEffect(() => {
        if (!ref.current || !pRef.current) return;
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ref.current,
                start: 'top 40%',
                end: 'top 60%',
                scrub: true,
            }
        });
        tl.fromTo(ref.current, { opacity: 0, x: 200, rotate: 10 }, { opacity: 1, x: 0, rotate: 0, duration: 1.1, ease: 'power2.out' }, 0);
        tl.fromTo(
            pRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.7, ease: 'power1.out' },
            0.2
        );
        return () => {
            if (tl.scrollTrigger) tl.scrollTrigger.kill();
            tl.kill();
        };
    }, []);
    return (
        <div ref={ref} className={styles.section} style={{ opacity: 0 }}>
            <h2 className={styles.sectionHeading}>Hi!</h2>
            <p ref={pRef} className={styles.sectionText}>
                My name is Marta, and I am a software engineer with a passion for creating innovative solutions. Let me show you my proffessional journey and the projects I have worked on.
            </p>
        </div>
    );
}
