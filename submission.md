---
title: "HustlePilot AI — Less Admin. More Earning."
published: false
tags: devchallenge, hf26challenge
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)*

## What I Built

HustlePilot AI is an open-source, local-first business assistant for freelancers, indie developers, designers, students running a side hustle, and small business owners. It brings the repetitive admin work of running a one-person business — proposals, project estimates, invoices, client messages, and document tracking — into a single responsive workspace, with open-weight AI drafting assistance layered on top.

The problem is simple and familiar: the unpaid hours between the actual work. Writing proposals from a blank page, guessing at project costs, formatting invoices, and rewording the same "just following up" email all eat into billable time. Most AI tools that promise to help require a cloud account, ship client data to third-party servers, and bill per request — which is a hard sell when you are handling confidential client information and watching margins.

HustlePilot AI targets exactly those users and takes a different approach: run the assistant on your own machine, connect it to a locally hosted model, and keep the documents on your device. It is useful for anyone who bills clients and wants administrative leverage without handing their business data to a subscription service.

Features that are actually implemented in the codebase:

- **Business dashboard** — real statistics derived from saved data: proposal and invoice counts, total invoiced, total paid, outstanding balance, and an overdue-invoice alert.
- **AI proposal generator** — generates a structured proposal from a short brief, with a toggle between AI generation and a built-in template.
- **Project cost estimator** — deterministic JavaScript arithmetic (hourly or fixed pricing, contingency based on complexity, additional expenses) plus an optional AI analysis of task breakdown and scope risks. The AI is explicitly never used for the arithmetic.
- **Invoice manager** — full lifecycle: create, edit, line items, tax, currency selection, status tracking (draft / sent / paid / overdue), search and filter, duplicate, delete, and print-to-PDF via the browser.
- **Client communication drafts** — professional messages for common situations (inquiry replies, payment reminders, project updates, scope changes), with tone and relationship controls.
- **Document workspace** — a single searchable, filterable, sortable list of all proposals, invoices, messages, and estimates, with JSON backup export/import.
- **Light and dark mode** — a persisted theme with no flash of the wrong theme on first paint.
- **Claymorphism-inspired UI** — a soft, tactile design system built with Tailwind CSS v4, fully responsive.

People pay for tools that give back time. A freelancer who bills for their hours benefits directly when proposals and invoices stop consuming them, and a single retained client more than pays for the convenience. HustlePilot AI is positioned as something a user could reasonably pay for because it replaces recurring, annoying work — not because of inflated claims.

## Demo

There is currently **no hosted demo**. The project is intentionally local-first, and the README states this explicitly. A public deployment would not carry AI features for visitors anyway, because the app expects a local Ollama server on the user's own machine.

**Demo status: pending — _[add a live URL or recorded video here if one is created]_.**

To run it locally:

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Code

