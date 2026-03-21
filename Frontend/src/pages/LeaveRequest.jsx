import React, { useState } from 'react';
import { CalendarDays, FileCheck, CheckCircle, Clock, AlertCircle, Plus, Info } from 'lucide-react';
import { getLeaveRequests, submitLeaveRequest, LEAVE_TYPES } from '../services/leaveStore';
import { StatusBadge } from '../components/StatusBadge';
import { cn } from '../lib/utils';

export function LeaveRequest() {
  const studentId = localStorage.getItem('userID') || 'S101';
  
  const [leaves, setLeaves] = useState(
    getLeaveRequests().filter(l => l.studentId === studentId)
  );
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [type, setType] = useState('Weekend Pass');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // No Dues Checklist
  const [duesChecklist, setDuesChecklist] = useState({
    roomOwed: false,
    messOwed: false,
    libraryOwed: false
  });

  const isCheckout = type === 'Semester Leave' || type === 'Permanent Checkout';
  const allDuesCleared = isCheckout ? (duesChecklist.roomOwed && duesChecklist.messOwed && duesChecklist.libraryOwed) : true;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCheckout && !allDuesCleared) return;
    if (!startDate || !endDate || !reason) return;

    const data = {
      type,
      startDate,
      endDate,
      reason,
      noDuesCleared: isCheckout ? true : false,
    };

    const updatedList = submitLeaveRequest(studentId, data);
    setLeaves(updatedList.filter(l => l.studentId === studentId));
    
    // Reset Form
    setType('Weekend Pass');
    setStartDate('');
    setEndDate('');
    setReason('');
    setDuesChecklist({ roomOwed: false, messOwed: false, libraryOwed: false });
    setIsFormOpen(false);
  };

  return (
    <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-6 mx-auto max-w-7xl w-full relative min-h-[calc(100vh-4rem)] space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave & No Due</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Apply for temporary leaves or permanent checkouts.</p>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 duration-200"
        >
          <FileCheck size={18} /> New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Instructions Card */}
         <div className="glass-card p-6 border-l-4 border-l-primary/50 space-y-4 md:col-span-1 border-y-0 border-r-0 rounded-l-none">
            <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground flex items-center gap-2">
               <Info size={14} className="text-primary" /> Important Guidelines
            </h3>
            <div className="space-y-3 text-sm font-medium text-foreground/80 leading-relaxed">
               <p>• <strong>Short Leaves:</strong> For weekend passes, simply provide dates and a reason.</p>
               <p>• <strong>Long Leaves & Checkouts:</strong> For Semester Leave or Permanent Checkout, you MUST complete the "No Dues" declaration.</p>
               <p>• Requests are reviewed daily by Wardens. Ensure accuracy to avoid rejection.</p>
            </div>
         </div>

         {/* Form Overlay */}
         {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto pt-24 pb-12">
              <div className="glass-card w-full max-w-lg overflow-hidden border border-border/50 shadow-2xl relative">
                <div className="p-6 bg-muted/30 border-b border-border/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                     <FileCheck size={20} className="text-primary" /> Application Form
                  </h2>
                  <button onClick={() => setIsFormOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50">
                    <Plus className="rotate-45" size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Type of Request</label>
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium cursor-pointer"
                    >
                      {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Start Date</label>
                        <input 
                           type="date" 
                           required 
                           value={startDate} 
                           onChange={(e) => setStartDate(e.target.value)} 
                           className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">End Date</label>
                        <input 
                           type="date" 
                           required 
                           value={endDate} 
                           onChange={(e) => setEndDate(e.target.value)} 
                           className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium"
                        />
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Reason for Leave</label>
                    <textarea 
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Why do you need to leave?"
                      className="w-full h-24 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm resize-none"
                    />
                  </div>

                  {isCheckout && (
                     <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                           <AlertCircle size={14} /> Mandatory No Dues Declaration
                        </h4>
                        <div className="space-y-3">
                           <label className="flex items-center gap-3 cursor-pointer group">
                              <input type="checkbox" checked={duesChecklist.roomOwed} onChange={(e) => setDuesChecklist({...duesChecklist, roomOwed: e.target.checked})} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">I confirm room keys will be handed over.</span>
                           </label>
                           <label className="flex items-center gap-3 cursor-pointer group">
                              <input type="checkbox" checked={duesChecklist.messOwed} onChange={(e) => setDuesChecklist({...duesChecklist, messOwed: e.target.checked})} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">I have cleared all pending Mess Dues.</span>
                           </label>
                           <label className="flex items-center gap-3 cursor-pointer group">
                              <input type="checkbox" checked={duesChecklist.libraryOwed} onChange={(e) => setDuesChecklist({...duesChecklist, libraryOwed: e.target.checked})} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer" />
                              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">No pending library books/fines.</span>
                           </label>
                        </div>
                     </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isCheckout && !allDuesCleared}
                    className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={18} /> Submit Application
                  </button>
                </form>
              </div>
            </div>
         )}

         {/* History */}
         <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground flex items-center gap-2">
               <Clock size={14} /> My Applications History
            </h3>
            
            <div className="space-y-4">
               {leaves.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center gap-3">
                     <FileCheck size={32} className="text-muted-foreground/30" />
                     <p className="text-sm font-medium text-muted-foreground">No leave applications submitted yet.</p>
                  </div>
               ) : (
                  leaves.map((l) => (
                     <div key={l.id} className="p-5 rounded-2xl border border-border/50 bg-card hover:shadow-md transition-all relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-3">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider",
                                    l.type.includes('Checkout') || l.type.includes('Semester') ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
                                 )}>
                                    {l.type}
                                 </span>
                                 <span className="text-[10px] text-muted-foreground font-medium">#{l.id}</span>
                                 {l.noDuesCleared && <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold ml-1">No Dues ✅</span>}
                              </div>
                              <span className="text-xs font-semibold text-foreground/80 mt-1 block">
                                 {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                              </span>
                           </div>
                           <StatusBadge status={l.status} />
                        </div>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed mt-2 border-l-2 border-border/50 pl-3">
                           {l.reason}
                        </p>

                        {l.remarks && (
                           <div className="mt-4 pt-3 border-t border-border/50">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Response from Warden</p>
                              <p className={cn(
                                 "text-xs p-3 rounded-lg font-medium",
                                 l.status === 'Approved' ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
                                 l.status === 'Rejected' ? "bg-destructive/10 text-destructive" :
                                 "bg-muted text-muted-foreground"
                              )}>
                                 {l.remarks}
                              </p>
                           </div>
                        )}
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
