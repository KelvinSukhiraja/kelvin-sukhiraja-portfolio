'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { createOuroborosRenderer } from '@/lib/ouroboros-renderer';

export function HeroArt() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const clock = useRef(0);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const node = canvas.current;
    const element = root.current;
    if (!node || !element) return;
    const renderer = createOuroborosRenderer(node);
    if (!renderer) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, previous = 0, width = 1, height = 1;
    let visible = true, initialized = false;
    let loaded = false, disposed = false;
    const pointer = { x: 0, y: 0, strength: 0 };
    const target = { x: 0, y: 0, strength: 0 };
    const draw = () => {
      if (loaded) renderer.draw(width, height, clock.current, pointer);
    };
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!loaded || document.documentElement.dataset.intro) { previous = 0; return; }
      if (previous && now - previous < 1000 / 60) return;
      if (previous) clock.current += Math.min((now - previous) / 1000, .08);
      previous = now;
      pointer.x += (target.x - pointer.x) * .2;
      pointer.y += (target.y - pointer.y) * .2;
      pointer.strength += (target.strength - pointer.strength) * .14;
      draw();
      if (!initialized) { initialized = true; setReady(true); }
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (!pausedRef.current && !preference.matches && visible && !document.hidden) frame = requestAnimationFrame(tick);
      if (preference.matches) { pointer.strength = 0; clock.current = 0; draw(); }
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || pausedRef.current || preference.matches) return;
      const rect = element.getBoundingClientRect();
      const scale = Math.min(rect.width / 720, rect.height / 760);
      target.x = (event.clientX - rect.left - rect.width / 2) / scale;
      target.y = (event.clientY - rect.top - rect.height / 2) / scale;
      target.strength = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom ? 1 : 0;
    };
    const leave = () => { target.strength = 0; };
    const size = (nextWidth: number, nextHeight: number) => {
      width = nextWidth;
      height = nextHeight;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      node.width = Math.round(width * ratio);
      node.height = Math.round(height * ratio);
      draw();
    };
    // Do not expose a default 300x150 canvas while ResizeObserver is pending.
    size(element.clientWidth, element.clientHeight);
    const resize = new ResizeObserver(([entry]) => size(entry.contentRect.width, entry.contentRect.height));
    resize.observe(element);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(element);
    preference.addEventListener('change', sync);
    window.addEventListener('portfolio:hero-pause', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    const image = new window.Image();
    image.onload = () => { if (disposed) return; renderer.upload(image); loaded = true; draw(); sync(); };
    image.src = '/art/ouroboros-still.svg';
    const lost = (event: Event) => { event.preventDefault(); loaded = false; cancelAnimationFrame(frame); setReady(false); };
    node.addEventListener('webglcontextlost', lost);
    sync();
    return () => {
      disposed = true; image.onload = null;
      node.removeEventListener('webglcontextlost', lost);
      renderer.dispose();
      cancelAnimationFrame(frame);
      resize.disconnect(); observer.disconnect();
      preference.removeEventListener('change', sync);
      window.removeEventListener('portfolio:hero-pause', sync);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
    };
  }, []);
  return <>
    <div ref={root} className={`hero-art ${ready ? 'is-ready' : ''}`} aria-hidden="true">
      <Image className="hero-art-fallback" src="/art/ouroboros-still.svg" alt="" width={720} height={760} unoptimized preload />
      <canvas ref={canvas} className="hero-art-stage" />
    </div>
    <button className="hero-motion-control eyebrow" aria-pressed={paused} onClick={() => {
      pausedRef.current = !pausedRef.current;
      window.dispatchEvent(new Event('portfolio:hero-pause'));
      setPaused(pausedRef.current);
    }}>{paused ? 'Resume motion ↗︎' : 'Pause motion Ⅱ'}</button>
  </>;
}

