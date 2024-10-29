// routes/carbonFootprintRoutes.js
const carbonFootprintController = require("../controllers/carbonFootprint");
const authenticateToken = require("../middlewares/authenticateToken");
const validateCarbonFootprint = require("../middlewares/validateCarbonFootprint");

const carbonFootprintRoute = (app) => {
    app.get("/carbon-footprints", carbonFootprintController.getAllCarbonFootprints); // Get all carbon footprints
    app.get("/carbon-footprints/:id", carbonFootprintController.getCarbonFootprintById); // Get carbon footprint by ID
    app.get("/carbon-footprints/school/:schoolId", carbonFootprintController.getCarbonFootprintsBySchool); // Get carbon footprints by school
    app.get("/carbon-footprints/school/:schoolId/year/:year", carbonFootprintController.getYearlyCarbonFootprint); // Get yearly carbon footprint for a school
    app.post("/carbon-footprints", validateCarbonFootprint.validateCreate, carbonFootprintController.createCarbonFootprint); // Create new carbon footprint
    app.put("/carbon-footprints/:id", validateCarbonFootprint.validateUpdate, carbonFootprintController.updateCarbonFootprint); // Update carbon footprint
    app.delete("/carbon-footprints/:id", carbonFootprintController.deleteCarbonFootprint); // Delete carbon footprint
};

module.exports = carbonFootprintRoute;
