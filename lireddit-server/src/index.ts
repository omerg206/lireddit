import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';
import { __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';
import microConfig from './mikro-orm.config';
import express from 'express';
import { HelloResolver } from './resolvers/hello';
import 'reflect-metadata';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from './types';




const main = async () => {

    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const app = express();

    let RedisStore = connectRedis(session,)
    let redisClient = redis.createClient({
        // host: '172.19.43.120',
    })

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ client: redisClient, disableTouch: true }),
            secret: '213asds23s',
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,  //10 years,
                httpOnly: true,
                secure: __prod__,
                sameSite: 'lax' //csrf
            }
        })
    )


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }: MyContext) => ({ em: orm.em, req, res })
    });

    apolloServer.applyMiddleware({ app })




    app.get('/', (_, res) => {
        res.send('hello')
    });


    app.listen(4000, () => {
        console.log(' server running started on localhost: 4000')
    });

};




main().catch(err => console.log(err)) 