import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { discussionsAPI } from '../../services/api';

function DiscussionDetail({ user }) {
  const { id } = useParams();
  const [discussion, setDiscussion] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  const fetchDiscussion = async () => {
    try {
      const response = await discussionsAPI.getById(id);
      setDiscussion(response.data.discussion);
    } catch (error) {
      setError('Failed to load discussion');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await discussionsAPI.addReply(id, { content: replyContent });
      setReplyContent('');
      setSuccess('Reply added successfully!');
      fetchDiscussion();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add reply');
    }
  };

  const handlePin = async () => {
    try {
      await discussionsAPI.pin(id);
      fetchDiscussion();
    } catch (error) {
      setError('Failed to pin/unpin discussion');
    }
  };

  const handleLock = async () => {
    try {
      await discussionsAPI.lock(id);
      fetchDiscussion();
    } catch (error) {
      setError('Failed to lock/unlock discussion');
    }
  };

  if (loading) {
    return <div className="loading">Loading discussion...</div>;
  }

  if (!discussion) {
    return <div className="container"><div className="error">Discussion not found</div></div>;
  }

  const isInstructor = user.role === 'instructor' || user.role === 'admin';

  return (
    <div className="container">
      <div className="card">
        <div className="discussion-header">
          <div>
            {discussion.isPinned && <span className="badge badge-warning">Pinned</span>}
            {discussion.isLocked && <span className="badge badge-danger">Locked</span>}
          </div>
          {isInstructor && (
            <div>
              <button onClick={handlePin} className="btn btn-secondary btn-sm">
                {discussion.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button onClick={handleLock} className="btn btn-secondary btn-sm" style={{ marginLeft: '10px' }}>
                {discussion.isLocked ? 'Unlock' : 'Lock'}
              </button>
            </div>
          )}
        </div>

        <h1>{discussion.title}</h1>
        <div className="discussion-meta" style={{ marginBottom: '20px' }}>
          <span>
            By {discussion.author.firstName} {discussion.author.lastName}
          </span>
          <span>{new Date(discussion.createdAt).toLocaleString()}</span>
        </div>

        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '6px', marginBottom: '30px' }}>
          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{discussion.content}</p>
        </div>

        <h2>Replies ({discussion.replies?.length || 0})</h2>

        {discussion.replies && discussion.replies.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            {discussion.replies.map(reply => (
              <div key={reply.id} className="reply-item">
                <div className="reply-header">
                  <span className="reply-author">
                    {reply.author.firstName} {reply.author.lastName}
                  </span>
                  <span className="reply-date">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="reply-content">{reply.content}</p>
              </div>
            ))}
          </div>
        )}

        {!discussion.isLocked ? (
          <form onSubmit={handleReplySubmit}>
            <div className="form-group">
              <label>Add a Reply</label>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows="4"
                required
                placeholder="Write your reply here..."
              />
            </div>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <button type="submit" className="btn btn-primary">
              Post Reply
            </button>
          </form>
        ) : (
          <div className="card" style={{ background: '#fff3cd', border: '1px solid #ffc107' }}>
            <p style={{ margin: 0 }}>This discussion has been locked. No more replies can be added.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscussionDetail;
