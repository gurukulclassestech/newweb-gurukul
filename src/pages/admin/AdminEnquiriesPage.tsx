import { useEffect, useState } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { Download, Search, Trash2 } from 'lucide-react';
import {
  deleteDocRecord,
  fetchCollection,
  logAdminActivity,
  updateDocRecord,
} from '../../lib/firestoreApi';
import { usePageSeo } from '../../lib/seo';
import type { AdmissionApplication, Enquiry } from '../../types';

const ENQUIRY_STATUSES = ['new', 'contacted', 'enrolled', 'closed'] as const;
const ADMISSION_STATUSES = ['pending', 'verified', 'confirmed', 'rejected'] as const;

export function AdminEnquiriesPage({ kind }: { kind: 'enquiries' | 'admissions' }) {
  const isAdmissions = kind === 'admissions';
  usePageSeo('admin', isAdmissions ? 'Admission Applications' : 'Website Enquiries');

  const [rows, setRows] = useState<Array<Enquiry | AdmissionApplication>>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');

  const unwrapErr = (err: unknown, fallback: string) => {
    let msg = err instanceof Error ? err.message : fallback;
    try {
      const parsed = JSON.parse(msg) as { error?: string };
      if (parsed?.error) msg = parsed.error;
    } catch {
      // plain string
    }
    return msg;
  };

  const collectionName = isAdmissions ? 'admissions' : 'enquiries';
  const statuses = isAdmissions ? ADMISSION_STATUSES : ENQUIRY_STATUSES;

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection<Enquiry | AdmissionApplication>(collectionName);
      setRows(data);
      const map: Record<string, string> = {};
      for (const r of data) map[r.id] = r.admin_notes || '';
      setNotesDraft(map);
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not load records.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStatusFilter('');
    setSearch('');
    setErrorMsg('');
    load();
  }, [kind]);

  const handleStatusChange = async (row: Enquiry | AdmissionApplication, nextStatus: string) => {
    setErrorMsg('');
    try {
      await updateDocRecord(collectionName, row.id, {
        status: nextStatus,
        admin_notes: String(notesDraft[row.id] ?? row.admin_notes ?? '').slice(0, 1000),
        updated_at: serverTimestamp(),
      });
      await logAdminActivity('update', collectionName, `${row.student_name} marked as ${nextStatus}`);
      await load();
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not update status.'));
    }
  };

  const handleSaveNote = async (row: Enquiry | AdmissionApplication) => {
    setErrorMsg('');
    try {
      await updateDocRecord(collectionName, row.id, {
        status: row.status,
        admin_notes: String(notesDraft[row.id] ?? '').slice(0, 1000),
        updated_at: serverTimestamp(),
      });
      await logAdminActivity('update', collectionName, `Saved note for ${row.student_name}`);
      await load();
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not save note.'));
    }
  };

  const handleDelete = async (row: Enquiry | AdmissionApplication) => {
    setErrorMsg('');
    try {
      await deleteDocRecord(collectionName, row.id);
      await logAdminActivity('delete', collectionName, `Deleted ${row.student_name}`);
      await load();
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not delete record.'));
    }
  };

  const filtered = rows.filter((row) => {
    const q = search.trim().toLowerCase();
    const matchText =
      !q ||
      [row.student_name, row.parent_name, row.phone, row.email, row.course_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    const matchStatus = !statusFilter || row.status === statusFilter;
    return matchText && matchStatus;
  });

  const exportCsv = () => {
    const headers = [
      'Student Name',
      'Parent Name',
      'Phone',
      'Email',
      'Class',
      'Course',
      'Preferred Batch',
      'Status',
      'Message',
    ];
    const csvRows = [
      headers.join(','),
      ...filtered.map((r) =>
        [
          r.student_name,
          r.parent_name || '',
          r.phone,
          r.email || '',
          r.class_level || '',
          r.course_name || '',
          r.preferred_batch || '',
          r.status,
          (r.message || '').replace(/\n/g, ' '),
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collectionName}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--brand-navy))] sm:text-2xl">
            {isAdmissions ? 'Admission Applications' : 'Website Enquiries'}
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Review submissions, update follow-up status, and export records securely.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-4 py-2 text-xs font-semibold text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-surface))] disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="surface grid gap-3 p-4 sm:grid-cols-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
            aria-hidden="true"
          />
          <input
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[hsl(var(--brand-navy))]"
            placeholder="Search student, parent, mobile or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {statuses.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p className="p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="surface p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
          No {isAdmissions ? 'admission applications' : 'enquiries'} found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => (
            <div key={row.id} className="surface space-y-3 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-[hsl(var(--brand-navy))]">
                      {row.student_name}
                    </h2>
                    {'reference_code' in row && row.reference_code && (
                      <span className="text-xs font-mono font-semibold text-[hsl(var(--brand-blue))]">
                        {row.reference_code}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
                    {row.parent_name ? `Parent: ${row.parent_name} · ` : ''}
                    <a href={`tel:${row.phone}`} className="font-semibold text-[hsl(var(--brand-navy))] hover:underline">
                      {row.phone}
                    </a>
                    {row.email ? ` · ${row.email}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {[row.class_level, row.course_name, row.preferred_batch]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {row.message && (
                    <p className="mt-2 rounded-lg bg-[hsl(var(--brand-surface))] p-3 text-xs leading-relaxed text-[hsl(var(--foreground))]">
                      {row.message}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <select
                    value={row.status}
                    onChange={(e) => handleStatusChange(row, e.target.value)}
                    aria-label={`Status for ${row.student_name}`}
                    className="rounded-lg border border-[hsl(var(--input))] bg-white px-2.5 py-1.5 text-xs font-semibold capitalize"
                  >
                    {statuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                    aria-label={`Delete ${row.student_name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-[hsl(var(--border))] pt-3 sm:flex-row">
                <input
                  type="text"
                  maxLength={1000}
                  value={notesDraft[row.id] ?? ''}
                  onChange={(e) =>
                    setNotesDraft((prev) => ({ ...prev, [row.id]: e.target.value }))
                  }
                  placeholder="Internal staff follow-up notes…"
                  className="flex-1 rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-1.5 text-xs outline-none focus:border-[hsl(var(--brand-navy))]"
                />
                <button
                  type="button"
                  onClick={() => handleSaveNote(row)}
                  className="rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-surface))]"
                >
                  Save note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
