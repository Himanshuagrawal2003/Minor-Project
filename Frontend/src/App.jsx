import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layout/DashboardLayout';

// Auth Pages
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
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
import { UserManagement } from './pages/UserManagement';
import { NoticeManagement } from './pages/NoticeManagement'; 
import { ComplaintsManagement } from './pages/ComplaintsManagement';
import { Emergency } from './pages/Emergency';
import { EmergencyManagement } from './pages/EmergencyManagement';
import { LeaveRequest } from './pages/LeaveRequest';
import { LeaveManagement } from './pages/LeaveManagement';
import { WardenOverview } from './pages/WardenOverview';
import { Escalations } from './pages/Escalations';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Route - Unified Login */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

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
          <Route path="/admin/mess-menu" element={<MessMenu />} />
          <Route path="/admin/complaints" element={<ComplaintsManagement />} />
          <Route path="/admin/leave" element={<LeaveManagement />} />
          <Route path="/admin/room-allotment" element={<RoomAllotment />} />
          <Route path="/admin/notices" element={<NoticeManagement />} />
          <Route path="/admin/emergencies" element={<EmergencyManagement />} />
          <Route path="/admin/profile" element={<Profile />} />

        </Route>

        <Route element={<DashboardLayout role="student" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/complaints" element={<ComplaintsManagement/>} />
          <Route path="/student/leave" element={<LeaveRequest />} />
          <Route path="/student/mess-menu" element={<MessMenu />} />
          <Route path="/student/leave" element={<LeaveRequest />} />
          <Route path="/student/room" element={<RoomDetails />} />
          <Route path="/student/emergency" element={<Emergency />} />
          <Route path="/student/profile" element={<Profile />} />
        </Route>

        <Route element={<DashboardLayout role="warden" />}>
          <Route path="/warden/dashboard" element={<WardenDashboard />} />
          <Route path="/warden/mess-menu" element={<MessMenu />} />
          <Route path="/warden/room-allotment" element={<RoomAllotment />} />
          <Route path="/warden/complaints" element={<ComplaintsManagement/>} />
          <Route path="/warden/leave" element={<LeaveManagement />} />
          <Route path="/warden/notices" element={<NoticeManagement />} />
          <Route path="/warden/emergencies" element={<EmergencyManagement />} />
          <Route path="/student/leave" element={<LeaveRequest />} />
          <Route path="/warden/profile" element={<Profile />} />
        </Route>

        <Route element={<DashboardLayout role="staff" />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/profile" element={<Profile />} />
        </Route>

        <Route element={<DashboardLayout role="chief-warden" />}>
          <Route path="/chief-warden/dashboard" element={<ChiefWardenDashboard />} />
          <Route path="/chief-warden/escalations" element={<Escalations />} />
          <Route path="/chief-warden/wardens" element={<WardenOverview />} />
          <Route path="/chief-warden/room-allotment" element={<RoomAllotment />} />
          <Route path="/chief-warden/leave" element={<LeaveManagement />} />
          <Route path="/chief-warden/notices" element={<NoticeManagement />} />
          <Route path="/chief-warden/emergencies" element={<EmergencyManagement />} />
          <Route path="/chief-warden/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
