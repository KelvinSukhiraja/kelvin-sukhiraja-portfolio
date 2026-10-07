'use client';
import { useEffect, useRef, useState } from 'react';

export function AsciiWave() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [expanded, setExpanded] = useState(false);
  const amplitude = useRef(1);
  useEffect(() => { amplitude.current = expanded ? 1.8 : 1; }, [expanded]);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    let width = 0, height = 0, frame = 0, visible = true, time = 0, previous = 0;
    let pointerX = .5, tension = 1;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const chars = '·:+×=01';
    const draw = (stamp: number) => {
      frame = 0;
      const delta = Math.min((stamp - previous) / 1000 || .016, .05); previous = stamp;
      if (!motion.matches) time += delta;
      tension = motion.matches ? amplitude.current : tension + (amplitude.current - tension) * .08;
      ctx.clearRect(0, 0, width, height);
      ctx.font = '8px monospace'; ctx.textAlign = 'center';
      const spacing = width < 600 ? 12 : 13;
      for (let x = 0; x < width; x += spacing) {
        const u = x / width;
        const envelope = Math.sin(u * Math.PI);
        for (let row = 0; row < 18; row++) {
          const depth = row / 18;
          const y = height * .56 + Math.sin(u * 9.5 + time * .5 + depth * 2.7) * 44 * envelope * tension + (depth - .5) * 63 * envelope;
          const nearPointer = Math.max(0, 1 - Math.abs(u - pointerX) * 3);
          const alpha = (.13 + (1 - depth) * .48 + nearPointer * .1) * (.3 + envelope * .7);
          ctx.fillStyle = `rgba(222,224,214,${alpha})`;
          ctx.fillText(chars[(Math.floor(x / spacing) + row * 3) % chars.length], x, y);
        }
      }
      if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(draw);
    };
    const start = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const resize = () => { width = el.clientWidth; height = el.clientHeight; const dpr = Math.min(devicePixelRatio, 1.5); el.width = width * dpr; el.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cancelAnimationFrame(frame); draw(performance.now()); };
    const observer = new ResizeObserver(resize); observer.observe(el);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else cancelAnimationFrame(frame); if (!visible) frame = 0; }); intersection.observe(el);
    const pointer = (event: PointerEvent) => { pointerX = (event.clientX - el.getBoundingClientRect().left) / width; };
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else if (visible) start(); };
    const change = () => { cancelAnimationFrame(frame); frame = 0; start(); };
    el.addEventListener('pointermove', pointer); document.addEventListener('visibilitychange', visibility); motion.addEventListener('change', change);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); el.removeEventListener('pointermove', pointer); document.removeEventListener('visibilitychange', visibility); motion.removeEventListener('change', change); };
  }, [expanded]);
  return <section className="ascii-section" aria-label="Interactive ASCII motion study"><div className="ascii-label eyebrow"><span>Study 001</span><span>Image →︎ matter →︎ code</span></div><canvas ref={canvas} aria-hidden="true" /><button className="ascii-control eyebrow" aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Release tension ↙︎' : 'Apply tension ↗︎'}</button></section>;
}
