const schoolController = require('../controllers/schoolController');

const schoolRoute = (app, upload) => {

    // Route to get school(s) by name
    app.get('/api/schools', schoolController.getSchoolsByName);

    // Get carbon footprint data for schools by current year
    app.get('/api/schools/carbon-footprint/year', schoolController.getSchoolsCarbonFootprintByCurrentYear);

    // Get carbon footprint data for schools by current month
    app.get('/api/schools/carbon-footprint/month', schoolController.getSchoolsCarbonFootprintByCurrentMonth);

    // Get energy usage data for schools by current year
    app.get('/api/schools/energy-usage/year', schoolController.getSchoolsEnergyUsageByCurrentYear);

    // Get energy usage data for schools by current month
    app.get('/api/schools/energy-usage/month', schoolController.getSchoolsEnergyUsageByCurrentMonth);
};

module.exports = schoolRoute;
