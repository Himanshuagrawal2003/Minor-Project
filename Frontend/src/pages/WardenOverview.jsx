import React, { useState } from 'react';
import { Users, Building2, Activity, MessageSquare, AlertTriangle, Search, TrendingUp, CheckCircle, ShieldAlert } from 'lucide-react';
import { getUsers } from '../services/userStore';
import { cn } from '../lib/utils';

export function WardenOverview() {
  const users = getUsers();
  const wardens = users.warden || [];
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWardens = wardens.filter(w => 
    w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.userID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.extra?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Deterministic mock data generator based on Warden ID for UI preview purposes
  const getMockStats = (wardenId) => {
    const seed = wardenId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      activeComplaints: (seed % 8) + 1,
      resolvedComplaints: (seed % 40) + 20,
      activeEmergencies: seed % 3 === 0 ? 1 : 0,
      studentSatisfaction: 85 + (seed % 15),
      pendingLeaves: (seed % 5),
    };
  };

  return (
    <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-3">
            <ShieldAlert className="text-primary" /> Warden Performance Overview
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Monitor key metrics and block assignments for all Hostel Wardens.</p>
        </div>
      </div>

      {/* Stats Summary overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="glass-card p-5 border-l-4 border-l-primary flex items-center justify-between">
            <div>
               <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Total Wardens</p>
               <p className="text-2xl font-black text-foreground">{wardens.length}</p>
            </div>
            <Users className="text-primary/20" size={32} />
         </div>
         <div className="glass-card p-5 border-l-4 border-l-emerald-500 flex items-center justify-between">
            <div>
               <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Avg Satisfaction</p>
               <p className="text-2xl font-black text-foreground">92%</p>
            </div>
            <TrendingUp className="text-emerald-500/20" size={32} />
         </div>
         <div className="glass-card p-5 border-l-4 border-l-amber-500 flex items-center justify-between">
            <div>
               <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Total Pending Actions</p>
               <p className="text-2xl font-black text-foreground">
                 {wardens.reduce((acc, w) => acc + getMockStats(w.userID).activeComplaints + getMockStats(w.userID).pendingLeaves, 0)}
               </p>
            </div>
            <Activity className="text-amber-500/20" size={32} />
         </div>
         <div className="glass-card p-5 border-l-4 border-l-destructive flex items-center justify-between">
            <div>
               <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Block Emergencies</p>
               <p className="text-2xl font-black text-foreground">
                 {wardens.reduce((acc, w) => acc + getMockStats(w.userID).activeEmergencies, 0)}
               </p>
            </div>
            <AlertTriangle className="text-destructive/20" size={32} />
         </div>
      </div>

      {/* Search */}
      <div className="relative">
         <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
         <input
           type="text"
           placeholder="Search Wardens by name, ID, or assigned block..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full pl-12 pr-4 py-3.5 text-sm font-medium rounded-2xl border border-border/50 bg-muted/20 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
         />
      </div>

      {/* Grid of Wardens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredWardens.length > 0 ? (
            filteredWardens.map(warden => {
               const stats = getMockStats(warden.userID);
               
               return (
                  <div key={warden._id} className="glass-card p-0 overflow-hidden border border-border/50 group hover:shadow-xl transition-all duration-300">
                     <div className="p-6 bg-gradient-to-br from-muted/50 to-transparent border-b border-border/50">
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-inner">
                              {warden.name.charAt(0)}
                           </div>
                           <span className="px-3 py-1 bg-background border border-border rounded-full text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 shadow-sm">
                              <Building2 size={12} className="text-primary" /> {warden.extra || 'Unassigned Block'}
                           </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground truncate">{warden.name}</h3>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">{warden.userID} • {warden.email}</p>
                     </div>
                     
                     <div className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><MessageSquare size={12} /> Pending Issues</span>
                              <p className="text-xl font-black text-foreground">{stats.activeComplaints}</p>
                           </div>
                           <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><CheckCircle size={12} className="text-emerald-500" /> Resolved</span>
                              <p className="text-xl font-black text-foreground">{stats.resolvedComplaints}</p>
                           </div>
                        </div>
                        
                        <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">Satisfaction</span>
                              <div className="flex items-end gap-1.5">
                                 <p className={cn("text-xl font-black", stats.studentSatisfaction >= 90 ? "text-emerald-500" : "text-amber-500")}>
                                    {stats.studentSatisfaction}%
                                 </p>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                 <AlertTriangle size={12} className="text-destructive" /> Active Alerts
                              </span>
                              <p className="text-xl font-black text-foreground">
                                 {stats.activeEmergencies > 0 ? (
                                    <span className="px-2.5 py-0.5 rounded-lg bg-destructive/10 text-destructive text-sm animate-pulse inline-block">
                                       {stats.activeEmergencies} Active
                                    </span>
                                 ) : (
                                    <span className="text-emerald-500 text-sm flex items-center gap-1"><CheckCircle size={14} /> Clear</span>
                                 )}
                              </p>
                           </div>
                        </div>
                        
                        <button className="w-full mt-2 py-3 bg-muted hover:bg-primary hover:text-primary-foreground text-foreground text-sm font-bold rounded-xl transition-all flex justify-center items-center gap-2">
                           View Detailed Report
                        </button>
                     </div>
                  </div>
               );
            })
         ) : (
            <div className="col-span-full p-12 text-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/10">
               <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
               <p className="text-lg font-bold text-foreground">No Wardens Found</p>
               <p className="text-sm text-muted-foreground font-medium mt-1">Try adjusting your search criteria.</p>
            </div>
         )}
      </div>
    </div>
  );
}
