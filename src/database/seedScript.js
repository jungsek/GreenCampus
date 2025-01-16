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

IF OBJECT_ID('FK_EnergyBreakdown_EnergyUsageID', 'F') IS NOT NULL
  ALTER TABLE EnergyBreakdown DROP CONSTRAINT FK_EnergyBreakdown_EnergyUsageID;
IF OBJECT_ID('FK_CarbonFootprint_SchoolID', 'F') IS NOT NULL
  ALTER TABLE CarbonFootprint DROP CONSTRAINT FK_CarbonFootprint_SchoolID;
IF OBJECT_ID('FK_CarbonBreakdown_CarbonFootprintID', 'F') IS NOT NULL
  ALTER TABLE CarbonBreakdown DROP CONSTRAINT FK_CarbonBreakdown_CarbonFootprintID;
IF OBJECT_ID('FK_EnergyUsage_SchoolID', 'F') IS NOT NULL
  ALTER TABLE EnergyUsage DROP CONSTRAINT FK_EnergyUsage_SchoolID;
IF OBJECT_ID('FK_Schools_PrincipalID', 'F') IS NOT NULL
  ALTER TABLE Schools DROP CONSTRAINT FK_Schools_PrincipalID;
IF OBJECT_ID('FK_Users_Schools', 'F') IS NOT NULL
  ALTER TABLE Users DROP CONSTRAINT FK_Users_Schools;
IF OBJECT_ID('FK_Reports_SchoolID', 'F') IS NOT NULL
  ALTER TABLE Reports DROP CONSTRAINT FK_Reports_SchoolID;
IF OBJECT_ID('FK_Goals_SchoolID', 'F') IS NOT NULL
  ALTER TABLE Goals DROP CONSTRAINT FK_Goals_SchoolID;
IF OBJECT_ID('FK_Events_SchoolID', 'F') IS NOT NULL
  ALTER TABLE Events DROP CONSTRAINT FK_Events_SchoolID;
IF OBJECT_ID('FK_Events_CarbonFootprintID', 'F') IS NOT NULL
  ALTER TABLE Events DROP CONSTRAINT FK_Events_CarbonFootprintID;
IF OBJECT_ID('FK_Events_EnergyUsageID', 'F') IS NOT NULL
  ALTER TABLE Events DROP CONSTRAINT FK_Events_EnergyUsageID;
IF OBJECT_ID('FK_Campaigns_SchoolID', 'F') IS NOT NULL
  ALTER TABLE Campaigns DROP CONSTRAINT FK_Campaigns_SchoolID;
IF OBJECT_ID('FK_CampaignStudents_CampaignID', 'F') IS NOT NULL
  ALTER TABLE CampaignStudents DROP CONSTRAINT FK_CampaignStudents_CampaignID;
IF OBJECT_ID('FK_CampaignStudents_StudentID', 'F') IS NOT NULL
  ALTER TABLE CampaignStudents DROP CONSTRAINT FK_CampaignStudents_StudentID;

-- Drop all tables if they exist
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Schools', 'U') IS NOT NULL DROP TABLE dbo.Schools;
IF OBJECT_ID('dbo.EnergyUsage', 'U') IS NOT NULL DROP TABLE dbo.EnergyUsage;
IF OBJECT_ID('dbo.CarbonFootprint', 'U') IS NOT NULL DROP TABLE dbo.CarbonFootprint;
IF OBJECT_ID('dbo.Events', 'U') IS NOT NULL DROP TABLE dbo.Events;
IF OBJECT_ID('dbo.Campaigns', 'U') IS NOT NULL DROP TABLE dbo.Campaigns;
IF OBJECT_ID('dbo.CampaignStudents', 'U') IS NOT NULL DROP TABLE dbo.CampaignStudents;
IF OBJECT_ID('dbo.EnergyBreakdown', 'U') IS NOT NULL DROP TABLE dbo.EnergyBreakdown;
IF OBJECT_ID('dbo.CarbonBreakdown', 'U') IS NOT NULL DROP TABLE dbo.CarbonBreakdown;
IF OBJECT_ID('dbo.Goals', 'U') IS NOT NULL DROP TABLE dbo.Goals;
IF OBJECT_ID('dbo.Reports', 'U') IS NOT NULL DROP TABLE dbo.Reports;


-- Create Users table
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    points INT NULL,
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

CREATE TABLE CarbonBreakdown(
    id INT IDENTITY(1,1) PRIMARY KEY,
    carbonfootprint_id INT NOT NULL,
    location VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    timestamp DATETIME NOT NULL,
    percentage INT CHECK (percentage >= 0 AND percentage <= 100),
    FOREIGN KEY (carbonfootprint_id) REFERENCES CarbonFootprint(id) ON DELETE CASCADE
)

-- Create Reports table
CREATE TABLE Reports (
    id INT PRIMARY KEY IDENTITY,
    school_id INT NOT NULL,
    year INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    recommendation_data NVARCHAR(MAX),
    prediction_data NVARCHAR(MAX),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (school_id) REFERENCES Schools(id) ON DELETE CASCADE
);

CREATE TABLE Goals (
	id INT PRIMARY KEY IDENTITY(1,1),
	school_id INT NOT NULL,
	year INT NOT NULL,
	goal NVARCHAR(100) NOT NULL,
	metric NVARCHAR(100) NOT NULL, 
	metric_value FLOAT NOT NULL,
	FOREIGN KEY (school_id) REFERENCES Schools(id) ON DELETE CASCADE
)

CREATE TABLE Events(
    id INT PRIMARY KEY IDENTITY(1,1),
    school_id INT NOT NULL,
    name NVARCHAR(100) NULL,
    description NVARCHAR(255) NULL,
    date DATETIME NOT NULL,
    carbonfootprint_id int NULL,
    energyusage_id int NULL,
    FOREIGN KEY (school_id) REFERENCES Schools(id) ON DELETE CASCADE,
    FOREIGN KEY (carbonfootprint_id) REFERENCES CarbonFootprint(id) ON DELETE NO ACTION,
    FOREIGN KEY (energyusage_id) REFERENCES EnergyUsage(id) ON DELETE NO ACTION
)

CREATE TABLE Campaigns (
   id INT PRIMARY KEY IDENTITY(1,1),
   school_id INT NOT NULL,
   name NVARCHAR(100) NOT NULL,
   description NVARCHAR(255) NULL,
   image VARCHAR(MAX) NULL,
   points INT NOT NULL,
   FOREIGN KEY (school_id) REFERENCES Schools(id) ON DELETE CASCADE
   )

