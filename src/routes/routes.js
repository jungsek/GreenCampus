const userRoute = require("./userRoute.js");

const route = (app, upload) => {
    userRoute(app, upload);
};

module.exports = route;
