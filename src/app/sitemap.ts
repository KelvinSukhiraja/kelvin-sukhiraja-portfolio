import type { MetadataRoute } from 'next';
import { getPortfolio } from '@/lib/sanity/client';
import { projectPath } from '@/lib/content';
import { siteUrl } from '@/lib/site-url';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getPortfolio();
  const base = siteUrl;
  return [{ url: base, changeFrequency: 'weekly', priority: 1 }, ...projects.map(p => ({ url: `${base}${projectPath(p)}`, changeFrequency: 'monthly' as const, priority: .7 }))];
}
