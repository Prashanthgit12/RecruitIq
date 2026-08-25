require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Create transporter dynamically based on configured SMTP credentials
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port) || 587,
    secure: parseInt(port) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

const emailService = {
  /**
   * Send Interview Invitation Email
   * @param {Object} params - email invitation configurations
   * @param {string} params.candidateName - candidate name
   * @param {string} params.candidateEmail - candidate email
   * @param {string} params.interviewTitle - interview title
   * @param {string} params.scheduledAt - date/time formatted
   * @param {string} params.durationMinutes - duration
   * @param {string} params.joinLink - frontend join link
   */
  async sendInvitation({
    candidateName,
    candidateEmail,
    interviewTitle,
    scheduledAt,
    durationMinutes,
    joinLink
  }) {
    const fromEmail = process.env.EMAIL_FROM || 'interviews@smartroom.com';
    const subject = `Interview Invitation – ${interviewTitle}`;
    
    const htmlBody = `
      Hello ${candidateName},<br/><br/>
      
      You have been invited to a technical interview.<br/><br/>
      
      <strong>Interview:</strong> ${interviewTitle}<br/>
      <strong>Date/Time:</strong> ${scheduledAt}<br/>
      <strong>Duration:</strong> ${durationMinutes} minutes<br/><br/>
      
      <strong>Join Interview:</strong> <a href="${joinLink}">${joinLink}</a><br/><br/>
      
      Please join a few minutes before the scheduled time.<br/><br/>
      
      Best regards,<br/>
      RecruitIQ Team
    `;

    const plainText = `
      Hello ${candidateName},

      You have been invited to a technical interview.

      Interview: ${interviewTitle}
      Date/Time: ${scheduledAt}
      Duration: ${durationMinutes} minutes

      Join Interview: ${joinLink}

      Please join a few minutes before the scheduled time.

      Best regards,
      RecruitIQ Team
    `;

    const transporter = getTransporter();
    if (!transporter) {
      console.log('\n✉️ --- MOCK EMAIL SENDER (DEVELOPMENT MODE) ---');
      console.log(`To: ${candidateName} <${candidateEmail}>`);
      console.log(`From: ${fromEmail}`);
      console.log(`Subject: ${subject}`);
      console.log('Body:');
      console.log(plainText);
      console.log('--------------------------------------------\n');
      return { status: 'mock_sent', message: 'Email logged to server console.' };
    }

    try {
      console.log(`🚀 Sending production invitation email via SMTP to ${candidateEmail}...`);
      await transporter.sendMail({
        from: fromEmail,
        to: candidateEmail,
        subject,
        text: plainText,
        html: htmlBody,
      });
      return { status: 'sent', provider: 'SMTP' };
    } catch (error) {
      console.error('❌ Error sending SMTP email:', error);
      throw error;
    }
  },

  /**
   * Send Real-Time Candidate Joined Alert to Interviewer
   */
  async sendCandidateJoinedNotification({
    interviewerName,
    interviewerEmail,
    candidateName,
    interviewTitle,
    roomLink
  }) {
    const fromEmail = process.env.EMAIL_FROM || 'interviews@smartroom.com';
    const subject = `⚠️ Candidate Joined Room – ${interviewTitle}`;
    
    const htmlBody = `
      Hello ${interviewerName},<br/><br/>
      
      The candidate, <strong>${candidateName}</strong>, has joined the interview room for "${interviewTitle}".<br/><br/>
      
      Please click the link below to enter the room and begin the session:<br/>
      <a href="${roomLink}">${roomLink}</a><br/><br/>
      
      Best regards,<br/>
      RecruitIQ Team
    `;

    const plainText = `
      Hello ${interviewerName},

      The candidate, ${candidateName}, has joined the interview room for "${interviewTitle}".

      Please enter the room to begin the session:
      ${roomLink}

      Best regards,
      RecruitIQ Team
    `;

    const transporter = getTransporter();
    if (!transporter) {
      console.log('\n✉️ --- MOCK EMAIL SENDER (DEVELOPMENT MODE) ---');
      console.log(`To Interviewer: ${interviewerName} <${interviewerEmail}>`);
      console.log(`From: ${fromEmail}`);
      console.log(`Subject: ${subject}`);
      console.log('Body:');
      console.log(plainText);
      console.log('--------------------------------------------\n');
      return { status: 'mock_sent', message: 'Email logged to server console.' };
    }

    try {
      console.log(`🚀 Sending candidate-joined email alert to interviewer ${interviewerEmail}...`);
      await transporter.sendMail({
        from: fromEmail,
        to: interviewerEmail,
        subject,
        text: plainText,
        html: htmlBody,
      });
      return { status: 'sent', provider: 'SMTP' };
    } catch (error) {
      console.error('❌ Error sending SMTP email:', error);
      throw error;
    }
  }
};

module.exports = emailService;
