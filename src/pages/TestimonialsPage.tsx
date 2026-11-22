import { useEffect, useState } from 'react';
import { MessageSquareQuote } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { DEFAULT_TESTIMONIALS } from '../data/defaults';
import { fetchPublished } from '../lib/firestoreApi';
import { usePageSeo } from '../lib/seo';
import {
  CardSkeletonGrid,
  EmptyState,
  PageHeroBanner,
  TestimonialCard,
} from '../components/CommonUI';
import type { Testimonial } from '../types';

export function TestimonialsPage() {
  const { site } = useSite();
  usePageSeo(
    'testimonials',
    'Student testimonials',
    "Feedback shared by students and parents of Giri Sir's Gurukul Classes with their permission."
  );

  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublished<Testimonial>('testimonials', 'display_order', 'asc', 100)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const isCustomized = site.customized_modules?.includes('testimonials');
  const displayItems = isCustomized ? items : items.length > 0 ? items : DEFAULT_TESTIMONIALS;

  return (
    <>
      <PageHeroBanner
        eyebrow="Student voices"
        title="Testimonials"
        description="Feedback is published here only after a student or parent approves it. Nothing is written on their behalf."
      />

      <section className="shell py-12 sm:py-16">
        {loading ? (
          <CardSkeletonGrid count={6} />
        ) : displayItems.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title="No testimonials published yet"
            description="Approved student feedback will appear here. The institute publishes a testimonial only with permission."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayItems.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
