import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/courses',
  '/exams',
  '/lectures',
  '/results',
  '/faculty',
  '/testimonials',
  '/gallery',
  '/blogs',
  '/contact',
  '/admission',
  '/privacy-policy',
  '/terms',
];

// In-memory recent submission dedup cache (phone|course|type -> timestamp)
const recentSubmissions = new Map<string, number>();
const DEDUP_WINDOW_MS = 1000 * 60 * 60 * 12; // 12 hours

function pruneDedupCache() {
  const now = Date.now();
  for (const [key, ts] of recentSubmissions.entries()) {
    if (now - ts > DEDUP_WINDOW_MS) {
      recentSubmissions.delete(key);
    }
  }
}

function sanitizeText(input: unknown, maxLen: number): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLen);
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  const uploadsDir = path.resolve(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'gurukul-classes' });
  });

  // Dynamic robots.txt
  app.get('/robots.txt', (req, res) => {
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /admin/*',
        'Disallow: /login',
        `Sitemap: ${origin.replace(/\/$/, '')}/sitemap.xml`,
      ].join('\n')
    );
  });

  // Dynamic sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    const origin = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const lastmod = new Date().toISOString().split('T')[0];
    const urls = PUBLIC_ROUTES.map(
      (route) =>
        `  <url>\n    <loc>${origin}${route}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>\n    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n  </url>`
    ).join('\n');

    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
    );
  });

  // Server-side enquiry & admission validation + duplicate check
  app.post('/api/validate-enquiry', (req, res) => {
    pruneDedupCache();
    const body = req.body || {};
    const kind = body.kind === 'admission' ? 'admission' : 'enquiry';

    const student_name = sanitizeText(body.student_name, 120);
    const parent_name = sanitizeText(body.parent_name, 120);
    const phone = sanitizeText(body.phone, 20);
    const email = sanitizeText(body.email, 120);
    const class_level = sanitizeText(body.class_level, 80);
    const course_name = sanitizeText(body.course_name, 160);
    const preferred_batch = sanitizeText(body.preferred_batch, 80);
    const school = sanitizeText(body.school, 160);
    const address = sanitizeText(body.address, 300);
    const message = sanitizeText(body.message, 2000);
    const source = sanitizeText(body.source, 60) || 'website';

    const errors: Record<string, string> = {};
    if (student_name.length < 2) {
      errors.student_name = "Please enter the student's full name.";
    }
    if (kind === 'admission' && parent_name.length < 2) {
      errors.parent_name = "Please enter the parent or guardian's name.";
    }
    const digits = normalizePhone(phone);
    if (digits.length < 10 || digits.length > 13 || !/^[+0-9\s()-]{10,20}$/.test(phone)) {
      errors.phone = 'Enter a valid mobile number (10–13 digits).';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (kind === 'admission' && !class_level) {
      errors.class_level = 'Please select the class.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ ok: false, errors });
    }

    const courseSlug = (course_name || 'general')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'general';
    const dateBucket = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const dedupKey = `${kind}_${digits}_${courseSlug}_${dateBucket}`;

    if (recentSubmissions.has(dedupKey)) {
      return res.status(409).json({
        ok: false,
        duplicate: true,
        message:
          'We already received a submission with this mobile number and course today. Our admissions team will reach out shortly.',
      });
    }

    // Generate deterministic Firestore-safe ID
    const hash = crypto.createHash('sha256').update(dedupKey).digest('hex').slice(0, 24);
    const docId = `${kind === 'admission' ? 'adm' : 'enq'}_${dateBucket}_${hash}`;

    return res.json({
      ok: true,
      docId,
      dedupKey,
      sanitized: {
        student_name,
        parent_name,
        phone,
        email,
        class_level,
        course_name,
        preferred_batch,
        school,
        address,
        message,
        source,
      },
    });
  });

  // Mark submission committed in dedup cache after Firestore write succeeds
  app.post('/api/confirm-enquiry', (req, res) => {
    const dedupKey = sanitizeText(req.body?.dedupKey, 120);
    if (dedupKey) {
      recentSubmissions.set(dedupKey, Date.now());
    }
    res.json({ ok: true });
  });

  // Image upload endpoint (used when client-side Firebase Storage is unavailable or as backup)
  app.post('/api/upload-image', (req, res) => {
    const { dataUrl, filename } = req.body || {};
    if (typeof dataUrl !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing image data.' });
    }
    const match = dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) {
      return res.status(400).json({ ok: false, error: 'Only PNG, JPG, or WEBP images are supported.' });
    }
    const mime = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 4 * 1024 * 1024) {
      return res.status(413).json({ ok: false, error: 'Image must be smaller than 4 MB.' });
    }
    const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
    const base = sanitizeText(filename, 40).replace(/[^a-zA-Z0-9_-]/g, '') || 'upload';
    const finalName = `${base}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const dest = path.join(uploadsDir, finalName);
    fs.writeFileSync(dest, buffer);
    return res.json({ ok: true, url: `/uploads/${finalName}` });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Giri Sir's Gurukul Classes server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
