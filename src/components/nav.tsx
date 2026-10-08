import Link from 'next/link';
export function Nav({ name, location, home = false }: { name: string; location: string; home?: boolean }) {
  return <header className="site-header shell">
    <Link href="/" className="wordmark" aria-label={`${name}, homepage`}>{name}</Link>
    <span className="header-location eyebrow">Independent practice / {location.split('/')[0].trim()}</span>
    <nav aria-label="Main navigation"><Link href={home ? '#work' : '/#work'}>Work</Link><Link href={home ? '#about' : '/#about'}>About</Link><Link href="#contact">Contact <span aria-hidden="true">↗︎</span></Link></nav>
  </header>;
}
