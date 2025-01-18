// controllers/carbonFootprint.js
const CarbonFootprint = require("../models/carbonFootprint")
require("dotenv").config()

const getAllCarbonFootprints = async (req, res) => {
    try {
        const footprints = await CarbonFootprint.getAllCarbonFootprints()
        res.json(footprints)
    } catch (error) {
        console.error(error)
        res.status(500).send("Error retrieving carbon footprints")
    }
}

const getCarbonFootprintById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const footprint = await CarbonFootprint.getCarbonFootprintById(id)
        if (!footprint) {
            return res.status(404).send("Carbon footprint record not found")
        }
        res.json(footprint);
    } catch (error) {
        console.error(error)
        res.status(500).send("Error retrieving carbon footprint")
    }
}

const getCarbonFootprintsBySchool = async (req, res) => {
    const school_id = parseInt(req.params.schoolId);
    try {
        const footprints = await CarbonFootprint.getCarbonFootprintsBySchool(school_id)
        if (!footprints) {
            return res.status(404).send("No carbon footprint records found for this school")
        }
        res.json(footprints);
    } catch (error) {
        console.error(error)
        res.status(500).send("Error retrieving school's carbon footprints")
    }
}

const getYearlyCarbonFootprint = async (req, res) => {
    const school_id = parseInt(req.params.schoolId);
    const year = parseInt(req.params.year);
    try {
        const footprints = await CarbonFootprint.getYearlyCarbonFootprint(school_id, year)
        if (!footprints) {
            return res.status(404).send("No carbon footprint records found for this year")
        }
        res.json(footprints);
    } catch (error) {
        console.error(error)
        res.status(500).send("Error retrieving yearly carbon footprints")
    }
}

const createCarbonFootprint = async (req, res) => {
    const { school_id, total_carbon_tons } = req.body;
    try {
        const newFootprint = await CarbonFootprint.createCarbonFootprint(
            parseInt(school_id), 
            parseFloat(total_carbon_tons)
        )
        res.status(201).json(newFootprint)
    } catch (error) {
        console.error(error)
        res.status(500).send("Error creating carbon footprint record")
    }
}

const updateCarbonFootprint = async (req, res) => {
    const id = parseInt(req.params.id);
    const { total_carbon_tons } = req.body;
    try {
        const updatedFootprint = await CarbonFootprint.updateCarbonFootprint(
            id, 
            parseFloat(total_carbon_tons)
        )
        if (!updatedFootprint) {
            return res.status(404).send("Carbon footprint record not found")
        }
        res.json(updatedFootprint)
    } catch (error) {
        console.error(error)
        res.status(500).send("Error updating carbon footprint")
    }
}

const deleteCarbonFootprint = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await CarbonFootprint.deleteCarbonFootprint(id)
        res.status(204).send()
    } catch (error) {
        console.error(error)
        res.status(500).send("Error deleting carbon footprint")
    }
}

const getMonthlyCarbonFootprint = async (req, res) => {
    const school_id = parseInt(req.params.schoolId);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    
    try {
        const total = await CarbonFootprint.getMonthlyCarbonFootprint(school_id, year, month)
        res.json({ total });
    } catch (error) {
        console.error(error)
        res.status(500).send("Error retrieving monthly carbon footprint")
    }
}


module.exports = {
    getAllCarbonFootprints,
    getCarbonFootprintById,
    getCarbonFootprintsBySchool,
    getYearlyCarbonFootprint,
    createCarbonFootprint,
    updateCarbonFootprint,
    deleteCarbonFootprint,
    getMonthlyCarbonFootprint
}