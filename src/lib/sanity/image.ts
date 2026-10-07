import { createImageUrlBuilder } from '@sanity/image-url';
import type { CmsImage } from '../types';
const builder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'mp9gw1i2',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
});
export function imageUrl(image?: CmsImage, width = 1600): string | undefined {
  if (!image?.asset) return undefined;
  try { return builder.image(image).width(width).fit('max').auto('format').quality(85).url(); }
  catch { return image.asset.url; }
}
