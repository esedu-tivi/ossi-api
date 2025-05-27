import { GraphQLScalarType } from "graphql";

export const dateTimeScalar = new GraphQLScalarType({
    name: "DateTime",
    description: "DateTime scalar",

    serialize: (value) => {
        return value;
    },
});
