import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_SITE_SETTINGS,
  SITE_IMAGES,
} from '../data/defaults';
import { usePageSeo } from '../lib/seo';
import { PageHeroBanner, RichInlineText, SectionHeader } from '../components/CommonUI';
import { SafeImage } from '../components/SafeImage';

export function AboutPage() {
  const { site, sections } = useSite();
  usePageSeo(
    'about',
    'About us',
    site.about_intro ||
      `About ${site.institute_name} — teaching approach, small batches and academic discipline.`
  );

  const hpCustomized = Boolean(site.customized_modules?.includes('homepage_sections'));

  const intro =
    sections.find((s) => s.key === 'intro') ||
    (hpCustomized ? undefined : DEFAULT_HOMEPAGE_SECTIONS.find((s) => s.key === 'intro'));
  const features =
    sections.find((s) => s.key === 'features') ||
    (hpCustomized ? undefined : DEFAULT_HOMEPAGE_SECTIONS.find((s) => s.key === 'features'));

  const storyText = (site.about_story ?? DEFAULT_SITE_SETTINGS.about_story ?? '').trim();
  const storyBlocks = storyText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const highlights = Array.isArray(site.about_highlights)
    ? site.about_highlights
    : DEFAULT_SITE_SETTINGS.about_highlights;

  const mission = site.about_mission ?? DEFAULT_SITE_SETTINGS.about_mission;

  return (
    <>
      <PageHeroBanner
        eyebrow="About us"
        title={site.about_heading || DEFAULT_SITE_SETTINGS.about_heading}
        description={site.about_intro || DEFAULT_SITE_SETTINGS.about_intro}
      />

      {/* Highlights strip */}
      {highlights.length > 0 && (
        <section className="shell -mt-6 relative z-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h, idx) => (
              <div
                key={`${h.label}-${idx}`}
                className="surface border-t-2 border-t-[#FFBE1B] p-5 text-center shadow-sm"
              >
                <p className="display-face text-2xl text-[hsl(var(--brand-navy))] sm:text-[1.75rem]">
                  {h.value}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  {h.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Story & Image */}
      <section className="shell grid items-start gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="eyebrow">Our story &amp; philosophy</p>
          <h2 className="display-face mt-3 text-[1.8rem] leading-tight text-[hsl(var(--brand-navy))] sm:text-4xl">
            {intro?.title || "Study with Enjoyment — Since 2009"}
          </h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
            {storyBlocks.map((block, idx) => {
              if (block.startsWith('**') && block.endsWith('**') && !block.slice(2, -2).includes('**')) {
                return (
                  <h3
                    key={idx}
                    className="pt-2 text-lg font-bold text-[hsl(var(--brand-navy))]"
                  >
                    {block.slice(2, -2)}
                  </h3>
                );
              }
              return (
                <p key={idx}>
                  <RichInlineText text={block} />
                </p>
              );
            })}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/admission"
              className="inline-flex items-center gap-2 rounded-lg bg-[#FFBE1B] px-5 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#f2b211]"
            >
              <span>Apply for admission</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center rounded-lg border border-[hsl(var(--brand-navy))]/25 px-5 py-2.5 text-sm font-semibold text-[hsl(var(--brand-navy))] transition hover:bg-[hsl(var(--brand-surface))]"
            >
              View courses
            </Link>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="h-[300px] overflow-hidden rounded-2xl sm:h-[400px]">
            <SafeImage
              src={intro?.image_url || SITE_IMAGES.mentoring}
              alt={intro?.title || 'Institute teaching'}
              className="h-full w-full"
            />
          </div>
          <div className="surface p-5">
            <p className="eyebrow">Academic discipline</p>
            <p className="mt-1.5 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              {site.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* Dark Navy Mission Band */}
      {mission && (
        <section className="bg-[hsl(var(--brand-navy-deep))] py-14 text-white sm:py-16">
          <div className="shell max-w-4xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#FFBE1B]">
              Study with Enjoyment · Success with Excellence
            </p>
            <blockquote className="display-face mt-4 text-2xl leading-snug text-white sm:text-4xl">
              “{mission}”
            </blockquote>
            <div className="gold-rule mx-auto mt-6 max-w-xs" />
          </div>
        </section>
      )}

      {/* How we teach */}
      {features?.items && features.items.length > 0 && (
        <section className="bg-[hsl(var(--brand-surface))] py-14 sm:py-20">
          <div className="shell">
            <SectionHeader
              align="center"
              eyebrow="How we teach"
              title={features.title}
              subtitle={features.subtitle}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.items.map((item, idx) => (
                <div key={idx} className="surface h-full p-6">
                  <CheckCircle2 className="h-5 w-5 text-[#0785D1]" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-bold text-[hsl(var(--brand-navy))]">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Visit the institute CTA */}
      <section className="shell py-14 sm:py-20">
        <div className="surface flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="eyebrow">Visit the institute</p>
            <h2 className="display-face mt-2 text-2xl text-[hsl(var(--brand-navy))] sm:text-3xl">
              Meet our teachers and review the batch plan
            </h2>
            <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
              {site.address} · {site.office_hours}
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[hsl(var(--brand-navy))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <span>Contact us</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
