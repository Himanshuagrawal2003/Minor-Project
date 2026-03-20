import React, { useState } from 'react';
import { CalendarDays, Search, Filter, CheckCircle, XCircle, FileCheck, Check, X } from 'lucide-react';
import { getLeaveRequests, updateLeaveStatus, LEAVE_STATUSES } from '../services/leaveStore';
import { StatusBadge } from '../components/StatusBadge';
import { cn } from '../lib/utils';

export function LeaveManagement() {
  const [leaves, setLeaves] = useState(getLeaveRequests());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Pending');

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remarks, setRemarks] = useState('');

  const handleUpdate = (e, status) => {
    e.preventDefault();
    if (!selectedLeave) return;

    const updated = updateLeaveStatus(selectedLeave.id, status, remarks);
    setLeaves(updated);
    setSelectedLeave(null);
    setRemarks('');
  };

  const filteredLeaves = leaves.filter(l => {
    const matchesSearch = 
      l.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || l.type === filterType;
    const matchesStatus = filterStatus === 'All' ? true : l.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <FileCheck /> Leave & No Dues Approvals
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Review and process student leave applications and checkout clearances.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
         <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
         </div>
         <div className="flex gap-4 w-full md:w-auto">
           <select 
             value={filterType} 
             onChange={(e) => setFilterType(e.target.value)}
             className="w-full md:w-44 h-[42px] px-3 rounded-xl border border-border bg-background outline-none text-sm font-medium cursor-pointer"
           >
             <option value="All">All Request Types</option>
             <option value="Weekend Pass">Weekend Pass</option>
             <option value="Medical Leave">Medical Leave</option>
             <option value="Semester Leave">Semester Leave</option>
             <option value="Permanent Checkout">Permanent Checkout</option>
           </select>
           <select 
             value={filterStatus} 
             onChange={(e) => setFilterStatus(e.target.value)}
             className="w-full md:w-40 h-[42px] px-3 rounded-xl border border-border bg-background outline-none text-sm font-medium font-bold text-primary cursor-pointer"
           >
             <option value="All">All Statuses</option>
             <option value="Pending">Pending</option>
             <option value="Approved">Approved</option>
             <option value="Rejected">Rejected</option>
           </select>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {filteredLeaves.length > 0 ? (
           filteredLeaves.map(l => {
             const isPending = l.status === 'Pending';

             return (
               <div key={l.id} className={cn(
                 "glass-card p-6 border relative transition-all group hover:shadow-lg flex flex-col h-full",
                 isPending ? "border-primary/30 bg-primary/5 shadow-primary/5" : "border-border/50 bg-muted/5 opacity-80"
               )}>
                 {isPending && <div className="absolute top-0 left-0  h-full bg-primary" />}
                 
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <span className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider",
                        l.type.includes('Checkout') || l.type.includes('Semester') ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
                     )}>
                        {l.type}
                     </span>
                     <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-semibold">
                       <CalendarDays size={12} /> {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                     </p>
                   </div>
                   <StatusBadge status={l.status} />
                 </div>

                 <div className="bg-background/80 p-4 rounded-xl border border-border/50 mb-4 space-y-3 flex-grow">
                    <div className="flex justify-between items-center pb-3 border-b border-border/30">
                       <div>
                          <p className="font-bold text-sm text-foreground">{l.student?.name || 'Unknown Student'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">{l.studentId} • {l.student?.course || 'Student'}</p>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-lg text-primary">{l.room}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Room</p>
                       </div>
                    </div>
                    
                    <div className="pt-1">
                       <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Reason Submitted</span>
                       <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                          {l.reason || <span className="italic text-muted-foreground/50">No reason provided.</span>}
                       </p>
                    </div>

                    {(l.type.includes('Checkout') || l.type.includes('Semester')) && (
                       <div className="mt-3 p-2 bg-amber-500/10 text-amber-700 dark:text-amber-500 rounded-lg text-xs font-bold border border-amber-500/20 flex items-center gap-2">
                          <CheckCircle size={14} className="text-emerald-500" /> No Dues Declared
                       </div>
                    )}
                 </div>

                 {l.remarks && !isPending && (
                    <div className="mb-4">
                       <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Warden Remarks</p>
                       <p className="text-xs text-foreground/70 bg-muted p-3 rounded-lg font-medium">{l.remarks}</p>
                    </div>
                 )}

                 {isPending && (
                    <button 
                      onClick={() => setSelectedLeave(l)}
                      className="w-full mt-auto py-2.5 bg-primary/10 text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/20 transition-all shadow-sm"
                    >
                       <FileCheck size={16} /> Review Application
                    </button>
                 )}
               </div>
             )
           })
        ) : (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 p-12 text-center rounded-2xl border-2 border-dashed border-border/40">
            <CheckCircle size={48} className="mx-auto text-primary/30 mb-4" />
            <p className="text-lg font-bold text-foreground">Inbox Zero</p>
            <p className="text-sm text-muted-foreground font-medium mt-1">No applications pending for review found.</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedLeave && (
         <div className="fixed inset-0 z-50 flex justify-center items-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-md overflow-hidden border border-border shadow-2xl">
               <div className="p-5 border-b border-border bg-primary/10 text-primary flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2">
                     <FileCheck size={18} /> Review {selectedLeave.type}
                  </h3>
                  <span className="text-xs font-bold uppercase">{selectedLeave.studentId}</span>
               </div>
               
               <form className="p-6 space-y-5">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase text-muted-foreground">Action Remarks (Visible to Student)</label>
                     <textarea 
                       value={remarks}
                       onChange={(e) => setRemarks(e.target.value)}
                       placeholder="E.g., Approved, have a safe journey. Hand over keys to security."
                       className="w-full h-24 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 text-sm outline-none resize-none"
                     />
                  </div>

                  <div className="flex gap-3 pt-2">
                     <button type="button" onClick={() => setSelectedLeave(null)} className="flex-1 py-3 text-sm font-bold border border-border rounded-xl hover:bg-muted transition-all">Cancel</button>
                     <button type="button" onClick={(e) => handleUpdate(e, 'Rejected')} className="flex-1 py-3 bg-destructive/10 text-destructive text-sm font-bold rounded-xl hover:bg-destructive/20 transition-all flex justify-center items-center gap-2">
                        <X size={16} /> Reject
                     </button>
                     <button type="button" onClick={(e) => handleUpdate(e, 'Approved')} className="flex-[1.5] py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex justify-center items-center gap-2">
                        <Check size={16} /> Approve
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
