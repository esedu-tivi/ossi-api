import { JwtPayload } from "jsonwebtoken"

interface UserContext extends JwtPayload {
    id: string,
    firstName: string,
    lastName: string,
    email: string
} 

interface Context {
    user: UserContext | null
}

export { Context, UserContext };