const User = require("../models/user")
const bcrypt = require('bcryptjs');
const fs = require('fs');
const jwt = require("jsonwebtoken")
const axios = require('axios');
require("dotenv").config()


//use bcrypt to hash a password and return it
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(password,salt)
}

const generateAccessToken = (user) => {
  //make a jsonwebtoken containing the user's id and role
  const accessToken = jwt.sign({userId: user.id, role: user.role}, process.env.ACCESS_TOKEN_SECRET)
  return {accessToken: accessToken, role: user.role}
}

const getAllUsers = async (req, res) => {
  try {
    const user = await User.getAllUsers()
    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error retrieving users")
  }
}

const getUserById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const user = await User.getUserById(id)
    if (!user) {
      return res.status(404).send("User not found")
    }
    res.json(user);
  } catch (error) {
    console.error(error)
    res.status(500).send("Error retrieving users")
  }
}

const getPrivateUserById = async (req, res) => {
  const id = parseInt(req.user.userId);
  try {
    const user = await User.getPrivateUserById(id)
    if (!user) {
      return res.status(404).send("User not found")
    }
    res.json(user);
  } catch (error) {
    console.error(error)
    res.status(500).send("Error retrieving users")
  }
}


const searchUsers = async (req,res) => {
  const searchTerm = req.query.q
  
    try {    
      //get the users that match the query and return it
      const users = await User.searchUsers(searchTerm);
      res.json(users)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Error searching users" })
    }
}



//use dependency injection for code testing
const loginUser = async (req, res, next, _generateAccessToken = generateAccessToken) => {

  const email = req.body.email
  const password = req.body.password
  try {
    //check if email exists
    const user = await User.getUserByEmail(email)
    if (!user) {
      return res.status(404).send("Incorrect login details")
    }
    //verify password
    if (!bcrypt.compareSync(password,user.password)){
      return res.status(404).send("Incorrect login details")
    }
    //generate jwt token
    res.json(_generateAccessToken(user));
  } catch (error) {
    console.error(error)
    res.status(500).send("Error logging in")
  }
}
//use dependency injection for code testing
const createUser = async (req, res, next, _generateAccessToken = generateAccessToken) => {
  const newUser = req.body;
  try {
    //hash the password and replace the password field with the new hashed password
    newUser.password = hashPassword(newUser.password)
    //use an ip API to get the user's country and replace it
    //use try-catch, in case api call fails, country will remain unchanged (US by default)
    const options = {
      'method': 'GET',
      'url': 'http://ip-api.com/json',
      'headers': {
        'Content-Type': 'application/json'
      }
    }
    try{
      newUser.country = (await axios(options)).data.country
    }catch (e){
      console.error(e)
    }
    const createdUser = await User.createUser(newUser)
    //create user successful, display it as json
    res.status(201).json(_generateAccessToken(createdUser));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating user")
  }
}


const updateUser = async (req, res) => {
  const data = req.body
  const id = req.user.userId
  try {
    const updatedUser = await User.updateUser(id,data)
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating user")
  }
}

const updatePassword = async (req, res) => {
  try {
    const updatedUser = await User.updatePassword(req.user.userId,hashPassword(req.body.new_password))
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating user password")
  }
}


const decodeJWT = async (req, res) => {

  res.status(200).json(req.user)
}

module.exports = {
    getAllUsers,
    getUserById,
    getPrivateUserById,
    loginUser,
    createUser,
    updateUser,
    updatePassword,
    hashPassword,
    decodeJWT,
    searchUsers
}