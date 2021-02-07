import { isAuth } from './../middleware/is-auth';
import { MyContext } from './../types';
import { Post } from '../entities/post';
import { Arg, Ctx, Field, Int, Mutation, Query, Resolver, InputType, UseMiddleware, FieldResolver, Root } from "type-graphql";
import { getConnection } from 'typeorm';

@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}

@Resolver(Post)
export class PostResolver {

    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 50);
    }



    @Query(() => [Post])
    posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null
    ): Promise<Post[]> {
        console.log(cursor, limit);
        const realLimit = Math.min(50, limit);

        const qb = getConnection()
            .getRepository(Post)
            .createQueryBuilder('p')
            .orderBy('"createdAt"', "DESC")
            .take(realLimit)

        if (cursor) {
            qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) })
        }

        return qb.getMany();
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg('id', () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id);
    }


    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Promise<Post>> {
        return Post.create({ ...input, creatorId: req.session.userId }).save();
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true }) title: string
    ): Promise<Post | null> {
        const post = await Post.findOne({ where: { id } });
        if (!post) {
            return null;
        }

        if (typeof title !== "undefined") {
            post.title = title;
            await Post.update({ id }, { title });
        }

        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number
    ): Promise<boolean> {
        await Post.delete(id);
        return true;
    }
}