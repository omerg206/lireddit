import { validateRegister } from './../uitls/validate-register';
import { COOKIE_NAME } from './../constants';
import { MyContext } from '../types';
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import agron2, { argon2d } from 'argon2';
import { User } from '../entities/user';
import e from 'express';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { EntityManager } from '@mikro-orm/postgresql';

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


    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { em }: MyContext
    ) {
        const user = await em.findOne(User, { username: email });
        return true;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);

        if (errors) {
            return { errors };
        }

        const hashedPassword = await agron2.hash(options.password);
        // const result = await (em as EntityManager)
        // .createQueryBuilder( User)
        // .getKnexQuery()
        // .insert({
        //     username: options.username,
        //     email: options.email,
        //     password: options.password,
        //     create_at: new Date(),
        //     updated_at: new Date()
        // }).
        // returning('*');
        // const user = result[0];
        const user = em.create(User, { username: options.username, password: hashedPassword, email: options.email });

        try {
            await em.persistAndFlush(user);

        } catch (e) {
            console.log(e);
            if (e.code === '23505') {
                console.log(e)
                return {
                    errors: [{
                        field: 'username',
                        message: 'username or email already exits'
                    }]
                }
            }
        }

        req.session.userId = user.id;

        return { user };

    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User,
            usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail }
        );
        if (!user) {
            return {
                errors: [{
                    field: 'usernameOrEmail',
                    message: "that user doesn't exists"
                }]
            }
        }

        const valid = await agron2.verify(user.password, password);
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


    @Mutation(() => Boolean)
    async logout(
        @Ctx() { req, res }: MyContext) {
        return new Promise((resolve) => {
            req.session.destroy(err => {
                if (err) {
                    console.log(err);
                    return resolve(false);
                }

                res.clearCookie(COOKIE_NAME);
                return resolve(true);
            })

        })
    }

}