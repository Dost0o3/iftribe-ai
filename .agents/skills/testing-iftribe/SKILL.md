# Testing IFTribe.AI

## Overview
IFTribe.AI is a Next.js app builder with AI code generation (Clod.io API), live Sandpack preview, and canvas-based GSAP spiral animation backgrounds.

## Environment Setup

```bash
cd /home/ubuntu/repos/iftribe-ai
npm install
npm run dev
# Dev server runs at http://localhost:3000
```

## Devin Secrets Needed
- `CLODIO_API_KEY` — JWT token for Clod.io API (api.clod.io/v1). Set in Settings panel UI or as `CLODIO_API_KEY` env var.

## Key Testing Areas

### 1. Spiral Animation Background
- **Canvas count**: `document.querySelectorAll('canvas').length` should return 3 (AppBuilder global, ChatPanel welcome, PreviewPanel empty)
- **Animation running**: Take two screenshots 5+ seconds apart — particle positions should differ
- **Z-index layering**: All UI text/buttons must be readable and clickable above the spiral. Spiral divs use `pointer-events-none` and `z-0`; content uses `relative z-10`
- **Performance**: Each SpiralAnimation instance creates 5,000 stars. Watch for duplicate `createStars()` calls that could double this count.

### 2. Clod.io Code Generation
- **API endpoint**: `/api/generate` (POST) streams SSE responses from `api.clod.io/v1/chat/completions`
- **Free models** (as of writing): Qwen 3 Coder 480B (default), GPT OSS 120B, Qwen 3 235B Thinking, Meta Llama 3.3 70B, GPT OSS 20B, Trinity Mini
- **Testing flow**: Click a suggestion button → textarea populates → submit → "The family is working on it..." loading → AI response streams → files parsed → header shows file count → Preview tab shows "LIVE PREVIEW"
- **Model quota**: Some models (e.g., Meta Llama 3.3 70B) might return "Team quota exceeded". Switch to another model if this happens.

### 3. Settings Panel
- Open via gear icon in header
- Should show "CLOD.IO API KEY" label (not OpenRouter/Anthropic)
- Model cards should display all 6 free models with correct names and badges

### 4. Sandpack Preview
- **Known limitation**: LLMs may generate code importing external packages (e.g., `react-dnd`, `@emotion/styled`) not available in the Sandpack sandbox. This causes dependency errors in the preview. This is a prompt engineering concern, not a code bug.
- If preview is blank or errored, check the Code tab to verify files were actually generated.

## Common Issues

### localStorage Stale Data
Old model IDs from previous providers (OpenRouter, Anthropic) may persist in localStorage causing 404 errors. Clear localStorage or verify the migration logic in `src/lib/models.ts` handles this.

### Hydration Warnings
Browser extensions (e.g., Liner, ad blockers) inject HTML attributes that cause React hydration mismatches. These are harmless and not caused by app code.

### Canvas Animation Not Visible
Spiral animations render at low opacity (30-40%). They may be subtle — look for faint white particle trails, especially near the edges of panels. The animation is most visible in the preview panel area.

## Testing Checklist Template
1. Clear localStorage (`localStorage.clear()` in console)
2. Reload page
3. Verify 3 canvas elements exist
4. Verify spiral particles animate (compare screenshots)
5. Verify all UI elements readable and clickable above spiral
6. Open Settings → verify Clod.io labels and 6 models
7. Submit a prompt → verify streaming completes
8. Check Code tab → verify files parsed
9. Check Preview tab → verify LIVE PREVIEW indicator
10. Grep for removed components (e.g., InfiniteGrid) to confirm no stale imports
