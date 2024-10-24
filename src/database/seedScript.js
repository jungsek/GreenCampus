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
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;

-- Create tables

CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(8) NOT NULL, CHECK (role = 'student' OR role = 'lecturer')
  );

`;

async function insertUsers(connection){
    //insert user info, completed courses and quiz results
    await connection.request().query(`
      INSERT INTO Users
      VALUES ('Toby', 'Dean', 'toby@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student');
      SELECT SCOPE_IDENTITY() AS id;
  
      INSERT INTO Users
      VALUES ('Sarah', 'Lee', 'sarah@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'student');
      SELECT SCOPE_IDENTITY() AS id;
  
      INSERT INTO Users
      VALUES ('George', 'Wilson', 'george@noom.com', '$2a$10$EOx5JueXvEFefFQQm63YC.v2SwPOyZMKqcPcXY9HAW253JijH3/IO', 'lecturer');
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