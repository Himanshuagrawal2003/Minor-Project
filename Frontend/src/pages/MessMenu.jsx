import React, { useState } from 'react';
import { Coffee, Edit2, Check, X, Calendar, Plus, Trash2, Save, ChevronLeft, ChevronRight, UtensilsCrossed, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';

export function MessMenu() {
  const role = localStorage.getItem('role');
  const isWarden = role === 'warden' || role === 'admin';
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const todayName = days[todayIndex];
  const tomorrowName = days[(todayIndex + 1) % 7];

  const [selectedDay, setSelectedDay] = useState(todayName);
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'tomorrow', 'weekly'
  const [isEditing, setIsEditing] = useState(false);

  // Initial Weekly Menu Data
  const [weeklyMenu, setWeeklyMenu] = useState({
    Monday: { breakfast: ['Poha', 'Tea'], lunch: ['Dal', 'Rice', 'Roti'], dinner: ['Paneer', 'Chapati'] },
    Tuesday: { breakfast: ['Idli', 'Sambar'], lunch: ['Rajma', 'Chawal'], dinner: ['Mix Veg', 'Roti'] },
    Wednesday: { breakfast: ['Aloo Paratha', 'Curd'], lunch: ['Chole', 'Bhature'], dinner: ['Kadhai Paneer', 'Naan'] },
    Thursday: { breakfast: ['Upma', 'Milk'], lunch: ['Kadhi', 'Rice'], dinner: ['Gobi Matar', 'Roti'] },
    Friday: { breakfast: ['Bread Jam', 'Coffee'], lunch: ['Veg Biryani', 'Raita'], dinner: ['Aloo Gobi', 'Chapati'] },
    Saturday: { breakfast: ['Puri Sabzi'], lunch: ['Pasta', 'Salad'], dinner: ['Fried Rice', 'Manchurian'] },
    Sunday: { breakfast: ['Stuffed Paratha'], lunch: ['Special Thali'], dinner: ['Mushroom Masala', 'Roti'] },
  });

  const [editForm, setEditForm] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsEditing(false);
    if (tab === 'today') setSelectedDay(todayName);
    else if (tab === 'tomorrow') setSelectedDay(tomorrowName);
  };

  const startEditing = () => {
    setEditForm(JSON.parse(JSON.stringify(weeklyMenu[selectedDay])));
    setIsEditing(true);
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
    setWeeklyMenu({
      ...weeklyMenu,
      [selectedDay]: editForm
    });
    setIsEditing(false);
  };

  const mealConfigs = [
    { id: 'breakfast', label: 'Breakfast', time: '07:30 - 09:30 AM', icon: Coffee, color: 'amber' },
    { id: 'lunch', label: 'Lunch', time: '12:30 - 02:30 PM', icon: UtensilsCrossed, color: 'emerald' },
    { id: 'dinner', label: 'Dinner', time: '07:30 - 09:30 PM', icon: Moon, color: 'indigo' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mess Menu</h1>
          <p className="text-muted-foreground mt-2">Set and manage the weekly meal cycle for all hostel residents.</p>
        </div>

        {isWarden && (
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-muted transition-all flex items-center gap-2">
                  <X size={18} /> Cancel
                </button>
                <button onClick={saveMenu} className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2">
                  <Save size={18} /> Update {selectedDay} Menu
                </button>
              </>
            ) : (
              <button onClick={startEditing} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2 scale-105 hover:scale-110 active:scale-95 duration-300">
                <Edit2 size={20} /> Edit {selectedDay} Menu
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs Control */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 p-1.5 bg-muted/40 backdrop-blur-md rounded-2xl border border-border/50">
          <button 
            onClick={() => handleTabChange('today')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === 'today' ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Today
          </button>
          <button 
            onClick={() => handleTabChange('tomorrow')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === 'tomorrow' ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tomorrow
          </button>
          {isWarden && (
            <button 
              onClick={() => handleTabChange('weekly')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'weekly' ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Weekly Schedule
            </button>
          )}
        </div>
        
        {activeTab === 'weekly' && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {days.map((day) => (
              <button 
                key={day}
                onClick={() => { setSelectedDay(day); setIsEditing(false); }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
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
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500",
        isEditing ? "opacity-95" : "opacity-100"
      )}>
        {mealConfigs.map(({ id, label, time, icon: Icon, color }) => {
          const items = isEditing ? editForm[id] : weeklyMenu[selectedDay][id];
          
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
              <div className="p-6 space-y-4 min-h-[250px]">
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
                          className="flex-1 h-10 px-3 bg-muted/30 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                        />
                        <button onClick={() => handleRemoveItem(id, idx)} className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all opacity-0 group-hover/item:opacity-100">
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

      {isWarden && isEditing && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl text-xs flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-500">
          <div className="p-2 bg-amber-500/20 rounded-full shrink-0">
             <Calendar size={16} />
          </div>
          <p className="font-semibold leading-relaxed">
            Note: You are currently modifying the menu for <strong>{selectedDay}</strong>. Make sure the items are verified before saving. 
            The updated menu will be reflected on all student dashboards instantly.
          </p>
        </div>
      )}
    </div>
  );
}
