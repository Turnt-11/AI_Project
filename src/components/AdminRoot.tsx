import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminPanel from './AdminPanel';
import AdminSettings from './AdminSettings';
import SpaceBackground from './SpaceBackground';

export default function AdminRoot() {
  return (
    <>
      <div className="fixed inset-0 -z-10">
        <SpaceBackground />
      </div>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminPanel />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </>
  );
} 