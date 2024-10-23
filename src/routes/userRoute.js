const usersController = require("../controllers/userController");
const validateUser = require("../middlewares/validateUser");
const authenticateToken = require("../middlewares/authenticateToken")

// Create routes
const userRoute = (app, upload) => {
    //for routes using authenticateToken middleware, they are meant to only be accessed by the user
    //the user id will be extracted from the authenticate middleware, no need for params
    app.post("/users", validateUser.validateUser, usersController.createUser) //register/sign up user
    app.post("/users/login", usersController.loginUser) //login
    app.get("/users", usersController.getAllUsers) //get all users. Mostly useful for testing
    app.get("/users/private", authenticateToken, usersController.getPrivateUserById) //get the user's data by id but also includes email
    app.get("/users/decodejwt", authenticateToken, usersController.decodeJWT) //this route is for decoding the jwt
    app.get("/users/:id", usersController.getUserById) //get the user's data. Publicly available. No sensitive data like password or email
    app.put("/users", authenticateToken, validateUser.validateUpdate, usersController.updateUser) //update data in the user table
    app.put("/users/password", authenticateToken, validateUser.validateNewPassword, usersController.updatePassword) //update passwords
};

module.exports = userRoute;
