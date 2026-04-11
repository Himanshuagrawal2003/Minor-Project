import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { AlertOctagon, ShieldAlert, PhoneCall, TrendingUp, Users, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export function ChiefWardenDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const stats = data || {};
  const escalatedComplaints = stats.escalatedComplaints || [];
  const escalatedCount = stats.escalatedComplaintsCount || 0;
  const emergenciesCount = stats.activeEmergenciesCount || 0;
  const pendingLeaves = stats.pendingLeaves || 0;
  const totalWardens = stats.totalWardens || 0;

  return (
    <div className="px-4 py-4 sm:px-5 sm:py-6 md:px-6 md:py-6 mx-auto max-w-7xl w-full relative min-h-[calc(100vh-4rem)] space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chief Warden Supervision</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Monitor escalations and oversee warden performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard 
          title="Escalated Complaints" 
          value={escalatedCount} 
          icon={AlertOctagon} 
          className="border-rose-200 dark:border-rose-900/50 text-rose-600 shadow-rose-500/10" 
        />
        <DashboardCard 
          title="Active Emergencies" 
          value={emergenciesCount} 
          icon={PhoneCall} 
          className="border-destructive/30 text-destructive shadow-destructive/10" 
        />
        <DashboardCard title="Pending Leaves" value={pendingLeaves} icon={TrendingUp} />
        <DashboardCard title="Total Wardens" value={totalWardens} icon={Users} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Escalated Issues Needing Attention</h2>
          <button 
            onClick={() => navigate('/chief-warden/escalations')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            View All <ShieldAlert size={14} />
          </button>
        </div>
        
        {escalatedComplaints.length === 0 ? (
          <div className="glass-card p-12 text-center border-dashed">
             <p className="text-muted-foreground font-medium">No escalated complaints at the moment. Good job!</p>
          </div>
        ) : (
          <DataTable columns={[
            { header: 'ID', accessorKey: 'id', cell: (row) => <span className="font-mono text-xs">#{row.id}</span> },
            { header: 'Student', accessorKey: 'student' },
            { header: 'Category', accessorKey: 'category' },
            { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
            { header: 'Date', accessorKey: 'date' },
            { header: 'Action', accessorKey: 'id', cell: () => (
              <button 
                onClick={() => navigate('/chief-warden/escalations')}
                className="text-[10px] uppercase tracking-widest px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-md font-black transition-colors shadow-lg shadow-rose-500/20"
              >
                Intervene
              </button>
            )}
          ]} data={escalatedComplaints} />
        )}
      </div>
    </div>
  );
}
