import { __prod__ } from './constants';
import { Post } from "./entities/post";
import { MikroORM } from '@mikro-orm/core'
import { User } from './entities/user';
import path from 'path';

export default {
    dbName: 'lireddit',
    password: 'Ee123456',
    debug: !__prod__,
    type: 'postgresql',
    entities: [Post, User],
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/
    }
    } as Parameters<typeof MikroORM.init>[0];




