const schoolController = require('../controllers/schoolController');

const schoolRoute = (app, upload) => {

    // Route to get school(s) by name
    app.get('/api/schools', schoolController.getSchoolsByName);
};

module.exports = schoolRoute;
