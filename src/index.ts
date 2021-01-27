import { PostResolver } from './resolvers/post';
import { __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';
import { Post } from './entities/post';
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import 'reflect-metadata'


const main = async () => {

    const orm = await MikroORM.init(microConfig);
    orm.getMigrator().up();

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false
        }),
        context: () => ({ em: orm.em})
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