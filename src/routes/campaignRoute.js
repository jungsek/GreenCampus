// routes/energyRoutes.js
const campaignController = require("../controllers/campaignController");
const authenticateToken = require("../middlewares/authenticateToken");

// Create routes
const campaignRoute = (app) => {
    app.get("/campaigns", campaignController.getAllCampaigns); // Get all energy usage records
    app.get("/campaigns/:id", campaignController.getCampaignById); // Get energy usage by school
    app.get("/campaigns/school/:schoolId", campaignController.getCampaignsBySchool)
    app.get("/campaigns/count/:id", campaignController.getCampaignSignUps)
    app.get("/campaigns/student/:studentId", campaignController.getSignedUpCampaignsByStudent)
    app.post("/campaigns", campaignController.createCampaign); // Create new energy usage record
    app.post("/campaigns/signup/:studentId/:id", campaignController.signUpStudentForCampaign)
    app.put("/campaigns/:id", campaignController.updateCampaign); // Get monthly energy usage for a school
    app.delete("/campaigns/:id", campaignController.deleteCampaign); // Get monthly energy usage for a school
};

module.exports = campaignRoute;
