import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { siteUrl } from '@/lib/site-url';
import './globals.css';

const sans = localFont({ src: [
  { path: '../../public/fonts/manrope-light.ttf', weight: '300', style: 'normal' },
  { path: '../../public/fonts/manrope-regular.ttf', weight: '400', style: 'normal' },
], variable: '--font-sans', display: 'swap' });
const serif = localFont({ src: [
  { path: '../../public/fonts/cormorant-regular.ttf', weight: '400', style: 'normal' },
  { path: '../../public/fonts/cormorant-italic.ttf', weight: '400', style: 'italic' },
], variable: '--font-serif', display: 'swap' });
const blackletter = localFont({ src: '../../public/fonts/pirata-one.ttf', variable: '--font-blackletter', display: 'swap', preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: process.env.VERCEL_ENV === 'preview' ? { index: false, follow: false } : undefined,
  title: { default: 'Kelvin Sukhiraja — Creative Developer', template: '%s — Kelvin Sukhiraja' },
  description: 'Frontend engineering, expressive websites and digital products. Independent creative developer based in Jakarta.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${sans.variable} ${serif.variable} ${blackletter.variable}`}><body id="top"><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}

