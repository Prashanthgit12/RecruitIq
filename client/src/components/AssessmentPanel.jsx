import React, { useState, useEffect } from 'react';
import aptitudeQuestions from '../utils/aptitudeQuestions';
import api from '../api/axios';
import { CheckCircle, AlertCircle, ArrowRight, HelpCircle } from 'lucide-react';

const AssessmentPanel = ({ interviewId, currentRound, onSubmitSuccess, autoSubmitTrigger }) => {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Get current category list
  let questions = [];
  let roundTitle = "";
  let roundDesc = "";

  if (currentRound === 1) {
    questions = aptitudeQuestions.quantitative;
    roundTitle = "Round 1: Numerical Ability";
    roundDesc = "Basic mathematics, arithmetic speed tests, percentages, and word problems. 20 questions.";
  } else if (currentRound === 2) {
    questions = aptitudeQuestions.verbal;
    roundTitle = "Round 2: Verbal Ability";
    roundDesc = "Grammar corrections, vocabulary tests, spelling reviews, and synonyms. 25 questions.";
  } else if (currentRound === 3) {
    questions = aptitudeQuestions.reasoning;
    roundTitle = "Round 3: Reasoning Ability";
    roundDesc = "Deductive reasoning, pattern recognition, series, and logical sequences. 20 questions.";
  } else if (currentRound === 4) {
    questions = aptitudeQuestions.advanced_quant;
    roundTitle = "Round 4: Advanced Quantitative Ability";
    roundDesc = "Probability, combinations, statistics, set theory, and complex mathematical systems. 10 questions.";
  } else if (currentRound === 5) {
    questions = aptitudeQuestions.advanced_reasoning;
    roundTitle = "Round 5: Advanced Reasoning Ability";
    roundDesc = "Syllogisms, complex arrangements, coding/decoding puzzles, and critical logic. 10 questions.";
  }

  // Clear answers when round changes
  useEffect(() => {
    setAnswers({});
    setError(null);
  }, [currentRound]);

  // Handle auto-submission when timer hits zero
  useEffect(() => {
    if (autoSubmitTrigger) {
      const triggerAutoSubmit = async () => {
        setSubmitting(true);
        setError(null);
        try {
          const res = await api.post(`/interviews/${interviewId}/submit-round`, {
            roundNumber: currentRound,
            answers
          });
          onSubmitSuccess(res.data.currentRound, res.data.score);
        } catch (err) {
          console.error('Auto-submit round error:', err);
          setError(err.response?.data?.message || 'Failed to auto-submit round answers.');
        } finally {
          setSubmitting(false);
        }
      };
      triggerAutoSubmit();
    }
  }, [autoSubmitTrigger]);

  const handleSelectOption = (questionId, optionIdx) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const answeredCount = Object.keys(answers).length;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (answeredCount < questions.length) {
      if (!window.confirm(`⚠️ You have only answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit and proceed?`)) {
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post(`/interviews/${interviewId}/submit-round`, {
        roundNumber: currentRound,
        answers
      });
      onSubmitSuccess(res.data.currentRound, res.data.score);
    } catch (err) {
      console.error('Round submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit round answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 border border-dark-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[85vh]">
      {/* Header */}
      <div className="border-b border-dark-850 pb-4 mb-6">
        <span className="text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Aptitude Assessment
        </span>
        <h2 className="text-xl md:text-2xl font-black text-white mt-3">{roundTitle}</h2>
        <p className="text-dark-450 text-xs mt-1.5 leading-relaxed">{roundDesc}</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between bg-dark-950 px-4 py-3 rounded-2xl border border-dark-850 mb-6 text-xs">
        <span className="text-dark-400 font-medium">Progress</span>
        <span className="text-white font-bold">
          {answeredCount} / {questions.length} Answered
        </span>
        <div className="w-1/3 bg-dark-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-brand-500 h-full transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Questions list */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-grow">
        <div className="flex flex-col gap-5">
          {questions.map((q, idx) => (
            <div 
              key={q.id} 
              className={`p-5 rounded-2xl border transition-all duration-300 ${
                answers[q.id] !== undefined 
                  ? 'bg-brand-950/5 border-brand-500/20' 
                  : 'bg-dark-950 border-dark-850 hover:border-dark-800'
              }`}
            >
              <div className="flex gap-3">
                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-lg bg-dark-800 text-[11px] font-bold text-dark-300">
                  {idx + 1}
                </span>
                <p className="text-white text-xs font-semibold leading-relaxed mt-0.5">{q.question}</p>
              </div>

              {/* Radio options grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 ml-9">
                {q.options.map((opt, optIdx) => {
                  const isSelected = answers[q.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-600/10 border-brand-500 text-brand-400 font-bold'
                          : 'bg-dark-900 border-dark-800 hover:border-dark-750 text-dark-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'border-brand-500 bg-brand-500' 
                          : 'border-dark-600 bg-dark-950'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Bar */}
        <div className="border-t border-dark-850 pt-5 mt-4 flex items-center justify-between gap-4">
          <div className="text-xs text-dark-450 italic">
            Make sure to attempt all questions before proceeding.
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 bg-brand-650 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/15"
          >
            <span>{submitting ? 'Submitting...' : 'Submit & Next Round'}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentPanel;
