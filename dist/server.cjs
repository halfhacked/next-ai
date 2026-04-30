"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server.ts
var server_exports = {};
__export(server_exports, {
  PromptTemplateRegistry: () => PromptTemplateRegistry,
  aiChat: () => aiChat,
  aiComplete: () => aiComplete,
  aiCompleteWithRetry: () => aiCompleteWithRetry,
  aiStream: () => aiStream,
  createAiClient: () => createAiClient,
  createAiModel: () => createAiModel,
  expandTemplate: () => expandTemplate,
  resolveAiConfig: () => resolveAiConfig,
  validateAiConfig: () => validateAiConfig,
  validateTestConfig: () => validateTestConfig
});
module.exports = __toCommonJS(server_exports);

// src/server/client.ts
var import_anthropic = require("@ai-sdk/anthropic");
var import_openai = require("@ai-sdk/openai");
function createAiClient(config) {
  const { baseURL, apiKey, sdkType } = config;
  if (sdkType === "openai") {
    return (0, import_openai.createOpenAI)({ baseURL, apiKey });
  }
  return (0, import_anthropic.createAnthropic)({ baseURL, apiKey });
}
function createAiModel(config) {
  const client = createAiClient(config);
  return client(config.model);
}

// src/server/helpers.ts
var import_ai = require("ai");

// src/core/providers.ts
var BUILTIN_PROVIDERS = {
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    baseURL: "https://api.anthropic.com/v1",
    sdkType: "anthropic",
    models: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022"],
    defaultModel: "claude-sonnet-4-20250514"
  },
  minimax: {
    id: "minimax",
    label: "MiniMax",
    baseURL: "https://api.minimaxi.com/anthropic/v1",
    sdkType: "anthropic",
    models: ["MiniMax-M2.5", "MiniMax-M2.1"],
    defaultModel: "MiniMax-M2.5"
  },
  glm: {
    id: "glm",
    label: "GLM (Zhipu)",
    baseURL: "https://open.bigmodel.cn/api/anthropic/v1",
    sdkType: "anthropic",
    models: ["glm-5", "glm-4.7"],
    defaultModel: "glm-5"
  },
  aihubmix: {
    id: "aihubmix",
    label: "AIHubMix",
    baseURL: "https://aihubmix.com/v1",
    sdkType: "openai",
    models: ["gpt-4o-mini", "gpt-5-nano"],
    defaultModel: "gpt-4o-mini"
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    baseURL: "https://api.deepseek.com",
    sdkType: "openai",
    models: [
      "deepseek-v4-flash",
      "deepseek-v4-pro",
      "deepseek-chat",
      "deepseek-reasoner"
    ],
    defaultModel: "deepseek-v4-flash"
  }
};

// src/core/registry.ts
var AiProviderRegistry = class {
  providers;
  constructor(customProviders) {
    this.providers = new Map(Object.entries(BUILTIN_PROVIDERS));
    if (customProviders) {
      for (const [id, info] of Object.entries(customProviders)) {
        this.providers.set(id, info);
      }
    }
  }
  /** 获取指定 Provider 配置 */
  get(id) {
    return this.providers.get(id);
  }
  /** 获取所有 Provider 配置 */
  getAll() {
    return Array.from(this.providers.values());
  }
  /** 获取所有 Provider ID（含 custom） */
  getAllIds() {
    return [...this.providers.keys(), "custom"];
  }
  /** 注册新 Provider */
  register(info) {
    this.providers.set(info.id, info);
  }
  /** 检查 Provider 是否存在 */
  has(id) {
    return id === "custom" || this.providers.has(id);
  }
};
var defaultRegistry = new AiProviderRegistry();

