import React, { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { uploadMediaFile } from '../../lib/firebase';
import { SafeImage } from '../SafeImage';

interface ImageUploaderFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
}

export function ImageUploaderField({
  id,
  label,
  value,
  onChange,
  folder = 'uploads',
  placeholder = 'https://... or upload an image',
}: ImageUploaderFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a PNG, JPG, or WEBP image.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Image must be smaller than 4 MB.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const url = await uploadMediaFile(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-semibold text-[hsl(var(--foreground))]">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2 text-sm outline-none transition focus:border-[hsl(var(--brand-navy))] focus:ring-2 focus:ring-[hsl(var(--brand-navy))]/15"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFile}
          className="sr-only"
          id={`${id}-file`}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))] px-3.5 py-2 text-xs font-semibold text-[hsl(var(--brand-navy))] transition hover:bg-slate-200/70 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{uploading ? 'Uploading…' : 'Upload image'}</span>
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {value && (
        <div className="h-28 w-44 overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--brand-surface))]">
          <SafeImage src={value} alt={label} className="h-full w-full" />
        </div>
      )}
    </div>
  );
}
