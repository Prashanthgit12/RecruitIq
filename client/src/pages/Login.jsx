import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectParam = queryParams.get('redirect');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = redirectParam || location.state?.from?.pathname || (user.role === 'interviewer' ? '/interviewer-dashboard' : '/dashboard');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location, redirectParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      const from = redirectParam || location.state?.from?.pathname || (loggedUser.role === 'interviewer' ? '/interviewer-dashboard' : '/dashboard');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Glow Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-650/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-dark-900 border border-dark-850 rounded-3xl p-8 relative z-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
            <p className="text-dark-400 text-xs mt-1">Log in to enter your technical workspace</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2 mb-6 animate-shake">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Address */}
            <div>
              <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-800 focus:border-brand-500 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-800 focus:border-brand-500 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-700 disabled:opacity-75 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20"
            >
              <span>{isSubmitting ? 'Logging in...' : 'Sign In'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Redirect to registration */}
          <p className="text-center text-xs text-dark-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:underline font-semibold transition-all">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
