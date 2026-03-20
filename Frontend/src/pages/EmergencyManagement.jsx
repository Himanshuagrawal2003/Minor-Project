import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, Search, Filter, PhoneCall, Check, MessageSquare } from 'lucide-react';
import { getEmergencies, updateEmergencyStatus, EMERGENCY_STATUSES } from '../services/emergencyStore';
import { getStudentAllotment } from '../services/roomStore';
import { StatusBadge } from '../components/StatusBadge';
import { cn } from '../lib/utils';

export function EmergencyManagement() {
  const [emergencies, setEmergencies] = useState(getEmergencies());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Active');

  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('In Progress');

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!selectedEmergency) return;

    const updated = updateEmergencyStatus(selectedEmergency.id, status, remarks);
    setEmergencies(updated);
    setSelectedEmergency(null);
    setRemarks('');
  };

  const getRoomInfo = (studentId) => {
    const allotment = getStudentAllotment(studentId);
    if (!allotment) return { room: 'N/A', block: 'N/A' };
    return {
      room: allotment.room?.number || 'N/A',
      block: allotment.room?.number?.charAt(0) || 'N/A'
    };
  };

  const filteredEmergencies = emergencies.filter(em => {
    const matchesSearch = 
      em.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      em.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || em.type === filterType;
    const matchesStatus = 
      filterStatus === 'All' ? true : 
      filterStatus === 'Active' ? (em.status !== 'Resolved' && em.status !== 'False Alarm') :
      em.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-6 mx-auto max-w-7xl w-full relative min-h-[calc(100vh-4rem)] space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
            <AlertTriangle className="animate-pulse" /> Emergency Command Center
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Monitor and respond to student emergencies in real-time.</p>
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
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-destructive/20 outline-none transition-all"
            />
         </div>
         <div className="flex gap-4 w-full md:w-auto">
           <select 
             value={filterType} 
             onChange={(e) => setFilterType(e.target.value)}
             className="w-full md:w-36 h-[42px] px-3 rounded-xl border border-border bg-background outline-none text-sm font-medium"
           >
             <option value="All">All Types</option>
             <option value="Medical">Medical</option>
             <option value="Security">Security</option>
             <option value="Fire">Fire</option>
           </select>
           <select 
             value={filterStatus} 
             onChange={(e) => setFilterStatus(e.target.value)}
             className="w-full md:w-40 h-[42px] px-3 rounded-xl border border-border bg-background outline-none text-sm font-bold text-destructive"
           >
             <option value="All">All Statuses</option>
             <option value="Active">Active Only</option>
             <option value="Pending">Pending</option>
             <option value="Resolved">Resolved</option>
           </select>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {filteredEmergencies.length > 0 ? (
           filteredEmergencies.map(em => {
             const roomData = getRoomInfo(em.studentId);
             const isActive = em.status !== 'Resolved' && em.status !== 'False Alarm';

             return (
               <div key={em.id} className={cn(
                 "glass-card p-6 border relative transition-all group hover:shadow-lg",
                 isActive ? "border-destructive/40 bg-destructive/5 shadow-destructive/10" : "border-border/50 bg-muted/10 opacity-70"
               )}>
                 {isActive && <div className="absolute top-0 left-0  h-full bg-destructive animate-pulse" />}
                 
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <span className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider",
                        em.type === 'Medical' ? "bg-red-500/10 text-red-600" :
                        em.type === 'Security' ? "bg-blue-500/10 text-blue-600" :
                        "bg-amber-500/10 text-amber-600"
                     )}>
                        {em.type} Emergency
                     </span>
                     <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                       <Clock size={10} /> {new Date(em.createdAt).toLocaleString()}
                     </p>
                   </div>
                   <StatusBadge status={em.status} />
                 </div>

                 <div className="bg-background/80 p-4 rounded-xl border border-border/50 mb-4 space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-border/30">
                       <div>
                          <p className="font-bold text-sm text-foreground">{em.student?.name || em.studentId}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">{em.studentId} • {em.student?.course || 'Student'}</p>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-lg text-primary">{roomData.room}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Block {roomData.block}</p>
                       </div>
                    </div>
                    <p className="text-sm text-foreground/80 font-medium">
                       {em.description || <span className="italic text-muted-foreground/50">No detailed description.</span>}
                    </p>
                 </div>

                 {em.remarks && (
                    <div className="mb-4">
                       <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Last Warden Remarks</p>
                       <p className="text-xs text-foreground/70 bg-muted p-2 rounded-lg italic">{em.remarks}</p>
                    </div>
                 )}

                 {isActive && (
                    <button 
                      onClick={() => { setSelectedEmergency(em); setStatus(em.status === 'Pending' ? 'In Progress' : 'Resolved'); }}
                      className="w-full py-2.5 bg-destructive text-destructive-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-destructive/90 transition-all shadow-sm"
                    >
                       <PhoneCall size={16} /> Manage Response
                    </button>
                 )}
               </div>
             )
           })
        ) : (
          <div className="col-span-1 lg:col-span-2 xl:col-span-3 p-12 text-center rounded-2xl border-2 border-dashed border-border/40">
            <CheckCircle size={48} className="mx-auto text-emerald-500/50 mb-4" />
            <p className="text-lg font-bold text-foreground">All Clear</p>
            <p className="text-sm text-muted-foreground font-medium mt-1">No outstanding emergency requests found matching your filters.</p>
          </div>
        )}
      </div>

      {selectedEmergency && (
         <div className="fixed inset-0 z-50 flex justify-center items-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-md overflow-hidden border border-border shadow-2xl">
               <div className="p-5 border-b border-border bg-destructive/10 text-destructive flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2">
                     <AlertTriangle size={18} /> Update Emergency #{selectedEmergency.id}
                  </h3>
               </div>
               
               <form onSubmit={handleUpdate} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase text-muted-foreground">Update Status</label>
                     <select 
                       value={status} 
                       onChange={(e) => setStatus(e.target.value)}
                       className="w-full h-11 px-3 rounded-xl border border-border bg-background font-bold outline-none"
                     >
                        {EMERGENCY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold uppercase text-muted-foreground">Action Taken / Remarks</label>
                     <textarea 
                       value={remarks}
                       onChange={(e) => setRemarks(e.target.value)}
                       placeholder="E.g., Ambulance dispatched, first aid provided..."
                       className="w-full h-24 p-3 rounded-xl border border-border bg-background text-sm outline-none resize-none"
                       required
                     />
                  </div>

                  <div className="flex gap-3 pt-4">
                     <button type="button" onClick={() => setSelectedEmergency(null)} className="flex-1 py-3 text-sm font-bold border border-border rounded-xl hover:bg-muted transition-all">Cancel</button>
                     <button type="submit" className="flex-1 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all flex justify-center items-center gap-2">
                        <Check size={16} /> Update Status
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
