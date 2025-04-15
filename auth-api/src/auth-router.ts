import express, { json } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sequelize, Student, Teacher, User, UserAuthorityScope } from "sequelize-models";

const router = express.Router()

interface IdTokenPayload extends JwtPayload {
    oid: string,
    given_name: string,
    family_name: string,
    jobTitle: string,
    upn: string,
}

router.use(json())

// intended for basic ossi login, job supervisor scopes should be created in a seperate endpoint?
router.post("/login", async (req, res) => {
    const transaction = await sequelize.transaction();
    await sequelize.query("LOCK TABLE \"users\" IN ACCESS EXCLUSIVE MODE", { transaction });

    const idToken = jwt.decode(req.body.idToken) as IdTokenPayload;

    // idToken verification
    // if (idTokenIsNotValid) { return res.status(401) }

    const isUserInDatabase = await User.findOne({ where: { oid: idToken.oid }, transaction }) != null;
    const userScope = idToken.upn.endsWith("@esedulainen.fi") ? UserAuthorityScope.Student : UserAuthorityScope.Teacher;
    
    // create user and teacher or student rows for nonexistant user
    if (!isUserInDatabase) {
        const createdUser = await User.create({
            oid: idToken.oid,
            firstName: idToken.given_name,
            lastName: idToken.family_name,
            email: idToken.upn,
            phoneNumber: "",
            scope: userScope,
            archived: false,
        }, { transaction });

        if (userScope == UserAuthorityScope.Student) {
            await Student.create({
                id: createdUser.id,
                groupId: idToken.jobTitle,
                qualificationCompletion: null,
                qualificationTitleId: 0, // TODO
                qualificationId: 0
            }, { transaction });
        } else if (userScope == UserAuthorityScope.Teacher) {
            await Teacher.create({
                id: createdUser.id,
                teachingQualificationTitleId: null,
                teachingQualificationId: 0 // TODO
            }, { transaction });
        }
    }

    const user = await User.findOne({ where: { oid: idToken.oid }, transaction });
    const profile = userScope == UserAuthorityScope.Student ? await Student.findByPk(user.id, { transaction }) : await Teacher.findByPk(user.id, { transaction });

    const userData = {
        id: user.id,
        oid: user.oid,
        firstName: idToken.given_name,
        lastName: idToken.family_name,
        email: idToken.upn,
        scope: userScope,
        profile: profile
    };

    res.json({
        token: jwt.sign(userData, process.env.JWT_SECRET_KEY ?? "", {
            expiresIn: "1d"
        }),
        user: userData
    });

    await transaction.commit();
});

export const AuthRouter = router;
