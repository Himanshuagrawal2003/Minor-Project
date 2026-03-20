// messStore.js — frontend-only shared store for multiple mess menus using localStorage

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

export function updateMessMenu(messId, day, newMenuData) {
  const current = getMessMenus();
  if (current[messId]) {
    current[messId][day] = newMenuData;
    saveMessMenus(current);
  }
  return current;
}

export const AVAILABLE_MESSES = ['Mess-1', 'Mess-2'];
