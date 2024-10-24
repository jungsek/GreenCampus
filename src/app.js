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

// Load frontend
const staticMiddleware = express.static("public");
app.use(staticMiddleware);

// Use session middleware before setting up routes
app.use(session({
    secret: 'secret-key', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Change to true if using HTTPS
}));

// Use parse middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup routes
route(app, upload);

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

app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Connected to database successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate app
    process.exit(1);
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is shutting down");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});
