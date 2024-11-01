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

    static toSchoolObj(row){
        return new School(row.id, row.school_name, row.description, row.principal_id)
    }

    static async query(queryString, params){
        //queryString is the query to run
        //params is a dictionary for the parameters, key: sql param, value: value to pass

        //connect to database
        const connection = await sql.connect(dbConfig); 
        const request = connection.request();

        //deal with parameters
        //iterate through params and apply the input
        if (params){
            for (const [key, value] of Object.entries(params)) {
                request.input(key, value)
            }
        }
        const result = await request.query(queryString); //execute query and store result

        connection.close(); //close connection
        return result
    }

    static async exceptSelectQuery(columnExclude, queryString, params){
        //first we load the data into a temp table
        let sql = `
        SELECT * INTO #TempTable
        FROM (${queryString}) AS a
        `
        //then drop the columns from said temp table
        columnExclude.forEach(e => {
            sql += `
                ALTER TABLE #TempTable
                DROP COLUMN ${e}
                `
        });
        // Get results
        sql += "SELECT * FROM #TempTable"
        //run the query
        const result = await this.query(sql,params)
        //Delete the temp table
        await this.query("IF OBJECT_ID('#TempTable', 'U') IS NOT NULL DROP TABLE #TempTable")
        return result
    }

    static async getAllSchools() {
        //get all users excluding the password and email
        const result  = (await this.query("SELECT * FROM Schools")).recordset
        
        //if there is result array is blank, return null
        //else, map it into the user obj
        return result.length ? result.map((x) => this.toSchoolObj(x)) : null
    }

    static async getSchoolById(id) {
        //assign sql params to their respective values
        const params = {"id": id}
         //get first user from database that matches id and exclude the password
        const result = (await this.query("SELECT * FROM Schools WHERE id = @id", params)).recordset[0]
        //return null if no user found
        return result ? this.toSchoolObj(result) : null
    }

    static async getSchoolByStudentId(id) {
        const params = {"studentid": id}
        const query = `
        SELECT * from s
        FROM Schools s 
        INNER JOIN Users u ON s.id = u.school_id
        WHERE u.school_id = @studentid;`
         //get first user from database that matches id and exclude the password
        const result = (await this.query(query, params)).recordset[0]
        //return null if no user found
        return result ? this.toSchoolObj(result) : null
    }

    static async getSchoolsByName(name) {
        const params = { "name": `%${name}%` };
        const result = (await this.query(
            "SELECT * FROM Schools WHERE school_name LIKE @name", params
        )).recordset;
        return result.length ? result.map((x) => this.toSchoolObj(x)) : null;
    }
}

module.exports = School;
