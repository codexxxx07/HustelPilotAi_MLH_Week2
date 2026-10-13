# HustlePilot AI

**Less Admin. More Earning.**

HustlePilot AI is an open-source, AI-powered business assistant for freelancers, independent developers, designers, and small business owners. It reduces the time spent on proposals, estimates, invoices, and client communications.

> Built for the Hacktoberfest Open-Source AI Challenge — Week 2: Side Hustle.

---

## Live Demo

Run locally (see Installation). No hosted demo — this is intentionally a local-first application.

---

## Target Audience

- Freelancers writing proposals and invoices
- Independent developers and designers billing for projects
- Students with side hustles
- Small business owners needing lightweight business documentation

---

## Core Features

| Feature | Description |
|---|---|
| **AI Proposal Generator** | Generates professional client proposals from a short brief |
| **Project Cost Estimator** | Transparent JavaScript calculations + AI risk analysis |
| **Invoice Generator** | Full invoice lifecycle: create, edit, track, print as PDF |
| **Client Communication** | Draft polished emails for any client situation |
| **Business Dashboard** | Real stats from your actual saved data |
| **Document Workspace** | Search, filter, edit, duplicate, and export all documents |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Routing | React Router v7 |
| Icons | Lucide React |
| AI Runtime | Ollama (local open-weight inference) |
| Default Model | Llama 3.2 (Meta, Llama 3 Community License) |
| Data Storage | Browser localStorage (local-first, no backend) |
| Build | Vite |

---

## Installation

### Prerequisites

- Node.js 18+
- npm 9+
- (Optional, for AI features) [Ollama](https://ollama.com/) installed and running

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/hustlepilot-ai.git
cd hustlepilot-ai

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## AI Setup (Ollama)

AI features require Ollama running locally. The app works without AI — invoicing, editing, and fallback templates are always available.

### Install Ollama

Download from [ollama.com](https://ollama.com/) and follow the installation for your OS.

### Pull a Model

```bash
# Recommended for most machines (2GB, fast)
ollama pull llama3.2

# Higher quality, requires 8GB+ RAM
ollama pull llama3.1:8b

# Lightweight alternative (2.3GB)
ollama pull phi3
```

### Verify

```bash
ollama list
# Should show your pulled models

curl http://localhost:11434/api/tags
# Should return JSON with your models
```

Open HustlePilot AI → Settings → Test Connection to verify.

---

## Model Selection

| Model | Size | RAM Required | Quality |
|---|---|---|---|
| `llama3.2` | ~2GB | ≥6GB | Good for business text |
| `llama3.1:8b` | ~4.7GB | ≥8GB | Better quality |
| `mistral` | ~4GB | ≥8GB | Good alternative |
| `phi3` | ~2.3GB | ≥6GB | Lightweight |
| `gemma2` | ~5GB | ≥8GB | Strong writer |

**License note:** Llama 3.2 is released under the [Meta Llama 3 Community License](https://llama.meta.com/llama3/license/). This is open-weight (weights are public) but not OSI-certified open source. Check each model's license before commercial deployment at scale.

---

## Privacy Architecture

- **Local-first storage:** All data is saved in browser `localStorage`. Nothing is sent to any server.
- **Local AI inference:** When Ollama runs locally, AI generation happens on your machine. Your documents do not leave your device.
- **Remote inference (optional):** If you configure a remote Ollama endpoint, data is sent to that endpoint. This is your responsibility to configure securely.
- **No analytics:** HustlePilot AI includes no tracking, telemetry, or analytics.
- **No encryption:** localStorage is not encrypted. Treat it as local plaintext storage.

---

## Offline Functionality

| Feature | Works Offline? |
|---|---|
| Create/edit invoices | ✅ Always |
| View saved documents | ✅ Always |
| Export to PDF (print) | ✅ Always |
| Use fallback templates | ✅ Always |
| AI proposal generation | ✅ With local Ollama |
| AI communication drafts | ✅ With local Ollama |
| AI project analysis | ✅ With local Ollama |

Google Fonts (Inter) require an internet connection to load optimally; the app falls back to system fonts if offline.

---

## Development Commands

```bash
npm run dev      # Start development server (localhost:5173)
npm run build    # Production build (output: dist/)
npm run preview  # Preview production build locally
```

---

## Build & Deployment

```bash
npm run build
```

Output is in `dist/`. Deploy to any static hosting provider (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

**Note:** This is a client-side SPA. Configure your host to serve `index.html` for all routes (SPA fallback).

**Important:** Ollama runs on the user's local machine. If you deploy this app publicly, users must install Ollama themselves for AI features to work. The app is fully functional without AI.

---

## Environment Variables

No environment variables are required for the default configuration.

Optional (see `.env.example`):
```
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2
```

**Never commit API keys or secrets to this repository.**

---

## Current Limitations

- AI generation requires Ollama installed and a model pulled (≥2GB download)
- localStorage has a storage limit (~5-10MB depending on browser)
- No multi-device sync; data is device-local
- No user authentication (by design — local-first)
- No automatic invoice delivery; users must send invoices manually
- No built-in payment processing

---

## Potential Future Improvements

- PDF export library (replacing browser print dialog)
- IndexedDB for larger storage capacity
- Optional cloud sync via user-supplied storage (e.g., local file export to Google Drive)
- Invoice recurring / scheduled generation
- Client contact book
- Proposal version history
- Time tracking integration
- Support for additional Ollama-compatible inference runtimes

---

## Contributing

This project is open source under the MIT License. Contributions welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

Please do not commit real client data, private credentials, or model weight files.

---

## License

MIT License — see `LICENSE` for details.

The default AI model (Llama 3.2) is licensed under the [Meta Llama 3 Community License](https://llama.meta.com/llama3/license/), which is separate from this application's MIT license.
