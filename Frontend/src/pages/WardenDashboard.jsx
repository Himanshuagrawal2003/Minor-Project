import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { AlertCircle, UserCheck, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export function WardenDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [dashRes, leavesRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/leaves')
      ]);
      setData(dashRes);
      setLeaves(leavesRes.filter(l => l.status === 'Pending'));
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [leaves, setLeaves] = useState([]);

  const pendingLeavesColumns = [
    { header: 'Student', accessorKey: 'studentName' },
    { header: 'Room', accessorKey: 'room' },
    { header: 'Duration', accessorKey: 'duration', cell: (row) => `${new Date(row.startDate).toLocaleDateString()} - ${new Date(row.endDate).toLocaleDateString()}` },
    { header: 'Reason', accessorKey: 'reason' },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Actions', accessorKey: '_id', cell: (row) => (
      <div className="flex gap-2">
        <button 
          onClick={() => handleAction(row._id, 'Approved')}
          className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded font-medium transition-colors"
        >Approve</button>
        <button 
          onClick={() => handleAction(row._id, 'Rejected')}
          className="text-xs px-2 py-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded font-medium transition-colors"
        >Reject</button>
      </div>
    )}
  ];

  const handleAction = async (id, status) => {
    try {
      await api.patch(`/leaves/${id}`, { status, remarks: 'Processed from dashboard' });
      // Update local state instead of reload
      setLeaves(prev => prev.filter(l => l._id !== id));
      // Re-fetch dashboard stats to keep them in sync
      const dashRes = await api.get('/dashboard');
      setData(dashRes);
    } catch (err) {
      console.error("Action error:", err);
      alert("Action failed: " + (err.response?.data?.message || err.message));
    }
  };

  const pendingLeavesData = leaves;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const stats = data || {
    pendingComplaints: 0,
    activeIssues: 0, // treating as leave requests for now if not implemented
  };

  return (
        <div className="space-y-4 sm:space-y-6 w-full pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Warden Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Overview of hostel activity and pending approvals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCard title="Pending Complaints" value={stats.pendingComplaints || 0} icon={AlertCircle} className="border-amber-200 dark:border-amber-900/50" />
        <DashboardCard title="Leave Requests" value={stats.pendingLeaves || 0} icon={UserCheck} className="border-blue-200 dark:border-blue-900/50" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Pending Leave Approvals</h2>
            <button className="text-sm font-bold text-primary hover:underline uppercase tracking-tighter">View All</button>
          </div>
          <DataTable columns={pendingLeavesColumns} data={pendingLeavesData} />
        </div>
      </div>
    </div>
  );
}


