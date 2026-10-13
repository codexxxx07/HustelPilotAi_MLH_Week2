/**
 * HustlePilot AI — AI Service Layer
 * Modular AI integration using Ollama (open-weight models).
 * The model endpoint is fully configurable via settings.
 * All AI calls fail gracefully with honest error reporting.
 */

import { settingsStorage } from './storage.js';

// ── Ollama API Client ──────────────────────────────────────────────────────────

async function ollamaGenerate(prompt, systemPrompt = '') {
  const settings = settingsStorage.get();
  const { ollamaUrl, ollamaModel } = settings;

  const body = {
    model: ollamaModel || 'llama3.2',
    prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
    stream: false,
    options: {
      temperature: 0.7,
      num_predict: 2048,
    },
  };

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000), // 2 min timeout
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    throw new Error(`Ollama API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.response || '';
}

export async function checkOllamaAvailability() {
  const settings = settingsStorage.get();
  try {
    const res = await fetch(`${settings.ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { available: false, error: `Server responded with ${res.status}` };
    const data = await res.json();
    const models = (data.models || []).map(m => m.name);
    return { available: true, models };
  } catch (e) {
    return { available: false, error: e.message };
  }
}

// ── Proposal Generator ─────────────────────────────────────────────────────────

const PROPOSAL_SYSTEM = `You are a professional business proposal writer for freelancers and independent professionals.
Write clear, specific, professional proposals. 
Do NOT invent client testimonials, fake credentials, or previous experience.
Mark any placeholder information with [REQUIRED: description] so the user knows to fill it in.
Format your response with clear Markdown headings (## for sections, ### for sub-sections).
Be concise and focused on delivering real value to the client.`;

export async function generateProposal(inputs) {
  const {
    clientName, projectTitle, projectDescription, servicesIncluded,
    estimatedBudget, deliveryTimeline, tone, additionalRequirements
  } = inputs;

  const prompt = `Generate a professional freelance project proposal with the following details:

Client/Company: ${clientName}
Project Title: ${projectTitle}
Project Description: ${projectDescription}
Services Included: ${servicesIncluded}
Estimated Budget: ${estimatedBudget || '[To be discussed]'}
Delivery Timeline: ${deliveryTimeline || '[To be confirmed]'}
Preferred Tone: ${tone || 'Professional'}
Additional Requirements: ${additionalRequirements || 'None'}

Write a complete proposal with these sections:
1. Proposal Title
2. Executive Summary
3. Understanding of Requirements
4. Proposed Solution
5. Scope of Work
6. Project Milestones
7. Estimated Timeline
8. Budget Breakdown (based on the provided budget or mark as TBD)
9. Deliverables
10. Assumptions and Exclusions
11. Next Steps

Important: Do NOT invent any credentials, testimonials, or fake experience. Mark any information the user needs to add as [REQUIRED: description].`;

  return ollamaGenerate(prompt, PROPOSAL_SYSTEM);
}

// ── Project Cost Estimator ─────────────────────────────────────────────────────

const ESTIMATOR_SYSTEM = `You are a project estimation assistant for freelancers. 
Your role is to help identify project requirements, suggest task breakdowns, and explain assumptions.
You NEVER perform financial arithmetic — the application handles all calculations.
You explain assumptions clearly so the freelancer can verify them.
Be specific and realistic, not optimistic.`;

export async function analyzeProjectForEstimate(inputs) {
  const {
    projectCategory, projectDescription, complexity, additionalContext
  } = inputs;

  const prompt = `Analyze this freelance project and provide estimation insights:

Project Category: ${projectCategory}
Project Description: ${projectDescription}
Complexity Level: ${complexity}
Additional Context: ${additionalContext || 'None'}

Please provide:
1. **Task Breakdown**: List the main tasks and subtasks involved (as bullet points)
2. **Complexity Factors**: What makes this project simple or complex?
3. **Potential Scope Risks**: What could expand the scope unexpectedly?
4. **Key Assumptions**: What assumptions are you making about this project?
5. **Suggested Phases**: How would you break this into phases?

Note: Do NOT provide specific hour or cost estimates — the tool handles calculations separately.`;

  return ollamaGenerate(prompt, ESTIMATOR_SYSTEM);
}

// ── Client Communication ───────────────────────────────────────────────────────

const COMM_SYSTEM = `You are a professional business communication assistant for freelancers.
Write clear, natural, professional messages that sound human — not corporate or AI-generated.
Avoid excessive formality, filler phrases, and repetitive AI-style openers.
Be direct, warm, and appropriately professional based on the relationship and tone requested.
Never send messages automatically — always give the user something to review and edit.`;

