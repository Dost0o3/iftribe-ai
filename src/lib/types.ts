export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface Project {
  id: string;
  name: string;
  files: Record<string, string>;
  messages: Message[];
  createdAt: number;
}

export interface StreamChunk {
  type: "text" | "file" | "done" | "error";
  content?: string;
  file?: GeneratedFile;
  error?: string;
}
