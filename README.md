# Superhuman Nutrition

A Next.js application for nutrition and health optimization with AI-powered insights.

## Features

- ⚡ Next.js 15 with App Router
- 🎨 TailwindCSS for styling
- 🧩 shadcn/ui components
- 🔒 Secure AI API integration
- 📝 TypeScript support
- 🎯 ESLint + Prettier configuration
- 🚀 Turbopack for fast development

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd superhuman-nutrition
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
# Edit .env.local and add your AI_API_KEY
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# AI API Configuration
AI_API_KEY=your_ai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_NAME=Superhuman Nutrition
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## API Endpoints

### `/api/ai`

Handles AI-powered nutrition and health queries.

**POST** `/api/ai`

- `prompt` (required): The user's question or request
- `model` (optional): AI model to use (default: gpt-3.5-turbo)
- `maxTokens` (optional): Maximum response length (default: 1000)

**Example:**

```bash
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What are the best foods for muscle building?"}'
```

## Project Structure

```
superhuman-nutrition/
├── src/
│   ├── app/                 # App Router pages
│   │   ├── api/            # API routes
│   │   │   └── ai/         # AI endpoint
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   └── lib/                # Utility functions
├── .env.local              # Environment variables
├── .prettierrc            # Prettier configuration
├── .prettierignore        # Prettier ignore rules
├── eslint.config.mjs      # ESLint configuration
├── tailwind.config.ts     # TailwindCSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting: `npm run lint && npm run format`
5. Submit a pull request

## License

This project is licensed under the MIT License.
