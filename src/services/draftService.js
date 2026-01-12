
// Drafts service: localStorage-backed with in-memory fallback for non-browser envs.

const STORAGE_KEY = "drafts";
let inMemoryDrafts = null;

const nowIso = () => new Date().toISOString();

/**
 * Generate a unique id (UUID when available)
 */
  export const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(16).slice(2) + Date.now().toString(16);
};

const seedDrafts = [
  {
    draftId: generateId(),
    draftName: "Spring Release",
    parent: generateId(),
    draftPath: "/drafts/spring-release",
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdBy: "system",
    committed: false,
    committedBy: null,
    committedDate: null,
    archived: false,
    backupPath: null,
    comments: [{ commentId: generateId(), text: "Initial draft created." }],
    parentMaster: false,
  },
];

// Keep drafts in localStorage when available, otherwise fall back to memory.
const readStorage = () => {
  // SSR / tests / non-browser
  if (typeof window === "undefined" || !window.localStorage) {
    return (inMemoryDrafts && inMemoryDrafts.slice()) || seedDrafts.slice();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDrafts));
    return seedDrafts.slice();
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedDrafts.slice();
  } catch {
    return seedDrafts.slice();
  }
};

const writeStorage = (drafts) => {
  // Defensive copy to prevent mutation by reference
  const copy = drafts.slice();

  if (typeof window === "undefined" || !window.localStorage) {
    inMemoryDrafts = copy;
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
};

/**
 * Return a fresh copy to avoid accidental mutation.
 */
  export const getDrafts = () => {
  const drafts = readStorage();
  return drafts.slice();
};

/**
 * Create a new draft
 * @param {{ draftName: string, parent?: string, releaseDate?: string }} param0
 */
  export const createDraft = ({ draftName, parent = "", releaseDate }) => {
  const drafts = readStorage();

  const safeName = (draftName || "").trim();
  if (!safeName) {
    throw new Error("draftName is required");
  }

  const slug = safeName.toLowerCase().replace(/\s+/g, "-");
  const newDraft = {
    draftId: generateId(),
    draftName: safeName,
    parent: (parent || "").trim(),
    draftPath: `/drafts/${slug}`,
    releaseDate: releaseDate || nowIso(),
    createdDate: nowIso(),
    createdBy: "current.user",
    committed: false,
    committedBy: null,
    committedDate: null,
    archived: false,
    backupPath: null,
    comments: [],
    parentMaster: false,
  };

  const next = [newDraft, ...drafts];
  writeStorage(next);
  return newDraft;
};

/**
 * Update a draft by id
 * @param {string} draftId
 * @param {Partial<{
 *  draftName: string,
 *  parent: string,
 *  draftPath: string,
 *  releaseDate: string,
 *  createdDate: string,
 *  createdBy: string,
 *  committed: boolean,
 *  committedBy: string|null,
 *  committedDate: string|null,
 *  archived: boolean,
 *  backupPath: string|null,
 *  comments: Array<{ commentId: string, text: string }>,
 *  parentMaster: boolean
 * }>} updates
 */
  export const updateDraft = (draftId, updates = {}) => {
  if (!draftId) {
    throw new Error("draftId is required");
  }
  const drafts = readStorage();

  let updated = null;
  const next = drafts.map((draft) => {
    if (draft.draftId !== draftId) return draft;

    // Handle committed fields coherently
    const committed =
      typeof updates.committed === "boolean" ? updates.committed : draft.committed;

    const committedDate = committed
      ? updates.committedDate || draft.committedDate || nowIso()
      : null;

    const committedBy = committed
      ? updates.committedBy || draft.committedBy || "current.user"
      : null;

    updated = {
      ...draft,
      ...updates,
      committed,
      committedDate,
      committedBy,
    };

    // Normalize draftPath if draftName changed (optional)
    if (updates.draftName && typeof updates.draftName === "string") {
      const slug = updates.draftName.trim().toLowerCase().replace(/\s+/g, "-");
      updated.draftPath = updates.draftPath || `/drafts/${slug}`;
    }

    return updated;
  });

  writeStorage(next);
  return updated; // can be null if not found
};

/**
 * Delete a draft by id. Returns remaining list (fresh copy).
 * @param {string} draftId
 */
  export const deleteDraft = (draftId) => {
  if (!draftId) {
    throw new Error("draftId is required");
  }
  const drafts = readStorage();
  const next = drafts.filter((draft) => draft.draftId !== draftId);
  writeStorage(next);
  return next.slice();
};

const draftServiceExport = {
  generateId,
  getDrafts,
  createDraft,
  updateDraft,
  deleteDraft,
};

export default draftServiceExport;
