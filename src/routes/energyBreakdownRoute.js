const energyBreakdownController = require("../controllers/energyBreakdownController");
const authenticateToken = require("../middlewares/authenticateToken");


const energyBreakdownRoute = (app) => {
    app.get("/energy-breakdowns", energyBreakdownController.getAllEnergyBreakdowns); // Get all energy breakdowns
    app.get("/energy-breakdowns/usage/:energyUsageId", energyBreakdownController.getEnergyBreakdownByUsage); // Get breakdowns by energy usage ID
    app.get("/energy-breakdowns/school/:schoolId", energyBreakdownController.getEnergyBreakdownBySchool); // Get breakdowns by school
    app.post("/energy-breakdowns", energyBreakdownController.createEnergyBreakdown); // Create new energy breakdown
    app.get("/energy-breakdowns/usage/:energyUsageId/category/:category", energyBreakdownController.getBreakdownByCategory); // Get breakdown by category
    app.get("/energy-breakdowns/usage/:energyUsageId/percentage", energyBreakdownController.getPercentageByCategory); // Get percentage by category
};

module.exports = energyBreakdownRoute;
