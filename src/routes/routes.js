const userRoute = require("./userRoute.js");
const energyUsageRoute = require("./energyUsageRoute.js");
const energyBreakdownRoute = require("./energyBreakdownRoute.js");
const carbonFootprintRoute = require("./carbonFootprintRoute.js");
const reportRoute = require("./reportRoute.js"); 
const schoolRoute = require("./schoolRoute.js");

const route = (app, upload) => {
    userRoute(app, upload);
    energyUsageRoute(app, upload);
    energyBreakdownRoute(app, upload);
    carbonFootprintRoute(app, upload);
    reportRoute(app, upload); 
    schoolRoute(app, upload);
};

module.exports = route;
