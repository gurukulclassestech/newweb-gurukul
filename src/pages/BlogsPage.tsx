import { useEffect, useMemo, useState } from 'react';
import { Newspaper, Search } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { DEFAULT_BLOGS } from '../data/defaults';
import { fetchPublished } from '../lib/firestoreApi';
import { usePageSeo } from '../lib/seo';
import {
  BlogCard,
  CardSkeletonGrid,
  EmptyState,
  PageHeroBanner,
} from '../components/CommonUI';
import type { BlogPost } from '../types';

const INPUT_CLASS =
  'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--brand-navy))] focus:ring-2 focus:ring-[hsl(var(--brand-navy))]/15';

export function BlogsPage() {
  const { site } = useSite();
  usePageSeo(
    'blogs',
    'News and articles',
    'Institute notices, exam guidance and study advice for students and parents.'
  );

  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchPublished<BlogPost>('blogs', 'published_date', 'desc', 100)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const isCustomized = site.customized_modules?.includes('blogs');
  const displayItems = isCustomized ? items : items.length > 0 ? items : DEFAULT_BLOGS;

  const categories = useMemo(
    () => [...new Set(displayItems.map((b) => b.category).filter(Boolean) as string[])],
    [displayItems]
  );

  const filtered = displayItems.filter((post) => {
    const q = search.trim().toLowerCase();
    const matchText =
      !q ||
      [post.title, post.excerpt, post.content]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    const matchCat = !category || post.category === category;
    return matchText && matchCat;
  });

  return (
    <>
      <PageHeroBanner
        eyebrow="Newsroom"
        title="News and articles"
        description="Institute notices, exam guidance and study advice for students and parents."
      />

      <section className="shell py-12 sm:py-16">
        <div className="surface grid gap-3 p-4 sm:grid-cols-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              aria-hidden="true"
            />
            <input
              className={`${INPUT_CLASS} pl-9`}
              placeholder="Search articles"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search articles"
            />
          </div>
          <select
            className={INPUT_CLASS}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8">
          {loading ? (
            <CardSkeletonGrid count={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="No article matches this search"
              description="Try a different search term or category."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
