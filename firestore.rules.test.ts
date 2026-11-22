/**
 * Security Rules Specification & Verification Vectors for Giri Sir's Gurukul Classes.
 * Documents the 12 Dirty Dozen adversarial payloads tested against firestore.rules.
 */
export const DIRTY_DOZEN_VECTORS = [
  { name: 'Unauthenticated list on /enquiries', path: 'enquiries', op: 'list', expected: 'PERMISSION_DENIED' },
  { name: 'Non-admin get on /enquiries/{id}', path: 'enquiries/test_id', op: 'get', expected: 'PERMISSION_DENIED' },
  { name: 'State shortcut create on /enquiries with status=enrolled', path: 'enquiries/9823012345_gen_20261118', op: 'create', payload: { student_name: 'Test', phone: '9823012345', status: 'enrolled' }, expected: 'PERMISSION_DENIED' },
  { name: 'Shadow ghost field isAdmin=true on /enquiries create', path: 'enquiries/9823012345_gen_20261118', op: 'create', payload: { student_name: 'Test', phone: '9823012345', status: 'new', isAdmin: true }, expected: 'PERMISSION_DENIED' },
  { name: 'Spoofed created_at timestamp in past on /enquiries create', path: 'enquiries/9823012345_gen_20261118', op: 'create', payload: { student_name: 'Test', phone: '9823012345', status: 'new', created_at: '2020-01-01T00:00:00Z' }, expected: 'PERMISSION_DENIED' },
  { name: 'Invalid short phone number on /enquiries create', path: 'enquiries/123_gen_20261118', op: 'create', payload: { student_name: 'Test', phone: '123', status: 'new' }, expected: 'PERMISSION_DENIED' },
  { name: 'Oversized 50KB message payload on /enquiries create', path: 'enquiries/9823012345_gen_20261118', op: 'create', payload: { student_name: 'Test', phone: '9823012345', status: 'new', message: 'A'.repeat(50000) }, expected: 'PERMISSION_DENIED' },
  { name: 'Unauthenticated create on /courses', path: 'courses/c1', op: 'create', expected: 'PERMISSION_DENIED' },
  { name: 'Non-admin update on /site_settings/main', path: 'site_settings/main', op: 'update', expected: 'PERMISSION_DENIED' },
  { name: 'Unverified admin email writing /courses', path: 'courses/c1', op: 'create', auth: { email: 'gurukulclassestech@gmail.com', email_verified: false }, expected: 'PERMISSION_DENIED' },
  { name: 'Path variable ID poisoning (>128 chars or invalid chars)', path: 'enquiries/bad$id', op: 'create', expected: 'PERMISSION_DENIED' },
  { name: 'Unauthenticated read on /admins/{uid} or /admin_activity', path: 'admins/uid1', op: 'get', expected: 'PERMISSION_DENIED' }
];
