import { MyContext } from './../types';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import agron2, { argon2d } from 'argon2';
import { User } from '../entities/user';

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string

    @Field()
    password: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;

}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(@Ctx() { req, em }: MyContext) {
        let res = null;
        if (req.session.userId) {
            res = await em.findOne(User, { id: req.session.userId })
        }

        return res;
    }




    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: 'username length must be grater than 2'
                }]
            }
        }

        if (options.password.length <= 2) {
            return {
                errors: [{
                    field: 'password',
                    message: 'password length must bt at least 2'
                }]
            }
        }


        const hashedPassword = await agron2.hash(options.password);
        const user = em.create(User, { username: options.username, password: hashedPassword });

        try {
            await em.persistAndFlush(user);

        } catch (e) {
            if (e.code === '23505') {
                return {
                    errors: [{
                        field: 'username',
                        message: 'username already exits'
                    }]
                }
            }
        }

        req.session.userId = user.id;

        return { user };

    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username });
        if (!user) {
            return {
                errors: [{
                    field: 'username',
                    message: "that user doesn't exists"
                }]
            }
        }

        const valid = await agron2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: "incorrect password"
                }]
            }
        }

        req.session.userId = user.id
        return {
            user
        }

    }



}