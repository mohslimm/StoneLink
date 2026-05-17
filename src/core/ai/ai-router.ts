import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export type AIModel = 'claude-3-5-sonnet' | 'gpt-4o' | 'deepseek-chat';
export type AIIntent = 'reasoning' | 'extraction' | 'creative' | 'logic';

interface RouterConfig {
  intent: AIIntent;
  priority: 'speed' | 'quality' | 'cost';
}

export class AIRouter {
  private static instance: AIRouter;
  private anthropic: Anthropic;
  private openai: OpenAI;

  private constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
  }

  public static getInstance(): AIRouter {
    if (!AIRouter.instance) {
      AIRouter.instance = new AIRouter();
    }
    return AIRouter.instance;
  }

  /**
   * Smart model selection based on intent and priority
   */
  public selectModel(config: RouterConfig): AIModel {
    if (config.priority === 'quality') {
      return config.intent === 'reasoning' ? 'claude-3-5-sonnet' : 'gpt-4o';
    }
    
    if (config.intent === 'logic') {
      return 'deepseek-chat'; // Best cost/performance for structured logic
    }

    return 'gpt-4o'; // Default balanced
  }

  /**
   * Execute a prompt through the selected model with fallback
   */
  public async execute(prompt: string, config: RouterConfig) {
    const model = this.selectModel(config);
    
    try {
      if (model === 'claude-3-5-sonnet') {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }]
        });
        return (response.content[0] as any).text;
      } else {
        const response = await this.openai.chat.completions.create({
          model: model === 'deepseek-chat' ? 'deepseek-chat' : 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        });
        return response.choices[0].message.content;
      }
    } catch (error) {
      console.error(`[AI_ROUTER] Error with ${model}:`, error);
      // Fallback to GPT-4o-mini or simple error handling
      throw new Error('AI_ORCHESTRATION_FAILED');
    }
  }
}

export const aiRouter = AIRouter.getInstance();
