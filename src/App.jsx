import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentForm from './pages/StudentForm';
import Teachers from './pages/Teachers';
import TeacherForm from './pages/TeacherForm';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Assignments from './pages/Assignments';
import AssignmentForm from './pages/AssignmentForm';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin only */}
            <Route
              path="/students"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/new"
              element={
                <ProtectedRoute roles={['admin']}>
                  <StudentForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/edit/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <StudentForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Teachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers/new"
              element={
                <ProtectedRoute roles={['admin']}>
                  <TeacherForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers/edit/:id"
              element={
                <ProtectedRoute roles={['admin']}>
                  <TeacherForm />
                </ProtectedRoute>
              }
            />
            <Route path="/classes" element={<Classes />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route
              path="/reports"
              element={
                <ProtectedRoute roles={['admin', 'teacher']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route path="/assignments" element={<Assignments />} />
            <Route
              path="/assignments/new"
              element={
                <ProtectedRoute roles={['admin', 'teacher']}>
                  <AssignmentForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/edit/:id"
              element={
                <ProtectedRoute roles={['admin', 'teacher']}>
                  <AssignmentForm />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;