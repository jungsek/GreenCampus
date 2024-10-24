//import sql stuff
const sql = require("mssql")
const dbConfig = require("../database/dbConfig")
const fs = require("fs");

class School{
    constructor(id, school_name, description, principal_id){
        this.id = id;
        this.school_name = school_name;
        this.description = description;
        this.principal_id = principal_id;
    }
}