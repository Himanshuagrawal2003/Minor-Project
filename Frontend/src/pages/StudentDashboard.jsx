import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { MessageSquare, CalendarDays, AlertTriangle, Coffee, Building2 } from 'lucide-react';

export function StudentDashboard() {
  const recentComplaintsColumns = [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Date', accessorKey: 'date' }
  ];

  const recentComplaintsData = [
    { id: 'C-1043', category: 'Electrical', status: 'Pending', date: 'Oct 24, 2026' },
    { id: 'C-1021', category: 'Internet', status: 'Resolved', date: 'Oct 18, 2026' },
  ];

  return (
        <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-6 mx-auto max-w-7xl w-full relative min-h-[calc(100vh-4rem)] space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Himanshu!</h1>
          <p className="text-muted-foreground mt-1">Room S-30 • Block Senior Boys Hostel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Active Complaints" value="1" icon={MessageSquare} className="border-amber-200 dark:border-amber-900/50" />
        <DashboardCard title="Leave Requests" value="0" icon={CalendarDays} />
        <DashboardCard title="Room Info" value="S-30" icon={Building2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Recent Complaints</h2>
            </div>
            <DataTable columns={recentComplaintsColumns} data={recentComplaintsData} />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">Notice Board</h2>
            <div className="glass-card divide-y divide-border/50">
              <div className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">Hostel timing changes for Diwali</h3>
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
                <p className="text-sm text-foreground/80">The hostel gates will remain open until 11 PM during the festival days.</p>
              </div>
              <div className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">Maintenance in Block B</h3>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </div>
                <p className="text-sm text-foreground/80">Water supply will be suspended from 10 AM to 2 PM on Thursday.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Today's Mess Menu</h2>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-amber-500/5">
              <h3 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Breakfast (7:30 - 9:30 AM)</h3>
              <ul className="text-sm space-y-1 text-foreground/80">
                <li>• Poha</li>
                <li>• Banana / Apple</li>
                <li>• Tea / Coffee</li>
                <li>• Bread & Butter</li>
              </ul>
            </div>
            <div className="p-4 border-b border-border/50 bg-emerald-500/5">
              <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Lunch (12:30 - 2:30 PM)</h3>
              <ul className="text-sm space-y-1 text-foreground/80">
                <li>• Steamed Rice</li>
                <li>• Dal Fry</li>
                <li>• Paneer Butter Masala</li>
                <li>• Roti</li>
                <li>• Green Salad</li>
              </ul>
            </div>
            <div className="p-4 bg-indigo-500/5">
              <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Dinner (7:30 - 9:30 PM)</h3>
              <ul className="text-sm space-y-1 text-foreground/80">
                <li>• Veg Pulao</li>
                <li>• Mix Veg Curry</li>
                <li>• Chapati</li>
                <li>• Gulab Jamun</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
