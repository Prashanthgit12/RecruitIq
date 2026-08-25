import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QuestionPanel from '../components/QuestionPanel';
import CodeEditor from '../components/CodeEditor';
import Timer from '../components/Timer';
import NotesPanel from '../components/NotesPanel';
import EvaluationPanel from '../components/EvaluationPanel';
import ChatPanel from '../components/ChatPanel';
import TestResultsPanel from '../components/TestResultsPanel';
import AssessmentPanel from '../components/AssessmentPanel';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import { AlertCircle, Wifi, WifiOff, Loader, LogOut, BookOpen, MessageSquare, ShieldCheck, Award, Terminal, ClipboardList, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, User, CheckCircle } from 'lucide-react';
import { useRef } from 'react';

const InterviewRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { socket, connected, joinRoom, leaveRoom } = useSocket();
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [autoSubmitTrigger, setAutoSubmitTrigger] = useState(0);
  
  // Tabs states
  const [activeLeftTab, setActiveLeftTab] = useState('question'); // question, chat, notes, evaluation
  const [activeBottomTab, setActiveBottomTab] = useState('output'); // output (run output), tests (test cases results)

  // Real-time states
  const [activeLanguage, setActiveLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState(null);
  const [notifyMessage, setNotifyMessage] = useState('');

  // Media & Video states
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const navigate = useNavigate();

  // 1. Fetch Room Metadata and Authorize User
  const fetchRoomDetails = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/interviews/room/${roomId}`);
      setInterview(res.data);
      setCurrentRound(res.data.current_round || 1);
      setActiveLanguage(res.data.programming_language || 'javascript');
      setSecondsLeft(res.data.seconds_left || 0);
    } catch (err) {
      console.error('Room validation error:', err);
      setError(err.response?.data?.message || 'Failed to enter interview room.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  // 2. Join Socket.io Room and configure events
  useEffect(() => {
    if (!loading && interview && socket && connected) {
      joinRoom(roomId);

      // Lobby notifications (Section 12)
      if (user.role === 'candidate') {
        setNotifyMessage('✓ You joined the interview');
        setTimeout(() => setNotifyMessage(''), 4500);
      }

      socket.on('candidate-joined', () => {
        if (user.role === 'interviewer') {
          setNotifyMessage('● Candidate joined the interview');
          setTimeout(() => setNotifyMessage(''), 4500);
        }
      });

      // Listen for socket interview conclusion
      socket.on('interview-ended', () => {
        alert('🔒 This interview session has been ended by the interviewer.');
        const redirectPath = user.role === 'interviewer' ? `/details/${interview.id}` : '/dashboard';
        navigate(redirectPath, { replace: true });
      });

      // Listen for candidate submitting MCQ rounds
      socket.on('round-submitted', (data) => {
        console.log('📡 Round submitted event received:', data);
        setCurrentRound(data.currentRound);
        if (data.status === 'completed') {
          alert('🏁 The assessment has been completed successfully!');
          const redirectPath = user.role === 'interviewer' ? `/details/${interview.id}` : '/dashboard';
          navigate(redirectPath, { replace: true });
        } else {
          fetchRoomDetails(false); // updates local state with scores/questions
        }
      });

      return () => {
        socket.off('interview-ended');
        socket.off('candidate-joined');
        socket.off('round-submitted');
        leaveRoom(roomId);
      };
    }
  }, [loading, interview, socket, connected, roomId]);

  const createSimulatedStream = (name) => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    
    let angle = 0;
    const interval = setInterval(() => {
      if (!ctx) return;
      
      // Background Gradient
      const grad = ctx.createRadialGradient(160, 120, 10, 160, 120, 200);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 320, 240);
      
      // Pulsing Ring
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(160, 120, 50 + Math.sin(angle) * 5, 0, Math.PI * 2);
      ctx.stroke();
      
      // Avatar placeholder
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.arc(160, 110, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(160, 155, 30, Math.PI, 0);
      ctx.fill();
      
      // Text
      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name.toUpperCase(), 160, 200);
      ctx.fillStyle = '#64748b';
      ctx.font = '8px monospace';
      ctx.fillText('LIVE SIMULATED WEBCAM', 160, 215);
      
      angle += 0.08;
    }, 50);

    const videoTrack = canvas.captureStream(20).getVideoTracks()[0];
    
    let audioTrack;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();
      audioTrack = dest.stream.getAudioTracks()[0];
    } catch (e) {
      console.warn('Could not generate simulated audio track:', e);
    }
    
    const tracks = [videoTrack];
    if (audioTrack) tracks.push(audioTrack);
    
    const stream = new MediaStream(tracks);
    
    stream.stopSimulated = () => {
      clearInterval(interval);
      stream.getTracks().forEach(t => t.stop());
    };
    
    return stream;
  };

  // 2. webcam stream initialization
  useEffect(() => {
    let activeStream = null;
    const startWebcam = async () => {
      if (!loading && interview) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setLocalStream(stream);
          activeStream = stream;
        } catch (err) {
          console.warn('Could not initialize hardware local video stream, falling back to simulation:', err);
          const simulated = createSimulatedStream(user.name);
          setLocalStream(simulated);
          activeStream = simulated;
        }
      }
    };
    startWebcam();

    return () => {
      if (activeStream) {
        if (activeStream.stopSimulated) {
          activeStream.stopSimulated();
        } else {
          activeStream.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [loading, interview]);

  useEffect(() => {
    if (localStream && localVideoRef.current && !isVideoOff) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff]);

  useEffect(() => {
    if (screenStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!socket || !localStream) return;

    console.log('🔌 Initializing WebRTC Peer Connection...');
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnectionRef.current = pc;

    // Add local tracks
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log('📡 Received remote media track!');
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-candidate', { roomId, candidate: event.candidate });
      }
    };

    // Listen for incoming offer
    socket.on('webrtc-offer', async (sdp) => {
      console.log('📡 Received WebRTC Offer');
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { roomId, sdp: answer });
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
      }
    });

    // Listen for incoming answer
    socket.on('webrtc-answer', async (sdp) => {
      console.log('📡 Received WebRTC Answer');
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (err) {
        console.error('Error handling WebRTC answer:', err);
      }
    });

    // Listen for incoming ICE candidates
    socket.on('webrtc-candidate', async (candidate) => {
      console.log('📡 Received WebRTC ICE Candidate');
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    // Listen for peer join event to initiate offer
    socket.on('user-joined', async () => {
      console.log('👥 Another user joined the room. Initiating WebRTC offer...');
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { roomId, sdp: offer });
      } catch (err) {
        console.error('Error creating WebRTC offer:', err);
      }
    });

    socket.on('interviewer-joined', async () => {
      if (user.role === 'candidate') {
        console.log('👥 Interviewer joined. Initiating offer...');
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc-offer', { roomId, sdp: offer });
        } catch (err) {
          console.error('Error creating WebRTC offer:', err);
        }
      }
    });

    socket.on('candidate-joined', async () => {
      if (user.role === 'interviewer') {
        console.log('👥 Candidate joined. Initiating offer...');
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc-offer', { roomId, sdp: offer });
        } catch (err) {
          console.error('Error creating WebRTC offer:', err);
        }
      }
    });

    // If both are already in the room upon connection, let's trigger call creation
    const initiateCall = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { roomId, sdp: offer });
      } catch (err) {
        console.warn('Call auto-initiation skipped (expecting incoming peer):', err.message);
      }
    };
    initiateCall();

    return () => {
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-candidate');
      socket.off('user-joined');
      socket.off('interviewer-joined');
      socket.off('candidate-joined');
      pc.close();
    };
  }, [socket, localStream, roomId]);

  // Screen share handler
  const handleToggleScreenShare = async () => {
    if (isSharingScreen) {
      if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
      }
      setScreenStream(null);
      setIsSharingScreen(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setIsSharingScreen(true);
        
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsSharingScreen(false);
        };
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
      }
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleLanguageChange = (newLang) => {
    setActiveLanguage(newLang);
  };

  const handleLeaveRoom = () => {
    const confirmLeave = window.confirm('Are you sure you want to leave the live interview?');
    if (confirmLeave) {
      const dashboardLink = user.role === 'interviewer' ? '/interviewer-dashboard' : '/dashboard';
      navigate(dashboardLink);
    }
  };

  const handleCodingRoundSubmit = async (isAuto = false) => {
    if (!isAuto && !testResults) {
      alert("Please click 'Run Tests' to evaluate your code before submitting!");
      return;
    }

    if (!isAuto && !window.confirm("Are you sure you want to submit your code and proceed?")) {
      return;
    }

    const editorVal = window.monacoEditorValue || ''; 
    try {
      const res = await api.post(`/interviews/${interview.id}/submit-round`, {
        roundNumber: currentRound,
        code: editorVal,
        passedCount: testResults ? (testResults.passedCount || 0) : 0,
        totalCount: testResults ? (testResults.totalCount || 0) : 0
      });

      setTestResults(null);
      
      // Update local state
      setCurrentRound(res.data.currentRound);
      if (res.data.status === 'completed') {
        alert('🏁 The assessment has been completed successfully!');
        navigate('/dashboard', { replace: true });
      } else {
        fetchRoomDetails(false);
      }
    } catch (err) {
      console.error('Error submitting coding round:', err);
      if (!isAuto) {
        alert('Failed to submit coding round. Please try again.');
      }
    }
  };

  const handleTimeUp = () => {
    alert("⌛ Time's up for this section! Submitting answers and moving to the next round...");
    if (currentRound <= 5) {
      setAutoSubmitTrigger(prev => prev + 1);
    } else {
      handleCodingRoundSubmit(true);
    }
  };

  useEffect(() => {
    if (interview && interview.status !== 'completed' && secondsLeft > 0) {
      const timer = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [interview, secondsLeft, currentRound]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-white">
          <Loader size={36} className="animate-spin text-brand-500" />
          <span className="ml-3 font-semibold text-dark-300">Authorizing entry to interview room...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-6 text-center">
          <div className="bg-dark-900 border border-dark-850 p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center">
            <AlertCircle size={44} className="text-red-500 mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Access Blocked</h2>
            <p className="text-xs text-dark-400 leading-relaxed mb-6">{error}</p>
            <button
              onClick={() => navigate(user?.role === 'interviewer' ? '/interviewer-dashboard' : '/dashboard')}
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col text-white">
      {/* Header bar */}
      <header className="bg-dark-950 border-b border-dark-850 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="font-bold text-base bg-gradient-to-r from-white to-brand-400 bg-clip-text text-transparent">
            {interview.title}
          </span>
          <div className="hidden md:flex items-center gap-1.5 bg-dark-900 border border-dark-800 px-2.5 py-1 rounded-lg text-[10px]">
            <span className="text-dark-500 uppercase font-bold">Candidate:</span>
            <span className="text-white font-semibold">{interview.candidate_name}</span>
          </div>
          <span className="text-[10px] uppercase font-extrabold bg-brand-500/10 border border-brand-500/25 text-brand-400 px-2.5 py-1 rounded-lg">
            {currentRound === 1 && 'Round 1: Numerical Ability'}
            {currentRound === 2 && 'Round 2: Verbal Ability'}
            {currentRound === 3 && 'Round 3: Reasoning Ability'}
            {currentRound === 4 && 'Round 4: Advanced Quant'}
            {currentRound === 5 && 'Round 5: Advanced Reasoning'}
            {currentRound === 6 && 'Round 6: Coding Easy'}
            {currentRound === 7 && 'Round 7: Coding Hard'}
            {currentRound > 7 && 'Finished'}
          </span>
        </div>

        {/* Live connections & timer */}
        <div className="flex items-center gap-4">
          {/* Section Timer Countdown */}
          {interview && interview.status !== 'completed' && currentRound <= 7 && (
            <div className="flex flex-col items-end">
              <span className="text-[8px] uppercase font-bold text-dark-500">Round Time Remaining</span>
              <div className={`font-mono text-base font-extrabold tracking-tight ${secondsLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-brand-400'}`}>
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
              </div>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5 bg-dark-900 border border-dark-800 px-3 py-1 rounded-lg">
            {connected ? (
              <>
                <Wifi size={12} className="text-green-500" />
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Sync Live</span>
              </>
            ) : (
              <>
                <WifiOff size={12} className="text-red-500 animate-pulse" />
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Offline</span>
              </>
            )}
          </div>

          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-1 bg-dark-900 border border-dark-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-dark-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={12} />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* Lobby Toast Notification banner */}
      {notifyMessage && (
        <div className="mx-6 mt-4 bg-brand-600/10 border border-brand-500/30 text-brand-400 text-xs px-4 py-2.5 rounded-xl font-bold flex items-center justify-between animate-pulse">
          <span>{notifyMessage}</span>
          <button onClick={() => setNotifyMessage('')} className="text-dark-500 hover:text-white font-bold cursor-pointer">X</button>
        </div>
      )}

      {/* Workspace */}
      {interview.status === 'completed' || currentRound > 7 ? (
        <div className="flex-grow flex items-center justify-center p-6 text-center">
          <div className="bg-dark-900 border border-dark-850 p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center">
            <CheckCircle size={48} className="text-green-500 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-white mb-2">Assessment Completed!</h2>
            <p className="text-xs text-dark-400 leading-relaxed mb-6">
              Congratulations! You have successfully completed all 7 rounds of this TCS NQT assessment. Your answers and code have been recorded.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : user.role === 'candidate' && currentRound <= 5 ? (
        <div className="flex-grow p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto h-full">
            <AssessmentPanel
              interviewId={interview.id}
              currentRound={currentRound}
              autoSubmitTrigger={autoSubmitTrigger}
              onSubmitSuccess={(nextRound, score) => {
                setCurrentRound(nextRound);
                fetchRoomDetails(false);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-5 p-4 gap-4 h-[calc(100vh-125px)] overflow-y-auto lg:overflow-hidden">
        
        {/* Left Column (2/5 Width): Tabs Switcher (Question, Chat, Notes, Evaluation) */}
        <div className="lg:col-span-2 flex flex-col h-full bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Tab selector bar */}
          <div className="bg-dark-950 border-b border-dark-850 px-3 py-2 flex gap-1 items-center overflow-x-auto">
            <button
              onClick={() => setActiveLeftTab('question')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeLeftTab === 'question' ? 'bg-brand-650/15 text-brand-400 border border-brand-500/25' : 'text-dark-400 hover:text-white'
              }`}
            >
              <BookOpen size={13} />
              <span>Question</span>
            </button>
            <button
              onClick={() => setActiveLeftTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeLeftTab === 'chat' ? 'bg-brand-650/15 text-brand-400 border border-brand-500/25' : 'text-dark-400 hover:text-white'
              }`}
            >
              <MessageSquare size={13} />
              <span>Live Chat</span>
            </button>

            {user.role === 'interviewer' && (
              <>
                <button
                  onClick={() => setActiveLeftTab('notes')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeLeftTab === 'notes' ? 'bg-brand-650/15 text-brand-400 border border-brand-500/25' : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck size={13} />
                  <span>Notes</span>
                </button>
                <button
                  onClick={() => setActiveLeftTab('evaluation')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeLeftTab === 'evaluation' ? 'bg-brand-650/15 text-brand-400 border border-brand-500/25' : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <Award size={13} />
                  <span>Scorecard</span>
                </button>
              </>
            )}
          </div>

          {/* Active Tab Panel Frame */}
          <div className="flex-grow overflow-y-auto">
            {activeLeftTab === 'question' && currentRound <= 5 ? (
              <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 flex flex-col h-full shadow-lg">
                <div className="flex items-center justify-between border-b border-dark-850 pb-3 mb-4">
                  <h3 className="font-bold text-xs text-dark-300 uppercase tracking-wider">Assessment Rounds</h3>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-2 bg-dark-950 border border-dark-850 rounded-xl">
                    <div>
                      <span className="text-[8px] text-dark-500 uppercase font-bold">Round 1</span>
                      <h4 className="text-[10px] font-bold text-white">Numerical Ability</h4>
                    </div>
                    <span className="text-[10px] font-semibold">
                      {interview.round1_score !== null ? `✅ ${interview.round1_score} / 20` : (currentRound === 1 ? '✍️ Active' : '⏳ Pending')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-dark-950 border border-dark-850 rounded-xl">
                    <div>
                      <span className="text-[8px] text-dark-500 uppercase font-bold">Round 2</span>
                      <h4 className="text-[10px] font-bold text-white">Verbal Ability</h4>
                    </div>
                    <span className="text-[10px] font-semibold">
                      {interview.round2_score !== null ? `✅ ${interview.round2_score} / 25` : (currentRound === 2 ? '✍️ Active' : '⏳ Pending')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-dark-950 border border-dark-850 rounded-xl">
                    <div>
                      <span className="text-[8px] text-dark-500 uppercase font-bold">Round 3</span>
                      <h4 className="text-[10px] font-bold text-white">Reasoning Ability</h4>
                    </div>
                    <span className="text-[10px] font-semibold">
                      {interview.round3_score !== null ? `✅ ${interview.round3_score} / 20` : (currentRound === 3 ? '✍️ Active' : '⏳ Pending')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-dark-950 border border-dark-850 rounded-xl">
                    <div>
                      <span className="text-[8px] text-dark-500 uppercase font-bold">Round 4</span>
                      <h4 className="text-[10px] font-bold text-white">Advanced Quant</h4>
                    </div>
                    <span className="text-[10px] font-semibold">
                      {interview.round4_score !== null ? `✅ ${interview.round4_score} / 10` : (currentRound === 4 ? '✍️ Active' : '⏳ Pending')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-dark-950 border border-dark-850 rounded-xl">
                    <div>
                      <span className="text-[8px] text-dark-500 uppercase font-bold">Round 5</span>
                      <h4 className="text-[10px] font-bold text-white">Advanced Reasoning</h4>
                    </div>
                    <span className="text-[10px] font-semibold">
                      {interview.round5_score !== null ? `✅ ${interview.round5_score} / 10` : (currentRound === 5 ? '✍️ Active' : '⏳ Pending')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-dark-950 border border-dark-850 rounded-xl">
                    <div>
                      <span className="text-[8px] text-dark-500 uppercase font-bold">Round 6</span>
                      <h4 className="text-[10px] font-bold text-white">Coding Easy</h4>
                    </div>
                    <span className="text-[10px] font-semibold">
                      {interview.round6_score !== null ? `✅ ${interview.round6_score} Passed` : (currentRound === 6 ? '✍️ Active' : '⏳ Pending')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-dark-950 border border-dark-850 rounded-xl">
                    <div>
                      <span className="text-[8px] text-dark-500 uppercase font-bold">Round 7</span>
                      <h4 className="text-[10px] font-bold text-white">Coding Hard</h4>
                    </div>
                    <span className="text-[10px] font-semibold">
                      {interview.round7_score !== null ? `✅ ${interview.round7_score} Passed` : (currentRound === 7 ? '✍️ Active' : '⏳ Pending')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              activeLeftTab === 'question' && (
                <QuestionPanel
                  roomId={roomId}
                  userRole={user.role}
                  socket={socket}
                  initialQuestion={interview}
                />
              )
            )}
            {activeLeftTab === 'chat' && (
              <ChatPanel
                roomId={roomId}
                user={user}
                socket={socket}
              />
            )}
            {activeLeftTab === 'notes' && user.role === 'interviewer' && (
              <NotesPanel interviewId={interview.id} />
            )}
            {activeLeftTab === 'evaluation' && user.role === 'interviewer' && (
              <EvaluationPanel
                interviewId={interview.id}
                onSubmitSuccess={() => navigate(`/details/${interview.id}`)}
              />
            )}
          </div>
        </div>

        {/* Right Column (3/5 Width): Monaco Editor OR Recruiter Monitor Panel */}
        <div className="lg:col-span-3 flex flex-col h-full gap-4 lg:overflow-hidden">
          {currentRound <= 5 && user.role === 'interviewer' ? (
            /* Interviewer Monitor Screen for Rounds 1, 2, 3, 4, 5 */
            <div className="flex-grow bg-dark-900 border border-dark-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl h-full justify-between">
              <div>
                <span className="text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Recruiter Monitor Mode
                </span>
                <h2 className="text-lg font-bold text-white mt-2">Live Candidate Assessment Tracker</h2>
                <p className="text-dark-450 text-[10px] mt-0.5 leading-normal">
                  The candidate is currently taking the multiple-choice rounds. Below is their real-time progress.
                </p>
              </div>

              {/* Progress Summary cards */}
              <div className="flex flex-col gap-2 flex-grow overflow-y-auto">
                <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${currentRound === 1 ? 'bg-brand-650/10 border-brand-500' : 'bg-dark-950 border-dark-850'}`}>
                  <div>
                    <span className="text-[7px] uppercase font-bold text-dark-500 block">Round 1</span>
                    <span className="text-xs font-bold text-white block">Numerical Ability</span>
                  </div>
                  <span className="text-xs font-bold font-mono">
                    {interview.round1_score !== null ? `✅ Score: ${interview.round1_score} / 20` : (currentRound === 1 ? '✍️ In Progress...' : '⏳ Pending')}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${currentRound === 2 ? 'bg-brand-650/10 border-brand-500' : 'bg-dark-950 border-dark-850'}`}>
                  <div>
                    <span className="text-[7px] uppercase font-bold text-dark-500 block">Round 2</span>
                    <span className="text-xs font-bold text-white block">Verbal Ability</span>
                  </div>
                  <span className="text-xs font-bold font-mono">
                    {interview.round2_score !== null ? `✅ Score: ${interview.round2_score} / 25` : (currentRound === 2 ? '✍️ In Progress...' : '⏳ Pending')}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${currentRound === 3 ? 'bg-brand-650/10 border-brand-500' : 'bg-dark-950 border-dark-850'}`}>
                  <div>
                    <span className="text-[7px] uppercase font-bold text-dark-500 block">Round 3</span>
                    <span className="text-xs font-bold text-white block">Reasoning Ability</span>
                  </div>
                  <span className="text-xs font-bold font-mono">
                    {interview.round3_score !== null ? `✅ Score: ${interview.round3_score} / 20` : (currentRound === 3 ? '✍️ In Progress...' : '⏳ Pending')}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${currentRound === 4 ? 'bg-brand-650/10 border-brand-500' : 'bg-dark-950 border-dark-850'}`}>
                  <div>
                    <span className="text-[7px] uppercase font-bold text-dark-500 block">Round 4</span>
                    <span className="text-xs font-bold text-white block">Advanced Quant</span>
                  </div>
                  <span className="text-xs font-bold font-mono">
                    {interview.round4_score !== null ? `✅ Score: ${interview.round4_score} / 10` : (currentRound === 4 ? '✍️ In Progress...' : '⏳ Pending')}
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${currentRound === 5 ? 'bg-brand-650/10 border-brand-500' : 'bg-dark-950 border-dark-850'}`}>
                  <div>
                    <span className="text-[7px] uppercase font-bold text-dark-500 block">Round 5</span>
                    <span className="text-xs font-bold text-white block">Advanced Reasoning</span>
                  </div>
                  <span className="text-xs font-bold font-mono">
                    {interview.round5_score !== null ? `✅ Score: ${interview.round5_score} / 10` : (currentRound === 5 ? '✍️ In Progress...' : '⏳ Pending')}
                  </span>
                </div>
              </div>

              {/* Status card */}
              <div className="bg-dark-950 p-3 rounded-xl border border-dark-850 flex flex-col gap-1">
                <span className="text-[8px] uppercase font-bold text-dark-500 block">Current Status</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0"></span>
                  <span className="text-[11px] font-medium text-dark-200">
                    Candidate is answering questions in <strong className="text-white">
                      {currentRound === 1 ? 'Numerical Ability' : currentRound === 2 ? 'Verbal Ability' : currentRound === 3 ? 'Reasoning Ability' : currentRound === 4 ? 'Advanced Quant' : 'Advanced Reasoning'}
                    </strong>.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Monaco Editor + Test Results drawer for Coding Rounds */
            <>
              <div className="flex-grow lg:h-3/5">
                <CodeEditor
                  roomId={roomId}
                  userRole={user.role}
                  socket={socket}
                  activeLanguage={activeLanguage}
                  onLanguageChange={handleLanguageChange}
                  onRunSuccess={(results) => {
                    setTestResults(results);
                    setActiveBottomTab('tests');
                  }}
                />
              </div>

              <div className="lg:h-2/5 flex flex-col bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-dark-950 border-b border-dark-850 px-3 py-2.5 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveBottomTab('output')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        activeBottomTab === 'output' ? 'bg-dark-850 text-white font-bold' : 'text-dark-500 hover:text-white'
                      }`}
                    >
                      <Terminal size={12} />
                      <span>Console Logs</span>
                    </button>
                    <button
                      onClick={() => setActiveBottomTab('tests')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        activeBottomTab === 'tests' ? 'bg-dark-850 text-white font-bold' : 'text-dark-500 hover:text-white'
                      }`}
                    >
                      <ClipboardList size={12} />
                      <span>Test Suite Results</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setActiveBottomTab('tests');
                        try {
                          const editorVal = window.monacoEditorValue || ''; 
                          const res = await api.post('/code/run', { 
                            language: activeLanguage, 
                            code: editorVal,
                            interview_id: interview.id
                          });
                          setTestResults(res.data);
                        } catch (err) {
                          console.error('Run tests error:', err);
                        }
                      }}
                      className="bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Run Tests
                    </button>
                    
                    {user.role === 'candidate' && (
                      <button
                        onClick={() => handleCodingRoundSubmit(false)}
                        className="bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {currentRound === 6 ? 'Submit Code & Go to Round 7' : 'Submit & Complete Assessment'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                  {activeBottomTab === 'output' ? (
                    <div className="p-4 text-xs text-dark-400 font-mono leading-relaxed bg-dark-950/40 h-full">
                      {testResults?.stdout ? (
                        <pre className="text-green-400 whitespace-pre-wrap">{testResults.stdout}</pre>
                      ) : testResults?.stderr ? (
                        <pre className="text-red-400 whitespace-pre-wrap">{testResults.stderr}</pre>
                      ) : (
                        <span className="italic text-dark-500">Run tests to see stdout console logging output.</span>
                      )}
                    </div>
                  ) : (
                    <TestResultsPanel output={testResults} />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )}

        {/* Floating Media & Video Panel */}
        <div className="fixed bottom-6 right-6 z-40 bg-dark-900 border border-dark-800 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 w-64">
          <div className="flex items-center justify-between text-xs font-bold border-b border-dark-850 pb-1.5 mb-1 text-dark-350">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
              <span>Live Workspace Call</span>
            </span>
            <span className="text-[9px] text-dark-500 uppercase">Device Sync</span>
          </div>

          {/* Video feeds grid container */}
          <div className="grid grid-cols-2 gap-2 h-24">
            {/* Local Video Stream */}
            <div className="bg-dark-950 border border-dark-850 rounded-xl relative overflow-hidden flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover rounded-xl absolute inset-0 ${localStream && !isVideoOff ? 'block' : 'hidden'}`}
              />
              {(!localStream || isVideoOff) && (
                <div className="text-[9px] text-dark-500 text-center font-bold uppercase leading-none z-10">Cam Off</div>
              )}
              <span className="absolute bottom-1 left-1 bg-black/60 text-[8px] font-bold px-1.5 py-0.5 rounded text-white uppercase leading-none z-10">
                You
              </span>
            </div>

            {/* Remote Video Stream */}
            <div className="bg-dark-950 border border-dark-850 rounded-xl relative overflow-hidden flex flex-col items-center justify-center text-center p-1">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover rounded-xl absolute inset-0 ${remoteStream ? 'block' : 'hidden'}`}
              />
              {!remoteStream && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 to-slate-950 flex flex-col items-center justify-center p-2 z-10">
                  {/* Pulsing ring */}
                  <div className="w-10 h-10 rounded-full border-2 border-brand-500/60 flex items-center justify-center animate-pulse mb-1.5 bg-brand-500/10">
                    <User size={16} className="text-brand-400" />
                  </div>
                  <div className="text-[10px] font-bold text-brand-300 tracking-wide uppercase leading-none">
                    {user.role === 'interviewer' ? 'Candidate' : 'Recruiter'}
                  </div>
                  <div className="text-[7px] text-dark-500 font-mono mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                    <span>LIVE SIMULATED</span>
                  </div>
                </div>
              )}
              <span className="absolute bottom-1 left-1 bg-black/60 text-[8px] font-bold px-1.5 py-0.5 rounded text-white uppercase leading-none z-10">
                Remote
              </span>
            </div>
          </div>

          {/* Local Screen Share Preview Frame */}
          {isSharingScreen && (
            <div className="bg-dark-950 border border-dark-850 rounded-xl h-28 relative overflow-hidden flex items-center justify-center mt-1">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-xl"
              />
              <span className="absolute top-1 right-1 bg-red-600/90 text-[7px] font-extrabold px-1 py-0.5 rounded text-white uppercase tracking-wider animate-pulse leading-none">
                Sharing
              </span>
              <span className="absolute bottom-1 left-1 bg-black/60 text-[8px] font-bold px-1.5 py-0.5 rounded text-white uppercase leading-none">
                Screen
              </span>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex gap-1 justify-between mt-1 pt-1.5 border-t border-dark-850">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl transition-all cursor-pointer text-xs font-bold flex-grow flex items-center justify-center gap-1 border ${
                isMuted 
                  ? 'bg-red-500/15 border-red-500/20 text-red-400' 
                  : 'bg-dark-950 border-dark-850 hover:bg-dark-800 text-dark-300'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff size={13} /> : <Mic size={13} />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-2 rounded-xl transition-all cursor-pointer text-xs font-bold flex-grow flex items-center justify-center gap-1 border ${
                isVideoOff 
                  ? 'bg-red-500/15 border-red-500/20 text-red-400' 
                  : 'bg-dark-950 border-dark-850 hover:bg-dark-800 text-dark-300'
              }`}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff size={13} /> : <Video size={13} />}
            </button>

            <button
              onClick={handleToggleScreenShare}
              className={`p-2 rounded-xl transition-all cursor-pointer text-xs font-bold flex-grow flex items-center justify-center gap-1 border ${
                isSharingScreen 
                  ? 'bg-red-500/15 border-red-500/20 text-red-400' 
                  : 'bg-dark-950 border-dark-850 hover:bg-dark-800 text-dark-300'
              }`}
              title={isSharingScreen ? 'Stop Sharing' : 'Share Screen'}
            >
              {isSharingScreen ? <MonitorOff size={13} /> : <Monitor size={13} />}
            </button>
          </div>
        </div>

    </div>
  );
};

export default InterviewRoom;
