import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { where } from 'firebase/firestore';
import {
  DEFAULT_BANNER,
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_NAV_ITEMS,
  DEFAULT_SITE_SETTINGS,
} from '../data/defaults';
import { fetchCollection, getSingleton } from '../lib/firestoreApi';
import type { Banner, HomepageSection, NavItem, SiteSettings } from '../types';

interface SiteContextValue {
  site: SiteSettings;
  headerNav: NavItem[];
  footerNav: NavItem[];
  sections: HomepageSection[];
  banners: Banner[];
  loading: boolean;
  reloadSite: () => Promise<void>;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [site, setSite] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [headerNav, setHeaderNav] = useState<NavItem[]>(
    DEFAULT_NAV_ITEMS.filter((i) => i.location === 'header')
  );
  const [footerNav, setFooterNav] = useState<NavItem[]>(
    DEFAULT_NAV_ITEMS.filter((i) => i.location === 'footer')
  );
  const [sections, setSections] = useState<HomepageSection[]>(DEFAULT_HOMEPAGE_SECTIONS);
  const [banners, setBanners] = useState<Banner[]>([DEFAULT_BANNER]);
  const [loading, setLoading] = useState(true);

  const reloadSite = useCallback(async () => {
    try {
      const [settingsDoc, navRows, sectionRows, bannerRows] = await Promise.all([
        getSingleton<SiteSettings>('site_settings', 'main').catch(() => null),
        fetchCollection<NavItem>(
          'nav_items',
          [where('location', 'in', ['header', 'footer'])],
          'display_order',
          'asc'
        ).catch(() => []),
        fetchCollection<HomepageSection>(
          'homepage_sections',
          [where('is_visible', '==', true)],
          'display_order',
          'asc'
        ).catch(() => []),
        fetchCollection<Banner>(
          'banners',
          [where('is_active', '==', true)],
          'display_order',
          'asc'
        ).catch(() => []),
      ]);

      const mergedSite = settingsDoc
        ? { ...DEFAULT_SITE_SETTINGS, ...settingsDoc }
        : DEFAULT_SITE_SETTINGS;
      const customized = Array.isArray(mergedSite.customized_modules)
        ? mergedSite.customized_modules
        : [];

      if (settingsDoc) {
        setSite(mergedSite);
      }

      if (navRows.length > 0 || customized.includes('nav_items')) {
        setHeaderNav(navRows.filter((n) => n.location === 'header'));
        setFooterNav(navRows.filter((n) => n.location === 'footer'));
      }
      if (sectionRows.length > 0 || customized.includes('homepage_sections')) {
        setSections(sectionRows);
      }
      if (bannerRows.length > 0 || customized.includes('banners')) {
        setBanners(bannerRows);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadSite();
  }, [reloadSite]);

  return (
    <SiteContext.Provider
      value={{ site, headerNav, footerNav, sections, banners, loading, reloadSite }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside SiteProvider');
  return ctx;
}
