import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user._id) {
      console.log("🔗 Attempting socket connection for user:", user._id);
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000/api', {
        path: '/socket.io/',
        transports: ['websocket'],
        withCredentials: true,
        autoConnect: true
      });
      newSocket.on('connect', () => {
        console.log("✅ Socket connected!", newSocket.id);
        // Join personal room
        newSocket.emit('join', user._id);
        // Join role-based room
        if (user.role) {
          newSocket.emit('joinRole', user.role);
        }
      });

      newSocket.on('connect_error', (err) => {
        console.error("❌ Socket Connection Error:", err.message);
      });

      setSocket(newSocket);

      // Listen for notifications
      newSocket.on('notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show Toast
        toast.custom((t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-slate-200 dark:border-slate-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ), { duration: 5000 });

        // Show Browser Desktop Notification if allowed and backgrounded
        if (Notification.permission === 'granted' && document.hidden) {
          new Notification("Hostel Management & Complaint System", {
            body: `${notification.title}: ${notification.message}`,
            icon: 'https://i.ibb.co/Q3qdxmyK/logo.png'
          });
        }
      });

      return () => newSocket.close();
    }
  }, [user?._id, user?.role]);

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markRead = () => setUnreadCount(0);
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markRead, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};