// src/core/config.ts
function validateAiConfig(input, registry = defaultRegistry) {
  const errors = [];
  if (!input.provider) {
    errors.push({ field: "provider", message: "Provider is required" });
  } else if (input.provider !== "custom" && !registry.get(input.provider)) {
    errors.push({
      field: "provider",
      message: `Unknown provider: ${input.provider}`
    });
  }
  if (!input.apiKey) {
    errors.push({ field: "apiKey", message: "API key is required" });
  }
  if (input.provider === "custom") {
    if (!input.baseURL) {
      errors.push({
        field: "baseURL",
        message: "Base URL is required for custom provider"
      });
    }
    if (!input.sdkType) {
      errors.push({
        field: "sdkType",
        message: "SDK type is required for custom provider"
      });
    }
    if (!input.model) {
      errors.push({
        field: "model",
        message: "Model is required for custom provider"
      });
    }
  }
  return errors;
}
function validateTestConfig(input, registry = defaultRegistry) {
  const errors = [];
  if (!input.provider) {
    errors.push({ field: "provider", message: "Provider is required" });
  } else if (input.provider !== "custom" && !registry.get(input.provider)) {
    errors.push({
      field: "provider",
      message: `Unknown provider: ${input.provider}`
    });
  }
  if (!input.model) {
    errors.push({ field: "model", message: "Model is required" });
  }
  if (input.provider === "custom") {
    if (!input.baseURL) {
      errors.push({
        field: "baseURL",
        message: "Base URL is required for custom provider"
      });
    }
    if (!input.sdkType) {
      errors.push({
        field: "sdkType",
        message: "SDK type is required for custom provider"
      });
    }
  }
  return errors;
}
function resolveAiConfig(input, registry = defaultRegistry) {
  const errors = validateAiConfig(input, registry);
  if (errors.length > 0) {
    throw new Error(errors.map((e) => `${e.field}: ${e.message}`).join("; "));
  }
  const { provider, apiKey, model, baseURL, sdkType } = input;
  if (provider === "custom") {
    return {
      provider,
      baseURL,
      apiKey,
      model,
      sdkType
    };
  }
  const providerInfo = registry.get(provider);
  return {
    provider,
    baseURL: providerInfo.baseURL,
    apiKey,
    model: model || providerInfo.defaultModel,
    sdkType: providerInfo.sdkType
  };
}

// src/server/helpers.ts
async function aiComplete(prompt, options) {
  const startTime = Date.now();
  const config = resolveAiConfig(options.settings);
  const model = createAiModel(config);
  const { text, usage } = await (0, import_ai.generateText)({
    model,
    prompt,
    maxOutputTokens: options.maxOutputTokens ?? 4096,
    temperature: options.temperature ?? 0.7,
    abortSignal: AbortSignal.timeout(options.timeout ?? 6e4)
  });
  return {
    text,
    usage: {
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0
    },
    durationMs: Date.now() - startTime
  };
}
async function aiChat(messages, options) {
  const startTime = Date.now();
  const config = resolveAiConfig(options.settings);
  const model = createAiModel(config);
  const { text, usage } = await (0, import_ai.generateText)({
    model,
    messages,
    maxOutputTokens: options.maxOutputTokens ?? 4096,
    temperature: options.temperature ?? 0.7,
    abortSignal: AbortSignal.timeout(options.timeout ?? 6e4)
  });
  return {
    text,
    usage: {
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0
    },
    durationMs: Date.now() - startTime
  };
}
async function aiStream(prompt, options) {
  const config = resolveAiConfig(options.settings);
  const model = createAiModel(config);
  const { textStream } = (0, import_ai.streamText)({
    model,
    prompt,
    maxOutputTokens: options.maxOutputTokens ?? 4096,
    temperature: options.temperature ?? 0.7,
    abortSignal: AbortSignal.timeout(options.timeout ?? 6e4)
  });
  return textStream;
}
async function aiCompleteWithRetry(prompt, options) {
  const { retries = 3, retryDelay = 1e3, ...helperOptions } = options;
  if (retries < 1) {
    throw new Error("retries must be at least 1");
  }
  let lastError = null;
  for (let i = 0; i < retries; i++) {
    try {
      return await aiComplete(prompt, helperOptions);
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        await new Promise(
          (resolve) => setTimeout(resolve, retryDelay * (i + 1))
        );
      }
    }
  }
  throw lastError;
}

// src/core/utils.ts
function expandTemplate(template, variables) {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key) => {
    const value = key.split(".").reduce(
      (obj, k) => typeof obj === "object" ? obj[k] : void 0,
      variables
    );
    return value !== void 0 && typeof value !== "object" ? String(value) : `{{${key}}}`;
  });
}

// src/core/templates.ts
var PromptTemplateRegistry = class {
  templates = /* @__PURE__ */ new Map();
  /** 注册模板 */
  register(template) {
    this.templates.set(template.id, template);
  }
  /** 获取模板 */
  get(id) {
    return this.templates.get(id);
  }
  /** 获取所有模板 */
  getAll() {
    return Array.from(this.templates.values());
  }
  /** 获取所有模板 ID */
  getAllIds() {
    return Array.from(this.templates.keys());
  }
  /** 检查模板是否存在 */
  has(id) {
    return this.templates.has(id);
  }
  /** 构建完整 prompt（展开变量，合并段落） */
  build(templateId, variables, customSections) {
    const template = this.get(templateId);
    if (!template) throw new Error(`Unknown template: ${templateId}`);
    return template.sections.map((section) => {
      const content = customSections?.[section.id] ?? section.content;
      return expandTemplate(content, variables);
    }).join("\n\n");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PromptTemplateRegistry,
  aiChat,
  aiComplete,
  aiCompleteWithRetry,
  aiStream,
  createAiClient,
  createAiModel,
  expandTemplate,
  resolveAiConfig,
  validateAiConfig,
  validateTestConfig
});
//# sourceMappingURL=server.cjs.map