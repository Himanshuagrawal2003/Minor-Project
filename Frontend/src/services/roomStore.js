import { mockStudents, mockRooms } from '../data/mockData';

const STORAGE_KEY = 'hostel_room_allotments';

// Helper to hydrate allotment with actual student and room objects
const hydrateAllotments = (allotments) => {
  return allotments.map(a => {
    const student = mockStudents.find(s => s.id === a.studentId) || null;
    const room = mockRooms.find(r => r.id === a.roomId) || null;
    return { ...a, student, room };
  });
};

const INITIAL_ALLOTMENTS = [
  { id: 'AL001', studentId: 'S101', roomId: 'R101', messId: 'Mess-1', date: '2026-03-10', status: 'Active' },
  { id: 'AL002', studentId: 'S104', roomId: 'R301', messId: 'Mess-2', date: '2026-03-12', status: 'Active' },
];

export function getAllotments() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return hydrateAllotments(JSON.parse(stored));
    
    // Seed with initial data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ALLOTMENTS));
    return hydrateAllotments(INITIAL_ALLOTMENTS);
  } catch {
    return hydrateAllotments(INITIAL_ALLOTMENTS);
  }
}

export function saveAllotments(allotments) {
  // We only persist the IDs to keep localStorage clean, and 'hydrate' them when reading.
  const storedFormat = allotments.map(a => ({
    id: a.id,
    studentId: a.student?.id || a.studentId,
    roomId: a.room?.id || a.roomId,
    messId: a.messId,
    date: a.date,
    status: a.status
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storedFormat));
}

export function addAllotment(newAllotment) {
  const current = getAllotments();
  current.unshift(newAllotment);
  saveAllotments(current);
  return current;
}

export function removeAllotment(id) {
  const current = getAllotments();
  const updated = current.filter(a => a.id !== id);
  saveAllotments(updated);
  return updated;
}

export function getStudentAllotment(studentId) {
  const current = getAllotments();
  return current.find(a => a.student?.id === studentId) || null;
}

export function updateAllotment(id, updatedData) {
  const current = getAllotments();
  const index = current.findIndex(a => a.id === id);
  if (index !== -1) {
    current[index] = { ...current[index], ...updatedData };
    saveAllotments(current);
  }
  return current;
}

export function updateStudentMess(studentId, newMessId) {
  const current = getAllotments();
  const index = current.findIndex(a => a.student?.id === studentId);
  if (index !== -1) {
    current[index].messId = newMessId;
    saveAllotments(current);
  }
  return current;
}

export function updateAllotmentsMessId(oldMessId, newMessId) {
  const current = getAllotments();
  let changed = false;
  current.forEach(a => {
    if (a.messId === oldMessId) {
      a.messId = newMessId;
      changed = true;
    }
  });
  if (changed) saveAllotments(current);
  return current;
}

