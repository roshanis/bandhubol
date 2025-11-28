import OpenAI from "openai";
import type { ChatMessage } from "../types";
import type { LanguageModelClient } from "../conversation/runTurn";

export interface OpenAIClientConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxCompletionTokens?: number;
}

export class OpenAIClient implements LanguageModelClient {
  private client: OpenAI;
  private model: string;
  private temperature?: number;
  private maxCompletionTokens: number;

  constructor(config: OpenAIClientConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model ?? "gpt-5-mini";
    this.temperature = config.temperature;
    this.maxCompletionTokens = config.maxCompletionTokens ?? 4096;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Build request parameters
    const requestParams: OpenAI.Chat.ChatCompletionCreateParams = {
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_completion_tokens: this.maxCompletionTokens,
    };

    // Only add temperature if specified (some models don't support it)
    if (this.temperature !== undefined) {
      requestParams.temperature = this.temperature;
    }

    const response = await this.client.chat.completions.create(requestParams);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    return content;
  }
}

export function createOpenAIClient(config: OpenAIClientConfig): LanguageModelClient {
  return new OpenAIClient(config);
}
