/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PublicLayout } from './components/PublicLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { ExamsPage } from './pages/ExamsPage';
import { LecturesPage } from './pages/LecturesPage';
import { ResultsPage } from './pages/ResultsPage';
import { FacultyPage } from './pages/FacultyPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { GalleryPage } from './pages/GalleryPage';
import { BlogsPage } from './pages/BlogsPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { ContactPage } from './pages/ContactPage';
import { AdmissionPage } from './pages/AdmissionPage';
import { LegalPage, NotFoundPage } from './pages/LegalPage';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import {
  AdminCampusPage,
  AdminHomepagePage,
  AdminNavigationPage,
  AdminSiteSettingsPage,
} from './pages/admin/AdminSiteConfigPages';
import { AdminCrudPage } from './pages/admin/AdminCrudPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminAccountPage } from './pages/admin/AdminAccountPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SiteProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route path="/exams" element={<ExamsPage />} />
                <Route path="/lectures" element={<LecturesPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/faculty" element={<FacultyPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/blogs" element={<BlogsPage />} />
                <Route path="/blogs/:slug" element={<BlogDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/admission" element={<AdmissionPage />} />
                <Route
                  path="/privacy-policy"
                  element={
                    <LegalPage
                      pageKey="privacy"
                      title="Privacy Policy"
                      field="privacy_content"
                    />
                  }
                />
                <Route
                  path="/terms"
                  element={
                    <LegalPage
                      pageKey="terms"
                      title="Terms & Conditions"
                      field="terms_content"
                    />
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              <Route path="/login" element={<AdminLoginPage />} />

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="settings" element={<AdminSiteSettingsPage mode="settings" />} />
                <Route path="navigation" element={<AdminNavigationPage />} />
                <Route path="homepage" element={<AdminHomepagePage />} />
                <Route path="campus" element={<AdminCampusPage />} />
                <Route path="about" element={<AdminSiteSettingsPage mode="about" />} />
                <Route path="courses-page" element={<AdminSiteSettingsPage mode="courses-page" />} />
                <Route path="banners" element={<AdminCrudPage module="banners" />} />
                <Route path="hero" element={<AdminCrudPage module="banners" />} />
                <Route path="popup" element={<AdminSiteSettingsPage mode="popup" />} />
                <Route path="seo" element={<AdminSiteSettingsPage mode="seo" />} />
                <Route path="footer" element={<AdminSiteSettingsPage mode="footer" />} />
                <Route path="contact" element={<AdminSiteSettingsPage mode="contact" />} />
                <Route path="payment-settings" element={<AdminSiteSettingsPage mode="payment-settings" />} />
                <Route path="courses" element={<AdminCrudPage module="courses" />} />
                <Route path="exams" element={<AdminCrudPage module="exams" />} />
                <Route path="lectures" element={<AdminCrudPage module="lectures" />} />
                <Route path="results" element={<AdminCrudPage module="results" />} />
                <Route path="faculty" element={<AdminCrudPage module="faculty" />} />
                <Route path="testimonials" element={<AdminCrudPage module="testimonials" />} />
                <Route path="gallery" element={<AdminGalleryPage />} />
                <Route path="blogs" element={<AdminCrudPage module="blogs" />} />
                <Route path="enquiries" element={<AdminEnquiriesPage kind="enquiries" />} />
                <Route path="admissions" element={<AdminEnquiriesPage kind="admissions" />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="account" element={<AdminAccountPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SiteProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
