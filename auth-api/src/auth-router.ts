import express, { json } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { pool } from "./postgres-pool.js";

const router = express.Router()

interface IdTokenPayload extends JwtPayload {
    oid: string,
    given_name: string,
    family_name: string,
    upn: string,
}

router.use(json())

router.post("/login", async (req, res) => { 
    try {
        console.log("Login attempt started");
        const idToken = jwt.decode(req.body.idToken) as IdTokenPayload
        console.log("Decoded idToken:", {
            name: `${idToken.given_name} ${idToken.family_name}`,
            email: idToken.upn
        });

        // Determine user scope based on email domain
        const userScope = idToken.upn.endsWith('@esedulainen.fi') 
            ? 'teacher' 
            : idToken.upn.endsWith('@esedu.fi') 
                ? 'student' 
                : null;

        console.log("Determined user scope:", userScope);

        if (!userScope) {
            console.error("Invalid email domain:", idToken.upn);
            return res.status(403).json({ error: 'Invalid email domain' });
        }

        // Begin transaction
        const client = await pool.connect();
        console.log("Database connection established");

        try {
            await client.query('BEGIN');
            console.log("Transaction started");

            // Use INSERT ... ON CONFLICT to handle race conditions
            const userResult = await client.query(
                `INSERT INTO users (first_name, last_name, email, phone_number, scope) 
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (email) DO UPDATE 
                 SET first_name = $1, last_name = $2
                 RETURNING id`,
                [idToken.given_name, idToken.family_name, idToken.upn, '', userScope]
            );
            
            const userId = userResult.rows[0].id;
            console.log("User operation result:", {
                id: userId,
                command: userResult.command,
                rowCount: userResult.rowCount
            });

            // Check if role record exists before creating
            if (userScope === 'teacher') {
                const existingTeacher = await client.query(
                    'SELECT user_id FROM teachers WHERE user_id = $1',
                    [userId]
                );
                console.log("Existing teacher check result:", {
                    found: existingTeacher.rows.length > 0,
                    userId
                });
                
                if (existingTeacher.rows.length === 0) {
                    console.log("Creating teacher record for user:", userId);
                    const teacherResult = await client.query(
                        'INSERT INTO teachers (user_id, teaching_qualification_id, teaching_qualification_title_id) VALUES ($1, $2, $3) RETURNING user_id',
                        [userId, 7861752, 10224]
                    );
                    console.log("Teacher record created:", {
                        userId: teacherResult.rows[0].user_id,
                        command: teacherResult.command,
                        rowCount: teacherResult.rowCount
                    });
                }
            } else {
                const existingStudent = await client.query(
                    'SELECT user_id FROM students WHERE user_id = $1',
                    [userId]
                );
                console.log("Existing student check result:", {
                    found: existingStudent.rows.length > 0,
                    userId
                });
                
                if (existingStudent.rows.length === 0) {
                    console.log("Creating student record for user:", userId);
                    const studentResult = await client.query(
                        'INSERT INTO students (user_id, group_id, qualification_title_id, qualification_id) VALUES ($1, $2, $3, $4) RETURNING user_id',
                        [userId, 'NEW', 10224, 7861752]
                    );
                    console.log("Student record created:", {
                        userId: studentResult.rows[0].user_id,
                        command: studentResult.command,
                        rowCount: studentResult.rowCount
                    });
                }
            }

            await client.query('COMMIT');
            console.log("Transaction committed successfully");

            const user = {
                id: userId,
                firstName: idToken.given_name,
                lastName: idToken.family_name,
                email: idToken.upn,
                scope: userScope
            };

            const token = jwt.sign(user, process.env.JWT_SECRET_KEY ?? "", {
                expiresIn: "1d"
            });

            console.log("Login successful for user:", {
                id: userId,
                email: idToken.upn,
                scope: userScope
            });

            res.json({ token, user });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Transaction failed:", error);
            throw error;
        } finally {
            client.release();
            console.log("Database connection released");
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export const AuthRouter = router;
