import { GraphQLScalarType } from "graphql";

export const dateTimeScalar = new GraphQLScalarType({
    name: "DateTime",
    description: "DateTime scalar YYYY-MM-DDT:HH:mm:ss.SSSZ",

    serialize: (value) => {
        console.log
        let date: Date;
        if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
            date = new Date(value);
        } else {
            throw new TypeError("Value is not a valid date type");
        }
        console.log("time convert:", date)
        return date.toISOString();
    },
});
