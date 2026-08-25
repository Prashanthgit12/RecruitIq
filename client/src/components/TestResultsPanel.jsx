import React from 'react';
import { CheckCircle2, XCircle, Code, ShieldCheck } from 'lucide-react';

const TestResultsPanel = ({ output }) => {
  if (!output) {
    return (
      <div className="bg-dark-900 border border-dark-800 p-5 rounded-2xl flex flex-col justify-center items-center text-center text-dark-500 italic text-xs min-h-[140px]">
        <Code size={24} className="mb-2 text-dark-600" />
        <span>No test results. Write code and click "Run Code" to execute public tests.</span>
      </div>
    );
  }

  const { status, passedCount, totalCount, results, runtimeMs, memoryMb } = output;

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4 max-h-[500px] overflow-y-auto">
      {/* Header Passed Counts */}
      <div className="border-b border-dark-850 pb-3 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">Test Suite Results</h3>
          <p className="text-[10px] text-dark-400 mt-0.5">
            Runtime: <span className="font-semibold text-white">{runtimeMs} ms</span> | Memory: <span className="font-semibold text-white">{memoryMb} MB</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded border leading-tight ${
            status === 'Accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {status}
          </span>
          <span className="text-xs text-dark-200 font-bold">
            {passedCount} / {totalCount} Passed
          </span>
        </div>
      </div>

      {/* Case-by-case outcomes list */}
      <div className="flex flex-col gap-3.5">
        {results && results.map((tc, idx) => {
          const isPassed = tc.passed;
          return (
            <div key={tc.id || idx} className="bg-dark-950 p-4 rounded-xl border border-dark-850 flex flex-col gap-2 leading-relaxed">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {isPassed ? (
                    <CheckCircle2 size={13} className="text-green-400" />
                  ) : (
                    <XCircle size={13} className="text-red-400" />
                  )}
                  <span>Test Case {idx + 1}</span>
                </span>
                
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                  isPassed ? 'bg-green-500/5 text-green-400' : 'bg-red-500/5 text-red-400'
                }`}>
                  {tc.status || (isPassed ? 'Passed' : 'Failed')}
                </span>
              </div>

              {/* Hide details if hidden test case */}
              {tc.is_hidden ? (
                <div className="text-[10px] text-dark-500 italic bg-dark-900 border border-dark-850 p-2 rounded-lg flex items-center gap-1">
                  <ShieldCheck size={11} className="text-brand-400" />
                  <span>Hidden Test Case. Inputs and outputs are secret.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-mono mt-1">
                  <div>
                    <span className="text-[9px] font-bold text-dark-500 uppercase block font-sans">Input</span>
                    <pre className="text-dark-200 bg-dark-900 border border-dark-800 p-2 rounded-lg mt-1 truncate">{tc.input}</pre>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-dark-500 uppercase block font-sans">Expected Output</span>
                    <pre className="text-green-400 bg-dark-900 border border-dark-800 p-2 rounded-lg mt-1 truncate">{tc.expected}</pre>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-dark-500 uppercase block font-sans">Returned Output</span>
                    <pre className={`bg-dark-900 border border-dark-800 p-2 rounded-lg mt-1 truncate ${
                      isPassed ? 'text-green-400' : 'text-red-400'
                    }`}>{tc.actual || 'undefined'}</pre>
                  </div>
                </div>
              )}

              {/* Stderr logs display */}
              {tc.stderr && (
                <pre className="text-xs text-red-400 bg-dark-900 border border-red-500/10 p-2.5 rounded-lg font-mono whitespace-pre-wrap leading-relaxed mt-1">
                  {tc.stderr}
                </pre>
              )}
              {tc.stdout && (
                <div>
                  <span className="text-[9px] font-bold text-dark-500 uppercase block font-sans mb-1">Standard Logs</span>
                  <pre className="text-[11px] text-green-400 bg-dark-900 border border-dark-800 p-2 rounded-lg font-mono whitespace-pre-wrap leading-relaxed">
                    {tc.stdout}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestResultsPanel;
