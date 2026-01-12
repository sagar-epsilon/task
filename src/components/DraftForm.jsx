import React, { useEffect, useState } from "react";
import CommentSection from "./CommentSection";

/**
 * Convert ISO timestamp to local datetime-local format
 */
const toLocalInput = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - offset);
  return local.toISOString().slice(0, 16);
};

/**
 * DraftForm component - creates or edits drafts with comments
 * Manages form state with centralized formData object
 */
const DraftForm = ({ initialDraft, onSubmit, onCancel, disabled }) => {
  const isEditing = Boolean(initialDraft);

  const [formData, setFormData] = useState({
    draftName: "",
    parent: "",
    releaseDate: "",
    committed: false,
    archived: false,
  });

  const [comments, setComments] = useState([]);
  const [errors, setErrors] = useState({});

  /**
   * Initialize form with draft data when editing
   */
  useEffect(() => {
    if (!initialDraft) {
      setFormData({
        draftName: "",
        parent: "",
        releaseDate: "",
        committed: false,
        archived: false,
      });
      setComments([]);
      setErrors({});
      return;
    }

    setFormData({
      draftName: initialDraft.draftName || "",
      parent: initialDraft.parent || "",
      releaseDate: toLocalInput(initialDraft.releaseDate),
      committed: Boolean(initialDraft.committed),
      archived: Boolean(initialDraft.archived),
    });
    setComments(initialDraft.comments || []);
    setErrors({});
  }, [initialDraft]);

  /**
   * Validate form data before submission
   */
  const validate = () => {
    const nextErrors = {};

    if (!formData.draftName.trim()) {
      nextErrors.draftName = "Draft name is required.";
    }

    if (!isEditing && !formData.parent.trim()) {
      nextErrors.parent = "Parent is required.";
    }

    if (!formData.releaseDate) {
      nextErrors.releaseDate = "Release date is required.";
    } else {
      const parsed = new Date(formData.releaseDate);
      if (Number.isNaN(parsed.getTime())) {
        nextErrors.releaseDate = "Release date must be a valid date.";
      } else if (parsed <= new Date()) {
        nextErrors.releaseDate = "Release date must be in the future.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  /**
   * Handle input field changes with error clearing
   */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      draftName: formData.draftName.trim(),
      parent: formData.parent.trim(),
      releaseDate: new Date(formData.releaseDate).toISOString(),
    };

    if (isEditing) {
      payload.committed = formData.committed;
      payload.archived = formData.archived;
      payload.comments = comments;
    }

    onSubmit(payload);
  };

  /**
   * Handle comment operations
   */
  const handleAddComment = (text) => {
    setComments([...comments, text]);
  };

  const handleUpdateComment = (index, text) => {
    const updated = [...comments];
    updated[index] = text;
    setComments(updated);
  };

  const handleRemoveComment = (index) => {
    setComments(comments.filter((_, i) => i !== index));
  };

  /**
   * Render form input fields
   */
  const renderFormFields = () => (
    <div className="form-row">
      <div className="form-group">
        <label htmlFor="draftName">Draft Name *</label>
        <input
          id="draftName"
          type="text"
          placeholder="e.g., Q1 2024 Release"
          value={formData.draftName}
          onChange={(e) => handleInputChange("draftName", e.target.value)}
          disabled={disabled}
        />
        {errors.draftName && <span className="error">{errors.draftName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="parent">Parent {!isEditing && "*"}</label>
        <input
          id="parent"
          type="text"
          placeholder="e.g., Release/v2.0"
          value={formData.parent}
          onChange={(e) => handleInputChange("parent", e.target.value)}
          disabled={disabled || isEditing}
        />
        {errors.parent && <span className="error">{errors.parent}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="releaseDate">Release Date *</label>
        <input
          id="releaseDate"
          type="datetime-local"
          value={formData.releaseDate}
          onChange={(e) => handleInputChange("releaseDate", e.target.value)}
          disabled={disabled}
        />
        {errors.releaseDate && (
          <span className="error">{errors.releaseDate}</span>
        )}
      </div>
    </div>
  );

  /**
   * Render status toggle section for edit mode
   */
  const renderStatusSection = () => {
    if (!isEditing) return null;

    return (
      <div style={{ display: "flex", gap: "2rem" }}>
        <label className="toggle">
          <input
            type="checkbox"
            checked={formData.committed}
            onChange={(e) =>
              handleInputChange("committed", e.target.checked)
            }
            disabled={disabled}
          />
          Mark as Committed
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={formData.archived}
            onChange={(e) =>
              handleInputChange("archived", e.target.checked)
            }
            disabled={disabled}
          />
          Mark as Archived
        </label>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {renderFormFields()}
      {renderStatusSection()}

      {isEditing && (
        <CommentSection
          comments={comments}
          onAdd={handleAddComment}
          onUpdate={handleUpdateComment}
          onRemove={handleRemoveComment}
        />
      )}

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
        <button type="submit" disabled={disabled}>
          {isEditing ? "Save Changes" : "Create Draft"}
        </button>
        {isEditing && (
          <button 
            type="button" 
            className="secondary" 
            onClick={onCancel} 
            disabled={disabled}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default DraftForm;
