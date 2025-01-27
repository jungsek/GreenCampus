//for students achievement progress
const sql = require("mssql")
const dbConfig = require("../database/dbConfig")


class studentAchievement {
    constructor(id, student_id, achievement_id, progress, completed) {
        this.id = id;
        this.student_id = student_id;
        this.achievement_id = achievement_id;
        this.progress = progress;
        this.completed = completed;
    }

    static tostudentAchievementObj(row) {
        return new studentAchievement(
            row.id,
            row.student_id,
            row.achievement_id,
            row.progress,
            row.completed
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

    static async getAllstudentAchievements() {
        const result = (await this.query("SELECT * FROM StudentAchievements")).recordset;
        return result.length ? result.map((x) => this.tostudentAchievementObj(x)) : null;
    }

    static async getstudentAchievementById(id){
        const params = {"student_id": id}
        const result = (await this.query(
            "SELECT * FROM StudentAchievements WHERE student_id = @student_id", 
            params
        )).recordset
        return result ? this.tostudentAchievementObj(result) : null
    }

    static async getstudentAchievementByAchievementId(id){
        const params = {"id": id}
        const result = (await this.query(
            "SELECT * FROM StudentAchievements WHERE achievement_id = @achievement_id",
            params
        )).recordset
        return result ? this.tostudentAchievementObj(result) : null
    }

    static async createAchievement(newAchievementData){ {
        const params = {
            "id": newAchievementData.id,
            "student_id": newAchievementData.student_id,
            "achievement_id": newAchievementData.achievement_id,
            "progress": newAchievementData.progress,
            "completed": newAchievementData.completed
        }
        const result = await this.query(`
            INSERT INTO StudentAchievements (student_id, achievement_id, progress, completed)
            VALUES (@student_id, @achievement_id, @progress, @completed);
            SELECT SCOPE_IDENTITY() AS id;
        `, params)
        const newId = result.recordset[0].id
        return await this.getstudentAchievementById(newId)
        }
    }

    static async updateStudentAchievement(id, newAchievementData) {
        const params = {
            "id": id,
            "student_id": newAchievementData.student_id,
            "achievement_id": newAchievementData.achievement_id,
            "progress": newAchievementData.progress,
            "completed": newAchievementData.completed
        }
        await this.query(`
            UPDATE StudentAchievements
            SET student_id = @student_id, achievement_id = @achievement_id, progress = @progress, completed = @completed
            WHERE id = @id
        `, params)
        return await this.getstudentAchievementById(id)
    }

    static async deletestudentAchievement(id) {
        const params = {"id": id}
        await this.query("DELETE FROM StudentAchievements WHERE id = @id", params)
    }
}

module.exports = studentAchievement;