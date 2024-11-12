const School = require("../models/school")
const fs = require('fs');
require("dotenv").config()

const getAllSchools = async (req, res) => {
    try {
      const schools = await School.getAllSchools()
      res.json(schools)
    } catch (error) {
      console.error(error)
      res.status(500).send("Error retrieving schools")
    }
  }
  
  const getSchoolById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const school = await School.getSchoolById(id)
      if (!school) {
        return res.status(404).send("School not found")
      }
      res.json(school);
    } catch (error) {
      console.error(error)
      res.status(500).send("Error retrieving school")
    }
  }

  const getSchoolByStudentId = async (req, res) => {
    const studentid = parseInt(req.params.id);
    try {
      const school = await School.getSchoolByStudentId(studentid)
      if (!school) {
        return res.status(404).send("School not found")
      }
      res.json(school);
    } catch(error) {
      console.error(error)
      res.status(500).send("Error retrieving school")
    }
  }

  const getSchoolsByName = async (req, res) => {
    const name = req.query.name;
    if (!name) {
        return res.status(400).json({ error: 'Name query parameter is required.' });
    }
    try {
        const schools = await School.getSchoolsByName(name);
        if (!schools) {
            return res.status(404).json({ error: 'No schools found with the provided name.' });
        }
        res.json(schools);
    } catch (error) {
        console.error('Error fetching schools by name:', error);
        res.status(500).json({ error: 'An error occurred while fetching schools.' });
    }
  }

  const getSchoolsCarbonFootprintByCurrentYear = async (req, res) => {
    try {
        const carbonFootprints = await School.getSchoolsCarbonFootprintByCurrentYear();
        res.json(carbonFootprints);
    } catch (error) {
        console.error('Error retrieving schools carbon footprint by current year:', error);
        res.status(500).send("Error retrieving schools carbon footprint by current year");
    }
  }

  const getSchoolsCarbonFootprintByCurrentMonth = async (req, res) => {
    try {
        const carbonFootprints = await School.getSchoolsCarbonFootprintByCurrentMonth();
        res.json(carbonFootprints);
    } catch (error) {
        console.error('Error retrieving schools carbon footprint by current month:', error);
        res.status(500).send("Error retrieving schools carbon footprint by current month");
    }
  }

  const getSchoolsEnergyUsageByCurrentYear = async (req, res) => {
    try {
        const energyUsage = await School.getSchoolsEnergyUsageByCurrentYear();
        res.json(energyUsage);
    } catch (error) {
        console.error('Error retrieving schools energy usage by current year:', error);
        res.status(500).send("Error retrieving schools energy usage by current year");
    }
  }

  const getSchoolsEnergyUsageByCurrentMonth= async (req, res) => {
    try {
        const energyUsage = await School.getSchoolsEnergyUsageByCurrentMonth();
        res.json(energyUsage);
    } catch (error) {
        console.error('Error retrieving schools energy usage by current month:', error);
        res.status(500).send("Error retrieving schools energy usage by current month");
    }
  }

module.exports = {
    getAllSchools,
    getSchoolById,
    getSchoolByStudentId,
    getSchoolsByName,
    getSchoolsCarbonFootprintByCurrentYear,
    getSchoolsCarbonFootprintByCurrentMonth,
    getSchoolsEnergyUsageByCurrentYear,
    getSchoolsEnergyUsageByCurrentMonth
}