import { mapSchema, MapperKind, getDirective } from '@graphql-tools/utils';

// Access control is skipped only when explicitly disabled, and never in production.
// A missing or misspelled variable keeps access control on.
export const isAccessControlDisabled = () =>
    process.env.DISABLE_ROLE_BASED_ACCESS_CONTROL === "true" && process.env.NODE_ENV !== "production";

// Students and teachers log in with Microsoft. Job supervisors (magic link) only get
// access to fields that explicitly allow them.
const AUTHENTICATED_USER_TYPES = ["STUDENT", "TEACHER"];

const createDirectiveTransformer = (directiveName: string, isAllowed: (user) => boolean, message: string) => (schema) => {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const directive = getDirective(schema, fieldConfig, directiveName);

            if (directive) {
                const { resolve } = fieldConfig;

                fieldConfig.resolve = async (parent, args, context, info) => {
                    if (!isAccessControlDisabled() && !isAllowed(context.user)) {
                        return {
                            status: 401,
                            message,
                            success: false
                        };
                    }

                    return await resolve(parent, args, context, info);
                };

                return fieldConfig;
            }
        }
    });
};

export const authenticatedDirectiveTransformer = createDirectiveTransformer(
    "authenticated",
    (user) => AUTHENTICATED_USER_TYPES.includes(user?.type),
    "Not authenticated."
);

export const authenticatedAsTeacherDirectiveTransformer = createDirectiveTransformer(
    "authenticatedAsTeacher",
    (user) => user?.type == "TEACHER",
    "Not authorized."
);

export const authenticatedAsStudentDirectiveTransformer = createDirectiveTransformer(
    "authenticatedAsStudent",
    (user) => user?.type == "STUDENT",
    "Not authorized."
);
