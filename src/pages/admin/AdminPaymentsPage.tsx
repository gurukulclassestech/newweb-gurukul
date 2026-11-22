import React, { useEffect, useState } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import {
  CheckCircle2,
  Download,
  IndianRupee,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  createDocRecord,
  deleteDocRecord,
  fetchCollection,
  logAdminActivity,
  updateDocRecord,
} from '../../lib/firestoreApi';
import { usePageSeo } from '../../lib/seo';
import type { PaymentRecord } from '../../types';

const INPUT_CLASS =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2 text-sm outline-none transition focus:border-[hsl(var(--brand-navy))] focus:ring-2 focus:ring-[hsl(var(--brand-navy))]/15';

const PAYMENT_STATUSES = ['pending', 'verified', 'failed', 'refunded'] as const;
const PAYMENT_METHODS = ['UPI', 'Cash', 'Bank Transfer / NEFT', 'Card', 'Cheque'] as const;

const STATUS_BADGE: Record<PaymentRecord['status'], string> = {
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-slate-100 text-slate-700 border-slate-200',
};

const EMPTY_FORM = {
  student_name: '',
  phone: '',
  course_name: '',
  amount: '',
  payment_method: 'UPI',
  reference_id: '',
  paid_date: new Date().toISOString().slice(0, 10),
  status: 'verified' as PaymentRecord['status'],
  notes: '',
};

function unwrapErr(err: unknown, fallback: string) {
  let msg = err instanceof Error ? err.message : fallback;
  try {
    const parsed = JSON.parse(msg) as { error?: string };
    if (parsed?.error) msg = parsed.error;
  } catch {
    // plain string
  }
  return msg;
}

