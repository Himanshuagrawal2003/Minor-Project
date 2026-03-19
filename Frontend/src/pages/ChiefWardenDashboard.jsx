import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { AlertOctagon, TrendingUp, Users } from 'lucide-react';

export function ChiefWardenDashboard() {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chief Warden Supervision</h1>
          <p className="text-muted-foreground mt-1">Monitor escalations and oversee warden performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Escalated Complaints" value="2" icon={AlertOctagon} className="border-rose-200 dark:border-rose-900/50 text-rose-600" />
        <DashboardCard title="Avg Resolution Time" value="2.4 Days" icon={TrendingUp} />
        <DashboardCard title="Active Wardens" value="6" icon={Users} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Escalated Issues Requiring Interventions</h2>
        </div>
        <DataTable columns={escalatedColumns} data={escalatedData} />
      </div>
    </div>
  );
}
