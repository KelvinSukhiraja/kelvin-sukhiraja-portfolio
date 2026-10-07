'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/** Image-sampled tiger echo; redraw only on input/resize, no idle animation loop. */
export function HeritageStudy() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const draw = useRef<() => void>(() => {});
  const pointer = useRef({ x: -1, y: -1 });
  const [pose, setPose] = useState(0);
  useEffect(() => {
    const target = canvas.current;
    if (!target) return;
    const ctx = target.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    let width = 0, height = 0;
    let disposed = false;
    const points: {x:number;y:number;light:number}[] = [];
    const image = new window.Image();
    image.onload = () => {
      if(disposed) return;
      const sample = document.createElement('canvas');
      sample.width = 128; sample.height = 76;
      const sc = sample.getContext('2d',{willReadFrequently:true});
      if(!sc) return;
      sc.drawImage(image,0,0,128,76);
      const pixels = sc.getImageData(0,0,128,76).data;
      for(let y=0;y<76;y++) for(let x=0;x<128;x++) {
        const i=(y*128+x)*4;
        if(pixels[i+3]<100) continue;
        const light=(pixels[i]*.3+pixels[i+1]*.59+pixels[i+2]*.11)/255;
        if(light<.08) continue;
        points.push({x:x/127,y:y/75,light});
      }
      draw.current();
    };
    // The earlier high-contrast engraving keeps stripe detail in the monochrome echo.
    image.src='/art/raden-saleh-tiger-study.webp';
    const render = () => {
      frame = 0;
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);
      const artWidth=width*(width<600?.90:.94);
      const artHeight=artWidth*.6;
      const centerX=width*(width<600?.57:.55), centerY=height*(width<600?.50:.36);
      const rotation=-.16;
      const cos=Math.cos(rotation),sin=Math.sin(rotation);
      ctx.font = `${Math.max(5,artWidth/128*1.1)}px monospace`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      const glyphs='.:+*#%@';
      for(const point of points) {
        // A mirrored, offset second impression puts the face in the open right-hand space.
        const localX=(.5-point.x)*artWidth;
        const localY=(point.y-.5)*artHeight;
        const x=centerX+localX*cos-localY*sin;
        const y=centerY+localX*sin+localY*cos;
        const dx=x-pointer.current.x*width,dy=y-pointer.current.y*height;
        const force=Math.max(0,1-Math.hypot(dx,dy)/150);
        const fade=Math.min(1,Math.max(0,(x/width-.08)/.4));
        ctx.fillStyle=`rgba(225,224,217,${fade*(.14+point.light*.64+force*.15)})`;
        const glyph=glyphs[Math.min(6,Math.floor(point.light*6+force*2))];
        ctx.fillText(glyph,x+dx*force*.13,y+dy*force*.13);
      }
    };
    draw.current = () => { if (!frame) frame = requestAnimationFrame(render); };
    const observer = new ResizeObserver(() => {
      const rect = target.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const dpr = Math.min(devicePixelRatio, 1.5);
      target.width = Math.round(width * dpr); target.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw.current();
    });
    observer.observe(target);
    return () => { disposed=true; image.onload=null; cancelAnimationFrame(frame); observer.disconnect(); draw.current = () => {}; };
  }, []);
  function turn() {
    const next = (pose + 1) % 3;
    setPose(next);
  }
  return <section id="heritage" className="heritage-study shell" aria-labelledby="heritage-title">
    <div className="heritage-label eyebrow"><span>Study / Heritage</span><span>Image, type & matter</span></div>
    <div ref={stage} className={`heritage-stage pose-${pose}`} onPointerMove={event => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      if (event.pointerType === 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      stage.current?.style.setProperty('--lean', `${(x - .5) * 18}deg`);
      pointer.current = {x, y};
      stage.current?.style.setProperty('--rise', `${(y - .5) * -12}deg`);
      draw.current();
    }} onPointerLeave={() => {
      pointer.current = {x:-1,y:-1};
      stage.current?.style.setProperty('--lean','0deg'); stage.current?.style.setProperty('--rise','0deg'); draw.current();
    }}>
      <h2 id="heritage-title">Heritage</h2>
      <canvas ref={canvas} className="heritage-ascii" aria-hidden="true" />
      <button className="tiger-turn" onClick={turn} aria-label="Turn the tiger artwork" data-pose={pose}>
        <Image src="/art/raden-saleh-tiger-pink-red.webp" alt="Red and pink screenprint study of two intertwined tigers, after Raden Saleh" width={1400} height={840} sizes="(max-width:760px) 90vw, 55vw" />
      </button>
      <span className="heritage-instruction eyebrow">Move to disturb.<br />Click or press Enter to turn.</span>
      <span className="heritage-coordinate eyebrow" aria-live="polite">Perspective / 0{pose + 1}</span>
    </div>
    <div className="heritage-caption"><span className="eyebrow">An Indonesian point of view.</span><div><p>A connection to my Indonesian heritage, translated into a digital material. Raden Saleh’s tigers become pigment, characters and movement. A study in carrying something of home into the things I make.</p><p className="heritage-credit">Contemporary digital interpretation after Raden Saleh, <a href="https://commons.wikimedia.org/wiki/File:Raden_Saleh_-_K%C3%A4mpfende_Tiger_%C3%BCber_der_Leiche_eines_Javaners_1870_-_Belvedere_Wien_Inv.Nr._7899.jpg" target="_blank" rel="noreferrer">Tigers Fighting over a Dead Javanese (1870) ↗</a>. Generated artwork treatment; not a reproduction.</p></div></div>
  </section>;
}