CREATE TABLE CampaignStudents (
  id INT PRIMARY KEY IDENTITY(1,1),
  student_id INT NOT NULL,
  campaign_id INT NOT NULL, 
  FOREIGN KEY (student_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES Campaigns(id) ON DELETE CASCADE
)
`;

async function insertData(connection) {
  await connection.request().query(`
      -- First insert the lecturers (without school_id since they're principals)
      INSERT INTO Users (first_name, last_name, email, password, role, school_id)
      VALUES ('George', 'Wilson', 'george@noom.com', '$2b$10$4eIfPXGkq6MI.lQ3DKuVm.GWY3HIQNIlib78kJqloNbrA4pGx5Ljm', 'lecturer', null);
      
      INSERT INTO Users (first_name, last_name, email, password, role, school_id)
      VALUES ('Regina', 'William', 'regina@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'lecturer', null);

      INSERT INTO Users (first_name, last_name, email, password, role, school_id)
      VALUES ('Michael', 'Brown', 'michael.brown@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'lecturer', null);

      INSERT INTO Users (first_name, last_name, email, password, role, school_id)
      VALUES ('Alex', 'Johnson', 'alex.johnson@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'lecturer', null);

      INSERT INTO Users (first_name, last_name, email, password, role, school_id)
      VALUES ('Jessica', 'Smith', 'jessica.smith@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'lecturer', null);

      INSERT INTO Users (first_name, last_name, email, password, role, school_id)
      VALUES ('Michael', 'Peter', 'michael.peter@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'lecturer', null);

      INSERT INTO Users (first_name, last_name, email, password, role, school_id)
      VALUES ('Emily', 'Clark', 'emily.clark@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'lecturer', null);
    
      INSERT INTO Users (first_name, last_name, email, password, role, school_id)
      VALUES ('David', 'Chen', 'david.chen@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'lecturer', null);
    
      INSERT INTO Users (first_name, last_name, email, password, role, school_id)
      VALUES ('Sophia', 'Jones', 'sophia.jones@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'lecturer', null);
    
      INSERT INTO Users (first_name, last_name, email, password, role, school_id)
      VALUES ('Daniel', 'Nguyen', 'daniel.nguyen@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'lecturer', null);

      -- Then create the schools with the lecturer IDs
      INSERT INTO Schools (school_name, description, principal_id)
      VALUES ('Lincoln High School', 'A comprehensive public high school focused on STEM education', 1);

      INSERT INTO Schools (school_name, description, principal_id)
      VALUES ('Washington Elementary', 'K-5 elementary school with emphasis on early childhood development', 2);

      INSERT INTO Schools (school_name, description, principal_id)
      VALUES ('Roosevelt Academy', 'A private high school offering a rigorous college preparatory curriculum', 3);

      INSERT INTO Schools (school_name, description, principal_id)
      VALUES ('Jefferson International School', 'An international school with a focus on bilingual education and global citizenship', 4);

      INSERT INTO Schools (school_name, description, principal_id)
      VALUES ('Greenwood High', 'A public high school with an emphasis on environmental studies and sustainability', 5);

      INSERT INTO Schools (school_name, description, principal_id)
      VALUES ('Harrison Arts School', 'A specialized school for the arts with programs in music, theater, and visual arts', 6); 

      INSERT INTO Schools (school_name, description, principal_id)
      VALUES ('Maplewood Community School', 'A community-centered school focused on holistic education and local engagement', 7);
    
      INSERT INTO Schools (school_name, description, principal_id)
      VALUES ('Sunrise Technical Institute', 'A vocational high school specializing in technical and trade education', 8);
      
      INSERT INTO Schools (school_name, description, principal_id)
      VALUES ('Eastside STEM Academy', 'A magnet school with programs focused on science, technology, engineering, and math', 9);
      
      INSERT INTO Schools (school_name, description, principal_id)
      VALUES ('Cedar Grove Charter School', 'An innovative charter school emphasizing project-based learning and student-driven inquiry', 10);

      -- Finally insert the students with their school_ids
      INSERT INTO Users (first_name, last_name, email, password, role, school_id, points)
      VALUES ('Toby', 'Dean', 'toby@noom.com', '$2b$10$4eIfPXGkq6MI.lQ3DKuVm.GWY3HIQNIlib78kJqloNbrA4pGx5Ljm', 'student', 1, 0);
      
      INSERT INTO Users (first_name, last_name, email, password, role, school_id, points)
      VALUES ('Sarah', 'Lee', 'sarah@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student', 2, 6);

      INSERT INTO Users (first_name, last_name, email, password, role, school_id, points)
      VALUES ('Ethan', 'Garcia', 'ethan.garcia@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student', 3, 14);

      INSERT INTO Users (first_name, last_name, email, password, role, school_id, points)
      VALUES ('Olivia', 'Martinez', 'olivia.martinez@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student', 4, 24);

      INSERT INTO Users (first_name, last_name, email, password, role, school_id, points)
      VALUES ('Liam', 'Johnson', 'liam.johnson@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student', 5, 28);

      INSERT INTO Users (first_name, last_name, email, password, role, school_id, points)
      VALUES ('Ava', 'Brown', 'ava.brown@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student', 6, 0);

      INSERT INTO Users (first_name, last_name, email, password, role, school_id, points)
      VALUES ('Noah', 'Davis', 'noah.davis@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student', 7, 0);
      
      INSERT INTO Users (first_name, last_name, email, password, role, school_id, points)
      VALUES ('Mia', 'Wilson', 'mia.wilson@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student', 8, 5);
      
      INSERT INTO Users (first_name, last_name, email, password, role, school_id, points)
      VALUES ('Paige', 'Taylor', 'paige.taylor@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student', 9, 6);
      
      INSERT INTO Users (first_name, last_name, email, password, role, school_id, points)
      VALUES ('Ella', 'Anderson', 'ella.anderson@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student', 10, 10);

-- Mock data for EnergyUsage table
INSERT INTO EnergyUsage (school_id, month, energy_kwh, avg_temperature_c, timestamp)
VALUES
    -- School 1 Data
    -- 2021 (Baseline Year)
    (1, 'January', 1000, 24.5, '2021-01-15 10:00:00'),
    (1, 'February', 950, 23.8, '2021-02-15 10:00:00'),
    (1, 'March', 1100, 26.1, '2021-03-15 10:00:00'),
    (1, 'April', 1300, 27.3, '2021-04-15 10:00:00'),
    (1, 'May', 980, 26.5, '2021-05-15 10:00:00'),
    (1, 'June', 1125, 28.0, '2021-06-15 10:00:00'),
    (1, 'July', 1150, 30.2, '2021-07-15 10:00:00'),
    (1, 'August', 1200, 29.9, '2021-08-15 10:00:00'),
    (1, 'September', 1100, 26.1, '2021-09-15 10:00:00'),
    (1, 'October', 1200, 23.5, '2021-10-15 10:00:00'),
    (1, 'November', 1150, 25.1, '2021-11-15 10:00:00'),
    (1, 'December', 1250, 22.0, '2021-12-15 10:00:00'),

    -- 2022 (Significant Increase)
    (1, 'January', 1250, 25.5, '2022-01-15 10:00:00'),
    (1, 'February', 1360, 24.0, '2022-02-15 10:00:00'),
    (1, 'March', 1400, 27.0, '2022-03-15 10:00:00'),
    (1, 'April', 1300, 28.5, '2022-04-15 10:00:00'),
    (1, 'May', 1550, 27.5, '2022-05-15 10:00:00'),
    (1, 'June', 1700, 30.0, '2022-06-15 10:00:00'),
    (1, 'July', 1600, 32.0, '2022-07-15 10:00:00'),
    (1, 'August', 1750, 31.5, '2022-08-15 10:00:00'),
    (1, 'September', 1700, 28.0, '2022-09-15 10:00:00'),
    (1, 'October', 1675, 25.0, '2022-10-15 10:00:00'),
    (1, 'November', 1800, 26.0, '2022-11-15 10:00:00'),
    (1, 'December', 1850, 23.0, '2022-12-15 10:00:00'),

    -- 2023 (Overall Decrease)
    (1, 'January', 800, 23.0, '2023-01-15 10:00:00'),
    (1, 'February', 750, 22.0, '2023-02-15 10:00:00'),
    (1, 'March', 900, 24.0, '2023-03-15 10:00:00'),
    (1, 'April', 1000, 25.0, '2023-04-15 10:00:00'),
    (1, 'May', 850, 23.5, '2023-05-15 10:00:00'),
    (1, 'June', 950, 26.0, '2023-06-15 10:00:00'),
    (1, 'July', 1000, 27.5, '2023-07-15 10:00:00'),
    (1, 'August', 1100, 28.0, '2023-08-15 10:00:00'),
    (1, 'September', 900, 25.0, '2023-09-15 10:00:00'),
    (1, 'October', 950, 24.0, '2023-10-15 10:00:00'),
    (1, 'November', 800, 23.0, '2023-11-15 10:00:00'),
    (1, 'December', 750, 20.0, '2023-12-15 10:00:00'),

    -- 2024 (Fluctuating Trend)
   (1, 'January', 1300, 26.0, '2024-01-31 12:00:00'),
    (1, 'February', 1200, 25.5, '2024-02-28 12:00:00'),
    (1, 'March', 1400, 28.0, '2024-03-31 12:00:00'),
    (1, 'April', 1100, 27.0, '2024-04-30 12:00:00'),
    (1, 'May', 1150, 26.0, '2024-05-31 12:00:00'),
    (1, 'June', 1250, 29.0, '2024-06-30 12:00:00'),
    (1, 'July', 1500, 30.0, '2024-07-31 12:00:00'),
    (1, 'August', 1400, 29.5, '2024-08-31 12:00:00'),
    (1, 'September', 1300, 26.5, '2024-09-30 12:00:00'),
    (1, 'October', 1200, 24.5, '2024-10-31 12:00:00'),
    (1, 'November', 1250, 23.5, '2024-11-30 12:00:00'),
    (1, 'December', 1350, 22.5, '2024-12-31 12:00:00'),

    -- School 2 Data
    -- 2021 (Baseline Year)
    (2, 'January', 900, 22.0, '2021-01-15 10:00:00'),
    (2, 'February', 880, 24.0, '2021-02-15 10:00:00'),
    (2, 'March', 950, 25.0, '2021-03-15 10:00:00'),
    (2, 'April', 1020, 26.5, '2021-04-15 10:00:00'),
    (2, 'May', 800, 25.5, '2021-05-15 10:00:00'),
    (2, 'June', 850, 27.0, '2021-06-15 10:00:00'),
    (2, 'July', 900, 28.2, '2021-07-15 10:00:00'),
    (2, 'August', 960, 30.0, '2021-08-15 10:00:00'),
    (2, 'September', 1000, 26.0, '2021-09-15 10:00:00'),
    (2, 'October', 1020, 24.5, '2021-10-15 10:00:00'),
    (2, 'November', 950, 23.5, '2021-11-15 10:00:00'),
    (2, 'December', 920, 21.0, '2021-12-15 10:00:00'),

    -- 2022 (Overall Increase)
    (2, 'January', 1100, 23.0, '2022-01-15 10:00:00'),
    (2, 'February', 1150, 24.2, '2022-02-15 10:00:00'),
    (2, 'March', 1250, 26.0, '2022-03-15 10:00:00'),
    (2, 'April', 1400, 27.5, '2022-04-15 10:00:00'),
    (2, 'May', 1300, 25.0, '2022-05-15 10:00:00'),
    (2, 'June', 1350, 28.0, '2022-06-15 10:00:00'),
    (2, 'July', 1450, 30.5, '2022-07-15 10:00:00'),
    (2, 'August', 1500, 31.0, '2022-08-15 10:00:00'),
    (2, 'September', 1600, 28.0, '2022-09-15 10:00:00'),
    (2, 'October', 1550, 25.5, '2022-10-15 10:00:00'),
    (2, 'November', 1500, 26.0, '2022-11-15 10:00:00'),
    (2, 'December', 1600, 22.0, '2022-12-15 10:00:00'),

    -- 2023 (Overall Decrease)
    (2, 'January', 850, 22.5, '2023-01-15 10:00:00'),
    (2, 'February', 820, 22.0, '2023-02-15 10:00:00'),
    (2, 'March', 790, 23.5, '2023-03-15 10:00:00'),
    (2, 'April', 760, 24.0, '2023-04-15 10:00:00'),
    (2, 'May', 700, 23.0, '2023-05-15 10:00:00'),
    (2, 'June', 680, 25.0, '2023-06-15 10:00:00'),
    (2, 'July', 600, 26.0, '2023-07-15 10:00:00'),
    (2, 'August', 590, 27.0, '2023-08-15 10:00:00'),
    (2, 'September', 620, 25.5, '2023-09-15 10:00:00'),
    (2, 'October', 650, 24.0, '2023-10-15 10:00:00'),
    (2, 'November', 600, 23.0, '2023-11-15 10:00:00'),
    (2, 'December', 580, 20.5, '2023-12-15 10:00:00'),

    -- 2024 (Fluctuating Trend)
    (2, 'January', 700, 24.0, '2024-01-15 10:00:00'),
    (2, 'February', 900, 25.5, '2024-02-15 10:00:00'),
    (2, 'March', 1000, 26.5, '2024-03-15 10:00:00'),
    (2, 'April', 950, 28.0, '2024-04-15 10:00:00'),
    (2, 'May', 850, 26.5, '2024-05-15 10:00:00'),
    (2, 'June', 1100, 29.0, '2024-06-15 10:00:00'),
    (2, 'July', 1150, 30.5, '2024-07-15 10:00:00'),
    (2, 'August', 1050, 31.0, '2024-08-15 10:00:00'),
    (2, 'September', 900, 28.0, '2024-09-15 10:00:00'),
    (2, 'October', 1000, 25.0, '2024-10-15 10:00:00'),
    (2, 'November', 950, 24.0, '2024-11-15 10:00:00'),
    (2, 'December', 800, 23.0, '2024-12-15 10:00:00'),

    -- School 3 Data (2024)
    (3, 'January', 800, 23.5, '2024-01-15 10:00:00'),
    (3, 'February', 950, 24.5, '2024-02-15 10:00:00'),
    (3, 'March', 1100, 25.0, '2024-03-15 10:00:00'),
    (3, 'April', 1050, 27.0, '2024-04-15 10:00:00'),
    (3, 'May', 900, 26.0, '2024-05-15 10:00:00'),
    (3, 'June', 1150, 29.5, '2024-06-15 10:00:00'),
    (3, 'July', 1200, 31.0, '2024-07-15 10:00:00'),
    (3, 'August', 1100, 30.5, '2024-08-15 10:00:00'),
    (3, 'September', 950, 28.0, '2024-09-15 10:00:00'),
    (3, 'October', 1050, 25.5, '2024-10-15 10:00:00'),
    (3, 'November', 1200, 24.0, '2024-11-15 10:00:00'),
    (3, 'December', 950, 23.0, '2024-12-15 10:00:00'),

    -- School 4 Data (2024)
    (4, 'January', 750, 22.5, '2024-01-15 10:00:00'),
    (4, 'February', 850, 23.5, '2024-02-15 10:00:00'),
    (4, 'March', 950, 24.0, '2024-03-15 10:00:00'),
    (4, 'April', 1200, 25.0, '2024-04-15 10:00:00'),
    (4, 'May', 890, 24.5, '2024-05-15 10:00:00'),
    (4, 'June', 1050, 28.0, '2024-06-15 10:00:00'),
    (4, 'July', 1100, 29.5, '2024-07-15 10:00:00'),
    (4, 'August', 1000, 28.5, '2024-08-15 10:00:00'),
    (4, 'September', 900, 27.0, '2024-09-15 10:00:00'),
    (4, 'October', 950, 24.0, '2024-10-15 10:00:00'),
    (4, 'November', 1000, 23.0, '2024-11-15 10:00:00'),
    (4, 'December', 800, 22.0, '2024-12-15 10:00:00'),

    -- School 5 Data (2024)
    (5, 'January', 690, 21.0, '2024-01-15 10:00:00'),
    (5, 'February', 750, 22.0, '2024-02-15 10:00:00'),
    (5, 'March', 850, 23.0, '2024-03-15 10:00:00'),
    (5, 'April', 900, 24.0, '2024-04-15 10:00:00'),
    (5, 'May', 750, 23.5, '2024-05-15 10:00:00'),
    (5, 'June', 950, 27.0, '2024-06-15 10:00:00'),
    (5, 'July', 1000, 28.5, '2024-07-15 10:00:00'),
    (5, 'August', 950, 28.0, '2024-08-15 10:00:00'),
    (5, 'September', 800, 26.0, '2024-09-15 10:00:00'),
    (5, 'October', 850, 23.5, '2024-10-15 10:00:00'),
    (5, 'November', 1150, 22.5, '2024-11-15 10:00:00'),
    (5, 'December', 970, 21.0, '2024-12-15 10:00:00'),

    -- School 6 Data (2024)
    (6, 'January', 720, 20.5, '2024-01-15 10:00:00'),
    (6, 'February', 780, 21.5, '2024-02-15 10:00:00'),
    (6, 'March', 870, 23.0, '2024-03-15 10:00:00'),
    (6, 'April', 930, 24.2, '2024-04-15 10:00:00'),
    (6, 'May', 770, 22.8, '2024-05-15 10:00:00'),
    (6, 'June', 980, 26.5, '2024-06-15 10:00:00'),
    (6, 'July', 1020, 27.8, '2024-07-15 10:00:00'),
    (6, 'August', 970, 27.5, '2024-08-15 10:00:00'),
    (6, 'September', 820, 25.5, '2024-09-15 10:00:00'),
    (6, 'October', 980, 23.0, '2024-10-15 10:00:00'),
    (6, 'November', 1200, 21.8, '2024-11-15 10:00:00'),
    (6, 'December', 990, 20.3, '2024-12-15 10:00:00'),

    -- School 7 Data (2024)
    (7, 'January', 780, 19.5, '2024-01-15 10:00:00'),
    (7, 'February', 940, 20.0, '2024-02-15 10:00:00'),
    (7, 'March', 820, 22.0, '2024-03-15 10:00:00'),
    (7, 'April', 880, 23.5, '2024-04-15 10:00:00'),
    (7, 'May', 840, 22.0, '2024-05-15 10:00:00'),
    (7, 'June', 950, 25.0, '2024-06-15 10:00:00'),
    (7, 'July', 1010, 26.0, '2024-07-15 10:00:00'),
    (7, 'August', 960, 25.8, '2024-08-15 10:00:00'),
    (7, 'September', 810, 24.0, '2024-09-15 10:00:00'),
    (7, 'October', 870, 22.5, '2024-10-15 10:00:00'),
    (7, 'November', 1130, 21.0, '2024-11-15 10:00:00'),
    (7, 'December', 970, 19.8, '2024-12-15 10:00:00'),

    -- School 8 Data (2024)
    (8, 'January', 820, 20.0, '2024-01-15 10:00:00'),
    (8, 'February', 890, 21.0, '2024-02-15 10:00:00'),
    (8, 'March', 840, 23.5, '2024-03-15 10:00:00'),
    (8, 'April', 910, 24.8, '2024-04-15 10:00:00'),
    (8, 'May', 870, 23.0, '2024-05-15 10:00:00'),
    (8, 'June', 960, 25.8, '2024-06-15 10:00:00'),
    (8, 'July', 1015, 26.5, '2024-07-15 10:00:00'),
    (8, 'August', 965, 26.2, '2024-08-15 10:00:00'),
    (8, 'September', 810, 24.5, '2024-09-15 10:00:00'),
    (8, 'October', 880, 23.0, '2024-10-15 10:00:00'),
    (8, 'November', 1140, 21.2, '2024-11-15 10:00:00'),
    (8, 'December', 980, 20.0, '2024-12-15 10:00:00'),

    -- School 9 Data (2024)
    (9, 'January', 890, 19.8, '2024-01-15 10:00:00'),
    (9, 'February', 790, 20.5, '2024-02-15 10:00:00'),
    (9, 'March', 860, 22.5, '2024-03-15 10:00:00'),
    (9, 'April', 930, 24.0, '2024-04-15 10:00:00'),
    (9, 'May', 900, 23.0, '2024-05-15 10:00:00'),
    (9, 'June', 970, 25.0, '2024-06-15 10:00:00'),
    (9, 'July', 1025, 26.2, '2024-07-15 10:00:00'),
    (9, 'August', 980, 25.7, '2024-08-15 10:00:00'),
    (9, 'September', 1010, 24.3, '2024-09-15 10:00:00'),
    (9, 'October', 890, 22.8, '2024-10-15 10:00:00'),
    (9, 'November', 1150, 21.5, '2024-11-15 10:00:00'),
    (9, 'December', 990, 20.2, '2024-12-15 10:00:00'),

    -- School 10 Data (2024)
    (10, 'January', 810, 19.8, '2024-01-15 10:00:00'),
    (10, 'February', 970, 20.5, '2024-02-15 10:00:00'),
    (10, 'March', 850, 22.5, '2024-03-15 10:00:00'),
    (10, 'April', 920, 23.5, '2024-04-15 10:00:00'),
    (10, 'May', 860, 22.8, '2024-05-15 10:00:00'),
    (10, 'June', 950, 25.2, '2024-06-15 10:00:00'),
    (10, 'July', 1010, 26.5, '2024-07-15 10:00:00'),
    (10, 'August', 960, 26.0, '2024-08-15 10:00:00'),
    (10, 'September', 990, 24.8, '2024-09-15 10:00:00'),
    (10, 'October', 970, 23.2, '2024-10-15 10:00:00'),
    (10, 'November', 1135, 21.2, '2024-11-15 10:00:00'),
    (10, 'December', 980, 20.0, '2024-12-15 10:00:00');

-- Mock data for EnergyBreakdown table
INSERT INTO EnergyBreakdown (energyusage_id, location, category, percentage, timestamp)
VALUES
        -- January 2021 (ID 1)
    (1, 'Classroom', 'Lighting', 30, '2021-01-15 10:00:00'),
    (1, 'Library', 'HVAC', 15, '2021-01-15 10:00:00'),
    (1, 'Office', 'Lighting', 15, '2021-01-15 10:00:00'),
    (1, 'Cafeteria', 'Refrigeration', 10, '2021-01-15 10:00:00'),
    (1, 'Auditorium', 'Lighting', 30, '2021-01-15 10:00:00'),

    -- February 2021 (ID 2)
    (2, 'Gym', 'Lighting', 20, '2021-02-15 10:00:00'),
    (2, 'Library', 'Lighting', 15, '2021-02-15 10:00:00'),
    (2, 'Classroom', 'Computers', 20, '2021-02-15 10:00:00'),
    (2, 'Cafeteria', 'HVAC', 25, '2021-02-15 10:00:00'),
    (2, 'Hallway', 'Lighting', 20, '2021-02-15 10:00:00'),

    -- March 2021 (ID 3)
    (3, 'Laboratory', 'Lighting', 25, '2021-03-15 10:00:00'),
    (3, 'Office', 'Lighting', 15, '2021-03-15 10:00:00'),
    (3, 'Cafeteria', 'Lighting', 10, '2021-03-15 10:00:00'),
    (3, 'Auditorium', 'Lighting', 10, '2021-03-15 10:00:00'),
    (3, 'Classroom', 'HVAC', 40, '2021-03-15 10:00:00'),

    -- April 2021 (ID 4)
    (4, 'Hallway', 'Lighting', 25, '2021-04-15 10:00:00'),
    (4, 'Cafeteria', 'Refrigeration', 20, '2021-04-15 10:00:00'),
    (4, 'Library', 'Lighting', 25, '2021-04-15 10:00:00'),
    (4, 'Auditorium', 'Lighting', 15, '2021-04-15 10:00:00'),
    (4, 'Classroom', 'HVAC', 15, '2021-04-15 10:00:00'),

    -- May 2021 (ID 5)
    (5, 'Classroom', 'Lighting', 30, '2021-05-15 10:00:00'),
    (5, 'Library', 'Computers', 25, '2021-05-15 10:00:00'),
    (5, 'Office', 'Lighting', 20, '2021-05-15 10:00:00'),
    (5, 'Auditorium', 'HVAC', 15, '2021-05-15 10:00:00'),
    (5, 'Hallway', 'Lighting', 10, '2021-05-15 10:00:00'),

    -- June 2021 (ID 6)
    (6, 'Classroom', 'Lighting', 25, '2021-06-15 10:00:00'),
    (6, 'Gym', 'HVAC', 25, '2021-06-15 10:00:00'),
    (6, 'Library', 'HVAC', 25, '2021-06-15 10:00:00'),
    (6, 'Cafeteria', 'Refrigeration', 15, '2021-06-15 10:00:00'),
    (6, 'Hallway', 'Lighting', 10, '2021-06-15 10:00:00'),

    -- July 2021 (ID 7)
    (7, 'Classroom', 'Lighting', 25, '2021-07-15 10:00:00'),
    (7, 'Library', 'HVAC', 20, '2021-07-15 10:00:00'),
    (7, 'Cafeteria', 'Lighting', 20, '2021-07-15 10:00:00'),
    (7, 'Auditorium', 'Lighting', 15, '2021-07-15 10:00:00'),
    (7, 'Hallway', 'Lighting', 20, '2021-07-15 10:00:00'),

    -- August 2021 (ID 8)
    (8, 'Classroom', 'Lighting', 25, '2021-08-15 10:00:00'),
    (8, 'Library', 'HVAC', 20, '2021-08-15 10:00:00'),
    (8, 'Auditorium', 'Lighting', 15, '2021-08-15 10:00:00'),
    (8, 'Cafeteria', 'Refrigeration', 25, '2021-08-15 10:00:00'),
    (8, 'Hallway', 'Lighting', 15, '2021-08-15 10:00:00'),

    -- September 2021 (ID 9)
    (9, 'Classroom', 'Lighting', 25, '2021-09-15 10:00:00'),
    (9, 'Library', 'HVAC', 20, '2021-09-15 10:00:00'),
    (9, 'Office', 'Lighting', 20, '2021-09-15 10:00:00'),
    (9, 'Auditorium', 'Lighting', 20, '2021-09-15 10:00:00'),
    (9, 'Hallway', 'Lighting', 15, '2021-09-15 10:00:00'),

    -- October 2021 (ID 10)
    (10, 'Classroom', 'Lighting', 30, '2021-10-15 10:00:00'),
    (10, 'Library', 'HVAC', 20, '2021-10-15 10:00:00'),
    (10, 'Office', 'Lighting', 25, '2021-10-15 10:00:00'),
    (10, 'Auditorium', 'Lighting', 15, '2021-10-15 10:00:00'),
    (10, 'Hallway', 'Lighting', 10, '2021-10-15 10:00:00'),

    -- November 2021 (ID 11)
    (11, 'Classroom', 'Lighting', 30, '2021-11-15 10:00:00'),
    (11, 'Library', 'HVAC', 25, '2021-11-15 10:00:00'),
    (11, 'Office', 'Lighting', 20, '2021-11-15 10:00:00'),
    (11, 'Auditorium', 'Lighting', 15, '2021-11-15 10:00:00'),
    (11, 'Hallway', 'Lighting', 10, '2021-11-15 10:00:00'),

    -- December 2021 (ID 12)
    (12, 'Classroom', 'Lighting', 25, '2021-12-15 10:00:00'),
    (12, 'Library', 'HVAC', 30, '2021-12-15 10:00:00'),
    (12, 'Office', 'Lighting', 25, '2021-12-15 10:00:00'),
    (12, 'Auditorium', 'Lighting', 15, '2021-12-15 10:00:00'),
    (12, 'Hallway', 'Lighting', 5, '2021-12-15 10:00:00'),


    -- January 2022
(13, 'Laboratory', 'Lighting', 18, '2022-01-15 10:00:00'),
(13, 'Laboratory', 'HVAC', 20, '2022-01-15 10:00:00'),
(13, 'Laboratory', 'Computers', 15, '2022-01-15 10:00:00'),
(13, 'Office', 'Lighting', 10, '2022-01-15 10:00:00'),
(13, 'Office', 'HVAC', 8, '2022-01-15 10:00:00'),
(13, 'Cafeteria', 'Lighting', 5, '2022-01-15 10:00:00'),
(13, 'Gym', 'Equipment', 7, '2022-01-15 10:00:00'),
(13, 'Auditorium', 'Lighting', 5, '2022-01-15 10:00:00'),
(13, 'Laboratory', 'Food Waste Management', 4, '2022-01-15 10:00:00'),
(13, 'Classroom', 'HVAC', 3, '2022-01-15 10:00:00'),
(13, 'Library', 'Computers', 3, '2022-01-15 10:00:00'),
(13, 'Hallway', 'Lighting', 2, '2022-01-15 10:00:00'),

-- February 2022
(14, 'Classroom', 'Lighting', 20, '2022-02-15 10:00:00'),
(14, 'Classroom', 'Computers', 18, '2022-02-15 10:00:00'),
(14, 'Classroom', 'HVAC', 15, '2022-02-15 10:00:00'),
(14, 'Library', 'Lighting', 8, '2022-02-15 10:00:00'),
(14, 'Library', 'HVAC', 10, '2022-02-15 10:00:00'),
(14, 'Office', 'Lighting', 8, '2022-02-15 10:00:00'),
(14, 'Gym', 'Equipment', 5, '2022-02-15 10:00:00'),
(14, 'Cafeteria', 'Refrigeration', 6, '2022-02-15 10:00:00'),
(14, 'Cafeteria', 'Appliances', 3, '2022-02-15 10:00:00'),
(14, 'Auditorium', 'Lighting', 3, '2022-02-15 10:00:00'),
(14, 'Laboratory', 'HVAC', 2, '2022-02-15 10:00:00'),
(14, 'Hallway', 'Lighting', 2, '2022-02-15 10:00:00'),

-- March 2022
(15, 'Laboratory', 'Lighting', 18, '2022-03-15 10:00:00'),
(15, 'Laboratory', 'HVAC', 20, '2022-03-15 10:00:00'),
(15, 'Laboratory', 'Computers', 15, '2022-03-15 10:00:00'),
(15, 'Office', 'Lighting', 10, '2022-03-15 10:00:00'),
(15, 'Office', 'HVAC', 8, '2022-03-15 10:00:00'),
(15, 'Cafeteria', 'Lighting', 5, '2022-03-15 10:00:00'),
(15, 'Gym', 'Equipment', 7, '2022-03-15 10:00:00'),
(15, 'Auditorium', 'Lighting', 5, '2022-03-15 10:00:00'),
(15, 'Laboratory', 'Food Waste Management', 4, '2022-03-15 10:00:00'),
(15, 'Classroom', 'HVAC', 3, '2022-03-15 10:00:00'),
(15, 'Library', 'Computers', 3, '2022-03-15 10:00:00'),
(15, 'Hallway', 'Lighting', 2, '2022-03-15 10:00:00'),

-- April 2022
(16, 'Classroom', 'Lighting', 20, '2022-04-15 10:00:00'),
(16, 'Classroom', 'Computers', 18, '2022-04-15 10:00:00'),
(16, 'Classroom', 'HVAC', 15, '2022-04-15 10:00:00'),
(16, 'Library', 'Lighting', 8, '2022-04-15 10:00:00'),
(16, 'Library', 'HVAC', 10, '2022-04-15 10:00:00'),
(16, 'Office', 'Lighting', 8, '2022-04-15 10:00:00'),
(16, 'Gym', 'Equipment', 5, '2022-04-15 10:00:00'),
(16, 'Cafeteria', 'Refrigeration', 6, '2022-04-15 10:00:00'),
(16, 'Cafeteria', 'Appliances', 3, '2022-04-15 10:00:00'),
(16, 'Auditorium', 'Lighting', 3, '2022-04-15 10:00:00'),
(16, 'Laboratory', 'HVAC', 2, '2022-04-15 10:00:00'),
(16, 'Hallway', 'Lighting', 2, '2022-04-15 10:00:00'),

-- May 2022
(17, 'Gym', 'Lighting', 15, '2022-05-15 10:00:00'),
(17, 'Gym', 'HVAC', 20, '2022-05-15 10:00:00'),
(17, 'Cafeteria', 'Appliances', 18, '2022-05-15 10:00:00'),
(17, 'Cafeteria', 'HVAC', 10, '2022-05-15 10:00:00'),
(17, 'Cafeteria', 'Food Waste Management', 5, '2022-05-15 10:00:00'),
(17, 'Library', 'Lighting', 8, '2022-05-15 10:00:00'),
(17, 'Classroom', 'Computers', 8, '2022-05-15 10:00:00'),
(17, 'Classroom', 'HVAC', 5, '2022-05-15 10:00:00'),
(17, 'Office', 'Lighting', 4, '2022-05-15 10:00:00'),
(17, 'Laboratory', 'Computers', 3, '2022-05-15 10:00:00'),
(17, 'Staff Room', 'HVAC', 2, '2022-05-15 10:00:00'),
(17, 'Hallway', 'Lighting', 2, '2022-05-15 10:00:00'),

-- June 2022
(18, 'Laboratory', 'Lighting', 18, '2022-06-15 10:00:00'),
(18, 'Laboratory', 'HVAC', 20, '2022-06-15 10:00:00'),
(18, 'Laboratory', 'Computers', 15, '2022-06-15 10:00:00'),
(18, 'Office', 'Lighting', 10, '2022-06-15 10:00:00'),
(18, 'Office', 'HVAC', 8, '2022-06-15 10:00:00'),
(18, 'Cafeteria', 'Lighting', 5, '2022-06-15 10:00:00'),
(18, 'Gym', 'Equipment', 7, '2022-06-15 10:00:00'),
(18, 'Auditorium', 'Lighting', 5, '2022-06-15 10:00:00'),
(18, 'Laboratory', 'Food Waste Management', 4, '2022-06-15 10:00:00'),
(18, 'Classroom', 'HVAC', 3, '2022-06-15 10:00:00'),
(18, 'Library', 'Computers', 3, '2022-06-15 10:00:00'),
(18, 'Hallway', 'Lighting', 2, '2022-06-15 10:00:00'),

   -- July 2022
(19, 'Classroom', 'Lighting', 20, '2022-07-15 10:00:00'),
(19, 'Classroom', 'Computers', 18, '2022-07-15 10:00:00'),
(19, 'Classroom', 'HVAC', 15, '2022-07-15 10:00:00'),
(19, 'Library', 'Lighting', 8, '2022-07-15 10:00:00'),
(19, 'Library', 'HVAC', 10, '2022-07-15 10:00:00'),
(19, 'Office', 'Lighting', 8, '2022-07-15 10:00:00'),
(19, 'Gym', 'Equipment', 5, '2022-07-15 10:00:00'),
(19, 'Cafeteria', 'Refrigeration', 6, '2022-07-15 10:00:00'),
(19, 'Cafeteria', 'Appliances', 3, '2022-07-15 10:00:00'),
(19, 'Auditorium', 'Lighting', 3, '2022-07-15 10:00:00'),
(19, 'Laboratory', 'HVAC', 2, '2022-07-15 10:00:00'),
(19, 'Hallway', 'Lighting', 2, '2022-07-15 10:00:00'),

-- August 2022
(20, 'Laboratory', 'Lighting', 18, '2022-08-15 10:00:00'),
(20, 'Laboratory', 'HVAC', 20, '2022-08-15 10:00:00'),
(20, 'Laboratory', 'Computers', 15, '2022-08-15 10:00:00'),
(20, 'Office', 'Lighting', 10, '2022-08-15 10:00:00'),
(20, 'Office', 'HVAC', 8, '2022-08-15 10:00:00'),
(20, 'Cafeteria', 'Lighting', 5, '2022-08-15 10:00:00'),
(20, 'Gym', 'Equipment', 7, '2022-08-15 10:00:00'),
(20, 'Auditorium', 'Lighting', 5, '2022-08-15 10:00:00'),
(20, 'Laboratory', 'Food Waste Management', 4, '2022-08-15 10:00:00'),
(20, 'Classroom', 'HVAC', 3, '2022-08-15 10:00:00'),
(20, 'Library', 'Computers', 3, '2022-08-15 10:00:00'),
(20, 'Hallway', 'Lighting', 2, '2022-08-15 10:00:00'),

-- September 2022
(21, 'Classroom', 'Lighting', 20, '2022-09-15 10:00:00'),
(21, 'Classroom', 'Computers', 18, '2022-09-15 10:00:00'),
(21, 'Classroom', 'HVAC', 15, '2022-09-15 10:00:00'),
(21, 'Library', 'Lighting', 8, '2022-09-15 10:00:00'),
(21, 'Library', 'HVAC', 10, '2022-09-15 10:00:00'),
(21, 'Office', 'Lighting', 8, '2022-09-15 10:00:00'),
(21, 'Gym', 'Equipment', 5, '2022-09-15 10:00:00'),
(21, 'Cafeteria', 'Refrigeration', 6, '2022-09-15 10:00:00'),
(21, 'Cafeteria', 'Appliances', 3, '2022-09-15 10:00:00'),
(21, 'Auditorium', 'Lighting', 3, '2022-09-15 10:00:00'),
(21, 'Laboratory', 'HVAC', 2, '2022-09-15 10:00:00'),
(21, 'Hallway', 'Lighting', 2, '2022-09-15 10:00:00'),

-- October 2022
(22, 'Gym', 'Lighting', 15, '2022-10-15 10:00:00'),
(22, 'Gym', 'HVAC', 20, '2022-10-15 10:00:00'),
(22, 'Cafeteria', 'Appliances', 18, '2022-10-15 10:00:00'),
(22, 'Cafeteria', 'HVAC', 10, '2022-10-15 10:00:00'),
(22, 'Cafeteria', 'Food Waste Management', 5, '2022-10-15 10:00:00'),
(22, 'Library', 'Lighting', 8, '2022-10-15 10:00:00'),
(22, 'Classroom', 'Computers', 8, '2022-10-15 10:00:00'),
(22, 'Classroom', 'HVAC', 5, '2022-10-15 10:00:00'),
(22, 'Office', 'Lighting', 4, '2022-10-15 10:00:00'),
(22, 'Laboratory', 'Computers', 3, '2022-10-15 10:00:00'),
(22, 'Staff Room', 'HVAC', 2, '2022-10-15 10:00:00'),
(22, 'Hallway', 'Lighting', 2, '2022-10-15 10:00:00'),

-- November 2022
(23, 'Laboratory', 'Lighting', 18, '2022-11-15 10:00:00'),
(23, 'Laboratory', 'HVAC', 20, '2022-11-15 10:00:00'),
(23, 'Laboratory', 'Computers', 15, '2022-11-15 10:00:00'),
(23, 'Office', 'Lighting', 10, '2022-11-15 10:00:00'),
(23, 'Office', 'HVAC', 8, '2022-11-15 10:00:00'),
(23, 'Cafeteria', 'Lighting', 5, '2022-11-15 10:00:00'),
(23, 'Gym', 'Equipment', 7, '2022-11-15 10:00:00'),
(23, 'Auditorium', 'Lighting', 5, '2022-11-15 10:00:00'),
(23, 'Laboratory', 'Food Waste Management', 4, '2022-11-15 10:00:00'),
(23, 'Classroom', 'HVAC', 3, '2022-11-15 10:00:00'),
(23, 'Library', 'Computers', 3, '2022-11-15 10:00:00'),
(23, 'Hallway', 'Lighting', 2, '2022-11-15 10:00:00'),

-- December 2022
(24, 'Classroom', 'Lighting', 20, '2022-12-15 10:00:00'),
(24, 'Classroom', 'Computers', 18, '2022-12-15 10:00:00'),
(24, 'Classroom', 'HVAC', 15, '2022-12-15 10:00:00'),
(24, 'Library', 'Lighting', 8, '2022-12-15 10:00:00'),
(24, 'Library', 'HVAC', 10, '2022-12-15 10:00:00'),
(24, 'Office', 'Lighting', 8, '2022-12-15 10:00:00'),
(24, 'Gym', 'Equipment', 5, '2022-12-15 10:00:00'),
(24, 'Cafeteria', 'Refrigeration', 6, '2022-12-15 10:00:00'),
(24, 'Cafeteria', 'Appliances', 3, '2022-12-15 10:00:00'),
(24, 'Auditorium', 'Lighting', 3, '2022-12-15 10:00:00'),
(24, 'Laboratory', 'HVAC', 2, '2022-12-15 10:00:00'),
(24, 'Hallway', 'Lighting', 2, '2022-12-15 10:00:00'),

  -- January 2023 (EnergyUsage ID 25)
    (25, 'Gym', 'Lighting', 11.43, '2023-01-15 10:00:00'),
    (25, 'Gym', 'HVAC', 20.00, '2023-01-15 10:00:00'),
    (25, 'Cafeteria', 'Appliances', 17.14, '2023-01-15 10:00:00'),
    (25, 'Cafeteria', 'HVAC', 5.71, '2023-01-15 10:00:00'),
    (25, 'Cafeteria', 'Food Waste Management', 2.86, '2023-01-15 10:00:00'),
    (25, 'Library', 'Lighting', 8.57, '2023-01-15 10:00:00'),
    (25, 'Classroom', 'Computers', 11.43, '2023-01-15 10:00:00'),
    (25, 'Classroom', 'HVAC', 5.71, '2023-01-15 10:00:00'),
    (25, 'Office', 'Lighting', 5.71, '2023-01-15 10:00:00'),
    (25, 'Laboratory', 'Computers', 5.71, '2023-01-15 10:00:00'),
    (25, 'Staff Room', 'HVAC', 2.86, '2023-01-15 10:00:00'),
    (25, 'Hallway', 'Lighting', 2.87, '2023-01-15 10:00:00'),

    -- February 2023 (EnergyUsage ID 26)
    (26, 'Laboratory', 'Lighting', 16.67, '2023-02-15 10:00:00'),
    (26, 'Laboratory', 'HVAC', 20.00, '2023-02-15 10:00:00'),
    (26, 'Laboratory', 'Computers', 13.33, '2023-02-15 10:00:00'),
    (26, 'Office', 'Lighting', 10.00, '2023-02-15 10:00:00'),
    (26, 'Office', 'HVAC', 6.67, '2023-02-15 10:00:00'),
    (26, 'Cafeteria', 'Lighting', 3.33, '2023-02-15 10:00:00'),
    (26, 'Gym', 'Equipment', 6.67, '2023-02-15 10:00:00'),
    (26, 'Auditorium', 'Lighting', 6.67, '2023-02-15 10:00:00'),
    (26, 'Laboratory', 'Food Waste Management', 3.33, '2023-02-15 10:00:00'),
    (26, 'Classroom', 'HVAC', 3.33, '2023-02-15 10:00:00'),
    (26, 'Library', 'Computers', 6.67, '2023-02-15 10:00:00'),
    (26, 'Hallway', 'Lighting', 3.33, '2023-02-15 10:00:00'),

    -- March 2023 (EnergyUsage ID 27)
    (27, 'Classroom', 'Lighting', 20.00, '2023-03-15 10:00:00'),
    (27, 'Classroom', 'Computers', 16.67, '2023-03-15 10:00:00'),
    (27, 'Classroom', 'HVAC', 13.33, '2023-03-15 10:00:00'),
    (27, 'Library', 'Lighting', 6.67, '2023-03-15 10:00:00'),
    (27, 'Library', 'HVAC', 10.00, '2023-03-15 10:00:00'),
    (27, 'Office', 'Lighting', 10.00, '2023-03-15 10:00:00'),
    (27, 'Gym', 'Equipment', 3.33, '2023-03-15 10:00:00'),
    (27, 'Cafeteria', 'Refrigeration', 6.67, '2023-03-15 10:00:00'),
    (27, 'Cafeteria', 'Appliances', 3.33, '2023-03-15 10:00:00'),
    (27, 'Auditorium', 'Lighting', 6.67, '2023-03-15 10:00:00'),
    (27, 'Laboratory', 'HVAC', 6.67, '2023-03-15 10:00:00'),
    (27, 'Hallway', 'Lighting', 3.33, '2023-03-15 10:00:00'),

    -- April 2023 (EnergyUsage ID 28)
    (28, 'Hallway', 'Lighting', 8.57, '2023-04-15 10:00:00'),
    (28, 'Hallway', 'HVAC', 20.00, '2023-04-15 10:00:00'),
    (28, 'Hallway', 'Appliances', 14.29, '2023-04-15 10:00:00'),
    (28, 'Cafeteria', 'Refrigeration', 8.57, '2023-04-15 10:00:00'),
    (28, 'Cafeteria', 'Food Waste Management', 5.71, '2023-04-15 10:00:00'),
    (28, 'Office', 'Computers', 5.71, '2023-04-15 10:00:00'),
    (28, 'Gym', 'HVAC', 5.71, '2023-04-15 10:00:00'),
    (28, 'Library', 'Lighting', 8.57, '2023-04-15 10:00:00'),
    (28, 'Laboratory', 'Computers', 8.57, '2023-04-15 10:00:00'),
    (28, 'Auditorium', 'Lighting', 5.71, '2023-04-15 10:00:00'),
    (28, 'Classroom', 'HVAC', 5.71, '2023-04-15 10:00:00'),
    (28, 'Staff Room', 'Lighting', 2.88, '2023-04-15 10:00:00'),

    -- May 2023 (EnergyUsage ID 29)
    (29, 'Classroom', 'Lighting', 25.81, '2023-05-15 10:00:00'),
    (29, 'Library', 'Computers', 19.35, '2023-05-15 10:00:00'),
    (29, 'Library', 'HVAC', 9.68, '2023-05-15 10:00:00'),
    (29, 'Office', 'Lighting', 6.45, '2023-05-15 10:00:00'),
    (29, 'Hallway', 'Lighting', 6.45, '2023-05-15 10:00:00'),
    (29, 'Cafeteria', 'Appliances', 6.45, '2023-05-15 10:00:00'),
    (29, 'Auditorium', 'HVAC', 9.68, '2023-05-15 10:00:00'),
    (29, 'Gym', 'Equipment', 9.68, '2023-05-15 10:00:00'),
    (29, 'Cafeteria', 'Food Waste Management', 3.23, '2023-05-15 10:00:00'),
    (29, 'Classroom', 'HVAC', 6.45, '2023-05-15 10:00:00'),
    (29, 'Laboratory', 'Computers', 6.45, '2023-05-15 10:00:00'),
    (29, 'Staff Room', 'Lighting', 3.23, '2023-05-15 10:00:00'),

    -- June 2023 (EnergyUsage ID 30)
    (30, 'Office', 'Lighting', 14.29, '2023-06-15 10:00:00'),
    (30, 'Office', 'HVAC', 17.14, '2023-06-15 10:00:00'),
    (30, 'Gym', 'Appliances', 14.29, '2023-06-15 10:00:00'),
    (30, 'Gym', 'HVAC', 8.57, '2023-06-15 10:00:00'),
    (30, 'Gym', 'Food Waste Management', 2.86, '2023-06-15 10:00:00'),
    (30, 'Classroom', 'Lighting', 5.71, '2023-06-15 10:00:00'),
    (30, 'Laboratory', 'Computers', 5.71, '2023-06-15 10:00:00'),
    (30, 'Library', 'HVAC', 8.57, '2023-06-15 10:00:00'),
    (30, 'Cafeteria', 'Refrigeration', 8.57, '2023-06-15 10:00:00'),
    (30, 'Cafeteria', 'Food Waste Management', 5.71, '2023-06-15 10:00:00'),
    (30, 'Office', 'Computers', 5.71, '2023-06-15 10:00:00'),
    (30, 'Hallway', 'Lighting', 2.87, '2023-06-15 10:00:00'),

   -- July 2023 (EnergyUsage ID 31)
    (31, 'Classroom', 'Lighting', 18.18, '2023-07-15 10:00:00'),
    (31, 'Classroom', 'HVAC', 15.15, '2023-07-15 10:00:00'),
    (31, 'Auditorium', 'Lighting', 15.15, '2023-07-15 10:00:00'),
    (31, 'Auditorium', 'HVAC', 6.06, '2023-07-15 10:00:00'),
    (31, 'Auditorium', 'Sound Equipment', 6.06, '2023-07-15 10:00:00'),
    (31, 'Library', 'Computers', 6.06, '2023-07-15 10:00:00'),
    (31, 'Laboratory', 'HVAC', 9.09, '2023-07-15 10:00:00'),
    (31, 'Staff Room', 'HVAC', 6.06, '2023-07-15 10:00:00'),
    (31, 'Cafeteria', 'Appliances', 6.06, '2023-07-15 10:00:00'),
    (31, 'Hallway', 'Lighting', 3.03, '2023-07-15 10:00:00'),
    (31, 'Gym', 'Food Waste Management', 3.03, '2023-07-15 10:00:00'),
    (31, 'Office', 'HVAC', 6.07, '2023-07-15 10:00:00'),

    -- August 2023 (EnergyUsage ID 32)
    (32, 'Cafeteria', 'Lighting', 11.76, '2023-08-15 10:00:00'),
    (32, 'Cafeteria', 'HVAC', 23.53, '2023-08-15 10:00:00'),
    (32, 'Laboratory', 'Appliances', 11.76, '2023-08-15 10:00:00'),
    (32, 'Laboratory', 'Computers', 5.88, '2023-08-15 10:00:00'),
    (32, 'Laboratory', 'Food Waste Management', 5.88, '2023-08-15 10:00:00'),
    (32, 'Library', 'HVAC', 8.82, '2023-08-15 10:00:00'),
    (32, 'Cafeteria', 'Refrigeration', 8.82, '2023-08-15 10:00:00'),
    (32, 'Auditorium', 'Lighting', 5.88, '2023-08-15 10:00:00'),
    (32, 'Classroom', 'HVAC', 5.88, '2023-08-15 10:00:00'),
    (32, 'Hallway', 'Lighting', 2.94, '2023-08-15 10:00:00'),
    (32, 'Gym', 'Food Waste Management', 2.94, '2023-08-15 10:00:00'),
    (32, 'Office', 'HVAC', 5.91, '2023-08-15 10:00:00'),

    -- September 2023 (EnergyUsage ID 32)
    (32, 'Classroom', 'Lighting', 18.75, '2023-09-15 10:00:00'),
    (32, 'Classroom', 'Computers', 15.63, '2023-09-15 10:00:00'),
    (32, 'Classroom', 'HVAC', 12.50, '2023-09-15 10:00:00'),
    (32, 'Library', 'Lighting', 6.25, '2023-09-15 10:00:00'),
    (32, 'Library', 'HVAC', 9.38, '2023-09-15 10:00:00'),
    (32, 'Office', 'Lighting', 9.38, '2023-09-15 10:00:00'),
    (32, 'Gym', 'Equipment', 3.13, '2023-09-15 10:00:00'),
    (32, 'Cafeteria', 'Refrigeration', 6.25, '2023-09-15 10:00:00'),
    (32, 'Cafeteria', 'Appliances', 3.13, '2023-09-15 10:00:00'),
    (32, 'Auditorium', 'Lighting', 6.25, '2023-09-15 10:00:00'),
    (32, 'Laboratory', 'HVAC', 6.25, '2023-09-15 10:00:00'),
    (32, 'Hallway', 'Lighting', 3.10, '2023-09-15 10:00:00'),

    -- October 2023 (EnergyUsage ID 33)
    (33, 'Classroom', 'Lighting', 18.75, '2023-10-15 10:00:00'),
    (33, 'Classroom', 'Computers', 15.63, '2023-10-15 10:00:00'),
    (33, 'Classroom', 'HVAC', 12.50, '2023-10-15 10:00:00'),
    (33, 'Library', 'Lighting', 6.25, '2023-10-15 10:00:00'),
    (33, 'Library', 'HVAC', 9.38, '2023-10-15 10:00:00'),
    (33, 'Office', 'Lighting', 9.38, '2023-10-15 10:00:00'),
    (33, 'Gym', 'Equipment', 3.13, '2023-10-15 10:00:00'),
    (33, 'Cafeteria', 'Refrigeration', 6.25, '2023-10-15 10:00:00'),
    (33, 'Cafeteria', 'Appliances', 3.13, '2023-10-15 10:00:00'),
    (33, 'Auditorium', 'Lighting', 6.25, '2023-10-15 10:00:00'),
    (33, 'Laboratory', 'HVAC', 6.25, '2023-10-15 10:00:00'),
    (33, 'Hallway', 'Lighting', 3.10, '2023-10-15 10:00:00'),

    -- November 2023 (EnergyUsage ID 34)
    (34, 'Classroom', 'Lighting', 18.75, '2023-11-15 10:00:00'),
    (34, 'Classroom', 'Computers', 15.63, '2023-11-15 10:00:00'),
    (34, 'Classroom', 'HVAC', 12.50, '2023-11-15 10:00:00'),
    (34, 'Library', 'Lighting', 6.25, '2023-11-15 10:00:00'),
    (34, 'Library', 'HVAC', 9.38, '2023-11-15 10:00:00'),
    (34, 'Office', 'Lighting', 9.38, '2023-11-15 10:00:00'),
    (34, 'Gym', 'Equipment', 3.13, '2023-11-15 10:00:00'),
    (34, 'Cafeteria', 'Refrigeration', 6.25, '2023-11-15 10:00:00'),
    (34, 'Cafeteria', 'Appliances', 3.13, '2023-11-15 10:00:00'),
    (34, 'Auditorium', 'Lighting', 6.25, '2023-11-15 10:00:00'),
    (34, 'Laboratory', 'HVAC', 6.25, '2023-11-15 10:00:00'),
    (34, 'Hallway', 'Lighting', 3.10, '2023-11-15 10:00:00'),

    -- December 2023 (EnergyUsage ID 35)
    (35, 'Classroom', 'Lighting', 18.75, '2023-12-15 10:00:00'),
    (35, 'Classroom', 'Computers', 15.63, '2023-12-15 10:00:00'),
    (35, 'Classroom', 'HVAC', 12.50, '2023-12-15 10:00:00'),
    (35, 'Library', 'Lighting', 6.25, '2023-12-15 10:00:00'),
    (35, 'Library', 'HVAC', 9.38, '2023-12-15 10:00:00'),
    (35, 'Office', 'Lighting', 9.38, '2023-12-15 10:00:00'),
    (35, 'Gym', 'Equipment', 3.13, '2023-12-15 10:00:00'),
    (35, 'Cafeteria', 'Refrigeration', 6.25, '2023-12-15 10:00:00'),
    (35, 'Cafeteria', 'Appliances', 3.13, '2023-12-15 10:00:00'),
    (35, 'Auditorium', 'Lighting', 6.25, '2023-12-15 10:00:00'),
    (35, 'Laboratory', 'HVAC', 6.25, '2023-12-15 10:00:00'),
    (35, 'Hallway', 'Lighting', 3.10, '2023-12-15 10:00:00'),

-- EnergyUsage for January 2024 (ID 36)
(36, 'Classroom', 'Lighting', 12, '2024-01-15 10:00:00'),
(36, 'Classroom', 'Computers', 25, '2024-01-15 10:00:00'),
(36, 'Classroom', 'HVAC', 30, '2024-01-15 10:00:00'),
(36, 'Library', 'Lighting', 10, '2024-01-15 10:00:00'),
(36, 'Library', 'HVAC', 20, '2024-01-15 10:00:00'),
(36, 'Office', 'Lighting', 15, '2024-01-15 10:00:00'),
(36, 'Gym', 'Equipment', 5, '2024-01-15 10:00:00'),
(36, 'Cafeteria', 'Refrigeration', 8, '2024-01-15 10:00:00'),
(36, 'Cafeteria', 'Appliances', 4, '2024-01-15 10:00:00'),
(36, 'Auditorium', 'Lighting', 6, '2024-01-15 10:00:00'),
(36, 'Laboratory', 'HVAC', 7, '2024-01-15 10:00:00'),
(36, 'Hallway', 'Lighting', 2, '2024-01-15 10:00:00'),

--EnergyUsage for February 2024 (ID 37)
(37, 'Classroom', 'Lighting', 14, '2024-02-15 10:00:00'),
(37, 'Classroom', 'Computers', 23, '2024-02-15 10:00:00'),
(37, 'Classroom', 'HVAC', 28, '2024-02-15 10:00:00'),
(37, 'Library', 'Lighting', 12, '2024-02-15 10:00:00'),
(37, 'Library', 'HVAC', 18, '2024-02-15 10:00:00'),
(37, 'Office', 'Lighting', 16, '2024-02-15 10:00:00'),
(37, 'Gym', 'Equipment', 6, '2024-02-15 10:00:00'),
(37, 'Cafeteria', 'Refrigeration', 9, '2024-02-15 10:00:00'),
(37, 'Cafeteria', 'Appliances', 5, '2024-02-15 10:00:00'),
(37, 'Auditorium', 'Lighting', 7, '2024-02-15 10:00:00'),
(37, 'Laboratory', 'HVAC', 9, '2024-02-15 10:00:00'),
(37, 'Hallway', 'Lighting', 3, '2024-02-15 10:00:00'),

-- EnergyUsage for March 2024 (ID 38)
(38, 'Classroom', 'Lighting', 13, '2024-03-15 10:00:00'),
(38, 'Classroom', 'Computers', 22, '2024-03-15 10:00:00'),
(38, 'Classroom', 'HVAC', 27, '2024-03-15 10:00:00'),
(38, 'Library', 'Lighting', 11, '2024-03-15 10:00:00'),
(38, 'Library', 'HVAC', 17, '2024-03-15 10:00:00'),
(38, 'Office', 'Lighting', 14, '2024-03-15 10:00:00'),
(38, 'Gym', 'Equipment', 7, '2024-03-15 10:00:00'),
(38, 'Cafeteria', 'Refrigeration', 10, '2024-03-15 10:00:00'),
(38, 'Cafeteria', 'Appliances', 6, '2024-03-15 10:00:00'),
(38, 'Auditorium', 'Lighting', 8, '2024-03-15 10:00:00'),
(38, 'Laboratory', 'HVAC', 10, '2024-03-15 10:00:00'),
(38, 'Hallway', 'Lighting', 4, '2024-03-15 10:00:00'),

-- EnergyUsage for April 2024 (ID 39)
(39, 'Classroom', 'Lighting', 16, '2024-04-15 10:00:00'),
(39, 'Classroom', 'Computers', 24, '2024-04-15 10:00:00'),
(39, 'Classroom', 'HVAC', 29, '2024-04-15 10:00:00'),
(39, 'Library', 'Lighting', 13, '2024-04-15 10:00:00'),
(39, 'Library', 'HVAC', 19, '2024-04-15 10:00:00'),
(39, 'Office', 'Lighting', 17, '2024-04-15 10:00:00'),
(39, 'Gym', 'Equipment', 8, '2024-04-15 10:00:00'),
(39, 'Cafeteria', 'Refrigeration', 11, '2024-04-15 10:00:00'),
(39, 'Cafeteria', 'Appliances', 7, '2024-04-15 10:00:00'),
(39, 'Auditorium', 'Lighting', 9, '2024-04-15 10:00:00'),
(39, 'Laboratory', 'HVAC', 11, '2024-04-15 10:00:00'),
(39, 'Hallway', 'Lighting', 5, '2024-04-15 10:00:00'),

-- EnergyUsage for May 2024 (ID 40)
(40, 'Classroom', 'Lighting', 18, '2024-05-15 10:00:00'),
(40, 'Classroom', 'Computers', 26, '2024-05-15 10:00:00'),
(40, 'Classroom', 'HVAC', 31, '2024-05-15 10:00:00'),
(40, 'Library', 'Lighting', 14, '2024-05-15 10:00:00'),
(40, 'Library', 'HVAC', 20, '2024-05-15 10:00:00'),
(40, 'Office', 'Lighting', 19, '2024-05-15 10:00:00'),
(40, 'Gym', 'Equipment', 9, '2024-05-15 10:00:00'),
(40, 'Cafeteria', 'Refrigeration', 12, '2024-05-15 10:00:00'),
(40, 'Cafeteria', 'Appliances', 8, '2024-05-15 10:00:00'),
(40, 'Auditorium', 'Lighting', 10, '2024-05-15 10:00:00'),
(40, 'Laboratory', 'HVAC', 12, '2024-05-15 10:00:00'),
(40, 'Hallway', 'Lighting', 6, '2024-05-15 10:00:00'),

-- EnergyUsage for June 2024 (ID 41)
(41, 'Classroom', 'Lighting', 20, '2024-06-15 10:00:00'),
(41, 'Classroom', 'Computers', 28, '2024-06-15 10:00:00'),
(41, 'Classroom', 'HVAC', 34, '2024-06-15 10:00:00'),
(41, 'Library', 'Lighting', 16, '2024-06-15 10:00:00'),
(41, 'Library', 'HVAC', 22, '2024-06-15 10:00:00'),
(41, 'Office', 'Lighting', 21, '2024-06-15 10:00:00'),
(41, 'Gym', 'Equipment', 10, '2024-06-15 10:00:00'),
(41, 'Cafeteria', 'Refrigeration', 13, '2024-06-15 10:00:00'),
(41, 'Cafeteria', 'Appliances', 9, '2024-06-15 10:00:00'),
(41, 'Auditorium', 'Lighting', 11, '2024-06-15 10:00:00'),
(41, 'Laboratory', 'HVAC', 13, '2024-06-15 10:00:00'),
(41, 'Hallway', 'Lighting', 7, '2024-06-15 10:00:00'),

-- EnergyUsage for July 2024 (ID 42)
(42, 'Classroom', 'Lighting', 17, '2024-07-15 10:00:00'),
(42, 'Classroom', 'Computers', 24, '2024-07-15 10:00:00'),
(42, 'Classroom', 'HVAC', 29, '2024-07-15 10:00:00'),
(42, 'Library', 'Lighting', 15, '2024-07-15 10:00:00'),
(42, 'Library', 'HVAC', 19, '2024-07-15 10:00:00'),
(42, 'Office', 'Lighting', 18, '2024-07-15 10:00:00'),
(42, 'Gym', 'Equipment', 8, '2024-07-15 10:00:00'),
(42, 'Cafeteria', 'Refrigeration', 10, '2024-07-15 10:00:00'),
(42, 'Cafeteria', 'Appliances', 6, '2024-07-15 10:00:00'),
(42, 'Auditorium', 'Lighting', 8, '2024-07-15 10:00:00'),
(42, 'Laboratory', 'HVAC', 11, '2024-07-15 10:00:00'),
(42, 'Hallway', 'Lighting', 5, '2024-07-15 10:00:00'),

-- EnergyUsage for August 2024 (ID 43)
(43, 'Classroom', 'Lighting', 14, '2024-08-15 10:00:00'),
(43, 'Classroom', 'Computers', 22, '2024-08-15 10:00:00'),
(43, 'Classroom', 'HVAC', 25, '2024-08-15 10:00:00'),
(43, 'Library', 'Lighting', 13, '2024-08-15 10:00:00'),
(43, 'Library', 'HVAC', 20, '2024-08-15 10:00:00'),
(43, 'Office', 'Lighting', 16, '2024-08-15 10:00:00'),
(43, 'Gym', 'Equipment', 9, '2024-08-15 10:00:00'),
(43, 'Cafeteria', 'Refrigeration', 11, '2024-08-15 10:00:00'),
(43, 'Cafeteria', 'Appliances', 7, '2024-08-15 10:00:00'),
(43, 'Auditorium', 'Lighting', 9, '2024-08-15 10:00:00'),
(43, 'Laboratory', 'HVAC', 12, '2024-08-15 10:00:00'),
(43, 'Hallway', 'Lighting', 6, '2024-08-15 10:00:00'),

-- EnergyUsage for September 2024 (ID 44)
(44, 'Gym', 'Lighting', 11.43, '2024-09-15 10:00:00'),
(44, 'Gym', 'HVAC', 20.00, '2024-09-15 10:00:00'),
(44, 'Cafeteria', 'Appliances', 17.14, '2024-09-15 10:00:00'),
(44, 'Cafeteria', 'HVAC', 5.71, '2024-09-15 10:00:00'),
(44, 'Cafeteria', 'Food Waste Management', 2.86, '2024-09-15 10:00:00'),
(44, 'Library', 'Lighting', 8.57, '2024-09-15 10:00:00'),
(44, 'Classroom', 'Computers', 11.43, '2024-09-15 10:00:00'),
(44, 'Classroom', 'HVAC', 5.71, '2024-09-15 10:00:00'),
(44, 'Office', 'Lighting', 5.71, '2024-09-15 10:00:00'),
(44, 'Laboratory', 'Computers', 5.72, '2024-09-15 10:00:00'),
(44, 'Staff Room', 'HVAC', 2.86, '2024-09-15 10:00:00'),
(44, 'Hallway', 'Lighting', 2.86, '2024-09-15 10:00:00'),

-- EnergyUsage for October 2024 (ID 45)
(45, 'Laboratory', 'Lighting', 16.67, '2024-10-15 10:00:00'),
(45, 'Laboratory', 'HVAC', 20.00, '2024-10-15 10:00:00'),
(45, 'Laboratory', 'Computers', 13.33, '2024-10-15 10:00:00'),
(45, 'Office', 'Lighting', 10.00, '2024-10-15 10:00:00'),
(45, 'Office', 'HVAC', 6.67, '2024-10-15 10:00:00'),
(45, 'Cafeteria', 'Lighting', 3.33, '2024-10-15 10:00:00'),
(45, 'Gym', 'Equipment', 6.67, '2024-10-15 10:00:00'),
(45, 'Auditorium', 'Lighting', 6.67, '2024-10-15 10:00:00'),
(45, 'Laboratory', 'Food Waste Management', 3.33, '2024-10-15 10:00:00'),
(45, 'Classroom', 'HVAC', 3.33, '2024-10-15 10:00:00'),
(45, 'Library', 'Computers', 6.67, '2024-10-15 10:00:00'),
(45, 'Hallway', 'Lighting', 3.33, '2024-10-15 10:00:00'),

-- EnergyUsage for November 2024 (ID 46)
(46, 'Classroom', 'Lighting', 20, '2024-11-15 10:00:00'),
(46, 'Classroom', 'Computers', 25, '2024-11-15 10:00:00'),
(46, 'Classroom', 'HVAC', 28, '2024-11-15 10:00:00'),
(46, 'Library', 'Lighting', 12, '2024-11-15 10:00:00'),
(46, 'Library', 'HVAC', 18, '2024-11-15 10:00:00'),
(46, 'Office', 'Lighting', 15, '2024-11-15 10:00:00'),
(46, 'Gym', 'Equipment', 7, '2024-11-15 10:00:00'),
(46, 'Cafeteria', 'Refrigeration', 9, '2024-11-15 10:00:00'),
(46, 'Cafeteria', 'Appliances', 5, '2024-11-15 10:00:00'),
(46, 'Auditorium', 'Lighting', 7, '2024-11-15 10:00:00'),
(46, 'Laboratory', 'HVAC', 8, '2024-11-15 10:00:00'),
(46, 'Hallway', 'Lighting', 3, '2024-11-15 10:00:00'),

-- EnergyUsage for December 2024 (ID 47)
(47, 'Classroom', 'Lighting', 22, '2024-12-15 10:00:00'),
(47, 'Classroom', 'Computers', 27, '2024-12-15 10:00:00'),
(47, 'Classroom', 'HVAC', 35, '2024-12-15 10:00:00'),
(47, 'Library', 'Lighting', 14, '2024-12-15 10:00:00'),
(47, 'Library', 'HVAC', 20, '2024-12-15 10:00:00'),
(47, 'Office', 'Lighting', 17, '2024-12-15 10:00:00'),
(47, 'Gym', 'Equipment', 9, '2024-12-15 10:00:00'),
(47, 'Cafeteria', 'Refrigeration', 10, '2024-12-15 10:00:00'),
(47, 'Cafeteria', 'Appliances', 6, '2024-12-15 10:00:00'),
(47, 'Auditorium', 'Lighting', 8, '2024-12-15 10:00:00'),
(47, 'Laboratory', 'HVAC', 10, '2024-12-15 10:00:00'),
(47, 'Hallway', 'Lighting', 4, '2024-12-15 10:00:00');

    INSERT INTO EnergyBreakdown (energyusage_id, location, category, percentage, timestamp)
  VALUES

    (47, 'Classroom', 'Lighting', 37.50, '2021-01-15 10:00:00'),
(47, 'Library', 'HVAC', 18.75, '2021-01-15 10:00:00'),
(47, 'Office', 'Lighting', 18.75, '2021-01-15 10:00:00'),
(47, 'Cafeteria', 'Refrigeration', 12.50, '2021-01-15 10:00:00'),
(47, 'Auditorium', 'Lighting', 12.50, '2021-01-15 10:00:00'),

(48, 'Gym', 'Lighting', 28.57, '2021-02-15 10:00:00'),
(48, 'Library', 'Lighting', 21.43, '2021-02-15 10:00:00'),
(48, 'Classroom', 'Computers', 28.57, '2021-02-15 10:00:00'),
(48, 'Classroom', 'HVAC', 14.29, '2021-02-15 10:00:00'),
(48, 'Hallway', 'Lighting', 7.14, '2021-02-15 10:00:00'),

(49, 'Laboratory', 'Lighting', 41.67, '2021-03-15 10:00:00'),
(49, 'Office', 'Lighting', 25.00, '2021-03-15 10:00:00'),
(49, 'Cafeteria', 'Lighting', 8.33, '2021-03-15 10:00:00'),
(49, 'Auditorium', 'Lighting', 16.67, '2021-03-15 10:00:00'),
(49, 'Classroom', 'HVAC', 8.33, '2021-03-15 10:00:00'),

(50, 'Hallway', 'Lighting', 23.08, '2021-04-15 10:00:00'),
(50, 'Cafeteria', 'Refrigeration', 23.08, '2021-04-15 10:00:00'),
(50, 'Library', 'Lighting', 23.08, '2021-04-15 10:00:00'),
(50, 'Auditorium', 'Lighting', 15.38, '2021-04-15 10:00:00'),
(50, 'Classroom', 'HVAC', 15.38, '2021-04-15 10:00:00'),

(51, 'Classroom', 'Lighting', 30.00, '2021-05-15 10:00:00'),
(51, 'Library', 'Computers', 30.00, '2021-05-15 10:00:00'),
(51, 'Office', 'Lighting', 15.00, '2021-05-15 10:00:00'),
(51, 'Auditorium', 'HVAC', 15.00, '2021-05-15 10:00:00'),
(51, 'Hallway', 'Lighting', 10.00, '2021-05-15 10:00:00'),

(52, 'Classroom', 'Lighting', 37.50, '2021-06-15 10:00:00'),
(52, 'Gym', 'HVAC', 18.75, '2021-06-15 10:00:00'),
(52, 'Library', 'HVAC', 18.75, '2021-06-15 10:00:00'),
(52, 'Cafeteria', 'Refrigeration', 18.75, '2021-06-15 10:00:00'),
(52, 'Hallway', 'Lighting', 6.25, '2021-06-15 10:00:00'),

(53, 'Classroom', 'Lighting', 42.86, '2021-07-15 10:00:00'),
(53, 'Library', 'HVAC', 21.43, '2021-07-15 10:00:00'),
(53, 'Cafeteria', 'Lighting', 14.29, '2021-07-15 10:00:00'),
(53, 'Auditorium', 'Lighting', 14.29, '2021-07-15 10:00:00'),
(53, 'Hallway', 'Lighting', 7.13, '2021-07-15 10:00:00'),

(54, 'Classroom', 'Lighting', 42.86, '2021-08-15 10:00:00'),
(54, 'Library', 'HVAC', 21.43, '2021-08-15 10:00:00'),
(54, 'Auditorium', 'Lighting', 14.29, '2021-08-15 10:00:00'),
(54, 'Cafeteria', 'Refrigeration', 14.29, '2021-08-15 10:00:00'),
(54, 'Hallway', 'Lighting', 7.13, '2021-08-15 10:00:00'),

(55, 'Classroom', 'Lighting', 40.00, '2021-09-15 10:00:00'),
(55, 'Library', 'HVAC', 20.00, '2021-09-15 10:00:00'),
(55, 'Office', 'Lighting', 20.00, '2021-09-15 10:00:00'),
(55, 'Auditorium', 'Lighting', 13.33, '2021-09-15 10:00:00'),
(55, 'Cafeteria', 'Appliances', 6.67, '2021-09-15 10:00:00'),

(56, 'Classroom', 'Lighting', 40.00, '2021-10-15 10:00:00'),
(56, 'Library', 'HVAC', 20.00, '2021-10-15 10:00:00'),
(56, 'Office', 'Lighting', 20.00, '2021-10-15 10:00:00'),
(56, 'Auditorium', 'Lighting', 13.33, '2021-10-15 10:00:00'),
(56, 'Hallway', 'Lighting', 6.67, '2021-10-15 10:00:00'),

(57, 'Classroom', 'Lighting', 40.00, '2021-11-15 10:00:00'),
(57, 'Library', 'HVAC', 20.00, '2021-11-15 10:00:00'),
(57, 'Office', 'Lighting', 20.00, '2021-11-15 10:00:00'),
(57, 'Auditorium', 'Lighting', 13.33, '2021-11-15 10:00:00'),
(57, 'Hallway', 'Lighting', 6.67, '2021-11-15 10:00:00'),

(58, 'Classroom', 'Lighting', 40.00, '2021-12-15 10:00:00'),
(58, 'Library', 'HVAC', 20.00, '2021-12-15 10:00:00'),
(58, 'Office', 'Lighting', 20.00, '2021-12-15 10:00:00'),
(58, 'Auditorium', 'Lighting', 13.33, '2021-12-15 10:00:00'),
(58, 'Hallway', 'Lighting', 6.67, '2021-12-15 10:00:00'),

   (59, 'Classroom', 'Lighting', 37.50, '2022-01-15 10:00:00'),
(59, 'Library', 'HVAC', 18.75, '2022-01-15 10:00:00'),
(59, 'Office', 'Lighting', 18.75, '2022-01-15 10:00:00'),
(59, 'Cafeteria', 'Refrigeration', 12.50, '2022-01-15 10:00:00'),
(59, 'Auditorium', 'Lighting', 12.50, '2022-01-15 10:00:00'),

(60, 'Gym', 'Lighting', 28.57, '2022-02-15 10:00:00'),
(60, 'Cafeteria', 'HVAC', 14.29, '2022-02-15 10:00:00'),
(60, 'Library', 'Lighting', 21.43, '2022-02-15 10:00:00'),
(60, 'Classroom', 'Computers', 28.57, '2022-02-15 10:00:00'),
(60, 'Hallway', 'Lighting', 7.14, '2022-02-15 10:00:00'),

(61, 'Laboratory', 'Lighting', 41.67, '2022-03-15 10:00:00'),
(61, 'Office', 'Lighting', 25.00, '2022-03-15 10:00:00'),
(61, 'Cafeteria', 'Lighting', 8.33, '2022-03-15 10:00:00'),
(61, 'Gym', 'Equipment', 16.67, '2022-03-15 10:00:00'),
(61, 'Hallway', 'Lighting', 8.33, '2022-03-15 10:00:00'),

(62, 'Hallway', 'Lighting', 25.00, '2022-04-15 10:00:00'),
(62, 'Cafeteria', 'Refrigeration', 25.00, '2022-04-15 10:00:00'),
(62, 'Library', 'Lighting', 25.00, '2022-04-15 10:00:00'),
(62, 'Auditorium', 'Lighting', 16.67, '2022-04-15 10:00:00'),
(62, 'Staff Room', 'Lighting', 8.33, '2022-04-15 10:00:00'),

(63, 'Classroom', 'Lighting', 38.10, '2022-05-15 10:00:00'),
(63, 'Library', 'Computers', 28.57, '2022-05-15 10:00:00'),
(63, 'Library', 'HVAC', 14.29, '2022-05-15 10:00:00'),
(63, 'Office', 'Lighting', 9.52, '2022-05-15 10:00:00'),
(63, 'Hallway', 'Lighting', 9.52, '2022-05-15 10:00:00'),

(64, 'Office', 'Lighting', 33.33, '2022-06-15 10:00:00'),
(64, 'Gym', 'HVAC', 20.00, '2022-06-15 10:00:00'),
(64, 'Library', 'HVAC', 20.00, '2022-06-15 10:00:00'),
(64, 'Cafeteria', 'Refrigeration', 20.00, '2022-06-15 10:00:00'),
(64, 'Hallway', 'Lighting', 6.67, '2022-06-15 10:00:00'),

(65, 'Classroom', 'Lighting', 31.58, '2022-07-15 10:00:00'),
(65, 'Classroom', 'HVAC', 26.32, '2022-07-15 10:00:00'),
(65, 'Auditorium', 'Lighting', 26.32, '2022-07-15 10:00:00'),
(65, 'Library', 'Computers', 10.52, '2022-07-15 10:00:00'),
(65, 'Hallway', 'Lighting', 5.26, '2022-07-15 10:00:00'),

(66, 'Cafeteria', 'Lighting', 28.57, '2022-08-15 10:00:00'),
(66, 'Laboratory', 'Appliances', 28.57, '2022-08-15 10:00:00'),
(66, 'Library', 'HVAC', 21.43, '2022-08-15 10:00:00'),
(66, 'Auditorium', 'Lighting', 14.29, '2022-08-15 10:00:00'),
(66, 'Hallway', 'Lighting', 7.14, '2022-08-15 10:00:00'),

(67, 'Classroom', 'Lighting', 38.46, '2022-09-15 10:00:00'),
(67, 'Library', 'HVAC', 23.08, '2022-09-15 10:00:00'),
(67, 'Office', 'Lighting', 15.38, '2022-09-15 10:00:00'),
(67, 'Cafeteria', 'Appliances', 7.69, '2022-09-15 10:00:00'),
(67, 'Classroom', 'HVAC', 15.39, '2022-09-15 10:00:00'),

(68, 'Classroom', 'Lighting', 40.00, '2022-10-15 10:00:00'),
(68, 'Library', 'HVAC', 20.00, '2022-10-15 10:00:00'),
(68, 'Office', 'Lighting', 20.00, '2022-10-15 10:00:00'),
(68, 'Auditorium', 'Lighting', 13.33, '2022-10-15 10:00:00'),
(68, 'Hallway', 'Lighting', 6.67, '2022-10-15 10:00:00'),

(69, 'Hallway', 'Lighting', 25.00, '2022-11-15 10:00:00'),
(69, 'Cafeteria', 'Food Waste Management', 16.67, '2022-11-15 10:00:00'),
(69, 'Library', 'Lighting', 25.00, '2022-11-15 10:00:00'),
(69, 'Auditorium', 'Lighting', 16.67, '2022-11-15 10:00:00'),
(69, 'Classroom', 'HVAC', 16.66, '2022-11-15 10:00:00'),

(70, 'Classroom', 'Lighting', 40.00, '2022-10-15 10:00:00'),
(70, 'Library', 'HVAC', 20.00, '2022-10-15 10:00:00'),
(70, 'Office', 'Lighting', 20.00, '2022-10-15 10:00:00'),
(70, 'Auditorium', 'Lighting', 13.33, '2022-10-15 10:00:00'),
(70, 'Hallway', 'Lighting', 6.67, '2022-10-15 10:00:00'),

    (71, 'Classroom', 'Lighting', 37.5, '2023-01-15 10:00:00'),
(71, 'Library', 'HVAC', 18.75, '2023-01-15 10:00:00'),
(71, 'Office', 'Lighting', 18.75, '2023-01-15 10:00:00'),
(71, 'Cafeteria', 'Refrigeration', 12.5, '2023-01-15 10:00:00'),
(71, 'Auditorium', 'Lighting', 12.5, '2023-01-15 10:00:00'),

(72, 'Gym', 'Lighting', 33.33, '2023-02-15 10:00:00'),
(72, 'Cafeteria', 'HVAC', 16.67, '2023-02-15 10:00:00'),
(72, 'Library', 'Lighting', 25, '2023-02-15 10:00:00'),
(72, 'Classroom', 'HVAC', 16.67, '2023-02-15 10:00:00'),
(72, 'Hallway', 'Lighting', 8.33, '2023-02-15 10:00:00'),

(73, 'Laboratory', 'Lighting', 41.67, '2023-03-15 10:00:00'),
(73, 'Office', 'Lighting', 25, '2023-03-15 10:00:00'),
(73, 'Cafeteria', 'Lighting', 8.33, '2023-03-15 10:00:00'),
(73, 'Gym', 'Equipment', 16.67, '2023-03-15 10:00:00'),
(73, 'Classroom', 'HVAC', 8.33, '2023-03-15 10:00:00'),

(74, 'Hallway', 'Lighting', 25, '2023-04-15 10:00:00'),
(74, 'Cafeteria', 'Refrigeration', 25, '2023-04-15 10:00:00'),
(74, 'Library', 'Lighting', 25, '2023-04-15 10:00:00'),
(74, 'Auditorium', 'Lighting', 16.67, '2023-04-15 10:00:00'),
(74, 'Staff Room', 'Lighting', 8.33, '2023-04-15 10:00:00'),

(75, 'Classroom', 'Lighting', 42.11, '2023-05-15 10:00:00'),
(75, 'Library', 'Computers', 31.58, '2023-05-15 10:00:00'),
(75, 'Office', 'Lighting', 10.53, '2023-05-15 10:00:00'),
(75, 'Hallway', 'Lighting', 10.53, '2023-05-15 10:00:00'),
(75, 'Staff Room', 'Lighting', 5.25, '2023-05-15 10:00:00'),

(76, 'Office', 'Lighting', 33.33, '2023-06-15 10:00:00'),
(76, 'Gym', 'HVAC', 20, '2023-06-15 10:00:00'),
(76, 'Library', 'HVAC', 20, '2023-06-15 10:00:00'),
(76, 'Cafeteria', 'Refrigeration', 20, '2023-06-15 10:00:00'),
(76, 'Hallway', 'Lighting', 6.67, '2023-06-15 10:00:00'),

(77, 'Classroom', 'Lighting', 37.5, '2023-07-15 10:00:00'),
(77, 'Auditorium', 'Lighting', 31.25, '2023-07-15 10:00:00'),
(77, 'Library', 'Computers', 12.5, '2023-07-15 10:00:00'),
(77, 'Staff Room', 'HVAC', 12.5, '2023-07-15 10:00:00'),
(77, 'Hallway', 'Lighting', 6.25, '2023-07-15 10:00:00'),

(78, 'Cafeteria', 'Lighting', 28.57, '2023-08-15 10:00:00'),
(78, 'Laboratory', 'Appliances', 28.57, '2023-08-15 10:00:00'),
(78, 'Library', 'HVAC', 21.43, '2023-08-15 10:00:00'),
(78, 'Auditorium', 'Lighting', 14.29, '2023-08-15 10:00:00'),
(78, 'Hallway', 'Lighting', 7.14, '2023-08-15 10:00:00'),

(79, 'Classroom', 'Lighting', 42.86, '2023-09-15 10:00:00'),
(79, 'Library', 'HVAC', 21.43, '2023-09-15 10:00:00'),
(79, 'Cafeteria', 'Appliances', 7.14, '2023-09-15 10:00:00'),
(79, 'Auditorium', 'HVAC', 21.43, '2023-09-15 10:00:00'),
(79, 'Staff Room', 'Lighting', 7.14, '2023-09-15 10:00:00'),

(80, 'Hallway', 'Lighting', 27.27, '2023-10-15 10:00:00'),
(80, 'Cafeteria', 'Food Waste Management', 18.18, '2023-10-15 10:00:00'),
(80, 'Library', 'Lighting', 27.27, '2023-10-15 10:00:00'),
(80, 'Gym', 'HVAC', 18.18, '2023-10-15 10:00:00'),
(80, 'Hallway', 'Lighting', 9.1, '2023-10-15 10:00:00'),

(81, 'Classroom', 'Lighting', 40, '2023-11-15 10:00:00'),
(81, 'Library', 'HVAC', 20, '2023-11-15 10:00:00'),
(81, 'Office', 'Lighting', 20, '2023-11-15 10:00:00'),
(81, 'Gym', 'Equipment', 6.67, '2023-11-15 10:00:00'),
(81, 'Auditorium', 'Lighting', 13.33, '2023-11-15 10:00:00'),

(82, 'Cafeteria', 'Lighting', 30.77, '2023-12-15 10:00:00'),
(82, 'Library', 'HVAC', 23.08, '2023-12-15 10:00:00'),
(82, 'Office', 'Lighting', 23.08, '2023-12-15 10:00:00'),
(82, 'Cafeteria', 'Refrigeration', 15.38, '2023-12-15 10:00:00'),
(82, 'Hallway', 'Lighting', 7.69, '2023-12-15 10:00:00'),

    (83, 'Classroom', 'Lighting', 35.29, '2024-01-15 10:00:00'),
(83, 'Library', 'HVAC', 17.65, '2024-01-15 10:00:00'),
(83, 'Office', 'Lighting', 17.65, '2024-01-15 10:00:00'),
(83, 'Cafeteria', 'Refrigeration', 11.76, '2024-01-15 10:00:00'),
(83, 'Auditorium', 'Lighting', 11.76, '2024-01-15 10:00:00'),
(83, 'Hallway', 'Lighting', 5.89, '2024-01-15 10:00:00'),

(84, 'Gym', 'Lighting', 30.77, '2024-02-15 10:00:00'),
(84, 'Cafeteria', 'HVAC', 15.38, '2024-02-15 10:00:00'),
(84, 'Library', 'Lighting', 23.08, '2024-02-15 10:00:00'),
(84, 'Classroom', 'HVAC', 15.38, '2024-02-15 10:00:00'),
(84, 'Staff Room', 'HVAC', 7.69, '2024-02-15 10:00:00'),
(84, 'Hallway', 'Lighting', 7.7, '2024-02-15 10:00:00'),

(85, 'Laboratory', 'Lighting', 35.71, '2024-03-15 10:00:00'),
(85, 'Office', 'Lighting', 21.43, '2024-03-15 10:00:00'),
(85, 'Cafeteria', 'Lighting', 7.14, '2024-03-15 10:00:00'),
(85, 'Gym', 'Equipment', 14.29, '2024-03-15 10:00:00'),
(85, 'Classroom', 'HVAC', 7.14, '2024-03-15 10:00:00'),
(85, 'Library', 'Computers', 14.29, '2024-03-15 10:00:00'),

(86, 'Hallway', 'Lighting', 21.43, '2024-04-15 10:00:00'),
(86, 'Cafeteria', 'Refrigeration', 21.43, '2024-04-15 10:00:00'),
(86, 'Library', 'Lighting', 21.43, '2024-04-15 10:00:00'),
(86, 'Auditorium', 'Lighting', 14.29, '2024-04-15 10:00:00'),
(86, 'Classroom', 'HVAC', 14.29, '2024-04-15 10:00:00'),
(86, 'Staff Room', 'Lighting', 7.13, '2024-04-15 10:00:00'),

(87, 'Library', 'Computers', 42.86, '2024-05-15 10:00:00'),
(87, 'Office', 'Lighting', 14.29, '2024-05-15 10:00:00'),
(87, 'Hallway', 'Lighting', 14.29, '2024-05-15 10:00:00'),
(87, 'Cafeteria', 'Food Waste Management', 7.14, '2024-05-15 10:00:00'),
(87, 'Classroom', 'HVAC', 14.29, '2024-05-15 10:00:00'),
(87, 'Staff Room', 'Lighting', 7.13, '2024-05-15 10:00:00'),

(88, 'Office', 'Lighting', 29.41, '2024-06-15 10:00:00'),
(88, 'Gym', 'HVAC', 17.65, '2024-06-15 10:00:00'),
(88, 'Library', 'HVAC', 17.65, '2024-06-15 10:00:00'),
(88, 'Cafeteria', 'Refrigeration', 17.65, '2024-06-15 10:00:00'),
(88, 'Cafeteria', 'Food Waste Management', 11.76, '2024-06-15 10:00:00'),
(88, 'Hallway', 'Lighting', 5.88, '2024-06-15 10:00:00'),

(89, 'Classroom', 'Lighting', 31.58, '2024-07-15 10:00:00'),
(89, 'Auditorium', 'Lighting', 26.32, '2024-07-15 10:00:00'),
(89, 'Library', 'Computers', 10.53, '2024-07-15 10:00:00'),
(89, 'Laboratory', 'HVAC', 15.79, '2024-07-15 10:00:00'),
(89, 'Cafeteria', 'Appliances', 10.53, '2024-07-15 10:00:00'),
(89, 'Hallway', 'Lighting', 5.25, '2024-07-15 10:00:00'),

(90, 'Cafeteria', 'Lighting', 26.67, '2024-08-15 10:00:00'),
(90, 'Laboratory', 'Appliances', 26.67, '2024-08-15 10:00:00'),
(90, 'Library', 'HVAC', 20, '2024-08-15 10:00:00'),
(90, 'Cafeteria', 'Refrigeration', 20, '2024-08-15 10:00:00'),
(90, 'Hallway', 'Lighting', 6.66, '2024-08-15 10:00:00'),

(91, 'Classroom', 'Lighting', 42.86, '2024-09-15 10:00:00'),
(91, 'Library', 'HVAC', 21.43, '2024-09-15 10:00:00'),
(91, 'Cafeteria', 'Appliances', 7.14, '2024-09-15 10:00:00'),
(91, 'Auditorium', 'Lighting', 14.29, '2024-09-15 10:00:00'),
(91, 'Laboratory', 'HVAC', 14.28, '2024-09-15 10:00:00'),

(92, 'Gym', 'Lighting', 37.5, '2024-10-15 10:00:00'),
(92, 'Library', 'Lighting', 18.75, '2024-10-15 10:00:00'),
(92, 'Classroom', 'Computers', 25, '2024-10-15 10:00:00'),
(92, 'Classroom', 'HVAC', 12.5, '2024-10-15 10:00:00'),
(92, 'Hallway', 'Lighting', 6.25, '2024-10-15 10:00:00'),

(93, 'Laboratory', 'Lighting', 50, '2024-11-15 10:00:00'),
(93, 'Office', 'HVAC', 16.67, '2024-11-15 10:00:00'),
(93, 'Cafeteria', 'Lighting', 8.33, '2024-11-15 10:00:00'),
(93, 'Gym', 'Equipment', 16.67, '2024-11-15 10:00:00'),
(93, 'Classroom', 'HVAC', 8.33, '2024-11-15 10:00:00'),

(94, 'Classroom', 'Lighting', 40, '2024-12-15 10:00:00'),
(94, 'Library', 'HVAC', 20, '2024-12-15 10:00:00'),
(94, 'Office', 'Lighting', 20, '2024-12-15 10:00:00'),
(94, 'Cafeteria', 'Refrigeration', 13.33, '2024-12-15 10:00:00'),
(94, 'Hallway', 'Lighting', 6.67, '2024-12-15 10:00:00');


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

    -- School 3 Data for 2024
    (3, 0.9, '2024-01-31 12:00:00'),
    (3, 1.2, '2024-02-28 12:00:00'),
    (3, 1.0, '2024-03-31 12:00:00'),
    (3, 0.8, '2024-04-30 12:00:00'),
    (3, 0.7, '2024-05-31 12:00:00'),
    (3, 0.9, '2024-06-30 12:00:00'),
    (3, 0.9, '2024-07-31 12:00:00'),
    (3, 0.8, '2024-08-31 12:00:00'),
    (3, 1.1, '2024-09-30 12:00:00'),
    (3, 0.9, '2024-10-31 12:00:00'),
    (3, 1.0, '2024-11-30 12:00:00'),
    (3, 0.8, '2024-12-31 12:00:00'),

    -- School 4 Data for 2024
    (4, 0.9, '2024-01-31 12:00:00'),
    (4, 0.7, '2024-02-28 12:00:00'),
    (4, 1.1, '2024-03-31 12:00:00'),
    (4, 0.9, '2024-04-30 12:00:00'),
    (4, 0.7, '2024-05-31 12:00:00'),
    (4, 0.8, '2024-06-30 12:00:00'),
    (4, 0.9, '2024-07-31 12:00:00'),
    (4, 1.0, '2024-08-31 12:00:00'),
    (4, 0.7, '2024-09-30 12:00:00'),
    (4, 0.8, '2024-10-31 12:00:00'),
    (4, 1.2, '2024-11-30 12:00:00'),
    (4, 1.0, '2024-12-31 12:00:00'),

    -- School 5 Data for 2024
    (5, 0.8, '2024-01-31 12:00:00'),
    (5, 0.7, '2024-02-28 12:00:00'),
    (5, 0.7, '2024-03-31 12:00:00'),
    (5, 1.0, '2024-04-30 12:00:00'),
    (5, 0.8, '2024-05-31 12:00:00'),
    (5, 0.9, '2024-06-30 12:00:00'),
    (5, 0.7, '2024-07-31 12:00:00'),
    (5, 0.9, '2024-08-31 12:00:00'),
    (5, 1.0, '2024-09-30 12:00:00'),
    (5, 0.8, '2024-10-31 12:00:00'),
    (5, 0.7, '2024-11-30 12:00:00'),
    (5, 1.1, '2024-12-31 12:00:00'),

    -- School 6 Data for 2024
    (6, 0.8, '2024-01-31 12:00:00'),
    (6, 0.9, '2024-02-29 12:00:00'),
    (6, 0.8, '2024-03-31 12:00:00'),
    (6, 1.0, '2024-04-30 12:00:00'),
    (6, 0.9, '2024-05-31 12:00:00'),
    (6, 1.1, '2024-06-30 12:00:00'),
    (6, 0.7, '2024-07-31 12:00:00'),
    (6, 0.9, '2024-08-31 12:00:00'),
    (6, 1.1, '2024-09-30 12:00:00'),
    (6, 0.8, '2024-10-31 12:00:00'),
    (6, 0.7, '2024-11-30 12:00:00'),
    (6, 1.0, '2024-12-31 12:00:00'),

    -- School 7 Data for 2024
    (7, 0.7, '2024-01-31 12:00:00'),
    (7, 0.8, '2024-02-29 12:00:00'),
    (7, 0.9, '2024-03-31 12:00:00'),
    (7, 0.9, '2024-04-30 12:00:00'),
    (7, 0.8, '2024-05-31 12:00:00'),
    (7, 1.0, '2024-06-30 12:00:00'),
    (7, 0.7, '2024-07-31 12:00:00'),
    (7, 0.9, '2024-08-31 12:00:00'),
    (7, 1.1, '2024-09-30 12:00:00'),
    (7, 0.9, '2024-10-31 12:00:00'),
    (7, 1.0, '2024-11-30 12:00:00'),
    (7, 1.2, '2024-12-31 12:00:00'),

    -- School 8 Data for 2024
    (8, 0.8, '2024-01-31 12:00:00'),
    (8, 0.9, '2024-02-29 12:00:00'),
    (8, 0.9, '2024-03-31 12:00:00'),
    (8, 1.0, '2024-04-30 12:00:00'),
    (8, 0.9, '2024-05-31 12:00:00'),
    (8, 1.1, '2024-06-30 12:00:00'),
    (8, 0.8, '2024-07-31 12:00:00'),
    (8, 1.0, '2024-08-31 12:00:00'),
    (8, 1.2, '2024-09-30 12:00:00'),
    (8, 0.9, '2024-10-31 12:00:00'),
    (8, 0.9, '2024-11-30 12:00:00'),
    (8, 1.0, '2024-12-31 12:00:00'),

    -- School 9 Data for 2024
    (9, 0.8, '2024-01-31 12:00:00'),
    (9, 0.7, '2024-02-29 12:00:00'),
    (9, 0.9, '2024-03-31 12:00:00'),
    (9, 1.0, '2024-04-30 12:00:00'),
    (9, 0.9, '2024-05-31 12:00:00'),
    (9, 1.1, '2024-06-30 12:00:00'),
    (9, 0.8, '2024-07-31 12:00:00'),
    (9, 1.0, '2024-08-31 12:00:00'),
    (9, 1.1, '2024-09-30 12:00:00'),
    (9, 0.9, '2024-10-31 12:00:00'),
    (9, 1.1, '2024-11-30 12:00:00'),
    (9, 1.0, '2024-12-31 12:00:00'),

    -- School 10 Data for 2024
    (10, 0.8, '2024-01-31 12:00:00'),
    (10, 0.7, '2024-02-29 12:00:00'),
    (10, 0.9, '2024-03-31 12:00:00'),
    (10, 1.0, '2024-04-30 12:00:00'),
    (10, 0.9, '2024-05-31 12:00:00'),
    (10, 1.1, '2024-06-30 12:00:00'),
    (10, 0.8, '2024-07-31 12:00:00'),
    (10, 1.0, '2024-08-31 12:00:00'),
    (10, 1.1, '2024-09-30 12:00:00'),
    (10, 0.9, '2024-10-31 12:00:00'),
    (10, 0.8, '2024-11-30 12:00:00'),
    (10, 0.9, '2024-12-31 12:00:00'),

    -- Previous years for School 1 (2023)
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

    -- Previous years for School 2 (2023)
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

    -- Previous years for School 3 (2023)
    (3, 0.7, '2023-01-31 12:00:00'),
    (3, 1.1, '2023-02-28 12:00:00'),
    (3, 1.3, '2023-03-31 12:00:00'),
    (3, 1.4, '2023-04-30 12:00:00'),
    (3, 1.2, '2023-05-31 12:00:00'),
    (3, 1.0, '2023-06-30 12:00:00'),
    (3, 0.9, '2023-07-31 12:00:00'),
    (3, 1.1, '2023-08-31 12:00:00'),
    (3, 0.8, '2023-09-30 12:00:00'),
    (3, 1.0, '2023-10-31 12:00:00'),
    (3, 1.3, '2023-11-30 12:00:00'),
    (3, 1.2, '2023-12-31 12:00:00'),

    -- Previous years for School 4 (2023)
    (4, 0.9, '2023-01-31 12:00:00'),
    (4, 1.1, '2023-02-28 12:00:00'),
    (4, 1.0, '2023-03-31 12:00:00'),
    (4, 0.7, '2023-04-30 12:00:00'),
    (4, 0.9, '2023-05-31 12:00:00'),
    (4, 1.2, '2023-06-30 12:00:00'),
    (4, 0.8, '2023-07-31 12:00:00'),
    (4, 0.7, '2023-08-31 12:00:00'),
    (4, 0.9, '2023-09-30 12:00:00'),
    (4, 1.0, '2023-10-31 12:00:00'),
    (4, 0.6, '2023-11-30 12:00:00'),
    (4, 0.8, '2023-12-31 12:00:00'),

    -- Previous years for School 5 (2023)
    (5, 1.1, '2023-01-31 12:00:00'),
    (5, 1.0, '2023-02-28 12:00:00'),
    (5, 0.7, '2023-03-31 12:00:00'),
    (5, 0.9, '2023-04-30 12:00:00'),
    (5, 1.0, '2023-05-31 12:00:00'),
    (5, 1.2, '2023-06-30 12:00:00'),
    (5, 0.8, '2023-07-31 12:00:00'),
    (5, 0.9, '2023-08-31 12:00:00'),
    (5, 1.1, '2023-09-30 12:00:00'),
    (5, 1.0, '2023-10-31 12:00:00'),
    (5, 0.8, '2023-11-30 12:00:00'),
    (5, 1.0, '2023-12-31 12:00:00'),

    -- Previous years for School 6 (2023)
    (6, 0.8, '2023-01-31 12:00:00'),
    (6, 0.7, '2023-02-28 12:00:00'),
    (6, 0.7, '2023-03-31 12:00:00'),
    (6, 0.9, '2023-04-30 12:00:00'),
    (6, 0.8, '2023-05-31 12:00:00'),
    (6, 0.9, '2023-06-30 12:00:00'),
    (6, 1.2, '2023-07-31 12:00:00'),
    (6, 1.0, '2023-08-31 12:00:00'),
    (6, 0.9, '2023-09-30 12:00:00'),
    (6, 0.8, '2023-10-31 12:00:00'),
    (6, 0.7, '2023-11-30 12:00:00'),
    (6, 1.0, '2023-12-31 12:00:00'),

    -- School 7 Data for 2023
    (7, 0.7, '2023-01-31 12:00:00'),
    (7, 0.8, '2023-02-28 12:00:00'),
    (7, 1.0, '2023-03-31 12:00:00'),
    (7, 0.9, '2023-04-30 12:00:00'),
    (7, 0.8, '2023-05-31 12:00:00'),
    (7, 1.0, '2023-06-30 12:00:00'),
    (7, 0.7, '2023-07-31 12:00:00'),
    (7, 0.9, '2023-08-31 12:00:00'),
    (7, 1.0, '2023-09-30 12:00:00'),
    (7, 0.8, '2023-10-31 12:00:00'),
    (7, 0.7, '2023-11-30 12:00:00'),
    (7, 0.9, '2023-12-31 12:00:00'),

    -- School 8 Data for 2023
    (8, 1.0, '2023-01-31 12:00:00'),
    (8, 0.9, '2023-02-28 12:00:00'),
    (8, 0.7, '2023-03-31 12:00:00'),
    (8, 1.0, '2023-04-30 12:00:00'),
    (8, 0.9, '2023-05-31 12:00:00'),
    (8, 1.0, '2023-06-30 12:00:00'),
    (8, 0.8, '2023-07-31 12:00:00'),
    (8, 1.0, '2023-08-31 12:00:00'),
    (8, 0.9, '2023-09-30 12:00:00'),
    (8, 0.8, '2023-10-31 12:00:00'),
    (8, 1.1, '2023-11-30 12:00:00'),
    (8, 1.0, '2023-12-31 12:00:00'),

    -- School 9 Data for 2023
    (9, 0.9, '2023-01-31 12:00:00'),
    (9, 0.8, '2023-02-28 12:00:00'),
    (9, 1.0, '2023-03-31 12:00:00'),
    (9, 1.1, '2023-04-30 12:00:00'),
    (9, 0.9, '2023-05-31 12:00:00'),
    (9, 1.0, '2023-06-30 12:00:00'),
    (9, 0.8, '2023-07-31 12:00:00'),
    (9, 0.9, '2023-08-31 12:00:00'),
    (9, 1.1, '2023-09-30 12:00:00'),
    (9, 0.9, '2023-10-31 12:00:00'),
    (9, 0.8, '2023-11-30 12:00:00'),
    (9, 1.1, '2023-12-31 12:00:00'),

    -- School 10 Data for 2023
    (10, 0.9, '2023-01-31 12:00:00'),
    (10, 0.8, '2023-02-28 12:00:00'),
    (10, 0.9, '2023-03-31 12:00:00'),
    (10, 1.0, '2023-04-30 12:00:00'),
    (10, 0.9, '2023-05-31 12:00:00'),
    (10, 1.0, '2023-06-30 12:00:00'),
    (10, 0.8, '2023-07-31 12:00:00'),
    (10, 0.9, '2023-08-31 12:00:00'),
    (10, 1.0, '2023-09-30 12:00:00'),
    (10, 0.7, '2023-10-31 12:00:00'),
    (10, 0.9, '2023-11-30 12:00:00'),
    (10, 1.1, '2023-12-31 12:00:00'),

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

INSERT INTO CarbonBreakdown (carbonfootprint_id, category, location, timestamp, percentage)
VALUES 
-- January 2024 (0.8 total)
(1, 'Energy Usage', 'Classroom', '2024-01-31 12:00:00', 40),
(1, 'Food Services', 'Cafeteria', '2024-01-31 12:00:00', 20),
(1, 'Waste Management', 'Laboratory', '2024-01-31 12:00:00', 15),
(1, 'Water Usage', 'Gym', '2024-01-31 12:00:00', 15),
(1, 'Transportation', 'Hallway', '2024-01-31 12:00:00', 10),
(1, 'Energy Usage', 'Laboratory', '2024-01-31 12:00:00', 5),
(1, 'Food Services', 'Classroom', '2024-01-31 12:00:00', 5),
(1, 'Waste Management', 'Cafeteria', '2024-01-31 12:00:00', 5),
(1, 'Water Usage', 'Hallway', '2024-01-31 12:00:00', 5),
(1, 'Transportation', 'Gym', '2024-01-31 12:00:00', 5),


-- February 2024 (0.7 total)
(2, 'Energy Usage', 'Laboratory', '2024-02-28 12:00:00', 35),
(2, 'Food Services', 'Cafeteria', '2024-02-28 12:00:00', 25),
(2, 'Waste Management', 'Classroom', '2024-02-28 12:00:00', 10),
(2, 'Water Usage', 'Gym', '2024-02-28 12:00:00', 15),
(2, 'Transportation', 'Hallway', '2024-02-28 12:00:00', 15),
(2, 'Energy Usage', 'Cafeteria', '2024-02-28 12:00:00', 5),
(2, 'Food Services', 'Laboratory', '2024-02-28 12:00:00', 5),
(2, 'Waste Management', 'Hallway', '2024-02-28 12:00:00', 5),
(2, 'Water Usage', 'Classroom', '2024-02-28 12:00:00', 5),
(2, 'Transportation', 'Gym', '2024-02-28 12:00:00', 5),

-- March 2024 (0.9 total)
(3, 'Energy Usage', 'Classroom', '2024-03-31 12:00:00', 45),
(3, 'Food Services', 'Cafeteria', '2024-03-31 12:00:00', 20),
(3, 'Waste Management', 'Laboratory', '2024-03-31 12:00:00', 15),
(3, 'Water Usage', 'Gym', '2024-03-31 12:00:00', 10),
(3, 'Transportation', 'Hallway', '2024-03-31 12:00:00', 10),
(3, 'Energy Usage', 'Hallway', '2024-03-31 12:00:00', 5),
(3, 'Food Services', 'Laboratory', '2024-03-31 12:00:00', 5),
(3, 'Waste Management', 'Cafeteria', '2024-03-31 12:00:00', 5),
(3, 'Water Usage', 'Classroom', '2024-03-31 12:00:00', 5),
(3, 'Transportation', 'Gym', '2024-03-31 12:00:00', 5),

-- April 2024 (0.8 total)
(4, 'Energy Usage', 'Laboratory', '2024-04-30 12:00:00', 40),
(4, 'Food Services', 'Cafeteria', '2024-04-30 12:00:00', 25),
(4, 'Waste Management', 'Classroom', '2024-04-30 12:00:00', 10),
(4, 'Water Usage', 'Gym', '2024-04-30 12:00:00', 15),
(4, 'Transportation', 'Hallway', '2024-04-30 12:00:00', 10),
(4, 'Energy Usage', 'Cafeteria', '2024-04-30 12:00:00', 5),
(4, 'Food Services', 'Classroom', '2024-04-30 12:00:00', 5),
(4, 'Waste Management', 'Hallway', '2024-04-30 12:00:00', 5),
(4, 'Water Usage', 'Laboratory', '2024-04-30 12:00:00', 5),
(4, 'Transportation', 'Gym', '2024-04-30 12:00:00', 5),

-- May 2024 (0.9 total)
(5, 'Energy Usage', 'Classroom', '2024-05-31 12:00:00', 45),
(5, 'Food Services', 'Cafeteria', '2024-05-31 12:00:00', 20),
(5, 'Waste Management', 'Laboratory', '2024-05-31 12:00:00', 10),
(5, 'Water Usage', 'Gym', '2024-05-31 12:00:00', 15),
(5, 'Transportation', 'Hallway', '2024-05-31 12:00:00', 10),
(5, 'Energy Usage', 'Gym', '2024-05-31 12:00:00', 5),
(5, 'Food Services', 'Hallway', '2024-05-31 12:00:00', 5),
(5, 'Waste Management', 'Classroom', '2024-05-31 12:00:00', 5),
(5, 'Water Usage', 'Cafeteria', '2024-05-31 12:00:00', 5),
(5, 'Transportation', 'Laboratory', '2024-05-31 12:00:00', 5),

-- June 2024 (0.8 total)
(6, 'Energy Usage', 'Laboratory', '2024-06-30 12:00:00', 35),
(6, 'Food Services', 'Cafeteria', '2024-06-30 12:00:00', 25),
(6, 'Waste Management', 'Classroom', '2024-06-30 12:00:00', 15),
(6, 'Water Usage', 'Gym', '2024-06-30 12:00:00', 15),
(6, 'Transportation', 'Hallway', '2024-06-30 12:00:00', 10),
(6, 'Energy Usage', 'Cafeteria', '2024-06-30 12:00:00', 5),
(6, 'Food Services', 'Laboratory', '2024-06-30 12:00:00', 5),
(6, 'Waste Management', 'Hallway', '2024-06-30 12:00:00', 5),
(6, 'Water Usage', 'Classroom', '2024-06-30 12:00:00', 5),
(6, 'Transportation', 'Gym', '2024-06-30 12:00:00', 5),

-- July 2024 (1.0 total)
(7, 'Energy Usage', 'Classroom', '2024-07-31 12:00:00', 50),
(7, 'Food Services', 'Cafeteria', '2024-07-31 12:00:00', 20),
(7, 'Waste Management', 'Laboratory', '2024-07-31 12:00:00', 15),
(7, 'Water Usage', 'Gym', '2024-07-31 12:00:00', 10),
(7, 'Transportation', 'Hallway', '2024-07-31 12:00:00', 5),
(7, 'Energy Usage', 'Laboratory', '2024-07-31 12:00:00', 5),
(7, 'Food Services', 'Classroom', '2024-07-31 12:00:00', 5),
(7, 'Waste Management', 'Cafeteria', '2024-07-31 12:00:00', 5),
(7, 'Water Usage', 'Hallway', '2024-07-31 12:00:00', 5),
(7, 'Transportation', 'Gym', '2024-07-31 12:00:00', 5),

-- August 2024 (0.9 total)
(8, 'Energy Usage', 'Classroom', '2024-08-31 12:00:00', 45),
(8, 'Food Services', 'Cafeteria', '2024-08-31 12:00:00', 25),
(8, 'Waste Management', 'Laboratory', '2024-08-31 12:00:00', 10),
(8, 'Water Usage', 'Gym', '2024-08-31 12:00:00', 10),
(8, 'Transportation', 'Hallway', '2024-08-31 12:00:00', 10),
(8, 'Energy Usage', 'Cafeteria', '2024-08-31 12:00:00', 5),
(8, 'Food Services', 'Laboratory', '2024-08-31 12:00:00', 5),
(8, 'Waste Management', 'Classroom', '2024-08-31 12:00:00', 5),
(8, 'Water Usage', 'Hallway', '2024-08-31 12:00:00', 5),
(8, 'Transportation', 'Gym', '2024-08-31 12:00:00', 5),

-- September 2024 (1.0 total)
(9, 'Energy Usage', 'Laboratory', '2024-09-30 12:00:00', 50),
(9, 'Food Services', 'Cafeteria', '2024-09-30 12:00:00', 20),
(9, 'Waste Management', 'Classroom', '2024-09-30 12:00:00', 15),
(9, 'Water Usage', 'Gym', '2024-09-30 12:00:00', 10),
(9, 'Transportation', 'Hallway', '2024-09-30 12:00:00', 5),
(9, 'Energy Usage', 'Cafeteria', '2024-09-30 12:00:00', 5),
(9, 'Food Services', 'Laboratory', '2024-09-30 12:00:00', 5),
(9, 'Waste Management', 'Hallway', '2024-09-30 12:00:00', 5),
(9, 'Water Usage', 'Classroom', '2024-09-30 12:00:00', 5),
(9, 'Transportation', 'Gym', '2024-09-30 12:00:00', 5),

-- October 2024 (0.7 total)
(10, 'Energy Usage', 'Classroom', '2024-10-31 12:00:00', 35),
(10, 'Food Services', 'Cafeteria', '2024-10-31 12:00:00', 20),
(10, 'Waste Management', 'Laboratory', '2024-10-31 12:00:00', 10),
(10, 'Water Usage', 'Gym', '2024-10-31 12:00:00', 20),
(10, 'Transportation', 'Hallway', '2024-10-31 12:00:00', 15),
(10, 'Energy Usage', 'Laboratory', '2024-10-31 12:00:00', 5),
(10, 'Food Services', 'Classroom', '2024-10-31 12:00:00', 5),
(10, 'Waste Management', 'Cafeteria', '2024-10-31 12:00:00', 5),
(10, 'Water Usage', 'Hallway', '2024-10-31 12:00:00', 5),
(10, 'Transportation', 'Gym', '2024-10-31 12:00:00', 5),

-- November 2024 (0.8 total)
(11, 'Energy Usage', 'Laboratory', '2024-11-30 12:00:00', 40),
(11, 'Food Services', 'Cafeteria', '2024-11-30 12:00:00', 25),
(11, 'Waste Management', 'Classroom', '2024-11-30 12:00:00', 10),
(11, 'Water Usage', 'Gym', '2024-11-30 12:00:00', 15),
(11, 'Transportation', 'Hallway', '2024-11-30 12:00:00', 10),
(11, 'Energy Usage', 'Cafeteria', '2024-11-30 12:00:00', 5),
(11, 'Food Services', 'Laboratory', '2024-11-30 12:00:00', 5),
(11, 'Waste Management', 'Hallway', '2024-11-30 12:00:00', 5),
(11, 'Water Usage', 'Classroom', '2024-11-30 12:00:00', 5),
(11, 'Transportation', 'Gym', '2024-11-30 12:00:00', 5),

-- December 2024 (1.0 total)
(12, 'Energy Usage', 'Classroom', '2024-12-31 12:00:00', 50),
(12, 'Food Services', 'Cafeteria', '2024-12-31 12:00:00', 20),
(12, 'Waste Management', 'Laboratory', '2024-12-31 12:00:00', 15),
(12, 'Water Usage', 'Gym', '2024-12-31 12:00:00', 10),
(12, 'Transportation', 'Hallway', '2024-12-31 12:00:00', 5),
(12, 'Energy Usage', 'Hallway', '2024-12-31 12:00:00', 5),
(12, 'Food Services', 'Laboratory', '2024-12-31 12:00:00', 5),
(12, 'Waste Management', 'Cafeteria', '2024-12-31 12:00:00', 5),
(12, 'Water Usage', 'Classroom', '2024-12-31 12:00:00', 5),
(12, 'Transportation', 'Gym', '2024-12-31 12:00:00', 5),

-- January 2023 (Total from original data preserved)
(121, 'Energy Usage', 'Classroom', '2023-01-31 12:00:00', 42),
(121, 'Food Services', 'Cafeteria', '2023-01-31 12:00:00', 18),
(121, 'Waste Management', 'Laboratory', '2023-01-31 12:00:00', 14),
(121, 'Water Usage', 'Gym', '2023-01-31 12:00:00', 16),
(121, 'Transportation', 'Hallway', '2023-01-31 12:00:00', 10),
(121, 'Energy Usage', 'Laboratory', '2023-01-31 12:00:00', 5),
(121, 'Food Services', 'Classroom', '2023-01-31 12:00:00', 5),
(121, 'Waste Management', 'Cafeteria', '2023-01-31 12:00:00', 5),
(121, 'Water Usage', 'Hallway', '2023-01-31 12:00:00', 5),
(121, 'Transportation', 'Gym', '2023-01-31 12:00:00', 5),

-- February 2023
(122, 'Energy Usage', 'Laboratory', '2023-02-28 12:00:00', 37),
(122, 'Food Services', 'Cafeteria', '2023-02-28 12:00:00', 22),
(122, 'Waste Management', 'Classroom', '2023-02-28 12:00:00', 13),
(122, 'Water Usage', 'Gym', '2023-02-28 12:00:00', 14),
(122, 'Transportation', 'Hallway', '2023-02-28 12:00:00', 14),
(122, 'Energy Usage', 'Cafeteria', '2023-02-28 12:00:00', 5),
(122, 'Food Services', 'Laboratory', '2023-02-28 12:00:00', 5),
(122, 'Waste Management', 'Hallway', '2023-02-28 12:00:00', 5),
(122, 'Water Usage', 'Classroom', '2023-02-28 12:00:00', 5),
(122, 'Transportation', 'Gym', '2023-02-28 12:00:00', 5),

-- March 2023
(123, 'Energy Usage', 'Classroom', '2023-03-31 12:00:00', 48),
(123, 'Food Services', 'Cafeteria', '2023-03-31 12:00:00', 21),
(123, 'Waste Management', 'Laboratory', '2023-03-31 12:00:00', 12),
(123, 'Water Usage', 'Gym', '2023-03-31 12:00:00', 11),
(123, 'Transportation', 'Hallway', '2023-03-31 12:00:00', 8),
(123, 'Energy Usage', 'Hallway', '2023-03-31 12:00:00', 5),
(123, 'Food Services', 'Laboratory', '2023-03-31 12:00:00', 5),
(123, 'Waste Management', 'Cafeteria', '2023-03-31 12:00:00', 5),
(123, 'Water Usage', 'Classroom', '2023-03-31 12:00:00', 5),
(123, 'Transportation', 'Gym', '2023-03-31 12:00:00', 5),

-- April 2023
(124, 'Energy Usage', 'Laboratory', '2023-04-30 12:00:00', 39),
(124, 'Food Services', 'Cafeteria', '2023-04-30 12:00:00', 24),
(124, 'Waste Management', 'Classroom', '2023-04-30 12:00:00', 11),
(124, 'Water Usage', 'Gym', '2023-04-30 12:00:00', 15),
(124, 'Transportation', 'Hallway', '2023-04-30 12:00:00', 11),
(124, 'Energy Usage', 'Cafeteria', '2023-04-30 12:00:00', 5),
(124, 'Food Services', 'Classroom', '2023-04-30 12:00:00', 5),
(124, 'Waste Management', 'Hallway', '2023-04-30 12:00:00', 5),
(124, 'Water Usage', 'Laboratory', '2023-04-30 12:00:00', 5),
(124, 'Transportation', 'Gym', '2023-04-30 12:00:00', 5),

-- May 2023
(125, 'Energy Usage', 'Classroom', '2023-05-31 12:00:00', 47),
(125, 'Food Services', 'Cafeteria', '2023-05-31 12:00:00', 19),
(125, 'Waste Management', 'Laboratory', '2023-05-31 12:00:00', 14),
(125, 'Water Usage', 'Gym', '2023-05-31 12:00:00', 13),
(125, 'Transportation', 'Hallway', '2023-05-31 12:00:00', 7),
(125, 'Energy Usage', 'Gym', '2023-05-31 12:00:00', 5),
(125, 'Food Services', 'Hallway', '2023-05-31 12:00:00', 5),
(125, 'Waste Management', 'Classroom', '2023-05-31 12:00:00', 5),
(125, 'Water Usage', 'Cafeteria', '2023-05-31 12:00:00', 5),
(125, 'Transportation', 'Laboratory', '2023-05-31 12:00:00', 5),

-- June 2023
(126, 'Energy Usage', 'Laboratory', '2023-06-30 12:00:00', 34),
(126, 'Food Services', 'Cafeteria', '2023-06-30 12:00:00', 26),
(126, 'Waste Management', 'Classroom', '2023-06-30 12:00:00', 16),
(126, 'Water Usage', 'Gym', '2023-06-30 12:00:00', 14),
(126, 'Transportation', 'Hallway', '2023-06-30 12:00:00', 10),
(126, 'Energy Usage', 'Cafeteria', '2023-06-30 12:00:00', 5),
(126, 'Food Services', 'Laboratory', '2023-06-30 12:00:00', 5),
(126, 'Waste Management', 'Hallway', '2023-06-30 12:00:00', 5),
(126, 'Water Usage', 'Classroom', '2023-06-30 12:00:00', 5),
(126, 'Transportation', 'Gym', '2023-06-30 12:00:00', 5),

-- July 2023
(127, 'Energy Usage', 'Classroom', '2023-07-31 12:00:00', 52),
(127, 'Food Services', 'Cafeteria', '2023-07-31 12:00:00', 18),
(127, 'Waste Management', 'Laboratory', '2023-07-31 12:00:00', 15),
(127, 'Water Usage', 'Gym', '2023-07-31 12:00:00', 9),
(127, 'Transportation', 'Hallway', '2023-07-31 12:00:00', 6),
(127, 'Energy Usage', 'Laboratory', '2023-07-31 12:00:00', 5),
(127, 'Food Services', 'Classroom', '2023-07-31 12:00:00', 5),
(127, 'Waste Management', 'Cafeteria', '2023-07-31 12:00:00', 5),
(127, 'Water Usage', 'Hallway', '2023-07-31 12:00:00', 5),
(127, 'Transportation', 'Gym', '2023-07-31 12:00:00', 5),

-- August 2023
(128, 'Energy Usage', 'Classroom', '2023-08-31 12:00:00', 44),
(128, 'Food Services', 'Cafeteria', '2023-08-31 12:00:00', 23),
(128, 'Waste Management', 'Laboratory', '2023-08-31 12:00:00', 12),
(128, 'Water Usage', 'Gym', '2023-08-31 12:00:00', 10),
(128, 'Transportation', 'Hallway', '2023-08-31 12:00:00', 11),
(128, 'Energy Usage', 'Cafeteria', '2023-08-31 12:00:00', 5),
(128, 'Food Services', 'Laboratory', '2023-08-31 12:00:00', 5),
(128, 'Waste Management', 'Classroom', '2023-08-31 12:00:00', 5),
(128, 'Water Usage', 'Hallway', '2023-08-31 12:00:00', 5),
(128, 'Transportation', 'Gym', '2023-08-31 12:00:00', 5),

-- September 2023
(129, 'Energy Usage', 'Laboratory', '2023-09-30 12:00:00', 49),
(129, 'Food Services', 'Cafeteria', '2023-09-30 12:00:00', 19),
(129, 'Waste Management', 'Classroom', '2023-09-30 12:00:00', 14),
(129, 'Water Usage', 'Gym', '2023-09-30 12:00:00', 11),
(129, 'Transportation', 'Hallway', '2023-09-30 12:00:00', 7),
(129, 'Energy Usage', 'Cafeteria', '2023-09-30 12:00:00', 5),
(129, 'Food Services', 'Laboratory', '2023-09-30 12:00:00', 5),
(129, 'Waste Management', 'Hallway', '2023-09-30 12:00:00', 5),
(129, 'Water Usage', 'Classroom', '2023-09-30 12:00:00', 5),
(129, 'Transportation', 'Gym', '2023-09-30 12:00:00', 5),

-- October 2023
(130, 'Energy Usage', 'Classroom', '2023-10-31 12:00:00', 36),
(130, 'Food Services', 'Cafeteria', '2023-10-31 12:00:00', 22),
(130, 'Waste Management', 'Laboratory', '2023-10-31 12:00:00', 11),
(130, 'Water Usage', 'Gym', '2023-10-31 12:00:00', 21),
(130, 'Transportation', 'Hallway', '2023-10-31 12:00:00', 10),
(130, 'Energy Usage', 'Laboratory', '2023-10-31 12:00:00', 5),
(130, 'Food Services', 'Classroom', '2023-10-31 12:00:00', 5),
(130, 'Waste Management', 'Cafeteria', '2023-10-31 12:00:00', 5),
(130, 'Water Usage', 'Hallway', '2023-10-31 12:00:00', 5),
(130, 'Transportation', 'Gym', '2023-10-31 12:00:00', 5),

-- November 2023
(131, 'Energy Usage', 'Laboratory', '2023-11-30 12:00:00', 41),
(131, 'Food Services', 'Cafeteria', '2023-11-30 12:00:00', 27),
(131, 'Waste Management', 'Classroom', '2023-11-30 12:00:00', 9),
(131, 'Water Usage', 'Gym', '2023-11-30 12:00:00', 14),
(131, 'Transportation', 'Hallway', '2023-11-30 12:00:00', 9),
(131, 'Energy Usage', 'Cafeteria', '2023-11-30 12:00:00', 5),
(131, 'Food Services', 'Laboratory', '2023-11-30 12:00:00', 5),
(131, 'Waste Management', 'Hallway', '2023-11-30 12:00:00', 5),
(131, 'Water Usage', 'Classroom', '2023-11-30 12:00:00', 5),
(131, 'Transportation', 'Gym', '2023-11-30 12:00:00', 5),

-- December 2023
(132, 'Energy Usage', 'Classroom', '2023-12-31 12:00:00', 53),
(132, 'Food Services', 'Cafeteria', '2023-12-31 12:00:00', 17),
(132, 'Waste Management', 'Laboratory', '2023-12-31 12:00:00', 14),
(132, 'Water Usage', 'Gym', '2023-12-31 12:00:00', 8),
(132, 'Transportation', 'Hallway', '2023-12-31 12:00:00', 8),
(132, 'Energy Usage', 'Hallway', '2023-12-31 12:00:00', 5),
(132, 'Food Services', 'Laboratory', '2023-12-31 12:00:00', 5),
(132, 'Waste Management', 'Cafeteria', '2023-12-31 12:00:00', 5),
(132, 'Water Usage', 'Classroom', '2023-12-31 12:00:00', 5),
(132, 'Transportation', 'Gym', '2023-12-31 12:00:00', 5);

INSERT INTO Events (school_id, name, description, date, carbonfootprint_id, energyusage_id) 
VALUES 
(1, 'Graduation Day 2024', 'Annual graduation ceremony for the class of 2024', '2024-11-30 12:00:00', 11, 47),
(1, 'Freshman Orientation 2024', 'Welcome orientation for new students', '2024-01-31 12:00:00', 1, 37),
(1, 'Sports Carnival 2024', 'Annual school sports carnival and field day', '2024-08-31 12:00:00', 8, 44);
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