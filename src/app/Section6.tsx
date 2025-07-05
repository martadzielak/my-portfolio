import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import styles from './page.module.css';

export default function Section6() {
    const ref = useRef<HTMLDivElement>(null);
    const pRef = useRef<HTMLParagraphElement>(null);
    useEffect(() => {
        if (!ref.current || !pRef.current) return;
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ref.current,
                start: 'top 90%',
                end: 'bottom 80%',
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
            <h2 className={styles.sectionHeading}>What is next</h2>
            <p ref={pRef} className={styles.sectionText}>
                I would like to advance my career in software engineering. I am particularly interested in creating user-centered applications and working closely with UX designers. I wonder where this will lead me?
            </p>
        </div>
    );
}
