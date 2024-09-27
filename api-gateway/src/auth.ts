import axios from "axios"
import { config } from "./config.js"
import jwt from "jsonwebtoken"
import { RequestHandler } from "express"

interface AuthenticatedUserInfo extends jwt.JwtPayload {
    oid: string,
    upn: string,
    first_name: string,
    last_name: string,
    email: string
}

async function retrieveKey(token: jwt.Jwt): Promise<string> {
    const oidConfigResponse = await axios.get(`https://login.microsoftonline.com/${config.MS_TENANT_ID}/.well-known/openid-configuration`);
    const jwksResponse = await axios.get(oidConfigResponse.data["jwks_uri"]);
    const key = jwksResponse.data["keys"].find((key: JSON) => key["kid"] == token.header.kid && key["x5t"] == token.header.x5t);
    return key["x5c"][0];
}

const verifyToken: RequestHandler = async (req, res, next) => {
    try {
        if (req.body.id_token.length >= 200) {
            throw Error("id_token too long")
        }

        const encodedToken = req.body.id_token

        const decodedToken = jwt.decode(encodedToken, { complete: true });

        if (decodedToken.payload["aud"] != config.MS_CLIENT_ID) {
            throw Error("audience does not match")
        }

        if (decodedToken.payload["iss"] != config.MS_TENANT_ID) {
            throw Error("issuer does not match")
        }

        const key = await retrieveKey(decodedToken);
        
        const userInfo = jwt.verify(
            encodedToken,
            `-----CERTIFICATE BEGIN-----\n${key}\n-----CERTIFICATE END-----\n`
        ) as AuthenticatedUserInfo;

        res.locals.authenticatedUserInfo = userInfo
        
        next()
    } catch (_) {
        res.status(401); // check error
    }
}

const authorizeEseduTeacher: RequestHandler = (req, res, next) => {
    const authenticatedUserInfo = res.locals.authenticatedUserInfo as AuthenticatedUserInfo
    
    const emailDomainName = authenticatedUserInfo.email.split("@")[1]

    if (emailDomainName != "esedu.fi") {
        res.status(401)
        return
    }

    next()
}

export { AuthenticatedUserInfo, verifyToken, authorizeEseduTeacher };