const userRoute = require("./userRoute.js");
const energyUsageRoute = require("./energyUsageRoute.js");
const energyBreakdownRoute = require("./energyBreakdownRoute.js");
const carbonFootprintRoute = require("./carbonFootprintRoute.js");
const reportRoute = require("./reportRoute.js"); 
const schoolRoute = require("./schoolRoute.js");
const recommendationsRoute = require("./recommendationsRoute.js");
const predictionsRoute = require("./predictionsRoute.js");
const goalRoute = require("./goalRoute.js")

const route = (app, upload) => {
    userRoute(app, upload);
    energyUsageRoute(app, upload);
    energyBreakdownRoute(app, upload);
    carbonFootprintRoute(app, upload);
    reportRoute(app, upload); 
    schoolRoute(app, upload);
    recommendationsRoute(app, upload);
    predictionsRoute(app, upload);
    goalRoute(app, upload)
};

module.exports = route;
