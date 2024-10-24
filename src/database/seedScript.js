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
IF OBJECT_ID('FK_EnergyBreakdown_EnergyUsageID', 'F') IS NOT NULL
  ALTER TABLE EnergyBreakdown DROP CONSTRAINT FK_EnergyBreakdown_EnergyUsageID;
IF OBJECT_ID('FK_CarbonFootprint_SchoolID', 'F') IS NOT NULL
  ALTER TABLE CarbonFootprint DROP CONSTRAINT FK_CarbonFootprint_SchoolID;
IF OBJECT_ID('FK_EnergyUsage_SchoolID', 'F') IS NOT NULL
  ALTER TABLE EnergyUsage DROP CONSTRAINT FK_EnergyUsage_SchoolID;
IF OBJECT_ID('FK_Schools_PrincipalID', 'F') IS NOT NULL
  ALTER TABLE Schools DROP CONSTRAINT FK_Schools_PrincipalID;
IF OBJECT_ID('FK_Users_Schools', 'F') IS NOT NULL
  ALTER TABLE Users DROP CONSTRAINT FK_Users_Schools;

-- Drop all tables if they exist
IF OBJECT_ID('EnergyBreakdown', 'U') IS NOT NULL DROP TABLE EnergyBreakdown;
IF OBJECT_ID('CarbonFootprint', 'U') IS NOT NULL DROP TABLE CarbonFootprint;
IF OBJECT_ID('EnergyUsage', 'U') IS NOT NULL DROP TABLE EnergyUsage;
IF OBJECT_ID('SchoolStudents', 'U') IS NOT NULL DROP TABLE SchoolStudents;
IF OBJECT_ID('Schools', 'U') IS NOT NULL DROP TABLE Schools;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;

-- Create Users table
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(8) NOT NULL CHECK (role IN ('student', 'lecturer'))
);

-- Create Schools table with principal_id foreign key
CREATE TABLE Schools (
    id INT IDENTITY(1,1) PRIMARY KEY,
    school_name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL,
    principal_id INT UNIQUE, -- Principal has a 1-to-1 relationship with the school
    FOREIGN KEY (principal_id) REFERENCES Users(id)
);

-- Alter Users table to add school_id foreign key for the 1-to-many relationship (for students)
ALTER TABLE Users
ADD school_id INT NULL;

-- Add the foreign key constraint after adding the column
ALTER TABLE Users
ADD CONSTRAINT FK_Users_Schools FOREIGN KEY (school_id) REFERENCES Schools(id);


-- Create EnergyUsage table
CREATE TABLE EnergyUsage (
    id INT IDENTITY(1,1) PRIMARY KEY,
    school_id INT NOT NULL,
    month VARCHAR(10) NOT NULL,
    energy_kwh FLOAT NOT NULL,
    avg_temperature_c FLOAT,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (school_id) REFERENCES Schools(id) ON DELETE CASCADE
);

-- Create CarbonFootprint table
CREATE TABLE CarbonFootprint (
    id INT IDENTITY(1,1) PRIMARY KEY,
    school_id INT NOT NULL,
    total_carbon_tons FLOAT NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (school_id) REFERENCES Schools(id) ON DELETE CASCADE
);

-- Create EnergyBreakdown table
CREATE TABLE EnergyBreakdown (
    id INT IDENTITY(1,1) PRIMARY KEY,
    energyusage_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    percentage INT CHECK (percentage >= 0 AND percentage <= 100),
    FOREIGN KEY (energyusage_id) REFERENCES EnergyUsage(id) ON DELETE CASCADE
);

`;

async function insertUsers(connection){
  await connection.request().query(`
    -- First insert the lecturers (without school_id since they're principals)
    INSERT INTO Users (first_name, last_name, email, password, role, school_id)
    VALUES ('George', 'Wilson', 'george@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'lecturer', null);
    
    INSERT INTO Users (first_name, last_name, email, password, role, school_id)
    VALUES ('Regina', 'William', 'regina@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'lecturer', null);

    -- Then create the schools with the lecturer IDs
    INSERT INTO Schools (school_name, description, principal_id)
    VALUES ('Lincoln High School', 'A comprehensive public high school focused on STEM education', 1);

    INSERT INTO Schools (school_name, description, principal_id)
    VALUES ('Washington Elementary', 'K-5 elementary school with emphasis on early childhood development', 2);

    -- Finally insert the students with their school_ids
    INSERT INTO Users (first_name, last_name, email, password, role, school_id)
    VALUES ('Toby', 'Dean', 'toby@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student', 1);
    
    INSERT INTO Users (first_name, last_name, email, password, role, school_id)
    VALUES ('Sarah', 'Lee', 'sarah@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student', 2);
  `);
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