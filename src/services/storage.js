/**
 * HustlePilot AI — Storage Service
 * Uses localStorage for persistence. All data stays on the user's device.
 */

const KEYS = {
  PROPOSALS: 'hustlepilot_proposals',
  INVOICES: 'hustlepilot_invoices',
  COMMUNICATIONS: 'hustlepilot_communications',
  ESTIMATES: 'hustlepilot_estimates',
  SETTINGS: 'hustlepilot_settings',
};

function safeGet(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Storage error:', e);
    return false;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Proposals ─────────────────────────────────────────────────────────────────

export const proposalStorage = {
  getAll: () => safeGet(KEYS.PROPOSALS),
  
  save: (proposal) => {
    const all = safeGet(KEYS.PROPOSALS);
    const existing = all.findIndex(p => p.id === proposal.id);
    const record = {
      ...proposal,
      id: proposal.id || generateId(),
      updatedAt: new Date().toISOString(),
      createdAt: proposal.createdAt || new Date().toISOString(),
    };
    if (existing >= 0) {
      all[existing] = record;
    } else {
      all.unshift(record);
    }
    safeSet(KEYS.PROPOSALS, all);
    return record;
  },

  delete: (id) => {
    const all = safeGet(KEYS.PROPOSALS).filter(p => p.id !== id);
    safeSet(KEYS.PROPOSALS, all);
  },

  duplicate: (id) => {
    const all = safeGet(KEYS.PROPOSALS);
    const found = all.find(p => p.id === id);
    if (!found) return null;
    const copy = {
      ...found,
      id: generateId(),
      title: `${found.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.unshift(copy);
    safeSet(KEYS.PROPOSALS, all);
    return copy;
  },
};

// ── Invoices ───────────────────────────────────────────────────────────────────

export const invoiceStorage = {
  getAll: () => safeGet(KEYS.INVOICES),

  save: (invoice) => {
    const all = safeGet(KEYS.INVOICES);
    const existing = all.findIndex(i => i.id === invoice.id);
    const record = {
      ...invoice,
      id: invoice.id || generateId(),
      updatedAt: new Date().toISOString(),
      createdAt: invoice.createdAt || new Date().toISOString(),
    };
    if (existing >= 0) {
      all[existing] = record;
    } else {
      all.unshift(record);
    }
    safeSet(KEYS.INVOICES, all);
    return record;
  },

  delete: (id) => {
    const all = safeGet(KEYS.INVOICES).filter(i => i.id !== id);
    safeSet(KEYS.INVOICES, all);
  },

  duplicate: (id) => {
    const all = safeGet(KEYS.INVOICES);
    const found = all.find(i => i.id === id);
    if (!found) return null;
    const newNum = `INV-${Date.now().toString().slice(-6)}`;
    const copy = {
      ...found,
      id: generateId(),
      invoiceNumber: newNum,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.unshift(copy);
    safeSet(KEYS.INVOICES, all);
    return copy;
  },

  updateStatus: (id, status) => {
    const all = safeGet(KEYS.INVOICES);
    const idx = all.findIndex(i => i.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], status, updatedAt: new Date().toISOString() };
      safeSet(KEYS.INVOICES, all);
      return all[idx];
    }
    return null;
  },
};

// ── Communications ─────────────────────────────────────────────────────────────

export const communicationStorage = {
  getAll: () => safeGet(KEYS.COMMUNICATIONS),

  save: (comm) => {
    const all = safeGet(KEYS.COMMUNICATIONS);
    const existing = all.findIndex(c => c.id === comm.id);
    const record = {
      ...comm,
      id: comm.id || generateId(),
      updatedAt: new Date().toISOString(),
      createdAt: comm.createdAt || new Date().toISOString(),
    };
    if (existing >= 0) {
      all[existing] = record;
    } else {
      all.unshift(record);
    }
    safeSet(KEYS.COMMUNICATIONS, all);
    return record;
  },

  delete: (id) => {
    const all = safeGet(KEYS.COMMUNICATIONS).filter(c => c.id !== id);
    safeSet(KEYS.COMMUNICATIONS, all);
  },
};

// ── Estimates ──────────────────────────────────────────────────────────────────

export const estimateStorage = {
  getAll: () => safeGet(KEYS.ESTIMATES),

  save: (estimate) => {
    const all = safeGet(KEYS.ESTIMATES);
    const existing = all.findIndex(e => e.id === estimate.id);
    const record = {
      ...estimate,
      id: estimate.id || generateId(),
      updatedAt: new Date().toISOString(),
      createdAt: estimate.createdAt || new Date().toISOString(),
    };
    if (existing >= 0) {
      all[existing] = record;
    } else {
      all.unshift(record);
    }
    safeSet(KEYS.ESTIMATES, all);
    return record;
  },

  delete: (id) => {
    const all = safeGet(KEYS.ESTIMATES).filter(e => e.id !== id);
    safeSet(KEYS.ESTIMATES, all);
  },
};

// ── Settings ───────────────────────────────────────────────────────────────────

export const settingsStorage = {
  get: () => safeGet(KEYS.SETTINGS, {
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3.2',
    aiEnabled: true,
    businessName: '',
    businessEmail: '',
    currency: 'USD',
    theme: 'dark',
  }),

  save: (settings) => {
    const current = safeGet(KEYS.SETTINGS, {});
    safeSet(KEYS.SETTINGS, { ...current, ...settings });
  },
};

// ── Export / Backup ────────────────────────────────────────────────────────────

export const backupStorage = {
  exportAll: () => {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        proposals: safeGet(KEYS.PROPOSALS),
        invoices: safeGet(KEYS.INVOICES),
        communications: safeGet(KEYS.COMMUNICATIONS),
        estimates: safeGet(KEYS.ESTIMATES),
        settings: safeGet(KEYS.SETTINGS, {}),
      },
    };
  },

  importAll: (backup) => {
    if (!backup?.data) throw new Error('Invalid backup format');
    const { proposals, invoices, communications, estimates, settings } = backup.data;
    if (proposals) safeSet(KEYS.PROPOSALS, proposals);
    if (invoices) safeSet(KEYS.INVOICES, invoices);
    if (communications) safeSet(KEYS.COMMUNICATIONS, communications);
    if (estimates) safeSet(KEYS.ESTIMATES, estimates);
    if (settings) safeSet(KEYS.SETTINGS, settings);
  },

  clearAll: () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },
};

export { generateId };
