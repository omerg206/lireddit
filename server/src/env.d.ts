declare namespace NodeJS {
  export interface ProcessEnv {
    DATABASE_URL: string;
    REDIS_URL: string;
    PORT: string;
    SESSTION_SECRET: string;
    CORS_ORIGIN: string;
  }
}
