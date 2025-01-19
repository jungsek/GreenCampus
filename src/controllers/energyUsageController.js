const EnergyUsage = require("../models/energyUsage");

const getAllEnergyUsage = async (req, res) => {
    try {
        const energyUsage = await EnergyUsage.getAllEnergyUsage();
        res.json(energyUsage);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving energy usage data");
    }
};

const getEnergyUsageBySchool = async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    try {
        const energyUsage = await EnergyUsage.getEnergyUsageBySchool(schoolId);
        if (!energyUsage) {
            return res.status(404).send("No energy usage data found for this school");
        }
        res.json(energyUsage);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving energy usage data");
    }
};

const getEnergyUsageById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const energyUsage = await EnergyUsage.getEnergyUsageById(id);
        if (!energyUsage) {
            return res.status(404).send("No energy usage data found for this ID");
        }
        res.json(energyUsage);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving energy usage data");
    }
};

const createEnergyUsage = async (req, res) => {
    try {
        const id = await EnergyUsage.createEnergyUsage(req.body);
        res.status(201).json({ id: id });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating energy usage record");
    }
};

const getMonthlyEnergyUsage = async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    const year = parseInt(req.params.year);
    try {
        const monthlyData = await EnergyUsage.getMonthlyEnergyUsage(schoolId, year);
        if (!monthlyData) {
            return res.status(404).send("No monthly energy data found");
        }
        res.json(monthlyData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving monthly energy data");
    }
};

const getAvailableYears = async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    try {
        const years = await EnergyUsage.getAvailableYears(schoolId);
        res.json({ years });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving available years");
    }
};


module.exports = {
    getAllEnergyUsage,
    getEnergyUsageBySchool,
    getEnergyUsageById,
    createEnergyUsage,
    getMonthlyEnergyUsage,
    getAvailableYears
};