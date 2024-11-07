// routes/energyRoutes.js
const energyController = require("../controllers/energyUsageController");
const authenticateToken = require("../middlewares/authenticateToken");

// Create routes
const energyRoute = (app) => {
    app.get("/energy-usage", energyController.getAllEnergyUsage); // Get all energy usage records
    app.get("/energy-usage/school/:schoolId", energyController.getEnergyUsageBySchool); // Get energy usage by school
    app.post("/energy-usage", energyController.createEnergyUsage); // Create new energy usage record
    app.get("/energy-usage/school/:schoolId/month/:year", energyController.getMonthlyEnergyUsage); // Get monthly energy usage for a school
    app.get("/api/energy-usage/:schoolId/years", energyController.getAvailableYears);
    app.get("/api/energy-usage/:schoolId/monthly/:year", energyController.getMonthlyEnergyUsage);
};

module.exports = energyRoute;
