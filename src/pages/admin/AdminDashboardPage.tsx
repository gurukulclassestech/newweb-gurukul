import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Database,
  GraduationCap,
  Inbox,
  IndianRupee,
  Loader2,
  Newspaper,
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import {
  DEFAULT_BANNER,
  DEFAULT_BLOGS,
  DEFAULT_COURSES,
  DEFAULT_EXAMS,
  DEFAULT_GALLERY_ALBUMS,
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_NAV_ITEMS,
  DEFAULT_RESULTS,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_TESTIMONIALS,
  REPRESENTATIVE_GALLERY,
} from '../../data/defaults';
import {
  deleteDocRecord,
  fetchCollection,
  logAdminActivity,
  setDocRecord,
  setSingleton,
} from '../../lib/firestoreApi';
import { usePageSeo } from '../../lib/seo';
import type {
  AdminActivity,
  AdmissionApplication,
  BlogPost,
  Course,
  Enquiry,
  Exam,
  PaymentRecord,
} from '../../types';

export function AdminDashboardPage() {
  usePageSeo('admin', 'Admin Dashboard', 'Overview of enquiries, admissions and published content.');
  const { reloadSite } = useSite();

  const [stats, setStats] = useState({
    enquiries: 0,
    newEnquiries: 0,
    admissions: 0,
    payments: 0,
    courses: 0,
    exams: 0,
    blogs: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedingAll, setSeedingAll] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const [seedError, setSeedError] = useState('');

  const loadStats = () => {
    setLoading(true);
    Promise.all([
      fetchCollection<Enquiry>('enquiries').catch(() => []),
      fetchCollection<AdmissionApplication>('admissions').catch(() => []),
      fetchCollection<PaymentRecord>('payments').catch(() => []),
      fetchCollection<Course>('courses').catch(() => []),
      fetchCollection<Exam>('exams').catch(() => []),
      fetchCollection<BlogPost>('blogs').catch(() => []),
      fetchCollection<AdminActivity>('admin_activity').catch(() => []),
    ])
      .then(([enq, adm, pay, crs, exm, blg, act]) => {
        setStats({
          enquiries: enq.length,
          newEnquiries: enq.filter((e) => e.status === 'new').length,
          admissions: adm.length,
          payments: pay.length,
          courses: crs.filter((c) => c.is_published).length,
          exams: exm.filter((e) => e.is_published).length,
          blogs: blg.filter((b) => b.is_published).length,
        });
        setRecentEnquiries(enq.slice(0, 5));
        setActivities(act.slice(0, 6));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  const seedAllDefaults = async () => {
    setSeedingAll(true);
    setSeedMessage('');
    setSeedError('');
    try {
      await setSingleton('site_settings', 'main', {
        ...DEFAULT_SITE_SETTINGS,
        customized_modules: [
          'nav_items',
          'homepage_sections',
          'banners',
          'courses',
          'exams',
          'results',
          'testimonials',
          'gallery',
          'blogs',
        ],
      });

      for (const nav of DEFAULT_NAV_ITEMS) {
        await setDocRecord('nav_items', nav.id, {
          label: nav.label,
          path: nav.path,
          location: nav.location,
          display_order: nav.display_order,
          open_in_new_tab: Boolean(nav.open_in_new_tab),
        });
      }

      for (const sec of DEFAULT_HOMEPAGE_SECTIONS) {
        const { id, ...rest } = sec;
        await setDocRecord('homepage_sections', id, rest as unknown as Record<string, unknown>);
      }

      const { id: bannerId, ...bannerData } = DEFAULT_BANNER;
      await setDocRecord('banners', bannerId, bannerData as unknown as Record<string, unknown>);

      const existingCourses = await fetchCollection<Course>('courses').catch(() => []);
      const defaultCourseIds = new Set(DEFAULT_COURSES.map((c) => c.id));
      for (const oldCourse of existingCourses) {
        if (!defaultCourseIds.has(oldCourse.id)) {
          await deleteDocRecord('courses', oldCourse.id);
        }
      }

      for (const c of DEFAULT_COURSES) {
        const { id, ...rest } = c;
        await setDocRecord('courses', id, rest as unknown as Record<string, unknown>);
      }

      for (const ex of DEFAULT_EXAMS) {
        const { id, ...rest } = ex;
        await setDocRecord('exams', id, rest as unknown as Record<string, unknown>);
      }

      for (const res of DEFAULT_RESULTS) {
        const { id, ...rest } = res;
        await setDocRecord('results', id, rest as unknown as Record<string, unknown>);
      }

      for (const t of DEFAULT_TESTIMONIALS) {
        const { id, ...rest } = t;
        await setDocRecord('testimonials', id, rest as unknown as Record<string, unknown>);
      }

      for (const alb of DEFAULT_GALLERY_ALBUMS) {
        const { id, ...rest } = alb;
        await setDocRecord('gallery_albums', id, rest as unknown as Record<string, unknown>);
      }

      for (const g of REPRESENTATIVE_GALLERY) {
        const { id, ...rest } = g;
        await setDocRecord('gallery_media', id, rest as unknown as Record<string, unknown>);
      }

      for (const b of DEFAULT_BLOGS) {
        const { id, ...rest } = b;
        await setDocRecord('blogs', id, rest as unknown as Record<string, unknown>);
      }

      await logAdminActivity('create', 'site_settings', 'Initialized complete Gurukul Classes defaults into Firestore');
      await reloadSite();
      loadStats();
      setSeedMessage(
        'All Gurukul Classes website content (settings, navigation, homepage, campus facilities, 5 courses, 4 GPAT exams, results, testimonials, gallery & blogs) saved to Firestore.'
      );
    } catch (err) {
      let msg = err instanceof Error ? err.message : 'Could not initialize default content.';
      try {
        const parsed = JSON.parse(msg) as { error?: string };
        if (parsed?.error) msg = parsed.error;
      } catch {
        // plain string
      }
      setSeedError(msg);
    } finally {
      setSeedingAll(false);
    }
  };

  const cards = [
    { label: 'Total enquiries', value: stats.enquiries, sub: `${stats.newEnquiries} new`, icon: Inbox, to: '/admin/enquiries' },
    { label: 'Admissions', value: stats.admissions, sub: 'Applications', icon: GraduationCap, to: '/admin/admissions' },
    { label: 'Fee payments', value: stats.payments, sub: 'Recorded receipts', icon: IndianRupee, to: '/admin/payments' },
    { label: 'Published courses', value: stats.courses, sub: 'Active batches', icon: BookOpen, to: '/admin/courses' },
    { label: 'Exam notices', value: stats.exams, sub: 'Published', icon: Calendar, to: '/admin/exams' },
    { label: 'Blog articles', value: stats.blogs, sub: 'Published', icon: Newspaper, to: '/admin/blogs' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--brand-navy))] sm:text-2xl">
            Institute Dashboard
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Live overview of student enquiries, admissions and published website modules.
          </p>
        </div>
        <button
          type="button"
          onClick={seedAllDefaults}
          disabled={seedingAll}
          className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-white px-4 py-2 text-xs font-semibold text-[hsl(var(--brand-navy))] shadow-2xs transition hover:bg-[hsl(var(--brand-surface))] disabled:opacity-60"
        >
          {seedingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Database className="h-4 w-4 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
          )}
          <span>{seedingAll ? 'Syncing defaults…' : 'Sync / Load all Gurukul defaults'}</span>
        </button>
      </div>

      {seedMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{seedMessage}</span>
        </div>
      )}

      {seedError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {seedError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, sub, icon: Icon, to }) => (
          <Link key={label} to={to} className="surface surface-hover flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                {label}
              </p>
              <p className="display-face mt-1 text-3xl text-[hsl(var(--brand-navy))] tabular-nums">
                {loading ? '—' : value}
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--brand-blue))]">{sub}</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--brand-surface))] text-[hsl(var(--brand-navy))]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3.5">
            <h2 className="text-sm font-bold text-[hsl(var(--brand-navy))]">Recent enquiries</h2>
            <Link
              to="/admin/enquiries"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--brand-blue))] hover:underline"
            >
              <span>Manage all</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          {recentEnquiries.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No enquiries submitted yet.
            </p>
          ) : (
            <ul className="divide-y divide-[hsl(var(--border))]">
              {recentEnquiries.map((enq) => (
                <li key={enq.id} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[hsl(var(--brand-navy))]">
                      {enq.student_name}
                    </p>
                    <p className="truncate text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
                      {enq.phone} {enq.course_name ? `· ${enq.course_name}` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold capitalize text-[hsl(var(--brand-blue))]">
                    {enq.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-[hsl(var(--border))] px-5 py-3.5">
            <h2 className="text-sm font-bold text-[hsl(var(--brand-navy))]">Recent admin updates</h2>
          </div>
          {activities.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Content updates saved from the admin console will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-[hsl(var(--border))]">
              {activities.map((act) => (
                <li key={act.id} className="px-5 py-3.5 text-sm">
                  <p className="font-medium text-[hsl(var(--brand-navy))]">{act.summary}</p>
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                    {act.entity} · {act.actor_email}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
