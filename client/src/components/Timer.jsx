import React, { useEffect, useState } from 'react';
import { Play, Pause, Plus, AlertTriangle, CheckCircle } from 'lucide-react';

const Timer = ({ roomId, userRole, socket, onEndInterview }) => {
  const [secondsLeft, setSecondsLeft] = useState(3600); // 60 mins default
  const [status, setStatus] = useState('paused'); // running, paused

  useEffect(() => {
    if (!socket) return;

    // Listen for timer synchronization updates
    socket.on('timer-sync', ({ durationSeconds, status: timerStatus }) => {
      setSecondsLeft(durationSeconds);
      setStatus(timerStatus);
    });

    return () => {
      socket.off('timer-sync');
    };
  }, [socket]);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  /**
   * Action triggers (Interviewer only)
   */
  const handleStart = () => {
    if (socket && userRole === 'interviewer') {
      socket.emit('timer-start', { roomId });
    }
  };

  const handlePause = () => {
    if (socket && userRole === 'interviewer') {
      socket.emit('timer-pause', { roomId });
    }
  };

  const handleAddMinutes = () => {
    if (socket && userRole === 'interviewer') {
      socket.emit('timer-add-time', { roomId });
    }
  };

  const handleEnd = () => {
    if (userRole !== 'interviewer') return;
    
    const confirmEnd = window.confirm('⚠️ Are you sure you want to end this interview? This will lock coding access.');
    if (confirmEnd) {
      if (socket) {
        socket.emit('interview-ended', { roomId });
      }
      if (onEndInterview) {
        onEndInterview();
      }
    }
  };

  // Warning thresholds
  const isTimeCritical = secondsLeft <= 300; // < 5 minutes remaining

  return (
    <div className="bg-dark-900 border border-dark-800 p-5 rounded-2xl flex flex-col items-center shadow-lg w-full">
      <span className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Remaining Duration</span>
      
      {/* Large Digit Countdown */}
      <div className={`font-mono text-3xl font-extrabold tracking-tight ${
        isTimeCritical ? 'text-red-500 animate-pulse' : 'text-brand-400'
      }`}>
        {formatTime(secondsLeft)}
      </div>

      {/* Connection Indicator status */}
      <div className="flex items-center gap-1.5 mt-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${
          status === 'running' ? 'bg-green-500' : 'bg-yellow-500'
        }`}></span>
        <span className="text-[10px] text-dark-400 uppercase font-bold tracking-wide">
          {status === 'running' ? 'Timer Active' : 'Timer Paused'}
        </span>
      </div>

      {/* Control Buttons (Interviewer Only) */}
      {userRole === 'interviewer' && (
        <div className="flex flex-wrap gap-2 justify-center w-full border-t border-dark-850 pt-4">
          {status === 'paused' ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-1 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Play size={12} fill="white" />
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Pause size={12} />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleAddMinutes}
            className="flex items-center gap-1 bg-dark-800 border border-dark-700 hover:bg-dark-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
            title="Add 5 Minutes"
          >
            <Plus size={12} />
            <span>+5 Min</span>
          </button>

          <button
            onClick={handleEnd}
            className="flex items-center gap-1 bg-red-650 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
            title="End Interview and redirect to scoring"
          >
            <CheckCircle size={12} />
            <span>End Room</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Timer;
