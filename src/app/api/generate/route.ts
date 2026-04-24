import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import type { Framework, ProjectTemplate } from "@/lib/types";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not configured. Please set it in your environment variables." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const {
    message,
    existingFiles,
    framework = "react",
    template = null,
    conversationHistory,
  } = body as {
    message: string;
    existingFiles?: Record<string, string>;
    framework?: Framework;
    template?: ProjectTemplate | null;
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!message) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

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
    model: "claude-sonnet-4-20250514",
    max_tokens: 16384,
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
