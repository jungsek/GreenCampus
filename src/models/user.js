//import sql stuff
const sql = require("mssql")
const dbConfig = require("../database/dbConfig")
const fs = require("fs");

class User {
    //setup user object
    constructor(id, first_name, last_name, email, role) {
      this.id = id
      this.first_name = first_name
      this.last_name = last_name
      this.email = email
      this.role = role
    }

    //pass the sql recordset in
    //returns a new user obj
    static toUserObj(row){
        return new User(row.id, row.first_name, row.last_name, row.email, row.role)
    }
    

    //execute a query and return the result
    //note: there is a need to create a new connection for every query, so this function will not accept multiple queries with queryString as an array
    //mssql seems to have a bug when running more than 1 query per connection, https://github.com/tediousjs/node-mssql/issues/138
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

    //query but we can choose what columns to exclude
    //only for select statements
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

    static async getAllUsers() {
        //get all users excluding the password and email
        const result  = (await this.exceptSelectQuery(["password","email"],"SELECT * FROM Users")).recordset
        
        //if there is result array is blank, return null
        //else, map it into the user obj
        return result.length ? result.map((x) => this.toUserObj(x)) : null
    }
  
    static async getUserById(id) {

        //assign sql params to their respective values
        const params = {"id": id}
         //get first user from database that matches id and exclude the password
        const result = (await this.exceptSelectQuery(["password","email"],"SELECT * FROM Users WHERE id = @id", params)).recordset[0]
        //return null if no user found
        return result ? this.toUserObj(result) : null
        
    }

    static async getPrivateUserById(id){
        //unlike getUserById, this function is only meant to be accessed by the logged in user
        //returns email, still exclude password
         //get first user from database that matches id and exclude the password
        const result = (await this.exceptSelectQuery(["password"],"SELECT * FROM Users WHERE id = @id", {"id": id})).recordset[0]
        //return null if no user found
        return result ? this.toUserObj(result) : null
    }


    //get a user by their email
    static async getUserByEmail(email){
        //assign sql params to their respective values
        const params = {"email": email}
         //get first user from database that matches id
        const result = (await this.query("SELECT * FROM Users WHERE email = @email", params)).recordset[0]
        //return null if no user found
        return result ? result : null
    }

    static async createUser(user) {
        //accept a object and add it to the database
        //join_date is excluded (it will be added with SQL)
        const params = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "password": user.password,
            "role": user.role
        }
        //add user data
        const result = await this.query("INSERT INTO Users (first_name, last_name, email, password, role) VALUES (@first_name, @last_name, @email, @password, @role); SELECT SCOPE_IDENTITY() AS id;", params)

        
        //get the newly-created user
        const newUser = await this.getUserById(result.recordset[0].id)

        //return the newly created user
        return newUser
    }

    static async updateUser(id,user){
        //accept a object and add it to the database
        const params = {
            "id": id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        }
        await this.query("UPDATE Users SET first_name = @first_name, last_name = @last_name, email = @email WHERE id = @id", params)

        //return the updated user
        return this.getUserById(id)
    }

    static async updatePassword(id, newPassword){
        await this.query("UPDATE Users SET password = @password WHERE id = @id", {"id":id,"password":newPassword})
        //return the updated hashed password
        return {password: newPassword}
    }

    static async searchUsers(q){
        //return the account data + profile picture
        //check if name (first name + last name), or job title matches
        const query = `
            SELECT * FROM Users INNER JOIN Profile_Pictures ON Profile_Pictures.user_id = Users.id 
            WHERE CONCAT(first_name, ' ', last_name) LIKE '%${q}%'
            OR job_title LIKE '%${q}%'
            `
        //omit password and email for privacy reasons
        //omit user_id since it is redundant
        const result = (await this.exceptSelectQuery(["password","email","user_id"],query)).recordset
        //no need to check if result is empty, returning an empty array is fine
        return result

    }

    static async getStudentPoints(id) {
        const params = {"id": id}
        const query = `SELECT Points FROM Campaigns c INNER JOIN CampaignStudents cs on cs.campaign_id = c.id WHERE cs.student_id = @id`

        const result = (await this.query(query, params)).recordset
        let total = 0;
        result.forEach(element => {
            total += element.points;
        });
        return total;
    }
    static async getPrincipalBySchoolId(schoolid) {
        const params = {"schoolid": schoolid}
        const query = `
        SELECT * from u
        FROM Users u
        INNER JOIN Schools s ON u.id = s.principal_id
        WHERE s.id = @schoolid;`
        
        const result = (await this.query(query, params)).recordset[0]
        return result ? result : null;
    }
}
  
  module.exports = User