import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layout/DashboardLayout';

// Auth Pages
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { StudentLogin } from './pages/StudentLogin';
import { WardenLogin } from './pages/WardenLogin';
import { StaffLogin } from './pages/StaffLogin';
import { ChiefWardenLogin } from './pages/ChiefWardenLogin';

// Dashboards & Features
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { WardenDashboard } from './pages/WardenDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { ChiefWardenDashboard } from './pages/ChiefWardenDashboard';
import { MessMenu } from './pages/MessMenu';
import { RoomDetails } from './pages/RoomDetails';
import { RoomAllotment } from './pages/RoomAllotment';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import { UserManagement } from './pages/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Route - Unified Login */}
        <Route path="/" element={<Login />} />

        {/* Legacy Custom Auth Routes - Kept for compatibility if they bookmark them */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/warden" element={<WardenLogin />} />
        <Route path="/staff" element={<StaffLogin />} />
        <Route path="/chief-warden" element={<ChiefWardenLogin />} />

        {/* Dashboards Routes */}
        <Route element={<DashboardLayout role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement/>} />
          <Route path="/admin/hostel" element={<div className="p-4 glass-card m-4">Hostel Setup</div>} />
          <Route path="/admin/mess-menu" element={<MessMenu />} />
          <Route path="/admin/room-allotment" element={<RoomAllotment />} />
          <Route path="/admin/profile" element={<Profile />} />
        
        </Route>

        <Route element={<DashboardLayout role="student" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/complaints" element={<div className="p-4 glass-card m-4">Complaints</div>} />
          <Route path="/student/leave" element={<div className="p-4 glass-card m-4">Leave Requests</div>} />
          <Route path="/student/mess-menu" element={<MessMenu />} />
          <Route path="/student/room" element={<RoomDetails />} />
          <Route path="/student/emergency" element={<div className="p-4 glass-card m-4 border-destructive">Emergency Alert Center</div>} />
          <Route path="/student/profile" element={<Profile />} />
        </Route>

        <Route element={<DashboardLayout role="warden" />}>
          <Route path="/warden/dashboard" element={<WardenDashboard />} />
          <Route path="/warden/mess-menu" element={<MessMenu />} />
          <Route path="/warden/complaints" element={<div className="p-4 glass-card m-4">Student Complaints</div>} />
          <Route path="/warden/leave" element={<div className="p-4 glass-card m-4">Leave Approvals</div>} />
          <Route path="/warden/profile" element={<Profile />} />
        </Route>

        <Route element={<DashboardLayout role="staff" />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/tasks" element={<div className="p-4 glass-card m-4">My Tasks View</div>} />
          <Route path="/staff/profile" element={<Profile />} />
        </Route>

        <Route element={<DashboardLayout role="chief-warden" />}>
          <Route path="/chief-warden/dashboard" element={<ChiefWardenDashboard />} />
          <Route path="/chief-warden/escalations" element={<div className="p-4 glass-card m-4">Escalated Complaints List</div>} />
          <Route path="/chief-warden/wardens" element={<div className="p-4 glass-card m-4">Warden Performance Overview</div>} />
          <Route path="/chief-warden/room-allotment" element={<RoomAllotment />} />
          <Route path="/chief-warden/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
