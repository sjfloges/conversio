export type UpdateDialoqbaseSettingsRequest = {
  Body: {
    noOfBotsPerUser: number;
    allowUserToCreateBots: boolean;
    allowUserToRegister: boolean;
    usePuppeteerFetch: boolean;
    fileUploadSizeLimit: number;
    refetchDatasource: boolean;
    internalSearchEnabled: boolean;
  };
};

export type ResetUserPasswordByAdminRequest = {
  Body: {
    user_id: number;
    new_password: string;
  };
};

export type RegisterUserbyAdminRequestBody = {
  Body: {
    username: string;
    email: string;
    password: string;
    return_id?: boolean;
  };
};

// admin route type
export type FetchModelFromInputedUrlRequest = {
  Body: {
    url?: string;
    api_key?: string;
    api_type: "openai" | "ollama";
    ollama_url?: string;
  };
};
export type SaveModelFromInputedUrlRequest = {
  Body: {
    url: string;
    model_id: string;
    name: string;
    stream_available: boolean;
    api_key?: string;
    api_type:
    | "openai"
    | "ollama"
    | "replicate"
    | "openai-api"
    | "google"
    | "anthropic"
    | "groq"
    ;
  };
};

export type ToogleModelRequest = {
  Body: {
    id: number;
  };
};

export interface SaveEmbeddingModelRequest {
  Body: {
    url?: string;
    api_key?: string;
    api_type: "openai" | "ollama" | "transformer";
    model_id: string;
    model_name: string;
  };
}

export type UpdateDialoqbaseRAGSettingsRequest = {
  Body: {
    defaultChunkSize: number;
    defaultChunkOverlap: number;
  };
};

export type DeleteUserRequest = {
  Body: {
    user_id: number;
  };
};