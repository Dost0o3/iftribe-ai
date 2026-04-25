# Testing IFTribe.AI

## Overview
IFTribe.AI is a Next.js 16 AI app builder with chat-based code generation, Sandpack live preview, and file management. It uses an OpenAI-compatible LLM API (currently Clod.io) for streaming code generation.

## Dev Server Setup
```bash
cd /home/ubuntu/repos/iftribe-ai
npm install
npm run dev
# Server runs at http://localhost:3000
```

## Devin Secrets Needed
- `CLOD_API_KEY`: Clod.io JWT token for LLM API access. Set in `.env.local` as `CLOD_API_KEY=<token>` or enter via the Settings panel in the UI.

## Key Testing Flows

### 1. UI Label Verification
- Open localhost:3000
- Check header badge shows current LLM provider name (e.g., "VIA CLOD.IO")
- Click gear icon (top-right) to open Settings panel
- Verify API key label, placeholder text, and model list match the current provider
- Count model cards and verify names/badges match expected values

### 2. End-to-End Code Generation
- Ensure API key is configured (either in `.env.local` or via Settings panel)
- Type a simple prompt like "Build a hello world page with a heading and a paragraph"
- Click the send button (arrow icon)
- Watch for loading indicator: "The family is working on it..."
- Wait for streaming to complete (typically 10-30 seconds)
- Verify: "X files" badge appears in header, Code tab shows generated files, Preview tab shows "LIVE PREVIEW" with green indicator

### 3. Model ID Migration (when switching LLM providers)
- Set a stale model ID in console: `localStorage.setItem('iftribe_model', '<old-provider-model-id>')`
- Reload page and open Settings
- Verify the model selector shows the default model (not the stale one)
- Check localStorage was updated: `localStorage.getItem('iftribe_model')` should show the new default

### 4. Regression: No Stale Provider References
- Search page text via console: `document.body.innerText.toLowerCase().includes('<old-provider-name>')`
- Should return `false` for all previous provider names
- Also grep source code: `rg -i '<old-provider-name>' src/`

## Known Issues & Workarounds

### Sandpack Preview May Be Blank
Some LLMs generate code using framework-specific syntax (e.g., `style jsx` for Next.js) that Sandpack's React sandbox doesn't support. The preview iframe will load ("LIVE PREVIEW" shows green) but render blank. This is a prompt engineering concern, not an integration bug. Workaround: The system prompt in `src/lib/prompts.ts` could be updated to instruct models to use only inline styles.

### Model Quota Errors
Free-tier LLM APIs may have daily quotas. If a model returns 403/429 "quota exceeded", switch to another model in Settings. Not all 6 models may be available at all times.

### Hydration Warnings
Browser extensions (e.g., Liner, Grammarly) inject attributes into the DOM causing React hydration mismatches. These warnings are harmless and not caused by the app code.

## Architecture Notes
- API route: `src/app/api/generate/route.ts` — handles LLM API calls with SSE streaming
- Model definitions: `src/lib/models.ts` — shared model list and migration function
- Settings UI: `src/components/SettingsPanel.tsx` — API key input and model selector
- Main orchestrator: `src/components/AppBuilder.tsx` — reads localStorage, sends requests, parses responses
- File parser: `src/lib/file-parser.ts` — extracts files from LLM response text
- Preview: Uses Sandpack (`@codesandbox/sandpack-react`) for live React preview

## Testing Tips
- Always clear localStorage before testing to ensure clean state: `localStorage.clear()`
- The API key can be set either via `.env.local` (server-side) or the Settings panel (client-side, sent in request body)
- When testing streaming, watch the network tab for `/api/generate` — it should return `text/event-stream` content type
- The app auto-saves projects to localStorage — use "Clear All Data" in Settings to reset
