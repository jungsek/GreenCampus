const chatbotController = require('../controllers/chatbotController');
const authenticateToken = require("../middlewares/authenticateToken");

const chatbotRoute = (app) => {
    app.post("/api/chatbot", chatbotController.handleChat);
};

module.exports = chatbotRoute;