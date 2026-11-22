import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { usePageSeo } from '../../lib/seo';
import { BrandLogo } from '../../components/Header';

export function AdminLoginPage() {
  const { user, isAdmin, loading, authError, signInWithGoogle, logout } = useAuth();
  const { site } = useSite();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  usePageSeo('login', 'Admin Sign In', `Sign in to manage ${site.institute_name}.`);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    const ok = await signInWithGoogle();
    setSigningIn(false);
    if (ok) {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--brand-surface))] px-4 py-12">
      <div className="surface w-full max-w-md p-7 sm:p-8">
        <div className="flex items-center gap-3">
          <BrandLogo site={site} />
          <div>
            <p className="eyebrow">Admin console</p>
            <h1 className="text-base font-bold text-[hsl(var(--brand-navy))]">
              {site.institute_name}
            </h1>
          </div>
        </div>

        <h2 className="display-face mt-6 text-2xl text-[hsl(var(--brand-navy))]">
          Administrator sign in
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          Sign in with an authorised Google administrator account to update website content, manage courses, upload gallery photos, and review student enquiries.
        </p>

        {authError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs leading-relaxed text-red-700"
          >
            {authError}
          </div>
        )}

        {user && !isAdmin && !loading && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
            <p className="font-semibold">Signed in as {user.email}</p>
            <p className="mt-1">This account does not have administrator privileges.</p>
            <button
              type="button"
              onClick={logout}
              className="mt-2 font-bold underline hover:text-amber-950"
            >
              Sign out and switch account
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={signingIn || loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--brand-navy))] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {signingIn || loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-[#FFBE1B]" aria-hidden="true" />
          )}
          <span>Continue with Google</span>
        </button>

        <div className="mt-6 border-t border-[hsl(var(--border))] pt-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--brand-navy))]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to public website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
