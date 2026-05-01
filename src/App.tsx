/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { PublishTask } from './pages/PublishTask';
import { Explorer } from './pages/Explorer';
import { TaskDetails } from './pages/TaskDetails';
import { MyTasks } from './pages/MyTasks';
import { MyApplications } from './pages/MyApplications';
import { SavedTasks } from './pages/SavedTasks';
import { Resources } from './pages/Resources';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-brand-bg flex items-center justify-center">Cargando...</div>;
  }
  
  if (!session) {
    const hasKeys = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'tu_supabase_url_aqui';
    if (hasKeys) {
      return <Navigate to="/login" />;
    }
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/publish" element={<PublishTask />} />
                <Route path="/explorer" element={<Explorer />} />
                <Route path="/task/:id" element={<TaskDetails />} />
                <Route path="/tasks" element={<MyTasks />} />
                <Route path="/applications" element={<MyApplications />} />
                <Route path="/saved" element={<SavedTasks />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
