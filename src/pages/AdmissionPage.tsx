import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { CLASS_LEVELS, DEFAULT_COURSES, PREFERRED_BATCHES } from '../data/defaults';
import { fetchPublished, submitValidatedAdmission } from '../lib/firestoreApi';
import { usePageSeo } from '../lib/seo';
import { PageHeroBanner } from '../components/CommonUI';
import { SafeImage } from '../components/SafeImage';
import type { Course } from '../types';

const INPUT_CLASS =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--brand-navy))] focus:ring-2 focus:ring-[hsl(var(--brand-navy))]/15';

const ADMISSION_STEPS = [
  {
    icon: ClipboardCheck,
    title: 'Submit application',
    text: 'Fill in student, parent and class details so our team knows your academic goals.',
  },
  {
    icon: Users,
    title: 'Counselling & batch check',
    text: 'Our admissions team calls you to review batch timings, subjects and seat availability.',
  },
  {
    icon: ShieldCheck,
    title: 'Seat confirmation',
    text: 'Admission is confirmed at the institute after document verification and fee recording.',
  },
];

export function AdmissionPage() {
  const { site } = useSite();
  const [searchParams] = useSearchParams();
  usePageSeo(
    'admission',
    'Admission',
    'Apply for admission, understand the process, and speak to the admissions team.'
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    student_name: '',
    parent_name: '',
    phone: '',
    email: '',
    class_level: '',
    course_name: searchParams.get('course') || '',
    preferred_batch: '',
    school: '',
    address: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [serverMsg, setServerMsg] = useState('');
  const [refCode, setRefCode] = useState('');

  useEffect(() => {
    fetchPublished<Course>('courses', 'display_order', 'asc', 50)
      .then(setCourses)
      .catch(() => {});
  }, []);

  const courseOptions = site.customized_modules?.includes('courses')
    ? courses
    : courses.length > 0
      ? courses
      : DEFAULT_COURSES;

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.student_name.trim().length < 2) {
      next.student_name = "Please enter the student's full name.";
    }
    if (form.parent_name.trim().length < 2) {
      next.parent_name = "Please enter the parent or guardian's name.";
    }
    const digits = form.phone.replace(/\D/g, '');
    if (!form.phone.trim()) {
      next.phone = 'Please enter a mobile number.';
    } else if (digits.length < 10 || digits.length > 13 || !/^[+0-9\s()-]{10,20}$/.test(form.phone)) {
      next.phone = 'Enter a valid mobile number (10–13 digits).';
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (!form.class_level) {
      next.class_level = 'Please select the class.';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus('saving');
    setServerMsg('');

    try {
      const result = await submitValidatedAdmission({
        ...form,
        student_name: form.student_name.trim(),
        parent_name: form.parent_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        school: form.school.trim(),
        address: form.address.trim(),
        message: form.message.trim(),
      });

      if (!result.ok) {
        if (result.errors) setErrors(result.errors);
        setStatus('error');
        setServerMsg(result.message || 'Please review the highlighted fields.');
        return;
      }

      setRefCode(result.referenceCode || 'GSK-NEW');
      setStatus('done');
    } catch {
      setStatus('error');
      setServerMsg(
        'We could not save your application right now. Please try again, or call the institute to apply.'
      );
    }
  };

  return (
    <>
      <PageHeroBanner
        eyebrow="Admissions"
        title="Apply for admission"
        description="Submit the application below. Our team will call you to explain batch timings, subjects and the fee structure before you confirm a seat."
      >
        {site.phone && (
          <a
            href={`tel:${site.phone}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#FFBE1B] hover:underline"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span className="tabular-nums">Prefer to talk? Call {site.phone}</span>
          </a>
        )}
      </PageHeroBanner>

      <section className="shell grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="surface p-5 sm:p-7">
          <h2 className="display-face text-2xl text-[hsl(var(--brand-navy))]">
            Admission application
          </h2>
          <p className="mb-5 mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Fields marked with <span className="text-red-600">*</span> are required.
          </p>

          {status === 'done' ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-7 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-semibold text-emerald-900">Application received</h3>
              <p className="mt-1.5 text-sm text-emerald-800">
                Save your reference number{' '}
                <span className="font-bold tabular-nums">{refCode}</span>. The admissions team
                will contact you to verify details and confirm the batch.
              </p>
              <p className="mt-2 text-xs text-emerald-700">
                Admission is confirmed only at the institute after fee payment and document verification.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatus('idle');
                  setForm({
                    student_name: '',
                    parent_name: '',
                    phone: '',
                    email: '',
                    class_level: '',
                    course_name: '',
                    preferred_batch: '',
                    school: '',
                    address: '',
                    message: '',
                  });
                }}
                className="mt-5 inline-flex items-center rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
              >
                Submit another application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="adm_student" className="mb-1 block text-xs font-semibold">
                    Student name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="adm_student"
                    className={INPUT_CLASS}
                    value={form.student_name}
                    onChange={update('student_name')}
                  />
                  {errors.student_name && (
                    <p className="mt-1 text-xs text-red-600">{errors.student_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="adm_parent" className="mb-1 block text-xs font-semibold">
                    Parent / guardian name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="adm_parent"
                    className={INPUT_CLASS}
                    value={form.parent_name}
                    onChange={update('parent_name')}
                  />
                  {errors.parent_name && (
                    <p className="mt-1 text-xs text-red-600">{errors.parent_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="adm_phone" className="mb-1 block text-xs font-semibold">
                    Mobile number <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="adm_phone"
                    type="tel"
                    inputMode="tel"
                    className={INPUT_CLASS}
                    value={form.phone}
                    onChange={update('phone')}
                    placeholder="+91 90000 00000"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="adm_email" className="mb-1 block text-xs font-semibold">
                    Email address
                  </label>
                  <input
                    id="adm_email"
                    type="email"
                    className={INPUT_CLASS}
                    value={form.email}
                    onChange={update('email')}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="adm_class" className="mb-1 block text-xs font-semibold">
                    Class <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="adm_class"
                    className={INPUT_CLASS}
                    value={form.class_level}
                    onChange={update('class_level')}
                  >
                    <option value="">Select class</option>
                    {CLASS_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                  {errors.class_level && (
                    <p className="mt-1 text-xs text-red-600">{errors.class_level}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="adm_course" className="mb-1 block text-xs font-semibold">
                    Course selection
                  </label>
                  <select
                    id="adm_course"
                    className={INPUT_CLASS}
                    value={form.course_name}
                    onChange={update('course_name')}
                  >
                    <option value="">Select course</option>
                    {courseOptions.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.class_level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="adm_batch" className="mb-1 block text-xs font-semibold">
                    Preferred batch
                  </label>
                  <select
                    id="adm_batch"
                    className={INPUT_CLASS}
                    value={form.preferred_batch}
                    onChange={update('preferred_batch')}
                  >
                    <option value="">Any available batch</option>
                    {PREFERRED_BATCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="adm_school" className="mb-1 block text-xs font-semibold">
                    Current school / college
                  </label>
                  <input
                    id="adm_school"
                    className={INPUT_CLASS}
                    value={form.school}
                    onChange={update('school')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="adm_address" className="mb-1 block text-xs font-semibold">
                  Residential area / address
                </label>
                <input
                  id="adm_address"
                  className={INPUT_CLASS}
                  value={form.address}
                  onChange={update('address')}
                />
              </div>

              <div>
                <label htmlFor="adm_msg" className="mb-1 block text-xs font-semibold">
                  Notes or questions
                </label>
                <textarea
                  id="adm_msg"
                  rows={3}
                  className={INPUT_CLASS}
                  value={form.message}
                  onChange={update('message')}
                />
              </div>

              {status === 'error' && serverMsg && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
                >
                  {serverMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'saving'}
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#FFBE1B] px-6 py-2.5 text-sm font-bold text-[#122B5C] transition hover:bg-[#f2b211] disabled:opacity-60 sm:w-auto"
              >
                {status === 'saving' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Submit admission application
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--brand-blue))]">
            How admission works
          </h2>
          {ADMISSION_STEPS.map(({ icon: Icon, title, text }, idx) => (
            <div key={title} className="surface flex gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--brand-navy))] text-[#FFBE1B]">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-[hsl(var(--brand-navy))]">
                  {idx + 1}. {title}
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {text}
                </p>
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))] p-4 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
            <p className="font-semibold text-[hsl(var(--brand-navy))]">Institute address</p>
            <p className="mt-1">{site.address}</p>
            <p className="mt-1">{site.office_hours}</p>
          </div>
        </aside>
      </section>

      {site.payments_enabled && (
        <section className="shell pb-16">
          <div className="surface p-5 sm:p-7">
            <h2 className="display-face text-2xl text-[hsl(var(--brand-navy))]">
              {site.payment_fee_label || 'Admission registration fee'}
            </h2>
            {site.payment_instructions && (
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                {site.payment_instructions}
              </p>
            )}
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {site.payment_qr_url && (
                <div className="rounded-xl border border-[hsl(var(--border))] bg-white p-4 text-center">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Scan UPI QR
                  </p>
                  <SafeImage
                    src={site.payment_qr_url}
                    alt="UPI Payment QR Code"
                    fit="contain"
                    className="mx-auto h-40 w-40 rounded-lg"
                  />
                </div>
              )}
              {site.upi_id && (
                <div className="rounded-lg bg-[hsl(var(--brand-surface))] p-4 text-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    UPI ID
                  </p>
                  <p className="mt-1 font-mono font-semibold text-[hsl(var(--brand-navy))]">
                    {site.upi_id}
                  </p>
                </div>
              )}
              {site.bank_details && (
                <div className="rounded-lg bg-[hsl(var(--brand-surface))] p-4 text-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Bank details
                  </p>
                  <p className="mt-1 whitespace-pre-line font-medium text-[hsl(var(--brand-navy))]">
                    {site.bank_details}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
