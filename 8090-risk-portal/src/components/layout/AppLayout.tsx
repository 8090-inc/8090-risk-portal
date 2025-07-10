import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NotificationContainer } from '../common/NotificationContainer';
import { useUIStore } from '../../store';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 overflow-x-hidden ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Notifications */}
      <NotificationContainer />
    </div>
  );
};