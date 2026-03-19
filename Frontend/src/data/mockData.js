export const mockStudents = [
  { id: 'S101', name: 'Rahul Sharma', email: 'rahul@example.com', course: 'B.Tech CSE', year: '2nd' },
  { id: 'S102', name: 'Priya Patel', email: 'priya@example.com', course: 'B.Arch', year: '1st' },
  { id: 'S103', name: 'Arjun Das', email: 'arjun@example.com', course: 'M.Tech', year: '1st' },
  { id: 'S104', name: 'Sneha Reddy', email: 'sneha@example.com', course: 'B.Sc Physics', year: '3rd' },
  { id: 'S105', name: 'Vikram Singh', email: 'vikram@example.com', course: 'B.Tech IT', year: '2nd' },
  { id: 'S106', name: 'Ananya Iyer', email: 'ananya@example.com', course: 'B.Des', year: '2nd' },
];

export const mockRooms = [
  { id: 'R101', number: 'A-101', capacity: 3, floor: '1st', type: 'Boys' },
  { id: 'R102', number: 'A-102', capacity: 3, floor: '1st', type: 'Boys' },
  { id: 'R201', number: 'B-201', capacity: 4, floor: '2nd', type: 'Boys' },
  { id: 'R202', number: 'B-202', capacity: 4, floor: '2nd', type: 'Boys' },
  { id: 'R301', number: 'G-101', capacity: 3, floor: '1st', type: 'Girls' },
  { id: 'R302', number: 'G-102', capacity: 4, floor: '1st', type: 'Girls' },
];

export const initialAllotments = [
  { id: 'AL001', studentId: 'S101', roomId: 'R101', date: '2026-03-10' },
  { id: 'AL002', studentId: 'S104', roomId: 'R301', date: '2026-03-12' },
];
