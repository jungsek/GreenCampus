// controllers/energyBreakdownController.js
const CarbonBreakdown = require("../models/carbonBreakdown");

const getRecommendations = async (req, res) => {
    try {
        const { category } = req.params;
        const { categoryData } = req.body;

        if (!categoryData || !categoryData.message) {
            return res.status(400).json({ error: 'Missing category data' });
        }

        // Extract data from the message
        const data = CarbonBreakdown.extractDataFromMessage(categoryData.message);
        
        // Generate the prompt
        const prompt = CarbonBreakdown.generatePrompt(category, data);

        // Get AI recommendations
        const text = await CarbonBreakdown.generateRecommendations(prompt);

        // Format the response
        const formattedResponse = CarbonBreakdown.formatResponse(text);

        res.json(formattedResponse);
    } catch (error) {
        console.error('Error in energy breakdown controller:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
}

// Get all energy breakdowns
const getAllCarbonBreakdowns = async (req, res) => {
    try {
        const breakdowns = await CarbonBreakdown.getAllCarbonBreakdown();
        res.json(breakdowns);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving carbon breakdown data");
    }
};

// Get energy breakdowns by energy usage ID
const getCarbonBreakdownByFootprint = async (req, res) => {
    const carbonFootprintId = parseInt(req.params.carbonFootprintId);
    try {
        const breakdowns = await CarbonBreakdown.getCarbonBreakdownByFootprint(carbonFootprintId);
        if (!breakdowns) {
            return res.status(404).send("No carbon breakdown data found for this carbon footprint ID");
        }
        res.json(breakdowns);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving carbon breakdown data");
    }
};

// Get energy breakdowns by school

const getCarbonBreakdownBySchool = async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    try {
        const breakdowns = await CarbonBreakdown.getCarbonBreakdownBySchool(schoolId);
        if (!breakdowns) {
            return res.status(404).send("No carbon breakdown data found for this school");
        }
        res.json(breakdowns);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving carbon breakdown data");
    }
};

const getCarbonBreakdownPerYearBySchool = async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    const year = parseInt(req.params.year)
    try {
        const breakdowns = await CarbonBreakdown.getCarbonBreakdownPerYearBySchool(schoolId, year);
        if (!breakdowns) {
            return res.status(404).send("No carbon breakdown data found for this school in this year");
        }
        res.json(breakdowns);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving carbon breakdown data");
    }
};

/*
// Create new energy breakdown
const createEnergyBreakdown = async (req, res) => {
    try {
        const id = await CarbonBreakdown.createEnergyBreakdown(req.body);
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
        const breakdowns = await CarbonBreakdown.getBreakdownByCategory(energyUsageId, category);
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
        const percentages = await CarbonBreakdown.getPercentageByCategory(energyUsageId);
        if (!percentages) {
            return res.status(404).send("No percentage data found for this energy usage ID");
        }
        res.json(percentages);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving percentage data");
    }
};
*/

module.exports = {
    getAllCarbonBreakdowns,
    getCarbonBreakdownByFootprint,
    getCarbonBreakdownBySchool,
    getCarbonBreakdownPerYearBySchool,
    getRecommendations
};
