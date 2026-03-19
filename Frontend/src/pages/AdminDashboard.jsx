import React from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Users, Building2, AlertTriangle, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Mon', problems: 12 },
  { name: 'Tue', problems: 19 },
  { name: 'Wed', problems: 15 },
  { name: 'Thu', problems: 22 },
  { name: 'Fri', problems: 8 },
  { name: 'Sat', problems: 5 },
  { name: 'Sun', problems: 2 },
];

export function AdminDashboard() {
  const pendingComplaintsColumns = [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Student', accessorKey: 'student' },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Date', accessorKey: 'date' }
  ];

  const pendingComplaintsData = [
    { id: 'C-1043', student: 'Rahul Sharma', category: 'Electrical', status: 'Pending', date: 'Oct 24, 2026' },
    { id: 'C-1044', student: 'Priya Patel', category: 'Plumbing', status: 'Pending', date: 'Oct 24, 2026' },
    { id: 'C-1045', student: 'Arjun Das', category: 'Internet', status: 'Escalated', date: 'Oct 23, 2026' },
    { id: 'C-1046', student: 'Sneha Reddy', category: 'Cleaning', status: 'Active', date: 'Oct 23, 2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Manage users, rooms, and monitor hostel operations centrally.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Total Students" value="842" icon={Users} trend={2.5} trendLabel="vs last semester" />
        <DashboardCard title="Total Rooms" value="320" icon={Building2} />
        <DashboardCard title="Pending Complaints" value="24" icon={MessageSquare} className="border-amber-200 dark:border-amber-900/50" />
        <DashboardCard title="Active Issues" value="7" icon={AlertTriangle} className="border-rose-200 dark:border-rose-900/50" trend={-12} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent Complaints Needs Action</h2>
            <button className="text-sm font-medium text-primary hover:underline">View All</button>
          </div>
          <DataTable columns={pendingComplaintsColumns} data={pendingComplaintsData} />
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Issues by Day</h2>
          <div className="flex-1 min-h-[250px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.5, fontSize: 12}} dy={10} />
                <Tooltip 
                  cursor={{fill: 'rgba(170, 59, 255, 0.1)'}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="problems" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
