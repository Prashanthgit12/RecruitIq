const Interview = require('../models/interviewModel');
const Chat = require('../models/chatModel');

const activeRooms = {};

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    let currentRoom = null;
    let currentUserRole = null;

    socket.on('register-user', (userId) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      console.log(`👥 Socket ${socket.id} registered and joined room: user:${userId}`);
    });

    /**
     * User joins a specific interview room
     */
    socket.on('join-room', async ({ roomId, user }) => {
      if (!roomId || !user) return;

      // Socket Room joins authorization check (Section 11)
      try {
        const interview = await Interview.findByRoomId(roomId);
        if (!interview) {
          socket.emit('error', 'Unauthorized interview room');
          console.warn(`❌ Socket Join Blocked: Room ${roomId} not found.`);
          return;
        }

        // Verify user belongs to interview
        if (interview.candidate_id !== user.id && interview.interviewer_id !== user.id) {
          socket.emit('error', 'Unauthorized interview room');
          console.warn(`❌ Socket Join Blocked: User ${user.name} does not belong to interview ${roomId}.`);
          return;
        }

        // Verify status is scheduled, waiting, or active
        if (interview.status !== 'scheduled' && interview.status !== 'waiting' && interview.status !== 'active') {
          socket.emit('error', 'Unauthorized interview room');
          console.warn(`❌ Socket Join Blocked: Interview status is ${interview.status}.`);
          return;
        }
        
        // Authorization passed
        currentRoom = roomId;
        currentUserRole = user.role;
        socket.join(roomId);
        console.log(`👥 User ${user.name} (${user.role}) authorized and joined room: ${roomId}`);

        if (!activeRooms[roomId]) {
          const durationMinutes = interview.duration_minutes || 60;
          activeRooms[roomId] = {
            durationSeconds: durationMinutes * 60,
            status: 'paused',
            timerInterval: null,
            clientsCount: 0,
            code: null,
            language: interview.programming_language || 'javascript',
            question: {
              question_title: interview.question_title,
              question_description: interview.question_description,
              difficulty: interview.difficulty
            }
          };
        }

        activeRooms[roomId].clientsCount++;

        // Automatically start the timer when room is joined and paused
        if (activeRooms[roomId].status === 'paused' && activeRooms[roomId].durationSeconds > 0) {
          startCountdown(roomId);
        }

        // Restore cached states (Section 15)
        if (activeRooms[roomId].code) {
          socket.emit('code-update', {
            code: activeRooms[roomId].code,
            language: activeRooms[roomId].language,
          });
        }
        if (activeRooms[roomId].question?.question_title) {
          socket.emit('question-update', activeRooms[roomId].question);
        }

        // Send current timer state to the newly joined client
        socket.emit('timer-sync', {
          durationSeconds: activeRooms[roomId].durationSeconds,
          status: activeRooms[roomId].status,
        });

        // Broadcast user-joined to other users in the room
        socket.to(roomId).emit('user-joined', {
          id: socket.id,
          user: { id: user.id, name: user.name, role: user.role },
        });
        
        // Let the room know candidate or interviewer joined
        io.to(roomId).emit(user.role === 'interviewer' ? 'interviewer-joined' : 'candidate-joined', {
          id: socket.id,
          user: { id: user.id, name: user.name }
        });

        // Also notify the interviewer's dashboard in real-time when the candidate joins
        if (user.role === 'candidate' && interview.interviewer_id) {
          io.to(`user:${interview.interviewer_id}`).emit('interview-status-update', {
            interviewId: interview.id,
            status: 'active',
            candidateJoined: true
          });
        }
      } catch (err) {
        console.error('Socket authorization error:', err.message);
        socket.emit('error', 'Unauthorized interview room');
      }
    });

    /**
     * Live code changes sync (Candidate typing, Interviewer observing)
     */
    socket.on('code-change', ({ roomId, code, language }) => {
      if (!roomId) return;
      if (activeRooms[roomId]) {
        activeRooms[roomId].code = code;
        activeRooms[roomId].language = language;
      }
      socket.to(roomId).emit('code-update', { code, language });
    });

    /**
     * Live question details sync (Relays selected problem details to Candidate)
     */
    socket.on('question-update', async ({ roomId, question_title, question_description, difficulty }) => {
      if (!roomId) return;
      
      socket.to(roomId).emit('question-update', { question_title, question_description, difficulty });

      if (activeRooms[roomId]) {
        activeRooms[roomId].question = {
          question_title,
          question_description,
          difficulty
        };
      }

      // Save question details to DB
      try {
        const interview = await Interview.findByRoomId(roomId);
        if (interview) {
          await Interview.update(interview.id, {
            question_title,
            question_description,
            difficulty,
          });
        }
      } catch (dbErr) {
        console.error('Error saving updated question via socket:', dbErr.message);
      }
    });

    /**
     * REAL-TIME LIVE CHAT & TYPING CHANNELS
     */
    socket.on('chat-message', async ({ roomId, senderId, message, senderName, senderRole }) => {
      if (!roomId || !message) return;

      try {
        // Save chat message history to PostgreSQL
        const interview = await Interview.findByRoomId(roomId);
        if (interview) {
          const chatMsg = await Chat.create({
            interview_id: interview.id,
            sender_id: senderId,
            message,
          });

          // Broadcast the message back to all users in the room
          io.to(roomId).emit('chat-message', {
            id: chatMsg.id,
            interview_id: chatMsg.interview_id,
            sender_id: chatMsg.sender_id,
            message: chatMsg.message,
            sender_name: senderName,
            sender_role: senderRole,
            created_at: chatMsg.created_at,
          });
        }
      } catch (err) {
        console.error('Error broadcasting socket chat-message:', err.message);
      }
    });

    // Typing broadcasts
    socket.on('typing-start', ({ roomId, userName, userRole }) => {
      if (!roomId) return;
      socket.to(roomId).emit('typing-start', { userName, userRole });
    });

    socket.on('typing-stop', ({ roomId }) => {
      if (!roomId) return;
      socket.to(roomId).emit('typing-stop');
    });

    /**
     * Timer management events
     */
    function startCountdown(roomId) {
      const room = activeRooms[roomId];
      if (!room || room.timerInterval) return;

      room.status = 'running';
      
      room.timerInterval = setInterval(() => {
        if (room.durationSeconds > 0) {
          room.durationSeconds--;
          io.to(roomId).emit('timer-sync', {
            durationSeconds: room.durationSeconds,
            status: room.status,
          });
        } else {
          clearInterval(room.timerInterval);
          room.timerInterval = null;
          room.status = 'paused';
          io.to(roomId).emit('timer-sync', {
            durationSeconds: 0,
            status: 'paused',
          });
        }
      }, 1000);
    };

    socket.on('timer-start', ({ roomId }) => {
      if (!roomId || !activeRooms[roomId]) return;
      startCountdown(roomId);
      io.to(roomId).emit('timer-sync', {
        durationSeconds: activeRooms[roomId].durationSeconds,
        status: 'running',
      });
    });

    socket.on('timer-pause', ({ roomId }) => {
      const room = activeRooms[roomId];
      if (!roomId || !room) return;

      if (room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
      }
      room.status = 'paused';
      io.to(roomId).emit('timer-sync', {
        durationSeconds: room.durationSeconds,
        status: 'paused',
      });
    });

    socket.on('timer-resume', ({ roomId }) => {
      if (!roomId || !activeRooms[roomId]) return;
      startCountdown(roomId);
      io.to(roomId).emit('timer-sync', {
        durationSeconds: activeRooms[roomId].durationSeconds,
        status: 'running',
      });
    });

    socket.on('timer-add-time', ({ roomId }) => {
      const room = activeRooms[roomId];
      if (!roomId || !room) return;

      room.durationSeconds += 5 * 60;
      io.to(roomId).emit('timer-sync', {
        durationSeconds: room.durationSeconds,
        status: room.status,
      });
    });

    socket.on('interview-ended', async ({ roomId }) => {
      const room = activeRooms[roomId];
      if (!roomId) return;

      if (room) {
        if (room.timerInterval) {
          clearInterval(room.timerInterval);
        }
        delete activeRooms[roomId];
      }

      try {
        const interview = await Interview.findByRoomId(roomId);
        if (interview && interview.status !== 'completed') {
          await Interview.update(interview.id, { status: 'completed' });
        }
      } catch (dbErr) {
        console.error('Error marking interview completed via socket:', dbErr.message);
      }

      io.to(roomId).emit('interview-ended', {
        durationSeconds: 0,
        status: 'completed',
      });
    });

    // WebRTC video call signaling relays
    socket.on('webrtc-offer', ({ roomId, sdp }) => {
      socket.to(roomId).emit('webrtc-offer', sdp);
    });

    socket.on('webrtc-answer', ({ roomId, sdp }) => {
      socket.to(roomId).emit('webrtc-answer', sdp);
    });

    socket.on('webrtc-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('webrtc-candidate', candidate);
    });

    /**
     * User leaves the room or disconnects
     */
    const handleLeave = () => {
      if (currentRoom && activeRooms[currentRoom]) {
        const room = activeRooms[currentRoom];
        room.clientsCount--;
        
        socket.to(currentRoom).emit('user-left', { id: socket.id, role: currentUserRole });

        if (room.clientsCount <= 0) {
          if (room.timerInterval) {
            clearInterval(room.timerInterval);
          }
          delete activeRooms[currentRoom];
        }
      }
    };

    socket.on('leave-room', handleLeave);
    socket.on('disconnect', handleLeave);
  });
};

module.exports = socketHandler;
