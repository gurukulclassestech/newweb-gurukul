import { useEffect, useMemo, useState } from 'react';
import { Search, Video, X } from 'lucide-react';
import { CLASS_LEVELS } from '../data/defaults';
import { fetchPublished } from '../lib/firestoreApi';
import { usePageSeo } from '../lib/seo';
import {
  CardSkeletonGrid,
  EmptyState,
  LectureCard,
  PageHeroBanner,
} from '../components/CommonUI';
import type { Lecture } from '../types';

const INPUT_CLASS =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--brand-navy))] focus:ring-2 focus:ring-[hsl(var(--brand-navy))]/15';

function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith('/embed/')) return url;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace('/', '');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function LecturesPage() {
  usePageSeo(
    'lectures',
    'Video lectures',
    'Recorded explanations and subject revision lectures from Giri Sir\'s Gurukul Classes.'
  );

  const [items, setItems] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);

  useEffect(() => {
    fetchPublished<Lecture>('lectures', 'display_order', 'asc', 100)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(
    () => [...new Set(items.map((l) => l.subject).filter(Boolean))],
    [items]
  );

  const filtered = items.filter((lec) => {
    const q = search.trim().toLowerCase();
    const matchText =
      !q ||
      [lec.title, lec.subject, lec.teacher_name, lec.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    const matchSub = !subjectFilter || lec.subject === subjectFilter;
    const matchClass = !classFilter || lec.class_level === classFilter;
    return matchText && matchSub && matchClass;
  });

  return (
    <>
      <PageHeroBanner
        eyebrow="Video library"
        title="Recorded lectures"
        description="Revision explanations recorded by our subject faculty so students can review key concepts at home."
      />

      <section className="shell py-12 sm:py-16">
        <div className="surface grid gap-3 p-4 sm:grid-cols-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              aria-hidden="true"
            />
            <input
              className={`${INPUT_CLASS} pl-9`}
              placeholder="Search title or topic"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search lectures"
            />
          </div>

          <select
            className={INPUT_CLASS}
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Filter by subject"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className={INPUT_CLASS}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            aria-label="Filter by class"
          >
            <option value="">All classes</option>
            {CLASS_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8">
          {loading ? (
            <CardSkeletonGrid count={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Video}
              title={items.length === 0 ? 'No published lectures yet' : 'No lecture matches these filters'}
              description={
                items.length === 0
                  ? 'Recorded lectures will appear here once the faculty publishes them. Until then, please attend the scheduled classes at the institute.'
                  : 'Try a different subject, class or search term.'
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} onPlay={setActiveLecture} />
              ))}
            </div>
          )}
        </div>
      </section>

      {activeLecture && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeLecture.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/75 p-4"
        >
          <div className="surface relative w-full max-w-3xl overflow-hidden p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">
                  {activeLecture.subject} · {activeLecture.class_level}
                </p>
                <h2 className="mt-1 text-lg font-bold text-[hsl(var(--brand-navy))]">
                  {activeLecture.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveLecture(null)}
                aria-label="Close lecture"
                className="grid h-9 w-9 place-items-center rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--brand-surface))]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-black">
              {toEmbedUrl(activeLecture.video_url) ? (
                <iframe
                  src={toEmbedUrl(activeLecture.video_url) || ''}
                  title={activeLecture.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={activeLecture.video_url} controls className="h-full w-full" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
