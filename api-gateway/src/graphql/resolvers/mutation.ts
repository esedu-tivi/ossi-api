import jwt, { JwtPayload } from "jsonwebtoken"
import { config } from "../../config.js"

interface IdTokenPayload extends JwtPayload {
    oid: string,
    given_name: string,
    family_name: string,
    upn: string,
}

const login = async (parent, args, context, info) => {
    const idToken = jwt.decode(args.idToken) as IdTokenPayload

    // idToken verification
    // adding user to database

    const user = {
        id: idToken.oid,
        firstName: idToken.given_name,
        lastName: idToken.family_name,
        email: idToken.upn,
    }

    return {
        token: jwt.sign(user, config.JWT_SECRET_KEY, {
            expiresIn: "1d"
        }),
        user: user
    }
}

export const Mutation = {
    login
}