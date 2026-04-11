import React, { useState, useEffect } from 'react';
import {
  MessageSquare, CheckCircle2, Clock, AlertCircle,
  Search, Eye, X, Save, Loader2, Filter
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StatusBadge } from '../components/StatusBadge';
import { DashboardCard } from '../components/DashboardCard';
import { api } from '../services/api';

export function ComplaintsManagement() {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editFields, setEditFields] = useState({ status: '', remarks: '', assignedStaffId: '' });
  const [updatingStatus, setUpdatingStatus] = useState({}); // Tracking loading per complaint ID

  const userRole = localStorage.getItem('role');

  const loadComplaints = async () => {
    try {
      const data = await api.get('/complaints');
      setComplaints(data);
    } catch (err) {
      console.error("Failed to load complaints", err);
    }
  };

  const loadStaff = async () => {
    try {
      const data = await api.get('/complaints/staff');
      setStaffList(data);
    } catch (err) {
      console.error("Failed to load staff", err);
    }
  };

  useEffect(() => {
    loadComplaints();
    if (userRole !== 'student') loadStaff();
  }, [userRole]);

  const openView = (complaint) => {
    setViewingComplaint(complaint);
    setEditFields({ 
      status: complaint.status, 
      remarks: complaint.remarks || '', 
      assignedStaffId: complaint.assignedStaffId || '' 
    });
    setMessage({ type: '', text: '' });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch(`/complaints/${viewingComplaint._id}`, editFields);
      setViewingComplaint(prev => ({ ...prev, ...editFields }));
      setMessage({ type: 'success', text: 'Complaint updated successfully!' });
      loadComplaints();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update complaint.' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleQuickStatusChange = async (complaintId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [complaintId]: true }));
    try {
      await api.patch(`/complaints/${complaintId}`, { status: newStatus });
      loadComplaints();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [complaintId]: false }));
    }
  };

  const STATUSES = ['Pending', 'In Progress', 'Escalated', 'Resolved', 'Rejected'];

  const categories = ['All', ...new Set(complaints.map(c => c.category))];
  const filtered = complaints.filter(c => {
    const studentName = (c.studentId?.name || c.studentName || '').toLowerCase();
    const studentCustomId = (c.studentId?.customId || '').toLowerCase();
    const title = (c.title || '').toLowerCase();
    const id = (c._id || '').toLowerCase();

    const matchSearch = title.includes(searchQuery.toLowerCase()) ||
                        studentName.includes(searchQuery.toLowerCase()) ||
                        studentCustomId.includes(searchQuery.toLowerCase()) ||
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
    <div className="space-y-6 pt-5 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complaints Management</h1>
          <p className="text-muted-foreground mt-1">View and take action on student complaints.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <DashboardCard title="Total Complaints" value={stats.total} icon={MessageSquare} />
        <DashboardCard title="Pending" value={stats.pending} icon={AlertCircle} className="border-amber-200 dark:border-amber-900/50" />
        <DashboardCard title="In Progress" value={stats.inProgress} icon={Clock} className="border-blue-200 dark:border-blue-900/50" />
        <DashboardCard title="Resolved" value={stats.resolved} icon={CheckCircle2} className="border-emerald-200 dark:border-emerald-900/50" />
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Search by title, student, or ID..."
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
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Complaints Table */}
      {filtered.length === 0 ? (
        <div className="glass-card py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-muted p-4 rounded-full mb-4">
            <MessageSquare size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No complaints found</h3>
          <p className="text-muted-foreground max-w-xs mt-1 text-sm">
            Try adjusting your filters or search query.
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
                  </div>
                  <h3 className="font-semibold">{complaint.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>👤 {complaint.studentId?.name || complaint.studentName}</span>
                    <span>🆔 {complaint.studentId?.customId || 'N/A'}</span>
                    <span>🚪 Room {complaint.studentId?.roomNumber || complaint.room}</span>
                    <span className="font-bold text-primary/80">🏢 Block {complaint.studentId?.block || complaint.block || 'N/A'}</span>
                    <span>📅 {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    {complaint.assignedStaffId && (() => {
                      const staff = staffList.find(s => s._id === complaint.assignedStaffId);
                      return staff ? (
                        <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                          🔧 Assigned: {staff.name}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  {complaint.remarks && (
                    <p className="text-xs text-primary mt-2 italic"> {complaint.remarks}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge 
                    status={complaint.status} 
                    onStatusChange={userRole !== 'student' ? (val) => handleQuickStatusChange(complaint._id, val) : null}
                    options={STATUSES}
                    isLoading={updatingStatus[complaint._id]}
                  />
                  <button
                    onClick={() => openView(complaint)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg transition-all"
                  >
                    <Eye size={13} /> Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manage Complaint Modal */}
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
              {message.text && (
                <div className={cn(
                  'p-3 rounded-xl border flex items-center gap-2 text-sm',
                  message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-destructive/10 border-destructive/20 text-destructive'
                )}>
                  <CheckCircle2 size={16} /> {message.text}
                </div>
              )}

              <h3 className="text-lg font-semibold">{viewingComplaint.title}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Student:</span> <strong>{viewingComplaint.studentName}</strong></div>
                <div><span className="text-muted-foreground">Room:</span> <strong>{viewingComplaint.room}</strong></div>
                <div><span className="text-muted-foreground">Category:</span> <strong>{viewingComplaint.category}</strong></div>
                <div><span className="text-muted-foreground">Priority:</span> <strong>{viewingComplaint.priority}</strong></div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 font-medium">Description:</p>
                <p className="text-sm bg-muted/30 p-3 rounded-xl">{viewingComplaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Update Status</label>
                  <select
                    className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={editFields.status}
                    onChange={e => setEditFields({ ...editFields, status: e.target.value })}
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Assign to Staff</label>
                  <select
                    className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={editFields.assignedStaffId}
                    onChange={e => setEditFields({ ...editFields, assignedStaffId: e.target.value })}
                  >
                    <option value="">— Unassigned —</option>
                    {staffList.map(staff => (
                      <option key={staff._id} value={staff._id}>
                        {staff.name} {staff.extra ? `(${staff.extra})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Remarks <span className="text-muted-foreground font-normal">(visible to student)</span></label>
                <textarea
                  className="w-full min-h-[90px] p-3 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  placeholder="e.g. A plumber has been assigned and will visit tomorrow..."
                  value={editFields.remarks}
                  onChange={e => setEditFields({ ...editFields, remarks: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setViewingComplaint(null)}
                  className="flex-1 py-2.5 border border-border font-bold rounded-xl hover:bg-muted transition-all">
                  Close
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}