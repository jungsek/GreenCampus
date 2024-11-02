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
    timestamp DATETIME NOT NULL,
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

-- Mock data for EnergyBreakdown table
INSERT INTO EnergyBreakdown (energyusage_id, location, category, percentage, timestamp)
VALUES
    -- EnergyUsage for January 2024
    (1, 'Classroom', 'Lighting', 30, '2024-01-15 10:00:00'),
    (1, 'Classroom', 'Computers', 25, '2024-01-15 10:00:00'),
    (1, 'Classroom', 'HVAC', 20, '2024-01-15 10:00:00'),
    (1, 'Library', 'Lighting', 10, '2024-01-15 10:00:00'),
    (1, 'Library', 'HVAC', 15, '2024-01-15 10:00:00'),
    (1, 'Office', 'Lighting', 15, '2024-01-15 10:00:00'),
    (1, 'Gym', 'Equipment', 5, '2024-01-15 10:00:00'),
    (1, 'Cafeteria', 'Refrigeration', 10, '2024-01-15 10:00:00'),
    (1, 'Cafeteria', 'Appliances', 5, '2024-01-15 10:00:00'),
    (1, 'Auditorium', 'Lighting', 10, '2024-01-15 10:00:00'),
    (1, 'Laboratory', 'HVAC', 10, '2024-01-15 10:00:00'),
    (1, 'Hallway', 'Lighting', 5, '2024-01-15 10:00:00'),

    -- EnergyUsage for February 2024
    (2, 'Gym', 'Lighting', 20, '2024-02-15 10:00:00'),
    (2, 'Gym', 'HVAC', 35, '2024-02-15 10:00:00'),
    (2, 'Cafeteria', 'Appliances', 30, '2024-02-15 10:00:00'),
    (2, 'Cafeteria', 'HVAC', 10, '2024-02-15 10:00:00'),
    (2, 'Cafeteria', 'Food Waste Management', 5, '2024-02-15 10:00:00'),
    (2, 'Library', 'Lighting', 15, '2024-02-15 10:00:00'),
    (2, 'Classroom', 'Computers', 20, '2024-02-15 10:00:00'),
    (2, 'Classroom', 'HVAC', 10, '2024-02-15 10:00:00'),
    (2, 'Office', 'Lighting', 10, '2024-02-15 10:00:00'),
    (2, 'Laboratory', 'Computers', 10, '2024-02-15 10:00:00'),
    (2, 'Staff Room', 'HVAC', 5, '2024-02-15 10:00:00'),
    (2, 'Hallway', 'Lighting', 5, '2024-02-15 10:00:00'),

    -- EnergyUsage for March 2024
    (3, 'Laboratory', 'Lighting', 25, '2024-03-15 10:00:00'),
    (3, 'Laboratory', 'HVAC', 30, '2024-03-15 10:00:00'),
    (3, 'Laboratory', 'Computers', 20, '2024-03-15 10:00:00'),
    (3, 'Office', 'Lighting', 15, '2024-03-15 10:00:00'),
    (3, 'Office', 'HVAC', 10, '2024-03-15 10:00:00'),
    (3, 'Cafeteria', 'Lighting', 5, '2024-03-15 10:00:00'),
    (3, 'Gym', 'Equipment', 10, '2024-03-15 10:00:00'),
    (3, 'Auditorium', 'Lighting', 10, '2024-03-15 10:00:00'),
    (3, 'Laboratory', 'Food Waste Management', 5, '2024-03-15 10:00:00'),
    (3, 'Classroom', 'HVAC', 5, '2024-03-15 10:00:00'),
    (3, 'Library', 'Computers', 10, '2024-03-15 10:00:00'),
    (3, 'Hallway', 'Lighting', 5, '2024-03-15 10:00:00'),

    -- EnergyUsage for April 2024
    (4, 'Hallway', 'Lighting', 15, '2024-04-15 10:00:00'),
    (4, 'Hallway', 'HVAC', 35, '2024-04-15 10:00:00'),
    (4, 'Hallway', 'Appliances', 25, '2024-04-15 10:00:00'),
    (4, 'Cafeteria', 'Refrigeration', 15, '2024-04-15 10:00:00'),
    (4, 'Cafeteria', 'Food Waste Management', 10, '2024-04-15 10:00:00'),
    (4, 'Office', 'Computers', 10, '2024-04-15 10:00:00'),
    (4, 'Gym', 'HVAC', 10, '2024-04-15 10:00:00'),
    (4, 'Library', 'Lighting', 15, '2024-04-15 10:00:00'),
    (4, 'Laboratory', 'Computers', 15, '2024-04-15 10:00:00'),
    (4, 'Auditorium', 'Lighting', 10, '2024-04-15 10:00:00'),
    (4, 'Classroom', 'HVAC', 10, '2024-04-15 10:00:00'),
    (4, 'Staff Room', 'Lighting', 5, '2024-04-15 10:00:00'),

    -- EnergyUsage for May 2023
    (5, 'Classroom', 'Lighting', 40, '2023-05-15 10:00:00'),
    (5, 'Library', 'Computers', 30, '2023-05-15 10:00:00'),
    (5, 'Library', 'HVAC', 15, '2023-05-15 10:00:00'),
    (5, 'Office', 'Lighting', 10, '2023-05-15 10:00:00'),
    (5, 'Hallway', 'Lighting', 10, '2023-05-15 10:00:00'),
    (5, 'Cafeteria', 'Appliances', 10, '2023-05-15 10:00:00'),
    (5, 'Auditorium', 'HVAC', 15, '2023-05-15 10:00:00'),
    (5, 'Gym', 'Equipment', 15, '2023-05-15 10:00:00'),
    (5, 'Cafeteria', 'Food Waste Management', 5, '2023-05-15 10:00:00'),
    (5, 'Classroom', 'HVAC', 10, '2023-05-15 10:00:00'),
    (5, 'Laboratory', 'Computers', 10, '2023-05-15 10:00:00'),
    (5, 'Staff Room', 'Lighting', 5, '2023-05-15 10:00:00'),

    -- EnergyUsage for June 2023
    (6, 'Office', 'Lighting', 25, '2023-06-15 10:00:00'),
    (6, 'Office', 'HVAC', 30, '2023-06-15 10:00:00'),
    (6, 'Gym', 'Appliances', 25, '2023-06-15 10:00:00'),
    (6, 'Gym', 'HVAC', 15, '2023-06-15 10:00:00'),
    (6, 'Gym', 'Food Waste Management', 5, '2023-06-15 10:00:00'),
    (6, 'Classroom', 'Lighting', 10, '2023-06-15 10:00:00'),
    (6, 'Laboratory', 'Computers', 10, '2023-06-15 10:00:00'),
    (6, 'Library', 'HVAC', 15, '2023-06-15 10:00:00'),
    (6, 'Cafeteria', 'Refrigeration', 15, '2023-06-15 10:00:00'),
    (6, 'Cafeteria', 'Food Waste Management', 10, '2023-06-15 10:00:00'),
    (6, 'Office', 'Computers', 10, '2023-06-15 10:00:00'),
    (6, 'Hallway', 'Lighting', 5, '2023-06-15 10:00:00'),

    -- EnergyUsage for July 2023
    (7, 'Classroom', 'Lighting', 30, '2023-07-15 10:00:00'),
    (7, 'Classroom', 'HVAC', 25, '2023-07-15 10:00:00'),
    (7, 'Auditorium', 'Lighting', 25, '2023-07-15 10:00:00'),
    (7, 'Auditorium', 'HVAC', 10, '2023-07-15 10:00:00'),
    (7, 'Auditorium', 'Sound Equipment', 10, '2023-07-15 10:00:00'),
    (7, 'Library', 'Computers', 10, '2023-07-15 10:00:00'),
    (7, 'Laboratory', 'HVAC', 15, '2023-07-15 10:00:00'),
    (7, 'Staff Room', 'HVAC', 10, '2023-07-15 10:00:00'),
    (7, 'Cafeteria', 'Appliances', 10, '2023-07-15 10:00:00'),
    (7, 'Hallway', 'Lighting', 5, '2023-07-15 10:00:00'),
    (7, 'Gym', 'Food Waste Management', 5, '2023-07-15 10:00:00'),
    (7, 'Office', 'HVAC', 10, '2023-07-15 10:00:00'),

    -- EnergyUsage for August 2023
    (8, 'Cafeteria', 'Lighting', 20, '2023-08-15 10:00:00'),
    (8, 'Cafeteria', 'HVAC', 40, '2023-08-15 10:00:00'),
    (8, 'Laboratory', 'Appliances', 20, '2023-08-15 10:00:00'),
    (8, 'Laboratory', 'Computers', 10, '2023-08-15 10:00:00'),
    (8, 'Laboratory', 'Food Waste Management', 10, '2023-08-15 10:00:00'),
    (8, 'Library', 'HVAC', 15, '2023-08-15 10:00:00'),
    (8, 'Cafeteria', 'Refrigeration', 15, '2023-08-15 10:00:00'),
    (8, 'Auditorium', 'Lighting', 10, '2023-08-15 10:00:00'),
    (8, 'Classroom', 'HVAC', 10, '2023-08-15 10:00:00'),
    (8, 'Hallway', 'Lighting', 5, '2023-08-15 10:00:00'),
    (8, 'Gym', 'Food Waste Management', 5, '2023-08-15 10:00:00'),
    (8, 'Office', 'HVAC', 10, '2023-08-15 10:00:00'),

    -- Additional entries for previous years
    -- Each of these will maintain a relationship with the respective EnergyUsage timestamps
    (9, 'Classroom', 'Lighting', 25, '2023-06-15 10:00:00'),
    (9, 'Library', 'HVAC', 15, '2023-06-15 10:00:00'),
    (9, 'Laboratory', 'Computers', 20, '2023-06-15 10:00:00'),
    (9, 'Office', 'Lighting', 10, '2023-06-15 10:00:00'),
    (9, 'Cafeteria', 'Appliances', 5, '2023-06-15 10:00:00'),
    (9, 'Auditorium', 'Lighting', 10, '2023-06-15 10:00:00'),
    (9, 'Hallway', 'Lighting', 5, '2023-06-15 10:00:00'),
    (9, 'Classroom', 'HVAC', 10, '2023-06-15 10:00:00'),
    (9, 'Library', 'Computers', 10, '2023-06-15 10:00:00'),
    (9, 'Office', 'HVAC', 10, '2023-06-15 10:00:00'),
    (9, 'Cafeteria', 'Food Waste Management', 5, '2023-06-15 10:00:00');


          -- Mock data for CarbonFootprint table with realistic values averaging around 9.4 tons/year
