const reportController = require("../controllers/reportController");

const reportRoute = (app, upload) => {
    // Route to generate a new report based on school ID
    app.get("/api/reports/:schoolId", reportController.generateReport);

    // Route to get existing report for a school and year
    app.get("/api/reports/:schoolId/view", reportController.getReportBySchoolAndYear);

    // Route to get all reports
    app.get("/api/reports", reportController.getAllReports);

    // Route to get a report by ID
    app.get("/api/reports/id/:reportId", reportController.getReportById);
    
};

module.exports = reportRoute;
