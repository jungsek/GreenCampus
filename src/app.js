require('dotenv').config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const dbConfig = require("./database/dbConfig");
const sql = require("mssql");
const route = require("./routes/routes");
const bodyParser = require("body-parser");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

let pool; // Initialize a variable for the SQL pool

// Ensure upload directory exists
const uploadDir = path.join(__dirname, './uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Set file size limit to 50MB
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Serve static files
app.use(express.static("public"));

// Use session middleware
app.use(session({
    secret: 'secret-key', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware for Multer errors
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'File size exceeds the 50MB limit. Please upload a smaller file.' });
    } else if (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
    next();
});

// Setup routes with access to the database pool
route(app, upload, () => pool);

// Start server and connect to the database
app.listen(port, async () => {
    try {
        pool = await sql.connect(dbConfig);
        console.log("Connected to database successfully");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
    console.log(`Server listening on port ${port}`);
});

// Handle shutdown gracefully
const shutDown = async () => {
    console.log("Server is shutting down");
    if (pool) {
        await pool.close();
        console.log("Database connection closed");
    }
    process.exit(0);
};

// Capture exit signals to close database connections
process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
process.on("exit", shutDown);