INSERT INTO CarbonFootprint (school_id, total_carbon_tons, timestamp)
VALUES
-- School 1 Data for 2024
    (1, 0.8, '2024-01-31 12:00:00'),
    (1, 0.7, '2024-02-28 12:00:00'),
    (1, 0.9, '2024-03-31 12:00:00'),
    (1, 0.8, '2024-04-30 12:00:00'),
    (1, 0.9, '2024-05-31 12:00:00'),
    (1, 0.8, '2024-06-30 12:00:00'),
    (1, 1.0, '2024-07-31 12:00:00'),
    (1, 0.9, '2024-08-31 12:00:00'),
    (1, 1.0, '2024-09-30 12:00:00'),
    (1, 0.7, '2024-10-31 12:00:00'),
    (1, 0.8, '2024-11-30 12:00:00'),
    (1, 1.0, '2024-12-31 12:00:00'),

    -- School 2 Data for 2024
    (2, 0.8, '2024-01-31 12:00:00'),
    (2, 0.6, '2024-02-28 12:00:00'),
    (2, 0.7, '2024-03-31 12:00:00'),
    (2, 0.9, '2024-04-30 12:00:00'),
    (2, 0.8, '2024-05-31 12:00:00'),
    (2, 0.7, '2024-06-30 12:00:00'),
    (2, 0.9, '2024-07-31 12:00:00'),
    (2, 0.8, '2024-08-31 12:00:00'),
    (2, 1.0, '2024-09-30 12:00:00'),
    (2, 0.7, '2024-10-31 12:00:00'),
    (2, 0.6, '2024-11-30 12:00:00'),
    (2, 1.0, '2024-12-31 12:00:00'),

    -- Previous years for School 1
    (1, 0.8, '2023-01-31 12:00:00'),
    (1, 0.7, '2023-02-28 12:00:00'),
    (1, 0.9, '2023-03-31 12:00:00'),
    (1, 0.8, '2023-04-30 12:00:00'),
    (1, 0.9, '2023-05-31 12:00:00'),
    (1, 0.8, '2023-06-30 12:00:00'),
    (1, 1.0, '2023-07-31 12:00:00'),
    (1, 0.9, '2023-08-31 12:00:00'),
    (1, 1.0, '2023-09-30 12:00:00'),
    (1, 0.7, '2023-10-31 12:00:00'),
    (1, 0.8, '2023-11-30 12:00:00'),
    (1, 1.0, '2023-12-31 12:00:00'),

    -- Previous years for School 2
    (2, 0.8, '2023-01-31 12:00:00'),
    (2, 0.6, '2023-02-28 12:00:00'),
    (2, 0.7, '2023-03-31 12:00:00'),
    (2, 0.9, '2023-04-30 12:00:00'),
    (2, 0.8, '2023-05-31 12:00:00'),
    (2, 0.7, '2023-06-30 12:00:00'),
    (2, 0.9, '2023-07-31 12:00:00'),
    (2, 0.8, '2023-08-31 12:00:00'),
    (2, 1.0, '2023-09-30 12:00:00'),
    (2, 0.7, '2023-10-31 12:00:00'),
    (2, 0.6, '2023-11-30 12:00:00'),
    (2, 1.0, '2023-12-31 12:00:00'),

    -- Previous years for School 1 (2022)
    (1, 0.7, '2022-01-31 12:00:00'),
    (1, 0.6, '2022-02-28 12:00:00'),
    (1, 0.8, '2022-03-31 12:00:00'),
    (1, 0.9, '2022-04-30 12:00:00'),
    (1, 0.9, '2022-05-31 12:00:00'),
    (1, 0.8, '2022-06-30 12:00:00'),
    (1, 0.9, '2022-07-31 12:00:00'),
    (1, 0.8, '2022-08-31 12:00:00'),
    (1, 0.9, '2022-09-30 12:00:00'),
    (1, 0.7, '2022-10-31 12:00:00'),
    (1, 0.6, '2022-11-30 12:00:00'),
    (1, 0.8, '2022-12-31 12:00:00'),

    -- Previous years for School 2 (2022)
    (2, 0.7, '2022-01-31 12:00:00'),
    (2, 0.6, '2022-02-28 12:00:00'),
    (2, 0.8, '2022-03-31 12:00:00'),
    (2, 0.9, '2022-04-30 12:00:00'),
    (2, 0.8, '2022-05-31 12:00:00'),
    (2, 0.7, '2022-06-30 12:00:00'),
    (2, 0.9, '2022-07-31 12:00:00'),
    (2, 0.8, '2022-08-31 12:00:00'),
    (2, 0.7, '2022-09-30 12:00:00'),
    (2, 0.8, '2022-10-31 12:00:00'),
    (2, 0.7, '2022-11-30 12:00:00'),
    (2, 0.9, '2022-12-31 12:00:00'),

    -- Previous years for School 1 (2021)
    (1, 0.6, '2021-01-31 12:00:00'),
    (1, 0.5, '2021-02-28 12:00:00'),
    (1, 0.7, '2021-03-31 12:00:00'),
    (1, 0.8, '2021-04-30 12:00:00'),
    (1, 0.8, '2021-05-31 12:00:00'),
    (1, 0.7, '2021-06-30 12:00:00'),
    (1, 0.8, '2021-07-31 12:00:00'),
    (1, 0.7, '2021-08-31 12:00:00'),
    (1, 0.8, '2021-09-30 12:00:00'),
    (1, 0.6, '2021-10-31 12:00:00'),
    (1, 0.5, '2021-11-30 12:00:00'),
    (1, 0.6, '2021-12-31 12:00:00'),

    -- Previous years for School 2 (2021)
    (2, 0.6, '2021-01-31 12:00:00'),
    (2, 0.5, '2021-02-28 12:00:00'),
    (2, 0.7, '2021-03-31 12:00:00'),
    (2, 0.8, '2021-04-30 12:00:00'),
    (2, 0.8, '2021-05-31 12:00:00'),
    (2, 0.7, '2021-06-30 12:00:00'),
    (2, 0.8, '2021-07-31 12:00:00'),
    (2, 0.7, '2021-08-31 12:00:00'),
    (2, 0.8, '2021-09-30 12:00:00'),
    (2, 0.6, '2021-10-31 12:00:00'),
    (2, 0.5, '2021-11-30 12:00:00'),
    (2, 0.6, '2021-12-31 12:00:00');


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