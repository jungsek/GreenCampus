// controllers/energyBreakdownController.js
const EnergyBreakdown = require("../models/energyBreakdown");

// Get all energy breakdowns
const getAllEnergyBreakdowns = async (req, res) => {
    try {
        const breakdowns = await EnergyBreakdown.getAllEnergyBreakdown();
        res.json(breakdowns);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving energy breakdown data");
    }
};

// Get energy breakdowns by energy usage ID
const getEnergyBreakdownByUsage = async (req, res) => {
    const energyUsageId = parseInt(req.params.energyUsageId);
    try {
        const breakdowns = await EnergyBreakdown.getEnergyBreakdownByUsage(energyUsageId);
        if (!breakdowns) {
            return res.status(404).send("No energy breakdown data found for this energy usage ID");
        }
        res.json(breakdowns);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving energy breakdown data");
    }
};

// Get energy breakdowns by school
const getEnergyBreakdownBySchool = async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    try {
        const breakdowns = await EnergyBreakdown.getEnergyBreakdownBySchool(schoolId);
        if (!breakdowns) {
            return res.status(404).send("No energy breakdown data found for this school");
        }
        res.json(breakdowns);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving energy breakdown data");
    }
};

const getEnergyBreakdownPerYearBySchool = async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    const year = parseInt(req.params.year)
    try {
        const breakdowns = await EnergyBreakdown.getEnergyBreakdownPerYearBySchool(schoolId, year);
        if (!breakdowns) {
            return res.status(404).send("No energy breakdown data found for this school in this year");
        }
        res.json(breakdowns);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving energy breakdown data");
    }
};

// Create new energy breakdown
const createEnergyBreakdown = async (req, res) => {
    try {
        const id = await EnergyBreakdown.createEnergyBreakdown(req.body);
        res.status(201).json({ id: id });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating energy breakdown record");
    }
};

// Get breakdown by category for a specific energy usage ID
const getBreakdownByCategory = async (req, res) => {
    const energyUsageId = parseInt(req.params.energyUsageId);
    const category = req.params.category; // Assuming category is passed as a route parameter
    try {
        const breakdowns = await EnergyBreakdown.getBreakdownByCategory(energyUsageId, category);
        if (!breakdowns) {
            return res.status(404).send("No energy breakdown data found for this category");
        }
        res.json(breakdowns);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving energy breakdown data");
    }
};

// Get percentage by category for a specific energy usage ID
const getPercentageByCategory = async (req, res) => {
    const energyUsageId = parseInt(req.params.energyUsageId);
    try {
        const percentages = await EnergyBreakdown.getPercentageByCategory(energyUsageId);
        if (!percentages) {
            return res.status(404).send("No percentage data found for this energy usage ID");
        }
        res.json(percentages);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving percentage data");
    }
};

module.exports = {
    getAllEnergyBreakdowns,
    getEnergyBreakdownByUsage,
    getEnergyBreakdownBySchool,
    getEnergyBreakdownPerYearBySchool,
    createEnergyBreakdown,
    getBreakdownByCategory,
    getPercentageByCategory
};
