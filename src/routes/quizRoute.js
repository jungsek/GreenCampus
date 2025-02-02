const quizController = require("../controllers/quizController");
const authenticateToken = require("../middlewares/authenticateToken");

const quizRoute = (app) => {
    app.post('/api/quizQns', quizController.getQuizQns);
};

module.exports = quizRoute;