import type {
  Banner,
  BlogPost,
  Course,
  Exam,
  GalleryAlbum,
  GalleryMedia,
  HomepageSection,
  NavItem,
  SiteSettings,
  StudentResult,
  Testimonial,
} from '../types';

export const ADMIN_EMAIL = 'gurukulclassestech@gmail.com';

export const SITE_IMAGES = {
  logo: '/assets/gurukul/logo.png',
  favicon: '/assets/gurukul/favicon.png',
  hero: '/assets/gurukul/hero_banner_0.png',
  mentoring: '/assets/gurukul/study_group.png',
  classroom: '/assets/gurukul/course_two-year-iit-jee-integrated-course.png',
  campusResidential: '/assets/gurukul/campus_0.png',
  campusDaycare: '/assets/gurukul/campus_1.png',
  galleryCampus: '/assets/gurukul/gallery_0.png',
  resultPoster: '/assets/gurukul/result_0.png',
  exam: '/assets/gurukul/study_group.png',
} as const;

export const CLASS_LEVELS = [
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'Starts from Class VIII',
  'Starts from Class IX',
  'Starts from Class X',
  'Class XI & XII',
  'Class 10 (SSC)',
  'Class 11 (Science)',
  'Class 12 (Science)',
  'Dropper / Repeater',
];

export const PREFERRED_BATCHES = [
  'Morning batch',
  'Afternoon batch',
  'Evening batch',
  'Weekend batch',
  'Any available batch',
];

export const DEFAULT_COURSE_CATEGORIES = [
  'IIT-JEE & NEET Two-Year Integrated Programme',
  'IIT-JEE & NEET Foundation Programme',
];

