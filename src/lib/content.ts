import type { Project, RawProject, SiteSettings } from './types';

// Editorial defaults keep older Studio documents compatible. CMS values always win.
export const editorialDefaults = {
  name: 'Kelvin Sukhiraja',
  location: 'Jakarta / Remote',
  heroEyebrow: 'Frontend engineer / Creative developer',
  heroTitle: 'Interfaces,\nin motion.',
  heroBody: 'I build expressive websites and complex digital products.',
  aboutTitle: 'Between design\nand engineering.',
  biography: 'I build digital products, interfaces and interactive websites where motion, typography and interaction are part of the experience.',
  contactTitle: 'Have something\nin mind?',
  capabilities: [
    { _key: 'creative', title: 'Expressive experiences', items: ['Creative development', 'Interaction design', 'Motion'] },
    { _key: 'engineering', title: 'Working systems', items: ['Frontend engineering', 'Web & mobile applications', 'Design systems'] },
  ],
};

export function normalizeSettings(settings: SiteSettings): SiteSettings {
  const correct = (value?: string) => value?.replace(/Kelvin Sukhir Aja/gi, 'Kelvin Sukhiraja');
  const socialLinks = [...(settings.socialLinks || [])];
  for (const link of [
    { _key: 'github', label: 'GitHub', url: 'https://github.com/kelvinsukhiraja' },
    { _key: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/kelvinsukhiraja' },
  ]) {
    const existing = socialLinks.findIndex(item => item.label.toLowerCase() === link.label.toLowerCase());
    if (existing < 0) socialLinks.push(link);
  }
  return { ...settings, name: correct(settings.name) || editorialDefaults.name, seoTitle: correct(settings.seoTitle), copyright: correct(settings.copyright), socialLinks };
}

export function normalizeProject(raw: RawProject): Project {
  const category = raw.category || raw.type || 'Selected project';
  const categories: Record<string, string> = {
    'portfolio': 'Website', 'fullstack portfolio': 'Website',
    'web-app': 'Web application', 'fullstack web-app': 'Web application',
    'mobile': 'Mobile application', 'maintain': 'Product maintenance',
    'e-commerce': 'E-commerce',
  };
  return { ...raw, title: raw.title?.trim() || raw.name?.trim() || 'Untitled project',
    // Existing documents have no slug. Stable IDs preserve links across name edits.
    slug: raw.slug?.trim() || raw._id,
    category: categories[category.toLowerCase()] || category,
    description: raw.description || '', tags: raw.tags || [] };
}

export function featuredProjects(projects: Project[], settings: SiteSettings) {
  if (settings.featuredProjects?.length) {
    return settings.featuredProjects.flatMap(ref => {
      const project = projects.find(p => p._id === ref._id);
      return project ? [project] : [];
    });
  }
  return projects.filter(project => project.featured !== false).slice(0, 3);
}

export function safeExternalUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined; }
  catch { return undefined; }
}
export function projectPath(project: Pick<Project, 'slug'>) { return `/work/${encodeURIComponent(project.slug)}`; }
export function mediaTheme(value?: string): string | undefined { return value && /^#[0-9a-f]{6}$/i.test(value) ? value : undefined; }
export function nextProject(project: Project, projects: Project[]) {
  const related = project.relatedProjects?.map(ref => projects.find(p => p._id === ref._id && p._id !== project._id)).find(Boolean);
  if (related) return related;
  if (projects.length < 2) return undefined;
  return projects[(projects.findIndex(p => p._id === project._id) + 1) % projects.length];
}
