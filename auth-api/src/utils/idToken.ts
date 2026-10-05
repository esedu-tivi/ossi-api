import axios from "axios";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { enumUsersScope } from "prisma-orm";

export interface IdTokenPayload extends JwtPayload {
    oid: string,
    tid: string,
    given_name: string,
    family_name: string,
    jobTitle: string,
    upn?: string,
    preferred_username?: string,
}

export interface IdTokenVerifyOptions {
    clientId: string,
    tenantId: string,
}

export type SigningKeyResolver = (kid: string | undefined) => Promise<string>;

export const STUDENT_EMAIL_DOMAIN = "@esedulainen.fi";
export const TEACHER_EMAIL_DOMAIN = "@esedu.fi";

// Fetches the signing certificate from the ESEDU tenant's JWKS endpoint (not the multi-tenant "common" one).
export const createMicrosoftKeyResolver = (tenantId: string): SigningKeyResolver => async (kid) => {
    const jwks = (await axios.get(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`)).data;
    const jwksKey = jwks["keys"].find(key => key.kid == kid);

    if (!jwksKey) {
        throw new Error(`Signing key ${kid} not found in tenant JWKS`);
    }

    return "-----BEGIN CERTIFICATE-----\n" + jwksKey.x5c[0] + "\n-----END CERTIFICATE-----";
}

// Verifies signature, audience (our app registration), issuer and tenant, so tokens
// issued for other applications or other Azure AD tenants are rejected.
export async function verifyIdToken(idToken: string, options: IdTokenVerifyOptions, resolveKey: SigningKeyResolver): Promise<IdTokenPayload> {
    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded) {
        throw new Error("Malformed ID token");
    }

    const pem = await resolveKey(decoded.header.kid);

    const payload = jwt.verify(idToken, pem, {
        algorithms: ["RS256"],
        audience: options.clientId,
        issuer: [
            `https://login.microsoftonline.com/${options.tenantId}/v2.0`,
            `https://sts.windows.net/${options.tenantId}/`,
        ],
    }) as IdTokenPayload;

    if (payload.tid !== options.tenantId) {
        throw new Error("ID token tenant mismatch");
    }

    return payload;
}

export function getIdTokenEmail(idToken: IdTokenPayload): string | null {
    const email = idToken.upn ?? idToken.preferred_username;
    return email ? email.toLowerCase() : null;
}

// Only ESEDU domains get a role; any other account is rejected.
export function resolveUserScope(email: string): enumUsersScope | null {
    if (email.endsWith(STUDENT_EMAIL_DOMAIN)) {
        return enumUsersScope.STUDENT;
    }
    if (email.endsWith(TEACHER_EMAIL_DOMAIN)) {
        return enumUsersScope.TEACHER;
    }
    return null;
}
