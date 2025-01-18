const carbonBreakdownController = require("../controllers/carbonBreakdownController");
const authenticateToken = require("../middlewares/authenticateToken");


const carbonBreakdownRoute = (app) => {
    app.get("/carbon-breakdowns", carbonBreakdownController.getAllCarbonBreakdowns); // Get all energy breakdowns
    app.get("/carbon-breakdowns/footprint/:carbonFootprintId", carbonBreakdownController.getCarbonBreakdownByFootprint); // Get breakdowns by energy usage ID
    app.get("/carbon-breakdowns/school/:schoolId", carbonBreakdownController.getCarbonBreakdownBySchool); // Get breakdowns by school
    app.get("/carbon-breakdowns/school/:schoolId/:year", carbonBreakdownController.getCarbonBreakdownPerYearBySchool); // Get breakdowns by schoo
};

module.exports = carbonBreakdownRoute;
