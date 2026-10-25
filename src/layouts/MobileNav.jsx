import { NavLink } from 'react-router-dom';
import { HiHome, HiBookOpen, HiClipboardCheck, HiDocumentText, HiUserCircle } from 'react-icons/hi';

const MobileNav = () => {
  const items = [
    { to: '/dashboard', icon: HiHome, label: 'Home' },
    { to: '/classes', icon: HiBookOpen, label: 'Classes' },
    { to: '/attendance', icon: HiClipboardCheck, label: 'Attendance' },
    { to: '/assignments', icon: HiDocumentText, label: 'Tasks' },
    { to: '/profile', icon: HiUserCircle, label: 'Profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-30 shadow-card">
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2 px-3 flex-1 transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;