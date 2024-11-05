// routes/recommendationsRoute.js

const recommendationsController = require("../controllers/recommendationsController");

const recommendationsRoute = (app) => {
    // Route to generate recommendations
    app.post("/api/generate-recommendations", recommendationsController.generateRecommendations);
};

module.exports = recommendationsRoute;
