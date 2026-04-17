'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const NAV_PAGES = [
  { label: 'Technical Buyers', href: '/technical-buyers' },
  { label: 'Non-Technical Buyers', href: '/non-technical-buyers' },
  { label: 'Partnerships', href: '/partnerships' },
];

const NAV_EXAMPLES = [
  { label: 'Uber Pitch', href: '/prospects/uber' },
  { label: 'Co-Sell Demos', href: '/partnerships/datadog' },
  { label: 'Stripe Pitch', href: '/roi/stripe' },
];

// The site is now served primarily as a partnerships hub for co-workers
// and teammates. The global nav is concealed (but every non-partnership
// route still works if you link to it directly). Flip this to `true` to
// restore the nav site-wide.
const SHOW_NAV = false;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SHOW_NAV) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!SHOW_NAV) return null;

  const handleHomeClick = (e: React.MouseEvent) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      const launchpad = document.getElementById('launchpad');
      if (launchpad) {
        launchpad.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* Scroll progress */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-px bg-transparent">
        <div
          ref={progressRef}
          className="h-full bg-text-tertiary/40 origin-left transition-none"
          style={{ transform: `scaleX(${scrollProgress})` }}
        />
      </div>

      {/* Navbar */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'py-3 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border'
          : 'py-5 bg-transparent'
      )}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link
            href="/#launchpad"
            onClick={handleHomeClick}
            className="text-text-primary font-medium text-sm tracking-wide shrink-0 hover:text-text-secondary transition-colors"
          >
            Omar Simon
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_PAGES.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3.5 py-1.5 text-[13px] font-medium text-text-tertiary hover:text-text-primary rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="w-px h-4 bg-dark-border mx-2" />
            <span className="text-[10px] font-medium text-text-tertiary/40 uppercase tracking-wider mr-1">Examples</span>
            {NAV_EXAMPLES.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 text-[12px] text-text-tertiary/60 hover:text-text-primary hover:bg-cta-bg rounded-md transition-colors italic"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 w-6 h-6 justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className={cn(
              'w-full h-[1.5px] bg-text-primary transition-all duration-300 origin-center',
              mobileOpen && 'rotate-45 translate-y-[4.5px]'
            )} />
            <span className={cn(
              'w-full h-[1.5px] bg-text-primary transition-all duration-300',
              mobileOpen && 'opacity-0'
            )} />
            <span className={cn(
              'w-full h-[1.5px] bg-text-primary transition-all duration-300 origin-center',
              mobileOpen && '-rotate-45 -translate-y-[4.5px]'
            )} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={cn(
        'fixed inset-0 z-40 bg-dark-bg/95 backdrop-blur-xl transition-all duration-300 lg:hidden',
        mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}>
        <div className="flex flex-col items-center justify-center h-full gap-6">
          {NAV_PAGES.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xl text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="w-12 h-px bg-dark-border my-2" />
          <span className="text-[11px] font-medium text-text-tertiary/40 uppercase tracking-wider">Case Study Examples</span>
          {NAV_EXAMPLES.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="text-base text-text-tertiary/60 hover:text-text-primary transition-colors italic"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
