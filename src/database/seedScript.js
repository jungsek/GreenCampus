const sql = require("mssql");
const fs = require("fs");
const path = require("path");
const dbConfig = require("./dbConfig");

// SQL data for seeding the database
const seedSQL = `
declare @sql nvarchar(max) = (
    select 
        'alter table ' + quotename(schema_name(schema_id)) + '.' +
        quotename(object_name(parent_object_id)) +
        ' drop constraint '+quotename(name) + ';'
    from sys.foreign_keys
    for xml path('')
);
exec sp_executesql @sql;

-- Drop foreign key constraints

-- Drop all tables if they exist
IF OBJECT_ID('EnergyBreakdown', 'U') IS NOT NULL DROP TABLE EnergyBreakdown;
IF OBJECT_ID('CarbonFootprint', 'U') IS NOT NULL DROP TABLE CarbonFootprint;
IF OBJECT_ID('EnergyUsage', 'U') IS NOT NULL DROP TABLE EnergyUsage;
IF OBJECT_ID('SchoolStudents', 'U') IS NOT NULL DROP TABLE SchoolStudents;
IF OBJECT_ID('Schools', 'U') IS NOT NULL DROP TABLE Schools;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;

-- Create tables

CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    about_me VARCHAR(250) NOT NULL,
    country VARCHAR(100) NOT NULL,
    join_date DATE NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    role VARCHAR(8) NOT NULL, CHECK (role = 'student' OR role = 'lecturer')
  );

CREATE TABLE Schools(
 id INT IDENTITY(1,1) PRIMARY KEY,
 school_name VARCHAR(50),
 description VARCHAR(255),
 principal_id INT FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
)

CREATE TABLE SchoolStudents(
 id INT PRIMARY KEY IDENTITY(1,1),
 student_id INT FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
 school_id INT FOREIGN KEY REFERENCES Schools(id) ON DELETE CASCADE,
)

CREATE TABLE EnergyUsage (
    id INT IDENTITY(1,1) PRIMARY KEY,
    school_id INT FOREIGN KEY REFERENCES schools(id) ON DELETE CASCADE,
    month VARCHAR(10),
    energy_kwh FLOAT,
    avg_temperature_c FLOAT,
    timestamp DATETIME,
)

CREATE TABLE CarbonFootprint(
 id INT IDENTITY(1,1) PRIMARY KEY,
 school_id INT FOREIGN KEY REFERENCES schools(id) ON DELETE CASCADE, 
 total_carbon_tons FLOAT,
 timestamp DATETIME,
)

CREATE TABLE EnergyBreakdown(
 id INT IDENTITY(1,1) PRIMARY KEY,
 energyusage_id INT FOREIGN KEY REFERENCES EnergyUsage(id) ON DELETE CASCADE, 
 category VARCHAR(50),
 percentage INT CHECK(percentage >= 0 and percentage <= 100),
)
`;

async function insertUsers(connection){
    //insert user info, completed courses and quiz results
    await connection.request().query(`
      INSERT INTO Users
      VALUES ('Toby', 'Dean', 'toby@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'Maxing out mastermindz', 'United States', '2022-06-04', 'University Student', 'student');
      SELECT SCOPE_IDENTITY() AS id;
  
      INSERT INTO Users
      VALUES ('Sarah', 'Lee', 'sarah@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'Hi there stranger! Im Sarah. A idiot who likes doggos and fun', 'Singapore', '2024-06-04', 'Web Developer', 'student');
      SELECT SCOPE_IDENTITY() AS id;
  
      INSERT INTO Users
      VALUES ('George', 'Wilson', 'george@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', '01/04/2024. Published over 5 courses on mastermindz', 'United Kingdom', '2023-05-20', 'Full Stack Engineer', 'lecturer');
      SELECT SCOPE_IDENTITY() AS id;
    
    `)
  }
  

// Load the SQL and run the seed process
async function run() {
    const connection = await sql.connect(dbConfig);
    try {
      // Make sure that any items are correctly URL encoded in the connection string
      const request = connection.request();
      await request.query(seedSQL);
      console.log("Database reset and tables created");
  
        // Insert user data
        await insertUsers(connection);
        console.log("Users inserted");
        connection.close();
      console.log("Seeding completed");
    } catch (err) {
      console.log("Seeding error:", err);
      connection.close()
    }
  }
  
  run()