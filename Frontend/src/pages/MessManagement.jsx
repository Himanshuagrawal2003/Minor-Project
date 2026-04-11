import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { FormInput } from '../components/FormInput';
import { Plus, Edit2, Trash2, Building2, Loader2, Save, X, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export function MessManagement() {
  const [messes, setMesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMess, setEditingMess] = useState(null);
  const [formData, setFormData] = useState({
    messId: '',
    name: '',
    description: '',
    location: '',
    capacity: 200
  });

  const fetchMesses = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/mess/list');
      setMesses(data || []);
    } catch (err) {
      console.error("Failed to fetch messes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMesses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMess) {
        await api.patch(`/mess/manage/${editingMess._id}`, formData);
      } else {
        await api.post('/mess/manage', formData);
      }
      setIsModalOpen(false);
      setEditingMess(null);
      setFormData({ messId: '', name: '', description: '', location: '', capacity: 200 });
      fetchMesses();
    } catch (err) {
      console.error("Save mess error:", err);
      alert(err.message || "Failed to save mess");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this mess? This might affect existing menu data.")) return;
    try {
      await api.delete(`/mess/manage/${id}`);
      fetchMesses();
    } catch {
      alert("Failed to delete mess");
    }
  };

  const openEditModal = (mess) => {
    setEditingMess(mess);
    setFormData({
      messId: mess.messId || '',
      name: mess.name,
      description: mess.description || '',
      location: mess.location || '',
      capacity: mess.capacity || 200
    });
    setIsModalOpen(true);
  };

  const columns = [
    { header: 'Mess ID', accessorKey: 'messId', cell: (row) => <span className="font-mono text-xs uppercase">{row.messId}</span> },
    { header: 'Name', accessorKey: 'name', cell: (row) => <span className="font-semibold">{row.name}</span> },
    { header: 'Location', accessorKey: 'location' },
    { header: 'Capacity', accessorKey: 'capacity' },
    { header: 'Status', accessorKey: 'isActive', cell: (row) => (
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
        row.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
      )}>
        {row.isActive ? 'Active' : 'Inactive'}
      </span>
    )},
    { header: 'Actions', accessorKey: '_id', cell: (row) => (
      <div className="flex gap-2">
        <button onClick={() => openEditModal(row)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors">
          <Edit2 size={16} />
        </button>
        <button onClick={() => handleDelete(row._id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    )}
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mess Management</h1>
          <p className="text-muted-foreground text-sm">Register and manage mess facilities across the campus.</p>
        </div>
        <button
          onClick={() => {
            setEditingMess(null);
            setFormData({ name: '', description: '', location: '', capacity: 200 });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={20} />
          Add New Mess
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <DataTable columns={columns} data={messes} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingMess ? 'Edit Mess' : 'Create New Mess'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Mess ID"
                value={formData.messId}
                onChange={(e) => setFormData({ ...formData, messId: e.target.value })}
                placeholder="e.g., M1, MESS-ONE"
                required
              />
              <FormInput
                label="Mess Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., North Mess"
                required
              />
              <FormInput
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Near Block B"
              />
              <FormInput
                label="Capacity"
                type="number"
                value={formData.capacity || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, capacity: isNaN(val) ? 0 : val });
                }}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/70">Description</label>
                <textarea
                  className="w-full min-h-[100px] bg-muted/50 border border-border/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the mess..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 border border-border rounded-xl font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  {editingMess ? 'Update Mess' : 'Create Mess'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
