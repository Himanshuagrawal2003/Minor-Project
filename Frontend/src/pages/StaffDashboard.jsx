import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Wrench, CheckCircle, Clock } from 'lucide-react';

export function StaffDashboard() {
  const taskColumns = [
    { header: 'Task ID', accessorKey: 'id' },
    { header: 'Location', accessorKey: 'location' },
    { header: 'Issue', accessorKey: 'issue' },
    { header: 'Priority', accessorKey: 'priority', cell: (row) => <StatusBadge status={row.priority} /> },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Action', accessorKey: 'id', cell: () => (
      <button className="text-xs px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors">
        Update Status
      </button>
    )}
  ];

  const taskData = [
    { id: 'TSK-842', location: 'Room B-204', issue: 'Fan not working', priority: 'Pending', status: 'Active' },
    { id: 'TSK-845', location: 'Block A Corridor', issue: 'Tube light broken', priority: 'Pending', status: 'Active' },
    { id: 'TSK-832', location: 'Washroom C-1', issue: 'Water leakage', priority: 'Urgent', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Portal</h1>
          <p className="text-muted-foreground mt-1">Manage and update your assigned tasks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Assigned Tasks" value="8" icon={Wrench} />
        <DashboardCard title="Pending" value="3" icon={Clock} className="border-amber-200 dark:border-amber-900/50" />
        <DashboardCard title="Completed Today" value="2" icon={CheckCircle} className="border-emerald-200 dark:border-emerald-900/50" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Current Assignments</h2>
        </div>
        <DataTable columns={taskColumns} data={taskData} />
      </div>
    </div>
  );
}
