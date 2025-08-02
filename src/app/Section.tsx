'use client';
import styles from './page.module.css';
import { useRef } from 'react';

interface SectionProps {
    heading?: string;
    text: string;
    videoSrc?: string;
}

export default function Section({ heading, text, videoSrc }: SectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <div ref={ref} className={styles.section}>
            {heading && <h3 className={styles.sectionHeading}>{heading}</h3>}
            <p className={styles.sectionText}>{text}</p>
            {videoSrc && (
                <video ref={videoRef} className={styles.video} autoPlay muted loop>
                    <source src={videoSrc} type="video/mp4" />
                </video>
            )}
        </div>
    );
}
