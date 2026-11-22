import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { CLASS_LEVELS, DEFAULT_COURSES, PREFERRED_BATCHES } from '../data/defaults';
import { fetchPublished, submitValidatedEnquiry } from '../lib/firestoreApi';
import type { Course } from '../types';

const INPUT_CLASS =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm text-[hsl(var(--foreground))] outline-none transition focus:border-[hsl(var(--brand-navy))] focus:ring-2 focus:ring-[hsl(var(--brand-navy))]/15';

interface EnquiryFormProps {
  source?: string;
  defaultCourse?: string;
  submitLabel?: string;
  compact?: boolean;
  showParentName?: boolean;
  showEmail?: boolean;
  showClass?: boolean;
  showCourse?: boolean;
  showBatch?: boolean;
  showMessage?: boolean;
  onSuccess?: () => void;
}

export function EnquiryForm({
  source = 'website',
  defaultCourse = '',
  submitLabel = 'Submit enquiry',
  compact = false,
  showParentName = true,
  showEmail = true,
  showClass = true,
  showCourse = true,
  showBatch = true,
  showMessage = true,
  onSuccess,
}: EnquiryFormProps) {
  const { site } = useSite();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    student_name: '',
    parent_name: '',
    phone: '',
    email: '',
    class_level: '',
    course_name: defaultCourse,
    preferred_batch: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [serverMsg, setServerMsg] = useState('');

  useEffect(() => {
    fetchPublished<Course>('courses', 'display_order', 'asc', 50)
      .then((rows) => setCourses(rows))
      .catch(() => setCourses([]));
  }, []);

  const courseOptions =
    courses.length > 0 || site.customized_modules?.includes('courses')
      ? courses
      : DEFAULT_COURSES;

  useEffect(() => {
    if (defaultCourse) {
      setForm((prev) => ({ ...prev, course_name: defaultCourse }));
    }
  }, [defaultCourse]);

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const validateClient = () => {
    const next: Record<string, string> = {};
    if (form.student_name.trim().length < 2) {
      next.student_name = "Please enter the student's full name.";
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
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setStatus('saving');
    setServerMsg('');

    try {
      const result = await submitValidatedEnquiry({
        student_name: form.student_name.trim(),
        parent_name: showParentName ? form.parent_name.trim() : '',
        phone: form.phone.trim(),
        email: showEmail ? form.email.trim() : '',
        class_level: showClass ? form.class_level : '',
        course_name: showCourse ? form.course_name : defaultCourse,
        preferred_batch: showBatch ? form.preferred_batch : '',
        message: showMessage ? form.message.trim() : '',
        source,
      });

      if (!result.ok) {
        if (result.errors) setErrors(result.errors);
        setStatus('error');
        setServerMsg(result.message || 'Please check the highlighted fields and try again.');
        return;
      }

      setStatus('done');
      onSuccess?.();
    } catch {
      setStatus('error');
      setServerMsg(
        'We could not save your enquiry just now. Please try again, or call the institute directly.'
      );
    }
  };

  if (status === 'done') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" aria-hidden="true" />
        <h3 className="mt-3 text-lg font-semibold text-emerald-900">Enquiry received</h3>
        <p className="mt-1 text-sm text-emerald-800">
          Thank you. Your details have been saved and our admissions team will contact you shortly.
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
              course_name: defaultCourse,
              preferred_batch: '',
              message: '',
            });
          }}
          className="mt-4 inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${source}-student_name`}
            className="mb-1 block text-xs font-semibold text-[hsl(var(--foreground))]"
          >
            Student name <span className="text-red-600">*</span>
          </label>
          <input
            id={`${source}-student_name`}
            className={INPUT_CLASS}
            value={form.student_name}
            onChange={update('student_name')}
            placeholder="Full name"
            autoComplete="name"
          />
          {errors.student_name && (
            <p className="mt-1 text-xs text-red-600">{errors.student_name}</p>
          )}
        </div>

        {showParentName && (
          <div>
            <label
              htmlFor={`${source}-parent_name`}
              className="mb-1 block text-xs font-semibold text-[hsl(var(--foreground))]"
            >
              Parent / guardian name
            </label>
            <input
              id={`${source}-parent_name`}
              className={INPUT_CLASS}
              value={form.parent_name}
              onChange={update('parent_name')}
              placeholder="Parent or guardian"
            />
          </div>
        )}

        <div>
          <label
            htmlFor={`${source}-phone`}
            className="mb-1 block text-xs font-semibold text-[hsl(var(--foreground))]"
          >
            Mobile number <span className="text-red-600">*</span>
          </label>
          <input
            id={`${source}-phone`}
            type="tel"
            inputMode="tel"
            className={INPUT_CLASS}
            value={form.phone}
            onChange={update('phone')}
            placeholder="+91 98609 68994"
            autoComplete="tel"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        {showEmail && (
          <div>
            <label
              htmlFor={`${source}-email`}
              className="mb-1 block text-xs font-semibold text-[hsl(var(--foreground))]"
            >
              Email address
            </label>
            <input
              id={`${source}-email`}
              type="email"
              className={INPUT_CLASS}
              value={form.email}
              onChange={update('email')}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
        )}

        {showClass && (
          <div>
            <label
              htmlFor={`${source}-class_level`}
              className="mb-1 block text-xs font-semibold text-[hsl(var(--foreground))]"
            >
              Class / Standard
            </label>
            <select
              id={`${source}-class_level`}
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
          </div>
        )}

        {showCourse && (
          <div>
            <label
              htmlFor={`${source}-course_name`}
              className="mb-1 block text-xs font-semibold text-[hsl(var(--foreground))]"
            >
              Course selection
            </label>
            <select
              id={`${source}-course_name`}
              className={INPUT_CLASS}
              value={form.course_name}
              onChange={update('course_name')}
            >
              <option value="">Select a course (optional)</option>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.class_level})
                </option>
              ))}
              <option value="General / Need guidance">General / Need guidance</option>
            </select>
          </div>
        )}
      </div>

      {showBatch && (
        <div>
          <label
            htmlFor={`${source}-preferred_batch`}
            className="mb-1 block text-xs font-semibold text-[hsl(var(--foreground))]"
          >
            Preferred batch timing
          </label>
          <select
            id={`${source}-preferred_batch`}
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
      )}

      {showMessage && (
        <div>
          <label
            htmlFor={`${source}-message`}
            className="mb-1 block text-xs font-semibold text-[hsl(var(--foreground))]"
          >
            Message
          </label>
          <textarea
            id={`${source}-message`}
            rows={compact ? 2 : 3}
            className={INPUT_CLASS}
            value={form.message}
            onChange={update('message')}
            placeholder="Questions about subjects, timings, or admission"
          />
        </div>
      )}

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
        className="inline-flex w-full items-center justify-center rounded-lg bg-[#FFBE1B] px-5 py-2.5 text-sm font-bold text-[#122B5C] transition hover:bg-[#f2b211] disabled:opacity-60 sm:w-auto"
      >
        {status === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {submitLabel}
      </button>
    </form>
  );
}
