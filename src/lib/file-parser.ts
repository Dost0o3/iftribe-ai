export function parseFilesFromResponse(text: string): Record<string, string> {
  const files: Record<string, string> = {};
  const fileRegex = /---FILE:\s*(\S+)\s*---\n([\s\S]*?)---END FILE---/g;

  let match;
  while ((match = fileRegex.exec(text)) !== null) {
    const filePath = match[1];
    const content = match[2].trim();
    files[filePath] = content;
  }

  return files;
}

export function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const langMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    css: "css",
    html: "html",
    json: "json",
    md: "markdown",
  };
  return langMap[ext] ?? "text";
}
