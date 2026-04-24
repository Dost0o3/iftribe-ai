# Testing IFTribe.AI

## Overview
IFTribe.AI is a Next.js 16 app builder that uses OpenRouter API for LLM code generation, Sandpack for live preview, and 21st.dev Infinite Grid for animated backgrounds.

## Devin Secrets Needed
- `OPENROUTER_API_KEY` — OpenRouter API key (sk-or-v1-...) for code generation. Set in `.env.local` and/or configured via the Settings panel in the browser UI.

## Environment Setup
```bash
cd /home/ubuntu/repos/iftribe-ai
npm install
echo "OPENROUTER_API_KEY=<your-key>" > .env.local
npm run dev
# Dev server starts at http://localhost:3000
```

## Key Testing Flows

### 1. Welcome Screen
- Navigate to http://localhost:3000
- Verify: Logo, tagline ("The Don of App Building"), 4 suggestion cards, "VIA OPENROUTER" badge in header
- Verify Infinite Grid animation on both ChatPanel (left) and PreviewPanel (right)

### 2. SVG Pattern ID Uniqueness
- Two InfiniteGrid instances render simultaneously (ChatPanel + PreviewPanel)
- Each creates 2 `<pattern>` elements — 4 total in DOM
- Verify unique IDs via console: `Array.from(document.querySelectorAll('pattern[id^="infinite-grid"]')).map(p => p.id)`
- Expected: 4 patterns with exactly 2 unique ID prefixes

### 3. Settings Panel
- Click gear icon in header to open Settings
- Verify: "OPENROUTER API KEY" label, `sk-or-v1-...` placeholder, 6 model cards
- Models: Claude Sonnet 4 (default), Claude Opus 4, Claude 3.5 Haiku, GPT-4o, Gemini 2.5 Pro, DeepSeek V3
- Enter API key, click Save Settings, verify persistence after page reload

### 4. Code Generation
- Enter a prompt in the chat textarea, click submit
- Verify: "Forging your application..." loading state appears
- After streaming completes: chat shows generated code, preview panel transitions to "LIVE PREVIEW"
- Click "Code" tab to verify file explorer shows extracted files

## Common Issues & Workarounds

### OpenRouter Credit Limits
- Free-tier accounts may have very low credit limits (e.g., ~2666 tokens)
- Claude Sonnet 4 at 16384 max_tokens will return 402 if credits are insufficient
- **Workaround**: Switch to DeepSeek V3 (Budget model) and lower max_tokens to 4096 in Settings
- The 402 error is a billing issue, not a code bug

### Invalid Model IDs
- OpenRouter model IDs do NOT include date suffixes
- Valid: `anthropic/claude-sonnet-4` (NOT `anthropic/claude-sonnet-4-20250514`)
- Valid: `anthropic/claude-3.5-haiku` (NOT `anthropic/claude-3-5-haiku-20241022`)
- To verify valid IDs: `curl -s https://openrouter.ai/api/v1/models | jq '.data[].id'`

### Sandpack Preview Dependency Errors
- LLMs may generate code importing libraries not available in Sandpack (e.g., `@emotion/styled`, `styled-components`)
- This causes "Could not find dependency" errors in the preview
- This is a model output quality issue, not a code bug
- The system prompt should instruct LLMs to only use inline styles or CSS modules

### Stale localStorage
- After changing model IDs or API configuration, old cached values in localStorage may cause issues
- Always clear localStorage before testing: `localStorage.clear()` in browser console, then reload
- The app stores: `iftribe_api_key`, `iftribe_model`, `iftribe_max_tokens`

## API Testing (Direct)
```bash
curl -s -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"message":"say hi","model":"deepseek/deepseek-chat-v3-0324","maxTokens":4096}' \
  --max-time 30
```
Note: The API expects `message` (singular string), NOT `messages` (array). The API key can be passed via `apiKey` field or read from `OPENROUTER_API_KEY` env var.

## Tech Stack Notes
- Next.js 16 with Turbopack (NOT older versions — check `node_modules/next/dist/docs/` for breaking changes)
- React 19 with `useId()` hook for unique IDs
- Tailwind CSS v4 (different config format from v3)
- SSE streaming for code generation responses
