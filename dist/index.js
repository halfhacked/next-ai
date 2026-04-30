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
var CUSTOM_PROVIDER_INFO = {
  id: "custom",
  label: "Custom",
  models: [],
  defaultModel: ""
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
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}min` : `${hrs}h`;
}
function parseJsonResponse(text) {
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch?.[1]) {
    cleaned = fenceMatch[1];
  }
  return JSON.parse(cleaned);
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
function isValidProvider(id, registry = defaultRegistry) {
  return id === "custom" || registry.get(id) !== void 0;
}
export {
  AiProviderRegistry,
  BUILTIN_PROVIDERS,
  CUSTOM_PROVIDER_INFO,
  PromptTemplateRegistry,
  defaultRegistry,
  expandTemplate,
  formatDuration,
  isValidProvider,
  parseJsonResponse,
  resolveAiConfig,
  validateAiConfig,
  validateTestConfig
};
//# sourceMappingURL=index.js.map