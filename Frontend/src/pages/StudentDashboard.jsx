import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { MessageSquare, CalendarDays, AlertTriangle, Coffee, Building2, Loader2 } from 'lucide-react';
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

      // Fetch notices independently
      api.get('/notices')
        .then(res => {
          console.log("Notices received on Student Dashboard:", res);
          setNotices(res || []);
        })
        .catch(err => console.error("Failed to load notices:", err));

      // Fetch other data
      try {
        const [complaintsRes, dashboardRes, menuRes] = await Promise.all([
          api.get('/complaints'),
          api.get('/dashboard'),
          api.get(`/mess/today?messId=${localStorage.getItem('messId') || ''}`).catch(() => null)
        ]);
        setComplaints(complaintsRes || []);
        setDashboardData(dashboardRes);
        setTodayMenu(menuRes);
        console.log("Dashboard Data Received:", dashboardRes);
      } catch (err) {
        console.error("Dashboard fetching error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const recentComplaintsColumns = [
    { header: 'ID', accessorKey: '_id', cell: (row) => <span className="text-xs font-mono">{row._id.substring(row._id.length - 8)}</span> },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Date', accessorKey: 'createdAt', cell: (row) => new Date(row.createdAt).toLocaleDateString() }
  ];

  const recentComplaintsData = complaints.slice(0, 5);

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

  const userName = localStorage.getItem('name') || 'Student';
  const userRoom = localStorage.getItem("roomNumber") || 'Pending';
  const userBlock = localStorage.getItem("block") || '';
  const userMess = localStorage.getItem("messId") || '';

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
        <div className="lg:col-span-2 space-y-6">

          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">Notice Board</h2>
            <div className="glass-card divide-y divide-border/50">
              {notices.length > 0 ? notices.slice(0, 6).map(notice => (
                <div key={notice._id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-primary leading-tight">{notice.title}</h3>
                    <span className="text-[10px] text-muted-foreground">{new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-foreground/80 line-clamp-3 mb-3 leading-relaxed">
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
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground text-sm italic">
                  No recent notices.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Today's Mess Menu</h2>
          </div>
          <div className="glass-card overflow-hidden">
            {todayMenu ? (
              <>
                <div className="p-4 border-b border-border/50 bg-amber-500/5">
                  <h3 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Breakfast (7:30 - 9:30 AM)</h3>
                  <ul className="text-sm space-y-1 text-foreground/80">
                    {todayMenu.meals?.breakfast?.map((item, i) => <li key={i}>• {item}</li>) || <li>Not set</li>}
                  </ul>
                </div>
                <div className="p-4 border-b border-border/50 bg-emerald-500/5">
                  <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Lunch (12:30 - 2:30 PM)</h3>
                  <ul className="text-sm space-y-1 text-foreground/80">
                    {todayMenu.meals?.lunch?.map((item, i) => <li key={i}>• {item}</li>) || <li>Not set</li>}
                  </ul>
                </div>
                <div className="p-4 bg-indigo-500/5">
                  <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Dinner (7:30 - 9:30 PM)</h3>
                  <ul className="text-sm space-y-1 text-foreground/80">
                    {todayMenu.meals?.dinner?.map((item, i) => <li key={i}>• {item}</li>) || <li>Not set</li>}
                  </ul>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                Menu not updated for today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
