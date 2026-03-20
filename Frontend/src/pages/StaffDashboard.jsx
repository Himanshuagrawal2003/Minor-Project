import React, { useState } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Wrench, CheckCircle, Clock, BellRing, Megaphone, Calendar, User, Eye, X, Save, Loader2 } from 'lucide-react';
import { getNotices } from '../services/noticeStore';
import { getComplaints, updateComplaint, STATUSES } from '../services/complaintStore';
import { cn } from '../lib/utils';

/**
 * StaffDashboard Component
 * Provides a portal for staff members to manage their assigned complaints and view notices.
 */
export function StaffDashboard() {
  const staffID = localStorage.getItem('userID') || 'STF001';
  const staffName = localStorage.getItem('name') || 'Staff Member';
  
  const [notices] = useState(() => 
    getNotices().filter(n => n.targetRoles.includes('all') || n.targetRoles.includes('staff'))
  );
  
  const [assignedComplaints, setAssignedComplaints] = useState(() => 
    getComplaints().filter(c => c.assignedStaffId === staffID)
  );

  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editFields, setEditFields] = useState({ status: '', remarks: '' });

  const loadComplaints = () => {
    setAssignedComplaints(getComplaints().filter(c => c.assignedStaffId === staffID));
  };

  const openManage = (complaint) => {
    setViewingComplaint(complaint);
    setEditFields({ 
      status: complaint.status, 
      remarks: complaint.remarks || '' 
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateComplaint(viewingComplaint.id, editFields);
      loadComplaints();
      setViewingComplaint(null);
      setIsSaving(false);
    }, 600);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Portal</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage assignments and view notices for {staffName}.</p>
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
            <h2 className="text-lg font-semibold tracking-tight">Current Assignments</h2>
          </div>
          <DataTable columns={taskColumns} data={assignedComplaints} />
          {assignedComplaints.length === 0 && (
             <div className="glass-card py-16 text-center flex flex-col items-center gap-3">
                <CheckCircle size={32} className="text-emerald-500 opacity-20" />
                <p className="text-sm text-muted-foreground italic">No complaints currently assigned to you.</p>
             </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Notice Board</h2>
            <BellRing size={18} className="text-primary animate-pulse" />
          </div>
          
          <div className="glass-card divide-y divide-border/50 max-h-[600px] overflow-y-auto">
            {notices.length > 0 ? (
              notices.map((notice) => (
                <div key={notice._id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-tighter",
                      notice.priority === 'high' ? "bg-destructive/10 text-destructive border border-destructive/20" :
                      notice.priority === 'medium' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                      "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    )}>
                      {notice.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mb-1 leading-tight">{notice.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
                    {notice.content}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground/50 pt-2 border-t border-border/20">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={10} />
                      <span>{notice.author?.name || "Admin"}</span>
                    </div>
                  </div>
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
              <h2 className="text-xl font-bold flex items-center gap-2">
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
