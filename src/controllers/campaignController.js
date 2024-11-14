const Campaign = require("../models/campaign");

// Get all goals
const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.getAllCampaigns();
        res.json(campaigns);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving campaigns");
    }
};


const getCampaignsBySchool = async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    try {
        const campaigns = await Campaign.getCampaignsBySchool(schoolId);
        if (!campaigns) {
            return res.status(404).send("No campaigns found for this school");
        }
        res.json(campaigns);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving campaigns for this school");
    }
};

// Get a specific campaign by ID
const getCampaignById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const campaign = await Campaign.getCampaignById(id);
        if (!campaign) {
            return res.status(404).send("Campaign not found");
        }
        res.json(campaign);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving the campaign");
    }
};

const getSignedUpCampaignsByStudent = async (req, res) => {
    const id = parseInt(req.params.studentId)
    try {
        const campaigns = await Campaign.getSignedUpCampaignsByStudent(id);
        if (!campaigns) {
            return res.status(404).send("No campaigns signed up by this student");
        }
        res.json(campaigns);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving signed up campaigns for this student");
    }
}
const getCampaignSignUps = async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const count = await Campaign.getCampaignSignUps(id);
        res.json(count);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving signed up campaigns for this student");
    }
}
// Create a new campaign
const createCampaign = async (req, res) => {
    const newCampaignData = req.body;
    try {
        const newCampaign = await Campaign.createCampaign(newCampaignData);
        res.status(201).json(newCampaign);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating campaign");
    }
};

// Update an existing campaign
const updateCampaign = async (req, res) => {
    const id = parseInt(req.params.id);
    const newCampaignData = req.body;
    try {
        const updatedCampaign = await Campaign.updateCampaign(id, newCampaignData);
        if (!updatedCampaign) {
            return res.status(404).send("Campaign not found");
        }
        res.json(updatedCampaign);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating the campaign");
    }
};

// Delete a campaign
const deleteCampaign = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await Campaign.deleteCampaign(id);
        res.status(204).send(); // No content to return
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting the campaign");
    }
};

// Delete a campaign
const signUpStudentForCampaign = async (req, res) => {
    const student_id = parseInt(req.params.studentId)
    const id = parseInt(req.params.id);
    try {
        await Campaign.signUpStudentForCampaign(student_id, id);
        res.status(204).send(); // No content to return
    } catch (error) {
        console.error(error);
        res.status(500).send("Error signing up for campaign");
    }
};

module.exports = {
    getAllCampaigns,
    getCampaignById,
    getCampaignsBySchool,
    getSignedUpCampaignsByStudent,
    signUpStudentForCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaignSignUps
};
