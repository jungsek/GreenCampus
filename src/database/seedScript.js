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
IF OBJECT_ID('FK_Events_SchoolID', 'F') IS NOT NULL
  ALTER TABLE Events DROP CONSTRAINT FK_Events_SchoolID;
IF OBJECT_ID('FK_Events_CarbonFootprintID', 'F') IS NOT NULL
  ALTER TABLE Events DROP CONSTRAINT FK_Events_CarbonFootprintID;
IF OBJECT_ID('FK_Events_EnergyUsageID', 'F') IS NOT NULL
  ALTER TABLE Events DROP CONSTRAINT FK_Events_EnergyUsageID;
IF OBJECT_ID('FK_Campaigns_SchoolID', 'F') IS NOT NULL
  ALTER TABLE Campaigns DROP CONSTRAINT FK_Campaigns_SchoolID;
IF OBJECT_ID('FK_CampaignStudents_CampaignID', 'F') IS NOT NULL
IF OBJECT_ID('FK_CampaignStudents_CampaignID', 'F') IS NOT NULL
  ALTER TABLE CampaignStudents DROP CONSTRAINT FK_CampaignStudents_CampaignID;
IF OBJECT_ID('FK_CampaignStudents_StudentID', 'F') IS NOT NULL
  ALTER TABLE CampaignStudents DROP CONSTRAINT FK_CampaignStudents_StudentID;
  IF OBJECT_ID('FK_StudentAchievements_StudentID', 'F') IS NOT NULL
  ALTER TABLE StudentAchievements DROP CONSTRAINT FK_StudentAchievements_StudentID;
  IF OBJECT_ID('FK_StudentAchievements_AchievementID', 'F') IS NOT NULL
  ALTER TABLE StudentAchievements DROP CONSTRAINT FK_StudentAchievements_AchievementID;


-- Drop all tables if they exist
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Schools', 'U') IS NOT NULL DROP TABLE dbo.Schools;
IF OBJECT_ID('dbo.EnergyUsage', 'U') IS NOT NULL DROP TABLE dbo.EnergyUsage;
IF OBJECT_ID('dbo.CarbonFootprint', 'U') IS NOT NULL DROP TABLE dbo.CarbonFootprint;
IF OBJECT_ID('dbo.Events', 'U') IS NOT NULL DROP TABLE dbo.Events;
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
IF OBJECT_ID('dbo.EnergyBreakdown', 'U') IS NOT NULL DROP TABLE dbo.EnergyBreakdown;
IF OBJECT_ID('dbo.CarbonBreakdown', 'U') IS NOT NULL DROP TABLE dbo.CarbonBreakdown;
IF OBJECT_ID('dbo.Goals', 'U') IS NOT NULL DROP TABLE dbo.Goals;
IF OBJECT_ID('dbo.Campaigns', 'U') IS NOT NULL DROP TABLE dbo.Campaigns;
IF OBJECT_ID('dbo.CampaignStudents', 'U') IS NOT NULL DROP TABLE dbo.CampaignStudents;
IF OBJECT_ID('dbo.StudentAchievements', 'U') IS NOT NULL DROP TABLE dbo.StudentAchievements;
IF OBJECT_ID('dbo.Achievements', 'U') IS NOT NULL DROP TABLE dbo.Achievements;
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
   start_date DATETIME NOT NULL,
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

CREATE TABLE Achievements (
    achievement_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(255) NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    target_value INT NOT NULL, -- The value students need to reach to complete the achievement
    points INT NOT NULL, -- Points awarded upon completion
);

