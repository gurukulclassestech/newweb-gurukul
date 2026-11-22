import React, { useEffect, useState } from 'react';
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
import { DEFAULT_GALLERY_ALBUMS, REPRESENTATIVE_GALLERY } from '../../data/defaults';
import {
  createDocRecord,
  deleteDocRecord,
  fetchCollection,
  logAdminActivity,
  markModuleCustomized,
  setDocRecord,
  updateDocRecord,
} from '../../lib/firestoreApi';
import { usePageSeo } from '../../lib/seo';
import { ImageUploaderField } from '../../components/admin/ImageUploaderField';
import { SafeImage } from '../../components/SafeImage';
import type { GalleryAlbum, GalleryMedia } from '../../types';

const INPUT_CLASS =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2 text-sm outline-none focus:border-[hsl(var(--brand-navy))]';

export function AdminGalleryPage() {
  usePageSeo('admin', 'Gallery Manager');
  const { site, reloadSite } = useSite();

  const [dbAlbums, setDbAlbums] = useState<GalleryAlbum[]>([]);
  const [dbMedia, setDbMedia] = useState<GalleryMedia[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState<'album' | 'media' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const isCustomized = Boolean(site.customized_modules?.includes('gallery'));
  const albums = isCustomized
    ? dbAlbums
    : dbAlbums.length > 0
      ? dbAlbums
      : DEFAULT_GALLERY_ALBUMS;
  const media = isCustomized
    ? dbMedia
    : dbMedia.length > 0
      ? dbMedia
      : REPRESENTATIVE_GALLERY;

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

  const load = async () => {
    setLoading(true);
    try {
      const [a, m] = await Promise.all([
        fetchCollection<GalleryAlbum>('gallery_albums', [], 'display_order', 'asc'),
        fetchCollection<GalleryMedia>('gallery_media', [], 'display_order', 'asc'),
      ]);
      setDbAlbums(a);
      setDbMedia(m);
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not load gallery.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ensureMaterialized = async (): Promise<{
    albumsList: GalleryAlbum[];
    mediaList: GalleryMedia[];
  }> => {
    if (isCustomized || dbAlbums.length > 0 || dbMedia.length > 0) {
      await markModuleCustomized('gallery');
      return { albumsList: dbAlbums, mediaList: dbMedia };
    }
    for (const alb of DEFAULT_GALLERY_ALBUMS) {
      await setDocRecord('gallery_albums', alb.id, {
        title: alb.title,
        description: alb.description || '',
        cover_image_url: alb.cover_image_url || '',
        display_order: alb.display_order,
        is_published: alb.is_published,
      });
    }
    for (const item of REPRESENTATIVE_GALLERY) {
      await setDocRecord('gallery_media', item.id, {
        album_id: item.album_id || '',
        title: item.title || '',
        caption: item.caption || '',
        file_url: item.file_url,
        media_type: item.media_type,
        display_order: item.display_order,
        is_published: item.is_published,
      });
    }
    await markModuleCustomized('gallery');
    return { albumsList: DEFAULT_GALLERY_ALBUMS, mediaList: REPRESENTATIVE_GALLERY };
  };

  const restoreDefaults = async () => {
    setSaving(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const [curAlbums, curMedia] = await Promise.all([
        fetchCollection<GalleryAlbum>('gallery_albums'),
        fetchCollection<GalleryMedia>('gallery_media'),
      ]);
      const defAlbIds = new Set(DEFAULT_GALLERY_ALBUMS.map((a) => a.id));
      const defMedIds = new Set(REPRESENTATIVE_GALLERY.map((m) => m.id));

      for (const a of curAlbums) {
        if (!defAlbIds.has(a.id)) await deleteDocRecord('gallery_albums', a.id);
      }
      for (const m of curMedia) {
        if (!defMedIds.has(m.id)) await deleteDocRecord('gallery_media', m.id);
      }

      for (const alb of DEFAULT_GALLERY_ALBUMS) {
        await setDocRecord('gallery_albums', alb.id, {
          title: alb.title,
          description: alb.description || '',
          cover_image_url: alb.cover_image_url || '',
          display_order: alb.display_order,
          is_published: alb.is_published,
        });
      }
      for (const item of REPRESENTATIVE_GALLERY) {
        await setDocRecord('gallery_media', item.id, {
          album_id: item.album_id || '',
          title: item.title || '',
          caption: item.caption || '',
          file_url: item.file_url,
          media_type: item.media_type,
          display_order: item.display_order,
          is_published: item.is_published,
        });
      }
      await markModuleCustomized('gallery');
      await logAdminActivity('update', 'gallery_media', 'Restored default gallery albums & photographs');
      setSelectedAlbum('');
      setConfirmRestore(false);
      setStatusMsg('Default campus gallery restored.');
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not restore default gallery.'));
    } finally {
      setSaving(false);
    }
  };

  const openModal = (mode: 'album' | 'media', existing?: Record<string, unknown> & { id: string }) => {
    setErrorMsg('');
    setModalMode(mode);
    setEditingId(existing?.id || null);
    if (mode === 'album') {
      setForm({
        title: existing?.title || '',
        description: existing?.description || '',
        cover_image_url: existing?.cover_image_url || '',
        display_order: existing?.display_order ?? albums.length,
        is_published: existing ? Boolean(existing.is_published) : true,
      });
    } else {
      setForm({
        album_id: existing?.album_id ?? selectedAlbum,
        title: existing?.title || '',
        caption: existing?.caption || '',
        file_url: existing?.file_url || '',
        media_type: 'image',
        display_order: existing?.display_order ?? media.length,
        is_published: existing ? Boolean(existing.is_published) : true,
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMode) return;
    setErrorMsg('');
    const titleStr = String(form.title || '').trim();
    const fileUrlStr = String(form.file_url || '').trim();
    if (modalMode === 'album' && titleStr.length < 2) {
      setErrorMsg('Album title must be at least 2 characters.');
      return;
    }
    if (modalMode === 'media' && !fileUrlStr) {
      setErrorMsg('Please upload an image or provide an image URL.');
      return;
    }
    setSaving(true);
    try {
      await ensureMaterialized();
      const col = modalMode === 'album' ? 'gallery_albums' : 'gallery_media';
      const payload =
        modalMode === 'album'
          ? {
              title: titleStr.slice(0, 120),
              description: String(form.description || '').trim().slice(0, 400),
              cover_image_url: String(form.cover_image_url || '').trim().slice(0, 1000),
              display_order: Number(form.display_order) || 0,
              is_published: Boolean(form.is_published),
            }
          : {
              album_id: String(form.album_id || '').slice(0, 128),
              title: titleStr.slice(0, 160),
              caption: String(form.caption || '').trim().slice(0, 300),
              file_url: fileUrlStr.slice(0, 1000),
              media_type: 'image',
              display_order: Number(form.display_order) || 0,
              is_published: Boolean(form.is_published),
            };

      if (editingId) {
        await updateDocRecord(col, editingId, payload);
        await logAdminActivity('update', col, `Updated ${payload.title || editingId}`);
      } else {
        await createDocRecord(col, payload);
        await logAdminActivity('create', col, `Added ${payload.title || 'gallery item'}`);
      }
      setModalMode(null);
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not save gallery item.'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (
    col: 'gallery_albums' | 'gallery_media',
    item: { id: string; is_published: boolean; title?: string }
  ) => {
    setErrorMsg('');
    try {
      await ensureMaterialized();
      await updateDocRecord(col, item.id, { is_published: !item.is_published });
      await logAdminActivity(
        'update',
        col,
        `${!item.is_published ? 'Published' : 'Hid'} ${item.title || item.id}`
      );
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not update visibility.'));
    }
  };

  const handleMoveMedia = async (item: GalleryMedia, dir: -1 | 1) => {
    setErrorMsg('');
    try {
      const { mediaList } = await ensureMaterialized();
      const sorted = [...mediaList].sort((a, b) => a.display_order - b.display_order);
      const idx = sorted.findIndex((m) => m.id === item.id);
      const swapIdx = idx + dir;
      if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return;
      [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];
      await Promise.all(
        sorted.map((rec, orderIdx) =>
          updateDocRecord('gallery_media', rec.id, { display_order: orderIdx + 1 })
        )
      );
      await logAdminActivity('update', 'gallery_media', `Reordered ${item.title || item.id}`);
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not reorder photograph.'));
    }
  };

  const handleDelete = async (col: 'gallery_albums' | 'gallery_media', id: string, label: string) => {
    setErrorMsg('');
    try {
      await ensureMaterialized();
      await deleteDocRecord(col, id);
      await logAdminActivity('delete', col, `Removed ${label}`);
      if (col === 'gallery_albums' && selectedAlbum === id) setSelectedAlbum('');
      await load();
      await reloadSite();
    } catch (err) {
      setErrorMsg(unwrapErr(err, 'Could not delete item.'));
    }
  };

  const visibleMedia = selectedAlbum
    ? media.filter((m) => m.album_id === selectedAlbum)
    : media;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[hsl(var(--brand-navy))] sm:text-2xl">
            Gallery &amp; Albums
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Organize albums, reorder photographs, toggle visibility, or upload new gallery images.
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => setConfirmRestore(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-white px-3.5 py-2 text-xs font-semibold text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-surface))]"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Restore defaults</span>
        </button>
      </div>

      {statusMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && !modalMode && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="surface h-fit overflow-hidden">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
            <h2 className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--brand-navy))]">
              Albums
            </h2>
            <button
              type="button"
              onClick={() => openModal('album')}
              className="inline-flex items-center gap-1 rounded-md bg-[hsl(var(--brand-navy))] px-2.5 py-1 text-xs font-semibold text-white"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              <span>Album</span>
            </button>
          </div>
          <div className="divide-y divide-[hsl(var(--border))]">
            <button
              type="button"
              onClick={() => setSelectedAlbum('')}
              className={`w-full px-4 py-2.5 text-left text-xs font-semibold ${
                selectedAlbum === ''
                  ? 'bg-[hsl(var(--brand-surface))] text-[hsl(var(--brand-navy))]'
                  : 'text-slate-600'
              }`}
            >
              All photographs ({media.length})
            </button>
            {albums.map((alb) => (
              <div
                key={alb.id}
                className={`flex items-center justify-between gap-2 px-4 py-2.5 text-xs ${
                  selectedAlbum === alb.id ? 'bg-[hsl(var(--brand-surface))] font-bold' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedAlbum(alb.id)}
                  className={`flex-1 truncate text-left ${
                    alb.is_published ? 'text-[hsl(var(--brand-navy))]' : 'text-slate-400'
                  }`}
                >
                  {alb.title}
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(alb.is_published)}
                    onClick={() => handleToggle('gallery_albums', alb)}
                    aria-label={`${alb.is_published ? 'Hide' : 'Publish'} ${alb.title}`}
                    className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      alb.is_published ? 'bg-[hsl(var(--brand-navy))]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                        alb.is_published ? 'translate-x-3.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal('album', alb as unknown as Record<string, unknown> & { id: string })}
                    className="p-1 text-slate-400 hover:text-[hsl(var(--brand-navy))]"
                    aria-label={`Edit ${alb.title}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete('gallery_albums', alb.id, alb.title)}
                    className="p-1 text-red-500"
                    aria-label={`Delete ${alb.title}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
            <h2 className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--brand-navy))]">
              Photographs ({visibleMedia.length})
            </h2>
            <button
              type="button"
              onClick={() => openModal('media')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--brand-navy))] px-3.5 py-1.5 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add photo</span>
            </button>
          </div>

          {loading ? (
            <p className="p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">Loading…</p>
          ) : visibleMedia.length === 0 ? (
            <p className="px-5 py-14 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No photographs here yet. Click “Add photo” or “Restore defaults” above.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleMedia.map((item, idx) => (
                <div
                  key={item.id}
                  className={`overflow-hidden rounded-lg border border-[hsl(var(--border))] ${
                    item.is_published ? 'bg-white' : 'bg-slate-50 opacity-75'
                  }`}
                >
                  <SafeImage
                    src={item.file_url}
                    alt={item.title || 'Gallery photograph'}
                    className="h-32 w-full"
                  />
                  <div className="flex items-center justify-between gap-1 px-2.5 py-2">
                    <p className="truncate text-xs font-semibold text-slate-700">
                      {item.title || 'Untitled'}
                    </p>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(item.is_published)}
                        onClick={() => handleToggle('gallery_media', item)}
                        aria-label={`${item.is_published ? 'Hide' : 'Publish'} ${item.title || 'photo'}`}
                        className={`mr-1 relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                          item.is_published ? 'bg-[hsl(var(--brand-navy))]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                            item.is_published ? 'translate-x-3.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      {!selectedAlbum && (
                        <>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveMedia(item, -1)}
                            className="p-1 text-slate-400 hover:text-[hsl(var(--brand-navy))] disabled:opacity-25"
                            aria-label="Move photo up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === visibleMedia.length - 1}
                            onClick={() => handleMoveMedia(item, 1)}
                            className="p-1 text-slate-400 hover:text-[hsl(var(--brand-navy))] disabled:opacity-25"
                            aria-label="Move photo down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => openModal('media', item as unknown as Record<string, unknown> & { id: string })}
                        className="p-1 text-slate-400 hover:text-[hsl(var(--brand-navy))]"
                        aria-label="Edit photo"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete('gallery_media', item.id, item.title || 'photo')}
                        className="p-1 text-red-500"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmRestore && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/60 p-4"
        >
          <div className="surface w-full max-w-md space-y-4 p-6">
            <h2 className="text-base font-bold text-[hsl(var(--brand-navy))]">
              Restore default gallery?
            </h2>
            <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              This will restore the default campus albums and photographs and remove custom gallery
              additions.
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

      {modalMode && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/60 p-4"
        >
          <form
            onSubmit={handleSave}
            className="surface max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[hsl(var(--brand-navy))]">
                {editingId ? 'Edit' : 'New'} {modalMode === 'album' ? 'album' : 'photograph'}
              </h2>
              <button type="button" onClick={() => setModalMode(null)} aria-label="Close">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {modalMode === 'media' && (
              <div>
                <label className="mb-1 block text-xs font-semibold">Album</label>
                <select
                  value={String(form.album_id || '')}
                  onChange={(e) => setForm((f) => ({ ...f, album_id: e.target.value }))}
                  className={INPUT_CLASS}
                >
                  <option value="">No album</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold">Title</label>
              <input
                className={INPUT_CLASS}
                required={modalMode === 'album'}
                minLength={modalMode === 'album' ? 2 : undefined}
                maxLength={modalMode === 'album' ? 120 : 160}
                value={String(form.title || '')}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            {modalMode === 'album' ? (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold">Description</label>
                  <textarea
                    rows={2}
                    maxLength={400}
                    className={INPUT_CLASS}
                    value={String(form.description || '')}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <ImageUploaderField
                  id="alb-cover"
                  label="Album cover image (optional)"
                  value={String(form.cover_image_url || '')}
                  onChange={(url) => setForm((f) => ({ ...f, cover_image_url: url }))}
                  folder="gallery_albums"
                />
              </>
            ) : (
              <>
                <ImageUploaderField
                  id="gal-file"
                  label="Photograph"
                  value={String(form.file_url || '')}
                  onChange={(url) => setForm((f) => ({ ...f, file_url: url }))}
                  folder="gallery"
                />
                <div>
                  <label className="mb-1 block text-xs font-semibold">Caption</label>
                  <input
                    className={INPUT_CLASS}
                    value={String(form.caption || '')}
                    onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--brand-navy))]">
                <input
                  type="checkbox"
                  checked={Boolean(form.is_published)}
                  onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                <span>Published</span>
              </label>
              <div className="w-28">
                <label className="mb-1 block text-xs font-semibold">Order</label>
                <input
                  type="number"
                  className={INPUT_CLASS}
                  value={Number(form.display_order || 0)}
                  onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))}
                />
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--brand-navy))] px-5 py-2 text-xs font-semibold text-white"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                <span>Save</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
