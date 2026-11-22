import { Bed, CheckCircle2, Sun, type LucideIcon } from 'lucide-react';
import { DEFAULT_CAMPUS_SECTION } from '../data/defaults';
import { SectionHeader } from './CommonUI';
import { SafeImage } from './SafeImage';
import type { HomepageSection } from '../types';

const FACILITY_ICONS: Record<string, LucideIcon> = {
  bed: Bed,
  sun: Sun,
};

export function CampusSection({ section }: { section?: HomepageSection }) {
  const resolved = section || DEFAULT_CAMPUS_SECTION;
  const items =
    Array.isArray(resolved.items) && resolved.items.length > 0
      ? resolved.items
      : DEFAULT_CAMPUS_SECTION.items || [];

  return (
    <section className="border-y border-[hsl(var(--border))] bg-white py-14 sm:py-20">
      <div className="shell">
        <SectionHeader
          eyebrow={resolved.eyebrow || DEFAULT_CAMPUS_SECTION.eyebrow}
          title={resolved.title || DEFAULT_CAMPUS_SECTION.title}
          subtitle={resolved.subtitle || DEFAULT_CAMPUS_SECTION.subtitle}
        />

        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          {items
            .filter((item) => item && (item.title || item.description))
            .map((item, idx) => {
              const Icon =
                (item.icon && FACILITY_ICONS[item.icon]) || (idx === 0 ? Bed : Sun);
              const points = Array.isArray(item.points) ? item.points.filter(Boolean) : [];

              return (
                <article
                  key={`${item.title || 'facility'}-${idx}`}
                  className="surface surface-hover overflow-hidden"
                >
                  {item.image_url && (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[hsl(var(--brand-surface))]">
                      <SafeImage
                        src={item.image_url}
                        alt={item.title || 'Campus facility'}
                        className="h-full w-full"
                      />
                      <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[hsl(var(--brand-navy))] shadow-sm">
                        <Icon className="h-3.5 w-3.5 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
                        <span>{item.title}</span>
                      </span>
                    </div>
                  )}
                  <div className="p-6 sm:p-7">
                    <h3 className="text-xl font-bold text-[hsl(var(--brand-navy))]">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                        {item.description}
                      </p>
                    )}
                    {points.length > 0 && (
                      <ul className="mt-4 space-y-2.5">
                        {points.map((pt, ptIdx) => (
                          <li key={ptIdx} className="flex gap-2.5 text-sm text-[hsl(var(--foreground))]">
                            <CheckCircle2
                              className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand-blue))]"
                              aria-hidden="true"
                            />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              );
            })}
        </div>

        {(resolved.body ?? DEFAULT_CAMPUS_SECTION.body) !== '' && (
          <div className="mt-10 overflow-hidden rounded-2xl bg-[hsl(var(--brand-navy-deep))] p-6 text-white sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFBE1B]">
              Our commitment
            </p>
            <h3 className="display-face mt-2 text-2xl sm:text-[2rem]">
              Study with Enjoyment · Learn with Purpose · Achieve with Excellence
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/75">
              {resolved.body || DEFAULT_CAMPUS_SECTION.body}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
