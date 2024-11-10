const Goal = require("../models/goal");

// Get all goals
const getAllGoals = async (req, res) => {
    try {
        const goals = await Goal.getAllGoals();
        res.json(goals);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving goals");
    }
};

// Get goals by school ID
const getGoalsBySchool = async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    try {
        const goals = await Goal.getGoalsBySchool(schoolId);
        if (!goals) {
            return res.status(404).send("No goals found for this school");
        }
        res.json(goals);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving goals for this school");
    }
};

// Get a specific goal by ID
const getGoalById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const goal = await Goal.getGoalById(id);
        if (!goal) {
            return res.status(404).send("Goal not found");
        }
        res.json(goal);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving the goal");
    }
};

// Create a new goal
const createGoal = async (req, res) => {
    const newGoalData = req.body;
    try {
        const newGoal = await Goal.createGoal(newGoalData);
        res.status(201).json(newGoal);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating goal");
    }
};

// Update an existing goal
const updateGoal = async (req, res) => {
    const id = parseInt(req.params.id);
    const { year, goal, metric, metric_value } = req.body;
    try {
        const updatedGoal = await Goal.updateGoal(id, year, goal, metric, metric_value);
        if (!updatedGoal) {
            return res.status(404).send("Goal not found");
        }
        res.json(updatedGoal);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating the goal");
    }
};

// Delete a goal
const deleteGoal = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await Goal.deleteGoal(id);
        res.status(204).send(); // No content to return
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting the goal");
    }
};

module.exports = {
    getAllGoals,
    getGoalsBySchool,
    getGoalById,
    createGoal,
    updateGoal,
    deleteGoal,
};
