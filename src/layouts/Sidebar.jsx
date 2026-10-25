import { NavLink } from 'react-router-dom';
import {
  HiHome,
  HiUsers,
  HiAcademicCap,
  HiBookOpen,
  HiClipboardCheck,
  HiDocumentText,
  HiChartBar,
  HiUserCircle,
  HiLogout,
  HiX,
} from 'react-icons/hi';
import useAuth from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const navItems = [
    { to: '/dashboard', icon: HiHome, label: 'Dashboard', roles: ['admin', 'teacher', 'student'] },
    { to: '/students', icon: HiUsers, label: 'Students', roles: ['admin'] },
    { to: '/teachers', icon: HiAcademicCap, label: 'Teachers', roles: ['admin'] },
    { to: '/classes', icon: HiBookOpen, label: 'Classes', roles: ['admin', 'teacher', 'student'] },
    { to: '/subjects', icon: HiBookOpen, label: 'Subjects', roles: ['admin', 'teacher', 'student'] },
    { to: '/attendance', icon: HiClipboardCheck, label: 'Attendance', roles: ['admin', 'teacher', 'student'] },
    { to: '/reports', icon: HiChartBar, label: 'Reports', roles: ['admin', 'teacher'] },
    { to: '/assignments', icon: HiDocumentText, label: 'Assignments', roles: ['admin', 'teacher', 'student'] },
    { to: '/profile', icon: HiUserCircle, label: 'Profile', roles: ['admin', 'teacher', 'student'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-border z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
              <HiAcademicCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800 leading-tight">Smart Campus</h1>
              <p className="text-xs text-gray-500">Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-soft"
          >
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow'
                    : 'text-gray-600 hover:bg-soft hover:text-primary-600'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <HiLogout className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;