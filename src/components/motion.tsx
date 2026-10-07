'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { OuroborosIntro } from './ouroboros-intro';

export function Motion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false, anchors: true });
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      let context: gsap.Context | undefined;
      let alive = true;
      const initialize = () => {
        if (context || !root.current?.querySelector('#main')) return;
        context = gsap.context(() => {
        const entrance = gsap.utils.toArray<HTMLElement>('[data-entrance]');
        if (entrance.length) gsap.from(entrance, { y: 42, opacity: 0, duration: 1.25, stagger: .13, ease: 'power3.out', clearProps: 'all' });
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => {
          gsap.from(el, { y: 34, opacity: 0, duration: .9, ease: 'power3.out', clearProps: 'all', scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
        });
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach(el => {
          gsap.fromTo(el, { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });
        const art = root.current?.querySelector('.hero-art');
        if (art) gsap.to(art, { y: -60, rotate: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
        }, root);
      };
      // This boundary lives inside each server page, after its data resolves.
      if (document.documentElement.dataset.intro !== 'active') initialize();
      window.addEventListener('portfolio:intro-reveal', initialize);
      const refresh = () => { if (alive) ScrollTrigger.refresh(); };
      document.fonts.ready.then(refresh);
      window.addEventListener('load', refresh);
      window.addEventListener('portfolio:layout-change', refresh);
      return () => { alive = false; window.removeEventListener('portfolio:layout-change', refresh); window.removeEventListener('portfolio:intro-reveal', initialize); window.removeEventListener('load', refresh); context?.revert(); gsap.ticker.remove(tick); lenis.destroy(); };
    });
    return () => mm.revert();
  }, [pathname]);
  return <>{pathname === '/' && <OuroborosIntro />}<div ref={root} data-portfolio-content>{children}</div></>;
}
