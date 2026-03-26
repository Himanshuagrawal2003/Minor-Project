import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { AlertOctagon, TrendingUp, Users, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export function ChiefWardenDashboard() {
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

  const escalatedColumns = [
    { header: 'Complaint ID', accessorKey: 'id' },
    { header: 'Assigned Warden', accessorKey: 'warden' },
    { header: 'Issue Category', accessorKey: 'category' },
    { header: 'Days Pending', accessorKey: 'days' },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Action', accessorKey: 'id', cell: () => (
      <button className="text-xs px-3 py-1.5 bg-purple-600 text-white hover:bg-purple-700 rounded-md font-medium transition-colors">
        Intervene
      </button>
    )}
  ];

  const escalatedData = [
    { id: 'C-0892', warden: 'R.K. Singh (Block A)', category: 'Disciplinary', days: '5 Days', status: 'Escalated' },
    { id: 'C-0914', warden: 'S. Patel (Block C)', category: 'Infrastructure', days: '7 Days', status: 'Escalated' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const stats = data || {
    pendingComplaints: 0,
    totalWardens: 0
  };

  return (
        <div className="px-4 py-4 sm:px-5 sm:py-6 md:px-6 md:py-6 mx-auto max-w-7xl w-full relative min-h-[calc(100vh-4rem)] space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chief Warden Supervision</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Monitor escalations and oversee warden performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Escalated Complaints" value={stats.pendingComplaints} icon={AlertOctagon} className="border-rose-200 dark:border-rose-900/50 text-rose-600" />
        <DashboardCard title="Avg Resolution Time" value="2.4 Days" icon={TrendingUp} />
        <DashboardCard title="Active Wardens" value={stats.totalWardens} icon={Users} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent Activity Needing Supervision</h2>
        </div>
        <DataTable columns={[
          { header: 'ID', accessorKey: 'id', cell: (row) => <span className="font-mono text-xs">#{row.id}</span> },
          { header: 'Student', accessorKey: 'student' },
          { header: 'Category', accessorKey: 'category' },
          { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
          { header: 'Date', accessorKey: 'date' }
        ]} data={stats.recentComplaints || []} />
      </div>
    </div>
  );
}
