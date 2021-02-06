import { nextTick } from "process";
import { MyContext } from "src/types";
import { Middleware } from "type-graphql/dist/interfaces/Middleware";

export const isAuth: Middleware<MyContext> = ({context: {req}}, next) => {
    if (!req.session.userId) {
        throw new Error("not authenticated");
    }

    return next();
}