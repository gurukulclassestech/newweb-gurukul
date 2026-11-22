import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { limit, where } from 'firebase/firestore';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  IndianRupee,
  Target,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { DEFAULT_COURSES, SITE_IMAGES } from '../data/defaults';
import { fetchCollection, fetchPublicDocById } from '../lib/firestoreApi';
import { usePageSeo } from '../lib/seo';
import { EmptyState, PageHeroBanner } from '../components/CommonUI';
import { EnquiryForm } from '../components/EnquiryForm';
import { SafeImage } from '../components/SafeImage';
import type { Course } from '../types';

function splitLines(raw?: string): string[] {
  return String(raw || '')
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Admissions open',
  closing_soon: 'Closing soon',
  closed: 'Admissions closed',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  open: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  closing_soon: 'border-amber-200 bg-amber-50 text-amber-800',
  closed: 'border-slate-200 bg-slate-100 text-slate-600',
};

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { site } = useSite();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  usePageSeo('courses', course?.name || 'Course details', course?.description);

  const coursesCustomized = Boolean(site.customized_modules?.includes('courses'));

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);

    (async () => {
      try {
        const byId = await fetchPublicDocById<Course>('courses', id).catch(() => null);
        if (byId && byId.is_published !== false) {
          if (active) setCourse(byId);
          return;
        }
        const bySlug = await fetchCollection<Course>('courses', [
          where('is_published', '==', true),
          where('slug', '==', id),
          limit(1),
        ]).catch(() => []);
        if (bySlug.length > 0) {
          if (active) setCourse(bySlug[0]);
          return;
        }
        const fallback = !coursesCustomized
          ? DEFAULT_COURSES.find((c) => c.id === id || c.slug === id) || null
          : null;
        if (active) setCourse(fallback);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, coursesCustomized]);

  if (loading) {
    return (
      <div className="shell py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--brand-surface))] border-t-[hsl(var(--brand-navy))]" />
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Loading course details…</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="shell py-20">
        <EmptyState
          icon={BookOpen}
          title="Course not found"
          description="This course may have been unpublished or removed."
        >
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--brand-navy))] px-4 py-2 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to courses</span>
          </Link>
        </EmptyState>
      </div>
    );
  }

  const meta = [
    { icon: GraduationCap, label: 'Starting class', value: course.class_level },
    { icon: Clock, label: 'Course duration', value: course.duration },
    { icon: Target, label: 'Target examinations', value: course.target_exams },
    { icon: BookOpen, label: 'Subjects covered', value: course.subjects },
    { icon: Calendar, label: 'Batches', value: course.batch_info },
    { icon: IndianRupee, label: 'Fee', value: course.fee },
  ].filter((m) => Boolean(m.value));

  const sectionsList = [
    { title: 'Key Highlights', lines: splitLines(course.highlights) },
    { title: 'Eligibility', lines: splitLines(course.eligibility) },
    { title: 'Teaching Methodology', lines: splitLines(course.methodology) },
    { title: 'Examination Preparation', lines: splitLines(course.exam_preparation) },
  ].filter((s) => s.lines.length > 0);

  const statusKey = course.admission_status || 'open';

  return (
    <>
      <PageHeroBanner
        eyebrow={course.category || 'Course'}
        title={course.name}
        description={course.description}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>All courses</span>
          </Link>
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              STATUS_BADGE_CLASSES[statusKey] || STATUS_BADGE_CLASSES.open
            }`}
          >
            {STATUS_LABELS[statusKey] || STATUS_LABELS.open}
          </span>
        </div>
      </PageHeroBanner>

      <section className="shell grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-8">
          <div className="h-[260px] overflow-hidden rounded-2xl bg-[hsl(var(--brand-surface))] sm:h-[380px]">
            <SafeImage
              src={course.image_url || SITE_IMAGES.classroom}
              alt={course.name}
              className="h-full w-full"
            />
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            {meta.map(({ icon: Icon, label, value }) => (
              <div key={label} className="surface p-4">
                <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  <Icon className="h-3.5 w-3.5 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
                  <span>{label}</span>
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[hsl(var(--brand-navy))]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div>
            <h2 className="display-face text-2xl text-[hsl(var(--brand-navy))]">
              About this programme
            </h2>
            <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
              {String(course.description || '')
                .split('\n')
                .filter(Boolean)
                .map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
            </div>
          </div>

          {sectionsList.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              {sectionsList.map((block) => (
                <div key={block.title} className="surface p-5 sm:p-6">
                  <h3 className="text-base font-bold text-[hsl(var(--brand-navy))]">
                    {block.title}
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {block.lines.map((line, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand-blue))]"
                          aria-hidden="true"
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="surface overflow-hidden">
            <div className="bg-[hsl(var(--brand-navy))] px-6 py-5 text-white">
              <p className="eyebrow text-[#FFBE1B]">Admission / Enquiry</p>
              <h2 className="mt-1.5 text-xl font-bold">Enquire for {course.name}</h2>
              <p className="mt-1 text-xs leading-relaxed text-white/75">
                Share your details and our admissions team will confirm batch timings and seat availability.
              </p>
            </div>
            <div className="p-6">
              <EnquiryForm
                source={`course:${course.slug || course.id}`}
                defaultCourse={course.name}
                submitLabel="Submit enquiry"
                compact
              />
            </div>
          </div>

          <div className="surface flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Ready to apply?
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[hsl(var(--brand-navy))]">
                Complete full admission form
              </p>
            </div>
            <Link
              to={`/admission?course=${encodeURIComponent(course.name)}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFBE1B] px-3.5 py-2 text-xs font-bold text-[#122B5C] hover:bg-[#f2b211]"
            >
              <span>Apply</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
