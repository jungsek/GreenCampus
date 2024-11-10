
const sql = require("mssql")
const dbConfig = require("../database/dbConfig")

class Goal {
    constructor(id, school_id, year, goal, metric, metric_value) {
        this.id = id;
        this.school_id = school_id;
        this.year = year;
        this.goal = goal;
        this.metric = metric;
        this.metric_value = metric_value;
    }

    static toGoalObj(row) {
        return new Goal(
            row.id, 
            row.school_id, 
            row.year,
            row.goal,
            row.metric,
            row.metric_value
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

    static async getAllGoals() {
        const result = (await this.query("SELECT * FROM Goals ORDER BY school_id ASC")).recordset
        return result.length ? result.map((x) => this.toGoalObj(x)) : null
    }

    static async getGoalById(id){
        const params = {"id": id}
        const result = (await this.query(
            "SELECT * FROM Goals WHERE id = @id", 
            params
        )).recordset
        return result ? this.toGoalObj(result) : null
    }

    static async getGoalsBySchool(school_id) {
        const params = {"school_id": school_id}
        const result = (await this.query(
            "SELECT * FROM Goals WHERE school_id = @school_id ORDER BY year ASC", 
            params
        )).recordset
        return result.length ? result.map((x) => this.toGoalObj(x)) : null
    }

    static async createGoal(newGoalData) {
        const params = {
            "school_id": newGoalData.school_id,
            "year": newGoalData.year,
            "goal": newGoalData.goal,
            "metric": newGoalData.metric,
            "metric_value": newGoalData.metric_value,
        }
        const result = await this.query(`
            INSERT INTO Goals (school_id, year, goal, metric, metric_value)
            VALUES (@school_id, @year, @goal, @metric, @metric_value);
            SELECT SCOPE_IDENTITY() AS id;
        `, params)
        const newId = result.recordset[0].id
        return await this.getGoalById(newId)
    }

    static async updateGoal(id, year, goal, metric, metric_value) {
        const params = {
            "id": id,
            "year": year,
            "goal": goal,
            "metric": metric,
            "metric_value": metric_value,
        }
        await this.query(`
            UPDATE Goals
            SET year = @year, goal = @goal, metric = @metric, metric_value = @metric_value
            WHERE id = @id
        `, params)
        return await this.getGoalById(id)
    }

    static async deleteGoal(id) {
        const params = {"id": id}
        await this.query("DELETE FROM Goals WHERE id = @id", params)
    }
}

module.exports = Goal;