export const DEFAULT_COURSE_CATEGORY_DESCRIPTIONS = [
  {
    category: 'IIT-JEE & NEET Two-Year Integrated Programme',
    description:
      'Two-year integrated regular course for Class XI and XII. IIT-JEE preparation for JEE Main, JEE Advanced and MHT-CET. NEET preparation for NEET-UG and MHT-CET.',
  },
  {
    category: 'IIT-JEE & NEET Foundation Programme',
    description:
      'Integrated IIT-JEE and NEET foundation programme for Classes VIII, IX and X. Early preparation for competitive examinations through strong conceptual learning and school-level academic excellence.',
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  institute_name: "Giri Sir's Gurukul Classes",
  tagline:
    'Disciplined teaching, personal attention and steady daily practice — for school, board and competitive examinations.',
  about_heading: 'Excellence in Education. Excellence in Results. Excellence in Life.',
  about_intro:
    "Giri Sir's Gurukul Classes, Chhatrapati Sambhajinagar, has been a trusted name in IIT-JEE and NEET preparation since 2009, consistently delivering outstanding results in India's most challenging competitive examinations.",
  about_mission: "We don't just prepare students for examinations; we prepare them for life.",
  about_story: `Founded under the academic leadership of IITian Professor Pradip Giri, **Gurukul Classes** is built on a simple yet powerful philosophy: **“Study with Enjoyment.”**

Since 2009, we have been committed to nurturing academic excellence and helping students achieve their dreams through quality education, innovative teaching methodologies and personalized guidance.

Our achievements reflect our dedication and academic excellence. Our students have secured prestigious **JEE Advanced All India Ranks**, including AIR 8 in the General Category and AIR 3 and AIR 4 in other categories, along with numerous two-digit and three-digit ranks. In NEET, our students have achieved outstanding scores of 677 and 675, with several others scoring above 600 marks. Our students have successfully earned admissions to IITs, NITs, IIITs, AIIMS and other leading engineering and medical institutions across India.

**What makes Gurukul different is our approach to learning.** We believe education should inspire curiosity, build confidence and make learning enjoyable rather than stressful. Our unique teaching methodology focuses on conceptual clarity, innovative teaching techniques, systematic revision, daily practice, interactive learning, question-framing activities, regular assessments and individual mentoring.

We provide a comprehensive academic environment dedicated to **JEE, NEET and other competitive entrance examinations**. Our structured academic programs, experienced faculty, personalized attention and continuous performance monitoring ensure that every student receives the guidance and support needed to achieve their goals.

With dedicated residential campus facilities, separate accommodation for boys and girls, day-care and day-boarding facilities, and continuous academic supervision, we create a supportive and disciplined environment that encourages students to focus on their ambitions and reach their full potential.

**Our Mission**

Our mission is to identify every student's potential, nurture confidence, develop independent thinking and transform aspirations into achievements.

At Gurukul Classes, we don't just prepare students for examinations; we prepare them for success in life.

**Since 2009, one commitment has remained unchanged: Every student deserves the opportunity to achieve excellence.**`,
  about_highlights: [
    { value: '2009', label: 'Established' },
    { value: 'AIR 8', label: 'JEE Advanced (General)' },
    { value: '677+', label: 'NEET score' },
    { value: 'IIT · NIT · AIIMS', label: "Our students' destinations" },
  ],
  courses_eyebrow: 'Courses offered',
  courses_title: 'IIT-JEE & NEET programmes at Gurukul',
  courses_description:
    'Two-year integrated courses for Class XI and XII, plus foundation programmes starting from Class VIII. Every programme combines school academics with disciplined competitive examination preparation.',
  courses_badge: 'Learn · Understand · Practise · Excel',
  courses_category_descriptions: DEFAULT_COURSE_CATEGORY_DESCRIPTIONS,
  courses_approach_eyebrow: 'Our approach',
  courses_approach_title: 'Learn · Understand · Practise · Excel',
  courses_approach_description:
    "An integrated learning system designed to prepare students for academic excellence and success in national-level competitive examinations.",
  courses_approach_steps: [
    {
      title: 'Learn',
      description: 'Understand fundamental concepts through structured classroom teaching.',
    },
    {
      title: 'Understand',
      description: 'Develop conceptual clarity with doubt-solving and application-based learning.',
    },
    {
      title: 'Practise',
      description: 'Improve through regular problem-solving, assignments and tests.',
    },
    {
      title: 'Excel',
      description: 'Achieve academic and competitive examination goals with mock tests and revision.',
    },
  ],
  logo_url: SITE_IMAGES.logo,
  logo_width: '90',
  logo_height: '55',
  favicon_url: SITE_IMAGES.favicon,
  phone: '+91 9860968994',
  email: 'gurukulclassestech@gmail.com',
  whatsapp: '+91 8459847998',
  whatsapp_float_enabled: true,
  whatsapp_prefill_message:
    "Hello Giri Sir's Gurukul Classes, I would like to know about admissions.",
  address: "Giri Sir's Gurukul Classes, Chhatrapati Sambhajinagar, Maharashtra, India",
  map_embed_url: '',
  map_link: '',
  office_hours: 'Monday to Sunday, 8:00 AM – 8:00 PM',
  announcement_enabled: true,
  announcement_text: 'Admissions open for the new academic batch — limited seats per batch.',
  announcement_bg_color: '#FFBE1B',
  announcement_text_color: '#122B5C',
  header_bg_color: '#122B5C',
  header_text_color: '#FFFFFF',
  footer_about:
    'A neighbourhood gurukul for serious students — small batches, daily practice, weekly tests and honest feedback to parents.',
  footer_copyright: "© Giri Sir's Gurukul Classes. All rights reserved.",
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  twitter_url: '',
  seo_title: "Giri Sir's Gurukul Classes | Coaching in Chhatrapati Sambhajinagar",
  seo_description:
    "Structured coaching for school, board and competitive examinations at Giri Sir's Gurukul Classes, Chhatrapati Sambhajinagar, Maharashtra.",
  seo_keywords:
    'coaching classes, Chhatrapati Sambhajinagar, SSC, HSC, science coaching, IIT-JEE, NEET',
  og_image_url: '',
  popup_enabled: true,
  popup_title: 'Admission enquiry',
  popup_body:
    'Share a few details and our admissions team will call you with the current batch timings and fee structure.',
  popup_cta_label: 'Apply for admission',
  popup_cta_link: '/admission',
  popup_submit_label: 'Request a callback',
  popup_image_url: '',
  popup_delay_seconds: 5,
  popup_frequency: 'session',
  popup_show_parent_name: true,
  popup_show_email: true,
  popup_show_class: true,
  popup_show_course: true,
  popup_show_batch: true,
  popup_show_message: false,
  payments_enabled: false,
  payment_fee_label: 'Admission registration fee',
  upi_id: '',
  payment_qr_url: '',
  bank_details: '',
  payment_instructions: '',
  header_cta_enabled: true,
  header_cta_label: 'Apply Now',
  header_cta_link: '/admission',
  float_apply_enabled: true,
  float_apply_label: 'Apply Now',
  float_apply_link: '/admission',
  customized_modules: [],
  privacy_content:
    'We collect only the information you submit through our enquiry and admission forms — name, contact details, class and course interest — so that our team can respond to you. Enquiry records are visible only to authorised institute staff. We do not sell or share your details with third parties. Photographs of students are published only with written permission. You may ask us to correct or remove your information at any time by contacting the institute.',
  terms_content:
    "Course fees, batch timings and examination schedules are published by the institute and may change between academic terms. Admission is confirmed only after the institute verifies the application and records the applicable fee. Students are expected to attend regularly and follow institute discipline. Result and achievement information is published only after verification and consent. This website is a communication channel; it does not replace the institute's official notices.",
};

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'h-home', label: 'Home', path: '/', location: 'header', display_order: 0, open_in_new_tab: false },
  { id: 'h-about', label: 'About', path: '/about', location: 'header', display_order: 1, open_in_new_tab: false },
  { id: 'h-courses', label: 'Courses', path: '/courses', location: 'header', display_order: 2, open_in_new_tab: false },
  { id: 'h-exams', label: 'Exams', path: '/exams', location: 'header', display_order: 3, open_in_new_tab: false },
  { id: 'h-lectures', label: 'Lectures', path: '/lectures', location: 'header', display_order: 4, open_in_new_tab: false },
  { id: 'h-results', label: 'Results', path: '/results', location: 'header', display_order: 5, open_in_new_tab: false },
  { id: 'h-faculty', label: 'Faculty', path: '/faculty', location: 'header', display_order: 6, open_in_new_tab: false },
  {
    id: 'h-testimonials',
    label: 'Testimonials',
    path: '/testimonials',
    location: 'header',
    display_order: 7,
    open_in_new_tab: false,
  },
  { id: 'h-gallery', label: 'Gallery', path: '/gallery', location: 'header', display_order: 8, open_in_new_tab: false },
  { id: 'h-blogs', label: 'Blogs', path: '/blogs', location: 'header', display_order: 9, open_in_new_tab: false },
  { id: 'h-contact', label: 'Contact', path: '/contact', location: 'header', display_order: 10, open_in_new_tab: false },
  { id: 'f-courses', label: 'Courses', path: '/courses', location: 'footer', display_order: 0, open_in_new_tab: false },
  { id: 'f-exams', label: 'Exams', path: '/exams', location: 'footer', display_order: 1, open_in_new_tab: false },
  { id: 'f-lectures', label: 'Lectures', path: '/lectures', location: 'footer', display_order: 2, open_in_new_tab: false },
  { id: 'f-results', label: 'Results', path: '/results', location: 'footer', display_order: 3, open_in_new_tab: false },
  { id: 'f-faculty', label: 'Faculty', path: '/faculty', location: 'footer', display_order: 4, open_in_new_tab: false },
  { id: 'f-gallery', label: 'Gallery', path: '/gallery', location: 'footer', display_order: 5, open_in_new_tab: false },
  { id: 'f-contact', label: 'Contact', path: '/contact', location: 'footer', display_order: 6, open_in_new_tab: false },
];

