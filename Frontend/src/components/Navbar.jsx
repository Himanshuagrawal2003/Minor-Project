import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Moon, Sun, Menu, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar({ toggleSidebar, isSidebarCollapsed }) {
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/70 px-4 md:px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Menu size={20} />
        </button>
        
        {/* Only show logo in navbar when sidebar is collapsed or on smaller screens */}
        <div className={cn(
          "font-bold text-xl tracking-tight hidden lg:block transition-all",
          isSidebarCollapsed ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
        )}>
          <span className="text-primary">L</span>HM
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
        </button>

        <Link to={`/${localStorage.getItem('role') || 'admin'}/profile`} className="h-8 w-8 ml-2 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary cursor-pointer hover:bg-primary/20 transition-colors">
          <User size={16} />
        </Link>
      </div>
    </header>
  );
}
