
import {Request, Response, Express} from 'express';
import {Redis} from 'ioredis';
import { createUpdootLoader } from './uitls/create-updoot-loader';
import { createUserLoader } from './uitls/create-user-loader';

declare module "express-session" {
    interface Session {
        userId?: number;
    }
  }
  


export type MyContext ={
req:  Request;
res: Response;
redis: Redis;
userLoader: ReturnType<typeof createUserLoader>,
updootLoader:  ReturnType<typeof createUpdootLoader> 
}