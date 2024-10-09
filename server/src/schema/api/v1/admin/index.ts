import { FastifySchema } from "fastify";

export const dialoqbaseSettingsSchema: FastifySchema = {
  tags: ["Admin"],
  summary: "API to get dialoqbase settings",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
    required: ["Authorization"],
  },
  response: {
    200: {
      noOfBotsPerUser: { type: "number" },
      allowUserToCreateBots: { type: "boolean" },
      allowUserToRegister: { type: "boolean" },
      defaultChunkSize: { type: "number" },
      defaultChunkOverlap: { type: "number" },
      defaultChatModel: { type: "string" },
      defaultEmbeddingModel: { type: "string" },
      dynamicallyFetchOllamaModels: { type: "boolean" },
      hideDefaultModels: { type: "boolean" },
      ollamaURL: { type: "string" },
      usePuppeteerFetch: { type: "boolean" },
      fileUploadSizeLimit: { type: "number" },
      refetchDatasource: { type: "boolean" },
      internalSearchEnabled: { type: "boolean" },
    },
  },
};

export const updateDialoqbaseSettingsSchema: FastifySchema = {
  tags: ["Admin"],
  summary: "API to update dialoqbase settings",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
    required: ["Authorization"],
  },
  body: {
    type: "object",
    properties: {
      noOfBotsPerUser: { type: "number" },
      allowUserToCreateBots: { type: "boolean" },
      allowUserToRegister: { type: "boolean" },
      dynamicallyFetchOllamaModels: { type: "boolean" },
      defaultChatModel: { type: "string" },
      defaultEmbeddingModel: { type: "string" },
      hideDefaultModels: { type: "boolean" },
      ollamaURL: { type: "string" },
      usePuppeteerFetch: { type: "boolean" },
      fileUploadSizeLimit: { type: "number" },
      refetchDatasource: { type: "boolean" },
      internalSearchEnabled: { type: "boolean" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

export const getAllUsersSchema: FastifySchema = {
  tags: ["Admin"],
  summary: "API to get all users",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
    required: ["Authorization"],
  },
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          user_id: { type: "number" },
          username: { type: "string" },
          email: { type: "string" },
          is_admin: { type: "boolean" },
          bots: { type: "number" },
          createdAt: { type: "string" },
        },
      },
    },
  },
};

export const resetUserPasswordByAdminSchema: FastifySchema = {
  tags: ["Admin"],
  summary: "API to reset user password by admin",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
    required: ["Authorization"],
  },
  body: {
    type: "object",
    properties: {
      user_id: { type: "number" },
      new_password: { type: "string" },
    },
    required: ["user_id", "new_password"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

export const registerUserByAdminSchema: FastifySchema = {
  tags: ["Admin"],
  summary: "API to register user by admin",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
    required: ["Authorization"],
  },
  body: {
    type: "object",
    properties: {
      username: { type: "string" },
      email: { type: "string" },
      password: { type: "string" },
      return_id: { type: "boolean" },
    },
    required: ["username", "email", "password"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
        user_id: { type: "string" },
        api_key: { type: "string" },
      },
    },
  },
};

export const updateDialoqbaseRAGSettings: FastifySchema = {
  tags: ["Admin"],
  summary: "API to update dialoqbase RAG settings",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
    required: ["Authorization"],
  },
  body: {
    type: "object",
    properties: {
      defaultChunkSize: { type: "number" },
      defaultChunkOverlap: { type: "number" },
    },
    required: ["defaultChunkSize", "defaultChunkOverlap"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};


export const deleteUserSchema: FastifySchema = {
  tags: ["Admin"],
  summary: "API to delete user",
  headers: {
    type: "object",
    properties: {
      Authorization: { type: "string" },
    },
    required: ["Authorization"],
  },
  body: {
    type: "object",
    properties: {
      user_id: { type: "number" },
    },
    required: ["user_id"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};