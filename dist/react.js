"use client";
"use client";

// src/react/context.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

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

// src/react/context.tsx
import { jsx } from "react/jsx-runtime";
var AiConfigContext = createContext(null);
function AiConfigProvider({
  adapter,
  registry = defaultRegistry,
  children
}) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adapter.getSettings();
      setSettings(data);
    } finally {
      setLoading(false);
    }
  }, [adapter]);
  const save = useCallback(
    async (updates) => {
      setSaving(true);
      try {
        const data = await adapter.saveSettings(updates);
        setSettings(data);
      } finally {
        setSaving(false);
      }
    },
    [adapter]
  );
  const testConnection = useCallback(
    (config) => {
      return adapter.testConnection(config);
    },
    [adapter]
  );
  useEffect(() => {
    reload();
  }, [reload]);
  return /* @__PURE__ */ jsx(
    AiConfigContext.Provider,
    {
      value: {
        settings,
        loading,
        saving,
        registry,
        reload,
        save,
        testConnection
      },
      children
    }
  );
}
function useAiConfig() {
  const ctx = useContext(AiConfigContext);
  if (!ctx) throw new Error("useAiConfig must be used within AiConfigProvider");
  return ctx;
}

// src/react/hooks.ts
import { useCallback as useCallback2, useState as useState2 } from "react";
function useAiSettings() {
  const { settings, loading, saving, save, reload } = useAiConfig();
  return { settings, loading, saving, save, reload };
}
function useAiTest() {
  const { testConnection } = useAiConfig();
  const [testing, setTesting] = useState2(false);
  const [result, setResult] = useState2(null);
  const [error, setError] = useState2(null);
  const test = useCallback2(
    async (config) => {
      setTesting(true);
      setResult(null);
      setError(null);
      try {
        const res = await testConnection(config);
        setResult(res);
        return res;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Connection test failed";
        setError(message);
        const failedResult = { success: false, error: message };
        setResult(failedResult);
        return failedResult;
      } finally {
        setTesting(false);
      }
    },
    [testConnection]
  );
  return { test, testing, result, error };
}
function useProviderRegistry() {
  const { registry } = useAiConfig();
  return registry;
}

// src/react/components/AiSettingsPanel.tsx
import { useEffect as useEffect2, useState as useState5 } from "react";

// src/react/styles.ts
var basaltTokens = {
  light: {
    background: "220 14% 94%",
    foreground: "0 0% 12%",
    card: "220 14% 97%",
    cardForeground: "0 0% 12%",
    secondary: "0 0% 100%",
    secondaryForeground: "0 0% 12%",
    input: "220 13% 88%",
    border: "220 13% 88%",
    primary: "220 90% 56%",
    primaryForeground: "0 0% 100%",
    destructive: "0 84% 60%",
    destructiveForeground: "0 0% 100%",
    muted: "220 14% 96%",
    mutedForeground: "0 0% 45%"
  },
  dark: {
    background: "0 0% 9%",
    foreground: "0 0% 93%",
    card: "0 0% 10.6%",
    cardForeground: "0 0% 93%",
    secondary: "0 0% 12.2%",
    secondaryForeground: "0 0% 93%",
    input: "0 0% 18%",
    border: "0 0% 16%",
    primary: "220 90% 56%",
    primaryForeground: "0 0% 100%",
    destructive: "0 62% 50%",
    destructiveForeground: "0 0% 100%",
    muted: "0 0% 15%",
    mutedForeground: "0 0% 64%"
  }
};
function kebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function generateCssVariables(mode) {
  const tokens = basaltTokens[mode];
  return Object.entries(tokens).map(([key, value]) => `--${kebabCase(key)}: ${value};`).join("\n");
}
function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

