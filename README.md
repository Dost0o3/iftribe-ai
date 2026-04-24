# IFTribe.AI

An AI-powered app builder that lets you describe applications in natural language and generates working code with a live preview — similar to Bolt, Lovable, and Replit.

## Features

- **Chat Interface** — Describe the app you want to build in natural language
- **AI Code Generation** — Powered by Anthropic Claude to generate complete React applications
- **Live Preview** — See your generated app running in real-time via Sandpack
- **Code Editor** — View and edit generated code with syntax highlighting
- **File Explorer** — Browse all generated project files
- **Streaming Responses** — Watch code being generated in real-time
- **Iterative Building** — Continue the conversation to modify and improve your app

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **AI**: Anthropic Claude API
- **Preview**: CodeSandbox Sandpack
- **UI**: Lucide React icons, React Resizable Panels

## Getting Started

### Prerequisites

- Node.js 20+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Dost0o3/iftribe-ai.git
   cd iftribe-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Type a description of the app you want to build in the chat panel
2. Watch as IFTribe.AI generates the code in real-time
3. View the live preview in the Preview tab
4. Switch to the Code tab to browse and edit files
5. Continue the conversation to iterate on your app

## Project Structure

```
src/
├── app/
│   ├── api/generate/route.ts   # Anthropic Claude streaming API
│   ├── globals.css             # Global styles & theme
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   ├── AppBuilder.tsx          # Main app layout with panels
│   ├── ChatPanel.tsx           # Chat interface
│   ├── CodeEditor.tsx          # Code editing textarea
│   ├── FileExplorer.tsx        # File tree sidebar
│   └── PreviewPanel.tsx        # Sandpack live preview
└── lib/
    ├── file-parser.ts          # Parse generated files from AI response
    ├── prompts.ts              # System & user prompts
    └── types.ts                # TypeScript types
```

## License

MIT
