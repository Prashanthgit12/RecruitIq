import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, History, BarChart3, BookOpen } from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/';
    return user.role === 'interviewer' ? '/interviewer-dashboard' : '/dashboard';
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: getDashboardLink(),
      icon: LayoutDashboard,
    },
    {
      name: 'Interview History',
      path: '/history',
      icon: History,
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
    },
  ];

  if (user && user.role === 'interviewer') {
    navItems.push({
      name: 'Question Bank',
      path: '/questions',
      icon: BookOpen,
    });
  }

  return (
    <aside className="w-64 bg-dark-950 border-r border-dark-800 min-h-[calc(100vh-73px)] hidden md:flex flex-col p-4 justify-between">
      {/* Navigation Links */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase font-bold text-dark-500 tracking-wider px-3 mb-2">
          Navigation Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand-600/10 text-brand-400 border-l-4 border-brand-500 pl-2'
                    : 'text-dark-400 hover:bg-dark-900 hover:text-white border-l-4 border-transparent'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Profile Sidebar Footer */}
      {user && (
        <div className="bg-dark-900/50 border border-dark-800/60 p-3.5 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-brand-500/10 border border-brand-400/20">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-white truncate">{user.name}</h4>
              <p className="text-[10px] text-dark-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-dark-800/80 my-1"></div>
          <span className="text-[9px] bg-brand-500/10 border border-brand-500/20 text-brand-400 font-semibold px-2 py-0.5 rounded-full self-start capitalize">
            Role: {user.role}
          </span>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
