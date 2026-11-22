import { useEffect, useMemo, useState } from 'react';
import { Calendar, Search } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { CLASS_LEVELS, DEFAULT_EXAMS } from '../data/defaults';
import { fetchPublished } from '../lib/firestoreApi';
import { usePageSeo } from '../lib/seo';
import {
  CardSkeletonGrid,
  EmptyState,
  ExamCard,
  PageHeroBanner,
} from '../components/CommonUI';
import type { Exam } from '../types';

const INPUT_CLASS =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--brand-navy))] focus:ring-2 focus:ring-[hsl(var(--brand-navy))]/15';

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'open', label: 'Registration open' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
];

export function ExamsPage() {
  const { site } = useSite();
  usePageSeo(
    'exams',
    'Examination announcements',
    "Upcoming test and examination schedules published by Giri Sir's Gurukul Classes."
  );

  const [items, setItems] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPublished<Exam>('exams', 'display_order', 'asc', 100)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const displayItems =
    items.length > 0 || site.customized_modules?.includes('exams') ? items : DEFAULT_EXAMS;

  const categories = useMemo(
    () => [...new Set(displayItems.map((e) => e.course_category).filter(Boolean) as string[])],
    [displayItems]
  );

  const filtered = displayItems.filter((exam) => {
    const q = search.trim().toLowerCase();
    const matchText =
      !q ||
      [exam.title, exam.instructions, exam.syllabus, exam.course_category]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    const matchClass = !classFilter || exam.class_level === classFilter;
    const matchCat = !categoryFilter || exam.course_category === categoryFilter;
    const matchStatus = !statusFilter || exam.status === statusFilter;
    return matchText && matchClass && matchCat && matchStatus;
  });

  return (
    <>
      <PageHeroBanner
        eyebrow="Assessments"
        title="Examination announcements"
        description="Test and examination schedules published by the institute. Instructions and registration details are shared with each announcement."
      />

      <section className="shell py-12 sm:py-16">
        <div className="surface grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              aria-hidden="true"
            />
            <input
              className={`${INPUT_CLASS} pl-9`}
              placeholder="Search exams"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search exams"
            />
          </div>

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

          <select
            className={INPUT_CLASS}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by course"
          >
            <option value="">All courses</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className={INPUT_CLASS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">Any status</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8">
          {loading ? (
            <CardSkeletonGrid count={3} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No exam matches these filters"
              description="Try clearing a filter or searching for a different exam."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
