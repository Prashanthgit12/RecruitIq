import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { Calendar, CheckCircle2, ListCollapse, Award, Plus, Copy, Link, Search, X, Loader, Trash2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const InterviewerDashboard = () => {
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, selected: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null); // stores roomId and link details on success
  const [error, setError] = useState(null);
  const [editingInterview, setEditingInterview] = useState(null);

  // Form states
  const [form, setForm] = useState({
    title: '',
    candidateEmail: '',
    date: '',
    time: '',
    durationMinutes: 60,
    programmingLanguage: 'javascript',
    questionTitle: '',
    questionDescription: '',
    difficulty: 'Medium',
  });

  const [questionBank, setQuestionBank] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');

  const navigate = useNavigate();
  const { socket, connected } = useSocket();

  const fetchDashboardData = async () => {
    try {
      const [statsRes, upcomingRes] = await Promise.all([
        api.get('/interviews/stats'),
        api.get('/interviews/interviewer/upcoming'),
      ]);
      setStats(statsRes.data);
      setUpcoming(upcomingRes.data);
    } catch (err) {
      console.error('Error loading interviewer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Load question bank on mount
    api.get('/questions')
      .then(res => setQuestionBank(res.data))
      .catch(err => console.error('Error fetching question bank:', err));
  }, []);

  useEffect(() => {
    if (socket && connected) {
      const handleStatusUpdate = (data) => {
        console.log('📡 Real-time interview status update received:', data);
        fetchDashboardData();
      };

      socket.on('interview-status-update', handleStatusUpdate);

      return () => {
        socket.off('interview-status-update', handleStatusUpdate);
      };
    }
  }, [socket, connected]);

  const handleOpenModal = () => {
    setError(null);
    setCreatedRoom(null);
    setSelectedQuestionId('');
    setIsOpen(true);
    // Refresh question bank options
    api.get('/questions')
      .then(res => setQuestionBank(res.data))
      .catch(err => console.error('Error updating question bank options:', err));
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setEditingInterview(null);
    fetchDashboardData(); // Refresh list on close
  };

  const handleOpenReschedule = (session) => {
    setError(null);
    setCreatedRoom(null);
    setEditingInterview(session);
    
    // Parse scheduled date/time
    const d = new Date(session.scheduled_at);
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setForm({
      title: session.title,
      candidateEmail: session.candidate_email || '',
      date: dateStr,
      time: timeStr,
      durationMinutes: session.duration_minutes || 60,
      programmingLanguage: session.programming_language || 'javascript',
      questionTitle: session.question_title || '',
      questionDescription: session.question_description || '',
      difficulty: session.difficulty || 'Medium'
    });
    setIsOpen(true);
  };

  const handleQuestionSelect = (e) => {
    const qId = e.target.value;
    setSelectedQuestionId(qId);
    if (qId) {
      const q = questionBank.find(x => x.id === parseInt(qId));
      if (q) {
        setForm(prev => ({
          ...prev,
          questionTitle: q.title,
          questionDescription: q.description,
          difficulty: q.difficulty,
          programmingLanguage: q.programming_language || prev.programmingLanguage
        }));
      }
    } else {
      setForm(prev => ({
        ...prev,
        questionTitle: '',
        questionDescription: '',
        difficulty: 'Medium',
      }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);

    const scheduledAt = new Date(`${form.date}T${form.time}:00`).toISOString();

    try {
      const payload = {
        title: form.title,
        candidateEmail: form.candidateEmail,
        scheduledAt,
        durationMinutes: form.durationMinutes,
        programmingLanguage: form.programmingLanguage,
        questionTitle: form.questionTitle,
        questionDescription: form.questionDescription,
        difficulty: form.difficulty,
      };

      if (editingInterview) {
        // Reschedule
        await api.put(`/interviews/${editingInterview.id}`, payload);
        alert('✓ Interview rescheduled successfully');
        setEditingInterview(null);
        handleCloseModal();
      } else {
        // Create
        const res = await api.post('/interviews', payload);
        const hostUrl = window.location.origin;
        const joinLink = `${hostUrl}/interview/room/${res.data.interview.room_id}`;
        
        setCreatedRoom({
          roomId: res.data.interview.room_id,
          link: joinLink,
          title: res.data.interview.title,
          date: form.date,
          time: form.time,
          duration: form.durationMinutes
        });
      }

      // Clear form
      setForm({
        title: '',
        candidateEmail: '',
        date: '',
        time: '',
        durationMinutes: 60,
        programmingLanguage: 'javascript',
        questionTitle: '',
        questionDescription: '',
        difficulty: 'Medium',
      });
    } catch (err) {
      console.error('Create/Reschedule interview error:', err);
      setError(err.response?.data?.message || 'Failed to complete interview action.');
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm('⚠️ Are you sure you want to cancel and delete this scheduled interview?')) {
      try {
        await api.delete(`/interviews/${id}`);
        alert('✓ Interview cancelled and deleted successfully.');
        fetchDashboardData();
      } catch (err) {
        console.error('Delete interview error:', err);
        alert(err.response?.data?.message || 'Failed to cancel interview. Please try again.');
      }
    }
  };
  const handleCopyLink = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom.link);
      alert('✓ Interview link copied');
    }
  };

  const handleWhatsAppShare = () => {
    if (createdRoom) {
      const text = encodeURIComponent(`Hi,

You are invited to a technical interview.

Interview:
${createdRoom.title}

Date:
${formatDate(createdRoom.date)}

Time:
${formatTime(`${createdRoom.date}T${createdRoom.time}:00`)}

Duration:
${createdRoom.duration} minutes

Please join using this link:

${createdRoom.link}

Thank you.`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const handleEmailShare = () => {
    if (createdRoom) {
      const subject = encodeURIComponent(`Interview Invitation – ${createdRoom.title}`);
      const body = encodeURIComponent(`Hello,

You have been invited to a technical interview.

Interview:
${createdRoom.title}

Date:
${formatDate(createdRoom.date)}

Time:
${formatTime(`${createdRoom.date}T${createdRoom.time}:00`)}

Duration:
${createdRoom.duration} minutes

Join Interview:
${createdRoom.link}

Please join a few minutes before the scheduled time.

RecruitIQ`);
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
  };

  const handleShare = async () => {
    if (createdRoom) {
      const shareData = {
        title: 'Interview Invitation',
        text: `Interview Invitation\n\nInterview: ${createdRoom.title}\nDate: ${formatDate(createdRoom.date)}\nTime: ${formatTime(`${createdRoom.date}T${createdRoom.time}:00`)}\nDuration: ${createdRoom.duration} minutes\n\nJoin Link:\n${createdRoom.link}`,
        url: createdRoom.link
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.warn('Share api failed, falling back to copy.', err);
          handleCopyLink();
        }
      } else {
        handleCopyLink();
      }
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Interviewer Dashboard</h1>
              <p className="text-dark-400 text-xs mt-1">Schedule programming tests, join live panels, and assess candidates.</p>
            </div>
            
            <button
              onClick={handleOpenModal}
              className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/15"
            >
              <Plus size={14} />
              <span>Schedule Interview</span>
            </button>
          </div>

          {/* Stats widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
                <Calendar size={18} />
              </div>
              <div>
                <span className="text-[9px] text-dark-500 uppercase font-bold tracking-wider block">Upcoming</span>
                <h3 className="text-xl font-black text-white leading-tight mt-0.5">{stats.upcoming}</h3>
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <span className="text-[9px] text-dark-500 uppercase font-bold tracking-wider block">Completed</span>
                <h3 className="text-xl font-black text-white leading-tight mt-0.5">{stats.completed}</h3>
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <ListCollapse size={18} />
              </div>
              <div>
                <span className="text-[9px] text-dark-500 uppercase font-bold tracking-wider block">Total Rooms</span>
                <h3 className="text-xl font-black text-white leading-tight mt-0.5">{stats.total}</h3>
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/20">
                <Award size={18} />
              </div>
              <div>
                <span className="text-[9px] text-dark-500 uppercase font-bold tracking-wider block">Hired</span>
                <h3 className="text-xl font-black text-white leading-tight mt-0.5">{stats.selected}</h3>
              </div>
            </div>
          </div>

          {/* Upcoming Interview List */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Scheduled Interviews</h2>
            {upcoming.length === 0 ? (
              <div className="bg-dark-900/40 border border-dark-850 border-dashed p-8 rounded-2xl text-center">
                <Calendar size={32} className="mx-auto text-dark-500 mb-3" />
                <p className="text-xs text-dark-400 italic">No scheduled interviews. Click "Schedule Interview" to get started.</p>
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
                      <p className="text-xs text-dark-400 mt-2">Candidate: <span className="text-white font-medium">{session.candidate_name}</span> ({session.candidate_email})</p>
                      
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

                    <div className="flex items-center justify-between mt-3.5 mb-1.5 w-full">
                      {session.status === 'waiting' || session.status === 'active' ? (
                        <div className="flex items-center gap-1 text-[11px] text-green-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                          <span>Candidate has joined</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-yellow-500 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                          <span>Waiting for candidate</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => navigate(`/room/${session.room_id}`)}
                        className="flex-grow bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-brand-500/10"
                      >
                        <Plus size={12} />
                        <span>Enter Interview Room</span>
                      </button>
                      <button
                        onClick={() => {
                          const inviteLink = `${window.location.origin}/interview/room/${session.room_id}`;
                          navigator.clipboard.writeText(inviteLink);
                          alert('✓ Interview link copied');
                        }}
                        className="bg-dark-800 border border-dark-700 hover:bg-dark-700 text-white p-2.5 rounded-xl transition-colors cursor-pointer"
                        title="Copy Invitation Link"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenReschedule(session)}
                        className="bg-dark-800 border border-dark-700 hover:bg-dark-700 text-brand-400 p-2.5 rounded-xl transition-colors cursor-pointer"
                        title="Reschedule Interview"
                      >
                        <Calendar size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 p-2.5 rounded-xl transition-all cursor-pointer"
                        title="Cancel & Delete Interview"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SCHEDULE INTERVIEW MODAL POPUP */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-dark-900 border border-dark-850 rounded-3xl p-6 md:p-8 overflow-y-auto max-h-[90vh] shadow-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-dark-400 hover:text-white p-1 rounded-lg hover:bg-dark-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">
              {editingInterview ? 'Reschedule Technical Interview' : 'Schedule Technical Interview'}
            </h2>
            <p className="text-xs text-dark-400 mb-6">
              {editingInterview ? 'Modify date, timings, or parameters for this scheduled session.' : 'Create a room code and schedule a session with a candidate.'}
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
                <span>{error}</span>
              </div>
            )}

            {createdRoom ? (
              /* Success screen inside modal */
              <div className="bg-green-500/5 border border-green-500/20 p-5 rounded-2xl text-center flex flex-col gap-4">
                <CheckCircle2 size={36} className="text-green-400 mx-auto" />
                <div>
                  <h3 className="font-bold text-base text-white">Interview scheduled successfully!</h3>
                  <p className="text-xs text-dark-400 mt-1">Copy and share the following link with the candidate to join.</p>
                </div>

                <div className="flex items-center gap-2 bg-dark-950 p-3 rounded-xl border border-dark-850 mt-2">
                  <span className="text-xs text-dark-300 truncate flex-grow text-left font-mono">{createdRoom.link}</span>
                  <button
                    onClick={handleCopyLink}
                    className="bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Copy size={10} />
                    <span>Copy</span>
                  </button>
                </div>

                <div className="flex gap-2 justify-center mt-1">
                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="bg-green-650 hover:bg-green-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={handleEmailShare}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="bg-dark-800 hover:bg-dark-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-dark-700 transition-colors cursor-pointer"
                  >
                    Share
                  </button>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => navigate(`/room/${createdRoom.roomId}`)}
                    className="flex-grow bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Join Room Now
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-grow bg-dark-800 border border-dark-700 hover:bg-dark-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Scheduling Form */
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Interview Title</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-brand-500"
                      placeholder="Senior Frontend Developer Panel"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Candidate Email</label>
                    <input
                      type="email"
                      required
                      value={form.candidateEmail}
                      onChange={(e) => setForm({ ...form, candidateEmail: e.target.value })}
                      className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-brand-500"
                      placeholder="candidate@gmail.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Date</label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Start Time</label>
                    <input
                      type="time"
                      required
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
                    />
                    <span className="text-[9px] text-dark-500 mt-1 block">Enter 24h format (e.g. 17:30 for 5:30 PM)</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Duration (Minutes)</label>
                    <input
                      type="number"
                      required
                      value={form.durationMinutes === '' ? '' : form.durationMinutes}
                      onChange={(e) => setForm({ ...form, durationMinutes: e.target.value === '' ? '' : parseInt(e.target.value) })}
                      className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/10"
                >
                  <Plus size={14} />
                  <span>{editingInterview ? 'Update & Save Changes' : 'Create & Generate Invite Link'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerDashboard;
