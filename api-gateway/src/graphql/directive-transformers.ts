import { mapSchema, MapperKind, getDirective } from '@graphql-tools/utils';

export const authenticatedDirectiveTransformer = (schema) => {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const authenticatedDirective = getDirective(schema, fieldConfig, "authenticated");

            if (authenticatedDirective) {
                const { resolve } = fieldConfig;

                fieldConfig.resolve = async (parent, args, context, info) => {
                    if (!context.user && process.env.DISABLE_ROLE_BASED_ACCESS_CONTROL == "false") {
                        return {
                            status: 401,
                            message: "Not authenticated.",
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

export const authenticatedAsTeacherDirectiveTransformer = (schema) => {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const authenticatedDirective = getDirective(schema, fieldConfig, "authenticatedAsTeacher");

            if (authenticatedDirective) {
                const { resolve } = fieldConfig;

                fieldConfig.resolve = async (parent, args, context, info) => {
                    if (context.user?.type != "TEACHER" && process.env.DISABLE_ROLE_BASED_ACCESS_CONTROL == "false") {
                        return {
                            status: 401,
                            message: "Not authorized.",
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

export const authenticatedAsStudentDirectiveTransformer = (schema) => {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const authenticatedDirective = getDirective(schema, fieldConfig, "authenticatedAsStudent");

            if (authenticatedDirective) {
                const { resolve } = fieldConfig;

                fieldConfig.resolve = async (parent, args, context, info) => {
                    if (context.user?.type != "TEACHER" && process.env.DISABLE_ROLE_BASED_ACCESS_CONTROL == "false") {
                        return {
                            status: 401,
                            message: "Not authorized.",
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