export function AdminPaymentsPage() {
  usePageSeo('admin', 'Payments');

  const [rows, setRows] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentRecord | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCollection<PaymentRecord>('payments');
      setRows(data);
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not load payment records.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, paid_date: new Date().toISOString().slice(0, 10) });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEdit = (row: PaymentRecord) => {
    setEditing(row);
    setForm({
      student_name: row.student_name || '',
      phone: row.phone || '',
      course_name: row.course_name || '',
      amount: row.amount || '',
      payment_method: row.payment_method || 'UPI',
      reference_id: row.reference_id || '',
      paid_date: row.paid_date || '',
      status: row.status || 'pending',
      notes: row.notes || '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const student_name = form.student_name.trim().slice(0, 120);
    const phone = form.phone.trim().slice(0, 20);
    const amount = form.amount.trim().slice(0, 40);
    if (student_name.length < 2) {
      setErrorMsg('Student name must be at least 2 characters.');
      return;
    }
    if (phone.length < 10) {
      setErrorMsg('Please enter a valid 10–13 digit mobile number.');
      return;
    }
    if (!amount) {
      setErrorMsg('Please enter an amount (e.g. ₹2,500 or 2500).');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const payload: Record<string, unknown> = {
        student_name,
        phone,
        course_name: form.course_name.trim().slice(0, 160),
        amount,
        payment_method: form.payment_method.trim().slice(0, 60),
        reference_id: form.reference_id.trim().slice(0, 100),
        paid_date: form.paid_date.trim().slice(0, 40),
        status: form.status,
        notes: form.notes.trim().slice(0, 1000),
        updated_at: serverTimestamp(),
      };

      if (editing) {
        await updateDocRecord('payments', editing.id, payload);
        await logAdminActivity('update', 'payments', `Updated fee payment for ${student_name}`);
        setStatusMsg(`Updated payment record for ${student_name}.`);
      } else {
        payload.created_at = serverTimestamp();
        await createDocRecord('payments', payload);
        await logAdminActivity('create', 'payments', `Recorded fee payment for ${student_name}`);
        setStatusMsg(`Recorded payment for ${student_name}.`);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not save payment record.'));
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (row: PaymentRecord, nextStatus: PaymentRecord['status']) => {
    setErrorMsg('');
    try {
      await updateDocRecord('payments', row.id, {
        status: nextStatus,
        updated_at: serverTimestamp(),
      });
      await logAdminActivity('update', 'payments', `${row.student_name} payment marked ${nextStatus}`);
      await load();
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not update payment status.'));
    }
  };

  const handleDelete = async (row: PaymentRecord) => {
    setErrorMsg('');
    try {
      await deleteDocRecord('payments', row.id);
      await logAdminActivity('delete', 'payments', `Deleted payment record for ${row.student_name}`);
      await load();
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not delete payment record.'));
    }
  };

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchText =
      !q ||
      [r.student_name, r.phone, r.course_name, r.reference_id, r.amount]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchText && matchStatus;
  });

  const exportCsv = () => {
    const headers = [
      'Student Name',
      'Phone',
      'Course',
      'Amount',
      'Method',
      'Reference / UTR',
      'Date',
      'Status',
      'Notes',
    ];
    const csvRows = [
      headers.join(','),
      ...filtered.map((r) =>
        [
          r.student_name,
          r.phone,
          r.course_name || '',
          r.amount,
          r.payment_method || '',
          r.reference_id || '',
          r.paid_date || '',
          r.status,
          (r.notes || '').replace(/\n/g, ' '),
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--brand-navy))] sm:text-2xl">
            Fee Payments
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Record, verify, edit, or export student admission &amp; tuition fee transactions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-3.5 py-2 text-xs font-semibold text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-surface))] disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--brand-navy))] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Record payment</span>
          </button>
        </div>
      </div>

      <div className="surface grid gap-3 p-4 sm:grid-cols-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
            aria-hidden="true"
          />
          <input
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[hsl(var(--brand-navy))]"
            placeholder="Search student, mobile, UTR or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by payment status"
        >
          <option value="">All statuses</option>
          {PAYMENT_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && !modalOpen && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="surface overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <IndianRupee className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-[hsl(var(--brand-navy))]">
              No payment records yet
            </p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              Click “Record payment” above to log UPI, cash, or bank transfer receipts.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {filtered.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-[hsl(var(--brand-navy))]">
                      {row.student_name}
                    </p>
                    <span className="rounded-md bg-[hsl(var(--brand-surface))] px-2 py-0.5 text-xs font-bold text-[hsl(var(--brand-navy))] tabular-nums">
                      {row.amount}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${
                        STATUS_BADGE[row.status] || STATUS_BADGE.pending
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
                    {row.phone}
                    {row.course_name ? ` · ${row.course_name}` : ''}
                    {row.payment_method ? ` · ${row.payment_method}` : ''}
                    {row.reference_id ? ` · Ref: ${row.reference_id}` : ''}
                    {row.paid_date ? ` · ${row.paid_date}` : ''}
                  </p>
                  {row.notes && (
                    <p className="mt-1 text-xs text-slate-600">{row.notes}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <select
                    value={row.status}
                    onChange={(e) =>
                      handleQuickStatus(row, e.target.value as PaymentRecord['status'])
                    }
                    aria-label={`Status for ${row.student_name}`}
                    className="rounded-lg border border-[hsl(var(--input))] bg-white px-2.5 py-1.5 text-xs font-semibold capitalize"
                  >
                    {PAYMENT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="rounded-lg border border-[hsl(var(--border))] p-1.5 text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-surface))]"
                    aria-label={`Edit payment for ${row.student_name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                    aria-label={`Delete payment for ${row.student_name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/60 p-4"
        >
          <form
            onSubmit={handleSave}
            className="surface max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h2 className="text-base font-bold text-[hsl(var(--brand-navy))]">
                {editing ? 'Edit payment record' : 'Record new payment'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold">Student name *</label>
                <input
                  className={INPUT_CLASS}
                  required
                  value={form.student_name}
                  onChange={(e) => setForm((f) => ({ ...f, student_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Mobile number *</label>
                <input
                  className={INPUT_CLASS}
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98609 68994"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Amount *</label>
                <input
                  className={INPUT_CLASS}
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="₹2,500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Course / Batch</label>
                <input
                  className={INPUT_CLASS}
                  value={form.course_name}
                  onChange={(e) => setForm((f) => ({ ...f, course_name: e.target.value }))}
                  placeholder="Two-Year IIT-JEE"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Payment method</label>
                <select
                  className={INPUT_CLASS}
                  value={form.payment_method}
                  onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Status</label>
                <select
                  className={INPUT_CLASS}
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as PaymentRecord['status'] }))
                  }
                >
                  {PAYMENT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Transaction / UTR ID</label>
                <input
                  className={INPUT_CLASS}
                  value={form.reference_id}
                  onChange={(e) => setForm((f) => ({ ...f, reference_id: e.target.value }))}
                  placeholder="UPI / Receipt No."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Payment date</label>
                <input
                  type="date"
                  className={INPUT_CLASS}
                  value={form.paid_date}
                  onChange={(e) => setForm((f) => ({ ...f, paid_date: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold">Notes</label>
                <textarea
                  rows={2}
                  className={INPUT_CLASS}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
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
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--brand-navy))] px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                <span>Save payment</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
