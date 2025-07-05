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
                start: 'top 80%',
                end: 'bottom 40%',
                scrub: true,
            }
        });
        tl.fromTo(ref.current, { opacity: 0, y: -120, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'expo.out' }, 0);
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
            <h2 className={styles.sectionHeading}>Section 6</h2>
            <p ref={pRef} className={styles.sectionText}>
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.
            </p>
        </div>
    );
}
