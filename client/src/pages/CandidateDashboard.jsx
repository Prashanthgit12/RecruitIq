import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { Calendar, CheckCircle2, ListCollapse, Play, Video, Loader } from 'lucide-react';

const CandidateDashboard = () => {
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, upcomingRes, historyRes] = await Promise.all([
          api.get('/interviews/stats'),
          api.get('/interviews/candidate/upcoming'),
          api.get('/interviews/candidate/history'),
        ]);

        setStats(statsRes.data);
        setUpcoming(upcomingRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error('Error fetching candidate dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getResultBadge = (result) => {
    switch (result) {
      case 'selected':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'on_hold':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      default:
        return 'bg-dark-800 text-dark-400 border border-dark-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-white">
          <Loader size={36} className="animate-spin text-brand-500" />
          <span className="ml-3 font-semibold text-dark-300">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Navbar />

      <div className="flex flex-grow">
        <Sidebar />

        {/* Main Dashboard Space */}
        <main className="flex-grow p-6 md:p-8 flex flex-col gap-8 max-w-6xl mx-auto w-full">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Candidate Dashboard</h1>
            <p className="text-dark-400 text-xs mt-1">Review upcoming schedules and completed interview files.</p>
          </div>

          {/* Stats widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
                <Calendar size={22} />
              </div>
              <div>
                <span className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Scheduled Sessions</span>
                <h3 className="text-2xl font-black text-white mt-0.5">{stats.upcoming}</h3>
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Completed Sessions</span>
                <h3 className="text-2xl font-black text-white mt-0.5">{stats.completed}</h3>
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <ListCollapse size={22} />
              </div>
              <div>
                <span className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Total Registrations</span>
                <h3 className="text-2xl font-black text-white mt-0.5">{stats.total}</h3>
              </div>
            </div>
          </div>

          {/* Upcoming Interview Cards */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Upcoming Interviews</h2>
            {upcoming.length === 0 ? (
              <div className="bg-dark-900/40 border border-dark-850 border-dashed p-8 rounded-2xl text-center">
                <Video size={32} className="mx-auto text-dark-500 mb-3" />
                <p className="text-xs text-dark-400 italic">No upcoming interviews scheduled yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {upcoming.map((session) => (
                  <div
                    key={session.id}
                    className="bg-dark-900 border border-dark-850 rounded-2xl p-5 hover:border-dark-800 transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-white leading-snug">{session.title}</h3>
                        <span className="text-[9px] uppercase font-extrabold bg-brand-500/10 border border-brand-500/25 text-brand-400 px-2 py-0.5 rounded">
                          {session.status}
                        </span>
                      </div>
                      <p className="text-xs text-dark-400 mt-2">Interviewer: <span className="text-white font-medium">{session.interviewer_name}</span></p>
                      
                      <div className="flex items-center gap-4 mt-3 bg-dark-950 p-3 rounded-xl border border-dark-850 text-xs">
                        <div>
                          <span className="text-[9px] font-bold text-dark-500 uppercase block">Date</span>
                          <span className="text-white font-medium mt-0.5 block">{formatDate(session.scheduled_at)}</span>
                        </div>
                        <div className="border-l border-dark-800 pl-4">
                          <span className="text-[9px] font-bold text-dark-500 uppercase block">Start Time</span>
                          <span className="text-white font-medium mt-0.5 block">{formatTime(session.scheduled_at)}</span>
                        </div>
                        <div className="border-l border-dark-800 pl-4">
                          <span className="text-[9px] font-bold text-dark-500 uppercase block">Duration</span>
                          <span className="text-white font-medium mt-0.5 block">{session.duration_minutes} Mins</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/room/${session.room_id}`)}
                      className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/10"
                    >
                      <Play size={12} fill="white" />
                      <span>Join Interview Room</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History List */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Completed History</h2>
            {history.length === 0 ? (
              <div className="bg-dark-900/40 border border-dark-850 p-6 rounded-2xl text-center text-xs text-dark-500 italic">
                No past interview history recorded.
              </div>
            ) : (
              <div className="bg-dark-900 border border-dark-850 rounded-2xl overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-dark-950 text-[10px] font-bold text-dark-500 uppercase tracking-wider border-b border-dark-850">
                        <th className="px-5 py-3">Interview Title</th>
                        <th className="px-5 py-3">Interviewer</th>
                        <th className="px-5 py-3">Completed Date</th>
                        <th className="px-5 py-3">Hiring Decision</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-850 text-xs font-medium text-dark-200">
                      {history.map((session) => (
                        <tr key={session.id} className="hover:bg-dark-900/50">
                          <td className="px-5 py-4 font-bold text-white">{session.title}</td>
                          <td className="px-5 py-4">{session.interviewer_name}</td>
                          <td className="px-5 py-4">{formatDate(session.scheduled_at)}</td>
                          <td className="px-5 py-4">
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${getResultBadge(session.result)}`}>
                              {session.result ? session.result.replace('_', ' ') : 'Pending'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => navigate(`/details/${session.id}`)}
                              className="bg-dark-800 border border-dark-700 hover:bg-dark-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CandidateDashboard;
