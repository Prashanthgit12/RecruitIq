import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { Search, Star, Plus, Trash2, Calendar, BookOpen, Clock, Tag, X, Check, Code } from 'lucide-react';

const CATEGORIES = [
  'DSA', 'Arrays', 'Strings', 'Linked Lists', 'Stack', 'Queue', 'Trees',
  'Graphs', 'Recursion', 'Dynamic Programming', 'Sorting', 'Searching',
  'Java', 'Python', 'JavaScript', 'C++', 'C#', 'Web Development', 'HTML', 'CSS', 'React', 'Node.js', 'REST API', 'SQL'
];

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  // Previewing details state
  const [previewQuestion, setPreviewQuestion] = useState(null);
  
  // Create Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    category: 'Arrays',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    expectedTimeComplexity: 'O(n)',
    expectedSpaceComplexity: 'O(1)',
    programmingLanguage: 'javascript',
  });
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);
  const [testCases, setTestCases] = useState([{ input: '', expected_output: '', is_hidden: false }]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        category: category !== 'all' ? category : undefined,
        difficulty: difficulty !== 'all' ? difficulty : undefined,
      };
      const res = await api.get('/questions', { params });
      setQuestions(res.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [category, difficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleToggleFavorite = async (qId, e) => {
    e.stopPropagation(); // Stop details panel opening
    try {
      const res = await api.post(`/questions/${qId}/favorite`);
      setQuestions(questions.map(q => 
        q.id === qId ? { ...q, is_favorite: res.data.isFavorite } : q
      ));
      if (previewQuestion && previewQuestion.id === qId) {
        setPreviewQuestion({ ...previewQuestion, is_favorite: res.data.isFavorite });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleDelete = async (qId, e) => {
    e.stopPropagation();
    const confirmDel = window.confirm('Are you sure you want to delete this custom question?');
    if (confirmDel) {
      try {
        await api.delete(`/questions/${qId}`);
        setQuestions(questions.filter(q => q.id !== qId));
        if (previewQuestion && previewQuestion.id === qId) {
          setPreviewQuestion(null);
        }
      } catch (err) {
        console.error('Error deleting question:', err);
      }
    }
  };

  const handleAddExample = () => {
    setExamples([...examples, { input: '', output: '', explanation: '' }]);
  };

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expected_output: '', is_hidden: false }]);
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        examples: JSON.stringify(examples.filter(ex => ex.input)),
        testCases: testCases.filter(tc => tc.input),
        starterCode: JSON.stringify({
          javascript: `function solve() {\n  // Starter code\n}`
        })
      };

      await api.post('/questions', payload);
      setIsOpen(false);
      
      // Reset form
      setForm({
        title: '',
        description: '',
        difficulty: 'Medium',
        category: 'Arrays',
        inputFormat: '',
        outputFormat: '',
        constraints: '',
        expectedTimeComplexity: 'O(n)',
        expectedSpaceComplexity: 'O(1)',
        programmingLanguage: 'javascript',
      });
      setExamples([{ input: '', output: '', explanation: '' }]);
      setTestCases([{ input: '', expected_output: '', is_hidden: false }]);
      
      fetchQuestions();
    } catch (err) {
      console.error('Create custom question error:', err);
      alert('Error creating question. Check title and details.');
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Hard': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col text-white">
      <Navbar />

      <div className="flex flex-grow">
        <Sidebar />

        <main className="flex-grow p-6 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto w-full">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Question Bank</h1>
              <p className="text-dark-400 text-xs mt-1">Browse, filter, bookmark, and create custom coding tasks.</p>
            </div>
            
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-500/15"
            >
              <Plus size={14} />
              <span>Create Question</span>
            </button>
          </div>

          {/* Search filters */}
          <div className="bg-dark-900 border border-dark-850 p-4 rounded-2xl">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-2">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-500">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  placeholder="Search questions by name or description..."
                />
              </div>

              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </form>
          </div>

          {/* Splitted views for items and details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* List */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              {loading ? (
                <div className="bg-dark-900 border border-dark-850 p-12 rounded-2xl text-center">
                  <p className="text-xs text-dark-400 animate-pulse">Loading Question Bank...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="bg-dark-900 border border-dark-850 p-12 rounded-2xl text-center">
                  <p className="text-xs text-dark-500 italic">No matching questions found.</p>
                </div>
              ) : (
                questions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => setPreviewQuestion(q)}
                    className={`bg-dark-900 border p-4 rounded-2xl cursor-pointer hover:bg-dark-900/80 transition-all flex items-center justify-between gap-4 ${
                      previewQuestion?.id === q.id ? 'border-brand-500/60 shadow-lg shadow-brand-500/5' : 'border-dark-850'
                    }`}
                  >
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-white truncate max-w-[250px]">{q.title}</h3>
                        <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded border ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        <span className="text-[9px] bg-dark-950 border border-dark-850 text-dark-400 px-2 py-0.5 rounded-full font-semibold">
                          {q.category}
                        </span>
                      </div>
                      <p className="text-xs text-dark-400 truncate max-w-[400px]">{q.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleFavorite(q.id, e)}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          q.is_favorite 
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25 hover:bg-yellow-500/20' 
                            : 'bg-dark-950 border-dark-800 text-dark-500 hover:text-white'
                        }`}
                        title={q.is_favorite ? "Remove favorite" : "Mark as favorite"}
                      >
                        <Star size={14} className={q.is_favorite ? 'fill-yellow-400' : ''} />
                      </button>

                      {q.is_custom && (
                        <button
                          onClick={(e) => handleDelete(q.id, e)}
                          className="p-2 rounded-lg bg-dark-950 border border-dark-800 text-dark-500 hover:text-red-400 hover:border-red-500/20 transition-colors cursor-pointer"
                          title="Delete custom question"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar Preview */}
            <div className="lg:col-span-1">
              {previewQuestion ? (
                <div className="bg-dark-900 border border-dark-850 p-5 rounded-3xl flex flex-col gap-4 shadow-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">{previewQuestion.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded border ${getDifficultyColor(previewQuestion.difficulty)}`}>
                          {previewQuestion.difficulty}
                        </span>
                        <span className="text-[9px] text-brand-400 font-semibold">{previewQuestion.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreviewQuestion(null)}
                      className="text-dark-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="border-t border-dark-850 my-1"></div>

                  {/* Body description */}
                  <div className="text-xs text-dark-300 leading-relaxed max-h-[300px] overflow-y-auto pr-1 whitespace-pre-wrap">
                    {previewQuestion.description}
                  </div>

                  {/* Constraints/Time limits info */}
                  {previewQuestion.expected_time_complexity && (
                    <div className="bg-dark-950 p-3 rounded-xl border border-dark-850 text-[10px] flex items-center justify-between">
                      <span className="text-dark-500 uppercase font-bold">Time Limit</span>
                      <span className="text-white font-semibold font-mono">{previewQuestion.expected_time_complexity}</span>
                    </div>
                  )}
                  {previewQuestion.expected_space_complexity && (
                    <div className="bg-dark-950 p-3 rounded-xl border border-dark-850 text-[10px] flex items-center justify-between">
                      <span className="text-dark-500 uppercase font-bold">Space Limit</span>
                      <span className="text-white font-semibold font-mono">{previewQuestion.expected_space_complexity}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-dark-900/30 border border-dark-850 border-dashed p-10 rounded-3xl text-center text-xs text-dark-500 italic">
                  Select a question from the list to preview details.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* CREATE CUSTOM QUESTION MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-dark-900 border border-dark-850 rounded-3xl p-6 md:p-8 overflow-y-auto max-h-[90vh] shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-dark-400 hover:text-white p-1 rounded-lg hover:bg-dark-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">Create Custom Question</h2>
            <p className="text-xs text-dark-400 mb-6">Build a custom task, declare constraints, and program public/hidden test cases.</p>

            <form onSubmit={handleCreateQuestion} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Question Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none"
                    placeholder="e.g. Unique Path Sum"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Time Complexity Limit</label>
                  <input
                    type="text"
                    value={form.expectedTimeComplexity}
                    onChange={(e) => setForm({ ...form, expectedTimeComplexity: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Space Complexity Limit</label>
                  <input
                    type="text"
                    value={form.expectedSpaceComplexity}
                    onChange={(e) => setForm({ ...form, expectedSpaceComplexity: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-dark-500 uppercase block mb-1.5">Description</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-white text-xs font-medium focus:outline-none resize-none"
                  placeholder="Explain problem rules clearly..."
                />
              </div>

              <div className="border-t border-dark-850 my-2"></div>

              {/* Dynamic examples section */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-brand-450 uppercase">Examples list</h3>
                <button
                  type="button"
                  onClick={handleAddExample}
                  className="text-[10px] text-brand-400 font-bold hover:underline"
                >
                  + Add Example
                </button>
              </div>

              {examples.map((ex, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-dark-950 p-3 rounded-xl border border-dark-850">
                  <input
                    type="text"
                    value={ex.input}
                    onChange={(e) => {
                      const updated = [...examples];
                      updated[idx].input = e.target.value;
                      setExamples(updated);
                    }}
                    placeholder={`Input: e.g. nums=[2,7], target=9`}
                    className="bg-dark-900 border border-dark-800 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                  />
                  <input
                    type="text"
                    value={ex.output}
                    onChange={(e) => {
                      const updated = [...examples];
                      updated[idx].output = e.target.value;
                      setExamples(updated);
                    }}
                    placeholder={`Output: e.g. [0,1]`}
                    className="bg-dark-900 border border-dark-800 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                  />
                </div>
              ))}

              <div className="border-t border-dark-850 my-2"></div>

              {/* Dynamic test cases section */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-brand-450 uppercase">Compiler Test Cases</h3>
                <button
                  type="button"
                  onClick={handleAddTestCase}
                  className="text-[10px] text-brand-400 font-bold hover:underline"
                >
                  + Add Test Case
                </button>
              </div>

              {testCases.map((tc, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-dark-950 p-3 rounded-xl border border-dark-850 items-center">
                  <input
                    type="text"
                    value={tc.input}
                    onChange={(e) => {
                      const updated = [...testCases];
                      updated[idx].input = e.target.value;
                      setTestCases(updated);
                    }}
                    placeholder={`Test Input: e.g. [2,7]\\n9`}
                    className="bg-dark-900 border border-dark-800 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                  />
                  <input
                    type="text"
                    value={tc.expected_output}
                    onChange={(e) => {
                      const updated = [...testCases];
                      updated[idx].expected_output = e.target.value;
                      setTestCases(updated);
                    }}
                    placeholder={`Expected Output: e.g. [0,1]`}
                    className="bg-dark-900 border border-dark-800 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                  />
                  <label className="flex items-center gap-2 text-[10px] text-dark-300 font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={tc.is_hidden}
                      onChange={(e) => {
                        const updated = [...testCases];
                        updated[idx].is_hidden = e.target.checked;
                        setTestCases(updated);
                      }}
                      className="rounded accent-brand-500"
                    />
                    <span>Hidden Test Case</span>
                  </label>
                </div>
              ))}

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all mt-4 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10"
              >
                <Check size={14} />
                <span>Save Question to Bank</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
