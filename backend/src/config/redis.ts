import dotenv from "dotenv";
dotenv.config();

import { Redis } from "ioredis";

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,

  maxRetriesPerRequest: null,
});

export const redisConnection = redisClient;

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("error", err => {
  console.error("Redis error:", err);
});