//for students achievement progress
const studentAchievement = require("../models/studentAchievementsModel");


// Get all achievements
const getAllstudentAchievements = async (req, res) => {
    try {
        const achievement = await studentAchievement.getAllstudentAchievements();
        res.json(achievement);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving student achievements");
    }   
};

// Get a specific achievement by ID
const getstudentAchievementById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const achievement = await studentAchievement.getstudentAchievementById(id);
        if (!achievement) {
            return res.status(404).send("Student Achievement not found");
        }
        res.json(achievement);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving the student achievements");
    }
};

const getstudentAchievementByAchievementId = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const achievement = await studentAchievement.getstudentAchievementByAchievementId(id);
        if (!achievement) {
            return res.status(404).send("Student Achievement not found");
        }
        res.json(achievement);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving the student achievements");
    }
};

// Update an existing achievement
const updateStudentAchievement = async (req, res) => {
    const id = parseInt(req.params.id);
    const newAchievementData = req.body;
    try {
        const updatedAchievement = await studentAchievement.updateStudentAchievement(id, newAchievementData);
        if (!updatedAchievement) {
            return res.status(404).send("Achievement not found");
        }
        res.json(updatedAchievement);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating the student achievement");
    }
};

// Create a new achievement
const createstudentAchievement = async (req, res) => {
    const newAchievementData = req.body;
    try {
        const newAchievement = await studentAchievement.createstudentAchievement(newAchievementData);
        res.status(201).json(newAchievement);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating student achievement");
    }
};

// Delete an achievement
const deletestudentAchievement = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await studentAchievement.deletestudentAchievement(id);
        res.status(204).send(); // No content to return
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting the studentAchievement");
    }
};

// Update the completion status of an achievement
const updateComplete = async (req, res) => {
    const id = parseInt(req.params.id);
    const newAchievementData = req.body;
    try {
        const updatedAchievement = await studentAchievement.updateComplete(id, newAchievementData);
        if (!updatedAchievement) {
            return res.status(404).send("Achievement not found");
        }
        res.json(updatedAchievement);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating achievement completion status");
    }
};

module.exports = {
    getAllstudentAchievements,
    getstudentAchievementById,
    getstudentAchievementByAchievementId,
    updateStudentAchievement,
    createstudentAchievement,
    deletestudentAchievement,
    updateComplete
};