import 'reflect-metadata';
require('dotenv-safe').config();
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';
import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import { HelloResolver } from './resolvers/hello';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from './types';
import cors from 'cors';
import { createConnection } from 'typeorm'
import { User } from './entities/user';
import { Post } from './entities/post';
import path from 'path';
import { Updoot } from './entities/updoot';
import { createUserLoader } from './uitls/create-user-loader';
import { createUpdootLoader } from './uitls/create-updoot-loader';



const main = async () => {
    const connection = await createConnection({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: true,
        // synchronize: true,
        entities: [Post, User, Updoot],
        migrations: [path.join(__dirname, "./migrations/*")]
    })

    connection.runMigrations();
    // await Post.delete({});

    const app = express();

    let RedisStore = connectRedis(session,)
    let redisClient = new Redis({

        // host: '172.19.43.120',
    })

    app.set("trust proxy", 1)
    app.use(cors({
        credentials: true,
        origin: process.env.CORS_ORIGIN
    }));

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ client: redisClient, disableTouch: true }),
            secret: process.env.SESSTION_SECRET as any,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,  //10 years,
                httpOnly: true,
                secure: __prod__,
                sameSite: 'lax', //csrf
                domain: __prod__ ? ".codeponder.com" : undefined
            }
        })
    )


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }: MyContext) => ({
            req, res, redis: redisClient,
            userLoader: createUserLoader(), updootLoader: createUpdootLoader()
        })
    });

    apolloServer.applyMiddleware({ app, cors: false })




    app.get('/', (_, res) => {
        res.send('hello')
    });


    app.listen(parseInt(process.env.PORT as string), () => {
        console.log(' server running started on localhost: ', process.env.PORT)
    });

};




main().catch(err => console.log(err)) 