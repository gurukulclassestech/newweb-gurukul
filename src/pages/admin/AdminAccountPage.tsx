import { LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePageSeo } from '../../lib/seo';

export function AdminAccountPage() {
  const { user, logout } = useAuth();
  usePageSeo('admin', 'Admin Account');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[hsl(var(--brand-navy))] sm:text-2xl">
          Admin Account
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[hsl(var(--muted-foreground))]">
          Your access, role, and active session for the institute admin console.
        </p>
      </div>

      <div className="surface max-w-lg p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[hsl(var(--brand-navy))] text-[#FFBE1B]">
            <UserCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[hsl(var(--brand-navy))]">
              {user?.displayName || 'Administrator'}
            </p>
            <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
              {user?.email}
            </p>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--brand-surface))] px-3.5 py-2.5">
            <dt className="text-[hsl(var(--muted-foreground))]">Role</dt>
            <dd className="font-semibold text-[hsl(var(--brand-navy))]">Administrator</dd>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--brand-surface))] px-3.5 py-2.5">
            <dt className="text-[hsl(var(--muted-foreground))]">Access level</dt>
            <dd className="font-semibold text-[hsl(var(--brand-navy))]">
              Full content &amp; enquiry access
            </dd>
          </div>
        </dl>

        <div className="mt-5 rounded-lg border border-dashed border-[hsl(var(--border))] p-3.5 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
          <p className="flex items-center gap-1.5 font-semibold text-[hsl(var(--brand-navy))]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Authentication security</span>
          </p>
          <p className="mt-1">
            Admin sign-in is verified via Google Authentication and enforced server-side by Cloud Firestore security rules. Public visitors cannot read enquiry or admission records.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Sign out of the admin console</span>
        </button>
      </div>
    </div>
  );
}
