// complaintStore.js — frontend-only shared data store using localStorage

const STORAGE_KEY = 'hostel_complaints';

export const MOCK_STAFF = [
  { id: 'STF-001', name: 'Ravi Kumar', specialty: 'Electrical' },
  { id: 'STF-002', name: 'Suresh Patel', specialty: 'Plumbing' },
  { id: 'STF-003', name: 'Amit Singh', specialty: 'Internet/IT' },
  { id: 'STF-004', name: 'Deepak Verma', specialty: 'General Maintenance' },
  { id: 'STF-005', name: 'Mohan Lal', specialty: 'Cleanliness' },
];

const MOCK_COMPLAINTS = [
  {
    id: 'ELE-1001',
    title: 'Broken fan in room',
    category: 'Electrical',
    description: 'The ceiling fan in Room B-204 has stopped working since last week.',
    priority: 'High',
    status: 'Pending',
    studentName: 'Rahul Sharma',
    studentId: 'STU-001',
    room: 'B-204',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    remarks: '',
  },
  {
    id: 'PLU-1001',
    title: 'Water leakage in washroom',
    category: 'Plumbing',
    description: 'There is a constant water leakage from the washroom tap in Block C-1.',
    priority: 'High',
    status: 'In Progress',
    studentName: 'Rahul Sharma',
    studentId: 'STU-001',
    room: 'B-204',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    remarks: 'Plumber has been assigned.',
  },
  {
    id: 'NET-1001',
    title: 'Internet not working',
    category: 'Internet',
    description: 'WiFi in Block B ground floor is not working since yesterday morning.',
    priority: 'Medium',
    status: 'Resolved',
    studentName: 'Rahul Sharma',
    studentId: 'STU-001',
    room: 'B-204',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    remarks: 'Network team has fixed the router.',
  },
];

export function getComplaints() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    // Seed with mock data on first load
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_COMPLAINTS));
    return MOCK_COMPLAINTS;
  } catch {
    return MOCK_COMPLAINTS;
  }
}

export function saveComplaints(complaints) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

export function addComplaint(complaint) {
  const all = getComplaints();
  
  // Category-wise ID generation (e.g. ELE-1001)
  const categoryPrefix = (complaint.category.substring(0, 3).toUpperCase() === 'INT' ? 'NET' : complaint.category.substring(0, 3).toUpperCase());
  const sameCategory = all.filter(c => c.category === complaint.category);
  const nextNumber = 1000 + sameCategory.length + 1;
  const newId = `${categoryPrefix}-${nextNumber}`;

  const newComplaint = {
    ...complaint,
    id: newId,
    status: 'Pending',
    remarks: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [newComplaint, ...all];
  saveComplaints(updated);
  return newComplaint;
}

export function updateComplaint(id, changes) {
  const all = getComplaints();
  const updated = all.map(c =>
    c.id === id ? { ...c, ...changes, updatedAt: new Date().toISOString() } : c
  );
  saveComplaints(updated);
  return updated;
}

export const CATEGORIES = ['Electrical', 'Plumbing', 'Internet', 'Cleanliness', 'Furniture', 'Security', 'Mess', 'Other'];
export const PRIORITIES = ['Low', 'Medium', 'High'];
export const STATUSES = ['Pending', 'In Progress', 'Escalated', 'Resolved', 'Rejected'];
