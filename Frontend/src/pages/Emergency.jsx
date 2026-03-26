import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Activity, CheckCircle, Plus, Info, PhoneCall, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { cn } from '../lib/utils';

export function Emergency() {
  const EMERGENCY_TYPES = ['Medical', 'Security', 'Fire', 'Emergency Maintenance', 'Other'];
  const [emergencies, setEmergencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const loadEmergencies = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/emergencies');
      setEmergencies(data);
      
      const dash = await api.get('/dashboard');
      setDashboardData(dash);
    } catch (err) {
      console.error("Failed to load emergencies", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmergencies();
  }, []);

  const myRoom = dashboardData?.studentStats?.room || 'Not Allotted';
  const myBlock = dashboardData?.studentStats?.block || 'N/A';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [type, setType] = useState('Medical');
  const [description, setDescription] = useState('');

  const activeEmergencies = emergencies.filter(e => e.status !== 'Resolved' && e.status !== 'False Alarm');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      await api.post('/emergencies', { type, description });
      loadEmergencies();
      setType('Medical');
      setDescription('');
      setIsFormOpen(false);
    } catch (err) {
      alert("Failed to send alert");
    }
  };

  return (
    <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-6 mx-auto max-w-7xl w-full relative min-h-[calc(100vh-4rem)] space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
            <AlertTriangle className="animate-pulse" /> Emergency Assistance
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Request immediate support for critical situations.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
          {activeEmergencies.length > 0 && (
            <div className="px-5 py-3 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold rounded-xl animate-in fade-in flex items-center gap-2 border border-red-200 dark:border-red-500/30 text-sm w-full sm:w-auto justify-center">
              <Activity className="animate-spin-slow" size={18} /> Help is on the way!
            </div>
          )}
          <button 
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-destructive text-destructive-foreground font-bold rounded-xl hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20 flex items-center justify-center gap-2 active:scale-95 duration-200"
          >
            <PhoneCall size={18} className="animate-bounce" /> Report Emergency
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Identity Card */}
         <div className="glass-card p-6 border-l-4 border-l-destructive/50 space-y-4 md:col-span-1">
            <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Your Location Info</h3>
            <div className="space-y-2">
               <p className="text-sm font-medium">Room: <span className="text-lg font-black text-foreground ml-2">{myRoom}</span></p>
               <p className="text-sm font-medium">Block: <span className="text-lg font-black text-foreground ml-2">{myBlock}</span></p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-[10px] text-muted-foreground font-medium uppercase leading-relaxed flex items-start gap-2">
               <Info size={14} className="shrink-0 mt-0.5 text-primary" />
               This information is automatically sent to the wardens when you trigger an emergency alert.
            </div>
         </div>

         {/* Emergency Form Overlay */}
         {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="glass-card w-full max-w-lg overflow-hidden border border-destructive/30 shadow-2xl">
                <div className="p-6 bg-destructive/10 border-b border-destructive/20 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-destructive flex items-center gap-2">
                     <AlertTriangle size={20} /> Request Support
                  </h2>
                  <button onClick={() => setIsFormOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50">
                    <Plus className="rotate-45" size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Emergency Type</label>
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-destructive/40 outline-none transition-all text-sm font-medium"
                    >
                      {EMERGENCY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Description (Optional but helpful)</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="E.g., Severe stomach ache, bleeding, fire in room..."
                      className="w-full h-24 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-destructive/40 outline-none transition-all text-sm resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-4 bg-destructive text-destructive-foreground font-bold rounded-xl hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20 flex items-center justify-center gap-3 active:scale-95 duration-200"
                  >
                    <PhoneCall size={18} /> Send Alert to Wardens
                  </button>
                </form>
              </div>
            </div>
         )}

         {/* History */}
         <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground flex items-center gap-2">
               <Clock size={14} /> My Emergency History
            </h3>
            
            <div className="space-y-4">
               {isLoading ? (
                  <div className="p-12 flex justify-center">
                     <Loader2 size={32} className="animate-spin text-primary" />
                  </div>
               ) : emergencies.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center gap-3">
                     <CheckCircle size={32} className="text-emerald-500/50" />
                     <p className="text-sm font-medium text-muted-foreground">You have no reported emergencies. Stay safe!</p>
                  </div>
               ) : (
                  emergencies.map((em) => (
                     <div key={em._id} className={cn(
                        "p-5 rounded-2xl border transition-all relative overflow-hidden",
                        em.status === 'Resolved' || em.status === 'False Alarm' ? "bg-muted/10 border-border/50" : "bg-destructive/5 border-destructive/30 shadow-sm"
                     )}>
                        {em.status !== 'Resolved' && em.status !== 'False Alarm' && (
                           <div className="absolute top-0 left-0 h-full bg-destructive animate-pulse" />
                        )}
                        
                        <div className="flex justify-between items-start mb-3">
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wider",
                                    em.type === 'Medical' ? "bg-red-500/10 text-red-600" :
                                    em.type === 'Security' ? "bg-blue-500/10 text-blue-600" :
                                    "bg-amber-500/10 text-amber-600"
                                 )}>
                                    {em.type}
                                 </span>
                                 <span className="text-[10px] text-muted-foreground font-medium">#{em._id.substring(em._id.length - 6)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                 <Clock size={10} /> Reported {new Date(em.createdAt).toLocaleString()}
                              </span>
                           </div>
                           <StatusBadge status={em.status} />
                        </div>
                        
                        <p className="text-sm font-medium text-foreground/80 bg-background/50 p-3 rounded-lg border border-border/50">
                           {em.description || <span className="italic text-muted-foreground text-xs">No description provided.</span>}
                        </p>

                        {em.remarks && (
                           <div className="mt-4 pt-3 border-t border-border/50">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Warden Remarks</p>
                              <p className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg font-medium">
                                 {em.remarks}
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
