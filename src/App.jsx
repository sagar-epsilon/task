
import React, { useEffect, useState } from "react";
import DraftForm from "./components/DraftForm.jsx";
import DraftList from "./components/DraftList.jsx";
import {
  getDrafts,
  createDraft,
  updateDraft,
  deleteDraft,
} from "./services/draftService.js";


/**
 * Safely sort drafts by releaseDate ascending.
 * Invalid or missing dates are pushed to the end.
 */
const sortDrafts = (drafts) =>
  drafts
    .slice()
    .sort((a, b) => {
      const ta = a?.releaseDate ? new Date(a.releaseDate).getTime() : NaN;
      const tb = b?.releaseDate ? new Date(b.releaseDate).getTime() : NaN;

      const aValid = Number.isFinite(ta);
      const bValid = Number.isFinite(tb);

      if (aValid && bValid) return ta - tb;
      if (aValid && !bValid) return -1;
      if (!aValid && bValid) return 1;
      return 0;
    });

const App = () => {
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshDrafts = async () => {
    try {
      setLoading(true);
      const data = await getDrafts(); // ok if sync; await handles async
      setDrafts(sortDrafts(Array.isArray(data) ? data : []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    refreshDrafts();
  }, []);

  const handleCreate = async (payload) => {
    await createDraft({
      draftName: payload.draftName?.trim() || "",
      parent: payload.parent ?? null,
      releaseDate: payload.releaseDate || null,
      comments: payload.comments ?? "",
      committed: Boolean(payload.committed),
      archived: Boolean(payload.archived),
    });
    setSelectedDraft(null); // just in case
    await refreshDrafts();
  };

  const handleUpdate = async (payload) => {
    if (!selectedDraft) return;

    await updateDraft(selectedDraft.draftId, {
      draftName: payload.draftName?.trim() ?? selectedDraft.draftName,
      releaseDate: payload.releaseDate ?? selectedDraft.releaseDate,
      comments: payload.comments ?? selectedDraft.comments ?? "",
      committed:
        typeof payload.committed === "boolean"
          ? payload.committed
          : selectedDraft.committed,
      archived:
        typeof payload.archived === "boolean"
          ? payload.archived
          : selectedDraft.archived,
    });

    setSelectedDraft(null);
    await refreshDrafts();
  };

  const handleDelete = async (draft) => {
    const confirmed = window.confirm(
      `Delete draft "${draft.draftName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    await deleteDraft(draft.draftId);

    if (selectedDraft?.draftId === draft.draftId) {
      setSelectedDraft(null);
    }
    await refreshDrafts();
  };

  const handleToggleCommit = async (draft) => {
    await updateDraft(draft.draftId, { committed: !draft.committed });
    await refreshDrafts();
  };

  const handleToggleArchive = async (draft) => {
    await updateDraft(draft.draftId, { archived: !draft.archived });
    await refreshDrafts();
  };

  return (
    <div className="App">
      <header>
        <h1>Draft Manager</h1>
        <p className="subtitle">
          Create, update, and track draft releases with commits and comments.
        </p>
      </header>

      <DraftForm
        initialDraft={selectedDraft}
        onSubmit={selectedDraft ? handleUpdate : handleCreate}
        onCancel={() => setSelectedDraft(null)}
        disabled={loading}
      />

      <section className="card">
        <div className="card-title">
          Drafts {loading ? <span aria-live="polite" className="loading"></span> : null}
        </div>
        <DraftList
          drafts={drafts}
          onEdit={(draft) => setSelectedDraft(draft)}
          onDelete={handleDelete}
          onToggleCommit={handleToggleCommit}
          onToggleArchive={handleToggleArchive}
        />
      </section>
    </div>
  );
};

export default App;
