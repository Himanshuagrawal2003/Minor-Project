import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Activity, MessageSquare, AlertTriangle, Search, TrendingUp, CheckCircle, ShieldAlert, Loader2, X, Mail, Phone, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';

export function WardenOverview() {
   const navigate = useNavigate();
   const [wardens, setWardens] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedWarden, setSelectedWarden] = useState(null);
   const [isActionLoading, setIsActionLoading] = useState(false);
   const [actionSuccess, setActionSuccess] = useState(false);

   const fetchWardens = async () => {
      try {
         setIsLoading(true);
         const res = await api.get('/users/warden-performance');
         setWardens(res.users || []);
      } catch (err) {
         console.error("Failed to fetch warden performance", err);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchWardens();
   }, []);

   const filteredWardens = wardens.filter(w =>
      (w.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.customId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.block || '').toLowerCase().includes(searchTerm.toLowerCase())
   );

   const handleExecutiveAction = async (warden) => {
      try {
         setIsActionLoading(true);
         // Instant redirect to Complaint Management
         navigate('/chief-warden/complaints');
         setSelectedWarden(null);
      } catch (err) {
         console.error("Action failed", err);
      } finally {
         setIsActionLoading(false);
      }
   };

   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={32} />
         </div>
      );
   }

   return (
      <div className="space-y-4 sm:space-y-6 w-full pb-8">
         {/* Header */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Warden Performance Overview
               </h1>
               <p className="text-muted-foreground mt-1">Monitor key metrics and block assignments for all Hostel Wardens.</p>
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
                     {wardens.reduce((acc, w) => acc + (w.stats?.activeComplaints || 0) + (w.stats?.pendingLeaves || 0), 0)}
                  </p>
               </div>
               <Activity className="text-amber-500/20" size={32} />
            </div>
            <div className="glass-card p-5 border-l-4 border-l-destructive flex items-center justify-between">
               <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Block Emergencies</p>
                  <p className="text-2xl font-black text-foreground">
                     {wardens.reduce((acc, w) => acc + (w.stats?.activeEmergencies || 0), 0)}
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
                  const stats = warden.stats || { activeComplaints: 0, resolvedComplaints: 0, activeEmergencies: 0, studentSatisfaction: 100, pendingLeaves: 0 };

                  return (
                     <div key={warden._id} className="glass-card p-0 overflow-hidden border border-border/50 group hover:shadow-xl transition-all duration-300">
                        <div className="p-6 bg-gradient-to-br from-muted/50 to-transparent border-b border-border/50">
                           <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-inner">
                                 {(warden.name || 'W').charAt(0)}
                              </div>
                              <span className="px-3 py-1 bg-background border border-border rounded-full text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 shadow-sm">
                                 <Building2 size={12} className="text-primary" /> {warden.block || 'Unassigned Block'}
                              </span>
                           </div>
                           <h3 className="text-lg font-bold text-foreground truncate">{warden.name}</h3>
                           <p className="text-xs font-semibold text-muted-foreground mt-0.5">{warden.customId} • {warden.email}</p>
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

                           <button 
                              onClick={() => setSelectedWarden(warden)}
                              className="w-full mt-2 py-3 bg-muted hover:bg-primary hover:text-primary-foreground text-foreground text-sm font-bold rounded-xl transition-all flex justify-center items-center gap-2 group-hover:shadow-lg shadow-primary/5"
                           >
                              View Detailed Report <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
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

         {/* Detailed Report Modal */}
         {selectedWarden && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
               <div 
                  className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
                  onClick={() => setSelectedWarden(null)}
               />
               <div className="relative w-full max-w-4xl bg-background border border-border shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 shadow-primary/10">
                  {/* Modal Header */}
                  <div className="p-6 sm:p-8 border-b border-border/50 flex justify-between items-center bg-muted/30">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-black shadow-lg shadow-primary/20">
                           {(selectedWarden.name || 'W').charAt(0)}
                        </div>
                        <div>
                           <h2 className="text-2xl font-black text-foreground leading-tight">{selectedWarden.name}</h2>
                           <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                 <Building2 size={12} className="text-primary" /> {selectedWarden.block}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{selectedWarden.customId}</span>
                           </div>
                        </div>
                     </div>
                     <button 
                        onClick={() => setSelectedWarden(null)}
                        className="p-3 hover:bg-muted rounded-2xl transition-colors text-muted-foreground hover:text-foreground"
                     >
                        <X size={24} />
                     </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scrollbar-hide">
                     {/* Contact Info */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 p-4 rounded-3xl bg-muted/20 border border-border/50">
                           <div className="p-3 bg-background rounded-2xl text-primary shadow-sm">
                              <Mail size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</p>
                              <p className="text-sm font-bold text-foreground">{selectedWarden.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-3xl bg-muted/20 border border-border/50">
                           <div className="p-3 bg-background rounded-2xl text-primary shadow-sm">
                              <Phone size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">Contact Number</p>
                              <p className="text-sm font-bold text-foreground">{selectedWarden.contactNo || '+91 9876543210'}</p>
                           </div>
                        </div>
                     </div>

                     {/* Performance Metrics Grid */}
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                           { label: 'Pending Complaints', value: selectedWarden.stats?.activeComplaints, icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                           { label: 'Resolved Today', value: selectedWarden.stats?.resolvedComplaints, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                           { label: 'Leave Requests', value: selectedWarden.stats?.pendingLeaves, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                           { label: 'Active Alerts', value: selectedWarden.stats?.activeEmergencies, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' }
                        ].map((stat, idx) => (
                           <div key={idx} className="p-5 rounded-[2rem] bg-muted/10 border border-border/50 flex flex-col items-center text-center space-y-2">
                              <div className={cn("p-3 rounded-2xl mb-1", stat.bg, stat.color)}>
                                 <stat.icon size={22} />
                              </div>
                              <p className="text-2xl font-black text-foreground">{stat.value}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight">{stat.label}</p>
                           </div>
                        ))}
                     </div>

                     {/* Satisfaction & Insights */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6 rounded-[2.5rem] border-border/50 bg-muted/5">
                           <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
                              <TrendingUp size={18} className="text-emerald-500" /> Student Satisfaction Index
                           </h3>
                           <div className="space-y-6">
                              <div className="flex justify-between items-end">
                                 <div>
                                    <p className="text-4xl font-black text-foreground">{selectedWarden.stats?.studentSatisfaction}%</p>
                                    <p className="text-xs font-bold text-emerald-500 uppercase mt-1 tracking-wider">Higher than average</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-sm font-bold text-muted-foreground">Monthly Target</p>
                                    <p className="text-sm font-black text-foreground">95%</p>
                                 </div>
                              </div>
                              <div className="h-4 bg-muted rounded-full overflow-hidden shadow-inner p-1">
                                 <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full shadow-lg"
                                    style={{ width: `${selectedWarden.stats?.studentSatisfaction}%` }}
                                 />
                              </div>
                              <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest pt-2">
                                 <span>Poor</span>
                                 <span>Average</span>
                                 <span>Excellent</span>
                              </div>
                           </div>
                        </div>

                        <div className="glass-card p-6 rounded-[2.5rem] border-border/50 bg-muted/5">
                           <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
                              <Activity size={18} className="text-primary" /> Performance Insights
                           </h3>
                           <div className="space-y-4">
                              {[
                                 { label: 'Avg. Resolution Time', value: '4.2 Hours', trend: '-12%', positive: true },
                                 { label: 'Student Feedback', value: 'Positive', trend: '+5%', positive: true },
                                 { label: 'Compliance Rate', value: '98.5%', trend: '+0.2%', positive: true }
                              ].map((insight, i) => (
                                 <div key={i} className="flex justify-between items-center p-3 rounded-2xl hover:bg-muted/30 transition-colors">
                                    <span className="text-sm font-bold text-muted-foreground">{insight.label}</span>
                                    <div className="text-right">
                                       <p className="text-sm font-black text-foreground">{insight.value}</p>
                                       <p className={cn("text-[10px] font-bold uppercase", insight.positive ? "text-emerald-500" : "text-destructive")}>
                                          {insight.trend} this week
                                       </p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 sm:p-8 border-t border-border/50 bg-muted/30">
                     <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                           onClick={() => setSelectedWarden(null)}
                           disabled={isActionLoading}
                           className="flex-1 py-4 bg-background border border-border text-foreground text-sm font-bold rounded-2xl hover:bg-muted transition-all disabled:opacity-50"
                        >
                           Dismiss Report
                        </button>
                        <button 
                           onClick={() => handleExecutiveAction(selectedWarden)}
                           disabled={isActionLoading}
                           className="flex-[2] py-4 bg-primary text-primary-foreground text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                        >
                           {isActionLoading ? (
                              <Loader2 className="animate-spin" size={18} />
                           ) : (
                              <><ShieldAlert size={18} /> Take Executive Action</>
                           )}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
