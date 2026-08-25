import React, { useState, useEffect } from 'react';
import { Edit3, Share2, Save, X } from 'lucide-react';

const QuestionPanel = ({ roomId, userRole, socket, initialQuestion }) => {
  const [question, setQuestion] = useState({
    title: 'Loading question...',
    description: 'No question details available.',
    difficulty: 'Medium',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', difficulty: 'Medium' });

  // Sync initial question details when fetched from API
  useEffect(() => {
    if (initialQuestion) {
      const q = {
        title: initialQuestion.question_title || 'No Question Shared',
        description: initialQuestion.question_description || 'The interviewer has not shared a coding question yet.',
        difficulty: initialQuestion.difficulty || 'Medium',
      };
      setQuestion(q);
      setEditForm(q);
    }
  }, [initialQuestion]);

  // Listen for socket updates
  useEffect(() => {
    if (!socket) return;

    socket.on('question-update', ({ question_title, question_description, difficulty }) => {
      setQuestion({
        title: question_title,
        description: question_description,
        difficulty: difficulty,
      });
    });

    return () => {
      socket.off('question-update');
    };
  }, [socket]);

  const handleEditToggle = () => {
    setEditForm(question);
    setIsEditing(!isEditing);
  };

  /**
   * Save and Broadcast updated question
   */
  const handleSaveAndShare = () => {
    setQuestion(editForm);
    setIsEditing(false);

    if (socket && userRole === 'interviewer') {
      socket.emit('question-update', {
        roomId,
        question_title: editForm.title,
        question_description: editForm.description,
        difficulty: editForm.difficulty,
      });
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'Hard':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
    }
  };

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 flex flex-col h-full shadow-lg max-h-[500px] overflow-y-auto">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-dark-850 pb-3.5 mb-4">
        <h3 className="font-bold text-sm text-dark-300 uppercase tracking-wider">Coding Assignment</h3>
        {userRole === 'interviewer' && !isEditing && (
          <button
            onClick={handleEditToggle}
            className="flex items-center gap-1 bg-dark-800 border border-dark-700 hover:bg-dark-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 size={12} />
            <span>Edit & Share</span>
          </button>
        )}
      </div>

      {/* Editor Form Mode */}
      {isEditing ? (
        <div className="flex flex-col gap-3.5 flex-grow">
          <div>
            <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1">Question Title</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-white text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1">Difficulty</label>
              <select
                value={editForm.difficulty}
                onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                className="w-full bg-dark-950 border border-dark-800 rounded-lg px-2.5 py-2 text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex-grow flex flex-col">
            <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1">Problem Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={6}
              className="w-full bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-white text-xs font-medium focus:outline-none focus:border-brand-500 resize-none flex-grow"
              placeholder="Enter full description, example input/output, and constraints..."
            />
          </div>

          <div className="flex items-center gap-2 border-t border-dark-850 pt-3">
            <button
              onClick={handleSaveAndShare}
              className="flex-grow flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Share2 size={12} />
              <span>Share Instantly</span>
            </button>
            <button
              onClick={handleEditToggle}
              className="bg-dark-800 border border-dark-700 hover:bg-dark-700 text-white p-2 rounded-lg transition-colors cursor-pointer"
              title="Cancel"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        /* Read Only Render View */
        <div className="flex-grow flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 className="font-bold text-lg text-white leading-snug">{question.title}</h2>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border leading-tight ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
            </div>
            
            <div className="border-t border-dark-850/80 my-3"></div>
            
            {/* Scrollable Description details */}
            <div className="text-dark-300 text-xs leading-relaxed whitespace-pre-line">
              {question.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPanel;
