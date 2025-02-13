
const sql = require("mssql")
const dbConfig = require("../database/dbConfig")

class Campaign{
    constructor(id, school_id, name, start_date, description, image, points) {
        this.id = id;
        this.school_id = school_id;
        this.name = name;
        this.start_date = start_date;
        this.description = description;
        this.image = image;
        this.points = points;
    }

    static toCampaignObj(row) {
        return new Campaign(
            row.id, 
            row.school_id, 
            row.name,
            row.start_date,
            row.description,
            row.image,
            row.points
        )
    }

    static async query(queryString, params) {
        const connection = await sql.connect(dbConfig);
        const request = connection.request();

        if (params) {
            for (const [key, value] of Object.entries(params)) {
                request.input(key, value)
            }
        }
        const result = await request.query(queryString);

        connection.close();
        return result
    }

    static async exceptSelectQuery(columnExclude, queryString, params) {
        let sql = `
        SELECT * INTO #TempTable
        FROM (${queryString}) AS a
        `
        columnExclude.forEach(e => {
            sql += `
                ALTER TABLE #TempTable
                DROP COLUMN ${e}
                `
        });
        sql += "SELECT * FROM #TempTable"
        const result = await this.query(sql, params)
        await this.query("IF OBJECT_ID('#TempTable', 'U') IS NOT NULL DROP TABLE #TempTable")
        return result
    }

    static async getAllCampaigns() {
        const result = (await this.query("SELECT * FROM Campaigns ORDER BY school_id ASC")).recordset
        return result.length ? result.map((x) => this.toCampaignObj(x)) : null
    }

    static async getCampaignById(id){
        const params = {"id": id}
        const result = (await this.query(
            "SELECT * FROM Campaigns WHERE id = @id", 
            params
        )).recordset
        return result ? this.toCampaignObj(result) : null
    }

    static async getCampaignsBySchool(school_id) {
        const params = {"school_id": school_id}
        const result = (await this.query(
            "SELECT * FROM Campaigns WHERE school_id = @school_id", 
            params
        )).recordset
        return result.length ? result.map((x) => this.toCampaignObj(x)) : null
    }

    static async getSignedUpCampaignsByStudent(student_id){
        const params = {"student_id": student_id}
        const result = (await this.query("SELECT Campaigns.id, Campaigns.school_id, Campaigns.name, Campaigns.description, Campaigns.image, Campaigns.points FROM Campaigns INNER JOIN CampaignStudents on CampaignStudents.campaign_id = Campaigns.id WHERE CampaignStudents.student_id = @student_id", params)).recordset
        return result.length ? result.map((x) => this.toCampaignObj(x)) : null
    }

    static async getCampaignSignUps(id){
        const params ={"id": id}
        const result = (await this.query(`SELECT COUNT(*) AS student_count
        FROM CampaignStudents
        WHERE campaign_id = @id`,params)).recordset[0]
        return result.student_count
    }

    static async createCampaign(newCampaignData) {
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const params = {
            "school_id": newCampaignData.school_id,
            "name": newCampaignData.name,
            "start_date": formatDate(new Date()),
            "description": newCampaignData.description,
            "image": newCampaignData.image,
            "points": newCampaignData.points,
        }
        const result = await this.query(`
            INSERT INTO Campaigns (school_id, name, description, start_date, image, points)
            VALUES (@school_id, @name, @description, @start_date, @image, @points);
            SELECT SCOPE_IDENTITY() AS id;
        `, params)
        const newId = result.recordset[0].id
        return await this.getCampaignById(newId)
    }

    static async updateCampaign(id, newCampaignData) {
        const params = {
            "id": newCampaignData.id,
            "school_id": newCampaignData.school_id,
            "name": newCampaignData.name,
            "start_date": newCampaignData.start_date,
            "description": newCampaignData.description,
            "image": newCampaignData.image,
            "points": newCampaignData.points,
        }
        await this.query(`
            UPDATE Campaigns
            SET name = @name, description = @description, image = @image, points = @points
            WHERE id = @id
        `, params)
        return await this.getCampaignById(id)
    }

    static async deleteCampaign(id) {
        const params = {"id": id}
        await this.query("DELETE FROM Campaigns WHERE id = @id", params)
    }

    static async signUpStudentForCampaign(student_id, id) {
        const params = {"student_id": student_id,
                        "id": id}
        await this.query("INSERT INTO CampaignStudents(student_id, campaign_id) VALUES (@student_id, @id);", params)
    }
}

module.exports = Campaign;