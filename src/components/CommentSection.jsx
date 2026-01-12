import React, { useState } from "react";

/**
 * CommentSection component - manage draft comments
 */
const CommentSection = ({ comments, onAdd, onUpdate, onRemove }) => {
  const [newComment, setNewComment] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  /**
   * Handle adding a new comment
   */
  const handleAdd = (event) => {
    event.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;
    
    onAdd(trimmed);
    setNewComment("");
    setIsAdding(false);
  };

  /**
   * Render existing comments list
   */
  const renderCommentList = () => {
    if (comments.length === 0) {
      return (
        <div className="muted">
          No comments yet. Add one below.
        </div>
      );
    }

    return (
      <div className="comment-list">
        {comments.map((comment, index) => (
          <div className="comment-row" key={comment.commentId}>
            <input
              type="text"
              value={comment.text}
              onChange={(e) =>
                onUpdate(index, { ...comment, text: e.target.value })
              }
              placeholder="Edit comment..."
            />
            <button 
              type="button" 
              className="danger"
              onClick={() => onRemove(index)}
              title="Remove comment"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Render add comment form
   */
  const renderAddForm = () => (
    <form className="comment-form" onSubmit={handleAdd}>
      <input
        type="text"
        placeholder={isAdding ? "Type your comment..." : "Add a comment..."}
        value={newComment}
        onChange={(e) => {
          setNewComment(e.target.value);
          setIsAdding(true);
        }}
        onBlur={() => {
          if (!newComment.trim()) setIsAdding(false);
        }}
      />
      <button 
        type="submit"
        disabled={!newComment.trim()}
        title="Add comment"
      >
        Add
      </button>
    </form>
  );

  return (
    <div className="comment-section">
      <div className="section-title">
        Comments ({comments.length})
      </div>
      
      {renderCommentList()}

      {renderAddForm()}
    </div>
  );
};

export default CommentSection;
