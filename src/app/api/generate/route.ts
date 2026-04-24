import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import type { Framework, ProjectTemplate } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    message,
    existingFiles,
    framework = "react",
    template = null,
    conversationHistory,
    apiKey: clientApiKey,
    model: clientModel,
    maxTokens: clientMaxTokens,
  } = body as {
    message: string;
    existingFiles?: Record<string, string>;
    framework?: Framework;
    template?: ProjectTemplate | null;
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
    apiKey?: string;
    model?: string;
    maxTokens?: number;
  };

  const apiKey = clientApiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "No API key configured. Go to Settings and add your Anthropic API key, or set ANTHROPIC_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  if (!message) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const model = clientModel || "claude-sonnet-4-20250514";
  const maxTokens = clientMaxTokens || 16384;

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt(framework, template);

  const messages: Anthropic.MessageParam[] = [];

  if (conversationHistory && conversationHistory.length > 0) {
    for (const msg of conversationHistory.slice(-8)) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  messages.push({
    role: "user",
    content: buildUserPrompt(message, existingFiles),
  });

  const stream = await client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = `data: ${JSON.stringify({ type: "text", content: event.delta.text })}\n\n`;
            controller.enqueue(encoder.encode(chunk));
          }
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
