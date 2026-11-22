import { useEffect, useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { DEFAULT_GALLERY_ALBUMS, REPRESENTATIVE_GALLERY } from '../data/defaults';
import { fetchPublished } from '../lib/firestoreApi';
import { usePageSeo } from '../lib/seo';
import {
  CardSkeletonGrid,
  EmptyState,
  GalleryTile,
  PageHeroBanner,
} from '../components/CommonUI';
import { SafeImage } from '../components/SafeImage';
import type { GalleryAlbum, GalleryMedia } from '../types';

export function GalleryPage() {
  const { site } = useSite();
  usePageSeo(
    'gallery',
    'Gallery',
    "Photographs from classrooms, study spaces and institute events at Giri Sir's Gurukul Classes."
  );

  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [activeItem, setActiveItem] = useState<GalleryMedia | null>(null);

  useEffect(() => {
    Promise.all([
      fetchPublished<GalleryMedia>('gallery_media', 'display_order', 'asc', 200).catch(() => []),
      fetchPublished<GalleryAlbum>('gallery_albums', 'display_order', 'asc', 50).catch(() => []),
    ])
      .then(([m, a]) => {
        setMedia(m.filter((item) => (item.media_type || 'image') === 'image'));
        setAlbums(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const isCustomized = site.customized_modules?.includes('gallery');
  const displayAlbums = isCustomized ? albums : albums.length > 0 ? albums : DEFAULT_GALLERY_ALBUMS;
  const displayMedia = isCustomized ? media : media.length > 0 ? media : REPRESENTATIVE_GALLERY;
  const filtered = selectedAlbum
    ? displayMedia.filter((item) => item.album_id === selectedAlbum)
    : displayMedia;

  return (
    <>
      <PageHeroBanner
        eyebrow="Gallery"
        title="Inside the institute"
        description="Classrooms, study spaces and moments from the academic year. Photographs of students are published only with permission."
      />

      <section className="shell py-12 sm:py-16">
        {displayAlbums.length > 0 && (
          <div className="mb-7 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedAlbum('')}
              className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedAlbum === ''
                  ? 'border-[hsl(var(--brand-navy))] bg-[hsl(var(--brand-navy))] text-white'
                  : 'border-[hsl(var(--border))] bg-white text-[hsl(var(--foreground))]'
              }`}
            >
              All albums
            </button>
            {displayAlbums.map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => setSelectedAlbum(album.id)}
                className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition ${
                  selectedAlbum === album.id
                    ? 'border-[hsl(var(--brand-navy))] bg-[hsl(var(--brand-navy))] text-white'
                    : 'border-[hsl(var(--border))] bg-white text-[hsl(var(--foreground))]'
                }`}
              >
                {album.title}
              </button>
            ))}
          </div>
        )}

        {!loading && !isCustomized && media.length === 0 && (
          <p className="mb-4 inline-flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Campus gallery preview — upload or manage albums anytime in the Admin Gallery console.</span>
          </p>
        )}

        {loading ? (
          <CardSkeletonGrid count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No photographs in this album yet"
            description="Photographs uploaded from the admin console will appear here."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => (
              <GalleryTile key={item.id} item={item} onOpen={setActiveItem} />
            ))}
          </div>
        )}
      </section>

      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title || 'Gallery photograph'}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D40]/80 p-4"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="surface relative w-full max-w-3xl p-3 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              aria-label="Close photograph"
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#122B5C] shadow"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <SafeImage
              src={activeItem.file_url}
              alt={activeItem.title || 'Gallery photograph'}
              fit="contain"
              className="max-h-[72vh] w-full rounded-lg bg-[hsl(var(--brand-surface))]"
            />
            {(activeItem.title || activeItem.caption) && (
              <p className="mt-2.5 px-1 text-sm text-[hsl(var(--muted-foreground))]">
                <span className="font-semibold text-[hsl(var(--brand-navy))]">
                  {activeItem.title}
                </span>
                {activeItem.caption ? ` — ${activeItem.caption}` : ''}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
