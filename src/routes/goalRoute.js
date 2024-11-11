// routes/energyRoutes.js
const goalController = require("../controllers/goalController");
const authenticateToken = require("../middlewares/authenticateToken");

// Create routes
const goalRoute = (app) => {
    app.get("/goals", goalController.getAllGoals); // Get all energy usage records
    app.get("/goals/:id", goalController.getGoalById); // Get energy usage by school
    app.get("/goals/school/:schoolId", goalController.getGoalsBySchool)
    app.post("/goals", goalController.createGoal); // Create new energy usage record
    app.put("/goals/:id", goalController.updateGoal); // Get monthly energy usage for a school
    app.delete("/goals/:id", goalController.deleteGoal); // Get monthly energy usage for a school
};

module.exports = goalRoute;
