const CompanyPrepQuestion = require("../models/CompanyPrepQuestion");

// Get stats for companies (total questions, breakdown by difficulty)
exports.getCompanyStats = async (req, res) => {
  try {
    const stats = await CompanyPrepQuestion.aggregate([
      {
        $group: {
          _id: "$slug",
          total: { $sum: 1 },
          Easy: {
            $sum: { $cond: [{ $eq: ["$difficulty", "Easy"] }, 1, 0] }
          },
          Medium: {
            $sum: { $cond: [{ $eq: ["$difficulty", "Medium"] }, 1, 0] }
          },
          Hard: {
            $sum: { $cond: [{ $eq: ["$difficulty", "Hard"] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Format response as an object map { slug: { total, Easy, Medium, Hard } }
    const result = {};
    stats.forEach(stat => {
      result[stat._id] = {
        total: stat.total,
        byDiff: {
          Easy: stat.Easy,
          Medium: stat.Medium,
          Hard: stat.Hard
        }
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching company stats:", error);
    res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};

// Get all company prep questions
exports.getAllQuestions = async (req, res) => {
  try {
    const { company } = req.query;
    const filter = {};
    if (company) {
      filter.slug = company;
    }

    const questions = await CompanyPrepQuestion.find(filter).sort({ createdAt: -1 });
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching company prep questions:", error);
    res.status(500).json({ message: "Failed to fetch questions", error: error.message });
  }
};

// Get a single question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await CompanyPrepQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch question", error: error.message });
  }
};

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const newQuestion = new CompanyPrepQuestion(req.body);
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Failed to create question", error: error.message });
  }
};

// Update a question
exports.updateQuestion = async (req, res) => {
  try {
    const updatedQuestion = await CompanyPrepQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Failed to update question", error: error.message });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await CompanyPrepQuestion.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete question", error: error.message });
  }
};
