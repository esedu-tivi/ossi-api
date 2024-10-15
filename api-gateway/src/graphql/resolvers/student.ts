import { pool } from "../../repositories/postgres-pool.js"
import { Resolver } from "../resolver.js"

const studyingQualification: Resolver<{ id: number }, null> = async (parent, _, context) => {
    const queryResponse = await pool.query("SELECT qualifications.eperuste_id as id, qualifications.name as name FROM qualifications INNER JOIN students ON qualifications.eperuste_id = students.qualification_id WHERE students.user_id = $1", [parent.id])
    
    return queryResponse.rows[0]
}

const studyingQualificationTitle: Resolver<{ id: number }, null> = (parent, _, context) => {
    return null
}

export const Student = {
    studyingQualification,
    studyingQualificationTitle
}