// routes/analyseChartRoute.js

const analyseChartController = require("../controllers/analyseChartController");

const analyseChartRoute = (app) => {
    // Route to analyse chart
    app.post('/api/analyse-chart', analyseChartController.analyseChart);
};

module.exports = analyseChartRoute;
