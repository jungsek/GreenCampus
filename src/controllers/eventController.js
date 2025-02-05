const Event = require("../models/event");
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
// Get all events
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.getAllEvents();
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving events");
    }
};

// Get a specific event by ID
const getEventById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const event = await Event.getEventById(id);
        if (!event) {
            return res.status(404).send("Event not found");
        }
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving the event");
    }
};

// Get events by school ID
const getEventsBySchool = async (req, res) => {
    const schoolId = parseInt(req.params.schoolId);
    try {
        const events = await Event.getEventsBySchool(schoolId);
        if (!events) {
            return res.status(404).send("No events found for this school");
        }
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving events for this school");
    }
};

// Get past events (events on or before today)
const getPastEvents = async (req, res) => {
    try {
        const pastEvents = await Event.getPastEvents();
        res.json(pastEvents);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving past events");
    }
};

// Get future events (events after today)
const getFutureEvents = async (req, res) => {
    try {
        const futureEvents = await Event.getFutureEvents();
        res.json(futureEvents);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving future events");
    }
};

// Create a new event
const createEvent = async (req, res) => {
    const newEventData = req.body;
    try {
        const newEvent = await Event.createEvent(newEventData);
        res.status(201).json(newEvent);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating event");
    }
};

// Update an existing event
const updateEvent = async (req, res) => {
    const id = parseInt(req.params.id);
    const newEventData = req.body;
    try {
        const updatedEvent = await Event.updateEvent(id, newEventData);
        if (!updatedEvent) {
            return res.status(404).send("Event not found");
        }
        res.json(updatedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating the event");
    }
};

// Delete an event
const deleteEvent = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await Event.deleteEvent(id);
        res.status(204).send(); // No content to return
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting the event");
    }
};

const generateRecommendations = async (req, res) => {
    const name = req.params.name;
    const cftotal = parseFloat(req.params.cftotal);
    const eutotal = parseFloat(req.params.eutotal);
    const { eventeb, eventcb } = req.body;

    try {
        // Preprocess the breakdown data for clarity
        const energyBreakdownSummary = eventeb
            .reduce((acc, item) => {
                acc[item.category] = (acc[item.category] || 0) + item.percentage;
                return acc;
            }, {});
        const carbonBreakdownSummary = eventcb
            .reduce((acc, item) => {
                acc[item.category] = (acc[item.category] || 0) + item.percentage;
                return acc;
            }, {});

        // Convert the summaries to strings for the prompt
        const energyBreakdownStr = Object.entries(energyBreakdownSummary)
            .map(([category, percentage]) => `${category}: ${percentage}%`)
            .join(", ");
        const carbonBreakdownStr = Object.entries(carbonBreakdownSummary)
            .map(([category, percentage]) => `${category}: ${percentage}%`)
            .join(", ");

        // Updated and structured prompt
        const prompt = `You are an expert in sustainability and environmental management. Analyze the following event data to provide concise, point-form insights:

Event Name: ${name}
Total Energy Usage: ${eutotal} kWh
Total Carbon Footprint: ${cftotal} tons

Energy Usage Breakdown: ${energyBreakdownStr}
Carbon Footprint Breakdown: ${carbonBreakdownStr}

Provide insights on:
- What aspects of the event were environmentally efficient or well-managed.
- What aspects contributed significantly to emissions or energy usage and require improvement.
- Actionable suggestions to reduce environmental impact for future events.

Structure your response as follows:
What was done well:
- [Insight 1]
- [Insight 2]
...
Areas for improvement:
- [Insight 1]
- [Insight 2]
...
Recommendations for future events:
- [Recommendation 1]
- [Recommendation 2]

Do not use any bold or modified headers, just provide the insights and recommendations in normal sized text.`;

        // Call the AI model with the updated prompt
        const result = await model.generateContent(prompt);

        // Extract and send the response text
        res.json({ result: result.response.text() });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating recommendations");
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    getEventsBySchool,
    getPastEvents,
    getFutureEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    generateRecommendations
};

