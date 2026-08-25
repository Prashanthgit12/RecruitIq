import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Video, Mic, ShieldAlert, Award, Calendar, Clock, ArrowRight, Camera, User } from 'lucide-react';

const InterviewLobby = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(200);

  // Media status checks
  const [mediaLoading, setMediaLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(null); // null, true, false
  const [micReady, setMicReady] = useState(null);
  const [previewStream, setPreviewStream] = useState(null);
  
  const previewVideoRef = React.useRef(null);

  const createSimulatedStream = (name) => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    
    let angle = 0;
    const interval = setInterval(() => {
      if (!ctx) return;
      
      const grad = ctx.createRadialGradient(160, 120, 10, 160, 120, 200);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 320, 240);
      
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(160, 120, 45 + Math.sin(angle) * 4, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.arc(160, 110, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(160, 150, 25, Math.PI, 0);
      ctx.fill();
      
      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name.toUpperCase(), 160, 195);
      ctx.fillStyle = '#64748b';
      ctx.font = '7px monospace';
      ctx.fillText('LOBBY SIMULATED PREVIEW', 160, 210);
      
      angle += 0.08;
    }, 50);

    const videoTrack = canvas.captureStream(20).getVideoTracks()[0];
    const stream = new MediaStream([videoTrack]);
    
    stream.stopSimulated = () => {
      clearInterval(interval);
      stream.getTracks().forEach(t => t.stop());
    };
    
    return stream;
  };

  // 1. Enforce user authentication redirect (Section 7)
  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/interview/room/${roomId}`, { replace: true });
    }
  }, [user, roomId, navigate]);

  // 2. Load room details
  useEffect(() => {
    const fetchLobbyDetails = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/interviews/room/${roomId}`);
        setInterview(res.data);
      } catch (err) {
        console.error('Lobby fetch error:', err);
        setErrorStatus(err.response?.status || 500);
        setError(err.response?.data?.message || 'Unable to load interview details.');
      } finally {
        setLoading(false);
      }
    };

    fetchLobbyDetails();
  }, [roomId, user]);

  // 3. Trigger WebRTC media devices check (Section 9)
  const checkMediaPermissions = async () => {
    setMediaLoading(true);
    setCameraReady(null);
    setMicReady(null);

    if (previewStream) {
      if (previewStream.stopSimulated) {
        previewStream.stopSimulated();
      } else {
        previewStream.getTracks().forEach(track => track.stop());
      }
      setPreviewStream(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraReady(true);
      setMicReady(true);
      setPreviewStream(stream);
    } catch (err) {
      console.warn('Media check failed:', err.name || err.message);
      let hasCam = false;
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraReady(true);
        hasCam = true;
        setPreviewStream(videoStream);
      } catch (vErr) {
        setCameraReady(false);
        const simulated = createSimulatedStream(user.name);
        setPreviewStream(simulated);
      }

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicReady(true);
        if (!hasCam) {
          audioStream.getTracks().forEach(t => t.stop());
        }
      } catch (aErr) {
        setMicReady(false);
      }
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    if (previewStream && previewVideoRef.current) {
      previewVideoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  useEffect(() => {
    if (user) {
      checkMediaPermissions();
    }
    return () => {
      if (previewStream) {
        if (previewStream.stopSimulated) {
          previewStream.stopSimulated();
        } else {
          previewStream.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, [user]);

  // 4. Join Session on click (Section 10)
  const handleJoin = async () => {
    try {
      await api.post(`/interviews/${interview.id}/join`);
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error('Error joining interview session:', err);
      alert('Failed to enter the interview room. Please try again.');
    }
  };

  const getFormattedDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getFormattedTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col text-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xs text-dark-400 animate-pulse">Loading Interview Lobby...</p>
        </div>
      </div>
    );
  }

  // Handle Invalid Link / Denied Errors (Section 16)
  if (error) {
    let errorTitle = 'Interview Not Found';
    let errorDescription = 'This interview link is invalid or no longer available.';

    if (errorStatus === 400) {
      errorTitle = 'Interview Completed';
      errorDescription = 'This interview has already ended.';
    } else if (errorStatus === 403) {
      errorTitle = 'Access Denied';
      errorDescription = 'You are not the candidate assigned to this interview.';
    }

    return (
      <div className="min-h-screen bg-dark-950 flex flex-col text-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-6 text-center">
          <div className="bg-dark-900 border border-dark-850 p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center">
            <ShieldAlert size={44} className="text-red-500 mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">{errorTitle}</h2>
            <p className="text-xs text-dark-400 leading-relaxed mb-6">{errorDescription}</p>
            <button
              onClick={() => navigate(user?.role === 'interviewer' ? '/interviewer-dashboard' : '/dashboard')}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col text-white">
      <Navbar />

      <div className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-dark-900 border border-dark-850 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
          <div className="text-center">
            <span className="text-[10px] bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Lobby Entrance
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white mt-3">Ready for Your Interview?</h1>
            <p className="text-dark-450 text-xs mt-1">Please test your media settings before entering the room.</p>
          </div>

          {/* Room Metadata Card */}
          <div className="bg-dark-950 p-5 rounded-2xl border border-dark-850 flex flex-col gap-3.5">
            <div>
              <span className="text-[9px] text-dark-500 font-bold uppercase tracking-wider">Interview Position</span>
              <h2 className="text-sm font-bold text-white mt-0.5">{interview.title}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mt-1">
              <div className="flex items-center gap-2">
                <User size={14} className="text-brand-400" />
                <div>
                  <span className="text-[8px] text-dark-500 font-bold uppercase block">Interviewer</span>
                  <span className="text-dark-200 font-semibold">{interview.interviewer_name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-brand-400" />
                <div>
                  <span className="text-[8px] text-dark-500 font-bold uppercase block">Duration</span>
                  <span className="text-dark-200 font-semibold">{interview.duration_minutes} minutes</span>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Calendar size={14} className="text-brand-400" />
                <div>
                  <span className="text-[8px] text-dark-500 font-bold uppercase block">Scheduled Date & Time</span>
                  <span className="text-dark-200 font-semibold">
                    {getFormattedDate(interview.scheduled_at)} at {getFormattedTime(interview.scheduled_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Screen */}
          <div className="bg-dark-950 border border-dark-850 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden h-48 shadow-inner">
            <video
              ref={previewVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover rounded-xl absolute inset-0 ${previewStream ? 'block' : 'hidden'}`}
            />
            
            {/* Fallback indicator */}
            {!previewStream && (
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-2.5 animate-pulse">
                  <Camera size={20} className="text-brand-400" />
                </div>
                <span className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">
                  {mediaLoading ? 'Checking Camera Permissions...' : 'Camera Access Disabled'}
                </span>
              </div>
            )}
          </div>

          {/* Media Check Card */}
          <div className="bg-dark-950 p-4 rounded-2xl border border-dark-850 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-dark-350">Device Access Verification</h3>
              <button
                onClick={checkMediaPermissions}
                disabled={mediaLoading}
                className="text-[10px] text-brand-400 font-bold hover:underline disabled:opacity-50 cursor-pointer"
              >
                Re-test Devices
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                cameraReady === true 
                  ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                  : cameraReady === false
                    ? 'bg-red-500/5 border-red-500/20 text-red-400'
                    : 'bg-dark-900 border-dark-800 text-dark-400 animate-pulse'
              }`}>
                <span className="flex items-center gap-1.5">
                  <Video size={13} />
                  <span>Camera</span>
                </span>
                <span className="text-[10px] uppercase font-bold">
                  {cameraReady === true ? '✓ Ready' : cameraReady === false ? '✗ Blocked' : 'Checking...'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                micReady === true 
                  ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                  : micReady === false
                    ? 'bg-red-500/5 border-red-500/20 text-red-400'
                    : 'bg-dark-900 border-dark-800 text-dark-400 animate-pulse'
              }`}>
                <span className="flex items-center gap-1.5">
                  <Mic size={13} />
                  <span>Microphone</span>
                </span>
                <span className="text-[10px] uppercase font-bold">
                  {micReady === true ? '✓ Ready' : micReady === false ? '✗ Blocked' : 'Checking...'}
                </span>
              </div>
            </div>

            {/* Warning if media denied */}
            {(cameraReady === false || micReady === false) && (
              <p className="text-[9px] text-yellow-500 leading-normal italic text-center mt-1">
                ⚠️ Media devices blocked. Please allow browser camera and mic access to proceed.
              </p>
            )}
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleJoin}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10"
          >
            <span>Join Interview Room</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewLobby;
