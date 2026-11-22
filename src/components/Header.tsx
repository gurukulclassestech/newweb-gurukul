import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Mail, Menu, Phone, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { SafeImage } from './SafeImage';
import type { SiteSettings } from '../types';

export function BrandLogo({ site, className = '' }: { site: SiteSettings; className?: string }) {
  const height = Number(site.logo_height) || 55;
  const width = Number(site.logo_width) || 90;
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    setRatio(null);
    if (!site.logo_url) return;
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = site.logo_url;
  }, [site.logo_url]);

  if (site.logo_url) {
    return (
      <span
        className={`relative block shrink-0 overflow-hidden rounded-lg ${className}`}
        style={{ height, width: ratio ? undefined : width, aspectRatio: ratio ? String(ratio) : undefined }}
      >
        <SafeImage
          src={site.logo_url}
          alt={site.institute_name || 'Logo'}
          fit="contain"
          eager
          className="h-full w-full"
        />
      </span>
    );
  }

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg bg-[#FFBE1B] text-lg font-extrabold text-[#122B5C] ${className}`}
      style={{ width: height, height }}
    >
      {(site.institute_name || 'G').trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function Header() {
  const { site, headerNav } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      {site.announcement_enabled && (
        <div
          className={`transition-all duration-200 ${scrolled ? 'hidden md:block' : 'block'}`}
          style={{
            backgroundColor: site.announcement_bg_color || '#FFBE1B',
            color: site.announcement_text_color || '#122B5C',
          }}
        >
          <div className="shell flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1.5 text-xs font-medium">
            <div className="flex items-center gap-4">
              {site.phone && (
                <a
                  href={`tel:${site.phone}`}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap hover:opacity-80"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="tabular-nums">{site.phone}</span>
                </a>
              )}
              {site.email && (
                <a
                  href={`mailto:${site.email}`}
                  className="hidden items-center gap-1.5 whitespace-nowrap hover:opacity-80 sm:inline-flex"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{site.email}</span>
                </a>
              )}
            </div>
            {site.announcement_text && (
              <p className="w-full truncate text-xs sm:w-auto">{site.announcement_text}</p>
            )}
          </div>
        </div>
      )}

      <div
        className={`transition-shadow ${
          scrolled ? 'shadow-[0_10px_30px_-18px_rgba(11,29,64,0.8)]' : ''
        }`}
        style={{
          backgroundColor: site.header_bg_color || '#122B5C',
          color: site.header_text_color || '#FFFFFF',
        }}
      >
        <div className="shell flex h-16 items-center justify-between gap-6 lg:h-[70px]">
          <Link
            to="/"
            aria-label={site.institute_name}
            className="flex min-w-0 shrink-0 items-center gap-2.5"
          >
            <BrandLogo site={site} />
            {!site.logo_url && (
              <span className="truncate text-[15px] font-bold leading-tight whitespace-nowrap sm:text-base">
                {site.institute_name}
              </span>
            )}
          </Link>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Main navigation">
            {headerNav.map((item) => (
              <NavLink
                key={`${item.path}-${item.id}`}
                to={item.path}
                end={item.path === '/'}
                target={item.open_in_new_tab ? '_blank' : undefined}
                rel={item.open_in_new_tab ? 'noreferrer' : undefined}
                className={({ isActive }) =>
                  `shrink-0 whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors ${
                    isActive ? 'text-[#FFBE1B]' : 'text-white/85 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {site.header_cta_enabled !== false && (
              <Link
                to={site.header_cta_link || '/admission'}
                className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#FFBE1B] px-4 py-2 text-xs font-semibold text-[#122B5C] transition hover:bg-[#f2b211] sm:inline-flex"
              >
                <span>{site.header_cta_label || 'Apply Now'}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="grid h-10 w-10 place-items-center rounded-lg text-white hover:bg-white/10 xl:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-[#0B1D40]/60 backdrop-blur-xs"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-[86vw] max-w-sm flex-col bg-[#0B1D40] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFBE1B]">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-lg text-white/75 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <nav
              className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4"
              aria-label="Mobile navigation"
            >
              {headerNav.map((item) => (
                <NavLink
                  key={`${item.path}-${item.id}`}
                  to={item.path}
                  end={item.path === '/'}
                  target={item.open_in_new_tab ? '_blank' : undefined}
                  rel={item.open_in_new_tab ? 'noreferrer' : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-[15px] font-medium transition ${
                      isActive ? 'bg-white/10 text-[#FFBE1B]' : 'text-white/85 hover:bg-white/5'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="space-y-2 border-t border-white/10 p-4">
              {site.header_cta_enabled !== false && (
                <Link
                  to={site.header_cta_link || '/admission'}
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFBE1B] px-4 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#f2b211]"
                >
                  {site.header_cta_label || 'Apply Now'}
                </Link>
              )}
              {site.phone && (
                <a
                  href={`tel:${site.phone}`}
                  className="flex items-center justify-center gap-2 py-2 text-sm text-white/80 hover:text-white"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span className="tabular-nums">{site.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
