// messStore.js — frontend-only shared store for multiple mess menus using localStorage
import { updateAllotmentsMessId } from './roomStore';


const STORAGE_KEY = 'hostel_mess_menus';

const DEFAULT_MENU = {
  Monday: { breakfast: ['Poha', 'Tea'], lunch: ['Dal', 'Rice', 'Roti'], dinner: ['Paneer', 'Chapati'] },
  Tuesday: { breakfast: ['Idli', 'Sambar'], lunch: ['Rajma', 'Chawal'], dinner: ['Mix Veg', 'Roti'] },
  Wednesday: { breakfast: ['Aloo Paratha', 'Curd'], lunch: ['Chole', 'Bhature'], dinner: ['Kadhai Paneer', 'Naan'] },
  Thursday: { breakfast: ['Upma', 'Milk'], lunch: ['Kadhi', 'Rice'], dinner: ['Gobi Matar', 'Roti'] },
  Friday: { breakfast: ['Bread Jam', 'Coffee'], lunch: ['Veg Biryani', 'Raita'], dinner: ['Aloo Gobi', 'Chapati'] },
  Saturday: { breakfast: ['Puri Sabzi'], lunch: ['Pasta', 'Salad'], dinner: ['Fried Rice', 'Manchurian'] },
  Sunday: { breakfast: ['Stuffed Paratha'], lunch: ['Special Thali'], dinner: ['Mushroom Masala', 'Roti'] },
};

const INITIAL_MESSES = {
  'Mess-1': JSON.parse(JSON.stringify(DEFAULT_MENU)),
  'Mess-2': {
    ...JSON.parse(JSON.stringify(DEFAULT_MENU)),
    Monday: { breakfast: ['Oats', 'Milk'], lunch: ['Dal Fry', 'Jeera Rice', 'Roti'], dinner: ['Mutter Paneer', 'Chapati'] }
  }
};

export function getMessMenus() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    
    // Seed with initial data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MESSES));
    return INITIAL_MESSES;
  } catch {
    return INITIAL_MESSES;
  }
}

export function saveMessMenus(menus) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
}

export function getAvailableMesses() {
  const menus = getMessMenus();
  return Object.keys(menus);
}

export function addMess(messName) {
  const menus = getMessMenus();
  if (menus[messName]) return { success: false, message: 'Mess already exists' };
  
  menus[messName] = JSON.parse(JSON.stringify(DEFAULT_MENU));
  saveMessMenus(menus);
  return { success: true, menus };
}

export function deleteMess(messId) {
  const menus = getMessMenus();
  if (!menus[messId]) return { success: false, message: 'Mess not found' };
  // Keep at least one mess if possible, or handle empty state in UI
  delete menus[messId];
  saveMessMenus(menus);
  return { success: true, menus };
}

export function updateMessMenu(messId, day, newMenuData) {
  const current = getMessMenus();
  if (current[messId]) {
    current[messId][day] = newMenuData;
    saveMessMenus(current);
  }
  return current;
}

export function renameMess(oldId, newName) {
  const menus = getMessMenus();
  if (!menus[oldId]) return { success: false, message: 'Mess not found' };
  if (menus[newName]) return { success: false, message: 'New mess name already exists' };
  
  // 1. Copy menu to new name
  menus[newName] = menus[oldId];
  // 2. Delete old name
  delete menus[oldId];
  // 3. Save menus
  saveMessMenus(menus);
  // 4. Update all student allotments in roomStore
  updateAllotmentsMessId(oldId, newName);
  
  return { success: true, menus };
}


