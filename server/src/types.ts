import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import {Request, Response, Express} from 'express';
import {Redis} from 'ioredis';

declare module "express-session" {
    interface Session {
        userId?: number;
    }
  }
  


export type MyContext {
req:  Request;
res: Response;
redis: Redis
}