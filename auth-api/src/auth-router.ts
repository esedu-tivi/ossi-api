import axios from "axios";
import express, { json } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { sequelize, Student, Teacher, User, UserAuthorityScope } from "sequelize-models";

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

router.use(json());

// intended for basic ossi login, job supervisor scopes should be created in a seperate endpoint?
router.post("/login", async (req, res) => {
    const transaction = await sequelize.transaction();
    await sequelize.query("LOCK TABLE \"users\" IN ACCESS EXCLUSIVE MODE", { transaction });

    let idToken: IdTokenPayload;
    try {
        const pem = await getPemCertificate(req.body.idToken);
        idToken = jwt.verify(req.body.idToken, pem, { algorithms: ["RS256"] }) as IdTokenPayload;
    } catch (e) {
        console.log(e);
        return res.json({
            status: 401,
            success: false,
            message: "Error while verifying ID token, logged."
        });
    }

    const isUserInDatabase = await User.findOne({ where: { oid: idToken.oid }, transaction }) != null;
    const userScope = idToken.upn.endsWith("@esedulainen.fi") ? UserAuthorityScope.Student : UserAuthorityScope.Teacher;

    // create user and teacher or student rows for nonexistant user
    if (!isUserInDatabase) {
        const createdUser = await User.create({
            oid: idToken.oid,
            isSetUp: false,
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
                qualificationTitleId: null,
                qualificationId: null
            }, { transaction });
        } else if (userScope == UserAuthorityScope.Teacher) {
            await Teacher.create({
                id: createdUser.id,
                teachingQualificationTitleId: null,
                teachingQualificationId: null
            }, { transaction });
        }
    }

    const user = await User.findOne({ where: { oid: idToken.oid }, transaction });
    const profile = userScope == UserAuthorityScope.Student ? await Student.findByPk(user.id, { transaction }) : await Teacher.findByPk(user.id, { transaction });

    const userData = {
        id: user.id,
        oid: user.oid,
        email: user.email,
        isSetUp: user.isSetUp,
        type: idToken.upn.endsWith("@esedulainen.fi") ? "STUDENT" : "TEACHER",
        scope: userScope,
        profile: profile
    };

    res.json({
        status: 200,
        success: true,
        token: jwt.sign(userData, process.env.JWT_SECRET_KEY ?? "", {
            expiresIn: "1d"
        }),
    });

    await transaction.commit();
});

export const AuthRouter = router;
