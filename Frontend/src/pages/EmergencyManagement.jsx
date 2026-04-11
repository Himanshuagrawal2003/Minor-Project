import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, Search, Filter, PhoneCall, Check, X, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { cn } from '../lib/utils';

export function EmergencyManagement() {
  const [emergencies, setEmergencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Active');

  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('In Progress');

  const loadEmergencies = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/emergencies');
      setEmergencies(data);
    } catch (err) {
      console.error("Failed to load emergencies", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmergencies();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedEmergency) return;

    try {
      await api.patch(`/emergencies/${selectedEmergency._id}`, { status, remarks });
      loadEmergencies();
      setSelectedEmergency(null);
      setRemarks('');
    } catch {
      alert("Failed to update status");
    }
  };

  const filteredEmergencies = (emergencies || []).filter(em => {
    const studentName = (em.studentId?.name || em.studentName || '').toLowerCase();
    const studentCustomId = (em.studentId?.customId || em.studentId || '').toString().toLowerCase();
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) ||
      studentCustomId.includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'All' || em.type === filterType;
    const matchesStatus =
      filterStatus === 'All' ? true :
        filterStatus === 'Active' ? (em.status !== 'Resolved' && em.status !== 'False Alarm') :
          em.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-6 w-full pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Emergency Center
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and respond to student emergencies in real-time.</p>
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
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-40 h-[42px] px-3 rounded-xl border border-border bg-background outline-none text-sm font-bold text-destructive"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="False Alarm">False Alarm</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center">
            <Loader2 size={48} className="animate-spin text-primary" />
          </div>
        ) : filteredEmergencies.length > 0 ? (
          filteredEmergencies.map(em => {
            const isActive = em.status !== 'Resolved' && em.status !== 'False Alarm';

            return (
              <div key={em._id} className={cn(
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
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-semibold">
                      <Clock size={12} /> {new Date(em.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={em.status} />
                </div>

                <div className="bg-background/80 p-4 rounded-xl border border-border/50 mb-4 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-border/30">
                    <div>
                      <p className="font-bold text-sm text-foreground">{em.studentId?.name || em.studentName || 'Unknown Student'}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">{em.studentId?.customId || 'N/A'} • Room {em.room}</p>
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
                <AlertTriangle size={18} /> Update Emergency #{selectedEmergency._id.substring(selectedEmergency._id.length - 6)}
              </h3>
              <button onClick={() => setSelectedEmergency(null)} className="p-1 hover:bg-muted rounded-lg transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-background font-bold outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="False Alarm">False Alarm</option>
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


