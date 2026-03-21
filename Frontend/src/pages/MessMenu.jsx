import React, { useState } from 'react';
import { Coffee, Edit2, Check, X, Calendar, Plus, Trash2, Save, UtensilsCrossed, Moon, Building2 } from 'lucide-react';
import { getMessMenus, updateMessMenu, getAvailableMesses, addMess, deleteMess, renameMess } from '../services/messStore';
import { getStudentAllotment } from '../services/roomStore';
import { cn } from '../lib/utils';

export function MessMenu() {
  const role = localStorage.getItem('role');
  const isWarden = role === 'warden' || role === 'admin';
  const isStudent = role === 'student';

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const todayName = days[todayIndex];
  const tomorrowName = days[(todayIndex + 1) % 7];

  const [availableMesses, setAvailableMesses] = useState(getAvailableMesses());
  
  // If student, pull their actual assigned mess
  let defaultMess = availableMesses[0];
  let messNotFoundError = false;

  if (isStudent) {
    const studentId = localStorage.getItem('userID') || 'S101';
    const allotment = getStudentAllotment(studentId);
    if (allotment && allotment.messId) {
      if (availableMesses.includes(allotment.messId)) {
        defaultMess = allotment.messId;
      } else {
        messNotFoundError = true;
      }
    } else {
      messNotFoundError = true;
    }
  }


  const [selectedDay, setSelectedDay] = useState(todayName);
  const [selectedMess, setSelectedMess] = useState(defaultMess);
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'tomorrow', 'weekly'
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMess, setIsAddingMess] = useState(false);
  const [isRenamingMess, setIsRenamingMess] = useState(false);
  const [newMessName, setNewMessName] = useState('');
  const [renamedMessName, setRenamedMessName] = useState('');



  // Persistent Weekly Menu Data for all messes
  const [allMenus, setAllMenus] = useState(getMessMenus);


  const [editForm, setEditForm] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsEditing(false);
    if (tab === 'today') setSelectedDay(todayName);
    else if (tab === 'tomorrow') setSelectedDay(tomorrowName);
  };

  const startEditing = () => {
    const currentMenu = allMenus[selectedMess];
    if (currentMenu && currentMenu[selectedDay]) {
      setEditForm(JSON.parse(JSON.stringify(currentMenu[selectedDay])));
      setIsEditing(true);
    }
  };

  const handleAddItem = (meal) => {
    setEditForm({
      ...editForm,
      [meal]: [...editForm[meal], '']
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

  const saveMenu = () => {
    const updatedAllMenus = updateMessMenu(selectedMess, selectedDay, editForm);
    setAllMenus(updatedAllMenus);
    setIsEditing(false);
  };

  const handleMessChange = (e) => {
    setSelectedMess(e.target.value);
    setIsEditing(false); // cancel edit if switching messes
  };

  const handleAddMess = () => {
    if (!newMessName.trim()) return;
    const result = addMess(newMessName.trim());
    if (result.success) {
      const updatedMesses = getAvailableMesses();
      setAvailableMesses(updatedMesses);
      setSelectedMess(newMessName.trim());
      setAllMenus(result.menus);
      setNewMessName('');
      setIsAddingMess(false);
    } else {
      alert(result.message);
    }
  };

  const handleDeleteMess = () => {
    if (availableMesses.length <= 1) {
      alert("At least one mess must exist.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedMess}?`)) {
      const result = deleteMess(selectedMess);
      if (result.success) {
        const updatedMesses = getAvailableMesses();
        setAvailableMesses(updatedMesses);
        setSelectedMess(updatedMesses[0]);
        setAllMenus(result.menus);
      }
    }
  };


  const handleRenameMess = () => {
    if (!renamedMessName.trim() || renamedMessName.trim() === selectedMess) {
      setIsRenamingMess(false);
      return;
    }
    const result = renameMess(selectedMess, renamedMessName.trim());
    if (result.success) {
      const updatedMesses = getAvailableMesses();
      const newName = renamedMessName.trim();
      setAvailableMesses(updatedMesses);
      setSelectedMess(newName);
      setAllMenus(result.menus);
      setRenamedMessName('');
      setIsRenamingMess(false);
    } else {
      alert(result.message);
    }
  };

  const startRenaming = () => {
    setRenamedMessName(selectedMess);
    setIsRenamingMess(true);
  };

  const mealConfigs = [

    { id: 'breakfast', label: 'Breakfast', time: '07:30 - 09:30 AM', icon: Coffee, color: 'amber' },
    { id: 'lunch', label: 'Lunch', time: '12:30 - 02:30 PM', icon: UtensilsCrossed, color: 'emerald' },
    { id: 'dinner', label: 'Dinner', time: '07:30 - 09:30 PM', icon: Moon, color: 'indigo' },
  ];

  return (
     <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-6 mx-auto max-w-7xl w-full relative min-h-[calc(100vh-4rem)] space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-2">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <h1 className="text-2xl font-bold tracking-tight shrink-0">Mess Menu</h1>

            <div className="relative flex items-center bg-muted/40 backdrop-blur-md rounded-xl border border-border/50 px-3 py-1.5 shadow-sm">
              <Building2 size={16} className="text-primary mr-2" />
              {isStudent ? (
                <span className="text-sm font-bold text-foreground pr-1 opacity-90">{selectedMess}</span>
              ) : (
                <select 
                  value={selectedMess} 
                  onChange={handleMessChange} 
                  className="bg-transparent text-sm font-bold text-foreground outline-none cursor-pointer appearance-none pr-4"
                >
                  {availableMesses.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
            </div>

            {isWarden && (
              <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                {isAddingMess || isRenamingMess ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-300">
                    <input 
                      type="text"
                      value={isAddingMess ? newMessName : renamedMessName}
                      onChange={(e) => isAddingMess ? setNewMessName(e.target.value) : setRenamedMessName(e.target.value)}
                      placeholder={isAddingMess ? "New Mess Name" : "Rename Mess..."}
                      className="h-9 px-3 bg-background border border-primary/50 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none w-24 xs:w-32 sm:w-40"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && (isAddingMess ? handleAddMess() : handleRenameMess())}
                    />
                    <div className="flex items-center gap-1">
                      <button onClick={isAddingMess ? handleAddMess : handleRenameMess} className="h-9 w-9 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shrink-0">
                        <Check size={16} />
                      </button>
                      <button onClick={() => { setIsAddingMess(false); setIsRenamingMess(false); }} className="h-9 w-9 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-all shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setIsAddingMess(true)}
                      className="h-9 w-9 flex items-center justify-center text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20"
                      title="Add New Mess"
                    >
                      <Plus size={18} />
                    </button>
                    <button 
                      onClick={startRenaming}
                      className="h-9 w-9 flex items-center justify-center text-amber-600 hover:bg-amber-600/10 rounded-lg transition-colors border border-amber-600/20"
                      title="Rename Mess"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={handleDeleteMess}
                      className="h-9 w-9 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-destructive/20"
                      title="Delete Current Mess"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}



          </div>

          <p className="text-muted-foreground mt-1 text-sm">
            {isStudent ? 'View the daily food schedule for your allotted mess.' : 'Set and manage the weekly meal cycle for active messes.'}
          </p>
        </div>

        {isWarden && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-all flex items-center justify-center gap-2 text-sm">
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
        <div className="flex gap-2 p-1 bg-muted/40 backdrop-blur-md rounded-2xl border border-border/50 w-full sm:w-auto overflow-x-auto no-scrollbar">
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
                  selectedDay === day ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Cards Grid */}
      {messNotFoundError && isStudent ? (
        <div className="flex flex-col items-center justify-center p-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border/50 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="p-4 bg-primary/10 rounded-full text-primary mb-4">
            <UtensilsCrossed size={48} />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">No Allotted Mess</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            We couldn't find an active mess allotment for your account. Please contact the hostel office or warden for allotment.
          </p>
        </div>
      ) : (
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500",
          isEditing ? "opacity-95" : "opacity-100"
        )}>
          {mealConfigs.map(({ id, label, time, icon: Icon, color }) => {
            const items = isEditing ? editForm[id] : allMenus[selectedMess]?.[selectedDay]?.[id] || [];

            return (
              <div key={id} className={cn(
                "glass-card overflow-hidden group border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500",
                `hover:border-${color}-500/30`
              )}>
                {/* Header */}
                <div className={cn(
                  "p-5 flex items-center justify-between border-b border-border/50",
                  `bg-${color}-500/5`
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-background", `text-${color}-500 shadow-sm`)}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-widest">{label}</h3>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">{time}</p>
                    </div>
                  </div>
                  {isEditing && (
                    <button onClick={() => handleAddItem(id)} className={cn("h-8 w-8 rounded-full flex items-center justify-center transition-all", `bg-${color}-500/10 text-${color}-600 hover:bg-${color}-500/20`)}>
                      <Plus size={18} />
                    </button>
                  )}
                </div>

                {/* Items List */}
                <div className="p-6 space-y-4 min-h-[auto]">
                  {items.length === 0 && !isEditing && (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/40">
                      <UtensilsCrossed size={32} strokeWidth={1.5} />
                      <p className="text-xs font-medium mt-3 italic">Empty Menu</p>
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
                            className="flex-1 h-10 px-3 bg-muted/30 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all w-full"
                          />
                          <button onClick={() => handleRemoveItem(id, idx)} className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all sm:opacity-0 sm:group-hover/item:opacity-100 flex items-center justify-center mb-0">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 w-full animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                          <div className={cn("h-2 w-2 rounded-full mt-2 shrink-0", `bg-${color}-500 shadow-[0_0_8px] shadow-${color}-500/50`)}></div>
                          <span className="text-sm font-semibold leading-relaxed text-foreground/80">{item}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {isEditing && items.length === 0 && (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-border/60 rounded-xl">
                      <button onClick={() => handleAddItem(id)} className="text-xs font-bold text-muted-foreground hover:text-primary transition-all flex items-center gap-2">
                        <Plus size={14} /> Add First Item
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}


      {isWarden && isEditing && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl text-xs flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-500">
          <div className="p-2 bg-amber-500/20 rounded-full shrink-0">
            <Calendar size={16} />
          </div>
          <p className="font-semibold leading-relaxed">
            Note: You are currently modifying the menu for <strong>{selectedMess}</strong> on <strong>{selectedDay}</strong>. Make sure the items are verified before saving.
            The updated menu will be reflected on all student dashboards instantly.
          </p>
        </div>
      )}
    </div>
  );
}
