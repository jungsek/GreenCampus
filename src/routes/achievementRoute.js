// routes/achievementRoute.js
const authenticateToken = require("../middlewares/authenticateToken");
const achievementController = require("../controllers/achievementController");


const achievementRoute = (app) => {
    app.get("/achievements", achievementController.getAllAchievements);
    app.get("/achievements/:id", achievementController.getAchievementById);
    app.post("/achievements", achievementController.createAchievement);
    app.put("/achievements/:id", achievementController.updateAchievement);
    app.delete("/achievements/:id", achievementController.deleteAchievement);
};

module.exports = achievementRoute;