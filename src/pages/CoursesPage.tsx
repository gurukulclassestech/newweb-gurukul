import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, Lightbulb, Search, Target } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import {
  DEFAULT_CAMPUS_SECTION,
  DEFAULT_COURSE_CATEGORIES,
  DEFAULT_COURSE_CATEGORY_DESCRIPTIONS,
  DEFAULT_COURSES,
  DEFAULT_SITE_SETTINGS,
} from '../data/defaults';
import { fetchPublished } from '../lib/firestoreApi';
import { usePageSeo } from '../lib/seo';
import { CampusSection } from '../components/CampusSection';
import {
  CardSkeletonGrid,
  CourseCard,
  EmptyState,
  PageHeroBanner,
} from '../components/CommonUI';
import type { Course } from '../types';

const INPUT_CLASS =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--brand-navy))] focus:ring-2 focus:ring-[hsl(var(--brand-navy))]/15';

const STEP_ICONS = [BookOpen, Lightbulb, Target, Award];

function CategorySection({
  title,
  blurb,
  courses,
  index,
}: {
  title: string;
  blurb?: string;
  courses: Course[];
  index: number;
}) {
  return (
    <section className="mt-14 first:mt-0">
      <header className="relative overflow-hidden rounded-2xl border border-[hsl(var(--brand-navy))]/12 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[hsl(var(--brand-navy))] text-base font-bold text-[#FFBE1B] tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <p className="eyebrow">Programme category</p>
            <h2 className="display-face mt-1.5 text-2xl leading-tight text-[hsl(var(--brand-navy))] sm:text-[2rem]">
              {title}
            </h2>
            {blurb && (
              <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {blurb}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}

export function CoursesPage() {
  const { site, sections } = useSite();

  const coursesEyebrow = site.courses_eyebrow || DEFAULT_SITE_SETTINGS.courses_eyebrow;
  const coursesTitle = site.courses_title || DEFAULT_SITE_SETTINGS.courses_title;
  const coursesDesc = site.courses_description || DEFAULT_SITE_SETTINGS.courses_description;
  const coursesBadge = site.courses_badge || DEFAULT_SITE_SETTINGS.courses_badge;

  const approachEyebrow =
    site.courses_approach_eyebrow || DEFAULT_SITE_SETTINGS.courses_approach_eyebrow;
  const approachTitle =
    site.courses_approach_title || DEFAULT_SITE_SETTINGS.courses_approach_title;
  const approachDesc =
    site.courses_approach_description || DEFAULT_SITE_SETTINGS.courses_approach_description;
  const approachSteps =
    Array.isArray(site.courses_approach_steps) && site.courses_approach_steps.length > 0
      ? site.courses_approach_steps
      : DEFAULT_SITE_SETTINGS.courses_approach_steps;

  usePageSeo(
    'courses',
    'Courses',
    'IIT-JEE and NEET two-year integrated programmes and foundation programmes for Classes VIII to XII.'
  );

  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    fetchPublished<Course>('courses', 'display_order', 'asc', 100)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const coursesCustomized = Boolean(site.customized_modules?.includes('courses'));
  const displayItems = items.length > 0 || coursesCustomized ? items : DEFAULT_COURSES;

  const blurbMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const def of DEFAULT_COURSE_CATEGORY_DESCRIPTIONS) {
      map.set(def.category, def.description);
    }
    if (Array.isArray(site.courses_category_descriptions)) {
      for (const entry of site.courses_category_descriptions) {
        if (entry?.category) {
          map.set(entry.category, entry.description || '');
        }
      }
    }
    return map;
  }, [site.courses_category_descriptions]);

  const categories = useMemo(
    () => [...new Set(displayItems.map((c) => c.category).filter(Boolean))],
    [displayItems]
  );

  const classOptions = useMemo(
    () => [...new Set(displayItems.map((c) => c.class_level).filter(Boolean))],
    [displayItems]
  );

  const filtered = displayItems.filter((course) => {
    const q = search.trim().toLowerCase();
    const matchText =
      !q ||
      [course.name, course.description, course.subjects, course.category, course.target_exams]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    const matchCat = !categoryFilter || course.category === categoryFilter;
    const matchClass = !classFilter || String(course.class_level || '').includes(classFilter);
    return matchText && matchCat && matchClass;
  });

  const grouped = useMemo(() => {
    const map = new Map<string, Course[]>();
    for (const c of filtered) {
      const cat = c.category || 'Other programmes';
      const arr = map.get(cat) || [];
      arr.push(c);
      map.set(cat, arr);
    }
    return [...map.entries()]
      .sort(([a], [b]) => {
        const ia = DEFAULT_COURSE_CATEGORIES.indexOf(a);
        const ib = DEFAULT_COURSE_CATEGORIES.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })
      .map(([catTitle, groupCourses]) => ({
        title: catTitle,
        courses: groupCourses,
        blurb: blurbMap.get(catTitle),
      }));
  }, [filtered, blurbMap]);

  const hpCustomized = Boolean(site.customized_modules?.includes('homepage_sections'));
  const campusSection =
    sections.find((s) => s.key === 'campus') ||
    (hpCustomized ? undefined : DEFAULT_CAMPUS_SECTION);

  return (
    <>
      <PageHeroBanner eyebrow={coursesEyebrow} title={coursesTitle} description={coursesDesc}>
        {coursesBadge && <p className="text-sm font-semibold text-[#FFBE1B]">{coursesBadge}</p>}
      </PageHeroBanner>

      <section className="shell py-12 sm:py-16">
        <div className="surface grid gap-3 p-4 sm:grid-cols-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              aria-hidden="true"
            />
            <input
              className={`${INPUT_CLASS} pl-9`}
              placeholder="Search courses"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search courses"
            />
          </div>

          <select
            className={INPUT_CLASS}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by programme"
          >
            <option value="">All programmes</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
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
            {classOptions.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-10">
          {loading ? (
            <CardSkeletonGrid count={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={
                displayItems.length === 0
                  ? 'No courses published yet'
                  : 'No course matches these filters'
              }
              description={
                displayItems.length === 0
                  ? 'The institute has not published any courses yet. Please contact the office for the current programme list.'
                  : 'Try a different class, programme or search term.'
              }
            >
              <Link
                to="/admission"
                className="inline-flex items-center rounded-lg bg-[#FFBE1B] px-4 py-2 text-sm font-semibold text-[#122B5C] hover:bg-[#f2b211]"
              >
                Enquire for admission
              </Link>
            </EmptyState>
          ) : (
            grouped.map((grp, idx) => (
              <CategorySection
                key={grp.title}
                title={grp.title}
                blurb={grp.blurb}
                courses={grp.courses}
                index={idx}
              />
            ))
          )}
        </div>
      </section>

      {/* Campus & Student Facilities */}
      {campusSection && campusSection.is_visible !== false && (
        <CampusSection section={campusSection} />
      )}

      {/* Learn · Understand · Practise · Excel Approach */}
      {approachSteps.length > 0 && (
        <section className="shell py-12 sm:py-16">
          <div className="overflow-hidden rounded-2xl bg-[hsl(var(--brand-navy-deep))] p-6 text-white sm:p-10">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFBE1B]">
                {approachEyebrow}
              </p>
              <h2 className="display-face mt-2 text-2xl sm:text-[2.1rem]">{approachTitle}</h2>
              {approachDesc && (
                <p className="mt-3 text-sm leading-relaxed text-white/75">{approachDesc}</p>
              )}
            </div>

            <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {approachSteps.map((step, idx) => {
                const StepIcon = STEP_ICONS[idx % STEP_ICONS.length];
                return (
                  <li
                    key={`${step.title}-${idx}`}
                    className="rounded-xl border border-white/15 bg-white/5 p-5 transition hover:border-[#FFBE1B]/60 hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#FFBE1B] text-[hsl(var(--brand-navy))]">
                        <StepIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-[11px] font-bold tracking-[0.18em] text-white/40 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="mt-3 text-base font-bold text-white">{step.title}</p>
                    {step.description && (
                      <p className="mt-1 text-xs leading-relaxed text-white/70">
                        {step.description}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}
    </>
  );
}
