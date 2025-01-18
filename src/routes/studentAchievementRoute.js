// routes/studentAchievementRoute.js
const authenticateToken = require("../middlewares/authenticateToken");
const achievementController = require("../controllers/studentAchievementsController");


const studentAchievementRoute = (app) => {
    app.get("/studentAchievements", achievementController.getAllstudentAchievements);
    app.get("/studentAchievements/:id", achievementController.getstudentAchievementById);
    app.post("/studentAchievements", achievementController.createstudentAchievement);
    app.put("/studentAchievements/:id", achievementController.updateStudentAchievement);
    app.delete("/studentAchievements/:id", achievementController.deletestudentAchievement);
};

module.exports = studentAchievementRoute;