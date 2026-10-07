import Image from 'next/image';
import type { CmsImage } from '@/lib/types';
import { imageUrl } from '@/lib/sanity/image';

export function ProjectImage({ image, title, priority = false, sizes = '(max-width: 760px) 92vw, 72vw', className = '' }: {
  image?: CmsImage; title: string; priority?: boolean; sizes?: string; className?: string;
}) {
  const src = imageUrl(image);
  if (!src) return <div className={`media-placeholder ${className}`}><span className="eyebrow">Selected project</span><span>{title}</span></div>;
  return <Image className={`project-image ${className}`} src={src} alt={image?.alt || `${title} — project preview`} fill sizes={sizes} priority={priority} />;
}
