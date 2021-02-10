import { Field, Int, ObjectType } from 'type-graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany } from 'typeorm';
import { Updoot } from './updoot';
import { User } from './user';
@ObjectType()
@Entity()
export class Post extends BaseEntity {

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
  @Column()
  title!: string;


  @Field()
  @Column()
  creatorId: number;

  @Field(() => Int, {nullable: true})
  voteStatus: number | null;

  @Field(() => User)
  @ManyToOne(() => User, user => user.posts)
  creator: User

  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots: Updoot[];

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

}