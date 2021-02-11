import { type } from 'os';
import { Field, Int, ObjectType } from 'type-graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './post';
import { User } from './user';


@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
    @Field()
    @Column({ type: 'int' })
    value: number;

    @Field()
    @PrimaryColumn()
    userId: number;

    @Field(() => User)
    @ManyToOne(() => User, user => user.updoots)
    user: User

    @Field()
    @PrimaryColumn()
    postId: number;

    @Field(() => Post)
    @ManyToOne(() => Post, post => post.updoots, {
        onDelete: 'CASCADE'
    })
    post: Post


}