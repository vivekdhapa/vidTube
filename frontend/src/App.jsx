import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watch from './pages/Watch';
import Channel from './pages/Channel';
import Upload from './pages/Upload';
import MyVideos from './pages/MyVideos';
import LikedVideos from './pages/LikedVideos';
import History from './pages/History';
import Settings from './pages/Settings';
import Tweets from './pages/Tweets';
import Community from './pages/Community';
import Subscriptions from './pages/Subscriptions';

import api from './api/axios';
import useAuthStore from './store/authStore';

function App() {
  const { setUser, logout } = useAuthStore();
  const [authReady, setAuthReady] = useState(false);

  // Rehydrate auth on every app mount/refresh
  // If cookie is still valid → refresh user data in store
  // If cookie expired → clear stale auth state
  useEffect(() => {
    const rehydrateAuth = async () => {
      try {
        const res = await api.get('/users/current-user')
        setUser(res.data.data)
      } catch (error) {
        // ONLY logout if it's not a network/timeout error
        // A 401 means token expired — don't logout yet,
        // let the interceptor handle refresh first
        // Only logout on definitive auth failures
        if (error.response?.status === 403) {
          logout()
        }
        // For 401, network errors, timeouts — 
        // do NOT logout, just set authReady
      } finally {
        setAuthReady(true)
      }
    }
    rehydrateAuth()
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Safety timeout to ensure splash screen doesn't stick
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthReady(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[rgba(99,102,241,0.2)] border-t-[#6366F1] animate-spin" />
          <span className="text-[#52525B] text-sm font-['Inter']">Loading VidTube...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes - full screen, no MainLayout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes - wrapped in MainLayout */}
        {/* Public/Protected routes - Home, Watch, Channel are now public shells */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/watch/:videoId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Watch />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/channel/:username"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Channel />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Community />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Upload />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-videos"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MyVideos />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/liked-videos"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LikedVideos />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <MainLayout>
                <History />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tweets"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Tweets />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Subscriptions />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
