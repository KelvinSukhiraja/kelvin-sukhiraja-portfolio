'use client';
import { useEffect, useRef } from 'react';
import { getImageProps } from 'next/image';

const samples = new Map<string, Uint8ClampedArray>();
const cols = 64, rows = 38;
/** Immediate, bounded reveal; image decoding never restarts a finished transition. */
export function AsciiPreview({ src }: { src?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const target = canvas.current;
    if (!target || !src || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = target.getContext('2d');
    if (!ctx) return;
    let frame = 0, cancelled = false;
    let data = samples.get(src);
    const {width,height}=target.getBoundingClientRect();
    target.width=width; target.height=height;
    target.dataset.ready='true';
    const start=performance.now();
    const image = new window.Image();
    if (!data) {
      image.onload = () => {
        if (cancelled) return;
        const sample = document.createElement('canvas');
        sample.width=cols; sample.height=rows;
        const sc=sample.getContext('2d',{willReadFrequently:true});
        if(!sc) return;
        sc.fillStyle='#080808';sc.fillRect(0,0,cols,rows);
        const scale=Math.min(cols/image.width,rows/image.height);
        sc.drawImage(image,(cols-image.width*scale)/2,(rows-image.height*scale)/2,image.width*scale,image.height*scale);
        try {
          data=sc.getImageData(0,0,cols,rows).data;
          if(samples.size>=24) samples.delete(samples.keys().next().value!);
          samples.set(src,data);
        } catch { /* The ordinary preview remains visible if sampling fails. */ }
      };
      image.src=getImageProps({src,alt:'',width:320,height:190}).props.src;
    }
    const cellW=width/cols,cellH=height/rows;
    const render=(time:number)=>{
      if(cancelled) return;
      const progress=Math.min(1,(time-start)/300);
      ctx.clearRect(0,0,width,height);
      if(progress===1){target.dataset.finished='true';return;}
      const sweep=1-Math.pow(1-progress,2);
      ctx.font=`${cellH}px monospace`;ctx.textBaseline='top';
      const glyphs=' .:+*#%@';
      for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){
        const noise=((x*37+y*19)%101)/101;
        if(x/cols*.8+noise*.2<sweep) continue;
        const i=(y*cols+x)*4;
        const light=data?(data[i]*.3+data[i+1]*.59+data[i+2]*.11)/255:noise*.55;
        ctx.fillStyle=`rgba(8,8,8,${.85*(1-progress)})`;
        ctx.fillRect(x*cellW,y*cellH,cellW+1,cellH+1);
        ctx.fillStyle=`rgba(225,225,218,${1-progress})`;
        ctx.fillText(glyphs[Math.min(7,Math.floor(light*7+noise))],x*cellW,y*cellH);
      }
      frame=requestAnimationFrame(render);
    };
    frame=requestAnimationFrame(render);
    return ()=>{cancelled=true;image.onload=null;cancelAnimationFrame(frame);};
  },[src]);
  return <canvas ref={canvas} className="archive-ascii" aria-hidden="true" />;
}
