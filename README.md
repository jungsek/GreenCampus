# GreenCampus
GreenCampus is a fullstack web application aiming to decrease carbon emissions from schools

**Important** 
All of the project files are in the src directory. Make sure to cd into it before running any commands

## Project Setup

### Installing node modules
run ``npm install``

### Database configuration

Create src/database/dbConfig.js with the following content: <br />
```js
module.exports = {
    user: "sa", 
    password: "sa", 
    server: "localhost",
    database: "fsdp-assg",
    trustServerCertificate: true,
    options: {
      port: 1433, 
      connectionTimeout: 60000, 
    },
  }
```
You can change the content of the file to match your settings or set up the sql server to match its content

### Database setup
run ``npm run seed`` <br />
You can also rerun this command to reset the database to its seeded form <br />
The sql to seed the database can be found in src/database/seedScript.js <br />

##Setup .env file
in the .env file, change the contents to include the keys
will be provided via PM

### Starting server
``npm install``
``npm start`` (for nodemon) <br />
or <br />
``node app.js``

