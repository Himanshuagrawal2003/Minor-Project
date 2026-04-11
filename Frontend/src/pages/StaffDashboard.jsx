import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Wrench, CheckCircle, Clock, BellRing, Megaphone, Calendar, User, Eye, X, Save, Loader2, Paperclip, Download, FileText } from 'lucide-react';

import { api } from '../services/api';
import { cn } from '../lib/utils';

/**
 * StaffDashboard Component
 * Provides a portal for staff members to manage their assigned complaints and view notices.
 */
export function StaffDashboard() {
  const staffName = localStorage.getItem('name') || 'Staff Member';
  
  const [notices, setNotices] = useState([]);
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoticesLoading, setIsNoticesLoading] = useState(true);
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editFields, setEditFields] = useState({ status: '', remarks: '' });

  const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/complaints');
      // Ensure each item has an 'id' for the DataTable accessor
      const formatted = data.map(c => ({
        ...c,
        id: c._id ? c._id.substring(c._id.length - 8) : 'N/A'
      }));
      setAssignedComplaints(formatted);
    } catch (err) {
      console.error("Failed to load staff complaints", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotices = async () => {
    try {
      setIsNoticesLoading(true);
      const data = await api.get('/notices');
      // Filter notices for staff or all
      const staffNotices = data.filter(n => 
        (n.targetRoles || []).includes('staff') || 
        (n.targetRoles || []).includes('all') ||
        (n.targetRoles || []).length === 0
      );
      setNotices(staffNotices);
    } catch (err) {
      console.error("Failed to load staff notices", err);
    } finally {
      setIsNoticesLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
    loadNotices();
  }, []);

  const openManage = (complaint) => {
    setViewingComplaint(complaint);
    setEditFields({ 
      status: complaint.status, 
      remarks: complaint.remarks || '' 
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch(`/complaints/${viewingComplaint._id}`, editFields);
      loadComplaints();
      setViewingComplaint(null);
    } catch (err) {
      console.error("Failed to update complaint", err);
      alert("Failed to update complaint: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const taskColumns = [
    { 
      header: 'ID', 
      accessorKey: 'id', 
      cell: (row) => <span className="font-mono text-[10px] text-muted-foreground">{row.id}</span> 
    },
    { 
      header: 'Location', 
      accessorKey: 'room', 
      cell: (row) => <span className="font-semibold text-sm">Room {row.room}</span> 
    },
    { 
      header: 'Issue', 
      accessorKey: 'title' 
    },
    { 
      header: 'Priority', 
      accessorKey: 'priority', 
      cell: (row) => <StatusBadge status={row.priority} /> 
    },
    { 
      header: 'Status', 
      accessorKey: 'status', 
      cell: (row) => <StatusBadge status={row.status} /> 
    },
    { 
      header: 'Action', 
      accessorKey: 'id', 
      cell: (row) => (
        <button 
          onClick={() => openManage(row)}
          className="text-[10px] px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-bold transition-all flex items-center gap-1.5"
        >
          <Eye size={12} /> Manage
        </button>
      )
    }
  ];

  const getAttachmentUrl = (url) => {
    if (!url) return "#";
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${backendUrl}${url}`;
  };

  return (

    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Staff Portal</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage assignments and view notices for {staffName}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Total Assigned" value={assignedComplaints.length} icon={Wrench} />
        <DashboardCard 
          title="Pending / In Progress" 
          value={assignedComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length} 
          icon={Clock} 
          className="border-amber-200 dark:border-amber-900/50" 
        />
        <DashboardCard 
          title="Completed" 
          value={assignedComplaints.filter(c => c.status === 'Resolved').length} 
          icon={CheckCircle} 
          className="border-emerald-200 dark:border-emerald-900/50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Current Assignments</h2>
          </div>
          <DataTable columns={taskColumns} data={assignedComplaints} />
          {isLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}
          {!isLoading && assignedComplaints.length === 0 && (
             <div className="glass-card py-16 text-center flex flex-col items-center gap-3">
                <CheckCircle size={32} className="text-emerald-500 opacity-20" />
                <p className="text-sm text-muted-foreground italic">No complaints currently assigned to you.</p>
             </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Notice Board</h2>
            <BellRing size={18} className="text-primary animate-pulse" />
          </div>
          
          <div className="glass-card divide-y divide-border/50 max-h-[600px] overflow-y-auto">
            {isNoticesLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : notices.length > 0 ? (
              notices.map((notice) => (
                <div key={notice._id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-primary leading-tight">{notice.title}</h3>
                    <span className="text-[10px] text-muted-foreground">{new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-foreground/80 line-clamp-3 mb-3 leading-relaxed">
                    {notice.content}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-border/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                        By {notice.author?.name || "Admin"}
                      </span>
                    </div>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-tighter",
                      notice.priority === 'High' || notice.priority === 'Critical' ? "bg-destructive/10 text-destructive border border-destructive/20" :
                      notice.priority === 'Medium' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                      "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    )}>
                      {notice.priority}
                    </span>
                  </div>
                  {notice.attachment && (
                    <a
                      href={getAttachmentUrl(notice.attachment.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] text-primary hover:underline mt-2 pt-1 border-t border-border/10 group/att"
                    >
                      <FileText size={10} className="shrink-0" />
                      <span className="truncate flex-1 font-medium">{notice.attachment.name}</span>
                      <Download size={10} className="shrink-0 opacity-60 group-hover/att:opacity-100" />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="p-16 text-center flex flex-col items-center gap-3">
                <Megaphone size={32} className="text-muted-foreground opacity-20" />
                <p className="text-xs text-muted-foreground italic">No notices for staff.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {viewingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                <Wrench className="text-primary" size={20} />
                Manage Task: {viewingComplaint.id}
              </h2>
              <button onClick={() => setViewingComplaint(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-xl">
                <div><span className="text-muted-foreground block text-xs font-bold uppercase tracking-widest mb-1">Location</span> <strong>Room {viewingComplaint.room}</strong></div>
                <div><span className="text-muted-foreground block text-xs font-bold uppercase tracking-widest mb-1">Priority</span> <strong>{viewingComplaint.priority}</strong></div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold mb-1">{viewingComplaint.title}</h4>
                <p className="text-sm text-muted-foreground bg-muted/10 p-4 rounded-xl italic leading-relaxed">
                  "{viewingComplaint.description}"
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Update Status</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    value={editFields.status}
                    onChange={(e) => setEditFields({...editFields, status: e.target.value})}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Process Update / Remarks</label>
                  <textarea 
                    className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                    value={editFields.remarks}
                    onChange={(e) => setEditFields({...editFields, remarks: e.target.value})}
                    placeholder="Enter update (e.g. Parts fixed, issue resolved...)"
                  />
                  <p className="text-[10px] text-muted-foreground ml-1">Student will see these remarks on their dashboard.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setViewingComplaint(null)}
                  className="flex-1 py-3 border border-border font-bold rounded-xl hover:bg-muted transition-all text-sm shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

