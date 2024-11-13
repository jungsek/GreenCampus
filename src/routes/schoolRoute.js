const schoolController = require('../controllers/schoolController');

const schoolRoute = (app, upload) => {

    // Route to get school(s) by name
    app.get('/api/schools', schoolController.getSchoolsByName);

    // Get carbon footprint data for schools by current and previous year
    app.get('/api/schools/carbon-footprint/year', schoolController.getSchoolsCarbonFootprintByCurrentAndPreviousYear);

    // Get carbon footprint data for schools by current and previous month
    app.get('/api/schools/carbon-footprint/month', schoolController.getSchoolsCarbonFootprintByCurrentAndPreviousMonth);

    // Get energy usage data for schools by current and previous year
    app.get('/api/schools/energy-usage/year', schoolController.getSchoolsEnergyUsageByCurrentAndPreviousYear);

    // Get energy usage data for schools by current and previous month
    app.get('/api/schools/energy-usage/month', schoolController.getSchoolsEnergyUsageByCurrentAndPreviousMonth);
};

module.exports = schoolRoute;