export const DEFAULT_BANNER: Banner = {
  id: 'default-banner',
  title: 'Admissions open for the new academic batch',
  subtitle: '',
  description:
    'Limited seats per batch. Meet the subject teachers, review the study plan and confirm your seat at the institute.',
  image_url: SITE_IMAGES.hero,
  mobile_image_url: '',
  primary_label: 'Apply for admission',
  primary_url: '/admission',
  secondary_label: 'Talk to us',
  secondary_url: '/contact',
  deadline: '',
  display_order: 0,
  is_active: true,
};

export const DEFAULT_CAMPUS_SECTION: HomepageSection = {
  id: 'sec-campus',
  key: 'campus',
  eyebrow: 'Campus & student facilities',
  title: 'More than coaching: an integrated residential and academic ecosystem',
  subtitle:
    "A comprehensive learning environment with facilities designed to support students' academic growth, discipline and overall development.",
  body: 'We aim to provide more than coaching: a complete academic ecosystem where students receive quality education, personal mentoring, disciplined study habits and the right guidance to achieve their career goals.',
  image_url: '',
  button_label: '',
  button_link: '',
  display_order: 5,
  is_visible: true,
  items: [
    {
      title: 'Residential Campus',
      description: 'A safe, disciplined and fully supervised residential ecosystem for outstation students.',
      icon: 'bed',
      image_url: SITE_IMAGES.campusResidential,
      points: [
        'Separate residential facilities for boys and girls',
        'Safe, disciplined and student-friendly environment',
        'Supervised study hours and academic monitoring',
        'Regular mentoring and personal guidance',
      ],
    },
    {
      title: 'Day-Care / Day-Boarding Facility',
      description: 'An extended campus day for day scholars, built around study, support and care.',
      icon: 'sun',
      image_url: SITE_IMAGES.campusDaycare,
      points: [
        'Extended campus stay for day scholars',
        'Supervised study sessions and doubt-clearing support',
        'Meals and refreshments',
        'Academic monitoring and individual attention',
      ],
    },
  ],
};

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  {
    id: 'sec-hero',
    key: 'hero',
    eyebrow: '',
    title: 'Where serious preparation meets personal attention',
    subtitle: 'Small batches, subject-specialist teachers and a disciplined daily rhythm',
    body: '',
    image_url: SITE_IMAGES.hero,
    button_label: 'Explore courses',
    button_link: '/courses',
    display_order: 1,
    is_visible: true,
    items: [
      { title: 'Small batches', description: 'Limited seats so every student is tracked.' },
      { title: 'Daily practice', description: 'Guided problem solving every working day.' },
      { title: 'Parent updates', description: 'Regular, honest progress feedback.' },
    ],
  },
  {
    id: 'sec-announcement',
    key: 'announcement',
    eyebrow: '',
    title: 'Important admission announcement',
    subtitle: '',
    body: 'Admissions are open for the new academic batch. Batch strength is limited and seats are confirmed on a first-come basis. Visit the institute or submit an enquiry to receive the current course structure, batch timings and fee details from our admissions team.',
    image_url: '',
    button_label: '',
    button_link: '',
    display_order: 2,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-intro',
    key: 'intro',
    eyebrow: '',
    title: 'A gurukul approach to modern academics',
    subtitle: 'Built on three things: teaching quality, practice and honest feedback.',
    body: "Giri Sir's Gurukul Classes is a neighbourhood coaching institute in Chhatrapati Sambhajinagar. We teach in small groups, track every student's daily work, and keep parents informed about real progress rather than vague assurances.\n\nOur classrooms mix direct teaching with guided practice. Students attempt problems in class, get their doubts cleared immediately, and carry a clear revision plan home. Weekly tests show exactly what needs work — before the IIT-JEE & NEET Examination.",
    image_url: SITE_IMAGES.mentoring,
    button_label: 'About the institute',
    button_link: '/about',
    display_order: 3,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-courses',
    key: 'courses',
    eyebrow: '',
    title: 'Courses offered',
    subtitle: 'Coaching with subject-specific practice, tests and revision.',
    body: '',
    image_url: '',
    button_label: 'All courses',
    button_link: '/courses',
    display_order: 4,
    is_visible: true,
    items: [],
  },
  DEFAULT_CAMPUS_SECTION,
  {
    id: 'sec-features',
    key: 'features',
    eyebrow: '',
    title: 'Why families choose our institute',
    subtitle: "The routine behind every student's progress.",
    body: '',
    image_url: '',
    button_label: '',
    button_link: '',
    display_order: 6,
    is_visible: true,
    items: [
      {
        title: 'Small batch strength',
        description: 'Enough seats to teach properly, few enough that no student is invisible.',
      },
      {
        title: 'Subject specialists',
        description: 'Each subject taught by a teacher who works on it daily.',
      },
      {
        title: 'Weekly assessment',
        description: 'Tests every week, corrections discussed the next class.',
      },
      {
        title: 'Doubt clearing hours',
        description: 'Dedicated time after class for individual doubts.',
      },
      {
        title: 'Parent communication',
        description: 'Regular updates on attendance, tests and behaviour.',
      },
      {
        title: 'Exam readiness',
        description: 'Paper pattern drills, time management and revision plans.',
      },
      {
        title: 'DPP – Daily Practice Test',
        description: 'A short daily practice paper in every subject, checked and discussed in class.',
      },
      {
        title: 'Teacher-supervised six-hour study',
        description: 'Six hours of daily study completed under the presence and observation of teachers.',
      },
    ],
  },
  {
    id: 'sec-achievements',
    key: 'achievements',
    eyebrow: '',
    title: 'Results and academic achievements',
    subtitle: 'Our Performers',
    body: 'Verified student results, ranks and academic achievements are published on this page. The institute adds each record after verification — nothing is shown before it is checked.',
    image_url: '',
    button_label: 'View all results',
    button_link: '/results',
    display_order: 7,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-faculty',
    key: 'faculty',
    eyebrow: '',
    title: 'Faculty and mentors',
    subtitle: 'Teachers who stay with a student through the whole academic year.',
    body: '',
    image_url: '',
    button_label: 'Meet the faculty',
    button_link: '/faculty',
    display_order: 8,
    is_visible: false,
    items: [],
  },
  {
    id: 'sec-exams',
    key: 'exams',
    eyebrow: '',
    title: 'Upcoming examinations',
    subtitle: 'Test and examination announcements with dates, timing and instructions.',
    body: '',
    image_url: '',
    button_label: 'All exam announcements',
    button_link: '/exams',
    display_order: 9,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-lectures',
    key: 'lectures',
    eyebrow: '',
    title: 'Featured video lectures',
    subtitle: 'Recorded explanations for revision at home.',
    body: '',
    image_url: '',
    button_label: 'Browse lectures',
    button_link: '/lectures',
    display_order: 10,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-testimonials',
    key: 'testimonials',
    eyebrow: '',
    title: 'What students say',
    subtitle: "Feedback published with the student's permission.",
    body: '',
    image_url: '',
    button_label: 'Read more',
    button_link: '/testimonials',
    display_order: 11,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-news',
    key: 'news',
    eyebrow: '',
    title: 'Latest news and announcements',
    subtitle: 'Notices, schedules and study guidance from the institute.',
    body: '',
    image_url: '',
    button_label: 'All articles',
    button_link: '/blogs',
    display_order: 12,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-gallery',
    key: 'gallery',
    eyebrow: '',
    title: 'Inside the institute',
    subtitle: 'Classrooms, study spaces and institute events.',
    body: '',
    image_url: '',
    button_label: 'Open gallery',
    button_link: '/gallery',
    display_order: 13,
    is_visible: false,
    items: [],
  },
  {
    id: 'sec-faq',
    key: 'faq',
    eyebrow: '',
    title: 'Frequently asked questions',
    subtitle: 'Answers to what parents ask us most often before admission.',
    body: '',
    image_url: '',
    button_label: '',
    button_link: '',
    display_order: 14,
    is_visible: true,
    items: [
      {
        title: 'How do I take admission?',
        description:
          'Submit the enquiry form on this website or visit the institute. Our team will explain the course structure, batch timings and fee before you confirm admission.',
      },
      {
        title: 'What is the batch strength?',
        description:
          "Batches are intentionally small so that each student's daily work can be checked. Exact strength is confirmed by the admissions team for the current term.",
      },
      {
        title: 'Are demo or trial classes available?',
        description:
          'Prospective students can request an interaction with the subject teacher before confirming admission. Ask the admissions team when you enquire.',
      },
      {
        title: 'How are parents updated?',
        description:
          'Parents receive regular updates on attendance, weekly test performance and areas that need attention.',
      },
      {
        title: 'Is study material provided?',
        description:
          'Printed practice sets and revision sheets are provided as part of the course. Details are shared at the time of admission.',
      },
    ],
  },
  {
    id: 'sec-enquiry',
    key: 'enquiry',
    eyebrow: '',
    title: 'Admission enquiry',
    subtitle: 'Send us your details and the admissions team will call you back.',
    body: 'No online payment is collected on this website. Fees and seat confirmation are handled directly by the institute.',
    image_url: '',
    button_label: '',
    button_link: '',
    display_order: 15,
    is_visible: true,
    items: [],
  },
  {
    id: 'sec-contact',
    key: 'contact',
    eyebrow: '',
    title: 'Visit the institute',
    subtitle: 'Talk to the admissions team in person or over the phone.',
    body: '',
    image_url: '',
    button_label: '',
    button_link: '',
    display_order: 16,
    is_visible: true,
    items: [],
  },
];

