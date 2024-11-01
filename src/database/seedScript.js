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
IF OBJECT_ID('FK_Reports_SchoolID', 'F') IS NOT NULL
  ALTER TABLE Reports DROP CONSTRAINT FK_Reports_SchoolID;

-- Drop all tables if they exist
IF OBJECT_ID('EnergyBreakdown', 'U') IS NOT NULL DROP TABLE EnergyBreakdown;
IF OBJECT_ID('CarbonFootprint', 'U') IS NOT NULL DROP TABLE CarbonFootprint;
IF OBJECT_ID('EnergyUsage', 'U') IS NOT NULL DROP TABLE EnergyUsage;
IF OBJECT_ID('Schools', 'U') IS NOT NULL DROP TABLE Schools;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
IF OBJECT_ID('Reports', 'U') IS NOT NULL DROP TABLE Reports;

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
    location VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    percentage INT CHECK (percentage >= 0 AND percentage <= 100),
    FOREIGN KEY (energyusage_id) REFERENCES EnergyUsage(id) ON DELETE CASCADE
);

-- Create Reports table
CREATE TABLE Reports (
    id INT PRIMARY KEY IDENTITY,
    school_id INT NOT NULL,
    year INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (school_id) REFERENCES Schools(id) ON DELETE CASCADE
);


`;

async function insertData(connection) {
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

      -- Mock data for EnergyUsage table
      INSERT INTO EnergyUsage (school_id, month, energy_kwh, avg_temperature_c, timestamp)
      VALUES
          (1, 'January', 1000.5, 24.5, '2024-01-15 10:00:00'),
          (1, 'February', 1200.7, 25.0, '2024-02-15 10:00:00'),
          (1, 'March', 1100.8, 26.1, '2024-03-15 10:00:00'),
          (1, 'April', 1300.4, 27.3, '2024-04-15 10:00:00'),
          (2, 'January', 950.3, 23.8, '2024-01-15 10:00:00'),
          (2, 'February', 1050.0, 24.2, '2024-02-15 10:00:00'),
          (2, 'March', 1150.9, 25.3, '2024-03-15 10:00:00'),
          (2, 'April', 1250.1, 26.0, '2024-04-15 10:00:00'),
          -- Additional mock data for previous years
          (1, 'May', 980.2, 26.5, '2023-05-15 10:00:00'),
          (1, 'June', 1125.5, 28.0, '2023-06-15 10:00:00'),
          (1, 'July', 1150.3, 30.2, '2023-07-15 10:00:00'),
          (1, 'August', 1200.8, 29.9, '2023-08-15 10:00:00'),
          (2, 'May', 870.1, 24.7, '2023-05-15 10:00:00'),
          (2, 'June', 950.4, 25.2, '2023-06-15 10:00:00'),
          (1, 'September', 1100.0, 26.1, '2022-09-15 10:00:00'),
          (2, 'October', 980.9, 25.8, '2022-10-15 10:00:00'),
          (1, 'November', 1200.0, 23.5, '2021-11-15 10:00:00'),
          (2, 'December', 1100.5, 22.0, '2021-12-15 10:00:00');

      -- Mock data for CarbonFootprint table
      INSERT INTO CarbonFootprint (school_id, total_carbon_tons, timestamp)
      VALUES
          (1, 200.5, '2024-01-31 12:00:00'),
          (1, 180.7, '2024-02-28 12:00:00'),
          (1, 195.2, '2024-03-31 12:00:00'),
          (1, 210.9, '2024-04-30 12:00:00'),
          (2, 190.3, '2024-01-31 12:00:00'),
          (2, 185.6, '2024-02-28 12:00:00'),
          (2, 192.4, '2024-03-31 12:00:00'),
          (2, 198.1, '2024-04-30 12:00:00'),
          -- Additional mock data for previous years
          (1, 220.0, '2023-01-31 12:00:00'),
          (1, 210.4, '2023-02-28 12:00:00'),
          (2, 195.5, '2023-01-31 12:00:00'),
          (2, 200.1, '2023-02-28 12:00:00'),
          (1, 230.2, '2022-01-31 12:00:00'),
          (2, 220.6, '2022-02-28 12:00:00'),
          (1, 240.7, '2021-01-31 12:00:00'),
          (2, 235.9, '2021-02-28 12:00:00');

      INSERT INTO EnergyBreakdown (energyusage_id, location, category, percentage)
      VALUES
          (1, 'Classroom', 'Lighting', 30),
          (1, 'Classroom', 'Computers', 25),
          (1, 'Classroom', 'HVAC', 20),
          (1, 'Library', 'Lighting', 10),
          (1, 'Library', 'HVAC', 15),

          (2, 'Gym', 'Lighting', 20),
          (2, 'Gym', 'HVAC', 35),
          (2, 'Cafeteria', 'Appliances', 30),
          (2, 'Cafeteria', 'HVAC', 10),
          (2, 'Cafeteria', 'Food Waste Management', 5),

          (3, 'Laboratory', 'Lighting', 25),
          (3, 'Laboratory', 'HVAC', 30),
          (3, 'Laboratory', 'Computers', 20),
          (3, 'Office', 'Lighting', 15),
          (3, 'Office', 'HVAC', 10),

          (4, 'Hallway', 'Lighting', 15),
          (4, 'Hallway', 'HVAC', 35),
          (4, 'Hallway', 'Appliances', 25),
          (4, 'Cafeteria', 'Refrigeration', 15),
          (4, 'Cafeteria', 'Food Waste Management', 10),

          (5, 'Classroom', 'Lighting', 20),
          (5, 'Classroom', 'HVAC', 25),
          (5, 'Library', 'Computers', 20),
          (5, 'Library', 'HVAC', 15),
          (5, 'Library', 'Food Waste Management', 20),

          (6, 'Office', 'Lighting', 25),
          (6, 'Office', 'HVAC', 30),
          (6, 'Gym', 'Appliances', 25),
          (6, 'Gym', 'HVAC', 15),
          (6, 'Gym', 'Food Waste Management', 5),

          (7, 'Classroom', 'Lighting', 30),
          (7, 'Classroom', 'HVAC', 25),
          (7, 'Auditorium', 'Lighting', 25),
          (7, 'Auditorium', 'HVAC', 10),
          (7, 'Auditorium', 'Sound Equipment', 10),

          (8, 'Cafeteria', 'Lighting', 20),
          (8, 'Cafeteria', 'HVAC', 40),
          (8, 'Laboratory', 'Appliances', 20),
          (8, 'Laboratory', 'Computers', 10),
          (8, 'Laboratory', 'Food Waste Management', 10),

          -- Additional entries to EnergyBreakdown
          (1, 'Classroom', 'Lighting', 40),
          (1, 'Library', 'Computers', 30),
          (2, 'Gym', 'Lighting', 25),
          (2, 'Cafeteria', 'Appliances', 35),
          (1, 'Hallway', 'HVAC', 20),
          (1, 'Office', 'Lighting', 25),
          (2, 'Auditorium', 'Lighting', 30),
          (2, 'Laboratory', 'HVAC', 15),
          (1, 'Classroom', 'Food Waste Management', 20),
          (2, 'Gym', 'Sound Equipment', 10);
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
        await insertData(connection);
        console.log("Data inserted");
        connection.close();
      console.log("Seeding completed");
    } catch (err) {
      console.log("Seeding error:", err);
      connection.close()
    }
  }
  
  run()