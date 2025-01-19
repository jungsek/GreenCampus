const Event = require("../models/event");

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

module.exports = {
    getAllEvents,
    getEventById,
    getEventsBySchool,
    getPastEvents,
    getFutureEvents,
    createEvent,
    updateEvent,
    deleteEvent,
};
