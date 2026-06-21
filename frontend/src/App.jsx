import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Discover from './pages/Discover.jsx';
import WorkDetail from './pages/WorkDetail.jsx';
import Upload from './pages/Upload.jsx';
import Collections from './pages/Collections.jsx';
import BoardDetail from './pages/BoardDetail.jsx';
import Saved from './pages/Saved.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      {/* Auth pages render without the standard chrome */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/works/:id" element={<WorkDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/boards/:id" element={<BoardDetail />} />
        <Route path="/u/:username" element={<Profile />} />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <Saved />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
