import OpenAI from "openai";
import type { ChatMessage } from "../types";
import type { LanguageModelClient } from "../conversation/runTurn";

// GPT-5 specific types
export type GPT5Verbosity = "low" | "medium" | "high";
export type GPT5ReasoningEffort = "minimal" | "low" | "medium" | "high";

export interface OpenAIClientConfig {
  apiKey: string;
  model?: string;
  maxCompletionTokens?: number;
  // GPT-5 specific parameters
  verbosity?: GPT5Verbosity;
  reasoningEffort?: GPT5ReasoningEffort;
  // Legacy parameter (for non-GPT-5 models)
  temperature?: number;
}

export class OpenAIClient implements LanguageModelClient {
  private client: OpenAI;
  private model: string;
  private maxCompletionTokens: number;
  private verbosity?: GPT5Verbosity;
  private reasoningEffort?: GPT5ReasoningEffort;
  private temperature?: number;

  constructor(config: OpenAIClientConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model ?? "gpt-5-mini";
    this.maxCompletionTokens = config.maxCompletionTokens ?? 4096;
    this.verbosity = config.verbosity;
    this.reasoningEffort = config.reasoningEffort;
    this.temperature = config.temperature;
  }

  private isGPT5Model(): boolean {
    return this.model.startsWith("gpt-5");
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Build base request parameters
    const baseParams: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_completion_tokens: this.maxCompletionTokens,
    };

    // Add model-specific parameters
    if (this.isGPT5Model()) {
      // GPT-5 uses verbosity and reasoning_effort
      // Cast to any for GPT-5 specific params not yet in SDK types
      const gpt5Params = baseParams as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming & {
        verbosity?: string;
        reasoning_effort?: string;
      };
      
      if (this.verbosity) {
        gpt5Params.verbosity = this.verbosity;
      }
      if (this.reasoningEffort) {
        gpt5Params.reasoning_effort = this.reasoningEffort;
      }
      
      const response = await this.client.chat.completions.create(gpt5Params);
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content from OpenAI");
      }
      return content;
    } else {
      // Non-GPT-5 models use temperature
      if (this.temperature !== undefined) {
        baseParams.temperature = this.temperature;
      }
      
      const response = await this.client.chat.completions.create(baseParams);
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content from OpenAI");
      }
      return content;
    }
  }
}

export function createOpenAIClient(config: OpenAIClientConfig): LanguageModelClient {
  return new OpenAIClient(config);
}
