import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import InterviewerDashboard from './pages/InterviewerDashboard';
import InterviewRoom from './pages/InterviewRoom';
import InterviewHistory from './pages/InterviewHistory';
import InterviewDetails from './pages/InterviewDetails';
import QuestionBank from './pages/QuestionBank';
import Analytics from './pages/Analytics';
import InterviewLobby from './pages/InterviewLobby';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Candidate Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['candidate']}>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />

            {/* Interviewer Dashboard */}
            <Route
              path="/interviewer-dashboard"
              element={
                <ProtectedRoute allowedRoles={['interviewer']}>
                  <InterviewerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared Interview Room */}
            <Route
              path="/room/:roomId"
              element={
                <ProtectedRoute>
                  <InterviewRoom />
                </ProtectedRoute>
              }
            />

            {/* Unprotected Candidate Lobby Entrance (handles login redirect in page) */}
            <Route path="/interview/room/:roomId" element={<InterviewLobby />} />

            {/* Shared History Page */}
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <InterviewHistory />
                </ProtectedRoute>
              }
            />

            {/* Shared Report Details Page */}
            <Route
              path="/details/:id"
              element={
                <ProtectedRoute>
                  <InterviewDetails />
                </ProtectedRoute>
              }
            />

            {/* Question Bank (Interviewer only) */}
            <Route
              path="/questions"
              element={
                <ProtectedRoute allowedRoles={['interviewer']}>
                  <QuestionBank />
                </ProtectedRoute>
              }
            />

            {/* Analytics Dashboard (Shared) */}
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
