import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Users, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';

export function WardenDashboard() {
  const pendingLeavesColumns = [
    { header: 'Student', accessorKey: 'student' },
    { header: 'Room', accessorKey: 'room' },
    { header: 'Duration', accessorKey: 'duration' },
    { header: 'Reason', accessorKey: 'reason' },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Actions', accessorKey: 'id', cell: () => (
      <div className="flex gap-2">
        <button className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded font-medium transition-colors">Approve</button>
        <button className="text-xs px-2 py-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded font-medium transition-colors">Reject</button>
      </div>
    )}
  ];

  const pendingLeavesData = [
    { id: 'L-101', student: 'Amit Kumar', room: 'A-102', duration: 'Oct 25 - Oct 28', reason: 'Going Home', status: 'Pending' },
    { id: 'L-102', student: 'Rohan Singh', room: 'C-305', duration: 'Oct 26 - Oct 27', reason: 'Medical/Sick', status: 'Pending' },
  ];

  return (
        <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-6 mx-auto max-w-7xl w-full relative min-h-[calc(100vh-4rem)] space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warden Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of hostel activity and pending approvals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCard title="Pending Complaints" value="12" icon={AlertCircle} className="border-amber-200 dark:border-amber-900/50" />
        <DashboardCard title="Leave Requests" value="5" icon={UserCheck} className="border-blue-200 dark:border-blue-900/50" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Pending Leave Approvals</h2>
            <button className="text-sm font-medium text-primary hover:underline">View All</button>
          </div>
          <DataTable columns={pendingLeavesColumns} data={pendingLeavesData} />
        </div>
      </div>
    </div>
  );
}
