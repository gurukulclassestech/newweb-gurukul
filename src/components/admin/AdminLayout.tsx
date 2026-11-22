import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  Compass,
  CreditCard,
  ExternalLink,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Inbox,
  IndianRupee,
  LayoutDashboard,
  LayoutList,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageSquareQuote,
  Newspaper,
  PanelBottom,
  Phone,
  Search,
  Settings,
  Sparkles,
  UserCheck,
  Users,
  Video,
  X,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';

interface AdminNavItem {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
}

const ADMIN_NAV_GROUPS: Array<{ group: string; items: AdminNavItem[] }> = [
  {
    group: 'Overview',
    items: [{ label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true }],
  },
  {
    group: 'Website content',
    items: [
      { label: 'Website Settings', path: '/admin/settings', icon: Settings },
      { label: 'Header & Navigation', path: '/admin/navigation', icon: Compass },
      { label: 'Homepage Sections', path: '/admin/homepage', icon: LayoutTemplate },
      { label: 'About Page', path: '/admin/about', icon: FileText },
      { label: 'Courses Page', path: '/admin/courses-page', icon: LayoutList },
      { label: 'Campus Facilities', path: '/admin/campus', icon: Building2 },
      { label: 'Homepage Banners', path: '/admin/banners', icon: ImageIcon },
      { label: 'Admission Popup', path: '/admin/popup', icon: Sparkles },
      { label: 'SEO Settings', path: '/admin/seo', icon: Search },
      { label: 'Footer Settings', path: '/admin/footer', icon: PanelBottom },
      { label: 'Contact Settings', path: '/admin/contact', icon: Phone },
    ],
  },
  {
    group: 'Academics',
    items: [
      { label: 'Courses', path: '/admin/courses', icon: BookOpen },
      { label: 'Exams', path: '/admin/exams', icon: Calendar },
      { label: 'Lectures', path: '/admin/lectures', icon: Video },
      { label: 'Results', path: '/admin/results', icon: Award },
      { label: 'Faculty', path: '/admin/faculty', icon: Users },
      { label: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
      { label: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
      { label: 'Blogs', path: '/admin/blogs', icon: Newspaper },
    ],
  },
  {
    group: 'Admissions',
    items: [
      { label: 'Enquiries', path: '/admin/enquiries', icon: Inbox },
      { label: 'Admissions', path: '/admin/admissions', icon: GraduationCap },
      { label: 'Payments', path: '/admin/payments', icon: IndianRupee },
      { label: 'Payment Settings', path: '/admin/payment-settings', icon: CreditCard },
    ],
  },
  {
    group: 'Account',
    items: [{ label: 'Admin Account', path: '/admin/account', icon: UserCheck }],
  },
];

export function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAuth();
  const { site } = useSite();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--brand-surface))]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[hsl(var(--brand-navy))]" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-[hsl(var(--border))] px-4 py-4">
        <Link to="/admin" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#FFBE1B] text-base font-extrabold text-[#122B5C]">
            {(site.institute_name || 'G').trim().charAt(0)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-bold text-[hsl(var(--brand-navy))]">
              Admin console
            </span>
            <span className="block truncate text-[10px] uppercase tracking-wider text-slate-500">
              {site.institute_name}
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          className="p-1 text-slate-400 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        {ADMIN_NAV_GROUPS.map((grp) => (
          <div key={grp.group}>
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {grp.group}
            </p>
            <div className="space-y-0.5">
              {grp.items.map(({ label, path, icon: Icon, end }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition ${
                      isActive
                        ? 'bg-[hsl(var(--brand-navy))] text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-[hsl(var(--brand-navy))]'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[hsl(var(--border))] p-3">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-100"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          <span>View website</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--brand-surface))]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[hsl(var(--border))] bg-white lg:block">
        {sidebarContent}
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#0B1D40]/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative h-full w-[80vw] max-w-xs bg-white shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[hsl(var(--border))] bg-white/95 px-4 backdrop-blur-xs sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="hidden text-xs font-medium text-slate-500 lg:block">
            Content management for {site.institute_name}
          </p>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:block">{user.email}</span>
            <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Admin
            </span>
            <Link
              to="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-surface))] sm:inline-flex"
            >
              <span>View site</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
