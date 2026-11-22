import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { fetchPublished } from '../lib/firestoreApi';
import { usePageSeo } from '../lib/seo';
import {
  CardSkeletonGrid,
  EmptyState,
  FacultyCard,
  PageHeroBanner,
} from '../components/CommonUI';
import type { FacultyMember } from '../types';

export function FacultyPage() {
  usePageSeo(
    'faculty',
    'Faculty and mentors',
    'Teaching profiles, subjects, qualifications and experience at Giri Sir\'s Gurukul Classes.'
  );

  const [items, setItems] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublished<FacultyMember>('faculty', 'display_order', 'asc', 100)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeroBanner
        eyebrow="Our teachers"
        title="Faculty and mentors"
        description="Subject teachers who work with the same students through the year — tracking daily practice, tests and doubts."
      />

      <section className="shell py-12 sm:py-16">
        {loading ? (
          <CardSkeletonGrid count={4} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Faculty profiles are being added"
            description="Teaching profiles appear here once the institute publishes them."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((member) => (
              <FacultyCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
