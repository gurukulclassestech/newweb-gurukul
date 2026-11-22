import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { usePageSeo } from '../lib/seo';
import { PageHeroBanner } from '../components/CommonUI';
import { EnquiryForm } from '../components/EnquiryForm';

export function ContactPage() {
  const { site } = useSite();
  usePageSeo(
    'contact',
    'Contact us',
    `Phone, email, address and office hours for ${site.institute_name}.`
  );

  const whatsappDigits = (site.whatsapp || site.phone || '').replace(/\D/g, '');
  const whatsappText =
    site.whatsapp_prefill_message ||
    `Hello ${site.institute_name}, I would like to know about admissions.`;

  const infoCards = [
    { icon: Phone, label: 'Phone', value: site.phone, href: site.phone ? `tel:${site.phone}` : '' },
    {
      icon: Mail,
      label: 'Email',
      value: site.email,
      href: site.email ? `mailto:${site.email}` : '',
    },
    { icon: MapPin, label: 'Address', value: site.address, href: '' },
    { icon: Clock, label: 'Office hours', value: site.office_hours, href: '' },
  ].filter((c) => Boolean(c.value));

  return (
    <>
      <PageHeroBanner
        eyebrow="Contact"
        title="Talk to the institute"
        description="Call us during office hours, send an email, or submit an enquiry and our team will get back to you."
      />

      <section className="shell grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {infoCards.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="surface p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  <Icon className="h-3.5 w-3.5 text-[hsl(var(--brand-blue))]" aria-hidden="true" />
                  <span>{label}</span>
                </p>
                <p className="mt-1.5 break-words text-sm font-medium text-[hsl(var(--brand-navy))]">
                  {href ? (
                    <a href={href} className="hover:underline">
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {whatsappDigits && (
              <a
                href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(whatsappText)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1EB958]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Chat on WhatsApp</span>
              </a>
            )}
            {site.map_link && (
              <a
                href={site.map_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--brand-navy))]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[hsl(var(--brand-navy))] transition hover:bg-[hsl(var(--brand-surface))]"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span>Open in Google Maps</span>
              </a>
            )}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-[hsl(var(--border))]">
            {site.map_embed_url ? (
              <iframe
                src={site.map_embed_url}
                title="Institute location map"
                className="h-[300px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center gap-2 bg-[hsl(var(--brand-surface))] p-8 text-center">
                <MapPin className="h-7 w-7 text-[hsl(var(--brand-navy))]/45" aria-hidden="true" />
                <p className="text-sm font-semibold text-[hsl(var(--brand-navy))]">
                  {site.address}
                </p>
                <p className="max-w-xs text-xs text-[hsl(var(--muted-foreground))]">
                  A verified map will appear here once the institute adds its Google Maps embed link in the admin console.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="surface p-5 sm:p-7">
          <h2 className="text-lg font-bold text-[hsl(var(--brand-navy))]">Send an enquiry</h2>
          <p className="mb-5 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Our admissions team usually responds within one working day.
          </p>
          <EnquiryForm source="contact-page" submitLabel="Send enquiry" />
        </div>
      </section>
    </>
  );
}
