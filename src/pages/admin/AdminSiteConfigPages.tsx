import React, { useEffect, useState } from 'react';
import { where } from 'firebase/firestore';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import {
  DEFAULT_CAMPUS_SECTION,
  DEFAULT_COURSE_CATEGORY_DESCRIPTIONS,
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_NAV_ITEMS,
  DEFAULT_SITE_SETTINGS,
} from '../../data/defaults';
import {
  createDocRecord,
  deleteDocRecord,
  fetchCollection,
  logAdminActivity,
  markModuleCustomized,
  setDocRecord,
  setSingleton,
  updateDocRecord,
} from '../../lib/firestoreApi';
import { usePageSeo } from '../../lib/seo';
import { ImageUploaderField } from '../../components/admin/ImageUploaderField';
import type {
  ApproachStep,
  CourseCategoryBlurb,
  HighlightStat,
  HomepageSection,
  NavItem,
  SectionSubItem,
  SiteSettings,
} from '../../types';

const INPUT_CLASS =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2 text-sm outline-none transition focus:border-[hsl(var(--brand-navy))] focus:ring-2 focus:ring-[hsl(var(--brand-navy))]/15';

type SettingsSectionMode =
  | 'settings'
  | 'about'
  | 'courses-page'
  | 'popup'
  | 'seo'
  | 'footer'
  | 'contact'
  | 'payment-settings';

function unwrapFirestoreError(err: unknown, fallback: string): string {
  let msg = err instanceof Error ? err.message : fallback;
  try {
    const parsed = JSON.parse(msg) as { error?: string };
    if (parsed?.error) msg = parsed.error;
  } catch {
    // Plain error message
  }
  return msg;
}

