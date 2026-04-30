import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { DashboardLayout } from './layout/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';

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
import { StudentComplaints } from './pages/StudentComplaints';
import { Emergency } from './pages/Emergency';
import { EmergencyManagement } from './pages/EmergencyManagement';
import { LeaveRequest } from './pages/LeaveRequest';
import { LeaveManagement } from './pages/LeaveManagement';
import { WardenOverview } from './pages/WardenOverview';
import { Escalations } from './pages/Escalations';
import { NotFound } from './pages/NotFound';
import { VisitorManagement } from './pages/VisitorManagement';

function App() {
  const user = {
    _id: localStorage.getItem('userID'),
    role: localStorage.getItem('role'),
    name: localStorage.getItem('name')
  };

  return (
    <SocketProvider user={user}>
      <BrowserRouter>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>

          {/* 🔓 Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Redirect Legacy Login Routes to Unified Login */}
          <Route path="/admin" element={<Navigate to="/" replace />} />
          <Route path="/student" element={<Navigate to="/" replace />} />
          <Route path="/warden" element={<Navigate to="/" replace />} />
          <Route path="/staff" element={<Navigate to="/" replace />} />
          <Route path="/chief-warden" element={<Navigate to="/" replace />} />

          {/* 🔐 ADMIN ROUTES */}
          <Route
            element={
              <ProtectedRoute role="admin">
                <DashboardLayout role="admin" />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/mess-menu" element={<MessMenu />} />
            <Route path="/admin/complaints" element={<ComplaintsManagement />} />
            <Route path="/admin/room-allotment" element={<RoomAllotment />} />
            <Route path="/admin/notices" element={<NoticeManagement />} />
            <Route path="/admin/emergencies" element={<EmergencyManagement />} />
            <Route path="/admin/visitors" element={<VisitorManagement />} />
            <Route path="/admin/leave" element={<LeaveManagement />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>

          {/* 🔐 STUDENT ROUTES */}
          <Route
            element={
              <ProtectedRoute role="student">
                <DashboardLayout role="student" />
              </ProtectedRoute>
            }
          >
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/complaints" element={<StudentComplaints />} />
            <Route path="/student/leave" element={<LeaveRequest />} />
            <Route path="/student/mess-menu" element={<MessMenu />} />
            <Route path="/student/room" element={<RoomDetails />} />
            <Route path="/student/emergency" element={<Emergency />} />
            <Route path="/student/profile" element={<Profile />} />
          </Route>

          {/* 🔐 WARDEN ROUTES */}
          <Route
            element={
              <ProtectedRoute role="warden">
                <DashboardLayout role="warden" />
              </ProtectedRoute>
            }
          >
            <Route path="/warden/dashboard" element={<WardenDashboard />} />
            <Route path="/warden/mess-menu" element={<MessMenu />} />
            <Route path="/warden/room-allotment" element={<RoomAllotment />} />
            <Route path="/warden/complaints" element={<ComplaintsManagement />} />
            <Route path="/warden/leave" element={<LeaveManagement />} />
            <Route path="/warden/notices" element={<NoticeManagement />} />
            <Route path="/warden/visitors" element={<VisitorManagement />} />
            <Route path="/warden/emergencies" element={<EmergencyManagement />} />
            <Route path="/warden/profile" element={<Profile />} />
          </Route>

          {/* 🔐 STAFF ROUTES */}
          <Route
            element={
              <ProtectedRoute role="staff">
                <DashboardLayout role="staff" />
              </ProtectedRoute>
            }
          >
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/profile" element={<Profile />} />
          </Route>

          {/* 🔐 CHIEF WARDEN ROUTES */}
          <Route
            element={
              <ProtectedRoute role="chief-warden">
                <DashboardLayout role="chief-warden" />
              </ProtectedRoute>
            }
          >
            <Route path="/chief-warden/dashboard" element={<ChiefWardenDashboard />} />
            <Route path="/chief-warden/escalations" element={<Escalations />} />
            <Route path="/chief-warden/wardens" element={<WardenOverview />} />
            <Route path="/chief-warden/complaints" element={<ComplaintsManagement />} />
            <Route path="/chief-warden/room-allotment" element={<RoomAllotment />} />
            <Route path="/chief-warden/leave" element={<LeaveManagement />} />
            <Route path="/chief-warden/notices" element={<NoticeManagement />} />
            <Route path="/chief-warden/emergencies" element={<EmergencyManagement />} />
            <Route path="/chief-warden/profile" element={<Profile />} />
          </Route>

          {/* ❌ 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;