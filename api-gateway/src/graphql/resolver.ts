import { Context } from "./context.js";

type Resolver<TParent, TArgs> = (parent: TParent, args: TArgs, context: Context) => any

export { Resolver };