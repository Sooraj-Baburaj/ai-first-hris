import dotenv from "dotenv";
import { createApp } from "./app.js";

import { env } from "./config/env.js";
import { connectMongo } from "./lib/mongo.js";

const app = createApp();

async function bootstrap() {
  await connectMongo();

  app.listen(env.PORT, () => {
    console.log(`@closed-ai/backend listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
