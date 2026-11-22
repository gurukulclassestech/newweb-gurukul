import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { DEFAULT_SITE_SETTINGS } from '../data/defaults';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128) || 'item';
}

export async function getSingleton<T>(collectionName: string, docId: string): Promise<T | null> {
  const path = `${collectionName}/${docId}`;
  try {
    const snap = await getDoc(doc(db, collectionName, docId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as T;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function setSingleton(
  collectionName: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  const path = `${collectionName}/${docId}`;
  try {
    await setDoc(doc(db, collectionName, docId), { ...data, updated_at: serverTimestamp() });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markModuleCustomized(moduleKeys: string | string[]): Promise<void> {
  const keys = Array.isArray(moduleKeys) ? moduleKeys : [moduleKeys];
  try {
    const ref = doc(db, 'site_settings', 'main');
    const snap = await getDoc(ref);
    const currentData = snap.exists() ? (snap.data() as Record<string, unknown>) : DEFAULT_SITE_SETTINGS;
    const prev = Array.isArray(currentData.customized_modules)
      ? (currentData.customized_modules as string[])
      : [];
    const merged = Array.from(new Set([...prev, ...keys])).slice(0, 30);
    await setDoc(ref, {
      ...DEFAULT_SITE_SETTINGS,
      ...currentData,
      customized_modules: merged,
      updated_at: serverTimestamp(),
    });
  } catch {
    // Non-blocking sync if admin lacks write or offline
  }
}

export async function fetchCollection<T extends { id: string }>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  sortField?: string,
  sortDir: 'asc' | 'desc' = 'asc'
): Promise<T[]> {
  try {
    const q = constraints.length
      ? query(collection(db, collectionName), ...constraints)
      : collection(db, collectionName);
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) }) as T);
    if (sortField) {
      rows.sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortField];
        const bv = (b as Record<string, unknown>)[sortField];
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av;
        }
        const as = String(av ?? '');
        const bs = String(bv ?? '');
        return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
      });
    }
    return rows;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
  }
}

export async function fetchPublished<T extends { id: string }>(
  collectionName: string,
  sortField = 'display_order',
  sortDir: 'asc' | 'desc' = 'asc',
  maxItems = 100
): Promise<T[]> {
  return fetchCollection<T>(
    collectionName,
    [where('is_published', '==', true), limit(maxItems)],
    sortField,
    sortDir
  );
}

export async function fetchPublicDocById<T>(collectionName: string, id: string): Promise<T | null> {
  const path = `${collectionName}/${id}`;
  try {
    const snap = await getDoc(doc(db, collectionName, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as T;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchPublishedBlogBySlug<T extends { id: string }>(slug: string): Promise<T | null> {
  try {
    const q = query(
      collection(db, 'blogs'),
      where('is_published', '==', true),
      where('slug', '==', slug),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as T;
    }
    return await fetchPublicDocById<T>('blogs', slug);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'blogs');
  }
}

export async function createDocRecord(
  collectionName: string,
  data: Record<string, unknown>,
  customId?: string
): Promise<string> {
  try {
    if (customId) {
      const safeId = sanitizeId(customId);
      await setDoc(doc(db, collectionName, safeId), data);
      return safeId;
    }
    const ref = await addDoc(collection(db, collectionName), data);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
  }
}

export async function updateDocRecord(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    await updateDoc(doc(db, collectionName, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function setDocRecord(
  collectionName: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    await setDoc(doc(db, collectionName, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteDocRecord(collectionName: string, id: string): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function logAdminActivity(action: string, entity: string, summary: string): Promise<void> {
  const email = auth.currentUser?.email || 'admin';
  try {
    await addDoc(collection(db, 'admin_activity'), {
      action: action.slice(0, 40),
      entity: entity.slice(0, 60),
      summary: summary.slice(0, 300),
      actor_email: email.slice(0, 120),
      created_at: serverTimestamp(),
    });
  } catch {
    // Non-blocking audit log
  }
}

export interface EnquiryPayload {
  student_name: string;
  parent_name?: string;
  phone: string;
  email?: string;
  class_level?: string;
  course_name?: string;
  preferred_batch?: string;
  message?: string;
  source?: string;
}

export async function submitValidatedEnquiry(payload: EnquiryPayload): Promise<{
  ok: boolean;
  duplicate?: boolean;
  errors?: Record<string, string>;
  message?: string;
}> {
  const res = await fetch('/api/validate-enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, kind: 'enquiry' }),
  });
  const check = await res.json();

  if (!res.ok) {
    return {
      ok: false,
      duplicate: Boolean(check?.duplicate),
      errors: check?.errors,
      message: check?.message,
    };
  }

  const { docId, dedupKey, sanitized } = check;
  try {
    await setDoc(doc(db, 'enquiries', docId), {
      student_name: sanitized.student_name,
      parent_name: sanitized.parent_name || '',
      phone: sanitized.phone,
      email: sanitized.email || '',
      class_level: sanitized.class_level || '',
      course_name: sanitized.course_name || '',
      preferred_batch: sanitized.preferred_batch || '',
      message: sanitized.message || '',
      source: sanitized.source || 'website',
      status: 'new',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('already exists')) {
      return {
        ok: false,
        duplicate: true,
        message:
          'We already received an enquiry for this mobile number and course today. Our admissions team will contact you shortly.',
      };
    }
    throw err;
  }

  await fetch('/api/confirm-enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dedupKey }),
  }).catch(() => {});

  return { ok: true };
}

export interface AdmissionPayload {
  student_name: string;
  parent_name: string;
  phone: string;
  email?: string;
  class_level: string;
  course_name?: string;
  preferred_batch?: string;
  school?: string;
  address?: string;
  message?: string;
}

export async function submitValidatedAdmission(payload: AdmissionPayload): Promise<{
  ok: boolean;
  duplicate?: boolean;
  errors?: Record<string, string>;
  message?: string;
  referenceCode?: string;
}> {
  const res = await fetch('/api/validate-enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, kind: 'admission' }),
  });
  const check = await res.json();

  if (!res.ok) {
    return {
      ok: false,
      duplicate: Boolean(check?.duplicate),
      errors: check?.errors,
      message: check?.message,
    };
  }

  const { docId, dedupKey, sanitized } = check;
  const referenceCode = `GSK-${String(docId).slice(-6).toUpperCase()}`;

  try {
    await setDoc(doc(db, 'admissions', docId), {
      student_name: sanitized.student_name,
      parent_name: sanitized.parent_name,
      phone: sanitized.phone,
      email: sanitized.email || '',
      class_level: sanitized.class_level,
      course_name: sanitized.course_name || '',
      preferred_batch: sanitized.preferred_batch || '',
      school: sanitized.school || '',
      address: sanitized.address || '',
      message: sanitized.message || '',
      reference_code: referenceCode,
      status: 'pending',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('already exists')) {
      return {
        ok: false,
        duplicate: true,
        message:
          'An admission application for this mobile number and course was already submitted today. Our office has received it.',
      };
    }
    throw err;
  }

  await fetch('/api/confirm-enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dedupKey }),
  }).catch(() => {});

  return { ok: true, referenceCode };
}
