import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Users, Building2, AlertTriangle, MessageSquare, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';

export function AdminDashboard() {
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
    <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-6 mx-auto max-w-7xl w-full relative min-h-[calc(100vh-4rem)] space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Manage users, rooms, and monitor hostel operations centrally.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total Students" value={stats.totalStudents} icon={Users} />
        <DashboardCard title="Total Rooms" value={stats.totalRooms} icon={Building2} />
        <DashboardCard title="Pending" value={stats.pendingComplaints} icon={MessageSquare} className="border-amber-200 dark:border-amber-900/50" />
        <DashboardCard title="Active Issues" value={stats.activeIssues} icon={AlertTriangle} className="border-rose-200 dark:border-rose-900/50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent Activity</h2>
            <button className="text-sm font-bold text-primary hover:underline uppercase tracking-tighter">View All Reports</button>
          </div>
          <DataTable columns={pendingComplaintsColumns} data={stats.recentComplaints} />
        </div>

        <div className="glass-card p-6 flex flex-col border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold tracking-tight">Report Trends</h2>
            <div className="p-1 px-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">Last 7 Days</div>
          </div>
          <div className="flex-1 min-h-[250px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData.length > 0 ? stats.chartData : [{name: 'None', problems: 0}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.5, fontSize: 12}} dy={10} />
                <Tooltip 
                  cursor={{fill: 'rgba(var(--primary), 0.05)'}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="problems" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
