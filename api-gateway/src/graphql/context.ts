import { AugmentedRequest, RequestOptions, RESTDataSource } from "@apollo/datasource-rest"
import { JwtPayload } from "jsonwebtoken"
import { StudentManagementAPI } from "./data-sources/student-management-api.js";

interface UserContext extends JwtPayload {
    id: string,
    firstName: string,
    lastName: string,
    email: string
} 

interface ApolloContext {
    user: UserContext | null,
    dataSources: {
        studentManagementAPI: StudentManagementAPI,
//        activityAPI: ActivityAPI,
//        authAPI: AuthAPI,
    }
}

export { ApolloContext, UserContext };
