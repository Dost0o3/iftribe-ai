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
  framework: Framework;
  template: ProjectTemplate | null;
  createdAt: number;
  updatedAt: number;
}

export type Framework =
  | "react"
  | "vue"
  | "svelte"
  | "vanilla"
  | "nextjs"
  | "web3-react"
  | "web3-vanilla";

export type ProjectTemplate =
  | "blank"
  | "landing-page"
  | "saas-dashboard"
  | "ecommerce"
  | "portfolio"
  | "blog"
  | "defi-dashboard"
  | "nft-marketplace"
  | "dapp"
  | "wallet-app"
  | "dao-governance"
  | "token-launchpad"
  | "api-dashboard"
  | "chat-app"
  | "social-media"
  | "crm"
  | "ai-chatbot"
  | "ai-image-gen"
  | "ai-agent"
  | "did-identity"
  | "dwn-app"
  | "verifiable-credentials";

export interface TemplateInfo {
  id: ProjectTemplate;
  name: string;
  description: string;
  icon: string;
  category: "web2" | "web3" | "saas" | "social" | "ai" | "web5";
  frameworks: Framework[];
}

export interface FrameworkInfo {
  id: Framework;
  name: string;
  icon: string;
  description: string;
}

export const FRAMEWORKS: FrameworkInfo[] = [
  { id: "react", name: "React", icon: "⚛️", description: "Modern UI library" },
  { id: "vue", name: "Vue.js", icon: "💚", description: "Progressive framework" },
  { id: "vanilla", name: "HTML/CSS/JS", icon: "🌐", description: "Pure web standards" },
  { id: "nextjs", name: "Next.js", icon: "▲", description: "Full-stack React framework" },
  { id: "web3-react", name: "Web3 + React", icon: "🔗", description: "dApp with React" },
  { id: "web3-vanilla", name: "Web3 + JS", icon: "⛓️", description: "dApp with vanilla JS" },
];

export const TEMPLATES: TemplateInfo[] = [
  // Web2
  { id: "blank", name: "Blank Project", description: "Start from scratch — no limits", icon: "📄", category: "web2", frameworks: ["react", "vue", "vanilla", "nextjs"] },
  { id: "landing-page", name: "Landing Page", description: "Marketing page with hero, features, CTA", icon: "🚀", category: "web2", frameworks: ["react", "vue", "vanilla", "nextjs"] },
  { id: "portfolio", name: "Portfolio", description: "Personal portfolio with projects showcase", icon: "🎨", category: "web2", frameworks: ["react", "vue", "vanilla", "nextjs"] },
  { id: "blog", name: "Blog", description: "Blog with posts, categories, comments", icon: "📝", category: "web2", frameworks: ["react", "nextjs"] },
  { id: "ecommerce", name: "E-Commerce", description: "Product catalog, cart, checkout flow", icon: "🛒", category: "web2", frameworks: ["react", "nextjs"] },
  // SaaS
  { id: "saas-dashboard", name: "SaaS Dashboard", description: "Admin dashboard with charts, tables, auth", icon: "📊", category: "saas", frameworks: ["react", "nextjs"] },
  { id: "api-dashboard", name: "API Dashboard", description: "API management with keys, usage stats", icon: "🔌", category: "saas", frameworks: ["react", "nextjs"] },
  { id: "crm", name: "CRM", description: "Customer relationship management system", icon: "👥", category: "saas", frameworks: ["react", "nextjs"] },
  // Social
  { id: "chat-app", name: "Chat App", description: "Real-time messaging interface", icon: "💬", category: "social", frameworks: ["react", "nextjs"] },
  { id: "social-media", name: "Social Media", description: "Feed, profiles, posts, likes", icon: "📱", category: "social", frameworks: ["react", "nextjs"] },
  // Web3
  { id: "defi-dashboard", name: "DeFi Dashboard", description: "Token swap, liquidity pools, yield farming", icon: "💰", category: "web3", frameworks: ["web3-react", "web3-vanilla"] },
  { id: "nft-marketplace", name: "NFT Marketplace", description: "Mint, buy, sell NFTs with gallery", icon: "🖼️", category: "web3", frameworks: ["web3-react", "web3-vanilla"] },
  { id: "dapp", name: "dApp", description: "Decentralized app with smart contracts", icon: "⛓️", category: "web3", frameworks: ["web3-react", "web3-vanilla"] },
  { id: "wallet-app", name: "Wallet App", description: "Crypto wallet with send/receive/history", icon: "👛", category: "web3", frameworks: ["web3-react", "web3-vanilla"] },
  { id: "dao-governance", name: "DAO Governance", description: "Proposals, voting, treasury management", icon: "🏛️", category: "web3", frameworks: ["web3-react", "web3-vanilla"] },
  { id: "token-launchpad", name: "Token Launchpad", description: "Token creation, presale, distribution", icon: "🪙", category: "web3", frameworks: ["web3-react", "web3-vanilla"] },
  // AI / Web4
  { id: "ai-chatbot", name: "AI Chatbot", description: "Conversational AI with streaming responses", icon: "🤖", category: "ai", frameworks: ["react", "nextjs", "vanilla"] },
  { id: "ai-image-gen", name: "AI Image Generator", description: "Text-to-image generation UI", icon: "🎆", category: "ai", frameworks: ["react", "nextjs"] },
  { id: "ai-agent", name: "AI Agent Dashboard", description: "Multi-agent orchestration & monitoring", icon: "🧠", category: "ai", frameworks: ["react", "nextjs"] },
  // Web5 / Decentralized Identity
  { id: "did-identity", name: "DID Identity", description: "Decentralized identity & profile manager", icon: "🆔", category: "web5", frameworks: ["react", "web3-react", "vanilla"] },
  { id: "dwn-app", name: "DWN App", description: "Decentralized Web Node data storage", icon: "🗄️", category: "web5", frameworks: ["react", "web3-react", "vanilla"] },
  { id: "verifiable-credentials", name: "Verifiable Credentials", description: "Issue & verify digital credentials", icon: "📜", category: "web5", frameworks: ["react", "web3-react", "vanilla"] },
];
