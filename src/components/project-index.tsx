'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/types';
import { projectPath } from '@/lib/content';
import { ProjectImage } from './project-image';
import { AsciiPreview } from './ascii-preview';
import { imageUrl } from '@/lib/sanity/image';

export function ProjectIndex({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(projects[0]?._id);
  const [expanded, setExpanded] = useState(false);
  const preview = useRef<HTMLDivElement>(null);
  if (!projects.length) return null;
  const current = projects.find(project => project._id === active) || projects[0];
  const number = projects.indexOf(current) + 1;
  const browseProjects = expanded ? projects : projects.slice(0, 10);
  const browseIndex = Math.max(0, browseProjects.findIndex(project => project._id === current._id));
  const renderRow = (project: Project, index: number) => <Link key={project._id} href={projectPath(project)} className={`index-row ${active === project._id ? 'is-active' : ''}`} onMouseEnter={() => setActive(project._id)} onFocus={() => setActive(project._id)}>
      <span className="row-number eyebrow">{String(index + 1).padStart(2, '0')}</span><span className="row-title">{project.title}</span><span className="row-category eyebrow">{project.category}</span><span className="row-year eyebrow">{project.year}</span><span className="row-arrow" aria-hidden="true">↗</span>
    </Link>;
  return <section className="project-index shell" aria-labelledby="index-title">
    <div className="archive-heading"><h2 id="index-title" className="section-title" data-reveal>Selected index <em>({String(projects.length).padStart(2, '0')})</em></h2><span className="eyebrow">Explore the full body of work ↙</span></div>
    <div className="index-layout"><div className="index-preview" ref={preview} aria-hidden="true">
      <span className="archive-counter">{String(number).padStart(2, '0')}<em>/{String(projects.length).padStart(2, '0')}</em></span>
      <div className="archive-screen" key={current._id}><ProjectImage image={current.heroImage || current.image} title={current.title} sizes="(max-width:760px) 90vw, 43vw" /><AsciiPreview src={imageUrl(current.heroImage || current.image,640)} /><span className="archive-frame-label eyebrow">Image / character / {String(number).padStart(2,'0')}</span></div>
      <div className="archive-caption"><span>{current.title}</span><span className="eyebrow">{current.category} / {current.year}</span></div>
      <p className="archive-description">{current.description}</p>
    </div><div className="archive-browse">
      <button aria-label="Preview previous project" onClick={() => setActive(browseProjects[(browseIndex - 1 + browseProjects.length) % browseProjects.length]._id)}>←</button>
      <span className="eyebrow" aria-live="polite">{current.title} / {number} of {projects.length}</span>
      <button aria-label="Preview next project" onClick={() => setActive(browseProjects[(browseIndex + 1) % browseProjects.length]._id)}>→</button>
    </div><div className="index-rows" onPointerMove={event => {
      if(event.pointerType === 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect=event.currentTarget.getBoundingClientRect();
      preview.current?.style.setProperty('--preview-x', `${(event.clientX-rect.left)/rect.width*8-4}deg`);
      preview.current?.style.setProperty('--preview-y', `${(event.clientY-rect.top)/rect.height*-6+3}deg`);
    }} onPointerLeave={()=>{preview.current?.style.setProperty('--preview-x','0deg');preview.current?.style.setProperty('--preview-y','0deg');}}>{projects.slice(0,10).map(renderRow)}{projects.length > 10 && <details className="archive-more" onToggle={event => {
      const open=event.currentTarget.open;
      setExpanded(open);
      window.dispatchEvent(new Event('portfolio:layout-change'));
      if(!open && number>10) setActive(projects[0]._id);
    }}><summary><span>{expanded ? 'Show fewer projects' : `Explore ${projects.length-10} more projects`}</span><span aria-hidden="true">{expanded ? '−' : '+'}</span></summary><div>{projects.slice(10).map((project,index)=>renderRow(project,index+10))}</div></details>}</div></div>
  </section>;
}
