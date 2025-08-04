'use client';
import styles from './page.module.css';
import { useRef } from 'react';
import React from 'react';
import { useSplitText, useSplitWords, useHeadingAnimation, useVideoFadeIn, useParagraphColorAnimation } from './useSectionAnimations';

interface SectionProps {
    heading?: string;
    text: string;
    videoSrc?: string;
    headingAnimationType?: 'scale' | 'rotate' | 'skew' | 'fade' | 'default';
}

export default function Section({ heading, text, videoSrc, headingAnimationType = 'default' }: SectionProps) {
    const ref = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLDivElement>;
    const headingRef = useRef<HTMLElement>(null) as React.MutableRefObject<HTMLElement>;
    const videoRef = useRef<HTMLVideoElement>(null) as React.MutableRefObject<HTMLVideoElement>;
    const paragraphRef = useRef<HTMLElement>(null) as React.MutableRefObject<HTMLElement>;

    // Always call hooks
    useHeadingAnimation(headingRef, headingAnimationType, ref);
    useVideoFadeIn(videoRef, ref);
    useParagraphColorAnimation(paragraphRef, ref);
    const splitHeading = useSplitText(heading || '', styles.letter);
    const splitText = useSplitWords(text, styles.paragraphLetter);

    return (
        <div ref={ref} className={styles.section}>
            {heading && (
                <h3 ref={headingRef as React.RefObject<HTMLHeadingElement>} className={styles.sectionHeading}>
                    {splitHeading}
                </h3>
            )}
            <p ref={paragraphRef as React.RefObject<HTMLParagraphElement>} className={styles.sectionText}>{splitText}</p>
            {videoSrc && (
                <video ref={videoRef} className={styles.video} autoPlay playsInline muted loop>
                    <source src={videoSrc} type="video/mp4" />
                </video>
            )}
        </div>
    );
}
