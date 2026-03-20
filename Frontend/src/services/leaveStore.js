// leaveStore.js - persistent local storage for student leave & no dues requests
import { mockStudents } from '../data/mockData';
import { getStudentAllotment } from './roomStore';

const STORAGE_KEY = 'hostel_leave_requests';

const hydrateLeaves = (leaves) => {
  return leaves.map(l => {
    const student = mockStudents.find(s => s.id === l.studentId) || null;
    const allotment = getStudentAllotment(l.studentId);
    return { ...l, student, room: allotment?.room?.number || 'N/A' };
  });
};

const INITIAL_LEAVES = [
  {
    id: 'LV-1001',
    studentId: 'S104',
    type: 'Semester Leave',
    startDate: '2026-05-15',
    endDate: '2026-07-20',
    reason: 'Going home for summer vacation.',
    noDuesCleared: true,
    status: 'Pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    remarks: ''
  }
];

export function getLeaveRequests() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return hydrateLeaves(JSON.parse(stored));
    
    // Seed data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEAVES));
    return hydrateLeaves(INITIAL_LEAVES);
  } catch {
    return hydrateLeaves(INITIAL_LEAVES);
  }
}

export function saveLeaveRequests(leaves) {
  const storableFormat = leaves.map(l => ({
    id: l.id,
    studentId: l.student?.id || l.studentId,
    type: l.type,
    startDate: l.startDate,
    endDate: l.endDate,
    reason: l.reason,
    noDuesCleared: l.noDuesCleared,
    status: l.status,
    createdAt: l.createdAt,
    remarks: l.remarks
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storableFormat));
}

export function submitLeaveRequest(studentId, data) {
  const current = getLeaveRequests();
  const leaveId = `LV-${Date.now().toString().slice(-4)}`;
  
  const newLeave = {
    id: leaveId,
    studentId,
    type: data.type,
    startDate: data.startDate,
    endDate: data.endDate,
    reason: data.reason,
    noDuesCleared: data.noDuesCleared,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    remarks: ''
  };
  
  current.unshift(newLeave);
  saveLeaveRequests(current);
  return current;
}

export function updateLeaveStatus(id, status, remarks = '') {
  const current = getLeaveRequests();
  const index = current.findIndex(l => l.id === id);
  
  if (index !== -1) {
    current[index].status = status;
    current[index].remarks = remarks;
    saveLeaveRequests(current);
  }
  return current;
}

export const LEAVE_TYPES = ['Weekend Pass', 'Medical Leave', 'Semester Leave', 'Permanent Checkout'];
export const LEAVE_STATUSES = ['Pending', 'Approved', 'Rejected'];