// src/react/components/ApiKeyInput.tsx
import { useState as useState3 } from "react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
function ApiKeyInput({
  value,
  onChange,
  hasStoredKey,
  disabled,
  className,
  id
}) {
  const [visible, setVisible] = useState3(false);
  const [editing, setEditing] = useState3(false);
  const showPlaceholder = hasStoredKey && !editing && !value;
  const handleFocus = () => {
    if (showPlaceholder) {
      setEditing(true);
    }
  };
  const handleBlur = () => {
    if (!value) {
      setEditing(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: cn("relative", className), children: [
    /* @__PURE__ */ jsx2(
      "input",
      {
        id,
        type: visible ? "text" : "password",
        value: showPlaceholder ? "\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF" : value,
        onChange: (e) => onChange(e.target.value),
        onFocus: handleFocus,
        onBlur: handleBlur,
        placeholder: "Enter API key...",
        disabled,
        readOnly: showPlaceholder,
        className: cn(
          "flex h-10 w-full rounded-lg px-3 py-2 pr-10",
          "text-sm font-mono",
          "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
          "border border-[hsl(var(--border))]",
          "placeholder:text-[hsl(var(--muted-foreground))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          showPlaceholder && "cursor-pointer text-[hsl(var(--muted-foreground))]"
        )
      }
    ),
    /* @__PURE__ */ jsx2(
      "button",
      {
        type: "button",
        onClick: () => setVisible(!visible),
        disabled: disabled || showPlaceholder,
        className: cn(
          "absolute right-2 top-1/2 -translate-y-1/2",
          "p-1 rounded",
          "text-[hsl(var(--muted-foreground))]",
          "hover:text-[hsl(var(--foreground))]",
          "disabled:cursor-not-allowed disabled:opacity-50"
        ),
        "aria-label": visible ? "Hide API key" : "Show API key",
        children: visible ? (
          // Eye-off icon
          /* @__PURE__ */ jsxs(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              "aria-hidden": "true",
              children: [
                /* @__PURE__ */ jsx2("path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" }),
                /* @__PURE__ */ jsx2("line", { x1: "1", y1: "1", x2: "23", y2: "23" })
              ]
            }
          )
        ) : (
          // Eye icon
          /* @__PURE__ */ jsxs(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              "aria-hidden": "true",
              children: [
                /* @__PURE__ */ jsx2("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
                /* @__PURE__ */ jsx2("circle", { cx: "12", cy: "12", r: "3" })
              ]
            }
          )
        )
      }
    )
  ] });
}

