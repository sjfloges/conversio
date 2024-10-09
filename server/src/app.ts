import { join } from "path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyPluginAsync } from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import fastifyMultipart from "@fastify/multipart";
import { FastifySSEPlugin } from "@waylaidwanderer/fastify-sse-v2";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import { getSessionSecret, isCookieSecure } from "./utils/session";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { pathToFileURL } from "url";
import { Worker } from "bullmq";
import { parseRedisUrl } from "./utils/redis";
import { CronJob } from 'cron';
import { processDatasourceCron } from "./cron/index";

declare module "fastify" {
  interface Session {
    is_bot_allowed: boolean;
  }
}

export type AppOptions = {} & Partial<AutoloadPluginOptions>;

const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  void fastify.register(cors);

  void fastify.register(FastifySSEPlugin);

  void fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 1 * 1024 * 1024 * 1024,
    }
  });

  void fastify.register(swagger);

  void fastify.register(swaggerUi, {
    routePrefix: "/docs",
    theme: {
      title: "Dialoqbase API Docs",
    },
    uiConfig: {
      docExpansion: "none",
      withCredentials: true,
    },
  });

  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  void fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });

  fastify.register(fastifyStatic, {
    root: join(__dirname, "public"),
    preCompressed: true,
  });

  fastify.register(fastifyCookie);
  fastify.register(fastifySession, {
    secret: getSessionSecret(),
    cookie: {
      secure: isCookieSecure(),
    },
  });

  await fastify.register(import("fastify-raw-body"), {
    field: "rawBody", // change the default request.rawBody property name
    global: false, // add the rawBody to every request. **Default true**
    encoding: "utf8", // set it to false to set rawBody as a Buffer **Default utf8**
    runFirst: true, // get the body before any preParsing hook change/uncompress it. **Default false**
    routes: [], // array of routes, **`global`** will be ignored, wildcard routes not supported
  });
};

const redis_url = process.env.DB_REDIS_URL || process.env.REDIS_URL;
if (!redis_url) {
  throw new Error("Redis url is not defined");
}

const { host, port, password } = parseRedisUrl(redis_url);
const path = join(__dirname, "./queue/index.js");
const workerUrl = pathToFileURL(path);
const concurrency = parseInt(process.env.DB_QUEUE_CONCURRENCY || "1");
const workerThreads = process.env.DB_QUEUE_THREADS || "false";
const worker = new Worker("vector", workerUrl, {
  connection: {
    host,
    port,
    password,
    username: process?.env?.DB_REDIS_USERNAME,
  },
  concurrency,
  useWorkerThreads: workerThreads === "true",
});

const job = new CronJob(
  process.env.DB_CRON_TIME || '0 0 0 * * *',
  processDatasourceCron,
  null,
  true,
  process.env.DB_CRON_TIMEZONE
);

process.on("SIGINT", async () => {
  await worker.close();
  job.stop();
  process.exit();
});

export default app;
export { app, options };
