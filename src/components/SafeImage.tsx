import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  eager?: boolean;
  fit?: 'cover' | 'contain';
}

export function SafeImage({
  src,
  alt,
  className = '',
  eager = false,
  fit = 'cover',
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-2 bg-[hsl(var(--brand-surface))] text-[hsl(var(--brand-navy))]/45 ${className}`}
      >
        <BookOpen className="h-7 w-7" aria-hidden="true" />
        <span className="max-w-[80%] truncate px-2 text-center text-xs font-medium">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
    />
  );
}
