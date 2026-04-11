import React, { useState, useEffect } from 'react';
import {
  Plus, AlertCircle, CheckCircle2, MessageSquare, Clock,
  ChevronDown, Loader2, Eye, X, Send, Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';
import { DashboardCard } from '../components/DashboardCard';
import { api } from '../services/api';

export function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  // Removed activeTab since 'Community' concept is replaced by 'Hostel Complaints'

  const studentId = localStorage.getItem('userID');
  const studentRoom = localStorage.getItem('roomNumber') || 'Pending';

  const [form, setForm] = useState({
    title: '', category: 'Electrical', description: '', priority: 'Medium'
  });

  const loadComplaints = async () => {
    try {
      const data = await api.get('/complaints');
      setComplaints(data);
    } catch (err) {
      console.error("Failed to load complaints", err);
    }
  };

  useEffect(() => { loadComplaints(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/complaints', { ...form, room: studentRoom });
      setMessage({ type: 'success', text: 'Complaint submitted successfully! You can track the status here.' });
      setForm({ title: '', category: 'Electrical', description: '', priority: 'Medium' });
      setIsModalOpen(false);
      loadComplaints();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit complaint.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CATEGORIES = ['Electrical', 'Plumbing', 'Internet', 'Cleanliness', 'Furniture', 'Security', 'Mess', 'Other'];
  const PRIORITIES = ['Low', 'Medium', 'High'];

  const STATUSES = ['Pending', 'In Progress', 'Escalated', 'Resolved', 'Rejected'];

  const categoriesDb = ['All', ...new Set(complaints.map(c => c.category))];

  const filtered = complaints.filter(c => {
    const title = (c.title || '').toLowerCase();
    const id = (c._id || '').toLowerCase();
    const desc = (c.description || '').toLowerCase();

    const matchSearch = title.includes(searchQuery.toLowerCase()) ||
                        desc.includes(searchQuery.toLowerCase()) ||
                        id.includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchCat = filterCategory === 'All' || c.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hostel Complaints</h1>
          <p className="text-muted-foreground mt-1 text-sm">View all complaints reported in your hostel block.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {/* Removed My/Community toggle as requested */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 duration-200"
          >
            <Plus size={18} /> New Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <DashboardCard title="Total Complaints" value={stats.total} icon={MessageSquare} />
        <DashboardCard title="Pending" value={stats.pending} icon={AlertCircle} className="border-amber-200 dark:border-amber-900/50" />
        <DashboardCard title="In Progress" value={stats.inProgress} icon={Clock} className="border-blue-200 dark:border-blue-900/50" />
        <DashboardCard title="Resolved" value={stats.resolved} icon={CheckCircle2} className="border-emerald-200 dark:border-emerald-900/50" />
      </div>

      {/* Success / Error message */}
      {message.text && (
        <div className={cn(
          'p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2',
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        )}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm font-medium">{message.text}</p>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Search by title, description, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          {categoriesDb.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <div className="glass-card py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-muted p-4 rounded-full mb-4">
            <MessageSquare size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No complaints found</h3>
          <p className="text-muted-foreground max-w-xs mt-1 text-sm">
            Try adjusting your filters or search query, or click "New Report" to raise your first issue.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(complaint => (
            <div key={complaint._id} className="glass-card p-5 hover:border-primary/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{complaint._id.substring(complaint._id.length - 8)}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">{complaint.category}</span>
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded uppercase',
                      complaint.priority === 'High' ? 'bg-destructive/10 text-destructive' :
                        complaint.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-emerald-500/10 text-emerald-600'
                    )}>{complaint.priority}</span>
                    {(complaint.studentId?._id === studentId || complaint.studentId === studentId) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-primary/10 text-primary">
                        My Request
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground">{complaint.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{complaint.description}</p>
                  {complaint.remarks && (
                    <p className="text-xs text-primary mt-2 italic">
                      💬 Remark: {complaint.remarks}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={complaint.status} />
                  <button
                    onClick={() => setViewingComplaint(complaint)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="View details"
                  >
                    <Eye size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock size={11} />
                <span>Submitted {new Date(complaint.createdAt).toLocaleDateString()}</span>
                {complaint.updatedAt !== complaint.createdAt && (
                  <span className="ml-2">· Updated {new Date(complaint.updatedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Complaint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border/50 flex justify-between items-center sticky top-0 bg-card z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="text-primary" size={20} />
                New Complaint
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Title <span className="text-destructive">*</span></label>
                <input
                  className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Fan not working in room"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Category <span className="text-destructive">*</span></label>
                  <select
                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Priority</label>
                  <select
                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                  >
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Description <span className="text-destructive">*</span></label>
                <textarea
                  className="w-full min-h-[120px] p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-border font-bold rounded-xl hover:bg-muted transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <h2 className="text-xl font-bold">{viewingComplaint._id.substring(viewingComplaint._id.length - 8)}</h2>
              <button onClick={() => setViewingComplaint(null)} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={viewingComplaint.status} />
                <span className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded uppercase',
                  viewingComplaint.priority === 'High' ? 'bg-destructive/10 text-destructive' :
                    viewingComplaint.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-emerald-500/10 text-emerald-600'
                )}>{viewingComplaint.priority} Priority</span>
              </div>
              <h3 className="text-lg font-semibold">{viewingComplaint.title}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Category:</span> <strong>{viewingComplaint.category}</strong></div>
                <div><span className="text-muted-foreground">Room:</span> <strong>{viewingComplaint.room}</strong></div>
                <div><span className="text-muted-foreground">Submitted:</span> <strong>{new Date(viewingComplaint.createdAt).toLocaleDateString()}</strong></div>
                <div><span className="text-muted-foreground">Updated:</span> <strong>{new Date(viewingComplaint.updatedAt).toLocaleDateString()}</strong></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-medium">Description:</p>
                <p className="text-sm bg-muted/30 p-3 rounded-xl">{viewingComplaint.description}</p>
              </div>
              {viewingComplaint.remarks && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Management Remark:</p>
                  <p className="text-sm bg-primary/5 border border-primary/20 text-primary p-3 rounded-xl italic">{viewingComplaint.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}