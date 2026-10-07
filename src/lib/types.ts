import type { PortableTextBlock } from '@portabletext/types';

export interface CmsImage {
  asset?: { _ref?: string; _id?: string; url?: string };
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number; width: number; height: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}
export interface Chapter {
  _key: string;
  title: string;
  body?: PortableTextBlock[];
  image?: CmsImage;
}
export interface RawProject {
  _id: string; name?: string; title?: string; slug?: string | null;
  year?: string; category?: string; type?: string; description?: string; details?: string;
  image?: CmsImage; heroImage?: CmsImage; gallery?: CmsImage[];
  href?: string; githubUrl?: string; tags?: string[]; role?: string; client?: string;
  featured?: boolean; order?: number; presentation?: string; theme?: string;
  videoUrl?: string; chapters?: Chapter[]; relatedProjects?: { _id: string }[];
}
export interface Project extends RawProject {
  title: string; slug: string; category: string; description: string; tags: string[];
}
export interface SiteSettings {
  name?: string; location?: string; heroEyebrow?: string; heroTitle?: string; heroBody?: string;
  heroImage?: CmsImage; biography?: string; aboutTitle?: string; email?: string; copyright?: string;
  availability?: string; seoTitle?: string; seoDescription?: string; contactTitle?: string;
  socialLinks?: { _key: string; label: string; url: string }[];
  capabilities?: { _key: string; title: string; items: string[] }[];
  technologies?: string[]; featuredProjects?: { _id: string }[];
}
export interface Portfolio { projects: Project[]; settings: SiteSettings }
