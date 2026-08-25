import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { Search, Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const InterviewHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Query parameters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('completed'); // Default to completed
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit,
      };

      const res = await api.get('/history', { params });
      setHistory(res.data.results);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset page to 1
    fetchHistory();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('completed');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col text-white">
      <Navbar />

      <div className="flex flex-grow">
        <Sidebar />

        <main className="flex-grow p-6 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Interview History</h1>
            <p className="text-dark-400 text-xs mt-1">Search and filter logs of your completed technical evaluations.</p>
          </div>

          {/* Filtering UI Bar */}
          <div className="bg-dark-900 border border-dark-850 p-4 rounded-2xl flex flex-col gap-4">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search text query */}
              <div className="relative md:col-span-2">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  placeholder={user.role === 'interviewer' ? "Search candidates or interview title..." : "Search title or interviewer..."}
                />
              </div>

              {/* Status query */}
              <div>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="completed">Completed Only</option>
                  <option value="scheduled">Scheduled / Active</option>
                  <option value="all">All Sessions</option>
                </select>
              </div>

              {/* Submit search button */}
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
              >
                Apply Filters
              </button>
            </form>

            <div className="flex flex-wrap gap-4 items-center justify-between border-t border-dark-850 pt-3">
              {/* Date pickers */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-dark-500 font-bold uppercase text-[9px]">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                    className="bg-dark-950 border border-dark-800 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-dark-500 font-bold uppercase text-[9px]">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="bg-dark-950 border border-dark-800 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none"
                  />
                </div>
              </div>

              {/* Reset button */}
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[10px] uppercase font-bold text-dark-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw size={10} />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>

          {/* Results table */}
          {loading ? (
            <div className="bg-dark-900 border border-dark-850 p-12 rounded-2xl text-center">
              <RefreshCw size={24} className="text-brand-500 animate-spin mx-auto mb-3" />
              <span className="text-xs text-dark-400">Filtering history database...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-dark-900 border border-dark-850 p-12 rounded-2xl text-center">
              <p className="text-xs text-dark-500 italic">No interview records matched current filter queries.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-dark-900 border border-dark-850 rounded-2xl overflow-hidden shadow-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark-950 text-[10px] font-bold text-dark-500 uppercase tracking-wider border-b border-dark-850">
                      <th className="px-5 py-3">Title</th>
                      <th className="px-5 py-3">
                        {user.role === 'interviewer' ? 'Candidate' : 'Interviewer'}
                      </th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Status</th>
                      {user.role === 'interviewer' && <th className="px-5 py-3">Score</th>}
                      <th className="px-5 py-3">Result</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-850 text-xs font-medium text-dark-200">
                    {history.map((session) => (
                      <tr key={session.id} className="hover:bg-dark-900/50">
                        <td className="px-5 py-4 font-bold text-white">{session.title}</td>
                        <td className="px-5 py-4">
                          {user.role === 'interviewer' ? session.candidate_name : session.interviewer_name}
                        </td>
                        <td className="px-5 py-4">{formatDate(session.scheduled_at)}</td>
                        <td className="px-5 py-4">
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-dark-850 text-dark-300 border border-dark-800">
                            {session.status}
                          </span>
                        </td>
                        {user.role === 'interviewer' && (
                          <td className="px-5 py-4">
                            {session.overall_rating ? `${session.overall_rating} / 5` : '--'}
                          </td>
                        )}
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
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-dark-400 bg-dark-900 border border-dark-850 px-4 py-3 rounded-2xl">
                  <span>Showing page {page} of {totalPages} (Total: {total} logs)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-1.5 border border-dark-800 bg-dark-950 rounded-lg hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-1.5 border border-dark-800 bg-dark-950 rounded-lg hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InterviewHistory;
