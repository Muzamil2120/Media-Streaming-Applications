import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';

// Layout
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const VideosPage = lazy(() => import('./pages/VideosPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const EditMedia = lazy(() => import('./pages/EditMedia'));
const EditProfilePage = lazy(() => import('./pages/EditProfile'));
const VideoDetailPage = lazy(() => import('./pages/VideoDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const PlaylistPage = lazy(() => import('./pages/PlaylistPage'));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const LikedVideosPage = lazy(() => import('./pages/LikedVideosPage'));
const StudioPage = lazy(() => import('./pages/StudioPage'));
const MonetizationPage = lazy(() => import('./pages/MonetizationPage'));
const MyUploadsPage = lazy(() => import('./pages/MyUploads'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// No theme configured (project does not include @mui dependencies)

// Query Client
const queryClient = new QueryClient();

// Loading fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <LoadingSpinner />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider maxSnack={3}>
            <Router>
              <Routes>
              {/* Auth Routes (support signin/signup paths used in Navbar) */}
              <Route path="/signin" element={
                <Suspense fallback={<PageLoader />}>
                  <LoginPage />
                </Suspense>
              } />
              <Route path="/signup" element={
                <Suspense fallback={<PageLoader />}>
                  <RegisterPage />
                </Suspense>
              } />

              {/* Main Layout Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={
                  <Suspense fallback={<PageLoader />}>
                    <HomePage />
                  </Suspense>
                } />
                <Route path="videos" element={
                  <Suspense fallback={<PageLoader />}>
                    <VideosPage />
                  </Suspense>
                } />
                <Route path="upload" element={
                  <Suspense fallback={<PageLoader />}>
                    <UploadPage />
                  </Suspense>
                } />
                {/* Support legacy and navbar routes for media and profile */}
                <Route path="media" element={
                  <Suspense fallback={<PageLoader />}>
                    <VideosPage />
                  </Suspense>
                } />
                <Route path="media/play/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <VideoDetailPage />
                  </Suspense>
                } />
                <Route path="media/new" element={
                  <Suspense fallback={<PageLoader />}>
                    <UploadPage />
                  </Suspense>
                } />
                <Route path="media/edit/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <EditMedia />
                  </Suspense>
                } />
                <Route path="video/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <VideoDetailPage />
                  </Suspense>
                } />
                <Route path="profile" element={
                  <Suspense fallback={<PageLoader />}>
                    <ProfilePage />
                  </Suspense>
                } />
                <Route path="profile/edit" element={
                  <Suspense fallback={<PageLoader />}>
                    <EditProfilePage />
                  </Suspense>
                } />
                <Route path="profile/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <ProfilePage />
                  </Suspense>
                } />
                <Route path="dashboard" element={
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                } />
                <Route path="analytics" element={
                  <Suspense fallback={<PageLoader />}>
                    <AnalyticsPage />
                  </Suspense>
                } />
                <Route path="settings" element={
                  <Suspense fallback={<PageLoader />}>
                    <SettingsPage />
                  </Suspense>
                } />
                <Route path="search" element={
                  <Suspense fallback={<PageLoader />}>
                    <SearchPage />
                  </Suspense>
                } />
                <Route path="playlist/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <PlaylistPage />
                  </Suspense>
                } />
                <Route path="subscriptions" element={
                  <Suspense fallback={<PageLoader />}>
                    <SubscriptionsPage />
                  </Suspense>
                } />
                <Route path="history" element={
                  <Suspense fallback={<PageLoader />}>
                    <HistoryPage />
                  </Suspense>
                } />
                <Route path="liked" element={
                  <Suspense fallback={<PageLoader />}>
                    <LikedVideosPage />
                  </Suspense>
                } />
                <Route path="my-uploads" element={
                  <Suspense fallback={<PageLoader />}>
                    <MyUploadsPage />
                  </Suspense>
                } />
                <Route path="studio" element={
                  <Suspense fallback={<PageLoader />}>
                    <StudioPage />
                  </Suspense>
                } />
                <Route path="monetization" element={
                  <Suspense fallback={<PageLoader />}>
                    <MonetizationPage />
                  </Suspense>
                } />
              </Route>
              </Routes>
            </Router>
          </SnackbarProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;