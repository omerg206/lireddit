import { Property } from '@mikro-orm/core';
import { PrimaryKey } from '@mikro-orm/core';
import { Entity } from '@mikro-orm/core';


@Entity()
export class Post {

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  title!: string;


}