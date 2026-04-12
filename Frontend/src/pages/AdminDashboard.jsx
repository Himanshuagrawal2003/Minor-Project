import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Users, Building2, AlertTriangle, MessageSquare, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const pendingComplaintsColumns = [
    { header: 'ID', accessorKey: 'id', cell: (row) => <span className="font-mono text-xs">#{row.id}</span> },
    { header: 'Student', accessorKey: 'student' },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Date', accessorKey: 'date' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const stats = data || {
    totalStudents: 0,
    totalRooms: 0,
    pendingComplaints: 0,
    activeIssues: 0,
    recentComplaints: [],
    chartData: []
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground mt-0.5 sm:mt-1 text-sm sm:text-base">Manage users, rooms, and monitor hostel operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <DashboardCard title="Total Students" value={stats.totalStudents} icon={Users} />
        <DashboardCard title="Total Rooms" value={stats.totalRooms} icon={Building2} />
        <DashboardCard title="Pending Complaints" value={stats.pendingComplaints} icon={MessageSquare} className="border-amber-200 dark:border-amber-900/50" />
        <DashboardCard title="Action Required" value={stats.activeIssues} icon={AlertTriangle} className="border-rose-200 dark:border-rose-900/50" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 mt-2 sm:mt-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Recent Activity</h2>
          <button onClick={() => navigate('/admin/complaints')} className="text-[10px] sm:text-sm font-bold text-primary hover:underline uppercase tracking-wider whitespace-nowrap shrink-0 bg-primary/5 px-2 py-1 rounded-md">
            View All
          </button>
        </div>
        <DataTable columns={pendingComplaintsColumns} data={stats.recentComplaints} />
      </div>
    </div>
  );
}


