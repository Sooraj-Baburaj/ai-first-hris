import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/closed-ai"),
  RECRUITER_EMAIL: z.string().email().default("recruiter@closedai.com"),
  MAX_RESUME_SIZE_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024),
  RESUME_UPLOAD_DIR: z.string().min(1).default("uploads/resumes"),
  API_BASE_URL: z.string().url().default("http://localhost:5000"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
});

export const env = envSchema.parse(process.env);