export const DEFAULT_COURSES: Course[] = [
  {
    id: 'two-year-iit-jee-integrated-course',
    slug: 'two-year-iit-jee-integrated-course',
    name: 'Two-Year IIT-JEE Integrated Regular Course',
    category: 'IIT-JEE & NEET Two-Year Integrated Programme',
    class_level: 'Class XI & XII',
    duration: '2 Years',
    target_exams: 'JEE Main, JEE Advanced, MHT-CET',
    batch_info: 'Morning / Evening Batch',
    subjects: 'Physics, Chemistry, Mathematics',
    fee: '',
    description:
      'Integrated two-year classroom programme for IIT-JEE aspirants preparing for JEE Main, JEE Advanced and MHT-CET. Focus on conceptual learning, problem-solving and regular practice.',
    highlights:
      'Integrated classroom learning\nConceptual understanding\nRegular practice sessions\nCompetitive examination preparation\nAcademic progress tracking',
    eligibility:
      'Students entering Class XI or Class XII\nPreparing for JEE Main, JEE Advanced and MHT-CET',
    methodology:
      'Concept-first classroom teaching followed by guided problem solving\nWeekly tests with detailed discussion of solutions\nPeriodic progress reports shared with parents',
    exam_preparation:
      'JEE Main, JEE Advanced and MHT-CET pattern practice\nPrevious-year papers and full-length mock tests\nRank analysis and performance review after every test',
    admission_status: 'open',
    image_url: '/assets/gurukul/course_two-year-iit-jee-integrated-course.png',
    display_order: 1,
    is_featured: true,
    is_published: true,
  },
  {
    id: 'two-year-neet-integrated-course',
    slug: 'two-year-neet-integrated-course',
    name: 'Two-Year NEET Integrated Regular Course',
    category: 'IIT-JEE & NEET Two-Year Integrated Programme',
    class_level: 'Class XI & XII',
    duration: '2 Years',
    target_exams: 'NEET-UG, MHT-CET',
    batch_info: 'Morning / Evening Batch',
    subjects: 'Physics, Chemistry, Biology',
    fee: '',
    description:
      'Integrated two-year classroom programme for NEET aspirants preparing for NEET-UG and MHT-CET. Focus on conceptual clarity, regular practice and examination preparation.',
    highlights:
      'Integrated classroom learning\nNCERT-aligned conceptual teaching\nRegular practice sessions\nCompetitive examination preparation\nAcademic progress tracking',
    eligibility: 'Students entering Class XI or Class XII\nPreparing for NEET-UG and MHT-CET',
    methodology:
      'Concept-first classroom teaching with diagram-based Biology learning\nWeekly tests with detailed discussion of solutions\nPeriodic progress reports shared with parents',
    exam_preparation:
      'NEET-UG and MHT-CET pattern practice\nNCERT-focused revision and previous-year papers\nFull-length mock tests with performance analysis',
    admission_status: 'open',
    image_url: '/assets/gurukul/course_two-year-neet-integrated-course.png',
    display_order: 2,
    is_featured: true,
    is_published: true,
  },
  {
    id: 'five-year-foundation-programme',
    slug: 'five-year-foundation-programme',
    name: 'Five-Year Foundation Programme',
    category: 'IIT-JEE & NEET Foundation Programme',
    class_level: 'Starts from Class VIII',
    duration: '5 Years',
    target_exams: 'IIT-JEE & NEET (early preparation)',
    batch_info: 'Regular Foundation Batch',
    subjects: 'Physics, Chemistry, Mathematics, Biology',
    fee: '',
    description:
      'Five-year integrated foundation programme starting from Class VIII. Develop strong conceptual foundations in Physics, Chemistry, Mathematics and Biology, alongside school academics and early competitive examination preparation.',
    highlights:
      'Strong conceptual foundation\nSchool academic support\nLogical and analytical thinking\nEarly competitive examination preparation\nPreparation for future IIT-JEE and NEET examinations',
    eligibility:
      'Students entering Class VIII\nFive-year integrated programme with school academic support',
    methodology:
      'Concept building with school syllabus support\nRegular assessments and doubt-solving sessions\nAnalytical and reasoning practice to build exam temperament',
    exam_preparation:
      'Early exposure to IIT-JEE and NEET level problem solving\nFoundation-level tests and Olympiad-style practice\nStructured revision of the school syllabus',
    admission_status: 'open',
    image_url: '/assets/gurukul/course_five-year-foundation-programme.png',
    display_order: 3,
    is_featured: true,
    is_published: true,
  },
  {
    id: 'four-year-foundation-programme',
    slug: 'four-year-foundation-programme',
    name: 'Four-Year Foundation Programme',
    category: 'IIT-JEE & NEET Foundation Programme',
    class_level: 'Starts from Class IX',
    duration: '4 Years',
    target_exams: 'IIT-JEE & NEET (early preparation)',
    batch_info: '',
    subjects: 'Physics, Chemistry, Mathematics, Biology',
    fee: '',
    description:
      'Four-year integrated foundation programme starting from Class IX. Develop strong conceptual foundations in Physics, Chemistry, Mathematics and Biology, alongside school academics and early competitive examination preparation.',
    highlights:
      'Strong conceptual foundation\nSchool academic support\nLogical and analytical thinking\nEarly competitive examination preparation\nPreparation for future IIT-JEE and NEET examinations',
    eligibility:
      'Students entering Class IX\nFour-year integrated programme with school academic support',
    methodology:
      'Concept building with school syllabus support\nRegular assessments and doubt-solving sessions\nAnalytical and reasoning practice to build exam temperament',
    exam_preparation:
      'Early exposure to IIT-JEE and NEET level problem solving\nFoundation-level tests and Olympiad-style practice\nStructured revision of the school syllabus',
    admission_status: 'open',
    image_url: '/assets/gurukul/course_four-year-foundation-programme.png',
    display_order: 4,
    is_featured: false,
    is_published: true,
  },
  {
    id: 'three-year-foundation-programme',
    slug: 'three-year-foundation-programme',
    name: 'Three-Year Foundation Programme',
    category: 'IIT-JEE & NEET Foundation Programme',
    class_level: 'Starts from Class X',
    duration: '3 Years',
    target_exams: 'IIT-JEE & NEET (early preparation)',
    batch_info: '',
    subjects: 'Physics, Chemistry, Mathematics, Biology',
    fee: '',
    description:
      'Three-year integrated foundation programme starting from Class X. Completes the school syllabus with strong concepts in Physics, Chemistry, Mathematics and Biology while beginning structured competitive examination preparation.',
    highlights:
      'Strong conceptual foundation\nSchool academic support\nLogical and analytical thinking\nEarly competitive examination preparation\nPreparation for future IIT-JEE and NEET examinations',
    eligibility:
      'Students entering Class X\nThree-year integrated programme with school academic support',
    methodology:
      'Concept building with school syllabus support\nRegular assessments and doubt-solving sessions\nAnalytical and reasoning practice to build exam temperament',
    exam_preparation:
      'Early exposure to IIT-JEE and NEET level problem solving\nFoundation-level tests and Olympiad-style practice\nStructured revision of the school syllabus',
    admission_status: 'open',
    image_url: '/assets/gurukul/course_three-year-foundation-programme.png',
    display_order: 5,
    is_featured: false,
    is_published: true,
  },
];

