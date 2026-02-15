import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().default("postgresql://haven:haven_dev@localhost:5432/haven"),
  JWT_SECRET: z.string().default("dev-secret-change-in-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  MAX_FILE_SIZE: z.coerce.number().default(10485760),
  UPLOAD_DIR: z.string().default("./uploads"),
});

export const env = envSchema.parse(process.env);