CREATE TABLE StudentAchievements (
    id INT PRIMARY KEY IDENTITY(1,1),
    student_id INT NOT NULL, -- Foreign key to Users table
    achievement_id INT NOT NULL, -- Foreign key to Achievements table
    progress INT DEFAULT 0, -- Tracks progress toward the achievement
    completed BIT, -- Marks if the achievement is completed
    FOREIGN KEY (achievement_id) REFERENCES Achievements(achievement_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Users(id) ON DELETE CASCADE
);

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

    -- 2025 
    (1, 'January', 890, 26.5, '2025-01-15 10:00:00'),
    (1, 'February', 950, 26.0, '2025-02-15 10:00:00'),
    (1, 'March', 1450, 28.5, '2025-03-15 10:00:00'),
    (1, 'April', 1150, 27.5, '2025-04-15 10:00:00'),
    (1, 'May', 1200, 26.5, '2025-05-15 10:00:00'),
    (1, 'June', 1300, 29.5, '2025-06-15 10:00:00'),
    (1, 'July', 1550, 30.5, '2025-07-15 10:00:00'),
    (1, 'August', 1450, 29.8, '2025-08-15 10:00:00'),
    (1, 'September', 1350, 27.0, '2025-09-15 10:00:00'),
    (1, 'October', 1250, 25.0, '2025-10-15 10:00:00'),
    (1, 'November', 1300, 24.0, '2025-11-15 10:00:00'),
    (1, 'December', 1400, 23.0, '2025-12-15 10:00:00'),

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

    -- 2025 
    (2, 'January', 850, 24.5, '2025-01-15 10:00:00'),
    (2, 'February', 950, 26.0, '2025-02-15 10:00:00'),
    (2, 'March', 1050, 27.0, '2025-03-15 10:00:00'),
    (2, 'April', 1000, 28.5, '2025-04-15 10:00:00'),
    (2, 'May', 900, 27.0, '2025-05-15 10:00:00'),
    (2, 'June', 1150, 29.5, '2025-06-15 10:00:00'),
    (2, 'July', 1200, 31.0, '2025-07-15 10:00:00'),
    (2, 'August', 1100, 31.5, '2025-08-15 10:00:00'),
    (2, 'September', 950, 28.5, '2025-09-15 10:00:00'),
    (2, 'October', 1050, 25.5, '2025-10-15 10:00:00'),
    (2, 'November', 1000, 24.5, '2025-11-15 10:00:00'),
    (2, 'December', 850, 23.5, '2025-12-15 10:00:00'),

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

    -- School 3 Data (2025)
    (3, 'January', 850, 24.0, '2025-01-15 10:00:00'),
    (3, 'February', 1000, 25.0, '2025-02-15 10:00:00'),
    (3, 'March', 1150, 25.5, '2025-03-15 10:00:00'),
    (3, 'April', 1100, 27.5, '2025-04-15 10:00:00'),
    (3, 'May', 950, 26.5, '2025-05-15 10:00:00'),
    (3, 'June', 1200, 30.0, '2025-06-15 10:00:00'),
    (3, 'July', 1250, 31.5, '2025-07-15 10:00:00'),
    (3, 'August', 1150, 31.0, '2025-08-15 10:00:00'),
    (3, 'September', 1000, 28.5, '2025-09-15 10:00:00'),
    (3, 'October', 1100, 26.0, '2025-10-15 10:00:00'),
    (3, 'November', 1250, 24.5, '2025-11-15 10:00:00'),
    (3, 'December', 1000, 23.5, '2025-12-15 10:00:00'),

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
   
    -- School 4 Data (2025)
    (4, 'January', 800, 23.0, '2025-01-15 10:00:00'),
    (4, 'February', 900, 24.0, '2025-02-15 10:00:00'),
    (4, 'March', 1000, 24.5, '2025-03-15 10:00:00'),
    (4, 'April', 1250, 25.5, '2025-04-15 10:00:00'),
    (4, 'May', 950, 25.0, '2025-05-15 10:00:00'),
    (4, 'June', 1100, 28.5, '2025-06-15 10:00:00'),
    (4, 'July', 1150, 30.0, '2025-07-15 10:00:00'),
    (4, 'August', 1050, 29.0, '2025-08-15 10:00:00'),
    (4, 'September', 950, 27.5, '2025-09-15 10:00:00'),
    (4, 'October', 1000, 24.5, '2025-10-15 10:00:00'),
    (4, 'November', 1050, 23.5, '2025-11-15 10:00:00'),
    (4, 'December', 850, 22.5, '2025-12-15 10:00:00'),

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

    -- School 5 Data (2025)
    (5, 'January', 710, 21.5, '2025-01-15 10:00:00'),
    (5, 'February', 760, 22.5, '2025-02-15 10:00:00'),
    (5, 'March', 870, 23.5, '2025-03-15 10:00:00'),
    (5, 'April', 910, 24.5, '2025-04-15 10:00:00'),
    (5, 'May', 770, 24.0, '2025-05-15 10:00:00'),
    (5, 'June', 960, 28.0, '2025-06-15 10:00:00'),
    (5, 'July', 1020, 29.0, '2025-07-15 10:00:00'),
    (5, 'August', 960, 28.5, '2025-08-15 10:00:00'),
    (5, 'September', 820, 27.0, '2025-09-15 10:00:00'),
    (5, 'October', 860, 24.0, '2025-10-15 10:00:00'),
    (5, 'November', 1160, 23.0, '2025-11-15 10:00:00'),
    (5, 'December', 980, 21.5, '2025-12-15 10:00:00'),

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

    -- School 6 Data (2025)
    (6, 'January', 740, 21.0, '2025-01-15 10:00:00'),
    (6, 'February', 790, 22.0, '2025-02-15 10:00:00'),
    (6, 'March', 890, 23.5, '2025-03-15 10:00:00'),
    (6, 'April', 940, 24.8, '2025-04-15 10:00:00'),
    (6, 'May', 780, 23.5, '2025-05-15 10:00:00'),
    (6, 'June', 990, 27.0, '2025-06-15 10:00:00'),
    (6, 'July', 1030, 28.5, '2025-07-15 10:00:00'),
    (6, 'August', 980, 28.0, '2025-08-15 10:00:00'),
    (6, 'September', 830, 26.0, '2025-09-15 10:00:00'),
    (6, 'October', 990, 24.0, '2025-10-15 10:00:00'),
    (6, 'November', 1210, 22.5, '2025-11-15 10:00:00'),
    (6, 'December', 995, 21.0, '2025-12-15 10:00:00'),

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

    -- School 7 Data (2025)
    (7, 'January', 790, 20.0, '2025-01-15 10:00:00'),
    (7, 'February', 950, 21.0, '2025-02-15 10:00:00'),
    (7, 'March', 830, 22.5, '2025-03-15 10:00:00'),
    (7, 'April', 890, 24.0, '2025-04-15 10:00:00'),
    (7, 'May', 850, 23.0, '2025-05-15 10:00:00'),
    (7, 'June', 960, 26.0, '2025-06-15 10:00:00'),
    (7, 'July', 1020, 27.5, '2025-07-15 10:00:00'),
    (7, 'August', 970, 27.0, '2025-08-15 10:00:00'),
    (7, 'September', 820, 25.0, '2025-09-15 10:00:00'),
    (7, 'October', 880, 23.0, '2025-10-15 10:00:00'),
    (7, 'November', 1140, 22.0, '2025-11-15 10:00:00'),
    (7, 'December', 980, 20.0, '2025-12-15 10:00:00'),

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

    -- School 8 Data (2025)
    (8, 'January', 830, 20.5, '2025-01-15 10:00:00'),
    (8, 'February', 900, 21.5, '2025-02-15 10:00:00'),
    (8, 'March', 850, 24.0, '2025-03-15 10:00:00'),
    (8, 'April', 920, 25.0, '2025-04-15 10:00:00'),
    (8, 'May', 880, 23.5, '2025-05-15 10:00:00'),
    (8, 'June', 970, 26.0, '2025-06-15 10:00:00'),
    (8, 'July', 1025, 27.0, '2025-07-15 10:00:00'),
    (8, 'August', 975, 26.8, '2025-08-15 10:00:00'),
    (8, 'September', 820, 25.0, '2025-09-15 10:00:00'),
    (8, 'October', 890, 23.5, '2025-10-15 10:00:00'),
    (8, 'November', 1150, 22.0, '2025-11-15 10:00:00'),
    (8, 'December', 990, 20.5, '2025-12-15 10:00:00'),

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

    -- School 9 Data (2025)
    (9, 'January', 900, 20.0, '2025-01-15 10:00:00'),
    (9, 'February', 800, 21.0, '2025-02-15 10:00:00'),
    (9, 'March', 870, 23.0, '2025-03-15 10:00:00'),
    (9, 'April', 940, 24.5, '2025-04-15 10:00:00'),
    (9, 'May', 910, 23.5, '2025-05-15 10:00:00'),
    (9, 'June', 980, 26.5, '2025-06-15 10:00:00'),
    (9, 'July', 1035, 27.0, '2025-07-15 10:00:00'),
    (9, 'August', 990, 26.5, '2025-08-15 10:00:00'),
    (9, 'September', 1020, 25.0, '2025-09-15 10:00:00'),
    (9, 'October', 900, 23.0, '2025-10-15 10:00:00'),
    (9, 'November', 1160, 22.0, '2025-11-15 10:00:00'),
    (9, 'December', 995, 20.5, '2025-12-15 10:00:00'),

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
    (10, 'December', 980, 20.0, '2024-12-15 10:00:00'),

    -- School 10 Data (2025)
    (10, 'January', 820, 20.0, '2025-01-15 10:00:00'),
    (10, 'February', 980, 21.0, '2025-02-15 10:00:00'),
    (10, 'March', 860, 23.0, '2025-03-15 10:00:00'),
    (10, 'April', 930, 24.0, '2025-04-15 10:00:00'),
    (10, 'May', 870, 23.2, '2025-05-15 10:00:00'),
    (10, 'June', 960, 26.0, '2025-06-15 10:00:00'),
    (10, 'July', 1020, 27.0, '2025-07-15 10:00:00'),
    (10, 'August', 970, 26.8, '2025-08-15 10:00:00'),
    (10, 'September', 1000, 25.0, '2025-09-15 10:00:00'),
    (10, 'October', 980, 23.8, '2025-10-15 10:00:00'),
    (10, 'November', 1140, 22.0, '2025-11-15 10:00:00'),
    (10, 'December', 990, 20.5, '2025-12-15 10:00:00');

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

(36, 'Classroom', 'Lighting', 8.33, '2024-01-15 10:00:00'),
(36, 'Classroom', 'Computers', 17.36, '2024-01-15 10:00:00'),
(36, 'Classroom', 'HVAC', 20.83, '2024-01-15 10:00:00'),
(36, 'Library', 'Lighting', 6.94, '2024-01-15 10:00:00'),
(36, 'Library', 'HVAC', 13.89, '2024-01-15 10:00:00'),
(36, 'Office', 'Lighting', 10.42, '2024-01-15 10:00:00'),
(36, 'Gym', 'Equipment', 3.47, '2024-01-15 10:00:00'),
(36, 'Cafeteria', 'Refrigeration', 5.56, '2024-01-15 10:00:00'),
(36, 'Cafeteria', 'Appliances', 2.78, '2024-01-15 10:00:00'),
(36, 'Auditorium', 'Lighting', 4.17, '2024-01-15 10:00:00'),
(36, 'Laboratory', 'HVAC', 4.86, '2024-01-15 10:00:00'),
(36, 'Hallway', 'Lighting', 1.39, '2024-01-15 10:00:00'),
-- EnergyUsage for February 2024 (ID 37)
(37, 'Classroom', 'Lighting', 9.33, '2024-02-15 10:00:00'),
(37, 'Classroom', 'Computers', 15.33, '2024-02-15 10:00:00'),
(37, 'Classroom', 'HVAC', 18.67, '2024-02-15 10:00:00'),
(37, 'Library', 'Lighting', 8.00, '2024-02-15 10:00:00'),
(37, 'Library', 'HVAC', 12.00, '2024-02-15 10:00:00'),
(37, 'Office', 'Lighting', 10.67, '2024-02-15 10:00:00'),
(37, 'Gym', 'Equipment', 4.00, '2024-02-15 10:00:00'),
(37, 'Cafeteria', 'Refrigeration', 6.00, '2024-02-15 10:00:00'),
(37, 'Cafeteria', 'Appliances', 3.33, '2024-02-15 10:00:00'),
(37, 'Auditorium', 'Lighting', 4.67, '2024-02-15 10:00:00'),
(37, 'Laboratory', 'HVAC', 6.00, '2024-02-15 10:00:00'),
(37, 'Hallway', 'Lighting', 2.00, '2024-02-15 10:00:00'),
-- EnergyUsage for March 2024 (ID 38)
(38, 'Classroom', 'Lighting', 9.35, '2024-03-15 10:00:00'),
(38, 'Classroom', 'Computers', 15.83, '2024-03-15 10:00:00'),
(38, 'Classroom', 'HVAC', 19.42, '2024-03-15 10:00:00'),
(38, 'Library', 'Lighting', 7.91, '2024-03-15 10:00:00'),
(38, 'Library', 'HVAC', 12.23, '2024-03-15 10:00:00'),
(38, 'Office', 'Lighting', 10.07, '2024-03-15 10:00:00'),
(38, 'Gym', 'Equipment', 5.04, '2024-03-15 10:00:00'),
(38, 'Cafeteria', 'Refrigeration', 7.19, '2024-03-15 10:00:00'),
(38, 'Cafeteria', 'Appliances', 4.32, '2024-03-15 10:00:00'),
(38, 'Auditorium', 'Lighting', 5.76, '2024-03-15 10:00:00'),
(38, 'Laboratory', 'HVAC', 7.19, '2024-03-15 10:00:00'),
(38, 'Hallway', 'Lighting', 2.88, '2024-03-15 10:00:00'),

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

(40, 'Classroom', 'Lighting', 9, '2024-05-15 10:00:00'),
(40, 'Classroom', 'Computers', 13, '2024-05-15 10:00:00'),
(40, 'Classroom', 'HVAC', 15, '2024-05-15 10:00:00'),
(40, 'Library', 'Lighting', 7, '2024-05-15 10:00:00'),
(40, 'Library', 'HVAC', 12, '2024-05-15 10:00:00'),
(40, 'Office', 'Lighting', 9, '2024-05-15 10:00:00'),
(40, 'Gym', 'Equipment', 4, '2024-05-15 10:00:00'),
(40, 'Cafeteria', 'Refrigeration', 6, '2024-05-15 10:00:00'),
(40, 'Cafeteria', 'Appliances', 4, '2024-05-15 10:00:00'),
(40, 'Auditorium', 'Lighting', 5, '2024-05-15 10:00:00'),
(40, 'Laboratory', 'HVAC', 7, '2024-05-15 10:00:00'),
(40, 'Hallway', 'Lighting', 4, '2024-05-15 10:00:00'),

-- EnergyUsage for June 2024 (ID 41)
(41, 'Classroom', 'Lighting', 10, '2024-06-15 10:00:00'),
(41, 'Classroom', 'Computers', 14, '2024-06-15 10:00:00'),
(41, 'Classroom', 'HVAC', 17, '2024-06-15 10:00:00'),
(41, 'Library', 'Lighting', 8, '2024-06-15 10:00:00'),
(41, 'Library', 'HVAC', 11, '2024-06-15 10:00:00'),
(41, 'Office', 'Lighting', 10, '2024-06-15 10:00:00'),
(41, 'Gym', 'Equipment', 5, '2024-06-15 10:00:00'),
(41, 'Cafeteria', 'Refrigeration', 6, '2024-06-15 10:00:00'),
(41, 'Cafeteria', 'Appliances', 4, '2024-06-15 10:00:00'),
(41, 'Auditorium', 'Lighting', 5, '2024-06-15 10:00:00'),
(41, 'Laboratory', 'HVAC', 7, '2024-06-15 10:00:00'),
(41, 'Hallway', 'Lighting', 3, '2024-06-15 10:00:00'),

-- EnergyUsage for July 2024 (ID 42)
(42, 'Classroom', 'Lighting', 9, '2024-07-15 10:00:00'),
(42, 'Classroom', 'Computers', 13, '2024-07-15 10:00:00'),
(42, 'Classroom', 'HVAC', 15, '2024-07-15 10:00:00'),
(42, 'Library', 'Lighting', 7, '2024-07-15 10:00:00'),
(42, 'Library', 'HVAC', 11, '2024-07-15 10:00:00'),
(42, 'Office', 'Lighting', 9, '2024-07-15 10:00:00'),
(42, 'Gym', 'Equipment', 4, '2024-07-15 10:00:00'),
(42, 'Cafeteria', 'Refrigeration', 6, '2024-07-15 10:00:00'),
(42, 'Cafeteria', 'Appliances', 3, '2024-07-15 10:00:00'),
(42, 'Auditorium', 'Lighting', 5, '2024-07-15 10:00:00'),
(42, 'Laboratory', 'HVAC', 7, '2024-07-15 10:00:00'),
(42, 'Hallway', 'Lighting', 3, '2024-07-15 10:00:00'),

-- EnergyUsage for August 2024 (ID 43)
(43, 'Classroom', 'Lighting', 8, '2024-08-15 10:00:00'),
(43, 'Classroom', 'Computers', 12, '2024-08-15 10:00:00'),
(43, 'Classroom', 'HVAC', 13, '2024-08-15 10:00:00'),
(43, 'Library', 'Lighting', 7, '2024-08-15 10:00:00'),
(43, 'Library', 'HVAC', 10, '2024-08-15 10:00:00'),
(43, 'Office', 'Lighting', 8, '2024-08-15 10:00:00'),
(43, 'Gym', 'Equipment', 4, '2024-08-15 10:00:00'),
(43, 'Cafeteria', 'Refrigeration', 5, '2024-08-15 10:00:00'),
(43, 'Cafeteria', 'Appliances', 3, '2024-08-15 10:00:00'),
(43, 'Auditorium', 'Lighting', 5, '2024-08-15 10:00:00'),
(43, 'Laboratory', 'HVAC', 6, '2024-08-15 10:00:00'),
(43, 'Hallway', 'Lighting', 3, '2024-08-15 10:00:00'),

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

(46, 'Classroom', 'Lighting', 12.74, '2024-11-15 10:00:00'),
(46, 'Classroom', 'Computers', 15.92, '2024-11-15 10:00:00'),
(46, 'Classroom', 'HVAC', 17.83, '2024-11-15 10:00:00'),
(46, 'Library', 'Lighting', 7.64, '2024-11-15 10:00:00'),
(46, 'Library', 'HVAC', 11.46, '2024-11-15 10:00:00'),
(46, 'Office', 'Lighting', 9.55, '2024-11-15 10:00:00'),
(46, 'Gym', 'Equipment', 4.46, '2024-11-15 10:00:00'),
(46, 'Cafeteria', 'Refrigeration', 5.73, '2024-11-15 10:00:00'),
(46, 'Cafeteria', 'Appliances', 3.18, '2024-11-15 10:00:00'),
(46, 'Auditorium', 'Lighting', 4.46, '2024-11-15 10:00:00'),
(46, 'Laboratory', 'HVAC', 5.10, '2024-11-15 10:00:00'),
(46, 'Hallway', 'Lighting', 1.91, '2024-11-15 10:00:00'),
-- EnergyUsage for December 2024 (ID 47)
(47, 'Classroom', 'Lighting', 12.79, '2024-12-15 10:00:00'),
(47, 'Classroom', 'Computers', 15.70, '2024-12-15 10:00:00'),
(47, 'Classroom', 'HVAC', 20.35, '2024-12-15 10:00:00'),
(47, 'Library', 'Lighting', 8.14, '2024-12-15 10:00:00'),
(47, 'Library', 'HVAC', 11.63, '2024-12-15 10:00:00'),
(47, 'Office', 'Lighting', 9.88, '2024-12-15 10:00:00'),
(47, 'Gym', 'Equipment', 5.23, '2024-12-15 10:00:00'),
(47, 'Cafeteria', 'Refrigeration', 5.81, '2024-12-15 10:00:00'),
(47, 'Cafeteria', 'Appliances', 3.49, '2024-12-15 10:00:00'),
(47, 'Auditorium', 'Lighting', 4.65, '2024-12-15 10:00:00'),
(47, 'Laboratory', 'HVAC', 5.81, '2024-12-15 10:00:00'),
(47, 'Hallway', 'Lighting', 2.33, '2024-12-15 10:00:00')

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

    -- School 1 Data for 2025
    (1, 0.8, '2025-01-31 12:00:00'),
    (1, 0.7, '2025-02-28 12:00:00'),
    (1, 0.9, '2025-03-31 12:00:00'),
    (1, 0.8, '2025-04-30 12:00:00'),
    (1, 1.0, '2025-05-31 12:00:00'),
    (1, 0.9, '2025-06-30 12:00:00'),
    (1, 1.1, '2025-07-31 12:00:00'),
    (1, 1.0, '2025-08-31 12:00:00'),
    (1, 1.2, '2025-09-30 12:00:00'),
    (1, 0.8, '2025-10-31 12:00:00'),
    (1, 0.9, '2025-11-30 12:00:00'),
    (1, 1.0, '2025-12-31 12:00:00'),

    -- School 2 Data for 2024
    (2, 0.8, '2024-01-31 12:00:00'),
    (2, 0.9, '2024-02-28 12:00:00'),
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

    -- School 2 Data for 2025
    (2, 0.7, '2025-01-31 12:00:00'),
    (2, 0.6, '2025-02-28 12:00:00'),
    (2, 0.8, '2025-03-31 12:00:00'),
    (2, 0.9, '2025-04-30 12:00:00'),
    (2, 0.7, '2025-05-31 12:00:00'),
    (2, 0.8, '2025-06-30 12:00:00'),
    (2, 1.0, '2025-07-31 12:00:00'),
    (2, 0.9, '2025-08-31 12:00:00'),
    (2, 1.1, '2025-09-30 12:00:00'),
    (2, 0.7, '2025-10-31 12:00:00'),
    (2, 0.6, '2025-11-30 12:00:00'),
    (2, 1.0, '2025-12-31 12:00:00'),

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

    -- School 3 Data for 2025
    (3, 0.9, '2025-01-31 12:00:00'),
    (3, 1.0, '2025-02-28 12:00:00'),
    (3, 1.1, '2025-03-31 12:00:00'),
    (3, 0.9, '2025-04-30 12:00:00'),
    (3, 0.8, '2025-05-31 12:00:00'),
    (3, 1.0, '2025-06-30 12:00:00'),
    (3, 1.1, '2025-07-31 12:00:00'),
    (3, 0.9, '2025-08-31 12:00:00'),
    (3, 1.0, '2025-09-30 12:00:00'),
    (3, 1.1, '2025-10-31 12:00:00'),
    (3, 1.2, '2025-11-30 12:00:00'),
    (3, 1.0, '2025-12-31 12:00:00'),

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

    -- School 4 Data for 2025
    (4, 1.0, '2025-01-31 12:00:00'),
    (4, 0.8, '2025-02-28 12:00:00'),
    (4, 1.0, '2025-03-31 12:00:00'),
    (4, 0.9, '2025-04-30 12:00:00'),
    (4, 0.8, '2025-05-31 12:00:00'),
    (4, 0.9, '2025-06-30 12:00:00'),
    (4, 1.0, '2025-07-31 12:00:00'),
    (4, 0.9, '2025-08-31 12:00:00'),
    (4, 1.1, '2025-09-30 12:00:00'),
    (4, 0.8, '2025-10-31 12:00:00'),
    (4, 1.0, '2025-11-30 12:00:00'),
    (4, 1.1, '2025-12-31 12:00:00'),

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

    -- School 5 Data for 2025
    (5, 0.9, '2025-01-31 12:00:00'),
    (5, 0.8, '2025-02-28 12:00:00'),
    (5, 0.8, '2025-03-31 12:00:00'),
    (5, 1.0, '2025-04-30 12:00:00'),
    (5, 0.9, '2025-05-31 12:00:00'),
    (5, 1.0, '2025-06-30 12:00:00'),
    (5, 0.9, '2025-07-31 12:00:00'),
    (5, 0.8, '2025-08-31 12:00:00'),
    (5, 1.1, '2025-09-30 12:00:00'),
    (5, 0.9, '2025-10-31 12:00:00'),
    (5, 0.8, '2025-11-30 12:00:00'),
    (5, 1.0, '2025-12-31 12:00:00'),

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

    -- School 6 Data for 2025
    (6, 1.0, '2025-01-31 12:00:00'),
    (6, 1.1, '2025-02-28 12:00:00'),
    (6, 1.0, '2025-03-31 12:00:00'),
    (6, 0.9, '2025-04-30 12:00:00'),
    (6, 1.0, '2025-05-31 12:00:00'),
    (6, 1.2, '2025-06-30 12:00:00'),
    (6, 0.9, '2025-07-31 12:00:00'),
    (6, 1.0, '2025-08-31 12:00:00'),
    (6, 1.1, '2025-09-30 12:00:00'),
    (6, 0.9, '2025-10-31 12:00:00'),
    (6, 1.0, '2025-11-30 12:00:00'),
    (6, 1.2, '2025-12-31 12:00:00'),

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

    -- School 7 Data for 2025
    (7, 0.8, '2025-01-31 12:00:00'),
    (7, 0.9, '2025-02-28 12:00:00'),
    (7, 1.0, '2025-03-31 12:00:00'),
    (7, 1.1, '2025-04-30 12:00:00'),
    (7, 0.9, '2025-05-31 12:00:00'),
    (7, 1.0, '2025-06-30 12:00:00'),
    (7, 0.9, '2025-07-31 12:00:00'),
    (7, 1.0, '2025-08-31 12:00:00'),
    (7, 1.1, '2025-09-30 12:00:00'),
    (7, 0.9, '2025-10-31 12:00:00'),
    (7, 1.0, '2025-11-30 12:00:00'),
    (7, 1.2, '2025-12-31 12:00:00'),


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

    -- School 8 Data for 2025
    (8, 0.9, '2025-01-31 12:00:00'),
    (8, 1.0, '2025-02-28 12:00:00'),
    (8, 1.0, '2025-03-31 12:00:00'),
    (8, 1.1, '2025-04-30 12:00:00'),
    (8, 1.0, '2025-05-31 12:00:00'),
    (8, 1.2, '2025-06-30 12:00:00'),
    (8, 0.9, '2025-07-31 12:00:00'),
    (8, 1.0, '2025-08-31 12:00:00'),
    (8, 1.1, '2025-09-30 12:00:00'),
    (8, 1.0, '2025-10-31 12:00:00'),
    (8, 1.1, '2025-11-30 12:00:00'),
    (8, 1.2, '2025-12-31 12:00:00'),

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

    -- School 9 Data for 2025
    (9, 0.9, '2025-01-31 12:00:00'),
    (9, 0.8, '2025-02-28 12:00:00'),
    (9, 0.9, '2025-03-31 12:00:00'),
    (9, 1.0, '2025-04-30 12:00:00'),
    (9, 1.1, '2025-05-31 12:00:00'),
    (9, 1.0, '2025-06-30 12:00:00'),
    (9, 1.0, '2025-07-31 12:00:00'),
    (9, 1.1, '2025-08-31 12:00:00'),
    (9, 1.2, '2025-09-30 12:00:00'),
    (9, 1.0, '2025-10-31 12:00:00'),
    (9, 1.1, '2025-11-30 12:00:00'),
    (9, 1.2, '2025-12-31 12:00:00'),

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

    -- School 10 Data for 2025
    (10, 0.9, '2025-01-31 12:00:00'),
    (10, 0.8, '2025-02-28 12:00:00'),
    (10, 0.9, '2025-03-31 12:00:00'),
    (10, 1.0, '2025-04-30 12:00:00'),
    (10, 1.1, '2025-05-31 12:00:00'),
    (10, 1.0, '2025-06-30 12:00:00'),
    (10, 1.0, '2025-07-31 12:00:00'),
    (10, 1.1, '2025-08-31 12:00:00'),
    (10, 1.0, '2025-09-30 12:00:00'),
    (10, 1.1, '2025-10-31 12:00:00'),
    (10, 1.2, '2025-11-30 12:00:00'),
    (10, 1.0, '2025-12-31 12:00:00'),

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

INSERT INTO Achievements (name, category, description, target_value, points)
VALUES
('Recycler', 'Eco-Friendly Habits', 'Recycle 10 bottles in a week', 10, 20),
('Knowledgable', 'Eco-Friendly Habits', 'Attempt 5 GreenCampus Quizzes', 5, 20),
('Perfect Score', 'Eco-Friendly Habits', 'Get 100% on any GreenCampus Quiz', 1, 20),
('Clean Campus Crusader', 'Community Contributions', 'Participate in 3 campus clean-up campaigns', 3, 20),
('Campaign Master', 'Community Contributions', 'Sign up and complete any GreenCampus sustainability campaign', 1, 20),
('Light It Right', 'Energy & Resource Efficiency', 'Turn off lights in unused rooms 10 times in a week', 10, 20);

INSERT INTO StudentAchievements (student_id, achievement_id, progress, completed)
VALUES
(11, 1, 7, 0),
(11, 2, 4, 0),
(11, 3, 1, 1),
(11, 4, 2, 0),
(11, 5, 1, 1),
(11, 6, 5, 0);

INSERT INTO Events (school_id, name, description, date, carbonfootprint_id, energyusage_id) 
VALUES 
(1, 'Graduation Day 2024', 'Annual graduation ceremony for the class of 2024', '2024-11-30 12:00:00', 11, 47),
(1, 'Freshman Orientation 2024', 'Welcome orientation for new students', '2024-01-31 12:00:00', 1, 37),
(1, 'Sports Carnival 2024', 'Annual school sports carnival and field day', '2024-08-31 12:00:00', 8, 44);

-- Insert campaigns into the Campaigns table with a start_date before 2025
INSERT INTO Campaigns (school_id, name, description, image, start_date, points) 
VALUES 
(1, 'Recycle Right', 'Encourage students to sort and recycle waste properly. Aiming to increase recycling rates within the school.', NULL, '2024-09-15', 3),
(1, 'Turn Off Classroom Lights', 'Promote energy conservation by ensuring that classroom lights are turned off when not in use.', NULL, '2024-10-01', 4),
(1, 'Plant a Green Patch', 'Involve students in planting a small garden or green patch within the school compound to improve air quality and aesthetics.', NULL, '2024-11-20', 5);

update campaigns set image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAITAyADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDIFO700U6vSZzARTaf1FMIpAJS0UUwCiiloASilpKACilooATFFLRQAlLS0lABRS4oxQAlFLiigBKWjFFABRRiloASilooEFFFLQAmKKWigBKKWigBKWiigAxRiiloASilooASilooASilooGFFFFABRilooAAKKWkoEFJS0UAJiilooATFFOxRigBMUmKdRigBKBS4ooAKKWimAmKMUuKKACkpcUuKAEoxTsUoFK4DcUYp1FAABQaKCKBjcUUuKKYhMUYp1FACYpcUUtAABRilFFIYmKTFLRTEJijFLRQAmKKWjFACUUtFABRS0UAJiilxRigBKWlooATFFLRQAlGKWigBKXFFLQAmKMUtFAFCnDpSUUh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'
where id = 3;
update campaigns set image = 'data:image/jpeg;base64,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'
where id = 2;

update campaigns set image = 'data:image/jpeg;base64,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'
where id = 1;

INSERT INTO CampaignStudents (campaign_id, student_id)
VALUES
(1, 11),
(1, 12),
(1, 13),
(2, 14);
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