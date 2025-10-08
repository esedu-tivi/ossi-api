import { ApolloContext } from "./context";

type Resolver<TParent, TArgs> = (parent: TParent, args: TArgs, context: ApolloContext) => any

export { Resolver };
