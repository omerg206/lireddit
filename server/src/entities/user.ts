import { Field, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Post } from './post';

@ObjectType()
@Entity()
export class User extends BaseEntity {

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;


  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];

}