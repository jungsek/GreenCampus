const eventController = require("../controllers/eventController");
const authenticateToken = require("../middlewares/authenticateToken");

// Create event routes
const eventRoute = (app) => {
    app.get("/events", eventController.getAllEvents); // Get all events
    app.get("/events/:id", eventController.getEventById); // Get event by ID
    app.get("/events/school/:schoolId", eventController.getEventsBySchool); // Get events by school
    app.get("/events/past", eventController.getPastEvents); // Get past events (before or on today)
    app.get("/events/future", eventController.getFutureEvents); // Get future events (after today)
    app.post("/events", eventController.createEvent); // Create a new event
    app.put("/events/:id", eventController.updateEvent); // Update an event
    app.delete("/events/:id", eventController.deleteEvent); // Delete an event
};

module.exports = eventRoute;
