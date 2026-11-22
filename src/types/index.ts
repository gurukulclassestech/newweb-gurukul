export interface HighlightStat {
  value: string;
  label: string;
}

export interface ApproachStep {
  title: string;
  description: string;
}

export interface CourseCategoryBlurb {
  category: string;
  description: string;
}

export interface SiteSettings {
  institute_name: string;
  tagline: string;
  about_heading: string;
  about_intro: string;
  about_mission: string;
  about_story: string;
  about_highlights: HighlightStat[];
  courses_eyebrow: string;
  courses_title: string;
  courses_description: string;
  courses_badge: string;
  courses_category_descriptions?: CourseCategoryBlurb[];
  courses_approach_eyebrow: string;
  courses_approach_title: string;
  courses_approach_description: string;
  courses_approach_steps: ApproachStep[];
  logo_url: string;
  logo_width: string;
  logo_height: string;
  favicon_url: string;
  phone: string;
  email: string;
  whatsapp: string;
  whatsapp_float_enabled: boolean;
  whatsapp_prefill_message: string;
  address: string;
  map_embed_url: string;
  map_link: string;
  office_hours: string;
  announcement_enabled: boolean;
  announcement_text: string;
  announcement_bg_color: string;
  announcement_text_color: string;
  header_bg_color: string;
  header_text_color: string;
  footer_about: string;
  footer_copyright: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  twitter_url: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_image_url: string;
  popup_enabled: boolean;
  popup_title: string;
  popup_body: string;
  popup_cta_label: string;
  popup_cta_link: string;
  popup_submit_label: string;
  popup_image_url: string;
  popup_delay_seconds: number;
  popup_frequency: 'session' | 'once' | 'always';
  popup_show_parent_name: boolean;
  popup_show_email: boolean;
  popup_show_class: boolean;
  popup_show_course: boolean;
  popup_show_batch: boolean;
  popup_show_message: boolean;
  payments_enabled: boolean;
  payment_fee_label: string;
  upi_id: string;
  payment_qr_url: string;
  bank_details: string;
  payment_instructions: string;
  header_cta_enabled?: boolean;
  header_cta_label?: string;
  header_cta_link?: string;
  float_apply_enabled?: boolean;
  float_apply_label?: string;
  float_apply_link?: string;
  customized_modules?: string[];
  privacy_content: string;
  terms_content: string;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  location: 'header' | 'footer';
  display_order: number;
  open_in_new_tab?: boolean;
}

export interface SectionSubItem {
  title?: string;
  description?: string;
  value?: string;
  label?: string;
  icon?: string;
  image_url?: string;
  points?: string[];
}

export interface HomepageSection {
  id: string;
  key: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
  image_url?: string;
  button_label?: string;
  button_link?: string;
  display_order: number;
  is_visible: boolean;
  items?: SectionSubItem[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  mobile_image_url?: string;
  primary_label?: string;
  primary_url?: string;
  secondary_label?: string;
  secondary_url?: string;
  deadline?: string;
  display_order: number;
  is_active: boolean;
}

export interface Course {
  id: string;
  slug?: string;
  name: string;
  category: string;
  class_level: string;
  duration?: string;
  target_exams?: string;
  batch_info?: string;
  subjects?: string;
  fee?: string;
  description?: string;
  highlights?: string;
  eligibility?: string;
  methodology?: string;
  exam_preparation?: string;
  admission_status?: 'open' | 'closing_soon' | 'closed';
  image_url?: string;
  display_order: number;
  is_published: boolean;
  is_featured?: boolean;
}

export interface Exam {
  id: string;
  title: string;
  course_category?: string;
  class_level?: string;
  exam_date?: string;
  exam_time?: string;
  start_time?: string;
  duration_minutes?: number;
  syllabus?: string;
  instructions?: string;
  status: 'upcoming' | 'open' | 'completed' | 'closed';
  registration_link?: string;
  registration_url?: string;
  display_order: number;
  is_published: boolean;
}

export interface Lecture {
  id: string;
  title: string;
  subject: string;
  class_level: string;
  teacher_name?: string;
  duration?: string;
  video_url: string;
  thumbnail_url?: string;
  description?: string;
  display_order: number;
  is_published: boolean;
}

export interface StudentResult {
  id: string;
  student_name: string;
  achievement_title: string;
  score: string;
  class_level?: string;
  academic_year: string;
  photo_url?: string;
  document_url?: string;
  display_order: number;
  is_featured?: boolean;
  is_published: boolean;
}

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  subjects: string;
  qualification?: string;
  experience?: string;
  bio?: string;
  photo_url?: string;
  display_order: number;
  is_published: boolean;
}

export interface Testimonial {
  id: string;
  display_name: string;
  role_or_class?: string;
  quote: string;
  rating: number;
  photo_url?: string;
  display_order: number;
  is_published: boolean;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  display_order: number;
  is_published: boolean;
}

export interface GalleryMedia {
  id: string;
  album_id?: string;
  title?: string;
  caption?: string;
  file_url: string;
  media_type: 'image' | 'video';
  display_order: number;
  is_published: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category?: string;
  author?: string;
  published_date?: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  is_published: boolean;
}

export interface Enquiry {
  id: string;
  student_name: string;
  parent_name?: string;
  phone: string;
  email?: string;
  class_level?: string;
  course_name?: string;
  preferred_batch?: string;
  message?: string;
  source?: string;
  status: 'new' | 'contacted' | 'enrolled' | 'closed';
  admin_notes?: string;
  created_at?: unknown;
  updated_at?: unknown;
}

export interface AdmissionApplication {
  id: string;
  student_name: string;
  parent_name: string;
  phone: string;
  email?: string;
  class_level: string;
  course_name?: string;
  preferred_batch?: string;
  school?: string;
  address?: string;
  message?: string;
  reference_code: string;
  status: 'pending' | 'verified' | 'confirmed' | 'rejected';
  admin_notes?: string;
  created_at?: unknown;
  updated_at?: unknown;
}

export interface AdminActivity {
  id: string;
  action: string;
  entity: string;
  summary: string;
  actor_email: string;
  created_at?: unknown;
}

export interface PaymentRecord {
  id: string;
  student_name: string;
  phone: string;
  course_name?: string;
  amount: string;
  payment_method?: string;
  reference_id?: string;
  paid_date?: string;
  status: 'pending' | 'verified' | 'failed' | 'refunded';
  notes?: string;
  created_at?: unknown;
  updated_at?: unknown;
}
