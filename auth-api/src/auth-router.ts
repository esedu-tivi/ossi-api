import express, { json } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const router = express.Router()

interface IdTokenPayload extends JwtPayload {
    oid: string,
    given_name: string,
    family_name: string,
    upn: string,
}

router.use(json())

router.post("/login", (req, res) => { 
    const idToken = jwt.decode(req.body.idToken) as IdTokenPayload

    // idToken verification
    // adding user to database

    const user = {
        id: idToken.oid,
        firstName: idToken.given_name,
        lastName: idToken.family_name,
        email: idToken.upn,
    }

    return {
        token: jwt.sign(user, process.env.JWT_SECRET_KEY ?? "", {
            expiresIn: "1d"
        }),
        user: user
    }
});

export const AuthRouter = router;
