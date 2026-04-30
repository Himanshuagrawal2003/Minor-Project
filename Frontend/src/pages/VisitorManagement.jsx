import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BookUser, Search, AlertCircle, UserPlus, Phone, Mail, GraduationCap, Calendar, BedDouble, CheckCircle2, Clock } from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { cn } from '../lib/utils';

export function VisitorManagement() {
  const [visitors, setVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingStatus, setUpdatingStatus] = useState({});

  const fetchVisitors = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/visitors');
      setVisitors(res.data || res || []);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to fetch visitors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleQuickStatusChange = async (id, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/visitors/${id}`, { status: newStatus });
      setVisitors(visitors.map(v => v._id === id ? { ...v, status: newStatus } : v));
    } catch (err) {
      alert(err?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleConvertToStudent = async (id) => {
    if (!window.confirm("Are you sure you want to convert this visitor to a student? This will auto-generate their ID and temporary password.")) return;
    try {
      const res = await api.post(`/visitors/${id}/register`);
      alert(`Student created successfully!\n\nStudent ID: ${res.user.customId}\nPassword: ${res.user.customId}\n\nThey must use these credentials to log in and complete their profile.`);
      fetchVisitors(); // Refresh the list
    } catch (err) {
      alert(err?.message || 'Failed to convert to student');
    }
  };

  const visitorsList = Array.isArray(visitors) ? visitors : (visitors?.data || []);

  const filteredVisitors = visitorsList.filter(v => {
    const matchSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.phone?.includes(searchTerm);
    const matchStatus = filterStatus === 'All' || v.status === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  const stats = {
    total: visitorsList.length,
    pending: visitorsList.filter(v => v.status === 'pending').length,
    contacted: visitorsList.filter(v => v.status === 'contacted').length,
    allotted: visitorsList.filter(v => v.status === 'allotted').length,
  };

  const STATUSES = ['pending', 'contacted', 'allotted', 'cancelled'];

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            Visitor Inquiries
          </h1>
          <p className="text-muted-foreground mt-1">Manage hostel inquiries and track visitor status.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <DashboardCard title="Total Inquiries" value={stats.total} icon={BookUser} />
        <DashboardCard title="Pending" value={stats.pending} icon={AlertCircle} className="border-amber-200 dark:border-amber-900/50" />
        <DashboardCard title="Contacted" value={stats.contacted} icon={Clock} className="border-blue-200 dark:border-blue-900/50" />
        <DashboardCard title="Allotted" value={stats.allotted} icon={CheckCircle2} className="border-emerald-200 dark:border-emerald-900/50" />
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer capitalize"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Visitor Cards */}
      {filteredVisitors.length === 0 ? (
        <div className="glass-card py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-muted p-4 rounded-full mb-4">
            <BookUser size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No inquiries found</h3>
          <p className="text-muted-foreground max-w-xs mt-1 text-sm">
            Try adjusting your filters or search query.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVisitors.map(visitor => (
            <div key={visitor._id} className="glass-card p-5 hover:border-primary/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{visitor._id.substring(visitor._id.length - 8)}</span>
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded uppercase',
                      visitor.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                        visitor.status === 'contacted' ? 'bg-blue-500/10 text-blue-600' :
                          visitor.status === 'allotted' ? 'bg-emerald-500/10 text-emerald-600' :
                            'bg-rose-500/10 text-rose-600'
                    )}>{visitor.status}</span>
                  </div>
                  <h3 className="font-bold text-lg">{visitor.name}</h3>
                  <div className="flex items-center gap-x-4 gap-y-2 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1.5"><Phone size={14} className="text-primary/70" /> {visitor.phone}</span>
                    {visitor.email && <span className="flex items-center gap-1.5"><Mail size={14} className="text-primary/70" /> {visitor.email}</span>}
                    <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-primary/70" /> {visitor.college || 'N/A'} {visitor.year ? `(${visitor.year})` : ''}</span>
                    <span className="flex items-center gap-1.5 font-medium text-foreground"><BedDouble size={14} className="text-primary/70" /> {visitor.preferredRoomType || 'N/A'}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary/70" /> {new Date(visitor.inquiryDate || visitor.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {updatingStatus[visitor._id] ? (
                    <div className="px-2.5 py-1.5 border border-border rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <select
                      value={visitor.status}
                      onChange={(e) => handleQuickStatusChange(visitor._id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border border-border cursor-pointer focus:ring-2 focus:outline-none capitalize transition-all ${visitor.status === 'pending' ? 'bg-amber-500/10 text-amber-600 focus:ring-amber-500/50' :
                        visitor.status === 'contacted' ? 'bg-blue-500/10 text-blue-600 focus:ring-blue-500/50' :
                          visitor.status === 'allotted' ? 'bg-emerald-500/10 text-emerald-600 focus:ring-emerald-500/50' :
                            'bg-rose-500/10 text-rose-600 focus:ring-rose-500/50'
                        }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="allotted">Allotted</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                  {visitor.status !== 'allotted' && visitor.status !== 'cancelled' && (
                    <button
                      onClick={() => handleConvertToStudent(visitor._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-95 whitespace-nowrap"
                    >
                      <UserPlus size={14} /> Convert
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
