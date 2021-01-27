import { __prod__ } from './constants';
import {MikroORM} from '@mikro-orm/core';
import { Post } from './entities/post';


const main = async () => {

    const orm = await MikroORM.init({
        dbName: 'lireddit',
        password: 'Ee123456',
        debug:! __prod__,
        type: 'postgresql',
        entities: [Post]
    });

     const post = orm.em.create(Post, {title: 'my first post'});
     await orm.em.persistAndFlush(post)
} 

main().catch(err => console.log(err)) ;