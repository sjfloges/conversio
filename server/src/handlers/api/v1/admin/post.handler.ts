import { FastifyReply, FastifyRequest } from "fastify";
import {
  RegisterUserbyAdminRequestBody,
  ResetUserPasswordByAdminRequest,
  UpdateDialoqbaseSettingsRequest,
  UpdateDialoqbaseRAGSettingsRequest,
} from "./type";
import { getSettings } from "../../../../utils/common";
import * as bcrypt from "bcryptjs";
import { generateDialoqbaseAPIKey } from "../../../../utils/api";

export const updateDialoqbaseSettingsHandler = async (
  request: FastifyRequest<UpdateDialoqbaseSettingsRequest>,
  reply: FastifyReply
) => {
  const primsa = request.server.prisma;
  const user = request.user;

  if (!user.is_admin) {
    return reply.status(403).send({
      message: "Forbidden",
    });
  }

  const settings = await getSettings(primsa);
  if (!settings) {
    return reply.status(404).send({
      message: "Settings not found",
    });
  }

  await primsa.dialoqbaseSettings.update({
    where: {
      id: 1,
    },
    data: request.body,
  });

  return {
    message: "Application settings updated successfully",
  };
};

export const resetUserPasswordByAdminHandler = async (
  request: FastifyRequest<ResetUserPasswordByAdminRequest>,
  reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const user = request.user;

  if (!user.is_admin) {
    return reply.status(403).send({
      message: "Forbidden",
    });
  }

  const isUserExists = await prisma.user.findFirst({
    where: {
      user_id: request.body.user_id,
    },
  });

  if (!isUserExists) {
    return reply.status(404).send({
      message: "User not found",
    });
  }

  const hashedPassword = await bcrypt.hash(request.body.new_password, 12);

  await prisma.user.update({
    where: {
      user_id: request.body.user_id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password updated successfully",
  };
};

export const registerUserByAdminHandler = async (
  request: FastifyRequest<RegisterUserbyAdminRequestBody>,
  reply: FastifyReply
) => {
  try {
    const prisma = request.server.prisma;
    const user = request.user;

    if (!user.is_admin) {
      return reply.status(403).send({
        message: "Forbidden",
      });
    }

    const isUsernameTaken = await prisma.user.findFirst({
      where: {
        username: request.body.username,
      },
    });

    if (isUsernameTaken) {
      return reply.status(400).send({
        message: "Username is already taken",
      });
    }

    const isEmailTaken = await prisma.user.findFirst({
      where: {
        email: request.body.email,
      },
    });

    if (isEmailTaken) {
      return reply.status(400).send({
        message: "Email is already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(request.body.password, 12);

    const newUser = await prisma.user.create({
      data: {
        username: request.body.username,
        email: request.body.email,
        password: hashedPassword,
      },
    });

    if (request.body.return_id) {
      const apiKey = generateDialoqbaseAPIKey();

      await prisma.userApiKey.create({
        data: {
          user_id: newUser.user_id,
          name: "Default",
          api_key: apiKey,
        },
      });

      return {
        user_id: newUser.user_id,
        api_key: apiKey,
        message: "User registered successfully",
      };
    }

    return reply.status(200).send({
      message: "User registered successfully",
    });
  } catch (e) {
    return reply.status(500).send({
      message: "Error registering user",
    });
  }
};

export const updateDialoqbaseRAGSettingsHandler = async (
  request: FastifyRequest<UpdateDialoqbaseRAGSettingsRequest>,
  reply: FastifyReply
) => {
  const prisma = request.server.prisma;
  const user = request.user;

  if (!user.is_admin) {
    return reply.status(403).send({
      message: "Forbidden",
    });
  }

  await prisma.dialoqbaseSettings.update({
    where: {
      id: 1,
    },
    data: request.body,
  });

  return {
    message: "RAG settings updated successfully",
  };
};
