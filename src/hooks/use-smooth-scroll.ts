'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-init';
import type Lenis from 'lenis';

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Disable Lenis on mobile/touch devices to avoid scroll issues
    const isMobile = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
    if (isMobile) {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
      return;
    }

    // Dynamically import Lenis only on desktop
    let cancelled = false;
    import('lenis').then(({ default: LenisClass }) => {
      if (cancelled) return;

      const lenis = new LenisClass({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.5,
      });

      lenisRef.current = lenis;

      // Disable browser scroll restoration and start at top
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });

      // Sync Lenis with GSAP ticker
      gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

      // Sync Lenis scroll position with ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      // Handle anchor links
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest('a[href^="#"]');
        if (anchor) {
          e.preventDefault();
          const id = anchor.getAttribute('href');
          if (id) {
            const el = document.querySelector(id);
            if (el) {
              lenis.scrollTo(el as HTMLElement, { offset: -80 });
            }
          }
        }
      };

      document.addEventListener('click', handleClick);

      // Store cleanup handler
      lenisRef.current = lenis;
      (lenis as unknown as Record<string, unknown>).__clickHandler = handleClick;
    });

    return () => {
      cancelled = true;
      const lenis = lenisRef.current;
      if (lenis) {
        const handler = (lenis as unknown as Record<string, unknown>).__clickHandler as EventListener;
        if (handler) document.removeEventListener('click', handler);
        gsap.ticker.remove(lenis.raf);
        lenis.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  return lenisRef;
}
