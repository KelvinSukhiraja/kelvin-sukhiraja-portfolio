import { createClient } from '@sanity/client';
import { cache } from 'react';
import { PORTFOLIO_QUERY } from './queries';
import { normalizeProject, normalizeSettings } from '../content';
import type { Portfolio, RawProject, SiteSettings } from '../types';

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'mp9gw1i2',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-02-19',
};
const client = createClient({ ...sanityConfig, useCdn: false, perspective: 'published',
  token: process.env.SANITY_API_READ_TOKEN, timeout: 15000 });

export const getPortfolio = cache(async (): Promise<Portfolio> => {
  const data = await client.fetch<{ projects: RawProject[]; settings: SiteSettings | null }>(
    PORTFOLIO_QUERY, {}, { next: { revalidate: 60, tags: ['portfolio'] } },
  );
  return { projects: data.projects.map(normalizeProject), settings: normalizeSettings(data.settings || {}) };
});
