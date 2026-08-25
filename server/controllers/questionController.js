const Question = require('../models/questionModel');
const TestCase = require('../models/testCaseModel');

const questionController = {
  /**
   * Get all questions with filters
   */
  async getAll(req, res, next) {
    try {
      const { search, category, difficulty, language } = req.query;
      const userId = req.user.id;

      const list = await Question.getAll(userId, { search, category, difficulty, language });
      return res.status(200).json(list);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get question by ID, including its test cases
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const question = await Question.findById(id);

      if (!question) {
        return res.status(404).json({ message: 'Question not found.' });
      }

      // Fetch test cases (Exclude hidden test cases for candidates to satisfy Phase 27)
      const allTestCases = await TestCase.findByQuestionId(id);
      const filteredTestCases = req.user.role === 'candidate'
        ? allTestCases.filter(tc => !tc.is_hidden)
        : allTestCases;

      return res.status(200).json({
        ...question,
        testCases: filteredTestCases
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create custom question with test cases
   */
  async create(req, res, next) {
    try {
      const {
        title,
        description,
        difficulty,
        category,
        tags,
        programmingLanguage,
        inputFormat,
        outputFormat,
        constraints,
        examples,
        starterCode,
        hints,
        expectedTimeComplexity,
        expectedSpaceComplexity,
        testCases // Array of { input, expected_output, is_hidden }
      } = req.body;

      if (!title || !description || !category) {
        return res.status(400).json({ message: 'Title, description, and category are required.' });
      }

      // Create question entry
      const question = await Question.create({
        title,
        description,
        difficulty,
        category,
        tags,
        programming_language: programmingLanguage,
        input_format: inputFormat,
        output_format: outputFormat,
        constraints,
        examples: typeof examples === 'string' ? examples : JSON.stringify(examples || []),
        starter_code: typeof starterCode === 'string' ? starterCode : JSON.stringify(starterCode || {}),
        hints,
        expected_time_complexity: expectedTimeComplexity,
        expected_space_complexity: expectedSpaceComplexity,
        created_by: req.user.id
      });

      // Save test cases if provided
      if (testCases && Array.isArray(testCases)) {
        for (const tc of testCases) {
          await TestCase.create({
            question_id: question.id,
            input: tc.input,
            expected_output: tc.expected_output,
            is_hidden: tc.is_hidden || false
          });
        }
      }

      return res.status(201).json({
        message: 'Custom question added to Question Bank.',
        question
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update question details
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const question = await Question.findById(id);

      if (!question) {
        return res.status(404).json({ message: 'Question not found.' });
      }

      if (question.created_by !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You can only edit questions created by you.' });
      }

      const allowedFields = [
        'title', 'description', 'difficulty', 'category', 'tags',
        'input_format', 'output_format', 'constraints', 'examples',
        'starter_code', 'hints', 'expected_time_complexity', 'expected_space_complexity'
      ];
      
      const updates = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (allowedFields.includes(key)) {
          updates[key] = typeof value === 'object' ? JSON.stringify(value) : value;
        }
      }

      const updated = await Question.update(id, updates);

      // Re-provision test cases if provided in body
      if (req.body.testCases && Array.isArray(req.body.testCases)) {
        await TestCase.deleteByQuestionId(id);
        for (const tc of req.body.testCases) {
          await TestCase.create({
            question_id: id,
            input: tc.input,
            expected_output: tc.expected_output,
            is_hidden: tc.is_hidden || false
          });
        }
      }

      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete custom question
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const question = await Question.findById(id);

      if (!question) {
        return res.status(404).json({ message: 'Question not found.' });
      }

      if (question.created_by !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You can only delete questions created by you.' });
      }

      await Question.delete(id);
      return res.status(200).json({ message: 'Question deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Toggle favorite bookmark
   */
  async toggleFavorite(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Toggle state: check if exists
      const list = await Question.getAll(userId, { search: '' });
      const question = list.find(q => q.id === parseInt(id));

      if (!question) {
        return res.status(404).json({ message: 'Question not found.' });
      }

      if (question.is_favorite) {
        await Question.removeFavorite(userId, id);
        return res.status(200).json({ message: 'Removed from bookmarks.', isFavorite: false });
      } else {
        await Question.addFavorite(userId, id);
        return res.status(200).json({ message: 'Bookmarked successfully.', isFavorite: true });
      }
    } catch (err) {
      next(err);
    }
  },
};

module.exports = questionController;
