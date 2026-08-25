import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../api/axios';

const CRITERIA = [
  { key: 'communication', label: 'Communication Skills' },
  { key: 'problemSolving', label: 'Problem Solving' },
  { key: 'coding', label: 'Coding Skills' },
  { key: 'technical', label: 'Technical Knowledge' },
  { key: 'overall', label: 'Overall Performance' },
];

const EvaluationPanel = ({ interviewId, onSubmitSuccess }) => {
  const [ratings, setRatings] = useState({
    communication: 3,
    problemSolving: 3,
    coding: 3,
    technical: 3,
    overall: 3,
  });
  const [feedback, setFeedback] = useState('');
  const [result, setResult] = useState('on_hold'); // selected, rejected, on_hold
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load existing evaluation if available
  useEffect(() => {
    const fetchExistingEvaluation = async () => {
      try {
        const res = await api.get(`/evaluations/${interviewId}`);
        if (res.data) {
          setRatings({
            communication: res.data.communication_rating || 3,
            problemSolving: res.data.problem_solving_rating || 3,
            coding: res.data.coding_rating || 3,
            technical: res.data.technical_rating || 3,
            overall: res.data.overall_rating || 3,
          });
          setFeedback(res.data.feedback || '');
          setResult(res.data.result || 'on_hold');
        }
      } catch (err) {
        // 404 is expected if not evaluated yet, ignore
        if (err.response?.status !== 404) {
          console.error('Error fetching evaluation:', err);
        }
      }
    };

    if (interviewId) {
      fetchExistingEvaluation();
    }
  }, [interviewId]);

  const handleRatingChange = (key, rating) => {
    setRatings((prev) => ({
      ...prev,
      [key]: rating,
    }));
  };

  /**
   * Save scorecard and finalize interview status
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        interview_id: interviewId,
        communication_rating: ratings.communication,
        problem_solving_rating: ratings.problemSolving,
        coding_rating: ratings.coding,
        technical_rating: ratings.technical,
        overall_rating: ratings.overall,
        feedback,
        result,
      };

      await api.post('/evaluations', payload);
      alert('✅ Scorecard saved successfully and interview marked as COMPLETED.');
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      console.error('Submit evaluation error:', err);
      setError(err.response?.data?.message || 'Failed to submit evaluation scorecard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-dark-900 border border-dark-800 rounded-2xl p-5 flex flex-col gap-4 shadow-lg max-h-[500px] overflow-y-auto">
      <div className="border-b border-dark-850 pb-3">
        <h3 className="font-bold text-sm text-dark-300 uppercase tracking-wider">Candidate Scorecard</h3>
        <p className="text-[10px] text-dark-500 mt-0.5">Evaluate core skill sets and select recruitment outcome status.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ratings stars controls */}
      <div className="flex flex-col gap-3">
        {CRITERIA.map((criterion) => {
          const currentRating = ratings[criterion.key];
          return (
            <div key={criterion.key} className="flex items-center justify-between">
              <span className="text-xs text-dark-200 font-medium">{criterion.label}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => handleRatingChange(criterion.key, star)}
                    className="p-0.5 text-dark-600 hover:text-brand-400 focus:outline-none transition-colors cursor-pointer"
                  >
                    <Star
                      size={16}
                      className={star <= currentRating ? 'fill-brand-400 text-brand-400' : 'text-dark-700'}
                    />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-dark-850 my-1"></div>

      {/* Result decision selection */}
      <div>
        <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Recruitment Decision</label>
        <select
          value={result}
          onChange={(e) => setResult(e.target.value)}
          className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="selected">🟢 Selected (Hire)</option>
          <option value="on_hold">🟡 On Hold</option>
          <option value="rejected">🔴 Rejected</option>
        </select>
      </div>

      {/* Comments feedback */}
      <div>
        <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Overall Feedback & Comments</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          required
          className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-white text-xs font-medium focus:outline-none focus:border-brand-500 resize-none"
          placeholder="Summarize candidate's technical skills, communication, problem-solving efficiency, and overall feedback..."
        />
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-700 disabled:opacity-75 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-green-650/15"
      >
        <CheckCircle2 size={14} />
        <span>{isSubmitting ? 'Finalizing...' : 'Save & End Interview'}</span>
      </button>
    </form>
  );
};

export default EvaluationPanel;
