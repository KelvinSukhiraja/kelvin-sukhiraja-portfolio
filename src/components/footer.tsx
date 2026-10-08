import { editorialDefaults, safeExternalUrl } from '@/lib/content';
import type { SiteSettings } from '@/lib/types';

export function Footer({ settings }: { settings: SiteSettings }) {
  const lines = (settings.contactTitle || editorialDefaults.contactTitle).split('\n');
  const email = settings.email?.trim();
  return <footer id="contact" className="contact shell">
    <div className="section-kicker eyebrow"><span>03 / A new conversation</span><a href="#top">Back to top ↑</a></div>
    <h2 className="contact-title display" data-reveal><span>{lines[0]}</span><em>{lines.slice(1).join(' ')}</em></h2>
    {email && <a className="contact-action" href={`mailto:${email}`}>Let’s build it <span aria-hidden="true">↗︎</span></a>}
    <div className="footer-links eyebrow">
      {email ? <a href={`mailto:${email}`}>Email ↗︎<span className="email-detail">{email}</span></a> : <span>{settings.name || editorialDefaults.name}</span>}
      <div><a href="/documents/Kelvin-Sukhiraja-CV-2026.pdf" download>Download CV (PDF) ↓︎</a>{settings.socialLinks?.map(link => { const href = safeExternalUrl(link.url); return href ? <a key={link._key} href={href} target="_blank" rel="noopener noreferrer">{link.label} ↗︎</a> : null; })}</div>
    </div>
    <div className="footer-colophon eyebrow"><span>{settings.copyright || `© ${new Date().getFullYear()} ${settings.name || editorialDefaults.name}`}</span><span>{settings.location || editorialDefaults.location}</span></div>
  </footer>;
}
