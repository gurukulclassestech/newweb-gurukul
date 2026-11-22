import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { DEFAULT_COURSES } from '../data/defaults';
import { fetchPublished } from '../lib/firestoreApi';
import { BrandLogo } from './Header';
import type { Course } from '../types';

export function Footer() {
  const { site, footerNav } = useSite();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetchPublished<Course>('courses', 'display_order', 'asc', 5)
      .then((rows) => setCourses(rows))
      .catch(() => setCourses([]));
  }, []);

  const coursesCustomized = Boolean(site.customized_modules?.includes('courses'));
  const displayCourses =
    courses.length > 0 || coursesCustomized ? courses : DEFAULT_COURSES.slice(0, 5);

  const socials = [
    { href: site.facebook_url, icon: Facebook, label: 'Facebook' },
    { href: site.instagram_url, icon: Instagram, label: 'Instagram' },
    { href: site.youtube_url, icon: Youtube, label: 'YouTube' },
    { href: site.twitter_url, icon: Twitter, label: 'Twitter / X' },
  ].filter((s) => Boolean(s.href));

  return (
    <footer className="mt-20 bg-[hsl(var(--brand-navy-deep))] text-white/75">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandLogo site={site} className="bg-white/95 p-1" />
            {!site.logo_url && (
              <span className="text-[15px] font-bold text-white">{site.institute_name}</span>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed">{site.footer_about}</p>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white/85 transition hover:bg-[#FFBE1B] hover:text-[#122B5C]"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFBE1B]">
            Quick links
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {footerNav.map((item) => (
              <li key={`${item.path}-${item.id}`}>
                <Link
                  to={item.path}
                  target={item.open_in_new_tab ? '_blank' : undefined}
                  rel={item.open_in_new_tab ? 'noreferrer' : undefined}
                  className="transition hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFBE1B]">
            Courses
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {displayCourses.map((course) => (
              <li key={course.id}>
                <Link
                  to={`/courses/${course.slug || course.id}`}
                  className="transition hover:text-white"
                >
                  {course.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFBE1B]">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            {site.phone && (
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#FFBE1B]" aria-hidden="true" />
                <a href={`tel:${site.phone}`} className="tabular-nums hover:text-white">
                  {site.phone}
                </a>
              </li>
            )}
            {site.email && (
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#FFBE1B]" aria-hidden="true" />
                <a href={`mailto:${site.email}`} className="break-all hover:text-white">
                  {site.email}
                </a>
              </li>
            )}
            {site.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FFBE1B]" aria-hidden="true" />
                <span>{site.address}</span>
              </li>
            )}
            {site.office_hours && (
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#FFBE1B]" aria-hidden="true" />
                <span>{site.office_hours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row">
          <p>{site.footer_copyright}</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms &amp; Conditions
            </Link>
            <Link to="/admin" className="hover:text-white">
              Admin Console
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
