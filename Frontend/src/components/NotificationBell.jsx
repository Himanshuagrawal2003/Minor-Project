import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { cn } from '../lib/utils';

export function NotificationBell() {
  const { notifications, unreadCount, markRead, clearNotifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) markRead();
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      clearNotifications(); // Clear local list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell size={20} className="text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-bold text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div 
                  key={n._id || i} 
                  className={cn(
                    "p-4 border-b border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                    !n.isRead && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                >
                  <div className="flex justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 border-t border-border bg-slate-50/50 dark:bg-slate-900/50 text-center">
            <button className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              VIEW ALL ACTIVITY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
