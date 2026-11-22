# Firestore Security Specification — Giri Sir's Gurukul Classes

## 1. Data Invariants
1. **Default-Deny Baseline**: Every unmapped path is denied (`match /{document=**} { allow read, write: if false; }`).
2. **Public Content Isolation**: Public visitors may only read published institute content (`courses`, `exams`, `lectures`, `results`, `faculty`, `testimonials`, `gallery_albums`, `gallery_media`, `blogs` where `is_published == true`, active `banners`, `site_settings`, `nav_items`, `homepage_sections`). Unpublished drafts are readable only by verified admins.
3. **PII Strict Protection**: `enquiries`, `admissions`, `admins`, and `admin_activity` contain student/parent PII (names, phone numbers, emails, addresses) or privileged RBAC metadata. Public visitors and non-admin signed-in users are strictly forbidden from `get`, `list`, `update`, or `delete` on these collections.
4. **Public Write Validation & Duplicate Guard**: Public visitors may `create` documents in `enquiries` and `admissions` ONLY with strictly validated fields (`student_name`, `phone` regex, `status == 'new'` / `'pending'`, `created_at == request.time`, `updated_at == request.time`), bounded lengths, exact key allowlists (`hasOnly`), and deterministic document IDs (`isValidId`) that prevent duplicate same-day submissions for the same mobile + course.
5. **Verified Admin RBAC**: `isAdmin()` requires `request.auth != null && request.auth.token.email_verified == true` AND either the bootstrapped owner email (`gurukulclassestech@gmail.com`) or `exists(/databases/$(database)/documents/admins/$(request.auth.uid))`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. Unauthenticated `list` on `/enquiries` -> `PERMISSION_DENIED`
2. Authenticated non-admin `get` on `/enquiries/{id}` -> `PERMISSION_DENIED`
3. Unauthenticated `create` on `/enquiries/{id}` with `status: "enrolled"` (state shortcut) -> `PERMISSION_DENIED`
4. Unauthenticated `create` on `/enquiries/{id}` with ghost field `isAdmin: true` (shadow field) -> `PERMISSION_DENIED`
5. Unauthenticated `create` on `/enquiries/{id}` with spoofed `created_at` in the past -> `PERMISSION_DENIED`
6. Unauthenticated `create` on `/enquiries/{id}` with invalid 3-digit phone `"123"` -> `PERMISSION_DENIED`
7. Unauthenticated `create` on `/enquiries/{id}` with 50KB `message` (Denial of Wallet) -> `PERMISSION_DENIED`
8. Unauthenticated `create` on `/courses/{id}` -> `PERMISSION_DENIED`
9. Non-admin authenticated `update` on `/site_settings/main` -> `PERMISSION_DENIED`
10. Unverified email (`email_verified: false`) matching admin email writing `/courses/{id}` -> `PERMISSION_DENIED`
11. Document ID poisoning (`/enquiries/bad$id/../../../etc` or >128 chars) -> `PERMISSION_DENIED`
12. Unauthenticated `read` on `/admins/{uid}` or `/admin_activity/{id}` -> `PERMISSION_DENIED`
