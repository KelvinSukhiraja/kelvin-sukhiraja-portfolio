'use client';
import { useLayoutEffect, useRef } from 'react';
import { introFrame } from '@/lib/ouroboros-intro';
const storageKey = 'afterimage-intro-seen-v1';
let seenInMemory = false;

export function OuroborosIntro() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const element = root.current, node = canvas.current, curtain = veil.current, button = skip.current;
    const content = document.querySelector<HTMLElement>('[data-portfolio-content]');
    if (!element || !node || !curtain || !button || !content) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let seen = seenInMemory;
    try { seen ||= sessionStorage.getItem(storageKey) === '1'; } catch { /* Storage can be disabled. */ }
    const replay = new URLSearchParams(location.search).get('intro') === '1';
    if ((seen && !replay) || preference.matches || location.hash || window.scrollY > 50) return;
    const ctx = node.getContext('2d');
    if (!ctx) return;
    const glyphs = new Map<string, HTMLCanvasElement>();
    for (const character of '.:/+x%#') {
      const sprite = document.createElement('canvas'); sprite.width = sprite.height = 24;
      const ink = sprite.getContext('2d');
      if (!ink) return;
      ink.scale(3, 3); ink.font = '4.5px monospace'; ink.textAlign = 'center'; ink.textBaseline = 'middle';
      ink.fillStyle = '#e1e4de'; ink.fillText(character, 4, 4); glyphs.set(character, sprite);
    }
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousInert = content.inert;
    let frame = 0, start = 0, last = 0, finished = false, revealed = false;
    let width = innerWidth, height = innerHeight;
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      node.width = Math.round(width * dpr); node.height = Math.round(height * dpr);
    };
    resize();
    element.hidden = false;
    document.documentElement.dataset.intro = 'active';
    document.body.style.overflow = 'hidden';
    content.inert = true;
    button.focus({ preventScroll: true });
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      window.dispatchEvent(new Event('portfolio:intro-reveal'));
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      seenInMemory = true;
      try { sessionStorage.setItem(storageKey, '1'); } catch { /* In-memory guard remains. */ }
      reveal();
      element.hidden = true;
      delete document.documentElement.dataset.intro;
      document.body.style.overflow = previousOverflow;
      content.inert = previousInert;
      if (document.activeElement === button) {
        if (previousFocus && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
        else { const main = content.querySelector<HTMLElement>('main'); main?.setAttribute('tabindex', '-1'); main?.focus({ preventScroll: true }); }
      }
    };
    const smooth = (value: number) => { const p = Math.max(0, Math.min(1, value)); return p * p * (3 - 2 * p); };
    const tick = (now: number) => {
      if (finished) return;
      if (!start) start = now;
      const seconds = (now - start) / 1000;
      if (seconds >= 4.3) { finish(); return; }
      if (seconds >= 3.8) document.documentElement.dataset.intro = 'handoff';
      frame = requestAnimationFrame(tick);
      if (now - last < 1000 / 30) return;
      last = now;
      const progress = smooth(seconds / 3.2);
      const settle = smooth((seconds - 2.7) / 1.1);
      const art = content.querySelector('.hero-art')?.getBoundingClientRect();
      const initialScale = Math.min(width * .78 / 720, height * .82 / 760, 1);
      const targetScale = art ? Math.min(art.width / 720, art.height / 760) : initialScale;
      const scale = initialScale + (targetScale - initialScale) * settle;
      const cx = width / 2 + ((art ? art.left + art.width / 2 : width / 2) - width / 2) * settle;
      const cy = height / 2 + ((art ? art.top + art.height / 2 : height / 2) - height / 2) * settle;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
      ctx.translate(cx, cy); ctx.scale(scale, scale);
      const fade = 1 - smooth((seconds - 3.8) / .5);
      for (const point of introFrame(progress)) {
        if (point.alpha < .01) continue;
        ctx.globalAlpha = point.alpha * fade;
        ctx.drawImage(glyphs.get(point.glyph)!, point.x - 4, point.y - 4, 8, 8);
      }
      ctx.globalAlpha = 1;
      if (seconds >= 3.2) {
        reveal();
        const wave = smooth((seconds - 3.2) / 1.1);
        const bx = cx + 35 * scale, by = cy - 265 * scale;
        const r = Math.hypot(width, height) * wave;
        curtain.style.maskImage = `radial-gradient(circle at ${bx}px ${by}px, transparent ${Math.max(0, r - 30)}px, black ${r + 10}px)`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(225,228,222,${(1 - wave) * .35})`; ctx.lineWidth = 1; ctx.stroke();
      }
    };
    frame = requestAnimationFrame(tick);
    // A stalled frame or browser backgrounding must never trap the visitor.
    const watchdog = window.setTimeout(finish, 5500);
    const keyboard = (event: KeyboardEvent) => {
      if (finished) return;
      if (event.key === 'Escape') finish();
      if (event.key === 'Tab') { event.preventDefault(); button.focus({ preventScroll: true }); }
    };
    const visibility = () => { if (document.hidden) finish(); };
    button.addEventListener('click', finish);
    window.addEventListener('keydown', keyboard);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    preference.addEventListener('change', finish);
    return () => {
      cancelAnimationFrame(frame); clearTimeout(watchdog);
      button.removeEventListener('click', finish); window.removeEventListener('keydown', keyboard);
      window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility);
      preference.removeEventListener('change', finish);
      element.hidden = true; delete document.documentElement.dataset.intro;
      document.body.style.overflow = previousOverflow; content.inert = previousInert;
    };
  }, []);
  return <div ref={root} className="ouroboros-intro" hidden data-lenis-prevent role="dialog" aria-modal="true" aria-label="Opening animation">
    <div ref={veil} className="intro-veil" />
    <canvas ref={canvas} aria-hidden="true" />
    <span className="intro-caption eyebrow">A continuous becoming</span>
    <button ref={skip} className="intro-skip eyebrow">Skip intro ↗︎</button>
  </div>;
}
