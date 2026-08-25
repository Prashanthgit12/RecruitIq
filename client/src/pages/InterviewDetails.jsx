import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import Editor from '@monaco-editor/react';
import { Calendar, User, Clock, ShieldCheck, FileCode, Star, AlertTriangle, Loader, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CRITERIA = [
  { key: 'communication_rating', label: 'Communication Skills' },
  { key: 'problem_solving_rating', label: 'Problem Solving' },
  { key: 'coding_rating', label: 'Coding Skills' },
  { key: 'technical_rating', label: 'Technical Knowledge' },
  { key: 'overall_rating', label: 'Overall Performance' },
];

const InterviewDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [notes, setNotes] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCodeTab, setActiveCodeTab] = useState('round6');

  useEffect(() => {
    const fetchAllDetails = async () => {
      setLoading(true);
      try {
        // 1. Fetch main interview details
        const interviewRes = await api.get(`/interviews/${id}`);
        setInterview(interviewRes.data);

        // 2. Fetch code submission (if any)
        try {
          const codeRes = await api.get(`/code/${id}`);
          setSubmission(codeRes.data);
        } catch (codeErr) {
          // If no code submitted, set to null
          setSubmission(null);
        }

        // 3. Fetch evaluation (if exists)
        try {
          const evalRes = await api.get(`/evaluations/${id}`);
          setEvaluation(evalRes.data);
        } catch (evalErr) {
          setEvaluation(null);
        }

        // 4. Fetch private notes (Interviewer only)
        if (user.role === 'interviewer') {
          try {
            const notesRes = await api.get(`/notes/${id}`);
            setNotes(notesRes.data);
          } catch (notesErr) {
            setNotes(null);
          }
        }
      } catch (err) {
        console.error('Error fetching interview details page:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAllDetails();
    }
  }, [id, user.role]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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
          <span className="ml-3 font-semibold text-dark-300">Retrieving completed file details...</span>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-6 text-center">
          <div className="bg-dark-900 border border-dark-850 p-8 rounded-3xl max-w-sm w-full">
            <AlertTriangle size={36} className="text-red-500 mx-auto mb-3" />
            <h2 className="text-white font-bold">Interview File Missing</h2>
            <p className="text-xs text-dark-400 mt-1">This report could not be found or has been deleted.</p>
            <button
              onClick={() => navigate(user.role === 'interviewer' ? '/interviewer-dashboard' : '/dashboard')}
              className="mt-5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-6 py-2 rounded-xl transition-all cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col text-white">
      <Navbar />

      <div className="flex flex-grow">
        <Sidebar />

        <main className="flex-grow p-6 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto w-full">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Evaluation Report</h1>
            <p className="text-dark-400 text-xs mt-1">Completed scorecard, review logs, and submitted codebase summary.</p>
          </div>

          {/* Quick Summary Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl md:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Interview Title</span>
                <h2 className="text-lg font-bold text-white">{interview.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-dark-400 mt-1">
                  <span className="flex items-center gap-1">
                    <User size={13} className="text-brand-400" />
                    <span>{user.role === 'interviewer' ? `Candidate: ${interview.candidate_name}` : `Interviewer: ${interview.interviewer_name}`}</span>
                  </span>
                  <span className="text-dark-700">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-brand-400" />
                    <span>{formatDate(interview.scheduled_at)}</span>
                  </span>
                  <span className="text-dark-700">•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-brand-400" />
                    <span>Duration: {interview.duration_minutes} mins</span>
                  </span>
                </div>
              </div>

              {/* Recruitment outcome */}
              <div className="flex flex-col gap-1 sm:text-right shrink-0">
                <span className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Outcome Decision</span>
                <span className={`text-xs uppercase font-extrabold px-3 py-1.5 rounded-xl border mt-1 select-none inline-block ${
                  getResultBadge(evaluation?.result)
                }`}>
                  {evaluation ? evaluation.result.replace('_', ' ') : 'Pending evaluation'}
                </span>
              </div>
            </div>

            {/* Scorecard average (Interviewer only) */}
            {user.role === 'interviewer' && evaluation && (
              <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex flex-col justify-center items-center text-center">
                <span className="text-[10px] text-dark-500 uppercase font-bold tracking-wider">Overall score</span>
                <div className="flex items-center gap-1 text-2xl font-black text-brand-400 mt-1">
                  <span>{evaluation.overall_rating}</span>
                  <span className="text-xs text-dark-500">/ 5</span>
                </div>
                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={star <= evaluation.overall_rating ? 'fill-brand-450 text-brand-400' : 'text-dark-800'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7-Round NQT Assessment Scorecard */}
          <div className="bg-dark-900 border border-dark-850 p-6 rounded-2xl flex flex-col gap-4 shadow-lg">
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider border-b border-dark-850 pb-3 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-brand-400" />
              <span>7-Round NQT Assessment Scorecard</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {/* Round 1 */}
              <div className="bg-dark-950 p-4 rounded-xl border border-dark-850 flex flex-col justify-between h-28">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-dark-500 block">Round 1</span>
                  <span className="text-xs font-bold text-white block mt-0.5 leading-snug">Numerical Ability</span>
                </div>
                <span className="text-sm font-black text-brand-400 mt-2 font-mono">
                  {interview.round1_score !== null ? `${interview.round1_score} / 20` : '⏳ Not Taken'}
                </span>
              </div>

              {/* Round 2 */}
              <div className="bg-dark-950 p-4 rounded-xl border border-dark-850 flex flex-col justify-between h-28">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-dark-500 block">Round 2</span>
                  <span className="text-xs font-bold text-white block mt-0.5 leading-snug">Verbal Ability</span>
                </div>
                <span className="text-sm font-black text-brand-400 mt-2 font-mono">
                  {interview.round2_score !== null ? `${interview.round2_score} / 25` : '⏳ Not Taken'}
                </span>
              </div>

              {/* Round 3 */}
              <div className="bg-dark-950 p-4 rounded-xl border border-dark-850 flex flex-col justify-between h-28">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-dark-500 block">Round 3</span>
                  <span className="text-xs font-bold text-white block mt-0.5 leading-snug">Reasoning Ability</span>
                </div>
                <span className="text-sm font-black text-brand-400 mt-2 font-mono">
                  {interview.round3_score !== null ? `${interview.round3_score} / 20` : '⏳ Not Taken'}
                </span>
              </div>

              {/* Round 4 */}
              <div className="bg-dark-950 p-4 rounded-xl border border-dark-850 flex flex-col justify-between h-28">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-dark-500 block">Round 4</span>
                  <span className="text-xs font-bold text-white block mt-0.5 leading-snug">Advanced Quant</span>
                </div>
                <span className="text-sm font-black text-brand-400 mt-2 font-mono">
                  {interview.round4_score !== null ? `${interview.round4_score} / 10` : '⏳ Not Taken'}
                </span>
              </div>

              {/* Round 5 */}
              <div className="bg-dark-950 p-4 rounded-xl border border-dark-850 flex flex-col justify-between h-28">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-dark-500 block">Round 5</span>
                  <span className="text-xs font-bold text-white block mt-0.5 leading-snug">Advanced Reasoning</span>
                </div>
                <span className="text-sm font-black text-brand-400 mt-2 font-mono">
                  {interview.round5_score !== null ? `${interview.round5_score} / 10` : '⏳ Not Taken'}
                </span>
              </div>

              {/* Round 6 */}
              <div className="bg-dark-950 p-4 rounded-xl border border-dark-850 flex flex-col justify-between h-28">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-dark-500 block">Round 6</span>
                  <span className="text-xs font-bold text-white block mt-0.5 leading-snug">Coding Easy</span>
                </div>
                <span className="text-sm font-black text-brand-400 mt-2 font-mono">
                  {interview.round6_score !== null ? `${interview.round6_score} Passed` : '⏳ Not Taken'}
                </span>
              </div>

              {/* Round 7 */}
              <div className="bg-dark-950 p-4 rounded-xl border border-dark-850 flex flex-col justify-between h-28">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-dark-500 block">Round 7</span>
                  <span className="text-xs font-bold text-white block mt-0.5 leading-snug">Coding Hard</span>
                </div>
                <span className="text-sm font-black text-brand-400 mt-2 font-mono">
                  {interview.round7_score !== null ? `${interview.round7_score} Passed` : '⏳ Not Taken'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side column: Scorecard criteria detail breakdown */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Evaluated Ratings details */}
              {evaluation && user.role === 'interviewer' && (
                <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
                  <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-dark-850 pb-2">Skills Ratings</h3>
                  <div className="flex flex-col gap-3">
                    {CRITERIA.map((criterion) => {
                      const ratingVal = evaluation[criterion.key];
                      return (
                        <div key={criterion.key} className="flex items-center justify-between">
                          <span className="text-xs text-dark-300 font-medium">{criterion.label}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={star <= ratingVal ? 'fill-brand-400 text-brand-400' : 'text-dark-800'}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Feedback comments */}
              {evaluation && (
                <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
                  <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-dark-850 pb-2">Feedback Summary</h3>
                  {user.role === 'interviewer' ? (
                    <p className="text-xs text-dark-300 leading-relaxed whitespace-pre-wrap">{evaluation.feedback}</p>
                  ) : (
                    <div>
                      <p className="text-xs text-dark-300 leading-relaxed">
                        🎉 Interview completed. Thank you for taking the time to test your programming skills on our platform. 
                      </p>
                      <p className="text-xs text-brand-400 mt-2 font-medium">
                        Outcome status shared by recruiter: <span className="capitalize">{evaluation.result.replace('_', ' ')}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Private Notes (Interviewer only) */}
              {user.role === 'interviewer' && notes && (
                <div className="bg-dark-900 border border-dark-850 p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
                  <h3 className="font-bold text-xs text-white uppercase tracking-wider border-b border-dark-850 pb-2 flex items-center gap-1 text-yellow-400">
                    <ShieldCheck size={14} />
                    <span>Private Notes</span>
                  </h3>
                  <p className="text-xs text-dark-300 leading-relaxed whitespace-pre-wrap italic">
                    {notes.notes || 'No private notes saved.'}
                  </p>
                </div>
              )}
            </div>

            {/* Right side column: Final Submitted Code codebase */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-dark-900 border border-dark-850 rounded-2xl overflow-hidden flex flex-col h-[400px] shadow-sm">
                <div className="bg-dark-950 px-4 py-2.5 border-b border-dark-850 flex items-center justify-between">
                  <span className="text-xs font-bold text-dark-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode size={14} className="text-brand-400" />
                    <span>Submitted Code</span>
                  </span>
                  
                  {/* Code tab switcher */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveCodeTab('round6')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                        activeCodeTab === 'round6' 
                          ? 'bg-brand-650/15 text-brand-400 border-brand-500/25' 
                          : 'bg-dark-900 border-dark-800 text-dark-400 hover:text-white'
                      }`}
                    >
                      Round 6: Easy
                    </button>
                    <button
                      onClick={() => setActiveCodeTab('round7')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                        activeCodeTab === 'round7' 
                          ? 'bg-brand-650/15 text-brand-400 border-brand-500/25' 
                          : 'bg-dark-900 border-dark-800 text-dark-400 hover:text-white'
                      }`}
                    >
                      Round 7: Hard
                    </button>
                  </div>
                </div>

                <div className="flex-grow">
                  {activeCodeTab === 'round6' ? (
                    interview.round6_code ? (
                      <Editor
                        height="100%"
                        language={interview.programming_language || 'javascript'}
                        theme="vs-dark"
                        value={interview.round6_code}
                        options={{
                          readOnly: true,
                          fontSize: 13,
                          minimap: { enabled: false },
                          automaticLayout: true,
                          lineNumbersMinChars: 3,
                          padding: { top: 12, bottom: 12 },
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-dark-500">
                        <FileCode size={36} className="stroke-[1.5] mb-2" />
                        <p className="text-xs italic">No code submission saved for Round 6 (Easy).</p>
                      </div>
                    )
                  ) : (
                    interview.round7_code ? (
                      <Editor
                        height="100%"
                        language={interview.programming_language || 'javascript'}
                        theme="vs-dark"
                        value={interview.round7_code}
                        options={{
                          readOnly: true,
                          fontSize: 13,
                          minimap: { enabled: false },
                          automaticLayout: true,
                          lineNumbersMinChars: 3,
                          padding: { top: 12, bottom: 12 },
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-dark-500">
                        <FileCode size={36} className="stroke-[1.5] mb-2" />
                        <p className="text-xs italic">No code submission saved for Round 7 (Hard).</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InterviewDetails;
