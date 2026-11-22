import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Newspaper,
  Phone,
  Sparkles,
  Users,
  Video,
  X,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import {
  DEFAULT_BLOGS,
  DEFAULT_COURSES,
  DEFAULT_EXAMS,
  DEFAULT_RESULTS,
  DEFAULT_TESTIMONIALS,
  REPRESENTATIVE_GALLERY,
  SITE_IMAGES,
} from '../data/defaults';
import { fetchPublished } from '../lib/firestoreApi';
import { usePageSeo } from '../lib/seo';
import { CampusSection } from '../components/CampusSection';
import {
  BlogCard,
  CardSkeletonGrid,
  CourseCard,
  EmptyState,
  ExamCard,
  FacultyCard,
  GalleryTile,
  LectureCard,
  SectionHeader,
  TestimonialCard,
  formatDate,
} from '../components/CommonUI';
import { EnquiryForm } from '../components/EnquiryForm';
import { SafeImage } from '../components/SafeImage';
import type {
  BlogPost,
  Course,
  Exam,
  FacultyMember,
  GalleryMedia,
  HomepageSection,
  Lecture,
  StudentResult,
  Testimonial,
} from '../types';

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

function HeroSection({ section }: { section: HomepageSection }) {
  const { banners } = useSite();
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = banners.length > 0 ? banners : [];
  const current = slides[activeIndex % Math.max(1, slides.length)];

  const title = current?.title || section.title;
  const subtitle = current?.subtitle || section.subtitle;
  const description = current?.description || section.body;
  const imageUrl = current?.image_url || section.image_url || SITE_IMAGES.hero;
  const mobileImageUrl = current?.mobile_image_url || '';
  const primaryLabel = current?.primary_label || section.button_label || 'Apply for admission';
  const primaryUrl = current?.primary_url || section.button_link || '/admission';
  const secondaryLabel = current?.secondary_label || 'Explore courses';
  const secondaryUrl = current?.secondary_url || '/courses';
  const deadline = current?.deadline;

  return (
    <section className="relative flex min-h-[560px] items-center overflow-hidden bg-[#0B1D40] text-white sm:min-h-[600px] lg:min-h-[660px]">
      {mobileImageUrl ? (
        <>
          <SafeImage
            src={mobileImageUrl}
            alt={title}
            eager
            className="absolute inset-0 block h-full w-full opacity-50 sm:hidden"
          />
          <SafeImage
            src={imageUrl}
            alt={title}
            eager
            className="absolute inset-0 hidden h-full w-full opacity-45 sm:block"
          />
        </>
      ) : (
        <SafeImage
          src={imageUrl}
          alt={title}
          eager
          className="absolute inset-0 h-full w-full opacity-45"
        />
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(7,19,42,0.94) 0%, rgba(7,19,42,0.82) 52%, rgba(7,19,42,0.42) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="shell relative w-full py-12 sm:py-16 lg:py-20">
        <div className="rise-in w-full max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFBE1B] backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {deadline
                ? `Admissions close ${formatDate(deadline)}`
                : section.eyebrow || 'Admissions open · Chhatrapati Sambhajinagar'}
            </span>
          </span>

          <h1 className="display-face mt-5 text-[2.1rem] leading-[1.08] text-white sm:text-[3.15rem] lg:text-[3.65rem]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-[17px]">
              {subtitle}
            </p>
          )}
          {description && (
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-white/70">{description}</p>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to={primaryUrl}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFBE1B] px-6 py-3 text-sm font-bold text-[#122B5C] transition hover:bg-[#f2b211] whitespace-nowrap"
            >
              <span>{primaryLabel}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {secondaryLabel && (
              <Link
                to={secondaryUrl}
                className="inline-flex items-center justify-center rounded-lg border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20 whitespace-nowrap"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>

          {deadline && (
            <p className="mt-4 text-xs font-medium text-[#FFBE1B]/90 tabular-nums">
              Last date to apply · {formatDate(deadline)}
            </p>
          )}

          {section.items && section.items.length > 0 && (
            <ul className="mt-8 grid gap-4 border-t border-white/15 pt-6 sm:grid-cols-3">
              {section.items.map((item, idx) => (
                <li key={idx} className="border-l-2 border-[#FFBE1B] pl-3">
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  {item.description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-white/70">
                      {item.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {slides.length > 1 && (
            <div className="mt-8 flex items-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Show slide ${idx + 1}`}
                  aria-current={idx === activeIndex}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeIndex ? 'w-8 bg-[#FFBE1B]' : 'w-3 bg-white/45 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AnnouncementSection({ section }: { section: HomepageSection }) {
  return (
    <section className="shell pt-10">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#FFBE1B]/45 bg-[#FFBE1B]/10 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFBE1B] text-[#122B5C]">
          <Megaphone className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--brand-navy))]/75">
            {section.title || 'Announcement'}
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-[hsl(var(--foreground))]">
            {section.body}
          </p>
        </div>
        <Link
          to={section.button_link || '/admission'}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-[hsl(var(--brand-navy))] hover:text-[hsl(var(--brand-blue))] whitespace-nowrap"
        >
          <span>{section.button_label || 'Apply now'}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function IntroSection({ section }: { section: HomepageSection }) {
  const paragraphs = String(section.body || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="shell py-14 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <div className="h-[280px] overflow-hidden rounded-2xl sm:h-[400px]">
            <SafeImage
              src={section.image_url || SITE_IMAGES.mentoring}
              alt={section.title || 'Mentoring at the institute'}
              className="h-full w-full"
            />
          </div>
          <div className="mt-4 inline-flex items-center gap-3 rounded-xl bg-[hsl(var(--brand-navy))] px-5 py-3.5 text-white sm:absolute sm:-bottom-4 sm:-right-2 sm:mt-0 sm:shadow-xl">
            <span className="display-face text-2xl text-[#FFBE1B] tabular-nums">
              {section.items?.[0]?.value || '1 : 1'}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
              {section.items?.[0]?.label || 'Doubt clearing'}
            </span>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="eyebrow">{section.eyebrow || 'About the institute'}</p>
          <h2 className="display-face mt-3 text-[1.9rem] leading-tight text-[hsl(var(--brand-navy))] sm:text-[2.45rem]">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="mt-3 text-[15px] font-medium text-[hsl(var(--brand-blue))]">
              {section.subtitle}
            </p>
          )}
          <div className="mt-4 space-y-3.5 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Link
            to={section.button_link || '/about'}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--brand-navy))]/25 px-4 py-2.5 text-sm font-semibold text-[hsl(var(--brand-navy))] transition hover:bg-[hsl(var(--brand-surface))]"
          >
            <span>{section.button_label || 'Learn more'}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CoursesHomeSection({
  section,
  courses,
  loading,
}: {
  section: HomepageSection;
  courses: Course[];
  loading: boolean;
}) {
  return (
    <section className="bg-[hsl(var(--brand-surface))] py-14 sm:py-20">
      <div className="shell">
        <SectionHeader
          eyebrow={section.eyebrow || 'Programmes'}
          title={section.title}
          subtitle={section.subtitle}
          action={
            <Link
              to={section.button_link || '/courses'}
              className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--brand-navy))]/25 bg-white px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-navy))] transition hover:bg-white/80"
            >
              <span>{section.button_label || 'All courses'}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />
        <div className="mt-9">
          {loading ? (
            <CardSkeletonGrid count={3} />
          ) : courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No published courses right now"
              description="Course batches are currently being updated by the institute."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturesHomeSection({ section }: { section: HomepageSection }) {
  if (!section.items?.length) return null;
  return (
    <section className="shell py-14 sm:py-20">
      <SectionHeader
        align="center"
        eyebrow={section.eyebrow || 'Why us'}
        title={section.title}
        subtitle={section.subtitle}
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {section.items.map((item, idx) => (
          <div key={idx} className="surface surface-hover p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--brand-navy))] text-[#FFBE1B]">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-bold text-[hsl(var(--brand-navy))]">
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
    </section>
  );
}

function AchievementsHomeSection({
  section,
  results,
  loading,
}: {
  section: HomepageSection;
  results: StudentResult[];
  loading: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--brand-navy))] py-14 text-white sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ backgroundImage: 'radial-gradient(circle at 80% 10%, #FFBE1B 0, transparent 45%)' }}
        aria-hidden="true"
      />
      <div className="shell relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-[#FFBE1B]">{section.eyebrow || 'Achievements'}</p>
            <h2 className="display-face mt-3 text-[1.9rem] leading-tight sm:text-4xl">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="mt-3 text-[15px] text-white/75">{section.subtitle}</p>
            )}
          </div>
          <Link
            to={section.button_link || '/results'}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#FFBE1B] px-5 py-2.5 text-sm font-semibold text-[#122B5C] transition hover:bg-[#f2b211] whitespace-nowrap"
          >
            <span>{section.button_label || 'View all results'}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {section.items && section.items.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {section.items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/15 bg-white/8 p-5 backdrop-blur-xs"
              >
                <p className="display-face text-3xl text-[#FFBE1B] tabular-nums">
                  {item.value || item.title}
                </p>
                <p className="mt-1 text-xs font-medium text-white/80">
                  {item.label || item.description}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-9">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-xl border border-white/15 bg-white/5 p-6 text-sm text-white/80">
              <div className="flex items-start gap-3">
                <Award className="mt-0.5 h-5 w-5 shrink-0 text-[#FFBE1B]" aria-hidden="true" />
                <p>
                  {section.body ||
                    'Verified student results, ranks and academic achievements are published here after verification and family consent.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.slice(0, 4).map((res) => (
                <Link
                  key={res.id}
                  to="/results"
                  className="group overflow-hidden rounded-2xl border border-white/15 bg-white/8 backdrop-blur-xs transition hover:border-[#FFBE1B]/50 hover:bg-white/12"
                >
                  {res.photo_url && (
                    <div className="h-52 overflow-hidden bg-white/5">
                      <SafeImage
                        src={res.photo_url}
                        alt={res.student_name}
                        className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="display-face text-3xl text-[#FFBE1B] tabular-nums">{res.score}</p>
                    <h3 className="mt-2 text-base font-bold text-white">{res.student_name}</h3>
                    <p className="mt-1 text-xs text-white/80">{res.achievement_title}</p>
                    {(res.class_level || res.academic_year) && (
                      <p className="mt-3 text-xs text-white/60 tabular-nums">
                        {[res.class_level, res.academic_year].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FaqHomeSection({ section }: { section: HomepageSection }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  if (!section.items?.length) return null;

  return (
    <section className="shell py-14 sm:py-20">
      <SectionHeader
        align="center"
        eyebrow={section.eyebrow || 'Common questions'}
        title={section.title}
        subtitle={section.subtitle}
      />
      <div className="mx-auto mt-9 max-w-3xl divide-y divide-[hsl(var(--border))] rounded-2xl border border-[hsl(var(--border))] bg-white">
        {section.items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx}>
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <span className="text-sm font-bold text-[hsl(var(--brand-navy))] sm:text-base">
                  {item.title}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              {isOpen && item.description && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {item.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function HomePage() {
  const { site, sections } = useSite();
  usePageSeo('home', site.seo_title, site.seo_description);

  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [gallery, setGallery] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [activeImage, setActiveImage] = useState<GalleryMedia | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchPublished<Course>('courses', 'display_order', 'asc', 6).catch(() => []),
      fetchPublished<FacultyMember>('faculty', 'display_order', 'asc', 4).catch(() => []),
      fetchPublished<Exam>('exams', 'display_order', 'asc', 6).catch(() => []),
      fetchPublished<Lecture>('lectures', 'display_order', 'asc', 3).catch(() => []),
      fetchPublished<StudentResult>('results', 'display_order', 'asc', 6).catch(() => []),
      fetchPublished<Testimonial>('testimonials', 'display_order', 'asc', 3).catch(() => []),
      fetchPublished<BlogPost>('blogs', 'published_date', 'desc', 3).catch(() => []),
      fetchPublished<GalleryMedia>('gallery_media', 'display_order', 'asc', 8).catch(() => []),
    ])
      .then(([c, f, e, l, r, t, b, g]) => {
        if (!active) return;
        setCourses(c);
        setFaculty(f);
        setExams(e);
        setLectures(l);
        setResults(r);
        setTestimonials(t);
        setBlogs(b);
        setGallery(g.filter((item) => item.media_type !== 'video'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const orderedSections = [...sections]
    .filter((s) => s.is_visible !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const customized = site.customized_modules || [];
  const displayCourses =
    courses.length > 0 || customized.includes('courses') ? courses : DEFAULT_COURSES;
  const displayExams =
    exams.length > 0 || customized.includes('exams') ? exams : DEFAULT_EXAMS;
  const displayResults =
    results.length > 0 || customized.includes('results') ? results : DEFAULT_RESULTS;
  const displayTestimonials =
    testimonials.length > 0 || customized.includes('testimonials')
      ? testimonials
      : DEFAULT_TESTIMONIALS;
  const displayBlogs =
    blogs.length > 0 || customized.includes('blogs') ? blogs : DEFAULT_BLOGS;
  const galleryPreview =
    gallery.length > 0 || customized.includes('gallery') ? gallery : REPRESENTATIVE_GALLERY;

  const whatsappClean = (site.whatsapp || site.phone || '').replace(/\D/g, '');
  const whatsappText =
    site.whatsapp_prefill_message ||
    `Hello ${site.institute_name}, I would like to know about admissions.`;

  return (
    <>
      {orderedSections.map((section) => {
        switch (section.key) {
          case 'hero':
            return <HeroSection key={section.id || section.key} section={section} />;

          case 'announcement':
            return <AnnouncementSection key={section.id || section.key} section={section} />;

          case 'intro':
            return <IntroSection key={section.id || section.key} section={section} />;

          case 'courses':
            return (
              <CoursesHomeSection
                key={section.id || section.key}
                section={section}
                courses={displayCourses}
                loading={loading}
              />
            );

          case 'campus':
            return <CampusSection key={section.id || section.key} section={section} />;

          case 'features':
            return <FeaturesHomeSection key={section.id || section.key} section={section} />;

          case 'achievements':
            return (
              <AchievementsHomeSection
                key={section.id || section.key}
                section={section}
                results={displayResults}
                loading={loading}
              />
            );

          case 'faculty':
            return (
              <section key={section.id || section.key} className="shell py-14 sm:py-20">
                <SectionHeader
                  eyebrow={section.eyebrow || 'Teachers'}
                  title={section.title}
                  subtitle={section.subtitle}
                  action={
                    <Link
                      to={section.button_link || '/faculty'}
                      className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--brand-navy))]/25 px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-navy))] transition hover:bg-[hsl(var(--brand-surface))]"
                    >
                      <span>{section.button_label || 'Meet the faculty'}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  }
                />
                <div className="mt-9">
                  {loading ? (
                    <CardSkeletonGrid count={4} />
                  ) : faculty.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="Faculty profiles are being updated"
                      description="Teaching profiles appear here once the institute publishes them."
                    />
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      {faculty.slice(0, 4).map((m) => (
                        <FacultyCard key={m.id} member={m} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );

          case 'exams':
            return (
              <section
                key={section.id || section.key}
                className="bg-[hsl(var(--brand-surface))] py-14 sm:py-20"
              >
                <div className="shell">
                  <SectionHeader
                    eyebrow={section.eyebrow || 'Assessments'}
                    title={section.title}
                    subtitle={section.subtitle}
                    action={
                      <Link
                        to={section.button_link || '/exams'}
                        className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--brand-navy))]/25 bg-white px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-navy))] transition hover:bg-white/80"
                      >
                        <span>{section.button_label || 'All exam announcements'}</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    }
                  />
                  <div className="mt-9">
                    {loading ? (
                      <CardSkeletonGrid count={3} />
                    ) : displayExams.length === 0 ? (
                      <EmptyState
                        icon={Calendar}
                        title="No examination notices right now"
                        description="Upcoming test and examination schedules will appear here once published."
                      />
                    ) : (
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {displayExams.slice(0, 3).map((ex) => (
                          <ExamCard key={ex.id} exam={ex} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );

          case 'lectures':
            return (
              <section key={section.id || section.key} className="shell py-14 sm:py-20">
                <SectionHeader
                  eyebrow={section.eyebrow || 'Video library'}
                  title={section.title}
                  subtitle={section.subtitle}
                  action={
                    <Link
                      to={section.button_link || '/lectures'}
                      className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--brand-navy))]/25 px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-navy))] transition hover:bg-[hsl(var(--brand-surface))]"
                    >
                      <span>{section.button_label || 'Browse lectures'}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  }
                />
                <div className="mt-9">
                  {loading ? (
                    <CardSkeletonGrid count={3} />
                  ) : lectures.length === 0 ? (
                    <EmptyState
                      icon={Video}
                      title="No published lectures yet"
                      description="Recorded lectures for home revision will appear here once the faculty publishes them."
                    />
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {lectures.slice(0, 3).map((lec) => (
                        <LectureCard key={lec.id} lecture={lec} onPlay={setActiveLecture} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );

          case 'testimonials':
            return (
              <section
                key={section.id || section.key}
                className="bg-[hsl(var(--brand-surface))] py-14 sm:py-20"
              >
                <div className="shell">
                  <SectionHeader
                    eyebrow={section.eyebrow || 'Student voices'}
                    title={section.title}
                    subtitle={section.subtitle}
                    action={
                      <Link
                        to={section.button_link || '/testimonials'}
                        className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--brand-navy))]/25 bg-white px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-navy))] transition hover:bg-white/80"
                      >
                        <span>{section.button_label || 'Read more'}</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    }
                  />
                  <div className="mt-9">
                    {loading ? (
                      <CardSkeletonGrid count={3} />
                    ) : displayTestimonials.length === 0 ? (
                      <EmptyState
                        icon={GraduationCap}
                        title="No testimonials published yet"
                        description="Approved student feedback will appear here once published by the institute."
                      />
                    ) : (
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {displayTestimonials.slice(0, 3).map((t) => (
                          <TestimonialCard key={t.id} testimonial={t} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );

          case 'news':
            return (
              <section key={section.id || section.key} className="shell py-14 sm:py-20">
                <SectionHeader
                  eyebrow={section.eyebrow || 'Newsroom'}
                  title={section.title}
                  subtitle={section.subtitle}
                  action={
                    <Link
                      to={section.button_link || '/blogs'}
                      className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--brand-navy))]/25 px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-navy))] transition hover:bg-[hsl(var(--brand-surface))]"
                    >
                      <span>{section.button_label || 'All articles'}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  }
                />
                <div className="mt-9">
                  {loading ? (
                    <CardSkeletonGrid count={3} />
                  ) : displayBlogs.length === 0 ? (
                    <EmptyState
                      icon={Newspaper}
                      title="No articles published yet"
                      description="Notices and study guidance from the institute will appear here."
                    />
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {displayBlogs.slice(0, 3).map((post) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );

          case 'gallery':
            return (
              <section
                key={section.id || section.key}
                className="bg-[hsl(var(--brand-surface))] py-14 sm:py-20"
              >
                <div className="shell">
                  <SectionHeader
                    eyebrow={section.eyebrow || 'Gallery'}
                    title={section.title}
                    subtitle={section.subtitle}
                    action={
                      <Link
                        to={section.button_link || '/gallery'}
                        className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--brand-navy))]/25 bg-white px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-navy))] transition hover:bg-white/80"
                      >
                        <span>{section.button_label || 'Open gallery'}</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    }
                  />
                  <div className="mt-9">
                    {!loading && gallery.length === 0 && !customized.includes('gallery') && (
                      <p className="mb-3 inline-flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                        <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          Campus gallery preview — manage photographs anytime from the Admin Gallery console.
                        </span>
                      </p>
                    )}
                    {galleryPreview.length === 0 ? (
                      <EmptyState
                        icon={ImageIcon}
                        title="No gallery photographs published"
                        description="Published campus and event photographs appear here."
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {galleryPreview.slice(0, 8).map((item) => (
                          <GalleryTile key={item.id} item={item} onOpen={setActiveImage} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );

          case 'faq':
            return <FaqHomeSection key={section.id || section.key} section={section} />;

          case 'enquiry':
            return (
              <section
                key={section.id || section.key}
                className="bg-[hsl(var(--brand-surface))] py-14 sm:py-20"
              >
                <div className="shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                  <div>
                    <p className="eyebrow">{section.eyebrow || 'Enquiry'}</p>
                    <h2 className="display-face mt-3 text-[1.9rem] leading-tight text-[hsl(var(--brand-navy))] sm:text-[2.45rem]">
                      {section.title}
                    </h2>
                    {section.subtitle && (
                      <p className="mt-3 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                        {section.subtitle}
                      </p>
                    )}
                    {section.body && (
                      <p className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-white p-4 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                        {section.body}
                      </p>
                    )}
                  </div>
                  <div className="surface p-5 sm:p-7">
                    <EnquiryForm source="home-page" submitLabel="Submit enquiry" />
                  </div>
                </div>
              </section>
            );

          case 'contact':
            return (
              <section key={section.id || section.key} className="shell py-14 sm:py-20">
                <SectionHeader
                  eyebrow={section.eyebrow || 'Contact'}
                  title={section.title}
                  subtitle={section.subtitle}
                  action={
                    <Link
                      to={section.button_link || '/contact'}
                      className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--brand-navy))]/25 px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-navy))] transition hover:bg-[hsl(var(--brand-surface))]"
                    >
                      <span>{section.button_label || 'Contact page'}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  }
                />
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="surface p-5">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      <Phone className="h-3.5 w-3.5 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
                      Phone
                    </p>
                    <a
                      href={`tel:${site.phone}`}
                      className="mt-2 block text-sm font-semibold text-[hsl(var(--brand-navy))] tabular-nums hover:underline"
                    >
                      {site.phone}
                    </a>
                  </div>
                  <div className="surface p-5">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      <Mail className="h-3.5 w-3.5 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
                      Email
                    </p>
                    <a
                      href={`mailto:${site.email}`}
                      className="mt-2 block break-all text-sm font-semibold text-[hsl(var(--brand-navy))] hover:underline"
                    >
                      {site.email}
                    </a>
                  </div>
                  <div className="surface flex flex-col justify-between p-5">
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                        <MapPin className="h-3.5 w-3.5 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
                        Address
                      </p>
                      <p className="mt-2 text-sm font-medium text-[hsl(var(--brand-navy))]">
                        {site.address}
                      </p>
                    </div>
                    {site.map_link && (
                      <a
                        href={site.map_link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--brand-blue))] hover:underline"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                  <div className="surface flex flex-col justify-between p-5">
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                        <Clock className="h-3.5 w-3.5 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
                        Office hours
                      </p>
                      <p className="mt-2 text-sm font-medium text-[hsl(var(--brand-navy))]">
                        {site.office_hours}
                      </p>
                    </div>
                    {whatsappClean && (
                      <a
                        href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent(whatsappText)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
                      >
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </section>
            );

          default:
            return (
              <section key={section.id || section.key} className="shell py-14 sm:py-16">
                <div className="surface overflow-hidden p-6 sm:p-8">
                  <div className={section.image_url ? 'grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]' : ''}>
                    <div>
                      {section.eyebrow && <p className="eyebrow mb-2">{section.eyebrow}</p>}
                      <h2 className="display-face text-2xl text-[hsl(var(--brand-navy))] sm:text-3xl">
                        {section.title}
                      </h2>
                      {section.subtitle && (
                        <p className="mt-2 text-sm font-medium text-[hsl(var(--brand-blue))]">
                          {section.subtitle}
                        </p>
                      )}
                      {section.body && (
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                          {section.body}
                        </p>
                      )}
                      {section.button_label && section.button_link && (
                        <Link
                          to={section.button_link}
                          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#FFBE1B] px-5 py-2.5 text-xs font-bold text-[#122B5C] hover:bg-[#f2b211]"
                        >
                          <span>{section.button_label}</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                    {section.image_url && (
                      <div className="h-64 overflow-hidden rounded-xl bg-[hsl(var(--brand-surface))] sm:h-72">
                        <SafeImage
                          src={section.image_url}
                          alt={section.title}
                          className="h-full w-full"
                        />
                      </div>
                    )}
                  </div>

                  {section.items && section.items.length > 0 && (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {section.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))]/60 p-5"
                        >
                          {item.image_url && (
                            <div className="mb-3 h-36 overflow-hidden rounded-lg">
                              <SafeImage
                                src={item.image_url}
                                alt={item.title || 'Item'}
                                className="h-full w-full"
                              />
                            </div>
                          )}
                          {item.title && (
                            <h3 className="text-sm font-bold text-[hsl(var(--brand-navy))]">
                              {item.title}
                            </h3>
                          )}
                          {item.description && (
                            <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                              {item.description}
                            </p>
                          )}
                          {item.points && item.points.length > 0 && (
                            <ul className="mt-3 space-y-1.5">
                              {item.points.map((pt, pIdx) => (
                                <li
                                  key={pIdx}
                                  className="flex items-start gap-2 text-xs text-[hsl(var(--foreground))]"
                                >
                                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--brand-blue))]" />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
        }
      })}

      {/* Video Lecture Player Modal */}
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
                <video
                  src={activeLecture.video_url}
                  controls
                  className="h-full w-full"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Lightbox Modal */}
      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.title || 'Gallery photograph'}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/80 p-4"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="surface relative w-full max-w-3xl p-3 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              aria-label="Close photograph"
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#122B5C] shadow"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <SafeImage
              src={activeImage.file_url}
              alt={activeImage.title || 'Gallery photograph'}
              fit="contain"
              className="max-h-[75vh] w-full rounded-lg bg-[hsl(var(--brand-surface))]"
            />
            {(activeImage.title || activeImage.caption) && (
              <p className="mt-2.5 px-1 text-sm text-[hsl(var(--muted-foreground))]">
                <span className="font-semibold text-[hsl(var(--brand-navy))]">
                  {activeImage.title}
                </span>
                {activeImage.caption ? ` — ${activeImage.caption}` : ''}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
