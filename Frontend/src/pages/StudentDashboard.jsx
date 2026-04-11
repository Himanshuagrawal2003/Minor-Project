import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { MessageSquare, CalendarDays, AlertTriangle, Coffee, Building2, Loader2, Paperclip, Download, FileText } from 'lucide-react';

import { cn } from '../lib/utils';

export function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [notices, setNotices] = useState([]);
  const [todayMenu, setTodayMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const [complaintsRes, dashboardRes, noticesRes] = await Promise.all([
          api.get('/complaints'),
          api.get('/dashboard'),
          api.get('/notices')
        ]);

        setComplaints(complaintsRes || []);
        setDashboardData(dashboardRes);
        setNotices(noticesRes || []);

        // Use today's menu from dashboard data (already fetched by backend with robust logic)
        setTodayMenu(dashboardRes?.studentStats?.todayMenu || null);
      } catch (err) {
        console.error("Dashboard fetching error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const stats = {
    active: dashboardData?.studentStats?.myActive || 0,
    resolved: dashboardData?.studentStats?.myResolved || 0,
    total: complaints.filter(c => {
      const cId = c.studentId?._id || c.studentId;
      return cId === localStorage.getItem('userID');
    }).length
  };

  const getAttachmentUrl = (url) => {
    if (!url) return "#";
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${backendUrl}${url}`;
  };

  const userName = localStorage.getItem('name') || 'Student';

  const userRoom = dashboardData?.studentStats?.roomNumber || 'Pending';
  const userBlock = dashboardData?.studentStats?.block || '';
  const userMess = dashboardData?.studentStats?.messId || '';

  return (
    <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-6 mx-auto max-w-7xl w-full relative min-h-[calc(100vh-4rem)] space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Room {userRoom} {userBlock && `• Block ${userBlock}`} {userMess && `• Mess: ${userMess}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Active Complaints" value={stats.active} icon={MessageSquare} className="border-amber-200 dark:border-amber-900/50" />
        <DashboardCard title="Leave Requests" value={dashboardData?.studentStats?.myLeaves || 0} icon={CalendarDays} />
        <DashboardCard title="Room Info" value={userRoom} icon={Building2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Notice Board</h2>
          <div className="glass-card divide-y divide-border/50">
            {notices.length > 0 ? notices.map(notice => (
              <div key={notice._id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start mb-1 gap-4">
                  <h3 className="font-bold text-sm text-primary leading-tight">{notice.title}</h3>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-foreground/80 mb-3 leading-relaxed">
                  {notice.content}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                      By {notice.author?.name || "Admin"}
                    </span>
                  </div>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-tighter",
                    notice.priority === 'High' || notice.priority === 'Critical' || notice.priority === 'high' || notice.priority === 'critical' ? "bg-destructive/10 text-destructive border border-destructive/20" :
                      notice.priority === 'Medium' || notice.priority === 'medium' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  )}>
                    {notice.priority}
                  </span>
                </div>
                {notice.attachment && (
                  <a
                    href={getAttachmentUrl(notice.attachment.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[10px] text-primary hover:underline mt-2 pt-1 border-t border-border/10 group/att"
                  >
                    <FileText size={10} className="shrink-0" />
                    <span className="truncate flex-1 font-medium">{notice.attachment.name}</span>
                    <Download size={10} className="shrink-0 opacity-60 group-hover/att:opacity-100" />
                  </a>
                )}
              </div>
            )) : (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                No recent notices.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Today's Mess Menu</h2>
          <div className="glass-card overflow-hidden">
            {todayMenu ? (
              <div className="divide-y divide-border/30">
                <div className="p-4 bg-amber-500/5">
                  <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Breakfast</h3>
                  <ul className="text-xs space-y-1 text-foreground/80 font-medium">
                    {todayMenu.meals?.breakfast?.length > 0 ? todayMenu.meals.breakfast.map((item, i) => <li key={i}>• {item}</li>) : <li>Not set</li>}
                  </ul>
                </div>
                <div className="p-4 bg-emerald-500/5">
                  <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">Lunch</h3>
                  <ul className="text-xs space-y-1 text-foreground/80 font-medium">
                    {todayMenu.meals?.lunch?.length > 0 ? todayMenu.meals.lunch.map((item, i) => <li key={i}>• {item}</li>) : <li>Not set</li>}
                  </ul>
                </div>
                <div className="p-4 bg-indigo-500/5">
                  <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">Dinner</h3>
                  <ul className="text-xs space-y-1 text-foreground/80 font-medium">
                    {todayMenu.meals?.dinner?.length > 0 ? todayMenu.meals.dinner.map((item, i) => <li key={i}>• {item}</li>) : <li>Not set</li>}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                Menu not updated
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
