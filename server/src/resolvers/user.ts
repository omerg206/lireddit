import { validateRegister } from './../uitls/validate-register';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from './../constants';
import { MyContext } from '../types';
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import agron2, { argon2d } from 'argon2';
import { User } from '../entities/user';
import e from 'express';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { sendEmail } from '../uitls/send-email';
import { v4 } from 'uuid'
import { getConnection } from 'typeorm';
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
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { req, redis }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [{
                    field: 'newPassword',
                    message: 'length must be grater than2'
                }]
            }
        }

        const key = FORGOT_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);

        if (!userId) {
            return {
                errors: [{
                    field: 'newPassword',
                    message: 'token expired'
                }]
            }
        }

        const userIdNum = parseInt(userId)
        const user = await User.findOne(userIdNum);

        if (!user) {
            return {
                errors: [{
                    field: 'token',
                    message: 'user no longer exits'
                }]
            }
        }

        await User.update({ id: userIdNum }, { password: await agron2.hash(newPassword) });

        await redis.del(key);

        req.session.userId = user.id;
        return { user };

    }



    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
        if (req.session.userId) {
            return null;
        }

        return User.findOne(req.session.userId);
    }


    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return true
        }

        const token = v4();
        await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3)

        await sendEmail(email,
            `<a href="http://localhost:3000/change-password/${token}"> reset password</a>`)
        return true;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);

        if (errors) {
            return { errors };
        }

        const hashedPassword = await agron2.hash(options.password);
        let user;

        try {
            const result = await getConnection().createQueryBuilder().insert().into(User).values({
                username: options.username,
                email: options.email,
                password: hashedPassword
            }).returning('*').execute();
            user = result.raw[0];
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
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(
            usernameOrEmail.includes('@') ? { where: { email: usernameOrEmail } } : { where: { username: usernameOrEmail } }
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