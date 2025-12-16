import axios from "axios";
import express from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import prisma, { enumUsersScope, type StudentGroup } from "prisma-orm"
import { HttpError } from "../classes/HttpError.js";

interface IdTokenPayload extends JwtPayload {
    oid: string,
    given_name: string,
    family_name: string,
    jobTitle: string,
    upn: string,
}

async function getPemCertificate(idToken) {
    const jwks = (await axios.get("https://login.microsoftonline.com/common/discovery/keys")).data;

    const idTokenKid = jwt.decode(idToken, { complete: true }).header.kid;

    const jwksKey = jwks["keys"].find(key => key.kid == idTokenKid);

    return "-----BEGIN CERTIFICATE-----\n" + jwksKey.x5c[0] + "\n-----END CERTIFICATE-----";
}

const router = express.Router();

// intended for basic ossi login, job supervisor scopes should be created in a seperate endpoint?
router.post("/", async (req, res) => {
    try {
        const userData = await prisma.$transaction(async (transaction) => {

            // Prisma ORM do not have table lock functionality built-in, so need use raw query
            await transaction.$queryRaw`LOCK TABLE "users" IN ACCESS EXCLUSIVE MODE`

            let idToken: IdTokenPayload;
            try {
                const pem = await getPemCertificate(req.body.idToken);
                idToken = jwt.verify(req.body.idToken, pem, { algorithms: ["RS256"] }) as IdTokenPayload;
            } catch (e) {
                console.log(e);
                throw new HttpError(401, "Error while verifying ID token, logged.")
            }

            const isUserInDatabase = await transaction.user.findFirst({ where: { oid: idToken.oid } }) != null;
            const userScope = idToken.upn.endsWith("@esedulainen.fi") ? enumUsersScope.STUDENT : enumUsersScope.TEACHER;

            // create user and teacher or student rows for nonexistant user
            if (!isUserInDatabase) {
                const createdUser = await transaction.user.create({
                    data: {
                        oid: idToken.oid,
                        isSetUp: false,
                        firstName: idToken.given_name,
                        lastName: idToken.family_name,
                        email: idToken.upn,
                        phoneNumber: "",
                        scope: userScope,
                        archived: false,
                    }
                })

                if (userScope === enumUsersScope.STUDENT && createdUser) {
                    await transaction.student.create({
                        data: {
                            userId: createdUser.id,
                            qualificationCompletion: null,
                            qualificationTitleId: null,
                            qualificationId: null
                        }
                    })

                    let studentGroup: StudentGroup | null;

                    studentGroup = await transaction.studentGroup.findFirst({
                        where: { groupName: idToken.jobTitle }
                    })

                    if (!studentGroup) {
                        studentGroup = await transaction.studentGroup.create({
                            data: {
                                groupName: idToken.jobTitle
                            }
                        })
                    }
                    await transaction.student.update({
                        where: { userId: createdUser.id },
                        data: {
                            studentGroupId: studentGroup.id
                        }
                    })
                } else if (userScope === enumUsersScope.TEACHER) {
                    await transaction.teacher.create({
                        data: {
                            userId: createdUser.id,
                            teachingQualificationTitleId: null,
                            teachingQualificationId: null
                        }
                    })
                }
            }

            const user = await transaction.user.findFirst({ where: { oid: idToken.oid } });

            //Need use findUnique because we do not have findByPk() in the Prisma ORM
            const profile = userScope == enumUsersScope.STUDENT
                ? await transaction.student.findUnique({ where: { userId: user.id } })
                : await transaction.teacher.findUnique({ where: { userId: user.id } });

            const userData = {
                id: user.id,
                oid: user.oid,
                email: user.email,
                isSetUp: user.isSetUp,
                type: idToken.upn.endsWith("@esedulainen.fi") ? "STUDENT" : "TEACHER",
                scope: userScope,
                profile
            };

            return userData
        });

        //If Prisma ORM rollback transaction and we do not have userData
        if (!userData) {
            throw new HttpError(400)
        }

        // In Prisma ORM we do not need manually commit transaction, so we can return response
        res.json({
            status: 200,
            success: true,
            token: jwt.sign(userData, process.env.JWT_SECRET_KEY ?? "", {
                expiresIn: "1d"
            }),
        });
    }
    catch (error) {
        console.error(error)
        if (error instanceof HttpError) {
            if (error.message) {
                return res.json({
                    status: error.statusCode,
                    success: false,
                    message: error.message
                })
            }
            return res.json({
                status: error.statusCode,
                success: false
            })
        }
    }
})

export const AuthRouter = router;
