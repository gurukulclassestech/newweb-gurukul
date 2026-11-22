import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  GraduationCap,
  Info,
  Play,
  Star,
  Target,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { SafeImage } from './SafeImage';
import { EnquiryForm } from './EnquiryForm';
import { SITE_IMAGES } from '../data/defaults';
import type {
  BlogPost,
  Course,
  Exam,
  FacultyMember,
  GalleryMedia,
  Lecture,
  Testimonial,
} from '../types';

export function formatDate(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime24to12(value?: string): string {
  if (!value) return '';
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return value;
  const h = Number(m[1]);
  const mins = m[2];
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mins} ${suffix}`;
}

export function truncateText(text?: string, max = 120): string {
  if (!text) return '';
  const clean = text
    .replace(/[#*_>`]/g, ' ')
    .replace(/(^|\n)\s*-\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export function RichInlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={idx} className="font-semibold text-[hsl(var(--brand-navy))]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </>
  );
}

export function PageHeroBanner({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--brand-navy))] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, #FFBE1B 0, transparent 42%), radial-gradient(circle at 85% 80%, #0785D1 0, transparent 45%)',
        }}
        aria-hidden="true"
      />
      <div className="shell relative py-12 sm:py-16">
        <div className="rise-in max-w-3xl">
          {eyebrow && <p className="eyebrow text-[#FFBE1B]">{eyebrow}</p>}
          <h1 className="display-face mt-3 text-[2rem] leading-[1.1] sm:text-[2.75rem] lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80 sm:text-base">
              {description}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
      <div className="gold-rule" />
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center';
}) {
  if (align === 'center') {
    return (
      <div className="mx-auto max-w-2xl text-center">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="display-face mt-2.5 text-[1.85rem] leading-tight text-[hsl(var(--brand-navy))] sm:text-[2.4rem]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2.5 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="display-face mt-2.5 text-[1.85rem] leading-tight text-[hsl(var(--brand-navy))] sm:text-[2.4rem]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2.5 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="surface overflow-hidden p-5">
          <div className="h-36 animate-pulse rounded-lg bg-[hsl(var(--brand-surface))]" />
          <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-[hsl(var(--brand-surface))]" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[hsl(var(--brand-surface))]" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-[hsl(var(--brand-surface))] text-[hsl(var(--brand-navy))]">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-[hsl(var(--brand-navy))]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

const ADMISSION_BADGE_CLASS: Record<string, string> = {
  open: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  closing_soon: 'border-amber-200 bg-amber-50 text-amber-800',
  closed: 'border-slate-200 bg-slate-100 text-slate-600',
};

const ADMISSION_BADGE_LABEL: Record<string, string> = {
  open: 'Admissions open',
  closing_soon: 'Closing soon',
  closed: 'Admissions closed',
};

export function CourseEnquiryButton({
  courseName,
  label = 'Enquire Now',
}: {
  courseName: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#FFBE1B] px-4 py-2.5 text-[13px] font-bold text-[#122B5C] transition hover:bg-[#f2b211]"
      >
        {label}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Enquire about ${courseName}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/65 p-4 backdrop-blur-xs"
          onClick={() => setOpen(false)}
        >
          <div
            className="surface max-h-[90vh] w-full max-w-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-[hsl(var(--brand-navy))] px-6 py-5 text-white">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="eyebrow text-[#FFBE1B]">Enquire about this course</p>
              <h2 className="mt-1.5 pr-8 text-lg font-bold">{courseName}</h2>
              <p className="mt-1 text-xs leading-relaxed text-white/75">
                Share a few details and our admissions team will call you with batch timings and the fee structure.
              </p>
            </div>
            <div className="p-6">
              <EnquiryForm
                source={`course-enquiry:${courseName}`}
                defaultCourse={courseName}
                submitLabel="Submit enquiry"
                compact
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CourseMetaPill({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--brand-navy))]/12 bg-[hsl(var(--brand-surface))] px-2.5 py-1 text-[11.5px] font-semibold text-[hsl(var(--brand-navy))]">
      <Icon className="h-3.5 w-3.5 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
}

export function CourseCard({ course }: { course: Course }) {
  const detailPath = `/courses/${course.slug || course.id}`;
  const statusKey = course.admission_status || 'open';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white shadow-[0_1px_2px_rgba(18,43,92,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[hsl(var(--brand-navy))]/25 hover:shadow-[0_26px_60px_-34px_rgba(18,43,92,0.6)]">
      <Link to={detailPath} className="relative block h-48 overflow-hidden">
        <SafeImage
          src={course.image_url || SITE_IMAGES.classroom}
          alt={course.name}
          className="h-48 w-full transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--brand-navy-deep))] via-[hsl(var(--brand-navy-deep))]/45 to-transparent"
          aria-hidden="true"
        />
        <span
          className={`absolute left-4 top-4 rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
            ADMISSION_BADGE_CLASS[statusKey] || ADMISSION_BADGE_CLASS.open
          }`}
        >
          {ADMISSION_BADGE_LABEL[statusKey] || ADMISSION_BADGE_LABEL.open}
        </span>
        <div className="absolute inset-x-4 bottom-3">
          {course.category && (
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFBE1B]">
              {course.category}
            </p>
          )}
          <h3 className="mt-1 text-[1.05rem] font-bold leading-snug text-white">
            {course.name}
          </h3>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          {course.class_level && (
            <CourseMetaPill icon={GraduationCap}>{course.class_level}</CourseMetaPill>
          )}
          {course.duration && <CourseMetaPill icon={Clock}>{course.duration}</CourseMetaPill>}
        </div>

        {course.target_exams && (
          <p className="mt-3.5 flex items-start gap-2 text-[13px] leading-relaxed text-[hsl(var(--muted-foreground))]">
            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
            <span>
              <span className="font-semibold text-[hsl(var(--brand-navy))]">Target: </span>
              {course.target_exams}
            </span>
          </p>
        )}

        {course.subjects && (
          <p className="mt-2 flex items-start gap-2 text-[13px] leading-relaxed text-[hsl(var(--muted-foreground))]">
            <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
            <span>{course.subjects}</span>
          </p>
        )}

        <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          {truncateText(course.description, 130) || 'Course details are being updated.'}
        </p>

        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
          <Link
            to={detailPath}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[hsl(var(--brand-navy))] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[hsl(var(--brand-navy-deep))]"
          >
            <span>Explore Course</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <CourseEnquiryButton courseName={course.name} />
        </div>
      </div>
    </article>
  );
}

const EXAM_STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  open: { label: 'Registration open', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  upcoming: { label: 'Upcoming', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  closed: { label: 'Closed', cls: 'bg-red-50 text-red-700 border-red-200' },
};

export function ExamCard({ exam }: { exam: Exam }) {
  const [showInstructions, setShowInstructions] = useState(false);
  const badge = EXAM_STATUS_STYLE[exam.status] || EXAM_STATUS_STYLE.upcoming;
  const timeDisplay = formatTime24to12(exam.start_time || exam.exam_time);
  const regUrl = exam.registration_url || exam.registration_link;

  return (
    <article className="surface surface-hover flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {exam.course_category && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--brand-blue))]">
              {exam.course_category}
            </p>
          )}
          <h3 className="mt-1 text-base font-bold leading-snug text-[hsl(var(--brand-navy))]">
            {exam.title}
          </h3>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs tabular-nums">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Class
          </dt>
          <dd className="mt-0.5 font-medium text-[hsl(var(--foreground))]">
            {exam.class_level || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Exam date
          </dt>
          <dd className="mt-0.5 font-medium text-[hsl(var(--foreground))]">
            {formatDate(exam.exam_date) || 'To be announced'}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Start time
          </dt>
          <dd className="mt-0.5 font-medium text-[hsl(var(--foreground))]">
            {timeDisplay || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Duration
          </dt>
          <dd className="mt-0.5 flex items-center gap-1 font-medium text-[hsl(var(--foreground))]">
            <Clock className="h-3.5 w-3.5 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
            <span>{exam.duration_minutes ? `${exam.duration_minutes} min` : '—'}</span>
          </dd>
        </div>
      </dl>

      {exam.syllabus && (
        <p className="mt-3 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
          <strong className="font-semibold text-[hsl(var(--brand-navy))]">Syllabus: </strong>
          {truncateText(exam.syllabus, 110)}
        </p>
      )}

      {showInstructions && exam.instructions && (
        <div className="mt-4 rounded-lg bg-[hsl(var(--brand-surface))] p-3 text-[13px] leading-relaxed text-[hsl(var(--foreground))]">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--brand-navy))]">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Instructions</span>
          </p>
          <p className="whitespace-pre-line">{exam.instructions}</p>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[hsl(var(--border))] pt-4">
        {exam.instructions ? (
          <button
            type="button"
            onClick={() => setShowInstructions((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--brand-navy))] hover:underline"
          >
            {showInstructions ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Hide instructions</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Instructions</span>
              </>
            )}
          </button>
        ) : (
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Schedule published by institute
          </span>
        )}

        {regUrl && exam.status !== 'completed' && exam.status !== 'closed' && (
          <a
            href={regUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFBE1B] px-3 py-1.5 text-xs font-bold text-[#122B5C] transition hover:bg-[#f2b211]"
          >
            <span>Registration</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}

export function LectureCard({
  lecture,
  onPlay,
}: {
  lecture: Lecture;
  onPlay: (lecture: Lecture) => void;
}) {
  return (
    <article className="surface surface-hover group flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => onPlay(lecture)}
        className="relative block h-44 w-full overflow-hidden bg-[hsl(var(--brand-surface))] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-navy))]"
        aria-label={`Watch ${lecture.title}`}
      >
        <SafeImage
          src={lecture.thumbnail_url || SITE_IMAGES.classroom}
          alt={lecture.title}
          className="h-44 w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-[#0B1D40]/35 transition group-hover:bg-[#0B1D40]/45">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#FFBE1B] text-[#122B5C] shadow-lg">
            <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
          </span>
        </span>
      </button>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <span className="font-semibold text-[hsl(var(--brand-blue))]">{lecture.subject}</span>
          <span aria-hidden="true">·</span>
          <span>{lecture.class_level}</span>
          {lecture.duration && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{lecture.duration}</span>
            </>
          )}
        </div>
        <h3 className="mt-2 text-base font-bold leading-snug text-[hsl(var(--brand-navy))]">
          {lecture.title}
        </h3>
        {lecture.description && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            {truncateText(lecture.description, 100)}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-xs">
          <span className="text-[hsl(var(--muted-foreground))]">
            {lecture.teacher_name || 'Gurukul Faculty'}
          </span>
          <button
            type="button"
            onClick={() => onPlay(lecture)}
            className="font-semibold text-[hsl(var(--brand-navy))] hover:text-[hsl(var(--brand-blue))]"
          >
            Watch lecture
          </button>
        </div>
      </div>
    </article>
  );
}

export function FacultyCard({ member }: { member: FacultyMember }) {
  const initial = (member.name || 'F').trim().charAt(0).toUpperCase();
  return (
    <article className="surface surface-hover flex flex-col overflow-hidden">
      <div className="h-52 overflow-hidden bg-[hsl(var(--brand-surface))]">
        {member.photo_url ? (
          <SafeImage src={member.photo_url} alt={member.name} className="h-52 w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[hsl(var(--brand-navy))] text-white">
            <span className="display-face text-5xl text-[#FFBE1B]">{initial}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold text-[hsl(var(--brand-blue))]">{member.role}</p>
        <h3 className="mt-1 text-lg font-bold text-[hsl(var(--brand-navy))]">{member.name}</h3>
        <p className="mt-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
          {member.subjects}
          {member.experience ? ` · ${member.experience}` : ''}
        </p>
        {member.qualification && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            <GraduationCap className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
            <span>{member.qualification}</span>
          </p>
        )}
        {member.bio && (
          <p className="mt-2.5 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            {truncateText(member.bio, 120)}
          </p>
        )}
      </div>
    </article>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initial = (testimonial.display_name || 'S').trim().charAt(0).toUpperCase();
  const rating = Math.min(5, Math.max(1, Number(testimonial.rating) || 5));

  return (
    <article className="surface flex flex-col p-6">
      <p className="flex-1 text-sm leading-relaxed text-[hsl(var(--foreground))]">
        “{testimonial.quote}”
      </p>
      <div className="mt-4 flex items-center gap-1" aria-label={`${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < rating ? 'fill-[#FFBE1B] text-[#FFBE1B]' : 'text-[hsl(var(--border))]'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-[hsl(var(--border))] pt-4">
        {testimonial.photo_url ? (
          <SafeImage
            src={testimonial.photo_url}
            alt={testimonial.display_name}
            className="h-10 w-10 shrink-0 rounded-full"
          />
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[hsl(var(--brand-navy))] text-sm font-bold text-[#FFBE1B]">
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[hsl(var(--brand-navy))]">
            {testimonial.display_name}
          </p>
          <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
            {testimonial.role_or_class || 'Student feedback'}
          </p>
        </div>
      </div>
    </article>
  );
}

export function BlogCard({ post }: { post: BlogPost }) {
  const slug = post.slug || post.id;
  return (
    <article className="surface surface-hover group flex flex-col overflow-hidden">
      <Link
        to={`/blogs/${slug}`}
        className="block h-44 overflow-hidden bg-[hsl(var(--brand-surface))]"
      >
        <SafeImage
          src={post.featured_image_url || SITE_IMAGES.exam}
          alt={post.title}
          className="h-44 w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          {post.category && (
            <>
              <span className="font-semibold text-[hsl(var(--brand-blue))]">{post.category}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            {formatDate(post.published_date) || 'Notice'}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-bold leading-snug text-[hsl(var(--brand-navy))]">
          <Link to={`/blogs/${slug}`} className="hover:text-[hsl(var(--brand-blue))]">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          {post.excerpt || truncateText(post.content, 120)}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-xs">
          {post.author ? (
            <span className="inline-flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
              <User className="h-3 w-3" aria-hidden="true" />
              {post.author}
            </span>
          ) : (
            <span />
          )}
          <Link
            to={`/blogs/${slug}`}
            className="inline-flex items-center gap-1 font-semibold text-[hsl(var(--brand-navy))] hover:text-[hsl(var(--brand-blue))]"
          >
            Read article
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function GalleryTile({
  item,
  onOpen,
}: {
  item: GalleryMedia;
  onOpen: (item: GalleryMedia) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group relative block w-full overflow-hidden rounded-xl bg-[hsl(var(--brand-surface))] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-navy))]"
    >
      <SafeImage
        src={item.file_url}
        alt={item.title || item.caption || 'Institute photograph'}
        className="h-48 w-full transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1D40]/85 via-[#0B1D40]/35 to-transparent p-3">
        <span className="block text-sm font-semibold text-white">
          {item.title || 'Institute photograph'}
        </span>
        {item.caption && (
          <span className="mt-0.5 block truncate text-[11px] text-white/80">{item.caption}</span>
        )}
      </span>
    </button>
  );
}
