import { PrismaClient } from "@prisma/client";

// Синглтон, переживающий hot reload в dev
const globalCache = globalThis as unknown as { __prisma?: PrismaClient };

export const db: PrismaClient = globalCache.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalCache.__prisma = db;
}
