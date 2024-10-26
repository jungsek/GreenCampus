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

module.exports = {
    getAllSchools,
    getSchoolById,
    getSchoolByStudentId
}