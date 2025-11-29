import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import PublicView from './views/PublicView';
import AdminDashboard from './views/AdminDashboard';
import AdminOverview from './views/admin/AdminOverview';
import ManageDevices from './views/admin/ManageDevices';
import ManageSensorData from './views/admin/ManageSensorData';
import ManageAlerts from './views/admin/ManageAlerts';
import ManageUsers from './views/admin/ManageUsers';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <DataProvider>
        <HashRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow relative">
              <ToastContainer />
              <Routes>
                <Route path="/" element={<PublicView />} />
                <Route path="/admin" element={<AdminDashboard />}>
                  <Route index element={<Navigate to="overview" replace />} />
                  <Route path="overview" element={<AdminOverview />} />
                  <Route path="devices" element={<ManageDevices />} />
                  <Route path="sensordata" element={<ManageSensorData />} />
                  <Route path="alerts" element={<ManageAlerts />} />
                  <Route path="users" element={<ManageUsers />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </DataProvider>
    </ToastProvider>
  );
};

export default App;