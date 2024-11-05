// routes/recommendationsRoute.js

const predictionsController = require("../controllers/predictionsController");

const predictionsRoute = (app) => {
    app.post('/api/predictions/generate', predictionsController.generatePrediction);
};

module.exports = predictionsRoute;
