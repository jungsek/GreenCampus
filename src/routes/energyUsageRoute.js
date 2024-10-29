// routes/energyRoutes.js
const energyController = require("../controllers/energyController");
const authenticateToken = require("../middlewares/authenticateToken");
const validateEnergyUsage = require("../middlewares/validateEnergyUsage");
const validateCarbonFootprint = require("../middlewares/validateCarbonFootprint");

// Create routes
const energyRoute = (app) => {
    app.get("/energy-usage", energyController.getAllEnergyUsage); // Get all energy usage records
    app.get("/energy-usage/school/:schoolId", energyController.getEnergyUsageBySchool); // Get energy usage by school
    app.post("/energy-usage", validateEnergyUsage.validateCreate, energyController.createEnergyUsage); // Create new energy usage record
    app.get("/energy-usage/school/:schoolId/month/:year", energyController.getMonthlyEnergyUsage); // Get monthly energy usage for a school
};

module.exports = energyRoute;
