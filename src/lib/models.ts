export const DEFAULT_MODEL = "Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8";

export const MODELS = [
  { id: "Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8", name: "Qwen 3 Coder 480B", badge: "Recommended", speed: "Fast" },
  { id: "openai/gpt-oss-120b", name: "GPT OSS 120B", badge: "Most Capable", speed: "Fast" },
  { id: "Qwen/Qwen3-235B-A22B-Thinking-2507", name: "Qwen 3 235B Thinking", badge: "Reasoning", speed: "Fast" },
  { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Meta Llama 3.3 70B", badge: "Free", speed: "Fast" },
  { id: "OpenAI/gpt-oss-20B", name: "GPT OSS 20B", badge: "Free", speed: "Ultra Fast" },
  { id: "trinity-mini", name: "Trinity Mini", badge: "Free", speed: "Ultra Fast" },
];

const MODEL_IDS = new Set<string>(MODELS.map((m) => m.id));

export function migrateModelId(stored: string | null): string {
  if (!stored) return DEFAULT_MODEL;
  if (MODEL_IDS.has(stored)) return stored;
  for (const m of MODELS) {
    if (m.id.endsWith(stored) || m.name.toLowerCase().includes(stored.toLowerCase())) {
      if (typeof window !== "undefined") localStorage.setItem("iftribe_model", m.id);
      return m.id;
    }
  }
  if (typeof window !== "undefined") localStorage.setItem("iftribe_model", DEFAULT_MODEL);
  return DEFAULT_MODEL;
}
