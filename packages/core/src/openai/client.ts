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
  private temperature: number;
  private maxCompletionTokens: number;

  constructor(config: OpenAIClientConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model ?? "gpt-5";
    this.temperature = config.temperature ?? 0.8;
    this.maxCompletionTokens = config.maxCompletionTokens ?? 1024;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: this.temperature,
      max_completion_tokens: this.maxCompletionTokens,
    });

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