export function AdminSiteSettingsPage({ mode }: { mode: SettingsSectionMode }) {
  const { site, reloadSite } = useSite();
  const [form, setForm] = useState<SiteSettings>({ ...DEFAULT_SITE_SETTINGS, ...site });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const titles: Record<SettingsSectionMode, { title: string; subtitle: string }> = {
    settings: {
      title: 'Website Settings & Announcements',
      subtitle:
        'Update institute name, logo dimensions, favicon, header colours, and top announcement bar.',
    },
    about: {
      title: 'About Page Content',
      subtitle:
        'Edit hero intro, key highlight stats, founder story, and institute mission statement.',
    },
    'courses-page': {
      title: 'Courses Page & Teaching Approach',
      subtitle:
        'Customize Courses page header copy, programme motto badge, and the 4-step teaching approach.',
    },
    popup: {
      title: 'Admission Callback Popup',
      subtitle:
        'Configure the timed admission popup modal, fields shown, delay seconds, frequency, and optional banner.',
    },
    seo: {
      title: 'SEO Metadata',
      subtitle: 'Manage default page title, meta description, keywords, and Open Graph image.',
    },
    footer: {
      title: 'Footer & Legal Content',
      subtitle: 'Update footer description, copyright line, Privacy Policy, and Terms.',
    },
    contact: {
      title: 'Contact, WhatsApp & Social Links',
      subtitle:
        'Update phone, email, floating WhatsApp toggle & prefill message, address, Google Maps links, and social profiles.',
    },
    'payment-settings': {
      title: 'Payment & Fee Settings',
      subtitle:
        'Enable or hide fee instructions, UPI ID, payment QR code, and bank transfer details on the Admission page.',
    },
  };

  usePageSeo('admin', titles[mode].title);

  useEffect(() => {
    setForm({ ...DEFAULT_SITE_SETTINGS, ...site });
  }, [site]);

  const setField = <K extends keyof SiteSettings>(key: K, val: SiteSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSavedMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    setErrorMsg('');
    try {
      const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
      const reqField = (v: unknown, fallback: string, min: number, max: number) => {
        const cleaned = str(v, max);
        return cleaned.length >= min ? cleaned : fallback.slice(0, max);
      };

      const highlights: HighlightStat[] = (
        Array.isArray(form.about_highlights) ? form.about_highlights : []
      )
        .slice(0, 12)
        .map((h) => ({
          value: str(h?.value, 60),
          label: str(h?.label, 120),
        }))
        .filter((h) => h.value || h.label);

      const categoryDescriptions: CourseCategoryBlurb[] = (
        Array.isArray(form.courses_category_descriptions)
          ? form.courses_category_descriptions
          : DEFAULT_COURSE_CATEGORY_DESCRIPTIONS
      )
        .slice(0, 12)
        .map((c) => ({
          category: str(c?.category, 120),
          description: str(c?.description, 600),
        }))
        .filter((c) => c.category || c.description);

      const approachSteps: ApproachStep[] = (
        Array.isArray(form.courses_approach_steps) ? form.courses_approach_steps : []
      )
        .slice(0, 12)
        .map((s) => ({
          title: str(s?.title, 80),
          description: str(s?.description, 300),
        }))
        .filter((s) => s.title || s.description);

      const freq =
        form.popup_frequency === 'once' || form.popup_frequency === 'always'
          ? form.popup_frequency
          : 'session';

      const payload: Record<string, unknown> = {
        institute_name: reqField(form.institute_name, DEFAULT_SITE_SETTINGS.institute_name, 2, 120),
        tagline: str(form.tagline, 400),
        about_heading: str(form.about_heading, 200),
        about_intro: str(form.about_intro, 600),
        about_mission: str(form.about_mission, 400),
        about_story: str(form.about_story, 8000),
        about_highlights: highlights,
        courses_eyebrow: str(form.courses_eyebrow, 100),
        courses_title: str(form.courses_title, 200),
        courses_description: str(form.courses_description, 600),
        courses_badge: str(form.courses_badge, 160),
        courses_category_descriptions: categoryDescriptions,
        courses_approach_eyebrow: str(form.courses_approach_eyebrow, 100),
        courses_approach_title: str(form.courses_approach_title, 200),
        courses_approach_description: str(form.courses_approach_description, 600),
        courses_approach_steps: approachSteps,
        logo_url: str(form.logo_url, 1000),
        logo_width: str(form.logo_width || '90', 10),
        logo_height: str(form.logo_height || '55', 10),
        favicon_url: str(form.favicon_url, 1000),
        phone: reqField(form.phone, DEFAULT_SITE_SETTINGS.phone, 5, 30),
        email: reqField(form.email, DEFAULT_SITE_SETTINGS.email, 5, 120),
        whatsapp: str(form.whatsapp, 30),
        whatsapp_float_enabled: form.whatsapp_float_enabled !== false,
        whatsapp_prefill_message: str(form.whatsapp_prefill_message, 300),
        address: reqField(form.address, DEFAULT_SITE_SETTINGS.address, 3, 300),
        map_embed_url: str(form.map_embed_url, 1000),
        map_link: str(form.map_link, 1000),
        office_hours: str(form.office_hours, 160),
        announcement_enabled: Boolean(form.announcement_enabled),
        announcement_text: str(form.announcement_text, 300),
        announcement_bg_color: str(form.announcement_bg_color, 20),
        announcement_text_color: str(form.announcement_text_color, 20),
        header_bg_color: str(form.header_bg_color, 20),
        header_text_color: str(form.header_text_color, 20),
        footer_about: str(form.footer_about, 400),
        footer_copyright: str(form.footer_copyright, 200),
        facebook_url: str(form.facebook_url, 500),
        instagram_url: str(form.instagram_url, 500),
        youtube_url: str(form.youtube_url, 500),
        twitter_url: str(form.twitter_url, 500),
        seo_title: str(form.seo_title, 160),
        seo_description: str(form.seo_description, 320),
        seo_keywords: str(form.seo_keywords, 300),
        og_image_url: str(form.og_image_url, 1000),
        popup_enabled: Boolean(form.popup_enabled),
        popup_title: str(form.popup_title, 160),
        popup_body: str(form.popup_body, 500),
        popup_cta_label: str(form.popup_cta_label, 60),
        popup_cta_link: str(form.popup_cta_link, 200),
        popup_submit_label: str(form.popup_submit_label, 80),
        popup_image_url: str(form.popup_image_url, 1000),
        popup_delay_seconds: Math.max(0, Math.min(120, Number(form.popup_delay_seconds) || 5)),
        popup_frequency: freq,
        popup_show_parent_name: form.popup_show_parent_name !== false,
        popup_show_email: form.popup_show_email !== false,
        popup_show_class: form.popup_show_class !== false,
        popup_show_course: form.popup_show_course !== false,
        popup_show_batch: form.popup_show_batch !== false,
        popup_show_message: Boolean(form.popup_show_message),
        payments_enabled: Boolean(form.payments_enabled),
        payment_fee_label: str(form.payment_fee_label, 120),
        upi_id: str(form.upi_id, 120),
        payment_qr_url: str(form.payment_qr_url, 1000),
        bank_details: str(form.bank_details, 600),
        payment_instructions: str(form.payment_instructions, 600),
        header_cta_enabled: form.header_cta_enabled !== false,
        header_cta_label: str(form.header_cta_label || 'Apply Now', 60),
        header_cta_link: str(form.header_cta_link || '/admission', 200),
        float_apply_enabled: form.float_apply_enabled !== false,
        float_apply_label: str(form.float_apply_label || 'Apply Now', 60),
        float_apply_link: str(form.float_apply_link || '/admission', 200),
        customized_modules: Array.isArray(form.customized_modules)
          ? form.customized_modules.filter((m): m is string => typeof m === 'string').slice(0, 30)
          : Array.isArray(site.customized_modules)
            ? site.customized_modules.filter((m): m is string => typeof m === 'string').slice(0, 30)
            : [],
        privacy_content: str(form.privacy_content, 5000),
        terms_content: str(form.terms_content, 5000),
      };

      await setSingleton('site_settings', 'main', payload);
      await logAdminActivity('update', 'site_settings', `Updated ${titles[mode].title}`);
      await reloadSite();
      setSavedMsg('Changes saved to Firestore and published live.');
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not save settings.'));
    } finally {
      setSaving(false);
    }
  };

  const highlightsList = Array.isArray(form.about_highlights) ? form.about_highlights : [];
  const categoryDescriptionsList = Array.isArray(form.courses_category_descriptions)
    ? form.courses_category_descriptions
    : DEFAULT_COURSE_CATEGORY_DESCRIPTIONS;
  const approachList = Array.isArray(form.courses_approach_steps)
    ? form.courses_approach_steps
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[hsl(var(--brand-navy))] sm:text-2xl">
          {titles[mode].title}
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {titles[mode].subtitle}
        </p>
      </div>

      <form onSubmit={handleSave} className="surface space-y-5 p-5 sm:p-7">
        {mode === 'settings' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="s_name" className="mb-1 block text-xs font-semibold">
                  Institute name
                </label>
                <input
                  id="s_name"
                  className={INPUT_CLASS}
                  value={form.institute_name}
                  onChange={(e) => setField('institute_name', e.target.value)}
                  minLength={2}
                  maxLength={120}
                  required
                />
              </div>
              <div>
                <label htmlFor="s_tagline" className="mb-1 block text-xs font-semibold">
                  Tagline
                </label>
                <input
                  id="s_tagline"
                  className={INPUT_CLASS}
                  value={form.tagline}
                  onChange={(e) => setField('tagline', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUploaderField
                id="s_logo"
                label="Institute Logo"
                value={form.logo_url}
                onChange={(url) => setField('logo_url', url)}
                folder="branding"
              />
              <ImageUploaderField
                id="s_favicon"
                label="Site Favicon"
                value={form.favicon_url}
                onChange={(url) => setField('favicon_url', url)}
                folder="branding"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="s_lw" className="mb-1 block text-xs font-semibold">
                  Logo width (px)
                </label>
                <input
                  id="s_lw"
                  className={INPUT_CLASS}
                  value={form.logo_width}
                  onChange={(e) => setField('logo_width', e.target.value)}
                  placeholder="90"
                />
              </div>
              <div>
                <label htmlFor="s_lh" className="mb-1 block text-xs font-semibold">
                  Logo height (px)
                </label>
                <input
                  id="s_lh"
                  className={INPUT_CLASS}
                  value={form.logo_height}
                  onChange={(e) => setField('logo_height', e.target.value)}
                  placeholder="55"
                />
              </div>
              <div>
                <label htmlFor="s_hdr_bg" className="mb-1 block text-xs font-semibold">
                  Header background
                </label>
                <input
                  id="s_hdr_bg"
                  className={INPUT_CLASS}
                  value={form.header_bg_color}
                  onChange={(e) => setField('header_bg_color', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="s_hdr_fg" className="mb-1 block text-xs font-semibold">
                  Header text color
                </label>
                <input
                  id="s_hdr_fg"
                  className={INPUT_CLASS}
                  value={form.header_text_color}
                  onChange={(e) => setField('header_text_color', e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-[hsl(var(--border))] pt-4">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-[hsl(var(--brand-navy))]">
                <input
                  type="checkbox"
                  checked={Boolean(form.announcement_enabled)}
                  onChange={(e) => setField('announcement_enabled', e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <span>Show top announcement bar</span>
              </label>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="s_ann_text" className="mb-1 block text-xs font-semibold">
                    Announcement text
                  </label>
                  <input
                    id="s_ann_text"
                    className={INPUT_CLASS}
                    value={form.announcement_text}
                    onChange={(e) => setField('announcement_text', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="s_ann_bg" className="mb-1 block text-xs font-semibold">
                    Announcement background
                  </label>
                  <input
                    id="s_ann_bg"
                    className={INPUT_CLASS}
                    value={form.announcement_bg_color}
                    onChange={(e) => setField('announcement_bg_color', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="s_ann_fg" className="mb-1 block text-xs font-semibold">
                    Announcement text color
                  </label>
                  <input
                    id="s_ann_fg"
                    className={INPUT_CLASS}
                    value={form.announcement_text_color}
                    onChange={(e) => setField('announcement_text_color', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[hsl(var(--border))] pt-4">
              <h2 className="mb-3 text-sm font-bold text-[hsl(var(--brand-navy))]">
                Header &amp; Floating Action Buttons
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))]/40 p-4">
                  <label className="flex items-center gap-2.5 text-sm font-semibold text-[hsl(var(--brand-navy))]">
                    <input
                      type="checkbox"
                      checked={form.header_cta_enabled !== false}
                      onChange={(e) => setField('header_cta_enabled', e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    <span>Show Header CTA Button</span>
                  </label>
                  <div>
                    <label htmlFor="s_hcta_lbl" className="mb-1 block text-xs font-semibold">
                      Header button label
                    </label>
                    <input
                      id="s_hcta_lbl"
                      className={INPUT_CLASS}
                      maxLength={60}
                      value={form.header_cta_label ?? 'Apply Now'}
                      onChange={(e) => setField('header_cta_label', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="s_hcta_lnk" className="mb-1 block text-xs font-semibold">
                      Header button link
                    </label>
                    <input
                      id="s_hcta_lnk"
                      className={INPUT_CLASS}
                      maxLength={200}
                      value={form.header_cta_link ?? '/admission'}
                      onChange={(e) => setField('header_cta_link', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))]/40 p-4">
                  <label className="flex items-center gap-2.5 text-sm font-semibold text-[hsl(var(--brand-navy))]">
                    <input
                      type="checkbox"
                      checked={form.float_apply_enabled !== false}
                      onChange={(e) => setField('float_apply_enabled', e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    <span>Show Floating Apply Pill Button</span>
                  </label>
                  <div>
                    <label htmlFor="s_fcta_lbl" className="mb-1 block text-xs font-semibold">
                      Floating button label
                    </label>
                    <input
                      id="s_fcta_lbl"
                      className={INPUT_CLASS}
                      maxLength={60}
                      value={form.float_apply_label ?? 'Apply Now'}
                      onChange={(e) => setField('float_apply_label', e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="s_fcta_lnk" className="mb-1 block text-xs font-semibold">
                      Floating button link
                    </label>
                    <input
                      id="s_fcta_lnk"
                      className={INPUT_CLASS}
                      maxLength={200}
                      value={form.float_apply_link ?? '/admission'}
                      onChange={(e) => setField('float_apply_link', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {mode === 'about' && (
          <>
            <div>
              <label htmlFor="a_head" className="mb-1 block text-xs font-semibold">
                About page heading
              </label>
              <input
                id="a_head"
                className={INPUT_CLASS}
                value={form.about_heading}
                onChange={(e) => setField('about_heading', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="a_intro" className="mb-1 block text-xs font-semibold">
                About page hero summary
              </label>
              <textarea
                id="a_intro"
                rows={3}
                className={INPUT_CLASS}
                value={form.about_intro}
                onChange={(e) => setField('about_intro', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="a_mission" className="mb-1 block text-xs font-semibold">
                Mission statement (dark navy quote band)
              </label>
              <input
                id="a_mission"
                className={INPUT_CLASS}
                value={form.about_mission}
                onChange={(e) => setField('about_mission', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="a_story" className="mb-1 block text-xs font-semibold">
                Full founder story &amp; philosophy (supports **bold** and blank-line paragraphs)
              </label>
              <textarea
                id="a_story"
                rows={12}
                className={INPUT_CLASS}
                value={form.about_story}
                onChange={(e) => setField('about_story', e.target.value)}
              />
            </div>

            <div className="border-t border-[hsl(var(--border))] pt-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[hsl(var(--brand-navy))]">
                    Highlight stats strip ({highlightsList.length}/12)
                  </h2>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Shown as the 4 key milestone cards below the About banner.
                  </p>
                </div>
                {highlightsList.length < 12 && (
                  <button
                    type="button"
                    onClick={() =>
                      setField('about_highlights', [
                        ...highlightsList,
                        { value: '', label: '' },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-surface))]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add stat</span>
                  </button>
                )}
              </div>
              <div className="space-y-2.5">
                {highlightsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))]/50 p-3 sm:grid-cols-[1fr_1.4fr_auto] sm:items-center"
                  >
                    <input
                      className={INPUT_CLASS}
                      placeholder="Value (e.g. AIR 8)"
                      value={item.value}
                      onChange={(e) => {
                        const next = [...highlightsList];
                        next[idx] = { ...next[idx], value: e.target.value };
                        setField('about_highlights', next);
                      }}
                    />
                    <input
                      className={INPUT_CLASS}
                      placeholder="Label (e.g. JEE Advanced General)"
                      value={item.label}
                      onChange={(e) => {
                        const next = [...highlightsList];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setField('about_highlights', next);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setField(
                          'about_highlights',
                          highlightsList.filter((_, i) => i !== idx)
                        )
                      }
                      aria-label="Remove stat"
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === 'courses-page' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cp_eyebrow" className="mb-1 block text-xs font-semibold">
                  Hero eyebrow
                </label>
                <input
                  id="cp_eyebrow"
                  className={INPUT_CLASS}
                  value={form.courses_eyebrow}
                  onChange={(e) => setField('courses_eyebrow', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cp_badge" className="mb-1 block text-xs font-semibold">
                  Hero motto badge
                </label>
                <input
                  id="cp_badge"
                  className={INPUT_CLASS}
                  value={form.courses_badge}
                  onChange={(e) => setField('courses_badge', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="cp_title" className="mb-1 block text-xs font-semibold">
                  Courses page title
                </label>
                <input
                  id="cp_title"
                  className={INPUT_CLASS}
                  value={form.courses_title}
                  onChange={(e) => setField('courses_title', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="cp_desc" className="mb-1 block text-xs font-semibold">
                  Courses page description
                </label>
                <textarea
                  id="cp_desc"
                  rows={3}
                  className={INPUT_CLASS}
                  value={form.courses_description}
                  onChange={(e) => setField('courses_description', e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-[hsl(var(--border))] pt-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-[hsl(var(--brand-navy))]">
                    Programme Category Descriptions ({categoryDescriptionsList.length}/12)
                  </h2>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Displayed in the numbered category header cards on the public Courses page.
                  </p>
                </div>
                {categoryDescriptionsList.length < 12 && (
                  <button
                    type="button"
                    onClick={() =>
                      setField('courses_category_descriptions', [
                        ...categoryDescriptionsList,
                        { category: '', description: '' },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-surface))]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add category note</span>
                  </button>
                )}
              </div>
              <div className="space-y-2.5">
                {categoryDescriptionsList.map((entry, idx) => (
                  <div
                    key={idx}
                    className="grid gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))]/50 p-3 sm:grid-cols-[0.85fr_1.45fr_auto] sm:items-start"
                  >
                    <input
                      className={INPUT_CLASS}
                      placeholder="Category name (must match course category)"
                      value={entry.category}
                      onChange={(e) => {
                        const next = [...categoryDescriptionsList];
                        next[idx] = { ...next[idx], category: e.target.value };
                        setField('courses_category_descriptions', next);
                      }}
                    />
                    <textarea
                      rows={2}
                      className={INPUT_CLASS}
                      placeholder="Short category overview paragraph"
                      value={entry.description}
                      onChange={(e) => {
                        const next = [...categoryDescriptionsList];
                        next[idx] = { ...next[idx], description: e.target.value };
                        setField('courses_category_descriptions', next);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setField(
                          'courses_category_descriptions',
                          categoryDescriptionsList.filter((_, i) => i !== idx)
                        )
                      }
                      aria-label="Remove category note"
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[hsl(var(--border))] pt-4">
              <h2 className="text-sm font-bold text-[hsl(var(--brand-navy))]">
                Bottom Learning Approach Block
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="ca_eye" className="mb-1 block text-xs font-semibold">
                    Approach eyebrow
                  </label>
                  <input
                    id="ca_eye"
                    className={INPUT_CLASS}
                    value={form.courses_approach_eyebrow}
                    onChange={(e) => setField('courses_approach_eyebrow', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="ca_title" className="mb-1 block text-xs font-semibold">
                    Approach title
                  </label>
                  <input
                    id="ca_title"
                    className={INPUT_CLASS}
                    value={form.courses_approach_title}
                    onChange={(e) => setField('courses_approach_title', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="ca_desc" className="mb-1 block text-xs font-semibold">
                    Approach subtitle
                  </label>
                  <textarea
                    id="ca_desc"
                    rows={2}
                    className={INPUT_CLASS}
                    value={form.courses_approach_description}
                    onChange={(e) => setField('courses_approach_description', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Approach steps ({approachList.length}/12)
                  </span>
                  {approachList.length < 12 && (
                    <button
                      type="button"
                      onClick={() =>
                        setField('courses_approach_steps', [
                          ...approachList,
                          { title: '', description: '' },
                        ])
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--brand-navy))]"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Add step</span>
                    </button>
                  )}
                </div>
                <div className="space-y-2.5">
                  {approachList.map((step, idx) => (
                    <div
                      key={idx}
                      className="grid gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))]/50 p-3 sm:grid-cols-[0.7fr_1.5fr_auto] sm:items-start"
                    >
                      <input
                        className={INPUT_CLASS}
                        placeholder="Step title (e.g. Learn)"
                        value={step.title}
                        onChange={(e) => {
                          const next = [...approachList];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setField('courses_approach_steps', next);
                        }}
                      />
                      <textarea
                        rows={2}
                        className={INPUT_CLASS}
                        placeholder="Step explanation"
                        value={step.description}
                        onChange={(e) => {
                          const next = [...approachList];
                          next[idx] = { ...next[idx], description: e.target.value };
                          setField('courses_approach_steps', next);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setField(
                            'courses_approach_steps',
                            approachList.filter((_, i) => i !== idx)
                          )
                        }
                        aria-label="Remove step"
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {mode === 'popup' && (
          <>
            <label className="flex items-center gap-2.5 text-sm font-semibold text-[hsl(var(--brand-navy))]">
              <input
                type="checkbox"
                checked={Boolean(form.popup_enabled)}
                onChange={(e) => setField('popup_enabled', e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <span>Enable admission callback popup after visitor scroll &amp; dwell</span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="p_title" className="mb-1 block text-xs font-semibold">
                  Popup title
                </label>
                <input
                  id="p_title"
                  className={INPUT_CLASS}
                  maxLength={160}
                  value={form.popup_title}
                  onChange={(e) => setField('popup_title', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="p_body" className="mb-1 block text-xs font-semibold">
                  Popup message
                </label>
                <textarea
                  id="p_body"
                  rows={3}
                  className={INPUT_CLASS}
                  maxLength={500}
                  value={form.popup_body}
                  onChange={(e) => setField('popup_body', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="p_submit" className="mb-1 block text-xs font-semibold">
                  Form submit button label
                </label>
                <input
                  id="p_submit"
                  className={INPUT_CLASS}
                  maxLength={80}
                  value={form.popup_submit_label}
                  onChange={(e) => setField('popup_submit_label', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="p_delay" className="mb-1 block text-xs font-semibold">
                  Delay before showing (seconds)
                </label>
                <input
                  id="p_delay"
                  type="number"
                  min={1}
                  max={120}
                  className={INPUT_CLASS}
                  value={form.popup_delay_seconds ?? 5}
                  onChange={(e) =>
                    setField('popup_delay_seconds', Number(e.target.value) || 5)
                  }
                />
              </div>
              <div>
                <label htmlFor="p_freq" className="mb-1 block text-xs font-semibold">
                  Display frequency
                </label>
                <select
                  id="p_freq"
                  className={INPUT_CLASS}
                  value={form.popup_frequency || 'session'}
                  onChange={(e) =>
                    setField(
                      'popup_frequency',
                      e.target.value as 'session' | 'once' | 'always'
                    )
                  }
                >
                  <option value="session">Once per browser session</option>
                  <option value="once">Once per device</option>
                  <option value="always">Show on every page visit</option>
                </select>
              </div>
              <div>
                <label htmlFor="p_cta" className="mb-1 block text-xs font-semibold">
                  Footer link label
                </label>
                <input
                  id="p_cta"
                  className={INPUT_CLASS}
                  maxLength={60}
                  value={form.popup_cta_label}
                  onChange={(e) => setField('popup_cta_label', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="p_link" className="mb-1 block text-xs font-semibold">
                  Footer link URL
                </label>
                <input
                  id="p_link"
                  className={INPUT_CLASS}
                  maxLength={200}
                  value={form.popup_cta_link}
                  onChange={(e) => setField('popup_cta_link', e.target.value)}
                />
              </div>
            </div>

            <ImageUploaderField
              id="p_img"
              label="Optional popup banner image"
              value={form.popup_image_url}
              onChange={(url) => setField('popup_image_url', url)}
              folder="popup"
            />

            <div className="border-t border-[hsl(var(--border))] pt-4">
              <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Fields shown inside popup form
              </p>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {[
                  { key: 'popup_show_parent_name' as const, label: 'Parent name' },
                  { key: 'popup_show_email' as const, label: 'Email address' },
                  { key: 'popup_show_class' as const, label: 'Class / Standard' },
                  { key: 'popup_show_course' as const, label: 'Course selection' },
                  { key: 'popup_show_batch' as const, label: 'Preferred batch' },
                  { key: 'popup_show_message' as const, label: 'Message box' },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--brand-navy))]"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(form[opt.key])}
                      onChange={(e) => setField(opt.key, e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === 'seo' && (
          <>
            <div>
              <label htmlFor="seo_t" className="mb-1 block text-xs font-semibold">
                Default SEO title
              </label>
              <input
                id="seo_t"
                className={INPUT_CLASS}
                value={form.seo_title}
                onChange={(e) => setField('seo_title', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="seo_d" className="mb-1 block text-xs font-semibold">
                Meta description
              </label>
              <textarea
                id="seo_d"
                rows={3}
                className={INPUT_CLASS}
                value={form.seo_description}
                onChange={(e) => setField('seo_description', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="seo_k" className="mb-1 block text-xs font-semibold">
                SEO keywords (comma separated)
              </label>
              <input
                id="seo_k"
                className={INPUT_CLASS}
                value={form.seo_keywords}
                onChange={(e) => setField('seo_keywords', e.target.value)}
              />
            </div>
            <ImageUploaderField
              id="seo_og"
              label="Default Open Graph social share image"
              value={form.og_image_url}
              onChange={(url) => setField('og_image_url', url)}
              folder="seo"
            />
          </>
        )}

        {mode === 'footer' && (
          <>
            <div>
              <label htmlFor="f_about" className="mb-1 block text-xs font-semibold">
                Footer institute summary
              </label>
              <textarea
                id="f_about"
                rows={3}
                className={INPUT_CLASS}
                value={form.footer_about}
                onChange={(e) => setField('footer_about', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="f_copy" className="mb-1 block text-xs font-semibold">
                Copyright text
              </label>
              <input
                id="f_copy"
                className={INPUT_CLASS}
                value={form.footer_copyright}
                onChange={(e) => setField('footer_copyright', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="f_priv" className="mb-1 block text-xs font-semibold">
                Privacy Policy content
              </label>
              <textarea
                id="f_priv"
                rows={5}
                className={INPUT_CLASS}
                value={form.privacy_content}
                onChange={(e) => setField('privacy_content', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="f_terms" className="mb-1 block text-xs font-semibold">
                Terms &amp; Conditions content
              </label>
              <textarea
                id="f_terms"
                rows={5}
                className={INPUT_CLASS}
                value={form.terms_content}
                onChange={(e) => setField('terms_content', e.target.value)}
              />
            </div>
          </>
        )}

        {mode === 'contact' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="c_phone" className="mb-1 block text-xs font-semibold">
                  Phone number
                </label>
                <input
                  id="c_phone"
                  className={INPUT_CLASS}
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  minLength={5}
                  maxLength={30}
                  required
                />
              </div>
              <div>
                <label htmlFor="c_wa" className="mb-1 block text-xs font-semibold">
                  WhatsApp number
                </label>
                <input
                  id="c_wa"
                  className={INPUT_CLASS}
                  value={form.whatsapp}
                  onChange={(e) => setField('whatsapp', e.target.value)}
                  maxLength={30}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-[hsl(var(--brand-navy))]">
                  <input
                    type="checkbox"
                    checked={form.whatsapp_float_enabled !== false}
                    onChange={(e) => setField('whatsapp_float_enabled', e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <span>Show floating WhatsApp chat button on all public pages</span>
                </label>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c_wa_msg" className="mb-1 block text-xs font-semibold">
                  WhatsApp pre-filled greeting message
                </label>
                <input
                  id="c_wa_msg"
                  className={INPUT_CLASS}
                  maxLength={300}
                  value={form.whatsapp_prefill_message}
                  onChange={(e) => setField('whatsapp_prefill_message', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="c_email" className="mb-1 block text-xs font-semibold">
                  Email address
                </label>
                <input
                  id="c_email"
                  type="email"
                  className={INPUT_CLASS}
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  minLength={5}
                  maxLength={120}
                  required
                />
              </div>
              <div>
                <label htmlFor="c_hours" className="mb-1 block text-xs font-semibold">
                  Office hours
                </label>
                <input
                  id="c_hours"
                  className={INPUT_CLASS}
                  value={form.office_hours}
                  onChange={(e) => setField('office_hours', e.target.value)}
                  maxLength={160}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c_addr" className="mb-1 block text-xs font-semibold">
                  Institute address
                </label>
                <input
                  id="c_addr"
                  className={INPUT_CLASS}
                  value={form.address}
                  onChange={(e) => setField('address', e.target.value)}
                  minLength={3}
                  maxLength={300}
                  required
                />
              </div>
              <div>
                <label htmlFor="c_map" className="mb-1 block text-xs font-semibold">
                  Google Maps embed URL (iframe src)
                </label>
                <input
                  id="c_map"
                  className={INPUT_CLASS}
                  value={form.map_embed_url}
                  onChange={(e) => setField('map_embed_url', e.target.value)}
                  placeholder="https://www.google.com/maps/embed?..."
                />
              </div>
              <div>
                <label htmlFor="c_map_link" className="mb-1 block text-xs font-semibold">
                  Google Maps share link (Open in Maps)
                </label>
                <input
                  id="c_map_link"
                  className={INPUT_CLASS}
                  value={form.map_link}
                  onChange={(e) => setField('map_link', e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>
              <div>
                <label htmlFor="c_fb" className="mb-1 block text-xs font-semibold">
                  Facebook URL
                </label>
                <input
                  id="c_fb"
                  className={INPUT_CLASS}
                  value={form.facebook_url}
                  onChange={(e) => setField('facebook_url', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="c_ig" className="mb-1 block text-xs font-semibold">
                  Instagram URL
                </label>
                <input
                  id="c_ig"
                  className={INPUT_CLASS}
                  value={form.instagram_url}
                  onChange={(e) => setField('instagram_url', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="c_yt" className="mb-1 block text-xs font-semibold">
                  YouTube URL
                </label>
                <input
                  id="c_yt"
                  className={INPUT_CLASS}
                  value={form.youtube_url}
                  onChange={(e) => setField('youtube_url', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="c_tw" className="mb-1 block text-xs font-semibold">
                  X / Twitter URL
                </label>
                <input
                  id="c_tw"
                  className={INPUT_CLASS}
                  value={form.twitter_url}
                  onChange={(e) => setField('twitter_url', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {mode === 'payment-settings' && (
          <div className="space-y-4">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-[hsl(var(--brand-navy))]">
              <input
                type="checkbox"
                checked={Boolean(form.payments_enabled)}
                onChange={(e) => setField('payments_enabled', e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <span>Show payment / fee section on the Admission page</span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pay_lbl" className="mb-1 block text-xs font-semibold">
                  Payment section heading
                </label>
                <input
                  id="pay_lbl"
                  className={INPUT_CLASS}
                  value={form.payment_fee_label}
                  onChange={(e) => setField('payment_fee_label', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="pay_upi" className="mb-1 block text-xs font-semibold">
                  UPI ID
                </label>
                <input
                  id="pay_upi"
                  className={INPUT_CLASS}
                  value={form.upi_id}
                  onChange={(e) => setField('upi_id', e.target.value)}
                  placeholder="gurukul@upi"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="pay_inst" className="mb-1 block text-xs font-semibold">
                  Instructions for parents / students
                </label>
                <textarea
                  id="pay_inst"
                  rows={3}
                  className={INPUT_CLASS}
                  value={form.payment_instructions}
                  onChange={(e) => setField('payment_instructions', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="pay_bank" className="mb-1 block text-xs font-semibold">
                  Bank account details
                </label>
                <textarea
                  id="pay_bank"
                  rows={3}
                  className={INPUT_CLASS}
                  value={form.bank_details}
                  onChange={(e) => setField('bank_details', e.target.value)}
                />
              </div>
            </div>
            <ImageUploaderField
              id="pay_qr"
              label="UPI QR Code Image"
              value={form.payment_qr_url}
              onChange={(url) => setField('payment_qr_url', url)}
              folder="payments"
            />
          </div>
        )}

        {savedMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>{savedMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--brand-navy))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            <span>Save changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function AdminNavigationPage() {
  const { site, reloadSite } = useSite();
  usePageSeo('admin', 'Header & Navigation');

  const [dbItems, setDbItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [editing, setEditing] = useState<NavItem | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    label: '',
    path: '',
    location: 'header' as 'header' | 'footer',
    display_order: 0,
    open_in_new_tab: false,
  });

  const isCustomized = Boolean(site.customized_modules?.includes('nav_items'));
  const items = isCustomized
    ? dbItems
    : dbItems.length > 0
      ? dbItems
      : DEFAULT_NAV_ITEMS;

  const load = async () => {
    setLoading(true);
    try {
      const rows = await fetchCollection<NavItem>(
        'nav_items',
        [where('location', 'in', ['header', 'footer'])],
        'display_order',
        'asc'
      );
      setDbItems(rows);
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not load navigation links.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ensureMaterialized = async (): Promise<NavItem[]> => {
    if (dbItems.length > 0 || isCustomized) {
      await markModuleCustomized('nav_items');
      return dbItems;
    }
    for (const nav of DEFAULT_NAV_ITEMS) {
      await setDocRecord('nav_items', nav.id, {
        label: nav.label.slice(0, 60),
        path: nav.path.slice(0, 200),
        location: nav.location,
        display_order: nav.display_order,
        open_in_new_tab: Boolean(nav.open_in_new_tab),
      });
    }
    await markModuleCustomized('nav_items');
    return DEFAULT_NAV_ITEMS;
  };

  const restoreDefaults = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      const current = await fetchCollection<NavItem>('nav_items');
      const defaultIds = new Set(DEFAULT_NAV_ITEMS.map((d) => d.id));
      for (const row of current) {
        if (!defaultIds.has(row.id)) {
          await deleteDocRecord('nav_items', row.id);
        }
      }
      for (const nav of DEFAULT_NAV_ITEMS) {
        await setDocRecord('nav_items', nav.id, {
          label: nav.label.slice(0, 60),
          path: nav.path.slice(0, 200),
          location: nav.location,
          display_order: nav.display_order,
          open_in_new_tab: Boolean(nav.open_in_new_tab),
        });
      }
      await markModuleCustomized('nav_items');
      await logAdminActivity('update', 'nav_items', 'Restored default navigation links');
      setConfirmRestore(false);
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not restore default navigation links.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = form.label.trim().slice(0, 60);
    const navPath = form.path.trim().slice(0, 200);
    if (!label || !navPath) return;
    setSaving(true);
    setErrorMsg('');
    try {
      await ensureMaterialized();
      const payload = {
        label,
        path: navPath,
        location: form.location,
        display_order: Number(form.display_order) || 0,
        open_in_new_tab: Boolean(form.open_in_new_tab),
      };
      if (editing) {
        await updateDocRecord('nav_items', editing.id, payload);
        await logAdminActivity('update', 'nav_items', `Updated link "${label}"`);
      } else {
        await createDocRecord('nav_items', payload);
        await logAdminActivity('create', 'nav_items', `Added link "${label}"`);
      }
      setEditing(null);
      setForm({ label: '', path: '', location: 'header', display_order: 0, open_in_new_tab: false });
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not save navigation link.'));
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (item: NavItem, dir: -1 | 1) => {
    setErrorMsg('');
    try {
      const list = (await ensureMaterialized()).filter((n) => n.location === item.location);
      list.sort((a, b) => a.display_order - b.display_order);
      const idx = list.findIndex((n) => n.id === item.id);
      const swapIdx = idx + dir;
      if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return;
      const other = list[swapIdx];
      await updateDocRecord('nav_items', item.id, { display_order: other.display_order });
      await updateDocRecord('nav_items', other.id, { display_order: item.display_order });
      await logAdminActivity('update', 'nav_items', `Reordered link "${item.label}"`);
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not reorder navigation link.'));
    }
  };

  const handleDelete = async (item: NavItem) => {
    setErrorMsg('');
    try {
      await ensureMaterialized();
      await deleteDocRecord('nav_items', item.id);
      await logAdminActivity('delete', 'nav_items', `Removed link "${item.label}"`);
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not delete navigation link.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--brand-navy))] sm:text-2xl">
            Header &amp; Navigation
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Edit, reorder, add, or remove links shown in the top navigation bar and footer.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmRestore(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-3.5 py-2 text-xs font-semibold text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-surface))]"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Restore defaults</span>
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="surface space-y-3 p-5">
        <div className="grid gap-3 sm:grid-cols-5 sm:items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold">Label</label>
            <input
              className={INPUT_CLASS}
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="e.g. Courses"
              minLength={1}
              maxLength={60}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">Path / URL</label>
            <input
              className={INPUT_CLASS}
              value={form.path}
              onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))}
              placeholder="/courses"
              minLength={1}
              maxLength={200}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">Location</label>
            <select
              className={INPUT_CLASS}
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value as 'header' | 'footer' }))
              }
            >
              <option value="header">Header</option>
              <option value="footer">Footer</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold">Order</label>
            <input
              type="number"
              className={INPUT_CLASS}
              value={form.display_order}
              onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[hsl(var(--brand-navy))] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{editing ? 'Update' : 'Add link'}</span>
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({
                    label: '',
                    path: '',
                    location: 'header',
                    display_order: 0,
                    open_in_new_tab: false,
                  });
                }}
                className="rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={Boolean(form.open_in_new_tab)}
            onChange={(e) => setForm((f) => ({ ...f, open_in_new_tab: e.target.checked }))}
            className="h-4 w-4 rounded"
          />
          <span>Open link in new browser tab</span>
        </label>
      </form>

      <div className="surface overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-[hsl(var(--muted-foreground))]">Loading navigation…</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            No navigation links configured. Add a link above or click “Restore defaults”.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))] text-xs uppercase text-[hsl(var(--muted-foreground))]">
              <tr>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Path</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 tabular-nums">Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {items.map((item) => {
                const sameLoc = items
                  .filter((n) => n.location === item.location)
                  .sort((a, b) => a.display_order - b.display_order);
                const locIdx = sameLoc.findIndex((n) => n.id === item.id);
                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-semibold text-[hsl(var(--brand-navy))]">
                      {item.label}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-foreground))]">
                      {item.path}
                    </td>
                    <td className="px-4 py-3 capitalize">{item.location}</td>
                    <td className="px-4 py-3 tabular-nums">{item.display_order}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          disabled={locIdx <= 0}
                          onClick={() => handleMove(item, -1)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[hsl(var(--brand-navy))] disabled:opacity-30"
                          aria-label={`Move ${item.label} up`}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={locIdx < 0 || locIdx >= sameLoc.length - 1}
                          onClick={() => handleMove(item, 1)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[hsl(var(--brand-navy))] disabled:opacity-30"
                          aria-label={`Move ${item.label} down`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(item);
                            setForm({
                              label: item.label,
                              path: item.path,
                              location: item.location,
                              display_order: item.display_order,
                              open_in_new_tab: Boolean(item.open_in_new_tab),
                            });
                          }}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[hsl(var(--brand-navy))]"
                          aria-label={`Edit ${item.label}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="rounded p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                          aria-label={`Delete ${item.label}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {confirmRestore && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/60 p-4"
        >
          <div className="surface w-full max-w-md space-y-4 p-6">
            <h2 className="text-base font-bold text-[hsl(var(--brand-navy))]">
              Restore default navigation?
            </h2>
            <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              This will restore the default header and footer links for Giri Sir&apos;s Gurukul
              Classes and remove any custom navigation links.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRestore(false)}
                className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={restoreDefaults}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--brand-navy))] px-4 py-2 text-xs font-semibold text-white"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Restore defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function cleanSubItems(items: SectionSubItem[] | undefined): SectionSubItem[] {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 20).map((it) => {
    const cleaned: SectionSubItem = {};
    if (it.title) cleaned.title = String(it.title).trim().slice(0, 200);
    if (it.description) cleaned.description = String(it.description).trim().slice(0, 1000);
    if (it.value) cleaned.value = String(it.value).trim().slice(0, 80);
    if (it.label) cleaned.label = String(it.label).trim().slice(0, 120);
    if (it.icon) cleaned.icon = String(it.icon).trim().slice(0, 40);
    if (it.image_url) cleaned.image_url = String(it.image_url).trim().slice(0, 1000);
    if (Array.isArray(it.points)) {
      cleaned.points = it.points.map((p) => String(p).trim()).filter(Boolean).slice(0, 20);
    }
    return cleaned;
  });
}

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: 'HERO AND ADMISSION BANNER',
  announcement: 'IMPORTANT ANNOUNCEMENT',
  intro: 'INTRODUCTION TO THE INSTITUTE',
  courses: 'COURSES OFFERED',
  campus: 'CAMPUS AND STUDENT FACILITIES',
  features: 'WHY CHOOSE OUR INSTITUTE',
  achievements: 'ACADEMIC ACHIEVEMENTS',
  faculty: 'FACULTY AND MENTORS',
  exams: 'UPCOMING EXAMS',
  lectures: 'FEATURED VIDEO LECTURES',
  testimonials: 'STUDENT TESTIMONIALS',
  news: 'LATEST NEWS AND ANNOUNCEMENTS',
  gallery: 'GALLERY PREVIEW',
  faq: 'FREQUENTLY ASKED QUESTIONS',
  enquiry: 'QUICK ADMISSION ENQUIRY',
  contact: 'CONTACT INFORMATION AND LOCATION',
  custom: 'CUSTOM SECTION',
};

const SECTION_TYPE_OPTIONS = Object.entries(SECTION_TYPE_LABELS).map(([key, label]) => ({
  key,
  label,
}));

export function AdminHomepagePage() {
  const { site, reloadSite } = useSite();
  usePageSeo('admin', 'Homepage Sections');

  const [dbSections, setDbSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isCustomized = Boolean(site.customized_modules?.includes('homepage_sections'));
  const sections = isCustomized
    ? dbSections
    : dbSections.length > 0
      ? dbSections
      : DEFAULT_HOMEPAGE_SECTIONS;

  const load = async () => {
    setLoading(true);
    try {
      const rows = await fetchCollection<HomepageSection>(
        'homepage_sections',
        [],
        'display_order',
        'asc'
      );
      setDbSections(rows);
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not load homepage sections.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sectionPayload = (sec: HomepageSection): Record<string, unknown> => {
    const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
    return {
      key: str(sec.key, 40) || 'custom',
      eyebrow: str(sec.eyebrow, 100),
      title: str(sec.title, 200),
      subtitle: str(sec.subtitle, 400),
      body: str(sec.body, 4000),
      image_url: str(sec.image_url, 1000),
      button_label: str(sec.button_label, 80),
      button_link: str(sec.button_link, 200),
      display_order: Number(sec.display_order) || 0,
      is_visible: Boolean(sec.is_visible),
      items: cleanSubItems(sec.items),
    };
  };

  const ensureMaterialized = async (): Promise<HomepageSection[]> => {
    if (dbSections.length > 0 || isCustomized) {
      await markModuleCustomized('homepage_sections');
      return dbSections;
    }
    for (const sec of DEFAULT_HOMEPAGE_SECTIONS) {
      await setDocRecord('homepage_sections', sec.id, sectionPayload(sec));
    }
    await markModuleCustomized('homepage_sections');
    return DEFAULT_HOMEPAGE_SECTIONS;
  };

  const restoreDefaults = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      const current = await fetchCollection<HomepageSection>('homepage_sections');
      const defaultIds = new Set(DEFAULT_HOMEPAGE_SECTIONS.map((s) => s.id));
      for (const row of current) {
        if (!defaultIds.has(row.id)) {
          await deleteDocRecord('homepage_sections', row.id);
        }
      }
      for (const sec of DEFAULT_HOMEPAGE_SECTIONS) {
        await setDocRecord('homepage_sections', sec.id, sectionPayload(sec));
      }
      await markModuleCustomized('homepage_sections');
      await logAdminActivity('update', 'homepage_sections', 'Restored default homepage sections');
      setConfirmRestore(false);
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not restore default homepage sections.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (sec: HomepageSection) => {
    setErrorMsg('');
    try {
      await ensureMaterialized();
      await updateDocRecord('homepage_sections', sec.id, { is_visible: !sec.is_visible });
      await logAdminActivity(
        'update',
        'homepage_sections',
        `${!sec.is_visible ? 'Shown' : 'Hid'} section ${sec.title || sec.key}`
      );
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not update section visibility.'));
    }
  };

  const moveSection = async (index: number, dir: -1 | 1) => {
    const targetIdx = index + dir;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    setErrorMsg('');
    try {
      const list = [...(await ensureMaterialized())].sort(
        (a, b) => a.display_order - b.display_order
      );
      const curr = list[index];
      const target = list[targetIdx];
      if (!curr || !target) return;
      const currOrder = index + 1;
      const targetOrder = targetIdx + 1;
      await updateDocRecord('homepage_sections', curr.id, { display_order: targetOrder });
      await updateDocRecord('homepage_sections', target.id, { display_order: currOrder });
      await logAdminActivity('update', 'homepage_sections', `Reordered section "${curr.title}"`);
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not reorder homepage section.'));
    }
  };

  const deleteSection = async (sec: HomepageSection) => {
    setErrorMsg('');
    try {
      await ensureMaterialized();
      await deleteDocRecord('homepage_sections', sec.id);
      await logAdminActivity('delete', 'homepage_sections', `Deleted section ${sec.title || sec.key}`);
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not delete section.'));
    }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setErrorMsg('');
    try {
      await ensureMaterialized();
      const payload = sectionPayload(editing);

      if (isNew) {
        await createDocRecord('homepage_sections', payload);
        await logAdminActivity('create', 'homepage_sections', `Added section "${String(payload.title)}"`);
      } else {
        await setDocRecord('homepage_sections', editing.id, payload);
        await logAdminActivity('update', 'homepage_sections', `Updated section "${String(payload.title)}"`);
      }

      setEditing(null);
      setIsNew(false);
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not save section.'));
    } finally {
      setSaving(false);
    }
  };

  const openAddSection = () => {
    setIsNew(true);
    setEditing({
      id: '',
      key: 'custom',
      eyebrow: '',
      title: 'New section',
      subtitle: '',
      body: '',
      image_url: '',
      button_label: '',
      button_link: '',
      display_order: sections.length + 1,
      is_visible: true,
      items: [],
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--brand-navy))] sm:text-2xl">
            Homepage Sections
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Order, edit, hide or remove the blocks on the homepage. Courses, exams and other modules
            read live data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => setConfirmRestore(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-3.5 py-2 text-xs font-semibold text-[hsl(var(--brand-navy))] shadow-2xs transition hover:bg-[hsl(var(--brand-surface))]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Restore defaults</span>
          </button>
          <button
            type="button"
            onClick={openAddSection}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--brand-navy))] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add section</span>
          </button>
        </div>
      </div>

      {errorMsg && !editing && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading sections…</p>
      ) : sections.length === 0 ? (
        <div className="surface p-10 text-center">
          <p className="text-sm font-semibold text-[hsl(var(--brand-navy))]">
            All homepage sections have been removed
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Click “Add section” to build custom blocks or “Restore defaults” to bring back the 16
            standard sections.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sections.map((sec, idx) => {
            const typeLabel = SECTION_TYPE_LABELS[sec.key] || sec.key.toUpperCase();
            const itemCount = Array.isArray(sec.items) ? sec.items.length : 0;
            return (
              <div
                key={sec.id}
                className="surface flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <span className="w-5 shrink-0 text-right text-xs font-semibold text-slate-400 tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm font-bold ${
                        sec.is_visible ? 'text-[hsl(var(--brand-navy))]' : 'text-slate-400'
                      }`}
                    >
                      {sec.title || sec.key}
                    </p>
                    <p className="mt-0.5 truncate text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
                      {typeLabel}
                      {itemCount > 0 ? ` · ${itemCount} ITEMS` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(sec.is_visible)}
                    aria-label={`${sec.is_visible ? 'Hide' : 'Show'} ${sec.title || sec.key}`}
                    onClick={() => toggleVisibility(sec)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      sec.is_visible ? 'bg-[hsl(var(--brand-navy))]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        sec.is_visible ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, -1)}
                    aria-label={`Move ${sec.title || sec.key} up`}
                    className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[hsl(var(--brand-navy))] disabled:opacity-25"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => moveSection(idx, 1)}
                    aria-label={`Move ${sec.title || sec.key} down`}
                    className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[hsl(var(--brand-navy))] disabled:opacity-25"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNew(false);
                      setEditing({ ...sec, items: sec.items ? [...sec.items] : [] });
                    }}
                    aria-label={`Edit ${sec.title || sec.key}`}
                    className="rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-[hsl(var(--brand-navy))]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSection(sec)}
                    aria-label={`Delete ${sec.title || sec.key}`}
                    className="rounded p-1 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmRestore && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/60 p-4"
        >
          <div className="surface w-full max-w-md space-y-4 p-6">
            <h2 className="text-base font-bold text-[hsl(var(--brand-navy))]">
              Restore default homepage sections?
            </h2>
            <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              This will reset the homepage layout to the 16 standard Gurukul sections in their
              original order and remove any extra custom blocks.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRestore(false)}
                className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={restoreDefaults}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--brand-navy))] px-4 py-2 text-xs font-semibold text-white"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Restore defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/60 p-4"
        >
          <form
            onSubmit={saveEdit}
            className="surface max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h2 className="text-base font-bold text-[hsl(var(--brand-navy))]">
                {isNew
                  ? 'Add homepage section'
                  : `Edit section: ${SECTION_TYPE_LABELS[editing.key] || editing.key}`}
              </h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <label className="flex items-center gap-2.5 text-sm font-semibold text-[hsl(var(--brand-navy))]">
              <input
                type="checkbox"
                checked={Boolean(editing.is_visible)}
                onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              <span>Visible on homepage</span>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold">Section type</label>
                <select
                  className={INPUT_CLASS}
                  value={
                    SECTION_TYPE_OPTIONS.some((o) => o.key === editing.key)
                      ? editing.key
                      : 'custom'
                  }
                  onChange={(e) => setEditing({ ...editing, key: e.target.value })}
                >
                  {SECTION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Eyebrow (optional)</label>
                <input
                  className={INPUT_CLASS}
                  value={editing.eyebrow || ''}
                  onChange={(e) => setEditing({ ...editing, eyebrow: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Title</label>
              <input
                className={INPUT_CLASS}
                value={editing.title || ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Subtitle</label>
              <input
                className={INPUT_CLASS}
                value={editing.subtitle || ''}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Body copy</label>
              <textarea
                rows={4}
                className={INPUT_CLASS}
                value={editing.body || ''}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              />
            </div>
            <ImageUploaderField
              id="sec-img"
              label="Section Image"
              value={editing.image_url || ''}
              onChange={(url) => setEditing({ ...editing, image_url: url })}
              folder="sections"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Button label</label>
                <input
                  className={INPUT_CLASS}
                  value={editing.button_label || ''}
                  onChange={(e) => setEditing({ ...editing, button_label: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Button link</label>
                <input
                  className={INPUT_CLASS}
                  value={editing.button_link || ''}
                  onChange={(e) => setEditing({ ...editing, button_link: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Display order</label>
                <input
                  type="number"
                  step="0.5"
                  className={INPUT_CLASS}
                  value={editing.display_order}
                  onChange={(e) =>
                    setEditing({ ...editing, display_order: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="border-t border-[hsl(var(--border))] pt-4">
              <div className="mb-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--brand-navy))]">
                    Sub-items / Cards / FAQs ({editing.items?.length || 0}/20)
                  </p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    Used by Hero highlights, Campus cards, Why Choose Us cards, and FAQ items.
                  </p>
                </div>
                {(editing.items?.length || 0) < 20 && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        items: [...(editing.items || []), { title: '', description: '' }],
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--brand-navy))]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add item</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {(editing.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))]/50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[hsl(var(--brand-blue))]">
                        Item #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const next = [...(editing.items || [])];
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            setEditing({ ...editing, items: next });
                          }}
                          className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-30"
                          aria-label={`Move item ${idx + 1} up`}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx >= (editing.items?.length || 1) - 1}
                          onClick={() => {
                            const next = [...(editing.items || [])];
                            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                            setEditing({ ...editing, items: next });
                          }}
                          className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-30"
                          aria-label={`Move item ${idx + 1} down`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              items: (editing.items || []).filter((_, i) => i !== idx),
                            })
                          }
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        className={INPUT_CLASS}
                        placeholder="Title / Question"
                        value={item.title || ''}
                        onChange={(e) => {
                          const next = [...(editing.items || [])];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setEditing({ ...editing, items: next });
                        }}
                      />
                      <input
                        className={INPUT_CLASS}
                        placeholder="Badge / Value (optional)"
                        value={item.value || ''}
                        onChange={(e) => {
                          const next = [...(editing.items || [])];
                          next[idx] = { ...next[idx], value: e.target.value };
                          setEditing({ ...editing, items: next });
                        }}
                      />
                    </div>
                    <ImageUploaderField
                      id={`sub-img-${idx}`}
                      label="Item Image (optional)"
                      value={item.image_url || ''}
                      onChange={(url) => {
                        const next = [...(editing.items || [])];
                        next[idx] = { ...next[idx], image_url: url };
                        setEditing({ ...editing, items: next });
                      }}
                      folder="sections"
                    />
                    <textarea
                      rows={2}
                      className={INPUT_CLASS}
                      placeholder="Description / Answer"
                      value={item.description || ''}
                      onChange={(e) => {
                        const next = [...(editing.items || [])];
                        next[idx] = { ...next[idx], description: e.target.value };
                        setEditing({ ...editing, items: next });
                      }}
                    />
                    <textarea
                      rows={2}
                      className={INPUT_CLASS}
                      placeholder="Bullet points (one per line, optional)"
                      value={Array.isArray(item.points) ? item.points.join('\n') : ''}
                      onChange={(e) => {
                        const next = [...(editing.items || [])];
                        next[idx] = {
                          ...next[idx],
                          points: e.target.value.split('\n'),
                        };
                        setEditing({ ...editing, items: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-[hsl(var(--border))] pt-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[hsl(var(--brand-navy))] px-5 py-2 text-xs font-semibold text-white"
              >
                {saving ? 'Saving…' : 'Save section'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function AdminCampusPage() {
  const { reloadSite } = useSite();
  usePageSeo('admin', 'Campus Facilities');

  const [section, setSection] = useState<HomepageSection>(DEFAULT_CAMPUS_SECTION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCollection<HomepageSection>('homepage_sections', [where('key', '==', 'campus')])
      .then((rows) => {
        if (rows.length > 0) {
          setSection({
            ...DEFAULT_CAMPUS_SECTION,
            ...rows[0],
            items: Array.isArray(rows[0].items) ? rows[0].items : DEFAULT_CAMPUS_SECTION.items,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const persistCampus = async (target: HomepageSection, summary: string) => {
    const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
    const existingAll = await fetchCollection<HomepageSection>('homepage_sections');
    if (existingAll.length === 0) {
      for (const s of DEFAULT_HOMEPAGE_SECTIONS) {
        await setDocRecord('homepage_sections', s.id, {
          key: s.key,
          eyebrow: str(s.eyebrow, 100),
          title: str(s.title, 200),
          subtitle: str(s.subtitle, 400),
          body: str(s.body, 4000),
          image_url: str(s.image_url, 1000),
          button_label: str(s.button_label, 80),
          button_link: str(s.button_link, 200),
          display_order: Number(s.display_order) || 0,
          is_visible: Boolean(s.is_visible),
          items: cleanSubItems(s.items),
        });
      }
    }
    const docId = target.id || 'sec-campus';
    const payload: Record<string, unknown> = {
      key: 'campus',
      eyebrow: str(target.eyebrow, 100),
      title: str(target.title, 200),
      subtitle: str(target.subtitle, 400),
      body: str(target.body, 4000),
      image_url: str(target.image_url, 1000),
      button_label: str(target.button_label, 80),
      button_link: str(target.button_link, 200),
      display_order: Number(target.display_order) || 5,
      is_visible: target.is_visible !== false,
      items: cleanSubItems(target.items),
    };
    await setDocRecord('homepage_sections', docId, payload);
    await markModuleCustomized('homepage_sections');
    await logAdminActivity('update', 'homepage_sections', summary);
    await reloadSite();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    setErrorMsg('');
    try {
      await persistCampus(section, 'Updated Campus & Student Facilities');
      setSavedMsg('Campus & Student Facilities updated and published.');
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not save campus facilities.'));
    } finally {
      setSaving(false);
    }
  };

  const restoreCampusDefaults = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      setSection(DEFAULT_CAMPUS_SECTION);
      await persistCampus(DEFAULT_CAMPUS_SECTION, 'Restored default Campus Facilities');
      setConfirmRestore(false);
      setSavedMsg('Campus & Student Facilities restored to defaults.');
    } catch (err) {
      setErrorMsg(unwrapFirestoreError(err, 'Could not restore campus defaults.'));
    } finally {
      setSaving(false);
    }
  };

  const facilityItems = Array.isArray(section.items) ? section.items : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--brand-navy))] sm:text-2xl">
            Campus &amp; Student Facilities
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Edit, reorder, add, or remove the Residential Campus &amp; Day-Care facility cards shown
            on both Home and Courses pages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmRestore(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-3.5 py-2 text-xs font-semibold text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-surface))]"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Restore defaults</span>
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading campus facilities…</p>
      ) : (
        <form onSubmit={handleSave} className="surface space-y-5 p-5 sm:p-7">
          <label className="flex items-center gap-2.5 text-sm font-semibold text-[hsl(var(--brand-navy))]">
            <input
              type="checkbox"
              checked={section.is_visible !== false}
              onChange={(e) => setSection({ ...section, is_visible: e.target.checked })}
              className="h-4 w-4 rounded"
            />
            <span>Show Campus &amp; Student Facilities section on Home and Courses pages</span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Section eyebrow</label>
              <input
                className={INPUT_CLASS}
                value={section.eyebrow || ''}
                onChange={(e) => setSection({ ...section, eyebrow: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Display order (Homepage)</label>
              <input
                type="number"
                step="0.5"
                className={INPUT_CLASS}
                value={section.display_order}
                onChange={(e) =>
                  setSection({ ...section, display_order: Number(e.target.value) })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold">Section title</label>
              <input
                className={INPUT_CLASS}
                value={section.title || ''}
                onChange={(e) => setSection({ ...section, title: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold">Section subtitle</label>
              <textarea
                rows={2}
                className={INPUT_CLASS}
                value={section.subtitle || ''}
                onChange={(e) => setSection({ ...section, subtitle: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold">
                Commitment banner text (dark navy banner below cards)
              </label>
              <textarea
                rows={2}
                className={INPUT_CLASS}
                value={section.body || ''}
                onChange={(e) => setSection({ ...section, body: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-[hsl(var(--border))] pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[hsl(var(--brand-navy))]">
                Facility cards ({facilityItems.length}/12)
              </h2>
              {facilityItems.length < 12 && (
                <button
                  type="button"
                  onClick={() =>
                    setSection({
                      ...section,
                      items: [
                        ...facilityItems,
                        { title: '', description: '', icon: 'bed', image_url: '', points: [] },
                      ],
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--brand-navy))]"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add facility</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {facilityItems.map((item, idx) => (
                <div
                  key={idx}
                  className="space-y-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))]/40 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[hsl(var(--brand-navy))]">
                      Facility Card #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const next = [...facilityItems];
                          [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                          setSection({ ...section, items: next });
                        }}
                        className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-30"
                        aria-label={`Move facility ${idx + 1} up`}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx >= facilityItems.length - 1}
                        onClick={() => {
                          const next = [...facilityItems];
                          [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                          setSection({ ...section, items: next });
                        }}
                        className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-30"
                        aria-label={`Move facility ${idx + 1} down`}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSection({
                            ...section,
                            items: facilityItems.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold">Facility title</label>
                      <input
                        className={INPUT_CLASS}
                        value={item.title || ''}
                        onChange={(e) => {
                          const next = [...facilityItems];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setSection({ ...section, items: next });
                        }}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold">Badge icon</label>
                      <select
                        className={INPUT_CLASS}
                        value={item.icon || 'bed'}
                        onChange={(e) => {
                          const next = [...facilityItems];
                          next[idx] = { ...next[idx], icon: e.target.value };
                          setSection({ ...section, items: next });
                        }}
                      >
                        <option value="bed">Bed (Residential)</option>
                        <option value="sun">Sun (Day-Care / Boarding)</option>
                      </select>
                    </div>
                  </div>

                  <ImageUploaderField
                    id={`campus-img-${idx}`}
                    label="Facility photo"
                    value={item.image_url || ''}
                    onChange={(url) => {
                      const next = [...facilityItems];
                      next[idx] = { ...next[idx], image_url: url };
                      setSection({ ...section, items: next });
                    }}
                    folder="campus"
                  />

                  <div>
                    <label className="mb-1 block text-xs font-semibold">Description</label>
                    <textarea
                      rows={2}
                      className={INPUT_CLASS}
                      value={item.description || ''}
                      onChange={(e) => {
                        const next = [...facilityItems];
                        next[idx] = { ...next[idx], description: e.target.value };
                        setSection({ ...section, items: next });
                      }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">
                      Checklist points (one point per line)
                    </label>
                    <textarea
                      rows={4}
                      className={INPUT_CLASS}
                      value={Array.isArray(item.points) ? item.points.join('\n') : ''}
                      onChange={(e) => {
                        const next = [...facilityItems];
                        next[idx] = { ...next[idx], points: e.target.value.split('\n') };
                        setSection({ ...section, items: next });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {savedMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>{savedMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--brand-navy))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              <span>Save campus facilities</span>
            </button>
          </div>
        </form>
      )}

      {confirmRestore && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/60 p-4"
        >
          <div className="surface w-full max-w-md space-y-4 p-6">
            <h2 className="text-base font-bold text-[hsl(var(--brand-navy))]">
              Restore default campus facilities?
            </h2>
            <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              This will restore the default Residential Campus and Day-Care / Day-Boarding facility
              cards.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRestore(false)}
                className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={restoreCampusDefaults}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--brand-navy))] px-4 py-2 text-xs font-semibold text-white"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Restore defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
