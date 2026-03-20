// emergencyStore.js - persistent local storage for emergency requests
import { mockStudents } from '../data/mockData';

const STORAGE_KEY = 'hostel_emergencies';

const hydrateEmergencies = (emergencies) => {
  return emergencies.map(e => {
    const student = mockStudents.find(s => s.id === e.studentId) || null;
    return { ...e, student };
  });
};

const INITIAL_EMERGENCIES = [
  {
    id: 'EMG-001',
    studentId: 'S101',
    type: 'Medical',
    description: 'High fever and feeling very weak since morning. Please send medical support.',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    resolvedAt: null,
    remarks: ''
  }
];

export function getEmergencies() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return hydrateEmergencies(JSON.parse(stored));
    
    // Seed data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EMERGENCIES));
    return hydrateEmergencies(INITIAL_EMERGENCIES);
  } catch {
    return hydrateEmergencies(INITIAL_EMERGENCIES);
  }
}

export function saveEmergencies(emergencies) {
  const storableFormat = emergencies.map(e => ({
    id: e.id,
    studentId: e.student?.id || e.studentId,
    type: e.type,
    description: e.description,
    status: e.status,
    createdAt: e.createdAt,
    resolvedAt: e.resolvedAt,
    remarks: e.remarks
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storableFormat));
}

export function createEmergency(studentId, type, description) {
  const current = getEmergencies();
  const emergencyId = `EMG-${Date.now().toString().slice(-4)}`;
  
  const newEmergency = {
    id: emergencyId,
    studentId,
    type,
    description,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    remarks: ''
  };
  
  // Actually saved in saveEmergencies
  current.unshift(newEmergency);
  saveEmergencies(current);
  return current;
}

export function updateEmergencyStatus(id, status, remarks = '') {
  const current = getEmergencies();
  const index = current.findIndex(e => e.id === id);
  
  if (index !== -1) {
    current[index].status = status;
    current[index].remarks = remarks;
    if (status === 'Resolved' || status === 'False Alarm') {
      current[index].resolvedAt = new Date().toISOString();
    }
    saveEmergencies(current);
  }
  return current;
}

export const EMERGENCY_TYPES = ['Medical', 'Security', 'Fire', 'Plumbing', 'Electrical', 'Other'];
export const EMERGENCY_STATUSES = ['Pending', 'In Progress', 'Resolved', 'False Alarm'];
