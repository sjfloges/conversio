import { FastifyPluginAsync } from "fastify";
import {
  chatRequestHandler,
  chatRequestStreamHandler,
  getChatStyleByIdHandler,
  chatRequestAPIHandler,
  chatTTSHandler,
  botLoginHandler,
} from "../../handlers/bot";
import {
  chatRequestSchema,
  chatRequestStreamSchema,
  chatStyleSchema,
  chatAPIRequestSchema,
  chatTTSSchema,
  chatLoginSchema,
} from "../../schema/bot";

const root: FastifyPluginAsync = async (fastify, _): Promise<void> => {
  fastify.post(
    "/:id",
    {
      schema: chatRequestSchema,
    },
    chatRequestHandler
  );

  fastify.post(
    "/:id/stream",
    {
      schema: chatRequestStreamSchema,
      logLevel: "silent",
    },
    chatRequestStreamHandler
  );

  fastify.get(
    "/:id/style",
    {
      schema: chatStyleSchema,
    },
    getChatStyleByIdHandler
  );
  fastify.post(
    "/:id/tts",
    {
      schema: chatTTSSchema,
    },
    chatTTSHandler
  );
  fastify.post(
    "/:id/api",
    {
      schema: chatAPIRequestSchema,
    },
    chatRequestAPIHandler
  );

  fastify.post(
    "/:id/login",
    {
      schema: chatLoginSchema,
    },
    botLoginHandler
  );

  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["Widget"],
        summary: "Get widget",
        hide: true,
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      return reply.sendFile("bot.html");
    }
  );
};

export default root;