export const DEFAULT_EXAMS: Exam[] = [
  {
    id: 'gpat-8th-2025-2026',
    title: 'GPAT Exam 8th 2025-2026',
    course_category: 'GPAT',
    class_level: 'Class 8',
    exam_date: '2026-11-21',
    exam_time: '21:25',
    start_time: '21:25',
    duration_minutes: 60,
    syllabus: '',
    instructions: '',
    status: 'open',
    registration_link:
      'https://online-test.classplusapp.com/?testId=6b01bdf9eba0e1c2e3793adf&defaultLanguage=en',
    registration_url:
      'https://online-test.classplusapp.com/?testId=6b01bdf9eba0e1c2e3793adf&defaultLanguage=en',
    display_order: 1,
    is_published: true,
  },
  {
    id: 'gpat-7th-2025-2026',
    title: 'GPAT Exam 7th 2025-2026',
    course_category: 'G-PAT',
    class_level: 'Class 7',
    exam_date: '2026-11-21',
    exam_time: '21:28',
    start_time: '21:28',
    duration_minutes: 60,
    syllabus: '',
    instructions: '',
    status: 'open',
    registration_link:
      'https://online-test.classplusapp.com/?testId=6b01bf4a50ddfbf5dc182be6&defaultLanguage=en',
    registration_url:
      'https://online-test.classplusapp.com/?testId=6b01bf4a50ddfbf5dc182be6&defaultLanguage=en',
    display_order: 2,
    is_published: true,
  },
  {
    id: 'gpat-9th-2025-2026',
    title: 'GPAT Exam 9th 2025-2026',
    course_category: 'G-PAT',
    class_level: 'Class 9',
    exam_date: '2026-11-21',
    exam_time: '21:29',
    start_time: '21:29',
    duration_minutes: 60,
    syllabus: '',
    instructions: '',
    status: 'open',
    registration_link:
      'https://online-test.classplusapp.com/?testId=6afc35fd61b7e6204fe16677&defaultLanguage=en',
    registration_url:
      'https://online-test.classplusapp.com/?testId=6afc35fd61b7e6204fe16677&defaultLanguage=en',
    display_order: 3,
    is_published: true,
  },
  {
    id: 'gpat-10th-2025-2026',
    title: 'GPAT Exam 10th 2025-2026',
    course_category: 'G-PAT',
    class_level: 'Class 10',
    exam_date: '2026-11-21',
    exam_time: '21:30',
    start_time: '21:30',
    duration_minutes: 60,
    syllabus: '',
    instructions: '',
    status: 'open',
    registration_link:
      'https://online-test.classplusapp.com/?testId=6b01bf60f9a7e673f6c405fc&defaultLanguage=en',
    registration_url:
      'https://online-test.classplusapp.com/?testId=6b01bf60f9a7e673f6c405fc&defaultLanguage=en',
    display_order: 4,
    is_published: true,
  },
];

