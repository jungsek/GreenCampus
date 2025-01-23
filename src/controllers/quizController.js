// controllers/quizController.js
const Quiz = require("../models/quiz");

const getQuizQns = async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({
                error: 'Topic is required'
            });
        }

        // Generate and format questions
        const questionsData = await Quiz.generateQuizQuestions(topic);
        const formattedQuestions = Quiz.formatQuestions(questionsData);
        
        // Always return an array of questions, even if it's fallback data
        res.json(formattedQuestions);

    } catch (error) {
        console.error('Error in quiz controller:', error);
        // Return fallback questions instead of an error
        res.json([{
            question: "What is one way to combat climate change?",
            options: [
                "Using renewable energy",
                "Increasing coal usage",
                "Cutting down forests",
                "Using more plastic"
            ],
            correctIndex: 0,
            explanation: "Renewable energy helps reduce greenhouse gas emissions."
        }]);
    }
};

module.exports = {
    getQuizQns
};