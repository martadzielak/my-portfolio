import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import React from 'react';

/**
 * Splits a string into an array of <span> elements, one per letter, for animation.
 */
export function useSplitText(text: string, className?: string) {
    return text.split('').map((char, i) => (
        React.createElement('span', {
            key: i,
            className: className,
            'data-letter': char
        }, char === ' ' ? '\u00A0' : char)
    ));
}

/**
 * Splits a string into an array of <span> elements, one per word, for animation.
 */
export function useSplitWords(text: string, className?: string) {
    return text.split(' ').map((word, i) => (
        React.createElement('span', {
            key: i,
            className: className,
            'data-word': word
        }, word + (i !== text.split(' ').length - 1 ? '\u00A0' : ''))
    ));
}

/**
 * Animates each letter of a heading with a color change, one by one, bound to scroll.
 * @param containerRef - ref to the heading element
 * @param animationType - unique animation per section (e.g. color, scale, rotate)
 * @param triggerRef - ref to the section div
 */
export function useHeadingAnimation(containerRef: React.RefObject<HTMLElement>, animationType: string, triggerRef: React.RefObject<HTMLElement>) {
    useEffect(() => {
        if (!containerRef.current || !triggerRef.current) return;
        const letters = containerRef.current.querySelectorAll('span');
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: triggerRef.current,
                start: 'top 80%',
                end: 'top 30%',
                scrub: true,
            }
        });
        letters.forEach((el, i) => {
            switch (animationType) {
                case 'scale':
                    tl.fromTo(el, { color: '#222', scale: 0.7 }, { color: '#fff', scale: 1, duration: 0.2 }, i * 0.05);
                    break;
                case 'rotate':
                    tl.fromTo(el, { color: '#222', rotate: 30 }, { color: '#fff', rotate: 0, duration: 0.2 }, i * 0.05);
                    break;
                case 'skew':
                    tl.fromTo(el, { color: '#222', skewX: 30 }, { color: '#fff', skewX: 0, duration: 0.2 }, i * 0.05);
                    break;
                case 'fade':
                    tl.fromTo(el, { color: '#222', opacity: 0 }, { color: '#fff', opacity: 1, duration: 0.2 }, i * 0.05);
                    break;
                default:
                    tl.fromTo(el, { color: '#222' }, { color: '#fff', duration: 0.2 }, i * 0.05);
            }
        });
        return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
        };
    }, [containerRef, animationType, triggerRef]);
}

/**
 * Fades in the video when the section scrolls into view.
 */
export function useVideoFadeIn(videoRef: React.RefObject<HTMLVideoElement>, triggerRef: React.RefObject<HTMLElement>) {
    useEffect(() => {
        if (!videoRef.current || !triggerRef.current) return;
        const anim = gsap.fromTo(
            videoRef.current,
            { opacity: 0 },
            {
                opacity: 1,
                scrollTrigger: {
                    trigger: triggerRef.current,
                    start: 'top 70%',
                    end: 'bottom 60%',
                    scrub: true,
                },
                duration: 0.7,
                ease: 'power1.out',
            }
        );
        return () => {
            anim.scrollTrigger?.kill();
            anim.kill();
        };
    }, [videoRef, triggerRef]);
}

/**
 * Animates each letter of a paragraph with a color change, one by one, bound to scroll.
 * @param containerRef - ref to the paragraph element
 * @param triggerRef - ref to the section div
 */
export function useParagraphColorAnimation(containerRef: React.RefObject<HTMLElement>, triggerRef: React.RefObject<HTMLElement>) {
    useEffect(() => {
        if (!containerRef.current || !triggerRef.current) return;
        const words = containerRef.current.querySelectorAll('span');
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: triggerRef.current,
                start: 'top 85%',
                end: 'top 40%',
                scrub: true,
            }
        });
        words.forEach((el, i) => {
            tl.fromTo(el, { color: '#222' }, { color: '#aaa', duration: 0.2 }, i * 0.08);
        });
        return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
        };
    }, [containerRef, triggerRef]);
}
