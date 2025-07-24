import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NotificationContainer } from '../common/NotificationContainer';
import { useUIStore } from '../../store';

export const AppLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-hidden bg-slate-50">
          <div className="h-full overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notifications */}
      <NotificationContainer />
    </div>
  );
};