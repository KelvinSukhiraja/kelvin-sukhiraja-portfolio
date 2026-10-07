import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import { getPortfolio } from '@/lib/sanity/client';
import { imageUrl } from '@/lib/sanity/image';
import { editorialDefaults, nextProject, projectPath, safeExternalUrl, mediaTheme } from '@/lib/content';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { ProjectImage } from '@/components/project-image';
import { Motion } from '@/components/motion';

export const revalidate = 60;
export async function generateStaticParams() { const { projects } = await getPortfolio(); return projects.map(p => ({ slug: p.slug })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { projects } = await getPortfolio();
  const project = projects.find(p => p.slug === slug || p._id === slug);
  if (!project) return { title: 'Project not found', robots: { index: false } };
  const image = imageUrl(project.heroImage || project.image, 1200);
  return { title: project.title, description: project.description, alternates: { canonical: projectPath(project) }, openGraph: { title: project.title, description: project.description, images: image ? [image] : [], type: 'article' } };
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const { projects, settings } = await getPortfolio();
  const project = projects.find(p => p.slug === slug || p._id === slug);
  if (!project) notFound();
  if (slug !== project.slug) permanentRedirect(projectPath(project));
  const next = nextProject(project, projects);
  const site = safeExternalUrl(project.href);
  const github = safeExternalUrl(project.githubUrl);
  const video = safeExternalUrl(project.videoUrl);
  return <Motion>
    <Nav name={settings.name || editorialDefaults.name} location={settings.location || editorialDefaults.location} />
    <main id="main" className="case-study shell">
      <div className="case-topline eyebrow"><Link href="/#work">← Back to selected work</Link><span>{project.category} / {project.year}</span></div>
      <h1 className="case-title" data-entrance>{project.title}<span className="title-period">.</span></h1>
      <div className="case-intro" data-entrance><p>{project.description}</p><div className="case-links">{site && <a className="text-link" href={site} target="_blank" rel="noopener noreferrer">Visit project ↗</a>}{github && <a className="text-link" href={github} target="_blank" rel="noopener noreferrer">View source ↗</a>}</div></div>
      <dl className="case-facts"><div><dt>Year</dt><dd>{project.year || '—'}</dd></div><div><dt>Discipline</dt><dd>{project.category}</dd></div>{project.role && <div><dt>Role</dt><dd>{project.role}</dd></div>}{project.client && <div><dt>Client</dt><dd>{project.client}</dd></div>}{project.tags.length > 0 && <div><dt>Technologies</dt><dd>{project.tags.join(' / ')}</dd></div>}</dl>
      <div className="case-hero-media" style={{ backgroundColor: mediaTheme(project.theme) }}>{video ? <video controls preload="none" playsInline poster={imageUrl(project.heroImage || project.image)} aria-label={`${project.title} demonstration`}><source src={video} />Your browser does not support video playback.</video> : <ProjectImage image={project.heroImage || project.image} title={project.title} priority sizes="92vw" />}</div>
      {project.details && <section className="case-chapter" data-reveal><span className="eyebrow">01 / The project</span><div className="case-prose"><h2>Behind the interface.</h2>{project.details.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div></section>}
      {project.chapters?.map((chapter, i) => <section className="case-chapter" data-reveal key={chapter._key}><span className="eyebrow">{String(i + (project.details ? 2 : 1)).padStart(2, '0')} / {chapter.title}</span><div className="case-prose"><h2>{chapter.title}</h2>{chapter.body && <PortableText value={chapter.body} components={{ marks: { link: ({ value, children }) => { const href = safeExternalUrl(value?.href); return href ? <a href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a> : <>{children}</>; } } }} />}{chapter.image?.asset && <figure><div className="chapter-image"><ProjectImage image={chapter.image} title={chapter.title} /></div>{chapter.image.caption && <figcaption>{chapter.image.caption}</figcaption>}</figure>}</div></section>)}
      {!!project.gallery?.length && <section className="case-gallery" aria-label="Project gallery">{project.gallery.map((image, i) => <figure key={image.asset?._id || i} data-reveal><div className="gallery-image"><ProjectImage image={image} title={`${project.title}, detail ${i + 1}`} sizes="(max-width: 760px) 92vw, 45vw" /></div>{image.caption && <figcaption className="eyebrow">{image.caption}</figcaption>}</figure>)}</section>}
      {next && <Link className="next-project" href={projectPath(next)}><span className="eyebrow">Next project / {next.category}</span><span className="next-title">{next.title}<span aria-hidden="true">↗</span></span></Link>}
    </main>
    <Footer settings={settings} />
  </Motion>;
}
