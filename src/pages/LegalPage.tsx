import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { usePageSeo } from '../lib/seo';

export function LegalPage({
  pageKey,
  title,
  field,
}: {
  pageKey: 'privacy' | 'terms';
  title: string;
  field: 'privacy_content' | 'terms_content';
}) {
  const { site } = useSite();
  usePageSeo(pageKey, title, `${title} for ${site.institute_name}.`);

  const paragraphs = String(site[field] || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="shell max-w-3xl py-14 sm:py-20">
      <p className="eyebrow">Legal</p>
      <h1 className="display-face mt-3 text-[2rem] leading-tight text-[hsl(var(--brand-navy))] sm:text-[2.6rem]">
        {title}
      </h1>
      <div className="prose-site mt-8">
        {paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
      <div className="mt-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))] p-5 text-sm">
        <p className="font-semibold text-[hsl(var(--brand-navy))]">{site.institute_name}</p>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">{site.address}</p>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          {site.phone} · {site.email}
        </p>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  usePageSeo('not-found', 'Page not found', 'The requested page could not be found.');

  return (
    <div className="shell py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display-face mt-3 text-3xl text-[hsl(var(--brand-navy))] sm:text-4xl">
        Page not found
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-[hsl(var(--muted-foreground))]">
        The page you requested may have moved or is no longer available.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--brand-navy))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Return to homepage</span>
      </Link>
    </div>
  );
}
