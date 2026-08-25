import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Terminal, Users, Timer, Shield, History, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated, user } = useAuth();

  const getStartedPath = () => {
    if (!isAuthenticated) return '/register';
    return user.role === 'interviewer' ? '/interviewer-dashboard' : '/dashboard';
  };

  const features = [
    {
      title: 'Live Coding',
      desc: 'Collaborative code writing powered by Monaco Editor supporting JS, Python, Java, and C++.',
      icon: Terminal,
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    },
    {
      title: 'Real-Time Sync',
      desc: 'Instant code updates and cursor sync between interviewer and candidate with zero delay via Socket.IO.',
      icon: Users,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Interview Timer',
      desc: 'Synchronized live countdown timers controlled by the interviewer with pause/resume support.',
      icon: Timer,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Scorecard & Feedback',
      desc: 'Secure ratings and final decision scorecards alongside auto-saving private notes.',
      icon: Shield,
      color: 'text-green-400 bg-green-500/10 border-green-500/20',
    },
    {
      title: 'Interview History',
      desc: 'Comprehensive logs of previous interview outcomes, scores, feedback notes, and final submitted code.',
      icon: History,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center items-center px-6 py-20 text-center relative overflow-hidden">
        {/* Glow Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-650/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-650/15 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl relative z-10">
          <span className="bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider mb-6 inline-block">
            Next-Gen Interviewing Platform
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Conduct Smarter <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Technical Interviews
            </span>
          </h1>
          <p className="text-dark-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Collaborate on a real-time coding editor, manage live synchronized timers, write private evaluation notes, and complete star ratings all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to={getStartedPath()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-brand-500/10 hover:shadow-brand-500/25 group cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {!isAuthenticated && (
              <Link
                to="/login"
                className="w-full sm:w-auto bg-dark-900 border border-dark-800 hover:bg-dark-800 text-white font-bold px-8 py-3.5 rounded-xl transition-colors cursor-pointer"
              >
                Login to Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="px-6 py-20 bg-dark-950 border-t border-dark-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white mb-4">Engineered for Technical Recruits</h2>
            <p className="text-dark-400 max-w-xl mx-auto">
              Everything you need to run smooth, interactive, and structured programming interviews.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-dark-900/40 border border-dark-850/60 p-6 rounded-2xl hover:border-dark-800 hover:bg-dark-900/80 transition-all flex flex-col gap-4 shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feature.color}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                  <p className="text-dark-400 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 border-t border-dark-900/60 py-8 px-6 text-center text-dark-500 text-xs">
        <p>© 2026 RecruitIQ Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
