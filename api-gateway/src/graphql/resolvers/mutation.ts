import jwt, { JwtPayload } from "jsonwebtoken"
import { config } from "../../config.js"

interface IdTokenPayload extends JwtPayload {
    oid: string,
    first_name: string,
    last_name: string,
    email: string,
}

const login = async (parent, args, context, info) => {
    const idToken = jwt.decode(args.idToken) as IdTokenPayload

    // idToken verification
    // adding user to database

    const user = {
        id: idToken.oid,
        firstName: idToken.first_name,
        lastName: idToken.last_name,
        email: idToken.email,
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