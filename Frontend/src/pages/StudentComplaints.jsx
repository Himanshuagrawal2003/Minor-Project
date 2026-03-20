import React, { useState, useEffect } from 'react';
import { 
  Plus, AlertCircle, CheckCircle2, MessageSquare, Clock, 
  ChevronDown, Loader2, Eye, X, Send
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';
import { getComplaints, addComplaint, CATEGORIES, PRIORITIES } from '../services/complaintStore';

export function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const studentName = localStorage.getItem('name') || 'Rahul Sharma';
  const studentId = localStorage.getItem('userID') || 'STU-001';
  const room = 'B-204';

  const [form, setForm] = useState({
    title: '', category: 'Electrical', description: '', priority: 'Medium'
  });

  const loadComplaints = () => {
    const all = getComplaints();
    // Students see only their own complaints
    setComplaints(all.filter(c => c.studentId === studentId));
  };

  useEffect(() => { loadComplaints(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      addComplaint({ ...form, studentName, studentId, room });
      setMessage({ type: 'success', text: 'Complaint submitted successfully! You can track the status here.' });
      setForm({ title: '', category: 'Electrical', description: '', priority: 'Medium' });
      setIsModalOpen(false);
      setIsSubmitting(false);
      loadComplaints();
    }, 800);
  };

  const filters = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
  const filtered = activeFilter === 'All' ? complaints : complaints.filter(c => c.status === activeFilter);

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
          <h1 className="text-2xl font-bold tracking-tight">My Complaints</h1>
          <p className="text-muted-foreground mt-1">Submit and track your hostel complaints.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> New Complaint
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-muted/40' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Resolved', value: stats.resolved, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
        ].map(s => (
          <div key={s.label} className={`glass-card p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
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

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              activeFilter === f
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <div className="glass-card py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-muted p-4 rounded-full mb-4">
            <MessageSquare size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No complaints here</h3>
          <p className="text-muted-foreground max-w-xs mt-1 text-sm">
            {activeFilter === 'All' ? "Click \"New Complaint\" to raise your first issue." : `No ${activeFilter} complaints.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(complaint => (
            <div key={complaint.id} className="glass-card p-5 hover:border-primary/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{complaint.id}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">{complaint.category}</span>
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded uppercase',
                      complaint.priority === 'High' ? 'bg-destructive/10 text-destructive' :
                      complaint.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-emerald-500/10 text-emerald-600'
                    )}>{complaint.priority}</span>
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
              <h2 className="text-xl font-bold">{viewingComplaint.id}</h2>
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
