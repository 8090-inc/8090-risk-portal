import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NotificationContainer } from '../common/NotificationContainer';
import { useUIStore } from '../../store';

export const AppLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notifications */}
      <NotificationContainer />
    </div>
  );
};