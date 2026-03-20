import React, { useState } from 'react';
import { AlertTriangle, Search, Filter, MessageSquare, CheckCircle, ShieldAlert, ArrowLeftRight } from 'lucide-react';
import { getComplaints, updateComplaint, STATUSES } from '../services/complaintStore';
import { StatusBadge } from '../components/StatusBadge';
import { cn } from '../lib/utils';

export function Escalations() {
  const [complaints, setComplaints] = useState(getComplaints());
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [newStatus, setNewStatus] = useState('Resolved');

  // Only show escalated complaints or those explicitly searched if they were previously escalated
  // For strictness, let's only strictly show "Escalated" and maybe "Resolved" if they were resolved from here, 
  // but to keep it simple, we'll just show current 'Escalated' complaints.
  const escalatedComplaints = complaints.filter(c => c.status === 'Escalated');

  const filteredComplaints = escalatedComplaints.filter(c => {
    return c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    const updated = updateComplaint(selectedComplaint.id, {
      status: newStatus,
      remarks: remarks || selectedComplaint.remarks
    });
    setComplaints(updated);
    setSelectedComplaint(null);
    setRemarks('');
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
            <ShieldAlert className="animate-pulse" /> Escalated Complaints
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Critical issues that require Chief Warden intervention.</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
         <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search escalations by ID, title, or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-destructive/20 outline-none transition-all"
            />
         </div>
      </div>

      {/* Escalations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {filteredComplaints.length > 0 ? (
           filteredComplaints.map(complaint => (
             <div key={complaint.id} className="glass-card p-6 border border-destructive/30 bg-destructive/5 relative shadow-lg shadow-destructive/5 group flex flex-col h-full hover:border-destructive/60 transition-all">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-destructive animate-pulse" />
               
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider bg-destructive/10 text-destructive">
                      {complaint.category}
                   </span>
                   <p className="text-xs text-muted-foreground mt-1.5 font-semibold">
                      {complaint.id}
                   </p>
                 </div>
                 <StatusBadge status={complaint.status} />
               </div>

               <div className="bg-background/80 p-4 rounded-xl border border-border/50 mb-4 space-y-3 flex-grow">
                  <h3 className="font-bold text-foreground text-sm line-clamp-1">{complaint.title}</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                     {complaint.description}
                  </p>
                  
                  <div className="pt-3 mt-3 border-t border-border/30 flex justify-between items-center">
                     <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Reported By</p>
                        <p className="text-sm font-semibold">{complaint.studentName}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Room</p>
                        <p className="text-sm font-black text-primary">{complaint.room}</p>
                     </div>
                  </div>
               </div>

               {complaint.remarks && (
                  <div className="mb-4">
                     <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Previous Remarks</p>
                     <p className="text-xs text-foreground/70 bg-muted p-3 rounded-lg font-medium italic border-l-2 border-border/50">
                        {complaint.remarks}
                     </p>
                  </div>
               )}

               <button 
                 onClick={() => { setSelectedComplaint(complaint); setNewStatus('Resolved'); }}
                 className="w-full mt-auto py-2.5 bg-destructive text-destructive-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-destructive/90 transition-all shadow-sm"
               >
                  <AlertTriangle size={16} /> Take Executive Action
               </button>
             </div>
           ))
        ) : (
          <div className="col-span-1 lg:col-span-2 xl:col-span-3 p-12 text-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/10">
            <CheckCircle size={48} className="mx-auto text-emerald-500/50 mb-4" />
            <p className="text-lg font-bold text-foreground">Zero Escalations</p>
            <p className="text-sm text-muted-foreground font-medium mt-1">No critical complaints require your intervention right now.</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedComplaint && (
         <div className="fixed inset-0 z-50 flex justify-center items-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-md overflow-hidden border border-destructive/30 shadow-2xl">
               <div className="p-5 border-b border-destructive/30 bg-destructive/10 text-destructive flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2">
                     <ShieldAlert size={18} /> Resolve Escalation
                  </h3>
                  <span className="text-xs font-bold uppercase">{selectedComplaint.id}</span>
               </div>
               
               <form onSubmit={handleUpdate} className="p-6 space-y-5">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase text-muted-foreground">New Status</label>
                     <select 
                       value={newStatus} 
                       onChange={(e) => setNewStatus(e.target.value)}
                       className="w-full h-11 px-3 rounded-xl border border-destructive/20 bg-background font-bold outline-none focus:ring-2 focus:ring-destructive/20"
                     >
                        {STATUSES.filter(s => s !== 'Pending' && s !== 'Escalated').map(s => (
                           <option key={s} value={s}>{s}</option>
                        ))}
                     </select>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase text-muted-foreground">Executive Instructions/Remarks</label>
                     <textarea 
                       value={remarks}
                       onChange={(e) => setRemarks(e.target.value)}
                       placeholder="E.g., Issue resolved personally. Replacing broken furniture immediately."
                       className="w-full h-24 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-destructive/20 text-sm outline-none resize-none"
                     />
                  </div>

                  <div className="flex gap-3 pt-2">
                     <button type="button" onClick={() => setSelectedComplaint(null)} className="flex-1 py-3 text-sm font-bold border border-border rounded-xl hover:bg-muted transition-all">Cancel</button>
                     <button type="submit" className="flex-[2] py-3 bg-destructive text-destructive-foreground text-sm font-bold rounded-xl shadow-lg hover:bg-destructive/90 transition-all flex justify-center items-center gap-2">
                        <CheckCircle size={16} /> Confirm Action
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
