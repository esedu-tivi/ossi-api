import { type ApolloContext } from "./context.js";

type Resolver<TParent, TArgs> = (parent: TParent, args: TArgs, context: ApolloContext) => any

export type { Resolver };
