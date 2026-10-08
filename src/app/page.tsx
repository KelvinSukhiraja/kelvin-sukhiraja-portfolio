import type { Metadata } from 'next';
import Link from 'next/link';
import { getPortfolio } from '@/lib/sanity/client';

import { editorialDefaults as defaults, featuredProjects, projectPath, mediaTheme } from '@/lib/content';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { ProjectImage } from '@/components/project-image';
import { ProjectIndex } from '@/components/project-index';
import { HeroArt } from '@/components/hero-art';
import { HeritageStudy } from '@/components/heritage-study';
import { Motion } from '@/components/motion';

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPortfolio();
  const title = settings.seoTitle || `${settings.name || defaults.name} — Creative Developer`;
  const description = settings.seoDescription || settings.heroBody || defaults.heroBody;
  return { title: { absolute: title }, description, alternates: { canonical: '/' }, openGraph: { title, description, type: 'website', url: '/' } };
}
export default async function Home() {
  const { projects, settings } = await getPortfolio();
  const featured = featuredProjects(projects, settings);
  const heroLines = (settings.heroTitle || defaults.heroTitle).split('\n');
  const aboutLines = (settings.aboutTitle || defaults.aboutTitle).split('\n');
  const technologies = settings.technologies || [...new Set(projects.flatMap(p => p.tags))].slice(0, 10);
  return <Motion>
    <Nav home name={settings.name || defaults.name} location={settings.location || defaults.location} />
    <main id="main">
      <section className="hero shell" aria-labelledby="hero-title">
        <p className="hero-role eyebrow" data-entrance>{settings.heroEyebrow || defaults.heroEyebrow}</p>
        <HeroArt />
        <h1 className="hero-title display" id="hero-title"><span data-entrance>{heroLines[0]}</span>{heroLines.length > 1 && <em data-entrance>{heroLines.slice(1).join(' ')}</em>}</h1>
        <div className="hero-copy" data-entrance><p>{settings.heroBody || defaults.heroBody}</p><span className="eyebrow">Design sensibility. Engineering depth.</span></div>
        <div className="hero-study eyebrow"><span>Study 002 / Ouroboros</span><span>Continuous becoming</span></div>
        <div className="hero-baseline eyebrow"><a href="#work">Selected work <span aria-hidden="true">↓︎</span></a><span>{settings.availability || settings.location || defaults.location}</span><a href="#work" className="scroll-cue">Scroll to explore ↓︎</a></div>
      </section>
      <section id="work" className="selected-work shell" aria-label="Selected work">
        <div className="work-heading" data-reveal><span className="eyebrow">Selected works / An ongoing collection</span><h2 className="display">Built with intent.<em>Made to move.</em></h2><p>Expressive experiences.<br />Systems that work.</p></div>
        {featured.map((project, index) => <article className="work-spread" key={project._id}>
          <div className="spread-heading" data-reveal><span className="eyebrow">({String(index + 1).padStart(2, '0')})</span><h3><Link href={projectPath(project)}>{project.title}</Link></h3><Link href={projectPath(project)} className="spread-arrow" aria-label={`Explore ${project.title}`}>↗︎</Link></div>
          <Link href={projectPath(project)} className="feature-media spread-media" style={{ backgroundColor: mediaTheme(project.theme) }} aria-label={`View ${project.title}`} data-reveal><div className="media-inner" data-parallax><ProjectImage image={project.heroImage || project.image} title={project.title} sizes="90vw" /></div><span className="spread-open eyebrow">Enter project ↗︎</span></Link>
          <div className="spread-caption"><p className="eyebrow">{project.category}<br />{project.year}</p><p>{project.description}</p><span className="eyebrow">{project.tags.slice(0,3).join(' / ')}</span></div>
        </article>)}
        {!projects.length && <p className="empty-message">New work is taking shape. Check back soon.</p>}
      </section>
      <ProjectIndex projects={projects} />
      <section id="about" className="about shell">
        <div className="practice-top"><span className="eyebrow">The practice / {settings.name || defaults.name}</span><span className="eyebrow">{settings.location || defaults.location}</span></div>
        <div className="practice-manifesto"><span className="practice-mark" aria-hidden="true">↗︎</span><h2 className="display" data-reveal><span>{aboutLines[0]}</span><em>{aboutLines.slice(1).join(' ')}</em></h2></div>
        <div className="practice-body"><span className="eyebrow">A designer’s eye.<br />An engineer’s mind.</span><p data-reveal>{settings.biography || defaults.biography}</p></div>
        <div className="practice-disciplines">{(settings.capabilities || defaults.capabilities).map((group,index) => <details key={group._key} open={index===0}><summary><span className="eyebrow">0{index+1}</span><h3>{group.title}</h3><span className="discipline-toggle" aria-hidden="true">+</span></summary><ul>{group.items?.map(item=><li key={item}>{item}</li>)}</ul></details>)}</div>
        {technologies.length > 0 && <div className="practice-tools eyebrow"><span>Working with</span><p>{technologies.join(' / ')}</p></div>}
      </section>
      <HeritageStudy />
    </main>
    <Footer settings={settings} />
  </Motion>;
}


