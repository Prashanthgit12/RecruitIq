const db = require('../config/db');

const analyticsController = {
  /**
   * Fetch structured data for charting
   */
  async getDashboardAnalytics(req, res, next) {
    try {
      const { id: userId, role } = req.user;

      if (role === 'candidate') {
        // A. Candidate performance metrics
        const averagesQuery = `
          SELECT 
            AVG(communication_rating)::numeric(10,2) AS communication,
            AVG(problem_solving_rating)::numeric(10,2) AS problem_solving,
            AVG(coding_rating)::numeric(10,2) AS coding,
            AVG(technical_rating)::numeric(10,2) AS technical,
            AVG(overall_rating)::numeric(10,2) AS overall
          FROM evaluations e
          JOIN interviews i ON e.interview_id = i.id
          WHERE i.candidate_id = $1 AND i.status = 'completed';
        `;

        const historyQuery = `
          SELECT i.title, e.overall_rating, i.scheduled_at
          FROM evaluations e
          JOIN interviews i ON e.interview_id = i.id
          WHERE i.candidate_id = $1 AND i.status = 'completed'
          ORDER BY i.scheduled_at ASC;
        `;

        const totalQuery = `
          SELECT COUNT(*)::int FROM interviews WHERE candidate_id = $1 AND status = 'completed';
        `;

        const [avgRes, histRes, totalRes] = await Promise.all([
          db.query(averagesQuery, [userId]),
          db.query(historyQuery, [userId]),
          db.query(totalQuery, [userId]),
        ]);

        const avgs = avgRes.rows[0] || { communication: 0, problem_solving: 0, coding: 0, technical: 0, overall: 0 };
        
        return res.status(200).json({
          role: 'candidate',
          stats: {
            completedInterviews: totalRes.rows[0].count,
            overallAverage: avgs.overall || 0,
          },
          skillsRadar: [
            { subject: 'Communication', score: parseFloat(avgs.communication || 0) * 20 }, // Convert 1-5 to percentage 20-100%
            { subject: 'Problem Solving', score: parseFloat(avgs.problem_solving || 0) * 20 },
            { subject: 'Coding Skills', score: parseFloat(avgs.coding || 0) * 20 },
            { subject: 'Technical', score: parseFloat(avgs.technical || 0) * 20 },
            { subject: 'Overall', score: parseFloat(avgs.overall || 0) * 20 },
          ],
          scoreProgress: histRes.rows.map((row) => ({
            name: row.title,
            score: parseFloat(row.overall_rating || 0) * 20, // 20-100
            date: new Date(row.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          })),
        });
      } else {
        // B. Recruiter overview metrics
        const languageDistQuery = `
          SELECT programming_language, COUNT(*)::int
          FROM interviews
          WHERE interviewer_id = $1
          GROUP BY programming_language;
        `;

        const diffDistQuery = `
          SELECT difficulty, COUNT(*)::int
          FROM interviews
          WHERE interviewer_id = $1
          GROUP BY difficulty;
        `;

        const monthlyInterviewsQuery = `
          SELECT TO_CHAR(scheduled_at, 'YYYY-MM') AS month, COUNT(*)::int
          FROM interviews
          WHERE interviewer_id = $1 AND status = 'completed'
          GROUP BY month
          ORDER BY month;
        `;

        const selectionRatesQuery = `
          SELECT e.result, COUNT(*)::int
          FROM evaluations e
          JOIN interviews i ON e.interview_id = i.id
          WHERE i.interviewer_id = $1
          GROUP BY e.result;
        `;

        const [langRes, diffRes, monthRes, selectRes] = await Promise.all([
          db.query(languageDistQuery, [userId]),
          db.query(diffDistQuery, [userId]),
          db.query(monthlyInterviewsQuery, [userId]),
          db.query(selectionRatesQuery, [userId]),
        ]);

        // Map selection status to charts friendly format
        const selectionData = [
          { name: 'Selected', value: 0, color: '#10B981' },
          { name: 'On Hold', value: 0, color: '#FBBF24' },
          { name: 'Rejected', value: 0, color: '#EF4444' },
        ];

        selectRes.rows.forEach((row) => {
          if (row.result === 'selected') selectionData[0].value = row.count;
          else if (row.result === 'on_hold') selectionData[1].value = row.count;
          else if (row.result === 'rejected') selectionData[2].value = row.count;
        });

        return res.status(200).json({
          role: 'interviewer',
          languages: langRes.rows.map((row) => ({
            name: row.programming_language ? row.programming_language.toUpperCase() : 'UNKNOWN',
            count: row.count,
          })),
          difficulties: diffRes.rows.map((row) => ({
            name: row.difficulty || 'Medium',
            count: row.count,
          })),
          completedTimeline: monthRes.rows.map((row) => ({
            name: row.month,
            count: row.count,
          })),
          selectionRatio: selectionData.filter(d => d.value > 0), // Filter empty slices
        });
      }
    } catch (err) {
      next(err);
    }
  },
};

module.exports = analyticsController;
