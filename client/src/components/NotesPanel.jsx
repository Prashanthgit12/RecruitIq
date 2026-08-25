import React, { useState, useEffect, useRef } from 'react';
import { Save, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api/axios';

const NotesPanel = ({ interviewId }) => {
  const [notes, setNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, typing, saving, saved, error
  const debounceTimer = useRef(null);

  // Load initial notes on mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setSaveStatus('saving');
        const res = await api.get(`/notes/${interviewId}`);
        setNotes(res.data.notes || '');
        setSaveStatus('idle');
      } catch (err) {
        console.error('Error fetching notes:', err);
        setSaveStatus('error');
      }
    };

    if (interviewId) {
      fetchNotes();
    }
  }, [interviewId]);

  /**
   * Save notes to database
   */
  const saveNotesToDb = async (latestNotes) => {
    setSaveStatus('saving');
    try {
      await api.post('/notes', {
        interview_id: interviewId,
        notes: latestNotes,
      });
      setSaveStatus('saved');
      
      // Reset back to idle status after 2 seconds
      setTimeout(() => {
        setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
      }, 2000);
    } catch (err) {
      console.error('Auto-save notes error:', err);
      setSaveStatus('error');
    }
  };

  /**
   * Handle textarea change with debouncing
   */
  const handleChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    setSaveStatus('typing');

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer to auto-save after 1.5 seconds of inactivity
    debounceTimer.current = setTimeout(() => {
      saveNotesToDb(val);
    }, 1500);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const getStatusText = () => {
    switch (saveStatus) {
      case 'typing':
        return 'Typing...';
      case 'saving':
        return 'Saving notes...';
      case 'saved':
        return 'Saved to DB';
      case 'error':
        return 'Auto-save failed';
      default:
        return 'All changes saved';
    }
  };

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between border-b border-dark-850 pb-3 mb-4">
        <h3 className="font-bold text-sm text-dark-300 uppercase tracking-wider">Private Notes</h3>
        
        {/* Save Status Indicators */}
        <div className="flex items-center gap-1.5">
          {saveStatus === 'saving' && <RefreshCw size={12} className="text-brand-400 animate-spin" />}
          {saveStatus === 'error' && <AlertCircle size={12} className="text-red-400" />}
          <span className={`text-[10px] font-bold uppercase tracking-wide ${
            saveStatus === 'saved' ? 'text-green-400' :
            saveStatus === 'error' ? 'text-red-400' :
            saveStatus === 'saving' ? 'text-brand-400' : 'text-dark-500'
          }`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="flex-grow flex flex-col">
        <textarea
          value={notes}
          onChange={handleChange}
          rows={8}
          className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-brand-500 resize-none flex-grow"
          placeholder="Write private interview notes... (Auto-saves changes)"
        />
        <p className="text-[10px] text-dark-500 mt-2 leading-relaxed">
          🔒 These notes are private and encrypted. Candidates will never be able to view notes written here.
        </p>
      </div>
    </div>
  );
};

export default NotesPanel;
