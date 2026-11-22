import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Newspaper, User } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { DEFAULT_BLOGS } from '../data/defaults';
import { fetchPublishedBlogBySlug } from '../lib/firestoreApi';
import { usePageSeo } from '../lib/seo';
import { EmptyState, RichInlineText, formatDate } from '../components/CommonUI';
import { SafeImage } from '../components/SafeImage';
import type { BlogPost } from '../types';

export function BlogDetailPage() {
  const { site } = useSite();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  usePageSeo(
    'blogs',
    post?.seo_title || post?.title || 'Article',
    post?.seo_description || post?.excerpt
  );

  const isCustomized = site.customized_modules?.includes('blogs');

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetchPublishedBlogBySlug<BlogPost>(slug)
      .then((doc) => {
        if (!active) return;
        if (doc && doc.is_published !== false) {
          setPost(doc);
        } else if (!isCustomized) {
          setPost(DEFAULT_BLOGS.find((b) => b.slug === slug || b.id === slug) || null);
        } else {
          setPost(null);
        }
      })
      .catch(() => {
        if (active) {
          setPost(
            isCustomized ? null : DEFAULT_BLOGS.find((b) => b.slug === slug || b.id === slug) || null
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, isCustomized]);

  if (loading) {
    return (
      <div className="shell py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--brand-surface))] border-t-[hsl(var(--brand-navy))]" />
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Loading article…</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="shell py-20">
        <EmptyState
          icon={Newspaper}
          title="Article not found"
          description="This article may have been unpublished or removed."
        >
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--brand-navy))] px-4 py-2 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to articles</span>
          </Link>
        </EmptyState>
      </div>
    );
  }

  const blocks = String(post.content || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="shell max-w-3xl py-12 sm:py-16">
      <Link
        to="/blogs"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--brand-navy))]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>All articles</span>
      </Link>

      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        {post.category && (
          <span className="text-[hsl(var(--brand-blue))]">{post.category}</span>
        )}
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(post.published_date) || 'Notice'}
        </span>
        {post.author && (
          <span className="inline-flex items-center gap-1">
            <User className="h-3.5 w-3.5" aria-hidden="true" />
            {post.author}
          </span>
        )}
      </div>

      <h1 className="display-face mt-3 text-[2rem] leading-tight text-[hsl(var(--brand-navy))] sm:text-[2.6rem]">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="mt-3 text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
          {post.excerpt}
        </p>
      )}

      {post.featured_image_url && (
        <div className="mt-7 h-[240px] overflow-hidden rounded-2xl sm:h-[340px]">
          <SafeImage
            src={post.featured_image_url}
            alt={post.title}
            className="h-full w-full"
          />
        </div>
      )}

      <div className="prose-site mt-8 space-y-4">
        {blocks.map((block, idx) => {
          if (block.startsWith('## ')) {
            return (
              <h2
                key={idx}
                className="pt-2 text-xl font-bold text-[hsl(var(--brand-navy))]"
              >
                {block.replace(/^##\s+/, '')}
              </h2>
            );
          }
          if (block.startsWith('### ')) {
            return (
              <h3
                key={idx}
                className="pt-1 text-lg font-bold text-[hsl(var(--brand-navy))]"
              >
                {block.replace(/^###\s+/, '')}
              </h3>
            );
          }
          return (
            <p key={idx} className="leading-relaxed text-[hsl(var(--foreground))]">
              <RichInlineText text={block} />
            </p>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))] p-6">
        <h2 className="text-base font-bold text-[hsl(var(--brand-navy))]">
          Thinking about admission?
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Speak to the admissions team about batches, subjects and fees.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admission"
            className="inline-flex items-center rounded-lg bg-[#FFBE1B] px-4 py-2 text-sm font-semibold text-[#122B5C] hover:bg-[#f2b211]"
          >
            Apply for admission
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center rounded-lg border border-[hsl(var(--border))] bg-white px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-navy))] hover:bg-white/80"
          >
            Contact us
          </Link>
        </div>
      </div>
    </article>
  );
}
