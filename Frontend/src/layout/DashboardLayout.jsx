import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { cn } from '../lib/utils';

export function DashboardLayout({ role }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar 
        role={role} 
        isCollapsed={isSidebarCollapsed} 
        onMobileClose={isMobileSidebarOpen ? () => setIsMobileSidebarOpen(false) : undefined} 
      />
      
      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        <Navbar 
          toggleSidebar={toggleSidebar} 
          isSidebarCollapsed={isSidebarCollapsed} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/20">
          <div className="p-2 md:p-6 lg:p-6 mx-auto max-w-7xl relative min-h-[calc(100vh-4rem)]">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
