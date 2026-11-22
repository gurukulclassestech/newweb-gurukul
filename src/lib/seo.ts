import { useEffect } from 'react';
import { useSite } from '../context/SiteContext';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

function upsertFavicon(href: string) {
  if (!href) return;
  let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}

export function usePageSeo(
  pageKey: string,
  title?: string,
  description?: string,
  ogImage?: string
) {
  const { site } = useSite();

  useEffect(() => {
    const baseName = site.institute_name || "Giri Sir's Gurukul Classes";
    const resolvedTitle =
      pageKey === 'home'
        ? site.seo_title || `${baseName} | Coaching in Chhatrapati Sambhajinagar`
        : title
          ? `${title} | ${baseName}`
          : baseName;

    const resolvedDescription =
      description ||
      site.seo_description ||
      `Structured coaching for school, board and competitive examinations at ${baseName}.`;

    document.title = resolvedTitle;
    if (site.favicon_url) {
      upsertFavicon(site.favicon_url);
    }
    upsertMeta('name', 'description', resolvedDescription);
    if (site.seo_keywords) {
      upsertMeta('name', 'keywords', site.seo_keywords);
    }
    upsertMeta('property', 'og:title', resolvedTitle);
    upsertMeta('property', 'og:description', resolvedDescription);
    upsertMeta('property', 'og:site_name', baseName);
    upsertMeta('name', 'twitter:title', resolvedTitle);
    upsertMeta('name', 'twitter:description', resolvedDescription);

    const img = ogImage || site.og_image_url;
    if (img) {
      upsertMeta('property', 'og:image', img);
      upsertMeta('name', 'twitter:image', img);
    }

    const canonicalUrl = window.location.origin + window.location.pathname;
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertCanonical(canonicalUrl);
  }, [pageKey, title, description, ogImage, site]);
}
