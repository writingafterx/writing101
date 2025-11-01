import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { assignmentsAPI } from '../../services/api';

function AssignmentDetail({ user }) {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState({ content: '', attachmentUrl: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const response = await assignmentsAPI.getById(id);
      setAssignment(response.data.assignment);

      // Check if user has already submitted
      const userSubmission = response.data.assignment.submissions?.find(
        s => s.studentId === user.id
      );
      if (userSubmission) {
        setSubmission({
          content: userSubmission.content,
          attachmentUrl: userSubmission.attachmentUrl || ''
        });
      }
    } catch (error) {
      setError('Failed to load assignment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await assignmentsAPI.submit(id, submission);
      setSuccess('Assignment submitted successfully!');
      fetchAssignment();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit assignment');
    }
  };

  const handleGrade = async (submissionId, grade, feedback) => {
    try {
      await assignmentsAPI.grade(submissionId, { grade, feedback });
      setSuccess('Submission graded successfully!');
      fetchAssignment();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to grade submission');
    }
  };

  if (loading) {
    return <div className="loading">Loading assignment...</div>;
  }

  if (error && !assignment) {
    return <div className="container"><div className="error">{error}</div></div>;
  }

  const userSubmission = assignment.submissions?.find(s => s.studentId === user.id);
  const isInstructor = user.role === 'instructor' || user.role === 'admin';
  const canSubmit = user.role === 'student' && !userSubmission?.status?.includes('graded');

  return (
    <div className="container">
      <div className="card">
        <h1>{assignment.title}</h1>
        <div style={{ marginBottom: '20px' }}>
          <span className="badge badge-info">
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </span>
          <span className="badge badge-success" style={{ marginLeft: '10px' }}>
            Max Points: {assignment.maxPoints}
          </span>
        </div>

        <h3>Description</h3>
        <p>{assignment.description}</p>

        {assignment.instructions && (
          <>
            <h3>Instructions</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{assignment.instructions}</pre>
          </>
        )}
      </div>

      {user.role === 'student' && (
        <div className="card">
          <h2>Your Submission</h2>
          {userSubmission ? (
            <div>
              <p><strong>Submitted:</strong> {new Date(userSubmission.submittedAt).toLocaleString()}</p>
              <p><strong>Status:</strong> <span className={`badge badge-${userSubmission.status === 'graded' ? 'success' : 'warning'}`}>
                {userSubmission.status}
              </span></p>
              {userSubmission.grade !== null && (
                <>
                  <p><strong>Grade:</strong> {userSubmission.grade} / {assignment.maxPoints}</p>
                  {userSubmission.feedback && (
                    <>
                      <h4>Feedback</h4>
                      <p>{userSubmission.feedback}</p>
                    </>
                  )}
                </>
              )}
              <h4>Your Response</h4>
              <p>{userSubmission.content}</p>
              {userSubmission.attachmentUrl && (
                <p><strong>Attachment:</strong> <a href={userSubmission.attachmentUrl} target="_blank" rel="noopener noreferrer">View Attachment</a></p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Response *</label>
                <textarea
                  value={submission.content}
                  onChange={(e) => setSubmission({ ...submission, content: e.target.value })}
                  required
                  rows="8"
                />
              </div>
              <div className="form-group">
                <label>Attachment URL (optional)</label>
                <input
                  type="url"
                  value={submission.attachmentUrl}
                  onChange={(e) => setSubmission({ ...submission, attachmentUrl: e.target.value })}
                />
              </div>
              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}
              <button type="submit" className="btn btn-success">
                Submit Assignment
              </button>
            </form>
          )}
        </div>
      )}

      {isInstructor && (
        <div className="card">
          <h2>Student Submissions ({assignment.submissions?.length || 0})</h2>
          {assignment.submissions && assignment.submissions.length > 0 ? (
            assignment.submissions.map(sub => (
              <div key={sub.id} className="card" style={{ marginBottom: '15px', background: '#f8f9fa' }}>
                <h4>{sub.student.firstName} {sub.student.lastName}</h4>
                <p><strong>Submitted:</strong> {new Date(sub.submittedAt).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className={`badge badge-${sub.status === 'graded' ? 'success' : 'warning'}`}>{sub.status}</span></p>
                <p><strong>Response:</strong></p>
                <p>{sub.content}</p>
                {sub.attachmentUrl && (
                  <p><strong>Attachment:</strong> <a href={sub.attachmentUrl} target="_blank" rel="noopener noreferrer">View</a></p>
                )}

                <GradeForm
                  submission={sub}
                  maxPoints={assignment.maxPoints}
                  onGrade={handleGrade}
                />
              </div>
            ))
          ) : (
            <p>No submissions yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function GradeForm({ submission, maxPoints, onGrade }) {
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [editing, setEditing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGrade(submission.id, parseFloat(grade), feedback);
    setEditing(false);
  };

  if (submission.status === 'graded' && !editing) {
    return (
      <div>
        <p><strong>Grade:</strong> {submission.grade} / {maxPoints}</p>
        {submission.feedback && <p><strong>Feedback:</strong> {submission.feedback}</p>}
        <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm">
          Edit Grade
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
      <div className="form-row">
        <div className="form-group">
          <label>Grade (out of {maxPoints})</label>
          <input
            type="number"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            min="0"
            max={maxPoints}
            step="0.5"
            required
          />
        </div>
      </div>
      <div className="form-group">
        <label>Feedback</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows="3"
        />
      </div>
      <button type="submit" className="btn btn-success btn-sm">
        Submit Grade
      </button>
      {editing && (
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="btn btn-secondary btn-sm"
          style={{ marginLeft: '10px' }}
        >
          Cancel
        </button>
      )}
    </form>
  );
}

export default AssignmentDetail;
