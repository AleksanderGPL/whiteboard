import { Redis } from "ioredis";

export const redis = new Redis(Deno.env.get("REDIS_URL")!);
