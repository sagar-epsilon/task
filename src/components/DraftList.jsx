import React from "react";

/**
 * Format ISO date string to readable format
 */
const formatDate = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

/**
 * Status badge component with professional styling
 */
const DraftStatusBadge = ({ committed, archived }) => {
  if (archived) {
    return (
      <span className="status-badge status-archived">
        📦 Archived
      </span>
    );
  }
  return committed ? 
    <span className="status-badge status-committed">
      ✓ Committed
    </span> :
    <span className="status-badge status-pending">
      ⏳ Pending
    </span>;
};

/**
 * DraftList component - displays drafts in a table with actions
 */
const DraftList = ({
  drafts,
  onEdit,
  onDelete,
  onToggleCommit,
  onToggleArchive
}) => {
  // Empty state
  if (drafts.length === 0) {
    return (
      <div className="empty">
        No drafts yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th style={{ width: "25%" }}>Draft Name</th>
            <th style={{ width: "20%" }}>Parent</th>
            <th style={{ width: "25%" }}>Release Date</th>
            <th style={{ width: "15%" }}>Status</th>
            <th style={{ width: "15%" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((draft) => (
            <tr key={draft.draftId}>
              <td>
                <strong>{draft.draftName}</strong>
              </td>
              <td className="mono">{draft.parent || "-"}</td>
              <td>
                <strong style={{ color: "#6b7280", fontWeight: 500 }}>
                  {formatDate(draft.releaseDate)}
                </strong>
              </td>
              <td>
                <DraftStatusBadge 
                  committed={draft.committed} 
                  archived={draft.archived}
                />
              </td>
              <td className="action-cell">
                <button 
                  type="button" 
                  onClick={() => onEdit(draft)}
                  title="Edit draft details and comments"
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => onToggleCommit(draft)}
                  title={draft.committed ? "Mark as uncommitted" : "Mark as committed"}
                >
                  {draft.committed ? "Uncommit" : "Commit"}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => onToggleArchive(draft)}
                  title={draft.archived ? "Restore archived draft" : "Archive draft"}
                >
                  {draft.archived ? "Unarchive" : "Archive"}
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => onDelete(draft)}
                  title="Delete draft permanently"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DraftList;
