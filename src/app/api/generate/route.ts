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

  const apiKey = clientApiKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "No API key configured. Go to Settings and add your OpenRouter API key, or set OPENROUTER_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  if (!message) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  const model = clientModel || "anthropic/claude-sonnet-4-20250514";
  const maxTokens = clientMaxTokens || 16384;
  const systemPrompt = buildSystemPrompt(framework, template);

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  if (conversationHistory && conversationHistory.length > 0) {
    for (const msg of conversationHistory.slice(-8)) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({
    role: "user",
    content: buildUserPrompt(message, existingFiles),
  });

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://iftribe.ai",
      "X-Title": "IFTribe.AI",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return Response.json(
      { error: `OpenRouter API error: ${response.status} - ${errorText}` },
      { status: response.status }
    );
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
              );
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "text", content })}\n\n`)
                );
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        if (buffer.trim()) {
          const trimmed = buffer.trim();
          if (trimmed.startsWith("data: ")) {
            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
              );
            } else {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "text", content })}\n\n`)
                  );
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`)
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
