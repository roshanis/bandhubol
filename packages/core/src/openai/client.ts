import OpenAI from "openai";
import type { ChatMessage } from "../types";
import type { LanguageModelClient } from "../conversation/runTurn";

export interface OpenAIClientConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenAIClient implements LanguageModelClient {
  private client: OpenAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: OpenAIClientConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model ?? "gpt-4o-mini";
    this.temperature = config.temperature ?? 0.8;
    this.maxTokens = config.maxTokens ?? 1024;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: this.temperature,
      max_tokens: this.maxTokens,
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

