import * as _ai_sdk_provider from '@ai-sdk/provider';
import * as _ai_sdk_anthropic from '@ai-sdk/anthropic';
import * as _ai_sdk_openai from '@ai-sdk/openai';
import { ModelMessage } from 'ai';

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
/** 运行时完整配置 */
interface AiConfig {
    provider: string;
    baseURL: string;
    apiKey: string;
    model: string;
    sdkType: SdkType;
}
/** 用户输入的设置（写入存储） */
interface AiSettingsInput {
    provider: string;
    apiKey: string;
    model: string;
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
/** 配置校验错误 */
interface AiConfigError {
    field: string;
    message: string;
}

/** 创建 AI 客户端（根据 sdkType 选择 Anthropic 或 OpenAI） */
declare function createAiClient(config: AiConfig): _ai_sdk_openai.OpenAIProvider | _ai_sdk_anthropic.AnthropicProvider;
/** 创建 AI 模型实例（用于 Vercel AI SDK） */
declare function createAiModel(config: AiConfig): _ai_sdk_provider.LanguageModelV3;

/** AI Helper 选项 */
interface AiHelperOptions {
    settings: AiSettingsInput;
    maxOutputTokens?: number;
    temperature?: number;
    /** 超时时间（毫秒），默认 60000 */
    timeout?: number;
}
/** AI 完成结果 */
interface AiCompletionResult {
    text: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    durationMs: number;
}
/** 简单文本生成 */
declare function aiComplete(prompt: string, options: AiHelperOptions): Promise<AiCompletionResult>;
/** 多轮对话 */
declare function aiChat(messages: ModelMessage[], options: AiHelperOptions): Promise<AiCompletionResult>;
/** 流式文本生成 */
declare function aiStream(prompt: string, options: AiHelperOptions): Promise<ReadableStream<string>>;
/** 带自动重试的文本生成 */
declare function aiCompleteWithRetry(prompt: string, options: AiHelperOptions & {
    retries?: number;
    retryDelay?: number;
}): Promise<AiCompletionResult>;

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

/** 校验配置完整性，返回错误列表（空数组表示通过） */
declare function validateAiConfig(input: Partial<AiSettingsInput>, registry?: AiProviderRegistry): AiConfigError[];
/**
 * 校验测试连接配置（不检查 apiKey，因为服务端会从存储中补充）
 *
 * 用于测试连接场景：UI 可能不传 apiKey（使用已存储的 key）。
 * 服务端应该先合并 apiKey，再调用 resolveAiConfig。
 */
declare function validateTestConfig(input: Partial<AiTestConfig>, registry?: AiProviderRegistry): AiConfigError[];
/** 解析配置（校验通过后调用） */
declare function resolveAiConfig(input: AiSettingsInput, registry?: AiProviderRegistry): AiConfig;

/** 变量值类型（支持嵌套对象以支持 {{user.name}} 路径） */
interface TemplateVariables {
    [key: string]: string | number | TemplateVariables;
}
/** 模板变量展开 - Mustache 风格 {{variable}} 或 {{object.path}} */
declare function expandTemplate(template: string, variables: TemplateVariables): string;

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

export { type AiCompletionResult, type AiConfig, type AiConfigError, type AiHelperOptions, PromptTemplateRegistry, type TemplateVariables, aiChat, aiComplete, aiCompleteWithRetry, aiStream, createAiClient, createAiModel, expandTemplate, resolveAiConfig, validateAiConfig, validateTestConfig };