Repository: **[https://github.com/codexxxx07/HustelPilotAi_MLH_Week2](https://github.com/codexxxx07/HustelPilotAi_MLH_Week2)**

Technology stack, as reflected in `package.json` and the source tree:

- **React 19** — UI framework
- **Vite 8** — build tool and dev server
- **Tailwind CSS v4** (via `@tailwindcss/vite`) — styling
- **React Router v7** — client-side routing
- **Lucide React** — icons
- **Oxlint** — linting
- **Browser `localStorage`** — data persistence (no backend)
- **Ollama HTTP API** — optional local inference for open-weight models

The application code is MIT licensed (see `LICENSE`). The AI models it can connect to carry their own separate licenses.

## How I Built It

HustlePilot AI is a client-side single-page application. `src/main.jsx` mounts the app inside a theme provider, and `src/App.jsx` defines the routes, with a shared `Layout` wrapping the dashboard, proposals, estimator, invoices, communications, documents, settings, and about pages. The landing page sits outside that layout.

The architecture separates concerns into three clear layers:

1. **Presentation** — the `pages/` route components and a shared component library in `src/components/ui.jsx` (buttons, cards, modals, fields, print portals, and the section/nav primitives). The Claymorphism look lives in a design-token-driven `src/index.css`.
2. **State and persistence** — `src/services/storage.js` wraps `localStorage` behind small typed modules (`proposalStorage`, `invoiceStorage`, `communicationStorage`, `estimateStorage`, `settingsStorage`, `backupStorage`). Every read is guarded so corrupt or missing data falls back safely, and all records carry generated IDs and timestamps.
3. **AI service** — `src/services/ai.js` is the single integration point for the model runtime.

The AI layer talks to a locally running **Ollama** server over its HTTP API. It calls `GET /api/tags` to check whether the server is reachable and which models are installed, and `POST /api/generate` (with `stream: false` and a two-minute timeout) to produce text. Prompts and system prompts are defined per feature — proposal writing, estimation analysis, client communication, and document improvement — and are written to avoid fabricated credentials, testimonials, or arithmetic, deliberately marking gaps with `[REQUIRED: …]` placeholders for the user to fill in.

Two things matter for honesty about the AI implementation:

- **The model runtime is intentionally external.** The default configured model is `llama3.2`, pointing at `http://localhost:11434`. Both the endpoint and the model are configurable from the in-app Settings page, where a "Test" button verifies the connection and lists the installed models. The app does not bundle or ship any model weights. Running a live generation requires the user to install Ollama and pull a model separately; the integration is fully implemented against Ollama's API, but the inference itself happens in the user's local Ollama instance.
- **The model layer is provider-shaped, not hard-coded to one model.** The project description mentions open-weight models and local inference as its core design goal, and the implementation reflects a model-agnostic approach — any Ollama-compatible model can be selected.

AI is treated as an enhancement, not a dependency. Every AI call is wrapped so that if Ollama is unavailable, the request fails, or it is switched off, the app degrades gracefully:

- Proposal and communication generation fall back to clearly labeled, honest templates that prompt the user to complete marked sections.
- The estimator's cost math is pure JavaScript and always runs; AI only adds optional risk analysis.
- Invoicing, editing, saving, searching, printing, and backup export/import never touch the AI layer at all.

That is a real, verifiable behavior of the current code, not a future promise. It means the tool stays useful with no model installed — you just get less drafting help.

Everything is persisted in the browser. There is no server, no account system, and no analytics or telemetry of any kind. Data is unencrypted `localStorage`, and the app is candid about that in the UI and README.

## Why Does Open Innovation Matter?

For a tool like HustlePilot AI, open innovation is not a slogan — it maps directly onto the design decisions already present in the code.

**It puts the user in control of the AI layer.** Because the assistant connects to a locally hosted Ollama server rather than a fixed cloud API, the person running it decides which model to use and where inference happens. The model is a setting, not a vendor lock-in. That is only possible because open-weight models can be downloaded and run on hardware a freelancer already owns.

**It keeps sensitive business documents closer to home.** In the default local configuration, proposals, client names, and financial data stay on the user's machine and are never sent to a third-party AI provider. That matters when the documents contain a client's pricing, scope, or confidential details. This is an implemented property of the local mode — with the honest caveat that if a user points the app at a remote endpoint, data goes to that endpoint, and `localStorage` itself is not encrypted.

**It reduces dependence on a single provider.** A model-agnostic service layer means the project is not tied to one company's pricing, rate limits, or availability. The user can swap models as better open-weight options appear.

**It can be inspected, adapted, and extended.** The whole application — the prompt templates, the fallback logic, the storage layer, the UI — is MIT-licensed and readable. A developer can adjust how proposals are written, add a new document type, or wire in a different inference runtime without asking permission.

**It invites contribution.** Every meaningful capability, from better estimation heuristics to additional model support, is a self-contained place for an outside contributor to help.

It is equally important to be precise about what this does *not* claim. Open-weight is not the same as fully open-source: the default Llama 3.2 model is released under the Meta Llama 3 Community License, which publishes the weights but is not OSI-certified and carries usage conditions, so the project's code license and the model's license are deliberately kept separate. Running a local model is not free — it costs disk space, RAM, electricity, and setup time, and it can be slower or lower quality than a large hosted model. The privacy benefits are real but scoped to local inference, not universal. Distinguishing what is already true from what is merely possible is part of what makes the open approach credible.

## Prize Categories

HustlePilot AI is genuinely built around open-weight models and local inference, but it does not currently integrate any specific partner technology (no sponsor SDKs, hosting, databases, telemetry, or tracing services appear in the dependency list or source code). Listing a partner category without that integration would be a claim I cannot back up.

The categories offered for this challenge are:

- **Featured:** Render, TabPFN, Tinker, Arduino, DigitalOcean, Gemma
- **Partner:** Backboard, ElevenLabs, Entire, GitHub Copilot, Mastra, MongoDB Atlas, Sentry Agent Tracing, SerpApi, a .tech Domain, Temporal, Tiger Data

**Prize categories: pending — _[list only the categories you can genuinely support with a real integration, or mark this section for removal]_.**

For example, `gemma2` is selectable as a model in the app's Settings, so a *Best Use of Gemma* entry would only be defensible if the project is actually run and demonstrated with a Gemma model — not merely listed as an option.
