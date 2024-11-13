const userRoute = require("./userRoute.js");
const energyUsageRoute = require("./energyUsageRoute.js");
const energyBreakdownRoute = require("./energyBreakdownRoute.js");
const carbonFootprintRoute = require("./carbonFootprintRoute.js");
const reportRoute = require("./reportRoute.js"); 
const schoolRoute = require("./schoolRoute.js");
const recommendationsRoute = require("./recommendationsRoute.js");
const predictionsRoute = require("./predictionsRoute.js");
const goalRoute = require("./goalRoute.js")
const campaignRoute = require("./campaignRoute.js")
const analyseChartRoute = require("./analyseChartRoute.js");

const route = (app, upload, getPool) => {
    userRoute(app, upload, getPool);
    energyUsageRoute(app, upload, getPool);
    energyBreakdownRoute(app, upload, getPool);
    carbonFootprintRoute(app, upload, getPool);
    reportRoute(app, upload, getPool);
    schoolRoute(app, upload, getPool);
    recommendationsRoute(app, upload, getPool);
    predictionsRoute(app, upload, getPool);
    goalRoute(app, upload, getPool);
    campaignRoute(app, upload, getPool);
    analyseChartRoute(app, upload, getPool);
};

module.exports = route;