export const DEFAULT_RESULTS: StudentResult[] = [
  {
    id: 'res-atharv-nandapurkar',
    student_name: 'Atharv Nandapurkar',
    achievement_title: 'IIT-JEE',
    score: 'AIR 3',
    class_level: 'Class 12',
    academic_year: '2025-26',
    photo_url: SITE_IMAGES.resultPoster,
    document_url: '',
    display_order: 1,
    is_featured: true,
    is_published: true,
  },
];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-advait-padhye',
    display_name: 'Advait Padhye',
    role_or_class: 'Student · 11th & 12th Batch',
    quote:
      'I completed my 11th and 12th in Gurukul Classes. Earlier I felt less concentration in my studies, and after meeting Giri Sir, he helped improve my concentration, suggested the best approach to study, and gave me clear direction throughout.',
    rating: 5,
    photo_url: '',
    display_order: 1,
    is_published: true,
  },
];

export const DEFAULT_GALLERY_ALBUMS: GalleryAlbum[] = [
  {
    id: 'alb-campus-classrooms',
    title: 'Campus and classrooms',
    description: 'Photographs from the institute.',
    cover_image_url: SITE_IMAGES.galleryCampus,
    display_order: 0,
    is_published: true,
  },
];

export const REPRESENTATIVE_GALLERY: GalleryMedia[] = [
  {
    id: 'gal-campus-main',
    album_id: 'alb-campus-classrooms',
    title: 'CAMPUS',
    file_url: SITE_IMAGES.galleryCampus,
    caption: 'CAMPUS',
    media_type: 'image',
    display_order: 1,
    is_published: true,
  },
  {
    id: 'gal-study-group',
    album_id: 'alb-campus-classrooms',
    title: 'Study group & mentoring',
    file_url: SITE_IMAGES.mentoring,
    caption: 'Guided practice and individual mentoring.',
    media_type: 'image',
    display_order: 2,
    is_published: true,
  },
  {
    id: 'gal-residential',
    album_id: 'alb-campus-classrooms',
    title: 'Residential Campus',
    file_url: SITE_IMAGES.campusResidential,
    caption: 'Safe, disciplined residential campus for outstation students.',
    media_type: 'image',
    display_order: 3,
    is_published: true,
  },
  {
    id: 'gal-daycare',
    album_id: 'alb-campus-classrooms',
    title: 'Day-Care / Day-Boarding Facility',
    file_url: SITE_IMAGES.campusDaycare,
    caption: 'Supervised study sessions and doubt-clearing support.',
    media_type: 'image',
    display_order: 4,
    is_published: true,
  },
];

