import React, { useState, useEffect } from 'react';
import { Coffee, Edit2, Check, X, Calendar, Plus, Trash2, Save, UtensilsCrossed, Moon, Building2, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../lib/utils';

export function MessMenu() {
  const role = localStorage.getItem('role');
  const isWarden = role === 'warden' || role === 'admin';
  const isStudent = role === 'student';

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const todayName = days[todayIndex];
  const tomorrowName = days[(todayIndex + 1) % 7];

  const [availableMesses, setAvailableMesses] = useState([]);
  const [allMenus, setAllMenus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(todayName);
  const [selectedMess, setSelectedMess] = useState('');
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'tomorrow', 'weekly'
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isAddingMess, setIsAddingMess] = useState(false);
  const [newMessName, setNewMessName] = useState('');
  const [isDeletingMess, setIsDeletingMess] = useState(false);
  const [isRenamingMess, setIsRenamingMess] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const [isSavingRename, setIsSavingRename] = useState(false);

  const fetchMenuData = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/mess');

      // Transform flat array into nested object { messId: { day: { breakfast, lunch, dinner } } }
      const nested = {};
      const messes = new Set();

      data.forEach(item => {
        if (!nested[item.messId]) nested[item.messId] = {};
        nested[item.messId][item.day] = item.meals;
        messes.add(item.messId);
      });

      const messList = Array.from(messes);
      if (messList.length === 0) messList.push('Default Mess');

      setAvailableMesses(messList);
      setAllMenus(nested);

      // Set initial selected mess
      if (isStudent) {
        const studentMess = localStorage.getItem('messId') || messList[0];
        setSelectedMess(studentMess);
      } else {
        setSelectedMess(messList[0]);
      }
    } catch (err) {
      console.error("Failed to fetch mess data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsEditing(false);
    if (tab === 'today') setSelectedDay(todayName);
    else if (tab === 'tomorrow') setSelectedDay(tomorrowName);
  };

  const startEditing = () => {
    const currentMenu = allMenus[selectedMess]?.[selectedDay] || { breakfast: [], lunch: [], dinner: [] };
    setEditForm(JSON.parse(JSON.stringify(currentMenu)));
    setIsEditing(true);
  };

  const handleAddItem = (meal) => {
    setEditForm({
      ...editForm,
      [meal]: [...(editForm[meal] || []), '']
    });
  };

  const handleRemoveItem = (meal, index) => {
    setEditForm({
      ...editForm,
      [meal]: editForm[meal].filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (meal, index, value) => {
    const newMeal = [...editForm[meal]];
    newMeal[index] = value;
    setEditForm({ ...editForm, [meal]: newMeal });
  };

  const saveMenu = async () => {
    try {
      await api.post('/mess/menu', {
        messId: selectedMess,
        day: selectedDay,
        meals: editForm
      });
      fetchMenuData();
      setIsEditing(false);
    } catch (err) {
      console.error("Save Menu Error:", err);
      let errorMsg = "Failed to save menu";
      if (typeof err === 'string') errorMsg = err;
      else if (err?.message) errorMsg = err.message;
      else if (err?.error) errorMsg = err.error;
      alert(errorMsg);
    }
  };

  const handleAddMess = () => {
    if (!newMessName.trim()) return;
    if (!availableMesses.includes(newMessName.trim())) {
      setAvailableMesses([...availableMesses, newMessName.trim()]);
      setSelectedMess(newMessName.trim());
    }
    setNewMessName('');
    setIsAddingMess(false);
  };

  const handleDeleteMess = async () => {
    if (selectedMess === 'Default Mess') {
      alert("Cannot delete the Default Mess. You can only clear its items.");
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete '${selectedMess}' and all its menus? This action cannot be undone.`)) {
      try {
        setIsDeletingMess(true);
        await api.delete(`/mess/menu/${selectedMess}`);
        fetchMenuData();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete mess");
      } finally {
        setIsDeletingMess(false);
      }
    }
  };

  const startRenaming = () => {
    setRenameInput(selectedMess);
    setIsRenamingMess(true);
  };

  const handleRenameMess = async () => {
    if (!renameInput.trim() || renameInput.trim() === selectedMess) {
      setIsRenamingMess(false);
      return;
    }
    if (availableMesses.includes(renameInput.trim())) {
      alert("A mess with this name already exists.");
      return;
    }

    try {
      setIsSavingRename(true);
      await api.put('/mess/rename', { oldMessId: selectedMess, newMessId: renameInput.trim() });
      fetchMenuData();
      setIsRenamingMess(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to rename mess");
    } finally {
      setIsSavingRename(false);
    }
  };

  const mealConfigs = [
    { id: 'breakfast', label: 'Breakfast', time: '07:30 - 09:30 AM', icon: Coffee, color: 'amber' },
    { id: 'lunch', label: 'Lunch', time: '12:30 - 02:30 PM', icon: UtensilsCrossed, color: 'emerald' },
    { id: 'dinner', label: 'Dinner', time: '07:30 - 09:30 PM', icon: Moon, color: 'indigo' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-2">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Mess Menu</h1>

            <div className="relative flex items-center bg-muted/40 backdrop-blur-md rounded-xl border border-border/50 px-3 py-1.5 shadow-sm">
              <Building2 size={16} className="text-primary mr-2" />
              {isStudent ? (
                <span className="text-sm font-bold text-foreground pr-1 opacity-90">{selectedMess || 'Select Mess'}</span>
              ) : isRenamingMess ? (
                <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <input
                    type="text"
                    value={renameInput}
                    onChange={(e) => setRenameInput(e.target.value)}
                    className="h-7 px-2 bg-background border border-primary/50 rounded text-sm focus:ring-1 focus:ring-primary/20 outline-none w-32 font-bold"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameMess()}
                    disabled={isSavingRename}
                  />
                  <button onClick={handleRenameMess} disabled={isSavingRename} className="text-primary hover:text-primary/80">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setIsRenamingMess(false)} disabled={isSavingRename} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <select
                  value={selectedMess}
                  onChange={(e) => setSelectedMess(e.target.value)}
                  className="bg-transparent text-sm font-bold text-foreground outline-none cursor-pointer appearance-none pr-4"
                >
                  {availableMesses.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
            </div>

            {isWarden && (
              <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                {isAddingMess ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-300">
                    <input
                      type="text"
                      value={newMessName}
                      onChange={(e) => setNewMessName(e.target.value)}
                      placeholder="New Mess Name"
                      className="h-9 px-3 bg-background border border-primary/50 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none w-24 xs:w-32 sm:w-40 font-medium"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMess()}
                    />
                    <div className="flex items-center gap-1">
                      <button onClick={handleAddMess} className="h-9 w-9 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shrink-0">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setIsAddingMess(false)} className="h-9 w-9 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-all shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setIsAddingMess(true)}
                      className="h-9 w-9 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
                      title="Add New Mess"
                    >
                      <Plus size={18} />
                    </button>
                    {selectedMess !== 'Default Mess' && (
                      <>
                        <button
                          onClick={startRenaming}
                          className="h-9 w-9 flex items-center justify-center text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20"
                          title="Rename Mess"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={handleDeleteMess}
                          disabled={isDeletingMess}
                          className="h-9 w-9 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-destructive/20 disabled:opacity-50"
                          title="Delete Mess"
                        >
                          {isDeletingMess ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <p className="text-muted-foreground mt-1 text-sm font-medium">
            {isStudent ? 'View the daily food schedule for your allotted mess.' : 'Set and manage the weekly meal cycle for active messes.'}
          </p>
        </div>

        {isWarden && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-all flex items-center justify-center gap-2 text-sm shadow-sm">
                  <X size={16} /> Cancel
                </button>
                <button onClick={saveMenu} className="px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm">
                  <Save size={16} /> Save
                </button>
              </div>
            ) : (
              <button onClick={startEditing} className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 duration-200">
                <Edit2 size={18} /> Edit {selectedDay}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs Control */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between overflow-hidden">
        <div className="flex gap-2 p-1 bg-muted/40 backdrop-blur-md rounded-2xl border border-border/50 w-full sm:w-auto overflow-x-auto no-scrollbar shadow-sm">
          <button
            onClick={() => handleTabChange('today')}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeTab === 'today' ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Today
          </button>
          <button
            onClick={() => handleTabChange('tomorrow')}
            className={cn(
              "flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeTab === 'tomorrow' ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tomorrow
          </button>
          {isWarden && (
            <button
              onClick={() => handleTabChange('weekly')}
              className={cn(
                "flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeTab === 'weekly' ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Weekly Schedule
            </button>
          )}
        </div>

        {activeTab === 'weekly' && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 w-full sm:w-auto">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => { setSelectedDay(day); setIsEditing(false); }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  selectedDay === day ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80 shadow-sm"
                )}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500",
        isEditing ? "opacity-95 scale-[0.99]" : "opacity-100"
      )}>
        {mealConfigs.map(({ id, label, time, icon: MealIcon, color }) => {
          const items = isEditing ? editForm?.[id] || [] : allMenus[selectedMess]?.[selectedDay]?.[id] || [];

          return (
            <div key={id} className={cn(
              "glass-card overflow-hidden group border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500",
              `hover:border-${color}-500/30`
            )}>
              <div className={cn(
                "p-5 flex items-center justify-between border-b border-border/50",
                `bg-${color}-500/5`
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-background", `text-${color}-500 shadow-sm`)}>
                    <MealIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest">{label}</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{time}</p>
                  </div>
                </div>
                {isEditing && (
                  <button onClick={() => handleAddItem(id)} className={cn("h-8 w-8 rounded-full flex items-center justify-center transition-all shadow-sm", `bg-${color}-500/10 text-${color}-600 hover:bg-${color}-500/20`)}>
                    <Plus size={18} />
                  </button>
                )}
              </div>

              <div className="p-6 space-y-4 min-h-[auto]">
                {items.length === 0 && !isEditing && (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/40">
                    <UtensilsCrossed size={32} strokeWidth={1.5} />
                    <p className="text-xs font-bold mt-3 italic uppercase tracking-wider">Empty Menu</p>
                  </div>
                )}

                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 group/item">
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange(id, idx, e.target.value)}
                          placeholder="Ex: Dal Makhani"
                          className="flex-1 h-10 px-3 bg-muted/30 border border-border/10 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all w-full"
                        />
                        <button onClick={() => handleRemoveItem(id, idx)} className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all md:opacity-0 md:group-hover/item:opacity-100 flex items-center justify-center">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 w-full animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className={cn("h-2 w-2 rounded-full mt-2 shrink-0 shadow-[0_0_8px]", `bg-${color}-500 shadow-${color}-500/50`)}></div>
                        <span className="text-sm font-bold leading-relaxed text-foreground/80">{item}</span>
                      </div>
                    )}
                  </div>
                ))}

                {isEditing && items.length === 0 && (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-border/60 rounded-xl bg-muted/20">
                    <button onClick={() => handleAddItem(id)} className="text-xs font-black text-muted-foreground hover:text-primary transition-all flex items-center gap-2 uppercase tracking-tight">
                      <Plus size={14} /> Add First Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isWarden && isEditing && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl text-xs flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-500 shadow-sm">
          <div className="p-2 bg-amber-500/20 rounded-full shrink-0 shadow-inner">
            <Calendar size={16} />
          </div>
          <p className="font-bold leading-relaxed">
            Note: You are currently modifying the menu for <strong>{selectedMess}</strong> on <strong>{selectedDay}</strong>.
            The updated menu will be reflected on all student dashboards instantly once saved.
          </p>
        </div>
      )}
    </div>
  );
}


