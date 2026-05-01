import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

/** SDK 协议类型 */
type SdkType = "anthropic" | "openai";
/** Provider 静态配置 */
interface AiProviderInfo {
    id: string;
    label: string;
    baseURL: string;
    sdkType: SdkType;
    models: string[];
    defaultModel: string;
}
/** 用户输入的设置（写入存储） */
interface AiSettingsInput {
    provider: string;
    apiKey: string;
    model: string;
    baseURL?: string;
    sdkType?: SdkType;
}
/** 从存储读取的设置（读取模型，apiKey 永不返回真实值） */
interface AiSettingsReadonly {
    provider: string;
    model: string;
    hasApiKey: boolean;
    baseURL?: string;
    sdkType?: SdkType;
}
/** 测试连接的配置（草稿配置，无需先保存） */
interface AiTestConfig {
    provider: string;
    /** API Key - 如果为空或未提供，服务端应使用已存储的 key */
    apiKey?: string;
    model: string;
    baseURL?: string;
    sdkType?: SdkType;
}
/** 存储适配器接口 - 消费方必须实现 */
interface AiStorageAdapter {
    /** 获取当前设置（读取模型，不含真实 apiKey） */
    getSettings(): Promise<AiSettingsReadonly>;
    /** 保存设置（部分更新） */
    saveSettings(settings: Partial<AiSettingsInput>): Promise<AiSettingsReadonly>;
    /** 测试 AI 连接（使用草稿配置，无需先保存） */
    testConnection(config: AiTestConfig): Promise<AiTestResult>;
}
/** AI 连接测试结果 */
interface AiTestResult {
    success: boolean;
    response?: string;
    model?: string;
    provider?: string;
    error?: string;
}

/** 可扩展 Provider 注册器 */
declare class AiProviderRegistry {
    private providers;
    constructor(customProviders?: Record<string, AiProviderInfo>);
    /** 获取指定 Provider 配置 */
    get(id: string): AiProviderInfo | undefined;
    /** 获取所有 Provider 配置 */
    getAll(): AiProviderInfo[];
    /** 获取所有 Provider ID（含 custom） */
    getAllIds(): string[];
    /** 注册新 Provider */
    register(info: AiProviderInfo): void;
    /** 检查 Provider 是否存在 */
    has(id: string): boolean;
}

interface AiConfigContextValue {
    settings: AiSettingsReadonly | null;
    loading: boolean;
    saving: boolean;
    registry: AiProviderRegistry;
    reload: () => Promise<void>;
    save: (updates: Partial<AiSettingsInput>) => Promise<void>;
    testConnection: (config: AiTestConfig) => Promise<AiTestResult>;
}
interface AiConfigProviderProps {
    adapter: AiStorageAdapter;
    registry?: AiProviderRegistry;
    children: React.ReactNode;
}
declare function AiConfigProvider({ adapter, registry, children, }: AiConfigProviderProps): react_jsx_runtime.JSX.Element;
declare function useAiConfig(): AiConfigContextValue;

/** 获取和管理 AI 设置 */
declare function useAiSettings(): {
    settings: AiSettingsReadonly | null;
    loading: boolean;
    saving: boolean;
    save: (updates: Partial<AiSettingsInput>) => Promise<void>;
    reload: () => Promise<void>;
};
/** AI 连接测试 hook */
declare function useAiTest(): {
    test: (config: AiTestConfig) => Promise<AiTestResult>;
    testing: boolean;
    result: AiTestResult | null;
    error: string | null;
};
/** 获取 Provider 注册表 */
declare function useProviderRegistry(): AiProviderRegistry;

interface AiSettingsPanelProps {
    /** 自定义类名 */
    className?: string;
    /** 保存成功回调 */
    onSaveSuccess?: () => void;
    /** 测试成功回调 */
    onTestSuccess?: (result: AiTestResult) => void;
    /** 测试失败回调 */
    onTestError?: (error: string) => void;
    /** 隐藏测试按钮 */
    hideTestButton?: boolean;
}
/**
 * 完整的 AI 设置面板，包含所有配置项
 *
 * 布局结构：
 * ┌─────────────────────────────────────────┐
 * │ AI Settings                    [Card L1] │
 * ├─────────────────────────────────────────┤
 * │ Provider        [Select ▼]              │
 * │ ─────────────────────────────────────── │
 * │ Model           [Select ▼]              │
 * │                 └─ or [Custom Input]    │
 * │ ─────────────────────────────────────── │
 * │ API Key         [●●●●●●●●] [👁]         │
 * │ ─────────────────────────────────────── │
 * │ (if custom provider)                    │
 * │ Base URL        [https://...]           │
 * │ SDK Type        [Select ▼]              │
 * │ ─────────────────────────────────────── │
 * │ [Test Connection]        [Save Settings]│
 * │ ─────────────────────────────────────── │
 * │ (Test Result Badge - success/error)     │
 * └─────────────────────────────────────────┘
 */
declare function AiSettingsPanel({ className, onSaveSuccess, onTestSuccess, onTestError, hideTestButton, }: AiSettingsPanelProps): react_jsx_runtime.JSX.Element;

interface ProviderSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
}
/**
 * Provider 选择器，支持内置和自定义 Provider
 *
 * 下拉选项：
 * - Anthropic
 * - MiniMax
 * - GLM (Zhipu)
 * - AIHubMix
 * - ────────────
 * - Custom
 */
declare function ProviderSelect({ value, onChange, disabled, className, id, }: ProviderSelectProps): react_jsx_runtime.JSX.Element;

interface ModelSelectProps {
    provider: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
}
/**
 * 模型选择器，根据选中的 Provider 显示可用模型，支持自定义输入
 *
 * 行为：
 * 1. 根据 provider 显示预设模型列表
 * 2. 列表末尾有 "Custom model..." 选项
 * 3. 选择 Custom 后切换为文本输入框
 */
