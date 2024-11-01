const sql = require("mssql");
const dbConfig = require("../database/dbConfig");

class Report {
    constructor(id, school_id, year, content) {
        this.id = id;
        this.school_id = school_id;
        this.year = year;
        this.content = content;
    }

    static toReportObj(row) {
        return {
            id: row.id,
            school_id: row.school_id,
            year: row.year,
            content: row.content,
            created_at: row.created_at,
            school_name: row.school_name 
        };
    }
    
    static async query(queryString, params) {
        const connection = await sql.connect(dbConfig);
        const request = connection.request();

        if (params) {
            for (const [key, value] of Object.entries(params)) {
                request.input(key, value);
            }
        }
        const result = await request.query(queryString);
        connection.close();
        return result;
    }

    static async getAllReports() {
        const result = (await this.query(`
            SELECT Reports.*, Schools.school_name
            FROM Reports
            JOIN Schools ON Reports.school_id = Schools.id
            ORDER BY created_at DESC
        `)).recordset;
        return result.length ? result.map((x) => this.toReportObj(x)) : [];
    }
    

    static async getReportById(id) {
        const params = { "id": id };
        const result = (await this.query(`
            SELECT Reports.*, Schools.school_name
            FROM Reports
            JOIN Schools ON Reports.school_id = Schools.id
            WHERE Reports.id = @id
        `, params)).recordset[0];
        return result ? this.toReportObj(result) : null;
    }
    

    static async getReportsBySchool(schoolId) {
        const params = { "school_id": schoolId };
        const result = (await this.query("SELECT * FROM Reports WHERE school_id = @school_id ORDER BY year DESC", params)).recordset;
        return result.length ? result.map((x) => this.toReportObj(x)) : null;
    }

    static async getReportBySchoolAndYear(schoolId, year) {
        const params = { "school_id": schoolId, "year": year };
        const result = (await this.query("SELECT * FROM Reports WHERE school_id = @school_id AND year = @year", params)).recordset[0];
        return result ? this.toReportObj(result) : null;
    }

    static async createReport(school_id, year, content) {
        const params = {
            "school_id": school_id,
            "year": year,
            "content": content
        };
        try {
            const result = await this.query(`
                INSERT INTO Reports (school_id, year, content)
                VALUES (@school_id, @year, @content);
                SELECT SCOPE_IDENTITY() AS id;
            `, params);
            const newId = result.recordset[0].id;
            return await this.getReportById(newId);
        } catch (error) {
            console.error('Error creating report:', error);
            throw error;
        }
    }

    static async updateReport(id, content) {
        const params = {
            "id": id,
            "content": content
        };
        await this.query(`
            UPDATE Reports
            SET content = @content
            WHERE id = @id
        `, params);
        return await this.getReportById(id);
    }

    static async deleteReport(id) {
        const params = { "id": id };
        await this.query("DELETE FROM Reports WHERE id = @id", params);
    }
}

module.exports = Report;