export async function generateCommunication(inputs) {
  const {
    purpose, context, tone, relationship, originalMessage
  } = inputs;

  const prompt = `Write a professional ${purpose} message for a freelancer:

Purpose: ${purpose}
Context: ${context}
Preferred Tone: ${tone || 'Professional and friendly'}
Client Relationship: ${relationship || 'Professional client'}
${originalMessage ? `Original Message to Respond To:\n${originalMessage}` : ''}

Write a complete, ready-to-send message. Keep it concise but complete.
Avoid starting with "I hope this email finds you well" or similar clichés.
Avoid ending with excessive sign-off phrases.
Use natural language that sounds like a real professional, not a template.`;

  return ollamaGenerate(prompt, COMM_SYSTEM);
}

// ── Document Improvement ───────────────────────────────────────────────────────

export async function improveDocument(content, documentType) {
  const prompt = `Review and improve this ${documentType} for a freelancer. 
Fix clarity, tone, and professionalism. Preserve the original structure.
Mark any gaps that need user input with [REQUIRED: description].

Document:
${content}

Return the improved version only, maintaining the same Markdown format.`;

  return ollamaGenerate(prompt, `You are a professional business writing editor. Improve documents for clarity and professionalism.`);
}

// ── Fallback Templates ─────────────────────────────────────────────────────────
// These are used when AI is unavailable. They are clearly labeled as templates.

export const fallbackTemplates = {
  proposal: (inputs) => `## ${inputs.projectTitle || 'Project Proposal'}

**Prepared for:** ${inputs.clientName || '[Client Name]'}  
**Date:** ${new Date().toLocaleDateString()}

---

## Executive Summary

[REQUIRED: Write a 2-3 sentence summary of what you're proposing and the key benefit to the client]

## Understanding of Requirements

Based on your description: ${inputs.projectDescription || '[Project Description]'}

I understand that you need: [REQUIRED: Summarize the client's core need in your own words]

## Proposed Solution

[REQUIRED: Describe your approach to solving the client's problem]

## Scope of Work

The following services will be included:
${inputs.servicesIncluded ? inputs.servicesIncluded.split(',').map(s => `- ${s.trim()}`).join('\n') : '- [REQUIRED: List specific services]'}

## Project Milestones

1. **Phase 1 - Discovery & Planning**: [REQUIRED: Define deliverable and timeline]
2. **Phase 2 - Development**: [REQUIRED: Define deliverable and timeline]
3. **Phase 3 - Review & Revisions**: [REQUIRED: Define deliverable and timeline]
4. **Phase 4 - Final Delivery**: [REQUIRED: Define deliverable and timeline]

## Estimated Timeline

${inputs.deliveryTimeline || '[REQUIRED: Specify the total project duration]'}

## Budget

${inputs.estimatedBudget ? `Estimated project investment: **${inputs.estimatedBudget}**` : '[REQUIRED: Provide budget estimate]'}

Payment terms: [REQUIRED: Specify deposit amount and payment schedule]

## Deliverables

- [REQUIRED: List each specific deliverable the client will receive]

## Assumptions & Exclusions

**Included in scope:**
- [REQUIRED: List what is included]

**Not included:**
- [REQUIRED: List what is excluded to prevent scope creep]

## Next Steps

To proceed, please:
1. Review this proposal and provide feedback
2. Sign the project agreement
3. Submit the initial deposit

[REQUIRED: Add your contact information and preferred next-step action]

---
*⚠️ This is a template generated without AI assistance. Please review and complete all [REQUIRED] sections before sending.*`,

  communication: (inputs) => {
    const templates = {
      'Project inquiry response': `Thank you for reaching out about ${inputs.context || 'your project'}.\n\nI'd be happy to discuss how I can help. [REQUIRED: Add specific details about your availability and interest]\n\nCould we schedule a brief call to discuss the details?\n\n[REQUIRED: Add your preferred contact method and availability]`,
      'Payment reminder': `I hope you're doing well.\n\nI'm writing to follow up on invoice [REQUIRED: Invoice Number] for ${inputs.context || '[Project Name]'}, which was due on [REQUIRED: Due Date].\n\n[REQUIRED: Add payment total and payment instructions]\n\nPlease let me know if you have any questions or need anything from my end.\n\nThank you for your prompt attention to this.`,
      'Project update': `I wanted to give you a quick update on ${inputs.context || 'the project'}.\n\n**Progress this week:**\n- [REQUIRED: List completed tasks]\n\n**Coming up next:**\n- [REQUIRED: List upcoming tasks]\n\n**Any blockers:**\n- [REQUIRED: Note any issues or items needing client feedback]\n\nPlease let me know if you have any questions or feedback.`,
    };
    return (templates[inputs.purpose] || `[REQUIRED: Write your ${inputs.purpose || 'message'} here]\n\nContext: ${inputs.context || ''}\n\n*⚠️ This is a template generated without AI assistance.*`);
  },
};
