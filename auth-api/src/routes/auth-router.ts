import express from "express";
import jwt from "jsonwebtoken";
import prisma, { enumUsersScope, type StudentGroup } from "prisma-orm"
import { HttpError } from "../classes/HttpError.js";
import {
    createMicrosoftKeyResolver,
    getIdTokenEmail,
    resolveUserScope,
    verifyIdToken,
    type IdTokenPayload,
    type SigningKeyResolver,
} from "../utils/idToken.js";

const router = express.Router();

let keyResolver: SigningKeyResolver | null = null;
const getKeyResolver = () => keyResolver ??= createMicrosoftKeyResolver(process.env.MS_TENANT_ID ?? "");

router.post("/", async (req, res) => {
    try {
        // Verify before taking the table lock so the JWKS request does not block other logins.
        let idToken: IdTokenPayload;
        try {
            idToken = await verifyIdToken(req.body.idToken, {
                clientId: process.env.MS_CLIENT_ID ?? "",
                tenantId: process.env.MS_TENANT_ID ?? "",
            }, getKeyResolver());
        } catch (e) {
            console.log(e);
            throw new HttpError(401, "Error while verifying ID token, logged.")
        }

        const email = getIdTokenEmail(idToken);
        const userScope = email ? resolveUserScope(email) : null;
        if (!email || !userScope) {
            throw new HttpError(403, "Account is not allowed to use OSSI.")
        }

        const userData = await prisma.$transaction(async (transaction) => {

            await transaction.$queryRaw`LOCK TABLE "users" IN ACCESS EXCLUSIVE MODE`

            const isUserInDatabase = await transaction.user.findFirst({ where: { oid: idToken.oid } }) != null;

            if (!isUserInDatabase) {
                const createdUser = await transaction.user.create({
                    data: {
                        oid: idToken.oid,
                        isSetUp: false,
                        firstName: idToken.given_name,
                        lastName: idToken.family_name,
                        email,
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

            const profile = userScope == enumUsersScope.STUDENT
                ? await transaction.student.findUnique({ where: { userId: user.id } })
                : await transaction.teacher.findUnique({ where: { userId: user.id } });

            const userData = {
                id: user.id,
                oid: user.oid,
                email: user.email,
                isSetUp: user.isSetUp,
                type: userScope === enumUsersScope.STUDENT ? "STUDENT" : "TEACHER",
                scope: userScope,
                profile
            };

            return userData
        });

        if (!userData) {
            throw new HttpError(400)
        }

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
        return res.json({
            status: 500,
            success: false,
            message: "Login failed."
        })
    }
})

export const AuthRouter = router;
