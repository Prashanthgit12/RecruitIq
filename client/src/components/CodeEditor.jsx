import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, CheckCircle, Save } from 'lucide-react';
import api from '../api/axios';

const LANGUAGE_BOILERPLATES = {
  javascript: `// Write your JavaScript code here
function twoSum(nums, target) {
    // Implement solution
    console.log("Evaluating addition logic...");
    return [0, 1];
}

console.log(twoSum([2, 7, 11, 15], 9));
`,
  python: `# Write your Python code here
def two_sum(nums, target):
    # Implement solution
    print("Evaluating python arrays...")
    return [0, 1]

print(two_sum([2, 7, 11, 15], 9))
`,
  java: `// Write your Java code here
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java Interview!");
    }
}
`,
  cpp: `// Write your C++ code here
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, C++ Room!" << endl;
    return 0;
}
`,
};

const CodeEditor = ({ roomId, userRole, socket, activeLanguage, onLanguageChange, onRunSuccess }) => {
  const [code, setCode] = useState(LANGUAGE_BOILERPLATES[activeLanguage || 'javascript']);
  const [language, setLanguage] = useState(activeLanguage || 'javascript');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef(null);

  // Sync language selection from parent if it changes
  useEffect(() => {
    if (activeLanguage && activeLanguage !== language) {
      setLanguage(activeLanguage);
      setCode(LANGUAGE_BOILERPLATES[activeLanguage] || '');
    }
  }, [activeLanguage]);

  // Handle Socket.io synchronization
  useEffect(() => {
    if (!socket) return;

    // Listen for code-update events from the backend
    socket.on('code-update', ({ code: newCode, language: newLang }) => {
      // If code or language changed, update state
      if (newLang && newLang !== language) {
        setLanguage(newLang);
        if (onLanguageChange) onLanguageChange(newLang);
      }
      if (newCode !== undefined && newCode !== editorRef.current?.getValue()) {
        setCode(newCode);
      }
    });

    return () => {
      socket.off('code-update');
    };
  }, [socket, language, onLanguageChange]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  /**
   * Handle edits (Only Candidate triggers this event)
   */
  const handleEditorChange = (value) => {
    setCode(value);
    
    if (userRole === 'candidate' && socket) {
      socket.emit('code-change', {
        roomId,
        code: value,
        language,
      });
    }
  };

  /**
   * Language dropdown change
   */
  const handleLangChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    const boilerplate = LANGUAGE_BOILERPLATES[selectedLang] || '';
    setCode(boilerplate);

    if (onLanguageChange) {
      onLanguageChange(selectedLang);
    }

    if (userRole === 'candidate' && socket) {
      socket.emit('code-change', {
        roomId,
        code: boilerplate,
        language: selectedLang,
      });
    }
  };

  /**
   * Reset code
   */
  const handleReset = () => {
    const boilerplate = LANGUAGE_BOILERPLATES[language] || '';
    setCode(boilerplate);
    
    if (userRole === 'candidate' && socket) {
      socket.emit('code-change', {
        roomId,
        code: boilerplate,
        language,
      });
    }
  };  /**
   * Run Code (Compilation mock)
   */
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const currentCode = editorRef.current ? editorRef.current.getValue() : code;
      const res = await api.post('/code/run', { 
        language, 
        code: currentCode, 
        interview_id: roomId 
      });
      setOutput(res.data);
      if (onRunSuccess) {
        onRunSuccess(res.data);
      }
    } catch (err) {
      console.error('Run code error:', err);
      const errOutput = {
        status: 'Runtime Error',
        stderr: err.response?.data?.message || 'Failed to trigger code runner.',
        executionTimeMs: 0,
        memoryUsageMb: '0.00',
        results: []
      };
      setOutput(errOutput);
      if (onRunSuccess) {
        onRunSuccess(errOutput);
      }
    } finally {
      setIsRunning(false);
    }
  };
  /**
   * Submit Code (Candidate only)
   */
  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    try {
      const interviewRes = await api.get(`/interviews/room/${roomId}`);
      const interview = interviewRes.data;

      const currentCode = editorRef.current ? editorRef.current.getValue() : code;
      await api.post('/code/submit', {
        interview_id: interview.id,
        language,
        code: currentCode,
      });
      alert('✅ Code submitted successfully! Inform the interviewer.');
    } catch (err) {
      console.error('Submission error:', err);
      alert(`❌ Error submitting code: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Editor Controls Bar */}
      <div className="bg-dark-950 px-4 py-3 flex items-center justify-between border-b border-dark-850">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-dark-400 uppercase tracking-wider">Editor Settings</span>
          <select
            value={language}
            onChange={handleLangChange}
            disabled={userRole === 'interviewer'}
            className="bg-dark-900 border border-dark-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-brand-500 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python 3</option>
            <option value="java">Java</option>
            <option value="cpp">C++ (GCC)</option>
          </select>
        </div>

        {/* Candidate Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-dark-900 border border-dark-800 hover:bg-dark-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play size={12} className="fill-white" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
          
          {userRole === 'candidate' && (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 bg-dark-900 border border-dark-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-dark-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Reset boilerplate"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
              
              <button
                onClick={handleSubmitCode}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-md shadow-brand-500/10 disabled:opacity-50"
              >
                <CheckCircle size={12} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Code'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Actual Monaco Editor Frame */}
      <div className="flex-grow min-h-[350px]">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            readOnly: userRole === 'interviewer', // Read-only for interviewer
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            cursorBlinking: 'smooth',
            lineNumbersMinChars: 3,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Compilation Output Drawer */}
      <div className="bg-dark-950 border-t border-dark-800/80 p-4 min-h-[140px] flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-dark-400 uppercase tracking-wider block mb-2">Console Output</span>
          {output ? (
            <div className="font-mono text-xs max-h-[120px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  output.status === 'Accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {output.status}
                </span>
                <span className="text-dark-400 font-sans text-[10px]">
                  Time: {output.executionTimeMs}ms | Memory: {output.memoryUsageMb} MB
                </span>
              </div>
              {output.stdout && (
                <pre className="text-green-400 bg-dark-900 border border-dark-800 p-2.5 rounded-lg whitespace-pre-wrap leading-relaxed">{output.stdout}</pre>
              )}
              {output.stderr && (
                <pre className="text-red-400 bg-dark-900 border border-dark-800 p-2.5 rounded-lg whitespace-pre-wrap leading-relaxed">{output.stderr}</pre>
              )}
            </div>
          ) : (
            <p className="text-xs text-dark-500 italic">No output. Click "Run Code" to compile and execute current code block.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
