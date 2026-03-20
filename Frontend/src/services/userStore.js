// userStore.js — frontend-only shared user store using localStorage
import { mockStudents } from '../data/mockData';

const STORAGE_KEY = 'hostel_users';

const INITIAL_USERS = {
  student: mockStudents.map(s => ({
    _id: `mongo-s-${s.id}`,
    userID: s.id,
    name: s.name,
    email: s.email,
    role: 'student',
    extra: s.course
  })),
  warden: [
    { _id: 'mongo-w-1', userID: 'W101', name: 'R.K. Singh', email: 'rk@example.com', role: 'warden', extra: 'Block A' },
    { _id: 'mongo-w-2', userID: 'W102', name: 'S. Patel', email: 'sp@example.com', role: 'warden', extra: 'Block C' }
  ],
  'chief-warden': [
    { _id: 'mongo-cw-1', userID: 'CW101', name: 'Dr. Khanna', email: 'khanna@example.com', role: 'chief-warden', extra: 'Administration' }
  ],
  staff: [
    { _id: 'mongo-st-1', userID: 'STF001', name: 'Ravi Kumar', email: 'ravi@example.com', role: 'staff', extra: 'Electrical' },
    { _id: 'mongo-st-2', userID: 'STF002', name: 'Suresh Patel', email: 'suresh@example.com', role: 'staff', extra: 'Plumbing' }
  ],
  admin: [
    { _id: 'mongo-adm-1', userID: 'ADMIN', name: 'System Admin', email: 'admin@hostel.com', role: 'admin', extra: 'All Blocks' }
  ]
};

export function getUsers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    
    // Seed with initial data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function addUser(user) {
  const all = getUsers();
  const role = user.role;
  const newUser = {
    ...user,
    _id: `mongo-${role}-${Date.now()}`
  };
  
  const updated = {
    ...all,
    [role]: [...(all[role] || []), newUser]
  };
  
  saveUsers(updated);
  return newUser;
}

export function deleteUser(mongoId, role) {
  const all = getUsers();
  if (!all[role]) return all;
  
  const updated = {
    ...all,
    [role]: all[role].filter(u => u._id !== mongoId)
  };
  
  saveUsers(updated);
  return updated;
}

export function bulkAddUsers(newUsers, role) {
  const all = getUsers();
  const annotated = newUsers.map((u, i) => ({
    ...u,
    _id: `mongo-${role}-${Date.now()}-${i}`
  }));
  
  const updated = {
    ...all,
    [role]: [...(all[role] || []), ...annotated]
  };
  
  saveUsers(updated);
  return updated;
}

export function bulkDeleteUsers(userIDs, role) {
  const all = getUsers();
  if (!all[role]) return { deletedCount: 0, notFoundCount: userIDs.length };
  
  const initialCount = all[role].length;
  const updatedRoleUsers = all[role].filter(u => !userIDs.includes(u.userID));
  const finalCount = updatedRoleUsers.length;
  
  const updated = {
    ...all,
    [role]: updatedRoleUsers
  };
  
  saveUsers(updated);
  
  return {
    deletedCount: initialCount - finalCount,
    notFoundCount: userIDs.length - (initialCount - finalCount)
  };
}
