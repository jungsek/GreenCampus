const Achievement = require("../models/achievement");


// Get all achievements
const getAllAchievements = async (req, res) => {
    try {
        const achievement = await Achievement.getAllAchievements();
        res.json(achievement);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving achievements");
    }   
};

// Get a specific achievement by ID
const getAchievementById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const achievement = await Achievement.getAchievementById(id);
        if (!achievement) {
            return res.status(404).send("Achievement not found");
        }
        res.json(achievement);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving the achievement");
    }
};

// Update an existing achievement
const updateAchievement = async (req, res) => {
    const id = parseInt(req.params.id);
    const newAchievementData = req.body;
    try {
        const updatedAchievement = await Achievement.updateAchievement(id, newAchievementData);
        if (!updatedAchievement) {
            return res.status(404).send("Achievement not found");
        }
        res.json(updatedAchievement);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating the achievement");
    }
};

// Create a new achievement
const createAchievement = async (req, res) => {
    const newAchievementData = req.body;
    try {
        const newAchievement = await Achievement.createAchievement(newAchievementData);
        res.status(201).json(newAchievement);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating achievement");
    }
};

// Delete an achievement
const deleteAchievement = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await Achievement.deleteAchievement(id);
        res.status(204).send(); // No content to return
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting the Achievement");
    }
};

module.exports = {
    getAllAchievements,
    getAchievementById,
    updateAchievement,
    createAchievement,
    deleteAchievement
};