export const DEFAULT_BLOGS: BlogPost[] = [
  {
    id: 'how-to-build-a-revision-routine',
    title: 'How to build a revision routine that actually sticks',
    slug: 'how-to-build-a-revision-routine',
    category: 'Study guidance',
    excerpt:
      'Revision works when it is scheduled, not when it is left to the last week. Here is the weekly routine we recommend to our students.',
    content: `Most students do not fail because they did not study. They struggle because the revision never happens in a planned way.

## Revise in short, fixed blocks

Pick two subjects for a 45-minute block each evening. Write down what you covered. A written log makes progress visible and stops you from re-reading the same chapter.

## Test yourself instead of only reading

Close the book and write what you remember. Then check. That single change is more useful than an extra hour of highlighting.

## Keep one full-length paper a week

Attempt a paper in one sitting, with a clock. Correct it the next day and list the three mistakes you will avoid next time.

## Ask before the doubt becomes a gap

Bring doubts to class the same week. A doubt that sits for a fortnight turns into a lost chapter.`,
    featured_image_url: SITE_IMAGES.mentoring,
    author: 'Institute desk',
    published_date: '2026-10-20',
    seo_title: '',
    seo_description: '',
    is_published: true,
  },
  {
    id: 'what-parents-should-ask-before-choosing-coaching',
    title: 'What parents should ask before choosing a coaching class',
    slug: 'what-parents-should-ask-before-choosing-coaching',
    category: 'Admissions',
    excerpt:
      'Batch size, teacher continuity and how progress is reported matter more than the size of the advertisement.',
    content: `Before you pay a fee, ask these questions at the institute.

## Who teaches the subject?

Ask to meet the actual subject teacher, not only the counsellor. Continuity through the year matters.

## How large is the batch?

A batch that is too large cannot be tracked. Ask the exact strength for your child's class.

## How will I know about progress?

Ask how often tests happen and how the results reach you. A written weekly or monthly update is more useful than a phone call only when marks fall.

## What happens if my child falls behind?

There should be a clear answer: doubt hours, extra practice sets, or a conversation with the parent — not just a warning.`,
    featured_image_url: SITE_IMAGES.campusResidential,
    author: 'Institute desk',
    published_date: '2026-10-05',
    seo_title: '',
    seo_description: '',
    is_published: true,
  },
];
