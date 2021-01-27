import { query } from "express";
import { Query, Resolver } from "type-graphql";


@Resolver()
export class HelloResolver {
    @Query(() => String)
    hello() {
        return 'welcome professor';
    }
}