import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, History, Award, User, Terminal } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return user.role === 'interviewer' ? '/interviewer-dashboard' : '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-md border-b border-dark-800 px-6 py-4 flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
          <Terminal size={22} className="stroke-[2.5]" />
        </div>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-dark-100 to-brand-400 bg-clip-text text-transparent">
          RecruitIQ
        </span>
      </Link>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            {/* Dashboard Link */}
            <Link
              to={getDashboardLink()}
              className="hidden sm:flex items-center gap-2 text-dark-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-dark-900"
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>

            {/* History Link */}
            <Link
              to="/history"
              className="hidden sm:flex items-center gap-2 text-dark-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-dark-900"
            >
              <History size={16} />
              <span>History</span>
            </Link>

            {/* User details badge */}
            <div className="flex items-center gap-3 bg-dark-900 border border-dark-800 px-3 py-1.5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center text-brand-400 font-bold border border-dark-700">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                <span className="text-[10px] text-brand-400 capitalize font-medium">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center justify-center w-9 h-9 text-dark-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-dark-300 hover:text-white text-sm font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
