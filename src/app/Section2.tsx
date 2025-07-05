import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import styles from './page.module.css';

export default function Section2() {
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
            <h2 className={styles.sectionHeading}>2019 - Praca.pl</h2>
            <p ref={pRef} className={styles.sectionText}>
                My first professional experience as a software engineer was at Praca.pl, where I worked on implementing Wordpress webpages with job offers. I have been preparing them independently from the beginning to production! Also, my work included implementing improvements for SEO.
            </p>
            <video className={styles.video} autoPlay muted loop>
                <source src="/Pracapl-movie.mp4" type="video/mp4" />
            </video>
        </div>
    );
}
