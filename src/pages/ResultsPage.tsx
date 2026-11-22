import { useEffect, useMemo, useState } from 'react';
import { Award, ExternalLink, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { DEFAULT_RESULTS } from '../data/defaults';
import { fetchPublished } from '../lib/firestoreApi';
import { usePageSeo } from '../lib/seo';
import { CardSkeletonGrid, EmptyState, PageHeroBanner } from '../components/CommonUI';
import { SafeImage } from '../components/SafeImage';
import type { StudentResult } from '../types';

export function ResultsPage() {
  const { site } = useSite();
  usePageSeo(
    'results',
    'Results and achievements',
    "Verified student results and academic achievements published by Giri Sir's Gurukul Classes."
  );

  const [items, setItems] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('');
  const [activePoster, setActivePoster] = useState<StudentResult | null>(null);

  useEffect(() => {
    fetchPublished<StudentResult>('results', 'display_order', 'asc', 100)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const isCustomized = site.customized_modules?.includes('results');
  const displayItems = isCustomized ? items : items.length > 0 ? items : DEFAULT_RESULTS;

  const years = useMemo(
    () => [...new Set(displayItems.map((r) => r.academic_year).filter(Boolean))].sort().reverse(),
    [displayItems]
  );

  const filtered = yearFilter
    ? displayItems.filter((r) => r.academic_year === yearFilter)
    : displayItems;

  return (
    <>
      <PageHeroBanner
        eyebrow="Achievements"
        title="Results and academic achievements"
        description="Every record on this page is entered and verified by the institute, and published only with the student's consent."
      />

      <section className="shell py-12 sm:py-16">
        {years.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Academic year
            </span>
            <button
              type="button"
              onClick={() => setYearFilter('')}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                yearFilter === ''
                  ? 'border-[hsl(var(--brand-navy))] bg-[hsl(var(--brand-navy))] text-white'
                  : 'border-[hsl(var(--border))] bg-white text-[hsl(var(--foreground))]'
              }`}
            >
              All
            </button>
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setYearFilter(year)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold tabular-nums transition ${
                  yearFilter === year
                    ? 'border-[hsl(var(--brand-navy))] bg-[hsl(var(--brand-navy))] text-white'
                    : 'border-[hsl(var(--border))] bg-white text-[hsl(var(--foreground))]'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <CardSkeletonGrid count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No results published yet"
            description="The institute publishes a result only after verification and written consent from the student's family."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((res) => (
              <article
                key={res.id}
                className={`surface surface-hover flex flex-col overflow-hidden ${
                  res.is_featured ? 'ring-1 ring-[#FFBE1B]' : ''
                }`}
              >
                {res.photo_url ? (
                  <button
                    type="button"
                    onClick={() => setActivePoster(res)}
                    className="block h-56 w-full overflow-hidden bg-[hsl(var(--brand-surface))] text-left"
                    aria-label={`View achievement poster for ${res.student_name}`}
                  >
                    <SafeImage
                      src={res.photo_url}
                      alt={res.student_name}
                      className="h-full w-full transition-transform duration-500 hover:scale-[1.03]"
                    />
                  </button>
                ) : null}

                <div className="flex items-start gap-4 p-5">
                  {!res.photo_url && (
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[hsl(var(--brand-navy))] text-lg font-bold text-[#FFBE1B]">
                      {(res.student_name || 'S').trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="truncate text-base font-bold text-[hsl(var(--brand-navy))]">
                        {res.student_name}
                      </h2>
                      {res.is_featured && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-[#B45309]">
                          <Award className="h-3 w-3" aria-hidden="true" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-snug text-[hsl(var(--muted-foreground))]">
                      {res.achievement_title}
                    </p>
                  </div>
                </div>

                <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-[hsl(var(--border))] px-5 py-3 text-center tabular-nums">
                  <div>
                    <dt className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      Score
                    </dt>
                    <dd className="text-sm font-bold text-[hsl(var(--brand-navy))]">{res.score}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      Class
                    </dt>
                    <dd className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {res.class_level || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      Year
                    </dt>
                    <dd className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {res.academic_year || '—'}
                    </dd>
                  </div>
                </dl>

                {res.document_url && (
                  <div className="border-t border-[hsl(var(--border))] px-5 py-3">
                    <a
                      href={res.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--brand-blue))] hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>View result document</span>
                    </a>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {activePoster && activePoster.photo_url && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePoster.student_name}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/80 p-4"
          onClick={() => setActivePoster(null)}
        >
          <div
            className="surface relative w-full max-w-2xl p-3 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePoster(null)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#122B5C] shadow"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <SafeImage
              src={activePoster.photo_url}
              alt={activePoster.student_name}
              fit="contain"
              className="max-h-[75vh] w-full rounded-lg bg-[hsl(var(--brand-surface))]"
            />
            <p className="mt-2.5 px-1 text-sm font-semibold text-[hsl(var(--brand-navy))]">
              {activePoster.student_name} — {activePoster.score} ({activePoster.achievement_title})
            </p>
          </div>
        </div>
      )}
    </>
  );
}
