import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import type { AiConfig } from "../core/types";

/** 创建 AI 客户端（根据 sdkType 选择 Anthropic 或 OpenAI-compatible） */
export function createAiClient(config: AiConfig) {
  const { provider, baseURL, apiKey, sdkType } = config;

  if (sdkType === "openai") {
    return createOpenAICompatible({ name: provider, baseURL, apiKey });
  }
  return createAnthropic({ baseURL, apiKey });
}

/** 创建 AI 模型实例（用于 Vercel AI SDK） */
export function createAiModel(config: AiConfig): LanguageModel {
  const client = createAiClient(config);
  return client(config.model);
}
