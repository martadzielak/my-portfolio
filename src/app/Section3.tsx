'use client';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import styles from './page.module.css';

export default function Section3() {
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
            <h2 className={styles.sectionHeading}>2019-2020 Sage</h2>
            <p ref={pRef} className={styles.sectionText}>
                My next position was at Sage, where I started by fixing bugs in legacy part of the software. I have been digging into code written in an internal 4GL language, created in the 70s! Later I worked on internal projects such as implementing a way of gathering documentation from different sources and deploying it automatically to a webpage. At last, I have also worked on preparing and conducting load tests!
            </p>
        </div>
    );
}
