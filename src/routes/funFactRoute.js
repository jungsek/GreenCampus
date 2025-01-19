const funFactController = require("../controllers/funFactController");
const authenticateToken = require("../middlewares/authenticateToken");

const funFactRoute = (app) => {
    app.post('/api/funFacts', funFactController.getFunFacts);
};

module.exports = funFactRoute;