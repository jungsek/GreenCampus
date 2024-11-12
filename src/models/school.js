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

    static async getSchoolsCarbonFootprintByCurrentAndPreviousYear() {
        const query = `
            SELECT 
                s.id AS school_id,
                s.school_name,
                -- Total carbon footprint for the current year
                SUM(CASE WHEN YEAR(cf.timestamp) = YEAR(GETDATE()) THEN cf.total_carbon_tons ELSE 0 END) AS current_year_carbon_footprint,
                -- Total carbon footprint for the previous year
                SUM(CASE WHEN YEAR(cf.timestamp) = YEAR(DATEADD(YEAR, -1, GETDATE())) THEN cf.total_carbon_tons ELSE 0 END) AS previous_year_carbon_footprint
            FROM 
                Schools s
            LEFT JOIN 
                CarbonFootprint cf ON s.id = cf.school_id
            WHERE
                -- Filter records for the current and previous years
                YEAR(cf.timestamp) = YEAR(GETDATE()) 
                OR 
                YEAR(cf.timestamp) = YEAR(DATEADD(YEAR, -1, GETDATE()))
            GROUP BY 
                s.id, s.school_name
            ORDER BY 
                current_year_carbon_footprint ASC;
        `;

        const result = (await this.query(query)).recordset;
        return result.length ? result : null;
    }

    static async getSchoolsCarbonFootprintByCurrentAndPreviousMonth() { 
        const query = `
            SELECT 
                s.id AS school_id,
                s.school_name,
                -- Total carbon footprint for the current month
                SUM(CASE WHEN YEAR(cf.timestamp) = YEAR(GETDATE())
                    AND MONTH(cf.timestamp) = MONTH(GETDATE()) THEN cf.total_carbon_tons ELSE 0 END) AS current_month_carbon_footprint,
                -- Total carbon footprint for the previous month
                SUM(CASE WHEN YEAR(cf.timestamp) = YEAR(DATEADD(MONTH, -1, GETDATE())) 
                    AND MONTH(cf.timestamp) = MONTH(DATEADD(MONTH, -1, GETDATE())) THEN cf.total_carbon_tons ELSE 0 END) AS previous_month_carbon_footprint
            FROM 
                Schools s
            LEFT JOIN 
                CarbonFootprint cf ON s.id = cf.school_id
            WHERE
                -- Filter for records that belong to either the current or the previous month
                (YEAR(cf.timestamp) = YEAR(GETDATE()) AND MONTH(cf.timestamp) = MONTH(GETDATE())) 
                OR 
                (YEAR(cf.timestamp) = YEAR(DATEADD(MONTH, -1, GETDATE())) AND MONTH(cf.timestamp) = MONTH(DATEADD(MONTH, -1, GETDATE())))
            GROUP BY 
                s.id, s.school_name
            ORDER BY 
                current_month_carbon_footprint ASC;

        `;
    
        const result = (await this.query(query)).recordset;
        return result.length ? result : null;
    }

    static async getSchoolsEnergyUsageByCurrentAndPreviousYear() { 
        const query = `
            SELECT 
                s.id AS school_id,
                s.school_name,
                -- Total energy usage for the current year
                SUM(CASE WHEN YEAR(eu.timestamp) = YEAR(GETDATE()) THEN eu.energy_kwh ELSE 0 END) AS current_year_energy_usage,
                -- Total energy usage for the previous year
                SUM(CASE WHEN YEAR(eu.timestamp) = YEAR(DATEADD(YEAR, -1, GETDATE())) THEN eu.energy_kwh ELSE 0 END) AS previous_year_energy_usage
            FROM 
                Schools s
            LEFT JOIN 
                EnergyUsage eu ON s.id = eu.school_id
            WHERE
                -- Filter for energy usage in either the current year or the previous year
                (YEAR(eu.timestamp) = YEAR(GETDATE()) OR YEAR(eu.timestamp) = YEAR(DATEADD(YEAR, -1, GETDATE())))
            GROUP BY 
                s.id, s.school_name
            ORDER BY 
                current_year_energy_usage DESC;  
        `;
    
        const result = (await this.query(query)).recordset;
        return result.length ? result : null;
    }

    static async getSchoolsEnergyUsageByCurrentAndPreviousMonth() { 
        const query = `
            SELECT 
            s.id AS school_id,
            s.school_name,
            SUM(CASE 
                    WHEN MONTH(eu.timestamp) = MONTH(GETDATE()) AND YEAR(eu.timestamp) = YEAR(GETDATE()) 
                    THEN eu.energy_kwh 
                    ELSE 0 
                END) AS current_month_energy_usage,
            SUM(CASE 
                    WHEN MONTH(eu.timestamp) = MONTH(DATEADD(MONTH, -1, GETDATE())) 
                         AND YEAR(eu.timestamp) = YEAR(DATEADD(MONTH, -1, GETDATE())) 
                    THEN eu.energy_kwh 
                    ELSE 0 
                END) AS previous_month_energy_usage
            FROM 
                Schools s
            INNER JOIN 
                EnergyUsage eu ON s.id = eu.school_id
            GROUP BY 
                s.id, s.school_name
            ORDER BY 
                current_month_energy_usage ASC;
        `;
    
        const result = (await this.query(query)).recordset;
        return result.length ? result : null;
    }
}

module.exports = School;