declare function ModelSelect({ provider, value, onChange, disabled, className, id, }: ModelSelectProps): react_jsx_runtime.JSX.Element;

interface ApiKeyInputProps {
    value: string;
    onChange: (value: string) => void;
    hasStoredKey?: boolean;
    disabled?: boolean;
    className?: string;
    id?: string;
}
/**
 * API Key 输入框，支持显示/隐藏切换，已保存状态提示
 *
 * 状态：
 * 1. 未设置：显示空输入框
 * 2. 已设置（hasStoredKey=true）：显示 "●●●●●●●●" 占位
 * 3. 输入中：显示实际输入（可切换显示/隐藏）
 *
 * 交互：
 * - 右侧眼睛图标切换显示/隐藏
 * - 已设置时，点击输入框清空占位开始输入
 */
declare function ApiKeyInput({ value, onChange, hasStoredKey, disabled, className, id, }: ApiKeyInputProps): react_jsx_runtime.JSX.Element;

/** 变量值类型（支持嵌套对象以支持 {{user.name}} 路径） */
interface TemplateVariables {
    [key: string]: string | number | TemplateVariables;
}

/** 模板变量定义 */
interface TemplateVariable {
    /** 变量名，如 "date" */
    key: string;
    /** 显示名称，如 "日期" */
    label: string;
    /** 描述 */
    description?: string;
    /** 示例值 */
    example?: string;
    /** 是否必填，默认 true */
    required?: boolean;
}
/** Prompt 段落 */
interface PromptSection {
    /** 段落 ID，如 "section1" */
    id: string;
    /** 显示名称，如 "角色设定" */
    label: string;
    /** 模板内容，含 {{variable}} */
    content: string;
    /** 用户是否可编辑，默认 true */
    editable?: boolean;
}
/** Prompt 模板定义 */
interface PromptTemplate {
    /** 唯一标识，如 "daily-analysis" */
    id: string;
    /** 显示名称，如 "每日分析" */
    name: string;
    /** 模板描述 */
    description?: string;
    /** 多段式 prompt */
    sections: PromptSection[];
    /** 变量定义 */
    variables: TemplateVariable[];
}
/** 模板注册表 */
declare class PromptTemplateRegistry {
    private templates;
    /** 注册模板 */
    register(template: PromptTemplate): void;
    /** 获取模板 */
    get(id: string): PromptTemplate | undefined;
    /** 获取所有模板 */
    getAll(): PromptTemplate[];
    /** 获取所有模板 ID */
    getAllIds(): string[];
    /** 检查模板是否存在 */
    has(id: string): boolean;
    /** 构建完整 prompt（展开变量，合并段落） */
    build(templateId: string, variables: TemplateVariables, customSections?: Record<string, string>): string;
}

interface PromptTemplateSelectorProps {
    registry: PromptTemplateRegistry;
    value: string;
    onChange: (templateId: string) => void;
    /** 是否显示模板详情 */
    showDetails?: boolean;
    className?: string;
}
/**
 * 模板选择器，用于多模板场景
 *
 * 布局：
 * ┌─────────────────────────────────────────┐
 * │ Select template: [每日分析 ▼]           │
 * ├─────────────────────────────────────────┤
 * │ (if showDetails)                        │
 * │ 描述：分析用户一天的屏幕使用数据         │
 * │ 变量：date, totalDuration, topApps...   │
 * └─────────────────────────────────────────┘
 */
declare function PromptTemplateSelector({ registry, value, onChange, showDetails, className, }: PromptTemplateSelectorProps): react_jsx_runtime.JSX.Element;

/** Basalt 设计系统 CSS tokens */
declare const basaltTokens: {
    readonly light: {
        readonly background: "220 14% 94%";
        readonly foreground: "0 0% 12%";
        readonly card: "220 14% 97%";
        readonly cardForeground: "0 0% 12%";
        readonly secondary: "0 0% 100%";
        readonly secondaryForeground: "0 0% 12%";
        readonly input: "220 13% 88%";
        readonly border: "220 13% 88%";
        readonly primary: "220 90% 56%";
        readonly primaryForeground: "0 0% 100%";
        readonly destructive: "0 84% 60%";
        readonly destructiveForeground: "0 0% 100%";
        readonly muted: "220 14% 96%";
        readonly mutedForeground: "0 0% 45%";
    };
    readonly dark: {
        readonly background: "0 0% 9%";
        readonly foreground: "0 0% 93%";
        readonly card: "0 0% 10.6%";
        readonly cardForeground: "0 0% 93%";
        readonly secondary: "0 0% 12.2%";
        readonly secondaryForeground: "0 0% 93%";
        readonly input: "0 0% 18%";
        readonly border: "0 0% 16%";
        readonly primary: "220 90% 56%";
        readonly primaryForeground: "0 0% 100%";
        readonly destructive: "0 62% 50%";
        readonly destructiveForeground: "0 0% 100%";
        readonly muted: "0 0% 15%";
        readonly mutedForeground: "0 0% 64%";
    };
};
/** 生成 CSS 变量字符串 */
declare function generateCssVariables(mode: "light" | "dark"): string;
/** 类名合并工具（替代 clsx/tailwind-merge） */
declare function cn(...inputs: (string | undefined | null | false)[]): string;

export { AiConfigProvider, AiSettingsPanel, type AiSettingsPanelProps, ApiKeyInput, type ApiKeyInputProps, ModelSelect, type ModelSelectProps, PromptTemplateSelector, type PromptTemplateSelectorProps, ProviderSelect, type ProviderSelectProps, basaltTokens, cn, generateCssVariables, useAiConfig, useAiSettings, useAiTest, useProviderRegistry };