// src/react/components/ModelSelect.tsx
import { useState as useState4 } from "react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function ModelSelect({
  provider,
  value,
  onChange,
  disabled,
  className,
  id
}) {
  const registry = useProviderRegistry();
  const [isCustom, setIsCustom] = useState4(false);
  const providerInfo = registry.get(provider);
  const models = providerInfo?.models ?? [];
  const isCustomProvider = provider === "custom";
  const isValueCustomModel = value && !models.includes(value);
  if (isCustomProvider || isCustom || isValueCustomModel) {
    return /* @__PURE__ */ jsxs2("div", { className: cn("flex gap-2", className), children: [
      /* @__PURE__ */ jsx3(
        "input",
        {
          id,
          type: "text",
          value,
          onChange: (e) => onChange(e.target.value),
          placeholder: "Enter model name...",
          disabled,
          className: cn(
            "flex h-10 flex-1 rounded-lg px-3 py-2",
            "text-sm",
            "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
            "border border-[hsl(var(--border))]",
            "placeholder:text-[hsl(var(--muted-foreground))]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )
        }
      ),
      !isCustomProvider && /* @__PURE__ */ jsx3(
        "button",
        {
          type: "button",
          onClick: () => {
            setIsCustom(false);
            onChange("");
          },
          disabled,
          className: cn(
            "px-3 rounded-lg text-sm",
            "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
            "border border-[hsl(var(--border))]",
            "hover:bg-[hsl(var(--secondary)/0.8)]",
            "disabled:cursor-not-allowed disabled:opacity-50"
          ),
          children: "List"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs2(
    "select",
    {
      id,
      value,
      onChange: (e) => {
        if (e.target.value === "__custom__") {
          setIsCustom(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      },
      disabled,
      className: cn(
        "flex h-10 w-full rounded-lg px-3 py-2",
        "text-sm",
        "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
        "border border-[hsl(var(--border))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      children: [
        /* @__PURE__ */ jsx3("option", { value: "", children: "Select model..." }),
        models.map((model) => /* @__PURE__ */ jsx3("option", { value: model, children: model }, model)),
        /* @__PURE__ */ jsx3("option", { disabled: true, children: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
        /* @__PURE__ */ jsx3("option", { value: "__custom__", children: "Custom model..." })
      ]
    }
  );
}

// src/react/components/ProviderSelect.tsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function ProviderSelect({
  value,
  onChange,
  disabled,
  className,
  id
}) {
  const registry = useProviderRegistry();
  const providers = registry.getAll();
  return /* @__PURE__ */ jsxs3(
    "select",
    {
      id,
      value,
      onChange: (e) => onChange(e.target.value),
      disabled,
      className: cn(
        "flex h-10 w-full rounded-lg px-3 py-2",
        "text-sm",
        "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
        "border border-[hsl(var(--border))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      children: [
        /* @__PURE__ */ jsx4("option", { value: "", children: "Select provider..." }),
        providers.map((provider) => /* @__PURE__ */ jsx4("option", { value: provider.id, children: provider.label }, provider.id)),
        /* @__PURE__ */ jsx4("option", { disabled: true, children: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }),
        /* @__PURE__ */ jsx4("option", { value: "custom", children: "Custom" })
      ]
    }
  );
}

// src/react/components/AiSettingsPanel.tsx
import { Fragment, jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function AiSettingsPanel({
  className,
  onSaveSuccess,
  onTestSuccess,
  onTestError,
  hideTestButton
}) {
  const { settings, loading, saving, save } = useAiSettings();
  const { test, testing, result } = useAiTest();
  const registry = useProviderRegistry();
  const [provider, setProvider] = useState5("");
  const [model, setModel] = useState5("");
  const [apiKey, setApiKey] = useState5("");
  const [baseURL, setBaseURL] = useState5("");
  const [sdkType, setSdkType] = useState5("");
  useEffect2(() => {
    if (settings) {
      setProvider(settings.provider);
      setModel(settings.model);
      setBaseURL(settings.baseURL ?? "");
      setSdkType(settings.sdkType ?? "");
    }
  }, [settings]);
  const isCustomProvider = provider === "custom";
  const providerInfo = registry.get(provider);
  const isCustomProviderValid = !isCustomProvider || baseURL.trim() !== "" && sdkType !== "";
  const canSubmit = provider && model && isCustomProviderValid;
  const [saveError, setSaveError] = useState5(null);
  const handleSave = async () => {
    setSaveError(null);
    try {
      await save({
        provider,
        model,
        apiKey: apiKey || void 0,
        baseURL: isCustomProvider ? baseURL : void 0,
        sdkType: isCustomProvider ? sdkType : void 0
      });
      setApiKey("");
      onSaveSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save settings";
      setSaveError(message);
    }
  };
  const handleTest = async () => {
    const testResult = await test({
      provider,
      apiKey: apiKey || void 0,
      // If empty, server should use stored key
      model,
      baseURL: isCustomProvider ? baseURL : providerInfo?.baseURL,
      sdkType: isCustomProvider ? sdkType : providerInfo?.sdkType
    });
    if (testResult.success) {
      onTestSuccess?.(testResult);
    } else {
      onTestError?.(testResult.error ?? "Test failed");
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxs4(
      "div",
      {
        className: cn(
          "rounded-xl p-6",
          "bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]",
          "border border-[hsl(var(--border))]",
          "animate-pulse",
          className
        ),
        children: [
          /* @__PURE__ */ jsx5("div", { className: "h-8 bg-[hsl(var(--muted))] rounded w-1/3 mb-6" }),
          /* @__PURE__ */ jsxs4("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx5("div", { className: "h-10 bg-[hsl(var(--muted))] rounded" }),
            /* @__PURE__ */ jsx5("div", { className: "h-10 bg-[hsl(var(--muted))] rounded" }),
            /* @__PURE__ */ jsx5("div", { className: "h-10 bg-[hsl(var(--muted))] rounded" })
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      className: cn(
        "rounded-xl p-6",
        "bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]",
        "border border-[hsl(var(--border))]",
        className
      ),
      children: [
        /* @__PURE__ */ jsx5("h2", { className: "text-lg font-semibold mb-6", children: "AI Settings" }),
        /* @__PURE__ */ jsxs4("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs4("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx5("label", { htmlFor: "ai-provider-select", className: "text-sm font-medium", children: "Provider" }),
            /* @__PURE__ */ jsx5(
              ProviderSelect,
              {
                id: "ai-provider-select",
                value: provider,
                onChange: (v) => {
                  setProvider(v);
                  setModel("");
                },
                disabled: saving
              }
            )
          ] }),
          /* @__PURE__ */ jsxs4("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx5("label", { htmlFor: "ai-model-select", className: "text-sm font-medium", children: "Model" }),
            /* @__PURE__ */ jsx5(
              ModelSelect,
              {
                id: "ai-model-select",
                provider,
                value: model,
                onChange: setModel,
                disabled: saving || !provider
              }
            )
          ] }),
          /* @__PURE__ */ jsxs4("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx5("label", { htmlFor: "ai-api-key-input", className: "text-sm font-medium", children: "API Key" }),
            /* @__PURE__ */ jsx5(
              ApiKeyInput,
              {
                id: "ai-api-key-input",
                value: apiKey,
                onChange: setApiKey,
                hasStoredKey: settings?.hasApiKey,
                disabled: saving
              }
            ),
            settings?.hasApiKey && !apiKey && /* @__PURE__ */ jsx5("p", { className: "text-xs text-[hsl(var(--muted-foreground))]", children: "API key is set. Enter a new key to update it." })
          ] }),
          isCustomProvider && /* @__PURE__ */ jsxs4(Fragment, { children: [
            /* @__PURE__ */ jsxs4("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx5(
                "label",
                {
                  htmlFor: "ai-base-url-input",
                  className: "text-sm font-medium",
                  children: "Base URL"
                }
              ),
              /* @__PURE__ */ jsx5(
                "input",
                {
                  id: "ai-base-url-input",
                  type: "url",
                  value: baseURL,
                  onChange: (e) => setBaseURL(e.target.value),
                  placeholder: "https://api.example.com/v1",
                  disabled: saving,
                  className: cn(
                    "flex h-10 w-full rounded-lg px-3 py-2",
                    "text-sm",
                    "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
                    "border border-[hsl(var(--border))]",
                    "placeholder:text-[hsl(var(--muted-foreground))]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )
                }
              )
            ] }),
            /* @__PURE__ */ jsxs4("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx5(
                "label",
                {
                  htmlFor: "ai-sdk-type-select",
                  className: "text-sm font-medium",
                  children: "SDK Type"
                }
              ),
              /* @__PURE__ */ jsxs4(
                "select",
                {
                  id: "ai-sdk-type-select",
                  value: sdkType,
                  onChange: (e) => setSdkType(e.target.value),
                  disabled: saving,
                  className: cn(
                    "flex h-10 w-full rounded-lg px-3 py-2",
                    "text-sm",
                    "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
                    "border border-[hsl(var(--border))]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  ),
                  children: [
                    /* @__PURE__ */ jsx5("option", { value: "", children: "Select SDK type..." }),
                    /* @__PURE__ */ jsx5("option", { value: "anthropic", children: "Anthropic" }),
                    /* @__PURE__ */ jsx5("option", { value: "openai", children: "OpenAI" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs4("div", { className: "flex gap-3 pt-4", children: [
            !hideTestButton && /* @__PURE__ */ jsx5(
              "button",
              {
                type: "button",
                onClick: handleTest,
                disabled: testing || saving || !canSubmit,
                className: cn(
                  "inline-flex items-center justify-center rounded-lg px-4 py-2",
                  "text-sm font-medium transition-colors",
                  "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
                  "border border-[hsl(var(--border))]",
                  "hover:bg-[hsl(var(--secondary)/0.8)]",
                  "disabled:pointer-events-none disabled:opacity-50"
                ),
                children: testing ? "Testing..." : "Test Connection"
              }
            ),
            /* @__PURE__ */ jsx5(
              "button",
              {
                type: "button",
                onClick: handleSave,
                disabled: saving || !canSubmit,
                className: cn(
                  "inline-flex items-center justify-center rounded-lg px-4 py-2",
                  "text-sm font-medium transition-colors",
                  "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
                  "hover:bg-[hsl(var(--primary)/0.9)]",
                  "disabled:pointer-events-none disabled:opacity-50"
                ),
                children: saving ? "Saving..." : "Save Settings"
              }
            )
          ] }),
          result && /* @__PURE__ */ jsx5(
            "div",
            {
              className: cn(
                "mt-4 p-3 rounded-lg text-sm",
                result.success ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]"
              ),
              children: result.success ? /* @__PURE__ */ jsxs4(Fragment, { children: [
                "\u2713 Connection successful",
                result.model && /* @__PURE__ */ jsxs4("span", { className: "ml-2 opacity-70", children: [
                  "(",
                  result.model,
                  ")"
                ] })
              ] }) : /* @__PURE__ */ jsxs4(Fragment, { children: [
                "\u2717 ",
                result.error ?? "Connection failed"
              ] })
            }
          ),
          saveError && /* @__PURE__ */ jsxs4(
            "div",
            {
              className: cn(
                "mt-4 p-3 rounded-lg text-sm",
                "bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]"
              ),
              children: [
                "\u2717 ",
                saveError
              ]
            }
          )
        ] })
      ]
    }
  );
}

// src/react/components/PromptTemplateSelector.tsx
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function PromptTemplateSelector({
  registry,
  value,
  onChange,
  showDetails = false,
  className
}) {
  const templates = registry.getAll();
  const selectedTemplate = value ? registry.get(value) : void 0;
  return /* @__PURE__ */ jsxs5("div", { className: cn("space-y-3", className), children: [
    /* @__PURE__ */ jsxs5(
      "select",
      {
        value,
        onChange: (e) => onChange(e.target.value),
        className: cn(
          "flex h-10 w-full rounded-lg px-3 py-2",
          "text-sm",
          "bg-[hsl(var(--input))] text-[hsl(var(--foreground))]",
          "border border-[hsl(var(--border))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
        ),
        children: [
          /* @__PURE__ */ jsx6("option", { value: "", children: "Select template..." }),
          templates.map((template) => /* @__PURE__ */ jsx6("option", { value: template.id, children: template.name }, template.id))
        ]
      }
    ),
    showDetails && selectedTemplate && /* @__PURE__ */ jsxs5(
      "div",
      {
        className: cn(
          "rounded-lg p-4",
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
          "border border-[hsl(var(--border))]",
          "text-sm space-y-2"
        ),
        children: [
          selectedTemplate.description && /* @__PURE__ */ jsxs5("p", { children: [
            /* @__PURE__ */ jsx6("span", { className: "font-medium", children: "Description: " }),
            selectedTemplate.description
          ] }),
          selectedTemplate.variables.length > 0 && /* @__PURE__ */ jsxs5("p", { children: [
            /* @__PURE__ */ jsx6("span", { className: "font-medium", children: "Variables: " }),
            selectedTemplate.variables.map((v) => v.key).join(", ")
          ] }),
          /* @__PURE__ */ jsxs5("p", { children: [
            /* @__PURE__ */ jsx6("span", { className: "font-medium", children: "Sections: " }),
            selectedTemplate.sections.length
          ] })
        ]
      }
    )
  ] });
}
export {
  AiConfigProvider,
  AiSettingsPanel,
  ApiKeyInput,
  ModelSelect,
  PromptTemplateSelector,
  ProviderSelect,
  basaltTokens,
  cn,
  generateCssVariables,
  useAiConfig,
  useAiSettings,
  useAiTest,
  useProviderRegistry
};
//# sourceMappingURL=react.js.map