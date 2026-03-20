// noticeStore.js — frontend-only shared notice store using localStorage

const STORAGE_KEY = 'hostel_notices';

const INITIAL_NOTICES = [
  { _id: '1', title: 'Hostel timing changes for Diwali', content: 'The hostel gates will remain open until 11 PM during the festival days.', priority: 'high', targetRoles: ['all'], createdAt: new Date().toISOString(), author: { name: 'Admin' } },
  { _id: '2', title: 'Maintenance in Block B', content: 'Water supply will be suspended from 10 AM to 2 PM on Thursday for routine maintenance.', priority: 'medium', targetRoles: ['all'], createdAt: new Date(Date.now() - 86400000).toISOString(), author: { name: 'Admin' } },
  { _id: '3', title: 'New Mess Menu implementation', content: 'The revised mess menu will be effective from the first of next month. Please check the mess section for details.', priority: 'low', targetRoles: ['student'], createdAt: new Date(Date.now() - 172800000).toISOString(), author: { name: 'Admin' } },
  { _id: '4', title: 'Staff Safety Briefing', content: 'There will be a mandatory safety briefing for all maintenance staff on Friday at 9 AM in the main hall.', priority: 'high', targetRoles: ['staff'], createdAt: new Date().toISOString(), author: { name: 'Admin' } },
];

export function getNotices() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    
    // Seed with initial data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTICES));
    return INITIAL_NOTICES;
  } catch {
    return INITIAL_NOTICES;
  }
}

export function saveNotices(notices) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
}

export function addNotice(notice) {
  const all = getNotices();
  const newNotice = {
    ...notice,
    _id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  
  const updated = [newNotice, ...all];
  saveNotices(updated);
  return newNotice;
}

export function deleteNotice(id) {
  const all = getNotices();
  const updated = all.filter(n => n._id !== id);
  saveNotices(updated);
  return updated;
}

export function updateNotice(id, updates) {
  const all = getNotices();
  const updated = all.map(n => n._id === id ? { ...n, ...updates } : n);
  saveNotices(updated);
  return updated;
}
