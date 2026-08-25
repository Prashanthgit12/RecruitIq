import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { AlertCircle, Lock, Mail, User, ShieldAlert, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('candidate'); // default
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const target = user.role === 'interviewer' ? '/interviewer-dashboard' : '/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const registeredUser = await register(name, email, password, confirmPassword, role, passcode);
      const target = registeredUser.role === 'interviewer' ? '/interviewer-dashboard' : '/dashboard';
      navigate(target, { replace: true });
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
            <h2 className="text-2xl font-extrabold text-white">Create Account</h2>
            <p className="text-dark-400 text-xs mt-1">Join the Smart Interview platform today</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2 mb-6 animate-shake">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-800 focus:border-brand-500 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

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

            {/* Role dropdown */}
            <div>
              <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Account Role</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500">
                  <ShieldAlert size={16} />
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-800 focus:border-brand-500 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="candidate">Candidate (Test Taker)</option>
                  <option value="interviewer">Interviewer (Host/Recruiter)</option>
                </select>
              </div>
            </div>

            {/* Recruiter Access Passcode Check (Conditionally rendered) */}
            {role === 'interviewer' && (
              <div>
                <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Recruiter Access Passcode</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-800 focus:border-brand-500 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors"
                    placeholder="Enter interviewer access code"
                  />
                </div>
              </div>
            )}

            {/* Passwords grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-800 focus:border-brand-500 text-white text-sm rounded-xl pl-9 pr-3 py-3 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-800 focus:border-brand-500 text-white text-sm rounded-xl pl-9 pr-3 py-3 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-700 disabled:opacity-75 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/10"
            >
              <span>{isSubmitting ? 'Registering...' : 'Sign Up'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Redirect to login */}
          <p className="text-center text-xs text-dark-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:underline font-semibold transition-all">
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
